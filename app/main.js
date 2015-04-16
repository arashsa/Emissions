const React = require('react');
const document = require('global/document');

// the actual rigging of the application is done in the router!
const router = require('./router-container');

const AppDispatcher = require('./appdispatcher');
const constants = require('./constants/RouterConstants');

// run startup actions
require('./bootstrap-actions').run();

io.on('connection', () => console.log("Connected to server WebSocket"));

router.run((Handler, state) => {
    // pass the state down into the RouteHandlers, as that will make
    // the router related properties available on each RH. Taken from Upgrade tips for React Router
    React.render(<Handler {...state}/>, document.body);
});

