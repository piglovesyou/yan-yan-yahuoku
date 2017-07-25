const {isProduction} = require('../src/server/env');
const webpack = require('webpack');
const Path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const cssLoaderConfig = require('./_css-loader').default;

// TODO: enable "isProduction" in production

module.exports = {
  entry: './src/client/main',
  output: {
    path: Path.resolve('./public'),
    filename: 'javascripts/main.js'
  },
  devtool: isProduction ? 'nosources-source-map' : 'source-map',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        use: [
          // isProduction && {loader: 'webpack-unassert-loader'},
          {
            loader: 'babel-loader',
            query: {
              'presets': [
                'react',
              ].concat(isProduction ? [
                'es2015',
                'es2016',
                'es2017',
              ] : []),
              'plugins': [
                'transform-es2015-classes',
              ].concat(isProduction ? [
                'transform-runtime'
              ] : []),
              'babelrc': false
            },
          },
        ].filter(e => !!e),
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract([
          cssLoaderConfig,
          {
            loader: 'sass-loader',
            options: {
              outputStyle: 'compressed',
            }
          },
        ]),
      },
    ]
  },
  plugins: [
    // Shit plugin that doesn't parse es2015
    isProduction && new webpack.optimize.UglifyJsPlugin(),

    // Shit plugin that doesn't support "test" option
    // isProduction && new UglifyEsPlugin({ test: /\.js$/ }),

    new ExtractTextPlugin('stylesheets/main.css'),
  ].filter(e => !!e),
};
