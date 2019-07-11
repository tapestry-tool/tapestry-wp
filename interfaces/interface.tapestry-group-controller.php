<?php
require_once dirname(__FILE__) . "/interface.tapestry-controller.php";

/**
 * Tapestry Group Controller Interface
 * 
 */
interface ITapestryGroupController
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
}
