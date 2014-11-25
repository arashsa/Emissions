//Polyfill functions 

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

var missionTimeUpdater;

//Initializes the missiontime element and starts a timer that decrements it by one every minute until it is 0
function startMissionTimer(missionTime) {
	var updateMissionTime = function() {
		if (missionTime > 0) {
			$("#missionTime").html(missionTime + " minutter igjen av oppdraget");
		}
		else {
			stopMissionTimer();
		}
		
		missionTime--;
	}
	
	clearInterval(missionTimeUpdater);
	missionTimeUpdater = setInterval(updateMissionTime, 1000 * 60);
	updateMissionTime();
};

function stopMissionTimer() {
	clearInterval(missionTimeUpdater);
	$("#missionTime").html("Oppdraget er ferdig");
}