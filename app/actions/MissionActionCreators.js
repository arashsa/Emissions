const AppDispatcher = require('../appdispatcher'),
    MissionConstants = require('../constants/MissionConstants'),
    router = require('./../router-container');

// lazy load due to circular dependencies
const serverAPI = (function() {
    var api;

    return function() {
        if(!api) {
            api = require('../client-api');
        }
        return api;
    }
})();

var tmp = {

    startMission(){
      serverAPI().startMission();
    },

    stopMission(){
        serverAPI().stopMission();
    },

    missionStarted() {
        AppDispatcher.dispatch({action: MissionConstants.MISSION_STARTED_EVENT});
    },

    missionStopped() {
        AppDispatcher.dispatch({action: MissionConstants.MISSION_STOPPED_EVENT});
    },

    missionCompleted() {
        AppDispatcher.dispatch({action: MissionConstants.MISSION_COMPLETED_EVENT});
    },

    introWasRead(teamId) {
        AppDispatcher.dispatch({action: MissionConstants.INTRODUCTION_READ, teamName: teamId});
        serverAPI().sendTeamStateChange(teamId);
    },

    taskCompleted(teamId, taskId)   {
        AppDispatcher.dispatch({action: MissionConstants.COMPLETED_TASK, taskId, teamId});
    },

    // sync mission time with signal from server
    syncMissionTime(elapsedSeconds){
        AppDispatcher.dispatch({
            action: MissionConstants.MISSION_TIME_SYNC,
            data: {elapsedMissionTime: elapsedSeconds}
        });

    }

};

window.__MissionAC = tmp;
module.exports = tmp;
