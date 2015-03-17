const AppDispatcher = require('./appdispatcher'),
    constants = require('./constants');

const actions = {

    startMission(data){
        AppDispatcher.dispatch({action : constants.MISSION_STARTED});
        actions.removeMessage(constants.NOT_READY_MSG);
        actions.changeRemainingTime(data.missionLength, constants.MISSION_STARTED);
    },

    stopMission(){
        AppDispatcher.dispatch({action : constants.MISSION_STOPPED});
        actions.changeRemainingTime(0, constants.MISSION_STOPPED);
    },

    changeRemainingTime(remainingTime, reason){
        AppDispatcher.dispatch({
                action: constants.REMAINING_MISSION_TIME_CHANGED,
                data : { remainingTime, reason }
            }
        );
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



};

window.__actions = actions;
module.exports = actions;