<?php
/**
 * Add/update/retrieve Tapestry post and its child nodes
 * 
 */

require(dirname(__FILE__) . "/../utilities/class.tapestry-user-roles.php");

class TapestryController
{
    const POST_TYPES = [
        'TAPESTRY'      => 'tapestry',
        'TAPESTRY_NODE' => 'tapestry_node'
    ];
    const NODE_PERMISSIONS = [
        'DEFAULT' => [],
        'OPTIONS' => [
            'ADD'           => 'add',
            'READ'          => 'read',
            'EDIT'          => 'edit',
            'APPROVE'       => 'approve',
            'EDIT_SUBMIT'   => 'edit_submit',
            'ADD_SUBMIT'    => 'add_submit',
        ]
    ];
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
    private $postId;

    /**
     * Constructor
     */
    public function __construct($postId = 0)
    {
        if ($postId && !$this->_isValidTapestry($postId)) {
            return $this->_throwsError('INVALID_POST_ID');
        }
        $this->postId = (int)$postId;
    }

    /**
     * Add A Tapestry
     * 
     * @param   Object  $tapestry   Tapestry
     * 
     * @return  Object  $tapestry
     */
    public function addTapestry($tapestry)
    {
        if ($this->postId) {
            return $this->_throwsError('POST_ID_ALREADY_SET');
        }
        if (empty($tapestry->settings)) {
            return $this->_throwsError('SETTINGS_MISSING_IN_NEW_TAPESTRY');
        }
        if (!empty($tapestry->nodes)) {
            return $this->_throwsError('NODES_EXIST_IN_NEW_TAPESTRY');
        }
        if (!empty($tapestry->groups)) {
            return $this->_throwsError('GROUPS_EXIST_IN_NEW_TAPESTRY');
        }
        if (!empty($tapestry->links)) {
            return $this->_throwsError('LINKS_EXIST_IN_NEW_TAPESTRY');
        }

        $this->postId = $this->_updatePost($tapestry, 'tapestry');

        $tapestry->links = [];
        $tapestry->nodes = [];
        $tapestry->groups = [];

        update_post_meta($this->postId, 'tapestry', $tapestry);

        return $tapestry;
    }

    /**	
     * Add a Tapestry node
     *
     * @param   Object  $node   Tapestry node
     * 
     * @return  Object  $node
     */
    public function addTapestryNode($node)
    {
        if (!$this->postId) {
            return $this->_throwsError('INVALID_POST_ID');
        }
        if (isset($node->id)) {
            if ($this->_isValidTapestryNode($node->id)) {
                return $this->_throwsError('NODE_ALREADY_EXISTS');
            }
        }
        if (!isset($node->permissions)) {
            $node->permissions = (object)self::NODE_PERMISSIONS['DEFAULT'];
        }

        $this->_addNode($node);

        $tapestry = get_post_meta($this->postId, 'tapestry', true);

        if (!isset($tapestry->nodes)) {
            $tapestry->nodes = [];
        }

        array_push($tapestry->nodes, $node->id);

        if (empty($tapestry->rootId)) {
            $tapestry->rootId = $tapestry->nodes[0];
        }

        update_post_meta($this->postId, 'tapestry', $tapestry);

        return $node;
    }

    /**
     * Add a new Tapestry group
     * 
     * @param   Object  $group  Tapestry group
     * 
     * @return  Object  $group
     */
    public function addTapestryGroup($group)
    {
        if (!$this->postId) {
            return $this->_throwsError('INVALID_POST_ID');
        }
        if ($this->_isValidTapestryGroup($group->id)) {
            return $this->_throwsError('GROUP_ALREADY_EXISTS');
        }

        $this->_addGroup($group);

        $tapestry = get_post_meta($this->postId, 'tapestry', true);

        if (!isset($tapestry->groups)) {
            $tapestry->groups = [];
        }

        array_push($tapestry->groups, $group->id);

        update_post_meta($this->postId, 'tapestry', $tapestry);

        return $group;
    }

