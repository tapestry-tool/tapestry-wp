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
        $this->_userId = apply_filters('determine_current_user', false);
        $this->postId = $postId;
        $this->nodeMetaId = $nodeMetaId;
    }

    /**
     * Get User's video progress for a tapestry post.
     *
     * @return string progress   of each node in json format
     */
    public function get()
    {
        $this->_isValidTapestryPost();
        $this->_checkPostId();

        $tapestry = new Tapestry($this->postId);
        $nodeIds = $tapestry->getNodeIds();

        return $this->_getUserProgress($nodeIds, $this->_userId);
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
        $this->_complete();
    }

    /**
     * Set the question with the given id to be marked as 'completed'.
     *
     * @param int $questionId the question to mark
     *
     * @return null
     */
    public function completeQuestion($questionId)
    {
        $this->_checkPostId();
        $this->_completeQuestion($questionId);
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
     * Get all gravity form entries submitted by this user.
     *
     * @return string user entries in json format
     */
    public function getUserEntries($userId = 0, $formId = 0)
    {
        if (!class_exists('GFAPI')) {
            return [];
        }
        if (!$userId) {
            $userId = $this->_userId;
        }
        $search_criteria['field_filters'][] = [
            'key' => 'created_by',
            'value' => $userId,
        ];
        $entries = GFAPI::get_entries($formId, $search_criteria);

        return $this->_formatEntries($entries);
    }

    public function isCompleted($nodeId, $userId)
    {
        $nodeMetadata = get_metadata_by_mid('post', $nodeId)->meta_value;
        $completed_value = get_user_meta($userId, 'tapestry_'.$this->postId.'_node_completed_'.$nodeId, true);
        if (null !== $completed_value) {
            return '1' === $completed_value;
        } else {
            return isset($nodeMetadata->completed) && $nodeMetadata->completed ? true : false;
        }
    }

    private function _formatEntries($entries)
    {
        $formEntryMap = new stdClass();

        foreach ($entries as $entry) {
            $formId = $entry['form_id'];

            if (property_exists($formEntryMap, $formId)) {
                $latestEntry = $formEntryMap->$formId;
                if ($entry['date_updated'] > $latestEntry['date_updated']) {
                    $formEntryMap->$formId = $entry;
                }
            } else {
                $formEntryMap->$formId = $entry;
            }
        }

        foreach ((array) $formEntryMap as $formId => $entry) {
            $formEntryMap->$formId = $this->_getImageChoices($formId, $entry);
        }

        return $formEntryMap;
    }

    private function _getImageChoices($formId, &$entry)
    {
        $field_types = ['checkbox', 'radio'];
        $form = GFAPI::get_form($formId);
        $fields = GFAPI::get_fields_by_type($form, $field_types);
        $image_choices_fields = [];
        foreach ($fields as &$field) {
            if (is_object($field) && property_exists($field, 'imageChoices_enableImages') && !empty($field->imageChoices_enableImages)) {
                $image_choices_fields[$field->id] = $field;
            }
        }
        foreach ($image_choices_fields as $id => $field) {
            foreach ($field->inputs as $input) {
                $label = $input['label'];
                $correspondingChoice = array_values(array_filter(
                    $field['choices'],
                    function ($e) use ($label) {
                        return $e['value'] == $label;
                    }
                ))[0];
                if ('' != $entry[$input['id']]) {
                    $inputMap = new stdClass();
                    $inputMap->choiceText = $label;
                    $inputMap->imageUrl = $correspondingChoice['imageChoices_image'];
                    $entry[$input['id']] = $inputMap;
                }
            }
        }

        return $entry;
    }

    private function _updateUserProgress($progressValue)
    {
        update_user_meta($this->_userId, 'tapestry_'.$this->postId.'_progress_node_'.$this->nodeMetaId, $progressValue);
    }

    private function _complete()
    {
        update_user_meta($this->_userId, 'tapestry_'.$this->postId.'_node_completed_'.$this->nodeMetaId, true);
    }

    private function _completeQuestion($questionId)
    {
        $nodeMetadata = get_metadata_by_mid('post', $this->nodeMetaId)->meta_value;
        $quiz = $this->_getQuizProgress($this->nodeMetaId, $nodeMetadata, $this->_userId);
        $quiz[$questionId]['completed'] = true;
        update_user_meta($this->_userId, 'tapestry_'.$this->postId.'_node_quiz_'.$this->nodeMetaId, $quiz);
    }

    private function _getUserProgress($nodeIdArr, $userId)
    {
        $progress = new stdClass();
        $tapestry = new Tapestry($this->postId);

        $nodes = $tapestry->setUnlocked($nodeIdArr, $userId);

        // Build json object for frontend e.g. {0: 0.1, 1: 0.2} where 0 and 1 are the node IDs
        foreach ($nodes as $node) {
            $nodeId = $node->id;

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
                    'quiz' => $node->quiz,
                    'typeData' => $node->typeData,
                ];
            }

            $nodeMetadata = get_metadata_by_mid('post', $nodeId)->meta_value;
            $completed_value = $this->isCompleted($nodeId, $userId);
            $progress->$nodeId->completed = $completed_value;

            $quiz = $this->_getQuizProgress($nodeId, $nodeMetadata, $userId);
            $progress->$nodeId->quiz = $quiz;
        }

        return $progress;
    }

    private function _getQuizProgress($nodeId, $nodeMetadata, $userId)
    {
        $quiz = [];
        $completed_values = get_user_meta($userId, 'tapestry_'.$this->postId.'_node_quiz_'.$nodeId, true);

        $entries = $this->getUserEntries($userId);

        if (isset($nodeMetadata->quiz) && is_array($nodeMetadata->quiz)) {
            foreach ($nodeMetadata->quiz as $question) {
                $quiz[$question->id] = [
                    'completed' => false,
                ];

                foreach ($question->answers as $type => $gfOrH5pId) {
                    if ('' !== $gfOrH5pId) {
                        if ('audioId' == $type) {
                            $tapestryAudio = new TapestryAudio($this->postId, $nodeId, $question->id, $userId);
                            if ($tapestryAudio->audioExists()) {
                                $quiz[$question->id][$type] = $tapestryAudio->get();
                            }
                        } elseif (property_exists($entries, $gfOrH5pId)) {
                            $quiz[$question->id][$type] = $entries->$gfOrH5pId;
                        }
                    }
                }
            }
        }

        if (isset($completed_values) && is_array($completed_values)) {
            foreach ($completed_values as $id => $info) {
                $quiz[$id]['completed'] = $info['completed'];
            }
        }

        return count($quiz) > 0 ? $quiz : (object) $quiz;
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
        update_user_meta($this->_userId, 'tapestry_favourites_' . $this->postId, $favourites);
    }

    /* Helpers */

    private function _checkPostId()
    {
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
