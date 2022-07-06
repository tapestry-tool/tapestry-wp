<?php

require_once dirname(__FILE__).'/class.tapestry-node-permissions.php';
require_once dirname(__FILE__).'/../classes/class.tapestry-h5p.php';
require_once dirname(__FILE__).'/../classes/class.constants.php';
require_once ABSPATH . 'wp-admin/includes/export.php';
require_once ABSPATH . 'wp-admin/includes/import.php';

define(
    'H5P_DEFINED',
    file_exists(dirname(__FILE__) . '/../../h5p/public/class-h5p-plugin.php')
);

if (H5P_DEFINED) {
    include dirname(__FILE__) . '/../../h5p/public/class-h5p-plugin.php';
}

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

    private static function _filterImportedPerms($permissions, $roles, &$changes)
    {
        // only keep roles that exist in the current site
        $filteredRoles = array_filter($roles, function ($role) use ($permissions) {
            return property_exists($permissions, $role);
        });

        // create new permissions object with filtered roles
        $filteredPerms = [];
        foreach ($filteredRoles as $role) {
            $filteredPerms[$role] = $permissions->{$role};
        }

        // if permissions modified, add the role to changes
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
            throw new TapestryError('INVALID_TAPESTRY_DATA');
        }

        $properties = ['nodes', 'links', 'site-url'];
        foreach ($properties as $property) {
            if (!property_exists($tapestry_data, $property)) {
                throw new TapestryError('INVALID_TAPESTRY_DATA');
            }
        }
    }

    public static function validateTapestryZipStructure($zip)
    {
        $file_count = $zip->count();

        // TODO: validate other elements as well – references?
        for ($i = 0; $i < $file_count; $i++) {
            $name = $zip->getNameIndex($i);

            if (basename($name) !== $name) {
                // Zip structure should be flat
                // This allows us to delete the temporary directory after extracting the zip later
                throw new TapestryError('INVALID_ZIP');
            }
        }
    }

    public static function exportExternalMedia($tapestry_data, $tapestry_post_id)
    {
        $result = self::_createExportZip();
        $zip = $result['path'];
        $zip_url = $result['url'];

        $h5p_controller = new TapestryH5P();
        foreach ($tapestry_data->nodes as $node) {
            if ($node->mediaType === 'h5p') {
                self::_exportH5PNode($node, $zip, $h5p_controller);
            } elseif ($node->mediaType === 'video') {
                self::_exportMedia($node->typeData->mediaURL, $zip);
            } elseif ($node->mediaType === 'activity') {
                self::_exportActivityNode($node, $zip);
            } elseif ($node->mediaType === 'wp-post') {
                self::_exportWpPostNode($node, $zip, $tapestry_post_id);
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
        $tapestry_export_dir = self::getZipExportDirectory();
        if (!file_exists($tapestry_export_dir['path'])) {
            mkdir($tapestry_export_dir['path']);
        }

        $zip = new ZipArchive();

        // TODO: need to delete these temp files as well...
        $temp_path = tempnam($tapestry_export_dir['path'], 'export_');
        $zip_name = basename($temp_path) . '.zip';
        $zip_path = $tapestry_export_dir['path'] . '/' . $zip_name;
        $zip_url = $tapestry_export_dir['url'] . '/' . $zip_name;

        if ($zip->open($zip_path, ZipArchive::CREATE | ZipArchive::EXCL) !== true) {
            throw new TapestryError('FAILED_TO_EXPORT');
        }

        return [
            'path' => $zip,
            'url' => $zip_url,
        ];
    }

    private static function _exportH5PNode($node, $zip, $h5p_controller)
    {
        if (empty(H5P_DEFINED)) {
            return;
        }

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
        } else {
            $path_to_media = self::_getLocalPath($media_url);
        }

        if (!$path_to_media || !file_exists($path_to_media) || !is_file($path_to_media)) {
            // File does not exist locally; skip
            return;
        }
        $media_name = basename($path_to_media);
        $zip->addFile($path_to_media, $media_name);
        $media_url = $media_name;
    }

    private static function _exportWpPostNode($node, $zip, $tapestry_post_id)
    {
        $post_id = $node->typeData->mediaURL;
        $temp_category_name = 'tapestry_export_' . $tapestry_post_id;

        if (term_exists($temp_category_name)) {
            // TODO: Do something if the category already exists (someone else exporting the tapestry as well, for example)
            $category_id = get_cat_ID($temp_category_name);
            wp_delete_term($category_id, 'category');
        }

        $category = wp_insert_term($temp_category_name, 'category');
        $category_id = $category['term_id'];
        $category_slug = get_category($category_id)->slug;

        wp_set_post_categories($post_id, $category_id, true);

        $buffer = ob_start();
        export_wp([
            'content' => 'post',
            'category' => $category_slug,
        ]);
        $contents = ob_get_clean();

        wp_delete_term($category_id, 'category');

        $filename = $node->id . '-wppost' . $post_id . '.xml';
        $zip->addFromString($filename, $contents);
        $node->typeData->mediaURL = $filename;
    }

    public static function importExternalMedia($tapestry_data, $temp_dir, $temp_url)
    {
        $warnings = [
            'nodes' => [],
            'settings' => [],
        ];

        foreach ($tapestry_data->nodes as $node) {
            $node_warnings = [];

            if ($node->mediaType === 'h5p') {
                self::_importH5PNode($node, $temp_dir, $temp_url, $node_warnings);
            } elseif ($node->mediaType === 'video') {
                self::_importMedia($node->typeData->mediaURL, $temp_dir, $node_warnings);
            } elseif ($node->mediaType === 'activity') {
                self::_importActivityNode($node, $temp_dir, $node_warnings);
            } elseif ($node->mediaType === 'wp-post') {
                self::_importWpPostNode($node->typeData->mediaURL, $temp_dir, $node_warnings);
            }

            self::_importMedia($node->imageURL, $temp_dir, $node_warnings, true, $node->thumbnailFileId);
            self::_importMedia($node->lockedImageURL, $temp_dir, $node_warnings, true, $node->lockedThumbnailFileId);

            array_push($warnings['nodes'], [
                'id' => $node->id,
                'title' => $node->title,
                'warnings' => $node_warnings,
            ]);
        }

        self::_importMedia($tapestry_data->settings->backgroundUrl, $temp_dir, $warnings['settings']);

        // TODO: this doesn't work, probably because we're not logged in
        // The filtered parameters will be rebuilt upon a request to admin-ajax.php?action=h5p_embed&id=<ID>
        // (e.g. when the H5P node is opened), but it's not guaranteed that the user will do this first
        do_action('wp_ajax_h5p_rebuild_cache');

        return $warnings;
    }

    private static function _importH5PNode($node, $temp_dir, $temp_url, &$warnings)
    {
        if (empty(H5P_DEFINED)) {
            array_push($warnings, 'Could not import H5P node: H5P plugin files not found.');
            return;
        }

        $filename = $node->typeData->mediaURL;
        $temp_filepath = $temp_dir.'/'.$filename;
        if (!file_exists($temp_filepath) || !is_file($temp_filepath)) {
            // File does not exist locally; skip
            array_push($warnings, 'File "' . $filename . '" not found in zip');
            return;
        }

        // TODO: this may be slow because it's fetching an external URL
        // TODO: this is not creating the h5p export file or the h5p details (`filtered` column in database)
        // TODO: the h5p author is not set
        try {
            $h5p_id = H5P_Plugin::get_instance()->fetch_h5p($temp_url.'/'.$filename);
            $node->typeData->mediaURL = admin_url('admin-ajax.php') . '?action=h5p_embed&id=' . $h5p_id;
        } catch (Exception $e) {
            array_push($warnings, 'Could not import H5P node due to error: ' . $e->getMessage());
        }
    }

    private static function _importActivityNode($node, $temp_dir, &$warnings)
    {
        foreach ($node->typeData->activity->questions as $question) {
            $multiple_choice = $question->answerTypes->multipleChoice;
            if ($multiple_choice->enabled && $multiple_choice->useImages && isset($multiple_choice->choices)) {
                foreach ($multiple_choice->choices as $choice) {
                    self::_importMedia($choice->imageUrl, $temp_dir, $warnings);
                }
            }

            $drag_drop = $question->answerTypes->dragDrop;
            if ($drag_drop->enabled && $drag_drop->useImages && isset($drag_drop->items)) {
                foreach ($drag_drop->items as $item) {
                    self::_importMedia($item->imageUrl, $temp_dir, $warnings);
                }
            }
        }
    }

    private static function _importMedia(&$media_url, $temp_dir, &$warnings, $generate_metadata = false, &$file_id = null)
    {
        if (empty($media_url) || filter_var($media_url, FILTER_VALIDATE_URL)) {
            // Is empty or an external URL
            return;
        }

        $temp_filepath = $temp_dir.'/'.$media_url;
        if (!file_exists($temp_filepath) || !is_file($temp_filepath)) {
            // File does not exist locally; skip
            array_push($warnings, 'File "' . $media_url . '" not found in zip');
            return;
        }

        $upload_dir = wp_upload_dir();
        $new_filename = wp_unique_filename($upload_dir['path'], $media_url);
        $new_filepath = $upload_dir['path'].'/'.$new_filename;

        // Move file to uploads directory
        rename($temp_filepath, $new_filepath);

        $attachment_id = self::_createAttachment($new_filepath, $generate_metadata);
        $media_url = wp_get_attachment_url($attachment_id);

        if ($file_id !== null) {
            $file_id = $attachment_id;
        }
    }

    private static function _importWpPostNode(&$media_url, $temp_dir)
    {
    }

    // Return the path to the local file if url is a local WordPress url, false otherwise
    private static function _getLocalPath($url)
    {
        $wp_upload_dir = wp_upload_dir();
        $wp_upload_dir_path = $wp_upload_dir['basedir'] . '/';
        $wp_upload_dir_url = $wp_upload_dir['baseurl'] . '/';

        if (substr($url, 0, strlen($wp_upload_dir_url)) === $wp_upload_dir_url) {
            // TODO: is there a less error-prone way to do this?
            $path = $wp_upload_dir_path . substr($url, strlen($wp_upload_dir_url));

            return $path;
        }
        return false;
    }

    public static function getZipExportDirectory()
    {
        $upload_dir = wp_upload_dir();
        return [
            'path' => $upload_dir['basedir'] . '/tapestry/export',
            'url' => $upload_dir['baseurl'] . '/tapestry/export',
        ];
    }

    public static function getZipImportDirectory()
    {
        $upload_dir = wp_upload_dir();
        return [
            'path' => $upload_dir['basedir'] . '/tapestry/import',
            'url' => $upload_dir['baseurl'] . '/tapestry/import',
        ];
    }

    public static function clearExportedZips($tempfile_path, $zip_path)
    {
        $export_dir = self::getZipExportDirectory()['path'];
        if (!empty($tempfile_path) && !empty($export_dir) && substr($tempfile_path, 0, strlen($export_dir)) === $export_dir) {
            unlink($tempfile_path);
        }

        if (!empty($zip_path) && !empty($export_dir) && substr($zip_path, 0, strlen($export_dir)) === $export_dir) {
            unlink($zip_path);
        }
    }

    // https://stackoverflow.com/questions/1707801/making-a-temporary-dir-for-unpacking-a-zipfile-into
    public static function createTempDirectory()
    {
        $parent_dir = self::getZipImportDirectory();
        if (!file_exists($parent_dir['path'])) {
            mkdir($parent_dir['path']);
        }

        $max_attempts = 100;
        $attempts = 0;
        $success = false;

        while (!$success && $attempts < $max_attempts) {
            $dirname = uniqid('temp_');
            $dirpath = $parent_dir['path'] . '/' . $dirname;
            $success = mkdir($dirpath, 0700, false);
            $attempts++;
        }

        return $success ? [
            'name' => $dirname,
            'path' => $dirpath,
            'url' => $parent_dir['url'] . '/' . $dirname,
        ] : null;
    }

    // https://stackoverflow.com/questions/4594180/deleting-all-files-from-a-folder-using-php
    public static function deleteTempDirectory($dirpath)
    {
        $import_dir = self::getZipImportDirectory()['path'];

        // TODO: Careful with this...
        if (!empty($dirpath) && !empty($import_dir) && substr($dirpath, 0, strlen($import_dir)) === $import_dir) {
            array_map('unlink', glob($dirpath . '/*.*'));
            rmdir($dirpath);
        }
    }
}
