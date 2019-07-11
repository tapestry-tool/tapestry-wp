<?php
require_once dirname(__FILE__) . "/../utilities/class.tapestry-errors.php";
require_once dirname(__FILE__) . "/../utilities/class.tapestry-helpers.php";
require_once dirname(__FILE__) . "/../interfaces/interface.tapestry-link-controller.php";

/**
 * Add/update/retrieve Tapestry post and its child nodes
 * 
 */
class TapestryLinkController implements ITapestryLinkController
{
    private $postId;

    /**
     * Constructor
     * 
     * @param   Number  $postId post ID
     * 
     * @return  NULL
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
    public function save($link)
    {
        if (!$link->source || !$link->target) {
            return TapestryErrors::throwsError('INVALID_NEW_LINK');
        }
        if ((!TapestryHelpers::isChildNodeOfTapestry($link->source, $this->postId))
            || (!TapestryHelpers::isChildNodeOfTapestry($link->target, $this->postId))
        ) {
            return TapestryErrors::throwsError('INVALID_CHILD_NODE');
        }

        return $this->_addTapestryLink($link);
    }

    /**
     * Retrive the Tapestry Links
     * 
     * @return  Object  $links
     */
    public function get()
    {
        // TODO: TO BE IMPLEMENTED
    }

    private function _addTapestryLink($link)
    {
        $tapestry = get_post_meta($this->postId, 'tapestry', true);

        if (!isset($tapestry->links)) {
            $tapestry->links = [];
        }

        array_push($tapestry->links, $link);

        update_post_meta($this->postId, 'tapestry', $tapestry);

        return $link;
    }
}
