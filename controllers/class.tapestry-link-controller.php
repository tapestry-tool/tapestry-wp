<?php
require_once dirname(__FILE__) . "/../utilities/class.tapestry-errors.php";
require_once dirname(__FILE__) . "/../utilities/class.tapestry-helpers.php";

/**
 * Add/update/retrieve Tapestry post and its child nodes
 * 
 */
class TapestryLinkController
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
     * Add A Tapestry Link
     * 
     * @param   Object  $link   Tapestry link
     * 
     * @return  Object  $link 
     */
    public function addTapestryLink($link)
    {
        if (!$this->postId) {
            return TapestryErrors::throwsError('INVALID_POST_ID');
        }
        if (!$link->source || !$link->target) {
            return TapestryErrors::throwsError('INVALID_NEW_LINK');
        }
        if ((!TapestryHelpers::isChildNodeOfTapestry($link->source, $this->postId))
            || (!TapestryHelpers::isChildNodeOfTapestry($link->target, $this->postId))
        ) {
            return TapestryErrors::throwsError('INVALID_CHILD_NODE');
        }
        if (!TapestryHelpers::currentUserIsAllowed('ADD', $link->target, $this->postId)) {
            return TapestryErrors::throwsError('ADD_NODE_PERMISSION_DENIED');
        }

        $tapestry = get_post_meta($this->postId, 'tapestry', true);

        if (!isset($tapestry->links)) {
            $tapestry->links = [];
        }

        array_push($tapestry->links, $link);

        update_post_meta($this->postId, 'tapestry', $tapestry);

        return $link;
    }
}
