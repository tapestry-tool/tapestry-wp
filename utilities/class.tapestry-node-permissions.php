<?php

/**
 * Tapestry Node Permissions.
 */
class TapestryNodePermissions
{
    /**
     * Get Default Node Permissions.
     *
     * @return array DefaultNodePermissions
     */
    public static function getDefaultNodePermissions($tapestryPostId)
    {
        global $wp_roles;
        $roles = $wp_roles->get_names();
        $permissions = [
            'public' => ['read'],
            'authenticated' => ['read'],
        ];

        foreach ($roles as $role) {
            if ('Editor' !== $role && 'Administrator' !== $role && 'Author' !== $role) {
                $permissions[strtolower($role)] = ['read'];
            }
        }

        if (0 == $tapestryPostId) {
            return (object) $permissions;
        }

        $tapestry = get_post_meta($tapestryPostId, 'tapestry', true);
        $defaultPermissions = (isset($tapestry->settings->defaultPermissions) ? $tapestry->settings->defaultPermissions : false);

        if (!$defaultPermissions) {
            return (object) $permissions;
        }

        return $defaultPermissions;
    }
}
