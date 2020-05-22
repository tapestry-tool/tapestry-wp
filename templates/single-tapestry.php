<?php

/*
 Template Name: Tapestry Page Template
 */
/**
 * Register Script with Nonce
 * 
 * @return Object null
 */

function addNonceToScript()
{
    global $TAPESTRY_VERSION_NUMBER;
    global $wp_roles;
    $params = array(
        'nonce'  => wp_create_nonce('wp_rest'),
        'wpCanEditTapestry' => current_user_can('edit_post', get_the_ID()),
        'userLoggedIn' => get_current_user_id() != 0 ? 'true' : 'false'
    );

    wp_register_script(
        'wp_tapestry_script',
        plugin_dir_url(__FILE__) . 'tapestry.js?v=' . $TAPESTRY_VERSION_NUMBER,
        array('jquery'),
        null,
        true
    );
    wp_localize_script('wp_tapestry_script', 'wpApiSettings', $params);
    wp_localize_script('wp_tapestry_script', 'wp', array('roles' => $wp_roles->get_names()));
    wp_enqueue_script('wp_tapestry_script');

    wp_add_inline_script( 'wp_tapestry_script', "
        var thisTapestryTool = new tapestryTool({
            'containerId': 'tapestry',
            'apiUrl': '". get_rest_url(null, 'tapestry-tool/v1') ."',
            'wpUserId': '". apply_filters('determine_current_user', false) ."',
            'wpPostId': '". get_the_ID() ."',
            'wpCanEditTapestry': '". current_user_can('edit_post', get_the_ID()) ."',
            'addNodeModalUrl': '". plugin_dir_url( __FILE__ ) ."modal-add-node.html',
        });
    " );
}
add_action('wp_enqueue_scripts', 'addNonceToScript');

function get_teen_id()
{
    return get_the_author_meta('teen_id', apply_filters('determine_current_user', false));
}

function enqueue_vue_app_build()
{
    global $TAPESTRY_VERSION_NUMBER;
    global $TAPESTRY_USE_DEV_MODE;

    // register the Vue build script.
    $vueUrl = $TAPESTRY_USE_DEV_MODE ? "http://localhost:8080/dist" : plugin_dir_url(__FILE__) . "vue/dist";

    wp_register_script( // the app build script generated by Webpack.
        'tapestry_d3_vue',
        $vueUrl . '/build.js?v=' . $TAPESTRY_VERSION_NUMBER,
        array(),
        null,
        true
    );

    // make custom data available to the Vue app with wp_localize_script.
    global $post;
    global $wp_roles;
    wp_localize_script(
        'tapestry_d3_vue', // vue script handle defined in wp_register_script.
        'wpData', // javascript object that will made availabe to Vue.
        array( // wordpress data to be made available to the Vue app in 'wpData'
            'directory_uri' => plugin_dir_url(__FILE__) . 'vue/dist', // child theme directory path.
            'vue_uri'  => $vueUrl, // path to vue
            'rest_url' => untrailingslashit(esc_url_raw(rest_url())), // URL to the REST endpoint.
            'app_path' => $post->post_name, // page where the custom page template is loaded.
            'post_categories' => get_terms(array(
                'taxonomy' => 'category', // default post categories.
                'hide_empty' => true,
                'fields' => 'names',
            )),
            'gf_rest_url' => get_home_url() . '/gravityformsapi',
            'nonce' => wp_create_nonce('wp_rest'),
            'gf_nonce' => wp_create_nonce('gf_api'),
            'wpUserId' => apply_filters('determine_current_user', false),
            'wpTeenId' => get_teen_id(),
            'adminAjaxUrl' => admin_url('admin-ajax.php'),
            'file_upload_nonce' => wp_create_nonce('media-form'),
            'upload_url' => admin_url('async-upload.php'),
            'roles' => $wp_roles->get_names()
        )
    );

    // enqueue the Vue app script with localized data.
    wp_enqueue_script('tapestry_d3_vue');
}
add_action('wp_enqueue_scripts', 'enqueue_vue_app_build');

get_header(); ?>

<div id="primary" class="content-area col-md-12">
    <main id="main" class="post-wrap<?php if (current_user_can('edit_post', get_the_ID())) { echo ' is-editor"'; } ?>" role="main">

        <div id="tapestry-container"></div>

        <?php while (have_posts()) : the_post(); ?>
            <?php get_template_part('content', 'page'); ?>
            <?php
            // If comments are open or we have at least one comment, load up the comment template
            if (comments_open() || get_comments_number()) :
                comments_template();
            endif;
            ?>

        <?php endwhile; // end of the loop. 
        ?>

        <link crossorigin="anonymous" href="https://use.fontawesome.com/releases/v5.3.1/css/all.css" integrity="sha384-mzrmE5qonljUremFsqc01SB46JvROS7bZs3IO2EmfFsd15uHvIt+Y8vEf7N7fWAU" rel="stylesheet" />
        <link href="<?php echo plugin_dir_url(__FILE__) ?>tapestry.css?v=<?php echo $TAPESTRY_VERSION_NUMBER; ?>" rel="stylesheet" />
        <link href="<?php echo plugin_dir_url(__FILE__) ?>libs/jquery-ui.min.css" rel="stylesheet" />
            
        <!-- Get Gravity Forms CSS if plugin is installed -->
        <?php if (class_exists("GFCommon")) :
            echo '<link href="' . GFCommon::get_base_url() . '/css/formsmain.min.css" rel="stylesheet" />';
        endif; ?>

        <?php if (class_exists("GFImageChoices")) :
            $GF_Image_Choices_Object = new GFImageChoices();
            echo '<link href="' . plugin_dir_url(__FILE__) . 'libs/gf-image-ui.css?v=' . $TAPESTRY_VERSION_NUMBER . '" rel="stylesheet" />';
            echo '<link href="' . $GF_Image_Choices_Object->get_base_url() . '/css/gf_image_choices.css?v=' . $TAPESTRY_VERSION_NUMBER . '" rel="stylesheet" />';
            echo '<script src="' . $GF_Image_Choices_Object->get_base_url() . '/js/gf_image_choices.js?v=' . $TAPESTRY_VERSION_NUMBER . '" type="application/javascript"></script>';
        endif; ?>

        <script src="<?php echo plugin_dir_url(__FILE__) ?>libs/jquery.min.js" type="application/javascript"></script>
        <script src="<?php echo plugin_dir_url(__FILE__) ?>libs/jquery-ui.min.js" type="application/javascript"></script>
        <script src="<?php echo plugin_dir_url(__FILE__) ?>libs/jscookie.js" type="application/javascript"></script>
        <script src="<?php echo plugin_dir_url(__FILE__) ?>libs/d3.v5.min.js" type="application/javascript"></script>
        <script src="<?php echo plugin_dir_url(__FILE__) ?>libs/dragselect.min.js"></script>
        <script src="<?php echo plugin_dir_url(__FILE__) ?>libs/moment.min.js"></script>
        <script src="<?php echo plugin_dir_url(__FILE__) ?>libs/moment-timezone-with-data-2015-2025.js"></script>

        <script>
            // EXAMPLE OF USAGE:
            // thisTapestryTool.setDataset({'abc':'123'});
            // thisTapestryTool.redraw(false);

            var wpPostId = "<?php echo get_the_ID(); ?>";
            var wpUserId = "<?php echo apply_filters('determine_current_user', false); ?>";
            var apiUrl = "<?php echo get_rest_url(null, 'tapestry-tool/v1'); ?>";
            var adminAjaxUrl = "<?php echo admin_url('admin-ajax.php'); ?>";

            // Capture click events anywhere inside or outside tapestry
            $(document).ready(function() {
                document.body.addEventListener('click', function(event) {
                    var x = event.clientX + $(window).scrollLeft();
                    var y = event.clientY + $(window).scrollTop();
                    recordAnalyticsEvent('user', 'click', 'screen', null, {
                        'x': x,
                        'y': y
                    });
                }, true);

                document.getElementById('tapestry').addEventListener('click', function(event) {
                    var x = event.clientX + $(window).scrollLeft();
                    var y = event.clientY + $(window).scrollTop();
                    recordAnalyticsEvent('user', 'click', 'tapestry', null, {
                        'x': x,
                        'y': y
                    });
                }, true);
            });
        </script>
    </main><!-- #main -->
</div><!-- #primary -->

<?php get_footer(); ?>