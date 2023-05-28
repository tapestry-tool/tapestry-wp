<?php

require_once __DIR__ . '/../classes/class.tapestry-node.php';
require_once __DIR__ . '/../classes/class.kaltura-api.php';
require_once __DIR__ . '/../utilities/class.tapestry-errors.php';
require_once __DIR__ . '/../utilities/class.tapestry-helpers.php';

use Kaltura\Client\Enum\EntryStatus;

class KalturaConstants
{
    // When updating STOP_UPLOAD_OPTION, autoload should be set to false
    // so that we can clear the option from the cache when needed
    public const STOP_UPLOAD_OPTION = 'tapestry_kaltura_stop_upload_requested';

    public const IN_PROGRESS_OPTION = 'tapestry_kaltura_upload_in_progress';
    public const LATEST_TAPESTRY_OPTION = 'tapestry_kaltura_upload_tapestry_id';
    public const UPLOAD_LOG_OPTION = 'tapestry_kaltura_upload_log';
    public const UPLOAD_ERROR_OPTION = 'tapestry_kaltura_upload_error';
    public const YES_VALUE = 'yes';
    public const NO_VALUE = 'no';
    public const UPLOAD_BATCH_SIZE = 10;
}

class KalturaUploadStatus
{
    public const NOT_STARTED = 'Not started';
    public const UPLOADING = 'Uploading';
    public const CONVERTING = 'Converting';
    public const COMPLETE = 'Complete';
    public const CANCELED = 'Canceled';
    public const ERROR = 'Error';
}

class KalturaEndpoints
{
    public static function getRoutes()
    {
        $REST_API_GET_METHOD = 'GET';
        $REST_API_POST_METHOD = 'POST';
        $REST_API_PUT_METHOD = 'PUT';
        $REST_API_DELETE_METHOD = 'DELETE';

        return [
            'UPLOAD_VIDEO_TO_KALTURA' => (object) [
                'ROUTE' => '/kaltura/video',
                'ARGUMENTS' => [
                    'methods' => $REST_API_POST_METHOD,
                    'callback' => 'KalturaEndpoints::uploadVideoToKaltura',
                    'permission_callback' => 'KalturaEndpoints::canUploadToKaltura',
                ],
            ],
            'GET_KALTURA_VIDEO_STATUS' => (object) [
                'ROUTE' => '/kaltura/video/status',
                'ARGUMENTS' => [
                    'methods' => $REST_API_GET_METHOD,
                    'callback' => 'KalturaEndpoints::checkKalturaVideoExists',
                ],
            ],
            'GET_KALTURA_VIDEO_META' => (object) [
                'ROUTE' => '/kaltura/video/meta',
                'ARGUMENTS' => [
                    'methods' => $REST_API_GET_METHOD,
                    'callback' => 'KalturaEndpoints::getKalturaVideoMeta',
                ],
            ],
            'UPLOAD_VIDEOS_TO_KALTURA' => (object) [
                'ROUTE' => '/kaltura/videos',
                'ARGUMENTS' => [
                    'methods' => $REST_API_POST_METHOD,
                    'callback' => 'KalturaEndpoints::uploadVideosToKaltura',
                    'permission_callback' => 'KalturaEndpoints::canUploadToKaltura',
                ],
            ],
            'UPDATE_CONVERTING_VIDEOS' => (object) [
                'ROUTE' => '/kaltura/videos/converting',
                'ARGUMENTS' => [
                    'methods' => $REST_API_POST_METHOD,
                    'callback' => 'KalturaEndpoints::updateConvertingVideos',
                    'permission_callback' => 'KalturaEndpoints::canUploadToKaltura',
                ],
            ],
            'GET_KALTURA_UPLOAD_LOG' => (object) [
                'ROUTE' => '/kaltura/videos/log',
                'ARGUMENTS' => [
                    'methods' => $REST_API_GET_METHOD,
                    'callback' => 'KalturaEndpoints::getKalturaUploadLog',
                    'permission_callback' => 'KalturaEndpoints::canUploadToKaltura',
                ],
            ],
            'GET_KALTURA_UPLOAD_STATUS' => (object) [
                'ROUTE' => '/kaltura/videos/status',
                'ARGUMENTS' => [
                    'methods' => $REST_API_GET_METHOD,
                    'callback' => 'KalturaEndpoints::getKalturaUploadStatus',
                    'permission_callback' => 'KalturaEndpoints::canUploadToKaltura',
                ],
            ],
            'RESET_UPLOAD_STATUS' => (object) [
                'ROUTE' => '/kaltura/videos/status',
                'ARGUMENTS' => [
                    'methods' => $REST_API_DELETE_METHOD,
                    'callback' => 'KalturaEndpoints::forceResetUploadStatus',
                    'permission_callback' => 'KalturaEndpoints::canUploadToKaltura',
                ],
            ],
            'CLEAR_UPLOAD_ERROR' => (object) [
                'ROUTE' => '/kaltura/videos/status/error',
                'ARGUMENTS' => [
                    'methods' => $REST_API_DELETE_METHOD,
                    'callback' => 'KalturaEndpoints::clearUploadError',
                    'permission_callback' => 'KalturaEndpoints::canUploadToKaltura',
                ],
            ],
            'STOP_KALTURA_UPLOAD' => (object) [
                'ROUTE' => '/kaltura/videos/stop',
                'ARGUMENTS' => [
                    'methods' => $REST_API_POST_METHOD,
                    'callback' => 'KalturaEndpoints::stopKalturaUpload',
                    'permission_callback' => 'KalturaEndpoints::canUploadToKaltura',
                ],
            ],
            'GET_VIDEOS_TO_UPLOAD_TO_KALTURA' => (object) [
                'ROUTE' => '/kaltura/videos_to_upload',
                'ARGUMENTS' => [
                    'methods' => $REST_API_GET_METHOD,
                    'callback' => 'KalturaEndpoints::getVideosToUpload',
                    'permission_callback' => 'KalturaEndpoints::canUploadToKaltura',
                ],
            ],
            'GET_KALTURA_AVAILABLE_LANGUAGES' => (object) [
                'ROUTE' => '/kaltura/languages',
                'ARGUMENTS' => [
                    'methods' => $REST_API_GET_METHOD,
                    'callback' => 'KalturaEndpoints::getLanguages',
                ],
            ],
            'GET_KALTURA_VIDEO_CAPTIONS' => (object) [
                'ROUTE' => '/kaltura/video/captions',
                'ARGUMENTS' => [
                    'methods' => $REST_API_GET_METHOD,
                    'callback' => 'KalturaEndpoints::getVideoCaptions',
                ],
            ],
            'PUT_KALTURA_VIDEO_CAPTIONS' => (object) [
                'ROUTE' => '/kaltura/video/captions',
                'ARGUMENTS' => [
                    'methods' => $REST_API_PUT_METHOD,
                    'callback' => 'KalturaEndpoints::updateVideoCaptions',
                ],
            ],
        ];
    }

