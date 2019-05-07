<?php
/**
 * Add/update/retrieve Tapestry users
 * 
 */
class UserController {
    public function updateProgress($userId, $progressData) {
        if (is_null($userId)) throw new Exception('userId is invalid');
        $this->updateUserProgress($userId, $progressData);
    }

    public function getProgress($userId) {
        $this->getUserProgress($userId);
    }

    private function updateUserProgress($userId, $progressData) {
        update_post_meta($userId, 'progress', $progressData);
    }

    private function getUserProgress($userId) {
        $progress = get_user_meta($userId, 'progress', true);
        return $progress;
    }
}