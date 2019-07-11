<?php
require_once dirname(__FILE__) . "/../utilities/class.tapestry-errors.php";
require_once dirname(__FILE__) . "/../utilities/class.tapestry-helpers.php";
require_once dirname(__FILE__) . "/../interfaces/interface.tapestry-node-controller.php";

/**
 * Add/update/retrieve Tapestry post and its child nodes
 * 
 */
class TapestryNodeController implements ITapestryNodeController
{
    private $postId;
    private $nodeMetaId;

    /**
     * Constructor
     * 
     * @param   Number  $postId post ID
     * @param   Number  $nodeMetaId node meta ID
     * 
     * @return  NULL
     */
    public function __construct($postId = 0, $nodeMetaId = 0)
    {
        $this->postId = (int) $postId;
        $this->nodeMetaId = (int) $nodeMetaId;
    }

    /**	
     * Add a Tapestry node
     *
     * @param   Object  $node   Tapestry node
     * 
     * @return  Object  $node
     */
    public function save($node)
    {
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
     * Retrieve all node ids associated to a tapestry
     * 
     * @return Array list of node ids for a tapestry
     */
    public function get()
    {
        if (!$this->postId) {
            return TapestryErrors::throwsError('INVALID_POST_ID');
        }

        $tapestry = get_post_meta($this->postId, 'tapestry', true);

        if (!isset($tapestry->nodes)) {
            return [];
        }

        return $tapestry->nodes;
    }

    /**
     * Update Tapestry Node Title
     * 
     * @param   String  $title          Node title
     *
     * @return  String  $title
     */
    public function updateTitle($title)
    {
        return $this->_updateNodeProperty('title', $title);
    }

    /**
     * Update Tapestry Node Image URL
     * 
     * @param   String  $imageURL       Node image url
     *
     * @return  String  $imageURL
     */
    public function updateImageURL($imageURL)
    {
        return $this->_updateNodeProperty('imageURL', $imageURL);
    }

    /**
     * Update Tapestry Node Unlocked Status
     * 
     * @param   Boolean $unlocked       Node unlocked status
     *
     * @return  Boolean $unlocked
     */
    public function updateUnlockedStatus($unlocked)
    {
        return $this->_updateNodeProperty('unlocked', $unlocked);
    }

    /**
     * Update Tapestry Node Type Data
     * 
     * @param   Object  $typeData       Node type data
     *
     * @return  Object  $typeData
     */
    public function updateTypeData($typeData)
    {
        return $this->_updateNodeProperty('typeData', $typeData);
    }

    /**
     * Update Tapestry Node Coordinates
     * 
     * @param   Number  $coordinates    Node coordinates
     *
     * @return  Number  $coordinates
     */
    public function updateCoordinates($coordinates)
    {
        return $this->_updateNodeProperty('coordinates', $coordinates);
    }

    /**
     * Update Tapestry Node Permissions
     * 
     * @param   Object  $permissions    Node permissions
     *
     * @return  Object  $permissions
     */
    public function updatePermissions($permissions)
    {
        // TODO: validate that $permissions has appropriate/valid info
        return $this->_updateNodeProperty('permissions', $permissions);
    }

    private function _addNode($node)
    {
        $nodePostId = TapestryHelpers::updatePost($node, 'tapestry_node');
        $nodeMetadata = $this->_makeMetadata($node, $nodePostId);
        $node->id = add_post_meta($this->postId, 'tapestry_node', $nodeMetadata);

        update_post_meta($nodePostId, 'tapestry_node_data', $node);

        return $node;
    }

    private function _updateNodeProperty($property, $newPropertyValue)
    {
        $nodeMetadata = get_metadata_by_mid('post', $this->nodeMetaId)->meta_value;
        $nodeMetadata->{$property} = $newPropertyValue;

        update_metadata_by_mid('post', $this->nodeMetaId, $nodeMetadata);

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