    public static function canUploadToKaltura()
    {
        if (defined('TAPESTRY_USE_DEV_MODE') && !empty(TAPESTRY_USE_DEV_MODE)) {
            return true;
        }

        $user = wp_get_current_user();
        return in_array("administrator", (array) $user->roles);
    }

    /**
     * Upload video to Kaltura and return Kaltura ID.
     *
     * If nodeMetaId specified, requires permission to edit that node.
     * Otherwise, requires same permissions as adding nodes.
     */
    public static function uploadVideoToKaltura($request)
    {
        $tapestryPostId = $request['tapestryPostId'];
        $nodeMetaId = $request['nodeMetaId'];

        try {
            if (!TapestryHelpers::isValidTapestry($tapestryPostId)) {
                throw new TapestryError('INVALID_POST_ID');
            }

            if (!LOAD_KALTURA) {
                throw new TapestryError('KALTURA_NOT_AVAILABLE');
            }

            if (empty($nodeMetaId)) {
                $tapestry = new Tapestry($tapestryPostId);
                if ($tapestry->isEmpty()) {
                    $user = new TapestryUser();
                    if (!$user->canEdit($tapestryPostId)) {
                        throw new TapestryError('ADD_NODE_PERMISSION_DENIED');
                    }
                }
            } elseif (!TapestryHelpers::userIsAllowed('EDIT', $nodeMetaId, $tapestryPostId)) {
                throw new TapestryError('EDIT_NODE_PERMISSION_DENIED');
            }

            $file_params = $request->get_file_params();
            $file_path = $file_params['file']['tmp_name'];

            $file_obj = (object) [
                'file_path' => $file_path,
                'name' => $file_params['file']['name'],
            ];

            $category = KalturaApi::getKalturaCategoryName(new Tapestry($tapestryPostId));
            $kalturaApi = new KalturaApi();
            $response = $kalturaApi->uploadVideo($file_obj, $category);

            while ($response->status === EntryStatus::PRECONVERT && $response->duration === 0) {
                // Wait for the video's duration to load (or conversion to error out/complete)
                sleep(5);
                $response = $kalturaApi->getVideo($response->id);
            }

            return $response->id;
        } catch (TapestryError $e) {
            return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
        }
    }

