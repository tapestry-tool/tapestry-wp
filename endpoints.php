<?php
/**
 * Tapestry Endpoints
 *
 */

require __DIR__ . '/controller/class.tapestry-permissions.php';
require __DIR__ . '/controller/class.tapestry-controller.php';
require __DIR__ . '/controller/class.user-controller.php';

$REST_API_NAMESPACE = 'tapestry-tool/v1';
$REST_API_ENDPOINTS = [
    'POST_TAPESTRY_NODE' => (object)[
        'ROUTE'     => '/tapestries/(?P<tapestryPostId>[\d]+)/nodes',
        'ARGUMENTS' => [
            'methods'               => 'POST',
            'callback'              => 'addTapestryNode',
            'permission_callback'   => 'TapestryPermissions::postTapestryNode'
        ]
    ],
    'POST_TAPESTRY' => (object)[
        'ROUTE'     => '/tapestries',
        'ARGUMENTS' => [
            'methods'               => 'POST',
            'callback'              => 'addTapestry',
            'permission_callback'   => 'TapestryPermissions::postTapestry'
        ]
    ],
    'PUT_TAPESTRY_SETTINGS' => (object)[
        'ROUTE'     => '/tapestries/(?P<tapestryPostId>[\d]+)/settings',
        'ARGUMENTS' => [
            'methods'               => 'PUT',
            'callback'              => 'updateTapestrySettings',
            'permission_callback'   => 'TapestryPermissions::putTapestrySettings'
        ]
    ],
    'GET_TAPESTRY' => (object)[
        'ROUTE'     => '/tapestries/(?P<tapestryPostId>[\d]+)',
        'ARGUMENTS' => [
            'methods'   => 'GET',
            'callback'  => 'getTapestry'
        ]
    ],
    'POST_TAPESTRY_GROUP' => (object)[
        'ROUTE'     => '/tapestries/(?P<tapestryPostId>[\d]+)/groups',
        'ARGUMENTS' => [
            'methods'               => 'POST',
            'callback'              => 'addTapestryGroup',
            'permission_callback'   => 'TapestryPermissions::postTapestryGroup'
        ]
    ],
    'PUT_TAPESTRY_NODE_PERMISSIONS' => (object)[
        'ROUTE'     => '/tapestries/(?P<tapestryPostId>[\d]+)/nodes/(?P<nodeMetaId>[\d]+)/permissions',
        'ARGUMENTS' => [
            'methods'               => 'PUT',
            'callback'              => 'updateTapestryNodePermissions',
            'permission_callback'   => 'TapestryPermissions::putTapestryNodeProperties'
        ]
    ],
    'PUT_TAPESTRY_NODE_TITLE' => (object)[
        'ROUTE'     => '/tapestries/(?P<tapestryPostId>[\d]+)/nodes/(?P<nodeMetaId>[\d]+)/title',
        'ARGUMENTS' => [
            'methods'               => 'PUT',
            'callback'              => 'updateTapestryNodeTitle',
            'permission_callback'   => 'TapestryPermissions::putTapestryNodeProperties'
        ]
    ],
    'PUT_TAPESTRY_NODE_IMAGE_URL' => (object)[
        'ROUTE'     => '/tapestries/(?P<tapestryPostId>[\d]+)/nodes/(?P<nodeMetaId>[\d]+)/imageURL',
        'ARGUMENTS' => [
            'methods'               => 'PUT',
            'callback'              => 'updateTapestryNodeImageUrl',
            'permission_callback'   => 'TapestryPermissions::putTapestryNodeProperties'
        ]
    ],
    'PUT_TAPESTRY_NODE_UNLOCKED_STATUS' => (object)[
        'ROUTE'     => '/tapestries/(?P<tapestryPostId>[\d]+)/nodes/(?P<nodeMetaId>[\d]+)/unlocked',
        'ARGUMENTS' => [
            'methods'               => 'PUT',
            'callback'              => 'updateTapestryNodeUnlockedStatus',
            'permission_callback'   => 'TapestryPermissions::putTapestryNodeProperties'
        ]
    ],
    'PUT_TAPESTRY_NODE_TYPE_DATA' => (object)[
        'ROUTE'     => '/tapestries/(?P<tapestryPostId>[\d]+)/nodes/(?P<nodeMetaId>[\d]+)/typeData',
        'ARGUMENTS' => [
            'methods'               => 'PUT',
            'callback'              => 'updateTapestryNodeTypeData',
            'permission_callback'   => 'TapestryPermissions::putTapestryNodeProperties'
        ]
    ],
    'PUT_TAPESTRY_NODE_COORDINATES' => (object)[
        'ROUTE'     => '/tapestries/(?P<tapestryPostId>[\d]+)/nodes/(?P<nodeMetaId>[\d]+)/coordinates',
        'ARGUMENTS' => [
            'methods'               => 'PUT',
            'callback'              => 'updateTapestryNodeCoordinates',
            'permission_callback'   => 'TapestryPermissions::putTapestryNodeProperties'
        ]
    ],
    'POST_TAPESTRY_LINK' => (object)[
        'ROUTE'     => '/tapestries/(?P<tapestryPostId>[\d]+)/links',
        'ARGUMENTS' => [
            'methods'               => 'POST',
            'callback'              => 'addTapestryLink',
            'permission_callback'   => 'TapestryPermissions::postTapestryLink'
        ]
    ],
    'GET_TAPESTRY_PROGRESS' => (object)[
        'ROUTE'     => 'users/progress',
        'ARGUMENTS' => [
            'methods'               => 'GET',
            'callback'              => 'getUserProgressByPostId',
        ]
    ],
    'UPDATE_TAPESTRY_PROGRESS' => (object)[
        'ROUTE'     => 'users/progress',
        'ARGUMENTS' => [
            'methods'               => 'POST',
            'callback'              => 'updateProgressByNodeId',
        ]
    ],
    'GET_H5P_SETTING' => (object)[
        'ROUTE'     => 'users/h5psettings',
        'ARGUMENTS' => [
            'methods'               => 'GET',
            'callback'              => 'getUserU5PSettingsByPostId',
        ]
    ],
    'UPDATE_H5P_SETTING' => (object)[
        'ROUTE'     => 'users/h5psettings',
        'ARGUMENTS' => [
            'methods'               => 'POST',
            'callback'              => 'updateUserH5PSettingsByPostId',
        ]
    ],
];

