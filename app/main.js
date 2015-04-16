const React = require('react');
const io = require('socket.io');
const socket = io();
const document = require('global/document');

// the actual rigging of the application is done in the router!
const router = require('./router-container');
const MissionActionCreators = require('./actions/MissionActionCreators');

const AppDispatcher = require('./appdispatcher');
const constants = require('./constants/RouterConstants');

// run startup actions
require('./bootstrap-actions').run();

socket.on('connection', () => console.log("Connected to server WebSocket"));

socket.on('mission started', () => MissionActionCreators.missionStarted());
socket.on('mission stopped', () => MissionActionCreators.missionStopped());

router.run((Handler, state) => {
    // pass the state down into the RouteHandlers, as that will make
    // the router related properties available on each RH. Taken from Upgrade tips for React Router
    React.render(<Handler {...state}/>, document.body);
});

