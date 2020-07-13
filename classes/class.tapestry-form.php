<?php

require_once dirname(__FILE__).'/../interfaces/interface.tapestry-form.php';

class TapestryForm implements ITapestryForm
{
    private $postId;

    public function __construct($postId = null)
    {
        $this->postId = $postId;
    }

    /**
     * Returns the form object of all created forms.
     *
     * @return array
     */
    public function getAll()
    {
        if (!$this::exists()) {
            return [];
        }

        return GFAPI::get_forms();
    }

    /**
     * Get the latest entry for the given form id for
     * the current logged in user.
     *
     * @return object the corresponding entry
     */
    public function getEntry($formId)
    {
        if (!$this::exists()) {
            return [];
        }
        $userId = apply_filters('determine_current_user', false);
        $search_criteria['field_filters'][] = [
            'key' => 'created_by',
            'value' => $userId,
        ];

        return GFAPI::get_entries($formId, $search_criteria);
    }

    /**
     * Returns the form object of all created forms.
     *
     * @return array
     */
    public static function exists()
    {
        return class_exists('GFAPI');
    }
}
