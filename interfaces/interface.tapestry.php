<?php

/**
 * Tapestry Interface.
 */
interface ITapestry
{
    /**
     * Save the Tapestry.
     *
     * @return object $tapestry
     */
    public function save();

    /**
     * Save the Tapestry automatically on publish.
     *
     * @return object $tapestry
     */
    public function saveOnPublish();

    /**
     * Set Tapestry.
     *
     * @param object $tapestry tapestry
     *
     * @return null
     */
    public function set($tapestry);

    /**
     * Retrieve a Tapestry post.
     *
     * @return object $tapestry
     */
    public function get();

    /**
     * Get node IDs.
     *
     * @return array $nodes  node ids
     */
    public function getNodeIds();

    /**
     * Add a new node.
     *
     * @param object $node Tapestry node
     *
     * @return object $node   Tapestry node
     */
    public function addNode($node);

    /**
     * Add a new link.
     *
     * @param object $link Tapestry link
     *
     * @return object $link   Tapestry link
     */
    public function addLink($link);

    /**
     * Add a new group.
     *
     * @param object $group Tapestry group
     *
     * @return object $group   Tapestry group
     */
    public function addGroup($group);

    /**
     * Get the node controller with associated node meta ID.
     *
     * @param Number $nodeMetaId node meta ID
     *
     * @return object $node       node controller
     */
    public function getNode($nodeMetaId);

    /**
     * Get the group controller with associated group meta ID.
     *
     * @param Number $groupMetaId group meta ID
     *
     * @return object $group          group controller
     */
    public function getGroup($groupMetaId);

    /**
     * Returns true if the tapestry is empty.
     *
     * @return bool true if there is no root node, false otherwise
     */
    public function isEmpty();
}
