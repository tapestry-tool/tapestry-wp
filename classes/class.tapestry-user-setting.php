<?php
// TODO Change exceptions to using an ERROR class
require_once dirname(__FILE__) . "/../interfaces/interface.tapestry-user-setting.php";

/**
 * Add/update/retrieve User progress
 * 
 */
class TapestryUserSetting implements ITapestryUserSetting
{

    private $_userId = null;
    private $postId;

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
     * @return Object settings  Tapestry settings for the user for a given post
     */
    public function get()
    {
        return $this->_getUserSetting();
    }

    /**
     * Update User's video progress for a tapestry post
     *
     * @param $settingsData settings data includes background image url and autolayout value (true/fase)
     *
     * @return Null
     */
    public function updateUserSetting($settingsData)
    {
        $this->_updateUserSetting($settingsData);
    }

    private function _getUserSetting()
    {
        $settings = get_user_meta($this->_userId, 'tapestry_setting_' . $this->postId, true);
        return json_encode($settings);
    }

    private function _updateUserSetting($settingsData)
    {
        update_user_meta($this->_userId, 'tapestry_setting_' . $this->postId, $settingsData);
    }

}
