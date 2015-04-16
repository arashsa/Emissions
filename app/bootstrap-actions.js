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

    TimerActionCreators.setTimer(ScienceConstants.SCIENCE_TIMER_1, 30);

    // dummy until we have integration with websockets
    //setTimeout(() => {
        MissionActionCreators.startMission();
    //}, 300);

    // play with radiation
    ScienceActionCreators.setRadiationLevel(0, 10);
    setTimeout(() => ScienceActionCreators.setRadiationLevel(40, 60), 10E3);
    setTimeout(() => ScienceActionCreators.setRadiationLevel(20, 30), 30E3);
    setTimeout(() => ScienceActionCreators.setRadiationLevel(190, 250), 60E3);
    setTimeout(() => ScienceActionCreators.setRadiationLevel(40, 50), 90E3);

}

module.exports = {run};