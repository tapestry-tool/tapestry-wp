<?php
/**
 * Tapestry User Roles
 */
class TapestryUserRoles
{
    /**
     * Check if the current user is a particular role
     * 
     * @return Boolean
     */
    static function isRole($role)
    {
        return in_array(
            $role,
            wp_get_current_user()->roles
        );
    }

    /**
     * Check if the current user is an administrator
     * 
     * @return Boolean
     */
    static function isAdministrator()
    {
        return TapestryUserRoles::isRole('administrator');
    }

    /**
     * Check if the current user is an editor
     * 
     * @return Boolean
     */
    static function isEditor()
    {
        return TapestryUserRoles::isRole('editor');
    }

    /**
     * Check if the current user is an author
     * 
     * @return Boolean
     */
    static function isAuthor()
    {
        return TapestryUserRoles::isRole('author');
    }

    /**
     * Check if the current user is an author of a post
     * 
     * @param   Integer $postId post ID
     *
     * @return  Boolean
     */
    static function isAuthorOfThePost($postId)
    {
        return wp_get_current_user()->ID
            == get_post($postId)->post_author;
    }

    /**
     * Check if the current user is a subscriber
     * 
     * @return Boolean
     */
    static function isSubscriber()
    {
        return TapestryUserRoles::isRole('subscriber');
    }
}
