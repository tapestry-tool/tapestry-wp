<?php
/**
 * Tapestry Endpoints
 *
 */
const NAME_SPACE = 'tapestry/v1';
const ROUTES = array(
    'POST_TAPESTRY' => '/posts',
    'GET_TAPESTRY' => '/posts/(?P<id>\d+)?'
);

/**
 * GET /posts/<id>
 */
add_action( 'rest_api_init', function () {
    register_rest_route(NAME_SPACE, ROUTES['GET_TAPESTRY'], array(
      'methods' => 'GET',
      'callback' => 'getTapestry',
    ) );
});

/**
 * POST /posts
 */
add_action('rest_api_init', function () {
    register_rest_route(NAME_SPACE, ROUTES['POST_TAPESTRY'], array(
      'methods' => 'POST',
      'callback' => 'postTapestry',
      'permission_callback' => function($request) {
          // Add permission here
          return true;
      }
    ) );
});

function postTapestry($request) {
    return $request;
}

function getTapestry($request) {
    return $request['id'];
}
