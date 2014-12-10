var socket = io.connect();
var chart;
var oxygenUseRange = [0, 0];
var oxygenRemaining = 100;
var missionTime = 0;
var missionLength;
var oxygenSamples = [];

//Configure the graph displaying oxygen remaining
AmCharts.ready(function() {
	chart = new AmCharts.AmSerialChart();
	
	chart.dataProvider = oxygenSamples;
	chart.categoryField = "timestamp";
	
	//X axis
	var categoryAxis = chart.categoryAxis;
	categoryAxis.dashLength = 1;
	categoryAxis.gridAlpha = 0.15;
	categoryAxis.axisColor = "#DADADA";
	categoryAxis.title = "Gjenværende tid";
	
	//Y axis                
	var valueAxis = new AmCharts.ValueAxis();
	valueAxis.axisAlpha = 0.2;
	valueAxis.dashLength = 1;
	valueAxis.minimum = 0;
	valueAxis.maximum = 100;
	valueAxis.title = "Gjenværende oksygen";
	chart.addValueAxis(valueAxis);
	
	//Red line
	var redGraph = new AmCharts.AmGraph();
	redGraph.valueField = "guide";
	redGraph.lineThickness = 1.5;
	redGraph.lineColor = "red";
	chart.addGraph(redGraph);
	
	//Blue line
	var graph = new AmCharts.AmGraph();
	graph.valueField = "oxygen";
	graph.type = "smoothedLine";
	graph.lineThickness = 1.5;
	graph.lineColor = "blue";
	chart.addGraph(graph);
	
	chart.write("oxygenChart");
});

var chartUpdater;

//Adds the remaining oxygen to the chart once a minute
function startEventLoop() {
	var updateFrequency = 60000;
	var startTime = Date.now();
	
	oxygenSamples.length = 0;
	
	//Create the red guide line that goes from 100% oxygen to 0% oxygen
	oxygenSamples[0] = {timestamp: missionLength, oxygen: oxygenRemaining, guide: oxygenRemaining};
	oxygenSamples[missionLength - 1] = {timestamp: 0, guide: 0};
	
	//Create one empty data point per minute
	for (var i = 1; i < missionLength - 1; i++) {
		oxygenSamples[i] = {timestamp: missionLength - i};
	}
	
	chart.validateData();

	chartUpdater = setInterval(function() {
		var oxygenUse = Math.randomInt(oxygenUseRange[0], oxygenUseRange[1]);
		
		oxygenRemaining -= oxygenUse;
		missionTime++;
		
		oxygenSamples[missionTime].oxygen = oxygenRemaining;
		
		chart.validateData();
		
		//The server has to remember the oxygen remaining in case the security window is closed during the mission
		socket.emit("set oxygen remaining", oxygenRemaining);
	}, updateFrequency);
}

function stopEventLoop() {
	clearInterval(chartUpdater);
}

window.onload = function() {
	var id = "security";
	
	socket.emit("get mission time left");
	
	//Check if the mission has already started
	socket.on("mission time left", function(timeLeft) {
		if (timeLeft > 0) {
			missionLength = Math.floor(timeLeft / 1000 / 60);
			startMissionTimer(missionLength);
			socket.emit("get ranges");
			
			socket.on("ranges", function(ranges) {
				oxygenUseRange = ranges.oxygenUse;
				socket.emit("get oxygen remaining");
				
				socket.on("oxygen remaining", function(oxygen) {
					oxygenRemaining = oxygen;
					chart.valueAxes[0].maximum = oxygen;
					startEventLoop();
				});
			});
		}
	});
	
	socket.on("change oxygen use", function(range) {
		oxygenUseRange = range;
		console.log("Oxygen use range changed to " + range);
	});
	
	socket.on("mission started", function(length) {
		missionLength = Math.floor(length / 1000 / 60);
		startMissionTimer(missionLength);
		startEventLoop();
		console.log("Mission started");
	});
	
	socket.on("mission stopped", function() {
		stopEventLoop();
		stopMissionTimer();
		console.log("Mission stopped");
	});
	
	socket.on("mission length changed", function(length) {
		startMissionTimer(Math.floor(length / 1000 / 60));
	});
	
	rtcHelper.id = id;
	rtcHelper.socket = socket;

	socket.on('call', rtcHelper.onIncomingCall);

	$("#answerButton").click(rtcHelper.answerIncomingCall);

	$("#callMissionCommander").click(function() {
		rtcHelper.call("commander");
	});

	$("#callCommunicationTeam").click(function() {
		rtcHelper.call("communication");
	});
	
	$("#hangUp").click(rtcHelper.hangUp);
};