<?php
class TapestryController {
    public function updateTapestryPost($post, $postId = null) {
        if (is_null($postId)) $postId = $this->insertPost($post);
        $this->updateNodes($post['nodes'], $postId);

        $post['nodes'] = $this->getNodeIds($post['nodes']);
        $this->updateTapestry($post, $postId);
    }

    public function updateTapestryNodes($nodes, $postId = null) {
        if (is_null($postId)) throw new Exception('postId is invalid');
        $this->updateNodes($nodes, $postId);
    }

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
