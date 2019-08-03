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
    $params = array(
        'nonce'  => wp_create_nonce('wp_rest')
    );

    wp_register_script(
        'wp_tapestry_script',
        plugin_dir_url(__FILE__) . 'tapestry-d3/tapestry.js',
        array('jquery'),
        null,
        true
    );
    wp_localize_script('wp_tapestry_script', 'wpApiSettings', $params);
    wp_enqueue_script('wp_tapestry_script');

    wp_register_script(
        'wp_tapestry_functions_script',
        plugin_dir_url(__FILE__) . 'tapestry-d3/tapestry-functions.js',
        array('jquery', 'wp_tapestry_script'),
        null,
        true
    );
    wp_enqueue_script('wp_tapestry_functions_script');

    wp_add_inline_script( 'wp_tapestry_script', "
        var thisTapestryTool = new tapestryTool({
            'containerId': 'tapestry',
            'apiUrl': '". get_rest_url(null, 'tapestry-tool/v1') ."',
            'wpUserId': '". apply_filters('determine_current_user', false) ."',
            'wpPostId': '". get_the_ID() ."',
            'wpIsAdmin': '". current_user_can('administrator') ."',
            'addNodeModalUrl': '". plugin_dir_url( __FILE__ ) ."modal-add-node.html',
        });
    " );
}
add_action('wp_enqueue_scripts', 'addNonceToScript');

get_header(); ?>

<div id="primary" class="content-area col-md-12">
    <main id="main" class="post-wrap" role="main">

        <div id="tapestry"></div>

        <?php while ( have_posts() ) : the_post(); ?>
            <?php get_template_part('content', 'page'); ?>
            <?php
            // If comments are open or we have at least one comment, load up the comment template
            if (comments_open() || get_comments_number()) :
                comments_template();
            endif;
            ?>
        
        <?php endwhile; // end of the loop. ?>

        <link crossorigin="anonymous" href="https://use.fontawesome.com/releases/v5.3.1/css/all.css" integrity="sha384-mzrmE5qonljUremFsqc01SB46JvROS7bZs3IO2EmfFsd15uHvIt+Y8vEf7N7fWAU" rel="stylesheet" />
        <link href="<?php echo plugin_dir_url(__FILE__) ?>tapestry-d3/tapestry.css" rel="stylesheet" />
        <link href="<?php echo plugin_dir_url(__FILE__) ?>tapestry-d3/libs/jquery-ui.min.css" rel="stylesheet" />
        <link href="<?php echo plugin_dir_url(__FILE__) ?>tapestry-d3/libs/bootstrap.min.css" rel="stylesheet" />

        <script src="<?php echo plugin_dir_url(__FILE__) ?>tapestry-d3/libs/jquery.min.js" type="application/javascript"></script>
        <script src="<?php echo plugin_dir_url(__FILE__) ?>tapestry-d3/libs/jquery-ui.min.js" type="application/javascript"></script>
        <script src="<?php echo plugin_dir_url(__FILE__) ?>tapestry-d3/libs/jscookie.js" type="application/javascript"></script>
        <script src="<?php echo plugin_dir_url(__FILE__) ?>tapestry-d3/libs/d3.v5.min.js" type="application/javascript"></script>
        <script src="<?php echo plugin_dir_url(__FILE__) ?>tapestry-d3/libs/h5p-resizer.min.js" charset="UTF-8"></script>
        <script src="<?php echo plugin_dir_url(__FILE__) ?>tapestry-d3/libs/bootstrap.min.js" charset="UTF-8"></script>

        <script>
        // Capture click events anywhere inside or outside tapestry
        $(document).ready(function(){
            document.body.addEventListener('click', function(event) {
                var x = event.clientX + $(window).scrollLeft();
                var y = event.clientY + $(window).scrollTop();
                recordAnalyticsEvent('user', 'click', 'screen', null, {'x': x, 'y': y});
            }, true);

            document.getElementById('tapestry').addEventListener('click', function(event) {
                var x = event.clientX + $(window).scrollLeft();
                var y = event.clientY + $(window).scrollTop();
                recordAnalyticsEvent('user', 'click', 'tapestry', null, {'x': x, 'y': y});
            }, true);
        });
        </script>

        </main><!-- #main -->
    </div><!-- #primary -->

<?php get_footer(); ?>
