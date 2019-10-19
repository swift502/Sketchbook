const path = require('path');

module.exports = {
    entry: {
        app: './src/js/sketchbook/sketchbook.js'
    },
    // externals: {
    //     three: 'THREE',
    //     cannon: 'CANNON'
    // },
    output: {
        filename: 'sketchbook.min.js',
        path: path.resolve(__dirname, 'build'),
        library: 'Sketchbook',
        libraryTarget: 'umd'
    },
    resolve: {
        alias: {
          cannon: path.resolve(__dirname, './src/js/lib/cannon/cannon.min.js')
        }
      },
    module: {
        rules: [
        {
            test: /\.css$/,
            use: [
              'style-loader',
              'css-loader'
            ]
        },
        {
            test: /\.(fbx|png)$/,
            use: [
                {
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]',
                    outputPath: 'assets/',
                    publicPath: '/build/'
                }
                }
            ]
          }
      ]
    }
};