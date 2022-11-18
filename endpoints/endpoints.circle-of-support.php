<?php

require_once __DIR__ . '/../classes/activities/class.circle-of-support.php';
require_once __DIR__ . '/../utilities/class.tapestry-errors.php';

class CircleOfSupportEndpoints
{
    public static function getRoutes()
    {
        $REST_API_GET_METHOD = 'GET';
        $REST_API_POST_METHOD = 'POST';
        $REST_API_PUT_METHOD = 'PUT';
        $REST_API_DELETE_METHOD = 'DELETE';

        return [
            'GET_CIRCLE_OF_SUPPORT' => (object) [
                'ROUTE' => '/activities/cos',
                'ARGUMENTS' => [
                    'methods' => $REST_API_GET_METHOD,
                    'callback' => 'CircleOfSupportEndpoints::get',
                    'permission_callback' => '__return_true'
                ]
            ],
            'POST_CIRCLE_OF_SUPPORT' => (object) [
                'ROUTE' => '/activities/cos',
                'ARGUMENTS' => [
                    'methods' => $REST_API_POST_METHOD,
                    'callback' => 'CircleOfSupportEndpoints::save',
                    'permission_callback' => 'CircleOfSupportEndpoints::canWriteToCos'
                ]
            ],
            'DELETE_CIRCLE_OF_SUPPORT' => (object) [
                'ROUTE' => '/activities/cos',
                'ARGUMENTS' => [
                    'methods' => $REST_API_DELETE_METHOD,
                    'callback' => 'CircleOfSupportEndpoints::delete',
                    'permission_callback' => 'CircleOfSupportEndpoints::canWriteToCos'
                ]
            ],
            'POST_CIRCLE_OF_SUPPORT_CONNECTIONS' => (object) [
                'ROUTE' => '/activities/cos/connections',
                'ARGUMENTS' => [
                    'methods' => $REST_API_POST_METHOD,
                    'callback' => 'CircleOfSupportEndpoints::addConnection',
                    'permission_callback' => 'CircleOfSupportEndpoints::canWriteToCos'
                ]
            ],
            'PUT_CIRCLE_OF_SUPPORT_CONNECTION' => (object) [
                'ROUTE' => '/activities/cos/connections/(?P<connectionId>[a-zA-Z0-9]+)',
                'ARGUMENTS' => [
                    'methods' => $REST_API_PUT_METHOD,
                    'callback' => 'CircleOfSupportEndpoints::updateConnection',
                    'permission_callback' => 'CircleOfSupportEndpoints::canWriteToCos'
                ]
            ],
            'POST_CIRCLE_OF_SUPPORT_COMMUNITIES' => (object) [
                'ROUTE' => '/activities/cos/communities',
                'ARGUMENTS' => [
                    'methods' => $REST_API_POST_METHOD,
                    'callback' => 'CircleOfSupportEndpoints::addCommunity',
                    'permission_callback' => 'CircleOfSupportEndpoints::canWriteToCos'
                ]
            ],
            'PUT_CIRCLE_OF_SUPPORT_COMMUNITIES' => (object) [
                'ROUTE' => '/activities/cos/communities/(?P<communityId>[a-zA-Z0-9]+)',
                'ARGUMENTS' => [
                    'methods' => $REST_API_PUT_METHOD,
                    'callback' => 'CircleOfSupportEndpoints::updateCommunity',
                    'permission_callback' => 'CircleOfSupportEndpoints::canWriteToCos'
                ]
            ],
            'POST_CIRCLE_OF_SUPPORT_COMMUNITIES_CONNECTION' => (object) [
                'ROUTE' => '/activities/cos/communities/(?P<communityId>[a-zA-Z0-9]+)',
                'ARGUMENTS' => [
                    'methods' => $REST_API_POST_METHOD,
                    'callback' => 'CircleOfSupportEndpoints::addConnectionToCommunity',
                    'permission_callback' => 'CircleOfSupportEndpoints::canWriteToCos'
                ]
            ],
            'DELETE_CIRCLE_OF_SUPPORT_COMMUNITIES_CONNECTION' => (object) [
                'ROUTE' => '/activities/cos/communities/(?P<communityId>[a-zA-Z0-9]+)/connections/(?P<connectionId>[a-zA-Z0-9]+)',
                'ARGUMENTS' => [
                    'methods' => $REST_API_DELETE_METHOD,
                    'callback' => 'CircleOfSupportEndpoints::removeConnectionFromCommunity',
                    'permission_callback' => 'CircleOfSupportEndpoints::canWriteToCos'
                ]
            ],
            'COS_ADD_CONNECTION_TO_CIRCLE' => (object) [
                'ROUTE' => '/activities/cos/circles/(?P<circleIndex>[0-2])',
                'ARGUMENTS' => [
                    'methods' => $REST_API_POST_METHOD,
                    'callback' => 'CircleOfSupportEndpoints::addConnectionToCircle',
                    'permission_callback' => 'CircleOfSupportEndpoints::canWriteToCos'
                ]
            ],
            'COS_REMOVE_CONNECTION_FROM_CIRCLES' => (object) [
                'ROUTE' => '/activities/cos/circles/connections/(?P<connectionId>[a-zA-Z0-9]+)',
                'ARGUMENTS' => [
                    'methods' => $REST_API_DELETE_METHOD,
                    'callback' => 'CircleOfSupportEndpoints::removeConnectionFromCircles',
                    'permission_callback' => 'CircleOfSupportEndpoints::canWriteToCos'
                ]
            ],
            'DELETE_COS_CONNECTION' => (object) [
                'ROUTE' => '/activities/cos/connections/(?P<connectionId>[a-zA-Z0-9]+)',
                'ARGUMENTS' => [
                    'methods' => $REST_API_DELETE_METHOD,
                    'callback' => 'CircleOfSupportEndpoints::deleteConnection',
                    'permission_callback' => 'CircleOfSupportEndpoints::canWriteToCos'
                ]
            ],
            'DELETE_COS_COMMUNITY' => (object) [
                'ROUTE' => '/activities/cos/communities/(?P<communityId>[a-zA-Z0-9]+)',
                'ARGUMENTS' => [
                    'methods' => $REST_API_DELETE_METHOD,
                    'callback' => 'CircleOfSupportEndpoints::deleteCommunity',
                    'permission_callback' => 'CircleOfSupportEndpoints::canWriteToCos'
                ]
            ],
        ];
    }

