<?php
/**
 * Tapestry User Roles
 */
class TapestryUserRoles
{
    private $user = null;
    
    /**
     * Constructor
     *
     * @param   Number  $postId     post ID
     * @param   Number  $nodeMetaId node meta ID
     *
     * @return  NULL
     */
    public function __construct($_userId = null)
    {
        $this->user = get_user_by('id', $_userId);
        if(is_null($this->user) || !$this->user){
            $this->user = wp_get_current_user();
        }
    }

    public function canEdit($postId = 0)
    {
        return $this->isEditor()
        || $this->isAdministrator()
        || $this->isAuthorOfThePost($postId);
    }

    /**
     * Check if the current user is a particular role
     *
     * @return Boolean
     */
    public function isRole($role)
    {
        return in_array(
            $role,
            $this->user->roles
        );
    }

    /**
     * Check if the current user is an administrator
     *
     * @return Boolean
     */
    public function isAdministrator()
    {
        return $this->isRole('administrator');
    }

    /**
     * Check if the current user is an editor
     *
     * @return Boolean
     */
    public function isEditor()
    {
        return $this->isRole('editor');
    }

    /**
     * Check if the current user is an author
     *
     * @return Boolean
     */
    public function isAuthor()
    {
        return $this->isRole('author');
    }

    /**
     * Check if the current user is an author of a post
     *
     * @param   Integer $postId post ID
     *
     * @return  Boolean
     */
    public function isAuthorOfThePost($postId)
    {
        return $this->user->ID == get_post($postId)->post_author;
    }

    /**
     * Check if the current user is a subscriber
     *
     * @return Boolean
     */
    public function isSubscriber()
    {
        return $this->isRole('subscriber');
    }
}
