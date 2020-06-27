<?php
require_once dirname(__FILE__) . "/../interfaces/interface.tapestry-form.php";

class TapestryForm implements ITapestryForm
{
    private $postId;

    public function __construct($postId = null)
    {
        $this->postId = $postId;
    }

    /**
     * Returns the form object of all created forms
     *
     * @return  Array
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
     * @return Object the corresponding entry
     */
    public function getEntry($formId, $userId = 0)
    {
        if (!$this::exists()) {
            return [];
        }
        if (!$userId) {
            $userId = apply_filters('determine_current_user', false);
        }
        $search_criteria['field_filters'][] = array(
      'key'   => 'created_by',
      'value' => $userId
    );
        return GFAPI::get_entries($formId, $search_criteria);
    }

    /**
     * Returns the form object of all created forms
     *
     * @return  Array
     */
    public static function exists()
    {
        return class_exists("GFAPI");
    }
}
