var fs = require('fs');
var socketIo = require('socket.io');
var express = require('express');
var app = express();
var port = process.env.PORT || 5000;

app.use(express.static(__dirname + '/public'));

var events = [];
var completedEvents = [];
var eventData = JSON.parse(fs.readFileSync('events.json'));

//Parses the events to objects and adds them to a single array
Array.prototype.push.apply(events, parseEvents(eventData.respirationEvents, eventData.respirationLevels, "respiration"));
Array.prototype.push.apply(events, parseEvents(eventData.heartRateEvents, eventData.heartRateLevels, "heartRate"));
Array.prototype.push.apply(events, parseEvents(eventData.radiationEvents, eventData.radiationLevels, "radiation"));
Array.prototype.push.apply(events, parseEvents(eventData.satelite1Events, eventData.receptionLevels, "satelite1"));
Array.prototype.push.apply(events, parseEvents(eventData.satelite2Events, eventData.receptionLevels, "satelite2"));
Array.prototype.push.apply(events, parseEvents(eventData.satelite3Events, eventData.receptionLevels, "satelite3"));

//Sorts the events by timestamp in descending order
events.sort(function(e1, e2) {
	return e2.timestamp - e1.timestamp;
});

var missionStarted = false;
var missionLength = 0;
var originalMissionLength = 0;
var missionTime = 0;
var missionTimeLastUpdated = 0;
var ranges = {respiration: [0, 0], heartRate: [0, 0], radiation: [0, 0], satelite1: [0, 0], satelite2: [0, 0], satelite3: [0, 0]};
var levels = {respiration: eventData.respirationLevels, heartRate: eventData.heartRateLevels, oxygenUse: eventData.oxygenUseLevels, radiation: eventData.radiationLevels, reception: eventData.receptionLevels};

var server = app.listen(port);
var io = socketIo.listen(server);
console.log("Server listening on port " + port);

io.sockets.on("connection", function (socket) {
	//Initiates an RTC call with another client
	socket.on("call", function(from, to) {
		socket.broadcast.emit("call", from, to);
	});
	
	//Sends an RTC signal from one client to another
	socket.on("signal", function(signal, from, to) {
		socket.broadcast.emit("signal", signal, from, to);
	});
	
	//Instructs all clients displaying the astronaut video feed to change the video url
	socket.on("change video", function(videoUrl) {
		socket.broadcast.emit("change video", videoUrl);
	});
	
	socket.on("get ranges", function() {
		socket.emit("ranges", ranges);
	});
	
	socket.on("get levels", function() {
		socket.emit("levels", levels);
	});
	
	socket.on("get mission time left", function() {
		updateMissionTime();
		socket.emit("mission time left", missionLength - missionTime);
	});
	
	socket.on("start mission", startMission);
	
	socket.on("stop mission", stopMission);
	
	socket.on("change mission length", updateMissionLength);
});

function parseEvents(events, levels, type) {
	var parsedEvents = [];
	
	for (var i = 0; i < events.length; i++) {
		parsedEvents.push({timestamp: events[i][0], range: levels[events[i][1]], type: type});
	}

	return parsedEvents;
}

function updateMissionTime() {
	if (missionStarted) {
		missionTime += Date.now() - missionTimeLastUpdated;
		missionTimeLastUpdated = Date.now();
		
		if (missionTime >= originalMissionLength) {
			stopMission();
		}		
	}
}

var rangeUpdater;

function updateRanges() {
	if (missionStarted) {
		updateMissionTime();
		var secondsPassed = missionTime / 1000;
		
		while (events.length > 0) {
			var nextEvent = events[events.length - 1];
			
			if (secondsPassed >= nextEvent.timestamp) {
				ranges[nextEvent.type] = nextEvent.range;
				
				if (nextEvent.type === "radiation") {
					io.emit("change radiation", nextEvent.range);
				}
				else if (nextEvent.type === "respiration") {
					io.emit("change respiration", nextEvent.range);
				}
				else if (nextEvent.type === "heartRate") {
					io.emit("change heart rate", nextEvent.range);
				}
				else if (nextEvent.type.indexOf("satelite") === 0) {
					io.emit("change reception", parseInt(nextEvent.type.slice(-1)), nextEvent.range);
				}
				
				completedEvents.push(events.pop());
			}
			else {
				break;
			}
		}

		//Schedule the next update based on when the next event will occur or when the mission ends if all events have run
		var nextUpdate = missionLength - missionTime;
		
		if (events.length > 0) {
			var nextEvent = events[events.length - 1];
			nextUpdate = nextEvent.timestamp * 1000 - missionTime;
		}
		
		clearInterval(rangeUpdater);
		rangeUpdater = setTimeout(updateRanges, nextUpdate);
	}
}

function startMission(length) {
	originalMissionLength = length;
	missionLength = length;
	missionTime = 0;
	missionTimeLastUpdated = Date.now();
	missionStarted = true;
	updateRanges();
	io.emit("mission started", length);
	console.log((length / 60 / 1000) + " minute mission started");
}

function stopMission() {
	//Mark all events as unfinished
	Array.prototype.push.apply(events, completedEvents);
	completedEvents.length = 0;
	
	events.sort(function(e1, e2) {
		return e2.timestamp - e1.timestamp;
	});
	
	missionLength = 0;
	missionTime = 0;
	missionTimeLastUpdated = Date.now();
	missionStarted = false;
	clearInterval(rangeUpdater);
	io.emit("mission stopped");
	console.log("Mission stopped");
}

function updateMissionLength(length) {
	missionLength = length;
	missionTime = originalMissionLength - missionLength;
	missionTimeLastUpdated = Date.now();
	updateRanges();
	io.emit("mission length changed", length);
	console.log("Mission time left set to " + (length / 60 / 1000) + " minutes");
}