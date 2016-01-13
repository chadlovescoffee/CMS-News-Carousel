var $ = require('jquery');
var infinite_scroll = require('infinite_scroll');
var dateformat = require('dateformat');

var news_qty = '';
var news_qty_last = '';



// include CSS
$('head').prepend('<link rel="stylesheet" type="text/css" href="dist/cms_news_carousel.css">');


// template setup
var html =
        '<div class="cms_news_carousel">' +
        '   <div class="outer_wrapper">' +
        '       <div class="inner_wrapper"></div>' +
        '   </div>' +
        '   <div class="arrow_wrapper">' +
        '       <div class="arrow left c1"></div>' +
        '       <div class="arrow right c1"></div>' +
        '   </div>' +
        '</div>';

$(cms_news_carousel_settings.destination).append(html);


// create more_button
$('body').append('<div class="cms_news_carousel_more_button" data-cms_news_carousel="1">');
var more_button = '.cms_news_carousel_more_button';

//cms_news_carousel ---------
cms_news_carousel();
function cms_news_carousel() {

    //console.log('package: cms_news_carousel');

    $(more_button).addClass('busy');
    news_qty_last = $('.cms_news_carousel .outer_wrapper > .inner_wrapper').children().length;
    var page_number = parseInt($(more_button).attr('data-cms_news_carousel'));

    $.ajax({
        url: "http://www.warnermusic.ca/feeds/blog_json.php",
        jsonp: "callback",
        dataType: "jsonp",

        data: {
            artist_id: cms_news_carousel_settings.artist_id,
            include: cms_news_carousel_settings.site,
            ps: cms_news_carousel_settings.qty,
            p: page_number
        },

        success: function (cms_object) {

            //console.log(cms_object);

            var loop_html = '';
            var i = 0;



            //loop
            $(cms_object.blogs).each(function () {

                var link_url = 'news/' + cms_object.blogs[i].id + '/' + cms_object.blogs[i].title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

                // dateformat
                var timezone = 18000;
                var epoch_date = parseInt(cms_object.blogs[i].timestamp) + timezone;
                var string_date = new Date(0);
                string_date.setUTCSeconds(epoch_date);
                var formatted_date = dateformat(string_date, 'mmmm dS, yyyy');



                loop_html +=
                    '<div class="news">' +
                    '   <a href="' + link_url + '">' +
                    '     <div class="photo" style="background-image: url(http://images.warnermusiccanada.com/prepareimage.php?width=500&height=500&blog_id=' + cms_object.blogs[i].id + '&type=crop);"></div>' +
                    '       <div class="wrapper">' +
                    '           <h6 class="date c1">' + formatted_date + '</h6>' +
                    '           <h3 class="title">' + cms_object.blogs[i].title + '</h3>' +
                    '           <div class="story">' + cms_object.blogs[i].body + '</div>' +
                    '       </div>' +
                    '   </a>' +
                    '</div>'
                ;
                ++i;
            });


            // append html
            $('.cms_news_carousel .outer_wrapper >.inner_wrapper').append(loop_html);


            //update more_button
            news_qty = $('.cms_news_carousel .outer_wrapper > .inner_wrapper').children().length;

            if (news_qty_last != news_qty) {
                $(more_button).attr('data-cms_news_carousel', ++page_number);
            } else {
                $(more_button).addClass('exhausted');
            }

            resize_wrapper_width();
            $(more_button).removeClass('busy');
        }
    });
}




// infinite scroll
var i_infinite_scroll = {
    'scroll_container': '.cms_news_carousel .outer_wrapper',
    'wrapper': '.cms_news_carousel .outer_wrapper .inner_wrapper',
    'more_button': more_button,
    'orientation': 'horizontal'
};
infinite_scroll(i_infinite_scroll);



// more_button click
$(document).on('click', '.cms_news_carousel_more_button', function() {
    //console.log('more click');
    if($(this).hasClass('exhausted')){
    }else {
        if ($(this).hasClass('busy')) {
        } else {
            cms_news_carousel();
        }
    }
});



// resize wrapper width
function resize_wrapper_width(){
    var wrapper_width = news_qty * $('.cms_news_carousel .news:first-child').outerWidth(true);
    $('.cms_news_carousel .outer_wrapper > .inner_wrapper').css('width', wrapper_width);
}


// window resize
$(window).resize(function() {
    resize_wrapper_width();
});


// arrow clicks
$(document).on('click', '.cms_news_carousel .arrow', function() {

    var scroll_container = '.cms_news_carousel .outer_wrapper';
    var single_width = $('.cms_news_carousel .news:first-child').outerWidth(true);
    var scroll_position = $(scroll_container).scrollLeft();
    var scroll_rounded = Math.round(scroll_position / single_width) * single_width;
    var scroll_snap = -(scroll_position - scroll_rounded);
    var scroll_calculated = '';

    var page_width = '';
    if($(window).width() > 768){
        page_width = $('.cms_news_carousel .news:first-child').outerWidth(true) * 3;
    } else {
        page_width = $('.cms_news_carousel .news:first-child').outerWidth(true) * 2;
    }


    // left arrow
    if($(this).hasClass('left')){
        scroll_calculated = page_width - scroll_snap;
        $(scroll_container).animate({scrollLeft : '-=' + scroll_calculated}, 'slow');
    }

    // right arrow
    if($(this).hasClass('right')){
        scroll_calculated = page_width + scroll_snap;
        $(scroll_container).animate({scrollLeft : '+=' + scroll_calculated}, 'slow');

    }

});
