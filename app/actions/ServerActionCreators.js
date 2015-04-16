const AppDispatcher = require('./../appdispatcher'),
    io = require('socket.io'),
    socket = io(),
    { format } = require('util'),
    { uuid } = require('./../utils'),
    window = require('global/window'),
    TaskStore = require('./../stores/task-store'),
    Router = require('../router-container'),
    TimerStore = require('./../stores/timer-store'),
    MissionStore = require('./../stores/mission-state-store'),
    RadiationStore = require('./../stores/radiation-store'),
    IntroductionStore = require('./../stores/introduction-store'),
    constants = require('../constants/ServerConstants'),
    router = require('./../router-container');

function fetchFromLS(key) {
    let item = window.localStorage.getItem(key);
    if (item === undefined) return null;

    return JSON.parse(item);
}

function storeInLS(key, item) {
    window.localStorage.setItem(key, JSON.stringify(item));
}

function appStateReceived() {
    AppDispatcher.dispatch({
        action: constants.RECEIVED_APP_STATE, data: {
            mission_running: fetchFromLS('mission_running'),
            elapsed_mission_time : fetchFromLS('elapsed_mission_time'),
            science: fetchFromLS('science_state'),
            communication: null,
            security: null,
            astronaut: null,
            mc: null
        }
    });

}

/* This is only used before we have server communication up and running! */
TimerStore.addChangeListener(() => {
    var elapsedMissionTime = TimerStore.getElapsedMissionTime();

    // store elapsed mission time every 10 seconds
    if(elapsedMissionTime%10===0) {
        storeInLS('elapsed_mission_time', elapsedMissionTime);
    }
});

const actions = {

    /*
     * Send full app state (for the current team) to server on change
     * BEWARE: ONLY USING LOCAL STORAGE UNTIL SERVER COMMUNICATION IS UP AND RUNNING
     */
    sendTeamStateChange() {
        console.log('TODO: ServerActionCreators.sendTeamStateChange');
        let teamId = Router.getTeamId(), state = {};

        // TODO: factor out team specific state logic into unit of its own

        state.introduction_read = IntroductionStore.isIntroductionRead();
        state.current_task = Router.getTaskId();
        if (teamId === 'science') {
            state.radiation = RadiationStore.getState();
        }

        setTimeout(() => storeInLS(teamId + '_state', state), 0);
        AppDispatcher.dispatch({action: constants.SENDING_TEAM_STATE});
    },

    /*
     * This is only stubbed out until server communication is up and running
     */
    askForAppState() {
        setTimeout(this.appStateReceived, 0);
        AppDispatcher.dispatch({action: constants.ASK_FOR_APP_STATE});

        setTimeout(appStateReceived, 0);
    },

    startMission(){
        socket.emit('start mission');
    },

    stopMission(){
        console.log('TODO: ServerActionCreators.stopMission');
        storeInLS('mission_running', false);
        socket.emit('stop mission');
    },

    missionCompleted(){
        socket.emit('mission completed');
    }

};

module.exports = actions;