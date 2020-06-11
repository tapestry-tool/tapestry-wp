<?php
require_once dirname(__FILE__) . "/../utilities/class.tapestry-errors.php";
require_once dirname(__FILE__) . "/../utilities/class.tapestry-helpers.php";
require_once dirname(__FILE__) . "/../interfaces/interface.tapestry-node.php";
require_once dirname(__FILE__) . "/../classes/class.tapestry-user-progress.php";
require_once dirname(__FILE__) . "/../classes/class.constants.php";

/**
 * Add/update/retrieve Tapestry post and its child nodes
 * 
 */
class TapestryNode implements ITapestryNode
{
    private $tapestryPostId;
    private $nodePostId;
    private $nodeMetaId;
    private $author;
    private $conditions;
    private $type;
    private $size;
    private $title;
    private $status;
    private $behaviour;
    private $typeData;
    private $imageURL;
    private $lockedImageURL;
    private $mediaType;
    private $mediaFormat;
    private $mediaDuration;
    private $description;
    private $coordinates;
    private $permissions;
    private $hideTitle;
    private $hideProgress;
    private $hideMedia;
    private $skippable;
    private $quiz;
    private $fullscreen;
    private $childOrdering;
    private $fitWindow;

    /**
     * Constructor
     * 
     * @param   Number  $tapestryPostId tapestry post ID
     * @param   Number  $nodeMetaId node meta ID
     * 
     * @return  NULL
     */
    public function __construct($tapestryPostId = 0, $nodeMetaId = 0)
    {
        $this->tapestryPostId = (int) $tapestryPostId;
        $this->nodePostId = 0;
        $this->nodeMetaId = (int) $nodeMetaId;

        $this->author = $this->_getAuthorInfo(wp_get_current_user()->ID);
        $this->conditions = [];
        $this->size = '';
        $this->title = '';
        $this->status = '';
        $this->imageURL = '';
        $this->lockedImageURL = '';
        $this->mediaType = '';
        $this->mediaFormat = '';
        $this->mediaDuration = 0;
        $this->description = '';
        $this->behaviour = 'embed';
        $this->type = 'tapestry_node';
        $this->typeData = (object) [];
        $this->coordinates = (object) [];
        $this->permissions = TapestryNodePermissions::getDefaultNodePermissions($tapestryPostId);
        $this->hideTitle = false;
        $this->hideProgress = false;
        $this->hideMedia = false;
        $this->skippable = true;
        $this->quiz = array();
        $this->fullscreen = false;
        $this->childOrdering = array();
        $this->fitWindow = true;

        if (TapestryHelpers::isValidTapestryNode($this->nodeMetaId)) {
            $node = $this->_loadFromDatabase();
            $this->set($node);
            $this->author = $this->_getAuthorInfo(get_post_field( 'post_author', $this->nodePostId ));
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
        if (isset($node->size) && is_string($node->size)) {
            $this->size = $node->size;
        }
        if (isset($node->title) && is_string($node->title)) {
            $this->title = $node->title;
        }
        if (isset($node->status) && is_string($node->status)) {
            $this->status = $node->status;
        }
        if (isset($node->behaviour) && is_string($node->behaviour)) {
            $this->behaviour = $node->behaviour;
        }
        if (isset($node->typeData) && is_object($node->typeData)) {
            $this->typeData = $node->typeData;
        }
        if (isset($node->imageURL) && is_string($node->imageURL)) {
            $this->imageURL = $node->imageURL;
        }
        if (isset($node->lockedImageURL) && is_string($node->lockedImageURL)) {
            $this->lockedImageURL = $node->lockedImageURL;
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
        if (isset($node->description) && is_string($node->description)) {
            $this->description = $node->description;
        }
        if (isset($node->coordinates) && is_object($node->coordinates)) {
            $this->coordinates = $node->coordinates;
        }
        if (isset($node->permissions) && is_object($node->permissions)) {
            $this->permissions = $node->permissions;
        }
        if (isset($node->hideTitle) && is_bool($node->hideTitle)) {
            $this->hideTitle = $node->hideTitle;
        }
        if (isset($node->hideProgress) && is_bool($node->hideProgress)) {
            $this->hideProgress = $node->hideProgress;
        }
        if (isset($node->hideMedia) && is_bool($node->hideMedia)) {
            $this->hideMedia = $node->hideMedia;
        }
        if (isset($node->skippable) && is_bool($node->skippable)) {
            $this->skippable = $node->skippable;
        }
        if (isset($node->quiz) && is_array($node->quiz)) {
            $this->quiz = $node->quiz;
        }
        if (isset($node->fullscreen) && is_bool($node->fullscreen)) {
            $this->fullscreen = $node->fullscreen;
        }
        if (isset($node->conditions) && is_array($node->conditions)) {
            $this->conditions = $node->conditions;
        }
        if (isset($node->childOrdering) && is_array($node->childOrdering)) {
            $this->childOrdering = $node->childOrdering;
        }
        if (isset($node->fitWindow) && is_bool($node->fitWindow)) {
            $this->fitWindow = $node->fitWindow;
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

    /**
     * Delete a node
     *
     * @return NULL
     */
    public function deleteNode()
    {
        if (!$this->nodeMetaId) {
            throw new TapestryError('INVALID_NODE_META_ID');
        }

        $this->_deleteNodeFromDatabase();
    }

    /**
     * Update node conditions by removing conditions by nodeId
     *
     * @param   String  $nodeId  nodeId
     * 
     * @return NULL
     */
    public function removeConditionsById($nodeId)
    {
        $listModified = false;
        foreach($this->conditions as $conditionId => $condition) {
            if ($condition->nodeId == $nodeId) {
                array_splice($this->conditions, $conditionId, 1);
                $listModified = true;
            }
        }
        if ($listModified) {
            $this->_saveToDatabase();
        }
    }

    public function getLockedState($userId = 0)
    {
        $conditions = $this->conditions;
        $userProgress = new TapestryUserProgress($this->tapestryPostId, $this->nodeMetaId);

        foreach ($conditions as $condition) {
            $condition->fulfilled = false;
        }

        foreach ($conditions as $condition) {
            switch ($condition->type) {
                case ConditionTypes::NODE_COMPLETED:
                    if ($userId && $userProgress->isCompleted($condition->nodeId, $userId)) {
                        $condition->fulfilled = true;
                    }
                    break;
                case ConditionTypes::DATE_NOT_PASSED:
                    if (new DateTime() <= new DateTime($condition->date . ' ' . $condition->time, new DateTimeZone($condition->timezone))) {
                        $condition->fulfilled = true;
                    }
                    break;
                case ConditionTypes::DATE_PASSED:
                    if (new DateTime() >= new DateTime($condition->date . ' ' . $condition->time, new DateTimeZone($condition->timezone))) {
                        $condition->fulfilled = true;
                    }
                    break;
                default:
                    break;
            }
        }

        return $conditions;
    }

    public function isLocked($userId = 0)
    {
        $conditions = $this->getLockedState($userId);

        $numFulfilled = 0;
        foreach ($conditions as $condition) {
            if ($condition->fulfilled) {
                $numFulfilled++;
            }
        }

        return $numFulfilled !== count($conditions);
    }

    public function getMeta()
    {
        $node = $this->get();
        $node->quiz = [];
        $node->typeData = (object) [
            'progress' => [
                0   => [
                    'group' => 'viewed',
                    'value' => 0
                ],
                1   => [
                    'group' => 'unviewed',
                    'value' => 1
                ]
            ]
        ];
        return $node;
    }

    public function getContent()
    {
        return [
            'quiz'      => (array) $this->quiz,
            'typeData'  => $this->typeData
        ];
    }

    private function _saveToDatabase()
    {
        $node = $this->_formNode();

        $nodePostId = 0;

        if ($this->nodeMetaId) {
            $nodeMetadata = get_metadata_by_mid('post', $this->nodeMetaId);
            $nodePostId = $nodeMetadata->meta_value->post_id;
        }

        $nodePostId = TapestryHelpers::updatePost($node, 'tapestry_node', $nodePostId);

        $nodeMetadata = $this->_makeMetadata($node, $nodePostId);

        if ($this->nodeMetaId) {
            update_metadata_by_mid('post', $this->nodeMetaId, $nodeMetadata);
        } else {
            $this->nodeMetaId = add_post_meta($this->tapestryPostId, 'tapestry_node', $nodeMetadata);
            $node->id = $this->nodeMetaId;
        }

        // TODO: add a check permission to see if the user is allowed to edit
        // the "original" node data
        update_post_meta($nodePostId, 'tapestry_node_data', $node);

        $this->_resetAuthor();

        return $node;
    }
    
    private function _resetAuthor()
    {
        wp_update_post(array(
            'ID'            => $this->nodePostId,
            'post_author'   => $this->author['id']
        ));
    }

    private function _loadFromDatabase()
    {
        $nodeMetadata = get_metadata_by_mid('post', $this->nodeMetaId);

        if (empty($nodeMetadata)) {
            return (object) [];
        }

        $nodePostId = $nodeMetadata->meta_value->post_id;
        $this->nodePostId = $nodePostId;

        $nodeData = get_post_meta($nodePostId, 'tapestry_node_data', true);
        return $this->_formNodeData($nodeData, $nodeMetadata);
    }

    private function _deleteNodeFromDatabase()
    {
        $nodeMetadata = get_metadata_by_mid('post', $this->nodeMetaId);
        if (empty($nodeMetadata)) {
            return;
        }
        $nodePostId = $nodeMetadata->meta_value->post_id;
        delete_post_meta($nodePostId, 'tapestry_node_data');
        delete_metadata_by_mid('post', $this->nodeMetaId);
    }

    private function _formNode()
    {
        return (object) [
            'id'            => $this->nodeMetaId,
            'author'        => $this->author,
            'type'          => $this->type,
            'size'          => $this->size,
            'title'         => $this->title,
            'status'        => $this->status,
            'imageURL'      => $this->imageURL,
            'lockedImageURL'=> $this->lockedImageURL,
            'mediaType'     => $this->mediaType,
            'mediaFormat'   => $this->mediaFormat,
            'mediaDuration' => $this->mediaDuration,
            'description'   => $this->description,
            'behaviour'     => $this->behaviour,
            'typeData'      => $this->typeData,
            'coordinates'   => $this->coordinates,
            'permissions'   => $this->permissions,
            'hideTitle'     => $this->hideTitle,
            'hideProgress'  => $this->hideProgress,
            'hideMedia'     => $this->hideMedia,
            'skippable'     => $this->skippable,
            'quiz'          => $this->quiz,
            'fullscreen'    => $this->fullscreen,
            'conditions'    => $this->conditions,
            'childOrdering' => $this->childOrdering,
            'fitWindow'     => $this->fitWindow
        ];
    }

    private function _makeMetadata($node, $nodePostId)
    {
        return (object) array(
            'post_id'       => $nodePostId,
            'title'         => $node->title,
            'permissions'   => $node->permissions,
            'coordinates'   => $node->coordinates,
            'quiz'       => $node->quiz
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
        if (isset($nodeMetadata->meta_value->lockedImageURL)) {
            $nodeData->lockedImageURL = $nodeMetadata->meta_value->lockedImageURL;
        }
        return $nodeData;
    }

    private function _getAuthorInfo($id)
    {
        if (!$id) {
            $id = 1;
        }
        $user = get_user_by('id', $id);
        if ($user) {
            return [
                "id"    => $id,
                "name"  => $user->display_name,
            ];
        }
    }
}
