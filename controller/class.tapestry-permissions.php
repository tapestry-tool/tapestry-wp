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
     * @param Object $request request
     *
     * @return Object $permission permission
     */
    static function postTapestry($request)
    {
        $data = json_decode($request->get_body());
        if (isset($data->postId)) {
            return current_user_can('edit', $data->postId);
        }
        return current_user_can('publish_posts');
    }

    /**
     * Post Tapestry Group
     * 
     * @param Object $request request
     * 
     * @return Object $permission permission
     */
    static function postTapestryGroup($request)
    {
        $postId = $request['tapestryPostId'];
        if (isset($postId)) {
            return current_user_can('edit', $postId);
        }
        return false;
    }

    /**
     * Post Tapestry Settings
     * 
     * @param Object $request request
     * 
     * @return Object $permission permission
     */
    static function putTapestrySettings($request)
    {
        $postId = $request['tapestryPostId'];
        if (isset($postId)) {
            return current_user_can('edit', $postId);
        }
        return current_user_can('publish_posts');
    }

    /**
     * Post Tapestry Node
     * 
     * @param Object $request request
     * 
     * @return Object $permission permission
     */
    static function postTapestryNode($request)
    {
        $postId = $request['tapestryPostId'];
        if (isset($postId)) {
            return current_user_can('edit', $postId);
        }
        return false;
    }
}
