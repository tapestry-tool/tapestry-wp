<?php

/*
 Template Name: Tapestry Page Template
 */
/**
 * Register Script with Nonce
 * 
 * @return Object null
 */

get_header(); ?>

<div id="primary" class="content-area col-md-12">
    <main id="main" class="site-main post-wrap<?php if (current_user_can('edit_post', get_the_ID())) { echo ' is-editor"'; } ?>" role="main">

<?php

	global $post;
    if( !post_password_required($post) ) { ?>
		
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
		
		<?php
	}
    else {
        // protected, show password form
        ?>
		<div class="entry">
			<header class="entry-header">
				<h1 class="entry-title">Password required to continue</h1>
			</header>
			<div class="entry-content">
				<?php echo get_the_password_form($p); ?>
			</div>
		</div>
		<?php
    }

?>
    </main><!-- #main -->
</div><!-- #primary -->

<?php get_footer(); ?>