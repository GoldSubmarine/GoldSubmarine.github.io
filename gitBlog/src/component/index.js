//引入总的css
require('./index.scss');

//引入component的html，进行拼接
let top = require('./top-nav/top-nav.html');
let welcome = require('./welcome/welcome.html');
let article = require('./article/article.html');
let app = document.getElementById('app');

app.innerHTML += top;
app.innerHTML += welcome;
app.innerHTML += article;

//引入component的js
require('./article/artilce');
require('./welcome/welcome');
require('./top-nav/top-nav');

//侧边收缩，博客内容展开
$('#blog').on('click', function() {
    $('#welcome').css('width', '30%');
    $('#article').css('display', 'block');
})

$('#index-page').on('click', function() {
    $('#welcome').css('width', '100%');
    $('#article').css('display', 'none');
    // $('.introduce-1').removeClass('active');
})


