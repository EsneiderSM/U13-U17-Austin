const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const [baseCssConfig, baseJsConfig] = require('./webpack.base.config.js');
const { merge } = require('webpack-merge');
const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');

const smp = new SpeedMeasurePlugin();

const finalConfig = (env, args) => {
    return [
        merge(baseCssConfig(env, args), {
            entry: {
                'main': './Static/sass/entries/main.scss',
                'tnew':'./Static/sass/tnew/tnew.scss'
            },
            output: {
                path: path.resolve(__dirname, './wwwroot/Static/dist')
            },
            plugins: [
                new MiniCssExtractPlugin({
                    filename: "[name].css"
                }),
            ]
        }),
        merge(baseJsConfig(env, args), {
            entry: {
                'global': './Static/javascript/global/index.ts',
            },
            output: {
                filename: '[name].js',
                path: path.resolve(__dirname, './wwwroot/Static/dist'),
            },
            plugins: [
                // Uncomment the following line to see relative file sizes
                //new BundleAnalyzerPlugin()
            ]
        })
    ];
}

module.exports = finalConfig;

// Use this line instead of the line above to debug build performance
//module.exports = smp.wrap(finalConfig);