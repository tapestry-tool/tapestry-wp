<?php

    if (defined('LOAD_KALTURA') && LOAD_KALTURA) {
        require_once plugin_dir_path(dirname(__FILE__)).'vendor/autoload.php';
    } else {
        return false;
    }

    require_once dirname(__FILE__).'/../utilities/class.tapestry-helpers.php';

    use Kaltura\Client\ApiException;
    use Kaltura\Client\ClientException;
    use Kaltura\Client\Client;
    use Kaltura\Client\Configuration;
    use Kaltura\Client\Enum\MediaType;
    use Kaltura\Client\Enum\Language;
    use Kaltura\Client\Enum\SessionType;
    use Kaltura\Client\Type\Category;
    use Kaltura\Client\Type\CategoryFilter;
    use Kaltura\Client\Type\MediaEntry;
    use Kaltura\Client\Type\UploadedFileTokenResource;
    use Kaltura\Client\Type\UploadToken;
    use Kaltura\Client\Type\UrlResource;
    use Kaltura\Client\Plugin\Caption\Enum\CaptionType;
    use Kaltura\Client\Plugin\Caption\Enum\CaptionAssetStatus;
    use Kaltura\Client\Plugin\Caption\Type\CaptionAsset;
    use Kaltura\Client\Plugin\Caption\Type\CaptionAssetFilter;
    use Kaltura\Client\Plugin\Caption\CaptionPlugin;

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
            $languageClass = new ReflectionClass(Language::class);
            return array_values($languageClass->getConstants());
        }

        public function getCaptionsAndDefaultCaption($videoEntryId)
        {
            $kclient = $this->getKClient();
            $captionAssets = $this->_getCaptions($kclient, $videoEntryId);
            return $this->_filterCaptionAssets($kclient, $captionAssets, true);
        }

        private function _getCaptionUrl($kclient, $captionAssetId)
        {
            $captionPlugin = CaptionPlugin::get($kclient);
            $response = $captionPlugin->captionAsset->serve($captionAssetId);
            return $response;
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

        private function _filterCaptionAsset($kclient, $captionAsset)
        {
            return (object) [
                'id' => $captionAsset->id,
                'label' => $captionAsset->label,
                'language' => $captionAsset->language,
                'fileUrl' => $this->_getCaptionUrl($kclient, $captionAsset->id) . '?.vtt',
            ];
        }

        private function _getCaptions($kclient, $videoEntryId)
        {
            $captionPlugin = CaptionPlugin::get($kclient);

            $filter = new CaptionAssetFilter();
            $filter->entryIdEqual = $videoEntryId;
            // $filter->statusEqual = CaptionAssetStatus::READY;        // TODO: is this filter useful?

            $captionAssets = $captionPlugin->captionAsset->listAction($filter);

            return $captionAssets->objects;
        }

        public function setCaptionsAndDefaultCaption($videoEntryId, $captions, $defaultCaptionId)
        {
            if (!isset($captions) || !is_array($captions)) {
                return null;
            }

            try {
                $updatedCaptions = $this->setCaptions($videoEntryId, $captions);
                $result = array_values($updatedCaptions);

                error_log("Updated captions: " . print_r($updatedCaptions, true));
    
                if (!empty($defaultCaptionId) && is_string($defaultCaptionId) && isset($updatedCaptions[$defaultCaptionId])) {
                    $newDefaultCaptionId = $updatedCaptions[$defaultCaptionId]->id;
                    $this->setCaptionAsDefault($newDefaultCaptionId);
                }

                return (object) [
                    'captions' => $result,
                    'defaultCaptionId' => $newDefaultCaptionId,
                ];
            } catch (Exception $e) {
                // TODO:
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

            $oldCaptions = $this->_getCaptions($kclient, $videoEntryId);

            $oldCaptionsMap = [];
            foreach ($oldCaptions as $caption) {
                $oldCaptionsMap[$caption->id] = $caption;
            }
            $newCaptionsMap = [];
            foreach ($captions as $caption) {
                $newCaptionsMap[$caption->id] = $caption;
            }

            $requestTracker = [];

            $captionsToDelete = array_diff_key($oldCaptionsMap, $newCaptionsMap);
            $captionsToAdd = array_diff_key($newCaptionsMap, $oldCaptionsMap);
            $captionsToUpdate = array_intersect_key($newCaptionsMap, $oldCaptionsMap);

            $requestTracker = array();

            $kclient->startMultiRequest();

            foreach ($captionsToDelete as $caption) {
                $this->_deleteCaption($kclient, $caption->id);
            }
            foreach ($captionsToAdd as $caption) {
                $id = $caption->id;
                $this->_addCaption($kclient, $videoEntryId, $caption);
                $requestTracker[$id] = [
                    'index' => $kclient->getMultiRequestQueueSize() - 1,
                    'type' => 'add',
                    'caption' => $caption,
                ];
            }
            foreach ($captionsToUpdate as $caption) {
                $id = $caption->id;
                $this->_updateCaption($kclient, $oldCaptionsMap[$id], $caption);
                $requestTracker[$id] = [
                    'index' => $kclient->getMultiRequestQueueSize() - 1,
                    'type' => 'update',
                    'caption' => $caption,
                ];
            }

            $allResults = $kclient->doMultiRequest();
            error_log("All results: " . print_r($allResults, true));
            $this->_deleteUploadedCaptionFiles($allResults, $requestTracker);
            $returnedCaptions = array_map(function ($request) use ($allResults) {
                return $allResults[$request['index']];
            }, $requestTracker);

            return $this->_filterCaptionAssets($kclient, $returnedCaptions)->captions;
        }

        private function _getCaptionsToStore($kclient, $multirequestResults, $requestTracker, $oldCaptionsMap)
        {
            $finalCaptions = [];
            foreach ($requestTracker as $id => $request) {
                $result = $multirequestResults[$request['index']];
                if (!is_a($result, ApiException::class)) {
                    $finalCaptions[$id] = $this->_filterCaptionAsset($kclient, $request['caption']);

                    $this->_deleteLocalUpload($request['caption']->fileUrl);
                } else {
                    if ($request)
                    $finalCaptions[$id] = $oldCaptionsMap[$id];
                }
            }
        }

        private function _deleteUploadedCaptionFiles($multirequestResults, $requestTracker)
        {
            foreach ($requestTracker as $request) {
                $result = $multirequestResults[$request['index']];
                if (!is_a($result, ApiException::class)) {
                    $this->_deleteLocalUpload($request['caption']->fileUrl);
                }
            }
        }

        private function _deleteLocalUpload($fileUrl)
        {
            $file = TapestryHelpers::getPathToMedia($fileUrl);
            if ($file) {
                wp_delete_file($file->file_path);
            }
        }

        private function _addCaption($kclient, $videoEntryId, $caption)
        {
            $file = TapestryHelpers::getPathToMedia($caption->fileUrl);
            if (!$file || pathinfo($file->name, PATHINFO_EXTENSION) !== 'vtt') {
                return;
            }

            $uploadToken = new UploadToken();
            $token = $kclient->uploadToken->add($uploadToken);
            $upload = $kclient->uploadToken->upload($token->id, $file->file_path);

            $captionPlugin = CaptionPlugin::get($kclient);

            $captionAsset = new CaptionAsset();
            $captionAsset->label = $caption->label ?? 'CC';
            $captionAsset->language = $caption->language ?? Language::EN;
            $captionAsset->format = CaptionType::WEBVTT;

            $addedCaptionAsset = $captionPlugin->captionAsset->add($videoEntryId, $captionAsset);

            $resource = new UploadedFileTokenResource();
            $resource->token = $token->id;
            $result = $captionPlugin->captionAsset->setContent($addedCaptionAsset->id, $resource);

            return $result;
        }

        private function _updateCaption($kclient, $oldCaption, $caption)
        {            
            $captionPlugin = CaptionPlugin::get($kclient);

            $captionAsset = new CaptionAsset();
            $captionAsset->id = $oldCaption->id;
            $captionAsset->label = $caption->label ?? 'CC';
            $captionAsset->language = $caption->language ?? Language::EN;
            $captionAsset->format = CaptionType::WEBVTT;

            $updatedCaptionAsset = $captionPlugin->captionAsset->update($captionAsset->id, $captionAsset);

            $file = TapestryHelpers::getPathToMedia($caption->fileUrl);
            if (!$file || pathinfo($file->name, PATHINFO_EXTENSION) !== 'vtt') {
                return $updatedCaptionAsset;
            }

            $uploadToken = new UploadToken();
            $token = $kclient->uploadToken->add($uploadToken);
            $upload = $kclient->uploadToken->upload($token->id, $file->file_path);

            $resource = new UploadedFileTokenResource();
            $resource->token = $token->id;
            $result = $captionPlugin->captionAsset->setContent($updatedCaptionAsset->id, $resource);

            return $result;
        }

        private function _deleteCaption($kclient, $captionAssetId)
        {
            $captionPlugin = CaptionPlugin::get($kclient);
            $response = $captionPlugin->captionAsset->delete($captionAssetId);
    
            return $response;
        }
    }
