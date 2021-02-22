const path = require('path');

require('dotenv').config();

console.log(process.env, 'show me the $s')
module.exports = {
    target: 'electron-main',
    entry: { main: './main.js',
        preload: './app/preload/preload.js' },
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
    resolve: {
        modules: [
            path.resolve('./node_modules')
        ]
    }
};

