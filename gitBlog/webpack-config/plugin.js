const path = require('path');
const route = require('./route');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
let moduleExport = [];

moduleExport.push(
    new HtmlWebpackPlugin({
        path: route.blog,
        template: './index.html',
        filename: 'index.html'
    })
)

moduleExport.push(
    new ExtractTextPlugin('css/main.css')
)

module.exports = moduleExport;