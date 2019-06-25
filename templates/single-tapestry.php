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
        'wp_api_script',
        plugin_dir_url(__FILE__) . 'tapestry-d3/tapestry.js',
        array('jquery'),
        false,
        true
    );
    wp_localize_script('wp_api_script', 'wpApiSettings', $params);
    wp_enqueue_script('wp_api_script');
}
add_action('wp_enqueue_scripts', 'addNonceToScript');

get_header(); ?>
    <?php require "utility/utility.php";?>
    <div id="primary" class="content-area col-md-12">
        <main id="main" class="post-wrap" role="main">
        <?php while ( have_posts() ) : the_post(); ?>

            <?php get_template_part('content', 'page'); ?>

            <?php
            // If comments are open or we have at least one comment, load up the comment template
            if (comments_open() || get_comments_number()) :
                comments_template();
            endif;
            ?>

        <?php endwhile; // end of the loop. ?>
        <!-- Don't render add root button when there's nodes -->
        <?php if(!doesTapestryHaveNodes(get_the_ID())) : ?>
            <div id="root-node-btn"><i class="fas fa-plus fa-3x"></i></div>
        <?php endif; ?>
        <div id="tapestry"></div>
        
        <?php require "modal/create-new-node-modal.php";?>



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
            var apiUrl = "<?php echo get_rest_url(null, 'tapestry-tool/v1'); ?>";
            var tapestryWpUserId = "<?php echo apply_filters('determine_current_user', false); ?>";
            var tapestryWpPostId = "<?php echo get_the_ID(); ?>";
            var tapestryWpIsAdmin = "<?php echo current_user_can('administrator'); ?>";
        </script>

        </main><!-- #main -->
    </div><!-- #primary -->

<?php get_footer(); ?>
