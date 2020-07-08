<?php

/*
 Template Name: Tapestry Page Template
 */
/**
 * Register Script with Nonce.
 *
 * @return object null
 */

get_header(); 

if (current_user_can('edit_post', get_the_ID())) { 
    $additionalClasses = 'is-editor"';
}

?>

<div id="primary" class="content-area col-md-12">
    <main id="main" class="site-main post-wrap <?php echo $additionalClasses; ?>" role="main">

<?php

	global $post;
    if( !post_password_required($post) ) { ?>
		
        <div id="tapestry-container"></div>
        <div id="user-ip" style="display:none;"><?php echo $_SERVER['REMOTE_ADDR']; ?></div>

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

            var globals = { recordAnalyticsEvent }
            /****************************************************
             * ANALYTICS FUNCTIONS
             ****************************************************/

            function recordAnalyticsEvent(actor, action, object, objectID, details) {

                if (wpUserId && wpUserId !== "") {
                    var userUUID = wpUserId;
                } else {
                    var userUUID = Cookies.get("user-uuid");
                    if (userUUID === undefined) {
                        userUUID = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                            return v.toString(16);
                        });
                        Cookies.set("user-uuid", userUUID);
                    }
                }

                if (details === undefined) {
                    details = {};
                }

                details['user-ip'] = $('#user-ip').text();

                var data = {
                    'actor': actor,
                    'action': action,
                    'object': object,
                    'user_guid': userUUID,
                    'object_id': objectID,
                    'details': JSON.stringify(details),
                };

                // Send the event to an AJAX URL to be saved
                jQuery.ajax({
                    url: apiUrl + '/analytics',
                    method: 'POST',
                    data: JSON.stringify(data),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                });
            }

            recordAnalyticsEvent('user', 'request', 'tapestry', wpPostId);

            // Capture click events anywhere inside or outside tapestry
            $(document).ready(function() {
                document.body.addEventListener('click', function(event) {
                    var x = event.clientX + $(window).scrollLeft();
                    var y = event.clientY + $(window).scrollTop();
                    recordAnalyticsEvent('user', 'click', 'screen', null, { x, y });
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