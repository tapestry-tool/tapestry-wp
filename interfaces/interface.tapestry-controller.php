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
