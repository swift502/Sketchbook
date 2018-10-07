const path = require('path');

module.exports = {
    entry: {
        app: './src/js/sketchbook.js'
    },
    resolve: {
        alias: {
            'three': path.resolve(__dirname, 'src/js/lib/core/three.js'),
            'cannon': path.resolve(__dirname, 'src/js/lib/core/cannon.js'),
            'lodash': path.resolve(__dirname, 'src/js/lib/utils/lodash')
        }
    },
    output: {
        filename: 'sketchbook.min.js',
        path: path.resolve(__dirname, 'docs/js'),
        library: 'Sketchbook',
        libraryTarget: 'umd'
    }
};