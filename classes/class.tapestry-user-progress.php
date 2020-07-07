<?php
// TODO Change exceptions to using an ERROR class
require_once dirname(__FILE__) . "/../interfaces/interface.tapestry-user-progress.php";
require_once dirname(__FILE__) . "/../classes/class.tapestry-node.php";
require_once dirname(__FILE__) . "/../classes/class.tapestry.php";

/**
 * Add/update/retrieve User progress
 *
 */
class TapestryUserProgress implements ITapestryUserProgress
{
    private $_userId = null;
    private $postId;
    private $nodeMetaId;

    /**
     * Constructor
     *
     * @param   Number  $postId     post ID
     * @param   Number  $nodeMetaId node meta ID
     *
     * @return  NULL
     */
    public function __construct($postId = null, $nodeMetaId = null)
    {
        $this->_userId = apply_filters('determine_current_user', false);
        $this->postId = $postId;
        $this->nodeMetaId = $nodeMetaId;
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

        $tapestry = new Tapestry($this->postId);
        $nodeIdArr = $tapestry->getNodeIds();

        return $this->_getUserProgress($nodeIdArr);
    }

    /**
     * Update User's video progress for a tapestry post
     *
     * @param Float $progressValue how much the video was viewed, value should be between >= 0 and <= 1
     *
     * @return Null
     */
    public function updateUserProgress($progressValue)
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
     * Set 'completed' status of a Tapestry Node for this User to true
     *
     * @return Null
     */
    public function complete()
    {
        $this->_checkUserAndPostId();
        $this->_complete();
    }

    /**
     * Set the question with the given id to be marked as 'completed'
     *
     * @param Integer $questionId the question to mark
     *
     * @return Null
     */
    public function completeQuestion($questionId)
    {
        $this->_checkUserAndPostId();
        $this->_completeQuestion($questionId);
    }

    /**
     * Update User's h5p video setting for a tapestry post
     *
     * @param   String  $h5pSettingsData stores volume,
     * playbackRate, quality of h5p video
     *
     * @return  Null
     */
    public function updateH5PSettings($h5pSettingsData)
    {
        $this->_checkUserAndPostId();
        $this->_updateUserH5PSettings($h5pSettingsData);
    }

    /**
     * Get User's h5p video setting for a tapestry post
     *
     * @return String h5p $setting
     */
    public function getH5PSettings()
    {
        $this->_isValidTapestryPost();
        $this->_checkUserAndPostId();
        return $this->_getUserH5PSettings();
    }

    /**
     * Get all gravity form entries submitted by this user
     *
     * @return String user entries in json format
     */
    public function getUserEntries($formId = 0)
    {
        if (!class_exists("GFAPI")) {
            return [];
        }
        $search_criteria['field_filters'][] = array(
            'key' => 'created_by',
            'value' => $this->_userId,
        );
        $entries = GFAPI::get_entries($formId, $search_criteria);
        return $this->_formatEntries($entries);
    }

    public function isCompleted($nodeId, $userId)
    {
        $nodeMetadata = get_metadata_by_mid('post', $nodeId)->meta_value;
        $completed_value = get_user_meta($userId, 'tapestry_' . $this->postId . '_node_completed_' . $nodeId, true);
        if ($completed_value !== null) {
            return $completed_value === "1";
        } else {
            return isset($nodeMetadata->completed) && $nodeMetadata->completed ? true : false;
        }
    }

