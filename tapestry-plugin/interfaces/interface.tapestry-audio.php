<?php

/**
 * Tapestry Audio Interface.
 */
interface ITapestryAudio
{
    /**
     * Save the audio.
     *
     * @param string $audio base64 data string
     *
     * @return object $audio
     */
    public function save($audio);

    /**
     * Get the audio.
     *
     * @return $audio audio
     */
    public function get();
}
