<?php
/**
 * Add/update/retrieve Tapestry post and its child nodes
 * 
 */

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
        'INVALID_TAPESTRY' => [
            'MESSAGE'   => 'Tapestry should have at max one root node when being created',
            'STATUS'    => ['status' => 400]
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
     * Note: the Tapestry should have at max one root node
     * There should not be any links available at this moment
     * 
     * @param   Object  $tapestry   Tapestry
     * 
     * @return  Object  $tapestry
     */
    public function addTapestry($tapestry)
    {
        if (isset($tapestry->links) || count($tapestry->nodes) > 1) {
            return $this->_throwsError('INVALID_TAPESTRY');
        }
        if (!$this->postId) {
            $this->postId = $this->_updatePost($tapestry, 'tapestry');
        }
        if (!isset($tapestry->nodes)) {
            $tapestry->nodes = [];
        }
        if (!isset($tapestry->groups)) {
            $tapestry->groups = [];
        }

        foreach ($tapestry->nodes as $node) {
            if (!isset($node->permissions)) {
                $node->permissions = (object)self::NODE_PERMISSIONS['DEFAULT'];
            }
        }

        $this->_addNodes($tapestry->nodes);
        $this->_addGroups($tapestry->groups);

        if (!empty($tapestry->nodes)) {
            $tapestry->rootId = $tapestry->nodes[0]->id;
        }

        $tapestry->links = [];
        $tapestry->nodes = $this->_getNodeIds($tapestry->nodes);
        $tapestry->groups = $this->_getGroupIds($tapestry->groups);

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

        $this->_addNodes([$node]);

        $tapestry = get_post_meta($this->postId, 'tapestry', true);

        array_push($tapestry->nodes, $node->id);

        update_post_meta($this->postId, 'tapestry', $tapestry);

        return $node;
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

        $this->_addGroups([$group]);

        $tapestry = get_post_meta($this->postId, 'tapestry', true);

        if (!isset($tapestry->groups)) {
            $tapestry->groups = [];
        }

        array_push($tapestry->groups, $group->id);

        update_post_meta($this->postId, 'tapestry', $tapestry);

        return $group;
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

        $tapestry = get_post_meta($this->postId, 'tapestry', true);

        if (!is_array($tapestry->links)) {
            $tapestry->links = [];
        }

        array_push($tapestry->links, $link);

        update_post_meta($this->postId, 'tapestry', $tapestry);

        return $link;
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

    private function _addNodes($nodes)
    {
        foreach ($nodes as $node) {
            $nodePostId = $this->_updatePost($node, 'tapestry_node');
            $metadata = $this->_makeMetadata($node, $nodePostId);
            $node->id = add_post_meta($this->postId, 'tapestry_node', $metadata);
            update_post_meta($nodePostId, 'tapestry_node_data', $node);
        }
    }

    private function _addGroups($groups)
    {
        foreach ($groups as $group) {
            $group->id = add_post_meta($this->postId, 'group', $group);

            // TODO: handle the local nodes logic here
            // At the moment, we put everything in the post meta
        }
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