/**
 * REGISTER API ENDPOINTS
 */
foreach ($REST_API_ENDPOINTS as $ENDPOINT) {
    add_action(
        'rest_api_init',
        function () use ($ENDPOINT, $REST_API_NAMESPACE) {
            register_rest_route(
                $REST_API_NAMESPACE,
                $ENDPOINT->ROUTE,
                $ENDPOINT->ARGUMENTS
            );
        }
    );
}

/**
 * Add a tapestry node
 * 
 * @param   Object  $request    HTTP request
 * 
 * @return  Object  HTTP response 
 */
function addTapestryNode($request)
{
    $postId = $request['tapestryPostId'];
    $data = json_decode($request->get_body());
    // TODO: JSON validations should happen here
    // make sure that we can only accept one node object at a time
    // adding multiple nodes would require multiple requests from the client
    $tapestryController = new TapestryController($postId);
    return $tapestryController->addTapestryNode($data);
}

/**
 * Add a tapestry
 * 
 * @param   Object  $request    HTTP request
 * 
 * @return  Object  $response   HTTP response
 */
function addTapestry($request)
{
    $data = json_decode($request->get_body());
    // TODO: JSON validations should happen here
    $tapestryController = new TapestryController();
    return $tapestryController->addTapestry($data);
}

/**
 * Update Tapestry Settings
 * 
 * @param   Object  $request    HTTP request
 * 
 * @return  Object  $response   HTTP response 
 */
function updateTapestrySettings($request)
{
    $postId = $request['tapestryPostId'];
    $data = json_decode($request->get_body());
    // TODO: JSON validations should happen here
    $tapestryController = new TapestryController($postId);
    return $tapestryController->updateTapestrySettings($data);
}

/**
 * Get a Tapestry
 * 
 * @param   Object  $request    HTTP request
 * 
 * @return  Object  $response   HTTP response
 */
function getTapestry($request)
{
    $postId = $request['tapestryPostId'];
    $tapestryController = new TapestryController($postId);
    return $tapestryController->getTapestry();
}

/**
 * Add a Tapestry Group
 * 
 * @param   Object  $request    HTTP request
 * 
 * @return  Object  $response   HTTP response
 */
function addTapestryGroup($request)
{
    $postId = $request['tapestryPostId'];
    $data = json_decode($request->get_body());
    // TODO: JSON validations should happen here
    // make sure the type of the group body exists and is 'tapestry_group'
    $tapestryController = new TapestryController($postId);
    return $tapestryController->addTapestryGroup($data);
}

/**
 * Update Tapestry Node Permissions
 * 
 * @param   Object  $request    HTTP request
 * 
 * @return  Object  $response   HTTP response
 */
function updateTapestryNodePermissions($request)
{
    $postId = $request['tapestryPostId'];
    $nodeMetaId = $request['nodeMetaId'];
    $data = json_decode($request->get_body());
    // TODO: JSON validations should happen here
    // make sure the permissions body exists and not null
    $tapestryController = new TapestryController($postId);
    return $tapestryController->updateTapestryNodePermissions($nodeMetaId, $data);
}

/**
 * Update Tapestry Node Title
 * 
 * @param   Object  $request    HTTP request
 * 
 * @return  Object  $response   HTTP response
 */
function updateTapestryNodeTitle($request)
{
    $postId = $request['tapestryPostId'];
    $nodeMetaId = $request['nodeMetaId'];
    $data = json_decode($request->get_body());
    // TODO: JSON validations should happen here
    // make sure the title exists and not null
    $tapestryController = new TapestryController($postId);
    return $tapestryController->updateTapestryNodeTitle($nodeMetaId, $data);
}

