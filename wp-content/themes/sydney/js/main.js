
;(function($) {

   'use strict'

    var testMobile;
    var isMobile = {
        Android: function() {
            return navigator.userAgent.match(/Android/i);
        },
        BlackBerry: function() {
            return navigator.userAgent.match(/BlackBerry/i);
        },
        iOS: function() {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i);
        },
        Opera: function() {
            return navigator.userAgent.match(/Opera Mini/i);
        },
        Windows: function() {
            return navigator.userAgent.match(/IEMobile/i);
        },
        any: function() {
            return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
        }
    };

    var testiPad;
    var isiPad = {
        iOS: function() {
            return navigator.userAgent.match(/iPad/i);
        },
        any: function() {
            return ( isiPad.iOS() );
        }
    };

    var sliderFix = function() {
    	$( ".slides-container .slide-item").addClass('sliderFix');
    	setTimeout(function(){$( ".slides-container .slide-item").removeClass('sliderFix');}, 200);
    }

	var heroSection = function() {


		// Background slideshow
		(function() {
			if ( $( "#slideshow" ).length ) {
				$('#slideshow').superslides({
					play: $('#slideshow').data('speed'),
					animation: 'fade',
					pagination: false,
				});
			}
		})();

		function sliderHeight() {

			$('#slideshow').imagesLoaded( function() {
				if ( $(window).width() <= 1024 ){	
					var slideItemHeight = $('.slide-item:first-of-type').height();
					$('.sydney-hero-area, #slideshow').height(slideItemHeight);
				} else {
					$('.sydney-hero-area').css('height', 'auto');
				}
			});
		}

		if ($('#slideshow').data('mobileslider') === 'responsive') {

			$(document).ready(sliderHeight);
			$(window).resize(function() {   
				setTimeout(function() {
				    sliderHeight();
				}, 50);
			});
		}


		$(function() {
			$('.mainnav a[href*="#"], a.roll-button[href*="#"], .smoothscroll[href*="#"], .smoothscroll a[href*="#"]').on('click',function (e) {
			    var target = this.hash;
			    var $target = $(target);

				if ( $target.length ) {
			    	e.preventDefault();
					$('html, body').stop().animate({
					     'scrollTop': $target.offset().top - 70
					}, 900, 'swing');
			        
			        if($('#mainnav-mobi').length) $('#mainnav-mobi').hide();
			        return false;
				}
			});
		});

	};

	var responsiveMenu = function() {
		var	menuType = 'desktop';

		$(window).on('load resize', function() {
			var currMenuType = 'desktop';

			if ( matchMedia( 'only screen and (max-width: 1024px)' ).matches ) {
				currMenuType = 'mobile';
			}

			if ( currMenuType !== menuType ) {
				menuType = currMenuType;

				if ( currMenuType === 'mobile' ) {
					var $mobileMenu = $('#mainnav').attr('id', 'mainnav-mobi').hide();
					var hasChildMenu = $('#mainnav-mobi').find('li:has(ul)');

					$('#header').find('.header-wrap').after($mobileMenu);
					hasChildMenu.children('ul').hide();
					hasChildMenu.children('a').after('<span class="btn-submenu"></span>');
					$('.btn-menu').removeClass('active');
				} else {
					var $desktopMenu = $('#mainnav-mobi').attr('id', 'mainnav').removeAttr('style');

					$desktopMenu.find('.submenu').removeAttr('style');
					$('#header').find('.col-md-10').append($desktopMenu);
					$('.btn-submenu').remove();
				}
			}
		});

		$('.btn-menu').on('click', function() {
			$('#mainnav-mobi').slideToggle(300);
			$(this).toggleClass('active');
		});

		$(document).on('click', '#mainnav-mobi li .btn-submenu', function(e) {
			$(this).toggleClass('active').next('ul').slideToggle(300);
			e.stopImmediatePropagation()
		});
	}

	var panelsStyling = function() {
		$(".panel-row-style").each( function() {
			if ($(this).data('hascolor')) {
				$(this).find('h1,h2,h3,h4,h5,h6,a,.fa, div, span').css('color','inherit');
			}
			if ($(this).data('hasbg') && $(this).data('overlay') ) {
				$(this).append( '<div class="overlay"></div>' );
				var overlayColor = $(this).data('overlay-color');
				$(this).find('.overlay').css('background-color', overlayColor );				
			}
		});
		$('.panel-grid .panel-widget-style').each( function() {
			var titleColor = $(this).data('title-color');
			var headingsColor = $(this).data('headings-color');
			if ( titleColor ) {
				$(this).find('.widget-title').css('color', titleColor );
			}
			if ( headingsColor ) {
				$(this).find('h1,h2,h3:not(.widget-title),h4,h5,h6,h3 a').css('color', headingsColor );
			}			
		});	
	};

	var scrolls = function() {
		testMobile = isMobile.any();
		if (testMobile == null) {
			$(".panel-row-style, .slide-item").parallax("50%", 0.3);
		}
	};

	var checkipad = function() {
		testiPad = isiPad.any();
		if (testiPad != null) {
			$(".slides-container .slide-item").css("background-attachment", "scroll");
		}
	};

	var rollAnimation = function() {
		$('.orches-animation').each( function() {
		var orElement = $(this),
			orAnimationClass = orElement.data('animation'),
			orAnimationDelay = orElement.data('animation-delay'),
			orAnimationOffset = orElement.data('animation-offset');

			orElement.css({
				'-webkit-animation-delay':  orAnimationDelay,
				'-moz-animation-delay':     orAnimationDelay,
				'animation-delay':          orAnimationDelay
			});

			orElement.waypoint(function() {
				orElement.addClass('animated').addClass(orAnimationClass);
			},{ triggerOnce: true, offset: orAnimationOffset });
		});
	};

	var goTop = function() {
		$(window).scroll(function() {
			if ( $(this).scrollTop() > 800 ) {
				$('.go-top').addClass('show');
			} else {
				$('.go-top').removeClass('show');
			}
		});

		$('.go-top').on('click', function() {
			$("html, body").animate({ scrollTop: 0 }, 1000);
			return false;
		});
	};

	var testimonialCarousel = function(){
		if ( $().owlCarousel ) {
			$('.roll-testimonials').owlCarousel({
				navigation : false,
				pagination: true,
				responsive: true,
				items: 1,
				itemsDesktop: [3000,1],
				itemsDesktopSmall: [1400,1],
				itemsTablet:[970,1],
				itemsTabletSmall: [600,1],
				itemsMobile: [360,1],
				touchDrag: true,
				mouseDrag: true,
				autoHeight: true,
				autoPlay: $('.roll-testimonials').data('autoplay')
			});
		}
	};

	var progressBar = function() {
		$('.progress-bar').on('on-appear', function() {
			$(this).each(function() {
				var percent = $(this).data('percent');

				$(this).find('.progress-animate').animate({
					"width": percent + '%'
				},3000);

				$(this).parent('.roll-progress').find('.perc').addClass('show').animate({
					"width": percent + '%'
				},3000);
			});
		});
	};

 	var headerFixed = function() {

		if ( $( '.site-header' ).length ) {
			var headerFix = $('.site-header').offset().top;
			$(window).on('load scroll', function() {
				var y = $(this).scrollTop();
				if ( y >= headerFix) {
					$('.site-header').addClass('fixed');
					$('body').addClass('siteScrolled');
				} else {
					$('.site-header').removeClass('fixed');
					$('body').removeClass('siteScrolled');
				}
				if ( y >= 107 ) {
					$('.site-header').addClass('float-header');
				} else {
					$('.site-header').removeClass('float-header');
				}
			});
		}	
	};

	var counter = function() {
		$('.roll-counter').on('on-appear', function() {
			$(this).find('.numb-count').each(function() {
				var to = parseInt($(this).attr('data-to'));
				$(this).countTo({
					to: to,
				});
			});
		}); //counter
	};

	var detectViewport = function() {
		$('[data-waypoint-active="yes"]').waypoint(function() {
			$(this).trigger('on-appear');
		}, { offset: '90%', triggerOnce: true });

		$(window).on('load', function() {
			setTimeout(function() {
				$.waypoints('refresh');
			}, 100);
		});
	};

	var teamCarousel = function(){
		if ( $().owlCarousel ) {
			$(".roll-team:not(.roll-team.no-carousel)").owlCarousel({
				navigation : false,
				pagination: true,
				responsive: true,
				items: 3,
				itemsDesktopSmall: [1400,3],
				itemsTablet:[970,2],
				itemsTabletSmall: [600,1],
				itemsMobile: [360,1],
				touchDrag: true,
				mouseDrag: true,
				autoHeight: false,
				autoPlay: false,
			}); // end owlCarousel
		} // end if
	};

	var videoPopup = function() {

		function closePopup() {
			if ( $('.sydney-video.vid-lightbox .video-overlay').hasClass('popup-show') ) {
			    
				var popup = $('.sydney-video.vid-lightbox .video-overlay.popup-show');

			    if ( popup.find('iframe').hasClass('yt-video') ) {
			    	var vid = popup.find('iframe').attr('src').replace("&autoplay=1", "");
			    } else {
			    	var vid = popup.find('iframe').attr('src').replace("?autoplay=1", "");
			    }
			    popup.find('iframe').attr('src', vid);
			    popup.removeClass('popup-show');			    		
			}			
		}

		$('.toggle-popup').on('click',function (e) {
			e.preventDefault();
			$(this).siblings().addClass('popup-show');
			
			var url =$(this).siblings().find('iframe').attr('src');

			if (url.indexOf('youtube.com') !== -1) {
        		$(this).siblings().find('iframe')[0].src += "&autoplay=1";
        		$(this).siblings().find('iframe').addClass('yt-video');
    		} else if (url.indexOf('vimeo.com') !== -1) {
        		$(this).siblings().find('iframe')[0].src += "?autoplay=1";
        		$(this).siblings().find('iframe').addClass('vimeo-video');
    		}

		});

		$(document).keyup(function(e) {
			if (e.keyCode == 27) {
			    closePopup();
			}
		});

		$('.sydney-video.vid-lightbox .video-overlay').on('click',function () {
			closePopup();
		});

		$('.sydney-video.vid-lightbox').parents('.panel-row-style').css({'z-index': '12', 'overflow': 'visible'});	

	};	

    var responsiveVideo= function(){
	    $("body").fitVids({ ignore: '.crellyslider-slider'});
    };

	var projectEffect = function() {
		var effect = $('.project-wrap').data('portfolio-effect');

		$('.project-item').children('.item-wrap').addClass('orches-animation');

		$('.project-wrap').waypoint(function(direction) {
			$('.project-item').children('.item-wrap').each(function(idx, ele) {
				setTimeout(function() {
					$(ele).addClass('animated ' + effect);
				}, idx * 150);
			});
		}, { offset: '75%' });
	};

	var socialMenu = function() {
	    $('.widget_fp_social a').attr( 'target','_blank' );
	};

    var videoButtons = function() {
    	testMobile = isMobile.iOS();
		$(window).on('load', function () {
			$('#wp-custom-header').fitVids();
			$('.fluid-width-video-wrapper + #wp-custom-header-video-button').find('i').removeClass('fa-play').addClass('fa-pause');
			$('.fluid-width-video-wrapper + #wp-custom-header-video-button').on('click',function () {
				$(this).find('i').toggleClass('fa-play fa-pause');
			});
			if (testMobile != null) {
				$('#wp-custom-header-video-button').css('opacity', '0');
				$('#wp-custom-header-video').prop('controls',true); 
			}	
		});
    }

	var headerClone = function() { 
	    var headerHeight = $('.site-header').outerHeight();
	    $('.header-clone').css('height',headerHeight);

		$(window).resize(function(){	
			var headerHeight = $('.site-header').outerHeight();
			$('.header-clone').css('height',headerHeight);
		});		
	} 

  	var removePreloader = function() {
    	$('.preloader').css('opacity', 0);
    	setTimeout(function(){$('.preloader').hide();}, 600);
  	}	

  var portfolioIsotope = function(){

    if ( $('.project-wrap').length ) {

      $('.project-wrap').each(function() {

        var self       = $(this);
        var filterNav  = self.find('.project-filter').find('a');

        var projectIsotope = function($selector){

          $selector.isotope({
            filter: '*',
            itemSelector: '.project-item',
            percentPosition: true,
            animationOptions: {
                duration: 750,
                easing: 'liniar',
                queue: false,
            }
          });

        }

        self.children().find('.isotope-container').imagesLoaded( function() {
          projectIsotope(self.children().find('.isotope-container'));
        });

        $(window).load(function(){
          projectIsotope(self.children().find('.isotope-container'));
        });

        filterNav.click(function(){
            var selector = $(this).attr('data-filter');
            filterNav.removeClass('active');
            $(this).addClass('active');

            self.find('.isotope-container').isotope({
                filter: selector,
                animationOptions: {
                    duration: 750,
                    easing: 'liniar',
                    queue: false,
                }
            });

            return false;

        });

      });

    }

  }

	// Dom Ready
	$(function() {
		sliderFix();
		heroSection();
		headerFixed();
		testimonialCarousel();
		teamCarousel();
		counter();
		progressBar();
		detectViewport();
		responsiveMenu();
		videoPopup();
		responsiveVideo();
		rollAnimation();
		checkipad();
		panelsStyling();
		scrolls();
		projectEffect();
		socialMenu();
		goTop();
    	portfolioIsotope();
    	videoButtons();
    	headerClone();
    	removePreloader();		
   	});
})(jQuery);