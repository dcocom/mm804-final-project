var path = require('path');
var webpack = require('webpack');
var vtkRules = require('vtk.js/Utilities/config/dependency.js').webpack.v2.rules;

const entry = path.join(__dirname, './src/index.js');
const sourcePath = path.join(__dirname, './src');
const outputPath = path.join(__dirname, './dist');

module.exports = {
    entry: {
        'main': path.join(__dirname, './src/index.js'),
        'volumeViewer': path.join(__dirname, './src/volumeViewer.js')
    },
    output: {
        filename: '[name].js',
        path: outputPath,
    },
    module: {
        rules: [
            {test: entry, loader: "expose-loader?MyWebApp"},
            {test: /\.html$/, loader: 'html-loader'},
        ].concat(vtkRules),
    },
    resolve: {
        modules: [
            path.resolve(__dirname, 'node_modules'),
            sourcePath,
        ],
    },
};