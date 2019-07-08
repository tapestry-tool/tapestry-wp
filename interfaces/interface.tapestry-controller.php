<?php

/**
 * Tapestry Controller Interface
 * 
 */
interface iTapestryController
{
    /**
     * Save data
     * 
     * @param   $data
     * 
     * @return  $data
     */
    public function save($data);

    /**
     * Retrieve data
     * 
     * @return  $data
     */
    public function get();
}