    /**
     * Starts uploading a list of videos from local server to Kaltura.
     * Does nothing if an upload is already in progress.
     *
     * @param object $request   HTTP request
     *                          Request body should specify the list of videos to upload and
     *                          whether to switch uploaded videos to the Kaltura media player.
     *
     * Example request body:
     * {
     *  tapestryID: 7746,
     *  nodeIDs: [13004, 13005],
     *  useKalturaPlayer: false
     * }
     */
    public static function uploadVideosToKaltura($request)
    {
        $uploadRequest = json_decode($request->get_body());
        if (!is_object($uploadRequest)) {
            return;
        }

        $tapestryPostId = (int) $uploadRequest->tapestryID;
        $nodeIds = $uploadRequest->nodeIDs;
        $useKalturaPlayer = $uploadRequest->useKalturaPlayer;
        if (empty($tapestryPostId) || empty($nodeIds) || !isset($useKalturaPlayer)) {
            return;
        }

        try {
            if (!TapestryHelpers::isValidTapestry($tapestryPostId)) {
                throw new TapestryError('INVALID_POST_ID');
            }

            if (!LOAD_KALTURA) {
                throw new TapestryError('KALTURA_NOT_AVAILABLE');
            }

            $uploadInProgress = get_option(KalturaConstants::IN_PROGRESS_OPTION);

            if ($uploadInProgress === false) {
                // False return value means option does not exist in database yet
                add_option(KalturaConstants::IN_PROGRESS_OPTION, KalturaConstants::NO_VALUE);
            } elseif ($uploadInProgress !== KalturaConstants::NO_VALUE) {
                return;
            }

            update_option(KalturaConstants::IN_PROGRESS_OPTION, KalturaConstants::YES_VALUE);
            update_option(KalturaConstants::LATEST_TAPESTRY_OPTION, $tapestryPostId);
            update_option(KalturaConstants::STOP_UPLOAD_OPTION, KalturaConstants::NO_VALUE, false);
            update_option(KalturaConstants::UPLOAD_ERROR_OPTION, '');

            add_action('shutdown', 'KalturaEndpoints::cleanupKalturaUploadStatus');

            $uploadCount = (object) [
                'total' => 1,
                'success' => 0,
                'error' => 1,
            ];
            try {
                $uploadCount = self::_performBatchedUploadToKaltura($tapestryPostId, $nodeIds, $useKalturaPlayer);
            } catch (Throwable $e) {
                error_log($e->getMessage());
                update_option(KalturaConstants::UPLOAD_ERROR_OPTION, $e->getMessage());
            } finally {
                update_option(KalturaConstants::IN_PROGRESS_OPTION, KalturaConstants::NO_VALUE);
                update_option(KalturaConstants::STOP_UPLOAD_OPTION, KalturaConstants::NO_VALUE, false);

                $tapestry = new Tapestry($tapestryPostId);
                $tapestry->set((object) ['notifications' => (object) [
                    'kaltura' => $uploadCount,
                ]]);
                $tapestry->save();
            }
        } catch (TapestryError $e) {
            return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
        }
    }

    /**
     * Gets Kaltura upload status
     */
    public static function getKalturaUploadStatus($request)
    {
        $inProgress = get_option(KalturaConstants::IN_PROGRESS_OPTION) === KalturaConstants::YES_VALUE;
        $latestTapestryPostId = get_option(KalturaConstants::LATEST_TAPESTRY_OPTION, '');
        $error = get_option(KalturaConstants::UPLOAD_ERROR_OPTION, '');
        return (object) [
            'inProgress' => $inProgress,
            'latestTapestryID' => $latestTapestryPostId,
            'error' => !empty($error),
        ];
    }

    /**
     * Clears Kaltura upload status
     */
    public static function cleanupKalturaUploadStatus()
    {
        update_option(KalturaConstants::IN_PROGRESS_OPTION, KalturaConstants::NO_VALUE);

        $error = error_get_last();
        if ($error['type'] === E_ERROR) {
            // If interrupted by a fatal error, save the error to notify the user
            update_option(KalturaConstants::UPLOAD_ERROR_OPTION, $error['message']);
        }
    }

