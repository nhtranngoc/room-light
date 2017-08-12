var mqtt = require('mqtt');
var client  = mqtt.connect('mqtt://192.168.1.10:1883');
var Color = require('tinycolor2');

const stripLength = 150;
const fps = 60;

client.on('connect', function () {
	setInterval(function(){
		var d = new Date();
		var h = d.getHours();
		var m = d.getMinutes();
		var s = d.getSeconds();

		if (h<=9) {h = '0'+h};
		if (m<=9) {m = '0'+m};
		if (s<=9) {s = '0'+s};

		var color = Color(h+m+s).toRgb();

		client.publish("/esp/strip", new Buffer.from([color.r, color.g, color.b]));
	}, 1000/fps)
});