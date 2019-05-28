<?php
/**
 * Tapestry Endpoint Permissions
 *
 */
class TapestryPermissions {
    static function postTapestry($request) {
        $data = json_decode($request->get_body());
        if (isset($data->postId)) {
            return current_user_can('edit', $data->postId);
        }
        return current_user_can('publish_posts');
    }
    static function postTapestryGroup($request) {
        $postId = $request['id'];
        if (isset($data->postId)) {
            return current_user_can('edit', $data->postId);
        }
        return false;
    }
}
