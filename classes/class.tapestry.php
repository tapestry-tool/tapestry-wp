<?php

require_once dirname(__FILE__).'/../utilities/class.tapestry-errors.php';
require_once dirname(__FILE__).'/../utilities/class.tapestry-helpers.php';
require_once dirname(__FILE__).'/../utilities/class.tapestry-user.php';
require_once dirname(__FILE__).'/../utilities/class.tapestry-node-permissions.php';
require_once dirname(__FILE__).'/../classes/class.tapestry-user-progress.php';
require_once dirname(__FILE__).'/../classes/class.tapestry-h5p.php';
require_once dirname(__FILE__).'/../classes/class.constants.php';
require_once dirname(__FILE__).'/../interfaces/interface.tapestry.php';

/**
 * TODO: Implement group functionality. Currently all the group-related
 * functionality code is commented out.
 */

/**
 * Add/update/retrieve a Tapestry.
 */
class Tapestry implements ITapestry
{
    private $postId;
    private $author;
    // private $groups;
    private $links;
    private $settings;
    private $rootId;
    private $nodes;
    private $notifications;

    private $nodeObjects; // Used only in the set up so we don't have to retrieve the nodes from the db multiple times
    private $visitedNodeIds; // Used in _recursivelySetAccessible function

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
        // $this->groups = [];
        $this->rootId = 0;
        $this->settings = $this->_getDefaultSettings();
        $this->notifications = $this->_getDefaultNotifications();

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
        // if (isset($tapestry->groups) && is_array($tapestry->groups)) {
        //     $this->groups = $tapestry->groups;
        // }
        if (isset($tapestry->links) && is_array($tapestry->links)) {
            $this->links = $tapestry->links;
        }
        if (isset($tapestry->settings) && is_object($tapestry->settings)) {
            $this->settings = $tapestry->settings;
            if (!isset($this->settings->analyticsEnabled)) {
                $this->settings->analyticsEnabled = false;
            }
            if (!isset($this->settings->allowMovingAllNodes)) {
                $this->settings->allowMovingAllNodes = false;
            }
            if (!isset($this->settings->draftNodesEnabled)) {
                $this->settings->draftNodesEnabled = true;
                $this->settings->submitNodesEnabled = true;
            }
            if (!isset($this->settings->permalink)) {
                $this->settings->permalink = get_permalink($this->postId);
            }
            if (!isset($this->settings->tapestrySlug)) {
                $this->settings->tapestrySlug = get_post($this->postId)->post_name;
            }
            if (!isset($this->settings->title)) {
                $this->settings->title = get_the_title($this->postId);
            }
            if (!isset($this->settings->status)) {
                $this->settings->status = get_post_status($this->postId);
            }
            if (!isset($this->settings->showChildrenOfMulticontent)) {
                $this->settings->showChildrenOfMulticontent = false;
            }
        }
        if (isset($tapestry->notifications) && is_object($tapestry->notifications)) {
            $this->notifications = $tapestry->notifications;
        }
    }

    /**
     * Retrieve a Tapestry post.
     *
     * @return object $tapestry
     */
    public function get($filterUserId = -1)
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
     * Get links.
     *
     * @return array $links
     */
    public function getLinks()
    {
        if (!$this->postId) {
            throw new TapestryError('INVALID_POST_ID');
        }

        return $this->links;
    }

    /**
     * Get settings.
     *
     * @return object $settings
     */
    public function getSettings()
    {
        if (!$this->postId) {
            throw new TapestryError('INVALID_POST_ID');
        }

        return $this->settings;
    }

    /**
     * Get notifications.
     *
     * @return object $notifications
     */
    public function getNotifications()
    {
        if (!$this->postId) {
            throw new TapestryError('INVALID_POST_ID');
        }

        return $this->notifications;
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
        $node = $tapestryNode->save();

        if ($this->isEmpty()) {
            $this->rootId = $node->id;
        }

        array_push($this->nodes, $node->id);

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
            $this->rootId = 0;
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
                $this->removeLink((object) [
                    'source' => $link->source,
                    'target' => $link->target,
                    ]);
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
     * Reverse a link from links array.
     *
     * @param int $link an array containing the node IDs that this connects
     *
     * @return array $links     Tapestry links
     */
    public function reverseLink($newLink)
    {
        foreach ($this->links as $linkIndex => $link) {
            if ($link->target == $newLink->target && $link->source == $newLink->source) {
                $this->links[$linkIndex]->source = $newLink->target;
                $this->links[$linkIndex]->target = $newLink->source;
                break;
            }
        }
        $this->_saveToDatabase();

        return $this->links;
    }

    /**
     * Delete a link from links array.
     *
     * @param int $link an array containing the node IDs that this connects
     *
     * @return array $links     Tapestry links
     */
    public function removeLink($linkToDelete)
    {
        foreach ($this->links as $linkIndex => $link) {
            if ($link->source == $linkToDelete->source && $link->target == $linkToDelete->target) {
                array_splice($this->links, $linkIndex, 1);
                break;
            }
        }
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
        //     $tapestryGroup = new TapestryGroup($this->postId);
    //     $tapestryGroup->set($group);
    //     $group = $tapestryGroup->save();

    //     array_push($this->groups, $group->id);
    //     $this->_saveToDatabase();

    //     return $group;
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
        // return new TapestryNode($this->postId, $groupMetaId);
    }

    /**
     * Returns true if the tapestry is empty.
     *
     * @return bool true if there are no nodes, false otherwise
     */
    public function isEmpty()
    {
        return empty($this->nodes);
    }

    public function getNodesDataForRender()
    {
        $nodesData = [];

        foreach ($this->nodeObjects as $i => $nodeObject) {
            $nodeId = $nodeObject->getId();

            $nodesData[$nodeId] = new stdClass();
            $nodesData[$nodeId]->id = $nodeId;
            $nodesData[$nodeId]->accessible = true;
            $nodesData[$nodeId]->permitted = false;
            $nodesData[$nodeId]->unlocked = !$nodeObject->isLocked();
            $nodesData[$nodeId]->conditions = $nodeObject->getLockedState();
        }

        if (count($nodesData)) {
            // First set nodes accessible according to their unlocked status
            // Since we are doing a non-bidirectional traversal, we have to loop through all the
            // nodes (unless they have already been visited)
            // Efficiency: N^2
            $traversedNodeIds = [];
            foreach ($nodesData as $node) {
                if ($node->unlocked && !in_array($node->id, $traversedNodeIds)) {
                    $this->_traverseNodesAndApplyFunction(
                        $nodesData,
                        $node,
                        false,
                        function ($n) {
                            $n->accessible = $n->unlocked;
                        },
                        function ($n) {
                            return $n->unlocked;
                        }
                    );
                    $traversedNodeIds = array_merge($traversedNodeIds, $this->visitedNodeIds);
                }
            }

            // Finally we get the remainder of the node data
            // Here we only return node metadata if not accessible (unless user is an editor)
            // Efficiency: N
            $user = new TapestryUser();
            $nodesData = array_map(
                function ($nodeAccessibleData) use ($user) {
                    $nodeId = $nodeAccessibleData->id;

                    $data = $user->canEdit($this->postId) || $nodeAccessibleData->accessible ? $this->nodeObjects[$nodeId]->get() : $this->nodeObjects[$nodeId]->getMeta();

                    $data->accessible = $nodeAccessibleData->accessible;
                    $data->conditions = $nodeAccessibleData->conditions;
                    $data->unlocked = $nodeAccessibleData->unlocked;

                    return $data;
                },
                $nodesData
            );

            $nodesData = $this->_addH5PMeta($nodesData);
        }

        return $nodesData;
    }

    public function getAllContributors()
    {
        $authors = [];
        foreach ($this->nodes as $node) {
            $node = new TapestryNode($this->postId, $node);
            if ($node->isAvailableToUser()) {
                array_push($authors, $node->get()->author);
            }
        }

        return array_unique($authors, SORT_REGULAR);
    }

    /**
     * Retrieve a Tapestry post for export.
     *
     * @param bool $includeComments whether to include the comments associated with each node
     *
     * @return object $tapestry
     */
    public function export($includeComments)
    {
        $nodes = [];
        foreach ($this->nodes as $node) {
            $temp = (new TapestryNode($this->postId, $node))->get();
            if (NodeStatus::DRAFT == $temp->status) {
                continue;
            }
            if (!$includeComments) {
                unset($temp->comments);
            }
            $nodes[] = $temp;
        }
        // $groups = [];
        // foreach ($this->groups as $group) {
        //     $groups[] = (new TapestryGroup($this->postId, $$group))->get();
        // }
        unset($this->settings->permalink);
        unset($this->settings->tapestrySlug);
        unset($this->settings->title);
        unset($this->settings->status);

        $nodes = $this->_addH5PMeta($nodes);

        return (object) [
            'nodes' => $nodes,
            // 'groups' => $groups,
            'links' => $this->links,
            'settings' => $this->settings,
            'site-url' => get_bloginfo('url'),
        ];
    }

    /**
     * Traverses through the nodes in one direction or bi-directioanlly and applies
     * the given function to each node. Notes:
     * - Nodes needs to be an array of objects, each object representing a node (at least with an id)
     * - Not all nodes may get traversed if it's not a bi-directional traversal
     * - Non-accessible (locked) nodes and their children do not get traversed
     * - $func is the function to run takes a single parameter for node
     * - $condition is the evaluation function needed to move further and it also takes a single
     *    parameter for node (must return a truthy value).
     */
    private function _traverseNodesAndApplyFunction($nodes, $startingNode, $bidirectional, $func, $condition)
    {
        $this->visitedNodeIds = [];

        return $this->_recursivelyTraverseNodes($nodes, $startingNode, $bidirectional, $func, $condition);
    }

    private function _recursivelyTraverseNodes($nodes, $startingNode, $bidirectional, $func, $condition)
    {
        $node = $startingNode;
        if (!isset($node)) {
            return;
        }
        if (!in_array($node->id, $this->visitedNodeIds)) {
            array_push($this->visitedNodeIds, $node->id);
        }

        $func($node, $nodes);

        if ($condition($node)) {
            $neighbourIds = $this->_getNeighbours($node, $bidirectional ? 'both' : 'source');

            $neighbours = [];
            foreach ($neighbourIds as $neighbourNodeId) {
                foreach ($nodes as $otherNode) {
                    if ($otherNode->id === $neighbourNodeId) {
                        array_push($neighbours, $otherNode);
                    }
                }
            }

            foreach ($neighbours as $neighbour) {
                if (!in_array($neighbour->id, $this->visitedNodeIds)) {
                    $this->_recursivelyTraverseNodes($nodes, $neighbour, $bidirectional, $func, $condition);
                }
            }
        }
    }

    private function _getNeighbours($node, $from = 'both')
    {
        $neighbourIds = [];

        foreach ($this->links as $link) {
            if ((in_array($from, ['both', 'source']) && $link->source === $node->id) ||
                (in_array($from, ['both', 'target']) && $link->target === $node->id)) {
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
        $tapestry = new stdClass();
        $tapestry->nodes = [];
        $tapestry->links = [];
        // $tapestry->groups = [];
        $tapestry->rootId = 0;
        $tapestry->settings = $this->_getDefaultSettings();

        return $tapestry;
    }

    private function _getDefaultSettings()
    {
        $post = get_post($this->postId);
        $settings = new stdClass();
        $settings->tapestrySlug = $post->post_name;
        $settings->title = $post->post_title;
        $settings->status = $post->post_status;
        $settings->backgroundUrl = '';
        $settings->autoLayout = false;

        $settings->showAccess = true;
        $settings->showRejected = false;
        $settings->showAcceptedHighlight = true;
        $settings->showChildrenOfMulticontent = false;
        $settings->defaultPermissions = TapestryNodePermissions::getDefaultNodePermissions($this->postId);
        $settings->superuserOverridePermissions = true;
        $settings->analyticsEnabled = false;
        $settings->draftNodesEnabled = true;
        $settings->submitNodesEnabled = true;
        $settings->allowMovingAllNodes = false;
        $settings->permalink = get_permalink($this->postId);

        return $settings;
    }

    private function _getDefaultNotifications()
    {
        return (object) [
            'kaltura' => (object) [
                'total' => 0,
                'success' => 0,
                'error' => 0,
            ],
        ];
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
            // 'groups' => $this->groups,
            'links' => $this->links,
            'settings' => $this->settings,
            'rootId' => $this->rootId,
            'notifications' => $this->notifications,
        ];
    }

    private function _saveToDatabase()
    {
        $tapestry = $this->_formTapestry();

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
        // Get all the nodes from the database (we will need this info and only want to do it once)
        $this->nodeObjects = [];
        foreach ($this->nodes as $nodeId) {
            $this->nodeObjects[$nodeId] = new TapestryNode($this->postId, $nodeId);
        }

        $tapestry = $this->_filterTapestry($this->_formTapestry(), $filterUserId);

        $nodeIds = $tapestry->nodes;

        $this->nodeObjects = array_filter($this->nodeObjects, function ($nodeId) use ($nodeIds) {
            return in_array($nodeId, $nodeIds);
        }, ARRAY_FILTER_USE_KEY);

        $tapestry->nodes = $this->getNodesDataForRender();

        // $tapestry->groups = array_map(
        //     function ($groupMetaId) {
        //         $tapestryGroup = new TapestryGroup($this->postId, $groupMetaId);

        //         return $tapestryGroup->get();
        //     },
        //     $tapestry->groups
        // );

        $userProgress = new TapestryUserProgress($this->postId);
        $tapestry->userProgress = $userProgress->get($tapestry);

        return $tapestry;
    }

    private function _filterTapestry($tapestry, $filterUserId)
    {
        $tapestry->nodes = $this->_filterNodesMetaIdsByAccess($filterUserId);
        $tapestry->links = $this->_filterLinksByNodeMetaIds($tapestry->links, $tapestry->nodes);

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

    private function _addH5PMeta($nodes)
    {
        $controller = new TapestryH5P();
        $allH5Ps = $controller->get();
        foreach ($nodes as $i => $node) {
            if ('h5p' == $node->mediaType && $node->typeData->mediaURL) {
                $H5PURLParts = explode('&id=', $node->typeData->mediaURL);
                if (count($H5PURLParts) >= 2) {
                    $H5PId = $H5PURLParts[1];
                    $H5PIndex = array_search($H5PId, array_column($allH5Ps, 'id'));
                    if ($H5PIndex || 0 == $H5PIndex) {
                        $nodes[$i]->typeData->h5pMeta = $allH5Ps[$H5PIndex];
                    }
                }
            }
        }

        return $nodes;
    }

    private function _filterNodesMetaIdsByAccess($filterUserId)
    {
        $currentUser = new TapestryUser();
        $currentUserId = $currentUser->getID();

        // First filter by node status

        if (!isset($this->settings->showRejected)) {
            $this->settings->showRejected = false;
        }

        $nodes = [];
        foreach ($this->nodeObjects as $node) {
            $nodeId = $node->getId();
            $nodeMeta = $node->getMeta();
            // draft nodes should only be visible to node authors
            // the exception is that the node is submitted in which case it should also be viewable to reviewers
            if (NodeStatus::DRAFT == $nodeMeta->status) {
                if ($nodeMeta->author->id == $currentUserId) {
                    array_push($nodes, $nodeId);
                } elseif ((NodeStatus::SUBMIT == $nodeMeta->reviewStatus || (NodeStatus::REJECT == $nodeMeta->reviewStatus && $this->settings->showRejected)) && $currentUser->canEdit($this->postId)) {
                    array_push($nodes, $nodeId);
                }
            } else {
                array_push($nodes, $nodeId);
            }
        }

        // Then filter by access (i.e. node-level permissions)

        if (!isset($this->settings->superuserOverridePermissions)) {
            $this->settings->superuserOverridePermissions = true;
        }

        $superuserOverridePermissions = $this->settings->superuserOverridePermissions;

        if (!$currentUser->canEdit($this->postId) || !$superuserOverridePermissions) {
            $nodesPermitted = [];
            foreach ($nodes as $nodeId) {
                $nodesPermitted[$nodeId] = new stdClass();
                $nodesPermitted[$nodeId]->id = $nodeId;
                $nodesPermitted[$nodeId]->permitted = false;
            }

            $traversedNodeIds = [];
            foreach ($nodesPermitted as $node) {
                if (!in_array($node->id, $traversedNodeIds)) {
                    $this->_traverseNodesAndApplyFunction(
                        $nodesPermitted,
                        $nodesPermitted[$node->id],
                        false,
                        function ($n) use ($superuserOverridePermissions, $currentUserId, $filterUserId) {
                            $n->permitted = $this->_userIsAllowed($n->id, $superuserOverridePermissions, $currentUserId) ||
                            (-1 !== $filterUserId && $this->_userIsAllowed($n->id, $superuserOverridePermissions, $filterUserId));
                        },
                        function ($n) {
                            return true;
                        }
                    );
                    $traversedNodeIds = array_merge($traversedNodeIds, $this->visitedNodeIds);
                }
            }

            $nodes = array_filter($nodes, function ($nodeId) use ($nodesPermitted) {
                return $nodesPermitted[$nodeId]->permitted;
            });
        }

        return $nodes;
    }

    private function _userIsAllowed($node, $superuser_override, $userId)
    {
        return TapestryHelpers::userIsAllowed(UserActions::READ, $node, $this->postId, $superuser_override, $userId)
        || TapestryHelpers::userIsAllowed(UserActions::ADD, $node, $this->postId, $superuser_override, $userId)
        || TapestryHelpers::userIsAllowed(UserActions::EDIT, $node, $this->postId, $superuser_override, $userId);
    }
}