    public static function canWriteToCos() {
        $isDyadUser = false;

        $userId = wp_get_current_user()->ID;
        if ($userId) {
            global $TYDE_DYAD_ROLES;
            $isDyadUser = array_intersect(get_userdata($userId)->roles, array_keys($TYDE_DYAD_ROLES));
        }

        return !$isDyadUser;
    }

    public static function get($request)
    {
        $cos = new CircleOfSupport();
        return $cos->get();
    }

    public static function delete()
    {
        $cos = new CircleOfSupport();
        return $cos->delete();
    }

    public static function save($request)
    {
        $cos = new CircleOfSupport();
        return $cos->save(json_decode($request->get_body()));
    }

    public static function addConnection($request)
    {
        $cos = new CircleOfSupport();
        $connection = $cos->addConnection(json_decode($request->get_body()));
        $cos->save();
        return $connection;
    }

    public static function updateConnection($request)
    {
        $connectionId = $request['connectionId'];
        $cos = new CircleOfSupport();
        $connection = $cos->updateConnection($connectionId, json_decode($request->get_body()));
        $cos->save();
        return $connection;
    }

    public static function addCommunity($request)
    {
        try {
            $cos = new CircleOfSupport();
            $community = $cos->addCommunity(json_decode($request->get_body()));
            $cos->save();
            return $community;
        } catch (TapestryError $e) {
            return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
        }
    }

    public static function updateCommunity($request)
    {
        $communityId = $request['communityId'];
        $cos = new CircleOfSupport();
        $community = $cos->updateCommunity($communityId, json_decode($request->get_body()));
        $cos->save();
        return $community;
    }

    public static function addConnectionToCommunity($request)
    {
        $communityId = $request['communityId'];
        $cos = new CircleOfSupport();
        $community = $cos->addConnectionToCommunity(json_decode($request->get_body()), $communityId);
        $cos->save();
        return $community;
    }

    public static function removeConnectionFromCommunity($request)
    {
        $communityId = $request['communityId'];
        $connectionId = $request['connectionId'];
        $cos = new CircleOfSupport();
        $community = $cos->removeConnectionFromCommunity($connectionId, $communityId);
        $cos->save();
        return $community;
    }

    public static function addConnectionToCircle($request)
    {
        try {
            $circleIndex = $request['circleIndex'];
            $cos = new CircleOfSupport();
            $circle = $cos->addConnectionToCircle(
                $circleIndex,
                json_decode($request->get_body())->id
            );
            $cos->save();
            return $circle;
        } catch (TapestryError $e) {
            return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
        }
    }

    public static function removeConnectionFromCircles($request)
    {
        try {
            $connectionId = $request['connectionId'];
            $cos = new CircleOfSupport();
            $circle = $cos->removeConnectionFromCircles($connectionId);
            $cos->save();
            return $circle;
        } catch (TapestryError $e) {
            return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
        }
    }

    public static function deleteConnection($request)
    {
        try {
            $connectionId = $request['connectionId'];
            
            $cos = new CircleOfSupport();
            $cos->deleteConnection($connectionId);
            $cos->save();
            return $connectionId;
        } catch (TapestryError $e) {
            return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
        }
    }

    public static function deleteCommunity($request)
    {
        try {
            $communityId = $request['communityId'];
            
            $cos = new CircleOfSupport();
            $cos->deleteCommunity($communityId);
            $cos->save();
            return $communityId;
        } catch (TapestryError $e) {
            return new WP_Error($e->getCode(), $e->getMessage(), $e->getStatus());
        }
    }
}