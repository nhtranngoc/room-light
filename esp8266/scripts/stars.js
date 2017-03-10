var color = require("tinycolor2");
var mqtt = require("mqtt");

// Position x,
// Transition rate rate (from 0 to 10) 
var Pixel = function (x, rate, start, end) {
	var self = this;
	self.x = x;
	self.rate = rate;
	self.startingColor = start;
	self.currentColor;
	self.nextColor = end;
	self.stage = 0;

	self.colorArray = [];
	

	self.nextStage = function() {
		self.stage++;
		if (self.stage == self.rate) {
			self.stage = 0;
		}
	}

	self.setRate = function(rate) {
		return self.rate = rate;
	}

	self.setCurrentColor = function(color) {
		return self.currentColor = color;
	}

	self.setNextColor = function(color) {
		return self.nextColor = color;
	}

}

var Strip = function(length) {
	var self = this;
	self.length = length;

	self.pixels = [];
	for(i=0;i<self.length;i++) {
		self.pixels.push(new Pixel(i, (~~(Math.random()*10)) + 1), color.random(), color.random());
	};

	self.tick = function() {
		// Increment each stage of pixels by one
		self.pixels.forEach(function(pixel) {
			pixel.nextStage();
		})
		//
	}
}

var newWorld = new Strip(10);
console.log(newWorld);
newWorld.tick();
newWorld.tick();
newWorld.tick();
console.log(newWorld);