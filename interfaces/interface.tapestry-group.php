<?php

/**
 * Tapestry Group Interface.
 */
interface ITapestryGroup
{
    /**
     * Save the Tapestry group.
     *
     * @return object $group
     */
    public function save();

    /**
     * Get the Tapestry group.
     *
     * @return object $group
     */
    public function get();
}
