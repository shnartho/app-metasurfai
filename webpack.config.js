const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const isDevelopment = process.env.NODE_ENV === 'development';

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index_bundle.js',
    },
    devServer: {
        port: 9000,
        static: {
            directory: path.resolve(__dirname, 'dist'),
        },
        historyApiFallback: true,
        hot: true,
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
                test: /\.svg$/,
                use: ['@svgr/webpack'],
            },
            {
                test: /\.(png|jpg|gif)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'images/[name][ext][query]',
                },
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'fonts/[name][ext][query]',
                },
            },
            {
                test: /\.css$/,
                use: [
                    isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
                    'css-loader',
                    'postcss-loader',
                ],
            },
            {
                test: /\.(mp4|webm|ogg)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'videos/[name][ext][query]',
                },
            },
        ],
    },
    plugins: [
        ...(isDevelopment ? [] : [new MiniCssExtractPlugin({
            filename: 'styles.css',
        })]),
        new HtmlWebpackPlugin({
            template: './src/index.html',
            filename: 'index.html',
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: 'public', to: '' }, // Copy all files from public to dist/public
            ],
        }),
    ],
    performance: {
        maxAssetSize: 1024 * 1024, // Increase asset size limit to 1 MiB
    },
};