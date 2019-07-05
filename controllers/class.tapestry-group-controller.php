<?php
require_once dirname(__FILE__) . "/../utilities/class.tapestry-errors.php";
require_once dirname(__FILE__) . "/../utilities/class.tapestry-helpers.php";
require_once dirname(__FILE__) . "/../utilities/class.tapestry-user-roles.php";

/**
 * Add/update/retrieve Tapestry post and its child nodes
 * 
 */
class TapestryGroupController
{
    private $postId;

    /**
     * Constructor
     */
    public function __construct($postId = 0)
    {
        if ($postId && !TapestryHelpers::isValidTapestry($postId)) {
            return TapestryErrors::throwsError('INVALID_POST_ID');
        }
        $this->postId = (int) $postId;
    }

    /**
     * Add a new Tapestry group
     * 
     * @param   Object  $group  Tapestry group
     * 
     * @return  Object  $group
     */
    public function addTapestryGroup($group)
    {
        if (!$this->postId) {
            return TapestryErrors::throwsError('INVALID_POST_ID');
        }
        if (isset($group->id) && TapestryHelpers::isValidTapestryGroup($group->id)) {
            return TapestryErrors::throwsError('GROUP_ALREADY_EXISTS');
        }
        if ((!TapestryUserRoles::isEditor())
            || (!TapestryUserRoles::isAdministrator())
            || (!TapestryUserRoles::isAuthorOfThePost($this->postId))
        ) {
            return TapestryErrors::throwsError('EDIT_TAPESTRY_PERMISSION_DENIED');
        }

        return $this->_addGroup($group);
    }

    private function _addGroup($group)
    {
        $group->id = add_post_meta($this->postId, 'group', $group);
        $group->type = 'tapestry_group';

        // TODO: handle the local nodes logic here
        // At the moment, we put everything in the post meta

        update_metadata_by_mid('post', $group->id, $group);

        $tapestry = get_post_meta($this->postId, 'tapestry', true);

        if (!isset($tapestry->groups)) {
            $tapestry->groups = [];
        }

        array_push($tapestry->groups, $group->id);

        update_post_meta($this->postId, 'tapestry', $tapestry);

        return $group;
    }
}
