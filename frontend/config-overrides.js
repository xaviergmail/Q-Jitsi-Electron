const { InjectManifest } = require('workbox-webpack-plugin')
const path = require('path')

module.exports = {
  webpack: function (config, env) {
    config.plugins.push(
      new InjectManifest({
        swSrc: path.join('src', 'notificationWorker.js'),
        swDest: 'notificationWorker.js',
      })
    )

    return config
  },

}
