<?php

/**
 * Tapestry Endpoints
 *
 */

require_once __DIR__ . '/utilities/class.tapestry-permissions.php';
require_once __DIR__ . '/classes/class.tapestry.php';
require_once __DIR__ . '/classes/class.tapestry-node.php';
require_once __DIR__ . '/classes/class.tapestry-group.php';
require_once __DIR__ . '/classes/class.tapestry-user-progress.php';
require_once __DIR__ . '/classes/class.tapestry-user-setting.php';

$REST_API_NAMESPACE = 'tapestry-tool/v1';
$REST_API_ENDPOINTS = [
    'POST_TAPESTRY_NODE' => (object) [
        'ROUTE'     => '/tapestries/(?P<tapestryPostId>[\d]+)/nodes',
        'ARGUMENTS' => [
            'methods'               => 'POST',
            'callback'              => 'addTapestryNode',
            'permission_callback'   => 'TapestryPermissions::postTapestryNode'
        ]
    ],
    'POST_TAPESTRY' => (object) [
        'ROUTE'     => '/tapestries',
        'ARGUMENTS' => [
            'methods'               => 'POST',
            'callback'              => 'addTapestry',
            'permission_callback'   => 'TapestryPermissions::postTapestry'
        ]
    ],
    'PUT_TAPESTRY_SETTINGS' => (object) [
        'ROUTE'     => '/tapestries/(?P<tapestryPostId>[\d]+)/settings',
        'ARGUMENTS' => [
            'methods'               => 'PUT',
            'callback'              => 'updateTapestrySettings',
            'permission_callback'   => 'TapestryPermissions::putTapestrySettings'
        ]
    ],
    'GET_TAPESTRY' => (object) [
        'ROUTE'     => '/tapestries/(?P<tapestryPostId>[\d]+)',
        'ARGUMENTS' => [
            'methods'   => 'GET',
            'callback'  => 'getTapestry'
        ]
    ],
    'POST_TAPESTRY_GROUP' => (object) [
        'ROUTE'     => '/tapestries/(?P<tapestryPostId>[\d]+)/groups',
        'ARGUMENTS' => [
            'methods'               => 'POST',
            'callback'              => 'addTapestryGroup',
            'permission_callback'   => 'TapestryPermissions::postTapestryGroup'
        ]
    ],
    'PUT_TAPESTRY_NODE' => (object) [
        'ROUTE'     => '/tapestries/(?P<tapestryPostId>[\d]+)/nodes/(?P<nodeMetaId>[\d]+)',
        'ARGUMENTS' => [
            'methods'               => 'PUT',
            'callback'              => 'updateTapestryNode',
            'permission_callback'   => 'TapestryPermissions::putTapestryNodeProperties'
        ]
    ],
    'PUT_TAPESTRY_NODE_SIZE' => (object) [
        'ROUTE'     => '/tapestries/(?P<tapestryPostId>[\d]+)/nodes/(?P<nodeMetaId>[\d]+)/size',
        'ARGUMENTS' => [
            'methods'               => 'PUT',
            'callback'              => 'updateTapestryNodeSize',
            'permission_callback'   => 'TapestryPermissions::putTapestryNodeProperties'
        ]
    ],
    'PUT_TAPESTRY_NODE_PERMISSIONS' => (object) [
        'ROUTE'     => '/tapestries/(?P<tapestryPostId>[\d]+)/nodes/(?P<nodeMetaId>[\d]+)/permissions',
        'ARGUMENTS' => [
            'methods'               => 'PUT',
            'callback'              => 'updateTapestryNodePermissions',
            'permission_callback'   => 'TapestryPermissions::putTapestryNodeProperties'
        ]
    ],
    'PUT_TAPESTRY_NODE_DESCRIPTION' => (object) [
        'ROUTE'     => '/tapestries/(?P<tapestryPostId>[\d]+)/nodes/(?P<nodeMetaId>[\d]+)/description',
        'ARGUMENTS' => [
            'methods'               => 'PUT',
            'callback'              => 'updateTapestryNodeDescription',
            'permission_callback'   => 'TapestryPermissions::putTapestryNodeProperties'
        ]
    ],
    'PUT_TAPESTRY_NODE_TITLE' => (object) [
        'ROUTE'     => '/tapestries/(?P<tapestryPostId>[\d]+)/nodes/(?P<nodeMetaId>[\d]+)/title',
        'ARGUMENTS' => [
            'methods'               => 'PUT',
            'callback'              => 'updateTapestryNodeTitle',
            'permission_callback'   => 'TapestryPermissions::putTapestryNodeProperties'
        ]
    ],
    'PUT_TAPESTRY_NODE_IMAGE_URL' => (object) [
        'ROUTE'     => '/tapestries/(?P<tapestryPostId>[\d]+)/nodes/(?P<nodeMetaId>[\d]+)/imageURL',
        'ARGUMENTS' => [
            'methods'               => 'PUT',
            'callback'              => 'updateTapestryNodeImageURL',
            'permission_callback'   => 'TapestryPermissions::putTapestryNodeProperties'
        ]
    ],
    'PUT_TAPESTRY_NODE_TYPE_DATA' => (object) [
        'ROUTE'     => '/tapestries/(?P<tapestryPostId>[\d]+)/nodes/(?P<nodeMetaId>[\d]+)/typeData',
        'ARGUMENTS' => [
            'methods'               => 'PUT',
            'callback'              => 'updateTapestryNodeTypeData',
            'permission_callback'   => 'TapestryPermissions::putTapestryNodeProperties'
        ]
    ],
    'PUT_TAPESTRY_NODE_COORDINATES' => (object) [
        'ROUTE'     => '/tapestries/(?P<tapestryPostId>[\d]+)/nodes/(?P<nodeMetaId>[\d]+)/coordinates',
        'ARGUMENTS' => [
            'methods'               => 'PUT',
            'callback'              => 'updateTapestryNodeCoordinates',
            'permission_callback'   => 'TapestryPermissions::putTapestryNodeProperties'
        ]
    ],
    'POST_TAPESTRY_LINK' => (object) [
        'ROUTE'     => '/tapestries/(?P<tapestryPostId>[\d]+)/links',
        'ARGUMENTS' => [
            'methods'               => 'POST',
            'callback'              => 'addTapestryLink',
            'permission_callback'   => 'TapestryPermissions::postTapestryLink'
        ]
    ],
    'GET_TAPESTRY_USER_PROGRESS' => (object) [
        'ROUTE'     => 'users/progress',
        'ARGUMENTS' => [
            'methods'               => 'GET',
            'callback'              => 'getUserProgressByPostId',
        ]
    ],
    'UPDATE_TAPESTRY_USER_PROGRESS' => (object) [
        'ROUTE'     => 'users/progress',
        'ARGUMENTS' => [
            'methods'               => 'POST',
            'callback'              => 'updateProgressByNodeId',
        ]
    ],
    'UPDATE_TAPESTRY_USER_UNLOCKED' => (object)[
        'ROUTE'     => 'users/unlocked',
        'ARGUMENTS' => [
            'methods'               => 'POST',
            'callback'              => 'unlockByNodeId'
        ]
    ],
    'GET_TAPESTRY_USER_H5P_SETTING' => (object) [
        'ROUTE'     => 'users/h5psettings',
        'ARGUMENTS' => [
            'methods'               => 'GET',
            'callback'              => 'getUserU5PSettingsByPostId',
        ]
    ],
    'UPDATE_TAPESTRY_USER_H5P_SETTING' => (object) [
        'ROUTE'     => 'users/h5psettings',
        'ARGUMENTS' => [
            'methods'               => 'POST',
            'callback'              => 'updateUserH5PSettingsByPostId',
        ]
    ],
    'GET_TAPESTRY_USER_TAPESTRY_SETTING' => (object) [
        'ROUTE'     => 'users/settings/(?P<tapestryPostId>[\d]+)',
        'ARGUMENTS' => [
            'methods'               => 'GET',
            'callback'              => 'getUserSettingsByPostId',
        ]
    ],
    'UPDATE_TAPESTRY_USER_TAPESTRY_SETTING' => (object) [
        'ROUTE'     => 'users/settings/(?P<tapestryPostId>[\d]+)',
        'ARGUMENTS' => [
            'methods'               => 'POST',
            'callback'              => 'updateUserSettingsByPostId',
        ]
    ],
];

