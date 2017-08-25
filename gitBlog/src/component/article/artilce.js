let articleWrap = document.getElementById('article-wrap');

//引入以md结尾的文件
let context = require.context("../../createMd", false, /\.md$/);
let mdUrl = context.keys()[0];
let md = context(mdUrl);


//把模板添加到html中
articleWrap.innerHTML = md;