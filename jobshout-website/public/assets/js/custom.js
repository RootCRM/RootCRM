$(document).ready(function() {
	// TOOLTIP
	$('.ttip').tipsy({delayIn: 0, delayOut: 0});

	$('.latest.blog ul li').hover(function() { 
			$(this).stop().animate({ paddingLeft: '10px' }, 300);
		}, function() {
			$(this).stop().animate({ paddingLeft: 0 }, 300);
	});

	//* CONTENT TOGGLE

	$(".toggle_div").hide(); 
			
	$("h6.toggle").toggle(function(){
		$(this).addClass("active");
		}, function () {
		$(this).removeClass("active");
	});

	$("h6.toggle").click(function(){
		$(this).next(".toggle_div").slideToggle();
	});

	$("#tabs").tabs();

	// PAGENAV CLICK
	$(".submenu li").click(function () {
		$(".submenu li").removeClass("current", 1000);
		$(this).addClass("current", 1000);
     });

	// Lightbox for images
	/*$("li.image a, a.fancy, div.portfolio-list.image a").fancybox({
		'titlePosition'		: 'over'
	});*/
	// Replaced (li.image a) with (a.caseStdy) coz it was not letting website link to work properly in case studies page
	$("a.caseStdy, a.fancy, div.portfolio-list.image a").fancybox({
		'titlePosition'		: 'over'
	});

	// Lightbox for vimeo videos
	$("li.vimeo a, div.portfolio-list.vimeo a").click(function() {
		$.fancybox({
			'padding'		: 0,
			'autoScale'		: false,
			'transitionIn'	: 'none',
			'transitionOut'	: 'none',
			'title'			: this.title,
			'width'			: 600,
			'height'		: 398,
			'href'			: this.href.replace(new RegExp("([0-9])","i"),'moogaloop.swf?clip_id=$1'),
			'type'			: 'swf'
		});
			return false;
	});


	// Lightbox for YouTube videos
	$("li.youtube a, div.portfolio-list.youtube a").click(function() {
		$.fancybox({
				'padding'		: 0,
				'autoScale'		: false,
				'transitionIn'	: 'none',
				'transitionOut'	: 'none',
				'title'			: this.title,
				'width'		: 680,
				'height'		: 495,
				'href'			: this.href.replace(new RegExp("watch\\?v=", "i"), 'v/'),
				'type'			: 'swf',
				'swf'			: {
					 'wmode'		: 'transparent',
					'allowfullscreen'	: 'true'
				}
			});

		return false;
	});

	// IMAGE GALLERY FADE OPACITY WHEN HOVER
	$(function() {
	
		$(".gallery img, .portfolio img, .portfolio-list img, a.fancy").css("opacity", "1");
			
		// ON MOUSE OVER
		$(".gallery img, .portfolio img, .portfolio-list img, a.fancy").hover(function () {

			// SET OPACITY TO 100%
			$(this).stop().animate({
			opacity: 0.5
			}, "fast");
		},

		// ON MOUSE OUT
		function () {

			// SET OPACITY BACK TO 100%
			$(this).stop().animate({
			opacity: 1
			}, "fast");
		});	
	});

	// MENU ACTIVE ON SUBMENU HOVER
	$("#mainMenu ul ul").hover(function () {
		$(this).parent().addClass("hover");
		},
		function() {
			$("#mainMenu ul li").removeClass("hover");
		})
		
}); // END OF DOCUMENT READY


/***
 * Twitter JS v1.13.1
 * http://code.google.com/p/twitterjs/
 * Copyright (c) 2009 Remy Sharp / MIT License
 * $Date: 2009-08-25 09:45:35 +0100 (Tue, 25 Aug 2009) $
 */
 
