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
    include_once __DIR__.'/../../h5p/public/class-h5p-plugin.php';
}

class TapestryImportExport
{
    // --- Pre-import filtering ---

    /**
     * Filters Tapestry node permissions to roles that exist in the current site.
     * Only do this if the import is from a different site.
     *
     * @return array List of role names that were removed.
     */
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

    /**
     * Filters a permissions object to only contain the given roles.
     *
     * @param object $permissions   Permissions for each role
     * @param array $roles          Roles to keep
     * @param array &$changes       (Modified) List of removed roles so far
     *
     * @return array The filtered permissions, as an associative array.
     */
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

    /**
     * Gets the list of roles to keep on the current site.
     *
     * @return array
     */
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

    /**
     * Validates the properties of the Tapestry data to import.
     *
     * @param   object $tapestry_data   Tapestry data to validate
     * @return  void
     * @throws  TapestryError if invalid
     */
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

    /**
     * Validates the internal structure of an uploaded zip file.
     *
     * @param   ZipArchive $zip     Zip file to validate
     * @return  void
     * @throws  TapestryError if invalid
     */
    public static function validateTapestryZipStructure($zip)
    {
        // Require the zip structure to be flat, so that we can delete the directory the zip is extracted to without recursion
        $file_count = $zip->count();
        for ($i = 0; $i < $file_count; $i++) {
            $name = $zip->getNameIndex($i);

            if (basename($name) !== $name) {
                throw new TapestryError('INVALID_ZIP');
            }
        }
    }

    // --- Export ---

    /**
     * Creates a zip file containing the JSON representation and
     * all media (images, videos, H5Ps) referenced by a Tapestry.
     *
     * @return array    [
     *                      'zipUrl' => (string) URL of the zip file on the server
     *                      'warnings' => (array) Warnings generated during export
     *                                  [
     *                                      'nodes' => [
     *                                          'id' => (int) Node ID
     *                                          'title' => (title) Node title
     *                                          'warnings' => (array) List of warning messages
     *                                      ],
     *                                      'settings' => (array) List of warning messages
     *                                  ]
     *                  ]
     * @throws TapestryError if the zip could not be created or opened
     */
    public static function exportExternalMedia($tapestry_data)
    {
        list('zip' => $zip, 'url' => $zip_url) = self::_createExportZip();
        $export_warnings = [
            'nodes' => [],
            'settings' => [],
        ];

        $h5p_controller = new TapestryH5P();
        foreach ($tapestry_data->nodes as $node) {
            $node_warnings = [];

            if ($node->mediaType === 'h5p') {
                self::_exportH5PNode($node, $zip, $node_warnings, $h5p_controller);
            } elseif ($node->mediaType === 'video') {
                self::_exportMedia($node->typeData->mediaURL, $zip, $node_warnings);
            } elseif ($node->mediaType === 'activity') {
                self::_exportActivityNode($node, $zip, $node_warnings);
            }

            self::_exportMedia($node->imageURL, $zip, $node_warnings, $node->thumbnailFileId);
            self::_exportMedia($node->lockedImageURL, $zip, $node_warnings, $node->lockedThumbnailFileId);

            if (!empty($node_warnings)) {
                array_push($export_warnings['nodes'], [
                    'id' => $node->id,
                    'title' => $node->title,
                    'warnings' => $node_warnings,
                ]);
            }
        }

        self::_exportMedia($tapestry_data->settings->backgroundUrl, $zip, $export_warnings['settings']);

        $zip->addFromString('tapestry.json', json_encode($tapestry_data, JSON_PRETTY_PRINT));
        $zip->close();

        return [
            'zipUrl' => $zip_url,
            'warnings' => $export_warnings,
        ];
    }

