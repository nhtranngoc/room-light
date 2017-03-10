const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
  template: './src/index.html',
  filename: 'index.html',
  inject: 'body'
})

module.exports = {
	entry: './src/index.jsx',
	output: {
		filename: "index.js",
		path: __dirname + "/build",
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
  plugins: [HtmlWebpackPluginConfig]
};