/**
 * REGISTER API ENDPOINTS
 */
foreach ($REST_API_ENDPOINTS as $ENDPOINT) {
    add_action(
        'rest_api_init',
        function () use ($ENDPOINT, $REST_API_NAMESPACE) {
            register_rest_route(
                $REST_API_NAMESPACE,
                $ENDPOINT->ROUTE,
                $ENDPOINT->ARGUMENTS
            );
        }
    );
}

/**
 * Get a Tapestry
 * 
 * @param Object $request HTTP request
 * 
 * @return Object $response HTTP response
 */
function getTapestry($request)
{
    $postId = $request['tapestryPostId'];
    try {
        $tapestry = new Tapestry($postId);
        return $tapestry->get();
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

/**
 * Add a tapestry
 * 
 * @param   Object  $request    HTTP request
 * 
 * @return  Object  $response   HTTP response
 */
function addTapestry($request)
{
    $tapestryData = json_decode($request->get_body());
    $tapestry = new Tapestry();
    try {
        $tapestry->set($tapestryData);
        return $tapestry->save();
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

/**
 * Add a tapestry node
 * 
 * @param   Object  $request    HTTP request
 * 
 * @return  Object  HTTP response 
 */
function addTapestryNode($request)
{
    $postId = $request['tapestryPostId'];
    $node = json_decode($request->get_body());
    // TODO: JSON validations should happen here
    // make sure that we can only accept one node object at a time
    // adding multiple nodes would require multiple requests from the client
    try {
        if ($postId && !TapestryHelpers::isValidTapestry($postId)) {
            throw new TapestryError('INVALID_POST_ID');
        }
        $tapestry = new Tapestry($postId);
        return $tapestry->addNode($node);
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

/**
 * Add a Tapestry Group
 * 
 * @param   Object  $request    HTTP request
 * 
 * @return  Object  $response   HTTP response
 */
function addTapestryGroup($request)
{
    $postId = $request['tapestryPostId'];
    $group = json_decode($request->get_body());
    // TODO: JSON validations should happen here
    // make sure the type of the group body exists and is 'tapestry_group'
    try {
        if ($postId && !TapestryHelpers::isValidTapestry($postId)) {
            throw new TapestryError('INVALID_POST_ID');
        }
        $tapestry = new Tapestry($postId);
        return $tapestry->addGroup($group);
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

/**
 * Add A Tapestry Link
 * 
 * @param   Object  $request    HTTP request
 * 
 * @return  Object  $response   HTTP response
 */
function addTapestryLink($request)
{
    $postId = $request['tapestryPostId'];
    $link = json_decode($request->get_body());

    try {
        if (!$link->source || !$link->target) {
            throw new TapestryError('INVALID_NEW_LINK');
        }
        if ($postId && !TapestryHelpers::isValidTapestry($postId)) {
            throw new TapestryError('INVALID_POST_ID');
        }
        if ((!TapestryHelpers::isChildNodeOfTapestry($link->source, $postId))
            || (!TapestryHelpers::isChildNodeOfTapestry($link->target, $postId))
        ) {
            throw new TapestryError('INVALID_CHILD_NODE');
        }
        if (!TapestryHelpers::currentUserIsAllowed('ADD', $link->target, $postId)) {
            throw new TapestryError('ADD_NODE_PERMISSION_DENIED');
        }
        $tapestry = new Tapestry($postId);
        return $tapestry->addLink($link);
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

/**
 * Update Tapestry Settings
 * 
 * @param   Object  $request    HTTP request
 * 
 * @return  Object  $response   HTTP response 
 */
function updateTapestrySettings($request)
{
    $postId = $request['tapestryPostId'];
    $settings = json_decode($request->get_body());
    // TODO: JSON validations should happen here
    try {
        if ($postId && !TapestryHelpers::isValidTapestry($postId)) {
            throw new TapestryError('INVALID_POST_ID');
        }
        $tapestry = new Tapestry($postId);
        $tapestry->set((object) ['settings' => $settings]);
        return $tapestry->save();
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

/**
 * Update Tapestry Node
 * 
 * @param   Object  $request    HTTP request
 * 
 * @return  Object  $response   HTTP response
 */
function updateTapestryNode($request)
{
    $postId = $request['tapestryPostId'];
    $nodeMetaId = $request['nodeMetaId'];
    $nodeData = json_decode($request->get_body());
    // TODO: JSON validations should happen here
    // make sure the permissions body exists and not null
    try {
        if ($postId && !TapestryHelpers::isValidTapestry($postId)) {
            throw new TapestryError('INVALID_POST_ID');
        }
        if (!TapestryHelpers::isValidTapestryNode($nodeMetaId)) {
            throw new TapestryError('INVALID_NODE_META_ID');
        }
        if (!TapestryHelpers::currentUserIsAllowed('EDIT', $nodeMetaId, $postId)) {
            throw new TapestryError('EDIT_NODE_PERMISSION_DENIED');
        }
        if (!TapestryHelpers::isChildNodeOfTapestry($nodeMetaId, $postId)) {
            throw new TapestryError('INVALID_CHILD_NODE');
        }

        $tapestry = new Tapestry($postId);
        $node = $tapestry->getNode($nodeMetaId);

        $node->set((object) $nodeData);
        return $node->save();
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

/**
 * Update Tapestry Node Size
 * 
 * @param   Object  $request    HTTP request
 * 
 * @return  Object  $response   HTTP response
 */
function updateTapestryNodeSize($request)
{
    $postId = $request['tapestryPostId'];
    $nodeMetaId = $request['nodeMetaId'];
    $size = json_decode($request->get_body());
    // TODO: JSON validations should happen here
    // make sure the size exists and is a valid string
    try {
        if ($postId && !TapestryHelpers::isValidTapestry($postId)) {
            throw new TapestryError('INVALID_POST_ID');
        }
        if (!TapestryHelpers::isValidTapestryNode($nodeMetaId)) {
            throw new TapestryError('INVALID_NODE_META_ID');
        }
        if (!TapestryHelpers::currentUserIsAllowed('EDIT', $nodeMetaId, $postId)) {
            throw new TapestryError('EDIT_NODE_PERMISSION_DENIED');
        }
        if (!TapestryHelpers::isChildNodeOfTapestry($nodeMetaId, $postId)) {
            throw new TapestryError('INVALID_CHILD_NODE');
        }

        $tapestry = new Tapestry($postId);
        $node = $tapestry->getNode($nodeMetaId);

        $node->set((object) ['size' => $size]);
        return $node->save();
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

/**
 * Update Tapestry Node Permissions
 * 
 * @param   Object  $request    HTTP request
 * 
 * @return  Object  $response   HTTP response
 */
function updateTapestryNodePermissions($request)
{
    $postId = $request['tapestryPostId'];
    $nodeMetaId = $request['nodeMetaId'];
    $permissions = json_decode($request->get_body());
    // TODO: JSON validations should happen here
    // make sure the permissions body exists and not null
    try {
        if ($postId && !TapestryHelpers::isValidTapestry($postId)) {
            throw new TapestryError('INVALID_POST_ID');
        }
        if (!TapestryHelpers::isValidTapestryNode($nodeMetaId)) {
            throw new TapestryError('INVALID_NODE_META_ID');
        }
        if (!TapestryHelpers::currentUserIsAllowed('EDIT', $nodeMetaId, $postId)) {
            throw new TapestryError('EDIT_NODE_PERMISSION_DENIED');
        }
        if (!TapestryHelpers::isChildNodeOfTapestry($nodeMetaId, $postId)) {
            throw new TapestryError('INVALID_CHILD_NODE');
        }

        $tapestry = new Tapestry($postId);
        $node = $tapestry->getNode($nodeMetaId);

        $node->set((object) ['permissions' => $permissions]);
        return $node->save();
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

/**
 * Update Tapestry Node Permissions
 * 
 * @param   Object  $request    HTTP request
 * 
 * @return  Object  $response   HTTP response
 */
function updateTapestryNodeDescription($request)
{
    $postId = $request['tapestryPostId'];
    $nodeMetaId = $request['nodeMetaId'];
    $description = json_decode($request->get_body());
    // TODO: JSON validations should happen here
    // make sure the description body exists and is valid string
    try {
        if ($postId && !TapestryHelpers::isValidTapestry($postId)) {
            throw new TapestryError('INVALID_POST_ID');
        }
        if (!TapestryHelpers::isValidTapestryNode($nodeMetaId)) {
            throw new TapestryError('INVALID_NODE_META_ID');
        }
        if (!TapestryHelpers::currentUserIsAllowed('EDIT', $nodeMetaId, $postId)) {
            throw new TapestryError('EDIT_NODE_PERMISSION_DENIED');
        }
        if (!TapestryHelpers::isChildNodeOfTapestry($nodeMetaId, $postId)) {
            throw new TapestryError('INVALID_CHILD_NODE');
        }

        $tapestry = new Tapestry($postId);
        $node = $tapestry->getNode($nodeMetaId);

        $node->set((object) ['description' => $description]);
        return $node->save();
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

/**
 * Update Tapestry Node Title
 * 
 * @param   Object  $request    HTTP request
 * 
 * @return  Object  $response   HTTP response
 */
function updateTapestryNodeTitle($request)
{
    $postId = $request['tapestryPostId'];
    $nodeMetaId = $request['nodeMetaId'];
    $title = json_decode($request->get_body());
    // TODO: JSON validations should happen here
    // make sure the title exists and not null
    try {
        if ($postId && !TapestryHelpers::isValidTapestry($postId)) {
            throw new TapestryError('INVALID_POST_ID');
        }
        if (!TapestryHelpers::isValidTapestryNode($nodeMetaId)) {
            throw new TapestryError('INVALID_NODE_META_ID');
        }
        if (!TapestryHelpers::currentUserIsAllowed('EDIT', $nodeMetaId, $postId)) {
            throw new TapestryError('EDIT_NODE_PERMISSION_DENIED');
        }
        if (!TapestryHelpers::isChildNodeOfTapestry($nodeMetaId, $postId)) {
            throw new TapestryError('INVALID_CHILD_NODE');
        }

        $tapestry = new Tapestry($postId);
        $node = $tapestry->getNode($nodeMetaId);

        $node->set((object) ['title' => $title]);
        return $node->save();
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

/**
 * Update Tapestry Node Image Url
 * 
 * @param   Object  $request    HTTP request
 * 
 * @return  Object  $response   HTTP response
 */
function updateTapestryNodeImageURL($request)
{
    $postId = $request['tapestryPostId'];
    $nodeMetaId = $request['nodeMetaId'];
    $imageURL = json_decode($request->get_body());
    // TODO: JSON validations should happen here
    // make sure the image url exists and not null
    try {
        if ($postId && !TapestryHelpers::isValidTapestry($postId)) {
            throw new TapestryError('INVALID_POST_ID');
        }
        if (!TapestryHelpers::isValidTapestryNode($nodeMetaId)) {
            throw new TapestryError('INVALID_NODE_META_ID');
        }
        if (!TapestryHelpers::currentUserIsAllowed('EDIT', $nodeMetaId, $postId)) {
            throw new TapestryError('EDIT_NODE_PERMISSION_DENIED');
        }
        if (!TapestryHelpers::isChildNodeOfTapestry($nodeMetaId, $postId)) {
            throw new TapestryError('INVALID_CHILD_NODE');
        }

        $tapestry = new Tapestry($postId);
        $node = $tapestry->getNode($nodeMetaId);

        $node->set((object) ['imageURL' => $imageURL]);
        return $node->save();
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

/** 
 * Update Tapestry Node Type Data
 * 
 * @param   Object  $request    HTTP request
 * 
 * @return  Object  $response   HTTP response
 */
function updateTapestryNodeTypeData($request)
{
    $postId = $request['tapestryPostId'];
    $nodeMetaId = $request['nodeMetaId'];
    $typeData = json_decode($request->get_body());
    // TODO: JSON validations should happen here
    // make sure the type data exists and not null
    try {
        if ($postId && !TapestryHelpers::isValidTapestry($postId)) {
            throw new TapestryError('INVALID_POST_ID');
        }
        if (!TapestryHelpers::isValidTapestryNode($nodeMetaId)) {
            throw new TapestryError('INVALID_NODE_META_ID');
        }
        if (!TapestryHelpers::currentUserIsAllowed('EDIT', $nodeMetaId, $postId)) {
            throw new TapestryError('EDIT_NODE_PERMISSION_DENIED');
        }
        if (!TapestryHelpers::isChildNodeOfTapestry($nodeMetaId, $postId)) {
            throw new TapestryError('INVALID_CHILD_NODE');
        }

        $tapestry = new Tapestry($postId);
        $node = $tapestry->getNode($nodeMetaId);

        $node->set((object) ['typeData' => $typeData]);
        return $node->save();
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

/**
 * Update Tapestry Node Coordinates
 * 
 * @param   Object  $request    HTTP request
 * 
 * @return  Object  $response   HTTP response
 */
function updateTapestryNodeCoordinates($request)
{
    $postId = $request['tapestryPostId'];
    $nodeMetaId = $request['nodeMetaId'];
    $coordinates = json_decode($request->get_body());
    // TODO: JSON validations should happen here
    // make sure the coordinates exists and not null
    try {
        if ($postId && !TapestryHelpers::isValidTapestry($postId)) {
            throw new TapestryError('INVALID_POST_ID');
        }
        if (!TapestryHelpers::isValidTapestryNode($nodeMetaId)) {
            throw new TapestryError('INVALID_NODE_META_ID');
        }
        if (!TapestryHelpers::currentUserIsAllowed('EDIT', $nodeMetaId, $postId)) {
            throw new TapestryError('EDIT_NODE_PERMISSION_DENIED');
        }
        if (!TapestryHelpers::isChildNodeOfTapestry($nodeMetaId, $postId)) {
            throw new TapestryError('INVALID_CHILD_NODE');
        }

        $tapestry = new Tapestry($postId);
        $node = $tapestry->getNode($nodeMetaId);

        $node->set((object) ['coordinates' => $coordinates]);
        return $node->save();
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

/**
 * Update a single node progress for the current user by passing in node id, post id and progress value
 * Example: /wp-json/tapestry-tool/v1/users/progress?post_id=44&node_id=1&progress_value=0.2
 * 
 * @param Object $request HTTP request
 * 
 */
function updateProgressByNodeId($request)
{
    $postId = $request['post_id'];
    $nodeMetaId = $request['node_id'];
    $progressValue = $request['progress_value'];

    try {
        $userProgress = new TapestryUserProgress($postId, $nodeMetaId);
        $userProgress->updateUserProgress($progressValue);
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

/**
 * Set unlocked status of a single node for the current user to true by passing in node id and post id
 * Example: /wp-json/tapestry-tool/v1/users/unlocked?post_id=44&node_id=1
 * 
 * @param Object $request HTTP request
 * 
 * @return null
 */
function unlockByNodeId($request)
{
    $postId = $request['post_id'];
    $nodeMetaId = $request['node_id'];

    try {
        $userProgress = new TapestryUserProgress($postId, $nodeMetaId);
        $userProgress->unlockNode();
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

/**
 * Get user h5p video setting on a tapestry page by post id. Will need to pass these as query parameters
 * Example: /wp-json/tapestry-tool/v1/users/h5psettings?post_id=42
 * 
 * @param Object $request HTTP request
 * 
 * @return Object $response HTTP response
 */
function getUserU5PSettingsByPostId($request)
{
    $postId = $request['post_id'];

    try {
        $userProgress = new TapestryUserProgress($postId);
        return $userProgress->getH5PSettings();
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

/**
 * Update the user's h5p settings by post id
 * Example: /wp-json/tapestry-tool/v1/users/h5psettings?post_id=44&json={"volume":100,"muted":false,"caption":null,"quality":"q1","playbackRate":0.5,"time":11.934346}
 * 
 * @param Object $request HTTP request
 * 
 */
function updateUserH5PSettingsByPostId($request)
{
    $postId = $request['post_id'];
    $h5pSettingsData = $request['json'];

    try {
        $userProgress = new TapestryUserProgress($postId);
        $userProgress->updateH5PSettings($h5pSettingsData);
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

/**
 * Get user progress on a tapestry page by post id. 
 * Example: /wp-json/tapestry-tool/v1/users/progress?post_id=44
 * 
 * @param Object $request HTTP request
 * 
 * @return Object $response HTTP response
 */
function getUserProgressByPostId($request)
{
    $postId = $request['post_id'];
    try {
        $userProgress = new TapestryUserProgress($postId);
        return $userProgress->get();
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

/**
 * Update the user's settings by post id
 *
 * @param Object $request HTTP request
 *
 * @return NULL
 */
function updateUserSettingsByPostId($request)
{
    $postId = $request['tapestryPostId'];
    $settingsData = json_decode($request->get_body());

    try {
        $userSetting = new TapestryUserSetting($postId);
        $userSetting->updateUserSetting($settingsData);
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

/**
 * Get user progress on a tapestry page by post id.
 *
 * @param Object $request HTTP request
 *
 * @return Object $response HTTP response
 */
function getUserSettingsByPostId($request)
{
    $postId = $request['tapestryPostId'];

    try {
        $userSetting = new TapestryUserSetting($postId);
        return $userSetting->get();
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}
