<?php
/**
 * Add/update/retrieve Tapestry post and its child nodes
 * 
 */
class TapestryController {
    /**	
     * Update Tapestry post's child nodes	
     * 	
     * @param  Array  @nodes  An array of child nodes
     * @param  Number @postId The Tapestry postId
     * @return Array  @nodes
     * @throws WP_Error
     */	
    public function updateTapestryNodes($nodes, $postId = null) {	
        // TODO: use isValidPostID() utlility function
        /*
        if (!isset($postId)) {	
            return $this->throwsError('INVALID_POST_ID');	
        }
        */
        // TODO: uncomment the line below when saving tapestry PR is merged
        // $this->updateNodes($nodes, $postId);
        return $nodes;
    }
}
