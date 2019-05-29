<?php
/**
 * Tapestry Endpoints
 *
 */

require __DIR__ . '/controller/class.tapestry-permissions.php';
require __DIR__ . '/controller/class.tapestry-controller.php';

add_action( 'rest_api_init', function () {	
    register_rest_route('tapestry-tool/v1', '/tapestries/(?P<id>[\d]+)/nodes', array(	
        'methods' => 'POST',	
        'callback' => 'addTapestryNode',	
        'permission_callback' => 'TapestryPermissions::postTapestryNode'
    ));	
});

function addTapestryNode($request) {
    $postId = $request['id'];
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

function updateTapestry($request) {
    $data = json_decode($request->get_body());
    // TODO: JSON validations should happen here
    $tapestryController = new TapestryController($data->postId);
    return $tapestryController->updateTapestry($data);
}

add_action('rest_api_init', function () {
    register_rest_route('tapestry-tool/v1', '/tapestries/(?P<id>[\d]+)/settings', array(
        'methods' => 'PUT',
        'callback' => 'updateTapestrySettings',
        'permission_callback' => 'TapestryPermissions::putTapestrySettings'
    ));
});

function updateTapestrySettings($request) {
    $postId = $request['id'];
    $data = json_decode($request->get_body());
    // TODO: JSON validations should happen here
    $tapestryController = new TapestryController($postId);
    return $tapestryController->updateTapestrySettings($data);
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
