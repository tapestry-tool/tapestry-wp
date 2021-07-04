<?php

function tapestry_accordion_update()
{
    $query_args = array(
        'post_type' => 'tapestry_node',
        'meta_query' => array(
            array(
               'key'     => 'tapestry_node_data',
               'value'   => '"mediaType";s:9:"accordion"',
               'compare' => 'LIKE',
            ),
        ),
    );
    $query = new WP_Query($query_args);
    while ($query->have_posts()) {
        $query->the_post();
        $post_id = get_the_ID();
        $node_meta_data = get_post_meta($post_id, 'tapestry_node_data', true);
        if (isset($node_meta_data->mediaType) && $node_meta_data->mediaType == 'accordion') {
            $node_meta_data->mediaType = 'multi-content';
            $node_meta_data->presentationStyle = 'accordion';
            update_post_meta($post_id, 'tapestry_node_data', $node_meta_data);
        }
    }
}

function tapestry_accordion_row_update()
{
    $query_args = array(
        'post_type' => 'tapestry_node',
        'meta_query' => array(
            array(
               'key'     => 'tapestry_node_data',
               'value'   => '"presentationStyle";s:13:"accordion-row"',
               'compare' => 'LIKE',
            ),
        ),
    );
    $query = new WP_Query($query_args);
    while ($query->have_posts()) {
        $query->the_post();
        $post_id = get_the_ID();
        $node_meta_data = get_post_meta($post_id, 'tapestry_node_data', true);
        if (isset($node_meta_data->presentationStyle) && $node_meta_data->mediapresentationStyleType == 'accordion-row') {
            unset($node_meta_data->presentationStyle);
            $node_meta_data->isMultiContentChild = true;
            update_post_meta($post_id, 'tapestry_node_data', $node_meta_data);
        }
    }
}

function tapestry_plugin_update()
{
    global $TAPESTRY_VERSION_NUMBER;
    $installed_version = get_site_option('tapestry_plugin_version');
    if (!$installed_version) {
        add_option("tapestry_plugin_version", "2.43.0-beta");
    }
    if (version_compare($installed_version, '2.44.0-beta', '<')) {
        tapestry_accordion_update();
        tapestry_accordion_row_update();
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        update_option('tapestry_plugin_version', $TAPESTRY_VERSION_NUMBER);
    }
}
add_action('init', 'tapestry_plugin_update');
