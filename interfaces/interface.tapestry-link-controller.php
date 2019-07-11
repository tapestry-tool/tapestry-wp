<?php
require_once dirname(__FILE__) . "/interface.tapestry-controller.php";

/**
 * Tapestry Link Controller Interface
 * 
 */
interface ITapestryLinkController
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
