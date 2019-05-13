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

function loadTapestry($request) {
    $postId = $request['id'];
    $tapestryController = new TapestryController;
    return $tapestryController->getTapestry($postId);
}
