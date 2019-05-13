<?php
/**
 * Tapestry Endpoints
 *
 */

require __DIR__ . '/controller/permissions.php';
require __DIR__ . '/controller/class.tapestry-controller.php';

add_action( 'rest_api_init', function () {
    register_rest_route( 'tapestry-tool/v1', '/tapestries', array(
        'methods' => 'POST',
        'callback' => 'updateTapestry',
        'permission_callback' => 'postTapestryPermissions'
    ));
});

add_action( 'rest_api_init', function () {
    register_rest_route( 'tapestry-tool/v1', '/tapestry-nodes', array(
        'methods' => 'POST',
        'callback' => 'updateTapestryNodes',
        'permission_callback' => 'postTapestryNodePermissions'
    ));
});

function updateTapestry($request) {
    $data = json_decode($request->get_body());
    $tapestryController = new TapestryController;
    return $tapestryController->updateTapestryPost($data, $data->postId);
}

function updateTapestryNodes($request) {
    $data = json_decode($request->get_body());
    $tapestryController = new TapestryController;
    return $tapestryController->updateTapestryNodes($data, $data->postId);
}
