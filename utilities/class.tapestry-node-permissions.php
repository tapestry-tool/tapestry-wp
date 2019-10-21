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
    static function getDefaultNodePermissions()
    {
        return (object) [
            'public'        => ['read'],
            'authorized'    => ['read']
        ];
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
