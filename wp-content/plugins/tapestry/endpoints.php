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
      'callback' => 'get_user_progress_by_post_id',
    ) );
});

// Get user progress on a tapestry page by user id and post id. Will need to pass these as query parameters
// Example: http://localhost:8888/tapestry-wp/wp-json/tapestry-tool/v1/users/progress?userid=1&postid=42
function get_user_progress_by_post_id($data) {
    $userId = $data['userid'];
    $postId = $data['postid'];
    $userController = new UserController;
    return $userController->getProgress($userId, $postId);
}

add_action( 'rest_api_init', function () {
    register_rest_route( 'tapestry-tool/v1', '/users/progress/', array(
      'methods' => 'POST',
      'callback' => 'update_user_progress_by_post_id',
    ) );
});

// Example: http://localhost:8888/tapestry-wp/wp-json/tapestry-tool/v1/users/progress?userid=1&postid=44&json={"32":0.5,"33":0,"34":0,"35":0,"36":0,"37":0,"38":0,"39":0,"40":0,"41":0}
function update_user_progress_by_post_id($data) {
    $userController = new UserController;
    $userId = $data['userid'];
    $postId = $data['postid'];
    $json = $data['json'];
    $userController->updateProgress($userId, $postId, $json);
}

// Get user's h5p video settings
add_action( 'rest_api_init', function () {
    register_rest_route( 'tapestry-tool/v1', 'users/h5psettings/', array(
      'methods' => 'GET',
      'callback' => 'get_user_h5p_settings_by_post_id',
    ) );
});

// Get user h5p video setting on a tapestry page by user id and post id. Will need to pass these as query parameters
// Example: http://localhost:8888/tapestry-wp/wp-json/tapestry-tool/v1/users/h5psettings?userid=1&postid=42
function get_user_h5p_settings_by_post_id($data) {
    $userId = $data['userid'];
    $postId = $data['postid'];
    $userController = new UserController;
    return $userController->getProgress($userId, $postId);
}

add_action( 'rest_api_init', function () {
    register_rest_route( 'tapestry-tool/v1', '/users/h5psettings/', array(
      'methods' => 'POST',
      'callback' => 'update_user_h5p_settings_by_post_id',
    ) );
});

// Example: http://localhost:8888/tapestry-wp/wp-json/tapestry-tool/v1/users/h5psettings?userid=1&postid=44&json={"32":0.5,"33":0,"34":0,"35":0,"36":0,"37":0,"38":0,"39":0,"40":0,"41":0}
function update_user_h5p_settings_by_post_id($data) {
    $userController = new UserController;
    $userId = $data['userid'];
    $postId = $data['postid'];
    $json = $data['json'];
    $userController->updateProgress($userId, $postId, $json);
}