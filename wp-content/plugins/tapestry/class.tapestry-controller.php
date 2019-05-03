<?php
class TapestryController {
    public function updateTapestryPost($post, $postId = null) {
        if (is_null($postId)) $postId = $this->insertPost($post);
        $post['nodes'] = $this->getNodeIds($post['nodes']);
        return $this->updateTapestry($post, $postId);
    }

    public function updateTapestryNode($node, $postId = null) {
        if (is_null($postId)) throw new Exception('postId is invalid');
        return $this->updateNode($node, $postId);
    }

    public function getTapestryPost($postId) {
        return $this->getTapestry($postId);
    }

    private function updateTapestry($post, $postId) {
        return update_post_meta($postId, 'tapestry', $post);
    }

    private function updateNode($node, $postId) {
        return update_post_meta($postId, 'node'.$node['id'], $node);
    }
    
    private function getTapestry($postId) {
        $post = get_post($postId);
        $postMeta = get_post_meta($postId, 'tapestry');
        return array('post' => $post, 'post_meta' => $postMeta);
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
