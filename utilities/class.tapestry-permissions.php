<?php

/**
 * Tapestry Endpoint Permissions
 *
 */
class TapestryPermissions
{
    /**
     * Post Tapestry Permission
     *
     * @return  Object  $permission permission
     */
    public static function postTapestry()
    {
        return current_user_can('publish_posts');
    }

    /**
     * Post Tapestry Group
     *
     * @param   Object  $request    request
     *
     * @return  Object  $permission permission
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
     * Post Tapestry Settings
     *
     * @param   Object  $request    request
     *
     * @return  Object  $permission permission
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
