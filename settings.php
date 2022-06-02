<?php

add_action('init', 'run_db_commands');
add_action('admin_init', 'tapestry_settings_init');
add_action('admin_menu', 'add_tapestry_settings_page');
add_action('admin_enqueue_scripts', 'load_tapestry_settings_page_scripts');

function add_tapestry_settings_page()
{
    add_options_page('tapestry_plugin_settings', 'Tapestry', 'administrator', 'tapestry_settings_page', 'tapestry_settings_page_cb');
}

function tapestry_settings_init()
{
    add_settings_section('tapestry_db_settings', 'Database Settings', 'tapestry_db_section_cb', 'tapestry_settings_page');

    add_settings_section('tapestry_kaltura_upload_dashboard', 'Kaltura Video Upload', 'tapestry_kaltura_upload_dashboard_cb', 'tapestry_settings_page');
}

function load_tapestry_settings_page_scripts($hook)
{
    // TO DO: find a better way to test the current settings page
    if (str_ends_with($hook, 'tapestry_settings_page')) {
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
    <h2>Tapestry Plugin Settings</h2>
    <?php
        do_settings_sections('tapestry_settings_page');
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

function tapestry_kaltura_upload_dashboard_cb()
{
    echo '<p>Transfer all uploaded videos in your Tapestries from your local server to Kaltura.</p>';

    echo '<p>';
    submit_button('Start Upload', 'primary', 'start_kaltura_upload', false, array('onclick' => 'startKalturaUpload()', 'disabled' => true));
    echo '</p>';

    echo '
    <table id="upload_progress_table" class="widefat">
        <thead>
        <tr>
            <th>Tapestry ID</th>
            <th>Node ID</th>
            <th>Status</th>
            <th>Additional information</th>
        </tr>
        </thead>
    </table>
    ';

    echo '<p>';
    submit_button('Refresh Now', 'secondary', 'refresh_kaltura_upload_progress', false, array('onclick' => 'refreshKalturaUploadProgress()'));
    echo '</p>';
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
