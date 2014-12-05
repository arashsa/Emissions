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
			$("#callerId").html(callerId.charAt(0).toUpperCase() + callerId.slice(1) + "-teamet ringer");
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
		activeConnection = pendingConnection;
		pendingConnection = undefined;
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