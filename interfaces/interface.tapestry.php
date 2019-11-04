<?php

/**
 * Tapestry Interface
 * 
 */
interface ITapestry
{
    /**
     * Save the Tapestry
     * 
     * @return  Object  $tapestry
     */
    public function save();

    /**
     * Save the Tapestry automatically on publish
     * 
     * @return  Object  $tapestry
     */
    public function saveOnPublish();

    /**
     * Set Tapestry
     * 
     * @param   Object  $tapestry  tapestry
     *
     * @return  NULL
     */
    public function set($tapestry);

    /**
     * Retrieve a Tapestry post
     * 
     * @return  Object  $tapestry
     */
    public function get();

    /**
     * Get node IDs
     * 
     * @return  Array  $nodes  node ids
     */
    public function getNodeIds();

    /**
     * Add a new node
     * 
     * @param   Object  $node   Tapestry node
     * 
     * @return  Object  $node   Tapestry node
     */
    public function addNode($node);

    /**
     * Add a new link
     * 
     * @param  Object   $link   Tapestry link
     * 
     * @return  Object  $link   Tapestry link
     */
    public function addLink($link);

    /**
     * Add a new group
     * 
     * @param   Object  $group   Tapestry group
     * 
     * @return  Object  $group   Tapestry group
     */
    public function addGroup($group);

    /**
     * Get the node controller with associated node meta ID
     * 
     * @param   Number  $nodeMetaId node meta ID
     *
     * @return  Object  $node       node controller
     */
    public function getNode($nodeMetaId);

    /**
     * Get the group controller with associated group meta ID
     * 
     * @param   Number  $groupMetaId    group meta ID
     *
     * @return  Object  $group          group controller
     */
    public function getGroup($groupMetaId);

    /**
     * Returns true if the tapestry is empty
     *
     * @return  Boolean true if there is no root node, false otherwise
     */
    public function isEmpty();
}
