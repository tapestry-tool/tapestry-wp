<?php

/**
 * Tapestry Interface
 * 
 */
interface ITapestryUserProgress
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

    /**
     * Update User's h5p video setting for a tapestry post
     *
     * @param   String  $h5pSettingsData stores volume,
     * playbackRate, quality of h5p video
     * 
     * @return  NULL
     */
    public function updateH5PSettings($h5pSettingsData);

    /**
     * Get User's h5p video setting for a tapestry post
     * 
     * @return String h5p   $setting
     */
    public function getH5PSettings();
}
