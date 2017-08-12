var mqtt = require("mqtt");
var client = mqtt.connect("localhost");

client.on('connect', function() {
	console.log("Connected to MQTT broker");
});


var counter = 0;

setInterval(function(){
	if (counter%2) {
		console.log("OFF");
		client.publish("/esp/relay/cmd/switch", "0");
	} else {
		console.log("ON");
		client.publish("/esp/relay/cmd/switch", "1");
	}
	counter+=1;
}, 1000);
