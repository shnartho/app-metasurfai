const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const isDevelopment = process.env.NODE_ENV === 'development';
const Dotenv = require('dotenv-webpack');
const webpack = require('webpack');

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index_bundle.js',
    },
    devServer: {
        port: 3000,
        static: {
            directory: path.resolve(__dirname, 'dist'),
        },
        historyApiFallback: true,
        hot: true,
        setupMiddlewares: (middlewares, devServer) => {
            // Load environment variables first
            const path = require('path');
            require('dotenv').config({ path: path.resolve(__dirname, '.env') });
            
            console.log(`[WEBPACK] NODE_ENV: ${process.env.NODE_ENV}, DEV_MODE: ${process.env.DEV_MODE}`);
            
            // Only set up proxy middleware in development mode
            // Check for development mode using custom DEV_MODE or NODE_ENV
            if (process.env.NODE_ENV === 'development' || process.env.DEV_MODE === 'true') {
                const express = require('express');
                
                console.log('[WEBPACK] Setting up development proxy middleware');
                
                // Add body parsing middleware for JSON
                devServer.app.use('/api', express.json());
                
                // Add API proxy middleware
                devServer.app.use('/api/proxy', async (req, res) => {
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
                    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');

                    if (req.method === 'OPTIONS') {
                        res.status(200).end();
                        return;
                    }

                    try {
                        // Hybrid mode: load both API maps (auth uses new, rest use old)
                        const useNewAPI = process.env.USE_NEW_API === 'true';
                        
                        // Always load both API maps for hybrid approach
                        const apiMapOld = require('./api/apiMapOld');
                        const apiMapNew = require('./api/apiMapNew');
                        
                        if (!req.body || typeof req.body !== 'object') {
                            res.status(400).json({ error: 'Missing or invalid JSON body' });
                            return;
                        }
                        
                        const { action, token, __base, ...body } = req.body;
                        console.log(`[PROXY] Processing action: ${action}, base: ${__base || (useNewAPI ? 'new' : 'old')}, useNewAPI: ${useNewAPI}`);
                        console.log(`[PROXY] Available actions in old map:`, Object.keys(apiMapOld));
                        console.log(`[PROXY] Available actions in new map:`, Object.keys(apiMapNew));
                        
                        // Use __base from frontend if provided, else fallback to global flag
                        const base = __base || (useNewAPI ? 'new' : 'old');
                        console.log(`[PROXY] Using base: ${base}`);
                        const mapping = base === 'new' ? apiMapNew[action] : apiMapOld[action];
                        
                        if (!mapping) {
                            console.error(`[PROXY] Unknown action: ${action}`);
                            res.status(404).json({ error: `Unknown action: ${action}` });
                            return;
                        }
                        
                        const baseUrl = base === 'new' ? process.env.API_NEW_URL : process.env.API_OLD_URL;
                        console.log(`[PROXY] Using baseUrl: ${baseUrl}, endpoint: ${mapping.endpoint}`);
                        
                        if (!baseUrl) {
                            console.error(`[PROXY] Missing base URL for ${base} API`);
                            res.status(500).json({ error: `Missing API URL configuration for ${base} API` });
                            return;
                        }
                        
                        const targetUrl = `${baseUrl}${mapping.endpoint}`;
                        const method = mapping.method;
                        const headers = mapping.headers(body, token);
                        const config = { method, headers };
                        const transformedBody = mapping.transform(body);
                        
                        if (method !== 'GET' && Object.keys(transformedBody).length > 0) {
                            config.body = JSON.stringify(transformedBody);
                        }
                        
                        console.log(`[PROXY] Making ${method} request to: ${targetUrl}`);
                        
                        const response = await fetch(targetUrl, config);
                        console.log(`[PROXY] Response status: ${response.status}, statusText: ${response.statusText}`);
                        const respContentType = response.headers.get('content-type');
                        let data;
                        
                        if (respContentType && respContentType.includes('application/json')) {
                            data = await response.json();
                        } else {
                            data = await response.text();
                        }
                        
                        console.log(`[PROXY] Response data:`, data);
                        res.status(response.status).json(data);
                    } catch (error) {
                        console.error('Proxy handler error:', error);
                        res.status(500).json({ error: 'Proxy handler failed', details: String(error) });
                    }
                });
            } else {
                console.log('[WEBPACK] Skipping proxy middleware (not in development mode)');
            }
            return middlewares;
        },
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
        new Dotenv(),
    ],
    performance: {
        maxAssetSize: 1024 * 1024, // Increase asset size limit to 1 MiB
    },
};