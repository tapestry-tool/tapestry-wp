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
     * Update the existing Tapestry if the postId is provided
     * Otherwise, a new Tapestry will be created
     * 
     * @param  Object @tapestry The Tapestry data
     * @param  Number @postId The postId of the Tapestry
     * @return Object @tapestry
     */
    public function updateTapestry($tapestry, $postId = null) {
        // TODO: use isValidPostID() utlility function
        if (!isset($postId)) {
            $postId = $this->_updatePost($tapestry, 'tapestry');
        }
        $this->_updateNodes($tapestry->nodes, $postId);

        if (!isset($tapestry->rootId)) {
            $tapestry->rootId = $tapestry->nodes[0]->id;
        }
        $tapestry->nodes = $this->_getNodeIds($tapestry->nodes);

        update_post_meta($postId, 'tapestry', $tapestry);
        return $tapestry;
    }

    private function _updateNodes($nodes, $postId) {
        foreach ($nodes as $node) {
            if (!isset($node->id)) {
                $nodePostId = $this->_updatePost($node, 'tapestry_node');
                $metadata = $this->_makeMetadata($node, $nodePostId);
                $node->id = add_post_meta($postId, 'tapestry_node', $metadata);
            } else {
                $metadata = get_metadata_by_mid('post', $node->id)->meta_value;
                $nodePostId = $metadata->post_id;
            }
            update_post_meta($nodePostId, 'tapestry_node_data', $node);
        }
    }

    private function _updatePost($post, $type, $postId = null) {
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
        if (isset($postId)) {
            return wp_update_post(array(
                'ID' => $postId,
                'post_type' => $postType,
                'post_status' => $postStatus,
                'post_title' => $postTitle
            ), true);
        }
        return wp_insert_post(array(
            'post_type' => $postType,
            'post_status' => $postStatus,
            'post_title' => $postTitle
        ), true);
    }

    private function _throwsError($code) {
        $ERROR = (object) self::ERRORS[$code];
        return new WP_Error($code, $ERROR->MESSAGE, $ERROR->STATUS);
    }

    private function _getNodeIds($nodes) {
        return array_map(function($node) {
            return $node->id;
        }, $nodes);
    }

    private function _makeMetadata($node, $nodePostId) {
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
