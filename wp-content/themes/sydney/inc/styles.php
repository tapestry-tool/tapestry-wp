<?php
/**
 * @package Sydney
 */

//Converts hex colors to rgba for the menu background color
function sydney_hex2rgba($color, $opacity = false) {

        if ($color[0] == '#' ) {
        	$color = substr( $color, 1 );
        }
        $hex = array( $color[0] . $color[1], $color[2] . $color[3], $color[4] . $color[5] );
        $rgb =  array_map('hexdec', $hex);
        $opacity = 0.9;
        $output = 'rgba('.implode(",",$rgb).','.$opacity.')';

        return $output;
}

//Dynamic styles
function sydney_custom_styles($custom) {

	$custom = '';
	//Header
	if ( (get_theme_mod('front_header_type','slider') == 'nothing' && is_front_page()) || (get_theme_mod('site_header_type') == 'nothing' && !is_front_page()) ) {
		$menu_bg_color = get_theme_mod( 'menu_bg_color', '#000000' );
		$rgba 	= sydney_hex2rgba($menu_bg_color, 0.9);
		$custom .= ".site-header { background-color:" . esc_attr($rgba) . ";}" . "\n";
	}
	//Fonts
	$body_fonts = get_theme_mod('body_font_family');	
	$headings_fonts = get_theme_mod('headings_font_family');
	if ( $body_fonts !='' ) {
		$custom .= "body, #mainnav ul ul a { font-family:" . $body_fonts . "!important;}"."\n";
	}
	if ( $headings_fonts !='' ) {
		$custom .= "h1, h2, h3, h4, h5, h6, #mainnav ul li a, .portfolio-info, .roll-testimonials .name, .roll-team .team-content .name, .roll-team .team-item .team-pop .name, .roll-tabs .menu-tab li a, .roll-testimonials .name, .roll-project .project-filter li a, .roll-button, .roll-counter .name-count, .roll-counter .numb-count button, input[type=\"button\"], input[type=\"reset\"], input[type=\"submit\"] { font-family:" . $headings_fonts . ";}"."\n";
	}
    //Site title
    $site_title_size = get_theme_mod( 'site_title_size', '32' );
    if ($site_title_size) {
        $custom .= ".site-title { font-size:" . intval($site_title_size) . "px; }"."\n";
    }
    //Site description
    $site_desc_size = get_theme_mod( 'site_desc_size', '16' );
    if ($site_desc_size) {
        $custom .= ".site-description { font-size:" . intval($site_desc_size) . "px; }"."\n";
    }
    //Menu
    $menu_size = get_theme_mod( 'menu_size', '14' );
    if ($menu_size) {
        $custom .= "#mainnav ul li a { font-size:" . intval($menu_size) . "px; }"."\n";
    }    	    	
	//H1 size
	$h1_size = get_theme_mod( 'h1_size','52' );
	if ($h1_size) {
		$custom .= "h1 { font-size:" . intval($h1_size) . "px; }"."\n";
	}
    //H2 size
    $h2_size = get_theme_mod( 'h2_size','42' );
    if ($h2_size) {
        $custom .= "h2 { font-size:" . intval($h2_size) . "px; }"."\n";
    }
    //H3 size
    $h3_size = get_theme_mod( 'h3_size','32' );
    if ($h3_size) {
        $custom .= "h3 { font-size:" . intval($h3_size) . "px; }"."\n";
    }
    //H4 size
    $h4_size = get_theme_mod( 'h4_size','25' );
    if ($h4_size) {
        $custom .= "h4 { font-size:" . intval($h4_size) . "px; }"."\n";
    }
    //H5 size
    $h5_size = get_theme_mod( 'h5_size','20' );
    if ($h5_size) {
        $custom .= "h5 { font-size:" . intval($h5_size) . "px; }"."\n";
    }
    //H6 size
    $h6_size = get_theme_mod( 'h6_size','18' );
    if ($h6_size) {
        $custom .= "h6 { font-size:" . intval($h6_size) . "px; }"."\n";
    }
    //Body size
    $body_size = get_theme_mod( 'body_size', '16' );
    if ($body_size) {
        $custom .= "body { font-size:" . intval($body_size) . "px; }"."\n";
    }
    //Single post title
    $single_post_title_size = get_theme_mod( 'single_post_title_size', '36' );
    if ($single_post_title_size) {
        $custom .= ".single .hentry .title-post { font-size:" . intval($single_post_title_size) . "px; }"."\n";
    }
	//Header image
	$header_bg_size = get_theme_mod('header_bg_size','cover');	
	$header_height = get_theme_mod('header_height','300');
	$custom .= ".header-image { background-size:" . esc_attr($header_bg_size) . ";}"."\n";
	$custom .= ".header-image { height:" . intval($header_height) . "px; }"."\n";

	//Menu style
	$sticky_menu = get_theme_mod('sticky_menu','sticky');
	if ($sticky_menu == 'static') {
		$custom .= ".site-header.fixed { position: absolute;}"."\n";
	}
	$menu_style = get_theme_mod('menu_style','inline');
	if ($menu_style == 'centered') {
		$custom .= ".header-wrap .col-md-4, .header-wrap .col-md-8 { width: 100%; text-align: center;}"."\n";
		$custom .= "#mainnav { float: none;}"."\n";
		$custom .= "#mainnav li { float: none; display: inline-block;}"."\n";
		$custom .= "#mainnav ul ul li { display: block; text-align: left; float:left;}"."\n";
		$custom .= ".site-logo, .header-wrap .col-md-4 { margin-bottom: 15px; }"."\n";
		$custom .= ".btn-menu { margin: 0 auto; float: none; }"."\n";
		$custom .= ".header-wrap .container > .row { display: block; }"."\n";
	}	


	//__COLORS
	//Primary color
	$primary_color = get_theme_mod( 'primary_color', '#d65050' );
	if ( $primary_color != '#d65050' ) {
	$custom .= ".widget-area .widget_fp_social a,#mainnav ul li a:hover, .sydney_contact_info_widget span, .roll-team .team-content .name,.roll-team .team-item .team-pop .team-social li:hover a,.roll-infomation li.address:before,.roll-infomation li.phone:before,.roll-infomation li.email:before,.roll-testimonials .name,.roll-button.border,.roll-button:hover,.roll-icon-list .icon i,.roll-icon-list .content h3 a:hover,.roll-icon-box.white .content h3 a,.roll-icon-box .icon i,.roll-icon-box .content h3 a:hover,.switcher-container .switcher-icon a:focus,.go-top:hover,.hentry .meta-post a:hover,#mainnav > ul > li > a.active, #mainnav > ul > li > a:hover, button:hover, input[type=\"button\"]:hover, input[type=\"reset\"]:hover, input[type=\"submit\"]:hover, .text-color, .social-menu-widget a, .social-menu-widget a:hover, .archive .team-social li a, a, h1 a, h2 a, h3 a, h4 a, h5 a, h6 a,.classic-alt .meta-post a,.single .hentry .meta-post a { color:" . esc_attr($primary_color) . "}"."\n";
	$custom .= ".reply,.woocommerce div.product .woocommerce-tabs ul.tabs li.active,.woocommerce #respond input#submit,.woocommerce a.button,.woocommerce button.button,.woocommerce input.button,.project-filter li a.active, .project-filter li a:hover,.preloader .pre-bounce1, .preloader .pre-bounce2,.roll-team .team-item .team-pop,.roll-progress .progress-animate,.roll-socials li a:hover,.roll-project .project-item .project-pop,.roll-project .project-filter li.active,.roll-project .project-filter li:hover,.roll-button.light:hover,.roll-button.border:hover,.roll-button,.roll-icon-box.white .icon,.owl-theme .owl-controls .owl-page.active span,.owl-theme .owl-controls.clickable .owl-page:hover span,.go-top,.bottom .socials li:hover a,.sidebar .widget:before,.blog-pagination ul li.active,.blog-pagination ul li:hover a,.content-area .hentry:after,.text-slider .maintitle:after,.error-wrap #search-submit:hover,#mainnav .sub-menu li:hover > a,#mainnav ul li ul:after, button, input[type=\"button\"], input[type=\"reset\"], input[type=\"submit\"], .panel-grid-cell .widget-title:after { background-color:" . esc_attr($primary_color) . "}"."\n";
	$custom .= ".roll-socials li a:hover,.roll-socials li a,.roll-button.light:hover,.roll-button.border,.roll-button,.roll-icon-list .icon,.roll-icon-box .icon,.owl-theme .owl-controls .owl-page span,.comment .comment-detail,.widget-tags .tag-list a:hover,.blog-pagination ul li,.hentry blockquote,.error-wrap #search-submit:hover,textarea:focus,input[type=\"text\"]:focus,input[type=\"password\"]:focus,input[type=\"datetime\"]:focus,input[type=\"datetime-local\"]:focus,input[type=\"date\"]:focus,input[type=\"month\"]:focus,input[type=\"time\"]:focus,input[type=\"week\"]:focus,input[type=\"number\"]:focus,input[type=\"email\"]:focus,input[type=\"url\"]:focus,input[type=\"search\"]:focus,input[type=\"tel\"]:focus,input[type=\"color\"]:focus, button, input[type=\"button\"], input[type=\"reset\"], input[type=\"submit\"], .archive .team-social li a { border-color:" . esc_attr($primary_color) . "}"."\n";
	}
	//Menu background
	$menu_bg_color = get_theme_mod( 'menu_bg_color', '#000000' );
	$rgba = sydney_hex2rgba($menu_bg_color, 0.9);
	$custom .= ".site-header.float-header { background-color:" . esc_attr($rgba) . ";}" . "\n";
	$custom .= "@media only screen and (max-width: 1024px) { .site-header { background-color:" . esc_attr($menu_bg_color) . ";}}" . "\n";
	//Site title
	$site_title = get_theme_mod( 'site_title_color', '#ffffff' );
	$custom .= ".site-title a, .site-title a:hover { color:" . esc_attr($site_title) . "}"."\n";
	//Site desc
	$site_desc = get_theme_mod( 'site_desc_color', '#ffffff' );
	$custom .= ".site-description { color:" . esc_attr($site_desc) . "}"."\n";
	//Top level menu items color
	$top_items_color = get_theme_mod( 'top_items_color', '#ffffff' );
	$custom .= "#mainnav ul li a, #mainnav ul li::before { color:" . esc_attr($top_items_color) . "}"."\n";
	//Sub menu items color
	$submenu_items_color = get_theme_mod( 'submenu_items_color', '#ffffff' );
	$custom .= "#mainnav .sub-menu li a { color:" . esc_attr($submenu_items_color) . "}"."\n";
	//Sub menu background
	$submenu_background = get_theme_mod( 'submenu_background', '#1c1c1c' );
	$custom .= "#mainnav .sub-menu li a { background:" . esc_attr($submenu_background) . "}"."\n";
	//Header slider text
	$slider_text = get_theme_mod( 'slider_text', '#ffffff' );
	$custom .= ".text-slider .maintitle, .text-slider .subtitle { color:" . esc_attr($slider_text) . "}"."\n";
	//Body
	$body_text = get_theme_mod( 'body_text_color', '#47425d' );
	$custom .= "body { color:" . esc_attr($body_text) . "}"."\n";
	//Sidebar background
	$sidebar_background = get_theme_mod( 'sidebar_background', '#ffffff' );
	$custom .= "#secondary { background-color:" . esc_attr($sidebar_background) . "}"."\n";
	//Sidebar color
	$sidebar_color = get_theme_mod( 'sidebar_color', '#767676' );
	$custom .= "#secondary, #secondary a, #secondary .widget-title { color:" . esc_attr($sidebar_color) . "}"."\n";	
	//Footer widget area background
	$footer_widgets_background = get_theme_mod( 'footer_widgets_background', '#252525' );
	$custom .= ".footer-widgets { background-color:" . esc_attr($footer_widgets_background) . "}"."\n";	
	//Footer widget area color
	$footer_widgets_color = get_theme_mod( 'footer_widgets_color', '#767676' );
	if ( $footer_widgets_color != '#767676' ) {
		$custom .= "#sidebar-footer,#sidebar-footer a,.footer-widgets .widget-title { color:" . esc_attr($footer_widgets_color) . "}"."\n";	
	}
	//Mobile menu icon
	$mobile_menu_color = get_theme_mod( 'mobile_menu_color', '#ffffff' );
	$custom .= ".btn-menu { color:" . esc_attr($mobile_menu_color) . "}"."\n";

	//Menu items hover
	$menu_items_hover = get_theme_mod( 'menu_items_hover', '#d65050' );
	$custom .= "#mainnav ul li a:hover { color:" . esc_attr($menu_items_hover) . "}"."\n";	

	//Footer background
	$footer_background = get_theme_mod( 'footer_background', '#1c1c1c' );
	$custom .= ".site-footer { background-color:" . esc_attr($footer_background) . "}"."\n";	
	//Footer color
	$footer_color = get_theme_mod( 'footer_color', '#666666' );
	$custom .= ".site-footer,.site-footer a { color:" . esc_attr($footer_color) . "}"."\n";	
	//Rows overlay
	$rows_overlay = get_theme_mod( 'rows_overlay', '#000000' );
	$custom .= ".overlay { background-color:" . esc_attr($rows_overlay) . "}"."\n";	

	//Page wrapper padding
	$pw_top_padding = get_theme_mod( 'wrapper_top_padding', '83' );
	$pw_bottom_padding = get_theme_mod( 'wrapper_bottom_padding', '100' );
	$custom .= ".page-wrap { padding-top:" . intval($pw_top_padding) . "px;}"."\n";	
	$custom .= ".page-wrap { padding-bottom:" . intval($pw_bottom_padding) . "px;}"."\n";	


    $text_slide = get_theme_mod('textslider_slide', 0);
    if ( $text_slide ) {
		$custom .= ".slide-inner { display:none;}"."\n";	
		$custom .= ".slide-inner.text-slider-stopped { display:block;}"."\n";	
    }

    $mobile_slider = get_theme_mod('mobile_slider', 'responsive');
    if ( $mobile_slider == 'responsive' ) {
			$custom .= "@media only screen and (max-width: 1025px) {		
			.mobile-slide {
				display: block;
			}
			.slide-item {
				background-image: none !important;
			}
			.header-slider {
			}
			.slide-item {
				height: auto !important;
			}
			.slide-inner {
				min-height: initial;
			} 
		}"."\n";     	
    }

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
	wp_add_inline_style( 'sydney-style', $custom );	
}
add_action( 'wp_enqueue_scripts', 'sydney_custom_styles' );