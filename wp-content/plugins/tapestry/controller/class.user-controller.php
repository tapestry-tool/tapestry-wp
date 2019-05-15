<?php
/**
 * Add/update/retrieve User progress
 * 
 */
class TapestryUserController {

    /** 
     * Update User's video progress for a tapestry post
     * @param type @postId the post's ID
     * @param type @nodeId the current node being viewed
     * @param type @progressValue is how much the video was viewed, value should be between >= 0 and <= 1
    */
    public function updateProgress($postId, $nodeId, $progressValue) {
        $userId = apply_filters('determine_current_user', false);
        $this->checkUserAndPostId($userId, $postId);

        if ($progressValue !== NULL) {
            $progressValue = json_decode($progressValue);
        }

        // Value should be between 0 and 1
        if ($progressValue < 0 || $progressValue > 1) {
            throw new Exception('Invalid progress value');
        }

        $this->updateUserProgress($userId, $postId, $nodeId, $progressValue);
    }

    /** 
     * Get User's video progress for a tapestry post
     * @param type @postId the post's ID
     * @param type @nodeIdArr is a list of ids currently in the tapestry
    */
    public function getProgress($postId, $nodeIdArr) {
        $userId = apply_filters('determine_current_user', false);
        $this->isPostValid($postId);
        $this->checkUserAndPostId($userId, $postId);

        if ($this->isJson($nodeIdArr)) {
            $nodeIdArr = json_decode($nodeIdArr);
        } else {
            throw new Exception('Invalid json');
        }

        return $this->getUserProgress($userId, $postId, $nodeIdArr);
    }

    /** 
     * Update User's h5p video setting for a tapestry post
     * @param type @postId the post's ID
     * @param type @h5pSettingsData stores volume, playbackRate, quality of h5p video
    */
    public function updateH5PSetting($postId, $h5pSettingsData) {
        $userId = apply_filters('determine_current_user', false);
        $this->checkUserAndPostId($userId, $postId);  

        if ($this->isJson($h5pSettingsData)) {
            $h5pSettingsData = json_decode($h5pSettingsData);
        } else {
            throw new Exception('Invalid json');
        }

        $this->updateUserH5PSetting($userId, $postId, $h5pSettingsData);
    }

    /** 
     * Get User's h5p video setting for a tapestry post
     * @param type @postId the post's Id
    */
    public function getH5PSetting($postId) {
        $userId = apply_filters('determine_current_user', false);
        $this->isPostValid($postId);
        $this->checkUserAndPostId($userId, $postId);  
        return $this->getUserH5PSetting($userId, $postId);
    }

    private function updateUserProgress($userId, $postId, $nodeId, $progressValue) {
        update_user_meta($userId, 'tapestry_' . $postId . '_progress_node_' . $nodeId, $progressValue);
    }

    private function getUserProgress($userId, $postId, $nodeIdArr) {
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

    private function updateUserH5PSetting($userId, $postId, $h5pSettingsData) {
        update_user_meta($userId, 'tapestry_h5p_setting_' . $postId, $h5pSettingsData);
    }

    private function getUserH5PSetting($userId, $postId) {
        $settings = get_user_meta($userId, 'tapestry_h5p_setting_' . $postId, true);
        return json_encode($settings);
    }

    // Helpers
    private function checkUserAndPostId( $userId, $postId) {
        // User not logged in or userId is not set. Comment out when testing on Postman
        if (!isset($userId)) {
            throw new Exception('userId is invalid');
        }

        if (!isset($postId)) {
            throw new Exception('postId is invalid');
        }

    }

    private function isPostValid ($postId) {
        // post ID exists in db
        if (!get_permalink($postId)) {
            throw new Exception('post id does not exist');
        }

        // Post type is correct
        if (get_post_type($postId) != "tapestry") {
            throw new Exception('post type is invalid');
        }
    }

    private function isJson($string) {
        $test_json = json_decode($string);
        if ($test_json !== NULL) {
            return true;
        } else {
            return false;
        }
    }
}