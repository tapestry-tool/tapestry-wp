<?php

/**
 * Plugin Name: Tapestry
 * Plugin URI: https://www.tapestry-tool.com
 * Description: Custom post type - Tapestry
 * Version: 1.0
 * Author: Andrew Bui
 * Author URI: https://www.andrewbui.ca
 */

/**
 * Register endpoints
 */
require_once dirname(__FILE__) . '/endpoints.php';

/**
 * Register Tapestry type on initialization
 */
function create_tapestry_type()
{
    $labels = array(
        "name" => __("Tapestries"),
        "singular_name" => __("Tapestry"),
        "all_items" => __("All Tapestries")
    );
    $args = array(
        "label" => __("tapestry"),
        "labels" => $labels,
        "description" => "",
        "public" => true,
        "publicly_queryable" => true,
        "show_ui" => true,
        "delete_with_user" => false,
        "show_in_rest" => true,
        "rest_base" => "",
        "rest_controller_class" => "WP_REST_Posts_Controller",
        "has_archive" => false,
        "show_in_menu" => true,
        "show_in_nav_menus" => true,
        "exclude_from_search" => false,
        "capability_type" => "post",
        "map_meta_cap" => true,
        "hierarchical" => false,
        "rewrite" => array("slug" => "tapestry_test", "with_front" => true),
        "query_var" => true,
        "supports" => array("title", "editor", "thumbnail"),
    );
    register_post_type('tapestry', $args);
}
add_action('init', 'create_tapestry_type');

/**
 * Register Tapestry Node type on initialization
 */
function create_tapestry_node_type()
{
    $labels = array(
        "name" => __("Tapestry Nodes"),
        "singular_name" => __("Tapestry Node"),
        "all_items" => __("All Tapestry Nodes")
    );
    $args = array(
        "label" => __("tapestry-node"),
        "labels" => $labels,
        "description" => "",
        "public" => true,
        "publicly_queryable" => true,
        "show_ui" => true,
        "delete_with_user" => false,
        "show_in_rest" => true,
        "rest_base" => "",
        "rest_controller_class" => "WP_REST_Posts_Controller",
        "has_archive" => false,
        "show_in_menu" => true,
        "show_in_nav_menus" => true,
        "exclude_from_search" => false,
        "capability_type" => "post",
        "map_meta_cap" => true,
        "hierarchical" => false,
        "rewrite" => array("slug" => "tapestry_node_test", "with_front" => true),
        "query_var" => true,
        "supports" => array("title", "editor", "thumbnail"),
    );
    register_post_type('tapestry-node', $args);
}
add_action('init', 'create_tapestry_node_type');

/**
 * Show posts of Tapestry type on the home page
 */
function add_tapestry_post_types_to_query($query)
{
    if (is_home() && $query->is_main_query()) {
        $query->set('post_type', array('post', 'tapestry', 'tapestry-node'));
    }
    return $query;
}
add_action('pre_get_posts', 'add_tapestry_post_types_to_query');

/**
 * Filter the template for Tapestry post
 */
function load_tapestry_template($singleTemplate)
{
    global $post;
    if ($post->post_type === 'tapestry') {
        $singleTemplate = dirname(__FILE__) . '/templates/single-tapestry.php';
    }
    return $singleTemplate;
}
add_filter('single_template', 'load_tapestry_template');

/**
 * Set Up Tapestry Post Upon Insertion
 *
 * @param   Integer $postId Post ID
 * @param   Object  $post   Post Object
 * @param   Boolean $update Post Object
 *
 * @return  Object  Null
 */
function add_tapestry_post_meta_on_publish($postId, $post, $update = false)
{
    if (!isset($postId) || !isset($post) || get_post_type($postId) != 'tapestry') {
        return;
    }

    $tapestryController = new TapestryController($postId);
    $tapestry = $tapestryController->get();

    if ($update && !empty($tapestry->settings)) {
        $tapestry->settings->tapestrySlug = $post->post_name;
        $tapestry->settings->title = $post->post_title;
        $tapestry->settings->status = $post->post_status;
    } else {
        $tapestry->settings = (object) array(
            'tapestrySlug'  => $post->post_name,
            'title'         => $post->post_title,
            'status'        => $post->post_status
        );
    }

    $tapestryController->set($tapestry);
    $tapestryController->saveOnPublish();
}
add_action('publish_tapestry', 'add_tapestry_post_meta_on_publish', 10, 3);
