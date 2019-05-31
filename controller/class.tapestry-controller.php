<?php
/**
 * Add/update/retrieve Tapestry post and its child nodes
 * 
 */

class TapestryController
{
    const POST_TYPES = [
        'TAPESTRY' => 'tapestry',
        'TAPESTRY_NODE' => 'tapestry_node'
    ];
    const ERRORS = [
        'INVALID_POST_ID' => [
            'MESSAGE' => 'PostID is invalid',
            'STATUS' => ['status' => 404]
        ],
        'GROUP_ALREADY_EXISTS' => [
            'MESSAGE' => 'Group already exists in the database',
            'STATUS' => ['status' => 400]
        ],
        'NODE_ALREADY_EXISTS' => [
            'MESSAGE' => 'Node already exists in the database',
            'STATUS' => ['status' => 400]
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
     * Update Tapestry nodes first then
     * Update the existing Tapestry if the postId is provided
     * Otherwise, a new Tapestry will be created
     * 
     * @param Object $tapestry Tapestry
     * 
     * @return Object $tapestry
     */
    public function updateTapestry($tapestry)
    {
        if (!$this->postId) {
            $this->postId = $this->_updatePost($tapestry, 'tapestry');
        }

        $this->_updateNodes($tapestry->nodes);

        $this->_updateGroups($tapestry->groups);

        if (!isset($tapestry->rootId) && !empty($tapestry->nodes)) {
            $tapestry->rootId = $tapestry->nodes[0]->id;
        }

        $tapestry->nodes = $this->_getNodeIds($tapestry->nodes);

        $tapestry->groups = $this->_getGroupIds($tapestry->groups);

        update_post_meta($this->postId, 'tapestry', $tapestry);
        return $tapestry;
    }

    /**	
     * Add a Tapestry node
     *
     * @param Object  $node Tapestry node
     * 
     * @return Object  $node
     */
    public function addTapestryNode($node)
    {
        if (!$this->postId) {
            return $this->_throwsError('INVALID_POST_ID');
        }

        if ($this->_isValidTapestryNode($node->id)) {
            return $this->_throwsError('NODE_ALREADY_EXISTS');
        }

        $this->_updateNodes([$node]);

        $tapestry = get_post_meta($this->postId, 'tapestry', true);

        array_push($tapestry->nodes, $node->id);

        update_post_meta($this->postId, 'tapestry', $tapestry);

        return $node;
    }

    /**
     * Add a new Tapestry group
     * 
     * @param Object $group Tapestry group
     * 
     * @return Object $group
     */
    public function addTapestryGroup($group)
    {
        if (!$this->postId) {
            return $this->_throwsError('INVALID_POST_ID');
        }

        if ($this->_isValidTapestryGroup($group->id)) {
            return $this->_throwsError('GROUP_ALREADY_EXISTS');
        }

        $this->_updateGroups([$group]);

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
     * @param Object $settings Tapestry settings
     * 
     * @return Object $settings 
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
        return $tapestry->settings;
    }

    /**
     * Retrieve a Tapestry post
     * 
     * @return Object $tapestry
     */
    public function getTapestry()
    {
        if (!$this->postId) {
            return $this->_throwsError('INVALID_POST_ID');
        }

        $tapestry = get_post_meta($this->postId, 'tapestry', true);

        $tapestry->nodes = array_map(
            function ($nodeMetaId) {
                $metadata = get_metadata_by_mid('post', $nodeMetaId);
                $nodePostId = $metadata->meta_value->post_id;
                $nodeData = get_post_meta($nodePostId, 'tapestry_node_data', true);
                return $this->_formNodeData($nodeData, $metadata);
            },
            $tapestry->nodes
        );

        $tapestry->groups = array_map(
            function ($groupMetaId) {
                $metadata = get_metadata_by_mid('post', $groupMetaId);
                return $metadata->meta_value;
            },
            $tapestry->groups
        );

        // TODO: delete the below when being able to create tapestry from scratch
        $tapestry->links = $this->_getNewLinks($tapestry->links, $tapestry->nodes);
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

    private function _formNodeData($nodeData, $metadata) 
    {
        // Update node data here to match its own version
        // This enables the same node to have multiple versions
        $nodeData->id = (int)$metadata->meta_id;
        $nodeData->title = $metadata->meta_value->title;
        $nodeData->fx = $metadata->meta_value->coordinates->x;
        $nodeData->fy = $metadata->meta_value->coordinates->y;
        return $nodeData;
    }

    /**
     * TODO: Remove this when we can build a tapestry from scratch
     * HACK - create a new links array that works with new IDs
     */
    private function _getNewLinks($oldLinks, $nodes)
    {
        $mappings = array(
            1 => $nodes[0]->id,
            2 => $nodes[1]->id,
            3 => $nodes[2]->id,
            4 => $nodes[3]->id,
            5 => $nodes[4]->id,
            6 => $nodes[5]->id,
            8 => $nodes[6]->id,
            9 => $nodes[7]->id,
            7 => $nodes[8]->id,
            10 => $nodes[9]->id
        );
        $newLinks = array_map(function ($link) use ($mappings) {
            $link->source = $mappings[$link->source];
            $link->target = $mappings[$link->target];
            $link->value = $mappings[$link->value];
            return $link;
        }, $oldLinks);

        return $newLinks;
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
            $metadata = get_metadata_by_mid('post', $nodeMetaId);
            $nodePostId = $metadata->meta_value->post_id;
            return get_post_type($nodePostId) == 'tapestry_node';
        }
        return false;
    }

    /**
     * TODO: this function could be used as a utility function
     */
    private function _isValidTapestryGroup($groupMetaId)
    {
        if (is_numeric($groupMetaId)) {
            $metadata = get_metadata_by_mid('post', $groupMetaId);
            return is_object($metadata->meta_value)
                && $metadata->meta_value->type == 'tapestry_group';
        }
        return false;
    }

    private function _updateNodes($nodes)
    {
        foreach ($nodes as $node) {
            if ($this->_isValidTapestryNode($node->id)) {
                $metadata = get_metadata_by_mid('post', $node->id)->meta_value;
                $nodePostId = $metadata->post_id;
            } else {
                $nodePostId = $this->_updatePost($node, 'tapestry_node');
                $metadata = $this->_makeMetadata($node, $nodePostId);
                $node->id = add_post_meta($this->postId, 'tapestry_node', $metadata);
            }
            update_post_meta($nodePostId, 'tapestry_node_data', $node);
        }
    }

    private function _updateGroups($groups)
    {
        foreach ($groups as $group) {
            if (!$this->_isValidTapestryGroup($group->id)) {
                $group->id = add_post_meta($this->postId, 'group', $group);
            }

            // TODO: handle the local nodes logic here
            // At the moment, we put everything in the post meta

            update_metadata_by_mid('post', $group->id, $group);
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
            'post_id' => $nodePostId,
            'title' => $node->title,
            'coordinates' => (object)array(
                'x' => $node->fx,
                'y' => $node->fy
            )
        );
    }
}
