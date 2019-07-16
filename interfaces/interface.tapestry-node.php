<?php

/**
 * Tapestry Node Controller Interface
 * 
 */
interface ITapestryNodeController
{
    /**	
     * Save the Tapestry node
     *
     * @return  Object  $node
     */
    public function save();

    /**
     * Set Node
     * 
     * @param   Object  $node  node
     *
     * @return  NULL
     */
    public function set($node);

    /**
     * Get the node
     * 
     * @return  $node    node
     */
    public function get();
}