    /**
     * Add A Tapestry Link
     * 
     * @param   Object  $link   Tapestry link
     * 
     * @return  Object  $link 
     */
    public function addTapestryLink($link)
    {
        if (!$this->postId) {
            return $this->_throwsError('INVALID_POST_ID');
        }
        if (!$link->source || !$link->target) {
            return $this->_throwsError('INVALID_NEW_LINK');
        }
        if (!$this->_isChildNodeOfTapestry($link->source) || !$this->_isChildNodeOfTapestry($link->target)) {
            return $this->_throwsError('INVALID_CHILD_NODE');
        }
        if (!$this->_currentUserIsAllowed('ADD', $link->target)) {
            return $this->_throwsError('ADD_NODE_PERMISSION_DENIED');
        }

        $tapestry = get_post_meta($this->postId, 'tapestry', true);

        if (!isset($tapestry->links)) {
            $tapestry->links = [];
        }

        array_push($tapestry->links, $link);

        update_post_meta($this->postId, 'tapestry', $tapestry);

        return $link;
    }

    /**
     * Update Tapestry Node Title
     * 
     * @param   Integer $nodeMetaId     Node meta id
     * @param   String  $title          Node title
     *
     * @return  String  $title
     */
    public function updateTapestryNodeTitle($nodeMetaId, $title)
    {
        if (!$this->postId) {
            return $this->_throwsError('INVALID_POST_ID');
        }
        if (!$this->_isValidTapestryNode($nodeMetaId)) {
            return $this->_throwsError('INVALID_NODE_META_ID');
        }
        if (!$this->_isChildNodeOfTapestry($nodeMetaId)) {
            return $this->_throwsError('INVALID_CHILD_NODE');
        }
        if (!$this->_currentUserIsAllowed('EDIT', $nodeMetaId)) {
            return $this->_throwsError('EDIT_NODE_PERMISSION_DENIED');
        }

        // TODO: Verify that this is a string

        $nodeMetadata = get_metadata_by_mid('post', $nodeMetaId)->meta_value;
        $nodeMetadata->title = $title;

        update_metadata_by_mid('post', $nodeMetaId, $nodeMetadata);

        return $title;
    }

    /**
     * Update Tapestry Node Image URL
     * 
     * @param   Integer $nodeMetaId     Node meta id
     * @param   String  $imageURL       Node image url
     *
     * @return  String  $imageURL
     */
    public function updateTapestryNodeImageURL($nodeMetaId, $imageURL)
    {
        if (!$this->postId) {
            return $this->_throwsError('INVALID_POST_ID');
        }
        if (!$this->_isValidTapestryNode($nodeMetaId)) {
            return $this->_throwsError('INVALID_NODE_META_ID');
        }
        if (!$this->_isChildNodeOfTapestry($nodeMetaId)) {
            return $this->_throwsError('INVALID_CHILD_NODE');
        }
        if (!$this->_currentUserIsAllowed('EDIT', $nodeMetaId)) {
            return $this->_throwsError('EDIT_NODE_PERMISSION_DENIED');
        }

        // TODO: Verify that this is a string

        $nodeMetadata = get_metadata_by_mid('post', $nodeMetaId)->meta_value;
        $nodeMetadata->imageURL = $imageURL;

        update_metadata_by_mid('post', $nodeMetaId, $nodeMetadata);

        return $imageURL;
    }

    /**
     * Update Tapestry Node Unlocked Status
     * 
     * @param   Integer $nodeMetaId     Node meta id
     * @param   Boolean $unlocked       Node unlocked status
     *
     * @return  Boolean $unlocked
     */
    public function updateTapestryNodeUnlockedStatus($nodeMetaId, $unlocked)
    {
        if (!$this->postId) {
            return $this->_throwsError('INVALID_POST_ID');
        }
        if (!$this->_isValidTapestryNode($nodeMetaId)) {
            return $this->_throwsError('INVALID_NODE_META_ID');
        }
        if (!$this->_isChildNodeOfTapestry($nodeMetaId)) {
            return $this->_throwsError('INVALID_CHILD_NODE');
        }
        if (!$this->_currentUserIsAllowed('EDIT', $nodeMetaId)) {
            return $this->_throwsError('EDIT_NODE_PERMISSION_DENIED');
        }

        // TODO: Verify that this is a boolean

        $nodeMetadata = get_metadata_by_mid('post', $nodeMetaId)->meta_value;
        $nodeMetadata->unlocked = $unlocked;

        update_metadata_by_mid('post', $nodeMetaId, $nodeMetadata);

        return $unlocked;
    }

