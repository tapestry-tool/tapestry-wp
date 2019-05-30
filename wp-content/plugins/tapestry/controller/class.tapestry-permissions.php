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
        $postId = $request['tapestryPostId'];
        if (isset($data->postId)) {
            return current_user_can('edit', $data->postId);
        }
        return false;
    }

    static function putTapestrySettings($request) {
        $postId = $request['tapestryPostId'];
        if (isset($postId)) {
            return current_user_can('edit', $postId);
        }
        return current_user_can('publish_posts');
    }

    static function postTapestryNode($request) {
        $postId = $request['tapestryPostId'];
        if (isset($postId)) {
            return current_user_can('edit', $postId);
        }
        return false;
    }
}
