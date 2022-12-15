<?php

/**
 * Plugin Name: Tapestry
 * Plugin URI: https://www.tapestry-tool.com
 * Description: Custom post type - Tapestry
 * Version: 2.57.0-beta
 * Author: Tapestry Team, University of British Columbia.
 */

if (!function_exists('is_plugin_active')) {
    include_once(ABSPATH . 'wp-admin/includes/plugin.php');
}

/**
 * We use the plugins_loaded hook to support overriding a network-activated
 * Tapestry plugin on a multisite WP site with a site-level activated Tapestry
 * plugin. The way this works is all plugins are technically loaded (including
 * potentially multiple Tapestry plugins), then once they are all loaded, we
 * first execute the site-level ones, then the network-level ones. We will
 * never execute the code for more than a single Tapestry plugin, so whichever
 * one gets executed first is the only one that gets "loaded". This is by
 * checking that $TAPESTRY_VERSION_NUMBER has not been set yet. That means that
 * if multiple Tapestry plugins are loaded on a single site or network-
 * activated, whichever one is loaded first by WP is the one that will be in
 * effect.
 */

add_action('plugins_loaded', function () {
    global $TAPESTRY_VERSION_NUMBER;
    if (!isset($TAPESTRY_VERSION_NUMBER)) {

        // Used to force-refresh assets and run updates
        $TAPESTRY_VERSION_NUMBER = '2.57.0-beta';

        // Record whether user has specified site-specific Kaltura configuration variables
        define(
            'KALTURA_OVERRIDE_CONFIG',
            !empty(get_option('kaltura_admin_secret')) &&
            !empty(get_option('kaltura_partner_id')) &&
            !empty(get_option('kaltura_service_url')) &&
            !empty(get_option('kaltura_unique_config'))
        );

        // Record whether Kaltura configuration variables are defined in wp-config.php
        define(
            'KALTURA_DEFAULT_CONFIG',
            (defined('KALTURA_ADMIN_SECRET') && !empty(KALTURA_ADMIN_SECRET)) &&
            (defined('KALTURA_PARTNER_ID') && !empty(KALTURA_PARTNER_ID)) &&
            (defined('KALTURA_SERVICE_URL') && !empty(KALTURA_SERVICE_URL)) &&
            (defined('KALTURA_UNIQUE_CONFIG') && !empty(KALTURA_UNIQUE_CONFIG))
        );

        define(
            'LOAD_KALTURA',
            file_exists(plugin_dir_path(__FILE__) . 'vendor/autoload.php') &&
            (KALTURA_OVERRIDE_CONFIG || KALTURA_DEFAULT_CONFIG)
        );

        error_reporting(E_ERROR | E_PARSE);

        /**
         * Register endpoints and perform other includes
         */
        require_once dirname(__FILE__).'/classes/class.tapestry-analytics.php';
        require_once dirname(__FILE__).'/classes/class.kaltura-api.php';
        require_once dirname(__FILE__).'/endpoints.php';
        require_once dirname(__FILE__).'/settings.php';
        require_once dirname(__FILE__).'/plugin-updates.php';
        require_once dirname(__FILE__).'/utilities/class.tapestry-import-export.php';

        /**
         * Register Tapestry type on initialization.
         */
        function create_tapestry_type()
        {
            $labels = [
                'name' => __('Tapestries'),
                'singular_name' => __('Tapestry'),
                'all_items' => __('All Tapestries'),
            ];
            $args = [
                'label' => __('tapestry'),
                'labels' => $labels,
                'description' => '',
                'public' => true,
                'publicly_queryable' => true,
                'show_ui' => true,
                'delete_with_user' => false,
                'show_in_rest' => true,
                'rest_base' => '',
                'rest_controller_class' => 'WP_REST_Posts_Controller',
                'has_archive' => false,
                'show_in_menu' => true,
                'show_in_nav_menus' => true,
                'exclude_from_search' => false,
                'capability_type' => 'post',
                'map_meta_cap' => true,
                'hierarchical' => false,
                'rewrite' => ['with_front' => true],
                'query_var' => true,
                'supports' => ['title', 'editor', 'thumbnail', 'author'],
            ];
            register_post_type('tapestry', $args);
        }
        add_action('init', 'create_tapestry_type');

        /**
         * Register Tapestry Node type on initialization.
         */
        function create_tapestry_node_type()
        {
            $labels = [
                'name' => __('Tapestry Nodes'),
                'singular_name' => __('Tapestry Node'),
                'all_items' => __('Tapestry Nodes'),
            ];
            $args = [
                'label' => __('tapestry-node'),
                'labels' => $labels,
                'description' => '',
                'public' => true,
                'publicly_queryable' => true,
                'show_ui' => true,
                'delete_with_user' => false,
                'show_in_rest' => true,
                'rest_base' => '',
                'rest_controller_class' => 'WP_REST_Posts_Controller',
                'has_archive' => false,
                'show_in_menu' => false,
                'show_in_nav_menus' => false,
                'exclude_from_search' => false,
                'capability_type' => 'post',
                'map_meta_cap' => true,
                'hierarchical' => false,
                'rewrite' => ['with_front' => true],
                'query_var' => true,
                'supports' => ['title', 'editor', 'thumbnail', 'author'],
            ];
            register_post_type('tapestry_node', $args);
        }
        add_action('init', 'create_tapestry_node_type');

        /**
         * Show posts of Tapestry type on the home page.
         */
        function add_tapestry_post_types_to_query($query)
        {
            if (is_home() && $query->is_main_query()) {
                $query->set('post_type', ['post', 'tapestry', 'tapestry-node']);
            }

            return $query;
        }
        add_action('pre_get_posts', 'add_tapestry_post_types_to_query');

        /*
        * Add custom tapestry_thumb size
        */
        add_action('after_setup_theme', 'tapestry_theme_setup');
        function tapestry_theme_setup()
        {
            add_image_size('tapestry_thumb', 420, 420, true);
        }

        /*
        * Enqueue scripts and styles for the tapestry
        */

        add_action('wp_enqueue_scripts', 'tapestry_enqueue_libraries');
        add_action('wp_enqueue_scripts', 'tapestry_enqueue_vue_app');
        add_filter('style_loader_tag', 'tapestry_add_style_attributes', 10, 2);

        function tapestry_enqueue_vue_app()
        {
            global $post;
            if ('tapestry' == get_post_type($post) && !post_password_required($post)) {
                global $TAPESTRY_VERSION_NUMBER;

                $use_dev = (defined('TAPESTRY_USE_DEV_MODE') && !empty(TAPESTRY_USE_DEV_MODE)) || isset($_GET['debug']);

                // register the Vue build script.
                $vueUrl = $use_dev ? 'http://localhost:8080/dist' : plugin_dir_url(__FILE__).'templates/vue/dist';

                wp_register_script( // the app build script generated by Webpack.
                    'tapestry_d3_vue',
                    $vueUrl.'/build.js?v='.$TAPESTRY_VERSION_NUMBER,
                    [],
                    null,
                    true
                );

                // make custom data available to the Vue app with wp_localize_script.
                global $post;
                global $wp_roles;

                // pass Kaltura account variables to frontend; will be null if LOAD_KALTURA is false
                $kaltura_partner_id = KalturaApi::getKalturaPartnerId();
                $kaltura_service_url = KalturaApi::getKalturaServiceUrl();
                $kaltura_unique_configuration = KalturaApi::getKalturaUniqueConfig();

                $currentUser = wp_get_current_user();
                $currentUser->data = (object) [
                    'ID' => $currentUser->data->ID,
                    'user_nicename'=> $currentUser->data->user_nicename,
                    'user_email'=> $currentUser->data->user_email,
                    'display_name'=> $currentUser->data->display_name
                ];

                $iframe_mode = array_key_exists('iframe', $_GET) ? 1 : 0;

                wp_localize_script(
                    'tapestry_d3_vue', // vue script handle defined in wp_register_script.
                    'wpData', // javascript object that will made availabe to Vue.
                    [ // wordpress data to be made available to the Vue app in 'wpData'
                        'iframe_mode' => $iframe_mode,
                        'directory_uri' => plugin_dir_url(__FILE__).'templates/vue/dist', // child theme directory path.
                        'vue_uri' => $vueUrl, // path to vue
                        'rest_url' => untrailingslashit(esc_url_raw(rest_url())), // URL to the REST endpoint.
                        'wpUrl' => get_bloginfo('url'),
                        'logoutUrl' => wp_logout_url(get_permalink()),
                        'app_path' => $post->post_name, // page where the custom page template is loaded.
                        'post_categories' => get_terms([
                            'taxonomy' => 'category', // default post categories.
                            'hide_empty' => true,
                            'fields' => 'names',
                        ]),
                        'nonce' => wp_create_nonce('wp_rest'),
                        'wpUserId' => apply_filters('determine_current_user', false),
                        'adminAjaxUrl' => admin_url('admin-ajax.php'),
                        'file_upload_nonce' => wp_create_nonce('media-form'),
                        'upload_url' => admin_url('async-upload.php'),
                        'roles' => $wp_roles->get_names(),
                        'wpCanEditTapestry' => current_user_can('edit_post', get_the_ID()),
                        'currentUser' => $currentUser,
                        'uploadDirArray' => wp_upload_dir(),
                        'uploadProgressFieldName' => ini_get('session.upload_progress.name'),
                        'kaltura' => array(
                            'kalturaStatus' => LOAD_KALTURA,
                            'partnerId' => $kaltura_partner_id,
                            'serviceUrl' => $kaltura_service_url,
                            'uniqueConfiguration' => $kaltura_unique_configuration,
                        ),
                    ]
                );

                // enqueue the Vue app script with localized data.
                wp_enqueue_script('tapestry_d3_vue');
            }
        }

        function tapestry_enqueue_libraries()
        {
            global $post;
            global $TAPESTRY_VERSION_NUMBER;
            if ('tapestry' == get_post_type($post) && !post_password_required($post)) {
                $LIBS_FOLDER_URL = plugin_dir_url(__FILE__).'templates/libs/';

                // CSS
                wp_enqueue_style('font-awesome-5', 'https://use.fontawesome.com/releases/v5.5.0/css/all.css', [], null);
                wp_enqueue_style('tapestry-css', plugin_dir_url(__FILE__).'templates/tapestry.css', [], $TAPESTRY_VERSION_NUMBER);

                // JS
                wp_enqueue_script('heartbeat');
                wp_enqueue_script('es2015-test', $LIBS_FOLDER_URL.'es2015-test.js');
            }
        }

        function tapestry_add_style_attributes($html, $handle)
        {
            global $post;
            if ('tapestry' == get_post_type($post) && !post_password_required($post)) {
                if ('font-awesome-5' === $handle) {
                    return str_replace("media='all'", "media='all' integrity='sha384-B4dIYHKNBt8Bc12p+WXckhzcICo0wtJAoU8YZTY5qE0Id1GSseTk6S+L3BlXeVIU' crossorigin='anonymous'", $html);
                }
            }

            return $html;
        }

        /**
         * Filter the template for Tapestry post.
         */
        function load_tapestry_template($singleTemplate)
        {
            global $post;
            if ('tapestry' === $post->post_type) {
                $singleTemplate = dirname(__FILE__).'/templates/single-tapestry.php';
            }

            return $singleTemplate;
        }
        add_filter('single_template', 'load_tapestry_template');

        function create_new_tapestry()
        {
            if (!current_user_can('edit_posts')) {
                return "";
            }

            $prefix = get_rest_url(null, 'tapestry-tool/v1');

            return "
                <button onclick='promptAddNewTapestry()'>
                    Add Tapestry
                </button>
                <script type='text/javascript'>
                    function promptAddNewTapestry() {
                        let name = prompt(`Enter a name`);
                        if (name !== null) {
                            var apiUrl = '{$prefix}';
                            let payload = {};
                            payload[`nodes`] = [];
                            payload[`groups`] = [];
                            payload[`links`] = [];
                            payload[`title`] = name;
                            return new Promise((fulfill, reject) => {
                                let xhr = new XMLHttpRequest();
                                xhr.open('POST', apiUrl + '/tapestries');
                                xhr.setRequestHeader(`Content-Type`, `application/json;charset=UTF-8`);
                                xhr.setRequestHeader(`X-WP-Nonce`, `".wp_create_nonce('wp_rest')."`);
                                xhr.onload = () => {
                                    if (xhr.status >= 200 && xhr.status < 300) {
                                        fulfill(xhr.response);
                                    } else {
                                        reject({
                                            status: xhr.status,
                                            statusText: xhr.statusText
                                        });
                                    }
                                };
                                xhr.onerror = () => {
                                    reject({
                                        status: xhr.status,
                                        statusText: xhr.statusText
                                    });
                                };
                                xhr.send(JSON.stringify(payload));
                            }).then(data => {
                                let res = JSON.parse(data);
                                window.location.href = res.settings.permalink;
                            }).catch(err => {
                                console.log(err);
                                alert(`Error occured while creating tapestry, please try again`);
                            })
                        }
                    }
                </script>
            ";
        }

        add_shortcode('new_tapestry_button', 'create_new_tapestry');

        function replace_special_apostrophe($str)
        {
            return str_replace('’', "'", $str);
        }

        $quote_style = 'ENT_QUOTES';
        add_filter('rest_prepare_post', 'prefix_title_entity_decode');
        function prefix_title_entity_decode($response)
        {
            $data = $response->get_data();
            $data['title']['rendered'] = wp_specialchars_decode(html_entity_decode($data['title']['rendered']), $quote_style);
            $data['title']['rendered'] = replace_special_apostrophe($data['title']['rendered']);
            $data['content']['rendered'] = wp_specialchars_decode(html_entity_decode($data['content']['rendered']), $quote_style);
            $data['content']['rendered'] = replace_special_apostrophe($data['content']['rendered']);
            $response->set_data($data);

            return $response;
        }

        // Analytics

        register_activation_hook(__FILE__, 'create_tapestry_analytics_schema');
        function create_tapestry_analytics_schema()
        {
            $analytics = new TapestryAnalytics();
            $analytics->createSchema();
        }

        add_action('wp_ajax_nopriv_tapestry_tool_log_event', 'tapestry_tool_log_event');
        add_action('wp_ajax_tapestry_tool_log_event', 'tapestry_tool_log_event');
        function tapestry_tool_log_event()
        {
            $analytics = new TapestryAnalytics();
            $analytics->log($_POST);

            wp_die();
        }

        // Cleanup

        add_action('tapestry_clean_export_files', 'clean_export_files');
        function clean_export_files()
        {
            TapestryImportExport::clearExportedZips();
        }

        register_activation_hook(__FILE__, 'schedule_tapestry_export_file_cleanup');
        function schedule_tapestry_export_file_cleanup()
        {
            if (! wp_next_scheduled('tapestry_clean_export_files')) {
                wp_schedule_event(time(), 'daily', 'tapestry_clean_export_files');
            }
        }

        register_deactivation_hook(__FILE__, 'unschedule_tapestry_export_file_cleanup');
        function unschedule_tapestry_export_file_cleanup()
        {
            wp_clear_scheduled_hook('tapestry_clean_export_files');
        }
    }
}, 10 + (is_plugin_active_for_network(basename(__DIR__). "/" . basename(__FILE__)) ? 1 : 0));
