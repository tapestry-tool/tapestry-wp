<?php

require_once dirname(__FILE__).'/class.tapestry-node-permissions.php';
require_once dirname(__FILE__).'/../classes/class.tapestry-h5p.php';
require_once dirname(__FILE__).'/../classes/class.constants.php';
require_once dirname(__FILE__).'/../../h5p/public/class-h5p-plugin.php';
// TODO: handle case where the plugin doesn't exist
// TODO: make the file path cleaner

/**
 * Tapestry Helper Functions.
 */
class TapestryHelpers
{
    public const POST_TYPES = [
        'TAPESTRY' => 'tapestry',
        'TAPESTRY_NODE' => 'tapestry_node',
    ];

    /**
     * Check if tapestry is valid.
     *
     * @param Number $postId postID
     *
     * @return bool
     */
    public static function isValidTapestry($postId)
    {
        return is_numeric($postId) && 'tapestry' == get_post_type($postId);
    }

    /**
     * Check if tapestry node is valid.
     *
     * @param Number $nodeMetaId node meta ID
     *
     * @return bool
     */
    public static function isValidTapestryNode($nodeMetaId)
    {
        if (is_numeric($nodeMetaId)) {
            $nodeMetadata = get_metadata_by_mid('post', $nodeMetaId);
            if ((!empty($nodeMetadata->meta_value))
                && (!empty($nodeMetadata->meta_value->post_id))
            ) {
                $nodePostId = $nodeMetadata->meta_value->post_id;

                return 'tapestry_node' == get_post_type($nodePostId);
            }
        }

        return false;
    }

    /**
     * Check if tapestry group is valid.
     *
     * @param Number $groupMetaId group meta ID
     *
     * @return bool
     */
    public static function isValidTapestryGroup($groupMetaId)
    {
        if (is_numeric($groupMetaId)) {
            $groupMetadata = get_metadata_by_mid('post', $groupMetaId);

            return is_object($groupMetadata->meta_value)
                && 'tapestry_group' == $groupMetadata->meta_value->type;
        }

        return false;
    }

    /**
     * Check if the node is a child of a tapestry.
     *
     * @param Number $nodeMetaId     node meta ID
     * @param Number $tapestryPostId post ID
     *
     * @return bool
     */
    public static function isChildNodeOfTapestry($nodeMetaId, $tapestryPostId)
    {
        if (is_numeric($nodeMetaId) && self::isValidTapestry($tapestryPostId)) {
            $tapestry = get_post_meta($tapestryPostId, 'tapestry', true);

            return in_array($nodeMetaId, $tapestry->nodes);
        }

        return false;
    }

    /**
     * Get all group ids of a user.
     *
     * @param Number $userId         user ID
     * @param Number $tapestryPostId post ID
     *
     * @return array $groupIds
     */
    public static function getGroupIdsOfUser($userId, $tapestryPostId)
    {
        $groupIds = [];
        $tapestry = get_post_meta($tapestryPostId, 'tapestry', true);

        if (!empty($tapestry->groups)) {
            foreach ($tapestry->groups as $groupId) {
                $groupMetadata = get_metadata_by_mid('post', $groupId)->meta_value;
                if (in_array($userId, $groupMetadata->members)) {
                    array_push($groupIds, $groupId);
                }
            }
        }

        return $groupIds;
    }

    /**
     * Update post.
     *
     * @param object $post     post object
     * @param string $postType post type
     * @param Number $postId   post ID
     *
     * @return Number $postId
     */
    public static function updatePost($post, $postType = 'tapestry', $postId = 0, $author = 0)
    {
        switch ($postType) {
            case self::POST_TYPES['TAPESTRY_NODE']:
                $postTitle = $post->title;
                $postStatus = $post->status;
                break;
            case self::POST_TYPES['TAPESTRY']:
            default:
                $postId = $postId;
                $postTitle = $post->settings->title;
                $postStatus = $post->settings->status;
                break;
        }

        if (!$author) {
            $author = wp_get_current_user()->ID;
        }

        return wp_insert_post([
            'ID' => $postId,
            'post_author' => $author,
            'post_type' => $postType,
            'post_status' => $postStatus,
            'post_title' => $postTitle,
        ], true);
    }

