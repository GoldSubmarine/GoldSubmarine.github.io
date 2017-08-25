const path = require('path');
const route = require('./route');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
let moduleExport = [];

moduleExport.push(
    new HtmlWebpackPlugin({
        template: './src/component/index.html'
    })
)

moduleExport.push(
    new ExtractTextPlugin({
        filename: 'css/main.css'
    })
)

module.exports = moduleExport;