    /**
     * Gets Kaltura upload log for a particular Tapestry.
     *
     * Query parameters (pagination):
     * - page = which page to return
     * - count = number of entries per page; if count = 0, returns all entries
     *
     * @param object $request   HTTP request
     *
     * @return object
     *
     * Example response body:
     * {
     *  videos: [
     *   {
     *     tapestryID: 7746,
     *     nodeID: 13004,
     *     nodeTitle: "Video",
     *     uploadStatus: "Converting",
     *     kalturaID: "0_c7syr9zv",
     *     additionalInfo: ""
     *     timestamp: "2022-08-22 13:39:23"
     *   }
     *  ],
     *  totalCount: 10,
     * }
     */
    public static function getKalturaUploadLog($request)
    {
        $tapestryPostId = $request['tapestryPostId'];

        // Pagination
        $page = (int) $request['page'];
        $perPage = (int) $request['count'];

        try {
            if (empty($tapestryPostId) || !TapestryHelpers::isValidTapestry($tapestryPostId)) {
                throw new TapestryError('INVALID_POST_ID');
            }

            $videos = get_option(KalturaConstants::UPLOAD_LOG_OPTION, []);
            if (!is_array($videos)) {
                $videos = [];
            }

            $videos = array_filter($videos, function ($video) use ($tapestryPostId) {
                return $video->tapestryID == $tapestryPostId;
            });
            $videos = array_reverse($videos); // Return entries in reverse chronological order
            $totalCount = count($videos);

            if ($perPage > 0) {
                $videos = array_slice($videos, ($page - 1) * $perPage, $perPage);
            }

            $datetime = new DateTime("now", wp_timezone());
            foreach ($videos as $video) {
                // Convert Unix timestamp to human-readable string, following Wordpress site timezone
                $datetime->setTimestamp($video->timestamp);
                $video->uploadTime = $datetime->format('Y-m-d H:i:s');
                unset($video->timestamp);
            }

            return (object) [
                'videos' => $videos,
                'totalCount' => $totalCount,    // Number of videos in all pages
            ];
        } catch (TapestryError $e) {
            return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
        }
    }

    /**
     * Forcefully sets the upload to "not in progress".
     * Should only be used as a last resort to fix upload issues.
     */
    public static function forceResetUploadStatus($request)
    {
        update_option(KalturaConstants::IN_PROGRESS_OPTION, KalturaConstants::NO_VALUE);
        return (object) [
            'success' => get_option(KalturaConstants::IN_PROGRESS_OPTION) === KalturaConstants::NO_VALUE,
        ];
    }

    /**
     * Clear the upload error.
     */
    public static function clearUploadError($request)
    {
        update_option(KalturaConstants::UPLOAD_ERROR_OPTION, '');
        return (object) [
            'success' => get_option(KalturaConstants::UPLOAD_ERROR_OPTION) === '',
        ];
    }

    /**
     * Gets all videos in a Tapestry that can be uploaded to Kaltura.
     * If tapestryPostId query parameter is not set, gets uploadable videos in all Tapestries.
     *
     * @param object $request   HTTP request
     * @return array
     *
     * Example response body:
     * [
     *  { tapestryID: 7746, nodeID: 13004, nodeTitle: "Video", withinSizeLimit: true }
     * ]
     */
    public static function getVideosToUpload($request)
    {
        try {
            $tapestryPostId = $request['tapestryPostId'];
            return self::_getVideosToUpload($tapestryPostId);
        } catch (TapestryError $e) {
            return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
        }
    }

