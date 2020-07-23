<?php

require_once dirname(__FILE__).'/../utilities/class.tapestry-errors.php';
require_once dirname(__FILE__).'/../utilities/class.tapestry-helpers.php';
require_once dirname(__FILE__).'/../utilities/class.tapestry-user-roles.php';
require_once dirname(__FILE__).'/../utilities/class.tapestry-node-permissions.php';
require_once dirname(__FILE__).'/../interfaces/interface.tapestry.php';

/**
 * Add/update/retrieve a Tapestry.
 */
class Tapestry implements ITapestry
{
    private $postId;
    private $author;
    private $groups;
    private $links;
    private $settings;
    private $rootId;
    private $nodes;

    private $updateTapestryPost = true;

    /**
     * Constructor.
     *
     * @param Number $postId post ID
     *
     * @return null
     */
    public function __construct($postId = 0)
    {
        $this->postId = (int) $postId;
        $this->author = (int) $this->_getAuthor();

        $this->nodes = [];
        $this->links = [];
        $this->groups = [];
        $this->rootId = 0;
        $this->settings = (object) [];

        if (TapestryHelpers::isValidTapestry($this->postId)) {
            $tapestry = $this->_loadFromDatabase();
            $this->set($tapestry);
        }
    }

    /**
     * Save the Tapestry.
     *
     * @return object $tapestry
     */
    public function save()
    {
        $this->updateTapestryPost = true;

        return $this->_saveToDatabase();
    }

    /**
     * Save the Tapestry automatically on publish.
     *
     * @return object $tapestry
     */
    public function saveOnPublish()
    {
        $this->updateTapestryPost = false;

        return $this->_saveToDatabase();
    }

    /**
     * Set Tapestry.
     *
     * @param object $tapestry tapestry
     *
     * @return null
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
     * Retrieve a Tapestry post.
     *
     * @return object $tapestry
     */
    public function get($filterUserId)
    {
        if (!$this->postId) {
            throw new TapestryError('INVALID_POST_ID');
        }

        return $this->_getTapestry($filterUserId);
    }

    /**
     * Get node IDs.
     *
     * @return array $nodes  node ids
     */
    public function getNodeIds()
    {
        if (!$this->postId) {
            throw new TapestryError('INVALID_POST_ID');
        }

        return $this->nodes;
    }

    /**
     * Add a new node.
     *
     * @param object $node Tapestry node
     *
     * @return object $node   Tapestry node
     */
    public function addNode($node)
    {
        $tapestryNode = new TapestryNode($this->postId);
        $tapestryNode->set($node);
        $node = $tapestryNode->save($node);

        array_push($this->nodes, $node->id);

        if (empty($this->rootId)) {
            $this->rootId = $this->nodes[0];
        }

        $this->_saveToDatabase();

        return $node;
    }

    /**
     * Delete a node.
     *
     * @param object $nodeId Tapestry node id
     *
     * @return object $Array   Tapestry nodes
     */
    public function deleteNodeFromTapestry($nodeId)
    {
        // Remove the rootId field
        if ($nodeId == $this->rootId) {
            if (count($this->nodes) > 1) {
                throw new TapestryError('CANNOT_DELETE_ROOT');
            } else {
                $this->rootId = 0;
            }
        }

        // Delete the element from nodes array
        foreach ($this->nodes as $elementId => $element) {
            if ($element == $nodeId) {
                array_splice($this->nodes, $elementId, 1);
                // Delete node from database
                $tapestryNode = new TapestryNode($this->postId, $nodeId);
                $tapestryNode->deleteNode();
            }
        }

        // Delete associated links with this node
        foreach ($this->links as $index => $link) {
            if ($link->source == $nodeId || $link->target == $nodeId) {
                $this->removeLink($index);
            }
        }

        // Delete condition from nodes that rely on this node
        foreach ($this->nodes as $index => $id) {
            if ($id != $nodeId) {
                // Delete condition from node and update database
                $elementNode = new TapestryNode($this->postId, $id);
                $elementNode->removeConditionsById($nodeId);
            }
        }

        $tapestry = $this->_formTapestry();
        update_post_meta($this->postId, 'tapestry', $tapestry);

        return $this->nodes;
    }

    /**
     * Add a new link.
     *
     * @param object $link Tapestry link
     *
     * @return object $link   Tapestry link
     */
    public function addLink($link)
    {
        array_push($this->links, $link);
        $this->_saveToDatabase();

        return $link;
    }

