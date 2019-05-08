<?php
/**
 * Plugin Name: Tapestry
 * Description: Custom post type - Tapestry
 * Version: 1.0
 * Author: Andrew Bui
 * Author URI: https://www.andrewbui.ca
 */

/**
 * Register Tapestry type on initialization
 */
function create_tapestry_type() {
    $labels = array(
        "name" => __("Tapestry"),
        "singular_name" => __("Tapestry"),
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
function create_tapestry_node_type() {
    $labels = array(
        "name" => __("Tapestry Node"),
        "singular_name" => __("Tapestry Node"),
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
function add_my_post_types_to_query($query) {
    if (is_home() && $query->is_main_query()) {
        $query->set('post_type', array('post', 'tapestry', 'tapestry-node'));
    }
    return $query;
}
add_action('pre_get_posts', 'add_my_post_types_to_query');

/**
 * Filter the template for Tapestry post
 */
function load_tapestry_template($single) {
    global $post;
    if ( $post->post_type == 'tapestry' ) {
        if (file_exists(plugin_dir_path( __FILE__ ).'/templates/single-tapestry.php' )) {
            return plugin_dir_path( __FILE__ ).'/templates/single-tapestry.php';
        }
    }
    return $single;
}
add_filter('single_template', 'load_tapestry_template');