    private function _formatEntries($entries)
    {
        $formEntryMap = new stdClass();

        foreach ($entries as $entry) {
            $formId = $entry["form_id"];

            if (property_exists($formEntryMap, $formId)) {
                $latestEntry = $formEntryMap->$formId;
                if ($entry["date_updated"] > $latestEntry["date_updated"]) {
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
        $field_types = array('checkbox', 'radio');
        $form = GFAPI::get_form($formId);
        $fields = GFAPI::get_fields_by_type($form, $field_types);
        $image_choices_fields = array();
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
                if ($entry[$input['id']] != '') {
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
        update_user_meta($this->_userId, 'tapestry_' . $this->postId . '_progress_node_' . $this->nodeMetaId, $progressValue);
    }

    private function _complete()
    {
        update_user_meta($this->_userId, 'tapestry_' . $this->postId . '_node_completed_' . $this->nodeMetaId, true);
    }

    private function _completeQuestion($questionId)
    {
        $nodeMetadata = get_metadata_by_mid('post', $this->nodeMetaId)->meta_value;
        $quiz = $this->_getQuizProgress($this->nodeMetaId, $nodeMetadata);
        $quiz[$questionId]['completed'] = true;
        update_user_meta($this->_userId, 'tapestry_' . $this->postId . '_node_quiz_' . $this->nodeMetaId, $quiz);
    }

    private function _getUserProgress($nodeIdArr)
    {
        $progress = new stdClass();
        $tapestry = new Tapestry($this->postId);

        $nodes = $tapestry->setUnlocked($nodeIdArr, $this->_userId);

        // Build json object for frontend e.g. {0: 0.1, 1: 0.2} where 0 and 1 are the node IDs
        foreach ($nodes as $node) {
            $nodeId = $node->id;

            $progress_value = get_user_meta($this->_userId, 'tapestry_' . $this->postId . '_progress_node_' . $nodeId, true);
            $progress->$nodeId = new stdClass();
            if ($progress_value !== null) {
                $progress->$nodeId->progress = (float) $progress_value;
            } else {
                $progress->$nodeId->progress = 0;
            }

            $progress->$nodeId->accessible = $node->accessible;
            $progress->$nodeId->conditions = $node->conditions;
            $progress->$nodeId->unlocked = $node->unlocked;

            if ($node->accessible) {
                $progress->$nodeId->content = [
                    'quiz'      => $node->quiz,
                    'typeData'  => $node->typeData
                ];
            }
            
            $nodeMetadata = get_metadata_by_mid('post', $nodeId)->meta_value;
            $completed_value = $this->isCompleted($nodeId, $this->_userId);
            $progress->$nodeId->completed = $completed_value;

            $quiz = $this->_getQuizProgress($nodeId, $nodeMetadata);
            $progress->$nodeId->quiz = $quiz;
        }

        return $progress;
    }

    private function _getQuizProgress($nodeId, $nodeMetadata)
    {
        $quiz = array();
        $completed_values = get_user_meta($this->_userId, 'tapestry_' . $this->postId . '_node_quiz_' . $nodeId, true);

        $entries = $this->getUserEntries();

        if (isset($nodeMetadata->quiz) && is_array($nodeMetadata->quiz)) {
            foreach ($nodeMetadata->quiz as $question) {
                $quiz[$question->id] = array(
                    'completed' => false,
                );

                foreach ($question->answers as $type => $gfOrH5pId) {
                    if ($gfOrH5pId !== "") {
                        if ($type == 'audioId') {
                            $tapestryAudio = new TapestryAudio($this->postId, $nodeId, $question->id);
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
        update_user_meta($this->_userId, 'tapestry_h5p_setting_' . $this->postId, $h5pSettingsData);
    }

    private function _getUserH5PSettings()
    {
        $settings = get_user_meta($this->_userId, 'tapestry_h5p_setting_' . $this->postId, true);
        return $settings ? json_decode($settings) : (object) [];
    }

    /**
     * Get User's video progress for a tapestry post
     *
     * @return Array $favourites array of nodeIds
     */
    public function getFavourites()
    {
        $this->_isValidTapestryPost();
        $this->_checkUserAndPostId();

        $favourites = get_user_meta($this->_userId, 'tapestry_favourites_' . $this->postId, true);
        if ($favourites) {
            return json_decode($favourites);
        }
        return [];
    }

    /**
     * Update User's favourite nodes for a tapestry post
     *
     * @param Array $favourites update the favourite nodes
     *
     * @return Null
     */
    public function updateFavourites($favourites)
    {
        $this->_checkUserAndPostId();
        update_user_meta($this->_userId, 'tapestry_favourites_' . $this->postId, $favourites);
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
