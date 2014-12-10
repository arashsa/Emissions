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
	
	oxygenRemaining = 100;
	oxygenSamples.length = 0;
	
	//Create the red guide line that goes from 100% oxygen to 0% oxygen
	oxygenSamples[0] = {timestamp: missionLength, oxygen: 100, guide: 100};
	oxygenSamples[missionLength - 1] = {timestamp: 0, guide: 0};
	
	//Create one empty data point per minute
	for (var i = 1; i < missionLength - 1; i++) {
		oxygenSamples[i] = {timestamp: missionLength - i};
	}
	
	chart.validateData();
	
	chartUpdater = setInterval(function() {
		var oxygenUse = Math.randomInt(oxygenUseRange[0], oxygenUseRange[1]);
		
		missionTime++;
		oxygenRemaining -= oxygenUse;
		
		oxygenSamples[missionTime].oxygen = oxygenRemaining;
		
		chart.validateData();
	}, updateFrequency);
}

function stopEventLoop() {
	clearInterval(chartUpdater);
}

window.onload = function() {
	var socket = io.connect();
	var id = "security";
	
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