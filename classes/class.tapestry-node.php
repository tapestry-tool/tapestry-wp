<?php
require_once dirname(__FILE__) . "/../utilities/class.tapestry-errors.php";
require_once dirname(__FILE__) . "/../utilities/class.tapestry-helpers.php";
require_once dirname(__FILE__) . "/../interfaces/interface.tapestry-node.php";

/**
 * Add/update/retrieve Tapestry post and its child nodes
 * 
 */
class TapestryNode implements ITapestryNode
{
    private $postId;
    private $nodeMetaId;
    private $type;
    private $title;
    private $status;
    private $unlocked;
    private $typeData;
    private $imageURL;
    private $mediaType;
    private $mediaFormat;
    private $mediaDuration;
    private $coordinates;
    private $permissions;

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

        if (TapestryHelpers::isValidTapestryNode($this->nodeMetaId)) {
            $node = $this->_loadFromDatabase();
            $this->type = $node->type;
            $this->title = $node->title;
            $this->status = $node->status;
            $this->imageURL = $node->imageURL;
            $this->unlocked = $node->unlocked;
            $this->typeData = $node->typeData;
            $this->mediaType = $node->mediaType;
            $this->mediaFormat = $node->mediaFormat;
            $this->mediaDuration = $node->mediaDuration;
            $this->coordinates = $node->coordinates;
            $this->permissions = $node->permissions;
        } else {
            $this->title = '';
            $this->status = '';
            $this->imageURL = '';
            $this->mediaType = '';
            $this->mediaFormat = '';
            $this->unlocked = false;
            $this->mediaDuration = 0;
            $this->type = 'tapestry_node';
            $this->typeData = (object) [];
            $this->coordinates = (object) [];
            $this->permissions = TapestryNodePermissions::getDefaultNodePermissions();
        }
    }

    /**	
     * Save the Tapestry node
     *
     * @return  Object  $node
     */
    public function save()
    {
        return $this->_saveToDatabase();
    }

    /**
     * Set Node
     * 
     * @param   Object  $node  node
     *
     * @return  NULL
     */
    public function set($node)
    {
        if (isset($node->type) && is_string($node->type)) {
            $this->type = $node->type;
        }
        if (isset($node->title) && is_string($node->title)) {
            $this->title = $node->title;
        }
        if (isset($node->status) && is_string($node->status)) {
            $this->status = $node->status;
        }
        if (isset($node->unlocked) && is_bool($node->unlocked)) {
            $this->unlocked = $node->unlocked;
        }
        if (isset($node->typeData) && is_object($node->typeData)) {
            $this->typeData = $node->typeData;
        }
        if (isset($node->imageURL) && is_string($node->imageURL)) {
            $this->imageURL = $node->imageURL;
        }
        if (isset($node->mediaType) && is_string($node->mediaType)) {
            $this->mediaType = $node->mediaType;
        }
        if (isset($node->mediaFormat) && is_string($node->mediaFormat)) {
            $this->mediaFormat = $node->mediaFormat;
        }
        if (isset($node->mediaDuration) && is_numeric($node->mediaDuration)) {
            $this->mediaDuration = $node->mediaDuration;
        }
        if (isset($node->coordinates) && is_object($node->coordinates)) {
            $this->coordinates = $node->coordinates;
        }
        if (isset($node->permissions) && is_object($node->permissions)) {
            $this->permissions = $node->permissions;
        }
    }

    /**
     * Get the node
     * 
     * @return  $node    node
     */
    public function get()
    {
        if (!$this->nodeMetaId) {
            throw new TapestryError('INVALID_NODE_META_ID');
        }
        return $this->_formNode();
    }

    private function _saveToDatabase()
    {
        $node = $this->_formNode();

        $nodePostId = TapestryHelpers::updatePost($node, 'tapestry_node');

        $nodeMetadata = $this->_makeMetadata($node, $nodePostId);

        if ($this->nodeMetaId) {
            update_metadata_by_mid('post', $this->nodeMetaId, $nodeMetadata);
        } else {
            $this->nodeMetaId = add_post_meta($this->postId, 'tapestry_node', $nodeMetadata);
            $node->id = $this->nodeMetaId;
        }

        // TODO: add a check permission to see if the user is allowed to edit
        // the "original" node data
        update_post_meta($nodePostId, 'tapestry_node_data', $node);

        return $node;
    }

    private function _loadFromDatabase()
    {
        $nodeMetadata = get_metadata_by_mid('post', $this->nodeMetaId);

        if (empty($nodeMetadata)) {
            return (object) [];
        }

        $nodePostId = $nodeMetadata->meta_value->post_id;
        $nodeData = get_post_meta($nodePostId, 'tapestry_node_data', true);

        return $this->_formNodeData($nodeData, $nodeMetadata);
    }

    private function _formNode()
    {
        return (object) [
            'id'            => $this->nodeMetaId,
            'type'          => $this->type,
            'title'         => $this->title,
            'status'        => $this->status,
            'imageURL'      => $this->imageURL,
            'mediaType'     => $this->mediaType,
            'mediaFormat'   => $this->mediaFormat,
            'unlocked'      => $this->unlocked,
            'mediaDuration' => $this->mediaDuration,
            'typeData'      => $this->typeData,
            'coordinates'   => $this->coordinates,
            'permissions'   => $this->permissions
        ];
    }

    private function _makeMetadata($node, $nodePostId)
    {
        return (object) array(
            'post_id'       => $nodePostId,
            'title'         => $node->title,
            'permissions'   => $node->permissions,
            'coordinates'   => $node->coordinates
        );
    }

    private function _formNodeData($nodeData, $nodeMetadata)
    {
        // Update node data here to match its own version
        // This enables the same node to have multiple versions
        $nodeData->id = (int) $nodeMetadata->meta_id;
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
}
