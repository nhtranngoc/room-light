const path = require("path");
const webpack = require("webpack");
// const HtmlWebpackPlugin = require('html-webpack-plugin');

// const HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
//   template: './index.html',
//   filename: 'index.html',
//   inject: 'body'
// });

const HotModuleReplacementPluginConfig = new webpack.HotModuleReplacementPlugin();

module.exports = {
	entry:[
		"react-hot-loader/patch",
    	"webpack-hot-middleware/client?http://localhost:3000&reload=true",
    	"./public/index.jsx"	
	],
	output: {
		path:path.join(__dirname,"public"),
		filename:"bundle.js",
		publicPath:"/dist/"
	},
	resolve: {
		extensions: ['*', '.js', '.jsx', '.json', '.css']
	},
	module: {
		loaders:[
		{
			test: /\.(js|jsx)$/,
			exclude: /node_modules/,
			loader: "babel-loader",
			query: {
				presets:["env","react"]
			}
		},
		{
			test: /\.html$/,
			loader:"html-loader"
		},
		{
			test: /\.css$/,
			loader: ["style-loader", "css-loader"]
		}]
	},
	plugins: [
		// HtmlWebpackPluginConfig, 
		HotModuleReplacementPluginConfig],
	devServer: {
		contentBase: "/dist/",
		hot: true
	}
}