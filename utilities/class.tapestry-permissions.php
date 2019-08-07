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
    static function postTapestry()
    {
        return true;
        return current_user_can('publish_posts');
    }

    /**
     * Post Tapestry Group
     * 
     * @param   Object  $request    request
     * 
     * @return  Object  $permission permission
     */
    static function postTapestryGroup($request)
    {
        return true;
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
    static function putTapestrySettings($request)
    {
        return true;
        $postId = $request['tapestryPostId'];
        if (isset($postId)) {
            return current_user_can('edit_post', $postId);
        }
        return current_user_can('publish_posts');
    }

    /**
     * Post Tapestry Node
     * 
     * @param   Object  $request    request
     * 
     * @return  Object  $permission permission
     */
    static function postTapestryNode($request)
    {
        return true;
        $postId = $request['tapestryPostId'];
        if (isset($postId)) {
            return current_user_can('edit_post', $postId);
        }
        return false;
    }

    /**
     * Put Tapestry Node Properties
     * 
     * @param   Object  $request    request
     * 
     * @return  Object  $permission permission
     */
    static function putTapestryNodeProperties($request)
    {
        return true;
        $postId = $request['tapestryPostId'];
        if (isset($postId)) {
            return current_user_can('read', $postId);
        }
        return false;
    }

    /**
     * Post Tapestry Link Permission
     *
     * @param   Object  $request    request
     *
     * @return  Object  $permission permission
     */
    static function postTapestryLink($request)
    {
        return true;
        $postId = $request['tapestryPostId'];
        if (isset($postId)) {
            return current_user_can('edit_post', $postId);
        }
        return false;
    }
}
