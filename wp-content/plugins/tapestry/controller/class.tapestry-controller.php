<?php
/**
 * Add/update/retrieve Tapestry post and its child nodes
 * 
 */
class TapestryController {
    /**
     * Update Tapestry settings
     * 
     * @param  Object @settings - New Tapestry settings
     * @param  Number @postId   - The Tapestry postId
     * @return Object New Tapestry settings
     */
    public function updateTapestrySettings($settings, $postId = null) {
        // TODO: Use $this->postId that's passed in the constructor
        // TODO: use isValidPostID() utlility function
        $tapestry = get_post_meta($postId, 'tapestry', true);
        $tapestry->settings = $settings;

        // TODO: uncomment the line below when saving tapestry is merged
        // $this->updatePost($tapestry, 'tapestry', $postId);
        update_post_meta($postId, 'tapestry', $tapestry);

        return $tapestry->settings;
    }
}
