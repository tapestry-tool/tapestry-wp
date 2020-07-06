<?php

/**
 * Tapestry Node Permissions
 *
 */
class TapestryNodePermissions
{
    /**
     * Get Default Node Permissions
     *
     * @return  Array   DefaultNodePermissions
     */
    public static function getDefaultNodePermissions($tapestryPostId)
    {
        global $wp_roles;
        $roles = $wp_roles->get_names();
        $permissions = array(
            'public'        => ['read'],
            'authenticated'    => ['read'],
        );

        foreach ($roles as $role) {
            if ($role !== "Administrator" && $role !== "Author") {
                $permissions[strtolower($role)] = ['read'];
            }
        }

        if ($tapestryPostId == 0) {
            return (object) $permissions;
        }

        $tapestry = get_post_meta($tapestryPostId, 'tapestry', true);
        $defaultPermissions = (isset($tapestry->settings->defaultPermissions) ? $tapestry->settings->defaultPermissions : false);

        if (!$defaultPermissions) {
            return (object) $permissions;
        }

        return $defaultPermissions;
    }

    /**
     * Get All Node Permission Options
     *
     * @return  Array   NodePermission
     */
    public static function getNodePermissions()
    {
        return [
            'ADD'           => 'add',
            'READ'          => 'read',
            'EDIT'          => 'edit',
            'APPROVE'       => 'approve',
            'EDIT_SUBMIT'   => 'edit_submit',
            'ADD_SUBMIT'    => 'add_submit',
        ];
    }
}
