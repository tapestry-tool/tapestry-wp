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
     * @param $request request
     *
     * @return $permission permission
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
     * @param $request request
     * 
     * @return $permission permission
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
     * @param $request request
     * 
     * @return $permission permission
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
     * @param $request request
     * 
     * @return $permission permission
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
