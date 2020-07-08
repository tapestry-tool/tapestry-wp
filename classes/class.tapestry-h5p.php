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
        $content = $wpdb->get_results('select id, title from '.$wpdb->prefix.'h5p_contents');

        return $content;
    }
}
