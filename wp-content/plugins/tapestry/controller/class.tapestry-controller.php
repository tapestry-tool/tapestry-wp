<?php
/**
 * Add/update/retrieve Tapestry post and its child nodes
 * 
 */
class TapestryController {
    /**	
     * Update Tapestry post's child nodes	
     * 	
     * @param type @nodes An array of child nodes to be updated/added
     * @param type @postId The post ID to which the nodes belong	
     * @return WP_Error if postId is invalid	
     */	
    public function updateTapestryNodes($nodes, $postId = null) {	
        // TODO: check if $nodes param is a valid JSON	
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
