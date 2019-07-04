<?php

class TapestryNodePermissions
{
    static function getDefaultNodePermissions()
    {
        return [
            'public' => ['read']
        ];
    }

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
