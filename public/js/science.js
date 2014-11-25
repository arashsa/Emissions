var chart;
var radiationRange = [0, 0];
var radiationSamples = [];

//Configure the radiation graph
AmCharts.ready(function() {
	chart = new AmCharts.AmSerialChart();
	
	chart.marginTop = 20;
	chart.marginRight = 10;
	chart.autoMarginOffset = 5;
	chart.dataProvider = radiationSamples;
	chart.categoryField = "timestamp";
	
	//X axis
	var categoryAxis = chart.categoryAxis;
	categoryAxis.dashLength = 1;
	categoryAxis.gridAlpha = 0.15;
	categoryAxis.axisColor = "#DADADA";
	categoryAxis.title = "Seconds";
	
	//Y axis                
	var valueAxis = new AmCharts.ValueAxis();
	valueAxis.axisAlpha = 0.2;
	valueAxis.dashLength = 1;
	valueAxis.title = "μSv/h";
	chart.addValueAxis(valueAxis);
	
	//Line
	var graph = new AmCharts.AmGraph();
	graph.valueField = "radiation";
	graph.bullet = "round";
	graph.bulletBorderColor = "#FFFFFF";
	graph.bulletBorderThickness = 2;
	graph.lineThickness = 2;
	graph.lineColor = "#b5030d";
	graph.negativeLineColor = "#228B22";
	graph.negativeBase = 60;
	graph.hideBulletsCount = 50;
	chart.addGraph(graph);
	
	//Mouseover
	chartCursor = new AmCharts.ChartCursor();
	chartCursor.cursorPosition = "mouse";
	chart.addChartCursor(chartCursor);

	chart.write("radiationChart");
});

var chartUpdater;

//Adds a new radiation sample to the chart every few seconds
function startEventLoop() {
	var updateFrequency = 2000;
	var startTime = Date.now();
	stopEventLoop();
	
	chartUpdater = setInterval(function() {
		var secondsPassed = (Date.now() - startTime) / 1000;

		var radiation = Math.randomInt(radiationRange[0], radiationRange[1]);
		radiationSamples.push({timestamp: Math.floor(secondsPassed + 0.5), radiation: radiation});
		
		//When the chart grows to 30 seconds, start cutting off the oldest sample to give the chart a sliding effect
		if (radiationSamples.length > 15) {
			radiationSamples.shift();
		}
		
		chart.validateData();
	}, updateFrequency);
}

function stopEventLoop() {
	clearInterval(chartUpdater);
	radiationSamples.length = 0;
	chart.validateData();
}

window.onload = function() {
	var id = "science";
	var socket = io.connect();
	var rtcConnection;
	
	socket.emit("get levels");
	
	socket.on("levels", function(levels) {
		$("#evaluate").click(function() {
			var averageRadiation = parseFloat($("#averageRadiation").val(), 10);
			
			if (averageRadiation < levels.radiation["low"][1]) {
				$("#evaluation").html("Lav");
			}
			else if (averageRadiation < levels.radiation["medium"][1]) {
				$("#evaluation").html("Middels");
			}
			else {
				$("#evaluation").html("Høy");
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
				radiationRange = ranges.radiation;
				startEventLoop();
			});
		}
	});
	
	socket.on("change radiation", function(range) {
		radiationRange = range;
		console.log("Radiation range changed to " + radiationRange);
	});
	
	socket.on("mission started", function(missionLength) {
		startMissionTimer(Math.floor(missionLength / 1000 / 60));
		startEventLoop();
		console.log("Mission started");
	});
	
	socket.on("mission stopped", function() {
		stopEventLoop();
		stopMissionTimer();
		console.log("Mission stopped");
	});
	
	var timerStarted = false;
	var timerValue = 30;

	$("#startTimer").click(function() {
		if (!timerStarted) {
			timerStarted = true;
			
			var timer = setInterval(function() {
				if (timerValue <= 0) {
					clearInterval(timer);
					timerStarted = false;
					timerValue = 30;
					$("#timer").html(timerValue);
				}
				else {
					timerValue--;
					$("#timer").html(timerValue);
				}
			}, 1000);
		}
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