window.onload = function() {

	// var socket = io();
	// var cw = Raphael.colorwheel($(".colorwheel")[0], 300, 180);
	// cw.onchange(function(color) {
	// 	console.log(color.hex);
	// 	socket.emit('setColor', color.hex);
	// })

	colors = [];

	for (var i=0;i<150;i++) {
		colors.push(getRandomColor());
	}

	svgContainer = d3.select("body").append("svg")
	.attr("width", 1000)
	.attr("height", 1000);

	update(svgContainer);

}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function update(svg) {
	var rects = svg
	.selectAll("rect")
	.data(colors)
	.enter()
	.append("rect");

	var rectsattributes = rects
	.attr("x", function(d, i) {
		return i%30*27;
	})
	.attr("y", function(d, i) {
		// console.log(i/10);
		return parseInt(i/30)*27;
	})
	.attr("width", function(d) {
		return 25;
	})
	.attr("height", function(d) {
		return 25;
	})
	.style("fill", function (d) {
		return d;
	})
}