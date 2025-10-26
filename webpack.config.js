const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  devtool: "inline-source-map",
  mode: 'development',
  
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true,
    assetModuleFilename: 'images/[hash][ext][query]'
  },
  
  devServer: {
    static: './dist',
    hot: true,
    open: true,
    port: 3000
  },
  
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource'
      }
    ]
  },
  
  plugins: [
    new HtmlWebpackPlugin({
      title: 'My Webpack App',
      template: './src/index.html'
    }),
    
    new ESLintPlugin({
      extensions: ['js'],
      exclude: 'node_modules'
    })
  ],
  
  resolve: {
    extensions: ['.js']
  }
};