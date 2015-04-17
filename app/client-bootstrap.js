/* Script to bootstrap the application */

var MissionActionCreators = require('./actions/MissionActionCreators'),
    MessageActionCreators = require('./actions/MessageActionCreators'),
    ScienceActionCreators = require('./actions/ScienceActionCreators'),
    ScienceConstants = require('./constants/ScienceTeamConstants'),
    TimerActionCreators = require('./actions/TimerActionCreators'),
    AppDispatcher = require('./appdispatcher');

AppDispatcher.register((payload)=> {
    console.log('DEBUG AppDispatcher.dispatch', payload);
});

function run() {


    // dummy until we have integration with websockets
    setTimeout(() => {
        MissionActionCreators.startMission();
    }, 300);

    // play with radiation
    TimerActionCreators.setTimer(ScienceConstants.SCIENCE_TIMER_1, 30);
}

module.exports = {run};