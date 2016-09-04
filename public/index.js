window.onload = function() {

	var socket = io();
	var cw = Raphael.colorwheel($(".colorwheel")[0], 300, 180);
	cw.onchange(function(color) {
		console.log(color.hex);
		socket.emit('setColor', color.hex);
	})

	$('#rainbow').toggle(
		function() {
			socket.emit('rainbowOn');
	},
		function() {
			socket.emit('rainbowOff');
			socket.emit('setColor', 'red');
		}
	)

}