    /**
     * Delete a link from links array.
     *
     * @param int $linkIndex Link Index
     *
     * @return array $links     Tapestry links
     */
    public function removeLink($linkIndex)
    {
        array_splice($this->links, $linkIndex, 1);
        $this->_saveToDatabase();

        return $this->links;
    }

    /**
     * Add a new group.
     *
     * @param object $group Tapestry group
     *
     * @return object $group   Tapestry group
     */
    public function addGroup($group)
    {
        $tapestryGroup = new TapestryGroup($this->postId);
        $tapestryGroup->set($group);
        $group = $tapestryGroup->save();

        array_push($this->groups, $group->id);
        $this->_saveToDatabase();

        return $group;
    }

    /**
     * Get the node controller with associated node meta ID.
     *
     * @param Number $nodeMetaId node meta ID
     *
     * @return object $node       node controller
     */
    public function getNode($nodeMetaId)
    {
        return new TapestryNode($this->postId, $nodeMetaId);
    }

    /**
     * Get the group controller with associated group meta ID.
     *
     * @param Number $groupMetaId group meta ID
     *
     * @return object $group          group controller
     */
    public function getGroup($groupMetaId)
    {
        return new TapestryNode($this->postId, $groupMetaId);
    }

    /**
     * Returns true if the tapestry is empty.
     *
     * @return bool true if there is no root node, false otherwise
     */
    public function isEmpty()
    {
        return empty($this->rootId);
    }

    public function setUnlocked($nodeIds, $userId = 0)
    {
        $nodes = $this->_setAccessibleStatus($nodeIds, $userId);

        return array_map(
            function ($nodeData) {
                $node = new TapestryNode($this->postId, $nodeData->id);
                $roles = new TapestryUserRoles();
                $data = $roles->canEdit($this->postId) || $nodeData->accessible ? $node->get() : $node->getMeta();
                $data->accessible = $nodeData->accessible;
                $data->conditions = $nodeData->conditions;
                $data->unlocked = $nodeData->unlocked;

                return $data;
            },
            $nodes
        );
    }

    public function getAllContributors()
    {
        return array_unique(array_map(
            function ($node) {
                $node = new TapestryNode($this->postId, $node);

                return $node->get()->author;
            },
            $this->nodes
        ), SORT_REGULAR);
    }

    private function _setAccessibleStatus($nodes, $userId)
    {
        $newNodes = array_map(
            function ($nodeId) use ($userId) {
                $node = new TapestryNode($this->postId, $nodeId);
                $data = new stdClass();
                $data->id = $nodeId;
                $data->accessible = false;
                $data->unlocked = !$node->isLocked($userId);
                $data->conditions = $node->getLockedState($userId);

                return $data;
            },
            $nodes
        );
        if (count($newNodes)) {
            $this->_recursivelySetAccessible($newNodes[0], [], $newNodes);
        }

        return $newNodes;
    }

    private function _recursivelySetAccessible($node, $visited, $nodeList)
    {
        if (!in_array($node, $visited)) {
            array_push($visited, $node);
        }
        $node->accessible = $node->unlocked;
        if ($node->accessible) {
            $neighbourIds = $this->_getNeighbours($node);

            $neighbours = array_map(
                function ($nodeId) use ($nodeList) {
                    foreach ($nodeList as $otherNode) {
                        if ($otherNode->id === $nodeId) {
                            return $otherNode;
                        }
                    }
                },
                $neighbourIds
            );

            foreach ($neighbours as $neighbour) {
                if (!in_array($neighbour, $visited)) {
                    array_push($visited, $neighbour);
                    $this->_recursivelySetAccessible($neighbour, $visited, $nodeList);
                }
            }
        }
    }

    private function _getNeighbours($node)
    {
        $neighbourIds = [];

        foreach ($this->links as $link) {
            if ($link->source === $node->id || $link->target === $node->id) {
                array_push(
                    $neighbourIds,
                    $link->source === $node->id ? $link->target : $link->source
                );
            }
        }

        return $neighbourIds;
    }

    private function _loadFromDatabase()
    {
        $tapestry = get_post_meta($this->postId, 'tapestry', true);
        if (empty($tapestry)) {
            return $this->_getDefaultTapestry();
        }

        return $tapestry;
    }

