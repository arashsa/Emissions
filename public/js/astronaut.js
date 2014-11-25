//Lung volume in ml before and after inhalation
var lowVolume = 2000;
var highVolume = 3000;

//Millivolts displayed on the Y axis of the ECG graph
var highMV = 1;
var lowMV = 0;

var breathRateSamples = [];
var heartRateSamples = [];
var breathRateChart;
var heartRateChart;
	
//Configure the charts
AmCharts.ready(function() {
	breathRateChart = new AmCharts.AmSerialChart();
	
	breathRateChart.marginTop = 20;
	breathRateChart.marginRight = 10;
	breathRateChart.autoMarginOffset = 5;
	breathRateChart.dataProvider = breathRateSamples;
	breathRateChart.categoryField = "timestamp";
	
	//X Axis
	var categoryAxis = breathRateChart.categoryAxis;
	categoryAxis.dashLength = 1;
	categoryAxis.gridAlpha = 0.10
	categoryAxis.axisColor = "#DADADA";
	categoryAxis.autoGridCount = false;
	categoryAxis.gridCount = 15;
	categoryAxis.forceShowField = "forceShow";
	categoryAxis.title = "Seconds";
	
	//Hide every label that is not explicitly shown
	categoryAxis.labelFunction = function(valueText, object) {
		if (object.forceShow) {
			return valueText;
		}
	};
	
	//Y Axis
	var valueAxis = new AmCharts.ValueAxis();
	valueAxis.axisAlpha = 0.2;
	valueAxis.dashLength = 1;
	valueAxis.minimum = lowVolume;
	valueAxis.maximum = highVolume * 1.1;
	valueAxis.title = "Lung volume (ml)";
	breathRateChart.addValueAxis(valueAxis);
	
	//Line
	var graph = new AmCharts.AmGraph();
	graph.type = "smoothedLine";
	graph.valueField = "volume";
	graph.lineThickness = 1.5;
	graph.lineColor = "#b5030d";
	breathRateChart.addGraph(graph);
	
	breathRateChart.write("breathRateChart");
	
	heartRateChart = new AmCharts.AmSerialChart();
	
	heartRateChart.marginTop = 20;
	heartRateChart.marginRight = 10;
	heartRateChart.autoMarginOffset = 5;
	heartRateChart.dataProvider = heartRateSamples;
	heartRateChart.categoryField = "timestamp";
	
	//X Axis
	categoryAxis = heartRateChart.categoryAxis;
	categoryAxis.dashLength = 1;
	categoryAxis.gridAlpha = 0.10
	categoryAxis.axisColor = "#DADADA";
	categoryAxis.forceShowField = "forceShow";
	categoryAxis.title = "Seconds";
	
	//Hide every label that is not explicitly shown
	categoryAxis.labelFunction = function(valueText, object) {
		if (object.forceShow) {
			return valueText;
		}
	};
	
	//Y Axis
	valueAxis = new AmCharts.ValueAxis();
	valueAxis.axisAlpha = 0.2;
	valueAxis.dashLength = 1;
	valueAxis.minimum = lowMV;
	valueAxis.maximum = highMV * 1.1;
	valueAxis.title = "mV";
	heartRateChart.addValueAxis(valueAxis);
	
	//Line
	graph = new AmCharts.AmGraph();

	graph.valueField = "mV";
	graph.type = "smoothedLine";
	graph.lineThickness = 1;
	graph.lineColor = "#b5030d";
	heartRateChart.addGraph(graph);
	
	heartRateChart.write("heartRateChart");
});

var heartRateBuffer;
var heartRateBufferIndex;
var msUntilNextHeartRateBufferFrame;