if(typeof getTwitters!="function")(function(){var a={},b=0;!function(a,b){function m(a){l=1;while(a=c.shift())a()}var c=[],d,e,f=!1,g=b.documentElement,h=g.doScroll,i="DOMContentLoaded",j="addEventListener",k="onreadystatechange",l=/^loade|c/.test(b.readyState);b[j]&&b[j](i,e=function(){b.removeEventListener(i,e,f),m()},f),h&&b.attachEvent(k,d=function(){/^c/.test(b.readyState)&&(b.detachEvent(k,d),m())}),a.domReady=h?function(b){self!=top?l?b():c.push(b):function(){try{g.doScroll("left")}catch(c){return setTimeout(function(){a.domReady(b)},50)}b()}()}:function(a){l?a():c.push(a)}}(a,document),window.getTwitters=function(c,d,e,f){b++,typeof d=="object"&&(f=d,d=f.id,e=f.count),e||(e=1),f?f.count=e:f={},!f.timeout&&typeof f.onTimeout=="function"&&(f.timeout=10),typeof f.clearContents=="undefined"&&(f.clearContents=!0),f.twitterTarget=c,typeof f.enableLinks=="undefined"&&(f.enableLinks=!0),a.domReady(function(a,b){return function(){function f(){a.target=document.getElementById(a.twitterTarget);if(!!a.target){var f={limit:e};f.includeRT&&(f.include_rts=!0),a.timeout&&(window["twitterTimeout"+b]=setTimeout(function(){twitterlib.cancel(),a.onTimeout.call(a.target)},a.timeout*1e3));var g="timeline";d.indexOf("#")===0&&(g="search"),d.indexOf("/")!==-1&&(g="list"),a.ignoreReplies&&(f.filter={not:new RegExp(/^@/)}),twitterlib.cache(!0),twitterlib[g](d,f,function(d,e){clearTimeout(window["twitterTimeout"+b]);var f=[],g=d.length>a.count?a.count:d.length;f=["<ul>"];for(var h=0;h<g;h++){d[h].time=twitterlib.time.relative(d[h].created_at);for(var i in d[h].user)d[h]["user_"+i]=d[h].user[i];a.template?f.push("<li>"+a.template.replace(/%([a-z_\-\.]*)%/ig,function(b,c){var e=d[h][c]+""||"";c=="text"&&(e=twitterlib.expandLinks(d[h])),c=="text"&&a.enableLinks&&(e=twitterlib.ify.clean(e));return e})+"</li>"):a.bigTemplate?f.push(twitterlib.render(d[h])):f.push(c(d[h]))}f.push("</ul>"),a.clearContents?a.target.innerHTML=f.join(""):a.target.innerHTML+=f.join(""),a.callback&&a.callback(d)})}}function c(b){var c=a.enableLinks?twitterlib.ify.clean(twitterlib.expandLinks(b)):twitterlib.expandLinks(b),d="<li>";a.prefix&&(d+='<li><span className="twitterPrefix">',d+=a.prefix.replace(/%(.*?)%/g,function(a,c){return b.user[c]}),d+=" </span></li>"),d+='<span className="twitterStatus">'+twitterlib.time.relative(b.created_at)+"</span> ",d+='<span className="twitterTime">'+b.text+"</span>",a.newwindow&&(d=d.replace(/<a href/gi,'<a target="_blank" href'));return d}typeof twitterlib=="undefined"?setTimeout(function(){var a=document.createElement("script");a.onload=a.onreadystatechange=function(){typeof window.twitterlib!="undefined"&&f()},a.src="/js/twitterlib.js";var b=document.head||document.getElementsByTagName("head")[0];b.insertBefore(a,b.firstChild)},0):f()}}(f,b))}})();
/* ------- TWITTER ------- */

getTwitters('twitter', {
        id: 'jobshoutnews', 
        count: 1, 
        enableLinks: true, 
        ignoreReplies: false,
        template: '<span class="twitterPrefix"><p class="twitterStatus">%text% <em class="twitterTime"><a href="http://twitter.com/%user_screen_name%">- %time%</a></em><span class="username"> - @ <a href="http://twitter.com/%user_screen_name%">%user_screen_name%</a></span></p>',
        newwindow: true
    });
	
getTwitters('twitterFooter', {
        id: 'jobshoutnews', 
        count: 2, 
        enableLinks: true, 
        ignoreReplies: false,
        template: '<span class="twitterPrefix"><p class="twitterStatus">%text% <em class="twitterTime"><a href="http://twitter.com/%user_screen_name%">- %time%</a></em><span class="username"> - @ <a href="http://twitter.com/%user_screen_name%">%user_screen_name%</a></span></p>',
        newwindow: true
    });


