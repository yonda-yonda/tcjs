const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');
const package = require('./package.json'); 

module.exports = {
    mode: "production",
    entry: path.resolve(__dirname, "src/index.ts"),
    output: {
        library: "tcjs",
        path: path.resolve(__dirname, "./"),
        filename: "tcjs.min.js",
        libraryTarget: "umd"
    },
    plugins: [
        new webpack.BannerPlugin({
            banner: `${package.name} v${package.version} | ${package.author} | license: ${package.license}`
        })
    ],
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader"
            }
        ]
    },
    resolve: {
        extensions: [".ts", ".js"]
    },
    optimization: {
        minimizer: [new TerserPlugin({
            extractComments: false,
            terserOptions: {
                output: {
                    comments: /\**!|@preserve|@license|@cc_on/
                }
            },
        })],
    }
}