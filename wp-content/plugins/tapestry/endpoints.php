<?php
/**
 * Tapestry Endpoints
 *
 */

require __DIR__ . '/controller/class.user-controller.php';

 // User endpoints

// Get user's progress
add_action( 'rest_api_init', function () {
    register_rest_route( 'tapestry-tool/v1', 'users/progress/', array(
      'methods' => 'GET',
      'callback' => 'tapestry_get_user_progress_by_post_id',
    ) );
});

// Get user progress on a tapestry page by user id and post id. Will need to pass these as query parameters
// Example: http://localhost:8888/tapestry-wp/wp-json/tapestry-tool/v1/users/progress?user_id=1&post_id=42
function tapestry_get_user_progress_by_post_id($data) {
    $userId = $data['user_id'];
    $postId = $data['post_id'];
    $userController = new TapestryUserController;
    return $userController->getProgress($userId, $postId);
}

add_action( 'rest_api_init', function () {
    register_rest_route( 'tapestry-tool/v1', '/users/progress/', array(
      'methods' => 'POST',
      'callback' => 'tapestry_update_user_progress_by_post_id',
    ) );
});

// Example: http://localhost:8888/tapestry-wp/wp-json/tapestry-tool/v1/users/progress?user_id=1&post_id=44&json={"32":0.5,"33":0,"34":0,"35":0,"36":0,"37":0,"38":0,"39":0,"40":0,"41":0}
function tapestry_update_user_progress_by_post_id($data) {
    $userController = new TapestryUserController;
    $userId = $data['user_id'];
    $postId = $data['post_id'];
    $json = $data['json'];
    $userController->updateProgress($userId, $postId, $json);
}

// Get user's h5p video settings
add_action( 'rest_api_init', function () {
    register_rest_route( 'tapestry-tool/v1', 'users/h5psettings/', array(
      'methods' => 'GET',
      'callback' => 'tapestry_get_user_h5p_settings_by_post_id',
    ) );
});

// Get user h5p video setting on a tapestry page by user id and post id. Will need to pass these as query parameters
// Example: http://localhost:8888/tapestry-wp/wp-json/tapestry-tool/v1/users/h5psettings?user_id=1&post_id=42
function tapestry_get_user_h5p_settings_by_post_id($data) {
    $userId = $data['user_id'];
    $postId = $data['post_id'];
    $userController = new TapestryUserController;
    return $userController->getH5PSetting($userId, $postId);
}

add_action( 'rest_api_init', function () {
    register_rest_route( 'tapestry-tool/v1', '/users/h5psettings/', array(
      'methods' => 'POST',
      'callback' => 'tapestry_update_user_h5p_settings_by_post_id',
    ) );
});

// Example: http://localhost:8888/tapestry-wp/wp-json/tapestry-tool/v1/users/h5psettings?user_id=1&post_id=44&json={"volume":100,"muted":false,"caption":null,"quality":"q1","playbackRate":0.5,"time":11.934346}
function tapestry_update_user_h5p_settings_by_post_id($data) {
    $userController = new TapestryUserController;
    $userId = $data['user_id'];
    $postId = $data['post_id'];
    $json = $data['json'];
    $userController->updateH5PSetting($userId, $postId, $json);
}