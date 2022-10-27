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

            $kaltura_admin_secret = self::getKalturaAdminSecret();
            $kaltura_partner_id = self::getKalturaPartnerId();
            $kaltura_service_url = self::getKalturaServiceUrl();

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
                $result = $client->media->get($entryId);

                return $result;
            } catch (ApiException $e) {
                return null;
            }
        }

        /* *************************************************
        /*                  PRIVATE FUNCTIONS
        /* ************************************************* */

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

        /* *************************************************
        /*                  STATIC FUNCTIONS
        /* ************************************************* */

        /**
         * Getters for Kaltura configuration variables.
         * Return null if LOAD_KALTURA is false.
         */
        public static function getKalturaAdminSecret()
        {
            return KALTURA_OVERRIDE_CONFIG ? get_option('kaltura_admin_secret') : (KALTURA_DEFAULT_CONFIG ? KALTURA_ADMIN_SECRET : null);
        }

        public static function getKalturaPartnerId()
        {
            return KALTURA_OVERRIDE_CONFIG ? get_option('kaltura_partner_id') : (KALTURA_DEFAULT_CONFIG ? KALTURA_PARTNER_ID : null);
        }

        public static function getKalturaServiceUrl()
        {
            return KALTURA_OVERRIDE_CONFIG ? get_option('kaltura_service_url') : (KALTURA_DEFAULT_CONFIG ? KALTURA_SERVICE_URL : null);
        }

        public static function getKalturaUniqueConfig()
        {
            return KALTURA_OVERRIDE_CONFIG ? get_option('kaltura_unique_config') : (KALTURA_DEFAULT_CONFIG ? KALTURA_UNIQUE_CONFIG : null);
        }

        /**
         * Return the name of the Kaltura category a video should be sorted under.
         */
        public static function getKalturaCategoryName($tapestry)
        {
            if ('tapestry_name' === get_option('kaltura_category_structure')) {
                return $tapestry->getSettings()->title;
            } else {
                // Categorize by date by default
                return date('Y/m/d');
            }
        }

        /**
         * Update video node data and delete the local video after it has been uploaded to Kaltura.
         *
         * @param TapestryNode $node             Video node to update
         * @param MediaEntry   $kalturaData      Response from Kaltura API
         * @param bool         $useKalturaPlayer If true, also switch the video to use Kaltura player
         * @param string       $videoPath        path to the video file
         */
        public static function saveAndDeleteLocalVideo($node, $kalturaData, $useKalturaPlayer, $videoPath)
        {
            $node->set((object) ['mediaFormat' => 'kaltura']);
            $typeData = $node->getTypeData();
            $typeData->mediaURL = $kalturaData->dataUrl.'?.mp4';
            $typeData->kalturaId = $kalturaData->id;

            // Save Kaltura account info so we can still show Kaltura player, even if LOAD_KALTURA is currently false
            if (!isset($typeData->kalturaData)) {
                $typeData->kalturaData = [];
            }
            $typeData->kalturaData['partnerId'] = self::getKalturaPartnerId();
            $typeData->kalturaData['serviceUrl'] = self::getKalturaServiceUrl();
            $typeData->kalturaData['uniqueConfiguration'] = self::getKalturaUniqueConfig();

            $typeData->videoPlayer = $useKalturaPlayer ? 'kaltura' : 'regular';

            $node->save();

            wp_delete_file($videoPath);
        }

        /**
         * Checks if the user has defined a maximum video upload size for Kaltura that is smaller than the WordPress max upload size,
         * and if so, whether a video is too large to be uploaded.
         *
         * Assumes that the input video can be uploaded to Kaltura (check before calling).
         *
         * @param TapestryNode $node
         *
         * @return bool True if the user has defined no maximum video upload size, or it is not smaller than the WordPress max upload size.
         *              Otherwise, returns true if the video is within the user-defined limit.
         */
        public static function checkVideoFileSize($node)
        {
            // Overridden value in WordPress settings
            $max_file_size_setting = get_option('tapestry_kaltura_upload_max_file_size');

            // Value defined in wp-config.php
            $max_file_size_constant = defined('TAPESTRY_KALTURA_UPLOAD_MAX_FILE_SIZE') ? TAPESTRY_KALTURA_UPLOAD_MAX_FILE_SIZE : null;

            $user_defined_size_string = !empty($max_file_size_setting) ? $max_file_size_setting : $max_file_size_constant;
            if (empty($user_defined_size_string)) {
                return true;
            }

            $user_defined_max_upload_size = wp_convert_hr_to_bytes($user_defined_size_string);

            if ($user_defined_max_upload_size >= wp_max_upload_size()) {
                return true;
            }

            $file = TapestryHelpers::getPathToNodeMedia($node);
            $filesize = TapestryHelpers::getRealFileSize($file->file_path);

            return $filesize <= $user_defined_max_upload_size;
        }
    }
