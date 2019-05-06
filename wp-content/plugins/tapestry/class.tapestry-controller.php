<?php
/**
 * Add/update/retrieve Tapestry post and its child nodes
 * 
 */
class TapestryController {
    /**
     * Update the existing Tapestry post if the postId is provided
     * Otherwise, a new post will be created
     * 
     * @param type @post The post data
     * @param type @postId The post ID associated with the post data (optional)
     */
    public function updateTapestryPost($post, $postId = null) {
        if (is_null($postId)) $postId = $this->insertPost($post);
        $this->updateNodes($post['nodes'], $postId);

        $post['nodes'] = $this->getNodeIds($post['nodes']);
        $this->updateTapestry($post, $postId);
    }

    /**
     * Update Tapestry post's child nodes
     * 
     * @param type @nodes An array of child nodes to be updated
     * @param type @postId The post ID to which the nodes belong
     * @throws Exception if postId is invalid
     */
    public function updateTapestryNodes($nodes, $postId = null) {
        if (is_null($postId)) throw new Exception('postId is invalid');
        $this->updateNodes($nodes, $postId);
    }

    /**
     * Retrieve Tapestry post
     * 
     * @param type @postId The postId to be retrieved
     * @return type Tapestry post data
     */
    public function getTapestryPost($postId) {
        return $this->getTapestry($postId);
    }

    private function updateTapestry($post, $postId) {
        update_post_meta($postId, 'tapestry', $post);
    }

    private function updateNodes($nodes, $postId) {
        foreach ($nodes as $node) 
            update_post_meta($postId, 'node_'.$node['id'], $node);
    }
    
    private function getTapestry($postId) {
        $post = get_post_meta($postId, 'tapestry', true);
        $nodes = array_map(function($nodeId) use ($postId) {
            return get_post_meta($postId, 'node_'.$nodeId, true);
        }, $post['nodes']);

        $post['nodes'] = $nodes;
        return $post;
    }

    private function getNodeIds($nodes) {
        return array_map(function($node) {
            return $node['id'];
        }, $nodes);
    }

    private function insertPost($post) {
        return wp_insert_post(array(
            'post_type' => 'tapestry',
            'post_status' => 'publish',
            'post_content' => '',
            'post_title' => $post['settings']['tapestrySlug']
        ));
    }
}
