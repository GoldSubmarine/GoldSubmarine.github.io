const path = require('path')

module.exports = {
    open: true,
    contentBase: path.join(__dirname, "blog"),
    compress: true,
    inline: true,
    port: 9000,
    watchOptions: {
        ignored: /node_modules/
    }
}