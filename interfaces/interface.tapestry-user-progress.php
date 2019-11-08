<?php

/**
 * Tapestry Interface
 * 
 */
interface ITapestryUserProgress
{

    /**
     * Get User's video progress for a tapestry post
     *
     * @return String progress of each node in json format
     */
    public function get();

    /**
     * Update User's video progress for a tapestry post
     *
     * @param Float $progressValue how much the video was viewed, value should be between >= 0 and <= 1
     *
     * @return Null
     */
    public function updateUserProgress($progressValue);
    
    /**
     * Set 'unlocked' status of a Tapestry Node for this User to true
     *
     * @return Null
     */
    public function unlockNode();

    /**
     * Set 'skippable' status of a Tapestry Node for this User to true
     * 
     * @return Null
     */
    public function complete();

    /**
     * Update User's h5p video setting for a tapestry post
     *
     * @param String $h5pSettingsData stores volume,
     * playbackRate, quality of h5p video
     * 
     * @return Null
     */
    public function updateH5PSettings($h5pSettingsData);

    /**
     * Get User's h5p video setting for a tapestry post
     * 
     * @return String h5p $setting
     */
    public function getH5PSettings();
}
