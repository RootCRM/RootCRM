var Script = function () {
	//    tool tips
    $('.tooltips').tooltip();
	//    popovers
	$('.popovers').popover();
}();

	(function() {
		$('<i id="back-to-top"></i>').appendTo($('body'));
		$(window).scroll(function() {
			if($(this).scrollTop() != 0) {
				$('#back-to-top').fadeIn();	
			} else {
				$('#back-to-top').fadeOut();
			}
		});
			
		$('#back-to-top').click(function() {
			$('body,html').animate({scrollTop:0},600);
		});	
	})();
function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,    
    function(m,key,value) {
      vars[key] = value;
    });
    return vars;
}
function dynamicSort(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}
$(document).ready(function(){ 
	var touch 	= $('#resp-menu');
	var menu 	= $('.menu');
 
	$(touch).on('click', function(e) {
		e.preventDefault();
		menu.slideToggle();
	});
	
	$(window).resize(function(){
		var w = $(window).width();
		if(w > 767 && menu.is(':hidden')) {
			menu.removeAttr('style');
		}
	});
	
			$.checkSearchBox = function checkSearchBox(){
				var searchText = $('.search2').val();
				if(searchText=='' || searchText=='Search'){
					$('.search2').val('');
					alert('Please enter search keyword(s).');return false;
				}
				else return true;
			}
			$.checkSearc2hBox = function checkSearc2hBox(){
				var searchText = $('.search3').val();
				if(searchText=='' || searchText=='Search'){
					$('.search3').val('');
					alert('Please enter search keyword(s).');return false;
				}
				else return true;
			}
			
			$('#da-slider').cslider({
         		autoplay    : true,
          		bgincrement : 100
        	});
		
        $('.bxslider1').bxSlider({
          minSlides: 5,
          maxSlides: 6,
          slideWidth: 360,
          slideMargin: 2,
          moveSlides: 1,
          responsive: true,
          nextSelector: '#slider-next',
          prevSelector: '#slider-prev',
          nextText: 'Onward →',
          prevText: '← Go back'
        });
});


      $('a.info').tooltip();
      new WOW().init();
