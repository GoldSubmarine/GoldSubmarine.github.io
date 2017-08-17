//手机站的nav导航
$('#top-nav-toggle').on('click', function() {
    
    $('.nav-info').addClass('animated');
    $('.nav-info').css('transform', 'translate3d(0, 0px, 0)');
    this.onoff = !this.onoff;
    if (this.onoff) {
        $('.nav-info').addClass('bounceInDown');
        $('.nav-info').removeClass('bounceOutUp');
    } else {
        $('.nav-info').addClass('bounceOutUp');
    }

})


//侧边收缩，博客内容展开
$('#blog').on('click', function() {
    $('#app').css('width', '30%');
    $('.introduce-1').addClass('active');
})

$('#index-page').on('click', function() {
    $('#app').css('width', '100%');
    $('.introduce-1').removeClass('active');
})
