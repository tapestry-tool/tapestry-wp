<?php

/**
 * Plugin Name: Tapestry
 * Plugin URI: https://www.tapestry-tool.com
 * Description: Custom post type - Tapestry
 * Version: 2.18.0-beta
 * Author: Tapestry Team, University of British Coloumbia
 */

/**
 * Register endpoints
 */
require_once dirname(__FILE__) . '/endpoints.php';

/**
 * Register Tapestry type on initialization
 */
function create_tapestry_type()
{
    $labels = array(
        "name" => __("Tapestries"),
        "singular_name" => __("Tapestry"),
        "all_items" => __("All Tapestries")
    );
    $args = array(
        "label" => __("tapestry"),
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
        "rewrite" => array("with_front" => true),
        "query_var" => true,
        "supports" => array("title", "editor", "thumbnail", "author"),
    );
    register_post_type('tapestry', $args);
}
add_action('init', 'create_tapestry_type');

/**
 * Register Tapestry Node type on initialization
 */
function create_tapestry_node_type()
{
    $labels = array(
        "name" => __("Tapestry Nodes"),
        "singular_name" => __("Tapestry Node"),
        "all_items" => __("Tapestry Nodes")
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
        "show_in_menu" => 'edit.php?post_type=tapestry',
        "show_in_nav_menus" => false,
        "exclude_from_search" => false,
        "capability_type" => "post",
        "map_meta_cap" => true,
        "hierarchical" => false,
        "rewrite" => array("with_front" => true),
        "query_var" => true,
        "supports" => array("title", "editor", "thumbnail", "author"),
    );
    register_post_type('tapestry_node', $args);
}
add_action('init', 'create_tapestry_node_type');

/**
 * Add the copilot role on plugin activation
 */
function create_copilot_role()
{
    add_role(
        'copilot',
        'Copilot',
        array(
            'read'  => true,
            'edit_posts' => true
        )
    );
}
add_action('init', 'create_copilot_role');

/**
 * Show the teen input label if the user is a copilot
 */
function add_copilot_teen_field($user) 
{ 
    if (in_array("copilot", $user->roles)): ?>
        <table class="form-table">
        <tr>
            <th><label for="teen_id"><?php _e("Teen ID"); ?></label></th>
            <td>
                <input type="text" name="teen_id" id="teen_id" value="<?php echo esc_attr( get_the_author_meta('teen_id', $user->ID)); ?>" class="regular-text" /><br />
                <span class="description"><?php _e("Please enter your teen's user ID."); ?></span>
            </td>
        </tr>
        </table>
    <?php endif;
}
add_action('show_user_profile', 'add_copilot_teen_field');
add_action('edit_user_profile', 'add_copilot_teen_field');

function save_copilot_teen_field($user_id)
{
    if (!current_user_can('edit_user', $user_id)) {
        return false;
    }
    $user = get_user_by('id', $user_id);
    if (!in_array('copilot', $user->roles)) {
        return false;
    }
    update_user_meta($user_id, 'teen_id', $_POST['teen_id']);
}
add_action('personal_options_update', 'save_copilot_teen_field');
add_action('edit_user_profile_update', 'save_copilot_teen_field');

/**
 * Show posts of Tapestry type on the home page
 */
function add_tapestry_post_types_to_query($query)
{
    if (is_home() && $query->is_main_query()) {
        $query->set('post_type', array('post', 'tapestry', 'tapestry-node'));
    }
    return $query;
}
add_action('pre_get_posts', 'add_tapestry_post_types_to_query');

/**
 * Filter the template for Tapestry post
 */
function load_tapestry_template($singleTemplate)
{
    global $post;
    if ($post->post_type === 'tapestry') {
        $singleTemplate = dirname(__FILE__) . '/templates/single-tapestry.php';
    }
    return $singleTemplate;
}
add_filter('single_template', 'load_tapestry_template');

/**
 * Set Up Tapestry Post Upon Insertion
 *
 * @param   Integer $postId Post ID
 * @param   Object  $post   Post Object
 * @param   Boolean $update Post Object
 *
 * @return  Object  Null
 */
function add_tapestry_post_meta_on_publish($postId, $post, $update = false)
{
    if (!isset($postId) || !isset($post) || get_post_type($postId) != 'tapestry') {
        return;
    }

    $tapestry = new Tapestry($postId);
    $tapestryData = $tapestry->get();

    if ($update && !empty($tapestryData->settings)) {
        $tapestryData->settings->tapestrySlug = $post->post_name;
        $tapestryData->settings->title = $post->post_title;
        $tapestryData->settings->status = $post->post_status;
    } else {
        $tapestryData->settings = (object) array(
            'tapestrySlug'  => $post->post_name,
            'title'         => $post->post_title,
            'status'        => $post->post_status
        );
    }

    $tapestry->set((object) ['settings' => $tapestryData->settings]);
    $tapestry->saveOnPublish();
}
add_action('publish_tapestry', 'add_tapestry_post_meta_on_publish', 10, 3);

// Gravity Forms Pluggin

// Hook up the AJAX ajctions
add_action('wp_ajax_nopriv_gf_button_get_form', 'gf_button_ajax_get_form');
add_action('wp_ajax_gf_button_get_form', 'gf_button_ajax_get_form');

// Add the "button" action to the gravityforms shortcode
// e.g. [gravityforms action="button" id=1 text="button text"]
add_filter('gform_shortcode_button', 'gf_button_shortcode', 10, 3);
function gf_button_shortcode($shortcode_string, $attributes, $content)
{
    $a = shortcode_atts(array(
        'id' => 0,
        'text' => 'Show me the form!',
    ), $attributes);

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

// TYDE CUSTOMIZATIONS

register_activation_hook( __FILE__, 'tapestry_activation' );
function tapestry_activation() {
    create_copilot_role();
}

/**
 * Add the copilot role on plugin activation
 */
function create_copilot_role()
{
    add_role(
        'copilot',
        'Copilot',
        array(
            'read'  => true,
            'edit_posts' => true
        )
    );
}

/**
 * Show the teen input label if the user is a copilot
 */
function add_copilot_teen_field($user) 
{ 
    if (in_array("copilot", $user->roles)): ?>
        <table class="form-table">
        <tr>
            <th><label for="teen_id"><?php _e("Teen ID"); ?></label></th>
            <td>
                <input type="text" name="teen_id" id="teen_id" value="<?php echo esc_attr( get_the_author_meta('teen_id', $user->ID)); ?>" class="regular-text" /><br />
                <span class="description"><?php _e("Please enter your teen's user ID."); ?></span>
            </td>
        </tr>
        </table>
    <?php endif;
}
add_action('show_user_profile', 'add_copilot_teen_field');
add_action('edit_user_profile', 'add_copilot_teen_field');

function save_copilot_teen_field($user_id)
{
    if (!current_user_can('edit_user', $user_id)) {
        return false;
    }
    $user = get_user_by('id', $user_id);
    if (!in_array('copilot', $user->roles)) {
        return false;
    }
    update_user_meta($user_id, 'teen_id', $_POST['teen_id']);
}
add_action('personal_options_update', 'save_copilot_teen_field');
add_action('edit_user_profile_update', 'save_copilot_teen_field');