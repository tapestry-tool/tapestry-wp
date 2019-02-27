/**
 * Theme Customizer enhancements for a better user experience.
 *
 * Contains handlers to make Theme Customizer preview reload changes asynchronously.
 */

( function( $ ) {
	// Site title and description.
	wp.customize( 'blogname', function( value ) {
		value.bind( function( to ) {
			$( '.site-title a' ).text( to );
		} );
	} );
	wp.customize( 'blogdescription', function( value ) {
		value.bind( function( to ) {
			$( '.site-description' ).text( to );
		} );
	} );
	// Header text color.
	wp.customize( 'header_textcolor', function( value ) {
		value.bind( function( to ) {
			if ( 'blank' === to ) {
				$( '.site-title, .site-description' ).css( {
					'clip': 'rect(1px, 1px, 1px, 1px)',
					'position': 'absolute'
				} );
			} else {
				$( '.site-title, .site-description' ).css( {
					'clip': 'auto',
					'color': to,
					'position': 'relative'
				} );
			}
		} );
	} );

	//Site title
	wp.customize('site_title_color',function( value ) {
		value.bind( function( newval ) {
			$('.site-title a').css('color', newval );
		} );
	});
	//Site desc
	wp.customize('site_desc_color',function( value ) {
		value.bind( function( newval ) {
			$('.site-description').css('color', newval );
		} );
	});

	//Top level menu items
	wp.customize('top_items_color',function( value ) {
		value.bind( function( newval ) {
			$('#mainnav ul li a').not('#mainnav .sub-menu li a').css('color', newval );
		} );
	});	
	//Sub-menu items
	wp.customize('submenu_items_color',function( value ) {
		value.bind( function( newval ) {
			$('#mainnav .sub-menu li a ').css('color', newval );
		} );
	});
	//Slider text
	wp.customize('slider_text',function( value ) {
		value.bind( function( newval ) {
			$('.text-slider .maintitle, .text-slider .subtitle').css('color', newval );
		} );
	});	
	// Body text color
	wp.customize('body_text_color',function( value ) {
		value.bind( function( newval ) {
			$('body').css('color', newval );
		} );
	});		
	//Sidebar background
	wp.customize('sidebar_background',function( value ) {
		value.bind( function( newval ) {
			$('.widget-area').css('background-color', newval );
		} );
	});	
	//Sidebar color
	wp.customize('sidebar_color',function( value ) {
		value.bind( function( newval ) {
			$('.widget-area,.widget-area a, .widget-area .widget-title').css('color', newval );
		} );
	});
	//Footer widgets background
	wp.customize('footer_widgets_background',function( value ) {
		value.bind( function( newval ) {
			$('.footer-widgets').css('background-color', newval );
		} );
	});	
	//Footer widgets color
	wp.customize('footer_widgets_color',function( value ) {
		value.bind( function( newval ) {
			$('#sidebar-footer,#sidebar-footer a,.footer-widgets .widget-title').css('color', newval );
		} );
	});	
	//Footer background
	wp.customize('footer_background',function( value ) {
		value.bind( function( newval ) {
			$('.site-footer').css('background-color', newval );
		} );
	});
	//Footer color
	wp.customize('footer_color',function( value ) {
		value.bind( function( newval ) {
			$('.site-footer,.site-footer a').css('color', newval );
		} );
	});

	//Slider
	wp.customize( 'slider_image_1', function( value ) {
		value.bind( function( to ) {
			$( '.slide-item:eq(0)' ).css( 'background-image', 'url(' + to + ')' );
		} );
	} );	
	wp.customize( 'slider_image_2', function( value ) {
		value.bind( function( to ) {
			$( '.slide-item:eq(1)' ).css( 'background-image', 'url(' + to + ')' );
		} );
	} );	
	wp.customize( 'slider_image_3', function( value ) {
		value.bind( function( to ) {
			$( '.slide-item:eq(2)' ).css( 'background-image', 'url(' + to + ')' );
		} );
	} );	
	wp.customize( 'slider_image_4', function( value ) {
		value.bind( function( to ) {
			$( '.slide-item:eq(3)' ).css( 'background-image', 'url(' + to + ')' );
		} );
	} );	
	wp.customize( 'slider_image_5', function( value ) {
		value.bind( function( to ) {
			$( '.slide-item:eq(4)' ).css( 'background-image', 'url(' + to + ')' );
		} );
	} );
	wp.customize( 'slider_button_url', function( value ) {
		value.bind( function( to ) {
			$( '.button-slider' ).attr( 'href', to );
		} );
	} );	


	//Primary color
	wp.customize( 'primary_color', function( value ) {
		value.bind( function( to ) {

			var styleContents = $( '#sydney-style-inline-css' ).text();

			/* Break function in two */
			var newStyle = styleContents + '.widget-area .widget_fp_social a,#mainnav ul li a:hover, .sydney_contact_info_widget span, .roll-team .team-content .name,.roll-team .team-item .team-pop .team-social li:hover a,.roll-infomation li.address:before,.roll-infomation li.phone:before,.roll-infomation li.email:before,.roll-testimonials .name,.roll-button.border,.roll-button:hover,.roll-icon-list .icon i,.roll-icon-list .content h3 a:hover,.roll-icon-box.white .content h3 a,.roll-icon-box .icon i,.roll-icon-box .content h3 a:hover,.switcher-container .switcher-icon a:focus,.go-top:hover,.hentry .meta-post a:hover,#mainnav > ul > li > a.active, #mainnav > ul > li > a:hover, button:hover, input[type=\"button\"]:hover, input[type=\"reset\"]:hover, input[type=\"submit\"]:hover, .text-color, .social-menu-widget a, .social-menu-widget a:hover, .archive .team-social li a, a, h1 a, h2 a, h3 a, h4 a, h5 a, h6 a,.classic-alt .meta-post a,.single .hentry .meta-post a { color:' + to + '}.reply,.woocommerce div.product .woocommerce-tabs ul.tabs li.active,.woocommerce #respond input#submit,.woocommerce a.button,.woocommerce button.button,.woocommerce input.button,.project-filter li a.active, .project-filter li a:hover,.preloader .pre-bounce1, .preloader .pre-bounce2,.roll-team .team-item .team-pop,.roll-progress .progress-animate,.roll-socials li a:hover,.roll-project .project-item .project-pop,.roll-project .project-filter li.active,.roll-project .project-filter li:hover,.roll-button.light:hover,.roll-button.border:hover,.roll-button,.roll-icon-box.white .icon,.owl-theme .owl-controls .owl-page.active span,.owl-theme .owl-controls.clickable .owl-page:hover span,.go-top,.bottom .socials li:hover a,.sidebar .widget:before,.blog-pagination ul li.active,.blog-pagination ul li:hover a,.content-area .hentry:after,.text-slider .maintitle:after,.error-wrap #search-submit:hover,#mainnav .sub-menu li:hover > a,#mainnav ul li ul:after, button, input[type=\"button\"], input[type=\"reset\"], input[type=\"submit\"], .panel-grid-cell .widget-title:after { background-color:' + to + '}.roll-socials li a:hover,.roll-socials li a,.roll-button.light:hover,.roll-button.border,.roll-button,.roll-icon-list .icon,.roll-icon-box .icon,.owl-theme .owl-controls .owl-page span,.comment .comment-detail,.widget-tags .tag-list a:hover,.blog-pagination ul li,.hentry blockquote,.error-wrap #search-submit:hover,textarea:focus,input[type=\"text\"]:focus,input[type=\"password\"]:focus,input[type=\"datetime\"]:focus,input[type=\"datetime-local\"]:focus,input[type=\"date\"]:focus,input[type=\"month\"]:focus,input[type=\"time\"]:focus,input[type=\"week\"]:focus,input[type=\"number\"]:focus,input[type=\"email\"]:focus,input[type=\"url\"]:focus,input[type=\"search\"]:focus,input[type=\"tel\"]:focus,input[type=\"color\"]:focus, button, input[type=\"button\"], input[type=\"reset\"], input[type=\"submit\"], .archive .team-social li a { border-color:' + to + '}';
			$( '#sydney-style-inline-css' ).text(newStyle);

		} );
	} );	   







} )( jQuery );