    public static function updateConvertingVideos($request)
    {
        $body = json_decode($request->get_body());
        $useKalturaPlayer = $body->useKalturaPlayer;

        $kalturaApi = new KalturaApi();

        $tapestries = get_posts(['post_type' => 'tapestry', 'numberposts' => -1]);
        $videos = array();

        foreach ($tapestries as $post) {
            $tapestry = new Tapestry($post->ID);

            foreach ($tapestry->getNodeIds() as $nodeID) {
                $node = $tapestry->getNode($nodeID);
                $kalturaData = $node->getTypeData()->kalturaData;

                if (isset($kalturaData)
                    && is_array($kalturaData)
                    && array_key_exists('id', $kalturaData)
                    && array_key_exists('uploadStatus', $kalturaData)
                    && $kalturaData['uploadStatus'] === KalturaUploadStatus::CONVERTING) {
                    $kalturaID = $kalturaData['id'];
                    $response = $kalturaApi->getVideo($kalturaID);

                    $video = (object) [
                        'tapestryID' => $post->ID,
                        'nodeID' => $nodeID,
                        'nodeTitle' => $node->getTitle(),
                        'kalturaID' => $kalturaID,
                        'previousStatus' => KalturaUploadStatus::CONVERTING,
                        'currentStatus' => KalturaUploadStatus::CONVERTING,
                        'additionalInfo' => '',
                    ];

                    if ($response->status === EntryStatus::READY) {
                        self::_saveVideoUploadStatusInNode($node, KalturaUploadStatus::COMPLETE, $response);

                        $file_path = TapestryHelpers::getPathToMedia($node->getTypeData()->mediaURL)->file_path;
                        KalturaApi::saveAndDeleteLocalVideo($node, $response, $useKalturaPlayer, $file_path);

                        $video->currentStatus = KalturaUploadStatus::COMPLETE;
                    } elseif ($response->status !== EntryStatus::PRECONVERT) {
                        self::_saveVideoUploadStatusInNode($node, KalturaUploadStatus::ERROR, $response);
                        $video->currentStatus = KalturaUploadStatus::ERROR;
                        if ($response->status === EntryStatus::ERROR_CONVERTING) {
                            $video->additionalInfo = 'An error occurred: Could not convert the video.';
                        } else {
                            $video->additionalInfo = 'An error occurred: Expected the video to be converting, but it was not.';
                        }
                    }

                    array_push($videos, $video);
                }
            }
        }

        // Update the upload log so the user sees the latest statuses
        self::_amendUploadLog($videos);

        // Clear the upload error
        update_option(KalturaConstants::UPLOAD_ERROR_OPTION, '');

        return (object) [
            'processedVideos' => $videos,
        ];
    }

    /**
     * Sends a signal to stop an ongoing Kaltura upload.
     */
    public static function stopKalturaUpload($request)
    {
        // This will create the option if it doesn't exist
        update_option(KalturaConstants::STOP_UPLOAD_OPTION, KalturaConstants::YES_VALUE, false);
    }

    /**
     * Checks whether a Kaltura video with given entry id exists.
     *
     * @return bool Response: true if the video exists, and false otherwise.
     */
    public static function checkKalturaVideoExists($request)
    {
        try {
            if (!LOAD_KALTURA) {
                throw new TapestryError('KALTURA_NOT_AVAILABLE');
            }

            $entryId = $request['entry_id'];

            $kalturaApi = new KalturaApi();
            $result = $kalturaApi->getVideo($entryId);

            if ($result != null) {
                return true;
            }
            return false;
        } catch (TapestryError $e) {
            return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
        }
    }

    /**
     * If a Kaltura video with given entry id exists, returns the video metadata.
     *
     * Example response body:
     * {
     *  "image": "https://streaming.video.ubc.ca/p/186/sp/18600/thumbnail/entry_id/0_p5er0usa/version/100002",
     *  "duration": 126
     * }
     *
     * @return - HTTP response: a video metadata object if the entry id is valid, and false otherwise.
     */
    public static function getKalturaVideoMeta($request)
    {
        try {
            if (!LOAD_KALTURA) {
                throw new TapestryError('KALTURA_NOT_AVAILABLE');
            }

            $entryId = $request['entry_id'];

            $kalturaApi = new KalturaApi();
            $result = $kalturaApi->getVideo($entryId);

            if ($result != null) {
                return array("image" => $result->thumbnailUrl, "duration" => $result->duration);
            }
            return false;
        } catch (TapestryError $e) {
            return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
        }
    }

    public static function getLanguages($request)
    {
        try {
            if (!LOAD_KALTURA) {
                throw new TapestryError('KALTURA_NOT_AVAILABLE');
            }
    
            $kaltura_api = new KalturaApi();
            return $kaltura_api->getLanguages();
        } catch (TapestryError $e) {
            return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
        }
    }

    public static function getVideoCaptions($request)
    {
        try {
            if (!LOAD_KALTURA) {
                throw new TapestryError('KALTURA_NOT_AVAILABLE');
            }
    
            $video_entry_id = $request['entry_id'];
    
            $kaltura_api = new KalturaApi();
            return $kaltura_api->getCaptionsAndDefaultCaption($video_entry_id);
        } catch (TapestryError $e) {
            return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
        }
    }

