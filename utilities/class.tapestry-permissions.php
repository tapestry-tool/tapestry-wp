<?php

/**
 * Tapestry Endpoint Permissions.
 */
class TapestryPermissions
{
    /**
     * Post Tapestry Permission.
     *
     * @return object $permission permission
     */
    public static function postTapestry()
    {
        if (defined('TAPESTRY_USE_DEV_MODE') && !empty(TAPESTRY_USE_DEV_MODE)) {
            return true;
        }

        return current_user_can('publish_posts');
    }

    /**
     * Post Tapestry Group.
     *
     * @param object $request request
     *
     * @return object $permission permission
     */
    public static function postTapestryGroup($request)
    {
        $postId = $request['tapestryPostId'];
        if (isset($postId)) {
            return current_user_can('edit_post', $postId);
        }

        return false;
    }

    /**
     * Post Tapestry Settings.
     *
     * @param object $request request
     *
     * @return object $permission permission
     */
    public static function putTapestrySettings($request)
    {
        $postId = $request['tapestryPostId'];
        if (isset($postId)) {
            return current_user_can('edit_post', $postId);
        }

        return current_user_can('publish_posts');
    }

    /**
     * Permissions to upload videos to Kaltura.
     *
     * @return object $permission permission
     */
    public static function kalturaUpload()
    {
        if (defined('TAPESTRY_USE_DEV_MODE') && !empty(TAPESTRY_USE_DEV_MODE)) {
            return true;
        }

        $user = wp_get_current_user();
        return in_array("administrator", (array) $user->roles);
    }
}