    /**
     * Attempts to create a new zip file in the uploads/tapestry/export directory.
     * @return array [
     *                  'zip' => (ZipArchive) the created ZipArchive
     *                  'url' => (string) URL of the zip file on the server
     *               ]
     */
    private static function _createExportZip()
    {
        // Ensure uploads/tapestry/export exists
        $tapestry_export_dir = self::_getZipExportDirectory();
        if (!file_exists($tapestry_export_dir['path'])) {
            if (!mkdir($tapestry_export_dir['path'], 0755, true)) {
                throw new TapestryError('FAILED_TO_EXPORT');
            }
        }

        $zip = new ZipArchive();

        $max_attempts = 50;
        $attempts = 0;
        $success = false;
        while (!$success && $attempts < $max_attempts) {
            $zip_name = uniqid('export_') . '.zip';
            $zip_path = $tapestry_export_dir['path'] . '/' . $zip_name;
            $success = $zip->open($zip_path, ZipArchive::CREATE | ZipArchive::EXCL);
            $attempts++;
        }

        if (!$success) {
            throw new TapestryError('FAILED_TO_EXPORT');
        }

        return [
            'zip' => $zip,
            'url' => $tapestry_export_dir['url'] . '/' . $zip_name,
        ];
    }

    /**
     * Finds the .h5p export file for an H5P content and adds it to the zip.
     *
     * @param object $node      H5P node data
     * @param ZipArchive $zip   Zip file to add the archive to
     * @param array &$warnings  (Modified) Export warnings generated so far
     */
    private static function _exportH5PNode($node, $zip, &$warnings, $h5p_controller)
    {
        // If H5P plugin files are not available, nothing to do
        if (empty(H5P_DEFINED)) {
            array_push($warnings, 'Could not export H5P content: H5P plugin files not found.');
            return;
        }

        $h5p_id = $node->typeData->h5pMeta->id;
        $h5p_data = $h5p_controller->getH5P($h5p_id);

        if ($h5p_data !== null) {
            // Find the H5P export file and add it to the zip
            $h5p_name = ($h5p_data->slug ? $h5p_data->slug . '-' : '') . $h5p_data->id . '.h5p';
            $h5p_path = H5P_Plugin::get_instance()->get_h5p_path() . '/exports/' . $h5p_name;

            if (!file_exists($h5p_path) || !is_file($h5p_path)) {
                array_push($warnings, 'Could not find file "' . $h5p_name . '" in H5P export folder.');
                return;
            }

            $zip->addFile($h5p_path, $h5p_name);

            $node->typeData->mediaURL = $h5p_name;
        }
    }

    /**
     * Adds images in an Activity node to the zip.
     * Currently checks the multiple choice and drag drop question types.
     *
     * @param object $node      Activity node data
     * @param ZipArchive $zip   Zip file to add images to
     * @param array &$warnings  (Modified) Export warnings generated so far
     */
    private static function _exportActivityNode($node, $zip, &$warnings)
    {
        foreach ($node->typeData->activity->questions as $question) {
            $multiple_choice = $question->answerTypes->multipleChoice;
            if ($multiple_choice->enabled && $multiple_choice->useImages && isset($multiple_choice->choices)) {
                foreach ($multiple_choice->choices as $choice) {
                    self::_exportMedia($choice->imageUrl, $zip, $warnings);
                }
            }

            $drag_drop = $question->answerTypes->dragDrop;
            if ($drag_drop->enabled && $drag_drop->useImages && isset($drag_drop->items)) {
                foreach ($drag_drop->items as $item) {
                    self::_exportMedia($item->imageUrl, $zip, $warnings);
                }
            }
        }
    }

    /**
     * If the given URL is a local WordPress upload, adds the media item (image, video) to the zip file
     * and sets the URL to its filename in the zip.
     *
     * @param string &$media_url    (Modified in place) URL of the media item
     * @param ZipArchive $zip       Zip file to add item to
     * @param array &$warnings  (Modified) Export warnings generated so far
     * @param int $file_id          (Optional) WordPress attachment id of the media item.
     *                              If specified, is used instead of the URL to find the local path.
     */
    private static function _exportMedia(&$media_url, $zip, &$warnings, $file_id = null)
    {
        if (!empty($file_id)) {
            // Retrieve the original file, not the resized version
            $path_to_media = get_attached_file($file_id);

            if (!$path_to_media) {
                array_push($warnings, 'Could not find WordPress attachment. A thumbnail may be missing.');
            }
        } else {
            $path_to_media = self::_getLocalPath($media_url);
        }

        if (!$path_to_media) {
            return;
        } elseif (!file_exists($path_to_media) || !is_file($path_to_media)) {
            array_push($warnings, 'Could not find file "' . basename($path_to_media) . '" in WordPress uploads.');
            return;
        }
        $media_name = basename($path_to_media);
        $zip->addFile($path_to_media, $media_name);
        $media_url = $media_name;
    }

