/* Script to bootstrap the application */

var actions = require('./actions'),
    constants = require('./constants'),
    AppDispatcher = require('./appdispatcher');

AppDispatcher.register((payload)=>{
    console.log('DEBUG AppDispatcher.dispatch', payload);
});

function run() {

    //actions.addMessage({
    //    id: 'science_high_radiation_level',
    //    text: 'Faretruende høyt strålingsnivå',
    //    level: 'danger'
    //});

    actions.setTimer(constants.SCIENCE_TIMER_1, 5);

    setTimeout(()=> {
        actions.addMessage({
            id: 'science_something',
            text: 'ikke glem tannbørste nå da',
            level: 'info'
        });
    }, 100 * 1000);

    // dummy until we have integration with websockets
    //setTimeout(() => {
        actions.setMissionTime(60 * 15);
        actions.startMission();
    //}, 300);

    // play with radiation
    setTimeout(() => actions.setRadiationLevel(40,60), 20);
    setTimeout(() => actions.setRadiationLevel(20,30), 30);
    setTimeout(() => actions.setRadiationLevel(50,70), 60);
    setTimeout(() => actions.setRadiationLevel(70,90), 90);
}

module.exports = {run};