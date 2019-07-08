<?php
require_once dirname(__FILE__) . "/class.tapestry-node-permissions.php";

class TapestryHelpers
{
    const POST_TYPES = [
        'TAPESTRY'      => 'tapestry',
        'TAPESTRY_NODE' => 'tapestry_node'
    ];

    static function isValidTapestry($postId)
    {
        return is_numeric($postId) && get_post_type($postId) == 'tapestry';
    }

    static function isValidTapestryNode($nodeMetaId)
    {
        if (is_numeric($nodeMetaId)) {
            $nodeMetadata = get_metadata_by_mid('post', $nodeMetaId);
            if ((!empty($nodeMetadata->meta_value))
                && (!empty($nodeMetadata->meta_value->post_id))
            ) {
                $nodePostId = $nodeMetadata->meta_value->post_id;
                return get_post_type($nodePostId) == 'tapestry_node';
            }
        }
        return false;
    }

    static function isValidTapestryGroup($groupMetaId)
    {
        if (is_numeric($groupMetaId)) {
            $groupMetadata = get_metadata_by_mid('post', $groupMetaId);
            return is_object($groupMetadata->meta_value)
                && $groupMetadata->meta_value->type == 'tapestry_group';
        }
        return false;
    }

    static function isChildNodeOfTapestry($nodeMetaId, $tapestryPostId)
    {
        if (is_numeric($nodeMetaId) && self::isValidTapestry($tapestryPostId)) {
            $tapestry = get_post_meta($tapestryPostId, 'tapestry', true);
            return in_array($nodeMetaId, $tapestry->nodes);
        }
        return false;
    }

    static function getGroupIdsOfUser($userId, $tapestryPostId)
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

    static function updatePost($post, $postType = 'tapestry', $postId = null)
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
        return wp_insert_post(array(
            'ID' => $postId,
            'post_type' => $postType,
            'post_status' => $postStatus,
            'post_title' => $postTitle
        ), true);
    }

    static function currentUserIsAllowed($action, $nodeMetaId, $tapestryPostId)
    {
        $options = TapestryNodePermissions::getNodePermissions();
        $userId = wp_get_current_user()->ID;
        $groupIds = self::getGroupIdsOfUser($userId, $tapestryPostId);

        if ((TapestryUserRoles::isEditor())
            || (TapestryUserRoles::isAdministrator())
            || (TapestryUserRoles::isAuthorOfThePost($tapestryPostId))
        ) {
            return true;
        } else {
            $nodePermissions = get_metadata_by_mid('post', $nodeMetaId)->meta_value->permissions;
            if ((property_exists($nodePermissions, 'public')
                    && in_array($options[$action], $nodePermissions->public))
                || (property_exists($nodePermissions, 'user-' . $userId)
                    && in_array($options[$action], $nodePermissions->{'user-' . $userId}))
            ) {
                return true;
            } else {
                foreach ($groupIds as $groupId) {
                    if ((property_exists($nodePermissions, 'group-' . $groupId))
                        && (in_array($options[$action], $nodePermissions->{'group-' . $groupId}))
                    ) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
}
