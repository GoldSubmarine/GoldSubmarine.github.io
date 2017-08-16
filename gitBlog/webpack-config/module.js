const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    rules: [
        {
            test: /\.md$/,
            use: ['html-loader', 'markdown-loader']
        },
        {
            test: /\.scss$/,
            use: ExtractTextPlugin.extract({
                fallback: 'style-loader',
                use: ['css-loader', {
                    loader: 'postcss-loader',
                    options: {
                        plugins: (loader) => [
                            require('autoprefixer')(),
                        ]
                    }
                }, 'sass-loader']
            })
        },
        {
            test: /\.html$/,
            use: ['html-loader']
        },
        {
            test: /\.(png|jpg|gif)$/,
            use: ['url-loader','image-webpack-loader']
        }
    ]
}