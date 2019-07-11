<?php
require_once dirname(__FILE__) . "/../utilities/class.tapestry-errors.php";
require_once dirname(__FILE__) . "/../utilities/class.tapestry-helpers.php";
require_once dirname(__FILE__) . "/../utilities/class.tapestry-user-roles.php";
require_once dirname(__FILE__) . "/../utilities/class.tapestry-node-permissions.php";
require_once dirname(__FILE__) . "/../interfaces/interface.tapestry-controller.php";

/**
 * Add/update/retrieve a Tapestry
 * 
 */
class TapestryController implements ITapestryController
{
    private $postId;

    /**
     * Constructor
     * 
     * @param   Number  $postId post ID
     * 
     * @return  NULL
     */
    public function __construct($postId = 0)
    {
        $this->postId = (int) $postId;
    }

    /**
     * Add A Tapestry
     * 
     * @param   Object  $tapestry   Tapestry
     * 
     * @return  Object  $tapestry
     */
    public function save($tapestry)
    {
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

        return $this->_addTapestry($tapestry);
    }

    /**
     * Retrieve a Tapestry post
     * 
     * @return  Object  $tapestry
     */
    public function get()
    {
        if (!$this->postId) {
            return TapestryErrors::throwsError('INVALID_POST_ID');
        }

        return $this->_getTapestry();
    }

    /**
     * Add a new node
     * 
     * @param   Object  $node   Tapestry node
     * 
     * @return  Object  $node   Tapestry node
     */
    public function addNode($node)
    {
        $tapestryNodeController = new TapestryNodeController($this->postId);
        $node = $tapestryNodeController->save($node);

        if (is_wp_error($node)) {
            return $node;
        }

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
     * Update a new link
     * 
     * @param  Object   $link   Tapestry link
     * 
     * @return  Object  $link   Tapestry link
     */
    public function addLink($link)
    {
        $tapestryLinkController = new TapestryLinkController($this->postId);
        $link = $tapestryLinkController->save($link);

        return $link;
    }

    /**
     * Update a new group
     * 
     * @param   Object  $group   Tapestry group
     * 
     * @return  Object  $group   Tapestry group
     */
    public function addGroup($group)
    {
        $tapestryGroupController = new TapestryGroupController($this->postId);
        $group = $tapestryGroupController->save($group);

        if (is_wp_error($group)) {
            return $group;
        }

        $tapestry = get_post_meta($this->postId, 'tapestry', true);

        if (!isset($tapestry->groups)) {
            $tapestry->groups = [];
        }

        array_push($tapestry->groups, $group->id);

        update_post_meta($this->postId, 'tapestry', $tapestry);

        return $group;
    }

    /**
     * Get the node controller with associated node meta ID
     * 
     * @param   Number  $nodeMetaId node meta ID
     *
     * @return  Object  $node       node controller
     */
    public function getNode($nodeMetaId)
    {
        return new TapestryNodeController($this->postId, $nodeMetaId);
    }

    /**
     * Get the group controller
     * 
     * @return  Object  $group  group controller
     */
    public function getGroups()
    {
        return new TapestryGroupController($this->postId);
    }

    /**
     * Get the link controller
     * 
     * @return  Object  $link   link controller
     */
    public function getLinks()
    {
        return new TapestryLinkController($this->postId);
    }

    /**
     * Get the setting controller
     * 
     * @return  Object  $setting   setting controller
     */
    public function getSettings()
    {
        return new TapestrySettingController($this->postId);
    }

    private function _addTapestry($tapestry)
    {
        $this->postId = TapestryHelpers::updatePost($tapestry, 'tapestry');

        $tapestry->links = [];
        $tapestry->nodes = [];
        $tapestry->groups = [];

        update_post_meta($this->postId, 'tapestry', $tapestry);

        return $tapestry;
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

    private function _getTapestry()
    {
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
