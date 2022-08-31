<?php

require_once dirname(__FILE__).'/class.tapestry-node-permissions.php';

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
        include_once(ABSPATH . 'wp-admin/includes/image.php');

        $imagetype = end(explode('/', getimagesize($imageURL)['mime']));
        $uniq_name = date('dmY').''.(int) microtime(true);
        $filename = $uniq_name.'.'.$imagetype;

        $uploaddir = wp_upload_dir();
        $uploadfile = $uploaddir['path'] . '/' . $filename;
        $contents= file_get_contents($imageURL);
        $savefile = fopen($uploadfile, 'w');
        fwrite($savefile, $contents);
        fclose($savefile);

        $wp_filetype = wp_check_filetype(basename($filename), null);
        $attachment = array(
            'post_mime_type' => $wp_filetype['type'],
            'post_title' => $filename,
            'post_content' => '',
            'post_status' => 'inherit'
        );

        $attachment_id = wp_insert_attachment($attachment, $uploadfile);
        $imagenew = get_post($attachment_id);
        $fullsizepath = get_attached_file($imagenew->ID);
        $attach_data = wp_generate_attachment_metadata($attachment_id, $fullsizepath);
        wp_update_attachment_metadata($attachment_id, $attach_data);

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

    /**
     * Getters for Kaltura configuration variables.
     * Return null if LOAD_KALTURA is false.
     */
    public static function getKalturaAdminSecret()
    {
        return KALTURA_OVERRIDE_CONFIG ? get_option('kaltura_admin_secret') : (KALTURA_DEFAULT_CONFIG ? KALTURA_ADMIN_SECRET : null);
    }

    public static function getKalturaPartnerId()
    {
        return KALTURA_OVERRIDE_CONFIG ? get_option('kaltura_partner_id') : (KALTURA_DEFAULT_CONFIG ? KALTURA_PARTNER_ID : null);
    }

    public static function getKalturaServiceUrl()
    {
        return KALTURA_OVERRIDE_CONFIG ? get_option('kaltura_service_url') : (KALTURA_DEFAULT_CONFIG ? KALTURA_SERVICE_URL : null);
    }

    public static function getKalturaUniqueConfig()
    {
        return KALTURA_OVERRIDE_CONFIG ? get_option('kaltura_unique_config') : (KALTURA_DEFAULT_CONFIG ? KALTURA_UNIQUE_CONFIG : null);
    }

    /**
     * Return the name of the Kaltura category a video should be sorted under.
     */
    public static function getKalturaCategoryName($tapestryPostId) {
        if (get_option('kaltura_category_structure') === 'tapestry_name') {
            $tapestry = new Tapestry($tapestryPostId);
            return $tapestry->getSettings()->title;
        } else {
            // Categorize by date by default
            return date('Y/m/d');
        }
    }

    /**
     * Update the Kaltura upload status of a video node.
     *
     * @param TapestryNode      $node           Video node to update
     * @param string            $newStatus      Upload status
     * @param MediaEntry|null   $kalturaData    (optional) Response from Kaltura API
     */
    public static function saveVideoUploadStatusInNode($node, $newStatus, $kalturaData = null)
    {
        $typeData = $node->getTypeData();
        $typeData->kalturaData['uploadStatus'] = $newStatus;

        if ($kalturaData) {
            $typeData->kalturaData['id'] = $kalturaData->id;
        }

        $node->save();
    }

    /**
     * Update video node data and delete the local video after it has been uploaded to Kaltura.
     *
     * @param TapestryNode  $node               Video node to update
     * @param MediaEntry    $kalturaData        Response from Kaltura API
     * @param boolean       $useKalturaPlayer   If true, also switch the video to use Kaltura player
     * @param string        $videoPath          Path to the video file.
     */
    public static function saveAndDeleteLocalVideo($node, $kalturaData, $useKalturaPlayer, $videoPath)
    {
        $node->set((object) ['mediaFormat' => 'kaltura']);
        $typeData = $node->getTypeData();
        $typeData->mediaURL = $kalturaData->dataUrl.'?.mp4';
        $typeData->kalturaId = $kalturaData->id;

        // Save Kaltura account info so we can still show Kaltura player, even if LOAD_KALTURA is currently false
        if (!isset($typeData->kalturaData)) {
            $typeData->kalturaData = [];
        }
        $typeData->kalturaData['partnerId'] = self::getKalturaPartnerId();
        $typeData->kalturaData['serviceUrl'] = self::getKalturaServiceUrl();
        $typeData->kalturaData['uniqueConfiguration'] = self::getKalturaUniqueConfig();

        $typeData->videoPlayer = $useKalturaPlayer ? 'kaltura' : 'regular';

        $node->save();

        wp_delete_file($videoPath);
    }

    /**
     * Assumes the node's mediaURL is a local upload, and gets its file path
     *
     * @param TapestryNode  $node
     */
    public static function getPathToMedia($node)
    {
        $upload_folder = wp_upload_dir()['basedir'];
        $upload_folder_url = wp_upload_dir()['baseurl'];
        $mediaURL = $node->getTypeData()->mediaURL;

        $file_obj = new StdClass();
        $file_obj->file_path = substr_replace($mediaURL, $upload_folder, 0, strlen($upload_folder_url));
        $file_obj->name = pathinfo($mediaURL)['basename'];

        return $file_obj;
    }

    /**
     * Return all videos that can be uploaded to Kaltura.
     * If Tapestry ID provided, returns only videos in that Tapestry.
     * Otherwise, returns uploadable videos in all Tapestries.
     *
     * @param int|string $tapestryPostId    Tapestry ID
     *
     * @return array
     */
    public static function getVideosToUpload($tapestryPostId)
    {
        if (empty($tapestryPostId)) {
            $tapestries = get_posts(['post_type' => 'tapestry', 'numberposts' => -1]);
            $videos_to_upload = array();

            foreach ($tapestries as $tapestry) {
                $videos_to_upload = array_merge($videos_to_upload, self::_getVideosToUploadInTapestry($tapestry->ID));
            }

            return $videos_to_upload;
        } else {
            return self::_getVideosToUploadInTapestry($tapestryPostId);
        }
    }

    /**
     * Checks if a video can be uploaded to Kaltura.
     * Only videos added via upload to WordPress can be transferred to Kaltura.
     *
     * @param TapestryNode  $node
     * @return bool
     */
    public static function videoCanBeUploaded($node)
    {
        $nodeMeta = $node->getMeta();
        $nodeTypeData = $node->getTypeData();
        $upload_dir_url = wp_upload_dir()['baseurl'];

        return $nodeMeta->mediaType == "video" && substr($nodeTypeData->mediaURL, 0, strlen($upload_dir_url)) === $upload_dir_url;
    }

    /**
     * Checks if the user has defined a maximum video upload size for Kaltura that is smaller than the WordPress max upload size,
     * and if so, whether a video is too large to be uploaded.
     *
     * Assumes that the input video can be uploaded to Kaltura (check before calling).
     *
     * @param TapestryNode  $node
     * @return boolean  True if the user has defined no maximum video upload size, or it is not smaller than the WordPress max upload size.
     *                  Otherwise, returns true if the video is within the user-defined limit.
     */
    public static function checkVideoFileSize($node)
    {
        // Overridden value in WordPress settings
        $max_file_size_setting = get_option('tapestry_kaltura_upload_max_file_size');

        // Value defined in wp-config.php
        $max_file_size_constant = defined('TAPESTRY_KALTURA_UPLOAD_MAX_FILE_SIZE') ? TAPESTRY_KALTURA_UPLOAD_MAX_FILE_SIZE : null;

        $user_defined_size_string = !empty($max_file_size_setting) ? $max_file_size_setting : $max_file_size_constant;
        if (empty($user_defined_size_string)) {
            return true;
        }

        $user_defined_max_upload_size = wp_convert_hr_to_bytes($user_defined_size_string);

        if ($user_defined_max_upload_size >= wp_max_upload_size()) {
            return true;
        }

        $file = self::getPathToMedia($node);
        $filesize = self::_realFileSize($file->file_path);

        return $filesize <= $user_defined_max_upload_size;
    }

    // Get the actual file size for large files.
    // https://www.php.net/manual/en/function.filesize.php#113457
    private static function _realFileSize($path)
    {
        $fp = fopen($path, 'r');

        $pos = 0;
        $size = 1073741824;
        fseek($fp, 0, SEEK_SET);
        while ($size > 1) {
            fseek($fp, $size, SEEK_CUR);

            if (fgetc($fp) === false) {
                fseek($fp, -$size, SEEK_CUR);
                $size = (int)($size / 2);
            } else {
                fseek($fp, -1, SEEK_CUR);
                $pos += $size;
            }
        }

        while (fgetc($fp) !== false) {
            $pos++;
        }

        fclose($fp);

        return $pos;
    }

    private static function _getVideosToUploadInTapestry($tapestryPostId)
    {
        $videos_to_upload = array();
        $tapestry = new Tapestry($tapestryPostId);

        foreach ($tapestry->getNodeIds() as $nodeID) {
            $node = new TapestryNode($tapestryPostId, $nodeID);
            if (self::videoCanBeUploaded($node)) {
                $video = (object) [
                    'tapestryID' => (int) $tapestryPostId,
                    'nodeID' => $nodeID,
                    'nodeTitle' => $node->getTitle(),
                    'withinSizeLimit' => self::checkVideoFileSize($node),
                ];
                array_push($videos_to_upload, $video);
            }
        }

        return $videos_to_upload;
    }
}
