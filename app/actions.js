const AppDispatcher = require('./appdispatcher'),
    { format } = require('util'),
    constants = require('./constants'),
    router = require('./router-container');

function addStub(name, stub) {
    actions[name] = () => {
        console.log(format('[UNIMPLEMENTED] %s(%s)', name, arguments.join(',')));
        stub && stub(...arguments);
    }
}

var actions = {

    /**
     *
     * @param path {String} absolute or relative
     *
     * @example
     * transitionTo('/science/task')
     *
     * Or when already in /science
     * transitionTo('task') => /science/task
     */
    transitionTo(path) {
        router.transitionTo(path);
    },

    /** @param data.missionLength */
    startMission(data) {
        actions.setMissionTime(data.missionLength);
        AppDispatcher.dispatch({action: constants.MISSION_STARTED_EVENT});
        actions.startTimer(constants.MISSION_TIMER_ID);
        actions.removeMessage(constants.NOT_READY_MSG);
    },

    startTimer(id) {
        AppDispatcher.dispatch({action: 'START_TIMER', data: {timerId: id}});
    },

    resetTimer(id) {
        AppDispatcher.dispatch({action: 'RESET_TIMER', data: {timerId: id}});
    },

    stopTimer(id) {
        AppDispatcher.dispatch({action: 'STOP_TIMER', data: {timerId: id}});
    },

    endMission() {
        AppDispatcher.dispatch({action: constants.MISSION_STOPPED_EVENT});
        //actions.setMissionTime(0);
    },

    setMissionTime(remainingTime) {
        actions.setTimer(constants.MISSION_TIMER_ID, remainingTime);
    },

    setTimer(timerId, time) {
        AppDispatcher.dispatch({
            action: constants.SET_TIMER,
            data: {
                remainingTime: time,
                timerId
            }
        });
    },

    addMessage(msg) {
        AppDispatcher.dispatch({
                action: constants.MESSAGE_ADDED,
                data: msg
            }
        );
    },

    removeMessage(id) {
        AppDispatcher.dispatch({
                action: constants.REMOVE_MESSAGE,
                data: id
            }
        );
    },

    takeRadiationSample() {
        AppDispatcher.dispatch({
            action: constants.SCIENCE_TAKE_RADIATION_SAMPLE
        })
    }
};

// dummy return 400 seconds remaining
addStub('askServerForRemainingTime', () => {
    AppDispatcher.dispatch({
        action: constants.REMAINING_MISSION_TIME_CHANGED,
        data: 400
    })
});

Object.freeze(actions);

window.__actions = actions;
module.exports = actions;