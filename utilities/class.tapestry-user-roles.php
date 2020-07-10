<?php
/**
 * Tapestry User Roles.
 */
class TapestryUserRoles
{
    public static function canEdit($postId = 0)
    {
        return TapestryUserRoles::isEditor()
        || TapestryUserRoles::isAdministrator()
        || TapestryUserRoles::isAuthorOfThePost($postId);
    }

    /**
     * Check if the current user is a particular role.
     *
     * @return bool
     */
    public static function isRole($role)
    {
        return in_array(
            $role,
            wp_get_current_user()->roles
        );
    }

    /**
     * Check if the current user is an administrator.
     *
     * @return bool
     */
    public static function isAdministrator()
    {
        return TapestryUserRoles::isRole('administrator');
    }

    /**
     * Check if the current user is an editor.
     *
     * @return bool
     */
    public static function isEditor()
    {
        return TapestryUserRoles::isRole('editor');
    }

    /**
     * Check if the current user is an author.
     *
     * @return bool
     */
    public static function isAuthor()
    {
        return TapestryUserRoles::isRole('author');
    }

    /**
     * Check if the current user is an author of a post.
     *
     * @param int $postId post ID
     *
     * @return bool
     */
    public static function isAuthorOfThePost($postId)
    {
        return wp_get_current_user()->ID
            == get_post($postId)->post_author;
    }

    /**
     * Check if the current user is a subscriber.
     *
     * @return bool
     */
    public static function isSubscriber()
    {
        return TapestryUserRoles::isRole('subscriber');
    }
}
