const path = require('path')

// https://kitware.github.io/vtk-js/docs/intro_vtk_as_es6_dependency.html#Webpack-config
const vtkRules = require('vtk.js/Utilities/config/dependency.js').webpack.core
  .rules
// Optional if you want to load *.css and *.module.css files
const cssRules = require('vtk.js/Utilities/config/dependency.js').webpack.css
  .rules
const HtmlWebPackPlugin = require("html-webpack-plugin");

const entry = path.join(__dirname, './src/index.js')
const sourcePath = path.join(__dirname, './src')
const outputPath = path.resolve(__dirname, 'public')

module.exports = {
  entry,
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
            loader: "html-loader"
          }
        ]
      }
    ].concat(vtkRules),
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: "./src/index.html",
      filename: "./index.html"
    })
  ],
  // Fix: https://github.com/webpack-contrib/css-loader/issues/447#issuecomment-285598881
  // For issue in cornerstone-wado-image-loader
  node: {
    fs: 'empty',
  },
  devServer: {
    contentBase: path.join(__dirname, 'public'),
    compress: false,
    hot: true,
    open: true,
    port: 8091
  }
}
