var chart;
var videoUrl = "";
var badReceptionVideoUrl = "";
var receptionLevels;
var statuses = ["Aktiv", "Inaktiv", "Kobler til...", "Utilgjengelig"];
var satelites = [ {name: "Satelitt 1", receptionRange: [0, 0], reception: 92, color: "green", status: 0, msUntilConnected: 0, frequency: [2.3, 2.9]},
				  {name: "Satelitt 2", receptionRange: [0, 0], reception: 52, color: "yellow", status: 1, msUntilConnected: 0, frequency: [2.6, 3.2]},
				  {name: "Satelitt 3", receptionRange: [0, 0], reception: 85, color: "green", status: 1, msUntilConnected: 0, frequency: [3.8, 4.0]} ];
		 
function changeVideo(url) {
	$("#astronautVideo source").attr("src", url);
	$("#astronautVideo")[0].load();
}

//Configure the reception chart		 
AmCharts.ready(function() {
	chart = new AmCharts.AmSerialChart();
	
	chart.dataProvider = satelites;
	chart.categoryField = "name";
	
	//X axis
	var categoryAxis = chart.categoryAxis;
	categoryAxis.gridPosition = "start";
	
	//Y axis                
	var valueAxis = new AmCharts.ValueAxis();
	valueAxis.axisAlpha = 0;
	valueAxis.minimum = 0;
	valueAxis.maximum = 100;
	valueAxis.title = "Mottak";
	valueAxis.position = "left";
	chart.addValueAxis(valueAxis);
	
	//Line
	var graph = new AmCharts.AmGraph();
	graph.valueField = "reception";
	graph.colorField = "color";
	graph.lineAlpha = 0.2;
	graph.fillAlphas = 0.8;
	graph.type = "column";
	graph.showBalloon = false;
	chart.addGraph(graph);

	chart.write("chartdiv");
});

//Updates the satelite receptions and disables the video feed if the active satelite reception is too bad
function updateReception() {
	for (var i = 0; i < satelites.length; i++) {
		satelites[i].reception = Math.randomInt(satelites[i].receptionRange[0], satelites[i].receptionRange[1]);
		
		if (satelites[i].reception <= receptionLevels["weak"][1]) {
			//If the reception of the active satelite is weak, disable the video feed
			if (satelites[i].status === 0) {
				changeVideo(badReceptionVideoUrl);
			}
			
			satelites[i].color = "red";
			satelites[i].status = 3;
		}
		else if (satelites[i].reception <= receptionLevels["medium"][1]) {
			satelites[i].color = "yellow";
			if (satelites[i].status == 3) satelites[i].status = 1;
		}
		else {
			satelites[i].color = "green";
			if (satelites[i].status == 3) satelites[i].status = 1;
		}
	}
		
	chart.validateData();
	$("#satelite1Status").html(statuses[satelites[0].status]);
	$("#satelite2Status").html(statuses[satelites[1].status]);
	$("#satelite3Status").html(statuses[satelites[2].status]);
}

var chartUpdater;

function startEventLoop() {
	var updateFrequency = 2500;
	clearInterval(chartUpdater);
	updateReception();
	
	chartUpdater = setInterval(function() {
		for (var i = 0; i < satelites.length; i++) {
			//Set any satelites that are done connecting as active
			if (satelites[i].status === 2) {
				satelites[i].msUntilConnected -= updateFrequency;
				
				if (satelites[i].msUntilConnected <= 0) {
					satelites[i].status = 0;
					changeVideo(videoUrl);
				}
			}
		}
		
		updateReception();
	}, updateFrequency);
}

window.onload = function() {
	var socket = io.connect();
	var id = "communication";
	var rtcConnection;
	
	socket.emit("get levels");
	
	socket.on("levels", function(levels) {
		receptionLevels = levels.reception;
	});
	
	socket.emit("get mission time left");
	
	//Check if the mission has already started
	socket.on("mission time left", function(timeLeft) {
		if (timeLeft > 0) {
			startMissionTimer(Math.floor(timeLeft / 1000 / 60));
			socket.emit("get ranges");
			
			socket.on("ranges", function(ranges) {
				satelites[0].receptionRange = ranges.satelite1;
				satelites[1].receptionRange = ranges.satelite2;
				satelites[2].receptionRange = ranges.satelite3;
				startEventLoop();
			});
		}
	});
	
	socket.on("change reception", function(sateliteId, range) {
		satelites[sateliteId - 1].receptionRange = range;
		console.log("Reception range of satelite " + sateliteId + " changed to " + range);
	});
	
	socket.on("mission started", function(missionLength) {
		startMissionTimer(Math.floor(missionLength / 1000 / 60));
		console.log("Mission started");
		startEventLoop();
	});

	socket.on("mission stopped", function() {
		stopMissionTimer();
		console.log("Mission stopped");
		clearInterval(chartUpdater);
	});
	
	$("#callMissionCommander").click(function () {
		rtcConnection = rtc.connect(id, "commander", socket, $("#localVideo")[0], $("#commanderVideo")[0]);
		rtcConnection.call();
		$("#callMissionCommander").hide();
		$("#hangUp").show();
	});
	
	$("#hangUp").click(function() {
		if (rtcConnection) {
			rtcConnection.disconnect();
			rtcConnection = undefined;
			$("#callMissionCommander").show();
			$("#hangUp").hide();
		}
	});	
	
	//Disconnect from the currently active satelite and start connecting to a new one
	$("#connect").click(function() {
		var msToConnect = 5000;
		var frequency = parseFloat($("#frequencyInput").val(), 10);
		
		changeVideo(badReceptionVideoUrl);
		
		//Start connecting to the new satelite
		for (var i = 0; i < satelites.length; i++) {
			if (frequency >= satelites[i].frequency[0] && frequency <= satelites[i].frequency[1] && satelites[i].status == 1) {
				satelites[i].msUntilConnected = msToConnect;
				satelites[i].status = 2;
				break;
			}
		}
		
		//Disconnect from the old satelite (done in this order because some satelites have overlapping frequencies)
		for (var i = 0; i < satelites.length; i++) {
			if (satelites[i].msUntilConnected !== msToConnect && satelites[i].status !== 3) {
				satelites[i].status = 1;
			}
		}
		
		$("#satelite1Status").html(statuses[satelites[0].status]);
		$("#satelite2Status").html(statuses[satelites[1].status]);
		$("#satelite3Status").html(statuses[satelites[2].status]);
	});
	
	//Changes the currently playing astronaut video if we are connected to a satelite
	socket.on("change video", function(url) {
		var activeSateliteExists = false;
		videoUrl = url;
		
		for (var i = 0; i < satelites.length; i++) {
			if (satelites[i].status == 0) {
				activeSateliteExists = true;
				break;
			}
		}
		
		if (activeSateliteExists) {
			changeVideo(videoUrl);
		}
	});
};