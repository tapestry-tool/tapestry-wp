<?php
/**
 * Add/update/retrieve User progress
 * 
 */
class UserController {
    public function updateProgress($userId, $postId, $progressData) {
        $this->checkUserAndPostId($userId, $postId);        
        $this->updateUserProgress($userId, $postId, $progressData);
    }

    public function getProgress($userId, $postId) {
        $this->checkUserAndPostId($userId, $postId);  
        return $this->getUserProgress($userId, $postId);
    }

    private function checkUserAndPostId( $userId, $postId) {
        if (!isset($userId)) {
            throw new Exception('userId is invalid');
        }
        // Not the current user
        if ($userId != apply_filters('determine_current_user', false)) {
            throw new Exception('userId is invalid');
        }

        if (!isset($postId)) {
            throw new Exception('postId is invalid');
        }
    }

    private function updateUserProgress($userId, $postId, $progressData) {
        update_user_meta($userId, 'progress_data_' . $postId, $progressData);
    }

    private function getUserProgress($userId, $postId) {
        $progress = get_user_meta($userId, 'progress_data_' . $postId, true);
        return $progress;
    }
}