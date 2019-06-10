<?php
// TODO Change exceptions to using an ERROR class

/**
 * Add/update/retrieve User progress
 * 
 */
class TapestryUserController 
{

    private $_userId = null;

    public function __construct() 
    {
        $this->_userId = apply_filters('determine_current_user', false); 
    }

    /**
     * Update User's video progress for a tapestry post
     *
     * @param Integer $postId        the post's ID
     * @param Integer $nodeId        the current node being viewed
     * @param Float   $progressValue how much the video was viewed, value should be between >= 0 and <= 1
     *
     * @return Null
     */
    public function updateProgress($postId, $nodeId, $progressValue) 
    {
        $this->_checkUserAndPostId($postId);

        if ($progressValue !== null) {
            $progressValue = floatval($progressValue);
        }

        // Value should be between 0 and 1
        if ($progressValue < 0 || $progressValue > 1) {
            throw new Exception('Invalid progress value');
        }

        $this->_updateUserProgress($postId, $nodeId, $progressValue);
    }

    /**
     * Get User's video progress for a tapestry post
     *
     * @param Integer $postId    the post's ID
     * @param Array   $nodeIdArr is a list of ids currently in the tapestry
     *
     * @return String progress   of each node in json format
    */
    public function getProgress($postId, $nodeIdArr) 
    {
        $this->_isValidTapestryPost($postId);
        $this->_checkUserAndPostId($postId);

        return $this->_getUserProgress($postId, $nodeIdArr);
    }

    /**
     * Update User's h5p video setting for a tapestry post
     *
     * @param Integer $postId          the post's ID
     * @param String  $h5pSettingsData stores volume, playbackRate, quality of h5p video
    */
    public function updateH5PSettings($postId, $h5pSettingsData) 
    {
        $this->_checkUserAndPostId($postId);

        if ($this->_isJson($h5pSettingsData)) {
            $h5pSettingsData = json_decode($h5pSettingsData);
        } else {
            throw new Exception('Invalid json');
        }

        $this->_updateUserH5PSettings($postId, $h5pSettingsData);
    }

    /**
     * Get User's h5p video setting for a tapestry post
     * 
     * @param Integer $postId the post's Id
     *
     * @return String h5p     setting
    */
    public function getH5PSettings($postId) 
    {
        $this->_isValidTapestryPost($postId);
        $this->_checkUserAndPostId($postId);
        return $this->_getUserH5PSettings($postId);
    }

    private function _updateUserProgress($postId, $nodeId, $progressValue) 
    {
        update_user_meta($this->_userId, 'tapestry_' . $postId . '_progress_node_' . $nodeId, $progressValue);
    }

    private function _getUserProgress($postId, $nodeIdArr) 
    {
        $progress = new stdClass();

        // Build json object for frontend e.g. {0: 0.1, 1: 0.2} where 0 and 1 are the node IDs
        foreach ($nodeIdArr as $nodeId) {
            $progress_value = get_user_meta($this->_userId, 'tapestry_' . $postId . '_progress_node_' . $nodeId, true);
            if ($progress_value !== null) {
                $progress->$nodeId = (float) $progress_value;
            } else {
                $progress->$nodeId = 0.0;
            }
        }

        return json_encode($progress);
    }

    private function _updateUserH5PSettings($postId, $h5pSettingsData) 
    {
        update_user_meta($this->_userId, 'tapestry_h5p_setting_' . $postId, $h5pSettingsData);
    }

    private function _getUserH5PSettings($postId) 
    {
        $settings = get_user_meta($this->_userId, 'tapestry_h5p_setting_' . $postId, true);
        return json_encode($settings);
    }

    // Helpers

    private function _checkUserAndPostId($postId) 
    {
        if (!isset($this->_userId)) {
            throw new Exception('postId is invalid');
        }

        if (!isset($postId)) {
            throw new Exception('postId is invalid');
        }

    }

    private function _isValidTapestryPost($postId) 
    {
        // post ID exists in db
        if (!get_permalink($postId)) {
            throw new Exception('post id does not exist');
        }

        // Post type is correct
        if (get_post_type($postId) != "tapestry") {
            throw new Exception('post type is invalid');
        }
    }

    private function _isJson($string) 
    {
        $test_json = json_decode($string);
        if ($test_json !== null) {
            return true;
        } else {
            return false;
        }
    }
}