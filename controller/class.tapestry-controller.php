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
        'DEFAULT' => [
            'public' => ['read']
        ],
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
        if ($this->_isValidTapestryNode($node->id)) {
            return $this->_throwsError('NODE_ALREADY_EXISTS');
        }
        if (!isset($node->permissions)) {
            $node->permissions = (object)self::NODE_PERMISSIONS['DEFAULT'];
        }

        $this->_addNode($node);

        $tapestry = get_post_meta($this->postId, 'tapestry', true);

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

        $tapestry = get_post_meta($this->postId, 'tapestry', true);

        array_push($tapestry->links, $link);

        update_post_meta($this->postId, 'tapestry', $tapestry);

        return $link;
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
    public function updateTapestrySettings($settings)
    {
        if (!$this->postId) {
            return $this->_throwsError('INVALID_POST_ID');
        }

        // TODO: add validation for the $settings

        $tapestry = get_post_meta($this->postId, 'tapestry', true);
        $tapestry->settings = $settings;

        $this->_updatePost($tapestry, 'tapestry');

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

        $tapestry->nodes = $this->_filterNodeMetaIdsByPermissions($tapestry->nodes);

        $tapestry->links = $this->_filterLinksByNodeMetaIds($tapestry->links, $tapestry->nodes);

        $tapestry->nodes = array_map(
            function ($nodeMetaId) {
                $nodeMetadata = get_metadata_by_mid('post', $nodeMetaId);
                $nodePostId = $nodeMetadata->meta_value->post_id;
                $nodeData = get_post_meta($nodePostId, 'tapestry_node_data', true);
                return $this->_formNodeData($nodeData, $nodeMetadata);
            },
            $tapestry->nodes
        );

        if (TapestryUserRoles::isAuthor() ||
            TapestryUserRoles::isEditor() ||
            TapestryUserRoles::isAdministrator()
        ) {
            $tapestry->groups = array_map(
                function ($groupMetaId) {
                    $groupMetadata = get_metadata_by_mid('post', $groupMetaId);
                    return $groupMetadata->meta_value;
                },
                $tapestry->groups
            );
        }

        return $tapestry;
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
        return $tapestry->nodes;
    }

    private function _formNodeData($nodeData, $nodeMetadata)
    {
        // Update node data here to match its own version
        // This enables the same node to have multiple versions
        $nodeData->id = (int)$nodeMetadata->meta_id;
        $nodeData->title = $nodeMetadata->meta_value->title;
        $nodeData->fx = $nodeMetadata->meta_value->coordinates->x;
        $nodeData->fy = $nodeMetadata->meta_value->coordinates->y;
        $nodeData->permissions = $nodeMetadata->meta_value->permissions;
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
        $tapestry = get_post_meta($this->postId, 'tapestry', true);
        return array_map(
            function ($groupMetaId) use ($userId) {
                $groupMetadata = get_metadata_by_mid('post', $groupMetaId)->meta_value;
                if (in_array($userId, $groupMetadata->members)) {
                    return $groupMetadata->id;
                }
            },
            $tapestry->groups
        );
    }

    private function _filterNodeMetaIdsByPermissions($nodeMetaIds)
    {
        $newNodeMetaIds = [];
        $options = self::NODE_PERMISSIONS['OPTIONS'];
        $userId = 'user-' . (string)wp_get_current_user()->ID;
        $groupIds = $this->_getGroupIdsOfUser($userId);

        foreach ($nodeMetaIds as $nodeMetaId) {
            $nodePermissions = get_metadata_by_mid('post', $nodeMetaId)->meta_value->permissions;

            if (in_array($options['READ'], $nodePermissions->public) ||
                in_array($options['READ'], $nodePermissions->$userId)
            ) {
                array_push($newNodeMetaIds, $nodeMetaId);
            } else {
                foreach ($groupIds as $groupId) {
                    $groupId = 'group-' . (string)$groupId;
                    if (in_array($options['READ'], $nodePermissions->$groupId)) {
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
            if (in_array($link->source, $nodeMetaIds) &&
                in_array($link->target, $nodeMetaIds)
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
