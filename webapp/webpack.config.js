const path = require('path');
const webpack = require('webpack');
var HTMLWebpackPlugin = require('html-webpack-plugin');

var HTMLWebpackPluginConfig = new HTMLWebpackPlugin({
  template: __dirname + "/app/index.html",
  filename: 'index.html',
  inject: 'body'
})

var EnvPluginConfig = new webpack.EnvironmentPlugin(['API_HOST', 'API_PORT']);

module.exports = {
  entry: __dirname + '/app/index.js',
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: "style-loader"
          },
          {
            loader: "css-loader",
            options: {
              sourceMap: true,
              modules: true,
            }
          },
          {
            loader: "less-loader"
          }
        ]
      }
    ],
  },
  resolve: { extensions: ['*', '.js', '.jsx'] },
  output: {
    filename: "transformed.js",
    path: __dirname + "/build"
  },
  plugins: [
    HTMLWebpackPluginConfig,
    EnvPluginConfig
  ],
};