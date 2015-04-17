const React = require('react');
const document = require('global/document');
const window = require('global/window');
const serverCommunication = require('./client-api');

// the actual rigging of the application is done in the router!
const router = require('./router-container');

const AppDispatcher = require('./appdispatcher');
const constants = require('./constants/RouterConstants');

serverCommunication.setup();

// the mission timer gets out sync if losing focus, so resync with server every time the window regains focus
window.onfocus=serverCommunication.askForMissionTime;

// run startup actions - usually only relevant when developing
require('./client-bootstrap').run();

router.run((Handler, state) => {
    // pass the state down into the RouteHandlers, as that will make
    // the router related properties available on each RH. Taken from Upgrade tips for React Router
    React.render(<Handler {...state}/>, document.body);
});

