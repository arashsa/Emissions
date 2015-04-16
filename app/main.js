const React = require('react');
const document = require('global/document');

// the actual rigging of the application is done in the router!
const router = require('./router-container');

const AppDispatcher = require('./appdispatcher');
const constants = require('./constants/RouterConstants');

// run startup actions
require('./bootstrap-actions').run();

router.run((Handler, state) => {
    //AppDispatcher.dispatch({action: constants.ROUTE_CHANGED_EVENT, state});

    // pass the state down into the RouteHandlers, as that will make
    // the router related properties available on each RH. Taken from Upgrade tips for React Router
    React.render(<Handler {...state}/>, document.body);
});

