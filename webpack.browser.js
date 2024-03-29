const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const ELECTRON_VERSION = require('./package.json').devDependencies.electron;
const fs = require('fs');

require('dotenv').config();
const Dotenv = require('dotenv-webpack');

const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const smp = new SpeedMeasurePlugin();

module.exports = {
    // The renderer code runs in BrowserWindow without node support so we must
    // target a web platform.
    //target: 'electron-renderer', //I uncommented this out 
    // target: 'node',
    entry: { app: './app/index-browser.js' },

    // node: {
    //     fs: 'empty',
    // },
    // resolve: {
    //     fallback: {
    //         "fs": false
    //     },
    // },

    // devtool: 'source-map',
    // performance: {
    //     maxAssetSize: 1.5 * 1024 * 1024,
    //     maxEntrypointSize: 1.5 * 1024 * 1024
    // },
    // mode: 'development',
    devServer: {
        contentBase: path.resolve('./build-browser'),
        allowedHosts: ['local.cowbell.club'],
        https: {
            key: fs.readFileSync('./privkey.pem'),
            cert: fs.readFileSync('./fullchain.pem'),
            host: '0.0.0.0'
        },
        //open: { app: ['npm', 'run', 'electronappdelay'] },
        port: 3001,
        host: 'local.cowbell.club'
    },
    plugins: [
        new Dotenv(),
        new HtmlWebpackPlugin({
            template: './app/index.html'
        })
    ],
    output: {
        path: path.resolve('./build-browser'),
        filename: '[name].js'
    },
    node: {
        __dirname: true
    },
    module: {
        noParse: /external_api\\.js/,
        rules: [
            {
                exclude: [
                    new RegExp('node_modules/(?!@jitsi/js-utils)')
                ],
                loader: 'babel-loader',
                options: {
                    babelrc: false,
                    presets: [
                        [
                            require.resolve('@babel/preset-env'),
                            {
                                modules: false,
                                targets: {
                                    electron: ELECTRON_VERSION
                                }
                            }
                        ],
                        require.resolve('@babel/preset-flow'),
                        require.resolve('@babel/preset-react')
                    ],
                    plugins: [
                        require.resolve('@babel/plugin-transform-flow-strip-types'),
                        require.resolve('@babel/plugin-proposal-class-properties'),
                        require.resolve('@babel/plugin-proposal-optional-chaining'),
                        require.resolve('@babel/plugin-proposal-export-namespace-from')
                    ]
                },
                test: /\.js$/
            },
            {
                use: [
                    { loader: 'style-loader' },
                    { loader: 'css-loader' }
                ],
                test: /\.css$/
            },
            {
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'fonts/'
                        }
                    }
                ]
            },
            {
                use: 'file-loader',
                test: /\.png$/
            },
            {
                test: /\.svg$/,
                use: [{
                    loader: '@svgr/webpack',
                    options: {
                        dimensions: false,
                        expandProps: 'start'
                    }
                }]
            }
        ]
    },
    externals: [{
        'jitsi-meet-electron-utils': 'require(\'jitsi-meet-electron-utils\')'
    }],
    resolve: {
        modules: [
            path.resolve('./node_modules')
        ]
    }
}

