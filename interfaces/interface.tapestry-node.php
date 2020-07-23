<?php

/**
 * Tapestry Node Interface.
 */
interface ITapestryNode
{
    /**
     * Save the Tapestry node.
     *
     * @return object $node
     */
    public function save();

    /**
     * Set Node.
     *
     * @param object $node node
     *
     * @return null
     */
    public function set($node);

    /**
     * Get the node.
     *
     * @return $node node
     */
    public function get();
}
