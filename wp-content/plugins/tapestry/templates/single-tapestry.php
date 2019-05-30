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

			<!-- Modal -->
			<div class="modal fade" id="createNewNodeModal" tabindex="-1" role="dialog" aria-labelledby="createNewNodeModalLabel" aria-hidden="true">
				<div class="modal-dialog" role="document">
					<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title" id="createNewNodeModalLabel">Create New Node</h5>
					</div>
					<div class="modal-body" id="createNewNodeModalBody">
						<form class="form-container">
							<h2 id="formTitle"></h2>
							<label>Title
								<input name="title" type="text" placeholder="Enter the topic title" required >
							</label>
							<label>Thumbnail
								<input name="imageURL" type="url" placeholder="Enter the URL for the thumbnail" required>
							</label>
							<label>Media Type
								<div class="dropdown">
								<select id="mediaType" name="mediaType">
									<option value="default">Select type:</option>
									<option value="video">video</option>
									<!--<option value="image">image</option>-->
								</select>
								</div>
							</label>
							<label>Media Format
								<div class="dropdown">
								<select id="mediaFormat" name="mediaFormat">
									<option value="default">Select format:</option>
									<option value="mp4">MP4</option>
									<option value="h5p">H5P</option>
									<!--<option value="jpeg">JPEG</option>-->
								</select>
								</div>
							</label>
							<div id="contents-details" class="content-details" style="display: none">
								<h3>Content Details</h3>
								<div id="mp4-content" class="mp4-content">
								<label>Video URL
									<input name="mp4-mediaURL" type="url" placeholder="Enter URL for MP4 Video" >
								</label>
								<label>Video Duration
									<input name="mp4-mediaDuration" type="text" placeholder="Enter URL for MP4 Video" >
								</label>
								</div>
								<div id="h5p-content" class="h5p-content">
								<label>H5P Embed Link
									<input name="h5p-mediaURL" type="url" placeholder="Enter H5P Embed Link" >
								</label>
								<label>H5P Content Duration
									<input name="h5p-mediaDuration" type="text" placeholder="Enter URL for MP4 Video" >
								</label>
								</div>
								<div>
								<label>Appears at:
									<input name="appearsAt" type="text" placeholder="Enter time the media gets unlocked" >
								</label>
								</div>
							</div>
							<div>
								<h3>User Types:</h3>
								<label>Admin
								<div class="dropdown">
									<select id="admin" name="admin">
									<option value="normal">Normal</option>
									<option value="optional">Optional</option>
									<option value="hidden">Hidden</option>
									</select>
								</div>
								</label>
								<label>Consumer
								<div class="dropdown">
									<select id="consumer" name="consumer">
									<option value="normal">Normal</option>
									<option value="optional">Optional</option>
									<option value="hidden">Hidden</option>
									</select>
								</div>
								</label>
								<label>Editor
								<div class="dropdown">
									<select id="editor" name="editor">
									<option value="normal">Normal</option>
									<option value="optional">Optional</option>
									<option value="hidden">Hidden</option>
									</select>
								</div>
								</label>
							</div>
						</form>
					</div>
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-secondary" data-dismiss="modal" id="cancel-add-new-node">Close</button>
					<button type="button" class="btn btn-primary" id="submit-add-new-node">Submit</button>
				</div>
				</div>
			</div>
			</div>

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
				var jsonUrl = "<?php echo plugin_dir_url(__FILE__) ?>tapestry-d3/tapestry.json";
				var tapestryWpUserId = "<?php echo apply_filters('determine_current_user', false);?>";
				var tapestryWpPostId = "<?php echo get_the_ID();?>";
            </script>
            <script src="<?php echo plugin_dir_url(__FILE__) ?>tapestry-d3/tapestry.js"></script>

		</main><!-- #main -->
	</div><!-- #primary -->

<?php get_footer(); ?>
