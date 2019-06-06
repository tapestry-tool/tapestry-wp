<?php
/**
 * Tapestry Endpoints
 *
 */

require __DIR__ . '/controller/class.tapestry-permissions.php';
require __DIR__ . '/controller/class.tapestry-controller.php';

$REST_API = (object)[
    'NAMESPACE' => 'tapestry-tool/v1',
    'POST_TAPESTRY_LINK' => (object)[
        'ROUTE' => '/tapestries/(?P<tapestryPostId>[\d]+)/links',
        'ARGUMENTS' => [
            'methods' => 'POST',
            'callback' => 'addTapestryLink',
            'permission_callback' => 'TapestryPermissions::postTapestryLink'
        ]
    ]
];

/**
 * Add a tapestry node
 * 
 * @param Object $request
 * 
 * @return Object response 
 */
add_action( 'rest_api_init', function () {	
    register_rest_route('tapestry-tool/v1', '/tapestries/(?P<tapestryPostId>[\d]+)/nodes', array(	
        'methods' => 'POST',	
        'callback' => 'addTapestryNode',	
        'permission_callback' => 'TapestryPermissions::postTapestryNode'
    ));	
});
function addTapestryNode($request) {
    $postId = $request['tapestryPostId'];
    $data = json_decode($request->get_body());
    // TODO: JSON validations should happen here
    // make sure that we can only accept one node object at a time
    // adding multiple nodes would require multiple requests from the client
    $tapestryController = new TapestryController($postId);	
    return $tapestryController->addTapestryNode($data);
}

/**
 * Update/Add a tapestry
 * 
 * @param Object $request
 * 
 * @return Object response 
 */
add_action( 'rest_api_init', function () {
    register_rest_route( 'tapestry-tool/v1', '/tapestries', array(
        'methods' => 'POST',
        'callback' => 'updateTapestry',
        'permission_callback' => 'TapestryPermissions::postTapestry'
    ));
});
function updateTapestry($request) {
    $data = json_decode($request->get_body());
    // TODO: JSON validations should happen here
    $tapestryController = new TapestryController($data->postId);
    return $tapestryController->updateTapestry($data);
}

/**
 * Update tapestry settings
 * 
 * @param Object $request
 * 
 * @return Object response 
 */
add_action('rest_api_init', function () {
    register_rest_route('tapestry-tool/v1', '/tapestries/(?P<tapestryPostId>[\d]+)/settings', array(
        'methods' => 'PUT',
        'callback' => 'updateTapestrySettings',
        'permission_callback' => 'TapestryPermissions::putTapestrySettings'
    ));
});
function updateTapestrySettings($request) {
    $postId = $request['tapestryPostId'];
    $data = json_decode($request->get_body());
    // TODO: JSON validations should happen here
    $tapestryController = new TapestryController($postId);
    return $tapestryController->updateTapestrySettings($data);
}

/**
 * Load a tapestry
 * 
 * @param Object $request
 * 
 * @return Object response 
 */
add_action('rest_api_init', function () {
    register_rest_route('tapestry-tool/v1', '/tapestries/(?P<tapestryPostId>[\d]+)', array(
        'methods' => 'GET',
        'callback' => 'loadTapestry'
    ));
});
function loadTapestry($request) {
    $postId = $request['tapestryPostId'];
    $tapestryController = new TapestryController($postId);
    return $tapestryController->getTapestry();
}

/**
 * Add tapestry group
 * 
 * @param Object $request
 *
 * @return Object response 
 */
add_action('rest_api_init', function () {
    register_rest_route('tapestry-tool/v1', '/tapestries/(?P<tapestryPostId>[\d]+)/groups', array(
        'methods' => 'POST',
        'callback' => 'addTapestryGroup',
        'permission_callback' => 'TapestryPermissions::postTapestryGroup'
    ));
});
function addTapestryGroup($request) {
    $postId = $request['tapestryPostId'];
    $data = json_decode($request->get_body());
    // TODO: JSON validations should happen here
    // make sure the type of the group body exists and is 'tapestry_group'
    $tapestryController = new TapestryController($postId);
    return $tapestryController->addTapestryGroup($data);
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
 * @param Object $request HTTP request
 *
 * @return Object HTTP response
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
