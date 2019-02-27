<?php

/**
 * Gutenberg support
 */

function sydney_editor_styles() {
	wp_enqueue_style( 'sydney-block-editor-styles', get_theme_file_uri( '/sydney-gutenberg-editor-styles.css' ), '', '1.0', 'all' );

	wp_enqueue_style( 'sydney-fonts', esc_url( sydney_google_fonts() ), array(), null );


	//Dynamic styles
	$custom = '';

	//Fonts
	$body_fonts 	= get_theme_mod('body_font_family');	
	$headings_fonts = get_theme_mod('headings_font_family');
	if ( $body_fonts !='' ) {
		$custom .= ".editor-block-list__layout, .editor-block-list__layout .editor-block-list__block { font-family:" . $body_fonts . ";}"."\n";
	}
	if ( $headings_fonts !='' ) {
		$custom .= ".editor-post-title__block .editor-post-title__input, .editor-block-list__layout .editor-post-title__input, .editor-block-list__layout h1, .editor-block-list__layout h2, .editor-block-list__layout h3, .editor-block-list__layout h4, .editor-block-list__layout h5, .editor-block-list__layout h6 { font-family:" . $headings_fonts . ";}"."\n";
	} 	   
	
	
	//H1 size
	$h1_size = get_theme_mod( 'h1_size','52' );
	if ($h1_size) {
		$custom .= ".editor-block-list__layout h1 { font-size:" . intval($h1_size) . "px; }"."\n";
	}
	//H2 size
	$h2_size = get_theme_mod( 'h2_size','42' );
	if ($h2_size) {
		$custom .= ".editor-block-list__layout h2 { font-size:" . intval($h2_size) . "px; }"."\n";
	}
	//H3 size
	$h3_size = get_theme_mod( 'h3_size','32' );
	if ($h3_size) {
		$custom .= ".editor-block-list__layout h3 { font-size:" . intval($h3_size) . "px; }"."\n";
	}
	//H4 size
	$h4_size = get_theme_mod( 'h4_size','25' );
	if ($h4_size) {
		$custom .= ".editor-block-list__layout h4 { font-size:" . intval($h4_size) . "px; }"."\n";
	}
	//H5 size
	$h5_size = get_theme_mod( 'h5_size','20' );
	if ($h5_size) {
		$custom .= ".editor-block-list__layout h5 { font-size:" . intval($h5_size) . "px; }"."\n";
	}
	//H6 size
	$h6_size = get_theme_mod( 'h6_size','18' );
	if ($h6_size) {
		$custom .= ".editor-block-list__layout h6 { font-size:" . intval($h6_size) . "px; }"."\n";
	}
	//Body size
	$body_size = get_theme_mod( 'body_size', '16' );
	if ($body_size) {
		$custom .= ".editor-block-list__block, .editor-block-list__block p { font-size:" . intval($body_size) . "px; }"."\n";
	}
	//Single post title
	$single_post_title_size = get_theme_mod( 'single_post_title_size', '36' );
	if ($single_post_title_size) {
		$custom .= ".editor-post-title__block .editor-post-title__input, .editor-block-list__layout .editor-post-title__input { font-size:" . intval($single_post_title_size) . "px; }"."\n";
	}

	//__COLORS
	//Primary color
	$primary_color = get_theme_mod( 'primary_color', '#d65050' );
	$custom .= ".editor-block-list__layout blockquote.wp-block-quote, .editor-block-list__layout .wp-block-quote:not(.is-large):not(.is-style-large) { border-color:" . esc_attr($primary_color) . "}"."\n";

	//Body
	$body_text = get_theme_mod( 'body_text_color', '#47425d' );
	$custom .= ".editor-block-list__layout, .editor-block-list__layout .editor-block-list__block { color:" . esc_attr($body_text) . "}"."\n";

	//Small screens font sizes
	$custom .= "@media only screen and (max-width: 780px) { 
		h1 { font-size: 32px;}
		h2 { font-size: 28px;}
		h3 { font-size: 22px;}
		h4 { font-size: 18px;}
		h5 { font-size: 16px;}
		h6 { font-size: 14px;}
	}" . "\n";

	
	//Output all the styles
	wp_add_inline_style( 'sydney-block-editor-styles', $custom );	

}
add_action( 'enqueue_block_editor_assets', 'sydney_editor_styles' );