<?php

function tapestry_accordion_update()
{
    $queryArgs = array(
        'post_type' => 'tapestry_node',
        'meta_query' => array(
            array(
               'key'     => 'tapestry_node_data',
               'value'   => '"mediaType";s:9:"accordion"',
               'compare' => 'LIKE',
            ),
        ),
    );
    $query = new WP_Query($queryArgs);
    while ($query->have_posts()) {
        $query->the_post();
        $postId = get_the_ID();
        $nodeMetaData = get_post_meta($postId, 'tapestry_node_data', true);
        if (isset($nodeMetaData->mediaType) && $nodeMetaData->mediaType == 'accordion') {
            $nodeMetaData->mediaType = 'multi-content';
            $nodeMetaData->presentationStyle = 'accordion';
            update_post_meta($postId, 'tapestry_node_data', $nodeMetaData);
        }
    }
}

function tapestry_accordion_row_update()
{
    $queryArgs = array(
        'post_type' => 'tapestry_node',
        'meta_query' => array(
            array(
               'key'     => 'tapestry_node_data',
               'value'   => '"presentationStyle";s:13:"accordion-row"',
               'compare' => 'LIKE',
            ),
        ),
    );
    $query = new WP_Query($queryArgs);
    while ($query->have_posts()) {
        $query->the_post();
        $postId = get_the_ID();
        $nodeMetaData = get_post_meta($postId, 'tapestry_node_data', true);
        if (isset($nodeMetaData->presentationStyle) && $nodeMetaData->mediapresentationStyleType == 'accordion-row') {
            unset($nodeMetaData->presentationStyle);
            $nodeMetaData->isMultiContentChild = true;
            update_post_meta($postId, 'tapestry_node_data', $nodeMetaData);
        }
    }
}

function tapestry_kaltura_uiconf_update()
{
    $uniqueConfig = get_option('kaltura_unique_config');
    if ($uniqueConfig !== false) {
        add_option('kaltura_ui_config', $uniqueConfig);
    }
}

function tapestry_plugin_update()
{
    global $TAPESTRY_VERSION_NUMBER;
    $installedVersion = get_site_option('tapestry_plugin_version');
    if (!$installedVersion) {
        add_option("tapestry_plugin_version", "2.43.0-beta");
    }
    if (version_compare($installedVersion, '2.44.0-beta', '<')) {
        tapestry_accordion_update();
        tapestry_accordion_row_update();
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        update_option('tapestry_plugin_version', $TAPESTRY_VERSION_NUMBER);
    }
    if (version_compare($installedVersion, '2.57.0-beta', '<')) {
        tapestry_kaltura_uiconf_update();
        update_option('tapestry_plugin_version', $TAPESTRY_VERSION_NUMBER);
    }
}
add_action('init', 'tapestry_plugin_update');
