<?php

/**
 * Tapestry Endpoints
 *
 */

require_once __DIR__ . '/utilities/class.tapestry-permissions.php';
require_once __DIR__ . '/controllers/class.tapestry-controller.php';
require_once __DIR__ . '/controllers/class.tapestry-node-controller.php';
require_once __DIR__ . '/controllers/class.tapestry-group-controller.php';
require_once __DIR__ . '/controllers/class.tapestry-user-progress-controller.php';

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
    'PUT_TAPESTRY_NODE_PERMISSIONS' => (object) [
        'ROUTE'     => '/tapestries/(?P<tapestryPostId>[\d]+)/nodes/(?P<nodeMetaId>[\d]+)/permissions',
        'ARGUMENTS' => [
            'methods'               => 'PUT',
            'callback'              => 'updateTapestryNodePermissions',
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
    'PUT_TAPESTRY_NODE_UNLOCKED_STATUS' => (object) [
        'ROUTE'     => '/tapestries/(?P<tapestryPostId>[\d]+)/nodes/(?P<nodeMetaId>[\d]+)/unlocked',
        'ARGUMENTS' => [
            'methods'               => 'PUT',
            'callback'              => 'updateTapestryNodeUnlockedStatus',
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
    'GET_TAPESTRY_PROGRESS' => (object) [
        'ROUTE'     => 'users/progress',
        'ARGUMENTS' => [
            'methods'               => 'GET',
            'callback'              => 'getUserProgressByPostId',
        ]
    ],
    'UPDATE_TAPESTRY_PROGRESS' => (object) [
        'ROUTE'     => 'users/progress',
        'ARGUMENTS' => [
            'methods'               => 'POST',
            'callback'              => 'updateProgressByNodeId',
        ]
    ],
    'GET_H5P_SETTING' => (object) [
        'ROUTE'     => 'users/h5psettings',
        'ARGUMENTS' => [
            'methods'               => 'GET',
            'callback'              => 'getUserU5PSettingsByPostId',
        ]
    ],
    'UPDATE_H5P_SETTING' => (object) [
        'ROUTE'     => 'users/h5psettings',
        'ARGUMENTS' => [
            'methods'               => 'POST',
            'callback'              => 'updateUserH5PSettingsByPostId',
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
 * Add a tapestry
 * 
 * @param   Object  $request    HTTP request
 * 
 * @return  Object  $response   HTTP response
 */
function addTapestry($request)
{
    $tapestry = json_decode($request->get_body());
    $tapestryController = new TapestryController();
    try {
        $tapestryController->set($tapestry);
        return $tapestryController->save();
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
        $tapestryController = new TapestryController($postId);
        return $tapestryController->addNode($node);
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
        $tapestryController = new TapestryController($postId);
        return $tapestryController->addGroup($group);
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
        $tapestryController = new TapestryController($postId);
        return $tapestryController->addLink($link);
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
        $tapestryController = new TapestryController($postId);
        $tapestryController->set((object) ['settings' => $settings]);
        return $tapestryController->save();
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

        $tapestryController = new TapestryController($postId);
        $node = $tapestryController->getNode($nodeMetaId);

        $node->set((object) $nodeData);
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

        $tapestryController = new TapestryController($postId);
        $node = $tapestryController->getNode($nodeMetaId);

        $node->set((object) ['permissions' => $permissions]);
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

        $tapestryController = new TapestryController($postId);
        $node = $tapestryController->getNode($nodeMetaId);

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

        $tapestryController = new TapestryController($postId);
        $node = $tapestryController->getNode($nodeMetaId);

        $node->set((object) ['imageURL' => $imageURL]);
        return $node->save();
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

/**
 * Update Tapestry Node Unlocked Status
 * 
 * @param   Object  $request    HTTP request
 * 
 * @return  Object  $response   HTTP response
 */
function updateTapestryNodeUnlockedStatus($request)
{
    $postId = $request['tapestryPostId'];
    $nodeMetaId = $request['nodeMetaId'];
    $unlocked = json_decode($request->get_body());
    // TODO: JSON validations should happen here
    // make sure the unlocked status exists and not null
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

        $tapestryController = new TapestryController($postId);
        $node = $tapestryController->getNode($nodeMetaId);

        $node->set((object) ['unlocked' => $unlocked]);
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

        $tapestryController = new TapestryController($postId);
        $node = $tapestryController->getNode($nodeMetaId);

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

        $tapestryController = new TapestryController($postId);
        $node = $tapestryController->getNode($nodeMetaId);

        $node->set((object) ['coordinates' => $coordinates]);
        return $node->save();
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

/**
 * Update a single node progress by passing in node id, post id and progress value
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
        $userController = new TapestryUserProgressController($postId, $nodeMetaId);
        $userController->save($progressValue);
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
        $userController = new TapestryUserProgressController($postId);
        return $userController->getH5PSettings();
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
        $userController = new TapestryUserProgressController($postId);
        $userController->updateH5PSettings($h5pSettingsData);
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}

/**
 * Get a Tapestry
 * 
 * @param   Object  $request    HTTP request
 * 
 * @return  Object  $response   HTTP response
 */
function getTapestry($request)
{
    $postId = $request['tapestryPostId'];
    try {
        $tapestryController = new TapestryController($postId);
        return $tapestryController->get();
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
        $userProgressController = new TapestryUserProgressController($postId);
        return $userProgressController->get();
    } catch (TapestryError $e) {
        return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
    }
}
