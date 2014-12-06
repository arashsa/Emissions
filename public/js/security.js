window.onload = function() {
	var socket = io.connect();
	var id = "security";
	
	rtcHelper.id = id;
	rtcHelper.socket = socket;

	socket.on('call', rtcHelper.onIncomingCall);

	$("#answerButton").click(rtcHelper.answerIncomingCall);

	$("#callSecurityTeam").click(function() {
		rtcHelper.call("security");
	});

	$("#hangUp").click(rtcHelper.hangUp);
};