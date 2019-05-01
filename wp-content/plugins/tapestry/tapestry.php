<?php
/**
 * Plugin Name: Tapestry
 * Description: Custom post type - Tapestry
 * Version: 1.0
 * Author: Andrew Bui
 * Author URI: https://www.andrewbui.ca
 */

function create_tapestry_type()
{
	$labels = array(
		"name" => __("Tapestry", "custom-post-type-ui"),
		"singular_name" => __("Tapestry", "custom-post-type-ui"),
	);
	$args = array(
		"label" => __("tapestry", "custom-post-type-ui"),
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

// Show posts of 'post' and 'tapestry' post types on home page
function add_my_post_types_to_query($query)
{
	if (is_home() && $query->is_main_query())
		$query->set('post_type', array('post', 'tapestry', 'tapestry-node'));
	return $query;
}

add_action('init', 'create_tapestry_type');
add_action('pre_get_posts', 'add_my_post_types_to_query');
