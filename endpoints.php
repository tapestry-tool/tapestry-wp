<?php

/**
 * Tapestry Endpoints.
 */
require_once __DIR__.'/utilities/class.tapestry-permissions.php';
require_once __DIR__.'/classes/class.tapestry.php';
require_once __DIR__.'/classes/class.tapestry-node.php';
require_once __DIR__.'/classes/class.tapestry-group.php';
require_once __DIR__.'/classes/class.tapestry-user-progress.php';
require_once __DIR__.'/classes/class.tapestry-audio.php';
require_once __DIR__.'/classes/class.tapestry-h5p.php';
require_once __DIR__.'/classes/class.constants.php';
require_once __DIR__.'/classes/class.kaltura-api.php';
require_once __DIR__.'/utilities/class.tapestry-user.php';

use Kaltura\Client\Enum\EntryStatus;

$REST_API_NAMESPACE = 'tapestry-tool/v1';

$REST_API_GET_METHOD = 'GET';
$REST_API_POST_METHOD = 'POST';
$REST_API_PUT_METHOD = 'PUT';
$REST_API_DELETE_METHOD = 'DELETE';

$REST_API_ENDPOINTS = [
    'POST_TAPESTRY_NODE' => (object) [
        'ROUTE' => '/tapestries/(?P<tapestryPostId>[\d]+)/nodes',
        'ARGUMENTS' => [
            'methods' => $REST_API_POST_METHOD,
            'callback' => 'addTapestryNode',
        ],
    ],
    'POST_TAPESTRY_NODE_REVIEW' => (object) [
        'ROUTE' => '/tapestries/(?P<tapestryPostId>[\d]+)/nodes/(?P<nodeMetaId>[\d]+)/review',
        'ARGUMENTS' => [
            'methods' => $REST_API_POST_METHOD,
            'callback' => 'addTapestryNodeReview',
        ],
    ],
    'POST_TAPESTRY' => (object) [
        'ROUTE' => '/tapestries',
        'ARGUMENTS' => [
            'methods' => $REST_API_POST_METHOD,
            'callback' => 'addTapestry',
            'permission_callback' => 'TapestryPermissions::postTapestry',
        ],
    ],
    'DELETE_TAPESTRY' => (object) [
        'ROUTE' => '/tapestries',
        'ARGUMENTS' => [
            'methods' => $REST_API_DELETE_METHOD,
            'callback' => 'deleteTapestry',
        ],
    ],
    'GET_TAPESTRY' => (object) [
        'ROUTE' => '/tapestries/(?P<tapestryPostId>[\d]+)',
        'ARGUMENTS' => [
            'methods' => $REST_API_GET_METHOD,
            'callback' => 'getTapestry',
        ],
    ],
    'PUT_TAPESTRY' => (object) [
        'ROUTE' => '/tapestries/(?P<tapestryPostId>[\d]+)',
        'ARGUMENTS' => [
            'methods' => $REST_API_PUT_METHOD,
            'callback' => 'putTapestry',
        ],
    ],
    'PUT_TAPESTRY_SETTINGS' => (object) [
        'ROUTE' => '/tapestries/(?P<tapestryPostId>[\d]+)/settings',
        'ARGUMENTS' => [
            'methods' => $REST_API_PUT_METHOD,
            'callback' => 'updateTapestrySettings',
            'permission_callback' => 'TapestryPermissions::putTapestrySettings',
        ],
    ],
    'POST_TAPESTRY_GROUP' => (object) [
        'ROUTE' => '/tapestries/(?P<tapestryPostId>[\d]+)/groups',
        'ARGUMENTS' => [
            'methods' => $REST_API_POST_METHOD,
            'callback' => 'addTapestryGroup',
            'permission_callback' => 'TapestryPermissions::postTapestryGroup',
        ],
    ],
    'PUT_TAPESTRY_NODE' => (object) [
        'ROUTE' => '/tapestries/(?P<tapestryPostId>[\d]+)/nodes/(?P<nodeMetaId>[\d]+)',
        'ARGUMENTS' => [
            'methods' => $REST_API_PUT_METHOD,
            'callback' => 'updateTapestryNode',
        ],
    ],
    'DELETE_TAPESTRY_NODE' => (object) [
        'ROUTE' => '/tapestries/(?P<tapestryPostId>[\d]+)/nodes/(?P<nodeMetaId>[\d]+)',
        'ARGUMENTS' => [
            'methods' => $REST_API_DELETE_METHOD,
            'callback' => 'deleteTapestryNode',
        ],
    ],
    'PUT_TAPESTRY_NODE_SIZE' => (object) [
        'ROUTE' => '/tapestries/(?P<tapestryPostId>[\d]+)/nodes/(?P<nodeMetaId>[\d]+)/size',
        'ARGUMENTS' => [
            'methods' => $REST_API_PUT_METHOD,
            'callback' => 'updateTapestryNodeSize',
        ],
    ],
    'PUT_TAPESTRY_NODE_DESCRIPTION' => (object) [
        'ROUTE' => '/tapestries/(?P<tapestryPostId>[\d]+)/nodes/(?P<nodeMetaId>[\d]+)/description',
        'ARGUMENTS' => [
            'methods' => $REST_API_PUT_METHOD,
            'callback' => 'updateTapestryNodeDescription',
        ],
    ],
    'PUT_TAPESTRY_NODE_TITLE' => (object) [
        'ROUTE' => '/tapestries/(?P<tapestryPostId>[\d]+)/nodes/(?P<nodeMetaId>[\d]+)/title',
        'ARGUMENTS' => [
            'methods' => $REST_API_PUT_METHOD,
            'callback' => 'updateTapestryNodeTitle',
        ],
    ],
    'PUT_TAPESTRY_NODE_IMAGE_URL' => (object) [
        'ROUTE' => '/tapestries/(?P<tapestryPostId>[\d]+)/nodes/(?P<nodeMetaId>[\d]+)/imageURL',
        'ARGUMENTS' => [
            'methods' => $REST_API_PUT_METHOD,
            'callback' => 'updateTapestryNodeImageURL',
        ],
    ],
    'PUT_TAPESTRY_NODE_LOCKED_IMAGE_URL' => (object) [
        'ROUTE' => '/tapestries/(?P<tapestryPostId>[\d]+)/nodes/(?P<nodeMetaId>[\d]+)/lockedImageURL',
        'ARGUMENTS' => [
            'methods' => $REST_API_PUT_METHOD,
            'callback' => 'updateTapestryNodeLockedImageURL',
        ],
    ],
    'PUT_TAPESTRY_NODE_TYPE_DATA' => (object) [
        'ROUTE' => '/tapestries/(?P<tapestryPostId>[\d]+)/nodes/(?P<nodeMetaId>[\d]+)/typeData',
        'ARGUMENTS' => [
            'methods' => $REST_API_PUT_METHOD,
            'callback' => 'updateTapestryNodeTypeData',
        ],
    ],
    'PUT_TAPESTRY_NODE_COORDINATES' => (object) [
        'ROUTE' => '/tapestries/(?P<tapestryPostId>[\d]+)/nodes/(?P<nodeMetaId>[\d]+)/coordinates',
        'ARGUMENTS' => [
            'methods' => $REST_API_PUT_METHOD,
            'callback' => 'updateTapestryNodeCoordinates',
        ],
    ],
    'GET_TAPESTRY_NODE_HAS_DRAFT_CHILDREN' => (object) [
        'ROUTE' => '/tapestries/(?P<tapestryPostId>[\d]+)/nodes/(?P<nodeMetaId>[\d]+)/nodeHasDraftChildren',
        'ARGUMENTS' => [
            'methods' => $REST_API_GET_METHOD,
            'callback' => 'getTapestryNodeHasDraftChildren',
        ],
    ],
    'GET_QUESTION_HAS_ANSWERS' => (object) [
        'ROUTE' => '/tapestries/(?P<tapestryPostId>[\d]+)/nodes/(?P<nodeMetaId>[\d]+)/question/hasAnswers',
        'ARGUMENTS' => [
            'methods' => $REST_API_GET_METHOD,
            'callback' => 'getQuestionHasAnswers',
        ],
    ],
    'POST_TAPESTRY_LINK' => (object) [
        'ROUTE' => '/tapestries/(?P<tapestryPostId>[\d]+)/links',
        'ARGUMENTS' => [
            'methods' => $REST_API_POST_METHOD,
            'callback' => 'addTapestryLink',
        ],
    ],
    'REVERSE_TAPESTRY_LINK' => (object) [
        'ROUTE' => '/tapestries/(?P<tapestryPostId>[\d]+)/links/reverse',
        'ARGUMENTS' => [
            'methods' => $REST_API_POST_METHOD,
            'callback' => 'reverseTapestryLink',
        ],
    ],
    'DELETE_TAPESTRY_LINK' => (object) [
        'ROUTE' => '/tapestries/(?P<tapestryPostId>[\d]+)/links',
        'ARGUMENTS' => [
            'methods' => $REST_API_DELETE_METHOD,
            'callback' => 'deleteTapestryLink',
        ],
    ],
    'GET_TAPESTRY_USER_PROGRESS' => (object) [
        'ROUTE' => 'users/progress',
        'ARGUMENTS' => [
            'methods' => $REST_API_GET_METHOD,
            'callback' => 'getUserProgressByPostId',
        ],
    ],
    'UPDATE_TAPESTRY_USER_PROGRESS' => (object) [
        'ROUTE' => 'users/progress',
        'ARGUMENTS' => [
            'methods' => $REST_API_POST_METHOD,
            'callback' => 'updateProgressByNodeId',
        ],
    ],
    'UPDATE_TAPESTRY_USER_COMPLETED' => (object) [
        'ROUTE' => 'users/completed',
        'ARGUMENTS' => [
            'methods' => $REST_API_POST_METHOD,
            'callback' => 'completeByNodeId',
        ],
    ],
    'UPDATE_TAPESTRY_USER_ACTIVITY_PROGRESS' => (object) [
        'ROUTE' => 'users/activity',
        'ARGUMENTS' => [
            'methods' => $REST_API_POST_METHOD,
            'callback' => 'completeQuestionById',
        ],
    ],
    'GET_TAPESTRY_USER_H5P_SETTING' => (object) [
        'ROUTE' => 'users/h5psettings/(?P<tapestryPostId>[\d]+)',
        'ARGUMENTS' => [
            'methods' => $REST_API_GET_METHOD,
            'callback' => 'getUserH5PSettingsByPostId',
        ],
    ],
    'UPDATE_TAPESTRY_USER_H5P_SETTING' => (object) [
        'ROUTE' => 'users/h5psettings/(?P<tapestryPostId>[\d]+)',
        'ARGUMENTS' => [
            'methods' => $REST_API_POST_METHOD,
            'callback' => 'updateUserH5PSettingsByPostId',
        ],
    ],
    'GET_USER_THEME' => (object) [
        'ROUTE' => '/users/userSettings/theme',
        'ARGUMENTS' => [
            'methods' => $REST_API_GET_METHOD,
            'callback' => 'getUserTheme',
        ],
    ],
    'UPDATE_USER_SETTINGS' => (object) [
        'ROUTE' => '/users/userSettings',
        'ARGUMENTS' => [
            'methods' => $REST_API_PUT_METHOD,
            'callback' => 'updateUserSettings',
        ],
    ],
    'POST_USER_AUDIO' => (object) [
        'ROUTE' => 'users/activity/audio/tapestries/(?P<tapestryPostId>[\d]+)/nodes/(?P<nodeMetaId>[\d]+)',
        'ARGUMENTS' => [
            'methods' => $REST_API_POST_METHOD,
            'callback' => 'postUserAudio',
        ],
    ],
    'GET_ALL_H5P' => (object) [
        'ROUTE' => '/h5p',
        'ARGUMENTS' => [
            'methods' => $REST_API_GET_METHOD,
            'callback' => 'getAllH5P',
        ],
    ],
    'GET_TAPESTRY_USER_FAVOURITES' => (object) [
        'ROUTE' => 'users/favourites',
        'ARGUMENTS' => [
            'methods' => $REST_API_GET_METHOD,
            'callback' => 'getUserFavourites',
        ],
    ],
    'UPDATE_TAPESTRY_USER_FAVOURITES' => (object) [
        'ROUTE' => 'users/favourites',
        'ARGUMENTS' => [
            'methods' => $REST_API_POST_METHOD,
            'callback' => 'updateUserFavourites',
        ],
    ],
    'GET_TAPESTRY_USER_LAST_SELECTED_NODE' => (object) [
        'ROUTE' => 'users/lastSelectedNode',
        'ARGUMENTS' => [
            'methods' => $REST_API_GET_METHOD,
            'callback' => 'getLastSelectedNode',
        ],
    ],
    'UPDATE_TAPESTRY_USER_LAST_SELECTED_NODE' => (object) [
        'ROUTE' => 'users/lastSelectedNode',
        'ARGUMENTS' => [
            'methods' => $REST_API_POST_METHOD,
            'callback' => 'updateLastSelectedNode',
        ],
    ],
    'LOGIN' => (object) [
        'ROUTE' => '/login',
        'ARGUMENTS' => [
            'methods' => $REST_API_POST_METHOD,
            'callback' => 'login',
        ],
    ],
    'LOGOUT' => (object) [
        'ROUTE' => '/logout',
        'ARGUMENTS' => [
            'methods' => $REST_API_GET_METHOD,
            'callback' => function () {
                wp_logout();
            },
        ],
    ],
    'GET_TAPESTRY_CONTRIBUTORS' => (object) [
        'ROUTE' => '/tapestries/(?P<tapestryPostId>[\d]+)/contributors',
        'ARGUMENTS' => [
            'methods' => $REST_API_GET_METHOD,
            'callback' => 'getTapestryContributors',
        ],
    ],
    'GET_ALL_ROLES' => (object) [
        'ROUTE' => '/roles',
        'ARGUMENTS' => [
            'methods' => $REST_API_GET_METHOD,
            'callback' => 'get_all_user_roles',
        ],
    ],
    'GET_TAPESTRY_EXPORT' => (object) [
        'ROUTE' => '/tapestries/(?P<tapestryPostId>[\d]+)/export',
        'ARGUMENTS' => [
            'methods' => $REST_API_GET_METHOD,
            'callback' => 'exportTapestry',
            'permission_callback' => 'TapestryPermissions::putTapestrySettings',
        ],
    ],
    'OPTIMIZE_THUMBNAILS' => (object) [
        'ROUTE' => '/tapestries/(?P<tapestryPostId>[\d]+)/optimize_thumbnails',
        'ARGUMENTS' => [
            'methods' => $REST_API_POST_METHOD,
            'callback' => 'optimizeTapestryNodeThumbnails',
            'permission_callback' => 'TapestryPermissions::putTapestrySettings',
        ],
    ],
    'UPLOAD_VIDEOS_TO_KALTURA' => (object) [
        'ROUTE' => '/kaltura/upload_videos',
        'ARGUMENTS' => [
            'methods' => $REST_API_POST_METHOD,
            'callback' => 'uploadVideosToKaltura',
            'permission_callback' => 'TapestryPermissions::kalturaUpload',
        ],
    ],
    'GET_VIDEOS_TO_UPLOAD' => (object) [
        'ROUTE' => '/kaltura/videos/to_upload',
        'ARGUMENTS' => [
            'methods' => $REST_API_GET_METHOD,
            'callback' => 'getVideosToUpload',
            'permission_callback' => 'TapestryPermissions::kalturaUpload',
        ],
    ],
    'GET_KALTURA_UPLOAD_STATUS' => (object) [
        'ROUTE' => '/kaltura/upload_status',
        'ARGUMENTS' => [
            'methods' => $REST_API_GET_METHOD,
            'callback' => 'getKalturaUploadStatus',
            'permission_callback' => 'TapestryPermissions::kalturaUpload',
        ],
    ],
    'RESET_UPLOAD_STATUS' => (object) [
        'ROUTE' => '/kaltura/upload_status/reset',
        'ARGUMENTS' => [
            'methods' => $REST_API_POST_METHOD,
            'callback' => 'forceResetUploadStatus',
            'permission_callback' => 'TapestryPermissions::kalturaUpload',
        ],
    ],
    'STOP_KALTURA_UPLOAD' => (object) [
        'ROUTE' => '/kaltura/stop_upload',
        'ARGUMENTS' => [
            'methods' => $REST_API_POST_METHOD,
            'callback' => 'stopKalturaUpload',
            'permission_callback' => 'TapestryPermissions::kalturaUpload',
        ],
    ],
    'UPDATE_CONVERTING_VIDEOS' => (object) [
        'ROUTE' => '/kaltura/videos/converting',
        'ARGUMENTS' => [
            'methods' => $REST_API_POST_METHOD,
            'callback' => 'updateConvertingVideos',
            'permission_callback' => 'TapestryPermissions::kalturaUpload',
        ],
    ],
    'GET_KALTURA_VIDEO_STATUS' => (object) [
        'ROUTE' => '/kaltura/video/status',
        'ARGUMENTS' => [
            'methods' => $REST_API_GET_METHOD,
            'callback' => 'checkKalturaVideo',
        ],
    ],
    'GET_KALTURA_VIDEO_META' => (object) [
        'ROUTE' => '/kaltura/video/meta',
        'ARGUMENTS' => [
            'methods' => $REST_API_GET_METHOD,
            'callback' => 'getKalturaVideoMeta',
        ],
    ],
];

