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
    private $postId;

    /**
     * Constructor
     */
    public function __construct($postId = 0) {
        if ($postId != 0 && is_numeric($postId)) {
            if (get_post_type($postId) != 'tapestry') {
                return $this->_throwsError('INVALID_POST_ID');
            }
        }
        $this->postId = $postId;
    }

    /**
     * Update Tapestry nodes first then
     * Update the existing Tapestry if the postId is provided
     * Otherwise, a new Tapestry will be created
     * 
     * @param  Object @tapestry The Tapestry data
     * @return Object @tapestry
     */
    public function updateTapestry($tapestry) {
        // TODO: use isValidPostID() utlility function
        if (!isset($this->postId)) {
            $this->postId = $this->_updatePost($tapestry, 'tapestry');
        }

        $this->_updateNodes($tapestry->nodes);

        if (!isset($tapestry->rootId) && !empty($tapestry->nodes)) {
            $tapestry->rootId = $tapestry->nodes[0]->id;
        }

        $tapestry->nodes = $this->_getNodeIds($tapestry->nodes);

        update_post_meta($this->postId, 'tapestry', $tapestry);
        return $tapestry;
    }

    /**
     * Update Tapestry settings
     * 
     * @param  Object @settings - New Tapestry settings
     * @param  Number @postId   - The Tapestry postId
     * @return Object New Tapestry settings
     */
    public function updateTapestrySettings($settings) {
        if (!$this->postId) {
            return $this->_throwsError('INVALID_POST_ID');
        }

        $tapestry = get_post_meta($this->postId, 'tapestry', true);
        $tapestry->settings = $settings;

        $this->_updatePost($tapestry, 'tapestry');

        update_post_meta($this->postId, 'tapestry', $tapestry);
        return $tapestry->settings;
    }

    private function _updateNodes($nodes) {
        foreach ($nodes as $node) {
            if (!isset($node->id)) {
                $nodePostId = $this->_updatePost($node, 'tapestry_node');
                $metadata = $this->_makeMetadata($node, $nodePostId);
                $node->id = add_post_meta($this->postId, 'tapestry_node', $metadata);
            } else {
                $metadata = get_metadata_by_mid('post', $node->id)->meta_value;
                $nodePostId = $metadata->post_id;
            }
            update_post_meta($nodePostId, 'tapestry_node_data', $node);
        }
    }

    private function _updatePost($post, $postType = 'tapestry', $postId = null) {
        switch($postType) {
            case self::POST_TYPES['TAPESTRY_NODE']:
                $postTitle = $post->title;
                $postStatus = $post->status;
                break;
            case self::POST_TYPES['TAPESTRY']:
            default:
                $postId = $this->postId;
                $postTitle = $post->settings->title;
                $postStatus = $post->settings->status;
                break;
        }
        return wp_insert_post(array(
            'ID' => $postId,
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
