const path = require('path');

// https://kitware.github.io/vtk-js/docs/intro_vtk_as_es6_dependency.html#Webpack-config
const vtkRules = require('vtk.js/Utilities/config/dependency.js').webpack.core.rules;
// Optional if you want to load *.css and *.module.css files
const cssRules = require('vtk.js/Utilities/config/dependency.js').webpack.css.rules;
const HtmlWebPackPlugin = require('html-webpack-plugin');

const webpack = require('webpack');

const entry = path.join(__dirname, './src/index.tsx');

module.exports = (env, argv) => {
  const config = {
    entry,
    devtool: false,
    cache: false,
    mode: 'development',
    module: {
      rules: [
        {
          test: /\.(ts|js)x?$/i,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
            },
          },
        },
        {
          test: /\.html$/,
          use: [
            {
              loader: 'html-loader',
            },
          ],
        },
        {
          test: /\.css$/,
          use: [
            // Creates `style` nodes from JS strings
            'style-loader',
            // Translates CSS into CommonJS
            'css-loader',
          ],
        },
      ].concat(vtkRules),
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      fallback: {
        fs: false,
        path: false,
        node: false,
      },
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].[contenthash:8].js',
      publicPath: '/',
    },
    plugins: [
      new HtmlWebPackPlugin({
        template: './src/index.html',
        // filename: './src/index.html'
      }),
      new webpack.ProvidePlugin({
        process: 'process/browser',
      }),
    ],
    optimization: {},
    devServer: {
      compress: false,
      historyApiFallback: {
        disableDotRule: true,
      },
      hot: false,
      open: true,
      port: 8091,
    },
  };
  return config;
};
