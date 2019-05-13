<?php
/**
 * Tapestry Endpoints
 *
 */

require __DIR__ . '/controller/class.tapestry-controller.php';

add_action('rest_api_init', function () {
    register_rest_route('tapestry-tool/v1', '/tapestries/(?P<id>[\d]+)', array(
        'methods' => 'GET',
        'callback' => 'loadTapestry'
    ));
});

function updateTapestry($request) {
    $data = json_decode($request->get_body());
    $tapestryController = new TapestryController;
    return $tapestryController->updateTapestry($data, $data->postId);
}

function updateTapestryNodes($request) {
    $data = json_decode($request->get_body());
    $tapestryController = new TapestryController;
    return $tapestryController->updateTapestryNodes($data, $data->postId);
}

function loadTapestry($request) {
    $postId = $request['id'];
    $tapestryController = new TapestryController;
    return $tapestryController->getTapestry($postId);
}
