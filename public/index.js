window.onload = function() {

	// var socket = io();
	// var cw = Raphael.colorwheel($(".colorwheel")[0], 300, 180);
	// cw.onchange(function(color) {
	// 	console.log(color.hex);
	// 	socket.emit('setColor', color.hex);
	// })

	colors = ['#ffffff', "#000fff", "#fff000"];

	svgContainer = d3.select("body").append("svg")
	.attr("width", 200)
	.attr("height", 200);

	update(svgContainer);

}

function update(svg) {
	var rects = svg
	.selectAll("rect")
	.data(colors)
	.enter()
	.append("rect");

	var rectsattributes = rects
	.attr("x", function(d, i) {
		return i*10;
	})
	.attr("y", function(d, i) {
		return 0;
	})
	.attr("width", function(d) {
		return 10;
	})
	.attr("height", function(d) {
		return 10;
	})
	.style("fill", function (d) {
		return d;
	})
}