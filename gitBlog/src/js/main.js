//手机站的nav导航
$('#top-nav-toggle').on('click', function() {
    
    $('.nav-info').addClass('animated');
    $('.nav-info').css('transform', 'translate3d(0, 0px, 0)');

    if (!$('.nav-info').hasClass('bounceInDown')) {
        $('.nav-info').addClass('bounceInDown');
        $('.nav-info').removeClass('bounceOutUp');
    } else {
        $('.nav-info').addClass('bounceOutUp');
        $('.nav-info').removeClass('bounceInDown');
    }

})

$('.top-contact a').eq(0).on('touchend', function(){
    $('#index').css('display', 'flex');
    $('#app').css('height', '100%');
    $('#article').css('display', 'none');
    $('.nav-info').addClass('bounceOutUp');
    $('.nav-info').removeClass('bounceInDown');
})

$('.top-contact a').eq(1).on('touchend', function(){
    $('#index').css('display', 'none');
    $('#app').css('height', '0');
    $('#article').css('display', 'block');
    $('.nav-info').addClass('bounceOutUp');
    $('.nav-info').removeClass('bounceInDown');
})


//侧边收缩，博客内容展开
$('#blog').on('click', function() {
    $('#app').css('width', '30%');
    $('#article').css('display', 'block');
})

$('#index-page').on('click', function() {
    $('#app').css('width', '100%');
    $('.introduce-1').removeClass('active');
})
