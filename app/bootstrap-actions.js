/* Script to bootstrap the application */

var actions = require('./actions'),
    constants = require('./constants');

function run() {

    //actions.addMessage({
    //    id: 'science_high_radiation_level',
    //    text: 'Faretruende høyt strålingsnivå',
    //    level: 'danger'
    //});
    //

    actions.setTimer(constants.SCIENCE_TIMER_1, 30);

    setTimeout(()=> {
        actions.addMessage({
            id: 'science_something',
            text: 'ikke glem tannbørste nå da',
            level: 'info'
        });
    }, 100 * 1000)

    // dummy until we have integration with websockets
    setTimeout(() => {
        actions.startMission({missionLength: 60 * 15});
    }, 1000);

    actions.addMessage({
        id: constants.NOT_READY_MSG,
        text: 'Ikke klar. Venter på at oppgaven skal starte.',
        level: 'warning', dismissable: false
    });
}

module.exports = {run};