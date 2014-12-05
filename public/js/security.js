window.onload = function() {
	var socket = io.connect();
	var id = "security";
	var callerId;
	var pendingConnection; //An RTC connection that has not yet been answered
	var activeConnection; //An RTC connection where a call is currently ongoing
	
	socket.on('call', function(from, to) {
		if (to === id) {
			if (pendingConnection) {
				pendingConnection.disconnect();
			}
			
			callerId = from;
			pendingConnection = rtc.connect(id, callerId, socket, $("#localVideo")[0], $("#remoteVideo")[0]);
			
			pendingConnection.onCallStarted = function() {
				activeConnection = pendingConnection;
				pendingConnection = undefined;
				$("#localVideo").show();
				$("#remoteVideo").show();
			};
			
			pendingConnection.onCallEnded = function() {
				pendingConnection.onCallStarted = undefined;
				pendingConnection.onCallEnded = undefined;
				pendingConnection = undefined;
				$("#incomingCall").hide();
				
				if (!activeConnection) {
					$("#hangUp").hide();
				}
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
		if (activeConnection) {
			activeConnection.disconnect();
		}
		
		pendingConnection.onCallEnded = function() {
			activeConnection.onCallStarted = undefined;
			activeConnection.onCallEnded = undefined;
			activeConnection = undefined;
			$("#localVideo").hide();
			$("#remoteVideo").hide();
			$("#hangUp").hide();			
		};
		
		$("#incomingCall").hide();
		pendingConnection.answer();
	});
	
	$("#hangUp").click(function() {
		if (pendingConnection) {
			pendingConnection.disconnect();
		}
		else if (activeConnection) {
			activeConnection.disconnect();
		}
	});
};