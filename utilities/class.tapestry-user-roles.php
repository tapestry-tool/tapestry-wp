<?php
/**
 * Tapestry User Roles
 */
class TapestryUserRoles
{
    /**
     * Check if the current user is an administrator
     * 
     * @return Boolean
     */
    static function isAdministrator()
    {
        return in_array(
            'administrator',
            wp_get_current_user()->roles
        );
    }

    /**
     * Check if the current user is an editor
     * 
     * @return Boolean
     */
    static function isEditor()
    {
        return in_array(
            'editor',
            wp_get_current_user()->roles
        );
    }

    /**
     * Check if the current user is an author
     * 
     * @return Boolean
     */
    static function isAuthor()
    {
        return in_array(
            'author',
            wp_get_current_user()->roles
        );
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
        return in_array(
            'subscriber',
            wp_get_current_user()->roles
        );
    }
}
