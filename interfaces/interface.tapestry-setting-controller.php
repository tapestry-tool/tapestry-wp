<?php
require_once dirname(__FILE__) . "/interface.tapestry-controller.php";

/**
 * Tapestry Setting Controller Interface
 * 
 */
interface ITapestrySettingController extends ITapestryController
{
    /**
     * Update Tapestry settings
     * 
     * @param   Object  $settings   Tapestry settings
     * @param   Boolean $updateTapestryPost update tapestry post flag
     * 
     * @return  Object  $settings 
     */
    public function save($settings, $updateTapestryPost = true);
}
