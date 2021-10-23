<?php

// TODO Change exceptions to using an ERROR class
require_once dirname(__FILE__).'/../interfaces/interface.tapestry-user-progress.php';
require_once dirname(__FILE__).'/../classes/class.tapestry-node.php';
require_once dirname(__FILE__).'/../classes/class.tapestry.php';

/**
 * Add/update/retrieve User progress.
 */
class TapestryUserProgress implements ITapestryUserProgress
{
    private $_userId = null;
    private $postId;
    private $nodeMetaId;
    private $node;

    /**
     * Constructor.
     *
     * @param Number $postId     post ID
     * @param Number $nodeMetaId node meta ID
     *
     * @return null
     */
    public function __construct($postId = null, $nodeMetaId = null)
    {
        $this->postId = $postId;
        $this->nodeMetaId = $nodeMetaId;

        if ($nodeMetaId) {
            $this->node = new TapestryNode($postId = null, $nodeMetaId = null);
        }

        $this->_userId = apply_filters('determine_current_user', false);
    }

    /**
     * Get User's progress for a tapestry post.
     *
     * @return string progress   of each node in json format
     */
    public function get()
    {
        $this->_isValidTapestryPost();
        $this->_checkPostId();

        $tapestry = new Tapestry($this->postId);
        $nodeIds = $tapestry->getNodeIds();

        return $this->_getUserProgress($nodeIds);
    }

    /**
     * Update User's video progress for a tapestry post.
     *
     * @param float $progressValue how much the video was viewed, value should be between >= 0 and <= 1
     *
     * @return null
     */
    public function updateUserProgress($progressValue)
    {
        $this->_checkPostId();
        $this->_checkProgressAbility();

        if (null !== $progressValue) {
            $progressValue = floatval($progressValue);
        }

        // Value should be between 0 and 1
        if ($progressValue < 0 || $progressValue > 1) {
            throw new TapestryError('INVALID_PROGRESS');
        }

        $this->_updateUserProgress($progressValue);
    }

    /**
     * Set 'completed' status of a Tapestry Node for this User to true.
     *
     * @return null
     */
    public function complete()
    {
        $this->_checkPostId();
        $this->_checkProgressAbility();
        $this->_complete();
    }

    /**
     * Set the question with the given id to be marked as 'completed'.
     *
     * @param int    $questionId the question to mark
     * @param string $answerData the user answer
     *
     * @return null
     */
    public function completeQuestion($questionId, $answerType, $answerData)
    {
        $this->_checkPostId();
        $this->_checkProgressAbility();
        $this->_completeQuestion($questionId, $answerType, $answerData);
    }

    /**
     * Get all user's answers for a Tapestry.
     *
     * @return object $allAnswers all users' answers from a Tapestry
     */
    public function getAllUsersAnswers()
    {
        $this->_checkPostId();

        return $this->_getAllUsersAnswers();
    }

    /**
     * Update User's h5p video setting for a tapestry post.
     *
     * @param string $h5pSettingsData stores volume,
     *                                playbackRate, quality of h5p video
     *
     * @return null
     */
    public function updateH5PSettings($h5pSettingsData)
    {
        $this->_checkPostId();
        $this->_updateUserH5PSettings($h5pSettingsData);
    }

    /**
     * Get User's h5p video setting for a tapestry post.
     *
     * @return string h5p $setting
     */
    public function getH5PSettings()
    {
        $this->_isValidTapestryPost();
        $this->_checkPostId();

        return $this->_getUserH5PSettings();
    }

    /**
     * Update the user's theme.
     *
     * @param string $userSettings stores theme
     *
     * @return null
     */
    public function updateUserSettings($userSettings)
    {
        $this->_updateUserSettings($userSettings);
    }

    /**
     * Get the user's Theme.
     *
     * @return object theme $theme
     */
    public function getTheme()
    {
        return $this->_getTheme();
    }

    public function isCompleted($nodeId = null, $userId = null)
    {
        if (!$nodeId) {
            $nodeId = $this->nodeMetaId;
        }
        if (!$userId) {
            $userId = $this->_userId;
        }

        if (!$userId) {
            return false;
        }

        $nodeMetadata = get_metadata_by_mid('post', $nodeId)->meta_value;
        $completed_value = get_user_meta($userId, 'tapestry_'.$this->postId.'_node_completed_'.$nodeId, true);
        if (null !== $completed_value) {
            return '1' === $completed_value;
        } else {
            return isset($nodeMetadata->completed) && $nodeMetadata->completed ? true : false;
        }
    }

