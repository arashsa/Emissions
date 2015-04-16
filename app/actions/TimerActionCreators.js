const AppDispatcher = require('../appdispatcher');
const constants = require('../constants/TimerConstants');

const actions = {

    startTimer(id) {
        AppDispatcher.dispatch({action: constants.START_TIMER, data: {timerId: id}});
    },

    resetTimer(id) {
        AppDispatcher.dispatch({action: constants.RESET_TIMER, data: {timerId: id}});
    },

    stopTimer(id) {
        AppDispatcher.dispatch({action: constants.STOP_TIMER, data: {timerId: id}});
    },

    setTimer(timerId, time) {
        AppDispatcher.dispatch({
            action: constants.SET_TIMER,
            data: {
                remainingTime: time,
                timerId
            }
        });
    }

};

module.exports = actions;