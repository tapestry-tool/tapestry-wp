<?php
/**
 * Tapestry Endpoints
 *
 */

require __DIR__ . '/controller/class.tapestry-permissions.php';
require __DIR__ . '/controller/class.tapestry-controller.php';
require __DIR__ . '/controller/class.user-controller.php';

$REST_API = (object)[
    'NAMESPACE' => 'tapestry-tool/v1',
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
            'permission_callback'   => 'TapestryPermissions::putTapestryNodePermissions'
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
 * POST_TAPESTRY_NODE
 */
add_action(
    'rest_api_init',
    function () use ($REST_API) {
        register_rest_route(
            $REST_API->NAMESPACE,
            $REST_API->POST_TAPESTRY_NODE->ROUTE,
            $REST_API->POST_TAPESTRY_NODE->ARGUMENTS
        );
    }
);
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
 * POST_TAPESTRY
 */
add_action(
    'rest_api_init',
    function () use ($REST_API) {
        register_rest_route(
            $REST_API->NAMESPACE,
            $REST_API->POST_TAPESTRY->ROUTE,
            $REST_API->POST_TAPESTRY->ARGUMENTS
        );
    }
);
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
 * PUT_TAPESTRY_SETTINGS
 */
add_action(
    'rest_api_init',
    function () use ($REST_API) {
        register_rest_route(
            $REST_API->NAMESPACE,
            $REST_API->PUT_TAPESTRY_SETTINGS->ROUTE,
            $REST_API->PUT_TAPESTRY_SETTINGS->ARGUMENTS
        );
    }
);
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
 * GET_TAPESTRY
 */
add_action(
    'rest_api_init',
    function () use ($REST_API) {
        register_rest_route(
            $REST_API->NAMESPACE,
            $REST_API->GET_TAPESTRY->ROUTE,
            $REST_API->GET_TAPESTRY->ARGUMENTS
        );
    }
);
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
 * POST_TAPESTRY_GROUP
 */
add_action(
    'rest_api_init',
    function () use ($REST_API) {
        register_rest_route(
            $REST_API->NAMESPACE,
            $REST_API->POST_TAPESTRY_GROUP->ROUTE,
            $REST_API->POST_TAPESTRY_GROUP->ARGUMENTS
        );
    }
);
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
 * PUT_TAPESTRY_NODE_PERMISSIONS
 */
add_action(
    'rest_api_init',
    function () use ($REST_API) {
        register_rest_route(
            $REST_API->NAMESPACE,
            $REST_API->PUT_TAPESTRY_NODE_PERMISSIONS->ROUTE,
            $REST_API->PUT_TAPESTRY_NODE_PERMISSIONS->ARGUMENTS
        );
    }
);
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
 * POST_TAPESTRY_LINK
 */
add_action(
    'rest_api_init',
    function () use ($REST_API) {
        register_rest_route(
            $REST_API->NAMESPACE,
            $REST_API->POST_TAPESTRY_LINK->ROUTE,
            $REST_API->POST_TAPESTRY_LINK->ARGUMENTS
        );
    }
);
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

/* User endpoints */

/**
 * GET_TAPESTRY_PROGRESS
 */
add_action( 
    'rest_api_init',
    function () use ($REST_API) {
        register_rest_route(
            $REST_API->NAMESPACE,
            $REST_API->GET_TAPESTRY_PROGRESS->ROUTE,
            $REST_API->GET_TAPESTRY_PROGRESS->ARGUMENTS
        );
    }
);

/**
 * Get user progress on a tapestry page by post id. 
 * Example: /wp-json/tapestry-tool/v1/users/progress?post_id=44
 * 
 * @param   Object  $request    HTTP request
 * 
 * @return  Object  $response   HTTP response
 */
function getUserProgressByPostId($data) {
    $postId = $data['post_id'];
    $tapestryController = new TapestryController($postId);
    $nodeIdArr = $tapestryController->getTapestryNodeIds();

    $userController = new TapestryUserController;
    return $userController->getProgress($postId, $nodeIdArr);
}

/**
 * UPDATE_TAPESTRY_PROGRESS
 */
add_action( 
    'rest_api_init',
    function () use ($REST_API) {
        register_rest_route(
            $REST_API->NAMESPACE,
            $REST_API->UPDATE_TAPESTRY_PROGRESS->ROUTE,
            $REST_API->UPDATE_TAPESTRY_PROGRESS->ARGUMENTS
        );
    }
);


/**
 * Update a single node progress by passing in node id, post id and progress value
 * Example: /wp-json/tapestry-tool/v1/users/progress?post_id=44&node_id=1&progress_value=0.2
 * 
 * @param   Object  $request    HTTP request
 * 
 */
function updateProgressByNodeId($data) {
    $userController = new TapestryUserController;
    $postId = $data['post_id'];
    $nodeId = $data['node_id'];
    $progressValue = $data['progress_value'];
    $userController->updateProgress($postId, $nodeId, $progressValue);
}

/**
 * GET_H5P_SETTING
 */
add_action( 
    'rest_api_init',
    function () use ($REST_API) {
        register_rest_route(
            $REST_API->NAMESPACE,
            $REST_API->GET_H5P_SETTING->ROUTE,
            $REST_API->GET_H5P_SETTING->ARGUMENTS
        );
    }
);

/**
 * Get user h5p video setting on a tapestry page by post id. Will need to pass these as query parameters
 * Example: /wp-json/tapestry-tool/v1/users/h5psettings?post_id=42
 * 
 * @param   Object  $request    HTTP request
 * 
 * @return  Object  $response   HTTP response
 */
function getUserU5PSettingsByPostId($data) {
    $postId = $data['post_id'];
    $userController = new TapestryUserController;
    return $userController->getH5PSettings($postId);
}

/**
 * UPDATE_H5P_SETTING
 */
add_action( 
    'rest_api_init',
    function () use ($REST_API) {
        register_rest_route(
            $REST_API->NAMESPACE,
            $REST_API->UPDATE_H5P_SETTING->ROUTE,
            $REST_API->UPDATE_H5P_SETTING->ARGUMENTS
        );
    }
);

/**
 * Update the user's h5p settings by post id
 * Example: /wp-json/tapestry-tool/v1/users/h5psettings?post_id=44&json={"volume":100,"muted":false,"caption":null,"quality":"q1","playbackRate":0.5,"time":11.934346}
 * 
 * @param   Object  $request    HTTP request
 * 
 */
function updateUserH5PSettingsByPostId($data) {
    $userController = new TapestryUserController;
    $postId = $data['post_id'];
    $json = $data['json'];
    $userController->updateH5PSettings($postId, $json);
}