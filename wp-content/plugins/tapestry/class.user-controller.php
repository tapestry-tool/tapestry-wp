<?php
/**
 * Add/update/retrieve Tapestry users
 * 
 */
class UserController {
    public function updateProgress($userId, $postId, $progressData) {
        if (is_null($userId)) throw new Exception('userId is invalid');
        $this->updateUserProgress($userId, $postId, $progressData);
    }

    public function getProgress($userId, $postId) {
        $this->getUserProgress($userId, $postId);
    }

    private function updateUserProgress($userId, $postId, $progressData) {
        echo("here");
        update_user_meta($userId, 'progress_data_', $progressData);
    }

    private function getUserProgress($userId, $postId) {
        $progress = get_user_meta($userId, 'progress_data_' . $postId, true);
        return $progress;
    }
}