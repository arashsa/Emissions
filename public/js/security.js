var socket = io.connect();
var chart;
var oxygenUseRange = [0, 0];
var oxygenRemaining = 100;
var co2Level = 0;
var missionTime = 0;
var scrubFilterChangedTimestamp = 0;
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
	
	$("#co2Level").html(Math.floor(co2Level) + "%");

	chartUpdater = setInterval(function() {
		var oxygenUse = Math.randomInt(oxygenUseRange[0], oxygenUseRange[1]);
		
		oxygenRemaining -= oxygenUse;
		missionTime++;
		
		oxygenSamples[missionTime].oxygen = oxygenRemaining;
		
		chart.validateData();
		
		//Changing the scrub filter resets the co2 level. This should only be done once per mission, so make the co2 level reach critical levels (25%) when the mission is halfway done
		co2Level = (missionTime - scrubFilterChangedTimestamp) / missionLength * 50;
		
		if (co2Level > 100) {
			co2Level = 100;
		}
		
		$("#co2Level").html(Math.floor(co2Level) + "%");
		
		//The server has to remember the oxygen remaining and co2 level in case the security window is closed during the mission
		socket.emit("set oxygen remaining", oxygenRemaining);
		socket.emit("set co2 level", co2Level);
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
					socket.emit("get co2 level");
					
					socket.on("co2 level", function(co2) {
						co2Level = co2;
						
						startEventLoop();
					});
				});
			});
		}
	});

	socket.emit("is scrub filter changed");
	
	socket.on("scrub filter changed", function(scrubFilterChanged) {
		$("#changeScrubFilter").prop("disabled", scrubFilterChanged);
	});
	
	socket.on("change oxygen use", function(range) {
		oxygenUseRange = range;
		console.log("Oxygen use range changed to " + range);
	});
	
	socket.on("mission started", function(length) {
		missionLength = Math.floor(length / 1000 / 60);
		startMissionTimer(missionLength);
		$("#changeScrubFilter").prop("disabled", false);
		$("#runSateliteTests").hide();
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
	
	socket.on("job finished", function() {
		$("#runSateliteTests").show();
	});
	
	//Reset the co2 level when changing the scrub filter
	$("#changeScrubFilter").click(function() {
		$("#changeScrubFilter").prop("disabled", true);
		socket.emit("set scrub filter changed");
		scrubFilterChangedTimestamp = missionTime;
		co2Level = 0;
		$("#co2Level").html("0%");
		socket.emit("set co2 level", co2Level);
	});
	
	var testingProgress = 0;
	
	$("#runSateliteTests").click(function() {
		if (testingProgress == 0) {
			$("#communicationStatus").html("Tester status...");
			
			setTimeout(function() {
				$("#communicationStatus").html("Status OK");
				$("#runSateliteTests").html("Test datakvalitet");
				testingProgress++;
			}, 3000);
		}
		else {
			$("#communicationStatus").html("Tester datakvalitet...");
			
			setTimeout(function() {
				//As specified in the requirements, the data quality test will fail the first time it is run and succeed the second time
				if (testingProgress == 1) {
					$("#communicationStatus").html("Signal for svakt. Prøv igjen.");
				}
				else {
					$("#communicationStatus").html("Datakvalitet OK");
				}
				
				testingProgress++;
			}, 3000);
		}
	});
	
	rtcHelper.id = id;
	rtcHelper.socket = socket;

	socket.on("call", rtcHelper.onIncomingCall);

	$("#answerButton").click(rtcHelper.answerIncomingCall);

	$("#callMissionCommander").click(function() {
		rtcHelper.call("commander");
	});

	$("#callCommunicationTeam").click(function() {
		rtcHelper.call("communication");
	});
	
	$("#hangUp").click(rtcHelper.hangUp);
};