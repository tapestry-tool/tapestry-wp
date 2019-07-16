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

    private $groups;
    private $links;
    private $settings;
    private $rootId;
    private $nodes;

    private $updateTapestryPost = true;

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

        if (TapestryHelpers::isValidTapestry($this->postId)) {
            $tapestry = $this->_loadFromDatabase();
            $this->nodes = $tapestry->nodes;
            $this->links = $tapestry->links;
            $this->groups = $tapestry->groups;
            $this->rootId = $tapestry->rootId;
            $this->settings = $tapestry->settings;
        } else {
            $this->nodes = [];
            $this->links = [];
            $this->groups = [];
            $this->rootId = 0;
            $this->settings = (object) [];
        }
    }

    /**
     * Save the Tapestry
     * 
     * @return  Object  $tapestry
     */
    public function save()
    {
        $this->updateTapestryPost = true;
        return $this->_saveToDatabase();
    }

    /**
     * Save the Tapestry automatically on publish
     * 
     * @return  Object  $tapestry
     */
    public function saveOnPublish()
    {
        $this->updateTapestryPost = false;
        return $this->_saveToDatabase();
    }

    /**
     * Set Tapestry
     * 
     * @param   Object  $tapestry  tapestry
     *
     * @return  NULL
     */
    public function set($tapestry)
    {
        if (isset($tapestry->rootId) && is_numeric($tapestry->rootId)) {
            $this->rootId = $tapestry->rootId;
        }
        if (isset($tapestry->nodes) && is_array($tapestry->nodes)) {
            $this->nodes = $tapestry->nodes;
        }
        if (isset($tapestry->groups) && is_array($tapestry->groups)) {
            $this->groups = $tapestry->groups;
        }
        if (isset($tapestry->links) && is_array($tapestry->links)) {
            $this->links = $tapestry->links;
        }
        if (isset($tapestry->settings) && is_object($tapestry->settings)) {
            $this->settings = $tapestry->settings;
        }
    }

    /**
     * Retrieve a Tapestry post
     * 
     * @return  Object  $tapestry
     */
    public function get()
    {
        if (!$this->postId) {
            throw new TapestryError('INVALID_POST_ID');
        }
        return $this->_getTapestry();
    }

    /**
     * Get node IDs
     * 
     * @return  Array  $nodes  node ids
     */
    public function getNodeIds()
    {
        if (!$this->postId) {
            throw new TapestryError('INVALID_POST_ID');
        }
        return $this->nodes;
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
        $tapestryNodeController->set($node);
        $node = $tapestryNodeController->save($node);

        array_push($this->nodes, $node->id);

        if (empty($this->rootId)) {
            $this->rootId = $this->nodes[0];
        }

        $this->_saveToDatabase();
        return $node;
    }

    /**
     * Add a new link
     * 
     * @param  Object   $link   Tapestry link
     * 
     * @return  Object  $link   Tapestry link
     */
    public function addLink($link)
    {
        array_push($this->links, $link);
        $this->_saveToDatabase();
        return $link;
    }

    /**
     * Add a new group
     * 
     * @param   Object  $group   Tapestry group
     * 
     * @return  Object  $group   Tapestry group
     */
    public function addGroup($group)
    {
        $tapestryGroupController = new TapestryGroupController($this->postId);
        $tapestryGroupController->set($group);
        $group = $tapestryGroupController->save();

        array_push($this->groups, $group->id);
        $this->_saveToDatabase();
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
     * Get the group controller with associated group meta ID
     * 
     * @param   Number  $groupMetaId    group meta ID
     *
     * @return  Object  $group          group controller
     */
    public function getGroup($groupMetaId)
    {
        return new TapestryNodeController($this->postId, $groupMetaId);
    }

    private function _loadFromDatabase()
    {
        $tapestry = get_post_meta($this->postId, 'tapestry', true);
        if (empty($tapestry)) {
            return (object) [
                'nodes' => [],
                'links' => [],
                'groups' => [],
                'rootId' => 0,
                'settings' => (object) []
            ];
        }
        return $tapestry;
    }

    private function _formTapestry()
    {
        return (object) [
            'nodes'     => $this->nodes,
            'groups'    => $this->groups,
            'links'     => $this->links,
            'settings'  => $this->settings,
            'rootId'    => $this->rootId
        ];
    }

    private function _saveToDatabase()
    {
        $tapestry = $this->_formTapestry();

        if ($this->updateTapestryPost) {
            $this->postId = TapestryHelpers::updatePost($tapestry, 'tapestry', $this->postId);
        }

        update_post_meta($this->postId, 'tapestry', $tapestry);

        return $tapestry;
    }

    private function _getTapestry()
    {
        $tapestry = $this->_filterTapestry($this->_formTapestry());

        $tapestry->nodes = array_map(
            function ($nodeMetaId) {
                $tapestryNodeController = new TapestryNodeController($this->postId, $nodeMetaId);
                return $tapestryNodeController->get();
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
        if ((!TapestryUserRoles::isEditor())
            && (!TapestryUserRoles::isAdministrator())
            && (!TapestryUserRoles::isAuthorOfThePost($this->postId))
        ) {
            $tapestry->nodes = $this->_filterNodeMetaIdsByPermissions($tapestry->nodes);
            $tapestry->links = $this->_filterLinksByNodeMetaIds($tapestry->links, $tapestry->nodes);
            $tapestry->groups = TapestryHelpers::getGroupIdsOfUser(wp_get_current_user()->ID, $this->postId);
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
