<?php

/*
 Template Name: Tapestry Page Template
 */

get_header(); ?>

	<div id="primary" class="content-area col-md-12">
		<main id="main" class="post-wrap" role="main">
			<?php while ( have_posts() ) : the_post(); ?>

				<?php get_template_part( 'content', 'page' ); ?>

				<?php
					// If comments are open or we have at least one comment, load up the comment template
					if ( comments_open() || get_comments_number() ) :
						comments_template();
					endif;
				?>

			<?php endwhile; // end of the loop. ?>
			
            <div id="tapestry"></div>

            <link crossorigin="anonymous" href="https://use.fontawesome.com/releases/v5.3.1/css/all.css" integrity="sha384-mzrmE5qonljUremFsqc01SB46JvROS7bZs3IO2EmfFsd15uHvIt+Y8vEf7N7fWAU" rel="stylesheet" />
			<link href="<?php echo plugin_dir_url(__FILE__) ?>tapestry-d3/tapestry.css" rel="stylesheet" />
            <link href="<?php echo plugin_dir_url(__FILE__) ?>tapestry-d3/libs/jquery-ui.min.css" rel="stylesheet" />

            <script src="<?php echo plugin_dir_url(__FILE__) ?>tapestry-d3/libs/jquery.min.js" type="application/javascript"></script>
            <script src="<?php echo plugin_dir_url(__FILE__) ?>tapestry-d3/libs/jquery-ui.min.js" type="application/javascript"></script>
            <script src="<?php echo plugin_dir_url(__FILE__) ?>tapestry-d3/libs/jscookie.js" type="application/javascript"></script>
            <script src="<?php echo plugin_dir_url(__FILE__) ?>tapestry-d3/libs/d3.v5.min.js" type="application/javascript"></script>
			<script src="<?php echo plugin_dir_url(__FILE__) ?>tapestry-d3/libs/h5p-resizer.min.js" charset="UTF-8"></script>

            <script>
				var tapestryWpUserId = "<?php echo apply_filters('determine_current_user', false);?>";
				var tapestryWpPostId = "<?php echo get_the_ID();?>";
            </script>
            <script src="<?php echo plugin_dir_url(__FILE__) ?>tapestry-d3/tapestry.js"></script>

		</main><!-- #main -->
	</div><!-- #primary -->

<?php get_footer(); ?>