//Fills the heart rate buffer with samples from the specified range
//The heart rate buffer contains twice as many samples as the heart rate chart and is used to animate the chart
function createHeartRateSamples(range) {
	heartRateBuffer = [];
	heartRateBufferIndex = 0;
	msUntilNextHeartRateBufferFrame = 0;
	
	var beatsPerMinute = Math.randomInt(range[0], range[1]);
	var msBetweenBeats = 60 * 1000 / beatsPerMinute;
	var msUntilNextBeat = msBetweenBeats;
	
	for (var i = 0; i <= 200; i++) {
		var mV;
		
		if (msUntilNextBeat <= 0) {
			mV = highMV;
			msUntilNextBeat = msBetweenBeats;
		}
		else {
			mV = Math.random() * 0.2;
		}
		
		//The resolution of the chart is ten samples per second
		heartRateBuffer.push({timestamp: i / 10, mV: mV});
		msUntilNextBeat -= 50;
	}
}

var breathRateBuffer;
var breathRateBufferIndex;
var msUntilNextBreathRateBufferFrame;

//Fills the breath rate buffer with samples from the specified range
//The breath rate buffer contains twice as many samples as the breath rate chart and is used to animate the chart
function createBreathRateSamples(range) {
	breathRateBuffer = [];
	breathRateBufferIndex = 0;
	msUntilNextBreathRateBufferFrame = 0;
	
	var breathsPerMinute = Math.randomInt(range[0], range[1]);
	var msBetweenBreaths = 60 * 1000 / breathsPerMinute;
	var msUntilNextBreath = msBetweenBreaths;
				
	for (var i = 0; i <= 120; i++) {
		var lungVolume;
		
		if (msUntilNextBreath <= 0) {
			lungVolume = highVolume;
			msUntilNextBreath = msBetweenBreaths;
		}
		else {
			lungVolume = lowVolume * 1.05;
		}
		
		//The resolution of the chart is two samples per second
		breathRateBuffer.push({timestamp: i / 2, volume: lungVolume});
		msUntilNextBreath -= 500;
	}
}

var chartUpdater;

//Animates the breath rate and heart rate charts
function startEventLoop() {
	var startTime = Date.now();
	var msSinceLastUpdate = 0;
	var msSinceStart = 0;
	var updateFrequency = 400;
	stopEventLoop();
	
	chartUpdater = setInterval(function() {
		msSinceLastUpdate = Date.now() - startTime - msSinceStart;
		msUntilNextBreathRateBufferFrame -= msSinceLastUpdate;
		msUntilNextHeartRateBufferFrame -= msSinceLastUpdate;
		msSinceStart = Date.now() - startTime;
		
		if (msUntilNextBreathRateBufferFrame <= 0) {
			var framesMissed = Math.floor((msUntilNextBreathRateBufferFrame * -1) / 500 + 1);

			for (var i = 0; i < framesMissed; i++) {
				breathRateBufferIndex++;
				
				if (breathRateBufferIndex >= breathRateBuffer.length) {
					breathRateBufferIndex = 0;
				}
				
				breathRateSamples.push(breathRateBuffer[breathRateBufferIndex]);
				
				//When the chart grows to 30 seconds, start cutting off the oldest sample to give the chart a sliding effect
				if (breathRateSamples.length > 60) {
					breathRateSamples.shift();
				}
			}
			
			msUntilNextBreathRateBufferFrame = 250;
		}
		
		//Always show from 0 to 30 seconds on the X axis
		if (breathRateSamples.length >= 60) {
			for (var i = 0; i < breathRateSamples.length; i++) {
				breathRateSamples[i].timestamp = Math.floor(i / (breathRateSamples.length - 1) * 30);
			}
		}
		
		//Only show every 5th timestamp 
		for (var i = 0; i < breathRateSamples.length; i++) {
			breathRateSamples[i].forceShow = breathRateSamples[i].timestamp % 5 == 0 && (i == 0 || breathRateSamples[i - 1].timestamp % 5 != 0);
		}
		
		if (msUntilNextHeartRateBufferFrame <= 0) {
			var framesMissed = Math.floor((msUntilNextHeartRateBufferFrame * -1) / 100 + 1);
			
			for (var i = 0; i < framesMissed; i++) {
				heartRateBufferIndex++;
				
				if (heartRateBufferIndex >= heartRateBuffer.length) {
					heartRateBufferIndex = 0;
				}
				
				heartRateSamples.push(heartRateBuffer[heartRateBufferIndex]);
				
				//When the chart grows to 10 seconds, start cutting off the oldest sample to give the chart a sliding effect
				if (heartRateSamples.length > 100) {
					heartRateSamples.shift();
				}
			}
			
			msUntilNextHeartRateBufferFrame = 100;
		}
		
		//Always show from 0 to 10 seconds on the X axis
		if (heartRateSamples.length >= 100) {
			for (var i = 0; i < heartRateSamples.length; i++) {
				heartRateSamples[i].timestamp = Math.floor(i / (heartRateSamples.length - 1) * 10);
			}
		}
		
		//Only show every 5th timestamp 
		for (var i = 0; i < heartRateSamples.length; i++) {
			heartRateSamples[i].forceShow = heartRateSamples[i].timestamp % 5 == 0 && (i == 0 || heartRateSamples[i - 1].timestamp % 5 != 0);
		}
		
		breathRateChart.validateData();
		heartRateChart.validateData();
	}, updateFrequency);
}

