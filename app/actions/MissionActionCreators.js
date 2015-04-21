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
        //AppDispatcher.dispatch({action: MissionConstants.MISSION_COMPLETED_EVENT});
        router.transitionTo('/completed');
    },

    completeMission(){
        serverAPI().completeMission();
    },

    receivedEvents(eventsCollection){
        AppDispatcher.dispatch(Object.assign({}, eventsCollection, {action: MissionConstants.RECEIVED_EVENTS}));
    },

    askForEvents(){
        serverAPI().askForEvents();
    },

    introWasRead(teamId) {
        AppDispatcher.dispatch({action: MissionConstants.INTRODUCTION_READ, teamName: teamId});
        serverAPI().sendTeamStateChange();
    },

    changeScrubber(){
        serverAPI().askToChangeScrubFilter();
    },

    startTask(teamId, taskId){
        AppDispatcher.dispatch({action: MissionConstants.START_TASK, teamId, taskId});
        serverAPI().sendTeamStateChange();
    },

    taskCompleted(teamId, taskId)   {
        AppDispatcher.dispatch({action: MissionConstants.COMPLETED_TASK, taskId, teamId});
        serverAPI().sendTeamStateChange();

        // also publish this to server as separate event? - maybe to trigger something at certain point?
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
