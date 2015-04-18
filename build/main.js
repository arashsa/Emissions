(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./app/main.js":[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var document = require('global/document');
var window = require('global/window');
var serverCommunication = require('./client-api');

// the actual rigging of the application is done in the router!
var router = require('./router-container');

var AppDispatcher = require('./appdispatcher');
var constants = require('./constants/RouterConstants');

serverCommunication.setup();

// the mission timer gets out sync if losing focus, so resync with server every time the window regains focus
window.onfocus = serverCommunication.askForMissionTime;

// run startup actions - usually only relevant when developing
require('./client-bootstrap').run();

router.run(function (Handler, state) {
    // pass the state down into the RouteHandlers, as that will make
    // the router related properties available on each RH. Taken from Upgrade tips for React Router
    React.render(React.createElement(Handler, state), document.body);
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./appdispatcher":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/appdispatcher.js","./client-api":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/client-api.js","./client-bootstrap":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/client-bootstrap.js","./constants/RouterConstants":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/constants/RouterConstants.js","./router-container":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/router-container.js","global/document":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/global/document.js","global/window":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/global/window.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/actions/MessageActionCreators.js":[function(require,module,exports){
'use strict';

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var _Object$freeze = require('babel-runtime/core-js/object/freeze')['default'];

var AppDispatcher = require('../appdispatcher'),
    uuid = require('./../utils').uuid,
    constants = require('../constants/MessageConstants');

var actions = {

    /**
     * @param msg.text the message
     * @param [msg.id] the message id. if not given, one will be created
     * @param [msg.level] same as bootstrap's alert classes: [success, info, warning, danger]
     * @param [msg.duration] {Number} optional duration for transient messages
     *
     * @returns {string} the message id
     */
    addMessage: function addMessage(msg) {
        var id = msg.id;

        if (!id) {
            id = uuid();
            msg.id = id;
        }

        if (!msg.level) {
            msg.level = 'success';
        }

        AppDispatcher.dispatch({
            action: constants.MESSAGE_ADDED,
            data: msg
        });

        if (msg.duration) {
            setTimeout(function () {
                return actions.removeMessage(msg.id);
            }, msg.duration * 1000);
        }

        return id;
    },

    /**
     * msg with default duration of 5 seconds
     * @param msg
     * @param [duration] default of 5 seconds
     *
     * @see #addMessage() for more params
     * @returns {string} the message id
     */
    addTransientMessage: function addTransientMessage(msg) {
        var duration = arguments[1] === undefined ? 5 : arguments[1];

        return actions.addMessage(_Object$assign({ duration: duration }, msg));
    },

    removeMessage: function removeMessage(id) {
        AppDispatcher.dispatch({
            action: constants.REMOVE_MESSAGE,
            data: id
        });
    }

};

// prevent new properties from being added or removed
_Object$freeze(actions);
window.__MessageActions = actions;
module.exports = actions;

},{"../appdispatcher":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/appdispatcher.js","../constants/MessageConstants":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/constants/MessageConstants.js","./../utils":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/utils.js","babel-runtime/core-js/object/assign":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/core-js/object/assign.js","babel-runtime/core-js/object/freeze":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/core-js/object/freeze.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/actions/MissionActionCreators.js":[function(require,module,exports){
'use strict';

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var AppDispatcher = require('../appdispatcher'),
    MissionConstants = require('../constants/MissionConstants'),
    router = require('./../router-container');

// lazy load due to circular dependencies
var serverAPI = (function () {
    var api;

    return function () {
        if (!api) {
            api = require('../client-api');
        }
        return api;
    };
})();

var tmp = {

    startMission: function startMission() {
        serverAPI().startMission();
    },

    stopMission: function stopMission() {
        serverAPI().stopMission();
    },

    resetMission: function resetMission() {
        serverAPI().resetMission();
    },

    missionStarted: function missionStarted() {
        AppDispatcher.dispatch({ action: MissionConstants.MISSION_STARTED_EVENT });
    },

    missionStopped: function missionStopped() {
        AppDispatcher.dispatch({ action: MissionConstants.MISSION_STOPPED_EVENT });
    },

    missionWasReset: function missionWasReset() {
        AppDispatcher.dispatch({ action: MissionConstants.MISSION_WAS_RESET });
        serverAPI().askForAppState();
    },

    missionCompleted: function missionCompleted() {
        AppDispatcher.dispatch({ action: MissionConstants.MISSION_COMPLETED_EVENT });
    },

    receivedEvents: function receivedEvents(eventsCollection) {
        AppDispatcher.dispatch(_Object$assign({}, eventsCollection, { action: MissionConstants.RECEIVED_EVENTS }));
    },

    askForEvents: function askForEvents() {
        serverAPI().askForEvents();
    },

    introWasRead: function introWasRead(teamId) {
        AppDispatcher.dispatch({ action: MissionConstants.INTRODUCTION_READ, teamName: teamId });
        serverAPI().sendTeamStateChange(teamId);
    },

    startTask: function startTask(teamId, taskId) {
        AppDispatcher.dispatch({ action: MissionConstants.START_TASK, teamId: teamId, taskId: taskId });
        serverAPI().sendTeamStateChange(teamId);
    },

    taskCompleted: function taskCompleted(teamId, taskId) {
        AppDispatcher.dispatch({ action: MissionConstants.COMPLETED_TASK, taskId: taskId, teamId: teamId });
        serverAPI().sendTeamStateChange(teamId);
    },

    setMissionTime: function setMissionTime(elapsedSeconds) {
        AppDispatcher.dispatch({
            action: MissionConstants.MISSION_TIME_SYNC,
            data: { elapsedMissionTime: elapsedSeconds }
        });
    }

};

window.__MissionAC = tmp;
module.exports = tmp;

},{"../appdispatcher":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/appdispatcher.js","../client-api":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/client-api.js","../constants/MissionConstants":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/constants/MissionConstants.js","./../router-container":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/router-container.js","babel-runtime/core-js/object/assign":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/core-js/object/assign.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/actions/ScienceActionCreators.js":[function(require,module,exports){
'use strict';

var AppDispatcher = require('../appdispatcher');
var RadiationStore = require('./../stores/radiation-store');
var ScienceTeamConstants = require('../constants/ScienceTeamConstants');
var MissionConstants = require('../constants/MissionConstants');
var MessageActionsCreators = require('./MessageActionCreators');
var TimerActionCreators = require('../actions/TimerActionCreators');
var api = require('../client-api');

var missionActionCreators = (function () {
    var tmp;

    return function () {
        if (!tmp) tmp = require('../actions/MissionActionCreators');
        return tmp;
    };
})();

var actions = {

    startSampleTask: function startSampleTask() {
        AppDispatcher.dispatch({ action: ScienceTeamConstants.SCIENCE_CLEAR_RADIATION_SAMPLES });
        missionActionCreators().startTask('science', 'sample');
        this.resetSamplingTimer();
    },

    completeTask: function completeTask(taskId) {
        missionActionCreators().taskCompleted('science', taskId);
    },

    resetSamplingTimer: function resetSamplingTimer() {
        TimerActionCreators.resetTimer(ScienceTeamConstants.SCIENCE_TIMER_1);
    },

    takeRadiationSample: function takeRadiationSample() {
        AppDispatcher.dispatch({
            action: ScienceTeamConstants.SCIENCE_TAKE_RADIATION_SAMPLE
        });
    },

    averageRadiationCalculated: function averageRadiationCalculated(average) {
        var samples = RadiationStore.getSamples();

        if (samples.length) {
            var sum = samples.reduce(function (prev, current) {
                return prev + current;
            }, 0),
                trueCalculatedAverage = sum / samples.length,
                diffInPercent = 100 * Math.abs((trueCalculatedAverage - average) / trueCalculatedAverage);

            if (diffInPercent > 15) {
                MessageActionsCreators.addTransientMessage({ text: 'Mulig det gjennomsnittet ble litt feil.' });
            }
        }

        AppDispatcher.dispatch({
            action: ScienceTeamConstants.SCIENCE_AVG_RADIATION_CALCULATED,
            data: { average: average }
        });

        if (average > ScienceTeamConstants.SCIENCE_AVG_RAD_RED_THRESHOLD) {
            MessageActionsCreators.addTransientMessage({
                text: 'Veldig høyt radioaktivt nivå detektert. Varsle sikkerhetsteamet umiddelbart!',
                level: 'danger',
                id: ScienceTeamConstants.SCIENCE_RADIATION_WARNING_MSG
            }, 30);
        } else if (average > ScienceTeamConstants.SCIENCE_AVG_RAD_ORANGE_THRESHOLD) {
            MessageActionsCreators.addTransientMessage({
                text: 'Høye verdier av radioaktivitet. Følg med på om det går nedover igjen',
                level: 'warning',
                id: ScienceTeamConstants.SCIENCE_RADIATION_WARNING_MSG
            }, 10);
        }

        this.completeTask('average');
    },

    /**
     * Set the radiation level that will be reported to the view layer
     * The reported radiation will generated values in the range given by the parameters
     *
     * We are not actually receiving a stream of values from the server, as that could
     * be very resource heavy. Instead we generate random values between the given values,
     * which to the user will look the same.
     * @param min
     * @param max
     */
    setRadiationLevel: function setRadiationLevel(min, max) {
        AppDispatcher.dispatch({
            action: ScienceTeamConstants.SCIENCE_RADIATION_LEVEL_CHANGED,
            data: { min: min, max: max }
        });
    },

    addToTotalRadiationLevel: function addToTotalRadiationLevel(amount) {

        var total = amount + RadiationStore.getTotalLevel();

        if (total > ScienceTeamConstants.SCIENCE_TOTAL_RADIATION_VERY_SERIOUS_THRESHOLD) {
            MessageActionsCreators.addTransientMessage({
                id: 'science_high_radiation_level',
                text: 'Faretruende høyt strålingsnivå!',
                level: 'danger'
            }, 30);
        } else if (total > ScienceTeamConstants.SCIENCE_TOTAL_RADIATION_SERIOUS_THRESHOLD) {
            MessageActionsCreators.addTransientMessage({
                id: 'science_high_radiation_level',
                text: 'Høyt strålingsnivå!',
                level: 'warning'
            }, 30);
        }

        AppDispatcher.dispatch({
            action: ScienceTeamConstants.SCIENCE_TOTAL_RADIATION_LEVEL_CHANGED,
            data: { total: total, added: amount }
        });

        this.completeTask('addtotal');
    },

    /* On receiving new state from the server */
    teamStateReceived: function teamStateReceived(state) {
        if (!state) {
            return;
        }var teamId = 'science';

        if (state.introduction_read) {
            AppDispatcher.dispatch({ action: MissionConstants.INTRODUCTION_READ, teamName: teamId });
        }

        AppDispatcher.dispatch({ action: MissionConstants.START_TASK, teamId: teamId, taskId: state.current_task });
    }
};

window.__ScienceActions = actions;
module.exports = actions;

},{"../actions/MissionActionCreators":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/actions/MissionActionCreators.js","../actions/TimerActionCreators":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/actions/TimerActionCreators.js","../appdispatcher":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/appdispatcher.js","../client-api":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/client-api.js","../constants/MissionConstants":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/constants/MissionConstants.js","../constants/ScienceTeamConstants":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/constants/ScienceTeamConstants.js","./../stores/radiation-store":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/radiation-store.js","./MessageActionCreators":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/actions/MessageActionCreators.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/actions/TimerActionCreators.js":[function(require,module,exports){
'use strict';

var AppDispatcher = require('../appdispatcher');
var constants = require('../constants/TimerConstants');

var actions = {

    startTimer: function startTimer(id) {
        AppDispatcher.dispatch({ action: constants.START_TIMER, data: { timerId: id } });
    },

    resetTimer: function resetTimer(id) {
        AppDispatcher.dispatch({ action: constants.RESET_TIMER, data: { timerId: id } });
    },

    stopTimer: function stopTimer(id) {
        AppDispatcher.dispatch({ action: constants.STOP_TIMER, data: { timerId: id } });
    },

    setTimer: function setTimer(timerId, time) {
        AppDispatcher.dispatch({
            action: constants.SET_TIMER,
            data: {
                remainingTime: time,
                timerId: timerId
            }
        });
    }

};

module.exports = actions;

},{"../appdispatcher":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/appdispatcher.js","../constants/TimerConstants":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/constants/TimerConstants.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/appdispatcher.js":[function(require,module,exports){
/*
 * Dispatcher - a singleton
 *
 * This is essentially the main driver in the Flux architecture
 * @see http://facebook.github.io/flux/docs/overview.html
*/

'use strict';

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var _require = require('flux');

var Dispatcher = _require.Dispatcher;

var AppDispatcher = _Object$assign(new Dispatcher(), {});

window.__AppDispatcher = AppDispatcher;
module.exports = AppDispatcher;

// optional methods

},{"babel-runtime/core-js/object/assign":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/core-js/object/assign.js","flux":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/flux/index.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/client-api.js":[function(require,module,exports){
(function (global){
'use strict';

var AppDispatcher = require('./appdispatcher');
var io = (typeof window !== "undefined" ? window.io : typeof global !== "undefined" ? global.io : null);
var socket = io();
var MissionConstants = require('./constants/MissionConstants');
var MissionActionCreators = require('./actions/MissionActionCreators');
var MessageActionCreators = require('./actions/MessageActionCreators');
var ScienceTeamActionCreators = require('./actions/ScienceActionCreators');
var RadiationStore = require('./stores/radiation-store');
var TimerStore = require('./stores/timer-store');
var IntroductionStore = require('./stores/introduction-store');
var Router = require('./router-container');
var EventConstants = require('../server/EventConstants');

var api = {

    setup: function setup() {
        var _this = this;

        socket.on('connect', function () {
            console.log('Connected to server WebSocket');
            console.log('Asking server for app state');
            api.askForAppState();
            MessageActionCreators.removeMessage('disconnect message');
        });

        socket.on('disconnect', function () {
            MessageActionCreators.addMessage({
                id: 'disconnect message',
                text: 'Mistet kontakt med serveren. Last siden på nytt',
                level: 'danger'
            });
        });

        socket.on(EventConstants.MISSION_STARTED, function () {
            return MissionActionCreators.missionStarted();
        });
        socket.on(EventConstants.MISSION_STOPPED, function () {
            return MissionActionCreators.missionStopped();
        });
        socket.on(EventConstants.MISSION_COMPLETED, function () {
            return MissionActionCreators.missionCompleted();
        });
        socket.on(EventConstants.MISSION_RESET, function () {
            return MissionActionCreators.missionWasReset();
        });

        socket.on(EventConstants.SET_EVENTS, MissionActionCreators.receivedEvents);
        socket.on(EventConstants.ADD_MESSAGE, function (serverMsg) {
            if (serverMsg.audience && serverMsg.audience !== Router.getTeamId()) return;

            MessageActionCreators.addMessage(serverMsg);
        });

        socket.on('mission time', MissionActionCreators.setMissionTime);

        socket.on('app state', function (state) {
            _this._appStateReceived(state);
        });
    },

    startMission: function startMission() {
        socket.emit('start mission');
    },

    stopMission: function stopMission() {
        socket.emit('stop mission');
    },

    resetMission: function resetMission() {
        socket.emit('reset mission');
    },

    /*
     * Send full app held state (for the current team) to server on change
     * The most important bits are held on server, and is not transferred back,
     * such as if the mission is running, the current chapter, etc.
     * BEWARE: ONLY USING LOCAL STORAGE UNTIL SERVER COMMUNICATION IS UP AND RUNNING
     */
    sendTeamStateChange: function sendTeamStateChange(teamId) {
        console.log('TODO: ServerActionCreators.sendTeamStateChange');
        var state = {};

        state.team = teamId;
        state.introduction_read = IntroductionStore.isIntroductionRead(teamId);
        state.current_task = Router.getTaskId();

        // TODO: factor out team specific state logic into unit of its own
        if (teamId === 'science') {
            state.radiation = RadiationStore.getState();
        }

        socket.emit('set team state', state);
        console.log('sending science state to server', state);
    },

    /*
     * This is only stubbed out until server communication is up and running
     */
    askForAppState: function askForAppState() {
        socket.emit('get app state');
    },

    askForMissionTime: function askForMissionTime() {
        socket.emit('get mission time');
    },

    _appStateReceived: function _appStateReceived(appState) {
        AppDispatcher.dispatch({ action: MissionConstants.RECEIVED_APP_STATE, appState: appState });
        MissionActionCreators.setMissionTime(appState.elapsed_mission_time);
        ScienceTeamActionCreators.teamStateReceived(appState.science);
    },

    askForEvents: function askForEvents() {
        socket.emit(EventConstants.GET_EVENTS);
    }

};

window.__api = api;
module.exports = api;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../server/EventConstants":"/Users/carl-erik.kopseng/dev_priv/Emissions/server/EventConstants.js","./actions/MessageActionCreators":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/actions/MessageActionCreators.js","./actions/MissionActionCreators":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/actions/MissionActionCreators.js","./actions/ScienceActionCreators":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/actions/ScienceActionCreators.js","./appdispatcher":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/appdispatcher.js","./constants/MissionConstants":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/constants/MissionConstants.js","./router-container":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/router-container.js","./stores/introduction-store":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/introduction-store.js","./stores/radiation-store":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/radiation-store.js","./stores/timer-store":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/timer-store.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/client-bootstrap.js":[function(require,module,exports){
/* Script to bootstrap the application */

'use strict';

var MissionActionCreators = require('./actions/MissionActionCreators'),
    MessageActionCreators = require('./actions/MessageActionCreators'),
    ScienceActionCreators = require('./actions/ScienceActionCreators'),
    ScienceConstants = require('./constants/ScienceTeamConstants'),
    TimerActionCreators = require('./actions/TimerActionCreators'),
    AppDispatcher = require('./appdispatcher');

AppDispatcher.register(function (payload) {
    console.log('DEBUG AppDispatcher.dispatch', payload);
});

function run() {

    // dummy until we have integration with websockets
    setTimeout(function () {
        MissionActionCreators.startMission();
    }, 300);

    // play with radiation
    TimerActionCreators.setTimer(ScienceConstants.SCIENCE_TIMER_1, 30);
}

module.exports = { run: run };

},{"./actions/MessageActionCreators":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/actions/MessageActionCreators.js","./actions/MissionActionCreators":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/actions/MissionActionCreators.js","./actions/ScienceActionCreators":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/actions/ScienceActionCreators.js","./actions/TimerActionCreators":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/actions/TimerActionCreators.js","./appdispatcher":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/appdispatcher.js","./constants/ScienceTeamConstants":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/constants/ScienceTeamConstants.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/app.react.js":[function(require,module,exports){
(function (global){
'use strict';

var _extends = require('babel-runtime/helpers/extends')['default'];

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var Router = (typeof window !== "undefined" ? window.ReactRouter : typeof global !== "undefined" ? global.ReactRouter : null);

var RouteHandler = Router.RouteHandler;

var Header = require('./header.react');

var MessageList = require('./message-list.react');
var MissionStateStore = require('../stores/mission-state-store');

var App = React.createClass({
    displayName: 'App',

    mixins: [],

    getInitialState: function getInitialState() {
        return { isMissionRunning: MissionStateStore.isMissionRunning() };
    },

    componentWillMount: function componentWillMount() {
        MissionStateStore.addChangeListener(this._handleMissionStateChange);
    },

    componentDidMount: function componentDidMount() {
        console.log('App.componentDidMount');
    },

    componentWillUnmount: function componentWillUnmount() {
        MissionStateStore.removeChangeListener(this._handleMissionStateChange);
    },

    _handleMissionStateChange: function _handleMissionStateChange() {
        this.setState({ isMissionRunning: MissionStateStore.isMissionRunning() });
    },

    render: function render() {

        return React.createElement(
            'div',
            { className: 'container' },
            React.createElement(Header, null),
            React.createElement(RouteHandler, _extends({}, this.props, this.state)),
            React.createElement(
                'div',
                { className: 'row' },
                React.createElement('footer', { id: 'main-footer' })
            )
        );
    }
});

module.exports = App;
/* this is the important part */

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../stores/mission-state-store":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/mission-state-store.js","./header.react":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/header.react.js","./message-list.react":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/message-list.react.js","babel-runtime/helpers/extends":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/helpers/extends.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/commander-app.react.js":[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var MissionStore = require('../stores/mission-state-store');
var MissionTimer = require('./mission-timer.react');
var EventStore = require('../stores/event-store');
var utils = require('../utils');
var getMissionAC = (function () {
    var tmp = null;
    return function () {
        if (!tmp) tmp = require('../actions/MissionActionCreators');
        return tmp;
    };
})();

var App = React.createClass({
    displayName: 'App',

    componentWillMount: function componentWillMount() {
        var ac = getMissionAC();
        ac.askForEvents();

        EventStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function componentWillUnmount() {
        EventStore.removeChangeListener(this._onChange);
    },

    getInitialState: function getInitialState() {
        return {
            completedEvents: [],
            overdueEvents: [],
            remainingEvents: []
        };
    },

    _onChange: function _onChange() {
        this.setState({
            completedEvents: EventStore.completed(),
            overdueEvents: EventStore.overdue(),
            remainingEvents: EventStore.remaining()
        });
        console.log('_onChange', this.state);
    },

    render: function render() {

        // put it here due to circular dependencies

        return React.createElement(
            'div',
            null,
            MissionStore.isMissionRunning() ? React.createElement(MissionTimer, null) : React.createElement(
                'p',
                { id: 'missionTime' },
                'Oppdraget har ikke startet'
            ),
            React.createElement(
                'div',
                null,
                React.createElement(
                    'button',
                    { onClick: getMissionAC().startMission },
                    'Start oppdrag'
                ),
                React.createElement(
                    'button',
                    { onClick: getMissionAC().stopMission },
                    'Stop'
                ),
                React.createElement(
                    'button',
                    { onClick: getMissionAC().resetMission },
                    'Begynn på nytt'
                )
            ),
            React.createElement(
                'button',
                { key: 'missionCompleted', className: 'disabled' },
                'Oppdrag utført'
            ),
            React.createElement(
                'h3',
                null,
                'remaining'
            ),
            React.createElement(
                'ul',
                null,
                this.state.remainingEvents.map(function (ev) {
                    return React.createElement(
                        'li',
                        null,
                        ev.triggerTime,
                        ' ',
                        ev.short_description,
                        ' ',
                        ev.value
                    );
                })
            ),
            React.createElement(
                'h3',
                null,
                'overdue'
            ),
            React.createElement(
                'ul',
                null,
                this.state.overdueEvents.map(function (ev) {
                    return React.createElement(
                        'li',
                        null,
                        ev.triggerTime,
                        ' ',
                        ev.short_description,
                        ' ',
                        ev.value
                    );
                })
            )
        );
    }

});

module.exports = App;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../actions/MissionActionCreators":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/actions/MissionActionCreators.js","../stores/event-store":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/event-store.js","../stores/mission-state-store":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/mission-state-store.js","../utils":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/utils.js","./mission-timer.react":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/mission-timer.react.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/dialogs.react.js":[function(require,module,exports){
(function (global){
// needed to avoid compilation error
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);

module.exports = {
    science_intro: React.createElement(
        'div',
        null,
        React.createElement(
            'p',
            null,
            'Dere skal overvåke strålingsnivået astronatuen utsettes for. Dere må da passe på at astronauten ikke blir utsatt for strålingsnivåer som er skadelig.'
        ),
        React.createElement(
            'p',
            null,
            'Ved hjelp av instrumentene som er tilgjengelig må dere jevnlig ta prøver og regne ut verdiene for gjennomsnittlig og totalt strålingsnivå. Finner dere ut at nivåene er blitt farlig høye ',
            React.createElement(
                'em',
                null,
                'må'
            ),
            ' dere si fra til oppdragslederen så vi kan få ut astronauten!'
        ),
        React.createElement(
            'p',
            null,
            'Er oppdraget forstått?'
        )
    )
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/dummy-render.mixin.js":[function(require,module,exports){
'use strict';

module.exports = {
    render: function render() {
        throw new Error('DUMMY_RENDER. This react component is not for presentational purposes');
    }
};

},{}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/header.react.js":[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var Router = (typeof window !== "undefined" ? window.ReactRouter : typeof global !== "undefined" ? global.ReactRouter : null);
var Link = Router.Link;

var Header = React.createClass({
    displayName: 'Header',

    render: function render() {
        return React.createElement(
            'div',
            null,
            React.createElement(
                'div',
                { className: 'row' },
                React.createElement(
                    'header',
                    { id: 'narom-header' },
                    React.createElement(
                        'div',
                        null,
                        React.createElement('img', { className: 'narom-logo-img', src: '/images/logo.png' }),
                        'NAROM e-Mission prototype'
                    )
                )
            ),
            React.createElement(
                'div',
                { id: 'main-header', className: 'row' },
                React.createElement(
                    Link,
                    { to: '/' },
                    React.createElement(
                        'header',
                        null,
                        React.createElement(
                            'h1',
                            { className: '' },
                            'Under en solstorm'
                        )
                    )
                )
            )
        );
    }
});

module.exports = Header;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/index-app.react.js":[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var Router = (typeof window !== "undefined" ? window.ReactRouter : typeof global !== "undefined" ? global.ReactRouter : null);
var Link = Router.Link;

module.exports = React.createClass({
    displayName: 'exports',

    render: function render() {
        return React.createElement(
            'div',
            null,
            React.createElement(
                'h3',
                null,
                'Velg lag'
            ),
            React.createElement(
                'ul',
                null,
                React.createElement(
                    'li',
                    null,
                    React.createElement(
                        Link,
                        { to: 'team-root', params: { teamId: 'science' } },
                        'Forskningsteamet'
                    )
                ),
                React.createElement(
                    'li',
                    null,
                    ' ... Lag 2, 3, 4 ..'
                )
            )
        );
    }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/introduction-screen.react.js":[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var dialogs = require('./dialogs.react');

var _require = require('../utils');

var cleanRootPath = _require.cleanRootPath;

var RouteStore = require('../stores/route-store');
var IntroStore = require('../stores/introduction-store');

var IntroductionScreen = React.createClass({
    displayName: 'IntroductionScreen',

    mixins: [],

    contextTypes: {
        router: React.PropTypes.func
    },

    statics: {
        willTransitionTo: function willTransitionTo(transition) {
            var teamId = cleanRootPath(transition.path);

            if (IntroStore.isIntroductionRead(teamId)) {
                console.log('Introduction read earlier');
                transition.redirect('team-task', { taskId: 'sample', teamId: teamId });
            }
        }
    },

    _handleClick: function _handleClick() {
        var MissionActionCreators = require('../actions/MissionActionCreators');

        var teamId = RouteStore.getTeamId();
        MissionActionCreators.introWasRead(teamId);
        this.context.router.transitionTo('team-task', { taskId: 'sample', teamId: teamId });
    },

    render: function render() {
        var teamId = RouteStore.getTeamId();
        var introText = dialogs[teamId + '_intro'] || React.createElement(
            'p',
            null,
            'Mangler oppdrag'
        );

        return React.createElement(
            'div',
            { className: 'row jumbotron introscreen' },
            React.createElement(
                'h2',
                null,
                'Mål for oppdraget'
            ),
            introText,
            React.createElement(
                'button',
                {
                    className: 'btn btn-primary btn-lg',
                    onClick: this._handleClick
                },
                'Jeg forstår'
            )
        );
    }
});

module.exports = IntroductionScreen;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../actions/MissionActionCreators":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/actions/MissionActionCreators.js","../stores/introduction-store":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/introduction-store.js","../stores/route-store":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/route-store.js","../utils":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/utils.js","./dialogs.react":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/dialogs.react.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/message-list.react.js":[function(require,module,exports){
(function (global){
'use strict';

var _extends = require('babel-runtime/helpers/extends')['default'];

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var actions = require('../actions/MessageActionCreators');

var ListMessageWrapper = React.createClass({
    displayName: 'ListMessageWrapper',

    propTypes: {
        level: React.PropTypes.string.isRequired,
        text: React.PropTypes.string.isRequired,
        id: React.PropTypes.string.isRequired
    },

    render: function render() {
        var _this = this;

        var button = undefined;

        if (this.props.dismissable) {
            button = React.createElement(
                'button',
                {
                    type: 'button',
                    className: 'close',
                    onClick: function () {
                        return actions.removeMessage(_this.props.id);
                    }
                },
                React.createElement(
                    'span',
                    null,
                    '×'
                )
            );
        }

        return React.createElement(
            'li',
            { className: 'alert alert-dismissible alert-' + this.props.level },
            button,
            this.props.text
        );
    }
});

var MessageList = React.createClass({
    displayName: 'MessageList',

    render: function render() {
        var hidden = this.props.messages.length === 0 ? 'hide' : '';
        var classes = (this.props.className || '') + ' messagebox ' + hidden;

        return React.createElement(
            'ul',
            { className: classes },
            this.props.messages.map(function (msg) {
                return React.createElement(ListMessageWrapper, _extends({ key: msg.id }, msg));
            })
        );
    }

});

module.exports = MessageList;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../actions/MessageActionCreators":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/actions/MessageActionCreators.js","babel-runtime/helpers/extends":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/helpers/extends.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/mission-timer.react.js":[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null),
    TimerStore = require('../stores/timer-store'),
    Timer = require('./timer.react');

var MissionTimer = React.createClass({
    displayName: 'MissionTimer',

    getInitialState: function getInitialState() {
        return { elapsed: TimerStore.getElapsedMissionTime() };
    },

    componentDidMount: function componentDidMount() {
        TimerStore.addChangeListener(this._handleTimeChange);
    },

    componentWillUnmount: function componentWillUnmount() {
        TimerStore.removeChangeListener(this._handleTimeChange);
    },

    _handleTimeChange: function _handleTimeChange() {
        this.setState({
            elapsed: TimerStore.getElapsedMissionTime()
        });
    },

    render: function render() {
        return React.createElement(
            'div',
            { className: this.props.className },
            React.createElement(Timer, { timeInSeconds: this.state.elapsed })
        );
    }
});

module.exports = MissionTimer;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../stores/timer-store":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/timer-store.js","./timer.react":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/timer.react.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/not-found.react.js":[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);

var NotFound = React.createClass({
    displayName: 'NotFound',

    render: function render() {
        return React.createElement(
            'div',
            { className: 'container' },
            React.createElement(
                'div',
                { className: 'row jumbotron' },
                React.createElement(
                    'div',
                    null,
                    'Ojsann. Tror du har gått deg vill, jeg'
                )
            )
        );
    }
});

module.exports = NotFound;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/overlay.react.js":[function(require,module,exports){
(function (global){
/*
 * Simple component that overlays a section, signalling a disabled state
 *
 * Dependant on working CSS, of course: the parent must be positioned (relative, absolute, ...)
 * Loosely based http://stackoverflow.com/questions/3627283/how-to-dim-other-div-on-clicking-input-box-using-jquery
 */
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);

module.exports = React.createClass({
    displayName: "exports",

    propTypes: {
        active: React.PropTypes.bool.isRequired
    },

    render: function render() {
        return this.props.active ? React.createElement("div", { className: "overlay" }) : null;
    }

});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/radiation-chart.react.js":[function(require,module,exports){
(function (global){
/**
 * Implementation based on tips in the article by Nicolas Hery
 * http://nicolashery.com/integrating-d3js-visualizations-in-a-react-app
 *
 * Chart code more or less copied from the prototype by Leo Martin Westby
 */
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var AmCharts = (typeof window !== "undefined" ? window.AmCharts : typeof global !== "undefined" ? global.AmCharts : null);
var constants = require('../constants/ScienceTeamConstants');

var chart, chartUpdater, getNewValue, updateFrequency, maxSeconds;
var radiationSamples = [];

var _require = require('../utils');

var randomInt = _require.randomInt;

function initChart(domElement) {

    chart = new AmCharts.AmSerialChart();

    chart.marginTop = 20;
    chart.marginRight = 0;
    chart.marginLeft = 0;
    chart.autoMarginOffset = 0;
    chart.dataProvider = radiationSamples;
    chart.categoryField = 'timestamp';

    //X axis
    var categoryAxis = chart.categoryAxis;
    categoryAxis.dashLength = 1;
    categoryAxis.gridAlpha = 0.15;
    categoryAxis.axisColor = '#DADADA';
    categoryAxis.title = 'Seconds';

    //Y axis
    var valueAxis = new AmCharts.ValueAxis();
    valueAxis.axisAlpha = 0.2;
    valueAxis.dashLength = 1;
    valueAxis.title = 'μSv/h';
    valueAxis.minimum = constants.SCIENCE_RADIATION_MIN;
    valueAxis.maximum = constants.SCIENCE_RADIATION_MAX;
    chart.addValueAxis(valueAxis);

    //Line
    var graph = new AmCharts.AmGraph();
    graph.valueField = 'radiation';
    graph.bullet = 'round';
    graph.bulletBorderColor = '#FFFFFF';
    graph.bulletBorderThickness = 2;
    graph.lineThickness = 2;
    graph.lineColor = '#b5030d';
    graph.negativeLineColor = '#228B22';
    graph.negativeBase = 60;
    graph.hideBulletsCount = 50;
    chart.addGraph(graph);

    //Mouseover
    var chartCursor = new AmCharts.ChartCursor();
    chartCursor.cursorPosition = 'mouse';
    chart.addChartCursor(chartCursor);
    chart.write(domElement);
}

//Adds a new radiation sample to the chart every few seconds
function startEventLoop() {
    var startTime = Date.now();
    stopEventLoop();

    chartUpdater = setInterval(function () {
        var secondsPassed = (Date.now() - startTime) / 1000;

        radiationSamples.push({
            timestamp: Math.floor(secondsPassed + 0.5),
            radiation: getNewValue()
        });

        //When the chart grows, start cutting off the oldest sample to give the chart a sliding effect
        if (radiationSamples.length > maxSeconds / updateFrequency) {
            radiationSamples.shift();
        }

        chart.validateData();
    }, updateFrequency * 1000);
}

function stopEventLoop() {
    clearInterval(chartUpdater);
}

var RadiationChart = React.createClass({
    displayName: 'RadiationChart',

    statics: {},

    propTypes: {
        updateFrequencySeconds: React.PropTypes.number.isRequired,
        maxSecondsShown: React.PropTypes.number.isRequired,
        getNewValue: React.PropTypes.func.isRequired,
        height: React.PropTypes.number.isRequired,
        width: React.PropTypes.number
    },

    mixins: [],

    componentWillMount: function componentWillMount() {
        updateFrequency = this.props.updateFrequencySeconds;
        maxSeconds = this.props.maxSecondsShown;
        getNewValue = this.props.getNewValue;
    },

    componentDidMount: function componentDidMount() {
        var el = React.findDOMNode(this);
        initChart(el);
        startEventLoop();
    },

    componentWillReceiveProps: function componentWillReceiveProps() {},

    componentWillUnmount: function componentWillUnmount() {
        chart && chart.clear();
        stopEventLoop();
    },

    componentDidUnmount: function componentDidUnmount() {
        chart = null;
        //radiationSamples.length = 0;
    },

    componentDidUpdate: function componentDidUpdate() {},

    // this chart is responsible for drawing itself
    shouldComponentUpdate: function shouldComponentUpdate() {
        return false;
    },

    // Private methods

    render: function render() {

        // if you don't specify width it will max out to 100% (which is ok)
        return React.createElement('div', {
            style: { width: this.props.width + 'px', height: this.props.height + 'px' },
            className: this.props.className
        });
    }

});

module.exports = RadiationChart;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../constants/ScienceTeamConstants":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/constants/ScienceTeamConstants.js","../utils":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/utils.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/radiation-sampler.react.js":[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null),
    TimerStore = require('../stores/timer-store'),
    MissionActionCreators = require('../actions/MissionActionCreators'),
    TimerActionCreators = require('../actions/TimerActionCreators'),
    ScienceActionCreators = require('../actions/ScienceActionCreators'),
    constants = require('../constants/ScienceTeamConstants');

var RadiationSampler = React.createClass({
    displayName: 'RadiationSampler',

    propTypes: {
        requiredSamples: React.PropTypes.number.isRequired,
        radiationStoreState: React.PropTypes.object.isRequired
    },

    componentWillMount: function componentWillMount() {
        TimerStore.addChangeListener(this._handleTimerChange);
    },

    componentDidUpdate: function componentDidUpdate() {
        if (this.state.timerActive) {
            var el = React.findDOMNode(this.refs['sample-button']);
            el.focus();
        }
    },

    componentWillUnmount: function componentWillUnmount() {
        TimerStore.removeChangeListener(this._handleTimerChange);
    },

    getInitialState: function getInitialState() {
        return { timerActive: false };
    },

    _isDisabled: function _isDisabled() {
        return !this.state.timerActive;
    },

    _handleTimerChange: function _handleTimerChange() {
        var audio = React.findDOMNode(this.refs.geigerSound);
        var timerActive = TimerStore.isRunning(constants.SCIENCE_TIMER_1);

        this.setState({ timerActive: timerActive });

        if (timerActive && audio.paused) {
            audio.play();
        } else if (!timerActive && !audio.paused) {
            audio.pause();
        }
    },

    _handleClick: function _handleClick() {
        ScienceActionCreators.takeRadiationSample();

        if (this.props.radiationStoreState.samples.length + 1 >= this.props.requiredSamples) {
            TimerActionCreators.stopTimer(constants.SCIENCE_TIMER_1);
            ScienceActionCreators.completeTask('sample');
        }
    },

    render: function render() {
        var disabled, classes;

        classes = 'btn btn-primary';

        if (this._isDisabled()) {
            classes += ' disabled';
        }

        return React.createElement(
            'section',
            { className: 'radiation-sampler ' + this.props.className },
            React.createElement('div', { className: 'radiation-sampler__padder clearfix visible-xs-block' }),
            React.createElement(
                'audio',
                { ref: 'geigerSound', loop: true },
                React.createElement('source', { src: '/sounds/AOS04595_Electric_Geiger_Counter_Fast.wav', type: 'audio/wav' })
            ),
            React.createElement(
                'div',
                null,
                React.createElement(
                    'button',
                    {
                        ref: 'sample-button',
                        className: classes,
                        onClick: this._handleClick
                    },
                    'Ta strålingsprøve'
                )
            )
        );
    }

});

module.exports = RadiationSampler;
/* Avoid floating into previous block */

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../actions/MissionActionCreators":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/actions/MissionActionCreators.js","../actions/ScienceActionCreators":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/actions/ScienceActionCreators.js","../actions/TimerActionCreators":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/actions/TimerActionCreators.js","../constants/ScienceTeamConstants":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/constants/ScienceTeamConstants.js","../stores/timer-store":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/timer-store.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/radiation-table.react.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);

module.exports = React.createClass({
    displayName: "exports",

    statics: {},
    propTypes: {
        samples: React.PropTypes.array.isRequired,
        minimalRowsToShow: React.PropTypes.number
    },

    // Private methods

    getDefaultProps: function getDefaultProps() {
        return { minimalRowsToShow: 0 };
    },

    render: function render() {
        var sampleRows = this.props.samples.map(function (val, i) {
            return React.createElement(
                "tr",
                { key: i },
                React.createElement(
                    "th",
                    { scope: "row" },
                    i + 1
                ),
                React.createElement(
                    "td",
                    null,
                    val
                )
            );
        }),
            missingRows = this.props.minimalRowsToShow - sampleRows.length,
            fillRows = undefined;

        if (missingRows > 0) {
            fillRows = [];

            while (missingRows--) {
                fillRows.push(React.createElement(
                    "tr",
                    { key: fillRows.length },
                    React.createElement("th", { scope: "row" }),
                    React.createElement(
                        "td",
                        null,
                        " "
                    )
                ));
            }
        }

        return React.createElement(
            "div",
            { className: this.props.className },
            React.createElement(
                "h3",
                null,
                "Prøveresultater"
            ),
            React.createElement(
                "table",
                { className: " table table-bordered" },
                React.createElement(
                    "caption",
                    null,
                    "Strålingspartikler per sekund (p/s)"
                ),
                React.createElement(
                    "thead",
                    null,
                    React.createElement(
                        "tr",
                        null,
                        React.createElement(
                            "th",
                            { scope: "col" },
                            "Prøvenummer"
                        ),
                        React.createElement(
                            "th",
                            { scope: "col" },
                            "p/s"
                        )
                    )
                ),
                React.createElement(
                    "tbody",
                    null,
                    sampleRows,
                    fillRows
                )
            )
        );
    }

});
/* Needs filler to not collapse cell */

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/science-task.react.js":[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var TimerPanel = require('./timer-panel.react');
var RadiationChart = require('./radiation-chart.react.js');
var RadiationSampleButton = require('./radiation-sampler.react');
var Overlay = require('./overlay.react');
var RadiationTable = require('./radiation-table.react');
var RadiationStore = require('../stores/radiation-store');
var actions = require('../actions/ScienceActionCreators');
var utils = require('../utils');
var ScienceTeamConstants = require('../constants/ScienceTeamConstants');

module.exports = React.createClass({
    displayName: 'exports',

    statics: {},
    propTypes: {
        appstate: React.PropTypes.object.isRequired
    },
    mixins: [],

    // life cycle methods
    getInitialState: function getInitialState() {
        return {
            radiation: RadiationStore.getState()
        };
    },

    getDefaultProps: function getDefaultProps() {
        return {};
    },

    componentWillMount: function componentWillMount() {
        RadiationStore.addChangeListener(this._handleRadiationChange);
    },

    componentWillReceiveProps: function componentWillReceiveProps() {},

    componentWillUnmount: function componentWillUnmount() {
        RadiationStore.removeChangeListener(this._handleRadiationChange);
    },

    // Private methods

    _handleRadiationChange: function _handleRadiationChange() {
        this.setState({
            radiation: RadiationStore.getState()
        });
    },

    _handleAverageRadiationSubmit: function _handleAverageRadiationSubmit(e) {
        var el = React.findDOMNode(this.refs['average-input']),
            val = el.value.trim();

        e.preventDefault();

        if (!val.length) {
            return;
        }var average = utils.parseNumber(val);
        el.value = '';

        if (average) {
            actions.averageRadiationCalculated(average);
        }
    },

    _handleAddToTotalSubmit: function _handleAddToTotalSubmit(e) {
        e.preventDefault();

        var el = React.findDOMNode(this.refs['add-to-total-input']);
        var val = el.value.trim();
        if (!val.length) {
            return;
        }var number = utils.parseNumber(val);

        el.value = '';

        if (number) {
            actions.addToTotalRadiationLevel(number);
        }
    },

    /*
     * Helper
     * @param {string} taskName name
     * @returns {boolean} true if the current task id equals the name passed in
     */
    _isCurrentTask: function _isCurrentTask(taskName) {
        return this.props.appstate.taskStore.currentTaskId === taskName;
    },

    _radiationStatus: function _radiationStatus() {
        var num = this.state.radiation.lastCalculatedAverage,
            color;

        if (num === null) {
            return 'Ikke beregnet';
        }

        if (num > ScienceTeamConstants.SCIENCE_AVG_RAD_RED_VALUE) {
            color = 'red';
        } else if (num > ScienceTeamConstants.SCIENCE_AVG_RAD_ORANGE_VALUE) {
            color = 'orange';
        } else {
            color = 'green';
        }

        return React.createElement(
            'div',
            {
                className: 'radiation-indicator circle col-xs-2',
                style: { backgroundColor: color }
            },
            num
        );
    },

    render: function render() {
        var showSampleInput = this._isCurrentTask('sample'),
            showAverageInput = this._isCurrentTask('average'),
            showAddToTotalInput = this._isCurrentTask('addtotal');

        return React.createElement(
            'div',
            null,
            React.createElement(
                'div',
                { className: 'row' },
                React.createElement(
                    'dl',
                    { className: 'radiation-values col-xs-6 ' },
                    React.createElement(
                        'dt',
                        null,
                        'Totalt strålingsnivå'
                    ),
                    React.createElement(
                        'dd',
                        null,
                        this.state.radiation.total
                    ),
                    React.createElement(
                        'dt',
                        null,
                        'Sist innlest strålingsnivå'
                    ),
                    React.createElement(
                        'dd',
                        null,
                        this._radiationStatus(),
                        ' '
                    )
                ),
                React.createElement(RadiationTable, {
                    minimalRowsToShow: 4,
                    samples: this.state.radiation.samples,
                    className: 'col-xs-6 ' })
            ),
            React.createElement('hr', null),
            React.createElement(
                'div',
                { className: 'instruments' },
                React.createElement(
                    'fieldset',
                    { disabled: !showSampleInput, className: 'instruments__section row overlayable' },
                    React.createElement(Overlay, { active: !showSampleInput }),
                    React.createElement(
                        'h3',
                        { className: 'col-xs-12' },
                        'Ta prøver'
                    ),
                    React.createElement(TimerPanel, { className: 'col-xs-12 col-sm-8', timerId: ScienceTeamConstants.SCIENCE_TIMER_1 }),
                    React.createElement(RadiationSampleButton, {
                        className: 'col-xs-5 col-sm-4',
                        radiationStoreState: this.state.radiation,
                        requiredSamples: 4
                    })
                ),
                React.createElement('hr', null),
                React.createElement(
                    'div',
                    { className: 'row overlayable' },
                    React.createElement(Overlay, { active: !showAverageInput }),
                    React.createElement(
                        'section',
                        { className: 'radiation-input instruments__section col-xs-12 col-sm-6' },
                        React.createElement(
                            'div',
                            { className: 'row' },
                            React.createElement(
                                'h3',
                                { className: 'col-xs-12' },
                                'Gjennomsnittlig stråling'
                            ),
                            React.createElement(
                                'fieldset',
                                { className: 'col-xs-8', disabled: !showAverageInput },
                                React.createElement(
                                    'form',
                                    { onSubmit: this._handleAverageRadiationSubmit },
                                    React.createElement('input', { ref: 'average-input',
                                        type: 'number',
                                        step: '0.1',
                                        min: '1',
                                        max: '100',
                                        className: 'radiation-input__input'
                                    }),
                                    React.createElement(
                                        'button',
                                        { className: 'btn btn-primary' },
                                        'Evaluer'
                                    )
                                )
                            )
                        )
                    )
                ),
                React.createElement('hr', null),
                React.createElement(
                    'div',
                    { className: 'row overlayable' },
                    React.createElement(Overlay, { active: !showAddToTotalInput }),
                    React.createElement(
                        'fieldset',
                        { className: 'radiation-input col-xs-8', disabled: !showAddToTotalInput },
                        React.createElement(
                            'h3',
                            null,
                            'Legg verdi til total'
                        ),
                        React.createElement(
                            'form',
                            { onSubmit: this._handleAddToTotalSubmit },
                            React.createElement('input', { ref: 'add-to-total-input',
                                type: 'number',
                                step: '5',
                                min: '0',
                                max: '50',
                                className: 'radiation-input__input'
                            }),
                            React.createElement(
                                'button',
                                { className: 'btn btn-primary' },
                                'Evaluer'
                            )
                        )
                    )
                )
            )
        );
    }

});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../actions/ScienceActionCreators":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/actions/ScienceActionCreators.js","../constants/ScienceTeamConstants":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/constants/ScienceTeamConstants.js","../stores/radiation-store":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/radiation-store.js","../utils":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/utils.js","./overlay.react":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/overlay.react.js","./radiation-chart.react.js":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/radiation-chart.react.js","./radiation-sampler.react":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/radiation-sampler.react.js","./radiation-table.react":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/radiation-table.react.js","./timer-panel.react":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/timer-panel.react.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/task.react.js":[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var Router = (typeof window !== "undefined" ? window.ReactRouter : typeof global !== "undefined" ? global.ReactRouter : null);
var MessageStore = require('../stores/message-store');
var TaskStore = require('../stores/task-store');
var RouteStore = require('../stores/route-store');
var MessageList = require('./message-list.react');
var IntroductionScreen = require('./introduction-screen.react.js');
var TeamDisplayer = require('./team-displayer.react');
var MissionTimer = require('./mission-timer.react.js');
var ScienceTask = require('./science-task.react');
var _require = require('util');

var format = _require.format;

function urlOfTask(taskId) {
    return format('/%s/task/%s', RouteStore.getTeamId(), taskId);
}

function transitionToCurrentTask(transitionFunction) {
    var currentTaskId = TaskStore.getCurrentTaskId();

    // this logic is fragile - if you should suddenly decide to visit another team
    // _after_ you have started a task, the team+task combo is invalid -> 404
    if (currentTaskId !== RouteStore.getTaskId()) {
        var to = urlOfTask(currentTaskId);
        transitionFunction(to);
    }
}

var Task = React.createClass({
    displayName: 'Task',

    contextTypes: {
        router: React.PropTypes.func
    },

    mixins: [],

    statics: {
        willTransitionTo: function willTransitionTo(transition) {
            transitionToCurrentTask(transition.redirect.bind(transition));
        }
    },

    componentDidMount: function componentDidMount() {},

    componentWillMount: function componentWillMount() {
        MessageStore.addChangeListener(this._onChange);
        TaskStore.addChangeListener(this._onChange);
        //console.log('componentWillMount');
    },

    componentWillUnmount: function componentWillUnmount() {
        //console.log('componentWillUnmount');
        MessageStore.removeChangeListener(this._onChange);
        TaskStore.removeChangeListener(this._onChange);

        clearTimeout(this._stateTimeout);
    },

    componentDidUnmount: function componentDidUnmount() {},

    componentDidUpdate: function componentDidUpdate() {},

    getInitialState: function getInitialState() {
        var _this = this;

        setTimeout(function () {
            return _this.setState({ taskIsNew: false });
        }, 2000);

        return {
            messages: MessageStore.getMessages(),
            taskStore: TaskStore.getState(),
            taskIsNew: true
        };
    },

    _onChange: function _onChange() {
        var _this2 = this;

        this.setState({
            messages: MessageStore.getMessages(),
            taskStore: TaskStore.getState(),
            taskIsNew: true
        });

        var router = this.context.router;
        transitionToCurrentTask(router.transitionTo.bind(router));

        // a bit rudimentary - triggers on all changes, not just Task changes ...
        this._stateTimeout = setTimeout(function () {
            return _this2.setState({ taskIsNew: false });
        }, 2000);
    },

    _createSubTaskUI: function _createSubTaskUI() {
        return React.createElement(ScienceTask, { appstate: this.state });
    },

    render: function render() {
        var content = this._createSubTaskUI(),
            blink = this.state.taskIsNew ? 'blink' : '',
            teamNames = undefined,
            missionTimer = undefined;

        teamNames = React.createElement(
            'div',
            { id: 'team-name', className: '' },
            React.createElement(
                'header',
                { className: '' },
                React.createElement(TeamDisplayer, { className: '' })
            )
        );

        missionTimer = React.createElement(
            'section',
            { id: 'mission-timer', className: '' },
            React.createElement(MissionTimer, null)
        );

        if (!this.props.isMissionRunning) {
            var message = {
                id: 'not_used',
                text: 'Ikke klar. Venter på at oppdraget skal starte.',
                level: 'info'
            };

            return React.createElement(
                'div',
                null,
                teamNames,
                React.createElement(
                    'div',
                    { className: 'row' },
                    React.createElement(MessageList, { className: 'col-xs-12',
                        messages: [message] })
                )
            );
        }

        return React.createElement(
            'div',
            { className: '' },
            teamNames,
            missionTimer,
            React.createElement(
                'div',
                { className: 'row' },
                React.createElement(MessageList, { className: 'col-xs-12', messages: this.state.messages })
            ),
            React.createElement(
                'div',
                { className: 'row' },
                React.createElement(
                    'div',
                    { className: 'col-xs-12' },
                    React.createElement(
                        'div',
                        { className: 'jumbotron taskbox' },
                        React.createElement(
                            'h2',
                            { className: 'taskbox__header' },
                            'Oppgave'
                        ),
                        React.createElement(
                            'span',
                            { className: 'taskbox__text ' + blink },
                            ' ',
                            this.state.taskStore.currentTask,
                            ' '
                        )
                    )
                )
            ),
            content
        );
    }

});

module.exports = Task;

//console.log('componentDidUnmount');

//console.log('.componentDidUpdate');
/* if you want this to be sticky: http://codepen.io/senff/pen/ayGvD */

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../stores/message-store":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/message-store.js","../stores/route-store":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/route-store.js","../stores/task-store":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/task-store.js","./introduction-screen.react.js":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/introduction-screen.react.js","./message-list.react":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/message-list.react.js","./mission-timer.react.js":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/mission-timer.react.js","./science-task.react":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/science-task.react.js","./team-displayer.react":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/team-displayer.react.js","util":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/util/util.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/team-displayer.react.js":[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var RouteStore = require('../stores/route-store');
var teamNames = require('../team-name-map');

var TeamWidget = React.createClass({
    displayName: 'TeamWidget',

    contextTypes: {
        router: React.PropTypes.func
    },

    mixins: [],

    _onChange: function _onChange() {
        this.forceUpdate();
    },

    componentDidMount: function componentDidMount() {},

    componentWillUnmount: function componentWillUnmount() {},

    teamName: function teamName() {
        return teamNames.nameMap[RouteStore.getTeamId()];
    },

    otherTeamNames: function otherTeamNames() {
        return teamNames.otherTeamNames(RouteStore.getTeamId());
    },

    render: function render() {

        return React.createElement(
            'div',
            { className: this.props.className + ' teamwidget' },
            React.createElement(
                'span',
                { className: 'active' },
                this.teamName()
            ),
            React.createElement(
                'span',
                { className: '' },
                ', ',
                this.otherTeamNames(),
                ' '
            )
        );
    }
});

module.exports = TeamWidget;

//RouteStore.addChangeListener(this._onChange);

//RouteStore.removeChangeListener(this._onChange);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../stores/route-store":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/route-store.js","../team-name-map":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/team-name-map.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/timer-panel.react.js":[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null),
    actions = require('../actions/TimerActionCreators'),
    Timer = require('./timer.react.js'),
    TimerStore = require('../stores/timer-store');

module.exports = React.createClass({
    displayName: 'exports',

    propTypes: {
        timerId: React.PropTypes.string.isRequired
    },

    getInitialState: function getInitialState() {
        return this._getTimerState();
    },

    componentDidMount: function componentDidMount() {
        TimerStore.addChangeListener(this._handleTimeStoreChange);
    },

    componentWillUnmount: function componentWillUnmount() {
        TimerStore.removeChangeListener(this._handleTimeStoreChange);
    },

    shouldComponentUpdate: function shouldComponentUpdate(nextProps, nextState) {
        return nextState.timeInSeconds !== this.state.timeInSeconds;
    },

    componentDidUpdate: function componentDidUpdate() {},

    _handleTimeStoreChange: function _handleTimeStoreChange() {
        this.setState(this._getTimerState());
    },

    _handleClick: function _handleClick() {
        actions.startTimer(this.props.timerId);
    },

    _getTimerState: function _getTimerState() {
        return {
            ready: TimerStore.isReadyToStart(this.props.timerId),
            timeInSeconds: TimerStore.getRemainingTime(this.props.timerId)
        };
    },

    render: function render() {
        return React.createElement(
            'section',
            { className: 'timer ' + this.props.className },
            React.createElement(
                'div',
                { className: 'row' },
                React.createElement(
                    'div',
                    { className: 'timer--button col-xs-5 ' },
                    React.createElement(
                        'button',
                        {
                            className: 'btn btn-primary' + (this.state.ready ? '' : 'disabled'),
                            onClick: this._handleClick },
                        'Start klokka'
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'timer--value col-xs-6 padding-xs-1' },
                    React.createElement(Timer, { timeInSeconds: this.state.timeInSeconds })
                )
            )
        );
    }
});

//console.log('TimerPanel.componentDidUpdate');

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../actions/TimerActionCreators":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/actions/TimerActionCreators.js","../stores/timer-store":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/timer-store.js","./timer.react.js":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/timer.react.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/timer.react.js":[function(require,module,exports){
(function (global){
// This example can be modified to act as a countdown timer

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null),
    printf = require('printf');

function pad(num) {
    return printf('%02d', num);
}

var Timer = React.createClass({
    displayName: 'Timer',

    propTypes: {
        timeInSeconds: React.PropTypes.number.isRequired
    },

    componentDidUpdate: function componentDidUpdate() {},

    shouldComponentUpdate: function shouldComponentUpdate(nextProps, nextState) {
        return nextProps.timeInSeconds !== this.props.timeInSeconds;
    },

    _minutes: function _minutes() {
        return pad(Math.max(0, this.props.timeInSeconds) / 60 >> 0);
    },

    _seconds: function _seconds() {
        return pad(Math.max(0, this.props.timeInSeconds) % 60);
    },

    _timeValue: function _timeValue() {
        return this._minutes() + ':' + this._seconds();
    },

    render: function render() {
        return React.createElement(
            'div',
            { className: 'mission-timer-value' },
            ' ',
            this._timeValue()
        );
    }
});

module.exports = Timer;

//console.log('Timer.componentDidUpdate');

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"printf":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/printf/lib/printf.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/constants/MessageConstants.js":[function(require,module,exports){
'use strict';

var _Object$freeze = require('babel-runtime/core-js/object/freeze')['default'];

module.exports = _Object$freeze({
    // events
    MESSAGE_ADDED: 'MESSAGE_ADDED',
    REMOVE_MESSAGE: 'REMOVE_MESSAGE'
});

},{"babel-runtime/core-js/object/freeze":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/core-js/object/freeze.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/constants/MissionConstants.js":[function(require,module,exports){
'use strict';

module.exports = require('react/lib/keyMirror')({
    MISSION_TIME_SYNC: 'MISSION_TIME_SYNC',
    MISSION_STARTED_EVENT: 'MISSION_STARTED_EVENT',
    MISSION_STOPPED_EVENT: 'MISSION_STOPPED_EVENT',
    MISSION_COMPLETED_EVENT: 'MISSION_COMPLETED_EVENT',
    MISSION_WAS_RESET: 'MISSION_WAS_RESET',
    RECEIVED_EVENTS: null,
    INTRODUCTION_READ: 'INTRODUCTION_READ',
    START_TASK: 'START_TASK',
    COMPLETED_TASK: 'COMPLETED_TASK',
    ASK_FOR_APP_STATE: 'ASK_FOR_APP_STATE',
    RECEIVED_APP_STATE: 'RECEIVED_APP_STATE',
    SENDING_TEAM_STATE: 'SENDING_TEAM_STATE'
});

},{"react/lib/keyMirror":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/react/lib/keyMirror.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/constants/RouterConstants.js":[function(require,module,exports){
'use strict';

var _Object$freeze = require('babel-runtime/core-js/object/freeze')['default'];

module.exports = _Object$freeze({
    // events
    ROUTE_CHANGED_EVENT: 'ROUTE_CHANGED_EVENT',
    ROUTER_AVAILABLE: 'ROUTER_AVAILABLE' });

},{"babel-runtime/core-js/object/freeze":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/core-js/object/freeze.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/constants/ScienceTeamConstants.js":[function(require,module,exports){
'use strict';

var _Object$freeze = require('babel-runtime/core-js/object/freeze')['default'];

module.exports = _Object$freeze({
    // ids
    SCIENCE_TIMER_1: 'SCIENCE_TIMER_1',
    SCIENCE_RADIATION_WARNING_MSG: 'SCIENCE_RADIATION_WARNING_MSG',

    SCIENCE_CLEAR_RADIATION_SAMPLES: 'SCIENCE_CLEAR_RADIATION_SAMPLES',

    // events
    SCIENCE_COUNTDOWN_TIMER_CHANGED: 'SCIENCE_COUNTDOWN_TIMER_CHANGED',
    SCIENCE_TAKE_RADIATION_SAMPLE: 'SCIENCE_TAKE_RADIATION_SAMPLE',
    SCIENCE_RADIATION_LEVEL_CHANGED: 'SCIENCE_RADIATION_LEVEL_CHANGED',
    SCIENCE_TOTAL_RADIATION_LEVEL_CHANGED: 'SCIENCE_TOTAL_RADIATION_LEVEL_CHANGED',
    SCIENCE_AVG_RADIATION_CALCULATED: 'SCIENCE_AVG_RADIATION_CALCULATED',

    // values
    SCIENCE_RADIATION_MIN: 0,
    SCIENCE_RADIATION_MAX: 100,
    SCIENCE_AVG_RAD_GREEN_VALUE: 0,
    SCIENCE_AVG_RAD_ORANGE_VALUE: 15,
    SCIENCE_AVG_RAD_RED_VALUE: 50,
    SCIENCE_AVG_RAD_ORANGE_THRESHOLD: 40,
    SCIENCE_AVG_RAD_RED_THRESHOLD: 75,
    SCIENCE_TOTAL_RADIATION_SERIOUS_THRESHOLD: 50,
    SCIENCE_TOTAL_RADIATION_VERY_SERIOUS_THRESHOLD: 75
});

},{"babel-runtime/core-js/object/freeze":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/core-js/object/freeze.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/constants/TimerConstants.js":[function(require,module,exports){
'use strict';

module.exports = {
    SET_TIMER: 'SET_TIMER',
    START_TIMER: 'START_TIMER',
    STOP_TIMER: 'STOP_TIMER',
    RESET_TIMER: 'RESET_TIMER'
};

},{}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/router-container.js":[function(require,module,exports){
(function (global){
// proxy access to the router as first step in bringing it into the flux flow
// @see https://github.com/rackt/react-router/blob/master/docs/guides/flux.md

'use strict';

var router = null;

window.__router = module.exports = {
    transitionTo: function transitionTo(to, params, query) {
        return router.transitionTo(to, params, query);
    },

    getCurrentPathname: function getCurrentPathname() {
        return window.location.pathname;
    },

    getTeamId: function getTeamId() {
        return this.getCurrentPathname().split('/')[1];
    },

    getTaskId: function getTaskId() {
        return this.getCurrentPathname().split('/')[3];
    },

    run: function run() {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return router.run.apply(router, args);
    }
};

var Router = (typeof window !== "undefined" ? window.ReactRouter : typeof global !== "undefined" ? global.ReactRouter : null);
var routes = require('./routes.react');

// By the time route config is require()-d,
// require('./router') already returns a valid object

router = Router.create({
    routes: routes,

    // Use the HTML5 History API for clean URLs
    location: Router.HistoryLocation
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./routes.react":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/routes.react.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/routes.react.js":[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var Router = (typeof window !== "undefined" ? window.ReactRouter : typeof global !== "undefined" ? global.ReactRouter : null);
var Route = Router.Route;
var NotFoundRoute = Router.NotFoundRoute;
var DefaultRoute = Router.DefaultRoute;

var App = require('./components/app.react');
var MissionCommanderApp = require('./components/commander-app.react');
var IndexApp = require('./components/index-app.react');
var NotFound = require('./components/not-found.react');
var IntroScreen = require('./components/introduction-screen.react');
var Task = require('./components/task.react');
var DummyRenderMixin = require('./components/dummy-render.mixin');

var RedirectToIntro = React.createClass({
    displayName: 'RedirectToIntro',

    statics: {
        willTransitionTo: function willTransitionTo(transition) {
            transition.redirect(transition.path + '/intro');
        }
    },

    mixins: [DummyRenderMixin]
});

var routes = React.createElement(
    Route,
    { name: 'app', path: '/', handler: App },
    React.createElement(Route, { name: 'leader', handler: MissionCommanderApp }),
    React.createElement(Route, { name: 'team-root', path: '/:teamId', handler: RedirectToIntro }),
    React.createElement(Route, { name: 'team-intro', path: '/:teamId/intro', handler: IntroScreen }),
    React.createElement(Route, { name: 'team-task', path: '/:teamId/task/:taskId', handler: Task }),
    React.createElement(NotFoundRoute, { handler: NotFound }),
    React.createElement(DefaultRoute, { handler: IndexApp })
);

module.exports = routes;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./components/app.react":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/app.react.js","./components/commander-app.react":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/commander-app.react.js","./components/dummy-render.mixin":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/dummy-render.mixin.js","./components/index-app.react":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/index-app.react.js","./components/introduction-screen.react":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/introduction-screen.react.js","./components/not-found.react":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/not-found.react.js","./components/task.react":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/task.react.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/base-store.js":[function(require,module,exports){
'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var EventEmitter = require('events');
var CHANGE_EVENT = 'CHANGE_EVENT';

var path = null;

var BaseStore = (function (_EventEmitter) {
    function BaseStore() {
        _classCallCheck(this, BaseStore);

        if (_EventEmitter != null) {
            _EventEmitter.apply(this, arguments);
        }
    }

    _inherits(BaseStore, _EventEmitter);

    _createClass(BaseStore, [{
        key: 'emitChange',
        value: function emitChange() {
            this.emit(CHANGE_EVENT);
        }
    }, {
        key: 'addChangeListener',

        /**
         * @param {function} callback
         * @returns emitter, so calls can be chained.
         */
        value: function addChangeListener(callback) {
            return this.on(CHANGE_EVENT, callback);
        }
    }, {
        key: 'removeChangeListener',

        /**
         * @param {function} callback
         * @returns emitter, so calls can be chained.
         */
        value: function removeChangeListener(callback) {
            return this.removeListener(CHANGE_EVENT, callback);
        }
    }, {
        key: 'dispatcherIndex',
        value: undefined,
        enumerable: true
    }]);

    return BaseStore;
})(EventEmitter);

module.exports = BaseStore;

},{"babel-runtime/helpers/class-call-check":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/helpers/class-call-check.js","babel-runtime/helpers/create-class":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/helpers/create-class.js","babel-runtime/helpers/inherits":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/helpers/inherits.js","events":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/events/events.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/event-store.js":[function(require,module,exports){
'use strict';

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var Dispatcher = require('../appdispatcher');
var MConstants = require('../constants/MissionConstants');
var BaseStore = require('./base-store');

var eventsCollection = {
    remaining: [],
    completed: [],
    overdue: []
};

var EventStore = module.exports = window.__eventStore = _Object$assign(new BaseStore(), {

    remaining: function remaining() {
        return eventsCollection.remaining;
    },

    completed: function completed() {
        return eventsCollection.completed;
    },

    overdue: function overdue() {
        return eventsCollection.overdue;
    },

    dispatcherIndex: Dispatcher.register(function (payload) {

        switch (payload.action) {

            case MConstants.RECEIVED_EVENTS:
                eventsCollection.remaining = payload.remaining;
                eventsCollection.overdue = payload.overdue;
                eventsCollection.completed = payload.completed;
                EventStore.emitChange();

                break;
        }

        return true;
    })
});

//window.__eventStore = module.exports;

},{"../appdispatcher":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/appdispatcher.js","../constants/MissionConstants":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/constants/MissionConstants.js","./base-store":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/base-store.js","babel-runtime/core-js/object/assign":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/core-js/object/assign.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/introduction-store.js":[function(require,module,exports){
/* Holds the state of whether introductions have been read */

'use strict';

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var AppDispatcher = require('../appdispatcher');
var BaseStore = require('./base-store');
var constants = require('../constants/MissionConstants');
var window = require('global/window');
var introRead = {};

var IntroductionStore = _Object$assign(new BaseStore(), {

    setIntroductionRead: function setIntroductionRead(team) {
        introRead['intro_' + team] = true;
        this.emitChange();
    },

    isIntroductionRead: function isIntroductionRead(team) {
        if (!team) {
            throw new Error('Missing argument "team"');
        }

        return introRead['intro_' + team];
    },

    dispatcherIndex: AppDispatcher.register(function (payload) {
        var action = payload.action;

        switch (action) {
            case constants.INTRODUCTION_READ:
                IntroductionStore.setIntroductionRead(payload.teamName);
                break;
        }

        return true; // No errors. Needed by promise in Dispatcher.
    })

});

window.__IntroductionStore = IntroductionStore;
module.exports = IntroductionStore;

},{"../appdispatcher":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/appdispatcher.js","../constants/MissionConstants":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/constants/MissionConstants.js","./base-store":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/base-store.js","babel-runtime/core-js/object/assign":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/core-js/object/assign.js","global/window":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/global/window.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/message-store.js":[function(require,module,exports){
/* A store that can be queried for the current path */

'use strict';

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

var _require = require('events');

var Emitter = _require.Emitter;

var AppDispatcher = require('../appdispatcher');
var BaseStore = require('./base-store');

var _require2 = require('../constants/MessageConstants');

var REMOVE_MESSAGE = _require2.REMOVE_MESSAGE;
var MESSAGE_ADDED = _require2.MESSAGE_ADDED;

var messages = {};

var MessageStore = _Object$assign(new BaseStore(), {

    reset: function reset() {
        messages = {};
        this.emitChange();
    },

    handleAddedMessage: function handleAddedMessage(data) {
        data.dismissable = data.dismissable === undefined ? true : data.dismissable;
        messages[data.id] = data;
        this.emitChange();
    },

    handleRemoveMessage: function handleRemoveMessage(id) {
        delete messages[id];
        this.emitChange();
    },

    /**
     * A list of all messages matching filter
     * @param [filter]
     * @returns []Message a Message = { text, id, level }
     */
    getMessages: function getMessages(filter) {
        if (!filter) {
            return _Object$keys(messages).map(function (msgKey) {
                return messages[msgKey];
            });
        } else throw new Error('UNIMPLEMENTED "filter" feature');
    },

    dispatcherIndex: AppDispatcher.register(function (payload) {
        var action = payload.action;
        var data = payload.data;

        switch (action) {
            case MESSAGE_ADDED:
                MessageStore.handleAddedMessage(data);
                break;
            case REMOVE_MESSAGE:
                MessageStore.handleRemoveMessage(data);
        }

        return true; // No errors. Needed by promise in Dispatcher.
    })

});

window.__MessageStore = MessageStore;
module.exports = MessageStore;

},{"../appdispatcher":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/appdispatcher.js","../constants/MessageConstants":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/constants/MessageConstants.js","./base-store":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/base-store.js","babel-runtime/core-js/object/assign":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/core-js/object/assign.js","babel-runtime/core-js/object/keys":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/core-js/object/keys.js","events":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/events/events.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/mission-state-store.js":[function(require,module,exports){
/* A store that can be queried for the current path */

'use strict';

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var _require = require('events');

var Emitter = _require.Emitter;

var AppDispatcher = require('../appdispatcher');
var BaseStore = require('./base-store');

var _require2 = require('../constants/MissionConstants');

var MISSION_STARTED_EVENT = _require2.MISSION_STARTED_EVENT;
var MISSION_STOPPED_EVENT = _require2.MISSION_STOPPED_EVENT;
var RECEIVED_APP_STATE = _require2.RECEIVED_APP_STATE;

var missionRunning = false,
    missionHasBeenStopped = false;

var MissionStateStore = _Object$assign(new BaseStore(), {

    handleMissionStarted: function handleMissionStarted() {
        missionRunning = true;
        this.emitChange();
    },

    handleMissionStopped: function handleMissionStopped() {
        missionRunning = false;
        this.emitChange();
    },

    isMissionRunning: function isMissionRunning() {
        return missionRunning;
    },

    isMissionStopped: function isMissionStopped() {
        return missionHasBeenStopped;
    },

    dispatcherIndex: AppDispatcher.register(function (payload) {
        var action = payload.action;

        switch (action) {
            case MISSION_STARTED_EVENT:
                return MissionStateStore.handleMissionStarted();

            case MISSION_STOPPED_EVENT:
                return MissionStateStore.handleMissionStopped();

            case RECEIVED_APP_STATE:
                missionRunning = payload.appState.mission_running;
                return MissionStateStore.emitChange();
        }

        return true; // No errors. Needed by promise in Dispatcher.
    })

});

window.__MissionStateStore = MissionStateStore;
module.exports = MissionStateStore;

},{"../appdispatcher":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/appdispatcher.js","../constants/MissionConstants":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/constants/MissionConstants.js","./base-store":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/base-store.js","babel-runtime/core-js/object/assign":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/core-js/object/assign.js","events":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/events/events.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/radiation-store.js":[function(require,module,exports){
/* A singleton store that can be queried for remaining time */

'use strict';

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var AppDispatcher = require('../appdispatcher');
var BaseStore = require('./base-store');
var ScienceTeamConstants = require('../constants/ScienceTeamConstants');
var MissionConstants = require('../constants/MissionConstants');
var randomInt = require('../utils').randomInt;
var radiationRange = {
    min: 20,
    max: 40
};
var samples = [];
var totalRadiation = 0;
var lastCalculatedAverage = null;

var RadiationStore = _Object$assign(new BaseStore(), {

    _setRadiationLevel: function _setRadiationLevel(min, max) {
        radiationRange.min = min;
        radiationRange.max = max;
        this.emitChange();
    },

    _clearSamples: function _clearSamples() {
        samples = [];
        this.emitChange();
    },

    _takeSample: function _takeSample() {
        samples.push(this.getLevel());
        this.emitChange();
    },

    getLevel: function getLevel() {
        return randomInt(radiationRange.min, radiationRange.max);
    },

    getTotalLevel: function getTotalLevel() {
        return totalRadiation;
    },

    getSamples: function getSamples() {
        return samples.slice();
    },

    getState: function getState() {
        return {
            samples: samples.slice(0),
            total: totalRadiation,
            currentLevel: this.getLevel(),
            lastCalculatedAverage: lastCalculatedAverage
        };
    },

    dispatcherIndex: AppDispatcher.register(function (payload) {
        var action = payload.action;
        var data = payload.data;

        switch (action) {
            case ScienceTeamConstants.SCIENCE_RADIATION_LEVEL_CHANGED:
                RadiationStore._setRadiationLevel(data.min, data.max);
                break;
            case ScienceTeamConstants.SCIENCE_TOTAL_RADIATION_LEVEL_CHANGED:
                totalRadiation = data.total;
                RadiationStore.emitChange();
                break;

            case ScienceTeamConstants.SCIENCE_TAKE_RADIATION_SAMPLE:
                RadiationStore._takeSample();
                break;
            case ScienceTeamConstants.SCIENCE_AVG_RADIATION_CALCULATED:
                lastCalculatedAverage = data.average;
                RadiationStore.emitChange();
                break;
            case ScienceTeamConstants.SCIENCE_CLEAR_RADIATION_SAMPLES:
                samples = [];
                RadiationStore.emitChange();
                break;
            case MissionConstants.RECEIVED_APP_STATE:
                var appState = payload.appState;

                if (appState.science && appState.science.radiation) {
                    var radiation = appState.science.radiation;
                    samples = radiation.samples;
                    lastCalculatedAverage = radiation.lastCalculatedAverage;
                    totalRadiation = radiation.total;
                }

                RadiationStore.emitChange();
                break;
            case MissionConstants.MISSION_WAS_RESET:
                samples = [];
                lastCalculatedAverage = null;
                totalRadiation = 0;
                break;
        }

        return true; // No errors. Needed by promise in Dispatcher.
    })

});

window.__RadiationStore = RadiationStore;
module.exports = RadiationStore;

},{"../appdispatcher":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/appdispatcher.js","../constants/MissionConstants":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/constants/MissionConstants.js","../constants/ScienceTeamConstants":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/constants/ScienceTeamConstants.js","../utils":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/utils.js","./base-store":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/base-store.js","babel-runtime/core-js/object/assign":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/core-js/object/assign.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/route-store.js":[function(require,module,exports){
/* A store that can be queried for the current path */

'use strict';

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var AppDispatcher = require('../appdispatcher');
var BaseStore = require('./base-store');

var _require = require('../constants/RouterConstants');

var ROUTE_CHANGED_EVENT = _require.ROUTE_CHANGED_EVENT;

var _require2 = require('../utils');

var cleanRootPath = _require2.cleanRootPath;

var router = require('../router-container');

var RouteStore = _Object$assign(new BaseStore(), {

    handleRouteChanged: function handleRouteChanged(state) {
        this.emitChange();
    },

    getTeamId: function getTeamId() {
        return router.getTeamId();
    },

    getTaskId: function getTaskId() {
        return router.getTaskId();
    },

    dispatcherIndex: AppDispatcher.register(function (payload) {
        var action = payload.action;

        switch (action) {
            case ROUTE_CHANGED_EVENT:
                RouteStore.handleRouteChanged(payload.state);
                break;
        }

        return true; // No errors. Needed by promise in Dispatcher.
    })

});

window.__RouteStore = RouteStore;
module.exports = RouteStore;

},{"../appdispatcher":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/appdispatcher.js","../constants/RouterConstants":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/constants/RouterConstants.js","../router-container":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/router-container.js","../utils":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/utils.js","./base-store":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/base-store.js","babel-runtime/core-js/object/assign":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/core-js/object/assign.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/task-store.js":[function(require,module,exports){
/* A store that can be queried for the current path */

'use strict';

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var AppDispatcher = require('../appdispatcher');
var BaseStore = require('./base-store');
var RouteStore = require('./route-store');
var MissionConstants = require('../constants/MissionConstants');

var awaitingNewInstructions = {
    text: 'Venter på nye instrukser'
};

var assignments = {
    science: {
        current: null,
        'default': 'sample',
        sample: {
            text: 'Start klokka og ta fire målinger jevnt fordelt utover de 30 sekundene',
            next: 'average'
        },
        average: {
            text: 'Regn ut gjennomsnittsverdien av strålingsverdiene dere fant. Skriv den inn i tekstfeltet.',
            next: 'addtotal'
        },
        addtotal: {
            text: 'Basert på fargen som ble indikert ved evaluering av gjennomsnittsverdien ' + 'skal vi nå legge til et tall til totalt funnet strålingsmengde.' + ' For grønn status man legge til 0, ' + ' for oransj status man legge til 15, ' + ' for rød status man legge til 50.' + ' Den totale strålingsverdien i kroppen skal helst ikke gå over 50, og aldri over 75!',
            next: 'awaiting'
        },
        awaiting: awaitingNewInstructions
    }
};

var TaskStore = _Object$assign(new BaseStore(), {

    getCurrentTask: function getCurrentTask() {
        var teamId = RouteStore.getTeamId();
        var assignmentsForTeam = assignments[teamId];
        return assignmentsForTeam && assignmentsForTeam[this.getCurrentTaskId(teamId)] || 'Ingen oppgave funnet';
    },

    getCurrentTaskId: function getCurrentTaskId() {
        var teamId = arguments[0] === undefined ? RouteStore.getTeamId() : arguments[0];

        if (!teamId.length) {
            return null;
        }return assignments[teamId].current || 'awaiting';
    },

    getState: function getState() {
        return {
            currentTaskId: this.getCurrentTaskId(),
            currentTask: this.getCurrentTask().text,
            nextTaskId: this.getCurrentTask().next
        };
    },

    dispatcherIndex: AppDispatcher.register(function (payload) {
        var taskId;
        var teamId;
        var currentTask;
        var teamTasks;

        switch (payload.action) {

            case MissionConstants.START_TASK:
                teamId = payload.teamId;
                taskId = payload.taskId;

                teamTasks = assignments[teamId];
                teamTasks.current = taskId;
                TaskStore.emitChange();
                break;

            case MissionConstants.COMPLETED_TASK:
                teamId = payload.teamId;
                taskId = payload.taskId;

                teamTasks = assignments[teamId];
                currentTask = teamTasks[taskId];
                teamTasks.current = currentTask.next;
                TaskStore.emitChange();
                break;

        }

        return true; // No errors. Needed by promise in Dispatcher.
    })

});

window.__TaskStore = TaskStore;
module.exports = TaskStore;

},{"../appdispatcher":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/appdispatcher.js","../constants/MissionConstants":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/constants/MissionConstants.js","./base-store":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/base-store.js","./route-store":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/route-store.js","babel-runtime/core-js/object/assign":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/core-js/object/assign.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/timer-store.js":[function(require,module,exports){
/* A singleton store that can be queried for remaining time */

'use strict';

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var check = require('check-types');
var AppDispatcher = require('../appdispatcher');
var BaseStore = require('./base-store');
var TimerConstants = require('../constants/TimerConstants');
var MissionConstants = require('../constants/MissionConstants');

// keeping state hidden in the module
var remainingTime = {},
    initialTime = {},
    intervalId = {},
    elapsedMissionTime = 0,
    missionTimer = null;

function reset(timerId) {
    stop(timerId);
    remainingTime[timerId] = initialTime[timerId];
}

function start(timerId) {
    assertExists(timerId);

    intervalId[timerId] = setInterval(function fn() {
        if (remainingTime[timerId] > 0) {
            remainingTime[timerId]--;
            TimerStore.emitChange();
        } else {
            stop(timerId);
        }
    }, 1000);
}

function stop(timerId) {
    assertExists(timerId);

    clearInterval(intervalId[timerId]);
    delete intervalId[timerId];
    TimerStore.emitChange();
}

function startMissionTimer() {
    stopMissionTimer();
    missionTimer = setInterval(function () {
        elapsedMissionTime++;
        TimerStore.emitChange();
    }, 1000);
}

function stopMissionTimer() {
    clearInterval(missionTimer);
}

/**
 * @param data.remainingTime {Number}
 * @param data.timerId {string}
 */
function handleRemainingTimeChanged(data) {
    var remaining = data.remainingTime;
    if (remaining <= 0) throw new TypeError('Got invalid remaining time :' + remaining);

    remainingTime[data.timerId] = remaining;
    initialTime[data.timerId] = remaining;
    TimerStore.emitChange();
}

function assertExists(timerId) {
    check.assert(timerId in remainingTime, 'No time set for timer with id ' + timerId);
}

var TimerStore = _Object$assign(new BaseStore(), {

    getRemainingTime: function getRemainingTime(timerId) {
        check.number(timerId);
        return remainingTime[timerId];
    },

    isRunning: function isRunning(timerId) {
        check.number(timerId);
        return !!intervalId[timerId];
    },

    /**
     * The timer is set (or has been reset), but not started
     * @param timerId
     * @returns true if ready, false if running or timed out
     */
    isReadyToStart: function isReadyToStart(timerId) {
        check.number(timerId);

        if (this.isRunning(timerId)) {
            return false;
        }return this.getRemainingTime(timerId) > 0;
    },

    getElapsedMissionTime: function getElapsedMissionTime() {
        return elapsedMissionTime;
    },

    dispatcherIndex: AppDispatcher.register(function (payload) {
        var action = payload.action;
        var data = payload.data;

        switch (action) {

            case TimerConstants.SET_TIMER:
                handleRemainingTimeChanged(data);
                break;

            case TimerConstants.START_TIMER:
                assertExists(data.timerId);

                // avoid setting up more than one timer
                if (!TimerStore.isRunning(data.timerId)) {
                    start(data.timerId);
                }
                break;

            case TimerConstants.STOP_TIMER:
                stop(data.timerId);
                break;

            case TimerConstants.RESET_TIMER:
                reset(data.timerId);
                break;

            case MissionConstants.MISSION_STARTED_EVENT:
                startMissionTimer();
                break;

            case MissionConstants.MISSION_STOPPED_EVENT:
                stopMissionTimer();
                break;

            case MissionConstants.RECEIVED_APP_STATE:
                var appState = payload.appState;

                elapsedMissionTime = appState.elapsed_mission_time;

                if (appState.mission_running) {
                    startMissionTimer();
                } else {
                    stopMissionTimer();
                }

                TimerStore.emitChange();
                break;

            case MissionConstants.MISSION_TIME_SYNC:
                elapsedMissionTime = data.elapsedMissionTime;
                TimerStore.emitChange();
                break;
        }

        return true; // No errors. Needed by promise in Dispatcher.
    })

});

window.__TimeStore = TimerStore;
module.exports = TimerStore;

},{"../appdispatcher":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/appdispatcher.js","../constants/MissionConstants":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/constants/MissionConstants.js","../constants/TimerConstants":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/constants/TimerConstants.js","./base-store":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/base-store.js","babel-runtime/core-js/object/assign":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/core-js/object/assign.js","check-types":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/check-types/src/check-types.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/team-name-map.js":[function(require,module,exports){
'use strict';

var _Object$freeze = require('babel-runtime/core-js/object/freeze')['default'];

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

var teamMap = _Object$freeze({
    leader: 'operasjonsleder',
    science: 'forskningsteam',
    communication: 'kommunikasjonsteam',
    security: 'sikkerhetsteam',
    astronaut: 'astronautteam'
});

function otherTeamNames(currentTeamId) {
    return _Object$keys(teamMap).filter(function (n) {
        return n !== currentTeamId && n !== 'leader';
    }).map(function (n) {
        return teamMap[n];
    }).join(', ');
}

module.exports = {
    nameMap: teamMap,
    otherTeamNames: otherTeamNames
};

},{"babel-runtime/core-js/object/freeze":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/core-js/object/freeze.js","babel-runtime/core-js/object/keys":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/core-js/object/keys.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/utils.js":[function(require,module,exports){
'use strict';

function cleanRootPath(path) {
    // convert '/science/step1' => 'science'
    return path.replace(/\/?(\w+).*/, '$1');
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max + 1 - min)) + min;
}

/**
 * Standardize number parsing.
 * @param {string} str is a non-empty string
 * @returns {Number} - possibly NaN
 *
 * The standardization step of converting '1,23' -> '1.23' is strictly not needed when handling inputs from
 * input fields that have type='number', where this happens automatically.
 * The rest of the error handling is useful, none the less.
 */
function parseNumber(str) {
    if (! typeof str === 'string') {
        throw TypeError('This function expects strings. Got something else: ' + str);
    }

    // standardize the number format - removing Norwegian currency format
    var cleanedString = str.trim().replace(',', '.');

    if (!cleanedString.length) {
        throw TypeError('Got a blank string');
    }

    if (cleanedString.indexOf('.') !== -1) {
        return parseFloat(cleanedString, 10);
    } else {
        return parseInt(cleanedString, 10);
    }
}

// generates a UUID
// worlds smallest uuid lib. crazy shit :)
// @see https://gist.github.com/jed/982883
function b(a) {
    return a ? (a ^ Math.random() * 16 >> a / 4).toString(16) : ([10000000] + -1000 + -4000 + -8000 + -100000000000).replace(/[018]/g, b);
}

function lazyRequire(path) {
    var tmp = null;
    return function () {
        if (!tmp) tmp = require(path);
        return tmp;
    };
}

module.exports = {
    cleanRootPath: cleanRootPath, randomInt: randomInt, parseNumber: parseNumber, uuid: b, lazyRequire: lazyRequire
};

},{}],"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/core-js/object/assign.js":[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/assign"), __esModule: true };
},{"core-js/library/fn/object/assign":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/node_modules/core-js/library/fn/object/assign.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/core-js/object/freeze.js":[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/freeze"), __esModule: true };
},{"core-js/library/fn/object/freeze":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/node_modules/core-js/library/fn/object/freeze.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/core-js/object/keys.js":[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/keys"), __esModule: true };
},{"core-js/library/fn/object/keys":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/node_modules/core-js/library/fn/object/keys.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/helpers/class-call-check.js":[function(require,module,exports){
"use strict";

exports["default"] = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

exports.__esModule = true;
},{}],"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/helpers/create-class.js":[function(require,module,exports){
"use strict";

exports["default"] = (function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
})();

exports.__esModule = true;
},{}],"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/helpers/extends.js":[function(require,module,exports){
"use strict";

var _Object$assign = require("babel-runtime/core-js/object/assign")["default"];

exports["default"] = _Object$assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

exports.__esModule = true;
},{"babel-runtime/core-js/object/assign":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/core-js/object/assign.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/helpers/inherits.js":[function(require,module,exports){
"use strict";

exports["default"] = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) subClass.__proto__ = superClass;
};

exports.__esModule = true;
},{}],"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/node_modules/core-js/library/fn/object/assign.js":[function(require,module,exports){
require('../../modules/es6.object.assign');
module.exports = require('../../modules/$').core.Object.assign;
},{"../../modules/$":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/node_modules/core-js/library/modules/$.js","../../modules/es6.object.assign":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/node_modules/core-js/library/modules/es6.object.assign.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/node_modules/core-js/library/fn/object/freeze.js":[function(require,module,exports){
require('../../modules/es6.object.statics-accept-primitives');
module.exports = require('../../modules/$').core.Object.freeze;
},{"../../modules/$":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/node_modules/core-js/library/modules/$.js","../../modules/es6.object.statics-accept-primitives":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/node_modules/core-js/library/modules/es6.object.statics-accept-primitives.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/node_modules/core-js/library/fn/object/keys.js":[function(require,module,exports){
require('../../modules/es6.object.statics-accept-primitives');
module.exports = require('../../modules/$').core.Object.keys;
},{"../../modules/$":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/node_modules/core-js/library/modules/$.js","../../modules/es6.object.statics-accept-primitives":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/node_modules/core-js/library/modules/es6.object.statics-accept-primitives.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/node_modules/core-js/library/modules/$.assign.js":[function(require,module,exports){
var $ = require('./$');
// 19.1.2.1 Object.assign(target, source, ...)
/*eslint-disable no-unused-vars */
module.exports = Object.assign || function assign(target, source){
/*eslint-enable no-unused-vars */
  var T = Object($.assertDefined(target))
    , l = arguments.length
    , i = 1;
  while(l > i){
    var S      = $.ES5Object(arguments[i++])
      , keys   = $.getKeys(S)
      , length = keys.length
      , j      = 0
      , key;
    while(length > j)T[key = keys[j++]] = S[key];
  }
  return T;
};
},{"./$":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/node_modules/core-js/library/modules/$.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/node_modules/core-js/library/modules/$.def.js":[function(require,module,exports){
var $          = require('./$')
  , global     = $.g
  , core       = $.core
  , isFunction = $.isFunction;
function ctx(fn, that){
  return function(){
    return fn.apply(that, arguments);
  };
}
// type bitmap
$def.F = 1;  // forced
$def.G = 2;  // global
$def.S = 4;  // static
$def.P = 8;  // proto
$def.B = 16; // bind
$def.W = 32; // wrap
function $def(type, name, source){
  var key, own, out, exp
    , isGlobal = type & $def.G
    , target   = isGlobal ? global : type & $def.S
        ? global[name] : (global[name] || {}).prototype
    , exports  = isGlobal ? core : core[name] || (core[name] = {});
  if(isGlobal)source = name;
  for(key in source){
    // contains in native
    own = !(type & $def.F) && target && key in target;
    if(own && key in exports)continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    if(isGlobal && !isFunction(target[key]))exp = source[key];
    // bind timers to global for call from export context
    else if(type & $def.B && own)exp = ctx(out, global);
    // wrap global constructors for prevent change them in library
    else if(type & $def.W && target[key] == out)!function(C){
      exp = function(param){
        return this instanceof C ? new C(param) : C(param);
      };
      exp.prototype = C.prototype;
    }(out);
    else exp = type & $def.P && isFunction(out) ? ctx(Function.call, out) : out;
    // export
    $.hide(exports, key, exp);
  }
}
module.exports = $def;
},{"./$":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/node_modules/core-js/library/modules/$.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/node_modules/core-js/library/modules/$.fw.js":[function(require,module,exports){
module.exports = function($){
  $.FW   = false;
  $.path = $.core;
  return $;
};
},{}],"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/node_modules/core-js/library/modules/$.js":[function(require,module,exports){
'use strict';
var global = typeof self != 'undefined' ? self : Function('return this')()
  , core   = {}
  , defineProperty = Object.defineProperty
  , hasOwnProperty = {}.hasOwnProperty
  , ceil  = Math.ceil
  , floor = Math.floor
  , max   = Math.max
  , min   = Math.min;
// The engine works fine with descriptors? Thank's IE8 for his funny defineProperty.
var DESC = !!function(){
  try {
    return defineProperty({}, 'a', {get: function(){ return 2; }}).a == 2;
  } catch(e){ /* empty */ }
}();
var hide = createDefiner(1);
// 7.1.4 ToInteger
function toInteger(it){
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
}
function desc(bitmap, value){
  return {
    enumerable  : !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable    : !(bitmap & 4),
    value       : value
  };
}
function simpleSet(object, key, value){
  object[key] = value;
  return object;
}
function createDefiner(bitmap){
  return DESC ? function(object, key, value){
    return $.setDesc(object, key, desc(bitmap, value)); // eslint-disable-line no-use-before-define
  } : simpleSet;
}

function isObject(it){
  return it !== null && (typeof it == 'object' || typeof it == 'function');
}
function isFunction(it){
  return typeof it == 'function';
}
function assertDefined(it){
  if(it == undefined)throw TypeError("Can't call method on  " + it);
  return it;
}

var $ = module.exports = require('./$.fw')({
  g: global,
  core: core,
  html: global.document && document.documentElement,
  // http://jsperf.com/core-js-isobject
  isObject:   isObject,
  isFunction: isFunction,
  it: function(it){
    return it;
  },
  that: function(){
    return this;
  },
  // 7.1.4 ToInteger
  toInteger: toInteger,
  // 7.1.15 ToLength
  toLength: function(it){
    return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
  },
  toIndex: function(index, length){
    index = toInteger(index);
    return index < 0 ? max(index + length, 0) : min(index, length);
  },
  has: function(it, key){
    return hasOwnProperty.call(it, key);
  },
  create:     Object.create,
  getProto:   Object.getPrototypeOf,
  DESC:       DESC,
  desc:       desc,
  getDesc:    Object.getOwnPropertyDescriptor,
  setDesc:    defineProperty,
  getKeys:    Object.keys,
  getNames:   Object.getOwnPropertyNames,
  getSymbols: Object.getOwnPropertySymbols,
  // Dummy, fix for not array-like ES3 string in es5 module
  assertDefined: assertDefined,
  ES5Object: Object,
  toObject: function(it){
    return $.ES5Object(assertDefined(it));
  },
  hide: hide,
  def: createDefiner(0),
  set: global.Symbol ? simpleSet : hide,
  mix: function(target, src){
    for(var key in src)hide(target, key, src[key]);
    return target;
  },
  each: [].forEach
});
if(typeof __e != 'undefined')__e = core;
if(typeof __g != 'undefined')__g = global;
},{"./$.fw":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/node_modules/core-js/library/modules/$.fw.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/node_modules/core-js/library/modules/es6.object.assign.js":[function(require,module,exports){
// 19.1.3.1 Object.assign(target, source)
var $def = require('./$.def');
$def($def.S, 'Object', {assign: require('./$.assign')});
},{"./$.assign":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/node_modules/core-js/library/modules/$.assign.js","./$.def":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/node_modules/core-js/library/modules/$.def.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/node_modules/core-js/library/modules/es6.object.statics-accept-primitives.js":[function(require,module,exports){
var $        = require('./$')
  , $def     = require('./$.def')
  , isObject = $.isObject
  , toObject = $.toObject;
function wrapObjectMethod(METHOD, MODE){
  var fn  = ($.core.Object || {})[METHOD] || Object[METHOD]
    , f   = 0
    , o   = {};
  o[METHOD] = MODE == 1 ? function(it){
    return isObject(it) ? fn(it) : it;
  } : MODE == 2 ? function(it){
    return isObject(it) ? fn(it) : true;
  } : MODE == 3 ? function(it){
    return isObject(it) ? fn(it) : false;
  } : MODE == 4 ? function getOwnPropertyDescriptor(it, key){
    return fn(toObject(it), key);
  } : MODE == 5 ? function getPrototypeOf(it){
    return fn(Object($.assertDefined(it)));
  } : function(it){
    return fn(toObject(it));
  };
  try {
    fn('z');
  } catch(e){
    f = 1;
  }
  $def($def.S + $def.F * f, 'Object', o);
}
wrapObjectMethod('freeze', 1);
wrapObjectMethod('seal', 1);
wrapObjectMethod('preventExtensions', 1);
wrapObjectMethod('isFrozen', 2);
wrapObjectMethod('isSealed', 2);
wrapObjectMethod('isExtensible', 3);
wrapObjectMethod('getOwnPropertyDescriptor', 4);
wrapObjectMethod('getPrototypeOf', 5);
wrapObjectMethod('keys');
wrapObjectMethod('getOwnPropertyNames');
},{"./$":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/node_modules/core-js/library/modules/$.js","./$.def":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/node_modules/core-js/library/modules/$.def.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/browser-resolve/empty.js":[function(require,module,exports){

},{}],"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/buffer/index.js":[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('is-array')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192 // not used by this implementation

var kMaxLength = 0x3fffffff
var rootParent = {}

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Note:
 *
 * - Implementation must support adding new properties to `Uint8Array` instances.
 *   Firefox 4-29 lacked support, fixed in Firefox 30+.
 *   See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *  - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *  - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *    incorrect length in some situations.
 *
 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they will
 * get the Object implementation, which is slower but will work correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = (function () {
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return arr.foo() === 42 && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        new Uint8Array(1).subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding) {
  var self = this
  if (!(self instanceof Buffer)) return new Buffer(subject, encoding)

  var type = typeof subject
  var length

  if (type === 'number') {
    length = +subject
  } else if (type === 'string') {
    length = Buffer.byteLength(subject, encoding)
  } else if (type === 'object' && subject !== null) {
    // assume object is array-like
    if (subject.type === 'Buffer' && isArray(subject.data)) subject = subject.data
    length = +subject.length
  } else {
    throw new TypeError('must start with number, buffer, array or string')
  }

  if (length > kMaxLength) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum size: 0x' +
      kMaxLength.toString(16) + ' bytes')
  }

  if (length < 0) length = 0
  else length >>>= 0 // coerce to uint32

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    self = Buffer._augment(new Uint8Array(length)) // eslint-disable-line consistent-this
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    self.length = length
    self._isBuffer = true
  }

  var i
  if (Buffer.TYPED_ARRAY_SUPPORT && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    self._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    if (Buffer.isBuffer(subject)) {
      for (i = 0; i < length; i++) {
        self[i] = subject.readUInt8(i)
      }
    } else {
      for (i = 0; i < length; i++) {
        self[i] = ((subject[i] % 256) + 256) % 256
      }
    }
  } else if (type === 'string') {
    self.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer.TYPED_ARRAY_SUPPORT) {
    for (i = 0; i < length; i++) {
      self[i] = 0
    }
  }

  if (length > 0 && length <= Buffer.poolSize) self.parent = rootParent

  return self
}

function SlowBuffer (subject, encoding) {
  if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding)

  var buf = new Buffer(subject, encoding)
  delete buf.parent
  return buf
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length
  for (var i = 0, len = Math.min(x, y); i < len && a[i] === b[i]; i++) {}
  if (i !== len) {
    x = a[i]
    y = b[i]
  }
  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, totalLength) {
  if (!isArray(list)) throw new TypeError('list argument must be an Array of Buffers.')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (totalLength === undefined) {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

Buffer.byteLength = function byteLength (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    case 'hex':
      ret = str.length >>> 1
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    default:
      ret = str.length
  }
  return ret
}

// pre-set for values that may exist in the future
Buffer.prototype.length = undefined
Buffer.prototype.parent = undefined

// toString(encoding, start=0, end=buffer.length)
Buffer.prototype.toString = function toString (encoding, start, end) {
  var loweredCase = false

  start = start >>> 0
  end = end === undefined || end === Infinity ? this.length : end >>> 0

  if (!encoding) encoding = 'utf8'
  if (start < 0) start = 0
  if (end > this.length) end = this.length
  if (end <= start) return ''

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'binary':
        return binarySlice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return 0
  return Buffer.compare(this, b)
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset) {
  if (byteOffset > 0x7fffffff) byteOffset = 0x7fffffff
  else if (byteOffset < -0x80000000) byteOffset = -0x80000000
  byteOffset >>= 0

  if (this.length === 0) return -1
  if (byteOffset >= this.length) return -1

  // Negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)

  if (typeof val === 'string') {
    if (val.length === 0) return -1 // special case: looking for empty string always fails
    return String.prototype.indexOf.call(this, val, byteOffset)
  }
  if (Buffer.isBuffer(val)) {
    return arrayIndexOf(this, val, byteOffset)
  }
  if (typeof val === 'number') {
    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
      return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
    }
    return arrayIndexOf(this, [ val ], byteOffset)
  }

  function arrayIndexOf (arr, val, byteOffset) {
    var foundIndex = -1
    for (var i = 0; byteOffset + i < arr.length; i++) {
      if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex
      } else {
        foundIndex = -1
      }
    }
    return -1
  }

  throw new TypeError('val must be string, number or Buffer')
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function get (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function set (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) throw new Error('Invalid hex string')
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
  return charsWritten
}

function asciiWrite (buf, string, offset, length) {
  var charsWritten = blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function binaryWrite (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function utf16leWrite (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
  return charsWritten
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0

  if (length < 0 || offset < 0 || offset > this.length) {
    throw new RangeError('attempt to write outside buffer bounds')
  }

  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = utf16leWrite(this, string, offset, length)
      break
    default:
      throw new TypeError('Unknown encoding: ' + encoding)
  }
  return ret
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function binarySlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
  }

  if (newBuf.length) newBuf.parent = this.parent || this

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) >>> 0 & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) >>> 0 & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = value
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = value
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkInt(
      this, value, offset, byteLength,
      Math.pow(2, 8 * byteLength - 1) - 1,
      -Math.pow(2, 8 * byteLength - 1)
    )
  }

  var i = 0
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkInt(
      this, value, offset, byteLength,
      Math.pow(2, 8 * byteLength - 1) - 1,
      -Math.pow(2, 8 * byteLength - 1)
    )
  }

  var i = byteLength - 1
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = value
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
  if (offset < 0) throw new RangeError('index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, target_start, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (target_start >= target.length) target_start = target.length
  if (!target_start) target_start = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (target_start < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - target_start < end - start) {
    end = target.length - target_start + start
  }

  var len = end - start

  if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < len; i++) {
      target[i + target_start] = this[i + start]
    }
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }

  return len
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function fill (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (end < start) throw new RangeError('end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  if (start < 0 || start >= this.length) throw new RangeError('start out of bounds')
  if (end < 0 || end > this.length) throw new RangeError('end out of bounds')

  var i
  if (typeof value === 'number') {
    for (i = start; i < end; i++) {
      this[i] = value
    }
  } else {
    var bytes = utf8ToBytes(value.toString())
    var len = bytes.length
    for (i = start; i < end; i++) {
      this[i] = bytes[i % len]
    }
  }

  return this
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function toArrayBuffer () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1) {
        buf[i] = this[i]
      }
      return buf.buffer
    }
  } else {
    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function _augment (arr) {
  arr.constructor = Buffer
  arr._isBuffer = true

  // save reference to original Uint8Array set method before overwriting
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.equals = BP.equals
  arr.compare = BP.compare
  arr.indexOf = BP.indexOf
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUIntLE = BP.readUIntLE
  arr.readUIntBE = BP.readUIntBE
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readIntLE = BP.readIntLE
  arr.readIntBE = BP.readIntBE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUIntLE = BP.writeUIntLE
  arr.writeUIntBE = BP.writeUIntBE
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeIntLE = BP.writeIntLE
  arr.writeIntBE = BP.writeIntBE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

var INVALID_BASE64_RE = /[^+\/0-9A-z\-]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []
  var i = 0

  for (; i < length; i++) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (leadSurrogate) {
        // 2 leads in a row
        if (codePoint < 0xDC00) {
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          leadSurrogate = codePoint
          continue
        } else {
          // valid surrogate pair
          codePoint = leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00 | 0x10000
          leadSurrogate = null
        }
      } else {
        // no lead yet

        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else {
          // valid lead
          leadSurrogate = codePoint
          continue
        }
      }
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
      leadSurrogate = null
    }

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x200000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

},{"base64-js":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/buffer/node_modules/base64-js/lib/b64.js","ieee754":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/buffer/node_modules/ieee754/index.js","is-array":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/buffer/node_modules/is-array/index.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/buffer/node_modules/base64-js/lib/b64.js":[function(require,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

},{}],"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/buffer/node_modules/ieee754/index.js":[function(require,module,exports){
exports.read = function(buffer, offset, isLE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isLE ? (nBytes - 1) : 0,
      d = isLE ? -1 : 1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isLE ? 0 : (nBytes - 1),
      d = isLE ? 1 : -1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/buffer/node_modules/is-array/index.js":[function(require,module,exports){

/**
 * isArray
 */

var isArray = Array.isArray;

/**
 * toString
 */

var str = Object.prototype.toString;

/**
 * Whether or not the given `val`
 * is an array.
 *
 * example:
 *
 *        isArray([]);
 *        // > true
 *        isArray(arguments);
 *        // > false
 *        isArray('');
 *        // > false
 *
 * @param {mixed} val
 * @return {bool}
 */

module.exports = isArray || function (val) {
  return !! val && '[object Array]' == str.call(val);
};

},{}],"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/events/events.js":[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/inherits/inherits_browser.js":[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/isarray/index.js":[function(require,module,exports){
module.exports = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

},{}],"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/process/browser.js":[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;

function drainQueue() {
    if (draining) {
        return;
    }
    draining = true;
    var currentQueue;
    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        var i = -1;
        while (++i < len) {
            currentQueue[i]();
        }
        len = queue.length;
    }
    draining = false;
}
process.nextTick = function (fun) {
    queue.push(fun);
    if (!draining) {
        setTimeout(drainQueue, 0);
    }
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/readable-stream/duplex.js":[function(require,module,exports){
module.exports = require("./lib/_stream_duplex.js")

},{"./lib/_stream_duplex.js":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/readable-stream/lib/_stream_duplex.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/readable-stream/lib/_stream_duplex.js":[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a duplex stream is just a stream that is both readable and writable.
// Since JS doesn't have multiple prototypal inheritance, this class
// prototypally inherits from Readable, and then parasitically from
// Writable.

module.exports = Duplex;

/*<replacement>*/
var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) keys.push(key);
  return keys;
}
/*</replacement>*/


/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

var Readable = require('./_stream_readable');
var Writable = require('./_stream_writable');

util.inherits(Duplex, Readable);

forEach(objectKeys(Writable.prototype), function(method) {
  if (!Duplex.prototype[method])
    Duplex.prototype[method] = Writable.prototype[method];
});

function Duplex(options) {
  if (!(this instanceof Duplex))
    return new Duplex(options);

  Readable.call(this, options);
  Writable.call(this, options);

  if (options && options.readable === false)
    this.readable = false;

  if (options && options.writable === false)
    this.writable = false;

  this.allowHalfOpen = true;
  if (options && options.allowHalfOpen === false)
    this.allowHalfOpen = false;

  this.once('end', onend);
}

// the no-half-open enforcer
function onend() {
  // if we allow half-open state, or if the writable side ended,
  // then we're ok.
  if (this.allowHalfOpen || this._writableState.ended)
    return;

  // no more data can be written.
  // But allow more writes to happen in this tick.
  process.nextTick(this.end.bind(this));
}

function forEach (xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}

}).call(this,require('_process'))

},{"./_stream_readable":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/readable-stream/lib/_stream_readable.js","./_stream_writable":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/readable-stream/lib/_stream_writable.js","_process":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/process/browser.js","core-util-is":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/readable-stream/node_modules/core-util-is/lib/util.js","inherits":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/inherits/inherits_browser.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/readable-stream/lib/_stream_passthrough.js":[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a passthrough stream.
// basically just the most minimal sort of Transform stream.
// Every written chunk gets output as-is.

module.exports = PassThrough;

var Transform = require('./_stream_transform');

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

util.inherits(PassThrough, Transform);

function PassThrough(options) {
  if (!(this instanceof PassThrough))
    return new PassThrough(options);

  Transform.call(this, options);
}

PassThrough.prototype._transform = function(chunk, encoding, cb) {
  cb(null, chunk);
};

},{"./_stream_transform":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/readable-stream/lib/_stream_transform.js","core-util-is":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/readable-stream/node_modules/core-util-is/lib/util.js","inherits":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/inherits/inherits_browser.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/readable-stream/lib/_stream_readable.js":[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

module.exports = Readable;

/*<replacement>*/
var isArray = require('isarray');
/*</replacement>*/


/*<replacement>*/
var Buffer = require('buffer').Buffer;
/*</replacement>*/

Readable.ReadableState = ReadableState;

var EE = require('events').EventEmitter;

/*<replacement>*/
if (!EE.listenerCount) EE.listenerCount = function(emitter, type) {
  return emitter.listeners(type).length;
};
/*</replacement>*/

var Stream = require('stream');

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

var StringDecoder;


/*<replacement>*/
var debug = require('util');
if (debug && debug.debuglog) {
  debug = debug.debuglog('stream');
} else {
  debug = function () {};
}
/*</replacement>*/


util.inherits(Readable, Stream);

function ReadableState(options, stream) {
  var Duplex = require('./_stream_duplex');

  options = options || {};

  // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"
  var hwm = options.highWaterMark;
  var defaultHwm = options.objectMode ? 16 : 16 * 1024;
  this.highWaterMark = (hwm || hwm === 0) ? hwm : defaultHwm;

  // cast to ints.
  this.highWaterMark = ~~this.highWaterMark;

  this.buffer = [];
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = null;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.
  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;


  // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away
  this.objectMode = !!options.objectMode;

  if (stream instanceof Duplex)
    this.objectMode = this.objectMode || !!options.readableObjectMode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // when piping, we only care about 'readable' events that happen
  // after read()ing all the bytes and not getting any pushback.
  this.ranOut = false;

  // the number of writers that are awaiting a drain event in .pipe()s
  this.awaitDrain = 0;

  // if true, a maybeReadMore has been scheduled
  this.readingMore = false;

  this.decoder = null;
  this.encoding = null;
  if (options.encoding) {
    if (!StringDecoder)
      StringDecoder = require('string_decoder/').StringDecoder;
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}

function Readable(options) {
  var Duplex = require('./_stream_duplex');

  if (!(this instanceof Readable))
    return new Readable(options);

  this._readableState = new ReadableState(options, this);

  // legacy
  this.readable = true;

  Stream.call(this);
}

// Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.
Readable.prototype.push = function(chunk, encoding) {
  var state = this._readableState;

  if (util.isString(chunk) && !state.objectMode) {
    encoding = encoding || state.defaultEncoding;
    if (encoding !== state.encoding) {
      chunk = new Buffer(chunk, encoding);
      encoding = '';
    }
  }

  return readableAddChunk(this, state, chunk, encoding, false);
};

// Unshift should *always* be something directly out of read()
Readable.prototype.unshift = function(chunk) {
  var state = this._readableState;
  return readableAddChunk(this, state, chunk, '', true);
};

function readableAddChunk(stream, state, chunk, encoding, addToFront) {
  var er = chunkInvalid(state, chunk);
  if (er) {
    stream.emit('error', er);
  } else if (util.isNullOrUndefined(chunk)) {
    state.reading = false;
    if (!state.ended)
      onEofChunk(stream, state);
  } else if (state.objectMode || chunk && chunk.length > 0) {
    if (state.ended && !addToFront) {
      var e = new Error('stream.push() after EOF');
      stream.emit('error', e);
    } else if (state.endEmitted && addToFront) {
      var e = new Error('stream.unshift() after end event');
      stream.emit('error', e);
    } else {
      if (state.decoder && !addToFront && !encoding)
        chunk = state.decoder.write(chunk);

      if (!addToFront)
        state.reading = false;

      // if we want the data now, just emit it.
      if (state.flowing && state.length === 0 && !state.sync) {
        stream.emit('data', chunk);
        stream.read(0);
      } else {
        // update the buffer info.
        state.length += state.objectMode ? 1 : chunk.length;
        if (addToFront)
          state.buffer.unshift(chunk);
        else
          state.buffer.push(chunk);

        if (state.needReadable)
          emitReadable(stream);
      }

      maybeReadMore(stream, state);
    }
  } else if (!addToFront) {
    state.reading = false;
  }

  return needMoreData(state);
}



// if it's past the high water mark, we can push in some more.
// Also, if we have no data yet, we can stand some
// more bytes.  This is to work around cases where hwm=0,
// such as the repl.  Also, if the push() triggered a
// readable event, and the user called read(largeNumber) such that
// needReadable was set, then we ought to push more, so that another
// 'readable' event will be triggered.
function needMoreData(state) {
  return !state.ended &&
         (state.needReadable ||
          state.length < state.highWaterMark ||
          state.length === 0);
}

// backwards compatibility.
Readable.prototype.setEncoding = function(enc) {
  if (!StringDecoder)
    StringDecoder = require('string_decoder/').StringDecoder;
  this._readableState.decoder = new StringDecoder(enc);
  this._readableState.encoding = enc;
  return this;
};

// Don't raise the hwm > 128MB
var MAX_HWM = 0x800000;
function roundUpToNextPowerOf2(n) {
  if (n >= MAX_HWM) {
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2
    n--;
    for (var p = 1; p < 32; p <<= 1) n |= n >> p;
    n++;
  }
  return n;
}

function howMuchToRead(n, state) {
  if (state.length === 0 && state.ended)
    return 0;

  if (state.objectMode)
    return n === 0 ? 0 : 1;

  if (isNaN(n) || util.isNull(n)) {
    // only flow one buffer at a time
    if (state.flowing && state.buffer.length)
      return state.buffer[0].length;
    else
      return state.length;
  }

  if (n <= 0)
    return 0;

  // If we're asking for more than the target buffer level,
  // then raise the water mark.  Bump up to the next highest
  // power of 2, to prevent increasing it excessively in tiny
  // amounts.
  if (n > state.highWaterMark)
    state.highWaterMark = roundUpToNextPowerOf2(n);

  // don't have that much.  return null, unless we've ended.
  if (n > state.length) {
    if (!state.ended) {
      state.needReadable = true;
      return 0;
    } else
      return state.length;
  }

  return n;
}

// you can override either this method, or the async _read(n) below.
Readable.prototype.read = function(n) {
  debug('read', n);
  var state = this._readableState;
  var nOrig = n;

  if (!util.isNumber(n) || n > 0)
    state.emittedReadable = false;

  // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.
  if (n === 0 &&
      state.needReadable &&
      (state.length >= state.highWaterMark || state.ended)) {
    debug('read: emitReadable', state.length, state.ended);
    if (state.length === 0 && state.ended)
      endReadable(this);
    else
      emitReadable(this);
    return null;
  }

  n = howMuchToRead(n, state);

  // if we've ended, and we're now clear, then finish it up.
  if (n === 0 && state.ended) {
    if (state.length === 0)
      endReadable(this);
    return null;
  }

  // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.

  // if we need a readable event, then we need to do some reading.
  var doRead = state.needReadable;
  debug('need readable', doRead);

  // if we currently have less than the highWaterMark, then also read some
  if (state.length === 0 || state.length - n < state.highWaterMark) {
    doRead = true;
    debug('length less than watermark', doRead);
  }

  // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.
  if (state.ended || state.reading) {
    doRead = false;
    debug('reading or ended', doRead);
  }

  if (doRead) {
    debug('do read');
    state.reading = true;
    state.sync = true;
    // if the length is currently zero, then we *need* a readable event.
    if (state.length === 0)
      state.needReadable = true;
    // call internal read method
    this._read(state.highWaterMark);
    state.sync = false;
  }

  // If _read pushed data synchronously, then `reading` will be false,
  // and we need to re-evaluate how much data we can return to the user.
  if (doRead && !state.reading)
    n = howMuchToRead(nOrig, state);

  var ret;
  if (n > 0)
    ret = fromList(n, state);
  else
    ret = null;

  if (util.isNull(ret)) {
    state.needReadable = true;
    n = 0;
  }

  state.length -= n;

  // If we have nothing in the buffer, then we want to know
  // as soon as we *do* get something into the buffer.
  if (state.length === 0 && !state.ended)
    state.needReadable = true;

  // If we tried to read() past the EOF, then emit end on the next tick.
  if (nOrig !== n && state.ended && state.length === 0)
    endReadable(this);

  if (!util.isNull(ret))
    this.emit('data', ret);

  return ret;
};

function chunkInvalid(state, chunk) {
  var er = null;
  if (!util.isBuffer(chunk) &&
      !util.isString(chunk) &&
      !util.isNullOrUndefined(chunk) &&
      !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  return er;
}


function onEofChunk(stream, state) {
  if (state.decoder && !state.ended) {
    var chunk = state.decoder.end();
    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }
  state.ended = true;

  // emit 'readable' now to make sure it gets picked up.
  emitReadable(stream);
}

// Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.
function emitReadable(stream) {
  var state = stream._readableState;
  state.needReadable = false;
  if (!state.emittedReadable) {
    debug('emitReadable', state.flowing);
    state.emittedReadable = true;
    if (state.sync)
      process.nextTick(function() {
        emitReadable_(stream);
      });
    else
      emitReadable_(stream);
  }
}

function emitReadable_(stream) {
  debug('emit readable');
  stream.emit('readable');
  flow(stream);
}


// at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.
function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    process.nextTick(function() {
      maybeReadMore_(stream, state);
    });
  }
}

function maybeReadMore_(stream, state) {
  var len = state.length;
  while (!state.reading && !state.flowing && !state.ended &&
         state.length < state.highWaterMark) {
    debug('maybeReadMore read 0');
    stream.read(0);
    if (len === state.length)
      // didn't get any data, stop spinning.
      break;
    else
      len = state.length;
  }
  state.readingMore = false;
}

// abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.
Readable.prototype._read = function(n) {
  this.emit('error', new Error('not implemented'));
};

Readable.prototype.pipe = function(dest, pipeOpts) {
  var src = this;
  var state = this._readableState;

  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;
    case 1:
      state.pipes = [state.pipes, dest];
      break;
    default:
      state.pipes.push(dest);
      break;
  }
  state.pipesCount += 1;
  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

  var doEnd = (!pipeOpts || pipeOpts.end !== false) &&
              dest !== process.stdout &&
              dest !== process.stderr;

  var endFn = doEnd ? onend : cleanup;
  if (state.endEmitted)
    process.nextTick(endFn);
  else
    src.once('end', endFn);

  dest.on('unpipe', onunpipe);
  function onunpipe(readable) {
    debug('onunpipe');
    if (readable === src) {
      cleanup();
    }
  }

  function onend() {
    debug('onend');
    dest.end();
  }

  // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.
  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);

  function cleanup() {
    debug('cleanup');
    // cleanup event handlers once the pipe is broken
    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', cleanup);
    src.removeListener('data', ondata);

    // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.
    if (state.awaitDrain &&
        (!dest._writableState || dest._writableState.needDrain))
      ondrain();
  }

  src.on('data', ondata);
  function ondata(chunk) {
    debug('ondata');
    var ret = dest.write(chunk);
    if (false === ret) {
      debug('false write response, pause',
            src._readableState.awaitDrain);
      src._readableState.awaitDrain++;
      src.pause();
    }
  }

  // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.
  function onerror(er) {
    debug('onerror', er);
    unpipe();
    dest.removeListener('error', onerror);
    if (EE.listenerCount(dest, 'error') === 0)
      dest.emit('error', er);
  }
  // This is a brutally ugly hack to make sure that our error handler
  // is attached before any userland ones.  NEVER DO THIS.
  if (!dest._events || !dest._events.error)
    dest.on('error', onerror);
  else if (isArray(dest._events.error))
    dest._events.error.unshift(onerror);
  else
    dest._events.error = [onerror, dest._events.error];



  // Both close and finish should trigger unpipe, but only once.
  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }
  dest.once('close', onclose);
  function onfinish() {
    debug('onfinish');
    dest.removeListener('close', onclose);
    unpipe();
  }
  dest.once('finish', onfinish);

  function unpipe() {
    debug('unpipe');
    src.unpipe(dest);
  }

  // tell the dest that it's being piped to
  dest.emit('pipe', src);

  // start the flow if it hasn't been started already.
  if (!state.flowing) {
    debug('pipe resume');
    src.resume();
  }

  return dest;
};

function pipeOnDrain(src) {
  return function() {
    var state = src._readableState;
    debug('pipeOnDrain', state.awaitDrain);
    if (state.awaitDrain)
      state.awaitDrain--;
    if (state.awaitDrain === 0 && EE.listenerCount(src, 'data')) {
      state.flowing = true;
      flow(src);
    }
  };
}


Readable.prototype.unpipe = function(dest) {
  var state = this._readableState;

  // if we're not piping anywhere, then do nothing.
  if (state.pipesCount === 0)
    return this;

  // just one destination.  most common case.
  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes)
      return this;

    if (!dest)
      dest = state.pipes;

    // got a match.
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;
    if (dest)
      dest.emit('unpipe', this);
    return this;
  }

  // slow case. multiple pipe destinations.

  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;

    for (var i = 0; i < len; i++)
      dests[i].emit('unpipe', this);
    return this;
  }

  // try to find the right one.
  var i = indexOf(state.pipes, dest);
  if (i === -1)
    return this;

  state.pipes.splice(i, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1)
    state.pipes = state.pipes[0];

  dest.emit('unpipe', this);

  return this;
};

// set up data events if they are asked for
// Ensure readable listeners eventually get something
Readable.prototype.on = function(ev, fn) {
  var res = Stream.prototype.on.call(this, ev, fn);

  // If listening to data, and it has not explicitly been paused,
  // then call resume to start the flow of data on the next tick.
  if (ev === 'data' && false !== this._readableState.flowing) {
    this.resume();
  }

  if (ev === 'readable' && this.readable) {
    var state = this._readableState;
    if (!state.readableListening) {
      state.readableListening = true;
      state.emittedReadable = false;
      state.needReadable = true;
      if (!state.reading) {
        var self = this;
        process.nextTick(function() {
          debug('readable nexttick read 0');
          self.read(0);
        });
      } else if (state.length) {
        emitReadable(this, state);
      }
    }
  }

  return res;
};
Readable.prototype.addListener = Readable.prototype.on;

// pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.
Readable.prototype.resume = function() {
  var state = this._readableState;
  if (!state.flowing) {
    debug('resume');
    state.flowing = true;
    if (!state.reading) {
      debug('resume read 0');
      this.read(0);
    }
    resume(this, state);
  }
  return this;
};

function resume(stream, state) {
  if (!state.resumeScheduled) {
    state.resumeScheduled = true;
    process.nextTick(function() {
      resume_(stream, state);
    });
  }
}

function resume_(stream, state) {
  state.resumeScheduled = false;
  stream.emit('resume');
  flow(stream);
  if (state.flowing && !state.reading)
    stream.read(0);
}

Readable.prototype.pause = function() {
  debug('call pause flowing=%j', this._readableState.flowing);
  if (false !== this._readableState.flowing) {
    debug('pause');
    this._readableState.flowing = false;
    this.emit('pause');
  }
  return this;
};

function flow(stream) {
  var state = stream._readableState;
  debug('flow', state.flowing);
  if (state.flowing) {
    do {
      var chunk = stream.read();
    } while (null !== chunk && state.flowing);
  }
}

// wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.
Readable.prototype.wrap = function(stream) {
  var state = this._readableState;
  var paused = false;

  var self = this;
  stream.on('end', function() {
    debug('wrapped end');
    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length)
        self.push(chunk);
    }

    self.push(null);
  });

  stream.on('data', function(chunk) {
    debug('wrapped data');
    if (state.decoder)
      chunk = state.decoder.write(chunk);
    if (!chunk || !state.objectMode && !chunk.length)
      return;

    var ret = self.push(chunk);
    if (!ret) {
      paused = true;
      stream.pause();
    }
  });

  // proxy all the other methods.
  // important when wrapping filters and duplexes.
  for (var i in stream) {
    if (util.isFunction(stream[i]) && util.isUndefined(this[i])) {
      this[i] = function(method) { return function() {
        return stream[method].apply(stream, arguments);
      }}(i);
    }
  }

  // proxy certain important events.
  var events = ['error', 'close', 'destroy', 'pause', 'resume'];
  forEach(events, function(ev) {
    stream.on(ev, self.emit.bind(self, ev));
  });

  // when we try to consume some more bytes, simply unpause the
  // underlying stream.
  self._read = function(n) {
    debug('wrapped _read', n);
    if (paused) {
      paused = false;
      stream.resume();
    }
  };

  return self;
};



// exposed for testing purposes only.
Readable._fromList = fromList;

// Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
function fromList(n, state) {
  var list = state.buffer;
  var length = state.length;
  var stringMode = !!state.decoder;
  var objectMode = !!state.objectMode;
  var ret;

  // nothing in the list, definitely empty.
  if (list.length === 0)
    return null;

  if (length === 0)
    ret = null;
  else if (objectMode)
    ret = list.shift();
  else if (!n || n >= length) {
    // read it all, truncate the array.
    if (stringMode)
      ret = list.join('');
    else
      ret = Buffer.concat(list, length);
    list.length = 0;
  } else {
    // read just some of it.
    if (n < list[0].length) {
      // just take a part of the first list item.
      // slice is the same for buffers and strings.
      var buf = list[0];
      ret = buf.slice(0, n);
      list[0] = buf.slice(n);
    } else if (n === list[0].length) {
      // first list is a perfect match
      ret = list.shift();
    } else {
      // complex case.
      // we have enough to cover it, but it spans past the first buffer.
      if (stringMode)
        ret = '';
      else
        ret = new Buffer(n);

      var c = 0;
      for (var i = 0, l = list.length; i < l && c < n; i++) {
        var buf = list[0];
        var cpy = Math.min(n - c, buf.length);

        if (stringMode)
          ret += buf.slice(0, cpy);
        else
          buf.copy(ret, c, 0, cpy);

        if (cpy < buf.length)
          list[0] = buf.slice(cpy);
        else
          list.shift();

        c += cpy;
      }
    }
  }

  return ret;
}

function endReadable(stream) {
  var state = stream._readableState;

  // If we get here before consuming all the bytes, then that is a
  // bug in node.  Should never happen.
  if (state.length > 0)
    throw new Error('endReadable called on non-empty stream');

  if (!state.endEmitted) {
    state.ended = true;
    process.nextTick(function() {
      // Check that we didn't get one last unshift.
      if (!state.endEmitted && state.length === 0) {
        state.endEmitted = true;
        stream.readable = false;
        stream.emit('end');
      }
    });
  }
}

function forEach (xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}

function indexOf (xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }
  return -1;
}

}).call(this,require('_process'))

},{"./_stream_duplex":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/readable-stream/lib/_stream_duplex.js","_process":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/process/browser.js","buffer":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/buffer/index.js","core-util-is":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/readable-stream/node_modules/core-util-is/lib/util.js","events":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/events/events.js","inherits":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/inherits/inherits_browser.js","isarray":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/isarray/index.js","stream":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/stream-browserify/index.js","string_decoder/":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/string_decoder/index.js","util":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/browser-resolve/empty.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/readable-stream/lib/_stream_transform.js":[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.


// a transform stream is a readable/writable stream where you do
// something with the data.  Sometimes it's called a "filter",
// but that's not a great name for it, since that implies a thing where
// some bits pass through, and others are simply ignored.  (That would
// be a valid example of a transform, of course.)
//
// While the output is causally related to the input, it's not a
// necessarily symmetric or synchronous transformation.  For example,
// a zlib stream might take multiple plain-text writes(), and then
// emit a single compressed chunk some time in the future.
//
// Here's how this works:
//
// The Transform stream has all the aspects of the readable and writable
// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// internally, and returns false if there's a lot of pending writes
// buffered up.  When you call read(), that calls _read(n) until
// there's enough pending readable data buffered up.
//
// In a transform stream, the written data is placed in a buffer.  When
// _read(n) is called, it transforms the queued up data, calling the
// buffered _write cb's as it consumes chunks.  If consuming a single
// written chunk would result in multiple output chunks, then the first
// outputted bit calls the readcb, and subsequent chunks just go into
// the read buffer, and will cause it to emit 'readable' if necessary.
//
// This way, back-pressure is actually determined by the reading side,
// since _read has to be called to start processing a new chunk.  However,
// a pathological inflate type of transform can cause excessive buffering
// here.  For example, imagine a stream where every byte of input is
// interpreted as an integer from 0-255, and then results in that many
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 1kb of data being output.  In this case, you could write a very small
// amount of input, and end up with a very large amount of output.  In
// such a pathological inflating mechanism, there'd be no way to tell
// the system to stop doing the transform.  A single 4MB write could
// cause the system to run out of memory.
//
// However, even in such a pathological case, only a single written chunk
// would be consumed, and then the rest would wait (un-transformed) until
// the results of the previous transformed chunk were consumed.

module.exports = Transform;

var Duplex = require('./_stream_duplex');

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

util.inherits(Transform, Duplex);


function TransformState(options, stream) {
  this.afterTransform = function(er, data) {
    return afterTransform(stream, er, data);
  };

  this.needTransform = false;
  this.transforming = false;
  this.writecb = null;
  this.writechunk = null;
}

function afterTransform(stream, er, data) {
  var ts = stream._transformState;
  ts.transforming = false;

  var cb = ts.writecb;

  if (!cb)
    return stream.emit('error', new Error('no writecb in Transform class'));

  ts.writechunk = null;
  ts.writecb = null;

  if (!util.isNullOrUndefined(data))
    stream.push(data);

  if (cb)
    cb(er);

  var rs = stream._readableState;
  rs.reading = false;
  if (rs.needReadable || rs.length < rs.highWaterMark) {
    stream._read(rs.highWaterMark);
  }
}


function Transform(options) {
  if (!(this instanceof Transform))
    return new Transform(options);

  Duplex.call(this, options);

  this._transformState = new TransformState(options, this);

  // when the writable side finishes, then flush out anything remaining.
  var stream = this;

  // start out asking for a readable event once data is transformed.
  this._readableState.needReadable = true;

  // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.
  this._readableState.sync = false;

  this.once('prefinish', function() {
    if (util.isFunction(this._flush))
      this._flush(function(er) {
        done(stream, er);
      });
    else
      done(stream);
  });
}

Transform.prototype.push = function(chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
};

// This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.
Transform.prototype._transform = function(chunk, encoding, cb) {
  throw new Error('not implemented');
};

Transform.prototype._write = function(chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;
  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform ||
        rs.needReadable ||
        rs.length < rs.highWaterMark)
      this._read(rs.highWaterMark);
  }
};

// Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.
Transform.prototype._read = function(n) {
  var ts = this._transformState;

  if (!util.isNull(ts.writechunk) && ts.writecb && !ts.transforming) {
    ts.transforming = true;
    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};


function done(stream, er) {
  if (er)
    return stream.emit('error', er);

  // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided
  var ws = stream._writableState;
  var ts = stream._transformState;

  if (ws.length)
    throw new Error('calling transform done when ws.length != 0');

  if (ts.transforming)
    throw new Error('calling transform done when still transforming');

  return stream.push(null);
}

},{"./_stream_duplex":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/readable-stream/lib/_stream_duplex.js","core-util-is":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/readable-stream/node_modules/core-util-is/lib/util.js","inherits":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/inherits/inherits_browser.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/readable-stream/lib/_stream_writable.js":[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// A bit simpler than readable streams.
// Implement an async ._write(chunk, cb), and it'll handle all
// the drain event emission and buffering.

module.exports = Writable;

/*<replacement>*/
var Buffer = require('buffer').Buffer;
/*</replacement>*/

Writable.WritableState = WritableState;


/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

var Stream = require('stream');

util.inherits(Writable, Stream);

function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
}

function WritableState(options, stream) {
  var Duplex = require('./_stream_duplex');

  options = options || {};

  // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()
  var hwm = options.highWaterMark;
  var defaultHwm = options.objectMode ? 16 : 16 * 1024;
  this.highWaterMark = (hwm || hwm === 0) ? hwm : defaultHwm;

  // object stream flag to indicate whether or not this stream
  // contains buffers or objects.
  this.objectMode = !!options.objectMode;

  if (stream instanceof Duplex)
    this.objectMode = this.objectMode || !!options.writableObjectMode;

  // cast to ints.
  this.highWaterMark = ~~this.highWaterMark;

  this.needDrain = false;
  // at the start of calling end()
  this.ending = false;
  // when end() has been called, and returned
  this.ended = false;
  // when 'finish' is emitted
  this.finished = false;

  // should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.
  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.
  this.length = 0;

  // a flag to see when we're in the middle of a write.
  this.writing = false;

  // when true all writes will be buffered until .uncork() call
  this.corked = 0;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.
  this.bufferProcessing = false;

  // the callback that's passed to _write(chunk,cb)
  this.onwrite = function(er) {
    onwrite(stream, er);
  };

  // the callback that the user supplies to write(chunk,encoding,cb)
  this.writecb = null;

  // the amount that is being written when _write is called.
  this.writelen = 0;

  this.buffer = [];

  // number of pending user-supplied write callbacks
  // this must be 0 before 'finish' can be emitted
  this.pendingcb = 0;

  // emit prefinish if the only thing we're waiting for is _write cbs
  // This is relevant for synchronous Transform streams
  this.prefinished = false;

  // True if the error was already emitted and should not be thrown again
  this.errorEmitted = false;
}

function Writable(options) {
  var Duplex = require('./_stream_duplex');

  // Writable ctor is applied to Duplexes, though they're not
  // instanceof Writable, they're instanceof Readable.
  if (!(this instanceof Writable) && !(this instanceof Duplex))
    return new Writable(options);

  this._writableState = new WritableState(options, this);

  // legacy.
  this.writable = true;

  Stream.call(this);
}

// Otherwise people can pipe Writable streams, which is just wrong.
Writable.prototype.pipe = function() {
  this.emit('error', new Error('Cannot pipe. Not readable.'));
};


function writeAfterEnd(stream, state, cb) {
  var er = new Error('write after end');
  // TODO: defer error events consistently everywhere, not just the cb
  stream.emit('error', er);
  process.nextTick(function() {
    cb(er);
  });
}

// If we get something that is not a buffer, string, null, or undefined,
// and we're not in objectMode, then that's an error.
// Otherwise stream chunks are all considered to be of length=1, and the
// watermarks determine how many objects to keep in the buffer, rather than
// how many bytes or characters.
function validChunk(stream, state, chunk, cb) {
  var valid = true;
  if (!util.isBuffer(chunk) &&
      !util.isString(chunk) &&
      !util.isNullOrUndefined(chunk) &&
      !state.objectMode) {
    var er = new TypeError('Invalid non-string/buffer chunk');
    stream.emit('error', er);
    process.nextTick(function() {
      cb(er);
    });
    valid = false;
  }
  return valid;
}

Writable.prototype.write = function(chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;

  if (util.isFunction(encoding)) {
    cb = encoding;
    encoding = null;
  }

  if (util.isBuffer(chunk))
    encoding = 'buffer';
  else if (!encoding)
    encoding = state.defaultEncoding;

  if (!util.isFunction(cb))
    cb = function() {};

  if (state.ended)
    writeAfterEnd(this, state, cb);
  else if (validChunk(this, state, chunk, cb)) {
    state.pendingcb++;
    ret = writeOrBuffer(this, state, chunk, encoding, cb);
  }

  return ret;
};

Writable.prototype.cork = function() {
  var state = this._writableState;

  state.corked++;
};

Writable.prototype.uncork = function() {
  var state = this._writableState;

  if (state.corked) {
    state.corked--;

    if (!state.writing &&
        !state.corked &&
        !state.finished &&
        !state.bufferProcessing &&
        state.buffer.length)
      clearBuffer(this, state);
  }
};

function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode &&
      state.decodeStrings !== false &&
      util.isString(chunk)) {
    chunk = new Buffer(chunk, encoding);
  }
  return chunk;
}

// if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.
function writeOrBuffer(stream, state, chunk, encoding, cb) {
  chunk = decodeChunk(state, chunk, encoding);
  if (util.isBuffer(chunk))
    encoding = 'buffer';
  var len = state.objectMode ? 1 : chunk.length;

  state.length += len;

  var ret = state.length < state.highWaterMark;
  // we must ensure that previous needDrain will not be reset to false.
  if (!ret)
    state.needDrain = true;

  if (state.writing || state.corked)
    state.buffer.push(new WriteReq(chunk, encoding, cb));
  else
    doWrite(stream, state, false, len, chunk, encoding, cb);

  return ret;
}

function doWrite(stream, state, writev, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  if (writev)
    stream._writev(chunk, state.onwrite);
  else
    stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}

function onwriteError(stream, state, sync, er, cb) {
  if (sync)
    process.nextTick(function() {
      state.pendingcb--;
      cb(er);
    });
  else {
    state.pendingcb--;
    cb(er);
  }

  stream._writableState.errorEmitted = true;
  stream.emit('error', er);
}

function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}

function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;

  onwriteStateUpdate(state);

  if (er)
    onwriteError(stream, state, sync, er, cb);
  else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(stream, state);

    if (!finished &&
        !state.corked &&
        !state.bufferProcessing &&
        state.buffer.length) {
      clearBuffer(stream, state);
    }

    if (sync) {
      process.nextTick(function() {
        afterWrite(stream, state, finished, cb);
      });
    } else {
      afterWrite(stream, state, finished, cb);
    }
  }
}

function afterWrite(stream, state, finished, cb) {
  if (!finished)
    onwriteDrain(stream, state);
  state.pendingcb--;
  cb();
  finishMaybe(stream, state);
}

// Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.
function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
}


// if there's something in the buffer waiting, then process it
function clearBuffer(stream, state) {
  state.bufferProcessing = true;

  if (stream._writev && state.buffer.length > 1) {
    // Fast case, write everything using _writev()
    var cbs = [];
    for (var c = 0; c < state.buffer.length; c++)
      cbs.push(state.buffer[c].callback);

    // count the one we are adding, as well.
    // TODO(isaacs) clean this up
    state.pendingcb++;
    doWrite(stream, state, true, state.length, state.buffer, '', function(err) {
      for (var i = 0; i < cbs.length; i++) {
        state.pendingcb--;
        cbs[i](err);
      }
    });

    // Clear buffer
    state.buffer = [];
  } else {
    // Slow case, write chunks one-by-one
    for (var c = 0; c < state.buffer.length; c++) {
      var entry = state.buffer[c];
      var chunk = entry.chunk;
      var encoding = entry.encoding;
      var cb = entry.callback;
      var len = state.objectMode ? 1 : chunk.length;

      doWrite(stream, state, false, len, chunk, encoding, cb);

      // if we didn't call the onwrite immediately, then
      // it means that we need to wait until it does.
      // also, that means that the chunk and cb are currently
      // being processed, so move the buffer counter past them.
      if (state.writing) {
        c++;
        break;
      }
    }

    if (c < state.buffer.length)
      state.buffer = state.buffer.slice(c);
    else
      state.buffer.length = 0;
  }

  state.bufferProcessing = false;
}

Writable.prototype._write = function(chunk, encoding, cb) {
  cb(new Error('not implemented'));

};

Writable.prototype._writev = null;

Writable.prototype.end = function(chunk, encoding, cb) {
  var state = this._writableState;

  if (util.isFunction(chunk)) {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (util.isFunction(encoding)) {
    cb = encoding;
    encoding = null;
  }

  if (!util.isNullOrUndefined(chunk))
    this.write(chunk, encoding);

  // .end() fully uncorks
  if (state.corked) {
    state.corked = 1;
    this.uncork();
  }

  // ignore unnecessary end() calls.
  if (!state.ending && !state.finished)
    endWritable(this, state, cb);
};


function needFinish(stream, state) {
  return (state.ending &&
          state.length === 0 &&
          !state.finished &&
          !state.writing);
}

function prefinish(stream, state) {
  if (!state.prefinished) {
    state.prefinished = true;
    stream.emit('prefinish');
  }
}

function finishMaybe(stream, state) {
  var need = needFinish(stream, state);
  if (need) {
    if (state.pendingcb === 0) {
      prefinish(stream, state);
      state.finished = true;
      stream.emit('finish');
    } else
      prefinish(stream, state);
  }
  return need;
}

function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);
  if (cb) {
    if (state.finished)
      process.nextTick(cb);
    else
      stream.once('finish', cb);
  }
  state.ended = true;
}

}).call(this,require('_process'))

},{"./_stream_duplex":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/readable-stream/lib/_stream_duplex.js","_process":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/process/browser.js","buffer":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/buffer/index.js","core-util-is":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/readable-stream/node_modules/core-util-is/lib/util.js","inherits":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/inherits/inherits_browser.js","stream":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/stream-browserify/index.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/readable-stream/node_modules/core-util-is/lib/util.js":[function(require,module,exports){
(function (Buffer){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

function isBuffer(arg) {
  return Buffer.isBuffer(arg);
}
exports.isBuffer = isBuffer;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}
}).call(this,require("buffer").Buffer)

},{"buffer":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/buffer/index.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/readable-stream/passthrough.js":[function(require,module,exports){
module.exports = require("./lib/_stream_passthrough.js")

},{"./lib/_stream_passthrough.js":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/readable-stream/lib/_stream_passthrough.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/readable-stream/readable.js":[function(require,module,exports){
exports = module.exports = require('./lib/_stream_readable.js');
exports.Stream = require('stream');
exports.Readable = exports;
exports.Writable = require('./lib/_stream_writable.js');
exports.Duplex = require('./lib/_stream_duplex.js');
exports.Transform = require('./lib/_stream_transform.js');
exports.PassThrough = require('./lib/_stream_passthrough.js');

},{"./lib/_stream_duplex.js":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/readable-stream/lib/_stream_duplex.js","./lib/_stream_passthrough.js":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/readable-stream/lib/_stream_passthrough.js","./lib/_stream_readable.js":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/readable-stream/lib/_stream_readable.js","./lib/_stream_transform.js":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/readable-stream/lib/_stream_transform.js","./lib/_stream_writable.js":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/readable-stream/lib/_stream_writable.js","stream":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/stream-browserify/index.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/readable-stream/transform.js":[function(require,module,exports){
module.exports = require("./lib/_stream_transform.js")

},{"./lib/_stream_transform.js":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/readable-stream/lib/_stream_transform.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/readable-stream/writable.js":[function(require,module,exports){
module.exports = require("./lib/_stream_writable.js")

},{"./lib/_stream_writable.js":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/readable-stream/lib/_stream_writable.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/stream-browserify/index.js":[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

module.exports = Stream;

var EE = require('events').EventEmitter;
var inherits = require('inherits');

inherits(Stream, EE);
Stream.Readable = require('readable-stream/readable.js');
Stream.Writable = require('readable-stream/writable.js');
Stream.Duplex = require('readable-stream/duplex.js');
Stream.Transform = require('readable-stream/transform.js');
Stream.PassThrough = require('readable-stream/passthrough.js');

// Backwards-compat with node 0.4.x
Stream.Stream = Stream;



// old-style streams.  Note that the pipe method (the only relevant
// part of this class) is overridden in the Readable class.

function Stream() {
  EE.call(this);
}

Stream.prototype.pipe = function(dest, options) {
  var source = this;

  function ondata(chunk) {
    if (dest.writable) {
      if (false === dest.write(chunk) && source.pause) {
        source.pause();
      }
    }
  }

  source.on('data', ondata);

  function ondrain() {
    if (source.readable && source.resume) {
      source.resume();
    }
  }

  dest.on('drain', ondrain);

  // If the 'end' option is not supplied, dest.end() will be called when
  // source gets the 'end' or 'close' events.  Only dest.end() once.
  if (!dest._isStdio && (!options || options.end !== false)) {
    source.on('end', onend);
    source.on('close', onclose);
  }

  var didOnEnd = false;
  function onend() {
    if (didOnEnd) return;
    didOnEnd = true;

    dest.end();
  }


  function onclose() {
    if (didOnEnd) return;
    didOnEnd = true;

    if (typeof dest.destroy === 'function') dest.destroy();
  }

  // don't leave dangling pipes when there are errors.
  function onerror(er) {
    cleanup();
    if (EE.listenerCount(this, 'error') === 0) {
      throw er; // Unhandled stream error in pipe.
    }
  }

  source.on('error', onerror);
  dest.on('error', onerror);

  // remove all the event listeners that were added.
  function cleanup() {
    source.removeListener('data', ondata);
    dest.removeListener('drain', ondrain);

    source.removeListener('end', onend);
    source.removeListener('close', onclose);

    source.removeListener('error', onerror);
    dest.removeListener('error', onerror);

    source.removeListener('end', cleanup);
    source.removeListener('close', cleanup);

    dest.removeListener('close', cleanup);
  }

  source.on('end', cleanup);
  source.on('close', cleanup);

  dest.on('close', cleanup);

  dest.emit('pipe', source);

  // Allow for unix-like usage: A.pipe(B).pipe(C)
  return dest;
};

},{"events":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/events/events.js","inherits":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/inherits/inherits_browser.js","readable-stream/duplex.js":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/readable-stream/duplex.js","readable-stream/passthrough.js":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/readable-stream/passthrough.js","readable-stream/readable.js":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/readable-stream/readable.js","readable-stream/transform.js":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/readable-stream/transform.js","readable-stream/writable.js":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/readable-stream/writable.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/string_decoder/index.js":[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var Buffer = require('buffer').Buffer;

var isBufferEncoding = Buffer.isEncoding
  || function(encoding) {
       switch (encoding && encoding.toLowerCase()) {
         case 'hex': case 'utf8': case 'utf-8': case 'ascii': case 'binary': case 'base64': case 'ucs2': case 'ucs-2': case 'utf16le': case 'utf-16le': case 'raw': return true;
         default: return false;
       }
     }


function assertEncoding(encoding) {
  if (encoding && !isBufferEncoding(encoding)) {
    throw new Error('Unknown encoding: ' + encoding);
  }
}

// StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters. CESU-8 is handled as part of the UTF-8 encoding.
//
// @TODO Handling all encodings inside a single object makes it very difficult
// to reason about this code, so it should be split up in the future.
// @TODO There should be a utf8-strict encoding that rejects invalid UTF-8 code
// points as used by CESU-8.
var StringDecoder = exports.StringDecoder = function(encoding) {
  this.encoding = (encoding || 'utf8').toLowerCase().replace(/[-_]/, '');
  assertEncoding(encoding);
  switch (this.encoding) {
    case 'utf8':
      // CESU-8 represents each of Surrogate Pair by 3-bytes
      this.surrogateSize = 3;
      break;
    case 'ucs2':
    case 'utf16le':
      // UTF-16 represents each of Surrogate Pair by 2-bytes
      this.surrogateSize = 2;
      this.detectIncompleteChar = utf16DetectIncompleteChar;
      break;
    case 'base64':
      // Base-64 stores 3 bytes in 4 chars, and pads the remainder.
      this.surrogateSize = 3;
      this.detectIncompleteChar = base64DetectIncompleteChar;
      break;
    default:
      this.write = passThroughWrite;
      return;
  }

  // Enough space to store all bytes of a single character. UTF-8 needs 4
  // bytes, but CESU-8 may require up to 6 (3 bytes per surrogate).
  this.charBuffer = new Buffer(6);
  // Number of bytes received for the current incomplete multi-byte character.
  this.charReceived = 0;
  // Number of bytes expected for the current incomplete multi-byte character.
  this.charLength = 0;
};


// write decodes the given buffer and returns it as JS string that is
// guaranteed to not contain any partial multi-byte characters. Any partial
// character found at the end of the buffer is buffered up, and will be
// returned when calling write again with the remaining bytes.
//
// Note: Converting a Buffer containing an orphan surrogate to a String
// currently works, but converting a String to a Buffer (via `new Buffer`, or
// Buffer#write) will replace incomplete surrogates with the unicode
// replacement character. See https://codereview.chromium.org/121173009/ .
StringDecoder.prototype.write = function(buffer) {
  var charStr = '';
  // if our last write ended with an incomplete multibyte character
  while (this.charLength) {
    // determine how many remaining bytes this buffer has to offer for this char
    var available = (buffer.length >= this.charLength - this.charReceived) ?
        this.charLength - this.charReceived :
        buffer.length;

    // add the new bytes to the char buffer
    buffer.copy(this.charBuffer, this.charReceived, 0, available);
    this.charReceived += available;

    if (this.charReceived < this.charLength) {
      // still not enough chars in this buffer? wait for more ...
      return '';
    }

    // remove bytes belonging to the current character from the buffer
    buffer = buffer.slice(available, buffer.length);

    // get the character that was split
    charStr = this.charBuffer.slice(0, this.charLength).toString(this.encoding);

    // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
    var charCode = charStr.charCodeAt(charStr.length - 1);
    if (charCode >= 0xD800 && charCode <= 0xDBFF) {
      this.charLength += this.surrogateSize;
      charStr = '';
      continue;
    }
    this.charReceived = this.charLength = 0;

    // if there are no more bytes in this buffer, just emit our char
    if (buffer.length === 0) {
      return charStr;
    }
    break;
  }

  // determine and set charLength / charReceived
  this.detectIncompleteChar(buffer);

  var end = buffer.length;
  if (this.charLength) {
    // buffer the incomplete character bytes we got
    buffer.copy(this.charBuffer, 0, buffer.length - this.charReceived, end);
    end -= this.charReceived;
  }

  charStr += buffer.toString(this.encoding, 0, end);

  var end = charStr.length - 1;
  var charCode = charStr.charCodeAt(end);
  // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
  if (charCode >= 0xD800 && charCode <= 0xDBFF) {
    var size = this.surrogateSize;
    this.charLength += size;
    this.charReceived += size;
    this.charBuffer.copy(this.charBuffer, size, 0, size);
    buffer.copy(this.charBuffer, 0, 0, size);
    return charStr.substring(0, end);
  }

  // or just emit the charStr
  return charStr;
};

// detectIncompleteChar determines if there is an incomplete UTF-8 character at
// the end of the given buffer. If so, it sets this.charLength to the byte
// length that character, and sets this.charReceived to the number of bytes
// that are available for this character.
StringDecoder.prototype.detectIncompleteChar = function(buffer) {
  // determine how many bytes we have to check at the end of this buffer
  var i = (buffer.length >= 3) ? 3 : buffer.length;

  // Figure out if one of the last i bytes of our buffer announces an
  // incomplete char.
  for (; i > 0; i--) {
    var c = buffer[buffer.length - i];

    // See http://en.wikipedia.org/wiki/UTF-8#Description

    // 110XXXXX
    if (i == 1 && c >> 5 == 0x06) {
      this.charLength = 2;
      break;
    }

    // 1110XXXX
    if (i <= 2 && c >> 4 == 0x0E) {
      this.charLength = 3;
      break;
    }

    // 11110XXX
    if (i <= 3 && c >> 3 == 0x1E) {
      this.charLength = 4;
      break;
    }
  }
  this.charReceived = i;
};

StringDecoder.prototype.end = function(buffer) {
  var res = '';
  if (buffer && buffer.length)
    res = this.write(buffer);

  if (this.charReceived) {
    var cr = this.charReceived;
    var buf = this.charBuffer;
    var enc = this.encoding;
    res += buf.slice(0, cr).toString(enc);
  }

  return res;
};

function passThroughWrite(buffer) {
  return buffer.toString(this.encoding);
}

function utf16DetectIncompleteChar(buffer) {
  this.charReceived = buffer.length % 2;
  this.charLength = this.charReceived ? 2 : 0;
}

function base64DetectIncompleteChar(buffer) {
  this.charReceived = buffer.length % 3;
  this.charLength = this.charReceived ? 3 : 0;
}

},{"buffer":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/buffer/index.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/util/support/isBufferBrowser.js":[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/util/util.js":[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./support/isBuffer":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/util/support/isBufferBrowser.js","_process":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/process/browser.js","inherits":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/inherits/inherits_browser.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/check-types/src/check-types.js":[function(require,module,exports){
/**
 * This module exports functions for checking types
 * and throwing exceptions.
 */

/*globals define, module */

(function (globals) {
    'use strict';

    var messages, predicates, functions, assert, not, maybe, either;

    messages = {
        like: 'Invalid type',
        instance: 'Invalid type',
        emptyObject: 'Invalid object',
        object: 'Invalid object',
        assigned: 'Invalid value',
        undefined: 'Invalid value',
        null: 'Invalid value',
        hasLength: 'Invalid length',
        emptyArray: 'Invalid array',
        array: 'Invalid array',
        date: 'Invalid date',
        error: 'Invalid error',
        fn: 'Invalid function',
        match: 'Invalid string',
        contains: 'Invalid string',
        unemptyString: 'Invalid string',
        string: 'Invalid string',
        odd: 'Invalid number',
        even: 'Invalid number',
        between: 'Invalid number',
        greater: 'Invalid number',
        less: 'Invalid number',
        positive: 'Invalid number',
        negative: 'Invalid number',
        integer: 'Invalid number',
        zero: 'Invalid number',
        number: 'Invalid number',
        boolean: 'Invalid boolean'
    };

    predicates = {
        like: like,
        instance: instance,
        emptyObject: emptyObject,
        object: object,
        assigned: assigned,
        undefined: isUndefined,
        null: isNull,
        hasLength: hasLength,
        emptyArray: emptyArray,
        array: array,
        date: date,
        error: error,
        function: isFunction,
        match: match,
        contains: contains,
        unemptyString: unemptyString,
        string: string,
        odd: odd,
        even: even,
        between: between,
        greater: greater,
        less: less,
        positive: positive,
        negative: negative,
        integer : integer,
        zero: zero,
        number: number,
        boolean: boolean
    };

    functions = {
        apply: apply,
        map: map,
        all: all,
        any: any
    };

    functions = mixin(functions, predicates);
    assert = createModifiedPredicates(assertModifier, assertImpl);
    not = createModifiedPredicates(notModifier, notImpl);
    maybe = createModifiedPredicates(maybeModifier, maybeImpl);
    either = createModifiedPredicates(eitherModifier);
    assert.not = createModifiedFunctions(assertModifier, not);
    assert.maybe = createModifiedFunctions(assertModifier, maybe);
    assert.either = createModifiedFunctions(assertEitherModifier, predicates);

    exportFunctions(mixin(functions, {
        assert: assert,
        not: not,
        maybe: maybe,
        either: either
    }));

    /**
     * Public function `like`.
     *
     * Tests whether an object 'quacks like a duck'.
     * Returns `true` if the first argument has all of
     * the properties of the second, archetypal argument
     * (the 'duck'). Returns `false` otherwise.
     *
     */
    function like (data, duck) {
        var name;

        for (name in duck) {
            if (duck.hasOwnProperty(name)) {
                if (data.hasOwnProperty(name) === false || typeof data[name] !== typeof duck[name]) {
                    return false;
                }

                if (object(data[name]) && like(data[name], duck[name]) === false) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Public function `instance`.
     *
     * Returns `true` if an object is an instance of a prototype,
     * `false` otherwise.
     *
     */
    function instance (data, prototype) {
        if (data && isFunction(prototype) && data instanceof prototype) {
            return true;
        }

        return false;
    }

    /**
     * Public function `emptyObject`.
     *
     * Returns `true` if something is an empty object,
     * `false` otherwise.
     *
     */
    function emptyObject (data) {
        return object(data) && Object.keys(data).length === 0;
    }

    /**
     * Public function `object`.
     *
     * Returns `true` if something is a plain-old JS object,
     * `false` otherwise.
     *
     */
    function object (data) {
        return Object.prototype.toString.call(data) === '[object Object]';
    }

    /**
     * Public function `assigned`.
     *
     * Returns `true` if something is not null or undefined,
     * `false` otherwise.
     *
     */
    function assigned (data) {
        return !isUndefined(data) && !isNull(data);
    }

    /**
     * Public function `undefined`.
     *
     * Returns `true` if something is undefined,
     * `false` otherwise.
     *
     */
    function isUndefined (data) {
        return data === undefined;
    }

    /**
     * Public function `null`.
     *
     * Returns `true` if something is null,
     * `false` otherwise.
     *
     */
    function isNull (data) {
        return data === null;
    }

    /**
     * Public function `hasLength`.
     *
     * Returns `true` if something is has a length property
     * that equals `value`, `false` otherwise.
     *
     */
    function hasLength (data, value) {
        return assigned(data) && data.length === value;
    }

    /**
     * Public function `emptyArray`.
     *
     * Returns `true` if something is an empty array,
     * `false` otherwise.
     *
     */
    function emptyArray (data) {
        return array(data) && data.length === 0;
    }

    /**
     * Public function `array`.
     *
     * Returns `true` something is an array,
     * `false` otherwise.
     *
     */
    function array (data) {
        return Array.isArray(data);
    }

    /**
     * Public function `date`.
     *
     * Returns `true` something is a valid date,
     * `false` otherwise.
     *
     */
    function date (data) {
        return Object.prototype.toString.call(data) === '[object Date]' &&
            !isNaN(data.getTime());
    }

    /**
     * Public function `error`.
     *
     * Returns `true` if something is a plain-old JS object,
     * `false` otherwise.
     *
     */
    function error (data) {
        return Object.prototype.toString.call(data) === '[object Error]';
    }

    /**
     * Public function `function`.
     *
     * Returns `true` if something is function,
     * `false` otherwise.
     *
     */
    function isFunction (data) {
        return typeof data === 'function';
    }

    /**
     * Public function `match`.
     *
     * Returns `true` if something is a string
     * that matches `regex`, `false` otherwise.
     *
     */
    function match (data, regex) {
        return string(data) && !!data.match(regex);
    }

    /**
     * Public function `contains`.
     *
     * Returns `true` if something is a string
     * that contains `substring`, `false` otherwise.
     *
     */
    function contains (data, substring) {
        return string(data) && data.indexOf(substring) !== -1;
    }

    /**
     * Public function `unemptyString`.
     *
     * Returns `true` if something is a non-empty string,
     * `false` otherwise.
     *
     */
    function unemptyString (data) {
        return string(data) && data !== '';
    }

    /**
     * Public function `string`.
     *
     * Returns `true` if something is a string, `false` otherwise.
     *
     */
    function string (data) {
        return typeof data === 'string';
    }

    /**
     * Public function `odd`.
     *
     * Returns `true` if something is an odd number,
     * `false` otherwise.
     *
     */
    function odd (data) {
        return integer(data) && !even(data);
    }

    /**
     * Public function `even`.
     *
     * Returns `true` if something is an even number,
     * `false` otherwise.
     *
     */
    function even (data) {
        return number(data) && data % 2 === 0;
    }

    /**
     * Public function `integer`.
     *
     * Returns `true` if something is an integer,
     * `false` otherwise.
     *
     */
    function integer (data) {
        return number(data) && data % 1 === 0;
    }

    /**
     * Public function `between`.
     *
     * Returns `true` if something is a number
     * between `a` and `b`, `false` otherwise.
     *
     */
    function between (data, a, b) {
        if (a < b) {
            return greater(data, a) && less(data, b);
        }

        return less(data, a) && greater(data, b);
    }

    /**
     * Public function `greater`.
     *
     * Returns `true` if something is a number
     * greater than `value`, `false` otherwise.
     *
     */
    function greater (data, value) {
        return number(data) && data > value;
    }

    /**
     * Public function `less`.
     *
     * Returns `true` if something is a number
     * less than `value`, `false` otherwise.
     *
     */
    function less (data, value) {
        return number(data) && data < value;
    }

    /**
     * Public function `positive`.
     *
     * Returns `true` if something is a positive number,
     * `false` otherwise.
     *
     */
    function positive (data) {
        return greater(data, 0);
    }

    /**
     * Public function `negative`.
     *
     * Returns `true` if something is a negative number,
     * `false` otherwise.
     *
     * @param data          The thing to test.
     */
    function negative (data) {
        return less(data, 0);
    }

    /**
     * Public function `number`.
     *
     * Returns `true` if data is a number,
     * `false` otherwise.
     *
     */
    function number (data) {
        return typeof data === 'number' && isNaN(data) === false &&
               data !== Number.POSITIVE_INFINITY &&
               data !== Number.NEGATIVE_INFINITY;
    }

    /**
     * Public function `zero`.
     *
     * Returns `true` if something is zero,
     * `false` otherwise.
     *
     * @param data          The thing to test.
     */
    function zero (data) {
        return data === 0;
    }

    /**
     * Public function `boolean`.
     *
     * Returns `true` if data is a boolean value,
     * `false` otherwise.
     *
     */
    function boolean (data) {
        return data === false || data === true;
    }

    /**
     * Public function `apply`.
     *
     * Maps each value from the data to the corresponding predicate and returns
     * the result array. If the same function is to be applied across all of the
     * data, a single predicate function may be passed in.
     *
     */
    function apply (data, predicates) {
        assert.array(data);

        if (isFunction(predicates)) {
            return data.map(function (value) {
                return predicates(value);
            });
        }

        assert.array(predicates);
        assert.hasLength(data, predicates.length);

        return data.map(function (value, index) {
            return predicates[index](value);
        });
    }

    /**
     * Public function `map`.
     *
     * Maps each value from the data to the corresponding predicate and returns
     * the result object. Supports nested objects. If the data is not nested and
     * the same function is to be applied across all of it, a single predicate
     * function may be passed in.
     *
     */
    function map (data, predicates) {
        assert.object(data);

        if (isFunction(predicates)) {
            return mapSimple(data, predicates);
        }

        assert.object(predicates);

        return mapComplex(data, predicates);
    }

    function mapSimple (data, predicate) {
        var result = {};

        Object.keys(data).forEach(function (key) {
            result[key] = predicate(data[key]);
        });

        return result;
    }

    function mapComplex (data, predicates) {
        var result = {};

        Object.keys(predicates).forEach(function (key) {
            var predicate = predicates[key];

            if (isFunction(predicate)) {
                result[key] = predicate(data[key]);
            } else if (object(predicate)) {
                result[key] = mapComplex(data[key], predicate);
            }
        });

        return result;
    }

    /**
     * Public function `all`
     *
     * Check that all boolean values are true
     * in an array (returned from `apply`)
     * or object (returned from `map`).
     *
     */
    function all (data) {
        if (array(data)) {
            return testArray(data, false);
        }

        assert.object(data);

        return testObject(data, false);
    }

    function testArray (data, result) {
        var i;

        for (i = 0; i < data.length; i += 1) {
            if (data[i] === result) {
                return result;
            }
        }

        return !result;
    }

    function testObject (data, result) {
        var key, value;

        for (key in data) {
            if (data.hasOwnProperty(key)) {
                value = data[key];

                if (object(value) && testObject(value, result) === result) {
                    return result;
                }

                if (value === result) {
                    return result;
                }
            }
        }

        return !result;
    }

    /**
     * Public function `any`
     *
     * Check that at least one boolean value is true
     * in an array (returned from `apply`)
     * or object (returned from `map`).
     *
     */
    function any (data) {
        if (array(data)) {
            return testArray(data, true);
        }

        assert.object(data);

        return testObject(data, true);
    }

    function mixin (target, source) {
        Object.keys(source).forEach(function (key) {
            target[key] = source[key];
        });

        return target;
    }

    /**
     * Public modifier `assert`.
     *
     * Throws if `predicate` returns `false`.
     */
    function assertModifier (predicate, defaultMessage) {
        return function () {
            assertPredicate(predicate, arguments, defaultMessage);
        };
    }

    function assertPredicate (predicate, args, defaultMessage) {
        var message = args[args.length - 1];
        assertImpl(predicate.apply(null, args), unemptyString(message) ? message : defaultMessage);
    }

    function assertImpl (value, message) {
        if (value === false) {
            throw new Error(message || 'Assertion failed');
        }
    }

    function assertEitherModifier (predicate, defaultMessage) {
        return function () {
            var error;

            try {
                assertPredicate(predicate, arguments, defaultMessage);
            } catch (e) {
                error = e;
            }

            return {
                or: Object.keys(predicates).reduce(delayedAssert, {})
            };

            function delayedAssert (result, key) {
                result[key] = function () {
                    if (error && !predicates[key].apply(null, arguments)) {
                        throw error;
                    }
                };

                return result;
            }
        };
    }

    /**
     * Public modifier `not`.
     *
     * Negates `predicate`.
     */
    function notModifier (predicate) {
        return function () {
            return notImpl(predicate.apply(null, arguments));
        };
    }

    function notImpl (value) {
        return !value;
    }

    /**
     * Public modifier `maybe`.
     *
     * Returns `true` if predicate argument is  `null` or `undefined`,
     * otherwise propagates the return value from `predicate`.
     */
    function maybeModifier (predicate) {
        return function () {
            if (!assigned(arguments[0])) {
                return true;
            }

            return predicate.apply(null, arguments);
        };
    }

    function maybeImpl (value) {
        if (assigned(value) === false) {
            return true;
        }

        return value;
    }

    /**
     * Public modifier `either`.
     *
     * Returns `true` if either predicate is true.
     */
    function eitherModifier (predicate) {
        return function () {
            var shortcut = predicate.apply(null, arguments);

            return {
                or: Object.keys(predicates).reduce(nopOrPredicate, {})
            };

            function nopOrPredicate (result, key) {
                result[key] = shortcut ? nop : predicates[key];
                return result;
            }
        };

        function nop () {
            return true;
        }
    }

    function createModifiedPredicates (modifier, object) {
        return createModifiedFunctions(modifier, predicates, object);
    }

    function createModifiedFunctions (modifier, functions, object) {
        var result = object || {};

        Object.keys(functions).forEach(function (key) {
            Object.defineProperty(result, key, {
                configurable: false,
                enumerable: true,
                writable: false,
                value: modifier(functions[key], messages[key])
            });
        });

        return result;
    }

    function exportFunctions (functions) {
        if (typeof define === 'function' && define.amd) {
            define(function () {
                return functions;
            });
        } else if (typeof module !== 'undefined' && module !== null && module.exports) {
            module.exports = functions;
        } else {
            globals.check = functions;
        }
    }
}(this));

},{}],"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/flux/index.js":[function(require,module,exports){
/**
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

module.exports.Dispatcher = require('./lib/Dispatcher')

},{"./lib/Dispatcher":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/flux/lib/Dispatcher.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/flux/lib/Dispatcher.js":[function(require,module,exports){
/*
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule Dispatcher
 * @typechecks
 */

"use strict";

var invariant = require('./invariant');

var _lastID = 1;
var _prefix = 'ID_';

/**
 * Dispatcher is used to broadcast payloads to registered callbacks. This is
 * different from generic pub-sub systems in two ways:
 *
 *   1) Callbacks are not subscribed to particular events. Every payload is
 *      dispatched to every registered callback.
 *   2) Callbacks can be deferred in whole or part until other callbacks have
 *      been executed.
 *
 * For example, consider this hypothetical flight destination form, which
 * selects a default city when a country is selected:
 *
 *   var flightDispatcher = new Dispatcher();
 *
 *   // Keeps track of which country is selected
 *   var CountryStore = {country: null};
 *
 *   // Keeps track of which city is selected
 *   var CityStore = {city: null};
 *
 *   // Keeps track of the base flight price of the selected city
 *   var FlightPriceStore = {price: null}
 *
 * When a user changes the selected city, we dispatch the payload:
 *
 *   flightDispatcher.dispatch({
 *     actionType: 'city-update',
 *     selectedCity: 'paris'
 *   });
 *
 * This payload is digested by `CityStore`:
 *
 *   flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'city-update') {
 *       CityStore.city = payload.selectedCity;
 *     }
 *   });
 *
 * When the user selects a country, we dispatch the payload:
 *
 *   flightDispatcher.dispatch({
 *     actionType: 'country-update',
 *     selectedCountry: 'australia'
 *   });
 *
 * This payload is digested by both stores:
 *
 *    CountryStore.dispatchToken = flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'country-update') {
 *       CountryStore.country = payload.selectedCountry;
 *     }
 *   });
 *
 * When the callback to update `CountryStore` is registered, we save a reference
 * to the returned token. Using this token with `waitFor()`, we can guarantee
 * that `CountryStore` is updated before the callback that updates `CityStore`
 * needs to query its data.
 *
 *   CityStore.dispatchToken = flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'country-update') {
 *       // `CountryStore.country` may not be updated.
 *       flightDispatcher.waitFor([CountryStore.dispatchToken]);
 *       // `CountryStore.country` is now guaranteed to be updated.
 *
 *       // Select the default city for the new country
 *       CityStore.city = getDefaultCityForCountry(CountryStore.country);
 *     }
 *   });
 *
 * The usage of `waitFor()` can be chained, for example:
 *
 *   FlightPriceStore.dispatchToken =
 *     flightDispatcher.register(function(payload) {
 *       switch (payload.actionType) {
 *         case 'country-update':
 *           flightDispatcher.waitFor([CityStore.dispatchToken]);
 *           FlightPriceStore.price =
 *             getFlightPriceStore(CountryStore.country, CityStore.city);
 *           break;
 *
 *         case 'city-update':
 *           FlightPriceStore.price =
 *             FlightPriceStore(CountryStore.country, CityStore.city);
 *           break;
 *     }
 *   });
 *
 * The `country-update` payload will be guaranteed to invoke the stores'
 * registered callbacks in order: `CountryStore`, `CityStore`, then
 * `FlightPriceStore`.
 */

  function Dispatcher() {
    this.$Dispatcher_callbacks = {};
    this.$Dispatcher_isPending = {};
    this.$Dispatcher_isHandled = {};
    this.$Dispatcher_isDispatching = false;
    this.$Dispatcher_pendingPayload = null;
  }

  /**
   * Registers a callback to be invoked with every dispatched payload. Returns
   * a token that can be used with `waitFor()`.
   *
   * @param {function} callback
   * @return {string}
   */
  Dispatcher.prototype.register=function(callback) {
    var id = _prefix + _lastID++;
    this.$Dispatcher_callbacks[id] = callback;
    return id;
  };

  /**
   * Removes a callback based on its token.
   *
   * @param {string} id
   */
  Dispatcher.prototype.unregister=function(id) {
    invariant(
      this.$Dispatcher_callbacks[id],
      'Dispatcher.unregister(...): `%s` does not map to a registered callback.',
      id
    );
    delete this.$Dispatcher_callbacks[id];
  };

  /**
   * Waits for the callbacks specified to be invoked before continuing execution
   * of the current callback. This method should only be used by a callback in
   * response to a dispatched payload.
   *
   * @param {array<string>} ids
   */
  Dispatcher.prototype.waitFor=function(ids) {
    invariant(
      this.$Dispatcher_isDispatching,
      'Dispatcher.waitFor(...): Must be invoked while dispatching.'
    );
    for (var ii = 0; ii < ids.length; ii++) {
      var id = ids[ii];
      if (this.$Dispatcher_isPending[id]) {
        invariant(
          this.$Dispatcher_isHandled[id],
          'Dispatcher.waitFor(...): Circular dependency detected while ' +
          'waiting for `%s`.',
          id
        );
        continue;
      }
      invariant(
        this.$Dispatcher_callbacks[id],
        'Dispatcher.waitFor(...): `%s` does not map to a registered callback.',
        id
      );
      this.$Dispatcher_invokeCallback(id);
    }
  };

  /**
   * Dispatches a payload to all registered callbacks.
   *
   * @param {object} payload
   */
  Dispatcher.prototype.dispatch=function(payload) {
    invariant(
      !this.$Dispatcher_isDispatching,
      'Dispatch.dispatch(...): Cannot dispatch in the middle of a dispatch.'
    );
    this.$Dispatcher_startDispatching(payload);
    try {
      for (var id in this.$Dispatcher_callbacks) {
        if (this.$Dispatcher_isPending[id]) {
          continue;
        }
        this.$Dispatcher_invokeCallback(id);
      }
    } finally {
      this.$Dispatcher_stopDispatching();
    }
  };

  /**
   * Is this Dispatcher currently dispatching.
   *
   * @return {boolean}
   */
  Dispatcher.prototype.isDispatching=function() {
    return this.$Dispatcher_isDispatching;
  };

  /**
   * Call the callback stored with the given id. Also do some internal
   * bookkeeping.
   *
   * @param {string} id
   * @internal
   */
  Dispatcher.prototype.$Dispatcher_invokeCallback=function(id) {
    this.$Dispatcher_isPending[id] = true;
    this.$Dispatcher_callbacks[id](this.$Dispatcher_pendingPayload);
    this.$Dispatcher_isHandled[id] = true;
  };

  /**
   * Set up bookkeeping needed when dispatching.
   *
   * @param {object} payload
   * @internal
   */
  Dispatcher.prototype.$Dispatcher_startDispatching=function(payload) {
    for (var id in this.$Dispatcher_callbacks) {
      this.$Dispatcher_isPending[id] = false;
      this.$Dispatcher_isHandled[id] = false;
    }
    this.$Dispatcher_pendingPayload = payload;
    this.$Dispatcher_isDispatching = true;
  };

  /**
   * Clear bookkeeping used for dispatching.
   *
   * @internal
   */
  Dispatcher.prototype.$Dispatcher_stopDispatching=function() {
    this.$Dispatcher_pendingPayload = null;
    this.$Dispatcher_isDispatching = false;
  };


module.exports = Dispatcher;

},{"./invariant":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/flux/lib/invariant.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/flux/lib/invariant.js":[function(require,module,exports){
/**
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule invariant
 */

"use strict";

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var invariant = function(condition, format, a, b, c, d, e, f) {
  if (false) {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  }

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error(
        'Minified exception occurred; use the non-minified dev environment ' +
        'for the full error message and additional helpful warnings.'
      );
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(
        'Invariant Violation: ' +
        format.replace(/%s/g, function() { return args[argIndex++]; })
      );
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
};

module.exports = invariant;

},{}],"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/global/document.js":[function(require,module,exports){
(function (global){
var topLevel = typeof global !== 'undefined' ? global :
    typeof window !== 'undefined' ? window : {}
var minDoc = require('min-document');

if (typeof document !== 'undefined') {
    module.exports = document;
} else {
    var doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'];

    if (!doccy) {
        doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'] = minDoc;
    }

    module.exports = doccy;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"min-document":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/browser-resolve/empty.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/global/window.js":[function(require,module,exports){
(function (global){
if (typeof window !== "undefined") {
    module.exports = window;
} else if (typeof global !== "undefined") {
    module.exports = global;
} else if (typeof self !== "undefined"){
    module.exports = self;
} else {
    module.exports = {};
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/printf/lib/printf.js":[function(require,module,exports){

var util = require('util');

var tokenize = function(/*String*/ str, /*RegExp*/ re, /*Function?*/ parseDelim, /*Object?*/ instance){
  // summary:
  //    Split a string by a regular expression with the ability to capture the delimeters
  // parseDelim:
  //    Each group (excluding the 0 group) is passed as a parameter. If the function returns
  //    a value, it's added to the list of tokens.
  // instance:
  //    Used as the "this' instance when calling parseDelim
  var tokens = [];
  var match, content, lastIndex = 0;
  while(match = re.exec(str)){
    content = str.slice(lastIndex, re.lastIndex - match[0].length);
    if(content.length){
      tokens.push(content);
    }
    if(parseDelim){
      var parsed = parseDelim.apply(instance, match.slice(1).concat(tokens.length));
      if(typeof parsed != 'undefined'){
        if(parsed.specifier === '%'){
          tokens.push('%');
        }else{
          tokens.push(parsed);
        }
      }
    }
    lastIndex = re.lastIndex;
  }
  content = str.slice(lastIndex);
  if(content.length){
    tokens.push(content);
  }
  return tokens;
}

var Formatter = function(/*String*/ format){
  var tokens = [];
  this._mapped = false;
  this._format = format;
  this._tokens = tokenize(format, this._re, this._parseDelim, this);
}

Formatter.prototype._re = /\%(?:\(([\w_]+)\)|([1-9]\d*)\$)?([0 +\-\#]*)(\*|\d+)?(\.)?(\*|\d+)?[hlL]?([\%bscdeEfFgGioOuxX])/g;
Formatter.prototype._parseDelim = function(mapping, intmapping, flags, minWidth, period, precision, specifier){
  if(mapping){
    this._mapped = true;
  }
  return {
    mapping: mapping,
    intmapping: intmapping,
    flags: flags,
    _minWidth: minWidth, // May be dependent on parameters
    period: period,
    _precision: precision, // May be dependent on parameters
    specifier: specifier
  };
};
Formatter.prototype._specifiers = {
  b: {
    base: 2,
    isInt: true
  },
  o: {
    base: 8,
    isInt: true
  },
  x: {
    base: 16,
    isInt: true
  },
  X: {
    extend: ['x'],
    toUpper: true
  },
  d: {
    base: 10,
    isInt: true
  },
  i: {
    extend: ['d']
  },
  u: {
    extend: ['d'],
    isUnsigned: true
  },
  c: {
    setArg: function(token){
      if(!isNaN(token.arg)){
        var num = parseInt(token.arg);
        if(num < 0 || num > 127){
          throw new Error('invalid character code passed to %c in printf');
        }
        token.arg = isNaN(num) ? '' + num : String.fromCharCode(num);
      }
    }
  },
  s: {
    setMaxWidth: function(token){
      token.maxWidth = (token.period == '.') ? token.precision : -1;
    }
  },
  e: {
    isDouble: true,
    doubleNotation: 'e'
  },
  E: {
    extend: ['e'],
    toUpper: true
  },
  f: {
    isDouble: true,
    doubleNotation: 'f'
  },
  F: {
    extend: ['f']
  },
  g: {
    isDouble: true,
    doubleNotation: 'g'
  },
  G: {
    extend: ['g'],
    toUpper: true
  },
  O: {
    isObject: true
  },
};
Formatter.prototype.format = function(/*mixed...*/ filler){
  if(this._mapped && typeof filler != 'object'){
    throw new Error('format requires a mapping');
  }

  var str = '';
  var position = 0;
  for(var i = 0, token; i < this._tokens.length; i++){
    token = this._tokens[i];
    
    if(typeof token == 'string'){
      str += token;
    }else{
      if(this._mapped){
        if(typeof filler[token.mapping] == 'undefined'){
          throw new Error('missing key ' + token.mapping);
        }
        token.arg = filler[token.mapping];
      }else{
        if(token.intmapping){
          position = parseInt(token.intmapping) - 1;
        }
        if(position >= arguments.length){
          throw new Error('got ' + arguments.length + ' printf arguments, insufficient for \'' + this._format + '\'');
        }
        token.arg = arguments[position++];
      }

      if(!token.compiled){
        token.compiled = true;
        token.sign = '';
        token.zeroPad = false;
        token.rightJustify = false;
        token.alternative = false;

        var flags = {};
        for(var fi = token.flags.length; fi--;){
          var flag = token.flags.charAt(fi);
          flags[flag] = true;
          switch(flag){
            case ' ':
              token.sign = ' ';
              break;
            case '+':
              token.sign = '+';
              break;
            case '0':
              token.zeroPad = (flags['-']) ? false : true;
              break;
            case '-':
              token.rightJustify = true;
              token.zeroPad = false;
              break;
            case '#':
              token.alternative = true;
              break;
            default:
              throw Error('bad formatting flag \'' + token.flags.charAt(fi) + '\'');
          }
        }

        token.minWidth = (token._minWidth) ? parseInt(token._minWidth) : 0;
        token.maxWidth = -1;
        token.toUpper = false;
        token.isUnsigned = false;
        token.isInt = false;
        token.isDouble = false;
        token.isObject = false;
        token.precision = 1;
        if(token.period == '.'){
          if(token._precision){
            token.precision = parseInt(token._precision);
          }else{
            token.precision = 0;
          }
        }

        var mixins = this._specifiers[token.specifier];
        if(typeof mixins == 'undefined'){
          throw new Error('unexpected specifier \'' + token.specifier + '\'');
        }
        if(mixins.extend){
          var s = this._specifiers[mixins.extend];
          for(var k in s){
            mixins[k] = s[k]
          }
          delete mixins.extend;
        }
        for(var l in mixins){
          token[l] = mixins[l];
        }
      }

      if(typeof token.setArg == 'function'){
        token.setArg(token);
      }

      if(typeof token.setMaxWidth == 'function'){
        token.setMaxWidth(token);
      }

      if(token._minWidth == '*'){
        if(this._mapped){
          throw new Error('* width not supported in mapped formats');
        }
        token.minWidth = parseInt(arguments[position++]);
        if(isNaN(token.minWidth)){
          throw new Error('the argument for * width at position ' + position + ' is not a number in ' + this._format);
        }
        // negative width means rightJustify
        if (token.minWidth < 0) {
          token.rightJustify = true;
          token.minWidth = -token.minWidth;
        }
      }

      if(token._precision == '*' && token.period == '.'){
        if(this._mapped){
          throw new Error('* precision not supported in mapped formats');
        }
        token.precision = parseInt(arguments[position++]);
        if(isNaN(token.precision)){
          throw Error('the argument for * precision at position ' + position + ' is not a number in ' + this._format);
        }
        // negative precision means unspecified
        if (token.precision < 0) {
          token.precision = 1;
          token.period = '';
        }
      }
      if(token.isInt){
        // a specified precision means no zero padding
        if(token.period == '.'){
          token.zeroPad = false;
        }
        this.formatInt(token);
      }else if(token.isDouble){
        if(token.period != '.'){
          token.precision = 6;
        }
        this.formatDouble(token); 
      }else if(token.isObject){
        this.formatObject(token);
      }
      this.fitField(token);

      str += '' + token.arg;
    }
  }

  return str;
};
Formatter.prototype._zeros10 = '0000000000';
Formatter.prototype._spaces10 = '          ';
Formatter.prototype.formatInt = function(token) {
  var i = parseInt(token.arg);
  if(!isFinite(i)){ // isNaN(f) || f == Number.POSITIVE_INFINITY || f == Number.NEGATIVE_INFINITY)
    // allow this only if arg is number
    if(typeof token.arg != 'number'){
      throw new Error('format argument \'' + token.arg + '\' not an integer; parseInt returned ' + i);
    }
    //return '' + i;
    i = 0;
  }

  // if not base 10, make negatives be positive
  // otherwise, (-10).toString(16) is '-a' instead of 'fffffff6'
  if(i < 0 && (token.isUnsigned || token.base != 10)){
    i = 0xffffffff + i + 1;
  } 

  if(i < 0){
    token.arg = (- i).toString(token.base);
    this.zeroPad(token);
    token.arg = '-' + token.arg;
  }else{
    token.arg = i.toString(token.base);
    // need to make sure that argument 0 with precision==0 is formatted as ''
    if(!i && !token.precision){
      token.arg = '';
    }else{
      this.zeroPad(token);
    }
    if(token.sign){
      token.arg = token.sign + token.arg;
    }
  }
  if(token.base == 16){
    if(token.alternative){
      token.arg = '0x' + token.arg;
    }
    token.arg = token.toUpper ? token.arg.toUpperCase() : token.arg.toLowerCase();
  }
  if(token.base == 8){
    if(token.alternative && token.arg.charAt(0) != '0'){
      token.arg = '0' + token.arg;
    }
  }
};
Formatter.prototype.formatDouble = function(token) {
  var f = parseFloat(token.arg);
  if(!isFinite(f)){ // isNaN(f) || f == Number.POSITIVE_INFINITY || f == Number.NEGATIVE_INFINITY)
    // allow this only if arg is number
    if(typeof token.arg != 'number'){
      throw new Error('format argument \'' + token.arg + '\' not a float; parseFloat returned ' + f);
    }
    // C99 says that for 'f':
    //   infinity -> '[-]inf' or '[-]infinity' ('[-]INF' or '[-]INFINITY' for 'F')
    //   NaN -> a string  starting with 'nan' ('NAN' for 'F')
    // this is not commonly implemented though.
    //return '' + f;
    f = 0;
  }

  switch(token.doubleNotation) {
    case 'e': {
      token.arg = f.toExponential(token.precision); 
      break;
    }
    case 'f': {
      token.arg = f.toFixed(token.precision); 
      break;
    }
    case 'g': {
      // C says use 'e' notation if exponent is < -4 or is >= prec
      // ECMAScript for toPrecision says use exponential notation if exponent is >= prec,
      // though step 17 of toPrecision indicates a test for < -6 to force exponential.
      if(Math.abs(f) < 0.0001){
        //print('forcing exponential notation for f=' + f);
        token.arg = f.toExponential(token.precision > 0 ? token.precision - 1 : token.precision);
      }else{
        token.arg = f.toPrecision(token.precision); 
      }

      // In C, unlike 'f', 'gG' removes trailing 0s from fractional part, unless alternative format flag ('#').
      // But ECMAScript formats toPrecision as 0.00100000. So remove trailing 0s.
      if(!token.alternative){ 
        //print('replacing trailing 0 in \'' + s + '\'');
        token.arg = token.arg.replace(/(\..*[^0])0*e/, '$1e');
        // if fractional part is entirely 0, remove it and decimal point
        token.arg = token.arg.replace(/\.0*e/, 'e').replace(/\.0$/,'');
      }
      break;
    }
    default: throw new Error('unexpected double notation \'' + token.doubleNotation + '\'');
  }

  // C says that exponent must have at least two digits.
  // But ECMAScript does not; toExponential results in things like '1.000000e-8' and '1.000000e+8'.
  // Note that s.replace(/e([\+\-])(\d)/, 'e$10$2') won't work because of the '$10' instead of '$1'.
  // And replace(re, func) isn't supported on IE50 or Safari1.
  token.arg = token.arg.replace(/e\+(\d)$/, 'e+0$1').replace(/e\-(\d)$/, 'e-0$1');

  // if alt, ensure a decimal point
  if(token.alternative){
    token.arg = token.arg.replace(/^(\d+)$/,'$1.');
    token.arg = token.arg.replace(/^(\d+)e/,'$1.e');
  }

  if(f >= 0 && token.sign){
    token.arg = token.sign + token.arg;
  }

  token.arg = token.toUpper ? token.arg.toUpperCase() : token.arg.toLowerCase();
};
Formatter.prototype.formatObject = function(token) {
  // If no precision is specified, then reset it to null (infinite depth).
  var precision = (token.period === '.') ? token.precision : null;
  token.arg = util.inspect(token.arg, !token.alternative, precision);
};
Formatter.prototype.zeroPad = function(token, /*Int*/ length) {
  length = (arguments.length == 2) ? length : token.precision;
  var negative = false;
  if(typeof token.arg != "string"){
    token.arg = "" + token.arg;
  }
  if (token.arg.substr(0,1) === '-') {
    negative = true;
    token.arg = token.arg.substr(1);
  }

  var tenless = length - 10;
  while(token.arg.length < tenless){
    token.arg = (token.rightJustify) ? token.arg + this._zeros10 : this._zeros10 + token.arg;
  }
  var pad = length - token.arg.length;
  token.arg = (token.rightJustify) ? token.arg + this._zeros10.substring(0, pad) : this._zeros10.substring(0, pad) + token.arg;
  if (negative) token.arg = '-' + token.arg;
};
Formatter.prototype.fitField = function(token) {
  if(token.maxWidth >= 0 && token.arg.length > token.maxWidth){
    return token.arg.substring(0, token.maxWidth);
  }
  if(token.zeroPad){
    this.zeroPad(token, token.minWidth);
    return;
  }
  this.spacePad(token);
};
Formatter.prototype.spacePad = function(token, /*Int*/ length) {
  length = (arguments.length == 2) ? length : token.minWidth;
  if(typeof token.arg != 'string'){
    token.arg = '' + token.arg;
  }
  var tenless = length - 10;
  while(token.arg.length < tenless){
    token.arg = (token.rightJustify) ? token.arg + this._spaces10 : this._spaces10 + token.arg;
  }
  var pad = length - token.arg.length;
  token.arg = (token.rightJustify) ? token.arg + this._spaces10.substring(0, pad) : this._spaces10.substring(0, pad) + token.arg;
};


module.exports = function(){
  var args = Array.prototype.slice.call(arguments),
    stream, format;
  if(args[0] instanceof require('stream').Stream){
    stream = args.shift();
  }
  format = args.shift();
  var formatter = new Formatter(format);
  var string = formatter.format.apply(formatter, args);
  if(stream){
    stream.write(string);
  }else{
    return string;
  }
};

module.exports.Formatter = Formatter;


},{"stream":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/stream-browserify/index.js","util":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/util/util.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/react/lib/invariant.js":[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule invariant
 */

"use strict";

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var invariant = function(condition, format, a, b, c, d, e, f) {
  if ("production" !== process.env.NODE_ENV) {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  }

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error(
        'Minified exception occurred; use the non-minified dev environment ' +
        'for the full error message and additional helpful warnings.'
      );
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(
        'Invariant Violation: ' +
        format.replace(/%s/g, function() { return args[argIndex++]; })
      );
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
};

module.exports = invariant;

}).call(this,require('_process'))

},{"_process":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/process/browser.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/react/lib/keyMirror.js":[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule keyMirror
 * @typechecks static-only
 */

'use strict';

var invariant = require("./invariant");

/**
 * Constructs an enumeration with keys equal to their value.
 *
 * For example:
 *
 *   var COLORS = keyMirror({blue: null, red: null});
 *   var myColor = COLORS.blue;
 *   var isColorValid = !!COLORS[myColor];
 *
 * The last line could not be performed if the values of the generated enum were
 * not equal to their keys.
 *
 *   Input:  {key1: val1, key2: val2}
 *   Output: {key1: key1, key2: key2}
 *
 * @param {object} obj
 * @return {object}
 */
var keyMirror = function(obj) {
  var ret = {};
  var key;
  ("production" !== process.env.NODE_ENV ? invariant(
    obj instanceof Object && !Array.isArray(obj),
    'keyMirror(...): Argument must be an object.'
  ) : invariant(obj instanceof Object && !Array.isArray(obj)));
  for (key in obj) {
    if (!obj.hasOwnProperty(key)) {
      continue;
    }
    ret[key] = key;
  }
  return ret;
};

module.exports = keyMirror;

}).call(this,require('_process'))

},{"./invariant":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/react/lib/invariant.js","_process":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/process/browser.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/server/EventConstants.js":[function(require,module,exports){
'use strict';

var keyMirror = require('react/lib/keyMirror');

module.exports = keyMirror({
    MISSION_STARTED: null,
    MISSION_STOPPED: null,
    MISSION_RESET: null,
    MISSION_COMPLETED: null,

    ADD_MESSAGE: null,

    //ACTIONS
    GET_EVENTS: null,
    SET_EVENTS: null,

    // SCIENCE TEAM EVENTS
    SCIENCE_CHECK_RADIATION: null,

    // ASTRONAUT TEAM EVENTS
    AST_CHECK_VITALS: null,

    // COMMUNICATION TEAM EVENTS
    COMM_INFORM_ASTRONAUT: null });

// SECURITY TEAM EVENTS

},{"react/lib/keyMirror":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/react/lib/keyMirror.js"}]},{},["./app/main.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvY2FybC1lcmlrLmtvcHNlbmcvZGV2X3ByaXYvRW1pc3Npb25zL2FwcC9tYWluLmpzIiwiL1VzZXJzL2NhcmwtZXJpay5rb3BzZW5nL2Rldl9wcml2L0VtaXNzaW9ucy9hcHAvYWN0aW9ucy9NZXNzYWdlQWN0aW9uQ3JlYXRvcnMuanMiLCIvVXNlcnMvY2FybC1lcmlrLmtvcHNlbmcvZGV2X3ByaXYvRW1pc3Npb25zL2FwcC9hY3Rpb25zL01pc3Npb25BY3Rpb25DcmVhdG9ycy5qcyIsIi9Vc2Vycy9jYXJsLWVyaWsua29wc2VuZy9kZXZfcHJpdi9FbWlzc2lvbnMvYXBwL2FjdGlvbnMvU2NpZW5jZUFjdGlvbkNyZWF0b3JzLmpzIiwiL1VzZXJzL2NhcmwtZXJpay5rb3BzZW5nL2Rldl9wcml2L0VtaXNzaW9ucy9hcHAvYWN0aW9ucy9UaW1lckFjdGlvbkNyZWF0b3JzLmpzIiwiL1VzZXJzL2NhcmwtZXJpay5rb3BzZW5nL2Rldl9wcml2L0VtaXNzaW9ucy9hcHAvYXBwZGlzcGF0Y2hlci5qcyIsIi9Vc2Vycy9jYXJsLWVyaWsua29wc2VuZy9kZXZfcHJpdi9FbWlzc2lvbnMvYXBwL2NsaWVudC1hcGkuanMiLCIvVXNlcnMvY2FybC1lcmlrLmtvcHNlbmcvZGV2X3ByaXYvRW1pc3Npb25zL2FwcC9jbGllbnQtYm9vdHN0cmFwLmpzIiwiL1VzZXJzL2NhcmwtZXJpay5rb3BzZW5nL2Rldl9wcml2L0VtaXNzaW9ucy9hcHAvY29tcG9uZW50cy9hcHAucmVhY3QuanMiLCIvVXNlcnMvY2FybC1lcmlrLmtvcHNlbmcvZGV2X3ByaXYvRW1pc3Npb25zL2FwcC9jb21wb25lbnRzL2NvbW1hbmRlci1hcHAucmVhY3QuanMiLCIvVXNlcnMvY2FybC1lcmlrLmtvcHNlbmcvZGV2X3ByaXYvRW1pc3Npb25zL2FwcC9jb21wb25lbnRzL2RpYWxvZ3MucmVhY3QuanMiLCIvVXNlcnMvY2FybC1lcmlrLmtvcHNlbmcvZGV2X3ByaXYvRW1pc3Npb25zL2FwcC9jb21wb25lbnRzL2R1bW15LXJlbmRlci5taXhpbi5qcyIsIi9Vc2Vycy9jYXJsLWVyaWsua29wc2VuZy9kZXZfcHJpdi9FbWlzc2lvbnMvYXBwL2NvbXBvbmVudHMvaGVhZGVyLnJlYWN0LmpzIiwiL1VzZXJzL2NhcmwtZXJpay5rb3BzZW5nL2Rldl9wcml2L0VtaXNzaW9ucy9hcHAvY29tcG9uZW50cy9pbmRleC1hcHAucmVhY3QuanMiLCIvVXNlcnMvY2FybC1lcmlrLmtvcHNlbmcvZGV2X3ByaXYvRW1pc3Npb25zL2FwcC9jb21wb25lbnRzL2ludHJvZHVjdGlvbi1zY3JlZW4ucmVhY3QuanMiLCIvVXNlcnMvY2FybC1lcmlrLmtvcHNlbmcvZGV2X3ByaXYvRW1pc3Npb25zL2FwcC9jb21wb25lbnRzL21lc3NhZ2UtbGlzdC5yZWFjdC5qcyIsIi9Vc2Vycy9jYXJsLWVyaWsua29wc2VuZy9kZXZfcHJpdi9FbWlzc2lvbnMvYXBwL2NvbXBvbmVudHMvbWlzc2lvbi10aW1lci5yZWFjdC5qcyIsIi9Vc2Vycy9jYXJsLWVyaWsua29wc2VuZy9kZXZfcHJpdi9FbWlzc2lvbnMvYXBwL2NvbXBvbmVudHMvbm90LWZvdW5kLnJlYWN0LmpzIiwiL1VzZXJzL2NhcmwtZXJpay5rb3BzZW5nL2Rldl9wcml2L0VtaXNzaW9ucy9hcHAvY29tcG9uZW50cy9vdmVybGF5LnJlYWN0LmpzIiwiL1VzZXJzL2NhcmwtZXJpay5rb3BzZW5nL2Rldl9wcml2L0VtaXNzaW9ucy9hcHAvY29tcG9uZW50cy9yYWRpYXRpb24tY2hhcnQucmVhY3QuanMiLCIvVXNlcnMvY2FybC1lcmlrLmtvcHNlbmcvZGV2X3ByaXYvRW1pc3Npb25zL2FwcC9jb21wb25lbnRzL3JhZGlhdGlvbi1zYW1wbGVyLnJlYWN0LmpzIiwiL1VzZXJzL2NhcmwtZXJpay5rb3BzZW5nL2Rldl9wcml2L0VtaXNzaW9ucy9hcHAvY29tcG9uZW50cy9yYWRpYXRpb24tdGFibGUucmVhY3QuanMiLCIvVXNlcnMvY2FybC1lcmlrLmtvcHNlbmcvZGV2X3ByaXYvRW1pc3Npb25zL2FwcC9jb21wb25lbnRzL3NjaWVuY2UtdGFzay5yZWFjdC5qcyIsIi9Vc2Vycy9jYXJsLWVyaWsua29wc2VuZy9kZXZfcHJpdi9FbWlzc2lvbnMvYXBwL2NvbXBvbmVudHMvdGFzay5yZWFjdC5qcyIsIi9Vc2Vycy9jYXJsLWVyaWsua29wc2VuZy9kZXZfcHJpdi9FbWlzc2lvbnMvYXBwL2NvbXBvbmVudHMvdGVhbS1kaXNwbGF5ZXIucmVhY3QuanMiLCIvVXNlcnMvY2FybC1lcmlrLmtvcHNlbmcvZGV2X3ByaXYvRW1pc3Npb25zL2FwcC9jb21wb25lbnRzL3RpbWVyLXBhbmVsLnJlYWN0LmpzIiwiL1VzZXJzL2NhcmwtZXJpay5rb3BzZW5nL2Rldl9wcml2L0VtaXNzaW9ucy9hcHAvY29tcG9uZW50cy90aW1lci5yZWFjdC5qcyIsIi9Vc2Vycy9jYXJsLWVyaWsua29wc2VuZy9kZXZfcHJpdi9FbWlzc2lvbnMvYXBwL2NvbnN0YW50cy9NZXNzYWdlQ29uc3RhbnRzLmpzIiwiL1VzZXJzL2NhcmwtZXJpay5rb3BzZW5nL2Rldl9wcml2L0VtaXNzaW9ucy9hcHAvY29uc3RhbnRzL01pc3Npb25Db25zdGFudHMuanMiLCIvVXNlcnMvY2FybC1lcmlrLmtvcHNlbmcvZGV2X3ByaXYvRW1pc3Npb25zL2FwcC9jb25zdGFudHMvUm91dGVyQ29uc3RhbnRzLmpzIiwiL1VzZXJzL2NhcmwtZXJpay5rb3BzZW5nL2Rldl9wcml2L0VtaXNzaW9ucy9hcHAvY29uc3RhbnRzL1NjaWVuY2VUZWFtQ29uc3RhbnRzLmpzIiwiL1VzZXJzL2NhcmwtZXJpay5rb3BzZW5nL2Rldl9wcml2L0VtaXNzaW9ucy9hcHAvY29uc3RhbnRzL1RpbWVyQ29uc3RhbnRzLmpzIiwiL1VzZXJzL2NhcmwtZXJpay5rb3BzZW5nL2Rldl9wcml2L0VtaXNzaW9ucy9hcHAvcm91dGVyLWNvbnRhaW5lci5qcyIsIi9Vc2Vycy9jYXJsLWVyaWsua29wc2VuZy9kZXZfcHJpdi9FbWlzc2lvbnMvYXBwL3JvdXRlcy5yZWFjdC5qcyIsIi9Vc2Vycy9jYXJsLWVyaWsua29wc2VuZy9kZXZfcHJpdi9FbWlzc2lvbnMvYXBwL3N0b3Jlcy9iYXNlLXN0b3JlLmpzIiwiL1VzZXJzL2NhcmwtZXJpay5rb3BzZW5nL2Rldl9wcml2L0VtaXNzaW9ucy9hcHAvc3RvcmVzL2V2ZW50LXN0b3JlLmpzIiwiL1VzZXJzL2NhcmwtZXJpay5rb3BzZW5nL2Rldl9wcml2L0VtaXNzaW9ucy9hcHAvc3RvcmVzL2ludHJvZHVjdGlvbi1zdG9yZS5qcyIsIi9Vc2Vycy9jYXJsLWVyaWsua29wc2VuZy9kZXZfcHJpdi9FbWlzc2lvbnMvYXBwL3N0b3Jlcy9tZXNzYWdlLXN0b3JlLmpzIiwiL1VzZXJzL2NhcmwtZXJpay5rb3BzZW5nL2Rldl9wcml2L0VtaXNzaW9ucy9hcHAvc3RvcmVzL21pc3Npb24tc3RhdGUtc3RvcmUuanMiLCIvVXNlcnMvY2FybC1lcmlrLmtvcHNlbmcvZGV2X3ByaXYvRW1pc3Npb25zL2FwcC9zdG9yZXMvcmFkaWF0aW9uLXN0b3JlLmpzIiwiL1VzZXJzL2NhcmwtZXJpay5rb3BzZW5nL2Rldl9wcml2L0VtaXNzaW9ucy9hcHAvc3RvcmVzL3JvdXRlLXN0b3JlLmpzIiwiL1VzZXJzL2NhcmwtZXJpay5rb3BzZW5nL2Rldl9wcml2L0VtaXNzaW9ucy9hcHAvc3RvcmVzL3Rhc2stc3RvcmUuanMiLCIvVXNlcnMvY2FybC1lcmlrLmtvcHNlbmcvZGV2X3ByaXYvRW1pc3Npb25zL2FwcC9zdG9yZXMvdGltZXItc3RvcmUuanMiLCIvVXNlcnMvY2FybC1lcmlrLmtvcHNlbmcvZGV2X3ByaXYvRW1pc3Npb25zL2FwcC90ZWFtLW5hbWUtbWFwLmpzIiwiL1VzZXJzL2NhcmwtZXJpay5rb3BzZW5nL2Rldl9wcml2L0VtaXNzaW9ucy9hcHAvdXRpbHMuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9hc3NpZ24uanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9mcmVlemUuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9rZXlzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvaGVscGVycy9jbGFzcy1jYWxsLWNoZWNrLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvaGVscGVycy9jcmVhdGUtY2xhc3MuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9oZWxwZXJzL2V4dGVuZHMuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9oZWxwZXJzL2luaGVyaXRzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvYXNzaWduLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZnJlZXplLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3Qva2V5cy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmFzc2lnbi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmRlZi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmZ3LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2Lm9iamVjdC5hc3NpZ24uanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2Lm9iamVjdC5zdGF0aWNzLWFjY2VwdC1wcmltaXRpdmVzLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcmVzb2x2ZS9lbXB0eS5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9idWZmZXIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnVmZmVyL25vZGVfbW9kdWxlcy9iYXNlNjQtanMvbGliL2I2NC5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9idWZmZXIvbm9kZV9tb2R1bGVzL2llZWU3NTQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnVmZmVyL25vZGVfbW9kdWxlcy9pcy1hcnJheS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9ldmVudHMvZXZlbnRzLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2luaGVyaXRzL2luaGVyaXRzX2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvaXNhcnJheS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcmVhZGFibGUtc3RyZWFtL2R1cGxleC5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9yZWFkYWJsZS1zdHJlYW0vbGliL19zdHJlYW1fZHVwbGV4LmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3JlYWRhYmxlLXN0cmVhbS9saWIvX3N0cmVhbV9wYXNzdGhyb3VnaC5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9yZWFkYWJsZS1zdHJlYW0vbGliL19zdHJlYW1fcmVhZGFibGUuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcmVhZGFibGUtc3RyZWFtL2xpYi9fc3RyZWFtX3RyYW5zZm9ybS5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9yZWFkYWJsZS1zdHJlYW0vbGliL19zdHJlYW1fd3JpdGFibGUuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcmVhZGFibGUtc3RyZWFtL25vZGVfbW9kdWxlcy9jb3JlLXV0aWwtaXMvbGliL3V0aWwuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcmVhZGFibGUtc3RyZWFtL3Bhc3N0aHJvdWdoLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3JlYWRhYmxlLXN0cmVhbS9yZWFkYWJsZS5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9yZWFkYWJsZS1zdHJlYW0vdHJhbnNmb3JtLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3JlYWRhYmxlLXN0cmVhbS93cml0YWJsZS5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9zdHJlYW0tYnJvd3NlcmlmeS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9zdHJpbmdfZGVjb2Rlci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy91dGlsL3N1cHBvcnQvaXNCdWZmZXJCcm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3V0aWwvdXRpbC5qcyIsIm5vZGVfbW9kdWxlcy9jaGVjay10eXBlcy9zcmMvY2hlY2stdHlwZXMuanMiLCJub2RlX21vZHVsZXMvZmx1eC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9mbHV4L2xpYi9EaXNwYXRjaGVyLmpzIiwibm9kZV9tb2R1bGVzL2ZsdXgvbGliL2ludmFyaWFudC5qcyIsIm5vZGVfbW9kdWxlcy9nbG9iYWwvZG9jdW1lbnQuanMiLCJub2RlX21vZHVsZXMvZ2xvYmFsL3dpbmRvdy5qcyIsIm5vZGVfbW9kdWxlcy9wcmludGYvbGliL3ByaW50Zi5qcyIsIm5vZGVfbW9kdWxlcy9yZWFjdC9saWIvaW52YXJpYW50LmpzIiwibm9kZV9tb2R1bGVzL3JlYWN0L2xpYi9rZXlNaXJyb3IuanMiLCIvVXNlcnMvY2FybC1lcmlrLmtvcHNlbmcvZGV2X3ByaXYvRW1pc3Npb25zL3NlcnZlci9FdmVudENvbnN0YW50cy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7OztBQ0FBLElBQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUMvQixJQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUM1QyxJQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDeEMsSUFBTSxtQkFBbUIsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7OztBQUdwRCxJQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQzs7QUFFN0MsSUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDakQsSUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLDZCQUE2QixDQUFDLENBQUM7O0FBRXpELG1CQUFtQixDQUFDLEtBQUssRUFBRSxDQUFDOzs7QUFHNUIsTUFBTSxDQUFDLE9BQU8sR0FBQyxtQkFBbUIsQ0FBQyxpQkFBaUIsQ0FBQzs7O0FBR3JELE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxD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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7O0FDREE7QUFDQTs7QUNEQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwR0E7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBOzs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN6RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDdjdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2pOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUM3ZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzFHQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTs7QUNEQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDMWtCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNudEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzdjQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QUNuREEsSUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUM7O0FBRWpELE1BQU0sQ0FBQyxPQUFPLEdBQUcsU0FBUyxDQUFDO0FBQ3ZCLG1CQUFlLEVBQUcsSUFBSTtBQUN0QixtQkFBZSxFQUFHLElBQUk7QUFDdEIsaUJBQWEsRUFBRyxJQUFJO0FBQ3BCLHFCQUFpQixFQUFHLElBQUk7O0FBRXhCLGVBQVcsRUFBRyxJQUFJOzs7QUFHbEIsY0FBVSxFQUFHLElBQUk7QUFDakIsY0FBVSxFQUFHLElBQUk7OztBQUdqQiwyQkFBdUIsRUFBRyxJQUFJOzs7QUFHOUIsb0JBQWdCLEVBQUcsSUFBSTs7O0FBR3ZCLHlCQUFxQixFQUFHLElBQUksRUFHL0IsQ0FBQyxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbmNvbnN0IGRvY3VtZW50ID0gcmVxdWlyZSgnZ2xvYmFsL2RvY3VtZW50Jyk7XG5jb25zdCB3aW5kb3cgPSByZXF1aXJlKCdnbG9iYWwvd2luZG93Jyk7XG5jb25zdCBzZXJ2ZXJDb21tdW5pY2F0aW9uID0gcmVxdWlyZSgnLi9jbGllbnQtYXBpJyk7XG5cbi8vIHRoZSBhY3R1YWwgcmlnZ2luZyBvZiB0aGUgYXBwbGljYXRpb24gaXMgZG9uZSBpbiB0aGUgcm91dGVyIVxuY29uc3Qgcm91dGVyID0gcmVxdWlyZSgnLi9yb3V0ZXItY29udGFpbmVyJyk7XG5cbmNvbnN0IEFwcERpc3BhdGNoZXIgPSByZXF1aXJlKCcuL2FwcGRpc3BhdGNoZXInKTtcbmNvbnN0IGNvbnN0YW50cyA9IHJlcXVpcmUoJy4vY29uc3RhbnRzL1JvdXRlckNvbnN0YW50cycpO1xuXG5zZXJ2ZXJDb21tdW5pY2F0aW9uLnNldHVwKCk7XG5cbi8vIHRoZSBtaXNzaW9uIHRpbWVyIGdldHMgb3V0IHN5bmMgaWYgbG9zaW5nIGZvY3VzLCBzbyByZXN5bmMgd2l0aCBzZXJ2ZXIgZXZlcnkgdGltZSB0aGUgd2luZG93IHJlZ2FpbnMgZm9jdXNcbndpbmRvdy5vbmZvY3VzPXNlcnZlckNvbW11bmljYXRpb24uYXNrRm9yTWlzc2lvblRpbWU7XG5cbi8vIHJ1biBzdGFydHVwIGFjdGlvbnMgLSB1c3VhbGx5IG9ubHkgcmVsZXZhbnQgd2hlbiBkZXZlbG9waW5nXG5yZXF1aXJlKCcuL2NsaWVudC1ib290c3RyYXAnKS5ydW4oKTtcblxucm91dGVyLnJ1bigoSGFuZGxlciwgc3RhdGUpID0+IHtcbiAgICAvLyBwYXNzIHRoZSBzdGF0ZSBkb3duIGludG8gdGhlIFJvdXRlSGFuZGxlcnMsIGFzIHRoYXQgd2lsbCBtYWtlXG4gICAgLy8gdGhlIHJvdXRlciByZWxhdGVkIHByb3BlcnRpZXMgYXZhaWxhYmxlIG9uIGVhY2ggUkguIFRha2VuIGZyb20gVXBncmFkZSB0aXBzIGZvciBSZWFjdCBSb3V0ZXJcbiAgICBSZWFjdC5yZW5kZXIoPEhhbmRsZXIgey4uLnN0YXRlfS8+LCBkb2N1bWVudC5ib2R5KTtcbn0pO1xuXG4iLCJjb25zdCBBcHBEaXNwYXRjaGVyID0gcmVxdWlyZSgnLi4vYXBwZGlzcGF0Y2hlcicpLFxuICAgIHV1aWQgPSByZXF1aXJlKCcuLy4uL3V0aWxzJykudXVpZCxcbiAgICBjb25zdGFudHMgPSByZXF1aXJlKCcuLi9jb25zdGFudHMvTWVzc2FnZUNvbnN0YW50cycpO1xuXG5jb25zdCBhY3Rpb25zID0ge1xuXG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0gbXNnLnRleHQgdGhlIG1lc3NhZ2VcbiAgICAgKiBAcGFyYW0gW21zZy5pZF0gdGhlIG1lc3NhZ2UgaWQuIGlmIG5vdCBnaXZlbiwgb25lIHdpbGwgYmUgY3JlYXRlZFxuICAgICAqIEBwYXJhbSBbbXNnLmxldmVsXSBzYW1lIGFzIGJvb3RzdHJhcCdzIGFsZXJ0IGNsYXNzZXM6IFtzdWNjZXNzLCBpbmZvLCB3YXJuaW5nLCBkYW5nZXJdXG4gICAgICogQHBhcmFtIFttc2cuZHVyYXRpb25dIHtOdW1iZXJ9IG9wdGlvbmFsIGR1cmF0aW9uIGZvciB0cmFuc2llbnQgbWVzc2FnZXNcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IHRoZSBtZXNzYWdlIGlkXG4gICAgICovXG4gICAgYWRkTWVzc2FnZShtc2cpIHtcbiAgICAgICAgdmFyIGlkID0gbXNnLmlkO1xuXG4gICAgICAgIGlmICghaWQpIHtcbiAgICAgICAgICAgIGlkID0gdXVpZCgpO1xuICAgICAgICAgICAgbXNnLmlkID0gaWQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIW1zZy5sZXZlbCkge1xuICAgICAgICAgICAgbXNnLmxldmVsID0gJ3N1Y2Nlc3MnO1xuICAgICAgICB9XG5cbiAgICAgICAgQXBwRGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiBjb25zdGFudHMuTUVTU0FHRV9BRERFRCxcbiAgICAgICAgICAgICAgICBkYXRhOiBtc2dcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcblxuICAgICAgICBpZiAobXNnLmR1cmF0aW9uKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IGFjdGlvbnMucmVtb3ZlTWVzc2FnZShtc2cuaWQpLCBtc2cuZHVyYXRpb24gKiAxMDAwKVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGlkO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBtc2cgd2l0aCBkZWZhdWx0IGR1cmF0aW9uIG9mIDUgc2Vjb25kc1xuICAgICAqIEBwYXJhbSBtc2dcbiAgICAgKiBAcGFyYW0gW2R1cmF0aW9uXSBkZWZhdWx0IG9mIDUgc2Vjb25kc1xuICAgICAqXG4gICAgICogQHNlZSAjYWRkTWVzc2FnZSgpIGZvciBtb3JlIHBhcmFtc1xuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IHRoZSBtZXNzYWdlIGlkXG4gICAgICovXG4gICAgYWRkVHJhbnNpZW50TWVzc2FnZShtc2csIGR1cmF0aW9uID0gNSkge1xuICAgICAgICByZXR1cm4gYWN0aW9ucy5hZGRNZXNzYWdlKE9iamVjdC5hc3NpZ24oe2R1cmF0aW9ufSwgbXNnKSlcbiAgICB9LFxuXG4gICAgcmVtb3ZlTWVzc2FnZShpZCkge1xuICAgICAgICBBcHBEaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICBhY3Rpb246IGNvbnN0YW50cy5SRU1PVkVfTUVTU0FHRSxcbiAgICAgICAgICAgICAgICBkYXRhOiBpZFxuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgIH1cblxufTtcblxuLy8gcHJldmVudCBuZXcgcHJvcGVydGllcyBmcm9tIGJlaW5nIGFkZGVkIG9yIHJlbW92ZWRcbk9iamVjdC5mcmVlemUoYWN0aW9ucyk7XG53aW5kb3cuX19NZXNzYWdlQWN0aW9ucyA9IGFjdGlvbnM7XG5tb2R1bGUuZXhwb3J0cyA9IGFjdGlvbnM7IiwiY29uc3QgQXBwRGlzcGF0Y2hlciA9IHJlcXVpcmUoJy4uL2FwcGRpc3BhdGNoZXInKSxcbiAgICBNaXNzaW9uQ29uc3RhbnRzID0gcmVxdWlyZSgnLi4vY29uc3RhbnRzL01pc3Npb25Db25zdGFudHMnKSxcbiAgICByb3V0ZXIgPSByZXF1aXJlKCcuLy4uL3JvdXRlci1jb250YWluZXInKTtcblxuLy8gbGF6eSBsb2FkIGR1ZSB0byBjaXJjdWxhciBkZXBlbmRlbmNpZXNcbmNvbnN0IHNlcnZlckFQSSA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGFwaTtcblxuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghYXBpKSB7XG4gICAgICAgICAgICBhcGkgPSByZXF1aXJlKCcuLi9jbGllbnQtYXBpJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFwaTtcbiAgICB9XG59KSgpO1xuXG52YXIgdG1wID0ge1xuXG4gICAgc3RhcnRNaXNzaW9uKCl7XG4gICAgICAgIHNlcnZlckFQSSgpLnN0YXJ0TWlzc2lvbigpO1xuICAgIH0sXG5cbiAgICBzdG9wTWlzc2lvbigpe1xuICAgICAgICBzZXJ2ZXJBUEkoKS5zdG9wTWlzc2lvbigpO1xuICAgIH0sXG5cbiAgICByZXNldE1pc3Npb24oKXtcbiAgICAgICAgc2VydmVyQVBJKCkucmVzZXRNaXNzaW9uKCk7XG4gICAgfSxcblxuICAgIG1pc3Npb25TdGFydGVkKCkge1xuICAgICAgICBBcHBEaXNwYXRjaGVyLmRpc3BhdGNoKHthY3Rpb246IE1pc3Npb25Db25zdGFudHMuTUlTU0lPTl9TVEFSVEVEX0VWRU5UfSk7XG4gICAgfSxcblxuICAgIG1pc3Npb25TdG9wcGVkKCkge1xuICAgICAgICBBcHBEaXNwYXRjaGVyLmRpc3BhdGNoKHthY3Rpb246IE1pc3Npb25Db25zdGFudHMuTUlTU0lPTl9TVE9QUEVEX0VWRU5UfSk7XG4gICAgfSxcblxuICAgIG1pc3Npb25XYXNSZXNldCgpe1xuICAgICAgICBBcHBEaXNwYXRjaGVyLmRpc3BhdGNoKHthY3Rpb246IE1pc3Npb25Db25zdGFudHMuTUlTU0lPTl9XQVNfUkVTRVR9KTtcbiAgICAgICAgc2VydmVyQVBJKCkuYXNrRm9yQXBwU3RhdGUoKTtcbiAgICB9LFxuXG4gICAgbWlzc2lvbkNvbXBsZXRlZCgpIHtcbiAgICAgICAgQXBwRGlzcGF0Y2hlci5kaXNwYXRjaCh7YWN0aW9uOiBNaXNzaW9uQ29uc3RhbnRzLk1JU1NJT05fQ09NUExFVEVEX0VWRU5UfSk7XG4gICAgfSxcblxuICAgIHJlY2VpdmVkRXZlbnRzKGV2ZW50c0NvbGxlY3Rpb24pe1xuICAgICAgICBBcHBEaXNwYXRjaGVyLmRpc3BhdGNoKE9iamVjdC5hc3NpZ24oe30sIGV2ZW50c0NvbGxlY3Rpb24sIHthY3Rpb246IE1pc3Npb25Db25zdGFudHMuUkVDRUlWRURfRVZFTlRTfSkpO1xuICAgIH0sXG5cbiAgICBhc2tGb3JFdmVudHMoKXtcbiAgICAgICAgc2VydmVyQVBJKCkuYXNrRm9yRXZlbnRzKCk7XG4gICAgfSxcblxuICAgIGludHJvV2FzUmVhZCh0ZWFtSWQpIHtcbiAgICAgICAgQXBwRGlzcGF0Y2hlci5kaXNwYXRjaCh7YWN0aW9uOiBNaXNzaW9uQ29uc3RhbnRzLklOVFJPRFVDVElPTl9SRUFELCB0ZWFtTmFtZTogdGVhbUlkfSk7XG4gICAgICAgIHNlcnZlckFQSSgpLnNlbmRUZWFtU3RhdGVDaGFuZ2UodGVhbUlkKTtcbiAgICB9LFxuXG4gICAgc3RhcnRUYXNrKHRlYW1JZCwgdGFza0lkKXtcbiAgICAgICAgQXBwRGlzcGF0Y2hlci5kaXNwYXRjaCh7YWN0aW9uOiBNaXNzaW9uQ29uc3RhbnRzLlNUQVJUX1RBU0ssIHRlYW1JZCwgdGFza0lkfSk7XG4gICAgICAgIHNlcnZlckFQSSgpLnNlbmRUZWFtU3RhdGVDaGFuZ2UodGVhbUlkKTtcbiAgICB9LFxuXG4gICAgdGFza0NvbXBsZXRlZCh0ZWFtSWQsIHRhc2tJZCkgICB7XG4gICAgICAgIEFwcERpc3BhdGNoZXIuZGlzcGF0Y2goe2FjdGlvbjogTWlzc2lvbkNvbnN0YW50cy5DT01QTEVURURfVEFTSywgdGFza0lkLCB0ZWFtSWR9KTtcbiAgICAgICAgc2VydmVyQVBJKCkuc2VuZFRlYW1TdGF0ZUNoYW5nZSh0ZWFtSWQpO1xuICAgIH0sXG5cbiAgICBzZXRNaXNzaW9uVGltZShlbGFwc2VkU2Vjb25kcyl7XG4gICAgICAgIEFwcERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgICAgICAgYWN0aW9uOiBNaXNzaW9uQ29uc3RhbnRzLk1JU1NJT05fVElNRV9TWU5DLFxuICAgICAgICAgICAgZGF0YToge2VsYXBzZWRNaXNzaW9uVGltZTogZWxhcHNlZFNlY29uZHN9XG4gICAgICAgIH0pO1xuXG4gICAgfVxuXG59O1xuXG53aW5kb3cuX19NaXNzaW9uQUMgPSB0bXA7XG5tb2R1bGUuZXhwb3J0cyA9IHRtcDtcbiIsImNvbnN0IEFwcERpc3BhdGNoZXIgPSByZXF1aXJlKCcuLi9hcHBkaXNwYXRjaGVyJyk7XG5jb25zdCBSYWRpYXRpb25TdG9yZSA9IHJlcXVpcmUoJy4vLi4vc3RvcmVzL3JhZGlhdGlvbi1zdG9yZScpO1xuY29uc3QgU2NpZW5jZVRlYW1Db25zdGFudHMgPSByZXF1aXJlKCcuLi9jb25zdGFudHMvU2NpZW5jZVRlYW1Db25zdGFudHMnKTtcbmNvbnN0IE1pc3Npb25Db25zdGFudHMgPSByZXF1aXJlKCcuLi9jb25zdGFudHMvTWlzc2lvbkNvbnN0YW50cycpO1xuY29uc3QgTWVzc2FnZUFjdGlvbnNDcmVhdG9ycyA9IHJlcXVpcmUoJy4vTWVzc2FnZUFjdGlvbkNyZWF0b3JzJyk7XG5jb25zdCBUaW1lckFjdGlvbkNyZWF0b3JzID0gcmVxdWlyZSgnLi4vYWN0aW9ucy9UaW1lckFjdGlvbkNyZWF0b3JzJyk7XG5jb25zdCBhcGkgPSByZXF1aXJlKCcuLi9jbGllbnQtYXBpJyk7XG5cbnZhciBtaXNzaW9uQWN0aW9uQ3JlYXRvcnMgPSAoZnVuY3Rpb24oKSB7XG4gICAgdmFyIHRtcDtcblxuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghdG1wKSB0bXAgPSByZXF1aXJlKCcuLi9hY3Rpb25zL01pc3Npb25BY3Rpb25DcmVhdG9ycycpO1xuICAgICAgICByZXR1cm4gdG1wO1xuICAgIH1cbn0pKCk7XG5cblxuY29uc3QgYWN0aW9ucyA9IHtcblxuICAgIHN0YXJ0U2FtcGxlVGFzaygpe1xuICAgICAgICBBcHBEaXNwYXRjaGVyLmRpc3BhdGNoKHthY3Rpb246IFNjaWVuY2VUZWFtQ29uc3RhbnRzLlNDSUVOQ0VfQ0xFQVJfUkFESUFUSU9OX1NBTVBMRVN9KTtcbiAgICAgICAgbWlzc2lvbkFjdGlvbkNyZWF0b3JzKCkuc3RhcnRUYXNrKCdzY2llbmNlJywgJ3NhbXBsZScpO1xuICAgICAgICB0aGlzLnJlc2V0U2FtcGxpbmdUaW1lcigpO1xuICAgIH0sXG5cbiAgICBjb21wbGV0ZVRhc2sodGFza0lkKXtcbiAgICAgICAgbWlzc2lvbkFjdGlvbkNyZWF0b3JzKCkudGFza0NvbXBsZXRlZCgnc2NpZW5jZScsIHRhc2tJZCk7XG4gICAgfSxcblxuICAgIHJlc2V0U2FtcGxpbmdUaW1lcigpIHtcbiAgICAgICAgVGltZXJBY3Rpb25DcmVhdG9ycy5yZXNldFRpbWVyKFNjaWVuY2VUZWFtQ29uc3RhbnRzLlNDSUVOQ0VfVElNRVJfMSk7XG4gICAgfSxcblxuICAgIHRha2VSYWRpYXRpb25TYW1wbGUoKSB7XG4gICAgICAgIEFwcERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgICAgICAgYWN0aW9uOiBTY2llbmNlVGVhbUNvbnN0YW50cy5TQ0lFTkNFX1RBS0VfUkFESUFUSU9OX1NBTVBMRVxuICAgICAgICB9KVxuICAgIH0sXG5cbiAgICBhdmVyYWdlUmFkaWF0aW9uQ2FsY3VsYXRlZChhdmVyYWdlKXtcbiAgICAgICAgbGV0IHNhbXBsZXMgPSBSYWRpYXRpb25TdG9yZS5nZXRTYW1wbGVzKCk7XG5cbiAgICAgICAgaWYgKHNhbXBsZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICBsZXQgc3VtID0gc2FtcGxlcy5yZWR1Y2UoKHByZXYsIGN1cnJlbnQpID0+IHByZXYgKyBjdXJyZW50LCAwKSxcbiAgICAgICAgICAgICAgICB0cnVlQ2FsY3VsYXRlZEF2ZXJhZ2UgPSBzdW0gLyBzYW1wbGVzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICBkaWZmSW5QZXJjZW50ID0gMTAwICogTWF0aC5hYnMoKHRydWVDYWxjdWxhdGVkQXZlcmFnZSAtIGF2ZXJhZ2UpIC8gdHJ1ZUNhbGN1bGF0ZWRBdmVyYWdlKTtcblxuICAgICAgICAgICAgaWYgKGRpZmZJblBlcmNlbnQgPiAxNSkge1xuICAgICAgICAgICAgICAgIE1lc3NhZ2VBY3Rpb25zQ3JlYXRvcnMuYWRkVHJhbnNpZW50TWVzc2FnZSh7dGV4dDogJ011bGlnIGRldCBnamVubm9tc25pdHRldCBibGUgbGl0dCBmZWlsLid9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG5cbiAgICAgICAgQXBwRGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICAgICAgICBhY3Rpb246IFNjaWVuY2VUZWFtQ29uc3RhbnRzLlNDSUVOQ0VfQVZHX1JBRElBVElPTl9DQUxDVUxBVEVELFxuICAgICAgICAgICAgZGF0YToge2F2ZXJhZ2V9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChhdmVyYWdlID4gU2NpZW5jZVRlYW1Db25zdGFudHMuU0NJRU5DRV9BVkdfUkFEX1JFRF9USFJFU0hPTEQpIHtcbiAgICAgICAgICAgIE1lc3NhZ2VBY3Rpb25zQ3JlYXRvcnMuYWRkVHJhbnNpZW50TWVzc2FnZSh7XG4gICAgICAgICAgICAgICAgdGV4dDogJ1ZlbGRpZyBow7h5dCByYWRpb2FrdGl2dCBuaXbDpSBkZXRla3RlcnQuIFZhcnNsZSBzaWtrZXJoZXRzdGVhbWV0IHVtaWRkZWxiYXJ0IScsXG4gICAgICAgICAgICAgICAgbGV2ZWw6ICdkYW5nZXInLFxuICAgICAgICAgICAgICAgIGlkOiBTY2llbmNlVGVhbUNvbnN0YW50cy5TQ0lFTkNFX1JBRElBVElPTl9XQVJOSU5HX01TR1xuICAgICAgICAgICAgfSwgMzApO1xuICAgICAgICB9IGVsc2UgaWYgKGF2ZXJhZ2UgPiBTY2llbmNlVGVhbUNvbnN0YW50cy5TQ0lFTkNFX0FWR19SQURfT1JBTkdFX1RIUkVTSE9MRCkge1xuICAgICAgICAgICAgTWVzc2FnZUFjdGlvbnNDcmVhdG9ycy5hZGRUcmFuc2llbnRNZXNzYWdlKHtcbiAgICAgICAgICAgICAgICB0ZXh0OiAnSMO4eWUgdmVyZGllciBhdiByYWRpb2FrdGl2aXRldC4gRsO4bGcgbWVkIHDDpSBvbSBkZXQgZ8OlciBuZWRvdmVyIGlnamVuJyxcbiAgICAgICAgICAgICAgICBsZXZlbDogJ3dhcm5pbmcnLFxuICAgICAgICAgICAgICAgIGlkOiBTY2llbmNlVGVhbUNvbnN0YW50cy5TQ0lFTkNFX1JBRElBVElPTl9XQVJOSU5HX01TR1xuICAgICAgICAgICAgfSwgMTApO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jb21wbGV0ZVRhc2soJ2F2ZXJhZ2UnKTtcbiAgICB9LFxuXG5cbiAgICAvKipcbiAgICAgKiBTZXQgdGhlIHJhZGlhdGlvbiBsZXZlbCB0aGF0IHdpbGwgYmUgcmVwb3J0ZWQgdG8gdGhlIHZpZXcgbGF5ZXJcbiAgICAgKiBUaGUgcmVwb3J0ZWQgcmFkaWF0aW9uIHdpbGwgZ2VuZXJhdGVkIHZhbHVlcyBpbiB0aGUgcmFuZ2UgZ2l2ZW4gYnkgdGhlIHBhcmFtZXRlcnNcbiAgICAgKlxuICAgICAqIFdlIGFyZSBub3QgYWN0dWFsbHkgcmVjZWl2aW5nIGEgc3RyZWFtIG9mIHZhbHVlcyBmcm9tIHRoZSBzZXJ2ZXIsIGFzIHRoYXQgY291bGRcbiAgICAgKiBiZSB2ZXJ5IHJlc291cmNlIGhlYXZ5LiBJbnN0ZWFkIHdlIGdlbmVyYXRlIHJhbmRvbSB2YWx1ZXMgYmV0d2VlbiB0aGUgZ2l2ZW4gdmFsdWVzLFxuICAgICAqIHdoaWNoIHRvIHRoZSB1c2VyIHdpbGwgbG9vayB0aGUgc2FtZS5cbiAgICAgKiBAcGFyYW0gbWluXG4gICAgICogQHBhcmFtIG1heFxuICAgICAqL1xuICAgICAgICBzZXRSYWRpYXRpb25MZXZlbChtaW4sIG1heCkge1xuICAgICAgICBBcHBEaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgICAgICAgIGFjdGlvbjogU2NpZW5jZVRlYW1Db25zdGFudHMuU0NJRU5DRV9SQURJQVRJT05fTEVWRUxfQ0hBTkdFRCxcbiAgICAgICAgICAgIGRhdGE6IHttaW4sIG1heH1cbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGFkZFRvVG90YWxSYWRpYXRpb25MZXZlbChhbW91bnQpe1xuXG4gICAgICAgIHZhciB0b3RhbCA9IGFtb3VudCArIFJhZGlhdGlvblN0b3JlLmdldFRvdGFsTGV2ZWwoKTtcblxuICAgICAgICBpZiAodG90YWwgPiBTY2llbmNlVGVhbUNvbnN0YW50cy5TQ0lFTkNFX1RPVEFMX1JBRElBVElPTl9WRVJZX1NFUklPVVNfVEhSRVNIT0xEKSB7XG4gICAgICAgICAgICBNZXNzYWdlQWN0aW9uc0NyZWF0b3JzLmFkZFRyYW5zaWVudE1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgIGlkOiAnc2NpZW5jZV9oaWdoX3JhZGlhdGlvbl9sZXZlbCcsXG4gICAgICAgICAgICAgICAgdGV4dDogJ0ZhcmV0cnVlbmRlIGjDuHl0IHN0csOlbGluZ3NuaXbDpSEnLFxuICAgICAgICAgICAgICAgIGxldmVsOiAnZGFuZ2VyJ1xuICAgICAgICAgICAgfSwgMzApO1xuICAgICAgICB9IGVsc2UgaWYgKHRvdGFsID4gU2NpZW5jZVRlYW1Db25zdGFudHMuU0NJRU5DRV9UT1RBTF9SQURJQVRJT05fU0VSSU9VU19USFJFU0hPTEQpIHtcbiAgICAgICAgICAgIE1lc3NhZ2VBY3Rpb25zQ3JlYXRvcnMuYWRkVHJhbnNpZW50TWVzc2FnZSh7XG4gICAgICAgICAgICAgICAgaWQ6ICdzY2llbmNlX2hpZ2hfcmFkaWF0aW9uX2xldmVsJyxcbiAgICAgICAgICAgICAgICB0ZXh0OiAnSMO4eXQgc3Ryw6VsaW5nc25pdsOlIScsXG4gICAgICAgICAgICAgICAgbGV2ZWw6ICd3YXJuaW5nJ1xuICAgICAgICAgICAgfSwgMzApO1xuICAgICAgICB9XG5cbiAgICAgICAgQXBwRGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICAgICAgICBhY3Rpb246IFNjaWVuY2VUZWFtQ29uc3RhbnRzLlNDSUVOQ0VfVE9UQUxfUkFESUFUSU9OX0xFVkVMX0NIQU5HRUQsXG4gICAgICAgICAgICBkYXRhOiB7dG90YWwsIGFkZGVkOiBhbW91bnR9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuY29tcGxldGVUYXNrKCdhZGR0b3RhbCcpO1xuICAgIH0sXG5cbiAgICAvKiBPbiByZWNlaXZpbmcgbmV3IHN0YXRlIGZyb20gdGhlIHNlcnZlciAqL1xuICAgIHRlYW1TdGF0ZVJlY2VpdmVkKHN0YXRlKXtcbiAgICAgICAgaWYgKCFzdGF0ZSkgcmV0dXJuO1xuXG4gICAgICAgIHZhciB0ZWFtSWQgPSAnc2NpZW5jZSc7XG5cbiAgICAgICAgaWYgKHN0YXRlLmludHJvZHVjdGlvbl9yZWFkKSB7XG4gICAgICAgICAgICBBcHBEaXNwYXRjaGVyLmRpc3BhdGNoKHthY3Rpb246IE1pc3Npb25Db25zdGFudHMuSU5UUk9EVUNUSU9OX1JFQUQsIHRlYW1OYW1lOiB0ZWFtSWR9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIEFwcERpc3BhdGNoZXIuZGlzcGF0Y2goe2FjdGlvbjogTWlzc2lvbkNvbnN0YW50cy5TVEFSVF9UQVNLLCB0ZWFtSWQsIHRhc2tJZDogc3RhdGUuY3VycmVudF90YXNrfSk7XG4gICAgfVxufTtcblxud2luZG93Ll9fU2NpZW5jZUFjdGlvbnMgPSBhY3Rpb25zO1xubW9kdWxlLmV4cG9ydHMgPSBhY3Rpb25zOyIsImNvbnN0IEFwcERpc3BhdGNoZXIgPSByZXF1aXJlKCcuLi9hcHBkaXNwYXRjaGVyJyk7XG5jb25zdCBjb25zdGFudHMgPSByZXF1aXJlKCcuLi9jb25zdGFudHMvVGltZXJDb25zdGFudHMnKTtcblxuY29uc3QgYWN0aW9ucyA9IHtcblxuICAgIHN0YXJ0VGltZXIoaWQpIHtcbiAgICAgICAgQXBwRGlzcGF0Y2hlci5kaXNwYXRjaCh7YWN0aW9uOiBjb25zdGFudHMuU1RBUlRfVElNRVIsIGRhdGE6IHt0aW1lcklkOiBpZH19KTtcbiAgICB9LFxuXG4gICAgcmVzZXRUaW1lcihpZCkge1xuICAgICAgICBBcHBEaXNwYXRjaGVyLmRpc3BhdGNoKHthY3Rpb246IGNvbnN0YW50cy5SRVNFVF9USU1FUiwgZGF0YToge3RpbWVySWQ6IGlkfX0pO1xuICAgIH0sXG5cbiAgICBzdG9wVGltZXIoaWQpIHtcbiAgICAgICAgQXBwRGlzcGF0Y2hlci5kaXNwYXRjaCh7YWN0aW9uOiBjb25zdGFudHMuU1RPUF9USU1FUiwgZGF0YToge3RpbWVySWQ6IGlkfX0pO1xuICAgIH0sXG5cbiAgICBzZXRUaW1lcih0aW1lcklkLCB0aW1lKSB7XG4gICAgICAgIEFwcERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgICAgICAgYWN0aW9uOiBjb25zdGFudHMuU0VUX1RJTUVSLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIHJlbWFpbmluZ1RpbWU6IHRpbWUsXG4gICAgICAgICAgICAgICAgdGltZXJJZFxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gYWN0aW9uczsiLCIvKlxuICogRGlzcGF0Y2hlciAtIGEgc2luZ2xldG9uXG4gKlxuICogVGhpcyBpcyBlc3NlbnRpYWxseSB0aGUgbWFpbiBkcml2ZXIgaW4gdGhlIEZsdXggYXJjaGl0ZWN0dXJlXG4gKiBAc2VlIGh0dHA6Ly9mYWNlYm9vay5naXRodWIuaW8vZmx1eC9kb2NzL292ZXJ2aWV3Lmh0bWxcbiovXG5cbmNvbnN0IHsgRGlzcGF0Y2hlciB9ID0gcmVxdWlyZSgnZmx1eCcpO1xuXG5jb25zdCBBcHBEaXNwYXRjaGVyID0gT2JqZWN0LmFzc2lnbihuZXcgRGlzcGF0Y2hlcigpLCB7XG5cbiAgICAvLyBvcHRpb25hbCBtZXRob2RzXG5cbn0pO1xuXG53aW5kb3cuX19BcHBEaXNwYXRjaGVyPSBBcHBEaXNwYXRjaGVyO1xubW9kdWxlLmV4cG9ydHMgPSBBcHBEaXNwYXRjaGVyOyIsImNvbnN0IEFwcERpc3BhdGNoZXIgPSByZXF1aXJlKCcuL2FwcGRpc3BhdGNoZXInKTtcbmNvbnN0IGlvID0gcmVxdWlyZSgnc29ja2V0LmlvJyk7XG5jb25zdCBzb2NrZXQgPSBpbygpO1xuY29uc3QgTWlzc2lvbkNvbnN0YW50cyA9IHJlcXVpcmUoJy4vY29uc3RhbnRzL01pc3Npb25Db25zdGFudHMnKTtcbmNvbnN0IE1pc3Npb25BY3Rpb25DcmVhdG9ycyA9IHJlcXVpcmUoJy4vYWN0aW9ucy9NaXNzaW9uQWN0aW9uQ3JlYXRvcnMnKTtcbmNvbnN0IE1lc3NhZ2VBY3Rpb25DcmVhdG9ycyA9IHJlcXVpcmUoJy4vYWN0aW9ucy9NZXNzYWdlQWN0aW9uQ3JlYXRvcnMnKTtcbmNvbnN0IFNjaWVuY2VUZWFtQWN0aW9uQ3JlYXRvcnMgPSByZXF1aXJlKCcuL2FjdGlvbnMvU2NpZW5jZUFjdGlvbkNyZWF0b3JzJyk7XG5jb25zdCBSYWRpYXRpb25TdG9yZSA9IHJlcXVpcmUoJy4vc3RvcmVzL3JhZGlhdGlvbi1zdG9yZScpO1xuY29uc3QgVGltZXJTdG9yZSA9IHJlcXVpcmUoJy4vc3RvcmVzL3RpbWVyLXN0b3JlJyk7XG5jb25zdCBJbnRyb2R1Y3Rpb25TdG9yZSA9IHJlcXVpcmUoJy4vc3RvcmVzL2ludHJvZHVjdGlvbi1zdG9yZScpO1xuY29uc3QgUm91dGVyID0gcmVxdWlyZSgnLi9yb3V0ZXItY29udGFpbmVyJyk7XG5jb25zdCBFdmVudENvbnN0YW50cyA9IHJlcXVpcmUoJy4uL3NlcnZlci9FdmVudENvbnN0YW50cycpO1xuXG52YXIgYXBpID0ge1xuXG4gICAgc2V0dXAoKSB7XG5cbiAgICAgICAgc29ja2V0Lm9uKCdjb25uZWN0JywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJDb25uZWN0ZWQgdG8gc2VydmVyIFdlYlNvY2tldFwiKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQXNraW5nIHNlcnZlciBmb3IgYXBwIHN0YXRlXCIpO1xuICAgICAgICAgICAgYXBpLmFza0ZvckFwcFN0YXRlKCk7XG4gICAgICAgICAgICBNZXNzYWdlQWN0aW9uQ3JlYXRvcnMucmVtb3ZlTWVzc2FnZSgnZGlzY29ubmVjdCBtZXNzYWdlJyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHNvY2tldC5vbignZGlzY29ubmVjdCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIE1lc3NhZ2VBY3Rpb25DcmVhdG9ycy5hZGRNZXNzYWdlKHtcbiAgICAgICAgICAgICAgICBpZDogJ2Rpc2Nvbm5lY3QgbWVzc2FnZScsXG4gICAgICAgICAgICAgICAgdGV4dDogJ01pc3RldCBrb250YWt0IG1lZCBzZXJ2ZXJlbi4gTGFzdCBzaWRlbiBww6Ugbnl0dCcsXG4gICAgICAgICAgICAgICAgbGV2ZWw6ICdkYW5nZXInXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgc29ja2V0Lm9uKEV2ZW50Q29uc3RhbnRzLk1JU1NJT05fU1RBUlRFRCwgKCkgPT4gTWlzc2lvbkFjdGlvbkNyZWF0b3JzLm1pc3Npb25TdGFydGVkKCkpO1xuICAgICAgICBzb2NrZXQub24oRXZlbnRDb25zdGFudHMuTUlTU0lPTl9TVE9QUEVELCAoKSA9PiBNaXNzaW9uQWN0aW9uQ3JlYXRvcnMubWlzc2lvblN0b3BwZWQoKSk7XG4gICAgICAgIHNvY2tldC5vbihFdmVudENvbnN0YW50cy5NSVNTSU9OX0NPTVBMRVRFRCwgKCk9PiBNaXNzaW9uQWN0aW9uQ3JlYXRvcnMubWlzc2lvbkNvbXBsZXRlZCgpKTtcbiAgICAgICAgc29ja2V0Lm9uKEV2ZW50Q29uc3RhbnRzLk1JU1NJT05fUkVTRVQsICgpPT4gTWlzc2lvbkFjdGlvbkNyZWF0b3JzLm1pc3Npb25XYXNSZXNldCgpKTtcblxuICAgICAgICBzb2NrZXQub24oRXZlbnRDb25zdGFudHMuU0VUX0VWRU5UUywgTWlzc2lvbkFjdGlvbkNyZWF0b3JzLnJlY2VpdmVkRXZlbnRzKTtcbiAgICAgICAgc29ja2V0Lm9uKEV2ZW50Q29uc3RhbnRzLkFERF9NRVNTQUdFLCAoc2VydmVyTXNnKSA9PiB7XG4gICAgICAgICAgICBpZihzZXJ2ZXJNc2cuYXVkaWVuY2UgJiYgc2VydmVyTXNnLmF1ZGllbmNlICE9PSBSb3V0ZXIuZ2V0VGVhbUlkKCkpIHJldHVybjtcblxuICAgICAgICAgICAgTWVzc2FnZUFjdGlvbkNyZWF0b3JzLmFkZE1lc3NhZ2Uoc2VydmVyTXNnKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgc29ja2V0Lm9uKCdtaXNzaW9uIHRpbWUnLCBNaXNzaW9uQWN0aW9uQ3JlYXRvcnMuc2V0TWlzc2lvblRpbWUpO1xuXG4gICAgICAgIHNvY2tldC5vbignYXBwIHN0YXRlJywgKHN0YXRlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLl9hcHBTdGF0ZVJlY2VpdmVkKHN0YXRlKTtcbiAgICAgICAgfSk7XG5cbiAgICB9LFxuXG4gICAgc3RhcnRNaXNzaW9uKCl7XG4gICAgICAgIHNvY2tldC5lbWl0KCdzdGFydCBtaXNzaW9uJyk7XG4gICAgfSxcblxuICAgIHN0b3BNaXNzaW9uKCl7XG4gICAgICAgIHNvY2tldC5lbWl0KCdzdG9wIG1pc3Npb24nKTtcbiAgICB9LFxuXG4gICAgcmVzZXRNaXNzaW9uKCl7XG4gICAgICAgIHNvY2tldC5lbWl0KCdyZXNldCBtaXNzaW9uJyk7XG4gICAgfSxcblxuICAgIC8qXG4gICAgICogU2VuZCBmdWxsIGFwcCBoZWxkIHN0YXRlIChmb3IgdGhlIGN1cnJlbnQgdGVhbSkgdG8gc2VydmVyIG9uIGNoYW5nZVxuICAgICAqIFRoZSBtb3N0IGltcG9ydGFudCBiaXRzIGFyZSBoZWxkIG9uIHNlcnZlciwgYW5kIGlzIG5vdCB0cmFuc2ZlcnJlZCBiYWNrLFxuICAgICAqIHN1Y2ggYXMgaWYgdGhlIG1pc3Npb24gaXMgcnVubmluZywgdGhlIGN1cnJlbnQgY2hhcHRlciwgZXRjLlxuICAgICAqIEJFV0FSRTogT05MWSBVU0lORyBMT0NBTCBTVE9SQUdFIFVOVElMIFNFUlZFUiBDT01NVU5JQ0FUSU9OIElTIFVQIEFORCBSVU5OSU5HXG4gICAgICovXG4gICAgc2VuZFRlYW1TdGF0ZUNoYW5nZSh0ZWFtSWQpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1RPRE86IFNlcnZlckFjdGlvbkNyZWF0b3JzLnNlbmRUZWFtU3RhdGVDaGFuZ2UnKTtcbiAgICAgICAgbGV0IHN0YXRlID0ge307XG5cbiAgICAgICAgc3RhdGUudGVhbSA9IHRlYW1JZDtcbiAgICAgICAgc3RhdGUuaW50cm9kdWN0aW9uX3JlYWQgPSBJbnRyb2R1Y3Rpb25TdG9yZS5pc0ludHJvZHVjdGlvblJlYWQodGVhbUlkKTtcbiAgICAgICAgc3RhdGUuY3VycmVudF90YXNrID0gUm91dGVyLmdldFRhc2tJZCgpO1xuXG4gICAgICAgIC8vIFRPRE86IGZhY3RvciBvdXQgdGVhbSBzcGVjaWZpYyBzdGF0ZSBsb2dpYyBpbnRvIHVuaXQgb2YgaXRzIG93blxuICAgICAgICBpZiAodGVhbUlkID09PSAnc2NpZW5jZScpIHtcbiAgICAgICAgICAgIHN0YXRlLnJhZGlhdGlvbiA9IFJhZGlhdGlvblN0b3JlLmdldFN0YXRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBzb2NrZXQuZW1pdCgnc2V0IHRlYW0gc3RhdGUnLCBzdGF0ZSk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdzZW5kaW5nIHNjaWVuY2Ugc3RhdGUgdG8gc2VydmVyJywgc3RhdGUpO1xuICAgIH0sXG5cbiAgICAvKlxuICAgICAqIFRoaXMgaXMgb25seSBzdHViYmVkIG91dCB1bnRpbCBzZXJ2ZXIgY29tbXVuaWNhdGlvbiBpcyB1cCBhbmQgcnVubmluZ1xuICAgICAqL1xuICAgIGFza0ZvckFwcFN0YXRlKCkge1xuICAgICAgICBzb2NrZXQuZW1pdCgnZ2V0IGFwcCBzdGF0ZScpO1xuICAgIH0sXG5cbiAgICBhc2tGb3JNaXNzaW9uVGltZSgpe1xuICAgICAgICBzb2NrZXQuZW1pdCgnZ2V0IG1pc3Npb24gdGltZScpO1xuICAgIH0sXG5cbiAgICBfYXBwU3RhdGVSZWNlaXZlZChhcHBTdGF0ZSkge1xuICAgICAgICBBcHBEaXNwYXRjaGVyLmRpc3BhdGNoKHthY3Rpb246IE1pc3Npb25Db25zdGFudHMuUkVDRUlWRURfQVBQX1NUQVRFLCBhcHBTdGF0ZX0pO1xuICAgICAgICBNaXNzaW9uQWN0aW9uQ3JlYXRvcnMuc2V0TWlzc2lvblRpbWUoYXBwU3RhdGUuZWxhcHNlZF9taXNzaW9uX3RpbWUpO1xuICAgICAgICBTY2llbmNlVGVhbUFjdGlvbkNyZWF0b3JzLnRlYW1TdGF0ZVJlY2VpdmVkKGFwcFN0YXRlLnNjaWVuY2UpO1xuICAgIH0sXG5cbiAgICBhc2tGb3JFdmVudHMoKXtcbiAgICAgICAgc29ja2V0LmVtaXQoRXZlbnRDb25zdGFudHMuR0VUX0VWRU5UUyk7XG4gICAgfVxuXG59O1xuXG53aW5kb3cuX19hcGkgPSBhcGk7XG5tb2R1bGUuZXhwb3J0cyA9IGFwaTtcbiIsIi8qIFNjcmlwdCB0byBib290c3RyYXAgdGhlIGFwcGxpY2F0aW9uICovXG5cbnZhciBNaXNzaW9uQWN0aW9uQ3JlYXRvcnMgPSByZXF1aXJlKCcuL2FjdGlvbnMvTWlzc2lvbkFjdGlvbkNyZWF0b3JzJyksXG4gICAgTWVzc2FnZUFjdGlvbkNyZWF0b3JzID0gcmVxdWlyZSgnLi9hY3Rpb25zL01lc3NhZ2VBY3Rpb25DcmVhdG9ycycpLFxuICAgIFNjaWVuY2VBY3Rpb25DcmVhdG9ycyA9IHJlcXVpcmUoJy4vYWN0aW9ucy9TY2llbmNlQWN0aW9uQ3JlYXRvcnMnKSxcbiAgICBTY2llbmNlQ29uc3RhbnRzID0gcmVxdWlyZSgnLi9jb25zdGFudHMvU2NpZW5jZVRlYW1Db25zdGFudHMnKSxcbiAgICBUaW1lckFjdGlvbkNyZWF0b3JzID0gcmVxdWlyZSgnLi9hY3Rpb25zL1RpbWVyQWN0aW9uQ3JlYXRvcnMnKSxcbiAgICBBcHBEaXNwYXRjaGVyID0gcmVxdWlyZSgnLi9hcHBkaXNwYXRjaGVyJyk7XG5cbkFwcERpc3BhdGNoZXIucmVnaXN0ZXIoKHBheWxvYWQpPT4ge1xuICAgIGNvbnNvbGUubG9nKCdERUJVRyBBcHBEaXNwYXRjaGVyLmRpc3BhdGNoJywgcGF5bG9hZCk7XG59KTtcblxuZnVuY3Rpb24gcnVuKCkge1xuXG5cbiAgICAvLyBkdW1teSB1bnRpbCB3ZSBoYXZlIGludGVncmF0aW9uIHdpdGggd2Vic29ja2V0c1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBNaXNzaW9uQWN0aW9uQ3JlYXRvcnMuc3RhcnRNaXNzaW9uKCk7XG4gICAgfSwgMzAwKTtcblxuICAgIC8vIHBsYXkgd2l0aCByYWRpYXRpb25cbiAgICBUaW1lckFjdGlvbkNyZWF0b3JzLnNldFRpbWVyKFNjaWVuY2VDb25zdGFudHMuU0NJRU5DRV9USU1FUl8xLCAzMCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge3J1bn07IiwiY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuY29uc3QgUm91dGVyID0gcmVxdWlyZSgncmVhY3Qtcm91dGVyJyk7XG5cbmNvbnN0IFJvdXRlSGFuZGxlciA9IFJvdXRlci5Sb3V0ZUhhbmRsZXI7XG5cbmNvbnN0IEhlYWRlciA9IHJlcXVpcmUoJy4vaGVhZGVyLnJlYWN0Jyk7XG5cbmNvbnN0IE1lc3NhZ2VMaXN0ID0gcmVxdWlyZSgnLi9tZXNzYWdlLWxpc3QucmVhY3QnKTtcbmNvbnN0IE1pc3Npb25TdGF0ZVN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL21pc3Npb24tc3RhdGUtc3RvcmUnKTtcblxuY29uc3QgQXBwID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgbWl4aW5zOiBbXSxcblxuICAgIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHtpc01pc3Npb25SdW5uaW5nOiBNaXNzaW9uU3RhdGVTdG9yZS5pc01pc3Npb25SdW5uaW5nKCl9O1xuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsTW91bnQoKSB7XG4gICAgICAgIE1pc3Npb25TdGF0ZVN0b3JlLmFkZENoYW5nZUxpc3RlbmVyKHRoaXMuX2hhbmRsZU1pc3Npb25TdGF0ZUNoYW5nZSk7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50KCl7XG4gICAgICAgIGNvbnNvbGUubG9nKCdBcHAuY29tcG9uZW50RGlkTW91bnQnKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIE1pc3Npb25TdGF0ZVN0b3JlLnJlbW92ZUNoYW5nZUxpc3RlbmVyKHRoaXMuX2hhbmRsZU1pc3Npb25TdGF0ZUNoYW5nZSk7XG4gICAgfSxcblxuICAgIF9oYW5kbGVNaXNzaW9uU3RhdGVDaGFuZ2UoKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2lzTWlzc2lvblJ1bm5pbmc6IE1pc3Npb25TdGF0ZVN0b3JlLmlzTWlzc2lvblJ1bm5pbmcoKX0pO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J2NvbnRhaW5lcic+XG5cbiAgICAgICAgICAgICAgICA8SGVhZGVyLz5cblxuICAgICAgICAgICAgICAgIHsvKiB0aGlzIGlzIHRoZSBpbXBvcnRhbnQgcGFydCAqL31cbiAgICAgICAgICAgICAgICA8Um91dGVIYW5kbGVyIHsuLi50aGlzLnByb3BzfSB7Li4udGhpcy5zdGF0ZX0gLz5cblxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicm93XCI+XG4gICAgICAgICAgICAgICAgICAgIDxmb290ZXIgaWQ9J21haW4tZm9vdGVyJz48L2Zvb3Rlcj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcDsiLCJjb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5jb25zdCBNaXNzaW9uU3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZXMvbWlzc2lvbi1zdGF0ZS1zdG9yZScpO1xuY29uc3QgTWlzc2lvblRpbWVyID0gcmVxdWlyZSgnLi9taXNzaW9uLXRpbWVyLnJlYWN0Jyk7XG5jb25zdCBFdmVudFN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL2V2ZW50LXN0b3JlJyk7XG5jb25zdCB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5jb25zdCBnZXRNaXNzaW9uQUMgPSAoZnVuY3Rpb24gKCkge1xuICAgIGxldCB0bXAgPSBudWxsO1xuICAgIHJldHVybiAoKT0+IHtcbiAgICAgICAgaWYgKCF0bXApIHRtcCA9IHJlcXVpcmUoJy4uL2FjdGlvbnMvTWlzc2lvbkFjdGlvbkNyZWF0b3JzJyk7XG4gICAgICAgIHJldHVybiB0bXA7XG4gICAgfVxufSkoKTtcblxudmFyIEFwcCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIGNvbXBvbmVudFdpbGxNb3VudCgpe1xuICAgICAgICB2YXIgYWMgPSBnZXRNaXNzaW9uQUMoKTtcbiAgICAgICAgYWMuYXNrRm9yRXZlbnRzKCk7XG5cbiAgICAgICAgRXZlbnRTdG9yZS5hZGRDaGFuZ2VMaXN0ZW5lcih0aGlzLl9vbkNoYW5nZSk7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCl7XG4gICAgICAgIEV2ZW50U3RvcmUucmVtb3ZlQ2hhbmdlTGlzdGVuZXIodGhpcy5fb25DaGFuZ2UpO1xuICAgIH0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjb21wbGV0ZWRFdmVudHM6IFtdLFxuICAgICAgICAgICAgb3ZlcmR1ZUV2ZW50czogW10sXG4gICAgICAgICAgICByZW1haW5pbmdFdmVudHM6IFtdXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgX29uQ2hhbmdlKCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGNvbXBsZXRlZEV2ZW50czogRXZlbnRTdG9yZS5jb21wbGV0ZWQoKSxcbiAgICAgICAgICAgIG92ZXJkdWVFdmVudHM6IEV2ZW50U3RvcmUub3ZlcmR1ZSgpLFxuICAgICAgICAgICAgcmVtYWluaW5nRXZlbnRzOiBFdmVudFN0b3JlLnJlbWFpbmluZygpXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zb2xlLmxvZygnX29uQ2hhbmdlJywgdGhpcy5zdGF0ZSlcbiAgICB9LFxuXG4gICAgcmVuZGVyKCkge1xuXG4gICAgICAgIC8vIHB1dCBpdCBoZXJlIGR1ZSB0byBjaXJjdWxhciBkZXBlbmRlbmNpZXNcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdj5cblxuICAgICAgICAgICAgICAgIHsgTWlzc2lvblN0b3JlLmlzTWlzc2lvblJ1bm5pbmcoKSA/IDxNaXNzaW9uVGltZXIgLz4gOlxuICAgICAgICAgICAgICAgICAgICA8cCBpZD1cIm1pc3Npb25UaW1lXCI+T3BwZHJhZ2V0IGhhciBpa2tlIHN0YXJ0ZXQ8L3A+IH1cblxuICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17Z2V0TWlzc2lvbkFDKCkuc3RhcnRNaXNzaW9ufT5TdGFydCBvcHBkcmFnPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17Z2V0TWlzc2lvbkFDKCkuc3RvcE1pc3Npb259PlN0b3A8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXtnZXRNaXNzaW9uQUMoKS5yZXNldE1pc3Npb259PkJlZ3lubiBww6Ugbnl0dDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBrZXk9XCJtaXNzaW9uQ29tcGxldGVkXCIgY2xhc3NOYW1lPVwiZGlzYWJsZWRcIj5PcHBkcmFnIHV0ZsO4cnQ8L2J1dHRvbj5cblxuXG4gICAgICAgICAgICAgICAgPGgzPnJlbWFpbmluZzwvaDM+XG4gICAgICAgICAgICAgICAgPHVsPlxuICAgICAgICAgICAgICAgICAgICB7dGhpcy5zdGF0ZS5yZW1haW5pbmdFdmVudHMubWFwKChldikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDxsaT57ZXYudHJpZ2dlclRpbWV9IHtldi5zaG9ydF9kZXNjcmlwdGlvbn0ge2V2LnZhbHVlfTwvbGk+XG4gICAgICAgICAgICAgICAgICAgIH0pfVxuICAgICAgICAgICAgICAgIDwvdWw+XG5cbiAgICAgICAgICAgICAgICA8aDM+b3ZlcmR1ZTwvaDM+XG4gICAgICAgICAgICAgICAgPHVsPlxuICAgICAgICAgICAgICAgICAgICB7dGhpcy5zdGF0ZS5vdmVyZHVlRXZlbnRzLm1hcCgoZXYpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiA8bGk+e2V2LnRyaWdnZXJUaW1lfSB7ZXYuc2hvcnRfZGVzY3JpcHRpb259IHtldi52YWx1ZX08L2xpPlxuICAgICAgICAgICAgICAgICAgICB9KX1cbiAgICAgICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBBcHA7XG4iLCIvLyBuZWVkZWQgdG8gYXZvaWQgY29tcGlsYXRpb24gZXJyb3JcbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgc2NpZW5jZV9pbnRybzogPGRpdj5cbiAgICAgICAgPHA+XG4gICAgICAgICAgICBEZXJlIHNrYWwgb3ZlcnbDpWtlIHN0csOlbGluZ3NuaXbDpWV0IGFzdHJvbmF0dWVuIHV0c2V0dGVzIGZvci5cbiAgICAgICAgICAgIERlcmUgbcOlIGRhIHBhc3NlIHDDpSBhdCBhc3Ryb25hdXRlbiBpa2tlIGJsaXIgdXRzYXR0XG4gICAgICAgICAgICBmb3Igc3Ryw6VsaW5nc25pdsOlZXIgc29tIGVyIHNrYWRlbGlnLlxuICAgICAgICA8L3A+XG4gICAgICAgIDxwPlZlZCBoamVscCBhdiBpbnN0cnVtZW50ZW5lIHNvbSBlciB0aWxnamVuZ2VsaWcgbcOlIGRlcmUgamV2bmxpZ1xuICAgICAgICAgICAgdGEgcHLDuHZlciBvZyByZWduZSB1dCB2ZXJkaWVuZSBmb3IgZ2plbm5vbXNuaXR0bGlnIG9nIHRvdGFsdFxuICAgICAgICAgICAgc3Ryw6VsaW5nc25pdsOlLiBGaW5uZXIgZGVyZSB1dCBhdCBuaXbDpWVuZSBlciBibGl0dCBmYXJsaWdcbiAgICAgICAgICAgIGjDuHllIDxlbT5tw6U8L2VtPiBkZXJlIHNpIGZyYSB0aWwgb3BwZHJhZ3NsZWRlcmVuIHPDpSB2aSBrYW5cbiAgICAgICAgICAgIGbDpSB1dCBhc3Ryb25hdXRlbiFcbiAgICAgICAgPC9wPlxuXG5cbiAgICAgICAgPHA+XG4gICAgICAgICAgICBFciBvcHBkcmFnZXQgZm9yc3TDpXR0P1xuICAgICAgICA8L3A+XG4gICAgPC9kaXY+XG59IiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgcmVuZGVyKCl7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignRFVNTVlfUkVOREVSLiBUaGlzIHJlYWN0IGNvbXBvbmVudCBpcyBub3QgZm9yIHByZXNlbnRhdGlvbmFsIHB1cnBvc2VzJyk7XG4gICAgfVxufTtcbiIsImNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbmNvbnN0IFJvdXRlciA9IHJlcXVpcmUoJ3JlYWN0LXJvdXRlcicpO1xuY29uc3QgTGluayA9IFJvdXRlci5MaW5rO1xuXG52YXIgSGVhZGVyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0ncm93Jz5cblxuICAgICAgICAgICAgICAgICAgICA8aGVhZGVyIGlkPSduYXJvbS1oZWFkZXInID5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGltZyBjbGFzc05hbWUgPSAnbmFyb20tbG9nby1pbWcnICBzcmM9Jy9pbWFnZXMvbG9nby5wbmcnIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTkFST00gZS1NaXNzaW9uIHByb3RvdHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvaGVhZGVyPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAgPGRpdiBpZD0nbWFpbi1oZWFkZXInIGNsYXNzTmFtZT0ncm93JyA+XG4gICAgICAgICAgICAgICAgICAgIDxMaW5rIHRvPScvJyA+XG4gICAgICAgICAgICAgICAgICAgICAgICA8aGVhZGVyID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aDEgY2xhc3NOYW1lID0gJyc+VW5kZXIgZW4gc29sc3Rvcm08L2gxPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9oZWFkZXI+XG4gICAgICAgICAgICAgICAgICAgIDwvTGluaz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gSGVhZGVyOyIsImNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbmNvbnN0IFJvdXRlciA9IHJlcXVpcmUoJ3JlYWN0LXJvdXRlcicpO1xuY29uc3QgTGluayA9IFJvdXRlci5MaW5rO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICByZW5kZXIgKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICA8aDM+VmVsZyBsYWc8L2gzPlxuICAgICAgICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgICAgICAgICAgPGxpPjxMaW5rIHRvPVwidGVhbS1yb290XCIgcGFyYW1zPXt7IHRlYW1JZCA6ICdzY2llbmNlJ319PkZvcnNrbmluZ3N0ZWFtZXQ8L0xpbms+PC9saT5cbiAgICAgICAgICAgICAgICAgICAgPGxpPiAuLi4gTGFnIDIsIDMsIDQgLi48L2xpPlxuICAgICAgICAgICAgICAgIDwvdWw+XG5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG5cbiIsImNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbmNvbnN0IGRpYWxvZ3MgPSByZXF1aXJlKCcuL2RpYWxvZ3MucmVhY3QnKTtcbmNvbnN0IHsgY2xlYW5Sb290UGF0aCB9ID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxuY29uc3QgUm91dGVTdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3Jlcy9yb3V0ZS1zdG9yZScpO1xudmFyIEludHJvU3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZXMvaW50cm9kdWN0aW9uLXN0b3JlJyk7XG5cbiBjb25zdCBJbnRyb2R1Y3Rpb25TY3JlZW4gPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBtaXhpbnM6IFtdLFxuXG4gICAgIGNvbnRleHRUeXBlczoge1xuICAgICAgICAgcm91dGVyOiBSZWFjdC5Qcm9wVHlwZXMuZnVuY1xuICAgICB9LFxuXG4gICAgc3RhdGljczoge1xuICAgICAgICB3aWxsVHJhbnNpdGlvblRvKHRyYW5zaXRpb24pIHtcbiAgICAgICAgICAgIHZhciB0ZWFtSWQgPSBjbGVhblJvb3RQYXRoKHRyYW5zaXRpb24ucGF0aCk7XG5cbiAgICAgICAgICAgIGlmIChJbnRyb1N0b3JlLmlzSW50cm9kdWN0aW9uUmVhZCh0ZWFtSWQpKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0ludHJvZHVjdGlvbiByZWFkIGVhcmxpZXInKTtcbiAgICAgICAgICAgICAgICB0cmFuc2l0aW9uLnJlZGlyZWN0KCd0ZWFtLXRhc2snLCB7dGFza0lkOiAnc2FtcGxlJywgdGVhbUlkIDogdGVhbUlkfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgX2hhbmRsZUNsaWNrKCkge1xuICAgICAgICBjb25zdCBNaXNzaW9uQWN0aW9uQ3JlYXRvcnMgPSByZXF1aXJlKCcuLi9hY3Rpb25zL01pc3Npb25BY3Rpb25DcmVhdG9ycycpO1xuXG4gICAgICAgIHZhciB0ZWFtSWQgPSBSb3V0ZVN0b3JlLmdldFRlYW1JZCgpO1xuICAgICAgICBNaXNzaW9uQWN0aW9uQ3JlYXRvcnMuaW50cm9XYXNSZWFkKHRlYW1JZCk7XG4gICAgICAgIHRoaXMuY29udGV4dC5yb3V0ZXIudHJhbnNpdGlvblRvKCd0ZWFtLXRhc2snLCB7dGFza0lkIDogJ3NhbXBsZScsIHRlYW1JZCA6IHRlYW1JZCB9KVxuICAgIH0sXG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHZhciB0ZWFtSWQ9IFJvdXRlU3RvcmUuZ2V0VGVhbUlkKCk7XG4gICAgICAgIHZhciBpbnRyb1RleHQgPSBkaWFsb2dzW3RlYW1JZCArICdfaW50cm8nXSB8fCA8cD5NYW5nbGVyIG9wcGRyYWc8L3A+O1xuXG4gICAgICAgIHJldHVybiAoPGRpdiBjbGFzc05hbWUgPSAncm93IGp1bWJvdHJvbiBpbnRyb3NjcmVlbic+XG4gICAgICAgICAgICA8aDI+TcOlbCBmb3Igb3BwZHJhZ2V0PC9oMj5cblxuICAgICAgICAgICAgeyBpbnRyb1RleHQgfVxuXG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lID0gJ2J0biBidG4tcHJpbWFyeSBidG4tbGcnXG4gICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5faGFuZGxlQ2xpY2t9XG4gICAgICAgICAgICA+SmVnIGZvcnN0w6VyPC9idXR0b24+XG4gICAgICAgIDwvZGl2PilcblxuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEludHJvZHVjdGlvblNjcmVlbjtcbiIsImNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbmNvbnN0IGFjdGlvbnMgPSByZXF1aXJlKCcuLi9hY3Rpb25zL01lc3NhZ2VBY3Rpb25DcmVhdG9ycycpO1xuXG52YXIgTGlzdE1lc3NhZ2VXcmFwcGVyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgcHJvcFR5cGVzOiB7XG4gICAgICAgIGxldmVsOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgICAgIHRleHQ6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICAgICAgaWQ6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZFxuICAgIH0sXG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGxldCBidXR0b247XG5cbiAgICAgICAgaWYgKHRoaXMucHJvcHMuZGlzbWlzc2FibGUpIHtcbiAgICAgICAgICAgIGJ1dHRvbiA9IChcbiAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJjbG9zZVwiXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGFjdGlvbnMucmVtb3ZlTWVzc2FnZSh0aGlzLnByb3BzLmlkKX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPsOXPC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8bGkgY2xhc3NOYW1lPXsgJ2FsZXJ0IGFsZXJ0LWRpc21pc3NpYmxlIGFsZXJ0LScgKyB0aGlzLnByb3BzLmxldmVsfSA+XG4gICAgICAgICAgICB7IGJ1dHRvbiB9XG4gICAgICAgICAgICB7dGhpcy5wcm9wcy50ZXh0fVxuICAgICAgICAgICAgPC9saT5cbiAgICAgICAgKTtcbiAgICB9XG59KTtcblxudmFyIE1lc3NhZ2VMaXN0ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICB2YXIgaGlkZGVuID0gdGhpcy5wcm9wcy5tZXNzYWdlcy5sZW5ndGggPT09IDAgPyAnaGlkZScgOiAnJztcbiAgICAgICAgdmFyIGNsYXNzZXMgPSAodGhpcy5wcm9wcy5jbGFzc05hbWUgfHwgJycpICsgJyBtZXNzYWdlYm94ICcgKyBoaWRkZW47XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDx1bCBjbGFzc05hbWUgPSB7IGNsYXNzZXMgfT5cbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm1lc3NhZ2VzLm1hcCgobXNnKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoPExpc3RNZXNzYWdlV3JhcHBlciBrZXk9e21zZy5pZH0gey4uLm1zZ30gLz4pO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICA8L3VsPlxuICAgICAgICApO1xuICAgIH1cblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTWVzc2FnZUxpc3Q7XG4iLCJjb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0JyksXG4gICAgVGltZXJTdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3Jlcy90aW1lci1zdG9yZScpLFxuICAgIFRpbWVyID0gcmVxdWlyZSgnLi90aW1lci5yZWFjdCcpO1xuXG5cbmNvbnN0IE1pc3Npb25UaW1lciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIGdldEluaXRpYWxTdGF0ZSgpe1xuICAgICAgICByZXR1cm4geyBlbGFwc2VkIDogVGltZXJTdG9yZS5nZXRFbGFwc2VkTWlzc2lvblRpbWUoKSB9O1xuICAgIH0sXG4gICAgXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgVGltZXJTdG9yZS5hZGRDaGFuZ2VMaXN0ZW5lcih0aGlzLl9oYW5kbGVUaW1lQ2hhbmdlKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgVGltZXJTdG9yZS5yZW1vdmVDaGFuZ2VMaXN0ZW5lcih0aGlzLl9oYW5kbGVUaW1lQ2hhbmdlKTtcbiAgICB9LFxuXG4gICAgX2hhbmRsZVRpbWVDaGFuZ2UoKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgZWxhcHNlZCA6IFRpbWVyU3RvcmUuZ2V0RWxhcHNlZE1pc3Npb25UaW1lKClcbiAgICAgICAgfSlcbiAgICB9LFxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gKDxkaXYgY2xhc3NOYW1lPXt0aGlzLnByb3BzLmNsYXNzTmFtZX0+XG4gICAgICAgICAgICA8VGltZXIgdGltZUluU2Vjb25kcz17dGhpcy5zdGF0ZS5lbGFwc2VkIH0gLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTWlzc2lvblRpbWVyO1xuXG4iLCJjb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IE5vdEZvdW5kID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPSdjb250YWluZXInPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyb3cganVtYm90cm9uXCI+XG4gICAgICAgICAgICAgICAgPGRpdj5PanNhbm4uIFRyb3IgZHUgaGFyIGfDpXR0IGRlZyB2aWxsLCBqZWc8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBOb3RGb3VuZDtcbiIsIi8qXG4gKiBTaW1wbGUgY29tcG9uZW50IHRoYXQgb3ZlcmxheXMgYSBzZWN0aW9uLCBzaWduYWxsaW5nIGEgZGlzYWJsZWQgc3RhdGVcbiAqXG4gKiBEZXBlbmRhbnQgb24gd29ya2luZyBDU1MsIG9mIGNvdXJzZTogdGhlIHBhcmVudCBtdXN0IGJlIHBvc2l0aW9uZWQgKHJlbGF0aXZlLCBhYnNvbHV0ZSwgLi4uKVxuICogTG9vc2VseSBiYXNlZCBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzM2MjcyODMvaG93LXRvLWRpbS1vdGhlci1kaXYtb24tY2xpY2tpbmctaW5wdXQtYm94LXVzaW5nLWpxdWVyeVxuICovXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgcHJvcFR5cGVzOiB7XG4gICAgICAgIGFjdGl2ZSA6IFJlYWN0LlByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWRcbiAgICB9LFxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gKHRoaXMucHJvcHMuYWN0aXZlPyA8ZGl2IGNsYXNzTmFtZT1cIm92ZXJsYXlcIi8+IDogbnVsbCk7XG4gICAgfVxuXG59KTsiLCIvKipcbiAqIEltcGxlbWVudGF0aW9uIGJhc2VkIG9uIHRpcHMgaW4gdGhlIGFydGljbGUgYnkgTmljb2xhcyBIZXJ5XG4gKiBodHRwOi8vbmljb2xhc2hlcnkuY29tL2ludGVncmF0aW5nLWQzanMtdmlzdWFsaXphdGlvbnMtaW4tYS1yZWFjdC1hcHBcbiAqXG4gKiBDaGFydCBjb2RlIG1vcmUgb3IgbGVzcyBjb3BpZWQgZnJvbSB0aGUgcHJvdG90eXBlIGJ5IExlbyBNYXJ0aW4gV2VzdGJ5XG4gKi9cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbmNvbnN0IEFtQ2hhcnRzID0gcmVxdWlyZSgnYW1jaGFydHMnKTtcbmNvbnN0IGNvbnN0YW50cyA9IHJlcXVpcmUoJy4uL2NvbnN0YW50cy9TY2llbmNlVGVhbUNvbnN0YW50cycpO1xuXG52YXIgY2hhcnQsIGNoYXJ0VXBkYXRlciwgZ2V0TmV3VmFsdWUsIHVwZGF0ZUZyZXF1ZW5jeSwgbWF4U2Vjb25kcztcbnZhciByYWRpYXRpb25TYW1wbGVzID0gW107XG5cbmNvbnN0IHsgcmFuZG9tSW50IH0gPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG5mdW5jdGlvbiBpbml0Q2hhcnQoZG9tRWxlbWVudCkge1xuXG4gICAgY2hhcnQgPSBuZXcgQW1DaGFydHMuQW1TZXJpYWxDaGFydCgpO1xuXG4gICAgY2hhcnQubWFyZ2luVG9wID0gMjA7XG4gICAgY2hhcnQubWFyZ2luUmlnaHQgPSAwO1xuICAgIGNoYXJ0Lm1hcmdpbkxlZnQgPSAwO1xuICAgIGNoYXJ0LmF1dG9NYXJnaW5PZmZzZXQgPSAwO1xuICAgIGNoYXJ0LmRhdGFQcm92aWRlciA9IHJhZGlhdGlvblNhbXBsZXM7XG4gICAgY2hhcnQuY2F0ZWdvcnlGaWVsZCA9IFwidGltZXN0YW1wXCI7XG5cbiAgICAvL1ggYXhpc1xuICAgIHZhciBjYXRlZ29yeUF4aXMgPSBjaGFydC5jYXRlZ29yeUF4aXM7XG4gICAgY2F0ZWdvcnlBeGlzLmRhc2hMZW5ndGggPSAxO1xuICAgIGNhdGVnb3J5QXhpcy5ncmlkQWxwaGEgPSAwLjE1O1xuICAgIGNhdGVnb3J5QXhpcy5heGlzQ29sb3IgPSBcIiNEQURBREFcIjtcbiAgICBjYXRlZ29yeUF4aXMudGl0bGUgPSBcIlNlY29uZHNcIjtcblxuICAgIC8vWSBheGlzXG4gICAgdmFyIHZhbHVlQXhpcyA9IG5ldyBBbUNoYXJ0cy5WYWx1ZUF4aXMoKTtcbiAgICB2YWx1ZUF4aXMuYXhpc0FscGhhID0gMC4yO1xuICAgIHZhbHVlQXhpcy5kYXNoTGVuZ3RoID0gMTtcbiAgICB2YWx1ZUF4aXMudGl0bGUgPSBcIs68U3YvaFwiO1xuICAgIHZhbHVlQXhpcy5taW5pbXVtID0gY29uc3RhbnRzLlNDSUVOQ0VfUkFESUFUSU9OX01JTjtcbiAgICB2YWx1ZUF4aXMubWF4aW11bSA9IGNvbnN0YW50cy5TQ0lFTkNFX1JBRElBVElPTl9NQVg7XG4gICAgY2hhcnQuYWRkVmFsdWVBeGlzKHZhbHVlQXhpcyk7XG5cbiAgICAvL0xpbmVcbiAgICB2YXIgZ3JhcGggPSBuZXcgQW1DaGFydHMuQW1HcmFwaCgpO1xuICAgIGdyYXBoLnZhbHVlRmllbGQgPSBcInJhZGlhdGlvblwiO1xuICAgIGdyYXBoLmJ1bGxldCA9IFwicm91bmRcIjtcbiAgICBncmFwaC5idWxsZXRCb3JkZXJDb2xvciA9IFwiI0ZGRkZGRlwiO1xuICAgIGdyYXBoLmJ1bGxldEJvcmRlclRoaWNrbmVzcyA9IDI7XG4gICAgZ3JhcGgubGluZVRoaWNrbmVzcyA9IDI7XG4gICAgZ3JhcGgubGluZUNvbG9yID0gXCIjYjUwMzBkXCI7XG4gICAgZ3JhcGgubmVnYXRpdmVMaW5lQ29sb3IgPSBcIiMyMjhCMjJcIjtcbiAgICBncmFwaC5uZWdhdGl2ZUJhc2UgPSA2MDtcbiAgICBncmFwaC5oaWRlQnVsbGV0c0NvdW50ID0gNTA7XG4gICAgY2hhcnQuYWRkR3JhcGgoZ3JhcGgpO1xuXG4gICAgLy9Nb3VzZW92ZXJcbiAgICBjb25zdCBjaGFydEN1cnNvciA9IG5ldyBBbUNoYXJ0cy5DaGFydEN1cnNvcigpO1xuICAgIGNoYXJ0Q3Vyc29yLmN1cnNvclBvc2l0aW9uID0gXCJtb3VzZVwiO1xuICAgIGNoYXJ0LmFkZENoYXJ0Q3Vyc29yKGNoYXJ0Q3Vyc29yKTtcbiAgICBjaGFydC53cml0ZShkb21FbGVtZW50KTtcbn1cblxuLy9BZGRzIGEgbmV3IHJhZGlhdGlvbiBzYW1wbGUgdG8gdGhlIGNoYXJ0IGV2ZXJ5IGZldyBzZWNvbmRzXG5mdW5jdGlvbiBzdGFydEV2ZW50TG9vcCgpIHtcbiAgICB2YXIgc3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcbiAgICBzdG9wRXZlbnRMb29wKCk7XG5cbiAgICBjaGFydFVwZGF0ZXIgPSBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBzZWNvbmRzUGFzc2VkID0gKERhdGUubm93KCkgLSBzdGFydFRpbWUpIC8gMTAwMDtcblxuICAgICAgICByYWRpYXRpb25TYW1wbGVzLnB1c2goe1xuICAgICAgICAgICAgdGltZXN0YW1wOiBNYXRoLmZsb29yKHNlY29uZHNQYXNzZWQgKyAwLjUpLFxuICAgICAgICAgICAgcmFkaWF0aW9uOiBnZXROZXdWYWx1ZSgpXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vV2hlbiB0aGUgY2hhcnQgZ3Jvd3MsIHN0YXJ0IGN1dHRpbmcgb2ZmIHRoZSBvbGRlc3Qgc2FtcGxlIHRvIGdpdmUgdGhlIGNoYXJ0IGEgc2xpZGluZyBlZmZlY3RcbiAgICAgICAgaWYgKHJhZGlhdGlvblNhbXBsZXMubGVuZ3RoID4gKG1heFNlY29uZHMgLyB1cGRhdGVGcmVxdWVuY3kpKSB7XG4gICAgICAgICAgICByYWRpYXRpb25TYW1wbGVzLnNoaWZ0KCk7XG4gICAgICAgIH1cblxuICAgICAgICBjaGFydC52YWxpZGF0ZURhdGEoKTtcbiAgICB9LCB1cGRhdGVGcmVxdWVuY3kgKiAxMDAwKTtcbn1cblxuZnVuY3Rpb24gc3RvcEV2ZW50TG9vcCgpIHtcbiAgICBjbGVhckludGVydmFsKGNoYXJ0VXBkYXRlcik7XG59XG5cbmNvbnN0IFJhZGlhdGlvbkNoYXJ0ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgc3RhdGljczoge30sXG5cbiAgICBwcm9wVHlwZXM6IHtcbiAgICAgICAgdXBkYXRlRnJlcXVlbmN5U2Vjb25kczogUmVhY3QuUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAgICAgICBtYXhTZWNvbmRzU2hvd246IFJlYWN0LlByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgICAgICAgZ2V0TmV3VmFsdWU6IFJlYWN0LlByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgICAgIGhlaWdodDogUmVhY3QuUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAgICAgICB3aWR0aDogUmVhY3QuUHJvcFR5cGVzLm51bWJlclxuICAgIH0sXG5cbiAgICBtaXhpbnM6IFtdLFxuXG4gICAgY29tcG9uZW50V2lsbE1vdW50KCkge1xuICAgICAgICB1cGRhdGVGcmVxdWVuY3kgPSB0aGlzLnByb3BzLnVwZGF0ZUZyZXF1ZW5jeVNlY29uZHM7XG4gICAgICAgIG1heFNlY29uZHMgPSB0aGlzLnByb3BzLm1heFNlY29uZHNTaG93bjtcbiAgICAgICAgZ2V0TmV3VmFsdWUgPSB0aGlzLnByb3BzLmdldE5ld1ZhbHVlO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdmFyIGVsID0gUmVhY3QuZmluZERPTU5vZGUodGhpcyk7XG4gICAgICAgIGluaXRDaGFydChlbCk7XG4gICAgICAgIHN0YXJ0RXZlbnRMb29wKCk7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMoKSB7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICBjaGFydCAmJiBjaGFydC5jbGVhcigpO1xuICAgICAgICBzdG9wRXZlbnRMb29wKCk7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZFVubW91bnQoKSB7XG4gICAgICAgIGNoYXJ0ID0gbnVsbDtcbiAgICAgICAgLy9yYWRpYXRpb25TYW1wbGVzLmxlbmd0aCA9IDA7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZFVwZGF0ZSgpIHtcbiAgICB9LFxuXG4gICAgLy8gdGhpcyBjaGFydCBpcyByZXNwb25zaWJsZSBmb3IgZHJhd2luZyBpdHNlbGZcbiAgICBzaG91bGRDb21wb25lbnRVcGRhdGUoKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9LFxuXG4gICAgLy8gUHJpdmF0ZSBtZXRob2RzXG5cbiAgICByZW5kZXIoKSB7XG5cbiAgICAgICAgLy8gaWYgeW91IGRvbid0IHNwZWNpZnkgd2lkdGggaXQgd2lsbCBtYXggb3V0IHRvIDEwMCUgKHdoaWNoIGlzIG9rKVxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgIHN0eWxlPXt7d2lkdGg6IHRoaXMucHJvcHMud2lkdGggKyAncHgnLCBoZWlnaHQgOiB0aGlzLnByb3BzLmhlaWdodCsgJ3B4J319XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXt0aGlzLnByb3BzLmNsYXNzTmFtZX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICk7XG4gICAgfVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBSYWRpYXRpb25DaGFydDtcbiIsImNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKSxcbiAgICBUaW1lclN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL3RpbWVyLXN0b3JlJyksXG4gICAgTWlzc2lvbkFjdGlvbkNyZWF0b3JzID0gcmVxdWlyZSgnLi4vYWN0aW9ucy9NaXNzaW9uQWN0aW9uQ3JlYXRvcnMnKSxcbiAgICBUaW1lckFjdGlvbkNyZWF0b3JzID0gcmVxdWlyZSgnLi4vYWN0aW9ucy9UaW1lckFjdGlvbkNyZWF0b3JzJyksXG4gICAgU2NpZW5jZUFjdGlvbkNyZWF0b3JzID0gcmVxdWlyZSgnLi4vYWN0aW9ucy9TY2llbmNlQWN0aW9uQ3JlYXRvcnMnKSxcbiAgICBjb25zdGFudHMgPSByZXF1aXJlKCcuLi9jb25zdGFudHMvU2NpZW5jZVRlYW1Db25zdGFudHMnKTtcblxudmFyIFJhZGlhdGlvblNhbXBsZXIgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBwcm9wVHlwZXM6IHtcbiAgICAgICAgcmVxdWlyZWRTYW1wbGVzOiBSZWFjdC5Qcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gICAgICAgIHJhZGlhdGlvblN0b3JlU3RhdGU6IFJlYWN0LlByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZFxuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsTW91bnQoKSB7XG4gICAgICAgIFRpbWVyU3RvcmUuYWRkQ2hhbmdlTGlzdGVuZXIodGhpcy5faGFuZGxlVGltZXJDaGFuZ2UpO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRVcGRhdGUoKXtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUudGltZXJBY3RpdmUpIHtcbiAgICAgICAgICAgIGxldCBlbCA9IFJlYWN0LmZpbmRET01Ob2RlKHRoaXMucmVmc1snc2FtcGxlLWJ1dHRvbiddKTtcbiAgICAgICAgICAgIGVsLmZvY3VzKCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpe1xuICAgICAgICBUaW1lclN0b3JlLnJlbW92ZUNoYW5nZUxpc3RlbmVyKHRoaXMuX2hhbmRsZVRpbWVyQ2hhbmdlKTtcbiAgICB9LFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgICAgICByZXR1cm4ge3RpbWVyQWN0aXZlOiBmYWxzZX1cbiAgICB9LFxuXG4gICAgX2lzRGlzYWJsZWQoKSB7XG4gICAgICAgIHJldHVybiAhdGhpcy5zdGF0ZS50aW1lckFjdGl2ZVxuICAgIH0sXG5cblxuICAgIF9oYW5kbGVUaW1lckNoYW5nZSgpIHtcbiAgICAgICAgdmFyIGF1ZGlvID0gUmVhY3QuZmluZERPTU5vZGUodGhpcy5yZWZzWydnZWlnZXJTb3VuZCddKTtcbiAgICAgICAgdmFyIHRpbWVyQWN0aXZlID0gVGltZXJTdG9yZS5pc1J1bm5pbmcoY29uc3RhbnRzLlNDSUVOQ0VfVElNRVJfMSk7XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7dGltZXJBY3RpdmU6IHRpbWVyQWN0aXZlfSk7XG5cbiAgICAgICAgaWYgKHRpbWVyQWN0aXZlICYmIGF1ZGlvLnBhdXNlZCkge1xuICAgICAgICAgICAgYXVkaW8ucGxheSgpO1xuICAgICAgICB9IGVsc2UgaWYgKCF0aW1lckFjdGl2ZSAmJiAhYXVkaW8ucGF1c2VkKSB7XG4gICAgICAgICAgICBhdWRpby5wYXVzZSgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIF9oYW5kbGVDbGljaygpIHtcbiAgICAgICAgU2NpZW5jZUFjdGlvbkNyZWF0b3JzLnRha2VSYWRpYXRpb25TYW1wbGUoKTtcblxuICAgICAgICBpZiAodGhpcy5wcm9wcy5yYWRpYXRpb25TdG9yZVN0YXRlLnNhbXBsZXMubGVuZ3RoICsgMSA+PSB0aGlzLnByb3BzLnJlcXVpcmVkU2FtcGxlcykge1xuICAgICAgICAgICAgVGltZXJBY3Rpb25DcmVhdG9ycy5zdG9wVGltZXIoY29uc3RhbnRzLlNDSUVOQ0VfVElNRVJfMSk7XG4gICAgICAgICAgICBTY2llbmNlQWN0aW9uQ3JlYXRvcnMuY29tcGxldGVUYXNrKCdzYW1wbGUnKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHZhciBkaXNhYmxlZCwgY2xhc3NlcztcblxuICAgICAgICBjbGFzc2VzID0gJ2J0biBidG4tcHJpbWFyeSc7XG5cbiAgICAgICAgaWYgKHRoaXMuX2lzRGlzYWJsZWQoKSkge1xuICAgICAgICAgICAgY2xhc3NlcyArPSAnIGRpc2FibGVkJztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9e1wicmFkaWF0aW9uLXNhbXBsZXIgXCIgKyB0aGlzLnByb3BzLmNsYXNzTmFtZX0+XG5cbiAgICAgICAgICAgICAgICB7IC8qIEF2b2lkIGZsb2F0aW5nIGludG8gcHJldmlvdXMgYmxvY2sgKi8gfVxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicmFkaWF0aW9uLXNhbXBsZXJfX3BhZGRlciBjbGVhcmZpeCB2aXNpYmxlLXhzLWJsb2NrXCIvPlxuXG4gICAgICAgICAgICAgICAgPGF1ZGlvIHJlZj1cImdlaWdlclNvdW5kXCIgbG9vcD5cbiAgICAgICAgICAgICAgICAgICAgPHNvdXJjZSBzcmM9XCIvc291bmRzL0FPUzA0NTk1X0VsZWN0cmljX0dlaWdlcl9Db3VudGVyX0Zhc3Qud2F2XCIgdHlwZT1cImF1ZGlvL3dhdlwiLz5cbiAgICAgICAgICAgICAgICA8L2F1ZGlvPlxuXG4gICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgcmVmPSdzYW1wbGUtYnV0dG9uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc2VzfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5faGFuZGxlQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgICAgICA+VGEgc3Ryw6VsaW5nc3Byw7h2ZVxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvc2VjdGlvbj5cbiAgICAgICAgKTtcbiAgICB9XG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJhZGlhdGlvblNhbXBsZXI7IiwiY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIHN0YXRpY3M6IHt9LFxuICAgIHByb3BUeXBlczoge1xuICAgICAgICBzYW1wbGVzOiBSZWFjdC5Qcm9wVHlwZXMuYXJyYXkuaXNSZXF1aXJlZCxcbiAgICAgICAgbWluaW1hbFJvd3NUb1Nob3c6IFJlYWN0LlByb3BUeXBlcy5udW1iZXJcbiAgICB9LFxuXG4gICAgLy8gUHJpdmF0ZSBtZXRob2RzXG5cbiAgICBnZXREZWZhdWx0UHJvcHMoKXtcbiAgICAgICAgcmV0dXJuIHttaW5pbWFsUm93c1RvU2hvdzogMH07XG4gICAgfSxcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgbGV0IHNhbXBsZVJvd3MgPSB0aGlzLnByb3BzLnNhbXBsZXMubWFwKCh2YWwsIGkpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gPHRyIGtleT17aX0+XG4gICAgICAgICAgICAgICAgICAgIDx0aCBzY29wZT1cInJvd1wiPntpICsgMX08L3RoPlxuICAgICAgICAgICAgICAgICAgICA8dGQ+e3ZhbH08L3RkPlxuICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIG1pc3NpbmdSb3dzID0gdGhpcy5wcm9wcy5taW5pbWFsUm93c1RvU2hvdyAtIHNhbXBsZVJvd3MubGVuZ3RoLFxuICAgICAgICAgICAgZmlsbFJvd3M7XG5cbiAgICAgICAgaWYgKG1pc3NpbmdSb3dzID4gMCkge1xuICAgICAgICAgICAgZmlsbFJvd3MgPSBbXTtcblxuICAgICAgICAgICAgd2hpbGUgKG1pc3NpbmdSb3dzLS0pIHtcbiAgICAgICAgICAgICAgICBmaWxsUm93cy5wdXNoKDx0ciBrZXk9e2ZpbGxSb3dzLmxlbmd0aH0+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dGggc2NvcGU9XCJyb3dcIj48L3RoPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRkPiZuYnNwO3svKiBOZWVkcyBmaWxsZXIgdG8gbm90IGNvbGxhcHNlIGNlbGwgKi99PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e3RoaXMucHJvcHMuY2xhc3NOYW1lfT5cblxuICAgICAgICAgICAgICAgIDxoMz5QcsO4dmVyZXN1bHRhdGVyPC9oMz5cbiAgICAgICAgICAgICAgICA8dGFibGUgY2xhc3NOYW1lPVwiIHRhYmxlIHRhYmxlLWJvcmRlcmVkXCI+XG4gICAgICAgICAgICAgICAgICAgIDxjYXB0aW9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgU3Ryw6VsaW5nc3BhcnRpa2xlciBwZXIgc2VrdW5kIChwL3MpXG4gICAgICAgICAgICAgICAgICAgIDwvY2FwdGlvbj5cbiAgICAgICAgICAgICAgICAgICAgPHRoZWFkPlxuICAgICAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dGggc2NvcGU9XCJjb2xcIj5QcsO4dmVudW1tZXI8L3RoPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRoIHNjb3BlPVwiY29sXCI+cC9zPC90aD5cbiAgICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICAgICAgPC90aGVhZD5cbiAgICAgICAgICAgICAgICAgICAgPHRib2R5PlxuICAgICAgICAgICAgICAgICAgICB7IHNhbXBsZVJvd3MgfVxuICAgICAgICAgICAgICAgICAgICB7IGZpbGxSb3dzIH1cbiAgICAgICAgICAgICAgICAgICAgPC90Ym9keT5cbiAgICAgICAgICAgICAgICA8L3RhYmxlPlxuXG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG5cbn0pO1xuXG4iLCJjb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5jb25zdCBUaW1lclBhbmVsID0gcmVxdWlyZSgnLi90aW1lci1wYW5lbC5yZWFjdCcpO1xuY29uc3QgUmFkaWF0aW9uQ2hhcnQgPSByZXF1aXJlKCcuL3JhZGlhdGlvbi1jaGFydC5yZWFjdC5qcycpO1xuY29uc3QgUmFkaWF0aW9uU2FtcGxlQnV0dG9uID0gcmVxdWlyZSgnLi9yYWRpYXRpb24tc2FtcGxlci5yZWFjdCcpO1xuY29uc3QgT3ZlcmxheSA9IHJlcXVpcmUoJy4vb3ZlcmxheS5yZWFjdCcpO1xuY29uc3QgUmFkaWF0aW9uVGFibGUgPSByZXF1aXJlKCcuL3JhZGlhdGlvbi10YWJsZS5yZWFjdCcpO1xuY29uc3QgUmFkaWF0aW9uU3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZXMvcmFkaWF0aW9uLXN0b3JlJyk7XG5jb25zdCBhY3Rpb25zID0gcmVxdWlyZSgnLi4vYWN0aW9ucy9TY2llbmNlQWN0aW9uQ3JlYXRvcnMnKTtcbmNvbnN0IHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcbmNvbnN0IFNjaWVuY2VUZWFtQ29uc3RhbnRzID0gcmVxdWlyZSgnLi4vY29uc3RhbnRzL1NjaWVuY2VUZWFtQ29uc3RhbnRzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgc3RhdGljczoge30sXG4gICAgcHJvcFR5cGVzOiB7XG4gICAgICAgIGFwcHN0YXRlOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWRcbiAgICB9LFxuICAgIG1peGluczogW10sXG5cbiAgICAvLyBsaWZlIGN5Y2xlIG1ldGhvZHNcbiAgICBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByYWRpYXRpb246IFJhZGlhdGlvblN0b3JlLmdldFN0YXRlKClcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBnZXREZWZhdWx0UHJvcHMoKSB7XG4gICAgICAgIHJldHVybiB7fTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbE1vdW50KCkge1xuICAgICAgICBSYWRpYXRpb25TdG9yZS5hZGRDaGFuZ2VMaXN0ZW5lcih0aGlzLl9oYW5kbGVSYWRpYXRpb25DaGFuZ2UpO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKCkge1xuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgUmFkaWF0aW9uU3RvcmUucmVtb3ZlQ2hhbmdlTGlzdGVuZXIodGhpcy5faGFuZGxlUmFkaWF0aW9uQ2hhbmdlKTtcbiAgICB9LFxuXG4gICAgLy8gUHJpdmF0ZSBtZXRob2RzXG5cbiAgICBfaGFuZGxlUmFkaWF0aW9uQ2hhbmdlKCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHJhZGlhdGlvbjogUmFkaWF0aW9uU3RvcmUuZ2V0U3RhdGUoKVxuICAgICAgICB9KVxuICAgIH0sXG5cbiAgICBfaGFuZGxlQXZlcmFnZVJhZGlhdGlvblN1Ym1pdChlKSB7XG4gICAgICAgIGxldCBlbCA9IFJlYWN0LmZpbmRET01Ob2RlKHRoaXMucmVmc1snYXZlcmFnZS1pbnB1dCddKSxcbiAgICAgICAgICAgIHZhbCA9IGVsLnZhbHVlLnRyaW0oKTtcblxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgaWYgKCF2YWwubGVuZ3RoKSByZXR1cm47XG5cbiAgICAgICAgbGV0IGF2ZXJhZ2UgPSB1dGlscy5wYXJzZU51bWJlcih2YWwpO1xuICAgICAgICBlbC52YWx1ZSA9ICcnO1xuXG4gICAgICAgIGlmIChhdmVyYWdlKSB7XG4gICAgICAgICAgICBhY3Rpb25zLmF2ZXJhZ2VSYWRpYXRpb25DYWxjdWxhdGVkKGF2ZXJhZ2UpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIF9oYW5kbGVBZGRUb1RvdGFsU3VibWl0KGUpe1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgbGV0IGVsID0gUmVhY3QuZmluZERPTU5vZGUodGhpcy5yZWZzWydhZGQtdG8tdG90YWwtaW5wdXQnXSk7XG4gICAgICAgIGxldCB2YWwgPSBlbC52YWx1ZS50cmltKCk7XG4gICAgICAgIGlmICghdmFsLmxlbmd0aCkgcmV0dXJuO1xuXG4gICAgICAgIGxldCBudW1iZXIgPSB1dGlscy5wYXJzZU51bWJlcih2YWwpO1xuXG5cbiAgICAgICAgZWwudmFsdWUgPSAnJztcblxuICAgICAgICBpZiAobnVtYmVyKSB7XG4gICAgICAgICAgICBhY3Rpb25zLmFkZFRvVG90YWxSYWRpYXRpb25MZXZlbChudW1iZXIpO1xuICAgICAgICB9XG4gICAgfSxcblxuXG4gICAgLypcbiAgICAgKiBIZWxwZXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdGFza05hbWUgbmFtZVxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIHRoZSBjdXJyZW50IHRhc2sgaWQgZXF1YWxzIHRoZSBuYW1lIHBhc3NlZCBpblxuICAgICAqL1xuICAgIF9pc0N1cnJlbnRUYXNrKHRhc2tOYW1lKXtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvcHMuYXBwc3RhdGUudGFza1N0b3JlLmN1cnJlbnRUYXNrSWQgPT09IHRhc2tOYW1lO1xuICAgIH0sXG5cbiAgICBfcmFkaWF0aW9uU3RhdHVzKCl7XG4gICAgICAgIHZhciBudW0gPSB0aGlzLnN0YXRlLnJhZGlhdGlvbi5sYXN0Q2FsY3VsYXRlZEF2ZXJhZ2UsXG4gICAgICAgICAgICBjb2xvcjtcblxuICAgICAgICBpZiAobnVtID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gJ0lra2UgYmVyZWduZXQnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG51bSA+IFNjaWVuY2VUZWFtQ29uc3RhbnRzLlNDSUVOQ0VfQVZHX1JBRF9SRURfVkFMVUUpIHtcbiAgICAgICAgICAgIGNvbG9yID0gJ3JlZCc7XG4gICAgICAgIH0gZWxzZSBpZiAobnVtID4gU2NpZW5jZVRlYW1Db25zdGFudHMuU0NJRU5DRV9BVkdfUkFEX09SQU5HRV9WQUxVRSkge1xuICAgICAgICAgICAgY29sb3IgPSAnb3JhbmdlJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbG9yID0gJ2dyZWVuJztcbiAgICAgICAgfVxuXG5cbiAgICAgICAgcmV0dXJuICg8ZGl2XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJyYWRpYXRpb24taW5kaWNhdG9yIGNpcmNsZSBjb2wteHMtMlwiXG4gICAgICAgICAgICBzdHlsZT17IHsgJ2JhY2tncm91bmRDb2xvcicgOiBjb2xvciB9IH1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgIHtudW0gfVxuICAgICAgICA8L2Rpdj4pO1xuXG4gICAgfSxcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgbGV0IHNob3dTYW1wbGVJbnB1dCA9IHRoaXMuX2lzQ3VycmVudFRhc2soJ3NhbXBsZScpLFxuICAgICAgICAgICAgc2hvd0F2ZXJhZ2VJbnB1dCA9IHRoaXMuX2lzQ3VycmVudFRhc2soJ2F2ZXJhZ2UnKSxcbiAgICAgICAgICAgIHNob3dBZGRUb1RvdGFsSW5wdXQgPSB0aGlzLl9pc0N1cnJlbnRUYXNrKCdhZGR0b3RhbCcpO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2ID5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0ncm93Jz5cblxuICAgICAgICAgICAgICAgICAgICA8ZGwgY2xhc3NOYW1lPSdyYWRpYXRpb24tdmFsdWVzIGNvbC14cy02ICc+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZHQ+VG90YWx0IHN0csOlbGluZ3NuaXbDpTwvZHQ+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGQ+e3RoaXMuc3RhdGUucmFkaWF0aW9uLnRvdGFsfTwvZGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZHQ+U2lzdCBpbm5sZXN0IHN0csOlbGluZ3NuaXbDpTwvZHQ+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGQ+eyB0aGlzLl9yYWRpYXRpb25TdGF0dXMoKX0gPC9kZD5cbiAgICAgICAgICAgICAgICAgICAgPC9kbD5cblxuICAgICAgICAgICAgICAgICAgICA8UmFkaWF0aW9uVGFibGVcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbmltYWxSb3dzVG9TaG93PXs0fVxuICAgICAgICAgICAgICAgICAgICAgICAgc2FtcGxlcz17dGhpcy5zdGF0ZS5yYWRpYXRpb24uc2FtcGxlc31cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT0nY29sLXhzLTYgJyAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAgPGhyLz5cblxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiaW5zdHJ1bWVudHNcIj5cblxuICAgICAgICAgICAgICAgICAgICA8ZmllbGRzZXQgZGlzYWJsZWQ9eyFzaG93U2FtcGxlSW5wdXR9IGNsYXNzTmFtZT0naW5zdHJ1bWVudHNfX3NlY3Rpb24gcm93IG92ZXJsYXlhYmxlJz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxPdmVybGF5IGFjdGl2ZT17ICFzaG93U2FtcGxlSW5wdXQgfS8+XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxoMyBjbGFzc05hbWU9J2NvbC14cy0xMic+VGEgcHLDuHZlcjwvaDM+XG4gICAgICAgICAgICAgICAgICAgICAgICA8VGltZXJQYW5lbCBjbGFzc05hbWU9J2NvbC14cy0xMiBjb2wtc20tOCcgdGltZXJJZD17U2NpZW5jZVRlYW1Db25zdGFudHMuU0NJRU5DRV9USU1FUl8xfS8+XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxSYWRpYXRpb25TYW1wbGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9J2NvbC14cy01IGNvbC1zbS00J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJhZGlhdGlvblN0b3JlU3RhdGU9e3RoaXMuc3RhdGUucmFkaWF0aW9ufVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkU2FtcGxlcz17NH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICA8L2ZpZWxkc2V0PlxuXG4gICAgICAgICAgICAgICAgICAgIDxociAvPlxuXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicm93IG92ZXJsYXlhYmxlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8T3ZlcmxheSBhY3RpdmU9eyAhc2hvd0F2ZXJhZ2VJbnB1dCB9Lz5cblxuICAgICAgICAgICAgICAgICAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwicmFkaWF0aW9uLWlucHV0IGluc3RydW1lbnRzX19zZWN0aW9uIGNvbC14cy0xMiBjb2wtc20tNlwiPlxuXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJvd1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aDMgY2xhc3NOYW1lPSdjb2wteHMtMTInPkdqZW5ub21zbml0dGxpZyBzdHLDpWxpbmc8L2gzPlxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxmaWVsZHNldCBjbGFzc05hbWU9XCJjb2wteHMtOFwiIGRpc2FibGVkPXsgIXNob3dBdmVyYWdlSW5wdXQgfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxmb3JtIG9uU3VibWl0PXt0aGlzLl9oYW5kbGVBdmVyYWdlUmFkaWF0aW9uU3VibWl0fT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgcmVmPSdhdmVyYWdlLWlucHV0J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwibnVtYmVyXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RlcD1cIjAuMVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1pbj1cIjFcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXg9XCIxMDBcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9J3JhZGlhdGlvbi1pbnB1dF9faW5wdXQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9J2J0biBidG4tcHJpbWFyeSc+RXZhbHVlcjwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9mb3JtPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2ZpZWxkc2V0PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICAgICAgICA8aHIvPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJvdyBvdmVybGF5YWJsZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPE92ZXJsYXkgYWN0aXZlPXsgIXNob3dBZGRUb1RvdGFsSW5wdXQgfS8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZmllbGRzZXQgY2xhc3NOYW1lPSdyYWRpYXRpb24taW5wdXQgY29sLXhzLTgnIGRpc2FibGVkPXshIHNob3dBZGRUb1RvdGFsSW5wdXQgfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aDM+TGVnZyB2ZXJkaSB0aWwgdG90YWw8L2gzPlxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGZvcm0gb25TdWJtaXQ9e3RoaXMuX2hhbmRsZUFkZFRvVG90YWxTdWJtaXR9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgcmVmPSdhZGQtdG8tdG90YWwtaW5wdXQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwibnVtYmVyXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ZXA9XCI1XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1pbj1cIjBcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF4PVwiNTBcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPSdyYWRpYXRpb24taW5wdXRfX2lucHV0J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9J2J0biBidG4tcHJpbWFyeSc+RXZhbHVlcjwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZmllbGRzZXQ+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG5cbn0pO1xuIiwiY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpLFxuICAgIFJvdXRlciA9IHJlcXVpcmUoJ3JlYWN0LXJvdXRlcicpLFxuICAgIE1lc3NhZ2VTdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3Jlcy9tZXNzYWdlLXN0b3JlJyksXG4gICAgVGFza1N0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL3Rhc2stc3RvcmUnKSxcbiAgICBSb3V0ZVN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL3JvdXRlLXN0b3JlJyksXG4gICAgTWVzc2FnZUxpc3QgPSByZXF1aXJlKCcuL21lc3NhZ2UtbGlzdC5yZWFjdCcpLFxuICAgIEludHJvZHVjdGlvblNjcmVlbiA9IHJlcXVpcmUoJy4vaW50cm9kdWN0aW9uLXNjcmVlbi5yZWFjdC5qcycpLFxuICAgIFRlYW1EaXNwbGF5ZXIgPSByZXF1aXJlKCcuL3RlYW0tZGlzcGxheWVyLnJlYWN0JyksXG4gICAgTWlzc2lvblRpbWVyID0gcmVxdWlyZSgnLi9taXNzaW9uLXRpbWVyLnJlYWN0LmpzJyksXG4gICAgU2NpZW5jZVRhc2sgPSByZXF1aXJlKCcuL3NjaWVuY2UtdGFzay5yZWFjdCcpLFxuICAgIHsgZm9ybWF0IH0gPSByZXF1aXJlKCd1dGlsJyk7XG5cblxuZnVuY3Rpb24gdXJsT2ZUYXNrKHRhc2tJZCkge1xuICAgIHJldHVybiBmb3JtYXQoJy8lcy90YXNrLyVzJywgUm91dGVTdG9yZS5nZXRUZWFtSWQoKSwgdGFza0lkKTtcbn1cblxuZnVuY3Rpb24gdHJhbnNpdGlvblRvQ3VycmVudFRhc2sodHJhbnNpdGlvbkZ1bmN0aW9uKSB7XG4gICAgdmFyIGN1cnJlbnRUYXNrSWQgPSBUYXNrU3RvcmUuZ2V0Q3VycmVudFRhc2tJZCgpO1xuXG4gICAgLy8gdGhpcyBsb2dpYyBpcyBmcmFnaWxlIC0gaWYgeW91IHNob3VsZCBzdWRkZW5seSBkZWNpZGUgdG8gdmlzaXQgYW5vdGhlciB0ZWFtXG4gICAgLy8gX2FmdGVyXyB5b3UgaGF2ZSBzdGFydGVkIGEgdGFzaywgdGhlIHRlYW0rdGFzayBjb21ibyBpcyBpbnZhbGlkIC0+IDQwNFxuICAgIGlmIChjdXJyZW50VGFza0lkICE9PSBSb3V0ZVN0b3JlLmdldFRhc2tJZCgpKSB7XG4gICAgICAgIHZhciB0byA9IHVybE9mVGFzayhjdXJyZW50VGFza0lkKTtcbiAgICAgICAgdHJhbnNpdGlvbkZ1bmN0aW9uKHRvKTtcbiAgICB9XG5cbn1cblxuY29uc3QgVGFzayA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIGNvbnRleHRUeXBlczoge1xuICAgICAgICByb3V0ZXI6IFJlYWN0LlByb3BUeXBlcy5mdW5jXG4gICAgfSxcblxuICAgIG1peGluczogW10sXG5cbiAgICBzdGF0aWNzOiB7XG4gICAgICAgIHdpbGxUcmFuc2l0aW9uVG8odHJhbnNpdGlvbikge1xuICAgICAgICAgICAgdHJhbnNpdGlvblRvQ3VycmVudFRhc2sodHJhbnNpdGlvbi5yZWRpcmVjdC5iaW5kKHRyYW5zaXRpb24pKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgTWVzc2FnZVN0b3JlLmFkZENoYW5nZUxpc3RlbmVyKHRoaXMuX29uQ2hhbmdlKTtcbiAgICAgICAgVGFza1N0b3JlLmFkZENoYW5nZUxpc3RlbmVyKHRoaXMuX29uQ2hhbmdlKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZygnY29tcG9uZW50V2lsbE1vdW50Jyk7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vY29uc29sZS5sb2coJ2NvbXBvbmVudFdpbGxVbm1vdW50Jyk7XG4gICAgICAgIE1lc3NhZ2VTdG9yZS5yZW1vdmVDaGFuZ2VMaXN0ZW5lcih0aGlzLl9vbkNoYW5nZSk7XG4gICAgICAgIFRhc2tTdG9yZS5yZW1vdmVDaGFuZ2VMaXN0ZW5lcih0aGlzLl9vbkNoYW5nZSk7XG5cbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3N0YXRlVGltZW91dCk7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZFVubW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy9jb25zb2xlLmxvZygnY29tcG9uZW50RGlkVW5tb3VudCcpO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRVcGRhdGUoKSB7XG4gICAgICAgIC8vY29uc29sZS5sb2coJy5jb21wb25lbnREaWRVcGRhdGUnKTtcbiAgICB9LFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlKCkge1xuXG4gICAgICAgIHNldFRpbWVvdXQoKCk9PiB0aGlzLnNldFN0YXRlKHt0YXNrSXNOZXc6IGZhbHNlfSksIDIwMDApO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBtZXNzYWdlczogTWVzc2FnZVN0b3JlLmdldE1lc3NhZ2VzKCksXG4gICAgICAgICAgICB0YXNrU3RvcmU6IFRhc2tTdG9yZS5nZXRTdGF0ZSgpLFxuICAgICAgICAgICAgdGFza0lzTmV3OiB0cnVlXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIF9vbkNoYW5nZSgpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBtZXNzYWdlczogTWVzc2FnZVN0b3JlLmdldE1lc3NhZ2VzKCksXG4gICAgICAgICAgICB0YXNrU3RvcmU6IFRhc2tTdG9yZS5nZXRTdGF0ZSgpLFxuICAgICAgICAgICAgdGFza0lzTmV3OiB0cnVlXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciByb3V0ZXIgPSB0aGlzLmNvbnRleHQucm91dGVyO1xuICAgICAgICB0cmFuc2l0aW9uVG9DdXJyZW50VGFzayhyb3V0ZXIudHJhbnNpdGlvblRvLmJpbmQocm91dGVyKSk7XG5cbiAgICAgICAgLy8gYSBiaXQgcnVkaW1lbnRhcnkgLSB0cmlnZ2VycyBvbiBhbGwgY2hhbmdlcywgbm90IGp1c3QgVGFzayBjaGFuZ2VzIC4uLlxuICAgICAgICB0aGlzLl9zdGF0ZVRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpPT4gdGhpcy5zZXRTdGF0ZSh7dGFza0lzTmV3OiBmYWxzZX0pLCAyMDAwKTtcbiAgICB9LFxuXG4gICAgX2NyZWF0ZVN1YlRhc2tVSSgpIHtcbiAgICAgICAgcmV0dXJuICggPFNjaWVuY2VUYXNrIGFwcHN0YXRlPXt0aGlzLnN0YXRlfS8+KTtcbiAgICB9LFxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgY29udGVudCA9IHRoaXMuX2NyZWF0ZVN1YlRhc2tVSSgpLFxuICAgICAgICAgICAgYmxpbmsgPSB0aGlzLnN0YXRlLnRhc2tJc05ldyA/ICdibGluaycgOiAnJyxcbiAgICAgICAgICAgIHRlYW1OYW1lcywgbWlzc2lvblRpbWVyO1xuXG5cbiAgICAgICAgdGVhbU5hbWVzID0gKFxuICAgICAgICAgICAgPGRpdiBpZD0ndGVhbS1uYW1lJyBjbGFzc05hbWU9Jyc+XG4gICAgICAgICAgICAgICAgPGhlYWRlciBjbGFzc05hbWU9Jyc+XG4gICAgICAgICAgICAgICAgICAgIDxUZWFtRGlzcGxheWVyIGNsYXNzTmFtZT0nJy8+XG4gICAgICAgICAgICAgICAgPC9oZWFkZXI+XG4gICAgICAgICAgICA8L2Rpdj4pO1xuXG4gICAgICAgIG1pc3Npb25UaW1lciA9IChcbiAgICAgICAgICAgIDxzZWN0aW9uIGlkPSdtaXNzaW9uLXRpbWVyJyBjbGFzc05hbWU9Jyc+XG4gICAgICAgICAgICAgICAgPE1pc3Npb25UaW1lciAvPlxuICAgICAgICAgICAgPC9zZWN0aW9uPiApO1xuXG4gICAgICAgIGlmICghdGhpcy5wcm9wcy5pc01pc3Npb25SdW5uaW5nKSB7XG4gICAgICAgICAgICBsZXQgbWVzc2FnZSA9IHtcbiAgICAgICAgICAgICAgICBpZDogJ25vdF91c2VkJyxcbiAgICAgICAgICAgICAgICB0ZXh0OiAnSWtrZSBrbGFyLiBWZW50ZXIgcMOlIGF0IG9wcGRyYWdldCBza2FsIHN0YXJ0ZS4nLFxuICAgICAgICAgICAgICAgIGxldmVsOiAnaW5mbydcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgeyB0ZWFtTmFtZXMgfVxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJvd1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPE1lc3NhZ2VMaXN0IGNsYXNzTmFtZT0nY29sLXhzLTEyJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VzPXtbbWVzc2FnZV19Lz5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nJz5cbiAgICAgICAgICAgICAgICB7dGVhbU5hbWVzfVxuICAgICAgICAgICAgICAgIHttaXNzaW9uVGltZXJ9XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyb3dcIj5cbiAgICAgICAgICAgICAgICAgICAgPE1lc3NhZ2VMaXN0IGNsYXNzTmFtZT0nY29sLXhzLTEyJyBtZXNzYWdlcz17dGhpcy5zdGF0ZS5tZXNzYWdlc30vPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAgeyAvKiBpZiB5b3Ugd2FudCB0aGlzIHRvIGJlIHN0aWNreTogaHR0cDovL2NvZGVwZW4uaW8vc2VuZmYvcGVuL2F5R3ZEICovIH1cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJvd1wiPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImNvbC14cy0xMlwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J2p1bWJvdHJvbiB0YXNrYm94Jz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aDIgY2xhc3NOYW1lPSd0YXNrYm94X19oZWFkZXInPk9wcGdhdmU8L2gyPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17J3Rhc2tib3hfX3RleHQgJyArIGJsaW5rfT4ge3RoaXMuc3RhdGUudGFza1N0b3JlLmN1cnJlbnRUYXNrfSA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgICB7Y29udGVudH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVGFzaztcbiIsImNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbmNvbnN0IFJvdXRlU3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZXMvcm91dGUtc3RvcmUnKTtcbmNvbnN0IHRlYW1OYW1lcyA9IHJlcXVpcmUoJy4uL3RlYW0tbmFtZS1tYXAnKTtcblxuY29uc3QgVGVhbVdpZGdldCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIGNvbnRleHRUeXBlczoge1xuICAgICAgICByb3V0ZXI6IFJlYWN0LlByb3BUeXBlcy5mdW5jXG4gICAgfSxcblxuICAgIG1peGluczogW10sXG5cbiAgICBfb25DaGFuZ2UoKSB7XG4gICAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy9Sb3V0ZVN0b3JlLmFkZENoYW5nZUxpc3RlbmVyKHRoaXMuX29uQ2hhbmdlKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy9Sb3V0ZVN0b3JlLnJlbW92ZUNoYW5nZUxpc3RlbmVyKHRoaXMuX29uQ2hhbmdlKTtcblxuICAgIH0sXG5cbiAgICB0ZWFtTmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRlYW1OYW1lcy5uYW1lTWFwWyhSb3V0ZVN0b3JlLmdldFRlYW1JZCgpKV07XG4gICAgfSxcblxuICAgIG90aGVyVGVhbU5hbWVzKCkge1xuICAgICAgICByZXR1cm4gdGVhbU5hbWVzLm90aGVyVGVhbU5hbWVzKFJvdXRlU3RvcmUuZ2V0VGVhbUlkKCkpO1xuICAgIH0sXG5cbiAgICByZW5kZXIoKSB7XG5cbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWUgPSB7IHRoaXMucHJvcHMuY2xhc3NOYW1lICsgJyB0ZWFtd2lkZ2V0J30gPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWUgPSAnYWN0aXZlJyA+eyB0aGlzLnRlYW1OYW1lKCkgIH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZSA9ICcnPiwgeyB0aGlzLm90aGVyVGVhbU5hbWVzKCkgfSA8L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9kaXY+ICk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVGVhbVdpZGdldDtcbiIsInZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0JyksXG4gICAgYWN0aW9ucyA9IHJlcXVpcmUoJy4uL2FjdGlvbnMvVGltZXJBY3Rpb25DcmVhdG9ycycpLFxuICAgIFRpbWVyID0gcmVxdWlyZSgnLi90aW1lci5yZWFjdC5qcycpLFxuICAgIFRpbWVyU3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZXMvdGltZXItc3RvcmUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBwcm9wVHlwZXM6IHtcbiAgICAgICAgdGltZXJJZDogUmVhY3QuUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkXG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dldFRpbWVyU3RhdGUoKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgVGltZXJTdG9yZS5hZGRDaGFuZ2VMaXN0ZW5lcih0aGlzLl9oYW5kbGVUaW1lU3RvcmVDaGFuZ2UpO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgICBUaW1lclN0b3JlLnJlbW92ZUNoYW5nZUxpc3RlbmVyKHRoaXMuX2hhbmRsZVRpbWVTdG9yZUNoYW5nZSk7XG4gICAgfSxcblxuICAgIHNob3VsZENvbXBvbmVudFVwZGF0ZShuZXh0UHJvcHMsIG5leHRTdGF0ZSkge1xuICAgICAgICByZXR1cm4gbmV4dFN0YXRlLnRpbWVJblNlY29uZHMgIT09IHRoaXMuc3RhdGUudGltZUluU2Vjb25kcztcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkVXBkYXRlKCkge1xuICAgICAgICAvL2NvbnNvbGUubG9nKCdUaW1lclBhbmVsLmNvbXBvbmVudERpZFVwZGF0ZScpO1xuICAgIH0sXG5cbiAgICBfaGFuZGxlVGltZVN0b3JlQ2hhbmdlKCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHRoaXMuX2dldFRpbWVyU3RhdGUoKSk7XG4gICAgfSxcblxuICAgIF9oYW5kbGVDbGljaygpIHtcbiAgICAgICAgYWN0aW9ucy5zdGFydFRpbWVyKHRoaXMucHJvcHMudGltZXJJZCk7XG4gICAgfSxcblxuICAgIF9nZXRUaW1lclN0YXRlKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVhZHk6IFRpbWVyU3RvcmUuaXNSZWFkeVRvU3RhcnQodGhpcy5wcm9wcy50aW1lcklkKSxcbiAgICAgICAgICAgIHRpbWVJblNlY29uZHM6IFRpbWVyU3RvcmUuZ2V0UmVtYWluaW5nVGltZSh0aGlzLnByb3BzLnRpbWVySWQpXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT17XCJ0aW1lciBcIiArIHRoaXMucHJvcHMuY2xhc3NOYW1lIH0+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyb3dcIj5cblxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0ndGltZXItLWJ1dHRvbiBjb2wteHMtNSAnPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17ICdidG4gYnRuLXByaW1hcnknICsgKHRoaXMuc3RhdGUucmVhZHkgPyAnJyA6ICdkaXNhYmxlZCcgKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5faGFuZGxlQ2xpY2t9PlN0YXJ0IGtsb2trYVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0ndGltZXItLXZhbHVlIGNvbC14cy02IHBhZGRpbmcteHMtMSc+XG4gICAgICAgICAgICAgICAgICAgICAgICA8VGltZXIgdGltZUluU2Vjb25kcz17dGhpcy5zdGF0ZS50aW1lSW5TZWNvbmRzfS8+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgICApO1xuICAgIH1cbn0pIiwiLy8gVGhpcyBleGFtcGxlIGNhbiBiZSBtb2RpZmllZCB0byBhY3QgYXMgYSBjb3VudGRvd24gdGltZXJcblxuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0JyksXG4gICAgcHJpbnRmID0gcmVxdWlyZSgncHJpbnRmJyk7XG5cbmZ1bmN0aW9uIHBhZChudW0pIHtcbiAgICByZXR1cm4gcHJpbnRmKCclMDJkJywgbnVtKTtcbn1cblxuXG5jb25zdCBUaW1lciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIHByb3BUeXBlczoge1xuICAgICAgICB0aW1lSW5TZWNvbmRzOiBSZWFjdC5Qcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWRcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkVXBkYXRlKCkge1xuICAgICAgICAvL2NvbnNvbGUubG9nKCdUaW1lci5jb21wb25lbnREaWRVcGRhdGUnKTtcbiAgICB9LFxuXG4gICAgc2hvdWxkQ29tcG9uZW50VXBkYXRlKG5leHRQcm9wcywgbmV4dFN0YXRlKSB7XG4gICAgICAgIHJldHVybiBuZXh0UHJvcHMudGltZUluU2Vjb25kcyAhPT0gdGhpcy5wcm9wcy50aW1lSW5TZWNvbmRzO1xuICAgIH0sXG5cbiAgICBfbWludXRlcygpIHtcbiAgICAgICAgcmV0dXJuIHBhZChNYXRoLm1heCgwLCB0aGlzLnByb3BzLnRpbWVJblNlY29uZHMpIC8gNjAgPj4gMCk7XG4gICAgfSxcblxuICAgIF9zZWNvbmRzKCkge1xuICAgICAgICByZXR1cm4gcGFkKE1hdGgubWF4KDAsIHRoaXMucHJvcHMudGltZUluU2Vjb25kcykgJSA2MCk7XG4gICAgfSxcblxuICAgIF90aW1lVmFsdWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9taW51dGVzKCkgKyAnOicgKyB0aGlzLl9zZWNvbmRzKCk7XG4gICAgfSxcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdtaXNzaW9uLXRpbWVyLXZhbHVlJz4ge3RoaXMuX3RpbWVWYWx1ZSgpfTwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRpbWVyO1xuXG4iLCJtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5mcmVlemUoe1xuICAgIC8vIGV2ZW50c1xuICAgIE1FU1NBR0VfQURERUQ6ICdNRVNTQUdFX0FEREVEJyxcbiAgICBSRU1PVkVfTUVTU0FHRTogJ1JFTU9WRV9NRVNTQUdFJ1xufSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJ3JlYWN0L2xpYi9rZXlNaXJyb3InKSh7XG4gICAgTUlTU0lPTl9USU1FX1NZTkM6ICdNSVNTSU9OX1RJTUVfU1lOQycsXG4gICAgTUlTU0lPTl9TVEFSVEVEX0VWRU5UOiAnTUlTU0lPTl9TVEFSVEVEX0VWRU5UJyxcbiAgICBNSVNTSU9OX1NUT1BQRURfRVZFTlQ6ICdNSVNTSU9OX1NUT1BQRURfRVZFTlQnLFxuICAgIE1JU1NJT05fQ09NUExFVEVEX0VWRU5UOiAnTUlTU0lPTl9DT01QTEVURURfRVZFTlQnLFxuICAgIE1JU1NJT05fV0FTX1JFU0VUOiAnTUlTU0lPTl9XQVNfUkVTRVQnLFxuICAgIFJFQ0VJVkVEX0VWRU5UUzogbnVsbCxcbiAgICBJTlRST0RVQ1RJT05fUkVBRDogJ0lOVFJPRFVDVElPTl9SRUFEJyxcbiAgICBTVEFSVF9UQVNLOiAnU1RBUlRfVEFTSycsXG4gICAgQ09NUExFVEVEX1RBU0sgOiAnQ09NUExFVEVEX1RBU0snLFxuICAgIEFTS19GT1JfQVBQX1NUQVRFOiAnQVNLX0ZPUl9BUFBfU1RBVEUnLFxuICAgIFJFQ0VJVkVEX0FQUF9TVEFURTogJ1JFQ0VJVkVEX0FQUF9TVEFURScsXG4gICAgU0VORElOR19URUFNX1NUQVRFOiAnU0VORElOR19URUFNX1NUQVRFJ1xufSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5mcmVlemUoe1xuICAgIC8vIGV2ZW50c1xuICAgIFJPVVRFX0NIQU5HRURfRVZFTlQ6ICdST1VURV9DSEFOR0VEX0VWRU5UJyxcbiAgICBST1VURVJfQVZBSUxBQkxFOiAnUk9VVEVSX0FWQUlMQUJMRScsXG59KTtcbiIsIm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmZyZWV6ZSh7XG4gICAgLy8gaWRzXG4gICAgU0NJRU5DRV9USU1FUl8xOiAnU0NJRU5DRV9USU1FUl8xJyxcbiAgICBTQ0lFTkNFX1JBRElBVElPTl9XQVJOSU5HX01TRyA6ICdTQ0lFTkNFX1JBRElBVElPTl9XQVJOSU5HX01TRycsXG5cbiAgICBTQ0lFTkNFX0NMRUFSX1JBRElBVElPTl9TQU1QTEVTOidTQ0lFTkNFX0NMRUFSX1JBRElBVElPTl9TQU1QTEVTJyxcblxuICAgIC8vIGV2ZW50c1xuICAgIFNDSUVOQ0VfQ09VTlRET1dOX1RJTUVSX0NIQU5HRUQ6ICdTQ0lFTkNFX0NPVU5URE9XTl9USU1FUl9DSEFOR0VEJyxcbiAgICBTQ0lFTkNFX1RBS0VfUkFESUFUSU9OX1NBTVBMRTogJ1NDSUVOQ0VfVEFLRV9SQURJQVRJT05fU0FNUExFJyxcbiAgICBTQ0lFTkNFX1JBRElBVElPTl9MRVZFTF9DSEFOR0VEOiAnU0NJRU5DRV9SQURJQVRJT05fTEVWRUxfQ0hBTkdFRCcsXG4gICAgU0NJRU5DRV9UT1RBTF9SQURJQVRJT05fTEVWRUxfQ0hBTkdFRDogJ1NDSUVOQ0VfVE9UQUxfUkFESUFUSU9OX0xFVkVMX0NIQU5HRUQnLFxuICAgIFNDSUVOQ0VfQVZHX1JBRElBVElPTl9DQUxDVUxBVEVEOiAnU0NJRU5DRV9BVkdfUkFESUFUSU9OX0NBTENVTEFURUQnLFxuXG4gICAgLy8gdmFsdWVzXG4gICAgU0NJRU5DRV9SQURJQVRJT05fTUlOOiAwLFxuICAgIFNDSUVOQ0VfUkFESUFUSU9OX01BWDogMTAwLFxuICAgIFNDSUVOQ0VfQVZHX1JBRF9HUkVFTl9WQUxVRTogMCxcbiAgICBTQ0lFTkNFX0FWR19SQURfT1JBTkdFX1ZBTFVFOiAxNSxcbiAgICBTQ0lFTkNFX0FWR19SQURfUkVEX1ZBTFVFOiA1MCxcbiAgICBTQ0lFTkNFX0FWR19SQURfT1JBTkdFX1RIUkVTSE9MRDogNDAsXG4gICAgU0NJRU5DRV9BVkdfUkFEX1JFRF9USFJFU0hPTEQ6IDc1LFxuICAgIFNDSUVOQ0VfVE9UQUxfUkFESUFUSU9OX1NFUklPVVNfVEhSRVNIT0xEOiA1MCxcbiAgICBTQ0lFTkNFX1RPVEFMX1JBRElBVElPTl9WRVJZX1NFUklPVVNfVEhSRVNIT0xEOiA3NVxufSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBTRVRfVElNRVI6ICdTRVRfVElNRVInLFxuICAgIFNUQVJUX1RJTUVSOiAnU1RBUlRfVElNRVInLFxuICAgIFNUT1BfVElNRVI6ICdTVE9QX1RJTUVSJyxcbiAgICBSRVNFVF9USU1FUjogJ1JFU0VUX1RJTUVSJ1xufTtcblxuIiwiLy8gcHJveHkgYWNjZXNzIHRvIHRoZSByb3V0ZXIgYXMgZmlyc3Qgc3RlcCBpbiBicmluZ2luZyBpdCBpbnRvIHRoZSBmbHV4IGZsb3dcbi8vIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3JhY2t0L3JlYWN0LXJvdXRlci9ibG9iL21hc3Rlci9kb2NzL2d1aWRlcy9mbHV4Lm1kXG5cbnZhciByb3V0ZXIgPSBudWxsO1xuXG53aW5kb3cuX19yb3V0ZXIgPSBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICB0cmFuc2l0aW9uVG8odG8scGFyYW1zLHF1ZXJ5KSB7XG4gICAgICAgIHJldHVybiByb3V0ZXIudHJhbnNpdGlvblRvKHRvLHBhcmFtcyxxdWVyeSlcbiAgICB9LFxuXG4gICAgZ2V0Q3VycmVudFBhdGhuYW1lKCkge1xuICAgICAgICByZXR1cm4gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lO1xuICAgIH0sXG5cbiAgICBnZXRUZWFtSWQoKXtcbiAgICAgIHJldHVybiB0aGlzLmdldEN1cnJlbnRQYXRobmFtZSgpLnNwbGl0KCcvJylbMV07XG4gICAgfSxcblxuICAgIGdldFRhc2tJZCgpe1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRDdXJyZW50UGF0aG5hbWUoKS5zcGxpdCgnLycpWzNdO1xuICAgIH0sXG5cbiAgICBydW4oLi4uYXJncykge1xuICAgICAgICByZXR1cm4gcm91dGVyLnJ1biguLi5hcmdzKVxuICAgIH1cbn07XG5cbmNvbnN0IFJvdXRlciA9IHJlcXVpcmUoJ3JlYWN0LXJvdXRlcicpO1xuY29uc3Qgcm91dGVzID0gcmVxdWlyZSgnLi9yb3V0ZXMucmVhY3QnKTtcblxuLy8gQnkgdGhlIHRpbWUgcm91dGUgY29uZmlnIGlzIHJlcXVpcmUoKS1kLFxuLy8gcmVxdWlyZSgnLi9yb3V0ZXInKSBhbHJlYWR5IHJldHVybnMgYSB2YWxpZCBvYmplY3Rcblxucm91dGVyID0gUm91dGVyLmNyZWF0ZSh7XG4gICAgcm91dGVzOiByb3V0ZXMsXG5cbiAgICAvLyBVc2UgdGhlIEhUTUw1IEhpc3RvcnkgQVBJIGZvciBjbGVhbiBVUkxzXG4gICAgbG9jYXRpb246IFJvdXRlci5IaXN0b3J5TG9jYXRpb25cbn0pO1xuIiwiY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuY29uc3QgUm91dGVyID0gcmVxdWlyZSgncmVhY3Qtcm91dGVyJyk7XG5jb25zdCBSb3V0ZSA9IFJvdXRlci5Sb3V0ZTtcbmNvbnN0IE5vdEZvdW5kUm91dGUgPSBSb3V0ZXIuTm90Rm91bmRSb3V0ZTtcbmNvbnN0IERlZmF1bHRSb3V0ZSA9IFJvdXRlci5EZWZhdWx0Um91dGU7XG5cbmNvbnN0IEFwcCA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9hcHAucmVhY3QnKTtcbmNvbnN0IE1pc3Npb25Db21tYW5kZXJBcHAgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvY29tbWFuZGVyLWFwcC5yZWFjdCcpO1xuY29uc3QgSW5kZXhBcHAgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvaW5kZXgtYXBwLnJlYWN0Jyk7XG5jb25zdCBOb3RGb3VuZCA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9ub3QtZm91bmQucmVhY3QnKTtcbmNvbnN0IEludHJvU2NyZWVuID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL2ludHJvZHVjdGlvbi1zY3JlZW4ucmVhY3QnKTtcbmNvbnN0IFRhc2sgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvdGFzay5yZWFjdCcpO1xuY29uc3QgRHVtbXlSZW5kZXJNaXhpbiA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9kdW1teS1yZW5kZXIubWl4aW4nKTtcblxuY29uc3QgUmVkaXJlY3RUb0ludHJvID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgc3RhdGljczoge1xuICAgICAgICB3aWxsVHJhbnNpdGlvblRvKHRyYW5zaXRpb24pIHtcbiAgICAgICAgICAgICAgICB0cmFuc2l0aW9uLnJlZGlyZWN0KHRyYW5zaXRpb24ucGF0aCArICcvaW50cm8nKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBtaXhpbnMgOiBbRHVtbXlSZW5kZXJNaXhpbl1cbn0pO1xuXG5jb25zdCByb3V0ZXMgPSAoXG4gICAgPFJvdXRlIG5hbWU9XCJhcHBcIiBwYXRoPVwiL1wiIGhhbmRsZXI9e0FwcH0+XG5cbiAgICAgICAgPFJvdXRlIG5hbWU9XCJsZWFkZXJcIiBoYW5kbGVyPXtNaXNzaW9uQ29tbWFuZGVyQXBwfS8+XG4gICAgICAgIDxSb3V0ZSBuYW1lPVwidGVhbS1yb290XCIgcGF0aD0nLzp0ZWFtSWQnIGhhbmRsZXI9e1JlZGlyZWN0VG9JbnRyb30gLz5cbiAgICAgICAgPFJvdXRlIG5hbWU9XCJ0ZWFtLWludHJvXCIgcGF0aD0nLzp0ZWFtSWQvaW50cm8nIGhhbmRsZXI9e0ludHJvU2NyZWVufSAvPlxuICAgICAgICA8Um91dGUgbmFtZT1cInRlYW0tdGFza1wiIHBhdGg9Jy86dGVhbUlkL3Rhc2svOnRhc2tJZCcgaGFuZGxlcj17VGFza30gLz5cblxuICAgICAgICA8Tm90Rm91bmRSb3V0ZSBoYW5kbGVyPXtOb3RGb3VuZH0vPlxuICAgICAgICA8RGVmYXVsdFJvdXRlIGhhbmRsZXI9e0luZGV4QXBwfS8+XG4gICAgPC9Sb3V0ZT5cbik7XG5cbm1vZHVsZS5leHBvcnRzID0gcm91dGVzO1xuIiwiY29uc3QgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRzJyk7XG5jb25zdCAgQ0hBTkdFX0VWRU5UPSAnQ0hBTkdFX0VWRU5UJztcblxudmFyIHBhdGggPSBudWxsO1xuXG5jbGFzcyBCYXNlU3RvcmUgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuXG4gICAgZW1pdENoYW5nZSgpIHtcbiAgICAgICAgdGhpcy5lbWl0KENIQU5HRV9FVkVOVCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2tcbiAgICAgKiBAcmV0dXJucyBlbWl0dGVyLCBzbyBjYWxscyBjYW4gYmUgY2hhaW5lZC5cbiAgICAgKi9cbiAgICBhZGRDaGFuZ2VMaXN0ZW5lcihjYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gdGhpcy5vbihDSEFOR0VfRVZFTlQsIGNhbGxiYWNrKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFja1xuICAgICAqIEByZXR1cm5zIGVtaXR0ZXIsIHNvIGNhbGxzIGNhbiBiZSBjaGFpbmVkLlxuICAgICAqL1xuICAgIHJlbW92ZUNoYW5nZUxpc3RlbmVyKGNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlbW92ZUxpc3RlbmVyKENIQU5HRV9FVkVOVCwgY2FsbGJhY2spO1xuICAgIH1cblxuICAgIGRpc3BhdGNoZXJJbmRleDpOdW1iZXI7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZVN0b3JlO1xuIiwiY29uc3QgRGlzcGF0Y2hlciA9IHJlcXVpcmUoJy4uL2FwcGRpc3BhdGNoZXInKTtcbmNvbnN0IE1Db25zdGFudHMgPSByZXF1aXJlKCcuLi9jb25zdGFudHMvTWlzc2lvbkNvbnN0YW50cycpO1xuY29uc3QgQmFzZVN0b3JlID0gcmVxdWlyZSgnLi9iYXNlLXN0b3JlJyk7XG5cbnZhciBldmVudHNDb2xsZWN0aW9uID0ge1xuICAgIHJlbWFpbmluZzogW10sXG4gICAgY29tcGxldGVkOiBbXSxcbiAgICBvdmVyZHVlOiBbXVxufTtcblxuY29uc3QgRXZlbnRTdG9yZSA9IG1vZHVsZS5leHBvcnRzID0gd2luZG93Ll9fZXZlbnRTdG9yZSA9IE9iamVjdC5hc3NpZ24obmV3IEJhc2VTdG9yZSwge1xuXG4gICAgcmVtYWluaW5nKCkgeyByZXR1cm4gZXZlbnRzQ29sbGVjdGlvbi5yZW1haW5pbmc7IH0sXG5cbiAgICBjb21wbGV0ZWQoKSB7IHJldHVybiBldmVudHNDb2xsZWN0aW9uLmNvbXBsZXRlZDsgfSxcblxuICAgIG92ZXJkdWUoKSB7IHJldHVybiBldmVudHNDb2xsZWN0aW9uLm92ZXJkdWU7IH0sXG5cbiAgICBkaXNwYXRjaGVySW5kZXg6IERpc3BhdGNoZXIucmVnaXN0ZXIoKHBheWxvYWQpID0+IHtcblxuICAgICAgICBzd2l0Y2gocGF5bG9hZC5hY3Rpb24pe1xuXG4gICAgICAgICAgICBjYXNlIE1Db25zdGFudHMuUkVDRUlWRURfRVZFTlRTOlxuICAgICAgICAgICAgICAgIGV2ZW50c0NvbGxlY3Rpb24ucmVtYWluaW5nID0gcGF5bG9hZC5yZW1haW5pbmc7XG4gICAgICAgICAgICAgICAgZXZlbnRzQ29sbGVjdGlvbi5vdmVyZHVlID0gcGF5bG9hZC5vdmVyZHVlO1xuICAgICAgICAgICAgICAgIGV2ZW50c0NvbGxlY3Rpb24uY29tcGxldGVkID0gcGF5bG9hZC5jb21wbGV0ZWQ7XG4gICAgICAgICAgICAgICAgRXZlbnRTdG9yZS5lbWl0Q2hhbmdlKCk7XG5cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0pXG59KTtcblxuXG4vL3dpbmRvdy5fX2V2ZW50U3RvcmUgPSBtb2R1bGUuZXhwb3J0cztcbiIsIi8qIEhvbGRzIHRoZSBzdGF0ZSBvZiB3aGV0aGVyIGludHJvZHVjdGlvbnMgaGF2ZSBiZWVuIHJlYWQgKi9cblxuY29uc3QgQXBwRGlzcGF0Y2hlciA9IHJlcXVpcmUoJy4uL2FwcGRpc3BhdGNoZXInKTtcbmNvbnN0IEJhc2VTdG9yZSA9IHJlcXVpcmUoJy4vYmFzZS1zdG9yZScpO1xuY29uc3QgY29uc3RhbnRzID0gcmVxdWlyZSgnLi4vY29uc3RhbnRzL01pc3Npb25Db25zdGFudHMnKTtcbmNvbnN0IHdpbmRvdyA9IHJlcXVpcmUoJ2dsb2JhbC93aW5kb3cnKTtcbnZhciBpbnRyb1JlYWQgPSB7fTtcblxuY29uc3QgSW50cm9kdWN0aW9uU3RvcmUgPSBPYmplY3QuYXNzaWduKG5ldyBCYXNlU3RvcmUoKSwge1xuXG4gICAgc2V0SW50cm9kdWN0aW9uUmVhZCh0ZWFtKSB7XG4gICAgICAgIGludHJvUmVhZFsnaW50cm9fJyt0ZWFtXSA9IHRydWU7XG4gICAgICAgIHRoaXMuZW1pdENoYW5nZSgpO1xuICAgIH0sXG5cbiAgICBpc0ludHJvZHVjdGlvblJlYWQodGVhbSkge1xuICAgICAgICBpZighdGVhbSkgeyB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgYXJndW1lbnQgXCJ0ZWFtXCInKTsgfVxuXG4gICAgICAgIHJldHVybiBpbnRyb1JlYWRbJ2ludHJvXycrdGVhbV07XG4gICAgfSxcblxuXG4gICAgZGlzcGF0Y2hlckluZGV4OiBBcHBEaXNwYXRjaGVyLnJlZ2lzdGVyKGZ1bmN0aW9uIChwYXlsb2FkKSB7XG4gICAgICAgIHZhciBhY3Rpb24gPSBwYXlsb2FkLmFjdGlvbjtcblxuICAgICAgICBzd2l0Y2ggKGFjdGlvbikge1xuICAgICAgICAgICAgY2FzZSBjb25zdGFudHMuSU5UUk9EVUNUSU9OX1JFQUQ6XG4gICAgICAgICAgICAgICAgSW50cm9kdWN0aW9uU3RvcmUuc2V0SW50cm9kdWN0aW9uUmVhZChwYXlsb2FkLnRlYW1OYW1lKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlOyAvLyBObyBlcnJvcnMuIE5lZWRlZCBieSBwcm9taXNlIGluIERpc3BhdGNoZXIuXG4gICAgfSlcblxufSk7XG5cbndpbmRvdy5fX0ludHJvZHVjdGlvblN0b3JlPSBJbnRyb2R1Y3Rpb25TdG9yZTtcbm1vZHVsZS5leHBvcnRzID0gSW50cm9kdWN0aW9uU3RvcmU7XG4iLCIvKiBBIHN0b3JlIHRoYXQgY2FuIGJlIHF1ZXJpZWQgZm9yIHRoZSBjdXJyZW50IHBhdGggKi9cblxuY29uc3QgeyBFbWl0dGVyIH0gPSByZXF1aXJlKCdldmVudHMnKTtcbmNvbnN0IEFwcERpc3BhdGNoZXIgPSByZXF1aXJlKCcuLi9hcHBkaXNwYXRjaGVyJyk7XG5jb25zdCBCYXNlU3RvcmUgPSByZXF1aXJlKCcuL2Jhc2Utc3RvcmUnKTtcbmNvbnN0IHsgUkVNT1ZFX01FU1NBR0UsIE1FU1NBR0VfQURERUQgfSA9IHJlcXVpcmUoJy4uL2NvbnN0YW50cy9NZXNzYWdlQ29uc3RhbnRzJyk7XG52YXIgbWVzc2FnZXMgPSB7fTtcblxuXG52YXIgTWVzc2FnZVN0b3JlID0gT2JqZWN0LmFzc2lnbihuZXcgQmFzZVN0b3JlKCksIHtcblxuICAgIHJlc2V0KCkge1xuICAgICAgICBtZXNzYWdlcyA9IHt9O1xuICAgICAgICB0aGlzLmVtaXRDaGFuZ2UoKTtcbiAgICB9LFxuXG4gICAgaGFuZGxlQWRkZWRNZXNzYWdlKGRhdGEpIHtcbiAgICAgICAgZGF0YS5kaXNtaXNzYWJsZSA9IGRhdGEuZGlzbWlzc2FibGUgPT09IHVuZGVmaW5lZCA/IHRydWUgOiBkYXRhLmRpc21pc3NhYmxlO1xuICAgICAgICBtZXNzYWdlc1tkYXRhLmlkXSA9IGRhdGE7XG4gICAgICAgIHRoaXMuZW1pdENoYW5nZSgpO1xuICAgIH0sXG5cbiAgICBoYW5kbGVSZW1vdmVNZXNzYWdlKGlkKSB7XG4gICAgICAgIGRlbGV0ZSBtZXNzYWdlc1tpZF07XG4gICAgICAgIHRoaXMuZW1pdENoYW5nZSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBIGxpc3Qgb2YgYWxsIG1lc3NhZ2VzIG1hdGNoaW5nIGZpbHRlclxuICAgICAqIEBwYXJhbSBbZmlsdGVyXVxuICAgICAqIEByZXR1cm5zIFtdTWVzc2FnZSBhIE1lc3NhZ2UgPSB7IHRleHQsIGlkLCBsZXZlbCB9XG4gICAgICovXG4gICAgZ2V0TWVzc2FnZXMoZmlsdGVyKSB7XG4gICAgICAgIGlmICghZmlsdGVyKSB7XG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0LmtleXMobWVzc2FnZXMpLm1hcCgobXNnS2V5KT0+ICBtZXNzYWdlc1ttc2dLZXldKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHRocm93IG5ldyBFcnJvcignVU5JTVBMRU1FTlRFRCBcImZpbHRlclwiIGZlYXR1cmUnKTtcbiAgICB9LFxuXG4gICAgZGlzcGF0Y2hlckluZGV4OiBBcHBEaXNwYXRjaGVyLnJlZ2lzdGVyKGZ1bmN0aW9uIChwYXlsb2FkKSB7XG4gICAgICAgIHZhciB7IGFjdGlvbiwgZGF0YSB9ID0gcGF5bG9hZDtcblxuICAgICAgICBzd2l0Y2ggKGFjdGlvbikge1xuICAgICAgICAgICAgY2FzZSBNRVNTQUdFX0FEREVEOlxuICAgICAgICAgICAgICAgIE1lc3NhZ2VTdG9yZS5oYW5kbGVBZGRlZE1lc3NhZ2UoZGF0YSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFJFTU9WRV9NRVNTQUdFOlxuICAgICAgICAgICAgICAgIE1lc3NhZ2VTdG9yZS5oYW5kbGVSZW1vdmVNZXNzYWdlKGRhdGEpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRydWU7IC8vIE5vIGVycm9ycy4gTmVlZGVkIGJ5IHByb21pc2UgaW4gRGlzcGF0Y2hlci5cbiAgICB9KVxuXG59KTtcblxud2luZG93Ll9fTWVzc2FnZVN0b3JlID0gTWVzc2FnZVN0b3JlO1xubW9kdWxlLmV4cG9ydHMgPSBNZXNzYWdlU3RvcmU7XG4iLCIvKiBBIHN0b3JlIHRoYXQgY2FuIGJlIHF1ZXJpZWQgZm9yIHRoZSBjdXJyZW50IHBhdGggKi9cblxuY29uc3QgeyBFbWl0dGVyIH0gPSByZXF1aXJlKCdldmVudHMnKTtcbmNvbnN0IEFwcERpc3BhdGNoZXIgPSByZXF1aXJlKCcuLi9hcHBkaXNwYXRjaGVyJyk7XG5jb25zdCBCYXNlU3RvcmUgPSByZXF1aXJlKCcuL2Jhc2Utc3RvcmUnKTtcbmNvbnN0IHsgTUlTU0lPTl9TVEFSVEVEX0VWRU5ULE1JU1NJT05fU1RPUFBFRF9FVkVOVCwgUkVDRUlWRURfQVBQX1NUQVRFIH0gPSAgcmVxdWlyZSgnLi4vY29uc3RhbnRzL01pc3Npb25Db25zdGFudHMnKTtcblxudmFyIG1pc3Npb25SdW5uaW5nID0gZmFsc2UsIG1pc3Npb25IYXNCZWVuU3RvcHBlZCA9IGZhbHNlO1xuXG52YXIgTWlzc2lvblN0YXRlU3RvcmUgPSBPYmplY3QuYXNzaWduKG5ldyBCYXNlU3RvcmUoKSwge1xuXG4gICAgaGFuZGxlTWlzc2lvblN0YXJ0ZWQoKSB7XG4gICAgICAgIG1pc3Npb25SdW5uaW5nID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5lbWl0Q2hhbmdlKCk7XG4gICAgfSxcblxuICAgIGhhbmRsZU1pc3Npb25TdG9wcGVkKCkge1xuICAgICAgICBtaXNzaW9uUnVubmluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmVtaXRDaGFuZ2UoKTtcbiAgICB9LFxuXG4gICAgaXNNaXNzaW9uUnVubmluZygpIHtcbiAgICAgICAgcmV0dXJuIG1pc3Npb25SdW5uaW5nO1xuICAgIH0sXG5cbiAgICBpc01pc3Npb25TdG9wcGVkKCkge1xuICAgICAgICByZXR1cm4gbWlzc2lvbkhhc0JlZW5TdG9wcGVkO1xuICAgIH0sXG5cbiAgICBkaXNwYXRjaGVySW5kZXg6IEFwcERpc3BhdGNoZXIucmVnaXN0ZXIoZnVuY3Rpb24gKHBheWxvYWQpIHtcbiAgICAgICAgdmFyIHsgYWN0aW9ufSA9IHBheWxvYWQ7XG5cbiAgICAgICAgc3dpdGNoIChhY3Rpb24pIHtcbiAgICAgICAgICAgIGNhc2UgTUlTU0lPTl9TVEFSVEVEX0VWRU5UOlxuICAgICAgICAgICAgICAgIHJldHVybiBNaXNzaW9uU3RhdGVTdG9yZS5oYW5kbGVNaXNzaW9uU3RhcnRlZCgpO1xuXG4gICAgICAgICAgICBjYXNlIE1JU1NJT05fU1RPUFBFRF9FVkVOVDpcbiAgICAgICAgICAgICAgICByZXR1cm4gTWlzc2lvblN0YXRlU3RvcmUuaGFuZGxlTWlzc2lvblN0b3BwZWQoKTtcblxuICAgICAgICAgICAgY2FzZSBSRUNFSVZFRF9BUFBfU1RBVEU6XG4gICAgICAgICAgICAgICAgbWlzc2lvblJ1bm5pbmcgPSBwYXlsb2FkLmFwcFN0YXRlLm1pc3Npb25fcnVubmluZztcbiAgICAgICAgICAgICAgICByZXR1cm4gTWlzc2lvblN0YXRlU3RvcmUuZW1pdENoYW5nZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRydWU7IC8vIE5vIGVycm9ycy4gTmVlZGVkIGJ5IHByb21pc2UgaW4gRGlzcGF0Y2hlci5cbiAgICB9KVxuXG59KTtcblxud2luZG93Ll9fTWlzc2lvblN0YXRlU3RvcmUgPSBNaXNzaW9uU3RhdGVTdG9yZTtcbm1vZHVsZS5leHBvcnRzID0gTWlzc2lvblN0YXRlU3RvcmU7XG4iLCIvKiBBIHNpbmdsZXRvbiBzdG9yZSB0aGF0IGNhbiBiZSBxdWVyaWVkIGZvciByZW1haW5pbmcgdGltZSAqL1xuXG5jb25zdCBBcHBEaXNwYXRjaGVyID0gcmVxdWlyZSgnLi4vYXBwZGlzcGF0Y2hlcicpO1xuY29uc3QgQmFzZVN0b3JlID0gcmVxdWlyZSgnLi9iYXNlLXN0b3JlJyk7XG5jb25zdCBTY2llbmNlVGVhbUNvbnN0YW50cyA9IHJlcXVpcmUoJy4uL2NvbnN0YW50cy9TY2llbmNlVGVhbUNvbnN0YW50cycpO1xuY29uc3QgTWlzc2lvbkNvbnN0YW50cyA9IHJlcXVpcmUoJy4uL2NvbnN0YW50cy9NaXNzaW9uQ29uc3RhbnRzJyk7XG5jb25zdCByYW5kb21JbnQgPSByZXF1aXJlKCcuLi91dGlscycpLnJhbmRvbUludDtcbmNvbnN0IHJhZGlhdGlvblJhbmdlID0ge1xuICAgIG1pbjogMjAsXG4gICAgbWF4OiA0MFxufTtcbnZhciBzYW1wbGVzID0gW107XG52YXIgdG90YWxSYWRpYXRpb24gPSAwO1xudmFyIGxhc3RDYWxjdWxhdGVkQXZlcmFnZSA9IG51bGw7XG5cbmNvbnN0IFJhZGlhdGlvblN0b3JlID0gT2JqZWN0LmFzc2lnbihuZXcgQmFzZVN0b3JlKCksIHtcblxuICAgIF9zZXRSYWRpYXRpb25MZXZlbChtaW4sIG1heCkge1xuICAgICAgICByYWRpYXRpb25SYW5nZS5taW4gPSBtaW47XG4gICAgICAgIHJhZGlhdGlvblJhbmdlLm1heCA9IG1heDtcbiAgICAgICAgdGhpcy5lbWl0Q2hhbmdlKCk7XG4gICAgfSxcblxuICAgIF9jbGVhclNhbXBsZXMoKSB7XG4gICAgICAgIHNhbXBsZXMgPSBbXTtcbiAgICAgICAgdGhpcy5lbWl0Q2hhbmdlKCk7XG4gICAgfSxcblxuICAgIF90YWtlU2FtcGxlKCkge1xuICAgICAgICBzYW1wbGVzLnB1c2godGhpcy5nZXRMZXZlbCgpKTtcbiAgICAgICAgdGhpcy5lbWl0Q2hhbmdlKCk7XG4gICAgfSxcblxuICAgIGdldExldmVsKCkge1xuICAgICAgICByZXR1cm4gcmFuZG9tSW50KHJhZGlhdGlvblJhbmdlLm1pbiwgcmFkaWF0aW9uUmFuZ2UubWF4KTtcbiAgICB9LFxuXG4gICAgZ2V0VG90YWxMZXZlbCgpIHtcbiAgICAgICAgcmV0dXJuIHRvdGFsUmFkaWF0aW9uO1xuICAgIH0sXG5cbiAgICBnZXRTYW1wbGVzKCkge1xuICAgICAgICByZXR1cm4gc2FtcGxlcy5zbGljZSgpO1xuICAgIH0sXG5cbiAgICBnZXRTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHNhbXBsZXM6IHNhbXBsZXMuc2xpY2UoMCksXG4gICAgICAgICAgICB0b3RhbDogdG90YWxSYWRpYXRpb24sXG4gICAgICAgICAgICBjdXJyZW50TGV2ZWw6IHRoaXMuZ2V0TGV2ZWwoKSxcbiAgICAgICAgICAgIGxhc3RDYWxjdWxhdGVkQXZlcmFnZTogbGFzdENhbGN1bGF0ZWRBdmVyYWdlXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgZGlzcGF0Y2hlckluZGV4OiBBcHBEaXNwYXRjaGVyLnJlZ2lzdGVyKGZ1bmN0aW9uIChwYXlsb2FkKSB7XG4gICAgICAgIHZhciB7IGFjdGlvbiwgZGF0YX0gPSBwYXlsb2FkO1xuXG4gICAgICAgIHN3aXRjaCAoYWN0aW9uKSB7XG4gICAgICAgICAgICBjYXNlIFNjaWVuY2VUZWFtQ29uc3RhbnRzLlNDSUVOQ0VfUkFESUFUSU9OX0xFVkVMX0NIQU5HRUQ6XG4gICAgICAgICAgICAgICAgUmFkaWF0aW9uU3RvcmUuX3NldFJhZGlhdGlvbkxldmVsKGRhdGEubWluLCBkYXRhLm1heCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFNjaWVuY2VUZWFtQ29uc3RhbnRzLlNDSUVOQ0VfVE9UQUxfUkFESUFUSU9OX0xFVkVMX0NIQU5HRUQ6XG4gICAgICAgICAgICAgICAgdG90YWxSYWRpYXRpb24gPSBkYXRhLnRvdGFsO1xuICAgICAgICAgICAgICAgIFJhZGlhdGlvblN0b3JlLmVtaXRDaGFuZ2UoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSBTY2llbmNlVGVhbUNvbnN0YW50cy5TQ0lFTkNFX1RBS0VfUkFESUFUSU9OX1NBTVBMRTpcbiAgICAgICAgICAgICAgICBSYWRpYXRpb25TdG9yZS5fdGFrZVNhbXBsZSgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBTY2llbmNlVGVhbUNvbnN0YW50cy5TQ0lFTkNFX0FWR19SQURJQVRJT05fQ0FMQ1VMQVRFRDpcbiAgICAgICAgICAgICAgICBsYXN0Q2FsY3VsYXRlZEF2ZXJhZ2UgPSBkYXRhLmF2ZXJhZ2U7XG4gICAgICAgICAgICAgICAgUmFkaWF0aW9uU3RvcmUuZW1pdENoYW5nZSgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBTY2llbmNlVGVhbUNvbnN0YW50cy5TQ0lFTkNFX0NMRUFSX1JBRElBVElPTl9TQU1QTEVTOlxuICAgICAgICAgICAgICAgIHNhbXBsZXMgPSBbXTtcbiAgICAgICAgICAgICAgICBSYWRpYXRpb25TdG9yZS5lbWl0Q2hhbmdlKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIE1pc3Npb25Db25zdGFudHMuUkVDRUlWRURfQVBQX1NUQVRFOlxuICAgICAgICAgICAgICAgIGxldCBhcHBTdGF0ZSA9IHBheWxvYWQuYXBwU3RhdGU7XG5cbiAgICAgICAgICAgICAgICBpZihhcHBTdGF0ZS5zY2llbmNlICYmIGFwcFN0YXRlLnNjaWVuY2UucmFkaWF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCByYWRpYXRpb24gPSBhcHBTdGF0ZS5zY2llbmNlLnJhZGlhdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgc2FtcGxlcyA9IHJhZGlhdGlvbi5zYW1wbGVzO1xuICAgICAgICAgICAgICAgICAgICBsYXN0Q2FsY3VsYXRlZEF2ZXJhZ2UgPSByYWRpYXRpb24ubGFzdENhbGN1bGF0ZWRBdmVyYWdlO1xuICAgICAgICAgICAgICAgICAgICB0b3RhbFJhZGlhdGlvbiA9IHJhZGlhdGlvbi50b3RhbDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBSYWRpYXRpb25TdG9yZS5lbWl0Q2hhbmdlKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIE1pc3Npb25Db25zdGFudHMuTUlTU0lPTl9XQVNfUkVTRVQ6XG4gICAgICAgICAgICAgICAgc2FtcGxlcyA9IFtdO1xuICAgICAgICAgICAgICAgIGxhc3RDYWxjdWxhdGVkQXZlcmFnZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgdG90YWxSYWRpYXRpb24gPSAwO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRydWU7IC8vIE5vIGVycm9ycy4gTmVlZGVkIGJ5IHByb21pc2UgaW4gRGlzcGF0Y2hlci5cbiAgICB9KVxuXG59KTtcblxud2luZG93Ll9fUmFkaWF0aW9uU3RvcmUgPSBSYWRpYXRpb25TdG9yZTtcbm1vZHVsZS5leHBvcnRzID0gUmFkaWF0aW9uU3RvcmU7XG4iLCIvKiBBIHN0b3JlIHRoYXQgY2FuIGJlIHF1ZXJpZWQgZm9yIHRoZSBjdXJyZW50IHBhdGggKi9cblxuY29uc3QgQXBwRGlzcGF0Y2hlciA9IHJlcXVpcmUoJy4uL2FwcGRpc3BhdGNoZXInKTtcbmNvbnN0IEJhc2VTdG9yZSA9IHJlcXVpcmUoJy4vYmFzZS1zdG9yZScpO1xuY29uc3QgeyBST1VURV9DSEFOR0VEX0VWRU5UIH0gPSByZXF1aXJlKCcuLi9jb25zdGFudHMvUm91dGVyQ29uc3RhbnRzJyk7XG5jb25zdCB7IGNsZWFuUm9vdFBhdGggfT0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxudmFyIHJvdXRlciA9IHJlcXVpcmUoJy4uL3JvdXRlci1jb250YWluZXInKVxuXG52YXIgUm91dGVTdG9yZSA9IE9iamVjdC5hc3NpZ24obmV3IEJhc2VTdG9yZSgpLCB7XG5cbiAgICBoYW5kbGVSb3V0ZUNoYW5nZWQoc3RhdGUpIHtcbiAgICAgICAgdGhpcy5lbWl0Q2hhbmdlKCk7XG4gICAgfSxcblxuICAgIGdldFRlYW1JZCgpIHtcbiAgICAgICAgcmV0dXJuIHJvdXRlci5nZXRUZWFtSWQoKTtcbiAgICB9LFxuXG4gICAgZ2V0VGFza0lkKCkge1xuICAgICAgICByZXR1cm4gcm91dGVyLmdldFRhc2tJZCgpO1xuICAgIH0sXG5cbiAgICBkaXNwYXRjaGVySW5kZXg6IEFwcERpc3BhdGNoZXIucmVnaXN0ZXIoZnVuY3Rpb24gKHBheWxvYWQpIHtcbiAgICAgICAgdmFyIGFjdGlvbiA9IHBheWxvYWQuYWN0aW9uO1xuXG4gICAgICAgIHN3aXRjaCAoYWN0aW9uKSB7XG4gICAgICAgICAgICBjYXNlIFJPVVRFX0NIQU5HRURfRVZFTlQ6XG4gICAgICAgICAgICAgICAgUm91dGVTdG9yZS5oYW5kbGVSb3V0ZUNoYW5nZWQocGF5bG9hZC5zdGF0ZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJ1ZTsgLy8gTm8gZXJyb3JzLiBOZWVkZWQgYnkgcHJvbWlzZSBpbiBEaXNwYXRjaGVyLlxuICAgIH0pXG5cbn0pO1xuXG53aW5kb3cuX19Sb3V0ZVN0b3JlID0gUm91dGVTdG9yZTtcbm1vZHVsZS5leHBvcnRzID0gUm91dGVTdG9yZTtcbiIsIi8qIEEgc3RvcmUgdGhhdCBjYW4gYmUgcXVlcmllZCBmb3IgdGhlIGN1cnJlbnQgcGF0aCAqL1xuXG5jb25zdCBBcHBEaXNwYXRjaGVyID0gcmVxdWlyZSgnLi4vYXBwZGlzcGF0Y2hlcicpO1xuY29uc3QgQmFzZVN0b3JlID0gcmVxdWlyZSgnLi9iYXNlLXN0b3JlJyk7XG5jb25zdCBSb3V0ZVN0b3JlID0gcmVxdWlyZSgnLi9yb3V0ZS1zdG9yZScpO1xuY29uc3QgTWlzc2lvbkNvbnN0YW50cyA9IHJlcXVpcmUoJy4uL2NvbnN0YW50cy9NaXNzaW9uQ29uc3RhbnRzJyk7XG5cbnZhciBhd2FpdGluZ05ld0luc3RydWN0aW9ucyA9IHtcbiAgICAndGV4dCcgOiAnVmVudGVyIHDDpSBueWUgaW5zdHJ1a3Nlcidcbn07XG5cbnZhciBhc3NpZ25tZW50cyA9IHtcbiAgICBzY2llbmNlOiB7XG4gICAgICAgIGN1cnJlbnQgOiBudWxsLFxuICAgICAgICBkZWZhdWx0IDogJ3NhbXBsZScsXG4gICAgICAgIHNhbXBsZToge1xuICAgICAgICAgICAgdGV4dDogJ1N0YXJ0IGtsb2trYSBvZyB0YSBmaXJlIG3DpWxpbmdlciBqZXZudCBmb3JkZWx0IHV0b3ZlciBkZSAzMCBzZWt1bmRlbmUnLFxuICAgICAgICAgICAgbmV4dDogJ2F2ZXJhZ2UnXG4gICAgICAgIH0sXG4gICAgICAgIGF2ZXJhZ2U6IHtcbiAgICAgICAgICAgIHRleHQ6ICdSZWduIHV0IGdqZW5ub21zbml0dHN2ZXJkaWVuIGF2IHN0csOlbGluZ3N2ZXJkaWVuZSBkZXJlIGZhbnQuIFNrcml2IGRlbiBpbm4gaSB0ZWtzdGZlbHRldC4nLFxuICAgICAgICAgICAgbmV4dDogJ2FkZHRvdGFsJ1xuICAgICAgICB9LFxuICAgICAgICBhZGR0b3RhbDoge1xuICAgICAgICAgICAgdGV4dDogJ0Jhc2VydCBww6UgZmFyZ2VuIHNvbSBibGUgaW5kaWtlcnQgdmVkIGV2YWx1ZXJpbmcgYXYgZ2plbm5vbXNuaXR0c3ZlcmRpZW4gJ1xuICAgICAgICAgICAgKyAnc2thbCB2aSBuw6UgbGVnZ2UgdGlsIGV0IHRhbGwgdGlsIHRvdGFsdCBmdW5uZXQgc3Ryw6VsaW5nc21lbmdkZS4nXG4gICAgICAgICAgICArICcgRm9yIGdyw7hubiBzdGF0dXMgbWFuIGxlZ2dlIHRpbCAwLCAnXG4gICAgICAgICAgICArICcgZm9yIG9yYW5zaiBzdGF0dXMgbWFuIGxlZ2dlIHRpbCAxNSwgJ1xuICAgICAgICAgICAgKyAnIGZvciByw7hkIHN0YXR1cyBtYW4gbGVnZ2UgdGlsIDUwLidcbiAgICAgICAgICAgICsgJyBEZW4gdG90YWxlIHN0csOlbGluZ3N2ZXJkaWVuIGkga3JvcHBlbiBza2FsIGhlbHN0IGlra2UgZ8OlIG92ZXIgNTAsIG9nIGFsZHJpIG92ZXIgNzUhJyxcbiAgICAgICAgICAgIG5leHQgOiAnYXdhaXRpbmcnXG4gICAgICAgIH0sXG4gICAgICAgIGF3YWl0aW5nIDogYXdhaXRpbmdOZXdJbnN0cnVjdGlvbnNcbiAgICB9XG59O1xuXG52YXIgVGFza1N0b3JlID0gT2JqZWN0LmFzc2lnbihuZXcgQmFzZVN0b3JlKCksIHtcblxuICAgIGdldEN1cnJlbnRUYXNrKCkge1xuICAgICAgICB2YXIgdGVhbUlkID0gUm91dGVTdG9yZS5nZXRUZWFtSWQoKTtcbiAgICAgICAgdmFyIGFzc2lnbm1lbnRzRm9yVGVhbSA9IGFzc2lnbm1lbnRzW3RlYW1JZF07XG4gICAgICAgIHJldHVybiAoYXNzaWdubWVudHNGb3JUZWFtICYmIGFzc2lnbm1lbnRzRm9yVGVhbVt0aGlzLmdldEN1cnJlbnRUYXNrSWQodGVhbUlkKV0pXG4gICAgICAgICAgICB8fCAnSW5nZW4gb3BwZ2F2ZSBmdW5uZXQnO1xuICAgIH0sXG5cbiAgICBnZXRDdXJyZW50VGFza0lkKHRlYW1JZCA9IFJvdXRlU3RvcmUuZ2V0VGVhbUlkKCkpIHtcbiAgICAgICAgaWYoIXRlYW1JZC5sZW5ndGgpIHJldHVybiBudWxsO1xuXG4gICAgICAgIHJldHVybiBhc3NpZ25tZW50c1t0ZWFtSWRdLmN1cnJlbnQgfHwgJ2F3YWl0aW5nJztcbiAgICB9LFxuXG4gICAgZ2V0U3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjdXJyZW50VGFza0lkOiB0aGlzLmdldEN1cnJlbnRUYXNrSWQoKSxcbiAgICAgICAgICAgIGN1cnJlbnRUYXNrOiB0aGlzLmdldEN1cnJlbnRUYXNrKCkudGV4dCxcbiAgICAgICAgICAgIG5leHRUYXNrSWQgOiB0aGlzLmdldEN1cnJlbnRUYXNrKCkubmV4dFxuICAgICAgICB9O1xuICAgIH0sXG5cblxuXG4gICAgZGlzcGF0Y2hlckluZGV4OiBBcHBEaXNwYXRjaGVyLnJlZ2lzdGVyKGZ1bmN0aW9uIChwYXlsb2FkKSB7XG4gICAgICAgIHZhciB0YXNrSWQ7XG4gICAgICAgIHZhciB0ZWFtSWQ7XG4gICAgICAgIHZhciBjdXJyZW50VGFzaztcbiAgICAgICAgdmFyIHRlYW1UYXNrcztcblxuICAgICAgICBzd2l0Y2gocGF5bG9hZC5hY3Rpb24pIHtcblxuICAgICAgICAgICAgY2FzZSBNaXNzaW9uQ29uc3RhbnRzLlNUQVJUX1RBU0s6XG4gICAgICAgICAgICAgICAgdGVhbUlkID0gcGF5bG9hZC50ZWFtSWQ7XG4gICAgICAgICAgICAgICAgdGFza0lkID0gcGF5bG9hZC50YXNrSWQ7XG5cbiAgICAgICAgICAgICAgICB0ZWFtVGFza3MgPSBhc3NpZ25tZW50c1t0ZWFtSWRdO1xuICAgICAgICAgICAgICAgIHRlYW1UYXNrcy5jdXJyZW50ID0gdGFza0lkO1xuICAgICAgICAgICAgICAgIFRhc2tTdG9yZS5lbWl0Q2hhbmdlKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgTWlzc2lvbkNvbnN0YW50cy5DT01QTEVURURfVEFTSzpcbiAgICAgICAgICAgICAgICB0ZWFtSWQgPSBwYXlsb2FkLnRlYW1JZDtcbiAgICAgICAgICAgICAgICB0YXNrSWQgPSBwYXlsb2FkLnRhc2tJZDtcblxuICAgICAgICAgICAgICAgIHRlYW1UYXNrcyA9IGFzc2lnbm1lbnRzW3RlYW1JZF07XG4gICAgICAgICAgICAgICAgY3VycmVudFRhc2sgPSB0ZWFtVGFza3NbdGFza0lkXTtcbiAgICAgICAgICAgICAgICB0ZWFtVGFza3MuY3VycmVudCA9IGN1cnJlbnRUYXNrLm5leHQ7XG4gICAgICAgICAgICAgICAgVGFza1N0b3JlLmVtaXRDaGFuZ2UoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRydWU7IC8vIE5vIGVycm9ycy4gTmVlZGVkIGJ5IHByb21pc2UgaW4gRGlzcGF0Y2hlci5cbiAgICB9KVxuXG59KTtcblxud2luZG93Ll9fVGFza1N0b3JlID0gVGFza1N0b3JlO1xubW9kdWxlLmV4cG9ydHMgPSBUYXNrU3RvcmU7XG4iLCIvKiBBIHNpbmdsZXRvbiBzdG9yZSB0aGF0IGNhbiBiZSBxdWVyaWVkIGZvciByZW1haW5pbmcgdGltZSAqL1xuXG5jb25zdCBjaGVjayA9IHJlcXVpcmUoJ2NoZWNrLXR5cGVzJyk7XG5jb25zdCBBcHBEaXNwYXRjaGVyID0gcmVxdWlyZSgnLi4vYXBwZGlzcGF0Y2hlcicpO1xuY29uc3QgQmFzZVN0b3JlID0gcmVxdWlyZSgnLi9iYXNlLXN0b3JlJyk7XG5jb25zdCBUaW1lckNvbnN0YW50cyA9IHJlcXVpcmUoJy4uL2NvbnN0YW50cy9UaW1lckNvbnN0YW50cycpO1xuY29uc3QgTWlzc2lvbkNvbnN0YW50cyA9IHJlcXVpcmUoJy4uL2NvbnN0YW50cy9NaXNzaW9uQ29uc3RhbnRzJyk7XG5cblxuLy8ga2VlcGluZyBzdGF0ZSBoaWRkZW4gaW4gdGhlIG1vZHVsZVxudmFyIHJlbWFpbmluZ1RpbWUgPSB7fSxcbiAgICBpbml0aWFsVGltZSA9IHt9LFxuICAgIGludGVydmFsSWQgPSB7fSxcbiAgICBlbGFwc2VkTWlzc2lvblRpbWUgPSAwLFxuICAgIG1pc3Npb25UaW1lciA9IG51bGw7XG5cblxuZnVuY3Rpb24gcmVzZXQodGltZXJJZCkge1xuICAgIHN0b3AodGltZXJJZCk7XG4gICAgcmVtYWluaW5nVGltZVt0aW1lcklkXSA9IGluaXRpYWxUaW1lW3RpbWVySWRdO1xufVxuXG5mdW5jdGlvbiBzdGFydCh0aW1lcklkKSB7XG4gICAgYXNzZXJ0RXhpc3RzKHRpbWVySWQpO1xuXG4gICAgaW50ZXJ2YWxJZFt0aW1lcklkXSA9IHNldEludGVydmFsKGZ1bmN0aW9uIGZuKCkge1xuICAgICAgICBpZiAocmVtYWluaW5nVGltZVt0aW1lcklkXSA+IDApIHtcbiAgICAgICAgICAgIHJlbWFpbmluZ1RpbWVbdGltZXJJZF0tLTtcbiAgICAgICAgICAgIFRpbWVyU3RvcmUuZW1pdENoYW5nZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RvcCh0aW1lcklkKTtcbiAgICAgICAgfVxuICAgIH0sIDEwMDApO1xufVxuXG5mdW5jdGlvbiBzdG9wKHRpbWVySWQpIHtcbiAgICBhc3NlcnRFeGlzdHModGltZXJJZCk7XG5cbiAgICBjbGVhckludGVydmFsKGludGVydmFsSWRbdGltZXJJZF0pO1xuICAgIGRlbGV0ZSBpbnRlcnZhbElkW3RpbWVySWRdO1xuICAgIFRpbWVyU3RvcmUuZW1pdENoYW5nZSgpO1xufVxuXG5mdW5jdGlvbiBzdGFydE1pc3Npb25UaW1lcigpe1xuICAgIHN0b3BNaXNzaW9uVGltZXIoKTtcbiAgICBtaXNzaW9uVGltZXIgPSBzZXRJbnRlcnZhbCgoKT0+e1xuICAgICAgICBlbGFwc2VkTWlzc2lvblRpbWUrKztcbiAgICAgICAgVGltZXJTdG9yZS5lbWl0Q2hhbmdlKCk7XG4gICAgfSwxMDAwKTtcbn1cblxuZnVuY3Rpb24gc3RvcE1pc3Npb25UaW1lcigpe1xuICAgIGNsZWFySW50ZXJ2YWwobWlzc2lvblRpbWVyKTtcbn1cblxuXG4vKipcbiAqIEBwYXJhbSBkYXRhLnJlbWFpbmluZ1RpbWUge051bWJlcn1cbiAqIEBwYXJhbSBkYXRhLnRpbWVySWQge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gaGFuZGxlUmVtYWluaW5nVGltZUNoYW5nZWQoZGF0YSkge1xuICAgIHZhciByZW1haW5pbmcgPSBkYXRhLnJlbWFpbmluZ1RpbWU7XG4gICAgaWYgKHJlbWFpbmluZyA8PSAwKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdHb3QgaW52YWxpZCByZW1haW5pbmcgdGltZSA6JyArIHJlbWFpbmluZyk7XG5cbiAgICByZW1haW5pbmdUaW1lW2RhdGEudGltZXJJZF0gPSByZW1haW5pbmc7XG4gICAgaW5pdGlhbFRpbWVbZGF0YS50aW1lcklkXSA9IHJlbWFpbmluZztcbiAgICBUaW1lclN0b3JlLmVtaXRDaGFuZ2UoKTtcbn1cblxuZnVuY3Rpb24gYXNzZXJ0RXhpc3RzKHRpbWVySWQpIHtcbiAgICBjaGVjay5hc3NlcnQodGltZXJJZCBpbiByZW1haW5pbmdUaW1lLCAnTm8gdGltZSBzZXQgZm9yIHRpbWVyIHdpdGggaWQgJyArIHRpbWVySWQpO1xufVxuXG5jb25zdCBUaW1lclN0b3JlID0gT2JqZWN0LmFzc2lnbihuZXcgQmFzZVN0b3JlKCksIHtcbiAgICBcbiAgICBnZXRSZW1haW5pbmdUaW1lKHRpbWVySWQpIHtcbiAgICAgICAgY2hlY2subnVtYmVyKHRpbWVySWQpO1xuICAgICAgICByZXR1cm4gcmVtYWluaW5nVGltZVt0aW1lcklkXTtcbiAgICB9LFxuXG4gICAgaXNSdW5uaW5nKHRpbWVySWQpIHtcbiAgICAgICAgY2hlY2subnVtYmVyKHRpbWVySWQpO1xuICAgICAgICByZXR1cm4gISFpbnRlcnZhbElkW3RpbWVySWRdO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUaGUgdGltZXIgaXMgc2V0IChvciBoYXMgYmVlbiByZXNldCksIGJ1dCBub3Qgc3RhcnRlZFxuICAgICAqIEBwYXJhbSB0aW1lcklkXG4gICAgICogQHJldHVybnMgdHJ1ZSBpZiByZWFkeSwgZmFsc2UgaWYgcnVubmluZyBvciB0aW1lZCBvdXRcbiAgICAgKi9cbiAgICBpc1JlYWR5VG9TdGFydCh0aW1lcklkKSB7XG4gICAgICAgIGNoZWNrLm51bWJlcih0aW1lcklkKTtcbiAgICAgICAgXG4gICAgICAgIGlmKHRoaXMuaXNSdW5uaW5nKHRpbWVySWQpKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFJlbWFpbmluZ1RpbWUodGltZXJJZCkgPiAwO1xuICAgIH0sXG5cbiAgICBnZXRFbGFwc2VkTWlzc2lvblRpbWUoKSB7XG4gICAgICAgIHJldHVybiBlbGFwc2VkTWlzc2lvblRpbWU7XG4gICAgfSxcblxuICAgIGRpc3BhdGNoZXJJbmRleDogQXBwRGlzcGF0Y2hlci5yZWdpc3RlcihmdW5jdGlvbiAocGF5bG9hZCkge1xuICAgICAgICB2YXIgeyBhY3Rpb24sIGRhdGF9ID0gcGF5bG9hZDtcblxuICAgICAgICBzd2l0Y2ggKGFjdGlvbikge1xuXG4gICAgICAgICAgICBjYXNlIFRpbWVyQ29uc3RhbnRzLlNFVF9USU1FUjpcbiAgICAgICAgICAgICAgICBoYW5kbGVSZW1haW5pbmdUaW1lQ2hhbmdlZChkYXRhKTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSBUaW1lckNvbnN0YW50cy5TVEFSVF9USU1FUjpcbiAgICAgICAgICAgICAgICBhc3NlcnRFeGlzdHMoZGF0YS50aW1lcklkKTtcblxuICAgICAgICAgICAgICAgIC8vIGF2b2lkIHNldHRpbmcgdXAgbW9yZSB0aGFuIG9uZSB0aW1lclxuICAgICAgICAgICAgICAgIGlmKCFUaW1lclN0b3JlLmlzUnVubmluZyhkYXRhLnRpbWVySWQpKXtcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQoZGF0YS50aW1lcklkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgVGltZXJDb25zdGFudHMuU1RPUF9USU1FUjpcbiAgICAgICAgICAgICAgICBzdG9wKGRhdGEudGltZXJJZCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgVGltZXJDb25zdGFudHMuUkVTRVRfVElNRVI6XG4gICAgICAgICAgICAgICAgcmVzZXQoZGF0YS50aW1lcklkKTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSBNaXNzaW9uQ29uc3RhbnRzLk1JU1NJT05fU1RBUlRFRF9FVkVOVDpcbiAgICAgICAgICAgICAgICBzdGFydE1pc3Npb25UaW1lcigpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIE1pc3Npb25Db25zdGFudHMuTUlTU0lPTl9TVE9QUEVEX0VWRU5UOlxuICAgICAgICAgICAgICAgIHN0b3BNaXNzaW9uVGltZXIoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSBNaXNzaW9uQ29uc3RhbnRzLlJFQ0VJVkVEX0FQUF9TVEFURTpcbiAgICAgICAgICAgICAgICB2YXIgYXBwU3RhdGUgPSBwYXlsb2FkLmFwcFN0YXRlO1xuXG4gICAgICAgICAgICAgICAgZWxhcHNlZE1pc3Npb25UaW1lID0gYXBwU3RhdGUuZWxhcHNlZF9taXNzaW9uX3RpbWU7XG5cbiAgICAgICAgICAgICAgICBpZihhcHBTdGF0ZS5taXNzaW9uX3J1bm5pbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRNaXNzaW9uVGltZXIoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzdG9wTWlzc2lvblRpbWVyKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgVGltZXJTdG9yZS5lbWl0Q2hhbmdlKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgTWlzc2lvbkNvbnN0YW50cy5NSVNTSU9OX1RJTUVfU1lOQzpcbiAgICAgICAgICAgICAgICBlbGFwc2VkTWlzc2lvblRpbWUgID0gZGF0YS5lbGFwc2VkTWlzc2lvblRpbWU7XG4gICAgICAgICAgICAgICAgVGltZXJTdG9yZS5lbWl0Q2hhbmdlKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJ1ZTsgLy8gTm8gZXJyb3JzLiBOZWVkZWQgYnkgcHJvbWlzZSBpbiBEaXNwYXRjaGVyLlxuICAgIH0pXG5cbn0pO1xuXG53aW5kb3cuX19UaW1lU3RvcmUgPSBUaW1lclN0b3JlO1xubW9kdWxlLmV4cG9ydHMgPSBUaW1lclN0b3JlO1xuIiwiY29uc3QgdGVhbU1hcCA9IE9iamVjdC5mcmVlemUoe1xuICAgICdsZWFkZXInOiAnb3BlcmFzam9uc2xlZGVyJyxcbiAgICAnc2NpZW5jZSc6ICdmb3Jza25pbmdzdGVhbScsXG4gICAgJ2NvbW11bmljYXRpb24nOiAna29tbXVuaWthc2pvbnN0ZWFtJyxcbiAgICAnc2VjdXJpdHknOiAnc2lra2VyaGV0c3RlYW0nLFxuICAgICdhc3Ryb25hdXQnOiAnYXN0cm9uYXV0dGVhbSdcbn0pO1xuXG5mdW5jdGlvbiBvdGhlclRlYW1OYW1lcyhjdXJyZW50VGVhbUlkKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRlYW1NYXApXG4gICAgICAgIC5maWx0ZXIoKG4pID0+IG4gIT09IGN1cnJlbnRUZWFtSWQgJiYgbiAhPT0gJ2xlYWRlcicpXG4gICAgICAgIC5tYXAoKG4pID0+IHRlYW1NYXBbbl0pXG4gICAgICAgIC5qb2luKCcsICcpXG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIG5hbWVNYXA6IHRlYW1NYXAsXG4gICAgb3RoZXJUZWFtTmFtZXNcbn07XG4iLCJmdW5jdGlvbiBjbGVhblJvb3RQYXRoKHBhdGgpIHtcbiAgICAvLyBjb252ZXJ0ICcvc2NpZW5jZS9zdGVwMScgPT4gJ3NjaWVuY2UnXG4gICAgcmV0dXJuIHBhdGgucmVwbGFjZSgvXFwvPyhcXHcrKS4qLywgXCIkMVwiKTtcbn1cblxuZnVuY3Rpb24gcmFuZG9tSW50KG1pbiwgbWF4KSB7XG4gICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggKyAxIC0gbWluKSkgKyBtaW47XG59XG5cbi8qKlxuICogU3RhbmRhcmRpemUgbnVtYmVyIHBhcnNpbmcuXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyIGlzIGEgbm9uLWVtcHR5IHN0cmluZ1xuICogQHJldHVybnMge051bWJlcn0gLSBwb3NzaWJseSBOYU5cbiAqXG4gKiBUaGUgc3RhbmRhcmRpemF0aW9uIHN0ZXAgb2YgY29udmVydGluZyAnMSwyMycgLT4gJzEuMjMnIGlzIHN0cmljdGx5IG5vdCBuZWVkZWQgd2hlbiBoYW5kbGluZyBpbnB1dHMgZnJvbVxuICogaW5wdXQgZmllbGRzIHRoYXQgaGF2ZSB0eXBlPSdudW1iZXInLCB3aGVyZSB0aGlzIGhhcHBlbnMgYXV0b21hdGljYWxseS5cbiAqIFRoZSByZXN0IG9mIHRoZSBlcnJvciBoYW5kbGluZyBpcyB1c2VmdWwsIG5vbmUgdGhlIGxlc3MuXG4gKi9cbmZ1bmN0aW9uIHBhcnNlTnVtYmVyKHN0cikge1xuICAgIGlmICghdHlwZW9mIHN0ciA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhyb3cgVHlwZUVycm9yKCdUaGlzIGZ1bmN0aW9uIGV4cGVjdHMgc3RyaW5ncy4gR290IHNvbWV0aGluZyBlbHNlOiAnICsgc3RyKTtcbiAgICB9XG5cbiAgICAvLyBzdGFuZGFyZGl6ZSB0aGUgbnVtYmVyIGZvcm1hdCAtIHJlbW92aW5nIE5vcndlZ2lhbiBjdXJyZW5jeSBmb3JtYXRcbiAgICBsZXQgY2xlYW5lZFN0cmluZyA9IHN0ci50cmltKCkucmVwbGFjZSgnLCcsICcuJyk7XG5cbiAgICBpZiAoIWNsZWFuZWRTdHJpbmcubGVuZ3RoKSB7XG4gICAgICAgIHRocm93IFR5cGVFcnJvcignR290IGEgYmxhbmsgc3RyaW5nJyk7XG4gICAgfVxuXG4gICAgaWYgKGNsZWFuZWRTdHJpbmcuaW5kZXhPZignLicpICE9PSAtMSkge1xuICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChjbGVhbmVkU3RyaW5nLCAxMCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlSW50KGNsZWFuZWRTdHJpbmcsIDEwKTtcbiAgICB9XG59XG5cbi8vIGdlbmVyYXRlcyBhIFVVSURcbi8vIHdvcmxkcyBzbWFsbGVzdCB1dWlkIGxpYi4gY3Jhenkgc2hpdCA6KVxuLy8gQHNlZSBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9qZWQvOTgyODgzXG5mdW5jdGlvbiBiKGEpIHtcbiAgICByZXR1cm4gYSA/IChhIF4gTWF0aC5yYW5kb20oKSAqIDE2ID4+IGEgLyA0KS50b1N0cmluZygxNikgOiAoWzFlN10gKyAtMWUzICsgLTRlMyArIC04ZTMgKyAtMWUxMSkucmVwbGFjZSgvWzAxOF0vZywgYilcbn1cblxuZnVuY3Rpb24gbGF6eVJlcXVpcmUocGF0aCkge1xuICAgIGxldCB0bXAgPSBudWxsO1xuICAgIHJldHVybiAoKT0+IHtcbiAgICAgICAgaWYgKCF0bXApIHRtcCA9IHJlcXVpcmUocGF0aCk7XG4gICAgICAgIHJldHVybiB0bXA7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBjbGVhblJvb3RQYXRoLCByYW5kb21JbnQsIHBhcnNlTnVtYmVyLCB1dWlkOiBiLCBsYXp5UmVxdWlyZVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvYXNzaWduXCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07IiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9mcmVlemVcIiksIF9fZXNNb2R1bGU6IHRydWUgfTsiLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2tleXNcIiksIF9fZXNNb2R1bGU6IHRydWUgfTsiLCJcInVzZSBzdHJpY3RcIjtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBmdW5jdGlvbiAoaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7XG4gIGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTtcbiAgfVxufTtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTsiLCJcInVzZSBzdHJpY3RcIjtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSAoZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldO1xuICAgICAgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlO1xuICAgICAgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlO1xuICAgICAgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykge1xuICAgIGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7XG4gICAgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7XG4gICAgcmV0dXJuIENvbnN0cnVjdG9yO1xuICB9O1xufSkoKTtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9PYmplY3QkYXNzaWduID0gcmVxdWlyZShcImJhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvYXNzaWduXCIpW1wiZGVmYXVsdFwiXTtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBfT2JqZWN0JGFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTtcblxuICAgIGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHtcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7XG4gICAgICAgIHRhcmdldFtrZXldID0gc291cmNlW2tleV07XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRhcmdldDtcbn07XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gZnVuY3Rpb24gKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7XG4gIGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCBcIiArIHR5cGVvZiBzdXBlckNsYXNzKTtcbiAgfVxuXG4gIHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwge1xuICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICB2YWx1ZTogc3ViQ2xhc3MsXG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfVxuICB9KTtcbiAgaWYgKHN1cGVyQ2xhc3MpIHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7XG59O1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlOyIsInJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM2Lm9iamVjdC5hc3NpZ24nKTtcclxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi8uLi9tb2R1bGVzLyQnKS5jb3JlLk9iamVjdC5hc3NpZ247IiwicmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9lczYub2JqZWN0LnN0YXRpY3MtYWNjZXB0LXByaW1pdGl2ZXMnKTtcclxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi8uLi9tb2R1bGVzLyQnKS5jb3JlLk9iamVjdC5mcmVlemU7IiwicmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9lczYub2JqZWN0LnN0YXRpY3MtYWNjZXB0LXByaW1pdGl2ZXMnKTtcclxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi8uLi9tb2R1bGVzLyQnKS5jb3JlLk9iamVjdC5rZXlzOyIsInZhciAkID0gcmVxdWlyZSgnLi8kJyk7XHJcbi8vIDE5LjEuMi4xIE9iamVjdC5hc3NpZ24odGFyZ2V0LCBzb3VyY2UsIC4uLilcclxuLyplc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtdmFycyAqL1xyXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gYXNzaWduKHRhcmdldCwgc291cmNlKXtcclxuLyplc2xpbnQtZW5hYmxlIG5vLXVudXNlZC12YXJzICovXHJcbiAgdmFyIFQgPSBPYmplY3QoJC5hc3NlcnREZWZpbmVkKHRhcmdldCkpXHJcbiAgICAsIGwgPSBhcmd1bWVudHMubGVuZ3RoXHJcbiAgICAsIGkgPSAxO1xyXG4gIHdoaWxlKGwgPiBpKXtcclxuICAgIHZhciBTICAgICAgPSAkLkVTNU9iamVjdChhcmd1bWVudHNbaSsrXSlcclxuICAgICAgLCBrZXlzICAgPSAkLmdldEtleXMoUylcclxuICAgICAgLCBsZW5ndGggPSBrZXlzLmxlbmd0aFxyXG4gICAgICAsIGogICAgICA9IDBcclxuICAgICAgLCBrZXk7XHJcbiAgICB3aGlsZShsZW5ndGggPiBqKVRba2V5ID0ga2V5c1tqKytdXSA9IFNba2V5XTtcclxuICB9XHJcbiAgcmV0dXJuIFQ7XHJcbn07IiwidmFyICQgICAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgZ2xvYmFsICAgICA9ICQuZ1xyXG4gICwgY29yZSAgICAgICA9ICQuY29yZVxyXG4gICwgaXNGdW5jdGlvbiA9ICQuaXNGdW5jdGlvbjtcclxuZnVuY3Rpb24gY3R4KGZuLCB0aGF0KXtcclxuICByZXR1cm4gZnVuY3Rpb24oKXtcclxuICAgIHJldHVybiBmbi5hcHBseSh0aGF0LCBhcmd1bWVudHMpO1xyXG4gIH07XHJcbn1cclxuLy8gdHlwZSBiaXRtYXBcclxuJGRlZi5GID0gMTsgIC8vIGZvcmNlZFxyXG4kZGVmLkcgPSAyOyAgLy8gZ2xvYmFsXHJcbiRkZWYuUyA9IDQ7ICAvLyBzdGF0aWNcclxuJGRlZi5QID0gODsgIC8vIHByb3RvXHJcbiRkZWYuQiA9IDE2OyAvLyBiaW5kXHJcbiRkZWYuVyA9IDMyOyAvLyB3cmFwXHJcbmZ1bmN0aW9uICRkZWYodHlwZSwgbmFtZSwgc291cmNlKXtcclxuICB2YXIga2V5LCBvd24sIG91dCwgZXhwXHJcbiAgICAsIGlzR2xvYmFsID0gdHlwZSAmICRkZWYuR1xyXG4gICAgLCB0YXJnZXQgICA9IGlzR2xvYmFsID8gZ2xvYmFsIDogdHlwZSAmICRkZWYuU1xyXG4gICAgICAgID8gZ2xvYmFsW25hbWVdIDogKGdsb2JhbFtuYW1lXSB8fCB7fSkucHJvdG90eXBlXHJcbiAgICAsIGV4cG9ydHMgID0gaXNHbG9iYWwgPyBjb3JlIDogY29yZVtuYW1lXSB8fCAoY29yZVtuYW1lXSA9IHt9KTtcclxuICBpZihpc0dsb2JhbClzb3VyY2UgPSBuYW1lO1xyXG4gIGZvcihrZXkgaW4gc291cmNlKXtcclxuICAgIC8vIGNvbnRhaW5zIGluIG5hdGl2ZVxyXG4gICAgb3duID0gISh0eXBlICYgJGRlZi5GKSAmJiB0YXJnZXQgJiYga2V5IGluIHRhcmdldDtcclxuICAgIGlmKG93biAmJiBrZXkgaW4gZXhwb3J0cyljb250aW51ZTtcclxuICAgIC8vIGV4cG9ydCBuYXRpdmUgb3IgcGFzc2VkXHJcbiAgICBvdXQgPSBvd24gPyB0YXJnZXRba2V5XSA6IHNvdXJjZVtrZXldO1xyXG4gICAgLy8gcHJldmVudCBnbG9iYWwgcG9sbHV0aW9uIGZvciBuYW1lc3BhY2VzXHJcbiAgICBpZihpc0dsb2JhbCAmJiAhaXNGdW5jdGlvbih0YXJnZXRba2V5XSkpZXhwID0gc291cmNlW2tleV07XHJcbiAgICAvLyBiaW5kIHRpbWVycyB0byBnbG9iYWwgZm9yIGNhbGwgZnJvbSBleHBvcnQgY29udGV4dFxyXG4gICAgZWxzZSBpZih0eXBlICYgJGRlZi5CICYmIG93billeHAgPSBjdHgob3V0LCBnbG9iYWwpO1xyXG4gICAgLy8gd3JhcCBnbG9iYWwgY29uc3RydWN0b3JzIGZvciBwcmV2ZW50IGNoYW5nZSB0aGVtIGluIGxpYnJhcnlcclxuICAgIGVsc2UgaWYodHlwZSAmICRkZWYuVyAmJiB0YXJnZXRba2V5XSA9PSBvdXQpIWZ1bmN0aW9uKEMpe1xyXG4gICAgICBleHAgPSBmdW5jdGlvbihwYXJhbSl7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiBDID8gbmV3IEMocGFyYW0pIDogQyhwYXJhbSk7XHJcbiAgICAgIH07XHJcbiAgICAgIGV4cC5wcm90b3R5cGUgPSBDLnByb3RvdHlwZTtcclxuICAgIH0ob3V0KTtcclxuICAgIGVsc2UgZXhwID0gdHlwZSAmICRkZWYuUCAmJiBpc0Z1bmN0aW9uKG91dCkgPyBjdHgoRnVuY3Rpb24uY2FsbCwgb3V0KSA6IG91dDtcclxuICAgIC8vIGV4cG9ydFxyXG4gICAgJC5oaWRlKGV4cG9ydHMsIGtleSwgZXhwKTtcclxuICB9XHJcbn1cclxubW9kdWxlLmV4cG9ydHMgPSAkZGVmOyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oJCl7XHJcbiAgJC5GVyAgID0gZmFsc2U7XHJcbiAgJC5wYXRoID0gJC5jb3JlO1xyXG4gIHJldHVybiAkO1xyXG59OyIsIid1c2Ugc3RyaWN0JztcclxudmFyIGdsb2JhbCA9IHR5cGVvZiBzZWxmICE9ICd1bmRlZmluZWQnID8gc2VsZiA6IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKClcclxuICAsIGNvcmUgICA9IHt9XHJcbiAgLCBkZWZpbmVQcm9wZXJ0eSA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eVxyXG4gICwgaGFzT3duUHJvcGVydHkgPSB7fS5oYXNPd25Qcm9wZXJ0eVxyXG4gICwgY2VpbCAgPSBNYXRoLmNlaWxcclxuICAsIGZsb29yID0gTWF0aC5mbG9vclxyXG4gICwgbWF4ICAgPSBNYXRoLm1heFxyXG4gICwgbWluICAgPSBNYXRoLm1pbjtcclxuLy8gVGhlIGVuZ2luZSB3b3JrcyBmaW5lIHdpdGggZGVzY3JpcHRvcnM/IFRoYW5rJ3MgSUU4IGZvciBoaXMgZnVubnkgZGVmaW5lUHJvcGVydHkuXHJcbnZhciBERVNDID0gISFmdW5jdGlvbigpe1xyXG4gIHRyeSB7XHJcbiAgICByZXR1cm4gZGVmaW5lUHJvcGVydHkoe30sICdhJywge2dldDogZnVuY3Rpb24oKXsgcmV0dXJuIDI7IH19KS5hID09IDI7XHJcbiAgfSBjYXRjaChlKXsgLyogZW1wdHkgKi8gfVxyXG59KCk7XHJcbnZhciBoaWRlID0gY3JlYXRlRGVmaW5lcigxKTtcclxuLy8gNy4xLjQgVG9JbnRlZ2VyXHJcbmZ1bmN0aW9uIHRvSW50ZWdlcihpdCl7XHJcbiAgcmV0dXJuIGlzTmFOKGl0ID0gK2l0KSA/IDAgOiAoaXQgPiAwID8gZmxvb3IgOiBjZWlsKShpdCk7XHJcbn1cclxuZnVuY3Rpb24gZGVzYyhiaXRtYXAsIHZhbHVlKXtcclxuICByZXR1cm4ge1xyXG4gICAgZW51bWVyYWJsZSAgOiAhKGJpdG1hcCAmIDEpLFxyXG4gICAgY29uZmlndXJhYmxlOiAhKGJpdG1hcCAmIDIpLFxyXG4gICAgd3JpdGFibGUgICAgOiAhKGJpdG1hcCAmIDQpLFxyXG4gICAgdmFsdWUgICAgICAgOiB2YWx1ZVxyXG4gIH07XHJcbn1cclxuZnVuY3Rpb24gc2ltcGxlU2V0KG9iamVjdCwga2V5LCB2YWx1ZSl7XHJcbiAgb2JqZWN0W2tleV0gPSB2YWx1ZTtcclxuICByZXR1cm4gb2JqZWN0O1xyXG59XHJcbmZ1bmN0aW9uIGNyZWF0ZURlZmluZXIoYml0bWFwKXtcclxuICByZXR1cm4gREVTQyA/IGZ1bmN0aW9uKG9iamVjdCwga2V5LCB2YWx1ZSl7XHJcbiAgICByZXR1cm4gJC5zZXREZXNjKG9iamVjdCwga2V5LCBkZXNjKGJpdG1hcCwgdmFsdWUpKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11c2UtYmVmb3JlLWRlZmluZVxyXG4gIH0gOiBzaW1wbGVTZXQ7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzT2JqZWN0KGl0KXtcclxuICByZXR1cm4gaXQgIT09IG51bGwgJiYgKHR5cGVvZiBpdCA9PSAnb2JqZWN0JyB8fCB0eXBlb2YgaXQgPT0gJ2Z1bmN0aW9uJyk7XHJcbn1cclxuZnVuY3Rpb24gaXNGdW5jdGlvbihpdCl7XHJcbiAgcmV0dXJuIHR5cGVvZiBpdCA9PSAnZnVuY3Rpb24nO1xyXG59XHJcbmZ1bmN0aW9uIGFzc2VydERlZmluZWQoaXQpe1xyXG4gIGlmKGl0ID09IHVuZGVmaW5lZCl0aHJvdyBUeXBlRXJyb3IoXCJDYW4ndCBjYWxsIG1ldGhvZCBvbiAgXCIgKyBpdCk7XHJcbiAgcmV0dXJuIGl0O1xyXG59XHJcblxyXG52YXIgJCA9IG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi8kLmZ3Jykoe1xyXG4gIGc6IGdsb2JhbCxcclxuICBjb3JlOiBjb3JlLFxyXG4gIGh0bWw6IGdsb2JhbC5kb2N1bWVudCAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsXHJcbiAgLy8gaHR0cDovL2pzcGVyZi5jb20vY29yZS1qcy1pc29iamVjdFxyXG4gIGlzT2JqZWN0OiAgIGlzT2JqZWN0LFxyXG4gIGlzRnVuY3Rpb246IGlzRnVuY3Rpb24sXHJcbiAgaXQ6IGZ1bmN0aW9uKGl0KXtcclxuICAgIHJldHVybiBpdDtcclxuICB9LFxyXG4gIHRoYXQ6IGZ1bmN0aW9uKCl7XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9LFxyXG4gIC8vIDcuMS40IFRvSW50ZWdlclxyXG4gIHRvSW50ZWdlcjogdG9JbnRlZ2VyLFxyXG4gIC8vIDcuMS4xNSBUb0xlbmd0aFxyXG4gIHRvTGVuZ3RoOiBmdW5jdGlvbihpdCl7XHJcbiAgICByZXR1cm4gaXQgPiAwID8gbWluKHRvSW50ZWdlcihpdCksIDB4MWZmZmZmZmZmZmZmZmYpIDogMDsgLy8gcG93KDIsIDUzKSAtIDEgPT0gOTAwNzE5OTI1NDc0MDk5MVxyXG4gIH0sXHJcbiAgdG9JbmRleDogZnVuY3Rpb24oaW5kZXgsIGxlbmd0aCl7XHJcbiAgICBpbmRleCA9IHRvSW50ZWdlcihpbmRleCk7XHJcbiAgICByZXR1cm4gaW5kZXggPCAwID8gbWF4KGluZGV4ICsgbGVuZ3RoLCAwKSA6IG1pbihpbmRleCwgbGVuZ3RoKTtcclxuICB9LFxyXG4gIGhhczogZnVuY3Rpb24oaXQsIGtleSl7XHJcbiAgICByZXR1cm4gaGFzT3duUHJvcGVydHkuY2FsbChpdCwga2V5KTtcclxuICB9LFxyXG4gIGNyZWF0ZTogICAgIE9iamVjdC5jcmVhdGUsXHJcbiAgZ2V0UHJvdG86ICAgT2JqZWN0LmdldFByb3RvdHlwZU9mLFxyXG4gIERFU0M6ICAgICAgIERFU0MsXHJcbiAgZGVzYzogICAgICAgZGVzYyxcclxuICBnZXREZXNjOiAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yLFxyXG4gIHNldERlc2M6ICAgIGRlZmluZVByb3BlcnR5LFxyXG4gIGdldEtleXM6ICAgIE9iamVjdC5rZXlzLFxyXG4gIGdldE5hbWVzOiAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzLFxyXG4gIGdldFN5bWJvbHM6IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMsXHJcbiAgLy8gRHVtbXksIGZpeCBmb3Igbm90IGFycmF5LWxpa2UgRVMzIHN0cmluZyBpbiBlczUgbW9kdWxlXHJcbiAgYXNzZXJ0RGVmaW5lZDogYXNzZXJ0RGVmaW5lZCxcclxuICBFUzVPYmplY3Q6IE9iamVjdCxcclxuICB0b09iamVjdDogZnVuY3Rpb24oaXQpe1xyXG4gICAgcmV0dXJuICQuRVM1T2JqZWN0KGFzc2VydERlZmluZWQoaXQpKTtcclxuICB9LFxyXG4gIGhpZGU6IGhpZGUsXHJcbiAgZGVmOiBjcmVhdGVEZWZpbmVyKDApLFxyXG4gIHNldDogZ2xvYmFsLlN5bWJvbCA/IHNpbXBsZVNldCA6IGhpZGUsXHJcbiAgbWl4OiBmdW5jdGlvbih0YXJnZXQsIHNyYyl7XHJcbiAgICBmb3IodmFyIGtleSBpbiBzcmMpaGlkZSh0YXJnZXQsIGtleSwgc3JjW2tleV0pO1xyXG4gICAgcmV0dXJuIHRhcmdldDtcclxuICB9LFxyXG4gIGVhY2g6IFtdLmZvckVhY2hcclxufSk7XHJcbmlmKHR5cGVvZiBfX2UgIT0gJ3VuZGVmaW5lZCcpX19lID0gY29yZTtcclxuaWYodHlwZW9mIF9fZyAhPSAndW5kZWZpbmVkJylfX2cgPSBnbG9iYWw7IiwiLy8gMTkuMS4zLjEgT2JqZWN0LmFzc2lnbih0YXJnZXQsIHNvdXJjZSlcclxudmFyICRkZWYgPSByZXF1aXJlKCcuLyQuZGVmJyk7XHJcbiRkZWYoJGRlZi5TLCAnT2JqZWN0Jywge2Fzc2lnbjogcmVxdWlyZSgnLi8kLmFzc2lnbicpfSk7IiwidmFyICQgICAgICAgID0gcmVxdWlyZSgnLi8kJylcclxuICAsICRkZWYgICAgID0gcmVxdWlyZSgnLi8kLmRlZicpXHJcbiAgLCBpc09iamVjdCA9ICQuaXNPYmplY3RcclxuICAsIHRvT2JqZWN0ID0gJC50b09iamVjdDtcclxuZnVuY3Rpb24gd3JhcE9iamVjdE1ldGhvZChNRVRIT0QsIE1PREUpe1xyXG4gIHZhciBmbiAgPSAoJC5jb3JlLk9iamVjdCB8fCB7fSlbTUVUSE9EXSB8fCBPYmplY3RbTUVUSE9EXVxyXG4gICAgLCBmICAgPSAwXHJcbiAgICAsIG8gICA9IHt9O1xyXG4gIG9bTUVUSE9EXSA9IE1PREUgPT0gMSA/IGZ1bmN0aW9uKGl0KXtcclxuICAgIHJldHVybiBpc09iamVjdChpdCkgPyBmbihpdCkgOiBpdDtcclxuICB9IDogTU9ERSA9PSAyID8gZnVuY3Rpb24oaXQpe1xyXG4gICAgcmV0dXJuIGlzT2JqZWN0KGl0KSA/IGZuKGl0KSA6IHRydWU7XHJcbiAgfSA6IE1PREUgPT0gMyA/IGZ1bmN0aW9uKGl0KXtcclxuICAgIHJldHVybiBpc09iamVjdChpdCkgPyBmbihpdCkgOiBmYWxzZTtcclxuICB9IDogTU9ERSA9PSA0ID8gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGl0LCBrZXkpe1xyXG4gICAgcmV0dXJuIGZuKHRvT2JqZWN0KGl0KSwga2V5KTtcclxuICB9IDogTU9ERSA9PSA1ID8gZnVuY3Rpb24gZ2V0UHJvdG90eXBlT2YoaXQpe1xyXG4gICAgcmV0dXJuIGZuKE9iamVjdCgkLmFzc2VydERlZmluZWQoaXQpKSk7XHJcbiAgfSA6IGZ1bmN0aW9uKGl0KXtcclxuICAgIHJldHVybiBmbih0b09iamVjdChpdCkpO1xyXG4gIH07XHJcbiAgdHJ5IHtcclxuICAgIGZuKCd6Jyk7XHJcbiAgfSBjYXRjaChlKXtcclxuICAgIGYgPSAxO1xyXG4gIH1cclxuICAkZGVmKCRkZWYuUyArICRkZWYuRiAqIGYsICdPYmplY3QnLCBvKTtcclxufVxyXG53cmFwT2JqZWN0TWV0aG9kKCdmcmVlemUnLCAxKTtcclxud3JhcE9iamVjdE1ldGhvZCgnc2VhbCcsIDEpO1xyXG53cmFwT2JqZWN0TWV0aG9kKCdwcmV2ZW50RXh0ZW5zaW9ucycsIDEpO1xyXG53cmFwT2JqZWN0TWV0aG9kKCdpc0Zyb3plbicsIDIpO1xyXG53cmFwT2JqZWN0TWV0aG9kKCdpc1NlYWxlZCcsIDIpO1xyXG53cmFwT2JqZWN0TWV0aG9kKCdpc0V4dGVuc2libGUnLCAzKTtcclxud3JhcE9iamVjdE1ldGhvZCgnZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yJywgNCk7XHJcbndyYXBPYmplY3RNZXRob2QoJ2dldFByb3RvdHlwZU9mJywgNSk7XHJcbndyYXBPYmplY3RNZXRob2QoJ2tleXMnKTtcclxud3JhcE9iamVjdE1ldGhvZCgnZ2V0T3duUHJvcGVydHlOYW1lcycpOyIsbnVsbCwiLyohXG4gKiBUaGUgYnVmZmVyIG1vZHVsZSBmcm9tIG5vZGUuanMsIGZvciB0aGUgYnJvd3Nlci5cbiAqXG4gKiBAYXV0aG9yICAgRmVyb3NzIEFib3VraGFkaWplaCA8ZmVyb3NzQGZlcm9zcy5vcmc+IDxodHRwOi8vZmVyb3NzLm9yZz5cbiAqIEBsaWNlbnNlICBNSVRcbiAqL1xuXG52YXIgYmFzZTY0ID0gcmVxdWlyZSgnYmFzZTY0LWpzJylcbnZhciBpZWVlNzU0ID0gcmVxdWlyZSgnaWVlZTc1NCcpXG52YXIgaXNBcnJheSA9IHJlcXVpcmUoJ2lzLWFycmF5JylcblxuZXhwb3J0cy5CdWZmZXIgPSBCdWZmZXJcbmV4cG9ydHMuU2xvd0J1ZmZlciA9IFNsb3dCdWZmZXJcbmV4cG9ydHMuSU5TUEVDVF9NQVhfQllURVMgPSA1MFxuQnVmZmVyLnBvb2xTaXplID0gODE5MiAvLyBub3QgdXNlZCBieSB0aGlzIGltcGxlbWVudGF0aW9uXG5cbnZhciBrTWF4TGVuZ3RoID0gMHgzZmZmZmZmZlxudmFyIHJvb3RQYXJlbnQgPSB7fVxuXG4vKipcbiAqIElmIGBCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVGA6XG4gKiAgID09PSB0cnVlICAgIFVzZSBVaW50OEFycmF5IGltcGxlbWVudGF0aW9uIChmYXN0ZXN0KVxuICogICA9PT0gZmFsc2UgICBVc2UgT2JqZWN0IGltcGxlbWVudGF0aW9uIChtb3N0IGNvbXBhdGlibGUsIGV2ZW4gSUU2KVxuICpcbiAqIEJyb3dzZXJzIHRoYXQgc3VwcG9ydCB0eXBlZCBhcnJheXMgYXJlIElFIDEwKywgRmlyZWZveCA0KywgQ2hyb21lIDcrLCBTYWZhcmkgNS4xKyxcbiAqIE9wZXJhIDExLjYrLCBpT1MgNC4yKy5cbiAqXG4gKiBOb3RlOlxuICpcbiAqIC0gSW1wbGVtZW50YXRpb24gbXVzdCBzdXBwb3J0IGFkZGluZyBuZXcgcHJvcGVydGllcyB0byBgVWludDhBcnJheWAgaW5zdGFuY2VzLlxuICogICBGaXJlZm94IDQtMjkgbGFja2VkIHN1cHBvcnQsIGZpeGVkIGluIEZpcmVmb3ggMzArLlxuICogICBTZWU6IGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTY5NTQzOC5cbiAqXG4gKiAgLSBDaHJvbWUgOS0xMCBpcyBtaXNzaW5nIHRoZSBgVHlwZWRBcnJheS5wcm90b3R5cGUuc3ViYXJyYXlgIGZ1bmN0aW9uLlxuICpcbiAqICAtIElFMTAgaGFzIGEgYnJva2VuIGBUeXBlZEFycmF5LnByb3RvdHlwZS5zdWJhcnJheWAgZnVuY3Rpb24gd2hpY2ggcmV0dXJucyBhcnJheXMgb2ZcbiAqICAgIGluY29ycmVjdCBsZW5ndGggaW4gc29tZSBzaXR1YXRpb25zLlxuICpcbiAqIFdlIGRldGVjdCB0aGVzZSBidWdneSBicm93c2VycyBhbmQgc2V0IGBCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVGAgdG8gYGZhbHNlYCBzbyB0aGV5IHdpbGxcbiAqIGdldCB0aGUgT2JqZWN0IGltcGxlbWVudGF0aW9uLCB3aGljaCBpcyBzbG93ZXIgYnV0IHdpbGwgd29yayBjb3JyZWN0bHkuXG4gKi9cbkJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUID0gKGZ1bmN0aW9uICgpIHtcbiAgdHJ5IHtcbiAgICB2YXIgYnVmID0gbmV3IEFycmF5QnVmZmVyKDApXG4gICAgdmFyIGFyciA9IG5ldyBVaW50OEFycmF5KGJ1ZilcbiAgICBhcnIuZm9vID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gNDIgfVxuICAgIHJldHVybiBhcnIuZm9vKCkgPT09IDQyICYmIC8vIHR5cGVkIGFycmF5IGluc3RhbmNlcyBjYW4gYmUgYXVnbWVudGVkXG4gICAgICAgIHR5cGVvZiBhcnIuc3ViYXJyYXkgPT09ICdmdW5jdGlvbicgJiYgLy8gY2hyb21lIDktMTAgbGFjayBgc3ViYXJyYXlgXG4gICAgICAgIG5ldyBVaW50OEFycmF5KDEpLnN1YmFycmF5KDEsIDEpLmJ5dGVMZW5ndGggPT09IDAgLy8gaWUxMCBoYXMgYnJva2VuIGBzdWJhcnJheWBcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG59KSgpXG5cbi8qKlxuICogQ2xhc3M6IEJ1ZmZlclxuICogPT09PT09PT09PT09PVxuICpcbiAqIFRoZSBCdWZmZXIgY29uc3RydWN0b3IgcmV0dXJucyBpbnN0YW5jZXMgb2YgYFVpbnQ4QXJyYXlgIHRoYXQgYXJlIGF1Z21lbnRlZFxuICogd2l0aCBmdW5jdGlvbiBwcm9wZXJ0aWVzIGZvciBhbGwgdGhlIG5vZGUgYEJ1ZmZlcmAgQVBJIGZ1bmN0aW9ucy4gV2UgdXNlXG4gKiBgVWludDhBcnJheWAgc28gdGhhdCBzcXVhcmUgYnJhY2tldCBub3RhdGlvbiB3b3JrcyBhcyBleHBlY3RlZCAtLSBpdCByZXR1cm5zXG4gKiBhIHNpbmdsZSBvY3RldC5cbiAqXG4gKiBCeSBhdWdtZW50aW5nIHRoZSBpbnN0YW5jZXMsIHdlIGNhbiBhdm9pZCBtb2RpZnlpbmcgdGhlIGBVaW50OEFycmF5YFxuICogcHJvdG90eXBlLlxuICovXG5mdW5jdGlvbiBCdWZmZXIgKHN1YmplY3QsIGVuY29kaW5nKSB7XG4gIHZhciBzZWxmID0gdGhpc1xuICBpZiAoIShzZWxmIGluc3RhbmNlb2YgQnVmZmVyKSkgcmV0dXJuIG5ldyBCdWZmZXIoc3ViamVjdCwgZW5jb2RpbmcpXG5cbiAgdmFyIHR5cGUgPSB0eXBlb2Ygc3ViamVjdFxuICB2YXIgbGVuZ3RoXG5cbiAgaWYgKHR5cGUgPT09ICdudW1iZXInKSB7XG4gICAgbGVuZ3RoID0gK3N1YmplY3RcbiAgfSBlbHNlIGlmICh0eXBlID09PSAnc3RyaW5nJykge1xuICAgIGxlbmd0aCA9IEJ1ZmZlci5ieXRlTGVuZ3RoKHN1YmplY3QsIGVuY29kaW5nKVxuICB9IGVsc2UgaWYgKHR5cGUgPT09ICdvYmplY3QnICYmIHN1YmplY3QgIT09IG51bGwpIHtcbiAgICAvLyBhc3N1bWUgb2JqZWN0IGlzIGFycmF5LWxpa2VcbiAgICBpZiAoc3ViamVjdC50eXBlID09PSAnQnVmZmVyJyAmJiBpc0FycmF5KHN1YmplY3QuZGF0YSkpIHN1YmplY3QgPSBzdWJqZWN0LmRhdGFcbiAgICBsZW5ndGggPSArc3ViamVjdC5sZW5ndGhcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdtdXN0IHN0YXJ0IHdpdGggbnVtYmVyLCBidWZmZXIsIGFycmF5IG9yIHN0cmluZycpXG4gIH1cblxuICBpZiAobGVuZ3RoID4ga01heExlbmd0aCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdBdHRlbXB0IHRvIGFsbG9jYXRlIEJ1ZmZlciBsYXJnZXIgdGhhbiBtYXhpbXVtIHNpemU6IDB4JyArXG4gICAgICBrTWF4TGVuZ3RoLnRvU3RyaW5nKDE2KSArICcgYnl0ZXMnKVxuICB9XG5cbiAgaWYgKGxlbmd0aCA8IDApIGxlbmd0aCA9IDBcbiAgZWxzZSBsZW5ndGggPj4+PSAwIC8vIGNvZXJjZSB0byB1aW50MzJcblxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICAvLyBQcmVmZXJyZWQ6IFJldHVybiBhbiBhdWdtZW50ZWQgYFVpbnQ4QXJyYXlgIGluc3RhbmNlIGZvciBiZXN0IHBlcmZvcm1hbmNlXG4gICAgc2VsZiA9IEJ1ZmZlci5fYXVnbWVudChuZXcgVWludDhBcnJheShsZW5ndGgpKSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNvbnNpc3RlbnQtdGhpc1xuICB9IGVsc2Uge1xuICAgIC8vIEZhbGxiYWNrOiBSZXR1cm4gVEhJUyBpbnN0YW5jZSBvZiBCdWZmZXIgKGNyZWF0ZWQgYnkgYG5ld2ApXG4gICAgc2VsZi5sZW5ndGggPSBsZW5ndGhcbiAgICBzZWxmLl9pc0J1ZmZlciA9IHRydWVcbiAgfVxuXG4gIHZhciBpXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCAmJiB0eXBlb2Ygc3ViamVjdC5ieXRlTGVuZ3RoID09PSAnbnVtYmVyJykge1xuICAgIC8vIFNwZWVkIG9wdGltaXphdGlvbiAtLSB1c2Ugc2V0IGlmIHdlJ3JlIGNvcHlpbmcgZnJvbSBhIHR5cGVkIGFycmF5XG4gICAgc2VsZi5fc2V0KHN1YmplY3QpXG4gIH0gZWxzZSBpZiAoaXNBcnJheWlzaChzdWJqZWN0KSkge1xuICAgIC8vIFRyZWF0IGFycmF5LWlzaCBvYmplY3RzIGFzIGEgYnl0ZSBhcnJheVxuICAgIGlmIChCdWZmZXIuaXNCdWZmZXIoc3ViamVjdCkpIHtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBzZWxmW2ldID0gc3ViamVjdC5yZWFkVUludDgoaSlcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHNlbGZbaV0gPSAoKHN1YmplY3RbaV0gJSAyNTYpICsgMjU2KSAlIDI1NlxuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIGlmICh0eXBlID09PSAnc3RyaW5nJykge1xuICAgIHNlbGYud3JpdGUoc3ViamVjdCwgMCwgZW5jb2RpbmcpXG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gJ251bWJlcicgJiYgIUJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBzZWxmW2ldID0gMFxuICAgIH1cbiAgfVxuXG4gIGlmIChsZW5ndGggPiAwICYmIGxlbmd0aCA8PSBCdWZmZXIucG9vbFNpemUpIHNlbGYucGFyZW50ID0gcm9vdFBhcmVudFxuXG4gIHJldHVybiBzZWxmXG59XG5cbmZ1bmN0aW9uIFNsb3dCdWZmZXIgKHN1YmplY3QsIGVuY29kaW5nKSB7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBTbG93QnVmZmVyKSkgcmV0dXJuIG5ldyBTbG93QnVmZmVyKHN1YmplY3QsIGVuY29kaW5nKVxuXG4gIHZhciBidWYgPSBuZXcgQnVmZmVyKHN1YmplY3QsIGVuY29kaW5nKVxuICBkZWxldGUgYnVmLnBhcmVudFxuICByZXR1cm4gYnVmXG59XG5cbkJ1ZmZlci5pc0J1ZmZlciA9IGZ1bmN0aW9uIGlzQnVmZmVyIChiKSB7XG4gIHJldHVybiAhIShiICE9IG51bGwgJiYgYi5faXNCdWZmZXIpXG59XG5cbkJ1ZmZlci5jb21wYXJlID0gZnVuY3Rpb24gY29tcGFyZSAoYSwgYikge1xuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihhKSB8fCAhQnVmZmVyLmlzQnVmZmVyKGIpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnRzIG11c3QgYmUgQnVmZmVycycpXG4gIH1cblxuICBpZiAoYSA9PT0gYikgcmV0dXJuIDBcblxuICB2YXIgeCA9IGEubGVuZ3RoXG4gIHZhciB5ID0gYi5sZW5ndGhcbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IE1hdGgubWluKHgsIHkpOyBpIDwgbGVuICYmIGFbaV0gPT09IGJbaV07IGkrKykge31cbiAgaWYgKGkgIT09IGxlbikge1xuICAgIHggPSBhW2ldXG4gICAgeSA9IGJbaV1cbiAgfVxuICBpZiAoeCA8IHkpIHJldHVybiAtMVxuICBpZiAoeSA8IHgpIHJldHVybiAxXG4gIHJldHVybiAwXG59XG5cbkJ1ZmZlci5pc0VuY29kaW5nID0gZnVuY3Rpb24gaXNFbmNvZGluZyAoZW5jb2RpbmcpIHtcbiAgc3dpdGNoIChTdHJpbmcoZW5jb2RpbmcpLnRvTG93ZXJDYXNlKCkpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgIGNhc2UgJ3Jhdyc6XG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldHVybiB0cnVlXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbkJ1ZmZlci5jb25jYXQgPSBmdW5jdGlvbiBjb25jYXQgKGxpc3QsIHRvdGFsTGVuZ3RoKSB7XG4gIGlmICghaXNBcnJheShsaXN0KSkgdGhyb3cgbmV3IFR5cGVFcnJvcignbGlzdCBhcmd1bWVudCBtdXN0IGJlIGFuIEFycmF5IG9mIEJ1ZmZlcnMuJylcblxuICBpZiAobGlzdC5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gbmV3IEJ1ZmZlcigwKVxuICB9IGVsc2UgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgcmV0dXJuIGxpc3RbMF1cbiAgfVxuXG4gIHZhciBpXG4gIGlmICh0b3RhbExlbmd0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdG90YWxMZW5ndGggPSAwXG4gICAgZm9yIChpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRvdGFsTGVuZ3RoICs9IGxpc3RbaV0ubGVuZ3RoXG4gICAgfVxuICB9XG5cbiAgdmFyIGJ1ZiA9IG5ldyBCdWZmZXIodG90YWxMZW5ndGgpXG4gIHZhciBwb3MgPSAwXG4gIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGl0ZW0gPSBsaXN0W2ldXG4gICAgaXRlbS5jb3B5KGJ1ZiwgcG9zKVxuICAgIHBvcyArPSBpdGVtLmxlbmd0aFxuICB9XG4gIHJldHVybiBidWZcbn1cblxuQnVmZmVyLmJ5dGVMZW5ndGggPSBmdW5jdGlvbiBieXRlTGVuZ3RoIChzdHIsIGVuY29kaW5nKSB7XG4gIHZhciByZXRcbiAgc3RyID0gc3RyICsgJydcbiAgc3dpdGNoIChlbmNvZGluZyB8fCAndXRmOCcpIHtcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICBjYXNlICdyYXcnOlxuICAgICAgcmV0ID0gc3RyLmxlbmd0aFxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0ID0gc3RyLmxlbmd0aCAqIDJcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnaGV4JzpcbiAgICAgIHJldCA9IHN0ci5sZW5ndGggPj4+IDFcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgICAgcmV0ID0gdXRmOFRvQnl0ZXMoc3RyKS5sZW5ndGhcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgIHJldCA9IGJhc2U2NFRvQnl0ZXMoc3RyKS5sZW5ndGhcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldCA9IHN0ci5sZW5ndGhcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbi8vIHByZS1zZXQgZm9yIHZhbHVlcyB0aGF0IG1heSBleGlzdCBpbiB0aGUgZnV0dXJlXG5CdWZmZXIucHJvdG90eXBlLmxlbmd0aCA9IHVuZGVmaW5lZFxuQnVmZmVyLnByb3RvdHlwZS5wYXJlbnQgPSB1bmRlZmluZWRcblxuLy8gdG9TdHJpbmcoZW5jb2RpbmcsIHN0YXJ0PTAsIGVuZD1idWZmZXIubGVuZ3RoKVxuQnVmZmVyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nIChlbmNvZGluZywgc3RhcnQsIGVuZCkge1xuICB2YXIgbG93ZXJlZENhc2UgPSBmYWxzZVxuXG4gIHN0YXJ0ID0gc3RhcnQgPj4+IDBcbiAgZW5kID0gZW5kID09PSB1bmRlZmluZWQgfHwgZW5kID09PSBJbmZpbml0eSA/IHRoaXMubGVuZ3RoIDogZW5kID4+PiAwXG5cbiAgaWYgKCFlbmNvZGluZykgZW5jb2RpbmcgPSAndXRmOCdcbiAgaWYgKHN0YXJ0IDwgMCkgc3RhcnQgPSAwXG4gIGlmIChlbmQgPiB0aGlzLmxlbmd0aCkgZW5kID0gdGhpcy5sZW5ndGhcbiAgaWYgKGVuZCA8PSBzdGFydCkgcmV0dXJuICcnXG5cbiAgd2hpbGUgKHRydWUpIHtcbiAgICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgICBjYXNlICdoZXgnOlxuICAgICAgICByZXR1cm4gaGV4U2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAndXRmOCc6XG4gICAgICBjYXNlICd1dGYtOCc6XG4gICAgICAgIHJldHVybiB1dGY4U2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAnYXNjaWknOlxuICAgICAgICByZXR1cm4gYXNjaWlTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICdiaW5hcnknOlxuICAgICAgICByZXR1cm4gYmluYXJ5U2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgICAgcmV0dXJuIGJhc2U2NFNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ3VjczInOlxuICAgICAgY2FzZSAndWNzLTInOlxuICAgICAgY2FzZSAndXRmMTZsZSc6XG4gICAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICAgIHJldHVybiB1dGYxNmxlU2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaWYgKGxvd2VyZWRDYXNlKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmtub3duIGVuY29kaW5nOiAnICsgZW5jb2RpbmcpXG4gICAgICAgIGVuY29kaW5nID0gKGVuY29kaW5nICsgJycpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgbG93ZXJlZENhc2UgPSB0cnVlXG4gICAgfVxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24gZXF1YWxzIChiKSB7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKGIpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudCBtdXN0IGJlIGEgQnVmZmVyJylcbiAgaWYgKHRoaXMgPT09IGIpIHJldHVybiB0cnVlXG4gIHJldHVybiBCdWZmZXIuY29tcGFyZSh0aGlzLCBiKSA9PT0gMFxufVxuXG5CdWZmZXIucHJvdG90eXBlLmluc3BlY3QgPSBmdW5jdGlvbiBpbnNwZWN0ICgpIHtcbiAgdmFyIHN0ciA9ICcnXG4gIHZhciBtYXggPSBleHBvcnRzLklOU1BFQ1RfTUFYX0JZVEVTXG4gIGlmICh0aGlzLmxlbmd0aCA+IDApIHtcbiAgICBzdHIgPSB0aGlzLnRvU3RyaW5nKCdoZXgnLCAwLCBtYXgpLm1hdGNoKC8uezJ9L2cpLmpvaW4oJyAnKVxuICAgIGlmICh0aGlzLmxlbmd0aCA+IG1heCkgc3RyICs9ICcgLi4uICdcbiAgfVxuICByZXR1cm4gJzxCdWZmZXIgJyArIHN0ciArICc+J1xufVxuXG5CdWZmZXIucHJvdG90eXBlLmNvbXBhcmUgPSBmdW5jdGlvbiBjb21wYXJlIChiKSB7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKGIpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudCBtdXN0IGJlIGEgQnVmZmVyJylcbiAgaWYgKHRoaXMgPT09IGIpIHJldHVybiAwXG4gIHJldHVybiBCdWZmZXIuY29tcGFyZSh0aGlzLCBiKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLmluZGV4T2YgPSBmdW5jdGlvbiBpbmRleE9mICh2YWwsIGJ5dGVPZmZzZXQpIHtcbiAgaWYgKGJ5dGVPZmZzZXQgPiAweDdmZmZmZmZmKSBieXRlT2Zmc2V0ID0gMHg3ZmZmZmZmZlxuICBlbHNlIGlmIChieXRlT2Zmc2V0IDwgLTB4ODAwMDAwMDApIGJ5dGVPZmZzZXQgPSAtMHg4MDAwMDAwMFxuICBieXRlT2Zmc2V0ID4+PSAwXG5cbiAgaWYgKHRoaXMubGVuZ3RoID09PSAwKSByZXR1cm4gLTFcbiAgaWYgKGJ5dGVPZmZzZXQgPj0gdGhpcy5sZW5ndGgpIHJldHVybiAtMVxuXG4gIC8vIE5lZ2F0aXZlIG9mZnNldHMgc3RhcnQgZnJvbSB0aGUgZW5kIG9mIHRoZSBidWZmZXJcbiAgaWYgKGJ5dGVPZmZzZXQgPCAwKSBieXRlT2Zmc2V0ID0gTWF0aC5tYXgodGhpcy5sZW5ndGggKyBieXRlT2Zmc2V0LCAwKVxuXG4gIGlmICh0eXBlb2YgdmFsID09PSAnc3RyaW5nJykge1xuICAgIGlmICh2YWwubGVuZ3RoID09PSAwKSByZXR1cm4gLTEgLy8gc3BlY2lhbCBjYXNlOiBsb29raW5nIGZvciBlbXB0eSBzdHJpbmcgYWx3YXlzIGZhaWxzXG4gICAgcmV0dXJuIFN0cmluZy5wcm90b3R5cGUuaW5kZXhPZi5jYWxsKHRoaXMsIHZhbCwgYnl0ZU9mZnNldClcbiAgfVxuICBpZiAoQnVmZmVyLmlzQnVmZmVyKHZhbCkpIHtcbiAgICByZXR1cm4gYXJyYXlJbmRleE9mKHRoaXMsIHZhbCwgYnl0ZU9mZnNldClcbiAgfVxuICBpZiAodHlwZW9mIHZhbCA9PT0gJ251bWJlcicpIHtcbiAgICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQgJiYgVWludDhBcnJheS5wcm90b3R5cGUuaW5kZXhPZiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIFVpbnQ4QXJyYXkucHJvdG90eXBlLmluZGV4T2YuY2FsbCh0aGlzLCB2YWwsIGJ5dGVPZmZzZXQpXG4gICAgfVxuICAgIHJldHVybiBhcnJheUluZGV4T2YodGhpcywgWyB2YWwgXSwgYnl0ZU9mZnNldClcbiAgfVxuXG4gIGZ1bmN0aW9uIGFycmF5SW5kZXhPZiAoYXJyLCB2YWwsIGJ5dGVPZmZzZXQpIHtcbiAgICB2YXIgZm91bmRJbmRleCA9IC0xXG4gICAgZm9yICh2YXIgaSA9IDA7IGJ5dGVPZmZzZXQgKyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoYXJyW2J5dGVPZmZzZXQgKyBpXSA9PT0gdmFsW2ZvdW5kSW5kZXggPT09IC0xID8gMCA6IGkgLSBmb3VuZEluZGV4XSkge1xuICAgICAgICBpZiAoZm91bmRJbmRleCA9PT0gLTEpIGZvdW5kSW5kZXggPSBpXG4gICAgICAgIGlmIChpIC0gZm91bmRJbmRleCArIDEgPT09IHZhbC5sZW5ndGgpIHJldHVybiBieXRlT2Zmc2V0ICsgZm91bmRJbmRleFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm91bmRJbmRleCA9IC0xXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAtMVxuICB9XG5cbiAgdGhyb3cgbmV3IFR5cGVFcnJvcigndmFsIG11c3QgYmUgc3RyaW5nLCBudW1iZXIgb3IgQnVmZmVyJylcbn1cblxuLy8gYGdldGAgd2lsbCBiZSByZW1vdmVkIGluIE5vZGUgMC4xMytcbkJ1ZmZlci5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gZ2V0IChvZmZzZXQpIHtcbiAgY29uc29sZS5sb2coJy5nZXQoKSBpcyBkZXByZWNhdGVkLiBBY2Nlc3MgdXNpbmcgYXJyYXkgaW5kZXhlcyBpbnN0ZWFkLicpXG4gIHJldHVybiB0aGlzLnJlYWRVSW50OChvZmZzZXQpXG59XG5cbi8vIGBzZXRgIHdpbGwgYmUgcmVtb3ZlZCBpbiBOb2RlIDAuMTMrXG5CdWZmZXIucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uIHNldCAodiwgb2Zmc2V0KSB7XG4gIGNvbnNvbGUubG9nKCcuc2V0KCkgaXMgZGVwcmVjYXRlZC4gQWNjZXNzIHVzaW5nIGFycmF5IGluZGV4ZXMgaW5zdGVhZC4nKVxuICByZXR1cm4gdGhpcy53cml0ZVVJbnQ4KHYsIG9mZnNldClcbn1cblxuZnVuY3Rpb24gaGV4V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICBvZmZzZXQgPSBOdW1iZXIob2Zmc2V0KSB8fCAwXG4gIHZhciByZW1haW5pbmcgPSBidWYubGVuZ3RoIC0gb2Zmc2V0XG4gIGlmICghbGVuZ3RoKSB7XG4gICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gIH0gZWxzZSB7XG4gICAgbGVuZ3RoID0gTnVtYmVyKGxlbmd0aClcbiAgICBpZiAobGVuZ3RoID4gcmVtYWluaW5nKSB7XG4gICAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgICB9XG4gIH1cblxuICAvLyBtdXN0IGJlIGFuIGV2ZW4gbnVtYmVyIG9mIGRpZ2l0c1xuICB2YXIgc3RyTGVuID0gc3RyaW5nLmxlbmd0aFxuICBpZiAoc3RyTGVuICUgMiAhPT0gMCkgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGhleCBzdHJpbmcnKVxuXG4gIGlmIChsZW5ndGggPiBzdHJMZW4gLyAyKSB7XG4gICAgbGVuZ3RoID0gc3RyTGVuIC8gMlxuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgcGFyc2VkID0gcGFyc2VJbnQoc3RyaW5nLnN1YnN0cihpICogMiwgMiksIDE2KVxuICAgIGlmIChpc05hTihwYXJzZWQpKSB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgaGV4IHN0cmluZycpXG4gICAgYnVmW29mZnNldCArIGldID0gcGFyc2VkXG4gIH1cbiAgcmV0dXJuIGlcbn1cblxuZnVuY3Rpb24gdXRmOFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IGJsaXRCdWZmZXIodXRmOFRvQnl0ZXMoc3RyaW5nLCBidWYubGVuZ3RoIC0gb2Zmc2V0KSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5mdW5jdGlvbiBhc2NpaVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IGJsaXRCdWZmZXIoYXNjaWlUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cbn1cblxuZnVuY3Rpb24gYmluYXJ5V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gYXNjaWlXcml0ZShidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIGJhc2U2NFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IGJsaXRCdWZmZXIoYmFzZTY0VG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbmZ1bmN0aW9uIHV0ZjE2bGVXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBibGl0QnVmZmVyKHV0ZjE2bGVUb0J5dGVzKHN0cmluZywgYnVmLmxlbmd0aCAtIG9mZnNldCksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uIHdyaXRlIChzdHJpbmcsIG9mZnNldCwgbGVuZ3RoLCBlbmNvZGluZykge1xuICAvLyBTdXBwb3J0IGJvdGggKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgsIGVuY29kaW5nKVxuICAvLyBhbmQgdGhlIGxlZ2FjeSAoc3RyaW5nLCBlbmNvZGluZywgb2Zmc2V0LCBsZW5ndGgpXG4gIGlmIChpc0Zpbml0ZShvZmZzZXQpKSB7XG4gICAgaWYgKCFpc0Zpbml0ZShsZW5ndGgpKSB7XG4gICAgICBlbmNvZGluZyA9IGxlbmd0aFxuICAgICAgbGVuZ3RoID0gdW5kZWZpbmVkXG4gICAgfVxuICB9IGVsc2UgeyAgLy8gbGVnYWN5XG4gICAgdmFyIHN3YXAgPSBlbmNvZGluZ1xuICAgIGVuY29kaW5nID0gb2Zmc2V0XG4gICAgb2Zmc2V0ID0gbGVuZ3RoXG4gICAgbGVuZ3RoID0gc3dhcFxuICB9XG5cbiAgb2Zmc2V0ID0gTnVtYmVyKG9mZnNldCkgfHwgMFxuXG4gIGlmIChsZW5ndGggPCAwIHx8IG9mZnNldCA8IDAgfHwgb2Zmc2V0ID4gdGhpcy5sZW5ndGgpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignYXR0ZW1wdCB0byB3cml0ZSBvdXRzaWRlIGJ1ZmZlciBib3VuZHMnKVxuICB9XG5cbiAgdmFyIHJlbWFpbmluZyA9IHRoaXMubGVuZ3RoIC0gb2Zmc2V0XG4gIGlmICghbGVuZ3RoKSB7XG4gICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gIH0gZWxzZSB7XG4gICAgbGVuZ3RoID0gTnVtYmVyKGxlbmd0aClcbiAgICBpZiAobGVuZ3RoID4gcmVtYWluaW5nKSB7XG4gICAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgICB9XG4gIH1cbiAgZW5jb2RpbmcgPSBTdHJpbmcoZW5jb2RpbmcgfHwgJ3V0ZjgnKS50b0xvd2VyQ2FzZSgpXG5cbiAgdmFyIHJldFxuICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICAgIHJldCA9IGhleFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgIHJldCA9IHV0ZjhXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgICByZXQgPSBhc2NpaVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICByZXQgPSBiaW5hcnlXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgcmV0ID0gYmFzZTY0V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldCA9IHV0ZjE2bGVXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVW5rbm93biBlbmNvZGluZzogJyArIGVuY29kaW5nKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbiB0b0pTT04gKCkge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdCdWZmZXInLFxuICAgIGRhdGE6IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHRoaXMuX2FyciB8fCB0aGlzLCAwKVxuICB9XG59XG5cbmZ1bmN0aW9uIGJhc2U2NFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgaWYgKHN0YXJ0ID09PSAwICYmIGVuZCA9PT0gYnVmLmxlbmd0aCkge1xuICAgIHJldHVybiBiYXNlNjQuZnJvbUJ5dGVBcnJheShidWYpXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1Zi5zbGljZShzdGFydCwgZW5kKSlcbiAgfVxufVxuXG5mdW5jdGlvbiB1dGY4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgcmVzID0gJydcbiAgdmFyIHRtcCA9ICcnXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIGlmIChidWZbaV0gPD0gMHg3Rikge1xuICAgICAgcmVzICs9IGRlY29kZVV0ZjhDaGFyKHRtcCkgKyBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSlcbiAgICAgIHRtcCA9ICcnXG4gICAgfSBlbHNlIHtcbiAgICAgIHRtcCArPSAnJScgKyBidWZbaV0udG9TdHJpbmcoMTYpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlcyArIGRlY29kZVV0ZjhDaGFyKHRtcClcbn1cblxuZnVuY3Rpb24gYXNjaWlTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciByZXQgPSAnJ1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICByZXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0gJiAweDdGKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuZnVuY3Rpb24gYmluYXJ5U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgcmV0ID0gJydcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgcmV0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuZnVuY3Rpb24gaGV4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuXG4gIGlmICghc3RhcnQgfHwgc3RhcnQgPCAwKSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgfHwgZW5kIDwgMCB8fCBlbmQgPiBsZW4pIGVuZCA9IGxlblxuXG4gIHZhciBvdXQgPSAnJ1xuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIG91dCArPSB0b0hleChidWZbaV0pXG4gIH1cbiAgcmV0dXJuIG91dFxufVxuXG5mdW5jdGlvbiB1dGYxNmxlU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgYnl0ZXMgPSBidWYuc2xpY2Uoc3RhcnQsIGVuZClcbiAgdmFyIHJlcyA9ICcnXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICByZXMgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXSArIGJ5dGVzW2kgKyAxXSAqIDI1NilcbiAgfVxuICByZXR1cm4gcmVzXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuc2xpY2UgPSBmdW5jdGlvbiBzbGljZSAoc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgc3RhcnQgPSB+fnN0YXJ0XG4gIGVuZCA9IGVuZCA9PT0gdW5kZWZpbmVkID8gbGVuIDogfn5lbmRcblxuICBpZiAoc3RhcnQgPCAwKSB7XG4gICAgc3RhcnQgKz0gbGVuXG4gICAgaWYgKHN0YXJ0IDwgMCkgc3RhcnQgPSAwXG4gIH0gZWxzZSBpZiAoc3RhcnQgPiBsZW4pIHtcbiAgICBzdGFydCA9IGxlblxuICB9XG5cbiAgaWYgKGVuZCA8IDApIHtcbiAgICBlbmQgKz0gbGVuXG4gICAgaWYgKGVuZCA8IDApIGVuZCA9IDBcbiAgfSBlbHNlIGlmIChlbmQgPiBsZW4pIHtcbiAgICBlbmQgPSBsZW5cbiAgfVxuXG4gIGlmIChlbmQgPCBzdGFydCkgZW5kID0gc3RhcnRcblxuICB2YXIgbmV3QnVmXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIG5ld0J1ZiA9IEJ1ZmZlci5fYXVnbWVudCh0aGlzLnN1YmFycmF5KHN0YXJ0LCBlbmQpKVxuICB9IGVsc2Uge1xuICAgIHZhciBzbGljZUxlbiA9IGVuZCAtIHN0YXJ0XG4gICAgbmV3QnVmID0gbmV3IEJ1ZmZlcihzbGljZUxlbiwgdW5kZWZpbmVkKVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2xpY2VMZW47IGkrKykge1xuICAgICAgbmV3QnVmW2ldID0gdGhpc1tpICsgc3RhcnRdXG4gICAgfVxuICB9XG5cbiAgaWYgKG5ld0J1Zi5sZW5ndGgpIG5ld0J1Zi5wYXJlbnQgPSB0aGlzLnBhcmVudCB8fCB0aGlzXG5cbiAgcmV0dXJuIG5ld0J1ZlxufVxuXG4vKlxuICogTmVlZCB0byBtYWtlIHN1cmUgdGhhdCBidWZmZXIgaXNuJ3QgdHJ5aW5nIHRvIHdyaXRlIG91dCBvZiBib3VuZHMuXG4gKi9cbmZ1bmN0aW9uIGNoZWNrT2Zmc2V0IChvZmZzZXQsIGV4dCwgbGVuZ3RoKSB7XG4gIGlmICgob2Zmc2V0ICUgMSkgIT09IDAgfHwgb2Zmc2V0IDwgMCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ29mZnNldCBpcyBub3QgdWludCcpXG4gIGlmIChvZmZzZXQgKyBleHQgPiBsZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdUcnlpbmcgdG8gYWNjZXNzIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludExFID0gZnVuY3Rpb24gcmVhZFVJbnRMRSAob2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCBieXRlTGVuZ3RoLCB0aGlzLmxlbmd0aClcblxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXRdXG4gIHZhciBtdWwgPSAxXG4gIHZhciBpID0gMFxuICB3aGlsZSAoKytpIDwgYnl0ZUxlbmd0aCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHZhbCArPSB0aGlzW29mZnNldCArIGldICogbXVsXG4gIH1cblxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnRCRSA9IGZ1bmN0aW9uIHJlYWRVSW50QkUgKG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBjaGVja09mZnNldChvZmZzZXQsIGJ5dGVMZW5ndGgsIHRoaXMubGVuZ3RoKVxuICB9XG5cbiAgdmFyIHZhbCA9IHRoaXNbb2Zmc2V0ICsgLS1ieXRlTGVuZ3RoXVxuICB2YXIgbXVsID0gMVxuICB3aGlsZSAoYnl0ZUxlbmd0aCA+IDAgJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB2YWwgKz0gdGhpc1tvZmZzZXQgKyAtLWJ5dGVMZW5ndGhdICogbXVsXG4gIH1cblxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQ4ID0gZnVuY3Rpb24gcmVhZFVJbnQ4IChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMSwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiB0aGlzW29mZnNldF1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2TEUgPSBmdW5jdGlvbiByZWFkVUludDE2TEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAyLCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIHRoaXNbb2Zmc2V0XSB8ICh0aGlzW29mZnNldCArIDFdIDw8IDgpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQxNkJFID0gZnVuY3Rpb24gcmVhZFVJbnQxNkJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMiwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiAodGhpc1tvZmZzZXRdIDw8IDgpIHwgdGhpc1tvZmZzZXQgKyAxXVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MzJMRSA9IGZ1bmN0aW9uIHJlYWRVSW50MzJMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuXG4gIHJldHVybiAoKHRoaXNbb2Zmc2V0XSkgfFxuICAgICAgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgOCkgfFxuICAgICAgKHRoaXNbb2Zmc2V0ICsgMl0gPDwgMTYpKSArXG4gICAgICAodGhpc1tvZmZzZXQgKyAzXSAqIDB4MTAwMDAwMClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyQkUgPSBmdW5jdGlvbiByZWFkVUludDMyQkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcblxuICByZXR1cm4gKHRoaXNbb2Zmc2V0XSAqIDB4MTAwMDAwMCkgK1xuICAgICgodGhpc1tvZmZzZXQgKyAxXSA8PCAxNikgfFxuICAgICh0aGlzW29mZnNldCArIDJdIDw8IDgpIHxcbiAgICB0aGlzW29mZnNldCArIDNdKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnRMRSA9IGZ1bmN0aW9uIHJlYWRJbnRMRSAob2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCBieXRlTGVuZ3RoLCB0aGlzLmxlbmd0aClcblxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXRdXG4gIHZhciBtdWwgPSAxXG4gIHZhciBpID0gMFxuICB3aGlsZSAoKytpIDwgYnl0ZUxlbmd0aCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHZhbCArPSB0aGlzW29mZnNldCArIGldICogbXVsXG4gIH1cbiAgbXVsICo9IDB4ODBcblxuICBpZiAodmFsID49IG11bCkgdmFsIC09IE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoKVxuXG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50QkUgPSBmdW5jdGlvbiByZWFkSW50QkUgKG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgYnl0ZUxlbmd0aCwgdGhpcy5sZW5ndGgpXG5cbiAgdmFyIGkgPSBieXRlTGVuZ3RoXG4gIHZhciBtdWwgPSAxXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldCArIC0taV1cbiAgd2hpbGUgKGkgPiAwICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdmFsICs9IHRoaXNbb2Zmc2V0ICsgLS1pXSAqIG11bFxuICB9XG4gIG11bCAqPSAweDgwXG5cbiAgaWYgKHZhbCA+PSBtdWwpIHZhbCAtPSBNYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aClcblxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDggPSBmdW5jdGlvbiByZWFkSW50OCAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDEsIHRoaXMubGVuZ3RoKVxuICBpZiAoISh0aGlzW29mZnNldF0gJiAweDgwKSkgcmV0dXJuICh0aGlzW29mZnNldF0pXG4gIHJldHVybiAoKDB4ZmYgLSB0aGlzW29mZnNldF0gKyAxKSAqIC0xKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkxFID0gZnVuY3Rpb24gcmVhZEludDE2TEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAyLCB0aGlzLmxlbmd0aClcbiAgdmFyIHZhbCA9IHRoaXNbb2Zmc2V0XSB8ICh0aGlzW29mZnNldCArIDFdIDw8IDgpXG4gIHJldHVybiAodmFsICYgMHg4MDAwKSA/IHZhbCB8IDB4RkZGRjAwMDAgOiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZCRSA9IGZ1bmN0aW9uIHJlYWRJbnQxNkJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMiwgdGhpcy5sZW5ndGgpXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldCArIDFdIHwgKHRoaXNbb2Zmc2V0XSA8PCA4KVxuICByZXR1cm4gKHZhbCAmIDB4ODAwMCkgPyB2YWwgfCAweEZGRkYwMDAwIDogdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyTEUgPSBmdW5jdGlvbiByZWFkSW50MzJMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuXG4gIHJldHVybiAodGhpc1tvZmZzZXRdKSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgOCkgfFxuICAgICh0aGlzW29mZnNldCArIDJdIDw8IDE2KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgM10gPDwgMjQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyQkUgPSBmdW5jdGlvbiByZWFkSW50MzJCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuXG4gIHJldHVybiAodGhpc1tvZmZzZXRdIDw8IDI0KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgMTYpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCA4KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgM10pXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEZsb2F0TEUgPSBmdW5jdGlvbiByZWFkRmxvYXRMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gaWVlZTc1NC5yZWFkKHRoaXMsIG9mZnNldCwgdHJ1ZSwgMjMsIDQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEZsb2F0QkUgPSBmdW5jdGlvbiByZWFkRmxvYXRCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gaWVlZTc1NC5yZWFkKHRoaXMsIG9mZnNldCwgZmFsc2UsIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVMRSA9IGZ1bmN0aW9uIHJlYWREb3VibGVMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDgsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gaWVlZTc1NC5yZWFkKHRoaXMsIG9mZnNldCwgdHJ1ZSwgNTIsIDgpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZERvdWJsZUJFID0gZnVuY3Rpb24gcmVhZERvdWJsZUJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgOCwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiBpZWVlNzU0LnJlYWQodGhpcywgb2Zmc2V0LCBmYWxzZSwgNTIsIDgpXG59XG5cbmZ1bmN0aW9uIGNoZWNrSW50IChidWYsIHZhbHVlLCBvZmZzZXQsIGV4dCwgbWF4LCBtaW4pIHtcbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoYnVmKSkgdGhyb3cgbmV3IFR5cGVFcnJvcignYnVmZmVyIG11c3QgYmUgYSBCdWZmZXIgaW5zdGFuY2UnKVxuICBpZiAodmFsdWUgPiBtYXggfHwgdmFsdWUgPCBtaW4pIHRocm93IG5ldyBSYW5nZUVycm9yKCd2YWx1ZSBpcyBvdXQgb2YgYm91bmRzJylcbiAgaWYgKG9mZnNldCArIGV4dCA+IGJ1Zi5sZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdpbmRleCBvdXQgb2YgcmFuZ2UnKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludExFID0gZnVuY3Rpb24gd3JpdGVVSW50TEUgKHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBNYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aCksIDApXG5cbiAgdmFyIG11bCA9IDFcbiAgdmFyIGkgPSAwXG4gIHRoaXNbb2Zmc2V0XSA9IHZhbHVlICYgMHhGRlxuICB3aGlsZSAoKytpIDwgYnl0ZUxlbmd0aCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHRoaXNbb2Zmc2V0ICsgaV0gPSAodmFsdWUgLyBtdWwpID4+PiAwICYgMHhGRlxuICB9XG5cbiAgcmV0dXJuIG9mZnNldCArIGJ5dGVMZW5ndGhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnRCRSA9IGZ1bmN0aW9uIHdyaXRlVUludEJFICh2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGgpLCAwKVxuXG4gIHZhciBpID0gYnl0ZUxlbmd0aCAtIDFcbiAgdmFyIG11bCA9IDFcbiAgdGhpc1tvZmZzZXQgKyBpXSA9IHZhbHVlICYgMHhGRlxuICB3aGlsZSAoLS1pID49IDAgJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB0aGlzW29mZnNldCArIGldID0gKHZhbHVlIC8gbXVsKSA+Pj4gMCAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50OCA9IGZ1bmN0aW9uIHdyaXRlVUludDggKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAxLCAweGZmLCAwKVxuICBpZiAoIUJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB2YWx1ZSA9IE1hdGguZmxvb3IodmFsdWUpXG4gIHRoaXNbb2Zmc2V0XSA9IHZhbHVlXG4gIHJldHVybiBvZmZzZXQgKyAxXG59XG5cbmZ1bmN0aW9uIG9iamVjdFdyaXRlVUludDE2IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbikge1xuICBpZiAodmFsdWUgPCAwKSB2YWx1ZSA9IDB4ZmZmZiArIHZhbHVlICsgMVxuICBmb3IgKHZhciBpID0gMCwgaiA9IE1hdGgubWluKGJ1Zi5sZW5ndGggLSBvZmZzZXQsIDIpOyBpIDwgajsgaSsrKSB7XG4gICAgYnVmW29mZnNldCArIGldID0gKHZhbHVlICYgKDB4ZmYgPDwgKDggKiAobGl0dGxlRW5kaWFuID8gaSA6IDEgLSBpKSkpKSA+Pj5cbiAgICAgIChsaXR0bGVFbmRpYW4gPyBpIDogMSAtIGkpICogOFxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MTZMRSA9IGZ1bmN0aW9uIHdyaXRlVUludDE2TEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAyLCAweGZmZmYsIDApXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXNbb2Zmc2V0XSA9IHZhbHVlXG4gICAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gOClcbiAgfSBlbHNlIHtcbiAgICBvYmplY3RXcml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlKVxuICB9XG4gIHJldHVybiBvZmZzZXQgKyAyXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MTZCRSA9IGZ1bmN0aW9uIHdyaXRlVUludDE2QkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAyLCAweGZmZmYsIDApXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gOClcbiAgICB0aGlzW29mZnNldCArIDFdID0gdmFsdWVcbiAgfSBlbHNlIHtcbiAgICBvYmplY3RXcml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSlcbiAgfVxuICByZXR1cm4gb2Zmc2V0ICsgMlxufVxuXG5mdW5jdGlvbiBvYmplY3RXcml0ZVVJbnQzMiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4pIHtcbiAgaWYgKHZhbHVlIDwgMCkgdmFsdWUgPSAweGZmZmZmZmZmICsgdmFsdWUgKyAxXG4gIGZvciAodmFyIGkgPSAwLCBqID0gTWF0aC5taW4oYnVmLmxlbmd0aCAtIG9mZnNldCwgNCk7IGkgPCBqOyBpKyspIHtcbiAgICBidWZbb2Zmc2V0ICsgaV0gPSAodmFsdWUgPj4+IChsaXR0bGVFbmRpYW4gPyBpIDogMyAtIGkpICogOCkgJiAweGZmXG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQzMkxFID0gZnVuY3Rpb24gd3JpdGVVSW50MzJMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDQsIDB4ZmZmZmZmZmYsIDApXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXNbb2Zmc2V0ICsgM10gPSAodmFsdWUgPj4+IDI0KVxuICAgIHRoaXNbb2Zmc2V0ICsgMl0gPSAodmFsdWUgPj4+IDE2KVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gICAgdGhpc1tvZmZzZXRdID0gdmFsdWVcbiAgfSBlbHNlIHtcbiAgICBvYmplY3RXcml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlKVxuICB9XG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJCRSA9IGZ1bmN0aW9uIHdyaXRlVUludDMyQkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweGZmZmZmZmZmLCAwKVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldF0gPSAodmFsdWUgPj4+IDI0KVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDE2KVxuICAgIHRoaXNbb2Zmc2V0ICsgMl0gPSAodmFsdWUgPj4+IDgpXG4gICAgdGhpc1tvZmZzZXQgKyAzXSA9IHZhbHVlXG4gIH0gZWxzZSB7XG4gICAgb2JqZWN0V3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UpXG4gIH1cbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludExFID0gZnVuY3Rpb24gd3JpdGVJbnRMRSAodmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBjaGVja0ludChcbiAgICAgIHRoaXMsIHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsXG4gICAgICBNYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aCAtIDEpIC0gMSxcbiAgICAgIC1NYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aCAtIDEpXG4gICAgKVxuICB9XG5cbiAgdmFyIGkgPSAwXG4gIHZhciBtdWwgPSAxXG4gIHZhciBzdWIgPSB2YWx1ZSA8IDAgPyAxIDogMFxuICB0aGlzW29mZnNldF0gPSB2YWx1ZSAmIDB4RkZcbiAgd2hpbGUgKCsraSA8IGJ5dGVMZW5ndGggJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB0aGlzW29mZnNldCArIGldID0gKCh2YWx1ZSAvIG11bCkgPj4gMCkgLSBzdWIgJiAweEZGXG4gIH1cblxuICByZXR1cm4gb2Zmc2V0ICsgYnl0ZUxlbmd0aFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50QkUgPSBmdW5jdGlvbiB3cml0ZUludEJFICh2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGNoZWNrSW50KFxuICAgICAgdGhpcywgdmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCxcbiAgICAgIE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoIC0gMSkgLSAxLFxuICAgICAgLU1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoIC0gMSlcbiAgICApXG4gIH1cblxuICB2YXIgaSA9IGJ5dGVMZW5ndGggLSAxXG4gIHZhciBtdWwgPSAxXG4gIHZhciBzdWIgPSB2YWx1ZSA8IDAgPyAxIDogMFxuICB0aGlzW29mZnNldCArIGldID0gdmFsdWUgJiAweEZGXG4gIHdoaWxlICgtLWkgPj0gMCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHRoaXNbb2Zmc2V0ICsgaV0gPSAoKHZhbHVlIC8gbXVsKSA+PiAwKSAtIHN1YiAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQ4ID0gZnVuY3Rpb24gd3JpdGVJbnQ4ICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMSwgMHg3ZiwgLTB4ODApXG4gIGlmICghQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHZhbHVlID0gTWF0aC5mbG9vcih2YWx1ZSlcbiAgaWYgKHZhbHVlIDwgMCkgdmFsdWUgPSAweGZmICsgdmFsdWUgKyAxXG4gIHRoaXNbb2Zmc2V0XSA9IHZhbHVlXG4gIHJldHVybiBvZmZzZXQgKyAxXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkxFID0gZnVuY3Rpb24gd3JpdGVJbnQxNkxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMiwgMHg3ZmZmLCAtMHg4MDAwKVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldF0gPSB2YWx1ZVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gIH0gZWxzZSB7XG4gICAgb2JqZWN0V3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSlcbiAgfVxuICByZXR1cm4gb2Zmc2V0ICsgMlxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZCRSA9IGZ1bmN0aW9uIHdyaXRlSW50MTZCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDIsIDB4N2ZmZiwgLTB4ODAwMClcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgdGhpc1tvZmZzZXRdID0gKHZhbHVlID4+PiA4KVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSB2YWx1ZVxuICB9IGVsc2Uge1xuICAgIG9iamVjdFdyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlKVxuICB9XG4gIHJldHVybiBvZmZzZXQgKyAyXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkxFID0gZnVuY3Rpb24gd3JpdGVJbnQzMkxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgNCwgMHg3ZmZmZmZmZiwgLTB4ODAwMDAwMDApXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXNbb2Zmc2V0XSA9IHZhbHVlXG4gICAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gOClcbiAgICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiAxNilcbiAgICB0aGlzW29mZnNldCArIDNdID0gKHZhbHVlID4+PiAyNClcbiAgfSBlbHNlIHtcbiAgICBvYmplY3RXcml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlKVxuICB9XG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkJFID0gZnVuY3Rpb24gd3JpdGVJbnQzMkJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgNCwgMHg3ZmZmZmZmZiwgLTB4ODAwMDAwMDApXG4gIGlmICh2YWx1ZSA8IDApIHZhbHVlID0gMHhmZmZmZmZmZiArIHZhbHVlICsgMVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldF0gPSAodmFsdWUgPj4+IDI0KVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDE2KVxuICAgIHRoaXNbb2Zmc2V0ICsgMl0gPSAodmFsdWUgPj4+IDgpXG4gICAgdGhpc1tvZmZzZXQgKyAzXSA9IHZhbHVlXG4gIH0gZWxzZSB7XG4gICAgb2JqZWN0V3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UpXG4gIH1cbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuZnVuY3Rpb24gY2hlY2tJRUVFNzU0IChidWYsIHZhbHVlLCBvZmZzZXQsIGV4dCwgbWF4LCBtaW4pIHtcbiAgaWYgKHZhbHVlID4gbWF4IHx8IHZhbHVlIDwgbWluKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcigndmFsdWUgaXMgb3V0IG9mIGJvdW5kcycpXG4gIGlmIChvZmZzZXQgKyBleHQgPiBidWYubGVuZ3RoKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignaW5kZXggb3V0IG9mIHJhbmdlJylcbiAgaWYgKG9mZnNldCA8IDApIHRocm93IG5ldyBSYW5nZUVycm9yKCdpbmRleCBvdXQgb2YgcmFuZ2UnKVxufVxuXG5mdW5jdGlvbiB3cml0ZUZsb2F0IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGNoZWNrSUVFRTc1NChidWYsIHZhbHVlLCBvZmZzZXQsIDQsIDMuNDAyODIzNDY2Mzg1Mjg4NmUrMzgsIC0zLjQwMjgyMzQ2NjM4NTI4ODZlKzM4KVxuICB9XG4gIGllZWU3NTQud3JpdGUoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDIzLCA0KVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRmxvYXRMRSA9IGZ1bmN0aW9uIHdyaXRlRmxvYXRMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHdyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVGbG9hdEJFID0gZnVuY3Rpb24gd3JpdGVGbG9hdEJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVGbG9hdCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIHdyaXRlRG91YmxlIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGNoZWNrSUVFRTc1NChidWYsIHZhbHVlLCBvZmZzZXQsIDgsIDEuNzk3NjkzMTM0ODYyMzE1N0UrMzA4LCAtMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgpXG4gIH1cbiAgaWVlZTc1NC53cml0ZShidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgNTIsIDgpXG4gIHJldHVybiBvZmZzZXQgKyA4XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVEb3VibGVMRSA9IGZ1bmN0aW9uIHdyaXRlRG91YmxlTEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiB3cml0ZURvdWJsZSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUJFID0gZnVuY3Rpb24gd3JpdGVEb3VibGVCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHdyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuLy8gY29weSh0YXJnZXRCdWZmZXIsIHRhcmdldFN0YXJ0PTAsIHNvdXJjZVN0YXJ0PTAsIHNvdXJjZUVuZD1idWZmZXIubGVuZ3RoKVxuQnVmZmVyLnByb3RvdHlwZS5jb3B5ID0gZnVuY3Rpb24gY29weSAodGFyZ2V0LCB0YXJnZXRfc3RhcnQsIHN0YXJ0LCBlbmQpIHtcbiAgaWYgKCFzdGFydCkgc3RhcnQgPSAwXG4gIGlmICghZW5kICYmIGVuZCAhPT0gMCkgZW5kID0gdGhpcy5sZW5ndGhcbiAgaWYgKHRhcmdldF9zdGFydCA+PSB0YXJnZXQubGVuZ3RoKSB0YXJnZXRfc3RhcnQgPSB0YXJnZXQubGVuZ3RoXG4gIGlmICghdGFyZ2V0X3N0YXJ0KSB0YXJnZXRfc3RhcnQgPSAwXG4gIGlmIChlbmQgPiAwICYmIGVuZCA8IHN0YXJ0KSBlbmQgPSBzdGFydFxuXG4gIC8vIENvcHkgMCBieXRlczsgd2UncmUgZG9uZVxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuIDBcbiAgaWYgKHRhcmdldC5sZW5ndGggPT09IDAgfHwgdGhpcy5sZW5ndGggPT09IDApIHJldHVybiAwXG5cbiAgLy8gRmF0YWwgZXJyb3IgY29uZGl0aW9uc1xuICBpZiAodGFyZ2V0X3N0YXJ0IDwgMCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCd0YXJnZXRTdGFydCBvdXQgb2YgYm91bmRzJylcbiAgfVxuICBpZiAoc3RhcnQgPCAwIHx8IHN0YXJ0ID49IHRoaXMubGVuZ3RoKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignc291cmNlU3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIGlmIChlbmQgPCAwKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignc291cmNlRW5kIG91dCBvZiBib3VuZHMnKVxuXG4gIC8vIEFyZSB3ZSBvb2I/XG4gIGlmIChlbmQgPiB0aGlzLmxlbmd0aCkgZW5kID0gdGhpcy5sZW5ndGhcbiAgaWYgKHRhcmdldC5sZW5ndGggLSB0YXJnZXRfc3RhcnQgPCBlbmQgLSBzdGFydCkge1xuICAgIGVuZCA9IHRhcmdldC5sZW5ndGggLSB0YXJnZXRfc3RhcnQgKyBzdGFydFxuICB9XG5cbiAgdmFyIGxlbiA9IGVuZCAtIHN0YXJ0XG5cbiAgaWYgKGxlbiA8IDEwMDAgfHwgIUJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgdGFyZ2V0W2kgKyB0YXJnZXRfc3RhcnRdID0gdGhpc1tpICsgc3RhcnRdXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHRhcmdldC5fc2V0KHRoaXMuc3ViYXJyYXkoc3RhcnQsIHN0YXJ0ICsgbGVuKSwgdGFyZ2V0X3N0YXJ0KVxuICB9XG5cbiAgcmV0dXJuIGxlblxufVxuXG4vLyBmaWxsKHZhbHVlLCBzdGFydD0wLCBlbmQ9YnVmZmVyLmxlbmd0aClcbkJ1ZmZlci5wcm90b3R5cGUuZmlsbCA9IGZ1bmN0aW9uIGZpbGwgKHZhbHVlLCBzdGFydCwgZW5kKSB7XG4gIGlmICghdmFsdWUpIHZhbHVlID0gMFxuICBpZiAoIXN0YXJ0KSBzdGFydCA9IDBcbiAgaWYgKCFlbmQpIGVuZCA9IHRoaXMubGVuZ3RoXG5cbiAgaWYgKGVuZCA8IHN0YXJ0KSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignZW5kIDwgc3RhcnQnKVxuXG4gIC8vIEZpbGwgMCBieXRlczsgd2UncmUgZG9uZVxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuXG4gIGlmICh0aGlzLmxlbmd0aCA9PT0gMCkgcmV0dXJuXG5cbiAgaWYgKHN0YXJ0IDwgMCB8fCBzdGFydCA+PSB0aGlzLmxlbmd0aCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ3N0YXJ0IG91dCBvZiBib3VuZHMnKVxuICBpZiAoZW5kIDwgMCB8fCBlbmQgPiB0aGlzLmxlbmd0aCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ2VuZCBvdXQgb2YgYm91bmRzJylcblxuICB2YXIgaVxuICBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xuICAgIGZvciAoaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICAgIHRoaXNbaV0gPSB2YWx1ZVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB2YXIgYnl0ZXMgPSB1dGY4VG9CeXRlcyh2YWx1ZS50b1N0cmluZygpKVxuICAgIHZhciBsZW4gPSBieXRlcy5sZW5ndGhcbiAgICBmb3IgKGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgICB0aGlzW2ldID0gYnl0ZXNbaSAlIGxlbl1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpc1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgYEFycmF5QnVmZmVyYCB3aXRoIHRoZSAqY29waWVkKiBtZW1vcnkgb2YgdGhlIGJ1ZmZlciBpbnN0YW5jZS5cbiAqIEFkZGVkIGluIE5vZGUgMC4xMi4gT25seSBhdmFpbGFibGUgaW4gYnJvd3NlcnMgdGhhdCBzdXBwb3J0IEFycmF5QnVmZmVyLlxuICovXG5CdWZmZXIucHJvdG90eXBlLnRvQXJyYXlCdWZmZXIgPSBmdW5jdGlvbiB0b0FycmF5QnVmZmVyICgpIHtcbiAgaWYgKHR5cGVvZiBVaW50OEFycmF5ICE9PSAndW5kZWZpbmVkJykge1xuICAgIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgICAgcmV0dXJuIChuZXcgQnVmZmVyKHRoaXMpKS5idWZmZXJcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGJ1ZiA9IG5ldyBVaW50OEFycmF5KHRoaXMubGVuZ3RoKVxuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGJ1Zi5sZW5ndGg7IGkgPCBsZW47IGkgKz0gMSkge1xuICAgICAgICBidWZbaV0gPSB0aGlzW2ldXG4gICAgICB9XG4gICAgICByZXR1cm4gYnVmLmJ1ZmZlclxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdCdWZmZXIudG9BcnJheUJ1ZmZlciBub3Qgc3VwcG9ydGVkIGluIHRoaXMgYnJvd3NlcicpXG4gIH1cbn1cblxuLy8gSEVMUEVSIEZVTkNUSU9OU1xuLy8gPT09PT09PT09PT09PT09PVxuXG52YXIgQlAgPSBCdWZmZXIucHJvdG90eXBlXG5cbi8qKlxuICogQXVnbWVudCBhIFVpbnQ4QXJyYXkgKmluc3RhbmNlKiAobm90IHRoZSBVaW50OEFycmF5IGNsYXNzISkgd2l0aCBCdWZmZXIgbWV0aG9kc1xuICovXG5CdWZmZXIuX2F1Z21lbnQgPSBmdW5jdGlvbiBfYXVnbWVudCAoYXJyKSB7XG4gIGFyci5jb25zdHJ1Y3RvciA9IEJ1ZmZlclxuICBhcnIuX2lzQnVmZmVyID0gdHJ1ZVxuXG4gIC8vIHNhdmUgcmVmZXJlbmNlIHRvIG9yaWdpbmFsIFVpbnQ4QXJyYXkgc2V0IG1ldGhvZCBiZWZvcmUgb3ZlcndyaXRpbmdcbiAgYXJyLl9zZXQgPSBhcnIuc2V0XG5cbiAgLy8gZGVwcmVjYXRlZCwgd2lsbCBiZSByZW1vdmVkIGluIG5vZGUgMC4xMytcbiAgYXJyLmdldCA9IEJQLmdldFxuICBhcnIuc2V0ID0gQlAuc2V0XG5cbiAgYXJyLndyaXRlID0gQlAud3JpdGVcbiAgYXJyLnRvU3RyaW5nID0gQlAudG9TdHJpbmdcbiAgYXJyLnRvTG9jYWxlU3RyaW5nID0gQlAudG9TdHJpbmdcbiAgYXJyLnRvSlNPTiA9IEJQLnRvSlNPTlxuICBhcnIuZXF1YWxzID0gQlAuZXF1YWxzXG4gIGFyci5jb21wYXJlID0gQlAuY29tcGFyZVxuICBhcnIuaW5kZXhPZiA9IEJQLmluZGV4T2ZcbiAgYXJyLmNvcHkgPSBCUC5jb3B5XG4gIGFyci5zbGljZSA9IEJQLnNsaWNlXG4gIGFyci5yZWFkVUludExFID0gQlAucmVhZFVJbnRMRVxuICBhcnIucmVhZFVJbnRCRSA9IEJQLnJlYWRVSW50QkVcbiAgYXJyLnJlYWRVSW50OCA9IEJQLnJlYWRVSW50OFxuICBhcnIucmVhZFVJbnQxNkxFID0gQlAucmVhZFVJbnQxNkxFXG4gIGFyci5yZWFkVUludDE2QkUgPSBCUC5yZWFkVUludDE2QkVcbiAgYXJyLnJlYWRVSW50MzJMRSA9IEJQLnJlYWRVSW50MzJMRVxuICBhcnIucmVhZFVJbnQzMkJFID0gQlAucmVhZFVJbnQzMkJFXG4gIGFyci5yZWFkSW50TEUgPSBCUC5yZWFkSW50TEVcbiAgYXJyLnJlYWRJbnRCRSA9IEJQLnJlYWRJbnRCRVxuICBhcnIucmVhZEludDggPSBCUC5yZWFkSW50OFxuICBhcnIucmVhZEludDE2TEUgPSBCUC5yZWFkSW50MTZMRVxuICBhcnIucmVhZEludDE2QkUgPSBCUC5yZWFkSW50MTZCRVxuICBhcnIucmVhZEludDMyTEUgPSBCUC5yZWFkSW50MzJMRVxuICBhcnIucmVhZEludDMyQkUgPSBCUC5yZWFkSW50MzJCRVxuICBhcnIucmVhZEZsb2F0TEUgPSBCUC5yZWFkRmxvYXRMRVxuICBhcnIucmVhZEZsb2F0QkUgPSBCUC5yZWFkRmxvYXRCRVxuICBhcnIucmVhZERvdWJsZUxFID0gQlAucmVhZERvdWJsZUxFXG4gIGFyci5yZWFkRG91YmxlQkUgPSBCUC5yZWFkRG91YmxlQkVcbiAgYXJyLndyaXRlVUludDggPSBCUC53cml0ZVVJbnQ4XG4gIGFyci53cml0ZVVJbnRMRSA9IEJQLndyaXRlVUludExFXG4gIGFyci53cml0ZVVJbnRCRSA9IEJQLndyaXRlVUludEJFXG4gIGFyci53cml0ZVVJbnQxNkxFID0gQlAud3JpdGVVSW50MTZMRVxuICBhcnIud3JpdGVVSW50MTZCRSA9IEJQLndyaXRlVUludDE2QkVcbiAgYXJyLndyaXRlVUludDMyTEUgPSBCUC53cml0ZVVJbnQzMkxFXG4gIGFyci53cml0ZVVJbnQzMkJFID0gQlAud3JpdGVVSW50MzJCRVxuICBhcnIud3JpdGVJbnRMRSA9IEJQLndyaXRlSW50TEVcbiAgYXJyLndyaXRlSW50QkUgPSBCUC53cml0ZUludEJFXG4gIGFyci53cml0ZUludDggPSBCUC53cml0ZUludDhcbiAgYXJyLndyaXRlSW50MTZMRSA9IEJQLndyaXRlSW50MTZMRVxuICBhcnIud3JpdGVJbnQxNkJFID0gQlAud3JpdGVJbnQxNkJFXG4gIGFyci53cml0ZUludDMyTEUgPSBCUC53cml0ZUludDMyTEVcbiAgYXJyLndyaXRlSW50MzJCRSA9IEJQLndyaXRlSW50MzJCRVxuICBhcnIud3JpdGVGbG9hdExFID0gQlAud3JpdGVGbG9hdExFXG4gIGFyci53cml0ZUZsb2F0QkUgPSBCUC53cml0ZUZsb2F0QkVcbiAgYXJyLndyaXRlRG91YmxlTEUgPSBCUC53cml0ZURvdWJsZUxFXG4gIGFyci53cml0ZURvdWJsZUJFID0gQlAud3JpdGVEb3VibGVCRVxuICBhcnIuZmlsbCA9IEJQLmZpbGxcbiAgYXJyLmluc3BlY3QgPSBCUC5pbnNwZWN0XG4gIGFyci50b0FycmF5QnVmZmVyID0gQlAudG9BcnJheUJ1ZmZlclxuXG4gIHJldHVybiBhcnJcbn1cblxudmFyIElOVkFMSURfQkFTRTY0X1JFID0gL1teK1xcLzAtOUEtelxcLV0vZ1xuXG5mdW5jdGlvbiBiYXNlNjRjbGVhbiAoc3RyKSB7XG4gIC8vIE5vZGUgc3RyaXBzIG91dCBpbnZhbGlkIGNoYXJhY3RlcnMgbGlrZSBcXG4gYW5kIFxcdCBmcm9tIHRoZSBzdHJpbmcsIGJhc2U2NC1qcyBkb2VzIG5vdFxuICBzdHIgPSBzdHJpbmd0cmltKHN0cikucmVwbGFjZShJTlZBTElEX0JBU0U2NF9SRSwgJycpXG4gIC8vIE5vZGUgY29udmVydHMgc3RyaW5ncyB3aXRoIGxlbmd0aCA8IDIgdG8gJydcbiAgaWYgKHN0ci5sZW5ndGggPCAyKSByZXR1cm4gJydcbiAgLy8gTm9kZSBhbGxvd3MgZm9yIG5vbi1wYWRkZWQgYmFzZTY0IHN0cmluZ3MgKG1pc3NpbmcgdHJhaWxpbmcgPT09KSwgYmFzZTY0LWpzIGRvZXMgbm90XG4gIHdoaWxlIChzdHIubGVuZ3RoICUgNCAhPT0gMCkge1xuICAgIHN0ciA9IHN0ciArICc9J1xuICB9XG4gIHJldHVybiBzdHJcbn1cblxuZnVuY3Rpb24gc3RyaW5ndHJpbSAoc3RyKSB7XG4gIGlmIChzdHIudHJpbSkgcmV0dXJuIHN0ci50cmltKClcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJylcbn1cblxuZnVuY3Rpb24gaXNBcnJheWlzaCAoc3ViamVjdCkge1xuICByZXR1cm4gaXNBcnJheShzdWJqZWN0KSB8fCBCdWZmZXIuaXNCdWZmZXIoc3ViamVjdCkgfHxcbiAgICAgIHN1YmplY3QgJiYgdHlwZW9mIHN1YmplY3QgPT09ICdvYmplY3QnICYmXG4gICAgICB0eXBlb2Ygc3ViamVjdC5sZW5ndGggPT09ICdudW1iZXInXG59XG5cbmZ1bmN0aW9uIHRvSGV4IChuKSB7XG4gIGlmIChuIDwgMTYpIHJldHVybiAnMCcgKyBuLnRvU3RyaW5nKDE2KVxuICByZXR1cm4gbi50b1N0cmluZygxNilcbn1cblxuZnVuY3Rpb24gdXRmOFRvQnl0ZXMgKHN0cmluZywgdW5pdHMpIHtcbiAgdW5pdHMgPSB1bml0cyB8fCBJbmZpbml0eVxuICB2YXIgY29kZVBvaW50XG4gIHZhciBsZW5ndGggPSBzdHJpbmcubGVuZ3RoXG4gIHZhciBsZWFkU3Vycm9nYXRlID0gbnVsbFxuICB2YXIgYnl0ZXMgPSBbXVxuICB2YXIgaSA9IDBcblxuICBmb3IgKDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgY29kZVBvaW50ID0gc3RyaW5nLmNoYXJDb2RlQXQoaSlcblxuICAgIC8vIGlzIHN1cnJvZ2F0ZSBjb21wb25lbnRcbiAgICBpZiAoY29kZVBvaW50ID4gMHhEN0ZGICYmIGNvZGVQb2ludCA8IDB4RTAwMCkge1xuICAgICAgLy8gbGFzdCBjaGFyIHdhcyBhIGxlYWRcbiAgICAgIGlmIChsZWFkU3Vycm9nYXRlKSB7XG4gICAgICAgIC8vIDIgbGVhZHMgaW4gYSByb3dcbiAgICAgICAgaWYgKGNvZGVQb2ludCA8IDB4REMwMCkge1xuICAgICAgICAgIGlmICgodW5pdHMgLT0gMykgPiAtMSkgYnl0ZXMucHVzaCgweEVGLCAweEJGLCAweEJEKVxuICAgICAgICAgIGxlYWRTdXJyb2dhdGUgPSBjb2RlUG9pbnRcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIHZhbGlkIHN1cnJvZ2F0ZSBwYWlyXG4gICAgICAgICAgY29kZVBvaW50ID0gbGVhZFN1cnJvZ2F0ZSAtIDB4RDgwMCA8PCAxMCB8IGNvZGVQb2ludCAtIDB4REMwMCB8IDB4MTAwMDBcbiAgICAgICAgICBsZWFkU3Vycm9nYXRlID0gbnVsbFxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBubyBsZWFkIHlldFxuXG4gICAgICAgIGlmIChjb2RlUG9pbnQgPiAweERCRkYpIHtcbiAgICAgICAgICAvLyB1bmV4cGVjdGVkIHRyYWlsXG4gICAgICAgICAgaWYgKCh1bml0cyAtPSAzKSA+IC0xKSBieXRlcy5wdXNoKDB4RUYsIDB4QkYsIDB4QkQpXG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfSBlbHNlIGlmIChpICsgMSA9PT0gbGVuZ3RoKSB7XG4gICAgICAgICAgLy8gdW5wYWlyZWQgbGVhZFxuICAgICAgICAgIGlmICgodW5pdHMgLT0gMykgPiAtMSkgYnl0ZXMucHVzaCgweEVGLCAweEJGLCAweEJEKVxuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gdmFsaWQgbGVhZFxuICAgICAgICAgIGxlYWRTdXJyb2dhdGUgPSBjb2RlUG9pbnRcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChsZWFkU3Vycm9nYXRlKSB7XG4gICAgICAvLyB2YWxpZCBibXAgY2hhciwgYnV0IGxhc3QgY2hhciB3YXMgYSBsZWFkXG4gICAgICBpZiAoKHVuaXRzIC09IDMpID4gLTEpIGJ5dGVzLnB1c2goMHhFRiwgMHhCRiwgMHhCRClcbiAgICAgIGxlYWRTdXJyb2dhdGUgPSBudWxsXG4gICAgfVxuXG4gICAgLy8gZW5jb2RlIHV0ZjhcbiAgICBpZiAoY29kZVBvaW50IDwgMHg4MCkge1xuICAgICAgaWYgKCh1bml0cyAtPSAxKSA8IDApIGJyZWFrXG4gICAgICBieXRlcy5wdXNoKGNvZGVQb2ludClcbiAgICB9IGVsc2UgaWYgKGNvZGVQb2ludCA8IDB4ODAwKSB7XG4gICAgICBpZiAoKHVuaXRzIC09IDIpIDwgMCkgYnJlYWtcbiAgICAgIGJ5dGVzLnB1c2goXG4gICAgICAgIGNvZGVQb2ludCA+PiAweDYgfCAweEMwLFxuICAgICAgICBjb2RlUG9pbnQgJiAweDNGIHwgMHg4MFxuICAgICAgKVxuICAgIH0gZWxzZSBpZiAoY29kZVBvaW50IDwgMHgxMDAwMCkge1xuICAgICAgaWYgKCh1bml0cyAtPSAzKSA8IDApIGJyZWFrXG4gICAgICBieXRlcy5wdXNoKFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHhDIHwgMHhFMCxcbiAgICAgICAgY29kZVBvaW50ID4+IDB4NiAmIDB4M0YgfCAweDgwLFxuICAgICAgICBjb2RlUG9pbnQgJiAweDNGIHwgMHg4MFxuICAgICAgKVxuICAgIH0gZWxzZSBpZiAoY29kZVBvaW50IDwgMHgyMDAwMDApIHtcbiAgICAgIGlmICgodW5pdHMgLT0gNCkgPCAwKSBicmVha1xuICAgICAgYnl0ZXMucHVzaChcbiAgICAgICAgY29kZVBvaW50ID4+IDB4MTIgfCAweEYwLFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHhDICYgMHgzRiB8IDB4ODAsXG4gICAgICAgIGNvZGVQb2ludCA+PiAweDYgJiAweDNGIHwgMHg4MCxcbiAgICAgICAgY29kZVBvaW50ICYgMHgzRiB8IDB4ODBcbiAgICAgIClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGNvZGUgcG9pbnQnKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBieXRlc1xufVxuXG5mdW5jdGlvbiBhc2NpaVRvQnl0ZXMgKHN0cikge1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICAvLyBOb2RlJ3MgY29kZSBzZWVtcyB0byBiZSBkb2luZyB0aGlzIGFuZCBub3QgJiAweDdGLi5cbiAgICBieXRlQXJyYXkucHVzaChzdHIuY2hhckNvZGVBdChpKSAmIDB4RkYpXG4gIH1cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiB1dGYxNmxlVG9CeXRlcyAoc3RyLCB1bml0cykge1xuICB2YXIgYywgaGksIGxvXG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgIGlmICgodW5pdHMgLT0gMikgPCAwKSBicmVha1xuXG4gICAgYyA9IHN0ci5jaGFyQ29kZUF0KGkpXG4gICAgaGkgPSBjID4+IDhcbiAgICBsbyA9IGMgJSAyNTZcbiAgICBieXRlQXJyYXkucHVzaChsbylcbiAgICBieXRlQXJyYXkucHVzaChoaSlcbiAgfVxuXG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gYmFzZTY0VG9CeXRlcyAoc3RyKSB7XG4gIHJldHVybiBiYXNlNjQudG9CeXRlQXJyYXkoYmFzZTY0Y2xlYW4oc3RyKSlcbn1cblxuZnVuY3Rpb24gYmxpdEJ1ZmZlciAoc3JjLCBkc3QsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoKGkgKyBvZmZzZXQgPj0gZHN0Lmxlbmd0aCkgfHwgKGkgPj0gc3JjLmxlbmd0aCkpIGJyZWFrXG4gICAgZHN0W2kgKyBvZmZzZXRdID0gc3JjW2ldXG4gIH1cbiAgcmV0dXJuIGlcbn1cblxuZnVuY3Rpb24gZGVjb2RlVXRmOENoYXIgKHN0cikge1xuICB0cnkge1xuICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoc3RyKVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZSgweEZGRkQpIC8vIFVURiA4IGludmFsaWQgY2hhclxuICB9XG59XG4iLCJ2YXIgbG9va3VwID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky8nO1xuXG47KGZ1bmN0aW9uIChleHBvcnRzKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuICB2YXIgQXJyID0gKHR5cGVvZiBVaW50OEFycmF5ICE9PSAndW5kZWZpbmVkJylcbiAgICA/IFVpbnQ4QXJyYXlcbiAgICA6IEFycmF5XG5cblx0dmFyIFBMVVMgICA9ICcrJy5jaGFyQ29kZUF0KDApXG5cdHZhciBTTEFTSCAgPSAnLycuY2hhckNvZGVBdCgwKVxuXHR2YXIgTlVNQkVSID0gJzAnLmNoYXJDb2RlQXQoMClcblx0dmFyIExPV0VSICA9ICdhJy5jaGFyQ29kZUF0KDApXG5cdHZhciBVUFBFUiAgPSAnQScuY2hhckNvZGVBdCgwKVxuXHR2YXIgUExVU19VUkxfU0FGRSA9ICctJy5jaGFyQ29kZUF0KDApXG5cdHZhciBTTEFTSF9VUkxfU0FGRSA9ICdfJy5jaGFyQ29kZUF0KDApXG5cblx0ZnVuY3Rpb24gZGVjb2RlIChlbHQpIHtcblx0XHR2YXIgY29kZSA9IGVsdC5jaGFyQ29kZUF0KDApXG5cdFx0aWYgKGNvZGUgPT09IFBMVVMgfHxcblx0XHQgICAgY29kZSA9PT0gUExVU19VUkxfU0FGRSlcblx0XHRcdHJldHVybiA2MiAvLyAnKydcblx0XHRpZiAoY29kZSA9PT0gU0xBU0ggfHxcblx0XHQgICAgY29kZSA9PT0gU0xBU0hfVVJMX1NBRkUpXG5cdFx0XHRyZXR1cm4gNjMgLy8gJy8nXG5cdFx0aWYgKGNvZGUgPCBOVU1CRVIpXG5cdFx0XHRyZXR1cm4gLTEgLy9ubyBtYXRjaFxuXHRcdGlmIChjb2RlIDwgTlVNQkVSICsgMTApXG5cdFx0XHRyZXR1cm4gY29kZSAtIE5VTUJFUiArIDI2ICsgMjZcblx0XHRpZiAoY29kZSA8IFVQUEVSICsgMjYpXG5cdFx0XHRyZXR1cm4gY29kZSAtIFVQUEVSXG5cdFx0aWYgKGNvZGUgPCBMT1dFUiArIDI2KVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBMT1dFUiArIDI2XG5cdH1cblxuXHRmdW5jdGlvbiBiNjRUb0J5dGVBcnJheSAoYjY0KSB7XG5cdFx0dmFyIGksIGosIGwsIHRtcCwgcGxhY2VIb2xkZXJzLCBhcnJcblxuXHRcdGlmIChiNjQubGVuZ3RoICUgNCA+IDApIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignSW52YWxpZCBzdHJpbmcuIExlbmd0aCBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgNCcpXG5cdFx0fVxuXG5cdFx0Ly8gdGhlIG51bWJlciBvZiBlcXVhbCBzaWducyAocGxhY2UgaG9sZGVycylcblx0XHQvLyBpZiB0aGVyZSBhcmUgdHdvIHBsYWNlaG9sZGVycywgdGhhbiB0aGUgdHdvIGNoYXJhY3RlcnMgYmVmb3JlIGl0XG5cdFx0Ly8gcmVwcmVzZW50IG9uZSBieXRlXG5cdFx0Ly8gaWYgdGhlcmUgaXMgb25seSBvbmUsIHRoZW4gdGhlIHRocmVlIGNoYXJhY3RlcnMgYmVmb3JlIGl0IHJlcHJlc2VudCAyIGJ5dGVzXG5cdFx0Ly8gdGhpcyBpcyBqdXN0IGEgY2hlYXAgaGFjayB0byBub3QgZG8gaW5kZXhPZiB0d2ljZVxuXHRcdHZhciBsZW4gPSBiNjQubGVuZ3RoXG5cdFx0cGxhY2VIb2xkZXJzID0gJz0nID09PSBiNjQuY2hhckF0KGxlbiAtIDIpID8gMiA6ICc9JyA9PT0gYjY0LmNoYXJBdChsZW4gLSAxKSA/IDEgOiAwXG5cblx0XHQvLyBiYXNlNjQgaXMgNC8zICsgdXAgdG8gdHdvIGNoYXJhY3RlcnMgb2YgdGhlIG9yaWdpbmFsIGRhdGFcblx0XHRhcnIgPSBuZXcgQXJyKGI2NC5sZW5ndGggKiAzIC8gNCAtIHBsYWNlSG9sZGVycylcblxuXHRcdC8vIGlmIHRoZXJlIGFyZSBwbGFjZWhvbGRlcnMsIG9ubHkgZ2V0IHVwIHRvIHRoZSBsYXN0IGNvbXBsZXRlIDQgY2hhcnNcblx0XHRsID0gcGxhY2VIb2xkZXJzID4gMCA/IGI2NC5sZW5ndGggLSA0IDogYjY0Lmxlbmd0aFxuXG5cdFx0dmFyIEwgPSAwXG5cblx0XHRmdW5jdGlvbiBwdXNoICh2KSB7XG5cdFx0XHRhcnJbTCsrXSA9IHZcblx0XHR9XG5cblx0XHRmb3IgKGkgPSAwLCBqID0gMDsgaSA8IGw7IGkgKz0gNCwgaiArPSAzKSB7XG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDE4KSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMSkpIDw8IDEyKSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMikpIDw8IDYpIHwgZGVjb2RlKGI2NC5jaGFyQXQoaSArIDMpKVxuXHRcdFx0cHVzaCgodG1wICYgMHhGRjAwMDApID4+IDE2KVxuXHRcdFx0cHVzaCgodG1wICYgMHhGRjAwKSA+PiA4KVxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxuXHRcdH1cblxuXHRcdGlmIChwbGFjZUhvbGRlcnMgPT09IDIpIHtcblx0XHRcdHRtcCA9IChkZWNvZGUoYjY0LmNoYXJBdChpKSkgPDwgMikgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA+PiA0KVxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxuXHRcdH0gZWxzZSBpZiAocGxhY2VIb2xkZXJzID09PSAxKSB7XG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDEwKSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMSkpIDw8IDQpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAyKSkgPj4gMilcblx0XHRcdHB1c2goKHRtcCA+PiA4KSAmIDB4RkYpXG5cdFx0XHRwdXNoKHRtcCAmIDB4RkYpXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGFyclxuXHR9XG5cblx0ZnVuY3Rpb24gdWludDhUb0Jhc2U2NCAodWludDgpIHtcblx0XHR2YXIgaSxcblx0XHRcdGV4dHJhQnl0ZXMgPSB1aW50OC5sZW5ndGggJSAzLCAvLyBpZiB3ZSBoYXZlIDEgYnl0ZSBsZWZ0LCBwYWQgMiBieXRlc1xuXHRcdFx0b3V0cHV0ID0gXCJcIixcblx0XHRcdHRlbXAsIGxlbmd0aFxuXG5cdFx0ZnVuY3Rpb24gZW5jb2RlIChudW0pIHtcblx0XHRcdHJldHVybiBsb29rdXAuY2hhckF0KG51bSlcblx0XHR9XG5cblx0XHRmdW5jdGlvbiB0cmlwbGV0VG9CYXNlNjQgKG51bSkge1xuXHRcdFx0cmV0dXJuIGVuY29kZShudW0gPj4gMTggJiAweDNGKSArIGVuY29kZShudW0gPj4gMTIgJiAweDNGKSArIGVuY29kZShudW0gPj4gNiAmIDB4M0YpICsgZW5jb2RlKG51bSAmIDB4M0YpXG5cdFx0fVxuXG5cdFx0Ly8gZ28gdGhyb3VnaCB0aGUgYXJyYXkgZXZlcnkgdGhyZWUgYnl0ZXMsIHdlJ2xsIGRlYWwgd2l0aCB0cmFpbGluZyBzdHVmZiBsYXRlclxuXHRcdGZvciAoaSA9IDAsIGxlbmd0aCA9IHVpbnQ4Lmxlbmd0aCAtIGV4dHJhQnl0ZXM7IGkgPCBsZW5ndGg7IGkgKz0gMykge1xuXHRcdFx0dGVtcCA9ICh1aW50OFtpXSA8PCAxNikgKyAodWludDhbaSArIDFdIDw8IDgpICsgKHVpbnQ4W2kgKyAyXSlcblx0XHRcdG91dHB1dCArPSB0cmlwbGV0VG9CYXNlNjQodGVtcClcblx0XHR9XG5cblx0XHQvLyBwYWQgdGhlIGVuZCB3aXRoIHplcm9zLCBidXQgbWFrZSBzdXJlIHRvIG5vdCBmb3JnZXQgdGhlIGV4dHJhIGJ5dGVzXG5cdFx0c3dpdGNoIChleHRyYUJ5dGVzKSB7XG5cdFx0XHRjYXNlIDE6XG5cdFx0XHRcdHRlbXAgPSB1aW50OFt1aW50OC5sZW5ndGggLSAxXVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKHRlbXAgPj4gMilcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSgodGVtcCA8PCA0KSAmIDB4M0YpXG5cdFx0XHRcdG91dHB1dCArPSAnPT0nXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIDI6XG5cdFx0XHRcdHRlbXAgPSAodWludDhbdWludDgubGVuZ3RoIC0gMl0gPDwgOCkgKyAodWludDhbdWludDgubGVuZ3RoIC0gMV0pXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUodGVtcCA+PiAxMClcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSgodGVtcCA+PiA0KSAmIDB4M0YpXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPDwgMikgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gJz0nXG5cdFx0XHRcdGJyZWFrXG5cdFx0fVxuXG5cdFx0cmV0dXJuIG91dHB1dFxuXHR9XG5cblx0ZXhwb3J0cy50b0J5dGVBcnJheSA9IGI2NFRvQnl0ZUFycmF5XG5cdGV4cG9ydHMuZnJvbUJ5dGVBcnJheSA9IHVpbnQ4VG9CYXNlNjRcbn0odHlwZW9mIGV4cG9ydHMgPT09ICd1bmRlZmluZWQnID8gKHRoaXMuYmFzZTY0anMgPSB7fSkgOiBleHBvcnRzKSlcbiIsImV4cG9ydHMucmVhZCA9IGZ1bmN0aW9uKGJ1ZmZlciwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcbiAgdmFyIGUsIG0sXG4gICAgICBlTGVuID0gbkJ5dGVzICogOCAtIG1MZW4gLSAxLFxuICAgICAgZU1heCA9ICgxIDw8IGVMZW4pIC0gMSxcbiAgICAgIGVCaWFzID0gZU1heCA+PiAxLFxuICAgICAgbkJpdHMgPSAtNyxcbiAgICAgIGkgPSBpc0xFID8gKG5CeXRlcyAtIDEpIDogMCxcbiAgICAgIGQgPSBpc0xFID8gLTEgOiAxLFxuICAgICAgcyA9IGJ1ZmZlcltvZmZzZXQgKyBpXTtcblxuICBpICs9IGQ7XG5cbiAgZSA9IHMgJiAoKDEgPDwgKC1uQml0cykpIC0gMSk7XG4gIHMgPj49ICgtbkJpdHMpO1xuICBuQml0cyArPSBlTGVuO1xuICBmb3IgKDsgbkJpdHMgPiAwOyBlID0gZSAqIDI1NiArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KTtcblxuICBtID0gZSAmICgoMSA8PCAoLW5CaXRzKSkgLSAxKTtcbiAgZSA+Pj0gKC1uQml0cyk7XG4gIG5CaXRzICs9IG1MZW47XG4gIGZvciAoOyBuQml0cyA+IDA7IG0gPSBtICogMjU2ICsgYnVmZmVyW29mZnNldCArIGldLCBpICs9IGQsIG5CaXRzIC09IDgpO1xuXG4gIGlmIChlID09PSAwKSB7XG4gICAgZSA9IDEgLSBlQmlhcztcbiAgfSBlbHNlIGlmIChlID09PSBlTWF4KSB7XG4gICAgcmV0dXJuIG0gPyBOYU4gOiAoKHMgPyAtMSA6IDEpICogSW5maW5pdHkpO1xuICB9IGVsc2Uge1xuICAgIG0gPSBtICsgTWF0aC5wb3coMiwgbUxlbik7XG4gICAgZSA9IGUgLSBlQmlhcztcbiAgfVxuICByZXR1cm4gKHMgPyAtMSA6IDEpICogbSAqIE1hdGgucG93KDIsIGUgLSBtTGVuKTtcbn07XG5cbmV4cG9ydHMud3JpdGUgPSBmdW5jdGlvbihidWZmZXIsIHZhbHVlLCBvZmZzZXQsIGlzTEUsIG1MZW4sIG5CeXRlcykge1xuICB2YXIgZSwgbSwgYyxcbiAgICAgIGVMZW4gPSBuQnl0ZXMgKiA4IC0gbUxlbiAtIDEsXG4gICAgICBlTWF4ID0gKDEgPDwgZUxlbikgLSAxLFxuICAgICAgZUJpYXMgPSBlTWF4ID4+IDEsXG4gICAgICBydCA9IChtTGVuID09PSAyMyA/IE1hdGgucG93KDIsIC0yNCkgLSBNYXRoLnBvdygyLCAtNzcpIDogMCksXG4gICAgICBpID0gaXNMRSA/IDAgOiAobkJ5dGVzIC0gMSksXG4gICAgICBkID0gaXNMRSA/IDEgOiAtMSxcbiAgICAgIHMgPSB2YWx1ZSA8IDAgfHwgKHZhbHVlID09PSAwICYmIDEgLyB2YWx1ZSA8IDApID8gMSA6IDA7XG5cbiAgdmFsdWUgPSBNYXRoLmFicyh2YWx1ZSk7XG5cbiAgaWYgKGlzTmFOKHZhbHVlKSB8fCB2YWx1ZSA9PT0gSW5maW5pdHkpIHtcbiAgICBtID0gaXNOYU4odmFsdWUpID8gMSA6IDA7XG4gICAgZSA9IGVNYXg7XG4gIH0gZWxzZSB7XG4gICAgZSA9IE1hdGguZmxvb3IoTWF0aC5sb2codmFsdWUpIC8gTWF0aC5MTjIpO1xuICAgIGlmICh2YWx1ZSAqIChjID0gTWF0aC5wb3coMiwgLWUpKSA8IDEpIHtcbiAgICAgIGUtLTtcbiAgICAgIGMgKj0gMjtcbiAgICB9XG4gICAgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XG4gICAgICB2YWx1ZSArPSBydCAvIGM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhbHVlICs9IHJ0ICogTWF0aC5wb3coMiwgMSAtIGVCaWFzKTtcbiAgICB9XG4gICAgaWYgKHZhbHVlICogYyA+PSAyKSB7XG4gICAgICBlKys7XG4gICAgICBjIC89IDI7XG4gICAgfVxuXG4gICAgaWYgKGUgKyBlQmlhcyA+PSBlTWF4KSB7XG4gICAgICBtID0gMDtcbiAgICAgIGUgPSBlTWF4O1xuICAgIH0gZWxzZSBpZiAoZSArIGVCaWFzID49IDEpIHtcbiAgICAgIG0gPSAodmFsdWUgKiBjIC0gMSkgKiBNYXRoLnBvdygyLCBtTGVuKTtcbiAgICAgIGUgPSBlICsgZUJpYXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSB2YWx1ZSAqIE1hdGgucG93KDIsIGVCaWFzIC0gMSkgKiBNYXRoLnBvdygyLCBtTGVuKTtcbiAgICAgIGUgPSAwO1xuICAgIH1cbiAgfVxuXG4gIGZvciAoOyBtTGVuID49IDg7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IG0gJiAweGZmLCBpICs9IGQsIG0gLz0gMjU2LCBtTGVuIC09IDgpO1xuXG4gIGUgPSAoZSA8PCBtTGVuKSB8IG07XG4gIGVMZW4gKz0gbUxlbjtcbiAgZm9yICg7IGVMZW4gPiAwOyBidWZmZXJbb2Zmc2V0ICsgaV0gPSBlICYgMHhmZiwgaSArPSBkLCBlIC89IDI1NiwgZUxlbiAtPSA4KTtcblxuICBidWZmZXJbb2Zmc2V0ICsgaSAtIGRdIHw9IHMgKiAxMjg7XG59O1xuIiwiXG4vKipcbiAqIGlzQXJyYXlcbiAqL1xuXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXk7XG5cbi8qKlxuICogdG9TdHJpbmdcbiAqL1xuXG52YXIgc3RyID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLyoqXG4gKiBXaGV0aGVyIG9yIG5vdCB0aGUgZ2l2ZW4gYHZhbGBcbiAqIGlzIGFuIGFycmF5LlxuICpcbiAqIGV4YW1wbGU6XG4gKlxuICogICAgICAgIGlzQXJyYXkoW10pO1xuICogICAgICAgIC8vID4gdHJ1ZVxuICogICAgICAgIGlzQXJyYXkoYXJndW1lbnRzKTtcbiAqICAgICAgICAvLyA+IGZhbHNlXG4gKiAgICAgICAgaXNBcnJheSgnJyk7XG4gKiAgICAgICAgLy8gPiBmYWxzZVxuICpcbiAqIEBwYXJhbSB7bWl4ZWR9IHZhbFxuICogQHJldHVybiB7Ym9vbH1cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGlzQXJyYXkgfHwgZnVuY3Rpb24gKHZhbCkge1xuICByZXR1cm4gISEgdmFsICYmICdbb2JqZWN0IEFycmF5XScgPT0gc3RyLmNhbGwodmFsKTtcbn07XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkge1xuICB0aGlzLl9ldmVudHMgPSB0aGlzLl9ldmVudHMgfHwge307XG4gIHRoaXMuX21heExpc3RlbmVycyA9IHRoaXMuX21heExpc3RlbmVycyB8fCB1bmRlZmluZWQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcblxuLy8gQmFja3dhcmRzLWNvbXBhdCB3aXRoIG5vZGUgMC4xMC54XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9tYXhMaXN0ZW5lcnMgPSB1bmRlZmluZWQ7XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZVxuLy8gYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaCBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbkV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5cbi8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xuLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uKG4pIHtcbiAgaWYgKCFpc051bWJlcihuKSB8fCBuIDwgMCB8fCBpc05hTihuKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ24gbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSBuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGVyLCBoYW5kbGVyLCBsZW4sIGFyZ3MsIGksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBJZiB0aGVyZSBpcyBubyAnZXJyb3InIGV2ZW50IGxpc3RlbmVyIHRoZW4gdGhyb3cuXG4gIGlmICh0eXBlID09PSAnZXJyb3InKSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHMuZXJyb3IgfHxcbiAgICAgICAgKGlzT2JqZWN0KHRoaXMuX2V2ZW50cy5lcnJvcikgJiYgIXRoaXMuX2V2ZW50cy5lcnJvci5sZW5ndGgpKSB7XG4gICAgICBlciA9IGFyZ3VtZW50c1sxXTtcbiAgICAgIGlmIChlciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIHRocm93IGVyOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxuICAgICAgfVxuICAgICAgdGhyb3cgVHlwZUVycm9yKCdVbmNhdWdodCwgdW5zcGVjaWZpZWQgXCJlcnJvclwiIGV2ZW50LicpO1xuICAgIH1cbiAgfVxuXG4gIGhhbmRsZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzVW5kZWZpbmVkKGhhbmRsZXIpKVxuICAgIHJldHVybiBmYWxzZTtcblxuICBpZiAoaXNGdW5jdGlvbihoYW5kbGVyKSkge1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgLy8gZmFzdCBjYXNlc1xuICAgICAgY2FzZSAxOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgLy8gc2xvd2VyXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgICBhcmdzID0gbmV3IEFycmF5KGxlbiAtIDEpO1xuICAgICAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIGhhbmRsZXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgfVxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGhhbmRsZXIpKSB7XG4gICAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICBhcmdzID0gbmV3IEFycmF5KGxlbiAtIDEpO1xuICAgIGZvciAoaSA9IDE7IGkgPCBsZW47IGkrKylcbiAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuXG4gICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xuICAgIGxlbiA9IGxpc3RlbmVycy5sZW5ndGg7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKVxuICAgICAgbGlzdGVuZXJzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIG07XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIFRvIGF2b2lkIHJlY3Vyc2lvbiBpbiB0aGUgY2FzZSB0aGF0IHR5cGUgPT09IFwibmV3TGlzdGVuZXJcIiEgQmVmb3JlXG4gIC8vIGFkZGluZyBpdCB0byB0aGUgbGlzdGVuZXJzLCBmaXJzdCBlbWl0IFwibmV3TGlzdGVuZXJcIi5cbiAgaWYgKHRoaXMuX2V2ZW50cy5uZXdMaXN0ZW5lcilcbiAgICB0aGlzLmVtaXQoJ25ld0xpc3RlbmVyJywgdHlwZSxcbiAgICAgICAgICAgICAgaXNGdW5jdGlvbihsaXN0ZW5lci5saXN0ZW5lcikgP1xuICAgICAgICAgICAgICBsaXN0ZW5lci5saXN0ZW5lciA6IGxpc3RlbmVyKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAvLyBPcHRpbWl6ZSB0aGUgY2FzZSBvZiBvbmUgbGlzdGVuZXIuIERvbid0IG5lZWQgdGhlIGV4dHJhIGFycmF5IG9iamVjdC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBsaXN0ZW5lcjtcbiAgZWxzZSBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICAvLyBJZiB3ZSd2ZSBhbHJlYWR5IGdvdCBhbiBhcnJheSwganVzdCBhcHBlbmQuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdLnB1c2gobGlzdGVuZXIpO1xuICBlbHNlXG4gICAgLy8gQWRkaW5nIHRoZSBzZWNvbmQgZWxlbWVudCwgbmVlZCB0byBjaGFuZ2UgdG8gYXJyYXkuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gW3RoaXMuX2V2ZW50c1t0eXBlXSwgbGlzdGVuZXJdO1xuXG4gIC8vIENoZWNrIGZvciBsaXN0ZW5lciBsZWFrXG4gIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pICYmICF0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkKSB7XG4gICAgdmFyIG07XG4gICAgaWYgKCFpc1VuZGVmaW5lZCh0aGlzLl9tYXhMaXN0ZW5lcnMpKSB7XG4gICAgICBtID0gdGhpcy5fbWF4TGlzdGVuZXJzO1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnM7XG4gICAgfVxuXG4gICAgaWYgKG0gJiYgbSA+IDAgJiYgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCA+IG0pIHtcbiAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQgPSB0cnVlO1xuICAgICAgY29uc29sZS5lcnJvcignKG5vZGUpIHdhcm5pbmc6IHBvc3NpYmxlIEV2ZW50RW1pdHRlciBtZW1vcnkgJyArXG4gICAgICAgICAgICAgICAgICAgICdsZWFrIGRldGVjdGVkLiAlZCBsaXN0ZW5lcnMgYWRkZWQuICcgK1xuICAgICAgICAgICAgICAgICAgICAnVXNlIGVtaXR0ZXIuc2V0TWF4TGlzdGVuZXJzKCkgdG8gaW5jcmVhc2UgbGltaXQuJyxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCk7XG4gICAgICBpZiAodHlwZW9mIGNvbnNvbGUudHJhY2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgLy8gbm90IHN1cHBvcnRlZCBpbiBJRSAxMFxuICAgICAgICBjb25zb2xlLnRyYWNlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIHZhciBmaXJlZCA9IGZhbHNlO1xuXG4gIGZ1bmN0aW9uIGcoKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBnKTtcblxuICAgIGlmICghZmlyZWQpIHtcbiAgICAgIGZpcmVkID0gdHJ1ZTtcbiAgICAgIGxpc3RlbmVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuICB9XG5cbiAgZy5saXN0ZW5lciA9IGxpc3RlbmVyO1xuICB0aGlzLm9uKHR5cGUsIGcpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLy8gZW1pdHMgYSAncmVtb3ZlTGlzdGVuZXInIGV2ZW50IGlmZiB0aGUgbGlzdGVuZXIgd2FzIHJlbW92ZWRcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbGlzdCwgcG9zaXRpb24sIGxlbmd0aCwgaTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXR1cm4gdGhpcztcblxuICBsaXN0ID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuICBsZW5ndGggPSBsaXN0Lmxlbmd0aDtcbiAgcG9zaXRpb24gPSAtMTtcblxuICBpZiAobGlzdCA9PT0gbGlzdGVuZXIgfHxcbiAgICAgIChpc0Z1bmN0aW9uKGxpc3QubGlzdGVuZXIpICYmIGxpc3QubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG5cbiAgfSBlbHNlIGlmIChpc09iamVjdChsaXN0KSkge1xuICAgIGZvciAoaSA9IGxlbmd0aDsgaS0tID4gMDspIHtcbiAgICAgIGlmIChsaXN0W2ldID09PSBsaXN0ZW5lciB8fFxuICAgICAgICAgIChsaXN0W2ldLmxpc3RlbmVyICYmIGxpc3RbaV0ubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgICAgICBwb3NpdGlvbiA9IGk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwb3NpdGlvbiA8IDApXG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgbGlzdC5sZW5ndGggPSAwO1xuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGlzdC5zcGxpY2UocG9zaXRpb24sIDEpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGtleSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIC8vIG5vdCBsaXN0ZW5pbmcgZm9yIHJlbW92ZUxpc3RlbmVyLCBubyBuZWVkIHRvIGVtaXRcbiAgaWYgKCF0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMClcbiAgICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIGVsc2UgaWYgKHRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBlbWl0IHJlbW92ZUxpc3RlbmVyIGZvciBhbGwgbGlzdGVuZXJzIG9uIGFsbCBldmVudHNcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICBmb3IgKGtleSBpbiB0aGlzLl9ldmVudHMpIHtcbiAgICAgIGlmIChrZXkgPT09ICdyZW1vdmVMaXN0ZW5lcicpIGNvbnRpbnVlO1xuICAgICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoa2V5KTtcbiAgICB9XG4gICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoJ3JlbW92ZUxpc3RlbmVyJyk7XG4gICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzRnVuY3Rpb24obGlzdGVuZXJzKSkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBMSUZPIG9yZGVyXG4gICAgd2hpbGUgKGxpc3RlbmVycy5sZW5ndGgpXG4gICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyc1tsaXN0ZW5lcnMubGVuZ3RoIC0gMV0pO1xuICB9XG4gIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIHJldDtcbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXQgPSBbXTtcbiAgZWxzZSBpZiAoaXNGdW5jdGlvbih0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IFt0aGlzLl9ldmVudHNbdHlwZV1dO1xuICBlbHNlXG4gICAgcmV0ID0gdGhpcy5fZXZlbnRzW3R5cGVdLnNsaWNlKCk7XG4gIHJldHVybiByZXQ7XG59O1xuXG5FdmVudEVtaXR0ZXIubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKGVtaXR0ZXIsIHR5cGUpIHtcbiAgdmFyIHJldDtcbiAgaWYgKCFlbWl0dGVyLl9ldmVudHMgfHwgIWVtaXR0ZXIuX2V2ZW50c1t0eXBlXSlcbiAgICByZXQgPSAwO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKGVtaXR0ZXIuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gMTtcbiAgZWxzZVxuICAgIHJldCA9IGVtaXR0ZXIuX2V2ZW50c1t0eXBlXS5sZW5ndGg7XG4gIHJldHVybiByZXQ7XG59O1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG4iLCJpZiAodHlwZW9mIE9iamVjdC5jcmVhdGUgPT09ICdmdW5jdGlvbicpIHtcbiAgLy8gaW1wbGVtZW50YXRpb24gZnJvbSBzdGFuZGFyZCBub2RlLmpzICd1dGlsJyBtb2R1bGVcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIGN0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckN0b3IucHJvdG90eXBlLCB7XG4gICAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgICB2YWx1ZTogY3RvcixcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbn0gZWxzZSB7XG4gIC8vIG9sZCBzY2hvb2wgc2hpbSBmb3Igb2xkIGJyb3dzZXJzXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICB2YXIgVGVtcEN0b3IgPSBmdW5jdGlvbiAoKSB7fVxuICAgIFRlbXBDdG9yLnByb3RvdHlwZSA9IHN1cGVyQ3Rvci5wcm90b3R5cGVcbiAgICBjdG9yLnByb3RvdHlwZSA9IG5ldyBUZW1wQ3RvcigpXG4gICAgY3Rvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBjdG9yXG4gIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAoYXJyKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYXJyKSA9PSAnW29iamVjdCBBcnJheV0nO1xufTtcbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gdHJ1ZTtcbiAgICB2YXIgY3VycmVudFF1ZXVlO1xuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB2YXIgaSA9IC0xO1xuICAgICAgICB3aGlsZSAoKytpIDwgbGVuKSB7XG4gICAgICAgICAgICBjdXJyZW50UXVldWVbaV0oKTtcbiAgICAgICAgfVxuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG59XG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHF1ZXVlLnB1c2goZnVuKTtcbiAgICBpZiAoIWRyYWluaW5nKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZHJhaW5RdWV1ZSwgMCk7XG4gICAgfVxufTtcblxucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbi8vIFRPRE8oc2h0eWxtYW4pXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCIuL2xpYi9fc3RyZWFtX2R1cGxleC5qc1wiKVxuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbi8vIGEgZHVwbGV4IHN0cmVhbSBpcyBqdXN0IGEgc3RyZWFtIHRoYXQgaXMgYm90aCByZWFkYWJsZSBhbmQgd3JpdGFibGUuXG4vLyBTaW5jZSBKUyBkb2Vzbid0IGhhdmUgbXVsdGlwbGUgcHJvdG90eXBhbCBpbmhlcml0YW5jZSwgdGhpcyBjbGFzc1xuLy8gcHJvdG90eXBhbGx5IGluaGVyaXRzIGZyb20gUmVhZGFibGUsIGFuZCB0aGVuIHBhcmFzaXRpY2FsbHkgZnJvbVxuLy8gV3JpdGFibGUuXG5cbm1vZHVsZS5leHBvcnRzID0gRHVwbGV4O1xuXG4vKjxyZXBsYWNlbWVudD4qL1xudmFyIG9iamVjdEtleXMgPSBPYmplY3Qua2V5cyB8fCBmdW5jdGlvbiAob2JqKSB7XG4gIHZhciBrZXlzID0gW107XG4gIGZvciAodmFyIGtleSBpbiBvYmopIGtleXMucHVzaChrZXkpO1xuICByZXR1cm4ga2V5cztcbn1cbi8qPC9yZXBsYWNlbWVudD4qL1xuXG5cbi8qPHJlcGxhY2VtZW50PiovXG52YXIgdXRpbCA9IHJlcXVpcmUoJ2NvcmUtdXRpbC1pcycpO1xudXRpbC5pbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJyk7XG4vKjwvcmVwbGFjZW1lbnQ+Ki9cblxudmFyIFJlYWRhYmxlID0gcmVxdWlyZSgnLi9fc3RyZWFtX3JlYWRhYmxlJyk7XG52YXIgV3JpdGFibGUgPSByZXF1aXJlKCcuL19zdHJlYW1fd3JpdGFibGUnKTtcblxudXRpbC5pbmhlcml0cyhEdXBsZXgsIFJlYWRhYmxlKTtcblxuZm9yRWFjaChvYmplY3RLZXlzKFdyaXRhYmxlLnByb3RvdHlwZSksIGZ1bmN0aW9uKG1ldGhvZCkge1xuICBpZiAoIUR1cGxleC5wcm90b3R5cGVbbWV0aG9kXSlcbiAgICBEdXBsZXgucHJvdG90eXBlW21ldGhvZF0gPSBXcml0YWJsZS5wcm90b3R5cGVbbWV0aG9kXTtcbn0pO1xuXG5mdW5jdGlvbiBEdXBsZXgob3B0aW9ucykge1xuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgRHVwbGV4KSlcbiAgICByZXR1cm4gbmV3IER1cGxleChvcHRpb25zKTtcblxuICBSZWFkYWJsZS5jYWxsKHRoaXMsIG9wdGlvbnMpO1xuICBXcml0YWJsZS5jYWxsKHRoaXMsIG9wdGlvbnMpO1xuXG4gIGlmIChvcHRpb25zICYmIG9wdGlvbnMucmVhZGFibGUgPT09IGZhbHNlKVxuICAgIHRoaXMucmVhZGFibGUgPSBmYWxzZTtcblxuICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLndyaXRhYmxlID09PSBmYWxzZSlcbiAgICB0aGlzLndyaXRhYmxlID0gZmFsc2U7XG5cbiAgdGhpcy5hbGxvd0hhbGZPcGVuID0gdHJ1ZTtcbiAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5hbGxvd0hhbGZPcGVuID09PSBmYWxzZSlcbiAgICB0aGlzLmFsbG93SGFsZk9wZW4gPSBmYWxzZTtcblxuICB0aGlzLm9uY2UoJ2VuZCcsIG9uZW5kKTtcbn1cblxuLy8gdGhlIG5vLWhhbGYtb3BlbiBlbmZvcmNlclxuZnVuY3Rpb24gb25lbmQoKSB7XG4gIC8vIGlmIHdlIGFsbG93IGhhbGYtb3BlbiBzdGF0ZSwgb3IgaWYgdGhlIHdyaXRhYmxlIHNpZGUgZW5kZWQsXG4gIC8vIHRoZW4gd2UncmUgb2suXG4gIGlmICh0aGlzLmFsbG93SGFsZk9wZW4gfHwgdGhpcy5fd3JpdGFibGVTdGF0ZS5lbmRlZClcbiAgICByZXR1cm47XG5cbiAgLy8gbm8gbW9yZSBkYXRhIGNhbiBiZSB3cml0dGVuLlxuICAvLyBCdXQgYWxsb3cgbW9yZSB3cml0ZXMgdG8gaGFwcGVuIGluIHRoaXMgdGljay5cbiAgcHJvY2Vzcy5uZXh0VGljayh0aGlzLmVuZC5iaW5kKHRoaXMpKTtcbn1cblxuZnVuY3Rpb24gZm9yRWFjaCAoeHMsIGYpIHtcbiAgZm9yICh2YXIgaSA9IDAsIGwgPSB4cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBmKHhzW2ldLCBpKTtcbiAgfVxufVxuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbi8vIGEgcGFzc3Rocm91Z2ggc3RyZWFtLlxuLy8gYmFzaWNhbGx5IGp1c3QgdGhlIG1vc3QgbWluaW1hbCBzb3J0IG9mIFRyYW5zZm9ybSBzdHJlYW0uXG4vLyBFdmVyeSB3cml0dGVuIGNodW5rIGdldHMgb3V0cHV0IGFzLWlzLlxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhc3NUaHJvdWdoO1xuXG52YXIgVHJhbnNmb3JtID0gcmVxdWlyZSgnLi9fc3RyZWFtX3RyYW5zZm9ybScpO1xuXG4vKjxyZXBsYWNlbWVudD4qL1xudmFyIHV0aWwgPSByZXF1aXJlKCdjb3JlLXV0aWwtaXMnKTtcbnV0aWwuaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpO1xuLyo8L3JlcGxhY2VtZW50PiovXG5cbnV0aWwuaW5oZXJpdHMoUGFzc1Rocm91Z2gsIFRyYW5zZm9ybSk7XG5cbmZ1bmN0aW9uIFBhc3NUaHJvdWdoKG9wdGlvbnMpIHtcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFBhc3NUaHJvdWdoKSlcbiAgICByZXR1cm4gbmV3IFBhc3NUaHJvdWdoKG9wdGlvbnMpO1xuXG4gIFRyYW5zZm9ybS5jYWxsKHRoaXMsIG9wdGlvbnMpO1xufVxuXG5QYXNzVGhyb3VnaC5wcm90b3R5cGUuX3RyYW5zZm9ybSA9IGZ1bmN0aW9uKGNodW5rLCBlbmNvZGluZywgY2IpIHtcbiAgY2IobnVsbCwgY2h1bmspO1xufTtcbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWRhYmxlO1xuXG4vKjxyZXBsYWNlbWVudD4qL1xudmFyIGlzQXJyYXkgPSByZXF1aXJlKCdpc2FycmF5Jyk7XG4vKjwvcmVwbGFjZW1lbnQ+Ki9cblxuXG4vKjxyZXBsYWNlbWVudD4qL1xudmFyIEJ1ZmZlciA9IHJlcXVpcmUoJ2J1ZmZlcicpLkJ1ZmZlcjtcbi8qPC9yZXBsYWNlbWVudD4qL1xuXG5SZWFkYWJsZS5SZWFkYWJsZVN0YXRlID0gUmVhZGFibGVTdGF0ZTtcblxudmFyIEVFID0gcmVxdWlyZSgnZXZlbnRzJykuRXZlbnRFbWl0dGVyO1xuXG4vKjxyZXBsYWNlbWVudD4qL1xuaWYgKCFFRS5saXN0ZW5lckNvdW50KSBFRS5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24oZW1pdHRlciwgdHlwZSkge1xuICByZXR1cm4gZW1pdHRlci5saXN0ZW5lcnModHlwZSkubGVuZ3RoO1xufTtcbi8qPC9yZXBsYWNlbWVudD4qL1xuXG52YXIgU3RyZWFtID0gcmVxdWlyZSgnc3RyZWFtJyk7XG5cbi8qPHJlcGxhY2VtZW50PiovXG52YXIgdXRpbCA9IHJlcXVpcmUoJ2NvcmUtdXRpbC1pcycpO1xudXRpbC5pbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJyk7XG4vKjwvcmVwbGFjZW1lbnQ+Ki9cblxudmFyIFN0cmluZ0RlY29kZXI7XG5cblxuLyo8cmVwbGFjZW1lbnQ+Ki9cbnZhciBkZWJ1ZyA9IHJlcXVpcmUoJ3V0aWwnKTtcbmlmIChkZWJ1ZyAmJiBkZWJ1Zy5kZWJ1Z2xvZykge1xuICBkZWJ1ZyA9IGRlYnVnLmRlYnVnbG9nKCdzdHJlYW0nKTtcbn0gZWxzZSB7XG4gIGRlYnVnID0gZnVuY3Rpb24gKCkge307XG59XG4vKjwvcmVwbGFjZW1lbnQ+Ki9cblxuXG51dGlsLmluaGVyaXRzKFJlYWRhYmxlLCBTdHJlYW0pO1xuXG5mdW5jdGlvbiBSZWFkYWJsZVN0YXRlKG9wdGlvbnMsIHN0cmVhbSkge1xuICB2YXIgRHVwbGV4ID0gcmVxdWlyZSgnLi9fc3RyZWFtX2R1cGxleCcpO1xuXG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gIC8vIHRoZSBwb2ludCBhdCB3aGljaCBpdCBzdG9wcyBjYWxsaW5nIF9yZWFkKCkgdG8gZmlsbCB0aGUgYnVmZmVyXG4gIC8vIE5vdGU6IDAgaXMgYSB2YWxpZCB2YWx1ZSwgbWVhbnMgXCJkb24ndCBjYWxsIF9yZWFkIHByZWVtcHRpdmVseSBldmVyXCJcbiAgdmFyIGh3bSA9IG9wdGlvbnMuaGlnaFdhdGVyTWFyaztcbiAgdmFyIGRlZmF1bHRId20gPSBvcHRpb25zLm9iamVjdE1vZGUgPyAxNiA6IDE2ICogMTAyNDtcbiAgdGhpcy5oaWdoV2F0ZXJNYXJrID0gKGh3bSB8fCBod20gPT09IDApID8gaHdtIDogZGVmYXVsdEh3bTtcblxuICAvLyBjYXN0IHRvIGludHMuXG4gIHRoaXMuaGlnaFdhdGVyTWFyayA9IH5+dGhpcy5oaWdoV2F0ZXJNYXJrO1xuXG4gIHRoaXMuYnVmZmVyID0gW107XG4gIHRoaXMubGVuZ3RoID0gMDtcbiAgdGhpcy5waXBlcyA9IG51bGw7XG4gIHRoaXMucGlwZXNDb3VudCA9IDA7XG4gIHRoaXMuZmxvd2luZyA9IG51bGw7XG4gIHRoaXMuZW5kZWQgPSBmYWxzZTtcbiAgdGhpcy5lbmRFbWl0dGVkID0gZmFsc2U7XG4gIHRoaXMucmVhZGluZyA9IGZhbHNlO1xuXG4gIC8vIGEgZmxhZyB0byBiZSBhYmxlIHRvIHRlbGwgaWYgdGhlIG9ud3JpdGUgY2IgaXMgY2FsbGVkIGltbWVkaWF0ZWx5LFxuICAvLyBvciBvbiBhIGxhdGVyIHRpY2suICBXZSBzZXQgdGhpcyB0byB0cnVlIGF0IGZpcnN0LCBiZWNhdXNlIGFueVxuICAvLyBhY3Rpb25zIHRoYXQgc2hvdWxkbid0IGhhcHBlbiB1bnRpbCBcImxhdGVyXCIgc2hvdWxkIGdlbmVyYWxseSBhbHNvXG4gIC8vIG5vdCBoYXBwZW4gYmVmb3JlIHRoZSBmaXJzdCB3cml0ZSBjYWxsLlxuICB0aGlzLnN5bmMgPSB0cnVlO1xuXG4gIC8vIHdoZW5ldmVyIHdlIHJldHVybiBudWxsLCB0aGVuIHdlIHNldCBhIGZsYWcgdG8gc2F5XG4gIC8vIHRoYXQgd2UncmUgYXdhaXRpbmcgYSAncmVhZGFibGUnIGV2ZW50IGVtaXNzaW9uLlxuICB0aGlzLm5lZWRSZWFkYWJsZSA9IGZhbHNlO1xuICB0aGlzLmVtaXR0ZWRSZWFkYWJsZSA9IGZhbHNlO1xuICB0aGlzLnJlYWRhYmxlTGlzdGVuaW5nID0gZmFsc2U7XG5cblxuICAvLyBvYmplY3Qgc3RyZWFtIGZsYWcuIFVzZWQgdG8gbWFrZSByZWFkKG4pIGlnbm9yZSBuIGFuZCB0b1xuICAvLyBtYWtlIGFsbCB0aGUgYnVmZmVyIG1lcmdpbmcgYW5kIGxlbmd0aCBjaGVja3MgZ28gYXdheVxuICB0aGlzLm9iamVjdE1vZGUgPSAhIW9wdGlvbnMub2JqZWN0TW9kZTtcblxuICBpZiAoc3RyZWFtIGluc3RhbmNlb2YgRHVwbGV4KVxuICAgIHRoaXMub2JqZWN0TW9kZSA9IHRoaXMub2JqZWN0TW9kZSB8fCAhIW9wdGlvbnMucmVhZGFibGVPYmplY3RNb2RlO1xuXG4gIC8vIENyeXB0byBpcyBraW5kIG9mIG9sZCBhbmQgY3J1c3R5LiAgSGlzdG9yaWNhbGx5LCBpdHMgZGVmYXVsdCBzdHJpbmdcbiAgLy8gZW5jb2RpbmcgaXMgJ2JpbmFyeScgc28gd2UgaGF2ZSB0byBtYWtlIHRoaXMgY29uZmlndXJhYmxlLlxuICAvLyBFdmVyeXRoaW5nIGVsc2UgaW4gdGhlIHVuaXZlcnNlIHVzZXMgJ3V0ZjgnLCB0aG91Z2guXG4gIHRoaXMuZGVmYXVsdEVuY29kaW5nID0gb3B0aW9ucy5kZWZhdWx0RW5jb2RpbmcgfHwgJ3V0ZjgnO1xuXG4gIC8vIHdoZW4gcGlwaW5nLCB3ZSBvbmx5IGNhcmUgYWJvdXQgJ3JlYWRhYmxlJyBldmVudHMgdGhhdCBoYXBwZW5cbiAgLy8gYWZ0ZXIgcmVhZCgpaW5nIGFsbCB0aGUgYnl0ZXMgYW5kIG5vdCBnZXR0aW5nIGFueSBwdXNoYmFjay5cbiAgdGhpcy5yYW5PdXQgPSBmYWxzZTtcblxuICAvLyB0aGUgbnVtYmVyIG9mIHdyaXRlcnMgdGhhdCBhcmUgYXdhaXRpbmcgYSBkcmFpbiBldmVudCBpbiAucGlwZSgpc1xuICB0aGlzLmF3YWl0RHJhaW4gPSAwO1xuXG4gIC8vIGlmIHRydWUsIGEgbWF5YmVSZWFkTW9yZSBoYXMgYmVlbiBzY2hlZHVsZWRcbiAgdGhpcy5yZWFkaW5nTW9yZSA9IGZhbHNlO1xuXG4gIHRoaXMuZGVjb2RlciA9IG51bGw7XG4gIHRoaXMuZW5jb2RpbmcgPSBudWxsO1xuICBpZiAob3B0aW9ucy5lbmNvZGluZykge1xuICAgIGlmICghU3RyaW5nRGVjb2RlcilcbiAgICAgIFN0cmluZ0RlY29kZXIgPSByZXF1aXJlKCdzdHJpbmdfZGVjb2Rlci8nKS5TdHJpbmdEZWNvZGVyO1xuICAgIHRoaXMuZGVjb2RlciA9IG5ldyBTdHJpbmdEZWNvZGVyKG9wdGlvbnMuZW5jb2RpbmcpO1xuICAgIHRoaXMuZW5jb2RpbmcgPSBvcHRpb25zLmVuY29kaW5nO1xuICB9XG59XG5cbmZ1bmN0aW9uIFJlYWRhYmxlKG9wdGlvbnMpIHtcbiAgdmFyIER1cGxleCA9IHJlcXVpcmUoJy4vX3N0cmVhbV9kdXBsZXgnKTtcblxuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgUmVhZGFibGUpKVxuICAgIHJldHVybiBuZXcgUmVhZGFibGUob3B0aW9ucyk7XG5cbiAgdGhpcy5fcmVhZGFibGVTdGF0ZSA9IG5ldyBSZWFkYWJsZVN0YXRlKG9wdGlvbnMsIHRoaXMpO1xuXG4gIC8vIGxlZ2FjeVxuICB0aGlzLnJlYWRhYmxlID0gdHJ1ZTtcblxuICBTdHJlYW0uY2FsbCh0aGlzKTtcbn1cblxuLy8gTWFudWFsbHkgc2hvdmUgc29tZXRoaW5nIGludG8gdGhlIHJlYWQoKSBidWZmZXIuXG4vLyBUaGlzIHJldHVybnMgdHJ1ZSBpZiB0aGUgaGlnaFdhdGVyTWFyayBoYXMgbm90IGJlZW4gaGl0IHlldCxcbi8vIHNpbWlsYXIgdG8gaG93IFdyaXRhYmxlLndyaXRlKCkgcmV0dXJucyB0cnVlIGlmIHlvdSBzaG91bGRcbi8vIHdyaXRlKCkgc29tZSBtb3JlLlxuUmVhZGFibGUucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbihjaHVuaywgZW5jb2RpbmcpIHtcbiAgdmFyIHN0YXRlID0gdGhpcy5fcmVhZGFibGVTdGF0ZTtcblxuICBpZiAodXRpbC5pc1N0cmluZyhjaHVuaykgJiYgIXN0YXRlLm9iamVjdE1vZGUpIHtcbiAgICBlbmNvZGluZyA9IGVuY29kaW5nIHx8IHN0YXRlLmRlZmF1bHRFbmNvZGluZztcbiAgICBpZiAoZW5jb2RpbmcgIT09IHN0YXRlLmVuY29kaW5nKSB7XG4gICAgICBjaHVuayA9IG5ldyBCdWZmZXIoY2h1bmssIGVuY29kaW5nKTtcbiAgICAgIGVuY29kaW5nID0gJyc7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlYWRhYmxlQWRkQ2h1bmsodGhpcywgc3RhdGUsIGNodW5rLCBlbmNvZGluZywgZmFsc2UpO1xufTtcblxuLy8gVW5zaGlmdCBzaG91bGQgKmFsd2F5cyogYmUgc29tZXRoaW5nIGRpcmVjdGx5IG91dCBvZiByZWFkKClcblJlYWRhYmxlLnByb3RvdHlwZS51bnNoaWZ0ID0gZnVuY3Rpb24oY2h1bmspIHtcbiAgdmFyIHN0YXRlID0gdGhpcy5fcmVhZGFibGVTdGF0ZTtcbiAgcmV0dXJuIHJlYWRhYmxlQWRkQ2h1bmsodGhpcywgc3RhdGUsIGNodW5rLCAnJywgdHJ1ZSk7XG59O1xuXG5mdW5jdGlvbiByZWFkYWJsZUFkZENodW5rKHN0cmVhbSwgc3RhdGUsIGNodW5rLCBlbmNvZGluZywgYWRkVG9Gcm9udCkge1xuICB2YXIgZXIgPSBjaHVua0ludmFsaWQoc3RhdGUsIGNodW5rKTtcbiAgaWYgKGVyKSB7XG4gICAgc3RyZWFtLmVtaXQoJ2Vycm9yJywgZXIpO1xuICB9IGVsc2UgaWYgKHV0aWwuaXNOdWxsT3JVbmRlZmluZWQoY2h1bmspKSB7XG4gICAgc3RhdGUucmVhZGluZyA9IGZhbHNlO1xuICAgIGlmICghc3RhdGUuZW5kZWQpXG4gICAgICBvbkVvZkNodW5rKHN0cmVhbSwgc3RhdGUpO1xuICB9IGVsc2UgaWYgKHN0YXRlLm9iamVjdE1vZGUgfHwgY2h1bmsgJiYgY2h1bmsubGVuZ3RoID4gMCkge1xuICAgIGlmIChzdGF0ZS5lbmRlZCAmJiAhYWRkVG9Gcm9udCkge1xuICAgICAgdmFyIGUgPSBuZXcgRXJyb3IoJ3N0cmVhbS5wdXNoKCkgYWZ0ZXIgRU9GJyk7XG4gICAgICBzdHJlYW0uZW1pdCgnZXJyb3InLCBlKTtcbiAgICB9IGVsc2UgaWYgKHN0YXRlLmVuZEVtaXR0ZWQgJiYgYWRkVG9Gcm9udCkge1xuICAgICAgdmFyIGUgPSBuZXcgRXJyb3IoJ3N0cmVhbS51bnNoaWZ0KCkgYWZ0ZXIgZW5kIGV2ZW50Jyk7XG4gICAgICBzdHJlYW0uZW1pdCgnZXJyb3InLCBlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHN0YXRlLmRlY29kZXIgJiYgIWFkZFRvRnJvbnQgJiYgIWVuY29kaW5nKVxuICAgICAgICBjaHVuayA9IHN0YXRlLmRlY29kZXIud3JpdGUoY2h1bmspO1xuXG4gICAgICBpZiAoIWFkZFRvRnJvbnQpXG4gICAgICAgIHN0YXRlLnJlYWRpbmcgPSBmYWxzZTtcblxuICAgICAgLy8gaWYgd2Ugd2FudCB0aGUgZGF0YSBub3csIGp1c3QgZW1pdCBpdC5cbiAgICAgIGlmIChzdGF0ZS5mbG93aW5nICYmIHN0YXRlLmxlbmd0aCA9PT0gMCAmJiAhc3RhdGUuc3luYykge1xuICAgICAgICBzdHJlYW0uZW1pdCgnZGF0YScsIGNodW5rKTtcbiAgICAgICAgc3RyZWFtLnJlYWQoMCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyB1cGRhdGUgdGhlIGJ1ZmZlciBpbmZvLlxuICAgICAgICBzdGF0ZS5sZW5ndGggKz0gc3RhdGUub2JqZWN0TW9kZSA/IDEgOiBjaHVuay5sZW5ndGg7XG4gICAgICAgIGlmIChhZGRUb0Zyb250KVxuICAgICAgICAgIHN0YXRlLmJ1ZmZlci51bnNoaWZ0KGNodW5rKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHN0YXRlLmJ1ZmZlci5wdXNoKGNodW5rKTtcblxuICAgICAgICBpZiAoc3RhdGUubmVlZFJlYWRhYmxlKVxuICAgICAgICAgIGVtaXRSZWFkYWJsZShzdHJlYW0pO1xuICAgICAgfVxuXG4gICAgICBtYXliZVJlYWRNb3JlKHN0cmVhbSwgc3RhdGUpO1xuICAgIH1cbiAgfSBlbHNlIGlmICghYWRkVG9Gcm9udCkge1xuICAgIHN0YXRlLnJlYWRpbmcgPSBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiBuZWVkTW9yZURhdGEoc3RhdGUpO1xufVxuXG5cblxuLy8gaWYgaXQncyBwYXN0IHRoZSBoaWdoIHdhdGVyIG1hcmssIHdlIGNhbiBwdXNoIGluIHNvbWUgbW9yZS5cbi8vIEFsc28sIGlmIHdlIGhhdmUgbm8gZGF0YSB5ZXQsIHdlIGNhbiBzdGFuZCBzb21lXG4vLyBtb3JlIGJ5dGVzLiAgVGhpcyBpcyB0byB3b3JrIGFyb3VuZCBjYXNlcyB3aGVyZSBod209MCxcbi8vIHN1Y2ggYXMgdGhlIHJlcGwuICBBbHNvLCBpZiB0aGUgcHVzaCgpIHRyaWdnZXJlZCBhXG4vLyByZWFkYWJsZSBldmVudCwgYW5kIHRoZSB1c2VyIGNhbGxlZCByZWFkKGxhcmdlTnVtYmVyKSBzdWNoIHRoYXRcbi8vIG5lZWRSZWFkYWJsZSB3YXMgc2V0LCB0aGVuIHdlIG91Z2h0IHRvIHB1c2ggbW9yZSwgc28gdGhhdCBhbm90aGVyXG4vLyAncmVhZGFibGUnIGV2ZW50IHdpbGwgYmUgdHJpZ2dlcmVkLlxuZnVuY3Rpb24gbmVlZE1vcmVEYXRhKHN0YXRlKSB7XG4gIHJldHVybiAhc3RhdGUuZW5kZWQgJiZcbiAgICAgICAgIChzdGF0ZS5uZWVkUmVhZGFibGUgfHxcbiAgICAgICAgICBzdGF0ZS5sZW5ndGggPCBzdGF0ZS5oaWdoV2F0ZXJNYXJrIHx8XG4gICAgICAgICAgc3RhdGUubGVuZ3RoID09PSAwKTtcbn1cblxuLy8gYmFja3dhcmRzIGNvbXBhdGliaWxpdHkuXG5SZWFkYWJsZS5wcm90b3R5cGUuc2V0RW5jb2RpbmcgPSBmdW5jdGlvbihlbmMpIHtcbiAgaWYgKCFTdHJpbmdEZWNvZGVyKVxuICAgIFN0cmluZ0RlY29kZXIgPSByZXF1aXJlKCdzdHJpbmdfZGVjb2Rlci8nKS5TdHJpbmdEZWNvZGVyO1xuICB0aGlzLl9yZWFkYWJsZVN0YXRlLmRlY29kZXIgPSBuZXcgU3RyaW5nRGVjb2RlcihlbmMpO1xuICB0aGlzLl9yZWFkYWJsZVN0YXRlLmVuY29kaW5nID0gZW5jO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIERvbid0IHJhaXNlIHRoZSBod20gPiAxMjhNQlxudmFyIE1BWF9IV00gPSAweDgwMDAwMDtcbmZ1bmN0aW9uIHJvdW5kVXBUb05leHRQb3dlck9mMihuKSB7XG4gIGlmIChuID49IE1BWF9IV00pIHtcbiAgICBuID0gTUFYX0hXTTtcbiAgfSBlbHNlIHtcbiAgICAvLyBHZXQgdGhlIG5leHQgaGlnaGVzdCBwb3dlciBvZiAyXG4gICAgbi0tO1xuICAgIGZvciAodmFyIHAgPSAxOyBwIDwgMzI7IHAgPDw9IDEpIG4gfD0gbiA+PiBwO1xuICAgIG4rKztcbiAgfVxuICByZXR1cm4gbjtcbn1cblxuZnVuY3Rpb24gaG93TXVjaFRvUmVhZChuLCBzdGF0ZSkge1xuICBpZiAoc3RhdGUubGVuZ3RoID09PSAwICYmIHN0YXRlLmVuZGVkKVxuICAgIHJldHVybiAwO1xuXG4gIGlmIChzdGF0ZS5vYmplY3RNb2RlKVxuICAgIHJldHVybiBuID09PSAwID8gMCA6IDE7XG5cbiAgaWYgKGlzTmFOKG4pIHx8IHV0aWwuaXNOdWxsKG4pKSB7XG4gICAgLy8gb25seSBmbG93IG9uZSBidWZmZXIgYXQgYSB0aW1lXG4gICAgaWYgKHN0YXRlLmZsb3dpbmcgJiYgc3RhdGUuYnVmZmVyLmxlbmd0aClcbiAgICAgIHJldHVybiBzdGF0ZS5idWZmZXJbMF0ubGVuZ3RoO1xuICAgIGVsc2VcbiAgICAgIHJldHVybiBzdGF0ZS5sZW5ndGg7XG4gIH1cblxuICBpZiAobiA8PSAwKVxuICAgIHJldHVybiAwO1xuXG4gIC8vIElmIHdlJ3JlIGFza2luZyBmb3IgbW9yZSB0aGFuIHRoZSB0YXJnZXQgYnVmZmVyIGxldmVsLFxuICAvLyB0aGVuIHJhaXNlIHRoZSB3YXRlciBtYXJrLiAgQnVtcCB1cCB0byB0aGUgbmV4dCBoaWdoZXN0XG4gIC8vIHBvd2VyIG9mIDIsIHRvIHByZXZlbnQgaW5jcmVhc2luZyBpdCBleGNlc3NpdmVseSBpbiB0aW55XG4gIC8vIGFtb3VudHMuXG4gIGlmIChuID4gc3RhdGUuaGlnaFdhdGVyTWFyaylcbiAgICBzdGF0ZS5oaWdoV2F0ZXJNYXJrID0gcm91bmRVcFRvTmV4dFBvd2VyT2YyKG4pO1xuXG4gIC8vIGRvbid0IGhhdmUgdGhhdCBtdWNoLiAgcmV0dXJuIG51bGwsIHVubGVzcyB3ZSd2ZSBlbmRlZC5cbiAgaWYgKG4gPiBzdGF0ZS5sZW5ndGgpIHtcbiAgICBpZiAoIXN0YXRlLmVuZGVkKSB7XG4gICAgICBzdGF0ZS5uZWVkUmVhZGFibGUgPSB0cnVlO1xuICAgICAgcmV0dXJuIDA7XG4gICAgfSBlbHNlXG4gICAgICByZXR1cm4gc3RhdGUubGVuZ3RoO1xuICB9XG5cbiAgcmV0dXJuIG47XG59XG5cbi8vIHlvdSBjYW4gb3ZlcnJpZGUgZWl0aGVyIHRoaXMgbWV0aG9kLCBvciB0aGUgYXN5bmMgX3JlYWQobikgYmVsb3cuXG5SZWFkYWJsZS5wcm90b3R5cGUucmVhZCA9IGZ1bmN0aW9uKG4pIHtcbiAgZGVidWcoJ3JlYWQnLCBuKTtcbiAgdmFyIHN0YXRlID0gdGhpcy5fcmVhZGFibGVTdGF0ZTtcbiAgdmFyIG5PcmlnID0gbjtcblxuICBpZiAoIXV0aWwuaXNOdW1iZXIobikgfHwgbiA+IDApXG4gICAgc3RhdGUuZW1pdHRlZFJlYWRhYmxlID0gZmFsc2U7XG5cbiAgLy8gaWYgd2UncmUgZG9pbmcgcmVhZCgwKSB0byB0cmlnZ2VyIGEgcmVhZGFibGUgZXZlbnQsIGJ1dCB3ZVxuICAvLyBhbHJlYWR5IGhhdmUgYSBidW5jaCBvZiBkYXRhIGluIHRoZSBidWZmZXIsIHRoZW4ganVzdCB0cmlnZ2VyXG4gIC8vIHRoZSAncmVhZGFibGUnIGV2ZW50IGFuZCBtb3ZlIG9uLlxuICBpZiAobiA9PT0gMCAmJlxuICAgICAgc3RhdGUubmVlZFJlYWRhYmxlICYmXG4gICAgICAoc3RhdGUubGVuZ3RoID49IHN0YXRlLmhpZ2hXYXRlck1hcmsgfHwgc3RhdGUuZW5kZWQpKSB7XG4gICAgZGVidWcoJ3JlYWQ6IGVtaXRSZWFkYWJsZScsIHN0YXRlLmxlbmd0aCwgc3RhdGUuZW5kZWQpO1xuICAgIGlmIChzdGF0ZS5sZW5ndGggPT09IDAgJiYgc3RhdGUuZW5kZWQpXG4gICAgICBlbmRSZWFkYWJsZSh0aGlzKTtcbiAgICBlbHNlXG4gICAgICBlbWl0UmVhZGFibGUodGhpcyk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBuID0gaG93TXVjaFRvUmVhZChuLCBzdGF0ZSk7XG5cbiAgLy8gaWYgd2UndmUgZW5kZWQsIGFuZCB3ZSdyZSBub3cgY2xlYXIsIHRoZW4gZmluaXNoIGl0IHVwLlxuICBpZiAobiA9PT0gMCAmJiBzdGF0ZS5lbmRlZCkge1xuICAgIGlmIChzdGF0ZS5sZW5ndGggPT09IDApXG4gICAgICBlbmRSZWFkYWJsZSh0aGlzKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8vIEFsbCB0aGUgYWN0dWFsIGNodW5rIGdlbmVyYXRpb24gbG9naWMgbmVlZHMgdG8gYmVcbiAgLy8gKmJlbG93KiB0aGUgY2FsbCB0byBfcmVhZC4gIFRoZSByZWFzb24gaXMgdGhhdCBpbiBjZXJ0YWluXG4gIC8vIHN5bnRoZXRpYyBzdHJlYW0gY2FzZXMsIHN1Y2ggYXMgcGFzc3Rocm91Z2ggc3RyZWFtcywgX3JlYWRcbiAgLy8gbWF5IGJlIGEgY29tcGxldGVseSBzeW5jaHJvbm91cyBvcGVyYXRpb24gd2hpY2ggbWF5IGNoYW5nZVxuICAvLyB0aGUgc3RhdGUgb2YgdGhlIHJlYWQgYnVmZmVyLCBwcm92aWRpbmcgZW5vdWdoIGRhdGEgd2hlblxuICAvLyBiZWZvcmUgdGhlcmUgd2FzICpub3QqIGVub3VnaC5cbiAgLy9cbiAgLy8gU28sIHRoZSBzdGVwcyBhcmU6XG4gIC8vIDEuIEZpZ3VyZSBvdXQgd2hhdCB0aGUgc3RhdGUgb2YgdGhpbmdzIHdpbGwgYmUgYWZ0ZXIgd2UgZG9cbiAgLy8gYSByZWFkIGZyb20gdGhlIGJ1ZmZlci5cbiAgLy9cbiAgLy8gMi4gSWYgdGhhdCByZXN1bHRpbmcgc3RhdGUgd2lsbCB0cmlnZ2VyIGEgX3JlYWQsIHRoZW4gY2FsbCBfcmVhZC5cbiAgLy8gTm90ZSB0aGF0IHRoaXMgbWF5IGJlIGFzeW5jaHJvbm91cywgb3Igc3luY2hyb25vdXMuICBZZXMsIGl0IGlzXG4gIC8vIGRlZXBseSB1Z2x5IHRvIHdyaXRlIEFQSXMgdGhpcyB3YXksIGJ1dCB0aGF0IHN0aWxsIGRvZXNuJ3QgbWVhblxuICAvLyB0aGF0IHRoZSBSZWFkYWJsZSBjbGFzcyBzaG91bGQgYmVoYXZlIGltcHJvcGVybHksIGFzIHN0cmVhbXMgYXJlXG4gIC8vIGRlc2lnbmVkIHRvIGJlIHN5bmMvYXN5bmMgYWdub3N0aWMuXG4gIC8vIFRha2Ugbm90ZSBpZiB0aGUgX3JlYWQgY2FsbCBpcyBzeW5jIG9yIGFzeW5jIChpZSwgaWYgdGhlIHJlYWQgY2FsbFxuICAvLyBoYXMgcmV0dXJuZWQgeWV0KSwgc28gdGhhdCB3ZSBrbm93IHdoZXRoZXIgb3Igbm90IGl0J3Mgc2FmZSB0byBlbWl0XG4gIC8vICdyZWFkYWJsZScgZXRjLlxuICAvL1xuICAvLyAzLiBBY3R1YWxseSBwdWxsIHRoZSByZXF1ZXN0ZWQgY2h1bmtzIG91dCBvZiB0aGUgYnVmZmVyIGFuZCByZXR1cm4uXG5cbiAgLy8gaWYgd2UgbmVlZCBhIHJlYWRhYmxlIGV2ZW50LCB0aGVuIHdlIG5lZWQgdG8gZG8gc29tZSByZWFkaW5nLlxuICB2YXIgZG9SZWFkID0gc3RhdGUubmVlZFJlYWRhYmxlO1xuICBkZWJ1ZygnbmVlZCByZWFkYWJsZScsIGRvUmVhZCk7XG5cbiAgLy8gaWYgd2UgY3VycmVudGx5IGhhdmUgbGVzcyB0aGFuIHRoZSBoaWdoV2F0ZXJNYXJrLCB0aGVuIGFsc28gcmVhZCBzb21lXG4gIGlmIChzdGF0ZS5sZW5ndGggPT09IDAgfHwgc3RhdGUubGVuZ3RoIC0gbiA8IHN0YXRlLmhpZ2hXYXRlck1hcmspIHtcbiAgICBkb1JlYWQgPSB0cnVlO1xuICAgIGRlYnVnKCdsZW5ndGggbGVzcyB0aGFuIHdhdGVybWFyaycsIGRvUmVhZCk7XG4gIH1cblxuICAvLyBob3dldmVyLCBpZiB3ZSd2ZSBlbmRlZCwgdGhlbiB0aGVyZSdzIG5vIHBvaW50LCBhbmQgaWYgd2UncmUgYWxyZWFkeVxuICAvLyByZWFkaW5nLCB0aGVuIGl0J3MgdW5uZWNlc3NhcnkuXG4gIGlmIChzdGF0ZS5lbmRlZCB8fCBzdGF0ZS5yZWFkaW5nKSB7XG4gICAgZG9SZWFkID0gZmFsc2U7XG4gICAgZGVidWcoJ3JlYWRpbmcgb3IgZW5kZWQnLCBkb1JlYWQpO1xuICB9XG5cbiAgaWYgKGRvUmVhZCkge1xuICAgIGRlYnVnKCdkbyByZWFkJyk7XG4gICAgc3RhdGUucmVhZGluZyA9IHRydWU7XG4gICAgc3RhdGUuc3luYyA9IHRydWU7XG4gICAgLy8gaWYgdGhlIGxlbmd0aCBpcyBjdXJyZW50bHkgemVybywgdGhlbiB3ZSAqbmVlZCogYSByZWFkYWJsZSBldmVudC5cbiAgICBpZiAoc3RhdGUubGVuZ3RoID09PSAwKVxuICAgICAgc3RhdGUubmVlZFJlYWRhYmxlID0gdHJ1ZTtcbiAgICAvLyBjYWxsIGludGVybmFsIHJlYWQgbWV0aG9kXG4gICAgdGhpcy5fcmVhZChzdGF0ZS5oaWdoV2F0ZXJNYXJrKTtcbiAgICBzdGF0ZS5zeW5jID0gZmFsc2U7XG4gIH1cblxuICAvLyBJZiBfcmVhZCBwdXNoZWQgZGF0YSBzeW5jaHJvbm91c2x5LCB0aGVuIGByZWFkaW5nYCB3aWxsIGJlIGZhbHNlLFxuICAvLyBhbmQgd2UgbmVlZCB0byByZS1ldmFsdWF0ZSBob3cgbXVjaCBkYXRhIHdlIGNhbiByZXR1cm4gdG8gdGhlIHVzZXIuXG4gIGlmIChkb1JlYWQgJiYgIXN0YXRlLnJlYWRpbmcpXG4gICAgbiA9IGhvd011Y2hUb1JlYWQobk9yaWcsIHN0YXRlKTtcblxuICB2YXIgcmV0O1xuICBpZiAobiA+IDApXG4gICAgcmV0ID0gZnJvbUxpc3Qobiwgc3RhdGUpO1xuICBlbHNlXG4gICAgcmV0ID0gbnVsbDtcblxuICBpZiAodXRpbC5pc051bGwocmV0KSkge1xuICAgIHN0YXRlLm5lZWRSZWFkYWJsZSA9IHRydWU7XG4gICAgbiA9IDA7XG4gIH1cblxuICBzdGF0ZS5sZW5ndGggLT0gbjtcblxuICAvLyBJZiB3ZSBoYXZlIG5vdGhpbmcgaW4gdGhlIGJ1ZmZlciwgdGhlbiB3ZSB3YW50IHRvIGtub3dcbiAgLy8gYXMgc29vbiBhcyB3ZSAqZG8qIGdldCBzb21ldGhpbmcgaW50byB0aGUgYnVmZmVyLlxuICBpZiAoc3RhdGUubGVuZ3RoID09PSAwICYmICFzdGF0ZS5lbmRlZClcbiAgICBzdGF0ZS5uZWVkUmVhZGFibGUgPSB0cnVlO1xuXG4gIC8vIElmIHdlIHRyaWVkIHRvIHJlYWQoKSBwYXN0IHRoZSBFT0YsIHRoZW4gZW1pdCBlbmQgb24gdGhlIG5leHQgdGljay5cbiAgaWYgKG5PcmlnICE9PSBuICYmIHN0YXRlLmVuZGVkICYmIHN0YXRlLmxlbmd0aCA9PT0gMClcbiAgICBlbmRSZWFkYWJsZSh0aGlzKTtcblxuICBpZiAoIXV0aWwuaXNOdWxsKHJldCkpXG4gICAgdGhpcy5lbWl0KCdkYXRhJywgcmV0KTtcblxuICByZXR1cm4gcmV0O1xufTtcblxuZnVuY3Rpb24gY2h1bmtJbnZhbGlkKHN0YXRlLCBjaHVuaykge1xuICB2YXIgZXIgPSBudWxsO1xuICBpZiAoIXV0aWwuaXNCdWZmZXIoY2h1bmspICYmXG4gICAgICAhdXRpbC5pc1N0cmluZyhjaHVuaykgJiZcbiAgICAgICF1dGlsLmlzTnVsbE9yVW5kZWZpbmVkKGNodW5rKSAmJlxuICAgICAgIXN0YXRlLm9iamVjdE1vZGUpIHtcbiAgICBlciA9IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgbm9uLXN0cmluZy9idWZmZXIgY2h1bmsnKTtcbiAgfVxuICByZXR1cm4gZXI7XG59XG5cblxuZnVuY3Rpb24gb25Fb2ZDaHVuayhzdHJlYW0sIHN0YXRlKSB7XG4gIGlmIChzdGF0ZS5kZWNvZGVyICYmICFzdGF0ZS5lbmRlZCkge1xuICAgIHZhciBjaHVuayA9IHN0YXRlLmRlY29kZXIuZW5kKCk7XG4gICAgaWYgKGNodW5rICYmIGNodW5rLmxlbmd0aCkge1xuICAgICAgc3RhdGUuYnVmZmVyLnB1c2goY2h1bmspO1xuICAgICAgc3RhdGUubGVuZ3RoICs9IHN0YXRlLm9iamVjdE1vZGUgPyAxIDogY2h1bmsubGVuZ3RoO1xuICAgIH1cbiAgfVxuICBzdGF0ZS5lbmRlZCA9IHRydWU7XG5cbiAgLy8gZW1pdCAncmVhZGFibGUnIG5vdyB0byBtYWtlIHN1cmUgaXQgZ2V0cyBwaWNrZWQgdXAuXG4gIGVtaXRSZWFkYWJsZShzdHJlYW0pO1xufVxuXG4vLyBEb24ndCBlbWl0IHJlYWRhYmxlIHJpZ2h0IGF3YXkgaW4gc3luYyBtb2RlLCBiZWNhdXNlIHRoaXMgY2FuIHRyaWdnZXJcbi8vIGFub3RoZXIgcmVhZCgpIGNhbGwgPT4gc3RhY2sgb3ZlcmZsb3cuICBUaGlzIHdheSwgaXQgbWlnaHQgdHJpZ2dlclxuLy8gYSBuZXh0VGljayByZWN1cnNpb24gd2FybmluZywgYnV0IHRoYXQncyBub3Qgc28gYmFkLlxuZnVuY3Rpb24gZW1pdFJlYWRhYmxlKHN0cmVhbSkge1xuICB2YXIgc3RhdGUgPSBzdHJlYW0uX3JlYWRhYmxlU3RhdGU7XG4gIHN0YXRlLm5lZWRSZWFkYWJsZSA9IGZhbHNlO1xuICBpZiAoIXN0YXRlLmVtaXR0ZWRSZWFkYWJsZSkge1xuICAgIGRlYnVnKCdlbWl0UmVhZGFibGUnLCBzdGF0ZS5mbG93aW5nKTtcbiAgICBzdGF0ZS5lbWl0dGVkUmVhZGFibGUgPSB0cnVlO1xuICAgIGlmIChzdGF0ZS5zeW5jKVxuICAgICAgcHJvY2Vzcy5uZXh0VGljayhmdW5jdGlvbigpIHtcbiAgICAgICAgZW1pdFJlYWRhYmxlXyhzdHJlYW0pO1xuICAgICAgfSk7XG4gICAgZWxzZVxuICAgICAgZW1pdFJlYWRhYmxlXyhzdHJlYW0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGVtaXRSZWFkYWJsZV8oc3RyZWFtKSB7XG4gIGRlYnVnKCdlbWl0IHJlYWRhYmxlJyk7XG4gIHN0cmVhbS5lbWl0KCdyZWFkYWJsZScpO1xuICBmbG93KHN0cmVhbSk7XG59XG5cblxuLy8gYXQgdGhpcyBwb2ludCwgdGhlIHVzZXIgaGFzIHByZXN1bWFibHkgc2VlbiB0aGUgJ3JlYWRhYmxlJyBldmVudCxcbi8vIGFuZCBjYWxsZWQgcmVhZCgpIHRvIGNvbnN1bWUgc29tZSBkYXRhLiAgdGhhdCBtYXkgaGF2ZSB0cmlnZ2VyZWRcbi8vIGluIHR1cm4gYW5vdGhlciBfcmVhZChuKSBjYWxsLCBpbiB3aGljaCBjYXNlIHJlYWRpbmcgPSB0cnVlIGlmXG4vLyBpdCdzIGluIHByb2dyZXNzLlxuLy8gSG93ZXZlciwgaWYgd2UncmUgbm90IGVuZGVkLCBvciByZWFkaW5nLCBhbmQgdGhlIGxlbmd0aCA8IGh3bSxcbi8vIHRoZW4gZ28gYWhlYWQgYW5kIHRyeSB0byByZWFkIHNvbWUgbW9yZSBwcmVlbXB0aXZlbHkuXG5mdW5jdGlvbiBtYXliZVJlYWRNb3JlKHN0cmVhbSwgc3RhdGUpIHtcbiAgaWYgKCFzdGF0ZS5yZWFkaW5nTW9yZSkge1xuICAgIHN0YXRlLnJlYWRpbmdNb3JlID0gdHJ1ZTtcbiAgICBwcm9jZXNzLm5leHRUaWNrKGZ1bmN0aW9uKCkge1xuICAgICAgbWF5YmVSZWFkTW9yZV8oc3RyZWFtLCBzdGF0ZSk7XG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gbWF5YmVSZWFkTW9yZV8oc3RyZWFtLCBzdGF0ZSkge1xuICB2YXIgbGVuID0gc3RhdGUubGVuZ3RoO1xuICB3aGlsZSAoIXN0YXRlLnJlYWRpbmcgJiYgIXN0YXRlLmZsb3dpbmcgJiYgIXN0YXRlLmVuZGVkICYmXG4gICAgICAgICBzdGF0ZS5sZW5ndGggPCBzdGF0ZS5oaWdoV2F0ZXJNYXJrKSB7XG4gICAgZGVidWcoJ21heWJlUmVhZE1vcmUgcmVhZCAwJyk7XG4gICAgc3RyZWFtLnJlYWQoMCk7XG4gICAgaWYgKGxlbiA9PT0gc3RhdGUubGVuZ3RoKVxuICAgICAgLy8gZGlkbid0IGdldCBhbnkgZGF0YSwgc3RvcCBzcGlubmluZy5cbiAgICAgIGJyZWFrO1xuICAgIGVsc2VcbiAgICAgIGxlbiA9IHN0YXRlLmxlbmd0aDtcbiAgfVxuICBzdGF0ZS5yZWFkaW5nTW9yZSA9IGZhbHNlO1xufVxuXG4vLyBhYnN0cmFjdCBtZXRob2QuICB0byBiZSBvdmVycmlkZGVuIGluIHNwZWNpZmljIGltcGxlbWVudGF0aW9uIGNsYXNzZXMuXG4vLyBjYWxsIGNiKGVyLCBkYXRhKSB3aGVyZSBkYXRhIGlzIDw9IG4gaW4gbGVuZ3RoLlxuLy8gZm9yIHZpcnR1YWwgKG5vbi1zdHJpbmcsIG5vbi1idWZmZXIpIHN0cmVhbXMsIFwibGVuZ3RoXCIgaXMgc29tZXdoYXRcbi8vIGFyYml0cmFyeSwgYW5kIHBlcmhhcHMgbm90IHZlcnkgbWVhbmluZ2Z1bC5cblJlYWRhYmxlLnByb3RvdHlwZS5fcmVhZCA9IGZ1bmN0aW9uKG4pIHtcbiAgdGhpcy5lbWl0KCdlcnJvcicsIG5ldyBFcnJvcignbm90IGltcGxlbWVudGVkJykpO1xufTtcblxuUmVhZGFibGUucHJvdG90eXBlLnBpcGUgPSBmdW5jdGlvbihkZXN0LCBwaXBlT3B0cykge1xuICB2YXIgc3JjID0gdGhpcztcbiAgdmFyIHN0YXRlID0gdGhpcy5fcmVhZGFibGVTdGF0ZTtcblxuICBzd2l0Y2ggKHN0YXRlLnBpcGVzQ291bnQpIHtcbiAgICBjYXNlIDA6XG4gICAgICBzdGF0ZS5waXBlcyA9IGRlc3Q7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDE6XG4gICAgICBzdGF0ZS5waXBlcyA9IFtzdGF0ZS5waXBlcywgZGVzdF07XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgc3RhdGUucGlwZXMucHVzaChkZXN0KTtcbiAgICAgIGJyZWFrO1xuICB9XG4gIHN0YXRlLnBpcGVzQ291bnQgKz0gMTtcbiAgZGVidWcoJ3BpcGUgY291bnQ9JWQgb3B0cz0laicsIHN0YXRlLnBpcGVzQ291bnQsIHBpcGVPcHRzKTtcblxuICB2YXIgZG9FbmQgPSAoIXBpcGVPcHRzIHx8IHBpcGVPcHRzLmVuZCAhPT0gZmFsc2UpICYmXG4gICAgICAgICAgICAgIGRlc3QgIT09IHByb2Nlc3Muc3Rkb3V0ICYmXG4gICAgICAgICAgICAgIGRlc3QgIT09IHByb2Nlc3Muc3RkZXJyO1xuXG4gIHZhciBlbmRGbiA9IGRvRW5kID8gb25lbmQgOiBjbGVhbnVwO1xuICBpZiAoc3RhdGUuZW5kRW1pdHRlZClcbiAgICBwcm9jZXNzLm5leHRUaWNrKGVuZEZuKTtcbiAgZWxzZVxuICAgIHNyYy5vbmNlKCdlbmQnLCBlbmRGbik7XG5cbiAgZGVzdC5vbigndW5waXBlJywgb251bnBpcGUpO1xuICBmdW5jdGlvbiBvbnVucGlwZShyZWFkYWJsZSkge1xuICAgIGRlYnVnKCdvbnVucGlwZScpO1xuICAgIGlmIChyZWFkYWJsZSA9PT0gc3JjKSB7XG4gICAgICBjbGVhbnVwKCk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gb25lbmQoKSB7XG4gICAgZGVidWcoJ29uZW5kJyk7XG4gICAgZGVzdC5lbmQoKTtcbiAgfVxuXG4gIC8vIHdoZW4gdGhlIGRlc3QgZHJhaW5zLCBpdCByZWR1Y2VzIHRoZSBhd2FpdERyYWluIGNvdW50ZXJcbiAgLy8gb24gdGhlIHNvdXJjZS4gIFRoaXMgd291bGQgYmUgbW9yZSBlbGVnYW50IHdpdGggYSAub25jZSgpXG4gIC8vIGhhbmRsZXIgaW4gZmxvdygpLCBidXQgYWRkaW5nIGFuZCByZW1vdmluZyByZXBlYXRlZGx5IGlzXG4gIC8vIHRvbyBzbG93LlxuICB2YXIgb25kcmFpbiA9IHBpcGVPbkRyYWluKHNyYyk7XG4gIGRlc3Qub24oJ2RyYWluJywgb25kcmFpbik7XG5cbiAgZnVuY3Rpb24gY2xlYW51cCgpIHtcbiAgICBkZWJ1ZygnY2xlYW51cCcpO1xuICAgIC8vIGNsZWFudXAgZXZlbnQgaGFuZGxlcnMgb25jZSB0aGUgcGlwZSBpcyBicm9rZW5cbiAgICBkZXN0LnJlbW92ZUxpc3RlbmVyKCdjbG9zZScsIG9uY2xvc2UpO1xuICAgIGRlc3QucmVtb3ZlTGlzdGVuZXIoJ2ZpbmlzaCcsIG9uZmluaXNoKTtcbiAgICBkZXN0LnJlbW92ZUxpc3RlbmVyKCdkcmFpbicsIG9uZHJhaW4pO1xuICAgIGRlc3QucmVtb3ZlTGlzdGVuZXIoJ2Vycm9yJywgb25lcnJvcik7XG4gICAgZGVzdC5yZW1vdmVMaXN0ZW5lcigndW5waXBlJywgb251bnBpcGUpO1xuICAgIHNyYy5yZW1vdmVMaXN0ZW5lcignZW5kJywgb25lbmQpO1xuICAgIHNyYy5yZW1vdmVMaXN0ZW5lcignZW5kJywgY2xlYW51cCk7XG4gICAgc3JjLnJlbW92ZUxpc3RlbmVyKCdkYXRhJywgb25kYXRhKTtcblxuICAgIC8vIGlmIHRoZSByZWFkZXIgaXMgd2FpdGluZyBmb3IgYSBkcmFpbiBldmVudCBmcm9tIHRoaXNcbiAgICAvLyBzcGVjaWZpYyB3cml0ZXIsIHRoZW4gaXQgd291bGQgY2F1c2UgaXQgdG8gbmV2ZXIgc3RhcnRcbiAgICAvLyBmbG93aW5nIGFnYWluLlxuICAgIC8vIFNvLCBpZiB0aGlzIGlzIGF3YWl0aW5nIGEgZHJhaW4sIHRoZW4gd2UganVzdCBjYWxsIGl0IG5vdy5cbiAgICAvLyBJZiB3ZSBkb24ndCBrbm93LCB0aGVuIGFzc3VtZSB0aGF0IHdlIGFyZSB3YWl0aW5nIGZvciBvbmUuXG4gICAgaWYgKHN0YXRlLmF3YWl0RHJhaW4gJiZcbiAgICAgICAgKCFkZXN0Ll93cml0YWJsZVN0YXRlIHx8IGRlc3QuX3dyaXRhYmxlU3RhdGUubmVlZERyYWluKSlcbiAgICAgIG9uZHJhaW4oKTtcbiAgfVxuXG4gIHNyYy5vbignZGF0YScsIG9uZGF0YSk7XG4gIGZ1bmN0aW9uIG9uZGF0YShjaHVuaykge1xuICAgIGRlYnVnKCdvbmRhdGEnKTtcbiAgICB2YXIgcmV0ID0gZGVzdC53cml0ZShjaHVuayk7XG4gICAgaWYgKGZhbHNlID09PSByZXQpIHtcbiAgICAgIGRlYnVnKCdmYWxzZSB3cml0ZSByZXNwb25zZSwgcGF1c2UnLFxuICAgICAgICAgICAgc3JjLl9yZWFkYWJsZVN0YXRlLmF3YWl0RHJhaW4pO1xuICAgICAgc3JjLl9yZWFkYWJsZVN0YXRlLmF3YWl0RHJhaW4rKztcbiAgICAgIHNyYy5wYXVzZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8vIGlmIHRoZSBkZXN0IGhhcyBhbiBlcnJvciwgdGhlbiBzdG9wIHBpcGluZyBpbnRvIGl0LlxuICAvLyBob3dldmVyLCBkb24ndCBzdXBwcmVzcyB0aGUgdGhyb3dpbmcgYmVoYXZpb3IgZm9yIHRoaXMuXG4gIGZ1bmN0aW9uIG9uZXJyb3IoZXIpIHtcbiAgICBkZWJ1Zygnb25lcnJvcicsIGVyKTtcbiAgICB1bnBpcGUoKTtcbiAgICBkZXN0LnJlbW92ZUxpc3RlbmVyKCdlcnJvcicsIG9uZXJyb3IpO1xuICAgIGlmIChFRS5saXN0ZW5lckNvdW50KGRlc3QsICdlcnJvcicpID09PSAwKVxuICAgICAgZGVzdC5lbWl0KCdlcnJvcicsIGVyKTtcbiAgfVxuICAvLyBUaGlzIGlzIGEgYnJ1dGFsbHkgdWdseSBoYWNrIHRvIG1ha2Ugc3VyZSB0aGF0IG91ciBlcnJvciBoYW5kbGVyXG4gIC8vIGlzIGF0dGFjaGVkIGJlZm9yZSBhbnkgdXNlcmxhbmQgb25lcy4gIE5FVkVSIERPIFRISVMuXG4gIGlmICghZGVzdC5fZXZlbnRzIHx8ICFkZXN0Ll9ldmVudHMuZXJyb3IpXG4gICAgZGVzdC5vbignZXJyb3InLCBvbmVycm9yKTtcbiAgZWxzZSBpZiAoaXNBcnJheShkZXN0Ll9ldmVudHMuZXJyb3IpKVxuICAgIGRlc3QuX2V2ZW50cy5lcnJvci51bnNoaWZ0KG9uZXJyb3IpO1xuICBlbHNlXG4gICAgZGVzdC5fZXZlbnRzLmVycm9yID0gW29uZXJyb3IsIGRlc3QuX2V2ZW50cy5lcnJvcl07XG5cblxuXG4gIC8vIEJvdGggY2xvc2UgYW5kIGZpbmlzaCBzaG91bGQgdHJpZ2dlciB1bnBpcGUsIGJ1dCBvbmx5IG9uY2UuXG4gIGZ1bmN0aW9uIG9uY2xvc2UoKSB7XG4gICAgZGVzdC5yZW1vdmVMaXN0ZW5lcignZmluaXNoJywgb25maW5pc2gpO1xuICAgIHVucGlwZSgpO1xuICB9XG4gIGRlc3Qub25jZSgnY2xvc2UnLCBvbmNsb3NlKTtcbiAgZnVuY3Rpb24gb25maW5pc2goKSB7XG4gICAgZGVidWcoJ29uZmluaXNoJyk7XG4gICAgZGVzdC5yZW1vdmVMaXN0ZW5lcignY2xvc2UnLCBvbmNsb3NlKTtcbiAgICB1bnBpcGUoKTtcbiAgfVxuICBkZXN0Lm9uY2UoJ2ZpbmlzaCcsIG9uZmluaXNoKTtcblxuICBmdW5jdGlvbiB1bnBpcGUoKSB7XG4gICAgZGVidWcoJ3VucGlwZScpO1xuICAgIHNyYy51bnBpcGUoZGVzdCk7XG4gIH1cblxuICAvLyB0ZWxsIHRoZSBkZXN0IHRoYXQgaXQncyBiZWluZyBwaXBlZCB0b1xuICBkZXN0LmVtaXQoJ3BpcGUnLCBzcmMpO1xuXG4gIC8vIHN0YXJ0IHRoZSBmbG93IGlmIGl0IGhhc24ndCBiZWVuIHN0YXJ0ZWQgYWxyZWFkeS5cbiAgaWYgKCFzdGF0ZS5mbG93aW5nKSB7XG4gICAgZGVidWcoJ3BpcGUgcmVzdW1lJyk7XG4gICAgc3JjLnJlc3VtZSgpO1xuICB9XG5cbiAgcmV0dXJuIGRlc3Q7XG59O1xuXG5mdW5jdGlvbiBwaXBlT25EcmFpbihzcmMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdGF0ZSA9IHNyYy5fcmVhZGFibGVTdGF0ZTtcbiAgICBkZWJ1ZygncGlwZU9uRHJhaW4nLCBzdGF0ZS5hd2FpdERyYWluKTtcbiAgICBpZiAoc3RhdGUuYXdhaXREcmFpbilcbiAgICAgIHN0YXRlLmF3YWl0RHJhaW4tLTtcbiAgICBpZiAoc3RhdGUuYXdhaXREcmFpbiA9PT0gMCAmJiBFRS5saXN0ZW5lckNvdW50KHNyYywgJ2RhdGEnKSkge1xuICAgICAgc3RhdGUuZmxvd2luZyA9IHRydWU7XG4gICAgICBmbG93KHNyYyk7XG4gICAgfVxuICB9O1xufVxuXG5cblJlYWRhYmxlLnByb3RvdHlwZS51bnBpcGUgPSBmdW5jdGlvbihkZXN0KSB7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX3JlYWRhYmxlU3RhdGU7XG5cbiAgLy8gaWYgd2UncmUgbm90IHBpcGluZyBhbnl3aGVyZSwgdGhlbiBkbyBub3RoaW5nLlxuICBpZiAoc3RhdGUucGlwZXNDb3VudCA9PT0gMClcbiAgICByZXR1cm4gdGhpcztcblxuICAvLyBqdXN0IG9uZSBkZXN0aW5hdGlvbi4gIG1vc3QgY29tbW9uIGNhc2UuXG4gIGlmIChzdGF0ZS5waXBlc0NvdW50ID09PSAxKSB7XG4gICAgLy8gcGFzc2VkIGluIG9uZSwgYnV0IGl0J3Mgbm90IHRoZSByaWdodCBvbmUuXG4gICAgaWYgKGRlc3QgJiYgZGVzdCAhPT0gc3RhdGUucGlwZXMpXG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIGlmICghZGVzdClcbiAgICAgIGRlc3QgPSBzdGF0ZS5waXBlcztcblxuICAgIC8vIGdvdCBhIG1hdGNoLlxuICAgIHN0YXRlLnBpcGVzID0gbnVsbDtcbiAgICBzdGF0ZS5waXBlc0NvdW50ID0gMDtcbiAgICBzdGF0ZS5mbG93aW5nID0gZmFsc2U7XG4gICAgaWYgKGRlc3QpXG4gICAgICBkZXN0LmVtaXQoJ3VucGlwZScsIHRoaXMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gc2xvdyBjYXNlLiBtdWx0aXBsZSBwaXBlIGRlc3RpbmF0aW9ucy5cblxuICBpZiAoIWRlc3QpIHtcbiAgICAvLyByZW1vdmUgYWxsLlxuICAgIHZhciBkZXN0cyA9IHN0YXRlLnBpcGVzO1xuICAgIHZhciBsZW4gPSBzdGF0ZS5waXBlc0NvdW50O1xuICAgIHN0YXRlLnBpcGVzID0gbnVsbDtcbiAgICBzdGF0ZS5waXBlc0NvdW50ID0gMDtcbiAgICBzdGF0ZS5mbG93aW5nID0gZmFsc2U7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKVxuICAgICAgZGVzdHNbaV0uZW1pdCgndW5waXBlJywgdGhpcyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyB0cnkgdG8gZmluZCB0aGUgcmlnaHQgb25lLlxuICB2YXIgaSA9IGluZGV4T2Yoc3RhdGUucGlwZXMsIGRlc3QpO1xuICBpZiAoaSA9PT0gLTEpXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgc3RhdGUucGlwZXMuc3BsaWNlKGksIDEpO1xuICBzdGF0ZS5waXBlc0NvdW50IC09IDE7XG4gIGlmIChzdGF0ZS5waXBlc0NvdW50ID09PSAxKVxuICAgIHN0YXRlLnBpcGVzID0gc3RhdGUucGlwZXNbMF07XG5cbiAgZGVzdC5lbWl0KCd1bnBpcGUnLCB0aGlzKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIHNldCB1cCBkYXRhIGV2ZW50cyBpZiB0aGV5IGFyZSBhc2tlZCBmb3Jcbi8vIEVuc3VyZSByZWFkYWJsZSBsaXN0ZW5lcnMgZXZlbnR1YWxseSBnZXQgc29tZXRoaW5nXG5SZWFkYWJsZS5wcm90b3R5cGUub24gPSBmdW5jdGlvbihldiwgZm4pIHtcbiAgdmFyIHJlcyA9IFN0cmVhbS5wcm90b3R5cGUub24uY2FsbCh0aGlzLCBldiwgZm4pO1xuXG4gIC8vIElmIGxpc3RlbmluZyB0byBkYXRhLCBhbmQgaXQgaGFzIG5vdCBleHBsaWNpdGx5IGJlZW4gcGF1c2VkLFxuICAvLyB0aGVuIGNhbGwgcmVzdW1lIHRvIHN0YXJ0IHRoZSBmbG93IG9mIGRhdGEgb24gdGhlIG5leHQgdGljay5cbiAgaWYgKGV2ID09PSAnZGF0YScgJiYgZmFsc2UgIT09IHRoaXMuX3JlYWRhYmxlU3RhdGUuZmxvd2luZykge1xuICAgIHRoaXMucmVzdW1lKCk7XG4gIH1cblxuICBpZiAoZXYgPT09ICdyZWFkYWJsZScgJiYgdGhpcy5yZWFkYWJsZSkge1xuICAgIHZhciBzdGF0ZSA9IHRoaXMuX3JlYWRhYmxlU3RhdGU7XG4gICAgaWYgKCFzdGF0ZS5yZWFkYWJsZUxpc3RlbmluZykge1xuICAgICAgc3RhdGUucmVhZGFibGVMaXN0ZW5pbmcgPSB0cnVlO1xuICAgICAgc3RhdGUuZW1pdHRlZFJlYWRhYmxlID0gZmFsc2U7XG4gICAgICBzdGF0ZS5uZWVkUmVhZGFibGUgPSB0cnVlO1xuICAgICAgaWYgKCFzdGF0ZS5yZWFkaW5nKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgcHJvY2Vzcy5uZXh0VGljayhmdW5jdGlvbigpIHtcbiAgICAgICAgICBkZWJ1ZygncmVhZGFibGUgbmV4dHRpY2sgcmVhZCAwJyk7XG4gICAgICAgICAgc2VsZi5yZWFkKDApO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSBpZiAoc3RhdGUubGVuZ3RoKSB7XG4gICAgICAgIGVtaXRSZWFkYWJsZSh0aGlzLCBzdGF0ZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlcztcbn07XG5SZWFkYWJsZS5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBSZWFkYWJsZS5wcm90b3R5cGUub247XG5cbi8vIHBhdXNlKCkgYW5kIHJlc3VtZSgpIGFyZSByZW1uYW50cyBvZiB0aGUgbGVnYWN5IHJlYWRhYmxlIHN0cmVhbSBBUElcbi8vIElmIHRoZSB1c2VyIHVzZXMgdGhlbSwgdGhlbiBzd2l0Y2ggaW50byBvbGQgbW9kZS5cblJlYWRhYmxlLnByb3RvdHlwZS5yZXN1bWUgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHN0YXRlID0gdGhpcy5fcmVhZGFibGVTdGF0ZTtcbiAgaWYgKCFzdGF0ZS5mbG93aW5nKSB7XG4gICAgZGVidWcoJ3Jlc3VtZScpO1xuICAgIHN0YXRlLmZsb3dpbmcgPSB0cnVlO1xuICAgIGlmICghc3RhdGUucmVhZGluZykge1xuICAgICAgZGVidWcoJ3Jlc3VtZSByZWFkIDAnKTtcbiAgICAgIHRoaXMucmVhZCgwKTtcbiAgICB9XG4gICAgcmVzdW1lKHRoaXMsIHN0YXRlKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbmZ1bmN0aW9uIHJlc3VtZShzdHJlYW0sIHN0YXRlKSB7XG4gIGlmICghc3RhdGUucmVzdW1lU2NoZWR1bGVkKSB7XG4gICAgc3RhdGUucmVzdW1lU2NoZWR1bGVkID0gdHJ1ZTtcbiAgICBwcm9jZXNzLm5leHRUaWNrKGZ1bmN0aW9uKCkge1xuICAgICAgcmVzdW1lXyhzdHJlYW0sIHN0YXRlKTtcbiAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiByZXN1bWVfKHN0cmVhbSwgc3RhdGUpIHtcbiAgc3RhdGUucmVzdW1lU2NoZWR1bGVkID0gZmFsc2U7XG4gIHN0cmVhbS5lbWl0KCdyZXN1bWUnKTtcbiAgZmxvdyhzdHJlYW0pO1xuICBpZiAoc3RhdGUuZmxvd2luZyAmJiAhc3RhdGUucmVhZGluZylcbiAgICBzdHJlYW0ucmVhZCgwKTtcbn1cblxuUmVhZGFibGUucHJvdG90eXBlLnBhdXNlID0gZnVuY3Rpb24oKSB7XG4gIGRlYnVnKCdjYWxsIHBhdXNlIGZsb3dpbmc9JWonLCB0aGlzLl9yZWFkYWJsZVN0YXRlLmZsb3dpbmcpO1xuICBpZiAoZmFsc2UgIT09IHRoaXMuX3JlYWRhYmxlU3RhdGUuZmxvd2luZykge1xuICAgIGRlYnVnKCdwYXVzZScpO1xuICAgIHRoaXMuX3JlYWRhYmxlU3RhdGUuZmxvd2luZyA9IGZhbHNlO1xuICAgIHRoaXMuZW1pdCgncGF1c2UnKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbmZ1bmN0aW9uIGZsb3coc3RyZWFtKSB7XG4gIHZhciBzdGF0ZSA9IHN0cmVhbS5fcmVhZGFibGVTdGF0ZTtcbiAgZGVidWcoJ2Zsb3cnLCBzdGF0ZS5mbG93aW5nKTtcbiAgaWYgKHN0YXRlLmZsb3dpbmcpIHtcbiAgICBkbyB7XG4gICAgICB2YXIgY2h1bmsgPSBzdHJlYW0ucmVhZCgpO1xuICAgIH0gd2hpbGUgKG51bGwgIT09IGNodW5rICYmIHN0YXRlLmZsb3dpbmcpO1xuICB9XG59XG5cbi8vIHdyYXAgYW4gb2xkLXN0eWxlIHN0cmVhbSBhcyB0aGUgYXN5bmMgZGF0YSBzb3VyY2UuXG4vLyBUaGlzIGlzICpub3QqIHBhcnQgb2YgdGhlIHJlYWRhYmxlIHN0cmVhbSBpbnRlcmZhY2UuXG4vLyBJdCBpcyBhbiB1Z2x5IHVuZm9ydHVuYXRlIG1lc3Mgb2YgaGlzdG9yeS5cblJlYWRhYmxlLnByb3RvdHlwZS53cmFwID0gZnVuY3Rpb24oc3RyZWFtKSB7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX3JlYWRhYmxlU3RhdGU7XG4gIHZhciBwYXVzZWQgPSBmYWxzZTtcblxuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHN0cmVhbS5vbignZW5kJywgZnVuY3Rpb24oKSB7XG4gICAgZGVidWcoJ3dyYXBwZWQgZW5kJyk7XG4gICAgaWYgKHN0YXRlLmRlY29kZXIgJiYgIXN0YXRlLmVuZGVkKSB7XG4gICAgICB2YXIgY2h1bmsgPSBzdGF0ZS5kZWNvZGVyLmVuZCgpO1xuICAgICAgaWYgKGNodW5rICYmIGNodW5rLmxlbmd0aClcbiAgICAgICAgc2VsZi5wdXNoKGNodW5rKTtcbiAgICB9XG5cbiAgICBzZWxmLnB1c2gobnVsbCk7XG4gIH0pO1xuXG4gIHN0cmVhbS5vbignZGF0YScsIGZ1bmN0aW9uKGNodW5rKSB7XG4gICAgZGVidWcoJ3dyYXBwZWQgZGF0YScpO1xuICAgIGlmIChzdGF0ZS5kZWNvZGVyKVxuICAgICAgY2h1bmsgPSBzdGF0ZS5kZWNvZGVyLndyaXRlKGNodW5rKTtcbiAgICBpZiAoIWNodW5rIHx8ICFzdGF0ZS5vYmplY3RNb2RlICYmICFjaHVuay5sZW5ndGgpXG4gICAgICByZXR1cm47XG5cbiAgICB2YXIgcmV0ID0gc2VsZi5wdXNoKGNodW5rKTtcbiAgICBpZiAoIXJldCkge1xuICAgICAgcGF1c2VkID0gdHJ1ZTtcbiAgICAgIHN0cmVhbS5wYXVzZSgpO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gcHJveHkgYWxsIHRoZSBvdGhlciBtZXRob2RzLlxuICAvLyBpbXBvcnRhbnQgd2hlbiB3cmFwcGluZyBmaWx0ZXJzIGFuZCBkdXBsZXhlcy5cbiAgZm9yICh2YXIgaSBpbiBzdHJlYW0pIHtcbiAgICBpZiAodXRpbC5pc0Z1bmN0aW9uKHN0cmVhbVtpXSkgJiYgdXRpbC5pc1VuZGVmaW5lZCh0aGlzW2ldKSkge1xuICAgICAgdGhpc1tpXSA9IGZ1bmN0aW9uKG1ldGhvZCkgeyByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBzdHJlYW1bbWV0aG9kXS5hcHBseShzdHJlYW0sIGFyZ3VtZW50cyk7XG4gICAgICB9fShpKTtcbiAgICB9XG4gIH1cblxuICAvLyBwcm94eSBjZXJ0YWluIGltcG9ydGFudCBldmVudHMuXG4gIHZhciBldmVudHMgPSBbJ2Vycm9yJywgJ2Nsb3NlJywgJ2Rlc3Ryb3knLCAncGF1c2UnLCAncmVzdW1lJ107XG4gIGZvckVhY2goZXZlbnRzLCBmdW5jdGlvbihldikge1xuICAgIHN0cmVhbS5vbihldiwgc2VsZi5lbWl0LmJpbmQoc2VsZiwgZXYpKTtcbiAgfSk7XG5cbiAgLy8gd2hlbiB3ZSB0cnkgdG8gY29uc3VtZSBzb21lIG1vcmUgYnl0ZXMsIHNpbXBseSB1bnBhdXNlIHRoZVxuICAvLyB1bmRlcmx5aW5nIHN0cmVhbS5cbiAgc2VsZi5fcmVhZCA9IGZ1bmN0aW9uKG4pIHtcbiAgICBkZWJ1Zygnd3JhcHBlZCBfcmVhZCcsIG4pO1xuICAgIGlmIChwYXVzZWQpIHtcbiAgICAgIHBhdXNlZCA9IGZhbHNlO1xuICAgICAgc3RyZWFtLnJlc3VtZSgpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gc2VsZjtcbn07XG5cblxuXG4vLyBleHBvc2VkIGZvciB0ZXN0aW5nIHB1cnBvc2VzIG9ubHkuXG5SZWFkYWJsZS5fZnJvbUxpc3QgPSBmcm9tTGlzdDtcblxuLy8gUGx1Y2sgb2ZmIG4gYnl0ZXMgZnJvbSBhbiBhcnJheSBvZiBidWZmZXJzLlxuLy8gTGVuZ3RoIGlzIHRoZSBjb21iaW5lZCBsZW5ndGhzIG9mIGFsbCB0aGUgYnVmZmVycyBpbiB0aGUgbGlzdC5cbmZ1bmN0aW9uIGZyb21MaXN0KG4sIHN0YXRlKSB7XG4gIHZhciBsaXN0ID0gc3RhdGUuYnVmZmVyO1xuICB2YXIgbGVuZ3RoID0gc3RhdGUubGVuZ3RoO1xuICB2YXIgc3RyaW5nTW9kZSA9ICEhc3RhdGUuZGVjb2RlcjtcbiAgdmFyIG9iamVjdE1vZGUgPSAhIXN0YXRlLm9iamVjdE1vZGU7XG4gIHZhciByZXQ7XG5cbiAgLy8gbm90aGluZyBpbiB0aGUgbGlzdCwgZGVmaW5pdGVseSBlbXB0eS5cbiAgaWYgKGxpc3QubGVuZ3RoID09PSAwKVxuICAgIHJldHVybiBudWxsO1xuXG4gIGlmIChsZW5ndGggPT09IDApXG4gICAgcmV0ID0gbnVsbDtcbiAgZWxzZSBpZiAob2JqZWN0TW9kZSlcbiAgICByZXQgPSBsaXN0LnNoaWZ0KCk7XG4gIGVsc2UgaWYgKCFuIHx8IG4gPj0gbGVuZ3RoKSB7XG4gICAgLy8gcmVhZCBpdCBhbGwsIHRydW5jYXRlIHRoZSBhcnJheS5cbiAgICBpZiAoc3RyaW5nTW9kZSlcbiAgICAgIHJldCA9IGxpc3Quam9pbignJyk7XG4gICAgZWxzZVxuICAgICAgcmV0ID0gQnVmZmVyLmNvbmNhdChsaXN0LCBsZW5ndGgpO1xuICAgIGxpc3QubGVuZ3RoID0gMDtcbiAgfSBlbHNlIHtcbiAgICAvLyByZWFkIGp1c3Qgc29tZSBvZiBpdC5cbiAgICBpZiAobiA8IGxpc3RbMF0ubGVuZ3RoKSB7XG4gICAgICAvLyBqdXN0IHRha2UgYSBwYXJ0IG9mIHRoZSBmaXJzdCBsaXN0IGl0ZW0uXG4gICAgICAvLyBzbGljZSBpcyB0aGUgc2FtZSBmb3IgYnVmZmVycyBhbmQgc3RyaW5ncy5cbiAgICAgIHZhciBidWYgPSBsaXN0WzBdO1xuICAgICAgcmV0ID0gYnVmLnNsaWNlKDAsIG4pO1xuICAgICAgbGlzdFswXSA9IGJ1Zi5zbGljZShuKTtcbiAgICB9IGVsc2UgaWYgKG4gPT09IGxpc3RbMF0ubGVuZ3RoKSB7XG4gICAgICAvLyBmaXJzdCBsaXN0IGlzIGEgcGVyZmVjdCBtYXRjaFxuICAgICAgcmV0ID0gbGlzdC5zaGlmdCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBjb21wbGV4IGNhc2UuXG4gICAgICAvLyB3ZSBoYXZlIGVub3VnaCB0byBjb3ZlciBpdCwgYnV0IGl0IHNwYW5zIHBhc3QgdGhlIGZpcnN0IGJ1ZmZlci5cbiAgICAgIGlmIChzdHJpbmdNb2RlKVxuICAgICAgICByZXQgPSAnJztcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0ID0gbmV3IEJ1ZmZlcihuKTtcblxuICAgICAgdmFyIGMgPSAwO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBsaXN0Lmxlbmd0aDsgaSA8IGwgJiYgYyA8IG47IGkrKykge1xuICAgICAgICB2YXIgYnVmID0gbGlzdFswXTtcbiAgICAgICAgdmFyIGNweSA9IE1hdGgubWluKG4gLSBjLCBidWYubGVuZ3RoKTtcblxuICAgICAgICBpZiAoc3RyaW5nTW9kZSlcbiAgICAgICAgICByZXQgKz0gYnVmLnNsaWNlKDAsIGNweSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICBidWYuY29weShyZXQsIGMsIDAsIGNweSk7XG5cbiAgICAgICAgaWYgKGNweSA8IGJ1Zi5sZW5ndGgpXG4gICAgICAgICAgbGlzdFswXSA9IGJ1Zi5zbGljZShjcHkpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgbGlzdC5zaGlmdCgpO1xuXG4gICAgICAgIGMgKz0gY3B5O1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXQ7XG59XG5cbmZ1bmN0aW9uIGVuZFJlYWRhYmxlKHN0cmVhbSkge1xuICB2YXIgc3RhdGUgPSBzdHJlYW0uX3JlYWRhYmxlU3RhdGU7XG5cbiAgLy8gSWYgd2UgZ2V0IGhlcmUgYmVmb3JlIGNvbnN1bWluZyBhbGwgdGhlIGJ5dGVzLCB0aGVuIHRoYXQgaXMgYVxuICAvLyBidWcgaW4gbm9kZS4gIFNob3VsZCBuZXZlciBoYXBwZW4uXG4gIGlmIChzdGF0ZS5sZW5ndGggPiAwKVxuICAgIHRocm93IG5ldyBFcnJvcignZW5kUmVhZGFibGUgY2FsbGVkIG9uIG5vbi1lbXB0eSBzdHJlYW0nKTtcblxuICBpZiAoIXN0YXRlLmVuZEVtaXR0ZWQpIHtcbiAgICBzdGF0ZS5lbmRlZCA9IHRydWU7XG4gICAgcHJvY2Vzcy5uZXh0VGljayhmdW5jdGlvbigpIHtcbiAgICAgIC8vIENoZWNrIHRoYXQgd2UgZGlkbid0IGdldCBvbmUgbGFzdCB1bnNoaWZ0LlxuICAgICAgaWYgKCFzdGF0ZS5lbmRFbWl0dGVkICYmIHN0YXRlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBzdGF0ZS5lbmRFbWl0dGVkID0gdHJ1ZTtcbiAgICAgICAgc3RyZWFtLnJlYWRhYmxlID0gZmFsc2U7XG4gICAgICAgIHN0cmVhbS5lbWl0KCdlbmQnKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBmb3JFYWNoICh4cywgZikge1xuICBmb3IgKHZhciBpID0gMCwgbCA9IHhzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIGYoeHNbaV0sIGkpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGluZGV4T2YgKHhzLCB4KSB7XG4gIGZvciAodmFyIGkgPSAwLCBsID0geHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgaWYgKHhzW2ldID09PSB4KSByZXR1cm4gaTtcbiAgfVxuICByZXR1cm4gLTE7XG59XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuXG4vLyBhIHRyYW5zZm9ybSBzdHJlYW0gaXMgYSByZWFkYWJsZS93cml0YWJsZSBzdHJlYW0gd2hlcmUgeW91IGRvXG4vLyBzb21ldGhpbmcgd2l0aCB0aGUgZGF0YS4gIFNvbWV0aW1lcyBpdCdzIGNhbGxlZCBhIFwiZmlsdGVyXCIsXG4vLyBidXQgdGhhdCdzIG5vdCBhIGdyZWF0IG5hbWUgZm9yIGl0LCBzaW5jZSB0aGF0IGltcGxpZXMgYSB0aGluZyB3aGVyZVxuLy8gc29tZSBiaXRzIHBhc3MgdGhyb3VnaCwgYW5kIG90aGVycyBhcmUgc2ltcGx5IGlnbm9yZWQuICAoVGhhdCB3b3VsZFxuLy8gYmUgYSB2YWxpZCBleGFtcGxlIG9mIGEgdHJhbnNmb3JtLCBvZiBjb3Vyc2UuKVxuLy9cbi8vIFdoaWxlIHRoZSBvdXRwdXQgaXMgY2F1c2FsbHkgcmVsYXRlZCB0byB0aGUgaW5wdXQsIGl0J3Mgbm90IGFcbi8vIG5lY2Vzc2FyaWx5IHN5bW1ldHJpYyBvciBzeW5jaHJvbm91cyB0cmFuc2Zvcm1hdGlvbi4gIEZvciBleGFtcGxlLFxuLy8gYSB6bGliIHN0cmVhbSBtaWdodCB0YWtlIG11bHRpcGxlIHBsYWluLXRleHQgd3JpdGVzKCksIGFuZCB0aGVuXG4vLyBlbWl0IGEgc2luZ2xlIGNvbXByZXNzZWQgY2h1bmsgc29tZSB0aW1lIGluIHRoZSBmdXR1cmUuXG4vL1xuLy8gSGVyZSdzIGhvdyB0aGlzIHdvcmtzOlxuLy9cbi8vIFRoZSBUcmFuc2Zvcm0gc3RyZWFtIGhhcyBhbGwgdGhlIGFzcGVjdHMgb2YgdGhlIHJlYWRhYmxlIGFuZCB3cml0YWJsZVxuLy8gc3RyZWFtIGNsYXNzZXMuICBXaGVuIHlvdSB3cml0ZShjaHVuayksIHRoYXQgY2FsbHMgX3dyaXRlKGNodW5rLGNiKVxuLy8gaW50ZXJuYWxseSwgYW5kIHJldHVybnMgZmFsc2UgaWYgdGhlcmUncyBhIGxvdCBvZiBwZW5kaW5nIHdyaXRlc1xuLy8gYnVmZmVyZWQgdXAuICBXaGVuIHlvdSBjYWxsIHJlYWQoKSwgdGhhdCBjYWxscyBfcmVhZChuKSB1bnRpbFxuLy8gdGhlcmUncyBlbm91Z2ggcGVuZGluZyByZWFkYWJsZSBkYXRhIGJ1ZmZlcmVkIHVwLlxuLy9cbi8vIEluIGEgdHJhbnNmb3JtIHN0cmVhbSwgdGhlIHdyaXR0ZW4gZGF0YSBpcyBwbGFjZWQgaW4gYSBidWZmZXIuICBXaGVuXG4vLyBfcmVhZChuKSBpcyBjYWxsZWQsIGl0IHRyYW5zZm9ybXMgdGhlIHF1ZXVlZCB1cCBkYXRhLCBjYWxsaW5nIHRoZVxuLy8gYnVmZmVyZWQgX3dyaXRlIGNiJ3MgYXMgaXQgY29uc3VtZXMgY2h1bmtzLiAgSWYgY29uc3VtaW5nIGEgc2luZ2xlXG4vLyB3cml0dGVuIGNodW5rIHdvdWxkIHJlc3VsdCBpbiBtdWx0aXBsZSBvdXRwdXQgY2h1bmtzLCB0aGVuIHRoZSBmaXJzdFxuLy8gb3V0cHV0dGVkIGJpdCBjYWxscyB0aGUgcmVhZGNiLCBhbmQgc3Vic2VxdWVudCBjaHVua3MganVzdCBnbyBpbnRvXG4vLyB0aGUgcmVhZCBidWZmZXIsIGFuZCB3aWxsIGNhdXNlIGl0IHRvIGVtaXQgJ3JlYWRhYmxlJyBpZiBuZWNlc3NhcnkuXG4vL1xuLy8gVGhpcyB3YXksIGJhY2stcHJlc3N1cmUgaXMgYWN0dWFsbHkgZGV0ZXJtaW5lZCBieSB0aGUgcmVhZGluZyBzaWRlLFxuLy8gc2luY2UgX3JlYWQgaGFzIHRvIGJlIGNhbGxlZCB0byBzdGFydCBwcm9jZXNzaW5nIGEgbmV3IGNodW5rLiAgSG93ZXZlcixcbi8vIGEgcGF0aG9sb2dpY2FsIGluZmxhdGUgdHlwZSBvZiB0cmFuc2Zvcm0gY2FuIGNhdXNlIGV4Y2Vzc2l2ZSBidWZmZXJpbmdcbi8vIGhlcmUuICBGb3IgZXhhbXBsZSwgaW1hZ2luZSBhIHN0cmVhbSB3aGVyZSBldmVyeSBieXRlIG9mIGlucHV0IGlzXG4vLyBpbnRlcnByZXRlZCBhcyBhbiBpbnRlZ2VyIGZyb20gMC0yNTUsIGFuZCB0aGVuIHJlc3VsdHMgaW4gdGhhdCBtYW55XG4vLyBieXRlcyBvZiBvdXRwdXQuICBXcml0aW5nIHRoZSA0IGJ5dGVzIHtmZixmZixmZixmZn0gd291bGQgcmVzdWx0IGluXG4vLyAxa2Igb2YgZGF0YSBiZWluZyBvdXRwdXQuICBJbiB0aGlzIGNhc2UsIHlvdSBjb3VsZCB3cml0ZSBhIHZlcnkgc21hbGxcbi8vIGFtb3VudCBvZiBpbnB1dCwgYW5kIGVuZCB1cCB3aXRoIGEgdmVyeSBsYXJnZSBhbW91bnQgb2Ygb3V0cHV0LiAgSW5cbi8vIHN1Y2ggYSBwYXRob2xvZ2ljYWwgaW5mbGF0aW5nIG1lY2hhbmlzbSwgdGhlcmUnZCBiZSBubyB3YXkgdG8gdGVsbFxuLy8gdGhlIHN5c3RlbSB0byBzdG9wIGRvaW5nIHRoZSB0cmFuc2Zvcm0uICBBIHNpbmdsZSA0TUIgd3JpdGUgY291bGRcbi8vIGNhdXNlIHRoZSBzeXN0ZW0gdG8gcnVuIG91dCBvZiBtZW1vcnkuXG4vL1xuLy8gSG93ZXZlciwgZXZlbiBpbiBzdWNoIGEgcGF0aG9sb2dpY2FsIGNhc2UsIG9ubHkgYSBzaW5nbGUgd3JpdHRlbiBjaHVua1xuLy8gd291bGQgYmUgY29uc3VtZWQsIGFuZCB0aGVuIHRoZSByZXN0IHdvdWxkIHdhaXQgKHVuLXRyYW5zZm9ybWVkKSB1bnRpbFxuLy8gdGhlIHJlc3VsdHMgb2YgdGhlIHByZXZpb3VzIHRyYW5zZm9ybWVkIGNodW5rIHdlcmUgY29uc3VtZWQuXG5cbm1vZHVsZS5leHBvcnRzID0gVHJhbnNmb3JtO1xuXG52YXIgRHVwbGV4ID0gcmVxdWlyZSgnLi9fc3RyZWFtX2R1cGxleCcpO1xuXG4vKjxyZXBsYWNlbWVudD4qL1xudmFyIHV0aWwgPSByZXF1aXJlKCdjb3JlLXV0aWwtaXMnKTtcbnV0aWwuaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpO1xuLyo8L3JlcGxhY2VtZW50PiovXG5cbnV0aWwuaW5oZXJpdHMoVHJhbnNmb3JtLCBEdXBsZXgpO1xuXG5cbmZ1bmN0aW9uIFRyYW5zZm9ybVN0YXRlKG9wdGlvbnMsIHN0cmVhbSkge1xuICB0aGlzLmFmdGVyVHJhbnNmb3JtID0gZnVuY3Rpb24oZXIsIGRhdGEpIHtcbiAgICByZXR1cm4gYWZ0ZXJUcmFuc2Zvcm0oc3RyZWFtLCBlciwgZGF0YSk7XG4gIH07XG5cbiAgdGhpcy5uZWVkVHJhbnNmb3JtID0gZmFsc2U7XG4gIHRoaXMudHJhbnNmb3JtaW5nID0gZmFsc2U7XG4gIHRoaXMud3JpdGVjYiA9IG51bGw7XG4gIHRoaXMud3JpdGVjaHVuayA9IG51bGw7XG59XG5cbmZ1bmN0aW9uIGFmdGVyVHJhbnNmb3JtKHN0cmVhbSwgZXIsIGRhdGEpIHtcbiAgdmFyIHRzID0gc3RyZWFtLl90cmFuc2Zvcm1TdGF0ZTtcbiAgdHMudHJhbnNmb3JtaW5nID0gZmFsc2U7XG5cbiAgdmFyIGNiID0gdHMud3JpdGVjYjtcblxuICBpZiAoIWNiKVxuICAgIHJldHVybiBzdHJlYW0uZW1pdCgnZXJyb3InLCBuZXcgRXJyb3IoJ25vIHdyaXRlY2IgaW4gVHJhbnNmb3JtIGNsYXNzJykpO1xuXG4gIHRzLndyaXRlY2h1bmsgPSBudWxsO1xuICB0cy53cml0ZWNiID0gbnVsbDtcblxuICBpZiAoIXV0aWwuaXNOdWxsT3JVbmRlZmluZWQoZGF0YSkpXG4gICAgc3RyZWFtLnB1c2goZGF0YSk7XG5cbiAgaWYgKGNiKVxuICAgIGNiKGVyKTtcblxuICB2YXIgcnMgPSBzdHJlYW0uX3JlYWRhYmxlU3RhdGU7XG4gIHJzLnJlYWRpbmcgPSBmYWxzZTtcbiAgaWYgKHJzLm5lZWRSZWFkYWJsZSB8fCBycy5sZW5ndGggPCBycy5oaWdoV2F0ZXJNYXJrKSB7XG4gICAgc3RyZWFtLl9yZWFkKHJzLmhpZ2hXYXRlck1hcmspO1xuICB9XG59XG5cblxuZnVuY3Rpb24gVHJhbnNmb3JtKG9wdGlvbnMpIHtcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFRyYW5zZm9ybSkpXG4gICAgcmV0dXJuIG5ldyBUcmFuc2Zvcm0ob3B0aW9ucyk7XG5cbiAgRHVwbGV4LmNhbGwodGhpcywgb3B0aW9ucyk7XG5cbiAgdGhpcy5fdHJhbnNmb3JtU3RhdGUgPSBuZXcgVHJhbnNmb3JtU3RhdGUob3B0aW9ucywgdGhpcyk7XG5cbiAgLy8gd2hlbiB0aGUgd3JpdGFibGUgc2lkZSBmaW5pc2hlcywgdGhlbiBmbHVzaCBvdXQgYW55dGhpbmcgcmVtYWluaW5nLlxuICB2YXIgc3RyZWFtID0gdGhpcztcblxuICAvLyBzdGFydCBvdXQgYXNraW5nIGZvciBhIHJlYWRhYmxlIGV2ZW50IG9uY2UgZGF0YSBpcyB0cmFuc2Zvcm1lZC5cbiAgdGhpcy5fcmVhZGFibGVTdGF0ZS5uZWVkUmVhZGFibGUgPSB0cnVlO1xuXG4gIC8vIHdlIGhhdmUgaW1wbGVtZW50ZWQgdGhlIF9yZWFkIG1ldGhvZCwgYW5kIGRvbmUgdGhlIG90aGVyIHRoaW5nc1xuICAvLyB0aGF0IFJlYWRhYmxlIHdhbnRzIGJlZm9yZSB0aGUgZmlyc3QgX3JlYWQgY2FsbCwgc28gdW5zZXQgdGhlXG4gIC8vIHN5bmMgZ3VhcmQgZmxhZy5cbiAgdGhpcy5fcmVhZGFibGVTdGF0ZS5zeW5jID0gZmFsc2U7XG5cbiAgdGhpcy5vbmNlKCdwcmVmaW5pc2gnLCBmdW5jdGlvbigpIHtcbiAgICBpZiAodXRpbC5pc0Z1bmN0aW9uKHRoaXMuX2ZsdXNoKSlcbiAgICAgIHRoaXMuX2ZsdXNoKGZ1bmN0aW9uKGVyKSB7XG4gICAgICAgIGRvbmUoc3RyZWFtLCBlcik7XG4gICAgICB9KTtcbiAgICBlbHNlXG4gICAgICBkb25lKHN0cmVhbSk7XG4gIH0pO1xufVxuXG5UcmFuc2Zvcm0ucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbihjaHVuaywgZW5jb2RpbmcpIHtcbiAgdGhpcy5fdHJhbnNmb3JtU3RhdGUubmVlZFRyYW5zZm9ybSA9IGZhbHNlO1xuICByZXR1cm4gRHVwbGV4LnByb3RvdHlwZS5wdXNoLmNhbGwodGhpcywgY2h1bmssIGVuY29kaW5nKTtcbn07XG5cbi8vIFRoaXMgaXMgdGhlIHBhcnQgd2hlcmUgeW91IGRvIHN0dWZmIVxuLy8gb3ZlcnJpZGUgdGhpcyBmdW5jdGlvbiBpbiBpbXBsZW1lbnRhdGlvbiBjbGFzc2VzLlxuLy8gJ2NodW5rJyBpcyBhbiBpbnB1dCBjaHVuay5cbi8vXG4vLyBDYWxsIGBwdXNoKG5ld0NodW5rKWAgdG8gcGFzcyBhbG9uZyB0cmFuc2Zvcm1lZCBvdXRwdXRcbi8vIHRvIHRoZSByZWFkYWJsZSBzaWRlLiAgWW91IG1heSBjYWxsICdwdXNoJyB6ZXJvIG9yIG1vcmUgdGltZXMuXG4vL1xuLy8gQ2FsbCBgY2IoZXJyKWAgd2hlbiB5b3UgYXJlIGRvbmUgd2l0aCB0aGlzIGNodW5rLiAgSWYgeW91IHBhc3Ncbi8vIGFuIGVycm9yLCB0aGVuIHRoYXQnbGwgcHV0IHRoZSBodXJ0IG9uIHRoZSB3aG9sZSBvcGVyYXRpb24uICBJZiB5b3Vcbi8vIG5ldmVyIGNhbGwgY2IoKSwgdGhlbiB5b3UnbGwgbmV2ZXIgZ2V0IGFub3RoZXIgY2h1bmsuXG5UcmFuc2Zvcm0ucHJvdG90eXBlLl90cmFuc2Zvcm0gPSBmdW5jdGlvbihjaHVuaywgZW5jb2RpbmcsIGNiKSB7XG4gIHRocm93IG5ldyBFcnJvcignbm90IGltcGxlbWVudGVkJyk7XG59O1xuXG5UcmFuc2Zvcm0ucHJvdG90eXBlLl93cml0ZSA9IGZ1bmN0aW9uKGNodW5rLCBlbmNvZGluZywgY2IpIHtcbiAgdmFyIHRzID0gdGhpcy5fdHJhbnNmb3JtU3RhdGU7XG4gIHRzLndyaXRlY2IgPSBjYjtcbiAgdHMud3JpdGVjaHVuayA9IGNodW5rO1xuICB0cy53cml0ZWVuY29kaW5nID0gZW5jb2Rpbmc7XG4gIGlmICghdHMudHJhbnNmb3JtaW5nKSB7XG4gICAgdmFyIHJzID0gdGhpcy5fcmVhZGFibGVTdGF0ZTtcbiAgICBpZiAodHMubmVlZFRyYW5zZm9ybSB8fFxuICAgICAgICBycy5uZWVkUmVhZGFibGUgfHxcbiAgICAgICAgcnMubGVuZ3RoIDwgcnMuaGlnaFdhdGVyTWFyaylcbiAgICAgIHRoaXMuX3JlYWQocnMuaGlnaFdhdGVyTWFyayk7XG4gIH1cbn07XG5cbi8vIERvZXNuJ3QgbWF0dGVyIHdoYXQgdGhlIGFyZ3MgYXJlIGhlcmUuXG4vLyBfdHJhbnNmb3JtIGRvZXMgYWxsIHRoZSB3b3JrLlxuLy8gVGhhdCB3ZSBnb3QgaGVyZSBtZWFucyB0aGF0IHRoZSByZWFkYWJsZSBzaWRlIHdhbnRzIG1vcmUgZGF0YS5cblRyYW5zZm9ybS5wcm90b3R5cGUuX3JlYWQgPSBmdW5jdGlvbihuKSB7XG4gIHZhciB0cyA9IHRoaXMuX3RyYW5zZm9ybVN0YXRlO1xuXG4gIGlmICghdXRpbC5pc051bGwodHMud3JpdGVjaHVuaykgJiYgdHMud3JpdGVjYiAmJiAhdHMudHJhbnNmb3JtaW5nKSB7XG4gICAgdHMudHJhbnNmb3JtaW5nID0gdHJ1ZTtcbiAgICB0aGlzLl90cmFuc2Zvcm0odHMud3JpdGVjaHVuaywgdHMud3JpdGVlbmNvZGluZywgdHMuYWZ0ZXJUcmFuc2Zvcm0pO1xuICB9IGVsc2Uge1xuICAgIC8vIG1hcmsgdGhhdCB3ZSBuZWVkIGEgdHJhbnNmb3JtLCBzbyB0aGF0IGFueSBkYXRhIHRoYXQgY29tZXMgaW5cbiAgICAvLyB3aWxsIGdldCBwcm9jZXNzZWQsIG5vdyB0aGF0IHdlJ3ZlIGFza2VkIGZvciBpdC5cbiAgICB0cy5uZWVkVHJhbnNmb3JtID0gdHJ1ZTtcbiAgfVxufTtcblxuXG5mdW5jdGlvbiBkb25lKHN0cmVhbSwgZXIpIHtcbiAgaWYgKGVyKVxuICAgIHJldHVybiBzdHJlYW0uZW1pdCgnZXJyb3InLCBlcik7XG5cbiAgLy8gaWYgdGhlcmUncyBub3RoaW5nIGluIHRoZSB3cml0ZSBidWZmZXIsIHRoZW4gdGhhdCBtZWFuc1xuICAvLyB0aGF0IG5vdGhpbmcgbW9yZSB3aWxsIGV2ZXIgYmUgcHJvdmlkZWRcbiAgdmFyIHdzID0gc3RyZWFtLl93cml0YWJsZVN0YXRlO1xuICB2YXIgdHMgPSBzdHJlYW0uX3RyYW5zZm9ybVN0YXRlO1xuXG4gIGlmICh3cy5sZW5ndGgpXG4gICAgdGhyb3cgbmV3IEVycm9yKCdjYWxsaW5nIHRyYW5zZm9ybSBkb25lIHdoZW4gd3MubGVuZ3RoICE9IDAnKTtcblxuICBpZiAodHMudHJhbnNmb3JtaW5nKVxuICAgIHRocm93IG5ldyBFcnJvcignY2FsbGluZyB0cmFuc2Zvcm0gZG9uZSB3aGVuIHN0aWxsIHRyYW5zZm9ybWluZycpO1xuXG4gIHJldHVybiBzdHJlYW0ucHVzaChudWxsKTtcbn1cbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4vLyBBIGJpdCBzaW1wbGVyIHRoYW4gcmVhZGFibGUgc3RyZWFtcy5cbi8vIEltcGxlbWVudCBhbiBhc3luYyAuX3dyaXRlKGNodW5rLCBjYiksIGFuZCBpdCdsbCBoYW5kbGUgYWxsXG4vLyB0aGUgZHJhaW4gZXZlbnQgZW1pc3Npb24gYW5kIGJ1ZmZlcmluZy5cblxubW9kdWxlLmV4cG9ydHMgPSBXcml0YWJsZTtcblxuLyo8cmVwbGFjZW1lbnQ+Ki9cbnZhciBCdWZmZXIgPSByZXF1aXJlKCdidWZmZXInKS5CdWZmZXI7XG4vKjwvcmVwbGFjZW1lbnQ+Ki9cblxuV3JpdGFibGUuV3JpdGFibGVTdGF0ZSA9IFdyaXRhYmxlU3RhdGU7XG5cblxuLyo8cmVwbGFjZW1lbnQ+Ki9cbnZhciB1dGlsID0gcmVxdWlyZSgnY29yZS11dGlsLWlzJyk7XG51dGlsLmluaGVyaXRzID0gcmVxdWlyZSgnaW5oZXJpdHMnKTtcbi8qPC9yZXBsYWNlbWVudD4qL1xuXG52YXIgU3RyZWFtID0gcmVxdWlyZSgnc3RyZWFtJyk7XG5cbnV0aWwuaW5oZXJpdHMoV3JpdGFibGUsIFN0cmVhbSk7XG5cbmZ1bmN0aW9uIFdyaXRlUmVxKGNodW5rLCBlbmNvZGluZywgY2IpIHtcbiAgdGhpcy5jaHVuayA9IGNodW5rO1xuICB0aGlzLmVuY29kaW5nID0gZW5jb2Rpbmc7XG4gIHRoaXMuY2FsbGJhY2sgPSBjYjtcbn1cblxuZnVuY3Rpb24gV3JpdGFibGVTdGF0ZShvcHRpb25zLCBzdHJlYW0pIHtcbiAgdmFyIER1cGxleCA9IHJlcXVpcmUoJy4vX3N0cmVhbV9kdXBsZXgnKTtcblxuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAvLyB0aGUgcG9pbnQgYXQgd2hpY2ggd3JpdGUoKSBzdGFydHMgcmV0dXJuaW5nIGZhbHNlXG4gIC8vIE5vdGU6IDAgaXMgYSB2YWxpZCB2YWx1ZSwgbWVhbnMgdGhhdCB3ZSBhbHdheXMgcmV0dXJuIGZhbHNlIGlmXG4gIC8vIHRoZSBlbnRpcmUgYnVmZmVyIGlzIG5vdCBmbHVzaGVkIGltbWVkaWF0ZWx5IG9uIHdyaXRlKClcbiAgdmFyIGh3bSA9IG9wdGlvbnMuaGlnaFdhdGVyTWFyaztcbiAgdmFyIGRlZmF1bHRId20gPSBvcHRpb25zLm9iamVjdE1vZGUgPyAxNiA6IDE2ICogMTAyNDtcbiAgdGhpcy5oaWdoV2F0ZXJNYXJrID0gKGh3bSB8fCBod20gPT09IDApID8gaHdtIDogZGVmYXVsdEh3bTtcblxuICAvLyBvYmplY3Qgc3RyZWFtIGZsYWcgdG8gaW5kaWNhdGUgd2hldGhlciBvciBub3QgdGhpcyBzdHJlYW1cbiAgLy8gY29udGFpbnMgYnVmZmVycyBvciBvYmplY3RzLlxuICB0aGlzLm9iamVjdE1vZGUgPSAhIW9wdGlvbnMub2JqZWN0TW9kZTtcblxuICBpZiAoc3RyZWFtIGluc3RhbmNlb2YgRHVwbGV4KVxuICAgIHRoaXMub2JqZWN0TW9kZSA9IHRoaXMub2JqZWN0TW9kZSB8fCAhIW9wdGlvbnMud3JpdGFibGVPYmplY3RNb2RlO1xuXG4gIC8vIGNhc3QgdG8gaW50cy5cbiAgdGhpcy5oaWdoV2F0ZXJNYXJrID0gfn50aGlzLmhpZ2hXYXRlck1hcms7XG5cbiAgdGhpcy5uZWVkRHJhaW4gPSBmYWxzZTtcbiAgLy8gYXQgdGhlIHN0YXJ0IG9mIGNhbGxpbmcgZW5kKClcbiAgdGhpcy5lbmRpbmcgPSBmYWxzZTtcbiAgLy8gd2hlbiBlbmQoKSBoYXMgYmVlbiBjYWxsZWQsIGFuZCByZXR1cm5lZFxuICB0aGlzLmVuZGVkID0gZmFsc2U7XG4gIC8vIHdoZW4gJ2ZpbmlzaCcgaXMgZW1pdHRlZFxuICB0aGlzLmZpbmlzaGVkID0gZmFsc2U7XG5cbiAgLy8gc2hvdWxkIHdlIGRlY29kZSBzdHJpbmdzIGludG8gYnVmZmVycyBiZWZvcmUgcGFzc2luZyB0byBfd3JpdGU/XG4gIC8vIHRoaXMgaXMgaGVyZSBzbyB0aGF0IHNvbWUgbm9kZS1jb3JlIHN0cmVhbXMgY2FuIG9wdGltaXplIHN0cmluZ1xuICAvLyBoYW5kbGluZyBhdCBhIGxvd2VyIGxldmVsLlxuICB2YXIgbm9EZWNvZGUgPSBvcHRpb25zLmRlY29kZVN0cmluZ3MgPT09IGZhbHNlO1xuICB0aGlzLmRlY29kZVN0cmluZ3MgPSAhbm9EZWNvZGU7XG5cbiAgLy8gQ3J5cHRvIGlzIGtpbmQgb2Ygb2xkIGFuZCBjcnVzdHkuICBIaXN0b3JpY2FsbHksIGl0cyBkZWZhdWx0IHN0cmluZ1xuICAvLyBlbmNvZGluZyBpcyAnYmluYXJ5JyBzbyB3ZSBoYXZlIHRvIG1ha2UgdGhpcyBjb25maWd1cmFibGUuXG4gIC8vIEV2ZXJ5dGhpbmcgZWxzZSBpbiB0aGUgdW5pdmVyc2UgdXNlcyAndXRmOCcsIHRob3VnaC5cbiAgdGhpcy5kZWZhdWx0RW5jb2RpbmcgPSBvcHRpb25zLmRlZmF1bHRFbmNvZGluZyB8fCAndXRmOCc7XG5cbiAgLy8gbm90IGFuIGFjdHVhbCBidWZmZXIgd2Uga2VlcCB0cmFjayBvZiwgYnV0IGEgbWVhc3VyZW1lbnRcbiAgLy8gb2YgaG93IG11Y2ggd2UncmUgd2FpdGluZyB0byBnZXQgcHVzaGVkIHRvIHNvbWUgdW5kZXJseWluZ1xuICAvLyBzb2NrZXQgb3IgZmlsZS5cbiAgdGhpcy5sZW5ndGggPSAwO1xuXG4gIC8vIGEgZmxhZyB0byBzZWUgd2hlbiB3ZSdyZSBpbiB0aGUgbWlkZGxlIG9mIGEgd3JpdGUuXG4gIHRoaXMud3JpdGluZyA9IGZhbHNlO1xuXG4gIC8vIHdoZW4gdHJ1ZSBhbGwgd3JpdGVzIHdpbGwgYmUgYnVmZmVyZWQgdW50aWwgLnVuY29yaygpIGNhbGxcbiAgdGhpcy5jb3JrZWQgPSAwO1xuXG4gIC8vIGEgZmxhZyB0byBiZSBhYmxlIHRvIHRlbGwgaWYgdGhlIG9ud3JpdGUgY2IgaXMgY2FsbGVkIGltbWVkaWF0ZWx5LFxuICAvLyBvciBvbiBhIGxhdGVyIHRpY2suICBXZSBzZXQgdGhpcyB0byB0cnVlIGF0IGZpcnN0LCBiZWNhdXNlIGFueVxuICAvLyBhY3Rpb25zIHRoYXQgc2hvdWxkbid0IGhhcHBlbiB1bnRpbCBcImxhdGVyXCIgc2hvdWxkIGdlbmVyYWxseSBhbHNvXG4gIC8vIG5vdCBoYXBwZW4gYmVmb3JlIHRoZSBmaXJzdCB3cml0ZSBjYWxsLlxuICB0aGlzLnN5bmMgPSB0cnVlO1xuXG4gIC8vIGEgZmxhZyB0byBrbm93IGlmIHdlJ3JlIHByb2Nlc3NpbmcgcHJldmlvdXNseSBidWZmZXJlZCBpdGVtcywgd2hpY2hcbiAgLy8gbWF5IGNhbGwgdGhlIF93cml0ZSgpIGNhbGxiYWNrIGluIHRoZSBzYW1lIHRpY2ssIHNvIHRoYXQgd2UgZG9uJ3RcbiAgLy8gZW5kIHVwIGluIGFuIG92ZXJsYXBwZWQgb253cml0ZSBzaXR1YXRpb24uXG4gIHRoaXMuYnVmZmVyUHJvY2Vzc2luZyA9IGZhbHNlO1xuXG4gIC8vIHRoZSBjYWxsYmFjayB0aGF0J3MgcGFzc2VkIHRvIF93cml0ZShjaHVuayxjYilcbiAgdGhpcy5vbndyaXRlID0gZnVuY3Rpb24oZXIpIHtcbiAgICBvbndyaXRlKHN0cmVhbSwgZXIpO1xuICB9O1xuXG4gIC8vIHRoZSBjYWxsYmFjayB0aGF0IHRoZSB1c2VyIHN1cHBsaWVzIHRvIHdyaXRlKGNodW5rLGVuY29kaW5nLGNiKVxuICB0aGlzLndyaXRlY2IgPSBudWxsO1xuXG4gIC8vIHRoZSBhbW91bnQgdGhhdCBpcyBiZWluZyB3cml0dGVuIHdoZW4gX3dyaXRlIGlzIGNhbGxlZC5cbiAgdGhpcy53cml0ZWxlbiA9IDA7XG5cbiAgdGhpcy5idWZmZXIgPSBbXTtcblxuICAvLyBudW1iZXIgb2YgcGVuZGluZyB1c2VyLXN1cHBsaWVkIHdyaXRlIGNhbGxiYWNrc1xuICAvLyB0aGlzIG11c3QgYmUgMCBiZWZvcmUgJ2ZpbmlzaCcgY2FuIGJlIGVtaXR0ZWRcbiAgdGhpcy5wZW5kaW5nY2IgPSAwO1xuXG4gIC8vIGVtaXQgcHJlZmluaXNoIGlmIHRoZSBvbmx5IHRoaW5nIHdlJ3JlIHdhaXRpbmcgZm9yIGlzIF93cml0ZSBjYnNcbiAgLy8gVGhpcyBpcyByZWxldmFudCBmb3Igc3luY2hyb25vdXMgVHJhbnNmb3JtIHN0cmVhbXNcbiAgdGhpcy5wcmVmaW5pc2hlZCA9IGZhbHNlO1xuXG4gIC8vIFRydWUgaWYgdGhlIGVycm9yIHdhcyBhbHJlYWR5IGVtaXR0ZWQgYW5kIHNob3VsZCBub3QgYmUgdGhyb3duIGFnYWluXG4gIHRoaXMuZXJyb3JFbWl0dGVkID0gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIFdyaXRhYmxlKG9wdGlvbnMpIHtcbiAgdmFyIER1cGxleCA9IHJlcXVpcmUoJy4vX3N0cmVhbV9kdXBsZXgnKTtcblxuICAvLyBXcml0YWJsZSBjdG9yIGlzIGFwcGxpZWQgdG8gRHVwbGV4ZXMsIHRob3VnaCB0aGV5J3JlIG5vdFxuICAvLyBpbnN0YW5jZW9mIFdyaXRhYmxlLCB0aGV5J3JlIGluc3RhbmNlb2YgUmVhZGFibGUuXG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBXcml0YWJsZSkgJiYgISh0aGlzIGluc3RhbmNlb2YgRHVwbGV4KSlcbiAgICByZXR1cm4gbmV3IFdyaXRhYmxlKG9wdGlvbnMpO1xuXG4gIHRoaXMuX3dyaXRhYmxlU3RhdGUgPSBuZXcgV3JpdGFibGVTdGF0ZShvcHRpb25zLCB0aGlzKTtcblxuICAvLyBsZWdhY3kuXG4gIHRoaXMud3JpdGFibGUgPSB0cnVlO1xuXG4gIFN0cmVhbS5jYWxsKHRoaXMpO1xufVxuXG4vLyBPdGhlcndpc2UgcGVvcGxlIGNhbiBwaXBlIFdyaXRhYmxlIHN0cmVhbXMsIHdoaWNoIGlzIGp1c3Qgd3JvbmcuXG5Xcml0YWJsZS5wcm90b3R5cGUucGlwZSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmVtaXQoJ2Vycm9yJywgbmV3IEVycm9yKCdDYW5ub3QgcGlwZS4gTm90IHJlYWRhYmxlLicpKTtcbn07XG5cblxuZnVuY3Rpb24gd3JpdGVBZnRlckVuZChzdHJlYW0sIHN0YXRlLCBjYikge1xuICB2YXIgZXIgPSBuZXcgRXJyb3IoJ3dyaXRlIGFmdGVyIGVuZCcpO1xuICAvLyBUT0RPOiBkZWZlciBlcnJvciBldmVudHMgY29uc2lzdGVudGx5IGV2ZXJ5d2hlcmUsIG5vdCBqdXN0IHRoZSBjYlxuICBzdHJlYW0uZW1pdCgnZXJyb3InLCBlcik7XG4gIHByb2Nlc3MubmV4dFRpY2soZnVuY3Rpb24oKSB7XG4gICAgY2IoZXIpO1xuICB9KTtcbn1cblxuLy8gSWYgd2UgZ2V0IHNvbWV0aGluZyB0aGF0IGlzIG5vdCBhIGJ1ZmZlciwgc3RyaW5nLCBudWxsLCBvciB1bmRlZmluZWQsXG4vLyBhbmQgd2UncmUgbm90IGluIG9iamVjdE1vZGUsIHRoZW4gdGhhdCdzIGFuIGVycm9yLlxuLy8gT3RoZXJ3aXNlIHN0cmVhbSBjaHVua3MgYXJlIGFsbCBjb25zaWRlcmVkIHRvIGJlIG9mIGxlbmd0aD0xLCBhbmQgdGhlXG4vLyB3YXRlcm1hcmtzIGRldGVybWluZSBob3cgbWFueSBvYmplY3RzIHRvIGtlZXAgaW4gdGhlIGJ1ZmZlciwgcmF0aGVyIHRoYW5cbi8vIGhvdyBtYW55IGJ5dGVzIG9yIGNoYXJhY3RlcnMuXG5mdW5jdGlvbiB2YWxpZENodW5rKHN0cmVhbSwgc3RhdGUsIGNodW5rLCBjYikge1xuICB2YXIgdmFsaWQgPSB0cnVlO1xuICBpZiAoIXV0aWwuaXNCdWZmZXIoY2h1bmspICYmXG4gICAgICAhdXRpbC5pc1N0cmluZyhjaHVuaykgJiZcbiAgICAgICF1dGlsLmlzTnVsbE9yVW5kZWZpbmVkKGNodW5rKSAmJlxuICAgICAgIXN0YXRlLm9iamVjdE1vZGUpIHtcbiAgICB2YXIgZXIgPSBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIG5vbi1zdHJpbmcvYnVmZmVyIGNodW5rJyk7XG4gICAgc3RyZWFtLmVtaXQoJ2Vycm9yJywgZXIpO1xuICAgIHByb2Nlc3MubmV4dFRpY2soZnVuY3Rpb24oKSB7XG4gICAgICBjYihlcik7XG4gICAgfSk7XG4gICAgdmFsaWQgPSBmYWxzZTtcbiAgfVxuICByZXR1cm4gdmFsaWQ7XG59XG5cbldyaXRhYmxlLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uKGNodW5rLCBlbmNvZGluZywgY2IpIHtcbiAgdmFyIHN0YXRlID0gdGhpcy5fd3JpdGFibGVTdGF0ZTtcbiAgdmFyIHJldCA9IGZhbHNlO1xuXG4gIGlmICh1dGlsLmlzRnVuY3Rpb24oZW5jb2RpbmcpKSB7XG4gICAgY2IgPSBlbmNvZGluZztcbiAgICBlbmNvZGluZyA9IG51bGw7XG4gIH1cblxuICBpZiAodXRpbC5pc0J1ZmZlcihjaHVuaykpXG4gICAgZW5jb2RpbmcgPSAnYnVmZmVyJztcbiAgZWxzZSBpZiAoIWVuY29kaW5nKVxuICAgIGVuY29kaW5nID0gc3RhdGUuZGVmYXVsdEVuY29kaW5nO1xuXG4gIGlmICghdXRpbC5pc0Z1bmN0aW9uKGNiKSlcbiAgICBjYiA9IGZ1bmN0aW9uKCkge307XG5cbiAgaWYgKHN0YXRlLmVuZGVkKVxuICAgIHdyaXRlQWZ0ZXJFbmQodGhpcywgc3RhdGUsIGNiKTtcbiAgZWxzZSBpZiAodmFsaWRDaHVuayh0aGlzLCBzdGF0ZSwgY2h1bmssIGNiKSkge1xuICAgIHN0YXRlLnBlbmRpbmdjYisrO1xuICAgIHJldCA9IHdyaXRlT3JCdWZmZXIodGhpcywgc3RhdGUsIGNodW5rLCBlbmNvZGluZywgY2IpO1xuICB9XG5cbiAgcmV0dXJuIHJldDtcbn07XG5cbldyaXRhYmxlLnByb3RvdHlwZS5jb3JrID0gZnVuY3Rpb24oKSB7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX3dyaXRhYmxlU3RhdGU7XG5cbiAgc3RhdGUuY29ya2VkKys7XG59O1xuXG5Xcml0YWJsZS5wcm90b3R5cGUudW5jb3JrID0gZnVuY3Rpb24oKSB7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX3dyaXRhYmxlU3RhdGU7XG5cbiAgaWYgKHN0YXRlLmNvcmtlZCkge1xuICAgIHN0YXRlLmNvcmtlZC0tO1xuXG4gICAgaWYgKCFzdGF0ZS53cml0aW5nICYmXG4gICAgICAgICFzdGF0ZS5jb3JrZWQgJiZcbiAgICAgICAgIXN0YXRlLmZpbmlzaGVkICYmXG4gICAgICAgICFzdGF0ZS5idWZmZXJQcm9jZXNzaW5nICYmXG4gICAgICAgIHN0YXRlLmJ1ZmZlci5sZW5ndGgpXG4gICAgICBjbGVhckJ1ZmZlcih0aGlzLCBzdGF0ZSk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGRlY29kZUNodW5rKHN0YXRlLCBjaHVuaywgZW5jb2RpbmcpIHtcbiAgaWYgKCFzdGF0ZS5vYmplY3RNb2RlICYmXG4gICAgICBzdGF0ZS5kZWNvZGVTdHJpbmdzICE9PSBmYWxzZSAmJlxuICAgICAgdXRpbC5pc1N0cmluZyhjaHVuaykpIHtcbiAgICBjaHVuayA9IG5ldyBCdWZmZXIoY2h1bmssIGVuY29kaW5nKTtcbiAgfVxuICByZXR1cm4gY2h1bms7XG59XG5cbi8vIGlmIHdlJ3JlIGFscmVhZHkgd3JpdGluZyBzb21ldGhpbmcsIHRoZW4ganVzdCBwdXQgdGhpc1xuLy8gaW4gdGhlIHF1ZXVlLCBhbmQgd2FpdCBvdXIgdHVybi4gIE90aGVyd2lzZSwgY2FsbCBfd3JpdGVcbi8vIElmIHdlIHJldHVybiBmYWxzZSwgdGhlbiB3ZSBuZWVkIGEgZHJhaW4gZXZlbnQsIHNvIHNldCB0aGF0IGZsYWcuXG5mdW5jdGlvbiB3cml0ZU9yQnVmZmVyKHN0cmVhbSwgc3RhdGUsIGNodW5rLCBlbmNvZGluZywgY2IpIHtcbiAgY2h1bmsgPSBkZWNvZGVDaHVuayhzdGF0ZSwgY2h1bmssIGVuY29kaW5nKTtcbiAgaWYgKHV0aWwuaXNCdWZmZXIoY2h1bmspKVxuICAgIGVuY29kaW5nID0gJ2J1ZmZlcic7XG4gIHZhciBsZW4gPSBzdGF0ZS5vYmplY3RNb2RlID8gMSA6IGNodW5rLmxlbmd0aDtcblxuICBzdGF0ZS5sZW5ndGggKz0gbGVuO1xuXG4gIHZhciByZXQgPSBzdGF0ZS5sZW5ndGggPCBzdGF0ZS5oaWdoV2F0ZXJNYXJrO1xuICAvLyB3ZSBtdXN0IGVuc3VyZSB0aGF0IHByZXZpb3VzIG5lZWREcmFpbiB3aWxsIG5vdCBiZSByZXNldCB0byBmYWxzZS5cbiAgaWYgKCFyZXQpXG4gICAgc3RhdGUubmVlZERyYWluID0gdHJ1ZTtcblxuICBpZiAoc3RhdGUud3JpdGluZyB8fCBzdGF0ZS5jb3JrZWQpXG4gICAgc3RhdGUuYnVmZmVyLnB1c2gobmV3IFdyaXRlUmVxKGNodW5rLCBlbmNvZGluZywgY2IpKTtcbiAgZWxzZVxuICAgIGRvV3JpdGUoc3RyZWFtLCBzdGF0ZSwgZmFsc2UsIGxlbiwgY2h1bmssIGVuY29kaW5nLCBjYik7XG5cbiAgcmV0dXJuIHJldDtcbn1cblxuZnVuY3Rpb24gZG9Xcml0ZShzdHJlYW0sIHN0YXRlLCB3cml0ZXYsIGxlbiwgY2h1bmssIGVuY29kaW5nLCBjYikge1xuICBzdGF0ZS53cml0ZWxlbiA9IGxlbjtcbiAgc3RhdGUud3JpdGVjYiA9IGNiO1xuICBzdGF0ZS53cml0aW5nID0gdHJ1ZTtcbiAgc3RhdGUuc3luYyA9IHRydWU7XG4gIGlmICh3cml0ZXYpXG4gICAgc3RyZWFtLl93cml0ZXYoY2h1bmssIHN0YXRlLm9ud3JpdGUpO1xuICBlbHNlXG4gICAgc3RyZWFtLl93cml0ZShjaHVuaywgZW5jb2RpbmcsIHN0YXRlLm9ud3JpdGUpO1xuICBzdGF0ZS5zeW5jID0gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIG9ud3JpdGVFcnJvcihzdHJlYW0sIHN0YXRlLCBzeW5jLCBlciwgY2IpIHtcbiAgaWYgKHN5bmMpXG4gICAgcHJvY2Vzcy5uZXh0VGljayhmdW5jdGlvbigpIHtcbiAgICAgIHN0YXRlLnBlbmRpbmdjYi0tO1xuICAgICAgY2IoZXIpO1xuICAgIH0pO1xuICBlbHNlIHtcbiAgICBzdGF0ZS5wZW5kaW5nY2ItLTtcbiAgICBjYihlcik7XG4gIH1cblxuICBzdHJlYW0uX3dyaXRhYmxlU3RhdGUuZXJyb3JFbWl0dGVkID0gdHJ1ZTtcbiAgc3RyZWFtLmVtaXQoJ2Vycm9yJywgZXIpO1xufVxuXG5mdW5jdGlvbiBvbndyaXRlU3RhdGVVcGRhdGUoc3RhdGUpIHtcbiAgc3RhdGUud3JpdGluZyA9IGZhbHNlO1xuICBzdGF0ZS53cml0ZWNiID0gbnVsbDtcbiAgc3RhdGUubGVuZ3RoIC09IHN0YXRlLndyaXRlbGVuO1xuICBzdGF0ZS53cml0ZWxlbiA9IDA7XG59XG5cbmZ1bmN0aW9uIG9ud3JpdGUoc3RyZWFtLCBlcikge1xuICB2YXIgc3RhdGUgPSBzdHJlYW0uX3dyaXRhYmxlU3RhdGU7XG4gIHZhciBzeW5jID0gc3RhdGUuc3luYztcbiAgdmFyIGNiID0gc3RhdGUud3JpdGVjYjtcblxuICBvbndyaXRlU3RhdGVVcGRhdGUoc3RhdGUpO1xuXG4gIGlmIChlcilcbiAgICBvbndyaXRlRXJyb3Ioc3RyZWFtLCBzdGF0ZSwgc3luYywgZXIsIGNiKTtcbiAgZWxzZSB7XG4gICAgLy8gQ2hlY2sgaWYgd2UncmUgYWN0dWFsbHkgcmVhZHkgdG8gZmluaXNoLCBidXQgZG9uJ3QgZW1pdCB5ZXRcbiAgICB2YXIgZmluaXNoZWQgPSBuZWVkRmluaXNoKHN0cmVhbSwgc3RhdGUpO1xuXG4gICAgaWYgKCFmaW5pc2hlZCAmJlxuICAgICAgICAhc3RhdGUuY29ya2VkICYmXG4gICAgICAgICFzdGF0ZS5idWZmZXJQcm9jZXNzaW5nICYmXG4gICAgICAgIHN0YXRlLmJ1ZmZlci5sZW5ndGgpIHtcbiAgICAgIGNsZWFyQnVmZmVyKHN0cmVhbSwgc3RhdGUpO1xuICAgIH1cblxuICAgIGlmIChzeW5jKSB7XG4gICAgICBwcm9jZXNzLm5leHRUaWNrKGZ1bmN0aW9uKCkge1xuICAgICAgICBhZnRlcldyaXRlKHN0cmVhbSwgc3RhdGUsIGZpbmlzaGVkLCBjYik7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgYWZ0ZXJXcml0ZShzdHJlYW0sIHN0YXRlLCBmaW5pc2hlZCwgY2IpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBhZnRlcldyaXRlKHN0cmVhbSwgc3RhdGUsIGZpbmlzaGVkLCBjYikge1xuICBpZiAoIWZpbmlzaGVkKVxuICAgIG9ud3JpdGVEcmFpbihzdHJlYW0sIHN0YXRlKTtcbiAgc3RhdGUucGVuZGluZ2NiLS07XG4gIGNiKCk7XG4gIGZpbmlzaE1heWJlKHN0cmVhbSwgc3RhdGUpO1xufVxuXG4vLyBNdXN0IGZvcmNlIGNhbGxiYWNrIHRvIGJlIGNhbGxlZCBvbiBuZXh0VGljaywgc28gdGhhdCB3ZSBkb24ndFxuLy8gZW1pdCAnZHJhaW4nIGJlZm9yZSB0aGUgd3JpdGUoKSBjb25zdW1lciBnZXRzIHRoZSAnZmFsc2UnIHJldHVyblxuLy8gdmFsdWUsIGFuZCBoYXMgYSBjaGFuY2UgdG8gYXR0YWNoIGEgJ2RyYWluJyBsaXN0ZW5lci5cbmZ1bmN0aW9uIG9ud3JpdGVEcmFpbihzdHJlYW0sIHN0YXRlKSB7XG4gIGlmIChzdGF0ZS5sZW5ndGggPT09IDAgJiYgc3RhdGUubmVlZERyYWluKSB7XG4gICAgc3RhdGUubmVlZERyYWluID0gZmFsc2U7XG4gICAgc3RyZWFtLmVtaXQoJ2RyYWluJyk7XG4gIH1cbn1cblxuXG4vLyBpZiB0aGVyZSdzIHNvbWV0aGluZyBpbiB0aGUgYnVmZmVyIHdhaXRpbmcsIHRoZW4gcHJvY2VzcyBpdFxuZnVuY3Rpb24gY2xlYXJCdWZmZXIoc3RyZWFtLCBzdGF0ZSkge1xuICBzdGF0ZS5idWZmZXJQcm9jZXNzaW5nID0gdHJ1ZTtcblxuICBpZiAoc3RyZWFtLl93cml0ZXYgJiYgc3RhdGUuYnVmZmVyLmxlbmd0aCA+IDEpIHtcbiAgICAvLyBGYXN0IGNhc2UsIHdyaXRlIGV2ZXJ5dGhpbmcgdXNpbmcgX3dyaXRldigpXG4gICAgdmFyIGNicyA9IFtdO1xuICAgIGZvciAodmFyIGMgPSAwOyBjIDwgc3RhdGUuYnVmZmVyLmxlbmd0aDsgYysrKVxuICAgICAgY2JzLnB1c2goc3RhdGUuYnVmZmVyW2NdLmNhbGxiYWNrKTtcblxuICAgIC8vIGNvdW50IHRoZSBvbmUgd2UgYXJlIGFkZGluZywgYXMgd2VsbC5cbiAgICAvLyBUT0RPKGlzYWFjcykgY2xlYW4gdGhpcyB1cFxuICAgIHN0YXRlLnBlbmRpbmdjYisrO1xuICAgIGRvV3JpdGUoc3RyZWFtLCBzdGF0ZSwgdHJ1ZSwgc3RhdGUubGVuZ3RoLCBzdGF0ZS5idWZmZXIsICcnLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2JzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHN0YXRlLnBlbmRpbmdjYi0tO1xuICAgICAgICBjYnNbaV0oZXJyKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIENsZWFyIGJ1ZmZlclxuICAgIHN0YXRlLmJ1ZmZlciA9IFtdO1xuICB9IGVsc2Uge1xuICAgIC8vIFNsb3cgY2FzZSwgd3JpdGUgY2h1bmtzIG9uZS1ieS1vbmVcbiAgICBmb3IgKHZhciBjID0gMDsgYyA8IHN0YXRlLmJ1ZmZlci5sZW5ndGg7IGMrKykge1xuICAgICAgdmFyIGVudHJ5ID0gc3RhdGUuYnVmZmVyW2NdO1xuICAgICAgdmFyIGNodW5rID0gZW50cnkuY2h1bms7XG4gICAgICB2YXIgZW5jb2RpbmcgPSBlbnRyeS5lbmNvZGluZztcbiAgICAgIHZhciBjYiA9IGVudHJ5LmNhbGxiYWNrO1xuICAgICAgdmFyIGxlbiA9IHN0YXRlLm9iamVjdE1vZGUgPyAxIDogY2h1bmsubGVuZ3RoO1xuXG4gICAgICBkb1dyaXRlKHN0cmVhbSwgc3RhdGUsIGZhbHNlLCBsZW4sIGNodW5rLCBlbmNvZGluZywgY2IpO1xuXG4gICAgICAvLyBpZiB3ZSBkaWRuJ3QgY2FsbCB0aGUgb253cml0ZSBpbW1lZGlhdGVseSwgdGhlblxuICAgICAgLy8gaXQgbWVhbnMgdGhhdCB3ZSBuZWVkIHRvIHdhaXQgdW50aWwgaXQgZG9lcy5cbiAgICAgIC8vIGFsc28sIHRoYXQgbWVhbnMgdGhhdCB0aGUgY2h1bmsgYW5kIGNiIGFyZSBjdXJyZW50bHlcbiAgICAgIC8vIGJlaW5nIHByb2Nlc3NlZCwgc28gbW92ZSB0aGUgYnVmZmVyIGNvdW50ZXIgcGFzdCB0aGVtLlxuICAgICAgaWYgKHN0YXRlLndyaXRpbmcpIHtcbiAgICAgICAgYysrO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoYyA8IHN0YXRlLmJ1ZmZlci5sZW5ndGgpXG4gICAgICBzdGF0ZS5idWZmZXIgPSBzdGF0ZS5idWZmZXIuc2xpY2UoYyk7XG4gICAgZWxzZVxuICAgICAgc3RhdGUuYnVmZmVyLmxlbmd0aCA9IDA7XG4gIH1cblxuICBzdGF0ZS5idWZmZXJQcm9jZXNzaW5nID0gZmFsc2U7XG59XG5cbldyaXRhYmxlLnByb3RvdHlwZS5fd3JpdGUgPSBmdW5jdGlvbihjaHVuaywgZW5jb2RpbmcsIGNiKSB7XG4gIGNiKG5ldyBFcnJvcignbm90IGltcGxlbWVudGVkJykpO1xuXG59O1xuXG5Xcml0YWJsZS5wcm90b3R5cGUuX3dyaXRldiA9IG51bGw7XG5cbldyaXRhYmxlLnByb3RvdHlwZS5lbmQgPSBmdW5jdGlvbihjaHVuaywgZW5jb2RpbmcsIGNiKSB7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX3dyaXRhYmxlU3RhdGU7XG5cbiAgaWYgKHV0aWwuaXNGdW5jdGlvbihjaHVuaykpIHtcbiAgICBjYiA9IGNodW5rO1xuICAgIGNodW5rID0gbnVsbDtcbiAgICBlbmNvZGluZyA9IG51bGw7XG4gIH0gZWxzZSBpZiAodXRpbC5pc0Z1bmN0aW9uKGVuY29kaW5nKSkge1xuICAgIGNiID0gZW5jb2Rpbmc7XG4gICAgZW5jb2RpbmcgPSBudWxsO1xuICB9XG5cbiAgaWYgKCF1dGlsLmlzTnVsbE9yVW5kZWZpbmVkKGNodW5rKSlcbiAgICB0aGlzLndyaXRlKGNodW5rLCBlbmNvZGluZyk7XG5cbiAgLy8gLmVuZCgpIGZ1bGx5IHVuY29ya3NcbiAgaWYgKHN0YXRlLmNvcmtlZCkge1xuICAgIHN0YXRlLmNvcmtlZCA9IDE7XG4gICAgdGhpcy51bmNvcmsoKTtcbiAgfVxuXG4gIC8vIGlnbm9yZSB1bm5lY2Vzc2FyeSBlbmQoKSBjYWxscy5cbiAgaWYgKCFzdGF0ZS5lbmRpbmcgJiYgIXN0YXRlLmZpbmlzaGVkKVxuICAgIGVuZFdyaXRhYmxlKHRoaXMsIHN0YXRlLCBjYik7XG59O1xuXG5cbmZ1bmN0aW9uIG5lZWRGaW5pc2goc3RyZWFtLCBzdGF0ZSkge1xuICByZXR1cm4gKHN0YXRlLmVuZGluZyAmJlxuICAgICAgICAgIHN0YXRlLmxlbmd0aCA9PT0gMCAmJlxuICAgICAgICAgICFzdGF0ZS5maW5pc2hlZCAmJlxuICAgICAgICAgICFzdGF0ZS53cml0aW5nKTtcbn1cblxuZnVuY3Rpb24gcHJlZmluaXNoKHN0cmVhbSwgc3RhdGUpIHtcbiAgaWYgKCFzdGF0ZS5wcmVmaW5pc2hlZCkge1xuICAgIHN0YXRlLnByZWZpbmlzaGVkID0gdHJ1ZTtcbiAgICBzdHJlYW0uZW1pdCgncHJlZmluaXNoJyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZmluaXNoTWF5YmUoc3RyZWFtLCBzdGF0ZSkge1xuICB2YXIgbmVlZCA9IG5lZWRGaW5pc2goc3RyZWFtLCBzdGF0ZSk7XG4gIGlmIChuZWVkKSB7XG4gICAgaWYgKHN0YXRlLnBlbmRpbmdjYiA9PT0gMCkge1xuICAgICAgcHJlZmluaXNoKHN0cmVhbSwgc3RhdGUpO1xuICAgICAgc3RhdGUuZmluaXNoZWQgPSB0cnVlO1xuICAgICAgc3RyZWFtLmVtaXQoJ2ZpbmlzaCcpO1xuICAgIH0gZWxzZVxuICAgICAgcHJlZmluaXNoKHN0cmVhbSwgc3RhdGUpO1xuICB9XG4gIHJldHVybiBuZWVkO1xufVxuXG5mdW5jdGlvbiBlbmRXcml0YWJsZShzdHJlYW0sIHN0YXRlLCBjYikge1xuICBzdGF0ZS5lbmRpbmcgPSB0cnVlO1xuICBmaW5pc2hNYXliZShzdHJlYW0sIHN0YXRlKTtcbiAgaWYgKGNiKSB7XG4gICAgaWYgKHN0YXRlLmZpbmlzaGVkKVxuICAgICAgcHJvY2Vzcy5uZXh0VGljayhjYik7XG4gICAgZWxzZVxuICAgICAgc3RyZWFtLm9uY2UoJ2ZpbmlzaCcsIGNiKTtcbiAgfVxuICBzdGF0ZS5lbmRlZCA9IHRydWU7XG59XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuLy8gTk9URTogVGhlc2UgdHlwZSBjaGVja2luZyBmdW5jdGlvbnMgaW50ZW50aW9uYWxseSBkb24ndCB1c2UgYGluc3RhbmNlb2ZgXG4vLyBiZWNhdXNlIGl0IGlzIGZyYWdpbGUgYW5kIGNhbiBiZSBlYXNpbHkgZmFrZWQgd2l0aCBgT2JqZWN0LmNyZWF0ZSgpYC5cbmZ1bmN0aW9uIGlzQXJyYXkoYXIpIHtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkoYXIpO1xufVxuZXhwb3J0cy5pc0FycmF5ID0gaXNBcnJheTtcblxuZnVuY3Rpb24gaXNCb29sZWFuKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Jvb2xlYW4nO1xufVxuZXhwb3J0cy5pc0Jvb2xlYW4gPSBpc0Jvb2xlYW47XG5cbmZ1bmN0aW9uIGlzTnVsbChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNOdWxsID0gaXNOdWxsO1xuXG5mdW5jdGlvbiBpc051bGxPclVuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PSBudWxsO1xufVxuZXhwb3J0cy5pc051bGxPclVuZGVmaW5lZCA9IGlzTnVsbE9yVW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInO1xufVxuZXhwb3J0cy5pc051bWJlciA9IGlzTnVtYmVyO1xuXG5mdW5jdGlvbiBpc1N0cmluZyhhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnO1xufVxuZXhwb3J0cy5pc1N0cmluZyA9IGlzU3RyaW5nO1xuXG5mdW5jdGlvbiBpc1N5bWJvbChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdzeW1ib2wnO1xufVxuZXhwb3J0cy5pc1N5bWJvbCA9IGlzU3ltYm9sO1xuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuZXhwb3J0cy5pc1VuZGVmaW5lZCA9IGlzVW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBpc1JlZ0V4cChyZSkge1xuICByZXR1cm4gaXNPYmplY3QocmUpICYmIG9iamVjdFRvU3RyaW5nKHJlKSA9PT0gJ1tvYmplY3QgUmVnRXhwXSc7XG59XG5leHBvcnRzLmlzUmVnRXhwID0gaXNSZWdFeHA7XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xufVxuZXhwb3J0cy5pc09iamVjdCA9IGlzT2JqZWN0O1xuXG5mdW5jdGlvbiBpc0RhdGUoZCkge1xuICByZXR1cm4gaXNPYmplY3QoZCkgJiYgb2JqZWN0VG9TdHJpbmcoZCkgPT09ICdbb2JqZWN0IERhdGVdJztcbn1cbmV4cG9ydHMuaXNEYXRlID0gaXNEYXRlO1xuXG5mdW5jdGlvbiBpc0Vycm9yKGUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KGUpICYmXG4gICAgICAob2JqZWN0VG9TdHJpbmcoZSkgPT09ICdbb2JqZWN0IEVycm9yXScgfHwgZSBpbnN0YW5jZW9mIEVycm9yKTtcbn1cbmV4cG9ydHMuaXNFcnJvciA9IGlzRXJyb3I7XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nO1xufVxuZXhwb3J0cy5pc0Z1bmN0aW9uID0gaXNGdW5jdGlvbjtcblxuZnVuY3Rpb24gaXNQcmltaXRpdmUoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IG51bGwgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdib29sZWFuJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ251bWJlcicgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnc3ltYm9sJyB8fCAgLy8gRVM2IHN5bWJvbFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3VuZGVmaW5lZCc7XG59XG5leHBvcnRzLmlzUHJpbWl0aXZlID0gaXNQcmltaXRpdmU7XG5cbmZ1bmN0aW9uIGlzQnVmZmVyKGFyZykge1xuICByZXR1cm4gQnVmZmVyLmlzQnVmZmVyKGFyZyk7XG59XG5leHBvcnRzLmlzQnVmZmVyID0gaXNCdWZmZXI7XG5cbmZ1bmN0aW9uIG9iamVjdFRvU3RyaW5nKG8pIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvKTtcbn0iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCIuL2xpYi9fc3RyZWFtX3Bhc3N0aHJvdWdoLmpzXCIpXG4iLCJleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2xpYi9fc3RyZWFtX3JlYWRhYmxlLmpzJyk7XG5leHBvcnRzLlN0cmVhbSA9IHJlcXVpcmUoJ3N0cmVhbScpO1xuZXhwb3J0cy5SZWFkYWJsZSA9IGV4cG9ydHM7XG5leHBvcnRzLldyaXRhYmxlID0gcmVxdWlyZSgnLi9saWIvX3N0cmVhbV93cml0YWJsZS5qcycpO1xuZXhwb3J0cy5EdXBsZXggPSByZXF1aXJlKCcuL2xpYi9fc3RyZWFtX2R1cGxleC5qcycpO1xuZXhwb3J0cy5UcmFuc2Zvcm0gPSByZXF1aXJlKCcuL2xpYi9fc3RyZWFtX3RyYW5zZm9ybS5qcycpO1xuZXhwb3J0cy5QYXNzVGhyb3VnaCA9IHJlcXVpcmUoJy4vbGliL19zdHJlYW1fcGFzc3Rocm91Z2guanMnKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIi4vbGliL19zdHJlYW1fdHJhbnNmb3JtLmpzXCIpXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCIuL2xpYi9fc3RyZWFtX3dyaXRhYmxlLmpzXCIpXG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxubW9kdWxlLmV4cG9ydHMgPSBTdHJlYW07XG5cbnZhciBFRSA9IHJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlcjtcbnZhciBpbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJyk7XG5cbmluaGVyaXRzKFN0cmVhbSwgRUUpO1xuU3RyZWFtLlJlYWRhYmxlID0gcmVxdWlyZSgncmVhZGFibGUtc3RyZWFtL3JlYWRhYmxlLmpzJyk7XG5TdHJlYW0uV3JpdGFibGUgPSByZXF1aXJlKCdyZWFkYWJsZS1zdHJlYW0vd3JpdGFibGUuanMnKTtcblN0cmVhbS5EdXBsZXggPSByZXF1aXJlKCdyZWFkYWJsZS1zdHJlYW0vZHVwbGV4LmpzJyk7XG5TdHJlYW0uVHJhbnNmb3JtID0gcmVxdWlyZSgncmVhZGFibGUtc3RyZWFtL3RyYW5zZm9ybS5qcycpO1xuU3RyZWFtLlBhc3NUaHJvdWdoID0gcmVxdWlyZSgncmVhZGFibGUtc3RyZWFtL3Bhc3N0aHJvdWdoLmpzJyk7XG5cbi8vIEJhY2t3YXJkcy1jb21wYXQgd2l0aCBub2RlIDAuNC54XG5TdHJlYW0uU3RyZWFtID0gU3RyZWFtO1xuXG5cblxuLy8gb2xkLXN0eWxlIHN0cmVhbXMuICBOb3RlIHRoYXQgdGhlIHBpcGUgbWV0aG9kICh0aGUgb25seSByZWxldmFudFxuLy8gcGFydCBvZiB0aGlzIGNsYXNzKSBpcyBvdmVycmlkZGVuIGluIHRoZSBSZWFkYWJsZSBjbGFzcy5cblxuZnVuY3Rpb24gU3RyZWFtKCkge1xuICBFRS5jYWxsKHRoaXMpO1xufVxuXG5TdHJlYW0ucHJvdG90eXBlLnBpcGUgPSBmdW5jdGlvbihkZXN0LCBvcHRpb25zKSB7XG4gIHZhciBzb3VyY2UgPSB0aGlzO1xuXG4gIGZ1bmN0aW9uIG9uZGF0YShjaHVuaykge1xuICAgIGlmIChkZXN0LndyaXRhYmxlKSB7XG4gICAgICBpZiAoZmFsc2UgPT09IGRlc3Qud3JpdGUoY2h1bmspICYmIHNvdXJjZS5wYXVzZSkge1xuICAgICAgICBzb3VyY2UucGF1c2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzb3VyY2Uub24oJ2RhdGEnLCBvbmRhdGEpO1xuXG4gIGZ1bmN0aW9uIG9uZHJhaW4oKSB7XG4gICAgaWYgKHNvdXJjZS5yZWFkYWJsZSAmJiBzb3VyY2UucmVzdW1lKSB7XG4gICAgICBzb3VyY2UucmVzdW1lKCk7XG4gICAgfVxuICB9XG5cbiAgZGVzdC5vbignZHJhaW4nLCBvbmRyYWluKTtcblxuICAvLyBJZiB0aGUgJ2VuZCcgb3B0aW9uIGlzIG5vdCBzdXBwbGllZCwgZGVzdC5lbmQoKSB3aWxsIGJlIGNhbGxlZCB3aGVuXG4gIC8vIHNvdXJjZSBnZXRzIHRoZSAnZW5kJyBvciAnY2xvc2UnIGV2ZW50cy4gIE9ubHkgZGVzdC5lbmQoKSBvbmNlLlxuICBpZiAoIWRlc3QuX2lzU3RkaW8gJiYgKCFvcHRpb25zIHx8IG9wdGlvbnMuZW5kICE9PSBmYWxzZSkpIHtcbiAgICBzb3VyY2Uub24oJ2VuZCcsIG9uZW5kKTtcbiAgICBzb3VyY2Uub24oJ2Nsb3NlJywgb25jbG9zZSk7XG4gIH1cblxuICB2YXIgZGlkT25FbmQgPSBmYWxzZTtcbiAgZnVuY3Rpb24gb25lbmQoKSB7XG4gICAgaWYgKGRpZE9uRW5kKSByZXR1cm47XG4gICAgZGlkT25FbmQgPSB0cnVlO1xuXG4gICAgZGVzdC5lbmQoKTtcbiAgfVxuXG5cbiAgZnVuY3Rpb24gb25jbG9zZSgpIHtcbiAgICBpZiAoZGlkT25FbmQpIHJldHVybjtcbiAgICBkaWRPbkVuZCA9IHRydWU7XG5cbiAgICBpZiAodHlwZW9mIGRlc3QuZGVzdHJveSA9PT0gJ2Z1bmN0aW9uJykgZGVzdC5kZXN0cm95KCk7XG4gIH1cblxuICAvLyBkb24ndCBsZWF2ZSBkYW5nbGluZyBwaXBlcyB3aGVuIHRoZXJlIGFyZSBlcnJvcnMuXG4gIGZ1bmN0aW9uIG9uZXJyb3IoZXIpIHtcbiAgICBjbGVhbnVwKCk7XG4gICAgaWYgKEVFLmxpc3RlbmVyQ291bnQodGhpcywgJ2Vycm9yJykgPT09IDApIHtcbiAgICAgIHRocm93IGVyOyAvLyBVbmhhbmRsZWQgc3RyZWFtIGVycm9yIGluIHBpcGUuXG4gICAgfVxuICB9XG5cbiAgc291cmNlLm9uKCdlcnJvcicsIG9uZXJyb3IpO1xuICBkZXN0Lm9uKCdlcnJvcicsIG9uZXJyb3IpO1xuXG4gIC8vIHJlbW92ZSBhbGwgdGhlIGV2ZW50IGxpc3RlbmVycyB0aGF0IHdlcmUgYWRkZWQuXG4gIGZ1bmN0aW9uIGNsZWFudXAoKSB7XG4gICAgc291cmNlLnJlbW92ZUxpc3RlbmVyKCdkYXRhJywgb25kYXRhKTtcbiAgICBkZXN0LnJlbW92ZUxpc3RlbmVyKCdkcmFpbicsIG9uZHJhaW4pO1xuXG4gICAgc291cmNlLnJlbW92ZUxpc3RlbmVyKCdlbmQnLCBvbmVuZCk7XG4gICAgc291cmNlLnJlbW92ZUxpc3RlbmVyKCdjbG9zZScsIG9uY2xvc2UpO1xuXG4gICAgc291cmNlLnJlbW92ZUxpc3RlbmVyKCdlcnJvcicsIG9uZXJyb3IpO1xuICAgIGRlc3QucmVtb3ZlTGlzdGVuZXIoJ2Vycm9yJywgb25lcnJvcik7XG5cbiAgICBzb3VyY2UucmVtb3ZlTGlzdGVuZXIoJ2VuZCcsIGNsZWFudXApO1xuICAgIHNvdXJjZS5yZW1vdmVMaXN0ZW5lcignY2xvc2UnLCBjbGVhbnVwKTtcblxuICAgIGRlc3QucmVtb3ZlTGlzdGVuZXIoJ2Nsb3NlJywgY2xlYW51cCk7XG4gIH1cblxuICBzb3VyY2Uub24oJ2VuZCcsIGNsZWFudXApO1xuICBzb3VyY2Uub24oJ2Nsb3NlJywgY2xlYW51cCk7XG5cbiAgZGVzdC5vbignY2xvc2UnLCBjbGVhbnVwKTtcblxuICBkZXN0LmVtaXQoJ3BpcGUnLCBzb3VyY2UpO1xuXG4gIC8vIEFsbG93IGZvciB1bml4LWxpa2UgdXNhZ2U6IEEucGlwZShCKS5waXBlKEMpXG4gIHJldHVybiBkZXN0O1xufTtcbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG52YXIgQnVmZmVyID0gcmVxdWlyZSgnYnVmZmVyJykuQnVmZmVyO1xuXG52YXIgaXNCdWZmZXJFbmNvZGluZyA9IEJ1ZmZlci5pc0VuY29kaW5nXG4gIHx8IGZ1bmN0aW9uKGVuY29kaW5nKSB7XG4gICAgICAgc3dpdGNoIChlbmNvZGluZyAmJiBlbmNvZGluZy50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICAgICBjYXNlICdoZXgnOiBjYXNlICd1dGY4JzogY2FzZSAndXRmLTgnOiBjYXNlICdhc2NpaSc6IGNhc2UgJ2JpbmFyeSc6IGNhc2UgJ2Jhc2U2NCc6IGNhc2UgJ3VjczInOiBjYXNlICd1Y3MtMic6IGNhc2UgJ3V0ZjE2bGUnOiBjYXNlICd1dGYtMTZsZSc6IGNhc2UgJ3Jhdyc6IHJldHVybiB0cnVlO1xuICAgICAgICAgZGVmYXVsdDogcmV0dXJuIGZhbHNlO1xuICAgICAgIH1cbiAgICAgfVxuXG5cbmZ1bmN0aW9uIGFzc2VydEVuY29kaW5nKGVuY29kaW5nKSB7XG4gIGlmIChlbmNvZGluZyAmJiAhaXNCdWZmZXJFbmNvZGluZyhlbmNvZGluZykpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gZW5jb2Rpbmc6ICcgKyBlbmNvZGluZyk7XG4gIH1cbn1cblxuLy8gU3RyaW5nRGVjb2RlciBwcm92aWRlcyBhbiBpbnRlcmZhY2UgZm9yIGVmZmljaWVudGx5IHNwbGl0dGluZyBhIHNlcmllcyBvZlxuLy8gYnVmZmVycyBpbnRvIGEgc2VyaWVzIG9mIEpTIHN0cmluZ3Mgd2l0aG91dCBicmVha2luZyBhcGFydCBtdWx0aS1ieXRlXG4vLyBjaGFyYWN0ZXJzLiBDRVNVLTggaXMgaGFuZGxlZCBhcyBwYXJ0IG9mIHRoZSBVVEYtOCBlbmNvZGluZy5cbi8vXG4vLyBAVE9ETyBIYW5kbGluZyBhbGwgZW5jb2RpbmdzIGluc2lkZSBhIHNpbmdsZSBvYmplY3QgbWFrZXMgaXQgdmVyeSBkaWZmaWN1bHRcbi8vIHRvIHJlYXNvbiBhYm91dCB0aGlzIGNvZGUsIHNvIGl0IHNob3VsZCBiZSBzcGxpdCB1cCBpbiB0aGUgZnV0dXJlLlxuLy8gQFRPRE8gVGhlcmUgc2hvdWxkIGJlIGEgdXRmOC1zdHJpY3QgZW5jb2RpbmcgdGhhdCByZWplY3RzIGludmFsaWQgVVRGLTggY29kZVxuLy8gcG9pbnRzIGFzIHVzZWQgYnkgQ0VTVS04LlxudmFyIFN0cmluZ0RlY29kZXIgPSBleHBvcnRzLlN0cmluZ0RlY29kZXIgPSBmdW5jdGlvbihlbmNvZGluZykge1xuICB0aGlzLmVuY29kaW5nID0gKGVuY29kaW5nIHx8ICd1dGY4JykudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9bLV9dLywgJycpO1xuICBhc3NlcnRFbmNvZGluZyhlbmNvZGluZyk7XG4gIHN3aXRjaCAodGhpcy5lbmNvZGluZykge1xuICAgIGNhc2UgJ3V0ZjgnOlxuICAgICAgLy8gQ0VTVS04IHJlcHJlc2VudHMgZWFjaCBvZiBTdXJyb2dhdGUgUGFpciBieSAzLWJ5dGVzXG4gICAgICB0aGlzLnN1cnJvZ2F0ZVNpemUgPSAzO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgICAvLyBVVEYtMTYgcmVwcmVzZW50cyBlYWNoIG9mIFN1cnJvZ2F0ZSBQYWlyIGJ5IDItYnl0ZXNcbiAgICAgIHRoaXMuc3Vycm9nYXRlU2l6ZSA9IDI7XG4gICAgICB0aGlzLmRldGVjdEluY29tcGxldGVDaGFyID0gdXRmMTZEZXRlY3RJbmNvbXBsZXRlQ2hhcjtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICAvLyBCYXNlLTY0IHN0b3JlcyAzIGJ5dGVzIGluIDQgY2hhcnMsIGFuZCBwYWRzIHRoZSByZW1haW5kZXIuXG4gICAgICB0aGlzLnN1cnJvZ2F0ZVNpemUgPSAzO1xuICAgICAgdGhpcy5kZXRlY3RJbmNvbXBsZXRlQ2hhciA9IGJhc2U2NERldGVjdEluY29tcGxldGVDaGFyO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRoaXMud3JpdGUgPSBwYXNzVGhyb3VnaFdyaXRlO1xuICAgICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gRW5vdWdoIHNwYWNlIHRvIHN0b3JlIGFsbCBieXRlcyBvZiBhIHNpbmdsZSBjaGFyYWN0ZXIuIFVURi04IG5lZWRzIDRcbiAgLy8gYnl0ZXMsIGJ1dCBDRVNVLTggbWF5IHJlcXVpcmUgdXAgdG8gNiAoMyBieXRlcyBwZXIgc3Vycm9nYXRlKS5cbiAgdGhpcy5jaGFyQnVmZmVyID0gbmV3IEJ1ZmZlcig2KTtcbiAgLy8gTnVtYmVyIG9mIGJ5dGVzIHJlY2VpdmVkIGZvciB0aGUgY3VycmVudCBpbmNvbXBsZXRlIG11bHRpLWJ5dGUgY2hhcmFjdGVyLlxuICB0aGlzLmNoYXJSZWNlaXZlZCA9IDA7XG4gIC8vIE51bWJlciBvZiBieXRlcyBleHBlY3RlZCBmb3IgdGhlIGN1cnJlbnQgaW5jb21wbGV0ZSBtdWx0aS1ieXRlIGNoYXJhY3Rlci5cbiAgdGhpcy5jaGFyTGVuZ3RoID0gMDtcbn07XG5cblxuLy8gd3JpdGUgZGVjb2RlcyB0aGUgZ2l2ZW4gYnVmZmVyIGFuZCByZXR1cm5zIGl0IGFzIEpTIHN0cmluZyB0aGF0IGlzXG4vLyBndWFyYW50ZWVkIHRvIG5vdCBjb250YWluIGFueSBwYXJ0aWFsIG11bHRpLWJ5dGUgY2hhcmFjdGVycy4gQW55IHBhcnRpYWxcbi8vIGNoYXJhY3RlciBmb3VuZCBhdCB0aGUgZW5kIG9mIHRoZSBidWZmZXIgaXMgYnVmZmVyZWQgdXAsIGFuZCB3aWxsIGJlXG4vLyByZXR1cm5lZCB3aGVuIGNhbGxpbmcgd3JpdGUgYWdhaW4gd2l0aCB0aGUgcmVtYWluaW5nIGJ5dGVzLlxuLy9cbi8vIE5vdGU6IENvbnZlcnRpbmcgYSBCdWZmZXIgY29udGFpbmluZyBhbiBvcnBoYW4gc3Vycm9nYXRlIHRvIGEgU3RyaW5nXG4vLyBjdXJyZW50bHkgd29ya3MsIGJ1dCBjb252ZXJ0aW5nIGEgU3RyaW5nIHRvIGEgQnVmZmVyICh2aWEgYG5ldyBCdWZmZXJgLCBvclxuLy8gQnVmZmVyI3dyaXRlKSB3aWxsIHJlcGxhY2UgaW5jb21wbGV0ZSBzdXJyb2dhdGVzIHdpdGggdGhlIHVuaWNvZGVcbi8vIHJlcGxhY2VtZW50IGNoYXJhY3Rlci4gU2VlIGh0dHBzOi8vY29kZXJldmlldy5jaHJvbWl1bS5vcmcvMTIxMTczMDA5LyAuXG5TdHJpbmdEZWNvZGVyLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uKGJ1ZmZlcikge1xuICB2YXIgY2hhclN0ciA9ICcnO1xuICAvLyBpZiBvdXIgbGFzdCB3cml0ZSBlbmRlZCB3aXRoIGFuIGluY29tcGxldGUgbXVsdGlieXRlIGNoYXJhY3RlclxuICB3aGlsZSAodGhpcy5jaGFyTGVuZ3RoKSB7XG4gICAgLy8gZGV0ZXJtaW5lIGhvdyBtYW55IHJlbWFpbmluZyBieXRlcyB0aGlzIGJ1ZmZlciBoYXMgdG8gb2ZmZXIgZm9yIHRoaXMgY2hhclxuICAgIHZhciBhdmFpbGFibGUgPSAoYnVmZmVyLmxlbmd0aCA+PSB0aGlzLmNoYXJMZW5ndGggLSB0aGlzLmNoYXJSZWNlaXZlZCkgP1xuICAgICAgICB0aGlzLmNoYXJMZW5ndGggLSB0aGlzLmNoYXJSZWNlaXZlZCA6XG4gICAgICAgIGJ1ZmZlci5sZW5ndGg7XG5cbiAgICAvLyBhZGQgdGhlIG5ldyBieXRlcyB0byB0aGUgY2hhciBidWZmZXJcbiAgICBidWZmZXIuY29weSh0aGlzLmNoYXJCdWZmZXIsIHRoaXMuY2hhclJlY2VpdmVkLCAwLCBhdmFpbGFibGUpO1xuICAgIHRoaXMuY2hhclJlY2VpdmVkICs9IGF2YWlsYWJsZTtcblxuICAgIGlmICh0aGlzLmNoYXJSZWNlaXZlZCA8IHRoaXMuY2hhckxlbmd0aCkge1xuICAgICAgLy8gc3RpbGwgbm90IGVub3VnaCBjaGFycyBpbiB0aGlzIGJ1ZmZlcj8gd2FpdCBmb3IgbW9yZSAuLi5cbiAgICAgIHJldHVybiAnJztcbiAgICB9XG5cbiAgICAvLyByZW1vdmUgYnl0ZXMgYmVsb25naW5nIHRvIHRoZSBjdXJyZW50IGNoYXJhY3RlciBmcm9tIHRoZSBidWZmZXJcbiAgICBidWZmZXIgPSBidWZmZXIuc2xpY2UoYXZhaWxhYmxlLCBidWZmZXIubGVuZ3RoKTtcblxuICAgIC8vIGdldCB0aGUgY2hhcmFjdGVyIHRoYXQgd2FzIHNwbGl0XG4gICAgY2hhclN0ciA9IHRoaXMuY2hhckJ1ZmZlci5zbGljZSgwLCB0aGlzLmNoYXJMZW5ndGgpLnRvU3RyaW5nKHRoaXMuZW5jb2RpbmcpO1xuXG4gICAgLy8gQ0VTVS04OiBsZWFkIHN1cnJvZ2F0ZSAoRDgwMC1EQkZGKSBpcyBhbHNvIHRoZSBpbmNvbXBsZXRlIGNoYXJhY3RlclxuICAgIHZhciBjaGFyQ29kZSA9IGNoYXJTdHIuY2hhckNvZGVBdChjaGFyU3RyLmxlbmd0aCAtIDEpO1xuICAgIGlmIChjaGFyQ29kZSA+PSAweEQ4MDAgJiYgY2hhckNvZGUgPD0gMHhEQkZGKSB7XG4gICAgICB0aGlzLmNoYXJMZW5ndGggKz0gdGhpcy5zdXJyb2dhdGVTaXplO1xuICAgICAgY2hhclN0ciA9ICcnO1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIHRoaXMuY2hhclJlY2VpdmVkID0gdGhpcy5jaGFyTGVuZ3RoID0gMDtcblxuICAgIC8vIGlmIHRoZXJlIGFyZSBubyBtb3JlIGJ5dGVzIGluIHRoaXMgYnVmZmVyLCBqdXN0IGVtaXQgb3VyIGNoYXJcbiAgICBpZiAoYnVmZmVyLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIGNoYXJTdHI7XG4gICAgfVxuICAgIGJyZWFrO1xuICB9XG5cbiAgLy8gZGV0ZXJtaW5lIGFuZCBzZXQgY2hhckxlbmd0aCAvIGNoYXJSZWNlaXZlZFxuICB0aGlzLmRldGVjdEluY29tcGxldGVDaGFyKGJ1ZmZlcik7XG5cbiAgdmFyIGVuZCA9IGJ1ZmZlci5sZW5ndGg7XG4gIGlmICh0aGlzLmNoYXJMZW5ndGgpIHtcbiAgICAvLyBidWZmZXIgdGhlIGluY29tcGxldGUgY2hhcmFjdGVyIGJ5dGVzIHdlIGdvdFxuICAgIGJ1ZmZlci5jb3B5KHRoaXMuY2hhckJ1ZmZlciwgMCwgYnVmZmVyLmxlbmd0aCAtIHRoaXMuY2hhclJlY2VpdmVkLCBlbmQpO1xuICAgIGVuZCAtPSB0aGlzLmNoYXJSZWNlaXZlZDtcbiAgfVxuXG4gIGNoYXJTdHIgKz0gYnVmZmVyLnRvU3RyaW5nKHRoaXMuZW5jb2RpbmcsIDAsIGVuZCk7XG5cbiAgdmFyIGVuZCA9IGNoYXJTdHIubGVuZ3RoIC0gMTtcbiAgdmFyIGNoYXJDb2RlID0gY2hhclN0ci5jaGFyQ29kZUF0KGVuZCk7XG4gIC8vIENFU1UtODogbGVhZCBzdXJyb2dhdGUgKEQ4MDAtREJGRikgaXMgYWxzbyB0aGUgaW5jb21wbGV0ZSBjaGFyYWN0ZXJcbiAgaWYgKGNoYXJDb2RlID49IDB4RDgwMCAmJiBjaGFyQ29kZSA8PSAweERCRkYpIHtcbiAgICB2YXIgc2l6ZSA9IHRoaXMuc3Vycm9nYXRlU2l6ZTtcbiAgICB0aGlzLmNoYXJMZW5ndGggKz0gc2l6ZTtcbiAgICB0aGlzLmNoYXJSZWNlaXZlZCArPSBzaXplO1xuICAgIHRoaXMuY2hhckJ1ZmZlci5jb3B5KHRoaXMuY2hhckJ1ZmZlciwgc2l6ZSwgMCwgc2l6ZSk7XG4gICAgYnVmZmVyLmNvcHkodGhpcy5jaGFyQnVmZmVyLCAwLCAwLCBzaXplKTtcbiAgICByZXR1cm4gY2hhclN0ci5zdWJzdHJpbmcoMCwgZW5kKTtcbiAgfVxuXG4gIC8vIG9yIGp1c3QgZW1pdCB0aGUgY2hhclN0clxuICByZXR1cm4gY2hhclN0cjtcbn07XG5cbi8vIGRldGVjdEluY29tcGxldGVDaGFyIGRldGVybWluZXMgaWYgdGhlcmUgaXMgYW4gaW5jb21wbGV0ZSBVVEYtOCBjaGFyYWN0ZXIgYXRcbi8vIHRoZSBlbmQgb2YgdGhlIGdpdmVuIGJ1ZmZlci4gSWYgc28sIGl0IHNldHMgdGhpcy5jaGFyTGVuZ3RoIHRvIHRoZSBieXRlXG4vLyBsZW5ndGggdGhhdCBjaGFyYWN0ZXIsIGFuZCBzZXRzIHRoaXMuY2hhclJlY2VpdmVkIHRvIHRoZSBudW1iZXIgb2YgYnl0ZXNcbi8vIHRoYXQgYXJlIGF2YWlsYWJsZSBmb3IgdGhpcyBjaGFyYWN0ZXIuXG5TdHJpbmdEZWNvZGVyLnByb3RvdHlwZS5kZXRlY3RJbmNvbXBsZXRlQ2hhciA9IGZ1bmN0aW9uKGJ1ZmZlcikge1xuICAvLyBkZXRlcm1pbmUgaG93IG1hbnkgYnl0ZXMgd2UgaGF2ZSB0byBjaGVjayBhdCB0aGUgZW5kIG9mIHRoaXMgYnVmZmVyXG4gIHZhciBpID0gKGJ1ZmZlci5sZW5ndGggPj0gMykgPyAzIDogYnVmZmVyLmxlbmd0aDtcblxuICAvLyBGaWd1cmUgb3V0IGlmIG9uZSBvZiB0aGUgbGFzdCBpIGJ5dGVzIG9mIG91ciBidWZmZXIgYW5ub3VuY2VzIGFuXG4gIC8vIGluY29tcGxldGUgY2hhci5cbiAgZm9yICg7IGkgPiAwOyBpLS0pIHtcbiAgICB2YXIgYyA9IGJ1ZmZlcltidWZmZXIubGVuZ3RoIC0gaV07XG5cbiAgICAvLyBTZWUgaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9VVEYtOCNEZXNjcmlwdGlvblxuXG4gICAgLy8gMTEwWFhYWFhcbiAgICBpZiAoaSA9PSAxICYmIGMgPj4gNSA9PSAweDA2KSB7XG4gICAgICB0aGlzLmNoYXJMZW5ndGggPSAyO1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgLy8gMTExMFhYWFhcbiAgICBpZiAoaSA8PSAyICYmIGMgPj4gNCA9PSAweDBFKSB7XG4gICAgICB0aGlzLmNoYXJMZW5ndGggPSAzO1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgLy8gMTExMTBYWFhcbiAgICBpZiAoaSA8PSAzICYmIGMgPj4gMyA9PSAweDFFKSB7XG4gICAgICB0aGlzLmNoYXJMZW5ndGggPSA0O1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHRoaXMuY2hhclJlY2VpdmVkID0gaTtcbn07XG5cblN0cmluZ0RlY29kZXIucHJvdG90eXBlLmVuZCA9IGZ1bmN0aW9uKGJ1ZmZlcikge1xuICB2YXIgcmVzID0gJyc7XG4gIGlmIChidWZmZXIgJiYgYnVmZmVyLmxlbmd0aClcbiAgICByZXMgPSB0aGlzLndyaXRlKGJ1ZmZlcik7XG5cbiAgaWYgKHRoaXMuY2hhclJlY2VpdmVkKSB7XG4gICAgdmFyIGNyID0gdGhpcy5jaGFyUmVjZWl2ZWQ7XG4gICAgdmFyIGJ1ZiA9IHRoaXMuY2hhckJ1ZmZlcjtcbiAgICB2YXIgZW5jID0gdGhpcy5lbmNvZGluZztcbiAgICByZXMgKz0gYnVmLnNsaWNlKDAsIGNyKS50b1N0cmluZyhlbmMpO1xuICB9XG5cbiAgcmV0dXJuIHJlcztcbn07XG5cbmZ1bmN0aW9uIHBhc3NUaHJvdWdoV3JpdGUoYnVmZmVyKSB7XG4gIHJldHVybiBidWZmZXIudG9TdHJpbmcodGhpcy5lbmNvZGluZyk7XG59XG5cbmZ1bmN0aW9uIHV0ZjE2RGV0ZWN0SW5jb21wbGV0ZUNoYXIoYnVmZmVyKSB7XG4gIHRoaXMuY2hhclJlY2VpdmVkID0gYnVmZmVyLmxlbmd0aCAlIDI7XG4gIHRoaXMuY2hhckxlbmd0aCA9IHRoaXMuY2hhclJlY2VpdmVkID8gMiA6IDA7XG59XG5cbmZ1bmN0aW9uIGJhc2U2NERldGVjdEluY29tcGxldGVDaGFyKGJ1ZmZlcikge1xuICB0aGlzLmNoYXJSZWNlaXZlZCA9IGJ1ZmZlci5sZW5ndGggJSAzO1xuICB0aGlzLmNoYXJMZW5ndGggPSB0aGlzLmNoYXJSZWNlaXZlZCA/IDMgOiAwO1xufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0J1ZmZlcihhcmcpIHtcbiAgcmV0dXJuIGFyZyAmJiB0eXBlb2YgYXJnID09PSAnb2JqZWN0J1xuICAgICYmIHR5cGVvZiBhcmcuY29weSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICYmIHR5cGVvZiBhcmcuZmlsbCA9PT0gJ2Z1bmN0aW9uJ1xuICAgICYmIHR5cGVvZiBhcmcucmVhZFVJbnQ4ID09PSAnZnVuY3Rpb24nO1xufSIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG52YXIgZm9ybWF0UmVnRXhwID0gLyVbc2RqJV0vZztcbmV4cG9ydHMuZm9ybWF0ID0gZnVuY3Rpb24oZikge1xuICBpZiAoIWlzU3RyaW5nKGYpKSB7XG4gICAgdmFyIG9iamVjdHMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgb2JqZWN0cy5wdXNoKGluc3BlY3QoYXJndW1lbnRzW2ldKSk7XG4gICAgfVxuICAgIHJldHVybiBvYmplY3RzLmpvaW4oJyAnKTtcbiAgfVxuXG4gIHZhciBpID0gMTtcbiAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gIHZhciBsZW4gPSBhcmdzLmxlbmd0aDtcbiAgdmFyIHN0ciA9IFN0cmluZyhmKS5yZXBsYWNlKGZvcm1hdFJlZ0V4cCwgZnVuY3Rpb24oeCkge1xuICAgIGlmICh4ID09PSAnJSUnKSByZXR1cm4gJyUnO1xuICAgIGlmIChpID49IGxlbikgcmV0dXJuIHg7XG4gICAgc3dpdGNoICh4KSB7XG4gICAgICBjYXNlICclcyc6IHJldHVybiBTdHJpbmcoYXJnc1tpKytdKTtcbiAgICAgIGNhc2UgJyVkJzogcmV0dXJuIE51bWJlcihhcmdzW2krK10pO1xuICAgICAgY2FzZSAnJWonOlxuICAgICAgICB0cnkge1xuICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShhcmdzW2krK10pO1xuICAgICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgICAgcmV0dXJuICdbQ2lyY3VsYXJdJztcbiAgICAgICAgfVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIHg7XG4gICAgfVxuICB9KTtcbiAgZm9yICh2YXIgeCA9IGFyZ3NbaV07IGkgPCBsZW47IHggPSBhcmdzWysraV0pIHtcbiAgICBpZiAoaXNOdWxsKHgpIHx8ICFpc09iamVjdCh4KSkge1xuICAgICAgc3RyICs9ICcgJyArIHg7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciArPSAnICcgKyBpbnNwZWN0KHgpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gc3RyO1xufTtcblxuXG4vLyBNYXJrIHRoYXQgYSBtZXRob2Qgc2hvdWxkIG5vdCBiZSB1c2VkLlxuLy8gUmV0dXJucyBhIG1vZGlmaWVkIGZ1bmN0aW9uIHdoaWNoIHdhcm5zIG9uY2UgYnkgZGVmYXVsdC5cbi8vIElmIC0tbm8tZGVwcmVjYXRpb24gaXMgc2V0LCB0aGVuIGl0IGlzIGEgbm8tb3AuXG5leHBvcnRzLmRlcHJlY2F0ZSA9IGZ1bmN0aW9uKGZuLCBtc2cpIHtcbiAgLy8gQWxsb3cgZm9yIGRlcHJlY2F0aW5nIHRoaW5ncyBpbiB0aGUgcHJvY2VzcyBvZiBzdGFydGluZyB1cC5cbiAgaWYgKGlzVW5kZWZpbmVkKGdsb2JhbC5wcm9jZXNzKSkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBleHBvcnRzLmRlcHJlY2F0ZShmbiwgbXNnKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH1cblxuICBpZiAocHJvY2Vzcy5ub0RlcHJlY2F0aW9uID09PSB0cnVlKSB7XG4gICAgcmV0dXJuIGZuO1xuICB9XG5cbiAgdmFyIHdhcm5lZCA9IGZhbHNlO1xuICBmdW5jdGlvbiBkZXByZWNhdGVkKCkge1xuICAgIGlmICghd2FybmVkKSB7XG4gICAgICBpZiAocHJvY2Vzcy50aHJvd0RlcHJlY2F0aW9uKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xuICAgICAgfSBlbHNlIGlmIChwcm9jZXNzLnRyYWNlRGVwcmVjYXRpb24pIHtcbiAgICAgICAgY29uc29sZS50cmFjZShtc2cpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihtc2cpO1xuICAgICAgfVxuICAgICAgd2FybmVkID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICByZXR1cm4gZGVwcmVjYXRlZDtcbn07XG5cblxudmFyIGRlYnVncyA9IHt9O1xudmFyIGRlYnVnRW52aXJvbjtcbmV4cG9ydHMuZGVidWdsb2cgPSBmdW5jdGlvbihzZXQpIHtcbiAgaWYgKGlzVW5kZWZpbmVkKGRlYnVnRW52aXJvbikpXG4gICAgZGVidWdFbnZpcm9uID0gcHJvY2Vzcy5lbnYuTk9ERV9ERUJVRyB8fCAnJztcbiAgc2V0ID0gc2V0LnRvVXBwZXJDYXNlKCk7XG4gIGlmICghZGVidWdzW3NldF0pIHtcbiAgICBpZiAobmV3IFJlZ0V4cCgnXFxcXGInICsgc2V0ICsgJ1xcXFxiJywgJ2knKS50ZXN0KGRlYnVnRW52aXJvbikpIHtcbiAgICAgIHZhciBwaWQgPSBwcm9jZXNzLnBpZDtcbiAgICAgIGRlYnVnc1tzZXRdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBtc2cgPSBleHBvcnRzLmZvcm1hdC5hcHBseShleHBvcnRzLCBhcmd1bWVudHMpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCclcyAlZDogJXMnLCBzZXQsIHBpZCwgbXNnKTtcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlYnVnc1tzZXRdID0gZnVuY3Rpb24oKSB7fTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGRlYnVnc1tzZXRdO1xufTtcblxuXG4vKipcbiAqIEVjaG9zIHRoZSB2YWx1ZSBvZiBhIHZhbHVlLiBUcnlzIHRvIHByaW50IHRoZSB2YWx1ZSBvdXRcbiAqIGluIHRoZSBiZXN0IHdheSBwb3NzaWJsZSBnaXZlbiB0aGUgZGlmZmVyZW50IHR5cGVzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogVGhlIG9iamVjdCB0byBwcmludCBvdXQuXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0cyBPcHRpb25hbCBvcHRpb25zIG9iamVjdCB0aGF0IGFsdGVycyB0aGUgb3V0cHV0LlxuICovXG4vKiBsZWdhY3k6IG9iaiwgc2hvd0hpZGRlbiwgZGVwdGgsIGNvbG9ycyovXG5mdW5jdGlvbiBpbnNwZWN0KG9iaiwgb3B0cykge1xuICAvLyBkZWZhdWx0IG9wdGlvbnNcbiAgdmFyIGN0eCA9IHtcbiAgICBzZWVuOiBbXSxcbiAgICBzdHlsaXplOiBzdHlsaXplTm9Db2xvclxuICB9O1xuICAvLyBsZWdhY3kuLi5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gMykgY3R4LmRlcHRoID0gYXJndW1lbnRzWzJdO1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSA0KSBjdHguY29sb3JzID0gYXJndW1lbnRzWzNdO1xuICBpZiAoaXNCb29sZWFuKG9wdHMpKSB7XG4gICAgLy8gbGVnYWN5Li4uXG4gICAgY3R4LnNob3dIaWRkZW4gPSBvcHRzO1xuICB9IGVsc2UgaWYgKG9wdHMpIHtcbiAgICAvLyBnb3QgYW4gXCJvcHRpb25zXCIgb2JqZWN0XG4gICAgZXhwb3J0cy5fZXh0ZW5kKGN0eCwgb3B0cyk7XG4gIH1cbiAgLy8gc2V0IGRlZmF1bHQgb3B0aW9uc1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LnNob3dIaWRkZW4pKSBjdHguc2hvd0hpZGRlbiA9IGZhbHNlO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmRlcHRoKSkgY3R4LmRlcHRoID0gMjtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5jb2xvcnMpKSBjdHguY29sb3JzID0gZmFsc2U7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguY3VzdG9tSW5zcGVjdCkpIGN0eC5jdXN0b21JbnNwZWN0ID0gdHJ1ZTtcbiAgaWYgKGN0eC5jb2xvcnMpIGN0eC5zdHlsaXplID0gc3R5bGl6ZVdpdGhDb2xvcjtcbiAgcmV0dXJuIGZvcm1hdFZhbHVlKGN0eCwgb2JqLCBjdHguZGVwdGgpO1xufVxuZXhwb3J0cy5pbnNwZWN0ID0gaW5zcGVjdDtcblxuXG4vLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0FOU0lfZXNjYXBlX2NvZGUjZ3JhcGhpY3Ncbmluc3BlY3QuY29sb3JzID0ge1xuICAnYm9sZCcgOiBbMSwgMjJdLFxuICAnaXRhbGljJyA6IFszLCAyM10sXG4gICd1bmRlcmxpbmUnIDogWzQsIDI0XSxcbiAgJ2ludmVyc2UnIDogWzcsIDI3XSxcbiAgJ3doaXRlJyA6IFszNywgMzldLFxuICAnZ3JleScgOiBbOTAsIDM5XSxcbiAgJ2JsYWNrJyA6IFszMCwgMzldLFxuICAnYmx1ZScgOiBbMzQsIDM5XSxcbiAgJ2N5YW4nIDogWzM2LCAzOV0sXG4gICdncmVlbicgOiBbMzIsIDM5XSxcbiAgJ21hZ2VudGEnIDogWzM1LCAzOV0sXG4gICdyZWQnIDogWzMxLCAzOV0sXG4gICd5ZWxsb3cnIDogWzMzLCAzOV1cbn07XG5cbi8vIERvbid0IHVzZSAnYmx1ZScgbm90IHZpc2libGUgb24gY21kLmV4ZVxuaW5zcGVjdC5zdHlsZXMgPSB7XG4gICdzcGVjaWFsJzogJ2N5YW4nLFxuICAnbnVtYmVyJzogJ3llbGxvdycsXG4gICdib29sZWFuJzogJ3llbGxvdycsXG4gICd1bmRlZmluZWQnOiAnZ3JleScsXG4gICdudWxsJzogJ2JvbGQnLFxuICAnc3RyaW5nJzogJ2dyZWVuJyxcbiAgJ2RhdGUnOiAnbWFnZW50YScsXG4gIC8vIFwibmFtZVwiOiBpbnRlbnRpb25hbGx5IG5vdCBzdHlsaW5nXG4gICdyZWdleHAnOiAncmVkJ1xufTtcblxuXG5mdW5jdGlvbiBzdHlsaXplV2l0aENvbG9yKHN0ciwgc3R5bGVUeXBlKSB7XG4gIHZhciBzdHlsZSA9IGluc3BlY3Quc3R5bGVzW3N0eWxlVHlwZV07XG5cbiAgaWYgKHN0eWxlKSB7XG4gICAgcmV0dXJuICdcXHUwMDFiWycgKyBpbnNwZWN0LmNvbG9yc1tzdHlsZV1bMF0gKyAnbScgKyBzdHIgK1xuICAgICAgICAgICAnXFx1MDAxYlsnICsgaW5zcGVjdC5jb2xvcnNbc3R5bGVdWzFdICsgJ20nO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBzdHI7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBzdHlsaXplTm9Db2xvcihzdHIsIHN0eWxlVHlwZSkge1xuICByZXR1cm4gc3RyO1xufVxuXG5cbmZ1bmN0aW9uIGFycmF5VG9IYXNoKGFycmF5KSB7XG4gIHZhciBoYXNoID0ge307XG5cbiAgYXJyYXkuZm9yRWFjaChmdW5jdGlvbih2YWwsIGlkeCkge1xuICAgIGhhc2hbdmFsXSA9IHRydWU7XG4gIH0pO1xuXG4gIHJldHVybiBoYXNoO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFZhbHVlKGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcykge1xuICAvLyBQcm92aWRlIGEgaG9vayBmb3IgdXNlci1zcGVjaWZpZWQgaW5zcGVjdCBmdW5jdGlvbnMuXG4gIC8vIENoZWNrIHRoYXQgdmFsdWUgaXMgYW4gb2JqZWN0IHdpdGggYW4gaW5zcGVjdCBmdW5jdGlvbiBvbiBpdFxuICBpZiAoY3R4LmN1c3RvbUluc3BlY3QgJiZcbiAgICAgIHZhbHVlICYmXG4gICAgICBpc0Z1bmN0aW9uKHZhbHVlLmluc3BlY3QpICYmXG4gICAgICAvLyBGaWx0ZXIgb3V0IHRoZSB1dGlsIG1vZHVsZSwgaXQncyBpbnNwZWN0IGZ1bmN0aW9uIGlzIHNwZWNpYWxcbiAgICAgIHZhbHVlLmluc3BlY3QgIT09IGV4cG9ydHMuaW5zcGVjdCAmJlxuICAgICAgLy8gQWxzbyBmaWx0ZXIgb3V0IGFueSBwcm90b3R5cGUgb2JqZWN0cyB1c2luZyB0aGUgY2lyY3VsYXIgY2hlY2suXG4gICAgICAhKHZhbHVlLmNvbnN0cnVjdG9yICYmIHZhbHVlLmNvbnN0cnVjdG9yLnByb3RvdHlwZSA9PT0gdmFsdWUpKSB7XG4gICAgdmFyIHJldCA9IHZhbHVlLmluc3BlY3QocmVjdXJzZVRpbWVzLCBjdHgpO1xuICAgIGlmICghaXNTdHJpbmcocmV0KSkge1xuICAgICAgcmV0ID0gZm9ybWF0VmFsdWUoY3R4LCByZXQsIHJlY3Vyc2VUaW1lcyk7XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICAvLyBQcmltaXRpdmUgdHlwZXMgY2Fubm90IGhhdmUgcHJvcGVydGllc1xuICB2YXIgcHJpbWl0aXZlID0gZm9ybWF0UHJpbWl0aXZlKGN0eCwgdmFsdWUpO1xuICBpZiAocHJpbWl0aXZlKSB7XG4gICAgcmV0dXJuIHByaW1pdGl2ZTtcbiAgfVxuXG4gIC8vIExvb2sgdXAgdGhlIGtleXMgb2YgdGhlIG9iamVjdC5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh2YWx1ZSk7XG4gIHZhciB2aXNpYmxlS2V5cyA9IGFycmF5VG9IYXNoKGtleXMpO1xuXG4gIGlmIChjdHguc2hvd0hpZGRlbikge1xuICAgIGtleXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh2YWx1ZSk7XG4gIH1cblxuICAvLyBJRSBkb2Vzbid0IG1ha2UgZXJyb3IgZmllbGRzIG5vbi1lbnVtZXJhYmxlXG4gIC8vIGh0dHA6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS9pZS9kd3c1MnNidCh2PXZzLjk0KS5hc3B4XG4gIGlmIChpc0Vycm9yKHZhbHVlKVxuICAgICAgJiYgKGtleXMuaW5kZXhPZignbWVzc2FnZScpID49IDAgfHwga2V5cy5pbmRleE9mKCdkZXNjcmlwdGlvbicpID49IDApKSB7XG4gICAgcmV0dXJuIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgfVxuXG4gIC8vIFNvbWUgdHlwZSBvZiBvYmplY3Qgd2l0aG91dCBwcm9wZXJ0aWVzIGNhbiBiZSBzaG9ydGN1dHRlZC5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgICB2YXIgbmFtZSA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKCdbRnVuY3Rpb24nICsgbmFtZSArICddJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdyZWdleHAnKTtcbiAgICB9XG4gICAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShEYXRlLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ2RhdGUnKTtcbiAgICB9XG4gICAgaWYgKGlzRXJyb3IodmFsdWUpKSB7XG4gICAgICByZXR1cm4gZm9ybWF0RXJyb3IodmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBiYXNlID0gJycsIGFycmF5ID0gZmFsc2UsIGJyYWNlcyA9IFsneycsICd9J107XG5cbiAgLy8gTWFrZSBBcnJheSBzYXkgdGhhdCB0aGV5IGFyZSBBcnJheVxuICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICBhcnJheSA9IHRydWU7XG4gICAgYnJhY2VzID0gWydbJywgJ10nXTtcbiAgfVxuXG4gIC8vIE1ha2UgZnVuY3Rpb25zIHNheSB0aGF0IHRoZXkgYXJlIGZ1bmN0aW9uc1xuICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICB2YXIgbiA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgIGJhc2UgPSAnIFtGdW5jdGlvbicgKyBuICsgJ10nO1xuICB9XG5cbiAgLy8gTWFrZSBSZWdFeHBzIHNheSB0aGF0IHRoZXkgYXJlIFJlZ0V4cHNcbiAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBkYXRlcyB3aXRoIHByb3BlcnRpZXMgZmlyc3Qgc2F5IHRoZSBkYXRlXG4gIGlmIChpc0RhdGUodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIERhdGUucHJvdG90eXBlLnRvVVRDU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBlcnJvciB3aXRoIG1lc3NhZ2UgZmlyc3Qgc2F5IHRoZSBlcnJvclxuICBpZiAoaXNFcnJvcih2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgZm9ybWF0RXJyb3IodmFsdWUpO1xuICB9XG5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwICYmICghYXJyYXkgfHwgdmFsdWUubGVuZ3RoID09IDApKSB7XG4gICAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyBicmFjZXNbMV07XG4gIH1cblxuICBpZiAocmVjdXJzZVRpbWVzIDwgMCkge1xuICAgIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAncmVnZXhwJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZSgnW09iamVjdF0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuXG4gIGN0eC5zZWVuLnB1c2godmFsdWUpO1xuXG4gIHZhciBvdXRwdXQ7XG4gIGlmIChhcnJheSkge1xuICAgIG91dHB1dCA9IGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpO1xuICB9IGVsc2Uge1xuICAgIG91dHB1dCA9IGtleXMubWFwKGZ1bmN0aW9uKGtleSkge1xuICAgICAgcmV0dXJuIGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleSwgYXJyYXkpO1xuICAgIH0pO1xuICB9XG5cbiAgY3R4LnNlZW4ucG9wKCk7XG5cbiAgcmV0dXJuIHJlZHVjZVRvU2luZ2xlU3RyaW5nKG91dHB1dCwgYmFzZSwgYnJhY2VzKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRQcmltaXRpdmUoY3R4LCB2YWx1ZSkge1xuICBpZiAoaXNVbmRlZmluZWQodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgndW5kZWZpbmVkJywgJ3VuZGVmaW5lZCcpO1xuICBpZiAoaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgdmFyIHNpbXBsZSA9ICdcXCcnICsgSlNPTi5zdHJpbmdpZnkodmFsdWUpLnJlcGxhY2UoL15cInxcIiQvZywgJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFwiL2csICdcIicpICsgJ1xcJyc7XG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKHNpbXBsZSwgJ3N0cmluZycpO1xuICB9XG4gIGlmIChpc051bWJlcih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdudW1iZXInKTtcbiAgaWYgKGlzQm9vbGVhbih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdib29sZWFuJyk7XG4gIC8vIEZvciBzb21lIHJlYXNvbiB0eXBlb2YgbnVsbCBpcyBcIm9iamVjdFwiLCBzbyBzcGVjaWFsIGNhc2UgaGVyZS5cbiAgaWYgKGlzTnVsbCh2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCdudWxsJywgJ251bGwnKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRFcnJvcih2YWx1ZSkge1xuICByZXR1cm4gJ1snICsgRXJyb3IucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpICsgJ10nO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpIHtcbiAgdmFyIG91dHB1dCA9IFtdO1xuICBmb3IgKHZhciBpID0gMCwgbCA9IHZhbHVlLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuICAgIGlmIChoYXNPd25Qcm9wZXJ0eSh2YWx1ZSwgU3RyaW5nKGkpKSkge1xuICAgICAgb3V0cHV0LnB1c2goZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cyxcbiAgICAgICAgICBTdHJpbmcoaSksIHRydWUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0cHV0LnB1c2goJycpO1xuICAgIH1cbiAgfVxuICBrZXlzLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYgKCFrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICBvdXRwdXQucHVzaChmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLFxuICAgICAgICAgIGtleSwgdHJ1ZSkpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBvdXRwdXQ7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5LCBhcnJheSkge1xuICB2YXIgbmFtZSwgc3RyLCBkZXNjO1xuICBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih2YWx1ZSwga2V5KSB8fCB7IHZhbHVlOiB2YWx1ZVtrZXldIH07XG4gIGlmIChkZXNjLmdldCkge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tHZXR0ZXIvU2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbR2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tTZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cbiAgaWYgKCFoYXNPd25Qcm9wZXJ0eSh2aXNpYmxlS2V5cywga2V5KSkge1xuICAgIG5hbWUgPSAnWycgKyBrZXkgKyAnXSc7XG4gIH1cbiAgaWYgKCFzdHIpIHtcbiAgICBpZiAoY3R4LnNlZW4uaW5kZXhPZihkZXNjLnZhbHVlKSA8IDApIHtcbiAgICAgIGlmIChpc051bGwocmVjdXJzZVRpbWVzKSkge1xuICAgICAgICBzdHIgPSBmb3JtYXRWYWx1ZShjdHgsIGRlc2MudmFsdWUsIG51bGwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RyID0gZm9ybWF0VmFsdWUoY3R4LCBkZXNjLnZhbHVlLCByZWN1cnNlVGltZXMgLSAxKTtcbiAgICAgIH1cbiAgICAgIGlmIChzdHIuaW5kZXhPZignXFxuJykgPiAtMSkge1xuICAgICAgICBpZiAoYXJyYXkpIHtcbiAgICAgICAgICBzdHIgPSBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyAgJyArIGxpbmU7XG4gICAgICAgICAgfSkuam9pbignXFxuJykuc3Vic3RyKDIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0ciA9ICdcXG4nICsgc3RyLnNwbGl0KCdcXG4nKS5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgcmV0dXJuICcgICAnICsgbGluZTtcbiAgICAgICAgICB9KS5qb2luKCdcXG4nKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0NpcmN1bGFyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG4gIGlmIChpc1VuZGVmaW5lZChuYW1lKSkge1xuICAgIGlmIChhcnJheSAmJiBrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICByZXR1cm4gc3RyO1xuICAgIH1cbiAgICBuYW1lID0gSlNPTi5zdHJpbmdpZnkoJycgKyBrZXkpO1xuICAgIGlmIChuYW1lLm1hdGNoKC9eXCIoW2EtekEtWl9dW2EtekEtWl8wLTldKilcIiQvKSkge1xuICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyKDEsIG5hbWUubGVuZ3RoIC0gMik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ25hbWUnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmFtZSA9IG5hbWUucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJylcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLyheXCJ8XCIkKS9nLCBcIidcIik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ3N0cmluZycpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuYW1lICsgJzogJyArIHN0cjtcbn1cblxuXG5mdW5jdGlvbiByZWR1Y2VUb1NpbmdsZVN0cmluZyhvdXRwdXQsIGJhc2UsIGJyYWNlcykge1xuICB2YXIgbnVtTGluZXNFc3QgPSAwO1xuICB2YXIgbGVuZ3RoID0gb3V0cHV0LnJlZHVjZShmdW5jdGlvbihwcmV2LCBjdXIpIHtcbiAgICBudW1MaW5lc0VzdCsrO1xuICAgIGlmIChjdXIuaW5kZXhPZignXFxuJykgPj0gMCkgbnVtTGluZXNFc3QrKztcbiAgICByZXR1cm4gcHJldiArIGN1ci5yZXBsYWNlKC9cXHUwMDFiXFxbXFxkXFxkP20vZywgJycpLmxlbmd0aCArIDE7XG4gIH0sIDApO1xuXG4gIGlmIChsZW5ndGggPiA2MCkge1xuICAgIHJldHVybiBicmFjZXNbMF0gK1xuICAgICAgICAgICAoYmFzZSA9PT0gJycgPyAnJyA6IGJhc2UgKyAnXFxuICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgb3V0cHV0LmpvaW4oJyxcXG4gICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgYnJhY2VzWzFdO1xuICB9XG5cbiAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyAnICcgKyBvdXRwdXQuam9pbignLCAnKSArICcgJyArIGJyYWNlc1sxXTtcbn1cblxuXG4vLyBOT1RFOiBUaGVzZSB0eXBlIGNoZWNraW5nIGZ1bmN0aW9ucyBpbnRlbnRpb25hbGx5IGRvbid0IHVzZSBgaW5zdGFuY2VvZmBcbi8vIGJlY2F1c2UgaXQgaXMgZnJhZ2lsZSBhbmQgY2FuIGJlIGVhc2lseSBmYWtlZCB3aXRoIGBPYmplY3QuY3JlYXRlKClgLlxuZnVuY3Rpb24gaXNBcnJheShhcikge1xuICByZXR1cm4gQXJyYXkuaXNBcnJheShhcik7XG59XG5leHBvcnRzLmlzQXJyYXkgPSBpc0FycmF5O1xuXG5mdW5jdGlvbiBpc0Jvb2xlYW4oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnYm9vbGVhbic7XG59XG5leHBvcnRzLmlzQm9vbGVhbiA9IGlzQm9vbGVhbjtcblxuZnVuY3Rpb24gaXNOdWxsKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsO1xufVxuZXhwb3J0cy5pc051bGwgPSBpc051bGw7XG5cbmZ1bmN0aW9uIGlzTnVsbE9yVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09IG51bGw7XG59XG5leHBvcnRzLmlzTnVsbE9yVW5kZWZpbmVkID0gaXNOdWxsT3JVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5leHBvcnRzLmlzTnVtYmVyID0gaXNOdW1iZXI7XG5cbmZ1bmN0aW9uIGlzU3RyaW5nKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N0cmluZyc7XG59XG5leHBvcnRzLmlzU3RyaW5nID0gaXNTdHJpbmc7XG5cbmZ1bmN0aW9uIGlzU3ltYm9sKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCc7XG59XG5leHBvcnRzLmlzU3ltYm9sID0gaXNTeW1ib2w7XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG5leHBvcnRzLmlzVW5kZWZpbmVkID0gaXNVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzUmVnRXhwKHJlKSB7XG4gIHJldHVybiBpc09iamVjdChyZSkgJiYgb2JqZWN0VG9TdHJpbmcocmUpID09PSAnW29iamVjdCBSZWdFeHBdJztcbn1cbmV4cG9ydHMuaXNSZWdFeHAgPSBpc1JlZ0V4cDtcblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5leHBvcnRzLmlzT2JqZWN0ID0gaXNPYmplY3Q7XG5cbmZ1bmN0aW9uIGlzRGF0ZShkKSB7XG4gIHJldHVybiBpc09iamVjdChkKSAmJiBvYmplY3RUb1N0cmluZyhkKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuZXhwb3J0cy5pc0RhdGUgPSBpc0RhdGU7XG5cbmZ1bmN0aW9uIGlzRXJyb3IoZSkge1xuICByZXR1cm4gaXNPYmplY3QoZSkgJiZcbiAgICAgIChvYmplY3RUb1N0cmluZyhlKSA9PT0gJ1tvYmplY3QgRXJyb3JdJyB8fCBlIGluc3RhbmNlb2YgRXJyb3IpO1xufVxuZXhwb3J0cy5pc0Vycm9yID0gaXNFcnJvcjtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5leHBvcnRzLmlzRnVuY3Rpb24gPSBpc0Z1bmN0aW9uO1xuXG5mdW5jdGlvbiBpc1ByaW1pdGl2ZShhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gbnVsbCB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ2Jvb2xlYW4nIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnbnVtYmVyJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N0cmluZycgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdzeW1ib2wnIHx8ICAvLyBFUzYgc3ltYm9sXG4gICAgICAgICB0eXBlb2YgYXJnID09PSAndW5kZWZpbmVkJztcbn1cbmV4cG9ydHMuaXNQcmltaXRpdmUgPSBpc1ByaW1pdGl2ZTtcblxuZXhwb3J0cy5pc0J1ZmZlciA9IHJlcXVpcmUoJy4vc3VwcG9ydC9pc0J1ZmZlcicpO1xuXG5mdW5jdGlvbiBvYmplY3RUb1N0cmluZyhvKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobyk7XG59XG5cblxuZnVuY3Rpb24gcGFkKG4pIHtcbiAgcmV0dXJuIG4gPCAxMCA/ICcwJyArIG4udG9TdHJpbmcoMTApIDogbi50b1N0cmluZygxMCk7XG59XG5cblxudmFyIG1vbnRocyA9IFsnSmFuJywgJ0ZlYicsICdNYXInLCAnQXByJywgJ01heScsICdKdW4nLCAnSnVsJywgJ0F1ZycsICdTZXAnLFxuICAgICAgICAgICAgICAnT2N0JywgJ05vdicsICdEZWMnXTtcblxuLy8gMjYgRmViIDE2OjE5OjM0XG5mdW5jdGlvbiB0aW1lc3RhbXAoKSB7XG4gIHZhciBkID0gbmV3IERhdGUoKTtcbiAgdmFyIHRpbWUgPSBbcGFkKGQuZ2V0SG91cnMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldE1pbnV0ZXMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldFNlY29uZHMoKSldLmpvaW4oJzonKTtcbiAgcmV0dXJuIFtkLmdldERhdGUoKSwgbW9udGhzW2QuZ2V0TW9udGgoKV0sIHRpbWVdLmpvaW4oJyAnKTtcbn1cblxuXG4vLyBsb2cgaXMganVzdCBhIHRoaW4gd3JhcHBlciB0byBjb25zb2xlLmxvZyB0aGF0IHByZXBlbmRzIGEgdGltZXN0YW1wXG5leHBvcnRzLmxvZyA9IGZ1bmN0aW9uKCkge1xuICBjb25zb2xlLmxvZygnJXMgLSAlcycsIHRpbWVzdGFtcCgpLCBleHBvcnRzLmZvcm1hdC5hcHBseShleHBvcnRzLCBhcmd1bWVudHMpKTtcbn07XG5cblxuLyoqXG4gKiBJbmhlcml0IHRoZSBwcm90b3R5cGUgbWV0aG9kcyBmcm9tIG9uZSBjb25zdHJ1Y3RvciBpbnRvIGFub3RoZXIuXG4gKlxuICogVGhlIEZ1bmN0aW9uLnByb3RvdHlwZS5pbmhlcml0cyBmcm9tIGxhbmcuanMgcmV3cml0dGVuIGFzIGEgc3RhbmRhbG9uZVxuICogZnVuY3Rpb24gKG5vdCBvbiBGdW5jdGlvbi5wcm90b3R5cGUpLiBOT1RFOiBJZiB0aGlzIGZpbGUgaXMgdG8gYmUgbG9hZGVkXG4gKiBkdXJpbmcgYm9vdHN0cmFwcGluZyB0aGlzIGZ1bmN0aW9uIG5lZWRzIHRvIGJlIHJld3JpdHRlbiB1c2luZyBzb21lIG5hdGl2ZVxuICogZnVuY3Rpb25zIGFzIHByb3RvdHlwZSBzZXR1cCB1c2luZyBub3JtYWwgSmF2YVNjcmlwdCBkb2VzIG5vdCB3b3JrIGFzXG4gKiBleHBlY3RlZCBkdXJpbmcgYm9vdHN0cmFwcGluZyAoc2VlIG1pcnJvci5qcyBpbiByMTE0OTAzKS5cbiAqXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjdG9yIENvbnN0cnVjdG9yIGZ1bmN0aW9uIHdoaWNoIG5lZWRzIHRvIGluaGVyaXQgdGhlXG4gKiAgICAgcHJvdG90eXBlLlxuICogQHBhcmFtIHtmdW5jdGlvbn0gc3VwZXJDdG9yIENvbnN0cnVjdG9yIGZ1bmN0aW9uIHRvIGluaGVyaXQgcHJvdG90eXBlIGZyb20uXG4gKi9cbmV4cG9ydHMuaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpO1xuXG5leHBvcnRzLl9leHRlbmQgPSBmdW5jdGlvbihvcmlnaW4sIGFkZCkge1xuICAvLyBEb24ndCBkbyBhbnl0aGluZyBpZiBhZGQgaXNuJ3QgYW4gb2JqZWN0XG4gIGlmICghYWRkIHx8ICFpc09iamVjdChhZGQpKSByZXR1cm4gb3JpZ2luO1xuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMoYWRkKTtcbiAgdmFyIGkgPSBrZXlzLmxlbmd0aDtcbiAgd2hpbGUgKGktLSkge1xuICAgIG9yaWdpbltrZXlzW2ldXSA9IGFkZFtrZXlzW2ldXTtcbiAgfVxuICByZXR1cm4gb3JpZ2luO1xufTtcblxuZnVuY3Rpb24gaGFzT3duUHJvcGVydHkob2JqLCBwcm9wKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKTtcbn1cbiIsIi8qKlxuICogVGhpcyBtb2R1bGUgZXhwb3J0cyBmdW5jdGlvbnMgZm9yIGNoZWNraW5nIHR5cGVzXG4gKiBhbmQgdGhyb3dpbmcgZXhjZXB0aW9ucy5cbiAqL1xuXG4vKmdsb2JhbHMgZGVmaW5lLCBtb2R1bGUgKi9cblxuKGZ1bmN0aW9uIChnbG9iYWxzKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIG1lc3NhZ2VzLCBwcmVkaWNhdGVzLCBmdW5jdGlvbnMsIGFzc2VydCwgbm90LCBtYXliZSwgZWl0aGVyO1xuXG4gICAgbWVzc2FnZXMgPSB7XG4gICAgICAgIGxpa2U6ICdJbnZhbGlkIHR5cGUnLFxuICAgICAgICBpbnN0YW5jZTogJ0ludmFsaWQgdHlwZScsXG4gICAgICAgIGVtcHR5T2JqZWN0OiAnSW52YWxpZCBvYmplY3QnLFxuICAgICAgICBvYmplY3Q6ICdJbnZhbGlkIG9iamVjdCcsXG4gICAgICAgIGFzc2lnbmVkOiAnSW52YWxpZCB2YWx1ZScsXG4gICAgICAgIHVuZGVmaW5lZDogJ0ludmFsaWQgdmFsdWUnLFxuICAgICAgICBudWxsOiAnSW52YWxpZCB2YWx1ZScsXG4gICAgICAgIGhhc0xlbmd0aDogJ0ludmFsaWQgbGVuZ3RoJyxcbiAgICAgICAgZW1wdHlBcnJheTogJ0ludmFsaWQgYXJyYXknLFxuICAgICAgICBhcnJheTogJ0ludmFsaWQgYXJyYXknLFxuICAgICAgICBkYXRlOiAnSW52YWxpZCBkYXRlJyxcbiAgICAgICAgZXJyb3I6ICdJbnZhbGlkIGVycm9yJyxcbiAgICAgICAgZm46ICdJbnZhbGlkIGZ1bmN0aW9uJyxcbiAgICAgICAgbWF0Y2g6ICdJbnZhbGlkIHN0cmluZycsXG4gICAgICAgIGNvbnRhaW5zOiAnSW52YWxpZCBzdHJpbmcnLFxuICAgICAgICB1bmVtcHR5U3RyaW5nOiAnSW52YWxpZCBzdHJpbmcnLFxuICAgICAgICBzdHJpbmc6ICdJbnZhbGlkIHN0cmluZycsXG4gICAgICAgIG9kZDogJ0ludmFsaWQgbnVtYmVyJyxcbiAgICAgICAgZXZlbjogJ0ludmFsaWQgbnVtYmVyJyxcbiAgICAgICAgYmV0d2VlbjogJ0ludmFsaWQgbnVtYmVyJyxcbiAgICAgICAgZ3JlYXRlcjogJ0ludmFsaWQgbnVtYmVyJyxcbiAgICAgICAgbGVzczogJ0ludmFsaWQgbnVtYmVyJyxcbiAgICAgICAgcG9zaXRpdmU6ICdJbnZhbGlkIG51bWJlcicsXG4gICAgICAgIG5lZ2F0aXZlOiAnSW52YWxpZCBudW1iZXInLFxuICAgICAgICBpbnRlZ2VyOiAnSW52YWxpZCBudW1iZXInLFxuICAgICAgICB6ZXJvOiAnSW52YWxpZCBudW1iZXInLFxuICAgICAgICBudW1iZXI6ICdJbnZhbGlkIG51bWJlcicsXG4gICAgICAgIGJvb2xlYW46ICdJbnZhbGlkIGJvb2xlYW4nXG4gICAgfTtcblxuICAgIHByZWRpY2F0ZXMgPSB7XG4gICAgICAgIGxpa2U6IGxpa2UsXG4gICAgICAgIGluc3RhbmNlOiBpbnN0YW5jZSxcbiAgICAgICAgZW1wdHlPYmplY3Q6IGVtcHR5T2JqZWN0LFxuICAgICAgICBvYmplY3Q6IG9iamVjdCxcbiAgICAgICAgYXNzaWduZWQ6IGFzc2lnbmVkLFxuICAgICAgICB1bmRlZmluZWQ6IGlzVW5kZWZpbmVkLFxuICAgICAgICBudWxsOiBpc051bGwsXG4gICAgICAgIGhhc0xlbmd0aDogaGFzTGVuZ3RoLFxuICAgICAgICBlbXB0eUFycmF5OiBlbXB0eUFycmF5LFxuICAgICAgICBhcnJheTogYXJyYXksXG4gICAgICAgIGRhdGU6IGRhdGUsXG4gICAgICAgIGVycm9yOiBlcnJvcixcbiAgICAgICAgZnVuY3Rpb246IGlzRnVuY3Rpb24sXG4gICAgICAgIG1hdGNoOiBtYXRjaCxcbiAgICAgICAgY29udGFpbnM6IGNvbnRhaW5zLFxuICAgICAgICB1bmVtcHR5U3RyaW5nOiB1bmVtcHR5U3RyaW5nLFxuICAgICAgICBzdHJpbmc6IHN0cmluZyxcbiAgICAgICAgb2RkOiBvZGQsXG4gICAgICAgIGV2ZW46IGV2ZW4sXG4gICAgICAgIGJldHdlZW46IGJldHdlZW4sXG4gICAgICAgIGdyZWF0ZXI6IGdyZWF0ZXIsXG4gICAgICAgIGxlc3M6IGxlc3MsXG4gICAgICAgIHBvc2l0aXZlOiBwb3NpdGl2ZSxcbiAgICAgICAgbmVnYXRpdmU6IG5lZ2F0aXZlLFxuICAgICAgICBpbnRlZ2VyIDogaW50ZWdlcixcbiAgICAgICAgemVybzogemVybyxcbiAgICAgICAgbnVtYmVyOiBudW1iZXIsXG4gICAgICAgIGJvb2xlYW46IGJvb2xlYW5cbiAgICB9O1xuXG4gICAgZnVuY3Rpb25zID0ge1xuICAgICAgICBhcHBseTogYXBwbHksXG4gICAgICAgIG1hcDogbWFwLFxuICAgICAgICBhbGw6IGFsbCxcbiAgICAgICAgYW55OiBhbnlcbiAgICB9O1xuXG4gICAgZnVuY3Rpb25zID0gbWl4aW4oZnVuY3Rpb25zLCBwcmVkaWNhdGVzKTtcbiAgICBhc3NlcnQgPSBjcmVhdGVNb2RpZmllZFByZWRpY2F0ZXMoYXNzZXJ0TW9kaWZpZXIsIGFzc2VydEltcGwpO1xuICAgIG5vdCA9IGNyZWF0ZU1vZGlmaWVkUHJlZGljYXRlcyhub3RNb2RpZmllciwgbm90SW1wbCk7XG4gICAgbWF5YmUgPSBjcmVhdGVNb2RpZmllZFByZWRpY2F0ZXMobWF5YmVNb2RpZmllciwgbWF5YmVJbXBsKTtcbiAgICBlaXRoZXIgPSBjcmVhdGVNb2RpZmllZFByZWRpY2F0ZXMoZWl0aGVyTW9kaWZpZXIpO1xuICAgIGFzc2VydC5ub3QgPSBjcmVhdGVNb2RpZmllZEZ1bmN0aW9ucyhhc3NlcnRNb2RpZmllciwgbm90KTtcbiAgICBhc3NlcnQubWF5YmUgPSBjcmVhdGVNb2RpZmllZEZ1bmN0aW9ucyhhc3NlcnRNb2RpZmllciwgbWF5YmUpO1xuICAgIGFzc2VydC5laXRoZXIgPSBjcmVhdGVNb2RpZmllZEZ1bmN0aW9ucyhhc3NlcnRFaXRoZXJNb2RpZmllciwgcHJlZGljYXRlcyk7XG5cbiAgICBleHBvcnRGdW5jdGlvbnMobWl4aW4oZnVuY3Rpb25zLCB7XG4gICAgICAgIGFzc2VydDogYXNzZXJ0LFxuICAgICAgICBub3Q6IG5vdCxcbiAgICAgICAgbWF5YmU6IG1heWJlLFxuICAgICAgICBlaXRoZXI6IGVpdGhlclxuICAgIH0pKTtcblxuICAgIC8qKlxuICAgICAqIFB1YmxpYyBmdW5jdGlvbiBgbGlrZWAuXG4gICAgICpcbiAgICAgKiBUZXN0cyB3aGV0aGVyIGFuIG9iamVjdCAncXVhY2tzIGxpa2UgYSBkdWNrJy5cbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgZmlyc3QgYXJndW1lbnQgaGFzIGFsbCBvZlxuICAgICAqIHRoZSBwcm9wZXJ0aWVzIG9mIHRoZSBzZWNvbmQsIGFyY2hldHlwYWwgYXJndW1lbnRcbiAgICAgKiAodGhlICdkdWNrJykuIFJldHVybnMgYGZhbHNlYCBvdGhlcndpc2UuXG4gICAgICpcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBsaWtlIChkYXRhLCBkdWNrKSB7XG4gICAgICAgIHZhciBuYW1lO1xuXG4gICAgICAgIGZvciAobmFtZSBpbiBkdWNrKSB7XG4gICAgICAgICAgICBpZiAoZHVjay5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICAgICAgICAgIGlmIChkYXRhLmhhc093blByb3BlcnR5KG5hbWUpID09PSBmYWxzZSB8fCB0eXBlb2YgZGF0YVtuYW1lXSAhPT0gdHlwZW9mIGR1Y2tbbmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChvYmplY3QoZGF0YVtuYW1lXSkgJiYgbGlrZShkYXRhW25hbWVdLCBkdWNrW25hbWVdKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFB1YmxpYyBmdW5jdGlvbiBgaW5zdGFuY2VgLlxuICAgICAqXG4gICAgICogUmV0dXJucyBgdHJ1ZWAgaWYgYW4gb2JqZWN0IGlzIGFuIGluc3RhbmNlIG9mIGEgcHJvdG90eXBlLFxuICAgICAqIGBmYWxzZWAgb3RoZXJ3aXNlLlxuICAgICAqXG4gICAgICovXG4gICAgZnVuY3Rpb24gaW5zdGFuY2UgKGRhdGEsIHByb3RvdHlwZSkge1xuICAgICAgICBpZiAoZGF0YSAmJiBpc0Z1bmN0aW9uKHByb3RvdHlwZSkgJiYgZGF0YSBpbnN0YW5jZW9mIHByb3RvdHlwZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHVibGljIGZ1bmN0aW9uIGBlbXB0eU9iamVjdGAuXG4gICAgICpcbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBpZiBzb21ldGhpbmcgaXMgYW4gZW1wdHkgb2JqZWN0LFxuICAgICAqIGBmYWxzZWAgb3RoZXJ3aXNlLlxuICAgICAqXG4gICAgICovXG4gICAgZnVuY3Rpb24gZW1wdHlPYmplY3QgKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIG9iamVjdChkYXRhKSAmJiBPYmplY3Qua2V5cyhkYXRhKS5sZW5ndGggPT09IDA7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHVibGljIGZ1bmN0aW9uIGBvYmplY3RgLlxuICAgICAqXG4gICAgICogUmV0dXJucyBgdHJ1ZWAgaWYgc29tZXRoaW5nIGlzIGEgcGxhaW4tb2xkIEpTIG9iamVjdCxcbiAgICAgKiBgZmFsc2VgIG90aGVyd2lzZS5cbiAgICAgKlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIG9iamVjdCAoZGF0YSkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGRhdGEpID09PSAnW29iamVjdCBPYmplY3RdJztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQdWJsaWMgZnVuY3Rpb24gYGFzc2lnbmVkYC5cbiAgICAgKlxuICAgICAqIFJldHVybnMgYHRydWVgIGlmIHNvbWV0aGluZyBpcyBub3QgbnVsbCBvciB1bmRlZmluZWQsXG4gICAgICogYGZhbHNlYCBvdGhlcndpc2UuXG4gICAgICpcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBhc3NpZ25lZCAoZGF0YSkge1xuICAgICAgICByZXR1cm4gIWlzVW5kZWZpbmVkKGRhdGEpICYmICFpc051bGwoZGF0YSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHVibGljIGZ1bmN0aW9uIGB1bmRlZmluZWRgLlxuICAgICAqXG4gICAgICogUmV0dXJucyBgdHJ1ZWAgaWYgc29tZXRoaW5nIGlzIHVuZGVmaW5lZCxcbiAgICAgKiBgZmFsc2VgIG90aGVyd2lzZS5cbiAgICAgKlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGlzVW5kZWZpbmVkIChkYXRhKSB7XG4gICAgICAgIHJldHVybiBkYXRhID09PSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHVibGljIGZ1bmN0aW9uIGBudWxsYC5cbiAgICAgKlxuICAgICAqIFJldHVybnMgYHRydWVgIGlmIHNvbWV0aGluZyBpcyBudWxsLFxuICAgICAqIGBmYWxzZWAgb3RoZXJ3aXNlLlxuICAgICAqXG4gICAgICovXG4gICAgZnVuY3Rpb24gaXNOdWxsIChkYXRhKSB7XG4gICAgICAgIHJldHVybiBkYXRhID09PSBudWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFB1YmxpYyBmdW5jdGlvbiBgaGFzTGVuZ3RoYC5cbiAgICAgKlxuICAgICAqIFJldHVybnMgYHRydWVgIGlmIHNvbWV0aGluZyBpcyBoYXMgYSBsZW5ndGggcHJvcGVydHlcbiAgICAgKiB0aGF0IGVxdWFscyBgdmFsdWVgLCBgZmFsc2VgIG90aGVyd2lzZS5cbiAgICAgKlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGhhc0xlbmd0aCAoZGF0YSwgdmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIGFzc2lnbmVkKGRhdGEpICYmIGRhdGEubGVuZ3RoID09PSB2YWx1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQdWJsaWMgZnVuY3Rpb24gYGVtcHR5QXJyYXlgLlxuICAgICAqXG4gICAgICogUmV0dXJucyBgdHJ1ZWAgaWYgc29tZXRoaW5nIGlzIGFuIGVtcHR5IGFycmF5LFxuICAgICAqIGBmYWxzZWAgb3RoZXJ3aXNlLlxuICAgICAqXG4gICAgICovXG4gICAgZnVuY3Rpb24gZW1wdHlBcnJheSAoZGF0YSkge1xuICAgICAgICByZXR1cm4gYXJyYXkoZGF0YSkgJiYgZGF0YS5sZW5ndGggPT09IDA7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHVibGljIGZ1bmN0aW9uIGBhcnJheWAuXG4gICAgICpcbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBzb21ldGhpbmcgaXMgYW4gYXJyYXksXG4gICAgICogYGZhbHNlYCBvdGhlcndpc2UuXG4gICAgICpcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBhcnJheSAoZGF0YSkge1xuICAgICAgICByZXR1cm4gQXJyYXkuaXNBcnJheShkYXRhKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQdWJsaWMgZnVuY3Rpb24gYGRhdGVgLlxuICAgICAqXG4gICAgICogUmV0dXJucyBgdHJ1ZWAgc29tZXRoaW5nIGlzIGEgdmFsaWQgZGF0ZSxcbiAgICAgKiBgZmFsc2VgIG90aGVyd2lzZS5cbiAgICAgKlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGRhdGUgKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChkYXRhKSA9PT0gJ1tvYmplY3QgRGF0ZV0nICYmXG4gICAgICAgICAgICAhaXNOYU4oZGF0YS5nZXRUaW1lKCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFB1YmxpYyBmdW5jdGlvbiBgZXJyb3JgLlxuICAgICAqXG4gICAgICogUmV0dXJucyBgdHJ1ZWAgaWYgc29tZXRoaW5nIGlzIGEgcGxhaW4tb2xkIEpTIG9iamVjdCxcbiAgICAgKiBgZmFsc2VgIG90aGVyd2lzZS5cbiAgICAgKlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGVycm9yIChkYXRhKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoZGF0YSkgPT09ICdbb2JqZWN0IEVycm9yXSc7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHVibGljIGZ1bmN0aW9uIGBmdW5jdGlvbmAuXG4gICAgICpcbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBpZiBzb21ldGhpbmcgaXMgZnVuY3Rpb24sXG4gICAgICogYGZhbHNlYCBvdGhlcndpc2UuXG4gICAgICpcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBpc0Z1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIHJldHVybiB0eXBlb2YgZGF0YSA9PT0gJ2Z1bmN0aW9uJztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQdWJsaWMgZnVuY3Rpb24gYG1hdGNoYC5cbiAgICAgKlxuICAgICAqIFJldHVybnMgYHRydWVgIGlmIHNvbWV0aGluZyBpcyBhIHN0cmluZ1xuICAgICAqIHRoYXQgbWF0Y2hlcyBgcmVnZXhgLCBgZmFsc2VgIG90aGVyd2lzZS5cbiAgICAgKlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIG1hdGNoIChkYXRhLCByZWdleCkge1xuICAgICAgICByZXR1cm4gc3RyaW5nKGRhdGEpICYmICEhZGF0YS5tYXRjaChyZWdleCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHVibGljIGZ1bmN0aW9uIGBjb250YWluc2AuXG4gICAgICpcbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBpZiBzb21ldGhpbmcgaXMgYSBzdHJpbmdcbiAgICAgKiB0aGF0IGNvbnRhaW5zIGBzdWJzdHJpbmdgLCBgZmFsc2VgIG90aGVyd2lzZS5cbiAgICAgKlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGNvbnRhaW5zIChkYXRhLCBzdWJzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIHN0cmluZyhkYXRhKSAmJiBkYXRhLmluZGV4T2Yoc3Vic3RyaW5nKSAhPT0gLTE7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHVibGljIGZ1bmN0aW9uIGB1bmVtcHR5U3RyaW5nYC5cbiAgICAgKlxuICAgICAqIFJldHVybnMgYHRydWVgIGlmIHNvbWV0aGluZyBpcyBhIG5vbi1lbXB0eSBzdHJpbmcsXG4gICAgICogYGZhbHNlYCBvdGhlcndpc2UuXG4gICAgICpcbiAgICAgKi9cbiAgICBmdW5jdGlvbiB1bmVtcHR5U3RyaW5nIChkYXRhKSB7XG4gICAgICAgIHJldHVybiBzdHJpbmcoZGF0YSkgJiYgZGF0YSAhPT0gJyc7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHVibGljIGZ1bmN0aW9uIGBzdHJpbmdgLlxuICAgICAqXG4gICAgICogUmV0dXJucyBgdHJ1ZWAgaWYgc29tZXRoaW5nIGlzIGEgc3RyaW5nLCBgZmFsc2VgIG90aGVyd2lzZS5cbiAgICAgKlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHN0cmluZyAoZGF0YSkge1xuICAgICAgICByZXR1cm4gdHlwZW9mIGRhdGEgPT09ICdzdHJpbmcnO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFB1YmxpYyBmdW5jdGlvbiBgb2RkYC5cbiAgICAgKlxuICAgICAqIFJldHVybnMgYHRydWVgIGlmIHNvbWV0aGluZyBpcyBhbiBvZGQgbnVtYmVyLFxuICAgICAqIGBmYWxzZWAgb3RoZXJ3aXNlLlxuICAgICAqXG4gICAgICovXG4gICAgZnVuY3Rpb24gb2RkIChkYXRhKSB7XG4gICAgICAgIHJldHVybiBpbnRlZ2VyKGRhdGEpICYmICFldmVuKGRhdGEpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFB1YmxpYyBmdW5jdGlvbiBgZXZlbmAuXG4gICAgICpcbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBpZiBzb21ldGhpbmcgaXMgYW4gZXZlbiBudW1iZXIsXG4gICAgICogYGZhbHNlYCBvdGhlcndpc2UuXG4gICAgICpcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBldmVuIChkYXRhKSB7XG4gICAgICAgIHJldHVybiBudW1iZXIoZGF0YSkgJiYgZGF0YSAlIDIgPT09IDA7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHVibGljIGZ1bmN0aW9uIGBpbnRlZ2VyYC5cbiAgICAgKlxuICAgICAqIFJldHVybnMgYHRydWVgIGlmIHNvbWV0aGluZyBpcyBhbiBpbnRlZ2VyLFxuICAgICAqIGBmYWxzZWAgb3RoZXJ3aXNlLlxuICAgICAqXG4gICAgICovXG4gICAgZnVuY3Rpb24gaW50ZWdlciAoZGF0YSkge1xuICAgICAgICByZXR1cm4gbnVtYmVyKGRhdGEpICYmIGRhdGEgJSAxID09PSAwO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFB1YmxpYyBmdW5jdGlvbiBgYmV0d2VlbmAuXG4gICAgICpcbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBpZiBzb21ldGhpbmcgaXMgYSBudW1iZXJcbiAgICAgKiBiZXR3ZWVuIGBhYCBhbmQgYGJgLCBgZmFsc2VgIG90aGVyd2lzZS5cbiAgICAgKlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGJldHdlZW4gKGRhdGEsIGEsIGIpIHtcbiAgICAgICAgaWYgKGEgPCBiKSB7XG4gICAgICAgICAgICByZXR1cm4gZ3JlYXRlcihkYXRhLCBhKSAmJiBsZXNzKGRhdGEsIGIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGxlc3MoZGF0YSwgYSkgJiYgZ3JlYXRlcihkYXRhLCBiKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQdWJsaWMgZnVuY3Rpb24gYGdyZWF0ZXJgLlxuICAgICAqXG4gICAgICogUmV0dXJucyBgdHJ1ZWAgaWYgc29tZXRoaW5nIGlzIGEgbnVtYmVyXG4gICAgICogZ3JlYXRlciB0aGFuIGB2YWx1ZWAsIGBmYWxzZWAgb3RoZXJ3aXNlLlxuICAgICAqXG4gICAgICovXG4gICAgZnVuY3Rpb24gZ3JlYXRlciAoZGF0YSwgdmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIG51bWJlcihkYXRhKSAmJiBkYXRhID4gdmFsdWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHVibGljIGZ1bmN0aW9uIGBsZXNzYC5cbiAgICAgKlxuICAgICAqIFJldHVybnMgYHRydWVgIGlmIHNvbWV0aGluZyBpcyBhIG51bWJlclxuICAgICAqIGxlc3MgdGhhbiBgdmFsdWVgLCBgZmFsc2VgIG90aGVyd2lzZS5cbiAgICAgKlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGxlc3MgKGRhdGEsIHZhbHVlKSB7XG4gICAgICAgIHJldHVybiBudW1iZXIoZGF0YSkgJiYgZGF0YSA8IHZhbHVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFB1YmxpYyBmdW5jdGlvbiBgcG9zaXRpdmVgLlxuICAgICAqXG4gICAgICogUmV0dXJucyBgdHJ1ZWAgaWYgc29tZXRoaW5nIGlzIGEgcG9zaXRpdmUgbnVtYmVyLFxuICAgICAqIGBmYWxzZWAgb3RoZXJ3aXNlLlxuICAgICAqXG4gICAgICovXG4gICAgZnVuY3Rpb24gcG9zaXRpdmUgKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIGdyZWF0ZXIoZGF0YSwgMCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHVibGljIGZ1bmN0aW9uIGBuZWdhdGl2ZWAuXG4gICAgICpcbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBpZiBzb21ldGhpbmcgaXMgYSBuZWdhdGl2ZSBudW1iZXIsXG4gICAgICogYGZhbHNlYCBvdGhlcndpc2UuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZGF0YSAgICAgICAgICBUaGUgdGhpbmcgdG8gdGVzdC5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBuZWdhdGl2ZSAoZGF0YSkge1xuICAgICAgICByZXR1cm4gbGVzcyhkYXRhLCAwKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQdWJsaWMgZnVuY3Rpb24gYG51bWJlcmAuXG4gICAgICpcbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBpZiBkYXRhIGlzIGEgbnVtYmVyLFxuICAgICAqIGBmYWxzZWAgb3RoZXJ3aXNlLlxuICAgICAqXG4gICAgICovXG4gICAgZnVuY3Rpb24gbnVtYmVyIChkYXRhKSB7XG4gICAgICAgIHJldHVybiB0eXBlb2YgZGF0YSA9PT0gJ251bWJlcicgJiYgaXNOYU4oZGF0YSkgPT09IGZhbHNlICYmXG4gICAgICAgICAgICAgICBkYXRhICE9PSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkgJiZcbiAgICAgICAgICAgICAgIGRhdGEgIT09IE51bWJlci5ORUdBVElWRV9JTkZJTklUWTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQdWJsaWMgZnVuY3Rpb24gYHplcm9gLlxuICAgICAqXG4gICAgICogUmV0dXJucyBgdHJ1ZWAgaWYgc29tZXRoaW5nIGlzIHplcm8sXG4gICAgICogYGZhbHNlYCBvdGhlcndpc2UuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZGF0YSAgICAgICAgICBUaGUgdGhpbmcgdG8gdGVzdC5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiB6ZXJvIChkYXRhKSB7XG4gICAgICAgIHJldHVybiBkYXRhID09PSAwO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFB1YmxpYyBmdW5jdGlvbiBgYm9vbGVhbmAuXG4gICAgICpcbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBpZiBkYXRhIGlzIGEgYm9vbGVhbiB2YWx1ZSxcbiAgICAgKiBgZmFsc2VgIG90aGVyd2lzZS5cbiAgICAgKlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGJvb2xlYW4gKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIGRhdGEgPT09IGZhbHNlIHx8IGRhdGEgPT09IHRydWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHVibGljIGZ1bmN0aW9uIGBhcHBseWAuXG4gICAgICpcbiAgICAgKiBNYXBzIGVhY2ggdmFsdWUgZnJvbSB0aGUgZGF0YSB0byB0aGUgY29ycmVzcG9uZGluZyBwcmVkaWNhdGUgYW5kIHJldHVybnNcbiAgICAgKiB0aGUgcmVzdWx0IGFycmF5LiBJZiB0aGUgc2FtZSBmdW5jdGlvbiBpcyB0byBiZSBhcHBsaWVkIGFjcm9zcyBhbGwgb2YgdGhlXG4gICAgICogZGF0YSwgYSBzaW5nbGUgcHJlZGljYXRlIGZ1bmN0aW9uIG1heSBiZSBwYXNzZWQgaW4uXG4gICAgICpcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBhcHBseSAoZGF0YSwgcHJlZGljYXRlcykge1xuICAgICAgICBhc3NlcnQuYXJyYXkoZGF0YSk7XG5cbiAgICAgICAgaWYgKGlzRnVuY3Rpb24ocHJlZGljYXRlcykpIHtcbiAgICAgICAgICAgIHJldHVybiBkYXRhLm1hcChmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJlZGljYXRlcyh2YWx1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGFzc2VydC5hcnJheShwcmVkaWNhdGVzKTtcbiAgICAgICAgYXNzZXJ0Lmhhc0xlbmd0aChkYXRhLCBwcmVkaWNhdGVzLmxlbmd0aCk7XG5cbiAgICAgICAgcmV0dXJuIGRhdGEubWFwKGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgpIHtcbiAgICAgICAgICAgIHJldHVybiBwcmVkaWNhdGVzW2luZGV4XSh2YWx1ZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFB1YmxpYyBmdW5jdGlvbiBgbWFwYC5cbiAgICAgKlxuICAgICAqIE1hcHMgZWFjaCB2YWx1ZSBmcm9tIHRoZSBkYXRhIHRvIHRoZSBjb3JyZXNwb25kaW5nIHByZWRpY2F0ZSBhbmQgcmV0dXJuc1xuICAgICAqIHRoZSByZXN1bHQgb2JqZWN0LiBTdXBwb3J0cyBuZXN0ZWQgb2JqZWN0cy4gSWYgdGhlIGRhdGEgaXMgbm90IG5lc3RlZCBhbmRcbiAgICAgKiB0aGUgc2FtZSBmdW5jdGlvbiBpcyB0byBiZSBhcHBsaWVkIGFjcm9zcyBhbGwgb2YgaXQsIGEgc2luZ2xlIHByZWRpY2F0ZVxuICAgICAqIGZ1bmN0aW9uIG1heSBiZSBwYXNzZWQgaW4uXG4gICAgICpcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBtYXAgKGRhdGEsIHByZWRpY2F0ZXMpIHtcbiAgICAgICAgYXNzZXJ0Lm9iamVjdChkYXRhKTtcblxuICAgICAgICBpZiAoaXNGdW5jdGlvbihwcmVkaWNhdGVzKSkge1xuICAgICAgICAgICAgcmV0dXJuIG1hcFNpbXBsZShkYXRhLCBwcmVkaWNhdGVzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGFzc2VydC5vYmplY3QocHJlZGljYXRlcyk7XG5cbiAgICAgICAgcmV0dXJuIG1hcENvbXBsZXgoZGF0YSwgcHJlZGljYXRlcyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWFwU2ltcGxlIChkYXRhLCBwcmVkaWNhdGUpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHt9O1xuXG4gICAgICAgIE9iamVjdC5rZXlzKGRhdGEpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgcmVzdWx0W2tleV0gPSBwcmVkaWNhdGUoZGF0YVtrZXldKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtYXBDb21wbGV4IChkYXRhLCBwcmVkaWNhdGVzKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSB7fTtcblxuICAgICAgICBPYmplY3Qua2V5cyhwcmVkaWNhdGVzKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIHZhciBwcmVkaWNhdGUgPSBwcmVkaWNhdGVzW2tleV07XG5cbiAgICAgICAgICAgIGlmIChpc0Z1bmN0aW9uKHByZWRpY2F0ZSkpIHtcbiAgICAgICAgICAgICAgICByZXN1bHRba2V5XSA9IHByZWRpY2F0ZShkYXRhW2tleV0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChvYmplY3QocHJlZGljYXRlKSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldID0gbWFwQ29tcGxleChkYXRhW2tleV0sIHByZWRpY2F0ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHVibGljIGZ1bmN0aW9uIGBhbGxgXG4gICAgICpcbiAgICAgKiBDaGVjayB0aGF0IGFsbCBib29sZWFuIHZhbHVlcyBhcmUgdHJ1ZVxuICAgICAqIGluIGFuIGFycmF5IChyZXR1cm5lZCBmcm9tIGBhcHBseWApXG4gICAgICogb3Igb2JqZWN0IChyZXR1cm5lZCBmcm9tIGBtYXBgKS5cbiAgICAgKlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGFsbCAoZGF0YSkge1xuICAgICAgICBpZiAoYXJyYXkoZGF0YSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0ZXN0QXJyYXkoZGF0YSwgZmFsc2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgYXNzZXJ0Lm9iamVjdChkYXRhKTtcblxuICAgICAgICByZXR1cm4gdGVzdE9iamVjdChkYXRhLCBmYWxzZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdGVzdEFycmF5IChkYXRhLCByZXN1bHQpIHtcbiAgICAgICAgdmFyIGk7XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGlmIChkYXRhW2ldID09PSByZXN1bHQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuICFyZXN1bHQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdGVzdE9iamVjdCAoZGF0YSwgcmVzdWx0KSB7XG4gICAgICAgIHZhciBrZXksIHZhbHVlO1xuXG4gICAgICAgIGZvciAoa2V5IGluIGRhdGEpIHtcbiAgICAgICAgICAgIGlmIChkYXRhLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IGRhdGFba2V5XTtcblxuICAgICAgICAgICAgICAgIGlmIChvYmplY3QodmFsdWUpICYmIHRlc3RPYmplY3QodmFsdWUsIHJlc3VsdCkgPT09IHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gcmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuICFyZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHVibGljIGZ1bmN0aW9uIGBhbnlgXG4gICAgICpcbiAgICAgKiBDaGVjayB0aGF0IGF0IGxlYXN0IG9uZSBib29sZWFuIHZhbHVlIGlzIHRydWVcbiAgICAgKiBpbiBhbiBhcnJheSAocmV0dXJuZWQgZnJvbSBgYXBwbHlgKVxuICAgICAqIG9yIG9iamVjdCAocmV0dXJuZWQgZnJvbSBgbWFwYCkuXG4gICAgICpcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBhbnkgKGRhdGEpIHtcbiAgICAgICAgaWYgKGFycmF5KGRhdGEpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGVzdEFycmF5KGRhdGEsIHRydWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgYXNzZXJ0Lm9iamVjdChkYXRhKTtcblxuICAgICAgICByZXR1cm4gdGVzdE9iamVjdChkYXRhLCB0cnVlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtaXhpbiAodGFyZ2V0LCBzb3VyY2UpIHtcbiAgICAgICAgT2JqZWN0LmtleXMoc291cmNlKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIHRhcmdldFtrZXldID0gc291cmNlW2tleV07XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHVibGljIG1vZGlmaWVyIGBhc3NlcnRgLlxuICAgICAqXG4gICAgICogVGhyb3dzIGlmIGBwcmVkaWNhdGVgIHJldHVybnMgYGZhbHNlYC5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBhc3NlcnRNb2RpZmllciAocHJlZGljYXRlLCBkZWZhdWx0TWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgYXNzZXJ0UHJlZGljYXRlKHByZWRpY2F0ZSwgYXJndW1lbnRzLCBkZWZhdWx0TWVzc2FnZSk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYXNzZXJ0UHJlZGljYXRlIChwcmVkaWNhdGUsIGFyZ3MsIGRlZmF1bHRNZXNzYWdlKSB7XG4gICAgICAgIHZhciBtZXNzYWdlID0gYXJnc1thcmdzLmxlbmd0aCAtIDFdO1xuICAgICAgICBhc3NlcnRJbXBsKHByZWRpY2F0ZS5hcHBseShudWxsLCBhcmdzKSwgdW5lbXB0eVN0cmluZyhtZXNzYWdlKSA/IG1lc3NhZ2UgOiBkZWZhdWx0TWVzc2FnZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYXNzZXJ0SW1wbCAodmFsdWUsIG1lc3NhZ2UpIHtcbiAgICAgICAgaWYgKHZhbHVlID09PSBmYWxzZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UgfHwgJ0Fzc2VydGlvbiBmYWlsZWQnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFzc2VydEVpdGhlck1vZGlmaWVyIChwcmVkaWNhdGUsIGRlZmF1bHRNZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZXJyb3I7XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgYXNzZXJ0UHJlZGljYXRlKHByZWRpY2F0ZSwgYXJndW1lbnRzLCBkZWZhdWx0TWVzc2FnZSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgZXJyb3IgPSBlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG9yOiBPYmplY3Qua2V5cyhwcmVkaWNhdGVzKS5yZWR1Y2UoZGVsYXllZEFzc2VydCwge30pXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBkZWxheWVkQXNzZXJ0IChyZXN1bHQsIGtleSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyb3IgJiYgIXByZWRpY2F0ZXNba2V5XS5hcHBseShudWxsLCBhcmd1bWVudHMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFB1YmxpYyBtb2RpZmllciBgbm90YC5cbiAgICAgKlxuICAgICAqIE5lZ2F0ZXMgYHByZWRpY2F0ZWAuXG4gICAgICovXG4gICAgZnVuY3Rpb24gbm90TW9kaWZpZXIgKHByZWRpY2F0ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIG5vdEltcGwocHJlZGljYXRlLmFwcGx5KG51bGwsIGFyZ3VtZW50cykpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG5vdEltcGwgKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiAhdmFsdWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHVibGljIG1vZGlmaWVyIGBtYXliZWAuXG4gICAgICpcbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBpZiBwcmVkaWNhdGUgYXJndW1lbnQgaXMgIGBudWxsYCBvciBgdW5kZWZpbmVkYCxcbiAgICAgKiBvdGhlcndpc2UgcHJvcGFnYXRlcyB0aGUgcmV0dXJuIHZhbHVlIGZyb20gYHByZWRpY2F0ZWAuXG4gICAgICovXG4gICAgZnVuY3Rpb24gbWF5YmVNb2RpZmllciAocHJlZGljYXRlKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoIWFzc2lnbmVkKGFyZ3VtZW50c1swXSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHByZWRpY2F0ZS5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1heWJlSW1wbCAodmFsdWUpIHtcbiAgICAgICAgaWYgKGFzc2lnbmVkKHZhbHVlKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFB1YmxpYyBtb2RpZmllciBgZWl0aGVyYC5cbiAgICAgKlxuICAgICAqIFJldHVybnMgYHRydWVgIGlmIGVpdGhlciBwcmVkaWNhdGUgaXMgdHJ1ZS5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBlaXRoZXJNb2RpZmllciAocHJlZGljYXRlKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgc2hvcnRjdXQgPSBwcmVkaWNhdGUuYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBvcjogT2JqZWN0LmtleXMocHJlZGljYXRlcykucmVkdWNlKG5vcE9yUHJlZGljYXRlLCB7fSlcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIG5vcE9yUHJlZGljYXRlIChyZXN1bHQsIGtleSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldID0gc2hvcnRjdXQgPyBub3AgOiBwcmVkaWNhdGVzW2tleV07XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBmdW5jdGlvbiBub3AgKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVNb2RpZmllZFByZWRpY2F0ZXMgKG1vZGlmaWVyLCBvYmplY3QpIHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZU1vZGlmaWVkRnVuY3Rpb25zKG1vZGlmaWVyLCBwcmVkaWNhdGVzLCBvYmplY3QpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNyZWF0ZU1vZGlmaWVkRnVuY3Rpb25zIChtb2RpZmllciwgZnVuY3Rpb25zLCBvYmplY3QpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IG9iamVjdCB8fCB7fTtcblxuICAgICAgICBPYmplY3Qua2V5cyhmdW5jdGlvbnMpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHJlc3VsdCwga2V5LCB7XG4gICAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHdyaXRhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB2YWx1ZTogbW9kaWZpZXIoZnVuY3Rpb25zW2tleV0sIG1lc3NhZ2VzW2tleV0pXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBleHBvcnRGdW5jdGlvbnMgKGZ1bmN0aW9ucykge1xuICAgICAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgICAgICBkZWZpbmUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbnM7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUgIT09IG51bGwgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICAgICAgICAgIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb25zO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZ2xvYmFscy5jaGVjayA9IGZ1bmN0aW9ucztcbiAgICAgICAgfVxuICAgIH1cbn0odGhpcykpO1xuIiwiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIEJTRC1zdHlsZSBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLiBBbiBhZGRpdGlvbmFsIGdyYW50XG4gKiBvZiBwYXRlbnQgcmlnaHRzIGNhbiBiZSBmb3VuZCBpbiB0aGUgUEFURU5UUyBmaWxlIGluIHRoZSBzYW1lIGRpcmVjdG9yeS5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cy5EaXNwYXRjaGVyID0gcmVxdWlyZSgnLi9saWIvRGlzcGF0Y2hlcicpXG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDE0LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBCU0Qtc3R5bGUgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS4gQW4gYWRkaXRpb25hbCBncmFudFxuICogb2YgcGF0ZW50IHJpZ2h0cyBjYW4gYmUgZm91bmQgaW4gdGhlIFBBVEVOVFMgZmlsZSBpbiB0aGUgc2FtZSBkaXJlY3RvcnkuXG4gKlxuICogQHByb3ZpZGVzTW9kdWxlIERpc3BhdGNoZXJcbiAqIEB0eXBlY2hlY2tzXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBpbnZhcmlhbnQgPSByZXF1aXJlKCcuL2ludmFyaWFudCcpO1xuXG52YXIgX2xhc3RJRCA9IDE7XG52YXIgX3ByZWZpeCA9ICdJRF8nO1xuXG4vKipcbiAqIERpc3BhdGNoZXIgaXMgdXNlZCB0byBicm9hZGNhc3QgcGF5bG9hZHMgdG8gcmVnaXN0ZXJlZCBjYWxsYmFja3MuIFRoaXMgaXNcbiAqIGRpZmZlcmVudCBmcm9tIGdlbmVyaWMgcHViLXN1YiBzeXN0ZW1zIGluIHR3byB3YXlzOlxuICpcbiAqICAgMSkgQ2FsbGJhY2tzIGFyZSBub3Qgc3Vic2NyaWJlZCB0byBwYXJ0aWN1bGFyIGV2ZW50cy4gRXZlcnkgcGF5bG9hZCBpc1xuICogICAgICBkaXNwYXRjaGVkIHRvIGV2ZXJ5IHJlZ2lzdGVyZWQgY2FsbGJhY2suXG4gKiAgIDIpIENhbGxiYWNrcyBjYW4gYmUgZGVmZXJyZWQgaW4gd2hvbGUgb3IgcGFydCB1bnRpbCBvdGhlciBjYWxsYmFja3MgaGF2ZVxuICogICAgICBiZWVuIGV4ZWN1dGVkLlxuICpcbiAqIEZvciBleGFtcGxlLCBjb25zaWRlciB0aGlzIGh5cG90aGV0aWNhbCBmbGlnaHQgZGVzdGluYXRpb24gZm9ybSwgd2hpY2hcbiAqIHNlbGVjdHMgYSBkZWZhdWx0IGNpdHkgd2hlbiBhIGNvdW50cnkgaXMgc2VsZWN0ZWQ6XG4gKlxuICogICB2YXIgZmxpZ2h0RGlzcGF0Y2hlciA9IG5ldyBEaXNwYXRjaGVyKCk7XG4gKlxuICogICAvLyBLZWVwcyB0cmFjayBvZiB3aGljaCBjb3VudHJ5IGlzIHNlbGVjdGVkXG4gKiAgIHZhciBDb3VudHJ5U3RvcmUgPSB7Y291bnRyeTogbnVsbH07XG4gKlxuICogICAvLyBLZWVwcyB0cmFjayBvZiB3aGljaCBjaXR5IGlzIHNlbGVjdGVkXG4gKiAgIHZhciBDaXR5U3RvcmUgPSB7Y2l0eTogbnVsbH07XG4gKlxuICogICAvLyBLZWVwcyB0cmFjayBvZiB0aGUgYmFzZSBmbGlnaHQgcHJpY2Ugb2YgdGhlIHNlbGVjdGVkIGNpdHlcbiAqICAgdmFyIEZsaWdodFByaWNlU3RvcmUgPSB7cHJpY2U6IG51bGx9XG4gKlxuICogV2hlbiBhIHVzZXIgY2hhbmdlcyB0aGUgc2VsZWN0ZWQgY2l0eSwgd2UgZGlzcGF0Y2ggdGhlIHBheWxvYWQ6XG4gKlxuICogICBmbGlnaHREaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAqICAgICBhY3Rpb25UeXBlOiAnY2l0eS11cGRhdGUnLFxuICogICAgIHNlbGVjdGVkQ2l0eTogJ3BhcmlzJ1xuICogICB9KTtcbiAqXG4gKiBUaGlzIHBheWxvYWQgaXMgZGlnZXN0ZWQgYnkgYENpdHlTdG9yZWA6XG4gKlxuICogICBmbGlnaHREaXNwYXRjaGVyLnJlZ2lzdGVyKGZ1bmN0aW9uKHBheWxvYWQpIHtcbiAqICAgICBpZiAocGF5bG9hZC5hY3Rpb25UeXBlID09PSAnY2l0eS11cGRhdGUnKSB7XG4gKiAgICAgICBDaXR5U3RvcmUuY2l0eSA9IHBheWxvYWQuc2VsZWN0ZWRDaXR5O1xuICogICAgIH1cbiAqICAgfSk7XG4gKlxuICogV2hlbiB0aGUgdXNlciBzZWxlY3RzIGEgY291bnRyeSwgd2UgZGlzcGF0Y2ggdGhlIHBheWxvYWQ6XG4gKlxuICogICBmbGlnaHREaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAqICAgICBhY3Rpb25UeXBlOiAnY291bnRyeS11cGRhdGUnLFxuICogICAgIHNlbGVjdGVkQ291bnRyeTogJ2F1c3RyYWxpYSdcbiAqICAgfSk7XG4gKlxuICogVGhpcyBwYXlsb2FkIGlzIGRpZ2VzdGVkIGJ5IGJvdGggc3RvcmVzOlxuICpcbiAqICAgIENvdW50cnlTdG9yZS5kaXNwYXRjaFRva2VuID0gZmxpZ2h0RGlzcGF0Y2hlci5yZWdpc3RlcihmdW5jdGlvbihwYXlsb2FkKSB7XG4gKiAgICAgaWYgKHBheWxvYWQuYWN0aW9uVHlwZSA9PT0gJ2NvdW50cnktdXBkYXRlJykge1xuICogICAgICAgQ291bnRyeVN0b3JlLmNvdW50cnkgPSBwYXlsb2FkLnNlbGVjdGVkQ291bnRyeTtcbiAqICAgICB9XG4gKiAgIH0pO1xuICpcbiAqIFdoZW4gdGhlIGNhbGxiYWNrIHRvIHVwZGF0ZSBgQ291bnRyeVN0b3JlYCBpcyByZWdpc3RlcmVkLCB3ZSBzYXZlIGEgcmVmZXJlbmNlXG4gKiB0byB0aGUgcmV0dXJuZWQgdG9rZW4uIFVzaW5nIHRoaXMgdG9rZW4gd2l0aCBgd2FpdEZvcigpYCwgd2UgY2FuIGd1YXJhbnRlZVxuICogdGhhdCBgQ291bnRyeVN0b3JlYCBpcyB1cGRhdGVkIGJlZm9yZSB0aGUgY2FsbGJhY2sgdGhhdCB1cGRhdGVzIGBDaXR5U3RvcmVgXG4gKiBuZWVkcyB0byBxdWVyeSBpdHMgZGF0YS5cbiAqXG4gKiAgIENpdHlTdG9yZS5kaXNwYXRjaFRva2VuID0gZmxpZ2h0RGlzcGF0Y2hlci5yZWdpc3RlcihmdW5jdGlvbihwYXlsb2FkKSB7XG4gKiAgICAgaWYgKHBheWxvYWQuYWN0aW9uVHlwZSA9PT0gJ2NvdW50cnktdXBkYXRlJykge1xuICogICAgICAgLy8gYENvdW50cnlTdG9yZS5jb3VudHJ5YCBtYXkgbm90IGJlIHVwZGF0ZWQuXG4gKiAgICAgICBmbGlnaHREaXNwYXRjaGVyLndhaXRGb3IoW0NvdW50cnlTdG9yZS5kaXNwYXRjaFRva2VuXSk7XG4gKiAgICAgICAvLyBgQ291bnRyeVN0b3JlLmNvdW50cnlgIGlzIG5vdyBndWFyYW50ZWVkIHRvIGJlIHVwZGF0ZWQuXG4gKlxuICogICAgICAgLy8gU2VsZWN0IHRoZSBkZWZhdWx0IGNpdHkgZm9yIHRoZSBuZXcgY291bnRyeVxuICogICAgICAgQ2l0eVN0b3JlLmNpdHkgPSBnZXREZWZhdWx0Q2l0eUZvckNvdW50cnkoQ291bnRyeVN0b3JlLmNvdW50cnkpO1xuICogICAgIH1cbiAqICAgfSk7XG4gKlxuICogVGhlIHVzYWdlIG9mIGB3YWl0Rm9yKClgIGNhbiBiZSBjaGFpbmVkLCBmb3IgZXhhbXBsZTpcbiAqXG4gKiAgIEZsaWdodFByaWNlU3RvcmUuZGlzcGF0Y2hUb2tlbiA9XG4gKiAgICAgZmxpZ2h0RGlzcGF0Y2hlci5yZWdpc3RlcihmdW5jdGlvbihwYXlsb2FkKSB7XG4gKiAgICAgICBzd2l0Y2ggKHBheWxvYWQuYWN0aW9uVHlwZSkge1xuICogICAgICAgICBjYXNlICdjb3VudHJ5LXVwZGF0ZSc6XG4gKiAgICAgICAgICAgZmxpZ2h0RGlzcGF0Y2hlci53YWl0Rm9yKFtDaXR5U3RvcmUuZGlzcGF0Y2hUb2tlbl0pO1xuICogICAgICAgICAgIEZsaWdodFByaWNlU3RvcmUucHJpY2UgPVxuICogICAgICAgICAgICAgZ2V0RmxpZ2h0UHJpY2VTdG9yZShDb3VudHJ5U3RvcmUuY291bnRyeSwgQ2l0eVN0b3JlLmNpdHkpO1xuICogICAgICAgICAgIGJyZWFrO1xuICpcbiAqICAgICAgICAgY2FzZSAnY2l0eS11cGRhdGUnOlxuICogICAgICAgICAgIEZsaWdodFByaWNlU3RvcmUucHJpY2UgPVxuICogICAgICAgICAgICAgRmxpZ2h0UHJpY2VTdG9yZShDb3VudHJ5U3RvcmUuY291bnRyeSwgQ2l0eVN0b3JlLmNpdHkpO1xuICogICAgICAgICAgIGJyZWFrO1xuICogICAgIH1cbiAqICAgfSk7XG4gKlxuICogVGhlIGBjb3VudHJ5LXVwZGF0ZWAgcGF5bG9hZCB3aWxsIGJlIGd1YXJhbnRlZWQgdG8gaW52b2tlIHRoZSBzdG9yZXMnXG4gKiByZWdpc3RlcmVkIGNhbGxiYWNrcyBpbiBvcmRlcjogYENvdW50cnlTdG9yZWAsIGBDaXR5U3RvcmVgLCB0aGVuXG4gKiBgRmxpZ2h0UHJpY2VTdG9yZWAuXG4gKi9cblxuICBmdW5jdGlvbiBEaXNwYXRjaGVyKCkge1xuICAgIHRoaXMuJERpc3BhdGNoZXJfY2FsbGJhY2tzID0ge307XG4gICAgdGhpcy4kRGlzcGF0Y2hlcl9pc1BlbmRpbmcgPSB7fTtcbiAgICB0aGlzLiREaXNwYXRjaGVyX2lzSGFuZGxlZCA9IHt9O1xuICAgIHRoaXMuJERpc3BhdGNoZXJfaXNEaXNwYXRjaGluZyA9IGZhbHNlO1xuICAgIHRoaXMuJERpc3BhdGNoZXJfcGVuZGluZ1BheWxvYWQgPSBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBhIGNhbGxiYWNrIHRvIGJlIGludm9rZWQgd2l0aCBldmVyeSBkaXNwYXRjaGVkIHBheWxvYWQuIFJldHVybnNcbiAgICogYSB0b2tlbiB0aGF0IGNhbiBiZSB1c2VkIHdpdGggYHdhaXRGb3IoKWAuXG4gICAqXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrXG4gICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICovXG4gIERpc3BhdGNoZXIucHJvdG90eXBlLnJlZ2lzdGVyPWZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgdmFyIGlkID0gX3ByZWZpeCArIF9sYXN0SUQrKztcbiAgICB0aGlzLiREaXNwYXRjaGVyX2NhbGxiYWNrc1tpZF0gPSBjYWxsYmFjaztcbiAgICByZXR1cm4gaWQ7XG4gIH07XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgYSBjYWxsYmFjayBiYXNlZCBvbiBpdHMgdG9rZW4uXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBpZFxuICAgKi9cbiAgRGlzcGF0Y2hlci5wcm90b3R5cGUudW5yZWdpc3Rlcj1mdW5jdGlvbihpZCkge1xuICAgIGludmFyaWFudChcbiAgICAgIHRoaXMuJERpc3BhdGNoZXJfY2FsbGJhY2tzW2lkXSxcbiAgICAgICdEaXNwYXRjaGVyLnVucmVnaXN0ZXIoLi4uKTogYCVzYCBkb2VzIG5vdCBtYXAgdG8gYSByZWdpc3RlcmVkIGNhbGxiYWNrLicsXG4gICAgICBpZFxuICAgICk7XG4gICAgZGVsZXRlIHRoaXMuJERpc3BhdGNoZXJfY2FsbGJhY2tzW2lkXTtcbiAgfTtcblxuICAvKipcbiAgICogV2FpdHMgZm9yIHRoZSBjYWxsYmFja3Mgc3BlY2lmaWVkIHRvIGJlIGludm9rZWQgYmVmb3JlIGNvbnRpbnVpbmcgZXhlY3V0aW9uXG4gICAqIG9mIHRoZSBjdXJyZW50IGNhbGxiYWNrLiBUaGlzIG1ldGhvZCBzaG91bGQgb25seSBiZSB1c2VkIGJ5IGEgY2FsbGJhY2sgaW5cbiAgICogcmVzcG9uc2UgdG8gYSBkaXNwYXRjaGVkIHBheWxvYWQuXG4gICAqXG4gICAqIEBwYXJhbSB7YXJyYXk8c3RyaW5nPn0gaWRzXG4gICAqL1xuICBEaXNwYXRjaGVyLnByb3RvdHlwZS53YWl0Rm9yPWZ1bmN0aW9uKGlkcykge1xuICAgIGludmFyaWFudChcbiAgICAgIHRoaXMuJERpc3BhdGNoZXJfaXNEaXNwYXRjaGluZyxcbiAgICAgICdEaXNwYXRjaGVyLndhaXRGb3IoLi4uKTogTXVzdCBiZSBpbnZva2VkIHdoaWxlIGRpc3BhdGNoaW5nLidcbiAgICApO1xuICAgIGZvciAodmFyIGlpID0gMDsgaWkgPCBpZHMubGVuZ3RoOyBpaSsrKSB7XG4gICAgICB2YXIgaWQgPSBpZHNbaWldO1xuICAgICAgaWYgKHRoaXMuJERpc3BhdGNoZXJfaXNQZW5kaW5nW2lkXSkge1xuICAgICAgICBpbnZhcmlhbnQoXG4gICAgICAgICAgdGhpcy4kRGlzcGF0Y2hlcl9pc0hhbmRsZWRbaWRdLFxuICAgICAgICAgICdEaXNwYXRjaGVyLndhaXRGb3IoLi4uKTogQ2lyY3VsYXIgZGVwZW5kZW5jeSBkZXRlY3RlZCB3aGlsZSAnICtcbiAgICAgICAgICAnd2FpdGluZyBmb3IgYCVzYC4nLFxuICAgICAgICAgIGlkXG4gICAgICAgICk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgaW52YXJpYW50KFxuICAgICAgICB0aGlzLiREaXNwYXRjaGVyX2NhbGxiYWNrc1tpZF0sXG4gICAgICAgICdEaXNwYXRjaGVyLndhaXRGb3IoLi4uKTogYCVzYCBkb2VzIG5vdCBtYXAgdG8gYSByZWdpc3RlcmVkIGNhbGxiYWNrLicsXG4gICAgICAgIGlkXG4gICAgICApO1xuICAgICAgdGhpcy4kRGlzcGF0Y2hlcl9pbnZva2VDYWxsYmFjayhpZCk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBEaXNwYXRjaGVzIGEgcGF5bG9hZCB0byBhbGwgcmVnaXN0ZXJlZCBjYWxsYmFja3MuXG4gICAqXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBwYXlsb2FkXG4gICAqL1xuICBEaXNwYXRjaGVyLnByb3RvdHlwZS5kaXNwYXRjaD1mdW5jdGlvbihwYXlsb2FkKSB7XG4gICAgaW52YXJpYW50KFxuICAgICAgIXRoaXMuJERpc3BhdGNoZXJfaXNEaXNwYXRjaGluZyxcbiAgICAgICdEaXNwYXRjaC5kaXNwYXRjaCguLi4pOiBDYW5ub3QgZGlzcGF0Y2ggaW4gdGhlIG1pZGRsZSBvZiBhIGRpc3BhdGNoLidcbiAgICApO1xuICAgIHRoaXMuJERpc3BhdGNoZXJfc3RhcnREaXNwYXRjaGluZyhwYXlsb2FkKTtcbiAgICB0cnkge1xuICAgICAgZm9yICh2YXIgaWQgaW4gdGhpcy4kRGlzcGF0Y2hlcl9jYWxsYmFja3MpIHtcbiAgICAgICAgaWYgKHRoaXMuJERpc3BhdGNoZXJfaXNQZW5kaW5nW2lkXSkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuJERpc3BhdGNoZXJfaW52b2tlQ2FsbGJhY2soaWQpO1xuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICB0aGlzLiREaXNwYXRjaGVyX3N0b3BEaXNwYXRjaGluZygpO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogSXMgdGhpcyBEaXNwYXRjaGVyIGN1cnJlbnRseSBkaXNwYXRjaGluZy5cbiAgICpcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIERpc3BhdGNoZXIucHJvdG90eXBlLmlzRGlzcGF0Y2hpbmc9ZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuJERpc3BhdGNoZXJfaXNEaXNwYXRjaGluZztcbiAgfTtcblxuICAvKipcbiAgICogQ2FsbCB0aGUgY2FsbGJhY2sgc3RvcmVkIHdpdGggdGhlIGdpdmVuIGlkLiBBbHNvIGRvIHNvbWUgaW50ZXJuYWxcbiAgICogYm9va2tlZXBpbmcuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBpZFxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIERpc3BhdGNoZXIucHJvdG90eXBlLiREaXNwYXRjaGVyX2ludm9rZUNhbGxiYWNrPWZ1bmN0aW9uKGlkKSB7XG4gICAgdGhpcy4kRGlzcGF0Y2hlcl9pc1BlbmRpbmdbaWRdID0gdHJ1ZTtcbiAgICB0aGlzLiREaXNwYXRjaGVyX2NhbGxiYWNrc1tpZF0odGhpcy4kRGlzcGF0Y2hlcl9wZW5kaW5nUGF5bG9hZCk7XG4gICAgdGhpcy4kRGlzcGF0Y2hlcl9pc0hhbmRsZWRbaWRdID0gdHJ1ZTtcbiAgfTtcblxuICAvKipcbiAgICogU2V0IHVwIGJvb2trZWVwaW5nIG5lZWRlZCB3aGVuIGRpc3BhdGNoaW5nLlxuICAgKlxuICAgKiBAcGFyYW0ge29iamVjdH0gcGF5bG9hZFxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIERpc3BhdGNoZXIucHJvdG90eXBlLiREaXNwYXRjaGVyX3N0YXJ0RGlzcGF0Y2hpbmc9ZnVuY3Rpb24ocGF5bG9hZCkge1xuICAgIGZvciAodmFyIGlkIGluIHRoaXMuJERpc3BhdGNoZXJfY2FsbGJhY2tzKSB7XG4gICAgICB0aGlzLiREaXNwYXRjaGVyX2lzUGVuZGluZ1tpZF0gPSBmYWxzZTtcbiAgICAgIHRoaXMuJERpc3BhdGNoZXJfaXNIYW5kbGVkW2lkXSA9IGZhbHNlO1xuICAgIH1cbiAgICB0aGlzLiREaXNwYXRjaGVyX3BlbmRpbmdQYXlsb2FkID0gcGF5bG9hZDtcbiAgICB0aGlzLiREaXNwYXRjaGVyX2lzRGlzcGF0Y2hpbmcgPSB0cnVlO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDbGVhciBib29ra2VlcGluZyB1c2VkIGZvciBkaXNwYXRjaGluZy5cbiAgICpcbiAgICogQGludGVybmFsXG4gICAqL1xuICBEaXNwYXRjaGVyLnByb3RvdHlwZS4kRGlzcGF0Y2hlcl9zdG9wRGlzcGF0Y2hpbmc9ZnVuY3Rpb24oKSB7XG4gICAgdGhpcy4kRGlzcGF0Y2hlcl9wZW5kaW5nUGF5bG9hZCA9IG51bGw7XG4gICAgdGhpcy4kRGlzcGF0Y2hlcl9pc0Rpc3BhdGNoaW5nID0gZmFsc2U7XG4gIH07XG5cblxubW9kdWxlLmV4cG9ydHMgPSBEaXNwYXRjaGVyO1xuIiwiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIEJTRC1zdHlsZSBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLiBBbiBhZGRpdGlvbmFsIGdyYW50XG4gKiBvZiBwYXRlbnQgcmlnaHRzIGNhbiBiZSBmb3VuZCBpbiB0aGUgUEFURU5UUyBmaWxlIGluIHRoZSBzYW1lIGRpcmVjdG9yeS5cbiAqXG4gKiBAcHJvdmlkZXNNb2R1bGUgaW52YXJpYW50XG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qKlxuICogVXNlIGludmFyaWFudCgpIHRvIGFzc2VydCBzdGF0ZSB3aGljaCB5b3VyIHByb2dyYW0gYXNzdW1lcyB0byBiZSB0cnVlLlxuICpcbiAqIFByb3ZpZGUgc3ByaW50Zi1zdHlsZSBmb3JtYXQgKG9ubHkgJXMgaXMgc3VwcG9ydGVkKSBhbmQgYXJndW1lbnRzXG4gKiB0byBwcm92aWRlIGluZm9ybWF0aW9uIGFib3V0IHdoYXQgYnJva2UgYW5kIHdoYXQgeW91IHdlcmVcbiAqIGV4cGVjdGluZy5cbiAqXG4gKiBUaGUgaW52YXJpYW50IG1lc3NhZ2Ugd2lsbCBiZSBzdHJpcHBlZCBpbiBwcm9kdWN0aW9uLCBidXQgdGhlIGludmFyaWFudFxuICogd2lsbCByZW1haW4gdG8gZW5zdXJlIGxvZ2ljIGRvZXMgbm90IGRpZmZlciBpbiBwcm9kdWN0aW9uLlxuICovXG5cbnZhciBpbnZhcmlhbnQgPSBmdW5jdGlvbihjb25kaXRpb24sIGZvcm1hdCwgYSwgYiwgYywgZCwgZSwgZikge1xuICBpZiAoZmFsc2UpIHtcbiAgICBpZiAoZm9ybWF0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignaW52YXJpYW50IHJlcXVpcmVzIGFuIGVycm9yIG1lc3NhZ2UgYXJndW1lbnQnKTtcbiAgICB9XG4gIH1cblxuICBpZiAoIWNvbmRpdGlvbikge1xuICAgIHZhciBlcnJvcjtcbiAgICBpZiAoZm9ybWF0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGVycm9yID0gbmV3IEVycm9yKFxuICAgICAgICAnTWluaWZpZWQgZXhjZXB0aW9uIG9jY3VycmVkOyB1c2UgdGhlIG5vbi1taW5pZmllZCBkZXYgZW52aXJvbm1lbnQgJyArXG4gICAgICAgICdmb3IgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZSBhbmQgYWRkaXRpb25hbCBoZWxwZnVsIHdhcm5pbmdzLidcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBhcmdzID0gW2EsIGIsIGMsIGQsIGUsIGZdO1xuICAgICAgdmFyIGFyZ0luZGV4ID0gMDtcbiAgICAgIGVycm9yID0gbmV3IEVycm9yKFxuICAgICAgICAnSW52YXJpYW50IFZpb2xhdGlvbjogJyArXG4gICAgICAgIGZvcm1hdC5yZXBsYWNlKC8lcy9nLCBmdW5jdGlvbigpIHsgcmV0dXJuIGFyZ3NbYXJnSW5kZXgrK107IH0pXG4gICAgICApO1xuICAgIH1cblxuICAgIGVycm9yLmZyYW1lc1RvUG9wID0gMTsgLy8gd2UgZG9uJ3QgY2FyZSBhYm91dCBpbnZhcmlhbnQncyBvd24gZnJhbWVcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBpbnZhcmlhbnQ7XG4iLCJ2YXIgdG9wTGV2ZWwgPSB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbCA6XG4gICAgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiB7fVxudmFyIG1pbkRvYyA9IHJlcXVpcmUoJ21pbi1kb2N1bWVudCcpO1xuXG5pZiAodHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZG9jdW1lbnQ7XG59IGVsc2Uge1xuICAgIHZhciBkb2NjeSA9IHRvcExldmVsWydfX0dMT0JBTF9ET0NVTUVOVF9DQUNIRUA0J107XG5cbiAgICBpZiAoIWRvY2N5KSB7XG4gICAgICAgIGRvY2N5ID0gdG9wTGV2ZWxbJ19fR0xPQkFMX0RPQ1VNRU5UX0NBQ0hFQDQnXSA9IG1pbkRvYztcbiAgICB9XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IGRvY2N5O1xufVxuIiwiaWYgKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHdpbmRvdztcbn0gZWxzZSBpZiAodHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZ2xvYmFsO1xufSBlbHNlIGlmICh0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIil7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBzZWxmO1xufSBlbHNlIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHt9O1xufVxuIiwiXG52YXIgdXRpbCA9IHJlcXVpcmUoJ3V0aWwnKTtcblxudmFyIHRva2VuaXplID0gZnVuY3Rpb24oLypTdHJpbmcqLyBzdHIsIC8qUmVnRXhwKi8gcmUsIC8qRnVuY3Rpb24/Ki8gcGFyc2VEZWxpbSwgLypPYmplY3Q/Ki8gaW5zdGFuY2Upe1xuICAvLyBzdW1tYXJ5OlxuICAvLyAgICBTcGxpdCBhIHN0cmluZyBieSBhIHJlZ3VsYXIgZXhwcmVzc2lvbiB3aXRoIHRoZSBhYmlsaXR5IHRvIGNhcHR1cmUgdGhlIGRlbGltZXRlcnNcbiAgLy8gcGFyc2VEZWxpbTpcbiAgLy8gICAgRWFjaCBncm91cCAoZXhjbHVkaW5nIHRoZSAwIGdyb3VwKSBpcyBwYXNzZWQgYXMgYSBwYXJhbWV0ZXIuIElmIHRoZSBmdW5jdGlvbiByZXR1cm5zXG4gIC8vICAgIGEgdmFsdWUsIGl0J3MgYWRkZWQgdG8gdGhlIGxpc3Qgb2YgdG9rZW5zLlxuICAvLyBpbnN0YW5jZTpcbiAgLy8gICAgVXNlZCBhcyB0aGUgXCJ0aGlzJyBpbnN0YW5jZSB3aGVuIGNhbGxpbmcgcGFyc2VEZWxpbVxuICB2YXIgdG9rZW5zID0gW107XG4gIHZhciBtYXRjaCwgY29udGVudCwgbGFzdEluZGV4ID0gMDtcbiAgd2hpbGUobWF0Y2ggPSByZS5leGVjKHN0cikpe1xuICAgIGNvbnRlbnQgPSBzdHIuc2xpY2UobGFzdEluZGV4LCByZS5sYXN0SW5kZXggLSBtYXRjaFswXS5sZW5ndGgpO1xuICAgIGlmKGNvbnRlbnQubGVuZ3RoKXtcbiAgICAgIHRva2Vucy5wdXNoKGNvbnRlbnQpO1xuICAgIH1cbiAgICBpZihwYXJzZURlbGltKXtcbiAgICAgIHZhciBwYXJzZWQgPSBwYXJzZURlbGltLmFwcGx5KGluc3RhbmNlLCBtYXRjaC5zbGljZSgxKS5jb25jYXQodG9rZW5zLmxlbmd0aCkpO1xuICAgICAgaWYodHlwZW9mIHBhcnNlZCAhPSAndW5kZWZpbmVkJyl7XG4gICAgICAgIGlmKHBhcnNlZC5zcGVjaWZpZXIgPT09ICclJyl7XG4gICAgICAgICAgdG9rZW5zLnB1c2goJyUnKTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgdG9rZW5zLnB1c2gocGFyc2VkKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBsYXN0SW5kZXggPSByZS5sYXN0SW5kZXg7XG4gIH1cbiAgY29udGVudCA9IHN0ci5zbGljZShsYXN0SW5kZXgpO1xuICBpZihjb250ZW50Lmxlbmd0aCl7XG4gICAgdG9rZW5zLnB1c2goY29udGVudCk7XG4gIH1cbiAgcmV0dXJuIHRva2Vucztcbn1cblxudmFyIEZvcm1hdHRlciA9IGZ1bmN0aW9uKC8qU3RyaW5nKi8gZm9ybWF0KXtcbiAgdmFyIHRva2VucyA9IFtdO1xuICB0aGlzLl9tYXBwZWQgPSBmYWxzZTtcbiAgdGhpcy5fZm9ybWF0ID0gZm9ybWF0O1xuICB0aGlzLl90b2tlbnMgPSB0b2tlbml6ZShmb3JtYXQsIHRoaXMuX3JlLCB0aGlzLl9wYXJzZURlbGltLCB0aGlzKTtcbn1cblxuRm9ybWF0dGVyLnByb3RvdHlwZS5fcmUgPSAvXFwlKD86XFwoKFtcXHdfXSspXFwpfChbMS05XVxcZCopXFwkKT8oWzAgK1xcLVxcI10qKShcXCp8XFxkKyk/KFxcLik/KFxcKnxcXGQrKT9baGxMXT8oW1xcJWJzY2RlRWZGZ0dpb091eFhdKS9nO1xuRm9ybWF0dGVyLnByb3RvdHlwZS5fcGFyc2VEZWxpbSA9IGZ1bmN0aW9uKG1hcHBpbmcsIGludG1hcHBpbmcsIGZsYWdzLCBtaW5XaWR0aCwgcGVyaW9kLCBwcmVjaXNpb24sIHNwZWNpZmllcil7XG4gIGlmKG1hcHBpbmcpe1xuICAgIHRoaXMuX21hcHBlZCA9IHRydWU7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBtYXBwaW5nOiBtYXBwaW5nLFxuICAgIGludG1hcHBpbmc6IGludG1hcHBpbmcsXG4gICAgZmxhZ3M6IGZsYWdzLFxuICAgIF9taW5XaWR0aDogbWluV2lkdGgsIC8vIE1heSBiZSBkZXBlbmRlbnQgb24gcGFyYW1ldGVyc1xuICAgIHBlcmlvZDogcGVyaW9kLFxuICAgIF9wcmVjaXNpb246IHByZWNpc2lvbiwgLy8gTWF5IGJlIGRlcGVuZGVudCBvbiBwYXJhbWV0ZXJzXG4gICAgc3BlY2lmaWVyOiBzcGVjaWZpZXJcbiAgfTtcbn07XG5Gb3JtYXR0ZXIucHJvdG90eXBlLl9zcGVjaWZpZXJzID0ge1xuICBiOiB7XG4gICAgYmFzZTogMixcbiAgICBpc0ludDogdHJ1ZVxuICB9LFxuICBvOiB7XG4gICAgYmFzZTogOCxcbiAgICBpc0ludDogdHJ1ZVxuICB9LFxuICB4OiB7XG4gICAgYmFzZTogMTYsXG4gICAgaXNJbnQ6IHRydWVcbiAgfSxcbiAgWDoge1xuICAgIGV4dGVuZDogWyd4J10sXG4gICAgdG9VcHBlcjogdHJ1ZVxuICB9LFxuICBkOiB7XG4gICAgYmFzZTogMTAsXG4gICAgaXNJbnQ6IHRydWVcbiAgfSxcbiAgaToge1xuICAgIGV4dGVuZDogWydkJ11cbiAgfSxcbiAgdToge1xuICAgIGV4dGVuZDogWydkJ10sXG4gICAgaXNVbnNpZ25lZDogdHJ1ZVxuICB9LFxuICBjOiB7XG4gICAgc2V0QXJnOiBmdW5jdGlvbih0b2tlbil7XG4gICAgICBpZighaXNOYU4odG9rZW4uYXJnKSl7XG4gICAgICAgIHZhciBudW0gPSBwYXJzZUludCh0b2tlbi5hcmcpO1xuICAgICAgICBpZihudW0gPCAwIHx8IG51bSA+IDEyNyl7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGNoYXJhY3RlciBjb2RlIHBhc3NlZCB0byAlYyBpbiBwcmludGYnKTtcbiAgICAgICAgfVxuICAgICAgICB0b2tlbi5hcmcgPSBpc05hTihudW0pID8gJycgKyBudW0gOiBTdHJpbmcuZnJvbUNoYXJDb2RlKG51bSk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuICBzOiB7XG4gICAgc2V0TWF4V2lkdGg6IGZ1bmN0aW9uKHRva2VuKXtcbiAgICAgIHRva2VuLm1heFdpZHRoID0gKHRva2VuLnBlcmlvZCA9PSAnLicpID8gdG9rZW4ucHJlY2lzaW9uIDogLTE7XG4gICAgfVxuICB9LFxuICBlOiB7XG4gICAgaXNEb3VibGU6IHRydWUsXG4gICAgZG91YmxlTm90YXRpb246ICdlJ1xuICB9LFxuICBFOiB7XG4gICAgZXh0ZW5kOiBbJ2UnXSxcbiAgICB0b1VwcGVyOiB0cnVlXG4gIH0sXG4gIGY6IHtcbiAgICBpc0RvdWJsZTogdHJ1ZSxcbiAgICBkb3VibGVOb3RhdGlvbjogJ2YnXG4gIH0sXG4gIEY6IHtcbiAgICBleHRlbmQ6IFsnZiddXG4gIH0sXG4gIGc6IHtcbiAgICBpc0RvdWJsZTogdHJ1ZSxcbiAgICBkb3VibGVOb3RhdGlvbjogJ2cnXG4gIH0sXG4gIEc6IHtcbiAgICBleHRlbmQ6IFsnZyddLFxuICAgIHRvVXBwZXI6IHRydWVcbiAgfSxcbiAgTzoge1xuICAgIGlzT2JqZWN0OiB0cnVlXG4gIH0sXG59O1xuRm9ybWF0dGVyLnByb3RvdHlwZS5mb3JtYXQgPSBmdW5jdGlvbigvKm1peGVkLi4uKi8gZmlsbGVyKXtcbiAgaWYodGhpcy5fbWFwcGVkICYmIHR5cGVvZiBmaWxsZXIgIT0gJ29iamVjdCcpe1xuICAgIHRocm93IG5ldyBFcnJvcignZm9ybWF0IHJlcXVpcmVzIGEgbWFwcGluZycpO1xuICB9XG5cbiAgdmFyIHN0ciA9ICcnO1xuICB2YXIgcG9zaXRpb24gPSAwO1xuICBmb3IodmFyIGkgPSAwLCB0b2tlbjsgaSA8IHRoaXMuX3Rva2Vucy5sZW5ndGg7IGkrKyl7XG4gICAgdG9rZW4gPSB0aGlzLl90b2tlbnNbaV07XG4gICAgXG4gICAgaWYodHlwZW9mIHRva2VuID09ICdzdHJpbmcnKXtcbiAgICAgIHN0ciArPSB0b2tlbjtcbiAgICB9ZWxzZXtcbiAgICAgIGlmKHRoaXMuX21hcHBlZCl7XG4gICAgICAgIGlmKHR5cGVvZiBmaWxsZXJbdG9rZW4ubWFwcGluZ10gPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignbWlzc2luZyBrZXkgJyArIHRva2VuLm1hcHBpbmcpO1xuICAgICAgICB9XG4gICAgICAgIHRva2VuLmFyZyA9IGZpbGxlclt0b2tlbi5tYXBwaW5nXTtcbiAgICAgIH1lbHNle1xuICAgICAgICBpZih0b2tlbi5pbnRtYXBwaW5nKXtcbiAgICAgICAgICBwb3NpdGlvbiA9IHBhcnNlSW50KHRva2VuLmludG1hcHBpbmcpIC0gMTtcbiAgICAgICAgfVxuICAgICAgICBpZihwb3NpdGlvbiA+PSBhcmd1bWVudHMubGVuZ3RoKXtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2dvdCAnICsgYXJndW1lbnRzLmxlbmd0aCArICcgcHJpbnRmIGFyZ3VtZW50cywgaW5zdWZmaWNpZW50IGZvciBcXCcnICsgdGhpcy5fZm9ybWF0ICsgJ1xcJycpO1xuICAgICAgICB9XG4gICAgICAgIHRva2VuLmFyZyA9IGFyZ3VtZW50c1twb3NpdGlvbisrXTtcbiAgICAgIH1cblxuICAgICAgaWYoIXRva2VuLmNvbXBpbGVkKXtcbiAgICAgICAgdG9rZW4uY29tcGlsZWQgPSB0cnVlO1xuICAgICAgICB0b2tlbi5zaWduID0gJyc7XG4gICAgICAgIHRva2VuLnplcm9QYWQgPSBmYWxzZTtcbiAgICAgICAgdG9rZW4ucmlnaHRKdXN0aWZ5ID0gZmFsc2U7XG4gICAgICAgIHRva2VuLmFsdGVybmF0aXZlID0gZmFsc2U7XG5cbiAgICAgICAgdmFyIGZsYWdzID0ge307XG4gICAgICAgIGZvcih2YXIgZmkgPSB0b2tlbi5mbGFncy5sZW5ndGg7IGZpLS07KXtcbiAgICAgICAgICB2YXIgZmxhZyA9IHRva2VuLmZsYWdzLmNoYXJBdChmaSk7XG4gICAgICAgICAgZmxhZ3NbZmxhZ10gPSB0cnVlO1xuICAgICAgICAgIHN3aXRjaChmbGFnKXtcbiAgICAgICAgICAgIGNhc2UgJyAnOlxuICAgICAgICAgICAgICB0b2tlbi5zaWduID0gJyAnO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJysnOlxuICAgICAgICAgICAgICB0b2tlbi5zaWduID0gJysnO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJzAnOlxuICAgICAgICAgICAgICB0b2tlbi56ZXJvUGFkID0gKGZsYWdzWyctJ10pID8gZmFsc2UgOiB0cnVlO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJy0nOlxuICAgICAgICAgICAgICB0b2tlbi5yaWdodEp1c3RpZnkgPSB0cnVlO1xuICAgICAgICAgICAgICB0b2tlbi56ZXJvUGFkID0gZmFsc2U7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnIyc6XG4gICAgICAgICAgICAgIHRva2VuLmFsdGVybmF0aXZlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICB0aHJvdyBFcnJvcignYmFkIGZvcm1hdHRpbmcgZmxhZyBcXCcnICsgdG9rZW4uZmxhZ3MuY2hhckF0KGZpKSArICdcXCcnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0b2tlbi5taW5XaWR0aCA9ICh0b2tlbi5fbWluV2lkdGgpID8gcGFyc2VJbnQodG9rZW4uX21pbldpZHRoKSA6IDA7XG4gICAgICAgIHRva2VuLm1heFdpZHRoID0gLTE7XG4gICAgICAgIHRva2VuLnRvVXBwZXIgPSBmYWxzZTtcbiAgICAgICAgdG9rZW4uaXNVbnNpZ25lZCA9IGZhbHNlO1xuICAgICAgICB0b2tlbi5pc0ludCA9IGZhbHNlO1xuICAgICAgICB0b2tlbi5pc0RvdWJsZSA9IGZhbHNlO1xuICAgICAgICB0b2tlbi5pc09iamVjdCA9IGZhbHNlO1xuICAgICAgICB0b2tlbi5wcmVjaXNpb24gPSAxO1xuICAgICAgICBpZih0b2tlbi5wZXJpb2QgPT0gJy4nKXtcbiAgICAgICAgICBpZih0b2tlbi5fcHJlY2lzaW9uKXtcbiAgICAgICAgICAgIHRva2VuLnByZWNpc2lvbiA9IHBhcnNlSW50KHRva2VuLl9wcmVjaXNpb24pO1xuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgdG9rZW4ucHJlY2lzaW9uID0gMDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbWl4aW5zID0gdGhpcy5fc3BlY2lmaWVyc1t0b2tlbi5zcGVjaWZpZXJdO1xuICAgICAgICBpZih0eXBlb2YgbWl4aW5zID09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3VuZXhwZWN0ZWQgc3BlY2lmaWVyIFxcJycgKyB0b2tlbi5zcGVjaWZpZXIgKyAnXFwnJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYobWl4aW5zLmV4dGVuZCl7XG4gICAgICAgICAgdmFyIHMgPSB0aGlzLl9zcGVjaWZpZXJzW21peGlucy5leHRlbmRdO1xuICAgICAgICAgIGZvcih2YXIgayBpbiBzKXtcbiAgICAgICAgICAgIG1peGluc1trXSA9IHNba11cbiAgICAgICAgICB9XG4gICAgICAgICAgZGVsZXRlIG1peGlucy5leHRlbmQ7XG4gICAgICAgIH1cbiAgICAgICAgZm9yKHZhciBsIGluIG1peGlucyl7XG4gICAgICAgICAgdG9rZW5bbF0gPSBtaXhpbnNbbF07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYodHlwZW9mIHRva2VuLnNldEFyZyA9PSAnZnVuY3Rpb24nKXtcbiAgICAgICAgdG9rZW4uc2V0QXJnKHRva2VuKTtcbiAgICAgIH1cblxuICAgICAgaWYodHlwZW9mIHRva2VuLnNldE1heFdpZHRoID09ICdmdW5jdGlvbicpe1xuICAgICAgICB0b2tlbi5zZXRNYXhXaWR0aCh0b2tlbik7XG4gICAgICB9XG5cbiAgICAgIGlmKHRva2VuLl9taW5XaWR0aCA9PSAnKicpe1xuICAgICAgICBpZih0aGlzLl9tYXBwZWQpe1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignKiB3aWR0aCBub3Qgc3VwcG9ydGVkIGluIG1hcHBlZCBmb3JtYXRzJyk7XG4gICAgICAgIH1cbiAgICAgICAgdG9rZW4ubWluV2lkdGggPSBwYXJzZUludChhcmd1bWVudHNbcG9zaXRpb24rK10pO1xuICAgICAgICBpZihpc05hTih0b2tlbi5taW5XaWR0aCkpe1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcigndGhlIGFyZ3VtZW50IGZvciAqIHdpZHRoIGF0IHBvc2l0aW9uICcgKyBwb3NpdGlvbiArICcgaXMgbm90IGEgbnVtYmVyIGluICcgKyB0aGlzLl9mb3JtYXQpO1xuICAgICAgICB9XG4gICAgICAgIC8vIG5lZ2F0aXZlIHdpZHRoIG1lYW5zIHJpZ2h0SnVzdGlmeVxuICAgICAgICBpZiAodG9rZW4ubWluV2lkdGggPCAwKSB7XG4gICAgICAgICAgdG9rZW4ucmlnaHRKdXN0aWZ5ID0gdHJ1ZTtcbiAgICAgICAgICB0b2tlbi5taW5XaWR0aCA9IC10b2tlbi5taW5XaWR0aDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZih0b2tlbi5fcHJlY2lzaW9uID09ICcqJyAmJiB0b2tlbi5wZXJpb2QgPT0gJy4nKXtcbiAgICAgICAgaWYodGhpcy5fbWFwcGVkKXtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJyogcHJlY2lzaW9uIG5vdCBzdXBwb3J0ZWQgaW4gbWFwcGVkIGZvcm1hdHMnKTtcbiAgICAgICAgfVxuICAgICAgICB0b2tlbi5wcmVjaXNpb24gPSBwYXJzZUludChhcmd1bWVudHNbcG9zaXRpb24rK10pO1xuICAgICAgICBpZihpc05hTih0b2tlbi5wcmVjaXNpb24pKXtcbiAgICAgICAgICB0aHJvdyBFcnJvcigndGhlIGFyZ3VtZW50IGZvciAqIHByZWNpc2lvbiBhdCBwb3NpdGlvbiAnICsgcG9zaXRpb24gKyAnIGlzIG5vdCBhIG51bWJlciBpbiAnICsgdGhpcy5fZm9ybWF0KTtcbiAgICAgICAgfVxuICAgICAgICAvLyBuZWdhdGl2ZSBwcmVjaXNpb24gbWVhbnMgdW5zcGVjaWZpZWRcbiAgICAgICAgaWYgKHRva2VuLnByZWNpc2lvbiA8IDApIHtcbiAgICAgICAgICB0b2tlbi5wcmVjaXNpb24gPSAxO1xuICAgICAgICAgIHRva2VuLnBlcmlvZCA9ICcnO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZih0b2tlbi5pc0ludCl7XG4gICAgICAgIC8vIGEgc3BlY2lmaWVkIHByZWNpc2lvbiBtZWFucyBubyB6ZXJvIHBhZGRpbmdcbiAgICAgICAgaWYodG9rZW4ucGVyaW9kID09ICcuJyl7XG4gICAgICAgICAgdG9rZW4uemVyb1BhZCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZm9ybWF0SW50KHRva2VuKTtcbiAgICAgIH1lbHNlIGlmKHRva2VuLmlzRG91YmxlKXtcbiAgICAgICAgaWYodG9rZW4ucGVyaW9kICE9ICcuJyl7XG4gICAgICAgICAgdG9rZW4ucHJlY2lzaW9uID0gNjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmZvcm1hdERvdWJsZSh0b2tlbik7IFxuICAgICAgfWVsc2UgaWYodG9rZW4uaXNPYmplY3Qpe1xuICAgICAgICB0aGlzLmZvcm1hdE9iamVjdCh0b2tlbik7XG4gICAgICB9XG4gICAgICB0aGlzLmZpdEZpZWxkKHRva2VuKTtcblxuICAgICAgc3RyICs9ICcnICsgdG9rZW4uYXJnO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBzdHI7XG59O1xuRm9ybWF0dGVyLnByb3RvdHlwZS5femVyb3MxMCA9ICcwMDAwMDAwMDAwJztcbkZvcm1hdHRlci5wcm90b3R5cGUuX3NwYWNlczEwID0gJyAgICAgICAgICAnO1xuRm9ybWF0dGVyLnByb3RvdHlwZS5mb3JtYXRJbnQgPSBmdW5jdGlvbih0b2tlbikge1xuICB2YXIgaSA9IHBhcnNlSW50KHRva2VuLmFyZyk7XG4gIGlmKCFpc0Zpbml0ZShpKSl7IC8vIGlzTmFOKGYpIHx8IGYgPT0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZIHx8IGYgPT0gTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZKVxuICAgIC8vIGFsbG93IHRoaXMgb25seSBpZiBhcmcgaXMgbnVtYmVyXG4gICAgaWYodHlwZW9mIHRva2VuLmFyZyAhPSAnbnVtYmVyJyl7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2Zvcm1hdCBhcmd1bWVudCBcXCcnICsgdG9rZW4uYXJnICsgJ1xcJyBub3QgYW4gaW50ZWdlcjsgcGFyc2VJbnQgcmV0dXJuZWQgJyArIGkpO1xuICAgIH1cbiAgICAvL3JldHVybiAnJyArIGk7XG4gICAgaSA9IDA7XG4gIH1cblxuICAvLyBpZiBub3QgYmFzZSAxMCwgbWFrZSBuZWdhdGl2ZXMgYmUgcG9zaXRpdmVcbiAgLy8gb3RoZXJ3aXNlLCAoLTEwKS50b1N0cmluZygxNikgaXMgJy1hJyBpbnN0ZWFkIG9mICdmZmZmZmZmNidcbiAgaWYoaSA8IDAgJiYgKHRva2VuLmlzVW5zaWduZWQgfHwgdG9rZW4uYmFzZSAhPSAxMCkpe1xuICAgIGkgPSAweGZmZmZmZmZmICsgaSArIDE7XG4gIH0gXG5cbiAgaWYoaSA8IDApe1xuICAgIHRva2VuLmFyZyA9ICgtIGkpLnRvU3RyaW5nKHRva2VuLmJhc2UpO1xuICAgIHRoaXMuemVyb1BhZCh0b2tlbik7XG4gICAgdG9rZW4uYXJnID0gJy0nICsgdG9rZW4uYXJnO1xuICB9ZWxzZXtcbiAgICB0b2tlbi5hcmcgPSBpLnRvU3RyaW5nKHRva2VuLmJhc2UpO1xuICAgIC8vIG5lZWQgdG8gbWFrZSBzdXJlIHRoYXQgYXJndW1lbnQgMCB3aXRoIHByZWNpc2lvbj09MCBpcyBmb3JtYXR0ZWQgYXMgJydcbiAgICBpZighaSAmJiAhdG9rZW4ucHJlY2lzaW9uKXtcbiAgICAgIHRva2VuLmFyZyA9ICcnO1xuICAgIH1lbHNle1xuICAgICAgdGhpcy56ZXJvUGFkKHRva2VuKTtcbiAgICB9XG4gICAgaWYodG9rZW4uc2lnbil7XG4gICAgICB0b2tlbi5hcmcgPSB0b2tlbi5zaWduICsgdG9rZW4uYXJnO1xuICAgIH1cbiAgfVxuICBpZih0b2tlbi5iYXNlID09IDE2KXtcbiAgICBpZih0b2tlbi5hbHRlcm5hdGl2ZSl7XG4gICAgICB0b2tlbi5hcmcgPSAnMHgnICsgdG9rZW4uYXJnO1xuICAgIH1cbiAgICB0b2tlbi5hcmcgPSB0b2tlbi50b1VwcGVyID8gdG9rZW4uYXJnLnRvVXBwZXJDYXNlKCkgOiB0b2tlbi5hcmcudG9Mb3dlckNhc2UoKTtcbiAgfVxuICBpZih0b2tlbi5iYXNlID09IDgpe1xuICAgIGlmKHRva2VuLmFsdGVybmF0aXZlICYmIHRva2VuLmFyZy5jaGFyQXQoMCkgIT0gJzAnKXtcbiAgICAgIHRva2VuLmFyZyA9ICcwJyArIHRva2VuLmFyZztcbiAgICB9XG4gIH1cbn07XG5Gb3JtYXR0ZXIucHJvdG90eXBlLmZvcm1hdERvdWJsZSA9IGZ1bmN0aW9uKHRva2VuKSB7XG4gIHZhciBmID0gcGFyc2VGbG9hdCh0b2tlbi5hcmcpO1xuICBpZighaXNGaW5pdGUoZikpeyAvLyBpc05hTihmKSB8fCBmID09IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSB8fCBmID09IE51bWJlci5ORUdBVElWRV9JTkZJTklUWSlcbiAgICAvLyBhbGxvdyB0aGlzIG9ubHkgaWYgYXJnIGlzIG51bWJlclxuICAgIGlmKHR5cGVvZiB0b2tlbi5hcmcgIT0gJ251bWJlcicpe1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdmb3JtYXQgYXJndW1lbnQgXFwnJyArIHRva2VuLmFyZyArICdcXCcgbm90IGEgZmxvYXQ7IHBhcnNlRmxvYXQgcmV0dXJuZWQgJyArIGYpO1xuICAgIH1cbiAgICAvLyBDOTkgc2F5cyB0aGF0IGZvciAnZic6XG4gICAgLy8gICBpbmZpbml0eSAtPiAnWy1daW5mJyBvciAnWy1daW5maW5pdHknICgnWy1dSU5GJyBvciAnWy1dSU5GSU5JVFknIGZvciAnRicpXG4gICAgLy8gICBOYU4gLT4gYSBzdHJpbmcgIHN0YXJ0aW5nIHdpdGggJ25hbicgKCdOQU4nIGZvciAnRicpXG4gICAgLy8gdGhpcyBpcyBub3QgY29tbW9ubHkgaW1wbGVtZW50ZWQgdGhvdWdoLlxuICAgIC8vcmV0dXJuICcnICsgZjtcbiAgICBmID0gMDtcbiAgfVxuXG4gIHN3aXRjaCh0b2tlbi5kb3VibGVOb3RhdGlvbikge1xuICAgIGNhc2UgJ2UnOiB7XG4gICAgICB0b2tlbi5hcmcgPSBmLnRvRXhwb25lbnRpYWwodG9rZW4ucHJlY2lzaW9uKTsgXG4gICAgICBicmVhaztcbiAgICB9XG4gICAgY2FzZSAnZic6IHtcbiAgICAgIHRva2VuLmFyZyA9IGYudG9GaXhlZCh0b2tlbi5wcmVjaXNpb24pOyBcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBjYXNlICdnJzoge1xuICAgICAgLy8gQyBzYXlzIHVzZSAnZScgbm90YXRpb24gaWYgZXhwb25lbnQgaXMgPCAtNCBvciBpcyA+PSBwcmVjXG4gICAgICAvLyBFQ01BU2NyaXB0IGZvciB0b1ByZWNpc2lvbiBzYXlzIHVzZSBleHBvbmVudGlhbCBub3RhdGlvbiBpZiBleHBvbmVudCBpcyA+PSBwcmVjLFxuICAgICAgLy8gdGhvdWdoIHN0ZXAgMTcgb2YgdG9QcmVjaXNpb24gaW5kaWNhdGVzIGEgdGVzdCBmb3IgPCAtNiB0byBmb3JjZSBleHBvbmVudGlhbC5cbiAgICAgIGlmKE1hdGguYWJzKGYpIDwgMC4wMDAxKXtcbiAgICAgICAgLy9wcmludCgnZm9yY2luZyBleHBvbmVudGlhbCBub3RhdGlvbiBmb3IgZj0nICsgZik7XG4gICAgICAgIHRva2VuLmFyZyA9IGYudG9FeHBvbmVudGlhbCh0b2tlbi5wcmVjaXNpb24gPiAwID8gdG9rZW4ucHJlY2lzaW9uIC0gMSA6IHRva2VuLnByZWNpc2lvbik7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgdG9rZW4uYXJnID0gZi50b1ByZWNpc2lvbih0b2tlbi5wcmVjaXNpb24pOyBcbiAgICAgIH1cblxuICAgICAgLy8gSW4gQywgdW5saWtlICdmJywgJ2dHJyByZW1vdmVzIHRyYWlsaW5nIDBzIGZyb20gZnJhY3Rpb25hbCBwYXJ0LCB1bmxlc3MgYWx0ZXJuYXRpdmUgZm9ybWF0IGZsYWcgKCcjJykuXG4gICAgICAvLyBCdXQgRUNNQVNjcmlwdCBmb3JtYXRzIHRvUHJlY2lzaW9uIGFzIDAuMDAxMDAwMDAuIFNvIHJlbW92ZSB0cmFpbGluZyAwcy5cbiAgICAgIGlmKCF0b2tlbi5hbHRlcm5hdGl2ZSl7IFxuICAgICAgICAvL3ByaW50KCdyZXBsYWNpbmcgdHJhaWxpbmcgMCBpbiBcXCcnICsgcyArICdcXCcnKTtcbiAgICAgICAgdG9rZW4uYXJnID0gdG9rZW4uYXJnLnJlcGxhY2UoLyhcXC4uKlteMF0pMCplLywgJyQxZScpO1xuICAgICAgICAvLyBpZiBmcmFjdGlvbmFsIHBhcnQgaXMgZW50aXJlbHkgMCwgcmVtb3ZlIGl0IGFuZCBkZWNpbWFsIHBvaW50XG4gICAgICAgIHRva2VuLmFyZyA9IHRva2VuLmFyZy5yZXBsYWNlKC9cXC4wKmUvLCAnZScpLnJlcGxhY2UoL1xcLjAkLywnJyk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKCd1bmV4cGVjdGVkIGRvdWJsZSBub3RhdGlvbiBcXCcnICsgdG9rZW4uZG91YmxlTm90YXRpb24gKyAnXFwnJyk7XG4gIH1cblxuICAvLyBDIHNheXMgdGhhdCBleHBvbmVudCBtdXN0IGhhdmUgYXQgbGVhc3QgdHdvIGRpZ2l0cy5cbiAgLy8gQnV0IEVDTUFTY3JpcHQgZG9lcyBub3Q7IHRvRXhwb25lbnRpYWwgcmVzdWx0cyBpbiB0aGluZ3MgbGlrZSAnMS4wMDAwMDBlLTgnIGFuZCAnMS4wMDAwMDBlKzgnLlxuICAvLyBOb3RlIHRoYXQgcy5yZXBsYWNlKC9lKFtcXCtcXC1dKShcXGQpLywgJ2UkMTAkMicpIHdvbid0IHdvcmsgYmVjYXVzZSBvZiB0aGUgJyQxMCcgaW5zdGVhZCBvZiAnJDEnLlxuICAvLyBBbmQgcmVwbGFjZShyZSwgZnVuYykgaXNuJ3Qgc3VwcG9ydGVkIG9uIElFNTAgb3IgU2FmYXJpMS5cbiAgdG9rZW4uYXJnID0gdG9rZW4uYXJnLnJlcGxhY2UoL2VcXCsoXFxkKSQvLCAnZSswJDEnKS5yZXBsYWNlKC9lXFwtKFxcZCkkLywgJ2UtMCQxJyk7XG5cbiAgLy8gaWYgYWx0LCBlbnN1cmUgYSBkZWNpbWFsIHBvaW50XG4gIGlmKHRva2VuLmFsdGVybmF0aXZlKXtcbiAgICB0b2tlbi5hcmcgPSB0b2tlbi5hcmcucmVwbGFjZSgvXihcXGQrKSQvLCckMS4nKTtcbiAgICB0b2tlbi5hcmcgPSB0b2tlbi5hcmcucmVwbGFjZSgvXihcXGQrKWUvLCckMS5lJyk7XG4gIH1cblxuICBpZihmID49IDAgJiYgdG9rZW4uc2lnbil7XG4gICAgdG9rZW4uYXJnID0gdG9rZW4uc2lnbiArIHRva2VuLmFyZztcbiAgfVxuXG4gIHRva2VuLmFyZyA9IHRva2VuLnRvVXBwZXIgPyB0b2tlbi5hcmcudG9VcHBlckNhc2UoKSA6IHRva2VuLmFyZy50b0xvd2VyQ2FzZSgpO1xufTtcbkZvcm1hdHRlci5wcm90b3R5cGUuZm9ybWF0T2JqZWN0ID0gZnVuY3Rpb24odG9rZW4pIHtcbiAgLy8gSWYgbm8gcHJlY2lzaW9uIGlzIHNwZWNpZmllZCwgdGhlbiByZXNldCBpdCB0byBudWxsIChpbmZpbml0ZSBkZXB0aCkuXG4gIHZhciBwcmVjaXNpb24gPSAodG9rZW4ucGVyaW9kID09PSAnLicpID8gdG9rZW4ucHJlY2lzaW9uIDogbnVsbDtcbiAgdG9rZW4uYXJnID0gdXRpbC5pbnNwZWN0KHRva2VuLmFyZywgIXRva2VuLmFsdGVybmF0aXZlLCBwcmVjaXNpb24pO1xufTtcbkZvcm1hdHRlci5wcm90b3R5cGUuemVyb1BhZCA9IGZ1bmN0aW9uKHRva2VuLCAvKkludCovIGxlbmd0aCkge1xuICBsZW5ndGggPSAoYXJndW1lbnRzLmxlbmd0aCA9PSAyKSA/IGxlbmd0aCA6IHRva2VuLnByZWNpc2lvbjtcbiAgdmFyIG5lZ2F0aXZlID0gZmFsc2U7XG4gIGlmKHR5cGVvZiB0b2tlbi5hcmcgIT0gXCJzdHJpbmdcIil7XG4gICAgdG9rZW4uYXJnID0gXCJcIiArIHRva2VuLmFyZztcbiAgfVxuICBpZiAodG9rZW4uYXJnLnN1YnN0cigwLDEpID09PSAnLScpIHtcbiAgICBuZWdhdGl2ZSA9IHRydWU7XG4gICAgdG9rZW4uYXJnID0gdG9rZW4uYXJnLnN1YnN0cigxKTtcbiAgfVxuXG4gIHZhciB0ZW5sZXNzID0gbGVuZ3RoIC0gMTA7XG4gIHdoaWxlKHRva2VuLmFyZy5sZW5ndGggPCB0ZW5sZXNzKXtcbiAgICB0b2tlbi5hcmcgPSAodG9rZW4ucmlnaHRKdXN0aWZ5KSA/IHRva2VuLmFyZyArIHRoaXMuX3plcm9zMTAgOiB0aGlzLl96ZXJvczEwICsgdG9rZW4uYXJnO1xuICB9XG4gIHZhciBwYWQgPSBsZW5ndGggLSB0b2tlbi5hcmcubGVuZ3RoO1xuICB0b2tlbi5hcmcgPSAodG9rZW4ucmlnaHRKdXN0aWZ5KSA/IHRva2VuLmFyZyArIHRoaXMuX3plcm9zMTAuc3Vic3RyaW5nKDAsIHBhZCkgOiB0aGlzLl96ZXJvczEwLnN1YnN0cmluZygwLCBwYWQpICsgdG9rZW4uYXJnO1xuICBpZiAobmVnYXRpdmUpIHRva2VuLmFyZyA9ICctJyArIHRva2VuLmFyZztcbn07XG5Gb3JtYXR0ZXIucHJvdG90eXBlLmZpdEZpZWxkID0gZnVuY3Rpb24odG9rZW4pIHtcbiAgaWYodG9rZW4ubWF4V2lkdGggPj0gMCAmJiB0b2tlbi5hcmcubGVuZ3RoID4gdG9rZW4ubWF4V2lkdGgpe1xuICAgIHJldHVybiB0b2tlbi5hcmcuc3Vic3RyaW5nKDAsIHRva2VuLm1heFdpZHRoKTtcbiAgfVxuICBpZih0b2tlbi56ZXJvUGFkKXtcbiAgICB0aGlzLnplcm9QYWQodG9rZW4sIHRva2VuLm1pbldpZHRoKTtcbiAgICByZXR1cm47XG4gIH1cbiAgdGhpcy5zcGFjZVBhZCh0b2tlbik7XG59O1xuRm9ybWF0dGVyLnByb3RvdHlwZS5zcGFjZVBhZCA9IGZ1bmN0aW9uKHRva2VuLCAvKkludCovIGxlbmd0aCkge1xuICBsZW5ndGggPSAoYXJndW1lbnRzLmxlbmd0aCA9PSAyKSA/IGxlbmd0aCA6IHRva2VuLm1pbldpZHRoO1xuICBpZih0eXBlb2YgdG9rZW4uYXJnICE9ICdzdHJpbmcnKXtcbiAgICB0b2tlbi5hcmcgPSAnJyArIHRva2VuLmFyZztcbiAgfVxuICB2YXIgdGVubGVzcyA9IGxlbmd0aCAtIDEwO1xuICB3aGlsZSh0b2tlbi5hcmcubGVuZ3RoIDwgdGVubGVzcyl7XG4gICAgdG9rZW4uYXJnID0gKHRva2VuLnJpZ2h0SnVzdGlmeSkgPyB0b2tlbi5hcmcgKyB0aGlzLl9zcGFjZXMxMCA6IHRoaXMuX3NwYWNlczEwICsgdG9rZW4uYXJnO1xuICB9XG4gIHZhciBwYWQgPSBsZW5ndGggLSB0b2tlbi5hcmcubGVuZ3RoO1xuICB0b2tlbi5hcmcgPSAodG9rZW4ucmlnaHRKdXN0aWZ5KSA/IHRva2VuLmFyZyArIHRoaXMuX3NwYWNlczEwLnN1YnN0cmluZygwLCBwYWQpIDogdGhpcy5fc3BhY2VzMTAuc3Vic3RyaW5nKDAsIHBhZCkgKyB0b2tlbi5hcmc7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKXtcbiAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpLFxuICAgIHN0cmVhbSwgZm9ybWF0O1xuICBpZihhcmdzWzBdIGluc3RhbmNlb2YgcmVxdWlyZSgnc3RyZWFtJykuU3RyZWFtKXtcbiAgICBzdHJlYW0gPSBhcmdzLnNoaWZ0KCk7XG4gIH1cbiAgZm9ybWF0ID0gYXJncy5zaGlmdCgpO1xuICB2YXIgZm9ybWF0dGVyID0gbmV3IEZvcm1hdHRlcihmb3JtYXQpO1xuICB2YXIgc3RyaW5nID0gZm9ybWF0dGVyLmZvcm1hdC5hcHBseShmb3JtYXR0ZXIsIGFyZ3MpO1xuICBpZihzdHJlYW0pe1xuICAgIHN0cmVhbS53cml0ZShzdHJpbmcpO1xuICB9ZWxzZXtcbiAgICByZXR1cm4gc3RyaW5nO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5Gb3JtYXR0ZXIgPSBGb3JtYXR0ZXI7XG5cbiIsIi8qKlxuICogQ29weXJpZ2h0IDIwMTMtMjAxNSwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgQlNELXN0eWxlIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuIEFuIGFkZGl0aW9uYWwgZ3JhbnRcbiAqIG9mIHBhdGVudCByaWdodHMgY2FuIGJlIGZvdW5kIGluIHRoZSBQQVRFTlRTIGZpbGUgaW4gdGhlIHNhbWUgZGlyZWN0b3J5LlxuICpcbiAqIEBwcm92aWRlc01vZHVsZSBpbnZhcmlhbnRcbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuLyoqXG4gKiBVc2UgaW52YXJpYW50KCkgdG8gYXNzZXJ0IHN0YXRlIHdoaWNoIHlvdXIgcHJvZ3JhbSBhc3N1bWVzIHRvIGJlIHRydWUuXG4gKlxuICogUHJvdmlkZSBzcHJpbnRmLXN0eWxlIGZvcm1hdCAob25seSAlcyBpcyBzdXBwb3J0ZWQpIGFuZCBhcmd1bWVudHNcbiAqIHRvIHByb3ZpZGUgaW5mb3JtYXRpb24gYWJvdXQgd2hhdCBicm9rZSBhbmQgd2hhdCB5b3Ugd2VyZVxuICogZXhwZWN0aW5nLlxuICpcbiAqIFRoZSBpbnZhcmlhbnQgbWVzc2FnZSB3aWxsIGJlIHN0cmlwcGVkIGluIHByb2R1Y3Rpb24sIGJ1dCB0aGUgaW52YXJpYW50XG4gKiB3aWxsIHJlbWFpbiB0byBlbnN1cmUgbG9naWMgZG9lcyBub3QgZGlmZmVyIGluIHByb2R1Y3Rpb24uXG4gKi9cblxudmFyIGludmFyaWFudCA9IGZ1bmN0aW9uKGNvbmRpdGlvbiwgZm9ybWF0LCBhLCBiLCBjLCBkLCBlLCBmKSB7XG4gIGlmIChcInByb2R1Y3Rpb25cIiAhPT0gcHJvY2Vzcy5lbnYuTk9ERV9FTlYpIHtcbiAgICBpZiAoZm9ybWF0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignaW52YXJpYW50IHJlcXVpcmVzIGFuIGVycm9yIG1lc3NhZ2UgYXJndW1lbnQnKTtcbiAgICB9XG4gIH1cblxuICBpZiAoIWNvbmRpdGlvbikge1xuICAgIHZhciBlcnJvcjtcbiAgICBpZiAoZm9ybWF0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGVycm9yID0gbmV3IEVycm9yKFxuICAgICAgICAnTWluaWZpZWQgZXhjZXB0aW9uIG9jY3VycmVkOyB1c2UgdGhlIG5vbi1taW5pZmllZCBkZXYgZW52aXJvbm1lbnQgJyArXG4gICAgICAgICdmb3IgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZSBhbmQgYWRkaXRpb25hbCBoZWxwZnVsIHdhcm5pbmdzLidcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBhcmdzID0gW2EsIGIsIGMsIGQsIGUsIGZdO1xuICAgICAgdmFyIGFyZ0luZGV4ID0gMDtcbiAgICAgIGVycm9yID0gbmV3IEVycm9yKFxuICAgICAgICAnSW52YXJpYW50IFZpb2xhdGlvbjogJyArXG4gICAgICAgIGZvcm1hdC5yZXBsYWNlKC8lcy9nLCBmdW5jdGlvbigpIHsgcmV0dXJuIGFyZ3NbYXJnSW5kZXgrK107IH0pXG4gICAgICApO1xuICAgIH1cblxuICAgIGVycm9yLmZyYW1lc1RvUG9wID0gMTsgLy8gd2UgZG9uJ3QgY2FyZSBhYm91dCBpbnZhcmlhbnQncyBvd24gZnJhbWVcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBpbnZhcmlhbnQ7XG4iLCIvKipcbiAqIENvcHlyaWdodCAyMDEzLTIwMTUsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIEJTRC1zdHlsZSBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLiBBbiBhZGRpdGlvbmFsIGdyYW50XG4gKiBvZiBwYXRlbnQgcmlnaHRzIGNhbiBiZSBmb3VuZCBpbiB0aGUgUEFURU5UUyBmaWxlIGluIHRoZSBzYW1lIGRpcmVjdG9yeS5cbiAqXG4gKiBAcHJvdmlkZXNNb2R1bGUga2V5TWlycm9yXG4gKiBAdHlwZWNoZWNrcyBzdGF0aWMtb25seVxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGludmFyaWFudCA9IHJlcXVpcmUoXCIuL2ludmFyaWFudFwiKTtcblxuLyoqXG4gKiBDb25zdHJ1Y3RzIGFuIGVudW1lcmF0aW9uIHdpdGgga2V5cyBlcXVhbCB0byB0aGVpciB2YWx1ZS5cbiAqXG4gKiBGb3IgZXhhbXBsZTpcbiAqXG4gKiAgIHZhciBDT0xPUlMgPSBrZXlNaXJyb3Ioe2JsdWU6IG51bGwsIHJlZDogbnVsbH0pO1xuICogICB2YXIgbXlDb2xvciA9IENPTE9SUy5ibHVlO1xuICogICB2YXIgaXNDb2xvclZhbGlkID0gISFDT0xPUlNbbXlDb2xvcl07XG4gKlxuICogVGhlIGxhc3QgbGluZSBjb3VsZCBub3QgYmUgcGVyZm9ybWVkIGlmIHRoZSB2YWx1ZXMgb2YgdGhlIGdlbmVyYXRlZCBlbnVtIHdlcmVcbiAqIG5vdCBlcXVhbCB0byB0aGVpciBrZXlzLlxuICpcbiAqICAgSW5wdXQ6ICB7a2V5MTogdmFsMSwga2V5MjogdmFsMn1cbiAqICAgT3V0cHV0OiB7a2V5MToga2V5MSwga2V5Mjoga2V5Mn1cbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtvYmplY3R9XG4gKi9cbnZhciBrZXlNaXJyb3IgPSBmdW5jdGlvbihvYmopIHtcbiAgdmFyIHJldCA9IHt9O1xuICB2YXIga2V5O1xuICAoXCJwcm9kdWN0aW9uXCIgIT09IHByb2Nlc3MuZW52Lk5PREVfRU5WID8gaW52YXJpYW50KFxuICAgIG9iaiBpbnN0YW5jZW9mIE9iamVjdCAmJiAhQXJyYXkuaXNBcnJheShvYmopLFxuICAgICdrZXlNaXJyb3IoLi4uKTogQXJndW1lbnQgbXVzdCBiZSBhbiBvYmplY3QuJ1xuICApIDogaW52YXJpYW50KG9iaiBpbnN0YW5jZW9mIE9iamVjdCAmJiAhQXJyYXkuaXNBcnJheShvYmopKSk7XG4gIGZvciAoa2V5IGluIG9iaikge1xuICAgIGlmICghb2JqLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICByZXRba2V5XSA9IGtleTtcbiAgfVxuICByZXR1cm4gcmV0O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBrZXlNaXJyb3I7XG4iLCJjb25zdCBrZXlNaXJyb3IgPSByZXF1aXJlKCdyZWFjdC9saWIva2V5TWlycm9yJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ga2V5TWlycm9yKHtcbiAgICBNSVNTSU9OX1NUQVJURUQgOiBudWxsLFxuICAgIE1JU1NJT05fU1RPUFBFRCA6IG51bGwsXG4gICAgTUlTU0lPTl9SRVNFVCA6IG51bGwsXG4gICAgTUlTU0lPTl9DT01QTEVURUQgOiBudWxsLFxuXG4gICAgQUREX01FU1NBR0UgOiBudWxsLFxuXG4gICAgLy9BQ1RJT05TXG4gICAgR0VUX0VWRU5UUyA6IG51bGwsXG4gICAgU0VUX0VWRU5UUyA6IG51bGwsXG5cbiAgICAvLyBTQ0lFTkNFIFRFQU0gRVZFTlRTXG4gICAgU0NJRU5DRV9DSEVDS19SQURJQVRJT04gOiBudWxsLFxuXG4gICAgLy8gQVNUUk9OQVVUIFRFQU0gRVZFTlRTXG4gICAgQVNUX0NIRUNLX1ZJVEFMUyA6IG51bGwsXG5cbiAgICAvLyBDT01NVU5JQ0FUSU9OIFRFQU0gRVZFTlRTXG4gICAgQ09NTV9JTkZPUk1fQVNUUk9OQVVUIDogbnVsbCxcblxuICAgIC8vIFNFQ1VSSVRZIFRFQU0gRVZFTlRTXG59KTtcbiJdfQ==
