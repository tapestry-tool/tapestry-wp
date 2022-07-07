<?php
require_once __DIR__.'/../classes/class.tapestry-h5p.php';
require_once __DIR__.'/class.tapestry-helpers.php';
require_once __DIR__.'/class.tapestry-errors.php';
require_once ABSPATH . 'wp-admin/includes/export.php';
require_once ABSPATH . 'wp-admin/includes/import.php';

define(
    'H5P_DEFINED',
    file_exists(__DIR__.'/../../h5p/public/class-h5p-plugin.php')
);

if (H5P_DEFINED) {
    include __DIR__.'/../../h5p/public/class-h5p-plugin.php';
}

class TapestryImportExport
{
    // --- Pre-import filtering ---

    public static function prepareImport($tapestry_data)
    {
        $changes = [];
        $wp_roles = self::_getAllRoles();
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

    private static function _getAllRoles()
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

    // Zip structure should be flat
    // This allows us to delete the temporary directory after extracting the zip later
    public static function validateTapestryZipStructure($zip)
    {
        $file_count = $zip->count();
        for ($i = 0; $i < $file_count; $i++) {
            $name = $zip->getNameIndex($i);

            if (basename($name) !== $name) {
                throw new TapestryError('INVALID_ZIP');
            }
        }
    }

    // --- Export ---

    public static function exportExternalMedia($tapestry_data)
    {
        list('path' => $zip, 'url' => $zip_url) = self::_createExportZip();

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

        $zip->addFromString('tapestry.json', json_encode($tapestry_data, JSON_PRETTY_PRINT));
        $zip->close();

        return $zip_url;
    }

    private static function _createExportZip()
    {
        $tapestry_export_dir = self::_getZipExportDirectory();
        if (!file_exists($tapestry_export_dir['path'])) {
            mkdir($tapestry_export_dir['path']);
        }

        $zip = new ZipArchive();

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

        $h5p_id = $node->typeData->h5pMeta->id;
        $h5p_data = $h5p_controller->getH5P($h5p_id);

        if ($h5p_data !== null) {
            // H5P export files are formatted like {slug}-{id}.h5p, according to the H5P plugin source code
            $h5p_name = ($h5p_data->slug ? $h5p_data->slug . '-' : '') . $h5p_data->id . '.h5p';
            $h5p_path = H5P_Plugin::get_instance()->get_h5p_path() . '/exports/' . $h5p_name;

            // TODO: what if the file doesn't exist?
            $zip->addFile($h5p_path, $h5p_name);

            $node->typeData->mediaURL = $h5p_name;
        }
    }

    private static function _exportActivityNode($node, $zip)
    {
        foreach ($node->typeData->activity->questions as $question) {
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

    public static function exportWpPostsInTapestry($tapestry)
    {
        $post_ids = [];

        foreach ($tapestry->getNodeIds() as $nodeId) {
            $node = $tapestry->getNode($nodeId)->get();
            if ($node->mediaType === 'wp-post') {
                array_push($post_ids, (int) $node->typeData->mediaURL);
            }
        }

        return self::_exportWpPosts($post_ids);
    }

    private static function _exportWpPosts($post_ids)
    {
        $category = self::_createUniqueCategory();
        if (!$category) {
            throw new TapestryError('FAILED_TO_EXPORT');
        }

        $category_id = $category['term_id'];
        foreach ($post_ids as $post_id) {
            if ($post_id > 0) {
                wp_set_post_categories($post_id, $category_id, true);
                update_post_meta($post_id, 'tapestry_export_old_post_id', $post_id);
            }
        }

        $category_slug = get_category($category_id)->slug;
        $buffer = ob_start();
        export_wp([
            'content' => 'post',
            'category' => $category_slug,
        ]);
        $export_contents = ob_get_clean();

        wp_delete_term($category_id, 'category');

        return $export_contents;
    }

    private static function _createUniqueCategory()
    {
        $max_attempts = 100;
        $attempts = 0;
        $success = false;

        while (!$success && $attempts < $max_attempts) {
            $category_name = uniqid('tapestry_export_');
            $result = wp_insert_term($category_name, 'category');
            $success = !is_wp_error($result);
            $attempts++;
        }

        return $success ? $result : null;
    }

    // --- Import ---

    public static function importExternalMedia($tapestry_data, $temp_dir, $temp_url)
    {
        $warnings = [
            'nodes' => [],
            'settings' => [],
        ];
        $added_h5p = false;

        foreach ($tapestry_data->nodes as $node) {
            $node_warnings = [];

            if ($node->mediaType === 'h5p') {
                $added_h5p = $added_h5p || self::_importH5PNode($node, $temp_dir, $temp_url, $node_warnings);
            } elseif ($node->mediaType === 'video') {
                self::_importMedia($node->typeData->mediaURL, $temp_dir, $node_warnings);
            } elseif ($node->mediaType === 'activity') {
                self::_importActivityNode($node, $temp_dir, $node_warnings);
            }

            if (!empty($node->thumbnailFileId)) {
                self::_importMedia($node->imageURL, $temp_dir, $node_warnings, true, $node->thumbnailFileId);
            }
            if (!empty($node->lockedThumbnailFileId)) {
                self::_importMedia($node->lockedImageURL, $temp_dir, $node_warnings, true, $node->lockedThumbnailFileId);
            }

            array_push($warnings['nodes'], [
              'id' => $node->id,
              'title' => $node->title,
              'warnings' => $node_warnings,
          ]);
        }

        self::_importMedia($tapestry_data->settings->backgroundUrl, $temp_dir, $warnings['settings']);

        if ($added_h5p) {
            // Rebuild H5P caches so that the h5pMeta->details field is available for just added H5Ps
            // Note: this actually rebuilds as many as possible in 5 seconds; not guaranteed to rebuild everything
            wp_remote_post(admin_url('admin-ajax.php?action=h5p_rebuild_cache'));
        }

        return $warnings;
    }

    private static function _importH5PNode($node, $temp_dir, $temp_url, &$warnings)
    {
        if (empty(H5P_DEFINED)) {
            array_push($warnings, 'Could not import H5P node: H5P plugin files not found.');
            return false;
        }

        $filename = $node->typeData->mediaURL;
        $temp_filepath = $temp_dir.'/'.$filename;
        if (!file_exists($temp_filepath) || !is_file($temp_filepath)) {
            array_push($warnings, 'File "' . $filename . '" not found in zip');
            return false;
        }

        try {
            // Downloads the H5P through a GET request – even though it is already in the filesystem.
            // Unfortunately slow, but seems to be the only public method for adding H5Ps.
            $h5p_id = H5P_Plugin::get_instance()->fetch_h5p($temp_url.'/'.$filename);
            $node->typeData->mediaURL = admin_url('admin-ajax.php') . '?action=h5p_embed&id=' . $h5p_id;
            return true;
        } catch (Exception $e) {
            array_push($warnings, 'Could not import H5P node due to error: ' . $e->getMessage());
        }
        return false;
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
            array_push($warnings, 'File "' . $media_url . '" not found in zip');
            return;
        }

        $upload_dir = wp_upload_dir();
        $new_filename = wp_unique_filename($upload_dir['path'], $media_url);
        $new_filepath = $upload_dir['path'].'/'.$new_filename;

        // Move file to uploads directory
        rename($temp_filepath, $new_filepath);

        $attachment_id = TapestryHelpers::createAttachment($new_filepath, $generate_metadata);
        $media_url = wp_get_attachment_url($attachment_id);

        if ($file_id !== null) {
            $file_id = $attachment_id;
        }
    }

    public static function tryUpdateWpPostId(&$media_url)
    {
        $old_post_id = $media_url;

        $query_args = array(
            'meta_key' => 'tapestry_export_old_post_id',
            'meta_value' => $old_post_id,
        );
        $query = new WP_Query($query_args);

        if ($query->have_posts()) {
            $query->the_post();

            $new_post_id = get_the_ID();
            $media_url = $new_post_id;

            wp_reset_postdata();
        }
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

    public static function _getZipExportDirectory()
    {
        $upload_dir = wp_upload_dir();
        return [
          'path' => $upload_dir['basedir'] . '/tapestry/export',
          'url' => $upload_dir['baseurl'] . '/tapestry/export',
      ];
    }

    public static function _getZipImportDirectory()
    {
        $upload_dir = wp_upload_dir();
        return [
          'path' => $upload_dir['basedir'] . '/tapestry/import',
          'url' => $upload_dir['baseurl'] . '/tapestry/import',
      ];
    }

    public static function clearExportedZips($tempfile_path, $zip_path)
    {
        $export_dir = self::_getZipExportDirectory()['path'];
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
        $parent_dir = self::_getZipImportDirectory();
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
        $import_dir = self::_getZipImportDirectory()['path'];

        // TODO: Careful with this...
        if (!empty($dirpath) && !empty($import_dir) && substr($dirpath, 0, strlen($import_dir)) === $import_dir) {
            array_map('unlink', glob($dirpath . '/*.*'));
            rmdir($dirpath);
        }
    }
}
