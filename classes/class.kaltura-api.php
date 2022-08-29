<?php

    require_once dirname(__FILE__).'/../utilities/class.tapestry-errors.php';

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
            $kconf = new Configuration(KALTURA_PARTNER_ID);
            $kconf->setServiceUrl(KALTURA_SERVICE_URL);
            $kclient = new Client($kconf);
            try {
                $ksession = $kclient->session->start(KALTURA_ADMIN_SECRET, $user, $type, KALTURA_PARTNER_ID);
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
            Under 'Tapestry', videos are categorized by the URL of the site they were uploaded from.
            Under 'Tapestry>{site URL}', videos are categorized either by date or by Tapestry.
            */
            $parentCategoryName = 'Tapestry';
            $filter = new CategoryFilter();
            $filter->fullNameStartsWith = $parentCategoryName;

            $categories = $kclient->category->listAction($filter, null);

            // Ensure the chain of categories 'Tapestry>{site URL}>{category name}' exists to place this video under
            $kAdminClient = null;
            $parentCategory = $this->_getOrCreateCategory($parentCategoryName, null, $categories, $kAdminClient);

            $siteUrl = get_bloginfo('url');
            $siteCategory = $this->_getOrCreateCategory($siteUrl, $parentCategory, $categories, $kAdminClient);

            $videoCategory = $this->_getOrCreateCategory($categoryName, $siteCategory, $categories, $kAdminClient);

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
            $mediaEntry->categoriesIds = $parentCategory->id.','.$siteCategory->id.','.$videoCategory->id;
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

        private function _getOrCreateCategory($categoryName, $parentCategory, $categories, &$kAdminClient)
        {
            $categoryFullName = $parentCategory ? $parentCategory->fullName.'>'.$categoryName : $categoryName;
            $categoryIndex = array_search($categoryFullName, array_column($categories->objects, 'fullName'));
            $category = (false !== $categoryIndex ? $categories->objects[$categoryIndex] : null);

            if (null === $category) {
                $createdCategory = new Category();

                if ($parentCategory) {
                    $createdCategory->parentId = $parentCategory->id;
                }
                $createdCategory->name = $categoryName;
                $kAdminClient = $kAdminClient ?? $this->getKClient(SessionType::ADMIN);  // Reuse Kaltura session if possible
                $category = $kAdminClient->category->add($createdCategory);
            }

            return $category;
        }
    }
