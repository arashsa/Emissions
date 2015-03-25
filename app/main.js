const React = require('react');
const document = require('global/document');
const window = require('global/window');

// include these into the build
// bootstrap requires jQuery
window.jQuery = require('jquery');
const bootstrap = require('bootstrap');


// the actual rigging of the application is done in the router!
const router = require('./router-container');

const AppDispatcher = require('./appdispatcher');
const constants = require('./constants');

// run startup actions
require('./bootstrap-actions').run();

router.run((Handler, state) => {
    AppDispatcher.dispatch({action: constants.ROUTE_CHANGED_EVENT, state});
    React.render(<Handler/>, document.body);
});

