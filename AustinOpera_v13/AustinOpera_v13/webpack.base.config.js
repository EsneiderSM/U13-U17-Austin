'use strict';
const webpack = require('webpack');
const path = require('path');
const LiveReloadPlugin = require('webpack-livereload-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const autoprefixer = require('autoprefixer');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const WatchTimerPlugin = require('./Static/javascript/scripts/webpack-timer-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const baseCssConfig = (env, args) => {
    return {
        optimization: {
            splitChunks: {
                cacheGroups: {
                    styles: {
                        name: 'styles',
                        test: /\.css$/,
                        chunks: 'all',
                        enforce: true
                    }
                }
            }
        },
        module: {
            rules: [
                {
                    test: /\.(css|scss)$/,
                    use: [
                        { loader: MiniCssExtractPlugin.loader },
                        { loader: "css-loader" },
                        {
                            loader: "postcss-loader",
                            options: {
                                postcssOptions: {
                                    plugins: [autoprefixer()]
                                }
                            }
                        },
                        { loader: "sass-loader" }
                    ]
                },
                {
                    test: /\.(eot|woff|woff2|svg|ttf)([\?]?.*)$/,
                    use: ['file-loader']
                }
            ]
        },
        plugins: [
            new LiveReloadPlugin(),
            new WatchTimerPlugin(`CSS`),
        ],
        watchOptions: {
            ignored: /node_modules/
        },
        // Only create sourcemaps & cache in dev mode
        ...(args.mode == 'development' && { devtool: 'eval-cheap-module-source-map', cache: true })
    }
};

const baseJsConfig = (env, args) => {
    return {
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    loader: 'ts-loader',
                    exclude: /node_modules/
                }
            ]
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
            symlinks: false
        },
        plugins: [
            new webpack.ProvidePlugin({
                Promise: 'es6-promise'
            }),
            new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /en/),
            new WatchTimerPlugin(`JS`),
            new ForkTsCheckerWebpackPlugin()
        ],
        watchOptions: {
            ignored: /node_modules/
        },
        // Only create sourcemaps & cache in dev mode
        ...(args.mode == 'development' && { devtool: 'eval-cheap-module-source-map', cache: true })
    }
};

module.exports = [baseCssConfig, baseJsConfig];