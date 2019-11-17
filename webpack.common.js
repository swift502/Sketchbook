const path = require('path');

module.exports = {
    entry: {
        app: './src/js/sketchbook/sketchbook.ts'
    },
    devServer: {
        progress: true,
        liveReload: false
      },
    output: {
        filename: 'build/sketchbook.min.js',
        library: 'Sketchbook',
        libraryTarget: 'umd',
    },
    resolve: {
        alias: {
          cannon: path.resolve(__dirname, './src/js/lib/cannon/cannon.min.js')
        },
        extensions: [ '.tsx', '.ts', '.js' ],
      },
    module: {
        rules: [
        {
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/,
        },
        {
            test: /\.css$/,
            use: [
              'style-loader',
              'css-loader',
            ],
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
            ],
          }
      ]
    },
    performance: {
        hints: false
    }
};