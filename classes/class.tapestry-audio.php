<?php
require_once dirname(__FILE__) . "/../utilities/class.tapestry-errors.php";
require_once dirname(__FILE__) . "/../interfaces/interface.tapestry-audio.php";

class TapestryAudio implements ITapestryAudio
{
    /**
     * Constructor
     * 
     * @param   Number  $tapestryPostId tapestry post ID
     * @param   Number  $nodeMetaId node meta ID
     * 
     * @return  NULL
     */
    public function __construct($tapestryPostId = 0, $nodeMetaId = 0)
    {
        $this->tapestryPostId = (int) $tapestryPostId;
        $this->nodeMetaId = (int) $nodeMetaId;
        $this->userId = wp_get_current_user()->ID;
    }

    /**	
     * Save the audio
     *
     * @param   String  $audio      base64 data string
     * @return  String  $audioName
     */
    public function save($audio)
    {
        if ($this->userId == 0) {
            throw new TapestryError('INVALID_USER_ID');
        }
    }

    /**
     * Get the audio
     * 
     * @param   String  $audioName
     * @return  String  $audio      base64 data string
     */
    public function get($audioName)
    {
        // TO BE IMPLEMENTED
    }
}
