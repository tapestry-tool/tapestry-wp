<?php

/**
 * Tapestry Errors
 */
class TapestryErrors
{
    const ERRORS = [
        'INVALID_POST_ID' => [
            'MESSAGE'   => 'PostID is invalid',
            'STATUS'    => ['status' => 404]
        ],
        'INVALID_NODE_META_ID' => [
            'MESSAGE'   => 'NodeMetaId is invalid',
            'STATUS'    => ['status' => 404]
        ],
        'GROUP_ALREADY_EXISTS' => [
            'MESSAGE'   => 'Group already exists in the database',
            'STATUS'    => ['status' => 400]
        ],
        'NODE_ALREADY_EXISTS' => [
            'MESSAGE'   => 'Node already exists in the database',
            'STATUS'    => ['status' => 400]
        ],
        'INVALID_CHILD_NODE' => [
            'MESSAGE'   => 'Node is not a child of the tapestry',
            'STATUS'    => ['status' => 400]
        ],
        'SETTINGS_MISSING_IN_NEW_TAPESTRY' => [
            'MESSAGE'   => 'Settings are required to create a new Tapestry',
            'STATUS'    => ['status' => 400]
        ],
        'INVALID_NEW_LINK' => [
            'MESSAGE'   => 'New Tapestry link is invalid',
            'STATUS'    => ['status' => 400]
        ],
        'NODES_EXIST_IN_NEW_TAPESTRY' => [
            'MESSAGE'   => 'Nodes should not be passed in when creating a new Tapestry',
            'STATUS'    => ['status' => 400]
        ],
        'GROUPS_EXIST_IN_NEW_TAPESTRY' => [
            'MESSAGE'   => 'Groups should not be passed in when creating a new Tapestry',
            'STATUS'    => ['status' => 400]
        ],
        'LINKS_EXIST_IN_NEW_TAPESTRY' => [
            'MESSAGE'   => 'Links should not be passed in when creating a new Tapestry',
            'STATUS'    => ['status' => 400]
        ],
        'ADD_NODE_PERMISSION_DENIED' => [
            'MESSAGE'   => 'You are not permitted to add child nodes to this node',
            'STATUS'    => ['status' => 403]
        ],
        'EDIT_NODE_PERMISSION_DENIED' => [
            'MESSAGE'   => 'You are not permitted to edit this node',
            'STATUS'    => ['status' => 403]
        ],
        'POST_ID_ALREADY_SET' => [
            'MESSAGE'   => 'PostID should not be passed in when creating a new Tapestry',
            'STATUS'    => ['status' => 500]
        ]
    ];

    static function throwsError($code)
    {
        $ERROR = (object) self::ERRORS[$code];
        return new WP_Error($code, $ERROR->MESSAGE, $ERROR->STATUS);
    }
}
