const path = require('path');

module.exports = {
    mode: "development",
    entry: './src/js/sketchbook.js',
    output: {
        filename: 'sketchbook.min.js',
        path: path.resolve(__dirname, 'docs/js'),
        library: 'Sketchbook',
        libraryTarget: 'umd'
    },
    // resolve: {
    //     alias: {
    //       'three': path.resolve(__dirname, 'src/js/lib/core/three.js'),
    //       'cannon': path.resolve(__dirname, 'src/js/lib/core/cannon.js')
    //     }
    //   }
    externals: {
        three: 'THREE',
        cannon: 'CANNON'
    }
};