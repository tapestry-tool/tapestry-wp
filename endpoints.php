<?php
/**
 * Tapestry Endpoints
 *
 */

require __DIR__ . '/controller/class.tapestry-permissions.php';
require __DIR__ . '/controller/class.tapestry-controller.php';

add_action( 'rest_api_init', function () {	
    register_rest_route('tapestry-tool/v1', '/tapestries/(?P<tapestryPostId>[\d]+)/nodes', array(	
        'methods' => 'POST',	
        'callback' => 'addTapestryNode',	
        'permission_callback' => 'TapestryPermissions::postTapestryNode'
    ));	
});

/**
 * Add a tapestry node
 * @param Object $request
 * @return Object response 
 */
function addTapestryNode($request) {
    $postId = $request['tapestryPostId'];
    $data = json_decode($request->get_body());
    // TODO: JSON validations should happen here
    // make sure that we can only accept one node object at a time
    // adding multiple nodes would require multiple requests from the client
    $tapestryController = new TapestryController($postId);	
    return $tapestryController->addTapestryNode($data);
}

add_action( 'rest_api_init', function () {
    register_rest_route( 'tapestry-tool/v1', '/tapestries', array(
        'methods' => 'POST',
        'callback' => 'updateTapestry',
        'permission_callback' => 'TapestryPermissions::postTapestry'
    ));
});

/**
 * Update/Add a tapestry
 * @param Object $request
 * @return Object response 
 */
function updateTapestry($request) {
    $data = json_decode($request->get_body());
    // TODO: JSON validations should happen here
    $tapestryController = new TapestryController($data->postId);
    return $tapestryController->updateTapestry($data);
}

add_action('rest_api_init', function () {
    register_rest_route('tapestry-tool/v1', '/tapestries/(?P<tapestryPostId>[\d]+)/settings', array(
        'methods' => 'PUT',
        'callback' => 'updateTapestrySettings',
        'permission_callback' => 'TapestryPermissions::putTapestrySettings'
    ));
});

/**
 * Update tapestry settings
 * @param Object $request
 * @return Object response 
 */
function updateTapestrySettings($request) {
    $postId = $request['tapestryPostId'];
    $data = json_decode($request->get_body());
    // TODO: JSON validations should happen here
    $tapestryController = new TapestryController($postId);
    return $tapestryController->updateTapestrySettings($data);
}

add_action('rest_api_init', function () {
    register_rest_route('tapestry-tool/v1', '/tapestries/(?P<tapestryPostId>[\d]+)', array(
        'methods' => 'GET',
        'callback' => 'loadTapestry'
    ));
});

/**
 * Load a tapestry
 * @param Object $request
 * @return Object response 
 */
function loadTapestry($request) {
    $postId = $request['tapestryPostId'];
    $tapestryController = new TapestryController($postId);
    return $tapestryController->getTapestry();
}

add_action('rest_api_init', function () {
    register_rest_route('tapestry-tool/v1', '/tapestries/(?P<tapestryPostId>[\d]+)/groups', array(
        'methods' => 'POST',
        'callback' => 'addTapestryGroup',
        'permission_callback' => 'TapestryPermissions::postTapestryGroup'
    ));
});

/**
 * Add tapestry group
 * @param Object $request
 * @return Object response 
 */
function addTapestryGroup($request) {
    $postId = $request['tapestryPostId'];
    $data = json_decode($request->get_body());
    // TODO: JSON validations should happen here
    // make sure the type of the group body exists and is 'tapestry_group'
    $tapestryController = new TapestryController($postId);
    return $tapestryController->addTapestryGroup($data);
}
