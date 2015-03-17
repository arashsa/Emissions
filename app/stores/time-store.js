/* A store that can be queried for the current path */

const AppDispatcher = require('../appdispatcher');
const BaseStore = require('./base-store');
const constants = require('../constants');


function create(opts) {

    var remainingTime = -123,
        intervalId;

    if (!opts.registerFunction) {
        throw new Error('Needs a "registerFunction" to register with AppDispatcher');
    }

    let timeStore = Object.assign(new BaseStore(), {

        handleRemainingTimeChanged(data) {
            remainingTime = data.remainingTime;
            this.emitChange();
        },

        getRemainingTime() {
            return remainingTime;
        },

        removeInterval() {
            clearInterval(intervalId);
        }


    }, opts);

    timeStore.dispatcherIndex = AppDispatcher.register(opts.registerFunction);

    intervalId = setInterval(function fn() {
        if (remainingTime >= 0) {
            timeStore.handleRemainingTimeChanged({remainingTime : remainingTime - 1});
        }
    }, 1000);

    return timeStore;
}

const TimeStore = create({
    registerFunction: function (payload) {
        var { action, data} = payload;

        switch (action) {

            case constants.REMAINING_MISSION_TIME_CHANGED:
                TimeStore.handleRemainingTimeChanged(data);
                break;
        }

        return true; // No errors. Needed by promise in Dispatcher.
    }
});

window.__TimeStore = TimeStore;
module.exports = {
    createNew: create,
    getMissionInstance() {
        return TimeStore
    }
};