/*
 * REGISTER API ENDPOINTS
 */
foreach ($REST_API_ENDPOINTS as $ENDPOINT) {
    add_action(
        'rest_api_init',
        function () use ($ENDPOINT, $REST_API_NAMESPACE) {
            register_rest_route(
                $REST_API_NAMESPACE,
                $ENDPOINT->ROUTE,
                array_merge(array('permission_callback' => '__return_true'), $ENDPOINT->ARGUMENTS)
            );
        }
    );
}

function exportTapestry($request)
{
    $postId = $request['tapestryPostId'];
    try {
        if ($postId && !TapestryHelpers::isValidTapestry($postId)) {
            throw new TapestryError('INVALID_POST_ID');
        }
        $tapestry = new Tapestry($postId);
        return $tapestry->export();
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

function get_all_user_roles($request)
{
    global $wp_roles;

    $roles = $wp_roles->roles;

    return $roles;
}


function login($request)
{
    $params = json_decode($request->get_body());
    $credentials = ['user_login' => $params->username, 'user_password' => $params->password, 'remember' => true];
    $user = wp_signon($credentials, false);
    if (is_wp_error($user)) {
        return $user;
    } else {
        wp_set_current_user($user->ID, $user->user_login);
        if (is_user_logged_in()) {
            return wp_create_nonce('wp_rest');
        }

        return false;
    }
}

function getAllH5P()
{
    try {
        $controller = new TapestryH5P();

        return $controller->get();
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

/**
 * Get a Tapestry.
 *
 * @param object $request HTTP request
 *
 * @return object $response HTTP response
 */
function getTapestry($request)
{
    $postId = $request['tapestryPostId'];
    $filterUserId = $request['filter_user_id'];
    try {
        $tapestry = new Tapestry($postId);
        $data = $tapestry->get($filterUserId);

        return $data;
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

/**
 * Add a tapestry.
 *
 * @param object $request HTTP request
 *
 * @return object $response   HTTP response
 */
function addTapestry($request)
{
    $tapestryData = json_decode($request->get_body());
    try {
        $title = $tapestryData->title;
        $page = get_page_by_title($tapestryData->title, 'OBJECT', 'tapestry');
        if ($page) {
            $count = 1;
            $title = $tapestryData->title.' ('.$count.')';
            while (get_page_by_title($title, 'OBJECT', 'tapestry')) {
                ++$count;
                $title = $tapestryData->title.' ('.$count.')';
            }
        }
        $user = wp_get_current_user();

        $postId = wp_insert_post([
            'comment_status' => 'closed',
            'post_author' => $user->ID ? $user->ID : 1,
            'ping_status' => 'closed',
            'post_status' => 'publish',
            'post_title' => $title,
            'post_type' => 'tapestry',
        ], true);
        if (is_wp_error($postId)) {
            throw new TapestryError('FAILED_TO_CREATE_POST');
        }

        return importTapestry($postId, $tapestryData);
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

/**
 * Get a Tapestry.
 *
 * @param object $request HTTP request
 *
 * @return object $response HTTP response
 */
function putTapestry($request)
{
    $postId = $request['tapestryPostId'];
    $tapestryData = json_decode($request->get_body());
    try {
        return importTapestry($postId, $tapestryData);
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

function importTapestry($postId, $tapestryData)
{
    $tapestry = new Tapestry($postId);

    if (!$tapestry->isEmpty()) {
        throw new TapestryError('TAPESTRY_NOT_EMPTY');
    }

    $data = new stdClass();
    if (isset($tapestryData->groups)) {
        $data->groups = $tapestryData->groups;
    }
    if (isset($tapestryData->settings)) {
        $data->settings = $tapestryData->settings;
    }
    $tapestry->set($data);

    if (isset($tapestryData->nodes) && isset($tapestryData->links)) {
        $idMap = new stdClass();

        // Construct ID map and add nodes to new Tapestry
        foreach ($tapestryData->nodes as $node) {
            $oldNodeId = $node->id;
            $newNode = $tapestry->addNode($node);
            $newNodeId = $newNode->id;
            $idMap->$oldNodeId = $newNodeId;
        }

        // Now update any node data that relies on IDs
        foreach ($tapestryData->nodes as $oldNode) {
            $oldNodeId = $oldNode->id;
            $newNodeId = $idMap->$oldNodeId;

            $tapestryNode = $tapestry->getNode($newNodeId);
            $node = $tapestryNode->get();

            foreach ($node->conditions as $condition) {
                if ($condition->nodeId) {
                    $oldDependency = $condition->nodeId;
                    $condition->nodeId = $idMap->$oldDependency;
                }
            }


            $tapestryNode->set($node);
            $tapestryNode->save();
        }

        foreach ($tapestryData->links as $link) {
            $oldSource = $link->source;
            $oldTarget = $link->target;

            $link->source = $idMap->$oldSource;
            $link->target = $idMap->$oldTarget;

            $tapestry->addLink($link);
        }
    }

    return $tapestry->save();
}


function deleteTapestry($request)
{
    $params = json_decode($request->get_body());
    $post = get_page_by_title($params->title, 'OBJECT', 'tapestry');

    return wp_delete_post($post->ID);
}

/**
 * Add a tapestry node.
 *
 * @param object $request HTTP request
 *
 * @return object HTTP response
 */
function addTapestryNode($request)
{
    $postId = $request['tapestryPostId'];
    $node = json_decode($request->get_body());
    // TODO: JSON validations should happen here
    // make sure that we can only accept one node object at a time
    // adding multiple nodes would require multiple requests from the client
    try {
        if ($postId && !TapestryHelpers::isValidTapestry($postId)) {
            throw new TapestryError('INVALID_POST_ID');
        }
        $tapestry = new Tapestry($postId);

        if ($tapestry->isEmpty()) {
            $user = new TapestryUser();
            if (!$user->canEdit($postId)) {
                throw new TapestryError('ADD_NODE_PERMISSION_DENIED');
            }
        }

        return $tapestry->addNode($node);
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

/**
 * Add a review to a Tapestry node. A review is either a comment or a change of
 * node status.
 *
 * Request Body
 * --
 * Accepts a review object in the request body, of shape:
 * ```
 * {
 *  type: COMMENT | STATUS_CHANGE
 *  timestamp: string // current datetime in ISO8601 format
 *  ...data // varies by type of review
 * }
 * ```
 *
 * Access
 * --
 * - If the current user has Tapestry edit privileges, any review type is allowed.
 * - If the current user is the author of the node, only comments are allowed.
 * - Otherwise, the user is not allowed to review this node.
 *
 * @param object $request HTTP request
 *
 * @return object HTTP response
 */
function addTapestryNodeReview($request)
{
    $postId = $request['tapestryPostId'];
    $nodeMetaId = $request['nodeMetaId'];
    $review = json_decode($request->get_body());
    try {
        if ($postId && !TapestryHelpers::isValidTapestry($postId)) {
            throw new TapestryError('INVALID_POST_ID');
        }
        if (!TapestryHelpers::isValidTapestryNode($nodeMetaId)) {
            throw new TapestryError('INVALID_NODE_META_ID');
        }
        if (!TapestryHelpers::isChildNodeOfTapestry($nodeMetaId, $postId)) {
            throw new TapestryError('INVALID_CHILD_NODE');
        }
        if (!isset($review->comments) || !is_array($review->comments)) {
            throw new TapestryError('INVALID_REVIEW', 'A review should have an array of comments', 400);
        }

        $tapestry = new Tapestry($postId);
        $node = $tapestry->getNode($nodeMetaId);
        return $node->addReview($review->comments);
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

/**
 * Add a Tapestry Group.
 *
 * @param object $request HTTP request
 *
 * @return object $response   HTTP response
 */
function addTapestryGroup($request)
{
    $postId = $request['tapestryPostId'];
    $group = json_decode($request->get_body());
    // TODO: JSON validations should happen here
    // make sure the type of the group body exists and is 'tapestry_group'
    try {
        if ($postId && !TapestryHelpers::isValidTapestry($postId)) {
            throw new TapestryError('INVALID_POST_ID');
        }
        $tapestry = new Tapestry($postId);
        return $tapestry->addGroup($group);
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

/**
 * Add A Tapestry Link.
 *
 * @param object $request HTTP request
 *
 * @return object $response   HTTP response
 */
function addTapestryLink($request)
{
    $postId = $request['tapestryPostId'];
    $link = json_decode($request->get_body());

    try {
        if (!$link->source || !$link->target) {
            throw new TapestryError('INVALID_NEW_LINK');
        }
        if ($postId && !TapestryHelpers::isValidTapestry($postId)) {
            throw new TapestryError('INVALID_POST_ID');
        }
        if ((!TapestryHelpers::isChildNodeOfTapestry($link->source, $postId))
            || (!TapestryHelpers::isChildNodeOfTapestry($link->target, $postId))
        ) {
            throw new TapestryError('INVALID_CHILD_NODE');
        }
        if (TapestryHelpers::nodeIsDraft($link->source, $postId)
            || TapestryHelpers::nodeIsDraft($link->target, $postId)) {
            $tapestry = new Tapestry($postId);
            return $tapestry->addLink($link);
        }
        if (!TapestryHelpers::userIsAllowed('ADD', $link->source, $postId)) {
            throw new TapestryError('ADD_LINK_PERMISSION_DENIED');
        }
        if (!TapestryHelpers::userIsAllowed('ADD', $link->target, $postId)
            && (!isset($link->addedOnNodeCreation) || !$link->addedOnNodeCreation)) {
            throw new TapestryError('ADD_LINK_PERMISSION_DENIED');
        }
        $tapestry = new Tapestry($postId);

        return $tapestry->addLink($link);
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

/**
 * Reverses A Tapestry Link.
 *
 * @param object $request HTTP request
 *
 * @return object $response   HTTP response
 */
function reverseTapestryLink($request)
{
    $postId = $request['tapestryPostId'];
    $newLink = json_decode($request->get_body());


    try {
        if (!$newLink->source || !$newLink->target) {
            throw new TapestryError('INVALID_NEW_LINK');
        }
        if ($postId && !TapestryHelpers::isValidTapestry($postId)) {
            throw new TapestryError('INVALID_POST_ID');
        }
        if (!TapestryHelpers::userIsAllowed('ADD', $newLink->source, $postId)
            || !TapestryHelpers::userIsAllowed('ADD', $newLink->target, $postId)) {
            throw new TapestryError('ADD_LINK_PERMISSION_DENIED');
        }
        $tapestry = new Tapestry($postId);

        return $tapestry->reverseLink($newLink);
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}
/**
 * Delete A Tapestry Link.
 *
 * @param object $request HTTP request
 *
 * @return object $response   HTTP response
 */
function deleteTapestryLink($request)
{
    $postId = $request['tapestryPostId'];
    $link = json_decode($request->get_body());
    try {
        if ($postId && !TapestryHelpers::isValidTapestry($postId)) {
            throw new TapestryError('INVALID_POST_ID');
        }
        if (!TapestryHelpers::nodeIsDraft($link->target, $postId) && !TapestryHelpers::nodeIsDraft($link->source, $postId)) {
            if (!TapestryHelpers::userIsAllowed('ADD', $link->source, $postId)) {
                throw new TapestryError('DELETE_LINK_PERMISSION_DENIED');
            }
            if (!TapestryHelpers::userIsAllowed('ADD', $link->target, $postId)) {
                throw new TapestryError('DELETE_LINK_PERMISSION_DENIED');
            }
        }
        $tapestry = new Tapestry($postId);

        return $tapestry->removeLink($link);
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

/**
 * Update Tapestry Settings.
 *
 * @param object $request HTTP request
 *
 * @return object $response   HTTP response
 */
function updateTapestrySettings($request)
{
    $postId = $request['tapestryPostId'];
    $settings = json_decode($request->get_body());
    // TODO: JSON validations should happen here
    try {
        if ($postId && !TapestryHelpers::isValidTapestry($postId)) {
            throw new TapestryError('INVALID_POST_ID');
        }
        $tapestry = new Tapestry($postId);
        $tapestry->set((object) ['settings' => $settings]);

        return $tapestry->save();
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

/**
 * Update Tapestry Node.
 *
 * @param object $request HTTP request
 *
 * @return object $response   HTTP response
 */
function updateTapestryNode($request)
{
    $postId = $request['tapestryPostId'];
    $nodeMetaId = $request['nodeMetaId'];
    $nodeData = json_decode($request->get_body());
    // TODO: JSON validations should happen here
    // make sure the permissions body exists and not null
    try {
        if ($postId && !TapestryHelpers::isValidTapestry($postId)) {
            throw new TapestryError('INVALID_POST_ID');
        }
        if (!TapestryHelpers::isValidTapestryNode($nodeMetaId)) {
            throw new TapestryError('INVALID_NODE_META_ID');
        }
        if (!TapestryHelpers::userIsAllowed('EDIT', $nodeMetaId, $postId)) {
            throw new TapestryError('EDIT_NODE_PERMISSION_DENIED');
        }
        if (!TapestryHelpers::isChildNodeOfTapestry($nodeMetaId, $postId)) {
            throw new TapestryError('INVALID_CHILD_NODE');
        }
        if (TapestryHelpers::nodeIsDraft($nodeMetaId, $postId) &&
            !TapestryHelpers::nodeNeighbourIsPublished($nodeMetaId, $postId)) {
            throw new TapestryError('NODE_APPROVAL_DENIED');
        }

        $tapestry = new Tapestry($postId);
        $node = $tapestry->getNode($nodeMetaId);

        $node->set((object) $nodeData);

        return $node->save();
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

/**
 * Delete Tapestry Node.
 *
 * @param object $request HTTP request
 *
 * @return object $response   HTTP response
 */
function deleteTapestryNode($request)
{
    $postId = $request['tapestryPostId'];
    $nodeMetaId = $request['nodeMetaId'];

    // TODO: JSON validations should happen here
    // make sure the permissions body exists and not null
    try {
        if ($postId && !TapestryHelpers::isValidTapestry($postId)) {
            throw new TapestryError('INVALID_POST_ID');
        }
        if (!TapestryHelpers::isValidTapestryNode($nodeMetaId)) {
            throw new TapestryError('INVALID_NODE_META_ID');
        }
        if (!TapestryHelpers::userIsAllowed('EDIT', $nodeMetaId, $postId)) {
            throw new TapestryError('EDIT_NODE_PERMISSION_DENIED');
        }
        if (!TapestryHelpers::isChildNodeOfTapestry($nodeMetaId, $postId)) {
            throw new TapestryError('INVALID_CHILD_NODE');
        }

        $tapestry = new Tapestry($postId);

        return $tapestry->deleteNodeFromTapestry($nodeMetaId);
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

/**
 * Update Tapestry Node Size.
 *
 * @param object $request HTTP request
 *
 * @return object $response   HTTP response
 */
function updateTapestryNodeSize($request)
{
    $postId = $request['tapestryPostId'];
    $nodeMetaId = $request['nodeMetaId'];
    $size = json_decode($request->get_body());
    // TODO: JSON validations should happen here
    // make sure the size exists and is a valid string
    try {
        if ($postId && !TapestryHelpers::isValidTapestry($postId)) {
            throw new TapestryError('INVALID_POST_ID');
        }
        if (!TapestryHelpers::isValidTapestryNode($nodeMetaId)) {
            throw new TapestryError('INVALID_NODE_META_ID');
        }
        if (!TapestryHelpers::userIsAllowed('EDIT', $nodeMetaId, $postId)) {
            throw new TapestryError('EDIT_NODE_PERMISSION_DENIED');
        }
        if (!TapestryHelpers::isChildNodeOfTapestry($nodeMetaId, $postId)) {
            throw new TapestryError('INVALID_CHILD_NODE');
        }

        $tapestry = new Tapestry($postId);
        $node = $tapestry->getNode($nodeMetaId);

        $node->set((object) ['size' => $size]);

        return $node->save();
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

/**
 * Update Tapestry Node Description.
 *
 * @param object $request HTTP request
 *
 * @return object $response   HTTP response
 */
function updateTapestryNodeDescription($request)
{
    $postId = $request['tapestryPostId'];
    $nodeMetaId = $request['nodeMetaId'];
    $description = json_decode($request->get_body());
    // TODO: JSON validations should happen here
    // make sure the description body exists and is valid string
    try {
        if ($postId && !TapestryHelpers::isValidTapestry($postId)) {
            throw new TapestryError('INVALID_POST_ID');
        }
        if (!TapestryHelpers::isValidTapestryNode($nodeMetaId)) {
            throw new TapestryError('INVALID_NODE_META_ID');
        }
        if (!TapestryHelpers::userIsAllowed('EDIT', $nodeMetaId, $postId)) {
            throw new TapestryError('EDIT_NODE_PERMISSION_DENIED');
        }
        if (!TapestryHelpers::isChildNodeOfTapestry($nodeMetaId, $postId)) {
            throw new TapestryError('INVALID_CHILD_NODE');
        }

        $tapestry = new Tapestry($postId);
        $node = $tapestry->getNode($nodeMetaId);

        $node->set((object) ['description' => $description]);

        return $node->save();
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

/**
 * Update Tapestry Node Title.
 *
 * @param object $request HTTP request
 *
 * @return object $response   HTTP response
 */
function updateTapestryNodeTitle($request)
{
    $postId = $request['tapestryPostId'];
    $nodeMetaId = $request['nodeMetaId'];
    $title = json_decode($request->get_body());
    // TODO: JSON validations should happen here
    // make sure the title exists and not null
    try {
        if ($postId && !TapestryHelpers::isValidTapestry($postId)) {
            throw new TapestryError('INVALID_POST_ID');
        }
        if (!TapestryHelpers::isValidTapestryNode($nodeMetaId)) {
            throw new TapestryError('INVALID_NODE_META_ID');
        }
        if (!TapestryHelpers::userIsAllowed('EDIT', $nodeMetaId, $postId)) {
            throw new TapestryError('EDIT_NODE_PERMISSION_DENIED');
        }
        if (!TapestryHelpers::isChildNodeOfTapestry($nodeMetaId, $postId)) {
            throw new TapestryError('INVALID_CHILD_NODE');
        }

        $tapestry = new Tapestry($postId);
        $node = $tapestry->getNode($nodeMetaId);

        $node->set((object) ['title' => $title]);

        return $node->save();
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

/**
 * Update Tapestry Node Image Url.
 *
 * @param object $request HTTP request
 *
 * @return object $response   HTTP response
 */
function updateTapestryNodeImageURL($request)
{
    $postId = $request['tapestryPostId'];
    $nodeMetaId = $request['nodeMetaId'];
    $imageURL = json_decode($request->get_body());
    // TODO: JSON validations should happen here
    // make sure the image url exists and not null
    try {
        if ($postId && !TapestryHelpers::isValidTapestry($postId)) {
            throw new TapestryError('INVALID_POST_ID');
        }
        if (!TapestryHelpers::isValidTapestryNode($nodeMetaId)) {
            throw new TapestryError('INVALID_NODE_META_ID');
        }
        if (!TapestryHelpers::userIsAllowed('EDIT', $nodeMetaId, $postId)) {
            throw new TapestryError('EDIT_NODE_PERMISSION_DENIED');
        }
        if (!TapestryHelpers::isChildNodeOfTapestry($nodeMetaId, $postId)) {
            throw new TapestryError('INVALID_CHILD_NODE');
        }

        $tapestry = new Tapestry($postId);
        $node = $tapestry->getNode($nodeMetaId);

        $node->set((object) ['imageURL' => $imageURL]);

        return $node->save();
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

/**
 * Update Tapestry Node Locked Image Url.
 *
 * @param object $request HTTP request
 *
 * @return object $response   HTTP response
 */
function updateTapestryNodeLockedImageURL($request)
{
    $postId = $request['tapestryPostId'];
    $nodeMetaId = $request['nodeMetaId'];
    $imageURL = json_decode($request->get_body());
    // TODO: JSON validations should happen here
    // make sure the image url exists and not null
    try {
        if ($postId && !TapestryHelpers::isValidTapestry($postId)) {
            throw new TapestryError('INVALID_POST_ID');
        }
        if (!TapestryHelpers::isValidTapestryNode($nodeMetaId)) {
            throw new TapestryError('INVALID_NODE_META_ID');
        }
        if (!TapestryHelpers::userIsAllowed('EDIT', $nodeMetaId, $postId)) {
            throw new TapestryError('EDIT_NODE_PERMISSION_DENIED');
        }
        if (!TapestryHelpers::isChildNodeOfTapestry($nodeMetaId, $postId)) {
            throw new TapestryError('INVALID_CHILD_NODE');
        }

        $tapestry = new Tapestry($postId);
        $node = $tapestry->getNode($nodeMetaId);
        $node->set((object) ['lockedImageURL' => $imageURL]);

        return $node->save();
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

// takes an old thumbnail and optimizes it
function optimizeTapestryNodeThumbnails($request)
{
    $postId = $request['tapestryPostId'];

    // TODO: JSON validations should happen here
    // make sure the permissions body exists and not null
    try {
        if ($postId && !TapestryHelpers::isValidTapestry($postId)) {
            throw new TapestryError('INVALID_POST_ID');
        }

        $tapestry = new Tapestry($postId);

        foreach ($tapestry->getNodeIds() as $nodeMetaId) {
            $node = $tapestry->getNode($nodeMetaId);
            $nodeData = $node->get();
            $protocol = is_ssl() ? "https:" : "http:";

            if ($nodeData->imageURL) {
                $urlPrepend = substr($nodeData->imageURL, 0, 4) === "http" ? "" : $protocol;
                $attachmentId = TapestryHelpers::attachImageByURL($urlPrepend . $nodeData->imageURL);
                $node->set((object) ['thumbnailFileId' => $attachmentId]);
                $node->save();
            }
            if ($nodeData->lockedImageURL) {
                $urlPrepend = substr($nodeData->lockedImageURL, 0, 4) === "http" ? "" : $protocol;
                $attachmentId = TapestryHelpers::attachImageByURL($urlPrepend . $nodeData->lockedImageURL);
                $node->set((object) ['lockedThumbnailFileId' => $attachmentId]);
                $node->save();
            }
        }
        return true;
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

/**
 * Update Tapestry Node Type Data.
 *
 * @param object $request HTTP request
 *
 * @return object $response   HTTP response
 */
function updateTapestryNodeTypeData($request)
{
    $postId = $request['tapestryPostId'];
    $nodeMetaId = $request['nodeMetaId'];
    $typeData = json_decode($request->get_body());
    // TODO: JSON validations should happen here
    // make sure the type data exists and not null
    try {
        if ($postId && !TapestryHelpers::isValidTapestry($postId)) {
            throw new TapestryError('INVALID_POST_ID');
        }
        if (!TapestryHelpers::isValidTapestryNode($nodeMetaId)) {
            throw new TapestryError('INVALID_NODE_META_ID');
        }
        if (!TapestryHelpers::userIsAllowed('EDIT', $nodeMetaId, $postId)) {
            throw new TapestryError('EDIT_NODE_PERMISSION_DENIED');
        }
        if (!TapestryHelpers::isChildNodeOfTapestry($nodeMetaId, $postId)) {
            throw new TapestryError('INVALID_CHILD_NODE');
        }

        $tapestry = new Tapestry($postId);
        $node = $tapestry->getNode($nodeMetaId);

        $node->set((object) ['typeData' => $typeData]);

        return $node->save();
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

/**
 * Update Tapestry Node Coordinates.
 *
 * @param object $request HTTP request
 *
 * @return object $response   HTTP response
 */
function updateTapestryNodeCoordinates($request)
{
    $postId = $request['tapestryPostId'];
    $nodeMetaId = $request['nodeMetaId'];
    $coordinates = json_decode($request->get_body());
    // TODO: JSON validations should happen here
    // make sure the coordinates exists and not null
    try {
        if ($postId && !TapestryHelpers::isValidTapestry($postId)) {
            throw new TapestryError('INVALID_POST_ID');
        }
        if (!TapestryHelpers::isValidTapestryNode($nodeMetaId)) {
            throw new TapestryError('INVALID_NODE_META_ID');
        }
        if (!TapestryHelpers::userIsAllowed('EDIT', $nodeMetaId, $postId) &&
            !TapestryHelpers::userIsAllowed('MOVE', $nodeMetaId, $postId)) {
            throw new TapestryError('EDIT_NODE_PERMISSION_DENIED');
        }
        if (!TapestryHelpers::isChildNodeOfTapestry($nodeMetaId, $postId)) {
            throw new TapestryError('INVALID_CHILD_NODE');
        }

        $tapestry = new Tapestry($postId);
        $node = $tapestry->getNode($nodeMetaId);

        $node->set((object) ['coordinates' => $coordinates]);

        return $node->save();
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

/**
 * Return whether tapestry node has draft neighbours.
 */
function getTapestryNodeHasDraftChildren($request)
{
    $postId = $request['tapestryPostId'];
    $nodeMetaId = $request['nodeMetaId'];

    try {
        if ($postId && !TapestryHelpers::isValidTapestry($postId)) {
            throw new TapestryError('INVALID_POST_ID');
        }
        if (!TapestryHelpers::isValidTapestryNode($nodeMetaId)) {
            throw new TapestryError('INVALID_NODE_META_ID');
        }
        if (!TapestryHelpers::userIsAllowed('EDIT', $nodeMetaId, $postId)) {
            throw new TapestryError('EDIT_NODE_PERMISSION_DENIED');
        }
        if (!TapestryHelpers::isChildNodeOfTapestry($nodeMetaId, $postId)) {
            throw new TapestryError('INVALID_CHILD_NODE');
        }

        $tapestry = new Tapestry($postId);
        $links = $tapestry->getLinks();
        $response = array(
            "hasDraft" => false,
        );

        foreach ($links as $link) {
            if ($link->source == $nodeMetaId || $link->target == $nodeMetaId) {
                $neighbour = new TapestryNode($postId, $link->source == $nodeMetaId ? $link->target : $link->source);
                if ($neighbour->getMeta()->status == "draft") {
                    $response["hasDraft"] = true;
                }
            }
        }

        return $response;
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

/**
 * Update a single node progress for the current user by passing in node id, post id and progress value
 * Example: /wp-json/tapestry-tool/v1/users/progress?post_id=44&node_id=1&progress_value=0.2.
 *
 * @param object $request HTTP request
 */
function updateProgressByNodeId($request)
{
    $postId = $request['post_id'];
    $nodeMetaId = $request['node_id'];
    $progressValue = $request['progress_value'];
    try {
        $userProgress = new TapestryUserProgress($postId, $nodeMetaId);
        $userProgress->updateUserProgress($progressValue);
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

/**
 * Set node as completed for the current user
 * Example: /wp-json/tapestry-tool/v1/users/completed?post_id=44&node_id=1.
 *
 * @param object $request HTTP request
 *
 * @return null
 */
function completeByNodeId($request)
{
    $postId = $request['post_id'];
    $nodeMetaId = $request['node_id'];

    try {
        $userProgress = new TapestryUserProgress($postId, $nodeMetaId);
        $userProgress->complete();
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

/**
 * Set activity as completed for the current user
 * Example: /wp-json/tapestry-tool/v1/users/activity?post_id=44&node_id=1&question_id=abcd.
 *
 * @param object $request HTTP request
 *
 * @return null
 */
function completeQuestionById($request)
{
    $postId = $request['post_id'];
    $nodeMetaId = $request['node_id'];
    $questionId = $request['question_id'];
    $body = json_decode($request->get_body());
    $answerData = $body->answer;
    $answerType = $body->answerType;

    try {
        $userProgress = new TapestryUserProgress($postId, $nodeMetaId);
        $userProgress->completeQuestion($questionId, $answerType, $answerData);
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

/**
 * Get user h5p video setting on a tapestry page by post id. Will need to pass these as query parameters
 * Example: /wp-json/tapestry-tool/v1/users/h5psettings/42.
 *
 * @param object $request HTTP request
 *
 * @return object $response HTTP response
 */
function getUserH5PSettingsByPostId($request)
{
    $postId = $request['tapestryPostId'];
    try {
        $userProgress = new TapestryUserProgress($postId);

        return $userProgress->getH5PSettings();
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

function updateUserSettings($request)
{
    $userSettings = $request->get_body();
    try {
        $userProgress = new TapestryUserProgress();
        $userProgress->updateUserSettings($userSettings);
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}


function getUserTheme($request)
{
    try {
        $userProgress = new TapestryUserProgress();
        return $userProgress->getTheme();
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

/**
 * Update the user's h5p settings by post id.
 *
 * Example endpoint: /wp-json/tapestry-tool/v1/users/h5psettings/44
 * Example body:
 * {
 *  "volume": 100,
 *  "muted": false,
 *  "caption": null,
 *  "quality": "q1",
 *  "playbackRate": 0.5,
 *  "time": 11.934346
 * }
 *
 * @param object $request HTTP request
 */
function updateUserH5PSettingsByPostId($request)
{
    $postId = $request['tapestryPostId'];
    $h5pSettingsData = $request->get_body();
    try {
        $userProgress = new TapestryUserProgress($postId);
        $userProgress->updateH5PSettings($h5pSettingsData);
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

/**
 * Get user progress on a tapestry page by post id.
 * Example: /wp-json/tapestry-tool/v1/users/progress?post_id=44.
 *
 * @param object $request HTTP request
 *
 * @return object $response HTTP response
 */
function getUserProgressByPostId($request)
{
    $postId = $request['post_id'];
    try {
        $userProgress = new TapestryUserProgress($postId);

        return $userProgress->get();
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

/**
 * Saves a user's recorded audio file.
 *
 * @param object $request HTTP request
 *
 * @return object $response HTTP response
 */
function postUserAudio($request)
{
    $postId = $request['tapestryPostId'];
    $nodeMetaId = $request['nodeMetaId'];
    $body = json_decode($request->get_body());
    $questionId = $body->questionId;
    $audio = $body->audio;

    try {
        if (!TapestryHelpers::isValidTapestry($postId)) {
            throw new TapestryError('INVALID_POST_ID');
        }
        if (!TapestryHelpers::isValidTapestryNode($nodeMetaId)) {
            throw new TapestryError('INVALID_NODE_META_ID');
        }
        if (!is_string($audio) || empty($audio)) {
            throw new TapestryError('INVALID_AUDIO');
        }
        if (0 == wp_get_current_user()->ID) {
            throw new TapestryError('INVALID_USER_ID');
        }
        $TapestryAudio = new TapestryAudio($postId, $nodeMetaId, $questionId);

        return $TapestryAudio->save($audio);
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

/**
 * Get user favourite nodes on a tapestry page by post id.
 * Example: /wp-json/tapestry-tool/v1/users/favourites?post_id=44.
 *
 * @param object $request HTTP request
 *
 * @return object $response HTTP response
 */
function getUserFavourites($request)
{
    $postId = $request['post_id'];
    try {
        $userProgress = new TapestryUserProgress($postId);

        return $userProgress->getFavourites();
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

/**
 * Update favourite nodes for the current user by passing in post id and favourites array
 * Example: /wp-json/tapestry-tool/v1/users/progress?post_id=44&favourites=[409, 411].
 *
 * @param object $request HTTP request
 */
function updateUserFavourites($request)
{
    $postId = $request['post_id'];
    $favourites = json_decode($request->get_body())->favourites;
    try {
        $userProgress = new TapestryUserProgress($postId);

        return $userProgress->updateFavourites($favourites);
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

/**
 * Get User's last selected node for a tapestry post.
 *
 * @return int $nodeId  node id of the last selected node in the tapestry
 */
function getLastSelectedNode($request)
{
    $postId = $request['post_id'];
    try {
        $userProgress = new TapestryUserProgress($postId);

        return $userProgress->getLastSelectedNode();
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

/**
 * Update last selected node for the current user by passing in post id and node id
 *
 * @param object $request HTTP request
 */
function updateLastSelectedNode($request)
{
    $postId = $request['post_id'];
    $body = json_decode($request->get_body());
    try {
        $userProgress = new TapestryUserProgress($postId);

        return $userProgress->updateLastSelectedNode($body->nodeId, $body->rowId);
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

function getTapestryContributors($request)
{
    $postId = $request['tapestryPostId'];
    $user = new TapestryUser();

    try {
        if (!$user->canEdit($postId)) {
            throw new TapestryError('TAPESTRY_PERMISSION_DENIED');
        }
        $tapestry = new Tapestry($postId);

        return $tapestry->getAllContributors();
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

/**
 * Checks whether any user has answered a spesific question
 * inside an acitivity
 *
 * @param object $request HTTP request
 */
function getQuestionHasAnswers($request)
{
    $postId = $request['tapestryPostId'];
    $nodeMetaId = $request['nodeMetaId'];
    $questionId = $request['question_id'];
    $answerType = $request['answer_type'];

    try {
        if ($postId && !TapestryHelpers::isValidTapestry($postId)) {
            throw new TapestryError('INVALID_POST_ID');
        }
        if (!TapestryHelpers::isValidTapestryNode($nodeMetaId)) {
            throw new TapestryError('INVALID_NODE_META_ID');
        }
        if (!TapestryHelpers::userIsAllowed('EDIT', $nodeMetaId, $postId)) {
            throw new TapestryError('EDIT_NODE_PERMISSION_DENIED');
        }

        return TapestryUserProgress::questionsHasAnyAnswer($postId, $nodeMetaId, $questionId, $answerType);
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
 *  videos: [
 *   { tapestryID: 7746, nodeID: 13004 }
 *  ],
 *  useKalturaPlayer: false
 * }
 */
function uploadVideosToKaltura($request)
{
    $upload_request = json_decode($request->get_body());
    if (!is_object($upload_request) || !isset($upload_request->videos) || !isset($upload_request->useKalturaPlayer)) {
        return;
    }

    $videos = $upload_request->videos;
    $use_kaltura_player = $upload_request->useKalturaPlayer;

    if (LOAD_KALTURA) {
        $is_upload_in_progress = get_option(KalturaUpload::IN_PROGRESS_OPTION);

        if ($is_upload_in_progress === false) {
            // False return value means option does not exist in database yet
            add_option(KalturaUpload::IN_PROGRESS_OPTION, KalturaUpload::NO_VALUE);
        } elseif ($is_upload_in_progress !== KalturaUpload::NO_VALUE) {
            return;
        }

        update_option(KalturaUpload::IN_PROGRESS_OPTION, KalturaUpload::YES_VALUE);
        update_option(KalturaUpload::STOP_UPLOAD_OPTION, KalturaUpload::NO_VALUE, false);
        update_option(KalturaUpload::UPLOAD_ERROR_OPTION, '');

        add_action('shutdown', 'cleanUpKalturaUpload');

        try {
            perform_batched_upload_to_kaltura($videos, $use_kaltura_player);
        } catch (Exception $e) {
            error_log($e->getMessage());
        } finally {
            update_option(KalturaUpload::IN_PROGRESS_OPTION, KalturaUpload::NO_VALUE);
            update_option(KalturaUpload::STOP_UPLOAD_OPTION, KalturaUpload::NO_VALUE, false);
            update_option(KalturaUpload::UPLOAD_ERROR_OPTION, '');
        }
    }
}

function cleanUpKalturaUpload()
{
    update_option(KalturaUpload::IN_PROGRESS_OPTION, KalturaUpload::NO_VALUE);

    $error = error_get_last();
    if ($error['type'] === E_ERROR) {
        // If interrupted by a fatal error, save the error to notify the user
        update_option(KalturaUpload::UPLOAD_ERROR_OPTION, $error['message']);
    }
}

/**
 * Uploads videos to Kaltura.
 *
 * Video files are transferred up to UPLOAD_BATCH_SIZE at a time.
 * At the end of each batch, waits synchronously for all videos in the batch to finish converting (or error),
 * before uploading the next batch.
 *
 * @param array $videos     List of video nodes to upload. These should be objects with the following interface:
 *                          (
 *                              [tapestryID] => 123,
 *                              [nodeID] => 123,
 *                          )
 *                          Nodes are checked to be videos and to be local Wordpress uploads before being uploaded to Kaltura.
 * @param bool $use_kaltura_player   Whether to switch uploaded videos to use the Kaltura media player.
 *
 * @return int The number of videos that were successfully uploaded.
 */
function perform_batched_upload_to_kaltura($videos, $use_kaltura_player)
{
    $current_date = date('Y/m/d');

    $videos_to_upload = create_upload_log($videos);
    add_to_upload_log($videos_to_upload);

    $kalturaApi = new KalturaApi();

    $num_successfully_uploaded = 0;
    $batch_start = 0;

    for ($batch_start; $batch_start < count($videos_to_upload); $batch_start += KalturaUpload::UPLOAD_BATCH_SIZE) {
        // Retrieve fresh value without caching, since we expect the option value to change underneath
        $GLOBALS['wp_object_cache']->delete(KalturaUpload::STOP_UPLOAD_OPTION, 'options');
        $stop_requested = get_option(KalturaUpload::STOP_UPLOAD_OPTION);
        if ($stop_requested === KalturaUpload::YES_VALUE) {
            break;
        }

        $batch = array_slice($videos_to_upload, $batch_start, KalturaUpload::UPLOAD_BATCH_SIZE);

        foreach ($batch as $video) {
            save_video_upload_status($video, $videos_to_upload, UploadStatus::UPLOADING);

            $kaltura_data = null;
            try {
                $kaltura_data = $kalturaApi->uploadVideo($video->file, $current_date);
            } catch (Error $e) {
                $error_msg = "Unable to upload video '".$video->file->name."' to Kaltura due to: ".$e->getMessage();

                error_log($error_msg."\nStack trace: \n".$e->getTraceAsString());

                $video->additionalInfo = $error_msg;
                save_video_upload_status($video, $videos_to_upload, UploadStatus::ERROR);
                continue;
            }

            $video->kalturaID = $kaltura_data->id;
            save_video_upload_status($video, $videos_to_upload, UploadStatus::CONVERTING, $kaltura_data);
        }

        // Filter out videos that did not successfully upload so we don't get an infinite loop
        $remaining_videos = array_filter($batch, function ($vid) {
            return $vid->uploadStatus === UploadStatus::CONVERTING;
        });

        while (count($remaining_videos) > 0) {
            sleep(5);
            $videos_to_remove = array();

            foreach ($remaining_videos as $video) {
                $response = $kalturaApi->getVideoUploadStatus($video->kalturaID);

                if ($response->status === EntryStatus::PRECONVERT) {
                    // Still converting
                    continue;
                }

                if ($response->status === EntryStatus::READY) {
                    $node = save_video_upload_status($video, $videos_to_upload, UploadStatus::COMPLETE);
                    TapestryHelpers::saveAndDeleteLocalVideo($node, $response, $use_kaltura_player, $video->file->file_path);
                    $num_successfully_uploaded++;
                } elseif ($response->status === EntryStatus::ERROR_CONVERTING) {
                    $video->additionalInfo = 'An error occurred: Could not convert the video.';
                    save_video_upload_status($video, $videos_to_upload, UploadStatus::ERROR);
                } else {
                    $video->additionalInfo = 'An error occurred: Expected the video to be converting, but it was not.';
                    save_video_upload_status($video, $videos_to_upload, UploadStatus::ERROR);
                }

                array_push($videos_to_remove, $video);
            }

            $remaining_videos = array_udiff($remaining_videos, $videos_to_remove, function ($video1, $video2) {
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
    for ($i = $batch_start; $i < count($videos_to_upload); $i++) {
        save_video_upload_status($videos_to_upload[$i], $videos_to_upload, UploadStatus::CANCELED);
    }

    return $num_successfully_uploaded;
}

/**
 * Initializes the list of videos to upload.
 * Silently excludes provided videos that are not suitable for upload.
 */
function create_upload_log($videos)
{
    $upload_log = array();
    $timestamp = time(); // Videos in the same upload should be identifiable by the upload time

    foreach ($videos as $video) {
        if (!is_object($video) || !isset($video->tapestryID) || !isset($video->nodeID)) {
            continue;
        }

        $node = new TapestryNode($video->tapestryID, $video->nodeID);
        if (TapestryHelpers::videoCanBeUploaded($node) && TapestryHelpers::checkVideoFileSize($node)) {
            $video_info = (object) [
                'tapestryID' => $video->tapestryID,
                'nodeID' => $video->nodeID,
                'nodeTitle' => $node->getTitle(),
                'uploadStatus' => UploadStatus::NOT_STARTED,
                'file' => TapestryHelpers::getPathToMedia($node),
                'kalturaID' => '',
                'additionalInfo' => '',
                'timestamp' => $timestamp,
            ];
            array_push($upload_log, $video_info);

            $node->getTypeData()->kalturaData = array('uploadStatus' => UploadStatus::NOT_STARTED);
            $node->save();
        }
    }

    return $upload_log;
}

function save_video_upload_status($video, $videos_to_upload, $new_status, $kaltura_data = null)
{
    $video->uploadStatus = $new_status;
    update_upload_log($videos_to_upload);

    $node = new TapestryNode($video->tapestryID, $video->nodeID);
    TapestryHelpers::saveVideoUploadStatusInNode($node, $new_status, $kaltura_data);
    return $node;
}

// Filter the logged videos so that certain information (e.g. the file path of the videos) is not returned
function filter_logged_videos($videos)
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

function add_to_upload_log($videos)
{
    $upload_log = get_option(KalturaUpload::UPLOAD_LOG_OPTION);
    if (!is_array($upload_log)) {
        $upload_log = [];
    }

    array_push($upload_log, ...filter_logged_videos($videos));
    update_option(KalturaUpload::UPLOAD_LOG_OPTION, $upload_log);
}

function update_upload_log($videos)
{
    $upload_log = get_option(KalturaUpload::UPLOAD_LOG_OPTION);
    if (!is_array($upload_log)) {
        $upload_log = [];
    }

    // Replace the same videos at the end of the list
    array_splice($upload_log, -count($videos), count($upload_log), filter_logged_videos($videos));
    update_option(KalturaUpload::UPLOAD_LOG_OPTION, $upload_log);
}

/**
 * Gets progress of ongoing Kaltura upload.
 * Only returns videos in this Tapestry.
 *
 * Query parameters (pagination):
 * - page = which page to return
 * - count = number of entries per page
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
 *  inProgress: true
 * }
 */
function getKalturaUploadStatus($request)
{
    $tapestryPostId = $request['tapestryPostId'];

    // Pagination
    $page = (int) $request['page'];
    $perPage = (int) $request['count'];

    try {
        if (empty($tapestryPostId) || !TapestryHelpers::isValidTapestry($tapestryPostId)) {
            throw new TapestryError('INVALID_POST_ID');
        }

        $videos = get_option(KalturaUpload::UPLOAD_LOG_OPTION, []);
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
            $video->uploadTime = $datetime->format('Y-m-d G:i:s');
            unset($video->timestamp);
        }

        $inProgress = get_option(KalturaUpload::IN_PROGRESS_OPTION) === KalturaUpload::YES_VALUE;
        $error = get_option(KalturaUpload::UPLOAD_ERROR_OPTION, '');
        return (object) [
            'videos' => $videos,
            'totalCount' => $totalCount,    // Number of videos in all pages
            'inProgress' => $inProgress,
            'error' => !empty($error),
        ];
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

/**
 * Forcefully sets the upload to "not in progress".
 * Should only be used as a last resort to fix upload issues.
 */
function forceResetUploadStatus($request)
{
    update_option(KalturaUpload::IN_PROGRESS_OPTION, KalturaUpload::NO_VALUE);
    return (object) [
        'success' => get_option(KalturaUpload::IN_PROGRESS_OPTION) === KalturaUpload::NO_VALUE,
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
 *  { tapestryID: 7746, nodeID: 13004, nodeTitle: "Video" }
 * ]
 */
function getVideosToUpload($request)
{
    try {
        $tapestryPostId = $request['tapestryPostId'];
        return TapestryHelpers::getVideosToUpload($tapestryPostId);
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

function updateConvertingVideos($request)
{
    $body = json_decode($request->get_body());
    $use_kaltura_player = $body->useKalturaPlayer;

    $kaltura_api = new KalturaApi();

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
                && $kalturaData['uploadStatus'] === UploadStatus::CONVERTING) {
                $kalturaID = $kalturaData['id'];
                $response = $kaltura_api->getVideo($kalturaID);

                $video = (object) [
                    'tapestryID' => $post->ID,
                    'nodeID' => $nodeID,
                    'nodeTitle' => $node->getTitle(),
                    'kalturaID' => $kalturaID,
                    'previousStatus' => UploadStatus::CONVERTING,
                    'currentStatus' => UploadStatus::CONVERTING,
                    'additionalInfo' => '',
                ];

                if ($response->status === EntryStatus::READY) {
                    TapestryHelpers::saveVideoUploadStatusInNode($node, UploadStatus::COMPLETE, $response);

                    $file_path = TapestryHelpers::getPathToMedia($node)->file_path;
                    TapestryHelpers::saveAndDeleteLocalVideo($node, $response, $use_kaltura_player, $file_path);

                    $video->currentStatus = UploadStatus::COMPLETE;
                } elseif ($response->status !== EntryStatus::PRECONVERT) {
                    TapestryHelpers::saveVideoUploadStatusInNode($node, UploadStatus::ERROR, $response);
                    $video->currentStatus = UploadStatus::ERROR;
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
    amend_upload_log($videos);

    return (object) [
        'processedVideos' => $videos,
    ];
}

function amend_upload_log($updated_videos)
{
    $node_map = (object) [];

    foreach ($updated_videos as $video) {
        $node_key = $video->tapestryID.'-'.$video->nodeID;
        $node_map->{$node_key} = $video;
    }

    $upload_log = get_option(KalturaUpload::UPLOAD_LOG_OPTION, []);

    // Update the most recent entry in the upload log for each video
    for (end($upload_log); key($upload_log) !== null && !empty($node_map); prev($upload_log)) {
        $video = current($upload_log);

        $node_key = $video->tapestryID.'-'.$video->nodeID;
        $updated_node = $node_map->{$node_key};

        if ($updated_node) {
            $video->uploadStatus = $updated_node->currentStatus;
            $video->additionalInfo = $updated_node->additionalInfo;

            unset($node_map->{$node_key});
        }
    }
    update_option(KalturaUpload::UPLOAD_LOG_OPTION, $upload_log);
}

/**
 * Sends a signal to stop an ongoing Kaltura upload.
 */
function stopKalturaUpload($request)
{
    // This will create the option if it doesn't exist
    update_option(KalturaUpload::STOP_UPLOAD_OPTION, KalturaUpload::YES_VALUE, false);
}

/**
 * Checks whether a Kaltura video with given entry id exists.
 *
 * @return bool Response: true if the video exists, and false otherwise.
 */
function checkKalturaVideo($request)
{
    if (LOAD_KALTURA) {
        $entryId = $request['entry_id'];

        $kaltura_api = new KalturaApi();
        $result = $kaltura_api->getVideo($entryId);

        if ($result != null) {
            return true;
        }
        return false;
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
function getKalturaVideoMeta($request)
{
    if (LOAD_KALTURA) {
        $entryId = $request['entry_id'];

        $kaltura_api = new KalturaApi();
        $result = $kaltura_api->getVideo($entryId);

        if ($result != null) {
            return array("image" => $result->thumbnailUrl, "duration" => $result->duration);
        }
        return false;
    }
}
