<?php

/**
 * Plugin Name: Tapestry
 * Plugin URI: https://www.tapestry-tool.com
 * Description: Custom post type - Tapestry
 * Version: 2.30.0-beta
 * Author: Tapestry Team, University of British Coloumbia.
 */

// Used to force-refresh assets
$TAPESTRY_VERSION_NUMBER = '2.30.0-beta';

// Set this to false if you want to use the Vue build instead of npm dev
$TAPESTRY_USE_DEV_MODE = true;

/**
 * Register endpoints.
 */
require_once dirname(__FILE__).'/endpoints.php';

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
 * Enqueue scripts and styles for the tapestry
 */

add_action('wp_enqueue_scripts', 'tapestry_enqueue_libraries');
add_action('wp_enqueue_scripts', 'tapestry_enqueue_tapestry_js');
add_action('wp_enqueue_scripts', 'tapestry_enqueue_vue_app');
add_filter('style_loader_tag', 'tapestry_add_style_attributes', 10, 2);

function tapestry_enqueue_tapestry_js()
{
    global $post;
    if ('tapestry' == get_post_type($post) && !post_password_required($post)) {
        global $TAPESTRY_VERSION_NUMBER;
        global $wp_roles;
        $params = [
            'nonce' => wp_create_nonce('wp_rest'),
            'wpCanEditTapestry' => current_user_can('edit_post', get_the_ID()),
            'userLoggedIn' => 0 != get_current_user_id() ? 'true' : 'false',
        ];

        wp_register_script(
            'wp_tapestry_script',
            plugin_dir_url(__FILE__).'templates/tapestry.js?v='.$TAPESTRY_VERSION_NUMBER,
            ['jquery'],
            null,
            true
        );
        wp_localize_script('wp_tapestry_script', 'wpApiSettings', $params);
        wp_localize_script('wp_tapestry_script', 'wp', ['roles' => $wp_roles->get_names()]);
        wp_enqueue_script('wp_tapestry_script');

        wp_add_inline_script('wp_tapestry_script', "
			var thisTapestryTool;
			$(document).ready(function() {
				thisTapestryTool = new tapestryTool({
					'containerId': 'tapestry',
					'apiUrl': '".get_rest_url(null, 'tapestry-tool/v1')."',
					'wpUserId': '".apply_filters('determine_current_user', false)."',
					'wpPostId': '".get_the_ID()."',
					'wpCanEditTapestry': '".current_user_can('edit_post', get_the_ID())."',
				});
			});
		");
    }
}

function tapestry_enqueue_vue_app()
{
    global $post;
    if ('tapestry' == get_post_type($post) && !post_password_required($post)) {
        global $TAPESTRY_VERSION_NUMBER;
        global $TAPESTRY_USE_DEV_MODE;

        // register the Vue build script.
        $vueUrl = $TAPESTRY_USE_DEV_MODE ? 'http://localhost:8080/dist' : plugin_dir_url(__FILE__).'templates/vue/dist';

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
        wp_localize_script(
            'tapestry_d3_vue', // vue script handle defined in wp_register_script.
            'wpData', // javascript object that will made availabe to Vue.
            [ // wordpress data to be made available to the Vue app in 'wpData'
                'directory_uri' => plugin_dir_url(__FILE__).'templates/vue/dist', // child theme directory path.
                'vue_uri' => $vueUrl, // path to vue
                'rest_url' => untrailingslashit(esc_url_raw(rest_url())), // URL to the REST endpoint.
                'app_path' => $post->post_name, // page where the custom page template is loaded.
                'post_categories' => get_terms([
                    'taxonomy' => 'category', // default post categories.
                    'hide_empty' => true,
                    'fields' => 'names',
                ]),
                'gf_rest_url' => get_home_url().'/gravityformsapi',
                'nonce' => wp_create_nonce('wp_rest'),
                'gf_nonce' => wp_create_nonce('gf_api'),
                'wpUserId' => apply_filters('determine_current_user', false),
                'adminAjaxUrl' => admin_url('admin-ajax.php'),
                'file_upload_nonce' => wp_create_nonce('media-form'),
                'upload_url' => admin_url('async-upload.php'),
                'roles' => $wp_roles->get_names(),
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
        // CSS

        wp_enqueue_style('font-awesome-5', 'https://use.fontawesome.com/releases/v5.5.0/css/all.css', [], null);
        wp_enqueue_style('tapestry-css', plugin_dir_url(__FILE__).'templates/tapestry.css', [], $TAPESTRY_VERSION_NUMBER);
        wp_enqueue_style('jquery-ui', 'https://use.fontawesome.com/releases/v5.5.0/css/all.css', [], $TAPESTRY_VERSION_NUMBER);

        if (class_exists('GFCommon')) {
            wp_enqueue_style('gf-formsmain', GFCommon::get_base_url().'/css/formsmain.min.css');
        }
        if (class_exists('GFImageChoices')) {
            $GF_Image_Choices_Object = new GFImageChoices();
            wp_enqueue_style('gf-img-choices', plugin_dir_url(__FILE__).'templates/libs/gf-image-ui.css', [], $TAPESTRY_VERSION_NUMBER);
            wp_enqueue_style('gf-img-choices', $GF_Image_Choices_Object->get_base_url().'/css/gf_image_choices.css', [], $TAPESTRY_VERSION_NUMBER);
        }

        // JS

        if (class_exists('GFImageChoices')) {
            $GF_Image_Choices_Object = new GFImageChoices();
            wp_enqueue_script('gf-img-choices', $GF_Image_Choices_Object->get_base_url().'/js/gf_image_choices.js', ['jquery-min']);
        }

        wp_enqueue_script('jquery-min', plugin_dir_url(__FILE__).'templates/libs/jquery.min.js');
        wp_enqueue_script('jquery-ui', plugin_dir_url(__FILE__).'templates/libs/jquery-ui.min.js', ['jquery-min']);
        wp_enqueue_script('jscookie', plugin_dir_url(__FILE__).'templates/libs/jscookie.js', ['jquery']);
        wp_enqueue_script('d3-v5', plugin_dir_url(__FILE__).'templates/libs/d3.v5.min.js', [], null);
        wp_enqueue_script('dragselect', plugin_dir_url(__FILE__).'templates/libs/dragselect.min.js', [], null);
        wp_enqueue_script('momentjs', plugin_dir_url(__FILE__).'templates/libs/moment.min.js', [], null);
        wp_enqueue_script('moment-timezone-data', plugin_dir_url(__FILE__).'templates/libs/moment-timezone-with-data-2015-2025.js', ['momentjs'], null);
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
    $prefix = get_rest_url(null, 'tapestry-tool/v1');

    return "
        <script src='".plugin_dir_url(__FILE__)."templates/libs/jquery.min.js' type='application/javascript'></script>
        <button id='new_tapestry_button'>
            Add Tapestry
        </button>
        <script type='text/javascript'>
        var apiUrl = '{$prefix}';
            $('#new_tapestry_button').click(function() {
                let name = prompt(`Enter a name`);
                let payload = {};
                payload[`nodes`] = [];
                payload[`groups`] = [];
                payload[`links`] = [];
                payload[`title`] = name;
                return new Promise((fulfill, reject) => {
                    let xhr = new XMLHttpRequest();
                    xhr.open('POST', apiUrl + '/tapestries');
                    xhr.setRequestHeader(`Content-Type`, `application/json;charset=UTF-8`);
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
            })
        </script>
    ";
}

add_shortcode('new_tapestry_button', 'create_new_tapestry');

// Gravity Forms Pluggin

// Hook up the AJAX ajctions
add_action('wp_ajax_nopriv_gf_button_get_form', 'gf_button_ajax_get_form');
add_action('wp_ajax_gf_button_get_form', 'gf_button_ajax_get_form');

// Add the "button" action to the gravityforms shortcode
// e.g. [gravityforms action="button" id=1 text="button text"]
add_filter('gform_shortcode_button', 'gf_button_shortcode', 10, 3);
function gf_button_shortcode($shortcode_string, $attributes, $content)
{
    $a = shortcode_atts([
        'id' => 0,
        'text' => 'Show me the form!',
    ], $attributes);

    $form_id = absint($a['id']);

    if ($form_id < 1) {
        return 'Missing the ID attribute.';
    }

    // Enqueue the scripts and styles
    gravity_form_enqueue_scripts($form_id, true);

    $ajax_url = admin_url('admin-ajax.php');

    $html = sprintf('<button id="gf_button_get_form_%d">%s</button>', $form_id, $a['text']);
    $html .= sprintf('<div id="gf_button_form_container_%d" style="display:none;"></div>', $form_id);
    $html .= "<script>
				(function (SHFormLoader, $) {
				$('#gf_button_get_form_{$form_id}').click(function(){
                    var button = $(this);
					$.get('{$ajax_url}?action=gf_button_get_form&form_id={$form_id}',function(response){
						$('#gf_button_form_container_{$form_id}').html(response).fadeIn();
                        button.remove();
						if(window['gformInitDatepicker']) {gformInitDatepicker();}
					});
				});
			}(window.SHFormLoader = window.SHFormLoader || {}, jQuery));
			</script>";

    return $html;
}

function gf_button_ajax_get_form()
{
    $form_id = isset($_GET['form_id']) ? absint($_GET['form_id']) : 0;
    gravity_form($form_id, false, false, false, false, true);
    die();
}
// End of Gravity Forms Pluggin
