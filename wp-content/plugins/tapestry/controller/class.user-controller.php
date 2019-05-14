<?php
/**
 * Add/update/retrieve User progress
 * 
 */
class TapestryUserController {

    /** 
     * Update User's video progress for a tapestry post
     * @param type @userId the user's id
     * @param type @postId the post's ID
     * @param type @progressData json data for progress of each node
    */
    public function updateProgress($userId, $postId, $progressData) {
        $this->checkUserAndPostId($userId, $postId);  

        if ($this->isJson($progressData)) {
            $progressData = json_decode($progressData);
        } else {
            throw new Exception('Invalid json');
        }

        $this->updateUserProgress($userId, $postId, $progressData);
    }

    /** 
     * Get User's video progress for a tapestry post
     * @param type @userId the user's id
     * @param type @postId the post's ID
    */
    public function getProgress($userId, $postId) {
        $this->postExists($postId);
        $this->checkUserAndPostId($userId, $postId);  
        return $this->getUserProgress($userId, $postId);
    }

    /** 
     * Update User's h5p video setting for a tapestry post
     * @param type @userId the user's id
     * @param type @postId the post's ID
    */
    public function updateH5PSetting($userId, $postId, $h5pSettingsData) {
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
     * @param type @userId the user's id
     * @param type @postId the post's ID
    */
    public function getH5PSetting($userId, $postId) {
        $this->postExists($postId);
        $this->checkUserAndPostId($userId, $postId);  
        return $this->getUserH5PSetting($userId, $postId);
    }

    private function updateUserProgress($userId, $postId, $progressData) {
        update_user_meta($userId, 'progress_data_' . $postId, $progressData);
    }

    private function getUserProgress($userId, $postId) {
        $progress = get_user_meta($userId, 'progress_data_' . $postId, true);
        return $progress;
    }

    private function updateUserH5PSetting($userId, $postId, $h5pSettingsData) {
        update_user_meta($userId, 'h5p_setting_' . $postId, $h5pSettingsData);
    }

    private function getUserH5PSetting($userId, $postId) {
        $settings = get_user_meta($userId, 'h5p_setting_' . $postId, true);
        return $settings;
    }

    // Helpers
    private function checkUserAndPostId( $userId, $postId) {
        if (!isset($userId)) {
            throw new Exception('userId is invalid');
        }

        // Not the current user. Comment out when testing the endpoints on Postman
        if ($userId != apply_filters('determine_current_user', false)) {
            throw new Exception('userId is invalid');
        }

        if (!isset($postId)) {
            throw new Exception('postId is invalid');
        }

        if (!get_post_type($postId) == "tapestry") {
            throw new Exception('post type is invalid');
        }
    }

    // Checks if post exists in database by id
    private function postExists ($postId) {
        if (!get_permalink($postId)) {
            throw new Exception('post id does not exist');
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