function stopEventLoop() {
	clearInterval(chartUpdater);
	breathRateSamples.length = 0;
	heartRateSamples.length = 0;
	breathRateChart.validateData();
	heartRateChart.validateData();
}

window.onload = function() {
	var socket = io.connect();
	var id = "astronaut";
	var rtcConnection;
	
	socket.emit("get levels");
	
	socket.on("levels", function(levels) {
		$("#evaluateOxygenUse").click(function() {
			var averageOxygenUse = parseFloat($("#averageOxygenUse").val(), 10);
			
			if (averageOxygenUse < levels.oxygenUse["low"][1]) {
				$("#oxygenUseEvaluation").html("Lav");
			}
			else if (averageOxygenUse < levels.oxygenUse["medium"][1]) {
				$("#oxygenUseEvaluation").html("Middels");
			}
			else {
				$("#oxygenUseEvaluation").html("Høy");
			}			
		});
			
		$("#evaluateHeartRate").click(function() {
			var averageHeartBeat = parseFloat($("#averageHeartBeat").val(), 10);
			
			if (averageHeartBeat < levels.heartRate["low"][1]) {
				$("#heartRateEvaluation").html("Lav");
			}
			else if (averageHeartBeat < levels.heartRate["normal"][1]) {
				$("#heartRateEvaluation").html("Normal");
			}
			else {
				$("#heartRateEvaluation").html("Høy");
			}			
		});	
	});
	
	socket.emit("get mission time left");
	
	//Check if the mission has already started
	socket.on("mission time left", function(timeLeft) {
		if (timeLeft > 0) {
			startMissionTimer(Math.floor(timeLeft / 1000 / 60));
			socket.emit("get ranges");
			
			socket.on("ranges", function(ranges) {
				createBreathRateSamples(ranges.respiration);
				createHeartRateSamples(ranges.heartRate);
				startEventLoop();
			});
		}
	});
	
	socket.on("change heart rate", function(heartRate) {
		console.log("Changing heart rate to " + heartRate + " BPM");
		createHeartRateSamples(heartRate);
	});
	
	socket.on("change respiration", function(respiration) {
		console.log("Changing respiration rate to " + respiration + " breaths per minute");
		createBreathRateSamples(respiration);
	});
	
	socket.on("mission started", function(missionLength) {
		console.log("Mission started");
		startMissionTimer(Math.floor(missionLength / 1000 / 60));
		startEventLoop();
	});
	
	socket.on("mission stopped", function() {
		console.log("Mission stopped");
		stopEventLoop();
		stopMissionTimer();
	});
	
	$("#callSecurityTeam").click(function() {
		rtcConnection = rtc.connect(id, "security", socket, $("#localVideo")[0], $("#remoteVideo")[0]);
		rtcConnection.call();
		$("#callSecurityTeam").hide();
		$("#hangUp").show();
	});
	
	$("#hangUp").click(function() {
		if (rtcConnection) {
			rtcConnection.disconnect();
			rtcConnection = undefined;
			$("#callSecurityTeam").show();
			$("#hangUp").hide();
		}
	});
};