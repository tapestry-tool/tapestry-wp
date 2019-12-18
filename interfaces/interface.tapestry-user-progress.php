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
     * Set the question with the given id to be marked as 'completed'
     * 
     * @param Integer $questionId the question to mark
     * 
     * @return Null
     */
    public function completeQuestion($questionId);

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

    /**
     * Get all gravity form entries submitted by this user.
     * If $formId is passed, returns entries for only that form.
     * 
     * @param Integer $formId
     * @return String user entries in json format
     */
    public function getUserEntries($formId);
}
