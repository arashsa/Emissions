/* Script to bootstrap the application */

var actions = require('./actions'),
    constants = require('./constants'),
    AppDispatcher = require('./appdispatcher');

AppDispatcher.register((payload)=>{
    console.log('DEBUG AppDispatcher.dispatch', payload);
});

function run() {



    actions.setTimer(constants.SCIENCE_TIMER_1, 30);

    setTimeout(()=> {
        actions.addMessage({
            id: 'science_something',
            text: 'ikke glem tannbørste nå da',
            level: 'info'
        });
    }, 100 * 1000);

    // dummy until we have integration with websockets
    setTimeout(() => {
        actions.setMissionTime(60 * 15);
        actions.startMission();
    }, 300);

    // play with radiation
    actions.setRadiationLevel(0,10);
    setTimeout(() => actions.setRadiationLevel(40,60), 10E3);
    setTimeout(() => actions.setRadiationLevel(20,30), 30E3);
    setTimeout(() => actions.setRadiationLevel(190,250), 60E3);
    setTimeout(() => actions.setRadiationLevel(40,50), 90E3);

}

module.exports = {run};