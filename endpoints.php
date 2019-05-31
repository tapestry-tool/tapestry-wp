<?php
/**
 * Tapestry Endpoints
 *
 */

require __DIR__ . '/controller/class.tapestry-permissions.php';
require __DIR__ . '/controller/class.tapestry-controller.php';
require __DIR__ . '/controller/class.user-controller.php';

 // User endpoints

// Get user progress on a tapestry page by post id. 
// Example: /wp-json/tapestry-tool/v1/users/progress?post_id=44
add_action( 'rest_api_init', function () {
    register_rest_route( 'tapestry-tool/v1', 'users/progress/', array(
        'methods' => 'GET',
        'callback' => 'tapestry_get_user_progress_by_post_id',
    ));
});
function tapestry_get_user_progress_by_post_id($data) {
    $postId = $data['post_id'];
    $tapestryController = new TapestryController($postId);
    $nodeIdArr = $tapestryController->getTapestryNodeIds();

    $userController = new TapestryUserController;
    return $userController->getProgress($postId, $nodeIdArr);
}

// Update a single node progress by passing in node id, post id and progress value
// Example: /wp-json/tapestry-tool/v1/users/progress?post_id=44&node_id=1&progress_value=0.2
add_action( 'rest_api_init', function () {
    register_rest_route( 'tapestry-tool/v1', '/users/progress/', array(
        'methods' => 'POST',
        'callback' => 'tapestry_update_user_progress_by_node_id',
    ));
});
function tapestry_update_user_progress_by_node_id($data) {
    $userController = new TapestryUserController;
    $postId = $data['post_id'];
    $nodeId = $data['node_id'];
    $progressValue = $data['progress_value'];
    $userController->updateProgress($postId, $nodeId, $progressValue);
}

// Get user h5p video setting on a tapestry page by post id. Will need to pass these as query parameters
// Example: /wp-json/tapestry-tool/v1/users/h5psettings?post_id=42
add_action( 'rest_api_init', function () {
    register_rest_route( 'tapestry-tool/v1', 'users/h5psettings/', array(
        'methods' => 'GET',
        'callback' => 'tapestry_get_user_h5p_settings_by_post_id',
    ));
});
function tapestry_get_user_h5p_settings_by_post_id($data) {
    $postId = $data['post_id'];
    $userController = new TapestryUserController;
    return $userController->getH5PSettings($postId);
}

// Get the user h5p settings by post id
// Example: /wp-json/tapestry-tool/v1/users/h5psettings?post_id=44&json={"volume":100,"muted":false,"caption":null,"quality":"q1","playbackRate":0.5,"time":11.934346}
add_action( 'rest_api_init', function () {
    register_rest_route( 'tapestry-tool/v1', '/users/h5psettings/', array(
        'methods' => 'POST',
        'callback' => 'tapestry_update_user_h5p_settings_by_post_id',
    ));
});
function tapestry_update_user_h5p_settings_by_post_id($data) {
    $userController = new TapestryUserController;
    $postId = $data['post_id'];
    $json = $data['json'];
    $userController->updateH5PSettings($postId, $json);
}

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