    public static function updateVideoCaptions($request)
    {
        try {
            if (!LOAD_KALTURA) {
                throw new TapestryError('KALTURA_NOT_AVAILABLE');
            }
    
            $video_entry_id = $request['entry_id'];
            $body = json_decode($request->get_body());
            $captions = $body->captions;
            $default_caption_id = $body->defaultCaptionId;
    
            if (!isset($captions) || !is_array($captions)) {
                return null;
            }
    
            try {
                $kaltura_api = new KalturaApi();
                return $kaltura_api->setCaptionsAndDefaultCaption($video_entry_id, $captions, $default_caption_id, true);
            } catch (TapestryError $e) {
                return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
            }
        } catch (TapestryError $e) {
            return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
        }
    }
    
    /*******************************************************/
    /**                 PRIVATE FUNCTIONS                 **/
    /*******************************************************/

    /**
     * Save Kaltura upload status
     */
    private static function _saveVideoUploadStatus($video, $videosToUpload, $newStatus, $kalturaData = null)
    {
        $video->uploadStatus = $newStatus;
        self::_updateUploadLog($videosToUpload);

        $node = new TapestryNode($video->tapestryID, $video->nodeID);
        self::_saveVideoUploadStatusInNode($node, $newStatus, $kalturaData);
        return $node;
    }

    /**
     * Update the Kaltura upload status of a video node.
     *
     * @param TapestryNode      $node           Video node to update
     * @param string            $newStatus      Upload status
     * @param MediaEntry|null   $kalturaData    (optional) Response from Kaltura API
     */
    private static function _saveVideoUploadStatusInNode($node, $newStatus, $kalturaData = null)
    {
        $typeData = $node->getTypeData();
        $typeData->kalturaData['uploadStatus'] = $newStatus;

        if ($kalturaData) {
            $typeData->kalturaData['id'] = $kalturaData->id;
        }

        $node->save();
    }

    private static function _amendUploadLog($updated_videos)
    {
        $node_map = (object) [];

        foreach ($updated_videos as $video) {
            $node_key = $video->tapestryID.'-'.$video->nodeID;
            $node_map->{$node_key} = $video;
        }

        $uploadLog = get_option(KalturaConstants::UPLOAD_LOG_OPTION, []);

        // Update the most recent entry in the upload log for each video
        for (end($uploadLog); key($uploadLog) !== null && !empty($node_map); prev($uploadLog)) {
            $video = current($uploadLog);

            $node_key = $video->tapestryID.'-'.$video->nodeID;
            $updated_node = $node_map->{$node_key};

            if ($updated_node) {
                $video->uploadStatus = $updated_node->currentStatus;
                $video->additionalInfo = $updated_node->additionalInfo;

                unset($node_map->{$node_key});
            }
        }
        update_option(KalturaConstants::UPLOAD_LOG_OPTION, $uploadLog);
    }

    /**
     * Return all videos that can be uploaded to Kaltura.
     * If Tapestry ID provided, returns only videos in that Tapestry.
     * Otherwise, returns uploadable videos in all Tapestries.
     *
     * @param int|string $tapestryPostId    Tapestry ID
     *
     * @return array
     */
    private static function _getVideosToUpload($tapestryPostId)
    {
        if (empty($tapestryPostId)) {
            $tapestries = get_posts(['post_type' => 'tapestry', 'numberposts' => -1]);
            $videosToUpload = array();

            foreach ($tapestries as $tapestry) {
                $videosToUpload = array_merge($videosToUpload, self::_getVideosToUploadInTapestry($tapestry->ID));
            }

            return $videosToUpload;
        } else {
            return self::_getVideosToUploadInTapestry($tapestryPostId);
        }
    }

    private static function _getVideosToUploadInTapestry($tapestryPostId)
    {
        $videosToUpload = array();
        $tapestry = new Tapestry($tapestryPostId);

        foreach ($tapestry->getNodeIds() as $nodeID) {
            $node = new TapestryNode($tapestryPostId, $nodeID);
            if (TapestryHelpers::videoCanBeUploaded($node)) {
                $video = (object) [
                'tapestryID' => (int) $tapestryPostId,
                'nodeID' => $nodeID,
                'nodeTitle' => $node->getTitle(),
                'withinSizeLimit' => KalturaApi::checkVideoFileSize($node),
            ];
                array_push($videosToUpload, $video);
            }
        }

        return $videosToUpload;
    }

