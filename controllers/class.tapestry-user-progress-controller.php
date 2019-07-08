<?php
// TODO Change exceptions to using an ERROR class
require_once dirname(__FILE__) . "/../interfaces/interface.tapestry-user-progress-controller.php";

/**
 * Add/update/retrieve User progress
 * 
 */
class TapestryUserProgressController implements iTapestryUserProgressController
{

    private $_userId = null;
    private $postId;
    private $nodeMetaId;

    public function __construct($postId = null, $nodeMetaId = null)
    {
        $this->_userId = apply_filters('determine_current_user', false);
        $this->postId = $postId;
        $this->nodeMetaId = $nodeMetaId;
    }

    /**
     * Update User's video progress for a tapestry post
     *
     * @param Float   $progressValue how much the video was viewed, value should be between >= 0 and <= 1
     *
     * @return Null
     */
    public function save($progressValue)
    {
        $this->_checkUserAndPostId();

        if ($progressValue !== null) {
            $progressValue = floatval($progressValue);
        }

        // Value should be between 0 and 1
        if ($progressValue < 0 || $progressValue > 1) {
            throw new Exception('Invalid progress value');
        }

        $this->_updateUserProgress($progressValue);
    }

    /**
     * Get User's video progress for a tapestry post
     *
     * @return String progress   of each node in json format
     */
    public function get()
    {
        $this->_isValidTapestryPost();
        $this->_checkUserAndPostId();

        $tapestryNodeController = new TapestryNodeController($this->postId);
        $nodeIdArr = $tapestryNodeController->get();

        return $this->_getUserProgress($nodeIdArr);
    }

    /**
     * Update User's h5p video setting for a tapestry post
     *
     * @param String  $h5pSettingsData stores volume,
     * playbackRate, quality of h5p video
     */
    public function updateH5PSettings($h5pSettingsData)
    {
        $this->_checkUserAndPostId();

        if ($this->_isJson($h5pSettingsData)) {
            $h5pSettingsData = json_decode($h5pSettingsData);
        } else {
            throw new Exception('Invalid json');
        }

        $this->_updateUserH5PSettings($h5pSettingsData);
    }

    /**
     * Get User's h5p video setting for a tapestry post
     * 
     * @return String h5p   $setting
     */
    public function getH5PSettings()
    {
        $this->_isValidTapestryPost();
        $this->_checkUserAndPostId();
        return $this->_getUserH5PSettings();
    }

    private function _updateUserProgress($progressValue)
    {
        update_user_meta($this->_userId, 'tapestry_' . $this->postId . '_progress_node_' . $this->nodeId, $progressValue);
    }

    private function _getUserProgress($nodeIdArr)
    {
        $progress = new stdClass();

        // Build json object for frontend e.g. {0: 0.1, 1: 0.2} where 0 and 1 are the node IDs
        foreach ($nodeIdArr as $nodeId) {
            $progress_value = get_user_meta($this->_userId, 'tapestry_' . $this->postId . '_progress_node_' . $nodeId, true);
            if ($progress_value !== null) {
                $progress->$nodeId = (float) $progress_value;
            } else {
                $progress->$nodeId = 0.0;
            }
        }

        return json_encode($progress);
    }

    private function _updateUserH5PSettings($h5pSettingsData)
    {
        update_user_meta($this->_userId, 'tapestry_h5p_setting_' . $this->postId, $h5pSettingsData);
    }

    private function _getUserH5PSettings()
    {
        $settings = get_user_meta($this->_userId, 'tapestry_h5p_setting_' . $this->postId, true);
        return json_encode($settings);
    }

    /* Helpers */

    private function _checkUserAndPostId()
    {
        if (!isset($this->_userId)) {
            throw new Exception('postId is invalid');
        }

        if (!isset($this->postId)) {
            throw new Exception('postId is invalid');
        }
    }

    private function _isValidTapestryPost()
    {
        // post ID exists in db
        if (!get_permalink($this->postId)) {
            throw new Exception('post id does not exist');
        }

        // Post type is correct
        if (get_post_type($this->postId) != "tapestry") {
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
