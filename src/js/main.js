//=include ../vendor/jquery/jquery-3.5.1.js
//=include ../vendor/jquery-ui/jquery-ui.js
//=include ../vendor/bootstrap/js/bootstrap.bundle.min.js
//=include ../vendor/dropzone/dropzone.js
//=include ../vendor/owl-carousel/owl.carousel.min.js
//=include ../vendor/jquery-nice-select/js/nice-select.js
//=include ../vendor/jquery-mask/jquery.mask.min.js


$(function () {
    $('[data-toggle="tooltip"]').tooltip();
    
});

jQuery(document).ready(function() {
	jQuery('select').niceSelect();
	jQuery('.js-date--europe').mask('00.00.0000');
});

$( function() {
    $( "#suma-pozicanie" ).slider({
      range: "min",
      value: 9500,
      min: 1,
      max: 16500,
      slide: function( event, ui ) {
        $( "#pozicanie-value" ).val( ui.value + " €" );
      }
    });
    $( "#pozicanie-value" ).val( $( "#suma-pozicanie" ).slider( "value" ) + " €" );
});

$( function() {
    $( "#suma-splatka" ).slider({
      range: "min",
      value: 165,
      min: 1,
      max: 400,
      slide: function( event, ui ) {
        $( "#splatka-value" ).val( ui.value + " €" );
      }
    });
	$( "#splatka-value" ).val( $( "#suma-splatka" ).slider( "value" ) + " €" );
	
	$('.owl-carousel').owlCarousel({
		stagePadding: 50,
		loop:false,
		margin:60,
		nav:true,
		dots: false,
		responsive:{
			0:{
				items:1,
				margin:15,
				stagePadding: 0,
			},
			600:{
				items:3
			},
			1000:{
				items:3
			}
		}
	});

	$(".hamburger").click(function() {  //use a class, since your ID gets mangled
		$('.left-sidebar').toggleClass("active");    
		$(this).toggleClass('is-active');  //add the class to the clicked element
	});

	var mySwiper = new Swiper('.swiper-container', {
		// Optional parameters
		slidesPerView: 'auto',
		centeredSlides: false,
		spaceBetween: 0,
	  
		// If we need pagination
		pagination: {
		  el: '.swiper-pagination',
		},
	  
		// Navigation arrows
		navigation: {
		  nextEl: '.swiper-button-next',
		  prevEl: '.swiper-button-prev',
		},
	  
		// And if we need scrollbar
		scrollbar: {
		  el: '.swiper-scrollbar',
		},
	  });	
});

