/* A store that can be queried for the current path */

const { Emitter } = require('events');
const AppDispatcher = require('../appdispatcher');
const BaseStore = require('./base-store');
const { MISSION_STARTED_EVENT,MISSION_STOPPED_EVENT, RECEIVED_APP_STATE } =  require('../constants/MissionConstants');

var missionRunning = false, missionHasBeenStopped = false;

var MissionStateStore = Object.assign(new BaseStore(), {

    handleMissionStarted() {
        missionRunning = true;
        this.emitChange();
    },

    handleMissionStopped() {
        missionRunning = false;
        this.emitChange();
    },

    isMissionRunning() {
        return missionRunning;
    },

    isMissionStopped() {
        return missionHasBeenStopped;
    },

    dispatcherIndex: AppDispatcher.register(function (payload) {
        var { action} = payload;

        switch (action) {
            case MISSION_STARTED_EVENT:
                return MissionStateStore.handleMissionStarted();

            case MISSION_STOPPED_EVENT:
                return MissionStateStore.handleMissionStopped();

            case RECEIVED_APP_STATE:
                missionRunning = payload.appState.mission_running;
                return MissionStateStore.emitChange();
        }

        return true; // No errors. Needed by promise in Dispatcher.
    })

});

window.__MissionStateStore = MissionStateStore;
module.exports = MissionStateStore;
