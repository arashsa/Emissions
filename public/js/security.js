window.onload = function() {
	var socket = io.connect();
	var id = "security";
	var rtcConnection;
	var callerId;
	
	socket.on('call', function(from, to) {
		if (to === id) {
			callerId = from;
			rtcConnection = rtc.connect(id, callerId, socket, $("#localVideo")[0], $("#remoteVideo")[0]);
			
			rtcConnection.onCallStarted = function() {
				$("#localVideo").show();
				$("#remoteVideo").show();			
			};
			
			rtcConnection.onCallEnded = function() {
				rtcConnection = undefined;
				$("#incomingCall").hide();
				$("#hangUp").hide();
				$("#localVideo").hide();
				$("#remoteVideo").hide();	
			};
			
			$("#hangUp").show();
			$("#incomingCall").show();
			
			if (callerId === "astronaut") {
				$("#callerId").html("Astronaut-teamet ringer");
			}
			else if (callerId === "science") {
				$("#callerId").html("Science-teamet ringer");
			}
		}
	});
	
	$("#answerButton").click(function() {
		$("#incomingCall").hide();
		rtcConnection.answer();
	});
	
	$("#hangUp").click(function() {
		if (rtcConnection) {
			rtcConnection.disconnect();
		}
	});
};