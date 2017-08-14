const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
  template: './src/index.html',
  filename: 'index.html',
  inject: 'body'
})

module.exports = {
	entry: './src/index.jsx',
	output: {
		filename: "index.js",
		path: path.resolve(__dirname, 'build/'),
    publicPath: "/build"
	},
  	resolve: {
    	extensions: ['*', '.js', '.jsx', '.json']
  	},
  	module: {
    	loaders: [{
      	test: /\.jsx?$/,
      	exclude: /node_modules/,
      	loader: ['babel-loader']
    	}]
  },
  plugins: [HtmlWebpackPluginConfig],
  devServer: {
    contentBase: "./build",
    hot: true
  }
};