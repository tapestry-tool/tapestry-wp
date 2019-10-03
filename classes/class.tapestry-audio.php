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
        $filename = md5('nodeMetaId-' . $this->nodeMetaId . '-'
            . 'tapestryPostId-' . $this->tapestryPostId) . '.wav';
        $decodedAudio = base64_decode($audio);

        if (!is_dir(__DIR__ . '/../h5p_uploads/')) {
            mkdir(__DIR__ . '/../h5p_uploads/');
        }
        if (!is_dir(__DIR__ . '/../h5p_uploads/' . $this->userId)) {
            mkdir(__DIR__ . '/../h5p_uploads/' . $this->userId);
        }

        file_put_contents(__DIR__ . '/../h5p_uploads/' . $this->userId . '/' . $filename, $decodedAudio);
        return $filename;
    }

    /**
     * Get the audio
     * 
     * @return  String  $audio      base64 data string
     */
    public function get()
    {
        // TO BE IMPLEMENTED
    }
}
