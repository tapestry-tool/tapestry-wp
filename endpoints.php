<?php
/**
 * Tapestry Endpoints
 *
 */

require __DIR__ . '/controller/class.tapestry-permissions.php';
require __DIR__ . '/controller/class.tapestry-controller.php';

$REST_API = (object)[
    'NAMESPACE' => 'tapestry-tool/v1',
    'POST_TAPESTRY_NODE' => (object)[
        'ROUTE' => '/tapestries/(?P<tapestryPostId>[\d]+)/nodes',
        'ARGUMENTS' => [
            'methods' => 'POST',
            'callback' => 'addTapestryNode',
            'permission_callback' => 'TapestryPermissions::postTapestryNode'
        ]
    ],
    'POST_TAPESTRY' => (object)[
        'ROUTE' => '/tapestries',
        'ARGUMENTS' => [
            'methods' => 'POST',
            'callback' => 'updateTapestry',
            'permission_callback' => 'TapestryPermissions::postTapestry'
        ]
    ],
    'PUT_TAPESTRY_SETTINGS' => (object)[
        'ROUTE' => '/tapestries/(?P<tapestryPostId>[\d]+)/settings',
        'ARGUMENTS' => [
            'methods' => 'PUT',
            'callback' => 'updateTapestrySettings',
            'permission_callback' => 'TapestryPermissions::putTapestrySettings'
        ]
    ],
    'GET_TAPESTRY' => (object)[
        'ROUTE' => '/tapestries/(?P<tapestryPostId>[\d]+)',
        'ARGUMENTS' => [
            'methods' => 'GET',
            'callback' => 'getTapestry'
        ]
    ],
    'POST_TAPESTRY_GROUP' => (object)[
        'ROUTE' => '/tapestries/(?P<tapestryPostId>[\d]+)/groups',
        'ARGUMENTS' => [
            'methods' => 'POST',
            'callback' => 'addTapestryGroup',
            'permission_callback' => 'TapestryPermissions::postTapestryGroup'
        ]
    ],
    'PUT_TAPESTRY_NODE_PERMISSIONS' => (object)[
        'ROUTE' => '/tapestries/(?P<tapestryPostId>[\d]+)/nodes/(?P<nodeMetaId>[\d]+)/permissions',
        'ARGUMENTS' => [
            'methods' => 'PUT',
            'callback' => 'updateTapestryNodePermissions',
            'permission_callback' => 'TapestryPermissions::putTapestryNodePermissions'
        ]
    ]
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
 * @param Object $request
 * 
 * @return Object response 
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
 * Update/Add a tapestry
 * 
 * @param Object $request
 * 
 * @return Object response 
 */
function updateTapestry($request)
{
    $data = json_decode($request->get_body());
    // TODO: JSON validations should happen here
    $tapestryController = new TapestryController($data->postId);
    return $tapestryController->updateTapestry($data);
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
 * @param Object $request
 * 
 * @return Object response 
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
 * @param Object $request
 * 
 * @return Object response 
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
 * @param Object $request
 *
 * @return Object response 
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
 * @param Object $request
 *
 * @return Object response 
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
