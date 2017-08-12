var mqtt = require('mqtt');
var client  = mqtt.connect('mqtt://192.168.1.10:1883');

client.on('connect', function () {
	client.subscribe('/lwt');

	var gradient = [50,255,0,255,100,0,255,255];

	// client.publish("/esp/strip", new Buffer.from([255,255, 255]));
	// client.publish("/esp/switch", new Buffer.from([1]));
	// client.publish("/esp/stripH", "1234567");
	client.publish("/esp/gradient", new Buffer.from(gradient));
	
// 	setInterval(function() {
// // 		// Generate an animation "frame"
// 		var array = [];

// 		for(i=0;i<150*3;i++){
// 			array.push(~~(Math.random()*255))
// 		}

// 		var frame = Buffer.from(array);

// // 		console.log(frame);
// 		client.publish("/esp/pixels", frame);
// }, 1000/60)
})

function byteCount(s) {
    return Buffer.byteLength(s, 'utf8');
}

client.on('message', function (topic, message) {
	// message is Buffer 
	console.log(message.toString())
	// client.end()
})