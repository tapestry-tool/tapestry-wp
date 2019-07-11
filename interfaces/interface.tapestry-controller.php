<?php

/**
 * Tapestry Controller Interface
 * 
 */
interface ITapestryController
{
    /**
     * Save data
     * 
     * @param   Object  $data   data to be saved
     * 
     * @return  Object  $data
     */
    public function save($data);

    /**
     * Retrieve data
     * 
     * @return  Object  $data
     */
    public function get();

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
     * Get the group controller
     * 
     * @return  Object  $group  group controller
     */
    public function getGroups();

    /**
     * Get the link controller
     * 
     * @return  Object  $link   link controller
     */
    public function getLinks();

    /**
     * Get the setting controller
     * 
     * @return  Object  $setting   setting controller
     */
    public function getSettings();
}
