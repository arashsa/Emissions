/* A singleton store that can be queried for remaining time */

const AppDispatcher = require('../appdispatcher');
const BaseStore = require('./base-store');
const constants = require('../constants');

// keeping state hidden in the module
var remainingTime = {},
    intervalId = {};


function reset(timerId) {
    stop(timerId);
    start(timerId);
    remainingTime[timerId] = constants.TIME_UNSET;
}

function start(timerId) {
    intervalId[timerId] = setInterval(function fn() {
        if (remainingTime[timerId] >= 0) {
            remainingTime[timerId]--;
            TimerStore.emitChange();
        }
    }, 1000);
}

function stop(timerId) {
    clearInterval(intervalId[timerId]);
    delete intervalId[timerId];
    TimerStore.emitChange();
}

/**
 * @param data.remainingTime {Number}
 * @param data.timerId {string}
 */
function handleRemainingTimeChanged(data) {
    var remaining = data.remainingTime;
    if (remaining <= 0) throw new TypeError('Got invalid remaining time :' + remaining);

    remainingTime[data.timerId] = remaining;
    TimerStore.emitChange();
}

function assertExists(timerId) {
    if (!remainingTime[timerId]) {
        throw new TypeError('No time set for timer with id ' + timerId);
    }
}

const TimerStore = Object.assign(new BaseStore(), {

    getRemainingTime(timerId) {
        return remainingTime[timerId] || constants.TIME_UNSET;
    },

    isRunning(timerId) {
        return !!intervalId[timerId];
    },

    dispatcherIndex: AppDispatcher.register(function (payload) {
        var { action, data} = payload;

        switch (action) {

            case constants.SET_TIMER:
                handleRemainingTimeChanged(data);
                break;

            case constants.START_TIMER:
                assertExists(data.timerId);

                // avoid setting up more than one timer
                if(!TimerStore.isRunning(data.timerId)){
                    start(data.timerId);
                }
                break;

            case constants.STOP_TIMER:
                assertExists(data.timerId);
                stop(data.timerId);
                break;
        }

        return true; // No errors. Needed by promise in Dispatcher.
    })

});

window.__TimeStore = TimerStore;
module.exports = TimerStore;
