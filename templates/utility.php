<?php
/**
 * Tapestry Utility functions
 *
 */

/**
 * Determine if the tapestry has nodes
 * 
 * @param Integer $postId Post ID
 * 
 * @return Boolean  
 */ 
function doesTapestryHaveNodes($postId)
{
    $tapestryController = new TapestryController($postId);
    $nodeIds = $tapestryController->getTapestryNodeIds();

    if (isset($nodeIds) && count($nodeIds) > 0 ) {
        return true;
    } else {
        return false;
    }
}
?>