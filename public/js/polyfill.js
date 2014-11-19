//Returns the current time in ms
if (!Date.now) {
	Date.now = function() {
		return new Date().getTime();
	}
}

//Returns the last element of an array
if (!Array.prototype.last){
	Array.prototype.last = function() {
		return this[this.length - 1];
	};
};

//Returns a random integer between min and max inclusive
Math.randomInt = function(min, max) {
	return Math.floor(Math.random() * (max + 1 - min)) + min;
}
