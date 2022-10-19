<?php

require_once dirname(__FILE__).'/../interfaces/interface.tapestry-h5p.php';

if (!defined('H5P_DEFINED')) {
    define(
        'H5P_DEFINED',
        file_exists(__DIR__.'/../../h5p/public/class-h5p-plugin.php')
    );

    if (H5P_DEFINED) {
        include_once __DIR__.'/../../h5p/public/class-h5p-plugin.php';
    }
}

class TapestryH5P implements ITapestryH5P
{
    private $postId;

    public function __construct($postId = null)
    {
        $this->postId = $postId;
    }

    /**
     * Returns the id and titles of all available h5p content.
     *
     * @return array $content All available content
     */
    public function get()
    {
        global $wpdb;
        $content = $wpdb->get_results('select content.id as id, content.title as title, content.filtered as details, name as library from '.$wpdb->prefix.'h5p_contents content join '.$wpdb->prefix.'h5p_libraries lib on content.library_id = lib.id');

        return $content;
    }

    /**
     * Gets the id and slug of an H5P content, by id.
     *
     * @param string|int    H5P id
     *
     * @return object|null an object containing the id and slug of the H5P content,
     *                     or null if not found
     */
    public static function getH5P($id)
    {
        global $wpdb;

        $sql = $wpdb->prepare('SELECT content.id as id, content.slug as slug
                                FROM '.$wpdb->prefix.'h5p_contents content
                                WHERE content.id = %d;', (int) $id);

        $h5p_content = $wpdb->get_row($sql);

        return $h5p_content;
    }

    public static function getMetadata($id)
    {
        global $wpdb;

        // Library fields have nothing to do with the content metadata, but updateContent requires them for event logging so return them anyway
        $sql = $wpdb->prepare('SELECT content.*, libraries.name as library_name, libraries.major_version, libraries.minor_version
                                FROM '.$wpdb->prefix.'h5p_contents content
                                JOIN '.$wpdb->prefix.'h5p_libraries libraries
                                ON content.library_id = libraries.id
                                WHERE content.id = %d;', (int) $id);

        $result = $wpdb->get_row($sql);

        return $result;
    }

    /**
     * Updates the video source of an H5P content.
     *
     * @param TapestryNode $node        H5P node
     * @param string       $newVideoUrl New video source
     */
    public static function updateVideoURL($node, $newVideoUrl)
    {
        if (!H5P_DEFINED) {
            return;
        }

        $h5pId = self::getH5PIdFromMediaURL($node->getTypeData()->mediaURL);
        $metadata = self::getMetadata($h5pId);
        $params = json_decode($metadata->parameters);
        $params->interactiveVideo->video->files[0]->path = $newVideoUrl;

        $h5pInterface = H5P_Plugin::get_instance()->get_h5p_instance('interface');
        $h5pInterface->updateContent([
            'id' => $h5pId,
            'metadata' => $metadata,
            'params' => json_encode($params),
            'disable' => $metadata->disable,
            'library' => [
                'libraryId' => $metadata->library_id,
                'machineName' => $metadata->library_name,
                'majorVersion' => $metadata->major_version,
                'minorVersion' => $metadata->minor_version,
            ],
        ]);
    }

    /**
     * Gets the H5P id from the mediaURL of an H5P node
     * Example: extracts '3' from 'http://localhost/wordpress/wp-admin/admin-ajax.php?action=h5p_embed&id=3'.
     *
     * @param string $mediaURL
     *
     * @return string
     */
    public static function getH5PIdFromMediaURL($mediaURL)
    {
        $urlParts = explode('&id=', $mediaURL);

        return count($urlParts) >= 2 ? $urlParts[1] : null;
    }

    /**
     * Gets the video source (URL or path) from an H5P content, by the H5P ID.
     *
     * @param string|int $h5pId
     *
     * @return string|null Returns null if the H5P ID is invalid or the H5P is not an interactive video
     */
    private static function _getH5PVideoURL($h5pId)
    {
        $controller = new TapestryH5P();
        $content = json_decode($controller::getMetadata($h5pId)->parameters);

        if (isset($content->interactiveVideo)) {
            return $content->interactiveVideo->video->files[0]->path;
        }

        return null;
    }
}
