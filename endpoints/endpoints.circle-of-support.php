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
                ]
            ],
            'POST_CIRCLE_OF_SUPPORT' => (object) [
                'ROUTE' => '/activities/cos',
                'ARGUMENTS' => [
                    'methods' => $REST_API_POST_METHOD,
                    'callback' => 'CircleOfSupportEndpoints::save'
                ]
            ],
            'DELETE_CIRCLE_OF_SUPPORT' => (object) [
                'ROUTE' => '/activities/cos',
                'ARGUMENTS' => [
                    'methods' => $REST_API_DELETE_METHOD,
                    'callback' => 'CircleOfSupportEndpoints::delete'
                ]
            ],
            'POST_CIRCLE_OF_SUPPORT_CONNECTIONS' => (object) [
                'ROUTE' => '/activities/cos/connections',
                'ARGUMENTS' => [
                    'methods' => $REST_API_POST_METHOD,
                    'callback' => 'CircleOfSupportEndpoints::addConnection'
                ]
            ],
            'PUT_CIRCLE_OF_SUPPORT_CONNECTION' => (object) [
                'ROUTE' => '/activities/cos/connections/(?P<connectionId>[a-zA-Z0-9]+)',
                'ARGUMENTS' => [
                    'methods' => $REST_API_PUT_METHOD,
                    'callback' => 'CircleOfSupportEndpoints::updateConnection'
                ]
            ],
            'POST_CIRCLE_OF_SUPPORT_COMMUNITIES' => (object) [
                'ROUTE' => '/activities/cos/communities',
                'ARGUMENTS' => [
                    'methods' => $REST_API_POST_METHOD,
                    'callback' => 'CircleOfSupportEndpoints::addCommunity'
                ]
            ],
            'PUT_CIRCLE_OF_SUPPORT_COMMUNITIES' => (object) [
                'ROUTE' => '/activities/cos/communities/(?P<communityId>[a-zA-Z0-9]+)',
                'ARGUMENTS' => [
                    'methods' => $REST_API_PUT_METHOD,
                    'callback' => 'CircleOfSupportEndpoints::updateCommunity'
                ]
            ],
            'POST_CIRCLE_OF_SUPPORT_COMMUNITIES_CONNECTION' => (object) [
                'ROUTE' => '/activities/cos/communities/(?P<communityId>[a-zA-Z0-9]+)',
                'ARGUMENTS' => [
                    'methods' => $REST_API_POST_METHOD,
                    'callback' => 'CircleOfSupportEndpoints::addConnectionToCommunity'
                ]
            ],
            'DELETE_CIRCLE_OF_SUPPORT_COMMUNITIES_CONNECTION' => (object) [
                'ROUTE' => '/activities/cos/communities/(?P<communityId>[a-zA-Z0-9]+)/connections/(?P<connectionId>[a-zA-Z0-9]+)',
                'ARGUMENTS' => [
                    'methods' => $REST_API_DELETE_METHOD,
                    'callback' => 'CircleOfSupportEndpoints::removeConnectionFromCommunity'
                ]
            ],
            'COS_ADD_CONNECTION_TO_CIRCLE' => (object) [
                'ROUTE' => '/activities/cos/circles/(?P<circleIndex>[0-2])',
                'ARGUMENTS' => [
                    'methods' => $REST_API_POST_METHOD,
                    'callback' => 'CircleOfSupportEndpoints::addConnectionToCircle'
                ]
            ],
            'COS_REMOVE_CONNECTION_FROM_CIRCLE' => (object) [
                'ROUTE' => '/activities/cos/circles/(?P<circleIndex>[0-2])/connections/(?P<connectionId>[a-zA-Z0-9]+)',
                'ARGUMENTS' => [
                    'methods' => $REST_API_DELETE_METHOD,
                    'callback' => 'CircleOfSupportEndpoints::removeConnectionFromCircle'
                ]
            ],
            'DELETE_COS_CONNECTION' => (object) [
                'ROUTE' => '/activities/cos/connections/(?P<connectionId>[a-zA-Z0-9]+)',
                'ARGUMENTS' => [
                    'methods' => $REST_API_DELETE_METHOD,
                    'callback' => 'CircleOfSupportEndpoints::deleteConnection'
                ]
            ],
        ];
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

    public static function removeConnectionFromCircle($request)
    {
        try {
            $circleIndex = $request['circleIndex'];
            $connectionId = $request['connectionId'];
            $cos = new CircleOfSupport();
            $circle = $cos->removeConnectionFromCircle($circleIndex, $connectionId);
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
}
