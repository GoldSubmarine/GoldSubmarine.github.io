const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    rules: [
        {
            test: /\.md$/,
            use: ['html-loader', 'markdown-loader']
        },
        {
            test: /\.scss$/,
            use:  ExtractTextPlugin.extract({
                fallback: 'style-loader',
                use: ['css-loader', {
                    loader: 'postcss-loader',
                    options: {
                        sourceMap: true,
                        plugins: (loader) => [
                            require('autoprefixer')(),
                        ]
                    }
                }, 'resolve-url-loader','sass-loader?sourceMap'],
                publicPath: '../'
            })
        },
        {
            test: /\.html$/,
            use: ['html-loader']
        },
        {
            test: /\.(png|jpg|gif)$/,
            use: [
                {
                    loader: 'url-loader',
                    options: {
                        limit: 8192,
                        name: 'img/[name].[hash:10].[ext]'
                    }
                },
                {
                    loader: 'image-webpack-loader'
                }
            ]
        }
    ]
}