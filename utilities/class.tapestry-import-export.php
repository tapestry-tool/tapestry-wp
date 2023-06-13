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
    public static function prepareImport($tapestryData)
    {
        // Delete leftover category from importing WordPress posts, if it exists
        self::_deleteWpExportCategory($tapestryData);

        // If import is from a different site, filter permissions
        $changedPermissions = self::_filterPermissionsIfMovingSites($tapestryData);
        $changes = [
            'permissions' => $changedPermissions,
            'noChange' => count($changedPermissions) === 0,
        ];

        return $changes;
    }

    private static function _filterPermissionsIfMovingSites($tapestryData)
    {
        $changes = [];

        $wpUrl = get_bloginfo('url');
        if ($tapestryData->{'site-url'} !== $wpUrl) {
            $wp_roles = self::_getAllRoles();

            foreach ($tapestryData->nodes as $node) {
                $node->permissions = self::_filterImportedPerms($node->permissions, $wp_roles, $changes);
            }
            if ($tapestryData->settings) {
                $tapestryData->settings->defaultPermissions = self::_filterImportedPerms(
                    $tapestryData->settings->defaultPermissions,
                    $wp_roles,
                    $changes
                );
            }
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
        $filteredPerms = (object) [];
        foreach ($filteredRoles as $role) {
            $filteredPerms->{$role} = $permissions->{$role};
        }

        // if permissions modified, add the role to changes
        foreach ($permissions as $key => $value) {
            if (!property_exists($filteredPerms, $key)) {
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
     * @param   object $tapestryData   Tapestry data to validate
     * @return  void
     * @throws  TapestryError if invalid
     */
    public static function validateTapestryData($tapestryData)
    {
        if (empty($tapestryData)) {
            throw new TapestryError('INVALID_TAPESTRY_DATA');
        }

        $properties = ['nodes', 'links', 'site-url'];
        foreach ($properties as $property) {
            if (!property_exists($tapestryData, $property)) {
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
        $fileCount = $zip->count();
        for ($i = 0; $i < $fileCount; $i++) {
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
    public static function exportExternalMedia($tapestryData)
    {
        list('zip' => $zip, 'url' => $zipUrl) = self::_createExportZip();
        $exportWarnings = [
            'nodes' => [],
            'settings' => [],
        ];
        $exportLog = [
            'h5p' => [],
            'media' => [],
        ];

        $h5pController = new TapestryH5P();
        foreach ($tapestryData->nodes as $node) {
            $nodeWarnings = [];

            if ($node->mediaType === 'h5p') {
                self::_exportH5PNode($node, $zip, $nodeWarnings, $exportLog, $h5pController);
            } elseif ($node->mediaType === 'video') {
                self::_exportMedia($node->typeData->mediaURL, $zip, $nodeWarnings, $exportLog);
            } elseif ($node->mediaType === 'activity') {
                self::_exportActivityNode($node, $zip, $nodeWarnings, $exportLog);
            }

            self::_exportMedia($node->imageURL, $zip, $nodeWarnings, $exportLog, $node->thumbnailFileId);
            self::_exportMedia($node->lockedImageURL, $zip, $nodeWarnings, $exportLog, $node->lockedThumbnailFileId);

            if (!empty($nodeWarnings)) {
                array_push($exportWarnings['nodes'], [
                    'id' => $node->id,
                    'title' => $node->title,
                    'warnings' => $nodeWarnings,
                ]);
            }
        }

        if ($tapestryData->settings) {
            self::_exportMedia($tapestryData->settings->backgroundUrl, $zip, $exportWarnings['settings'], $exportLog);
        }

        $tapestryData->warnings = !empty($exportWarnings['nodes']) || !empty($exportWarnings['settings']);

        $zip->addFromString('tapestry.json', json_encode($tapestryData, JSON_PRETTY_PRINT | JSON_UNESCAPED_LINE_TERMINATORS | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
        $zip->close();

        return [
            'zipUrl' => $zipUrl,
            'warnings' => $exportWarnings,
            'log' => $exportLog,
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
        $tapestryExportDir = self::_getZipExportDirectory();
        if (!file_exists($tapestryExportDir['path'])) {
            if (!mkdir($tapestryExportDir['path'], 0755, true)) {
                throw new TapestryError('FAILED_TO_EXPORT');
            }
        }

        $zip = new ZipArchive();

        $maxAttempts = 50;
        $attempts = 0;
        $success = false;
        while (!$success && $attempts < $maxAttempts) {
            $zipName = uniqid('export_') . '.zip';
            $zipPath = $tapestryExportDir['path'] . DIRECTORY_SEPARATOR . $zipName;
            $success = $zip->open($zipPath, ZipArchive::CREATE | ZipArchive::EXCL);
            $attempts++;
        }

        if (!$success) {
            throw new TapestryError('FAILED_TO_EXPORT');
        }

        return [
            'zip' => $zip,
            'url' => $tapestryExportDir['url'] . '/' . $zipName,
        ];
    }

    /**
     * Finds the .h5p export file for an H5P content and adds it to the zip.
     *
     * @param object $node      H5P node data
     * @param ZipArchive $zip   Zip file to add the archive to
     * @param array &$warnings  (Modified) Export warnings generated so far
     */
    private static function _exportH5PNode($node, $zip, &$warnings, &$log, $h5pController)
    {
        // If H5P plugin files are not available, nothing to do
        if (empty(H5P_DEFINED)) {
            array_push($warnings, 'Could not export H5P content: H5P plugin files not found.');
            return;
        }

        $h5pId = $node->typeData->h5pMeta->id;
        $h5pData = $h5pController->getH5P($h5pId);

        if ($h5pData !== null) {
            // Find the H5P export file and add it to the zip
            $h5pName = ($h5pData->slug ? $h5pData->slug . '-' : '') . $h5pData->id . '.h5p';
            $h5pPath = H5P_Plugin::get_instance()->get_h5p_path() . DIRECTORY_SEPARATOR . 'exports' . DIRECTORY_SEPARATOR . $h5pName;
            if (!file_exists($h5pPath) || !is_file($h5pPath)) {
                array_push($warnings, 'Could not find file "' . $h5pName . '" in H5P export folder.');
                return;
            }

            $zip->addFile($h5pPath, $h5pName);
            array_push($log['h5p'], $h5pName);

            $node->typeData->mediaURL = $h5pName;
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
    private static function _exportActivityNode($node, $zip, &$warnings, &$log)
    {
        foreach ($node->typeData->activity->questions as $question) {
            $multipleChoice = $question->answerTypes->multipleChoice;
            if ($multipleChoice->enabled && $multipleChoice->useImages && isset($multipleChoice->choices)) {
                foreach ($multipleChoice->choices as $choice) {
                    self::_exportMedia($choice->imageUrl, $zip, $warnings, $log);
                }
            }

            $dragDrop = $question->answerTypes->dragDrop;
            if ($dragDrop->enabled && $dragDrop->useImages && isset($dragDrop->items)) {
                foreach ($dragDrop->items as $item) {
                    self::_exportMedia($item->imageUrl, $zip, $warnings, $log);
                }
            }
        }
    }

    /**
     * If the given URL is a local WordPress upload, adds the media item (image, video) to the zip file
     * and sets the URL to its filename in the zip.
     *
     * @param string &$mediaUrl    (Modified in place) URL of the media item
     * @param ZipArchive $zip       Zip file to add item to
     * @param array &$warnings  (Modified) Export warnings generated so far
     * @param int $fileId          (Optional) WordPress attachment id of the media item.
     *                              If specified, is used instead of the URL to find the local path.
     */
    private static function _exportMedia(&$mediaUrl, $zip, &$warnings, &$log, $fileId = null)
    {
        $pathToMedia = "";
        if (!empty($fileId)) {
            // Retrieve the original file, not the resized version
            $pathToMedia = get_attached_file($fileId);

            if (!$pathToMedia) {
                array_push($warnings, 'Could not find WordPress attachment. A thumbnail may be missing.');
            }
        }

        if (!$pathToMedia) {
            $pathToMedia = self::_getLocalPath($mediaUrl);
        }

        if (!$pathToMedia) {
            return;
        } elseif (!file_exists($pathToMedia) || !is_file($pathToMedia)) {
            array_push($warnings, 'Could not find file "' . basename($pathToMedia) . '" in WordPress uploads.');
            return;
        }
        $mediaName = basename($pathToMedia);
        $zip->addFile($pathToMedia, $mediaName);
        array_push($log['media'], $mediaName);
        $mediaUrl = $mediaName;
    }

    // --- Import/Export WordPress posts ---

    /**
     * Exports all WordPress posts in a Tapestry.
     * Adds the name of the export category to the Tapestry data.
     *
     * @param object $tapestryData     Data of the Tapestry
     * @param string $exportId         ID that identifies this export run
     * @return string|null      Contents of the WXR file, or NULL if no WordPress posts in the Tapestry.
     */
    public static function exportWpPostsInTapestry($tapestryData, $exportId)
    {
        $postIds = [];
        foreach ($tapestryData->nodes as $node) {
            if ($node->mediaType === 'wp-post') {
                array_push($postIds, (int) $node->typeData->mediaURL);
            }
        }

        // Keep only post IDs pointing to valid posts
        $postIds = array_filter($postIds, function ($id) {
            return $id > 0 && get_post_status($id);
        });

        if (!empty($postIds)) {
            list('contents' => $wxrContents, 'category' => $category) = self::_exportWpPosts($tapestryData->{'site-url'}, $postIds, $exportId);

            // Save the temporary export category so we can delete it on the destination site
            $tapestryData->wpExportCategory = $category;

            return $wxrContents;
        }
        return null;
    }

    /**
     * Exports a list of WordPress posts using WordPress's WXR (XML) format.
     *
     * @param string $siteUrl      Site URL of this WordPress site.
     * @param array $postIds       Post IDs of the posts to export.
     * @param string $exportId     ID that identifies this export run.
     * @return array    [
     *                      'contents' => (string) Contents of the export file
     *                      'category' => (string) Name of the temporary category created to facilitate exporting.
     *                                    Can be used to delete the category later.
     *                  ]
     */
    private static function _exportWpPosts($siteUrl, $postIds, $exportId)
    {
        // WordPress cannot export posts by id, so make a unique category to gather all posts to export
        $category = self::_createExportCategory($exportId);
        if (!$category) {
            throw new TapestryError('FAILED_TO_EXPORT');
        }

        $categoryId = $category['term_id'];
        foreach ($postIds as $postId) {
            wp_set_post_categories($postId, $categoryId, true);

            // Save the old post IDs and site identity to make posts discoverable after being imported
            $siteAndPostId = $siteUrl . '-' . $postId;
            update_post_meta($postId, 'tapestry_export_old_post_id', $siteAndPostId);
        }

        $categorySlug = get_category($categoryId)->slug;
        $buffer = ob_start();
        export_wp([
            'content' => 'post',
            'category' => $categorySlug,
        ]);
        $exportContents = ob_get_clean();

        // Delete category from this site when done
        wp_delete_term($categoryId, 'category');

        return [
            'contents' => $exportContents,
            'category' => $category['name'],
        ];
    }

    private static function _createExportCategory($exportId)
    {
        $categoryName = 'tapestry_export_' . $exportId;
        $result = wp_insert_term($categoryName, 'category');

        $success = !is_wp_error($result);

        return $success ? [
            'name' => $categoryName,
            'term_id' => $result['term_id']
        ] : null;
    }

    /**
     * Deletes the category in the wpExportCategory field of the Tapestry data.
     */
    private static function _deleteWpExportCategory($tapestryData)
    {
        $categoryName = $tapestryData->wpExportCategory;

        if (isset($categoryName) && self::_stringStartsWith($categoryName, 'tapestry_export_')) {
            $category = get_term_by('name', $categoryName, 'category');

            if ($category) {
                wp_delete_term($category->term_id, 'category');
            }
        }
    }

    public static function getExportId()
    {
        return uniqid();
    }

    // --- Import ---

    /**
     * Uploads all media (images, videos, H5Ps) referenced by the imported Tapestry.
     *
     * @param string $postId            Post ID of the Tapestry
     * @param object $tapestryData     Data of the Tapestry
     * @param string $tempDir          Path to the directory where zip was extracted.
     * @param string $tempUrl          URL of the directory where zip was extracted.
     *
     * @return array [
     *                  'warnings' => (array) Warnings generated during import
     *                      [
     *                          'nodes' => [
     *                              'id' => (int) Node ID
     *                              'title' => (title) Node title
     *                              'warnings' => (array) List of warning messages
     *                          ],
     *                          'settings' => (array) List of warning messages
     *                      ]
     *                  'rebuildH5PCache' => (boolean) Whether the H5P cache needs to be rebuilt.
     *                                       True if any H5P contents were added.
     *               ]
     */
    public static function importExternalMedia($postId, $tapestryData, $tempDir, $tempUrl)
    {
        $warnings = [
            'nodes' => [],
            'settings' => [],
        ];

        $importedH5ps = [];
        $importedMedia = [];
        $nodeCount = count($tapestryData->nodes);
        $nodeIndex = 0;
        foreach ($tapestryData->nodes as $node) {
            $nodeIndex++;
            $nodeStr = $node->title . ' (Node ' . $nodeIndex . '/' . $nodeCount . ')';
            $nodeWarnings = [];

            if ($node->mediaType === 'h5p') {
                TapestryImportExport::setImportStatus($postId, (object) [
                    'inProgress' => true,
                    'message' => 'Uploading H5P: ' . $nodeStr,
                ]);
                self::_importH5PNode($node, $tempDir, $tempUrl, $nodeWarnings, $importedH5ps);
            } elseif ($node->mediaType === 'video') {
                TapestryImportExport::setImportStatus($postId, (object) [
                    'inProgress' => true,
                    'message' => 'Uploading Video: ' . $nodeStr,
                ]);
                self::_importMedia($node->typeData->mediaURL, $tempDir, $nodeWarnings, $importedMedia);
            } elseif ($node->mediaType === 'activity') {
                TapestryImportExport::setImportStatus($postId, (object) [
                    'inProgress' => true,
                    'message' => 'Uploading Activity: ' . $nodeStr,
                ]);
                self::_importActivityNode($node, $tempDir, $nodeWarnings, $importedMedia);
            }

            if (!empty($node->imageURL)) {
                TapestryImportExport::setImportStatus($postId, (object) [
                    'inProgress' => true,
                    'message' => 'Uploading Node Thumbnail: ' . $nodeStr,
                ]);
                self::_importMedia($node->imageURL, $tempDir, $nodeWarnings, $importedMedia, true, $node->thumbnailFileId);
            }
            if (!empty($node->lockedImageURL)) {
                TapestryImportExport::setImportStatus($postId, (object) [
                    'inProgress' => true,
                    'message' => 'Uploading Node Thumbnail: ' . $nodeStr,
                ]);
                self::_importMedia($node->lockedImageURL, $tempDir, $nodeWarnings, $importedMedia, true, $node->lockedThumbnailFileId);
            }

            if (!empty($nodeWarnings)) {
                array_push($warnings['nodes'], [
                    'id' => $node->id,
                    'title' => $node->title,
                    'warnings' => $nodeWarnings,
                ]);
            }
        }

        if ($tapestryData->settings) {
            TapestryImportExport::setImportStatus($postId, (object) [
                'inProgress' => true,
                'message' => 'Uploading Tapestry background',
            ]);
            self::_importMedia($tapestryData->settings->backgroundUrl, $tempDir, $warnings['settings'], $importedMedia);
        }

        return [
            'warnings' => $warnings,
            'rebuildH5PCache' => count($importedH5ps) > 0,
        ];
    }

    public static function getImportStatus($tapestryPostId)
    {
        $status = get_post_meta($tapestryPostId, 'import', true);
        if (empty($status)) {
            $status = (object) [
                'inProgress' => false,
            ];
        }

        return $status;
    }

    public static function setImportStatus($tapestryPostId, $status)
    {
        update_post_meta($tapestryPostId, 'import', $status);
    }

    /**
     * Uploads an H5P file to the site and sets the H5P node's mediaURL to the embed link for the new H5P,
     * if the file exists.
     *
     * @param object $node              H5P node data
     * @param string $tempDir          Path to the directory where zip was extracted.
     * @param string $tempUrl          URL of the directory where zip was extracted.
     * @param array &$warnings          (Modified) Import warnings generated so far
     * @param array &$importedH5ps     (Modified) Maps file names of H5Ps to their H5P ids.
     *                                  If the same file name is encountered, it will not be added twice.
     *
     * @return bool True if successfully imported, otherwise false
     */
    private static function _importH5PNode($node, $tempDir, $tempUrl, &$warnings, &$importedH5ps)
    {
        if (empty(H5P_DEFINED)) {
            array_push($warnings, 'Could not import H5P content: H5P plugin files not found.');
            return;
        }

        $filename = $node->typeData->mediaURL;
        if (array_key_exists($filename, $importedH5ps)) {
            // H5P file was already imported; no need to create again
            $h5pId = $importedH5ps[$filename];
        } else {
            $tempFilepath = self::_getPathIfExists($filename, $tempDir, $warnings);
            if (!$tempFilepath) {
                return;
            }

            try {
                // Downloads the H5P through a GET request – even though it is already in the filesystem.
                // Unfortunately slow, but seems to be the only public method for adding H5Ps.
                $h5pId = H5P_Plugin::get_instance()->fetch_h5p($tempUrl.'/'.$filename);
                $importedH5ps[$filename] = $h5pId;
            } catch (Exception $e) {
                array_push($warnings, 'Could not import H5P content due to error: ' . $e->getMessage());
                return;
            }
        }

        $node->typeData->mediaURL = admin_url('admin-ajax.php') . '?action=h5p_embed&id=' . $h5pId;
    }

    /**
     * Uploads all images in an Activity node to the site, and sets the image URLs to the new URLs.
     * Currently checks the multiple choice and drag drop question types.
     *
     * @param object $node              Activity node data
     * @param string $tempDir          Path to the directory where zip was extracted.
     * @param array &$warnings          (Modified) Import warnings generated so far
     * @param array &$importedFiles    (Modified) Maps filenames of imported media to their attachment ids.
     *                                  If the same file name is encountered, it will not be added twice.
     */
    private static function _importActivityNode($node, $tempDir, &$warnings, &$importedFiles)
    {
        foreach ($node->typeData->activity->questions as $question) {
            $multipleChoice = $question->answerTypes->multipleChoice;
            if ($multipleChoice->enabled && $multipleChoice->useImages && isset($multipleChoice->choices)) {
                foreach ($multipleChoice->choices as $choice) {
                    self::_importMedia($choice->imageUrl, $tempDir, $warnings, $importedFiles);
                }
            }

            $dragDrop = $question->answerTypes->dragDrop;
            if ($dragDrop->enabled && $dragDrop->useImages && isset($dragDrop->items)) {
                foreach ($dragDrop->items as $item) {
                    self::_importMedia($item->imageUrl, $tempDir, $warnings, $importedFiles);
                }
            }
        }
    }

    /**
     * If the media_url references a filename in the zip, uploads the media item (image, video) to the site,
     * and sets the media_url to the URL of the uploaded media.
     *
     * @param string &$mediaUrl        (Modified) Link to the media item
     * @param string $tempDir          Path to the directory where zip was extracted
     * @param array &$warnings          (Modified) Import warnings generated so far
     * @param array &$importedFiles    (Modified) Maps filenames of imported media to their attachment ids.
     *                                  If the same file name is encountered, it will not be added twice.
     * @param bool $generateMetadata   True if sub-sizes should be created for the image
     * @param int|string &$fileId      (Optional, modified) If provided, is set to the ID of the new attachment.
     */
    private static function _importMedia(&$mediaUrl, $tempDir, &$warnings, &$importedFiles, $generateMetadata = false, &$fileId = null)
    {
        if (empty($mediaUrl) || self::_stringStartsWith($mediaUrl, '//') || filter_var($mediaUrl, FILTER_VALIDATE_URL)) {
            // Is empty or an external URL
            // Also detect URLs with the scheme removed
            return;
        }

        if (array_key_exists($mediaUrl, $importedFiles)) {
            // Media file was already imported; no need to create again
            $attachmentId = $importedFiles[$mediaUrl];
        } else {
            $tempFilepath = self::_getPathIfExists($mediaUrl, $tempDir, $warnings);
            if (!$tempFilepath) {
                return;
            }

            $uploadDir = wp_upload_dir();
            $newFilename = wp_unique_filename($uploadDir['path'], $mediaUrl);
            $newFilepath = $uploadDir['path'] . DIRECTORY_SEPARATOR . $newFilename;

            // Move file to uploads directory
            rename($tempFilepath, $newFilepath);

            $attachmentId = TapestryHelpers::createAttachment($newFilepath, $generateMetadata);
            $importedFiles[$mediaUrl] = $attachmentId;
        }

        $mediaUrl = wp_get_attachment_url($attachmentId);

        if ($fileId !== null) {
            $fileId = $attachmentId;
        }
    }

    /**
     * Attempts to update the post ID of a WordPress Post node to its ID after being imported.
     *
     * @param string $oldSiteUrl      Site URL of the site from which the Tapestry was exported.
     * @param int &$mediaUrl           (Modified) Current post ID
     *                                  If a matching post is found, will be set to this new post ID.
     */
    public static function tryUpdateWpPostId($oldSiteUrl, &$mediaUrl)
    {
        $oldPostId = $mediaUrl;
        $siteAndPostId = $oldSiteUrl . '-' . $oldPostId;

        // Look for a post whose old ID matches the current post ID
        $queryArgs = array(
            'meta_key' => 'tapestry_export_old_post_id',
            'meta_value' => $siteAndPostId,
        );
        $query = new WP_Query($queryArgs);

        if ($query->have_posts()) {
            $query->the_post();

            $newPostId = get_the_ID();
            $mediaUrl = $newPostId;

            wp_reset_postdata();
        }
    }

    // --- Utilities ---

    /**
     * Checks that a file exists in the directory where the zip was extracted and returns its path.
     *
     * @param string $filename      Name of the file in the zip
     * @param string $tempDir      Path to the directory where zip was extracted
     * @param array &$warnings      (Modified) Import warnings generated so far
     *
     * @return string|false The path, or false if it doesn't exist.
     */
    private static function _getPathIfExists($filename, $tempDir, &$warnings)
    {
        $tempFilepath = $tempDir . DIRECTORY_SEPARATOR . $filename;
        if (!file_exists($tempFilepath) || !is_file($tempFilepath)) {
            array_push($warnings, 'File "' . $filename . '" not found in zip');
            return false;
        }

        return $tempFilepath;
    }

    /**
     * Gets the local path to a Wordpress upload given its URL.
     * Does not check if the file actually exists, only the form of the URL.
     *
     * @return string|false The path, or false if the URL is not a local WordPress upload
     */
    private static function _getLocalPath($url)
    {
        $wpUploadDir = wp_upload_dir();
        $wpUploadDirPath = $wpUploadDir['basedir'] . DIRECTORY_SEPARATOR;
        $wpUploadDirUrl = $wpUploadDir['baseurl'] . '/';

        $protocols = array("https:", "http:");
        $wpUploadDirUrlNoProtocol = str_replace($protocols, '', $wpUploadDirUrl);

        if (self::_stringStartsWith($url, $wpUploadDirUrl)) {
            $path = $wpUploadDirPath . substr($url, strlen($wpUploadDirUrl));
            return $path;
        }
        if (self::_stringStartsWith($url, $wpUploadDirUrlNoProtocol)) {
            $path = $wpUploadDirPath . substr($url, strlen($wpUploadDirUrlNoProtocol));
            return $path;
        }
        return false;
    }

    /**
     * Gets the directory where exported zip files should be placed.
     */
    private static function _getZipExportDirectory()
    {
        $uploadDir = wp_upload_dir();
        return [
            'path' => $uploadDir['basedir'] . DIRECTORY_SEPARATOR . 'tapestry' . DIRECTORY_SEPARATOR . 'export',
            'url' => $uploadDir['baseurl'] . '/tapestry/export',
        ];
    }

    /**
     * Gets the directory where extracted zips should be placed during import.
     */
    private static function _getZipImportDirectory()
    {
        $uploadDir = wp_upload_dir();
        return [
            'path' => $uploadDir['basedir'] . DIRECTORY_SEPARATOR . 'tapestry' . DIRECTORY_SEPARATOR . 'import',
            'url' => $uploadDir['baseurl'] . '/tapestry/import',
        ];
    }

    /**
     * Deletes all export files in the export directory older than 1 day
     *
     * @return int Number of files successfully deleted
     */
    public static function clearExportedZips()
    {
        $deletedCount = 0;
        $exportDir = self::_getZipExportDirectory()['path'];

        if (!empty($exportDir)) {
            $files = glob($exportDir . DIRECTORY_SEPARATOR . 'export_*.zip');
            $now = time();
            $one_day = 60 * 60 * 24;

            foreach ($files as $file) {
                if (is_file($file)) {
                    if (filemtime($file) + $one_day <= $now) {
                        $deletedCount += unlink($file);
                    }
                }
            }
        }

        return $deletedCount;
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
        $parentDir = self::_getZipImportDirectory();
        $maxAttempts = 100;
        $attempts = 0;
        $success = false;

        while (!$success && $attempts < $maxAttempts) {
            $dirname = uniqid('temp_');
            $dirpath = $parentDir['path'] . DIRECTORY_SEPARATOR . $dirname;
            $success = mkdir($dirpath, 0755, true);
            $attempts++;
        }

        return $success ? [
            'path' => $dirpath,
            'url' => $parentDir['url'] . '/' . $dirname,
        ] : null;
    }


    /**
     * Removes a temporary directory from the import directory.
     *
     * See https://stackoverflow.com/a/13468943
     */
    public static function deleteTempDirectory($dirpath)
    {
        $importDir = self::_getZipImportDirectory()['path'];

        if (!empty($dirpath) && self::_stringStartsWith($dirpath, $importDir) && file_exists($dirpath)) {
            array_map('unlink', glob($dirpath . DIRECTORY_SEPARATOR . '*.*'));
            rmdir($dirpath);
        }
    }

    private static function _stringStartsWith($str, $start)
    {
        return substr($str, 0, strlen($start)) === $start;
    }
}
