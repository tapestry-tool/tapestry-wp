<?php
require_once dirname(__FILE__) . "/../utilities/class.tapestry-errors.php";
require_once dirname(__FILE__) . "/../utilities/class.tapestry-helpers.php";

/**
 * Update tapestry settings
 * 
 */

class TapestrySettingsController
{
    private $postId;

    /**
     * Constructor
     */
    public function __construct($postId = 0)
    {
        if ($postId && !TapestryHelpers::isValidTapestry($postId)) {
            return TapestryErrors::throwsError('INVALID_POST_ID');
        }
        $this->postId = (int) $postId;
    }

    /**
     * Update Tapestry settings
     * 
     * @param   Object  $settings   Tapestry settings
     * 
     * @return  Object  $settings 
     */
    public function updateTapestrySettings($settings, $updateTapestryPost = true)
    {
        if (!$this->postId) {
            return TapestryErrors::throwsError('INVALID_POST_ID');
        }

        // TODO: add validation for the $settings

        $tapestry = get_post_meta($this->postId, 'tapestry', true);

        if (empty($tapestry)) {
            $tapestry =  (object) array(
                'nodes'     => [],
                'groups'    => [],
                'links'     => []
            );
        }

        $tapestry->settings = $settings;

        if ($updateTapestryPost) {
            TapestryHelpers::updatePost($tapestry, 'tapestry', $this->postId);
        }

        update_post_meta($this->postId, 'tapestry', $tapestry);

        return $settings;
    }

    /**
     * Retrieve tapestry settings
     * 
     * @return Object Settings
     */
    public function getTapestrySettings()
    {
        // This could be used as an endpoint if needed
        if (!$this->postId) {
            return TapestryErrors::throwsError('INVALID_POST_ID');
        }

        $tapestry = get_post_meta($this->postId, 'tapestry', true);

        if (!isset($tapestry)) {
            $tapestry = (object) array(
                'settings' => (object) array()
            );
        } else if (!isset($tapestry->settings)) {
            $tapestry->settings = (object) array();
        }

        return $tapestry->settings;
    }
}