    /**
     * Update Tapestry Node Type Data
     * 
     * @param   Integer $nodeMetaId     Node meta id
     * @param   Object  $typeData       Node type data
     *
     * @return  Object  $typeData
     */
    public function updateTapestryNodeTypeData($nodeMetaId, $typeData)
    {
        if (!$this->postId) {
            return $this->_throwsError('INVALID_POST_ID');
        }
        if (!$this->_isValidTapestryNode($nodeMetaId)) {
            return $this->_throwsError('INVALID_NODE_META_ID');
        }
        if (!$this->_isChildNodeOfTapestry($nodeMetaId)) {
            return $this->_throwsError('INVALID_CHILD_NODE');
        }
        if (!$this->_currentUserIsAllowed('EDIT', $nodeMetaId)) {
            return $this->_throwsError('EDIT_NODE_PERMISSION_DENIED');
        }

        // TODO: Verify that this is a valid object

        $nodeMetadata = get_metadata_by_mid('post', $nodeMetaId)->meta_value;
        $nodeMetadata->typeData = $typeData;

        update_metadata_by_mid('post', $nodeMetaId, $nodeMetadata);

        return $typeData;
    }

    /**
     * Update Tapestry Node Coordinates
     * 
     * @param   Integer $nodeMetaId     Node meta id
     * @param   Number  $coordinates    Node coordinates
     *
     * @return  Number  $coordinates
     */
    public function updateTapestryNodeCoordinates($nodeMetaId, $coordinates)
    {
        if (!$this->postId) {
            return $this->_throwsError('INVALID_POST_ID');
        }
        if (!$this->_isValidTapestryNode($nodeMetaId)) {
            return $this->_throwsError('INVALID_NODE_META_ID');
        }
        if (!$this->_isChildNodeOfTapestry($nodeMetaId)) {
            return $this->_throwsError('INVALID_CHILD_NODE');
        }
        if (!$this->_currentUserIsAllowed('EDIT', $nodeMetaId)) {
            return $this->_throwsError('EDIT_NODE_PERMISSION_DENIED');
        }

        // TODO: Verify that this is a valid object with property x and y
        // round up the numbers before saving.

        $nodeMetadata = get_metadata_by_mid('post', $nodeMetaId)->meta_value;
        $nodeMetadata->coordinates = $coordinates;

        update_metadata_by_mid('post', $nodeMetaId, $nodeMetadata);

        return $coordinates;
    }

    /**
     * Update Tapestry Node Permissions
     * 
     * @param   Integer $nodeMetaId     Node meta id
     * @param   Object  $permissions    Node permissions
     *
     * @return  Object  $permissions
     */
    public function updateTapestryNodePermissions($nodeMetaId, $permissions)
    {
        if (!$this->postId) {
            return $this->_throwsError('INVALID_POST_ID');
        }
        if (!$this->_isValidTapestryNode($nodeMetaId)) {
            return $this->_throwsError('INVALID_NODE_META_ID');
        }
        if (!$this->_isChildNodeOfTapestry($nodeMetaId)) {
            return $this->_throwsError('INVALID_CHILD_NODE');
        }
        if (!$this->_currentUserIsAllowed('EDIT', $nodeMetaId)) {
            return $this->_throwsError('EDIT_NODE_PERMISSION_DENIED');
        }

        // TODO: validate that $permissions has appropriate/valid info

        $nodeMetadata = get_metadata_by_mid('post', $nodeMetaId)->meta_value;
        $nodeMetadata->permissions = $permissions;

        update_metadata_by_mid('post', $nodeMetaId, $nodeMetadata);

        return $permissions;
    }

