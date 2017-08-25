/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "img/tou.ac2e56f8cb.png";

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

//引入总的css
__webpack_require__(2);

//引入component的html，进行拼接
let top = __webpack_require__(3);
let welcome = __webpack_require__(4);
let article = __webpack_require__(5);
let app = document.getElementById('app');

app.innerHTML += top;
app.innerHTML += welcome;
app.innerHTML += article;

//引入component的js
__webpack_require__(6);
__webpack_require__(9);
__webpack_require__(10);

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




/***/ }),
/* 2 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = "<nav class=\"top-nav\">\r\n    <div class=\"nav-btn\">\r\n        <span id=\"top-nav-toggle\" class=\"fa fa-list\"></span>\r\n    </div>\r\n    <div class=\"nav-info\">\r\n        <ul class=\"top-contact\">\r\n            <li>\r\n                <a href=\"javascript:;\">主页</a>\r\n            </li>\r\n            <li>\r\n                <a href=\"javascript:;\">博客</a>\r\n            </li>\r\n            <li>\r\n                <a href=\"javascript:;\">简历</a>\r\n            </li>\r\n            <li>\r\n                <a href=\"javascript:;\">关于</a>\r\n            </li>\r\n        </ul>\r\n        <ul class=\"top-social\">\r\n            <li>\r\n                <a href=\"\"><span class=\"fa fa-weibo\"></span></a>\r\n            </li>\r\n            <li>\r\n                <a href=\"\"><span class=\"fa fa-github\"></span></a>\r\n            </li>\r\n            <li>\r\n                <a href=\"\"><span class=\"fa fa-envelope\"></span></a>\r\n            </li>\r\n            <li>\r\n                <a href=\"\"><span class=\"fa fa-twitter\"></span></a>\r\n            </li>\r\n        </ul>\r\n    </div>\r\n</nav>";

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = "<div id=\"welcome\">\r\n    <div class=\"mark\"></div>\r\n    <div class=\"introduce\">\r\n        <div class=\"tou\"><img src=\"" + __webpack_require__(0) + "\" alt=\"\"></div>\r\n        <h3>OneV's Den</h3>\r\n        <p class=\"geyan\">上善若水，人淡如菊</p>\r\n        <hr>\r\n        <p class=\"introduce-1\">嗨，我是曹文军，一名web开发者。现居北京，就职于景元文化。正在修行，探求创意之源。</p>\r\n        <hr>\r\n        <p class=\"introduce-1\">ObjC 中国与 objc.io 合作最新作品《函数式 Swift》,《Core Data》及《Swift 进阶》已经发布，泊学网正在开展订阅赠书活动，也欢迎前往了解</p>\r\n        <div class=\"index-btn\">\r\n            <a href=\"javascript:;\" id=\"index-page\">主页</a>\r\n            <a href=\"javascript:;\" id=\"blog\">博客</a>\r\n            <a href=\"\">简历</a>\r\n            <a href=\"\">关于</a>\r\n        </div>\r\n        <div class=\"contact\">\r\n            <a href=\"\" class=\"fa fa-weibo\"></a>\r\n            <a href=\"\" class=\"fa fa-github\"></a>\r\n            <a href=\"\" class=\"fa fa-envelope\"></a>\r\n            <a href=\"\" class=\"fa fa-twitter\"></a>\r\n        </div>\r\n    </div>\r\n</div>\r\n";

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = "<div id=\"article\">\r\n    <div id=\"top-bg\">\r\n        <div class=\"mark\"></div>\r\n        <div class=\"introduce\">\r\n            <div class=\"tou\"><img src=\"" + __webpack_require__(0) + "\" alt=\"\"></div>\r\n            <h3>OneV's Den</h3>\r\n            <p class=\"geyan\">上善若水，人淡如菊</p>\r\n        </div>\r\n    </div>\r\n    <div id=\"article-wrap\">\r\n\r\n    </div>\r\n</div>";

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

let articleWrap = document.getElementById('article-wrap');

//引入以md结尾的文件
let context = __webpack_require__(7);
let mdUrl = context.keys()[0];
let md = context(mdUrl);


//把模板添加到html中
articleWrap.innerHTML = md;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

var map = {
	"./2017-08-14.md": 8
};
function webpackContext(req) {
	return __webpack_require__(webpackContextResolve(req));
};
function webpackContextResolve(req) {
	var id = map[req];
	if(!(id + 1)) // check for number or string
		throw new Error("Cannot find module '" + req + "'.");
	return id;
};
webpackContext.keys = function webpackContextKeys() {
	return Object.keys(map);
};
webpackContext.resolve = webpackContextResolve;
module.exports = webpackContext;
webpackContext.id = 7;

/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = "<h5 id=\"2017-08-17-\">2017-08-17 • 自动化构建</h5>\n<h1 id=\"webpack-\">webpack用于后端渲染的研究</h1>\n<h2 id=\"-\">不适用后端渲染的原因</h2>\n<p>webpack的打包方式是把所有的资源都打包成bundle.js，并用一个没有内容的html引入生成的bundle.js，不太熟悉的同学可以参看慕课网的<a href=\"http://www.imooc.com/learn/802\">视频教程</a>。但是如果公司的建站方式是后端渲染的话（如jsp），那就不能使用webpack了，因为webpack会把html也打包在bundle.js中。本文就是介绍如何用webpack生成我们需要的html，以及其中的问题和优化。</p>\n<h2 id=\"-\">主要思路</h2>\n<p>webpack的html-webpack-plugin插件，可以设置一个template，我们可以在这个template上做文章，配合上相应的loader，就可以生成我们需要的html。</p>\n<h2 id=\"-\">项目结构</h2>\n<p>下面是我的webpack目录结构</p>\n<p><img src=\"http://img.blog.csdn.net/20170808211609384?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvcXFfMjk5NTY4NzU=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast\" alt=\"这里写图片描述\"></p>\n<h2 id=\"html-\">HTML部分</h2>\n<p>如何生成我们需要的html文件呢？</p>\n<h2 id=\"html-webpack-plugin-\">html-webpack-plugin的使用</h2>\n<p>我们采用曲线救国的方式生成我们需要的html，用于后端渲染。这就要使用到html-webpack-plugin的template属性。</p>\n<pre><code class=\"lang-javascript\">module.exports = {\n  entry: &#39;index.js&#39;,\n  output: {\n    path: __dirname + &#39;/dist&#39;,\n    filename: &#39;index_bundle.js&#39;\n  },\n  plugins: [\n    new HtmlWebpackPlugin(),    // 生成一个空的html，用于引入webpack打包好的js文件\n    new HtmlWebpackPlugin({     // 再生成一个html\n      filename: &#39;test.html&#39;,\n      template: &#39;src/assets/test.html&#39;    //注意这里可以使用一个template作为要生成的html的模板\n    })\n  ]\n}\n</code></pre>\n<p>上面代码中的template这里是一个html，<a href=\"https://github.com/jantimon/html-webpack-plugin\">官方的介绍</a>是，你可以使用jade或ejs等模板引擎，也就是说webpack不关心你使用什么作为模板，只要输出一串字符串就行，于是我大胆的使用一个js文件作为模板，输出一段字符串，结果完全可行。</p>\n<p>这样就产生了很多种方案，比如用js文件作为模板，在这个js文件中require其他的html文件，进行字符串拼接，最后输出，但是这样的话，每个需要输出的页面都需要配置也个这样的js文件，懒惰的我不允许这种事情的发生.....</p>\n<p>再比如，直接使用一个html作为模板，配合使用html-loader，这个loader有一种引入其他文件的语法支持：</p>\n<pre><code class=\"lang-html\">&lt;div&gt; ${require(&#39;./components/gallery.html&#39;)} &lt;/div&gt;\n</code></pre>\n<p>这样我们就能引入其他的文件模块.....</p>\n<p>但是有的时候我们需要一些模板语法，例如我们需要循环生成<code>li</code>标签，最后我采用的方案是使用 <code>ejs</code> 作为模板文件，采用  <code>underscore-template-loader</code>  作为我的loader，而没有采用 <code>ejs-loader</code> ，因为 <code>ejs-loader</code>  不会处理文件html结构中的图片路径问题，而且 <code>ejs-loader</code> 也没有require其他ejs文件的语法支持，虽然 <code>ejs-loader</code> 官方推荐使用 <code>ejs-compiled-loader</code>  用它来引入其他的ejs模块，但是这样显得很麻烦，而且图片路径问题还是没有解决。然后我就找到了神器 <a href=\"https://github.com/emaphp/underscore-template-loader\"><code>underscore-template-loader</code></a> ，首先图片路径问题loader会帮你解决，其次该loader支持两种require其他文件的语法：</p>\n<pre><code class=\"lang-html\">&lt;div class=&quot;top-section&quot;&gt;\n    @require(&#39;header.ejs&#39;, {&quot;title&quot;: &quot;First Section&quot;})\n&lt;/div&gt;\n</code></pre>\n<p>这里引入一个ejs文件，并向其中传入对应的值。（如果你看不懂上面的代码，可以先熟悉一下<a href=\"http://ejs.co/\">ejs语法</a>）这样就能很轻松的引入一个component文件，并传入值，此外，如果你只想引入一段不带语法的html结构（即纯字符串），也可以采用下面的写法</p>\n<pre><code class=\"lang-html\">&lt;div class=&quot;wiki&quot;&gt;\n    &lt;h3 id=&quot;dsfh&quot;&gt;Introduction&lt;/h3&gt;\n    @include(&#39;intro.htm&#39;)\n    &lt;h3&gt;Authors&lt;/h3&gt;\n    @include(&#39;authors.htm&#39;)\n&lt;/div&gt;\n</code></pre>\n<p>include只会将文件转换成字符串，并引入，所以确保你要引入的文件没有被loader处理过，不然很可能引入的是一个函数，而不是一串html结构。我在layout目录下设置不同的文件夹，一个文件夹代表一个页面，其中的ejs文件作为html-webpack-plugin的template，用这个ejs文件去require其他的component，如下图：</p>\n<p><img src=\"http://img.blog.csdn.net/20170809170752390?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvcXFfMjk5NTY4NzU=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast\" alt=\"这里写图片描述\"></p>\n<p>到这里我，我们基本都已经解决了html结构的部分，那css应该写在哪里呢？另外我不想把css也打包在bundle.js中，我想要生成单独的css文件，怎么办？</p>\n<h2 id=\"-css-\">生成CSS文件</h2>\n<h3 id=\"extract-text-webpack-plugin-\">extract-text-webpack-plugin的使用</h3>\n<p>下面我们介绍另外一个webpack的插件：<a href=\"https://github.com/webpack-contrib/extract-text-webpack-plugin\"><code>extract-text-wepack-plugin</code></a>，这个插件用于提取出css文件。\n我把一个页面的css放在layout下（这里我用的是sass），用这个css去require其他的component的css，如下图：</p>\n<p><img src=\"http://img.blog.csdn.net/20170809171225200?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvcXFfMjk5NTY4NzU=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast\" alt=\"这里写图片描述\"></p>\n<p>这个总的css是有了，可是我们把它放在哪呢？任何资源只有被入口的js文件require，才能被webpack处理，所以我们当然是用layout下的入口js文件去require这个css，但是这样css也就会被打包到bundle.js中，于是我们可以在这里使用<code>extract-text-wepack-plugin</code> 怎么用呢？主要是两步：</p>\n<p>首先在rule中，对所有的scss文件使用<code>extract-text-wepack-plugin</code></p>\n<pre><code class=\"lang-javascript\">rules: [{\n        test: /\\.scss$/,\n        use: ExtractTextPlugin.extract({\n            fallback: &quot;style-loader&quot;,\n            use: [&quot;css-loader?importLoaders=2&quot;,&quot;postcss-loader&quot;,&quot;sass-loader&quot;]\n        })\n}]\n</code></pre>\n<p>其次在plugin中使用<code>extract-text-wepack-plugin</code> ：</p>\n<pre><code class=\"lang-javascript\">plugin: [new ExtractTextPlugin(&#39;[name]/[name].css&#39;)]\n</code></pre>\n<p>特别注意，我们还需要在webpack.config.js文件的头部引入<code>extract-text-wepack-plugin</code> 这个模块，不然ExtractTextPlugin 就会没有定义，从而报错：</p>\n<pre><code class=\"lang-javascript\">const ExtractTextPlugin = require(&quot;extract-text-webpack-plugin&quot;);\n</code></pre>\n<p>打包一下，在dist文件下，就能看到我们需要的css文件了。并且生成好的html也自动引入了这个css文件。</p>\n<h2 id=\"-\">如何热更新？</h2>\n<p>当我们开启webpack的webpack-dev-server后，发现改动html和css都不能产生热更新，只有改动js才能热更新，我们可以在github官方页面上找到答案，如下图：</p>\n<p><img src=\"http://img.blog.csdn.net/20170809173700591?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvcXFfMjk5NTY4NzU=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast\" alt=\"这里写图片描述\"></p>\n<p>也就是说 <code>extract-text-webpack-plugin</code> 不支持热更新，于是我们可以这样来改进它，使用两种环境，一种是开发环境，一种是生产环境，在开发环境中，我们用入口的js去 <code>require</code> <code>layout</code>文件下的ejs模板，而不再使用html-webpack-plugin生成。也就是说，在开发的时候，所有的资源都是打包在bundle.js文件中的，只有在生产的时候，才像上面我们说的那样生成html和css，大概思路就是这样，那我们可以写两份不同的webpack的config文件，一个是开发另一个用作生产。</p>\n<p>但是我只用了一个webpack.config.js，我们可以使用node提供给我们的一个API，来设置一个全局的值，使用方法如下：</p>\n<pre><code class=\"lang-javascript\">//package.json\n\n&quot;scripts&quot;: {\n    &quot;build&quot;: &quot;set NODE_ENV=production&amp;&amp; webpack -p --color&quot;\n}\n</code></pre>\n<p>使用<code>set NODE_ENV=production</code> 就可以设置这个全局的值了，这里设置的是production，<strong>注意：</strong> <code>production</code>和<code>&amp;&amp;</code> 之间不能有空格，不然这个全局的值就设置成<code>&#39;production &#39;</code> ，production后面多了一个空格，怎么获取这个值呢？我们可以在程序的任意位置，通过<code>process.env.NODE_ENV</code> 来拿到这个值，做一个 <code>if</code> 判断就可以知道是开发环境还是生产环境了。</p>\n<p>以css为例，配置如下：</p>\n<pre><code class=\"lang-javascript\">rules: [{\n   test: /\\.scss$/,\n   use: process.env.NODE_ENV == &#39;production&#39;\n        ? ExtractTextPlugin.extract({ fallback: &quot;style-loader&quot;, use: [\n            &quot;css-loader?importLoaders=2&quot;,\n            &quot;postcss-loader&quot;,\n            &quot;sass-loader&quot;\n          ]\n        })\n        : [&#39;style-loader&#39;,&#39;css-loader?importLoaders=2&#39;,&quot;postcss-loader&quot;,&#39;sass-loader&#39;]\n}]\n</code></pre>\n<p>这样就可以用一份配置实现不同的需求，当然，我们还可以使用webpack提供的一个插件：<code>DefinePlugin</code> 把这个值暴露给整个webpack</p>\n<pre><code class=\"lang-javascript\">plugin: [new webpack.DefinePlugin({\n            &#39;ENV&#39;: JSON.stringify(process.env.NODE_ENV)//获取到NODE_ENV的值，并暴露为全局变量\n        })\n]\n</code></pre>\n<p>这样我们在任意的地方都可以直接使用<code>ENV</code> 这个值了。</p>\n<p>到这里就结束了，抛砖引玉说了一下大致的思路，没有展开谈具体细节，我把这个脚手架开源在<a href=\"https://github.com/cwj0130/webpack-cli\">github</a> 上，  <a href=\"https://github.com/cwj0130/webpack-cli/\">https://github.com/cwj0130/webpack-cli/</a> ，大家可以clone参看具体细节，我也在完善部分功能，例如单元测试等，如果此教程对您有帮助，麻烦在github上给个star，谢谢。</p>\n<p><strong> 此文为原创，可以任意转载，但请标明出处。</strong></p>\n<pre><code class=\"lang-javascript\">toggleLogin();\n/*keyboardLogin();*/\n\nfunction toggleLogin(){\n\n    var oSignIn = document.getElementById(&#39;signin&#39;);\n    var oSignUp = document.getElementById(&#39;signup&#39;);\n    var oA = document.getElementsByClassName(&#39;logjs&#39;);\n\n    for(var i=0; i&lt;oA.length; i++){\n        oA[i].index = i;\n        oA[i].onclick = function(){\n            if(this.index == 0 || this.index == 2){\n                oSignIn.style.display = &#39;block&#39;;\n                oSignUp.style.display = &#39;none&#39;;\n            }else{\n                oSignUp.style.display = &#39;block&#39;;\n                oSignIn.style.display = &#39;none&#39;;\n            }\n        }\n    }\n}\n</code></pre>\n<pre><code class=\"lang-css\">@keyframes bounce {\n  from, 20%, 53%, 80%, to {\n    animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);\n    transform: translate3d(0,0,0);\n  }\n\n  40%, 43% {\n    animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);\n    transform: translate3d(0, -30px, 0);\n  }\n\n  70% {\n    animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);\n    transform: translate3d(0, -15px, 0);\n  }\n\n  90% {\n    transform: translate3d(0,-4px,0);\n  }\n}\n\n.bounce {\n  animation-name: bounce;\n  transform-origin: center bottom;\n}\n#bounce &gt; li:after {\n  animation-name: bounce;\n  transform-origin: center bottom;\n}\na:nth-of-type(1){\n\n}\n</code></pre>\n";

/***/ }),
/* 9 */
/***/ (function(module, exports) {



/***/ }),
/* 10 */
/***/ (function(module, exports) {

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

/***/ })
/******/ ]);
//# sourceMappingURL=2017-08-14.js.map