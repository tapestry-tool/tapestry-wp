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
    static function getDefaultNodePermissions($tapestryPostId)
    {
        if($tapestryPostId == 0){
            return (object) [
                'public'        => ['read'],
                'authenticated'    => ['read']
            ];
        }

        $tapestry = get_post_meta($tapestryPostId, 'tapestry', true);
        try {
            $defaultPermissions = $tapestry->settings->defaultPermissions;
            if($defaultPermissions == null){
                return (object) [
                    'public'        => ['read'],
                    'authenticated'    => ['read']
                ];
            }
            return $defaultPermissions;
        } catch (\Throwable $th) {
            return (object) [
                'public'        => ['read'],
                'authenticated'    => ['read']
            ];
        }
    }

    /**
     * Get All Node Permission Options
     * 
     * @return  Array   NodePermission
     */
    static function getNodePermissions()
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
