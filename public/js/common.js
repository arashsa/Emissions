var missionTimeUpdater;

function startMissionTimer(missionTime) {
	var updateMissionTime = function() {
		if (missionTime > 0) {
			$("#missionTime").html(missionTime + " minutter igjen av oppdraget");
		}
		else {
			stopMissionTimer();
		}
		
		missionTime--;
	}
	
	clearInterval(missionTimeUpdater);
	missionTimeUpdater = setInterval(updateMissionTime, 1000 * 60);
	updateMissionTime();
};

function stopMissionTimer() {
	clearInterval(missionTimeUpdater);
	$("#missionTime").html("Oppdraget er ferdig");
}