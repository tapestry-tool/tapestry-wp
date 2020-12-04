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
     * @param Number $postId     post ID
     * @param Number $nodeMetaId node meta ID
     *
     * @return null
     */
    public function __construct($_userId = null)
    {
        $this->user = get_user_by('id', $_userId);
        if (is_null($this->user) || !$this->user) {
            $this->user = wp_get_current_user();
        }
    }

    public function canEdit($postId = 0)
    {
        return $this->user->has_cap('edit_posts', $postId);
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
