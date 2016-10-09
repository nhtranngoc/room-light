var svgContainer;

window.onload = function() {
	var socket = io();

	socket.emit('load');
	socket.on('load', function(cwColor) {
		cw.color(cwColor);
	})

	var cw = Raphael.colorwheel($(".colorwheel")[0], 300, 180);
 	cw.onchange(function(color) {
 		socket.emit('setColor', gammaCorrection(color.hex));
 	})

	svgContainer = d3.select("body").append("svg")
	.attr("width", 1000)
	.attr("height", 1000);

	socket.on('colorData', function(data) {
		// cw.color(data[149].hexcode);
		console.log(data[149].hexcode);
		update(data);
	})
}

function update(colors) {
	if (svgContainer == null) {
		return;
	}

	var rects = svgContainer
	.selectAll("rect")
	.data(colors);

	rects.style("fill", function(d) {
		// console.log(gammaCorrection(d.hexcode));
		return d.hexcode;
	})

	rects.enter().append("rect")
	.attr("x", function(d, i) {
		return i%36*27;
	})
	.attr("y", function(d, i) {
		return parseInt(i/36)*27;
	})
	.attr("width", function(d) {
		return 25;
	})
	.attr("height", function(d) {
		return 25;
	})

	rects.exit().remove();
}

function gammaCorrection(hex) {
	var gamma = [
	0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  1,  1,
    1,  1,  1,  1,  1,  1,  1,  1,  1,  2,  2,  2,  2,  2,  2,  2,
    2,  3,  3,  3,  3,  3,  3,  3,  4,  4,  4,  4,  4,  5,  5,  5,
    5,  6,  6,  6,  6,  7,  7,  7,  7,  8,  8,  8,  9,  9,  9, 10,
   10, 10, 11, 11, 11, 12, 12, 13, 13, 13, 14, 14, 15, 15, 16, 16,
   17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 24, 24, 25,
   25, 26, 27, 27, 28, 29, 29, 30, 31, 32, 32, 33, 34, 35, 35, 36,
   37, 38, 39, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 50,
   51, 52, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 66, 67, 68,
   69, 70, 72, 73, 74, 75, 77, 78, 79, 81, 82, 83, 85, 86, 87, 89,
   90, 92, 93, 95, 96, 98, 99,101,102,104,105,107,109,110,112,114,
  115,117,119,120,122,124,126,127,129,131,133,135,137,138,140,142,
  144,146,148,150,152,154,156,158,160,162,164,167,169,171,173,175,
  177,180,182,184,186,189,191,193,196,198,200,203,205,208,210,213,
  215,218,220,223,225,228,231,233,236,239,241,244,247,249,252,255];

	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
        return null;
    } 
    var r = parseInt(result[1], 16);
    var g = parseInt(result[2], 16);
    var b = parseInt(result[3], 16);

    r = gamma[r].toString(16);
    g = gamma[g].toString(16);
    b = gamma[b].toString(16);

    return "#" 
    + ("00".substr(0, 2 - r.length)+r) 
    + ("00".substr(0, 2 - g.length)+g) 
    + ("00".substr(0, 2 - b.length)+b);
}

function getRandomColor() {
	var letters = '0123456789ABCDEF';
	var color = '#';
	for (var i = 0; i < 6; i++ ) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}