    /**
     * Update Tapestry settings
     * 
     * @param   Object  $settings   Tapestry settings
     * 
     * @return  Object  $settings 
     */
    public function updateTapestrySettings($settings, $updateTapestryPost = true)
    {
        if (!$this->postId) {
            return $this->_throwsError('INVALID_POST_ID');
        }

        // TODO: add validation for the $settings

        $tapestry = get_post_meta($this->postId, 'tapestry', true);

        if (empty($tapestry)) {
            $tapestry =  (object)array(
                'nodes'     => [],
                'groups'    => [],
                'links'     => []
            );
        }

        $tapestry->settings = $settings;

        if ($updateTapestryPost) {
            $this->_updatePost($tapestry, 'tapestry');
        }

        update_post_meta($this->postId, 'tapestry', $tapestry);

        return $settings;
    }

    /**
     * Retrieve a Tapestry post
     * 
     * @return  Object  $tapestry
     */
    public function getTapestry()
    {
        if (!$this->postId) {
            return $this->_throwsError('INVALID_POST_ID');
        }

        $tapestry = get_post_meta($this->postId, 'tapestry', true);

        $tapestry = $this->_filterTapestry($tapestry);

        $tapestry->nodes = array_map(
            function ($nodeMetaId) {
                $nodeMetadata = get_metadata_by_mid('post', $nodeMetaId);
                $nodePostId = $nodeMetadata->meta_value->post_id;
                $nodeData = get_post_meta($nodePostId, 'tapestry_node_data', true);
                return $this->_formNodeData($nodeData, $nodeMetadata);
            },
            $tapestry->nodes
        );

        $tapestry->groups = array_map(
            function ($groupMetaId) {
                $groupMetadata = get_metadata_by_mid('post', $groupMetaId);
                return $groupMetadata->meta_value;
            },
            $tapestry->groups
        );

        return $tapestry;
    }

    /**
     * Retrieve tapestry settings
     * 
     * @return Object Settings
     */
    public function getTapestrySettings()
    {
        // This could be used as an endpoint if needed
        if (!$this->postId) {
            return $this->_throwsError('INVALID_POST_ID');
        }

        $tapestry = get_post_meta($this->postId, 'tapestry', true);

        if (!isset($tapestry)) {
            $tapestry = (object)array(
                'settings' => (object)array()
            );
        } else if (!isset($tapestry->settings)) {
            $tapestry->settings = (object)array();
        }

        return $tapestry->settings;
    }


    /**
     * Retrieve all node ids associated to a tapestry
     * 
     * @return Array list of node ids for a tapestry
     */
    public function getTapestryNodeIds()
    {
        if (!$this->postId) {
            return $this->_throwsError('INVALID_POST_ID');
        }

        $tapestry = get_post_meta($this->postId, 'tapestry', true);

        if (!isset($tapestry->nodes)) {
            return [];
        }

        return $tapestry->nodes;
    }

    private function _formNodeData($nodeData, $nodeMetadata)
    {
        // Update node data here to match its own version
        // This enables the same node to have multiple versions
        $nodeData->id = (int)$nodeMetadata->meta_id;
        if (isset($nodeMetadata->meta_value->title)) {
            $nodeData->title = $nodeMetadata->meta_value->title;
        }
        if (isset($nodeMetadata->meta_value->coordinates->x)) {
            $nodeData->fx = $nodeMetadata->meta_value->coordinates->x;
        }
        if (isset($nodeMetadata->meta_value->coordinates->y)) {
            $nodeData->fy = $nodeMetadata->meta_value->coordinates->y;
        }
        if (isset($nodeMetadata->meta_value->permissions)) {
            $nodeData->permissions = $nodeMetadata->meta_value->permissions;
        }
        if (isset($nodeMetadata->meta_value->typeData)) {
            $nodeData->typeData = $nodeMetadata->meta_value->typeData;
        }
        if (isset($nodeMetadata->meta_value->imageURL)) {
            $nodeData->imageURL = $nodeMetadata->meta_value->imageURL;
        }
        if (isset($nodeMetadata->meta_value->unlocked)) {
            $nodeData->unlocked = $nodeMetadata->meta_value->unlocked;
        }
        return $nodeData;
    }

