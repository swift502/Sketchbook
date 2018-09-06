const path = require('path');

module.exports = {
    mode: "development",
    // entry: './src/main.js',
    entry: './src/js/simulator_test.js',
    output: {
        filename: 'sketchbook.min.js',
        path: path.resolve(__dirname, 'docs/js')
    }
};