<?php
class TapestryUserRoles
{
    static function isAdministrator()
    {
        return in_array(
            'administrator',
            wp_get_current_user()->roles
        );
    }

    static function isEditor()
    {
        return in_array(
            'editor',
            wp_get_current_user()->roles
        );
    }

    static function isAuthor()
    {
        return in_array(
            'author',
            wp_get_current_user()->roles
        );
    }

    static function isSubscriber()
    {
        return in_array(
            'subscriber',
            wp_get_current_user()->roles
        );
    }
}