    /**
     * TODO: this function could be used as a utility function
     */
    private function _isValidTapestry($postId)
    {
        return is_numeric($postId) && get_post_type($postId) == 'tapestry';
    }

    /**
     * TODO: this function could be used as a utility function
     */
    private function _isValidTapestryNode($nodeMetaId)
    {
        if (is_numeric($nodeMetaId)) {
            $nodeMetadata = get_metadata_by_mid('post', $nodeMetaId);
            $nodePostId = $nodeMetadata->meta_value->post_id;
            return get_post_type($nodePostId) == 'tapestry_node';
        }
        return false;
    }

    private function _isChildNodeOfTapestry($nodeMetaId)
    {
        if (is_numeric($nodeMetaId) && $this->_isValidTapestry($this->postId)) {
            $tapestry = get_post_meta($this->postId, 'tapestry', true);
            return in_array($nodeMetaId, $tapestry->nodes);
        }
        return false;
    }

    /**
     * TODO: this function could be used as a utility function
     */
    private function _isValidTapestryGroup($groupMetaId)
    {
        if (is_numeric($groupMetaId)) {
            $groupMetadata = get_metadata_by_mid('post', $groupMetaId);
            return is_object($groupMetadata->meta_value)
                && $groupMetadata->meta_value->type == 'tapestry_group';
        }
        return false;
    }

