<?php
require_once dirname(__FILE__) . "/../utilities/class.tapestry-errors.php";
require_once dirname(__FILE__) . "/../utilities/class.tapestry-helpers.php";

/**
 * Add/update/retrieve Tapestry post and its child nodes
 * 
 */
class TapestryNodeController
{
    private $postId;

    /**
     * Constructor
     */
    public function __construct($postId = 0)
    {
        if ($postId && !TapestryHelpers::isValidTapestry($postId)) {
            return TapestryErrors::throwsError('INVALID_POST_ID');
        }
        $this->postId = (int) $postId;
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
            return TapestryErrors::throwsError('INVALID_POST_ID');
        }
        if (isset($node->id)) {
            if (TapestryHelpers::isValidTapestryNode($node->id)) {
                return TapestryErrors::throwsError('NODE_ALREADY_EXISTS');
            }
        }
        if (!isset($node->permissions)) {
            $node->permissions = (object) TapestryNodePermissions::getDefaultNodePermissions();
        }

        return $this->_addNode($node);
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
            return TapestryErrors::throwsError('INVALID_POST_ID');
        }
        if (!TapestryHelpers::isValidTapestryNode($nodeMetaId)) {
            return TapestryErrors::throwsError('INVALID_NODE_META_ID');
        }
        if (!TapestryHelpers::isChildNodeOfTapestry($nodeMetaId, $this->postId)) {
            return TapestryErrors::throwsError('INVALID_CHILD_NODE');
        }
        if (!TapestryHelpers::currentUserIsAllowed('EDIT', $nodeMetaId, $this->postId)) {
            return TapestryErrors::throwsError('EDIT_NODE_PERMISSION_DENIED');
        }

        // TODO: Verify that this is a string

        return $this->_updateNodeProperty($nodeMetaId, 'title', $title);
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
            return TapestryErrors::throwsError('INVALID_POST_ID');
        }
        if (!TapestryHelpers::isValidTapestryNode($nodeMetaId)) {
            return TapestryErrors::throwsError('INVALID_NODE_META_ID');
        }
        if (!TapestryHelpers::isChildNodeOfTapestry($nodeMetaId, $this->postId)) {
            return TapestryErrors::throwsError('INVALID_CHILD_NODE');
        }
        if (!TapestryHelpers::currentUserIsAllowed('EDIT', $nodeMetaId, $this->postId)) {
            return TapestryErrors::throwsError('EDIT_NODE_PERMISSION_DENIED');
        }

        // TODO: Verify that this is a string

        return $this->_updateNodeProperty($nodeMetaId, 'imageURL', $imageURL);
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
            return TapestryErrors::throwsError('INVALID_POST_ID');
        }
        if (!TapestryHelpers::isValidTapestryNode($nodeMetaId)) {
            return TapestryErrors::throwsError('INVALID_NODE_META_ID');
        }
        if (!TapestryHelpers::isChildNodeOfTapestry($nodeMetaId, $this->postId)) {
            return TapestryErrors::throwsError('INVALID_CHILD_NODE');
        }
        if (!TapestryHelpers::currentUserIsAllowed('EDIT', $nodeMetaId, $this->postId)) {
            return TapestryErrors::throwsError('EDIT_NODE_PERMISSION_DENIED');
        }

        // TODO: Verify that this is a boolean

        return $this->_updateNodeProperty($nodeMetaId, 'unlocked', $unlocked);
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
            return TapestryErrors::throwsError('INVALID_POST_ID');
        }
        if (!TapestryHelpers::isValidTapestryNode($nodeMetaId)) {
            return TapestryErrors::throwsError('INVALID_NODE_META_ID');
        }
        if (!TapestryHelpers::isChildNodeOfTapestry($nodeMetaId, $this->postId)) {
            return TapestryErrors::throwsError('INVALID_CHILD_NODE');
        }
        if (!TapestryHelpers::currentUserIsAllowed('EDIT', $nodeMetaId, $this->postId)) {
            return TapestryErrors::throwsError('EDIT_NODE_PERMISSION_DENIED');
        }

        // TODO: Verify that this is a valid object

        return $this->_updateNodeProperty($nodeMetaId, 'typeData', $typeData);
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
            return TapestryErrors::throwsError('INVALID_POST_ID');
        }
        if (!TapestryHelpers::isValidTapestryNode($nodeMetaId)) {
            return TapestryErrors::throwsError('INVALID_NODE_META_ID');
        }
        if (!TapestryHelpers::isChildNodeOfTapestry($nodeMetaId, $this->postId)) {
            return TapestryErrors::throwsError('INVALID_CHILD_NODE');
        }
        if (!TapestryHelpers::currentUserIsAllowed('EDIT', $nodeMetaId, $this->postId)) {
            return TapestryErrors::throwsError('EDIT_NODE_PERMISSION_DENIED');
        }

        // TODO: Verify that this is a valid object with property x and y
        // round up the numbers before saving.

        return $this->_updateNodeProperty($nodeMetaId, 'coordinates', $coordinates);
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
            return TapestryErrors::throwsError('INVALID_POST_ID');
        }
        if (!TapestryHelpers::isValidTapestryNode($nodeMetaId)) {
            return TapestryErrors::throwsError('INVALID_NODE_META_ID');
        }
        if (!TapestryHelpers::isChildNodeOfTapestry($nodeMetaId, $this->postId)) {
            return TapestryErrors::throwsError('INVALID_CHILD_NODE');
        }
        if (!TapestryHelpers::currentUserIsAllowed('EDIT', $nodeMetaId, $this->postId)) {
            return TapestryErrors::throwsError('EDIT_NODE_PERMISSION_DENIED');
        }

        // TODO: validate that $permissions has appropriate/valid info

        return $this->_updateNodeProperty($nodeMetaId, 'permissions', $permissions);
    }

    private function _addNode($node)
    {
        $nodePostId = TapestryHelpers::updatePost($node, 'tapestry_node');
        $nodeMetadata = $this->_makeMetadata($node, $nodePostId);
        $node->id = add_post_meta($this->postId, 'tapestry_node', $nodeMetadata);

        update_post_meta($nodePostId, 'tapestry_node_data', $node);

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

    private function _updateNodeProperty($nodeMetaId, $property, $newPropertyValue)
    {
        $nodeMetadata = get_metadata_by_mid('post', $nodeMetaId)->meta_value;
        $nodeMetadata->{$property} = $newPropertyValue;

        update_metadata_by_mid('post', $nodeMetaId, $nodeMetadata);

        return $newPropertyValue;
    }

    private function _makeMetadata($node, $nodePostId)
    {
        return (object) array(
            'post_id'       => $nodePostId,
            'title'         => $node->title,
            'permissions'   => $node->permissions,
            'coordinates'   => (object) array(
                'x' => $node->fx,
                'y' => $node->fy
            )
        );
    }
}
