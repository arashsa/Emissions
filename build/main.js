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
        //AppDispatcher.dispatch({action: MissionConstants.MISSION_COMPLETED_EVENT});
        router.transitionTo('/completed');
    },

    completeMission: function completeMission() {
        serverAPI().completeMission();
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

    askToStartNextChapter: function askToStartNextChapter() {
        serverAPI().askToStartNextChapter();
    },

    askToTriggerEvent: function askToTriggerEvent(uuid) {
        serverAPI().triggerEvent(uuid);
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

        socket.on(EventConstants.MISSION_STARTED, function (appState) {
            MissionActionCreators.missionStarted();
            _this._appStateReceived(appState);
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

        socket.on(EventConstants.APP_STATE, function (state) {
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

    askToStartNextChapter: function askToStartNextChapter() {
        socket.emit(EventConstants.ADVANCE_CHAPTER);
    },

    triggerEvent: function triggerEvent(uuid) {
        socket.emit(EventConstants.TRIGGER_EVENT, uuid);
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

    completeMission: function completeMission() {
        socket.emit(EventConstants.COMPLETE_MISSION);
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
    //setTimeout(() => {
    //MissionActionCreators.startMission();
    //}, 300);

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
var Link = (typeof window !== "undefined" ? window.ReactRouter : typeof global !== "undefined" ? global.ReactRouter : null).Link;
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

var EventTable = React.createClass({
    displayName: 'EventTable',

    propTypes: {
        events: React.PropTypes.array.isRequired
    },

    render: function render() {
        return React.createElement(
            'table',
            { className: 'table' },
            React.createElement(
                'thead',
                null,
                React.createElement(
                    'tr',
                    null,
                    React.createElement(
                        'th',
                        null,
                        'Time'
                    ),
                    React.createElement(
                        'th',
                        null,
                        'Description'
                    ),
                    React.createElement(
                        'th',
                        null,
                        'Value'
                    ),
                    React.createElement(
                        'th',
                        null,
                        'Trigger'
                    )
                )
            ),
            React.createElement(
                'tbody',
                null,
                this.props.events.map(function (ev) {
                    return React.createElement(
                        'tr',
                        { key: ev.id },
                        React.createElement(
                            'td',
                            null,
                            ev.triggerTime
                        ),
                        React.createElement(
                            'td',
                            null,
                            ev.short_description
                        ),
                        React.createElement(
                            'td',
                            null,
                            JSON.stringify(ev.value || '')
                        ),
                        React.createElement(
                            'td',
                            null,
                            React.createElement(
                                'button',
                                { className: 'btn btn-primary',
                                    onClick: function () {
                                        return getMissionAC().askToTriggerEvent(ev.id);
                                    }
                                },
                                'Trigger'
                            )
                        )
                    );
                })
            )
        );
    }
});

var App = React.createClass({
    displayName: 'App',

    componentWillMount: function componentWillMount() {
        var ac = getMissionAC();
        ac.askForEvents();

        EventStore.addChangeListener(this._onChange);
        MissionStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function componentWillUnmount() {
        EventStore.removeChangeListener(this._onChange);
        MissionStore.removeChangeListener(this._onChange);
    },

    getInitialState: function getInitialState() {
        return {
            completedEvents: [],
            overdueEvents: [],
            remainingEvents: [],
            running: MissionStore.isMissionRunning(),
            chapter: MissionStore.currentChapter()
        };
    },

    _onChange: function _onChange() {
        this.setState({
            completedEvents: EventStore.completed(),
            overdueEvents: EventStore.overdue(),
            remainingEvents: EventStore.remaining(),
            running: MissionStore.isMissionRunning(),
            chapter: MissionStore.currentChapter()
        });
    },

    render: function render() {

        var status;

        if (!this.state.running) {
            status = React.createElement(
                'p',
                { id: 'missionTime' },
                'Oppdraget har ikke startet'
            );
        }

        return React.createElement(
            'div',
            null,
            React.createElement(
                'div',
                null,
                React.createElement(
                    'h3',
                    null,
                    'Status'
                ),
                status,
                React.createElement(
                    'dl',
                    null,
                    React.createElement(
                        'dt',
                        null,
                        'Nåværende kapittel:'
                    ),
                    React.createElement(
                        'dd',
                        null,
                        this.state.chapter
                    ),
                    React.createElement(
                        'dt',
                        null,
                        'Tid brukt i kapittel'
                    ),
                    React.createElement(
                        'dd',
                        null,
                        React.createElement(MissionTimer, null)
                    )
                )
            ),
            React.createElement(
                'div',
                null,
                React.createElement(
                    'button',
                    { className: 'btn btn-primary', onClick: getMissionAC().startMission },
                    'Start oppdrag'
                ),
                React.createElement(
                    'button',
                    { className: 'btn btn-primary', onClick: getMissionAC().stopMission },
                    'Stop'
                ),
                React.createElement(
                    'button',
                    { className: 'btn btn-primary', onClick: getMissionAC().askToStartNextChapter },
                    'Neste kapittel'
                ),
                React.createElement(
                    'button',
                    { className: 'btn btn-primary', onClick: getMissionAC().resetMission },
                    'Begynn på nytt'
                )
            ),
            React.createElement(
                'button',
                { className: 'btn btn-primary', onClick: getMissionAC().completeMission },
                'Oppdrag utført'
            ),
            React.createElement(
                'h2',
                null,
                'Chapter events'
            ),
            React.createElement(
                'h3',
                null,
                'remaining'
            ),
            React.createElement(EventTable, { key: 'foo', events: this.state.remainingEvents }),
            React.createElement(
                'h3',
                null,
                'overdue'
            ),
            React.createElement(EventTable, { events: this.state.overdueEvents }),
            React.createElement(
                'h3',
                null,
                'completed'
            ),
            React.createElement(EventTable, { events: this.state.completedEvents })
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

},{}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/full-screen-video.js":[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);

var player;
function onYouTubeIframeAPIReady() {
    console.log('onYouTubeIframeAPIReady');
    player = new YT.Player('player', {
        events: {
            onReady: onPlayerReady
        }
    });
}

function playVideo() {
    player.seekTo(96);
    player.playVideo();

    // stop video after ten seconds
    setTimeout(function () {
        player.stopVideo(player);
        playVideo();
    }, 10000);
}

function onPlayerReady(event) {
    //event.target.mute();
    player.mute();
    playVideo();
}

window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

module.exports = React.createClass({
    displayName: 'exports',

    /* https://developers.google.com/youtube/iframe_api_reference#Getting_Started */
    componentDidMount: function componentDidMount() {
        console.log('componentDidMount');
        var tag = document.createElement('script');

        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
    },

    render: function render() {
        var rickRolled = 'http://www.youtube.com/embed/oHg5SJYRHA0?autoplay=1';
        var origin = location.protocol + '//' + location.host;
        var solarStorm = 'http://www.youtube.com/embed/DU4hpsistDk?&start=96&enablejsapi=1&origin=' + origin;
        var video = solarStorm;

        //return <div />
        return React.createElement('iframe', { id: 'player',
            style: { position: 'absolute', top: 0, right: 0, width: '100%', height: '100%' },
            src: video,
            frameBorder: '0', allowFullScreen: true });
    }

});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

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
        return React.createElement(Timer, { className: this.props.className, timeInSeconds: this.state.elapsed });
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

        var el = React.findDOMNode(this.refs['add-to-total']);
        var val = el.value.trim();
        if (!val.length) {
            return;
        }var number = utils.parseNumber(val);

        if (!isNaN(number)) {
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
                            React.createElement(
                                'select',
                                { ref: 'add-to-total', className: 'radiation-input__input' },
                                React.createElement(
                                    'option',
                                    { value: '0' },
                                    '0'
                                ),
                                React.createElement(
                                    'option',
                                    { value: '15' },
                                    '15'
                                ),
                                React.createElement(
                                    'option',
                                    { value: '50' },
                                    '50'
                                )
                            ),
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
            { className: 'timer-value' },
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
var SolarStorm = require('./components/full-screen-video.js');
var Task = require('./components/task.react');
var DummyRenderMixin = require('./components/dummy-render.mixin');

var _require = require('./utils');

var cleanRootPath = _require.cleanRootPath;

var teamNameMap = require('./team-name-map');

var RedirectToIntro = React.createClass({
    displayName: 'RedirectToIntro',

    statics: {
        willTransitionTo: function willTransitionTo(transition) {
            var teamId = cleanRootPath(transition.path);

            if (teamId in teamNameMap.nameMap) {
                transition.redirect(transition.path + '/intro');
            }
        }
    },

    //mixins : [DummyRenderMixin]
    render: function render() {
        console.log('skal ikke rendres');
        return React.createElement(NotFound, null);
    }
});

var routes = React.createElement(
    Route,
    { name: 'app', path: '/', handler: App },
    React.createElement(Route, { name: 'job-completed', path: '/completed', handler: SolarStorm }),
    React.createElement(Route, { name: 'commander', handler: MissionCommanderApp }),
    React.createElement(Route, { name: 'team-root', path: '/:teamId', handler: RedirectToIntro }),
    React.createElement(Route, { name: 'team-intro', path: '/:teamId/intro', handler: IntroScreen }),
    React.createElement(Route, { name: 'team-task', path: '/:teamId/task/:taskId', handler: Task }),
    React.createElement(NotFoundRoute, { handler: NotFound }),
    React.createElement(DefaultRoute, { handler: IndexApp })
);

module.exports = routes;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./components/app.react":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/app.react.js","./components/commander-app.react":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/commander-app.react.js","./components/dummy-render.mixin":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/dummy-render.mixin.js","./components/full-screen-video.js":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/full-screen-video.js","./components/index-app.react":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/index-app.react.js","./components/introduction-screen.react":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/introduction-screen.react.js","./components/not-found.react":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/not-found.react.js","./components/task.react":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/task.react.js","./team-name-map":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/team-name-map.js","./utils":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/utils.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/base-store.js":[function(require,module,exports){
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
var currentChapter = null;

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

    currentChapter: (function (_currentChapter) {
        function currentChapter() {
            return _currentChapter.apply(this, arguments);
        }

        currentChapter.toString = function () {
            return _currentChapter.toString();
        };

        return currentChapter;
    })(function () {
        return currentChapter;
    }),

    dispatcherIndex: AppDispatcher.register(function (payload) {
        var action = payload.action;

        switch (action) {
            case MISSION_STARTED_EVENT:
                return MissionStateStore.handleMissionStarted();

            case MISSION_STOPPED_EVENT:
                return MissionStateStore.handleMissionStopped();

            case RECEIVED_APP_STATE:
                var appState = payload.appState;
                missionRunning = appState.mission_running;
                currentChapter = appState.current_chapter;
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
    commander: 'operasjonsleder',
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
    APP_STATE: null,

    ADD_MESSAGE: null,

    //ACTIONS
    GET_EVENTS: null,
    SET_EVENTS: null,
    TRIGGER_EVENT: null,
    ADVANCE_CHAPTER: null,
    COMPLETE_MISSION: null,

    // SCIENCE TEAM EVENTS
    SCIENCE_CHECK_RADIATION: null,

    // ASTRONAUT TEAM EVENTS
    AST_CHECK_VITALS: null,

    // COMMUNICATION TEAM EVENTS
    COMM_INFORM_ASTRONAUT: null

    // SECURITY TEAM EVENTS
});

},{"react/lib/keyMirror":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/react/lib/keyMirror.js"}]},{},["./app/main.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvY2FybC1lcmlrLmtvcHNlbmcvZGV2X3ByaXYvRW1pc3Npb25zL2FwcC9tYWluLmpzIiwiL1VzZXJzL2NhcmwtZXJpay5rb3BzZW5nL2Rldl9wcml2L0VtaXNzaW9ucy9hcHAvYWN0aW9ucy9NZXNzYWdlQWN0aW9uQ3JlYXRvcnMuanMiLCIvVXNlcnMvY2FybC1lcmlrLmtvcHNlbmcvZGV2X3ByaXYvRW1pc3Npb25zL2FwcC9hY3Rpb25zL01pc3Npb25BY3Rpb25DcmVhdG9ycy5qcyIsIi9Vc2Vycy9jYXJsLWVyaWsua29wc2VuZy9kZXZfcHJpdi9FbWlzc2lvbnMvYXBwL2FjdGlvbnMvU2NpZW5jZUFjdGlvbkNyZWF0b3JzLmpzIiwiL1VzZXJzL2NhcmwtZXJpay5rb3BzZW5nL2Rldl9wcml2L0VtaXNzaW9ucy9hcHAvYWN0aW9ucy9UaW1lckFjdGlvbkNyZWF0b3JzLmpzIiwiL1VzZXJzL2NhcmwtZXJpay5rb3BzZW5nL2Rldl9wcml2L0VtaXNzaW9ucy9hcHAvYXBwZGlzcGF0Y2hlci5qcyIsIi9Vc2Vycy9jYXJsLWVyaWsua29wc2VuZy9kZXZfcHJpdi9FbWlzc2lvbnMvYXBwL2NsaWVudC1hcGkuanMiLCIvVXNlcnMvY2FybC1lcmlrLmtvcHNlbmcvZGV2X3ByaXYvRW1pc3Npb25zL2FwcC9jbGllbnQtYm9vdHN0cmFwLmpzIiwiL1VzZXJzL2NhcmwtZXJpay5rb3BzZW5nL2Rldl9wcml2L0VtaXNzaW9ucy9hcHAvY29tcG9uZW50cy9hcHAucmVhY3QuanMiLCIvVXNlcnMvY2FybC1lcmlrLmtvcHNlbmcvZGV2X3ByaXYvRW1pc3Npb25zL2FwcC9jb21wb25lbnRzL2NvbW1hbmRlci1hcHAucmVhY3QuanMiLCIvVXNlcnMvY2FybC1lcmlrLmtvcHNlbmcvZGV2X3ByaXYvRW1pc3Npb25zL2FwcC9jb21wb25lbnRzL2RpYWxvZ3MucmVhY3QuanMiLCIvVXNlcnMvY2FybC1lcmlrLmtvcHNlbmcvZGV2X3ByaXYvRW1pc3Npb25zL2FwcC9jb21wb25lbnRzL2R1bW15LXJlbmRlci5taXhpbi5qcyIsIi9Vc2Vycy9jYXJsLWVyaWsua29wc2VuZy9kZXZfcHJpdi9FbWlzc2lvbnMvYXBwL2NvbXBvbmVudHMvZnVsbC1zY3JlZW4tdmlkZW8uanMiLCIvVXNlcnMvY2FybC1lcmlrLmtvcHNlbmcvZGV2X3ByaXYvRW1pc3Npb25zL2FwcC9jb21wb25lbnRzL2hlYWRlci5yZWFjdC5qcyIsIi9Vc2Vycy9jYXJsLWVyaWsua29wc2VuZy9kZXZfcHJpdi9FbWlzc2lvbnMvYXBwL2NvbXBvbmVudHMvaW5kZXgtYXBwLnJlYWN0LmpzIiwiL1VzZXJzL2NhcmwtZXJpay5rb3BzZW5nL2Rldl9wcml2L0VtaXNzaW9ucy9hcHAvY29tcG9uZW50cy9pbnRyb2R1Y3Rpb24tc2NyZWVuLnJlYWN0LmpzIiwiL1VzZXJzL2NhcmwtZXJpay5rb3BzZW5nL2Rldl9wcml2L0VtaXNzaW9ucy9hcHAvY29tcG9uZW50cy9tZXNzYWdlLWxpc3QucmVhY3QuanMiLCIvVXNlcnMvY2FybC1lcmlrLmtvcHNlbmcvZGV2X3ByaXYvRW1pc3Npb25zL2FwcC9jb21wb25lbnRzL21pc3Npb24tdGltZXIucmVhY3QuanMiLCIvVXNlcnMvY2FybC1lcmlrLmtvcHNlbmcvZGV2X3ByaXYvRW1pc3Npb25zL2FwcC9jb21wb25lbnRzL25vdC1mb3VuZC5yZWFjdC5qcyIsIi9Vc2Vycy9jYXJsLWVyaWsua29wc2VuZy9kZXZfcHJpdi9FbWlzc2lvbnMvYXBwL2NvbXBvbmVudHMvb3ZlcmxheS5yZWFjdC5qcyIsIi9Vc2Vycy9jYXJsLWVyaWsua29wc2VuZy9kZXZfcHJpdi9FbWlzc2lvbnMvYXBwL2NvbXBvbmVudHMvcmFkaWF0aW9uLWNoYXJ0LnJlYWN0LmpzIiwiL1VzZXJzL2NhcmwtZXJpay5rb3BzZW5nL2Rldl9wcml2L0VtaXNzaW9ucy9hcHAvY29tcG9uZW50cy9yYWRpYXRpb24tc2FtcGxlci5yZWFjdC5qcyIsIi9Vc2Vycy9jYXJsLWVyaWsua29wc2VuZy9kZXZfcHJpdi9FbWlzc2lvbnMvYXBwL2NvbXBvbmVudHMvcmFkaWF0aW9uLXRhYmxlLnJlYWN0LmpzIiwiL1VzZXJzL2NhcmwtZXJpay5rb3BzZW5nL2Rldl9wcml2L0VtaXNzaW9ucy9hcHAvY29tcG9uZW50cy9zY2llbmNlLXRhc2sucmVhY3QuanMiLCIvVXNlcnMvY2FybC1lcmlrLmtvcHNlbmcvZGV2X3ByaXYvRW1pc3Npb25zL2FwcC9jb21wb25lbnRzL3Rhc2sucmVhY3QuanMiLCIvVXNlcnMvY2FybC1lcmlrLmtvcHNlbmcvZGV2X3ByaXYvRW1pc3Npb25zL2FwcC9jb21wb25lbnRzL3RlYW0tZGlzcGxheWVyLnJlYWN0LmpzIiwiL1VzZXJzL2NhcmwtZXJpay5rb3BzZW5nL2Rldl9wcml2L0VtaXNzaW9ucy9hcHAvY29tcG9uZW50cy90aW1lci1wYW5lbC5yZWFjdC5qcyIsIi9Vc2Vycy9jYXJsLWVyaWsua29wc2VuZy9kZXZfcHJpdi9FbWlzc2lvbnMvYXBwL2NvbXBvbmVudHMvdGltZXIucmVhY3QuanMiLCIvVXNlcnMvY2FybC1lcmlrLmtvcHNlbmcvZGV2X3ByaXYvRW1pc3Npb25zL2FwcC9jb25zdGFudHMvTWVzc2FnZUNvbnN0YW50cy5qcyIsIi9Vc2Vycy9jYXJsLWVyaWsua29wc2VuZy9kZXZfcHJpdi9FbWlzc2lvbnMvYXBwL2NvbnN0YW50cy9NaXNzaW9uQ29uc3RhbnRzLmpzIiwiL1VzZXJzL2NhcmwtZXJpay5rb3BzZW5nL2Rldl9wcml2L0VtaXNzaW9ucy9hcHAvY29uc3RhbnRzL1JvdXRlckNvbnN0YW50cy5qcyIsIi9Vc2Vycy9jYXJsLWVyaWsua29wc2VuZy9kZXZfcHJpdi9FbWlzc2lvbnMvYXBwL2NvbnN0YW50cy9TY2llbmNlVGVhbUNvbnN0YW50cy5qcyIsIi9Vc2Vycy9jYXJsLWVyaWsua29wc2VuZy9kZXZfcHJpdi9FbWlzc2lvbnMvYXBwL2NvbnN0YW50cy9UaW1lckNvbnN0YW50cy5qcyIsIi9Vc2Vycy9jYXJsLWVyaWsua29wc2VuZy9kZXZfcHJpdi9FbWlzc2lvbnMvYXBwL3JvdXRlci1jb250YWluZXIuanMiLCIvVXNlcnMvY2FybC1lcmlrLmtvcHNlbmcvZGV2X3ByaXYvRW1pc3Npb25zL2FwcC9yb3V0ZXMucmVhY3QuanMiLCIvVXNlcnMvY2FybC1lcmlrLmtvcHNlbmcvZGV2X3ByaXYvRW1pc3Npb25zL2FwcC9zdG9yZXMvYmFzZS1zdG9yZS5qcyIsIi9Vc2Vycy9jYXJsLWVyaWsua29wc2VuZy9kZXZfcHJpdi9FbWlzc2lvbnMvYXBwL3N0b3Jlcy9ldmVudC1zdG9yZS5qcyIsIi9Vc2Vycy9jYXJsLWVyaWsua29wc2VuZy9kZXZfcHJpdi9FbWlzc2lvbnMvYXBwL3N0b3Jlcy9pbnRyb2R1Y3Rpb24tc3RvcmUuanMiLCIvVXNlcnMvY2FybC1lcmlrLmtvcHNlbmcvZGV2X3ByaXYvRW1pc3Npb25zL2FwcC9zdG9yZXMvbWVzc2FnZS1zdG9yZS5qcyIsIi9Vc2Vycy9jYXJsLWVyaWsua29wc2VuZy9kZXZfcHJpdi9FbWlzc2lvbnMvYXBwL3N0b3Jlcy9taXNzaW9uLXN0YXRlLXN0b3JlLmpzIiwiL1VzZXJzL2NhcmwtZXJpay5rb3BzZW5nL2Rldl9wcml2L0VtaXNzaW9ucy9hcHAvc3RvcmVzL3JhZGlhdGlvbi1zdG9yZS5qcyIsIi9Vc2Vycy9jYXJsLWVyaWsua29wc2VuZy9kZXZfcHJpdi9FbWlzc2lvbnMvYXBwL3N0b3Jlcy9yb3V0ZS1zdG9yZS5qcyIsIi9Vc2Vycy9jYXJsLWVyaWsua29wc2VuZy9kZXZfcHJpdi9FbWlzc2lvbnMvYXBwL3N0b3Jlcy90YXNrLXN0b3JlLmpzIiwiL1VzZXJzL2NhcmwtZXJpay5rb3BzZW5nL2Rldl9wcml2L0VtaXNzaW9ucy9hcHAvc3RvcmVzL3RpbWVyLXN0b3JlLmpzIiwiL1VzZXJzL2NhcmwtZXJpay5rb3BzZW5nL2Rldl9wcml2L0VtaXNzaW9ucy9hcHAvdGVhbS1uYW1lLW1hcC5qcyIsIi9Vc2Vycy9jYXJsLWVyaWsua29wc2VuZy9kZXZfcHJpdi9FbWlzc2lvbnMvYXBwL3V0aWxzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvYXNzaWduLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvZnJlZXplLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3Qva2V5cy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2hlbHBlcnMvY2xhc3MtY2FsbC1jaGVjay5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2hlbHBlcnMvY3JlYXRlLWNsYXNzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvaGVscGVycy9leHRlbmRzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvaGVscGVycy9pbmhlcml0cy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2Fzc2lnbi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2ZyZWV6ZS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2tleXMuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5hc3NpZ24uanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5kZWYuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5mdy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5vYmplY3QuYXNzaWduLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5vYmplY3Quc3RhdGljcy1hY2NlcHQtcHJpbWl0aXZlcy5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXJlc29sdmUvZW1wdHkuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnVmZmVyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2J1ZmZlci9ub2RlX21vZHVsZXMvYmFzZTY0LWpzL2xpYi9iNjQuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnVmZmVyL25vZGVfbW9kdWxlcy9pZWVlNzU0L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2J1ZmZlci9ub2RlX21vZHVsZXMvaXMtYXJyYXkvaW5kZXguanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvZXZlbnRzL2V2ZW50cy5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9pbmhlcml0cy9pbmhlcml0c19icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2lzYXJyYXkvaW5kZXguanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3JlYWRhYmxlLXN0cmVhbS9kdXBsZXguanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcmVhZGFibGUtc3RyZWFtL2xpYi9fc3RyZWFtX2R1cGxleC5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9yZWFkYWJsZS1zdHJlYW0vbGliL19zdHJlYW1fcGFzc3Rocm91Z2guanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcmVhZGFibGUtc3RyZWFtL2xpYi9fc3RyZWFtX3JlYWRhYmxlLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3JlYWRhYmxlLXN0cmVhbS9saWIvX3N0cmVhbV90cmFuc2Zvcm0uanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcmVhZGFibGUtc3RyZWFtL2xpYi9fc3RyZWFtX3dyaXRhYmxlLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3JlYWRhYmxlLXN0cmVhbS9ub2RlX21vZHVsZXMvY29yZS11dGlsLWlzL2xpYi91dGlsLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3JlYWRhYmxlLXN0cmVhbS9wYXNzdGhyb3VnaC5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9yZWFkYWJsZS1zdHJlYW0vcmVhZGFibGUuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcmVhZGFibGUtc3RyZWFtL3RyYW5zZm9ybS5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9yZWFkYWJsZS1zdHJlYW0vd3JpdGFibGUuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvc3RyZWFtLWJyb3dzZXJpZnkvaW5kZXguanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvc3RyaW5nX2RlY29kZXIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvdXRpbC9zdXBwb3J0L2lzQnVmZmVyQnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy91dGlsL3V0aWwuanMiLCJub2RlX21vZHVsZXMvY2hlY2stdHlwZXMvc3JjL2NoZWNrLXR5cGVzLmpzIiwibm9kZV9tb2R1bGVzL2ZsdXgvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZmx1eC9saWIvRGlzcGF0Y2hlci5qcyIsIm5vZGVfbW9kdWxlcy9mbHV4L2xpYi9pbnZhcmlhbnQuanMiLCJub2RlX21vZHVsZXMvZ2xvYmFsL2RvY3VtZW50LmpzIiwibm9kZV9tb2R1bGVzL2dsb2JhbC93aW5kb3cuanMiLCJub2RlX21vZHVsZXMvcHJpbnRmL2xpYi9wcmludGYuanMiLCJub2RlX21vZHVsZXMvcmVhY3QvbGliL2ludmFyaWFudC5qcyIsIm5vZGVfbW9kdWxlcy9yZWFjdC9saWIva2V5TWlycm9yLmpzIiwiL1VzZXJzL2NhcmwtZXJpay5rb3BzZW5nL2Rldl9wcml2L0VtaXNzaW9ucy9zZXJ2ZXIvRXZlbnRDb25zdGFudHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7QUNBQSxJQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDL0IsSUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDNUMsSUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQ3hDLElBQU0sbUJBQW1CLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDOzs7QUFHcEQsSUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUM7O0FBRTdDLElBQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQ2pELElBQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDOztBQUV6RCxtQkFBbUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQzs7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REY7O0FDQUE7O0FDQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBOztBQ0RBO0FBQ0E7O0FDREE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEdBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbnpDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN1NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTs7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDekZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3Y3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNqTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDN2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMxR0E7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7O0FDREE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzFrQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbnRCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMVBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUM3Y0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7O0FDbkRBLElBQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDOztBQUVqRCxNQUFNLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQztBQUN2QixtQkFBZSxFQUFHLElBQUk7QUFDdEIsbUJBQWUsRUFBRyxJQUFJO0FBQ3RCLGlCQUFhLEVBQUcsSUFBSTtBQUNwQixxQkFBaUIsRUFBRyxJQUFJO0FBQ3hCLGFBQVMsRUFBRyxJQUFJOztBQUVoQixlQUFXLEVBQUcsSUFBSTs7O0FBR2xCLGNBQVUsRUFBRyxJQUFJO0FBQ2pCLGNBQVUsRUFBRyxJQUFJO0FBQ2pCLGlCQUFhLEVBQUcsSUFBSTtBQUNwQixtQkFBZSxFQUFHLElBQUk7QUFDdEIsb0JBQWdCLEVBQUcsSUFBSTs7O0FBR3ZCLDJCQUF1QixFQUFHLElBQUk7OztBQUc5QixvQkFBZ0IsRUFBRyxJQUFJOzs7QUFHdkIseUJBQXFCLEVBQUcsSUFBSTs7O0FBQUEsQ0FHL0IsQ0FBQyxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbmNvbnN0IGRvY3VtZW50ID0gcmVxdWlyZSgnZ2xvYmFsL2RvY3VtZW50Jyk7XG5jb25zdCB3aW5kb3cgPSByZXF1aXJlKCdnbG9iYWwvd2luZG93Jyk7XG5jb25zdCBzZXJ2ZXJDb21tdW5pY2F0aW9uID0gcmVxdWlyZSgnLi9jbGllbnQtYXBpJyk7XG5cbi8vIHRoZSBhY3R1YWwgcmlnZ2luZyBvZiB0aGUgYXBwbGljYXRpb24gaXMgZG9uZSBpbiB0aGUgcm91dGVyIVxuY29uc3Qgcm91dGVyID0gcmVxdWlyZSgnLi9yb3V0ZXItY29udGFpbmVyJyk7XG5cbmNvbnN0IEFwcERpc3BhdGNoZXIgPSByZXF1aXJlKCcuL2FwcGRpc3BhdGNoZXInKTtcbmNvbnN0IGNvbnN0YW50cyA9IHJlcXVpcmUoJy4vY29uc3RhbnRzL1JvdXRlckNvbnN0YW50cycpO1xuXG5zZXJ2ZXJDb21tdW5pY2F0aW9uLnNldHVwKCk7XG5cbi8vIHRoZSBtaXNzaW9uIHRpbWVyIGdldHMgb3V0IHN5bmMgaWYgbG9zaW5nIGZvY3VzLCBzbyByZXN5bmMgd2l0aCBzZXJ2ZXIgZXZlcnkgdGltZSB0aGUgd2luZG93IHJlZ2FpbnMgZm9jdXNcbndpbmRvdy5vbmZvY3VzPXNlcnZlckNvbW11bmljYXRpb24uYXNrRm9yTWlzc2lvblRpbWU7XG5cbi8vIHJ1biBzdGFydHVwIGFjdGlvbnMgLSB1c3VhbGx5IG9ubHkgcmVsZXZhbnQgd2hlbiBkZXZlbG9waW5nXG5yZXF1aXJlKCcuL2NsaWVudC1ib290c3RyYXAnKS5ydW4oKTtcblxucm91dGVyLnJ1bigoSGFuZGxlciwgc3RhdGUpID0+IHtcbiAgICAvLyBwYXNzIHRoZSBzdGF0ZSBkb3duIGludG8gdGhlIFJvdXRlSGFuZGxlcnMsIGFzIHRoYXQgd2lsbCBtYWtlXG4gICAgLy8gdGhlIHJvdXRlciByZWxhdGVkIHByb3BlcnRpZXMgYXZhaWxhYmxlIG9uIGVhY2ggUkguIFRha2VuIGZyb20gVXBncmFkZSB0aXBzIGZvciBSZWFjdCBSb3V0ZXJcbiAgICBSZWFjdC5yZW5kZXIoPEhhbmRsZXIgey4uLnN0YXRlfS8+LCBkb2N1bWVudC5ib2R5KTtcbn0pO1xuXG4iLCJjb25zdCBBcHBEaXNwYXRjaGVyID0gcmVxdWlyZSgnLi4vYXBwZGlzcGF0Y2hlcicpLFxuICAgIHV1aWQgPSByZXF1aXJlKCcuLy4uL3V0aWxzJykudXVpZCxcbiAgICBjb25zdGFudHMgPSByZXF1aXJlKCcuLi9jb25zdGFudHMvTWVzc2FnZUNvbnN0YW50cycpO1xuXG5jb25zdCBhY3Rpb25zID0ge1xuXG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0gbXNnLnRleHQgdGhlIG1lc3NhZ2VcbiAgICAgKiBAcGFyYW0gW21zZy5pZF0gdGhlIG1lc3NhZ2UgaWQuIGlmIG5vdCBnaXZlbiwgb25lIHdpbGwgYmUgY3JlYXRlZFxuICAgICAqIEBwYXJhbSBbbXNnLmxldmVsXSBzYW1lIGFzIGJvb3RzdHJhcCdzIGFsZXJ0IGNsYXNzZXM6IFtzdWNjZXNzLCBpbmZvLCB3YXJuaW5nLCBkYW5nZXJdXG4gICAgICogQHBhcmFtIFttc2cuZHVyYXRpb25dIHtOdW1iZXJ9IG9wdGlvbmFsIGR1cmF0aW9uIGZvciB0cmFuc2llbnQgbWVzc2FnZXNcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IHRoZSBtZXNzYWdlIGlkXG4gICAgICovXG4gICAgYWRkTWVzc2FnZShtc2cpIHtcbiAgICAgICAgdmFyIGlkID0gbXNnLmlkO1xuXG4gICAgICAgIGlmICghaWQpIHtcbiAgICAgICAgICAgIGlkID0gdXVpZCgpO1xuICAgICAgICAgICAgbXNnLmlkID0gaWQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIW1zZy5sZXZlbCkge1xuICAgICAgICAgICAgbXNnLmxldmVsID0gJ3N1Y2Nlc3MnO1xuICAgICAgICB9XG5cbiAgICAgICAgQXBwRGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiBjb25zdGFudHMuTUVTU0FHRV9BRERFRCxcbiAgICAgICAgICAgICAgICBkYXRhOiBtc2dcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcblxuICAgICAgICBpZiAobXNnLmR1cmF0aW9uKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IGFjdGlvbnMucmVtb3ZlTWVzc2FnZShtc2cuaWQpLCBtc2cuZHVyYXRpb24gKiAxMDAwKVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGlkO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBtc2cgd2l0aCBkZWZhdWx0IGR1cmF0aW9uIG9mIDUgc2Vjb25kc1xuICAgICAqIEBwYXJhbSBtc2dcbiAgICAgKiBAcGFyYW0gW2R1cmF0aW9uXSBkZWZhdWx0IG9mIDUgc2Vjb25kc1xuICAgICAqXG4gICAgICogQHNlZSAjYWRkTWVzc2FnZSgpIGZvciBtb3JlIHBhcmFtc1xuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IHRoZSBtZXNzYWdlIGlkXG4gICAgICovXG4gICAgYWRkVHJhbnNpZW50TWVzc2FnZShtc2csIGR1cmF0aW9uID0gNSkge1xuICAgICAgICByZXR1cm4gYWN0aW9ucy5hZGRNZXNzYWdlKE9iamVjdC5hc3NpZ24oe2R1cmF0aW9ufSwgbXNnKSlcbiAgICB9LFxuXG4gICAgcmVtb3ZlTWVzc2FnZShpZCkge1xuICAgICAgICBBcHBEaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICBhY3Rpb246IGNvbnN0YW50cy5SRU1PVkVfTUVTU0FHRSxcbiAgICAgICAgICAgICAgICBkYXRhOiBpZFxuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgIH1cblxufTtcblxuLy8gcHJldmVudCBuZXcgcHJvcGVydGllcyBmcm9tIGJlaW5nIGFkZGVkIG9yIHJlbW92ZWRcbk9iamVjdC5mcmVlemUoYWN0aW9ucyk7XG53aW5kb3cuX19NZXNzYWdlQWN0aW9ucyA9IGFjdGlvbnM7XG5tb2R1bGUuZXhwb3J0cyA9IGFjdGlvbnM7IiwiY29uc3QgQXBwRGlzcGF0Y2hlciA9IHJlcXVpcmUoJy4uL2FwcGRpc3BhdGNoZXInKSxcbiAgICBNaXNzaW9uQ29uc3RhbnRzID0gcmVxdWlyZSgnLi4vY29uc3RhbnRzL01pc3Npb25Db25zdGFudHMnKSxcbiAgICByb3V0ZXIgPSByZXF1aXJlKCcuLy4uL3JvdXRlci1jb250YWluZXInKTtcblxuLy8gbGF6eSBsb2FkIGR1ZSB0byBjaXJjdWxhciBkZXBlbmRlbmNpZXNcbmNvbnN0IHNlcnZlckFQSSA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGFwaTtcblxuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghYXBpKSB7XG4gICAgICAgICAgICBhcGkgPSByZXF1aXJlKCcuLi9jbGllbnQtYXBpJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFwaTtcbiAgICB9XG59KSgpO1xuXG52YXIgdG1wID0ge1xuXG4gICAgc3RhcnRNaXNzaW9uKCl7XG4gICAgICAgIHNlcnZlckFQSSgpLnN0YXJ0TWlzc2lvbigpO1xuICAgIH0sXG5cbiAgICBzdG9wTWlzc2lvbigpe1xuICAgICAgICBzZXJ2ZXJBUEkoKS5zdG9wTWlzc2lvbigpO1xuICAgIH0sXG5cbiAgICByZXNldE1pc3Npb24oKXtcbiAgICAgICAgc2VydmVyQVBJKCkucmVzZXRNaXNzaW9uKCk7XG4gICAgfSxcblxuICAgIG1pc3Npb25TdGFydGVkKCkge1xuICAgICAgICBBcHBEaXNwYXRjaGVyLmRpc3BhdGNoKHthY3Rpb246IE1pc3Npb25Db25zdGFudHMuTUlTU0lPTl9TVEFSVEVEX0VWRU5UfSk7XG4gICAgfSxcblxuICAgIG1pc3Npb25TdG9wcGVkKCkge1xuICAgICAgICBBcHBEaXNwYXRjaGVyLmRpc3BhdGNoKHthY3Rpb246IE1pc3Npb25Db25zdGFudHMuTUlTU0lPTl9TVE9QUEVEX0VWRU5UfSk7XG4gICAgfSxcblxuICAgIG1pc3Npb25XYXNSZXNldCgpe1xuICAgICAgICBBcHBEaXNwYXRjaGVyLmRpc3BhdGNoKHthY3Rpb246IE1pc3Npb25Db25zdGFudHMuTUlTU0lPTl9XQVNfUkVTRVR9KTtcbiAgICAgICAgc2VydmVyQVBJKCkuYXNrRm9yQXBwU3RhdGUoKTtcbiAgICB9LFxuXG4gICAgbWlzc2lvbkNvbXBsZXRlZCgpIHtcbiAgICAgICAgLy9BcHBEaXNwYXRjaGVyLmRpc3BhdGNoKHthY3Rpb246IE1pc3Npb25Db25zdGFudHMuTUlTU0lPTl9DT01QTEVURURfRVZFTlR9KTtcbiAgICAgICAgcm91dGVyLnRyYW5zaXRpb25UbygnL2NvbXBsZXRlZCcpO1xuICAgIH0sXG5cbiAgICBjb21wbGV0ZU1pc3Npb24oKXtcbiAgICAgICAgc2VydmVyQVBJKCkuY29tcGxldGVNaXNzaW9uKCk7XG4gICAgfSxcblxuICAgIHJlY2VpdmVkRXZlbnRzKGV2ZW50c0NvbGxlY3Rpb24pe1xuICAgICAgICBBcHBEaXNwYXRjaGVyLmRpc3BhdGNoKE9iamVjdC5hc3NpZ24oe30sIGV2ZW50c0NvbGxlY3Rpb24sIHthY3Rpb246IE1pc3Npb25Db25zdGFudHMuUkVDRUlWRURfRVZFTlRTfSkpO1xuICAgIH0sXG5cbiAgICBhc2tGb3JFdmVudHMoKXtcbiAgICAgICAgc2VydmVyQVBJKCkuYXNrRm9yRXZlbnRzKCk7XG4gICAgfSxcblxuICAgIGludHJvV2FzUmVhZCh0ZWFtSWQpIHtcbiAgICAgICAgQXBwRGlzcGF0Y2hlci5kaXNwYXRjaCh7YWN0aW9uOiBNaXNzaW9uQ29uc3RhbnRzLklOVFJPRFVDVElPTl9SRUFELCB0ZWFtTmFtZTogdGVhbUlkfSk7XG4gICAgICAgIHNlcnZlckFQSSgpLnNlbmRUZWFtU3RhdGVDaGFuZ2UodGVhbUlkKTtcbiAgICB9LFxuXG4gICAgc3RhcnRUYXNrKHRlYW1JZCwgdGFza0lkKXtcbiAgICAgICAgQXBwRGlzcGF0Y2hlci5kaXNwYXRjaCh7YWN0aW9uOiBNaXNzaW9uQ29uc3RhbnRzLlNUQVJUX1RBU0ssIHRlYW1JZCwgdGFza0lkfSk7XG4gICAgICAgIHNlcnZlckFQSSgpLnNlbmRUZWFtU3RhdGVDaGFuZ2UodGVhbUlkKTtcbiAgICB9LFxuXG4gICAgdGFza0NvbXBsZXRlZCh0ZWFtSWQsIHRhc2tJZCkgICB7XG4gICAgICAgIEFwcERpc3BhdGNoZXIuZGlzcGF0Y2goe2FjdGlvbjogTWlzc2lvbkNvbnN0YW50cy5DT01QTEVURURfVEFTSywgdGFza0lkLCB0ZWFtSWR9KTtcbiAgICAgICAgc2VydmVyQVBJKCkuc2VuZFRlYW1TdGF0ZUNoYW5nZSh0ZWFtSWQpO1xuICAgIH0sXG5cbiAgICBhc2tUb1N0YXJ0TmV4dENoYXB0ZXIoKXtcbiAgICAgICAgc2VydmVyQVBJKCkuYXNrVG9TdGFydE5leHRDaGFwdGVyKCk7XG4gICAgfSxcblxuICAgIGFza1RvVHJpZ2dlckV2ZW50KHV1aWQpe1xuICAgICAgICBzZXJ2ZXJBUEkoKS50cmlnZ2VyRXZlbnQodXVpZCk7XG4gICAgfSxcblxuICAgIHNldE1pc3Npb25UaW1lKGVsYXBzZWRTZWNvbmRzKXtcbiAgICAgICAgQXBwRGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICAgICAgICBhY3Rpb246IE1pc3Npb25Db25zdGFudHMuTUlTU0lPTl9USU1FX1NZTkMsXG4gICAgICAgICAgICBkYXRhOiB7ZWxhcHNlZE1pc3Npb25UaW1lOiBlbGFwc2VkU2Vjb25kc31cbiAgICAgICAgfSk7XG5cbiAgICB9XG5cbn07XG5cbndpbmRvdy5fX01pc3Npb25BQyA9IHRtcDtcbm1vZHVsZS5leHBvcnRzID0gdG1wO1xuIiwiY29uc3QgQXBwRGlzcGF0Y2hlciA9IHJlcXVpcmUoJy4uL2FwcGRpc3BhdGNoZXInKTtcbmNvbnN0IFJhZGlhdGlvblN0b3JlID0gcmVxdWlyZSgnLi8uLi9zdG9yZXMvcmFkaWF0aW9uLXN0b3JlJyk7XG5jb25zdCBTY2llbmNlVGVhbUNvbnN0YW50cyA9IHJlcXVpcmUoJy4uL2NvbnN0YW50cy9TY2llbmNlVGVhbUNvbnN0YW50cycpO1xuY29uc3QgTWlzc2lvbkNvbnN0YW50cyA9IHJlcXVpcmUoJy4uL2NvbnN0YW50cy9NaXNzaW9uQ29uc3RhbnRzJyk7XG5jb25zdCBNZXNzYWdlQWN0aW9uc0NyZWF0b3JzID0gcmVxdWlyZSgnLi9NZXNzYWdlQWN0aW9uQ3JlYXRvcnMnKTtcbmNvbnN0IFRpbWVyQWN0aW9uQ3JlYXRvcnMgPSByZXF1aXJlKCcuLi9hY3Rpb25zL1RpbWVyQWN0aW9uQ3JlYXRvcnMnKTtcbmNvbnN0IGFwaSA9IHJlcXVpcmUoJy4uL2NsaWVudC1hcGknKTtcblxudmFyIG1pc3Npb25BY3Rpb25DcmVhdG9ycyA9IChmdW5jdGlvbigpIHtcbiAgICB2YXIgdG1wO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCF0bXApIHRtcCA9IHJlcXVpcmUoJy4uL2FjdGlvbnMvTWlzc2lvbkFjdGlvbkNyZWF0b3JzJyk7XG4gICAgICAgIHJldHVybiB0bXA7XG4gICAgfVxufSkoKTtcblxuXG5jb25zdCBhY3Rpb25zID0ge1xuXG4gICAgc3RhcnRTYW1wbGVUYXNrKCl7XG4gICAgICAgIEFwcERpc3BhdGNoZXIuZGlzcGF0Y2goe2FjdGlvbjogU2NpZW5jZVRlYW1Db25zdGFudHMuU0NJRU5DRV9DTEVBUl9SQURJQVRJT05fU0FNUExFU30pO1xuICAgICAgICBtaXNzaW9uQWN0aW9uQ3JlYXRvcnMoKS5zdGFydFRhc2soJ3NjaWVuY2UnLCAnc2FtcGxlJyk7XG4gICAgICAgIHRoaXMucmVzZXRTYW1wbGluZ1RpbWVyKCk7XG4gICAgfSxcblxuICAgIGNvbXBsZXRlVGFzayh0YXNrSWQpe1xuICAgICAgICBtaXNzaW9uQWN0aW9uQ3JlYXRvcnMoKS50YXNrQ29tcGxldGVkKCdzY2llbmNlJywgdGFza0lkKTtcbiAgICB9LFxuXG4gICAgcmVzZXRTYW1wbGluZ1RpbWVyKCkge1xuICAgICAgICBUaW1lckFjdGlvbkNyZWF0b3JzLnJlc2V0VGltZXIoU2NpZW5jZVRlYW1Db25zdGFudHMuU0NJRU5DRV9USU1FUl8xKTtcbiAgICB9LFxuXG4gICAgdGFrZVJhZGlhdGlvblNhbXBsZSgpIHtcbiAgICAgICAgQXBwRGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICAgICAgICBhY3Rpb246IFNjaWVuY2VUZWFtQ29uc3RhbnRzLlNDSUVOQ0VfVEFLRV9SQURJQVRJT05fU0FNUExFXG4gICAgICAgIH0pXG4gICAgfSxcblxuICAgIGF2ZXJhZ2VSYWRpYXRpb25DYWxjdWxhdGVkKGF2ZXJhZ2Upe1xuICAgICAgICBsZXQgc2FtcGxlcyA9IFJhZGlhdGlvblN0b3JlLmdldFNhbXBsZXMoKTtcblxuICAgICAgICBpZiAoc2FtcGxlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGxldCBzdW0gPSBzYW1wbGVzLnJlZHVjZSgocHJldiwgY3VycmVudCkgPT4gcHJldiArIGN1cnJlbnQsIDApLFxuICAgICAgICAgICAgICAgIHRydWVDYWxjdWxhdGVkQXZlcmFnZSA9IHN1bSAvIHNhbXBsZXMubGVuZ3RoLFxuICAgICAgICAgICAgICAgIGRpZmZJblBlcmNlbnQgPSAxMDAgKiBNYXRoLmFicygodHJ1ZUNhbGN1bGF0ZWRBdmVyYWdlIC0gYXZlcmFnZSkgLyB0cnVlQ2FsY3VsYXRlZEF2ZXJhZ2UpO1xuXG4gICAgICAgICAgICBpZiAoZGlmZkluUGVyY2VudCA+IDE1KSB7XG4gICAgICAgICAgICAgICAgTWVzc2FnZUFjdGlvbnNDcmVhdG9ycy5hZGRUcmFuc2llbnRNZXNzYWdlKHt0ZXh0OiAnTXVsaWcgZGV0IGdqZW5ub21zbml0dGV0IGJsZSBsaXR0IGZlaWwuJ30pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cblxuICAgICAgICBBcHBEaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgICAgICAgIGFjdGlvbjogU2NpZW5jZVRlYW1Db25zdGFudHMuU0NJRU5DRV9BVkdfUkFESUFUSU9OX0NBTENVTEFURUQsXG4gICAgICAgICAgICBkYXRhOiB7YXZlcmFnZX1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGF2ZXJhZ2UgPiBTY2llbmNlVGVhbUNvbnN0YW50cy5TQ0lFTkNFX0FWR19SQURfUkVEX1RIUkVTSE9MRCkge1xuICAgICAgICAgICAgTWVzc2FnZUFjdGlvbnNDcmVhdG9ycy5hZGRUcmFuc2llbnRNZXNzYWdlKHtcbiAgICAgICAgICAgICAgICB0ZXh0OiAnVmVsZGlnIGjDuHl0IHJhZGlvYWt0aXZ0IG5pdsOlIGRldGVrdGVydC4gVmFyc2xlIHNpa2tlcmhldHN0ZWFtZXQgdW1pZGRlbGJhcnQhJyxcbiAgICAgICAgICAgICAgICBsZXZlbDogJ2RhbmdlcicsXG4gICAgICAgICAgICAgICAgaWQ6IFNjaWVuY2VUZWFtQ29uc3RhbnRzLlNDSUVOQ0VfUkFESUFUSU9OX1dBUk5JTkdfTVNHXG4gICAgICAgICAgICB9LCAzMCk7XG4gICAgICAgIH0gZWxzZSBpZiAoYXZlcmFnZSA+IFNjaWVuY2VUZWFtQ29uc3RhbnRzLlNDSUVOQ0VfQVZHX1JBRF9PUkFOR0VfVEhSRVNIT0xEKSB7XG4gICAgICAgICAgICBNZXNzYWdlQWN0aW9uc0NyZWF0b3JzLmFkZFRyYW5zaWVudE1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgIHRleHQ6ICdIw7h5ZSB2ZXJkaWVyIGF2IHJhZGlvYWt0aXZpdGV0LiBGw7hsZyBtZWQgcMOlIG9tIGRldCBnw6VyIG5lZG92ZXIgaWdqZW4nLFxuICAgICAgICAgICAgICAgIGxldmVsOiAnd2FybmluZycsXG4gICAgICAgICAgICAgICAgaWQ6IFNjaWVuY2VUZWFtQ29uc3RhbnRzLlNDSUVOQ0VfUkFESUFUSU9OX1dBUk5JTkdfTVNHXG4gICAgICAgICAgICB9LCAxMCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNvbXBsZXRlVGFzaygnYXZlcmFnZScpO1xuICAgIH0sXG5cblxuICAgIC8qKlxuICAgICAqIFNldCB0aGUgcmFkaWF0aW9uIGxldmVsIHRoYXQgd2lsbCBiZSByZXBvcnRlZCB0byB0aGUgdmlldyBsYXllclxuICAgICAqIFRoZSByZXBvcnRlZCByYWRpYXRpb24gd2lsbCBnZW5lcmF0ZWQgdmFsdWVzIGluIHRoZSByYW5nZSBnaXZlbiBieSB0aGUgcGFyYW1ldGVyc1xuICAgICAqXG4gICAgICogV2UgYXJlIG5vdCBhY3R1YWxseSByZWNlaXZpbmcgYSBzdHJlYW0gb2YgdmFsdWVzIGZyb20gdGhlIHNlcnZlciwgYXMgdGhhdCBjb3VsZFxuICAgICAqIGJlIHZlcnkgcmVzb3VyY2UgaGVhdnkuIEluc3RlYWQgd2UgZ2VuZXJhdGUgcmFuZG9tIHZhbHVlcyBiZXR3ZWVuIHRoZSBnaXZlbiB2YWx1ZXMsXG4gICAgICogd2hpY2ggdG8gdGhlIHVzZXIgd2lsbCBsb29rIHRoZSBzYW1lLlxuICAgICAqIEBwYXJhbSBtaW5cbiAgICAgKiBAcGFyYW0gbWF4XG4gICAgICovXG4gICAgICAgIHNldFJhZGlhdGlvbkxldmVsKG1pbiwgbWF4KSB7XG4gICAgICAgIEFwcERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgICAgICAgYWN0aW9uOiBTY2llbmNlVGVhbUNvbnN0YW50cy5TQ0lFTkNFX1JBRElBVElPTl9MRVZFTF9DSEFOR0VELFxuICAgICAgICAgICAgZGF0YToge21pbiwgbWF4fVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgYWRkVG9Ub3RhbFJhZGlhdGlvbkxldmVsKGFtb3VudCl7XG5cbiAgICAgICAgdmFyIHRvdGFsID0gYW1vdW50ICsgUmFkaWF0aW9uU3RvcmUuZ2V0VG90YWxMZXZlbCgpO1xuXG4gICAgICAgIGlmICh0b3RhbCA+IFNjaWVuY2VUZWFtQ29uc3RhbnRzLlNDSUVOQ0VfVE9UQUxfUkFESUFUSU9OX1ZFUllfU0VSSU9VU19USFJFU0hPTEQpIHtcbiAgICAgICAgICAgIE1lc3NhZ2VBY3Rpb25zQ3JlYXRvcnMuYWRkVHJhbnNpZW50TWVzc2FnZSh7XG4gICAgICAgICAgICAgICAgaWQ6ICdzY2llbmNlX2hpZ2hfcmFkaWF0aW9uX2xldmVsJyxcbiAgICAgICAgICAgICAgICB0ZXh0OiAnRmFyZXRydWVuZGUgaMO4eXQgc3Ryw6VsaW5nc25pdsOlIScsXG4gICAgICAgICAgICAgICAgbGV2ZWw6ICdkYW5nZXInXG4gICAgICAgICAgICB9LCAzMCk7XG4gICAgICAgIH0gZWxzZSBpZiAodG90YWwgPiBTY2llbmNlVGVhbUNvbnN0YW50cy5TQ0lFTkNFX1RPVEFMX1JBRElBVElPTl9TRVJJT1VTX1RIUkVTSE9MRCkge1xuICAgICAgICAgICAgTWVzc2FnZUFjdGlvbnNDcmVhdG9ycy5hZGRUcmFuc2llbnRNZXNzYWdlKHtcbiAgICAgICAgICAgICAgICBpZDogJ3NjaWVuY2VfaGlnaF9yYWRpYXRpb25fbGV2ZWwnLFxuICAgICAgICAgICAgICAgIHRleHQ6ICdIw7h5dCBzdHLDpWxpbmdzbml2w6UhJyxcbiAgICAgICAgICAgICAgICBsZXZlbDogJ3dhcm5pbmcnXG4gICAgICAgICAgICB9LCAzMCk7XG4gICAgICAgIH1cblxuICAgICAgICBBcHBEaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgICAgICAgIGFjdGlvbjogU2NpZW5jZVRlYW1Db25zdGFudHMuU0NJRU5DRV9UT1RBTF9SQURJQVRJT05fTEVWRUxfQ0hBTkdFRCxcbiAgICAgICAgICAgIGRhdGE6IHt0b3RhbCwgYWRkZWQ6IGFtb3VudH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5jb21wbGV0ZVRhc2soJ2FkZHRvdGFsJyk7XG4gICAgfSxcblxuICAgIC8qIE9uIHJlY2VpdmluZyBuZXcgc3RhdGUgZnJvbSB0aGUgc2VydmVyICovXG4gICAgdGVhbVN0YXRlUmVjZWl2ZWQoc3RhdGUpe1xuICAgICAgICBpZiAoIXN0YXRlKSByZXR1cm47XG5cbiAgICAgICAgdmFyIHRlYW1JZCA9ICdzY2llbmNlJztcblxuICAgICAgICBpZiAoc3RhdGUuaW50cm9kdWN0aW9uX3JlYWQpIHtcbiAgICAgICAgICAgIEFwcERpc3BhdGNoZXIuZGlzcGF0Y2goe2FjdGlvbjogTWlzc2lvbkNvbnN0YW50cy5JTlRST0RVQ1RJT05fUkVBRCwgdGVhbU5hbWU6IHRlYW1JZH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgQXBwRGlzcGF0Y2hlci5kaXNwYXRjaCh7YWN0aW9uOiBNaXNzaW9uQ29uc3RhbnRzLlNUQVJUX1RBU0ssIHRlYW1JZCwgdGFza0lkOiBzdGF0ZS5jdXJyZW50X3Rhc2t9KTtcbiAgICB9XG59O1xuXG53aW5kb3cuX19TY2llbmNlQWN0aW9ucyA9IGFjdGlvbnM7XG5tb2R1bGUuZXhwb3J0cyA9IGFjdGlvbnM7IiwiY29uc3QgQXBwRGlzcGF0Y2hlciA9IHJlcXVpcmUoJy4uL2FwcGRpc3BhdGNoZXInKTtcbmNvbnN0IGNvbnN0YW50cyA9IHJlcXVpcmUoJy4uL2NvbnN0YW50cy9UaW1lckNvbnN0YW50cycpO1xuXG5jb25zdCBhY3Rpb25zID0ge1xuXG4gICAgc3RhcnRUaW1lcihpZCkge1xuICAgICAgICBBcHBEaXNwYXRjaGVyLmRpc3BhdGNoKHthY3Rpb246IGNvbnN0YW50cy5TVEFSVF9USU1FUiwgZGF0YToge3RpbWVySWQ6IGlkfX0pO1xuICAgIH0sXG5cbiAgICByZXNldFRpbWVyKGlkKSB7XG4gICAgICAgIEFwcERpc3BhdGNoZXIuZGlzcGF0Y2goe2FjdGlvbjogY29uc3RhbnRzLlJFU0VUX1RJTUVSLCBkYXRhOiB7dGltZXJJZDogaWR9fSk7XG4gICAgfSxcblxuICAgIHN0b3BUaW1lcihpZCkge1xuICAgICAgICBBcHBEaXNwYXRjaGVyLmRpc3BhdGNoKHthY3Rpb246IGNvbnN0YW50cy5TVE9QX1RJTUVSLCBkYXRhOiB7dGltZXJJZDogaWR9fSk7XG4gICAgfSxcblxuICAgIHNldFRpbWVyKHRpbWVySWQsIHRpbWUpIHtcbiAgICAgICAgQXBwRGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICAgICAgICBhY3Rpb246IGNvbnN0YW50cy5TRVRfVElNRVIsXG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgcmVtYWluaW5nVGltZTogdGltZSxcbiAgICAgICAgICAgICAgICB0aW1lcklkXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBhY3Rpb25zOyIsIi8qXG4gKiBEaXNwYXRjaGVyIC0gYSBzaW5nbGV0b25cbiAqXG4gKiBUaGlzIGlzIGVzc2VudGlhbGx5IHRoZSBtYWluIGRyaXZlciBpbiB0aGUgRmx1eCBhcmNoaXRlY3R1cmVcbiAqIEBzZWUgaHR0cDovL2ZhY2Vib29rLmdpdGh1Yi5pby9mbHV4L2RvY3Mvb3ZlcnZpZXcuaHRtbFxuKi9cblxuY29uc3QgeyBEaXNwYXRjaGVyIH0gPSByZXF1aXJlKCdmbHV4Jyk7XG5cbmNvbnN0IEFwcERpc3BhdGNoZXIgPSBPYmplY3QuYXNzaWduKG5ldyBEaXNwYXRjaGVyKCksIHtcblxuICAgIC8vIG9wdGlvbmFsIG1ldGhvZHNcblxufSk7XG5cbndpbmRvdy5fX0FwcERpc3BhdGNoZXI9IEFwcERpc3BhdGNoZXI7XG5tb2R1bGUuZXhwb3J0cyA9IEFwcERpc3BhdGNoZXI7IiwiY29uc3QgQXBwRGlzcGF0Y2hlciA9IHJlcXVpcmUoJy4vYXBwZGlzcGF0Y2hlcicpO1xuY29uc3QgaW8gPSByZXF1aXJlKCdzb2NrZXQuaW8nKTtcbmNvbnN0IHNvY2tldCA9IGlvKCk7XG5jb25zdCBNaXNzaW9uQ29uc3RhbnRzID0gcmVxdWlyZSgnLi9jb25zdGFudHMvTWlzc2lvbkNvbnN0YW50cycpO1xuY29uc3QgTWlzc2lvbkFjdGlvbkNyZWF0b3JzID0gcmVxdWlyZSgnLi9hY3Rpb25zL01pc3Npb25BY3Rpb25DcmVhdG9ycycpO1xuY29uc3QgTWVzc2FnZUFjdGlvbkNyZWF0b3JzID0gcmVxdWlyZSgnLi9hY3Rpb25zL01lc3NhZ2VBY3Rpb25DcmVhdG9ycycpO1xuY29uc3QgU2NpZW5jZVRlYW1BY3Rpb25DcmVhdG9ycyA9IHJlcXVpcmUoJy4vYWN0aW9ucy9TY2llbmNlQWN0aW9uQ3JlYXRvcnMnKTtcbmNvbnN0IFJhZGlhdGlvblN0b3JlID0gcmVxdWlyZSgnLi9zdG9yZXMvcmFkaWF0aW9uLXN0b3JlJyk7XG5jb25zdCBUaW1lclN0b3JlID0gcmVxdWlyZSgnLi9zdG9yZXMvdGltZXItc3RvcmUnKTtcbmNvbnN0IEludHJvZHVjdGlvblN0b3JlID0gcmVxdWlyZSgnLi9zdG9yZXMvaW50cm9kdWN0aW9uLXN0b3JlJyk7XG5jb25zdCBSb3V0ZXIgPSByZXF1aXJlKCcuL3JvdXRlci1jb250YWluZXInKTtcbmNvbnN0IEV2ZW50Q29uc3RhbnRzID0gcmVxdWlyZSgnLi4vc2VydmVyL0V2ZW50Q29uc3RhbnRzJyk7XG5cbnZhciBhcGkgPSB7XG5cbiAgICBzZXR1cCgpIHtcblxuICAgICAgICBzb2NrZXQub24oJ2Nvbm5lY3QnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkNvbm5lY3RlZCB0byBzZXJ2ZXIgV2ViU29ja2V0XCIpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJBc2tpbmcgc2VydmVyIGZvciBhcHAgc3RhdGVcIik7XG4gICAgICAgICAgICBhcGkuYXNrRm9yQXBwU3RhdGUoKTtcbiAgICAgICAgICAgIE1lc3NhZ2VBY3Rpb25DcmVhdG9ycy5yZW1vdmVNZXNzYWdlKCdkaXNjb25uZWN0IG1lc3NhZ2UnKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgc29ja2V0Lm9uKCdkaXNjb25uZWN0JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgTWVzc2FnZUFjdGlvbkNyZWF0b3JzLmFkZE1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgIGlkOiAnZGlzY29ubmVjdCBtZXNzYWdlJyxcbiAgICAgICAgICAgICAgICB0ZXh0OiAnTWlzdGV0IGtvbnRha3QgbWVkIHNlcnZlcmVuLiBMYXN0IHNpZGVuIHDDpSBueXR0JyxcbiAgICAgICAgICAgICAgICBsZXZlbDogJ2RhbmdlcidcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBzb2NrZXQub24oRXZlbnRDb25zdGFudHMuTUlTU0lPTl9TVEFSVEVELCAoYXBwU3RhdGUpID0+IHtcbiAgICAgICAgICAgIE1pc3Npb25BY3Rpb25DcmVhdG9ycy5taXNzaW9uU3RhcnRlZCgpO1xuICAgICAgICAgICAgdGhpcy5fYXBwU3RhdGVSZWNlaXZlZChhcHBTdGF0ZSk7XG4gICAgICAgIH0pO1xuICAgICAgICBzb2NrZXQub24oRXZlbnRDb25zdGFudHMuTUlTU0lPTl9TVE9QUEVELCAoKSA9PiBNaXNzaW9uQWN0aW9uQ3JlYXRvcnMubWlzc2lvblN0b3BwZWQoKSk7XG4gICAgICAgIHNvY2tldC5vbihFdmVudENvbnN0YW50cy5NSVNTSU9OX0NPTVBMRVRFRCwgKCk9PiBNaXNzaW9uQWN0aW9uQ3JlYXRvcnMubWlzc2lvbkNvbXBsZXRlZCgpKTtcbiAgICAgICAgc29ja2V0Lm9uKEV2ZW50Q29uc3RhbnRzLk1JU1NJT05fUkVTRVQsICgpPT4gTWlzc2lvbkFjdGlvbkNyZWF0b3JzLm1pc3Npb25XYXNSZXNldCgpKTtcblxuICAgICAgICBzb2NrZXQub24oRXZlbnRDb25zdGFudHMuU0VUX0VWRU5UUywgTWlzc2lvbkFjdGlvbkNyZWF0b3JzLnJlY2VpdmVkRXZlbnRzKTtcbiAgICAgICAgc29ja2V0Lm9uKEV2ZW50Q29uc3RhbnRzLkFERF9NRVNTQUdFLCAoc2VydmVyTXNnKSA9PiB7XG4gICAgICAgICAgICBpZiAoc2VydmVyTXNnLmF1ZGllbmNlICYmIHNlcnZlck1zZy5hdWRpZW5jZSAhPT0gUm91dGVyLmdldFRlYW1JZCgpKSByZXR1cm47XG5cbiAgICAgICAgICAgIE1lc3NhZ2VBY3Rpb25DcmVhdG9ycy5hZGRNZXNzYWdlKHNlcnZlck1zZyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHNvY2tldC5vbignbWlzc2lvbiB0aW1lJywgTWlzc2lvbkFjdGlvbkNyZWF0b3JzLnNldE1pc3Npb25UaW1lKTtcblxuICAgICAgICBzb2NrZXQub24oRXZlbnRDb25zdGFudHMuQVBQX1NUQVRFLCAoc3RhdGUpID0+IHtcbiAgICAgICAgICAgIHRoaXMuX2FwcFN0YXRlUmVjZWl2ZWQoc3RhdGUpO1xuICAgICAgICB9KTtcblxuICAgIH0sXG5cbiAgICBzdGFydE1pc3Npb24oKXtcbiAgICAgICAgc29ja2V0LmVtaXQoJ3N0YXJ0IG1pc3Npb24nKTtcbiAgICB9LFxuXG4gICAgc3RvcE1pc3Npb24oKXtcbiAgICAgICAgc29ja2V0LmVtaXQoJ3N0b3AgbWlzc2lvbicpO1xuICAgIH0sXG5cbiAgICByZXNldE1pc3Npb24oKXtcbiAgICAgICAgc29ja2V0LmVtaXQoJ3Jlc2V0IG1pc3Npb24nKTtcbiAgICB9LFxuXG4gICAgYXNrVG9TdGFydE5leHRDaGFwdGVyKCl7XG4gICAgICAgIHNvY2tldC5lbWl0KEV2ZW50Q29uc3RhbnRzLkFEVkFOQ0VfQ0hBUFRFUik7XG4gICAgfSxcblxuICAgIHRyaWdnZXJFdmVudCh1dWlkKXtcbiAgICAgICAgc29ja2V0LmVtaXQoRXZlbnRDb25zdGFudHMuVFJJR0dFUl9FVkVOVCwgdXVpZCk7XG4gICAgfSxcblxuICAgIC8qXG4gICAgICogU2VuZCBmdWxsIGFwcCBoZWxkIHN0YXRlIChmb3IgdGhlIGN1cnJlbnQgdGVhbSkgdG8gc2VydmVyIG9uIGNoYW5nZVxuICAgICAqIFRoZSBtb3N0IGltcG9ydGFudCBiaXRzIGFyZSBoZWxkIG9uIHNlcnZlciwgYW5kIGlzIG5vdCB0cmFuc2ZlcnJlZCBiYWNrLFxuICAgICAqIHN1Y2ggYXMgaWYgdGhlIG1pc3Npb24gaXMgcnVubmluZywgdGhlIGN1cnJlbnQgY2hhcHRlciwgZXRjLlxuICAgICAqIEJFV0FSRTogT05MWSBVU0lORyBMT0NBTCBTVE9SQUdFIFVOVElMIFNFUlZFUiBDT01NVU5JQ0FUSU9OIElTIFVQIEFORCBSVU5OSU5HXG4gICAgICovXG4gICAgc2VuZFRlYW1TdGF0ZUNoYW5nZSh0ZWFtSWQpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1RPRE86IFNlcnZlckFjdGlvbkNyZWF0b3JzLnNlbmRUZWFtU3RhdGVDaGFuZ2UnKTtcbiAgICAgICAgbGV0IHN0YXRlID0ge307XG5cbiAgICAgICAgc3RhdGUudGVhbSA9IHRlYW1JZDtcbiAgICAgICAgc3RhdGUuaW50cm9kdWN0aW9uX3JlYWQgPSBJbnRyb2R1Y3Rpb25TdG9yZS5pc0ludHJvZHVjdGlvblJlYWQodGVhbUlkKTtcbiAgICAgICAgc3RhdGUuY3VycmVudF90YXNrID0gUm91dGVyLmdldFRhc2tJZCgpO1xuXG4gICAgICAgIC8vIFRPRE86IGZhY3RvciBvdXQgdGVhbSBzcGVjaWZpYyBzdGF0ZSBsb2dpYyBpbnRvIHVuaXQgb2YgaXRzIG93blxuICAgICAgICBpZiAodGVhbUlkID09PSAnc2NpZW5jZScpIHtcbiAgICAgICAgICAgIHN0YXRlLnJhZGlhdGlvbiA9IFJhZGlhdGlvblN0b3JlLmdldFN0YXRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBzb2NrZXQuZW1pdCgnc2V0IHRlYW0gc3RhdGUnLCBzdGF0ZSk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdzZW5kaW5nIHNjaWVuY2Ugc3RhdGUgdG8gc2VydmVyJywgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBjb21wbGV0ZU1pc3Npb24oKXtcbiAgICAgIHNvY2tldC5lbWl0KEV2ZW50Q29uc3RhbnRzLkNPTVBMRVRFX01JU1NJT04pO1xuICAgIH0sXG5cbiAgICAvKlxuICAgICAqIFRoaXMgaXMgb25seSBzdHViYmVkIG91dCB1bnRpbCBzZXJ2ZXIgY29tbXVuaWNhdGlvbiBpcyB1cCBhbmQgcnVubmluZ1xuICAgICAqL1xuICAgIGFza0ZvckFwcFN0YXRlKCkge1xuICAgICAgICBzb2NrZXQuZW1pdCgnZ2V0IGFwcCBzdGF0ZScpO1xuICAgIH0sXG5cbiAgICBhc2tGb3JNaXNzaW9uVGltZSgpe1xuICAgICAgICBzb2NrZXQuZW1pdCgnZ2V0IG1pc3Npb24gdGltZScpO1xuICAgIH0sXG5cbiAgICBfYXBwU3RhdGVSZWNlaXZlZChhcHBTdGF0ZSkge1xuICAgICAgICBBcHBEaXNwYXRjaGVyLmRpc3BhdGNoKHthY3Rpb246IE1pc3Npb25Db25zdGFudHMuUkVDRUlWRURfQVBQX1NUQVRFLCBhcHBTdGF0ZX0pO1xuICAgICAgICBNaXNzaW9uQWN0aW9uQ3JlYXRvcnMuc2V0TWlzc2lvblRpbWUoYXBwU3RhdGUuZWxhcHNlZF9taXNzaW9uX3RpbWUpO1xuICAgICAgICBTY2llbmNlVGVhbUFjdGlvbkNyZWF0b3JzLnRlYW1TdGF0ZVJlY2VpdmVkKGFwcFN0YXRlLnNjaWVuY2UpO1xuICAgIH0sXG5cbiAgICBhc2tGb3JFdmVudHMoKXtcbiAgICAgICAgc29ja2V0LmVtaXQoRXZlbnRDb25zdGFudHMuR0VUX0VWRU5UUyk7XG4gICAgfVxuXG59O1xuXG53aW5kb3cuX19hcGkgPSBhcGk7XG5tb2R1bGUuZXhwb3J0cyA9IGFwaTtcbiIsIi8qIFNjcmlwdCB0byBib290c3RyYXAgdGhlIGFwcGxpY2F0aW9uICovXG5cbnZhciBNaXNzaW9uQWN0aW9uQ3JlYXRvcnMgPSByZXF1aXJlKCcuL2FjdGlvbnMvTWlzc2lvbkFjdGlvbkNyZWF0b3JzJyksXG4gICAgTWVzc2FnZUFjdGlvbkNyZWF0b3JzID0gcmVxdWlyZSgnLi9hY3Rpb25zL01lc3NhZ2VBY3Rpb25DcmVhdG9ycycpLFxuICAgIFNjaWVuY2VBY3Rpb25DcmVhdG9ycyA9IHJlcXVpcmUoJy4vYWN0aW9ucy9TY2llbmNlQWN0aW9uQ3JlYXRvcnMnKSxcbiAgICBTY2llbmNlQ29uc3RhbnRzID0gcmVxdWlyZSgnLi9jb25zdGFudHMvU2NpZW5jZVRlYW1Db25zdGFudHMnKSxcbiAgICBUaW1lckFjdGlvbkNyZWF0b3JzID0gcmVxdWlyZSgnLi9hY3Rpb25zL1RpbWVyQWN0aW9uQ3JlYXRvcnMnKSxcbiAgICBBcHBEaXNwYXRjaGVyID0gcmVxdWlyZSgnLi9hcHBkaXNwYXRjaGVyJyk7XG5cbkFwcERpc3BhdGNoZXIucmVnaXN0ZXIoKHBheWxvYWQpPT4ge1xuICAgIGNvbnNvbGUubG9nKCdERUJVRyBBcHBEaXNwYXRjaGVyLmRpc3BhdGNoJywgcGF5bG9hZCk7XG59KTtcblxuZnVuY3Rpb24gcnVuKCkge1xuXG5cbiAgICAvLyBkdW1teSB1bnRpbCB3ZSBoYXZlIGludGVncmF0aW9uIHdpdGggd2Vic29ja2V0c1xuICAgIC8vc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIC8vTWlzc2lvbkFjdGlvbkNyZWF0b3JzLnN0YXJ0TWlzc2lvbigpO1xuICAgIC8vfSwgMzAwKTtcblxuICAgIC8vIHBsYXkgd2l0aCByYWRpYXRpb25cbiAgICBUaW1lckFjdGlvbkNyZWF0b3JzLnNldFRpbWVyKFNjaWVuY2VDb25zdGFudHMuU0NJRU5DRV9USU1FUl8xLCAzMCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge3J1bn07IiwiY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuY29uc3QgUm91dGVyID0gcmVxdWlyZSgncmVhY3Qtcm91dGVyJyk7XG5cbmNvbnN0IFJvdXRlSGFuZGxlciA9IFJvdXRlci5Sb3V0ZUhhbmRsZXI7XG5cbmNvbnN0IEhlYWRlciA9IHJlcXVpcmUoJy4vaGVhZGVyLnJlYWN0Jyk7XG5cbmNvbnN0IE1lc3NhZ2VMaXN0ID0gcmVxdWlyZSgnLi9tZXNzYWdlLWxpc3QucmVhY3QnKTtcbmNvbnN0IE1pc3Npb25TdGF0ZVN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL21pc3Npb24tc3RhdGUtc3RvcmUnKTtcblxuY29uc3QgQXBwID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgbWl4aW5zOiBbXSxcblxuICAgIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHtpc01pc3Npb25SdW5uaW5nOiBNaXNzaW9uU3RhdGVTdG9yZS5pc01pc3Npb25SdW5uaW5nKCl9O1xuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsTW91bnQoKSB7XG4gICAgICAgIE1pc3Npb25TdGF0ZVN0b3JlLmFkZENoYW5nZUxpc3RlbmVyKHRoaXMuX2hhbmRsZU1pc3Npb25TdGF0ZUNoYW5nZSk7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50KCl7XG4gICAgICAgIGNvbnNvbGUubG9nKCdBcHAuY29tcG9uZW50RGlkTW91bnQnKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIE1pc3Npb25TdGF0ZVN0b3JlLnJlbW92ZUNoYW5nZUxpc3RlbmVyKHRoaXMuX2hhbmRsZU1pc3Npb25TdGF0ZUNoYW5nZSk7XG4gICAgfSxcblxuICAgIF9oYW5kbGVNaXNzaW9uU3RhdGVDaGFuZ2UoKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2lzTWlzc2lvblJ1bm5pbmc6IE1pc3Npb25TdGF0ZVN0b3JlLmlzTWlzc2lvblJ1bm5pbmcoKX0pO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J2NvbnRhaW5lcic+XG5cbiAgICAgICAgICAgICAgICA8SGVhZGVyLz5cblxuICAgICAgICAgICAgICAgIHsvKiB0aGlzIGlzIHRoZSBpbXBvcnRhbnQgcGFydCAqL31cbiAgICAgICAgICAgICAgICA8Um91dGVIYW5kbGVyIHsuLi50aGlzLnByb3BzfSB7Li4udGhpcy5zdGF0ZX0gLz5cblxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicm93XCI+XG4gICAgICAgICAgICAgICAgICAgIDxmb290ZXIgaWQ9J21haW4tZm9vdGVyJz48L2Zvb3Rlcj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcDsiLCJjb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5jb25zdCBMaW5rID0gcmVxdWlyZSgncmVhY3Qtcm91dGVyJykuTGluaztcbmNvbnN0IE1pc3Npb25TdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3Jlcy9taXNzaW9uLXN0YXRlLXN0b3JlJyk7XG5jb25zdCBNaXNzaW9uVGltZXIgPSByZXF1aXJlKCcuL21pc3Npb24tdGltZXIucmVhY3QnKTtcbmNvbnN0IEV2ZW50U3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZXMvZXZlbnQtc3RvcmUnKTtcbmNvbnN0IHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcbmNvbnN0IGdldE1pc3Npb25BQyA9IChmdW5jdGlvbiAoKSB7XG4gICAgbGV0IHRtcCA9IG51bGw7XG4gICAgcmV0dXJuICgpPT4ge1xuICAgICAgICBpZiAoIXRtcCkgdG1wID0gcmVxdWlyZSgnLi4vYWN0aW9ucy9NaXNzaW9uQWN0aW9uQ3JlYXRvcnMnKTtcbiAgICAgICAgcmV0dXJuIHRtcDtcbiAgICB9XG59KSgpO1xuXG5jb25zdCBFdmVudFRhYmxlID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgcHJvcFR5cGVzOiB7XG4gICAgICAgIGV2ZW50czogUmVhY3QuUHJvcFR5cGVzLmFycmF5LmlzUmVxdWlyZWRcbiAgICB9LFxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPHRhYmxlIGNsYXNzTmFtZT0ndGFibGUnPlxuICAgICAgICAgICAgICAgIDx0aGVhZD5cbiAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgIDx0aD5UaW1lPC90aD5cbiAgICAgICAgICAgICAgICAgICAgPHRoPkRlc2NyaXB0aW9uPC90aD5cbiAgICAgICAgICAgICAgICAgICAgPHRoPlZhbHVlPC90aD5cbiAgICAgICAgICAgICAgICAgICAgPHRoPlRyaWdnZXI8L3RoPlxuICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgPC90aGVhZD5cblxuICAgICAgICAgICAgICAgIDx0Ym9keT5cbiAgICAgICAgICAgICAgICB7ICB0aGlzLnByb3BzLmV2ZW50cy5tYXAoKGV2KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiA8dHIga2V5PXtldi5pZH0+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dGQ+e2V2LnRyaWdnZXJUaW1lfTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dGQ+e2V2LnNob3J0X2Rlc2NyaXB0aW9ufTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dGQ+e0pTT04uc3RyaW5naWZ5KGV2LnZhbHVlIHx8ICcnKX08L3RkPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRkPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPSdidG4gYnRuLXByaW1hcnknXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBnZXRNaXNzaW9uQUMoKS5hc2tUb1RyaWdnZXJFdmVudChldi5pZCl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID5UcmlnZ2VyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgIH0pfVxuICAgICAgICAgICAgICAgIDwvdGJvZHk+XG4gICAgICAgICAgICA8L3RhYmxlPlxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG52YXIgQXBwID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgY29tcG9uZW50V2lsbE1vdW50KCl7XG4gICAgICAgIHZhciBhYyA9IGdldE1pc3Npb25BQygpO1xuICAgICAgICBhYy5hc2tGb3JFdmVudHMoKTtcblxuICAgICAgICBFdmVudFN0b3JlLmFkZENoYW5nZUxpc3RlbmVyKHRoaXMuX29uQ2hhbmdlKTtcbiAgICAgICAgTWlzc2lvblN0b3JlLmFkZENoYW5nZUxpc3RlbmVyKHRoaXMuX29uQ2hhbmdlKVxuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpe1xuICAgICAgICBFdmVudFN0b3JlLnJlbW92ZUNoYW5nZUxpc3RlbmVyKHRoaXMuX29uQ2hhbmdlKTtcbiAgICAgICAgTWlzc2lvblN0b3JlLnJlbW92ZUNoYW5nZUxpc3RlbmVyKHRoaXMuX29uQ2hhbmdlKVxuICAgIH0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjb21wbGV0ZWRFdmVudHM6IFtdLFxuICAgICAgICAgICAgb3ZlcmR1ZUV2ZW50czogW10sXG4gICAgICAgICAgICByZW1haW5pbmdFdmVudHM6IFtdLFxuICAgICAgICAgICAgcnVubmluZzogTWlzc2lvblN0b3JlLmlzTWlzc2lvblJ1bm5pbmcoKSxcbiAgICAgICAgICAgIGNoYXB0ZXI6IE1pc3Npb25TdG9yZS5jdXJyZW50Q2hhcHRlcigpXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgX29uQ2hhbmdlKCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGNvbXBsZXRlZEV2ZW50czogRXZlbnRTdG9yZS5jb21wbGV0ZWQoKSxcbiAgICAgICAgICAgIG92ZXJkdWVFdmVudHM6IEV2ZW50U3RvcmUub3ZlcmR1ZSgpLFxuICAgICAgICAgICAgcmVtYWluaW5nRXZlbnRzOiBFdmVudFN0b3JlLnJlbWFpbmluZygpLFxuICAgICAgICAgICAgcnVubmluZzogTWlzc2lvblN0b3JlLmlzTWlzc2lvblJ1bm5pbmcoKSxcbiAgICAgICAgICAgIGNoYXB0ZXI6IE1pc3Npb25TdG9yZS5jdXJyZW50Q2hhcHRlcigpXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICByZW5kZXIoKSB7XG5cbiAgICAgICAgdmFyIHN0YXR1cztcblxuICAgICAgICBpZiAoIXRoaXMuc3RhdGUucnVubmluZykge1xuICAgICAgICAgICAgc3RhdHVzID0gPHAgaWQ9XCJtaXNzaW9uVGltZVwiPk9wcGRyYWdldCBoYXIgaWtrZSBzdGFydGV0PC9wPjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2PlxuXG4gICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgPGgzPlN0YXR1czwvaDM+XG4gICAgICAgICAgICAgICAgICAgIHtzdGF0dXN9XG5cbiAgICAgICAgICAgICAgICAgICAgPGRsPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGR0Pk7DpXbDpnJlbmRlIGthcGl0dGVsOjwvZHQ+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGQ+e3RoaXMuc3RhdGUuY2hhcHRlcn08L2RkPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGR0PlRpZCBicnVrdCBpIGthcGl0dGVsPC9kdD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkZD48TWlzc2lvblRpbWVyIC8+PC9kZD5cbiAgICAgICAgICAgICAgICAgICAgPC9kbD5cblxuICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9J2J0biBidG4tcHJpbWFyeScgb25DbGljaz17Z2V0TWlzc2lvbkFDKCkuc3RhcnRNaXNzaW9ufT5TdGFydCBvcHBkcmFnPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPSdidG4gYnRuLXByaW1hcnknIG9uQ2xpY2s9e2dldE1pc3Npb25BQygpLnN0b3BNaXNzaW9ufT5TdG9wPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPSdidG4gYnRuLXByaW1hcnknIG9uQ2xpY2s9e2dldE1pc3Npb25BQygpLmFza1RvU3RhcnROZXh0Q2hhcHRlcn0+TmVzdGUga2FwaXR0ZWxcbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPSdidG4gYnRuLXByaW1hcnknIG9uQ2xpY2s9e2dldE1pc3Npb25BQygpLnJlc2V0TWlzc2lvbn0+QmVneW5uIHDDpSBueXR0PC9idXR0b24+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT0nYnRuIGJ0bi1wcmltYXJ5JyBvbkNsaWNrPXtnZXRNaXNzaW9uQUMoKS5jb21wbGV0ZU1pc3Npb259Pk9wcGRyYWcgdXRmw7hydDwvYnV0dG9uPlxuXG5cbiAgICAgICAgICAgICAgICA8aDI+Q2hhcHRlciBldmVudHM8L2gyPlxuXG4gICAgICAgICAgICAgICAgPGgzPnJlbWFpbmluZzwvaDM+XG4gICAgICAgICAgICAgICAgPEV2ZW50VGFibGUga2V5PVwiZm9vXCIgZXZlbnRzPXt0aGlzLnN0YXRlLnJlbWFpbmluZ0V2ZW50c30vPlxuXG4gICAgICAgICAgICAgICAgPGgzPm92ZXJkdWU8L2gzPlxuICAgICAgICAgICAgICAgIDxFdmVudFRhYmxlIGV2ZW50cz17dGhpcy5zdGF0ZS5vdmVyZHVlRXZlbnRzfS8+XG5cbiAgICAgICAgICAgICAgICA8aDM+Y29tcGxldGVkPC9oMz5cbiAgICAgICAgICAgICAgICA8RXZlbnRUYWJsZSBldmVudHM9e3RoaXMuc3RhdGUuY29tcGxldGVkRXZlbnRzfS8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcDtcbiIsIi8vIG5lZWRlZCB0byBhdm9pZCBjb21waWxhdGlvbiBlcnJvclxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBzY2llbmNlX2ludHJvOiA8ZGl2PlxuICAgICAgICA8cD5cbiAgICAgICAgICAgIERlcmUgc2thbCBvdmVydsOla2Ugc3Ryw6VsaW5nc25pdsOlZXQgYXN0cm9uYXR1ZW4gdXRzZXR0ZXMgZm9yLlxuICAgICAgICAgICAgRGVyZSBtw6UgZGEgcGFzc2UgcMOlIGF0IGFzdHJvbmF1dGVuIGlra2UgYmxpciB1dHNhdHRcbiAgICAgICAgICAgIGZvciBzdHLDpWxpbmdzbml2w6VlciBzb20gZXIgc2thZGVsaWcuXG4gICAgICAgIDwvcD5cbiAgICAgICAgPHA+VmVkIGhqZWxwIGF2IGluc3RydW1lbnRlbmUgc29tIGVyIHRpbGdqZW5nZWxpZyBtw6UgZGVyZSBqZXZubGlnXG4gICAgICAgICAgICB0YSBwcsO4dmVyIG9nIHJlZ25lIHV0IHZlcmRpZW5lIGZvciBnamVubm9tc25pdHRsaWcgb2cgdG90YWx0XG4gICAgICAgICAgICBzdHLDpWxpbmdzbml2w6UuIEZpbm5lciBkZXJlIHV0IGF0IG5pdsOlZW5lIGVyIGJsaXR0IGZhcmxpZ1xuICAgICAgICAgICAgaMO4eWUgPGVtPm3DpTwvZW0+IGRlcmUgc2kgZnJhIHRpbCBvcHBkcmFnc2xlZGVyZW4gc8OlIHZpIGthblxuICAgICAgICAgICAgZsOlIHV0IGFzdHJvbmF1dGVuIVxuICAgICAgICA8L3A+XG5cblxuICAgICAgICA8cD5cbiAgICAgICAgICAgIEVyIG9wcGRyYWdldCBmb3JzdMOldHQ/XG4gICAgICAgIDwvcD5cbiAgICA8L2Rpdj5cbn0iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICByZW5kZXIoKXtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdEVU1NWV9SRU5ERVIuIFRoaXMgcmVhY3QgY29tcG9uZW50IGlzIG5vdCBmb3IgcHJlc2VudGF0aW9uYWwgcHVycG9zZXMnKTtcbiAgICB9XG59O1xuIiwiY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgcGxheWVyO1xuZnVuY3Rpb24gb25Zb3VUdWJlSWZyYW1lQVBJUmVhZHkoKSB7XG4gICAgY29uc29sZS5sb2coJ29uWW91VHViZUlmcmFtZUFQSVJlYWR5Jyk7XG4gICAgcGxheWVyID0gbmV3IFlULlBsYXllcigncGxheWVyJywge1xuICAgICAgICBldmVudHM6IHtcbiAgICAgICAgICAgICdvblJlYWR5Jzogb25QbGF5ZXJSZWFkeVxuICAgICAgICB9XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIHBsYXlWaWRlbygpe1xuICAgIHBsYXllci5zZWVrVG8oOTYpO1xuICAgIHBsYXllci5wbGF5VmlkZW8oKTtcblxuICAgIC8vIHN0b3AgdmlkZW8gYWZ0ZXIgdGVuIHNlY29uZHNcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcGxheWVyLnN0b3BWaWRlbyhwbGF5ZXIpXG4gICAgICAgIHBsYXlWaWRlbygpO1xuICAgIH0sMTBFMyk7XG59XG5cbmZ1bmN0aW9uIG9uUGxheWVyUmVhZHkoZXZlbnQpIHtcbiAgICAvL2V2ZW50LnRhcmdldC5tdXRlKCk7XG4gICAgcGxheWVyLm11dGUoKTtcbiAgICBwbGF5VmlkZW8oKTtcbn1cblxuXG53aW5kb3cub25Zb3VUdWJlSWZyYW1lQVBJUmVhZHkgPSBvbllvdVR1YmVJZnJhbWVBUElSZWFkeTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICAvKiBodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS95b3V0dWJlL2lmcmFtZV9hcGlfcmVmZXJlbmNlI0dldHRpbmdfU3RhcnRlZCAqL1xuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICBjb25zb2xlLmxvZygnY29tcG9uZW50RGlkTW91bnQnKTtcbiAgICAgICAgdmFyIHRhZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuXG4gICAgICAgIHRhZy5zcmMgPSBcImh0dHBzOi8vd3d3LnlvdXR1YmUuY29tL2lmcmFtZV9hcGlcIjtcbiAgICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZCh0YWcpO1xuICAgIH0sXG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHZhciByaWNrUm9sbGVkID0gJ2h0dHA6Ly93d3cueW91dHViZS5jb20vZW1iZWQvb0hnNVNKWVJIQTA/YXV0b3BsYXk9MSc7XG4gICAgICAgIHZhciBvcmlnaW4gPSBsb2NhdGlvbi5wcm90b2NvbCArICcvLycgKyBsb2NhdGlvbi5ob3N0XG4gICAgICAgIHZhciBzb2xhclN0b3JtID0gJ2h0dHA6Ly93d3cueW91dHViZS5jb20vZW1iZWQvRFU0aHBzaXN0RGs/JnN0YXJ0PTk2JmVuYWJsZWpzYXBpPTEmb3JpZ2luPScgKyBvcmlnaW47XG4gICAgICAgIHZhciB2aWRlbyA9IHNvbGFyU3Rvcm07XG5cbiAgICAgICAgLy9yZXR1cm4gPGRpdiAvPlxuICAgICAgICByZXR1cm4gKFxuICAgICAgICA8aWZyYW1lIGlkPSdwbGF5ZXInXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7IHBvc2l0aW9uOidhYnNvbHV0ZScsIHRvcDogMCwgcmlnaHQ6IDAsIHdpZHRoOlwiMTAwJVwiLCBoZWlnaHQ6XCIxMDAlXCJ9fVxuICAgICAgICAgICAgICAgICAgICBzcmM9e3ZpZGVvfVxuICAgICAgICAgICAgICAgICAgICBmcmFtZUJvcmRlcj1cIjBcIiBhbGxvd0Z1bGxTY3JlZW4gLz5cbiAgICAgICAgKTtcbiAgICB9XG5cbn0pOyIsImNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbmNvbnN0IFJvdXRlciA9IHJlcXVpcmUoJ3JlYWN0LXJvdXRlcicpO1xuY29uc3QgTGluayA9IFJvdXRlci5MaW5rO1xuXG52YXIgSGVhZGVyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0ncm93Jz5cblxuICAgICAgICAgICAgICAgICAgICA8aGVhZGVyIGlkPSduYXJvbS1oZWFkZXInID5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGltZyBjbGFzc05hbWUgPSAnbmFyb20tbG9nby1pbWcnICBzcmM9Jy9pbWFnZXMvbG9nby5wbmcnIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTkFST00gZS1NaXNzaW9uIHByb3RvdHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvaGVhZGVyPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAgPGRpdiBpZD0nbWFpbi1oZWFkZXInIGNsYXNzTmFtZT0ncm93JyA+XG4gICAgICAgICAgICAgICAgICAgIDxMaW5rIHRvPScvJyA+XG4gICAgICAgICAgICAgICAgICAgICAgICA8aGVhZGVyID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aDEgY2xhc3NOYW1lID0gJyc+VW5kZXIgZW4gc29sc3Rvcm08L2gxPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9oZWFkZXI+XG4gICAgICAgICAgICAgICAgICAgIDwvTGluaz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gSGVhZGVyOyIsImNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbmNvbnN0IFJvdXRlciA9IHJlcXVpcmUoJ3JlYWN0LXJvdXRlcicpO1xuY29uc3QgTGluayA9IFJvdXRlci5MaW5rO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICByZW5kZXIgKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICA8aDM+VmVsZyBsYWc8L2gzPlxuICAgICAgICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgICAgICAgICAgPGxpPjxMaW5rIHRvPVwidGVhbS1yb290XCIgcGFyYW1zPXt7IHRlYW1JZCA6ICdzY2llbmNlJ319PkZvcnNrbmluZ3N0ZWFtZXQ8L0xpbms+PC9saT5cbiAgICAgICAgICAgICAgICAgICAgPGxpPiAuLi4gTGFnIDIsIDMsIDQgLi48L2xpPlxuICAgICAgICAgICAgICAgIDwvdWw+XG5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG5cbiIsImNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbmNvbnN0IGRpYWxvZ3MgPSByZXF1aXJlKCcuL2RpYWxvZ3MucmVhY3QnKTtcbmNvbnN0IHsgY2xlYW5Sb290UGF0aCB9ID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxuY29uc3QgUm91dGVTdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3Jlcy9yb3V0ZS1zdG9yZScpO1xudmFyIEludHJvU3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZXMvaW50cm9kdWN0aW9uLXN0b3JlJyk7XG5cbiBjb25zdCBJbnRyb2R1Y3Rpb25TY3JlZW4gPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBtaXhpbnM6IFtdLFxuXG4gICAgIGNvbnRleHRUeXBlczoge1xuICAgICAgICAgcm91dGVyOiBSZWFjdC5Qcm9wVHlwZXMuZnVuY1xuICAgICB9LFxuXG4gICAgc3RhdGljczoge1xuICAgICAgICB3aWxsVHJhbnNpdGlvblRvKHRyYW5zaXRpb24pIHtcbiAgICAgICAgICAgIHZhciB0ZWFtSWQgPSBjbGVhblJvb3RQYXRoKHRyYW5zaXRpb24ucGF0aCk7XG5cbiAgICAgICAgICAgIGlmIChJbnRyb1N0b3JlLmlzSW50cm9kdWN0aW9uUmVhZCh0ZWFtSWQpKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0ludHJvZHVjdGlvbiByZWFkIGVhcmxpZXInKTtcbiAgICAgICAgICAgICAgICB0cmFuc2l0aW9uLnJlZGlyZWN0KCd0ZWFtLXRhc2snLCB7dGFza0lkOiAnc2FtcGxlJywgdGVhbUlkIDogdGVhbUlkfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgX2hhbmRsZUNsaWNrKCkge1xuICAgICAgICBjb25zdCBNaXNzaW9uQWN0aW9uQ3JlYXRvcnMgPSByZXF1aXJlKCcuLi9hY3Rpb25zL01pc3Npb25BY3Rpb25DcmVhdG9ycycpO1xuXG4gICAgICAgIHZhciB0ZWFtSWQgPSBSb3V0ZVN0b3JlLmdldFRlYW1JZCgpO1xuICAgICAgICBNaXNzaW9uQWN0aW9uQ3JlYXRvcnMuaW50cm9XYXNSZWFkKHRlYW1JZCk7XG4gICAgICAgIHRoaXMuY29udGV4dC5yb3V0ZXIudHJhbnNpdGlvblRvKCd0ZWFtLXRhc2snLCB7dGFza0lkIDogJ3NhbXBsZScsIHRlYW1JZCA6IHRlYW1JZCB9KVxuICAgIH0sXG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHZhciB0ZWFtSWQ9IFJvdXRlU3RvcmUuZ2V0VGVhbUlkKCk7XG4gICAgICAgIHZhciBpbnRyb1RleHQgPSBkaWFsb2dzW3RlYW1JZCArICdfaW50cm8nXSB8fCA8cD5NYW5nbGVyIG9wcGRyYWc8L3A+O1xuXG4gICAgICAgIHJldHVybiAoPGRpdiBjbGFzc05hbWUgPSAncm93IGp1bWJvdHJvbiBpbnRyb3NjcmVlbic+XG4gICAgICAgICAgICA8aDI+TcOlbCBmb3Igb3BwZHJhZ2V0PC9oMj5cblxuICAgICAgICAgICAgeyBpbnRyb1RleHQgfVxuXG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lID0gJ2J0biBidG4tcHJpbWFyeSBidG4tbGcnXG4gICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5faGFuZGxlQ2xpY2t9XG4gICAgICAgICAgICA+SmVnIGZvcnN0w6VyPC9idXR0b24+XG4gICAgICAgIDwvZGl2PilcblxuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEludHJvZHVjdGlvblNjcmVlbjtcbiIsImNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbmNvbnN0IGFjdGlvbnMgPSByZXF1aXJlKCcuLi9hY3Rpb25zL01lc3NhZ2VBY3Rpb25DcmVhdG9ycycpO1xuXG52YXIgTGlzdE1lc3NhZ2VXcmFwcGVyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgcHJvcFR5cGVzOiB7XG4gICAgICAgIGxldmVsOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgICAgIHRleHQ6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICAgICAgaWQ6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZFxuICAgIH0sXG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGxldCBidXR0b247XG5cbiAgICAgICAgaWYgKHRoaXMucHJvcHMuZGlzbWlzc2FibGUpIHtcbiAgICAgICAgICAgIGJ1dHRvbiA9IChcbiAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJjbG9zZVwiXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGFjdGlvbnMucmVtb3ZlTWVzc2FnZSh0aGlzLnByb3BzLmlkKX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPsOXPC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8bGkgY2xhc3NOYW1lPXsgJ2FsZXJ0IGFsZXJ0LWRpc21pc3NpYmxlIGFsZXJ0LScgKyB0aGlzLnByb3BzLmxldmVsfSA+XG4gICAgICAgICAgICB7IGJ1dHRvbiB9XG4gICAgICAgICAgICB7dGhpcy5wcm9wcy50ZXh0fVxuICAgICAgICAgICAgPC9saT5cbiAgICAgICAgKTtcbiAgICB9XG59KTtcblxudmFyIE1lc3NhZ2VMaXN0ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICB2YXIgaGlkZGVuID0gdGhpcy5wcm9wcy5tZXNzYWdlcy5sZW5ndGggPT09IDAgPyAnaGlkZScgOiAnJztcbiAgICAgICAgdmFyIGNsYXNzZXMgPSAodGhpcy5wcm9wcy5jbGFzc05hbWUgfHwgJycpICsgJyBtZXNzYWdlYm94ICcgKyBoaWRkZW47XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDx1bCBjbGFzc05hbWUgPSB7IGNsYXNzZXMgfT5cbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm1lc3NhZ2VzLm1hcCgobXNnKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoPExpc3RNZXNzYWdlV3JhcHBlciBrZXk9e21zZy5pZH0gey4uLm1zZ30gLz4pO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICA8L3VsPlxuICAgICAgICApO1xuICAgIH1cblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTWVzc2FnZUxpc3Q7XG4iLCJjb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0JyksXG4gICAgVGltZXJTdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3Jlcy90aW1lci1zdG9yZScpLFxuICAgIFRpbWVyID0gcmVxdWlyZSgnLi90aW1lci5yZWFjdCcpO1xuXG5cbmNvbnN0IE1pc3Npb25UaW1lciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIGdldEluaXRpYWxTdGF0ZSgpe1xuICAgICAgICByZXR1cm4geyBlbGFwc2VkIDogVGltZXJTdG9yZS5nZXRFbGFwc2VkTWlzc2lvblRpbWUoKSB9O1xuICAgIH0sXG4gICAgXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgVGltZXJTdG9yZS5hZGRDaGFuZ2VMaXN0ZW5lcih0aGlzLl9oYW5kbGVUaW1lQ2hhbmdlKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgVGltZXJTdG9yZS5yZW1vdmVDaGFuZ2VMaXN0ZW5lcih0aGlzLl9oYW5kbGVUaW1lQ2hhbmdlKTtcbiAgICB9LFxuXG4gICAgX2hhbmRsZVRpbWVDaGFuZ2UoKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgZWxhcHNlZCA6IFRpbWVyU3RvcmUuZ2V0RWxhcHNlZE1pc3Npb25UaW1lKClcbiAgICAgICAgfSlcbiAgICB9LFxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gIDxUaW1lciBjbGFzc05hbWU9e3RoaXMucHJvcHMuY2xhc3NOYW1lfSB0aW1lSW5TZWNvbmRzPXt0aGlzLnN0YXRlLmVsYXBzZWQgfSAvPlxuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1pc3Npb25UaW1lcjtcblxuIiwiY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5jb25zdCBOb3RGb3VuZCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT0nY29udGFpbmVyJz5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicm93IGp1bWJvdHJvblwiPlxuICAgICAgICAgICAgICAgIDxkaXY+T2pzYW5uLiBUcm9yIGR1IGhhciBnw6V0dCBkZWcgdmlsbCwgamVnPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTm90Rm91bmQ7XG4iLCIvKlxuICogU2ltcGxlIGNvbXBvbmVudCB0aGF0IG92ZXJsYXlzIGEgc2VjdGlvbiwgc2lnbmFsbGluZyBhIGRpc2FibGVkIHN0YXRlXG4gKlxuICogRGVwZW5kYW50IG9uIHdvcmtpbmcgQ1NTLCBvZiBjb3Vyc2U6IHRoZSBwYXJlbnQgbXVzdCBiZSBwb3NpdGlvbmVkIChyZWxhdGl2ZSwgYWJzb2x1dGUsIC4uLilcbiAqIExvb3NlbHkgYmFzZWQgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8zNjI3MjgzL2hvdy10by1kaW0tb3RoZXItZGl2LW9uLWNsaWNraW5nLWlucHV0LWJveC11c2luZy1qcXVlcnlcbiAqL1xuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIHByb3BUeXBlczoge1xuICAgICAgICBhY3RpdmUgOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkXG4gICAgfSxcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLnByb3BzLmFjdGl2ZT8gPGRpdiBjbGFzc05hbWU9XCJvdmVybGF5XCIvPiA6IG51bGwpO1xuICAgIH1cblxufSk7IiwiLyoqXG4gKiBJbXBsZW1lbnRhdGlvbiBiYXNlZCBvbiB0aXBzIGluIHRoZSBhcnRpY2xlIGJ5IE5pY29sYXMgSGVyeVxuICogaHR0cDovL25pY29sYXNoZXJ5LmNvbS9pbnRlZ3JhdGluZy1kM2pzLXZpc3VhbGl6YXRpb25zLWluLWEtcmVhY3QtYXBwXG4gKlxuICogQ2hhcnQgY29kZSBtb3JlIG9yIGxlc3MgY29waWVkIGZyb20gdGhlIHByb3RvdHlwZSBieSBMZW8gTWFydGluIFdlc3RieVxuICovXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5jb25zdCBBbUNoYXJ0cyA9IHJlcXVpcmUoJ2FtY2hhcnRzJyk7XG5jb25zdCBjb25zdGFudHMgPSByZXF1aXJlKCcuLi9jb25zdGFudHMvU2NpZW5jZVRlYW1Db25zdGFudHMnKTtcblxudmFyIGNoYXJ0LCBjaGFydFVwZGF0ZXIsIGdldE5ld1ZhbHVlLCB1cGRhdGVGcmVxdWVuY3ksIG1heFNlY29uZHM7XG52YXIgcmFkaWF0aW9uU2FtcGxlcyA9IFtdO1xuXG5jb25zdCB7IHJhbmRvbUludCB9ID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxuZnVuY3Rpb24gaW5pdENoYXJ0KGRvbUVsZW1lbnQpIHtcblxuICAgIGNoYXJ0ID0gbmV3IEFtQ2hhcnRzLkFtU2VyaWFsQ2hhcnQoKTtcblxuICAgIGNoYXJ0Lm1hcmdpblRvcCA9IDIwO1xuICAgIGNoYXJ0Lm1hcmdpblJpZ2h0ID0gMDtcbiAgICBjaGFydC5tYXJnaW5MZWZ0ID0gMDtcbiAgICBjaGFydC5hdXRvTWFyZ2luT2Zmc2V0ID0gMDtcbiAgICBjaGFydC5kYXRhUHJvdmlkZXIgPSByYWRpYXRpb25TYW1wbGVzO1xuICAgIGNoYXJ0LmNhdGVnb3J5RmllbGQgPSBcInRpbWVzdGFtcFwiO1xuXG4gICAgLy9YIGF4aXNcbiAgICB2YXIgY2F0ZWdvcnlBeGlzID0gY2hhcnQuY2F0ZWdvcnlBeGlzO1xuICAgIGNhdGVnb3J5QXhpcy5kYXNoTGVuZ3RoID0gMTtcbiAgICBjYXRlZ29yeUF4aXMuZ3JpZEFscGhhID0gMC4xNTtcbiAgICBjYXRlZ29yeUF4aXMuYXhpc0NvbG9yID0gXCIjREFEQURBXCI7XG4gICAgY2F0ZWdvcnlBeGlzLnRpdGxlID0gXCJTZWNvbmRzXCI7XG5cbiAgICAvL1kgYXhpc1xuICAgIHZhciB2YWx1ZUF4aXMgPSBuZXcgQW1DaGFydHMuVmFsdWVBeGlzKCk7XG4gICAgdmFsdWVBeGlzLmF4aXNBbHBoYSA9IDAuMjtcbiAgICB2YWx1ZUF4aXMuZGFzaExlbmd0aCA9IDE7XG4gICAgdmFsdWVBeGlzLnRpdGxlID0gXCLOvFN2L2hcIjtcbiAgICB2YWx1ZUF4aXMubWluaW11bSA9IGNvbnN0YW50cy5TQ0lFTkNFX1JBRElBVElPTl9NSU47XG4gICAgdmFsdWVBeGlzLm1heGltdW0gPSBjb25zdGFudHMuU0NJRU5DRV9SQURJQVRJT05fTUFYO1xuICAgIGNoYXJ0LmFkZFZhbHVlQXhpcyh2YWx1ZUF4aXMpO1xuXG4gICAgLy9MaW5lXG4gICAgdmFyIGdyYXBoID0gbmV3IEFtQ2hhcnRzLkFtR3JhcGgoKTtcbiAgICBncmFwaC52YWx1ZUZpZWxkID0gXCJyYWRpYXRpb25cIjtcbiAgICBncmFwaC5idWxsZXQgPSBcInJvdW5kXCI7XG4gICAgZ3JhcGguYnVsbGV0Qm9yZGVyQ29sb3IgPSBcIiNGRkZGRkZcIjtcbiAgICBncmFwaC5idWxsZXRCb3JkZXJUaGlja25lc3MgPSAyO1xuICAgIGdyYXBoLmxpbmVUaGlja25lc3MgPSAyO1xuICAgIGdyYXBoLmxpbmVDb2xvciA9IFwiI2I1MDMwZFwiO1xuICAgIGdyYXBoLm5lZ2F0aXZlTGluZUNvbG9yID0gXCIjMjI4QjIyXCI7XG4gICAgZ3JhcGgubmVnYXRpdmVCYXNlID0gNjA7XG4gICAgZ3JhcGguaGlkZUJ1bGxldHNDb3VudCA9IDUwO1xuICAgIGNoYXJ0LmFkZEdyYXBoKGdyYXBoKTtcblxuICAgIC8vTW91c2VvdmVyXG4gICAgY29uc3QgY2hhcnRDdXJzb3IgPSBuZXcgQW1DaGFydHMuQ2hhcnRDdXJzb3IoKTtcbiAgICBjaGFydEN1cnNvci5jdXJzb3JQb3NpdGlvbiA9IFwibW91c2VcIjtcbiAgICBjaGFydC5hZGRDaGFydEN1cnNvcihjaGFydEN1cnNvcik7XG4gICAgY2hhcnQud3JpdGUoZG9tRWxlbWVudCk7XG59XG5cbi8vQWRkcyBhIG5ldyByYWRpYXRpb24gc2FtcGxlIHRvIHRoZSBjaGFydCBldmVyeSBmZXcgc2Vjb25kc1xuZnVuY3Rpb24gc3RhcnRFdmVudExvb3AoKSB7XG4gICAgdmFyIHN0YXJ0VGltZSA9IERhdGUubm93KCk7XG4gICAgc3RvcEV2ZW50TG9vcCgpO1xuXG4gICAgY2hhcnRVcGRhdGVyID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc2Vjb25kc1Bhc3NlZCA9IChEYXRlLm5vdygpIC0gc3RhcnRUaW1lKSAvIDEwMDA7XG5cbiAgICAgICAgcmFkaWF0aW9uU2FtcGxlcy5wdXNoKHtcbiAgICAgICAgICAgIHRpbWVzdGFtcDogTWF0aC5mbG9vcihzZWNvbmRzUGFzc2VkICsgMC41KSxcbiAgICAgICAgICAgIHJhZGlhdGlvbjogZ2V0TmV3VmFsdWUoKVxuICAgICAgICB9KTtcblxuICAgICAgICAvL1doZW4gdGhlIGNoYXJ0IGdyb3dzLCBzdGFydCBjdXR0aW5nIG9mZiB0aGUgb2xkZXN0IHNhbXBsZSB0byBnaXZlIHRoZSBjaGFydCBhIHNsaWRpbmcgZWZmZWN0XG4gICAgICAgIGlmIChyYWRpYXRpb25TYW1wbGVzLmxlbmd0aCA+IChtYXhTZWNvbmRzIC8gdXBkYXRlRnJlcXVlbmN5KSkge1xuICAgICAgICAgICAgcmFkaWF0aW9uU2FtcGxlcy5zaGlmdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgY2hhcnQudmFsaWRhdGVEYXRhKCk7XG4gICAgfSwgdXBkYXRlRnJlcXVlbmN5ICogMTAwMCk7XG59XG5cbmZ1bmN0aW9uIHN0b3BFdmVudExvb3AoKSB7XG4gICAgY2xlYXJJbnRlcnZhbChjaGFydFVwZGF0ZXIpO1xufVxuXG5jb25zdCBSYWRpYXRpb25DaGFydCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIHN0YXRpY3M6IHt9LFxuXG4gICAgcHJvcFR5cGVzOiB7XG4gICAgICAgIHVwZGF0ZUZyZXF1ZW5jeVNlY29uZHM6IFJlYWN0LlByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgICAgICAgbWF4U2Vjb25kc1Nob3duOiBSZWFjdC5Qcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gICAgICAgIGdldE5ld1ZhbHVlOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgICAgICBoZWlnaHQ6IFJlYWN0LlByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgICAgICAgd2lkdGg6IFJlYWN0LlByb3BUeXBlcy5udW1iZXJcbiAgICB9LFxuXG4gICAgbWl4aW5zOiBbXSxcblxuICAgIGNvbXBvbmVudFdpbGxNb3VudCgpIHtcbiAgICAgICAgdXBkYXRlRnJlcXVlbmN5ID0gdGhpcy5wcm9wcy51cGRhdGVGcmVxdWVuY3lTZWNvbmRzO1xuICAgICAgICBtYXhTZWNvbmRzID0gdGhpcy5wcm9wcy5tYXhTZWNvbmRzU2hvd247XG4gICAgICAgIGdldE5ld1ZhbHVlID0gdGhpcy5wcm9wcy5nZXROZXdWYWx1ZTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHZhciBlbCA9IFJlYWN0LmZpbmRET01Ob2RlKHRoaXMpO1xuICAgICAgICBpbml0Q2hhcnQoZWwpO1xuICAgICAgICBzdGFydEV2ZW50TG9vcCgpO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKCkge1xuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgY2hhcnQgJiYgY2hhcnQuY2xlYXIoKTtcbiAgICAgICAgc3RvcEV2ZW50TG9vcCgpO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRVbm1vdW50KCkge1xuICAgICAgICBjaGFydCA9IG51bGw7XG4gICAgICAgIC8vcmFkaWF0aW9uU2FtcGxlcy5sZW5ndGggPSAwO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRVcGRhdGUoKSB7XG4gICAgfSxcblxuICAgIC8vIHRoaXMgY2hhcnQgaXMgcmVzcG9uc2libGUgZm9yIGRyYXdpbmcgaXRzZWxmXG4gICAgc2hvdWxkQ29tcG9uZW50VXBkYXRlKCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcblxuICAgIC8vIFByaXZhdGUgbWV0aG9kc1xuXG4gICAgcmVuZGVyKCkge1xuXG4gICAgICAgIC8vIGlmIHlvdSBkb24ndCBzcGVjaWZ5IHdpZHRoIGl0IHdpbGwgbWF4IG91dCB0byAxMDAlICh3aGljaCBpcyBvaylcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICBzdHlsZT17e3dpZHRoOiB0aGlzLnByb3BzLndpZHRoICsgJ3B4JywgaGVpZ2h0IDogdGhpcy5wcm9wcy5oZWlnaHQrICdweCd9fVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17dGhpcy5wcm9wcy5jbGFzc05hbWV9XG4gICAgICAgICAgICAvPlxuICAgICAgICApO1xuICAgIH1cblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmFkaWF0aW9uQ2hhcnQ7XG4iLCJjb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0JyksXG4gICAgVGltZXJTdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3Jlcy90aW1lci1zdG9yZScpLFxuICAgIE1pc3Npb25BY3Rpb25DcmVhdG9ycyA9IHJlcXVpcmUoJy4uL2FjdGlvbnMvTWlzc2lvbkFjdGlvbkNyZWF0b3JzJyksXG4gICAgVGltZXJBY3Rpb25DcmVhdG9ycyA9IHJlcXVpcmUoJy4uL2FjdGlvbnMvVGltZXJBY3Rpb25DcmVhdG9ycycpLFxuICAgIFNjaWVuY2VBY3Rpb25DcmVhdG9ycyA9IHJlcXVpcmUoJy4uL2FjdGlvbnMvU2NpZW5jZUFjdGlvbkNyZWF0b3JzJyksXG4gICAgY29uc3RhbnRzID0gcmVxdWlyZSgnLi4vY29uc3RhbnRzL1NjaWVuY2VUZWFtQ29uc3RhbnRzJyk7XG5cbnZhciBSYWRpYXRpb25TYW1wbGVyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgcHJvcFR5cGVzOiB7XG4gICAgICAgIHJlcXVpcmVkU2FtcGxlczogUmVhY3QuUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAgICAgICByYWRpYXRpb25TdG9yZVN0YXRlOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWRcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbE1vdW50KCkge1xuICAgICAgICBUaW1lclN0b3JlLmFkZENoYW5nZUxpc3RlbmVyKHRoaXMuX2hhbmRsZVRpbWVyQ2hhbmdlKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkVXBkYXRlKCl7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnRpbWVyQWN0aXZlKSB7XG4gICAgICAgICAgICBsZXQgZWwgPSBSZWFjdC5maW5kRE9NTm9kZSh0aGlzLnJlZnNbJ3NhbXBsZS1idXR0b24nXSk7XG4gICAgICAgICAgICBlbC5mb2N1cygpO1xuICAgICAgICB9XG4gICAgfSxcblxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKXtcbiAgICAgICAgVGltZXJTdG9yZS5yZW1vdmVDaGFuZ2VMaXN0ZW5lcih0aGlzLl9oYW5kbGVUaW1lckNoYW5nZSk7XG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHt0aW1lckFjdGl2ZTogZmFsc2V9XG4gICAgfSxcblxuICAgIF9pc0Rpc2FibGVkKCkge1xuICAgICAgICByZXR1cm4gIXRoaXMuc3RhdGUudGltZXJBY3RpdmVcbiAgICB9LFxuXG5cbiAgICBfaGFuZGxlVGltZXJDaGFuZ2UoKSB7XG4gICAgICAgIHZhciBhdWRpbyA9IFJlYWN0LmZpbmRET01Ob2RlKHRoaXMucmVmc1snZ2VpZ2VyU291bmQnXSk7XG4gICAgICAgIHZhciB0aW1lckFjdGl2ZSA9IFRpbWVyU3RvcmUuaXNSdW5uaW5nKGNvbnN0YW50cy5TQ0lFTkNFX1RJTUVSXzEpO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe3RpbWVyQWN0aXZlOiB0aW1lckFjdGl2ZX0pO1xuXG4gICAgICAgIGlmICh0aW1lckFjdGl2ZSAmJiBhdWRpby5wYXVzZWQpIHtcbiAgICAgICAgICAgIGF1ZGlvLnBsYXkoKTtcbiAgICAgICAgfSBlbHNlIGlmICghdGltZXJBY3RpdmUgJiYgIWF1ZGlvLnBhdXNlZCkge1xuICAgICAgICAgICAgYXVkaW8ucGF1c2UoKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBfaGFuZGxlQ2xpY2soKSB7XG4gICAgICAgIFNjaWVuY2VBY3Rpb25DcmVhdG9ycy50YWtlUmFkaWF0aW9uU2FtcGxlKCk7XG5cbiAgICAgICAgaWYgKHRoaXMucHJvcHMucmFkaWF0aW9uU3RvcmVTdGF0ZS5zYW1wbGVzLmxlbmd0aCArIDEgPj0gdGhpcy5wcm9wcy5yZXF1aXJlZFNhbXBsZXMpIHtcbiAgICAgICAgICAgIFRpbWVyQWN0aW9uQ3JlYXRvcnMuc3RvcFRpbWVyKGNvbnN0YW50cy5TQ0lFTkNFX1RJTUVSXzEpO1xuICAgICAgICAgICAgU2NpZW5jZUFjdGlvbkNyZWF0b3JzLmNvbXBsZXRlVGFzaygnc2FtcGxlJyk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICB2YXIgZGlzYWJsZWQsIGNsYXNzZXM7XG5cbiAgICAgICAgY2xhc3NlcyA9ICdidG4gYnRuLXByaW1hcnknO1xuXG4gICAgICAgIGlmICh0aGlzLl9pc0Rpc2FibGVkKCkpIHtcbiAgICAgICAgICAgIGNsYXNzZXMgKz0gJyBkaXNhYmxlZCc7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPXtcInJhZGlhdGlvbi1zYW1wbGVyIFwiICsgdGhpcy5wcm9wcy5jbGFzc05hbWV9PlxuXG4gICAgICAgICAgICAgICAgeyAvKiBBdm9pZCBmbG9hdGluZyBpbnRvIHByZXZpb3VzIGJsb2NrICovIH1cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJhZGlhdGlvbi1zYW1wbGVyX19wYWRkZXIgY2xlYXJmaXggdmlzaWJsZS14cy1ibG9ja1wiLz5cblxuICAgICAgICAgICAgICAgIDxhdWRpbyByZWY9XCJnZWlnZXJTb3VuZFwiIGxvb3A+XG4gICAgICAgICAgICAgICAgICAgIDxzb3VyY2Ugc3JjPVwiL3NvdW5kcy9BT1MwNDU5NV9FbGVjdHJpY19HZWlnZXJfQ291bnRlcl9GYXN0LndhdlwiIHR5cGU9XCJhdWRpby93YXZcIi8+XG4gICAgICAgICAgICAgICAgPC9hdWRpbz5cblxuICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZj0nc2FtcGxlLWJ1dHRvbidcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3Nlc31cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX2hhbmRsZUNsaWNrfVxuICAgICAgICAgICAgICAgICAgICAgICAgPlRhIHN0csOlbGluZ3NwcsO4dmVcbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L3NlY3Rpb24+XG4gICAgICAgICk7XG4gICAgfVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBSYWRpYXRpb25TYW1wbGVyOyIsImNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBzdGF0aWNzOiB7fSxcbiAgICBwcm9wVHlwZXM6IHtcbiAgICAgICAgc2FtcGxlczogUmVhY3QuUHJvcFR5cGVzLmFycmF5LmlzUmVxdWlyZWQsXG4gICAgICAgIG1pbmltYWxSb3dzVG9TaG93OiBSZWFjdC5Qcm9wVHlwZXMubnVtYmVyXG4gICAgfSxcblxuICAgIC8vIFByaXZhdGUgbWV0aG9kc1xuXG4gICAgZ2V0RGVmYXVsdFByb3BzKCl7XG4gICAgICAgIHJldHVybiB7bWluaW1hbFJvd3NUb1Nob3c6IDB9O1xuICAgIH0sXG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGxldCBzYW1wbGVSb3dzID0gdGhpcy5wcm9wcy5zYW1wbGVzLm1hcCgodmFsLCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDx0ciBrZXk9e2l9PlxuICAgICAgICAgICAgICAgICAgICA8dGggc2NvcGU9XCJyb3dcIj57aSArIDF9PC90aD5cbiAgICAgICAgICAgICAgICAgICAgPHRkPnt2YWx9PC90ZD5cbiAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBtaXNzaW5nUm93cyA9IHRoaXMucHJvcHMubWluaW1hbFJvd3NUb1Nob3cgLSBzYW1wbGVSb3dzLmxlbmd0aCxcbiAgICAgICAgICAgIGZpbGxSb3dzO1xuXG4gICAgICAgIGlmIChtaXNzaW5nUm93cyA+IDApIHtcbiAgICAgICAgICAgIGZpbGxSb3dzID0gW107XG5cbiAgICAgICAgICAgIHdoaWxlIChtaXNzaW5nUm93cy0tKSB7XG4gICAgICAgICAgICAgICAgZmlsbFJvd3MucHVzaCg8dHIga2V5PXtmaWxsUm93cy5sZW5ndGh9PlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRoIHNjb3BlPVwicm93XCI+PC90aD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ZD4mbmJzcDt7LyogTmVlZHMgZmlsbGVyIHRvIG5vdCBjb2xsYXBzZSBjZWxsICovfTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXt0aGlzLnByb3BzLmNsYXNzTmFtZX0+XG5cbiAgICAgICAgICAgICAgICA8aDM+UHLDuHZlcmVzdWx0YXRlcjwvaDM+XG4gICAgICAgICAgICAgICAgPHRhYmxlIGNsYXNzTmFtZT1cIiB0YWJsZSB0YWJsZS1ib3JkZXJlZFwiPlxuICAgICAgICAgICAgICAgICAgICA8Y2FwdGlvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIFN0csOlbGluZ3NwYXJ0aWtsZXIgcGVyIHNla3VuZCAocC9zKVxuICAgICAgICAgICAgICAgICAgICA8L2NhcHRpb24+XG4gICAgICAgICAgICAgICAgICAgIDx0aGVhZD5cbiAgICAgICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRoIHNjb3BlPVwiY29sXCI+UHLDuHZlbnVtbWVyPC90aD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0aCBzY29wZT1cImNvbFwiPnAvczwvdGg+XG4gICAgICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgICAgIDwvdGhlYWQ+XG4gICAgICAgICAgICAgICAgICAgIDx0Ym9keT5cbiAgICAgICAgICAgICAgICAgICAgeyBzYW1wbGVSb3dzIH1cbiAgICAgICAgICAgICAgICAgICAgeyBmaWxsUm93cyB9XG4gICAgICAgICAgICAgICAgICAgIDwvdGJvZHk+XG4gICAgICAgICAgICAgICAgPC90YWJsZT5cblxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxuXG59KTtcblxuIiwiY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuY29uc3QgVGltZXJQYW5lbCA9IHJlcXVpcmUoJy4vdGltZXItcGFuZWwucmVhY3QnKTtcbmNvbnN0IFJhZGlhdGlvbkNoYXJ0ID0gcmVxdWlyZSgnLi9yYWRpYXRpb24tY2hhcnQucmVhY3QuanMnKTtcbmNvbnN0IFJhZGlhdGlvblNhbXBsZUJ1dHRvbiA9IHJlcXVpcmUoJy4vcmFkaWF0aW9uLXNhbXBsZXIucmVhY3QnKTtcbmNvbnN0IE92ZXJsYXkgPSByZXF1aXJlKCcuL292ZXJsYXkucmVhY3QnKTtcbmNvbnN0IFJhZGlhdGlvblRhYmxlID0gcmVxdWlyZSgnLi9yYWRpYXRpb24tdGFibGUucmVhY3QnKTtcbmNvbnN0IFJhZGlhdGlvblN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL3JhZGlhdGlvbi1zdG9yZScpO1xuY29uc3QgYWN0aW9ucyA9IHJlcXVpcmUoJy4uL2FjdGlvbnMvU2NpZW5jZUFjdGlvbkNyZWF0b3JzJyk7XG5jb25zdCB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5jb25zdCBTY2llbmNlVGVhbUNvbnN0YW50cyA9IHJlcXVpcmUoJy4uL2NvbnN0YW50cy9TY2llbmNlVGVhbUNvbnN0YW50cycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIHN0YXRpY3M6IHt9LFxuICAgIHByb3BUeXBlczoge1xuICAgICAgICBhcHBzdGF0ZTogUmVhY3QuUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkXG4gICAgfSxcbiAgICBtaXhpbnM6IFtdLFxuXG4gICAgLy8gbGlmZSBjeWNsZSBtZXRob2RzXG4gICAgZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmFkaWF0aW9uOiBSYWRpYXRpb25TdG9yZS5nZXRTdGF0ZSgpXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzKCkge1xuICAgICAgICByZXR1cm4ge307XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxNb3VudCgpIHtcbiAgICAgICAgUmFkaWF0aW9uU3RvcmUuYWRkQ2hhbmdlTGlzdGVuZXIodGhpcy5faGFuZGxlUmFkaWF0aW9uQ2hhbmdlKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcygpIHtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIFJhZGlhdGlvblN0b3JlLnJlbW92ZUNoYW5nZUxpc3RlbmVyKHRoaXMuX2hhbmRsZVJhZGlhdGlvbkNoYW5nZSk7XG4gICAgfSxcblxuICAgIC8vIFByaXZhdGUgbWV0aG9kc1xuXG4gICAgX2hhbmRsZVJhZGlhdGlvbkNoYW5nZSgpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICByYWRpYXRpb246IFJhZGlhdGlvblN0b3JlLmdldFN0YXRlKClcbiAgICAgICAgfSlcbiAgICB9LFxuXG4gICAgX2hhbmRsZUF2ZXJhZ2VSYWRpYXRpb25TdWJtaXQoZSkge1xuICAgICAgICBsZXQgZWwgPSBSZWFjdC5maW5kRE9NTm9kZSh0aGlzLnJlZnNbJ2F2ZXJhZ2UtaW5wdXQnXSksXG4gICAgICAgICAgICB2YWwgPSBlbC52YWx1ZS50cmltKCk7XG5cbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIGlmICghdmFsLmxlbmd0aCkgcmV0dXJuO1xuXG4gICAgICAgIGxldCBhdmVyYWdlID0gdXRpbHMucGFyc2VOdW1iZXIodmFsKTtcbiAgICAgICAgZWwudmFsdWUgPSAnJztcblxuICAgICAgICBpZiAoYXZlcmFnZSkge1xuICAgICAgICAgICAgYWN0aW9ucy5hdmVyYWdlUmFkaWF0aW9uQ2FsY3VsYXRlZChhdmVyYWdlKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBfaGFuZGxlQWRkVG9Ub3RhbFN1Ym1pdChlKXtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIGxldCBlbCA9IFJlYWN0LmZpbmRET01Ob2RlKHRoaXMucmVmc1snYWRkLXRvLXRvdGFsJ10pO1xuICAgICAgICBsZXQgdmFsID0gZWwudmFsdWUudHJpbSgpO1xuICAgICAgICBpZiAoIXZhbC5sZW5ndGgpIHJldHVybjtcblxuICAgICAgICBsZXQgbnVtYmVyID0gdXRpbHMucGFyc2VOdW1iZXIodmFsKTtcblxuICAgICAgICBpZiAoIWlzTmFOKG51bWJlcikpIHtcbiAgICAgICAgICAgIGFjdGlvbnMuYWRkVG9Ub3RhbFJhZGlhdGlvbkxldmVsKG51bWJlcik7XG4gICAgICAgIH1cbiAgICB9LFxuXG5cbiAgICAvKlxuICAgICAqIEhlbHBlclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0YXNrTmFtZSBuYW1lXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgdGhlIGN1cnJlbnQgdGFzayBpZCBlcXVhbHMgdGhlIG5hbWUgcGFzc2VkIGluXG4gICAgICovXG4gICAgX2lzQ3VycmVudFRhc2sodGFza05hbWUpe1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5hcHBzdGF0ZS50YXNrU3RvcmUuY3VycmVudFRhc2tJZCA9PT0gdGFza05hbWU7XG4gICAgfSxcblxuICAgIF9yYWRpYXRpb25TdGF0dXMoKXtcbiAgICAgICAgdmFyIG51bSA9IHRoaXMuc3RhdGUucmFkaWF0aW9uLmxhc3RDYWxjdWxhdGVkQXZlcmFnZSxcbiAgICAgICAgICAgIGNvbG9yO1xuXG4gICAgICAgIGlmIChudW0gPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiAnSWtrZSBiZXJlZ25ldCc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobnVtID4gU2NpZW5jZVRlYW1Db25zdGFudHMuU0NJRU5DRV9BVkdfUkFEX1JFRF9WQUxVRSkge1xuICAgICAgICAgICAgY29sb3IgPSAncmVkJztcbiAgICAgICAgfSBlbHNlIGlmIChudW0gPiBTY2llbmNlVGVhbUNvbnN0YW50cy5TQ0lFTkNFX0FWR19SQURfT1JBTkdFX1ZBTFVFKSB7XG4gICAgICAgICAgICBjb2xvciA9ICdvcmFuZ2UnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29sb3IgPSAnZ3JlZW4nO1xuICAgICAgICB9XG5cblxuICAgICAgICByZXR1cm4gKDxkaXZcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cInJhZGlhdGlvbi1pbmRpY2F0b3IgY2lyY2xlIGNvbC14cy0yXCJcbiAgICAgICAgICAgIHN0eWxlPXsgeyAnYmFja2dyb3VuZENvbG9yJyA6IGNvbG9yIH0gfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAge251bSB9XG4gICAgICAgIDwvZGl2Pik7XG5cbiAgICB9LFxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgc2hvd1NhbXBsZUlucHV0ID0gdGhpcy5faXNDdXJyZW50VGFzaygnc2FtcGxlJyksXG4gICAgICAgICAgICBzaG93QXZlcmFnZUlucHV0ID0gdGhpcy5faXNDdXJyZW50VGFzaygnYXZlcmFnZScpLFxuICAgICAgICAgICAgc2hvd0FkZFRvVG90YWxJbnB1dCA9IHRoaXMuX2lzQ3VycmVudFRhc2soJ2FkZHRvdGFsJyk7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdyb3cnPlxuXG4gICAgICAgICAgICAgICAgICAgIDxkbCBjbGFzc05hbWU9J3JhZGlhdGlvbi12YWx1ZXMgY29sLXhzLTYgJz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkdD5Ub3RhbHQgc3Ryw6VsaW5nc25pdsOlPC9kdD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkZD57dGhpcy5zdGF0ZS5yYWRpYXRpb24udG90YWx9PC9kZD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkdD5TaXN0IGlubmxlc3Qgc3Ryw6VsaW5nc25pdsOlPC9kdD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkZD57IHRoaXMuX3JhZGlhdGlvblN0YXR1cygpfSA8L2RkPlxuICAgICAgICAgICAgICAgICAgICA8L2RsPlxuXG4gICAgICAgICAgICAgICAgICAgIDxSYWRpYXRpb25UYWJsZVxuICAgICAgICAgICAgICAgICAgICAgICAgbWluaW1hbFJvd3NUb1Nob3c9ezR9XG4gICAgICAgICAgICAgICAgICAgICAgICBzYW1wbGVzPXt0aGlzLnN0YXRlLnJhZGlhdGlvbi5zYW1wbGVzfVxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPSdjb2wteHMtNiAnLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICAgIDxoci8+XG5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImluc3RydW1lbnRzXCI+XG5cbiAgICAgICAgICAgICAgICAgICAgPGZpZWxkc2V0IGRpc2FibGVkPXshc2hvd1NhbXBsZUlucHV0fSBjbGFzc05hbWU9J2luc3RydW1lbnRzX19zZWN0aW9uIHJvdyBvdmVybGF5YWJsZSc+XG4gICAgICAgICAgICAgICAgICAgICAgICA8T3ZlcmxheSBhY3RpdmU9eyAhc2hvd1NhbXBsZUlucHV0IH0vPlxuXG4gICAgICAgICAgICAgICAgICAgICAgICA8aDMgY2xhc3NOYW1lPSdjb2wteHMtMTInPlRhIHByw7h2ZXI8L2gzPlxuICAgICAgICAgICAgICAgICAgICAgICAgPFRpbWVyUGFuZWwgY2xhc3NOYW1lPSdjb2wteHMtMTIgY29sLXNtLTgnIHRpbWVySWQ9e1NjaWVuY2VUZWFtQ29uc3RhbnRzLlNDSUVOQ0VfVElNRVJfMX0vPlxuXG4gICAgICAgICAgICAgICAgICAgICAgICA8UmFkaWF0aW9uU2FtcGxlQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPSdjb2wteHMtNSBjb2wtc20tNCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByYWRpYXRpb25TdG9yZVN0YXRlPXt0aGlzLnN0YXRlLnJhZGlhdGlvbn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXF1aXJlZFNhbXBsZXM9ezR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9maWVsZHNldD5cblxuICAgICAgICAgICAgICAgICAgICA8aHIgLz5cblxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJvdyBvdmVybGF5YWJsZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPE92ZXJsYXkgYWN0aXZlPXsgIXNob3dBdmVyYWdlSW5wdXQgfS8+XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInJhZGlhdGlvbi1pbnB1dCBpbnN0cnVtZW50c19fc2VjdGlvbiBjb2wteHMtMTIgY29sLXNtLTZcIj5cblxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyb3dcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGgzIGNsYXNzTmFtZT0nY29sLXhzLTEyJz5HamVubm9tc25pdHRsaWcgc3Ryw6VsaW5nPC9oMz5cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZmllbGRzZXQgY2xhc3NOYW1lPVwiY29sLXhzLThcIiBkaXNhYmxlZD17ICFzaG93QXZlcmFnZUlucHV0IH0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Zm9ybSBvblN1Ym1pdD17dGhpcy5faGFuZGxlQXZlcmFnZVJhZGlhdGlvblN1Ym1pdH0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IHJlZj0nYXZlcmFnZS1pbnB1dCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cIm51bWJlclwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ZXA9XCIwLjFcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW49XCIxXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF4PVwiMTAwXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPSdyYWRpYXRpb24taW5wdXRfX2lucHV0J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPSdidG4gYnRuLXByaW1hcnknPkV2YWx1ZXI8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9maWVsZHNldD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvc2VjdGlvbj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgICAgICAgPGhyLz5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyb3cgb3ZlcmxheWFibGVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxPdmVybGF5IGFjdGl2ZT17ICFzaG93QWRkVG9Ub3RhbElucHV0IH0vPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGZpZWxkc2V0IGNsYXNzTmFtZT0ncmFkaWF0aW9uLWlucHV0IGNvbC14cy04JyBkaXNhYmxlZD17ISBzaG93QWRkVG9Ub3RhbElucHV0IH0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGgzPkxlZ2cgdmVyZGkgdGlsIHRvdGFsPC9oMz5cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxmb3JtIG9uU3VibWl0PXt0aGlzLl9oYW5kbGVBZGRUb1RvdGFsU3VibWl0fT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNlbGVjdCByZWY9J2FkZC10by10b3RhbCcgY2xhc3NOYW1lPSdyYWRpYXRpb24taW5wdXRfX2lucHV0Jz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9JzAnPjA8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9JzE1Jz4xNTwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT0nNTAnPjUwPC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT0nYnRuIGJ0bi1wcmltYXJ5Jz5FdmFsdWVyPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9mb3JtPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9maWVsZHNldD5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cblxufSk7XG4iLCJjb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0JyksXG4gICAgUm91dGVyID0gcmVxdWlyZSgncmVhY3Qtcm91dGVyJyksXG4gICAgTWVzc2FnZVN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL21lc3NhZ2Utc3RvcmUnKSxcbiAgICBUYXNrU3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZXMvdGFzay1zdG9yZScpLFxuICAgIFJvdXRlU3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZXMvcm91dGUtc3RvcmUnKSxcbiAgICBNZXNzYWdlTGlzdCA9IHJlcXVpcmUoJy4vbWVzc2FnZS1saXN0LnJlYWN0JyksXG4gICAgSW50cm9kdWN0aW9uU2NyZWVuID0gcmVxdWlyZSgnLi9pbnRyb2R1Y3Rpb24tc2NyZWVuLnJlYWN0LmpzJyksXG4gICAgVGVhbURpc3BsYXllciA9IHJlcXVpcmUoJy4vdGVhbS1kaXNwbGF5ZXIucmVhY3QnKSxcbiAgICBNaXNzaW9uVGltZXIgPSByZXF1aXJlKCcuL21pc3Npb24tdGltZXIucmVhY3QuanMnKSxcbiAgICBTY2llbmNlVGFzayA9IHJlcXVpcmUoJy4vc2NpZW5jZS10YXNrLnJlYWN0JyksXG4gICAgeyBmb3JtYXQgfSA9IHJlcXVpcmUoJ3V0aWwnKTtcblxuXG5mdW5jdGlvbiB1cmxPZlRhc2sodGFza0lkKSB7XG4gICAgcmV0dXJuIGZvcm1hdCgnLyVzL3Rhc2svJXMnLCBSb3V0ZVN0b3JlLmdldFRlYW1JZCgpLCB0YXNrSWQpO1xufVxuXG5mdW5jdGlvbiB0cmFuc2l0aW9uVG9DdXJyZW50VGFzayh0cmFuc2l0aW9uRnVuY3Rpb24pIHtcbiAgICB2YXIgY3VycmVudFRhc2tJZCA9IFRhc2tTdG9yZS5nZXRDdXJyZW50VGFza0lkKCk7XG5cbiAgICAvLyB0aGlzIGxvZ2ljIGlzIGZyYWdpbGUgLSBpZiB5b3Ugc2hvdWxkIHN1ZGRlbmx5IGRlY2lkZSB0byB2aXNpdCBhbm90aGVyIHRlYW1cbiAgICAvLyBfYWZ0ZXJfIHlvdSBoYXZlIHN0YXJ0ZWQgYSB0YXNrLCB0aGUgdGVhbSt0YXNrIGNvbWJvIGlzIGludmFsaWQgLT4gNDA0XG4gICAgaWYgKGN1cnJlbnRUYXNrSWQgIT09IFJvdXRlU3RvcmUuZ2V0VGFza0lkKCkpIHtcbiAgICAgICAgdmFyIHRvID0gdXJsT2ZUYXNrKGN1cnJlbnRUYXNrSWQpO1xuICAgICAgICB0cmFuc2l0aW9uRnVuY3Rpb24odG8pO1xuICAgIH1cblxufVxuXG5jb25zdCBUYXNrID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgY29udGV4dFR5cGVzOiB7XG4gICAgICAgIHJvdXRlcjogUmVhY3QuUHJvcFR5cGVzLmZ1bmNcbiAgICB9LFxuXG4gICAgbWl4aW5zOiBbXSxcblxuICAgIHN0YXRpY3M6IHtcbiAgICAgICAgd2lsbFRyYW5zaXRpb25Ubyh0cmFuc2l0aW9uKSB7XG4gICAgICAgICAgICB0cmFuc2l0aW9uVG9DdXJyZW50VGFzayh0cmFuc2l0aW9uLnJlZGlyZWN0LmJpbmQodHJhbnNpdGlvbikpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgICBNZXNzYWdlU3RvcmUuYWRkQ2hhbmdlTGlzdGVuZXIodGhpcy5fb25DaGFuZ2UpO1xuICAgICAgICBUYXNrU3RvcmUuYWRkQ2hhbmdlTGlzdGVuZXIodGhpcy5fb25DaGFuZ2UpO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCdjb21wb25lbnRXaWxsTW91bnQnKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy9jb25zb2xlLmxvZygnY29tcG9uZW50V2lsbFVubW91bnQnKTtcbiAgICAgICAgTWVzc2FnZVN0b3JlLnJlbW92ZUNoYW5nZUxpc3RlbmVyKHRoaXMuX29uQ2hhbmdlKTtcbiAgICAgICAgVGFza1N0b3JlLnJlbW92ZUNoYW5nZUxpc3RlbmVyKHRoaXMuX29uQ2hhbmdlKTtcblxuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5fc3RhdGVUaW1lb3V0KTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkVW5tb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgICAvL2NvbnNvbGUubG9nKCdjb21wb25lbnREaWRVbm1vdW50Jyk7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZFVwZGF0ZSgpIHtcbiAgICAgICAgLy9jb25zb2xlLmxvZygnLmNvbXBvbmVudERpZFVwZGF0ZScpO1xuICAgIH0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGUoKSB7XG5cbiAgICAgICAgc2V0VGltZW91dCgoKT0+IHRoaXMuc2V0U3RhdGUoe3Rhc2tJc05ldzogZmFsc2V9KSwgMjAwMCk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG1lc3NhZ2VzOiBNZXNzYWdlU3RvcmUuZ2V0TWVzc2FnZXMoKSxcbiAgICAgICAgICAgIHRhc2tTdG9yZTogVGFza1N0b3JlLmdldFN0YXRlKCksXG4gICAgICAgICAgICB0YXNrSXNOZXc6IHRydWVcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgX29uQ2hhbmdlKCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIG1lc3NhZ2VzOiBNZXNzYWdlU3RvcmUuZ2V0TWVzc2FnZXMoKSxcbiAgICAgICAgICAgIHRhc2tTdG9yZTogVGFza1N0b3JlLmdldFN0YXRlKCksXG4gICAgICAgICAgICB0YXNrSXNOZXc6IHRydWVcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIHJvdXRlciA9IHRoaXMuY29udGV4dC5yb3V0ZXI7XG4gICAgICAgIHRyYW5zaXRpb25Ub0N1cnJlbnRUYXNrKHJvdXRlci50cmFuc2l0aW9uVG8uYmluZChyb3V0ZXIpKTtcblxuICAgICAgICAvLyBhIGJpdCBydWRpbWVudGFyeSAtIHRyaWdnZXJzIG9uIGFsbCBjaGFuZ2VzLCBub3QganVzdCBUYXNrIGNoYW5nZXMgLi4uXG4gICAgICAgIHRoaXMuX3N0YXRlVGltZW91dCA9IHNldFRpbWVvdXQoKCk9PiB0aGlzLnNldFN0YXRlKHt0YXNrSXNOZXc6IGZhbHNlfSksIDIwMDApO1xuICAgIH0sXG5cbiAgICBfY3JlYXRlU3ViVGFza1VJKCkge1xuICAgICAgICByZXR1cm4gKCA8U2NpZW5jZVRhc2sgYXBwc3RhdGU9e3RoaXMuc3RhdGV9Lz4pO1xuICAgIH0sXG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGxldCBjb250ZW50ID0gdGhpcy5fY3JlYXRlU3ViVGFza1VJKCksXG4gICAgICAgICAgICBibGluayA9IHRoaXMuc3RhdGUudGFza0lzTmV3ID8gJ2JsaW5rJyA6ICcnLFxuICAgICAgICAgICAgdGVhbU5hbWVzLCBtaXNzaW9uVGltZXI7XG5cblxuICAgICAgICB0ZWFtTmFtZXMgPSAoXG4gICAgICAgICAgICA8ZGl2IGlkPSd0ZWFtLW5hbWUnIGNsYXNzTmFtZT0nJz5cbiAgICAgICAgICAgICAgICA8aGVhZGVyIGNsYXNzTmFtZT0nJz5cbiAgICAgICAgICAgICAgICAgICAgPFRlYW1EaXNwbGF5ZXIgY2xhc3NOYW1lPScnLz5cbiAgICAgICAgICAgICAgICA8L2hlYWRlcj5cbiAgICAgICAgICAgIDwvZGl2Pik7XG5cbiAgICAgICAgbWlzc2lvblRpbWVyID0gKFxuICAgICAgICAgICAgPHNlY3Rpb24gaWQ9J21pc3Npb24tdGltZXInIGNsYXNzTmFtZT0nJz5cbiAgICAgICAgICAgICAgICA8TWlzc2lvblRpbWVyIC8+XG4gICAgICAgICAgICA8L3NlY3Rpb24+ICk7XG5cbiAgICAgICAgaWYgKCF0aGlzLnByb3BzLmlzTWlzc2lvblJ1bm5pbmcpIHtcbiAgICAgICAgICAgIGxldCBtZXNzYWdlID0ge1xuICAgICAgICAgICAgICAgIGlkOiAnbm90X3VzZWQnLFxuICAgICAgICAgICAgICAgIHRleHQ6ICdJa2tlIGtsYXIuIFZlbnRlciBww6UgYXQgb3BwZHJhZ2V0IHNrYWwgc3RhcnRlLicsXG4gICAgICAgICAgICAgICAgbGV2ZWw6ICdpbmZvJ1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICB7IHRlYW1OYW1lcyB9XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicm93XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8TWVzc2FnZUxpc3QgY2xhc3NOYW1lPSdjb2wteHMtMTInXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZXM9e1ttZXNzYWdlXX0vPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj4pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPScnPlxuICAgICAgICAgICAgICAgIHt0ZWFtTmFtZXN9XG4gICAgICAgICAgICAgICAge21pc3Npb25UaW1lcn1cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJvd1wiPlxuICAgICAgICAgICAgICAgICAgICA8TWVzc2FnZUxpc3QgY2xhc3NOYW1lPSdjb2wteHMtMTInIG1lc3NhZ2VzPXt0aGlzLnN0YXRlLm1lc3NhZ2VzfS8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgICB7IC8qIGlmIHlvdSB3YW50IHRoaXMgdG8gYmUgc3RpY2t5OiBodHRwOi8vY29kZXBlbi5pby9zZW5mZi9wZW4vYXlHdkQgKi8gfVxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicm93XCI+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY29sLXhzLTEyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nanVtYm90cm9uIHRhc2tib3gnPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxoMiBjbGFzc05hbWU9J3Rhc2tib3hfX2hlYWRlcic+T3BwZ2F2ZTwvaDI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXsndGFza2JveF9fdGV4dCAnICsgYmxpbmt9PiB7dGhpcy5zdGF0ZS50YXNrU3RvcmUuY3VycmVudFRhc2t9IDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICAgIHtjb250ZW50fVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBUYXNrO1xuIiwiY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuY29uc3QgUm91dGVTdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3Jlcy9yb3V0ZS1zdG9yZScpO1xuY29uc3QgdGVhbU5hbWVzID0gcmVxdWlyZSgnLi4vdGVhbS1uYW1lLW1hcCcpO1xuXG5jb25zdCBUZWFtV2lkZ2V0ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgY29udGV4dFR5cGVzOiB7XG4gICAgICAgIHJvdXRlcjogUmVhY3QuUHJvcFR5cGVzLmZ1bmNcbiAgICB9LFxuXG4gICAgbWl4aW5zOiBbXSxcblxuICAgIF9vbkNoYW5nZSgpIHtcbiAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgICAvL1JvdXRlU3RvcmUuYWRkQ2hhbmdlTGlzdGVuZXIodGhpcy5fb25DaGFuZ2UpO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgICAvL1JvdXRlU3RvcmUucmVtb3ZlQ2hhbmdlTGlzdGVuZXIodGhpcy5fb25DaGFuZ2UpO1xuXG4gICAgfSxcblxuICAgIHRlYW1OYW1lKCkge1xuICAgICAgICByZXR1cm4gdGVhbU5hbWVzLm5hbWVNYXBbKFJvdXRlU3RvcmUuZ2V0VGVhbUlkKCkpXTtcbiAgICB9LFxuXG4gICAgb3RoZXJUZWFtTmFtZXMoKSB7XG4gICAgICAgIHJldHVybiB0ZWFtTmFtZXMub3RoZXJUZWFtTmFtZXMoUm91dGVTdG9yZS5nZXRUZWFtSWQoKSk7XG4gICAgfSxcblxuICAgIHJlbmRlcigpIHtcblxuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZSA9IHsgdGhpcy5wcm9wcy5jbGFzc05hbWUgKyAnIHRlYW13aWRnZXQnfSA+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZSA9ICdhY3RpdmUnID57IHRoaXMudGVhbU5hbWUoKSAgfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lID0gJyc+LCB7IHRoaXMub3RoZXJUZWFtTmFtZXMoKSB9IDwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj4gKTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBUZWFtV2lkZ2V0O1xuIiwidmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKSxcbiAgICBhY3Rpb25zID0gcmVxdWlyZSgnLi4vYWN0aW9ucy9UaW1lckFjdGlvbkNyZWF0b3JzJyksXG4gICAgVGltZXIgPSByZXF1aXJlKCcuL3RpbWVyLnJlYWN0LmpzJyksXG4gICAgVGltZXJTdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3Jlcy90aW1lci1zdG9yZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIHByb3BUeXBlczoge1xuICAgICAgICB0aW1lcklkOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWRcbiAgICB9LFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZ2V0VGltZXJTdGF0ZSgpO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgICBUaW1lclN0b3JlLmFkZENoYW5nZUxpc3RlbmVyKHRoaXMuX2hhbmRsZVRpbWVTdG9yZUNoYW5nZSk7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIFRpbWVyU3RvcmUucmVtb3ZlQ2hhbmdlTGlzdGVuZXIodGhpcy5faGFuZGxlVGltZVN0b3JlQ2hhbmdlKTtcbiAgICB9LFxuXG4gICAgc2hvdWxkQ29tcG9uZW50VXBkYXRlKG5leHRQcm9wcywgbmV4dFN0YXRlKSB7XG4gICAgICAgIHJldHVybiBuZXh0U3RhdGUudGltZUluU2Vjb25kcyAhPT0gdGhpcy5zdGF0ZS50aW1lSW5TZWNvbmRzO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRVcGRhdGUoKSB7XG4gICAgICAgIC8vY29uc29sZS5sb2coJ1RpbWVyUGFuZWwuY29tcG9uZW50RGlkVXBkYXRlJyk7XG4gICAgfSxcblxuICAgIF9oYW5kbGVUaW1lU3RvcmVDaGFuZ2UoKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUodGhpcy5fZ2V0VGltZXJTdGF0ZSgpKTtcbiAgICB9LFxuXG4gICAgX2hhbmRsZUNsaWNrKCkge1xuICAgICAgICBhY3Rpb25zLnN0YXJ0VGltZXIodGhpcy5wcm9wcy50aW1lcklkKTtcbiAgICB9LFxuXG4gICAgX2dldFRpbWVyU3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZWFkeTogVGltZXJTdG9yZS5pc1JlYWR5VG9TdGFydCh0aGlzLnByb3BzLnRpbWVySWQpLFxuICAgICAgICAgICAgdGltZUluU2Vjb25kczogVGltZXJTdG9yZS5nZXRSZW1haW5pbmdUaW1lKHRoaXMucHJvcHMudGltZXJJZClcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPXtcInRpbWVyIFwiICsgdGhpcy5wcm9wcy5jbGFzc05hbWUgfT5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJvd1wiPlxuXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSd0aW1lci0tYnV0dG9uIGNvbC14cy01ICc+XG4gICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXsgJ2J0biBidG4tcHJpbWFyeScgKyAodGhpcy5zdGF0ZS5yZWFkeSA/ICcnIDogJ2Rpc2FibGVkJyApIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLl9oYW5kbGVDbGlja30+U3RhcnQga2xva2thXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSd0aW1lci0tdmFsdWUgY29sLXhzLTYgcGFkZGluZy14cy0xJz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxUaW1lciB0aW1lSW5TZWNvbmRzPXt0aGlzLnN0YXRlLnRpbWVJblNlY29uZHN9Lz5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L3NlY3Rpb24+XG4gICAgICAgICk7XG4gICAgfVxufSkiLCIvLyBUaGlzIGV4YW1wbGUgY2FuIGJlIG1vZGlmaWVkIHRvIGFjdCBhcyBhIGNvdW50ZG93biB0aW1lclxuXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKSxcbiAgICBwcmludGYgPSByZXF1aXJlKCdwcmludGYnKTtcblxuZnVuY3Rpb24gcGFkKG51bSkge1xuICAgIHJldHVybiBwcmludGYoJyUwMmQnLCBudW0pO1xufVxuXG5cbmNvbnN0IFRpbWVyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgcHJvcFR5cGVzOiB7XG4gICAgICAgIHRpbWVJblNlY29uZHM6IFJlYWN0LlByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZFxuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRVcGRhdGUoKSB7XG4gICAgICAgIC8vY29uc29sZS5sb2coJ1RpbWVyLmNvbXBvbmVudERpZFVwZGF0ZScpO1xuICAgIH0sXG5cbiAgICBzaG91bGRDb21wb25lbnRVcGRhdGUobmV4dFByb3BzLCBuZXh0U3RhdGUpIHtcbiAgICAgICAgcmV0dXJuIG5leHRQcm9wcy50aW1lSW5TZWNvbmRzICE9PSB0aGlzLnByb3BzLnRpbWVJblNlY29uZHM7XG4gICAgfSxcblxuICAgIF9taW51dGVzKCkge1xuICAgICAgICByZXR1cm4gcGFkKE1hdGgubWF4KDAsIHRoaXMucHJvcHMudGltZUluU2Vjb25kcykgLyA2MCA+PiAwKTtcbiAgICB9LFxuXG4gICAgX3NlY29uZHMoKSB7XG4gICAgICAgIHJldHVybiBwYWQoTWF0aC5tYXgoMCwgdGhpcy5wcm9wcy50aW1lSW5TZWNvbmRzKSAlIDYwKTtcbiAgICB9LFxuXG4gICAgX3RpbWVWYWx1ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21pbnV0ZXMoKSArICc6JyArIHRoaXMuX3NlY29uZHMoKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J3RpbWVyLXZhbHVlJz4ge3RoaXMuX3RpbWVWYWx1ZSgpfTwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRpbWVyO1xuXG4iLCJtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5mcmVlemUoe1xuICAgIC8vIGV2ZW50c1xuICAgIE1FU1NBR0VfQURERUQ6ICdNRVNTQUdFX0FEREVEJyxcbiAgICBSRU1PVkVfTUVTU0FHRTogJ1JFTU9WRV9NRVNTQUdFJ1xufSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJ3JlYWN0L2xpYi9rZXlNaXJyb3InKSh7XG4gICAgTUlTU0lPTl9USU1FX1NZTkM6ICdNSVNTSU9OX1RJTUVfU1lOQycsXG4gICAgTUlTU0lPTl9TVEFSVEVEX0VWRU5UOiAnTUlTU0lPTl9TVEFSVEVEX0VWRU5UJyxcbiAgICBNSVNTSU9OX1NUT1BQRURfRVZFTlQ6ICdNSVNTSU9OX1NUT1BQRURfRVZFTlQnLFxuICAgIE1JU1NJT05fQ09NUExFVEVEX0VWRU5UOiAnTUlTU0lPTl9DT01QTEVURURfRVZFTlQnLFxuICAgIE1JU1NJT05fV0FTX1JFU0VUOiAnTUlTU0lPTl9XQVNfUkVTRVQnLFxuICAgIFJFQ0VJVkVEX0VWRU5UUzogbnVsbCxcbiAgICBJTlRST0RVQ1RJT05fUkVBRDogJ0lOVFJPRFVDVElPTl9SRUFEJyxcbiAgICBTVEFSVF9UQVNLOiAnU1RBUlRfVEFTSycsXG4gICAgQ09NUExFVEVEX1RBU0sgOiAnQ09NUExFVEVEX1RBU0snLFxuICAgIEFTS19GT1JfQVBQX1NUQVRFOiAnQVNLX0ZPUl9BUFBfU1RBVEUnLFxuICAgIFJFQ0VJVkVEX0FQUF9TVEFURTogJ1JFQ0VJVkVEX0FQUF9TVEFURScsXG4gICAgU0VORElOR19URUFNX1NUQVRFOiAnU0VORElOR19URUFNX1NUQVRFJ1xufSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5mcmVlemUoe1xuICAgIC8vIGV2ZW50c1xuICAgIFJPVVRFX0NIQU5HRURfRVZFTlQ6ICdST1VURV9DSEFOR0VEX0VWRU5UJyxcbiAgICBST1VURVJfQVZBSUxBQkxFOiAnUk9VVEVSX0FWQUlMQUJMRScsXG59KTtcbiIsIm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmZyZWV6ZSh7XG4gICAgLy8gaWRzXG4gICAgU0NJRU5DRV9USU1FUl8xOiAnU0NJRU5DRV9USU1FUl8xJyxcbiAgICBTQ0lFTkNFX1JBRElBVElPTl9XQVJOSU5HX01TRyA6ICdTQ0lFTkNFX1JBRElBVElPTl9XQVJOSU5HX01TRycsXG5cbiAgICBTQ0lFTkNFX0NMRUFSX1JBRElBVElPTl9TQU1QTEVTOidTQ0lFTkNFX0NMRUFSX1JBRElBVElPTl9TQU1QTEVTJyxcblxuICAgIC8vIGV2ZW50c1xuICAgIFNDSUVOQ0VfQ09VTlRET1dOX1RJTUVSX0NIQU5HRUQ6ICdTQ0lFTkNFX0NPVU5URE9XTl9USU1FUl9DSEFOR0VEJyxcbiAgICBTQ0lFTkNFX1RBS0VfUkFESUFUSU9OX1NBTVBMRTogJ1NDSUVOQ0VfVEFLRV9SQURJQVRJT05fU0FNUExFJyxcbiAgICBTQ0lFTkNFX1JBRElBVElPTl9MRVZFTF9DSEFOR0VEOiAnU0NJRU5DRV9SQURJQVRJT05fTEVWRUxfQ0hBTkdFRCcsXG4gICAgU0NJRU5DRV9UT1RBTF9SQURJQVRJT05fTEVWRUxfQ0hBTkdFRDogJ1NDSUVOQ0VfVE9UQUxfUkFESUFUSU9OX0xFVkVMX0NIQU5HRUQnLFxuICAgIFNDSUVOQ0VfQVZHX1JBRElBVElPTl9DQUxDVUxBVEVEOiAnU0NJRU5DRV9BVkdfUkFESUFUSU9OX0NBTENVTEFURUQnLFxuXG4gICAgLy8gdmFsdWVzXG4gICAgU0NJRU5DRV9SQURJQVRJT05fTUlOOiAwLFxuICAgIFNDSUVOQ0VfUkFESUFUSU9OX01BWDogMTAwLFxuICAgIFNDSUVOQ0VfQVZHX1JBRF9HUkVFTl9WQUxVRTogMCxcbiAgICBTQ0lFTkNFX0FWR19SQURfT1JBTkdFX1ZBTFVFOiAxNSxcbiAgICBTQ0lFTkNFX0FWR19SQURfUkVEX1ZBTFVFOiA1MCxcbiAgICBTQ0lFTkNFX0FWR19SQURfT1JBTkdFX1RIUkVTSE9MRDogNDAsXG4gICAgU0NJRU5DRV9BVkdfUkFEX1JFRF9USFJFU0hPTEQ6IDc1LFxuICAgIFNDSUVOQ0VfVE9UQUxfUkFESUFUSU9OX1NFUklPVVNfVEhSRVNIT0xEOiA1MCxcbiAgICBTQ0lFTkNFX1RPVEFMX1JBRElBVElPTl9WRVJZX1NFUklPVVNfVEhSRVNIT0xEOiA3NVxufSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBTRVRfVElNRVI6ICdTRVRfVElNRVInLFxuICAgIFNUQVJUX1RJTUVSOiAnU1RBUlRfVElNRVInLFxuICAgIFNUT1BfVElNRVI6ICdTVE9QX1RJTUVSJyxcbiAgICBSRVNFVF9USU1FUjogJ1JFU0VUX1RJTUVSJ1xufTtcblxuIiwiLy8gcHJveHkgYWNjZXNzIHRvIHRoZSByb3V0ZXIgYXMgZmlyc3Qgc3RlcCBpbiBicmluZ2luZyBpdCBpbnRvIHRoZSBmbHV4IGZsb3dcbi8vIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3JhY2t0L3JlYWN0LXJvdXRlci9ibG9iL21hc3Rlci9kb2NzL2d1aWRlcy9mbHV4Lm1kXG5cbnZhciByb3V0ZXIgPSBudWxsO1xuXG53aW5kb3cuX19yb3V0ZXIgPSBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICB0cmFuc2l0aW9uVG8odG8scGFyYW1zLHF1ZXJ5KSB7XG4gICAgICAgIHJldHVybiByb3V0ZXIudHJhbnNpdGlvblRvKHRvLHBhcmFtcyxxdWVyeSlcbiAgICB9LFxuXG4gICAgZ2V0Q3VycmVudFBhdGhuYW1lKCkge1xuICAgICAgICByZXR1cm4gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lO1xuICAgIH0sXG5cbiAgICBnZXRUZWFtSWQoKXtcbiAgICAgIHJldHVybiB0aGlzLmdldEN1cnJlbnRQYXRobmFtZSgpLnNwbGl0KCcvJylbMV07XG4gICAgfSxcblxuICAgIGdldFRhc2tJZCgpe1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRDdXJyZW50UGF0aG5hbWUoKS5zcGxpdCgnLycpWzNdO1xuICAgIH0sXG5cbiAgICBydW4oLi4uYXJncykge1xuICAgICAgICByZXR1cm4gcm91dGVyLnJ1biguLi5hcmdzKVxuICAgIH1cbn07XG5cbmNvbnN0IFJvdXRlciA9IHJlcXVpcmUoJ3JlYWN0LXJvdXRlcicpO1xuY29uc3Qgcm91dGVzID0gcmVxdWlyZSgnLi9yb3V0ZXMucmVhY3QnKTtcblxuLy8gQnkgdGhlIHRpbWUgcm91dGUgY29uZmlnIGlzIHJlcXVpcmUoKS1kLFxuLy8gcmVxdWlyZSgnLi9yb3V0ZXInKSBhbHJlYWR5IHJldHVybnMgYSB2YWxpZCBvYmplY3Rcblxucm91dGVyID0gUm91dGVyLmNyZWF0ZSh7XG4gICAgcm91dGVzOiByb3V0ZXMsXG5cbiAgICAvLyBVc2UgdGhlIEhUTUw1IEhpc3RvcnkgQVBJIGZvciBjbGVhbiBVUkxzXG4gICAgbG9jYXRpb246IFJvdXRlci5IaXN0b3J5TG9jYXRpb25cbn0pO1xuIiwiY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuY29uc3QgUm91dGVyID0gcmVxdWlyZSgncmVhY3Qtcm91dGVyJyk7XG5jb25zdCBSb3V0ZSA9IFJvdXRlci5Sb3V0ZTtcbmNvbnN0IE5vdEZvdW5kUm91dGUgPSBSb3V0ZXIuTm90Rm91bmRSb3V0ZTtcbmNvbnN0IERlZmF1bHRSb3V0ZSA9IFJvdXRlci5EZWZhdWx0Um91dGU7XG5cbmNvbnN0IEFwcCA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9hcHAucmVhY3QnKTtcbmNvbnN0IE1pc3Npb25Db21tYW5kZXJBcHAgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvY29tbWFuZGVyLWFwcC5yZWFjdCcpO1xuY29uc3QgSW5kZXhBcHAgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvaW5kZXgtYXBwLnJlYWN0Jyk7XG5jb25zdCBOb3RGb3VuZCA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9ub3QtZm91bmQucmVhY3QnKTtcbmNvbnN0IEludHJvU2NyZWVuID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL2ludHJvZHVjdGlvbi1zY3JlZW4ucmVhY3QnKTtcbmNvbnN0IFNvbGFyU3Rvcm0gPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvZnVsbC1zY3JlZW4tdmlkZW8uanMnKTtcbmNvbnN0IFRhc2sgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvdGFzay5yZWFjdCcpO1xuY29uc3QgRHVtbXlSZW5kZXJNaXhpbiA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9kdW1teS1yZW5kZXIubWl4aW4nKTtcbmNvbnN0IHsgY2xlYW5Sb290UGF0aCB9ID0gcmVxdWlyZSgnLi91dGlscycpO1xuY29uc3QgdGVhbU5hbWVNYXAgPSByZXF1aXJlKCcuL3RlYW0tbmFtZS1tYXAnKTtcblxuY29uc3QgUmVkaXJlY3RUb0ludHJvID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgc3RhdGljczoge1xuICAgICAgICB3aWxsVHJhbnNpdGlvblRvKHRyYW5zaXRpb24pIHtcbiAgICAgICAgICAgIHZhciB0ZWFtSWQgPSBjbGVhblJvb3RQYXRoKHRyYW5zaXRpb24ucGF0aCk7XG5cbiAgICAgICAgICAgIGlmKHRlYW1JZCBpbiB0ZWFtTmFtZU1hcC5uYW1lTWFwKSB7XG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvbi5yZWRpcmVjdCh0cmFuc2l0aW9uLnBhdGggKyAnL2ludHJvJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLy9taXhpbnMgOiBbRHVtbXlSZW5kZXJNaXhpbl1cbiAgICByZW5kZXIoKXtcbiAgICAgICAgY29uc29sZS5sb2coJ3NrYWwgaWtrZSByZW5kcmVzJyk7XG4gICAgICAgIHJldHVybiA8Tm90Rm91bmQgLz47XG4gICAgfVxufSk7XG5cbmNvbnN0IHJvdXRlcyA9IChcbiAgICA8Um91dGUgbmFtZT1cImFwcFwiIHBhdGg9XCIvXCIgaGFuZGxlcj17QXBwfT5cblxuICAgICAgICA8Um91dGUgbmFtZT1cImpvYi1jb21wbGV0ZWRcIiBwYXRoPScvY29tcGxldGVkJyBoYW5kbGVyPXtTb2xhclN0b3JtfSAvPlxuXG4gICAgICAgIDxSb3V0ZSBuYW1lPVwiY29tbWFuZGVyXCIgaGFuZGxlcj17TWlzc2lvbkNvbW1hbmRlckFwcH0vPlxuICAgICAgICA8Um91dGUgbmFtZT1cInRlYW0tcm9vdFwiIHBhdGg9Jy86dGVhbUlkJyBoYW5kbGVyPXtSZWRpcmVjdFRvSW50cm99IC8+XG4gICAgICAgIDxSb3V0ZSBuYW1lPVwidGVhbS1pbnRyb1wiIHBhdGg9Jy86dGVhbUlkL2ludHJvJyBoYW5kbGVyPXtJbnRyb1NjcmVlbn0gLz5cbiAgICAgICAgPFJvdXRlIG5hbWU9XCJ0ZWFtLXRhc2tcIiBwYXRoPScvOnRlYW1JZC90YXNrLzp0YXNrSWQnIGhhbmRsZXI9e1Rhc2t9IC8+XG5cbiAgICAgICAgPE5vdEZvdW5kUm91dGUgaGFuZGxlcj17Tm90Rm91bmR9Lz5cbiAgICAgICAgPERlZmF1bHRSb3V0ZSBoYW5kbGVyPXtJbmRleEFwcH0vPlxuICAgIDwvUm91dGU+XG4pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJvdXRlcztcbiIsImNvbnN0IEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpO1xuY29uc3QgIENIQU5HRV9FVkVOVD0gJ0NIQU5HRV9FVkVOVCc7XG5cbnZhciBwYXRoID0gbnVsbDtcblxuY2xhc3MgQmFzZVN0b3JlIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcblxuICAgIGVtaXRDaGFuZ2UoKSB7XG4gICAgICAgIHRoaXMuZW1pdChDSEFOR0VfRVZFTlQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrXG4gICAgICogQHJldHVybnMgZW1pdHRlciwgc28gY2FsbHMgY2FuIGJlIGNoYWluZWQuXG4gICAgICovXG4gICAgYWRkQ2hhbmdlTGlzdGVuZXIoY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub24oQ0hBTkdFX0VWRU5ULCBjYWxsYmFjayk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2tcbiAgICAgKiBAcmV0dXJucyBlbWl0dGVyLCBzbyBjYWxscyBjYW4gYmUgY2hhaW5lZC5cbiAgICAgKi9cbiAgICByZW1vdmVDaGFuZ2VMaXN0ZW5lcihjYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gdGhpcy5yZW1vdmVMaXN0ZW5lcihDSEFOR0VfRVZFTlQsIGNhbGxiYWNrKTtcbiAgICB9XG5cbiAgICBkaXNwYXRjaGVySW5kZXg6TnVtYmVyO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2VTdG9yZTtcbiIsImNvbnN0IERpc3BhdGNoZXIgPSByZXF1aXJlKCcuLi9hcHBkaXNwYXRjaGVyJyk7XG5jb25zdCBNQ29uc3RhbnRzID0gcmVxdWlyZSgnLi4vY29uc3RhbnRzL01pc3Npb25Db25zdGFudHMnKTtcbmNvbnN0IEJhc2VTdG9yZSA9IHJlcXVpcmUoJy4vYmFzZS1zdG9yZScpO1xuXG52YXIgZXZlbnRzQ29sbGVjdGlvbiA9IHtcbiAgICByZW1haW5pbmc6IFtdLFxuICAgIGNvbXBsZXRlZDogW10sXG4gICAgb3ZlcmR1ZTogW11cbn07XG5cbmNvbnN0IEV2ZW50U3RvcmUgPSBtb2R1bGUuZXhwb3J0cyA9IHdpbmRvdy5fX2V2ZW50U3RvcmUgPSBPYmplY3QuYXNzaWduKG5ldyBCYXNlU3RvcmUsIHtcblxuICAgIHJlbWFpbmluZygpIHsgcmV0dXJuIGV2ZW50c0NvbGxlY3Rpb24ucmVtYWluaW5nOyB9LFxuXG4gICAgY29tcGxldGVkKCkgeyByZXR1cm4gZXZlbnRzQ29sbGVjdGlvbi5jb21wbGV0ZWQ7IH0sXG5cbiAgICBvdmVyZHVlKCkgeyByZXR1cm4gZXZlbnRzQ29sbGVjdGlvbi5vdmVyZHVlOyB9LFxuXG4gICAgZGlzcGF0Y2hlckluZGV4OiBEaXNwYXRjaGVyLnJlZ2lzdGVyKChwYXlsb2FkKSA9PiB7XG5cbiAgICAgICAgc3dpdGNoKHBheWxvYWQuYWN0aW9uKXtcblxuICAgICAgICAgICAgY2FzZSBNQ29uc3RhbnRzLlJFQ0VJVkVEX0VWRU5UUzpcbiAgICAgICAgICAgICAgICBldmVudHNDb2xsZWN0aW9uLnJlbWFpbmluZyA9IHBheWxvYWQucmVtYWluaW5nO1xuICAgICAgICAgICAgICAgIGV2ZW50c0NvbGxlY3Rpb24ub3ZlcmR1ZSA9IHBheWxvYWQub3ZlcmR1ZTtcbiAgICAgICAgICAgICAgICBldmVudHNDb2xsZWN0aW9uLmNvbXBsZXRlZCA9IHBheWxvYWQuY29tcGxldGVkO1xuICAgICAgICAgICAgICAgIEV2ZW50U3RvcmUuZW1pdENoYW5nZSgpO1xuXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9KVxufSk7XG5cblxuLy93aW5kb3cuX19ldmVudFN0b3JlID0gbW9kdWxlLmV4cG9ydHM7XG4iLCIvKiBIb2xkcyB0aGUgc3RhdGUgb2Ygd2hldGhlciBpbnRyb2R1Y3Rpb25zIGhhdmUgYmVlbiByZWFkICovXG5cbmNvbnN0IEFwcERpc3BhdGNoZXIgPSByZXF1aXJlKCcuLi9hcHBkaXNwYXRjaGVyJyk7XG5jb25zdCBCYXNlU3RvcmUgPSByZXF1aXJlKCcuL2Jhc2Utc3RvcmUnKTtcbmNvbnN0IGNvbnN0YW50cyA9IHJlcXVpcmUoJy4uL2NvbnN0YW50cy9NaXNzaW9uQ29uc3RhbnRzJyk7XG5jb25zdCB3aW5kb3cgPSByZXF1aXJlKCdnbG9iYWwvd2luZG93Jyk7XG52YXIgaW50cm9SZWFkID0ge307XG5cbmNvbnN0IEludHJvZHVjdGlvblN0b3JlID0gT2JqZWN0LmFzc2lnbihuZXcgQmFzZVN0b3JlKCksIHtcblxuICAgIHNldEludHJvZHVjdGlvblJlYWQodGVhbSkge1xuICAgICAgICBpbnRyb1JlYWRbJ2ludHJvXycrdGVhbV0gPSB0cnVlO1xuICAgICAgICB0aGlzLmVtaXRDaGFuZ2UoKTtcbiAgICB9LFxuXG4gICAgaXNJbnRyb2R1Y3Rpb25SZWFkKHRlYW0pIHtcbiAgICAgICAgaWYoIXRlYW0pIHsgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIGFyZ3VtZW50IFwidGVhbVwiJyk7IH1cblxuICAgICAgICByZXR1cm4gaW50cm9SZWFkWydpbnRyb18nK3RlYW1dO1xuICAgIH0sXG5cblxuICAgIGRpc3BhdGNoZXJJbmRleDogQXBwRGlzcGF0Y2hlci5yZWdpc3RlcihmdW5jdGlvbiAocGF5bG9hZCkge1xuICAgICAgICB2YXIgYWN0aW9uID0gcGF5bG9hZC5hY3Rpb247XG5cbiAgICAgICAgc3dpdGNoIChhY3Rpb24pIHtcbiAgICAgICAgICAgIGNhc2UgY29uc3RhbnRzLklOVFJPRFVDVElPTl9SRUFEOlxuICAgICAgICAgICAgICAgIEludHJvZHVjdGlvblN0b3JlLnNldEludHJvZHVjdGlvblJlYWQocGF5bG9hZC50ZWFtTmFtZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJ1ZTsgLy8gTm8gZXJyb3JzLiBOZWVkZWQgYnkgcHJvbWlzZSBpbiBEaXNwYXRjaGVyLlxuICAgIH0pXG5cbn0pO1xuXG53aW5kb3cuX19JbnRyb2R1Y3Rpb25TdG9yZT0gSW50cm9kdWN0aW9uU3RvcmU7XG5tb2R1bGUuZXhwb3J0cyA9IEludHJvZHVjdGlvblN0b3JlO1xuIiwiLyogQSBzdG9yZSB0aGF0IGNhbiBiZSBxdWVyaWVkIGZvciB0aGUgY3VycmVudCBwYXRoICovXG5cbmNvbnN0IHsgRW1pdHRlciB9ID0gcmVxdWlyZSgnZXZlbnRzJyk7XG5jb25zdCBBcHBEaXNwYXRjaGVyID0gcmVxdWlyZSgnLi4vYXBwZGlzcGF0Y2hlcicpO1xuY29uc3QgQmFzZVN0b3JlID0gcmVxdWlyZSgnLi9iYXNlLXN0b3JlJyk7XG5jb25zdCB7IFJFTU9WRV9NRVNTQUdFLCBNRVNTQUdFX0FEREVEIH0gPSByZXF1aXJlKCcuLi9jb25zdGFudHMvTWVzc2FnZUNvbnN0YW50cycpO1xudmFyIG1lc3NhZ2VzID0ge307XG5cblxudmFyIE1lc3NhZ2VTdG9yZSA9IE9iamVjdC5hc3NpZ24obmV3IEJhc2VTdG9yZSgpLCB7XG5cbiAgICByZXNldCgpIHtcbiAgICAgICAgbWVzc2FnZXMgPSB7fTtcbiAgICAgICAgdGhpcy5lbWl0Q2hhbmdlKCk7XG4gICAgfSxcblxuICAgIGhhbmRsZUFkZGVkTWVzc2FnZShkYXRhKSB7XG4gICAgICAgIGRhdGEuZGlzbWlzc2FibGUgPSBkYXRhLmRpc21pc3NhYmxlID09PSB1bmRlZmluZWQgPyB0cnVlIDogZGF0YS5kaXNtaXNzYWJsZTtcbiAgICAgICAgbWVzc2FnZXNbZGF0YS5pZF0gPSBkYXRhO1xuICAgICAgICB0aGlzLmVtaXRDaGFuZ2UoKTtcbiAgICB9LFxuXG4gICAgaGFuZGxlUmVtb3ZlTWVzc2FnZShpZCkge1xuICAgICAgICBkZWxldGUgbWVzc2FnZXNbaWRdO1xuICAgICAgICB0aGlzLmVtaXRDaGFuZ2UoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQSBsaXN0IG9mIGFsbCBtZXNzYWdlcyBtYXRjaGluZyBmaWx0ZXJcbiAgICAgKiBAcGFyYW0gW2ZpbHRlcl1cbiAgICAgKiBAcmV0dXJucyBbXU1lc3NhZ2UgYSBNZXNzYWdlID0geyB0ZXh0LCBpZCwgbGV2ZWwgfVxuICAgICAqL1xuICAgIGdldE1lc3NhZ2VzKGZpbHRlcikge1xuICAgICAgICBpZiAoIWZpbHRlcikge1xuICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKG1lc3NhZ2VzKS5tYXAoKG1zZ0tleSk9PiAgbWVzc2FnZXNbbXNnS2V5XSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB0aHJvdyBuZXcgRXJyb3IoJ1VOSU1QTEVNRU5URUQgXCJmaWx0ZXJcIiBmZWF0dXJlJyk7XG4gICAgfSxcblxuICAgIGRpc3BhdGNoZXJJbmRleDogQXBwRGlzcGF0Y2hlci5yZWdpc3RlcihmdW5jdGlvbiAocGF5bG9hZCkge1xuICAgICAgICB2YXIgeyBhY3Rpb24sIGRhdGEgfSA9IHBheWxvYWQ7XG5cbiAgICAgICAgc3dpdGNoIChhY3Rpb24pIHtcbiAgICAgICAgICAgIGNhc2UgTUVTU0FHRV9BRERFRDpcbiAgICAgICAgICAgICAgICBNZXNzYWdlU3RvcmUuaGFuZGxlQWRkZWRNZXNzYWdlKGRhdGEpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBSRU1PVkVfTUVTU0FHRTpcbiAgICAgICAgICAgICAgICBNZXNzYWdlU3RvcmUuaGFuZGxlUmVtb3ZlTWVzc2FnZShkYXRhKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlOyAvLyBObyBlcnJvcnMuIE5lZWRlZCBieSBwcm9taXNlIGluIERpc3BhdGNoZXIuXG4gICAgfSlcblxufSk7XG5cbndpbmRvdy5fX01lc3NhZ2VTdG9yZSA9IE1lc3NhZ2VTdG9yZTtcbm1vZHVsZS5leHBvcnRzID0gTWVzc2FnZVN0b3JlO1xuIiwiLyogQSBzdG9yZSB0aGF0IGNhbiBiZSBxdWVyaWVkIGZvciB0aGUgY3VycmVudCBwYXRoICovXG5cbmNvbnN0IHsgRW1pdHRlciB9ID0gcmVxdWlyZSgnZXZlbnRzJyk7XG5jb25zdCBBcHBEaXNwYXRjaGVyID0gcmVxdWlyZSgnLi4vYXBwZGlzcGF0Y2hlcicpO1xuY29uc3QgQmFzZVN0b3JlID0gcmVxdWlyZSgnLi9iYXNlLXN0b3JlJyk7XG5jb25zdCB7IE1JU1NJT05fU1RBUlRFRF9FVkVOVCxNSVNTSU9OX1NUT1BQRURfRVZFTlQsIFJFQ0VJVkVEX0FQUF9TVEFURSB9ID0gIHJlcXVpcmUoJy4uL2NvbnN0YW50cy9NaXNzaW9uQ29uc3RhbnRzJyk7XG5cbnZhciBtaXNzaW9uUnVubmluZyA9IGZhbHNlLCBtaXNzaW9uSGFzQmVlblN0b3BwZWQgPSBmYWxzZTtcbnZhciBjdXJyZW50Q2hhcHRlciA9IG51bGw7XG5cbnZhciBNaXNzaW9uU3RhdGVTdG9yZSA9IE9iamVjdC5hc3NpZ24obmV3IEJhc2VTdG9yZSgpLCB7XG5cbiAgICBoYW5kbGVNaXNzaW9uU3RhcnRlZCgpIHtcbiAgICAgICAgbWlzc2lvblJ1bm5pbmcgPSB0cnVlO1xuICAgICAgICB0aGlzLmVtaXRDaGFuZ2UoKTtcbiAgICB9LFxuXG4gICAgaGFuZGxlTWlzc2lvblN0b3BwZWQoKSB7XG4gICAgICAgIG1pc3Npb25SdW5uaW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZW1pdENoYW5nZSgpO1xuICAgIH0sXG5cbiAgICBpc01pc3Npb25SdW5uaW5nKCkge1xuICAgICAgICByZXR1cm4gbWlzc2lvblJ1bm5pbmc7XG4gICAgfSxcblxuICAgIGlzTWlzc2lvblN0b3BwZWQoKSB7XG4gICAgICAgIHJldHVybiBtaXNzaW9uSGFzQmVlblN0b3BwZWQ7XG4gICAgfSxcblxuICAgIGN1cnJlbnRDaGFwdGVyKCl7XG4gICAgICAgIHJldHVybiBjdXJyZW50Q2hhcHRlcjtcbiAgICB9LFxuXG4gICAgZGlzcGF0Y2hlckluZGV4OiBBcHBEaXNwYXRjaGVyLnJlZ2lzdGVyKGZ1bmN0aW9uIChwYXlsb2FkKSB7XG4gICAgICAgIHZhciB7IGFjdGlvbn0gPSBwYXlsb2FkO1xuXG4gICAgICAgIHN3aXRjaCAoYWN0aW9uKSB7XG4gICAgICAgICAgICBjYXNlIE1JU1NJT05fU1RBUlRFRF9FVkVOVDpcbiAgICAgICAgICAgICAgICByZXR1cm4gTWlzc2lvblN0YXRlU3RvcmUuaGFuZGxlTWlzc2lvblN0YXJ0ZWQoKTtcblxuICAgICAgICAgICAgY2FzZSBNSVNTSU9OX1NUT1BQRURfRVZFTlQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIE1pc3Npb25TdGF0ZVN0b3JlLmhhbmRsZU1pc3Npb25TdG9wcGVkKCk7XG5cbiAgICAgICAgICAgIGNhc2UgUkVDRUlWRURfQVBQX1NUQVRFOlxuICAgICAgICAgICAgICAgIGxldCBhcHBTdGF0ZSA9IHBheWxvYWQuYXBwU3RhdGU7XG4gICAgICAgICAgICAgICAgbWlzc2lvblJ1bm5pbmcgPSBhcHBTdGF0ZS5taXNzaW9uX3J1bm5pbmc7XG4gICAgICAgICAgICAgICAgY3VycmVudENoYXB0ZXIgPSBhcHBTdGF0ZS5jdXJyZW50X2NoYXB0ZXI7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE1pc3Npb25TdGF0ZVN0b3JlLmVtaXRDaGFuZ2UoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlOyAvLyBObyBlcnJvcnMuIE5lZWRlZCBieSBwcm9taXNlIGluIERpc3BhdGNoZXIuXG4gICAgfSlcblxufSk7XG5cbndpbmRvdy5fX01pc3Npb25TdGF0ZVN0b3JlID0gTWlzc2lvblN0YXRlU3RvcmU7XG5tb2R1bGUuZXhwb3J0cyA9IE1pc3Npb25TdGF0ZVN0b3JlO1xuIiwiLyogQSBzaW5nbGV0b24gc3RvcmUgdGhhdCBjYW4gYmUgcXVlcmllZCBmb3IgcmVtYWluaW5nIHRpbWUgKi9cblxuY29uc3QgQXBwRGlzcGF0Y2hlciA9IHJlcXVpcmUoJy4uL2FwcGRpc3BhdGNoZXInKTtcbmNvbnN0IEJhc2VTdG9yZSA9IHJlcXVpcmUoJy4vYmFzZS1zdG9yZScpO1xuY29uc3QgU2NpZW5jZVRlYW1Db25zdGFudHMgPSByZXF1aXJlKCcuLi9jb25zdGFudHMvU2NpZW5jZVRlYW1Db25zdGFudHMnKTtcbmNvbnN0IE1pc3Npb25Db25zdGFudHMgPSByZXF1aXJlKCcuLi9jb25zdGFudHMvTWlzc2lvbkNvbnN0YW50cycpO1xuY29uc3QgcmFuZG9tSW50ID0gcmVxdWlyZSgnLi4vdXRpbHMnKS5yYW5kb21JbnQ7XG5jb25zdCByYWRpYXRpb25SYW5nZSA9IHtcbiAgICBtaW46IDIwLFxuICAgIG1heDogNDBcbn07XG52YXIgc2FtcGxlcyA9IFtdO1xudmFyIHRvdGFsUmFkaWF0aW9uID0gMDtcbnZhciBsYXN0Q2FsY3VsYXRlZEF2ZXJhZ2UgPSBudWxsO1xuXG5jb25zdCBSYWRpYXRpb25TdG9yZSA9IE9iamVjdC5hc3NpZ24obmV3IEJhc2VTdG9yZSgpLCB7XG5cbiAgICBfc2V0UmFkaWF0aW9uTGV2ZWwobWluLCBtYXgpIHtcbiAgICAgICAgcmFkaWF0aW9uUmFuZ2UubWluID0gbWluO1xuICAgICAgICByYWRpYXRpb25SYW5nZS5tYXggPSBtYXg7XG4gICAgICAgIHRoaXMuZW1pdENoYW5nZSgpO1xuICAgIH0sXG5cbiAgICBfY2xlYXJTYW1wbGVzKCkge1xuICAgICAgICBzYW1wbGVzID0gW107XG4gICAgICAgIHRoaXMuZW1pdENoYW5nZSgpO1xuICAgIH0sXG5cbiAgICBfdGFrZVNhbXBsZSgpIHtcbiAgICAgICAgc2FtcGxlcy5wdXNoKHRoaXMuZ2V0TGV2ZWwoKSk7XG4gICAgICAgIHRoaXMuZW1pdENoYW5nZSgpO1xuICAgIH0sXG5cbiAgICBnZXRMZXZlbCgpIHtcbiAgICAgICAgcmV0dXJuIHJhbmRvbUludChyYWRpYXRpb25SYW5nZS5taW4sIHJhZGlhdGlvblJhbmdlLm1heCk7XG4gICAgfSxcblxuICAgIGdldFRvdGFsTGV2ZWwoKSB7XG4gICAgICAgIHJldHVybiB0b3RhbFJhZGlhdGlvbjtcbiAgICB9LFxuXG4gICAgZ2V0U2FtcGxlcygpIHtcbiAgICAgICAgcmV0dXJuIHNhbXBsZXMuc2xpY2UoKTtcbiAgICB9LFxuXG4gICAgZ2V0U3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzYW1wbGVzOiBzYW1wbGVzLnNsaWNlKDApLFxuICAgICAgICAgICAgdG90YWw6IHRvdGFsUmFkaWF0aW9uLFxuICAgICAgICAgICAgY3VycmVudExldmVsOiB0aGlzLmdldExldmVsKCksXG4gICAgICAgICAgICBsYXN0Q2FsY3VsYXRlZEF2ZXJhZ2U6IGxhc3RDYWxjdWxhdGVkQXZlcmFnZVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIGRpc3BhdGNoZXJJbmRleDogQXBwRGlzcGF0Y2hlci5yZWdpc3RlcihmdW5jdGlvbiAocGF5bG9hZCkge1xuICAgICAgICB2YXIgeyBhY3Rpb24sIGRhdGF9ID0gcGF5bG9hZDtcblxuICAgICAgICBzd2l0Y2ggKGFjdGlvbikge1xuICAgICAgICAgICAgY2FzZSBTY2llbmNlVGVhbUNvbnN0YW50cy5TQ0lFTkNFX1JBRElBVElPTl9MRVZFTF9DSEFOR0VEOlxuICAgICAgICAgICAgICAgIFJhZGlhdGlvblN0b3JlLl9zZXRSYWRpYXRpb25MZXZlbChkYXRhLm1pbiwgZGF0YS5tYXgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBTY2llbmNlVGVhbUNvbnN0YW50cy5TQ0lFTkNFX1RPVEFMX1JBRElBVElPTl9MRVZFTF9DSEFOR0VEOlxuICAgICAgICAgICAgICAgIHRvdGFsUmFkaWF0aW9uID0gZGF0YS50b3RhbDtcbiAgICAgICAgICAgICAgICBSYWRpYXRpb25TdG9yZS5lbWl0Q2hhbmdlKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgU2NpZW5jZVRlYW1Db25zdGFudHMuU0NJRU5DRV9UQUtFX1JBRElBVElPTl9TQU1QTEU6XG4gICAgICAgICAgICAgICAgUmFkaWF0aW9uU3RvcmUuX3Rha2VTYW1wbGUoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgU2NpZW5jZVRlYW1Db25zdGFudHMuU0NJRU5DRV9BVkdfUkFESUFUSU9OX0NBTENVTEFURUQ6XG4gICAgICAgICAgICAgICAgbGFzdENhbGN1bGF0ZWRBdmVyYWdlID0gZGF0YS5hdmVyYWdlO1xuICAgICAgICAgICAgICAgIFJhZGlhdGlvblN0b3JlLmVtaXRDaGFuZ2UoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgU2NpZW5jZVRlYW1Db25zdGFudHMuU0NJRU5DRV9DTEVBUl9SQURJQVRJT05fU0FNUExFUzpcbiAgICAgICAgICAgICAgICBzYW1wbGVzID0gW107XG4gICAgICAgICAgICAgICAgUmFkaWF0aW9uU3RvcmUuZW1pdENoYW5nZSgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBNaXNzaW9uQ29uc3RhbnRzLlJFQ0VJVkVEX0FQUF9TVEFURTpcbiAgICAgICAgICAgICAgICBsZXQgYXBwU3RhdGUgPSBwYXlsb2FkLmFwcFN0YXRlO1xuXG4gICAgICAgICAgICAgICAgaWYoYXBwU3RhdGUuc2NpZW5jZSAmJiBhcHBTdGF0ZS5zY2llbmNlLnJhZGlhdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBsZXQgcmFkaWF0aW9uID0gYXBwU3RhdGUuc2NpZW5jZS5yYWRpYXRpb247XG4gICAgICAgICAgICAgICAgICAgIHNhbXBsZXMgPSByYWRpYXRpb24uc2FtcGxlcztcbiAgICAgICAgICAgICAgICAgICAgbGFzdENhbGN1bGF0ZWRBdmVyYWdlID0gcmFkaWF0aW9uLmxhc3RDYWxjdWxhdGVkQXZlcmFnZTtcbiAgICAgICAgICAgICAgICAgICAgdG90YWxSYWRpYXRpb24gPSByYWRpYXRpb24udG90YWw7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgUmFkaWF0aW9uU3RvcmUuZW1pdENoYW5nZSgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBNaXNzaW9uQ29uc3RhbnRzLk1JU1NJT05fV0FTX1JFU0VUOlxuICAgICAgICAgICAgICAgIHNhbXBsZXMgPSBbXTtcbiAgICAgICAgICAgICAgICBsYXN0Q2FsY3VsYXRlZEF2ZXJhZ2UgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRvdGFsUmFkaWF0aW9uID0gMDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlOyAvLyBObyBlcnJvcnMuIE5lZWRlZCBieSBwcm9taXNlIGluIERpc3BhdGNoZXIuXG4gICAgfSlcblxufSk7XG5cbndpbmRvdy5fX1JhZGlhdGlvblN0b3JlID0gUmFkaWF0aW9uU3RvcmU7XG5tb2R1bGUuZXhwb3J0cyA9IFJhZGlhdGlvblN0b3JlO1xuIiwiLyogQSBzdG9yZSB0aGF0IGNhbiBiZSBxdWVyaWVkIGZvciB0aGUgY3VycmVudCBwYXRoICovXG5cbmNvbnN0IEFwcERpc3BhdGNoZXIgPSByZXF1aXJlKCcuLi9hcHBkaXNwYXRjaGVyJyk7XG5jb25zdCBCYXNlU3RvcmUgPSByZXF1aXJlKCcuL2Jhc2Utc3RvcmUnKTtcbmNvbnN0IHsgUk9VVEVfQ0hBTkdFRF9FVkVOVCB9ID0gcmVxdWlyZSgnLi4vY29uc3RhbnRzL1JvdXRlckNvbnN0YW50cycpO1xuY29uc3QgeyBjbGVhblJvb3RQYXRoIH09IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbnZhciByb3V0ZXIgPSByZXF1aXJlKCcuLi9yb3V0ZXItY29udGFpbmVyJylcblxudmFyIFJvdXRlU3RvcmUgPSBPYmplY3QuYXNzaWduKG5ldyBCYXNlU3RvcmUoKSwge1xuXG4gICAgaGFuZGxlUm91dGVDaGFuZ2VkKHN0YXRlKSB7XG4gICAgICAgIHRoaXMuZW1pdENoYW5nZSgpO1xuICAgIH0sXG5cbiAgICBnZXRUZWFtSWQoKSB7XG4gICAgICAgIHJldHVybiByb3V0ZXIuZ2V0VGVhbUlkKCk7XG4gICAgfSxcblxuICAgIGdldFRhc2tJZCgpIHtcbiAgICAgICAgcmV0dXJuIHJvdXRlci5nZXRUYXNrSWQoKTtcbiAgICB9LFxuXG4gICAgZGlzcGF0Y2hlckluZGV4OiBBcHBEaXNwYXRjaGVyLnJlZ2lzdGVyKGZ1bmN0aW9uIChwYXlsb2FkKSB7XG4gICAgICAgIHZhciBhY3Rpb24gPSBwYXlsb2FkLmFjdGlvbjtcblxuICAgICAgICBzd2l0Y2ggKGFjdGlvbikge1xuICAgICAgICAgICAgY2FzZSBST1VURV9DSEFOR0VEX0VWRU5UOlxuICAgICAgICAgICAgICAgIFJvdXRlU3RvcmUuaGFuZGxlUm91dGVDaGFuZ2VkKHBheWxvYWQuc3RhdGUpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRydWU7IC8vIE5vIGVycm9ycy4gTmVlZGVkIGJ5IHByb21pc2UgaW4gRGlzcGF0Y2hlci5cbiAgICB9KVxuXG59KTtcblxud2luZG93Ll9fUm91dGVTdG9yZSA9IFJvdXRlU3RvcmU7XG5tb2R1bGUuZXhwb3J0cyA9IFJvdXRlU3RvcmU7XG4iLCIvKiBBIHN0b3JlIHRoYXQgY2FuIGJlIHF1ZXJpZWQgZm9yIHRoZSBjdXJyZW50IHBhdGggKi9cblxuY29uc3QgQXBwRGlzcGF0Y2hlciA9IHJlcXVpcmUoJy4uL2FwcGRpc3BhdGNoZXInKTtcbmNvbnN0IEJhc2VTdG9yZSA9IHJlcXVpcmUoJy4vYmFzZS1zdG9yZScpO1xuY29uc3QgUm91dGVTdG9yZSA9IHJlcXVpcmUoJy4vcm91dGUtc3RvcmUnKTtcbmNvbnN0IE1pc3Npb25Db25zdGFudHMgPSByZXF1aXJlKCcuLi9jb25zdGFudHMvTWlzc2lvbkNvbnN0YW50cycpO1xuXG52YXIgYXdhaXRpbmdOZXdJbnN0cnVjdGlvbnMgPSB7XG4gICAgJ3RleHQnIDogJ1ZlbnRlciBww6UgbnllIGluc3RydWtzZXInXG59O1xuXG52YXIgYXNzaWdubWVudHMgPSB7XG4gICAgc2NpZW5jZToge1xuICAgICAgICBjdXJyZW50IDogbnVsbCxcbiAgICAgICAgZGVmYXVsdCA6ICdzYW1wbGUnLFxuICAgICAgICBzYW1wbGU6IHtcbiAgICAgICAgICAgIHRleHQ6ICdTdGFydCBrbG9ra2Egb2cgdGEgZmlyZSBtw6VsaW5nZXIgamV2bnQgZm9yZGVsdCB1dG92ZXIgZGUgMzAgc2VrdW5kZW5lJyxcbiAgICAgICAgICAgIG5leHQ6ICdhdmVyYWdlJ1xuICAgICAgICB9LFxuICAgICAgICBhdmVyYWdlOiB7XG4gICAgICAgICAgICB0ZXh0OiAnUmVnbiB1dCBnamVubm9tc25pdHRzdmVyZGllbiBhdiBzdHLDpWxpbmdzdmVyZGllbmUgZGVyZSBmYW50LiBTa3JpdiBkZW4gaW5uIGkgdGVrc3RmZWx0ZXQuJyxcbiAgICAgICAgICAgIG5leHQ6ICdhZGR0b3RhbCdcbiAgICAgICAgfSxcbiAgICAgICAgYWRkdG90YWw6IHtcbiAgICAgICAgICAgIHRleHQ6ICdCYXNlcnQgcMOlIGZhcmdlbiBzb20gYmxlIGluZGlrZXJ0IHZlZCBldmFsdWVyaW5nIGF2IGdqZW5ub21zbml0dHN2ZXJkaWVuICdcbiAgICAgICAgICAgICsgJ3NrYWwgdmkgbsOlIGxlZ2dlIHRpbCBldCB0YWxsIHRpbCB0b3RhbHQgZnVubmV0IHN0csOlbGluZ3NtZW5nZGUuJ1xuICAgICAgICAgICAgKyAnIEZvciBncsO4bm4gc3RhdHVzIG1hbiBsZWdnZSB0aWwgMCwgJ1xuICAgICAgICAgICAgKyAnIGZvciBvcmFuc2ogc3RhdHVzIG1hbiBsZWdnZSB0aWwgMTUsICdcbiAgICAgICAgICAgICsgJyBmb3IgcsO4ZCBzdGF0dXMgbWFuIGxlZ2dlIHRpbCA1MC4nXG4gICAgICAgICAgICArICcgRGVuIHRvdGFsZSBzdHLDpWxpbmdzdmVyZGllbiBpIGtyb3BwZW4gc2thbCBoZWxzdCBpa2tlIGfDpSBvdmVyIDUwLCBvZyBhbGRyaSBvdmVyIDc1IScsXG4gICAgICAgICAgICBuZXh0IDogJ2F3YWl0aW5nJ1xuICAgICAgICB9LFxuICAgICAgICBhd2FpdGluZyA6IGF3YWl0aW5nTmV3SW5zdHJ1Y3Rpb25zXG4gICAgfVxufTtcblxudmFyIFRhc2tTdG9yZSA9IE9iamVjdC5hc3NpZ24obmV3IEJhc2VTdG9yZSgpLCB7XG5cbiAgICBnZXRDdXJyZW50VGFzaygpIHtcbiAgICAgICAgdmFyIHRlYW1JZCA9IFJvdXRlU3RvcmUuZ2V0VGVhbUlkKCk7XG4gICAgICAgIHZhciBhc3NpZ25tZW50c0ZvclRlYW0gPSBhc3NpZ25tZW50c1t0ZWFtSWRdO1xuICAgICAgICByZXR1cm4gKGFzc2lnbm1lbnRzRm9yVGVhbSAmJiBhc3NpZ25tZW50c0ZvclRlYW1bdGhpcy5nZXRDdXJyZW50VGFza0lkKHRlYW1JZCldKVxuICAgICAgICAgICAgfHwgJ0luZ2VuIG9wcGdhdmUgZnVubmV0JztcbiAgICB9LFxuXG4gICAgZ2V0Q3VycmVudFRhc2tJZCh0ZWFtSWQgPSBSb3V0ZVN0b3JlLmdldFRlYW1JZCgpKSB7XG4gICAgICAgIGlmKCF0ZWFtSWQubGVuZ3RoKSByZXR1cm4gbnVsbDtcblxuICAgICAgICByZXR1cm4gYXNzaWdubWVudHNbdGVhbUlkXS5jdXJyZW50IHx8ICdhd2FpdGluZyc7XG4gICAgfSxcblxuICAgIGdldFN0YXRlKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY3VycmVudFRhc2tJZDogdGhpcy5nZXRDdXJyZW50VGFza0lkKCksXG4gICAgICAgICAgICBjdXJyZW50VGFzazogdGhpcy5nZXRDdXJyZW50VGFzaygpLnRleHQsXG4gICAgICAgICAgICBuZXh0VGFza0lkIDogdGhpcy5nZXRDdXJyZW50VGFzaygpLm5leHRcbiAgICAgICAgfTtcbiAgICB9LFxuXG5cblxuICAgIGRpc3BhdGNoZXJJbmRleDogQXBwRGlzcGF0Y2hlci5yZWdpc3RlcihmdW5jdGlvbiAocGF5bG9hZCkge1xuICAgICAgICB2YXIgdGFza0lkO1xuICAgICAgICB2YXIgdGVhbUlkO1xuICAgICAgICB2YXIgY3VycmVudFRhc2s7XG4gICAgICAgIHZhciB0ZWFtVGFza3M7XG5cbiAgICAgICAgc3dpdGNoKHBheWxvYWQuYWN0aW9uKSB7XG5cbiAgICAgICAgICAgIGNhc2UgTWlzc2lvbkNvbnN0YW50cy5TVEFSVF9UQVNLOlxuICAgICAgICAgICAgICAgIHRlYW1JZCA9IHBheWxvYWQudGVhbUlkO1xuICAgICAgICAgICAgICAgIHRhc2tJZCA9IHBheWxvYWQudGFza0lkO1xuXG4gICAgICAgICAgICAgICAgdGVhbVRhc2tzID0gYXNzaWdubWVudHNbdGVhbUlkXTtcbiAgICAgICAgICAgICAgICB0ZWFtVGFza3MuY3VycmVudCA9IHRhc2tJZDtcbiAgICAgICAgICAgICAgICBUYXNrU3RvcmUuZW1pdENoYW5nZSgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIE1pc3Npb25Db25zdGFudHMuQ09NUExFVEVEX1RBU0s6XG4gICAgICAgICAgICAgICAgdGVhbUlkID0gcGF5bG9hZC50ZWFtSWQ7XG4gICAgICAgICAgICAgICAgdGFza0lkID0gcGF5bG9hZC50YXNrSWQ7XG5cbiAgICAgICAgICAgICAgICB0ZWFtVGFza3MgPSBhc3NpZ25tZW50c1t0ZWFtSWRdO1xuICAgICAgICAgICAgICAgIGN1cnJlbnRUYXNrID0gdGVhbVRhc2tzW3Rhc2tJZF07XG4gICAgICAgICAgICAgICAgdGVhbVRhc2tzLmN1cnJlbnQgPSBjdXJyZW50VGFzay5uZXh0O1xuICAgICAgICAgICAgICAgIFRhc2tTdG9yZS5lbWl0Q2hhbmdlKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlOyAvLyBObyBlcnJvcnMuIE5lZWRlZCBieSBwcm9taXNlIGluIERpc3BhdGNoZXIuXG4gICAgfSlcblxufSk7XG5cbndpbmRvdy5fX1Rhc2tTdG9yZSA9IFRhc2tTdG9yZTtcbm1vZHVsZS5leHBvcnRzID0gVGFza1N0b3JlO1xuIiwiLyogQSBzaW5nbGV0b24gc3RvcmUgdGhhdCBjYW4gYmUgcXVlcmllZCBmb3IgcmVtYWluaW5nIHRpbWUgKi9cblxuY29uc3QgY2hlY2sgPSByZXF1aXJlKCdjaGVjay10eXBlcycpO1xuY29uc3QgQXBwRGlzcGF0Y2hlciA9IHJlcXVpcmUoJy4uL2FwcGRpc3BhdGNoZXInKTtcbmNvbnN0IEJhc2VTdG9yZSA9IHJlcXVpcmUoJy4vYmFzZS1zdG9yZScpO1xuY29uc3QgVGltZXJDb25zdGFudHMgPSByZXF1aXJlKCcuLi9jb25zdGFudHMvVGltZXJDb25zdGFudHMnKTtcbmNvbnN0IE1pc3Npb25Db25zdGFudHMgPSByZXF1aXJlKCcuLi9jb25zdGFudHMvTWlzc2lvbkNvbnN0YW50cycpO1xuXG5cbi8vIGtlZXBpbmcgc3RhdGUgaGlkZGVuIGluIHRoZSBtb2R1bGVcbnZhciByZW1haW5pbmdUaW1lID0ge30sXG4gICAgaW5pdGlhbFRpbWUgPSB7fSxcbiAgICBpbnRlcnZhbElkID0ge30sXG4gICAgZWxhcHNlZE1pc3Npb25UaW1lID0gMCxcbiAgICBtaXNzaW9uVGltZXIgPSBudWxsO1xuXG5cbmZ1bmN0aW9uIHJlc2V0KHRpbWVySWQpIHtcbiAgICBzdG9wKHRpbWVySWQpO1xuICAgIHJlbWFpbmluZ1RpbWVbdGltZXJJZF0gPSBpbml0aWFsVGltZVt0aW1lcklkXTtcbn1cblxuZnVuY3Rpb24gc3RhcnQodGltZXJJZCkge1xuICAgIGFzc2VydEV4aXN0cyh0aW1lcklkKTtcblxuICAgIGludGVydmFsSWRbdGltZXJJZF0gPSBzZXRJbnRlcnZhbChmdW5jdGlvbiBmbigpIHtcbiAgICAgICAgaWYgKHJlbWFpbmluZ1RpbWVbdGltZXJJZF0gPiAwKSB7XG4gICAgICAgICAgICByZW1haW5pbmdUaW1lW3RpbWVySWRdLS07XG4gICAgICAgICAgICBUaW1lclN0b3JlLmVtaXRDaGFuZ2UoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0b3AodGltZXJJZCk7XG4gICAgICAgIH1cbiAgICB9LCAxMDAwKTtcbn1cblxuZnVuY3Rpb24gc3RvcCh0aW1lcklkKSB7XG4gICAgYXNzZXJ0RXhpc3RzKHRpbWVySWQpO1xuXG4gICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbElkW3RpbWVySWRdKTtcbiAgICBkZWxldGUgaW50ZXJ2YWxJZFt0aW1lcklkXTtcbiAgICBUaW1lclN0b3JlLmVtaXRDaGFuZ2UoKTtcbn1cblxuZnVuY3Rpb24gc3RhcnRNaXNzaW9uVGltZXIoKXtcbiAgICBzdG9wTWlzc2lvblRpbWVyKCk7XG4gICAgbWlzc2lvblRpbWVyID0gc2V0SW50ZXJ2YWwoKCk9PntcbiAgICAgICAgZWxhcHNlZE1pc3Npb25UaW1lKys7XG4gICAgICAgIFRpbWVyU3RvcmUuZW1pdENoYW5nZSgpO1xuICAgIH0sMTAwMCk7XG59XG5cbmZ1bmN0aW9uIHN0b3BNaXNzaW9uVGltZXIoKXtcbiAgICBjbGVhckludGVydmFsKG1pc3Npb25UaW1lcik7XG59XG5cblxuLyoqXG4gKiBAcGFyYW0gZGF0YS5yZW1haW5pbmdUaW1lIHtOdW1iZXJ9XG4gKiBAcGFyYW0gZGF0YS50aW1lcklkIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGhhbmRsZVJlbWFpbmluZ1RpbWVDaGFuZ2VkKGRhdGEpIHtcbiAgICB2YXIgcmVtYWluaW5nID0gZGF0YS5yZW1haW5pbmdUaW1lO1xuICAgIGlmIChyZW1haW5pbmcgPD0gMCkgdGhyb3cgbmV3IFR5cGVFcnJvcignR290IGludmFsaWQgcmVtYWluaW5nIHRpbWUgOicgKyByZW1haW5pbmcpO1xuXG4gICAgcmVtYWluaW5nVGltZVtkYXRhLnRpbWVySWRdID0gcmVtYWluaW5nO1xuICAgIGluaXRpYWxUaW1lW2RhdGEudGltZXJJZF0gPSByZW1haW5pbmc7XG4gICAgVGltZXJTdG9yZS5lbWl0Q2hhbmdlKCk7XG59XG5cbmZ1bmN0aW9uIGFzc2VydEV4aXN0cyh0aW1lcklkKSB7XG4gICAgY2hlY2suYXNzZXJ0KHRpbWVySWQgaW4gcmVtYWluaW5nVGltZSwgJ05vIHRpbWUgc2V0IGZvciB0aW1lciB3aXRoIGlkICcgKyB0aW1lcklkKTtcbn1cblxuY29uc3QgVGltZXJTdG9yZSA9IE9iamVjdC5hc3NpZ24obmV3IEJhc2VTdG9yZSgpLCB7XG4gICAgXG4gICAgZ2V0UmVtYWluaW5nVGltZSh0aW1lcklkKSB7XG4gICAgICAgIGNoZWNrLm51bWJlcih0aW1lcklkKTtcbiAgICAgICAgcmV0dXJuIHJlbWFpbmluZ1RpbWVbdGltZXJJZF07XG4gICAgfSxcblxuICAgIGlzUnVubmluZyh0aW1lcklkKSB7XG4gICAgICAgIGNoZWNrLm51bWJlcih0aW1lcklkKTtcbiAgICAgICAgcmV0dXJuICEhaW50ZXJ2YWxJZFt0aW1lcklkXTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVGhlIHRpbWVyIGlzIHNldCAob3IgaGFzIGJlZW4gcmVzZXQpLCBidXQgbm90IHN0YXJ0ZWRcbiAgICAgKiBAcGFyYW0gdGltZXJJZFxuICAgICAqIEByZXR1cm5zIHRydWUgaWYgcmVhZHksIGZhbHNlIGlmIHJ1bm5pbmcgb3IgdGltZWQgb3V0XG4gICAgICovXG4gICAgaXNSZWFkeVRvU3RhcnQodGltZXJJZCkge1xuICAgICAgICBjaGVjay5udW1iZXIodGltZXJJZCk7XG4gICAgICAgIFxuICAgICAgICBpZih0aGlzLmlzUnVubmluZyh0aW1lcklkKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRSZW1haW5pbmdUaW1lKHRpbWVySWQpID4gMDtcbiAgICB9LFxuXG4gICAgZ2V0RWxhcHNlZE1pc3Npb25UaW1lKCkge1xuICAgICAgICByZXR1cm4gZWxhcHNlZE1pc3Npb25UaW1lO1xuICAgIH0sXG5cbiAgICBkaXNwYXRjaGVySW5kZXg6IEFwcERpc3BhdGNoZXIucmVnaXN0ZXIoZnVuY3Rpb24gKHBheWxvYWQpIHtcbiAgICAgICAgdmFyIHsgYWN0aW9uLCBkYXRhfSA9IHBheWxvYWQ7XG5cbiAgICAgICAgc3dpdGNoIChhY3Rpb24pIHtcblxuICAgICAgICAgICAgY2FzZSBUaW1lckNvbnN0YW50cy5TRVRfVElNRVI6XG4gICAgICAgICAgICAgICAgaGFuZGxlUmVtYWluaW5nVGltZUNoYW5nZWQoZGF0YSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgVGltZXJDb25zdGFudHMuU1RBUlRfVElNRVI6XG4gICAgICAgICAgICAgICAgYXNzZXJ0RXhpc3RzKGRhdGEudGltZXJJZCk7XG5cbiAgICAgICAgICAgICAgICAvLyBhdm9pZCBzZXR0aW5nIHVwIG1vcmUgdGhhbiBvbmUgdGltZXJcbiAgICAgICAgICAgICAgICBpZighVGltZXJTdG9yZS5pc1J1bm5pbmcoZGF0YS50aW1lcklkKSl7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0KGRhdGEudGltZXJJZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIFRpbWVyQ29uc3RhbnRzLlNUT1BfVElNRVI6XG4gICAgICAgICAgICAgICAgc3RvcChkYXRhLnRpbWVySWQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIFRpbWVyQ29uc3RhbnRzLlJFU0VUX1RJTUVSOlxuICAgICAgICAgICAgICAgIHJlc2V0KGRhdGEudGltZXJJZCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgTWlzc2lvbkNvbnN0YW50cy5NSVNTSU9OX1NUQVJURURfRVZFTlQ6XG4gICAgICAgICAgICAgICAgc3RhcnRNaXNzaW9uVGltZXIoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSBNaXNzaW9uQ29uc3RhbnRzLk1JU1NJT05fU1RPUFBFRF9FVkVOVDpcbiAgICAgICAgICAgICAgICBzdG9wTWlzc2lvblRpbWVyKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgTWlzc2lvbkNvbnN0YW50cy5SRUNFSVZFRF9BUFBfU1RBVEU6XG4gICAgICAgICAgICAgICAgdmFyIGFwcFN0YXRlID0gcGF5bG9hZC5hcHBTdGF0ZTtcblxuICAgICAgICAgICAgICAgIGVsYXBzZWRNaXNzaW9uVGltZSA9IGFwcFN0YXRlLmVsYXBzZWRfbWlzc2lvbl90aW1lO1xuXG4gICAgICAgICAgICAgICAgaWYoYXBwU3RhdGUubWlzc2lvbl9ydW5uaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0TWlzc2lvblRpbWVyKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc3RvcE1pc3Npb25UaW1lcigpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIFRpbWVyU3RvcmUuZW1pdENoYW5nZSgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIE1pc3Npb25Db25zdGFudHMuTUlTU0lPTl9USU1FX1NZTkM6XG4gICAgICAgICAgICAgICAgZWxhcHNlZE1pc3Npb25UaW1lICA9IGRhdGEuZWxhcHNlZE1pc3Npb25UaW1lO1xuICAgICAgICAgICAgICAgIFRpbWVyU3RvcmUuZW1pdENoYW5nZSgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRydWU7IC8vIE5vIGVycm9ycy4gTmVlZGVkIGJ5IHByb21pc2UgaW4gRGlzcGF0Y2hlci5cbiAgICB9KVxuXG59KTtcblxud2luZG93Ll9fVGltZVN0b3JlID0gVGltZXJTdG9yZTtcbm1vZHVsZS5leHBvcnRzID0gVGltZXJTdG9yZTtcbiIsImNvbnN0IHRlYW1NYXAgPSBPYmplY3QuZnJlZXplKHtcbiAgICAnY29tbWFuZGVyJzogJ29wZXJhc2pvbnNsZWRlcicsXG4gICAgJ3NjaWVuY2UnOiAnZm9yc2tuaW5nc3RlYW0nLFxuICAgICdjb21tdW5pY2F0aW9uJzogJ2tvbW11bmlrYXNqb25zdGVhbScsXG4gICAgJ3NlY3VyaXR5JzogJ3Npa2tlcmhldHN0ZWFtJyxcbiAgICAnYXN0cm9uYXV0JzogJ2FzdHJvbmF1dHRlYW0nXG59KTtcblxuZnVuY3Rpb24gb3RoZXJUZWFtTmFtZXMoY3VycmVudFRlYW1JZCkge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyh0ZWFtTWFwKVxuICAgICAgICAuZmlsdGVyKChuKSA9PiBuICE9PSBjdXJyZW50VGVhbUlkICYmIG4gIT09ICdsZWFkZXInKVxuICAgICAgICAubWFwKChuKSA9PiB0ZWFtTWFwW25dKVxuICAgICAgICAuam9pbignLCAnKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBuYW1lTWFwOiB0ZWFtTWFwLFxuICAgIG90aGVyVGVhbU5hbWVzXG59O1xuIiwiZnVuY3Rpb24gY2xlYW5Sb290UGF0aChwYXRoKSB7XG4gICAgLy8gY29udmVydCAnL3NjaWVuY2Uvc3RlcDEnID0+ICdzY2llbmNlJ1xuICAgIHJldHVybiBwYXRoLnJlcGxhY2UoL1xcLz8oXFx3KykuKi8sIFwiJDFcIik7XG59XG5cbmZ1bmN0aW9uIHJhbmRvbUludChtaW4sIG1heCkge1xuICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4ICsgMSAtIG1pbikpICsgbWluO1xufVxuXG4vKipcbiAqIFN0YW5kYXJkaXplIG51bWJlciBwYXJzaW5nLlxuICogQHBhcmFtIHtzdHJpbmd9IHN0ciBpcyBhIG5vbi1lbXB0eSBzdHJpbmdcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IC0gcG9zc2libHkgTmFOXG4gKlxuICogVGhlIHN0YW5kYXJkaXphdGlvbiBzdGVwIG9mIGNvbnZlcnRpbmcgJzEsMjMnIC0+ICcxLjIzJyBpcyBzdHJpY3RseSBub3QgbmVlZGVkIHdoZW4gaGFuZGxpbmcgaW5wdXRzIGZyb21cbiAqIGlucHV0IGZpZWxkcyB0aGF0IGhhdmUgdHlwZT0nbnVtYmVyJywgd2hlcmUgdGhpcyBoYXBwZW5zIGF1dG9tYXRpY2FsbHkuXG4gKiBUaGUgcmVzdCBvZiB0aGUgZXJyb3IgaGFuZGxpbmcgaXMgdXNlZnVsLCBub25lIHRoZSBsZXNzLlxuICovXG5mdW5jdGlvbiBwYXJzZU51bWJlcihzdHIpIHtcbiAgICBpZiAoIXR5cGVvZiBzdHIgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRocm93IFR5cGVFcnJvcignVGhpcyBmdW5jdGlvbiBleHBlY3RzIHN0cmluZ3MuIEdvdCBzb21ldGhpbmcgZWxzZTogJyArIHN0cik7XG4gICAgfVxuXG4gICAgLy8gc3RhbmRhcmRpemUgdGhlIG51bWJlciBmb3JtYXQgLSByZW1vdmluZyBOb3J3ZWdpYW4gY3VycmVuY3kgZm9ybWF0XG4gICAgbGV0IGNsZWFuZWRTdHJpbmcgPSBzdHIudHJpbSgpLnJlcGxhY2UoJywnLCAnLicpO1xuXG4gICAgaWYgKCFjbGVhbmVkU3RyaW5nLmxlbmd0aCkge1xuICAgICAgICB0aHJvdyBUeXBlRXJyb3IoJ0dvdCBhIGJsYW5rIHN0cmluZycpO1xuICAgIH1cblxuICAgIGlmIChjbGVhbmVkU3RyaW5nLmluZGV4T2YoJy4nKSAhPT0gLTEpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoY2xlYW5lZFN0cmluZywgMTApO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBwYXJzZUludChjbGVhbmVkU3RyaW5nLCAxMCk7XG4gICAgfVxufVxuXG4vLyBnZW5lcmF0ZXMgYSBVVUlEXG4vLyB3b3JsZHMgc21hbGxlc3QgdXVpZCBsaWIuIGNyYXp5IHNoaXQgOilcbi8vIEBzZWUgaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vamVkLzk4Mjg4M1xuZnVuY3Rpb24gYihhKSB7XG4gICAgcmV0dXJuIGEgPyAoYSBeIE1hdGgucmFuZG9tKCkgKiAxNiA+PiBhIC8gNCkudG9TdHJpbmcoMTYpIDogKFsxZTddICsgLTFlMyArIC00ZTMgKyAtOGUzICsgLTFlMTEpLnJlcGxhY2UoL1swMThdL2csIGIpXG59XG5cbmZ1bmN0aW9uIGxhenlSZXF1aXJlKHBhdGgpIHtcbiAgICBsZXQgdG1wID0gbnVsbDtcbiAgICByZXR1cm4gKCk9PiB7XG4gICAgICAgIGlmICghdG1wKSB0bXAgPSByZXF1aXJlKHBhdGgpO1xuICAgICAgICByZXR1cm4gdG1wO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgY2xlYW5Sb290UGF0aCwgcmFuZG9tSW50LCBwYXJzZU51bWJlciwgdXVpZDogYiwgbGF6eVJlcXVpcmVcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2Fzc2lnblwiKSwgX19lc01vZHVsZTogdHJ1ZSB9OyIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZnJlZXplXCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07IiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9rZXlzXCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gZnVuY3Rpb24gKGluc3RhbmNlLCBDb25zdHJ1Y3Rvcikge1xuICBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7XG4gIH1cbn07XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gKGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTtcbiAgICAgIGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTtcbiAgICAgIGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTtcbiAgICAgIGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHtcbiAgICBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpO1xuICAgIGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpO1xuICAgIHJldHVybiBDb25zdHJ1Y3RvcjtcbiAgfTtcbn0pKCk7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfT2JqZWN0JGFzc2lnbiA9IHJlcXVpcmUoXCJiYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2Fzc2lnblwiKVtcImRlZmF1bHRcIl07XG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gX09iamVjdCRhc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkge1xuICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07XG5cbiAgICBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7XG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkge1xuICAgICAgICB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0YXJnZXQ7XG59O1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlOyIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IGZ1bmN0aW9uIChzdWJDbGFzcywgc3VwZXJDbGFzcykge1xuICBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7XG4gIH1cblxuICBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHtcbiAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgdmFsdWU6IHN1YkNsYXNzLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH1cbiAgfSk7XG4gIGlmIChzdXBlckNsYXNzKSBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzO1xufTtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTsiLCJyZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNi5vYmplY3QuYXNzaWduJyk7XHJcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy8kJykuY29yZS5PYmplY3QuYXNzaWduOyIsInJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM2Lm9iamVjdC5zdGF0aWNzLWFjY2VwdC1wcmltaXRpdmVzJyk7XHJcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy8kJykuY29yZS5PYmplY3QuZnJlZXplOyIsInJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM2Lm9iamVjdC5zdGF0aWNzLWFjY2VwdC1wcmltaXRpdmVzJyk7XHJcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy8kJykuY29yZS5PYmplY3Qua2V5czsiLCJ2YXIgJCA9IHJlcXVpcmUoJy4vJCcpO1xyXG4vLyAxOS4xLjIuMSBPYmplY3QuYXNzaWduKHRhcmdldCwgc291cmNlLCAuLi4pXHJcbi8qZXNsaW50LWRpc2FibGUgbm8tdW51c2VkLXZhcnMgKi9cclxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uIGFzc2lnbih0YXJnZXQsIHNvdXJjZSl7XHJcbi8qZXNsaW50LWVuYWJsZSBuby11bnVzZWQtdmFycyAqL1xyXG4gIHZhciBUID0gT2JqZWN0KCQuYXNzZXJ0RGVmaW5lZCh0YXJnZXQpKVxyXG4gICAgLCBsID0gYXJndW1lbnRzLmxlbmd0aFxyXG4gICAgLCBpID0gMTtcclxuICB3aGlsZShsID4gaSl7XHJcbiAgICB2YXIgUyAgICAgID0gJC5FUzVPYmplY3QoYXJndW1lbnRzW2krK10pXHJcbiAgICAgICwga2V5cyAgID0gJC5nZXRLZXlzKFMpXHJcbiAgICAgICwgbGVuZ3RoID0ga2V5cy5sZW5ndGhcclxuICAgICAgLCBqICAgICAgPSAwXHJcbiAgICAgICwga2V5O1xyXG4gICAgd2hpbGUobGVuZ3RoID4gailUW2tleSA9IGtleXNbaisrXV0gPSBTW2tleV07XHJcbiAgfVxyXG4gIHJldHVybiBUO1xyXG59OyIsInZhciAkICAgICAgICAgID0gcmVxdWlyZSgnLi8kJylcclxuICAsIGdsb2JhbCAgICAgPSAkLmdcclxuICAsIGNvcmUgICAgICAgPSAkLmNvcmVcclxuICAsIGlzRnVuY3Rpb24gPSAkLmlzRnVuY3Rpb247XHJcbmZ1bmN0aW9uIGN0eChmbiwgdGhhdCl7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uKCl7XHJcbiAgICByZXR1cm4gZm4uYXBwbHkodGhhdCwgYXJndW1lbnRzKTtcclxuICB9O1xyXG59XHJcbi8vIHR5cGUgYml0bWFwXHJcbiRkZWYuRiA9IDE7ICAvLyBmb3JjZWRcclxuJGRlZi5HID0gMjsgIC8vIGdsb2JhbFxyXG4kZGVmLlMgPSA0OyAgLy8gc3RhdGljXHJcbiRkZWYuUCA9IDg7ICAvLyBwcm90b1xyXG4kZGVmLkIgPSAxNjsgLy8gYmluZFxyXG4kZGVmLlcgPSAzMjsgLy8gd3JhcFxyXG5mdW5jdGlvbiAkZGVmKHR5cGUsIG5hbWUsIHNvdXJjZSl7XHJcbiAgdmFyIGtleSwgb3duLCBvdXQsIGV4cFxyXG4gICAgLCBpc0dsb2JhbCA9IHR5cGUgJiAkZGVmLkdcclxuICAgICwgdGFyZ2V0ICAgPSBpc0dsb2JhbCA/IGdsb2JhbCA6IHR5cGUgJiAkZGVmLlNcclxuICAgICAgICA/IGdsb2JhbFtuYW1lXSA6IChnbG9iYWxbbmFtZV0gfHwge30pLnByb3RvdHlwZVxyXG4gICAgLCBleHBvcnRzICA9IGlzR2xvYmFsID8gY29yZSA6IGNvcmVbbmFtZV0gfHwgKGNvcmVbbmFtZV0gPSB7fSk7XHJcbiAgaWYoaXNHbG9iYWwpc291cmNlID0gbmFtZTtcclxuICBmb3Ioa2V5IGluIHNvdXJjZSl7XHJcbiAgICAvLyBjb250YWlucyBpbiBuYXRpdmVcclxuICAgIG93biA9ICEodHlwZSAmICRkZWYuRikgJiYgdGFyZ2V0ICYmIGtleSBpbiB0YXJnZXQ7XHJcbiAgICBpZihvd24gJiYga2V5IGluIGV4cG9ydHMpY29udGludWU7XHJcbiAgICAvLyBleHBvcnQgbmF0aXZlIG9yIHBhc3NlZFxyXG4gICAgb3V0ID0gb3duID8gdGFyZ2V0W2tleV0gOiBzb3VyY2Vba2V5XTtcclxuICAgIC8vIHByZXZlbnQgZ2xvYmFsIHBvbGx1dGlvbiBmb3IgbmFtZXNwYWNlc1xyXG4gICAgaWYoaXNHbG9iYWwgJiYgIWlzRnVuY3Rpb24odGFyZ2V0W2tleV0pKWV4cCA9IHNvdXJjZVtrZXldO1xyXG4gICAgLy8gYmluZCB0aW1lcnMgdG8gZ2xvYmFsIGZvciBjYWxsIGZyb20gZXhwb3J0IGNvbnRleHRcclxuICAgIGVsc2UgaWYodHlwZSAmICRkZWYuQiAmJiBvd24pZXhwID0gY3R4KG91dCwgZ2xvYmFsKTtcclxuICAgIC8vIHdyYXAgZ2xvYmFsIGNvbnN0cnVjdG9ycyBmb3IgcHJldmVudCBjaGFuZ2UgdGhlbSBpbiBsaWJyYXJ5XHJcbiAgICBlbHNlIGlmKHR5cGUgJiAkZGVmLlcgJiYgdGFyZ2V0W2tleV0gPT0gb3V0KSFmdW5jdGlvbihDKXtcclxuICAgICAgZXhwID0gZnVuY3Rpb24ocGFyYW0pe1xyXG4gICAgICAgIHJldHVybiB0aGlzIGluc3RhbmNlb2YgQyA/IG5ldyBDKHBhcmFtKSA6IEMocGFyYW0pO1xyXG4gICAgICB9O1xyXG4gICAgICBleHAucHJvdG90eXBlID0gQy5wcm90b3R5cGU7XHJcbiAgICB9KG91dCk7XHJcbiAgICBlbHNlIGV4cCA9IHR5cGUgJiAkZGVmLlAgJiYgaXNGdW5jdGlvbihvdXQpID8gY3R4KEZ1bmN0aW9uLmNhbGwsIG91dCkgOiBvdXQ7XHJcbiAgICAvLyBleHBvcnRcclxuICAgICQuaGlkZShleHBvcnRzLCBrZXksIGV4cCk7XHJcbiAgfVxyXG59XHJcbm1vZHVsZS5leHBvcnRzID0gJGRlZjsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCQpe1xyXG4gICQuRlcgICA9IGZhbHNlO1xyXG4gICQucGF0aCA9ICQuY29yZTtcclxuICByZXR1cm4gJDtcclxufTsiLCIndXNlIHN0cmljdCc7XHJcbnZhciBnbG9iYWwgPSB0eXBlb2Ygc2VsZiAhPSAndW5kZWZpbmVkJyA/IHNlbGYgOiBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpXHJcbiAgLCBjb3JlICAgPSB7fVxyXG4gICwgZGVmaW5lUHJvcGVydHkgPSBPYmplY3QuZGVmaW5lUHJvcGVydHlcclxuICAsIGhhc093blByb3BlcnR5ID0ge30uaGFzT3duUHJvcGVydHlcclxuICAsIGNlaWwgID0gTWF0aC5jZWlsXHJcbiAgLCBmbG9vciA9IE1hdGguZmxvb3JcclxuICAsIG1heCAgID0gTWF0aC5tYXhcclxuICAsIG1pbiAgID0gTWF0aC5taW47XHJcbi8vIFRoZSBlbmdpbmUgd29ya3MgZmluZSB3aXRoIGRlc2NyaXB0b3JzPyBUaGFuaydzIElFOCBmb3IgaGlzIGZ1bm55IGRlZmluZVByb3BlcnR5LlxyXG52YXIgREVTQyA9ICEhZnVuY3Rpb24oKXtcclxuICB0cnkge1xyXG4gICAgcmV0dXJuIGRlZmluZVByb3BlcnR5KHt9LCAnYScsIHtnZXQ6IGZ1bmN0aW9uKCl7IHJldHVybiAyOyB9fSkuYSA9PSAyO1xyXG4gIH0gY2F0Y2goZSl7IC8qIGVtcHR5ICovIH1cclxufSgpO1xyXG52YXIgaGlkZSA9IGNyZWF0ZURlZmluZXIoMSk7XHJcbi8vIDcuMS40IFRvSW50ZWdlclxyXG5mdW5jdGlvbiB0b0ludGVnZXIoaXQpe1xyXG4gIHJldHVybiBpc05hTihpdCA9ICtpdCkgPyAwIDogKGl0ID4gMCA/IGZsb29yIDogY2VpbCkoaXQpO1xyXG59XHJcbmZ1bmN0aW9uIGRlc2MoYml0bWFwLCB2YWx1ZSl7XHJcbiAgcmV0dXJuIHtcclxuICAgIGVudW1lcmFibGUgIDogIShiaXRtYXAgJiAxKSxcclxuICAgIGNvbmZpZ3VyYWJsZTogIShiaXRtYXAgJiAyKSxcclxuICAgIHdyaXRhYmxlICAgIDogIShiaXRtYXAgJiA0KSxcclxuICAgIHZhbHVlICAgICAgIDogdmFsdWVcclxuICB9O1xyXG59XHJcbmZ1bmN0aW9uIHNpbXBsZVNldChvYmplY3QsIGtleSwgdmFsdWUpe1xyXG4gIG9iamVjdFtrZXldID0gdmFsdWU7XHJcbiAgcmV0dXJuIG9iamVjdDtcclxufVxyXG5mdW5jdGlvbiBjcmVhdGVEZWZpbmVyKGJpdG1hcCl7XHJcbiAgcmV0dXJuIERFU0MgPyBmdW5jdGlvbihvYmplY3QsIGtleSwgdmFsdWUpe1xyXG4gICAgcmV0dXJuICQuc2V0RGVzYyhvYmplY3QsIGtleSwgZGVzYyhiaXRtYXAsIHZhbHVlKSk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdXNlLWJlZm9yZS1kZWZpbmVcclxuICB9IDogc2ltcGxlU2V0O1xyXG59XHJcblxyXG5mdW5jdGlvbiBpc09iamVjdChpdCl7XHJcbiAgcmV0dXJuIGl0ICE9PSBudWxsICYmICh0eXBlb2YgaXQgPT0gJ29iamVjdCcgfHwgdHlwZW9mIGl0ID09ICdmdW5jdGlvbicpO1xyXG59XHJcbmZ1bmN0aW9uIGlzRnVuY3Rpb24oaXQpe1xyXG4gIHJldHVybiB0eXBlb2YgaXQgPT0gJ2Z1bmN0aW9uJztcclxufVxyXG5mdW5jdGlvbiBhc3NlcnREZWZpbmVkKGl0KXtcclxuICBpZihpdCA9PSB1bmRlZmluZWQpdGhyb3cgVHlwZUVycm9yKFwiQ2FuJ3QgY2FsbCBtZXRob2Qgb24gIFwiICsgaXQpO1xyXG4gIHJldHVybiBpdDtcclxufVxyXG5cclxudmFyICQgPSBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vJC5mdycpKHtcclxuICBnOiBnbG9iYWwsXHJcbiAgY29yZTogY29yZSxcclxuICBodG1sOiBnbG9iYWwuZG9jdW1lbnQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LFxyXG4gIC8vIGh0dHA6Ly9qc3BlcmYuY29tL2NvcmUtanMtaXNvYmplY3RcclxuICBpc09iamVjdDogICBpc09iamVjdCxcclxuICBpc0Z1bmN0aW9uOiBpc0Z1bmN0aW9uLFxyXG4gIGl0OiBmdW5jdGlvbihpdCl7XHJcbiAgICByZXR1cm4gaXQ7XHJcbiAgfSxcclxuICB0aGF0OiBmdW5jdGlvbigpe1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfSxcclxuICAvLyA3LjEuNCBUb0ludGVnZXJcclxuICB0b0ludGVnZXI6IHRvSW50ZWdlcixcclxuICAvLyA3LjEuMTUgVG9MZW5ndGhcclxuICB0b0xlbmd0aDogZnVuY3Rpb24oaXQpe1xyXG4gICAgcmV0dXJuIGl0ID4gMCA/IG1pbih0b0ludGVnZXIoaXQpLCAweDFmZmZmZmZmZmZmZmZmKSA6IDA7IC8vIHBvdygyLCA1MykgLSAxID09IDkwMDcxOTkyNTQ3NDA5OTFcclxuICB9LFxyXG4gIHRvSW5kZXg6IGZ1bmN0aW9uKGluZGV4LCBsZW5ndGgpe1xyXG4gICAgaW5kZXggPSB0b0ludGVnZXIoaW5kZXgpO1xyXG4gICAgcmV0dXJuIGluZGV4IDwgMCA/IG1heChpbmRleCArIGxlbmd0aCwgMCkgOiBtaW4oaW5kZXgsIGxlbmd0aCk7XHJcbiAgfSxcclxuICBoYXM6IGZ1bmN0aW9uKGl0LCBrZXkpe1xyXG4gICAgcmV0dXJuIGhhc093blByb3BlcnR5LmNhbGwoaXQsIGtleSk7XHJcbiAgfSxcclxuICBjcmVhdGU6ICAgICBPYmplY3QuY3JlYXRlLFxyXG4gIGdldFByb3RvOiAgIE9iamVjdC5nZXRQcm90b3R5cGVPZixcclxuICBERVNDOiAgICAgICBERVNDLFxyXG4gIGRlc2M6ICAgICAgIGRlc2MsXHJcbiAgZ2V0RGVzYzogICAgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcixcclxuICBzZXREZXNjOiAgICBkZWZpbmVQcm9wZXJ0eSxcclxuICBnZXRLZXlzOiAgICBPYmplY3Qua2V5cyxcclxuICBnZXROYW1lczogICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyxcclxuICBnZXRTeW1ib2xzOiBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzLFxyXG4gIC8vIER1bW15LCBmaXggZm9yIG5vdCBhcnJheS1saWtlIEVTMyBzdHJpbmcgaW4gZXM1IG1vZHVsZVxyXG4gIGFzc2VydERlZmluZWQ6IGFzc2VydERlZmluZWQsXHJcbiAgRVM1T2JqZWN0OiBPYmplY3QsXHJcbiAgdG9PYmplY3Q6IGZ1bmN0aW9uKGl0KXtcclxuICAgIHJldHVybiAkLkVTNU9iamVjdChhc3NlcnREZWZpbmVkKGl0KSk7XHJcbiAgfSxcclxuICBoaWRlOiBoaWRlLFxyXG4gIGRlZjogY3JlYXRlRGVmaW5lcigwKSxcclxuICBzZXQ6IGdsb2JhbC5TeW1ib2wgPyBzaW1wbGVTZXQgOiBoaWRlLFxyXG4gIG1peDogZnVuY3Rpb24odGFyZ2V0LCBzcmMpe1xyXG4gICAgZm9yKHZhciBrZXkgaW4gc3JjKWhpZGUodGFyZ2V0LCBrZXksIHNyY1trZXldKTtcclxuICAgIHJldHVybiB0YXJnZXQ7XHJcbiAgfSxcclxuICBlYWNoOiBbXS5mb3JFYWNoXHJcbn0pO1xyXG5pZih0eXBlb2YgX19lICE9ICd1bmRlZmluZWQnKV9fZSA9IGNvcmU7XHJcbmlmKHR5cGVvZiBfX2cgIT0gJ3VuZGVmaW5lZCcpX19nID0gZ2xvYmFsOyIsIi8vIDE5LjEuMy4xIE9iamVjdC5hc3NpZ24odGFyZ2V0LCBzb3VyY2UpXHJcbnZhciAkZGVmID0gcmVxdWlyZSgnLi8kLmRlZicpO1xyXG4kZGVmKCRkZWYuUywgJ09iamVjdCcsIHthc3NpZ246IHJlcXVpcmUoJy4vJC5hc3NpZ24nKX0pOyIsInZhciAkICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCAkZGVmICAgICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxyXG4gICwgaXNPYmplY3QgPSAkLmlzT2JqZWN0XHJcbiAgLCB0b09iamVjdCA9ICQudG9PYmplY3Q7XHJcbmZ1bmN0aW9uIHdyYXBPYmplY3RNZXRob2QoTUVUSE9ELCBNT0RFKXtcclxuICB2YXIgZm4gID0gKCQuY29yZS5PYmplY3QgfHwge30pW01FVEhPRF0gfHwgT2JqZWN0W01FVEhPRF1cclxuICAgICwgZiAgID0gMFxyXG4gICAgLCBvICAgPSB7fTtcclxuICBvW01FVEhPRF0gPSBNT0RFID09IDEgPyBmdW5jdGlvbihpdCl7XHJcbiAgICByZXR1cm4gaXNPYmplY3QoaXQpID8gZm4oaXQpIDogaXQ7XHJcbiAgfSA6IE1PREUgPT0gMiA/IGZ1bmN0aW9uKGl0KXtcclxuICAgIHJldHVybiBpc09iamVjdChpdCkgPyBmbihpdCkgOiB0cnVlO1xyXG4gIH0gOiBNT0RFID09IDMgPyBmdW5jdGlvbihpdCl7XHJcbiAgICByZXR1cm4gaXNPYmplY3QoaXQpID8gZm4oaXQpIDogZmFsc2U7XHJcbiAgfSA6IE1PREUgPT0gNCA/IGZ1bmN0aW9uIGdldE93blByb3BlcnR5RGVzY3JpcHRvcihpdCwga2V5KXtcclxuICAgIHJldHVybiBmbih0b09iamVjdChpdCksIGtleSk7XHJcbiAgfSA6IE1PREUgPT0gNSA/IGZ1bmN0aW9uIGdldFByb3RvdHlwZU9mKGl0KXtcclxuICAgIHJldHVybiBmbihPYmplY3QoJC5hc3NlcnREZWZpbmVkKGl0KSkpO1xyXG4gIH0gOiBmdW5jdGlvbihpdCl7XHJcbiAgICByZXR1cm4gZm4odG9PYmplY3QoaXQpKTtcclxuICB9O1xyXG4gIHRyeSB7XHJcbiAgICBmbigneicpO1xyXG4gIH0gY2F0Y2goZSl7XHJcbiAgICBmID0gMTtcclxuICB9XHJcbiAgJGRlZigkZGVmLlMgKyAkZGVmLkYgKiBmLCAnT2JqZWN0Jywgbyk7XHJcbn1cclxud3JhcE9iamVjdE1ldGhvZCgnZnJlZXplJywgMSk7XHJcbndyYXBPYmplY3RNZXRob2QoJ3NlYWwnLCAxKTtcclxud3JhcE9iamVjdE1ldGhvZCgncHJldmVudEV4dGVuc2lvbnMnLCAxKTtcclxud3JhcE9iamVjdE1ldGhvZCgnaXNGcm96ZW4nLCAyKTtcclxud3JhcE9iamVjdE1ldGhvZCgnaXNTZWFsZWQnLCAyKTtcclxud3JhcE9iamVjdE1ldGhvZCgnaXNFeHRlbnNpYmxlJywgMyk7XHJcbndyYXBPYmplY3RNZXRob2QoJ2dldE93blByb3BlcnR5RGVzY3JpcHRvcicsIDQpO1xyXG53cmFwT2JqZWN0TWV0aG9kKCdnZXRQcm90b3R5cGVPZicsIDUpO1xyXG53cmFwT2JqZWN0TWV0aG9kKCdrZXlzJyk7XHJcbndyYXBPYmplY3RNZXRob2QoJ2dldE93blByb3BlcnR5TmFtZXMnKTsiLG51bGwsIi8qIVxuICogVGhlIGJ1ZmZlciBtb2R1bGUgZnJvbSBub2RlLmpzLCBmb3IgdGhlIGJyb3dzZXIuXG4gKlxuICogQGF1dGhvciAgIEZlcm9zcyBBYm91a2hhZGlqZWggPGZlcm9zc0BmZXJvc3Mub3JnPiA8aHR0cDovL2Zlcm9zcy5vcmc+XG4gKiBAbGljZW5zZSAgTUlUXG4gKi9cblxudmFyIGJhc2U2NCA9IHJlcXVpcmUoJ2Jhc2U2NC1qcycpXG52YXIgaWVlZTc1NCA9IHJlcXVpcmUoJ2llZWU3NTQnKVxudmFyIGlzQXJyYXkgPSByZXF1aXJlKCdpcy1hcnJheScpXG5cbmV4cG9ydHMuQnVmZmVyID0gQnVmZmVyXG5leHBvcnRzLlNsb3dCdWZmZXIgPSBTbG93QnVmZmVyXG5leHBvcnRzLklOU1BFQ1RfTUFYX0JZVEVTID0gNTBcbkJ1ZmZlci5wb29sU2l6ZSA9IDgxOTIgLy8gbm90IHVzZWQgYnkgdGhpcyBpbXBsZW1lbnRhdGlvblxuXG52YXIga01heExlbmd0aCA9IDB4M2ZmZmZmZmZcbnZhciByb290UGFyZW50ID0ge31cblxuLyoqXG4gKiBJZiBgQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlRgOlxuICogICA9PT0gdHJ1ZSAgICBVc2UgVWludDhBcnJheSBpbXBsZW1lbnRhdGlvbiAoZmFzdGVzdClcbiAqICAgPT09IGZhbHNlICAgVXNlIE9iamVjdCBpbXBsZW1lbnRhdGlvbiAobW9zdCBjb21wYXRpYmxlLCBldmVuIElFNilcbiAqXG4gKiBCcm93c2VycyB0aGF0IHN1cHBvcnQgdHlwZWQgYXJyYXlzIGFyZSBJRSAxMCssIEZpcmVmb3ggNCssIENocm9tZSA3KywgU2FmYXJpIDUuMSssXG4gKiBPcGVyYSAxMS42KywgaU9TIDQuMisuXG4gKlxuICogTm90ZTpcbiAqXG4gKiAtIEltcGxlbWVudGF0aW9uIG11c3Qgc3VwcG9ydCBhZGRpbmcgbmV3IHByb3BlcnRpZXMgdG8gYFVpbnQ4QXJyYXlgIGluc3RhbmNlcy5cbiAqICAgRmlyZWZveCA0LTI5IGxhY2tlZCBzdXBwb3J0LCBmaXhlZCBpbiBGaXJlZm94IDMwKy5cbiAqICAgU2VlOiBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD02OTU0MzguXG4gKlxuICogIC0gQ2hyb21lIDktMTAgaXMgbWlzc2luZyB0aGUgYFR5cGVkQXJyYXkucHJvdG90eXBlLnN1YmFycmF5YCBmdW5jdGlvbi5cbiAqXG4gKiAgLSBJRTEwIGhhcyBhIGJyb2tlbiBgVHlwZWRBcnJheS5wcm90b3R5cGUuc3ViYXJyYXlgIGZ1bmN0aW9uIHdoaWNoIHJldHVybnMgYXJyYXlzIG9mXG4gKiAgICBpbmNvcnJlY3QgbGVuZ3RoIGluIHNvbWUgc2l0dWF0aW9ucy5cbiAqXG4gKiBXZSBkZXRlY3QgdGhlc2UgYnVnZ3kgYnJvd3NlcnMgYW5kIHNldCBgQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlRgIHRvIGBmYWxzZWAgc28gdGhleSB3aWxsXG4gKiBnZXQgdGhlIE9iamVjdCBpbXBsZW1lbnRhdGlvbiwgd2hpY2ggaXMgc2xvd2VyIGJ1dCB3aWxsIHdvcmsgY29ycmVjdGx5LlxuICovXG5CdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCA9IChmdW5jdGlvbiAoKSB7XG4gIHRyeSB7XG4gICAgdmFyIGJ1ZiA9IG5ldyBBcnJheUJ1ZmZlcigwKVxuICAgIHZhciBhcnIgPSBuZXcgVWludDhBcnJheShidWYpXG4gICAgYXJyLmZvbyA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIDQyIH1cbiAgICByZXR1cm4gYXJyLmZvbygpID09PSA0MiAmJiAvLyB0eXBlZCBhcnJheSBpbnN0YW5jZXMgY2FuIGJlIGF1Z21lbnRlZFxuICAgICAgICB0eXBlb2YgYXJyLnN1YmFycmF5ID09PSAnZnVuY3Rpb24nICYmIC8vIGNocm9tZSA5LTEwIGxhY2sgYHN1YmFycmF5YFxuICAgICAgICBuZXcgVWludDhBcnJheSgxKS5zdWJhcnJheSgxLCAxKS5ieXRlTGVuZ3RoID09PSAwIC8vIGllMTAgaGFzIGJyb2tlbiBgc3ViYXJyYXlgXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufSkoKVxuXG4vKipcbiAqIENsYXNzOiBCdWZmZXJcbiAqID09PT09PT09PT09PT1cbiAqXG4gKiBUaGUgQnVmZmVyIGNvbnN0cnVjdG9yIHJldHVybnMgaW5zdGFuY2VzIG9mIGBVaW50OEFycmF5YCB0aGF0IGFyZSBhdWdtZW50ZWRcbiAqIHdpdGggZnVuY3Rpb24gcHJvcGVydGllcyBmb3IgYWxsIHRoZSBub2RlIGBCdWZmZXJgIEFQSSBmdW5jdGlvbnMuIFdlIHVzZVxuICogYFVpbnQ4QXJyYXlgIHNvIHRoYXQgc3F1YXJlIGJyYWNrZXQgbm90YXRpb24gd29ya3MgYXMgZXhwZWN0ZWQgLS0gaXQgcmV0dXJuc1xuICogYSBzaW5nbGUgb2N0ZXQuXG4gKlxuICogQnkgYXVnbWVudGluZyB0aGUgaW5zdGFuY2VzLCB3ZSBjYW4gYXZvaWQgbW9kaWZ5aW5nIHRoZSBgVWludDhBcnJheWBcbiAqIHByb3RvdHlwZS5cbiAqL1xuZnVuY3Rpb24gQnVmZmVyIChzdWJqZWN0LCBlbmNvZGluZykge1xuICB2YXIgc2VsZiA9IHRoaXNcbiAgaWYgKCEoc2VsZiBpbnN0YW5jZW9mIEJ1ZmZlcikpIHJldHVybiBuZXcgQnVmZmVyKHN1YmplY3QsIGVuY29kaW5nKVxuXG4gIHZhciB0eXBlID0gdHlwZW9mIHN1YmplY3RcbiAgdmFyIGxlbmd0aFxuXG4gIGlmICh0eXBlID09PSAnbnVtYmVyJykge1xuICAgIGxlbmd0aCA9ICtzdWJqZWN0XG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICBsZW5ndGggPSBCdWZmZXIuYnl0ZUxlbmd0aChzdWJqZWN0LCBlbmNvZGluZylcbiAgfSBlbHNlIGlmICh0eXBlID09PSAnb2JqZWN0JyAmJiBzdWJqZWN0ICE9PSBudWxsKSB7XG4gICAgLy8gYXNzdW1lIG9iamVjdCBpcyBhcnJheS1saWtlXG4gICAgaWYgKHN1YmplY3QudHlwZSA9PT0gJ0J1ZmZlcicgJiYgaXNBcnJheShzdWJqZWN0LmRhdGEpKSBzdWJqZWN0ID0gc3ViamVjdC5kYXRhXG4gICAgbGVuZ3RoID0gK3N1YmplY3QubGVuZ3RoXG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignbXVzdCBzdGFydCB3aXRoIG51bWJlciwgYnVmZmVyLCBhcnJheSBvciBzdHJpbmcnKVxuICB9XG5cbiAgaWYgKGxlbmd0aCA+IGtNYXhMZW5ndGgpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignQXR0ZW1wdCB0byBhbGxvY2F0ZSBCdWZmZXIgbGFyZ2VyIHRoYW4gbWF4aW11bSBzaXplOiAweCcgK1xuICAgICAga01heExlbmd0aC50b1N0cmluZygxNikgKyAnIGJ5dGVzJylcbiAgfVxuXG4gIGlmIChsZW5ndGggPCAwKSBsZW5ndGggPSAwXG4gIGVsc2UgbGVuZ3RoID4+Pj0gMCAvLyBjb2VyY2UgdG8gdWludDMyXG5cbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgLy8gUHJlZmVycmVkOiBSZXR1cm4gYW4gYXVnbWVudGVkIGBVaW50OEFycmF5YCBpbnN0YW5jZSBmb3IgYmVzdCBwZXJmb3JtYW5jZVxuICAgIHNlbGYgPSBCdWZmZXIuX2F1Z21lbnQobmV3IFVpbnQ4QXJyYXkobGVuZ3RoKSkgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjb25zaXN0ZW50LXRoaXNcbiAgfSBlbHNlIHtcbiAgICAvLyBGYWxsYmFjazogUmV0dXJuIFRISVMgaW5zdGFuY2Ugb2YgQnVmZmVyIChjcmVhdGVkIGJ5IGBuZXdgKVxuICAgIHNlbGYubGVuZ3RoID0gbGVuZ3RoXG4gICAgc2VsZi5faXNCdWZmZXIgPSB0cnVlXG4gIH1cblxuICB2YXIgaVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQgJiYgdHlwZW9mIHN1YmplY3QuYnl0ZUxlbmd0aCA9PT0gJ251bWJlcicpIHtcbiAgICAvLyBTcGVlZCBvcHRpbWl6YXRpb24gLS0gdXNlIHNldCBpZiB3ZSdyZSBjb3B5aW5nIGZyb20gYSB0eXBlZCBhcnJheVxuICAgIHNlbGYuX3NldChzdWJqZWN0KVxuICB9IGVsc2UgaWYgKGlzQXJyYXlpc2goc3ViamVjdCkpIHtcbiAgICAvLyBUcmVhdCBhcnJheS1pc2ggb2JqZWN0cyBhcyBhIGJ5dGUgYXJyYXlcbiAgICBpZiAoQnVmZmVyLmlzQnVmZmVyKHN1YmplY3QpKSB7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgc2VsZltpXSA9IHN1YmplY3QucmVhZFVJbnQ4KGkpXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBzZWxmW2ldID0gKChzdWJqZWN0W2ldICUgMjU2KSArIDI1NikgJSAyNTZcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICBzZWxmLndyaXRlKHN1YmplY3QsIDAsIGVuY29kaW5nKVxuICB9IGVsc2UgaWYgKHR5cGUgPT09ICdudW1iZXInICYmICFCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgc2VsZltpXSA9IDBcbiAgICB9XG4gIH1cblxuICBpZiAobGVuZ3RoID4gMCAmJiBsZW5ndGggPD0gQnVmZmVyLnBvb2xTaXplKSBzZWxmLnBhcmVudCA9IHJvb3RQYXJlbnRcblxuICByZXR1cm4gc2VsZlxufVxuXG5mdW5jdGlvbiBTbG93QnVmZmVyIChzdWJqZWN0LCBlbmNvZGluZykge1xuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgU2xvd0J1ZmZlcikpIHJldHVybiBuZXcgU2xvd0J1ZmZlcihzdWJqZWN0LCBlbmNvZGluZylcblxuICB2YXIgYnVmID0gbmV3IEJ1ZmZlcihzdWJqZWN0LCBlbmNvZGluZylcbiAgZGVsZXRlIGJ1Zi5wYXJlbnRcbiAgcmV0dXJuIGJ1ZlxufVxuXG5CdWZmZXIuaXNCdWZmZXIgPSBmdW5jdGlvbiBpc0J1ZmZlciAoYikge1xuICByZXR1cm4gISEoYiAhPSBudWxsICYmIGIuX2lzQnVmZmVyKVxufVxuXG5CdWZmZXIuY29tcGFyZSA9IGZ1bmN0aW9uIGNvbXBhcmUgKGEsIGIpIHtcbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoYSkgfHwgIUJ1ZmZlci5pc0J1ZmZlcihiKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FyZ3VtZW50cyBtdXN0IGJlIEJ1ZmZlcnMnKVxuICB9XG5cbiAgaWYgKGEgPT09IGIpIHJldHVybiAwXG5cbiAgdmFyIHggPSBhLmxlbmd0aFxuICB2YXIgeSA9IGIubGVuZ3RoXG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBNYXRoLm1pbih4LCB5KTsgaSA8IGxlbiAmJiBhW2ldID09PSBiW2ldOyBpKyspIHt9XG4gIGlmIChpICE9PSBsZW4pIHtcbiAgICB4ID0gYVtpXVxuICAgIHkgPSBiW2ldXG4gIH1cbiAgaWYgKHggPCB5KSByZXR1cm4gLTFcbiAgaWYgKHkgPCB4KSByZXR1cm4gMVxuICByZXR1cm4gMFxufVxuXG5CdWZmZXIuaXNFbmNvZGluZyA9IGZ1bmN0aW9uIGlzRW5jb2RpbmcgKGVuY29kaW5nKSB7XG4gIHN3aXRjaCAoU3RyaW5nKGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgY2FzZSAnYXNjaWknOlxuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICBjYXNlICdyYXcnOlxuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5CdWZmZXIuY29uY2F0ID0gZnVuY3Rpb24gY29uY2F0IChsaXN0LCB0b3RhbExlbmd0aCkge1xuICBpZiAoIWlzQXJyYXkobGlzdCkpIHRocm93IG5ldyBUeXBlRXJyb3IoJ2xpc3QgYXJndW1lbnQgbXVzdCBiZSBhbiBBcnJheSBvZiBCdWZmZXJzLicpXG5cbiAgaWYgKGxpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIG5ldyBCdWZmZXIoMClcbiAgfSBlbHNlIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSkge1xuICAgIHJldHVybiBsaXN0WzBdXG4gIH1cblxuICB2YXIgaVxuICBpZiAodG90YWxMZW5ndGggPT09IHVuZGVmaW5lZCkge1xuICAgIHRvdGFsTGVuZ3RoID0gMFxuICAgIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICB0b3RhbExlbmd0aCArPSBsaXN0W2ldLmxlbmd0aFxuICAgIH1cbiAgfVxuXG4gIHZhciBidWYgPSBuZXcgQnVmZmVyKHRvdGFsTGVuZ3RoKVxuICB2YXIgcG9zID0gMFxuICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpdGVtID0gbGlzdFtpXVxuICAgIGl0ZW0uY29weShidWYsIHBvcylcbiAgICBwb3MgKz0gaXRlbS5sZW5ndGhcbiAgfVxuICByZXR1cm4gYnVmXG59XG5cbkJ1ZmZlci5ieXRlTGVuZ3RoID0gZnVuY3Rpb24gYnl0ZUxlbmd0aCAoc3RyLCBlbmNvZGluZykge1xuICB2YXIgcmV0XG4gIHN0ciA9IHN0ciArICcnXG4gIHN3aXRjaCAoZW5jb2RpbmcgfHwgJ3V0ZjgnKSB7XG4gICAgY2FzZSAnYXNjaWknOlxuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgY2FzZSAncmF3JzpcbiAgICAgIHJldCA9IHN0ci5sZW5ndGhcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldCA9IHN0ci5sZW5ndGggKiAyXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2hleCc6XG4gICAgICByZXQgPSBzdHIubGVuZ3RoID4+PiAxXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgIHJldCA9IHV0ZjhUb0J5dGVzKHN0cikubGVuZ3RoXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICByZXQgPSBiYXNlNjRUb0J5dGVzKHN0cikubGVuZ3RoXG4gICAgICBicmVha1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXQgPSBzdHIubGVuZ3RoXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG4vLyBwcmUtc2V0IGZvciB2YWx1ZXMgdGhhdCBtYXkgZXhpc3QgaW4gdGhlIGZ1dHVyZVxuQnVmZmVyLnByb3RvdHlwZS5sZW5ndGggPSB1bmRlZmluZWRcbkJ1ZmZlci5wcm90b3R5cGUucGFyZW50ID0gdW5kZWZpbmVkXG5cbi8vIHRvU3RyaW5nKGVuY29kaW5nLCBzdGFydD0wLCBlbmQ9YnVmZmVyLmxlbmd0aClcbkJ1ZmZlci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZyAoZW5jb2RpbmcsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxvd2VyZWRDYXNlID0gZmFsc2VcblxuICBzdGFydCA9IHN0YXJ0ID4+PiAwXG4gIGVuZCA9IGVuZCA9PT0gdW5kZWZpbmVkIHx8IGVuZCA9PT0gSW5maW5pdHkgPyB0aGlzLmxlbmd0aCA6IGVuZCA+Pj4gMFxuXG4gIGlmICghZW5jb2RpbmcpIGVuY29kaW5nID0gJ3V0ZjgnXG4gIGlmIChzdGFydCA8IDApIHN0YXJ0ID0gMFxuICBpZiAoZW5kID4gdGhpcy5sZW5ndGgpIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmIChlbmQgPD0gc3RhcnQpIHJldHVybiAnJ1xuXG4gIHdoaWxlICh0cnVlKSB7XG4gICAgc3dpdGNoIChlbmNvZGluZykge1xuICAgICAgY2FzZSAnaGV4JzpcbiAgICAgICAgcmV0dXJuIGhleFNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ3V0ZjgnOlxuICAgICAgY2FzZSAndXRmLTgnOlxuICAgICAgICByZXR1cm4gdXRmOFNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgICAgcmV0dXJuIGFzY2lpU2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgICAgcmV0dXJuIGJpbmFyeVNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICAgIHJldHVybiBiYXNlNjRTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICd1Y3MyJzpcbiAgICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgICByZXR1cm4gdXRmMTZsZVNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGlmIChsb3dlcmVkQ2FzZSkgdGhyb3cgbmV3IFR5cGVFcnJvcignVW5rbm93biBlbmNvZGluZzogJyArIGVuY29kaW5nKVxuICAgICAgICBlbmNvZGluZyA9IChlbmNvZGluZyArICcnKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIGxvd2VyZWRDYXNlID0gdHJ1ZVxuICAgIH1cbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uIGVxdWFscyAoYikge1xuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihiKSkgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnQgbXVzdCBiZSBhIEJ1ZmZlcicpXG4gIGlmICh0aGlzID09PSBiKSByZXR1cm4gdHJ1ZVxuICByZXR1cm4gQnVmZmVyLmNvbXBhcmUodGhpcywgYikgPT09IDBcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5pbnNwZWN0ID0gZnVuY3Rpb24gaW5zcGVjdCAoKSB7XG4gIHZhciBzdHIgPSAnJ1xuICB2YXIgbWF4ID0gZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFU1xuICBpZiAodGhpcy5sZW5ndGggPiAwKSB7XG4gICAgc3RyID0gdGhpcy50b1N0cmluZygnaGV4JywgMCwgbWF4KS5tYXRjaCgvLnsyfS9nKS5qb2luKCcgJylcbiAgICBpZiAodGhpcy5sZW5ndGggPiBtYXgpIHN0ciArPSAnIC4uLiAnXG4gIH1cbiAgcmV0dXJuICc8QnVmZmVyICcgKyBzdHIgKyAnPidcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5jb21wYXJlID0gZnVuY3Rpb24gY29tcGFyZSAoYikge1xuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihiKSkgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnQgbXVzdCBiZSBhIEJ1ZmZlcicpXG4gIGlmICh0aGlzID09PSBiKSByZXR1cm4gMFxuICByZXR1cm4gQnVmZmVyLmNvbXBhcmUodGhpcywgYilcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5pbmRleE9mID0gZnVuY3Rpb24gaW5kZXhPZiAodmFsLCBieXRlT2Zmc2V0KSB7XG4gIGlmIChieXRlT2Zmc2V0ID4gMHg3ZmZmZmZmZikgYnl0ZU9mZnNldCA9IDB4N2ZmZmZmZmZcbiAgZWxzZSBpZiAoYnl0ZU9mZnNldCA8IC0weDgwMDAwMDAwKSBieXRlT2Zmc2V0ID0gLTB4ODAwMDAwMDBcbiAgYnl0ZU9mZnNldCA+Pj0gMFxuXG4gIGlmICh0aGlzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIC0xXG4gIGlmIChieXRlT2Zmc2V0ID49IHRoaXMubGVuZ3RoKSByZXR1cm4gLTFcblxuICAvLyBOZWdhdGl2ZSBvZmZzZXRzIHN0YXJ0IGZyb20gdGhlIGVuZCBvZiB0aGUgYnVmZmVyXG4gIGlmIChieXRlT2Zmc2V0IDwgMCkgYnl0ZU9mZnNldCA9IE1hdGgubWF4KHRoaXMubGVuZ3RoICsgYnl0ZU9mZnNldCwgMClcblxuICBpZiAodHlwZW9mIHZhbCA9PT0gJ3N0cmluZycpIHtcbiAgICBpZiAodmFsLmxlbmd0aCA9PT0gMCkgcmV0dXJuIC0xIC8vIHNwZWNpYWwgY2FzZTogbG9va2luZyBmb3IgZW1wdHkgc3RyaW5nIGFsd2F5cyBmYWlsc1xuICAgIHJldHVybiBTdHJpbmcucHJvdG90eXBlLmluZGV4T2YuY2FsbCh0aGlzLCB2YWwsIGJ5dGVPZmZzZXQpXG4gIH1cbiAgaWYgKEJ1ZmZlci5pc0J1ZmZlcih2YWwpKSB7XG4gICAgcmV0dXJuIGFycmF5SW5kZXhPZih0aGlzLCB2YWwsIGJ5dGVPZmZzZXQpXG4gIH1cbiAgaWYgKHR5cGVvZiB2YWwgPT09ICdudW1iZXInKSB7XG4gICAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUICYmIFVpbnQ4QXJyYXkucHJvdG90eXBlLmluZGV4T2YgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiBVaW50OEFycmF5LnByb3RvdHlwZS5pbmRleE9mLmNhbGwodGhpcywgdmFsLCBieXRlT2Zmc2V0KVxuICAgIH1cbiAgICByZXR1cm4gYXJyYXlJbmRleE9mKHRoaXMsIFsgdmFsIF0sIGJ5dGVPZmZzZXQpXG4gIH1cblxuICBmdW5jdGlvbiBhcnJheUluZGV4T2YgKGFyciwgdmFsLCBieXRlT2Zmc2V0KSB7XG4gICAgdmFyIGZvdW5kSW5kZXggPSAtMVxuICAgIGZvciAodmFyIGkgPSAwOyBieXRlT2Zmc2V0ICsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGFycltieXRlT2Zmc2V0ICsgaV0gPT09IHZhbFtmb3VuZEluZGV4ID09PSAtMSA/IDAgOiBpIC0gZm91bmRJbmRleF0pIHtcbiAgICAgICAgaWYgKGZvdW5kSW5kZXggPT09IC0xKSBmb3VuZEluZGV4ID0gaVxuICAgICAgICBpZiAoaSAtIGZvdW5kSW5kZXggKyAxID09PSB2YWwubGVuZ3RoKSByZXR1cm4gYnl0ZU9mZnNldCArIGZvdW5kSW5kZXhcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvdW5kSW5kZXggPSAtMVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gLTFcbiAgfVxuXG4gIHRocm93IG5ldyBUeXBlRXJyb3IoJ3ZhbCBtdXN0IGJlIHN0cmluZywgbnVtYmVyIG9yIEJ1ZmZlcicpXG59XG5cbi8vIGBnZXRgIHdpbGwgYmUgcmVtb3ZlZCBpbiBOb2RlIDAuMTMrXG5CdWZmZXIucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIGdldCAob2Zmc2V0KSB7XG4gIGNvbnNvbGUubG9nKCcuZ2V0KCkgaXMgZGVwcmVjYXRlZC4gQWNjZXNzIHVzaW5nIGFycmF5IGluZGV4ZXMgaW5zdGVhZC4nKVxuICByZXR1cm4gdGhpcy5yZWFkVUludDgob2Zmc2V0KVxufVxuXG4vLyBgc2V0YCB3aWxsIGJlIHJlbW92ZWQgaW4gTm9kZSAwLjEzK1xuQnVmZmVyLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiBzZXQgKHYsIG9mZnNldCkge1xuICBjb25zb2xlLmxvZygnLnNldCgpIGlzIGRlcHJlY2F0ZWQuIEFjY2VzcyB1c2luZyBhcnJheSBpbmRleGVzIGluc3RlYWQuJylcbiAgcmV0dXJuIHRoaXMud3JpdGVVSW50OCh2LCBvZmZzZXQpXG59XG5cbmZ1bmN0aW9uIGhleFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgb2Zmc2V0ID0gTnVtYmVyKG9mZnNldCkgfHwgMFxuICB2YXIgcmVtYWluaW5nID0gYnVmLmxlbmd0aCAtIG9mZnNldFxuICBpZiAoIWxlbmd0aCkge1xuICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICB9IGVsc2Uge1xuICAgIGxlbmd0aCA9IE51bWJlcihsZW5ndGgpXG4gICAgaWYgKGxlbmd0aCA+IHJlbWFpbmluZykge1xuICAgICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gICAgfVxuICB9XG5cbiAgLy8gbXVzdCBiZSBhbiBldmVuIG51bWJlciBvZiBkaWdpdHNcbiAgdmFyIHN0ckxlbiA9IHN0cmluZy5sZW5ndGhcbiAgaWYgKHN0ckxlbiAlIDIgIT09IDApIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBoZXggc3RyaW5nJylcblxuICBpZiAobGVuZ3RoID4gc3RyTGVuIC8gMikge1xuICAgIGxlbmd0aCA9IHN0ckxlbiAvIDJcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHBhcnNlZCA9IHBhcnNlSW50KHN0cmluZy5zdWJzdHIoaSAqIDIsIDIpLCAxNilcbiAgICBpZiAoaXNOYU4ocGFyc2VkKSkgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGhleCBzdHJpbmcnKVxuICAgIGJ1ZltvZmZzZXQgKyBpXSA9IHBhcnNlZFxuICB9XG4gIHJldHVybiBpXG59XG5cbmZ1bmN0aW9uIHV0ZjhXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBibGl0QnVmZmVyKHV0ZjhUb0J5dGVzKHN0cmluZywgYnVmLmxlbmd0aCAtIG9mZnNldCksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cbn1cblxuZnVuY3Rpb24gYXNjaWlXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBibGl0QnVmZmVyKGFzY2lpVG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbmZ1bmN0aW9uIGJpbmFyeVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGFzY2lpV3JpdGUoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5mdW5jdGlvbiBiYXNlNjRXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBibGl0QnVmZmVyKGJhc2U2NFRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5mdW5jdGlvbiB1dGYxNmxlV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gYmxpdEJ1ZmZlcih1dGYxNmxlVG9CeXRlcyhzdHJpbmcsIGJ1Zi5sZW5ndGggLSBvZmZzZXQpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbiB3cml0ZSAoc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCwgZW5jb2RpbmcpIHtcbiAgLy8gU3VwcG9ydCBib3RoIChzdHJpbmcsIG9mZnNldCwgbGVuZ3RoLCBlbmNvZGluZylcbiAgLy8gYW5kIHRoZSBsZWdhY3kgKHN0cmluZywgZW5jb2RpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICBpZiAoaXNGaW5pdGUob2Zmc2V0KSkge1xuICAgIGlmICghaXNGaW5pdGUobGVuZ3RoKSkge1xuICAgICAgZW5jb2RpbmcgPSBsZW5ndGhcbiAgICAgIGxlbmd0aCA9IHVuZGVmaW5lZFxuICAgIH1cbiAgfSBlbHNlIHsgIC8vIGxlZ2FjeVxuICAgIHZhciBzd2FwID0gZW5jb2RpbmdcbiAgICBlbmNvZGluZyA9IG9mZnNldFxuICAgIG9mZnNldCA9IGxlbmd0aFxuICAgIGxlbmd0aCA9IHN3YXBcbiAgfVxuXG4gIG9mZnNldCA9IE51bWJlcihvZmZzZXQpIHx8IDBcblxuICBpZiAobGVuZ3RoIDwgMCB8fCBvZmZzZXQgPCAwIHx8IG9mZnNldCA+IHRoaXMubGVuZ3RoKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ2F0dGVtcHQgdG8gd3JpdGUgb3V0c2lkZSBidWZmZXIgYm91bmRzJylcbiAgfVxuXG4gIHZhciByZW1haW5pbmcgPSB0aGlzLmxlbmd0aCAtIG9mZnNldFxuICBpZiAoIWxlbmd0aCkge1xuICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICB9IGVsc2Uge1xuICAgIGxlbmd0aCA9IE51bWJlcihsZW5ndGgpXG4gICAgaWYgKGxlbmd0aCA+IHJlbWFpbmluZykge1xuICAgICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gICAgfVxuICB9XG4gIGVuY29kaW5nID0gU3RyaW5nKGVuY29kaW5nIHx8ICd1dGY4JykudG9Mb3dlckNhc2UoKVxuXG4gIHZhciByZXRcbiAgc3dpdGNoIChlbmNvZGluZykge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgICByZXQgPSBoZXhXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgICByZXQgPSB1dGY4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYXNjaWknOlxuICAgICAgcmV0ID0gYXNjaWlXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiaW5hcnknOlxuICAgICAgcmV0ID0gYmluYXJ5V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgIHJldCA9IGJhc2U2NFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXQgPSB1dGYxNmxlV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1Vua25vd24gZW5jb2Rpbmc6ICcgKyBlbmNvZGluZylcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24gdG9KU09OICgpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnQnVmZmVyJyxcbiAgICBkYXRhOiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCh0aGlzLl9hcnIgfHwgdGhpcywgMClcbiAgfVxufVxuXG5mdW5jdGlvbiBiYXNlNjRTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIGlmIChzdGFydCA9PT0gMCAmJiBlbmQgPT09IGJ1Zi5sZW5ndGgpIHtcbiAgICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmKVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBiYXNlNjQuZnJvbUJ5dGVBcnJheShidWYuc2xpY2Uoc3RhcnQsIGVuZCkpXG4gIH1cbn1cblxuZnVuY3Rpb24gdXRmOFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHJlcyA9ICcnXG4gIHZhciB0bXAgPSAnJ1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICBpZiAoYnVmW2ldIDw9IDB4N0YpIHtcbiAgICAgIHJlcyArPSBkZWNvZGVVdGY4Q2hhcih0bXApICsgU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0pXG4gICAgICB0bXAgPSAnJ1xuICAgIH0gZWxzZSB7XG4gICAgICB0bXAgKz0gJyUnICsgYnVmW2ldLnRvU3RyaW5nKDE2KVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXMgKyBkZWNvZGVVdGY4Q2hhcih0bXApXG59XG5cbmZ1bmN0aW9uIGFzY2lpU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgcmV0ID0gJydcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgcmV0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldICYgMHg3RilcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbmZ1bmN0aW9uIGJpbmFyeVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHJldCA9ICcnXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIHJldCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSlcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbmZ1bmN0aW9uIGhleFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcblxuICBpZiAoIXN0YXJ0IHx8IHN0YXJ0IDwgMCkgc3RhcnQgPSAwXG4gIGlmICghZW5kIHx8IGVuZCA8IDAgfHwgZW5kID4gbGVuKSBlbmQgPSBsZW5cblxuICB2YXIgb3V0ID0gJydcbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICBvdXQgKz0gdG9IZXgoYnVmW2ldKVxuICB9XG4gIHJldHVybiBvdXRcbn1cblxuZnVuY3Rpb24gdXRmMTZsZVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGJ5dGVzID0gYnVmLnNsaWNlKHN0YXJ0LCBlbmQpXG4gIHZhciByZXMgPSAnJ1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgcmVzICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnl0ZXNbaV0gKyBieXRlc1tpICsgMV0gKiAyNTYpXG4gIH1cbiAgcmV0dXJuIHJlc1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnNsaWNlID0gZnVuY3Rpb24gc2xpY2UgKHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIHN0YXJ0ID0gfn5zdGFydFxuICBlbmQgPSBlbmQgPT09IHVuZGVmaW5lZCA/IGxlbiA6IH5+ZW5kXG5cbiAgaWYgKHN0YXJ0IDwgMCkge1xuICAgIHN0YXJ0ICs9IGxlblxuICAgIGlmIChzdGFydCA8IDApIHN0YXJ0ID0gMFxuICB9IGVsc2UgaWYgKHN0YXJ0ID4gbGVuKSB7XG4gICAgc3RhcnQgPSBsZW5cbiAgfVxuXG4gIGlmIChlbmQgPCAwKSB7XG4gICAgZW5kICs9IGxlblxuICAgIGlmIChlbmQgPCAwKSBlbmQgPSAwXG4gIH0gZWxzZSBpZiAoZW5kID4gbGVuKSB7XG4gICAgZW5kID0gbGVuXG4gIH1cblxuICBpZiAoZW5kIDwgc3RhcnQpIGVuZCA9IHN0YXJ0XG5cbiAgdmFyIG5ld0J1ZlxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICBuZXdCdWYgPSBCdWZmZXIuX2F1Z21lbnQodGhpcy5zdWJhcnJheShzdGFydCwgZW5kKSlcbiAgfSBlbHNlIHtcbiAgICB2YXIgc2xpY2VMZW4gPSBlbmQgLSBzdGFydFxuICAgIG5ld0J1ZiA9IG5ldyBCdWZmZXIoc2xpY2VMZW4sIHVuZGVmaW5lZClcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNsaWNlTGVuOyBpKyspIHtcbiAgICAgIG5ld0J1ZltpXSA9IHRoaXNbaSArIHN0YXJ0XVxuICAgIH1cbiAgfVxuXG4gIGlmIChuZXdCdWYubGVuZ3RoKSBuZXdCdWYucGFyZW50ID0gdGhpcy5wYXJlbnQgfHwgdGhpc1xuXG4gIHJldHVybiBuZXdCdWZcbn1cblxuLypcbiAqIE5lZWQgdG8gbWFrZSBzdXJlIHRoYXQgYnVmZmVyIGlzbid0IHRyeWluZyB0byB3cml0ZSBvdXQgb2YgYm91bmRzLlxuICovXG5mdW5jdGlvbiBjaGVja09mZnNldCAob2Zmc2V0LCBleHQsIGxlbmd0aCkge1xuICBpZiAoKG9mZnNldCAlIDEpICE9PSAwIHx8IG9mZnNldCA8IDApIHRocm93IG5ldyBSYW5nZUVycm9yKCdvZmZzZXQgaXMgbm90IHVpbnQnKVxuICBpZiAob2Zmc2V0ICsgZXh0ID4gbGVuZ3RoKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignVHJ5aW5nIHRvIGFjY2VzcyBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnRMRSA9IGZ1bmN0aW9uIHJlYWRVSW50TEUgKG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgYnl0ZUxlbmd0aCwgdGhpcy5sZW5ndGgpXG5cbiAgdmFyIHZhbCA9IHRoaXNbb2Zmc2V0XVxuICB2YXIgbXVsID0gMVxuICB2YXIgaSA9IDBcbiAgd2hpbGUgKCsraSA8IGJ5dGVMZW5ndGggJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB2YWwgKz0gdGhpc1tvZmZzZXQgKyBpXSAqIG11bFxuICB9XG5cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50QkUgPSBmdW5jdGlvbiByZWFkVUludEJFIChvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgY2hlY2tPZmZzZXQob2Zmc2V0LCBieXRlTGVuZ3RoLCB0aGlzLmxlbmd0aClcbiAgfVxuXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldCArIC0tYnl0ZUxlbmd0aF1cbiAgdmFyIG11bCA9IDFcbiAgd2hpbGUgKGJ5dGVMZW5ndGggPiAwICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdmFsICs9IHRoaXNbb2Zmc2V0ICsgLS1ieXRlTGVuZ3RoXSAqIG11bFxuICB9XG5cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50OCA9IGZ1bmN0aW9uIHJlYWRVSW50OCAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDEsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gdGhpc1tvZmZzZXRdXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQxNkxFID0gZnVuY3Rpb24gcmVhZFVJbnQxNkxFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMiwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiB0aGlzW29mZnNldF0gfCAodGhpc1tvZmZzZXQgKyAxXSA8PCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZCRSA9IGZ1bmN0aW9uIHJlYWRVSW50MTZCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDIsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gKHRoaXNbb2Zmc2V0XSA8PCA4KSB8IHRoaXNbb2Zmc2V0ICsgMV1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyTEUgPSBmdW5jdGlvbiByZWFkVUludDMyTEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcblxuICByZXR1cm4gKCh0aGlzW29mZnNldF0pIHxcbiAgICAgICh0aGlzW29mZnNldCArIDFdIDw8IDgpIHxcbiAgICAgICh0aGlzW29mZnNldCArIDJdIDw8IDE2KSkgK1xuICAgICAgKHRoaXNbb2Zmc2V0ICsgM10gKiAweDEwMDAwMDApXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkJFID0gZnVuY3Rpb24gcmVhZFVJbnQzMkJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICh0aGlzW29mZnNldF0gKiAweDEwMDAwMDApICtcbiAgICAoKHRoaXNbb2Zmc2V0ICsgMV0gPDwgMTYpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCA4KSB8XG4gICAgdGhpc1tvZmZzZXQgKyAzXSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50TEUgPSBmdW5jdGlvbiByZWFkSW50TEUgKG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgYnl0ZUxlbmd0aCwgdGhpcy5sZW5ndGgpXG5cbiAgdmFyIHZhbCA9IHRoaXNbb2Zmc2V0XVxuICB2YXIgbXVsID0gMVxuICB2YXIgaSA9IDBcbiAgd2hpbGUgKCsraSA8IGJ5dGVMZW5ndGggJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB2YWwgKz0gdGhpc1tvZmZzZXQgKyBpXSAqIG11bFxuICB9XG4gIG11bCAqPSAweDgwXG5cbiAgaWYgKHZhbCA+PSBtdWwpIHZhbCAtPSBNYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aClcblxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludEJFID0gZnVuY3Rpb24gcmVhZEludEJFIChvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIGJ5dGVMZW5ndGgsIHRoaXMubGVuZ3RoKVxuXG4gIHZhciBpID0gYnl0ZUxlbmd0aFxuICB2YXIgbXVsID0gMVxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXQgKyAtLWldXG4gIHdoaWxlIChpID4gMCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHZhbCArPSB0aGlzW29mZnNldCArIC0taV0gKiBtdWxcbiAgfVxuICBtdWwgKj0gMHg4MFxuXG4gIGlmICh2YWwgPj0gbXVsKSB2YWwgLT0gTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGgpXG5cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQ4ID0gZnVuY3Rpb24gcmVhZEludDggKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAxLCB0aGlzLmxlbmd0aClcbiAgaWYgKCEodGhpc1tvZmZzZXRdICYgMHg4MCkpIHJldHVybiAodGhpc1tvZmZzZXRdKVxuICByZXR1cm4gKCgweGZmIC0gdGhpc1tvZmZzZXRdICsgMSkgKiAtMSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZMRSA9IGZ1bmN0aW9uIHJlYWRJbnQxNkxFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMiwgdGhpcy5sZW5ndGgpXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldF0gfCAodGhpc1tvZmZzZXQgKyAxXSA8PCA4KVxuICByZXR1cm4gKHZhbCAmIDB4ODAwMCkgPyB2YWwgfCAweEZGRkYwMDAwIDogdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDE2QkUgPSBmdW5jdGlvbiByZWFkSW50MTZCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDIsIHRoaXMubGVuZ3RoKVxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXQgKyAxXSB8ICh0aGlzW29mZnNldF0gPDwgOClcbiAgcmV0dXJuICh2YWwgJiAweDgwMDApID8gdmFsIHwgMHhGRkZGMDAwMCA6IHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkxFID0gZnVuY3Rpb24gcmVhZEludDMyTEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcblxuICByZXR1cm4gKHRoaXNbb2Zmc2V0XSkgfFxuICAgICh0aGlzW29mZnNldCArIDFdIDw8IDgpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCAxNikgfFxuICAgICh0aGlzW29mZnNldCArIDNdIDw8IDI0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkJFID0gZnVuY3Rpb24gcmVhZEludDMyQkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcblxuICByZXR1cm4gKHRoaXNbb2Zmc2V0XSA8PCAyNCkgfFxuICAgICh0aGlzW29mZnNldCArIDFdIDw8IDE2KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgMl0gPDwgOCkgfFxuICAgICh0aGlzW29mZnNldCArIDNdKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdExFID0gZnVuY3Rpb24gcmVhZEZsb2F0TEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIHRydWUsIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdEJFID0gZnVuY3Rpb24gcmVhZEZsb2F0QkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIGZhbHNlLCAyMywgNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRG91YmxlTEUgPSBmdW5jdGlvbiByZWFkRG91YmxlTEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA4LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIHRydWUsIDUyLCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVCRSA9IGZ1bmN0aW9uIHJlYWREb3VibGVCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDgsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gaWVlZTc1NC5yZWFkKHRoaXMsIG9mZnNldCwgZmFsc2UsIDUyLCA4KVxufVxuXG5mdW5jdGlvbiBjaGVja0ludCAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBleHQsIG1heCwgbWluKSB7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKGJ1ZikpIHRocm93IG5ldyBUeXBlRXJyb3IoJ2J1ZmZlciBtdXN0IGJlIGEgQnVmZmVyIGluc3RhbmNlJylcbiAgaWYgKHZhbHVlID4gbWF4IHx8IHZhbHVlIDwgbWluKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcigndmFsdWUgaXMgb3V0IG9mIGJvdW5kcycpXG4gIGlmIChvZmZzZXQgKyBleHQgPiBidWYubGVuZ3RoKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignaW5kZXggb3V0IG9mIHJhbmdlJylcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnRMRSA9IGZ1bmN0aW9uIHdyaXRlVUludExFICh2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGgpLCAwKVxuXG4gIHZhciBtdWwgPSAxXG4gIHZhciBpID0gMFxuICB0aGlzW29mZnNldF0gPSB2YWx1ZSAmIDB4RkZcbiAgd2hpbGUgKCsraSA8IGJ5dGVMZW5ndGggJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB0aGlzW29mZnNldCArIGldID0gKHZhbHVlIC8gbXVsKSA+Pj4gMCAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50QkUgPSBmdW5jdGlvbiB3cml0ZVVJbnRCRSAodmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoKSwgMClcblxuICB2YXIgaSA9IGJ5dGVMZW5ndGggLSAxXG4gIHZhciBtdWwgPSAxXG4gIHRoaXNbb2Zmc2V0ICsgaV0gPSB2YWx1ZSAmIDB4RkZcbiAgd2hpbGUgKC0taSA+PSAwICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdGhpc1tvZmZzZXQgKyBpXSA9ICh2YWx1ZSAvIG11bCkgPj4+IDAgJiAweEZGXG4gIH1cblxuICByZXR1cm4gb2Zmc2V0ICsgYnl0ZUxlbmd0aFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDggPSBmdW5jdGlvbiB3cml0ZVVJbnQ4ICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMSwgMHhmZiwgMClcbiAgaWYgKCFCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkgdmFsdWUgPSBNYXRoLmZsb29yKHZhbHVlKVxuICB0aGlzW29mZnNldF0gPSB2YWx1ZVxuICByZXR1cm4gb2Zmc2V0ICsgMVxufVxuXG5mdW5jdGlvbiBvYmplY3RXcml0ZVVJbnQxNiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4pIHtcbiAgaWYgKHZhbHVlIDwgMCkgdmFsdWUgPSAweGZmZmYgKyB2YWx1ZSArIDFcbiAgZm9yICh2YXIgaSA9IDAsIGogPSBNYXRoLm1pbihidWYubGVuZ3RoIC0gb2Zmc2V0LCAyKTsgaSA8IGo7IGkrKykge1xuICAgIGJ1ZltvZmZzZXQgKyBpXSA9ICh2YWx1ZSAmICgweGZmIDw8ICg4ICogKGxpdHRsZUVuZGlhbiA/IGkgOiAxIC0gaSkpKSkgPj4+XG4gICAgICAobGl0dGxlRW5kaWFuID8gaSA6IDEgLSBpKSAqIDhcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2TEUgPSBmdW5jdGlvbiB3cml0ZVVJbnQxNkxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMiwgMHhmZmZmLCAwKVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldF0gPSB2YWx1ZVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gIH0gZWxzZSB7XG4gICAgb2JqZWN0V3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSlcbiAgfVxuICByZXR1cm4gb2Zmc2V0ICsgMlxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2QkUgPSBmdW5jdGlvbiB3cml0ZVVJbnQxNkJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMiwgMHhmZmZmLCAwKVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldF0gPSAodmFsdWUgPj4+IDgpXG4gICAgdGhpc1tvZmZzZXQgKyAxXSA9IHZhbHVlXG4gIH0gZWxzZSB7XG4gICAgb2JqZWN0V3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UpXG4gIH1cbiAgcmV0dXJuIG9mZnNldCArIDJcbn1cblxuZnVuY3Rpb24gb2JqZWN0V3JpdGVVSW50MzIgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuKSB7XG4gIGlmICh2YWx1ZSA8IDApIHZhbHVlID0gMHhmZmZmZmZmZiArIHZhbHVlICsgMVxuICBmb3IgKHZhciBpID0gMCwgaiA9IE1hdGgubWluKGJ1Zi5sZW5ndGggLSBvZmZzZXQsIDQpOyBpIDwgajsgaSsrKSB7XG4gICAgYnVmW29mZnNldCArIGldID0gKHZhbHVlID4+PiAobGl0dGxlRW5kaWFuID8gaSA6IDMgLSBpKSAqIDgpICYgMHhmZlxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJMRSA9IGZ1bmN0aW9uIHdyaXRlVUludDMyTEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweGZmZmZmZmZmLCAwKVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldCArIDNdID0gKHZhbHVlID4+PiAyNClcbiAgICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiAxNilcbiAgICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiA4KVxuICAgIHRoaXNbb2Zmc2V0XSA9IHZhbHVlXG4gIH0gZWxzZSB7XG4gICAgb2JqZWN0V3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSlcbiAgfVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyQkUgPSBmdW5jdGlvbiB3cml0ZVVJbnQzMkJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgNCwgMHhmZmZmZmZmZiwgMClcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgdGhpc1tvZmZzZXRdID0gKHZhbHVlID4+PiAyNClcbiAgICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiAxNilcbiAgICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiA4KVxuICAgIHRoaXNbb2Zmc2V0ICsgM10gPSB2YWx1ZVxuICB9IGVsc2Uge1xuICAgIG9iamVjdFdyaXRlVUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlKVxuICB9XG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnRMRSA9IGZ1bmN0aW9uIHdyaXRlSW50TEUgKHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgY2hlY2tJbnQoXG4gICAgICB0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLFxuICAgICAgTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGggLSAxKSAtIDEsXG4gICAgICAtTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGggLSAxKVxuICAgIClcbiAgfVxuXG4gIHZhciBpID0gMFxuICB2YXIgbXVsID0gMVxuICB2YXIgc3ViID0gdmFsdWUgPCAwID8gMSA6IDBcbiAgdGhpc1tvZmZzZXRdID0gdmFsdWUgJiAweEZGXG4gIHdoaWxlICgrK2kgPCBieXRlTGVuZ3RoICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdGhpc1tvZmZzZXQgKyBpXSA9ICgodmFsdWUgLyBtdWwpID4+IDApIC0gc3ViICYgMHhGRlxuICB9XG5cbiAgcmV0dXJuIG9mZnNldCArIGJ5dGVMZW5ndGhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludEJFID0gZnVuY3Rpb24gd3JpdGVJbnRCRSAodmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBjaGVja0ludChcbiAgICAgIHRoaXMsIHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsXG4gICAgICBNYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aCAtIDEpIC0gMSxcbiAgICAgIC1NYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aCAtIDEpXG4gICAgKVxuICB9XG5cbiAgdmFyIGkgPSBieXRlTGVuZ3RoIC0gMVxuICB2YXIgbXVsID0gMVxuICB2YXIgc3ViID0gdmFsdWUgPCAwID8gMSA6IDBcbiAgdGhpc1tvZmZzZXQgKyBpXSA9IHZhbHVlICYgMHhGRlxuICB3aGlsZSAoLS1pID49IDAgJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB0aGlzW29mZnNldCArIGldID0gKCh2YWx1ZSAvIG11bCkgPj4gMCkgLSBzdWIgJiAweEZGXG4gIH1cblxuICByZXR1cm4gb2Zmc2V0ICsgYnl0ZUxlbmd0aFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50OCA9IGZ1bmN0aW9uIHdyaXRlSW50OCAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDEsIDB4N2YsIC0weDgwKVxuICBpZiAoIUJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB2YWx1ZSA9IE1hdGguZmxvb3IodmFsdWUpXG4gIGlmICh2YWx1ZSA8IDApIHZhbHVlID0gMHhmZiArIHZhbHVlICsgMVxuICB0aGlzW29mZnNldF0gPSB2YWx1ZVxuICByZXR1cm4gb2Zmc2V0ICsgMVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZMRSA9IGZ1bmN0aW9uIHdyaXRlSW50MTZMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDIsIDB4N2ZmZiwgLTB4ODAwMClcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgdGhpc1tvZmZzZXRdID0gdmFsdWVcbiAgICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiA4KVxuICB9IGVsc2Uge1xuICAgIG9iamVjdFdyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUpXG4gIH1cbiAgcmV0dXJuIG9mZnNldCArIDJcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDE2QkUgPSBmdW5jdGlvbiB3cml0ZUludDE2QkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAyLCAweDdmZmYsIC0weDgwMDApXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gOClcbiAgICB0aGlzW29mZnNldCArIDFdID0gdmFsdWVcbiAgfSBlbHNlIHtcbiAgICBvYmplY3RXcml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSlcbiAgfVxuICByZXR1cm4gb2Zmc2V0ICsgMlxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MzJMRSA9IGZ1bmN0aW9uIHdyaXRlSW50MzJMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDQsIDB4N2ZmZmZmZmYsIC0weDgwMDAwMDAwKVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldF0gPSB2YWx1ZVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gICAgdGhpc1tvZmZzZXQgKyAyXSA9ICh2YWx1ZSA+Pj4gMTYpXG4gICAgdGhpc1tvZmZzZXQgKyAzXSA9ICh2YWx1ZSA+Pj4gMjQpXG4gIH0gZWxzZSB7XG4gICAgb2JqZWN0V3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSlcbiAgfVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MzJCRSA9IGZ1bmN0aW9uIHdyaXRlSW50MzJCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDQsIDB4N2ZmZmZmZmYsIC0weDgwMDAwMDAwKVxuICBpZiAodmFsdWUgPCAwKSB2YWx1ZSA9IDB4ZmZmZmZmZmYgKyB2YWx1ZSArIDFcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgdGhpc1tvZmZzZXRdID0gKHZhbHVlID4+PiAyNClcbiAgICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiAxNilcbiAgICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiA4KVxuICAgIHRoaXNbb2Zmc2V0ICsgM10gPSB2YWx1ZVxuICB9IGVsc2Uge1xuICAgIG9iamVjdFdyaXRlVUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlKVxuICB9XG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbmZ1bmN0aW9uIGNoZWNrSUVFRTc1NCAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBleHQsIG1heCwgbWluKSB7XG4gIGlmICh2YWx1ZSA+IG1heCB8fCB2YWx1ZSA8IG1pbikgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ3ZhbHVlIGlzIG91dCBvZiBib3VuZHMnKVxuICBpZiAob2Zmc2V0ICsgZXh0ID4gYnVmLmxlbmd0aCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ2luZGV4IG91dCBvZiByYW5nZScpXG4gIGlmIChvZmZzZXQgPCAwKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignaW5kZXggb3V0IG9mIHJhbmdlJylcbn1cblxuZnVuY3Rpb24gd3JpdGVGbG9hdCAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBjaGVja0lFRUU3NTQoYnVmLCB2YWx1ZSwgb2Zmc2V0LCA0LCAzLjQwMjgyMzQ2NjM4NTI4ODZlKzM4LCAtMy40MDI4MjM0NjYzODUyODg2ZSszOClcbiAgfVxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCAyMywgNClcbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0TEUgPSBmdW5jdGlvbiB3cml0ZUZsb2F0TEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiB3cml0ZUZsb2F0KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRmxvYXRCRSA9IGZ1bmN0aW9uIHdyaXRlRmxvYXRCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHdyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiB3cml0ZURvdWJsZSAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBjaGVja0lFRUU3NTQoYnVmLCB2YWx1ZSwgb2Zmc2V0LCA4LCAxLjc5NzY5MzEzNDg2MjMxNTdFKzMwOCwgLTEuNzk3NjkzMTM0ODYyMzE1N0UrMzA4KVxuICB9XG4gIGllZWU3NTQud3JpdGUoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDUyLCA4KVxuICByZXR1cm4gb2Zmc2V0ICsgOFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlTEUgPSBmdW5jdGlvbiB3cml0ZURvdWJsZUxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVEb3VibGVCRSA9IGZ1bmN0aW9uIHdyaXRlRG91YmxlQkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiB3cml0ZURvdWJsZSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbi8vIGNvcHkodGFyZ2V0QnVmZmVyLCB0YXJnZXRTdGFydD0wLCBzb3VyY2VTdGFydD0wLCBzb3VyY2VFbmQ9YnVmZmVyLmxlbmd0aClcbkJ1ZmZlci5wcm90b3R5cGUuY29weSA9IGZ1bmN0aW9uIGNvcHkgKHRhcmdldCwgdGFyZ2V0X3N0YXJ0LCBzdGFydCwgZW5kKSB7XG4gIGlmICghc3RhcnQpIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCAmJiBlbmQgIT09IDApIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICh0YXJnZXRfc3RhcnQgPj0gdGFyZ2V0Lmxlbmd0aCkgdGFyZ2V0X3N0YXJ0ID0gdGFyZ2V0Lmxlbmd0aFxuICBpZiAoIXRhcmdldF9zdGFydCkgdGFyZ2V0X3N0YXJ0ID0gMFxuICBpZiAoZW5kID4gMCAmJiBlbmQgPCBzdGFydCkgZW5kID0gc3RhcnRcblxuICAvLyBDb3B5IDAgYnl0ZXM7IHdlJ3JlIGRvbmVcbiAgaWYgKGVuZCA9PT0gc3RhcnQpIHJldHVybiAwXG4gIGlmICh0YXJnZXQubGVuZ3RoID09PSAwIHx8IHRoaXMubGVuZ3RoID09PSAwKSByZXR1cm4gMFxuXG4gIC8vIEZhdGFsIGVycm9yIGNvbmRpdGlvbnNcbiAgaWYgKHRhcmdldF9zdGFydCA8IDApIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcigndGFyZ2V0U3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIH1cbiAgaWYgKHN0YXJ0IDwgMCB8fCBzdGFydCA+PSB0aGlzLmxlbmd0aCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ3NvdXJjZVN0YXJ0IG91dCBvZiBib3VuZHMnKVxuICBpZiAoZW5kIDwgMCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ3NvdXJjZUVuZCBvdXQgb2YgYm91bmRzJylcblxuICAvLyBBcmUgd2Ugb29iP1xuICBpZiAoZW5kID4gdGhpcy5sZW5ndGgpIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICh0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0X3N0YXJ0IDwgZW5kIC0gc3RhcnQpIHtcbiAgICBlbmQgPSB0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0X3N0YXJ0ICsgc3RhcnRcbiAgfVxuXG4gIHZhciBsZW4gPSBlbmQgLSBzdGFydFxuXG4gIGlmIChsZW4gPCAxMDAwIHx8ICFCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIHRhcmdldFtpICsgdGFyZ2V0X3N0YXJ0XSA9IHRoaXNbaSArIHN0YXJ0XVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0YXJnZXQuX3NldCh0aGlzLnN1YmFycmF5KHN0YXJ0LCBzdGFydCArIGxlbiksIHRhcmdldF9zdGFydClcbiAgfVxuXG4gIHJldHVybiBsZW5cbn1cblxuLy8gZmlsbCh2YWx1ZSwgc3RhcnQ9MCwgZW5kPWJ1ZmZlci5sZW5ndGgpXG5CdWZmZXIucHJvdG90eXBlLmZpbGwgPSBmdW5jdGlvbiBmaWxsICh2YWx1ZSwgc3RhcnQsIGVuZCkge1xuICBpZiAoIXZhbHVlKSB2YWx1ZSA9IDBcbiAgaWYgKCFzdGFydCkgc3RhcnQgPSAwXG4gIGlmICghZW5kKSBlbmQgPSB0aGlzLmxlbmd0aFxuXG4gIGlmIChlbmQgPCBzdGFydCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ2VuZCA8IHN0YXJ0JylcblxuICAvLyBGaWxsIDAgYnl0ZXM7IHdlJ3JlIGRvbmVcbiAgaWYgKGVuZCA9PT0gc3RhcnQpIHJldHVyblxuICBpZiAodGhpcy5sZW5ndGggPT09IDApIHJldHVyblxuXG4gIGlmIChzdGFydCA8IDAgfHwgc3RhcnQgPj0gdGhpcy5sZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdzdGFydCBvdXQgb2YgYm91bmRzJylcbiAgaWYgKGVuZCA8IDAgfHwgZW5kID4gdGhpcy5sZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdlbmQgb3V0IG9mIGJvdW5kcycpXG5cbiAgdmFyIGlcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpIHtcbiAgICBmb3IgKGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgICB0aGlzW2ldID0gdmFsdWVcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdmFyIGJ5dGVzID0gdXRmOFRvQnl0ZXModmFsdWUudG9TdHJpbmcoKSlcbiAgICB2YXIgbGVuID0gYnl0ZXMubGVuZ3RoXG4gICAgZm9yIChpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgICAgdGhpc1tpXSA9IGJ5dGVzW2kgJSBsZW5dXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXNcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGBBcnJheUJ1ZmZlcmAgd2l0aCB0aGUgKmNvcGllZCogbWVtb3J5IG9mIHRoZSBidWZmZXIgaW5zdGFuY2UuXG4gKiBBZGRlZCBpbiBOb2RlIDAuMTIuIE9ubHkgYXZhaWxhYmxlIGluIGJyb3dzZXJzIHRoYXQgc3VwcG9ydCBBcnJheUJ1ZmZlci5cbiAqL1xuQnVmZmVyLnByb3RvdHlwZS50b0FycmF5QnVmZmVyID0gZnVuY3Rpb24gdG9BcnJheUJ1ZmZlciAoKSB7XG4gIGlmICh0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICAgIHJldHVybiAobmV3IEJ1ZmZlcih0aGlzKSkuYnVmZmVyXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBidWYgPSBuZXcgVWludDhBcnJheSh0aGlzLmxlbmd0aClcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBidWYubGVuZ3RoOyBpIDwgbGVuOyBpICs9IDEpIHtcbiAgICAgICAgYnVmW2ldID0gdGhpc1tpXVxuICAgICAgfVxuICAgICAgcmV0dXJuIGJ1Zi5idWZmZXJcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQnVmZmVyLnRvQXJyYXlCdWZmZXIgbm90IHN1cHBvcnRlZCBpbiB0aGlzIGJyb3dzZXInKVxuICB9XG59XG5cbi8vIEhFTFBFUiBGVU5DVElPTlNcbi8vID09PT09PT09PT09PT09PT1cblxudmFyIEJQID0gQnVmZmVyLnByb3RvdHlwZVxuXG4vKipcbiAqIEF1Z21lbnQgYSBVaW50OEFycmF5ICppbnN0YW5jZSogKG5vdCB0aGUgVWludDhBcnJheSBjbGFzcyEpIHdpdGggQnVmZmVyIG1ldGhvZHNcbiAqL1xuQnVmZmVyLl9hdWdtZW50ID0gZnVuY3Rpb24gX2F1Z21lbnQgKGFycikge1xuICBhcnIuY29uc3RydWN0b3IgPSBCdWZmZXJcbiAgYXJyLl9pc0J1ZmZlciA9IHRydWVcblxuICAvLyBzYXZlIHJlZmVyZW5jZSB0byBvcmlnaW5hbCBVaW50OEFycmF5IHNldCBtZXRob2QgYmVmb3JlIG92ZXJ3cml0aW5nXG4gIGFyci5fc2V0ID0gYXJyLnNldFxuXG4gIC8vIGRlcHJlY2F0ZWQsIHdpbGwgYmUgcmVtb3ZlZCBpbiBub2RlIDAuMTMrXG4gIGFyci5nZXQgPSBCUC5nZXRcbiAgYXJyLnNldCA9IEJQLnNldFxuXG4gIGFyci53cml0ZSA9IEJQLndyaXRlXG4gIGFyci50b1N0cmluZyA9IEJQLnRvU3RyaW5nXG4gIGFyci50b0xvY2FsZVN0cmluZyA9IEJQLnRvU3RyaW5nXG4gIGFyci50b0pTT04gPSBCUC50b0pTT05cbiAgYXJyLmVxdWFscyA9IEJQLmVxdWFsc1xuICBhcnIuY29tcGFyZSA9IEJQLmNvbXBhcmVcbiAgYXJyLmluZGV4T2YgPSBCUC5pbmRleE9mXG4gIGFyci5jb3B5ID0gQlAuY29weVxuICBhcnIuc2xpY2UgPSBCUC5zbGljZVxuICBhcnIucmVhZFVJbnRMRSA9IEJQLnJlYWRVSW50TEVcbiAgYXJyLnJlYWRVSW50QkUgPSBCUC5yZWFkVUludEJFXG4gIGFyci5yZWFkVUludDggPSBCUC5yZWFkVUludDhcbiAgYXJyLnJlYWRVSW50MTZMRSA9IEJQLnJlYWRVSW50MTZMRVxuICBhcnIucmVhZFVJbnQxNkJFID0gQlAucmVhZFVJbnQxNkJFXG4gIGFyci5yZWFkVUludDMyTEUgPSBCUC5yZWFkVUludDMyTEVcbiAgYXJyLnJlYWRVSW50MzJCRSA9IEJQLnJlYWRVSW50MzJCRVxuICBhcnIucmVhZEludExFID0gQlAucmVhZEludExFXG4gIGFyci5yZWFkSW50QkUgPSBCUC5yZWFkSW50QkVcbiAgYXJyLnJlYWRJbnQ4ID0gQlAucmVhZEludDhcbiAgYXJyLnJlYWRJbnQxNkxFID0gQlAucmVhZEludDE2TEVcbiAgYXJyLnJlYWRJbnQxNkJFID0gQlAucmVhZEludDE2QkVcbiAgYXJyLnJlYWRJbnQzMkxFID0gQlAucmVhZEludDMyTEVcbiAgYXJyLnJlYWRJbnQzMkJFID0gQlAucmVhZEludDMyQkVcbiAgYXJyLnJlYWRGbG9hdExFID0gQlAucmVhZEZsb2F0TEVcbiAgYXJyLnJlYWRGbG9hdEJFID0gQlAucmVhZEZsb2F0QkVcbiAgYXJyLnJlYWREb3VibGVMRSA9IEJQLnJlYWREb3VibGVMRVxuICBhcnIucmVhZERvdWJsZUJFID0gQlAucmVhZERvdWJsZUJFXG4gIGFyci53cml0ZVVJbnQ4ID0gQlAud3JpdGVVSW50OFxuICBhcnIud3JpdGVVSW50TEUgPSBCUC53cml0ZVVJbnRMRVxuICBhcnIud3JpdGVVSW50QkUgPSBCUC53cml0ZVVJbnRCRVxuICBhcnIud3JpdGVVSW50MTZMRSA9IEJQLndyaXRlVUludDE2TEVcbiAgYXJyLndyaXRlVUludDE2QkUgPSBCUC53cml0ZVVJbnQxNkJFXG4gIGFyci53cml0ZVVJbnQzMkxFID0gQlAud3JpdGVVSW50MzJMRVxuICBhcnIud3JpdGVVSW50MzJCRSA9IEJQLndyaXRlVUludDMyQkVcbiAgYXJyLndyaXRlSW50TEUgPSBCUC53cml0ZUludExFXG4gIGFyci53cml0ZUludEJFID0gQlAud3JpdGVJbnRCRVxuICBhcnIud3JpdGVJbnQ4ID0gQlAud3JpdGVJbnQ4XG4gIGFyci53cml0ZUludDE2TEUgPSBCUC53cml0ZUludDE2TEVcbiAgYXJyLndyaXRlSW50MTZCRSA9IEJQLndyaXRlSW50MTZCRVxuICBhcnIud3JpdGVJbnQzMkxFID0gQlAud3JpdGVJbnQzMkxFXG4gIGFyci53cml0ZUludDMyQkUgPSBCUC53cml0ZUludDMyQkVcbiAgYXJyLndyaXRlRmxvYXRMRSA9IEJQLndyaXRlRmxvYXRMRVxuICBhcnIud3JpdGVGbG9hdEJFID0gQlAud3JpdGVGbG9hdEJFXG4gIGFyci53cml0ZURvdWJsZUxFID0gQlAud3JpdGVEb3VibGVMRVxuICBhcnIud3JpdGVEb3VibGVCRSA9IEJQLndyaXRlRG91YmxlQkVcbiAgYXJyLmZpbGwgPSBCUC5maWxsXG4gIGFyci5pbnNwZWN0ID0gQlAuaW5zcGVjdFxuICBhcnIudG9BcnJheUJ1ZmZlciA9IEJQLnRvQXJyYXlCdWZmZXJcblxuICByZXR1cm4gYXJyXG59XG5cbnZhciBJTlZBTElEX0JBU0U2NF9SRSA9IC9bXitcXC8wLTlBLXpcXC1dL2dcblxuZnVuY3Rpb24gYmFzZTY0Y2xlYW4gKHN0cikge1xuICAvLyBOb2RlIHN0cmlwcyBvdXQgaW52YWxpZCBjaGFyYWN0ZXJzIGxpa2UgXFxuIGFuZCBcXHQgZnJvbSB0aGUgc3RyaW5nLCBiYXNlNjQtanMgZG9lcyBub3RcbiAgc3RyID0gc3RyaW5ndHJpbShzdHIpLnJlcGxhY2UoSU5WQUxJRF9CQVNFNjRfUkUsICcnKVxuICAvLyBOb2RlIGNvbnZlcnRzIHN0cmluZ3Mgd2l0aCBsZW5ndGggPCAyIHRvICcnXG4gIGlmIChzdHIubGVuZ3RoIDwgMikgcmV0dXJuICcnXG4gIC8vIE5vZGUgYWxsb3dzIGZvciBub24tcGFkZGVkIGJhc2U2NCBzdHJpbmdzIChtaXNzaW5nIHRyYWlsaW5nID09PSksIGJhc2U2NC1qcyBkb2VzIG5vdFxuICB3aGlsZSAoc3RyLmxlbmd0aCAlIDQgIT09IDApIHtcbiAgICBzdHIgPSBzdHIgKyAnPSdcbiAgfVxuICByZXR1cm4gc3RyXG59XG5cbmZ1bmN0aW9uIHN0cmluZ3RyaW0gKHN0cikge1xuICBpZiAoc3RyLnRyaW0pIHJldHVybiBzdHIudHJpbSgpXG4gIHJldHVybiBzdHIucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpXG59XG5cbmZ1bmN0aW9uIGlzQXJyYXlpc2ggKHN1YmplY3QpIHtcbiAgcmV0dXJuIGlzQXJyYXkoc3ViamVjdCkgfHwgQnVmZmVyLmlzQnVmZmVyKHN1YmplY3QpIHx8XG4gICAgICBzdWJqZWN0ICYmIHR5cGVvZiBzdWJqZWN0ID09PSAnb2JqZWN0JyAmJlxuICAgICAgdHlwZW9mIHN1YmplY3QubGVuZ3RoID09PSAnbnVtYmVyJ1xufVxuXG5mdW5jdGlvbiB0b0hleCAobikge1xuICBpZiAobiA8IDE2KSByZXR1cm4gJzAnICsgbi50b1N0cmluZygxNilcbiAgcmV0dXJuIG4udG9TdHJpbmcoMTYpXG59XG5cbmZ1bmN0aW9uIHV0ZjhUb0J5dGVzIChzdHJpbmcsIHVuaXRzKSB7XG4gIHVuaXRzID0gdW5pdHMgfHwgSW5maW5pdHlcbiAgdmFyIGNvZGVQb2ludFxuICB2YXIgbGVuZ3RoID0gc3RyaW5nLmxlbmd0aFxuICB2YXIgbGVhZFN1cnJvZ2F0ZSA9IG51bGxcbiAgdmFyIGJ5dGVzID0gW11cbiAgdmFyIGkgPSAwXG5cbiAgZm9yICg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIGNvZGVQb2ludCA9IHN0cmluZy5jaGFyQ29kZUF0KGkpXG5cbiAgICAvLyBpcyBzdXJyb2dhdGUgY29tcG9uZW50XG4gICAgaWYgKGNvZGVQb2ludCA+IDB4RDdGRiAmJiBjb2RlUG9pbnQgPCAweEUwMDApIHtcbiAgICAgIC8vIGxhc3QgY2hhciB3YXMgYSBsZWFkXG4gICAgICBpZiAobGVhZFN1cnJvZ2F0ZSkge1xuICAgICAgICAvLyAyIGxlYWRzIGluIGEgcm93XG4gICAgICAgIGlmIChjb2RlUG9pbnQgPCAweERDMDApIHtcbiAgICAgICAgICBpZiAoKHVuaXRzIC09IDMpID4gLTEpIGJ5dGVzLnB1c2goMHhFRiwgMHhCRiwgMHhCRClcbiAgICAgICAgICBsZWFkU3Vycm9nYXRlID0gY29kZVBvaW50XG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyB2YWxpZCBzdXJyb2dhdGUgcGFpclxuICAgICAgICAgIGNvZGVQb2ludCA9IGxlYWRTdXJyb2dhdGUgLSAweEQ4MDAgPDwgMTAgfCBjb2RlUG9pbnQgLSAweERDMDAgfCAweDEwMDAwXG4gICAgICAgICAgbGVhZFN1cnJvZ2F0ZSA9IG51bGxcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gbm8gbGVhZCB5ZXRcblxuICAgICAgICBpZiAoY29kZVBvaW50ID4gMHhEQkZGKSB7XG4gICAgICAgICAgLy8gdW5leHBlY3RlZCB0cmFpbFxuICAgICAgICAgIGlmICgodW5pdHMgLT0gMykgPiAtMSkgYnl0ZXMucHVzaCgweEVGLCAweEJGLCAweEJEKVxuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH0gZWxzZSBpZiAoaSArIDEgPT09IGxlbmd0aCkge1xuICAgICAgICAgIC8vIHVucGFpcmVkIGxlYWRcbiAgICAgICAgICBpZiAoKHVuaXRzIC09IDMpID4gLTEpIGJ5dGVzLnB1c2goMHhFRiwgMHhCRiwgMHhCRClcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIHZhbGlkIGxlYWRcbiAgICAgICAgICBsZWFkU3Vycm9nYXRlID0gY29kZVBvaW50XG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAobGVhZFN1cnJvZ2F0ZSkge1xuICAgICAgLy8gdmFsaWQgYm1wIGNoYXIsIGJ1dCBsYXN0IGNoYXIgd2FzIGEgbGVhZFxuICAgICAgaWYgKCh1bml0cyAtPSAzKSA+IC0xKSBieXRlcy5wdXNoKDB4RUYsIDB4QkYsIDB4QkQpXG4gICAgICBsZWFkU3Vycm9nYXRlID0gbnVsbFxuICAgIH1cblxuICAgIC8vIGVuY29kZSB1dGY4XG4gICAgaWYgKGNvZGVQb2ludCA8IDB4ODApIHtcbiAgICAgIGlmICgodW5pdHMgLT0gMSkgPCAwKSBicmVha1xuICAgICAgYnl0ZXMucHVzaChjb2RlUG9pbnQpXG4gICAgfSBlbHNlIGlmIChjb2RlUG9pbnQgPCAweDgwMCkge1xuICAgICAgaWYgKCh1bml0cyAtPSAyKSA8IDApIGJyZWFrXG4gICAgICBieXRlcy5wdXNoKFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHg2IHwgMHhDMCxcbiAgICAgICAgY29kZVBvaW50ICYgMHgzRiB8IDB4ODBcbiAgICAgIClcbiAgICB9IGVsc2UgaWYgKGNvZGVQb2ludCA8IDB4MTAwMDApIHtcbiAgICAgIGlmICgodW5pdHMgLT0gMykgPCAwKSBicmVha1xuICAgICAgYnl0ZXMucHVzaChcbiAgICAgICAgY29kZVBvaW50ID4+IDB4QyB8IDB4RTAsXG4gICAgICAgIGNvZGVQb2ludCA+PiAweDYgJiAweDNGIHwgMHg4MCxcbiAgICAgICAgY29kZVBvaW50ICYgMHgzRiB8IDB4ODBcbiAgICAgIClcbiAgICB9IGVsc2UgaWYgKGNvZGVQb2ludCA8IDB4MjAwMDAwKSB7XG4gICAgICBpZiAoKHVuaXRzIC09IDQpIDwgMCkgYnJlYWtcbiAgICAgIGJ5dGVzLnB1c2goXG4gICAgICAgIGNvZGVQb2ludCA+PiAweDEyIHwgMHhGMCxcbiAgICAgICAgY29kZVBvaW50ID4+IDB4QyAmIDB4M0YgfCAweDgwLFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHg2ICYgMHgzRiB8IDB4ODAsXG4gICAgICAgIGNvZGVQb2ludCAmIDB4M0YgfCAweDgwXG4gICAgICApXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBjb2RlIHBvaW50JylcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYnl0ZXNcbn1cblxuZnVuY3Rpb24gYXNjaWlUb0J5dGVzIChzdHIpIHtcbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgLy8gTm9kZSdzIGNvZGUgc2VlbXMgdG8gYmUgZG9pbmcgdGhpcyBhbmQgbm90ICYgMHg3Ri4uXG4gICAgYnl0ZUFycmF5LnB1c2goc3RyLmNoYXJDb2RlQXQoaSkgJiAweEZGKVxuICB9XG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gdXRmMTZsZVRvQnl0ZXMgKHN0ciwgdW5pdHMpIHtcbiAgdmFyIGMsIGhpLCBsb1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoKHVuaXRzIC09IDIpIDwgMCkgYnJlYWtcblxuICAgIGMgPSBzdHIuY2hhckNvZGVBdChpKVxuICAgIGhpID0gYyA+PiA4XG4gICAgbG8gPSBjICUgMjU2XG4gICAgYnl0ZUFycmF5LnB1c2gobG8pXG4gICAgYnl0ZUFycmF5LnB1c2goaGkpXG4gIH1cblxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIGJhc2U2NFRvQnl0ZXMgKHN0cikge1xuICByZXR1cm4gYmFzZTY0LnRvQnl0ZUFycmF5KGJhc2U2NGNsZWFuKHN0cikpXG59XG5cbmZ1bmN0aW9uIGJsaXRCdWZmZXIgKHNyYywgZHN0LCBvZmZzZXQsIGxlbmd0aCkge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKChpICsgb2Zmc2V0ID49IGRzdC5sZW5ndGgpIHx8IChpID49IHNyYy5sZW5ndGgpKSBicmVha1xuICAgIGRzdFtpICsgb2Zmc2V0XSA9IHNyY1tpXVxuICB9XG4gIHJldHVybiBpXG59XG5cbmZ1bmN0aW9uIGRlY29kZVV0ZjhDaGFyIChzdHIpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHN0cilcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUoMHhGRkZEKSAvLyBVVEYgOCBpbnZhbGlkIGNoYXJcbiAgfVxufVxuIiwidmFyIGxvb2t1cCA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvJztcblxuOyhmdW5jdGlvbiAoZXhwb3J0cykge1xuXHQndXNlIHN0cmljdCc7XG5cbiAgdmFyIEFyciA9ICh0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcpXG4gICAgPyBVaW50OEFycmF5XG4gICAgOiBBcnJheVxuXG5cdHZhciBQTFVTICAgPSAnKycuY2hhckNvZGVBdCgwKVxuXHR2YXIgU0xBU0ggID0gJy8nLmNoYXJDb2RlQXQoMClcblx0dmFyIE5VTUJFUiA9ICcwJy5jaGFyQ29kZUF0KDApXG5cdHZhciBMT1dFUiAgPSAnYScuY2hhckNvZGVBdCgwKVxuXHR2YXIgVVBQRVIgID0gJ0EnLmNoYXJDb2RlQXQoMClcblx0dmFyIFBMVVNfVVJMX1NBRkUgPSAnLScuY2hhckNvZGVBdCgwKVxuXHR2YXIgU0xBU0hfVVJMX1NBRkUgPSAnXycuY2hhckNvZGVBdCgwKVxuXG5cdGZ1bmN0aW9uIGRlY29kZSAoZWx0KSB7XG5cdFx0dmFyIGNvZGUgPSBlbHQuY2hhckNvZGVBdCgwKVxuXHRcdGlmIChjb2RlID09PSBQTFVTIHx8XG5cdFx0ICAgIGNvZGUgPT09IFBMVVNfVVJMX1NBRkUpXG5cdFx0XHRyZXR1cm4gNjIgLy8gJysnXG5cdFx0aWYgKGNvZGUgPT09IFNMQVNIIHx8XG5cdFx0ICAgIGNvZGUgPT09IFNMQVNIX1VSTF9TQUZFKVxuXHRcdFx0cmV0dXJuIDYzIC8vICcvJ1xuXHRcdGlmIChjb2RlIDwgTlVNQkVSKVxuXHRcdFx0cmV0dXJuIC0xIC8vbm8gbWF0Y2hcblx0XHRpZiAoY29kZSA8IE5VTUJFUiArIDEwKVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBOVU1CRVIgKyAyNiArIDI2XG5cdFx0aWYgKGNvZGUgPCBVUFBFUiArIDI2KVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBVUFBFUlxuXHRcdGlmIChjb2RlIDwgTE9XRVIgKyAyNilcblx0XHRcdHJldHVybiBjb2RlIC0gTE9XRVIgKyAyNlxuXHR9XG5cblx0ZnVuY3Rpb24gYjY0VG9CeXRlQXJyYXkgKGI2NCkge1xuXHRcdHZhciBpLCBqLCBsLCB0bXAsIHBsYWNlSG9sZGVycywgYXJyXG5cblx0XHRpZiAoYjY0Lmxlbmd0aCAlIDQgPiAwKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgc3RyaW5nLiBMZW5ndGggbXVzdCBiZSBhIG11bHRpcGxlIG9mIDQnKVxuXHRcdH1cblxuXHRcdC8vIHRoZSBudW1iZXIgb2YgZXF1YWwgc2lnbnMgKHBsYWNlIGhvbGRlcnMpXG5cdFx0Ly8gaWYgdGhlcmUgYXJlIHR3byBwbGFjZWhvbGRlcnMsIHRoYW4gdGhlIHR3byBjaGFyYWN0ZXJzIGJlZm9yZSBpdFxuXHRcdC8vIHJlcHJlc2VudCBvbmUgYnl0ZVxuXHRcdC8vIGlmIHRoZXJlIGlzIG9ubHkgb25lLCB0aGVuIHRoZSB0aHJlZSBjaGFyYWN0ZXJzIGJlZm9yZSBpdCByZXByZXNlbnQgMiBieXRlc1xuXHRcdC8vIHRoaXMgaXMganVzdCBhIGNoZWFwIGhhY2sgdG8gbm90IGRvIGluZGV4T2YgdHdpY2Vcblx0XHR2YXIgbGVuID0gYjY0Lmxlbmd0aFxuXHRcdHBsYWNlSG9sZGVycyA9ICc9JyA9PT0gYjY0LmNoYXJBdChsZW4gLSAyKSA/IDIgOiAnPScgPT09IGI2NC5jaGFyQXQobGVuIC0gMSkgPyAxIDogMFxuXG5cdFx0Ly8gYmFzZTY0IGlzIDQvMyArIHVwIHRvIHR3byBjaGFyYWN0ZXJzIG9mIHRoZSBvcmlnaW5hbCBkYXRhXG5cdFx0YXJyID0gbmV3IEFycihiNjQubGVuZ3RoICogMyAvIDQgLSBwbGFjZUhvbGRlcnMpXG5cblx0XHQvLyBpZiB0aGVyZSBhcmUgcGxhY2Vob2xkZXJzLCBvbmx5IGdldCB1cCB0byB0aGUgbGFzdCBjb21wbGV0ZSA0IGNoYXJzXG5cdFx0bCA9IHBsYWNlSG9sZGVycyA+IDAgPyBiNjQubGVuZ3RoIC0gNCA6IGI2NC5sZW5ndGhcblxuXHRcdHZhciBMID0gMFxuXG5cdFx0ZnVuY3Rpb24gcHVzaCAodikge1xuXHRcdFx0YXJyW0wrK10gPSB2XG5cdFx0fVxuXG5cdFx0Zm9yIChpID0gMCwgaiA9IDA7IGkgPCBsOyBpICs9IDQsIGogKz0gMykge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAxOCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA8PCAxMikgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDIpKSA8PCA2KSB8IGRlY29kZShiNjQuY2hhckF0KGkgKyAzKSlcblx0XHRcdHB1c2goKHRtcCAmIDB4RkYwMDAwKSA+PiAxNilcblx0XHRcdHB1c2goKHRtcCAmIDB4RkYwMCkgPj4gOClcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9XG5cblx0XHRpZiAocGxhY2VIb2xkZXJzID09PSAyKSB7XG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDIpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAxKSkgPj4gNClcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9IGVsc2UgaWYgKHBsYWNlSG9sZGVycyA9PT0gMSkge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAxMCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA8PCA0KSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMikpID4+IDIpXG5cdFx0XHRwdXNoKCh0bXAgPj4gOCkgJiAweEZGKVxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxuXHRcdH1cblxuXHRcdHJldHVybiBhcnJcblx0fVxuXG5cdGZ1bmN0aW9uIHVpbnQ4VG9CYXNlNjQgKHVpbnQ4KSB7XG5cdFx0dmFyIGksXG5cdFx0XHRleHRyYUJ5dGVzID0gdWludDgubGVuZ3RoICUgMywgLy8gaWYgd2UgaGF2ZSAxIGJ5dGUgbGVmdCwgcGFkIDIgYnl0ZXNcblx0XHRcdG91dHB1dCA9IFwiXCIsXG5cdFx0XHR0ZW1wLCBsZW5ndGhcblxuXHRcdGZ1bmN0aW9uIGVuY29kZSAobnVtKSB7XG5cdFx0XHRyZXR1cm4gbG9va3VwLmNoYXJBdChudW0pXG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gdHJpcGxldFRvQmFzZTY0IChudW0pIHtcblx0XHRcdHJldHVybiBlbmNvZGUobnVtID4+IDE4ICYgMHgzRikgKyBlbmNvZGUobnVtID4+IDEyICYgMHgzRikgKyBlbmNvZGUobnVtID4+IDYgJiAweDNGKSArIGVuY29kZShudW0gJiAweDNGKVxuXHRcdH1cblxuXHRcdC8vIGdvIHRocm91Z2ggdGhlIGFycmF5IGV2ZXJ5IHRocmVlIGJ5dGVzLCB3ZSdsbCBkZWFsIHdpdGggdHJhaWxpbmcgc3R1ZmYgbGF0ZXJcblx0XHRmb3IgKGkgPSAwLCBsZW5ndGggPSB1aW50OC5sZW5ndGggLSBleHRyYUJ5dGVzOyBpIDwgbGVuZ3RoOyBpICs9IDMpIHtcblx0XHRcdHRlbXAgPSAodWludDhbaV0gPDwgMTYpICsgKHVpbnQ4W2kgKyAxXSA8PCA4KSArICh1aW50OFtpICsgMl0pXG5cdFx0XHRvdXRwdXQgKz0gdHJpcGxldFRvQmFzZTY0KHRlbXApXG5cdFx0fVxuXG5cdFx0Ly8gcGFkIHRoZSBlbmQgd2l0aCB6ZXJvcywgYnV0IG1ha2Ugc3VyZSB0byBub3QgZm9yZ2V0IHRoZSBleHRyYSBieXRlc1xuXHRcdHN3aXRjaCAoZXh0cmFCeXRlcykge1xuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHR0ZW1wID0gdWludDhbdWludDgubGVuZ3RoIC0gMV1cblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSh0ZW1wID4+IDIpXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPDwgNCkgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gJz09J1xuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHR0ZW1wID0gKHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDJdIDw8IDgpICsgKHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDFdKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKHRlbXAgPj4gMTApXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPj4gNCkgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKCh0ZW1wIDw8IDIpICYgMHgzRilcblx0XHRcdFx0b3V0cHV0ICs9ICc9J1xuXHRcdFx0XHRicmVha1xuXHRcdH1cblxuXHRcdHJldHVybiBvdXRwdXRcblx0fVxuXG5cdGV4cG9ydHMudG9CeXRlQXJyYXkgPSBiNjRUb0J5dGVBcnJheVxuXHRleHBvcnRzLmZyb21CeXRlQXJyYXkgPSB1aW50OFRvQmFzZTY0XG59KHR5cGVvZiBleHBvcnRzID09PSAndW5kZWZpbmVkJyA/ICh0aGlzLmJhc2U2NGpzID0ge30pIDogZXhwb3J0cykpXG4iLCJleHBvcnRzLnJlYWQgPSBmdW5jdGlvbihidWZmZXIsIG9mZnNldCwgaXNMRSwgbUxlbiwgbkJ5dGVzKSB7XG4gIHZhciBlLCBtLFxuICAgICAgZUxlbiA9IG5CeXRlcyAqIDggLSBtTGVuIC0gMSxcbiAgICAgIGVNYXggPSAoMSA8PCBlTGVuKSAtIDEsXG4gICAgICBlQmlhcyA9IGVNYXggPj4gMSxcbiAgICAgIG5CaXRzID0gLTcsXG4gICAgICBpID0gaXNMRSA/IChuQnl0ZXMgLSAxKSA6IDAsXG4gICAgICBkID0gaXNMRSA/IC0xIDogMSxcbiAgICAgIHMgPSBidWZmZXJbb2Zmc2V0ICsgaV07XG5cbiAgaSArPSBkO1xuXG4gIGUgPSBzICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpO1xuICBzID4+PSAoLW5CaXRzKTtcbiAgbkJpdHMgKz0gZUxlbjtcbiAgZm9yICg7IG5CaXRzID4gMDsgZSA9IGUgKiAyNTYgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCk7XG5cbiAgbSA9IGUgJiAoKDEgPDwgKC1uQml0cykpIC0gMSk7XG4gIGUgPj49ICgtbkJpdHMpO1xuICBuQml0cyArPSBtTGVuO1xuICBmb3IgKDsgbkJpdHMgPiAwOyBtID0gbSAqIDI1NiArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KTtcblxuICBpZiAoZSA9PT0gMCkge1xuICAgIGUgPSAxIC0gZUJpYXM7XG4gIH0gZWxzZSBpZiAoZSA9PT0gZU1heCkge1xuICAgIHJldHVybiBtID8gTmFOIDogKChzID8gLTEgOiAxKSAqIEluZmluaXR5KTtcbiAgfSBlbHNlIHtcbiAgICBtID0gbSArIE1hdGgucG93KDIsIG1MZW4pO1xuICAgIGUgPSBlIC0gZUJpYXM7XG4gIH1cbiAgcmV0dXJuIChzID8gLTEgOiAxKSAqIG0gKiBNYXRoLnBvdygyLCBlIC0gbUxlbik7XG59O1xuXG5leHBvcnRzLndyaXRlID0gZnVuY3Rpb24oYnVmZmVyLCB2YWx1ZSwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcbiAgdmFyIGUsIG0sIGMsXG4gICAgICBlTGVuID0gbkJ5dGVzICogOCAtIG1MZW4gLSAxLFxuICAgICAgZU1heCA9ICgxIDw8IGVMZW4pIC0gMSxcbiAgICAgIGVCaWFzID0gZU1heCA+PiAxLFxuICAgICAgcnQgPSAobUxlbiA9PT0gMjMgPyBNYXRoLnBvdygyLCAtMjQpIC0gTWF0aC5wb3coMiwgLTc3KSA6IDApLFxuICAgICAgaSA9IGlzTEUgPyAwIDogKG5CeXRlcyAtIDEpLFxuICAgICAgZCA9IGlzTEUgPyAxIDogLTEsXG4gICAgICBzID0gdmFsdWUgPCAwIHx8ICh2YWx1ZSA9PT0gMCAmJiAxIC8gdmFsdWUgPCAwKSA/IDEgOiAwO1xuXG4gIHZhbHVlID0gTWF0aC5hYnModmFsdWUpO1xuXG4gIGlmIChpc05hTih2YWx1ZSkgfHwgdmFsdWUgPT09IEluZmluaXR5KSB7XG4gICAgbSA9IGlzTmFOKHZhbHVlKSA/IDEgOiAwO1xuICAgIGUgPSBlTWF4O1xuICB9IGVsc2Uge1xuICAgIGUgPSBNYXRoLmZsb29yKE1hdGgubG9nKHZhbHVlKSAvIE1hdGguTE4yKTtcbiAgICBpZiAodmFsdWUgKiAoYyA9IE1hdGgucG93KDIsIC1lKSkgPCAxKSB7XG4gICAgICBlLS07XG4gICAgICBjICo9IDI7XG4gICAgfVxuICAgIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgdmFsdWUgKz0gcnQgLyBjO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YWx1ZSArPSBydCAqIE1hdGgucG93KDIsIDEgLSBlQmlhcyk7XG4gICAgfVxuICAgIGlmICh2YWx1ZSAqIGMgPj0gMikge1xuICAgICAgZSsrO1xuICAgICAgYyAvPSAyO1xuICAgIH1cblxuICAgIGlmIChlICsgZUJpYXMgPj0gZU1heCkge1xuICAgICAgbSA9IDA7XG4gICAgICBlID0gZU1heDtcbiAgICB9IGVsc2UgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XG4gICAgICBtID0gKHZhbHVlICogYyAtIDEpICogTWF0aC5wb3coMiwgbUxlbik7XG4gICAgICBlID0gZSArIGVCaWFzO1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gdmFsdWUgKiBNYXRoLnBvdygyLCBlQmlhcyAtIDEpICogTWF0aC5wb3coMiwgbUxlbik7XG4gICAgICBlID0gMDtcbiAgICB9XG4gIH1cblxuICBmb3IgKDsgbUxlbiA+PSA4OyBidWZmZXJbb2Zmc2V0ICsgaV0gPSBtICYgMHhmZiwgaSArPSBkLCBtIC89IDI1NiwgbUxlbiAtPSA4KTtcblxuICBlID0gKGUgPDwgbUxlbikgfCBtO1xuICBlTGVuICs9IG1MZW47XG4gIGZvciAoOyBlTGVuID4gMDsgYnVmZmVyW29mZnNldCArIGldID0gZSAmIDB4ZmYsIGkgKz0gZCwgZSAvPSAyNTYsIGVMZW4gLT0gOCk7XG5cbiAgYnVmZmVyW29mZnNldCArIGkgLSBkXSB8PSBzICogMTI4O1xufTtcbiIsIlxuLyoqXG4gKiBpc0FycmF5XG4gKi9cblxudmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5O1xuXG4vKipcbiAqIHRvU3RyaW5nXG4gKi9cblxudmFyIHN0ciA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbi8qKlxuICogV2hldGhlciBvciBub3QgdGhlIGdpdmVuIGB2YWxgXG4gKiBpcyBhbiBhcnJheS5cbiAqXG4gKiBleGFtcGxlOlxuICpcbiAqICAgICAgICBpc0FycmF5KFtdKTtcbiAqICAgICAgICAvLyA+IHRydWVcbiAqICAgICAgICBpc0FycmF5KGFyZ3VtZW50cyk7XG4gKiAgICAgICAgLy8gPiBmYWxzZVxuICogICAgICAgIGlzQXJyYXkoJycpO1xuICogICAgICAgIC8vID4gZmFsc2VcbiAqXG4gKiBAcGFyYW0ge21peGVkfSB2YWxcbiAqIEByZXR1cm4ge2Jvb2x9XG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBpc0FycmF5IHx8IGZ1bmN0aW9uICh2YWwpIHtcbiAgcmV0dXJuICEhIHZhbCAmJiAnW29iamVjdCBBcnJheV0nID09IHN0ci5jYWxsKHZhbCk7XG59O1xuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHtcbiAgdGhpcy5fZXZlbnRzID0gdGhpcy5fZXZlbnRzIHx8IHt9O1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSB0aGlzLl9tYXhMaXN0ZW5lcnMgfHwgdW5kZWZpbmVkO1xufVxubW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG5cbi8vIEJhY2t3YXJkcy1jb21wYXQgd2l0aCBub2RlIDAuMTAueFxuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlciA9IEV2ZW50RW1pdHRlcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fbWF4TGlzdGVuZXJzID0gdW5kZWZpbmVkO1xuXG4vLyBCeSBkZWZhdWx0IEV2ZW50RW1pdHRlcnMgd2lsbCBwcmludCBhIHdhcm5pbmcgaWYgbW9yZSB0aGFuIDEwIGxpc3RlbmVycyBhcmVcbi8vIGFkZGVkIHRvIGl0LiBUaGlzIGlzIGEgdXNlZnVsIGRlZmF1bHQgd2hpY2ggaGVscHMgZmluZGluZyBtZW1vcnkgbGVha3MuXG5FdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyA9IDEwO1xuXG4vLyBPYnZpb3VzbHkgbm90IGFsbCBFbWl0dGVycyBzaG91bGQgYmUgbGltaXRlZCB0byAxMC4gVGhpcyBmdW5jdGlvbiBhbGxvd3Ncbi8vIHRoYXQgdG8gYmUgaW5jcmVhc2VkLiBTZXQgdG8gemVybyBmb3IgdW5saW1pdGVkLlxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbihuKSB7XG4gIGlmICghaXNOdW1iZXIobikgfHwgbiA8IDAgfHwgaXNOYU4obikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCduIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBlciwgaGFuZGxlciwgbGVuLCBhcmdzLCBpLCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gSWYgdGhlcmUgaXMgbm8gJ2Vycm9yJyBldmVudCBsaXN0ZW5lciB0aGVuIHRocm93LlxuICBpZiAodHlwZSA9PT0gJ2Vycm9yJykge1xuICAgIGlmICghdGhpcy5fZXZlbnRzLmVycm9yIHx8XG4gICAgICAgIChpc09iamVjdCh0aGlzLl9ldmVudHMuZXJyb3IpICYmICF0aGlzLl9ldmVudHMuZXJyb3IubGVuZ3RoKSkge1xuICAgICAgZXIgPSBhcmd1bWVudHNbMV07XG4gICAgICBpZiAoZXIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICB0aHJvdyBlcjsgLy8gVW5oYW5kbGVkICdlcnJvcicgZXZlbnRcbiAgICAgIH1cbiAgICAgIHRocm93IFR5cGVFcnJvcignVW5jYXVnaHQsIHVuc3BlY2lmaWVkIFwiZXJyb3JcIiBldmVudC4nKTtcbiAgICB9XG4gIH1cblxuICBoYW5kbGVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc1VuZGVmaW5lZChoYW5kbGVyKSlcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKGlzRnVuY3Rpb24oaGFuZGxlcikpIHtcbiAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIC8vIGZhc3QgY2FzZXNcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO1xuICAgICAgICBicmVhaztcbiAgICAgIC8vIHNsb3dlclxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICAgICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICBoYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChpc09iamVjdChoYW5kbGVyKSkge1xuICAgIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcblxuICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICBsZW4gPSBsaXN0ZW5lcnMubGVuZ3RoO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKylcbiAgICAgIGxpc3RlbmVyc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBtO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBUbyBhdm9pZCByZWN1cnNpb24gaW4gdGhlIGNhc2UgdGhhdCB0eXBlID09PSBcIm5ld0xpc3RlbmVyXCIhIEJlZm9yZVxuICAvLyBhZGRpbmcgaXQgdG8gdGhlIGxpc3RlbmVycywgZmlyc3QgZW1pdCBcIm5ld0xpc3RlbmVyXCIuXG4gIGlmICh0aGlzLl9ldmVudHMubmV3TGlzdGVuZXIpXG4gICAgdGhpcy5lbWl0KCduZXdMaXN0ZW5lcicsIHR5cGUsXG4gICAgICAgICAgICAgIGlzRnVuY3Rpb24obGlzdGVuZXIubGlzdGVuZXIpID9cbiAgICAgICAgICAgICAgbGlzdGVuZXIubGlzdGVuZXIgOiBsaXN0ZW5lcik7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgLy8gT3B0aW1pemUgdGhlIGNhc2Ugb2Ygb25lIGxpc3RlbmVyLiBEb24ndCBuZWVkIHRoZSBleHRyYSBhcnJheSBvYmplY3QuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gbGlzdGVuZXI7XG4gIGVsc2UgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgLy8gSWYgd2UndmUgYWxyZWFkeSBnb3QgYW4gYXJyYXksIGp1c3QgYXBwZW5kLlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5wdXNoKGxpc3RlbmVyKTtcbiAgZWxzZVxuICAgIC8vIEFkZGluZyB0aGUgc2Vjb25kIGVsZW1lbnQsIG5lZWQgdG8gY2hhbmdlIHRvIGFycmF5LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IFt0aGlzLl9ldmVudHNbdHlwZV0sIGxpc3RlbmVyXTtcblxuICAvLyBDaGVjayBmb3IgbGlzdGVuZXIgbGVha1xuICBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSAmJiAhdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCkge1xuICAgIHZhciBtO1xuICAgIGlmICghaXNVbmRlZmluZWQodGhpcy5fbWF4TGlzdGVuZXJzKSkge1xuICAgICAgbSA9IHRoaXMuX21heExpc3RlbmVycztcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzO1xuICAgIH1cblxuICAgIGlmIChtICYmIG0gPiAwICYmIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGggPiBtKSB7XG4gICAgICB0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkID0gdHJ1ZTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJyhub2RlKSB3YXJuaW5nOiBwb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5ICcgK1xuICAgICAgICAgICAgICAgICAgICAnbGVhayBkZXRlY3RlZC4gJWQgbGlzdGVuZXJzIGFkZGVkLiAnICtcbiAgICAgICAgICAgICAgICAgICAgJ1VzZSBlbWl0dGVyLnNldE1heExpc3RlbmVycygpIHRvIGluY3JlYXNlIGxpbWl0LicsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGgpO1xuICAgICAgaWYgKHR5cGVvZiBjb25zb2xlLnRyYWNlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIG5vdCBzdXBwb3J0ZWQgaW4gSUUgMTBcbiAgICAgICAgY29uc29sZS50cmFjZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICB2YXIgZmlyZWQgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBnKCkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgZyk7XG5cbiAgICBpZiAoIWZpcmVkKSB7XG4gICAgICBmaXJlZCA9IHRydWU7XG4gICAgICBsaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfVxuXG4gIGcubGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgdGhpcy5vbih0eXBlLCBnKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIGVtaXRzIGEgJ3JlbW92ZUxpc3RlbmVyJyBldmVudCBpZmYgdGhlIGxpc3RlbmVyIHdhcyByZW1vdmVkXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIGxpc3QsIHBvc2l0aW9uLCBsZW5ndGgsIGk7XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgbGlzdCA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgbGVuZ3RoID0gbGlzdC5sZW5ndGg7XG4gIHBvc2l0aW9uID0gLTE7XG5cbiAgaWYgKGxpc3QgPT09IGxpc3RlbmVyIHx8XG4gICAgICAoaXNGdW5jdGlvbihsaXN0Lmxpc3RlbmVyKSAmJiBsaXN0Lmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuXG4gIH0gZWxzZSBpZiAoaXNPYmplY3QobGlzdCkpIHtcbiAgICBmb3IgKGkgPSBsZW5ndGg7IGktLSA+IDA7KSB7XG4gICAgICBpZiAobGlzdFtpXSA9PT0gbGlzdGVuZXIgfHxcbiAgICAgICAgICAobGlzdFtpXS5saXN0ZW5lciAmJiBsaXN0W2ldLmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICAgICAgcG9zaXRpb24gPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocG9zaXRpb24gPCAwKVxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICBpZiAobGlzdC5sZW5ndGggPT09IDEpIHtcbiAgICAgIGxpc3QubGVuZ3RoID0gMDtcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpc3Quc3BsaWNlKHBvc2l0aW9uLCAxKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBrZXksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICByZXR1cm4gdGhpcztcblxuICAvLyBub3QgbGlzdGVuaW5nIGZvciByZW1vdmVMaXN0ZW5lciwgbm8gbmVlZCB0byBlbWl0XG4gIGlmICghdGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApXG4gICAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICBlbHNlIGlmICh0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gZW1pdCByZW1vdmVMaXN0ZW5lciBmb3IgYWxsIGxpc3RlbmVycyBvbiBhbGwgZXZlbnRzXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgZm9yIChrZXkgaW4gdGhpcy5fZXZlbnRzKSB7XG4gICAgICBpZiAoa2V5ID09PSAncmVtb3ZlTGlzdGVuZXInKSBjb250aW51ZTtcbiAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKGtleSk7XG4gICAgfVxuICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCdyZW1vdmVMaXN0ZW5lcicpO1xuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGxpc3RlbmVycykpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVycyk7XG4gIH0gZWxzZSB7XG4gICAgLy8gTElGTyBvcmRlclxuICAgIHdoaWxlIChsaXN0ZW5lcnMubGVuZ3RoKVxuICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnNbbGlzdGVuZXJzLmxlbmd0aCAtIDFdKTtcbiAgfVxuICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gW107XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24odGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSBbdGhpcy5fZXZlbnRzW3R5cGVdXTtcbiAgZWxzZVxuICAgIHJldCA9IHRoaXMuX2V2ZW50c1t0eXBlXS5zbGljZSgpO1xuICByZXR1cm4gcmV0O1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghZW1pdHRlci5fZXZlbnRzIHx8ICFlbWl0dGVyLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gMDtcbiAgZWxzZSBpZiAoaXNGdW5jdGlvbihlbWl0dGVyLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IDE7XG4gIGVsc2VcbiAgICByZXQgPSBlbWl0dGVyLl9ldmVudHNbdHlwZV0ubGVuZ3RoO1xuICByZXR1cm4gcmV0O1xufTtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xufVxuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuIiwiaWYgKHR5cGVvZiBPYmplY3QuY3JlYXRlID09PSAnZnVuY3Rpb24nKSB7XG4gIC8vIGltcGxlbWVudGF0aW9uIGZyb20gc3RhbmRhcmQgbm9kZS5qcyAndXRpbCcgbW9kdWxlXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICBjdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDdG9yLnByb3RvdHlwZSwge1xuICAgICAgY29uc3RydWN0b3I6IHtcbiAgICAgICAgdmFsdWU6IGN0b3IsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICB9XG4gICAgfSk7XG4gIH07XG59IGVsc2Uge1xuICAvLyBvbGQgc2Nob29sIHNoaW0gZm9yIG9sZCBicm93c2Vyc1xuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgdmFyIFRlbXBDdG9yID0gZnVuY3Rpb24gKCkge31cbiAgICBUZW1wQ3Rvci5wcm90b3R5cGUgPSBzdXBlckN0b3IucHJvdG90eXBlXG4gICAgY3Rvci5wcm90b3R5cGUgPSBuZXcgVGVtcEN0b3IoKVxuICAgIGN0b3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gY3RvclxuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKGFycikge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGFycikgPT0gJ1tvYmplY3QgQXJyYXldJztcbn07XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IHRydWU7XG4gICAgdmFyIGN1cnJlbnRRdWV1ZTtcbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgdmFyIGkgPSAtMTtcbiAgICAgICAgd2hpbGUgKCsraSA8IGxlbikge1xuICAgICAgICAgICAgY3VycmVudFF1ZXVlW2ldKCk7XG4gICAgICAgIH1cbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xufVxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICBxdWV1ZS5wdXNoKGZ1bik7XG4gICAgaWYgKCFkcmFpbmluZykge1xuICAgICAgICBzZXRUaW1lb3V0KGRyYWluUXVldWUsIDApO1xuICAgIH1cbn07XG5cbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiLi9saWIvX3N0cmVhbV9kdXBsZXguanNcIilcbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4vLyBhIGR1cGxleCBzdHJlYW0gaXMganVzdCBhIHN0cmVhbSB0aGF0IGlzIGJvdGggcmVhZGFibGUgYW5kIHdyaXRhYmxlLlxuLy8gU2luY2UgSlMgZG9lc24ndCBoYXZlIG11bHRpcGxlIHByb3RvdHlwYWwgaW5oZXJpdGFuY2UsIHRoaXMgY2xhc3Ncbi8vIHByb3RvdHlwYWxseSBpbmhlcml0cyBmcm9tIFJlYWRhYmxlLCBhbmQgdGhlbiBwYXJhc2l0aWNhbGx5IGZyb21cbi8vIFdyaXRhYmxlLlxuXG5tb2R1bGUuZXhwb3J0cyA9IER1cGxleDtcblxuLyo8cmVwbGFjZW1lbnQ+Ki9cbnZhciBvYmplY3RLZXlzID0gT2JqZWN0LmtleXMgfHwgZnVuY3Rpb24gKG9iaikge1xuICB2YXIga2V5cyA9IFtdO1xuICBmb3IgKHZhciBrZXkgaW4gb2JqKSBrZXlzLnB1c2goa2V5KTtcbiAgcmV0dXJuIGtleXM7XG59XG4vKjwvcmVwbGFjZW1lbnQ+Ki9cblxuXG4vKjxyZXBsYWNlbWVudD4qL1xudmFyIHV0aWwgPSByZXF1aXJlKCdjb3JlLXV0aWwtaXMnKTtcbnV0aWwuaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpO1xuLyo8L3JlcGxhY2VtZW50PiovXG5cbnZhciBSZWFkYWJsZSA9IHJlcXVpcmUoJy4vX3N0cmVhbV9yZWFkYWJsZScpO1xudmFyIFdyaXRhYmxlID0gcmVxdWlyZSgnLi9fc3RyZWFtX3dyaXRhYmxlJyk7XG5cbnV0aWwuaW5oZXJpdHMoRHVwbGV4LCBSZWFkYWJsZSk7XG5cbmZvckVhY2gob2JqZWN0S2V5cyhXcml0YWJsZS5wcm90b3R5cGUpLCBmdW5jdGlvbihtZXRob2QpIHtcbiAgaWYgKCFEdXBsZXgucHJvdG90eXBlW21ldGhvZF0pXG4gICAgRHVwbGV4LnByb3RvdHlwZVttZXRob2RdID0gV3JpdGFibGUucHJvdG90eXBlW21ldGhvZF07XG59KTtcblxuZnVuY3Rpb24gRHVwbGV4KG9wdGlvbnMpIHtcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIER1cGxleCkpXG4gICAgcmV0dXJuIG5ldyBEdXBsZXgob3B0aW9ucyk7XG5cbiAgUmVhZGFibGUuY2FsbCh0aGlzLCBvcHRpb25zKTtcbiAgV3JpdGFibGUuY2FsbCh0aGlzLCBvcHRpb25zKTtcblxuICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLnJlYWRhYmxlID09PSBmYWxzZSlcbiAgICB0aGlzLnJlYWRhYmxlID0gZmFsc2U7XG5cbiAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy53cml0YWJsZSA9PT0gZmFsc2UpXG4gICAgdGhpcy53cml0YWJsZSA9IGZhbHNlO1xuXG4gIHRoaXMuYWxsb3dIYWxmT3BlbiA9IHRydWU7XG4gIGlmIChvcHRpb25zICYmIG9wdGlvbnMuYWxsb3dIYWxmT3BlbiA9PT0gZmFsc2UpXG4gICAgdGhpcy5hbGxvd0hhbGZPcGVuID0gZmFsc2U7XG5cbiAgdGhpcy5vbmNlKCdlbmQnLCBvbmVuZCk7XG59XG5cbi8vIHRoZSBuby1oYWxmLW9wZW4gZW5mb3JjZXJcbmZ1bmN0aW9uIG9uZW5kKCkge1xuICAvLyBpZiB3ZSBhbGxvdyBoYWxmLW9wZW4gc3RhdGUsIG9yIGlmIHRoZSB3cml0YWJsZSBzaWRlIGVuZGVkLFxuICAvLyB0aGVuIHdlJ3JlIG9rLlxuICBpZiAodGhpcy5hbGxvd0hhbGZPcGVuIHx8IHRoaXMuX3dyaXRhYmxlU3RhdGUuZW5kZWQpXG4gICAgcmV0dXJuO1xuXG4gIC8vIG5vIG1vcmUgZGF0YSBjYW4gYmUgd3JpdHRlbi5cbiAgLy8gQnV0IGFsbG93IG1vcmUgd3JpdGVzIHRvIGhhcHBlbiBpbiB0aGlzIHRpY2suXG4gIHByb2Nlc3MubmV4dFRpY2sodGhpcy5lbmQuYmluZCh0aGlzKSk7XG59XG5cbmZ1bmN0aW9uIGZvckVhY2ggKHhzLCBmKSB7XG4gIGZvciAodmFyIGkgPSAwLCBsID0geHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgZih4c1tpXSwgaSk7XG4gIH1cbn1cbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4vLyBhIHBhc3N0aHJvdWdoIHN0cmVhbS5cbi8vIGJhc2ljYWxseSBqdXN0IHRoZSBtb3N0IG1pbmltYWwgc29ydCBvZiBUcmFuc2Zvcm0gc3RyZWFtLlxuLy8gRXZlcnkgd3JpdHRlbiBjaHVuayBnZXRzIG91dHB1dCBhcy1pcy5cblxubW9kdWxlLmV4cG9ydHMgPSBQYXNzVGhyb3VnaDtcblxudmFyIFRyYW5zZm9ybSA9IHJlcXVpcmUoJy4vX3N0cmVhbV90cmFuc2Zvcm0nKTtcblxuLyo8cmVwbGFjZW1lbnQ+Ki9cbnZhciB1dGlsID0gcmVxdWlyZSgnY29yZS11dGlsLWlzJyk7XG51dGlsLmluaGVyaXRzID0gcmVxdWlyZSgnaW5oZXJpdHMnKTtcbi8qPC9yZXBsYWNlbWVudD4qL1xuXG51dGlsLmluaGVyaXRzKFBhc3NUaHJvdWdoLCBUcmFuc2Zvcm0pO1xuXG5mdW5jdGlvbiBQYXNzVGhyb3VnaChvcHRpb25zKSB7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBQYXNzVGhyb3VnaCkpXG4gICAgcmV0dXJuIG5ldyBQYXNzVGhyb3VnaChvcHRpb25zKTtcblxuICBUcmFuc2Zvcm0uY2FsbCh0aGlzLCBvcHRpb25zKTtcbn1cblxuUGFzc1Rocm91Z2gucHJvdG90eXBlLl90cmFuc2Zvcm0gPSBmdW5jdGlvbihjaHVuaywgZW5jb2RpbmcsIGNiKSB7XG4gIGNiKG51bGwsIGNodW5rKTtcbn07XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxubW9kdWxlLmV4cG9ydHMgPSBSZWFkYWJsZTtcblxuLyo8cmVwbGFjZW1lbnQ+Ki9cbnZhciBpc0FycmF5ID0gcmVxdWlyZSgnaXNhcnJheScpO1xuLyo8L3JlcGxhY2VtZW50PiovXG5cblxuLyo8cmVwbGFjZW1lbnQ+Ki9cbnZhciBCdWZmZXIgPSByZXF1aXJlKCdidWZmZXInKS5CdWZmZXI7XG4vKjwvcmVwbGFjZW1lbnQ+Ki9cblxuUmVhZGFibGUuUmVhZGFibGVTdGF0ZSA9IFJlYWRhYmxlU3RhdGU7XG5cbnZhciBFRSA9IHJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlcjtcblxuLyo8cmVwbGFjZW1lbnQ+Ki9cbmlmICghRUUubGlzdGVuZXJDb3VudCkgRUUubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKGVtaXR0ZXIsIHR5cGUpIHtcbiAgcmV0dXJuIGVtaXR0ZXIubGlzdGVuZXJzKHR5cGUpLmxlbmd0aDtcbn07XG4vKjwvcmVwbGFjZW1lbnQ+Ki9cblxudmFyIFN0cmVhbSA9IHJlcXVpcmUoJ3N0cmVhbScpO1xuXG4vKjxyZXBsYWNlbWVudD4qL1xudmFyIHV0aWwgPSByZXF1aXJlKCdjb3JlLXV0aWwtaXMnKTtcbnV0aWwuaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpO1xuLyo8L3JlcGxhY2VtZW50PiovXG5cbnZhciBTdHJpbmdEZWNvZGVyO1xuXG5cbi8qPHJlcGxhY2VtZW50PiovXG52YXIgZGVidWcgPSByZXF1aXJlKCd1dGlsJyk7XG5pZiAoZGVidWcgJiYgZGVidWcuZGVidWdsb2cpIHtcbiAgZGVidWcgPSBkZWJ1Zy5kZWJ1Z2xvZygnc3RyZWFtJyk7XG59IGVsc2Uge1xuICBkZWJ1ZyA9IGZ1bmN0aW9uICgpIHt9O1xufVxuLyo8L3JlcGxhY2VtZW50PiovXG5cblxudXRpbC5pbmhlcml0cyhSZWFkYWJsZSwgU3RyZWFtKTtcblxuZnVuY3Rpb24gUmVhZGFibGVTdGF0ZShvcHRpb25zLCBzdHJlYW0pIHtcbiAgdmFyIER1cGxleCA9IHJlcXVpcmUoJy4vX3N0cmVhbV9kdXBsZXgnKTtcblxuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAvLyB0aGUgcG9pbnQgYXQgd2hpY2ggaXQgc3RvcHMgY2FsbGluZyBfcmVhZCgpIHRvIGZpbGwgdGhlIGJ1ZmZlclxuICAvLyBOb3RlOiAwIGlzIGEgdmFsaWQgdmFsdWUsIG1lYW5zIFwiZG9uJ3QgY2FsbCBfcmVhZCBwcmVlbXB0aXZlbHkgZXZlclwiXG4gIHZhciBod20gPSBvcHRpb25zLmhpZ2hXYXRlck1hcms7XG4gIHZhciBkZWZhdWx0SHdtID0gb3B0aW9ucy5vYmplY3RNb2RlID8gMTYgOiAxNiAqIDEwMjQ7XG4gIHRoaXMuaGlnaFdhdGVyTWFyayA9IChod20gfHwgaHdtID09PSAwKSA/IGh3bSA6IGRlZmF1bHRId207XG5cbiAgLy8gY2FzdCB0byBpbnRzLlxuICB0aGlzLmhpZ2hXYXRlck1hcmsgPSB+fnRoaXMuaGlnaFdhdGVyTWFyaztcblxuICB0aGlzLmJ1ZmZlciA9IFtdO1xuICB0aGlzLmxlbmd0aCA9IDA7XG4gIHRoaXMucGlwZXMgPSBudWxsO1xuICB0aGlzLnBpcGVzQ291bnQgPSAwO1xuICB0aGlzLmZsb3dpbmcgPSBudWxsO1xuICB0aGlzLmVuZGVkID0gZmFsc2U7XG4gIHRoaXMuZW5kRW1pdHRlZCA9IGZhbHNlO1xuICB0aGlzLnJlYWRpbmcgPSBmYWxzZTtcblxuICAvLyBhIGZsYWcgdG8gYmUgYWJsZSB0byB0ZWxsIGlmIHRoZSBvbndyaXRlIGNiIGlzIGNhbGxlZCBpbW1lZGlhdGVseSxcbiAgLy8gb3Igb24gYSBsYXRlciB0aWNrLiAgV2Ugc2V0IHRoaXMgdG8gdHJ1ZSBhdCBmaXJzdCwgYmVjYXVzZSBhbnlcbiAgLy8gYWN0aW9ucyB0aGF0IHNob3VsZG4ndCBoYXBwZW4gdW50aWwgXCJsYXRlclwiIHNob3VsZCBnZW5lcmFsbHkgYWxzb1xuICAvLyBub3QgaGFwcGVuIGJlZm9yZSB0aGUgZmlyc3Qgd3JpdGUgY2FsbC5cbiAgdGhpcy5zeW5jID0gdHJ1ZTtcblxuICAvLyB3aGVuZXZlciB3ZSByZXR1cm4gbnVsbCwgdGhlbiB3ZSBzZXQgYSBmbGFnIHRvIHNheVxuICAvLyB0aGF0IHdlJ3JlIGF3YWl0aW5nIGEgJ3JlYWRhYmxlJyBldmVudCBlbWlzc2lvbi5cbiAgdGhpcy5uZWVkUmVhZGFibGUgPSBmYWxzZTtcbiAgdGhpcy5lbWl0dGVkUmVhZGFibGUgPSBmYWxzZTtcbiAgdGhpcy5yZWFkYWJsZUxpc3RlbmluZyA9IGZhbHNlO1xuXG5cbiAgLy8gb2JqZWN0IHN0cmVhbSBmbGFnLiBVc2VkIHRvIG1ha2UgcmVhZChuKSBpZ25vcmUgbiBhbmQgdG9cbiAgLy8gbWFrZSBhbGwgdGhlIGJ1ZmZlciBtZXJnaW5nIGFuZCBsZW5ndGggY2hlY2tzIGdvIGF3YXlcbiAgdGhpcy5vYmplY3RNb2RlID0gISFvcHRpb25zLm9iamVjdE1vZGU7XG5cbiAgaWYgKHN0cmVhbSBpbnN0YW5jZW9mIER1cGxleClcbiAgICB0aGlzLm9iamVjdE1vZGUgPSB0aGlzLm9iamVjdE1vZGUgfHwgISFvcHRpb25zLnJlYWRhYmxlT2JqZWN0TW9kZTtcblxuICAvLyBDcnlwdG8gaXMga2luZCBvZiBvbGQgYW5kIGNydXN0eS4gIEhpc3RvcmljYWxseSwgaXRzIGRlZmF1bHQgc3RyaW5nXG4gIC8vIGVuY29kaW5nIGlzICdiaW5hcnknIHNvIHdlIGhhdmUgdG8gbWFrZSB0aGlzIGNvbmZpZ3VyYWJsZS5cbiAgLy8gRXZlcnl0aGluZyBlbHNlIGluIHRoZSB1bml2ZXJzZSB1c2VzICd1dGY4JywgdGhvdWdoLlxuICB0aGlzLmRlZmF1bHRFbmNvZGluZyA9IG9wdGlvbnMuZGVmYXVsdEVuY29kaW5nIHx8ICd1dGY4JztcblxuICAvLyB3aGVuIHBpcGluZywgd2Ugb25seSBjYXJlIGFib3V0ICdyZWFkYWJsZScgZXZlbnRzIHRoYXQgaGFwcGVuXG4gIC8vIGFmdGVyIHJlYWQoKWluZyBhbGwgdGhlIGJ5dGVzIGFuZCBub3QgZ2V0dGluZyBhbnkgcHVzaGJhY2suXG4gIHRoaXMucmFuT3V0ID0gZmFsc2U7XG5cbiAgLy8gdGhlIG51bWJlciBvZiB3cml0ZXJzIHRoYXQgYXJlIGF3YWl0aW5nIGEgZHJhaW4gZXZlbnQgaW4gLnBpcGUoKXNcbiAgdGhpcy5hd2FpdERyYWluID0gMDtcblxuICAvLyBpZiB0cnVlLCBhIG1heWJlUmVhZE1vcmUgaGFzIGJlZW4gc2NoZWR1bGVkXG4gIHRoaXMucmVhZGluZ01vcmUgPSBmYWxzZTtcblxuICB0aGlzLmRlY29kZXIgPSBudWxsO1xuICB0aGlzLmVuY29kaW5nID0gbnVsbDtcbiAgaWYgKG9wdGlvbnMuZW5jb2RpbmcpIHtcbiAgICBpZiAoIVN0cmluZ0RlY29kZXIpXG4gICAgICBTdHJpbmdEZWNvZGVyID0gcmVxdWlyZSgnc3RyaW5nX2RlY29kZXIvJykuU3RyaW5nRGVjb2RlcjtcbiAgICB0aGlzLmRlY29kZXIgPSBuZXcgU3RyaW5nRGVjb2RlcihvcHRpb25zLmVuY29kaW5nKTtcbiAgICB0aGlzLmVuY29kaW5nID0gb3B0aW9ucy5lbmNvZGluZztcbiAgfVxufVxuXG5mdW5jdGlvbiBSZWFkYWJsZShvcHRpb25zKSB7XG4gIHZhciBEdXBsZXggPSByZXF1aXJlKCcuL19zdHJlYW1fZHVwbGV4Jyk7XG5cbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFJlYWRhYmxlKSlcbiAgICByZXR1cm4gbmV3IFJlYWRhYmxlKG9wdGlvbnMpO1xuXG4gIHRoaXMuX3JlYWRhYmxlU3RhdGUgPSBuZXcgUmVhZGFibGVTdGF0ZShvcHRpb25zLCB0aGlzKTtcblxuICAvLyBsZWdhY3lcbiAgdGhpcy5yZWFkYWJsZSA9IHRydWU7XG5cbiAgU3RyZWFtLmNhbGwodGhpcyk7XG59XG5cbi8vIE1hbnVhbGx5IHNob3ZlIHNvbWV0aGluZyBpbnRvIHRoZSByZWFkKCkgYnVmZmVyLlxuLy8gVGhpcyByZXR1cm5zIHRydWUgaWYgdGhlIGhpZ2hXYXRlck1hcmsgaGFzIG5vdCBiZWVuIGhpdCB5ZXQsXG4vLyBzaW1pbGFyIHRvIGhvdyBXcml0YWJsZS53cml0ZSgpIHJldHVybnMgdHJ1ZSBpZiB5b3Ugc2hvdWxkXG4vLyB3cml0ZSgpIHNvbWUgbW9yZS5cblJlYWRhYmxlLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24oY2h1bmssIGVuY29kaW5nKSB7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX3JlYWRhYmxlU3RhdGU7XG5cbiAgaWYgKHV0aWwuaXNTdHJpbmcoY2h1bmspICYmICFzdGF0ZS5vYmplY3RNb2RlKSB7XG4gICAgZW5jb2RpbmcgPSBlbmNvZGluZyB8fCBzdGF0ZS5kZWZhdWx0RW5jb2Rpbmc7XG4gICAgaWYgKGVuY29kaW5nICE9PSBzdGF0ZS5lbmNvZGluZykge1xuICAgICAgY2h1bmsgPSBuZXcgQnVmZmVyKGNodW5rLCBlbmNvZGluZyk7XG4gICAgICBlbmNvZGluZyA9ICcnO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZWFkYWJsZUFkZENodW5rKHRoaXMsIHN0YXRlLCBjaHVuaywgZW5jb2RpbmcsIGZhbHNlKTtcbn07XG5cbi8vIFVuc2hpZnQgc2hvdWxkICphbHdheXMqIGJlIHNvbWV0aGluZyBkaXJlY3RseSBvdXQgb2YgcmVhZCgpXG5SZWFkYWJsZS5wcm90b3R5cGUudW5zaGlmdCA9IGZ1bmN0aW9uKGNodW5rKSB7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX3JlYWRhYmxlU3RhdGU7XG4gIHJldHVybiByZWFkYWJsZUFkZENodW5rKHRoaXMsIHN0YXRlLCBjaHVuaywgJycsIHRydWUpO1xufTtcblxuZnVuY3Rpb24gcmVhZGFibGVBZGRDaHVuayhzdHJlYW0sIHN0YXRlLCBjaHVuaywgZW5jb2RpbmcsIGFkZFRvRnJvbnQpIHtcbiAgdmFyIGVyID0gY2h1bmtJbnZhbGlkKHN0YXRlLCBjaHVuayk7XG4gIGlmIChlcikge1xuICAgIHN0cmVhbS5lbWl0KCdlcnJvcicsIGVyKTtcbiAgfSBlbHNlIGlmICh1dGlsLmlzTnVsbE9yVW5kZWZpbmVkKGNodW5rKSkge1xuICAgIHN0YXRlLnJlYWRpbmcgPSBmYWxzZTtcbiAgICBpZiAoIXN0YXRlLmVuZGVkKVxuICAgICAgb25Fb2ZDaHVuayhzdHJlYW0sIHN0YXRlKTtcbiAgfSBlbHNlIGlmIChzdGF0ZS5vYmplY3RNb2RlIHx8IGNodW5rICYmIGNodW5rLmxlbmd0aCA+IDApIHtcbiAgICBpZiAoc3RhdGUuZW5kZWQgJiYgIWFkZFRvRnJvbnQpIHtcbiAgICAgIHZhciBlID0gbmV3IEVycm9yKCdzdHJlYW0ucHVzaCgpIGFmdGVyIEVPRicpO1xuICAgICAgc3RyZWFtLmVtaXQoJ2Vycm9yJywgZSk7XG4gICAgfSBlbHNlIGlmIChzdGF0ZS5lbmRFbWl0dGVkICYmIGFkZFRvRnJvbnQpIHtcbiAgICAgIHZhciBlID0gbmV3IEVycm9yKCdzdHJlYW0udW5zaGlmdCgpIGFmdGVyIGVuZCBldmVudCcpO1xuICAgICAgc3RyZWFtLmVtaXQoJ2Vycm9yJywgZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChzdGF0ZS5kZWNvZGVyICYmICFhZGRUb0Zyb250ICYmICFlbmNvZGluZylcbiAgICAgICAgY2h1bmsgPSBzdGF0ZS5kZWNvZGVyLndyaXRlKGNodW5rKTtcblxuICAgICAgaWYgKCFhZGRUb0Zyb250KVxuICAgICAgICBzdGF0ZS5yZWFkaW5nID0gZmFsc2U7XG5cbiAgICAgIC8vIGlmIHdlIHdhbnQgdGhlIGRhdGEgbm93LCBqdXN0IGVtaXQgaXQuXG4gICAgICBpZiAoc3RhdGUuZmxvd2luZyAmJiBzdGF0ZS5sZW5ndGggPT09IDAgJiYgIXN0YXRlLnN5bmMpIHtcbiAgICAgICAgc3RyZWFtLmVtaXQoJ2RhdGEnLCBjaHVuayk7XG4gICAgICAgIHN0cmVhbS5yZWFkKDApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gdXBkYXRlIHRoZSBidWZmZXIgaW5mby5cbiAgICAgICAgc3RhdGUubGVuZ3RoICs9IHN0YXRlLm9iamVjdE1vZGUgPyAxIDogY2h1bmsubGVuZ3RoO1xuICAgICAgICBpZiAoYWRkVG9Gcm9udClcbiAgICAgICAgICBzdGF0ZS5idWZmZXIudW5zaGlmdChjaHVuayk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICBzdGF0ZS5idWZmZXIucHVzaChjaHVuayk7XG5cbiAgICAgICAgaWYgKHN0YXRlLm5lZWRSZWFkYWJsZSlcbiAgICAgICAgICBlbWl0UmVhZGFibGUoc3RyZWFtKTtcbiAgICAgIH1cblxuICAgICAgbWF5YmVSZWFkTW9yZShzdHJlYW0sIHN0YXRlKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoIWFkZFRvRnJvbnQpIHtcbiAgICBzdGF0ZS5yZWFkaW5nID0gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gbmVlZE1vcmVEYXRhKHN0YXRlKTtcbn1cblxuXG5cbi8vIGlmIGl0J3MgcGFzdCB0aGUgaGlnaCB3YXRlciBtYXJrLCB3ZSBjYW4gcHVzaCBpbiBzb21lIG1vcmUuXG4vLyBBbHNvLCBpZiB3ZSBoYXZlIG5vIGRhdGEgeWV0LCB3ZSBjYW4gc3RhbmQgc29tZVxuLy8gbW9yZSBieXRlcy4gIFRoaXMgaXMgdG8gd29yayBhcm91bmQgY2FzZXMgd2hlcmUgaHdtPTAsXG4vLyBzdWNoIGFzIHRoZSByZXBsLiAgQWxzbywgaWYgdGhlIHB1c2goKSB0cmlnZ2VyZWQgYVxuLy8gcmVhZGFibGUgZXZlbnQsIGFuZCB0aGUgdXNlciBjYWxsZWQgcmVhZChsYXJnZU51bWJlcikgc3VjaCB0aGF0XG4vLyBuZWVkUmVhZGFibGUgd2FzIHNldCwgdGhlbiB3ZSBvdWdodCB0byBwdXNoIG1vcmUsIHNvIHRoYXQgYW5vdGhlclxuLy8gJ3JlYWRhYmxlJyBldmVudCB3aWxsIGJlIHRyaWdnZXJlZC5cbmZ1bmN0aW9uIG5lZWRNb3JlRGF0YShzdGF0ZSkge1xuICByZXR1cm4gIXN0YXRlLmVuZGVkICYmXG4gICAgICAgICAoc3RhdGUubmVlZFJlYWRhYmxlIHx8XG4gICAgICAgICAgc3RhdGUubGVuZ3RoIDwgc3RhdGUuaGlnaFdhdGVyTWFyayB8fFxuICAgICAgICAgIHN0YXRlLmxlbmd0aCA9PT0gMCk7XG59XG5cbi8vIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5LlxuUmVhZGFibGUucHJvdG90eXBlLnNldEVuY29kaW5nID0gZnVuY3Rpb24oZW5jKSB7XG4gIGlmICghU3RyaW5nRGVjb2RlcilcbiAgICBTdHJpbmdEZWNvZGVyID0gcmVxdWlyZSgnc3RyaW5nX2RlY29kZXIvJykuU3RyaW5nRGVjb2RlcjtcbiAgdGhpcy5fcmVhZGFibGVTdGF0ZS5kZWNvZGVyID0gbmV3IFN0cmluZ0RlY29kZXIoZW5jKTtcbiAgdGhpcy5fcmVhZGFibGVTdGF0ZS5lbmNvZGluZyA9IGVuYztcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBEb24ndCByYWlzZSB0aGUgaHdtID4gMTI4TUJcbnZhciBNQVhfSFdNID0gMHg4MDAwMDA7XG5mdW5jdGlvbiByb3VuZFVwVG9OZXh0UG93ZXJPZjIobikge1xuICBpZiAobiA+PSBNQVhfSFdNKSB7XG4gICAgbiA9IE1BWF9IV007XG4gIH0gZWxzZSB7XG4gICAgLy8gR2V0IHRoZSBuZXh0IGhpZ2hlc3QgcG93ZXIgb2YgMlxuICAgIG4tLTtcbiAgICBmb3IgKHZhciBwID0gMTsgcCA8IDMyOyBwIDw8PSAxKSBuIHw9IG4gPj4gcDtcbiAgICBuKys7XG4gIH1cbiAgcmV0dXJuIG47XG59XG5cbmZ1bmN0aW9uIGhvd011Y2hUb1JlYWQobiwgc3RhdGUpIHtcbiAgaWYgKHN0YXRlLmxlbmd0aCA9PT0gMCAmJiBzdGF0ZS5lbmRlZClcbiAgICByZXR1cm4gMDtcblxuICBpZiAoc3RhdGUub2JqZWN0TW9kZSlcbiAgICByZXR1cm4gbiA9PT0gMCA/IDAgOiAxO1xuXG4gIGlmIChpc05hTihuKSB8fCB1dGlsLmlzTnVsbChuKSkge1xuICAgIC8vIG9ubHkgZmxvdyBvbmUgYnVmZmVyIGF0IGEgdGltZVxuICAgIGlmIChzdGF0ZS5mbG93aW5nICYmIHN0YXRlLmJ1ZmZlci5sZW5ndGgpXG4gICAgICByZXR1cm4gc3RhdGUuYnVmZmVyWzBdLmxlbmd0aDtcbiAgICBlbHNlXG4gICAgICByZXR1cm4gc3RhdGUubGVuZ3RoO1xuICB9XG5cbiAgaWYgKG4gPD0gMClcbiAgICByZXR1cm4gMDtcblxuICAvLyBJZiB3ZSdyZSBhc2tpbmcgZm9yIG1vcmUgdGhhbiB0aGUgdGFyZ2V0IGJ1ZmZlciBsZXZlbCxcbiAgLy8gdGhlbiByYWlzZSB0aGUgd2F0ZXIgbWFyay4gIEJ1bXAgdXAgdG8gdGhlIG5leHQgaGlnaGVzdFxuICAvLyBwb3dlciBvZiAyLCB0byBwcmV2ZW50IGluY3JlYXNpbmcgaXQgZXhjZXNzaXZlbHkgaW4gdGlueVxuICAvLyBhbW91bnRzLlxuICBpZiAobiA+IHN0YXRlLmhpZ2hXYXRlck1hcmspXG4gICAgc3RhdGUuaGlnaFdhdGVyTWFyayA9IHJvdW5kVXBUb05leHRQb3dlck9mMihuKTtcblxuICAvLyBkb24ndCBoYXZlIHRoYXQgbXVjaC4gIHJldHVybiBudWxsLCB1bmxlc3Mgd2UndmUgZW5kZWQuXG4gIGlmIChuID4gc3RhdGUubGVuZ3RoKSB7XG4gICAgaWYgKCFzdGF0ZS5lbmRlZCkge1xuICAgICAgc3RhdGUubmVlZFJlYWRhYmxlID0gdHJ1ZTtcbiAgICAgIHJldHVybiAwO1xuICAgIH0gZWxzZVxuICAgICAgcmV0dXJuIHN0YXRlLmxlbmd0aDtcbiAgfVxuXG4gIHJldHVybiBuO1xufVxuXG4vLyB5b3UgY2FuIG92ZXJyaWRlIGVpdGhlciB0aGlzIG1ldGhvZCwgb3IgdGhlIGFzeW5jIF9yZWFkKG4pIGJlbG93LlxuUmVhZGFibGUucHJvdG90eXBlLnJlYWQgPSBmdW5jdGlvbihuKSB7XG4gIGRlYnVnKCdyZWFkJywgbik7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX3JlYWRhYmxlU3RhdGU7XG4gIHZhciBuT3JpZyA9IG47XG5cbiAgaWYgKCF1dGlsLmlzTnVtYmVyKG4pIHx8IG4gPiAwKVxuICAgIHN0YXRlLmVtaXR0ZWRSZWFkYWJsZSA9IGZhbHNlO1xuXG4gIC8vIGlmIHdlJ3JlIGRvaW5nIHJlYWQoMCkgdG8gdHJpZ2dlciBhIHJlYWRhYmxlIGV2ZW50LCBidXQgd2VcbiAgLy8gYWxyZWFkeSBoYXZlIGEgYnVuY2ggb2YgZGF0YSBpbiB0aGUgYnVmZmVyLCB0aGVuIGp1c3QgdHJpZ2dlclxuICAvLyB0aGUgJ3JlYWRhYmxlJyBldmVudCBhbmQgbW92ZSBvbi5cbiAgaWYgKG4gPT09IDAgJiZcbiAgICAgIHN0YXRlLm5lZWRSZWFkYWJsZSAmJlxuICAgICAgKHN0YXRlLmxlbmd0aCA+PSBzdGF0ZS5oaWdoV2F0ZXJNYXJrIHx8IHN0YXRlLmVuZGVkKSkge1xuICAgIGRlYnVnKCdyZWFkOiBlbWl0UmVhZGFibGUnLCBzdGF0ZS5sZW5ndGgsIHN0YXRlLmVuZGVkKTtcbiAgICBpZiAoc3RhdGUubGVuZ3RoID09PSAwICYmIHN0YXRlLmVuZGVkKVxuICAgICAgZW5kUmVhZGFibGUodGhpcyk7XG4gICAgZWxzZVxuICAgICAgZW1pdFJlYWRhYmxlKHRoaXMpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgbiA9IGhvd011Y2hUb1JlYWQobiwgc3RhdGUpO1xuXG4gIC8vIGlmIHdlJ3ZlIGVuZGVkLCBhbmQgd2UncmUgbm93IGNsZWFyLCB0aGVuIGZpbmlzaCBpdCB1cC5cbiAgaWYgKG4gPT09IDAgJiYgc3RhdGUuZW5kZWQpIHtcbiAgICBpZiAoc3RhdGUubGVuZ3RoID09PSAwKVxuICAgICAgZW5kUmVhZGFibGUodGhpcyk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvLyBBbGwgdGhlIGFjdHVhbCBjaHVuayBnZW5lcmF0aW9uIGxvZ2ljIG5lZWRzIHRvIGJlXG4gIC8vICpiZWxvdyogdGhlIGNhbGwgdG8gX3JlYWQuICBUaGUgcmVhc29uIGlzIHRoYXQgaW4gY2VydGFpblxuICAvLyBzeW50aGV0aWMgc3RyZWFtIGNhc2VzLCBzdWNoIGFzIHBhc3N0aHJvdWdoIHN0cmVhbXMsIF9yZWFkXG4gIC8vIG1heSBiZSBhIGNvbXBsZXRlbHkgc3luY2hyb25vdXMgb3BlcmF0aW9uIHdoaWNoIG1heSBjaGFuZ2VcbiAgLy8gdGhlIHN0YXRlIG9mIHRoZSByZWFkIGJ1ZmZlciwgcHJvdmlkaW5nIGVub3VnaCBkYXRhIHdoZW5cbiAgLy8gYmVmb3JlIHRoZXJlIHdhcyAqbm90KiBlbm91Z2guXG4gIC8vXG4gIC8vIFNvLCB0aGUgc3RlcHMgYXJlOlxuICAvLyAxLiBGaWd1cmUgb3V0IHdoYXQgdGhlIHN0YXRlIG9mIHRoaW5ncyB3aWxsIGJlIGFmdGVyIHdlIGRvXG4gIC8vIGEgcmVhZCBmcm9tIHRoZSBidWZmZXIuXG4gIC8vXG4gIC8vIDIuIElmIHRoYXQgcmVzdWx0aW5nIHN0YXRlIHdpbGwgdHJpZ2dlciBhIF9yZWFkLCB0aGVuIGNhbGwgX3JlYWQuXG4gIC8vIE5vdGUgdGhhdCB0aGlzIG1heSBiZSBhc3luY2hyb25vdXMsIG9yIHN5bmNocm9ub3VzLiAgWWVzLCBpdCBpc1xuICAvLyBkZWVwbHkgdWdseSB0byB3cml0ZSBBUElzIHRoaXMgd2F5LCBidXQgdGhhdCBzdGlsbCBkb2Vzbid0IG1lYW5cbiAgLy8gdGhhdCB0aGUgUmVhZGFibGUgY2xhc3Mgc2hvdWxkIGJlaGF2ZSBpbXByb3Blcmx5LCBhcyBzdHJlYW1zIGFyZVxuICAvLyBkZXNpZ25lZCB0byBiZSBzeW5jL2FzeW5jIGFnbm9zdGljLlxuICAvLyBUYWtlIG5vdGUgaWYgdGhlIF9yZWFkIGNhbGwgaXMgc3luYyBvciBhc3luYyAoaWUsIGlmIHRoZSByZWFkIGNhbGxcbiAgLy8gaGFzIHJldHVybmVkIHlldCksIHNvIHRoYXQgd2Uga25vdyB3aGV0aGVyIG9yIG5vdCBpdCdzIHNhZmUgdG8gZW1pdFxuICAvLyAncmVhZGFibGUnIGV0Yy5cbiAgLy9cbiAgLy8gMy4gQWN0dWFsbHkgcHVsbCB0aGUgcmVxdWVzdGVkIGNodW5rcyBvdXQgb2YgdGhlIGJ1ZmZlciBhbmQgcmV0dXJuLlxuXG4gIC8vIGlmIHdlIG5lZWQgYSByZWFkYWJsZSBldmVudCwgdGhlbiB3ZSBuZWVkIHRvIGRvIHNvbWUgcmVhZGluZy5cbiAgdmFyIGRvUmVhZCA9IHN0YXRlLm5lZWRSZWFkYWJsZTtcbiAgZGVidWcoJ25lZWQgcmVhZGFibGUnLCBkb1JlYWQpO1xuXG4gIC8vIGlmIHdlIGN1cnJlbnRseSBoYXZlIGxlc3MgdGhhbiB0aGUgaGlnaFdhdGVyTWFyaywgdGhlbiBhbHNvIHJlYWQgc29tZVxuICBpZiAoc3RhdGUubGVuZ3RoID09PSAwIHx8IHN0YXRlLmxlbmd0aCAtIG4gPCBzdGF0ZS5oaWdoV2F0ZXJNYXJrKSB7XG4gICAgZG9SZWFkID0gdHJ1ZTtcbiAgICBkZWJ1ZygnbGVuZ3RoIGxlc3MgdGhhbiB3YXRlcm1hcmsnLCBkb1JlYWQpO1xuICB9XG5cbiAgLy8gaG93ZXZlciwgaWYgd2UndmUgZW5kZWQsIHRoZW4gdGhlcmUncyBubyBwb2ludCwgYW5kIGlmIHdlJ3JlIGFscmVhZHlcbiAgLy8gcmVhZGluZywgdGhlbiBpdCdzIHVubmVjZXNzYXJ5LlxuICBpZiAoc3RhdGUuZW5kZWQgfHwgc3RhdGUucmVhZGluZykge1xuICAgIGRvUmVhZCA9IGZhbHNlO1xuICAgIGRlYnVnKCdyZWFkaW5nIG9yIGVuZGVkJywgZG9SZWFkKTtcbiAgfVxuXG4gIGlmIChkb1JlYWQpIHtcbiAgICBkZWJ1ZygnZG8gcmVhZCcpO1xuICAgIHN0YXRlLnJlYWRpbmcgPSB0cnVlO1xuICAgIHN0YXRlLnN5bmMgPSB0cnVlO1xuICAgIC8vIGlmIHRoZSBsZW5ndGggaXMgY3VycmVudGx5IHplcm8sIHRoZW4gd2UgKm5lZWQqIGEgcmVhZGFibGUgZXZlbnQuXG4gICAgaWYgKHN0YXRlLmxlbmd0aCA9PT0gMClcbiAgICAgIHN0YXRlLm5lZWRSZWFkYWJsZSA9IHRydWU7XG4gICAgLy8gY2FsbCBpbnRlcm5hbCByZWFkIG1ldGhvZFxuICAgIHRoaXMuX3JlYWQoc3RhdGUuaGlnaFdhdGVyTWFyayk7XG4gICAgc3RhdGUuc3luYyA9IGZhbHNlO1xuICB9XG5cbiAgLy8gSWYgX3JlYWQgcHVzaGVkIGRhdGEgc3luY2hyb25vdXNseSwgdGhlbiBgcmVhZGluZ2Agd2lsbCBiZSBmYWxzZSxcbiAgLy8gYW5kIHdlIG5lZWQgdG8gcmUtZXZhbHVhdGUgaG93IG11Y2ggZGF0YSB3ZSBjYW4gcmV0dXJuIHRvIHRoZSB1c2VyLlxuICBpZiAoZG9SZWFkICYmICFzdGF0ZS5yZWFkaW5nKVxuICAgIG4gPSBob3dNdWNoVG9SZWFkKG5PcmlnLCBzdGF0ZSk7XG5cbiAgdmFyIHJldDtcbiAgaWYgKG4gPiAwKVxuICAgIHJldCA9IGZyb21MaXN0KG4sIHN0YXRlKTtcbiAgZWxzZVxuICAgIHJldCA9IG51bGw7XG5cbiAgaWYgKHV0aWwuaXNOdWxsKHJldCkpIHtcbiAgICBzdGF0ZS5uZWVkUmVhZGFibGUgPSB0cnVlO1xuICAgIG4gPSAwO1xuICB9XG5cbiAgc3RhdGUubGVuZ3RoIC09IG47XG5cbiAgLy8gSWYgd2UgaGF2ZSBub3RoaW5nIGluIHRoZSBidWZmZXIsIHRoZW4gd2Ugd2FudCB0byBrbm93XG4gIC8vIGFzIHNvb24gYXMgd2UgKmRvKiBnZXQgc29tZXRoaW5nIGludG8gdGhlIGJ1ZmZlci5cbiAgaWYgKHN0YXRlLmxlbmd0aCA9PT0gMCAmJiAhc3RhdGUuZW5kZWQpXG4gICAgc3RhdGUubmVlZFJlYWRhYmxlID0gdHJ1ZTtcblxuICAvLyBJZiB3ZSB0cmllZCB0byByZWFkKCkgcGFzdCB0aGUgRU9GLCB0aGVuIGVtaXQgZW5kIG9uIHRoZSBuZXh0IHRpY2suXG4gIGlmIChuT3JpZyAhPT0gbiAmJiBzdGF0ZS5lbmRlZCAmJiBzdGF0ZS5sZW5ndGggPT09IDApXG4gICAgZW5kUmVhZGFibGUodGhpcyk7XG5cbiAgaWYgKCF1dGlsLmlzTnVsbChyZXQpKVxuICAgIHRoaXMuZW1pdCgnZGF0YScsIHJldCk7XG5cbiAgcmV0dXJuIHJldDtcbn07XG5cbmZ1bmN0aW9uIGNodW5rSW52YWxpZChzdGF0ZSwgY2h1bmspIHtcbiAgdmFyIGVyID0gbnVsbDtcbiAgaWYgKCF1dGlsLmlzQnVmZmVyKGNodW5rKSAmJlxuICAgICAgIXV0aWwuaXNTdHJpbmcoY2h1bmspICYmXG4gICAgICAhdXRpbC5pc051bGxPclVuZGVmaW5lZChjaHVuaykgJiZcbiAgICAgICFzdGF0ZS5vYmplY3RNb2RlKSB7XG4gICAgZXIgPSBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIG5vbi1zdHJpbmcvYnVmZmVyIGNodW5rJyk7XG4gIH1cbiAgcmV0dXJuIGVyO1xufVxuXG5cbmZ1bmN0aW9uIG9uRW9mQ2h1bmsoc3RyZWFtLCBzdGF0ZSkge1xuICBpZiAoc3RhdGUuZGVjb2RlciAmJiAhc3RhdGUuZW5kZWQpIHtcbiAgICB2YXIgY2h1bmsgPSBzdGF0ZS5kZWNvZGVyLmVuZCgpO1xuICAgIGlmIChjaHVuayAmJiBjaHVuay5sZW5ndGgpIHtcbiAgICAgIHN0YXRlLmJ1ZmZlci5wdXNoKGNodW5rKTtcbiAgICAgIHN0YXRlLmxlbmd0aCArPSBzdGF0ZS5vYmplY3RNb2RlID8gMSA6IGNodW5rLmxlbmd0aDtcbiAgICB9XG4gIH1cbiAgc3RhdGUuZW5kZWQgPSB0cnVlO1xuXG4gIC8vIGVtaXQgJ3JlYWRhYmxlJyBub3cgdG8gbWFrZSBzdXJlIGl0IGdldHMgcGlja2VkIHVwLlxuICBlbWl0UmVhZGFibGUoc3RyZWFtKTtcbn1cblxuLy8gRG9uJ3QgZW1pdCByZWFkYWJsZSByaWdodCBhd2F5IGluIHN5bmMgbW9kZSwgYmVjYXVzZSB0aGlzIGNhbiB0cmlnZ2VyXG4vLyBhbm90aGVyIHJlYWQoKSBjYWxsID0+IHN0YWNrIG92ZXJmbG93LiAgVGhpcyB3YXksIGl0IG1pZ2h0IHRyaWdnZXJcbi8vIGEgbmV4dFRpY2sgcmVjdXJzaW9uIHdhcm5pbmcsIGJ1dCB0aGF0J3Mgbm90IHNvIGJhZC5cbmZ1bmN0aW9uIGVtaXRSZWFkYWJsZShzdHJlYW0pIHtcbiAgdmFyIHN0YXRlID0gc3RyZWFtLl9yZWFkYWJsZVN0YXRlO1xuICBzdGF0ZS5uZWVkUmVhZGFibGUgPSBmYWxzZTtcbiAgaWYgKCFzdGF0ZS5lbWl0dGVkUmVhZGFibGUpIHtcbiAgICBkZWJ1ZygnZW1pdFJlYWRhYmxlJywgc3RhdGUuZmxvd2luZyk7XG4gICAgc3RhdGUuZW1pdHRlZFJlYWRhYmxlID0gdHJ1ZTtcbiAgICBpZiAoc3RhdGUuc3luYylcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soZnVuY3Rpb24oKSB7XG4gICAgICAgIGVtaXRSZWFkYWJsZV8oc3RyZWFtKTtcbiAgICAgIH0pO1xuICAgIGVsc2VcbiAgICAgIGVtaXRSZWFkYWJsZV8oc3RyZWFtKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBlbWl0UmVhZGFibGVfKHN0cmVhbSkge1xuICBkZWJ1ZygnZW1pdCByZWFkYWJsZScpO1xuICBzdHJlYW0uZW1pdCgncmVhZGFibGUnKTtcbiAgZmxvdyhzdHJlYW0pO1xufVxuXG5cbi8vIGF0IHRoaXMgcG9pbnQsIHRoZSB1c2VyIGhhcyBwcmVzdW1hYmx5IHNlZW4gdGhlICdyZWFkYWJsZScgZXZlbnQsXG4vLyBhbmQgY2FsbGVkIHJlYWQoKSB0byBjb25zdW1lIHNvbWUgZGF0YS4gIHRoYXQgbWF5IGhhdmUgdHJpZ2dlcmVkXG4vLyBpbiB0dXJuIGFub3RoZXIgX3JlYWQobikgY2FsbCwgaW4gd2hpY2ggY2FzZSByZWFkaW5nID0gdHJ1ZSBpZlxuLy8gaXQncyBpbiBwcm9ncmVzcy5cbi8vIEhvd2V2ZXIsIGlmIHdlJ3JlIG5vdCBlbmRlZCwgb3IgcmVhZGluZywgYW5kIHRoZSBsZW5ndGggPCBod20sXG4vLyB0aGVuIGdvIGFoZWFkIGFuZCB0cnkgdG8gcmVhZCBzb21lIG1vcmUgcHJlZW1wdGl2ZWx5LlxuZnVuY3Rpb24gbWF5YmVSZWFkTW9yZShzdHJlYW0sIHN0YXRlKSB7XG4gIGlmICghc3RhdGUucmVhZGluZ01vcmUpIHtcbiAgICBzdGF0ZS5yZWFkaW5nTW9yZSA9IHRydWU7XG4gICAgcHJvY2Vzcy5uZXh0VGljayhmdW5jdGlvbigpIHtcbiAgICAgIG1heWJlUmVhZE1vcmVfKHN0cmVhbSwgc3RhdGUpO1xuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIG1heWJlUmVhZE1vcmVfKHN0cmVhbSwgc3RhdGUpIHtcbiAgdmFyIGxlbiA9IHN0YXRlLmxlbmd0aDtcbiAgd2hpbGUgKCFzdGF0ZS5yZWFkaW5nICYmICFzdGF0ZS5mbG93aW5nICYmICFzdGF0ZS5lbmRlZCAmJlxuICAgICAgICAgc3RhdGUubGVuZ3RoIDwgc3RhdGUuaGlnaFdhdGVyTWFyaykge1xuICAgIGRlYnVnKCdtYXliZVJlYWRNb3JlIHJlYWQgMCcpO1xuICAgIHN0cmVhbS5yZWFkKDApO1xuICAgIGlmIChsZW4gPT09IHN0YXRlLmxlbmd0aClcbiAgICAgIC8vIGRpZG4ndCBnZXQgYW55IGRhdGEsIHN0b3Agc3Bpbm5pbmcuXG4gICAgICBicmVhaztcbiAgICBlbHNlXG4gICAgICBsZW4gPSBzdGF0ZS5sZW5ndGg7XG4gIH1cbiAgc3RhdGUucmVhZGluZ01vcmUgPSBmYWxzZTtcbn1cblxuLy8gYWJzdHJhY3QgbWV0aG9kLiAgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzcGVjaWZpYyBpbXBsZW1lbnRhdGlvbiBjbGFzc2VzLlxuLy8gY2FsbCBjYihlciwgZGF0YSkgd2hlcmUgZGF0YSBpcyA8PSBuIGluIGxlbmd0aC5cbi8vIGZvciB2aXJ0dWFsIChub24tc3RyaW5nLCBub24tYnVmZmVyKSBzdHJlYW1zLCBcImxlbmd0aFwiIGlzIHNvbWV3aGF0XG4vLyBhcmJpdHJhcnksIGFuZCBwZXJoYXBzIG5vdCB2ZXJ5IG1lYW5pbmdmdWwuXG5SZWFkYWJsZS5wcm90b3R5cGUuX3JlYWQgPSBmdW5jdGlvbihuKSB7XG4gIHRoaXMuZW1pdCgnZXJyb3InLCBuZXcgRXJyb3IoJ25vdCBpbXBsZW1lbnRlZCcpKTtcbn07XG5cblJlYWRhYmxlLnByb3RvdHlwZS5waXBlID0gZnVuY3Rpb24oZGVzdCwgcGlwZU9wdHMpIHtcbiAgdmFyIHNyYyA9IHRoaXM7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX3JlYWRhYmxlU3RhdGU7XG5cbiAgc3dpdGNoIChzdGF0ZS5waXBlc0NvdW50KSB7XG4gICAgY2FzZSAwOlxuICAgICAgc3RhdGUucGlwZXMgPSBkZXN0O1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAxOlxuICAgICAgc3RhdGUucGlwZXMgPSBbc3RhdGUucGlwZXMsIGRlc3RdO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHN0YXRlLnBpcGVzLnB1c2goZGVzdCk7XG4gICAgICBicmVhaztcbiAgfVxuICBzdGF0ZS5waXBlc0NvdW50ICs9IDE7XG4gIGRlYnVnKCdwaXBlIGNvdW50PSVkIG9wdHM9JWonLCBzdGF0ZS5waXBlc0NvdW50LCBwaXBlT3B0cyk7XG5cbiAgdmFyIGRvRW5kID0gKCFwaXBlT3B0cyB8fCBwaXBlT3B0cy5lbmQgIT09IGZhbHNlKSAmJlxuICAgICAgICAgICAgICBkZXN0ICE9PSBwcm9jZXNzLnN0ZG91dCAmJlxuICAgICAgICAgICAgICBkZXN0ICE9PSBwcm9jZXNzLnN0ZGVycjtcblxuICB2YXIgZW5kRm4gPSBkb0VuZCA/IG9uZW5kIDogY2xlYW51cDtcbiAgaWYgKHN0YXRlLmVuZEVtaXR0ZWQpXG4gICAgcHJvY2Vzcy5uZXh0VGljayhlbmRGbik7XG4gIGVsc2VcbiAgICBzcmMub25jZSgnZW5kJywgZW5kRm4pO1xuXG4gIGRlc3Qub24oJ3VucGlwZScsIG9udW5waXBlKTtcbiAgZnVuY3Rpb24gb251bnBpcGUocmVhZGFibGUpIHtcbiAgICBkZWJ1Zygnb251bnBpcGUnKTtcbiAgICBpZiAocmVhZGFibGUgPT09IHNyYykge1xuICAgICAgY2xlYW51cCgpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG9uZW5kKCkge1xuICAgIGRlYnVnKCdvbmVuZCcpO1xuICAgIGRlc3QuZW5kKCk7XG4gIH1cblxuICAvLyB3aGVuIHRoZSBkZXN0IGRyYWlucywgaXQgcmVkdWNlcyB0aGUgYXdhaXREcmFpbiBjb3VudGVyXG4gIC8vIG9uIHRoZSBzb3VyY2UuICBUaGlzIHdvdWxkIGJlIG1vcmUgZWxlZ2FudCB3aXRoIGEgLm9uY2UoKVxuICAvLyBoYW5kbGVyIGluIGZsb3coKSwgYnV0IGFkZGluZyBhbmQgcmVtb3ZpbmcgcmVwZWF0ZWRseSBpc1xuICAvLyB0b28gc2xvdy5cbiAgdmFyIG9uZHJhaW4gPSBwaXBlT25EcmFpbihzcmMpO1xuICBkZXN0Lm9uKCdkcmFpbicsIG9uZHJhaW4pO1xuXG4gIGZ1bmN0aW9uIGNsZWFudXAoKSB7XG4gICAgZGVidWcoJ2NsZWFudXAnKTtcbiAgICAvLyBjbGVhbnVwIGV2ZW50IGhhbmRsZXJzIG9uY2UgdGhlIHBpcGUgaXMgYnJva2VuXG4gICAgZGVzdC5yZW1vdmVMaXN0ZW5lcignY2xvc2UnLCBvbmNsb3NlKTtcbiAgICBkZXN0LnJlbW92ZUxpc3RlbmVyKCdmaW5pc2gnLCBvbmZpbmlzaCk7XG4gICAgZGVzdC5yZW1vdmVMaXN0ZW5lcignZHJhaW4nLCBvbmRyYWluKTtcbiAgICBkZXN0LnJlbW92ZUxpc3RlbmVyKCdlcnJvcicsIG9uZXJyb3IpO1xuICAgIGRlc3QucmVtb3ZlTGlzdGVuZXIoJ3VucGlwZScsIG9udW5waXBlKTtcbiAgICBzcmMucmVtb3ZlTGlzdGVuZXIoJ2VuZCcsIG9uZW5kKTtcbiAgICBzcmMucmVtb3ZlTGlzdGVuZXIoJ2VuZCcsIGNsZWFudXApO1xuICAgIHNyYy5yZW1vdmVMaXN0ZW5lcignZGF0YScsIG9uZGF0YSk7XG5cbiAgICAvLyBpZiB0aGUgcmVhZGVyIGlzIHdhaXRpbmcgZm9yIGEgZHJhaW4gZXZlbnQgZnJvbSB0aGlzXG4gICAgLy8gc3BlY2lmaWMgd3JpdGVyLCB0aGVuIGl0IHdvdWxkIGNhdXNlIGl0IHRvIG5ldmVyIHN0YXJ0XG4gICAgLy8gZmxvd2luZyBhZ2Fpbi5cbiAgICAvLyBTbywgaWYgdGhpcyBpcyBhd2FpdGluZyBhIGRyYWluLCB0aGVuIHdlIGp1c3QgY2FsbCBpdCBub3cuXG4gICAgLy8gSWYgd2UgZG9uJ3Qga25vdywgdGhlbiBhc3N1bWUgdGhhdCB3ZSBhcmUgd2FpdGluZyBmb3Igb25lLlxuICAgIGlmIChzdGF0ZS5hd2FpdERyYWluICYmXG4gICAgICAgICghZGVzdC5fd3JpdGFibGVTdGF0ZSB8fCBkZXN0Ll93cml0YWJsZVN0YXRlLm5lZWREcmFpbikpXG4gICAgICBvbmRyYWluKCk7XG4gIH1cblxuICBzcmMub24oJ2RhdGEnLCBvbmRhdGEpO1xuICBmdW5jdGlvbiBvbmRhdGEoY2h1bmspIHtcbiAgICBkZWJ1Zygnb25kYXRhJyk7XG4gICAgdmFyIHJldCA9IGRlc3Qud3JpdGUoY2h1bmspO1xuICAgIGlmIChmYWxzZSA9PT0gcmV0KSB7XG4gICAgICBkZWJ1ZygnZmFsc2Ugd3JpdGUgcmVzcG9uc2UsIHBhdXNlJyxcbiAgICAgICAgICAgIHNyYy5fcmVhZGFibGVTdGF0ZS5hd2FpdERyYWluKTtcbiAgICAgIHNyYy5fcmVhZGFibGVTdGF0ZS5hd2FpdERyYWluKys7XG4gICAgICBzcmMucGF1c2UoKTtcbiAgICB9XG4gIH1cblxuICAvLyBpZiB0aGUgZGVzdCBoYXMgYW4gZXJyb3IsIHRoZW4gc3RvcCBwaXBpbmcgaW50byBpdC5cbiAgLy8gaG93ZXZlciwgZG9uJ3Qgc3VwcHJlc3MgdGhlIHRocm93aW5nIGJlaGF2aW9yIGZvciB0aGlzLlxuICBmdW5jdGlvbiBvbmVycm9yKGVyKSB7XG4gICAgZGVidWcoJ29uZXJyb3InLCBlcik7XG4gICAgdW5waXBlKCk7XG4gICAgZGVzdC5yZW1vdmVMaXN0ZW5lcignZXJyb3InLCBvbmVycm9yKTtcbiAgICBpZiAoRUUubGlzdGVuZXJDb3VudChkZXN0LCAnZXJyb3InKSA9PT0gMClcbiAgICAgIGRlc3QuZW1pdCgnZXJyb3InLCBlcik7XG4gIH1cbiAgLy8gVGhpcyBpcyBhIGJydXRhbGx5IHVnbHkgaGFjayB0byBtYWtlIHN1cmUgdGhhdCBvdXIgZXJyb3IgaGFuZGxlclxuICAvLyBpcyBhdHRhY2hlZCBiZWZvcmUgYW55IHVzZXJsYW5kIG9uZXMuICBORVZFUiBETyBUSElTLlxuICBpZiAoIWRlc3QuX2V2ZW50cyB8fCAhZGVzdC5fZXZlbnRzLmVycm9yKVxuICAgIGRlc3Qub24oJ2Vycm9yJywgb25lcnJvcik7XG4gIGVsc2UgaWYgKGlzQXJyYXkoZGVzdC5fZXZlbnRzLmVycm9yKSlcbiAgICBkZXN0Ll9ldmVudHMuZXJyb3IudW5zaGlmdChvbmVycm9yKTtcbiAgZWxzZVxuICAgIGRlc3QuX2V2ZW50cy5lcnJvciA9IFtvbmVycm9yLCBkZXN0Ll9ldmVudHMuZXJyb3JdO1xuXG5cblxuICAvLyBCb3RoIGNsb3NlIGFuZCBmaW5pc2ggc2hvdWxkIHRyaWdnZXIgdW5waXBlLCBidXQgb25seSBvbmNlLlxuICBmdW5jdGlvbiBvbmNsb3NlKCkge1xuICAgIGRlc3QucmVtb3ZlTGlzdGVuZXIoJ2ZpbmlzaCcsIG9uZmluaXNoKTtcbiAgICB1bnBpcGUoKTtcbiAgfVxuICBkZXN0Lm9uY2UoJ2Nsb3NlJywgb25jbG9zZSk7XG4gIGZ1bmN0aW9uIG9uZmluaXNoKCkge1xuICAgIGRlYnVnKCdvbmZpbmlzaCcpO1xuICAgIGRlc3QucmVtb3ZlTGlzdGVuZXIoJ2Nsb3NlJywgb25jbG9zZSk7XG4gICAgdW5waXBlKCk7XG4gIH1cbiAgZGVzdC5vbmNlKCdmaW5pc2gnLCBvbmZpbmlzaCk7XG5cbiAgZnVuY3Rpb24gdW5waXBlKCkge1xuICAgIGRlYnVnKCd1bnBpcGUnKTtcbiAgICBzcmMudW5waXBlKGRlc3QpO1xuICB9XG5cbiAgLy8gdGVsbCB0aGUgZGVzdCB0aGF0IGl0J3MgYmVpbmcgcGlwZWQgdG9cbiAgZGVzdC5lbWl0KCdwaXBlJywgc3JjKTtcblxuICAvLyBzdGFydCB0aGUgZmxvdyBpZiBpdCBoYXNuJ3QgYmVlbiBzdGFydGVkIGFscmVhZHkuXG4gIGlmICghc3RhdGUuZmxvd2luZykge1xuICAgIGRlYnVnKCdwaXBlIHJlc3VtZScpO1xuICAgIHNyYy5yZXN1bWUoKTtcbiAgfVxuXG4gIHJldHVybiBkZXN0O1xufTtcblxuZnVuY3Rpb24gcGlwZU9uRHJhaW4oc3JjKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3RhdGUgPSBzcmMuX3JlYWRhYmxlU3RhdGU7XG4gICAgZGVidWcoJ3BpcGVPbkRyYWluJywgc3RhdGUuYXdhaXREcmFpbik7XG4gICAgaWYgKHN0YXRlLmF3YWl0RHJhaW4pXG4gICAgICBzdGF0ZS5hd2FpdERyYWluLS07XG4gICAgaWYgKHN0YXRlLmF3YWl0RHJhaW4gPT09IDAgJiYgRUUubGlzdGVuZXJDb3VudChzcmMsICdkYXRhJykpIHtcbiAgICAgIHN0YXRlLmZsb3dpbmcgPSB0cnVlO1xuICAgICAgZmxvdyhzcmMpO1xuICAgIH1cbiAgfTtcbn1cblxuXG5SZWFkYWJsZS5wcm90b3R5cGUudW5waXBlID0gZnVuY3Rpb24oZGVzdCkge1xuICB2YXIgc3RhdGUgPSB0aGlzLl9yZWFkYWJsZVN0YXRlO1xuXG4gIC8vIGlmIHdlJ3JlIG5vdCBwaXBpbmcgYW55d2hlcmUsIHRoZW4gZG8gbm90aGluZy5cbiAgaWYgKHN0YXRlLnBpcGVzQ291bnQgPT09IDApXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgLy8ganVzdCBvbmUgZGVzdGluYXRpb24uICBtb3N0IGNvbW1vbiBjYXNlLlxuICBpZiAoc3RhdGUucGlwZXNDb3VudCA9PT0gMSkge1xuICAgIC8vIHBhc3NlZCBpbiBvbmUsIGJ1dCBpdCdzIG5vdCB0aGUgcmlnaHQgb25lLlxuICAgIGlmIChkZXN0ICYmIGRlc3QgIT09IHN0YXRlLnBpcGVzKVxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICBpZiAoIWRlc3QpXG4gICAgICBkZXN0ID0gc3RhdGUucGlwZXM7XG5cbiAgICAvLyBnb3QgYSBtYXRjaC5cbiAgICBzdGF0ZS5waXBlcyA9IG51bGw7XG4gICAgc3RhdGUucGlwZXNDb3VudCA9IDA7XG4gICAgc3RhdGUuZmxvd2luZyA9IGZhbHNlO1xuICAgIGlmIChkZXN0KVxuICAgICAgZGVzdC5lbWl0KCd1bnBpcGUnLCB0aGlzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIHNsb3cgY2FzZS4gbXVsdGlwbGUgcGlwZSBkZXN0aW5hdGlvbnMuXG5cbiAgaWYgKCFkZXN0KSB7XG4gICAgLy8gcmVtb3ZlIGFsbC5cbiAgICB2YXIgZGVzdHMgPSBzdGF0ZS5waXBlcztcbiAgICB2YXIgbGVuID0gc3RhdGUucGlwZXNDb3VudDtcbiAgICBzdGF0ZS5waXBlcyA9IG51bGw7XG4gICAgc3RhdGUucGlwZXNDb3VudCA9IDA7XG4gICAgc3RhdGUuZmxvd2luZyA9IGZhbHNlO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKylcbiAgICAgIGRlc3RzW2ldLmVtaXQoJ3VucGlwZScsIHRoaXMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gdHJ5IHRvIGZpbmQgdGhlIHJpZ2h0IG9uZS5cbiAgdmFyIGkgPSBpbmRleE9mKHN0YXRlLnBpcGVzLCBkZXN0KTtcbiAgaWYgKGkgPT09IC0xKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIHN0YXRlLnBpcGVzLnNwbGljZShpLCAxKTtcbiAgc3RhdGUucGlwZXNDb3VudCAtPSAxO1xuICBpZiAoc3RhdGUucGlwZXNDb3VudCA9PT0gMSlcbiAgICBzdGF0ZS5waXBlcyA9IHN0YXRlLnBpcGVzWzBdO1xuXG4gIGRlc3QuZW1pdCgndW5waXBlJywgdGhpcyk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBzZXQgdXAgZGF0YSBldmVudHMgaWYgdGhleSBhcmUgYXNrZWQgZm9yXG4vLyBFbnN1cmUgcmVhZGFibGUgbGlzdGVuZXJzIGV2ZW50dWFsbHkgZ2V0IHNvbWV0aGluZ1xuUmVhZGFibGUucHJvdG90eXBlLm9uID0gZnVuY3Rpb24oZXYsIGZuKSB7XG4gIHZhciByZXMgPSBTdHJlYW0ucHJvdG90eXBlLm9uLmNhbGwodGhpcywgZXYsIGZuKTtcblxuICAvLyBJZiBsaXN0ZW5pbmcgdG8gZGF0YSwgYW5kIGl0IGhhcyBub3QgZXhwbGljaXRseSBiZWVuIHBhdXNlZCxcbiAgLy8gdGhlbiBjYWxsIHJlc3VtZSB0byBzdGFydCB0aGUgZmxvdyBvZiBkYXRhIG9uIHRoZSBuZXh0IHRpY2suXG4gIGlmIChldiA9PT0gJ2RhdGEnICYmIGZhbHNlICE9PSB0aGlzLl9yZWFkYWJsZVN0YXRlLmZsb3dpbmcpIHtcbiAgICB0aGlzLnJlc3VtZSgpO1xuICB9XG5cbiAgaWYgKGV2ID09PSAncmVhZGFibGUnICYmIHRoaXMucmVhZGFibGUpIHtcbiAgICB2YXIgc3RhdGUgPSB0aGlzLl9yZWFkYWJsZVN0YXRlO1xuICAgIGlmICghc3RhdGUucmVhZGFibGVMaXN0ZW5pbmcpIHtcbiAgICAgIHN0YXRlLnJlYWRhYmxlTGlzdGVuaW5nID0gdHJ1ZTtcbiAgICAgIHN0YXRlLmVtaXR0ZWRSZWFkYWJsZSA9IGZhbHNlO1xuICAgICAgc3RhdGUubmVlZFJlYWRhYmxlID0gdHJ1ZTtcbiAgICAgIGlmICghc3RhdGUucmVhZGluZykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHByb2Nlc3MubmV4dFRpY2soZnVuY3Rpb24oKSB7XG4gICAgICAgICAgZGVidWcoJ3JlYWRhYmxlIG5leHR0aWNrIHJlYWQgMCcpO1xuICAgICAgICAgIHNlbGYucmVhZCgwKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2UgaWYgKHN0YXRlLmxlbmd0aCkge1xuICAgICAgICBlbWl0UmVhZGFibGUodGhpcywgc3RhdGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXM7XG59O1xuUmVhZGFibGUucHJvdG90eXBlLmFkZExpc3RlbmVyID0gUmVhZGFibGUucHJvdG90eXBlLm9uO1xuXG4vLyBwYXVzZSgpIGFuZCByZXN1bWUoKSBhcmUgcmVtbmFudHMgb2YgdGhlIGxlZ2FjeSByZWFkYWJsZSBzdHJlYW0gQVBJXG4vLyBJZiB0aGUgdXNlciB1c2VzIHRoZW0sIHRoZW4gc3dpdGNoIGludG8gb2xkIG1vZGUuXG5SZWFkYWJsZS5wcm90b3R5cGUucmVzdW1lID0gZnVuY3Rpb24oKSB7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX3JlYWRhYmxlU3RhdGU7XG4gIGlmICghc3RhdGUuZmxvd2luZykge1xuICAgIGRlYnVnKCdyZXN1bWUnKTtcbiAgICBzdGF0ZS5mbG93aW5nID0gdHJ1ZTtcbiAgICBpZiAoIXN0YXRlLnJlYWRpbmcpIHtcbiAgICAgIGRlYnVnKCdyZXN1bWUgcmVhZCAwJyk7XG4gICAgICB0aGlzLnJlYWQoMCk7XG4gICAgfVxuICAgIHJlc3VtZSh0aGlzLCBzdGF0ZSk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5mdW5jdGlvbiByZXN1bWUoc3RyZWFtLCBzdGF0ZSkge1xuICBpZiAoIXN0YXRlLnJlc3VtZVNjaGVkdWxlZCkge1xuICAgIHN0YXRlLnJlc3VtZVNjaGVkdWxlZCA9IHRydWU7XG4gICAgcHJvY2Vzcy5uZXh0VGljayhmdW5jdGlvbigpIHtcbiAgICAgIHJlc3VtZV8oc3RyZWFtLCBzdGF0ZSk7XG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVzdW1lXyhzdHJlYW0sIHN0YXRlKSB7XG4gIHN0YXRlLnJlc3VtZVNjaGVkdWxlZCA9IGZhbHNlO1xuICBzdHJlYW0uZW1pdCgncmVzdW1lJyk7XG4gIGZsb3coc3RyZWFtKTtcbiAgaWYgKHN0YXRlLmZsb3dpbmcgJiYgIXN0YXRlLnJlYWRpbmcpXG4gICAgc3RyZWFtLnJlYWQoMCk7XG59XG5cblJlYWRhYmxlLnByb3RvdHlwZS5wYXVzZSA9IGZ1bmN0aW9uKCkge1xuICBkZWJ1ZygnY2FsbCBwYXVzZSBmbG93aW5nPSVqJywgdGhpcy5fcmVhZGFibGVTdGF0ZS5mbG93aW5nKTtcbiAgaWYgKGZhbHNlICE9PSB0aGlzLl9yZWFkYWJsZVN0YXRlLmZsb3dpbmcpIHtcbiAgICBkZWJ1ZygncGF1c2UnKTtcbiAgICB0aGlzLl9yZWFkYWJsZVN0YXRlLmZsb3dpbmcgPSBmYWxzZTtcbiAgICB0aGlzLmVtaXQoJ3BhdXNlJyk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5mdW5jdGlvbiBmbG93KHN0cmVhbSkge1xuICB2YXIgc3RhdGUgPSBzdHJlYW0uX3JlYWRhYmxlU3RhdGU7XG4gIGRlYnVnKCdmbG93Jywgc3RhdGUuZmxvd2luZyk7XG4gIGlmIChzdGF0ZS5mbG93aW5nKSB7XG4gICAgZG8ge1xuICAgICAgdmFyIGNodW5rID0gc3RyZWFtLnJlYWQoKTtcbiAgICB9IHdoaWxlIChudWxsICE9PSBjaHVuayAmJiBzdGF0ZS5mbG93aW5nKTtcbiAgfVxufVxuXG4vLyB3cmFwIGFuIG9sZC1zdHlsZSBzdHJlYW0gYXMgdGhlIGFzeW5jIGRhdGEgc291cmNlLlxuLy8gVGhpcyBpcyAqbm90KiBwYXJ0IG9mIHRoZSByZWFkYWJsZSBzdHJlYW0gaW50ZXJmYWNlLlxuLy8gSXQgaXMgYW4gdWdseSB1bmZvcnR1bmF0ZSBtZXNzIG9mIGhpc3RvcnkuXG5SZWFkYWJsZS5wcm90b3R5cGUud3JhcCA9IGZ1bmN0aW9uKHN0cmVhbSkge1xuICB2YXIgc3RhdGUgPSB0aGlzLl9yZWFkYWJsZVN0YXRlO1xuICB2YXIgcGF1c2VkID0gZmFsc2U7XG5cbiAgdmFyIHNlbGYgPSB0aGlzO1xuICBzdHJlYW0ub24oJ2VuZCcsIGZ1bmN0aW9uKCkge1xuICAgIGRlYnVnKCd3cmFwcGVkIGVuZCcpO1xuICAgIGlmIChzdGF0ZS5kZWNvZGVyICYmICFzdGF0ZS5lbmRlZCkge1xuICAgICAgdmFyIGNodW5rID0gc3RhdGUuZGVjb2Rlci5lbmQoKTtcbiAgICAgIGlmIChjaHVuayAmJiBjaHVuay5sZW5ndGgpXG4gICAgICAgIHNlbGYucHVzaChjaHVuayk7XG4gICAgfVxuXG4gICAgc2VsZi5wdXNoKG51bGwpO1xuICB9KTtcblxuICBzdHJlYW0ub24oJ2RhdGEnLCBmdW5jdGlvbihjaHVuaykge1xuICAgIGRlYnVnKCd3cmFwcGVkIGRhdGEnKTtcbiAgICBpZiAoc3RhdGUuZGVjb2RlcilcbiAgICAgIGNodW5rID0gc3RhdGUuZGVjb2Rlci53cml0ZShjaHVuayk7XG4gICAgaWYgKCFjaHVuayB8fCAhc3RhdGUub2JqZWN0TW9kZSAmJiAhY2h1bmsubGVuZ3RoKVxuICAgICAgcmV0dXJuO1xuXG4gICAgdmFyIHJldCA9IHNlbGYucHVzaChjaHVuayk7XG4gICAgaWYgKCFyZXQpIHtcbiAgICAgIHBhdXNlZCA9IHRydWU7XG4gICAgICBzdHJlYW0ucGF1c2UoKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIHByb3h5IGFsbCB0aGUgb3RoZXIgbWV0aG9kcy5cbiAgLy8gaW1wb3J0YW50IHdoZW4gd3JhcHBpbmcgZmlsdGVycyBhbmQgZHVwbGV4ZXMuXG4gIGZvciAodmFyIGkgaW4gc3RyZWFtKSB7XG4gICAgaWYgKHV0aWwuaXNGdW5jdGlvbihzdHJlYW1baV0pICYmIHV0aWwuaXNVbmRlZmluZWQodGhpc1tpXSkpIHtcbiAgICAgIHRoaXNbaV0gPSBmdW5jdGlvbihtZXRob2QpIHsgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gc3RyZWFtW21ldGhvZF0uYXBwbHkoc3RyZWFtLCBhcmd1bWVudHMpO1xuICAgICAgfX0oaSk7XG4gICAgfVxuICB9XG5cbiAgLy8gcHJveHkgY2VydGFpbiBpbXBvcnRhbnQgZXZlbnRzLlxuICB2YXIgZXZlbnRzID0gWydlcnJvcicsICdjbG9zZScsICdkZXN0cm95JywgJ3BhdXNlJywgJ3Jlc3VtZSddO1xuICBmb3JFYWNoKGV2ZW50cywgZnVuY3Rpb24oZXYpIHtcbiAgICBzdHJlYW0ub24oZXYsIHNlbGYuZW1pdC5iaW5kKHNlbGYsIGV2KSk7XG4gIH0pO1xuXG4gIC8vIHdoZW4gd2UgdHJ5IHRvIGNvbnN1bWUgc29tZSBtb3JlIGJ5dGVzLCBzaW1wbHkgdW5wYXVzZSB0aGVcbiAgLy8gdW5kZXJseWluZyBzdHJlYW0uXG4gIHNlbGYuX3JlYWQgPSBmdW5jdGlvbihuKSB7XG4gICAgZGVidWcoJ3dyYXBwZWQgX3JlYWQnLCBuKTtcbiAgICBpZiAocGF1c2VkKSB7XG4gICAgICBwYXVzZWQgPSBmYWxzZTtcbiAgICAgIHN0cmVhbS5yZXN1bWUoKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIHNlbGY7XG59O1xuXG5cblxuLy8gZXhwb3NlZCBmb3IgdGVzdGluZyBwdXJwb3NlcyBvbmx5LlxuUmVhZGFibGUuX2Zyb21MaXN0ID0gZnJvbUxpc3Q7XG5cbi8vIFBsdWNrIG9mZiBuIGJ5dGVzIGZyb20gYW4gYXJyYXkgb2YgYnVmZmVycy5cbi8vIExlbmd0aCBpcyB0aGUgY29tYmluZWQgbGVuZ3RocyBvZiBhbGwgdGhlIGJ1ZmZlcnMgaW4gdGhlIGxpc3QuXG5mdW5jdGlvbiBmcm9tTGlzdChuLCBzdGF0ZSkge1xuICB2YXIgbGlzdCA9IHN0YXRlLmJ1ZmZlcjtcbiAgdmFyIGxlbmd0aCA9IHN0YXRlLmxlbmd0aDtcbiAgdmFyIHN0cmluZ01vZGUgPSAhIXN0YXRlLmRlY29kZXI7XG4gIHZhciBvYmplY3RNb2RlID0gISFzdGF0ZS5vYmplY3RNb2RlO1xuICB2YXIgcmV0O1xuXG4gIC8vIG5vdGhpbmcgaW4gdGhlIGxpc3QsIGRlZmluaXRlbHkgZW1wdHkuXG4gIGlmIChsaXN0Lmxlbmd0aCA9PT0gMClcbiAgICByZXR1cm4gbnVsbDtcblxuICBpZiAobGVuZ3RoID09PSAwKVxuICAgIHJldCA9IG51bGw7XG4gIGVsc2UgaWYgKG9iamVjdE1vZGUpXG4gICAgcmV0ID0gbGlzdC5zaGlmdCgpO1xuICBlbHNlIGlmICghbiB8fCBuID49IGxlbmd0aCkge1xuICAgIC8vIHJlYWQgaXQgYWxsLCB0cnVuY2F0ZSB0aGUgYXJyYXkuXG4gICAgaWYgKHN0cmluZ01vZGUpXG4gICAgICByZXQgPSBsaXN0LmpvaW4oJycpO1xuICAgIGVsc2VcbiAgICAgIHJldCA9IEJ1ZmZlci5jb25jYXQobGlzdCwgbGVuZ3RoKTtcbiAgICBsaXN0Lmxlbmd0aCA9IDA7XG4gIH0gZWxzZSB7XG4gICAgLy8gcmVhZCBqdXN0IHNvbWUgb2YgaXQuXG4gICAgaWYgKG4gPCBsaXN0WzBdLmxlbmd0aCkge1xuICAgICAgLy8ganVzdCB0YWtlIGEgcGFydCBvZiB0aGUgZmlyc3QgbGlzdCBpdGVtLlxuICAgICAgLy8gc2xpY2UgaXMgdGhlIHNhbWUgZm9yIGJ1ZmZlcnMgYW5kIHN0cmluZ3MuXG4gICAgICB2YXIgYnVmID0gbGlzdFswXTtcbiAgICAgIHJldCA9IGJ1Zi5zbGljZSgwLCBuKTtcbiAgICAgIGxpc3RbMF0gPSBidWYuc2xpY2Uobik7XG4gICAgfSBlbHNlIGlmIChuID09PSBsaXN0WzBdLmxlbmd0aCkge1xuICAgICAgLy8gZmlyc3QgbGlzdCBpcyBhIHBlcmZlY3QgbWF0Y2hcbiAgICAgIHJldCA9IGxpc3Quc2hpZnQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gY29tcGxleCBjYXNlLlxuICAgICAgLy8gd2UgaGF2ZSBlbm91Z2ggdG8gY292ZXIgaXQsIGJ1dCBpdCBzcGFucyBwYXN0IHRoZSBmaXJzdCBidWZmZXIuXG4gICAgICBpZiAoc3RyaW5nTW9kZSlcbiAgICAgICAgcmV0ID0gJyc7XG4gICAgICBlbHNlXG4gICAgICAgIHJldCA9IG5ldyBCdWZmZXIobik7XG5cbiAgICAgIHZhciBjID0gMDtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gbGlzdC5sZW5ndGg7IGkgPCBsICYmIGMgPCBuOyBpKyspIHtcbiAgICAgICAgdmFyIGJ1ZiA9IGxpc3RbMF07XG4gICAgICAgIHZhciBjcHkgPSBNYXRoLm1pbihuIC0gYywgYnVmLmxlbmd0aCk7XG5cbiAgICAgICAgaWYgKHN0cmluZ01vZGUpXG4gICAgICAgICAgcmV0ICs9IGJ1Zi5zbGljZSgwLCBjcHkpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgYnVmLmNvcHkocmV0LCBjLCAwLCBjcHkpO1xuXG4gICAgICAgIGlmIChjcHkgPCBidWYubGVuZ3RoKVxuICAgICAgICAgIGxpc3RbMF0gPSBidWYuc2xpY2UoY3B5KTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGxpc3Quc2hpZnQoKTtcblxuICAgICAgICBjICs9IGNweTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmV0O1xufVxuXG5mdW5jdGlvbiBlbmRSZWFkYWJsZShzdHJlYW0pIHtcbiAgdmFyIHN0YXRlID0gc3RyZWFtLl9yZWFkYWJsZVN0YXRlO1xuXG4gIC8vIElmIHdlIGdldCBoZXJlIGJlZm9yZSBjb25zdW1pbmcgYWxsIHRoZSBieXRlcywgdGhlbiB0aGF0IGlzIGFcbiAgLy8gYnVnIGluIG5vZGUuICBTaG91bGQgbmV2ZXIgaGFwcGVuLlxuICBpZiAoc3RhdGUubGVuZ3RoID4gMClcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2VuZFJlYWRhYmxlIGNhbGxlZCBvbiBub24tZW1wdHkgc3RyZWFtJyk7XG5cbiAgaWYgKCFzdGF0ZS5lbmRFbWl0dGVkKSB7XG4gICAgc3RhdGUuZW5kZWQgPSB0cnVlO1xuICAgIHByb2Nlc3MubmV4dFRpY2soZnVuY3Rpb24oKSB7XG4gICAgICAvLyBDaGVjayB0aGF0IHdlIGRpZG4ndCBnZXQgb25lIGxhc3QgdW5zaGlmdC5cbiAgICAgIGlmICghc3RhdGUuZW5kRW1pdHRlZCAmJiBzdGF0ZS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgc3RhdGUuZW5kRW1pdHRlZCA9IHRydWU7XG4gICAgICAgIHN0cmVhbS5yZWFkYWJsZSA9IGZhbHNlO1xuICAgICAgICBzdHJlYW0uZW1pdCgnZW5kJyk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZm9yRWFjaCAoeHMsIGYpIHtcbiAgZm9yICh2YXIgaSA9IDAsIGwgPSB4cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBmKHhzW2ldLCBpKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpbmRleE9mICh4cywgeCkge1xuICBmb3IgKHZhciBpID0gMCwgbCA9IHhzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIGlmICh4c1tpXSA9PT0geCkgcmV0dXJuIGk7XG4gIH1cbiAgcmV0dXJuIC0xO1xufVxuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cblxuLy8gYSB0cmFuc2Zvcm0gc3RyZWFtIGlzIGEgcmVhZGFibGUvd3JpdGFibGUgc3RyZWFtIHdoZXJlIHlvdSBkb1xuLy8gc29tZXRoaW5nIHdpdGggdGhlIGRhdGEuICBTb21ldGltZXMgaXQncyBjYWxsZWQgYSBcImZpbHRlclwiLFxuLy8gYnV0IHRoYXQncyBub3QgYSBncmVhdCBuYW1lIGZvciBpdCwgc2luY2UgdGhhdCBpbXBsaWVzIGEgdGhpbmcgd2hlcmVcbi8vIHNvbWUgYml0cyBwYXNzIHRocm91Z2gsIGFuZCBvdGhlcnMgYXJlIHNpbXBseSBpZ25vcmVkLiAgKFRoYXQgd291bGRcbi8vIGJlIGEgdmFsaWQgZXhhbXBsZSBvZiBhIHRyYW5zZm9ybSwgb2YgY291cnNlLilcbi8vXG4vLyBXaGlsZSB0aGUgb3V0cHV0IGlzIGNhdXNhbGx5IHJlbGF0ZWQgdG8gdGhlIGlucHV0LCBpdCdzIG5vdCBhXG4vLyBuZWNlc3NhcmlseSBzeW1tZXRyaWMgb3Igc3luY2hyb25vdXMgdHJhbnNmb3JtYXRpb24uICBGb3IgZXhhbXBsZSxcbi8vIGEgemxpYiBzdHJlYW0gbWlnaHQgdGFrZSBtdWx0aXBsZSBwbGFpbi10ZXh0IHdyaXRlcygpLCBhbmQgdGhlblxuLy8gZW1pdCBhIHNpbmdsZSBjb21wcmVzc2VkIGNodW5rIHNvbWUgdGltZSBpbiB0aGUgZnV0dXJlLlxuLy9cbi8vIEhlcmUncyBob3cgdGhpcyB3b3Jrczpcbi8vXG4vLyBUaGUgVHJhbnNmb3JtIHN0cmVhbSBoYXMgYWxsIHRoZSBhc3BlY3RzIG9mIHRoZSByZWFkYWJsZSBhbmQgd3JpdGFibGVcbi8vIHN0cmVhbSBjbGFzc2VzLiAgV2hlbiB5b3Ugd3JpdGUoY2h1bmspLCB0aGF0IGNhbGxzIF93cml0ZShjaHVuayxjYilcbi8vIGludGVybmFsbHksIGFuZCByZXR1cm5zIGZhbHNlIGlmIHRoZXJlJ3MgYSBsb3Qgb2YgcGVuZGluZyB3cml0ZXNcbi8vIGJ1ZmZlcmVkIHVwLiAgV2hlbiB5b3UgY2FsbCByZWFkKCksIHRoYXQgY2FsbHMgX3JlYWQobikgdW50aWxcbi8vIHRoZXJlJ3MgZW5vdWdoIHBlbmRpbmcgcmVhZGFibGUgZGF0YSBidWZmZXJlZCB1cC5cbi8vXG4vLyBJbiBhIHRyYW5zZm9ybSBzdHJlYW0sIHRoZSB3cml0dGVuIGRhdGEgaXMgcGxhY2VkIGluIGEgYnVmZmVyLiAgV2hlblxuLy8gX3JlYWQobikgaXMgY2FsbGVkLCBpdCB0cmFuc2Zvcm1zIHRoZSBxdWV1ZWQgdXAgZGF0YSwgY2FsbGluZyB0aGVcbi8vIGJ1ZmZlcmVkIF93cml0ZSBjYidzIGFzIGl0IGNvbnN1bWVzIGNodW5rcy4gIElmIGNvbnN1bWluZyBhIHNpbmdsZVxuLy8gd3JpdHRlbiBjaHVuayB3b3VsZCByZXN1bHQgaW4gbXVsdGlwbGUgb3V0cHV0IGNodW5rcywgdGhlbiB0aGUgZmlyc3Rcbi8vIG91dHB1dHRlZCBiaXQgY2FsbHMgdGhlIHJlYWRjYiwgYW5kIHN1YnNlcXVlbnQgY2h1bmtzIGp1c3QgZ28gaW50b1xuLy8gdGhlIHJlYWQgYnVmZmVyLCBhbmQgd2lsbCBjYXVzZSBpdCB0byBlbWl0ICdyZWFkYWJsZScgaWYgbmVjZXNzYXJ5LlxuLy9cbi8vIFRoaXMgd2F5LCBiYWNrLXByZXNzdXJlIGlzIGFjdHVhbGx5IGRldGVybWluZWQgYnkgdGhlIHJlYWRpbmcgc2lkZSxcbi8vIHNpbmNlIF9yZWFkIGhhcyB0byBiZSBjYWxsZWQgdG8gc3RhcnQgcHJvY2Vzc2luZyBhIG5ldyBjaHVuay4gIEhvd2V2ZXIsXG4vLyBhIHBhdGhvbG9naWNhbCBpbmZsYXRlIHR5cGUgb2YgdHJhbnNmb3JtIGNhbiBjYXVzZSBleGNlc3NpdmUgYnVmZmVyaW5nXG4vLyBoZXJlLiAgRm9yIGV4YW1wbGUsIGltYWdpbmUgYSBzdHJlYW0gd2hlcmUgZXZlcnkgYnl0ZSBvZiBpbnB1dCBpc1xuLy8gaW50ZXJwcmV0ZWQgYXMgYW4gaW50ZWdlciBmcm9tIDAtMjU1LCBhbmQgdGhlbiByZXN1bHRzIGluIHRoYXQgbWFueVxuLy8gYnl0ZXMgb2Ygb3V0cHV0LiAgV3JpdGluZyB0aGUgNCBieXRlcyB7ZmYsZmYsZmYsZmZ9IHdvdWxkIHJlc3VsdCBpblxuLy8gMWtiIG9mIGRhdGEgYmVpbmcgb3V0cHV0LiAgSW4gdGhpcyBjYXNlLCB5b3UgY291bGQgd3JpdGUgYSB2ZXJ5IHNtYWxsXG4vLyBhbW91bnQgb2YgaW5wdXQsIGFuZCBlbmQgdXAgd2l0aCBhIHZlcnkgbGFyZ2UgYW1vdW50IG9mIG91dHB1dC4gIEluXG4vLyBzdWNoIGEgcGF0aG9sb2dpY2FsIGluZmxhdGluZyBtZWNoYW5pc20sIHRoZXJlJ2QgYmUgbm8gd2F5IHRvIHRlbGxcbi8vIHRoZSBzeXN0ZW0gdG8gc3RvcCBkb2luZyB0aGUgdHJhbnNmb3JtLiAgQSBzaW5nbGUgNE1CIHdyaXRlIGNvdWxkXG4vLyBjYXVzZSB0aGUgc3lzdGVtIHRvIHJ1biBvdXQgb2YgbWVtb3J5LlxuLy9cbi8vIEhvd2V2ZXIsIGV2ZW4gaW4gc3VjaCBhIHBhdGhvbG9naWNhbCBjYXNlLCBvbmx5IGEgc2luZ2xlIHdyaXR0ZW4gY2h1bmtcbi8vIHdvdWxkIGJlIGNvbnN1bWVkLCBhbmQgdGhlbiB0aGUgcmVzdCB3b3VsZCB3YWl0ICh1bi10cmFuc2Zvcm1lZCkgdW50aWxcbi8vIHRoZSByZXN1bHRzIG9mIHRoZSBwcmV2aW91cyB0cmFuc2Zvcm1lZCBjaHVuayB3ZXJlIGNvbnN1bWVkLlxuXG5tb2R1bGUuZXhwb3J0cyA9IFRyYW5zZm9ybTtcblxudmFyIER1cGxleCA9IHJlcXVpcmUoJy4vX3N0cmVhbV9kdXBsZXgnKTtcblxuLyo8cmVwbGFjZW1lbnQ+Ki9cbnZhciB1dGlsID0gcmVxdWlyZSgnY29yZS11dGlsLWlzJyk7XG51dGlsLmluaGVyaXRzID0gcmVxdWlyZSgnaW5oZXJpdHMnKTtcbi8qPC9yZXBsYWNlbWVudD4qL1xuXG51dGlsLmluaGVyaXRzKFRyYW5zZm9ybSwgRHVwbGV4KTtcblxuXG5mdW5jdGlvbiBUcmFuc2Zvcm1TdGF0ZShvcHRpb25zLCBzdHJlYW0pIHtcbiAgdGhpcy5hZnRlclRyYW5zZm9ybSA9IGZ1bmN0aW9uKGVyLCBkYXRhKSB7XG4gICAgcmV0dXJuIGFmdGVyVHJhbnNmb3JtKHN0cmVhbSwgZXIsIGRhdGEpO1xuICB9O1xuXG4gIHRoaXMubmVlZFRyYW5zZm9ybSA9IGZhbHNlO1xuICB0aGlzLnRyYW5zZm9ybWluZyA9IGZhbHNlO1xuICB0aGlzLndyaXRlY2IgPSBudWxsO1xuICB0aGlzLndyaXRlY2h1bmsgPSBudWxsO1xufVxuXG5mdW5jdGlvbiBhZnRlclRyYW5zZm9ybShzdHJlYW0sIGVyLCBkYXRhKSB7XG4gIHZhciB0cyA9IHN0cmVhbS5fdHJhbnNmb3JtU3RhdGU7XG4gIHRzLnRyYW5zZm9ybWluZyA9IGZhbHNlO1xuXG4gIHZhciBjYiA9IHRzLndyaXRlY2I7XG5cbiAgaWYgKCFjYilcbiAgICByZXR1cm4gc3RyZWFtLmVtaXQoJ2Vycm9yJywgbmV3IEVycm9yKCdubyB3cml0ZWNiIGluIFRyYW5zZm9ybSBjbGFzcycpKTtcblxuICB0cy53cml0ZWNodW5rID0gbnVsbDtcbiAgdHMud3JpdGVjYiA9IG51bGw7XG5cbiAgaWYgKCF1dGlsLmlzTnVsbE9yVW5kZWZpbmVkKGRhdGEpKVxuICAgIHN0cmVhbS5wdXNoKGRhdGEpO1xuXG4gIGlmIChjYilcbiAgICBjYihlcik7XG5cbiAgdmFyIHJzID0gc3RyZWFtLl9yZWFkYWJsZVN0YXRlO1xuICBycy5yZWFkaW5nID0gZmFsc2U7XG4gIGlmIChycy5uZWVkUmVhZGFibGUgfHwgcnMubGVuZ3RoIDwgcnMuaGlnaFdhdGVyTWFyaykge1xuICAgIHN0cmVhbS5fcmVhZChycy5oaWdoV2F0ZXJNYXJrKTtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIFRyYW5zZm9ybShvcHRpb25zKSB7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBUcmFuc2Zvcm0pKVxuICAgIHJldHVybiBuZXcgVHJhbnNmb3JtKG9wdGlvbnMpO1xuXG4gIER1cGxleC5jYWxsKHRoaXMsIG9wdGlvbnMpO1xuXG4gIHRoaXMuX3RyYW5zZm9ybVN0YXRlID0gbmV3IFRyYW5zZm9ybVN0YXRlKG9wdGlvbnMsIHRoaXMpO1xuXG4gIC8vIHdoZW4gdGhlIHdyaXRhYmxlIHNpZGUgZmluaXNoZXMsIHRoZW4gZmx1c2ggb3V0IGFueXRoaW5nIHJlbWFpbmluZy5cbiAgdmFyIHN0cmVhbSA9IHRoaXM7XG5cbiAgLy8gc3RhcnQgb3V0IGFza2luZyBmb3IgYSByZWFkYWJsZSBldmVudCBvbmNlIGRhdGEgaXMgdHJhbnNmb3JtZWQuXG4gIHRoaXMuX3JlYWRhYmxlU3RhdGUubmVlZFJlYWRhYmxlID0gdHJ1ZTtcblxuICAvLyB3ZSBoYXZlIGltcGxlbWVudGVkIHRoZSBfcmVhZCBtZXRob2QsIGFuZCBkb25lIHRoZSBvdGhlciB0aGluZ3NcbiAgLy8gdGhhdCBSZWFkYWJsZSB3YW50cyBiZWZvcmUgdGhlIGZpcnN0IF9yZWFkIGNhbGwsIHNvIHVuc2V0IHRoZVxuICAvLyBzeW5jIGd1YXJkIGZsYWcuXG4gIHRoaXMuX3JlYWRhYmxlU3RhdGUuc3luYyA9IGZhbHNlO1xuXG4gIHRoaXMub25jZSgncHJlZmluaXNoJywgZnVuY3Rpb24oKSB7XG4gICAgaWYgKHV0aWwuaXNGdW5jdGlvbih0aGlzLl9mbHVzaCkpXG4gICAgICB0aGlzLl9mbHVzaChmdW5jdGlvbihlcikge1xuICAgICAgICBkb25lKHN0cmVhbSwgZXIpO1xuICAgICAgfSk7XG4gICAgZWxzZVxuICAgICAgZG9uZShzdHJlYW0pO1xuICB9KTtcbn1cblxuVHJhbnNmb3JtLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24oY2h1bmssIGVuY29kaW5nKSB7XG4gIHRoaXMuX3RyYW5zZm9ybVN0YXRlLm5lZWRUcmFuc2Zvcm0gPSBmYWxzZTtcbiAgcmV0dXJuIER1cGxleC5wcm90b3R5cGUucHVzaC5jYWxsKHRoaXMsIGNodW5rLCBlbmNvZGluZyk7XG59O1xuXG4vLyBUaGlzIGlzIHRoZSBwYXJ0IHdoZXJlIHlvdSBkbyBzdHVmZiFcbi8vIG92ZXJyaWRlIHRoaXMgZnVuY3Rpb24gaW4gaW1wbGVtZW50YXRpb24gY2xhc3Nlcy5cbi8vICdjaHVuaycgaXMgYW4gaW5wdXQgY2h1bmsuXG4vL1xuLy8gQ2FsbCBgcHVzaChuZXdDaHVuaylgIHRvIHBhc3MgYWxvbmcgdHJhbnNmb3JtZWQgb3V0cHV0XG4vLyB0byB0aGUgcmVhZGFibGUgc2lkZS4gIFlvdSBtYXkgY2FsbCAncHVzaCcgemVybyBvciBtb3JlIHRpbWVzLlxuLy9cbi8vIENhbGwgYGNiKGVycilgIHdoZW4geW91IGFyZSBkb25lIHdpdGggdGhpcyBjaHVuay4gIElmIHlvdSBwYXNzXG4vLyBhbiBlcnJvciwgdGhlbiB0aGF0J2xsIHB1dCB0aGUgaHVydCBvbiB0aGUgd2hvbGUgb3BlcmF0aW9uLiAgSWYgeW91XG4vLyBuZXZlciBjYWxsIGNiKCksIHRoZW4geW91J2xsIG5ldmVyIGdldCBhbm90aGVyIGNodW5rLlxuVHJhbnNmb3JtLnByb3RvdHlwZS5fdHJhbnNmb3JtID0gZnVuY3Rpb24oY2h1bmssIGVuY29kaW5nLCBjYikge1xuICB0aHJvdyBuZXcgRXJyb3IoJ25vdCBpbXBsZW1lbnRlZCcpO1xufTtcblxuVHJhbnNmb3JtLnByb3RvdHlwZS5fd3JpdGUgPSBmdW5jdGlvbihjaHVuaywgZW5jb2RpbmcsIGNiKSB7XG4gIHZhciB0cyA9IHRoaXMuX3RyYW5zZm9ybVN0YXRlO1xuICB0cy53cml0ZWNiID0gY2I7XG4gIHRzLndyaXRlY2h1bmsgPSBjaHVuaztcbiAgdHMud3JpdGVlbmNvZGluZyA9IGVuY29kaW5nO1xuICBpZiAoIXRzLnRyYW5zZm9ybWluZykge1xuICAgIHZhciBycyA9IHRoaXMuX3JlYWRhYmxlU3RhdGU7XG4gICAgaWYgKHRzLm5lZWRUcmFuc2Zvcm0gfHxcbiAgICAgICAgcnMubmVlZFJlYWRhYmxlIHx8XG4gICAgICAgIHJzLmxlbmd0aCA8IHJzLmhpZ2hXYXRlck1hcmspXG4gICAgICB0aGlzLl9yZWFkKHJzLmhpZ2hXYXRlck1hcmspO1xuICB9XG59O1xuXG4vLyBEb2Vzbid0IG1hdHRlciB3aGF0IHRoZSBhcmdzIGFyZSBoZXJlLlxuLy8gX3RyYW5zZm9ybSBkb2VzIGFsbCB0aGUgd29yay5cbi8vIFRoYXQgd2UgZ290IGhlcmUgbWVhbnMgdGhhdCB0aGUgcmVhZGFibGUgc2lkZSB3YW50cyBtb3JlIGRhdGEuXG5UcmFuc2Zvcm0ucHJvdG90eXBlLl9yZWFkID0gZnVuY3Rpb24obikge1xuICB2YXIgdHMgPSB0aGlzLl90cmFuc2Zvcm1TdGF0ZTtcblxuICBpZiAoIXV0aWwuaXNOdWxsKHRzLndyaXRlY2h1bmspICYmIHRzLndyaXRlY2IgJiYgIXRzLnRyYW5zZm9ybWluZykge1xuICAgIHRzLnRyYW5zZm9ybWluZyA9IHRydWU7XG4gICAgdGhpcy5fdHJhbnNmb3JtKHRzLndyaXRlY2h1bmssIHRzLndyaXRlZW5jb2RpbmcsIHRzLmFmdGVyVHJhbnNmb3JtKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBtYXJrIHRoYXQgd2UgbmVlZCBhIHRyYW5zZm9ybSwgc28gdGhhdCBhbnkgZGF0YSB0aGF0IGNvbWVzIGluXG4gICAgLy8gd2lsbCBnZXQgcHJvY2Vzc2VkLCBub3cgdGhhdCB3ZSd2ZSBhc2tlZCBmb3IgaXQuXG4gICAgdHMubmVlZFRyYW5zZm9ybSA9IHRydWU7XG4gIH1cbn07XG5cblxuZnVuY3Rpb24gZG9uZShzdHJlYW0sIGVyKSB7XG4gIGlmIChlcilcbiAgICByZXR1cm4gc3RyZWFtLmVtaXQoJ2Vycm9yJywgZXIpO1xuXG4gIC8vIGlmIHRoZXJlJ3Mgbm90aGluZyBpbiB0aGUgd3JpdGUgYnVmZmVyLCB0aGVuIHRoYXQgbWVhbnNcbiAgLy8gdGhhdCBub3RoaW5nIG1vcmUgd2lsbCBldmVyIGJlIHByb3ZpZGVkXG4gIHZhciB3cyA9IHN0cmVhbS5fd3JpdGFibGVTdGF0ZTtcbiAgdmFyIHRzID0gc3RyZWFtLl90cmFuc2Zvcm1TdGF0ZTtcblxuICBpZiAod3MubGVuZ3RoKVxuICAgIHRocm93IG5ldyBFcnJvcignY2FsbGluZyB0cmFuc2Zvcm0gZG9uZSB3aGVuIHdzLmxlbmd0aCAhPSAwJyk7XG5cbiAgaWYgKHRzLnRyYW5zZm9ybWluZylcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NhbGxpbmcgdHJhbnNmb3JtIGRvbmUgd2hlbiBzdGlsbCB0cmFuc2Zvcm1pbmcnKTtcblxuICByZXR1cm4gc3RyZWFtLnB1c2gobnVsbCk7XG59XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuLy8gQSBiaXQgc2ltcGxlciB0aGFuIHJlYWRhYmxlIHN0cmVhbXMuXG4vLyBJbXBsZW1lbnQgYW4gYXN5bmMgLl93cml0ZShjaHVuaywgY2IpLCBhbmQgaXQnbGwgaGFuZGxlIGFsbFxuLy8gdGhlIGRyYWluIGV2ZW50IGVtaXNzaW9uIGFuZCBidWZmZXJpbmcuXG5cbm1vZHVsZS5leHBvcnRzID0gV3JpdGFibGU7XG5cbi8qPHJlcGxhY2VtZW50PiovXG52YXIgQnVmZmVyID0gcmVxdWlyZSgnYnVmZmVyJykuQnVmZmVyO1xuLyo8L3JlcGxhY2VtZW50PiovXG5cbldyaXRhYmxlLldyaXRhYmxlU3RhdGUgPSBXcml0YWJsZVN0YXRlO1xuXG5cbi8qPHJlcGxhY2VtZW50PiovXG52YXIgdXRpbCA9IHJlcXVpcmUoJ2NvcmUtdXRpbC1pcycpO1xudXRpbC5pbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJyk7XG4vKjwvcmVwbGFjZW1lbnQ+Ki9cblxudmFyIFN0cmVhbSA9IHJlcXVpcmUoJ3N0cmVhbScpO1xuXG51dGlsLmluaGVyaXRzKFdyaXRhYmxlLCBTdHJlYW0pO1xuXG5mdW5jdGlvbiBXcml0ZVJlcShjaHVuaywgZW5jb2RpbmcsIGNiKSB7XG4gIHRoaXMuY2h1bmsgPSBjaHVuaztcbiAgdGhpcy5lbmNvZGluZyA9IGVuY29kaW5nO1xuICB0aGlzLmNhbGxiYWNrID0gY2I7XG59XG5cbmZ1bmN0aW9uIFdyaXRhYmxlU3RhdGUob3B0aW9ucywgc3RyZWFtKSB7XG4gIHZhciBEdXBsZXggPSByZXF1aXJlKCcuL19zdHJlYW1fZHVwbGV4Jyk7XG5cbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgLy8gdGhlIHBvaW50IGF0IHdoaWNoIHdyaXRlKCkgc3RhcnRzIHJldHVybmluZyBmYWxzZVxuICAvLyBOb3RlOiAwIGlzIGEgdmFsaWQgdmFsdWUsIG1lYW5zIHRoYXQgd2UgYWx3YXlzIHJldHVybiBmYWxzZSBpZlxuICAvLyB0aGUgZW50aXJlIGJ1ZmZlciBpcyBub3QgZmx1c2hlZCBpbW1lZGlhdGVseSBvbiB3cml0ZSgpXG4gIHZhciBod20gPSBvcHRpb25zLmhpZ2hXYXRlck1hcms7XG4gIHZhciBkZWZhdWx0SHdtID0gb3B0aW9ucy5vYmplY3RNb2RlID8gMTYgOiAxNiAqIDEwMjQ7XG4gIHRoaXMuaGlnaFdhdGVyTWFyayA9IChod20gfHwgaHdtID09PSAwKSA/IGh3bSA6IGRlZmF1bHRId207XG5cbiAgLy8gb2JqZWN0IHN0cmVhbSBmbGFnIHRvIGluZGljYXRlIHdoZXRoZXIgb3Igbm90IHRoaXMgc3RyZWFtXG4gIC8vIGNvbnRhaW5zIGJ1ZmZlcnMgb3Igb2JqZWN0cy5cbiAgdGhpcy5vYmplY3RNb2RlID0gISFvcHRpb25zLm9iamVjdE1vZGU7XG5cbiAgaWYgKHN0cmVhbSBpbnN0YW5jZW9mIER1cGxleClcbiAgICB0aGlzLm9iamVjdE1vZGUgPSB0aGlzLm9iamVjdE1vZGUgfHwgISFvcHRpb25zLndyaXRhYmxlT2JqZWN0TW9kZTtcblxuICAvLyBjYXN0IHRvIGludHMuXG4gIHRoaXMuaGlnaFdhdGVyTWFyayA9IH5+dGhpcy5oaWdoV2F0ZXJNYXJrO1xuXG4gIHRoaXMubmVlZERyYWluID0gZmFsc2U7XG4gIC8vIGF0IHRoZSBzdGFydCBvZiBjYWxsaW5nIGVuZCgpXG4gIHRoaXMuZW5kaW5nID0gZmFsc2U7XG4gIC8vIHdoZW4gZW5kKCkgaGFzIGJlZW4gY2FsbGVkLCBhbmQgcmV0dXJuZWRcbiAgdGhpcy5lbmRlZCA9IGZhbHNlO1xuICAvLyB3aGVuICdmaW5pc2gnIGlzIGVtaXR0ZWRcbiAgdGhpcy5maW5pc2hlZCA9IGZhbHNlO1xuXG4gIC8vIHNob3VsZCB3ZSBkZWNvZGUgc3RyaW5ncyBpbnRvIGJ1ZmZlcnMgYmVmb3JlIHBhc3NpbmcgdG8gX3dyaXRlP1xuICAvLyB0aGlzIGlzIGhlcmUgc28gdGhhdCBzb21lIG5vZGUtY29yZSBzdHJlYW1zIGNhbiBvcHRpbWl6ZSBzdHJpbmdcbiAgLy8gaGFuZGxpbmcgYXQgYSBsb3dlciBsZXZlbC5cbiAgdmFyIG5vRGVjb2RlID0gb3B0aW9ucy5kZWNvZGVTdHJpbmdzID09PSBmYWxzZTtcbiAgdGhpcy5kZWNvZGVTdHJpbmdzID0gIW5vRGVjb2RlO1xuXG4gIC8vIENyeXB0byBpcyBraW5kIG9mIG9sZCBhbmQgY3J1c3R5LiAgSGlzdG9yaWNhbGx5LCBpdHMgZGVmYXVsdCBzdHJpbmdcbiAgLy8gZW5jb2RpbmcgaXMgJ2JpbmFyeScgc28gd2UgaGF2ZSB0byBtYWtlIHRoaXMgY29uZmlndXJhYmxlLlxuICAvLyBFdmVyeXRoaW5nIGVsc2UgaW4gdGhlIHVuaXZlcnNlIHVzZXMgJ3V0ZjgnLCB0aG91Z2guXG4gIHRoaXMuZGVmYXVsdEVuY29kaW5nID0gb3B0aW9ucy5kZWZhdWx0RW5jb2RpbmcgfHwgJ3V0ZjgnO1xuXG4gIC8vIG5vdCBhbiBhY3R1YWwgYnVmZmVyIHdlIGtlZXAgdHJhY2sgb2YsIGJ1dCBhIG1lYXN1cmVtZW50XG4gIC8vIG9mIGhvdyBtdWNoIHdlJ3JlIHdhaXRpbmcgdG8gZ2V0IHB1c2hlZCB0byBzb21lIHVuZGVybHlpbmdcbiAgLy8gc29ja2V0IG9yIGZpbGUuXG4gIHRoaXMubGVuZ3RoID0gMDtcblxuICAvLyBhIGZsYWcgdG8gc2VlIHdoZW4gd2UncmUgaW4gdGhlIG1pZGRsZSBvZiBhIHdyaXRlLlxuICB0aGlzLndyaXRpbmcgPSBmYWxzZTtcblxuICAvLyB3aGVuIHRydWUgYWxsIHdyaXRlcyB3aWxsIGJlIGJ1ZmZlcmVkIHVudGlsIC51bmNvcmsoKSBjYWxsXG4gIHRoaXMuY29ya2VkID0gMDtcblxuICAvLyBhIGZsYWcgdG8gYmUgYWJsZSB0byB0ZWxsIGlmIHRoZSBvbndyaXRlIGNiIGlzIGNhbGxlZCBpbW1lZGlhdGVseSxcbiAgLy8gb3Igb24gYSBsYXRlciB0aWNrLiAgV2Ugc2V0IHRoaXMgdG8gdHJ1ZSBhdCBmaXJzdCwgYmVjYXVzZSBhbnlcbiAgLy8gYWN0aW9ucyB0aGF0IHNob3VsZG4ndCBoYXBwZW4gdW50aWwgXCJsYXRlclwiIHNob3VsZCBnZW5lcmFsbHkgYWxzb1xuICAvLyBub3QgaGFwcGVuIGJlZm9yZSB0aGUgZmlyc3Qgd3JpdGUgY2FsbC5cbiAgdGhpcy5zeW5jID0gdHJ1ZTtcblxuICAvLyBhIGZsYWcgdG8ga25vdyBpZiB3ZSdyZSBwcm9jZXNzaW5nIHByZXZpb3VzbHkgYnVmZmVyZWQgaXRlbXMsIHdoaWNoXG4gIC8vIG1heSBjYWxsIHRoZSBfd3JpdGUoKSBjYWxsYmFjayBpbiB0aGUgc2FtZSB0aWNrLCBzbyB0aGF0IHdlIGRvbid0XG4gIC8vIGVuZCB1cCBpbiBhbiBvdmVybGFwcGVkIG9ud3JpdGUgc2l0dWF0aW9uLlxuICB0aGlzLmJ1ZmZlclByb2Nlc3NpbmcgPSBmYWxzZTtcblxuICAvLyB0aGUgY2FsbGJhY2sgdGhhdCdzIHBhc3NlZCB0byBfd3JpdGUoY2h1bmssY2IpXG4gIHRoaXMub253cml0ZSA9IGZ1bmN0aW9uKGVyKSB7XG4gICAgb253cml0ZShzdHJlYW0sIGVyKTtcbiAgfTtcblxuICAvLyB0aGUgY2FsbGJhY2sgdGhhdCB0aGUgdXNlciBzdXBwbGllcyB0byB3cml0ZShjaHVuayxlbmNvZGluZyxjYilcbiAgdGhpcy53cml0ZWNiID0gbnVsbDtcblxuICAvLyB0aGUgYW1vdW50IHRoYXQgaXMgYmVpbmcgd3JpdHRlbiB3aGVuIF93cml0ZSBpcyBjYWxsZWQuXG4gIHRoaXMud3JpdGVsZW4gPSAwO1xuXG4gIHRoaXMuYnVmZmVyID0gW107XG5cbiAgLy8gbnVtYmVyIG9mIHBlbmRpbmcgdXNlci1zdXBwbGllZCB3cml0ZSBjYWxsYmFja3NcbiAgLy8gdGhpcyBtdXN0IGJlIDAgYmVmb3JlICdmaW5pc2gnIGNhbiBiZSBlbWl0dGVkXG4gIHRoaXMucGVuZGluZ2NiID0gMDtcblxuICAvLyBlbWl0IHByZWZpbmlzaCBpZiB0aGUgb25seSB0aGluZyB3ZSdyZSB3YWl0aW5nIGZvciBpcyBfd3JpdGUgY2JzXG4gIC8vIFRoaXMgaXMgcmVsZXZhbnQgZm9yIHN5bmNocm9ub3VzIFRyYW5zZm9ybSBzdHJlYW1zXG4gIHRoaXMucHJlZmluaXNoZWQgPSBmYWxzZTtcblxuICAvLyBUcnVlIGlmIHRoZSBlcnJvciB3YXMgYWxyZWFkeSBlbWl0dGVkIGFuZCBzaG91bGQgbm90IGJlIHRocm93biBhZ2FpblxuICB0aGlzLmVycm9yRW1pdHRlZCA9IGZhbHNlO1xufVxuXG5mdW5jdGlvbiBXcml0YWJsZShvcHRpb25zKSB7XG4gIHZhciBEdXBsZXggPSByZXF1aXJlKCcuL19zdHJlYW1fZHVwbGV4Jyk7XG5cbiAgLy8gV3JpdGFibGUgY3RvciBpcyBhcHBsaWVkIHRvIER1cGxleGVzLCB0aG91Z2ggdGhleSdyZSBub3RcbiAgLy8gaW5zdGFuY2VvZiBXcml0YWJsZSwgdGhleSdyZSBpbnN0YW5jZW9mIFJlYWRhYmxlLlxuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgV3JpdGFibGUpICYmICEodGhpcyBpbnN0YW5jZW9mIER1cGxleCkpXG4gICAgcmV0dXJuIG5ldyBXcml0YWJsZShvcHRpb25zKTtcblxuICB0aGlzLl93cml0YWJsZVN0YXRlID0gbmV3IFdyaXRhYmxlU3RhdGUob3B0aW9ucywgdGhpcyk7XG5cbiAgLy8gbGVnYWN5LlxuICB0aGlzLndyaXRhYmxlID0gdHJ1ZTtcblxuICBTdHJlYW0uY2FsbCh0aGlzKTtcbn1cblxuLy8gT3RoZXJ3aXNlIHBlb3BsZSBjYW4gcGlwZSBXcml0YWJsZSBzdHJlYW1zLCB3aGljaCBpcyBqdXN0IHdyb25nLlxuV3JpdGFibGUucHJvdG90eXBlLnBpcGUgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5lbWl0KCdlcnJvcicsIG5ldyBFcnJvcignQ2Fubm90IHBpcGUuIE5vdCByZWFkYWJsZS4nKSk7XG59O1xuXG5cbmZ1bmN0aW9uIHdyaXRlQWZ0ZXJFbmQoc3RyZWFtLCBzdGF0ZSwgY2IpIHtcbiAgdmFyIGVyID0gbmV3IEVycm9yKCd3cml0ZSBhZnRlciBlbmQnKTtcbiAgLy8gVE9ETzogZGVmZXIgZXJyb3IgZXZlbnRzIGNvbnNpc3RlbnRseSBldmVyeXdoZXJlLCBub3QganVzdCB0aGUgY2JcbiAgc3RyZWFtLmVtaXQoJ2Vycm9yJywgZXIpO1xuICBwcm9jZXNzLm5leHRUaWNrKGZ1bmN0aW9uKCkge1xuICAgIGNiKGVyKTtcbiAgfSk7XG59XG5cbi8vIElmIHdlIGdldCBzb21ldGhpbmcgdGhhdCBpcyBub3QgYSBidWZmZXIsIHN0cmluZywgbnVsbCwgb3IgdW5kZWZpbmVkLFxuLy8gYW5kIHdlJ3JlIG5vdCBpbiBvYmplY3RNb2RlLCB0aGVuIHRoYXQncyBhbiBlcnJvci5cbi8vIE90aGVyd2lzZSBzdHJlYW0gY2h1bmtzIGFyZSBhbGwgY29uc2lkZXJlZCB0byBiZSBvZiBsZW5ndGg9MSwgYW5kIHRoZVxuLy8gd2F0ZXJtYXJrcyBkZXRlcm1pbmUgaG93IG1hbnkgb2JqZWN0cyB0byBrZWVwIGluIHRoZSBidWZmZXIsIHJhdGhlciB0aGFuXG4vLyBob3cgbWFueSBieXRlcyBvciBjaGFyYWN0ZXJzLlxuZnVuY3Rpb24gdmFsaWRDaHVuayhzdHJlYW0sIHN0YXRlLCBjaHVuaywgY2IpIHtcbiAgdmFyIHZhbGlkID0gdHJ1ZTtcbiAgaWYgKCF1dGlsLmlzQnVmZmVyKGNodW5rKSAmJlxuICAgICAgIXV0aWwuaXNTdHJpbmcoY2h1bmspICYmXG4gICAgICAhdXRpbC5pc051bGxPclVuZGVmaW5lZChjaHVuaykgJiZcbiAgICAgICFzdGF0ZS5vYmplY3RNb2RlKSB7XG4gICAgdmFyIGVyID0gbmV3IFR5cGVFcnJvcignSW52YWxpZCBub24tc3RyaW5nL2J1ZmZlciBjaHVuaycpO1xuICAgIHN0cmVhbS5lbWl0KCdlcnJvcicsIGVyKTtcbiAgICBwcm9jZXNzLm5leHRUaWNrKGZ1bmN0aW9uKCkge1xuICAgICAgY2IoZXIpO1xuICAgIH0pO1xuICAgIHZhbGlkID0gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHZhbGlkO1xufVxuXG5Xcml0YWJsZS5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbihjaHVuaywgZW5jb2RpbmcsIGNiKSB7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX3dyaXRhYmxlU3RhdGU7XG4gIHZhciByZXQgPSBmYWxzZTtcblxuICBpZiAodXRpbC5pc0Z1bmN0aW9uKGVuY29kaW5nKSkge1xuICAgIGNiID0gZW5jb2Rpbmc7XG4gICAgZW5jb2RpbmcgPSBudWxsO1xuICB9XG5cbiAgaWYgKHV0aWwuaXNCdWZmZXIoY2h1bmspKVxuICAgIGVuY29kaW5nID0gJ2J1ZmZlcic7XG4gIGVsc2UgaWYgKCFlbmNvZGluZylcbiAgICBlbmNvZGluZyA9IHN0YXRlLmRlZmF1bHRFbmNvZGluZztcblxuICBpZiAoIXV0aWwuaXNGdW5jdGlvbihjYikpXG4gICAgY2IgPSBmdW5jdGlvbigpIHt9O1xuXG4gIGlmIChzdGF0ZS5lbmRlZClcbiAgICB3cml0ZUFmdGVyRW5kKHRoaXMsIHN0YXRlLCBjYik7XG4gIGVsc2UgaWYgKHZhbGlkQ2h1bmsodGhpcywgc3RhdGUsIGNodW5rLCBjYikpIHtcbiAgICBzdGF0ZS5wZW5kaW5nY2IrKztcbiAgICByZXQgPSB3cml0ZU9yQnVmZmVyKHRoaXMsIHN0YXRlLCBjaHVuaywgZW5jb2RpbmcsIGNiKTtcbiAgfVxuXG4gIHJldHVybiByZXQ7XG59O1xuXG5Xcml0YWJsZS5wcm90b3R5cGUuY29yayA9IGZ1bmN0aW9uKCkge1xuICB2YXIgc3RhdGUgPSB0aGlzLl93cml0YWJsZVN0YXRlO1xuXG4gIHN0YXRlLmNvcmtlZCsrO1xufTtcblxuV3JpdGFibGUucHJvdG90eXBlLnVuY29yayA9IGZ1bmN0aW9uKCkge1xuICB2YXIgc3RhdGUgPSB0aGlzLl93cml0YWJsZVN0YXRlO1xuXG4gIGlmIChzdGF0ZS5jb3JrZWQpIHtcbiAgICBzdGF0ZS5jb3JrZWQtLTtcblxuICAgIGlmICghc3RhdGUud3JpdGluZyAmJlxuICAgICAgICAhc3RhdGUuY29ya2VkICYmXG4gICAgICAgICFzdGF0ZS5maW5pc2hlZCAmJlxuICAgICAgICAhc3RhdGUuYnVmZmVyUHJvY2Vzc2luZyAmJlxuICAgICAgICBzdGF0ZS5idWZmZXIubGVuZ3RoKVxuICAgICAgY2xlYXJCdWZmZXIodGhpcywgc3RhdGUpO1xuICB9XG59O1xuXG5mdW5jdGlvbiBkZWNvZGVDaHVuayhzdGF0ZSwgY2h1bmssIGVuY29kaW5nKSB7XG4gIGlmICghc3RhdGUub2JqZWN0TW9kZSAmJlxuICAgICAgc3RhdGUuZGVjb2RlU3RyaW5ncyAhPT0gZmFsc2UgJiZcbiAgICAgIHV0aWwuaXNTdHJpbmcoY2h1bmspKSB7XG4gICAgY2h1bmsgPSBuZXcgQnVmZmVyKGNodW5rLCBlbmNvZGluZyk7XG4gIH1cbiAgcmV0dXJuIGNodW5rO1xufVxuXG4vLyBpZiB3ZSdyZSBhbHJlYWR5IHdyaXRpbmcgc29tZXRoaW5nLCB0aGVuIGp1c3QgcHV0IHRoaXNcbi8vIGluIHRoZSBxdWV1ZSwgYW5kIHdhaXQgb3VyIHR1cm4uICBPdGhlcndpc2UsIGNhbGwgX3dyaXRlXG4vLyBJZiB3ZSByZXR1cm4gZmFsc2UsIHRoZW4gd2UgbmVlZCBhIGRyYWluIGV2ZW50LCBzbyBzZXQgdGhhdCBmbGFnLlxuZnVuY3Rpb24gd3JpdGVPckJ1ZmZlcihzdHJlYW0sIHN0YXRlLCBjaHVuaywgZW5jb2RpbmcsIGNiKSB7XG4gIGNodW5rID0gZGVjb2RlQ2h1bmsoc3RhdGUsIGNodW5rLCBlbmNvZGluZyk7XG4gIGlmICh1dGlsLmlzQnVmZmVyKGNodW5rKSlcbiAgICBlbmNvZGluZyA9ICdidWZmZXInO1xuICB2YXIgbGVuID0gc3RhdGUub2JqZWN0TW9kZSA/IDEgOiBjaHVuay5sZW5ndGg7XG5cbiAgc3RhdGUubGVuZ3RoICs9IGxlbjtcblxuICB2YXIgcmV0ID0gc3RhdGUubGVuZ3RoIDwgc3RhdGUuaGlnaFdhdGVyTWFyaztcbiAgLy8gd2UgbXVzdCBlbnN1cmUgdGhhdCBwcmV2aW91cyBuZWVkRHJhaW4gd2lsbCBub3QgYmUgcmVzZXQgdG8gZmFsc2UuXG4gIGlmICghcmV0KVxuICAgIHN0YXRlLm5lZWREcmFpbiA9IHRydWU7XG5cbiAgaWYgKHN0YXRlLndyaXRpbmcgfHwgc3RhdGUuY29ya2VkKVxuICAgIHN0YXRlLmJ1ZmZlci5wdXNoKG5ldyBXcml0ZVJlcShjaHVuaywgZW5jb2RpbmcsIGNiKSk7XG4gIGVsc2VcbiAgICBkb1dyaXRlKHN0cmVhbSwgc3RhdGUsIGZhbHNlLCBsZW4sIGNodW5rLCBlbmNvZGluZywgY2IpO1xuXG4gIHJldHVybiByZXQ7XG59XG5cbmZ1bmN0aW9uIGRvV3JpdGUoc3RyZWFtLCBzdGF0ZSwgd3JpdGV2LCBsZW4sIGNodW5rLCBlbmNvZGluZywgY2IpIHtcbiAgc3RhdGUud3JpdGVsZW4gPSBsZW47XG4gIHN0YXRlLndyaXRlY2IgPSBjYjtcbiAgc3RhdGUud3JpdGluZyA9IHRydWU7XG4gIHN0YXRlLnN5bmMgPSB0cnVlO1xuICBpZiAod3JpdGV2KVxuICAgIHN0cmVhbS5fd3JpdGV2KGNodW5rLCBzdGF0ZS5vbndyaXRlKTtcbiAgZWxzZVxuICAgIHN0cmVhbS5fd3JpdGUoY2h1bmssIGVuY29kaW5nLCBzdGF0ZS5vbndyaXRlKTtcbiAgc3RhdGUuc3luYyA9IGZhbHNlO1xufVxuXG5mdW5jdGlvbiBvbndyaXRlRXJyb3Ioc3RyZWFtLCBzdGF0ZSwgc3luYywgZXIsIGNiKSB7XG4gIGlmIChzeW5jKVxuICAgIHByb2Nlc3MubmV4dFRpY2soZnVuY3Rpb24oKSB7XG4gICAgICBzdGF0ZS5wZW5kaW5nY2ItLTtcbiAgICAgIGNiKGVyKTtcbiAgICB9KTtcbiAgZWxzZSB7XG4gICAgc3RhdGUucGVuZGluZ2NiLS07XG4gICAgY2IoZXIpO1xuICB9XG5cbiAgc3RyZWFtLl93cml0YWJsZVN0YXRlLmVycm9yRW1pdHRlZCA9IHRydWU7XG4gIHN0cmVhbS5lbWl0KCdlcnJvcicsIGVyKTtcbn1cblxuZnVuY3Rpb24gb253cml0ZVN0YXRlVXBkYXRlKHN0YXRlKSB7XG4gIHN0YXRlLndyaXRpbmcgPSBmYWxzZTtcbiAgc3RhdGUud3JpdGVjYiA9IG51bGw7XG4gIHN0YXRlLmxlbmd0aCAtPSBzdGF0ZS53cml0ZWxlbjtcbiAgc3RhdGUud3JpdGVsZW4gPSAwO1xufVxuXG5mdW5jdGlvbiBvbndyaXRlKHN0cmVhbSwgZXIpIHtcbiAgdmFyIHN0YXRlID0gc3RyZWFtLl93cml0YWJsZVN0YXRlO1xuICB2YXIgc3luYyA9IHN0YXRlLnN5bmM7XG4gIHZhciBjYiA9IHN0YXRlLndyaXRlY2I7XG5cbiAgb253cml0ZVN0YXRlVXBkYXRlKHN0YXRlKTtcblxuICBpZiAoZXIpXG4gICAgb253cml0ZUVycm9yKHN0cmVhbSwgc3RhdGUsIHN5bmMsIGVyLCBjYik7XG4gIGVsc2Uge1xuICAgIC8vIENoZWNrIGlmIHdlJ3JlIGFjdHVhbGx5IHJlYWR5IHRvIGZpbmlzaCwgYnV0IGRvbid0IGVtaXQgeWV0XG4gICAgdmFyIGZpbmlzaGVkID0gbmVlZEZpbmlzaChzdHJlYW0sIHN0YXRlKTtcblxuICAgIGlmICghZmluaXNoZWQgJiZcbiAgICAgICAgIXN0YXRlLmNvcmtlZCAmJlxuICAgICAgICAhc3RhdGUuYnVmZmVyUHJvY2Vzc2luZyAmJlxuICAgICAgICBzdGF0ZS5idWZmZXIubGVuZ3RoKSB7XG4gICAgICBjbGVhckJ1ZmZlcihzdHJlYW0sIHN0YXRlKTtcbiAgICB9XG5cbiAgICBpZiAoc3luYykge1xuICAgICAgcHJvY2Vzcy5uZXh0VGljayhmdW5jdGlvbigpIHtcbiAgICAgICAgYWZ0ZXJXcml0ZShzdHJlYW0sIHN0YXRlLCBmaW5pc2hlZCwgY2IpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFmdGVyV3JpdGUoc3RyZWFtLCBzdGF0ZSwgZmluaXNoZWQsIGNiKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gYWZ0ZXJXcml0ZShzdHJlYW0sIHN0YXRlLCBmaW5pc2hlZCwgY2IpIHtcbiAgaWYgKCFmaW5pc2hlZClcbiAgICBvbndyaXRlRHJhaW4oc3RyZWFtLCBzdGF0ZSk7XG4gIHN0YXRlLnBlbmRpbmdjYi0tO1xuICBjYigpO1xuICBmaW5pc2hNYXliZShzdHJlYW0sIHN0YXRlKTtcbn1cblxuLy8gTXVzdCBmb3JjZSBjYWxsYmFjayB0byBiZSBjYWxsZWQgb24gbmV4dFRpY2ssIHNvIHRoYXQgd2UgZG9uJ3Rcbi8vIGVtaXQgJ2RyYWluJyBiZWZvcmUgdGhlIHdyaXRlKCkgY29uc3VtZXIgZ2V0cyB0aGUgJ2ZhbHNlJyByZXR1cm5cbi8vIHZhbHVlLCBhbmQgaGFzIGEgY2hhbmNlIHRvIGF0dGFjaCBhICdkcmFpbicgbGlzdGVuZXIuXG5mdW5jdGlvbiBvbndyaXRlRHJhaW4oc3RyZWFtLCBzdGF0ZSkge1xuICBpZiAoc3RhdGUubGVuZ3RoID09PSAwICYmIHN0YXRlLm5lZWREcmFpbikge1xuICAgIHN0YXRlLm5lZWREcmFpbiA9IGZhbHNlO1xuICAgIHN0cmVhbS5lbWl0KCdkcmFpbicpO1xuICB9XG59XG5cblxuLy8gaWYgdGhlcmUncyBzb21ldGhpbmcgaW4gdGhlIGJ1ZmZlciB3YWl0aW5nLCB0aGVuIHByb2Nlc3MgaXRcbmZ1bmN0aW9uIGNsZWFyQnVmZmVyKHN0cmVhbSwgc3RhdGUpIHtcbiAgc3RhdGUuYnVmZmVyUHJvY2Vzc2luZyA9IHRydWU7XG5cbiAgaWYgKHN0cmVhbS5fd3JpdGV2ICYmIHN0YXRlLmJ1ZmZlci5sZW5ndGggPiAxKSB7XG4gICAgLy8gRmFzdCBjYXNlLCB3cml0ZSBldmVyeXRoaW5nIHVzaW5nIF93cml0ZXYoKVxuICAgIHZhciBjYnMgPSBbXTtcbiAgICBmb3IgKHZhciBjID0gMDsgYyA8IHN0YXRlLmJ1ZmZlci5sZW5ndGg7IGMrKylcbiAgICAgIGNicy5wdXNoKHN0YXRlLmJ1ZmZlcltjXS5jYWxsYmFjayk7XG5cbiAgICAvLyBjb3VudCB0aGUgb25lIHdlIGFyZSBhZGRpbmcsIGFzIHdlbGwuXG4gICAgLy8gVE9ETyhpc2FhY3MpIGNsZWFuIHRoaXMgdXBcbiAgICBzdGF0ZS5wZW5kaW5nY2IrKztcbiAgICBkb1dyaXRlKHN0cmVhbSwgc3RhdGUsIHRydWUsIHN0YXRlLmxlbmd0aCwgc3RhdGUuYnVmZmVyLCAnJywgZnVuY3Rpb24oZXJyKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNicy5sZW5ndGg7IGkrKykge1xuICAgICAgICBzdGF0ZS5wZW5kaW5nY2ItLTtcbiAgICAgICAgY2JzW2ldKGVycik7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBDbGVhciBidWZmZXJcbiAgICBzdGF0ZS5idWZmZXIgPSBbXTtcbiAgfSBlbHNlIHtcbiAgICAvLyBTbG93IGNhc2UsIHdyaXRlIGNodW5rcyBvbmUtYnktb25lXG4gICAgZm9yICh2YXIgYyA9IDA7IGMgPCBzdGF0ZS5idWZmZXIubGVuZ3RoOyBjKyspIHtcbiAgICAgIHZhciBlbnRyeSA9IHN0YXRlLmJ1ZmZlcltjXTtcbiAgICAgIHZhciBjaHVuayA9IGVudHJ5LmNodW5rO1xuICAgICAgdmFyIGVuY29kaW5nID0gZW50cnkuZW5jb2Rpbmc7XG4gICAgICB2YXIgY2IgPSBlbnRyeS5jYWxsYmFjaztcbiAgICAgIHZhciBsZW4gPSBzdGF0ZS5vYmplY3RNb2RlID8gMSA6IGNodW5rLmxlbmd0aDtcblxuICAgICAgZG9Xcml0ZShzdHJlYW0sIHN0YXRlLCBmYWxzZSwgbGVuLCBjaHVuaywgZW5jb2RpbmcsIGNiKTtcblxuICAgICAgLy8gaWYgd2UgZGlkbid0IGNhbGwgdGhlIG9ud3JpdGUgaW1tZWRpYXRlbHksIHRoZW5cbiAgICAgIC8vIGl0IG1lYW5zIHRoYXQgd2UgbmVlZCB0byB3YWl0IHVudGlsIGl0IGRvZXMuXG4gICAgICAvLyBhbHNvLCB0aGF0IG1lYW5zIHRoYXQgdGhlIGNodW5rIGFuZCBjYiBhcmUgY3VycmVudGx5XG4gICAgICAvLyBiZWluZyBwcm9jZXNzZWQsIHNvIG1vdmUgdGhlIGJ1ZmZlciBjb3VudGVyIHBhc3QgdGhlbS5cbiAgICAgIGlmIChzdGF0ZS53cml0aW5nKSB7XG4gICAgICAgIGMrKztcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGMgPCBzdGF0ZS5idWZmZXIubGVuZ3RoKVxuICAgICAgc3RhdGUuYnVmZmVyID0gc3RhdGUuYnVmZmVyLnNsaWNlKGMpO1xuICAgIGVsc2VcbiAgICAgIHN0YXRlLmJ1ZmZlci5sZW5ndGggPSAwO1xuICB9XG5cbiAgc3RhdGUuYnVmZmVyUHJvY2Vzc2luZyA9IGZhbHNlO1xufVxuXG5Xcml0YWJsZS5wcm90b3R5cGUuX3dyaXRlID0gZnVuY3Rpb24oY2h1bmssIGVuY29kaW5nLCBjYikge1xuICBjYihuZXcgRXJyb3IoJ25vdCBpbXBsZW1lbnRlZCcpKTtcblxufTtcblxuV3JpdGFibGUucHJvdG90eXBlLl93cml0ZXYgPSBudWxsO1xuXG5Xcml0YWJsZS5wcm90b3R5cGUuZW5kID0gZnVuY3Rpb24oY2h1bmssIGVuY29kaW5nLCBjYikge1xuICB2YXIgc3RhdGUgPSB0aGlzLl93cml0YWJsZVN0YXRlO1xuXG4gIGlmICh1dGlsLmlzRnVuY3Rpb24oY2h1bmspKSB7XG4gICAgY2IgPSBjaHVuaztcbiAgICBjaHVuayA9IG51bGw7XG4gICAgZW5jb2RpbmcgPSBudWxsO1xuICB9IGVsc2UgaWYgKHV0aWwuaXNGdW5jdGlvbihlbmNvZGluZykpIHtcbiAgICBjYiA9IGVuY29kaW5nO1xuICAgIGVuY29kaW5nID0gbnVsbDtcbiAgfVxuXG4gIGlmICghdXRpbC5pc051bGxPclVuZGVmaW5lZChjaHVuaykpXG4gICAgdGhpcy53cml0ZShjaHVuaywgZW5jb2RpbmcpO1xuXG4gIC8vIC5lbmQoKSBmdWxseSB1bmNvcmtzXG4gIGlmIChzdGF0ZS5jb3JrZWQpIHtcbiAgICBzdGF0ZS5jb3JrZWQgPSAxO1xuICAgIHRoaXMudW5jb3JrKCk7XG4gIH1cblxuICAvLyBpZ25vcmUgdW5uZWNlc3NhcnkgZW5kKCkgY2FsbHMuXG4gIGlmICghc3RhdGUuZW5kaW5nICYmICFzdGF0ZS5maW5pc2hlZClcbiAgICBlbmRXcml0YWJsZSh0aGlzLCBzdGF0ZSwgY2IpO1xufTtcblxuXG5mdW5jdGlvbiBuZWVkRmluaXNoKHN0cmVhbSwgc3RhdGUpIHtcbiAgcmV0dXJuIChzdGF0ZS5lbmRpbmcgJiZcbiAgICAgICAgICBzdGF0ZS5sZW5ndGggPT09IDAgJiZcbiAgICAgICAgICAhc3RhdGUuZmluaXNoZWQgJiZcbiAgICAgICAgICAhc3RhdGUud3JpdGluZyk7XG59XG5cbmZ1bmN0aW9uIHByZWZpbmlzaChzdHJlYW0sIHN0YXRlKSB7XG4gIGlmICghc3RhdGUucHJlZmluaXNoZWQpIHtcbiAgICBzdGF0ZS5wcmVmaW5pc2hlZCA9IHRydWU7XG4gICAgc3RyZWFtLmVtaXQoJ3ByZWZpbmlzaCcpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGZpbmlzaE1heWJlKHN0cmVhbSwgc3RhdGUpIHtcbiAgdmFyIG5lZWQgPSBuZWVkRmluaXNoKHN0cmVhbSwgc3RhdGUpO1xuICBpZiAobmVlZCkge1xuICAgIGlmIChzdGF0ZS5wZW5kaW5nY2IgPT09IDApIHtcbiAgICAgIHByZWZpbmlzaChzdHJlYW0sIHN0YXRlKTtcbiAgICAgIHN0YXRlLmZpbmlzaGVkID0gdHJ1ZTtcbiAgICAgIHN0cmVhbS5lbWl0KCdmaW5pc2gnKTtcbiAgICB9IGVsc2VcbiAgICAgIHByZWZpbmlzaChzdHJlYW0sIHN0YXRlKTtcbiAgfVxuICByZXR1cm4gbmVlZDtcbn1cblxuZnVuY3Rpb24gZW5kV3JpdGFibGUoc3RyZWFtLCBzdGF0ZSwgY2IpIHtcbiAgc3RhdGUuZW5kaW5nID0gdHJ1ZTtcbiAgZmluaXNoTWF5YmUoc3RyZWFtLCBzdGF0ZSk7XG4gIGlmIChjYikge1xuICAgIGlmIChzdGF0ZS5maW5pc2hlZClcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soY2IpO1xuICAgIGVsc2VcbiAgICAgIHN0cmVhbS5vbmNlKCdmaW5pc2gnLCBjYik7XG4gIH1cbiAgc3RhdGUuZW5kZWQgPSB0cnVlO1xufVxuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbi8vIE5PVEU6IFRoZXNlIHR5cGUgY2hlY2tpbmcgZnVuY3Rpb25zIGludGVudGlvbmFsbHkgZG9uJ3QgdXNlIGBpbnN0YW5jZW9mYFxuLy8gYmVjYXVzZSBpdCBpcyBmcmFnaWxlIGFuZCBjYW4gYmUgZWFzaWx5IGZha2VkIHdpdGggYE9iamVjdC5jcmVhdGUoKWAuXG5mdW5jdGlvbiBpc0FycmF5KGFyKSB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KGFyKTtcbn1cbmV4cG9ydHMuaXNBcnJheSA9IGlzQXJyYXk7XG5cbmZ1bmN0aW9uIGlzQm9vbGVhbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdib29sZWFuJztcbn1cbmV4cG9ydHMuaXNCb29sZWFuID0gaXNCb29sZWFuO1xuXG5mdW5jdGlvbiBpc051bGwoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IG51bGw7XG59XG5leHBvcnRzLmlzTnVsbCA9IGlzTnVsbDtcblxuZnVuY3Rpb24gaXNOdWxsT3JVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNOdWxsT3JVbmRlZmluZWQgPSBpc051bGxPclVuZGVmaW5lZDtcblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cbmV4cG9ydHMuaXNOdW1iZXIgPSBpc051bWJlcjtcblxuZnVuY3Rpb24gaXNTdHJpbmcoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnc3RyaW5nJztcbn1cbmV4cG9ydHMuaXNTdHJpbmcgPSBpc1N0cmluZztcblxuZnVuY3Rpb24gaXNTeW1ib2woYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnc3ltYm9sJztcbn1cbmV4cG9ydHMuaXNTeW1ib2wgPSBpc1N5bWJvbDtcblxuZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cbmV4cG9ydHMuaXNVbmRlZmluZWQgPSBpc1VuZGVmaW5lZDtcblxuZnVuY3Rpb24gaXNSZWdFeHAocmUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KHJlKSAmJiBvYmplY3RUb1N0cmluZyhyZSkgPT09ICdbb2JqZWN0IFJlZ0V4cF0nO1xufVxuZXhwb3J0cy5pc1JlZ0V4cCA9IGlzUmVnRXhwO1xuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNPYmplY3QgPSBpc09iamVjdDtcblxuZnVuY3Rpb24gaXNEYXRlKGQpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KGQpICYmIG9iamVjdFRvU3RyaW5nKGQpID09PSAnW29iamVjdCBEYXRlXSc7XG59XG5leHBvcnRzLmlzRGF0ZSA9IGlzRGF0ZTtcblxuZnVuY3Rpb24gaXNFcnJvcihlKSB7XG4gIHJldHVybiBpc09iamVjdChlKSAmJlxuICAgICAgKG9iamVjdFRvU3RyaW5nKGUpID09PSAnW29iamVjdCBFcnJvcl0nIHx8IGUgaW5zdGFuY2VvZiBFcnJvcik7XG59XG5leHBvcnRzLmlzRXJyb3IgPSBpc0Vycm9yO1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cbmV4cG9ydHMuaXNGdW5jdGlvbiA9IGlzRnVuY3Rpb247XG5cbmZ1bmN0aW9uIGlzUHJpbWl0aXZlKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnYm9vbGVhbicgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdudW1iZXInIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnc3RyaW5nJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCcgfHwgIC8vIEVTNiBzeW1ib2xcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICd1bmRlZmluZWQnO1xufVxuZXhwb3J0cy5pc1ByaW1pdGl2ZSA9IGlzUHJpbWl0aXZlO1xuXG5mdW5jdGlvbiBpc0J1ZmZlcihhcmcpIHtcbiAgcmV0dXJuIEJ1ZmZlci5pc0J1ZmZlcihhcmcpO1xufVxuZXhwb3J0cy5pc0J1ZmZlciA9IGlzQnVmZmVyO1xuXG5mdW5jdGlvbiBvYmplY3RUb1N0cmluZyhvKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobyk7XG59IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiLi9saWIvX3N0cmVhbV9wYXNzdGhyb3VnaC5qc1wiKVxuIiwiZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9saWIvX3N0cmVhbV9yZWFkYWJsZS5qcycpO1xuZXhwb3J0cy5TdHJlYW0gPSByZXF1aXJlKCdzdHJlYW0nKTtcbmV4cG9ydHMuUmVhZGFibGUgPSBleHBvcnRzO1xuZXhwb3J0cy5Xcml0YWJsZSA9IHJlcXVpcmUoJy4vbGliL19zdHJlYW1fd3JpdGFibGUuanMnKTtcbmV4cG9ydHMuRHVwbGV4ID0gcmVxdWlyZSgnLi9saWIvX3N0cmVhbV9kdXBsZXguanMnKTtcbmV4cG9ydHMuVHJhbnNmb3JtID0gcmVxdWlyZSgnLi9saWIvX3N0cmVhbV90cmFuc2Zvcm0uanMnKTtcbmV4cG9ydHMuUGFzc1Rocm91Z2ggPSByZXF1aXJlKCcuL2xpYi9fc3RyZWFtX3Bhc3N0aHJvdWdoLmpzJyk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCIuL2xpYi9fc3RyZWFtX3RyYW5zZm9ybS5qc1wiKVxuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiLi9saWIvX3N0cmVhbV93cml0YWJsZS5qc1wiKVxuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbm1vZHVsZS5leHBvcnRzID0gU3RyZWFtO1xuXG52YXIgRUUgPSByZXF1aXJlKCdldmVudHMnKS5FdmVudEVtaXR0ZXI7XG52YXIgaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpO1xuXG5pbmhlcml0cyhTdHJlYW0sIEVFKTtcblN0cmVhbS5SZWFkYWJsZSA9IHJlcXVpcmUoJ3JlYWRhYmxlLXN0cmVhbS9yZWFkYWJsZS5qcycpO1xuU3RyZWFtLldyaXRhYmxlID0gcmVxdWlyZSgncmVhZGFibGUtc3RyZWFtL3dyaXRhYmxlLmpzJyk7XG5TdHJlYW0uRHVwbGV4ID0gcmVxdWlyZSgncmVhZGFibGUtc3RyZWFtL2R1cGxleC5qcycpO1xuU3RyZWFtLlRyYW5zZm9ybSA9IHJlcXVpcmUoJ3JlYWRhYmxlLXN0cmVhbS90cmFuc2Zvcm0uanMnKTtcblN0cmVhbS5QYXNzVGhyb3VnaCA9IHJlcXVpcmUoJ3JlYWRhYmxlLXN0cmVhbS9wYXNzdGhyb3VnaC5qcycpO1xuXG4vLyBCYWNrd2FyZHMtY29tcGF0IHdpdGggbm9kZSAwLjQueFxuU3RyZWFtLlN0cmVhbSA9IFN0cmVhbTtcblxuXG5cbi8vIG9sZC1zdHlsZSBzdHJlYW1zLiAgTm90ZSB0aGF0IHRoZSBwaXBlIG1ldGhvZCAodGhlIG9ubHkgcmVsZXZhbnRcbi8vIHBhcnQgb2YgdGhpcyBjbGFzcykgaXMgb3ZlcnJpZGRlbiBpbiB0aGUgUmVhZGFibGUgY2xhc3MuXG5cbmZ1bmN0aW9uIFN0cmVhbSgpIHtcbiAgRUUuY2FsbCh0aGlzKTtcbn1cblxuU3RyZWFtLnByb3RvdHlwZS5waXBlID0gZnVuY3Rpb24oZGVzdCwgb3B0aW9ucykge1xuICB2YXIgc291cmNlID0gdGhpcztcblxuICBmdW5jdGlvbiBvbmRhdGEoY2h1bmspIHtcbiAgICBpZiAoZGVzdC53cml0YWJsZSkge1xuICAgICAgaWYgKGZhbHNlID09PSBkZXN0LndyaXRlKGNodW5rKSAmJiBzb3VyY2UucGF1c2UpIHtcbiAgICAgICAgc291cmNlLnBhdXNlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgc291cmNlLm9uKCdkYXRhJywgb25kYXRhKTtcblxuICBmdW5jdGlvbiBvbmRyYWluKCkge1xuICAgIGlmIChzb3VyY2UucmVhZGFibGUgJiYgc291cmNlLnJlc3VtZSkge1xuICAgICAgc291cmNlLnJlc3VtZSgpO1xuICAgIH1cbiAgfVxuXG4gIGRlc3Qub24oJ2RyYWluJywgb25kcmFpbik7XG5cbiAgLy8gSWYgdGhlICdlbmQnIG9wdGlvbiBpcyBub3Qgc3VwcGxpZWQsIGRlc3QuZW5kKCkgd2lsbCBiZSBjYWxsZWQgd2hlblxuICAvLyBzb3VyY2UgZ2V0cyB0aGUgJ2VuZCcgb3IgJ2Nsb3NlJyBldmVudHMuICBPbmx5IGRlc3QuZW5kKCkgb25jZS5cbiAgaWYgKCFkZXN0Ll9pc1N0ZGlvICYmICghb3B0aW9ucyB8fCBvcHRpb25zLmVuZCAhPT0gZmFsc2UpKSB7XG4gICAgc291cmNlLm9uKCdlbmQnLCBvbmVuZCk7XG4gICAgc291cmNlLm9uKCdjbG9zZScsIG9uY2xvc2UpO1xuICB9XG5cbiAgdmFyIGRpZE9uRW5kID0gZmFsc2U7XG4gIGZ1bmN0aW9uIG9uZW5kKCkge1xuICAgIGlmIChkaWRPbkVuZCkgcmV0dXJuO1xuICAgIGRpZE9uRW5kID0gdHJ1ZTtcblxuICAgIGRlc3QuZW5kKCk7XG4gIH1cblxuXG4gIGZ1bmN0aW9uIG9uY2xvc2UoKSB7XG4gICAgaWYgKGRpZE9uRW5kKSByZXR1cm47XG4gICAgZGlkT25FbmQgPSB0cnVlO1xuXG4gICAgaWYgKHR5cGVvZiBkZXN0LmRlc3Ryb3kgPT09ICdmdW5jdGlvbicpIGRlc3QuZGVzdHJveSgpO1xuICB9XG5cbiAgLy8gZG9uJ3QgbGVhdmUgZGFuZ2xpbmcgcGlwZXMgd2hlbiB0aGVyZSBhcmUgZXJyb3JzLlxuICBmdW5jdGlvbiBvbmVycm9yKGVyKSB7XG4gICAgY2xlYW51cCgpO1xuICAgIGlmIChFRS5saXN0ZW5lckNvdW50KHRoaXMsICdlcnJvcicpID09PSAwKSB7XG4gICAgICB0aHJvdyBlcjsgLy8gVW5oYW5kbGVkIHN0cmVhbSBlcnJvciBpbiBwaXBlLlxuICAgIH1cbiAgfVxuXG4gIHNvdXJjZS5vbignZXJyb3InLCBvbmVycm9yKTtcbiAgZGVzdC5vbignZXJyb3InLCBvbmVycm9yKTtcblxuICAvLyByZW1vdmUgYWxsIHRoZSBldmVudCBsaXN0ZW5lcnMgdGhhdCB3ZXJlIGFkZGVkLlxuICBmdW5jdGlvbiBjbGVhbnVwKCkge1xuICAgIHNvdXJjZS5yZW1vdmVMaXN0ZW5lcignZGF0YScsIG9uZGF0YSk7XG4gICAgZGVzdC5yZW1vdmVMaXN0ZW5lcignZHJhaW4nLCBvbmRyYWluKTtcblxuICAgIHNvdXJjZS5yZW1vdmVMaXN0ZW5lcignZW5kJywgb25lbmQpO1xuICAgIHNvdXJjZS5yZW1vdmVMaXN0ZW5lcignY2xvc2UnLCBvbmNsb3NlKTtcblxuICAgIHNvdXJjZS5yZW1vdmVMaXN0ZW5lcignZXJyb3InLCBvbmVycm9yKTtcbiAgICBkZXN0LnJlbW92ZUxpc3RlbmVyKCdlcnJvcicsIG9uZXJyb3IpO1xuXG4gICAgc291cmNlLnJlbW92ZUxpc3RlbmVyKCdlbmQnLCBjbGVhbnVwKTtcbiAgICBzb3VyY2UucmVtb3ZlTGlzdGVuZXIoJ2Nsb3NlJywgY2xlYW51cCk7XG5cbiAgICBkZXN0LnJlbW92ZUxpc3RlbmVyKCdjbG9zZScsIGNsZWFudXApO1xuICB9XG5cbiAgc291cmNlLm9uKCdlbmQnLCBjbGVhbnVwKTtcbiAgc291cmNlLm9uKCdjbG9zZScsIGNsZWFudXApO1xuXG4gIGRlc3Qub24oJ2Nsb3NlJywgY2xlYW51cCk7XG5cbiAgZGVzdC5lbWl0KCdwaXBlJywgc291cmNlKTtcblxuICAvLyBBbGxvdyBmb3IgdW5peC1saWtlIHVzYWdlOiBBLnBpcGUoQikucGlwZShDKVxuICByZXR1cm4gZGVzdDtcbn07XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxudmFyIEJ1ZmZlciA9IHJlcXVpcmUoJ2J1ZmZlcicpLkJ1ZmZlcjtcblxudmFyIGlzQnVmZmVyRW5jb2RpbmcgPSBCdWZmZXIuaXNFbmNvZGluZ1xuICB8fCBmdW5jdGlvbihlbmNvZGluZykge1xuICAgICAgIHN3aXRjaCAoZW5jb2RpbmcgJiYgZW5jb2RpbmcudG9Mb3dlckNhc2UoKSkge1xuICAgICAgICAgY2FzZSAnaGV4JzogY2FzZSAndXRmOCc6IGNhc2UgJ3V0Zi04JzogY2FzZSAnYXNjaWknOiBjYXNlICdiaW5hcnknOiBjYXNlICdiYXNlNjQnOiBjYXNlICd1Y3MyJzogY2FzZSAndWNzLTInOiBjYXNlICd1dGYxNmxlJzogY2FzZSAndXRmLTE2bGUnOiBjYXNlICdyYXcnOiByZXR1cm4gdHJ1ZTtcbiAgICAgICAgIGRlZmF1bHQ6IHJldHVybiBmYWxzZTtcbiAgICAgICB9XG4gICAgIH1cblxuXG5mdW5jdGlvbiBhc3NlcnRFbmNvZGluZyhlbmNvZGluZykge1xuICBpZiAoZW5jb2RpbmcgJiYgIWlzQnVmZmVyRW5jb2RpbmcoZW5jb2RpbmcpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGVuY29kaW5nOiAnICsgZW5jb2RpbmcpO1xuICB9XG59XG5cbi8vIFN0cmluZ0RlY29kZXIgcHJvdmlkZXMgYW4gaW50ZXJmYWNlIGZvciBlZmZpY2llbnRseSBzcGxpdHRpbmcgYSBzZXJpZXMgb2Zcbi8vIGJ1ZmZlcnMgaW50byBhIHNlcmllcyBvZiBKUyBzdHJpbmdzIHdpdGhvdXQgYnJlYWtpbmcgYXBhcnQgbXVsdGktYnl0ZVxuLy8gY2hhcmFjdGVycy4gQ0VTVS04IGlzIGhhbmRsZWQgYXMgcGFydCBvZiB0aGUgVVRGLTggZW5jb2RpbmcuXG4vL1xuLy8gQFRPRE8gSGFuZGxpbmcgYWxsIGVuY29kaW5ncyBpbnNpZGUgYSBzaW5nbGUgb2JqZWN0IG1ha2VzIGl0IHZlcnkgZGlmZmljdWx0XG4vLyB0byByZWFzb24gYWJvdXQgdGhpcyBjb2RlLCBzbyBpdCBzaG91bGQgYmUgc3BsaXQgdXAgaW4gdGhlIGZ1dHVyZS5cbi8vIEBUT0RPIFRoZXJlIHNob3VsZCBiZSBhIHV0Zjgtc3RyaWN0IGVuY29kaW5nIHRoYXQgcmVqZWN0cyBpbnZhbGlkIFVURi04IGNvZGVcbi8vIHBvaW50cyBhcyB1c2VkIGJ5IENFU1UtOC5cbnZhciBTdHJpbmdEZWNvZGVyID0gZXhwb3J0cy5TdHJpbmdEZWNvZGVyID0gZnVuY3Rpb24oZW5jb2RpbmcpIHtcbiAgdGhpcy5lbmNvZGluZyA9IChlbmNvZGluZyB8fCAndXRmOCcpLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvWy1fXS8sICcnKTtcbiAgYXNzZXJ0RW5jb2RpbmcoZW5jb2RpbmcpO1xuICBzd2l0Y2ggKHRoaXMuZW5jb2RpbmcpIHtcbiAgICBjYXNlICd1dGY4JzpcbiAgICAgIC8vIENFU1UtOCByZXByZXNlbnRzIGVhY2ggb2YgU3Vycm9nYXRlIFBhaXIgYnkgMy1ieXRlc1xuICAgICAgdGhpcy5zdXJyb2dhdGVTaXplID0gMztcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgICAgLy8gVVRGLTE2IHJlcHJlc2VudHMgZWFjaCBvZiBTdXJyb2dhdGUgUGFpciBieSAyLWJ5dGVzXG4gICAgICB0aGlzLnN1cnJvZ2F0ZVNpemUgPSAyO1xuICAgICAgdGhpcy5kZXRlY3RJbmNvbXBsZXRlQ2hhciA9IHV0ZjE2RGV0ZWN0SW5jb21wbGV0ZUNoYXI7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgLy8gQmFzZS02NCBzdG9yZXMgMyBieXRlcyBpbiA0IGNoYXJzLCBhbmQgcGFkcyB0aGUgcmVtYWluZGVyLlxuICAgICAgdGhpcy5zdXJyb2dhdGVTaXplID0gMztcbiAgICAgIHRoaXMuZGV0ZWN0SW5jb21wbGV0ZUNoYXIgPSBiYXNlNjREZXRlY3RJbmNvbXBsZXRlQ2hhcjtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aGlzLndyaXRlID0gcGFzc1Rocm91Z2hXcml0ZTtcbiAgICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIEVub3VnaCBzcGFjZSB0byBzdG9yZSBhbGwgYnl0ZXMgb2YgYSBzaW5nbGUgY2hhcmFjdGVyLiBVVEYtOCBuZWVkcyA0XG4gIC8vIGJ5dGVzLCBidXQgQ0VTVS04IG1heSByZXF1aXJlIHVwIHRvIDYgKDMgYnl0ZXMgcGVyIHN1cnJvZ2F0ZSkuXG4gIHRoaXMuY2hhckJ1ZmZlciA9IG5ldyBCdWZmZXIoNik7XG4gIC8vIE51bWJlciBvZiBieXRlcyByZWNlaXZlZCBmb3IgdGhlIGN1cnJlbnQgaW5jb21wbGV0ZSBtdWx0aS1ieXRlIGNoYXJhY3Rlci5cbiAgdGhpcy5jaGFyUmVjZWl2ZWQgPSAwO1xuICAvLyBOdW1iZXIgb2YgYnl0ZXMgZXhwZWN0ZWQgZm9yIHRoZSBjdXJyZW50IGluY29tcGxldGUgbXVsdGktYnl0ZSBjaGFyYWN0ZXIuXG4gIHRoaXMuY2hhckxlbmd0aCA9IDA7XG59O1xuXG5cbi8vIHdyaXRlIGRlY29kZXMgdGhlIGdpdmVuIGJ1ZmZlciBhbmQgcmV0dXJucyBpdCBhcyBKUyBzdHJpbmcgdGhhdCBpc1xuLy8gZ3VhcmFudGVlZCB0byBub3QgY29udGFpbiBhbnkgcGFydGlhbCBtdWx0aS1ieXRlIGNoYXJhY3RlcnMuIEFueSBwYXJ0aWFsXG4vLyBjaGFyYWN0ZXIgZm91bmQgYXQgdGhlIGVuZCBvZiB0aGUgYnVmZmVyIGlzIGJ1ZmZlcmVkIHVwLCBhbmQgd2lsbCBiZVxuLy8gcmV0dXJuZWQgd2hlbiBjYWxsaW5nIHdyaXRlIGFnYWluIHdpdGggdGhlIHJlbWFpbmluZyBieXRlcy5cbi8vXG4vLyBOb3RlOiBDb252ZXJ0aW5nIGEgQnVmZmVyIGNvbnRhaW5pbmcgYW4gb3JwaGFuIHN1cnJvZ2F0ZSB0byBhIFN0cmluZ1xuLy8gY3VycmVudGx5IHdvcmtzLCBidXQgY29udmVydGluZyBhIFN0cmluZyB0byBhIEJ1ZmZlciAodmlhIGBuZXcgQnVmZmVyYCwgb3Jcbi8vIEJ1ZmZlciN3cml0ZSkgd2lsbCByZXBsYWNlIGluY29tcGxldGUgc3Vycm9nYXRlcyB3aXRoIHRoZSB1bmljb2RlXG4vLyByZXBsYWNlbWVudCBjaGFyYWN0ZXIuIFNlZSBodHRwczovL2NvZGVyZXZpZXcuY2hyb21pdW0ub3JnLzEyMTE3MzAwOS8gLlxuU3RyaW5nRGVjb2Rlci5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbihidWZmZXIpIHtcbiAgdmFyIGNoYXJTdHIgPSAnJztcbiAgLy8gaWYgb3VyIGxhc3Qgd3JpdGUgZW5kZWQgd2l0aCBhbiBpbmNvbXBsZXRlIG11bHRpYnl0ZSBjaGFyYWN0ZXJcbiAgd2hpbGUgKHRoaXMuY2hhckxlbmd0aCkge1xuICAgIC8vIGRldGVybWluZSBob3cgbWFueSByZW1haW5pbmcgYnl0ZXMgdGhpcyBidWZmZXIgaGFzIHRvIG9mZmVyIGZvciB0aGlzIGNoYXJcbiAgICB2YXIgYXZhaWxhYmxlID0gKGJ1ZmZlci5sZW5ndGggPj0gdGhpcy5jaGFyTGVuZ3RoIC0gdGhpcy5jaGFyUmVjZWl2ZWQpID9cbiAgICAgICAgdGhpcy5jaGFyTGVuZ3RoIC0gdGhpcy5jaGFyUmVjZWl2ZWQgOlxuICAgICAgICBidWZmZXIubGVuZ3RoO1xuXG4gICAgLy8gYWRkIHRoZSBuZXcgYnl0ZXMgdG8gdGhlIGNoYXIgYnVmZmVyXG4gICAgYnVmZmVyLmNvcHkodGhpcy5jaGFyQnVmZmVyLCB0aGlzLmNoYXJSZWNlaXZlZCwgMCwgYXZhaWxhYmxlKTtcbiAgICB0aGlzLmNoYXJSZWNlaXZlZCArPSBhdmFpbGFibGU7XG5cbiAgICBpZiAodGhpcy5jaGFyUmVjZWl2ZWQgPCB0aGlzLmNoYXJMZW5ndGgpIHtcbiAgICAgIC8vIHN0aWxsIG5vdCBlbm91Z2ggY2hhcnMgaW4gdGhpcyBidWZmZXI/IHdhaXQgZm9yIG1vcmUgLi4uXG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuXG4gICAgLy8gcmVtb3ZlIGJ5dGVzIGJlbG9uZ2luZyB0byB0aGUgY3VycmVudCBjaGFyYWN0ZXIgZnJvbSB0aGUgYnVmZmVyXG4gICAgYnVmZmVyID0gYnVmZmVyLnNsaWNlKGF2YWlsYWJsZSwgYnVmZmVyLmxlbmd0aCk7XG5cbiAgICAvLyBnZXQgdGhlIGNoYXJhY3RlciB0aGF0IHdhcyBzcGxpdFxuICAgIGNoYXJTdHIgPSB0aGlzLmNoYXJCdWZmZXIuc2xpY2UoMCwgdGhpcy5jaGFyTGVuZ3RoKS50b1N0cmluZyh0aGlzLmVuY29kaW5nKTtcblxuICAgIC8vIENFU1UtODogbGVhZCBzdXJyb2dhdGUgKEQ4MDAtREJGRikgaXMgYWxzbyB0aGUgaW5jb21wbGV0ZSBjaGFyYWN0ZXJcbiAgICB2YXIgY2hhckNvZGUgPSBjaGFyU3RyLmNoYXJDb2RlQXQoY2hhclN0ci5sZW5ndGggLSAxKTtcbiAgICBpZiAoY2hhckNvZGUgPj0gMHhEODAwICYmIGNoYXJDb2RlIDw9IDB4REJGRikge1xuICAgICAgdGhpcy5jaGFyTGVuZ3RoICs9IHRoaXMuc3Vycm9nYXRlU2l6ZTtcbiAgICAgIGNoYXJTdHIgPSAnJztcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICB0aGlzLmNoYXJSZWNlaXZlZCA9IHRoaXMuY2hhckxlbmd0aCA9IDA7XG5cbiAgICAvLyBpZiB0aGVyZSBhcmUgbm8gbW9yZSBieXRlcyBpbiB0aGlzIGJ1ZmZlciwganVzdCBlbWl0IG91ciBjaGFyXG4gICAgaWYgKGJ1ZmZlci5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBjaGFyU3RyO1xuICAgIH1cbiAgICBicmVhaztcbiAgfVxuXG4gIC8vIGRldGVybWluZSBhbmQgc2V0IGNoYXJMZW5ndGggLyBjaGFyUmVjZWl2ZWRcbiAgdGhpcy5kZXRlY3RJbmNvbXBsZXRlQ2hhcihidWZmZXIpO1xuXG4gIHZhciBlbmQgPSBidWZmZXIubGVuZ3RoO1xuICBpZiAodGhpcy5jaGFyTGVuZ3RoKSB7XG4gICAgLy8gYnVmZmVyIHRoZSBpbmNvbXBsZXRlIGNoYXJhY3RlciBieXRlcyB3ZSBnb3RcbiAgICBidWZmZXIuY29weSh0aGlzLmNoYXJCdWZmZXIsIDAsIGJ1ZmZlci5sZW5ndGggLSB0aGlzLmNoYXJSZWNlaXZlZCwgZW5kKTtcbiAgICBlbmQgLT0gdGhpcy5jaGFyUmVjZWl2ZWQ7XG4gIH1cblxuICBjaGFyU3RyICs9IGJ1ZmZlci50b1N0cmluZyh0aGlzLmVuY29kaW5nLCAwLCBlbmQpO1xuXG4gIHZhciBlbmQgPSBjaGFyU3RyLmxlbmd0aCAtIDE7XG4gIHZhciBjaGFyQ29kZSA9IGNoYXJTdHIuY2hhckNvZGVBdChlbmQpO1xuICAvLyBDRVNVLTg6IGxlYWQgc3Vycm9nYXRlIChEODAwLURCRkYpIGlzIGFsc28gdGhlIGluY29tcGxldGUgY2hhcmFjdGVyXG4gIGlmIChjaGFyQ29kZSA+PSAweEQ4MDAgJiYgY2hhckNvZGUgPD0gMHhEQkZGKSB7XG4gICAgdmFyIHNpemUgPSB0aGlzLnN1cnJvZ2F0ZVNpemU7XG4gICAgdGhpcy5jaGFyTGVuZ3RoICs9IHNpemU7XG4gICAgdGhpcy5jaGFyUmVjZWl2ZWQgKz0gc2l6ZTtcbiAgICB0aGlzLmNoYXJCdWZmZXIuY29weSh0aGlzLmNoYXJCdWZmZXIsIHNpemUsIDAsIHNpemUpO1xuICAgIGJ1ZmZlci5jb3B5KHRoaXMuY2hhckJ1ZmZlciwgMCwgMCwgc2l6ZSk7XG4gICAgcmV0dXJuIGNoYXJTdHIuc3Vic3RyaW5nKDAsIGVuZCk7XG4gIH1cblxuICAvLyBvciBqdXN0IGVtaXQgdGhlIGNoYXJTdHJcbiAgcmV0dXJuIGNoYXJTdHI7XG59O1xuXG4vLyBkZXRlY3RJbmNvbXBsZXRlQ2hhciBkZXRlcm1pbmVzIGlmIHRoZXJlIGlzIGFuIGluY29tcGxldGUgVVRGLTggY2hhcmFjdGVyIGF0XG4vLyB0aGUgZW5kIG9mIHRoZSBnaXZlbiBidWZmZXIuIElmIHNvLCBpdCBzZXRzIHRoaXMuY2hhckxlbmd0aCB0byB0aGUgYnl0ZVxuLy8gbGVuZ3RoIHRoYXQgY2hhcmFjdGVyLCBhbmQgc2V0cyB0aGlzLmNoYXJSZWNlaXZlZCB0byB0aGUgbnVtYmVyIG9mIGJ5dGVzXG4vLyB0aGF0IGFyZSBhdmFpbGFibGUgZm9yIHRoaXMgY2hhcmFjdGVyLlxuU3RyaW5nRGVjb2Rlci5wcm90b3R5cGUuZGV0ZWN0SW5jb21wbGV0ZUNoYXIgPSBmdW5jdGlvbihidWZmZXIpIHtcbiAgLy8gZGV0ZXJtaW5lIGhvdyBtYW55IGJ5dGVzIHdlIGhhdmUgdG8gY2hlY2sgYXQgdGhlIGVuZCBvZiB0aGlzIGJ1ZmZlclxuICB2YXIgaSA9IChidWZmZXIubGVuZ3RoID49IDMpID8gMyA6IGJ1ZmZlci5sZW5ndGg7XG5cbiAgLy8gRmlndXJlIG91dCBpZiBvbmUgb2YgdGhlIGxhc3QgaSBieXRlcyBvZiBvdXIgYnVmZmVyIGFubm91bmNlcyBhblxuICAvLyBpbmNvbXBsZXRlIGNoYXIuXG4gIGZvciAoOyBpID4gMDsgaS0tKSB7XG4gICAgdmFyIGMgPSBidWZmZXJbYnVmZmVyLmxlbmd0aCAtIGldO1xuXG4gICAgLy8gU2VlIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvVVRGLTgjRGVzY3JpcHRpb25cblxuICAgIC8vIDExMFhYWFhYXG4gICAgaWYgKGkgPT0gMSAmJiBjID4+IDUgPT0gMHgwNikge1xuICAgICAgdGhpcy5jaGFyTGVuZ3RoID0gMjtcbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIC8vIDExMTBYWFhYXG4gICAgaWYgKGkgPD0gMiAmJiBjID4+IDQgPT0gMHgwRSkge1xuICAgICAgdGhpcy5jaGFyTGVuZ3RoID0gMztcbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIC8vIDExMTEwWFhYXG4gICAgaWYgKGkgPD0gMyAmJiBjID4+IDMgPT0gMHgxRSkge1xuICAgICAgdGhpcy5jaGFyTGVuZ3RoID0gNDtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICB0aGlzLmNoYXJSZWNlaXZlZCA9IGk7XG59O1xuXG5TdHJpbmdEZWNvZGVyLnByb3RvdHlwZS5lbmQgPSBmdW5jdGlvbihidWZmZXIpIHtcbiAgdmFyIHJlcyA9ICcnO1xuICBpZiAoYnVmZmVyICYmIGJ1ZmZlci5sZW5ndGgpXG4gICAgcmVzID0gdGhpcy53cml0ZShidWZmZXIpO1xuXG4gIGlmICh0aGlzLmNoYXJSZWNlaXZlZCkge1xuICAgIHZhciBjciA9IHRoaXMuY2hhclJlY2VpdmVkO1xuICAgIHZhciBidWYgPSB0aGlzLmNoYXJCdWZmZXI7XG4gICAgdmFyIGVuYyA9IHRoaXMuZW5jb2Rpbmc7XG4gICAgcmVzICs9IGJ1Zi5zbGljZSgwLCBjcikudG9TdHJpbmcoZW5jKTtcbiAgfVxuXG4gIHJldHVybiByZXM7XG59O1xuXG5mdW5jdGlvbiBwYXNzVGhyb3VnaFdyaXRlKGJ1ZmZlcikge1xuICByZXR1cm4gYnVmZmVyLnRvU3RyaW5nKHRoaXMuZW5jb2RpbmcpO1xufVxuXG5mdW5jdGlvbiB1dGYxNkRldGVjdEluY29tcGxldGVDaGFyKGJ1ZmZlcikge1xuICB0aGlzLmNoYXJSZWNlaXZlZCA9IGJ1ZmZlci5sZW5ndGggJSAyO1xuICB0aGlzLmNoYXJMZW5ndGggPSB0aGlzLmNoYXJSZWNlaXZlZCA/IDIgOiAwO1xufVxuXG5mdW5jdGlvbiBiYXNlNjREZXRlY3RJbmNvbXBsZXRlQ2hhcihidWZmZXIpIHtcbiAgdGhpcy5jaGFyUmVjZWl2ZWQgPSBidWZmZXIubGVuZ3RoICUgMztcbiAgdGhpcy5jaGFyTGVuZ3RoID0gdGhpcy5jaGFyUmVjZWl2ZWQgPyAzIDogMDtcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNCdWZmZXIoYXJnKSB7XG4gIHJldHVybiBhcmcgJiYgdHlwZW9mIGFyZyA9PT0gJ29iamVjdCdcbiAgICAmJiB0eXBlb2YgYXJnLmNvcHkgPT09ICdmdW5jdGlvbidcbiAgICAmJiB0eXBlb2YgYXJnLmZpbGwgPT09ICdmdW5jdGlvbidcbiAgICAmJiB0eXBlb2YgYXJnLnJlYWRVSW50OCA9PT0gJ2Z1bmN0aW9uJztcbn0iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxudmFyIGZvcm1hdFJlZ0V4cCA9IC8lW3NkaiVdL2c7XG5leHBvcnRzLmZvcm1hdCA9IGZ1bmN0aW9uKGYpIHtcbiAgaWYgKCFpc1N0cmluZyhmKSkge1xuICAgIHZhciBvYmplY3RzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIG9iamVjdHMucHVzaChpbnNwZWN0KGFyZ3VtZW50c1tpXSkpO1xuICAgIH1cbiAgICByZXR1cm4gb2JqZWN0cy5qb2luKCcgJyk7XG4gIH1cblxuICB2YXIgaSA9IDE7XG4gIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICB2YXIgbGVuID0gYXJncy5sZW5ndGg7XG4gIHZhciBzdHIgPSBTdHJpbmcoZikucmVwbGFjZShmb3JtYXRSZWdFeHAsIGZ1bmN0aW9uKHgpIHtcbiAgICBpZiAoeCA9PT0gJyUlJykgcmV0dXJuICclJztcbiAgICBpZiAoaSA+PSBsZW4pIHJldHVybiB4O1xuICAgIHN3aXRjaCAoeCkge1xuICAgICAgY2FzZSAnJXMnOiByZXR1cm4gU3RyaW5nKGFyZ3NbaSsrXSk7XG4gICAgICBjYXNlICclZCc6IHJldHVybiBOdW1iZXIoYXJnc1tpKytdKTtcbiAgICAgIGNhc2UgJyVqJzpcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoYXJnc1tpKytdKTtcbiAgICAgICAgfSBjYXRjaCAoXykge1xuICAgICAgICAgIHJldHVybiAnW0NpcmN1bGFyXSc7XG4gICAgICAgIH1cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiB4O1xuICAgIH1cbiAgfSk7XG4gIGZvciAodmFyIHggPSBhcmdzW2ldOyBpIDwgbGVuOyB4ID0gYXJnc1srK2ldKSB7XG4gICAgaWYgKGlzTnVsbCh4KSB8fCAhaXNPYmplY3QoeCkpIHtcbiAgICAgIHN0ciArPSAnICcgKyB4O1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgKz0gJyAnICsgaW5zcGVjdCh4KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHN0cjtcbn07XG5cblxuLy8gTWFyayB0aGF0IGEgbWV0aG9kIHNob3VsZCBub3QgYmUgdXNlZC5cbi8vIFJldHVybnMgYSBtb2RpZmllZCBmdW5jdGlvbiB3aGljaCB3YXJucyBvbmNlIGJ5IGRlZmF1bHQuXG4vLyBJZiAtLW5vLWRlcHJlY2F0aW9uIGlzIHNldCwgdGhlbiBpdCBpcyBhIG5vLW9wLlxuZXhwb3J0cy5kZXByZWNhdGUgPSBmdW5jdGlvbihmbiwgbXNnKSB7XG4gIC8vIEFsbG93IGZvciBkZXByZWNhdGluZyB0aGluZ3MgaW4gdGhlIHByb2Nlc3Mgb2Ygc3RhcnRpbmcgdXAuXG4gIGlmIChpc1VuZGVmaW5lZChnbG9iYWwucHJvY2VzcykpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZXhwb3J0cy5kZXByZWNhdGUoZm4sIG1zZykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9XG5cbiAgaWYgKHByb2Nlc3Mubm9EZXByZWNhdGlvbiA9PT0gdHJ1ZSkge1xuICAgIHJldHVybiBmbjtcbiAgfVxuXG4gIHZhciB3YXJuZWQgPSBmYWxzZTtcbiAgZnVuY3Rpb24gZGVwcmVjYXRlZCgpIHtcbiAgICBpZiAoIXdhcm5lZCkge1xuICAgICAgaWYgKHByb2Nlc3MudGhyb3dEZXByZWNhdGlvbikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IobXNnKTtcbiAgICAgIH0gZWxzZSBpZiAocHJvY2Vzcy50cmFjZURlcHJlY2F0aW9uKSB7XG4gICAgICAgIGNvbnNvbGUudHJhY2UobXNnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IobXNnKTtcbiAgICAgIH1cbiAgICAgIHdhcm5lZCA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgcmV0dXJuIGRlcHJlY2F0ZWQ7XG59O1xuXG5cbnZhciBkZWJ1Z3MgPSB7fTtcbnZhciBkZWJ1Z0Vudmlyb247XG5leHBvcnRzLmRlYnVnbG9nID0gZnVuY3Rpb24oc2V0KSB7XG4gIGlmIChpc1VuZGVmaW5lZChkZWJ1Z0Vudmlyb24pKVxuICAgIGRlYnVnRW52aXJvbiA9IHByb2Nlc3MuZW52Lk5PREVfREVCVUcgfHwgJyc7XG4gIHNldCA9IHNldC50b1VwcGVyQ2FzZSgpO1xuICBpZiAoIWRlYnVnc1tzZXRdKSB7XG4gICAgaWYgKG5ldyBSZWdFeHAoJ1xcXFxiJyArIHNldCArICdcXFxcYicsICdpJykudGVzdChkZWJ1Z0Vudmlyb24pKSB7XG4gICAgICB2YXIgcGlkID0gcHJvY2Vzcy5waWQ7XG4gICAgICBkZWJ1Z3Nbc2V0XSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbXNnID0gZXhwb3J0cy5mb3JtYXQuYXBwbHkoZXhwb3J0cywgYXJndW1lbnRzKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignJXMgJWQ6ICVzJywgc2V0LCBwaWQsIG1zZyk7XG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWJ1Z3Nbc2V0XSA9IGZ1bmN0aW9uKCkge307XG4gICAgfVxuICB9XG4gIHJldHVybiBkZWJ1Z3Nbc2V0XTtcbn07XG5cblxuLyoqXG4gKiBFY2hvcyB0aGUgdmFsdWUgb2YgYSB2YWx1ZS4gVHJ5cyB0byBwcmludCB0aGUgdmFsdWUgb3V0XG4gKiBpbiB0aGUgYmVzdCB3YXkgcG9zc2libGUgZ2l2ZW4gdGhlIGRpZmZlcmVudCB0eXBlcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqIFRoZSBvYmplY3QgdG8gcHJpbnQgb3V0LlxuICogQHBhcmFtIHtPYmplY3R9IG9wdHMgT3B0aW9uYWwgb3B0aW9ucyBvYmplY3QgdGhhdCBhbHRlcnMgdGhlIG91dHB1dC5cbiAqL1xuLyogbGVnYWN5OiBvYmosIHNob3dIaWRkZW4sIGRlcHRoLCBjb2xvcnMqL1xuZnVuY3Rpb24gaW5zcGVjdChvYmosIG9wdHMpIHtcbiAgLy8gZGVmYXVsdCBvcHRpb25zXG4gIHZhciBjdHggPSB7XG4gICAgc2VlbjogW10sXG4gICAgc3R5bGl6ZTogc3R5bGl6ZU5vQ29sb3JcbiAgfTtcbiAgLy8gbGVnYWN5Li4uXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID49IDMpIGN0eC5kZXB0aCA9IGFyZ3VtZW50c1syXTtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gNCkgY3R4LmNvbG9ycyA9IGFyZ3VtZW50c1szXTtcbiAgaWYgKGlzQm9vbGVhbihvcHRzKSkge1xuICAgIC8vIGxlZ2FjeS4uLlxuICAgIGN0eC5zaG93SGlkZGVuID0gb3B0cztcbiAgfSBlbHNlIGlmIChvcHRzKSB7XG4gICAgLy8gZ290IGFuIFwib3B0aW9uc1wiIG9iamVjdFxuICAgIGV4cG9ydHMuX2V4dGVuZChjdHgsIG9wdHMpO1xuICB9XG4gIC8vIHNldCBkZWZhdWx0IG9wdGlvbnNcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5zaG93SGlkZGVuKSkgY3R4LnNob3dIaWRkZW4gPSBmYWxzZTtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5kZXB0aCkpIGN0eC5kZXB0aCA9IDI7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguY29sb3JzKSkgY3R4LmNvbG9ycyA9IGZhbHNlO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmN1c3RvbUluc3BlY3QpKSBjdHguY3VzdG9tSW5zcGVjdCA9IHRydWU7XG4gIGlmIChjdHguY29sb3JzKSBjdHguc3R5bGl6ZSA9IHN0eWxpemVXaXRoQ29sb3I7XG4gIHJldHVybiBmb3JtYXRWYWx1ZShjdHgsIG9iaiwgY3R4LmRlcHRoKTtcbn1cbmV4cG9ydHMuaW5zcGVjdCA9IGluc3BlY3Q7XG5cblxuLy8gaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9BTlNJX2VzY2FwZV9jb2RlI2dyYXBoaWNzXG5pbnNwZWN0LmNvbG9ycyA9IHtcbiAgJ2JvbGQnIDogWzEsIDIyXSxcbiAgJ2l0YWxpYycgOiBbMywgMjNdLFxuICAndW5kZXJsaW5lJyA6IFs0LCAyNF0sXG4gICdpbnZlcnNlJyA6IFs3LCAyN10sXG4gICd3aGl0ZScgOiBbMzcsIDM5XSxcbiAgJ2dyZXknIDogWzkwLCAzOV0sXG4gICdibGFjaycgOiBbMzAsIDM5XSxcbiAgJ2JsdWUnIDogWzM0LCAzOV0sXG4gICdjeWFuJyA6IFszNiwgMzldLFxuICAnZ3JlZW4nIDogWzMyLCAzOV0sXG4gICdtYWdlbnRhJyA6IFszNSwgMzldLFxuICAncmVkJyA6IFszMSwgMzldLFxuICAneWVsbG93JyA6IFszMywgMzldXG59O1xuXG4vLyBEb24ndCB1c2UgJ2JsdWUnIG5vdCB2aXNpYmxlIG9uIGNtZC5leGVcbmluc3BlY3Quc3R5bGVzID0ge1xuICAnc3BlY2lhbCc6ICdjeWFuJyxcbiAgJ251bWJlcic6ICd5ZWxsb3cnLFxuICAnYm9vbGVhbic6ICd5ZWxsb3cnLFxuICAndW5kZWZpbmVkJzogJ2dyZXknLFxuICAnbnVsbCc6ICdib2xkJyxcbiAgJ3N0cmluZyc6ICdncmVlbicsXG4gICdkYXRlJzogJ21hZ2VudGEnLFxuICAvLyBcIm5hbWVcIjogaW50ZW50aW9uYWxseSBub3Qgc3R5bGluZ1xuICAncmVnZXhwJzogJ3JlZCdcbn07XG5cblxuZnVuY3Rpb24gc3R5bGl6ZVdpdGhDb2xvcihzdHIsIHN0eWxlVHlwZSkge1xuICB2YXIgc3R5bGUgPSBpbnNwZWN0LnN0eWxlc1tzdHlsZVR5cGVdO1xuXG4gIGlmIChzdHlsZSkge1xuICAgIHJldHVybiAnXFx1MDAxYlsnICsgaW5zcGVjdC5jb2xvcnNbc3R5bGVdWzBdICsgJ20nICsgc3RyICtcbiAgICAgICAgICAgJ1xcdTAwMWJbJyArIGluc3BlY3QuY29sb3JzW3N0eWxlXVsxXSArICdtJztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gc3RyO1xuICB9XG59XG5cblxuZnVuY3Rpb24gc3R5bGl6ZU5vQ29sb3Ioc3RyLCBzdHlsZVR5cGUpIHtcbiAgcmV0dXJuIHN0cjtcbn1cblxuXG5mdW5jdGlvbiBhcnJheVRvSGFzaChhcnJheSkge1xuICB2YXIgaGFzaCA9IHt9O1xuXG4gIGFycmF5LmZvckVhY2goZnVuY3Rpb24odmFsLCBpZHgpIHtcbiAgICBoYXNoW3ZhbF0gPSB0cnVlO1xuICB9KTtcblxuICByZXR1cm4gaGFzaDtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRWYWx1ZShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMpIHtcbiAgLy8gUHJvdmlkZSBhIGhvb2sgZm9yIHVzZXItc3BlY2lmaWVkIGluc3BlY3QgZnVuY3Rpb25zLlxuICAvLyBDaGVjayB0aGF0IHZhbHVlIGlzIGFuIG9iamVjdCB3aXRoIGFuIGluc3BlY3QgZnVuY3Rpb24gb24gaXRcbiAgaWYgKGN0eC5jdXN0b21JbnNwZWN0ICYmXG4gICAgICB2YWx1ZSAmJlxuICAgICAgaXNGdW5jdGlvbih2YWx1ZS5pbnNwZWN0KSAmJlxuICAgICAgLy8gRmlsdGVyIG91dCB0aGUgdXRpbCBtb2R1bGUsIGl0J3MgaW5zcGVjdCBmdW5jdGlvbiBpcyBzcGVjaWFsXG4gICAgICB2YWx1ZS5pbnNwZWN0ICE9PSBleHBvcnRzLmluc3BlY3QgJiZcbiAgICAgIC8vIEFsc28gZmlsdGVyIG91dCBhbnkgcHJvdG90eXBlIG9iamVjdHMgdXNpbmcgdGhlIGNpcmN1bGFyIGNoZWNrLlxuICAgICAgISh2YWx1ZS5jb25zdHJ1Y3RvciAmJiB2YWx1ZS5jb25zdHJ1Y3Rvci5wcm90b3R5cGUgPT09IHZhbHVlKSkge1xuICAgIHZhciByZXQgPSB2YWx1ZS5pbnNwZWN0KHJlY3Vyc2VUaW1lcywgY3R4KTtcbiAgICBpZiAoIWlzU3RyaW5nKHJldCkpIHtcbiAgICAgIHJldCA9IGZvcm1hdFZhbHVlKGN0eCwgcmV0LCByZWN1cnNlVGltZXMpO1xuICAgIH1cbiAgICByZXR1cm4gcmV0O1xuICB9XG5cbiAgLy8gUHJpbWl0aXZlIHR5cGVzIGNhbm5vdCBoYXZlIHByb3BlcnRpZXNcbiAgdmFyIHByaW1pdGl2ZSA9IGZvcm1hdFByaW1pdGl2ZShjdHgsIHZhbHVlKTtcbiAgaWYgKHByaW1pdGl2ZSkge1xuICAgIHJldHVybiBwcmltaXRpdmU7XG4gIH1cblxuICAvLyBMb29rIHVwIHRoZSBrZXlzIG9mIHRoZSBvYmplY3QuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXModmFsdWUpO1xuICB2YXIgdmlzaWJsZUtleXMgPSBhcnJheVRvSGFzaChrZXlzKTtcblxuICBpZiAoY3R4LnNob3dIaWRkZW4pIHtcbiAgICBrZXlzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModmFsdWUpO1xuICB9XG5cbiAgLy8gSUUgZG9lc24ndCBtYWtlIGVycm9yIGZpZWxkcyBub24tZW51bWVyYWJsZVxuICAvLyBodHRwOi8vbXNkbi5taWNyb3NvZnQuY29tL2VuLXVzL2xpYnJhcnkvaWUvZHd3NTJzYnQodj12cy45NCkuYXNweFxuICBpZiAoaXNFcnJvcih2YWx1ZSlcbiAgICAgICYmIChrZXlzLmluZGV4T2YoJ21lc3NhZ2UnKSA+PSAwIHx8IGtleXMuaW5kZXhPZignZGVzY3JpcHRpb24nKSA+PSAwKSkge1xuICAgIHJldHVybiBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gIH1cblxuICAvLyBTb21lIHR5cGUgb2Ygb2JqZWN0IHdpdGhvdXQgcHJvcGVydGllcyBjYW4gYmUgc2hvcnRjdXR0ZWQuXG4gIGlmIChrZXlzLmxlbmd0aCA9PT0gMCkge1xuICAgIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgICAgdmFyIG5hbWUgPSB2YWx1ZS5uYW1lID8gJzogJyArIHZhbHVlLm5hbWUgOiAnJztcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZSgnW0Z1bmN0aW9uJyArIG5hbWUgKyAnXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICAgIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAncmVnZXhwJyk7XG4gICAgfVxuICAgIGlmIChpc0RhdGUodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoRGF0ZS5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdkYXRlJyk7XG4gICAgfVxuICAgIGlmIChpc0Vycm9yKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICB2YXIgYmFzZSA9ICcnLCBhcnJheSA9IGZhbHNlLCBicmFjZXMgPSBbJ3snLCAnfSddO1xuXG4gIC8vIE1ha2UgQXJyYXkgc2F5IHRoYXQgdGhleSBhcmUgQXJyYXlcbiAgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG4gICAgYXJyYXkgPSB0cnVlO1xuICAgIGJyYWNlcyA9IFsnWycsICddJ107XG4gIH1cblxuICAvLyBNYWtlIGZ1bmN0aW9ucyBzYXkgdGhhdCB0aGV5IGFyZSBmdW5jdGlvbnNcbiAgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgdmFyIG4gPSB2YWx1ZS5uYW1lID8gJzogJyArIHZhbHVlLm5hbWUgOiAnJztcbiAgICBiYXNlID0gJyBbRnVuY3Rpb24nICsgbiArICddJztcbiAgfVxuXG4gIC8vIE1ha2UgUmVnRXhwcyBzYXkgdGhhdCB0aGV5IGFyZSBSZWdFeHBzXG4gIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKTtcbiAgfVxuXG4gIC8vIE1ha2UgZGF0ZXMgd2l0aCBwcm9wZXJ0aWVzIGZpcnN0IHNheSB0aGUgZGF0ZVxuICBpZiAoaXNEYXRlKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBEYXRlLnByb3RvdHlwZS50b1VUQ1N0cmluZy5jYWxsKHZhbHVlKTtcbiAgfVxuXG4gIC8vIE1ha2UgZXJyb3Igd2l0aCBtZXNzYWdlIGZpcnN0IHNheSB0aGUgZXJyb3JcbiAgaWYgKGlzRXJyb3IodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgfVxuXG4gIGlmIChrZXlzLmxlbmd0aCA9PT0gMCAmJiAoIWFycmF5IHx8IHZhbHVlLmxlbmd0aCA9PSAwKSkge1xuICAgIHJldHVybiBicmFjZXNbMF0gKyBiYXNlICsgYnJhY2VzWzFdO1xuICB9XG5cbiAgaWYgKHJlY3Vyc2VUaW1lcyA8IDApIHtcbiAgICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ3JlZ2V4cCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoJ1tPYmplY3RdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cblxuICBjdHguc2Vlbi5wdXNoKHZhbHVlKTtcblxuICB2YXIgb3V0cHV0O1xuICBpZiAoYXJyYXkpIHtcbiAgICBvdXRwdXQgPSBmb3JtYXRBcnJheShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXlzKTtcbiAgfSBlbHNlIHtcbiAgICBvdXRwdXQgPSBrZXlzLm1hcChmdW5jdGlvbihrZXkpIHtcbiAgICAgIHJldHVybiBmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXksIGFycmF5KTtcbiAgICB9KTtcbiAgfVxuXG4gIGN0eC5zZWVuLnBvcCgpO1xuXG4gIHJldHVybiByZWR1Y2VUb1NpbmdsZVN0cmluZyhvdXRwdXQsIGJhc2UsIGJyYWNlcyk7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0UHJpbWl0aXZlKGN0eCwgdmFsdWUpIHtcbiAgaWYgKGlzVW5kZWZpbmVkKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJ3VuZGVmaW5lZCcsICd1bmRlZmluZWQnKTtcbiAgaWYgKGlzU3RyaW5nKHZhbHVlKSkge1xuICAgIHZhciBzaW1wbGUgPSAnXFwnJyArIEpTT04uc3RyaW5naWZ5KHZhbHVlKS5yZXBsYWNlKC9eXCJ8XCIkL2csICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLycvZywgXCJcXFxcJ1wiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcIi9nLCAnXCInKSArICdcXCcnO1xuICAgIHJldHVybiBjdHguc3R5bGl6ZShzaW1wbGUsICdzdHJpbmcnKTtcbiAgfVxuICBpZiAoaXNOdW1iZXIodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgnJyArIHZhbHVlLCAnbnVtYmVyJyk7XG4gIGlmIChpc0Jvb2xlYW4odmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgnJyArIHZhbHVlLCAnYm9vbGVhbicpO1xuICAvLyBGb3Igc29tZSByZWFzb24gdHlwZW9mIG51bGwgaXMgXCJvYmplY3RcIiwgc28gc3BlY2lhbCBjYXNlIGhlcmUuXG4gIGlmIChpc051bGwodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgnbnVsbCcsICdudWxsJyk7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0RXJyb3IodmFsdWUpIHtcbiAgcmV0dXJuICdbJyArIEVycm9yLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSArICddJztcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRBcnJheShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXlzKSB7XG4gIHZhciBvdXRwdXQgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDAsIGwgPSB2YWx1ZS5sZW5ndGg7IGkgPCBsOyArK2kpIHtcbiAgICBpZiAoaGFzT3duUHJvcGVydHkodmFsdWUsIFN0cmluZyhpKSkpIHtcbiAgICAgIG91dHB1dC5wdXNoKGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsXG4gICAgICAgICAgU3RyaW5nKGkpLCB0cnVlKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dHB1dC5wdXNoKCcnKTtcbiAgICB9XG4gIH1cbiAga2V5cy5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgIGlmICgha2V5Lm1hdGNoKC9eXFxkKyQvKSkge1xuICAgICAgb3V0cHV0LnB1c2goZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cyxcbiAgICAgICAgICBrZXksIHRydWUpKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gb3V0cHV0O1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleSwgYXJyYXkpIHtcbiAgdmFyIG5hbWUsIHN0ciwgZGVzYztcbiAgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodmFsdWUsIGtleSkgfHwgeyB2YWx1ZTogdmFsdWVba2V5XSB9O1xuICBpZiAoZGVzYy5nZXQpIHtcbiAgICBpZiAoZGVzYy5zZXQpIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbR2V0dGVyL1NldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0dldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAoZGVzYy5zZXQpIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbU2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG4gIGlmICghaGFzT3duUHJvcGVydHkodmlzaWJsZUtleXMsIGtleSkpIHtcbiAgICBuYW1lID0gJ1snICsga2V5ICsgJ10nO1xuICB9XG4gIGlmICghc3RyKSB7XG4gICAgaWYgKGN0eC5zZWVuLmluZGV4T2YoZGVzYy52YWx1ZSkgPCAwKSB7XG4gICAgICBpZiAoaXNOdWxsKHJlY3Vyc2VUaW1lcykpIHtcbiAgICAgICAgc3RyID0gZm9ybWF0VmFsdWUoY3R4LCBkZXNjLnZhbHVlLCBudWxsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN0ciA9IGZvcm1hdFZhbHVlKGN0eCwgZGVzYy52YWx1ZSwgcmVjdXJzZVRpbWVzIC0gMSk7XG4gICAgICB9XG4gICAgICBpZiAoc3RyLmluZGV4T2YoJ1xcbicpID4gLTEpIHtcbiAgICAgICAgaWYgKGFycmF5KSB7XG4gICAgICAgICAgc3RyID0gc3RyLnNwbGl0KCdcXG4nKS5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgcmV0dXJuICcgICcgKyBsaW5lO1xuICAgICAgICAgIH0pLmpvaW4oJ1xcbicpLnN1YnN0cigyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdHIgPSAnXFxuJyArIHN0ci5zcGxpdCgnXFxuJykubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgIHJldHVybiAnICAgJyArIGxpbmU7XG4gICAgICAgICAgfSkuam9pbignXFxuJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tDaXJjdWxhcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuICBpZiAoaXNVbmRlZmluZWQobmFtZSkpIHtcbiAgICBpZiAoYXJyYXkgJiYga2V5Lm1hdGNoKC9eXFxkKyQvKSkge1xuICAgICAgcmV0dXJuIHN0cjtcbiAgICB9XG4gICAgbmFtZSA9IEpTT04uc3RyaW5naWZ5KCcnICsga2V5KTtcbiAgICBpZiAobmFtZS5tYXRjaCgvXlwiKFthLXpBLVpfXVthLXpBLVpfMC05XSopXCIkLykpIHtcbiAgICAgIG5hbWUgPSBuYW1lLnN1YnN0cigxLCBuYW1lLmxlbmd0aCAtIDIpO1xuICAgICAgbmFtZSA9IGN0eC5zdHlsaXplKG5hbWUsICduYW1lJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5hbWUgPSBuYW1lLnJlcGxhY2UoLycvZywgXCJcXFxcJ1wiKVxuICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFwiL2csICdcIicpXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8oXlwifFwiJCkvZywgXCInXCIpO1xuICAgICAgbmFtZSA9IGN0eC5zdHlsaXplKG5hbWUsICdzdHJpbmcnKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmFtZSArICc6ICcgKyBzdHI7XG59XG5cblxuZnVuY3Rpb24gcmVkdWNlVG9TaW5nbGVTdHJpbmcob3V0cHV0LCBiYXNlLCBicmFjZXMpIHtcbiAgdmFyIG51bUxpbmVzRXN0ID0gMDtcbiAgdmFyIGxlbmd0aCA9IG91dHB1dC5yZWR1Y2UoZnVuY3Rpb24ocHJldiwgY3VyKSB7XG4gICAgbnVtTGluZXNFc3QrKztcbiAgICBpZiAoY3VyLmluZGV4T2YoJ1xcbicpID49IDApIG51bUxpbmVzRXN0Kys7XG4gICAgcmV0dXJuIHByZXYgKyBjdXIucmVwbGFjZSgvXFx1MDAxYlxcW1xcZFxcZD9tL2csICcnKS5sZW5ndGggKyAxO1xuICB9LCAwKTtcblxuICBpZiAobGVuZ3RoID4gNjApIHtcbiAgICByZXR1cm4gYnJhY2VzWzBdICtcbiAgICAgICAgICAgKGJhc2UgPT09ICcnID8gJycgOiBiYXNlICsgJ1xcbiAnKSArXG4gICAgICAgICAgICcgJyArXG4gICAgICAgICAgIG91dHB1dC5qb2luKCcsXFxuICAnKSArXG4gICAgICAgICAgICcgJyArXG4gICAgICAgICAgIGJyYWNlc1sxXTtcbiAgfVxuXG4gIHJldHVybiBicmFjZXNbMF0gKyBiYXNlICsgJyAnICsgb3V0cHV0LmpvaW4oJywgJykgKyAnICcgKyBicmFjZXNbMV07XG59XG5cblxuLy8gTk9URTogVGhlc2UgdHlwZSBjaGVja2luZyBmdW5jdGlvbnMgaW50ZW50aW9uYWxseSBkb24ndCB1c2UgYGluc3RhbmNlb2ZgXG4vLyBiZWNhdXNlIGl0IGlzIGZyYWdpbGUgYW5kIGNhbiBiZSBlYXNpbHkgZmFrZWQgd2l0aCBgT2JqZWN0LmNyZWF0ZSgpYC5cbmZ1bmN0aW9uIGlzQXJyYXkoYXIpIHtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkoYXIpO1xufVxuZXhwb3J0cy5pc0FycmF5ID0gaXNBcnJheTtcblxuZnVuY3Rpb24gaXNCb29sZWFuKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Jvb2xlYW4nO1xufVxuZXhwb3J0cy5pc0Jvb2xlYW4gPSBpc0Jvb2xlYW47XG5cbmZ1bmN0aW9uIGlzTnVsbChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNOdWxsID0gaXNOdWxsO1xuXG5mdW5jdGlvbiBpc051bGxPclVuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PSBudWxsO1xufVxuZXhwb3J0cy5pc051bGxPclVuZGVmaW5lZCA9IGlzTnVsbE9yVW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInO1xufVxuZXhwb3J0cy5pc051bWJlciA9IGlzTnVtYmVyO1xuXG5mdW5jdGlvbiBpc1N0cmluZyhhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnO1xufVxuZXhwb3J0cy5pc1N0cmluZyA9IGlzU3RyaW5nO1xuXG5mdW5jdGlvbiBpc1N5bWJvbChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdzeW1ib2wnO1xufVxuZXhwb3J0cy5pc1N5bWJvbCA9IGlzU3ltYm9sO1xuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuZXhwb3J0cy5pc1VuZGVmaW5lZCA9IGlzVW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBpc1JlZ0V4cChyZSkge1xuICByZXR1cm4gaXNPYmplY3QocmUpICYmIG9iamVjdFRvU3RyaW5nKHJlKSA9PT0gJ1tvYmplY3QgUmVnRXhwXSc7XG59XG5leHBvcnRzLmlzUmVnRXhwID0gaXNSZWdFeHA7XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xufVxuZXhwb3J0cy5pc09iamVjdCA9IGlzT2JqZWN0O1xuXG5mdW5jdGlvbiBpc0RhdGUoZCkge1xuICByZXR1cm4gaXNPYmplY3QoZCkgJiYgb2JqZWN0VG9TdHJpbmcoZCkgPT09ICdbb2JqZWN0IERhdGVdJztcbn1cbmV4cG9ydHMuaXNEYXRlID0gaXNEYXRlO1xuXG5mdW5jdGlvbiBpc0Vycm9yKGUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KGUpICYmXG4gICAgICAob2JqZWN0VG9TdHJpbmcoZSkgPT09ICdbb2JqZWN0IEVycm9yXScgfHwgZSBpbnN0YW5jZW9mIEVycm9yKTtcbn1cbmV4cG9ydHMuaXNFcnJvciA9IGlzRXJyb3I7XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nO1xufVxuZXhwb3J0cy5pc0Z1bmN0aW9uID0gaXNGdW5jdGlvbjtcblxuZnVuY3Rpb24gaXNQcmltaXRpdmUoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IG51bGwgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdib29sZWFuJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ251bWJlcicgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnc3ltYm9sJyB8fCAgLy8gRVM2IHN5bWJvbFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3VuZGVmaW5lZCc7XG59XG5leHBvcnRzLmlzUHJpbWl0aXZlID0gaXNQcmltaXRpdmU7XG5cbmV4cG9ydHMuaXNCdWZmZXIgPSByZXF1aXJlKCcuL3N1cHBvcnQvaXNCdWZmZXInKTtcblxuZnVuY3Rpb24gb2JqZWN0VG9TdHJpbmcobykge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG8pO1xufVxuXG5cbmZ1bmN0aW9uIHBhZChuKSB7XG4gIHJldHVybiBuIDwgMTAgPyAnMCcgKyBuLnRvU3RyaW5nKDEwKSA6IG4udG9TdHJpbmcoMTApO1xufVxuXG5cbnZhciBtb250aHMgPSBbJ0phbicsICdGZWInLCAnTWFyJywgJ0FwcicsICdNYXknLCAnSnVuJywgJ0p1bCcsICdBdWcnLCAnU2VwJyxcbiAgICAgICAgICAgICAgJ09jdCcsICdOb3YnLCAnRGVjJ107XG5cbi8vIDI2IEZlYiAxNjoxOTozNFxuZnVuY3Rpb24gdGltZXN0YW1wKCkge1xuICB2YXIgZCA9IG5ldyBEYXRlKCk7XG4gIHZhciB0aW1lID0gW3BhZChkLmdldEhvdXJzKCkpLFxuICAgICAgICAgICAgICBwYWQoZC5nZXRNaW51dGVzKCkpLFxuICAgICAgICAgICAgICBwYWQoZC5nZXRTZWNvbmRzKCkpXS5qb2luKCc6Jyk7XG4gIHJldHVybiBbZC5nZXREYXRlKCksIG1vbnRoc1tkLmdldE1vbnRoKCldLCB0aW1lXS5qb2luKCcgJyk7XG59XG5cblxuLy8gbG9nIGlzIGp1c3QgYSB0aGluIHdyYXBwZXIgdG8gY29uc29sZS5sb2cgdGhhdCBwcmVwZW5kcyBhIHRpbWVzdGFtcFxuZXhwb3J0cy5sb2cgPSBmdW5jdGlvbigpIHtcbiAgY29uc29sZS5sb2coJyVzIC0gJXMnLCB0aW1lc3RhbXAoKSwgZXhwb3J0cy5mb3JtYXQuYXBwbHkoZXhwb3J0cywgYXJndW1lbnRzKSk7XG59O1xuXG5cbi8qKlxuICogSW5oZXJpdCB0aGUgcHJvdG90eXBlIG1ldGhvZHMgZnJvbSBvbmUgY29uc3RydWN0b3IgaW50byBhbm90aGVyLlxuICpcbiAqIFRoZSBGdW5jdGlvbi5wcm90b3R5cGUuaW5oZXJpdHMgZnJvbSBsYW5nLmpzIHJld3JpdHRlbiBhcyBhIHN0YW5kYWxvbmVcbiAqIGZ1bmN0aW9uIChub3Qgb24gRnVuY3Rpb24ucHJvdG90eXBlKS4gTk9URTogSWYgdGhpcyBmaWxlIGlzIHRvIGJlIGxvYWRlZFxuICogZHVyaW5nIGJvb3RzdHJhcHBpbmcgdGhpcyBmdW5jdGlvbiBuZWVkcyB0byBiZSByZXdyaXR0ZW4gdXNpbmcgc29tZSBuYXRpdmVcbiAqIGZ1bmN0aW9ucyBhcyBwcm90b3R5cGUgc2V0dXAgdXNpbmcgbm9ybWFsIEphdmFTY3JpcHQgZG9lcyBub3Qgd29yayBhc1xuICogZXhwZWN0ZWQgZHVyaW5nIGJvb3RzdHJhcHBpbmcgKHNlZSBtaXJyb3IuanMgaW4gcjExNDkwMykuXG4gKlxuICogQHBhcmFtIHtmdW5jdGlvbn0gY3RvciBDb25zdHJ1Y3RvciBmdW5jdGlvbiB3aGljaCBuZWVkcyB0byBpbmhlcml0IHRoZVxuICogICAgIHByb3RvdHlwZS5cbiAqIEBwYXJhbSB7ZnVuY3Rpb259IHN1cGVyQ3RvciBDb25zdHJ1Y3RvciBmdW5jdGlvbiB0byBpbmhlcml0IHByb3RvdHlwZSBmcm9tLlxuICovXG5leHBvcnRzLmluaGVyaXRzID0gcmVxdWlyZSgnaW5oZXJpdHMnKTtcblxuZXhwb3J0cy5fZXh0ZW5kID0gZnVuY3Rpb24ob3JpZ2luLCBhZGQpIHtcbiAgLy8gRG9uJ3QgZG8gYW55dGhpbmcgaWYgYWRkIGlzbid0IGFuIG9iamVjdFxuICBpZiAoIWFkZCB8fCAhaXNPYmplY3QoYWRkKSkgcmV0dXJuIG9yaWdpbjtcblxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGFkZCk7XG4gIHZhciBpID0ga2V5cy5sZW5ndGg7XG4gIHdoaWxlIChpLS0pIHtcbiAgICBvcmlnaW5ba2V5c1tpXV0gPSBhZGRba2V5c1tpXV07XG4gIH1cbiAgcmV0dXJuIG9yaWdpbjtcbn07XG5cbmZ1bmN0aW9uIGhhc093blByb3BlcnR5KG9iaiwgcHJvcCkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCk7XG59XG4iLCIvKipcbiAqIFRoaXMgbW9kdWxlIGV4cG9ydHMgZnVuY3Rpb25zIGZvciBjaGVja2luZyB0eXBlc1xuICogYW5kIHRocm93aW5nIGV4Y2VwdGlvbnMuXG4gKi9cblxuLypnbG9iYWxzIGRlZmluZSwgbW9kdWxlICovXG5cbihmdW5jdGlvbiAoZ2xvYmFscykge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBtZXNzYWdlcywgcHJlZGljYXRlcywgZnVuY3Rpb25zLCBhc3NlcnQsIG5vdCwgbWF5YmUsIGVpdGhlcjtcblxuICAgIG1lc3NhZ2VzID0ge1xuICAgICAgICBsaWtlOiAnSW52YWxpZCB0eXBlJyxcbiAgICAgICAgaW5zdGFuY2U6ICdJbnZhbGlkIHR5cGUnLFxuICAgICAgICBlbXB0eU9iamVjdDogJ0ludmFsaWQgb2JqZWN0JyxcbiAgICAgICAgb2JqZWN0OiAnSW52YWxpZCBvYmplY3QnLFxuICAgICAgICBhc3NpZ25lZDogJ0ludmFsaWQgdmFsdWUnLFxuICAgICAgICB1bmRlZmluZWQ6ICdJbnZhbGlkIHZhbHVlJyxcbiAgICAgICAgbnVsbDogJ0ludmFsaWQgdmFsdWUnLFxuICAgICAgICBoYXNMZW5ndGg6ICdJbnZhbGlkIGxlbmd0aCcsXG4gICAgICAgIGVtcHR5QXJyYXk6ICdJbnZhbGlkIGFycmF5JyxcbiAgICAgICAgYXJyYXk6ICdJbnZhbGlkIGFycmF5JyxcbiAgICAgICAgZGF0ZTogJ0ludmFsaWQgZGF0ZScsXG4gICAgICAgIGVycm9yOiAnSW52YWxpZCBlcnJvcicsXG4gICAgICAgIGZuOiAnSW52YWxpZCBmdW5jdGlvbicsXG4gICAgICAgIG1hdGNoOiAnSW52YWxpZCBzdHJpbmcnLFxuICAgICAgICBjb250YWluczogJ0ludmFsaWQgc3RyaW5nJyxcbiAgICAgICAgdW5lbXB0eVN0cmluZzogJ0ludmFsaWQgc3RyaW5nJyxcbiAgICAgICAgc3RyaW5nOiAnSW52YWxpZCBzdHJpbmcnLFxuICAgICAgICBvZGQ6ICdJbnZhbGlkIG51bWJlcicsXG4gICAgICAgIGV2ZW46ICdJbnZhbGlkIG51bWJlcicsXG4gICAgICAgIGJldHdlZW46ICdJbnZhbGlkIG51bWJlcicsXG4gICAgICAgIGdyZWF0ZXI6ICdJbnZhbGlkIG51bWJlcicsXG4gICAgICAgIGxlc3M6ICdJbnZhbGlkIG51bWJlcicsXG4gICAgICAgIHBvc2l0aXZlOiAnSW52YWxpZCBudW1iZXInLFxuICAgICAgICBuZWdhdGl2ZTogJ0ludmFsaWQgbnVtYmVyJyxcbiAgICAgICAgaW50ZWdlcjogJ0ludmFsaWQgbnVtYmVyJyxcbiAgICAgICAgemVybzogJ0ludmFsaWQgbnVtYmVyJyxcbiAgICAgICAgbnVtYmVyOiAnSW52YWxpZCBudW1iZXInLFxuICAgICAgICBib29sZWFuOiAnSW52YWxpZCBib29sZWFuJ1xuICAgIH07XG5cbiAgICBwcmVkaWNhdGVzID0ge1xuICAgICAgICBsaWtlOiBsaWtlLFxuICAgICAgICBpbnN0YW5jZTogaW5zdGFuY2UsXG4gICAgICAgIGVtcHR5T2JqZWN0OiBlbXB0eU9iamVjdCxcbiAgICAgICAgb2JqZWN0OiBvYmplY3QsXG4gICAgICAgIGFzc2lnbmVkOiBhc3NpZ25lZCxcbiAgICAgICAgdW5kZWZpbmVkOiBpc1VuZGVmaW5lZCxcbiAgICAgICAgbnVsbDogaXNOdWxsLFxuICAgICAgICBoYXNMZW5ndGg6IGhhc0xlbmd0aCxcbiAgICAgICAgZW1wdHlBcnJheTogZW1wdHlBcnJheSxcbiAgICAgICAgYXJyYXk6IGFycmF5LFxuICAgICAgICBkYXRlOiBkYXRlLFxuICAgICAgICBlcnJvcjogZXJyb3IsXG4gICAgICAgIGZ1bmN0aW9uOiBpc0Z1bmN0aW9uLFxuICAgICAgICBtYXRjaDogbWF0Y2gsXG4gICAgICAgIGNvbnRhaW5zOiBjb250YWlucyxcbiAgICAgICAgdW5lbXB0eVN0cmluZzogdW5lbXB0eVN0cmluZyxcbiAgICAgICAgc3RyaW5nOiBzdHJpbmcsXG4gICAgICAgIG9kZDogb2RkLFxuICAgICAgICBldmVuOiBldmVuLFxuICAgICAgICBiZXR3ZWVuOiBiZXR3ZWVuLFxuICAgICAgICBncmVhdGVyOiBncmVhdGVyLFxuICAgICAgICBsZXNzOiBsZXNzLFxuICAgICAgICBwb3NpdGl2ZTogcG9zaXRpdmUsXG4gICAgICAgIG5lZ2F0aXZlOiBuZWdhdGl2ZSxcbiAgICAgICAgaW50ZWdlciA6IGludGVnZXIsXG4gICAgICAgIHplcm86IHplcm8sXG4gICAgICAgIG51bWJlcjogbnVtYmVyLFxuICAgICAgICBib29sZWFuOiBib29sZWFuXG4gICAgfTtcblxuICAgIGZ1bmN0aW9ucyA9IHtcbiAgICAgICAgYXBwbHk6IGFwcGx5LFxuICAgICAgICBtYXA6IG1hcCxcbiAgICAgICAgYWxsOiBhbGwsXG4gICAgICAgIGFueTogYW55XG4gICAgfTtcblxuICAgIGZ1bmN0aW9ucyA9IG1peGluKGZ1bmN0aW9ucywgcHJlZGljYXRlcyk7XG4gICAgYXNzZXJ0ID0gY3JlYXRlTW9kaWZpZWRQcmVkaWNhdGVzKGFzc2VydE1vZGlmaWVyLCBhc3NlcnRJbXBsKTtcbiAgICBub3QgPSBjcmVhdGVNb2RpZmllZFByZWRpY2F0ZXMobm90TW9kaWZpZXIsIG5vdEltcGwpO1xuICAgIG1heWJlID0gY3JlYXRlTW9kaWZpZWRQcmVkaWNhdGVzKG1heWJlTW9kaWZpZXIsIG1heWJlSW1wbCk7XG4gICAgZWl0aGVyID0gY3JlYXRlTW9kaWZpZWRQcmVkaWNhdGVzKGVpdGhlck1vZGlmaWVyKTtcbiAgICBhc3NlcnQubm90ID0gY3JlYXRlTW9kaWZpZWRGdW5jdGlvbnMoYXNzZXJ0TW9kaWZpZXIsIG5vdCk7XG4gICAgYXNzZXJ0Lm1heWJlID0gY3JlYXRlTW9kaWZpZWRGdW5jdGlvbnMoYXNzZXJ0TW9kaWZpZXIsIG1heWJlKTtcbiAgICBhc3NlcnQuZWl0aGVyID0gY3JlYXRlTW9kaWZpZWRGdW5jdGlvbnMoYXNzZXJ0RWl0aGVyTW9kaWZpZXIsIHByZWRpY2F0ZXMpO1xuXG4gICAgZXhwb3J0RnVuY3Rpb25zKG1peGluKGZ1bmN0aW9ucywge1xuICAgICAgICBhc3NlcnQ6IGFzc2VydCxcbiAgICAgICAgbm90OiBub3QsXG4gICAgICAgIG1heWJlOiBtYXliZSxcbiAgICAgICAgZWl0aGVyOiBlaXRoZXJcbiAgICB9KSk7XG5cbiAgICAvKipcbiAgICAgKiBQdWJsaWMgZnVuY3Rpb24gYGxpa2VgLlxuICAgICAqXG4gICAgICogVGVzdHMgd2hldGhlciBhbiBvYmplY3QgJ3F1YWNrcyBsaWtlIGEgZHVjaycuXG4gICAgICogUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGZpcnN0IGFyZ3VtZW50IGhhcyBhbGwgb2ZcbiAgICAgKiB0aGUgcHJvcGVydGllcyBvZiB0aGUgc2Vjb25kLCBhcmNoZXR5cGFsIGFyZ3VtZW50XG4gICAgICogKHRoZSAnZHVjaycpLiBSZXR1cm5zIGBmYWxzZWAgb3RoZXJ3aXNlLlxuICAgICAqXG4gICAgICovXG4gICAgZnVuY3Rpb24gbGlrZSAoZGF0YSwgZHVjaykge1xuICAgICAgICB2YXIgbmFtZTtcblxuICAgICAgICBmb3IgKG5hbWUgaW4gZHVjaykge1xuICAgICAgICAgICAgaWYgKGR1Y2suaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgICAgICAgICAgICBpZiAoZGF0YS5oYXNPd25Qcm9wZXJ0eShuYW1lKSA9PT0gZmFsc2UgfHwgdHlwZW9mIGRhdGFbbmFtZV0gIT09IHR5cGVvZiBkdWNrW25hbWVdKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAob2JqZWN0KGRhdGFbbmFtZV0pICYmIGxpa2UoZGF0YVtuYW1lXSwgZHVja1tuYW1lXSkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQdWJsaWMgZnVuY3Rpb24gYGluc3RhbmNlYC5cbiAgICAgKlxuICAgICAqIFJldHVybnMgYHRydWVgIGlmIGFuIG9iamVjdCBpcyBhbiBpbnN0YW5jZSBvZiBhIHByb3RvdHlwZSxcbiAgICAgKiBgZmFsc2VgIG90aGVyd2lzZS5cbiAgICAgKlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGluc3RhbmNlIChkYXRhLCBwcm90b3R5cGUpIHtcbiAgICAgICAgaWYgKGRhdGEgJiYgaXNGdW5jdGlvbihwcm90b3R5cGUpICYmIGRhdGEgaW5zdGFuY2VvZiBwcm90b3R5cGUpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFB1YmxpYyBmdW5jdGlvbiBgZW1wdHlPYmplY3RgLlxuICAgICAqXG4gICAgICogUmV0dXJucyBgdHJ1ZWAgaWYgc29tZXRoaW5nIGlzIGFuIGVtcHR5IG9iamVjdCxcbiAgICAgKiBgZmFsc2VgIG90aGVyd2lzZS5cbiAgICAgKlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGVtcHR5T2JqZWN0IChkYXRhKSB7XG4gICAgICAgIHJldHVybiBvYmplY3QoZGF0YSkgJiYgT2JqZWN0LmtleXMoZGF0YSkubGVuZ3RoID09PSAwO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFB1YmxpYyBmdW5jdGlvbiBgb2JqZWN0YC5cbiAgICAgKlxuICAgICAqIFJldHVybnMgYHRydWVgIGlmIHNvbWV0aGluZyBpcyBhIHBsYWluLW9sZCBKUyBvYmplY3QsXG4gICAgICogYGZhbHNlYCBvdGhlcndpc2UuXG4gICAgICpcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBvYmplY3QgKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChkYXRhKSA9PT0gJ1tvYmplY3QgT2JqZWN0XSc7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHVibGljIGZ1bmN0aW9uIGBhc3NpZ25lZGAuXG4gICAgICpcbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBpZiBzb21ldGhpbmcgaXMgbm90IG51bGwgb3IgdW5kZWZpbmVkLFxuICAgICAqIGBmYWxzZWAgb3RoZXJ3aXNlLlxuICAgICAqXG4gICAgICovXG4gICAgZnVuY3Rpb24gYXNzaWduZWQgKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuICFpc1VuZGVmaW5lZChkYXRhKSAmJiAhaXNOdWxsKGRhdGEpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFB1YmxpYyBmdW5jdGlvbiBgdW5kZWZpbmVkYC5cbiAgICAgKlxuICAgICAqIFJldHVybnMgYHRydWVgIGlmIHNvbWV0aGluZyBpcyB1bmRlZmluZWQsXG4gICAgICogYGZhbHNlYCBvdGhlcndpc2UuXG4gICAgICpcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBpc1VuZGVmaW5lZCAoZGF0YSkge1xuICAgICAgICByZXR1cm4gZGF0YSA9PT0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFB1YmxpYyBmdW5jdGlvbiBgbnVsbGAuXG4gICAgICpcbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBpZiBzb21ldGhpbmcgaXMgbnVsbCxcbiAgICAgKiBgZmFsc2VgIG90aGVyd2lzZS5cbiAgICAgKlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGlzTnVsbCAoZGF0YSkge1xuICAgICAgICByZXR1cm4gZGF0YSA9PT0gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQdWJsaWMgZnVuY3Rpb24gYGhhc0xlbmd0aGAuXG4gICAgICpcbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBpZiBzb21ldGhpbmcgaXMgaGFzIGEgbGVuZ3RoIHByb3BlcnR5XG4gICAgICogdGhhdCBlcXVhbHMgYHZhbHVlYCwgYGZhbHNlYCBvdGhlcndpc2UuXG4gICAgICpcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBoYXNMZW5ndGggKGRhdGEsIHZhbHVlKSB7XG4gICAgICAgIHJldHVybiBhc3NpZ25lZChkYXRhKSAmJiBkYXRhLmxlbmd0aCA9PT0gdmFsdWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHVibGljIGZ1bmN0aW9uIGBlbXB0eUFycmF5YC5cbiAgICAgKlxuICAgICAqIFJldHVybnMgYHRydWVgIGlmIHNvbWV0aGluZyBpcyBhbiBlbXB0eSBhcnJheSxcbiAgICAgKiBgZmFsc2VgIG90aGVyd2lzZS5cbiAgICAgKlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGVtcHR5QXJyYXkgKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIGFycmF5KGRhdGEpICYmIGRhdGEubGVuZ3RoID09PSAwO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFB1YmxpYyBmdW5jdGlvbiBgYXJyYXlgLlxuICAgICAqXG4gICAgICogUmV0dXJucyBgdHJ1ZWAgc29tZXRoaW5nIGlzIGFuIGFycmF5LFxuICAgICAqIGBmYWxzZWAgb3RoZXJ3aXNlLlxuICAgICAqXG4gICAgICovXG4gICAgZnVuY3Rpb24gYXJyYXkgKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIEFycmF5LmlzQXJyYXkoZGF0YSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHVibGljIGZ1bmN0aW9uIGBkYXRlYC5cbiAgICAgKlxuICAgICAqIFJldHVybnMgYHRydWVgIHNvbWV0aGluZyBpcyBhIHZhbGlkIGRhdGUsXG4gICAgICogYGZhbHNlYCBvdGhlcndpc2UuXG4gICAgICpcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBkYXRlIChkYXRhKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoZGF0YSkgPT09ICdbb2JqZWN0IERhdGVdJyAmJlxuICAgICAgICAgICAgIWlzTmFOKGRhdGEuZ2V0VGltZSgpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQdWJsaWMgZnVuY3Rpb24gYGVycm9yYC5cbiAgICAgKlxuICAgICAqIFJldHVybnMgYHRydWVgIGlmIHNvbWV0aGluZyBpcyBhIHBsYWluLW9sZCBKUyBvYmplY3QsXG4gICAgICogYGZhbHNlYCBvdGhlcndpc2UuXG4gICAgICpcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBlcnJvciAoZGF0YSkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGRhdGEpID09PSAnW29iamVjdCBFcnJvcl0nO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFB1YmxpYyBmdW5jdGlvbiBgZnVuY3Rpb25gLlxuICAgICAqXG4gICAgICogUmV0dXJucyBgdHJ1ZWAgaWYgc29tZXRoaW5nIGlzIGZ1bmN0aW9uLFxuICAgICAqIGBmYWxzZWAgb3RoZXJ3aXNlLlxuICAgICAqXG4gICAgICovXG4gICAgZnVuY3Rpb24gaXNGdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICByZXR1cm4gdHlwZW9mIGRhdGEgPT09ICdmdW5jdGlvbic7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHVibGljIGZ1bmN0aW9uIGBtYXRjaGAuXG4gICAgICpcbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBpZiBzb21ldGhpbmcgaXMgYSBzdHJpbmdcbiAgICAgKiB0aGF0IG1hdGNoZXMgYHJlZ2V4YCwgYGZhbHNlYCBvdGhlcndpc2UuXG4gICAgICpcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBtYXRjaCAoZGF0YSwgcmVnZXgpIHtcbiAgICAgICAgcmV0dXJuIHN0cmluZyhkYXRhKSAmJiAhIWRhdGEubWF0Y2gocmVnZXgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFB1YmxpYyBmdW5jdGlvbiBgY29udGFpbnNgLlxuICAgICAqXG4gICAgICogUmV0dXJucyBgdHJ1ZWAgaWYgc29tZXRoaW5nIGlzIGEgc3RyaW5nXG4gICAgICogdGhhdCBjb250YWlucyBgc3Vic3RyaW5nYCwgYGZhbHNlYCBvdGhlcndpc2UuXG4gICAgICpcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBjb250YWlucyAoZGF0YSwgc3Vic3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBzdHJpbmcoZGF0YSkgJiYgZGF0YS5pbmRleE9mKHN1YnN0cmluZykgIT09IC0xO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFB1YmxpYyBmdW5jdGlvbiBgdW5lbXB0eVN0cmluZ2AuXG4gICAgICpcbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBpZiBzb21ldGhpbmcgaXMgYSBub24tZW1wdHkgc3RyaW5nLFxuICAgICAqIGBmYWxzZWAgb3RoZXJ3aXNlLlxuICAgICAqXG4gICAgICovXG4gICAgZnVuY3Rpb24gdW5lbXB0eVN0cmluZyAoZGF0YSkge1xuICAgICAgICByZXR1cm4gc3RyaW5nKGRhdGEpICYmIGRhdGEgIT09ICcnO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFB1YmxpYyBmdW5jdGlvbiBgc3RyaW5nYC5cbiAgICAgKlxuICAgICAqIFJldHVybnMgYHRydWVgIGlmIHNvbWV0aGluZyBpcyBhIHN0cmluZywgYGZhbHNlYCBvdGhlcndpc2UuXG4gICAgICpcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBzdHJpbmcgKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBkYXRhID09PSAnc3RyaW5nJztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQdWJsaWMgZnVuY3Rpb24gYG9kZGAuXG4gICAgICpcbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBpZiBzb21ldGhpbmcgaXMgYW4gb2RkIG51bWJlcixcbiAgICAgKiBgZmFsc2VgIG90aGVyd2lzZS5cbiAgICAgKlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIG9kZCAoZGF0YSkge1xuICAgICAgICByZXR1cm4gaW50ZWdlcihkYXRhKSAmJiAhZXZlbihkYXRhKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQdWJsaWMgZnVuY3Rpb24gYGV2ZW5gLlxuICAgICAqXG4gICAgICogUmV0dXJucyBgdHJ1ZWAgaWYgc29tZXRoaW5nIGlzIGFuIGV2ZW4gbnVtYmVyLFxuICAgICAqIGBmYWxzZWAgb3RoZXJ3aXNlLlxuICAgICAqXG4gICAgICovXG4gICAgZnVuY3Rpb24gZXZlbiAoZGF0YSkge1xuICAgICAgICByZXR1cm4gbnVtYmVyKGRhdGEpICYmIGRhdGEgJSAyID09PSAwO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFB1YmxpYyBmdW5jdGlvbiBgaW50ZWdlcmAuXG4gICAgICpcbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBpZiBzb21ldGhpbmcgaXMgYW4gaW50ZWdlcixcbiAgICAgKiBgZmFsc2VgIG90aGVyd2lzZS5cbiAgICAgKlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGludGVnZXIgKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIG51bWJlcihkYXRhKSAmJiBkYXRhICUgMSA9PT0gMDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQdWJsaWMgZnVuY3Rpb24gYGJldHdlZW5gLlxuICAgICAqXG4gICAgICogUmV0dXJucyBgdHJ1ZWAgaWYgc29tZXRoaW5nIGlzIGEgbnVtYmVyXG4gICAgICogYmV0d2VlbiBgYWAgYW5kIGBiYCwgYGZhbHNlYCBvdGhlcndpc2UuXG4gICAgICpcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBiZXR3ZWVuIChkYXRhLCBhLCBiKSB7XG4gICAgICAgIGlmIChhIDwgYikge1xuICAgICAgICAgICAgcmV0dXJuIGdyZWF0ZXIoZGF0YSwgYSkgJiYgbGVzcyhkYXRhLCBiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBsZXNzKGRhdGEsIGEpICYmIGdyZWF0ZXIoZGF0YSwgYik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHVibGljIGZ1bmN0aW9uIGBncmVhdGVyYC5cbiAgICAgKlxuICAgICAqIFJldHVybnMgYHRydWVgIGlmIHNvbWV0aGluZyBpcyBhIG51bWJlclxuICAgICAqIGdyZWF0ZXIgdGhhbiBgdmFsdWVgLCBgZmFsc2VgIG90aGVyd2lzZS5cbiAgICAgKlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGdyZWF0ZXIgKGRhdGEsIHZhbHVlKSB7XG4gICAgICAgIHJldHVybiBudW1iZXIoZGF0YSkgJiYgZGF0YSA+IHZhbHVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFB1YmxpYyBmdW5jdGlvbiBgbGVzc2AuXG4gICAgICpcbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBpZiBzb21ldGhpbmcgaXMgYSBudW1iZXJcbiAgICAgKiBsZXNzIHRoYW4gYHZhbHVlYCwgYGZhbHNlYCBvdGhlcndpc2UuXG4gICAgICpcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBsZXNzIChkYXRhLCB2YWx1ZSkge1xuICAgICAgICByZXR1cm4gbnVtYmVyKGRhdGEpICYmIGRhdGEgPCB2YWx1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQdWJsaWMgZnVuY3Rpb24gYHBvc2l0aXZlYC5cbiAgICAgKlxuICAgICAqIFJldHVybnMgYHRydWVgIGlmIHNvbWV0aGluZyBpcyBhIHBvc2l0aXZlIG51bWJlcixcbiAgICAgKiBgZmFsc2VgIG90aGVyd2lzZS5cbiAgICAgKlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHBvc2l0aXZlIChkYXRhKSB7XG4gICAgICAgIHJldHVybiBncmVhdGVyKGRhdGEsIDApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFB1YmxpYyBmdW5jdGlvbiBgbmVnYXRpdmVgLlxuICAgICAqXG4gICAgICogUmV0dXJucyBgdHJ1ZWAgaWYgc29tZXRoaW5nIGlzIGEgbmVnYXRpdmUgbnVtYmVyLFxuICAgICAqIGBmYWxzZWAgb3RoZXJ3aXNlLlxuICAgICAqXG4gICAgICogQHBhcmFtIGRhdGEgICAgICAgICAgVGhlIHRoaW5nIHRvIHRlc3QuXG4gICAgICovXG4gICAgZnVuY3Rpb24gbmVnYXRpdmUgKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIGxlc3MoZGF0YSwgMCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHVibGljIGZ1bmN0aW9uIGBudW1iZXJgLlxuICAgICAqXG4gICAgICogUmV0dXJucyBgdHJ1ZWAgaWYgZGF0YSBpcyBhIG51bWJlcixcbiAgICAgKiBgZmFsc2VgIG90aGVyd2lzZS5cbiAgICAgKlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIG51bWJlciAoZGF0YSkge1xuICAgICAgICByZXR1cm4gdHlwZW9mIGRhdGEgPT09ICdudW1iZXInICYmIGlzTmFOKGRhdGEpID09PSBmYWxzZSAmJlxuICAgICAgICAgICAgICAgZGF0YSAhPT0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZICYmXG4gICAgICAgICAgICAgICBkYXRhICE9PSBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHVibGljIGZ1bmN0aW9uIGB6ZXJvYC5cbiAgICAgKlxuICAgICAqIFJldHVybnMgYHRydWVgIGlmIHNvbWV0aGluZyBpcyB6ZXJvLFxuICAgICAqIGBmYWxzZWAgb3RoZXJ3aXNlLlxuICAgICAqXG4gICAgICogQHBhcmFtIGRhdGEgICAgICAgICAgVGhlIHRoaW5nIHRvIHRlc3QuXG4gICAgICovXG4gICAgZnVuY3Rpb24gemVybyAoZGF0YSkge1xuICAgICAgICByZXR1cm4gZGF0YSA9PT0gMDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQdWJsaWMgZnVuY3Rpb24gYGJvb2xlYW5gLlxuICAgICAqXG4gICAgICogUmV0dXJucyBgdHJ1ZWAgaWYgZGF0YSBpcyBhIGJvb2xlYW4gdmFsdWUsXG4gICAgICogYGZhbHNlYCBvdGhlcndpc2UuXG4gICAgICpcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBib29sZWFuIChkYXRhKSB7XG4gICAgICAgIHJldHVybiBkYXRhID09PSBmYWxzZSB8fCBkYXRhID09PSB0cnVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFB1YmxpYyBmdW5jdGlvbiBgYXBwbHlgLlxuICAgICAqXG4gICAgICogTWFwcyBlYWNoIHZhbHVlIGZyb20gdGhlIGRhdGEgdG8gdGhlIGNvcnJlc3BvbmRpbmcgcHJlZGljYXRlIGFuZCByZXR1cm5zXG4gICAgICogdGhlIHJlc3VsdCBhcnJheS4gSWYgdGhlIHNhbWUgZnVuY3Rpb24gaXMgdG8gYmUgYXBwbGllZCBhY3Jvc3MgYWxsIG9mIHRoZVxuICAgICAqIGRhdGEsIGEgc2luZ2xlIHByZWRpY2F0ZSBmdW5jdGlvbiBtYXkgYmUgcGFzc2VkIGluLlxuICAgICAqXG4gICAgICovXG4gICAgZnVuY3Rpb24gYXBwbHkgKGRhdGEsIHByZWRpY2F0ZXMpIHtcbiAgICAgICAgYXNzZXJ0LmFycmF5KGRhdGEpO1xuXG4gICAgICAgIGlmIChpc0Z1bmN0aW9uKHByZWRpY2F0ZXMpKSB7XG4gICAgICAgICAgICByZXR1cm4gZGF0YS5tYXAoZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByZWRpY2F0ZXModmFsdWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBhc3NlcnQuYXJyYXkocHJlZGljYXRlcyk7XG4gICAgICAgIGFzc2VydC5oYXNMZW5ndGgoZGF0YSwgcHJlZGljYXRlcy5sZW5ndGgpO1xuXG4gICAgICAgIHJldHVybiBkYXRhLm1hcChmdW5jdGlvbiAodmFsdWUsIGluZGV4KSB7XG4gICAgICAgICAgICByZXR1cm4gcHJlZGljYXRlc1tpbmRleF0odmFsdWUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQdWJsaWMgZnVuY3Rpb24gYG1hcGAuXG4gICAgICpcbiAgICAgKiBNYXBzIGVhY2ggdmFsdWUgZnJvbSB0aGUgZGF0YSB0byB0aGUgY29ycmVzcG9uZGluZyBwcmVkaWNhdGUgYW5kIHJldHVybnNcbiAgICAgKiB0aGUgcmVzdWx0IG9iamVjdC4gU3VwcG9ydHMgbmVzdGVkIG9iamVjdHMuIElmIHRoZSBkYXRhIGlzIG5vdCBuZXN0ZWQgYW5kXG4gICAgICogdGhlIHNhbWUgZnVuY3Rpb24gaXMgdG8gYmUgYXBwbGllZCBhY3Jvc3MgYWxsIG9mIGl0LCBhIHNpbmdsZSBwcmVkaWNhdGVcbiAgICAgKiBmdW5jdGlvbiBtYXkgYmUgcGFzc2VkIGluLlxuICAgICAqXG4gICAgICovXG4gICAgZnVuY3Rpb24gbWFwIChkYXRhLCBwcmVkaWNhdGVzKSB7XG4gICAgICAgIGFzc2VydC5vYmplY3QoZGF0YSk7XG5cbiAgICAgICAgaWYgKGlzRnVuY3Rpb24ocHJlZGljYXRlcykpIHtcbiAgICAgICAgICAgIHJldHVybiBtYXBTaW1wbGUoZGF0YSwgcHJlZGljYXRlcyk7XG4gICAgICAgIH1cblxuICAgICAgICBhc3NlcnQub2JqZWN0KHByZWRpY2F0ZXMpO1xuXG4gICAgICAgIHJldHVybiBtYXBDb21wbGV4KGRhdGEsIHByZWRpY2F0ZXMpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1hcFNpbXBsZSAoZGF0YSwgcHJlZGljYXRlKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSB7fTtcblxuICAgICAgICBPYmplY3Qua2V5cyhkYXRhKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIHJlc3VsdFtrZXldID0gcHJlZGljYXRlKGRhdGFba2V5XSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWFwQ29tcGxleCAoZGF0YSwgcHJlZGljYXRlcykge1xuICAgICAgICB2YXIgcmVzdWx0ID0ge307XG5cbiAgICAgICAgT2JqZWN0LmtleXMocHJlZGljYXRlcykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICB2YXIgcHJlZGljYXRlID0gcHJlZGljYXRlc1trZXldO1xuXG4gICAgICAgICAgICBpZiAoaXNGdW5jdGlvbihwcmVkaWNhdGUpKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0W2tleV0gPSBwcmVkaWNhdGUoZGF0YVtrZXldKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAob2JqZWN0KHByZWRpY2F0ZSkpIHtcbiAgICAgICAgICAgICAgICByZXN1bHRba2V5XSA9IG1hcENvbXBsZXgoZGF0YVtrZXldLCBwcmVkaWNhdGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFB1YmxpYyBmdW5jdGlvbiBgYWxsYFxuICAgICAqXG4gICAgICogQ2hlY2sgdGhhdCBhbGwgYm9vbGVhbiB2YWx1ZXMgYXJlIHRydWVcbiAgICAgKiBpbiBhbiBhcnJheSAocmV0dXJuZWQgZnJvbSBgYXBwbHlgKVxuICAgICAqIG9yIG9iamVjdCAocmV0dXJuZWQgZnJvbSBgbWFwYCkuXG4gICAgICpcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBhbGwgKGRhdGEpIHtcbiAgICAgICAgaWYgKGFycmF5KGRhdGEpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGVzdEFycmF5KGRhdGEsIGZhbHNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGFzc2VydC5vYmplY3QoZGF0YSk7XG5cbiAgICAgICAgcmV0dXJuIHRlc3RPYmplY3QoZGF0YSwgZmFsc2UpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRlc3RBcnJheSAoZGF0YSwgcmVzdWx0KSB7XG4gICAgICAgIHZhciBpO1xuXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICBpZiAoZGF0YVtpXSA9PT0gcmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAhcmVzdWx0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRlc3RPYmplY3QgKGRhdGEsIHJlc3VsdCkge1xuICAgICAgICB2YXIga2V5LCB2YWx1ZTtcblxuICAgICAgICBmb3IgKGtleSBpbiBkYXRhKSB7XG4gICAgICAgICAgICBpZiAoZGF0YS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBkYXRhW2tleV07XG5cbiAgICAgICAgICAgICAgICBpZiAob2JqZWN0KHZhbHVlKSAmJiB0ZXN0T2JqZWN0KHZhbHVlLCByZXN1bHQpID09PSByZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT09IHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAhcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFB1YmxpYyBmdW5jdGlvbiBgYW55YFxuICAgICAqXG4gICAgICogQ2hlY2sgdGhhdCBhdCBsZWFzdCBvbmUgYm9vbGVhbiB2YWx1ZSBpcyB0cnVlXG4gICAgICogaW4gYW4gYXJyYXkgKHJldHVybmVkIGZyb20gYGFwcGx5YClcbiAgICAgKiBvciBvYmplY3QgKHJldHVybmVkIGZyb20gYG1hcGApLlxuICAgICAqXG4gICAgICovXG4gICAgZnVuY3Rpb24gYW55IChkYXRhKSB7XG4gICAgICAgIGlmIChhcnJheShkYXRhKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRlc3RBcnJheShkYXRhLCB0cnVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGFzc2VydC5vYmplY3QoZGF0YSk7XG5cbiAgICAgICAgcmV0dXJuIHRlc3RPYmplY3QoZGF0YSwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWl4aW4gKHRhcmdldCwgc291cmNlKSB7XG4gICAgICAgIE9iamVjdC5rZXlzKHNvdXJjZSkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFB1YmxpYyBtb2RpZmllciBgYXNzZXJ0YC5cbiAgICAgKlxuICAgICAqIFRocm93cyBpZiBgcHJlZGljYXRlYCByZXR1cm5zIGBmYWxzZWAuXG4gICAgICovXG4gICAgZnVuY3Rpb24gYXNzZXJ0TW9kaWZpZXIgKHByZWRpY2F0ZSwgZGVmYXVsdE1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGFzc2VydFByZWRpY2F0ZShwcmVkaWNhdGUsIGFyZ3VtZW50cywgZGVmYXVsdE1lc3NhZ2UpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFzc2VydFByZWRpY2F0ZSAocHJlZGljYXRlLCBhcmdzLCBkZWZhdWx0TWVzc2FnZSkge1xuICAgICAgICB2YXIgbWVzc2FnZSA9IGFyZ3NbYXJncy5sZW5ndGggLSAxXTtcbiAgICAgICAgYXNzZXJ0SW1wbChwcmVkaWNhdGUuYXBwbHkobnVsbCwgYXJncyksIHVuZW1wdHlTdHJpbmcobWVzc2FnZSkgPyBtZXNzYWdlIDogZGVmYXVsdE1lc3NhZ2UpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFzc2VydEltcGwgKHZhbHVlLCBtZXNzYWdlKSB7XG4gICAgICAgIGlmICh2YWx1ZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihtZXNzYWdlIHx8ICdBc3NlcnRpb24gZmFpbGVkJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhc3NlcnRFaXRoZXJNb2RpZmllciAocHJlZGljYXRlLCBkZWZhdWx0TWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGVycm9yO1xuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGFzc2VydFByZWRpY2F0ZShwcmVkaWNhdGUsIGFyZ3VtZW50cywgZGVmYXVsdE1lc3NhZ2UpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGVycm9yID0gZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBvcjogT2JqZWN0LmtleXMocHJlZGljYXRlcykucmVkdWNlKGRlbGF5ZWRBc3NlcnQsIHt9KVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgZnVuY3Rpb24gZGVsYXllZEFzc2VydCAocmVzdWx0LCBrZXkpIHtcbiAgICAgICAgICAgICAgICByZXN1bHRba2V5XSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycm9yICYmICFwcmVkaWNhdGVzW2tleV0uYXBwbHkobnVsbCwgYXJndW1lbnRzKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQdWJsaWMgbW9kaWZpZXIgYG5vdGAuXG4gICAgICpcbiAgICAgKiBOZWdhdGVzIGBwcmVkaWNhdGVgLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIG5vdE1vZGlmaWVyIChwcmVkaWNhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBub3RJbXBsKHByZWRpY2F0ZS5hcHBseShudWxsLCBhcmd1bWVudHMpKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBub3RJbXBsICh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gIXZhbHVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFB1YmxpYyBtb2RpZmllciBgbWF5YmVgLlxuICAgICAqXG4gICAgICogUmV0dXJucyBgdHJ1ZWAgaWYgcHJlZGljYXRlIGFyZ3VtZW50IGlzICBgbnVsbGAgb3IgYHVuZGVmaW5lZGAsXG4gICAgICogb3RoZXJ3aXNlIHByb3BhZ2F0ZXMgdGhlIHJldHVybiB2YWx1ZSBmcm9tIGBwcmVkaWNhdGVgLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIG1heWJlTW9kaWZpZXIgKHByZWRpY2F0ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKCFhc3NpZ25lZChhcmd1bWVudHNbMF0pKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBwcmVkaWNhdGUuYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtYXliZUltcGwgKHZhbHVlKSB7XG4gICAgICAgIGlmIChhc3NpZ25lZCh2YWx1ZSkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQdWJsaWMgbW9kaWZpZXIgYGVpdGhlcmAuXG4gICAgICpcbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBpZiBlaXRoZXIgcHJlZGljYXRlIGlzIHRydWUuXG4gICAgICovXG4gICAgZnVuY3Rpb24gZWl0aGVyTW9kaWZpZXIgKHByZWRpY2F0ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHNob3J0Y3V0ID0gcHJlZGljYXRlLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgb3I6IE9iamVjdC5rZXlzKHByZWRpY2F0ZXMpLnJlZHVjZShub3BPclByZWRpY2F0ZSwge30pXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBub3BPclByZWRpY2F0ZSAocmVzdWx0LCBrZXkpIHtcbiAgICAgICAgICAgICAgICByZXN1bHRba2V5XSA9IHNob3J0Y3V0ID8gbm9wIDogcHJlZGljYXRlc1trZXldO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgZnVuY3Rpb24gbm9wICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY3JlYXRlTW9kaWZpZWRQcmVkaWNhdGVzIChtb2RpZmllciwgb2JqZWN0KSB7XG4gICAgICAgIHJldHVybiBjcmVhdGVNb2RpZmllZEZ1bmN0aW9ucyhtb2RpZmllciwgcHJlZGljYXRlcywgb2JqZWN0KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVNb2RpZmllZEZ1bmN0aW9ucyAobW9kaWZpZXIsIGZ1bmN0aW9ucywgb2JqZWN0KSB7XG4gICAgICAgIHZhciByZXN1bHQgPSBvYmplY3QgfHwge307XG5cbiAgICAgICAgT2JqZWN0LmtleXMoZnVuY3Rpb25zKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShyZXN1bHQsIGtleSwge1xuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB3cml0YWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgdmFsdWU6IG1vZGlmaWVyKGZ1bmN0aW9uc1trZXldLCBtZXNzYWdlc1trZXldKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZXhwb3J0RnVuY3Rpb25zIChmdW5jdGlvbnMpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICAgICAgZGVmaW5lKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb25zO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlICE9PSBudWxsICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9ucztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGdsb2JhbHMuY2hlY2sgPSBmdW5jdGlvbnM7XG4gICAgICAgIH1cbiAgICB9XG59KHRoaXMpKTtcbiIsIi8qKlxuICogQ29weXJpZ2h0IChjKSAyMDE0LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBCU0Qtc3R5bGUgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS4gQW4gYWRkaXRpb25hbCBncmFudFxuICogb2YgcGF0ZW50IHJpZ2h0cyBjYW4gYmUgZm91bmQgaW4gdGhlIFBBVEVOVFMgZmlsZSBpbiB0aGUgc2FtZSBkaXJlY3RvcnkuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMuRGlzcGF0Y2hlciA9IHJlcXVpcmUoJy4vbGliL0Rpc3BhdGNoZXInKVxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAxNCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgQlNELXN0eWxlIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuIEFuIGFkZGl0aW9uYWwgZ3JhbnRcbiAqIG9mIHBhdGVudCByaWdodHMgY2FuIGJlIGZvdW5kIGluIHRoZSBQQVRFTlRTIGZpbGUgaW4gdGhlIHNhbWUgZGlyZWN0b3J5LlxuICpcbiAqIEBwcm92aWRlc01vZHVsZSBEaXNwYXRjaGVyXG4gKiBAdHlwZWNoZWNrc1xuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgaW52YXJpYW50ID0gcmVxdWlyZSgnLi9pbnZhcmlhbnQnKTtcblxudmFyIF9sYXN0SUQgPSAxO1xudmFyIF9wcmVmaXggPSAnSURfJztcblxuLyoqXG4gKiBEaXNwYXRjaGVyIGlzIHVzZWQgdG8gYnJvYWRjYXN0IHBheWxvYWRzIHRvIHJlZ2lzdGVyZWQgY2FsbGJhY2tzLiBUaGlzIGlzXG4gKiBkaWZmZXJlbnQgZnJvbSBnZW5lcmljIHB1Yi1zdWIgc3lzdGVtcyBpbiB0d28gd2F5czpcbiAqXG4gKiAgIDEpIENhbGxiYWNrcyBhcmUgbm90IHN1YnNjcmliZWQgdG8gcGFydGljdWxhciBldmVudHMuIEV2ZXJ5IHBheWxvYWQgaXNcbiAqICAgICAgZGlzcGF0Y2hlZCB0byBldmVyeSByZWdpc3RlcmVkIGNhbGxiYWNrLlxuICogICAyKSBDYWxsYmFja3MgY2FuIGJlIGRlZmVycmVkIGluIHdob2xlIG9yIHBhcnQgdW50aWwgb3RoZXIgY2FsbGJhY2tzIGhhdmVcbiAqICAgICAgYmVlbiBleGVjdXRlZC5cbiAqXG4gKiBGb3IgZXhhbXBsZSwgY29uc2lkZXIgdGhpcyBoeXBvdGhldGljYWwgZmxpZ2h0IGRlc3RpbmF0aW9uIGZvcm0sIHdoaWNoXG4gKiBzZWxlY3RzIGEgZGVmYXVsdCBjaXR5IHdoZW4gYSBjb3VudHJ5IGlzIHNlbGVjdGVkOlxuICpcbiAqICAgdmFyIGZsaWdodERpc3BhdGNoZXIgPSBuZXcgRGlzcGF0Y2hlcigpO1xuICpcbiAqICAgLy8gS2VlcHMgdHJhY2sgb2Ygd2hpY2ggY291bnRyeSBpcyBzZWxlY3RlZFxuICogICB2YXIgQ291bnRyeVN0b3JlID0ge2NvdW50cnk6IG51bGx9O1xuICpcbiAqICAgLy8gS2VlcHMgdHJhY2sgb2Ygd2hpY2ggY2l0eSBpcyBzZWxlY3RlZFxuICogICB2YXIgQ2l0eVN0b3JlID0ge2NpdHk6IG51bGx9O1xuICpcbiAqICAgLy8gS2VlcHMgdHJhY2sgb2YgdGhlIGJhc2UgZmxpZ2h0IHByaWNlIG9mIHRoZSBzZWxlY3RlZCBjaXR5XG4gKiAgIHZhciBGbGlnaHRQcmljZVN0b3JlID0ge3ByaWNlOiBudWxsfVxuICpcbiAqIFdoZW4gYSB1c2VyIGNoYW5nZXMgdGhlIHNlbGVjdGVkIGNpdHksIHdlIGRpc3BhdGNoIHRoZSBwYXlsb2FkOlxuICpcbiAqICAgZmxpZ2h0RGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gKiAgICAgYWN0aW9uVHlwZTogJ2NpdHktdXBkYXRlJyxcbiAqICAgICBzZWxlY3RlZENpdHk6ICdwYXJpcydcbiAqICAgfSk7XG4gKlxuICogVGhpcyBwYXlsb2FkIGlzIGRpZ2VzdGVkIGJ5IGBDaXR5U3RvcmVgOlxuICpcbiAqICAgZmxpZ2h0RGlzcGF0Y2hlci5yZWdpc3RlcihmdW5jdGlvbihwYXlsb2FkKSB7XG4gKiAgICAgaWYgKHBheWxvYWQuYWN0aW9uVHlwZSA9PT0gJ2NpdHktdXBkYXRlJykge1xuICogICAgICAgQ2l0eVN0b3JlLmNpdHkgPSBwYXlsb2FkLnNlbGVjdGVkQ2l0eTtcbiAqICAgICB9XG4gKiAgIH0pO1xuICpcbiAqIFdoZW4gdGhlIHVzZXIgc2VsZWN0cyBhIGNvdW50cnksIHdlIGRpc3BhdGNoIHRoZSBwYXlsb2FkOlxuICpcbiAqICAgZmxpZ2h0RGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gKiAgICAgYWN0aW9uVHlwZTogJ2NvdW50cnktdXBkYXRlJyxcbiAqICAgICBzZWxlY3RlZENvdW50cnk6ICdhdXN0cmFsaWEnXG4gKiAgIH0pO1xuICpcbiAqIFRoaXMgcGF5bG9hZCBpcyBkaWdlc3RlZCBieSBib3RoIHN0b3JlczpcbiAqXG4gKiAgICBDb3VudHJ5U3RvcmUuZGlzcGF0Y2hUb2tlbiA9IGZsaWdodERpc3BhdGNoZXIucmVnaXN0ZXIoZnVuY3Rpb24ocGF5bG9hZCkge1xuICogICAgIGlmIChwYXlsb2FkLmFjdGlvblR5cGUgPT09ICdjb3VudHJ5LXVwZGF0ZScpIHtcbiAqICAgICAgIENvdW50cnlTdG9yZS5jb3VudHJ5ID0gcGF5bG9hZC5zZWxlY3RlZENvdW50cnk7XG4gKiAgICAgfVxuICogICB9KTtcbiAqXG4gKiBXaGVuIHRoZSBjYWxsYmFjayB0byB1cGRhdGUgYENvdW50cnlTdG9yZWAgaXMgcmVnaXN0ZXJlZCwgd2Ugc2F2ZSBhIHJlZmVyZW5jZVxuICogdG8gdGhlIHJldHVybmVkIHRva2VuLiBVc2luZyB0aGlzIHRva2VuIHdpdGggYHdhaXRGb3IoKWAsIHdlIGNhbiBndWFyYW50ZWVcbiAqIHRoYXQgYENvdW50cnlTdG9yZWAgaXMgdXBkYXRlZCBiZWZvcmUgdGhlIGNhbGxiYWNrIHRoYXQgdXBkYXRlcyBgQ2l0eVN0b3JlYFxuICogbmVlZHMgdG8gcXVlcnkgaXRzIGRhdGEuXG4gKlxuICogICBDaXR5U3RvcmUuZGlzcGF0Y2hUb2tlbiA9IGZsaWdodERpc3BhdGNoZXIucmVnaXN0ZXIoZnVuY3Rpb24ocGF5bG9hZCkge1xuICogICAgIGlmIChwYXlsb2FkLmFjdGlvblR5cGUgPT09ICdjb3VudHJ5LXVwZGF0ZScpIHtcbiAqICAgICAgIC8vIGBDb3VudHJ5U3RvcmUuY291bnRyeWAgbWF5IG5vdCBiZSB1cGRhdGVkLlxuICogICAgICAgZmxpZ2h0RGlzcGF0Y2hlci53YWl0Rm9yKFtDb3VudHJ5U3RvcmUuZGlzcGF0Y2hUb2tlbl0pO1xuICogICAgICAgLy8gYENvdW50cnlTdG9yZS5jb3VudHJ5YCBpcyBub3cgZ3VhcmFudGVlZCB0byBiZSB1cGRhdGVkLlxuICpcbiAqICAgICAgIC8vIFNlbGVjdCB0aGUgZGVmYXVsdCBjaXR5IGZvciB0aGUgbmV3IGNvdW50cnlcbiAqICAgICAgIENpdHlTdG9yZS5jaXR5ID0gZ2V0RGVmYXVsdENpdHlGb3JDb3VudHJ5KENvdW50cnlTdG9yZS5jb3VudHJ5KTtcbiAqICAgICB9XG4gKiAgIH0pO1xuICpcbiAqIFRoZSB1c2FnZSBvZiBgd2FpdEZvcigpYCBjYW4gYmUgY2hhaW5lZCwgZm9yIGV4YW1wbGU6XG4gKlxuICogICBGbGlnaHRQcmljZVN0b3JlLmRpc3BhdGNoVG9rZW4gPVxuICogICAgIGZsaWdodERpc3BhdGNoZXIucmVnaXN0ZXIoZnVuY3Rpb24ocGF5bG9hZCkge1xuICogICAgICAgc3dpdGNoIChwYXlsb2FkLmFjdGlvblR5cGUpIHtcbiAqICAgICAgICAgY2FzZSAnY291bnRyeS11cGRhdGUnOlxuICogICAgICAgICAgIGZsaWdodERpc3BhdGNoZXIud2FpdEZvcihbQ2l0eVN0b3JlLmRpc3BhdGNoVG9rZW5dKTtcbiAqICAgICAgICAgICBGbGlnaHRQcmljZVN0b3JlLnByaWNlID1cbiAqICAgICAgICAgICAgIGdldEZsaWdodFByaWNlU3RvcmUoQ291bnRyeVN0b3JlLmNvdW50cnksIENpdHlTdG9yZS5jaXR5KTtcbiAqICAgICAgICAgICBicmVhaztcbiAqXG4gKiAgICAgICAgIGNhc2UgJ2NpdHktdXBkYXRlJzpcbiAqICAgICAgICAgICBGbGlnaHRQcmljZVN0b3JlLnByaWNlID1cbiAqICAgICAgICAgICAgIEZsaWdodFByaWNlU3RvcmUoQ291bnRyeVN0b3JlLmNvdW50cnksIENpdHlTdG9yZS5jaXR5KTtcbiAqICAgICAgICAgICBicmVhaztcbiAqICAgICB9XG4gKiAgIH0pO1xuICpcbiAqIFRoZSBgY291bnRyeS11cGRhdGVgIHBheWxvYWQgd2lsbCBiZSBndWFyYW50ZWVkIHRvIGludm9rZSB0aGUgc3RvcmVzJ1xuICogcmVnaXN0ZXJlZCBjYWxsYmFja3MgaW4gb3JkZXI6IGBDb3VudHJ5U3RvcmVgLCBgQ2l0eVN0b3JlYCwgdGhlblxuICogYEZsaWdodFByaWNlU3RvcmVgLlxuICovXG5cbiAgZnVuY3Rpb24gRGlzcGF0Y2hlcigpIHtcbiAgICB0aGlzLiREaXNwYXRjaGVyX2NhbGxiYWNrcyA9IHt9O1xuICAgIHRoaXMuJERpc3BhdGNoZXJfaXNQZW5kaW5nID0ge307XG4gICAgdGhpcy4kRGlzcGF0Y2hlcl9pc0hhbmRsZWQgPSB7fTtcbiAgICB0aGlzLiREaXNwYXRjaGVyX2lzRGlzcGF0Y2hpbmcgPSBmYWxzZTtcbiAgICB0aGlzLiREaXNwYXRjaGVyX3BlbmRpbmdQYXlsb2FkID0gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgYSBjYWxsYmFjayB0byBiZSBpbnZva2VkIHdpdGggZXZlcnkgZGlzcGF0Y2hlZCBwYXlsb2FkLiBSZXR1cm5zXG4gICAqIGEgdG9rZW4gdGhhdCBjYW4gYmUgdXNlZCB3aXRoIGB3YWl0Rm9yKClgLlxuICAgKlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFja1xuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAqL1xuICBEaXNwYXRjaGVyLnByb3RvdHlwZS5yZWdpc3Rlcj1mdW5jdGlvbihjYWxsYmFjaykge1xuICAgIHZhciBpZCA9IF9wcmVmaXggKyBfbGFzdElEKys7XG4gICAgdGhpcy4kRGlzcGF0Y2hlcl9jYWxsYmFja3NbaWRdID0gY2FsbGJhY2s7XG4gICAgcmV0dXJuIGlkO1xuICB9O1xuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGEgY2FsbGJhY2sgYmFzZWQgb24gaXRzIHRva2VuLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gaWRcbiAgICovXG4gIERpc3BhdGNoZXIucHJvdG90eXBlLnVucmVnaXN0ZXI9ZnVuY3Rpb24oaWQpIHtcbiAgICBpbnZhcmlhbnQoXG4gICAgICB0aGlzLiREaXNwYXRjaGVyX2NhbGxiYWNrc1tpZF0sXG4gICAgICAnRGlzcGF0Y2hlci51bnJlZ2lzdGVyKC4uLik6IGAlc2AgZG9lcyBub3QgbWFwIHRvIGEgcmVnaXN0ZXJlZCBjYWxsYmFjay4nLFxuICAgICAgaWRcbiAgICApO1xuICAgIGRlbGV0ZSB0aGlzLiREaXNwYXRjaGVyX2NhbGxiYWNrc1tpZF07XG4gIH07XG5cbiAgLyoqXG4gICAqIFdhaXRzIGZvciB0aGUgY2FsbGJhY2tzIHNwZWNpZmllZCB0byBiZSBpbnZva2VkIGJlZm9yZSBjb250aW51aW5nIGV4ZWN1dGlvblxuICAgKiBvZiB0aGUgY3VycmVudCBjYWxsYmFjay4gVGhpcyBtZXRob2Qgc2hvdWxkIG9ubHkgYmUgdXNlZCBieSBhIGNhbGxiYWNrIGluXG4gICAqIHJlc3BvbnNlIHRvIGEgZGlzcGF0Y2hlZCBwYXlsb2FkLlxuICAgKlxuICAgKiBAcGFyYW0ge2FycmF5PHN0cmluZz59IGlkc1xuICAgKi9cbiAgRGlzcGF0Y2hlci5wcm90b3R5cGUud2FpdEZvcj1mdW5jdGlvbihpZHMpIHtcbiAgICBpbnZhcmlhbnQoXG4gICAgICB0aGlzLiREaXNwYXRjaGVyX2lzRGlzcGF0Y2hpbmcsXG4gICAgICAnRGlzcGF0Y2hlci53YWl0Rm9yKC4uLik6IE11c3QgYmUgaW52b2tlZCB3aGlsZSBkaXNwYXRjaGluZy4nXG4gICAgKTtcbiAgICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgaWRzLmxlbmd0aDsgaWkrKykge1xuICAgICAgdmFyIGlkID0gaWRzW2lpXTtcbiAgICAgIGlmICh0aGlzLiREaXNwYXRjaGVyX2lzUGVuZGluZ1tpZF0pIHtcbiAgICAgICAgaW52YXJpYW50KFxuICAgICAgICAgIHRoaXMuJERpc3BhdGNoZXJfaXNIYW5kbGVkW2lkXSxcbiAgICAgICAgICAnRGlzcGF0Y2hlci53YWl0Rm9yKC4uLik6IENpcmN1bGFyIGRlcGVuZGVuY3kgZGV0ZWN0ZWQgd2hpbGUgJyArXG4gICAgICAgICAgJ3dhaXRpbmcgZm9yIGAlc2AuJyxcbiAgICAgICAgICBpZFxuICAgICAgICApO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGludmFyaWFudChcbiAgICAgICAgdGhpcy4kRGlzcGF0Y2hlcl9jYWxsYmFja3NbaWRdLFxuICAgICAgICAnRGlzcGF0Y2hlci53YWl0Rm9yKC4uLik6IGAlc2AgZG9lcyBub3QgbWFwIHRvIGEgcmVnaXN0ZXJlZCBjYWxsYmFjay4nLFxuICAgICAgICBpZFxuICAgICAgKTtcbiAgICAgIHRoaXMuJERpc3BhdGNoZXJfaW52b2tlQ2FsbGJhY2soaWQpO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogRGlzcGF0Y2hlcyBhIHBheWxvYWQgdG8gYWxsIHJlZ2lzdGVyZWQgY2FsbGJhY2tzLlxuICAgKlxuICAgKiBAcGFyYW0ge29iamVjdH0gcGF5bG9hZFxuICAgKi9cbiAgRGlzcGF0Y2hlci5wcm90b3R5cGUuZGlzcGF0Y2g9ZnVuY3Rpb24ocGF5bG9hZCkge1xuICAgIGludmFyaWFudChcbiAgICAgICF0aGlzLiREaXNwYXRjaGVyX2lzRGlzcGF0Y2hpbmcsXG4gICAgICAnRGlzcGF0Y2guZGlzcGF0Y2goLi4uKTogQ2Fubm90IGRpc3BhdGNoIGluIHRoZSBtaWRkbGUgb2YgYSBkaXNwYXRjaC4nXG4gICAgKTtcbiAgICB0aGlzLiREaXNwYXRjaGVyX3N0YXJ0RGlzcGF0Y2hpbmcocGF5bG9hZCk7XG4gICAgdHJ5IHtcbiAgICAgIGZvciAodmFyIGlkIGluIHRoaXMuJERpc3BhdGNoZXJfY2FsbGJhY2tzKSB7XG4gICAgICAgIGlmICh0aGlzLiREaXNwYXRjaGVyX2lzUGVuZGluZ1tpZF0pIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLiREaXNwYXRjaGVyX2ludm9rZUNhbGxiYWNrKGlkKTtcbiAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgdGhpcy4kRGlzcGF0Y2hlcl9zdG9wRGlzcGF0Y2hpbmcoKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIElzIHRoaXMgRGlzcGF0Y2hlciBjdXJyZW50bHkgZGlzcGF0Y2hpbmcuXG4gICAqXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBEaXNwYXRjaGVyLnByb3RvdHlwZS5pc0Rpc3BhdGNoaW5nPWZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLiREaXNwYXRjaGVyX2lzRGlzcGF0Y2hpbmc7XG4gIH07XG5cbiAgLyoqXG4gICAqIENhbGwgdGhlIGNhbGxiYWNrIHN0b3JlZCB3aXRoIHRoZSBnaXZlbiBpZC4gQWxzbyBkbyBzb21lIGludGVybmFsXG4gICAqIGJvb2trZWVwaW5nLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gaWRcbiAgICogQGludGVybmFsXG4gICAqL1xuICBEaXNwYXRjaGVyLnByb3RvdHlwZS4kRGlzcGF0Y2hlcl9pbnZva2VDYWxsYmFjaz1mdW5jdGlvbihpZCkge1xuICAgIHRoaXMuJERpc3BhdGNoZXJfaXNQZW5kaW5nW2lkXSA9IHRydWU7XG4gICAgdGhpcy4kRGlzcGF0Y2hlcl9jYWxsYmFja3NbaWRdKHRoaXMuJERpc3BhdGNoZXJfcGVuZGluZ1BheWxvYWQpO1xuICAgIHRoaXMuJERpc3BhdGNoZXJfaXNIYW5kbGVkW2lkXSA9IHRydWU7XG4gIH07XG5cbiAgLyoqXG4gICAqIFNldCB1cCBib29ra2VlcGluZyBuZWVkZWQgd2hlbiBkaXNwYXRjaGluZy5cbiAgICpcbiAgICogQHBhcmFtIHtvYmplY3R9IHBheWxvYWRcbiAgICogQGludGVybmFsXG4gICAqL1xuICBEaXNwYXRjaGVyLnByb3RvdHlwZS4kRGlzcGF0Y2hlcl9zdGFydERpc3BhdGNoaW5nPWZ1bmN0aW9uKHBheWxvYWQpIHtcbiAgICBmb3IgKHZhciBpZCBpbiB0aGlzLiREaXNwYXRjaGVyX2NhbGxiYWNrcykge1xuICAgICAgdGhpcy4kRGlzcGF0Y2hlcl9pc1BlbmRpbmdbaWRdID0gZmFsc2U7XG4gICAgICB0aGlzLiREaXNwYXRjaGVyX2lzSGFuZGxlZFtpZF0gPSBmYWxzZTtcbiAgICB9XG4gICAgdGhpcy4kRGlzcGF0Y2hlcl9wZW5kaW5nUGF5bG9hZCA9IHBheWxvYWQ7XG4gICAgdGhpcy4kRGlzcGF0Y2hlcl9pc0Rpc3BhdGNoaW5nID0gdHJ1ZTtcbiAgfTtcblxuICAvKipcbiAgICogQ2xlYXIgYm9va2tlZXBpbmcgdXNlZCBmb3IgZGlzcGF0Y2hpbmcuXG4gICAqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgRGlzcGF0Y2hlci5wcm90b3R5cGUuJERpc3BhdGNoZXJfc3RvcERpc3BhdGNoaW5nPWZ1bmN0aW9uKCkge1xuICAgIHRoaXMuJERpc3BhdGNoZXJfcGVuZGluZ1BheWxvYWQgPSBudWxsO1xuICAgIHRoaXMuJERpc3BhdGNoZXJfaXNEaXNwYXRjaGluZyA9IGZhbHNlO1xuICB9O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gRGlzcGF0Y2hlcjtcbiIsIi8qKlxuICogQ29weXJpZ2h0IChjKSAyMDE0LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBCU0Qtc3R5bGUgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS4gQW4gYWRkaXRpb25hbCBncmFudFxuICogb2YgcGF0ZW50IHJpZ2h0cyBjYW4gYmUgZm91bmQgaW4gdGhlIFBBVEVOVFMgZmlsZSBpbiB0aGUgc2FtZSBkaXJlY3RvcnkuXG4gKlxuICogQHByb3ZpZGVzTW9kdWxlIGludmFyaWFudFxuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG4vKipcbiAqIFVzZSBpbnZhcmlhbnQoKSB0byBhc3NlcnQgc3RhdGUgd2hpY2ggeW91ciBwcm9ncmFtIGFzc3VtZXMgdG8gYmUgdHJ1ZS5cbiAqXG4gKiBQcm92aWRlIHNwcmludGYtc3R5bGUgZm9ybWF0IChvbmx5ICVzIGlzIHN1cHBvcnRlZCkgYW5kIGFyZ3VtZW50c1xuICogdG8gcHJvdmlkZSBpbmZvcm1hdGlvbiBhYm91dCB3aGF0IGJyb2tlIGFuZCB3aGF0IHlvdSB3ZXJlXG4gKiBleHBlY3RpbmcuXG4gKlxuICogVGhlIGludmFyaWFudCBtZXNzYWdlIHdpbGwgYmUgc3RyaXBwZWQgaW4gcHJvZHVjdGlvbiwgYnV0IHRoZSBpbnZhcmlhbnRcbiAqIHdpbGwgcmVtYWluIHRvIGVuc3VyZSBsb2dpYyBkb2VzIG5vdCBkaWZmZXIgaW4gcHJvZHVjdGlvbi5cbiAqL1xuXG52YXIgaW52YXJpYW50ID0gZnVuY3Rpb24oY29uZGl0aW9uLCBmb3JtYXQsIGEsIGIsIGMsIGQsIGUsIGYpIHtcbiAgaWYgKGZhbHNlKSB7XG4gICAgaWYgKGZvcm1hdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFyaWFudCByZXF1aXJlcyBhbiBlcnJvciBtZXNzYWdlIGFyZ3VtZW50Jyk7XG4gICAgfVxuICB9XG5cbiAgaWYgKCFjb25kaXRpb24pIHtcbiAgICB2YXIgZXJyb3I7XG4gICAgaWYgKGZvcm1hdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBlcnJvciA9IG5ldyBFcnJvcihcbiAgICAgICAgJ01pbmlmaWVkIGV4Y2VwdGlvbiBvY2N1cnJlZDsgdXNlIHRoZSBub24tbWluaWZpZWQgZGV2IGVudmlyb25tZW50ICcgK1xuICAgICAgICAnZm9yIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2UgYW5kIGFkZGl0aW9uYWwgaGVscGZ1bCB3YXJuaW5ncy4nXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgYXJncyA9IFthLCBiLCBjLCBkLCBlLCBmXTtcbiAgICAgIHZhciBhcmdJbmRleCA9IDA7XG4gICAgICBlcnJvciA9IG5ldyBFcnJvcihcbiAgICAgICAgJ0ludmFyaWFudCBWaW9sYXRpb246ICcgK1xuICAgICAgICBmb3JtYXQucmVwbGFjZSgvJXMvZywgZnVuY3Rpb24oKSB7IHJldHVybiBhcmdzW2FyZ0luZGV4KytdOyB9KVxuICAgICAgKTtcbiAgICB9XG5cbiAgICBlcnJvci5mcmFtZXNUb1BvcCA9IDE7IC8vIHdlIGRvbid0IGNhcmUgYWJvdXQgaW52YXJpYW50J3Mgb3duIGZyYW1lXG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gaW52YXJpYW50O1xuIiwidmFyIHRvcExldmVsID0gdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwgOlxuICAgIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDoge31cbnZhciBtaW5Eb2MgPSByZXF1aXJlKCdtaW4tZG9jdW1lbnQnKTtcblxuaWYgKHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGRvY3VtZW50O1xufSBlbHNlIHtcbiAgICB2YXIgZG9jY3kgPSB0b3BMZXZlbFsnX19HTE9CQUxfRE9DVU1FTlRfQ0FDSEVANCddO1xuXG4gICAgaWYgKCFkb2NjeSkge1xuICAgICAgICBkb2NjeSA9IHRvcExldmVsWydfX0dMT0JBTF9ET0NVTUVOVF9DQUNIRUA0J10gPSBtaW5Eb2M7XG4gICAgfVxuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBkb2NjeTtcbn1cbiIsImlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSB3aW5kb3c7XG59IGVsc2UgaWYgKHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGdsb2JhbDtcbn0gZWxzZSBpZiAodHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIpe1xuICAgIG1vZHVsZS5leHBvcnRzID0gc2VsZjtcbn0gZWxzZSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSB7fTtcbn1cbiIsIlxudmFyIHV0aWwgPSByZXF1aXJlKCd1dGlsJyk7XG5cbnZhciB0b2tlbml6ZSA9IGZ1bmN0aW9uKC8qU3RyaW5nKi8gc3RyLCAvKlJlZ0V4cCovIHJlLCAvKkZ1bmN0aW9uPyovIHBhcnNlRGVsaW0sIC8qT2JqZWN0PyovIGluc3RhbmNlKXtcbiAgLy8gc3VtbWFyeTpcbiAgLy8gICAgU3BsaXQgYSBzdHJpbmcgYnkgYSByZWd1bGFyIGV4cHJlc3Npb24gd2l0aCB0aGUgYWJpbGl0eSB0byBjYXB0dXJlIHRoZSBkZWxpbWV0ZXJzXG4gIC8vIHBhcnNlRGVsaW06XG4gIC8vICAgIEVhY2ggZ3JvdXAgKGV4Y2x1ZGluZyB0aGUgMCBncm91cCkgaXMgcGFzc2VkIGFzIGEgcGFyYW1ldGVyLiBJZiB0aGUgZnVuY3Rpb24gcmV0dXJuc1xuICAvLyAgICBhIHZhbHVlLCBpdCdzIGFkZGVkIHRvIHRoZSBsaXN0IG9mIHRva2Vucy5cbiAgLy8gaW5zdGFuY2U6XG4gIC8vICAgIFVzZWQgYXMgdGhlIFwidGhpcycgaW5zdGFuY2Ugd2hlbiBjYWxsaW5nIHBhcnNlRGVsaW1cbiAgdmFyIHRva2VucyA9IFtdO1xuICB2YXIgbWF0Y2gsIGNvbnRlbnQsIGxhc3RJbmRleCA9IDA7XG4gIHdoaWxlKG1hdGNoID0gcmUuZXhlYyhzdHIpKXtcbiAgICBjb250ZW50ID0gc3RyLnNsaWNlKGxhc3RJbmRleCwgcmUubGFzdEluZGV4IC0gbWF0Y2hbMF0ubGVuZ3RoKTtcbiAgICBpZihjb250ZW50Lmxlbmd0aCl7XG4gICAgICB0b2tlbnMucHVzaChjb250ZW50KTtcbiAgICB9XG4gICAgaWYocGFyc2VEZWxpbSl7XG4gICAgICB2YXIgcGFyc2VkID0gcGFyc2VEZWxpbS5hcHBseShpbnN0YW5jZSwgbWF0Y2guc2xpY2UoMSkuY29uY2F0KHRva2Vucy5sZW5ndGgpKTtcbiAgICAgIGlmKHR5cGVvZiBwYXJzZWQgIT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICBpZihwYXJzZWQuc3BlY2lmaWVyID09PSAnJScpe1xuICAgICAgICAgIHRva2Vucy5wdXNoKCclJyk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHRva2Vucy5wdXNoKHBhcnNlZCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgbGFzdEluZGV4ID0gcmUubGFzdEluZGV4O1xuICB9XG4gIGNvbnRlbnQgPSBzdHIuc2xpY2UobGFzdEluZGV4KTtcbiAgaWYoY29udGVudC5sZW5ndGgpe1xuICAgIHRva2Vucy5wdXNoKGNvbnRlbnQpO1xuICB9XG4gIHJldHVybiB0b2tlbnM7XG59XG5cbnZhciBGb3JtYXR0ZXIgPSBmdW5jdGlvbigvKlN0cmluZyovIGZvcm1hdCl7XG4gIHZhciB0b2tlbnMgPSBbXTtcbiAgdGhpcy5fbWFwcGVkID0gZmFsc2U7XG4gIHRoaXMuX2Zvcm1hdCA9IGZvcm1hdDtcbiAgdGhpcy5fdG9rZW5zID0gdG9rZW5pemUoZm9ybWF0LCB0aGlzLl9yZSwgdGhpcy5fcGFyc2VEZWxpbSwgdGhpcyk7XG59XG5cbkZvcm1hdHRlci5wcm90b3R5cGUuX3JlID0gL1xcJSg/OlxcKChbXFx3X10rKVxcKXwoWzEtOV1cXGQqKVxcJCk/KFswICtcXC1cXCNdKikoXFwqfFxcZCspPyhcXC4pPyhcXCp8XFxkKyk/W2hsTF0/KFtcXCVic2NkZUVmRmdHaW9PdXhYXSkvZztcbkZvcm1hdHRlci5wcm90b3R5cGUuX3BhcnNlRGVsaW0gPSBmdW5jdGlvbihtYXBwaW5nLCBpbnRtYXBwaW5nLCBmbGFncywgbWluV2lkdGgsIHBlcmlvZCwgcHJlY2lzaW9uLCBzcGVjaWZpZXIpe1xuICBpZihtYXBwaW5nKXtcbiAgICB0aGlzLl9tYXBwZWQgPSB0cnVlO1xuICB9XG4gIHJldHVybiB7XG4gICAgbWFwcGluZzogbWFwcGluZyxcbiAgICBpbnRtYXBwaW5nOiBpbnRtYXBwaW5nLFxuICAgIGZsYWdzOiBmbGFncyxcbiAgICBfbWluV2lkdGg6IG1pbldpZHRoLCAvLyBNYXkgYmUgZGVwZW5kZW50IG9uIHBhcmFtZXRlcnNcbiAgICBwZXJpb2Q6IHBlcmlvZCxcbiAgICBfcHJlY2lzaW9uOiBwcmVjaXNpb24sIC8vIE1heSBiZSBkZXBlbmRlbnQgb24gcGFyYW1ldGVyc1xuICAgIHNwZWNpZmllcjogc3BlY2lmaWVyXG4gIH07XG59O1xuRm9ybWF0dGVyLnByb3RvdHlwZS5fc3BlY2lmaWVycyA9IHtcbiAgYjoge1xuICAgIGJhc2U6IDIsXG4gICAgaXNJbnQ6IHRydWVcbiAgfSxcbiAgbzoge1xuICAgIGJhc2U6IDgsXG4gICAgaXNJbnQ6IHRydWVcbiAgfSxcbiAgeDoge1xuICAgIGJhc2U6IDE2LFxuICAgIGlzSW50OiB0cnVlXG4gIH0sXG4gIFg6IHtcbiAgICBleHRlbmQ6IFsneCddLFxuICAgIHRvVXBwZXI6IHRydWVcbiAgfSxcbiAgZDoge1xuICAgIGJhc2U6IDEwLFxuICAgIGlzSW50OiB0cnVlXG4gIH0sXG4gIGk6IHtcbiAgICBleHRlbmQ6IFsnZCddXG4gIH0sXG4gIHU6IHtcbiAgICBleHRlbmQ6IFsnZCddLFxuICAgIGlzVW5zaWduZWQ6IHRydWVcbiAgfSxcbiAgYzoge1xuICAgIHNldEFyZzogZnVuY3Rpb24odG9rZW4pe1xuICAgICAgaWYoIWlzTmFOKHRva2VuLmFyZykpe1xuICAgICAgICB2YXIgbnVtID0gcGFyc2VJbnQodG9rZW4uYXJnKTtcbiAgICAgICAgaWYobnVtIDwgMCB8fCBudW0gPiAxMjcpe1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBjaGFyYWN0ZXIgY29kZSBwYXNzZWQgdG8gJWMgaW4gcHJpbnRmJyk7XG4gICAgICAgIH1cbiAgICAgICAgdG9rZW4uYXJnID0gaXNOYU4obnVtKSA/ICcnICsgbnVtIDogU3RyaW5nLmZyb21DaGFyQ29kZShudW0pO1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgczoge1xuICAgIHNldE1heFdpZHRoOiBmdW5jdGlvbih0b2tlbil7XG4gICAgICB0b2tlbi5tYXhXaWR0aCA9ICh0b2tlbi5wZXJpb2QgPT0gJy4nKSA/IHRva2VuLnByZWNpc2lvbiA6IC0xO1xuICAgIH1cbiAgfSxcbiAgZToge1xuICAgIGlzRG91YmxlOiB0cnVlLFxuICAgIGRvdWJsZU5vdGF0aW9uOiAnZSdcbiAgfSxcbiAgRToge1xuICAgIGV4dGVuZDogWydlJ10sXG4gICAgdG9VcHBlcjogdHJ1ZVxuICB9LFxuICBmOiB7XG4gICAgaXNEb3VibGU6IHRydWUsXG4gICAgZG91YmxlTm90YXRpb246ICdmJ1xuICB9LFxuICBGOiB7XG4gICAgZXh0ZW5kOiBbJ2YnXVxuICB9LFxuICBnOiB7XG4gICAgaXNEb3VibGU6IHRydWUsXG4gICAgZG91YmxlTm90YXRpb246ICdnJ1xuICB9LFxuICBHOiB7XG4gICAgZXh0ZW5kOiBbJ2cnXSxcbiAgICB0b1VwcGVyOiB0cnVlXG4gIH0sXG4gIE86IHtcbiAgICBpc09iamVjdDogdHJ1ZVxuICB9LFxufTtcbkZvcm1hdHRlci5wcm90b3R5cGUuZm9ybWF0ID0gZnVuY3Rpb24oLyptaXhlZC4uLiovIGZpbGxlcil7XG4gIGlmKHRoaXMuX21hcHBlZCAmJiB0eXBlb2YgZmlsbGVyICE9ICdvYmplY3QnKXtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2Zvcm1hdCByZXF1aXJlcyBhIG1hcHBpbmcnKTtcbiAgfVxuXG4gIHZhciBzdHIgPSAnJztcbiAgdmFyIHBvc2l0aW9uID0gMDtcbiAgZm9yKHZhciBpID0gMCwgdG9rZW47IGkgPCB0aGlzLl90b2tlbnMubGVuZ3RoOyBpKyspe1xuICAgIHRva2VuID0gdGhpcy5fdG9rZW5zW2ldO1xuICAgIFxuICAgIGlmKHR5cGVvZiB0b2tlbiA9PSAnc3RyaW5nJyl7XG4gICAgICBzdHIgKz0gdG9rZW47XG4gICAgfWVsc2V7XG4gICAgICBpZih0aGlzLl9tYXBwZWQpe1xuICAgICAgICBpZih0eXBlb2YgZmlsbGVyW3Rva2VuLm1hcHBpbmddID09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ21pc3Npbmcga2V5ICcgKyB0b2tlbi5tYXBwaW5nKTtcbiAgICAgICAgfVxuICAgICAgICB0b2tlbi5hcmcgPSBmaWxsZXJbdG9rZW4ubWFwcGluZ107XG4gICAgICB9ZWxzZXtcbiAgICAgICAgaWYodG9rZW4uaW50bWFwcGluZyl7XG4gICAgICAgICAgcG9zaXRpb24gPSBwYXJzZUludCh0b2tlbi5pbnRtYXBwaW5nKSAtIDE7XG4gICAgICAgIH1cbiAgICAgICAgaWYocG9zaXRpb24gPj0gYXJndW1lbnRzLmxlbmd0aCl7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdnb3QgJyArIGFyZ3VtZW50cy5sZW5ndGggKyAnIHByaW50ZiBhcmd1bWVudHMsIGluc3VmZmljaWVudCBmb3IgXFwnJyArIHRoaXMuX2Zvcm1hdCArICdcXCcnKTtcbiAgICAgICAgfVxuICAgICAgICB0b2tlbi5hcmcgPSBhcmd1bWVudHNbcG9zaXRpb24rK107XG4gICAgICB9XG5cbiAgICAgIGlmKCF0b2tlbi5jb21waWxlZCl7XG4gICAgICAgIHRva2VuLmNvbXBpbGVkID0gdHJ1ZTtcbiAgICAgICAgdG9rZW4uc2lnbiA9ICcnO1xuICAgICAgICB0b2tlbi56ZXJvUGFkID0gZmFsc2U7XG4gICAgICAgIHRva2VuLnJpZ2h0SnVzdGlmeSA9IGZhbHNlO1xuICAgICAgICB0b2tlbi5hbHRlcm5hdGl2ZSA9IGZhbHNlO1xuXG4gICAgICAgIHZhciBmbGFncyA9IHt9O1xuICAgICAgICBmb3IodmFyIGZpID0gdG9rZW4uZmxhZ3MubGVuZ3RoOyBmaS0tOyl7XG4gICAgICAgICAgdmFyIGZsYWcgPSB0b2tlbi5mbGFncy5jaGFyQXQoZmkpO1xuICAgICAgICAgIGZsYWdzW2ZsYWddID0gdHJ1ZTtcbiAgICAgICAgICBzd2l0Y2goZmxhZyl7XG4gICAgICAgICAgICBjYXNlICcgJzpcbiAgICAgICAgICAgICAgdG9rZW4uc2lnbiA9ICcgJztcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICcrJzpcbiAgICAgICAgICAgICAgdG9rZW4uc2lnbiA9ICcrJztcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICcwJzpcbiAgICAgICAgICAgICAgdG9rZW4uemVyb1BhZCA9IChmbGFnc1snLSddKSA/IGZhbHNlIDogdHJ1ZTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICctJzpcbiAgICAgICAgICAgICAgdG9rZW4ucmlnaHRKdXN0aWZ5ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgdG9rZW4uemVyb1BhZCA9IGZhbHNlO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJyMnOlxuICAgICAgICAgICAgICB0b2tlbi5hbHRlcm5hdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgdGhyb3cgRXJyb3IoJ2JhZCBmb3JtYXR0aW5nIGZsYWcgXFwnJyArIHRva2VuLmZsYWdzLmNoYXJBdChmaSkgKyAnXFwnJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdG9rZW4ubWluV2lkdGggPSAodG9rZW4uX21pbldpZHRoKSA/IHBhcnNlSW50KHRva2VuLl9taW5XaWR0aCkgOiAwO1xuICAgICAgICB0b2tlbi5tYXhXaWR0aCA9IC0xO1xuICAgICAgICB0b2tlbi50b1VwcGVyID0gZmFsc2U7XG4gICAgICAgIHRva2VuLmlzVW5zaWduZWQgPSBmYWxzZTtcbiAgICAgICAgdG9rZW4uaXNJbnQgPSBmYWxzZTtcbiAgICAgICAgdG9rZW4uaXNEb3VibGUgPSBmYWxzZTtcbiAgICAgICAgdG9rZW4uaXNPYmplY3QgPSBmYWxzZTtcbiAgICAgICAgdG9rZW4ucHJlY2lzaW9uID0gMTtcbiAgICAgICAgaWYodG9rZW4ucGVyaW9kID09ICcuJyl7XG4gICAgICAgICAgaWYodG9rZW4uX3ByZWNpc2lvbil7XG4gICAgICAgICAgICB0b2tlbi5wcmVjaXNpb24gPSBwYXJzZUludCh0b2tlbi5fcHJlY2lzaW9uKTtcbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHRva2VuLnByZWNpc2lvbiA9IDA7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIG1peGlucyA9IHRoaXMuX3NwZWNpZmllcnNbdG9rZW4uc3BlY2lmaWVyXTtcbiAgICAgICAgaWYodHlwZW9mIG1peGlucyA9PSAndW5kZWZpbmVkJyl7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd1bmV4cGVjdGVkIHNwZWNpZmllciBcXCcnICsgdG9rZW4uc3BlY2lmaWVyICsgJ1xcJycpO1xuICAgICAgICB9XG4gICAgICAgIGlmKG1peGlucy5leHRlbmQpe1xuICAgICAgICAgIHZhciBzID0gdGhpcy5fc3BlY2lmaWVyc1ttaXhpbnMuZXh0ZW5kXTtcbiAgICAgICAgICBmb3IodmFyIGsgaW4gcyl7XG4gICAgICAgICAgICBtaXhpbnNba10gPSBzW2tdXG4gICAgICAgICAgfVxuICAgICAgICAgIGRlbGV0ZSBtaXhpbnMuZXh0ZW5kO1xuICAgICAgICB9XG4gICAgICAgIGZvcih2YXIgbCBpbiBtaXhpbnMpe1xuICAgICAgICAgIHRva2VuW2xdID0gbWl4aW5zW2xdO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmKHR5cGVvZiB0b2tlbi5zZXRBcmcgPT0gJ2Z1bmN0aW9uJyl7XG4gICAgICAgIHRva2VuLnNldEFyZyh0b2tlbik7XG4gICAgICB9XG5cbiAgICAgIGlmKHR5cGVvZiB0b2tlbi5zZXRNYXhXaWR0aCA9PSAnZnVuY3Rpb24nKXtcbiAgICAgICAgdG9rZW4uc2V0TWF4V2lkdGgodG9rZW4pO1xuICAgICAgfVxuXG4gICAgICBpZih0b2tlbi5fbWluV2lkdGggPT0gJyonKXtcbiAgICAgICAgaWYodGhpcy5fbWFwcGVkKXtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJyogd2lkdGggbm90IHN1cHBvcnRlZCBpbiBtYXBwZWQgZm9ybWF0cycpO1xuICAgICAgICB9XG4gICAgICAgIHRva2VuLm1pbldpZHRoID0gcGFyc2VJbnQoYXJndW1lbnRzW3Bvc2l0aW9uKytdKTtcbiAgICAgICAgaWYoaXNOYU4odG9rZW4ubWluV2lkdGgpKXtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3RoZSBhcmd1bWVudCBmb3IgKiB3aWR0aCBhdCBwb3NpdGlvbiAnICsgcG9zaXRpb24gKyAnIGlzIG5vdCBhIG51bWJlciBpbiAnICsgdGhpcy5fZm9ybWF0KTtcbiAgICAgICAgfVxuICAgICAgICAvLyBuZWdhdGl2ZSB3aWR0aCBtZWFucyByaWdodEp1c3RpZnlcbiAgICAgICAgaWYgKHRva2VuLm1pbldpZHRoIDwgMCkge1xuICAgICAgICAgIHRva2VuLnJpZ2h0SnVzdGlmeSA9IHRydWU7XG4gICAgICAgICAgdG9rZW4ubWluV2lkdGggPSAtdG9rZW4ubWluV2lkdGg7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYodG9rZW4uX3ByZWNpc2lvbiA9PSAnKicgJiYgdG9rZW4ucGVyaW9kID09ICcuJyl7XG4gICAgICAgIGlmKHRoaXMuX21hcHBlZCl7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCcqIHByZWNpc2lvbiBub3Qgc3VwcG9ydGVkIGluIG1hcHBlZCBmb3JtYXRzJyk7XG4gICAgICAgIH1cbiAgICAgICAgdG9rZW4ucHJlY2lzaW9uID0gcGFyc2VJbnQoYXJndW1lbnRzW3Bvc2l0aW9uKytdKTtcbiAgICAgICAgaWYoaXNOYU4odG9rZW4ucHJlY2lzaW9uKSl7XG4gICAgICAgICAgdGhyb3cgRXJyb3IoJ3RoZSBhcmd1bWVudCBmb3IgKiBwcmVjaXNpb24gYXQgcG9zaXRpb24gJyArIHBvc2l0aW9uICsgJyBpcyBub3QgYSBudW1iZXIgaW4gJyArIHRoaXMuX2Zvcm1hdCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gbmVnYXRpdmUgcHJlY2lzaW9uIG1lYW5zIHVuc3BlY2lmaWVkXG4gICAgICAgIGlmICh0b2tlbi5wcmVjaXNpb24gPCAwKSB7XG4gICAgICAgICAgdG9rZW4ucHJlY2lzaW9uID0gMTtcbiAgICAgICAgICB0b2tlbi5wZXJpb2QgPSAnJztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYodG9rZW4uaXNJbnQpe1xuICAgICAgICAvLyBhIHNwZWNpZmllZCBwcmVjaXNpb24gbWVhbnMgbm8gemVybyBwYWRkaW5nXG4gICAgICAgIGlmKHRva2VuLnBlcmlvZCA9PSAnLicpe1xuICAgICAgICAgIHRva2VuLnplcm9QYWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmZvcm1hdEludCh0b2tlbik7XG4gICAgICB9ZWxzZSBpZih0b2tlbi5pc0RvdWJsZSl7XG4gICAgICAgIGlmKHRva2VuLnBlcmlvZCAhPSAnLicpe1xuICAgICAgICAgIHRva2VuLnByZWNpc2lvbiA9IDY7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5mb3JtYXREb3VibGUodG9rZW4pOyBcbiAgICAgIH1lbHNlIGlmKHRva2VuLmlzT2JqZWN0KXtcbiAgICAgICAgdGhpcy5mb3JtYXRPYmplY3QodG9rZW4pO1xuICAgICAgfVxuICAgICAgdGhpcy5maXRGaWVsZCh0b2tlbik7XG5cbiAgICAgIHN0ciArPSAnJyArIHRva2VuLmFyZztcbiAgICB9XG4gIH1cblxuICByZXR1cm4gc3RyO1xufTtcbkZvcm1hdHRlci5wcm90b3R5cGUuX3plcm9zMTAgPSAnMDAwMDAwMDAwMCc7XG5Gb3JtYXR0ZXIucHJvdG90eXBlLl9zcGFjZXMxMCA9ICcgICAgICAgICAgJztcbkZvcm1hdHRlci5wcm90b3R5cGUuZm9ybWF0SW50ID0gZnVuY3Rpb24odG9rZW4pIHtcbiAgdmFyIGkgPSBwYXJzZUludCh0b2tlbi5hcmcpO1xuICBpZighaXNGaW5pdGUoaSkpeyAvLyBpc05hTihmKSB8fCBmID09IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSB8fCBmID09IE51bWJlci5ORUdBVElWRV9JTkZJTklUWSlcbiAgICAvLyBhbGxvdyB0aGlzIG9ubHkgaWYgYXJnIGlzIG51bWJlclxuICAgIGlmKHR5cGVvZiB0b2tlbi5hcmcgIT0gJ251bWJlcicpe1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdmb3JtYXQgYXJndW1lbnQgXFwnJyArIHRva2VuLmFyZyArICdcXCcgbm90IGFuIGludGVnZXI7IHBhcnNlSW50IHJldHVybmVkICcgKyBpKTtcbiAgICB9XG4gICAgLy9yZXR1cm4gJycgKyBpO1xuICAgIGkgPSAwO1xuICB9XG5cbiAgLy8gaWYgbm90IGJhc2UgMTAsIG1ha2UgbmVnYXRpdmVzIGJlIHBvc2l0aXZlXG4gIC8vIG90aGVyd2lzZSwgKC0xMCkudG9TdHJpbmcoMTYpIGlzICctYScgaW5zdGVhZCBvZiAnZmZmZmZmZjYnXG4gIGlmKGkgPCAwICYmICh0b2tlbi5pc1Vuc2lnbmVkIHx8IHRva2VuLmJhc2UgIT0gMTApKXtcbiAgICBpID0gMHhmZmZmZmZmZiArIGkgKyAxO1xuICB9IFxuXG4gIGlmKGkgPCAwKXtcbiAgICB0b2tlbi5hcmcgPSAoLSBpKS50b1N0cmluZyh0b2tlbi5iYXNlKTtcbiAgICB0aGlzLnplcm9QYWQodG9rZW4pO1xuICAgIHRva2VuLmFyZyA9ICctJyArIHRva2VuLmFyZztcbiAgfWVsc2V7XG4gICAgdG9rZW4uYXJnID0gaS50b1N0cmluZyh0b2tlbi5iYXNlKTtcbiAgICAvLyBuZWVkIHRvIG1ha2Ugc3VyZSB0aGF0IGFyZ3VtZW50IDAgd2l0aCBwcmVjaXNpb249PTAgaXMgZm9ybWF0dGVkIGFzICcnXG4gICAgaWYoIWkgJiYgIXRva2VuLnByZWNpc2lvbil7XG4gICAgICB0b2tlbi5hcmcgPSAnJztcbiAgICB9ZWxzZXtcbiAgICAgIHRoaXMuemVyb1BhZCh0b2tlbik7XG4gICAgfVxuICAgIGlmKHRva2VuLnNpZ24pe1xuICAgICAgdG9rZW4uYXJnID0gdG9rZW4uc2lnbiArIHRva2VuLmFyZztcbiAgICB9XG4gIH1cbiAgaWYodG9rZW4uYmFzZSA9PSAxNil7XG4gICAgaWYodG9rZW4uYWx0ZXJuYXRpdmUpe1xuICAgICAgdG9rZW4uYXJnID0gJzB4JyArIHRva2VuLmFyZztcbiAgICB9XG4gICAgdG9rZW4uYXJnID0gdG9rZW4udG9VcHBlciA/IHRva2VuLmFyZy50b1VwcGVyQ2FzZSgpIDogdG9rZW4uYXJnLnRvTG93ZXJDYXNlKCk7XG4gIH1cbiAgaWYodG9rZW4uYmFzZSA9PSA4KXtcbiAgICBpZih0b2tlbi5hbHRlcm5hdGl2ZSAmJiB0b2tlbi5hcmcuY2hhckF0KDApICE9ICcwJyl7XG4gICAgICB0b2tlbi5hcmcgPSAnMCcgKyB0b2tlbi5hcmc7XG4gICAgfVxuICB9XG59O1xuRm9ybWF0dGVyLnByb3RvdHlwZS5mb3JtYXREb3VibGUgPSBmdW5jdGlvbih0b2tlbikge1xuICB2YXIgZiA9IHBhcnNlRmxvYXQodG9rZW4uYXJnKTtcbiAgaWYoIWlzRmluaXRlKGYpKXsgLy8gaXNOYU4oZikgfHwgZiA9PSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkgfHwgZiA9PSBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFkpXG4gICAgLy8gYWxsb3cgdGhpcyBvbmx5IGlmIGFyZyBpcyBudW1iZXJcbiAgICBpZih0eXBlb2YgdG9rZW4uYXJnICE9ICdudW1iZXInKXtcbiAgICAgIHRocm93IG5ldyBFcnJvcignZm9ybWF0IGFyZ3VtZW50IFxcJycgKyB0b2tlbi5hcmcgKyAnXFwnIG5vdCBhIGZsb2F0OyBwYXJzZUZsb2F0IHJldHVybmVkICcgKyBmKTtcbiAgICB9XG4gICAgLy8gQzk5IHNheXMgdGhhdCBmb3IgJ2YnOlxuICAgIC8vICAgaW5maW5pdHkgLT4gJ1stXWluZicgb3IgJ1stXWluZmluaXR5JyAoJ1stXUlORicgb3IgJ1stXUlORklOSVRZJyBmb3IgJ0YnKVxuICAgIC8vICAgTmFOIC0+IGEgc3RyaW5nICBzdGFydGluZyB3aXRoICduYW4nICgnTkFOJyBmb3IgJ0YnKVxuICAgIC8vIHRoaXMgaXMgbm90IGNvbW1vbmx5IGltcGxlbWVudGVkIHRob3VnaC5cbiAgICAvL3JldHVybiAnJyArIGY7XG4gICAgZiA9IDA7XG4gIH1cblxuICBzd2l0Y2godG9rZW4uZG91YmxlTm90YXRpb24pIHtcbiAgICBjYXNlICdlJzoge1xuICAgICAgdG9rZW4uYXJnID0gZi50b0V4cG9uZW50aWFsKHRva2VuLnByZWNpc2lvbik7IFxuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGNhc2UgJ2YnOiB7XG4gICAgICB0b2tlbi5hcmcgPSBmLnRvRml4ZWQodG9rZW4ucHJlY2lzaW9uKTsgXG4gICAgICBicmVhaztcbiAgICB9XG4gICAgY2FzZSAnZyc6IHtcbiAgICAgIC8vIEMgc2F5cyB1c2UgJ2UnIG5vdGF0aW9uIGlmIGV4cG9uZW50IGlzIDwgLTQgb3IgaXMgPj0gcHJlY1xuICAgICAgLy8gRUNNQVNjcmlwdCBmb3IgdG9QcmVjaXNpb24gc2F5cyB1c2UgZXhwb25lbnRpYWwgbm90YXRpb24gaWYgZXhwb25lbnQgaXMgPj0gcHJlYyxcbiAgICAgIC8vIHRob3VnaCBzdGVwIDE3IG9mIHRvUHJlY2lzaW9uIGluZGljYXRlcyBhIHRlc3QgZm9yIDwgLTYgdG8gZm9yY2UgZXhwb25lbnRpYWwuXG4gICAgICBpZihNYXRoLmFicyhmKSA8IDAuMDAwMSl7XG4gICAgICAgIC8vcHJpbnQoJ2ZvcmNpbmcgZXhwb25lbnRpYWwgbm90YXRpb24gZm9yIGY9JyArIGYpO1xuICAgICAgICB0b2tlbi5hcmcgPSBmLnRvRXhwb25lbnRpYWwodG9rZW4ucHJlY2lzaW9uID4gMCA/IHRva2VuLnByZWNpc2lvbiAtIDEgOiB0b2tlbi5wcmVjaXNpb24pO1xuICAgICAgfWVsc2V7XG4gICAgICAgIHRva2VuLmFyZyA9IGYudG9QcmVjaXNpb24odG9rZW4ucHJlY2lzaW9uKTsgXG4gICAgICB9XG5cbiAgICAgIC8vIEluIEMsIHVubGlrZSAnZicsICdnRycgcmVtb3ZlcyB0cmFpbGluZyAwcyBmcm9tIGZyYWN0aW9uYWwgcGFydCwgdW5sZXNzIGFsdGVybmF0aXZlIGZvcm1hdCBmbGFnICgnIycpLlxuICAgICAgLy8gQnV0IEVDTUFTY3JpcHQgZm9ybWF0cyB0b1ByZWNpc2lvbiBhcyAwLjAwMTAwMDAwLiBTbyByZW1vdmUgdHJhaWxpbmcgMHMuXG4gICAgICBpZighdG9rZW4uYWx0ZXJuYXRpdmUpeyBcbiAgICAgICAgLy9wcmludCgncmVwbGFjaW5nIHRyYWlsaW5nIDAgaW4gXFwnJyArIHMgKyAnXFwnJyk7XG4gICAgICAgIHRva2VuLmFyZyA9IHRva2VuLmFyZy5yZXBsYWNlKC8oXFwuLipbXjBdKTAqZS8sICckMWUnKTtcbiAgICAgICAgLy8gaWYgZnJhY3Rpb25hbCBwYXJ0IGlzIGVudGlyZWx5IDAsIHJlbW92ZSBpdCBhbmQgZGVjaW1hbCBwb2ludFxuICAgICAgICB0b2tlbi5hcmcgPSB0b2tlbi5hcmcucmVwbGFjZSgvXFwuMCplLywgJ2UnKS5yZXBsYWNlKC9cXC4wJC8sJycpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcigndW5leHBlY3RlZCBkb3VibGUgbm90YXRpb24gXFwnJyArIHRva2VuLmRvdWJsZU5vdGF0aW9uICsgJ1xcJycpO1xuICB9XG5cbiAgLy8gQyBzYXlzIHRoYXQgZXhwb25lbnQgbXVzdCBoYXZlIGF0IGxlYXN0IHR3byBkaWdpdHMuXG4gIC8vIEJ1dCBFQ01BU2NyaXB0IGRvZXMgbm90OyB0b0V4cG9uZW50aWFsIHJlc3VsdHMgaW4gdGhpbmdzIGxpa2UgJzEuMDAwMDAwZS04JyBhbmQgJzEuMDAwMDAwZSs4Jy5cbiAgLy8gTm90ZSB0aGF0IHMucmVwbGFjZSgvZShbXFwrXFwtXSkoXFxkKS8sICdlJDEwJDInKSB3b24ndCB3b3JrIGJlY2F1c2Ugb2YgdGhlICckMTAnIGluc3RlYWQgb2YgJyQxJy5cbiAgLy8gQW5kIHJlcGxhY2UocmUsIGZ1bmMpIGlzbid0IHN1cHBvcnRlZCBvbiBJRTUwIG9yIFNhZmFyaTEuXG4gIHRva2VuLmFyZyA9IHRva2VuLmFyZy5yZXBsYWNlKC9lXFwrKFxcZCkkLywgJ2UrMCQxJykucmVwbGFjZSgvZVxcLShcXGQpJC8sICdlLTAkMScpO1xuXG4gIC8vIGlmIGFsdCwgZW5zdXJlIGEgZGVjaW1hbCBwb2ludFxuICBpZih0b2tlbi5hbHRlcm5hdGl2ZSl7XG4gICAgdG9rZW4uYXJnID0gdG9rZW4uYXJnLnJlcGxhY2UoL14oXFxkKykkLywnJDEuJyk7XG4gICAgdG9rZW4uYXJnID0gdG9rZW4uYXJnLnJlcGxhY2UoL14oXFxkKyllLywnJDEuZScpO1xuICB9XG5cbiAgaWYoZiA+PSAwICYmIHRva2VuLnNpZ24pe1xuICAgIHRva2VuLmFyZyA9IHRva2VuLnNpZ24gKyB0b2tlbi5hcmc7XG4gIH1cblxuICB0b2tlbi5hcmcgPSB0b2tlbi50b1VwcGVyID8gdG9rZW4uYXJnLnRvVXBwZXJDYXNlKCkgOiB0b2tlbi5hcmcudG9Mb3dlckNhc2UoKTtcbn07XG5Gb3JtYXR0ZXIucHJvdG90eXBlLmZvcm1hdE9iamVjdCA9IGZ1bmN0aW9uKHRva2VuKSB7XG4gIC8vIElmIG5vIHByZWNpc2lvbiBpcyBzcGVjaWZpZWQsIHRoZW4gcmVzZXQgaXQgdG8gbnVsbCAoaW5maW5pdGUgZGVwdGgpLlxuICB2YXIgcHJlY2lzaW9uID0gKHRva2VuLnBlcmlvZCA9PT0gJy4nKSA/IHRva2VuLnByZWNpc2lvbiA6IG51bGw7XG4gIHRva2VuLmFyZyA9IHV0aWwuaW5zcGVjdCh0b2tlbi5hcmcsICF0b2tlbi5hbHRlcm5hdGl2ZSwgcHJlY2lzaW9uKTtcbn07XG5Gb3JtYXR0ZXIucHJvdG90eXBlLnplcm9QYWQgPSBmdW5jdGlvbih0b2tlbiwgLypJbnQqLyBsZW5ndGgpIHtcbiAgbGVuZ3RoID0gKGFyZ3VtZW50cy5sZW5ndGggPT0gMikgPyBsZW5ndGggOiB0b2tlbi5wcmVjaXNpb247XG4gIHZhciBuZWdhdGl2ZSA9IGZhbHNlO1xuICBpZih0eXBlb2YgdG9rZW4uYXJnICE9IFwic3RyaW5nXCIpe1xuICAgIHRva2VuLmFyZyA9IFwiXCIgKyB0b2tlbi5hcmc7XG4gIH1cbiAgaWYgKHRva2VuLmFyZy5zdWJzdHIoMCwxKSA9PT0gJy0nKSB7XG4gICAgbmVnYXRpdmUgPSB0cnVlO1xuICAgIHRva2VuLmFyZyA9IHRva2VuLmFyZy5zdWJzdHIoMSk7XG4gIH1cblxuICB2YXIgdGVubGVzcyA9IGxlbmd0aCAtIDEwO1xuICB3aGlsZSh0b2tlbi5hcmcubGVuZ3RoIDwgdGVubGVzcyl7XG4gICAgdG9rZW4uYXJnID0gKHRva2VuLnJpZ2h0SnVzdGlmeSkgPyB0b2tlbi5hcmcgKyB0aGlzLl96ZXJvczEwIDogdGhpcy5femVyb3MxMCArIHRva2VuLmFyZztcbiAgfVxuICB2YXIgcGFkID0gbGVuZ3RoIC0gdG9rZW4uYXJnLmxlbmd0aDtcbiAgdG9rZW4uYXJnID0gKHRva2VuLnJpZ2h0SnVzdGlmeSkgPyB0b2tlbi5hcmcgKyB0aGlzLl96ZXJvczEwLnN1YnN0cmluZygwLCBwYWQpIDogdGhpcy5femVyb3MxMC5zdWJzdHJpbmcoMCwgcGFkKSArIHRva2VuLmFyZztcbiAgaWYgKG5lZ2F0aXZlKSB0b2tlbi5hcmcgPSAnLScgKyB0b2tlbi5hcmc7XG59O1xuRm9ybWF0dGVyLnByb3RvdHlwZS5maXRGaWVsZCA9IGZ1bmN0aW9uKHRva2VuKSB7XG4gIGlmKHRva2VuLm1heFdpZHRoID49IDAgJiYgdG9rZW4uYXJnLmxlbmd0aCA+IHRva2VuLm1heFdpZHRoKXtcbiAgICByZXR1cm4gdG9rZW4uYXJnLnN1YnN0cmluZygwLCB0b2tlbi5tYXhXaWR0aCk7XG4gIH1cbiAgaWYodG9rZW4uemVyb1BhZCl7XG4gICAgdGhpcy56ZXJvUGFkKHRva2VuLCB0b2tlbi5taW5XaWR0aCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIHRoaXMuc3BhY2VQYWQodG9rZW4pO1xufTtcbkZvcm1hdHRlci5wcm90b3R5cGUuc3BhY2VQYWQgPSBmdW5jdGlvbih0b2tlbiwgLypJbnQqLyBsZW5ndGgpIHtcbiAgbGVuZ3RoID0gKGFyZ3VtZW50cy5sZW5ndGggPT0gMikgPyBsZW5ndGggOiB0b2tlbi5taW5XaWR0aDtcbiAgaWYodHlwZW9mIHRva2VuLmFyZyAhPSAnc3RyaW5nJyl7XG4gICAgdG9rZW4uYXJnID0gJycgKyB0b2tlbi5hcmc7XG4gIH1cbiAgdmFyIHRlbmxlc3MgPSBsZW5ndGggLSAxMDtcbiAgd2hpbGUodG9rZW4uYXJnLmxlbmd0aCA8IHRlbmxlc3Mpe1xuICAgIHRva2VuLmFyZyA9ICh0b2tlbi5yaWdodEp1c3RpZnkpID8gdG9rZW4uYXJnICsgdGhpcy5fc3BhY2VzMTAgOiB0aGlzLl9zcGFjZXMxMCArIHRva2VuLmFyZztcbiAgfVxuICB2YXIgcGFkID0gbGVuZ3RoIC0gdG9rZW4uYXJnLmxlbmd0aDtcbiAgdG9rZW4uYXJnID0gKHRva2VuLnJpZ2h0SnVzdGlmeSkgPyB0b2tlbi5hcmcgKyB0aGlzLl9zcGFjZXMxMC5zdWJzdHJpbmcoMCwgcGFkKSA6IHRoaXMuX3NwYWNlczEwLnN1YnN0cmluZygwLCBwYWQpICsgdG9rZW4uYXJnO1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XG4gIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKSxcbiAgICBzdHJlYW0sIGZvcm1hdDtcbiAgaWYoYXJnc1swXSBpbnN0YW5jZW9mIHJlcXVpcmUoJ3N0cmVhbScpLlN0cmVhbSl7XG4gICAgc3RyZWFtID0gYXJncy5zaGlmdCgpO1xuICB9XG4gIGZvcm1hdCA9IGFyZ3Muc2hpZnQoKTtcbiAgdmFyIGZvcm1hdHRlciA9IG5ldyBGb3JtYXR0ZXIoZm9ybWF0KTtcbiAgdmFyIHN0cmluZyA9IGZvcm1hdHRlci5mb3JtYXQuYXBwbHkoZm9ybWF0dGVyLCBhcmdzKTtcbiAgaWYoc3RyZWFtKXtcbiAgICBzdHJlYW0ud3JpdGUoc3RyaW5nKTtcbiAgfWVsc2V7XG4gICAgcmV0dXJuIHN0cmluZztcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMuRm9ybWF0dGVyID0gRm9ybWF0dGVyO1xuXG4iLCIvKipcbiAqIENvcHlyaWdodCAyMDEzLTIwMTUsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIEJTRC1zdHlsZSBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLiBBbiBhZGRpdGlvbmFsIGdyYW50XG4gKiBvZiBwYXRlbnQgcmlnaHRzIGNhbiBiZSBmb3VuZCBpbiB0aGUgUEFURU5UUyBmaWxlIGluIHRoZSBzYW1lIGRpcmVjdG9yeS5cbiAqXG4gKiBAcHJvdmlkZXNNb2R1bGUgaW52YXJpYW50XG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qKlxuICogVXNlIGludmFyaWFudCgpIHRvIGFzc2VydCBzdGF0ZSB3aGljaCB5b3VyIHByb2dyYW0gYXNzdW1lcyB0byBiZSB0cnVlLlxuICpcbiAqIFByb3ZpZGUgc3ByaW50Zi1zdHlsZSBmb3JtYXQgKG9ubHkgJXMgaXMgc3VwcG9ydGVkKSBhbmQgYXJndW1lbnRzXG4gKiB0byBwcm92aWRlIGluZm9ybWF0aW9uIGFib3V0IHdoYXQgYnJva2UgYW5kIHdoYXQgeW91IHdlcmVcbiAqIGV4cGVjdGluZy5cbiAqXG4gKiBUaGUgaW52YXJpYW50IG1lc3NhZ2Ugd2lsbCBiZSBzdHJpcHBlZCBpbiBwcm9kdWN0aW9uLCBidXQgdGhlIGludmFyaWFudFxuICogd2lsbCByZW1haW4gdG8gZW5zdXJlIGxvZ2ljIGRvZXMgbm90IGRpZmZlciBpbiBwcm9kdWN0aW9uLlxuICovXG5cbnZhciBpbnZhcmlhbnQgPSBmdW5jdGlvbihjb25kaXRpb24sIGZvcm1hdCwgYSwgYiwgYywgZCwgZSwgZikge1xuICBpZiAoXCJwcm9kdWN0aW9uXCIgIT09IHByb2Nlc3MuZW52Lk5PREVfRU5WKSB7XG4gICAgaWYgKGZvcm1hdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFyaWFudCByZXF1aXJlcyBhbiBlcnJvciBtZXNzYWdlIGFyZ3VtZW50Jyk7XG4gICAgfVxuICB9XG5cbiAgaWYgKCFjb25kaXRpb24pIHtcbiAgICB2YXIgZXJyb3I7XG4gICAgaWYgKGZvcm1hdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBlcnJvciA9IG5ldyBFcnJvcihcbiAgICAgICAgJ01pbmlmaWVkIGV4Y2VwdGlvbiBvY2N1cnJlZDsgdXNlIHRoZSBub24tbWluaWZpZWQgZGV2IGVudmlyb25tZW50ICcgK1xuICAgICAgICAnZm9yIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2UgYW5kIGFkZGl0aW9uYWwgaGVscGZ1bCB3YXJuaW5ncy4nXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgYXJncyA9IFthLCBiLCBjLCBkLCBlLCBmXTtcbiAgICAgIHZhciBhcmdJbmRleCA9IDA7XG4gICAgICBlcnJvciA9IG5ldyBFcnJvcihcbiAgICAgICAgJ0ludmFyaWFudCBWaW9sYXRpb246ICcgK1xuICAgICAgICBmb3JtYXQucmVwbGFjZSgvJXMvZywgZnVuY3Rpb24oKSB7IHJldHVybiBhcmdzW2FyZ0luZGV4KytdOyB9KVxuICAgICAgKTtcbiAgICB9XG5cbiAgICBlcnJvci5mcmFtZXNUb1BvcCA9IDE7IC8vIHdlIGRvbid0IGNhcmUgYWJvdXQgaW52YXJpYW50J3Mgb3duIGZyYW1lXG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gaW52YXJpYW50O1xuIiwiLyoqXG4gKiBDb3B5cmlnaHQgMjAxMy0yMDE1LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBCU0Qtc3R5bGUgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS4gQW4gYWRkaXRpb25hbCBncmFudFxuICogb2YgcGF0ZW50IHJpZ2h0cyBjYW4gYmUgZm91bmQgaW4gdGhlIFBBVEVOVFMgZmlsZSBpbiB0aGUgc2FtZSBkaXJlY3RvcnkuXG4gKlxuICogQHByb3ZpZGVzTW9kdWxlIGtleU1pcnJvclxuICogQHR5cGVjaGVja3Mgc3RhdGljLW9ubHlcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBpbnZhcmlhbnQgPSByZXF1aXJlKFwiLi9pbnZhcmlhbnRcIik7XG5cbi8qKlxuICogQ29uc3RydWN0cyBhbiBlbnVtZXJhdGlvbiB3aXRoIGtleXMgZXF1YWwgdG8gdGhlaXIgdmFsdWUuXG4gKlxuICogRm9yIGV4YW1wbGU6XG4gKlxuICogICB2YXIgQ09MT1JTID0ga2V5TWlycm9yKHtibHVlOiBudWxsLCByZWQ6IG51bGx9KTtcbiAqICAgdmFyIG15Q29sb3IgPSBDT0xPUlMuYmx1ZTtcbiAqICAgdmFyIGlzQ29sb3JWYWxpZCA9ICEhQ09MT1JTW215Q29sb3JdO1xuICpcbiAqIFRoZSBsYXN0IGxpbmUgY291bGQgbm90IGJlIHBlcmZvcm1lZCBpZiB0aGUgdmFsdWVzIG9mIHRoZSBnZW5lcmF0ZWQgZW51bSB3ZXJlXG4gKiBub3QgZXF1YWwgdG8gdGhlaXIga2V5cy5cbiAqXG4gKiAgIElucHV0OiAge2tleTE6IHZhbDEsIGtleTI6IHZhbDJ9XG4gKiAgIE91dHB1dDoge2tleTE6IGtleTEsIGtleTI6IGtleTJ9XG4gKlxuICogQHBhcmFtIHtvYmplY3R9IG9ialxuICogQHJldHVybiB7b2JqZWN0fVxuICovXG52YXIga2V5TWlycm9yID0gZnVuY3Rpb24ob2JqKSB7XG4gIHZhciByZXQgPSB7fTtcbiAgdmFyIGtleTtcbiAgKFwicHJvZHVjdGlvblwiICE9PSBwcm9jZXNzLmVudi5OT0RFX0VOViA/IGludmFyaWFudChcbiAgICBvYmogaW5zdGFuY2VvZiBPYmplY3QgJiYgIUFycmF5LmlzQXJyYXkob2JqKSxcbiAgICAna2V5TWlycm9yKC4uLik6IEFyZ3VtZW50IG11c3QgYmUgYW4gb2JqZWN0LidcbiAgKSA6IGludmFyaWFudChvYmogaW5zdGFuY2VvZiBPYmplY3QgJiYgIUFycmF5LmlzQXJyYXkob2JqKSkpO1xuICBmb3IgKGtleSBpbiBvYmopIHtcbiAgICBpZiAoIW9iai5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgcmV0W2tleV0gPSBrZXk7XG4gIH1cbiAgcmV0dXJuIHJldDtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ga2V5TWlycm9yO1xuIiwiY29uc3Qga2V5TWlycm9yID0gcmVxdWlyZSgncmVhY3QvbGliL2tleU1pcnJvcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGtleU1pcnJvcih7XG4gICAgTUlTU0lPTl9TVEFSVEVEIDogbnVsbCxcbiAgICBNSVNTSU9OX1NUT1BQRUQgOiBudWxsLFxuICAgIE1JU1NJT05fUkVTRVQgOiBudWxsLFxuICAgIE1JU1NJT05fQ09NUExFVEVEIDogbnVsbCxcbiAgICBBUFBfU1RBVEUgOiBudWxsLFxuXG4gICAgQUREX01FU1NBR0UgOiBudWxsLFxuXG4gICAgLy9BQ1RJT05TXG4gICAgR0VUX0VWRU5UUyA6IG51bGwsXG4gICAgU0VUX0VWRU5UUyA6IG51bGwsXG4gICAgVFJJR0dFUl9FVkVOVCA6IG51bGwsXG4gICAgQURWQU5DRV9DSEFQVEVSIDogbnVsbCxcbiAgICBDT01QTEVURV9NSVNTSU9OIDogbnVsbCxcblxuICAgIC8vIFNDSUVOQ0UgVEVBTSBFVkVOVFNcbiAgICBTQ0lFTkNFX0NIRUNLX1JBRElBVElPTiA6IG51bGwsXG5cbiAgICAvLyBBU1RST05BVVQgVEVBTSBFVkVOVFNcbiAgICBBU1RfQ0hFQ0tfVklUQUxTIDogbnVsbCxcblxuICAgIC8vIENPTU1VTklDQVRJT04gVEVBTSBFVkVOVFNcbiAgICBDT01NX0lORk9STV9BU1RST05BVVQgOiBudWxsXG5cbiAgICAvLyBTRUNVUklUWSBURUFNIEVWRU5UU1xufSk7XG4iXX0=
