const HtmlWebpackPlugin = require('html-webpack-plugin');
const marked = require("marked");
const renderer = new marked.Renderer();
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const route = require('./webpack-config/route');

module.exports = {
    entry: require('./webpack-config/entry.js'),
    output: require('./webpack-config/output.js'),
    module: require('./webpack-config/module.js'),
    plugins: require('./webpack-config/plugin.js'),
    devServer: require('./webpack-config/devServer.js')
}