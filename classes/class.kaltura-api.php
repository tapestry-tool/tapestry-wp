<?php

    if (defined('LOAD_KALTURA') && LOAD_KALTURA) {
        require_once plugin_dir_path(dirname(__FILE__)).'vendor/autoload.php';
    } else {
        return false;
    }

    require_once dirname(__FILE__).'/../utilities/class.tapestry-helpers.php';

    use Kaltura\Client\ApiException;
    use Kaltura\Client\Client;
    use Kaltura\Client\Configuration;
    use Kaltura\Client\Enum\Language;
    use Kaltura\Client\Enum\MediaType;
    use Kaltura\Client\Enum\SessionType;
    use Kaltura\Client\Plugin\Caption\CaptionPlugin;
    use Kaltura\Client\Plugin\Caption\Enum\CaptionType;
    use Kaltura\Client\Plugin\Caption\Type\CaptionAsset;
    use Kaltura\Client\Plugin\Caption\Type\CaptionAssetFilter;
    use Kaltura\Client\Type\Category;
    use Kaltura\Client\Type\CategoryFilter;
    use Kaltura\Client\Type\MediaEntry;
    use Kaltura\Client\Type\UploadedFileTokenResource;
    use Kaltura\Client\Type\UploadToken;

    class KalturaApi
    {
        private $languages;

        public function __construct()
        {
            // Get available languages via reflection and cache results
            $languageClass = new ReflectionClass(Language::class);
            $this->languages = array_values($languageClass->getConstants());
        }

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
                throw new TapestryError('Unable to establish Kaltura session.');
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
            $upload = $kclient->uploadToken->upload($token->id, $filepath);

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

        public function getAvailableLanguages()
        {
            return array_values($this->languages);
        }

        public function getCaptionsAndDefaultCaption($videoEntryId)
        {
            $kclient = $this->getKClient();
            $captionAssets = $this->_getCaptions($kclient, $videoEntryId);

            return $this->_filterCaptionAssets($kclient, $captionAssets);
        }

        private function _filterCaptionAssets($kclient, $captionAssets)
        {
            $captions = [];
            $defaultCaptionId = null;

            foreach ($captionAssets as $key => $captionAsset) {
                $captions[$key] = $this->_filterCaptionAsset($kclient, $captionAsset);

                if ($captionAsset->isDefault) {
                    $defaultCaptionId = $captionAsset->id;
                }
            }

            return (object) [
                'captions' => $captions,
                'defaultCaptionId' => $defaultCaptionId,
            ];
        }

        private function _filterCaptionAsset($kclient, $captionAsset, $overrideCaptionUrl = null, $errorMessage = null)
        {
            $caption = (object) [
                'id' => $captionAsset->id,
                'label' => $captionAsset->label,
                'language' => $captionAsset->language,
                'captionUrl' => $overrideCaptionUrl ?? $this->_getCaptionUrl($kclient, $captionAsset->id).'?.vtt',
            ];
            if (!empty($errorMessage)) {
                $caption->errorMessage = $errorMessage;
            }

            return $caption;
        }

        private function _getCaptionUrl($kclient, $captionAssetId)
        {
            $captionPlugin = CaptionPlugin::get($kclient);
            $response = $captionPlugin->captionAsset->serve($captionAssetId);

            return $response;
        }

        private function _getCaptions($kclient, $videoEntryId)
        {
            $captionPlugin = CaptionPlugin::get($kclient);

            $filter = new CaptionAssetFilter();
            $filter->entryIdEqual = $videoEntryId;

            $captionAssets = $captionPlugin->captionAsset->listAction($filter);

            return $captionAssets->objects;
        }

        public function setCaptionsAndDefaultCaption($videoEntryId, $captions, $defaultCaptionId)
        {
            if (!isset($captions) || !is_array($captions)) {
                return null;
            }

            try {
                $result = $this->setCaptions($videoEntryId, $captions);

                $updatedCaptions = $result->captions;
                $captions = array_values($updatedCaptions);

                if (!empty($defaultCaptionId) && is_string($defaultCaptionId) && isset($updatedCaptions[$defaultCaptionId])) {
                    $newDefaultCaptionId = $updatedCaptions[$defaultCaptionId]->id;
                    $this->setCaptionAsDefault($newDefaultCaptionId);
                }

                return (object) [
                    'captions' => $captions,
                    'pendingCaptions' => $result->pendingCaptions,
                    'defaultCaptionId' => $newDefaultCaptionId,
                ];
            } catch (Exception $e) {
                throw new TapestryError($e->getCode(), $e->getMessage(), 500);
            }
        }

        public function setCaptionAsDefault($captionAssetId)
        {
            $kclient = $this->getKClient(SessionType::ADMIN);
            $captionPlugin = CaptionPlugin::get($kclient);

            $response = $captionPlugin->captionAsset->setAsDefault($captionAssetId);

            return $response;
        }

        public function setCaptions($videoEntryId, $captions)
        {
            $kclient = $this->getKClient(SessionType::ADMIN);

            $oldCaptions = $this->getCaptionsAndDefaultCaption($videoEntryId)->captions;

            $oldCaptionsMap = $this->_formRequests($oldCaptions);
            $newCaptionsMap = $this->_formRequests($captions);

            $captionsToDelete = array_diff_key($oldCaptionsMap, $newCaptionsMap);
            $captionsToAdd = array_diff_key($newCaptionsMap, $oldCaptionsMap);
            $captionsToUpdate = array_intersect_key($newCaptionsMap, $oldCaptionsMap);

            $kclient->startMultiRequest();

            foreach ($captionsToDelete as $caption) {
                $this->_deleteCaptionAsset($kclient, $caption->id);
            }
            foreach ($captionsToAdd as $caption) {
                $captionAssetId = $this->_createCaptionAsset($kclient, $caption, $videoEntryId);
                $tokenId = $this->_uploadFile($kclient, $caption->file, ['vtt']);
                $this->_setCaptionAssetContent($kclient, $caption, $captionAssetId, $tokenId);
            }
            foreach ($captionsToUpdate as $caption) {
                $this->_updateCaptionAsset($kclient, $caption);
                if (isset($caption->file)) {
                    $tokenId = $this->_uploadFile($kclient, $caption->file, ['vtt']);
                }
                if (isset($tokenId)) {
                    $this->_setCaptionAssetContent($kclient, $caption, $caption->id, $tokenId);
                }
            }

            $allResults = $kclient->doMultiRequest();

            return $this->_processResponses($kclient, $allResults, $captionsToAdd, $captionsToUpdate);
        }

        private function _formRequests($captions)
        {
            $requests = [];

            foreach ($captions as $caption) {
                $language = in_array($caption->language, $this->getAvailableLanguages()) ? $caption->language : Language::UN;

                $requests[$caption->id] = (object) [
                    'id' => $caption->id,
                    'file' => TapestryHelpers::getPathToMedia($caption->captionUrl),
                    'captionUrl' => $caption->captionUrl,
                    'label' => $caption->label ?? ($caption->language ?? $language),
                    'language' => $language,
                ];
            }

            return $requests;
        }

        private function _processResponses($kclient, $responses, $captionsToAdd, $captionsToUpdate)
        {
            $results = [];
            $pending = [];

            $metadataErrorMessage = 'Please check the language and label.';
            $contentErrorMessage = 'Please check the .vtt file you provided.';

            foreach ($captionsToAdd as $caption) {
                $metadataResponse = $responses[$caption->metadataRequestIndex];
                $contentResponse = $responses[$caption->contentRequestIndex];

                $metadataError = is_a($metadataResponse, ApiException::class);
                $contentError = is_a($contentResponse, ApiException::class);

                if ($metadataError) {
                    array_push($pending, $this->_filterCaptionAsset($kclient, $caption, $caption->captionUrl, $metadataErrorMessage));
                } elseif ($contentError) {
                    array_push($pending, $this->_filterCaptionAsset($kclient, $metadataResponse, $caption->captionUrl, $contentErrorMessage));
                } else {
                    $results[$caption->id] = $this->_filterCaptionAsset($kclient, $metadataResponse);
                    $this->_deleteLocalUpload($caption->file);
                }
            }

            foreach ($captionsToUpdate as $caption) {
                $metadataResponse = $responses[$caption->metadataRequestIndex];
                $contentResponse = isset($caption->contentRequestIndex) ? $responses[$caption->contentRequestIndex] : null;

                $metadataError = is_a($metadataResponse, ApiException::class);
                $contentError = is_a($contentResponse, ApiException::class);

                if ($contentError) {
                    array_push($pending, $this->_filterCaptionAsset($kclient, $caption, $caption->captionUrl, $contentErrorMessage));
                } elseif ($metadataError) {
                    array_push($pending, $this->_filterCaptionAsset($kclient, $caption, $metadataErrorMessage));
                    $this->_deleteLocalUpload($caption->file);
                } else {
                    $results[$caption->id] = $this->_filterCaptionAsset($kclient, $metadataResponse);
                    $this->_deleteLocalUpload($caption->file);
                }
            }

            return (object) [
                'pendingCaptions' => $pending,
                'captions' => $results,
            ];
        }

        private function _deleteLocalUpload($file)
        {
            if ($file) {
                wp_delete_file($file->file_path);
            }
        }

        private function _uploadFile($kclient, $file, $allowedExtensions)
        {
            if (empty($file) || !in_array(pathinfo($file->name, PATHINFO_EXTENSION), $allowedExtensions)) {
                return null;
            }

            $uploadToken = new UploadToken();
            $token = $kclient->uploadToken->add($uploadToken);
            $upload = $kclient->uploadToken->upload($token->id, $file->file_path);

            return $token->id;
        }

        private function _createCaptionAsset($kclient, $caption, $videoEntryId)
        {
            $captionPlugin = CaptionPlugin::get($kclient);

            $captionAsset = new CaptionAsset();
            $captionAsset->label = $caption->label;
            $captionAsset->language = $caption->language;
            $captionAsset->format = CaptionType::WEBVTT;

            $response = $captionPlugin->captionAsset->add($videoEntryId, $captionAsset);

            $caption->metadataRequestIndex = $kclient->getMultiRequestQueueSize() - 1;

            return $response->id;
        }

        private function _setCaptionAssetContent($kclient, $caption, $captionAssetId, $tokenId)
        {
            $captionPlugin = CaptionPlugin::get($kclient);

            $resource = new UploadedFileTokenResource();
            $resource->token = $tokenId;
            $response = $captionPlugin->captionAsset->setContent($captionAssetId, $resource);

            $caption->contentRequestIndex = $kclient->getMultiRequestQueueSize() - 1;

            return $response->id;
        }

        private function _updateCaptionAsset($kclient, $caption)
        {
            $captionPlugin = CaptionPlugin::get($kclient);

            $captionAsset = new CaptionAsset();
            $captionAsset->id = $caption->id;
            $captionAsset->label = $caption->label;
            $captionAsset->language = $caption->language;
            $captionAsset->format = CaptionType::WEBVTT;

            $response = $captionPlugin->captionAsset->update($captionAsset->id, $captionAsset);

            $caption->metadataRequestIndex = $kclient->getMultiRequestQueueSize() - 1;

            return $response->id;
        }

        private function _deleteCaptionAsset($kclient, $captionAssetId)
        {
            $captionPlugin = CaptionPlugin::get($kclient);
            $response = $captionPlugin->captionAsset->delete($captionAssetId);

            return $response;
        }
    }