    // --- Import/Export WordPress posts ---

    /**
     * Exports all WordPress posts in a Tapestry.
     * Adds the name of the export category to the Tapestry data.
     * 
     * @param object $tapestry_data     Data of the Tapestry
     * @return string|null      Contents of the WXR file, or NULL if no WordPress posts in the Tapestry.
     */
    public static function exportWpPostsInTapestry($tapestry_data)
    {
        $post_ids = [];
        foreach ($tapestry_data->nodes as $node) {
            if ($node->mediaType === 'wp-post') {
                array_push($post_ids, (int) $node->typeData->mediaURL);
            }
        }

        if (!empty($post_ids)) {
            list('contents' => $wxr_contents, 'category' => $category) = self::_exportWpPosts($post_ids);

            // Save the temporary export category so we can delete it on the destination site
            $tapestry_data->wpExportCategory = $category;

            return $wxr_contents;
        }
        return null;
    }

    /**
     * Exports a list of WordPress posts using WordPress's WXR (XML) format.
     *
     * @param array $post_ids   Post IDs of the posts to export.
     * @return array    [
     *                      'contents' => (string) Contents of the export file
     *                      'category' => (string) Name of the temporary category created to facilitate exporting.
     *                                    Can be used to delete the category later.
     *                  ]
     */
    private static function _exportWpPosts($post_ids)
    {
        $site_url = get_bloginfo('url');

        // WordPress cannot export posts by id, so make a unique category to gather all posts to export
        $category = self::_createUniqueCategory();
        if (!$category) {
            throw new TapestryError('FAILED_TO_EXPORT');
        }

        $category_id = $category['term_id'];
        foreach ($post_ids as $post_id) {
            if ($post_id > 0) {
                wp_set_post_categories($post_id, $category_id, true);

                // Save the old post IDs and site identity to make posts discoverable after being imported
                $site_and_post_id = $site_url . '-' . $post_id;
                update_post_meta($post_id, 'tapestry_export_old_post_id', $site_and_post_id);
            }
        }

        $category_slug = get_category($category_id)->slug;
        $buffer = ob_start();
        export_wp([
            'content' => 'post',
            'category' => $category_slug,
        ]);
        $export_contents = ob_get_clean();

        // Delete category from this site when done
        wp_delete_term($category_id, 'category');

        return [
            'contents' => $export_contents,
            'category' => $category['name'],
        ];
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

        return $success ? [
            'name' => $category_name,
            'term_id' => $result['term_id']
        ] : null;
    }

    /**
     * Deletes the category in the wpExportCategory field of the Tapestry data.
     */
    public static function deleteWpExportCategory($tapestry_data)
    {
        $category_name = $tapestry_data->wpExportCategory;

        if (isset($category_name) && self::_stringStartsWith($category_name, 'tapestry_export_')) {
            $category = get_term_by('name', $category_name, 'category');

            if ($category) {
                wp_delete_term($category->term_id, 'category');
            }
        }
    }

    // --- Import ---

    /**
     * Uploads all media (images, videos, H5Ps) referenced by the imported Tapestry.
     *
     * @param object $tapestry_data     Data of the Tapestry
     * @param string $temp_dir          Path to the directory where zip was extracted.
     * @param string $temp_url          URL of the directory where zip was extracted.
     *
     * @return array $warnings  Warnings generated during import
     *                          [
     *                              'nodes' => [
     *                                  'id' => (int) Node ID
     *                                  'title' => (title) Node title
     *                                  'warnings' => (array) List of warning messages
     *                              ],
     *                              'settings' => (array) List of warning messages
     *                          ]
     */
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
                $success = self::_importH5PNode($node, $temp_dir, $temp_url, $node_warnings);
                $added_h5p = $success || $added_h5p;
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

