<?php
/**
 * Tapestry Endpoints
 *
 */

require __DIR__ . '/controller/class.tapestry-permissions.php';
require __DIR__ . '/controller/class.tapestry-controller.php';
require __DIR__ . '/controller/class.user-controller.php';

 // User endpoints

// Get user's progress
add_action( 'rest_api_init', function () {
    register_rest_route( 'tapestry-tool/v1', 'users/progress/', array(
      'methods' => 'GET',
      'callback' => 'tapestry_get_user_progress_by_post_id',
    ) );
});

// Get user progress on a tapestry page by post id, list of node ids for a tapestry. Will need to pass these as query parameters
// Example: http://localhost:8888/tapestry-wp/wp-json/tapestry-tool/v1/users/progress?post_id=44&node_id_arr=[1,2,3,4,5,6]
function tapestry_get_user_progress_by_post_id($data) {
    $postId = $data['post_id'];
    $nodeIdArr = $data['node_id_arr'];
    $userController = new TapestryUserController;
    return $userController->getProgress($postId, $nodeIdArr);
}

add_action( 'rest_api_init', function () {
    register_rest_route( 'tapestry-tool/v1', '/users/progress/', array(
      'methods' => 'POST',
      'callback' => 'tapestry_update_user_progress_by_node_id',
    ) );
});

// Update a single node progress by passing in node id, post id and progress value
// Example: http://localhost:8888/tapestry-wp/wp-json/tapestry-tool/v1/users/progress?post_id=44&node_id=1&progress_value=0.2
function tapestry_update_user_progress_by_node_id($data) {
    $userController = new TapestryUserController;
    $postId = $data['post_id'];
    $nodeId = $data['node_id'];
    $progressValue = $data['progress_value'];
    $userController->updateProgress($postId, $nodeId, $progressValue);
}

// Get user's h5p video settings
add_action( 'rest_api_init', function () {
    register_rest_route( 'tapestry-tool/v1', 'users/h5psettings/', array(
      'methods' => 'GET',
      'callback' => 'tapestry_get_user_h5p_settings_by_post_id',
    ) );
});

// Get user h5p video setting on a tapestry page by post id. Will need to pass these as query parameters
// Example: http://localhost:8888/tapestry-wp/wp-json/tapestry-tool/v1/users/h5psettings?post_id=42
function tapestry_get_user_h5p_settings_by_post_id($data) {
    $postId = $data['post_id'];
    $userController = new TapestryUserController;
    return $userController->getH5PSettings($postId);
}

add_action( 'rest_api_init', function () {
    register_rest_route( 'tapestry-tool/v1', '/users/h5psettings/', array(
      'methods' => 'POST',
      'callback' => 'tapestry_update_user_h5p_settings_by_post_id',
    ) );
});

// Example: http://localhost:8888/tapestry-wp/wp-json/tapestry-tool/v1/users/h5psettings?post_id=44&json={"volume":100,"muted":false,"caption":null,"quality":"q1","playbackRate":0.5,"time":11.934346}
function tapestry_update_user_h5p_settings_by_post_id($data) {
    $userController = new TapestryUserController;
    $postId = $data['post_id'];
    $json = $data['json'];
    $userController->updateH5PSettings($postId, $json);
}

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

add_action('rest_api_init', function () {
    register_rest_route('tapestry-tool/v1', '/tapestries/(?P<id>[\d]+)', array(
        'methods' => 'GET',
        'callback' => 'loadTapestry'
    ));
});

function loadTapestry($request) {
    $postId = $request['id'];
    $tapestryController = new TapestryController($postId);
    return $tapestryController->getTapestry();
}
