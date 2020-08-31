const TerserJSPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
	mode: 'production',
	optimization: {
		minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
	},
    plugins: [
        new webpack.BannerPlugin({
          banner:
          `Sketchbook 0.4 (https://github.com/swift502/Sketchbook)\nBuilt on three.js (https://github.com/mrdoob/three.js) and cannon.js (https://github.com/schteppe/cannon.js)`,
        }),
      ]
});