    private function _currentUserIsAllowed($action, $nodeMetaId)
    {
        $options = self::NODE_PERMISSIONS['OPTIONS'];
        $userId = wp_get_current_user()->ID;
        $groupIds = $this->_getGroupIdsOfUser($userId);

        if ((TapestryUserRoles::isEditor())
            && (TapestryUserRoles::isAdministrator())
            && (TapestryUserRoles::isAuthorOfThePost($this->postId))
        ) {
            return true;
        } else {
            $nodePermissions = get_metadata_by_mid('post', $nodeMetaId)->meta_value->permissions;
            if ((property_exists($nodePermissions, 'public')
                    && in_array($options[$action], $nodePermissions->public))
                || (property_exists($nodePermissions, 'user-' . $userId)
                    && in_array($options[$action], $nodePermissions->{'user-' . $userId}))
            ) {
                return true;
            } else {
                foreach ($groupIds as $groupId) {
                    if ((property_exists($nodePermissions, 'group-' . $groupId))
                        && (in_array($options[$action], $nodePermissions->{'group-' . $groupId}))
                    ) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    private function _addNode($node)
    {
        $nodePostId = $this->_updatePost($node, 'tapestry_node');
        $nodeMetadata = $this->_makeMetadata($node, $nodePostId);
        $node->id = add_post_meta($this->postId, 'tapestry_node', $nodeMetadata);

        update_post_meta($nodePostId, 'tapestry_node_data', $node);
    }

    private function _addGroup($group)
    {
        $group->id = add_post_meta($this->postId, 'group', $group);
        $group->type = 'tapestry_group';

        // TODO: handle the local nodes logic here
        // At the moment, we put everything in the post meta

        update_metadata_by_mid('post', $group->id, $group);
    }

    private function _updatePost($post, $postType = 'tapestry', $postId = null)
    {
        switch ($postType) {
            case self::POST_TYPES['TAPESTRY_NODE']:
                $postTitle = $post->title;
                $postStatus = $post->status;
                break;
            case self::POST_TYPES['TAPESTRY']:
            default:
                $postId = $this->postId;
                $postTitle = $post->settings->title;
                $postStatus = $post->settings->status;
                break;
        }
        return wp_insert_post(array(
            'ID' => $postId,
            'post_type' => $postType,
            'post_status' => $postStatus,
            'post_title' => $postTitle
        ), true);
    }

    private function _throwsError($code)
    {
        $ERROR = (object)self::ERRORS[$code];
        return new WP_Error($code, $ERROR->MESSAGE, $ERROR->STATUS);
    }

    private function _getNodeIds($nodes)
    {
        return array_map(function ($node) {
            return $node->id;
        }, $nodes);
    }

    private function _getGroupIds($groups)
    {
        return array_map(function ($group) {
            return $group->id;
        }, $groups);
    }

    private function _getGroupIdsOfUser($userId)
    {
        $groupIds = [];
        $tapestry = get_post_meta($this->postId, 'tapestry', true);

        foreach ($tapestry->groups as $groupId) {
            $groupMetadata = get_metadata_by_mid('post', $groupId)->meta_value;
            if (in_array($userId, $groupMetadata->members)) {
                array_push($groupIds, $groupId);
            }
        }

        return $groupIds;
    }

    private function _filterTapestry($tapestry)
    {
        if (!isset($tapestry->nodes)) {
            $tapestry->nodes = [];
        }

        if (!isset($tapestry->links)) {
            $tapestry->links = [];
        }

        if (!isset($tapestry->groups)) {
            $tapestry->groups = [];
        }

        if ((!TapestryUserRoles::isEditor())
            && (!TapestryUserRoles::isAdministrator())
            && (!TapestryUserRoles::isAuthorOfThePost($this->postId))
        ) {
            $tapestry->nodes = $this->_filterNodeMetaIdsByPermissions($tapestry->nodes);
            $tapestry->links = $this->_filterLinksByNodeMetaIds($tapestry->links, $tapestry->nodes);
            $tapestry->groups = $this->_getGroupIdsOfUser(wp_get_current_user()->ID);
        }

        if (!isset($tapestry->nodes)) {
            $tapestry->nodes = [];
        }

        if (!isset($tapestry->links)) {
            $tapestry->links = [];
        }

        if (!isset($tapestry->groups)) {
            $tapestry->groups = [];
        }

        return $tapestry;
    }

    private function _filterNodeMetaIdsByPermissions($nodeMetaIds)
    {
        $newNodeMetaIds = [];
        $options = self::NODE_PERMISSIONS['OPTIONS'];
        $userId = wp_get_current_user()->ID;
        $groupIds = $this->_getGroupIdsOfUser($userId);

        foreach ($nodeMetaIds as $nodeMetaId) {
            $nodePermissions = get_metadata_by_mid('post', $nodeMetaId)->meta_value->permissions;

            if ((property_exists($nodePermissions, 'public')
                    && in_array($options['READ'], $nodePermissions->public))
                || (property_exists($nodePermissions, 'user-' . $userId)
                    && in_array($options['READ'], $nodePermissions->{'user-' . $userId}))
            ) {
                array_push($newNodeMetaIds, $nodeMetaId);
            } else {
                foreach ($groupIds as $groupId) {
                    if ((property_exists($nodePermissions, 'group-' . $groupId))
                        && (in_array($options['READ'], $nodePermissions->{'group-' . $groupId}))
                    ) {
                        array_push($newNodeMetaIds, $nodeMetaId);
                    }
                }
            }
        }

        return $newNodeMetaIds;
    }

    private function _filterLinksByNodeMetaIds($links, $nodeMetaIds)
    {
        $newLinks = [];

        foreach ($links as $link) {
            if ((in_array($link->source, $nodeMetaIds))
                && (in_array($link->target, $nodeMetaIds))
            ) {
                array_push($newLinks, $link);
            }
        }

        return $newLinks;
    }

    private function _makeMetadata($node, $nodePostId)
    {
        return (object)array(
            'post_id'       => $nodePostId,
            'title'         => $node->title,
            'permissions'   => $node->permissions,
            'coordinates'   => (object)array(
                'x' => $node->fx,
                'y' => $node->fy
            )
        );
    }
}
