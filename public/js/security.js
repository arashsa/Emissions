window.onload = function() {
	var socket = io.connect();
	var id = "security";
	
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