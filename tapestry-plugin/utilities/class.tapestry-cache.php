<?php

/**
 * Tapestry Cache Functions.
 */
class TapestryCache
{
    public static $_cache = [];

    /**
     * Check if the cache exists for the given function name and set of args.
     *
     * @param string $function_name name of function
     * @param array  $args_list     list of unique arguments
     *
     * @return bool
     */
    public static function exists($function_name, $args_list)
    {
        $args_uuid = self::makeUUIDFromArgs($args_list);
        if (array_key_exists($function_name, self::$_cache)) {
            if (array_key_exists($args_uuid, self::$_cache[$function_name])) {
                return true;
            }
        }

        return false;
    }

    /**
     * If the cache exists for the given function name and set of args, return the results.
     *
     * @param string $function_name name of function
     * @param array  $args_list     list of unique arguments
     *
     * @return bool
     */
    public static function get($function_name, $args_list)
    {
        $args_uuid = self::makeUUIDFromArgs($args_list);
        if (self::exists($function_name, $args_list)) {
            return self::$_cache[$function_name][$args_uuid];
        }

        return null;
    }

    /**
     * Set the cache for the given function name and set of args.
     *
     * @param string $function_name name of function
     * @param array  $args_list     list of unique arguments
     * @param mixed  $results       results to be cached
     *
     * @return mixed
     */
    public static function set($function_name, $args_list, $results)
    {
        $args_uuid = self::makeUUIDFromArgs($args_list);
        if (!array_key_exists($function_name, self::$_cache)) {
            self::$_cache[$function_name] = [];
        }
        self::$_cache[$function_name][$args_uuid] = $results;

        return $results;
    }

    private static function makeUUIDFromArgs($arg_list)
    {
        $md5this = '';
        for ($i = 0; $i < count($arg_list); ++$i) {
            $md5this .= $i.':'.serialize($arg_list[$i]).';';
        }

        return md5($md5this);
    }
}
