<?php

require_once __DIR__.'/classes/class.tapestry-analytics.php';

/**
 * Plugin Name: Tapestry
 * Plugin URI: https://www.tapestry-tool.com
 * Description: Custom post type - Tapestry
 * Version: 2.50.0-beta
 * Author: Tapestry Team, University of British Coloumbia.
 */

// Used to force-refresh assets
$TAPESTRY_VERSION_NUMBER = '2.50.0-beta';

// Set this to false if you want to use the Vue build instead of npm dev
$TAPESTRY_USE_DEV_MODE = true;

// TYDE settings
$TYDE_YOUTH_ROLES = [
    'youth' => 'Youth',
    'youth_l2' => 'Youth (Level 2)',
    'youth_l3' => 'Youth (Level 3)',
];
$TYDE_DYAD_ROLES = [
    'dyad' => 'Dyad',
    'dyad_l2' => 'Dyad (Level 2)',
    'dyad_l3' => 'Dyad (Level 3)',
];

/**
 * Register endpoints.
 */
require_once dirname(__FILE__).'/endpoints.php';
require_once dirname(__FILE__).'/settings.php';
require_once dirname(__FILE__).'/plugin-updates.php';

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
        global $TAPESTRY_USE_DEV_MODE;

        global $TYDE_DYAD_ROLES;
        $isDyad = wp_get_current_user() && array_intersect(wp_get_current_user()->roles, array_keys($TYDE_DYAD_ROLES));
        $dyadLinkedUser = null;
        if ($isDyad) {
            $dyadLinkedUserId = get_the_author_meta('linked_dyad_user_id', wp_get_current_user()->ID);
            if ($dyadLinkedUserId) {
                $dyadLinkedUser = get_user_by('id', $dyadLinkedUserId)->data;
            }
        }

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
                'wpUrl' => get_bloginfo('url'),
                'app_path' => $post->post_name, // page where the custom page template is loaded.
                'post_categories' => get_terms([
                    'taxonomy' => 'category', // default post categories.
                    'hide_empty' => true,
                    'fields' => 'names',
                ]),
                'nonce' => wp_create_nonce('wp_rest'),
                'wpUserId' => apply_filters('determine_current_user', false),
                'dyadLinkedWpUser' => $dyadLinkedUser,
                'adminAjaxUrl' => admin_url('admin-ajax.php'),
                'file_upload_nonce' => wp_create_nonce('media-form'),
                'upload_url' => admin_url('async-upload.php'),
                'roles' => $wp_roles->get_names(),
                'wpCanEditTapestry' => current_user_can('edit_post', get_the_ID()),
                'currentUser' => wp_get_current_user(),
                'uploadDirArray' => wp_upload_dir(),
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

// TYDE Roles

register_activation_hook(__FILE__, 'add_tyde_roles');
function add_tyde_roles()
{
    global $TYDE_DYAD_ROLES;
    foreach ($TYDE_DYAD_ROLES as $key => $label) {
        add_role(
            $key,
            $label,
            [
                'read' => true,
                'edit_posts' => true,
            ]
        );
    }
    global $TYDE_YOUTH_ROLES;
    foreach ($TYDE_YOUTH_ROLES as $key => $label) {
        add_role(
            $key,
            $label,
            [
                'read' => true,
                'edit_posts' => true,
            ]
        );
    }
}

/**
 * Show the youth user id input if the user is a dyad.
 */
function add_dyad_youth_user_field($user)
{
    global $TYDE_DYAD_ROLES;
    $isDyadUser = array_intersect($user->roles, array_keys($TYDE_DYAD_ROLES));

    if ($isDyadUser) : ?>
        <table class="form-table">
            <tr>
                <th><label for="linked_dyad_user_id"><?php _e('Linked Youth User ID'); ?></label></th>
                <td>
                    <input type="text" name="linked_dyad_user_id" id="linked_dyad_user_id" value="<?php echo esc_attr(get_the_author_meta('linked_dyad_user_id', $user->ID)); ?>" class="regular-text" /><br />
                    <span class="description"><?php _e("Please enter the user ID for the linked youth user."); ?></span>
                </td>
            </tr>
        </table>
<?php endif;
}
add_action('show_user_profile', 'add_dyad_youth_user_field');
add_action('edit_user_profile', 'add_dyad_youth_user_field');

/**
 * Save the youth user id input when updated (if the user is a dyad).
 */
function save_dyad_youth_user_field($user_id)
{
    if (!current_user_can('edit_user', $user_id)) {
        return false;
    }
    $user = get_user_by('id', $user_id);

    global $TYDE_DYAD_ROLES;
    $isDyadUser = array_intersect($user->roles, array_keys($TYDE_DYAD_ROLES));
    
    if ($isDyadUser) {
        $linked_dyad_user_id = intval($_POST['linked_dyad_user_id']);
        update_user_meta($user_id, 'linked_dyad_user_id', $linked_dyad_user_id);
    }
}
add_action('personal_options_update', 'save_dyad_youth_user_field');
add_action('edit_user_profile_update', 'save_dyad_youth_user_field');