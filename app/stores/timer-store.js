/* A singleton store that can be queried for remaining time */

const check = require('check-types');
const AppDispatcher = require('../appdispatcher');
const BaseStore = require('./base-store');
const TimerConstants = require('../constants/TimerConstants');
const MissionConstants = require('../constants/MissionConstants');


// keeping state hidden in the module
var remainingTime = {},
    initialTime = {},
    intervalId = {},
    elapsedMissionTime = 0,
    missionTimer = null;


function reset(timerId) {
    stop(timerId);
    remainingTime[timerId] = initialTime[timerId];
}

function start(timerId) {
    assertExists(timerId);

    intervalId[timerId] = setInterval(function fn() {
        if (remainingTime[timerId] > 0) {
            remainingTime[timerId]--;
            TimerStore.emitChange();
        } else {
            stop(timerId);
        }
    }, 1000);
}

function stop(timerId) {
    assertExists(timerId);

    clearInterval(intervalId[timerId]);
    delete intervalId[timerId];
    TimerStore.emitChange();
}

function startMissionTimer(){
    stopMissionTimer();
    missionTimer = setInterval(()=>{
        elapsedMissionTime++;
        TimerStore.emitChange();
    },1000);
}

function stopMissionTimer(){
    clearInterval(missionTimer);
}


/**
 * @param data.remainingTime {Number}
 * @param data.timerId {string}
 */
function handleRemainingTimeChanged(data) {
    var remaining = data.remainingTime;
    if (remaining <= 0) throw new TypeError('Got invalid remaining time :' + remaining);

    remainingTime[data.timerId] = remaining;
    initialTime[data.timerId] = remaining;
    TimerStore.emitChange();
}

function assertExists(timerId) {
    check.assert(timerId in remainingTime, 'No time set for timer with id ' + timerId);
}

const TimerStore = Object.assign(new BaseStore(), {
    
    getRemainingTime(timerId) {
        check.number(timerId);
        return remainingTime[timerId];
    },

    isRunning(timerId) {
        check.number(timerId);
        return !!intervalId[timerId];
    },

    /**
     * The timer is set (or has been reset), but not started
     * @param timerId
     * @returns true if ready, false if running or timed out
     */
    isReadyToStart(timerId) {
        check.number(timerId);
        
        if(this.isRunning(timerId)) return false;
        return this.getRemainingTime(timerId) > 0;
    },

    getElapsedMissionTime() {
        return elapsedMissionTime;
    },

    dispatcherIndex: AppDispatcher.register(function (payload) {
        var { action, data} = payload;

        switch (action) {

            case TimerConstants.SET_TIMER:
                handleRemainingTimeChanged(data);
                break;

            case TimerConstants.START_TIMER:
                assertExists(data.timerId);

                // avoid setting up more than one timer
                if(!TimerStore.isRunning(data.timerId)){
                    start(data.timerId);
                }
                break;

            case TimerConstants.STOP_TIMER:
                stop(data.timerId);
                break;

            case TimerConstants.RESET_TIMER:
                reset(data.timerId);
                break;

            case MissionConstants.MISSION_STARTED_EVENT:
                startMissionTimer();
                break;

            case MissionConstants.MISSION_STOPPED_EVENT:
                stopMissionTimer();
                break;

            case MissionConstants.RECEIVED_APP_STATE:
                var appState = payload.appState;

                elapsedMissionTime = appState.elapsed_mission_time;

                if(appState.mission_running) {
                    startMissionTimer();
                } else {
                    stopMissionTimer();
                }

                TimerStore.emitChange();
                break;

            case MissionConstants.MISSION_TIME_SYNC:
                elapsedMissionTime  = data.elapsedMissionTime;
                TimerStore.emitChange();
                break;
        }

        return true; // No errors. Needed by promise in Dispatcher.
    })

});

window.__TimeStore = TimerStore;
module.exports = TimerStore;