    /**
     * This function checks if any user has answered a question.
     *
     * @param string $postId
     * @param string $nodeMetaId
     * @param string $questionId
     *
     * @return bool $hasAnswer
     */
    public static function questionsHasAnyAnswer($postId, $nodeMetaId, $questionId, $answerType)
    {
        $userIds = get_users(['fields' => ['ID']]);
        $hasAnswer = false;

        foreach ($userIds as $userId) {
            $user_answer = get_user_meta($userId->ID, 'tapestry_'.$postId.'_'.$nodeMetaId.'_question_'.$questionId.'_answers', true);
            if ('' != $user_answer && is_array($user_answer) && array_key_exists($answerType, $user_answer)) {
                $hasAnswer = true;
                break;
            }
        }

        return $hasAnswer;
    }

    private function _updateUserProgress($progressValue)
    {
        update_user_meta($this->_userId, 'tapestry_'.$this->postId.'_progress_node_'.$this->nodeMetaId, $progressValue);
    }

    private function _complete()
    {
        update_user_meta($this->_userId, 'tapestry_'.$this->postId.'_node_completed_'.$this->nodeMetaId, true);
    }

    private function _completeQuestion($questionId, $answerType, $answerData)
    {
        $userAnswer = get_user_meta($this->_userId, 'tapestry_'.$this->postId.'_'.$this->nodeMetaId.'_question_'.$questionId.'_answers', true);
        if ('' === $userAnswer) {
            $userAnswer = [];
        }
        $userAnswer[$answerType] = $answerData;
        update_user_meta($this->_userId, 'tapestry_'.$this->postId.'_'.$this->nodeMetaId.'_question_'.$questionId.'_answers', $userAnswer);
    }

    private function _getAllUsersAnswers()
    {
        $tapestry = new Tapestry($this->postId);
        $tapestryNode = new TapestryNode($this->postId);
        $nodeIds = $tapestry->getNodeIds();
        $activityNodes = [];
        foreach ($nodeIds as $nodeId) {
            $node = $tapestry->getNode($nodeId);
            if ('activity' === $tapestryNode->getMediaType($node)) {
                array_push($activityNodes, $node);
            }
        }
        $allUsersAnswers = (object) [];
        $users = get_users(['fields' => ['ID', 'display_name']]);
        foreach ($activityNodes as $activity) {
            $activityId = $tapestryNode->getNodeId($activity);
            $typeData = $tapestryNode->getTypeData($activity);
            $activityQuestions = $typeData->activity->questions;
            $activityAnswers = (object) [];
            foreach ($activityQuestions as $question) {
                $questionId = $question->id;
                $questionAnswers = [];
                foreach ($users as $user) {
                    $user_answer = get_user_meta($user->ID, 'tapestry_'.$this->postId.'_'.$activityId.'_question_'.$questionId.'_answers', true);
                    if ('' != $user_answer && is_array($user_answer)) {
                        $userAnswers = array_merge((array) $user, $user_answer);
                        array_push($questionAnswers, $userAnswers);
                    } else {
                        array_push($questionAnswers, (array) $user);
                    }
                }
                $activityAnswers->$questionId = $questionAnswers;
            }
            $allUsersAnswers->$activityId = $activityAnswers;
        }

        return $allUsersAnswers;
    }

