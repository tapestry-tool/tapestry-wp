<?php
/**
 * Tapestry Endpoint Permissions
 *
 */

function postTapestryPermissions($request) {
    $data = json_decode($request->get_body());
    if ($data->postId)
        return current_user_can('edit', $data->postId);
    return current_user_can('publish_posts');
}

function postTapestryNodePermissions($request) {
    $data = json_decode($request->get_body());
    if ($data->postId)
        return current_user_can('edit', $data->postId);
    return current_user_can('publish_posts');
}