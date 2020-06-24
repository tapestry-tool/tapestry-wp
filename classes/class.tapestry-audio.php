<?php
require_once dirname(__FILE__) . "/../utilities/class.tapestry-errors.php";
require_once dirname(__FILE__) . "/../interfaces/interface.tapestry-audio.php";

/**
 * Update/retrieve H5P audio of a node for a user
 *
 */
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
    public function __construct($tapestryPostId = 0, $nodeMetaId = 0, $questionId = 0)
    {
        $this->tapestryPostId = (int) $tapestryPostId;
        $this->nodeMetaId = (int) $nodeMetaId;
        $this->questionId = $questionId;
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
        $upload_dir = wp_upload_dir();
        $tapestry_upload_dir = $upload_dir['basedir'] . '/tapestry';
        if (!file_exists($tapestry_upload_dir)) {
            wp_mkdir_p($tapestry_upload_dir);
        }
        $tapestry_user_upload_dir = $tapestry_upload_dir . '/' . $this->userId;
        if (!file_exists($tapestry_user_upload_dir)) {
            wp_mkdir_p($tapestry_user_upload_dir);
        }

        $filename = $this->_getFileName();

        $decodedAudio = base64_decode($audio);

        if (file_put_contents($tapestry_user_upload_dir . '/' . $filename, $decodedAudio)) {
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
        $filename = $this->_getFileName();

        $upload_dir = wp_upload_dir();
        if ($upload_dir['error'] === false) {
            $audio = file_get_contents($upload_dir['basedir'] . '/tapestry/' . $this->userId . '/' . $filename);
            $encodedAudio = base64_encode($audio);
            return $encodedAudio;
        } else {
            error_log('Error getting user audio for tapestry: ' . $upload_dir['error']);
            return $upload_dir['error'];
        }
    }

    public function audioExists()
    {
        $filename = $this->_getFileName();
        $upload_dir = wp_upload_dir();
        return file_exists($upload_dir['basedir'] . '/tapestry/' . $this->userId . '/' . $filename);
    }

    private function _getFileName()
    {
        return md5('tapestryPostId-' . $this->tapestryPostId . '-'
            . 'nodeMetaId-' . $this->nodeMetaId . '-'
            . 'questionId-' . $this->questionId . '-'
            . 'userId-' . $this->userId)
            . '.ogg';
    }
}
