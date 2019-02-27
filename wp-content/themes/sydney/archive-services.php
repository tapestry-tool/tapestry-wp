<?php
/**
 * Services archives template
 *
 * @package Sydney
 */

get_header(); ?>

	<?php do_action('sydney_before_content'); ?>

	<div id="primary" class="content-area">
		<main id="main" class="post-wrap" role="main">

		<?php if ( have_posts() ) : ?>

			<?php while ( have_posts() ) : the_post(); ?>
				<?php $icon = get_post_meta( get_the_ID(), 'wpcf-service-icon', true ); ?>
				<?php $link = get_post_meta( get_the_ID(), 'wpcf-service-link', true ); ?>
				<div class="service col-md-4">
					<div class="roll-icon-box">
						<?php if ($icon) : ?>
						<div class="icon">
						<?php if ($link) : ?>
							<?php echo '<a href="' . esc_url( $link ) . '"><i class="fa ' . esc_html( $icon ) . '"></i></a>'; ?>
						<?php else : ?>
							<?php echo '<i class="fa ' . esc_html( $icon ) . '"></i>'; ?>
						<?php endif; ?>
						</div>
						<?php endif; ?>							
						<div class="content">
							<h3>
								<?php if ($link) : ?>
								<a href="<?php echo esc_url($link); ?>"><?php the_title(); ?></a>
								<?php else : ?>
								<?php the_title(); ?>
								<?php endif; ?>
							</h3>
							<?php the_content(); ?>
						</div>	
					</div>
				</div>
			<?php endwhile; ?>

		<?php
			the_posts_pagination( array(
				'mid_size'  => 1,
			) );
		?>

		<?php else : ?>

			<?php get_template_part( 'content', 'none' ); ?>

		<?php endif; ?>

		</main><!-- #main -->
	</div><!-- #primary -->

	<?php do_action('sydney_after_content'); ?>

<?php get_footer(); ?>