/*
 * 	loopedSlider 0.5.6 - jQuery plugin
 *	written by Nathan Searles	
 *	http://nathansearles.com/loopedslider/
 *
 *	Copyright (c) 2009 Nathan Searles (http://nathansearles.com/)
 *	Dual licensed under the MIT (MIT-LICENSE.txt)
 *	and GPL (GPL-LICENSE.txt) licenses.
 *
 *	Built for jQuery library
 *	http://jquery.com
 *	Works with jQuery version 1.3+
 *
 */
if(typeof jQuery!='undefined'){jQuery(function($){$.fn.extend({loopedSlider:function(options){var settings=$.extend({},$.fn.loopedSlider.defaults,options);return this.each(function(){if($.fn.jquery<'1.3.2'){return}var $t=$(this);var o=$.metadata?$.extend({},settings,$t.metadata()):settings;var distance=0;var times=1;var slides=$(o.slides,$t).children().size();var width=$(o.slides,$t).children().outerWidth();var position=0;var active=false;var number=0;var interval=0;var restart=0;var pagination=$("."+o.pagination+" li a",$t);if(o.addPagination&&!$(pagination).length){var buttons=slides;$($t).append("<ul class="+o.pagination+">");$(o.slides,$t).children().each(function(){if(number<buttons){$("."+o.pagination,$t).append("<li><a rel="+(number+1)+" href=\"#\" >"+(number+1)+"</a></li>");number=number+1}else{number=0;return false}$("."+o.pagination+" li a:eq(0)",$t).parent().addClass("active")});pagination=$("."+o.pagination+" li a",$t)}else{$(pagination,$t).each(function(){number=number+1;$(this).attr("rel",number);$(pagination.eq(0),$t).parent().addClass("active")})}if(slides===1){$(o.slides,$t).children().css({position:"absolute",left:position,display:"block"});return}$(o.slides,$t).css({width:(slides*width)});$(o.slides,$t).children().each(function(){$(this).css({position:"absolute",left:position,display:"block"});position=position+width});$(o.slides,$t).children(":eq("+(slides-1)+")").css({position:"absolute",left:-width});if(slides>3){$(o.slides,$t).children(":eq("+(slides-1)+")").css({position:"absolute",left:-width})}if(o.autoHeight){autoHeight(times)}$(".next",$t).click(function(){if(active===false){animate("next",true);if(o.autoStart){if(o.restart){autoStart()}else{clearInterval(sliderIntervalID)}}}return false});$(".previous",$t).click(function(){if(active===false){animate("prev",true);if(o.autoStart){if(o.restart){autoStart()}else{clearInterval(sliderIntervalID)}}}return false});if(o.containerClick){$(o.container,$t).click(function(){if(active===false){animate("next",true);if(o.autoStart){if(o.restart){autoStart()}else{clearInterval(sliderIntervalID)}}}return false})}$(pagination,$t).click(function(){if($(this).parent().hasClass("active")){return false}else{times=$(this).attr("rel");$(pagination,$t).parent().siblings().removeClass("active");$(this).parent().addClass("active");animate("fade",times);if(o.autoStart){if(o.restart){autoStart()}else{clearInterval(sliderIntervalID)}}}return false});if(o.autoStart){sliderIntervalID=setInterval(function(){if(active===false){animate("next",true)}},o.autoStart);function autoStart(){if(o.restart){clearInterval(sliderIntervalID);clearInterval(interval);clearTimeout(restart);restart=setTimeout(function(){interval=setInterval(function(){animate("next",true)},o.autoStart)},o.restart)}else{sliderIntervalID=setInterval(function(){if(active===false){animate("next",true)}},o.autoStart)}}}function current(times){if(times===slides+1){times=1}if(times===0){times=slides}$(pagination,$t).parent().siblings().removeClass("active");$(pagination+"[rel='"+(times)+"']",$t).parent().addClass("active")};function autoHeight(times){if(times===slides+1){times=1}if(times===0){times=slides}var getHeight=$(o.slides,$t).children(":eq("+(times-1)+")",$t).outerHeight();$(o.container,$t).animate({height:getHeight},o.autoHeight)};function animate(dir,clicked){active=true;switch(dir){case"next":times=times+1;distance=(-(times*width-width));current(times);if(o.autoHeight){autoHeight(times)}if(slides<3){if(times===3){$(o.slides,$t).children(":eq(0)").css({left:(slides*width)})}if(times===2){$(o.slides,$t).children(":eq("+(slides-1)+")").css({position:"absolute",left:width})}}$(o.slides,$t).animate({left:distance},o.slidespeed,function(){if(times===slides+1){times=1;$(o.slides,$t).css({left:0},function(){$(o.slides,$t).animate({left:distance})});$(o.slides,$t).children(":eq(0)").css({left:0});$(o.slides,$t).children(":eq("+(slides-1)+")").css({position:"absolute",left:-width})}if(times===slides)$(o.slides,$t).children(":eq(0)").css({left:(slides*width)});if(times===slides-1)$(o.slides,$t).children(":eq("+(slides-1)+")").css({left:(slides*width-width)});active=false});break;case"prev":times=times-1;distance=(-(times*width-width));current(times);if(o.autoHeight){autoHeight(times)}if(slides<3){if(times===0){$(o.slides,$t).children(":eq("+(slides-1)+")").css({position:"absolute",left:(-width)})}if(times===1){$(o.slides,$t).children(":eq(0)").css({position:"absolute",left:0})}}$(o.slides,$t).animate({left:distance},o.slidespeed,function(){if(times===0){times=slides;$(o.slides,$t).children(":eq("+(slides-1)+")").css({position:"absolute",left:(slides*width-width)});$(o.slides,$t).css({left:-(slides*width-width)});$(o.slides,$t).children(":eq(0)").css({left:(slides*width)})}if(times===2)$(o.slides,$t).children(":eq(0)").css({position:"absolute",left:0});if(times===1)$(o.slides,$t).children(":eq("+(slides-1)+")").css({position:"absolute",left:-width});active=false});break;case"fade":times=[times]*1;distance=(-(times*width-width));current(times);if(o.autoHeight){autoHeight(times)}$(o.slides,$t).children().fadeOut(o.fadespeed,function(){$(o.slides,$t).css({left:distance});$(o.slides,$t).children(":eq("+(slides-1)+")").css({left:slides*width-width});$(o.slides,$t).children(":eq(0)").css({left:0});if(times===slides){$(o.slides,$t).children(":eq(0)").css({left:(slides*width)})}if(times===1){$(o.slides,$t).children(":eq("+(slides-1)+")").css({position:"absolute",left:-width})}$(o.slides,$t).children().fadeIn(o.fadespeed);active=false});break;default:break}}})}});$.fn.loopedSlider.defaults={container:".container",slides:".slides",pagination:"pagination",containerClick:true,autoStart:0,restart:0,slidespeed:300,fadespeed:200,autoHeight:0,addPagination:false}})}

/**
 * Cookie plugin
 *
 * Copyright (c) 2006 Klaus Hartl (stilbuero.de)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 */

jQuery.cookie = function(name, value, options) {
    if (typeof value != 'undefined') { // name and value given, set cookie
        options = options || {};
        if (value === null) {
            value = '';
            options.expires = -1;
        }
        var expires = '';
        if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
            var date;
            if (typeof options.expires == 'number') {
                date = new Date();
                date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
            } else {
                date = options.expires;
            }
            expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
        }
        var path = options.path ? '; path=' + (options.path) : '';
        var domain = options.domain ? '; domain=' + (options.domain) : '';
        var secure = options.secure ? '; secure' : '';
        document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
    } else { // only name given, get cookie
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
};

//
// Skin switch function
// ---------------------------
function switchSkin(skin) {
	$.cookie("skin", skin);
	document.location.reload(true);
}

//
// Include skin style sheet
// ---------------------------
	var skin = $.cookie("skin") || "4";
	document.write('<link rel="stylesheet" href="assets/css/skin-'+ skin +'.css" type="text/css" />');