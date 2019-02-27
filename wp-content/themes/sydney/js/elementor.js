(function ($) {

	var aThemesTeamCarouselrun = function ($scope, $) {

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

	$(window).on('elementor/frontend/init', function () {
		elementorFrontend.hooks.addAction('frontend/element_ready/athemes-employee-carousel.default', aThemesTeamCarouselrun);
	});

})(jQuery);