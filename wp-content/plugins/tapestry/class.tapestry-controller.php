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
     */
    public function updateTapestryPost($post) {
        if (!isset($post->rootId))
        $post->rootId = $this->insertPost($post);
        $this->updateNodes($post->nodes, $post->rootId);

        $post->nodes = $this->getNodeIds($post->nodes);
        $this->updateTapestry($post, $post->rootId);
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
        foreach ($nodes as $node) {
            if (!isset($node->id)) {
                $node->id = add_post_meta($postId, 'node', $node);
                $this->updateMetaKey($node->id, 'node', 'node_'.$node->id);
            }
            update_post_meta($postId, 'node_'.$node->id, $node);
        }
    }
    
    private function getTapestry($postId) {
        $post = get_post_meta($postId, 'tapestry', true);
        $nodes = array_map(function($nodeId) use ($postId) {
            return get_post_meta($postId, 'node_'.$nodeId, true);
        }, $post->nodes);

        $post->nodes = $nodes;

        // TODO: delete the below
        $post->links = $this->getNewLinks($post->links, $nodes);
        return $post;
    }

    private function getNodeIds($nodes) {
        return array_map(function($node) {
            return $node->id;
        }, $nodes);
    }

    private function insertPost($post) {
        return wp_insert_post(array(
            'post_type' => 'tapestry',
            'post_status' => 'publish',
            'post_content' => '',
            'post_title' => $post->settings->tapestrySlug
        ));
    }

    private function updateMetaKey($metaId, $oldKey = null, $newKey = null) {
        global $wpdb;
        $query = "UPDATE ".$wpdb->prefix."postmeta SET meta_key = '".$newKey."' 
            WHERE meta_id = '".$metaId."' AND meta_key = '".$oldKey."'";
        $wpdb->query($query);
    }

    // TODO: Remove this when done
    // HACK - create a new links array that works with new IDs
    private function getNewLinks($oldLinks, $nodes) {
        $mappings = array(
            1 => $nodes[0]->id,
            2 => $nodes[1]->id,
            3 => $nodes[2]->id,
            4 => $nodes[3]->id,
            5 => $nodes[4]->id,
            6 => $nodes[5]->id,
            8 => $nodes[6]->id,
            9 => $nodes[7]->id,
            7 => $nodes[8]->id,
            10 => $nodes[9]->id
        );
        $newLinks = array_map(function($link) use ($mappings) {
            $link->source = $mappings[$link->source];
            $link->target = $mappings[$link->target];
            $link->value = $mappings[$link->value];
            return $link;
        }, $oldLinks);

        return $newLinks;
    }
}
