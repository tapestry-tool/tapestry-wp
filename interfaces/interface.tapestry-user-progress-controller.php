<?php
require_once dirname(__FILE__) . "/interface.tapestry-controller.php";

/**
 * Tapestry Controller Interface
 * 
 */
interface ITapestryUserProgressController extends ITapestryController
{
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
