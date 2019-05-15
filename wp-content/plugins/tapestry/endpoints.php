<?php
/**
 * Tapestry Endpoints
 *
 */
require __DIR__ . '/controller/class.tapestry-controller.php';
add_action( 'rest_api_init', function () {	
    register_rest_route('tapestry-tool/v1', '/tapestries/(?P<tapestryId>[\d]+)/nodes', array(	
        'methods' => 'POST',	
        'callback' => 'updateTapestryNodes',	
        // TODO: Add permission here
    ));	
});

function updateTapestryNodes($request) {
    $postId = $request['tapestryId'];
    $data = json_decode($request->get_body());
    // TODO: JSON validations should happen here
    $tapestryController = new TapestryController;	
    return $tapestryController->updateTapestryNodes($data, $postId);	
}
