const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: './index.web.js',
    output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    },
    resolve: {
        alias: {
        'react-native$': 'react-native-web',
        },
        extensions: ['.web.js', '.js'],
    },
    module: {
        rules: [
        {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: {
            loader: 'babel-loader',
            options: {
                presets: ['@babel/preset-env', '@babel/preset-react'],
            },
            },
        },
        {
            test: /\.(png|jpg|gif|svg)$/,
            use: {
            loader: 'file-loader',
            options: {
                name: '[name].[ext]',
                outputPath: 'images/',
            },
            },
        },
        ],
    },
    devServer: {
        contentBase: path.join(__dirname, 'public'),
        compress: true,
        port: 9000,
    },
};
