const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    plugins: [
        new webpack.BannerPlugin({
          banner:
          `Sketchbook 0.1 (https://github.com/swift502/Sketchbook)\nBuilt on three.js (https://github.com/mrdoob/three.js) and cannon.js (https://github.com/schteppe/cannon.js)`,
        }),
      ],
    mode: 'production'
});