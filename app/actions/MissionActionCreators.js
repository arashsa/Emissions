const AppDispatcher = require('../appdispatcher'),
    MissionConstants = require('../constants/MissionConstants'),
    router = require('./../router-container');

// lazy load due to circular dependencies
const serverAPI = (function () {
    var api;

    return function () {
        if (!api) {
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

    resetMission(){
        serverAPI().resetMission();
    },

    missionStarted() {
        AppDispatcher.dispatch({action: MissionConstants.MISSION_STARTED_EVENT});
    },

    missionStopped() {
        AppDispatcher.dispatch({action: MissionConstants.MISSION_STOPPED_EVENT});
    },

    missionWasReset(){
        AppDispatcher.dispatch({action: MissionConstants.MISSION_WAS_RESET});
        serverAPI().askForAppState();
    },

    missionCompleted() {
        AppDispatcher.dispatch({action: MissionConstants.MISSION_COMPLETED_EVENT});
    },

    receivedEvents(eventsCollection){
        AppDispatcher.dispatch(Object.assign({}, eventsCollection, {action: MissionConstants.RECEIVED_EVENTS}));
    },

    askForEvents(){
        serverAPI().askForEvents();
    },

    introWasRead(teamId) {
        AppDispatcher.dispatch({action: MissionConstants.INTRODUCTION_READ, teamName: teamId});
        serverAPI().sendTeamStateChange(teamId);
    },

    startTask(teamId, taskId){
        AppDispatcher.dispatch({action: MissionConstants.START_TASK, teamId, taskId});
        serverAPI().sendTeamStateChange(teamId);
    },

    taskCompleted(teamId, taskId)   {
        AppDispatcher.dispatch({action: MissionConstants.COMPLETED_TASK, taskId, teamId});
        serverAPI().sendTeamStateChange(teamId);
    },

    askToStartNextChapter(){
        serverAPI().askToStartNextChapter();
    },

    askToTriggerEvent(uuid){
        serverAPI().triggerEvent(uuid);
    },

    setMissionTime(elapsedSeconds){
        AppDispatcher.dispatch({
            action: MissionConstants.MISSION_TIME_SYNC,
            data: {elapsedMissionTime: elapsedSeconds}
        });

    }

};

window.__MissionAC = tmp;
module.exports = tmp;
