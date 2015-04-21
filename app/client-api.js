const AppDispatcher = require('./appdispatcher');
const io = require('socket.io');
const socket = io();
const MissionConstants = require('./constants/MissionConstants');
const MissionActionCreators = require('./actions/MissionActionCreators');
const MessageActionCreators = require('./actions/MessageActionCreators');
const ScienceTeamActionCreators = require('./actions/ScienceActionCreators');
const AstroTeamTeamActionCreators = require('./actions/AstroTeamActionCreators');
const RadiationStore = require('./stores/radiation-store');
const TimerStore = require('./stores/timer-store');
const IntroductionStore = require('./stores/introduction-store');
const Router = require('./router-container');
const EventConstants = require('../server/EventConstants');

var api = {

    setup() {

        socket.on('connect', () => {
            console.log("Connected to server WebSocket");
            console.log("Asking server for app state");
            api.askForAppState();
            MessageActionCreators.removeMessage('disconnect message');
        });

        socket.on('disconnect', function () {
            MessageActionCreators.addMessage({
                id: 'disconnect message',
                text: 'Mistet kontakt med serveren. Last siden på nytt',
                level: 'danger'
            });
        });

        socket.on(EventConstants.MISSION_STARTED, (appState) => {
            MissionActionCreators.missionStarted();
            this._appStateReceived(appState);
        });
        socket.on(EventConstants.MISSION_STOPPED, () => MissionActionCreators.missionStopped());
        socket.on(EventConstants.MISSION_COMPLETED, ()=> MissionActionCreators.missionCompleted());
        socket.on(EventConstants.MISSION_RESET, ()=> MissionActionCreators.missionWasReset());

        socket.on(EventConstants.SET_EVENTS, MissionActionCreators.receivedEvents);
        socket.on(EventConstants.ADD_MESSAGE, (serverMsg) => {
            if (serverMsg.audience && serverMsg.audience !== Router.getTeamId()) return;

            MessageActionCreators.addMessage(serverMsg);
        });

        socket.on('mission time', MissionActionCreators.setMissionTime);

        socket.on(EventConstants.APP_STATE, (state) => {
            this._appStateReceived(state);
        });

        socket.on(EventConstants.AST_SET_BREATH_RATE, (rate)=> {
            AstroTeamTeamActionCreators.setBreathRate(rate);
        });

        socket.on(EventConstants.AST_SET_HEART_RATE, (rate)=> {
            AstroTeamTeamActionCreators.set(rate);
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

    askToStartNextChapter(){
        socket.emit(EventConstants.ADVANCE_CHAPTER);
    },

    triggerEvent(uuid){
        socket.emit(EventConstants.TRIGGER_EVENT, uuid);
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

        state.team = teamId;
        state.introduction_read = IntroductionStore.isIntroductionRead(teamId);
        state.current_task = Router.getTaskId();

        // TODO: factor out team specific state logic into unit of its own
        if (teamId === 'science') {
            state.radiation = RadiationStore.getState();
        }

        socket.emit('set team state', state);
        console.log('sending science state to server', state);
    },

    completeMission(){
        socket.emit(EventConstants.COMPLETE_MISSION);
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
        MissionActionCreators.setMissionTime(appState.elapsed_mission_time);
        ScienceTeamActionCreators.teamStateReceived(appState.science);
    },

    askForEvents(){
        socket.emit(EventConstants.GET_EVENTS);
    },

    setOxygenConsumption(units) {
        socket.emit('set oxygen consumption', units);
    },

    // meant for testing - not actual client use
    setOxygenLevel(units) {
        socket.emit('set oxygen remaining', units);
    }

};

window.__api = api;
module.exports = api;
