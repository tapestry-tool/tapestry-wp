<?php

require_once __DIR__.'/../classes/activities/class.circle-of-support.php';

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
        $cos = new CircleOfSupport();
        $community = $cos->addCommunity(json_decode($request->get_body()));
        $cos->save();
        return $community;
    }
}
