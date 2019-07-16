<?php
require_once dirname(__FILE__) . "/interface.tapestry-controller.php";

/**
 * Tapestry Group Controller Interface
 * 
 */
interface ITapestryGroupController
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
