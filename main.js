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
var colorGlobal;
var weatherGlobal;

// =======================================================================================

// =============================== SERVER LOGIC ==========================================

// =======================================================================================

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/public/index.html');
});

app.get('/sleep', function(req, res) {
    var q = req.query.start;
    if (strip) {
        if (q == 'true') {
            console.log("GO TO SLEEP PLS");
            updateColor("#00000C");
            pushData();
        } else if (q == 'false') {
            console.log("WAKE UP SUNSHINE");
            updateColor("#ffffff");
            pushData();
        }
        res.sendStatus(200);
    }
});

app.get('/toggle', function(req, res) {
    if (strip) {
        // Get current state
        var stateOn = strip.pixel(149).color().hexcode == "#000000" ? false : true;
        console.log(strip.pixel(149).color().hexcode);

        if (stateOn) {
            updateColor("#000000");
            pushData();
        } else {
            updateColor("#ffffff");
            pushData();
        }

        res.sendStatus(200);
    }
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
});

// =======================================================================================

// =============================== STRIP LOGIC ===========================================

// =======================================================================================
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
            pushData();
        }, null, true, 'America/Los_Angeles');

        // Have to run this once on startup. Could pack this up to a function tho
        forecast.get([42.2626, -71.8023], function(err, weather) {
            if (err) console.log(err);
            showWeather(weather, 0);
            weatherGlobal = weather;
            pushData();
        })

        // Display weather every hour
        new CronJob('0 * * * * *', function() {
            forecast.get([42.2626, -71.8023], function(err, weather) {
                if (err) console.log(err);
                showWeather(weather, 0);
                weatherGlobal = weather;
                pushData();
            })
        })

        // Handle socket connection with front-end
        io.on('connection', function(socket) {
            console.log(socket.id);

            socket.on('setColor', function(colorString) {
                console.log("Setting color " + colorString);
                updateColor(colorString);
                pushData();
            });

            socket.on('getColor', function() {
                pushData();
            });

            io.on('load', function() {
                io.sockets.emit('load', colorGlobal);
            })
        // Update both strip and front-end
    })

    })
})

// =======================================================================================

// =============================== HELPER FUNCTIONS ======================================

// =======================================================================================
// I'm too lazy to move all of this to a helper module :(

function updateColor(color) {
    // Holy mother of performance problems.
    for (var i=36;i<150;i++) {
        strip.pixel(i).color(color);
    }
    colorGlobal = color;
    if (weatherGlobal) {
        showWeather(weatherGlobal, 0);
    }
}

function pushData() {
    strip.show();
    var stripData = [];
    for (var i=0;i<150;i++) {
        stripData.push(strip.pixel(i).color());
    }
    // console.log(strip.pixel(35).color());
    io.sockets.emit('colorData', stripData);
}

// Parse time object and display it on the strip at the startPixel 
function showTime(date, startPixel) { //Best function name 2016
    var hours = date.getHours().toString(2);
    var minutes = date.getMinutes().toString(2);
    var seconds = date.getSeconds().toString(2);

    seconds = "000000".substr(seconds.length)+seconds;
    minutes = "000000".substr(minutes.length)+minutes;
    hours   = "00000" .substr(hours  .length)+hours  ;

    timeStr =  "-" + hours + "-" + minutes + "-" + seconds;

    if (colorGlobal) {
        var separator = colorGlobal.toHSL();
        if (1-separator[0] == separator[0]) {
            var separatorHex = "black";
        } else var separatorHex = [1-separator[0],separator[1],separator[2]].toHex();    
    } else var separatorHex = "navy";
    
    for (var i = 0; i < timeStr.length; i++) {
        switch(timeStr[i]) {
            case '0':
            strip.pixel(i+startPixel).color('black');
            break;
            case '1':
            strip.pixel(i+startPixel).color(colorGlobal || "white");
            break;
            case '-':
            strip.pixel(i+startPixel).color(separatorHex || 'navy');
            break;
        }
    }
}

// Parse weather data and display it at startPixel
function showWeather(weather, startPixel) {
    var length = 16;
    var minTemp = -20;
    var maxTemp = 40;
    var resolution = 60/length;
    var hourlyData = weather.hourly.data[0];
    var hourlyTemp = hourlyData.apparentTemperature;
    var weatherColors = [];

    var tempScale = parseInt((hourlyTemp+20)/resolution);
    console.log("TEMPERATURE SCALE: " + tempScale);

    for (var i=0;i<length;i++){
        if(i<tempScale) {
            weatherColors.push(colorScale(i, 1))
        } else if (i == tempScale) {
            var remain = (hourlyTemp - ((tempScale*resolution)-20))/resolution; ////Temperature between this scale and the next
            // Value would be between 0 and 3.75 (current resolution);
            weatherColors.push(colorScale(i, remain));
            console.log(remain);
        } else weatherColors.push("black");
    } // Convert to scale

    for(var i=0;i<weatherColors.length;i++) {
        strip.pixel(i + startPixel).color(weatherColors[i])
    }
}

// I wish I'm never a parent cause I'm horrible at naming stuff.
function colorScale(index, magnitude) {
    if (colorGlobal) {
        var temp_color = colorGlobal.toHSL();
        var temp_color_2 = [index.map(0,12,0.725,0), 1, temp_color[2]*magnitude];
        return temp_color_2.toHex();
    }
}

//Copied this from StackOverflow cause I'm lazy.
Number.prototype.map = function (in_min, in_max, out_min, out_max) {
    return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

// Parse hex color string, return hsl array
String.prototype.toHSL = function() {
    var h,s,l;
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(this);
    if (!result) {
        return null;
    } 
    var r = parseInt(result[1], 16);
    var g = parseInt(result[2], 16);
    var b = parseInt(result[3], 16);

    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
}

// Parse hsl array, return hexadecimal string
Array.prototype.toHex = function() {
    var h = this[0];
    var s = this[1];
    var l = this[2];
    var r, g, b;

    if (! (h && s)) {
        r = g = b = l;
    } else {
        var hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    // return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]; 
    r = Math.round(r*255).toString(16);
    g = Math.round(g*255).toString(16);
    b = Math.round(b*255).toString(16);

    return "#" 
    + ("00".substr(0, 2 - r.length)+r) 
    + ("00".substr(0, 2 - g.length)+g) 
    + ("00".substr(0, 2 - b.length)+b);
}

// Create a dynamic rainbow
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
            pushData();
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
