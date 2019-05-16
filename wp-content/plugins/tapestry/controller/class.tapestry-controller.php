<?php
/**
 * Add/update/retrieve Tapestry post and its child nodes
 * 
 */
class TapestryController {
    /**
     * Retrieve a Tapestry post
     * 
     * @param  Number @postId The Tapestry postId
     * @return Object Tapestry
     */
    public function getTapestry($postId = null) {
        // TODO: Use $this->postId that's passed in the constructor
        // TODO: uncomment the two lines below for error handling
        // after the PR for saving tapestry is merged.
        /*
        if (!$this->_isValidPostId($postId)) {
            return $this->throwsError('INVALID_POST_ID');
        }
        */
        $tapestry = $this->_getTapestryById($postId);
        return $tapestry;
    }

    private function _getTapestryById($postId) {
        $tapestry = get_post_meta($postId, 'tapestry', true);

        $metadatas = array_map(function($nodeId) {
            return get_metadata_by_mid('post', $nodeId);
        }, $tapestry->nodes);

        $nodeDatas = array_map(function($metadata) {
            $postId = $metadata->meta_value->post_id;
            $nodeData = get_post_meta($postId, 'tapestry_node_data', true);
            return $this->_updateNodeData($nodeData, $metadata);
        }, $metadatas);

        $tapestry->nodes = $nodeDatas;

        // TODO: delete the below when being able to create tapestry from scratch
        $tapestry->links = $this->_getNewLinks($tapestry->links, $nodeDatas);
        return $tapestry;
    }

    private function _updateNodeData($nodeData, $metadata) {
        // Update node data here to match its own version
        // This enables the same node to have multiple versions
        $nodeData->id = (int) $metadata->meta_id;
        $nodeData->title = $metadata->meta_value->title;
        $nodeData->fx = $metadata->meta_value->coordinates->x;
        $nodeData->fy = $metadata->meta_value->coordinates->y;
        return $nodeData;
    }

    // TODO: Remove this when we can build a tapestry from scratch
    // HACK - create a new links array that works with new IDs
    private function _getNewLinks($oldLinks, $nodes) {
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

    // TODO: this function could be used as a utility function
    private function _isValidPostId($postId) {
        return isset($postId) && get_post_status($postId) != false;
    }
}