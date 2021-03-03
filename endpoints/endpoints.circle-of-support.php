<?php

require_once __DIR__ . '/../classes/activities/class.circle-of-support.php';
require_once __DIR__ . '/../utilities/class.tapestry-errors.php';

class CircleOfSupportEndpoints
{
    public static function get($request)
    {
        $cos = new CircleOfSupport();
        return $cos->get();
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
}
