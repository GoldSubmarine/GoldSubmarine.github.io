let moduleExport = [];
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

moduleExport.push(
    new HtmlWebpackPlugin({
        path: `${__dirname}/blog`,
        template: './index.html',
        filename: '[name].html'
    })
)

moduleExport.push(
    new ExtractTextPlugin('main.css')
)

module.exports = moduleExport;