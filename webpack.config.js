const path = require('path')

// https://kitware.github.io/vtk-js/docs/intro_vtk_as_es6_dependency.html#Webpack-config
const vtkRules = require('vtk.js/Utilities/config/dependency.js').webpack.core
  .rules
// Optional if you want to load *.css and *.module.css files
const cssRules = require('vtk.js/Utilities/config/dependency.js').webpack.css
  .rules
const HtmlWebPackPlugin = require('html-webpack-plugin');

const webpack = require('webpack');

const entry = path.join(__dirname, './src/index.js')

module.exports = (env, argv) => {
  
  const config = {
  entry,
  devtool: false,
  mode: 'development',
  module: {

    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
        }
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader'
          }
        ]
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          'style-loader',
          // Translates CSS into CommonJS
          'css-loader',
          // Compiles Sass to CSS
          'sass-loader',
        ],
      }
    ].concat(vtkRules),
    
  },
  resolve: {
    fallback: {
      fs: false,
      path: false,
      node: false
    }
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash:8].js',
    publicPath: '/'
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
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
        chunks: 'all',
        maxInitialRequests: Infinity,
        minSize: 0,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              // get the name. E.g. node_modules/packageName/not/this/part.js
              // or node_modules/packageName
              const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
  
              // npm package names are URL-safe, but some servers don't like @ symbols
              return `npm.${packageName.replace('@', '')}`;
            },
          },
        },
      },
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: false,
    historyApiFallback: {
        disableDotRule: true
    },
    hot: false,
    open: true,
    port: 8091
    
  }
    }
  return config
}
