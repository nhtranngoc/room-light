var mqtt = require('mqtt');
var client  = mqtt.connect('mqtt://192.168.1.9:1883');

client.on('connect', function () {
	client.subscribe('/lwt');
	
	setInterval(function() {
		// Generate an animation "frame"
		var array = [];

		for(i=0;i<114*3;i++){
			array.push(~~(Math.random()*255))
		}

		var frame = Buffer.from(array);

		console.log(frame);
		console.log(byteCount(frame));
		client.publish("/esp/pixels", frame);
}, 1000/60)
})

function byteCount(s) {
    return Buffer.byteLength(s, 'utf8');
}

client.on('message', function (topic, message) {
	// message is Buffer 
	console.log(message.toString())
	// client.end()
})