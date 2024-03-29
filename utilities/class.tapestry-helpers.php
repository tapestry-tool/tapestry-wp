<?php

require_once dirname(__FILE__).'/../classes/class.constants.php';

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

        return self::createAttachment($uploadfile, true);
    }

    /**
     * Add a media item (image, video) as a WordPress attachment.
     *
     * @param string $filepath          Filepath of the file to add.
     * @param bool $generate_metadata   If true, also generates metadata and image sub-sizes.
     */
    public static function createAttachment($filepath, $generate_metadata = false)
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
     * The checks are similar to the Helpers.hasPermission checks in the frontend.
     *
     * @param string $action         action to be performed
     * @param Number $nodeMetaId     node meta ID
     * @param Number $tapestryPostId post ID
     *
     * @return bool
     */
    public static function userIsAllowed($action, $nodeMetaId, $tapestryPostId, $superuser_override = true, $_userId = null)
    {
        // Section 1: Fetching of information & special cases

        $userId = $_userId;
        if (is_null($userId)) {
            $userId = wp_get_current_user()->ID;
        }

        // Guests never have any permissions other than read
        if ($userId === 0 && $action !== UserActions::READ) {
            return false;
        }

        $user = new TapestryUser($userId);
        $canEditTapestry = $user->canEdit($tapestryPostId);

        // Standalone nodes - only admins can publish
        if ($nodeMetaId === null) {
            return $action === UserActions::ADD && $canEditTapestry;
        }

        // Fetch information required by subsequent checks
        $nodePostId = get_metadata_by_mid('post', $nodeMetaId)->meta_value->post_id;

        $tapestry = new Tapestry($tapestryPostId);
        $node = $tapestry->getNode($nodeMetaId);
        $nodeMeta = $node->getMeta();

        $groupIds = self::getGroupIdsOfUser($userId, $tapestryPostId);

        // Section 2: Checks related to draft nodes

        /**
         * If node is a draft (accepted draft nodes are PUBLISHED nodes, so they are not considered here):
         * - If node is not submitted for review:
         *  - Allow all actions except "add" for original author
         *  - Allow all actions except "edit" for reviewer if node is rejected and showRejected is true
         * - If node is submitted for review:
         *  - Only allow "read" for original author
         *  - Allow all actions except "edit" for reviewer
         */
        if ($nodeMeta->status === NodeStatus::DRAFT) {
            if ($user->isAuthorOfThePost($nodePostId)) {
                if ($action === UserActions::READ || $canEditTapestry) {
                    return true;
                }
                return $nodeMeta->reviewStatus !== NodeStatus::SUBMIT && $action !== UserActions::ADD;
            }
            if ($canEditTapestry) {
                if ($action === UserActions::EDIT) {
                    return false;
                }
                return $nodeMeta->reviewStatus === NodeStatus::SUBMIT || $nodeMeta->reviewStatus === NodeStatus::REJECT;
            }
            return false;
        }

        // Section 3: Override for admins / authors

        // User has edit permissions for Tapestry
        if ($user->canEdit($tapestryPostId) && $superuser_override) {
            return true;
        }

        // User is the author of the node (unless node was submitted, then accepted)
        if ($user->isAuthorOfThePost($nodePostId) && $nodeMeta->reviewStatus !== NodeStatus::ACCEPT) {
            return true;
        }

        // Section 4: Node-specific permissions

        $nodePermissions = get_metadata_by_mid('post', $nodeMetaId)->meta_value->permissions;

        // User has a permission associated with its ID
        if (
            property_exists($nodePermissions, 'user-'.$userId) &&
            in_array($action, $nodePermissions->{'user-'.$userId})
        ) {
            return true;
        }

        // Node has public permissions
        if (
            property_exists($nodePermissions, 'public') &&
            in_array($action, $nodePermissions->public)
        ) {
            return true;
        }

        // Node has authenticated permissions
        if (
            is_user_logged_in() &&
            property_exists($nodePermissions, 'authenticated') &&
            in_array($action, $nodePermissions->authenticated)
        ) {
            return true;
        }

        // User has a role that is allowed in the node
        if (is_user_logged_in()) {
            $roles = wp_get_current_user()->roles;
            $allowedRoles = ['administrator', 'editor', 'author'];
            foreach ($roles as $role) {
                // Node has role-specific permissions
                if (
                    property_exists($nodePermissions, $role) &&
                    in_array($action, $nodePermissions->$role)
                ) {
                    return true;
                }
                // The role has general edit permissions
                if (in_array($role, $allowedRoles)) {
                    return true;
                }
            }
        }

        // User is in a group that is allowed in the node
        // ! This check is not implemented in the frontend
        foreach ($groupIds as $groupId) {
            if (
                (property_exists($nodePermissions, 'group-'.$groupId))
                && (in_array($action, $nodePermissions->{'group-'.$groupId}))
            ) {
                return true;
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
     * Get the file path of a local WordPress upload by its URL.
     *
     * @param string $url
     * @return object|null     Returns null if the URL is not a local upload.
     */
    public static function getPathToMedia($url)
    {
        if (!self::isLocalUpload($url)) {
            return null;
        }

        $upload_folder = wp_upload_dir()['basedir'];
        $upload_folder_url = wp_upload_dir()['baseurl'];

        $file_obj = new stdClass();
        $file_obj->file_path = substr_replace($url, $upload_folder, 0, strlen($upload_folder_url));
        $file_obj->name = pathinfo($url, PATHINFO_BASENAME);
        $file_obj->extension = pathinfo($url, PATHINFO_EXTENSION);

        return $file_obj;
    }

    /**
     * Checks if a URL represents a local upload (a file in the WordPress upload directory).
     * Only checks the URL form, not that the file actually exists.
     */
    public static function isLocalUpload($url)
    {
        $upload_dir_url = wp_upload_dir()['baseurl'];
        return substr($url, 0, strlen($upload_dir_url)) === $upload_dir_url;
    }

    // Get the actual file size for large files.
    // https://www.php.net/manual/en/function.filesize.php#113457
    public static function getRealFileSize($path)
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
}
