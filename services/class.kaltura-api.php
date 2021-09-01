<?php
    (defined("LOAD_KALTURA") && LOAD_KALTURA != false) or exit();
    require_once plugin_dir_path(dirname(__FILE__)) . 'vendor/autoload.php';

    use Kaltura\Client\Client;
    use Kaltura\Client\Configuration;
    use Kaltura\Client\Enum\FlavorAssetStatus;
    use Kaltura\Client\Enum\MediaType;
    use Kaltura\Client\Enum\SessionType;
    use Kaltura\Client\Type\Category;
    use Kaltura\Client\Type\CategoryFilter;
    use Kaltura\Client\Type\MediaEntry;
    use Kaltura\Client\Type\UploadedFileTokenResource;
    use Kaltura\Client\Type\UploadToken;
    use Kaltura\Client\ApiException;

    use Spatie\Async\Pool;

    class KalturaApi
    {
        private $thread_pool;

        /**
         * Creates Kaltura Client and starts Kaltura Session.
         *
         * @return object $response KalturaClient
         */
        public function getKClient($type = SessionType::USER)
        {
            $this->thread_pool = POOL::create();

            $user = wp_get_current_user()->ID;
            $kconf = new Configuration(KALTURA_PARTNER_ID);
            $kconf->setServiceUrl(KALTURA_SERVICE_URL);
            $kclient = new Client($kconf);
            try {
                $ksession = $kclient->session->start(KALTURA_ADMIN_SECRET, $user, $type, KALTURA_PARTNER_ID);
            } catch (Exception $e) {
                error_log("Kaltura Client Error: " . $e);
            }

            if (!isset($ksession)) {
                throw new TapestryError("Unable to establish Kaltura session.");
            }

            $kclient->setKs($ksession);
            return $kclient;
        }

        /**
         * Upload a video file to Kaltura.
         *
         * @param object $filepath String
         *
         * @return object $response HTTP response
         */
        public function uploadKalturaVideo($file, $categoryName)
        {
            $filepath = $file->file_path;
            $filename = $file->name;

            $kclient = $this->getKClient();

            // Add video category
            $parentCategoryName = 'Tapestry';
            $filter = new CategoryFilter();
            $filter->fullNameStartsWith = $parentCategoryName;

            $categories = $kclient->category->listAction($filter, null);
            $parentCategoryIndex = array_search($parentCategoryName, array_column($categories->objects, 'fullName'));
            $parentCategory = ($parentCategoryIndex !== false ? $categories->objects[$parentCategoryIndex] : null);

            $videoCategoryIndex = array_search($categoryName, array_column($categories->objects, 'name'));
            $videoCategory = null;

            if ($videoCategoryIndex) {
                $videoCategory = ($videoCategoryIndex !== false ? $categories->objects[$videoCategoryIndex] : null);
            } else {
                $category = new Category();
                $category->parentId = $parentCategory->id;
                $category->name = $categoryName;
                $kAdminClient = $this->getKClient(SessionType::ADMIN);
                $videoCategory = $kAdminClient->category->add($category);
            }

            /**
             * Uploading Video Steps:
             * 1. Create upload token
             * 2. Upload the file data
             * 3. Create Kaltura Media Entry
             * 4. Attach the video
             */
            $uploadToken = new UploadToken();
            $token = $kclient->uploadToken->add($uploadToken);

            $this->thread_pool[] = async(function () use ($kclient,$token,$filepath) {
                $resume = false;
                $finalChunk = true;
                $resumeAt = -1;
                $upload = $kclient->uploadToken->upload($token->id, $filepath, $resume, $finalChunk, $resumeAt);
            })->then(function ($output) {});
            
            $mediaEntry = new MediaEntry();
            $mediaEntry->name = $filename;
            $mediaEntry->mediaType = MediaType::VIDEO;
            $mediaEntry->categoriesIds = $videoCategory->id.','.$parentCategory->id;
            $entry = $kclient->media->add($mediaEntry);

            $resource = new UploadedFileTokenResource();
            $resource->token = $token->id;
            $result = $kclient->media->addContent($entry->id, $resource);
            $status = $result->status;

            while ($status != FlavorAssetStatus::READY && $status != FlavorAssetStatus::ERROR) {
                sleep(5);
                $result = $kclient->media->get($entry->id);
                $status = $result->status;
            }
            return $result;
        }

        public function getVideo($entryId)
        {
            $client = $this->getKClient();

            try {
                $result = $client->media->get($entryId, -1);
                return $result;
            }
            catch(ApiException $e) {
                error_log("Kaltura Client Error: " . $e);
                return null;
            }
        }
    }