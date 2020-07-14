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
}
