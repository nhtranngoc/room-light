var mqtt = require('mqtt');
var client  = mqtt.connect('mqtt://192.168.1.10:1883');

const fps = 12;

Array.prototype.forEach = function(callback) {
  var i = 0;
  while (i < this.length) {
    callback.call(this, this[i]);
    i++;
  }
  return this;
};

function getRandomColor() {
	return [~~(Math.random()*255), ~~(Math.random()*255), ~~(Math.random()*255)]
}

var Cell = function(x, strip) {
	var self = this;
	self.x = x;
	self.strip = strip;
	self.dead = true;
	self.age = 0;

	self.getX = function() {
		return self.x;
	};

	self.getNeighbors = function() {
		if(self.x == 0) {
			return [self.strip.getCell(self.strip.length-1), self.strip.getCell(this.x+1)]
		} else if (self.x == self.strip.length-1) {
			return [self.strip.getCell(this.x-1), self.strip.getCell(0)]
		} else {
			return [self.strip.getCell(this.x-1), self.strip.getCell(this.x+1)];
		}
	}

	self.getLiveNeighbors = function() {
		return self.getNeighbors()[0].isAlive() + self.getNeighbors()[1].isAlive();
	}

	self.isAlive = function() {
		return !self.dead;
	};

	self.kill = function() {
		// console.log("Killed cell " + self.x);
		self.age = 0;
		return self.dead = true;
	}

	self.rise = function() {
		// console.log("Raised cell " + self.x);
		self.age = 1;
		return self.dead = false;
	}

	self.toggle = function() {
		self.dead = !self.dead;
		self.dead ? self.age = 0 : self.age = 1;

		return self.dead;
	}
}

var Strip = function(length) {
	var self = this;
	self.length = length;

	self.cells = [];
	for(i=0;i<self.length;i++) {
		self.cells.push(new Cell(i, self));
	};

	self.getCell = function(x) {
		return self.cells[x];
	}

	self.init = function() {
		self.cells.forEach(function(currentCell) {
			Math.random() >= 0.5 ? currentCell.kill() : currentCell.rise();
		})
	}

	self.tick = function() {
		var affected = [];
		self.cells.forEach(function(currentCell) {
			var neighbors = currentCell.getNeighbors();
			if (currentCell.isAlive()) {
				if (currentCell.getLiveNeighbors() == 2) {
					affected.unshift(currentCell);
				} else if (currentCell.getLiveNeighbors() == 0) {
					affected.unshift(currentCell);
				} else {
					currentCell.age++;
				}
			} else {
				if (currentCell.getLiveNeighbors() == 1) {
					affected.unshift(currentCell);
				}
			}
		});
		affected.forEach(function(cell) {
			cell.toggle();
		})
	}

	// Binary representation of the world, printed out to console.
	self.print = function() {
		var results = "";
		self.cells.forEach(function(currentCell) {
			if (currentCell.isAlive()) {
				results = results.concat("X ");
			} else {
				results = results.concat("O ");
			}
		})
		console.log(results);
	}

	//Export world into RGB Buffer
	self.export = function() {
		var array = [];
		self.cells.forEach(function(cell) {
			if (cell.age == 0) {
				array = array.concat([0,0,0]);
			} else if (cell.age == 1) {
				array = array.concat([255,255,255]);
			} else {
				array = array.concat(getRandomColor());
			}
		})

		return new Buffer.from(array);
	}
}

var world1 = new Strip(150);
world1.init();

// world1.getCell(57).rise();
// world1.getCell(113).rise();
// world1.getCell(0).rise();
client.on('connect', function () {
	client.subscribe('/lwt');
	
	setInterval(function() {
		console.log("tick");
		client.publish("/esp/pixels", world1.export());
		world1.tick();	
}, 1000/fps)
})