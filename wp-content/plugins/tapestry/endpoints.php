<?php
/**
 * Tapestry Endpoints
 *
 */

add_action('rest_api_init', function () {
    register_rest_route('tapestry-tool/v1', '/tapestry-settings', array(
        'methods' => 'POST',
        'callback' => 'updateTapestrySettings'
        // TODO: Add permissions here later, when saving tapestry PR is merged
    ));
});

function updateTapestrySettings($request) {
    $data = json_decode($request->get_body());
    $tapestryController = new TapestryController;
    return $tapestryController->updateTapestrySettings($data, $data->postId);
}
