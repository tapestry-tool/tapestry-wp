<?php
// TODO Change exceptions to using an ERROR class
/**
 * Add/update/retrieve User progress
 * 
 */
class TapestryUserController {

    private $userId = NULL;

    public function __construct() {
        $this->userId = apply_filters('determine_current_user', false); 
    }

    /** 
     * Update User's video progress for a tapestry post
     * @param type @postId the post's ID
     * @param type @nodeId the current node being viewed
     * @param type @progressValue is how much the video was viewed, value should be between >= 0 and <= 1
    */
    public function updateProgress($postId, $nodeId, $progressValue) {
        $this->_checkUserAndPostId($this->userId, $postId);

        if ($progressValue !== NULL) {
            $progressValue = json_decode($progressValue);
        }

        // Value should be between 0 and 1
        if ($progressValue < 0 || $progressValue > 1) {
            throw new Exception('Invalid progress value');
        }

        $this->_updateUserProgress($this->userId, $postId, $nodeId, $progressValue);
    }

    /** 
     * Get User's video progress for a tapestry post
     * @param type @postId the post's ID
     * @param type @nodeIdArr is a list of ids currently in the tapestry
    */
    public function getProgress($postId, $nodeIdArr) {
        $this->_isValidTapestryPost($postId);
        $this->_checkUserAndPostId($this->userId, $postId);

        if ($this->_isJson($nodeIdArr)) {
            $nodeIdArr = json_decode($nodeIdArr);
        } else {
            throw new Exception('Invalid json');
        }

        return $this->_getUserProgress($this->userId, $postId, $nodeIdArr);
    }

    /** 
     * Update User's h5p video setting for a tapestry post
     * @param type @postId the post's ID
     * @param type @h5pSettingsData stores volume, playbackRate, quality of h5p video
    */
    public function updateH5PSetting($postId, $h5pSettingsData) {
        $this->_checkUserAndPostId($this->userId, $postId);  

        if ($this->_isJson($h5pSettingsData)) {
            $h5pSettingsData = json_decode($h5pSettingsData);
        } else {
            throw new Exception('Invalid json');
        }

        $this->_updateUserH5PSetting($this->userId, $postId, $h5pSettingsData);
    }

    /** 
     * Get User's h5p video setting for a tapestry post
     * @param type @postId the post's Id
    */
    public function getH5PSetting($postId) {
        $this->_isValidTapestryPost($postId);
        $this->_checkUserAndPostId($this->userId, $postId);
        return $this->_getUserH5PSetting($this->userId, $postId);
    }

    private function _updateUserProgress($userId, $postId, $nodeId, $progressValue) {
        update_user_meta($userId, 'tapestry_' . $postId . '_progress_node_' . $nodeId, $progressValue);
    }

    private function _getUserProgress($userId, $postId, $nodeIdArr) {
        $progress = new stdClass();

        // Build json object for frontend e.g. {0: 0.1, 1: 0.2} where 0 and 1 are the node IDs
        foreach ($nodeIdArr as $nodeId) {
            $progress_value = get_user_meta($userId, 'tapestry_' . $postId . '_progress_node_' . $nodeId, true);
            if ($progress_value !== NULL) {
                $progress->$nodeId = $progress_value;
            } else {
                $progress->$nodeId = 0.0;
            }
        }

        return json_encode($progress);
    }

    private function _updateUserH5PSetting($userId, $postId, $h5pSettingsData) {
        update_user_meta($userId, 'tapestry_h5p_setting_' . $postId, $h5pSettingsData);
    }

    private function _getUserH5PSetting($userId, $postId) {
        $settings = get_user_meta($userId, 'tapestry_h5p_setting_' . $postId, true);
        return json_encode($settings);
    }

    // Helpers
    private function _checkUserAndPostId( $userId, $postId) {
        // User not logged in or userId is not set. Comment out when testing on Postman
        if (!isset($userId) || empty($userId)) {
            throw new Exception('userId is invalid');
        }

        if (!isset($postId)) {
            throw new Exception('postId is invalid');
        }

    }

    private function _isValidTapestryPost ($postId) {
        // post ID exists in db
        if (!get_permalink($postId)) {
            throw new Exception('post id does not exist');
        }

        // Post type is correct
        if (get_post_type($postId) != "tapestry") {
            throw new Exception('post type is invalid');
        }
    }

    private function _isJson($string) {
        $test_json = json_decode($string);
        if ($test_json !== NULL) {
            return true;
        } else {
            return false;
        }
    }
}