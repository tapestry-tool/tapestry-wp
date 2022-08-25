<?php

    require_once dirname(__FILE__).'/../utilities/class.tapestry-errors.php';
    require_once dirname(__FILE__).'/../utilities/class.tapestry-helpers.php';

    if (defined('LOAD_KALTURA') && LOAD_KALTURA) {
        require_once plugin_dir_path(dirname(__FILE__)).'vendor/autoload.php';
    } else {
        return false;
    }

    use Kaltura\Client\ApiException;
    use Kaltura\Client\Client;
    use Kaltura\Client\Configuration;
    use Kaltura\Client\Enum\MediaType;
    use Kaltura\Client\Enum\SessionType;
    use Kaltura\Client\Type\Category;
    use Kaltura\Client\Type\CategoryFilter;
    use Kaltura\Client\Type\MediaEntry;
    use Kaltura\Client\Type\UploadedFileTokenResource;
    use Kaltura\Client\Type\UploadToken;

    class KalturaApi
    {
        /**
         * Creates Kaltura Client and starts Kaltura Session.
         *
         * @return object $response KalturaClient
         */
        public function getKClient($type = SessionType::USER)
        {
            $user = wp_get_current_user()->ID;

            $kaltura_admin_secret = TapestryHelpers::getKalturaAdminSecret();
            $kaltura_partner_id = TapestryHelpers::getKalturaPartnerId();
            $kaltura_service_url = TapestryHelpers::getKalturaServiceUrl();

            $kconf = new Configuration($kaltura_partner_id);
            $kconf->setServiceUrl($kaltura_service_url);
            $kclient = new Client($kconf);
            try {
                $ksession = $kclient->session->start($kaltura_admin_secret, $user, $type, $kaltura_partner_id);
            } catch (Exception $e) {
                error_log('Kaltura Client Error: '.$e);
            }

            if (!isset($ksession)) {
                throw new TapestryError('FAILED_TO_ESTABLISH_KALTURA_SESSION');
            }

            $kclient->setKs($ksession);

            return $kclient;
        }

        /**
         * Upload a video file to Kaltura.
         *
         * @param object $filepath     String
         * @param object $categoryName String
         *
         * @return object $response HTTP response
         */
        public function uploadVideo($file, $categoryName)
        {
            $filepath = $file->file_path;
            $filename = $file->name;

            if (!file_exists($filepath)) {
                throw new TapestryError('UPLOAD_FILE_NOT_FOUND');
            }

            $kclient = $this->getKClient();

            /*
            We organize uploaded videos into Kaltura Categories. The ancestor category of all videos is 'Tapestry'.
            */
            $parentCategoryName = 'Tapestry';
            $filter = new CategoryFilter();
            $filter->fullNameStartsWith = $parentCategoryName;

            $categories = $kclient->category->listAction($filter, null);
            $parentCategoryIndex = array_search($parentCategoryName, array_column($categories->objects, 'fullName'));
            $parentCategory = (false !== $parentCategoryIndex ? $categories->objects[$parentCategoryIndex] : null);

            // Create the 'Tapestry' category if it doesn't exist
            if (null === $parentCategory) {
                $createdParentCategory = new Category();
                $createdParentCategory->name = $parentCategoryName;
                $kAdminClient = $this->getKClient(SessionType::ADMIN);
                $parentCategory = $kAdminClient->category->add($createdParentCategory);
            }

            // Find or create the category with the desired name under 'Tapestry'
            $videoCategoryIndex = array_search($categoryName, array_column($categories->objects, 'name'));
            $videoCategory = null;

            if ($videoCategoryIndex) {
                $videoCategory = (false !== $videoCategoryIndex ? $categories->objects[$videoCategoryIndex] : null);
            } else {
                $category = new Category();
                $category->parentId = $parentCategory->id;
                $category->name = $categoryName;
                $kAdminClient = $this->getKClient(SessionType::ADMIN);
                $videoCategory = $kAdminClient->category->add($category);
            }

            // Uploading Video Steps:
            // 1. Create upload token
            $uploadToken = new UploadToken();
            $token = $kclient->uploadToken->add($uploadToken);

            // 2. Upload the file data
            $resume = false;
            $finalChunk = true;
            $resumeAt = -1;
            $upload = $kclient->uploadToken->upload($token->id, $filepath, $resume, $finalChunk, $resumeAt);

            // 3. Create Kaltura Media Entry and add the above categories
            $mediaEntry = new MediaEntry();
            $mediaEntry->name = $filename;
            $mediaEntry->mediaType = MediaType::VIDEO;
            $mediaEntry->categoriesIds = $videoCategory->id.','.$parentCategory->id;
            $entry = $kclient->media->add($mediaEntry);

            // 4. Attach the uploaded video to the Media Entry
            $resource = new UploadedFileTokenResource();
            $resource->token = $token->id;
            $response = $kclient->media->addContent($entry->id, $resource);
            $status = $response->status;

            return $response;
        }

        public function getVideoUploadStatus($entryId)
        {
            $kclient = $this->getKClient();
            $response = $kclient->media->get($entryId);

            return $response;
        }

        /**
         * Finds the Kaltura video with the given ID if it exists.
         * Returns null if not found.
         */
        public function getVideo($entryId)
        {
            $client = $this->getKClient();

            try {
                $result = $client->media->get($entryId, -1);

                return $result;
            } catch (ApiException $e) {
                return null;
            }
        }
    }
