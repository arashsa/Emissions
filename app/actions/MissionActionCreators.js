const MessageActionCreators = require('./MessageActionCreators'),
    AppDispatcher = require('../appdispatcher'),
    MissionConstants = require('../constants/MissionConstants'),
    MessageConstants = require('../constants/MessageConstants'),
    router = require('./../router-container');


const actions = {

    startMission() {
        MessageActionCreators.removeMessage(MessageConstants.NOT_READY_MSG);
        AppDispatcher.dispatch({action: MissionConstants.MISSION_STARTED_EVENT});
    },

    stopMission() {
        AppDispatcher.dispatch({action: MissionConstants.MISSION_STOPPED_EVENT});
    },


    /**
     *
     * @param to {String} absolute or relative path or path-name
     * @param param params if given path-name
     *
     * @example
     * transitionTo('/science/task')
     * transitionTo('team-task',{teamId : 'science'})
     *
     * Or when already in /science
     * transitionTo('task') => /science/task
     */
    //transitionTo(to, param, query) {
    //    router.transitionTo(to, param, query);
    //},

    introWasRead(teamId) {
        AppDispatcher.dispatch({action: MissionConstants.INTRODUCTION_READ, teamName: teamId});
    },

    taskCompleted(taskId)   {
        AppDispatcher.dispatch({action: MissionConstants.COMPLETED_TASK, taskId});
    },

    // sync mission time with signal from server
    syncMissionTime(elapsedSeconds){
        AppDispatcher.dispatch({
            action: MissionConstants.MISSION_TIME_SYNC,
            data: {elapsedMissionTime: elapsedSeconds}
        });

    }

};

module.exports = actions;