    private function _getUserProgress($nodeIdArr, $userId = null)
    {
        $progress = new stdClass();
        $tapestry = new Tapestry($this->postId);

        $nodes = $tapestry->setUnlocked($nodeIdArr, $this->_userId);

        // Build json object for frontend e.g. {0: 0.1, 1: 0.2} where 0 and 1 are the node IDs
        foreach ($nodes as $node) {
            $nodeId = $node->id;

            $userId = $this->_userId;

            $progress_value = get_user_meta($userId, 'tapestry_'.$this->postId.'_progress_node_'.$nodeId, true);
            $progress->$nodeId = new stdClass();
            if (null !== $progress_value) {
                $progress->$nodeId->progress = (float) $progress_value;
            } else {
                $progress->$nodeId->progress = 0;
            }

            $progress->$nodeId->accessible = $node->accessible;
            $progress->$nodeId->conditions = $node->conditions;
            $progress->$nodeId->unlocked = $node->unlocked;

            if ($node->accessible) {
                $progress->$nodeId->content = [
                    'typeData' => $node->typeData,
                ];
            }

            $isQuestionNode = property_exists($node->typeData, 'activity');
            if ($isQuestionNode) {
                $questionIdArray = array_map(
                    function ($question) {
                        return $question->id;
                    },
                    $node->typeData->activity->questions
                );

                $progress->$nodeId->content['userAnswers'] = new stdClass();
                $progress->$nodeId->content['userAnswers']->activity = new stdClass();
                foreach ($questionIdArray as $questionId) {
                    $answer = get_user_meta($userId, 'tapestry_'.$this->postId.'_'.$nodeId.'_question_'.$questionId.'_answers', true);
                    $progress->$nodeId->content['userAnswers']->activity->{$questionId}->answers = $answer;
                }
            }

            $completed_value = $this->isCompleted($nodeId, $userId);
            $progress->$nodeId->completed = $completed_value;
        }

        return $progress;
    }

    private function _updateUserH5PSettings($h5pSettingsData)
    {
        update_user_meta($this->_userId, 'tapestry_h5p_setting_'.$this->postId, $h5pSettingsData);
    }

    private function _getUserH5PSettings()
    {
        $settings = get_user_meta($this->_userId, 'tapestry_h5p_setting_'.$this->postId, true);

        return $settings ? json_decode($settings) : (object) [];
    }

    private function _updateUserSettings($userSettings)
    {
        update_user_meta($this->_userId, 'user_settings', $userSettings);
    }

    private function _getTheme()
    {
        $userSettings = get_user_meta($this->_userId, 'user_settings', true);
        $userSettingsObject = json_decode($userSettings);
        $theme = $userSettingsObject->theme;

        return $theme ? $theme : '';
    }

    /**
     * Get User's video progress for a tapestry post.
     *
     * @return array $favourites array of nodeIds
     */
    public function getFavourites()
    {
        $this->_isValidTapestryPost();
        $this->_checkPostId();

        $favourites = get_user_meta($this->_userId, 'tapestry_favourites_'.$this->postId, true);
        if ($favourites) {
            return json_decode($favourites);
        }

        return [];
    }

    /**
     * Update User's favourite nodes for a tapestry post.
     *
     * @param array $favourites update the favourite nodes
     *
     * @return null
     */
    public function updateFavourites($favourites)
    {
        $this->_checkPostId();
        update_user_meta($this->_userId, 'tapestry_favourites_'.$this->postId, $favourites);
    }

    /**
     * Get User's last selected node for a tapestry post.
     *
     * @return int $nodeId  node id of the last selected node in the tapestry
     */
    public function getLastSelectedNode()
    {
        $this->_isValidTapestryPost();
        $this->_checkPostId();

        $lastSelectedNode = get_user_meta($this->_userId, 'tapestry_last_selected_node_'.$this->postId, true);

        return $lastSelectedNode;
    }

    /**
     * Update User's last selected node for a tapestry post.
     *
     * @param int $nodeId node id of the last selected node in the tapestry
     *
     * @return null
     */
    public function updateLastSelectedNode($nodeId, $rowId, $subRowId)
    {
        $this->_checkPostId();

        $lastSelectedNode = new stdClass();
        $lastSelectedNode->nodeId = $nodeId;

        if ($rowId) {
            $lastSelectedNode->rowId = $rowId;
        }
        if ($subRowId) {
            $lastSelectedNode->subRowId = $subRowId;
        }

        update_user_meta($this->_userId, 'tapestry_last_selected_node_'.$this->postId, $lastSelectedNode);
    }

    /* Helpers */

    private function _checkPostId()
    {
        if (!isset($this->postId)) {
            throw new Exception('postId is invalid');
        }
    }

    // This function is not currently used in the master branch but kept to reduce
    // conflicts with the TYDE branch and for future use.
    private function _checkProgressAbility()
    {
        return true;
    }

    private function _isValidTapestryPost()
    {
        // post ID exists in db
        if (!get_permalink($this->postId)) {
            throw new Exception('post id does not exist');
        }

        // Post type is correct
        if ('tapestry' != get_post_type($this->postId)) {
            throw new Exception('post type is invalid');
        }
    }

    private function _isJson($string)
    {
        $test_json = json_decode($string);
        if (null !== $test_json) {
            return true;
        } else {
            return false;
        }
    }
}
