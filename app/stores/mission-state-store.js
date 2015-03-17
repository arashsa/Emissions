/* A store that can be queried for the current path */

const { Emitter } = require('events');
const AppDispatcher = require('../appdispatcher');
const BaseStore = require('./base-store');
const { MISSION_STARTED,MISSION_STOPPED, NOT_READY_MSG  } =  require('../constants');
const actions = require('../actions');

var missionRunning = false, missionHasBeenStopped = false;

var MissionStateStore = Object.assign(new BaseStore(), {

    handleMissionStarted() {
        missionRunning = true;
        missionHasBeenStopped = false;

        this.emit('change');
    },

    handleMissionStopped() {
        missionRunning = false;
        missionHasBeenStopped = true;
        this.emit('change');
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
            case MISSION_STARTED:
                return MissionStateStore.handleMissionStarted();

            case MISSION_STOPPED:
                return MissionStateStore.handleMissionStopped();
        }

        return true; // No errors. Needed by promise in Dispatcher.
    })

});

window.MissionStateStore = MissionStateStore;
module.exports = MissionStateStore;
