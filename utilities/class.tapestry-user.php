<?php
/**
 * Tapestry User.
 */
class TapestryUser
{
    private $user = null;

    /**
     * Constructor.
     *
     * @return null
     */
    public function __construct($_userId = null)
    {
        if ($_userId == null) {
            $this->user = wp_get_current_user();
        } else {
            $this->user = get_user_by('id', $_userId);
            if (is_null($this->user) || !$this->user) {
                $this->user = wp_get_current_user();
            }
        }
    }

    public function canEdit($postId = 0)
    {
        return user_can($this->getID(), 'edit_post', $postId);
    }

    public function getID()
    {
        return $this->user->ID;
    }

    /**
     * Check if the current user is an author of a post.
     *
     * @param int $postId post ID
     *
     * @return bool
     */
    public function isAuthorOfThePost($postId)
    {
        return $this->user->ID == get_post($postId)->post_author;
    }
}
