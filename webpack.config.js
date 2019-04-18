const path = require('path');

module.exports = {
    entry: [
        '@babel/polyfill',
        './src/index.js',
    ],
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: 'umd',
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.js$/,
                include: path.resolve(__dirname, 'src'),
                use: 'babel-loader',
            },
        ],
    },
};
