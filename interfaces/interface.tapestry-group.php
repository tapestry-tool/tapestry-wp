<?php

/**
 * Tapestry Group Interface
 * 
 */
interface ITapestryGroup
{
    /**
     * Save the Tapestry group
     * 
     * @return  Object  $group
     */
    public function save();

    /**
     * Get the Tapestry group
     * 
     * @return  Object  $group
     */
    public function get();
}
