require.context("./", false, /\.md$/); //引入以md结尾的文件

let index = require('../component/index.html');
require('../css/main.scss');
require('../js/main.js');

let app = document.getElementById('app');
app.innerHTML = index;