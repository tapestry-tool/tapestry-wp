<?php

/**
 * Tapestry Analytics Interface.
 */
interface ITapestryAnalytics
{

    /**
     * Log an analytics event
     *
     * @param object $data an object containing the required fields to be saved
     *
     * @return bool success?
     */
    public function log($data);
    
    /**
     * Create the schema for saving the analytics (should only be run once when plugin activated)
     */
    public function createSchema();
}