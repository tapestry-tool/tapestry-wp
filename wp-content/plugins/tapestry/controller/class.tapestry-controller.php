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
    public function updateTapestry($post, $postId = null) {
        if (!isset($postId))
            $postId = $this->insertPost($post, 'tapestry');
        $this->updateNodes($post->nodes, $postId);

        // TODO: Groups and Permisisons data could be added here later

        if (!isset($post->rootId))
            $post->rootId = $post->nodes[0]->id;

        $post->nodes = $this->getNodeIds($post->nodes);
        update_post_meta($postId, 'tapestry', $post);
        return $post;
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
        return $nodes;
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

    private function updateNodes($nodes, $postId) {
        foreach ($nodes as $node) {
            if (!isset($node->id)) {
                $nodePostId = $this->insertPost($node, 'tapestry_node');
                $metadata = $this->makeMetadata($node, $nodePostId);
                $node->id = add_post_meta($postId, 'tapestry_node', $metadata);
            } else {
                $metadata = get_metadata_by_mid('post', $node->id)->meta_value;
                $nodePostId = $metadata->post_id;
            }
            update_post_meta($nodePostId, 'tapestry_node_data', $node);
        }
    }

    private function makeMetadata($node, $nodePostId) {
        return (object) array(
            'post_id' => $nodePostId,
            'title' => $node->title,
            'coordinates' => (object) array(
                'x' => $node->fx,
                'y' => $node->fy
            )
        );
    }
    
    private function getTapestry($postId) {
        $post = get_post_meta($postId, 'tapestry', true);
        $metadatas = array_map(function($nodeId) {
            return get_metadata_by_mid('post', $nodeId)->meta_value;
        }, $post->nodes);
        $nodeDatas = array_map(function($metadata) {
            $nodeData = get_post_meta($metadata->post_id, 'tapestry_node_data', true);
            return $this->updateNodeData($nodeData, $metadata);
        }, $metadatas);

        $post->nodes = $nodeDatas;

        // TODO: delete the below when being able to create tapestry from scratch
        $post->links = $this->getNewLinks($post->links, $nodeDatas);
        return $post;
    }

    private function updateNodeData($nodeData, $metadata) {
        // Update node data here to match its own version
        // This enables the same node to have multiple versions
        $nodeData->title = $metadata->title;
        $nodeData->fx = $metadata->coordinates->x;
        $nodeData->fy = $metadata->coordinates->y;
        return $nodeData;
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
        ), true);
    }

    // TODO: Remove this when we can build a tapestry from scratch
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