/**
 * Update Tapestry Node Image Url
 * 
 * @param   Object  $request    HTTP request
 * 
 * @return  Object  $response   HTTP response
 */
function updateTapestryNodeImageUrl($request)
{
    $postId = $request['tapestryPostId'];
    $nodeMetaId = $request['nodeMetaId'];
    $data = json_decode($request->get_body());
    // TODO: JSON validations should happen here
    // make sure the image url exists and not null
    $tapestryController = new TapestryController($postId);
    return $tapestryController->updateTapestryNodeImageUrl($nodeMetaId, $data);
}

/**
 * Update Tapestry Node Unlocked Status
 * 
 * @param   Object  $request    HTTP request
 * 
 * @return  Object  $response   HTTP response
 */
function updateTapestryNodeUnlockedStatus($request)
{
    $postId = $request['tapestryPostId'];
    $nodeMetaId = $request['nodeMetaId'];
    $data = json_decode($request->get_body());
    // TODO: JSON validations should happen here
    // make sure the unlocked status exists and not null
    $tapestryController = new TapestryController($postId);
    return $tapestryController->updateTapestryNodeUnlockedStatus($nodeMetaId, $data);
}

/**
 * Update Tapestry Node Type Data
 * 
 * @param   Object  $request    HTTP request
 * 
 * @return  Object  $response   HTTP response
 */
function updateTapestryNodeTypeData($request)
{
    $postId = $request['tapestryPostId'];
    $nodeMetaId = $request['nodeMetaId'];
    $data = json_decode($request->get_body());
    // TODO: JSON validations should happen here
    // make sure the type data exists and not null
    $tapestryController = new TapestryController($postId);
    return $tapestryController->updateTapestryNodeTypeData($nodeMetaId, $data);
}

/**
 * Update Tapestry Node Coordinates
 * 
 * @param   Object  $request    HTTP request
 * 
 * @return  Object  $response   HTTP response
 */
function updateTapestryNodeCoordinates($request)
{
    $postId = $request['tapestryPostId'];
    $nodeMetaId = $request['nodeMetaId'];
    $data = json_decode($request->get_body());
    // TODO: JSON validations should happen here
    // make sure the coordinates exists and not null
    $tapestryController = new TapestryController($postId);
    return $tapestryController->updateTapestryNodeCoordinates($nodeMetaId, $data);
}

/**
 * Add A Tapestry Link
 * 
 * @param   Object  $request    HTTP request
 * 
 * @return  Object  $response   HTTP response
 */
function addTapestryLink($request)
{
    $postId = $request['tapestryPostId'];
    $data = json_decode($request->get_body());
    // TODO: JSON validations should happen here
    // make sure the link object has all required attibutes - src, target etc.
    $tapestryController = new TapestryController($postId);
    return $tapestryController->addTapestryLink($data);
}

/**
 * Get user progress on a tapestry page by post id. 
 * Example: /wp-json/tapestry-tool/v1/users/progress?post_id=44
 * 
 * @param Object $request HTTP request
 * 
 * @return Object $response HTTP response
 */
function getUserProgressByPostId($request)
{
    $postId = $request['post_id'];
    $tapestryController = new TapestryController($postId);
    $nodeIdArr = $tapestryController->getTapestryNodeIds();

    $userController = new TapestryUserController;
    return $userController->getProgress($postId, $nodeIdArr);
}

/**
 * Update a single node progress by passing in node id, post id and progress value
 * Example: /wp-json/tapestry-tool/v1/users/progress?post_id=44&node_id=1&progress_value=0.2
 * 
 * @param Object $request HTTP request
 * 
 */
function updateProgressByNodeId($request)
{
    $userController = new TapestryUserController;
    $postId = $request['post_id'];
    $nodeId = $request['node_id'];
    $progressValue = $request['progress_value'];
    $userController->updateProgress($postId, $nodeId, $progressValue);
}

/**
 * Get user h5p video setting on a tapestry page by post id. Will need to pass these as query parameters
 * Example: /wp-json/tapestry-tool/v1/users/h5psettings?post_id=42
 * 
 * @param Object $request HTTP request
 * 
 * @return Object $response HTTP response
 */
function getUserU5PSettingsByPostId($request)
{
    $postId = $request['post_id'];
    $userController = new TapestryUserController;
    return $userController->getH5PSettings($postId);
}

/**
 * Update the user's h5p settings by post id
 * Example: /wp-json/tapestry-tool/v1/users/h5psettings?post_id=44&json={"volume":100,"muted":false,"caption":null,"quality":"q1","playbackRate":0.5,"time":11.934346}
 * 
 * @param Object $request HTTP request
 * 
 */
function updateUserH5PSettingsByPostId($request)
{
    $userController = new TapestryUserController;
    $postId = $request['post_id'];
    $json = $request['json'];
    $userController->updateH5PSettings($postId, $json);
}
