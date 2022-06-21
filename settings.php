<?php

add_action('init', 'run_db_commands');
add_action('admin_init', 'tapestry_settings_init');
add_action('admin_menu', 'add_tapestry_settings_page');

function add_tapestry_settings_page()
{
    $tapestry_settings_page_hook_suffix = add_options_page('tapestry_plugin_settings', 'Tapestry', 'administrator', 'tapestry_settings_page', 'tapestry_settings_page_cb');

    add_action('admin_enqueue_scripts', function ($hook_suffix) use ($tapestry_settings_page_hook_suffix) {
        load_tapestry_settings_page_scripts($hook_suffix, $tapestry_settings_page_hook_suffix);
    });
}

function tapestry_settings_init()
{
    add_settings_section('tapestry_db_settings', 'Database Settings', 'tapestry_db_section_cb', 'tapestry_settings_page');
}

function load_tapestry_settings_page_scripts($hook_suffix, $tapestry_settings_page_hook_suffix)
{
    if ($hook_suffix === $tapestry_settings_page_hook_suffix) {
        wp_enqueue_script('tapestry_settings_script_js', plugin_dir_url(__FILE__).'settings.js');

        // Inject REST API url and WordPress nonce for use in JavaScript scripts
        wp_add_inline_script('tapestry_settings_script_js', 'const WP_VARIABLES = ' . json_encode(array(
            'apiUrl' => get_rest_url(null, 'tapestry-tool/v1'),
            'wpNonce' => wp_create_nonce('wp_rest'),
        )), 'before');
    }
}

function tapestry_settings_page_cb()
{
    ?>
    <div class="wrap">
        <h2>Tapestry Plugin Settings</h2>
        <?php
            do_settings_sections('tapestry_settings_page'); ?>
    </div>
    <?php
}

function tapestry_db_section_cb()
{
    echo '<p>Perform database modifications</p>'; ?>
    <form action="<?php htmlspecialchars($_SERVER["PHP_SELF"]); ?>" method="post">
        <?php
            submit_button('Clean h5p Nodes', 'primary', 'clean_h5p_nodes', false); ?>
    </form>
    <?php
}

function run_db_commands()
{
    if (isset($_POST['clean_h5p_nodes'])) {
        $query_args = array(
            'post_type' => 'tapestry_node',
            'meta_query' => array(
                array(
                   'key'     => 'tapestry_node_data',
                   'value'   => 'h5p',
                   'compare' => 'LIKE',
                ),
                array(
                    'key'     => 'tapestry_node_data',
                    'value'   => 'video',
                    'compare' => 'LIKE',
                ),
            ),
        );
        $h5p_query = new WP_Query($query_args);
        while ($h5p_query->have_posts()) {
            $h5p_query->the_post();
            $post_id = get_the_ID();
            $node_meta_data = get_post_meta($post_id, 'tapestry_node_data', true);
            if (isset($node_meta_data->mediaFormat) && $node_meta_data->mediaFormat == 'h5p' && isset($node_meta_data->mediaType) && $node_meta_data->mediaType == 'video') {
                $node_meta_data->mediaType = 'h5p';
                update_post_meta($post_id, 'tapestry_node_data', $node_meta_data);
            }
        }
        add_action('admin_notices', 'tapestry_h5p_conf_notice');
    }
}

function tapestry_h5p_conf_notice()
{
    ?>
      <div class="notice updated" >
      <p><?php _e('Clean h5p Nodes ran successfully'); ?></p>
    </div>
    <?php
}
