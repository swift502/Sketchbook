const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');

module.exports = {
	plugins: [new MiniCssExtractPlugin({
		filename: './build/style.min.css',
	})],
    entry: {
		app: './src/ts/sketchbook.ts'
    },
    output: {
        filename: './build/sketchbook.min.js',
        library: 'Sketchbook',
        libraryTarget: 'umd',
        path: path.resolve(__dirname)
    },
    resolve: {
        alias: {
          cannon: path.resolve(__dirname, './src/lib/cannon/cannon.js')
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
			test: /\.css$/i,
			use: [MiniCssExtractPlugin.loader, 'css-loader'],
		},
      ]
    },
    performance: {
        hints: false
    }
};