    /**
     * Uploads videos to Kaltura.
     *
     * Video files are transferred up to UPLOAD_BATCH_SIZE at a time.
     * At the end of each batch, waits synchronously for all videos in the batch to finish converting (or error),
     * before uploading the next batch.
     *
     * @param string $tapestryPostId        ID of the Tapestry for which the upload request is being made.
     * @param array $nodeIds            IDs of the nodes to upload.
     *                                   Nodes are checked to be videos and to be local Wordpress uploads before being uploaded to Kaltura.
     * @param bool $useKalturaPlayer   Whether to switch uploaded videos to use the Kaltura media player.
     *
     * @return int The number of videos that were successfully uploaded.
     */
    private static function _performBatchedUploadToKaltura($tapestryPostId, $nodeIds, $useKalturaPlayer)
    {
        $category = KalturaApi::getKalturaCategoryName(new Tapestry($tapestryPostId));

        $videosToUpload = self::_createUploadQueue($tapestryPostId, $nodeIds);
        self::_addToUploadLog($videosToUpload);

        $kalturaApi = new KalturaApi();

        $numSuccessfullyUploaded = 0;
        $numUploadedWithError = 0;
        $batchStart = 0;

        for ($batchStart; $batchStart < count($videosToUpload); $batchStart += KalturaConstants::UPLOAD_BATCH_SIZE) {
            // Retrieve fresh value without caching, since we expect the option value to change underneath
            $GLOBALS['wp_object_cache']->delete(KalturaConstants::STOP_UPLOAD_OPTION, 'options');
            $stop_requested = get_option(KalturaConstants::STOP_UPLOAD_OPTION);
            if ($stop_requested === KalturaConstants::YES_VALUE) {
                break;
            }

            $batch = array_slice($videosToUpload, $batchStart, KalturaConstants::UPLOAD_BATCH_SIZE);

            foreach ($batch as $video) {
                self::_saveVideoUploadStatus($video, $videosToUpload, KalturaUploadStatus::UPLOADING);

                $kalturaData = null;
                try {
                    $kalturaData = $kalturaApi->uploadVideo($video->file, $category);
                } catch (Throwable $e) {
                    $error_msg = "Unable to upload video '".$video->file->name."' to Kaltura due to: ".$e->getMessage();

                    error_log($error_msg."\nStack trace: \n".$e->getTraceAsString());

                    $video->additionalInfo = $error_msg;
                    self::_saveVideoUploadStatus($video, $videosToUpload, KalturaUploadStatus::ERROR);
                    $numUploadedWithError++;
                    continue;
                }

                $video->kalturaID = $kalturaData->id;
                self::_saveVideoUploadStatus($video, $videosToUpload, KalturaUploadStatus::CONVERTING, $kalturaData);
            }

            // Filter out videos that did not successfully upload so we don't get an infinite loop
            $remainingVideos = array_filter($batch, function ($vid) {
                return $vid->uploadStatus === KalturaUploadStatus::CONVERTING;
            });

            while (count($remainingVideos) > 0) {
                sleep(5);
                $videosToRemove = array();

                foreach ($remainingVideos as $video) {
                    $response = $kalturaApi->getVideo($video->kalturaID);

                    if ($response->status === EntryStatus::PRECONVERT) {
                        // Still converting
                        continue;
                    }

                    if ($response->status === EntryStatus::READY) {
                        $node = self::_saveVideoUploadStatus($video, $videosToUpload, KalturaUploadStatus::COMPLETE);
                        KalturaApi::saveAndDeleteLocalVideo($node, $response, $useKalturaPlayer, $video->file->file_path);
                        $numSuccessfullyUploaded++;

                        $failedCaptions = self::_uploadVideoCaptions($node, $kalturaApi, $response);
                        if ($failedCaptions > 0) {
                            $plural = $failedCaptions !== 1 ? 's' : '';
                            $video->additionalInfo = $failedCaptions . ' caption' . $plural . ' failed to upload. Please edit the node to check.';
                            self::_saveVideoUploadStatus($video, $videosToUpload, KalturaUploadStatus::COMPLETE, null, false);
                        }
                    } elseif ($response->status === EntryStatus::ERROR_CONVERTING) {
                        $video->additionalInfo = 'An error occurred: Could not convert the video.';
                        self::_saveVideoUploadStatus($video, $videosToUpload, KalturaUploadStatus::ERROR);
                        $numUploadedWithError++;
                    } else {
                        $video->additionalInfo = 'An error occurred: Expected the video to be converting, but it was not.';
                        self::_saveVideoUploadStatus($video, $videosToUpload, KalturaUploadStatus::ERROR);
                        $numUploadedWithError++;
                    }

                    array_push($videosToRemove, $video);
                }

                $remainingVideos = array_udiff($remainingVideos, $videosToRemove, function ($video1, $video2) {
                    if ($video1->tapestryID > $video2->tapestryID) {
                        return 1;
                    } elseif ($video1->tapestryID < $video2->tapestryID) {
                        return -1;
                    } else {
                        return $video1->nodeID - $video2->nodeID;
                    }
                });
            }
        }

        // Mark remaining videos as canceled, if any
        for ($i = $batchStart; $i < count($videosToUpload); $i++) {
            self::_saveVideoUploadStatus($videosToUpload[$i], $videosToUpload, KalturaUploadStatus::CANCELED);
        }

        return (object) [
            'total' => $numSuccessfullyUploaded + $numUploadedWithError,
            'success' => $numSuccessfullyUploaded,
            'error' => $numUploadedWithError,
        ];
    }

