const express = require("express");
const app = express();
const path = require("path");
const webpack = require("webpack");
const webpackDevMiddleware = require("webpack-dev-middleware");
const webpackHotMiddleware = require("webpack-hot-middleware");
const webpackConfig = require("./webpack.config.js");

const compiler = webpack(webpackConfig);

app.use(webpackDevMiddleware(compiler, {
	publicPath: webpackConfig.output.publicPath,
	stats: true
}));

app.use(webpackHotMiddleware(compiler));

app.get("/", (req, res) => {
	res.sendFile(path.resolve(compiler.outputPath, "index.html"));
});

app.listen(3000,function(req,res) {
	console.log("App is now live.");
});