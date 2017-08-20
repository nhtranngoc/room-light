const path = require("path");

const express = require("express");
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const mqtt = require('mqtt');
const tinyColor = require('tinycolor2');
const client  = mqtt.connect('mqtt://192.168.1.10:1883');

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

io.on('connection', (socket) => {
	console.log("Socket opened..");

	socket.on('hsl', (hslObject) => {
		let color = tinyColor(hslObject).toRgb();
		client.publish("/esp/strip", new Buffer.from([color.r,color.g,color.b]));
	})

});

server.listen(80,function(req,res) {
	console.log("App is now live.");
});