    private function _getDefaultTapestry()
    {
        $post = get_post($this->postId);
        $tapestry = new stdClass();

        $tapestry->nodes = [];
        $tapestry->links = [];
        $tapestry->groups = [];
        $tapestry->rootId = 0;
        $tapestry->settings = new stdClass();

        $tapestry->settings->tapestrySlug = $post->post_name;
        $tapestry->settings->title = $post->post_title;
        $tapestry->settings->status = $post->post_status;
        $tapestry->settings->backgroundUrl = '';
        $tapestry->settings->autoLayout = false;
        $tapestry->settings->nodeDraggable = true;
        $tapestry->settings->showAccess = true;
        $tapestry->settings->defaultPermissions = TapestryNodePermissions::getDefaultNodePermissions($this->postId);
        $tapestry->settings->superuserOverridePermissions = true;
        $tapestry->settings->permalink = get_permalink($this->postId);

        return $tapestry;
    }

    private function _getAuthor()
    {
        if ($this->postId) {
            return get_post_field('post_author', $this->postId);
        } else {
            return wp_get_current_user()->ID;
        }
    }

    private function _formTapestry()
    {
        return (object) [
            'nodes' => $this->nodes,
            'groups' => $this->groups,
            'links' => $this->links,
            'settings' => $this->settings,
            'rootId' => $this->rootId,
        ];
    }

    private function _saveToDatabase()
    {
        $tapestry = $this->_formTapestry();

        if ($this->updateTapestryPost) {
            $this->postId = TapestryHelpers::updatePost($tapestry, 'tapestry', $this->postId);
            $this->_resetAuthor();
        }

        update_post_meta($this->postId, 'tapestry', $tapestry);

        return $tapestry;
    }

    private function _resetAuthor()
    {
        wp_update_post([
            'ID' => $this->postId,
            'post_author' => $this->author,
        ]);
    }

    private function _getTapestry($filterUserId)
    {
        $tapestry = $this->_filterTapestry($this->_formTapestry(), $filterUserId);

        $tapestry->nodes = $this->setUnlocked($tapestry->nodes);

        $tapestry->groups = array_map(
            function ($groupMetaId) {
                $tapestryGroup = new TapestryGroup($this->postId, $groupMetaId);

                return $tapestryGroup->get();
            },
            $tapestry->groups
        );

        return $tapestry;
    }

    private function _filterTapestry($tapestry, $filterUserId)
    {
        $roles = new TapestryUserRoles();

        if (!isset($tapestry->settings->superuserOverridePermissions)) {
            $tapestry->settings->superuserOverridePermissions = true;
        }

        if ($tapestry->settings->superuserOverridePermissions && $roles->canEdit($this->postId)) {
            return $tapestry;
        } else {
            $tapestry->nodes = $this->_filterNodeMetaIdsByPermissions($tapestry->nodes, $tapestry->rootId,
                $tapestry->settings->superuserOverridePermissions, $filterUserId);
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

    private function _filterNodeMetaIdsByPermissions($nodeMetaIds, $rootId, $superuser_override, $secondaryUserId)
    {
        $currentUserId = wp_get_current_user()->ID;

        $nodesPermitted = [];
        foreach ($nodeMetaIds as $nodeMetaId) {
            if ($this->_pathIsAllowed($nodeMetaId, $rootId, [], $superuser_override, $currentUserId)
                || $this->_pathIsAllowed($nodeMetaId, $rootId, [], $superuser_override, $secondaryUserId)) {
                array_push($nodesPermitted, $nodeMetaId);
            }
        }

        return $nodesPermitted;
    }

    private function _pathIsAllowed($from, $to, $checked = [], $superuser_override, $userId)
    {
        if (in_array($from, $checked)) {
            return false;
        }

        if (TapestryHelpers::userIsAllowed('READ', $from, $this->postId, $superuser_override, $userId)
            || (TapestryHelpers::userIsAllowed('ADD', $from, $this->postId, $superuser_override, $userId)
            || TapestryHelpers::userIsAllowed('EDIT', $from, $this->postId, $superuser_override, $userId))) {
            if ($from == $to) {
                return true;
            }

            $checked[] = $from;

            foreach ($this->links as $link) {
                if (($link->target == $from && $this->_pathIsAllowed($link->source, $to, $checked, $superuser_override, $userId)) ||
                        ($link->source == $from && $this->_pathIsAllowed($link->target, $to, $checked, $superuser_override, $userId))) {
                    return true;
                }
            }
        }

        return false;
    }
}
