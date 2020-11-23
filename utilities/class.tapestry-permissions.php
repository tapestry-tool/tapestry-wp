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
        global $TAPESTRY_USE_DEV_MODE;
        if ($TAPESTRY_USE_DEV_MODE) {
            return true;
        }

        return current_user_can('publish_posts') || is_super_admin();
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
            return current_user_can('edit_post', $postId) || is_super_admin();
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
            return current_user_can('edit_post', $postId) || is_super_admin();
        }

        return current_user_can('publish_posts') || is_super_admin();
    }
}