    /**
     * Initializes the list of videos to upload.
     * Silently excludes provided videos that are not suitable for upload.
     */
    private static function _createUploadQueue($tapestryPostId, $nodeIds)
    {
        $uploadLog = array();
        $timestamp = time(); // Videos in the same upload should be identifiable by the upload time

        foreach ($nodeIds as $nodeId) {
            $node = new TapestryNode($tapestryPostId, $nodeId);
            if (TapestryHelpers::videoCanBeUploaded($node) && KalturaApi::checkVideoFileSize($node)) {
                array_push($uploadLog, (object) [
                    'tapestryID' => $tapestryPostId,
                    'nodeID' => $nodeId,
                    'nodeTitle' => $node->getTitle(),
                    'uploadStatus' => KalturaUploadStatus::NOT_STARTED,
                    'file' => TapestryHelpers::getPathToMedia($node->getTypeData()->mediaURL),
                    'kalturaID' => '',
                    'additionalInfo' => '',
                    'timestamp' => $timestamp,
                ]);

                $node->getTypeData()->kalturaData = array('uploadStatus' => KalturaUploadStatus::NOT_STARTED);
                $node->save();
            }
        }

        return $uploadLog;
    }

    // Filter the logged videos so that certain information (e.g. the file path of the videos) is not returned
    private static function _filterLoggedVideos($videos)
    {
        return array_map(function ($video) {
            return (object) [
                'tapestryID' => $video->tapestryID,
                'nodeID' => $video->nodeID,
                'nodeTitle' => $video->nodeTitle,
                'uploadStatus' => $video->uploadStatus,
                'kalturaID' => $video->kalturaID,
                'additionalInfo' => $video->additionalInfo,
                'timestamp' => $video->timestamp,
            ];
        }, $videos);
    }

    private static function _addToUploadLog($videos)
    {
        $uploadLog = get_option(KalturaConstants::UPLOAD_LOG_OPTION);
        if (!is_array($uploadLog)) {
            $uploadLog = [];
        }

        array_push($uploadLog, ...self::_filterLoggedVideos($videos));
        update_option(KalturaConstants::UPLOAD_LOG_OPTION, $uploadLog);
    }

    private static function _updateUploadLog($videos)
    {
        $uploadLog = get_option(KalturaConstants::UPLOAD_LOG_OPTION);
        if (!is_array($uploadLog)) {
            $uploadLog = [];
        }

        // Replace the same videos at the end of the list
        array_splice($uploadLog, -count($videos), count($uploadLog), self::_filterLoggedVideos($videos));
        update_option(KalturaConstants::UPLOAD_LOG_OPTION, $uploadLog);
    }

    private static function _uploadVideoCaptions($node, $kalturaApi, $kalturaData)
    {
        $typeData = $node->getTypeData();
        $captions = $typeData->captions;
        if (!isset($captions) || !is_array($captions)) {
            return 0;
        }

        try {
            $captionData = $kalturaApi->setCaptionsAndDefaultCaption($kalturaData->id, $captions, $typeData->defaultCaptionId, false);

            $typeData->captions = $captionData->captions;
            $typeData->pendingCaptions = $captionData->pendingCaptions;
            $typeData->defaultCaptionId = $captionData->defaultCaptionId;
        } catch (TapestryError $e) {
            $typeData->pendingCaptions = $captions;
        }

        $node->save();

        return count($typeData->pendingCaptions);
    }
}
