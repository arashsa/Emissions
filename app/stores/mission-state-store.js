/* A store that can be queried for the current path */

const { Emitter } = require('events');
const AppDispatcher = require('../appdispatcher');
const BaseStore = require('./base-store');
const { MISSION_STARTED_EVENT,MISSION_STOPPED_EVENT, RECEIVED_APP_STATE } =  require('../constants/MissionConstants');

var missionRunning = false, missionHasBeenStopped = false;
var currentChapter = null;
var chapterTime = 0;
var inSafeMode = false;

var MissionStateStore = Object.assign(new BaseStore(), {

    handleMissionStarted() {
        missionRunning = true;
        this.emitChange();
    },

    handleMissionStopped() {
        missionRunning = false;
        this.emitChange();
    },

    isSatelliteInSafeMode(){
        return inSafeMode;
    },

    isMissionRunning() {
        return missionRunning;
    },

    isMissionStopped() {
        return missionHasBeenStopped;
    },

    currentChapter(){
        return currentChapter;
    },

    chapterTime(){
        return chapterTime;
    },

    dispatcherIndex: AppDispatcher.register(function (payload) {
        var { action} = payload;

        switch (action) {
            case MISSION_STARTED_EVENT:
                return MissionStateStore.handleMissionStarted();

            case MISSION_STOPPED_EVENT:
                return MissionStateStore.handleMissionStopped();

            case RECEIVED_APP_STATE:
                let appState = payload.appState;
                missionRunning = appState.mission_running;
                currentChapter = appState.current_chapter;
                chapterTime = appState.elapsed_chapter_time;
                inSafeMode = appState.satellite_in_safe_mode;
                return MissionStateStore.emitChange();
        }

        return true; // No errors. Needed by promise in Dispatcher.
    })

});

window.__MissionStateStore = MissionStateStore;
module.exports = MissionStateStore;
