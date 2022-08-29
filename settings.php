<?php

add_action('init', 'run_db_commands');
add_action('admin_init', 'tapestry_settings_init');
add_action('admin_init', 'register_tapestry_settings');
add_action('admin_menu', 'add_tapestry_settings_page');

function add_tapestry_settings_page()
{
    $tapestry_settings_page_hook_suffix = add_options_page('tapestry_plugin_settings', 'Tapestry', 'administrator', 'tapestry_settings_page', 'tapestry_settings_page_cb');

    add_action('admin_enqueue_scripts', function ($hook_suffix) use ($tapestry_settings_page_hook_suffix) {
        load_tapestry_settings_page_scripts($hook_suffix, $tapestry_settings_page_hook_suffix);
    });
}

function register_tapestry_settings()
{
    $args = [
        'type' => 'string',
        'show_in_rest' => false,
        'sanitize_callback' => function ($value) {
            $category_values = ['date', 'tapestry_name'];
            return in_array($value, $category_values) ? $value : $category_values[0]; // Default is 'date'
        },
        'default' => null,
    ];
    register_setting('tapestry_kaltura_upload_settings', 'kaltura_category_structure', array_merge($args, ['description' => 'Category structure of uploaded videos']));
}

function tapestry_settings_init()
{
    add_settings_section('tapestry_db_settings', 'Database Settings', 'tapestry_db_section_cb', 'tapestry_settings_page');
    add_settings_section('tapestry_kaltura_settings', 'Kaltura Upload', 'tapestry_kaltura_section_cb', 'tapestry_settings_page');
}

function load_tapestry_settings_page_scripts($hook_suffix, $tapestry_settings_page_hook_suffix)
{
    if ($hook_suffix === $tapestry_settings_page_hook_suffix) {
        wp_enqueue_style( 'tapestry_settings_styles', plugin_dir_url(__FILE__).'settings.css');
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

function tapestry_kaltura_section_cb()
{
    $kaltura_category_structure = get_option('kaltura_category_structure', '');
    $category_values = ['date', 'tapestry_name'];

    $site_url = get_bloginfo('url');
    $current_date = date('Y/m/d');

    ?>
    <h4>Categorization</h4>
    <p>
        Choose a category structure for videos uploaded to Kaltura.
    </p>
    <form action="options.php" method="post">
        <?php
            settings_fields('tapestry_kaltura_upload_settings');
        ?>
        <table class="form-table" role="presentation">
            <tbody>
                <tr>
                    <th scope="row">
                        <label>
                            <input 
                                name="kaltura_category_structure"
                                type="radio"
                                value="<?php echo $category_values[0]?>"
                                <?php checked($category_values[0], $kaltura_category_structure) ?>
                            />
                            By date
                        </label>
                    </th>
                    <td>
                        <code>Tapestry > <?php echo $site_url ?> > <?php echo $current_date ?></code>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label>
                            <input
                                name="kaltura_category_structure"
                                type="radio"
                                value="<?php echo $category_values[1]?>"
                                <?php checked($category_values[1], $kaltura_category_structure) ?>
                            />
                            By Tapestry name
                        </label>
                    </th>
                    <td>
                        <code>Tapestry > <?php echo $site_url ?> > My Tapestry</code>
                    </td>
                </tr>
            </tbody>
        </table>
        <?php 
            submit_button('Save Changes', 'primary', 'save-kaltura-upload-settings', false); ?>
    </form>
    <h4>Clean Uploaded Videos</h4>
    <div class="postbox tapestry-settings-notice" id="upload_in_progress_notice" style="display: none">
        <p>
            <b>Note:</b> An upload is currently in progress.
            It is recommended to wait for the upload to complete before cleaning uploaded videos.
        </p>
    </div>
    <p>
        If your Kaltura upload was interrupted, the complete data may not be available for videos that did not finish uploading.
        <br/>
        You can refresh the status of any videos that are still marked "converting" below.
    </p>
    <p>
        <i>Options:</i>
        <br/>
        <label for="use_kaltura_player">
            <input type="checkbox" id="use_kaltura_player" name="use_kaltura_player" value="1"/>
            Switch videos that uploaded successfully to use Kaltura media player
        </label>
    </p>
    <p>
        <button type="button" class="button button-primary" onclick="cleanUploadedVideos()" id="refresh_uploaded_videos">
            Clean Uploaded Videos
        </button>
    </p>
    <table id="cleaned_videos_table" class="widefat" style="display: none">
        <thead>
        <tr>
            <th>Tapestry ID</th>
            <th>Node ID</th>
            <th>Node Title</th>
            <th>Kaltura ID</th>
            <th>Previous Status</th>
            <th>Current Status</th>
            <th>Additional Info</th>
        </tr>
        </thead>
    </table>
    <h4>Reset Upload Status</h4>
    <p>
        Forcefully mark the upload as no longer in progress.
        This does not cancel any ongoing upload, but will allow you to try the upload again.
        <br />
        Please note: This action is dangerous and not recommended in most situations.
    </p>
    <p>
        <button type="button" class="button button-secondary" onclick="forceResetUploadStatus()" id="reset_upload_status">
            Reset Upload Status
        </button>
    </p>
    <div class="notice" id="tapestry_reset_upload_status_notice" style="display: none">
      <p></p>
    </div>
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
