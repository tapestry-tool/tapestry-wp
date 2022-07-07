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

    /**
     * Gets the id and slug of an H5P content, by id.
     * 
     * @param string|int    H5P id
     * 
     * @return object|null  An object containing the id and slug of the H5P content,
     *                      or null if not found.
     */
    public function getH5P($id)
    {
        global $wpdb;

        $sql = $wpdb->prepare('SELECT content.id as id, content.slug as slug
                                FROM '.$wpdb->prefix.'h5p_contents content
                                WHERE content.id = %d;', (int) $id);

        $h5p_content = $wpdb->get_row($sql);

        return $h5p_content;
    }
}
