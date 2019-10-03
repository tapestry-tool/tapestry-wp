<?php

/**
 * Tapestry H5P Audio Interface
 * 
 */
interface ITapestryH5PAudio
{
    /**	
     * Save the H5P audio
     *
     * @return  Object  $audio
     */
    public function save();

    /**
     * Get the H5P audio
     * 
     * @return  $audio    audio
     */
    public function get();
}
