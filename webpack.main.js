const path = require('path');

require('dotenv').config();
const Dotenv = require('dotenv-webpack');

module.exports = {
    target: 'electron-main',
    entry: { main: './main.js',
        preload: './app/preload/preload.js' },
    // devtool: 'source-map',
    output: {
        path: path.resolve('./build'),
        filename: '[name].js'
    },
    node: {
        __dirname: true
    },
    externals: [ {
        'jitsi-meet-electron-utils': 'require(\'jitsi-meet-electron-utils\')',
        'electron-debug': 'require(\'electron-debug\')',
        'electron-reload': 'require(\'electron-reload\')'
    } ],
    plugins: [
        new Dotenv(),
    ],
    resolve: {
        modules: [
            path.resolve('./node_modules')
        ]
    }
};

