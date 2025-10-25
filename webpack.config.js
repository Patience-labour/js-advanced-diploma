const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = {
  entry: './src/index.js',
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
    
    // ESLintPlugin для ESLint 9
    new ESLintPlugin({
      extensions: ['js'], // Проверяем только .js файлы
      exclude: 'node_modules' // Исключаем node_modules
    })
  ],
  
  resolve: {
    extensions: ['.js']
  }
};