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
        if (0 == $tapestryPostId) {
            return (object) [
                'public' => ['read'],
                'authenticated' => ['read'],
            ];
        }

        $tapestry = get_post_meta($tapestryPostId, 'tapestry', true);
        $defaultPermissions = (isset($tapestry->settings->defaultPermissions) ? $tapestry->settings->defaultPermissions : false);

        if (!$defaultPermissions) {
            return (object) [
                'public' => ['read'],
                'authenticated' => ['read'],
            ];
        }

        return $defaultPermissions;
    }

    /**
     * Get All Node Permission Options.
     *
     * @return array NodePermission
     */
    public static function getNodePermissions()
    {
        return [
            'ADD' => 'add',
            'READ' => 'read',
            'EDIT' => 'edit',
            'APPROVE' => 'approve',
            'EDIT_SUBMIT' => 'edit_submit',
            'ADD_SUBMIT' => 'add_submit',
        ];
    }
}
