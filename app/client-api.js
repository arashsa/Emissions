const AppDispatcher = require('./appdispatcher');
const io = require('socket.io');
const socket = io();
const MissionConstants = require('./constants/MissionConstants');
const MissionActionCreators = require('./actions/MissionActionCreators');
const ScienceTeamActionCreators = require('./actions/ScienceActionCreators');
const RadiationStore = require('./stores/radiation-store');
const TimerStore = require('./stores/timer-store');
const IntroductionStore = require('./stores/introduction-store');

var api = {

    setup() {

        socket.on('connect', () => {
            console.log("Connected to server WebSocket");
            console.log("Asking server for app state");
            api.askForAppState();
        });

        socket.on('mission started', () => MissionActionCreators.missionStarted());
        socket.on('mission stopped', () => MissionActionCreators.missionStopped());
        socket.on('mission completed', ()=> MissionActionCreators.missionCompleted());

        socket.on('mission time', (time)=> MissionActionCreators.syncMissionTime(time));

        socket.on('app state', (state) => {
            this._appStateReceived(state);
        });

    },

    startMission(){
        socket.emit('start mission');
    },

    stopMission(){
        socket.emit('stop mission');
    },

    resetMission(){
        socket.emit('reset mission');
    },

    /*
     * Send full app held state (for the current team) to server on change
     * The most important bits are held on server, and is not transferred back,
     * such as if the mission is running, the current chapter, etc.
     * BEWARE: ONLY USING LOCAL STORAGE UNTIL SERVER COMMUNICATION IS UP AND RUNNING
     */
    sendTeamStateChange(teamId) {
        console.log('TODO: ServerActionCreators.sendTeamStateChange');
        let state = {};

        state.introduction_read = IntroductionStore.isIntroductionRead();
        state.current_task = Router.getTaskId();

        // TODO: factor out team specific state logic into unit of its own
        if (teamId === 'science') {
            state.radiation = RadiationStore.getState();
        }

        socket.emit('science_state', state);
        console.log('sending science state to server', state);
    },

    /*
     * This is only stubbed out until server communication is up and running
     */
    askForAppState() {
        socket.emit('get app state');
    },

    askForMissionTime(){
        socket.emit('get mission time');
    },

    _appStateReceived(appState) {
        AppDispatcher.dispatch({action: MissionConstants.RECEIVED_APP_STATE, appState});
        MissionActionCreators.syncMissionTime(appState.elapsed_mission_time);
        //ScienceTeamActionCreators.teamStateReceived(appState.science);
    }

};

window.__api = api;
module.exports = api;
