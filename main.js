var five = require('johnny-five');
var pixel = require('node-pixel');
var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io').listen(http);

var port = 80;

var board = new five.Board({repl: false});
var strip = rainbowInterval = null;

app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res) {
	res.sendFile(__dirname + '/public/index.html');
});

http.listen(port);
console.log('Server listening at port ' + port);

board.on("ready", function() {
	strip = new pixel.Strip({
		board: this,
		controller: "FIRMATA",
		strips: [ {pin: 6, length: 150}]
	});
})



io.on('connection', function(socket) {
	console.log(socket.id);

	socket.on('setColor', function(colorString) {
		console.log("Setting color " + colorString);
		strip.color(colorString);
		strip.show();
	})

	socket.on('rainbowOn', function() {
		dynamicRainbow(2);
	})

	socket.on('rainbowOff', function() {
		clearInterval(rainbowInterval);
	})
})

 function dynamicRainbow( delay ){
        console.log( 'dynamicRainbow' );

        var showColor;
        var cwi = 0; // colour wheel index (current position on colour wheel)
        rainbowInterval = setInterval(function(){
            if (++cwi > 255) {
                cwi = 0;
            }

            for(var i = 0; i < strip.stripLength(); i++) {
                showColor = colorWheel( ( cwi+i ) & 255 );
                strip.pixel( i ).color( showColor );
            }
            strip.show();
        }, 1000/delay);
    }

 // Input a value 0 to 255 to get a color value.
    // The colors are a transition r - g - b - back to r.
    function colorWheel( WheelPos ){
        var r,g,b;
        WheelPos = 255 - WheelPos;

        if ( WheelPos < 85 ) {
            r = 255 - WheelPos * 3;
            g = 0;
            b = WheelPos * 3;
        } else if (WheelPos < 170) {
            WheelPos -= 85;
            r = 0;
            g = WheelPos * 3;
            b = 255 - WheelPos * 3;
        } else {
            WheelPos -= 170;
            r = WheelPos * 3;
            g = 255 - WheelPos * 3;
            b = 0;
        }
        // returns a string with the rgb value to be used as the parameter
        return "rgb(" + r +"," + g + "," + b + ")";
    }

console.log("Waiting for connection..");