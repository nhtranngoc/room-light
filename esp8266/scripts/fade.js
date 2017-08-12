var mqtt = require('mqtt');
var client  = mqtt.connect('mqtt://192.168.1.10:1883');
var Color = require('tinycolor2');

const stripLength = 150;
const fps = 60;

//Copied this from StackOverflow cause I'm lazy.
Number.prototype.map = function (in_min, in_max, out_min, out_max) {
	return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

Array.prototype.toBuffer = function() {
	var tempArray = [];
	this.forEach(function(cell) {
		rgbCell = cell.toRgb();
		tempArray = tempArray.concat([rgbCell.r, rgbCell.g, rgbCell.b]);
	})

	return new Buffer.from(tempArray)
}

var start = Color("yellow").toHsl();
var end = Color("blue").toHsl(); 

colorArray = [];
var lastBrightness, isUp;
function tick(colorArray, amount) {
	colorArray.forEach(function(cell) {
		currentBrightness = cell.getBrightness();
		(currentBrightness - lastBrightness) > 0 ? isUp	= true : isUp = false; 

		if (isUp) {
			if (currentBrightness > 250) {
				isUp = false;
			}
		} else {

		}

		lastBrightness = currentBrightness;
	})
	console.log(colorArray[0]);

	return colorArray;
}

client.on('connect', function () {
	client.subscribe('/lwt');

	// Create the initial gradient
	for (i=0;i<stripLength;i++) {
		var gradient = Color({h: i.map(0, stripLength, start.h, end.h), s: start.s, l:start.l});
		colorArray = colorArray.concat(gradient);
	} 

	client.publish("/esp/pixels", colorArray.toBuffer());
	setInterval(function() {
		colorArray.forEach(function(cell) {
			cell = Color({h: cell.h, s: cell.s, l: 10});
		})
		client.publish("/esp/pixels", tick(colorArray, 5).toBuffer());
		console.log(colorArray[0])
	}, 1000/fps)
})