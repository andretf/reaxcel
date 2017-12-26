const path = require("path");

module.exports = {
    entry: './app/js/main.js',
    output: {
        path: path.resolve(__dirname, '/public'),
        filename: 'bundle.js'
    },
    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
            query: {
                presets: ['es2015', 'react']
            },
        }]
    },
    devServer: {
        inline: true,
        contentBase: './public',
        port: 3333
    }
};