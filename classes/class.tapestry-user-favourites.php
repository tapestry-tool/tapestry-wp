<?php
require_once dirname(__FILE__) . "/../interfaces/interface.tapestry-user-favourites.php";

/**
 * Update/retrieve User favourites
 * 
 */
class TapestryUserFavourites implements ITapestryUserFavourites
{
    private $_userId = null;
    private $postId;

    /**
     * Constructor
     * 
     * @param   Number  $postId     post ID
     * 
     * @return  NULL
     */
    public function __construct($postId = null)
    {
        $this->_userId = apply_filters('determine_current_user', false);
        $this->postId = $postId;
    }

    /**
     * Get User's video progress for a tapestry post
     *
     * @return Array $favourites array of nodeIds
     */
    public function get()
    {
        $this->_isValidTapestryPost();
        $this->_checkUserAndPostId();

        $favourites = get_user_meta($this->_userId, 'tapestry_favourites_' . $this->postId, true);
        if ($favourites) {
            return $favourites;
        }
        return [];
    }

    /**
     * Update User's favourite nodes for a tapestry post
     *
     * @param Array $favourites update the favourite nodes
     *
     * @return Null
     */
    public function updateFavourites($favourites)
    {
        $this->_checkUserAndPostId();
        error_log("Updating");
        error_log(print_r($favourites, true));
        update_user_meta($this->_userId, 'tapestry_favourites_' . $this->postId, $favourites);
    }
    

    /* Helpers */

    private function _checkUserAndPostId()
    {
        if (!isset($this->_userId)) {
            throw new Exception('postId is invalid');
        }

        if (!isset($this->postId)) {
            throw new Exception('postId is invalid');
        }
    }

    private function _isValidTapestryPost()
    {
        // post ID exists in db
        if (!get_permalink($this->postId)) {
            throw new Exception('post id does not exist');
        }

        // Post type is correct
        if (get_post_type($this->postId) != "tapestry") {
            throw new Exception('post type is invalid');
        }
    }
}