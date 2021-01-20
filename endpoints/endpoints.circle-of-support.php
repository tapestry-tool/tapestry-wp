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
        $cos->addConnection(json_decode($request->get_body()));
        return $cos->save();
    }

    public static function updateConnection($request)
    {
    }
}
