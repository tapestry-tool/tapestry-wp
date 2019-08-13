<?php

/**
 * Tapestry Interface
 * 
 */
interface ITapestryUserSetting
{

    /**
     * Get User's settings for a tapestry post
     *
     * @return Object settings for the tapestry
     */
    public function get();

    /**
     * Update User's tapestry setting for a tapestry post
     *
     * @param Float $settings background image and autolayout value
     *
     * @return Null
     */
    public function updateUserSetting($settings);

}
