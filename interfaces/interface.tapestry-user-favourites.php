<?php

/**
 * Tapestry Interface
 * 
 */
interface ITapestryUserFavourites
{

    /**
     * Get User's favourite nodes from a tapestry post
     *
     * @return Array $nodes  node ids which are favourites
     */
    public function get();

    /**
     * Update User's favourite nodes for a tapestry post
     *
     * @param Array $favourites update the favourite nodes
     *
     * @return Null
     */
    public function updateFavourites($favourites);
}