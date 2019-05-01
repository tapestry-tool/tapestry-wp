<?php
/**
 * Plugin Name: Tapestry Node
 * Description: Custom post type - Tapestry Node
 * Version: 1.0
 * Author: Andrew Bui
 * Author URI: https://www.andrewbui.ca
 */

function create_tapestry_node_type()
{
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