            if (!empty($node_warnings)) {
                array_push($warnings['nodes'], [
                    'id' => $node->id,
                    'title' => $node->title,
                    'warnings' => $node_warnings,
                ]);
            }
        }

        self::_importMedia($tapestry_data->settings->backgroundUrl, $temp_dir, $warnings['settings']);

        if ($added_h5p) {
            // Rebuild H5P caches so that the h5pMeta->details field is available for just added H5Ps
            // Note: this actually rebuilds as many as possible in 5 seconds; not guaranteed to rebuild everything
            wp_remote_post(admin_url('admin-ajax.php?action=h5p_rebuild_cache'));
        }

        return $warnings;
    }

    /**
     * Uploads an H5P file to the site and sets the H5P node's mediaURL to the embed link for the new H5P,
     * if the file exists.
     *
     * @param object $node      H5P node data
     * @param string $temp_dir  Path to the directory where zip was extracted.
     * @param string $temp_url  URL of the directory where zip was extracted.
     * @param array &$warnings  (Modified) Import warnings generated so far
     *
     * @return bool True if successfully imported, otherwise false
     */
    private static function _importH5PNode($node, $temp_dir, $temp_url, &$warnings)
    {
        if (empty(H5P_DEFINED)) {
            array_push($warnings, 'Could not import H5P content: H5P plugin files not found.');
            return false;
        }

        $filename = $node->typeData->mediaURL;
        $temp_filepath = self::_getPathIfExists($filename, $temp_dir, $warnings);
        if (!$temp_filepath) {
            return false;
        }

        try {
            // Downloads the H5P through a GET request – even though it is already in the filesystem.
            // Unfortunately slow, but seems to be the only public method for adding H5Ps.
            $h5p_id = H5P_Plugin::get_instance()->fetch_h5p($temp_url.'/'.$filename);
            $node->typeData->mediaURL = admin_url('admin-ajax.php') . '?action=h5p_embed&id=' . $h5p_id;
            return true;
        } catch (Exception $e) {
            array_push($warnings, 'Could not import H5P content due to error: ' . $e->getMessage());
        }
        return false;
    }

    /**
     * Uploads all images in an Activity node to the site, and sets the image URLs to the new URLs.
     * Currently checks the multiple choice and drag drop question types.
     *
     * @param object $node      Activity node data
     * @param string $temp_dir  Path to the directory where zip was extracted.
     * @param array &$warnings  (Modified) Import warnings generated so far
     */
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

    /**
     * If the media_url references a filename in the zip, uploads the media item (image, video) to the site,
     * and sets the media_url to the URL of the uploaded media.
     *
     * @param string &$media_url        (Modified) Link to the media item
     * @param string $temp_dir          Path to the directory where zip was extracted
     * @param array &$warnings          (Modified) Import warnings generated so far
     * @param bool $generate_metadata   True if sub-sizes should be created for the image
     * @param int|string &$file_id      (Optional, modified) If provided, is set to the ID of the new attachment.
     */
    private static function _importMedia(&$media_url, $temp_dir, &$warnings, $generate_metadata = false, &$file_id = null)
    {
        if (empty($media_url) || filter_var($media_url, FILTER_VALIDATE_URL)) {
            // Is empty or an external URL
            return;
        }

        $temp_filepath = self::_getPathIfExists($media_url, $temp_dir, $warnings);
        if (!$temp_filepath) {
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

    /**
     * Attempts to update the post ID of a WordPress Post node to its ID after being imported.
     *
     * @param int &$media_url   (Modified) Current post ID
     *                          If a matching post is found, will be set to this new post ID.
     */
    public static function tryUpdateWpPostId(&$media_url)
    {
        $site_url = get_bloginfo('url');
        $old_post_id = $media_url;
        $site_and_post_id = $site_url . '-' . $old_post_id;

        // Look for a post whose old ID matches the current post ID
        $query_args = array(
            'meta_key' => 'tapestry_export_old_post_id',
            'meta_value' => $site_and_post_id,
        );
        $query = new WP_Query($query_args);

        if ($query->have_posts()) {
            $query->the_post();

            $new_post_id = get_the_ID();
            $media_url = $new_post_id;

            wp_reset_postdata();
        }
    }

    // --- Utilities ---

    /**
     * Checks that a file exists in the directory where the zip was extracted and returns its path.
     *
     * @param string $filename      Name of the file in the zip
     * @param string $temp_dir      Path to the directory where zip was extracted
     * @param array &$warnings      (Modified) Import warnings generated so far
     *
     * @return string|false The path, or false if it doesn't exist.
     */
    private static function _getPathIfExists($filename, $temp_dir, &$warnings)
    {
        $temp_filepath = $temp_dir.'/'.$filename;
        if (!file_exists($temp_filepath) || !is_file($temp_filepath)) {
            array_push($warnings, 'File "' . $filename . '" not found in zip');
            return false;
        }

        return $temp_filepath;
    }

    /**
     * Gets the local path to a Wordpress upload given its URL.
     * Does not check if the file actually exists, only the form of the URL.
     *
     * @return string|false The path, or false if the URL is not a local WordPress upload
     */
    private static function _getLocalPath($url)
    {
        $wp_upload_dir = wp_upload_dir();
        $wp_upload_dir_path = $wp_upload_dir['basedir'] . '/';
        $wp_upload_dir_url = $wp_upload_dir['baseurl'] . '/';

        if (self::_stringStartsWith($url, $wp_upload_dir_url)) {
            $path = $wp_upload_dir_path . substr($url, strlen($wp_upload_dir_url));
            return $path;
        }
        return false;
    }

    /**
     * Gets the directory where exported zip files should be placed.
     */
    private static function _getZipExportDirectory()
    {
        $upload_dir = wp_upload_dir();
        return [
            'path' => $upload_dir['basedir'] . '/tapestry/export',
            'url' => $upload_dir['baseurl'] . '/tapestry/export',
        ];
    }

    /**
     * Gets the directory where extracted zips should be placed during import.
     */
    private static function _getZipImportDirectory()
    {
        $upload_dir = wp_upload_dir();
        return [
            'path' => $upload_dir['basedir'] . '/tapestry/import',
            'url' => $upload_dir['baseurl'] . '/tapestry/import',
        ];
    }

    /**
     * Deletes all export files in the export directory older than 1 day
     *
     * @return int Number of files successfully deleted
     */
    public static function clearExportedZips()
    {
        $deleted_count = 0;
        $export_dir = self::_getZipExportDirectory()['path'];

        if (!empty($export_dir)) {
            $files = glob($export_dir . '/export_*.zip');
            $now = time();
            $one_day = 60 * 60 * 24;

            foreach ($files as $file) {
                if (is_file($file)) {
                    if (filemtime($file) + $one_day <= $now) {
                        $deleted_count += unlink($file);
                    }
                }
            }
        }

        return $deleted_count;
    }

    /**
     * Creates a temporary directory with a unique name in the import directory.
     * Also creates the import directory if it doesn't exist.
     *
     * See https://stackoverflow.com/a/30010928
     *
     * @return array    [
     *                      'path' => (string) Path to the directory
     *                      'url' => (string) URL of the directory
     *                  ] if successful
     * @return null If failed to create the directory
     */
    public static function createTempDirectory()
    {
        $parent_dir = self::_getZipImportDirectory();
        $max_attempts = 100;
        $attempts = 0;
        $success = false;

        while (!$success && $attempts < $max_attempts) {
            $dirname = uniqid('temp_');
            $dirpath = $parent_dir['path'] . '/' . $dirname;
            $success = mkdir($dirpath, 0755, true);
            $attempts++;
        }

        return $success ? [
            'path' => $dirpath,
            'url' => $parent_dir['url'] . '/' . $dirname,
        ] : null;
    }


    /**
     * Removes a temporary directory from the import directory.
     *
     * See https://stackoverflow.com/a/13468943
     */
    public static function deleteTempDirectory($dirpath)
    {
        $import_dir = self::_getZipImportDirectory()['path'];

        if (!empty($dirpath) && self::_stringStartsWith($dirpath, $import_dir) && file_exists($dirpath)) {
            array_map('unlink', glob($dirpath . '/*.*'));
            rmdir($dirpath);
        }
    }

    private static function _stringStartsWith($str, $start)
    {
        return substr($str, 0, strlen($start)) === $start;
    }
}
