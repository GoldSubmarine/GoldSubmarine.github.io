//手机站的nav导航点击动画
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

$('.top-contact li').eq(0).on('touchend click', function(){
    $('#article').css('display', 'none');
    $('.nav-info').addClass('bounceOutUp');
    $('.nav-info').removeClass('bounceInDown');
})

$('.top-contact li').eq(1).on('touchend click', function(){
    $('#article').css('display', 'block');
    $('.nav-info').addClass('bounceOutUp');
    $('.nav-info').removeClass('bounceInDown');
})