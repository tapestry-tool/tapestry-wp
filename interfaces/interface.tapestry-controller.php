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
}
