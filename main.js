var five = require('johnny-five');
var pixel = require('node-pixel');
var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io').listen(http);
var Forecast = require('forecast');
var CronJob = require('cron').CronJob;

var port = 80;

var board = new five.Board({repl: false});
var strip = rainbowInterval = null;

app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res) {
	res.sendFile(__dirname + '/public/index.html');
});

http.listen(port);
console.log('Server listening at port ' + port);

var forecast = new Forecast({
    service: 'darksky', 
    key: '1cd9840453629845d4c54ec81305eee0',
    units: 'celsius', 
    cache: true,
    ttl: {
        minutes: 27,
        seconds: 45
    }
})

board.on("ready", function() {
	strip = new pixel.Strip({
		board: this,
		controller: "FIRMATA",
		strips: [ {pin: 6, length: 150}]
	});

    strip.on("ready", function() {
        // Display time every second
        new CronJob('* * * * * *', function() {
            var d = new Date();
            showTime(d, 16);
            strip.show();
        }, null, true, 'America/Los_Angeles');

        forecast.get([42.2626, -71.8023], function(err, weather) {
            if (err) console.log(err);
            showWeather(weather, 0);
        })

        // Display weather every hour
        new CronJob('0 * * * * *', function() {
            forecast.get([42.2626, -71.8023], function(err, weather) {
                if (err) console.log(err);
                showWeather(weather, 0);
            })
        })
    })
})

io.on('connection', function(socket) {
	console.log(socket.id);

	socket.on('setColor', function(colorString) {
		console.log("Setting color " + colorString);
        for (var i=36;i<150;i++) {
            strip.pixel(i).color(colorString);
        }
		strip.show();
	})

	socket.on('rainbowOn', function() {
		dynamicRainbow(2);
	})

	socket.on('rainbowOff', function() {
		clearInterval(rainbowInterval);
	})
})


// Parse time object and display it on the strip at the startPixel 
function showTime(date, startPixel) { //Best function name 2016
    var hours = date.getHours().toString(2);
    var minutes = date.getMinutes().toString(2);
    var seconds = date.getSeconds().toString(2);

    seconds = "000000".substr(seconds.length)+seconds;
    minutes = "000000".substr(minutes.length)+minutes;
    hours   = "00000" .substr(hours  .length)+hours  ;

    timeStr =  "-" + hours + "-" + minutes + "-" + seconds;

    for (var i = 0; i < timeStr.length; i++) {
        switch(timeStr[i]) {
            case '0':
                strip.pixel(i+startPixel).color('black');
            break;
            case '1':
                strip.pixel(i+startPixel).color('white');
            break;
            case '-':
                strip.pixel(i+startPixel).color('blue');
            break;
        }
    }
}

function showWeather(weather, startPixel) {
    var colorScale = [  "silver", "silver",     //-20
                        "gray", "gray",         //-10
                        "white", "aqua",        //0
                        "teal", "blue",         //10
                        "blue", "navy",         //20
                        "aquamarine", "orange", //30
                        "yellow", "red"         //40
                        ];
    var hourlyData = weather.hourly.data[0];
    var hourlyTemp = hourlyData.apparentTemperature;
    var hourlyIcon = weather.hourly.icon;

     switch (hourlyIcon) {
        case "clear-day":
            var weatherColors = ["lightskyblue", "lightskyblue"]
        break;
        case "clear-night":
            var weatherColors = ["lightskyblue", "midnightblue"];
        break;
        case "rain":
            var weatherColors = ["navy", "navy"];
        break;
        case "snow":
            var weatherColors = ["azure", "azure"];
        break;
        case "sleet":
            var weatherColors = ["azure", "lightslategray"];
        break;
        case "wind":
            var weatherColors = ["mediumspringgreen", "mediumspringgreen"]
        break;
        case "fog":
            var weatherColors = ["gray", "gray"]
        break;
        case "cloudy":
            var weatherColors = ["silver", "silver"];
        break;
        case "partly-cloudy-day":
            var weatherColors = ["silver", "lightskyblue"];
        break;
        case "partly-cloudy-night":
            var weatherColors = ["silver", "midnightblue"];
        break;
    }

    weatherColors.push("black");

    var tempScale = parseInt((hourlyTemp+20)/5);
    var tempStr = new String();
    for (var i=0;i<12;i++){
        if(i<tempScale) {
            weatherColors.push(colorScale[i])
        } else weatherColors.push("black");
    } // Convert to scale

    console.log(weatherColors);

    for(var i=0;i<weatherColors.length;i++) {
        strip.pixel(i + startPixel).color(weatherColors[i])
    }
}

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