window.onload = function() {
	var socket = io.connect();
	var id = "security";
	var rtcConnection;
	var callerId;
	
	socket.on('call', function(from, to) {
		if (to === id) {
			callerId = from;
			
			if (callerId === "astronaut") {
				$("#callerId").html("Astronaut-teamet ringer");
				$("#incomingCall").show();
			}
			else if (callerId === "science") {
				$("#callerId").html("Science-teamet ringer");
				$("#incomingCall").show();	
			}
		}
	});
	
	var rtcConnection;
	
	$("#answerButton").click(function() {
		$("#incomingCall").hide();
		$("#hangUp").show();
		rtcConnection = rtc.connect(id, callerId, socket, $("#localVideo")[0], $("#remoteVideo")[0]);
		rtcConnection.answer();
	});
	
	$("#hangUp").click(function() {
		if (rtcConnection) {
			rtcConnection.disconnect();
			rtcConnection = undefined;
			$("#hangUp").hide();
		}
	});
};