<?php
/**
 * Add/update/retrieve Tapestry post and its child nodes
 * 
 */

class TapestryController {
    const POST_TYPES = [
        'TAPESTRY' => 'tapestry',
        'TAPESTRY_NODE' => 'tapestry_node'
    ];
    const ERRORS = [
        'INVALID_POST_ID' => [
            'MESSAGE' => 'PostID is invalid',
            'STATUS' => ['status' => 404]
        ]
    ];

    /**
     * Update Tapestry nodes first then
     * Update the existing Tapestry post if the postId is provided
     * Otherwise, a new post will be created
     * 
     * @param type @post The post data
     * @param type @postId The postId of the Tapestry
     */
    public function updateTapestry($tapestry, $postId = null) {
        // TODO: check if $tapestry param is a valid JSON
        if (!isset($postId)) {
            $postId = $this->insertPost($tapestry, 'tapestry');
        }
        $this->updateNodes($tapestry->nodes, $postId);

        // TODO: Groups and Permisisons data could be added here later

        if (!isset($tapestry->rootId)) {
            $tapestry->rootId = $tapestry->nodes[0]->id;
        }
        $tapestry->nodes = $this->getNodeIds($tapestry->nodes);
        update_post_meta($postId, 'tapestry', $tapestry);
        return $tapestry;
    }

    /**
     * Update Tapestry post's child nodes
     * 
     * @param type @nodes An array of child nodes to be updated
     * @param type @postId The post ID to which the nodes belong
     * @return WP_Error if postId is invalid
     */
    public function updateTapestryNodes($nodes, $postId = null) {
        // TODO: check if $nodes param is a valid JSON
        if (!isset($postId)) {
            return $this->throwsError('INVALID_POST_ID');
        }
        $this->updateNodes($nodes, $postId);
        return $nodes;
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

    private function throwsError($code) {
        $ERROR = (object) self::ERRORS[$code];
        return new WP_Error($code, $ERROR->MESSAGE, $ERROR->STATUS);
    }

    private function getNodeIds($nodes) {
        return array_map(function($node) {
            return $node->id;
        }, $nodes);
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
}
