<?php

    require_once dirname(__FILE__).'/../utilities/class.tapestry-errors.php';

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
            $upload = $kclient->uploadToken->upload($token->id, $filepath);

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

        public function getAvailableLanguages()
        {
            return array_values($this->languages);
        }

        public function getCaptionsAndDefaultCaption($videoEntryId)
        {
            $kclient = $this->getKClient();
            $captionAssets = $this->_getCaptions($kclient, $videoEntryId);

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

        private function _getCaptions($kclient, $videoEntryId)
        {
            $captionPlugin = CaptionPlugin::get($kclient);

            $filter = new CaptionAssetFilter();
            $filter->entryIdEqual = $videoEntryId;

            $captionAssets = $captionPlugin->captionAsset->listAction($filter);

            return $captionAssets->objects;
        }

        private function _getCaptionUrl($kclient, $captionAssetId)
        {
            $captionPlugin = CaptionPlugin::get($kclient);

            return $captionPlugin->captionAsset->serve($captionAssetId);
        }

        /**
         * Filter caption asset fields to return to the user.
         *
         * @param string $overrideCaptionUrl Use this URL instead of requesting the caption URL from Kaltura. Use this for pending captions,
         *                                   to preserve the original user-provided URL.
         * @param string $overrideId         Use this ID instead of $captionAsset->id. Use this for pending captions that were successfully
         *                                   created on Kaltura, to replace the UUID generated on the frontend with the Kaltura ID.
         */
        private function _filterCaptionAsset($kclient, $captionAsset, $overrideCaptionUrl = null, $overrideId = null, $errorMessage = null)
        {
            $caption = (object) [
                'id' => $overrideId ?? $captionAsset->id,
                'label' => $captionAsset->label,
                'language' => $captionAsset->language,
                'displayOnPlayer' => $captionAsset->displayOnPlayer,
                'captionUrl' => $overrideCaptionUrl ?? $this->_getCaptionUrl($kclient, $captionAsset->id).'?.'.$captionAsset->fileExt,
            ];
            if (!empty($errorMessage)) {
                $caption->errorMessage = $errorMessage;
            }

            return $caption;
        }

        public function setCaptionsAndDefaultCaption($videoEntryId, $captions, $defaultCaptionId, $throwErrors = false)
        {
            if (!isset($captions) || !is_array($captions)) {
                return null;
            }

            $kclient = $this->getKClient(SessionType::ADMIN);

            $result = $this->setCaptions($kclient, $videoEntryId, $captions, $throwErrors);
            $updatedCaptions = $result->captions;

            if (!empty($defaultCaptionId) && is_string($defaultCaptionId) && isset($updatedCaptions[$defaultCaptionId])) {
                // Map default caption ID to its (possibly) new ID after being uploaded
                $newDefaultCaptionId = $updatedCaptions[$defaultCaptionId]->id;
                $this->setCaptionAsDefault($kclient, $newDefaultCaptionId);
            }

            return (object) [
                'captions' => array_values($updatedCaptions),
                'pendingCaptions' => $result->pendingCaptions,
                'defaultCaptionId' => $newDefaultCaptionId,
            ];
        }

        public function setCaptionAsDefault($kclient, $captionAssetId)
        {
            $captionPlugin = CaptionPlugin::get($kclient);
            $captionPlugin->captionAsset->setAsDefault($captionAssetId);
        }

        public function setCaptions($kclient, $videoEntryId, $captions, $throwErrors)
        {
            // Get existing captions
            $oldCaptions = $this->getCaptionsAndDefaultCaption($videoEntryId)->captions;

            // Prepare the changes to make
            $oldCaptionsMap = $this->_formRequests($oldCaptions);
            $newCaptionsMap = $this->_formRequests($captions);

            $toDelete = array_diff_key($oldCaptionsMap, $newCaptionsMap);
            $toAdd = array_diff_key($newCaptionsMap, $oldCaptionsMap);
            $toUpdate = array_intersect_key($newCaptionsMap, $oldCaptionsMap);

            $kclient->startMultiRequest();
            foreach ($toDelete as $caption) {
                $this->_deleteCaptionAsset($kclient, $caption->id);
            }
            foreach ($toAdd as $caption) {
                $tokenId = $this->_uploadFile($kclient, $caption->file, ['vtt', 'srt'], $throwErrors, true);
                if (isset($tokenId)) {
                    $captionAssetId = $this->_createCaptionAsset($kclient, $caption, $videoEntryId);
                    $this->_setCaptionAssetContent($kclient, $caption, $captionAssetId, $tokenId);
                }
            }
            foreach ($toUpdate as $caption) {
                $this->_updateCaptionAsset($kclient, $caption);
                if (isset($caption->file)) {
                    $tokenId = $this->_uploadFile($kclient, $caption->file, ['vtt', 'srt'], $throwErrors);
                    if (isset($tokenId)) {
                        $this->_setCaptionAssetContent($kclient, $caption, $caption->id, $tokenId);
                    }
                }
            }

            // Send all changes in one request
            $allResults = $kclient->doMultiRequest();

            return $this->_processResponses($kclient, $allResults, $toAdd, $toUpdate);
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
                    'displayOnPlayer' => $caption->displayOnPlayer,
                ];
            }

            return $requests;
        }

        /**
         * Process the array of all API responses from a multi-request.
         * Deletes local caption files if successfully uploaded.
         * Returns an array of successfully added captions - containing the updated fields,
         * and an array of unsuccessfully added (pending) captions - containing the original user-provided fields.
         */
        private function _processResponses($kclient, $responses, $toAdd, $toUpdate)
        {
            $results = [];
            $pending = [];

            // Caption metadata (language, label) and content (VTT/SRT file) are set in separate requests, so address errors separately.
            $metadataErrorMessage = 'Please check the language and label.';
            $contentErrorMessage = 'Please check the .vtt or .srt file you provided.';

            foreach ($toAdd as $caption) {
                if (!isset($caption->metadataRequestIndex)) {
                    // Caption was not added due to invalid file
                    array_push($pending, $this->_filterCaptionAsset($kclient, $caption, $caption->captionUrl, null, $contentErrorMessage));
                    continue;
                }

                $metadataResponse = $responses[$caption->metadataRequestIndex];
                $contentResponse = $responses[$caption->contentRequestIndex];
                $metadataError = is_a($metadataResponse, ApiException::class);
                $contentError = is_a($contentResponse, ApiException::class);

                if ($metadataError) {
                    array_push($pending, $this->_filterCaptionAsset($kclient, $caption, $caption->captionUrl, null, $metadataErrorMessage));
                } elseif ($contentError) {
                    array_push($pending, $this->_filterCaptionAsset($kclient, $caption, $caption->captionUrl, $metadataResponse->id, $contentErrorMessage));
                } else {
                    $results[$caption->id] = $this->_filterCaptionAsset($kclient, $metadataResponse);
                    $this->_deleteLocalUpload($caption->file);
                }
            }

            foreach ($toUpdate as $caption) {
                $metadataResponse = $responses[$caption->metadataRequestIndex];
                $contentResponse = $responses[$caption->contentRequestIndex];
                $metadataError = is_a($metadataResponse, ApiException::class);
                $contentError = is_a($contentResponse, ApiException::class);

                if ($contentError) {
                    // Failed to upload - keep URL of local caption file and do not delete it
                    array_push($pending, $this->_filterCaptionAsset($kclient, $caption, $caption->captionUrl, null, $contentErrorMessage));
                } elseif ($metadataError) {
                    array_push($pending, $this->_filterCaptionAsset($kclient, $caption, null, null, $metadataErrorMessage));
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

        /**
         * Uploads a local file and returns the Kaltura upload token ID.
         *
         * @param object $file              object containing file name and path information
         * @param array  $allowedExtensions list of valid file extensions to upload
         * @param bool   $throwErrors       whether to throw an error if the file is invalid
         * @param bool   $errorIfNotLocal   whether to throw an error if the file is not a local upload (only applies if $throwErrors)
         *
         * @return string|null the upload token ID or null if given file is invalid
         */
        private function _uploadFile($kclient, $file, $allowedExtensions, $throwErrors, $errorIfNotLocal = false)
        {
            if (empty($file)) {
                // File is not a local upload
                if ($throwErrors && $errorIfNotLocal) {
                    throw new TapestryError('UPLOAD_FILE_NOT_FOUND');
                } else {
                    return null;
                }
            } elseif (!in_array($file->extension, $allowedExtensions) || !file_exists($file->file_path)) {
                // File is a local upload, but does not exist/has invalid extension
                if ($throwErrors) {
                    throw new TapestryError('UPLOAD_FILE_NOT_FOUND');
                } else {
                    return null;
                }
            }

            $uploadToken = new UploadToken();
            $token = $kclient->uploadToken->add($uploadToken);
            $upload = $kclient->uploadToken->upload($token->id, $file->file_path);

            return $token->id;
        }

        /**
         * Adds a new caption asset to a Kaltura video and returns its ID.
         *
         * @param object $caption      caption to add
         * @param string $videoEntryId kaltura ID of the video
         */
        private function _createCaptionAsset($kclient, $caption, $videoEntryId)
        {
            $captionPlugin = CaptionPlugin::get($kclient);

            $captionAsset = new CaptionAsset();
            $captionAsset->label = $caption->label;
            $captionAsset->language = $caption->language;
            $captionAsset->displayOnPlayer = $caption->displayOnPlayer;
            if ($caption->file) {
                $captionAsset->format = 'vtt' === $caption->file->extension ? CaptionType::WEBVTT : CaptionType::SRT;
            }

            $response = $captionPlugin->captionAsset->add($videoEntryId, $captionAsset);

            // Save the index of this request to check its response later
            $caption->metadataRequestIndex = $kclient->getMultiRequestQueueSize() - 1;

            return $response->id;
        }

        /**
         * Sets the file contents of a Kaltura caption asset from an uploaded file token.
         *
         * @param object $caption        Caption object
         * @param string $captionAssetId Kaltura ID of the caption to update
         * @param string $tokenId        ID of the Kaltura uploaded file token
         */
        private function _setCaptionAssetContent($kclient, $caption, $captionAssetId, $tokenId)
        {
            $captionPlugin = CaptionPlugin::get($kclient);

            $resource = new UploadedFileTokenResource();
            $resource->token = $tokenId;
            $response = $captionPlugin->captionAsset->setContent($captionAssetId, $resource);

            // Save the index of this request to check its response later
            $caption->contentRequestIndex = $kclient->getMultiRequestQueueSize() - 1;

            return $response->id;
        }

        /**
         * Updates the metadata (language, label, etc) of a Kaltura caption asset.
         *
         * @param object $caption New metadata for the caption
         */
        private function _updateCaptionAsset($kclient, $caption)
        {
            $captionPlugin = CaptionPlugin::get($kclient);

            $captionAsset = new CaptionAsset();
            $captionAsset->id = $caption->id;
            $captionAsset->label = $caption->label;
            $captionAsset->language = $caption->language;
            $captionAsset->displayOnPlayer = $caption->displayOnPlayer;

            $response = $captionPlugin->captionAsset->update($captionAsset->id, $captionAsset);

            // Save the index of this request to check its response later
            $caption->metadataRequestIndex = $kclient->getMultiRequestQueueSize() - 1;

            return $response->id;
        }

        private function _deleteCaptionAsset($kclient, $captionAssetId)
        {
            $captionPlugin = CaptionPlugin::get($kclient);
            $captionPlugin->captionAsset->delete($captionAssetId);
        }
    }