    /**
     * Uploads the given image (by URL) as a Wordpress attachment and  returns the
     * attachment ID for the new attachment. If the given URL is already an attachment
     * in WP, it returns its existing attachment ID instead of re-uploading it.
     *
     * @param string $imageURL
     *
     * @return string $attachment_id
     */
    public static function attachImageByURL($imageURL)
    {
        // is this already an image in our gallery?
        $attachment_id = attachment_url_to_postid($imageURL);
        if ($attachment_id) {
            return $attachment_id;
        }

        // not an image in our gallery. let's upload it.
        $imagetype = end(explode('/', getimagesize($imageURL)['mime']));
        $uniq_name = date('dmY').''.(int) microtime(true);
        $filename = $uniq_name.'.'.$imagetype;

        $uploaddir = wp_upload_dir();
        $uploadfile = $uploaddir['path'] . '/' . $filename;
        $contents= file_get_contents($imageURL);
        $savefile = fopen($uploadfile, 'w');
        fwrite($savefile, $contents);
        fclose($savefile);

        return self::_createAttachment($uploadfile, true);
    }

    private static function _createAttachment($filepath, $generate_metadata = false)
    {
        include_once(ABSPATH . 'wp-admin/includes/image.php');

        $filename = basename($filepath);
        $wp_filetype = wp_check_filetype($filename, null);
        $attachment = array(
            'post_mime_type' => $wp_filetype['type'],
            'post_title' => $filename,
            'post_content' => '',
            'post_status' => 'inherit'
        );

        $attachment_id = wp_insert_attachment($attachment, $filepath);

        if ($generate_metadata) {
            $imagenew = get_post($attachment_id);
            $fullsizepath = get_attached_file($imagenew->ID);
            $attach_data = wp_generate_attachment_metadata($attachment_id, $fullsizepath);
            wp_update_attachment_metadata($attachment_id, $attach_data);
        }

        return $attachment_id;
    }

