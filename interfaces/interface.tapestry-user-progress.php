<?php

/**
 * Tapestry Interface.
 */
interface ITapestryUserProgress
{
    /**
     * Get User's video progress for a tapestry post.
     *
     * @return string progress of each node in json format
     */
    public function get();

    /**
     * Update User's progress and completion for a tapestry post.
     *
     * @param float $progressValue how much the node had progressed, value should be between >= 0 and <= 1
     *
     * @return null
     */
    public function updateUserProgress($progressValue);


    /**
     * Set the question with the given id to be marked as 'completed'.
     *
     * @param int $questionId the question to mark
     * @param string $answerData the user answer
     * @param string $answerType the user answer type
     *
     * @return null
     */
    public function completeQuestion($questionId, $answerData, $answerType);

    /**
     * Update User's h5p video setting for a tapestry post.
     *
     * @param string $h5pSettingsData stores volume,
     *                                playbackRate, quality of h5p video
     *
     * @return null
     */
    public function updateH5PSettings($h5pSettingsData);

    /**
     * Get User's h5p video setting for a tapestry post.
     *
     * @return string h5p $setting
     */
    public function getH5PSettings();

    /**
     * Get User's favourite nodes from a tapestry post.
     *
     * @return array $nodes  node ids which are favourites
     */
    public function getFavourites();

    /**
     * Update User's favourite nodes for a tapestry post.
     *
     * @param array $favourites update the favourite nodes
     *
     * @return null
     */
    public function updateFavourites($favourites);
}
