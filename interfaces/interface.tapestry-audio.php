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
     * @param   String  $audio      base64 data string
     * @return  Object  $audio
     */
    public function save($audio);

    /**
     * Get the audio
     *
     * @return  $audio    audio
     */
    public function get();
}
