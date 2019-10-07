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
        if (!is_dir(__DIR__ . '/../h5p_uploads/')) {
            mkdir(__DIR__ . '/../h5p_uploads/');
        }
        if (!is_dir(__DIR__ . '/../h5p_uploads/' . $this->userId)) {
            mkdir(__DIR__ . '/../h5p_uploads/' . $this->userId);
        }

        $filename = md5('nodeMetaId-' . $this->nodeMetaId . '-'
            . 'tapestryPostId-' . $this->tapestryPostId) . '.wav';
        $decodedAudio = base64_decode($audio);

        if (file_put_contents(__DIR__ . '/../h5p_uploads/' . $this->userId . '/' . $filename, $decodedAudio)) {
            $this->_setNodeWithRecordedAudio();
            return $filename;
        } else {
            throw new TapestryError('FAILED_TO_SAVE_AUDIO');
        }
    }

    /**
     * Get the audio based on userId, tapestryPostId and nodeMetaId
     * 
     * @return  String  $audio      base64 data string
     */
    public function get()
    {
        $filename = md5('nodeMetaId-' . $this->nodeMetaId . '-'
            . 'tapestryPostId-' . $this->tapestryPostId) . '.wav';
        $audio = file_get_contents(__DIR__ . '/../h5p_uploads/' . $this->userId . '/' . $filename);
        $encodedAudio = base64_encode($audio);

        return $encodedAudio;
    }

    /**
     * Get all node IDs that have its audios recorded
     * 
     * @return  Array   nodeIds
     */
    public function getNodesWithRecordedAudios()
    {
        $tapestry = new Tapestry($this->tapestryPostId);
        $nodeIds = $tapestry->getNodeIds();
        $nodesWithRecordedAudios = [];

        foreach ($nodeIds as $nodeId) {
            $audioRecorded = get_user_meta($this->userId, 'tapestry_' . $this->tapestryPostId . '_node_with_recorded_audio_' . $nodeId, true);
            if (!empty($audioRecorded)) {
                array_push($nodesWithRecordedAudios, $nodeId);
            }
        }

        return $nodesWithRecordedAudios;
    }

    private function _setNodeWithRecordedAudio()
    {
        update_user_meta($this->userId, 'tapestry_' . $this->tapestryPostId . '_node_with_recorded_audio_' . $this->nodeMetaId, true);
    }
}
