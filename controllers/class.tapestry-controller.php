<?php
require_once dirname(__FILE__) . "/../utilities/class.tapestry-errors.php";
require_once dirname(__FILE__) . "/../utilities/class.tapestry-helpers.php";
require_once dirname(__FILE__) . "/../utilities/class.tapestry-user-roles.php";
require_once dirname(__FILE__) . "/../utilities/class.tapestry-node-permissions.php";

/**
 * Add/update/retrieve a Tapestry
 * 
 */
class TapestryController
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
     * Add A Tapestry
     * 
     * @param   Object  $tapestry   Tapestry
     * 
     * @return  Object  $tapestry
     */
    public function addTapestry($tapestry)
    {
        if ($this->postId) {
            return TapestryErrors::throwsError('POST_ID_ALREADY_SET');
        }
        if (empty($tapestry->settings)) {
            return TapestryErrors::throwsError('SETTINGS_MISSING_IN_NEW_TAPESTRY');
        }
        if (!empty($tapestry->nodes)) {
            return TapestryErrors::throwsError('NODES_EXIST_IN_NEW_TAPESTRY');
        }
        if (!empty($tapestry->groups)) {
            return TapestryErrors::throwsError('GROUPS_EXIST_IN_NEW_TAPESTRY');
        }
        if (!empty($tapestry->links)) {
            return TapestryErrors::throwsError('LINKS_EXIST_IN_NEW_TAPESTRY');
        }

        $this->postId = TapestryHelpers::updatePost($tapestry, 'tapestry');

        $tapestry->links = [];
        $tapestry->nodes = [];
        $tapestry->groups = [];

        update_post_meta($this->postId, 'tapestry', $tapestry);

        return $tapestry;
    }

    /**
     * Retrieve a Tapestry post
     * 
     * @return  Object  $tapestry
     */
    public function getTapestry()
    {
        if (!$this->postId) {
            return TapestryErrors::throwsError('INVALID_POST_ID');
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
     * Retrieve all node ids associated to a tapestry
     * 
     * @return Array list of node ids for a tapestry
     */
    public function getTapestryNodeIds()
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
            $tapestry->groups = TapestryHelpers::getGroupIdsOfUser(wp_get_current_user()->ID, $this->postId);
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

    private function _filterNodeMetaIdsByPermissions($nodeMetaIds)
    {
        $newNodeMetaIds = [];
        $options = TapestryNodePermissions::getNodePermissions();
        $userId = wp_get_current_user()->ID;
        $groupIds = TapestryHelpers::getGroupIdsOfUser($userId, $this->postId);

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
}