    /**
     * Check if the current user is allowed to an action to a node.
     *
     * @param string $action         action to be performed
     * @param Number $nodeMetaId     node meta ID
     * @param Number $tapestryPostId post ID
     *
     * @return bool
     */
    public static function userIsAllowed($action, $nodeMetaId, $tapestryPostId, $superuser_override = true, $_userId = null)
    {
        $options = TapestryNodePermissions::getNodePermissions();
        $nodePostId = get_metadata_by_mid('post', $nodeMetaId)->meta_value->post_id;

        $tapestry = new Tapestry($tapestryPostId);
        $node = $tapestry->getNode($nodeMetaId);

        $userId = $_userId;
        if (is_null($userId)) {
            $userId = wp_get_current_user()->ID;
        }
        $groupIds = self::getGroupIdsOfUser($userId, $tapestryPostId);
        $user = new TapestryUser($userId);

        // If node is submitted or accepted, users without edit access cannot edit node
        $isEditableReviewStatus = isset($node->reviewStatus) && ($node->reviewStatus === "submitted" || $node->reviewStatus === "accepted");
        if ($action === "EDIT" && $isEditableReviewStatus && !$user->canEdit($tapestryPostId)) {
            return false;
        }

        if ($user->canEdit($tapestryPostId) && $superuser_override) {
            return true;
        } elseif ($user->isAuthorOfThePost($nodePostId) && $node->getMeta()->status === "draft" && $node->getMeta()->reviewStatus !== "submitted") {
            return true;
        } elseif ($user->isAuthorOfThePost($nodePostId) && $node->getMeta()->reviewStatus === "submitted" && $action === 'MOVE') {
            return true;
        } else {
            $nodePermissions = get_metadata_by_mid('post', $nodeMetaId)->meta_value->permissions;
            if (
                property_exists($nodePermissions, 'user-'.$userId) &&
                in_array($options[$action], $nodePermissions->{'user-'.$userId})
            ) {
                return true;
            } elseif (
                property_exists($nodePermissions, 'public') &&
                in_array($options[$action], $nodePermissions->public)
            ) {
                return true;
            } elseif (
                is_user_logged_in() &&
                property_exists($nodePermissions, 'authenticated') &&
                in_array($options[$action], $nodePermissions->authenticated)
            ) {
                return true;
            } elseif (is_user_logged_in()) {
                $roles = wp_get_current_user()->roles;
                foreach ($roles as $role) {
                    if (
                        property_exists($nodePermissions, $role) &&
                        in_array($options[$action], $nodePermissions->$role)
                    ) {
                        return true;
                    }
                }
            } else {
                foreach ($groupIds as $groupId) {
                    if (
                        (property_exists($nodePermissions, 'group-'.$groupId))
                        && (in_array($options[$action], $nodePermissions->{'group-'.$groupId}))
                    ) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    /**
     * Check if node is a draft node
     *
     * @param Number $nodeMetaId     node meta ID
     * @param Number $tapestryPostId post ID
     *
     * @return bool
     */
    public static function nodeIsDraft($nodeMetaId, $tapestryPostId)
    {
        $node = new TapestryNode($tapestryPostId, $nodeMetaId);
        return $node->getMeta()->status == "draft";
    }

    /**
     * Check if neighbour node is published
     *
     * @param Number $nodeMetaId     node meta ID
     * @param Number $tapestryPostId post ID
     *
     * @return bool
     */
    public static function nodeNeighbourIsPublished($nodeMetaId, $tapestryPostId)
    {
        $tapestry = new Tapestry($tapestryPostId);
        foreach ($tapestry->getLinks() as $link) {
            if (($link->target == $nodeMetaId && !TapestryHelpers::nodeIsDraft($link->source, $tapestryPostId))||
                ($link->source == $nodeMetaId && !TapestryHelpers::nodeIsDraft($link->target, $tapestryPostId))) {
                return true;
            }
        }
        return false;
    }

    public static function prepareImport($tapestry_data)
    {
        $changes = [];
        $wp_roles = self::getAllRoles();
        foreach ($tapestry_data->nodes as $node) {
            $node->permissions = self::_filterImportedPerms($node->permissions, $wp_roles, $changes);
        }
        if ($tapestry_data->settings) {
            $tapestry_data->settings->defaultPermissions = self::_filterImportedPerms(
                $tapestry_data->settings->defaultPermissions,
                $wp_roles,
                $changes
            );
        }

        return $changes;
    }

    private static function _filterImportedPerms($permissions, $roles, $changes)
    {
        $filteredRoles = array_filter(array_keys($permissions), function ($key) use ($roles) {
            return in_array($key, $roles);
        });

        $filteredPerms = [];
        
        foreach ($filteredRoles as $role) {
            $filteredPerms[$role] = $permissions[$role];
        }

        foreach ($permissions as $key => $value) {
            if (!array_key_exists($key, $filteredPerms)) {
                array_push($changes, $key);
            }
        }

        return $filteredPerms;
    }

    public static function getAllRoles()
    {
        global $wp_roles;

        $roles = array_merge(
            $wp_roles->roles,
            ['public' => true, 'authenticated' => true]
        );
        unset($roles['administrator']);

        return array_keys($roles);
    }

    public static function validateTapestryData($tapestry_data)
    {
        if (empty($tapestry_data)) {
            throw new TapestryError('Invalid tapestry data: Not valid JSON');
        }

        $properties = ['nodes', 'links', 'site-url'];
        foreach ($properties as $property) {
            if (!property_exists($tapestry_data, $property)) {
                throw new TapestryError('Invalid tapestry data: Missing property ' . $property);
            }
        }
    }

    public static function exportExternalMedia($tapestry_data)
    {
        $result = self::_createExportZip();
        $zip = $result['zip'];
        $zip_url = $result['zip_url'];

        $h5p_controller = new TapestryH5P();
        foreach ($tapestry_data->nodes as $node) {
            if ($node->mediaType === 'h5p') {
                self::_exportH5PNode($node, $zip, $h5p_controller);
            } elseif ($node->mediaType === 'video') {
                self::_exportMedia($node->typeData->mediaURL, $zip);
            } elseif ($node->mediaType === 'activity') {
                self::_exportActivityNode($node, $zip);
            }

            self::_exportMedia($node->imageURL, $zip, $node->thumbnailFileId);
            self::_exportMedia($node->lockedImageURL, $zip, $node->lockedThumbnailFileId);

            self::_exportMedia($tapestry_data->settings->backgroundUrl, $zip);
        }

        $zip->addFromString('tapestry.json', json_encode($tapestry_data));
        $zip->close();

        return $zip_url;
    }

    private static function _createExportZip()
    {
        $wp_upload_dir = wp_upload_dir();

        $tapestry_export_dir = $wp_upload_dir['path'].'/tapestry_export/';
        if (!file_exists($tapestry_export_dir)) {
            mkdir($tapestry_export_dir);
        }

        $zip = new ZipArchive();

        // TODO: generate the name, maybe from the title
        $zip_name = 'export.zip';

        $zip_path = $tapestry_export_dir.$zip_name;
        $zip_url = $wp_upload_dir['url'].'/tapestry_export/'.$zip_name;

        if ($zip->open($zip_path, ZipArchive::CREATE) !== true) {
            throw new TapestryError('Could not open zip file ' . $zip_path);
        }

        return [
            'zip' => $zip,
            'zip_url' => $zip_url,
        ];
    }

    private static function _exportH5PNode($node, $zip, $h5p_controller)
    {
        // TODO: check the existence of these properties?
        $h5p_id = $node->typeData->h5pMeta->id;
        $h5p_data = $h5p_controller->getH5P($h5p_id);

        if ($h5p_data !== null) {
            $h5p_name = $h5p_data->slug.'-'.$h5p_data->id.'.h5p';       // TODO: see if we can avoid hardcoding the file name
            $h5p_path = H5P_Plugin::get_instance()->get_h5p_path().'/exports/'.$h5p_name;

            $zip->addFile($h5p_path, $h5p_name);

            $node->typeData->mediaURL = $h5p_name;
        }
    }

    private static function _exportActivityNode($node, $zip)
    {
        // TODO: this will result in lingering activity data not being cleared. Can/should we clear it, in case?

        foreach ($node->typeData->activity->questions as $question) {
            // TODO: check the existence of these properties?
            $multiple_choice = $question->answerTypes->multipleChoice;
            if ($multiple_choice->enabled && $multiple_choice->useImages && isset($multiple_choice->choices)) {
                foreach ($multiple_choice->choices as $choice) {
                    self::_exportMedia($choice->imageUrl, $zip);
                }
            }

            $drag_drop = $question->answerTypes->dragDrop;
            if ($drag_drop->enabled && $drag_drop->useImages && isset($drag_drop->items)) {
                foreach ($drag_drop->items as $item) {
                    self::_exportMedia($item->imageUrl, $zip);
                }
            }
        }
    }

    private static function _exportMedia(&$media_url, $zip, $file_id = null)
    {
        if (!empty($file_id)) {
            // Retrieve the original file, not the resized version
            $path_to_media = get_attached_file($file_id);

            // File ID no longer applies, clear it
            $file_id = '';

            if ($path_to_media !== false) {
                $media_name = $attachment_data['file'];
            } else {
                // TODO: should we skip or try again?
                // TODO: use attachment_url_to_postid?
                // file ID not found
                return;
            }
        } else {
            $path_to_media = self::_getLocalPath($media_url);
            if ($path_to_media) {
                if (file_exists($path_to_media) && is_file($path_to_media)) {
                    $media_name = basename($path_to_media);
                } else {
                    error_log('Warning: the URL ' . $media_url . ' is a local upload, but no file exists here.');
                    $media_url = '';
                    return;
                }
            } else {
                // file does not exist locally; skip
                return;
            }
        }

        $zip->addFile($path_to_media, $media_name);
        $media_url = $media_name;
    }

    public static function importExternalMedia($tapestry_data, $temp_dir, $temp_url)
    {
        foreach ($tapestry_data->nodes as $node) {
            if ($node->mediaType === 'h5p') {
                self::_importH5PNode($node, $temp_url);
            } elseif ($node->mediaType === 'video') {
                self::_importMedia($node->typeData->mediaURL, $temp_dir);
            } elseif ($node->mediaType === 'activity') {
                self::_importActivityNode($node, $temp_dir);
            }

            self::_importMedia($node->imageURL, $temp_dir, true, $node->thumbnailFileId);
            self::_importMedia($node->lockedImageURL, $temp_dir, true, $node->lockedThumbnailFileId);

            self::_importMedia($tapestry_data->settings->backgroundUrl, $temp_dir);
        }

        // TODO: this doesn't work, probably because we're not logged in
        // The filtered parameters will be rebuilt upon a request to admin-ajax.php?action=h5p_embed&id=<ID>
        // (e.g. when the H5P node is opened), but it's not guaranteed that the user will do this first
        do_action('wp_ajax_h5p_rebuild_cache');

        return $tapestry_data;
    }

    private static function _importH5PNode($node, $temp_url)
    {
        $filename = $node->typeData->mediaURL;

        // TODO: this may be slow because it's fetching an external URL
        // TODO: this is not creating the h5p export file or the h5p details (`filtered` column in database)
        // TODO: the h5p author is not set

        $h5p_id = H5P_Plugin::get_instance()->fetch_h5p($temp_url.'/'.$filename);
        $node->typeData->mediaURL = admin_url('admin-ajax.php') . '?action=h5p_embed&id=' . $h5p_id;

        // TODO: update h5pMeta as well?
    }

    private static function _importActivityNode($node, $temp_dir)
    {
        foreach ($node->typeData->activity->questions as $question) {
            $multiple_choice = $question->answerTypes->multipleChoice;
            if ($multiple_choice->enabled && $multiple_choice->useImages && isset($multiple_choice->choices)) {
                foreach ($multiple_choice->choices as $choice) {
                    self::_importMedia($choice->imageUrl, $temp_dir);
                }
            }

            $drag_drop = $question->answerTypes->dragDrop;
            if ($drag_drop->enabled && $drag_drop->useImages && isset($drag_drop->items)) {
                foreach ($drag_drop->items as $item) {
                    self::_importMedia($item->imageUrl, $temp_dir);
                }
            }
        }
    }

    private static function _importMedia(&$media_url, $temp_dir, $generate_metadata = false, &$file_id = null)
    {
        if (empty($media_url) || filter_var($media_url, FILTER_VALIDATE_URL)) {
            // TODO: does this catch all cases?
            return;
        }

        $upload_dir = wp_upload_dir();
        $new_filename = wp_unique_filename($upload_dir['path'], $media_url);
        $new_filepath = $upload_dir['path'].'/'.$new_filename;

        // Move file to uploads directory
        rename($temp_dir.'/'.$media_url, $new_filepath);

        $attachment_id = self::_createAttachment($new_filepath, $generate_metadata);
        $media_url = wp_get_attachment_url($attachment_id);

        if ($file_id !== null) {
            $file_id = $attachment_id;
        }
    }

    // Return the path to the local file if url is a local WordPress url, false otherwise
    private static function _getLocalPath($url)
    {
        $wp_upload_dir = wp_upload_dir();
        $wp_upload_dir_path = $wp_upload_dir['path'] . '/';
        $wp_upload_dir_url = $wp_upload_dir['url'] . '/';

        if (substr($url, 0, strlen($wp_upload_dir_url)) === $wp_upload_dir_url) {
            // TODO: is there a less error-prone way to do this?
            $path = $wp_upload_dir_path . substr($url, strlen($wp_upload_dir_url));

            return $path;
        }
        return false;
    }
}
