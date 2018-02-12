const path                 = require("path");
const express              = require("express");
const app                  = express();
const bodyParser           = require("body-parser");
const server               = require("http").createServer(app);
const io                   = require("socket.io")(server);

const mqtt                 = require("mqtt");
const tinyColor            = require("tinycolor2");
const client               = mqtt.connect("mqtt://192.168.1.8:1883");

const webpack              = require("webpack");
const webpackDevMiddleware = require("webpack-dev-middleware");
const webpackHotMiddleware = require("webpack-hot-middleware");
const webpackConfig        = require("./webpack.config.js");

const compiler             = webpack(webpackConfig);
const duration             = 5000;
const fps                  = 175;
const amount               = parseInt(fps * duration / 1000);
let breathingFlag          = false;

let curColor;

app.use(webpackDevMiddleware(compiler, {
	publicPath: webpackConfig.output.publicPath,
	stats: true
}));

app.use(webpackHotMiddleware(compiler));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
	res.sendFile(path.resolve(compiler.outputPath, "index.html"));
});

app.get("/sleepytime", (req, res) => {
	breathingFlag = false
	let targetColor = tinyColor({h: 188, s: 1, l: 0.01});
	if (curColor) {
		colorTransition(curColor, targetColor);
		curColor = targetColor;
		res.sendStatus(200);
	} else {
		res.sendStatus(204);
	}
});

app.get("/test", (req, res) => {
	if (curColor && breathingFlag === false) {
		breathing(Math.PI / 2000, 0.55, 0.05);
		res.sendStatus(200);
	} else {
	res.sendStatus(204);
	}
});

app.get("/test2", (req, res) => {
	breathingFlag = false;
	client.publish("/esp/pixels", Buffer.from(Array(450).fill(127)));
	res.sendStatus(200);
});

app.get("/wakeytime", (req, res) => {
	breathingFlag = false;
	let targetColor = tinyColor({h: curColor.toHsl().h, s: 1, l: 1});
	if (curColor) {
		colorTransition(curColor, targetColor);
		curColor = targetColor;
		res.sendStatus(200);
	} else {
		res.sendStatus(204);
	}
});

app.get("/kat", (req, res) => {
	if (curColor && breathingFlag === false) {
		let katColor = tinyColor({h:0,s:.66,l:.34});
		colorTransition(curColor, katColor);
		setTimeout(() => {breathing(Math.PI/2000, 0.25, 0.15)},duration*2);
		curColor = katColor;
		res.sendStatus(200);
	} else {
		res.sendStatus(204);
	}
});

app.post("/flux", (req, res) => {
	let fluxRGB = tinyColor(colorTemperatureToRGB(req.query.ct));
	client.publish("/esp/colorTemp", Buffer.from([fluxRGB._r, fluxRGB._g, fluxRGB._b]));

	res.sendStatus(200);
});

io.on("connection", (socket) => {
	console.log("Socket opened.");

	socket.on("hsl", (hslObject) => {
		curColor = tinyColor(hslObject);
		console.log("curColor set!");
		client.publish("/esp/strip", curColor.toBuffer());
	});
});

server.listen(3000, function (req, res) {
	console.log("App is now live.");
});

tinyColor.prototype.toBuffer = function () {
	return Buffer.from([this._r, this._g, this._b]);
}

tinyColor.prototype.toArray = function () {
	return [this._r, this._g, this._b];
}

// Shamelessly stol- I mean courtesy of
// http://sean.voisen.org/blog/2011/10/breathing-led-with-arduino/
function breathing (timeMultiplier, range, offset) {
  timeMultiplier = timeMultiplier || 1
  range = range || 1
  offset = offset || 0
  breathingFlag = true
  let startTime = new Date()
  let interval = setInterval(() => {
    if (breathingFlag) {
      let curTime = new Date()
      let timeDiff = curTime - startTime
      let newColor = {
        h: curColor.toHsl().h,
        s: curColor.toHsl().s,
        l: Math.exp(Math.sin(timeDiff * timeMultiplier) - 0.367879) * 0.425459 * range + offset}

      client.publish("/esp/strip", tinyColor(newColor).toBuffer())
    } else {
      clearInterval(interval)
    }
  }, 1000 / fps)
}

// Basically a gradient function, returns an array of intermediate color
// Also color manipulating is a b*
function dim (colorA, colorB) {
  let colorArray = []

  let aHSL = colorA.toHsl()
  let bHSL = colorB.toHsl()

  let diff = [Math.abs(aHSL.h - bHSL.h), Math.abs(aHSL.s - bHSL.s), Math.abs(aHSL.l - bHSL.l)]
  let increment = [diff[0] / amount, diff[1] / amount, diff[2] / amount]

  for (let i = 1; i <= amount; i++) {
    let newColor = {h: 0, s: 0, l: 0}

    if (aHSL.h > bHSL.h) {
      newColor.h = aHSL.h - i * increment[0]
    } else if (aHSL.h < bHSL.h) {
      newColor.h = aHSL.h + i * increment[0]
    } else {
      newColor.h = aHSL.h
    }

    if (aHSL.s > bHSL.s) {
      newColor.s = aHSL.s - i * increment[1]
    } else if (aHSL.s < bHSL.s) {
      newColor.s = aHSL.s + i * increment[1]
    } else {
      newColor.s = aHSL.s
    }

    if (aHSL.l > bHSL.l) {
      newColor.l = aHSL.l - i * increment[2]
    } else if (aHSL.l < bHSL.l) {
      newColor.l = aHSL.l + i * increment[2]
    } else {
      newColor.l = aHSL.l
    }

    colorArray.push(tinyColor(newColor))
  }
  return colorArray
}

function colorTransition (colorA, colorB) {
  let dimArray = dim(colorA, colorB)
  let counter = 0
  let interval = setInterval(() => {
    if (counter < amount) {
      client.publish("/esp/strip", tinyColor(dimArray[counter].toString(16)).toBuffer())
      counter++
    } else {
      clearInterval(interval)
    }
  }, 1000 / fps)
}

// Use CRGB to set color temperature cause somehow I'm bad at reading documentation for FastLED
function colorTemperatureToRGB(kelvin){
    let temp = kelvin / 100;
    let red, green, blue;

    if( temp <= 66 ){ 
        red = 255;         
        green = temp;
        green = 99.4708025861 * Math.log(green) - 161.1195681661;

        if( temp <= 19){
            blue = 0;
        } else {
            blue = temp-10;
            blue = 138.5177312231 * Math.log(blue) - 305.0447927307;
        }
    } else {
        red = temp - 60;
        red = 329.698727446 * Math.pow(red, -0.1332047592);
        
        green = temp - 60;
        green = 288.1221695283 * Math.pow(green, -0.0755148492 );

        blue = 255;
    }
    return {
        r : clamp(red,   0, 255),
        g : clamp(green, 0, 255),
        b : clamp(blue,  0, 255)
    }
}


function clamp( x, min, max ) {
	if(x<min){ return min; }
	if(x>max){ return max; }
	return x;
}