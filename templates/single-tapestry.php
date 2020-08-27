<?php

/*
 Template Name: Tapestry Page Template
 */
/*
 * Register Script with Nonce.
 *
 * @return object null
 */

// str is evaluated to detect support of ES6
echo "<script type='text/javascript'>
    var str = 'class ಠ_ಠ extends Array {constructor(j = \"a\", ...c) {const q = (({u: e}) => {return { [`s${c}`]: Symbol(j) };})({});super(j, q, ...c);}}' + 
    'new Promise((f) => {const a = function* (){return \"\u{20BB7}\".match(/./u)[0].length === 2 || true;};for (let vre of a()) {' +
    'const [uw, as, he, re] = [new Set(), new WeakSet(), new Map(), new WeakMap()];break;}f(new Proxy({}, {get: (han, h) => h in han ? han[h] ' + 
    ': \"42\".repeat(0o10)}));}).then(bi => new ಠ_ಠ(bi.rd));';

    try {
        eval(str);
    } catch(e) {
        var div = document.createElement(\"div\")
        var message = document.createTextNode(\"To use the Tapestry Tool, please use a browser that supports ES6.\")
        div.appendChild(message)
        var body = document.createElement(\"body\")
        document.body = body
        document.body.appendChild(div)
    }
</script>";

get_header();

if (current_user_can('edit_post', get_the_ID())) {
    $additionalClasses = 'is-editor"';
}

?>

<div id="primary" class="content-area col-md-12">
    <main id="main" class="site-main post-wrap <?php echo $additionalClasses; ?>" role="main">

<?php

    global $post;
    if (!post_password_required($post)) { ?>
        
        <div id="tapestry-container"></div>

        <?php while (have_posts()): the_post(); ?>
	            <?php get_template_part('content', 'page'); ?>
	            <?php
    // If comments are open or we have at least one comment, load up the comment template
    if (comments_open() || get_comments_number()):
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
                    recordAnalyticsEvent('user', 'click', 'tapestry', null, { x, y });
                }, true);
            });
        </script>
        
        <?php
    } else {
        // protected, show password form?>
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
