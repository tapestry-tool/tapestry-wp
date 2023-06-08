<?php

require_once dirname(__FILE__).'/../utilities/class.tapestry-errors.php';
require_once dirname(__FILE__).'/../utilities/class.tapestry-helpers.php';
require_once dirname(__FILE__).'/../classes/class.tapestry-h5p.php';

if (defined('LOAD_KALTURA') && LOAD_KALTURA) {
    require_once plugin_dir_path(dirname(__FILE__)).'vendor/autoload.php';
} else {
    return false;
}

require_once dirname(__FILE__).'/../utilities/class.tapestry-helpers.php';

use Kaltura\Client\ApiException;
use Kaltura\Client\Client;
use Kaltura\Client\ClientException;
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
    private $kUserClient;
    private $kAdminClient;

    public function __construct()
    {
        $this->kUserClient = $this->_getKClient(SessionType::USER);
        $this->kAdminClient = $this->_getKClient(SessionType::ADMIN);

        // Get available languages via reflection and cache results
        $languageClass = new ReflectionClass(Language::class);
        $this->languages = array_values($languageClass->getConstants());
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

        /*
        We organize uploaded videos into Kaltura Categories. The ancestor category of all videos is 'Tapestry'.
        Under 'Tapestry', videos are categorized by the URL of the site they were uploaded from.
        Under 'Tapestry>{site URL}', videos are categorized either by date or by Tapestry.
        */
        $parentCategoryName = 'Tapestry';
        $filter = new CategoryFilter();
        $filter->fullNameStartsWith = $parentCategoryName;

        $categories = $this->kUserClient->category->listAction($filter, null);

        // Ensure the chain of categories 'Tapestry>{site URL}>{category name}' exists to place this video under
        $parentCategory = $this->_getOrCreateCategory($parentCategoryName, null, $categories);

        $siteUrl = get_bloginfo('url');
        $siteCategory = $this->_getOrCreateCategory($siteUrl, $parentCategory, $categories);

        $videoCategory = $this->_getOrCreateCategory($categoryName, $siteCategory, $categories);

        // Uploading Video Steps:
        // 1. Create upload token
        $uploadToken = new UploadToken();
        $token = $this->kUserClient->uploadToken->add($uploadToken);

        // 2. Upload the file data
        $upload = $this->kUserClient->uploadToken->upload($token->id, $filepath);

        // 3. Create Kaltura Media Entry and add the above categories
        $mediaEntry = new MediaEntry();
        $mediaEntry->name = $filename;
        $mediaEntry->mediaType = MediaType::VIDEO;
        $mediaEntry->categoriesIds = $parentCategory->id.','.$siteCategory->id.','.$videoCategory->id;
        $entry = $this->kUserClient->media->add($mediaEntry);

        // 4. Attach the uploaded video to the Media Entry
        $resource = new UploadedFileTokenResource();
        $resource->token = $token->id;
        $response = $this->kUserClient->media->addContent($entry->id, $resource);

        return $response;
    }

    /**
     * Finds the Kaltura video with the given ID if it exists.
     * Returns null if not found.
     */
    public function getVideo($entryId)
    {
        try {
            return $this->kUserClient->media->get($entryId);
        } catch (ApiException $e) {
            return null;
        }
    }

    public function getLanguages()
    {
        return array_values($this->languages);
    }

    public function getCaptionsAndDefaultCaption($videoEntryId)
    {
        $captionAssets = $this->_getCaptions($videoEntryId);

        $captions = [];
        $defaultCaptionId = null;
        foreach ($captionAssets as $key => $captionAsset) {
            $captions[$key] = $this->_filterCaptionAsset($captionAsset);

            if ($captionAsset->isDefault) {
                $defaultCaptionId = $captionAsset->id;
            }
        }

        return (object) [
            'captions' => $captions,
            'defaultCaptionId' => $defaultCaptionId,
        ];
    }

    public function setCaptionsAndDefaultCaption($videoEntryId, $captions, $defaultCaptionId, $throwUploadErrors = false)
    {
        try {
            $result = $this->_setCaptions($videoEntryId, $captions, $throwUploadErrors);
            $updatedCaptions = $result->captions;

            if (!empty($defaultCaptionId) && is_string($defaultCaptionId) && isset($updatedCaptions[$defaultCaptionId])) {
                // Map default caption ID to its (possibly) new ID after being uploaded
                $newDefaultCaptionId = $updatedCaptions[$defaultCaptionId]->id;
                $this->_setCaptionAsDefault($newDefaultCaptionId);
            }

            return (object) [
                'captions' => array_values($updatedCaptions),
                'pendingCaptions' => $result->pendingCaptions,
                'defaultCaptionId' => $newDefaultCaptionId,
            ];
        } catch (ClientException|ApiException $e) {
            throw new TapestryError('KALTURA_ERROR');
        }
    }

    /* *************************************************
    /*                  PRIVATE FUNCTIONS
    /* ************************************************* */

    /**
     * Creates Kaltura Client and starts Kaltura Session.
     *
     * @return object $response KalturaClient
     */
    private function _getKClient($type = SessionType::USER)
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

    private function _getOrCreateCategory($categoryName, $parentCategory, $categories)
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
            $category = $this->kAdminClient->category->add($createdCategory);
        }

        return $category;
    }

    private function _setCaptions($videoEntryId, $captions, $throwErrors)
    {
        // Get existing captions
        $oldCaptions = $this->getCaptionsAndDefaultCaption($videoEntryId)->captions;

        // Prepare the changes to make
        $oldCaptionsRequest = $this->_formCaptionsRequest($oldCaptions);
        $newCaptionsRequest = $this->_formCaptionsRequest($captions);

        $toDelete = array_diff_key($oldCaptionsRequest, $newCaptionsRequest);
        $toAdd = array_diff_key($newCaptionsRequest, $oldCaptionsRequest);
        $toUpdate = array_intersect_key($newCaptionsRequest, $oldCaptionsRequest);

        $this->kAdminClient->startMultiRequest();
        foreach ($toDelete as $caption) {
            $this->_deleteCaptionAsset($caption->id);
        }
        foreach ($toAdd as $caption) {
            $tokenId = $this->_uploadFile($caption->file, ['vtt', 'srt'], $throwErrors, true);
            if (isset($tokenId)) {
                $captionAssetId = $this->_createCaptionAsset($caption, $videoEntryId);
                $this->_setCaptionAssetContent($caption, $captionAssetId, $tokenId);
            }
        }
        foreach ($toUpdate as $caption) {
            $this->_updateCaptionAsset($caption);
            if (isset($caption->file)) {
                $tokenId = $this->_uploadFile($caption->file, ['vtt', 'srt'], $throwErrors);
                if (isset($tokenId)) {
                    $this->_setCaptionAssetContent($caption, $caption->id, $tokenId);
                }
            }
        }

        // Send all changes in one request
        $responses = $this->kAdminClient->doMultiRequest();

        /**
         * Process the array of all API responses from a multi-request.
         * Deletes local caption files if successfully uploaded.
         * Returns an array of successfully added captions - containing the updated fields,
         * and an array of unsuccessfully added (pending) captions - containing the original user-provided fields.
         */
        $results = [];
        $pending = [];

        // Caption metadata (language, label) and content (VTT/SRT file) are set in separate requests, so address errors separately.
        $metadataErrorMessage = 'Please check the language and label.';
        $contentErrorMessage = 'Please check the .vtt or .srt file you provided.';

        foreach ($toAdd as $caption) {
            if (!isset($caption->metadataRequestIndex)) {
                // Caption was not added due to invalid file
                array_push($pending, $this->_filterCaptionAsset($caption, $caption->captionUrl, null, $contentErrorMessage));
                continue;
            }

            $metadataResponse = $responses[$caption->metadataRequestIndex];
            $contentResponse = $responses[$caption->contentRequestIndex];
            $metadataError = is_a($metadataResponse, ApiException::class);
            $contentError = is_a($contentResponse, ApiException::class);

            if ($metadataError) {
                array_push($pending, $this->_filterCaptionAsset($caption, $caption->captionUrl, null, $metadataErrorMessage));
            } elseif ($contentError) {
                array_push($pending, $this->_filterCaptionAsset($caption, $caption->captionUrl, $metadataResponse->id, $contentErrorMessage));
            } else {
                $results[$caption->id] = $this->_filterCaptionAsset($metadataResponse);
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
                array_push($pending, $this->_filterCaptionAsset($caption, $caption->captionUrl, null, $contentErrorMessage));
            } elseif ($metadataError) {
                array_push($pending, $this->_filterCaptionAsset($caption, null, null, $metadataErrorMessage));
                $this->_deleteLocalUpload($caption->file);
            } else {
                $results[$caption->id] = $this->_filterCaptionAsset($metadataResponse);
                $this->_deleteLocalUpload($caption->file);
            }
        }

        return (object) [
            'pendingCaptions' => $pending,
            'captions' => $results,
        ];
    }

    private function _setCaptionAsDefault($captionAssetId)
    {
        $captionPlugin = CaptionPlugin::get($this->kAdminClient);
        $captionPlugin->captionAsset->setAsDefault($captionAssetId);
    }

    private function _getCaptions($videoEntryId)
    {
        $captionPlugin = CaptionPlugin::get($this->kUserClient);

        $filter = new CaptionAssetFilter();
        $filter->entryIdEqual = $videoEntryId;

        $captionAssets = $captionPlugin->captionAsset->listAction($filter);

        return $captionAssets->objects;
    }

    private function _getCaptionUrl($captionAssetId)
    {
        $captionPlugin = CaptionPlugin::get($this->kAdminClient);

        return $captionPlugin->captionAsset->serve($captionAssetId);
    }

    /**
     * Adds a new caption asset to a Kaltura video and returns its ID.
     *
     * @param object $caption      caption to add
     * @param string $videoEntryId kaltura ID of the video
     */
    private function _createCaptionAsset($caption, $videoEntryId)
    {
        $captionPlugin = CaptionPlugin::get($this->kAdminClient);

        $captionAsset = new CaptionAsset();
        $captionAsset->label = $caption->label;
        $captionAsset->language = $caption->language;
        $captionAsset->displayOnPlayer = $caption->displayOnPlayer;
        if ($caption->file) {
            $captionAsset->format = 'vtt' === $caption->file->extension ? CaptionType::WEBVTT : CaptionType::SRT;
        }

        $response = $captionPlugin->captionAsset->add($videoEntryId, $captionAsset);

        // Save the index of this request to check its response later
        $caption->metadataRequestIndex = $this->kAdminClient->getMultiRequestQueueSize() - 1;

        return $response->id;
    }

    /**
     * Sets the file contents of a Kaltura caption asset from an uploaded file token.
     *
     * @param object $caption        Caption object
     * @param string $captionAssetId Kaltura ID of the caption to update
     * @param string $tokenId        ID of the Kaltura uploaded file token
     */
    private function _setCaptionAssetContent($caption, $captionAssetId, $tokenId)
    {
        $captionPlugin = CaptionPlugin::get($this->kAdminClient);

        $resource = new UploadedFileTokenResource();
        $resource->token = $tokenId;
        $response = $captionPlugin->captionAsset->setContent($captionAssetId, $resource);

        // Save the index of this request to check its response later
        $caption->contentRequestIndex = $this->kAdminClient->getMultiRequestQueueSize() - 1;

        return $response->id;
    }

    /**
     * Filter caption asset fields to return to the user.
     *
     * @param string $overrideCaptionUrl Use this URL instead of requesting the caption URL from Kaltura. Use this for pending captions,
     *                                   to preserve the original user-provided URL.
     * @param string $overrideId         Use this ID instead of $captionAsset->id. Use this for pending captions that were successfully
     *                                   created on Kaltura, to replace the UUID generated on the frontend with the Kaltura ID.
     */
    private function _filterCaptionAsset($captionAsset, $overrideCaptionUrl = null, $overrideId = null, $errorMessage = null)
    {
        $caption = (object) [
            'id' => $overrideId ?? $captionAsset->id,
            'label' => $captionAsset->label,
            'language' => $captionAsset->language,
            'displayOnPlayer' => $captionAsset->displayOnPlayer,
            'captionUrl' => $overrideCaptionUrl ?? $this->_getCaptionUrl($captionAsset->id).'?.'.$captionAsset->fileExt,
        ];
        if (!empty($errorMessage)) {
            $caption->errorMessage = $errorMessage;
        }

        return $caption;
    }

    /**
     * Updates the metadata (language, label, etc) of a Kaltura caption asset.
     *
     * @param object $caption New metadata for the caption
     */
    private function _updateCaptionAsset($caption)
    {
        $captionPlugin = CaptionPlugin::get($this->kAdminClient);

        $captionAsset = new CaptionAsset();
        $captionAsset->id = $caption->id;
        $captionAsset->label = $caption->label;
        $captionAsset->language = $caption->language;
        $captionAsset->displayOnPlayer = $caption->displayOnPlayer;

        $response = $captionPlugin->captionAsset->update($captionAsset->id, $captionAsset);

        // Save the index of this request to check its response later
        $caption->metadataRequestIndex = $this->kAdminClient->getMultiRequestQueueSize() - 1;

        return $response->id;
    }

    private function _deleteCaptionAsset($captionAssetId)
    {
        $captionPlugin = CaptionPlugin::get($this->kAdminClient);
        $captionPlugin->captionAsset->delete($captionAssetId);
    }

    private function _formCaptionsRequest($captions)
    {
        $requests = [];

        foreach ($captions as $caption) {
            $language = in_array($caption->language, $this->getLanguages()) ? $caption->language : Language::UN;

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
    private function _uploadFile($file, $allowedExtensions, $throwErrors, $errorIfNotLocal = false)
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
        $token = $this->kAdminClient->uploadToken->add($uploadToken);
        $upload = $this->kAdminClient->uploadToken->upload($token->id, $file->file_path);

        return $token->id;
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
        $nodeMeta = $node->getMeta();
        if ('video' === $nodeMeta->mediaType) {
            $node->set((object) ['mediaFormat' => 'kaltura']);
            $typeData = $node->getTypeData();
            $typeData->mediaURL = $kalturaData->dataUrl.'?.mp4';
            $typeData->kalturaId = $kalturaData->id;
            $typeData->videoPlayer = $useKalturaPlayer ? 'kaltura' : 'regular';
        } elseif ('h5p' === $nodeMeta->mediaType) {
            TapestryH5P::updateVideoURL($node, $kalturaData->dataUrl);
        }

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

        $fileObj = TapestryHelpers::getVideoPath($node);
        $fileSize = TapestryHelpers::getRealFileSize($fileObj->file_path);

        return $fileSize <= $user_defined_max_upload_size;
    }

    /**
     * Checks if a node with video content can be uploaded to Kaltura.
     * Only H5P or Video nodes whose videos are local uploads can be transferred to Kaltura.
     *
     * @param TapestryNode $node
     *
     * @return bool
     */
    public static function videoCanBeUploaded($node)
    {
        $nodeMeta = $node->getMeta();

        if ('video' === $nodeMeta->mediaType) {
            // URL videos can be uploaded if mediaURL is a local upload on this site
            return TapestryHelpers::isLocalUpload($node->getTypeData()->mediaURL);
        } elseif (H5P_DEFINED && 'h5p' === $nodeMeta->mediaType) {
            // H5P videos can be uploaded if the video 'path' attribute is a relative path
            return TapestryH5P::hasRelativeVideoUrl($node);
        }

        return false;
    }
}
