var svgContainer;
var socket;

const rectSize = screen.width/36;
const divider = 2;

window.onload = function() {
	socket = io();

	var	sliders = document.getElementsByClassName('sliders');
	for ( var i = 0; i < sliders.length; i++ ) {

		noUiSlider.create(sliders[i], {
			start: 127,
			connect: [true, false],
			orientation: "horizontal",
			range: {
				'min': 0,
				'max': 255
			},
			format: wNumb({
				decimals: 0
			})
		});

		// Bind the color changing function
		// to the slide event.
		var uiColor;
		sliders[i].noUiSlider.on('change', function(){
			console.log(uiColor);
			socket.emit('setColor', uiColor.toHexString());
		});

		sliders[i].noUiSlider.on('slide', function(){
			uiColor = jQuery.Color({
				hue: sliders[0].noUiSlider.get()/255*359,
			 	saturation: sliders[1].noUiSlider.get()/255, 
			 	lightness: sliders[2].noUiSlider.get()/255, 
			 	alpha: 1});

			document.body.style.background = uiColor.toHexString();
		});
	}

	socket.emit('load');
	socket.on('load', function(cwColor) {
		if(cwColor == null) {
			currentColor = jQuery.Color("#000000")	;
		} else {
			currentColor = jQuery.Color(cwColor);
		}

		sliders[0].noUiSlider.set(currentColor.hue());
		sliders[1].noUiSlider.set(currentColor.saturation()*255);
		sliders[2].noUiSlider.set(currentColor.lightness()*255);
		document.body.style.background = currentColor.toHexString();
	})

 	svgContainer = d3.select("#mainDisplay").append("svg")
	.classed("svg-container", true) //container class to make it responsive
	.append("svg")
   	//responsive SVG needs these 2 attributes and no width and height attr
   	.attr("preserveAspectRatio", "xMinYMin meet")
   	.attr("viewBox", "0 0 1000 600")
   	//class to make it responsive
   	.classed("svg-content-responsive", true); 

	socket.on('colorData', function(data) {
		document.body.style.background = data[149].hexcode;
		update(data);
	})
}

function toggle(c) {
	switch(c){
		case "primary":
			socket.emit('primary');
		break;
		case "secondary":
			socket.emit('secondary');
		break;
		case "sleep":
			socket.emit('sleep', true);
		break;
	}
}

function update(colors) {
	if (svgContainer == null) {
		return;
	}

	var rects = svgContainer
	.selectAll("rect")
	.data(colors);

	rects.style("fill", function(d) {
		return d.hexcode;
	})

	rects.enter().append("rect")
	.attr("x", function(d, i) {
		return i%36*(rectSize+divider);
	})
	.attr("y", function(d, i) {
		return parseInt(i/36)*(rectSize+divider);
	})
	.attr("width", function(d) {
		return rectSize;
	})
	.attr("height", function(d) {
		return rectSize;
	})

	rects.exit().remove();
}