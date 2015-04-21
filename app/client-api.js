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
const TaskStore = require('./stores/task-store');
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

        socket.on(EventConstants.AST_CHECK_VITALS, ()=> {
            AstroTeamTeamActionCreators.startMonitorTask();
        });

        socket.on(EventConstants.SCIENCE_CHECK_RADIATION, ()=> {
            ScienceTeamActionCreators.startSampleTask();
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
     * Send the client held state (for the current team) to server on change
     * The most important bits are held on server, and is not transferred back,
     * such as if the mission is running, the current chapter, etc.
     *
     * This is important to store on the server in case we drop the connection and reconnect in other session
     */
    sendTeamStateChange(teamId = Router.getTeamId()) {
        let state = {};

        state.team = teamId;
        state.introduction_read = IntroductionStore.isIntroductionRead(teamId);
        state.current_task = TaskStore.getCurrentTaskId(teamId);

        if (teamId === 'science') {
            state.radiation = RadiationStore.getState();
        } else if(teamId === 'astronaut') {
        }

        socket.emit('set team state', state);
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
