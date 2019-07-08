<?php
require_once dirname(__FILE__) . "/../utilities/class.tapestry-errors.php";
require_once dirname(__FILE__) . "/../utilities/class.tapestry-helpers.php";
require_once dirname(__FILE__) . "/../utilities/class.tapestry-user-roles.php";
require_once dirname(__FILE__) . "/../interfaces/interface.tapestry-setting-controller.php";

/**
 * Update tapestry settings
 * 
 */

class TapestrySettingController implements iTapestrySettingController
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
    public function save($settings, $updateTapestryPost = true)
    {
        if (!$this->postId) {
            return TapestryErrors::throwsError('INVALID_POST_ID');
        }
        if ((!TapestryUserRoles::isEditor())
            && (!TapestryUserRoles::isAdministrator())
            && (!TapestryUserRoles::isAuthorOfThePost($this->postId))
        ) {
            return TapestryErrors::throwsError('EDIT_TAPESTRY_PERMISSION_DENIED');
        }

        // TODO: add validation for the $settings

        return $this->_updateTapestrySettings($settings, $updateTapestryPost);
    }

    /**
     * Retrieve tapestry settings
     * 
     * @return Object Settings
     */
    public function get()
    {
        // This could be used as an endpoint if needed
        if (!$this->postId) {
            return TapestryErrors::throwsError('INVALID_POST_ID');
        }

        return $this->_getTapestrySettings();
    }

    private function _updateTapestrySettings($settings, $updateTapestryPost)
    {
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

    private function _getTapestrySettings()
    {
        $tapestry = get_post_meta($this->postId, 'tapestry', true);

        if (!isset($tapestry)) {
            $tapestry = (object) [
                'settings' => (object) []
            ];
        } else if (!isset($tapestry->settings)) {
            $tapestry->settings = (object) [];
        }

        return $tapestry->settings;
    }
}
