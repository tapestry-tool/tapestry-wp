<?php

/**
 * Tapestry Audio Interface
 * 
 */
interface ITapestryAudio
{
    /**	
     * Save the audio
     *
     * @return  Object  $audio
     */
    public function save();

    /**
     * Get the audio
     * 
     * @return  $audio    audio
     */
    public function get();
}
