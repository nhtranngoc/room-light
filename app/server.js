const path = require("path");

const express = require("express");
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const mqtt = require('mqtt');
const tinyColor = require('tinycolor2');
const client  = mqtt.connect('mqtt://192.168.1.8:1883');

const webpack = require("webpack");
const webpackDevMiddleware = require("webpack-dev-middleware");
const webpackHotMiddleware = require("webpack-hot-middleware");
const webpackConfig = require("./webpack.config.js");

const compiler = webpack(webpackConfig);
const duration = 10000, fps = 60;
const amount = parseInt(fps*duration/1000);
let curColor;

app.use(webpackDevMiddleware(compiler, {
	publicPath: webpackConfig.output.publicPath,
	stats: true
}));

app.use(webpackHotMiddleware(compiler));

app.get("/", (req, res) => {
	res.sendFile(path.resolve(compiler.outputPath, "index.html"));
});

app.get("/sleepytime", (req, res) => {
	console.log(curColor);

	if (curColor) {
		let dimArray = dim(curColor, tinyColor({h: 188, s: 1, v: .1}));

		let counter = 0;
		let interval = setInterval(() => {
			if (counter < amount){
				client.publish("/esp/strip", tinyColor(dimArray[counter].toString(16)).toBuffer());
				counter++;
			} else {
				clearInterval(interval);
			}
		}, 1000/60);

		res.sendStatus(200);
	} else {
		res.sendStatus(204);
	}

});

io.on('connection', (socket) => {
	console.log("Socket opened..");

	socket.on('hsl', (hslObject) => {
		curColor = tinyColor(hslObject);
		console.log(curColor.toHsv());
		client.publish("/esp/strip", curColor.toBuffer());
	})

});

server.listen(80,function(req,res) {
	console.log("App is now live.");
});

tinyColor.prototype.toBuffer = function() {
	return new Buffer.from([this._r, this._g, this._b]);
}

// Basically a gradient function
// Also color manipulating is a b*
function dim(colorA, colorB) {
	let colorArray  = [];

	let aHSV= colorA.toHsv(),
		bHSV = colorB.toHsv();

	let diff = [Math.abs(aHSV.h - bHSV.h), Math.abs(aHSV.s - bHSV.s), Math.abs(aHSV.v - bHSV.v)];
	let increment = [diff[0]/amount, diff[1]/amount, diff[2]/amount];

	for(let i=1;i<=amount;i++) {
		let newColor = {h:0, s:0, l:0};

		if (aHSV.h > bHSV.h) {
			newColor.h = aHSV.h - i*increment[0];
		} else if (aHSV.h < bHSV.h) {
			newColor.h = aHSV.h + i*increment[0];
		} else {
			newColor.h = aHSV.h;
		}

		if (aHSV.s > bHSV.s) {
			newColor.s = aHSV.s - i*increment[1];
		} else if (aHSV.s < bHSV.s) {
			newColor.s = aHSV.s + i*increment[1];
		} else {
			newColor.s = aHSV.s;
		}

		if (aHSV.v > bHSV.v) {
			newColor.l = aHSV.v - i*increment[2];
		} else if (aHSV.v < bHSV.v) {
			newColor.l = aHSV.v + i*increment[2];
		} else {
			newColor.l = aHSV.v;
		}

		colorArray.push(tinyColor(newColor))
	}


	return colorArray;
}