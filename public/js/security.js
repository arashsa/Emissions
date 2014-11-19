window.onload = function() {
	var socket = io.connect();
	var id = "security";
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
	
	$("#answerButton").click(function() {
		$("#incomingCall").hide();
		rtc.connect(id, callerId, socket, $("#localVideo")[0], $("#remoteVideo")[0]);
		rtc.call();
	});
};