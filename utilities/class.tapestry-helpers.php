<?php

require_once dirname(__FILE__).'/class.tapestry-node-permissions.php';

/**
 * Tapestry Helper Functions.
 */
class TapestryHelpers
{
    const POST_TYPES = [
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
     * Check if the current user is allowed to an action.
     *
     * @param string $action         action to be performed
     * @param Number $nodeMetaId     node meta ID
     * @param Number $tapestryPostId post ID
     *
     * @return bool
     */
    public static function currentUserIsAllowed($action, $nodeMetaId, $tapestryPostId)
    {
        $options = TapestryNodePermissions::getNodePermissions();
        $userId = wp_get_current_user()->ID;
        $groupIds = self::getGroupIdsOfUser($userId, $tapestryPostId);
        $nodePostId = get_metadata_by_mid('post', $nodeMetaId)->meta_value->post_id;

        if ((TapestryUserRoles::isEditor())
            || (TapestryUserRoles::isAdministrator())
            || (TapestryUserRoles::isAuthorOfThePost($tapestryPostId))
            || (TapestryUserRoles::isAuthorOfThePost($nodePostId))
        ) {
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
}
