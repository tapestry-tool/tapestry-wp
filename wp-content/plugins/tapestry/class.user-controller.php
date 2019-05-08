<?php
/**
 * Add/update/retrieve User progress
 * 
 */
class UserController {
    public function updateProgress($userId, $postId, $progressData) {
        $this->checkUserAndPostId($userId, $postId);  

        if ($this->isJson($progressData)) {
            $progressData = json_decode($progressData);
        } else {
            throw new Exception('Invalid json');
        }

        $this->updateUserProgress($userId, $postId, $progressData);
    }

    public function getProgress($userId, $postId) {
        $this->checkUserAndPostId($userId, $postId);  
        return $this->getUserProgress($userId, $postId);
    }

    private function updateUserProgress($userId, $postId, $progressData) {
        update_user_meta($userId, 'progress_data_' . $postId, $progressData);
    }

    private function getUserProgress($userId, $postId) {
        $progress = get_user_meta($userId, 'progress_data_' . $postId, true);
        return $progress;
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
    }

    private function isJson($string) {
        $test_json = json_decode($string);
        if ($test_json) {
            return true;
        } else {
            return false;
        }
    }
}