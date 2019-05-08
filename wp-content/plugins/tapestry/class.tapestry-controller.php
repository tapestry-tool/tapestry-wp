<?php
/**
 * Add/update/retrieve Tapestry post and its child nodes
 * 
 */
class TapestryController {
    const POST_TYPES = array(
        'TAPESTRY' => 'tapestry',
        'TAPESTRY_NODE' => 'tapestry_node'
    );

    /**
     * Update Tapestry nodes first then
     * Update the existing Tapestry post if the postId is provided
     * Otherwise, a new post will be created
     * 
     * @param type @post The post data
     * @param type @postId The postId of the Tapestry
     */
    public function updateTapestryPost($post, $postId = null) {
        $this->updateNodes($post->nodes);
        $post->nodes = $this->getNodeIds($post->nodes);

        if (!isset($postId)) {
            $post->groups = [];
            $post->rootId = $post->nodes[0];
            $postId = $this->insertPost($post, 'tapestry');
        }
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
        if (is_null($postId))
            throw new Exception('postId is invalid');
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

    private function updateNodes($nodes) {
        foreach ($nodes as $node) {
            if (!isset($node->id))
                $node->id = $this->insertPost($node, 'tapestry_node');
            update_post_meta($node->id, 'tapestry_node', $node);
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

    private function insertPost($post, $type) {
        switch($type) {
            case self::POST_TYPES['TAPESTRY_NODE']:
                $postType = $post->type;
                $postTitle = $post->title;
                $postStatus = $post->status;
                break;
            case self::POST_TYPES['TAPESTRY']:
            default:
                $postType = $post->settings->type;
                $postTitle = $post->settings->title;
                $postStatus = $post->settings->status;
                break;
        }
        return wp_insert_post(array(
            'post_type' => $postType,
            'post_status' => $postStatus,
            'post_title' => $postTitle
        ));
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
