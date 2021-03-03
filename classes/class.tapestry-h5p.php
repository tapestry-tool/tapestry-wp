<?php

require_once dirname(__FILE__).'/../interfaces/interface.tapestry-h5p.php';

class TapestryH5P implements ITapestryH5P
{
    private $postId;

    public function __construct($postId = null)
    {
        $this->postId = $postId;
    }

    /**
     * Returns the id and titles of all available h5p content.
     *
     * @return array $content All available content
     */
    public function get()
    {
        global $wpdb;
        $content = $wpdb->get_results('select content.id as id, content.title as title, content.filtered as details, name as library from '.$wpdb->prefix.'h5p_contents content join '.$wpdb->prefix.'h5p_libraries lib on content.library_id = lib.id');

        return $content;
    }
}
