(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./app/main.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var document = require("global/document");

// the actual rigging of the application is done in the router!
var router = require("./router-container");

var AppDispatcher = require("./appdispatcher");
var constants = require("./constants");

// run startup actions
require("./bootstrap-actions").run();

router.run(function (Handler, state) {
    AppDispatcher.dispatch({ action: constants.ROUTE_CHANGED_EVENT, state: state });

    // pass the state down into the RouteHandlers, as that will make
    // the router related properties available on each RH. Taken from Upgrade tips for React Router
    React.render(React.createElement(Handler, state), document.body);
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./appdispatcher":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/appdispatcher.js","./bootstrap-actions":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/bootstrap-actions.js","./constants":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/constants.js","./router-container":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/router-container.js","global/document":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/global/document.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/actions.js":[function(require,module,exports){
"use strict";

var _core = require("babel-runtime/core-js")["default"];

var AppDispatcher = require("./appdispatcher");
var _require = require("util");

var format = _require.format;
var constants = require("./constants");
var TimerStore = require("./stores/timer-store");
var uuid = require("./uuid");
var router = require("./router-container");

function addStub(name, stub) {
    var _arguments = arguments;

    actions[name] = function () {
        console.log(format("[UNIMPLEMENTED] %s(%s)", name, _arguments.join(",")));
        stub && stub.apply(undefined, _arguments);
    };
}

var actions = {

    /**
     *
     * @param to {String} absolute or relative path or path-name
     * @param param params if given path-name
     *
     * @example
     * transitionTo('/science/task')
     * transitionTo('team-task',{teamId : 'science'})
     *
     * Or when already in /science
     * transitionTo('task') => /science/task
     */
    transitionTo: function transitionTo(to, param, query) {
        router.transitionTo(to, param, query);
    },

    setMissionTime: function setMissionTime(remainingTime) {
        actions.setTimer(constants.MISSION_TIMER_ID, remainingTime);
    },

    startMission: function startMission() {
        if (!TimerStore.isReadyToStart(constants.MISSION_TIMER_ID)) {
            throw new Error("No mission time has been set");
        }
        AppDispatcher.dispatch({ action: constants.MISSION_STARTED_EVENT });
        actions.startTimer(constants.MISSION_TIMER_ID);
        actions.removeMessage(constants.NOT_READY_MSG);
    },

    stopMission: function stopMission() {
        AppDispatcher.dispatch({ action: constants.MISSION_STOPPED_EVENT });
        actions.stopTimer(constants.MISSION_TIMER_ID);
    },

    endMission: function endMission() {
        actions.stopMission();
        actions.setMissionTime(0);
    },

    startTimer: function startTimer(id) {
        AppDispatcher.dispatch({ action: "START_TIMER", data: { timerId: id } });
    },

    resetTimer: function resetTimer(id) {
        AppDispatcher.dispatch({ action: "RESET_TIMER", data: { timerId: id } });
    },
    stopTimer: function stopTimer(id) {
        AppDispatcher.dispatch({ action: "STOP_TIMER", data: { timerId: id } });
    },

    setTimer: function setTimer(timerId, time) {
        AppDispatcher.dispatch({
            action: constants.SET_TIMER,
            data: {
                remainingTime: time,
                timerId: timerId
            }
        });
    },

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
            msg.level = "success";
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

        return actions.addMessage(_core.Object.assign({ duration: duration }, msg));
    },

    removeMessage: function removeMessage(id) {
        AppDispatcher.dispatch({
            action: constants.REMOVE_MESSAGE,
            data: id
        });
    },

    introWasRead: function introWasRead(teamId) {
        AppDispatcher.dispatch({ action: constants.INTRODUCTION_READ, teamName: teamId });
    },

    takeRadiationSample: function takeRadiationSample() {
        AppDispatcher.dispatch({
            action: constants.SCIENCE_TAKE_RADIATION_SAMPLE
        });
    },

    averageRadiationCalculated: function averageRadiationCalculated(average) {
        AppDispatcher.dispatch({
            action: constants.SCIENCE_AVG_RADIATION_CALCULATED,
            data: { average: average }
        });

        if (average > constants.SCIENCE_AVG_RAD_RED_THRESHOLD) {
            actions.addTransientMessage({
                text: "Veldig høyt radioaktivt nivå detektert. Varsle sikkerhetsteamet umiddelbart!",
                level: "danger",
                id: constants.SCIENCE_RADIATION_WARNING_MSG
            }, 30);
        } else if (average > constants.SCIENCE_AVG_RAD_ORANGE_THRESHOLD) {
            actions.addTransientMessage({
                text: "Høye verdier av radioaktivitet. Følg med på om det går nedover igjen",
                level: "warning",
                id: constants.SCIENCE_RADIATION_WARNING_MSG
            }, 10);
        }
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
            action: constants.SCIENCE_RADIATION_LEVEL_CHANGED,
            data: { min: min, max: max }
        });
    },

    addToTotalRadiationLevel: function addToTotalRadiationLevel(amount) {
        var RadiationStore = require("./stores/radiation-store");

        var total = RadiationStore.getTotalLevel();

        /* Very unsure if this is the right place to call another action */
        if (total + amount > constants.SCIENCE_TOTAL_RADIATION_THRESHOLD) {
            actions.addMessage({
                id: "science_high_radiation_level",
                text: "Faretruende høyt strålingsnivå",
                level: "danger"
            });

            AppDispatcher.dispatch({
                action: constants.SCIENCE_TOTAL_RADIATION_LEVEL_CHANGED,
                data: { total: total, added: amount }
            });
        }
    }

};

// dummy return 400 seconds remaining
addStub("askServerForRemainingTime", function () {
    AppDispatcher.dispatch({
        action: constants.REMAINING_MISSION_TIME_CHANGED,
        data: 400
    });
});

_core.Object.freeze(actions);

window.__actions = actions;
module.exports = actions;

},{"./appdispatcher":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/appdispatcher.js","./constants":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/constants.js","./router-container":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/router-container.js","./stores/radiation-store":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/radiation-store.js","./stores/timer-store":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/timer-store.js","./uuid":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/uuid.js","babel-runtime/core-js":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/core-js.js","util":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/util/util.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/appdispatcher.js":[function(require,module,exports){
/*
 * Dispatcher - a singleton
 *
 * This is essentially the main driver in the Flux architecture
 * @see http://facebook.github.io/flux/docs/overview.html
*/

"use strict";

var _core = require("babel-runtime/core-js")["default"];

var _require = require("flux");

var Dispatcher = _require.Dispatcher;

var AppDispatcher = _core.Object.assign(new Dispatcher(), {});

window.__AppDispatcher = AppDispatcher;
module.exports = AppDispatcher;

// optional methods

},{"babel-runtime/core-js":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/core-js.js","flux":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/flux/index.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/bootstrap-actions.js":[function(require,module,exports){
/* Script to bootstrap the application */

"use strict";

var actions = require("./actions"),
    constants = require("./constants"),
    AppDispatcher = require("./appdispatcher");

AppDispatcher.register(function (payload) {
    console.log("DEBUG AppDispatcher.dispatch", payload);
});

function run() {

    actions.setTimer(constants.SCIENCE_TIMER_1, 30);

    setTimeout(function () {
        actions.addMessage({
            id: "science_something",
            text: "ikke glem tannbørste nå da",
            level: "info"
        });
    }, 100 * 1000);

    // dummy until we have integration with websockets
    setTimeout(function () {
        actions.setMissionTime(60 * 15);
        actions.startMission();
    }, 300);

    // play with radiation
    actions.setRadiationLevel(0, 10);
    setTimeout(function () {
        return actions.setRadiationLevel(40, 60);
    }, 10000);
    setTimeout(function () {
        return actions.setRadiationLevel(20, 30);
    }, 30000);
    setTimeout(function () {
        return actions.setRadiationLevel(190, 250);
    }, 60000);
    setTimeout(function () {
        return actions.setRadiationLevel(40, 50);
    }, 90000);
}

module.exports = { run: run };

},{"./actions":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/actions.js","./appdispatcher":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/appdispatcher.js","./constants":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/constants.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/app.react.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var Router = (typeof window !== "undefined" ? window.ReactRouter : typeof global !== "undefined" ? global.ReactRouter : null);

var RouteHandler = Router.RouteHandler;

var Header = require("./header.react");

var TeamDisplayer = require("./team-displayer.react");
var MessageList = require("./message-list.react");
var MissionTimer = require("./mission-timer.react.js");

var MissionStateStore = require("../stores/mission-state-store");

var constants = require("../constants");
var actions = require("../actions");

var App = React.createClass({
    displayName: "App",

    mixins: [],

    getInitialState: function getInitialState() {
        return { isMissionRunning: MissionStateStore.isMissionRunning() };
    },

    componentWillMount: function componentWillMount() {
        MissionStateStore.addChangeListener(this._handleMissionStateChange);
    },

    componentWillUnmount: function componentWillUnmount() {
        MissionStateStore.removeChangeListener(this._handleMissionStateChange);
    },

    _handleMissionStateChange: function _handleMissionStateChange() {
        this.setState({ isMissionRunning: MissionStateStore.isMissionRunning() });
    },

    render: function render() {
        var countDownBox, mainContent;

        if (MissionStateStore.isMissionRunning()) {
            countDownBox = React.createElement(MissionTimer, null);

            mainContent = React.createElement(
                "div",
                null,
                React.createElement(
                    "div",
                    { id: "team-name", className: "" },
                    React.createElement(
                        "header",
                        { className: "" },
                        React.createElement(TeamDisplayer, { className: "" })
                    )
                ),
                React.createElement(
                    "section",
                    { id: "mission-timer", className: "" },
                    countDownBox
                ),
                React.createElement(RouteHandler, this.props)
            );
        } else {
            var message = {
                id: "not_used",
                text: "Ikke klar. Venter på at oppdraget skal starte.",
                level: "info"
            };
            mainContent = React.createElement(MessageList, { className: "row", messages: [message] });
        }

        return React.createElement(
            "div",
            { className: "container" },
            React.createElement(Header, null),
            mainContent
        );
    }
});

module.exports = App;
/* this is the important part */

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../actions":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/actions.js","../constants":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/constants.js","../stores/mission-state-store":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/mission-state-store.js","./header.react":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/header.react.js","./message-list.react":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/message-list.react.js","./mission-timer.react.js":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/mission-timer.react.js","./team-displayer.react":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/team-displayer.react.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/commander-app.react.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);

var App = React.createClass({
    displayName: "App",

    render: function render() {
        return React.createElement(
            "div",
            null,
            React.createElement(
                "p",
                { id: "missionTime" },
                "Oppdraget har ikke startet"
            ),
            React.createElement(
                "div",
                null,
                "Oppdragstid:",
                React.createElement("input", { type: "text", id: "missionLength", size: "3" }),
                "minutter",
                React.createElement(
                    "button",
                    { id: "changeMissionTime", style: { display: "none" } },
                    "Endre oppdragstid"
                ),
                React.createElement(
                    "button",
                    { id: "startMission" },
                    "Start oppdrag"
                )
            ),
            React.createElement(
                "button",
                { id: "jobFinished", style: { display: "none" } },
                "Oppdrag utført"
            ),
            React.createElement(
                "div",
                null,
                React.createElement(
                    "video",
                    { id: "astronautVideo", width: "270px", height: "180px", autoPlay: "true", loop: "true", controls: "true", muted: "true" },
                    React.createElement("source", { type: "video/webm" })
                )
            ),
            React.createElement(
                "div",
                null,
                React.createElement(
                    "button",
                    { id: "stopButton" },
                    "Stopp"
                ),
                React.createElement(
                    "button",
                    { id: "astronautHappy" },
                    "Glad"
                ),
                React.createElement(
                    "button",
                    { id: "astronautNervous" },
                    "Nervøs"
                )
            ),
            React.createElement(
                "div",
                null,
                React.createElement(
                    "button",
                    { id: "callSecurityTeam", className: "call" },
                    "Ring sikkerhets-teamet"
                ),
                React.createElement("br", null),
                React.createElement(
                    "button",
                    { id: "callCommunicationTeam", className: "call" },
                    "Ring kommunikasjons-teamet"
                ),
                React.createElement(
                    "span",
                    { id: "callerId", className: "incomingCall" },
                    "X ringer"
                ),
                React.createElement(
                    "button",
                    { id: "answerButton", className: "incomingCall" },
                    "Svar"
                ),
                React.createElement(
                    "button",
                    { id: "hangUp" },
                    "Legg på"
                )
            ),
            React.createElement(
                "div",
                null,
                React.createElement("video", { id: "localVideo", className: "rtcVideo", autoPlay: "true", muted: "true" }),
                React.createElement("video", { id: "remoteVideo", className: "rtcVideo", autoPlay: "true" })
            )
        );
    }

});

module.exports = App;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/dialogs.react.js":[function(require,module,exports){
(function (global){
// needed to avoid compilation error
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);

module.exports = {
    science_intro: React.createElement(
        "div",
        null,
        React.createElement(
            "p",
            null,
            "Dere skal overvåke strålingsnivået astronatuen utsettes for. Dere må da passe på at astronauten ikke blir utsatt for strålingsnivåer som er skadelig."
        ),
        React.createElement(
            "p",
            null,
            "Ved hjelp av instrumentene som er tilgjengelig må dere jevnlig ta prøver og regne ut verdiene for gjennomsnittlig og totalt strålingsnivå. Finner dere ut at nivåene er blitt farlig høye ",
            React.createElement(
                "em",
                null,
                "må"
            ),
            " dere si fra til oppdragslederen så vi kan få ut astronauten!"
        ),
        React.createElement(
            "p",
            null,
            "Er oppdraget forstått?"
        )
    )
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/dummy-render.mixin.js":[function(require,module,exports){
"use strict";

module.exports = {
    render: function render() {
        throw new Error("DUMMY_RENDER. This react component is not for presentational purposes");
    }
};

},{}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/header.react.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var Router = (typeof window !== "undefined" ? window.ReactRouter : typeof global !== "undefined" ? global.ReactRouter : null);
var Link = Router.Link;

var Header = React.createClass({
    displayName: "Header",

    render: function render() {
        return React.createElement(
            "div",
            null,
            React.createElement(
                "div",
                { className: "row" },
                React.createElement(
                    "header",
                    { id: "narom-header" },
                    React.createElement(
                        "div",
                        null,
                        React.createElement("img", { className: "narom-logo-img", src: "/images/logo.png" }),
                        "NAROM e-Mission prototype"
                    )
                )
            ),
            React.createElement(
                "div",
                { id: "main-header", className: "row" },
                React.createElement(
                    Link,
                    { to: "/" },
                    React.createElement(
                        "header",
                        null,
                        React.createElement(
                            "h1",
                            { className: "" },
                            "Under en solstorm"
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
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var Router = (typeof window !== "undefined" ? window.ReactRouter : typeof global !== "undefined" ? global.ReactRouter : null);
var Link = Router.Link;

var IndexApp = React.createClass({
    displayName: "IndexApp",

    render: function render() {
        return React.createElement(
            "div",
            null,
            React.createElement(
                "ul",
                null,
                React.createElement(
                    "li",
                    null,
                    React.createElement(
                        Link,
                        { to: "leader" },
                        "Operasjonsleder"
                    )
                ),
                React.createElement(
                    "li",
                    null,
                    React.createElement(
                        Link,
                        { to: "team-root", params: { teamId: "science" } },
                        "Forskningsteamet"
                    )
                )
            )
        );
    }
});

module.exports = IndexApp;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/introduction-screen.react.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var dialogs = require("./dialogs.react");
var actions = require("../actions");

var _require = require("../utils");

var cleanRootPath = _require.cleanRootPath;

var RouteStore = require("../stores/route-store");
var IntroStore = require("../stores/introduction-store");

var IntroductionScreen = React.createClass({
    displayName: "IntroductionScreen",

    mixins: [],

    statics: {
        willTransitionTo: function willTransitionTo(transition) {
            var teamId = cleanRootPath(transition.path);

            if (IntroStore.isIntroductionRead(teamId)) {
                transition.redirect("team-task", { taskId: "sample", teamId: teamId });
            }
        }
    },

    _handleClick: function _handleClick() {
        var teamId = RouteStore.getTeamId();
        actions.introWasRead(teamId);
        actions.transitionTo("team-task", { taskId: "sample", teamId: teamId });
    },

    render: function render() {
        var teamId = RouteStore.getTeamId();
        var introText = dialogs[teamId + "_intro"] || React.createElement(
            "p",
            null,
            "Mangler oppdrag"
        );

        return React.createElement(
            "div",
            { className: "row jumbotron introscreen" },
            React.createElement(
                "h2",
                null,
                "Mål for oppdraget"
            ),
            introText,
            React.createElement(
                "button",
                {
                    className: "btn btn-primary btn-lg",
                    onClick: this._handleClick
                },
                "Jeg forstår"
            )
        );
    }
});

module.exports = IntroductionScreen;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../actions":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/actions.js","../stores/introduction-store":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/introduction-store.js","../stores/route-store":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/route-store.js","../utils":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/utils.js","./dialogs.react":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/dialogs.react.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/message-list.react.js":[function(require,module,exports){
(function (global){
"use strict";

var _extends = require("babel-runtime/helpers/extends")["default"];

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var actions = require("../actions");

var ListMessageWrapper = React.createClass({
    displayName: "ListMessageWrapper",

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
                "button",
                {
                    type: "button",
                    className: "close",
                    onClick: function () {
                        return actions.removeMessage(_this.props.id);
                    }
                },
                React.createElement(
                    "span",
                    null,
                    "×"
                )
            );
        }

        return React.createElement(
            "li",
            { className: "alert alert-dismissible alert-" + this.props.level },
            button,
            this.props.text
        );
    }
});

var MessageList = React.createClass({
    displayName: "MessageList",

    render: function render() {
        var hidden = this.props.messages.length === 0 ? "hide" : "";
        var classes = (this.props.className || "") + " messagebox " + hidden;

        return React.createElement(
            "ul",
            { className: classes },
            this.props.messages.map(function (msg) {
                return React.createElement(ListMessageWrapper, _extends({ key: msg.id }, msg));
            })
        );
    }

});

module.exports = MessageList;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../actions":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/actions.js","babel-runtime/helpers/extends":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/helpers/extends.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/mission-timer.react.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null),
    TimerStore = require("../stores/timer-store"),
    Timer = require("./timer.react"),
    constants = require("../constants"),
    ID = constants.MISSION_TIMER_ID;

var MissionTimer = React.createClass({
    displayName: "MissionTimer",

    getInitialState: function getInitialState() {
        return { remainingTime: TimerStore.getRemainingTime(ID) };
    },

    componentDidMount: function componentDidMount() {
        TimerStore.addChangeListener(this._handleTimeChange);
    },

    componentWillUnmount: function componentWillUnmount() {
        TimerStore.removeChangeListener(this._handleTimeChange);
    },

    _handleTimeChange: function _handleTimeChange() {
        this.setState({
            ready: TimerStore.isReadyToStart(ID),
            remainingTime: TimerStore.getRemainingTime(ID)
        });
    },

    render: function render() {
        return React.createElement(
            "div",
            { className: this.props.className },
            React.createElement(
                "span",
                null,
                "Gjenværende tid: "
            ),
            React.createElement(Timer, { timerId: ID, remainingTime: this.state.remainingTime })
        );
    }
});

module.exports = MissionTimer;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../constants":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/constants.js","../stores/timer-store":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/timer-store.js","./timer.react":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/timer.react.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/not-found.react.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);

var NotFound = React.createClass({
    displayName: "NotFound",

    render: function render() {
        return React.createElement(
            "div",
            { className: "container" },
            React.createElement(
                "div",
                { className: "row jumbotron" },
                React.createElement(
                    "div",
                    null,
                    "Ojsann. Tror du har gått deg vill, jeg"
                )
            )
        );
    }
});

module.exports = NotFound;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/radiation-chart.react.js":[function(require,module,exports){
(function (global){
/**
 * Implementation based on tips in the article by Nicolas Hery
 * http://nicolashery.com/integrating-d3js-visualizations-in-a-react-app
 *
 * Chart code more or less copied from the prototype by Leo Martin Westby
 */
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var AmCharts = (typeof window !== "undefined" ? window.AmCharts : typeof global !== "undefined" ? global.AmCharts : null);
var constants = require("../constants");

var chart, chartUpdater, getNewValue, updateFrequency, maxSeconds;
var radiationSamples = [];

var _require = require("../utils");

var randomInt = _require.randomInt;

function initChart(domElement) {

    chart = new AmCharts.AmSerialChart();

    chart.marginTop = 20;
    chart.marginRight = 0;
    chart.marginLeft = 0;
    chart.autoMarginOffset = 0;
    chart.dataProvider = radiationSamples;
    chart.categoryField = "timestamp";

    //X axis
    var categoryAxis = chart.categoryAxis;
    categoryAxis.dashLength = 1;
    categoryAxis.gridAlpha = 0.15;
    categoryAxis.axisColor = "#DADADA";
    categoryAxis.title = "Seconds";

    //Y axis
    var valueAxis = new AmCharts.ValueAxis();
    valueAxis.axisAlpha = 0.2;
    valueAxis.dashLength = 1;
    valueAxis.title = "μSv/h";
    valueAxis.minimum = constants.SCIENCE_RADIATION_MIN;
    valueAxis.maximum = constants.SCIENCE_RADIATION_MAX;
    chart.addValueAxis(valueAxis);

    //Line
    var graph = new AmCharts.AmGraph();
    graph.valueField = "radiation";
    graph.bullet = "round";
    graph.bulletBorderColor = "#FFFFFF";
    graph.bulletBorderThickness = 2;
    graph.lineThickness = 2;
    graph.lineColor = "#b5030d";
    graph.negativeLineColor = "#228B22";
    graph.negativeBase = 60;
    graph.hideBulletsCount = 50;
    chart.addGraph(graph);

    //Mouseover
    var chartCursor = new AmCharts.ChartCursor();
    chartCursor.cursorPosition = "mouse";
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
    displayName: "RadiationChart",

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
        return React.createElement("div", {
            style: { width: this.props.width + "px", height: this.props.height + "px" },
            className: this.props.className
        });
    }

});

module.exports = RadiationChart;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../constants":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/constants.js","../utils":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/utils.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/radiation-sampler.react.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null),
    TimerStore = require("../stores/timer-store"),
    RadiationTable = require("./radiation-table.react"),
    actions = require("../actions"),
    constants = require("../constants");

var RadiationSampler = React.createClass({
    displayName: "RadiationSampler",

    componentWillMount: function componentWillMount() {
        TimerStore.addChangeListener(this._handleTimerChange);
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
        if (this.props.radiation.samples.length >= 4) {
            actions.stopTimer(constants.SCIENCE_TIMER_1);
            actions.transitionTo("team-task", { teamId: "science", taskId: "average" });
        } else {
            actions.takeRadiationSample();
        }
    },

    render: function render() {
        var disabled, classes;

        classes = "btn btn-primary";

        if (this._isDisabled()) {
            classes += "disabled";
        }

        return React.createElement(
            "section",
            { className: "radiation-sampler " + this.props.className },
            React.createElement("div", { className: "radiation-sampler__padder clearfix visible-xs-block" }),
            React.createElement(
                "audio",
                { ref: "geigerSound", loop: true },
                React.createElement("source", { src: "/sounds/AOS04595_Electric_Geiger_Counter_Fast.wav", type: "audio/wav" })
            ),
            React.createElement(
                "div",
                null,
                React.createElement(
                    "button",
                    {
                        className: classes,
                        onClick: this._handleClick
                    },
                    "Ta strålingsprøve"
                )
            )
        );
    }

});

module.exports = RadiationSampler;
/* Avoid floating into previous block */

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../actions":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/actions.js","../constants":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/constants.js","../stores/timer-store":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/timer-store.js","./radiation-table.react":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/radiation-table.react.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/radiation-table.react.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);

module.exports = React.createClass({
    displayName: "exports",

    statics: {},
    propTypes: {
        samples: React.PropTypes.array.isRequired
    },

    // Private methods

    render: function render() {
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
                    "Mikrosievert per time (μSv/h):"
                ),
                React.createElement(
                    "thead",
                    null,
                    React.createElement(
                        "tr",
                        null,
                        React.createElement(
                            "th",
                            null,
                            "Prøvenummer"
                        ),
                        React.createElement(
                            "th",
                            null,
                            "μSv/h"
                        )
                    )
                ),
                React.createElement(
                    "tbody",
                    null,
                    this.props.samples.map(function (val, i) {
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
                    })
                )
            )
        );
    }

});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/science-task.react.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var TimerPanel = require("./timer-panel.react");
var RadiationChart = require("./radiation-chart.react.js");
var RadiationSampleButton = require("./radiation-sampler.react");
var RadiationTable = require("./radiation-table.react");
var RadiationStore = require("../stores/radiation-store");
var constants = require("../constants");
var actions = require("../actions");

var ScienceTask = React.createClass({
    displayName: "ScienceTask",

    statics: {},
    propTypes: {},
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
        e.preventDefault();

        var el = React.findDOMNode(this.refs["average-input"]);
        var average = parseInt(el.value.trim(), 10);

        if (isNaN(average)) {
            actions.addTransientMessage({
                text: "Fikk et ugyldig tall. Skriv inn et gyldig tall.",
                level: "danger"
            });
        } else if (average) {
            actions.averageRadiationCalculated(average);
            actions.transitionTo("team-task", { teamId: "science", taskId: "addtotal" });
        }
    },

    render: function render() {
        return React.createElement(
            "div",
            null,
            React.createElement(
                "div",
                { className: "row" },
                React.createElement(RadiationChart, {
                    className: "col-xs-12 col-sm-6",
                    getNewValue: RadiationStore.getLevel,
                    updateFrequencySeconds: 1,
                    maxSecondsShown: 30,
                    height: 240
                }),
                React.createElement(
                    "dl",
                    { className: "radiation-values col-xs-6 col-sm-3" },
                    React.createElement(
                        "dt",
                        null,
                        "Totalt strålingsnivå"
                    ),
                    React.createElement(
                        "dd",
                        null,
                        this.state.radiation.total
                    ),
                    React.createElement(
                        "dt",
                        null,
                        "Sist innlest strålingsnivå"
                    ),
                    React.createElement(
                        "dd",
                        null,
                        " 65"
                    )
                ),
                React.createElement(RadiationTable, { samples: this.state.radiation.samples, className: "col-xs-6 col-sm-3 " })
            ),
            React.createElement("hr", null),
            React.createElement(
                "div",
                { className: "row" },
                React.createElement(
                    "div",
                    null,
                    React.createElement(TimerPanel, { className: "col-xs-12 col-sm-8", timerId: constants.SCIENCE_TIMER_1 }),
                    React.createElement(RadiationSampleButton, { className: "col-xs-5 col-sm-4", radiation: this.state.radiation }),
                    React.createElement("hr", null),
                    React.createElement(
                        "section",
                        { className: "average-radiation-input col-xs-12 col-sm-6" },
                        React.createElement(
                            "div",
                            { className: "row" },
                            React.createElement(
                                "h3",
                                { className: "col-xs-12" },
                                "Gjennomsnittlig stråling"
                            ),
                            React.createElement(
                                "form",
                                { className: "col-xs-8", onSubmit: this._handleAverageRadiationSubmit },
                                React.createElement("input", { ref: "average-input",
                                    type: "text",
                                    placeholder: "Gjennomsnittsverdi"
                                }),
                                React.createElement(
                                    "button",
                                    { className: "btn btn-primary" },
                                    "Evaluer"
                                )
                            )
                        )
                    )
                )
            )
        );
    }

});

module.exports = ScienceTask;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../actions":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/actions.js","../constants":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/constants.js","../stores/radiation-store":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/radiation-store.js","./radiation-chart.react.js":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/radiation-chart.react.js","./radiation-sampler.react":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/radiation-sampler.react.js","./radiation-table.react":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/radiation-table.react.js","./timer-panel.react":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/timer-panel.react.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/task.react.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null),
    Router = (typeof window !== "undefined" ? window.ReactRouter : typeof global !== "undefined" ? global.ReactRouter : null),
    MessageStore = require("../stores/message-store"),
    TaskStore = require("../stores/task-store"),
    RouteStore = require("../stores/route-store"),
    MessageList = require("./message-list.react"),
    IntroductionScreen = require("./introduction-screen.react.js"),
    ScienceTask = require("./science-task.react"),
    actions = require("../actions"),
    constants = require("../constants");

var Task = React.createClass({
    displayName: "Task",

    mixins: [],

    componentDidMount: function componentDidMount() {},

    componentWillMount: function componentWillMount() {
        MessageStore.addChangeListener(this._onChange);
        RouteStore.addChangeListener(this._onChange);
        //console.log('componentWillMount');
    },

    componentWillUnmount: function componentWillUnmount() {
        //console.log('componentWillUnmount');
        MessageStore.removeChangeListener(this._onChange);
        RouteStore.removeChangeListener(this._onChange);
    },

    componentDidUnmount: function componentDidUnmount() {},

    componentDidUpdate: function componentDidUpdate() {},

    getInitialState: function getInitialState() {
        var _this = this;

        /*
         * Yes, changing our own state like this is probably not the right way to do it,
         * but I could not think of a good, proper "FLUX" way that would work right now
         */
        setTimeout(function () {
            return _this.setState({ taskIsNew: false });
        }, 2000);

        return {
            messages: MessageStore.getMessages(),
            taskStore: TaskStore.getState(),
            routeStore: RouteStore.getRouteState(),
            taskIsNew: true
        };
    },

    _onChange: function _onChange() {
        var _this = this;

        this.setState({
            messages: MessageStore.getMessages(),
            routeStore: RouteStore.getRouteState(),
            taskStore: TaskStore.getState(),
            taskIsNew: true
        });

        setTimeout(function () {
            return _this.setState({ taskIsNew: false });
        }, 2000);
    },

    _createSubTaskUI: function _createSubTaskUI() {
        return React.createElement(ScienceTask, { appstate: this.state });
    },

    render: function render() {
        var content = this._createSubTaskUI(),
            blink = this.state.taskIsNew ? "blink" : "";

        return React.createElement(
            "div",
            { className: "" },
            React.createElement(
                "div",
                { className: "row" },
                React.createElement(MessageList, { className: "col-xs-12", messages: this.state.messages })
            ),
            React.createElement(
                "div",
                { className: "row" },
                React.createElement(
                    "div",
                    { className: "col-xs-12" },
                    React.createElement(
                        "div",
                        { className: "jumbotron taskbox" },
                        React.createElement(
                            "h2",
                            { className: "taskbox__header" },
                            "Oppgave"
                        ),
                        React.createElement(
                            "span",
                            { className: "taskbox__text " + blink },
                            " ",
                            this.state.taskStore.currentTask,
                            " "
                        )
                    )
                )
            ),
            content
        );
    }

});

module.exports = Task;

//console.log('componentDidMount');

//console.log('componentDidUnmount');

//console.log('.componentDidUpdate');
//console.log(React.findDOMNode(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../actions":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/actions.js","../constants":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/constants.js","../stores/message-store":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/message-store.js","../stores/route-store":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/route-store.js","../stores/task-store":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/task-store.js","./introduction-screen.react.js":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/introduction-screen.react.js","./message-list.react":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/message-list.react.js","./science-task.react":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/science-task.react.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/team-displayer.react.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var RouteStore = require("../stores/route-store");
var teamNames = require("../team-name-map");

var TeamWidget = React.createClass({
    displayName: "TeamWidget",

    contextTypes: {
        router: React.PropTypes.func
    },

    mixins: [],

    _onChange: function _onChange() {
        this.forceUpdate();
    },

    componentDidMount: function componentDidMount() {
        RouteStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function componentWillUnmount() {
        RouteStore.removeChangeListener(this._onChange);
    },

    teamName: function teamName() {
        return teamNames.nameMap[RouteStore.getTeamId()];
    },

    otherTeamNames: function otherTeamNames() {
        return teamNames.otherTeamNames(RouteStore.getTeamId());
    },

    render: function render() {

        if (this.teamName()) {

            return React.createElement(
                "div",
                { className: this.props.className + " teamwidget" },
                React.createElement(
                    "span",
                    { className: "active" },
                    this.teamName()
                ),
                React.createElement(
                    "span",
                    { className: "" },
                    ", ",
                    this.otherTeamNames(),
                    " "
                )
            );
        } else {
            return React.createElement(
                "div",
                { className: this.props.className },
                React.createElement(
                    "h2",
                    null,
                    "Velg lag"
                )
            );
        }
    }
});

module.exports = TeamWidget;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../stores/route-store":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/route-store.js","../team-name-map":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/team-name-map.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/timer-panel.react.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null),
    actions = require("../actions"),
    Timer = require("./timer.react.js"),
    TimerStore = require("../stores/timer-store");

module.exports = React.createClass({
    displayName: "exports",

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
        return nextState.remainingTime !== this.state.remainingTime;
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
            remainingTime: TimerStore.getRemainingTime(this.props.timerId)
        };
    },

    render: function render() {
        return React.createElement(
            "section",
            { className: "timer " + this.props.className },
            React.createElement(
                "div",
                { className: "row" },
                React.createElement(
                    "div",
                    { className: "timer--button col-xs-5 " },
                    React.createElement(
                        "button",
                        {
                            className: "btn btn-primary" + (this.state.ready ? "" : "disabled"),
                            onClick: this._handleClick },
                        "Start klokka"
                    )
                ),
                React.createElement(
                    "div",
                    { className: "timer--value col-xs-6 padding-xs-1" },
                    React.createElement(Timer, { remainingTime: this.state.remainingTime })
                )
            )
        );
    }
});

//console.log('TimerPanel.componentDidUpdate');

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../actions":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/actions.js","../stores/timer-store":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/timer-store.js","./timer.react.js":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/timer.react.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/timer.react.js":[function(require,module,exports){
(function (global){
// This example can be modified to act as a countdown timer

"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null),
    printf = require("printf");

function pad(num) {
    return printf("%02d", num);
}

var Timer = React.createClass({
    displayName: "Timer",

    propTypes: {
        remainingTime: React.PropTypes.number.isRequired
    },

    componentDidUpdate: function componentDidUpdate() {},

    shouldComponentUpdate: function shouldComponentUpdate(nextProps, nextState) {
        return nextProps.remainingTime !== this.props.remainingTime;
    },

    _minutes: function _minutes() {
        return pad(Math.max(0, this.props.remainingTime) / 60 >> 0);
    },

    _seconds: function _seconds() {
        return pad(Math.max(0, this.props.remainingTime) % 60);
    },

    _timeValue: function _timeValue() {
        return this._minutes() + ":" + this._seconds();
    },

    render: function render() {
        return React.createElement(
            "div",
            { className: "mission-timer-value" },
            " ",
            this._timeValue()
        );
    }
});

module.exports = Timer;

//console.log('Timer.componentDidUpdate');

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"printf":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/printf/lib/printf.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/constants.js":[function(require,module,exports){
"use strict";

var _core = require("babel-runtime/core-js")["default"];

var constants = {
    // events
    ROUTE_CHANGED_EVENT: "ROUTE_CHANGED_EVENT",
    CHANGE_EVENT: "CHANGE_EVENT",
    MISSION_STARTED_EVENT: "MISSION_STARTED_EVENT",
    MISSION_STOPPED_EVENT: "MISSION_STOPPED_EVENT",
    REMAINING_MISSION_TIME_CHANGED: "REMAINING_MISSION_TIME_CHANGED",
    MISSION_TIMEOUT: "MISSION_TIMEOUT",
    MESSAGE_ADDED: "MESSAGE_ADDED",
    REMOVE_MESSAGE: "REMOVE_MESSAGE",
    ROUTER_AVAILABLE: "ROUTER_AVAILABLE",
    INTRODUCTION_READ: "INTRODUCTION_READ",

    SCIENCE_COUNTDOWN_TIMER_CHANGED: "SCIENCE_COUNTDOWN_TIMER_CHANGED",
    SCIENCE_TAKE_RADIATION_SAMPLE: "SCIENCE_TAKE_RADIATION_SAMPLE",
    SCIENCE_RADIATION_LEVEL_CHANGED: "SCIENCE_RADIATION_LEVEL_CHANGED",
    SCIENCE_TOTAL_RADIATION_LEVEL_CHANGED: "SCIENCE_TOTAL_RADIATION_LEVEL_CHANGED",
    SCIENCE_AVG_RADIATION_CALCULATED: "SCIENCE_AVG_RADIATION_CALCULATED",

    SET_TIMER: "SET_TIMER",
    START_TIMER: "START_TIMER",
    STOP_TIMER: "STOP_TIMER",
    RESET_TIMER: "RESET_TIMER",
    // message ids
    NOT_READY_MSG: "NOT_READY_MSG",
    SCIENCE_RADIATION_WARNING_MSG: "SCIENCE_RADIATION_WARNING_MSG",
    // other
    MISSION_TIMER_ID: "MISSION_TIMER",
    SCIENCE_TIMER_1: "SCIENCE_TIMER_1",

    // values
    SCIENCE_RADIATION_MIN: 0,
    SCIENCE_RADIATION_MAX: 300,
    SCIENCE_AVG_RAD_GREEN_VALUE: 0,
    SCIENCE_AVG_RAD_ORANGE_VALUE: 15,
    SCIENCE_AVG_RAD_RED_VALUE: 50,
    SCIENCE_AVG_RAD_ORANGE_THRESHOLD: 70,
    SCIENCE_AVG_RAD_RED_THRESHOLD: 170,
    SCIENCE_TOTAL_RADIATION_SERIOUS_THRESHOLD: 50,
    SCIENCE_TOTAL_RADIATION_VERY_SERIOUS_THRESHOLD: 75
};

// prevent new properties from being added or removed
_core.Object.freeze(constants);

window.__constants = constants;
module.exports = constants;

},{"babel-runtime/core-js":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/core-js.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/router-container.js":[function(require,module,exports){
(function (global){
// proxy access to the router as first step in bringing it into the flux flow
// @see https://github.com/rackt/react-router/blob/master/docs/guides/flux.md

"use strict";

var router;

module.exports = {
    transitionTo: function transitionTo(to, params, query) {
        return router.transitionTo(to, params, query);
    },

    getCurrentPathname: function getCurrentPathname() {
        return router.getCurrentPathname();
    },

    run: function run() {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return router.run.apply(router, args);
    }
};

var Router = (typeof window !== "undefined" ? window.ReactRouter : typeof global !== "undefined" ? global.ReactRouter : null);
var routes = require("./routes.react");

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
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var Router = (typeof window !== "undefined" ? window.ReactRouter : typeof global !== "undefined" ? global.ReactRouter : null);
var Route = Router.Route;
var NotFoundRoute = Router.NotFoundRoute;
var DefaultRoute = Router.DefaultRoute;

var App = require("./components/app.react");
var MissionCommanderApp = require("./components/commander-app.react");
var IndexApp = require("./components/index-app.react");
var NotFound = require("./components/not-found.react");
var IntroScreen = require("./components/introduction-screen.react");
var Task = require("./components/task.react");
var DummyRenderMixin = require("./components/dummy-render.mixin");

var RedirectToIntro = React.createClass({
    displayName: "RedirectToIntro",

    statics: {
        willTransitionTo: function willTransitionTo(transition) {
            transition.redirect(transition.path + "/intro");
        }
    },

    mixins: [DummyRenderMixin]
});

var routes = React.createElement(
    Route,
    { name: "app", path: "/", handler: App },
    React.createElement(Route, { name: "leader", handler: MissionCommanderApp }),
    React.createElement(Route, { name: "team-root", path: "/:teamId", handler: RedirectToIntro }),
    React.createElement(Route, { name: "team-intro", path: "/:teamId/intro", handler: IntroScreen }),
    React.createElement(Route, { name: "team-task", path: "/:teamId/task/:taskId", handler: Task }),
    React.createElement(NotFoundRoute, { handler: NotFound }),
    React.createElement(DefaultRoute, { handler: IndexApp })
);

module.exports = routes;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./components/app.react":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/app.react.js","./components/commander-app.react":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/commander-app.react.js","./components/dummy-render.mixin":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/dummy-render.mixin.js","./components/index-app.react":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/index-app.react.js","./components/introduction-screen.react":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/introduction-screen.react.js","./components/not-found.react":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/not-found.react.js","./components/task.react":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/components/task.react.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/base-store.js":[function(require,module,exports){
"use strict";

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _inherits = require("babel-runtime/helpers/inherits")["default"];

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var EventEmitter = require("events");

var _require = require("../constants");

var CHANGE_EVENT = _require.CHANGE_EVENT;

var path = null;

var BaseStore = (function (_EventEmitter) {
    function BaseStore() {
        _classCallCheck(this, BaseStore);

        if (_EventEmitter != null) {
            _EventEmitter.apply(this, arguments);
        }
    }

    _inherits(BaseStore, _EventEmitter);

    _createClass(BaseStore, {
        emitChange: {
            value: function emitChange() {
                this.emit(CHANGE_EVENT);
            }
        },
        addChangeListener: {

            /**
             * @param {function} callback
             * @returns emitter, so calls can be chained.
             */

            value: function addChangeListener(callback) {
                return this.on(CHANGE_EVENT, callback);
            }
        },
        removeChangeListener: {

            /**
             * @param {function} callback
             * @returns emitter, so calls can be chained.
             */

            value: function removeChangeListener(callback) {
                return this.removeListener(CHANGE_EVENT, callback);
            }
        }
    });

    return BaseStore;
})(EventEmitter);

module.exports = BaseStore;

},{"../constants":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/constants.js","babel-runtime/helpers/class-call-check":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/helpers/class-call-check.js","babel-runtime/helpers/create-class":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/helpers/create-class.js","babel-runtime/helpers/inherits":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/helpers/inherits.js","events":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/events/events.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/introduction-store.js":[function(require,module,exports){
/* Holds the state of whether introductions have been read */

"use strict";

var _core = require("babel-runtime/core-js")["default"];

var AppDispatcher = require("../appdispatcher");
var BaseStore = require("./base-store");
var constants = require("../constants");
var window = require("global/window");

var IntroductionStore = _core.Object.assign(new BaseStore(), {

    setIntroductionRead: function setIntroductionRead(team) {
        // sticky - even after reload
        window.sessionStorage.setItem("intro_" + team, true);

        this.emitChange();
    },

    isIntroductionRead: function isIntroductionRead(team) {
        // sessionStorage can only store strings
        return window.sessionStorage.getItem("intro_" + team) === "true";
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

},{"../appdispatcher":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/appdispatcher.js","../constants":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/constants.js","./base-store":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/base-store.js","babel-runtime/core-js":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/core-js.js","global/window":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/global/window.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/message-store.js":[function(require,module,exports){
/* A store that can be queried for the current path */

"use strict";

var _core = require("babel-runtime/core-js")["default"];

var _require = require("events");

var Emitter = _require.Emitter;

var AppDispatcher = require("../appdispatcher");
var BaseStore = require("./base-store");

var _require2 = require("../constants");

var REMOVE_MESSAGE = _require2.REMOVE_MESSAGE;
var MESSAGE_ADDED = _require2.MESSAGE_ADDED;

var messages = {};

var MessageStore = _core.Object.assign(new BaseStore(), {

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
            return _core.Object.keys(messages).map(function (msgKey) {
                return messages[msgKey];
            });
        } else throw new Error("UNIMPLEMENTED \"filter\" feature");
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

},{"../appdispatcher":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/appdispatcher.js","../constants":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/constants.js","./base-store":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/base-store.js","babel-runtime/core-js":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/core-js.js","events":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/events/events.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/mission-state-store.js":[function(require,module,exports){
/* A store that can be queried for the current path */

"use strict";

var _core = require("babel-runtime/core-js")["default"];

var _require = require("events");

var Emitter = _require.Emitter;

var AppDispatcher = require("../appdispatcher");
var BaseStore = require("./base-store");

var _require2 = require("../constants");

var MISSION_STARTED_EVENT = _require2.MISSION_STARTED_EVENT;
var MISSION_STOPPED_EVENT = _require2.MISSION_STOPPED_EVENT;
var NOT_READY_MSG = _require2.NOT_READY_MSG;

var missionRunning = false,
    missionHasBeenStopped = false;

var MissionStateStore = _core.Object.assign(new BaseStore(), {

    handleMissionStarted: function handleMissionStarted() {
        missionRunning = true;
        missionHasBeenStopped = false;

        this.emitChange();
    },

    handleMissionStopped: function handleMissionStopped() {
        console.log("mission stopped");
        missionRunning = false;
        missionHasBeenStopped = true;

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
        }

        return true; // No errors. Needed by promise in Dispatcher.
    })

});

window.__MissionStateStore = MissionStateStore;
module.exports = MissionStateStore;

},{"../appdispatcher":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/appdispatcher.js","../constants":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/constants.js","./base-store":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/base-store.js","babel-runtime/core-js":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/core-js.js","events":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/events/events.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/radiation-store.js":[function(require,module,exports){
/* A singleton store that can be queried for remaining time */

"use strict";

var _core = require("babel-runtime/core-js")["default"];

var AppDispatcher = require("../appdispatcher");
var BaseStore = require("./base-store");
var constants = require("../constants");
var randomInt = require("../utils").randomInt;
var radiationRange = {
    min: 20,
    max: 40
};
var samples = [];
var totalRadiation = 0;

var RadiationStore = _core.Object.assign(new BaseStore(), {

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
        if (samples.length < 5) {
            samples.push(this.getLevel());
            this.emitChange();
        }
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
            currentLevel: this.getLevel()
        };
    },

    dispatcherIndex: AppDispatcher.register(function (payload) {
        var action = payload.action;
        var data = payload.data;

        switch (action) {
            case constants.SCIENCE_RADIATION_LEVEL_CHANGED:
                RadiationStore._setRadiationLevel(data.min, data.max);
                break;
            case constants.SCIENCE_TAKE_RADIATION_SAMPLE:
                RadiationStore._takeSample();
                break;
        }

        return true; // No errors. Needed by promise in Dispatcher.
    })

});

window.__RadiationStore = RadiationStore;
module.exports = RadiationStore;

},{"../appdispatcher":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/appdispatcher.js","../constants":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/constants.js","../utils":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/utils.js","./base-store":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/base-store.js","babel-runtime/core-js":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/core-js.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/route-store.js":[function(require,module,exports){
/* A store that can be queried for the current path */

"use strict";

var _core = require("babel-runtime/core-js")["default"];

var AppDispatcher = require("../appdispatcher");
var BaseStore = require("./base-store");

var _require = require("../constants");

var ROUTE_CHANGED_EVENT = _require.ROUTE_CHANGED_EVENT;

var _require2 = require("../utils");

var cleanRootPath = _require2.cleanRootPath;

var routeState = { pathname: "<unset>" };

var RouteStore = _core.Object.assign(new BaseStore(), {

    handleRouteChanged: function handleRouteChanged(state) {
        routeState = state;
        this.emitChange();
    },

    getPathname: function getPathname() {
        var pathname = routeState.pathname;
        return pathname ? pathname.slice(1) : "";
    },

    getTeamId: function getTeamId() {
        return routeState.params.teamId;
    },

    getTaskId: function getTaskId() {
        return routeState.params.taskId;
    },

    getRouteState: function getRouteState() {
        return routeState;
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

},{"../appdispatcher":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/appdispatcher.js","../constants":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/constants.js","../utils":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/utils.js","./base-store":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/base-store.js","babel-runtime/core-js":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/core-js.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/task-store.js":[function(require,module,exports){
/* A store that can be queried for the current path */

"use strict";

var _core = require("babel-runtime/core-js")["default"];

var AppDispatcher = require("../appdispatcher");
var BaseStore = require("./base-store");
var RouteStore = require("./route-store");
var constants = require("../constants");

var assignments = {
    science: {
        sample: "Start klokka og ta fire målinger fordelt jevnt utover tidsintervallet",
        average: "Regn ut gjennomsnittsverdien av strålingsverdiene dere fant. Skriv den inn i tekstfeltet."
    }
};

//var currentTask = {
//    science: 'sample'
//};

var TaskStore = _core.Object.assign(new BaseStore(), {

    getCurrentTask: function getCurrentTask() {
        var teamId = RouteStore.getTeamId();
        var taskId = RouteStore.getTaskId();
        var assignmentsForTeam = assignments[teamId];

        return assignmentsForTeam && assignmentsForTeam[taskId] || "Ingen oppgave funnet";
    },

    getCurrentTaskId: function getCurrentTaskId() {
        //var teamId = RouteStore.getTeamId();
        return RouteStore.getTaskId();
        //return currentTask[teamId];
    },

    getState: function getState() {
        return {
            currentTaskId: this.getCurrentTaskId(),
            currentTask: this.getCurrentTask()
        };
    },

    dispatcherIndex: AppDispatcher.register(function (payload) {

        return true; // No errors. Needed by promise in Dispatcher.
    })

});

window.__TaskStore = TaskStore;
module.exports = TaskStore;

},{"../appdispatcher":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/appdispatcher.js","../constants":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/constants.js","./base-store":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/base-store.js","./route-store":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/route-store.js","babel-runtime/core-js":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/core-js.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/timer-store.js":[function(require,module,exports){
/* A singleton store that can be queried for remaining time */

"use strict";

var _core = require("babel-runtime/core-js")["default"];

var check = require("check-types");
var AppDispatcher = require("../appdispatcher");
var BaseStore = require("./base-store");
var constants = require("../constants");

// keeping state hidden in the module
var remainingTime = {},
    initialTime = {},
    intervalId = {};

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

/**
 * @param data.remainingTime {Number}
 * @param data.timerId {string}
 */
function handleRemainingTimeChanged(data) {
    var remaining = data.remainingTime;
    if (remaining <= 0) throw new TypeError("Got invalid remaining time :" + remaining);

    remainingTime[data.timerId] = remaining;
    initialTime[data.timerId] = remaining;
    TimerStore.emitChange();
}

function assertExists(timerId) {
    check.assert(timerId in remainingTime, "No time set for timer with id " + timerId);
}

var TimerStore = _core.Object.assign(new BaseStore(), {

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

    dispatcherIndex: AppDispatcher.register(function (payload) {
        var action = payload.action;
        var data = payload.data;

        switch (action) {

            case constants.SET_TIMER:
                handleRemainingTimeChanged(data);
                break;

            case constants.START_TIMER:
                assertExists(data.timerId);

                // avoid setting up more than one timer
                if (!TimerStore.isRunning(data.timerId)) {
                    start(data.timerId);
                }
                break;

            case constants.STOP_TIMER:
                stop(data.timerId);
                break;

            case constants.RESET_TIMER:
                reset(data.timerId);
                break;
        }

        return true; // No errors. Needed by promise in Dispatcher.
    })

});

window.__TimeStore = TimerStore;
module.exports = TimerStore;

},{"../appdispatcher":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/appdispatcher.js","../constants":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/constants.js","./base-store":"/Users/carl-erik.kopseng/dev_priv/Emissions/app/stores/base-store.js","babel-runtime/core-js":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/core-js.js","check-types":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/check-types/src/check-types.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/team-name-map.js":[function(require,module,exports){
"use strict";

var _core = require("babel-runtime/core-js")["default"];

var teamMap = _core.Object.freeze({
    leader: "operasjonsleder",
    science: "forskningsteam",
    communication: "kommunikasjonsteam",
    security: "sikkerhetsteam",
    astronaut: "astronautteam"
});

function otherTeamNames(currentTeamId) {
    return _core.Object.keys(teamMap).filter(function (n) {
        return n !== currentTeamId && n !== "leader";
    }).map(function (n) {
        return teamMap[n];
    }).join(", ");
}

module.exports = {
    nameMap: teamMap,
    otherTeamNames: otherTeamNames
};

},{"babel-runtime/core-js":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/core-js.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/utils.js":[function(require,module,exports){
"use strict";

function cleanRootPath(path) {
    // convert '/science/step1' => 'science'
    return path.replace(/\/?(\w+).*/, "$1");
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max + 1 - min)) + min;
}

module.exports = {
    cleanRootPath: cleanRootPath, randomInt: randomInt
};

},{}],"/Users/carl-erik.kopseng/dev_priv/Emissions/app/uuid.js":[function(require,module,exports){
// generates a UUID
// worlds smallest uuid lib. crazy shit :)
// @see https://gist.github.com/jed/982883
"use strict";

module.exports = function b(a) {
  return a ? (a ^ Math.random() * 16 >> a / 4).toString(16) : ([10000000] + -1000 + -4000 + -8000 + -100000000000).replace(/[018]/g, b);
};

},{}],"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/core-js.js":[function(require,module,exports){
/**
 * Core.js 0.6.1
 * https://github.com/zloirock/core-js
 * License: http://rock.mit-license.org
 * © 2015 Denis Pushkarev
 */
!function(global, framework, undefined){
'use strict';

/******************************************************************************
 * Module : common                                                            *
 ******************************************************************************/

  // Shortcuts for [[Class]] & property names
var OBJECT          = 'Object'
  , FUNCTION        = 'Function'
  , ARRAY           = 'Array'
  , STRING          = 'String'
  , NUMBER          = 'Number'
  , REGEXP          = 'RegExp'
  , DATE            = 'Date'
  , MAP             = 'Map'
  , SET             = 'Set'
  , WEAKMAP         = 'WeakMap'
  , WEAKSET         = 'WeakSet'
  , SYMBOL          = 'Symbol'
  , PROMISE         = 'Promise'
  , MATH            = 'Math'
  , ARGUMENTS       = 'Arguments'
  , PROTOTYPE       = 'prototype'
  , CONSTRUCTOR     = 'constructor'
  , TO_STRING       = 'toString'
  , TO_STRING_TAG   = TO_STRING + 'Tag'
  , TO_LOCALE       = 'toLocaleString'
  , HAS_OWN         = 'hasOwnProperty'
  , FOR_EACH        = 'forEach'
  , ITERATOR        = 'iterator'
  , FF_ITERATOR     = '@@' + ITERATOR
  , PROCESS         = 'process'
  , CREATE_ELEMENT  = 'createElement'
  // Aliases global objects and prototypes
  , Function        = global[FUNCTION]
  , Object          = global[OBJECT]
  , Array           = global[ARRAY]
  , String          = global[STRING]
  , Number          = global[NUMBER]
  , RegExp          = global[REGEXP]
  , Date            = global[DATE]
  , Map             = global[MAP]
  , Set             = global[SET]
  , WeakMap         = global[WEAKMAP]
  , WeakSet         = global[WEAKSET]
  , Symbol          = global[SYMBOL]
  , Math            = global[MATH]
  , TypeError       = global.TypeError
  , RangeError      = global.RangeError
  , setTimeout      = global.setTimeout
  , setImmediate    = global.setImmediate
  , clearImmediate  = global.clearImmediate
  , parseInt        = global.parseInt
  , isFinite        = global.isFinite
  , process         = global[PROCESS]
  , nextTick        = process && process.nextTick
  , document        = global.document
  , html            = document && document.documentElement
  , navigator       = global.navigator
  , define          = global.define
  , console         = global.console || {}
  , ArrayProto      = Array[PROTOTYPE]
  , ObjectProto     = Object[PROTOTYPE]
  , FunctionProto   = Function[PROTOTYPE]
  , Infinity        = 1 / 0
  , DOT             = '.';

// http://jsperf.com/core-js-isobject
function isObject(it){
  return it !== null && (typeof it == 'object' || typeof it == 'function');
}
function isFunction(it){
  return typeof it == 'function';
}
// Native function?
var isNative = ctx(/./.test, /\[native code\]\s*\}\s*$/, 1);

// Object internal [[Class]] or toStringTag
// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring
var toString = ObjectProto[TO_STRING];
function setToStringTag(it, tag, stat){
  if(it && !has(it = stat ? it : it[PROTOTYPE], SYMBOL_TAG))hidden(it, SYMBOL_TAG, tag);
}
function cof(it){
  return toString.call(it).slice(8, -1);
}
function classof(it){
  var O, T;
  return it == undefined ? it === undefined ? 'Undefined' : 'Null'
    : typeof (T = (O = Object(it))[SYMBOL_TAG]) == 'string' ? T : cof(O);
}

// Function
var call  = FunctionProto.call
  , apply = FunctionProto.apply
  , REFERENCE_GET;
// Partial apply
function part(/* ...args */){
  var fn     = assertFunction(this)
    , length = arguments.length
    , args   = Array(length)
    , i      = 0
    , _      = path._
    , holder = false;
  while(length > i)if((args[i] = arguments[i++]) === _)holder = true;
  return function(/* ...args */){
    var that    = this
      , _length = arguments.length
      , i = 0, j = 0, _args;
    if(!holder && !_length)return invoke(fn, args, that);
    _args = args.slice();
    if(holder)for(;length > i; i++)if(_args[i] === _)_args[i] = arguments[j++];
    while(_length > j)_args.push(arguments[j++]);
    return invoke(fn, _args, that);
  }
}
// Optional / simple context binding
function ctx(fn, that, length){
  assertFunction(fn);
  if(~length && that === undefined)return fn;
  switch(length){
    case 1: return function(a){
      return fn.call(that, a);
    }
    case 2: return function(a, b){
      return fn.call(that, a, b);
    }
    case 3: return function(a, b, c){
      return fn.call(that, a, b, c);
    }
  } return function(/* ...args */){
      return fn.apply(that, arguments);
  }
}
// Fast apply
// http://jsperf.lnkit.com/fast-apply/5
function invoke(fn, args, that){
  var un = that === undefined;
  switch(args.length | 0){
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
    case 5: return un ? fn(args[0], args[1], args[2], args[3], args[4])
                      : fn.call(that, args[0], args[1], args[2], args[3], args[4]);
  } return              fn.apply(that, args);
}

// Object:
var create           = Object.create
  , getPrototypeOf   = Object.getPrototypeOf
  , setPrototypeOf   = Object.setPrototypeOf
  , defineProperty   = Object.defineProperty
  , defineProperties = Object.defineProperties
  , getOwnDescriptor = Object.getOwnPropertyDescriptor
  , getKeys          = Object.keys
  , getNames         = Object.getOwnPropertyNames
  , getSymbols       = Object.getOwnPropertySymbols
  , isFrozen         = Object.isFrozen
  , has              = ctx(call, ObjectProto[HAS_OWN], 2)
  // Dummy, fix for not array-like ES3 string in es5 module
  , ES5Object        = Object
  , Dict;
function toObject(it){
  return ES5Object(assertDefined(it));
}
function returnIt(it){
  return it;
}
function returnThis(){
  return this;
}
function get(object, key){
  if(has(object, key))return object[key];
}
function ownKeys(it){
  assertObject(it);
  return getSymbols ? getNames(it).concat(getSymbols(it)) : getNames(it);
}
// 19.1.2.1 Object.assign(target, source, ...)
var assign = Object.assign || function(target, source){
  var T = Object(assertDefined(target))
    , l = arguments.length
    , i = 1;
  while(l > i){
    var S      = ES5Object(arguments[i++])
      , keys   = getKeys(S)
      , length = keys.length
      , j      = 0
      , key;
    while(length > j)T[key = keys[j++]] = S[key];
  }
  return T;
}
function keyOf(object, el){
  var O      = toObject(object)
    , keys   = getKeys(O)
    , length = keys.length
    , index  = 0
    , key;
  while(length > index)if(O[key = keys[index++]] === el)return key;
}

// Array
// array('str1,str2,str3') => ['str1', 'str2', 'str3']
function array(it){
  return String(it).split(',');
}
var push    = ArrayProto.push
  , unshift = ArrayProto.unshift
  , slice   = ArrayProto.slice
  , splice  = ArrayProto.splice
  , indexOf = ArrayProto.indexOf
  , forEach = ArrayProto[FOR_EACH];
/*
 * 0 -> forEach
 * 1 -> map
 * 2 -> filter
 * 3 -> some
 * 4 -> every
 * 5 -> find
 * 6 -> findIndex
 */
function createArrayMethod(type){
  var isMap       = type == 1
    , isFilter    = type == 2
    , isSome      = type == 3
    , isEvery     = type == 4
    , isFindIndex = type == 6
    , noholes     = type == 5 || isFindIndex;
  return function(callbackfn/*, that = undefined */){
    var O      = Object(assertDefined(this))
      , that   = arguments[1]
      , self   = ES5Object(O)
      , f      = ctx(callbackfn, that, 3)
      , length = toLength(self.length)
      , index  = 0
      , result = isMap ? Array(length) : isFilter ? [] : undefined
      , val, res;
    for(;length > index; index++)if(noholes || index in self){
      val = self[index];
      res = f(val, index, O);
      if(type){
        if(isMap)result[index] = res;             // map
        else if(res)switch(type){
          case 3: return true;                    // some
          case 5: return val;                     // find
          case 6: return index;                   // findIndex
          case 2: result.push(val);               // filter
        } else if(isEvery)return false;           // every
      }
    }
    return isFindIndex ? -1 : isSome || isEvery ? isEvery : result;
  }
}
function createArrayContains(isContains){
  return function(el /*, fromIndex = 0 */){
    var O      = toObject(this)
      , length = toLength(O.length)
      , index  = toIndex(arguments[1], length);
    if(isContains && el != el){
      for(;length > index; index++)if(sameNaN(O[index]))return isContains || index;
    } else for(;length > index; index++)if(isContains || index in O){
      if(O[index] === el)return isContains || index;
    } return !isContains && -1;
  }
}
function generic(A, B){
  // strange IE quirks mode bug -> use typeof vs isFunction
  return typeof A == 'function' ? A : B;
}

// Math
var MAX_SAFE_INTEGER = 0x1fffffffffffff // pow(2, 53) - 1 == 9007199254740991
  , pow    = Math.pow
  , abs    = Math.abs
  , ceil   = Math.ceil
  , floor  = Math.floor
  , max    = Math.max
  , min    = Math.min
  , random = Math.random
  , trunc  = Math.trunc || function(it){
      return (it > 0 ? floor : ceil)(it);
    }
// 20.1.2.4 Number.isNaN(number)
function sameNaN(number){
  return number != number;
}
// 7.1.4 ToInteger
function toInteger(it){
  return isNaN(it) ? 0 : trunc(it);
}
// 7.1.15 ToLength
function toLength(it){
  return it > 0 ? min(toInteger(it), MAX_SAFE_INTEGER) : 0;
}
function toIndex(index, length){
  var index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
}
function lz(num){
  return num > 9 ? num : '0' + num;
}

function createReplacer(regExp, replace, isStatic){
  var replacer = isObject(replace) ? function(part){
    return replace[part];
  } : replace;
  return function(it){
    return String(isStatic ? it : this).replace(regExp, replacer);
  }
}
function createPointAt(toString){
  return function(pos){
    var s = String(assertDefined(this))
      , i = toInteger(pos)
      , l = s.length
      , a, b;
    if(i < 0 || i >= l)return toString ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? toString ? s.charAt(i) : a
      : toString ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  }
}

// Assertion & errors
var REDUCE_ERROR = 'Reduce of empty object with no initial value';
function assert(condition, msg1, msg2){
  if(!condition)throw TypeError(msg2 ? msg1 + msg2 : msg1);
}
function assertDefined(it){
  if(it == undefined)throw TypeError('Function called on null or undefined');
  return it;
}
function assertFunction(it){
  assert(isFunction(it), it, ' is not a function!');
  return it;
}
function assertObject(it){
  assert(isObject(it), it, ' is not an object!');
  return it;
}
function assertInstance(it, Constructor, name){
  assert(it instanceof Constructor, name, ": use the 'new' operator!");
}

// Property descriptors & Symbol
function descriptor(bitmap, value){
  return {
    enumerable  : !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable    : !(bitmap & 4),
    value       : value
  }
}
function simpleSet(object, key, value){
  object[key] = value;
  return object;
}
function createDefiner(bitmap){
  return DESC ? function(object, key, value){
    return defineProperty(object, key, descriptor(bitmap, value));
  } : simpleSet;
}
function uid(key){
  return SYMBOL + '(' + key + ')_' + (++sid + random())[TO_STRING](36);
}
function getWellKnownSymbol(name, setter){
  return (Symbol && Symbol[name]) || (setter ? Symbol : safeSymbol)(SYMBOL + DOT + name);
}
// The engine works fine with descriptors? Thank's IE8 for his funny defineProperty.
var DESC = !!function(){
      try {
        return defineProperty({}, 'a', {get: function(){ return 2 }}).a == 2;
      } catch(e){}
    }()
  , sid    = 0
  , hidden = createDefiner(1)
  , set    = Symbol ? simpleSet : hidden
  , safeSymbol = Symbol || uid;
function assignHidden(target, src){
  for(var key in src)hidden(target, key, src[key]);
  return target;
}

var SYMBOL_UNSCOPABLES = getWellKnownSymbol('unscopables')
  , ArrayUnscopables   = ArrayProto[SYMBOL_UNSCOPABLES] || {}
  , SYMBOL_TAG         = getWellKnownSymbol(TO_STRING_TAG)
  , SYMBOL_SPECIES     = getWellKnownSymbol('species')
  , SYMBOL_ITERATOR;
function setSpecies(C){
  if(DESC && (framework || !isNative(C)))defineProperty(C, SYMBOL_SPECIES, {
    configurable: true,
    get: returnThis
  });
}

/******************************************************************************
 * Module : common.export                                                     *
 ******************************************************************************/

var NODE = cof(process) == PROCESS
  , core = {}
  , path = framework ? global : core
  , old  = global.core
  , exportGlobal
  // type bitmap
  , FORCED = 1
  , GLOBAL = 2
  , STATIC = 4
  , PROTO  = 8
  , BIND   = 16
  , WRAP   = 32;
function $define(type, name, source){
  var key, own, out, exp
    , isGlobal = type & GLOBAL
    , target   = isGlobal ? global : (type & STATIC)
        ? global[name] : (global[name] || ObjectProto)[PROTOTYPE]
    , exports  = isGlobal ? core : core[name] || (core[name] = {});
  if(isGlobal)source = name;
  for(key in source){
    // there is a similar native
    own = !(type & FORCED) && target && key in target
      && (!isFunction(target[key]) || isNative(target[key]));
    // export native or passed
    out = (own ? target : source)[key];
    // prevent global pollution for namespaces
    if(!framework && isGlobal && !isFunction(target[key]))exp = source[key];
    // bind timers to global for call from export context
    else if(type & BIND && own)exp = ctx(out, global);
    // wrap global constructors for prevent change them in library
    else if(type & WRAP && !framework && target[key] == out){
      exp = function(param){
        return this instanceof out ? new out(param) : out(param);
      }
      exp[PROTOTYPE] = out[PROTOTYPE];
    } else exp = type & PROTO && isFunction(out) ? ctx(call, out) : out;
    // extend global
    if(framework && target && !own){
      if(isGlobal)target[key] = out;
      else delete target[key] && hidden(target, key, out);
    }
    // export
    if(exports[key] != out)hidden(exports, key, exp);
  }
}
// CommonJS export
if(typeof module != 'undefined' && module.exports)module.exports = core;
// RequireJS export
else if(isFunction(define) && define.amd)define(function(){return core});
// Export to global object
else exportGlobal = true;
if(exportGlobal || framework){
  core.noConflict = function(){
    global.core = old;
    return core;
  }
  global.core = core;
}

/******************************************************************************
 * Module : common.iterators                                                  *
 ******************************************************************************/

SYMBOL_ITERATOR = getWellKnownSymbol(ITERATOR);
var ITER  = safeSymbol('iter')
  , KEY   = 1
  , VALUE = 2
  , Iterators = {}
  , IteratorPrototype = {}
    // Safari has byggy iterators w/o `next`
  , BUGGY_ITERATORS = 'keys' in ArrayProto && !('next' in [].keys());
// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
setIterator(IteratorPrototype, returnThis);
function setIterator(O, value){
  hidden(O, SYMBOL_ITERATOR, value);
  // Add iterator for FF iterator protocol
  FF_ITERATOR in ArrayProto && hidden(O, FF_ITERATOR, value);
}
function createIterator(Constructor, NAME, next, proto){
  Constructor[PROTOTYPE] = create(proto || IteratorPrototype, {next: descriptor(1, next)});
  setToStringTag(Constructor, NAME + ' Iterator');
}
function defineIterator(Constructor, NAME, value, DEFAULT){
  var proto = Constructor[PROTOTYPE]
    , iter  = get(proto, SYMBOL_ITERATOR) || get(proto, FF_ITERATOR) || (DEFAULT && get(proto, DEFAULT)) || value;
  if(framework){
    // Define iterator
    setIterator(proto, iter);
    if(iter !== value){
      var iterProto = getPrototypeOf(iter.call(new Constructor));
      // Set @@toStringTag to native iterators
      setToStringTag(iterProto, NAME + ' Iterator', true);
      // FF fix
      has(proto, FF_ITERATOR) && setIterator(iterProto, returnThis);
    }
  }
  // Plug for library
  Iterators[NAME] = iter;
  // FF & v8 fix
  Iterators[NAME + ' Iterator'] = returnThis;
  return iter;
}
function defineStdIterators(Base, NAME, Constructor, next, DEFAULT, IS_SET){
  function createIter(kind){
    return function(){
      return new Constructor(this, kind);
    }
  }
  createIterator(Constructor, NAME, next);
  var entries = createIter(KEY+VALUE)
    , values  = createIter(VALUE);
  if(DEFAULT == VALUE)values = defineIterator(Base, NAME, values, 'values');
  else entries = defineIterator(Base, NAME, entries, 'entries');
  if(DEFAULT){
    $define(PROTO + FORCED * BUGGY_ITERATORS, NAME, {
      entries: entries,
      keys: IS_SET ? values : createIter(KEY),
      values: values
    });
  }
}
function iterResult(done, value){
  return {value: value, done: !!done};
}
function isIterable(it){
  var O      = Object(it)
    , Symbol = global[SYMBOL]
    , hasExt = (Symbol && Symbol[ITERATOR] || FF_ITERATOR) in O;
  return hasExt || SYMBOL_ITERATOR in O || has(Iterators, classof(O));
}
function getIterator(it){
  var Symbol  = global[SYMBOL]
    , ext     = it[Symbol && Symbol[ITERATOR] || FF_ITERATOR]
    , getIter = ext || it[SYMBOL_ITERATOR] || Iterators[classof(it)];
  return assertObject(getIter.call(it));
}
function stepCall(fn, value, entries){
  return entries ? invoke(fn, value) : fn(value);
}
function checkDangerIterClosing(fn){
  var danger = true;
  var O = {
    next: function(){ throw 1 },
    'return': function(){ danger = false }
  };
  O[SYMBOL_ITERATOR] = returnThis;
  try {
    fn(O);
  } catch(e){}
  return danger;
}
function closeIterator(iterator){
  var ret = iterator['return'];
  if(ret !== undefined)ret.call(iterator);
}
function safeIterClose(exec, iterator){
  try {
    exec(iterator);
  } catch(e){
    closeIterator(iterator);
    throw e;
  }
}
function forOf(iterable, entries, fn, that){
  safeIterClose(function(iterator){
    var f = ctx(fn, that, entries ? 2 : 1)
      , step;
    while(!(step = iterator.next()).done)if(stepCall(f, step.value, entries) === false){
      return closeIterator(iterator);
    }
  }, getIterator(iterable));
}

/******************************************************************************
 * Module : es6.symbol                                                        *
 ******************************************************************************/

// ECMAScript 6 symbols shim
!function(TAG, SymbolRegistry, AllSymbols, setter){
  // 19.4.1.1 Symbol([description])
  if(!isNative(Symbol)){
    Symbol = function(description){
      assert(!(this instanceof Symbol), SYMBOL + ' is not a ' + CONSTRUCTOR);
      var tag = uid(description)
        , sym = set(create(Symbol[PROTOTYPE]), TAG, tag);
      AllSymbols[tag] = sym;
      DESC && setter && defineProperty(ObjectProto, tag, {
        configurable: true,
        set: function(value){
          hidden(this, tag, value);
        }
      });
      return sym;
    }
    hidden(Symbol[PROTOTYPE], TO_STRING, function(){
      return this[TAG];
    });
  }
  $define(GLOBAL + WRAP, {Symbol: Symbol});
  
  var symbolStatics = {
    // 19.4.2.1 Symbol.for(key)
    'for': function(key){
      return has(SymbolRegistry, key += '')
        ? SymbolRegistry[key]
        : SymbolRegistry[key] = Symbol(key);
    },
    // 19.4.2.4 Symbol.iterator
    iterator: SYMBOL_ITERATOR || getWellKnownSymbol(ITERATOR),
    // 19.4.2.5 Symbol.keyFor(sym)
    keyFor: part.call(keyOf, SymbolRegistry),
    // 19.4.2.10 Symbol.species
    species: SYMBOL_SPECIES,
    // 19.4.2.13 Symbol.toStringTag
    toStringTag: SYMBOL_TAG = getWellKnownSymbol(TO_STRING_TAG, true),
    // 19.4.2.14 Symbol.unscopables
    unscopables: SYMBOL_UNSCOPABLES,
    pure: safeSymbol,
    set: set,
    useSetter: function(){setter = true},
    useSimple: function(){setter = false}
  };
  // 19.4.2.2 Symbol.hasInstance
  // 19.4.2.3 Symbol.isConcatSpreadable
  // 19.4.2.6 Symbol.match
  // 19.4.2.8 Symbol.replace
  // 19.4.2.9 Symbol.search
  // 19.4.2.11 Symbol.split
  // 19.4.2.12 Symbol.toPrimitive
  forEach.call(array('hasInstance,isConcatSpreadable,match,replace,search,split,toPrimitive'),
    function(it){
      symbolStatics[it] = getWellKnownSymbol(it);
    }
  );
  $define(STATIC, SYMBOL, symbolStatics);
  
  setToStringTag(Symbol, SYMBOL);
  
  $define(STATIC + FORCED * !isNative(Symbol), OBJECT, {
    // 19.1.2.7 Object.getOwnPropertyNames(O)
    getOwnPropertyNames: function(it){
      var names = getNames(toObject(it)), result = [], key, i = 0;
      while(names.length > i)has(AllSymbols, key = names[i++]) || result.push(key);
      return result;
    },
    // 19.1.2.8 Object.getOwnPropertySymbols(O)
    getOwnPropertySymbols: function(it){
      var names = getNames(toObject(it)), result = [], key, i = 0;
      while(names.length > i)has(AllSymbols, key = names[i++]) && result.push(AllSymbols[key]);
      return result;
    }
  });
  
  // 20.2.1.9 Math[@@toStringTag]
  setToStringTag(Math, MATH, true);
  // 24.3.3 JSON[@@toStringTag]
  setToStringTag(global.JSON, 'JSON', true);
}(safeSymbol('tag'), {}, {}, true);

/******************************************************************************
 * Module : es6.object.statics                                                *
 ******************************************************************************/

!function(){
  var objectStatic = {
    // 19.1.3.1 Object.assign(target, source)
    assign: assign,
    // 19.1.3.10 Object.is(value1, value2)
    is: function(x, y){
      return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
    }
  };
  // 19.1.3.19 Object.setPrototypeOf(O, proto)
  // Works with __proto__ only. Old v8 can't works with null proto objects.
  '__proto__' in ObjectProto && function(buggy, set){
    try {
      set = ctx(call, getOwnDescriptor(ObjectProto, '__proto__').set, 2);
      set({}, ArrayProto);
    } catch(e){ buggy = true }
    objectStatic.setPrototypeOf = setPrototypeOf = setPrototypeOf || function(O, proto){
      assertObject(O);
      assert(proto === null || isObject(proto), proto, ": can't set as prototype!");
      if(buggy)O.__proto__ = proto;
      else set(O, proto);
      return O;
    }
  }();
  $define(STATIC, OBJECT, objectStatic);
}();

/******************************************************************************
 * Module : es6.object.statics-accept-primitives                              *
 ******************************************************************************/

!function(){
  // Object static methods accept primitives
  function wrapObjectMethod(key, MODE){
    var fn  = Object[key]
      , exp = core[OBJECT][key]
      , f   = 0
      , o   = {};
    if(!exp || isNative(exp)){
      o[key] = MODE == 1 ? function(it){
        return isObject(it) ? fn(it) : it;
      } : MODE == 2 ? function(it){
        return isObject(it) ? fn(it) : true;
      } : MODE == 3 ? function(it){
        return isObject(it) ? fn(it) : false;
      } : MODE == 4 ? function(it, key){
        return fn(toObject(it), key);
      } : function(it){
        return fn(toObject(it));
      };
      try { fn(DOT) }
      catch(e){ f = 1 }
      $define(STATIC + FORCED * f, OBJECT, o);
    }
  }
  wrapObjectMethod('freeze', 1);
  wrapObjectMethod('seal', 1);
  wrapObjectMethod('preventExtensions', 1);
  wrapObjectMethod('isFrozen', 2);
  wrapObjectMethod('isSealed', 2);
  wrapObjectMethod('isExtensible', 3);
  wrapObjectMethod('getOwnPropertyDescriptor', 4);
  wrapObjectMethod('getPrototypeOf');
  wrapObjectMethod('keys');
  wrapObjectMethod('getOwnPropertyNames');
}();

/******************************************************************************
 * Module : es6.number.statics                                                *
 ******************************************************************************/

!function(isInteger){
  $define(STATIC, NUMBER, {
    // 20.1.2.1 Number.EPSILON
    EPSILON: pow(2, -52),
    // 20.1.2.2 Number.isFinite(number)
    isFinite: function(it){
      return typeof it == 'number' && isFinite(it);
    },
    // 20.1.2.3 Number.isInteger(number)
    isInteger: isInteger,
    // 20.1.2.4 Number.isNaN(number)
    isNaN: sameNaN,
    // 20.1.2.5 Number.isSafeInteger(number)
    isSafeInteger: function(number){
      return isInteger(number) && abs(number) <= MAX_SAFE_INTEGER;
    },
    // 20.1.2.6 Number.MAX_SAFE_INTEGER
    MAX_SAFE_INTEGER: MAX_SAFE_INTEGER,
    // 20.1.2.10 Number.MIN_SAFE_INTEGER
    MIN_SAFE_INTEGER: -MAX_SAFE_INTEGER,
    // 20.1.2.12 Number.parseFloat(string)
    parseFloat: parseFloat,
    // 20.1.2.13 Number.parseInt(string, radix)
    parseInt: parseInt
  });
// 20.1.2.3 Number.isInteger(number)
}(Number.isInteger || function(it){
  return !isObject(it) && isFinite(it) && floor(it) === it;
});

/******************************************************************************
 * Module : es6.math                                                          *
 ******************************************************************************/

// ECMAScript 6 shim
!function(){
  // 20.2.2.28 Math.sign(x)
  var E    = Math.E
    , exp  = Math.exp
    , log  = Math.log
    , sqrt = Math.sqrt
    , sign = Math.sign || function(x){
        return (x = +x) == 0 || x != x ? x : x < 0 ? -1 : 1;
      };
  
  // 20.2.2.5 Math.asinh(x)
  function asinh(x){
    return !isFinite(x = +x) || x == 0 ? x : x < 0 ? -asinh(-x) : log(x + sqrt(x * x + 1));
  }
  // 20.2.2.14 Math.expm1(x)
  function expm1(x){
    return (x = +x) == 0 ? x : x > -1e-6 && x < 1e-6 ? x + x * x / 2 : exp(x) - 1;
  }
    
  $define(STATIC, MATH, {
    // 20.2.2.3 Math.acosh(x)
    acosh: function(x){
      return (x = +x) < 1 ? NaN : isFinite(x) ? log(x / E + sqrt(x + 1) * sqrt(x - 1) / E) + 1 : x;
    },
    // 20.2.2.5 Math.asinh(x)
    asinh: asinh,
    // 20.2.2.7 Math.atanh(x)
    atanh: function(x){
      return (x = +x) == 0 ? x : log((1 + x) / (1 - x)) / 2;
    },
    // 20.2.2.9 Math.cbrt(x)
    cbrt: function(x){
      return sign(x = +x) * pow(abs(x), 1 / 3);
    },
    // 20.2.2.11 Math.clz32(x)
    clz32: function(x){
      return (x >>>= 0) ? 32 - x[TO_STRING](2).length : 32;
    },
    // 20.2.2.12 Math.cosh(x)
    cosh: function(x){
      return (exp(x = +x) + exp(-x)) / 2;
    },
    // 20.2.2.14 Math.expm1(x)
    expm1: expm1,
    // 20.2.2.16 Math.fround(x)
    // TODO: fallback for IE9-
    fround: function(x){
      return new Float32Array([x])[0];
    },
    // 20.2.2.17 Math.hypot([value1[, value2[, … ]]])
    hypot: function(value1, value2){
      var sum  = 0
        , len1 = arguments.length
        , len2 = len1
        , args = Array(len1)
        , larg = -Infinity
        , arg;
      while(len1--){
        arg = args[len1] = +arguments[len1];
        if(arg == Infinity || arg == -Infinity)return Infinity;
        if(arg > larg)larg = arg;
      }
      larg = arg || 1;
      while(len2--)sum += pow(args[len2] / larg, 2);
      return larg * sqrt(sum);
    },
    // 20.2.2.18 Math.imul(x, y)
    imul: function(x, y){
      var UInt16 = 0xffff
        , xn = +x
        , yn = +y
        , xl = UInt16 & xn
        , yl = UInt16 & yn;
      return 0 | xl * yl + ((UInt16 & xn >>> 16) * yl + xl * (UInt16 & yn >>> 16) << 16 >>> 0);
    },
    // 20.2.2.20 Math.log1p(x)
    log1p: function(x){
      return (x = +x) > -1e-8 && x < 1e-8 ? x - x * x / 2 : log(1 + x);
    },
    // 20.2.2.21 Math.log10(x)
    log10: function(x){
      return log(x) / Math.LN10;
    },
    // 20.2.2.22 Math.log2(x)
    log2: function(x){
      return log(x) / Math.LN2;
    },
    // 20.2.2.28 Math.sign(x)
    sign: sign,
    // 20.2.2.30 Math.sinh(x)
    sinh: function(x){
      return (abs(x = +x) < 1) ? (expm1(x) - expm1(-x)) / 2 : (exp(x - 1) - exp(-x - 1)) * (E / 2);
    },
    // 20.2.2.33 Math.tanh(x)
    tanh: function(x){
      var a = expm1(x = +x)
        , b = expm1(-x);
      return a == Infinity ? 1 : b == Infinity ? -1 : (a - b) / (exp(x) + exp(-x));
    },
    // 20.2.2.34 Math.trunc(x)
    trunc: trunc
  });
}();

/******************************************************************************
 * Module : es6.string                                                        *
 ******************************************************************************/

!function(fromCharCode){
  function assertNotRegExp(it){
    if(cof(it) == REGEXP)throw TypeError();
  }
  
  $define(STATIC, STRING, {
    // 21.1.2.2 String.fromCodePoint(...codePoints)
    fromCodePoint: function(x){
      var res = []
        , len = arguments.length
        , i   = 0
        , code
      while(len > i){
        code = +arguments[i++];
        if(toIndex(code, 0x10ffff) !== code)throw RangeError(code + ' is not a valid code point');
        res.push(code < 0x10000
          ? fromCharCode(code)
          : fromCharCode(((code -= 0x10000) >> 10) + 0xd800, code % 0x400 + 0xdc00)
        );
      } return res.join('');
    },
    // 21.1.2.4 String.raw(callSite, ...substitutions)
    raw: function(callSite){
      var raw = toObject(callSite.raw)
        , len = toLength(raw.length)
        , sln = arguments.length
        , res = []
        , i   = 0;
      while(len > i){
        res.push(String(raw[i++]));
        if(i < sln)res.push(String(arguments[i]));
      } return res.join('');
    }
  });
  
  $define(PROTO, STRING, {
    // 21.1.3.3 String.prototype.codePointAt(pos)
    codePointAt: createPointAt(false),
    // 21.1.3.6 String.prototype.endsWith(searchString [, endPosition])
    endsWith: function(searchString /*, endPosition = @length */){
      assertNotRegExp(searchString);
      var that = String(assertDefined(this))
        , endPosition = arguments[1]
        , len = toLength(that.length)
        , end = endPosition === undefined ? len : min(toLength(endPosition), len);
      searchString += '';
      return that.slice(end - searchString.length, end) === searchString;
    },
    // 21.1.3.7 String.prototype.includes(searchString, position = 0)
    includes: function(searchString /*, position = 0 */){
      assertNotRegExp(searchString);
      return !!~String(assertDefined(this)).indexOf(searchString, arguments[1]);
    },
    // 21.1.3.13 String.prototype.repeat(count)
    repeat: function(count){
      var str = String(assertDefined(this))
        , res = ''
        , n   = toInteger(count);
      if(0 > n || n == Infinity)throw RangeError("Count can't be negative");
      for(;n > 0; (n >>>= 1) && (str += str))if(n & 1)res += str;
      return res;
    },
    // 21.1.3.18 String.prototype.startsWith(searchString [, position ])
    startsWith: function(searchString /*, position = 0 */){
      assertNotRegExp(searchString);
      var that  = String(assertDefined(this))
        , index = toLength(min(arguments[1], that.length));
      searchString += '';
      return that.slice(index, index + searchString.length) === searchString;
    }
  });
}(String.fromCharCode);

/******************************************************************************
 * Module : es6.array.statics                                                 *
 ******************************************************************************/

!function(){
  $define(STATIC + FORCED * checkDangerIterClosing(Array.from), ARRAY, {
    // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
    from: function(arrayLike/*, mapfn = undefined, thisArg = undefined*/){
      var O       = Object(assertDefined(arrayLike))
        , mapfn   = arguments[1]
        , mapping = mapfn !== undefined
        , f       = mapping ? ctx(mapfn, arguments[2], 2) : undefined
        , index   = 0
        , length, result, step;
      if(isIterable(O)){
        result = new (generic(this, Array));
        safeIterClose(function(iterator){
          for(; !(step = iterator.next()).done; index++){
            result[index] = mapping ? f(step.value, index) : step.value;
          }
        }, getIterator(O));
      } else {
        result = new (generic(this, Array))(length = toLength(O.length));
        for(; length > index; index++){
          result[index] = mapping ? f(O[index], index) : O[index];
        }
      }
      result.length = index;
      return result;
    }
  });
  
  $define(STATIC, ARRAY, {
    // 22.1.2.3 Array.of( ...items)
    of: function(/* ...args */){
      var index  = 0
        , length = arguments.length
        , result = new (generic(this, Array))(length);
      while(length > index)result[index] = arguments[index++];
      result.length = length;
      return result;
    }
  });
  
  setSpecies(Array);
}();

/******************************************************************************
 * Module : es6.array.prototype                                               *
 ******************************************************************************/

!function(){
  $define(PROTO, ARRAY, {
    // 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)
    copyWithin: function(target /* = 0 */, start /* = 0, end = @length */){
      var O     = Object(assertDefined(this))
        , len   = toLength(O.length)
        , to    = toIndex(target, len)
        , from  = toIndex(start, len)
        , end   = arguments[2]
        , fin   = end === undefined ? len : toIndex(end, len)
        , count = min(fin - from, len - to)
        , inc   = 1;
      if(from < to && to < from + count){
        inc  = -1;
        from = from + count - 1;
        to   = to + count - 1;
      }
      while(count-- > 0){
        if(from in O)O[to] = O[from];
        else delete O[to];
        to += inc;
        from += inc;
      } return O;
    },
    // 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)
    fill: function(value /*, start = 0, end = @length */){
      var O      = Object(assertDefined(this))
        , length = toLength(O.length)
        , index  = toIndex(arguments[1], length)
        , end    = arguments[2]
        , endPos = end === undefined ? length : toIndex(end, length);
      while(endPos > index)O[index++] = value;
      return O;
    },
    // 22.1.3.8 Array.prototype.find(predicate, thisArg = undefined)
    find: createArrayMethod(5),
    // 22.1.3.9 Array.prototype.findIndex(predicate, thisArg = undefined)
    findIndex: createArrayMethod(6)
  });
  
  if(framework){
    // 22.1.3.31 Array.prototype[@@unscopables]
    forEach.call(array('find,findIndex,fill,copyWithin,entries,keys,values'), function(it){
      ArrayUnscopables[it] = true;
    });
    SYMBOL_UNSCOPABLES in ArrayProto || hidden(ArrayProto, SYMBOL_UNSCOPABLES, ArrayUnscopables);
  }
}();

/******************************************************************************
 * Module : es6.iterators                                                     *
 ******************************************************************************/

!function(at){
  // 22.1.3.4 Array.prototype.entries()
  // 22.1.3.13 Array.prototype.keys()
  // 22.1.3.29 Array.prototype.values()
  // 22.1.3.30 Array.prototype[@@iterator]()
  defineStdIterators(Array, ARRAY, function(iterated, kind){
    set(this, ITER, {o: toObject(iterated), i: 0, k: kind});
  // 22.1.5.2.1 %ArrayIteratorPrototype%.next()
  }, function(){
    var iter  = this[ITER]
      , O     = iter.o
      , kind  = iter.k
      , index = iter.i++;
    if(!O || index >= O.length){
      iter.o = undefined;
      return iterResult(1);
    }
    if(kind == KEY)  return iterResult(0, index);
    if(kind == VALUE)return iterResult(0, O[index]);
                     return iterResult(0, [index, O[index]]);
  }, VALUE);
  
  // argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
  Iterators[ARGUMENTS] = Iterators[ARRAY];
  
  // 21.1.3.27 String.prototype[@@iterator]()
  defineStdIterators(String, STRING, function(iterated){
    set(this, ITER, {o: String(iterated), i: 0});
  // 21.1.5.2.1 %StringIteratorPrototype%.next()
  }, function(){
    var iter  = this[ITER]
      , O     = iter.o
      , index = iter.i
      , point;
    if(index >= O.length)return iterResult(1);
    point = at.call(O, index);
    iter.i += point.length;
    return iterResult(0, point);
  });
}(createPointAt(true));

/******************************************************************************
 * Module : web.immediate                                                     *
 ******************************************************************************/

// setImmediate shim
// Node.js 0.9+ & IE10+ has setImmediate, else:
isFunction(setImmediate) && isFunction(clearImmediate) || function(ONREADYSTATECHANGE){
  var postMessage      = global.postMessage
    , addEventListener = global.addEventListener
    , MessageChannel   = global.MessageChannel
    , counter          = 0
    , queue            = {}
    , defer, channel, port;
  setImmediate = function(fn){
    var args = [], i = 1;
    while(arguments.length > i)args.push(arguments[i++]);
    queue[++counter] = function(){
      invoke(isFunction(fn) ? fn : Function(fn), args);
    }
    defer(counter);
    return counter;
  }
  clearImmediate = function(id){
    delete queue[id];
  }
  function run(id){
    if(has(queue, id)){
      var fn = queue[id];
      delete queue[id];
      fn();
    }
  }
  function listner(event){
    run(event.data);
  }
  // Node.js 0.8-
  if(NODE){
    defer = function(id){
      nextTick(part.call(run, id));
    }
  // Modern browsers, skip implementation for WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is object
  } else if(addEventListener && isFunction(postMessage) && !global.importScripts){
    defer = function(id){
      postMessage(id, '*');
    }
    addEventListener('message', listner, false);
  // WebWorkers
  } else if(isFunction(MessageChannel)){
    channel = new MessageChannel;
    port    = channel.port2;
    channel.port1.onmessage = listner;
    defer = ctx(port.postMessage, port, 1);
  // IE8-
  } else if(document && ONREADYSTATECHANGE in document[CREATE_ELEMENT]('script')){
    defer = function(id){
      html.appendChild(document[CREATE_ELEMENT]('script'))[ONREADYSTATECHANGE] = function(){
        html.removeChild(this);
        run(id);
      }
    }
  // Rest old browsers
  } else {
    defer = function(id){
      setTimeout(run, 0, id);
    }
  }
}('onreadystatechange');
$define(GLOBAL + BIND, {
  setImmediate:   setImmediate,
  clearImmediate: clearImmediate
});

/******************************************************************************
 * Module : es6.promise                                                       *
 ******************************************************************************/

// ES6 promises shim
// Based on https://github.com/getify/native-promise-only/
!function(Promise, test){
  isFunction(Promise) && isFunction(Promise.resolve)
  && Promise.resolve(test = new Promise(function(){})) == test
  || function(asap, RECORD){
    function isThenable(it){
      var then;
      if(isObject(it))then = it.then;
      return isFunction(then) ? then : false;
    }
    function handledRejectionOrHasOnRejected(promise){
      var record = promise[RECORD]
        , chain  = record.c
        , i      = 0
        , react;
      if(record.h)return true;
      while(chain.length > i){
        react = chain[i++];
        if(react.fail || handledRejectionOrHasOnRejected(react.P))return true;
      }
    }
    function notify(record, reject){
      var chain = record.c;
      if(reject || chain.length)asap(function(){
        var promise = record.p
          , value   = record.v
          , ok      = record.s == 1
          , i       = 0;
        if(reject && !handledRejectionOrHasOnRejected(promise)){
          setTimeout(function(){
            if(!handledRejectionOrHasOnRejected(promise)){
              if(NODE){
                if(!process.emit('unhandledRejection', value, promise)){
                  // default node.js behavior
                }
              } else if(isFunction(console.error)){
                console.error('Unhandled promise rejection', value);
              }
            }
          }, 1e3);
        } else while(chain.length > i)!function(react){
          var cb = ok ? react.ok : react.fail
            , ret, then;
          try {
            if(cb){
              if(!ok)record.h = true;
              ret = cb === true ? value : cb(value);
              if(ret === react.P){
                react.rej(TypeError(PROMISE + '-chain cycle'));
              } else if(then = isThenable(ret)){
                then.call(ret, react.res, react.rej);
              } else react.res(ret);
            } else react.rej(value);
          } catch(err){
            react.rej(err);
          }
        }(chain[i++]);
        chain.length = 0;
      });
    }
    function resolve(value){
      var record = this
        , then, wrapper;
      if(record.d)return;
      record.d = true;
      record = record.r || record; // unwrap
      try {
        if(then = isThenable(value)){
          wrapper = {r: record, d: false}; // wrap
          then.call(value, ctx(resolve, wrapper, 1), ctx(reject, wrapper, 1));
        } else {
          record.v = value;
          record.s = 1;
          notify(record);
        }
      } catch(err){
        reject.call(wrapper || {r: record, d: false}, err); // wrap
      }
    }
    function reject(value){
      var record = this;
      if(record.d)return;
      record.d = true;
      record = record.r || record; // unwrap
      record.v = value;
      record.s = 2;
      notify(record, true);
    }
    function getConstructor(C){
      var S = assertObject(C)[SYMBOL_SPECIES];
      return S != undefined ? S : C;
    }
    // 25.4.3.1 Promise(executor)
    Promise = function(executor){
      assertFunction(executor);
      assertInstance(this, Promise, PROMISE);
      var record = {
        p: this,      // promise
        c: [],        // chain
        s: 0,         // state
        d: false,     // done
        v: undefined, // value
        h: false      // handled rejection
      };
      hidden(this, RECORD, record);
      try {
        executor(ctx(resolve, record, 1), ctx(reject, record, 1));
      } catch(err){
        reject.call(record, err);
      }
    }
    assignHidden(Promise[PROTOTYPE], {
      // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
      then: function(onFulfilled, onRejected){
        var S = assertObject(assertObject(this)[CONSTRUCTOR])[SYMBOL_SPECIES];
        var react = {
          ok:   isFunction(onFulfilled) ? onFulfilled : true,
          fail: isFunction(onRejected)  ? onRejected  : false
        } , P = react.P = new (S != undefined ? S : Promise)(function(resolve, reject){
          react.res = assertFunction(resolve);
          react.rej = assertFunction(reject);
        }), record = this[RECORD];
        record.c.push(react);
        record.s && notify(record);
        return P;
      },
      // 25.4.5.1 Promise.prototype.catch(onRejected)
      'catch': function(onRejected){
        return this.then(undefined, onRejected);
      }
    });
    assignHidden(Promise, {
      // 25.4.4.1 Promise.all(iterable)
      all: function(iterable){
        var Promise = getConstructor(this)
          , values  = [];
        return new Promise(function(resolve, reject){
          forOf(iterable, false, push, values);
          var remaining = values.length
            , results   = Array(remaining);
          if(remaining)forEach.call(values, function(promise, index){
            Promise.resolve(promise).then(function(value){
              results[index] = value;
              --remaining || resolve(results);
            }, reject);
          });
          else resolve(results);
        });
      },
      // 25.4.4.4 Promise.race(iterable)
      race: function(iterable){
        var Promise = getConstructor(this);
        return new Promise(function(resolve, reject){
          forOf(iterable, false, function(promise){
            Promise.resolve(promise).then(resolve, reject);
          });
        });
      },
      // 25.4.4.5 Promise.reject(r)
      reject: function(r){
        return new (getConstructor(this))(function(resolve, reject){
          reject(r);
        });
      },
      // 25.4.4.6 Promise.resolve(x)
      resolve: function(x){
        return isObject(x) && RECORD in x && getPrototypeOf(x) === this[PROTOTYPE]
          ? x : new (getConstructor(this))(function(resolve, reject){
            resolve(x);
          });
      }
    });
  }(nextTick || setImmediate, safeSymbol('record'));
  setToStringTag(Promise, PROMISE);
  setSpecies(Promise);
  $define(GLOBAL + FORCED * !isNative(Promise), {Promise: Promise});
}(global[PROMISE]);

/******************************************************************************
 * Module : es6.collections                                                   *
 ******************************************************************************/

// ECMAScript 6 collections shim
!function(){
  var UID   = safeSymbol('uid')
    , O1    = safeSymbol('O1')
    , WEAK  = safeSymbol('weak')
    , LEAK  = safeSymbol('leak')
    , LAST  = safeSymbol('last')
    , FIRST = safeSymbol('first')
    , SIZE  = DESC ? safeSymbol('size') : 'size'
    , uid   = 0
    , tmp   = {};
  
  function getCollection(C, NAME, methods, commonMethods, isMap, isWeak){
    var ADDER = isMap ? 'set' : 'add'
      , proto = C && C[PROTOTYPE]
      , O     = {};
    function initFromIterable(that, iterable){
      if(iterable != undefined)forOf(iterable, isMap, that[ADDER], that);
      return that;
    }
    function fixSVZ(key, chain){
      var method = proto[key];
      if(framework)proto[key] = function(a, b){
        var result = method.call(this, a === 0 ? 0 : a, b);
        return chain ? this : result;
      };
    }
    if(!isNative(C) || !(isWeak || (!BUGGY_ITERATORS && has(proto, FOR_EACH) && has(proto, 'entries')))){
      // create collection constructor
      C = isWeak
        ? function(iterable){
            assertInstance(this, C, NAME);
            set(this, UID, uid++);
            initFromIterable(this, iterable);
          }
        : function(iterable){
            var that = this;
            assertInstance(that, C, NAME);
            set(that, O1, create(null));
            set(that, SIZE, 0);
            set(that, LAST, undefined);
            set(that, FIRST, undefined);
            initFromIterable(that, iterable);
          };
      assignHidden(assignHidden(C[PROTOTYPE], methods), commonMethods);
      isWeak || !DESC || defineProperty(C[PROTOTYPE], 'size', {get: function(){
        return assertDefined(this[SIZE]);
      }});
    } else {
      var Native = C
        , inst   = new C
        , chain  = inst[ADDER](isWeak ? {} : -0, 1)
        , buggyZero;
      // wrap to init collections from iterable
      if(checkDangerIterClosing(function(O){ new C(O) })){
        C = function(iterable){
          assertInstance(this, C, NAME);
          return initFromIterable(new Native, iterable);
        }
        C[PROTOTYPE] = proto;
        if(framework)proto[CONSTRUCTOR] = C;
      }
      isWeak || inst[FOR_EACH](function(val, key){
        buggyZero = 1 / key === -Infinity;
      });
      // fix converting -0 key to +0
      if(buggyZero){
        fixSVZ('delete');
        fixSVZ('has');
        isMap && fixSVZ('get');
      }
      // + fix .add & .set for chaining
      if(buggyZero || chain !== inst)fixSVZ(ADDER, true);
    }
    setToStringTag(C, NAME);
    setSpecies(C);
    
    O[NAME] = C;
    $define(GLOBAL + WRAP + FORCED * !isNative(C), O);
    
    // add .keys, .values, .entries, [@@iterator]
    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
    isWeak || defineStdIterators(C, NAME, function(iterated, kind){
      set(this, ITER, {o: iterated, k: kind});
    }, function(){
      var iter  = this[ITER]
        , kind  = iter.k
        , entry = iter.l;
      // revert to the last existing entry
      while(entry && entry.r)entry = entry.p;
      // get next entry
      if(!iter.o || !(iter.l = entry = entry ? entry.n : iter.o[FIRST])){
        // or finish the iteration
        iter.o = undefined;
        return iterResult(1);
      }
      // return step by kind
      if(kind == KEY)  return iterResult(0, entry.k);
      if(kind == VALUE)return iterResult(0, entry.v);
                       return iterResult(0, [entry.k, entry.v]);   
    }, isMap ? KEY+VALUE : VALUE, !isMap);
    
    return C;
  }
  
  function fastKey(it, create){
    // return primitive with prefix
    if(!isObject(it))return (typeof it == 'string' ? 'S' : 'P') + it;
    // can't set id to frozen object
    if(isFrozen(it))return 'F';
    if(!has(it, UID)){
      // not necessary to add id
      if(!create)return 'E';
      // add missing object id
      hidden(it, UID, ++uid);
    // return object id with prefix
    } return 'O' + it[UID];
  }
  function getEntry(that, key){
    // fast case
    var index = fastKey(key), entry;
    if(index != 'F')return that[O1][index];
    // frozen object case
    for(entry = that[FIRST]; entry; entry = entry.n){
      if(entry.k == key)return entry;
    }
  }
  function def(that, key, value){
    var entry = getEntry(that, key)
      , prev, index;
    // change existing entry
    if(entry)entry.v = value;
    // create new entry
    else {
      that[LAST] = entry = {
        i: index = fastKey(key, true), // <- index
        k: key,                        // <- key
        v: value,                      // <- value
        p: prev = that[LAST],          // <- previous entry
        n: undefined,                  // <- next entry
        r: false                       // <- removed
      };
      if(!that[FIRST])that[FIRST] = entry;
      if(prev)prev.n = entry;
      that[SIZE]++;
      // add to index
      if(index != 'F')that[O1][index] = entry;
    } return that;
  }

  var collectionMethods = {
    // 23.1.3.1 Map.prototype.clear()
    // 23.2.3.2 Set.prototype.clear()
    clear: function(){
      for(var that = this, data = that[O1], entry = that[FIRST]; entry; entry = entry.n){
        entry.r = true;
        if(entry.p)entry.p = entry.p.n = undefined;
        delete data[entry.i];
      }
      that[FIRST] = that[LAST] = undefined;
      that[SIZE] = 0;
    },
    // 23.1.3.3 Map.prototype.delete(key)
    // 23.2.3.4 Set.prototype.delete(value)
    'delete': function(key){
      var that  = this
        , entry = getEntry(that, key);
      if(entry){
        var next = entry.n
          , prev = entry.p;
        delete that[O1][entry.i];
        entry.r = true;
        if(prev)prev.n = next;
        if(next)next.p = prev;
        if(that[FIRST] == entry)that[FIRST] = next;
        if(that[LAST] == entry)that[LAST] = prev;
        that[SIZE]--;
      } return !!entry;
    },
    // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
    // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
    forEach: function(callbackfn /*, that = undefined */){
      var f = ctx(callbackfn, arguments[1], 3)
        , entry;
      while(entry = entry ? entry.n : this[FIRST]){
        f(entry.v, entry.k, this);
        // revert to the last existing entry
        while(entry && entry.r)entry = entry.p;
      }
    },
    // 23.1.3.7 Map.prototype.has(key)
    // 23.2.3.7 Set.prototype.has(value)
    has: function(key){
      return !!getEntry(this, key);
    }
  }
  
  // 23.1 Map Objects
  Map = getCollection(Map, MAP, {
    // 23.1.3.6 Map.prototype.get(key)
    get: function(key){
      var entry = getEntry(this, key);
      return entry && entry.v;
    },
    // 23.1.3.9 Map.prototype.set(key, value)
    set: function(key, value){
      return def(this, key === 0 ? 0 : key, value);
    }
  }, collectionMethods, true);
  
  // 23.2 Set Objects
  Set = getCollection(Set, SET, {
    // 23.2.3.1 Set.prototype.add(value)
    add: function(value){
      return def(this, value = value === 0 ? 0 : value, value);
    }
  }, collectionMethods);
  
  function defWeak(that, key, value){
    if(isFrozen(assertObject(key)))leakStore(that).set(key, value);
    else {
      has(key, WEAK) || hidden(key, WEAK, {});
      key[WEAK][that[UID]] = value;
    } return that;
  }
  function leakStore(that){
    return that[LEAK] || hidden(that, LEAK, new Map)[LEAK];
  }
  
  var weakMethods = {
    // 23.3.3.2 WeakMap.prototype.delete(key)
    // 23.4.3.3 WeakSet.prototype.delete(value)
    'delete': function(key){
      if(!isObject(key))return false;
      if(isFrozen(key))return leakStore(this)['delete'](key);
      return has(key, WEAK) && has(key[WEAK], this[UID]) && delete key[WEAK][this[UID]];
    },
    // 23.3.3.4 WeakMap.prototype.has(key)
    // 23.4.3.4 WeakSet.prototype.has(value)
    has: function(key){
      if(!isObject(key))return false;
      if(isFrozen(key))return leakStore(this).has(key);
      return has(key, WEAK) && has(key[WEAK], this[UID]);
    }
  };
  
  // 23.3 WeakMap Objects
  WeakMap = getCollection(WeakMap, WEAKMAP, {
    // 23.3.3.3 WeakMap.prototype.get(key)
    get: function(key){
      if(isObject(key)){
        if(isFrozen(key))return leakStore(this).get(key);
        if(has(key, WEAK))return key[WEAK][this[UID]];
      }
    },
    // 23.3.3.5 WeakMap.prototype.set(key, value)
    set: function(key, value){
      return defWeak(this, key, value);
    }
  }, weakMethods, true, true);
  
  // IE11 WeakMap frozen keys fix
  if(framework && new WeakMap().set(Object.freeze(tmp), 7).get(tmp) != 7){
    forEach.call(array('delete,has,get,set'), function(key){
      var method = WeakMap[PROTOTYPE][key];
      WeakMap[PROTOTYPE][key] = function(a, b){
        // store frozen objects on leaky map
        if(isObject(a) && isFrozen(a)){
          var result = leakStore(this)[key](a, b);
          return key == 'set' ? this : result;
        // store all the rest on native weakmap
        } return method.call(this, a, b);
      };
    });
  }
  
  // 23.4 WeakSet Objects
  WeakSet = getCollection(WeakSet, WEAKSET, {
    // 23.4.3.1 WeakSet.prototype.add(value)
    add: function(value){
      return defWeak(this, value, true);
    }
  }, weakMethods, false, true);
}();

/******************************************************************************
 * Module : es6.reflect                                                       *
 ******************************************************************************/

!function(){
  function Enumerate(iterated){
    var keys = [], key;
    for(key in iterated)keys.push(key);
    set(this, ITER, {o: iterated, a: keys, i: 0});
  }
  createIterator(Enumerate, OBJECT, function(){
    var iter = this[ITER]
      , keys = iter.a
      , key;
    do {
      if(iter.i >= keys.length)return iterResult(1);
    } while(!((key = keys[iter.i++]) in iter.o));
    return iterResult(0, key);
  });
  
  function wrap(fn){
    return function(it){
      assertObject(it);
      try {
        return fn.apply(undefined, arguments), true;
      } catch(e){
        return false;
      }
    }
  }
  
  function reflectGet(target, propertyKey/*, receiver*/){
    var receiver = arguments.length < 3 ? target : arguments[2]
      , desc = getOwnDescriptor(assertObject(target), propertyKey), proto;
    if(desc)return has(desc, 'value')
      ? desc.value
      : desc.get === undefined
        ? undefined
        : desc.get.call(receiver);
    return isObject(proto = getPrototypeOf(target))
      ? reflectGet(proto, propertyKey, receiver)
      : undefined;
  }
  function reflectSet(target, propertyKey, V/*, receiver*/){
    var receiver = arguments.length < 4 ? target : arguments[3]
      , ownDesc  = getOwnDescriptor(assertObject(target), propertyKey)
      , existingDescriptor, proto;
    if(!ownDesc){
      if(isObject(proto = getPrototypeOf(target))){
        return reflectSet(proto, propertyKey, V, receiver);
      }
      ownDesc = descriptor(0);
    }
    if(has(ownDesc, 'value')){
      if(ownDesc.writable === false || !isObject(receiver))return false;
      existingDescriptor = getOwnDescriptor(receiver, propertyKey) || descriptor(0);
      existingDescriptor.value = V;
      return defineProperty(receiver, propertyKey, existingDescriptor), true;
    }
    return ownDesc.set === undefined
      ? false
      : (ownDesc.set.call(receiver, V), true);
  }
  var isExtensible = Object.isExtensible || returnIt;
  
  var reflect = {
    // 26.1.1 Reflect.apply(target, thisArgument, argumentsList)
    apply: ctx(call, apply, 3),
    // 26.1.2 Reflect.construct(target, argumentsList [, newTarget])
    construct: function(target, argumentsList /*, newTarget*/){
      var proto    = assertFunction(arguments.length < 3 ? target : arguments[2])[PROTOTYPE]
        , instance = create(isObject(proto) ? proto : ObjectProto)
        , result   = apply.call(target, instance, argumentsList);
      return isObject(result) ? result : instance;
    },
    // 26.1.3 Reflect.defineProperty(target, propertyKey, attributes)
    defineProperty: wrap(defineProperty),
    // 26.1.4 Reflect.deleteProperty(target, propertyKey)
    deleteProperty: function(target, propertyKey){
      var desc = getOwnDescriptor(assertObject(target), propertyKey);
      return desc && !desc.configurable ? false : delete target[propertyKey];
    },
    // 26.1.5 Reflect.enumerate(target)
    enumerate: function(target){
      return new Enumerate(assertObject(target));
    },
    // 26.1.6 Reflect.get(target, propertyKey [, receiver])
    get: reflectGet,
    // 26.1.7 Reflect.getOwnPropertyDescriptor(target, propertyKey)
    getOwnPropertyDescriptor: function(target, propertyKey){
      return getOwnDescriptor(assertObject(target), propertyKey);
    },
    // 26.1.8 Reflect.getPrototypeOf(target)
    getPrototypeOf: function(target){
      return getPrototypeOf(assertObject(target));
    },
    // 26.1.9 Reflect.has(target, propertyKey)
    has: function(target, propertyKey){
      return propertyKey in target;
    },
    // 26.1.10 Reflect.isExtensible(target)
    isExtensible: function(target){
      return !!isExtensible(assertObject(target));
    },
    // 26.1.11 Reflect.ownKeys(target)
    ownKeys: ownKeys,
    // 26.1.12 Reflect.preventExtensions(target)
    preventExtensions: wrap(Object.preventExtensions || returnIt),
    // 26.1.13 Reflect.set(target, propertyKey, V [, receiver])
    set: reflectSet
  }
  // 26.1.14 Reflect.setPrototypeOf(target, proto)
  if(setPrototypeOf)reflect.setPrototypeOf = function(target, proto){
    return setPrototypeOf(assertObject(target), proto), true;
  };
  
  $define(GLOBAL, {Reflect: {}});
  $define(STATIC, 'Reflect', reflect);
}();

/******************************************************************************
 * Module : es7.proposals                                                     *
 ******************************************************************************/

!function(){
  $define(PROTO, ARRAY, {
    // https://github.com/domenic/Array.prototype.includes
    includes: createArrayContains(true)
  });
  $define(PROTO, STRING, {
    // https://github.com/mathiasbynens/String.prototype.at
    at: createPointAt(true)
  });
  
  function createObjectToArray(isEntries){
    return function(object){
      var O      = toObject(object)
        , keys   = getKeys(object)
        , length = keys.length
        , i      = 0
        , result = Array(length)
        , key;
      if(isEntries)while(length > i)result[i] = [key = keys[i++], O[key]];
      else while(length > i)result[i] = O[keys[i++]];
      return result;
    }
  }
  $define(STATIC, OBJECT, {
    // https://gist.github.com/WebReflection/9353781
    getOwnPropertyDescriptors: function(object){
      var O      = toObject(object)
        , result = {};
      forEach.call(ownKeys(O), function(key){
        defineProperty(result, key, descriptor(0, getOwnDescriptor(O, key)));
      });
      return result;
    },
    // https://github.com/rwaldron/tc39-notes/blob/master/es6/2014-04/apr-9.md#51-objectentries-objectvalues
    values:  createObjectToArray(false),
    entries: createObjectToArray(true)
  });
  $define(STATIC, REGEXP, {
    // https://gist.github.com/kangax/9698100
    escape: createReplacer(/([\\\-[\]{}()*+?.,^$|])/g, '\\$1', true)
  });
}();

/******************************************************************************
 * Module : es7.abstract-refs                                                 *
 ******************************************************************************/

// https://github.com/zenparsing/es-abstract-refs
!function(REFERENCE){
  REFERENCE_GET = getWellKnownSymbol(REFERENCE+'Get', true);
  var REFERENCE_SET = getWellKnownSymbol(REFERENCE+SET, true)
    , REFERENCE_DELETE = getWellKnownSymbol(REFERENCE+'Delete', true);
  
  $define(STATIC, SYMBOL, {
    referenceGet: REFERENCE_GET,
    referenceSet: REFERENCE_SET,
    referenceDelete: REFERENCE_DELETE
  });
  
  hidden(FunctionProto, REFERENCE_GET, returnThis);
  
  function setMapMethods(Constructor){
    if(Constructor){
      var MapProto = Constructor[PROTOTYPE];
      hidden(MapProto, REFERENCE_GET, MapProto.get);
      hidden(MapProto, REFERENCE_SET, MapProto.set);
      hidden(MapProto, REFERENCE_DELETE, MapProto['delete']);
    }
  }
  setMapMethods(Map);
  setMapMethods(WeakMap);
}('reference');

/******************************************************************************
 * Module : core.dict                                                         *
 ******************************************************************************/

!function(DICT){
  Dict = function(iterable){
    var dict = create(null);
    if(iterable != undefined){
      if(isIterable(iterable)){
        forOf(iterable, true, function(key, value){
          dict[key] = value;
        });
      } else assign(dict, iterable);
    }
    return dict;
  }
  Dict[PROTOTYPE] = null;
  
  function DictIterator(iterated, kind){
    set(this, ITER, {o: toObject(iterated), a: getKeys(iterated), i: 0, k: kind});
  }
  createIterator(DictIterator, DICT, function(){
    var iter = this[ITER]
      , O    = iter.o
      , keys = iter.a
      , kind = iter.k
      , key;
    do {
      if(iter.i >= keys.length){
        iter.o = undefined;
        return iterResult(1);
      }
    } while(!has(O, key = keys[iter.i++]));
    if(kind == KEY)  return iterResult(0, key);
    if(kind == VALUE)return iterResult(0, O[key]);
                     return iterResult(0, [key, O[key]]);
  });
  function createDictIter(kind){
    return function(it){
      return new DictIterator(it, kind);
    }
  }
  
  /*
   * 0 -> forEach
   * 1 -> map
   * 2 -> filter
   * 3 -> some
   * 4 -> every
   * 5 -> find
   * 6 -> findKey
   * 7 -> mapPairs
   */
  function createDictMethod(type){
    var isMap    = type == 1
      , isEvery  = type == 4;
    return function(object, callbackfn, that /* = undefined */){
      var f      = ctx(callbackfn, that, 3)
        , O      = toObject(object)
        , result = isMap || type == 7 || type == 2 ? new (generic(this, Dict)) : undefined
        , key, val, res;
      for(key in O)if(has(O, key)){
        val = O[key];
        res = f(val, key, object);
        if(type){
          if(isMap)result[key] = res;             // map
          else if(res)switch(type){
            case 2: result[key] = val; break      // filter
            case 3: return true;                  // some
            case 5: return val;                   // find
            case 6: return key;                   // findKey
            case 7: result[res[0]] = res[1];      // mapPairs
          } else if(isEvery)return false;         // every
        }
      }
      return type == 3 || isEvery ? isEvery : result;
    }
  }
  function createDictReduce(isTurn){
    return function(object, mapfn, init){
      assertFunction(mapfn);
      var O      = toObject(object)
        , keys   = getKeys(O)
        , length = keys.length
        , i      = 0
        , memo, key, result;
      if(isTurn)memo = init == undefined ? new (generic(this, Dict)) : Object(init);
      else if(arguments.length < 3){
        assert(length, REDUCE_ERROR);
        memo = O[keys[i++]];
      } else memo = Object(init);
      while(length > i)if(has(O, key = keys[i++])){
        result = mapfn(memo, O[key], key, object);
        if(isTurn){
          if(result === false)break;
        } else memo = result;
      }
      return memo;
    }
  }
  var findKey = createDictMethod(6);
  function includes(object, el){
    return (el == el ? keyOf(object, el) : findKey(object, sameNaN)) !== undefined;
  }
  
  var dictMethods = {
    keys:    createDictIter(KEY),
    values:  createDictIter(VALUE),
    entries: createDictIter(KEY+VALUE),
    forEach: createDictMethod(0),
    map:     createDictMethod(1),
    filter:  createDictMethod(2),
    some:    createDictMethod(3),
    every:   createDictMethod(4),
    find:    createDictMethod(5),
    findKey: findKey,
    mapPairs:createDictMethod(7),
    reduce:  createDictReduce(false),
    turn:    createDictReduce(true),
    keyOf:   keyOf,
    includes:includes,
    // Has / get / set own property
    has: has,
    get: get,
    set: createDefiner(0),
    isDict: function(it){
      return isObject(it) && getPrototypeOf(it) === Dict[PROTOTYPE];
    }
  };
  
  if(REFERENCE_GET)for(var key in dictMethods)!function(fn){
    function method(){
      for(var args = [this], i = 0; i < arguments.length;)args.push(arguments[i++]);
      return invoke(fn, args);
    }
    fn[REFERENCE_GET] = function(){
      return method;
    }
  }(dictMethods[key]);
  
  $define(GLOBAL + FORCED, {Dict: assignHidden(Dict, dictMethods)});
}('Dict');

/******************************************************************************
 * Module : core.$for                                                         *
 ******************************************************************************/

!function(ENTRIES, FN){  
  function $for(iterable, entries){
    if(!(this instanceof $for))return new $for(iterable, entries);
    this[ITER]    = getIterator(iterable);
    this[ENTRIES] = !!entries;
  }
  
  createIterator($for, 'Wrapper', function(){
    return this[ITER].next();
  });
  var $forProto = $for[PROTOTYPE];
  setIterator($forProto, function(){
    return this[ITER]; // unwrap
  });
  
  function createChainIterator(next){
    function Iter(I, fn, that){
      this[ITER]    = getIterator(I);
      this[ENTRIES] = I[ENTRIES];
      this[FN]      = ctx(fn, that, I[ENTRIES] ? 2 : 1);
    }
    createIterator(Iter, 'Chain', next, $forProto);
    setIterator(Iter[PROTOTYPE], returnThis); // override $forProto iterator
    return Iter;
  }
  
  var MapIter = createChainIterator(function(){
    var step = this[ITER].next();
    return step.done ? step : iterResult(0, stepCall(this[FN], step.value, this[ENTRIES]));
  });
  
  var FilterIter = createChainIterator(function(){
    for(;;){
      var step = this[ITER].next();
      if(step.done || stepCall(this[FN], step.value, this[ENTRIES]))return step;
    }
  });
  
  assignHidden($forProto, {
    of: function(fn, that){
      forOf(this, this[ENTRIES], fn, that);
    },
    array: function(fn, that){
      var result = [];
      forOf(fn != undefined ? this.map(fn, that) : this, false, push, result);
      return result;
    },
    filter: function(fn, that){
      return new FilterIter(this, fn, that);
    },
    map: function(fn, that){
      return new MapIter(this, fn, that);
    }
  });
  
  $for.isIterable  = isIterable;
  $for.getIterator = getIterator;
  
  $define(GLOBAL + FORCED, {$for: $for});
}('entries', safeSymbol('fn'));

/******************************************************************************
 * Module : core.delay                                                        *
 ******************************************************************************/

// https://esdiscuss.org/topic/promise-returning-delay-function
$define(GLOBAL + FORCED, {
  delay: function(time){
    return new Promise(function(resolve){
      setTimeout(resolve, time, true);
    });
  }
});

/******************************************************************************
 * Module : core.binding                                                      *
 ******************************************************************************/

!function(_, toLocaleString){
  // Placeholder
  core._ = path._ = path._ || {};

  $define(PROTO + FORCED, FUNCTION, {
    part: part,
    only: function(numberArguments, that /* = @ */){
      var fn     = assertFunction(this)
        , n      = toLength(numberArguments)
        , isThat = arguments.length > 1;
      return function(/* ...args */){
        var length = min(n, arguments.length)
          , args   = Array(length)
          , i      = 0;
        while(length > i)args[i] = arguments[i++];
        return invoke(fn, args, isThat ? that : this);
      }
    }
  });
  
  function tie(key){
    var that  = this
      , bound = {};
    return hidden(that, _, function(key){
      if(key === undefined || !(key in that))return toLocaleString.call(that);
      return has(bound, key) ? bound[key] : (bound[key] = ctx(that[key], that, -1));
    })[_](key);
  }
  
  hidden(path._, TO_STRING, function(){
    return _;
  });
  
  hidden(ObjectProto, _, tie);
  DESC || hidden(ArrayProto, _, tie);
  // IE8- dirty hack - redefined toLocaleString is not enumerable
}(DESC ? uid('tie') : TO_LOCALE, ObjectProto[TO_LOCALE]);

/******************************************************************************
 * Module : core.object                                                       *
 ******************************************************************************/

!function(){
  function define(target, mixin){
    var keys   = ownKeys(toObject(mixin))
      , length = keys.length
      , i = 0, key;
    while(length > i)defineProperty(target, key = keys[i++], getOwnDescriptor(mixin, key));
    return target;
  };
  $define(STATIC + FORCED, OBJECT, {
    isObject: isObject,
    classof: classof,
    define: define,
    make: function(proto, mixin){
      return define(create(proto), mixin);
    }
  });
}();

/******************************************************************************
 * Module : core.array                                                        *
 ******************************************************************************/

$define(PROTO + FORCED, ARRAY, {
  turn: function(fn, target /* = [] */){
    assertFunction(fn);
    var memo   = target == undefined ? [] : Object(target)
      , O      = ES5Object(this)
      , length = toLength(O.length)
      , index  = 0;
    while(length > index)if(fn(memo, O[index], index++, this) === false)break;
    return memo;
  }
});
if(framework)ArrayUnscopables.turn = true;

/******************************************************************************
 * Module : core.number                                                       *
 ******************************************************************************/

!function(numberMethods){  
  function NumberIterator(iterated){
    set(this, ITER, {l: toLength(iterated), i: 0});
  }
  createIterator(NumberIterator, NUMBER, function(){
    var iter = this[ITER]
      , i    = iter.i++;
    return i < iter.l ? iterResult(0, i) : iterResult(1);
  });
  defineIterator(Number, NUMBER, function(){
    return new NumberIterator(this);
  });
  
  numberMethods.random = function(lim /* = 0 */){
    var a = +this
      , b = lim == undefined ? 0 : +lim
      , m = min(a, b);
    return random() * (max(a, b) - m) + m;
  };

  forEach.call(array(
      // ES3:
      'round,floor,ceil,abs,sin,asin,cos,acos,tan,atan,exp,sqrt,max,min,pow,atan2,' +
      // ES6:
      'acosh,asinh,atanh,cbrt,clz32,cosh,expm1,hypot,imul,log1p,log10,log2,sign,sinh,tanh,trunc'
    ), function(key){
      var fn = Math[key];
      if(fn)numberMethods[key] = function(/* ...args */){
        // ie9- dont support strict mode & convert `this` to object -> convert it to number
        var args = [+this]
          , i    = 0;
        while(arguments.length > i)args.push(arguments[i++]);
        return invoke(fn, args);
      }
    }
  );
  
  $define(PROTO + FORCED, NUMBER, numberMethods);
}({});

/******************************************************************************
 * Module : core.string                                                       *
 ******************************************************************************/

!function(){
  var escapeHTMLDict = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;'
  }, unescapeHTMLDict = {}, key;
  for(key in escapeHTMLDict)unescapeHTMLDict[escapeHTMLDict[key]] = key;
  $define(PROTO + FORCED, STRING, {
    escapeHTML:   createReplacer(/[&<>"']/g, escapeHTMLDict),
    unescapeHTML: createReplacer(/&(?:amp|lt|gt|quot|apos);/g, unescapeHTMLDict)
  });
}();

/******************************************************************************
 * Module : core.date                                                         *
 ******************************************************************************/

!function(formatRegExp, flexioRegExp, locales, current, SECONDS, MINUTES, HOURS, MONTH, YEAR){
  function createFormat(prefix){
    return function(template, locale /* = current */){
      var that = this
        , dict = locales[has(locales, locale) ? locale : current];
      function get(unit){
        return that[prefix + unit]();
      }
      return String(template).replace(formatRegExp, function(part){
        switch(part){
          case 's'  : return get(SECONDS);                  // Seconds : 0-59
          case 'ss' : return lz(get(SECONDS));              // Seconds : 00-59
          case 'm'  : return get(MINUTES);                  // Minutes : 0-59
          case 'mm' : return lz(get(MINUTES));              // Minutes : 00-59
          case 'h'  : return get(HOURS);                    // Hours   : 0-23
          case 'hh' : return lz(get(HOURS));                // Hours   : 00-23
          case 'D'  : return get(DATE);                     // Date    : 1-31
          case 'DD' : return lz(get(DATE));                 // Date    : 01-31
          case 'W'  : return dict[0][get('Day')];           // Day     : Понедельник
          case 'N'  : return get(MONTH) + 1;                // Month   : 1-12
          case 'NN' : return lz(get(MONTH) + 1);            // Month   : 01-12
          case 'M'  : return dict[2][get(MONTH)];           // Month   : Январь
          case 'MM' : return dict[1][get(MONTH)];           // Month   : Января
          case 'Y'  : return get(YEAR);                     // Year    : 2014
          case 'YY' : return lz(get(YEAR) % 100);           // Year    : 14
        } return part;
      });
    }
  }
  function addLocale(lang, locale){
    function split(index){
      var result = [];
      forEach.call(array(locale.months), function(it){
        result.push(it.replace(flexioRegExp, '$' + index));
      });
      return result;
    }
    locales[lang] = [array(locale.weekdays), split(1), split(2)];
    return core;
  }
  $define(PROTO + FORCED, DATE, {
    format:    createFormat('get'),
    formatUTC: createFormat('getUTC')
  });
  addLocale(current, {
    weekdays: 'Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
    months: 'January,February,March,April,May,June,July,August,September,October,November,December'
  });
  addLocale('ru', {
    weekdays: 'Воскресенье,Понедельник,Вторник,Среда,Четверг,Пятница,Суббота',
    months: 'Январ:я|ь,Феврал:я|ь,Март:а|,Апрел:я|ь,Ма:я|й,Июн:я|ь,' +
            'Июл:я|ь,Август:а|,Сентябр:я|ь,Октябр:я|ь,Ноябр:я|ь,Декабр:я|ь'
  });
  core.locale = function(locale){
    return has(locales, locale) ? current = locale : current;
  };
  core.addLocale = addLocale;
}(/\b\w\w?\b/g, /:(.*)\|(.*)$/, {}, 'en', 'Seconds', 'Minutes', 'Hours', 'Month', 'FullYear');

/******************************************************************************
 * Module : core.global                                                       *
 ******************************************************************************/

$define(GLOBAL + FORCED, {global: global});

/******************************************************************************
 * Module : js.array.statics                                                  *
 ******************************************************************************/

// JavaScript 1.6 / Strawman array statics shim
!function(arrayStatics){
  function setArrayStatics(keys, length){
    forEach.call(array(keys), function(key){
      if(key in ArrayProto)arrayStatics[key] = ctx(call, ArrayProto[key], length);
    });
  }
  setArrayStatics('pop,reverse,shift,keys,values,entries', 1);
  setArrayStatics('indexOf,every,some,forEach,map,filter,find,findIndex,includes', 3);
  setArrayStatics('join,slice,concat,push,splice,unshift,sort,lastIndexOf,' +
                  'reduce,reduceRight,copyWithin,fill,turn');
  $define(STATIC, ARRAY, arrayStatics);
}({});

/******************************************************************************
 * Module : web.dom.itarable                                                  *
 ******************************************************************************/

!function(NodeList){
  if(framework && NodeList && !(SYMBOL_ITERATOR in NodeList[PROTOTYPE])){
    hidden(NodeList[PROTOTYPE], SYMBOL_ITERATOR, Iterators[ARRAY]);
  }
  Iterators.NodeList = Iterators[ARRAY];
}(global.NodeList);

/******************************************************************************
 * Module : core.log                                                          *
 ******************************************************************************/

!function(log, enabled){
  // Methods from https://github.com/DeveloperToolsWG/console-object/blob/master/api.md
  forEach.call(array('assert,clear,count,debug,dir,dirxml,error,exception,' +
      'group,groupCollapsed,groupEnd,info,isIndependentlyComposed,log,' +
      'markTimeline,profile,profileEnd,table,time,timeEnd,timeline,' +
      'timelineEnd,timeStamp,trace,warn'), function(key){
    log[key] = function(){
      if(enabled && key in console)return apply.call(console[key], console, arguments);
    };
  });
  $define(GLOBAL + FORCED, {log: assign(log.log, log, {
    enable: function(){
      enabled = true;
    },
    disable: function(){
      enabled = false;
    }
  })});
}({}, true);
}(typeof self != 'undefined' && self.Math === Math ? self : Function('return this')(), false);
module.exports = { "default": module.exports, __esModule: true };

},{}],"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/helpers/class-call-check.js":[function(require,module,exports){
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
    for (var key in props) {
      var prop = props[key];
      prop.configurable = true;
      if (prop.value) prop.writable = true;
    }

    Object.defineProperties(target, props);
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

var _core = require("babel-runtime/core-js")["default"];

exports["default"] = _core.Object.assign || function (target) {
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
},{"babel-runtime/core-js":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/core-js.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/babel-runtime/helpers/inherits.js":[function(require,module,exports){
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
},{}],"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/browser-resolve/empty.js":[function(require,module,exports){

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
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192 // not used by this implementation

var kMaxLength = 0x3fffffff

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
    return 42 === arr.foo() && // typed array instances can be augmented
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
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Find the length
  var length
  if (type === 'number')
    length = subject > 0 ? subject >>> 0 : 0
  else if (type === 'string') {
    if (encoding === 'base64')
      subject = base64clean(subject)
    length = Buffer.byteLength(subject, encoding)
  } else if (type === 'object' && subject !== null) { // assume object is array-like
    if (subject.type === 'Buffer' && isArray(subject.data))
      subject = subject.data
    length = +subject.length > 0 ? Math.floor(+subject.length) : 0
  } else
    throw new TypeError('must start with number, buffer, array or string')

  if (this.length > kMaxLength)
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
      'size: 0x' + kMaxLength.toString(16) + ' bytes')

  var buf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer.TYPED_ARRAY_SUPPORT && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    if (Buffer.isBuffer(subject)) {
      for (i = 0; i < length; i++)
        buf[i] = subject.readUInt8(i)
    } else {
      for (i = 0; i < length; i++)
        buf[i] = ((subject[i] % 256) + 256) % 256
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer.TYPED_ARRAY_SUPPORT && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

Buffer.isBuffer = function (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b))
    throw new TypeError('Arguments must be Buffers')

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

Buffer.isEncoding = function (encoding) {
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

Buffer.concat = function (list, totalLength) {
  if (!isArray(list)) throw new TypeError('Usage: Buffer.concat(list[, length])')

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

Buffer.byteLength = function (str, encoding) {
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
Buffer.prototype.toString = function (encoding, start, end) {
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
        if (loweredCase)
          throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.equals = function (b) {
  if(!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max)
      str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  return Buffer.compare(this, b)
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
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
    var byte = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(byte)) throw new Error('Invalid hex string')
    buf[offset + i] = byte
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf8ToBytes(string), buf, offset, length)
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
  var charsWritten = blitBuffer(utf16leToBytes(string), buf, offset, length, 2)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
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

Buffer.prototype.toJSON = function () {
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
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function binarySlice (buf, start, end) {
  return asciiSlice(buf, start, end)
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

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len;
    if (start < 0)
      start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0)
      end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start)
    end = start

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    return Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0)
    throw new RangeError('offset is not uint')
  if (offset + ext > length)
    throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
      ((this[offset + 1] << 16) |
      (this[offset + 2] << 8) |
      this[offset + 3])
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80))
    return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16) |
      (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
      (this[offset + 1] << 16) |
      (this[offset + 2] << 8) |
      (this[offset + 3])
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
  if (value > max || value < min) throw new TypeError('value is out of bounds')
  if (offset + ext > buf.length) throw new TypeError('index out of range')
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 1, 0xff, 0)
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

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else objectWriteUInt16(this, value, offset, true)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else objectWriteUInt16(this, value, offset, false)
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = value
  } else objectWriteUInt32(this, value, offset, true)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else objectWriteUInt32(this, value, offset, false)
  return offset + 4
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = value
  return offset + 1
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else objectWriteUInt16(this, value, offset, true)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else objectWriteUInt16(this, value, offset, false)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else objectWriteUInt32(this, value, offset, true)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else objectWriteUInt32(this, value, offset, false)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (value > max || value < min) throw new TypeError('value is out of bounds')
  if (offset + ext > buf.length) throw new TypeError('index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert)
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert)
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  if (end < start) throw new TypeError('sourceEnd < sourceStart')
  if (target_start < 0 || target_start >= target.length)
    throw new TypeError('targetStart out of bounds')
  if (start < 0 || start >= source.length) throw new TypeError('sourceStart out of bounds')
  if (end < 0 || end > source.length) throw new TypeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < len; i++) {
      target[i + target_start] = this[i + start]
    }
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (end < start) throw new TypeError('end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  if (start < 0 || start >= this.length) throw new TypeError('start out of bounds')
  if (end < 0 || end > this.length) throw new TypeError('end out of bounds')

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
Buffer.prototype.toArrayBuffer = function () {
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
Buffer._augment = function (arr) {
  arr.constructor = Buffer
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
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
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
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
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
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

var INVALID_BASE64_RE = /[^+\/0-9A-z]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
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

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F) {
      byteArray.push(b)
    } else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++) {
        byteArray.push(parseInt(h[j], 16))
      }
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length, unitSize) {
  if (unitSize) length -= length % unitSize;
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
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

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS)
			return 62 // '+'
		if (code === SLASH)
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

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canMutationObserver = typeof window !== 'undefined'
    && window.MutationObserver;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    var queue = [];

    if (canMutationObserver) {
        var hiddenDiv = document.createElement("div");
        var observer = new MutationObserver(function () {
            var queueList = queue.slice();
            queue.length = 0;
            queueList.forEach(function (fn) {
                fn();
            });
        });

        observer.observe(hiddenDiv, { attributes: true });

        return function nextTick(fn) {
            if (!queue.length) {
                hiddenDiv.setAttribute('yes', 'no');
            }
            queue.push(fn);
        };
    }

    if (canPost) {
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

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

util.inherits(Readable, Stream);

function ReadableState(options, stream) {
  options = options || {};

  // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"
  var hwm = options.highWaterMark;
  this.highWaterMark = (hwm || hwm === 0) ? hwm : 16 * 1024;

  // cast to ints.
  this.highWaterMark = ~~this.highWaterMark;

  this.buffer = [];
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = false;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false;

  // In streams that never have any data, and do push(null) right away,
  // the consumer can miss the 'end' event if they do some I/O before
  // consuming the stream.  So, we don't emit('end') until some reading
  // happens.
  this.calledRead = false;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, becuase any
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

  if (typeof chunk === 'string' && !state.objectMode) {
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
  } else if (chunk === null || chunk === undefined) {
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

      // update the buffer info.
      state.length += state.objectMode ? 1 : chunk.length;
      if (addToFront) {
        state.buffer.unshift(chunk);
      } else {
        state.reading = false;
        state.buffer.push(chunk);
      }

      if (state.needReadable)
        emitReadable(stream);

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

  if (n === null || isNaN(n)) {
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
  var state = this._readableState;
  state.calledRead = true;
  var nOrig = n;
  var ret;

  if (typeof n !== 'number' || n > 0)
    state.emittedReadable = false;

  // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.
  if (n === 0 &&
      state.needReadable &&
      (state.length >= state.highWaterMark || state.ended)) {
    emitReadable(this);
    return null;
  }

  n = howMuchToRead(n, state);

  // if we've ended, and we're now clear, then finish it up.
  if (n === 0 && state.ended) {
    ret = null;

    // In cases where the decoder did not receive enough data
    // to produce a full chunk, then immediately received an
    // EOF, state.buffer will contain [<Buffer >, <Buffer 00 ...>].
    // howMuchToRead will see this and coerce the amount to
    // read to zero (because it's looking at the length of the
    // first <Buffer > in state.buffer), and we'll end up here.
    //
    // This can only happen via state.decoder -- no other venue
    // exists for pushing a zero-length chunk into state.buffer
    // and triggering this behavior. In this case, we return our
    // remaining data and end the stream, if appropriate.
    if (state.length > 0 && state.decoder) {
      ret = fromList(n, state);
      state.length -= ret.length;
    }

    if (state.length === 0)
      endReadable(this);

    return ret;
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

  // if we currently have less than the highWaterMark, then also read some
  if (state.length - n <= state.highWaterMark)
    doRead = true;

  // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.
  if (state.ended || state.reading)
    doRead = false;

  if (doRead) {
    state.reading = true;
    state.sync = true;
    // if the length is currently zero, then we *need* a readable event.
    if (state.length === 0)
      state.needReadable = true;
    // call internal read method
    this._read(state.highWaterMark);
    state.sync = false;
  }

  // If _read called its callback synchronously, then `reading`
  // will be false, and we need to re-evaluate how much data we
  // can return to the user.
  if (doRead && !state.reading)
    n = howMuchToRead(nOrig, state);

  if (n > 0)
    ret = fromList(n, state);
  else
    ret = null;

  if (ret === null) {
    state.needReadable = true;
    n = 0;
  }

  state.length -= n;

  // If we have nothing in the buffer, then we want to know
  // as soon as we *do* get something into the buffer.
  if (state.length === 0 && !state.ended)
    state.needReadable = true;

  // If we happened to read() exactly the remaining amount in the
  // buffer, and the EOF has been seen at this point, then make sure
  // that we emit 'end' on the very next tick.
  if (state.ended && !state.endEmitted && state.length === 0)
    endReadable(this);

  return ret;
};

function chunkInvalid(state, chunk) {
  var er = null;
  if (!Buffer.isBuffer(chunk) &&
      'string' !== typeof chunk &&
      chunk !== null &&
      chunk !== undefined &&
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

  // if we've ended and we have some data left, then emit
  // 'readable' now to make sure it gets picked up.
  if (state.length > 0)
    emitReadable(stream);
  else
    endReadable(stream);
}

// Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.
function emitReadable(stream) {
  var state = stream._readableState;
  state.needReadable = false;
  if (state.emittedReadable)
    return;

  state.emittedReadable = true;
  if (state.sync)
    process.nextTick(function() {
      emitReadable_(stream);
    });
  else
    emitReadable_(stream);
}

function emitReadable_(stream) {
  stream.emit('readable');
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
    if (readable !== src) return;
    cleanup();
  }

  function onend() {
    dest.end();
  }

  // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.
  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);

  function cleanup() {
    // cleanup event handlers once the pipe is broken
    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', cleanup);

    // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.
    if (!dest._writableState || dest._writableState.needDrain)
      ondrain();
  }

  // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.
  function onerror(er) {
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
    dest.removeListener('close', onclose);
    unpipe();
  }
  dest.once('finish', onfinish);

  function unpipe() {
    src.unpipe(dest);
  }

  // tell the dest that it's being piped to
  dest.emit('pipe', src);

  // start the flow if it hasn't been started already.
  if (!state.flowing) {
    // the handler that waits for readable events after all
    // the data gets sucked out in flow.
    // This would be easier to follow with a .once() handler
    // in flow(), but that is too slow.
    this.on('readable', pipeOnReadable);

    state.flowing = true;
    process.nextTick(function() {
      flow(src);
    });
  }

  return dest;
};

function pipeOnDrain(src) {
  return function() {
    var dest = this;
    var state = src._readableState;
    state.awaitDrain--;
    if (state.awaitDrain === 0)
      flow(src);
  };
}

function flow(src) {
  var state = src._readableState;
  var chunk;
  state.awaitDrain = 0;

  function write(dest, i, list) {
    var written = dest.write(chunk);
    if (false === written) {
      state.awaitDrain++;
    }
  }

  while (state.pipesCount && null !== (chunk = src.read())) {

    if (state.pipesCount === 1)
      write(state.pipes, 0, null);
    else
      forEach(state.pipes, write);

    src.emit('data', chunk);

    // if anyone needs a drain, then we have to wait for that.
    if (state.awaitDrain > 0)
      return;
  }

  // if every destination was unpiped, either before entering this
  // function, or in the while loop, then stop flowing.
  //
  // NB: This is a pretty rare edge case.
  if (state.pipesCount === 0) {
    state.flowing = false;

    // if there were data event listeners added, then switch to old mode.
    if (EE.listenerCount(src, 'data') > 0)
      emitDataEvents(src);
    return;
  }

  // at this point, no one needed a drain, so we just ran out of data
  // on the next readable event, start it over again.
  state.ranOut = true;
}

function pipeOnReadable() {
  if (this._readableState.ranOut) {
    this._readableState.ranOut = false;
    flow(this);
  }
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
    this.removeListener('readable', pipeOnReadable);
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
    this.removeListener('readable', pipeOnReadable);
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

  if (ev === 'data' && !this._readableState.flowing)
    emitDataEvents(this);

  if (ev === 'readable' && this.readable) {
    var state = this._readableState;
    if (!state.readableListening) {
      state.readableListening = true;
      state.emittedReadable = false;
      state.needReadable = true;
      if (!state.reading) {
        this.read(0);
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
  emitDataEvents(this);
  this.read(0);
  this.emit('resume');
};

Readable.prototype.pause = function() {
  emitDataEvents(this, true);
  this.emit('pause');
};

function emitDataEvents(stream, startPaused) {
  var state = stream._readableState;

  if (state.flowing) {
    // https://github.com/isaacs/readable-stream/issues/16
    throw new Error('Cannot switch to old mode now.');
  }

  var paused = startPaused || false;
  var readable = false;

  // convert to an old-style stream.
  stream.readable = true;
  stream.pipe = Stream.prototype.pipe;
  stream.on = stream.addListener = Stream.prototype.on;

  stream.on('readable', function() {
    readable = true;

    var c;
    while (!paused && (null !== (c = stream.read())))
      stream.emit('data', c);

    if (c === null) {
      readable = false;
      stream._readableState.needReadable = true;
    }
  });

  stream.pause = function() {
    paused = true;
    this.emit('pause');
  };

  stream.resume = function() {
    paused = false;
    if (readable)
      process.nextTick(function() {
        stream.emit('readable');
      });
    else
      this.read(0);
    this.emit('resume');
  };

  // now make it start, just in case it hadn't already.
  stream.emit('readable');
}

// wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.
Readable.prototype.wrap = function(stream) {
  var state = this._readableState;
  var paused = false;

  var self = this;
  stream.on('end', function() {
    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length)
        self.push(chunk);
    }

    self.push(null);
  });

  stream.on('data', function(chunk) {
    if (state.decoder)
      chunk = state.decoder.write(chunk);

    // don't skip over falsy values in objectMode
    //if (state.objectMode && util.isNullOrUndefined(chunk))
    if (state.objectMode && (chunk === null || chunk === undefined))
      return;
    else if (!state.objectMode && (!chunk || !chunk.length))
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
    if (typeof stream[i] === 'function' &&
        typeof this[i] === 'undefined') {
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

  if (!state.endEmitted && state.calledRead) {
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

},{"_process":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/process/browser.js","buffer":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/buffer/index.js","core-util-is":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/readable-stream/node_modules/core-util-is/lib/util.js","events":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/events/events.js","inherits":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/inherits/inherits_browser.js","isarray":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/isarray/index.js","stream":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/stream-browserify/index.js","string_decoder/":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/string_decoder/index.js"}],"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/readable-stream/lib/_stream_transform.js":[function(require,module,exports){
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

  if (data !== null && data !== undefined)
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

  var ts = this._transformState = new TransformState(options, this);

  // when the writable side finishes, then flush out anything remaining.
  var stream = this;

  // start out asking for a readable event once data is transformed.
  this._readableState.needReadable = true;

  // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.
  this._readableState.sync = false;

  this.once('finish', function() {
    if ('function' === typeof this._flush)
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

  if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
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
  var rs = stream._readableState;
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
  options = options || {};

  // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()
  var hwm = options.highWaterMark;
  this.highWaterMark = (hwm || hwm === 0) ? hwm : 16 * 1024;

  // object stream flag to indicate whether or not this stream
  // contains buffers or objects.
  this.objectMode = !!options.objectMode;

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

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, becuase any
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
  if (!Buffer.isBuffer(chunk) &&
      'string' !== typeof chunk &&
      chunk !== null &&
      chunk !== undefined &&
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

  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (Buffer.isBuffer(chunk))
    encoding = 'buffer';
  else if (!encoding)
    encoding = state.defaultEncoding;

  if (typeof cb !== 'function')
    cb = function() {};

  if (state.ended)
    writeAfterEnd(this, state, cb);
  else if (validChunk(this, state, chunk, cb))
    ret = writeOrBuffer(this, state, chunk, encoding, cb);

  return ret;
};

function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode &&
      state.decodeStrings !== false &&
      typeof chunk === 'string') {
    chunk = new Buffer(chunk, encoding);
  }
  return chunk;
}

// if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.
function writeOrBuffer(stream, state, chunk, encoding, cb) {
  chunk = decodeChunk(state, chunk, encoding);
  if (Buffer.isBuffer(chunk))
    encoding = 'buffer';
  var len = state.objectMode ? 1 : chunk.length;

  state.length += len;

  var ret = state.length < state.highWaterMark;
  // we must ensure that previous needDrain will not be reset to false.
  if (!ret)
    state.needDrain = true;

  if (state.writing)
    state.buffer.push(new WriteReq(chunk, encoding, cb));
  else
    doWrite(stream, state, len, chunk, encoding, cb);

  return ret;
}

function doWrite(stream, state, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}

function onwriteError(stream, state, sync, er, cb) {
  if (sync)
    process.nextTick(function() {
      cb(er);
    });
  else
    cb(er);

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

    if (!finished && !state.bufferProcessing && state.buffer.length)
      clearBuffer(stream, state);

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
  cb();
  if (finished)
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

  for (var c = 0; c < state.buffer.length; c++) {
    var entry = state.buffer[c];
    var chunk = entry.chunk;
    var encoding = entry.encoding;
    var cb = entry.callback;
    var len = state.objectMode ? 1 : chunk.length;

    doWrite(stream, state, len, chunk, encoding, cb);

    // if we didn't call the onwrite immediately, then
    // it means that we need to wait until it does.
    // also, that means that the chunk and cb are currently
    // being processed, so move the buffer counter past them.
    if (state.writing) {
      c++;
      break;
    }
  }

  state.bufferProcessing = false;
  if (c < state.buffer.length)
    state.buffer = state.buffer.slice(c);
  else
    state.buffer.length = 0;
}

Writable.prototype._write = function(chunk, encoding, cb) {
  cb(new Error('not implemented'));
};

Writable.prototype.end = function(chunk, encoding, cb) {
  var state = this._writableState;

  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (typeof chunk !== 'undefined' && chunk !== null)
    this.write(chunk, encoding);

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

function finishMaybe(stream, state) {
  var need = needFinish(stream, state);
  if (need) {
    state.finished = true;
    stream.emit('finish');
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
var Stream = require('stream'); // hack to fix a circular dependency issue when used with browserify
exports = module.exports = require('./lib/_stream_readable.js');
exports.Stream = Stream;
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


},{"stream":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/stream-browserify/index.js","util":"/Users/carl-erik.kopseng/dev_priv/Emissions/node_modules/browserify/node_modules/util/util.js"}]},{},["./app/main.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvY2FybC1lcmlrLmtvcHNlbmcvZGV2X3ByaXYvRW1pc3Npb25zL2FwcC9tYWluLmpzIiwiL1VzZXJzL2NhcmwtZXJpay5rb3BzZW5nL2Rldl9wcml2L0VtaXNzaW9ucy9hcHAvYWN0aW9ucy5qcyIsIi9Vc2Vycy9jYXJsLWVyaWsua29wc2VuZy9kZXZfcHJpdi9FbWlzc2lvbnMvYXBwL2FwcGRpc3BhdGNoZXIuanMiLCIvVXNlcnMvY2FybC1lcmlrLmtvcHNlbmcvZGV2X3ByaXYvRW1pc3Npb25zL2FwcC9ib290c3RyYXAtYWN0aW9ucy5qcyIsIi9Vc2Vycy9jYXJsLWVyaWsua29wc2VuZy9kZXZfcHJpdi9FbWlzc2lvbnMvYXBwL2NvbXBvbmVudHMvYXBwLnJlYWN0LmpzIiwiL1VzZXJzL2NhcmwtZXJpay5rb3BzZW5nL2Rldl9wcml2L0VtaXNzaW9ucy9hcHAvY29tcG9uZW50cy9jb21tYW5kZXItYXBwLnJlYWN0LmpzIiwiL1VzZXJzL2NhcmwtZXJpay5rb3BzZW5nL2Rldl9wcml2L0VtaXNzaW9ucy9hcHAvY29tcG9uZW50cy9kaWFsb2dzLnJlYWN0LmpzIiwiL1VzZXJzL2NhcmwtZXJpay5rb3BzZW5nL2Rldl9wcml2L0VtaXNzaW9ucy9hcHAvY29tcG9uZW50cy9kdW1teS1yZW5kZXIubWl4aW4uanMiLCIvVXNlcnMvY2FybC1lcmlrLmtvcHNlbmcvZGV2X3ByaXYvRW1pc3Npb25zL2FwcC9jb21wb25lbnRzL2hlYWRlci5yZWFjdC5qcyIsIi9Vc2Vycy9jYXJsLWVyaWsua29wc2VuZy9kZXZfcHJpdi9FbWlzc2lvbnMvYXBwL2NvbXBvbmVudHMvaW5kZXgtYXBwLnJlYWN0LmpzIiwiL1VzZXJzL2NhcmwtZXJpay5rb3BzZW5nL2Rldl9wcml2L0VtaXNzaW9ucy9hcHAvY29tcG9uZW50cy9pbnRyb2R1Y3Rpb24tc2NyZWVuLnJlYWN0LmpzIiwiL1VzZXJzL2NhcmwtZXJpay5rb3BzZW5nL2Rldl9wcml2L0VtaXNzaW9ucy9hcHAvY29tcG9uZW50cy9tZXNzYWdlLWxpc3QucmVhY3QuanMiLCIvVXNlcnMvY2FybC1lcmlrLmtvcHNlbmcvZGV2X3ByaXYvRW1pc3Npb25zL2FwcC9jb21wb25lbnRzL21pc3Npb24tdGltZXIucmVhY3QuanMiLCIvVXNlcnMvY2FybC1lcmlrLmtvcHNlbmcvZGV2X3ByaXYvRW1pc3Npb25zL2FwcC9jb21wb25lbnRzL25vdC1mb3VuZC5yZWFjdC5qcyIsIi9Vc2Vycy9jYXJsLWVyaWsua29wc2VuZy9kZXZfcHJpdi9FbWlzc2lvbnMvYXBwL2NvbXBvbmVudHMvcmFkaWF0aW9uLWNoYXJ0LnJlYWN0LmpzIiwiL1VzZXJzL2NhcmwtZXJpay5rb3BzZW5nL2Rldl9wcml2L0VtaXNzaW9ucy9hcHAvY29tcG9uZW50cy9yYWRpYXRpb24tc2FtcGxlci5yZWFjdC5qcyIsIi9Vc2Vycy9jYXJsLWVyaWsua29wc2VuZy9kZXZfcHJpdi9FbWlzc2lvbnMvYXBwL2NvbXBvbmVudHMvcmFkaWF0aW9uLXRhYmxlLnJlYWN0LmpzIiwiL1VzZXJzL2NhcmwtZXJpay5rb3BzZW5nL2Rldl9wcml2L0VtaXNzaW9ucy9hcHAvY29tcG9uZW50cy9zY2llbmNlLXRhc2sucmVhY3QuanMiLCIvVXNlcnMvY2FybC1lcmlrLmtvcHNlbmcvZGV2X3ByaXYvRW1pc3Npb25zL2FwcC9jb21wb25lbnRzL3Rhc2sucmVhY3QuanMiLCIvVXNlcnMvY2FybC1lcmlrLmtvcHNlbmcvZGV2X3ByaXYvRW1pc3Npb25zL2FwcC9jb21wb25lbnRzL3RlYW0tZGlzcGxheWVyLnJlYWN0LmpzIiwiL1VzZXJzL2NhcmwtZXJpay5rb3BzZW5nL2Rldl9wcml2L0VtaXNzaW9ucy9hcHAvY29tcG9uZW50cy90aW1lci1wYW5lbC5yZWFjdC5qcyIsIi9Vc2Vycy9jYXJsLWVyaWsua29wc2VuZy9kZXZfcHJpdi9FbWlzc2lvbnMvYXBwL2NvbXBvbmVudHMvdGltZXIucmVhY3QuanMiLCIvVXNlcnMvY2FybC1lcmlrLmtvcHNlbmcvZGV2X3ByaXYvRW1pc3Npb25zL2FwcC9jb25zdGFudHMuanMiLCIvVXNlcnMvY2FybC1lcmlrLmtvcHNlbmcvZGV2X3ByaXYvRW1pc3Npb25zL2FwcC9yb3V0ZXItY29udGFpbmVyLmpzIiwiL1VzZXJzL2NhcmwtZXJpay5rb3BzZW5nL2Rldl9wcml2L0VtaXNzaW9ucy9hcHAvcm91dGVzLnJlYWN0LmpzIiwiL1VzZXJzL2NhcmwtZXJpay5rb3BzZW5nL2Rldl9wcml2L0VtaXNzaW9ucy9hcHAvc3RvcmVzL2Jhc2Utc3RvcmUuanMiLCIvVXNlcnMvY2FybC1lcmlrLmtvcHNlbmcvZGV2X3ByaXYvRW1pc3Npb25zL2FwcC9zdG9yZXMvaW50cm9kdWN0aW9uLXN0b3JlLmpzIiwiL1VzZXJzL2NhcmwtZXJpay5rb3BzZW5nL2Rldl9wcml2L0VtaXNzaW9ucy9hcHAvc3RvcmVzL21lc3NhZ2Utc3RvcmUuanMiLCIvVXNlcnMvY2FybC1lcmlrLmtvcHNlbmcvZGV2X3ByaXYvRW1pc3Npb25zL2FwcC9zdG9yZXMvbWlzc2lvbi1zdGF0ZS1zdG9yZS5qcyIsIi9Vc2Vycy9jYXJsLWVyaWsua29wc2VuZy9kZXZfcHJpdi9FbWlzc2lvbnMvYXBwL3N0b3Jlcy9yYWRpYXRpb24tc3RvcmUuanMiLCIvVXNlcnMvY2FybC1lcmlrLmtvcHNlbmcvZGV2X3ByaXYvRW1pc3Npb25zL2FwcC9zdG9yZXMvcm91dGUtc3RvcmUuanMiLCIvVXNlcnMvY2FybC1lcmlrLmtvcHNlbmcvZGV2X3ByaXYvRW1pc3Npb25zL2FwcC9zdG9yZXMvdGFzay1zdG9yZS5qcyIsIi9Vc2Vycy9jYXJsLWVyaWsua29wc2VuZy9kZXZfcHJpdi9FbWlzc2lvbnMvYXBwL3N0b3Jlcy90aW1lci1zdG9yZS5qcyIsIi9Vc2Vycy9jYXJsLWVyaWsua29wc2VuZy9kZXZfcHJpdi9FbWlzc2lvbnMvYXBwL3RlYW0tbmFtZS1tYXAuanMiLCIvVXNlcnMvY2FybC1lcmlrLmtvcHNlbmcvZGV2X3ByaXYvRW1pc3Npb25zL2FwcC91dGlscy5qcyIsIi9Vc2Vycy9jYXJsLWVyaWsua29wc2VuZy9kZXZfcHJpdi9FbWlzc2lvbnMvYXBwL3V1aWQuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9jb3JlLWpzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvaGVscGVycy9jbGFzcy1jYWxsLWNoZWNrLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvaGVscGVycy9jcmVhdGUtY2xhc3MuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9oZWxwZXJzL2V4dGVuZHMuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9oZWxwZXJzL2luaGVyaXRzLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcmVzb2x2ZS9lbXB0eS5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9idWZmZXIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnVmZmVyL25vZGVfbW9kdWxlcy9iYXNlNjQtanMvbGliL2I2NC5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9idWZmZXIvbm9kZV9tb2R1bGVzL2llZWU3NTQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnVmZmVyL25vZGVfbW9kdWxlcy9pcy1hcnJheS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9ldmVudHMvZXZlbnRzLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2luaGVyaXRzL2luaGVyaXRzX2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvaXNhcnJheS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcmVhZGFibGUtc3RyZWFtL2R1cGxleC5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9yZWFkYWJsZS1zdHJlYW0vbGliL19zdHJlYW1fZHVwbGV4LmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3JlYWRhYmxlLXN0cmVhbS9saWIvX3N0cmVhbV9wYXNzdGhyb3VnaC5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9yZWFkYWJsZS1zdHJlYW0vbGliL19zdHJlYW1fcmVhZGFibGUuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcmVhZGFibGUtc3RyZWFtL2xpYi9fc3RyZWFtX3RyYW5zZm9ybS5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9yZWFkYWJsZS1zdHJlYW0vbGliL19zdHJlYW1fd3JpdGFibGUuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcmVhZGFibGUtc3RyZWFtL25vZGVfbW9kdWxlcy9jb3JlLXV0aWwtaXMvbGliL3V0aWwuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcmVhZGFibGUtc3RyZWFtL3Bhc3N0aHJvdWdoLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3JlYWRhYmxlLXN0cmVhbS9yZWFkYWJsZS5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9yZWFkYWJsZS1zdHJlYW0vdHJhbnNmb3JtLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3JlYWRhYmxlLXN0cmVhbS93cml0YWJsZS5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9zdHJlYW0tYnJvd3NlcmlmeS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9zdHJpbmdfZGVjb2Rlci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy91dGlsL3N1cHBvcnQvaXNCdWZmZXJCcm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3V0aWwvdXRpbC5qcyIsIm5vZGVfbW9kdWxlcy9jaGVjay10eXBlcy9zcmMvY2hlY2stdHlwZXMuanMiLCJub2RlX21vZHVsZXMvZmx1eC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9mbHV4L2xpYi9EaXNwYXRjaGVyLmpzIiwibm9kZV9tb2R1bGVzL2ZsdXgvbGliL2ludmFyaWFudC5qcyIsIm5vZGVfbW9kdWxlcy9nbG9iYWwvZG9jdW1lbnQuanMiLCJub2RlX21vZHVsZXMvZ2xvYmFsL3dpbmRvdy5qcyIsIm5vZGVfbW9kdWxlcy9wcmludGYvbGliL3ByaW50Zi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7OztBQ0FBLElBQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUMvQixJQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQzs7O0FBRzVDLElBQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDOztBQUU3QyxJQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUNqRCxJQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7OztBQUd6QyxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQzs7QUFFckMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUs7QUFDM0IsaUJBQWEsQ0FBQyxRQUFRLENBQUMsRUFBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLG1CQUFtQixFQUFF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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3B5RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNWhDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTs7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDekZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDdDlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDbE5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNsWUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzFHQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBOztBQ0RBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMxa0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ250QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJjb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5jb25zdCBkb2N1bWVudCA9IHJlcXVpcmUoJ2dsb2JhbC9kb2N1bWVudCcpO1xuXG4vLyB0aGUgYWN0dWFsIHJpZ2dpbmcgb2YgdGhlIGFwcGxpY2F0aW9uIGlzIGRvbmUgaW4gdGhlIHJvdXRlciFcbmNvbnN0IHJvdXRlciA9IHJlcXVpcmUoJy4vcm91dGVyLWNvbnRhaW5lcicpO1xuXG5jb25zdCBBcHBEaXNwYXRjaGVyID0gcmVxdWlyZSgnLi9hcHBkaXNwYXRjaGVyJyk7XG5jb25zdCBjb25zdGFudHMgPSByZXF1aXJlKCcuL2NvbnN0YW50cycpO1xuXG4vLyBydW4gc3RhcnR1cCBhY3Rpb25zXG5yZXF1aXJlKCcuL2Jvb3RzdHJhcC1hY3Rpb25zJykucnVuKCk7XG5cbnJvdXRlci5ydW4oKEhhbmRsZXIsIHN0YXRlKSA9PiB7XG4gICAgQXBwRGlzcGF0Y2hlci5kaXNwYXRjaCh7YWN0aW9uOiBjb25zdGFudHMuUk9VVEVfQ0hBTkdFRF9FVkVOVCwgc3RhdGV9KTtcblxuICAgIC8vIHBhc3MgdGhlIHN0YXRlIGRvd24gaW50byB0aGUgUm91dGVIYW5kbGVycywgYXMgdGhhdCB3aWxsIG1ha2VcbiAgICAvLyB0aGUgcm91dGVyIHJlbGF0ZWQgcHJvcGVydGllcyBhdmFpbGFibGUgb24gZWFjaCBSSC4gVGFrZW4gZnJvbSBVcGdyYWRlIHRpcHMgZm9yIFJlYWN0IFJvdXRlclxuICAgIFJlYWN0LnJlbmRlcig8SGFuZGxlciB7Li4uc3RhdGV9Lz4sIGRvY3VtZW50LmJvZHkpO1xufSk7XG5cbiIsImNvbnN0IEFwcERpc3BhdGNoZXIgPSByZXF1aXJlKCcuL2FwcGRpc3BhdGNoZXInKSxcbiAgICB7IGZvcm1hdCB9ID0gcmVxdWlyZSgndXRpbCcpLFxuICAgIGNvbnN0YW50cyA9IHJlcXVpcmUoJy4vY29uc3RhbnRzJyksXG4gICAgVGltZXJTdG9yZSA9IHJlcXVpcmUoJy4vc3RvcmVzL3RpbWVyLXN0b3JlJyksXG4gICAgdXVpZCA9IHJlcXVpcmUoJy4vdXVpZCcpLFxuICAgIHJvdXRlciA9IHJlcXVpcmUoJy4vcm91dGVyLWNvbnRhaW5lcicpO1xuXG5mdW5jdGlvbiBhZGRTdHViKG5hbWUsIHN0dWIpIHtcbiAgICBhY3Rpb25zW25hbWVdID0gKCkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhmb3JtYXQoJ1tVTklNUExFTUVOVEVEXSAlcyglcyknLCBuYW1lLCBhcmd1bWVudHMuam9pbignLCcpKSk7XG4gICAgICAgIHN0dWIgJiYgc3R1YiguLi5hcmd1bWVudHMpO1xuICAgIH1cbn1cblxudmFyIGFjdGlvbnMgPSB7XG5cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBwYXJhbSB0byB7U3RyaW5nfSBhYnNvbHV0ZSBvciByZWxhdGl2ZSBwYXRoIG9yIHBhdGgtbmFtZVxuICAgICAqIEBwYXJhbSBwYXJhbSBwYXJhbXMgaWYgZ2l2ZW4gcGF0aC1uYW1lXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHRyYW5zaXRpb25UbygnL3NjaWVuY2UvdGFzaycpXG4gICAgICogdHJhbnNpdGlvblRvKCd0ZWFtLXRhc2snLHt0ZWFtSWQgOiAnc2NpZW5jZSd9KVxuICAgICAqXG4gICAgICogT3Igd2hlbiBhbHJlYWR5IGluIC9zY2llbmNlXG4gICAgICogdHJhbnNpdGlvblRvKCd0YXNrJykgPT4gL3NjaWVuY2UvdGFza1xuICAgICAqL1xuICAgIHRyYW5zaXRpb25Ubyh0bywgcGFyYW0sIHF1ZXJ5KSB7XG4gICAgICAgIHJvdXRlci50cmFuc2l0aW9uVG8odG8sIHBhcmFtLCBxdWVyeSk7XG4gICAgfSxcblxuICAgIHNldE1pc3Npb25UaW1lKHJlbWFpbmluZ1RpbWUpIHtcbiAgICAgICAgYWN0aW9ucy5zZXRUaW1lcihjb25zdGFudHMuTUlTU0lPTl9USU1FUl9JRCwgcmVtYWluaW5nVGltZSk7XG4gICAgfSxcblxuICAgIHN0YXJ0TWlzc2lvbigpIHtcbiAgICAgICAgaWYgKCFUaW1lclN0b3JlLmlzUmVhZHlUb1N0YXJ0KGNvbnN0YW50cy5NSVNTSU9OX1RJTUVSX0lEKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBtaXNzaW9uIHRpbWUgaGFzIGJlZW4gc2V0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgQXBwRGlzcGF0Y2hlci5kaXNwYXRjaCh7YWN0aW9uOiBjb25zdGFudHMuTUlTU0lPTl9TVEFSVEVEX0VWRU5UfSk7XG4gICAgICAgIGFjdGlvbnMuc3RhcnRUaW1lcihjb25zdGFudHMuTUlTU0lPTl9USU1FUl9JRCk7XG4gICAgICAgIGFjdGlvbnMucmVtb3ZlTWVzc2FnZShjb25zdGFudHMuTk9UX1JFQURZX01TRyk7XG4gICAgfSxcblxuICAgIHN0b3BNaXNzaW9uKCkge1xuICAgICAgICBBcHBEaXNwYXRjaGVyLmRpc3BhdGNoKHthY3Rpb246IGNvbnN0YW50cy5NSVNTSU9OX1NUT1BQRURfRVZFTlR9KTtcbiAgICAgICAgYWN0aW9ucy5zdG9wVGltZXIoY29uc3RhbnRzLk1JU1NJT05fVElNRVJfSUQpO1xuICAgIH0sXG5cblxuICAgIGVuZE1pc3Npb24oKSB7XG4gICAgICAgIGFjdGlvbnMuc3RvcE1pc3Npb24oKTtcbiAgICAgICAgYWN0aW9ucy5zZXRNaXNzaW9uVGltZSgwKTtcbiAgICB9LFxuXG4gICAgc3RhcnRUaW1lcihpZCkge1xuICAgICAgICBBcHBEaXNwYXRjaGVyLmRpc3BhdGNoKHthY3Rpb246ICdTVEFSVF9USU1FUicsIGRhdGE6IHt0aW1lcklkOiBpZH19KTtcbiAgICB9LFxuXG4gICAgcmVzZXRUaW1lcihpZCkge1xuICAgICAgICBBcHBEaXNwYXRjaGVyLmRpc3BhdGNoKHthY3Rpb246ICdSRVNFVF9USU1FUicsIGRhdGE6IHt0aW1lcklkOiBpZH19KTtcbiAgICB9LFxuICAgIHN0b3BUaW1lcihpZCkge1xuICAgICAgICBBcHBEaXNwYXRjaGVyLmRpc3BhdGNoKHthY3Rpb246ICdTVE9QX1RJTUVSJywgZGF0YToge3RpbWVySWQ6IGlkfX0pO1xuICAgIH0sXG5cbiAgICBzZXRUaW1lcih0aW1lcklkLCB0aW1lKSB7XG4gICAgICAgIEFwcERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgICAgICAgYWN0aW9uOiBjb25zdGFudHMuU0VUX1RJTUVSLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIHJlbWFpbmluZ1RpbWU6IHRpbWUsXG4gICAgICAgICAgICAgICAgdGltZXJJZFxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIG1zZy50ZXh0IHRoZSBtZXNzYWdlXG4gICAgICogQHBhcmFtIFttc2cuaWRdIHRoZSBtZXNzYWdlIGlkLiBpZiBub3QgZ2l2ZW4sIG9uZSB3aWxsIGJlIGNyZWF0ZWRcbiAgICAgKiBAcGFyYW0gW21zZy5sZXZlbF0gc2FtZSBhcyBib290c3RyYXAncyBhbGVydCBjbGFzc2VzOiBbc3VjY2VzcywgaW5mbywgd2FybmluZywgZGFuZ2VyXVxuICAgICAqIEBwYXJhbSBbbXNnLmR1cmF0aW9uXSB7TnVtYmVyfSBvcHRpb25hbCBkdXJhdGlvbiBmb3IgdHJhbnNpZW50IG1lc3NhZ2VzXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSB0aGUgbWVzc2FnZSBpZFxuICAgICAqL1xuICAgIGFkZE1lc3NhZ2UobXNnKSB7XG4gICAgICAgIHZhciBpZCA9IG1zZy5pZDtcblxuICAgICAgICBpZighaWQpIHtcbiAgICAgICAgICAgIGlkID0gdXVpZCgpO1xuICAgICAgICAgICAgbXNnLmlkID0gaWQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZighbXNnLmxldmVsKSB7XG4gICAgICAgICAgICBtc2cubGV2ZWwgPSAnc3VjY2Vzcyc7XG4gICAgICAgIH1cblxuICAgICAgICBBcHBEaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICBhY3Rpb246IGNvbnN0YW50cy5NRVNTQUdFX0FEREVELFxuICAgICAgICAgICAgICAgIGRhdGE6IG1zZ1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuXG4gICAgICAgIGlmKG1zZy5kdXJhdGlvbikge1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiBhY3Rpb25zLnJlbW92ZU1lc3NhZ2UobXNnLmlkKSwgbXNnLmR1cmF0aW9uKjEwMDApXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gaWQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG1zZyB3aXRoIGRlZmF1bHQgZHVyYXRpb24gb2YgNSBzZWNvbmRzXG4gICAgICogQHBhcmFtIG1zZ1xuICAgICAqIEBwYXJhbSBbZHVyYXRpb25dIGRlZmF1bHQgb2YgNSBzZWNvbmRzXG4gICAgICpcbiAgICAgKiBAc2VlICNhZGRNZXNzYWdlKCkgZm9yIG1vcmUgcGFyYW1zXG4gICAgICogQHJldHVybnMge3N0cmluZ30gdGhlIG1lc3NhZ2UgaWRcbiAgICAgKi9cbiAgICBhZGRUcmFuc2llbnRNZXNzYWdlKG1zZywgZHVyYXRpb249NSkge1xuICAgICAgcmV0dXJuIGFjdGlvbnMuYWRkTWVzc2FnZShPYmplY3QuYXNzaWduKHtkdXJhdGlvbn0sIG1zZykpXG4gICAgfSxcblxuICAgIHJlbW92ZU1lc3NhZ2UoaWQpIHtcbiAgICAgICAgQXBwRGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiBjb25zdGFudHMuUkVNT1ZFX01FU1NBR0UsXG4gICAgICAgICAgICAgICAgZGF0YTogaWRcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICB9LFxuXG4gICAgaW50cm9XYXNSZWFkKHRlYW1JZCkge1xuICAgICAgICBBcHBEaXNwYXRjaGVyLmRpc3BhdGNoKHthY3Rpb246IGNvbnN0YW50cy5JTlRST0RVQ1RJT05fUkVBRCwgdGVhbU5hbWU6IHRlYW1JZH0pO1xuICAgIH0sXG5cbiAgICB0YWtlUmFkaWF0aW9uU2FtcGxlKCkge1xuICAgICAgICBBcHBEaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgICAgICAgIGFjdGlvbjogY29uc3RhbnRzLlNDSUVOQ0VfVEFLRV9SQURJQVRJT05fU0FNUExFXG4gICAgICAgIH0pXG4gICAgfSxcblxuICAgIGF2ZXJhZ2VSYWRpYXRpb25DYWxjdWxhdGVkKGF2ZXJhZ2Upe1xuICAgICAgICBBcHBEaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgICAgICAgIGFjdGlvbjogY29uc3RhbnRzLlNDSUVOQ0VfQVZHX1JBRElBVElPTl9DQUxDVUxBVEVELFxuICAgICAgICAgICAgZGF0YSA6IHsgYXZlcmFnZSB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmKGF2ZXJhZ2UgPiBjb25zdGFudHMuU0NJRU5DRV9BVkdfUkFEX1JFRF9USFJFU0hPTEQpIHtcbiAgICAgICAgICAgIGFjdGlvbnMuYWRkVHJhbnNpZW50TWVzc2FnZSh7XG4gICAgICAgICAgICAgICAgdGV4dCA6ICdWZWxkaWcgaMO4eXQgcmFkaW9ha3RpdnQgbml2w6UgZGV0ZWt0ZXJ0LiBWYXJzbGUgc2lra2VyaGV0c3RlYW1ldCB1bWlkZGVsYmFydCEnLFxuICAgICAgICAgICAgICAgIGxldmVsIDogJ2RhbmdlcicsXG4gICAgICAgICAgICAgICAgaWQgOiBjb25zdGFudHMuU0NJRU5DRV9SQURJQVRJT05fV0FSTklOR19NU0dcbiAgICAgICAgICAgIH0sIDMwKTtcbiAgICAgICAgfSBlbHNlIGlmKGF2ZXJhZ2UgPiBjb25zdGFudHMuU0NJRU5DRV9BVkdfUkFEX09SQU5HRV9USFJFU0hPTEQpIHtcbiAgICAgICAgICAgIGFjdGlvbnMuYWRkVHJhbnNpZW50TWVzc2FnZSh7XG4gICAgICAgICAgICAgICAgdGV4dCA6ICdIw7h5ZSB2ZXJkaWVyIGF2IHJhZGlvYWt0aXZpdGV0LiBGw7hsZyBtZWQgcMOlIG9tIGRldCBnw6VyIG5lZG92ZXIgaWdqZW4nLFxuICAgICAgICAgICAgICAgIGxldmVsIDogJ3dhcm5pbmcnLFxuICAgICAgICAgICAgICAgIGlkIDogY29uc3RhbnRzLlNDSUVOQ0VfUkFESUFUSU9OX1dBUk5JTkdfTVNHXG4gICAgICAgICAgICB9LCAxMCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IHRoZSByYWRpYXRpb24gbGV2ZWwgdGhhdCB3aWxsIGJlIHJlcG9ydGVkIHRvIHRoZSB2aWV3IGxheWVyXG4gICAgICogVGhlIHJlcG9ydGVkIHJhZGlhdGlvbiB3aWxsIGdlbmVyYXRlZCB2YWx1ZXMgaW4gdGhlIHJhbmdlIGdpdmVuIGJ5IHRoZSBwYXJhbWV0ZXJzXG4gICAgICpcbiAgICAgKiBXZSBhcmUgbm90IGFjdHVhbGx5IHJlY2VpdmluZyBhIHN0cmVhbSBvZiB2YWx1ZXMgZnJvbSB0aGUgc2VydmVyLCBhcyB0aGF0IGNvdWxkXG4gICAgICogYmUgdmVyeSByZXNvdXJjZSBoZWF2eS4gSW5zdGVhZCB3ZSBnZW5lcmF0ZSByYW5kb20gdmFsdWVzIGJldHdlZW4gdGhlIGdpdmVuIHZhbHVlcyxcbiAgICAgKiB3aGljaCB0byB0aGUgdXNlciB3aWxsIGxvb2sgdGhlIHNhbWUuXG4gICAgICogQHBhcmFtIG1pblxuICAgICAqIEBwYXJhbSBtYXhcbiAgICAgKi9cbiAgICBzZXRSYWRpYXRpb25MZXZlbChtaW4sIG1heCkge1xuICAgICAgICBBcHBEaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgICAgICAgIGFjdGlvbjogY29uc3RhbnRzLlNDSUVOQ0VfUkFESUFUSU9OX0xFVkVMX0NIQU5HRUQsXG4gICAgICAgICAgICBkYXRhOiB7bWluLCBtYXh9XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBhZGRUb1RvdGFsUmFkaWF0aW9uTGV2ZWwoYW1vdW50KXtcbiAgICAgICAgY29uc3QgUmFkaWF0aW9uU3RvcmUgPSByZXF1aXJlKCcuL3N0b3Jlcy9yYWRpYXRpb24tc3RvcmUnKTtcblxuICAgICAgICB2YXIgdG90YWwgPSBSYWRpYXRpb25TdG9yZS5nZXRUb3RhbExldmVsKCk7XG5cbiAgICAgICAgLyogVmVyeSB1bnN1cmUgaWYgdGhpcyBpcyB0aGUgcmlnaHQgcGxhY2UgdG8gY2FsbCBhbm90aGVyIGFjdGlvbiAqL1xuICAgICAgICBpZiggdG90YWwgKyBhbW91bnQgPiBjb25zdGFudHMuU0NJRU5DRV9UT1RBTF9SQURJQVRJT05fVEhSRVNIT0xEKSB7XG4gICAgICAgICAgICBhY3Rpb25zLmFkZE1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgIGlkOiAnc2NpZW5jZV9oaWdoX3JhZGlhdGlvbl9sZXZlbCcsXG4gICAgICAgICAgICAgICAgdGV4dDogJ0ZhcmV0cnVlbmRlIGjDuHl0IHN0csOlbGluZ3NuaXbDpScsXG4gICAgICAgICAgICAgICAgbGV2ZWw6ICdkYW5nZXInXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgQXBwRGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgYWN0aW9uIDogY29uc3RhbnRzLlNDSUVOQ0VfVE9UQUxfUkFESUFUSU9OX0xFVkVMX0NIQU5HRUQsXG4gICAgICAgICAgICAgICAgZGF0YSA6IHsgdG90YWwsIGFkZGVkOiBhbW91bnR9XG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG5cbiAgICB9XG5cbn07XG5cbi8vIGR1bW15IHJldHVybiA0MDAgc2Vjb25kcyByZW1haW5pbmdcbmFkZFN0dWIoJ2Fza1NlcnZlckZvclJlbWFpbmluZ1RpbWUnLCAoKSA9PiB7XG4gICAgQXBwRGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICAgIGFjdGlvbjogY29uc3RhbnRzLlJFTUFJTklOR19NSVNTSU9OX1RJTUVfQ0hBTkdFRCxcbiAgICAgICAgZGF0YTogNDAwXG4gICAgfSlcbn0pO1xuXG5PYmplY3QuZnJlZXplKGFjdGlvbnMpO1xuXG53aW5kb3cuX19hY3Rpb25zID0gYWN0aW9ucztcbm1vZHVsZS5leHBvcnRzID0gYWN0aW9uczsiLCIvKlxuICogRGlzcGF0Y2hlciAtIGEgc2luZ2xldG9uXG4gKlxuICogVGhpcyBpcyBlc3NlbnRpYWxseSB0aGUgbWFpbiBkcml2ZXIgaW4gdGhlIEZsdXggYXJjaGl0ZWN0dXJlXG4gKiBAc2VlIGh0dHA6Ly9mYWNlYm9vay5naXRodWIuaW8vZmx1eC9kb2NzL292ZXJ2aWV3Lmh0bWxcbiovXG5cbmNvbnN0IHsgRGlzcGF0Y2hlciB9ID0gcmVxdWlyZSgnZmx1eCcpO1xuXG5jb25zdCBBcHBEaXNwYXRjaGVyID0gT2JqZWN0LmFzc2lnbihuZXcgRGlzcGF0Y2hlcigpLCB7XG5cbiAgICAvLyBvcHRpb25hbCBtZXRob2RzXG5cbn0pO1xuXG53aW5kb3cuX19BcHBEaXNwYXRjaGVyPSBBcHBEaXNwYXRjaGVyO1xubW9kdWxlLmV4cG9ydHMgPSBBcHBEaXNwYXRjaGVyOyIsIi8qIFNjcmlwdCB0byBib290c3RyYXAgdGhlIGFwcGxpY2F0aW9uICovXG5cbnZhciBhY3Rpb25zID0gcmVxdWlyZSgnLi9hY3Rpb25zJyksXG4gICAgY29uc3RhbnRzID0gcmVxdWlyZSgnLi9jb25zdGFudHMnKSxcbiAgICBBcHBEaXNwYXRjaGVyID0gcmVxdWlyZSgnLi9hcHBkaXNwYXRjaGVyJyk7XG5cbkFwcERpc3BhdGNoZXIucmVnaXN0ZXIoKHBheWxvYWQpPT57XG4gICAgY29uc29sZS5sb2coJ0RFQlVHIEFwcERpc3BhdGNoZXIuZGlzcGF0Y2gnLCBwYXlsb2FkKTtcbn0pO1xuXG5mdW5jdGlvbiBydW4oKSB7XG5cblxuXG4gICAgYWN0aW9ucy5zZXRUaW1lcihjb25zdGFudHMuU0NJRU5DRV9USU1FUl8xLCAzMCk7XG5cbiAgICBzZXRUaW1lb3V0KCgpPT4ge1xuICAgICAgICBhY3Rpb25zLmFkZE1lc3NhZ2Uoe1xuICAgICAgICAgICAgaWQ6ICdzY2llbmNlX3NvbWV0aGluZycsXG4gICAgICAgICAgICB0ZXh0OiAnaWtrZSBnbGVtIHRhbm5iw7hyc3RlIG7DpSBkYScsXG4gICAgICAgICAgICBsZXZlbDogJ2luZm8nXG4gICAgICAgIH0pO1xuICAgIH0sIDEwMCAqIDEwMDApO1xuXG4gICAgLy8gZHVtbXkgdW50aWwgd2UgaGF2ZSBpbnRlZ3JhdGlvbiB3aXRoIHdlYnNvY2tldHNcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgYWN0aW9ucy5zZXRNaXNzaW9uVGltZSg2MCAqIDE1KTtcbiAgICAgICAgYWN0aW9ucy5zdGFydE1pc3Npb24oKTtcbiAgICB9LCAzMDApO1xuXG4gICAgLy8gcGxheSB3aXRoIHJhZGlhdGlvblxuICAgIGFjdGlvbnMuc2V0UmFkaWF0aW9uTGV2ZWwoMCwxMCk7XG4gICAgc2V0VGltZW91dCgoKSA9PiBhY3Rpb25zLnNldFJhZGlhdGlvbkxldmVsKDQwLDYwKSwgMTBFMyk7XG4gICAgc2V0VGltZW91dCgoKSA9PiBhY3Rpb25zLnNldFJhZGlhdGlvbkxldmVsKDIwLDMwKSwgMzBFMyk7XG4gICAgc2V0VGltZW91dCgoKSA9PiBhY3Rpb25zLnNldFJhZGlhdGlvbkxldmVsKDE5MCwyNTApLCA2MEUzKTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IGFjdGlvbnMuc2V0UmFkaWF0aW9uTGV2ZWwoNDAsNTApLCA5MEUzKTtcblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtydW59OyIsImNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbmNvbnN0IFJvdXRlciA9IHJlcXVpcmUoJ3JlYWN0LXJvdXRlcicpO1xuXG5jb25zdCBSb3V0ZUhhbmRsZXIgPSBSb3V0ZXIuUm91dGVIYW5kbGVyO1xuXG5jb25zdCBIZWFkZXIgPSByZXF1aXJlKCcuL2hlYWRlci5yZWFjdCcpO1xuXG5jb25zdCBUZWFtRGlzcGxheWVyID0gcmVxdWlyZSgnLi90ZWFtLWRpc3BsYXllci5yZWFjdCcpO1xuY29uc3QgTWVzc2FnZUxpc3QgPSByZXF1aXJlKCcuL21lc3NhZ2UtbGlzdC5yZWFjdCcpO1xuY29uc3QgTWlzc2lvblRpbWVyID0gcmVxdWlyZSgnLi9taXNzaW9uLXRpbWVyLnJlYWN0LmpzJyk7XG5cbmNvbnN0IE1pc3Npb25TdGF0ZVN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL21pc3Npb24tc3RhdGUtc3RvcmUnKTtcblxuY29uc3QgY29uc3RhbnRzID0gcmVxdWlyZSgnLi4vY29uc3RhbnRzJyk7XG5jb25zdCBhY3Rpb25zID0gcmVxdWlyZSgnLi4vYWN0aW9ucycpO1xuXG5jb25zdCBBcHAgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBtaXhpbnM6IFtdLFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgICAgICByZXR1cm4ge2lzTWlzc2lvblJ1bm5pbmc6IE1pc3Npb25TdGF0ZVN0b3JlLmlzTWlzc2lvblJ1bm5pbmcoKX07XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxNb3VudCgpIHtcbiAgICAgICAgTWlzc2lvblN0YXRlU3RvcmUuYWRkQ2hhbmdlTGlzdGVuZXIodGhpcy5faGFuZGxlTWlzc2lvblN0YXRlQ2hhbmdlKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIE1pc3Npb25TdGF0ZVN0b3JlLnJlbW92ZUNoYW5nZUxpc3RlbmVyKHRoaXMuX2hhbmRsZU1pc3Npb25TdGF0ZUNoYW5nZSk7XG4gICAgfSxcblxuICAgIF9oYW5kbGVNaXNzaW9uU3RhdGVDaGFuZ2UoKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2lzTWlzc2lvblJ1bm5pbmc6IE1pc3Npb25TdGF0ZVN0b3JlLmlzTWlzc2lvblJ1bm5pbmcoKX0pO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGNvdW50RG93bkJveCwgbWFpbkNvbnRlbnQ7XG5cbiAgICAgICAgaWYgKE1pc3Npb25TdGF0ZVN0b3JlLmlzTWlzc2lvblJ1bm5pbmcoKSkge1xuICAgICAgICAgICAgY291bnREb3duQm94ID0gPE1pc3Npb25UaW1lciAvPjtcblxuICAgICAgICAgICAgbWFpbkNvbnRlbnQgPSA8ZGl2PlxuXG4gICAgICAgICAgICAgICAgPGRpdiBpZD0ndGVhbS1uYW1lJyBjbGFzc05hbWU9JycgPlxuICAgICAgICAgICAgICAgICAgICA8aGVhZGVyIGNsYXNzTmFtZT0nJz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxUZWFtRGlzcGxheWVyIGNsYXNzTmFtZT0nJy8+XG4gICAgICAgICAgICAgICAgICAgIDwvaGVhZGVyPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAgPHNlY3Rpb24gaWQ9J21pc3Npb24tdGltZXInIGNsYXNzTmFtZT0nJz5cbiAgICAgICAgICAgICAgICB7IGNvdW50RG93bkJveCB9XG4gICAgICAgICAgICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICAgICAgICAgICAgey8qIHRoaXMgaXMgdGhlIGltcG9ydGFudCBwYXJ0ICovfVxuICAgICAgICAgICAgICAgIDxSb3V0ZUhhbmRsZXIgey4uLnRoaXMucHJvcHN9Lz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IG1lc3NhZ2UgPSB7XG4gICAgICAgICAgICAgICAgaWQ6ICdub3RfdXNlZCcsXG4gICAgICAgICAgICAgICAgdGV4dDogJ0lra2Uga2xhci4gVmVudGVyIHDDpSBhdCBvcHBkcmFnZXQgc2thbCBzdGFydGUuJyxcbiAgICAgICAgICAgICAgICBsZXZlbDogJ2luZm8nXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgbWFpbkNvbnRlbnQgPSA8TWVzc2FnZUxpc3QgY2xhc3NOYW1lPSdyb3cnIG1lc3NhZ2VzPXtbbWVzc2FnZV19IC8+XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J2NvbnRhaW5lcic+XG5cbiAgICAgICAgICAgICAgICA8SGVhZGVyLz5cblxuICAgICAgICAgICAgICAgIHttYWluQ29udGVudH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcDsiLCJ2YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgQXBwID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXY+XG5cbiAgICAgICAgICAgICAgICA8cCBpZD1cIm1pc3Npb25UaW1lXCI+T3BwZHJhZ2V0IGhhciBpa2tlIHN0YXJ0ZXQ8L3A+XG5cbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICBPcHBkcmFnc3RpZDpcbiAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgaWQ9XCJtaXNzaW9uTGVuZ3RoXCIgc2l6ZT1cIjNcIiAvPlxuICAgICAgICAgICAgICAgICAgICBtaW51dHRlclxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGlkPVwiY2hhbmdlTWlzc2lvblRpbWVcIiBzdHlsZT17e2Rpc3BsYXk6IFwibm9uZVwifX0+RW5kcmUgb3BwZHJhZ3N0aWQ8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBpZD1cInN0YXJ0TWlzc2lvblwiPlN0YXJ0IG9wcGRyYWc8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICAgIDxidXR0b24gaWQ9XCJqb2JGaW5pc2hlZFwiIHN0eWxlPXt7XCJkaXNwbGF5XCI6IFwibm9uZVwifX0+T3BwZHJhZyB1dGbDuHJ0PC9idXR0b24+XG5cbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICA8dmlkZW8gaWQ9XCJhc3Ryb25hdXRWaWRlb1wiIHdpZHRoPVwiMjcwcHhcIiBoZWlnaHQ9XCIxODBweFwiIGF1dG9QbGF5PVwidHJ1ZVwiIGxvb3A9XCJ0cnVlXCIgY29udHJvbHM9XCJ0cnVlXCIgbXV0ZWQ9XCJ0cnVlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c291cmNlIHR5cGU9XCJ2aWRlby93ZWJtXCI+PC9zb3VyY2U+XG4gICAgICAgICAgICAgICAgICAgIDwvdmlkZW8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGlkPVwic3RvcEJ1dHRvblwiPlN0b3BwPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gaWQ9XCJhc3Ryb25hdXRIYXBweVwiPkdsYWQ8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBpZD1cImFzdHJvbmF1dE5lcnZvdXNcIj5OZXJ2w7hzPC9idXR0b24+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGlkPVwiY2FsbFNlY3VyaXR5VGVhbVwiIGNsYXNzTmFtZT1cImNhbGxcIj5SaW5nIHNpa2tlcmhldHMtdGVhbWV0PC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDxici8+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gaWQ9XCJjYWxsQ29tbXVuaWNhdGlvblRlYW1cIiBjbGFzc05hbWU9XCJjYWxsXCI+UmluZyBrb21tdW5pa2Fzam9ucy10ZWFtZXQ8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gaWQ9XCJjYWxsZXJJZFwiIGNsYXNzTmFtZT1cImluY29taW5nQ2FsbFwiPlggcmluZ2VyPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGlkPVwiYW5zd2VyQnV0dG9uXCIgY2xhc3NOYW1lPVwiaW5jb21pbmdDYWxsXCI+U3ZhcjwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGlkPVwiaGFuZ1VwXCI+TGVnZyBww6U8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgIDx2aWRlbyBpZD1cImxvY2FsVmlkZW9cIiBjbGFzc05hbWU9XCJydGNWaWRlb1wiIGF1dG9QbGF5PVwidHJ1ZVwiIG11dGVkPVwidHJ1ZVwiPjwvdmlkZW8+XG4gICAgICAgICAgICAgICAgICAgIDx2aWRlbyBpZD1cInJlbW90ZVZpZGVvXCIgY2xhc3NOYW1lPVwicnRjVmlkZW9cIiBhdXRvUGxheT1cInRydWVcIj48L3ZpZGVvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcDtcbiIsIi8vIG5lZWRlZCB0byBhdm9pZCBjb21waWxhdGlvbiBlcnJvclxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBzY2llbmNlX2ludHJvOiA8ZGl2PlxuICAgICAgICA8cD5cbiAgICAgICAgICAgIERlcmUgc2thbCBvdmVydsOla2Ugc3Ryw6VsaW5nc25pdsOlZXQgYXN0cm9uYXR1ZW4gdXRzZXR0ZXMgZm9yLlxuICAgICAgICAgICAgRGVyZSBtw6UgZGEgcGFzc2UgcMOlIGF0IGFzdHJvbmF1dGVuIGlra2UgYmxpciB1dHNhdHRcbiAgICAgICAgICAgIGZvciBzdHLDpWxpbmdzbml2w6VlciBzb20gZXIgc2thZGVsaWcuXG4gICAgICAgIDwvcD5cbiAgICAgICAgPHA+VmVkIGhqZWxwIGF2IGluc3RydW1lbnRlbmUgc29tIGVyIHRpbGdqZW5nZWxpZyBtw6UgZGVyZSBqZXZubGlnXG4gICAgICAgICAgICB0YSBwcsO4dmVyIG9nIHJlZ25lIHV0IHZlcmRpZW5lIGZvciBnamVubm9tc25pdHRsaWcgb2cgdG90YWx0XG4gICAgICAgICAgICBzdHLDpWxpbmdzbml2w6UuIEZpbm5lciBkZXJlIHV0IGF0IG5pdsOlZW5lIGVyIGJsaXR0IGZhcmxpZ1xuICAgICAgICAgICAgaMO4eWUgPGVtPm3DpTwvZW0+IGRlcmUgc2kgZnJhIHRpbCBvcHBkcmFnc2xlZGVyZW4gc8OlIHZpIGthblxuICAgICAgICAgICAgZsOlIHV0IGFzdHJvbmF1dGVuIVxuICAgICAgICA8L3A+XG5cblxuICAgICAgICA8cD5cbiAgICAgICAgICAgIEVyIG9wcGRyYWdldCBmb3JzdMOldHQ/XG4gICAgICAgIDwvcD5cbiAgICA8L2Rpdj5cbn0iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICByZW5kZXIoKXtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdEVU1NWV9SRU5ERVIuIFRoaXMgcmVhY3QgY29tcG9uZW50IGlzIG5vdCBmb3IgcHJlc2VudGF0aW9uYWwgcHVycG9zZXMnKTtcbiAgICB9XG59O1xuIiwiY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuY29uc3QgUm91dGVyID0gcmVxdWlyZSgncmVhY3Qtcm91dGVyJyk7XG5jb25zdCBMaW5rID0gUm91dGVyLkxpbms7XG5cbnZhciBIZWFkZXIgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdyb3cnPlxuXG4gICAgICAgICAgICAgICAgICAgIDxoZWFkZXIgaWQ9J25hcm9tLWhlYWRlcicgPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW1nIGNsYXNzTmFtZSA9ICduYXJvbS1sb2dvLWltZycgIHNyYz0nL2ltYWdlcy9sb2dvLnBuZycgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBOQVJPTSBlLU1pc3Npb24gcHJvdG90eXBlXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9oZWFkZXI+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgICA8ZGl2IGlkPSdtYWluLWhlYWRlcicgY2xhc3NOYW1lPSdyb3cnID5cbiAgICAgICAgICAgICAgICAgICAgPExpbmsgdG89Jy8nID5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxoZWFkZXIgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxoMSBjbGFzc05hbWUgPSAnJz5VbmRlciBlbiBzb2xzdG9ybTwvaDE+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2hlYWRlcj5cbiAgICAgICAgICAgICAgICAgICAgPC9MaW5rPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBIZWFkZXI7IiwiY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuY29uc3QgUm91dGVyID0gcmVxdWlyZSgncmVhY3Qtcm91dGVyJyk7XG5jb25zdCBMaW5rID0gUm91dGVyLkxpbms7XG5cbmNvbnN0IEluZGV4QXBwID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIHJlbmRlciAoKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICA8dWw+XG4gICAgICAgICAgICAgICAgICAgICAgICA8bGk+PExpbmsgdG89XCJsZWFkZXJcIj5PcGVyYXNqb25zbGVkZXI8L0xpbms+PC9saT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxsaT48TGluayB0bz1cInRlYW0tcm9vdFwiIHBhcmFtcz17eyB0ZWFtSWQgOiAnc2NpZW5jZSd9fT5Gb3Jza25pbmdzdGVhbWV0PC9MaW5rPjwvbGk+XG4gICAgICAgICAgICAgICAgICAgIDwvdWw+XG5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gSW5kZXhBcHA7XG4iLCJjb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5jb25zdCBkaWFsb2dzID0gcmVxdWlyZSgnLi9kaWFsb2dzLnJlYWN0Jyk7XG5jb25zdCBhY3Rpb25zID0gcmVxdWlyZSgnLi4vYWN0aW9ucycpO1xuY29uc3QgeyBjbGVhblJvb3RQYXRoIH0gPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG5jb25zdCBSb3V0ZVN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL3JvdXRlLXN0b3JlJyk7XG52YXIgSW50cm9TdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3Jlcy9pbnRyb2R1Y3Rpb24tc3RvcmUnKTtcblxuIGNvbnN0IEludHJvZHVjdGlvblNjcmVlbiA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIG1peGluczogW10sXG5cbiAgICBzdGF0aWNzOiB7XG4gICAgICAgIHdpbGxUcmFuc2l0aW9uVG8odHJhbnNpdGlvbikge1xuICAgICAgICAgICAgdmFyIHRlYW1JZCA9IGNsZWFuUm9vdFBhdGgodHJhbnNpdGlvbi5wYXRoKTtcblxuICAgICAgICAgICAgaWYgKEludHJvU3RvcmUuaXNJbnRyb2R1Y3Rpb25SZWFkKHRlYW1JZCkpIHtcbiAgICAgICAgICAgICAgICB0cmFuc2l0aW9uLnJlZGlyZWN0KCd0ZWFtLXRhc2snLCB7dGFza0lkOiAnc2FtcGxlJywgdGVhbUlkIDogdGVhbUlkfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgX2hhbmRsZUNsaWNrKCkge1xuICAgICAgICB2YXIgdGVhbUlkID0gUm91dGVTdG9yZS5nZXRUZWFtSWQoKTtcbiAgICAgICAgYWN0aW9ucy5pbnRyb1dhc1JlYWQodGVhbUlkKTtcbiAgICAgICAgYWN0aW9ucy50cmFuc2l0aW9uVG8oJ3RlYW0tdGFzaycsIHt0YXNrSWQgOiAnc2FtcGxlJywgdGVhbUlkIDogdGVhbUlkIH0pXG4gICAgfSxcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIHRlYW1JZD0gUm91dGVTdG9yZS5nZXRUZWFtSWQoKTtcbiAgICAgICAgdmFyIGludHJvVGV4dCA9IGRpYWxvZ3NbdGVhbUlkICsgJ19pbnRybyddIHx8IDxwPk1hbmdsZXIgb3BwZHJhZzwvcD47XG5cbiAgICAgICAgcmV0dXJuICg8ZGl2IGNsYXNzTmFtZSA9ICdyb3cganVtYm90cm9uIGludHJvc2NyZWVuJz5cbiAgICAgICAgICAgIDxoMj5Nw6VsIGZvciBvcHBkcmFnZXQ8L2gyPlxuXG4gICAgICAgICAgICB7IGludHJvVGV4dCB9XG5cbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICBjbGFzc05hbWUgPSAnYnRuIGJ0bi1wcmltYXJ5IGJ0bi1sZydcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLl9oYW5kbGVDbGlja31cbiAgICAgICAgICAgID5KZWcgZm9yc3TDpXI8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+KVxuXG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gSW50cm9kdWN0aW9uU2NyZWVuO1xuIiwiY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuY29uc3QgYWN0aW9ucyA9IHJlcXVpcmUoJy4uL2FjdGlvbnMnKTtcblxudmFyIExpc3RNZXNzYWdlV3JhcHBlciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIHByb3BUeXBlczoge1xuICAgICAgICBsZXZlbDogUmVhY3QuUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgICAgICB0ZXh0OiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgICAgIGlkOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWRcbiAgICB9LFxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgYnV0dG9uO1xuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLmRpc21pc3NhYmxlKSB7XG4gICAgICAgICAgICBidXR0b24gPSAoXG4gICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiY2xvc2VcIlxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBhY3Rpb25zLnJlbW92ZU1lc3NhZ2UodGhpcy5wcm9wcy5pZCl9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICA8c3Bhbj7Dlzwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGxpIGNsYXNzTmFtZT17ICdhbGVydCBhbGVydC1kaXNtaXNzaWJsZSBhbGVydC0nICsgdGhpcy5wcm9wcy5sZXZlbH0gPlxuICAgICAgICAgICAgeyBidXR0b24gfVxuICAgICAgICAgICAge3RoaXMucHJvcHMudGV4dH1cbiAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbnZhciBNZXNzYWdlTGlzdCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIGhpZGRlbiA9IHRoaXMucHJvcHMubWVzc2FnZXMubGVuZ3RoID09PSAwID8gJ2hpZGUnIDogJyc7XG4gICAgICAgIHZhciBjbGFzc2VzID0gKHRoaXMucHJvcHMuY2xhc3NOYW1lIHx8ICcnKSArICcgbWVzc2FnZWJveCAnICsgaGlkZGVuO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8dWwgY2xhc3NOYW1lID0geyBjbGFzc2VzIH0+XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5tZXNzYWdlcy5tYXAoKG1zZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKDxMaXN0TWVzc2FnZVdyYXBwZXIga2V5PXttc2cuaWR9IHsuLi5tc2d9IC8+KTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgPC91bD5cbiAgICAgICAgKTtcbiAgICB9XG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1lc3NhZ2VMaXN0O1xuIiwiY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpLFxuICAgIFRpbWVyU3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZXMvdGltZXItc3RvcmUnKSxcbiAgICBUaW1lciA9IHJlcXVpcmUoJy4vdGltZXIucmVhY3QnKSxcbiAgICBjb25zdGFudHMgPSByZXF1aXJlKCcuLi9jb25zdGFudHMnKSxcbiAgICBJRCA9IGNvbnN0YW50cy5NSVNTSU9OX1RJTUVSX0lEO1xuXG5cbmNvbnN0IE1pc3Npb25UaW1lciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIGdldEluaXRpYWxTdGF0ZSgpe1xuICAgICAgICByZXR1cm4geyByZW1haW5pbmdUaW1lIDogVGltZXJTdG9yZS5nZXRSZW1haW5pbmdUaW1lKElEKSB9O1xuICAgIH0sXG4gICAgXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgVGltZXJTdG9yZS5hZGRDaGFuZ2VMaXN0ZW5lcih0aGlzLl9oYW5kbGVUaW1lQ2hhbmdlKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgVGltZXJTdG9yZS5yZW1vdmVDaGFuZ2VMaXN0ZW5lcih0aGlzLl9oYW5kbGVUaW1lQ2hhbmdlKTtcbiAgICB9LFxuXG4gICAgX2hhbmRsZVRpbWVDaGFuZ2UoKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgcmVhZHk6IFRpbWVyU3RvcmUuaXNSZWFkeVRvU3RhcnQoSUQpLFxuICAgICAgICAgICAgcmVtYWluaW5nVGltZSA6IFRpbWVyU3RvcmUuZ2V0UmVtYWluaW5nVGltZShJRClcbiAgICAgICAgfSlcbiAgICB9LFxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gKDxkaXYgY2xhc3NOYW1lPXt0aGlzLnByb3BzLmNsYXNzTmFtZX0+XG4gICAgICAgICAgICA8c3Bhbj5HamVudsOmcmVuZGUgdGlkOiA8L3NwYW4+XG4gICAgICAgICAgICA8VGltZXIgdGltZXJJZD17SUR9IHJlbWFpbmluZ1RpbWU9e3RoaXMuc3RhdGUucmVtYWluaW5nVGltZX0gLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTWlzc2lvblRpbWVyO1xuXG4iLCJjb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmNvbnN0IE5vdEZvdW5kID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPSdjb250YWluZXInPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyb3cganVtYm90cm9uXCI+XG4gICAgICAgICAgICAgICAgPGRpdj5PanNhbm4uIFRyb3IgZHUgaGFyIGfDpXR0IGRlZyB2aWxsLCBqZWc8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBOb3RGb3VuZDtcbiIsIi8qKlxuICogSW1wbGVtZW50YXRpb24gYmFzZWQgb24gdGlwcyBpbiB0aGUgYXJ0aWNsZSBieSBOaWNvbGFzIEhlcnlcbiAqIGh0dHA6Ly9uaWNvbGFzaGVyeS5jb20vaW50ZWdyYXRpbmctZDNqcy12aXN1YWxpemF0aW9ucy1pbi1hLXJlYWN0LWFwcFxuICpcbiAqIENoYXJ0IGNvZGUgbW9yZSBvciBsZXNzIGNvcGllZCBmcm9tIHRoZSBwcm90b3R5cGUgYnkgTGVvIE1hcnRpbiBXZXN0YnlcbiAqL1xuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuY29uc3QgQW1DaGFydHMgPSByZXF1aXJlKCdhbWNoYXJ0cycpO1xuY29uc3QgY29uc3RhbnRzID0gcmVxdWlyZSgnLi4vY29uc3RhbnRzJyk7XG5cbnZhciBjaGFydCwgY2hhcnRVcGRhdGVyLCBnZXROZXdWYWx1ZSwgdXBkYXRlRnJlcXVlbmN5LCBtYXhTZWNvbmRzO1xudmFyIHJhZGlhdGlvblNhbXBsZXMgPSBbXTtcblxuY29uc3QgeyByYW5kb21JbnQgfSA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbmZ1bmN0aW9uIGluaXRDaGFydChkb21FbGVtZW50KSB7XG5cbiAgICBjaGFydCA9IG5ldyBBbUNoYXJ0cy5BbVNlcmlhbENoYXJ0KCk7XG5cbiAgICBjaGFydC5tYXJnaW5Ub3AgPSAyMDtcbiAgICBjaGFydC5tYXJnaW5SaWdodCA9IDA7XG4gICAgY2hhcnQubWFyZ2luTGVmdCA9IDA7XG4gICAgY2hhcnQuYXV0b01hcmdpbk9mZnNldCA9IDA7XG4gICAgY2hhcnQuZGF0YVByb3ZpZGVyID0gcmFkaWF0aW9uU2FtcGxlcztcbiAgICBjaGFydC5jYXRlZ29yeUZpZWxkID0gXCJ0aW1lc3RhbXBcIjtcblxuICAgIC8vWCBheGlzXG4gICAgdmFyIGNhdGVnb3J5QXhpcyA9IGNoYXJ0LmNhdGVnb3J5QXhpcztcbiAgICBjYXRlZ29yeUF4aXMuZGFzaExlbmd0aCA9IDE7XG4gICAgY2F0ZWdvcnlBeGlzLmdyaWRBbHBoYSA9IDAuMTU7XG4gICAgY2F0ZWdvcnlBeGlzLmF4aXNDb2xvciA9IFwiI0RBREFEQVwiO1xuICAgIGNhdGVnb3J5QXhpcy50aXRsZSA9IFwiU2Vjb25kc1wiO1xuXG4gICAgLy9ZIGF4aXNcbiAgICB2YXIgdmFsdWVBeGlzID0gbmV3IEFtQ2hhcnRzLlZhbHVlQXhpcygpO1xuICAgIHZhbHVlQXhpcy5heGlzQWxwaGEgPSAwLjI7XG4gICAgdmFsdWVBeGlzLmRhc2hMZW5ndGggPSAxO1xuICAgIHZhbHVlQXhpcy50aXRsZSA9IFwizrxTdi9oXCI7XG4gICAgdmFsdWVBeGlzLm1pbmltdW0gPSBjb25zdGFudHMuU0NJRU5DRV9SQURJQVRJT05fTUlOO1xuICAgIHZhbHVlQXhpcy5tYXhpbXVtID0gY29uc3RhbnRzLlNDSUVOQ0VfUkFESUFUSU9OX01BWDtcbiAgICBjaGFydC5hZGRWYWx1ZUF4aXModmFsdWVBeGlzKTtcblxuICAgIC8vTGluZVxuICAgIHZhciBncmFwaCA9IG5ldyBBbUNoYXJ0cy5BbUdyYXBoKCk7XG4gICAgZ3JhcGgudmFsdWVGaWVsZCA9IFwicmFkaWF0aW9uXCI7XG4gICAgZ3JhcGguYnVsbGV0ID0gXCJyb3VuZFwiO1xuICAgIGdyYXBoLmJ1bGxldEJvcmRlckNvbG9yID0gXCIjRkZGRkZGXCI7XG4gICAgZ3JhcGguYnVsbGV0Qm9yZGVyVGhpY2tuZXNzID0gMjtcbiAgICBncmFwaC5saW5lVGhpY2tuZXNzID0gMjtcbiAgICBncmFwaC5saW5lQ29sb3IgPSBcIiNiNTAzMGRcIjtcbiAgICBncmFwaC5uZWdhdGl2ZUxpbmVDb2xvciA9IFwiIzIyOEIyMlwiO1xuICAgIGdyYXBoLm5lZ2F0aXZlQmFzZSA9IDYwO1xuICAgIGdyYXBoLmhpZGVCdWxsZXRzQ291bnQgPSA1MDtcbiAgICBjaGFydC5hZGRHcmFwaChncmFwaCk7XG5cbiAgICAvL01vdXNlb3ZlclxuICAgIGNvbnN0IGNoYXJ0Q3Vyc29yID0gbmV3IEFtQ2hhcnRzLkNoYXJ0Q3Vyc29yKCk7XG4gICAgY2hhcnRDdXJzb3IuY3Vyc29yUG9zaXRpb24gPSBcIm1vdXNlXCI7XG4gICAgY2hhcnQuYWRkQ2hhcnRDdXJzb3IoY2hhcnRDdXJzb3IpO1xuICAgIGNoYXJ0LndyaXRlKGRvbUVsZW1lbnQpO1xufVxuXG4vL0FkZHMgYSBuZXcgcmFkaWF0aW9uIHNhbXBsZSB0byB0aGUgY2hhcnQgZXZlcnkgZmV3IHNlY29uZHNcbmZ1bmN0aW9uIHN0YXJ0RXZlbnRMb29wKCkge1xuICAgIHZhciBzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuICAgIHN0b3BFdmVudExvb3AoKTtcblxuICAgIGNoYXJ0VXBkYXRlciA9IHNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHNlY29uZHNQYXNzZWQgPSAoRGF0ZS5ub3coKSAtIHN0YXJ0VGltZSkgLyAxMDAwO1xuXG4gICAgICAgIHJhZGlhdGlvblNhbXBsZXMucHVzaCh7XG4gICAgICAgICAgICB0aW1lc3RhbXA6IE1hdGguZmxvb3Ioc2Vjb25kc1Bhc3NlZCArIDAuNSksXG4gICAgICAgICAgICByYWRpYXRpb246IGdldE5ld1ZhbHVlKClcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy9XaGVuIHRoZSBjaGFydCBncm93cywgc3RhcnQgY3V0dGluZyBvZmYgdGhlIG9sZGVzdCBzYW1wbGUgdG8gZ2l2ZSB0aGUgY2hhcnQgYSBzbGlkaW5nIGVmZmVjdFxuICAgICAgICBpZiAocmFkaWF0aW9uU2FtcGxlcy5sZW5ndGggPiAobWF4U2Vjb25kcyAvIHVwZGF0ZUZyZXF1ZW5jeSkpIHtcbiAgICAgICAgICAgIHJhZGlhdGlvblNhbXBsZXMuc2hpZnQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNoYXJ0LnZhbGlkYXRlRGF0YSgpO1xuICAgIH0sIHVwZGF0ZUZyZXF1ZW5jeSAqIDEwMDApO1xufVxuXG5mdW5jdGlvbiBzdG9wRXZlbnRMb29wKCkge1xuICAgIGNsZWFySW50ZXJ2YWwoY2hhcnRVcGRhdGVyKTtcbn1cblxuY29uc3QgUmFkaWF0aW9uQ2hhcnQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBzdGF0aWNzOiB7fSxcblxuICAgIHByb3BUeXBlczoge1xuICAgICAgICB1cGRhdGVGcmVxdWVuY3lTZWNvbmRzOiBSZWFjdC5Qcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gICAgICAgIG1heFNlY29uZHNTaG93bjogUmVhY3QuUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAgICAgICBnZXROZXdWYWx1ZTogUmVhY3QuUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICAgICAgaGVpZ2h0OiBSZWFjdC5Qcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gICAgICAgIHdpZHRoOiBSZWFjdC5Qcm9wVHlwZXMubnVtYmVyXG4gICAgfSxcblxuICAgIG1peGluczogW10sXG5cbiAgICBjb21wb25lbnRXaWxsTW91bnQoKSB7XG4gICAgICAgIHVwZGF0ZUZyZXF1ZW5jeSA9IHRoaXMucHJvcHMudXBkYXRlRnJlcXVlbmN5U2Vjb25kcztcbiAgICAgICAgbWF4U2Vjb25kcyA9IHRoaXMucHJvcHMubWF4U2Vjb25kc1Nob3duO1xuICAgICAgICBnZXROZXdWYWx1ZSA9IHRoaXMucHJvcHMuZ2V0TmV3VmFsdWU7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB2YXIgZWwgPSBSZWFjdC5maW5kRE9NTm9kZSh0aGlzKTtcbiAgICAgICAgaW5pdENoYXJ0KGVsKTtcbiAgICAgICAgc3RhcnRFdmVudExvb3AoKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcygpIHtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIGNoYXJ0ICYmIGNoYXJ0LmNsZWFyKCk7XG4gICAgICAgIHN0b3BFdmVudExvb3AoKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkVW5tb3VudCgpIHtcbiAgICAgICAgY2hhcnQgPSBudWxsO1xuICAgICAgICAvL3JhZGlhdGlvblNhbXBsZXMubGVuZ3RoID0gMDtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkVXBkYXRlKCkge1xuICAgIH0sXG5cbiAgICAvLyB0aGlzIGNoYXJ0IGlzIHJlc3BvbnNpYmxlIGZvciBkcmF3aW5nIGl0c2VsZlxuICAgIHNob3VsZENvbXBvbmVudFVwZGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG5cbiAgICAvLyBQcml2YXRlIG1ldGhvZHNcblxuICAgIHJlbmRlcigpIHtcblxuICAgICAgICAvLyBpZiB5b3UgZG9uJ3Qgc3BlY2lmeSB3aWR0aCBpdCB3aWxsIG1heCBvdXQgdG8gMTAwJSAod2hpY2ggaXMgb2spXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgc3R5bGU9e3t3aWR0aDogdGhpcy5wcm9wcy53aWR0aCArICdweCcsIGhlaWdodCA6IHRoaXMucHJvcHMuaGVpZ2h0KyAncHgnfX1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e3RoaXMucHJvcHMuY2xhc3NOYW1lfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgKTtcbiAgICB9XG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJhZGlhdGlvbkNoYXJ0O1xuIiwiY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpLFxuICAgIFRpbWVyU3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZXMvdGltZXItc3RvcmUnKSxcbiAgICBSYWRpYXRpb25UYWJsZSA9IHJlcXVpcmUoJy4vcmFkaWF0aW9uLXRhYmxlLnJlYWN0JyksXG4gICAgYWN0aW9ucyA9IHJlcXVpcmUoJy4uL2FjdGlvbnMnKSxcbiAgICBjb25zdGFudHMgPSByZXF1aXJlKCcuLi9jb25zdGFudHMnKTtcblxudmFyIFJhZGlhdGlvblNhbXBsZXIgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBjb21wb25lbnRXaWxsTW91bnQoKSB7XG4gICAgICAgIFRpbWVyU3RvcmUuYWRkQ2hhbmdlTGlzdGVuZXIodGhpcy5faGFuZGxlVGltZXJDaGFuZ2UpO1xuICAgIH0sXG5cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCl7XG4gICAgICAgIFRpbWVyU3RvcmUucmVtb3ZlQ2hhbmdlTGlzdGVuZXIodGhpcy5faGFuZGxlVGltZXJDaGFuZ2UpO1xuICAgIH0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB7IHRpbWVyQWN0aXZlOiBmYWxzZSB9XG4gICAgfSxcblxuICAgIF9pc0Rpc2FibGVkKCkge1xuICAgICAgICByZXR1cm4gIXRoaXMuc3RhdGUudGltZXJBY3RpdmVcbiAgICB9LFxuXG5cbiAgICBfaGFuZGxlVGltZXJDaGFuZ2UoKSB7XG4gICAgICAgIHZhciAgYXVkaW8gPSBSZWFjdC5maW5kRE9NTm9kZSh0aGlzLnJlZnMuZ2VpZ2VyU291bmQpO1xuICAgICAgICB2YXIgdGltZXJBY3RpdmUgPSBUaW1lclN0b3JlLmlzUnVubmluZyhjb25zdGFudHMuU0NJRU5DRV9USU1FUl8xKTtcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHt0aW1lckFjdGl2ZTogdGltZXJBY3RpdmV9KTtcblxuICAgICAgICBpZih0aW1lckFjdGl2ZSAmJiBhdWRpby5wYXVzZWQpIHtcbiAgICAgICAgICAgIGF1ZGlvLnBsYXkoKTtcbiAgICAgICAgfSBlbHNlIGlmKCF0aW1lckFjdGl2ZSAmJiAhYXVkaW8ucGF1c2VkKSB7XG4gICAgICAgICAgICBhdWRpby5wYXVzZSgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIF9oYW5kbGVDbGljaygpIHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMucmFkaWF0aW9uLnNhbXBsZXMubGVuZ3RoID49IDQpIHtcbiAgICAgICAgICAgIGFjdGlvbnMuc3RvcFRpbWVyKGNvbnN0YW50cy5TQ0lFTkNFX1RJTUVSXzEpO1xuICAgICAgICAgICAgYWN0aW9ucy50cmFuc2l0aW9uVG8oJ3RlYW0tdGFzaycsIHt0ZWFtSWQgOiAnc2NpZW5jZScsIHRhc2tJZCA6ICdhdmVyYWdlJ30pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhY3Rpb25zLnRha2VSYWRpYXRpb25TYW1wbGUoKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHZhciBkaXNhYmxlZCwgY2xhc3NlcztcblxuICAgICAgICBjbGFzc2VzID0gJ2J0biBidG4tcHJpbWFyeSc7XG5cbiAgICAgICAgaWYodGhpcy5faXNEaXNhYmxlZCgpKSB7XG4gICAgICAgICAgICBjbGFzc2VzICs9ICdkaXNhYmxlZCc7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPXtcInJhZGlhdGlvbi1zYW1wbGVyIFwiICsgdGhpcy5wcm9wcy5jbGFzc05hbWV9ID5cblxuICAgICAgICAgICAgICAgIHsgLyogQXZvaWQgZmxvYXRpbmcgaW50byBwcmV2aW91cyBibG9jayAqLyB9XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyYWRpYXRpb24tc2FtcGxlcl9fcGFkZGVyIGNsZWFyZml4IHZpc2libGUteHMtYmxvY2tcIi8+XG5cbiAgICAgICAgICAgICAgICA8YXVkaW8gcmVmPVwiZ2VpZ2VyU291bmRcIiBsb29wPlxuICAgICAgICAgICAgICAgICAgICA8c291cmNlIHNyYz1cIi9zb3VuZHMvQU9TMDQ1OTVfRWxlY3RyaWNfR2VpZ2VyX0NvdW50ZXJfRmFzdC53YXZcIiB0eXBlPVwiYXVkaW8vd2F2XCIgLz5cbiAgICAgICAgICAgICAgICA8L2F1ZGlvPlxuXG4gICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc2VzfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5faGFuZGxlQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgID5UYSBzdHLDpWxpbmdzcHLDuHZlPC9idXR0b24+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L3NlY3Rpb24+XG4gICAgICAgICk7XG4gICAgfVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBSYWRpYXRpb25TYW1wbGVyOyIsImNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBzdGF0aWNzOiB7fSxcbiAgICBwcm9wVHlwZXM6IHtcbiAgICAgICAgc2FtcGxlczogUmVhY3QuUHJvcFR5cGVzLmFycmF5LmlzUmVxdWlyZWRcbiAgICB9LFxuXG4gICAgLy8gUHJpdmF0ZSBtZXRob2RzXG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17dGhpcy5wcm9wcy5jbGFzc05hbWV9ID5cblxuICAgICAgICAgICAgICAgIDxoMz5QcsO4dmVyZXN1bHRhdGVyPC9oMz5cbiAgICAgICAgICAgICAgICA8dGFibGUgY2xhc3NOYW1lPVwiIHRhYmxlIHRhYmxlLWJvcmRlcmVkXCI+XG4gICAgICAgICAgICAgICAgICAgIDxjYXB0aW9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgTWlrcm9zaWV2ZXJ0IHBlciB0aW1lICjOvFN2L2gpOlxuICAgICAgICAgICAgICAgICAgICA8L2NhcHRpb24+XG4gICAgICAgICAgICAgICAgICAgIDx0aGVhZD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGg+UHLDuHZlbnVtbWVyPC90aD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGg+zrxTdi9oPC90aD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgICAgIDwvdGhlYWQ+XG4gICAgICAgICAgICAgICAgICAgIDx0Ym9keT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLnNhbXBsZXMubWFwKCh2YWwsIGkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDx0ciBrZXk9e2l9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRoIHNjb3BlPVwicm93XCIgID57aSArIDF9PC90aD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZD57dmFsfTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIDwvdGJvZHk+XG4gICAgICAgICAgICAgICAgPC90YWJsZT5cblxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxuXG59KTtcblxuIiwiY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuY29uc3QgVGltZXJQYW5lbCA9IHJlcXVpcmUoJy4vdGltZXItcGFuZWwucmVhY3QnKTtcbmNvbnN0IFJhZGlhdGlvbkNoYXJ0ID0gcmVxdWlyZSgnLi9yYWRpYXRpb24tY2hhcnQucmVhY3QuanMnKTtcbmNvbnN0IFJhZGlhdGlvblNhbXBsZUJ1dHRvbiA9IHJlcXVpcmUoJy4vcmFkaWF0aW9uLXNhbXBsZXIucmVhY3QnKTtcbmNvbnN0IFJhZGlhdGlvblRhYmxlID0gcmVxdWlyZSgnLi9yYWRpYXRpb24tdGFibGUucmVhY3QnKTtcbmNvbnN0IFJhZGlhdGlvblN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL3JhZGlhdGlvbi1zdG9yZScpO1xuY29uc3QgY29uc3RhbnRzID0gcmVxdWlyZSgnLi4vY29uc3RhbnRzJyk7XG5jb25zdCBhY3Rpb25zID0gcmVxdWlyZSgnLi4vYWN0aW9ucycpO1xuXG5jb25zdCBTY2llbmNlVGFzayA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIHN0YXRpY3M6IHt9LFxuICAgIHByb3BUeXBlczoge30sXG4gICAgbWl4aW5zOiBbXSxcblxuICAgIC8vIGxpZmUgY3ljbGUgbWV0aG9kc1xuICAgIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJhZGlhdGlvbjogUmFkaWF0aW9uU3RvcmUuZ2V0U3RhdGUoKVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIGdldERlZmF1bHRQcm9wcygpIHtcbiAgICAgICAgcmV0dXJuIHt9O1xuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsTW91bnQoKSB7XG4gICAgICAgIFJhZGlhdGlvblN0b3JlLmFkZENoYW5nZUxpc3RlbmVyKHRoaXMuX2hhbmRsZVJhZGlhdGlvbkNoYW5nZSk7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMoKSB7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICBSYWRpYXRpb25TdG9yZS5yZW1vdmVDaGFuZ2VMaXN0ZW5lcih0aGlzLl9oYW5kbGVSYWRpYXRpb25DaGFuZ2UpO1xuICAgIH0sXG5cbiAgICAvLyBQcml2YXRlIG1ldGhvZHNcblxuICAgIF9oYW5kbGVSYWRpYXRpb25DaGFuZ2UoKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgcmFkaWF0aW9uOiBSYWRpYXRpb25TdG9yZS5nZXRTdGF0ZSgpXG4gICAgICAgIH0pXG4gICAgfSxcblxuICAgIF9oYW5kbGVBdmVyYWdlUmFkaWF0aW9uU3VibWl0KGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIGxldCBlbCA9IFJlYWN0LmZpbmRET01Ob2RlKHRoaXMucmVmc1snYXZlcmFnZS1pbnB1dCddKTtcbiAgICAgICAgbGV0IGF2ZXJhZ2UgPSBwYXJzZUludChlbC52YWx1ZS50cmltKCksIDEwKTtcblxuICAgICAgICBpZiAoaXNOYU4oYXZlcmFnZSkpIHtcbiAgICAgICAgICAgIGFjdGlvbnMuYWRkVHJhbnNpZW50TWVzc2FnZSh7XG4gICAgICAgICAgICAgICAgdGV4dDogJ0Zpa2sgZXQgdWd5bGRpZyB0YWxsLiBTa3JpdiBpbm4gZXQgZ3lsZGlnIHRhbGwuJyxcbiAgICAgICAgICAgICAgICBsZXZlbDogJ2RhbmdlcidcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0gZWxzZSBpZiAoYXZlcmFnZSkge1xuICAgICAgICAgICAgYWN0aW9ucy5hdmVyYWdlUmFkaWF0aW9uQ2FsY3VsYXRlZChhdmVyYWdlKTtcbiAgICAgICAgICAgIGFjdGlvbnMudHJhbnNpdGlvblRvKCd0ZWFtLXRhc2snLCB7dGVhbUlkOiAnc2NpZW5jZScsIHRhc2tJZDogJ2FkZHRvdGFsJ30pXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiA+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J3Jvdyc+XG4gICAgICAgICAgICAgICAgICAgIDxSYWRpYXRpb25DaGFydFxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPSdjb2wteHMtMTIgY29sLXNtLTYnXG4gICAgICAgICAgICAgICAgICAgICAgICBnZXROZXdWYWx1ZT17UmFkaWF0aW9uU3RvcmUuZ2V0TGV2ZWx9XG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVGcmVxdWVuY3lTZWNvbmRzPXsxfVxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4U2Vjb25kc1Nob3duPXszMH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodD17MjQwfVxuICAgICAgICAgICAgICAgICAgICAgICAgLz5cblxuICAgICAgICAgICAgICAgICAgICA8ZGwgY2xhc3NOYW1lPSdyYWRpYXRpb24tdmFsdWVzIGNvbC14cy02IGNvbC1zbS0zJz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkdD5Ub3RhbHQgc3Ryw6VsaW5nc25pdsOlPC9kdD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkZD57dGhpcy5zdGF0ZS5yYWRpYXRpb24udG90YWx9PC9kZD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkdD5TaXN0IGlubmxlc3Qgc3Ryw6VsaW5nc25pdsOlPC9kdD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkZD4gNjU8L2RkPlxuICAgICAgICAgICAgICAgICAgICA8L2RsPlxuXG5cbiAgICAgICAgICAgICAgICAgICAgPFJhZGlhdGlvblRhYmxlIHNhbXBsZXM9e3RoaXMuc3RhdGUucmFkaWF0aW9uLnNhbXBsZXN9IGNsYXNzTmFtZT0nY29sLXhzLTYgY29sLXNtLTMgJy8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgICA8aHIvPlxuXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyb3dcIj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdj5cblxuXG4gICAgICAgICAgICAgICAgICAgICAgICA8VGltZXJQYW5lbCBjbGFzc05hbWU9J2NvbC14cy0xMiBjb2wtc20tOCcgdGltZXJJZD17Y29uc3RhbnRzLlNDSUVOQ0VfVElNRVJfMX0vPlxuXG4gICAgICAgICAgICAgICAgICAgICAgICA8UmFkaWF0aW9uU2FtcGxlQnV0dG9uIGNsYXNzTmFtZT0nY29sLXhzLTUgY29sLXNtLTQnIHJhZGlhdGlvbj17dGhpcy5zdGF0ZS5yYWRpYXRpb259Lz5cblxuICAgICAgICAgICAgICAgICAgICAgICAgPGhyIC8+XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cImF2ZXJhZ2UtcmFkaWF0aW9uLWlucHV0IGNvbC14cy0xMiBjb2wtc20tNlwiPlxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyb3dcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGgzIGNsYXNzTmFtZT0nY29sLXhzLTEyJz5HamVubm9tc25pdHRsaWcgc3Ryw6VsaW5nPC9oMz5cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Zm9ybSBjbGFzc05hbWU9XCJjb2wteHMtOFwiIG9uU3VibWl0PXt0aGlzLl9oYW5kbGVBdmVyYWdlUmFkaWF0aW9uU3VibWl0fT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCByZWY9J2F2ZXJhZ2UtaW5wdXQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiR2plbm5vbXNuaXR0c3ZlcmRpXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9J2J0biBidG4tcHJpbWFyeSc+RXZhbHVlcjwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Zvcm0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NlY3Rpb24+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBTY2llbmNlVGFzazsiLCJjb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0JyksXG4gICAgUm91dGVyID0gcmVxdWlyZSgncmVhY3Qtcm91dGVyJyksXG4gICAgTWVzc2FnZVN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL21lc3NhZ2Utc3RvcmUnKSxcbiAgICBUYXNrU3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZXMvdGFzay1zdG9yZScpLFxuICAgIFJvdXRlU3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZXMvcm91dGUtc3RvcmUnKSxcbiAgICBNZXNzYWdlTGlzdCA9IHJlcXVpcmUoJy4vbWVzc2FnZS1saXN0LnJlYWN0JyksXG4gICAgSW50cm9kdWN0aW9uU2NyZWVuID0gcmVxdWlyZSgnLi9pbnRyb2R1Y3Rpb24tc2NyZWVuLnJlYWN0LmpzJyksXG4gICAgU2NpZW5jZVRhc2sgPSByZXF1aXJlKCcuL3NjaWVuY2UtdGFzay5yZWFjdCcpLFxuICAgIGFjdGlvbnMgPSByZXF1aXJlKCcuLi9hY3Rpb25zJyksXG4gICAgY29uc3RhbnRzID0gcmVxdWlyZSgnLi4vY29uc3RhbnRzJyk7XG5cbmNvbnN0IFRhc2sgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBtaXhpbnM6IFtdLFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy9jb25zb2xlLmxvZygnY29tcG9uZW50RGlkTW91bnQnKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIE1lc3NhZ2VTdG9yZS5hZGRDaGFuZ2VMaXN0ZW5lcih0aGlzLl9vbkNoYW5nZSk7XG4gICAgICAgIFJvdXRlU3RvcmUuYWRkQ2hhbmdlTGlzdGVuZXIodGhpcy5fb25DaGFuZ2UpO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCdjb21wb25lbnRXaWxsTW91bnQnKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy9jb25zb2xlLmxvZygnY29tcG9uZW50V2lsbFVubW91bnQnKTtcbiAgICAgICAgTWVzc2FnZVN0b3JlLnJlbW92ZUNoYW5nZUxpc3RlbmVyKHRoaXMuX29uQ2hhbmdlKTtcbiAgICAgICAgUm91dGVTdG9yZS5yZW1vdmVDaGFuZ2VMaXN0ZW5lcih0aGlzLl9vbkNoYW5nZSk7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZFVubW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy9jb25zb2xlLmxvZygnY29tcG9uZW50RGlkVW5tb3VudCcpO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRVcGRhdGUoKSB7XG4gICAgICAgIC8vY29uc29sZS5sb2coJy5jb21wb25lbnREaWRVcGRhdGUnKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhSZWFjdC5maW5kRE9NTm9kZSh0aGlzKSk7XG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZSgpIHtcblxuICAgICAgICAvKlxuICAgICAgICAgKiBZZXMsIGNoYW5naW5nIG91ciBvd24gc3RhdGUgbGlrZSB0aGlzIGlzIHByb2JhYmx5IG5vdCB0aGUgcmlnaHQgd2F5IHRvIGRvIGl0LFxuICAgICAgICAgKiBidXQgSSBjb3VsZCBub3QgdGhpbmsgb2YgYSBnb29kLCBwcm9wZXIgXCJGTFVYXCIgd2F5IHRoYXQgd291bGQgd29yayByaWdodCBub3dcbiAgICAgICAgICovXG4gICAgICAgIHNldFRpbWVvdXQoKCk9PiB0aGlzLnNldFN0YXRlKHt0YXNrSXNOZXc6IGZhbHNlfSksIDIwMDApO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBtZXNzYWdlczogTWVzc2FnZVN0b3JlLmdldE1lc3NhZ2VzKCksXG4gICAgICAgICAgICB0YXNrU3RvcmU6IFRhc2tTdG9yZS5nZXRTdGF0ZSgpLFxuICAgICAgICAgICAgcm91dGVTdG9yZTogUm91dGVTdG9yZS5nZXRSb3V0ZVN0YXRlKCksXG4gICAgICAgICAgICB0YXNrSXNOZXc6IHRydWVcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgX29uQ2hhbmdlKCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIG1lc3NhZ2VzOiBNZXNzYWdlU3RvcmUuZ2V0TWVzc2FnZXMoKSxcbiAgICAgICAgICAgIHJvdXRlU3RvcmU6IFJvdXRlU3RvcmUuZ2V0Um91dGVTdGF0ZSgpLFxuICAgICAgICAgICAgdGFza1N0b3JlOiBUYXNrU3RvcmUuZ2V0U3RhdGUoKSxcbiAgICAgICAgICAgIHRhc2tJc05ldzogdHJ1ZVxuICAgICAgICB9KTtcblxuICAgICAgICBzZXRUaW1lb3V0KCgpPT4gdGhpcy5zZXRTdGF0ZSh7dGFza0lzTmV3OiBmYWxzZX0pLCAyMDAwKTtcbiAgICB9LFxuXG4gICAgX2NyZWF0ZVN1YlRhc2tVSSgpIHtcbiAgICAgICAgcmV0dXJuICggPFNjaWVuY2VUYXNrIGFwcHN0YXRlPXt0aGlzLnN0YXRlfS8+KTtcbiAgICB9LFxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICB2YXIgY29udGVudCA9IHRoaXMuX2NyZWF0ZVN1YlRhc2tVSSgpLFxuICAgICAgICAgICAgYmxpbmsgPSB0aGlzLnN0YXRlLnRhc2tJc05ldyA/ICdibGluaycgOiAnJztcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9Jyc+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyb3dcIj5cbiAgICAgICAgICAgICAgICAgICAgPE1lc3NhZ2VMaXN0IGNsYXNzTmFtZT0nY29sLXhzLTEyJyBtZXNzYWdlcz17dGhpcy5zdGF0ZS5tZXNzYWdlc30vPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyb3dcIj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb2wteHMtMTJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdqdW1ib3Ryb24gdGFza2JveCc+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGgyIGNsYXNzTmFtZT0ndGFza2JveF9faGVhZGVyJz5PcHBnYXZlPC9oMj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9eyd0YXNrYm94X190ZXh0ICcgKyBibGlua30+IHt0aGlzLnN0YXRlLnRhc2tTdG9yZS5jdXJyZW50VGFza30gPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAge2NvbnRlbnR9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRhc2s7XG4iLCJjb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5jb25zdCBSb3V0ZVN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL3JvdXRlLXN0b3JlJyk7XG5jb25zdCB0ZWFtTmFtZXMgPSByZXF1aXJlKCcuLi90ZWFtLW5hbWUtbWFwJyk7XG5cbmNvbnN0IFRlYW1XaWRnZXQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBjb250ZXh0VHlwZXM6IHtcbiAgICAgICAgcm91dGVyOiBSZWFjdC5Qcm9wVHlwZXMuZnVuY1xuICAgIH0sXG5cbiAgICBtaXhpbnM6IFtdLFxuXG4gICAgX29uQ2hhbmdlKCkge1xuICAgICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIFJvdXRlU3RvcmUuYWRkQ2hhbmdlTGlzdGVuZXIodGhpcy5fb25DaGFuZ2UpO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgICBSb3V0ZVN0b3JlLnJlbW92ZUNoYW5nZUxpc3RlbmVyKHRoaXMuX29uQ2hhbmdlKTtcbiAgICB9LFxuXG4gICAgdGVhbU5hbWUoKSB7XG4gICAgICAgIHJldHVybiB0ZWFtTmFtZXMubmFtZU1hcFsoUm91dGVTdG9yZS5nZXRUZWFtSWQoKSldO1xuICAgIH0sXG5cbiAgICBvdGhlclRlYW1OYW1lcygpIHtcbiAgICAgICAgcmV0dXJuIHRlYW1OYW1lcy5vdGhlclRlYW1OYW1lcyhSb3V0ZVN0b3JlLmdldFRlYW1JZCgpKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyKCkge1xuXG4gICAgICAgIGlmICh0aGlzLnRlYW1OYW1lKCkpIHtcblxuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZSA9IHsgdGhpcy5wcm9wcy5jbGFzc05hbWUgKyAnIHRlYW13aWRnZXQnfSA+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZSA9ICdhY3RpdmUnID57IHRoaXMudGVhbU5hbWUoKSAgfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lID0gJyc+LCB7IHRoaXMub3RoZXJUZWFtTmFtZXMoKSB9IDwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj4gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWUgPSB7IHRoaXMucHJvcHMuY2xhc3NOYW1lIH0gPlxuICAgICAgICAgICAgICAgICAgICA8aDI+VmVsZyBsYWc8L2gyPlxuICAgICAgICAgICAgICAgIDwvZGl2PiApO1xuXG4gICAgICAgIH1cbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBUZWFtV2lkZ2V0O1xuIiwidmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKSxcbiAgICBhY3Rpb25zID0gcmVxdWlyZSgnLi4vYWN0aW9ucycpLFxuICAgIFRpbWVyID0gcmVxdWlyZSgnLi90aW1lci5yZWFjdC5qcycpLFxuICAgIFRpbWVyU3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZXMvdGltZXItc3RvcmUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBwcm9wVHlwZXM6IHtcbiAgICAgICAgdGltZXJJZDogUmVhY3QuUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkXG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dldFRpbWVyU3RhdGUoKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgVGltZXJTdG9yZS5hZGRDaGFuZ2VMaXN0ZW5lcih0aGlzLl9oYW5kbGVUaW1lU3RvcmVDaGFuZ2UpO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgICBUaW1lclN0b3JlLnJlbW92ZUNoYW5nZUxpc3RlbmVyKHRoaXMuX2hhbmRsZVRpbWVTdG9yZUNoYW5nZSk7XG4gICAgfSxcblxuICAgIHNob3VsZENvbXBvbmVudFVwZGF0ZShuZXh0UHJvcHMsIG5leHRTdGF0ZSkge1xuICAgICAgICByZXR1cm4gbmV4dFN0YXRlLnJlbWFpbmluZ1RpbWUgIT09IHRoaXMuc3RhdGUucmVtYWluaW5nVGltZTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkVXBkYXRlKCkge1xuICAgICAgICAvL2NvbnNvbGUubG9nKCdUaW1lclBhbmVsLmNvbXBvbmVudERpZFVwZGF0ZScpO1xuICAgIH0sXG5cbiAgICBfaGFuZGxlVGltZVN0b3JlQ2hhbmdlKCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHRoaXMuX2dldFRpbWVyU3RhdGUoKSk7XG4gICAgfSxcblxuICAgIF9oYW5kbGVDbGljaygpIHtcbiAgICAgICAgYWN0aW9ucy5zdGFydFRpbWVyKHRoaXMucHJvcHMudGltZXJJZCk7XG4gICAgfSxcblxuICAgIF9nZXRUaW1lclN0YXRlKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVhZHk6IFRpbWVyU3RvcmUuaXNSZWFkeVRvU3RhcnQodGhpcy5wcm9wcy50aW1lcklkKSxcbiAgICAgICAgICAgIHJlbWFpbmluZ1RpbWU6IFRpbWVyU3RvcmUuZ2V0UmVtYWluaW5nVGltZSh0aGlzLnByb3BzLnRpbWVySWQpXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT17XCJ0aW1lciBcIiArIHRoaXMucHJvcHMuY2xhc3NOYW1lIH0+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyb3dcIj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J3RpbWVyLS1idXR0b24gY29sLXhzLTUgJz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9eyAnYnRuIGJ0bi1wcmltYXJ5JyArICh0aGlzLnN0YXRlLnJlYWR5ID8gJycgOiAnZGlzYWJsZWQnICkgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX2hhbmRsZUNsaWNrfT5TdGFydCBrbG9ra2FcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J3RpbWVyLS12YWx1ZSBjb2wteHMtNiBwYWRkaW5nLXhzLTEnPlxuICAgICAgICAgICAgICAgICAgICAgICAgPFRpbWVyIHJlbWFpbmluZ1RpbWU9e3RoaXMuc3RhdGUucmVtYWluaW5nVGltZX0vPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvc2VjdGlvbj5cbiAgICAgICAgKTtcbiAgICB9XG59KSIsIi8vIFRoaXMgZXhhbXBsZSBjYW4gYmUgbW9kaWZpZWQgdG8gYWN0IGFzIGEgY291bnRkb3duIHRpbWVyXG5cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpLFxuICAgIHByaW50ZiA9IHJlcXVpcmUoJ3ByaW50ZicpO1xuXG5mdW5jdGlvbiBwYWQobnVtKSB7XG4gICAgcmV0dXJuIHByaW50ZignJTAyZCcsIG51bSk7XG59XG5cblxuY29uc3QgVGltZXIgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBwcm9wVHlwZXM6IHtcbiAgICAgICAgcmVtYWluaW5nVGltZTogUmVhY3QuUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkXG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZFVwZGF0ZSgpIHtcbiAgICAgICAgLy9jb25zb2xlLmxvZygnVGltZXIuY29tcG9uZW50RGlkVXBkYXRlJyk7XG4gICAgfSxcblxuICAgIHNob3VsZENvbXBvbmVudFVwZGF0ZShuZXh0UHJvcHMsIG5leHRTdGF0ZSkge1xuICAgICAgICByZXR1cm4gbmV4dFByb3BzLnJlbWFpbmluZ1RpbWUgIT09IHRoaXMucHJvcHMucmVtYWluaW5nVGltZTtcbiAgICB9LFxuXG4gICAgX21pbnV0ZXMoKSB7XG4gICAgICAgIHJldHVybiBwYWQoTWF0aC5tYXgoMCwgdGhpcy5wcm9wcy5yZW1haW5pbmdUaW1lKSAvIDYwID4+IDApO1xuICAgIH0sXG5cbiAgICBfc2Vjb25kcygpIHtcbiAgICAgICAgcmV0dXJuIHBhZChNYXRoLm1heCgwLCB0aGlzLnByb3BzLnJlbWFpbmluZ1RpbWUpICUgNjApO1xuICAgIH0sXG5cbiAgICBfdGltZVZhbHVlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbWludXRlcygpICsgJzonICsgdGhpcy5fc2Vjb25kcygpO1xuICAgIH0sXG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbWlzc2lvbi10aW1lci12YWx1ZSc+IHt0aGlzLl90aW1lVmFsdWUoKX08L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBUaW1lcjtcblxuIiwiY29uc3QgY29uc3RhbnRzID0ge1xuICAgIC8vIGV2ZW50c1xuICAgIFJPVVRFX0NIQU5HRURfRVZFTlQ6ICdST1VURV9DSEFOR0VEX0VWRU5UJyxcbiAgICBDSEFOR0VfRVZFTlQ6ICdDSEFOR0VfRVZFTlQnLFxuICAgIE1JU1NJT05fU1RBUlRFRF9FVkVOVDogJ01JU1NJT05fU1RBUlRFRF9FVkVOVCcsXG4gICAgTUlTU0lPTl9TVE9QUEVEX0VWRU5UOiAnTUlTU0lPTl9TVE9QUEVEX0VWRU5UJyxcbiAgICBSRU1BSU5JTkdfTUlTU0lPTl9USU1FX0NIQU5HRUQ6ICdSRU1BSU5JTkdfTUlTU0lPTl9USU1FX0NIQU5HRUQnLFxuICAgIE1JU1NJT05fVElNRU9VVDogJ01JU1NJT05fVElNRU9VVCcsXG4gICAgTUVTU0FHRV9BRERFRDogJ01FU1NBR0VfQURERUQnLFxuICAgIFJFTU9WRV9NRVNTQUdFOiAnUkVNT1ZFX01FU1NBR0UnLFxuICAgIFJPVVRFUl9BVkFJTEFCTEU6ICdST1VURVJfQVZBSUxBQkxFJyxcbiAgICBJTlRST0RVQ1RJT05fUkVBRCA6ICdJTlRST0RVQ1RJT05fUkVBRCcsXG5cbiAgICBTQ0lFTkNFX0NPVU5URE9XTl9USU1FUl9DSEFOR0VEOiAnU0NJRU5DRV9DT1VOVERPV05fVElNRVJfQ0hBTkdFRCcsXG4gICAgU0NJRU5DRV9UQUtFX1JBRElBVElPTl9TQU1QTEUgOiAnU0NJRU5DRV9UQUtFX1JBRElBVElPTl9TQU1QTEUnLFxuICAgIFNDSUVOQ0VfUkFESUFUSU9OX0xFVkVMX0NIQU5HRUQgOiAnU0NJRU5DRV9SQURJQVRJT05fTEVWRUxfQ0hBTkdFRCcsXG4gICAgU0NJRU5DRV9UT1RBTF9SQURJQVRJT05fTEVWRUxfQ0hBTkdFRCA6ICdTQ0lFTkNFX1RPVEFMX1JBRElBVElPTl9MRVZFTF9DSEFOR0VEJyxcbiAgICBTQ0lFTkNFX0FWR19SQURJQVRJT05fQ0FMQ1VMQVRFRDogJ1NDSUVOQ0VfQVZHX1JBRElBVElPTl9DQUxDVUxBVEVEJyxcblxuICAgIFNFVF9USU1FUjogJ1NFVF9USU1FUicsXG4gICAgU1RBUlRfVElNRVI6ICdTVEFSVF9USU1FUicsXG4gICAgU1RPUF9USU1FUjogJ1NUT1BfVElNRVInLFxuICAgIFJFU0VUX1RJTUVSOiAnUkVTRVRfVElNRVInLFxuICAgIC8vIG1lc3NhZ2UgaWRzXG4gICAgTk9UX1JFQURZX01TRzogJ05PVF9SRUFEWV9NU0cnLFxuICAgIFNDSUVOQ0VfUkFESUFUSU9OX1dBUk5JTkdfTVNHIDogJ1NDSUVOQ0VfUkFESUFUSU9OX1dBUk5JTkdfTVNHJyxcbiAgICAvLyBvdGhlclxuICAgIE1JU1NJT05fVElNRVJfSUQ6ICdNSVNTSU9OX1RJTUVSJyxcbiAgICBTQ0lFTkNFX1RJTUVSXzE6ICdTQ0lFTkNFX1RJTUVSXzEnLFxuXG4gICAgLy8gdmFsdWVzXG4gICAgU0NJRU5DRV9SQURJQVRJT05fTUlOIDogMCxcbiAgICBTQ0lFTkNFX1JBRElBVElPTl9NQVggOiAzMDAsXG4gICAgU0NJRU5DRV9BVkdfUkFEX0dSRUVOX1ZBTFVFOiAwLFxuICAgIFNDSUVOQ0VfQVZHX1JBRF9PUkFOR0VfVkFMVUU6IDE1LFxuICAgIFNDSUVOQ0VfQVZHX1JBRF9SRURfVkFMVUU6IDUwLFxuICAgIFNDSUVOQ0VfQVZHX1JBRF9PUkFOR0VfVEhSRVNIT0xEOiA3MCxcbiAgICBTQ0lFTkNFX0FWR19SQURfUkVEX1RIUkVTSE9MRDogMTcwLFxuICAgIFNDSUVOQ0VfVE9UQUxfUkFESUFUSU9OX1NFUklPVVNfVEhSRVNIT0xEOiA1MCxcbiAgICBTQ0lFTkNFX1RPVEFMX1JBRElBVElPTl9WRVJZX1NFUklPVVNfVEhSRVNIT0xEOiA3NVxufTtcblxuLy8gcHJldmVudCBuZXcgcHJvcGVydGllcyBmcm9tIGJlaW5nIGFkZGVkIG9yIHJlbW92ZWRcbk9iamVjdC5mcmVlemUoY29uc3RhbnRzKTtcblxud2luZG93Ll9fY29uc3RhbnRzID0gY29uc3RhbnRzO1xubW9kdWxlLmV4cG9ydHMgPSBjb25zdGFudHM7IiwiLy8gcHJveHkgYWNjZXNzIHRvIHRoZSByb3V0ZXIgYXMgZmlyc3Qgc3RlcCBpbiBicmluZ2luZyBpdCBpbnRvIHRoZSBmbHV4IGZsb3dcbi8vIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3JhY2t0L3JlYWN0LXJvdXRlci9ibG9iL21hc3Rlci9kb2NzL2d1aWRlcy9mbHV4Lm1kXG5cbnZhciByb3V0ZXI7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHRyYW5zaXRpb25Ubyh0byxwYXJhbXMscXVlcnkpIHtcbiAgICAgICAgcmV0dXJuIHJvdXRlci50cmFuc2l0aW9uVG8odG8scGFyYW1zLHF1ZXJ5KVxuICAgIH0sXG5cbiAgICBnZXRDdXJyZW50UGF0aG5hbWUoKSB7XG4gICAgICAgIHJldHVybiByb3V0ZXIuZ2V0Q3VycmVudFBhdGhuYW1lKCk7XG4gICAgfSxcblxuICAgIHJ1biguLi5hcmdzKSB7XG4gICAgICAgIHJldHVybiByb3V0ZXIucnVuKC4uLmFyZ3MpXG4gICAgfVxufTtcblxuY29uc3QgUm91dGVyID0gcmVxdWlyZSgncmVhY3Qtcm91dGVyJyk7XG5jb25zdCByb3V0ZXMgPSByZXF1aXJlKCcuL3JvdXRlcy5yZWFjdCcpO1xuXG4vLyBCeSB0aGUgdGltZSByb3V0ZSBjb25maWcgaXMgcmVxdWlyZSgpLWQsXG4vLyByZXF1aXJlKCcuL3JvdXRlcicpIGFscmVhZHkgcmV0dXJucyBhIHZhbGlkIG9iamVjdFxuXG5yb3V0ZXIgPSBSb3V0ZXIuY3JlYXRlKHtcbiAgICByb3V0ZXM6IHJvdXRlcyxcblxuICAgIC8vIFVzZSB0aGUgSFRNTDUgSGlzdG9yeSBBUEkgZm9yIGNsZWFuIFVSTHNcbiAgICBsb2NhdGlvbjogUm91dGVyLkhpc3RvcnlMb2NhdGlvblxufSk7XG4iLCJjb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5jb25zdCBSb3V0ZXIgPSByZXF1aXJlKCdyZWFjdC1yb3V0ZXInKTtcbmNvbnN0IFJvdXRlID0gUm91dGVyLlJvdXRlO1xuY29uc3QgTm90Rm91bmRSb3V0ZSA9IFJvdXRlci5Ob3RGb3VuZFJvdXRlO1xuY29uc3QgRGVmYXVsdFJvdXRlID0gUm91dGVyLkRlZmF1bHRSb3V0ZTtcblxuY29uc3QgQXBwID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL2FwcC5yZWFjdCcpO1xuY29uc3QgTWlzc2lvbkNvbW1hbmRlckFwcCA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9jb21tYW5kZXItYXBwLnJlYWN0Jyk7XG5jb25zdCBJbmRleEFwcCA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9pbmRleC1hcHAucmVhY3QnKTtcbmNvbnN0IE5vdEZvdW5kID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL25vdC1mb3VuZC5yZWFjdCcpO1xuY29uc3QgSW50cm9TY3JlZW4gPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvaW50cm9kdWN0aW9uLXNjcmVlbi5yZWFjdCcpO1xuY29uc3QgVGFzayA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy90YXNrLnJlYWN0Jyk7XG5jb25zdCBEdW1teVJlbmRlck1peGluID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL2R1bW15LXJlbmRlci5taXhpbicpO1xuXG5jb25zdCBSZWRpcmVjdFRvSW50cm8gPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBzdGF0aWNzOiB7XG4gICAgICAgIHdpbGxUcmFuc2l0aW9uVG8odHJhbnNpdGlvbikge1xuICAgICAgICAgICAgICAgIHRyYW5zaXRpb24ucmVkaXJlY3QodHJhbnNpdGlvbi5wYXRoICsgJy9pbnRybycpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIG1peGlucyA6IFtEdW1teVJlbmRlck1peGluXVxufSk7XG5cbmNvbnN0IHJvdXRlcyA9IChcbiAgICA8Um91dGUgbmFtZT1cImFwcFwiIHBhdGg9XCIvXCIgaGFuZGxlcj17QXBwfT5cblxuICAgICAgICA8Um91dGUgbmFtZT1cImxlYWRlclwiIGhhbmRsZXI9e01pc3Npb25Db21tYW5kZXJBcHB9Lz5cbiAgICAgICAgPFJvdXRlIG5hbWU9XCJ0ZWFtLXJvb3RcIiBwYXRoPScvOnRlYW1JZCcgaGFuZGxlcj17UmVkaXJlY3RUb0ludHJvfSAvPlxuICAgICAgICA8Um91dGUgbmFtZT1cInRlYW0taW50cm9cIiBwYXRoPScvOnRlYW1JZC9pbnRybycgaGFuZGxlcj17SW50cm9TY3JlZW59IC8+XG4gICAgICAgIDxSb3V0ZSBuYW1lPVwidGVhbS10YXNrXCIgcGF0aD0nLzp0ZWFtSWQvdGFzay86dGFza0lkJyBoYW5kbGVyPXtUYXNrfSAvPlxuXG4gICAgICAgIDxOb3RGb3VuZFJvdXRlIGhhbmRsZXI9e05vdEZvdW5kfS8+XG4gICAgICAgIDxEZWZhdWx0Um91dGUgaGFuZGxlcj17SW5kZXhBcHB9Lz5cbiAgICA8L1JvdXRlPlxuKTtcblxubW9kdWxlLmV4cG9ydHMgPSByb3V0ZXM7XG4iLCJjb25zdCBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKTtcbmNvbnN0IHsgQ0hBTkdFX0VWRU5UIH0gPSByZXF1aXJlKCcuLi9jb25zdGFudHMnKTtcblxudmFyIHBhdGggPSBudWxsO1xuXG5jbGFzcyBCYXNlU3RvcmUgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuXG4gICAgZW1pdENoYW5nZSgpIHtcbiAgICAgICAgdGhpcy5lbWl0KENIQU5HRV9FVkVOVCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2tcbiAgICAgKiBAcmV0dXJucyBlbWl0dGVyLCBzbyBjYWxscyBjYW4gYmUgY2hhaW5lZC5cbiAgICAgKi9cbiAgICBhZGRDaGFuZ2VMaXN0ZW5lcihjYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gdGhpcy5vbihDSEFOR0VfRVZFTlQsIGNhbGxiYWNrKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFja1xuICAgICAqIEByZXR1cm5zIGVtaXR0ZXIsIHNvIGNhbGxzIGNhbiBiZSBjaGFpbmVkLlxuICAgICAqL1xuICAgIHJlbW92ZUNoYW5nZUxpc3RlbmVyKGNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlbW92ZUxpc3RlbmVyKENIQU5HRV9FVkVOVCwgY2FsbGJhY2spO1xuICAgIH1cblxuICAgIGRpc3BhdGNoZXJJbmRleDpOdW1iZXI7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZVN0b3JlO1xuIiwiLyogSG9sZHMgdGhlIHN0YXRlIG9mIHdoZXRoZXIgaW50cm9kdWN0aW9ucyBoYXZlIGJlZW4gcmVhZCAqL1xuXG5jb25zdCBBcHBEaXNwYXRjaGVyID0gcmVxdWlyZSgnLi4vYXBwZGlzcGF0Y2hlcicpO1xuY29uc3QgQmFzZVN0b3JlID0gcmVxdWlyZSgnLi9iYXNlLXN0b3JlJyk7XG5jb25zdCBjb25zdGFudHMgPSByZXF1aXJlKCcuLi9jb25zdGFudHMnKTtcbmNvbnN0IHdpbmRvdyA9IHJlcXVpcmUoJ2dsb2JhbC93aW5kb3cnKTtcblxuY29uc3QgSW50cm9kdWN0aW9uU3RvcmUgPSBPYmplY3QuYXNzaWduKG5ldyBCYXNlU3RvcmUoKSwge1xuXG4gICAgc2V0SW50cm9kdWN0aW9uUmVhZCh0ZWFtKSB7XG4gICAgICAgIC8vIHN0aWNreSAtIGV2ZW4gYWZ0ZXIgcmVsb2FkXG4gICAgICAgIHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5zZXRJdGVtKCdpbnRyb18nK3RlYW0sIHRydWUpXG5cbiAgICAgICAgdGhpcy5lbWl0Q2hhbmdlKCk7XG4gICAgfSxcblxuICAgIGlzSW50cm9kdWN0aW9uUmVhZCh0ZWFtKSB7XG4gICAgICAgIC8vIHNlc3Npb25TdG9yYWdlIGNhbiBvbmx5IHN0b3JlIHN0cmluZ3NcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5nZXRJdGVtKCdpbnRyb18nK3RlYW0pID09PSAndHJ1ZSc7XG4gICAgfSxcblxuXG4gICAgZGlzcGF0Y2hlckluZGV4OiBBcHBEaXNwYXRjaGVyLnJlZ2lzdGVyKGZ1bmN0aW9uIChwYXlsb2FkKSB7XG4gICAgICAgIHZhciBhY3Rpb24gPSBwYXlsb2FkLmFjdGlvbjtcblxuICAgICAgICBzd2l0Y2ggKGFjdGlvbikge1xuICAgICAgICAgICAgY2FzZSBjb25zdGFudHMuSU5UUk9EVUNUSU9OX1JFQUQ6XG4gICAgICAgICAgICAgICAgSW50cm9kdWN0aW9uU3RvcmUuc2V0SW50cm9kdWN0aW9uUmVhZChwYXlsb2FkLnRlYW1OYW1lKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlOyAvLyBObyBlcnJvcnMuIE5lZWRlZCBieSBwcm9taXNlIGluIERpc3BhdGNoZXIuXG4gICAgfSlcblxufSk7XG5cbndpbmRvdy5fX0ludHJvZHVjdGlvblN0b3JlPSBJbnRyb2R1Y3Rpb25TdG9yZTtcbm1vZHVsZS5leHBvcnRzID0gSW50cm9kdWN0aW9uU3RvcmU7XG4iLCIvKiBBIHN0b3JlIHRoYXQgY2FuIGJlIHF1ZXJpZWQgZm9yIHRoZSBjdXJyZW50IHBhdGggKi9cblxuY29uc3QgeyBFbWl0dGVyIH0gPSByZXF1aXJlKCdldmVudHMnKTtcbmNvbnN0IEFwcERpc3BhdGNoZXIgPSByZXF1aXJlKCcuLi9hcHBkaXNwYXRjaGVyJyk7XG5jb25zdCBCYXNlU3RvcmUgPSByZXF1aXJlKCcuL2Jhc2Utc3RvcmUnKTtcbmNvbnN0IHsgUkVNT1ZFX01FU1NBR0UsIE1FU1NBR0VfQURERUQgfSA9IHJlcXVpcmUoJy4uL2NvbnN0YW50cycpO1xudmFyIG1lc3NhZ2VzID0ge307XG5cblxudmFyIE1lc3NhZ2VTdG9yZSA9IE9iamVjdC5hc3NpZ24obmV3IEJhc2VTdG9yZSgpLCB7XG5cbiAgICByZXNldCgpIHtcbiAgICAgICAgbWVzc2FnZXMgPSB7fTtcbiAgICAgICAgdGhpcy5lbWl0Q2hhbmdlKCk7XG4gICAgfSxcblxuICAgIGhhbmRsZUFkZGVkTWVzc2FnZShkYXRhKSB7XG4gICAgICAgIGRhdGEuZGlzbWlzc2FibGUgPSBkYXRhLmRpc21pc3NhYmxlID09PSB1bmRlZmluZWQgPyB0cnVlIDogZGF0YS5kaXNtaXNzYWJsZTtcbiAgICAgICAgbWVzc2FnZXNbZGF0YS5pZF0gPSBkYXRhO1xuICAgICAgICB0aGlzLmVtaXRDaGFuZ2UoKTtcbiAgICB9LFxuXG4gICAgaGFuZGxlUmVtb3ZlTWVzc2FnZShpZCkge1xuICAgICAgICBkZWxldGUgbWVzc2FnZXNbaWRdO1xuICAgICAgICB0aGlzLmVtaXRDaGFuZ2UoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQSBsaXN0IG9mIGFsbCBtZXNzYWdlcyBtYXRjaGluZyBmaWx0ZXJcbiAgICAgKiBAcGFyYW0gW2ZpbHRlcl1cbiAgICAgKiBAcmV0dXJucyBbXU1lc3NhZ2UgYSBNZXNzYWdlID0geyB0ZXh0LCBpZCwgbGV2ZWwgfVxuICAgICAqL1xuICAgIGdldE1lc3NhZ2VzKGZpbHRlcikge1xuICAgICAgICBpZiAoIWZpbHRlcikge1xuICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKG1lc3NhZ2VzKS5tYXAoKG1zZ0tleSk9PiAgbWVzc2FnZXNbbXNnS2V5XSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB0aHJvdyBuZXcgRXJyb3IoJ1VOSU1QTEVNRU5URUQgXCJmaWx0ZXJcIiBmZWF0dXJlJyk7XG4gICAgfSxcblxuICAgIGRpc3BhdGNoZXJJbmRleDogQXBwRGlzcGF0Y2hlci5yZWdpc3RlcihmdW5jdGlvbiAocGF5bG9hZCkge1xuICAgICAgICB2YXIgeyBhY3Rpb24sIGRhdGEgfSA9IHBheWxvYWQ7XG5cbiAgICAgICAgc3dpdGNoIChhY3Rpb24pIHtcbiAgICAgICAgICAgIGNhc2UgTUVTU0FHRV9BRERFRDpcbiAgICAgICAgICAgICAgICBNZXNzYWdlU3RvcmUuaGFuZGxlQWRkZWRNZXNzYWdlKGRhdGEpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBSRU1PVkVfTUVTU0FHRTpcbiAgICAgICAgICAgICAgICBNZXNzYWdlU3RvcmUuaGFuZGxlUmVtb3ZlTWVzc2FnZShkYXRhKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlOyAvLyBObyBlcnJvcnMuIE5lZWRlZCBieSBwcm9taXNlIGluIERpc3BhdGNoZXIuXG4gICAgfSlcblxufSk7XG5cbndpbmRvdy5fX01lc3NhZ2VTdG9yZSA9IE1lc3NhZ2VTdG9yZTtcbm1vZHVsZS5leHBvcnRzID0gTWVzc2FnZVN0b3JlO1xuIiwiLyogQSBzdG9yZSB0aGF0IGNhbiBiZSBxdWVyaWVkIGZvciB0aGUgY3VycmVudCBwYXRoICovXG5cbmNvbnN0IHsgRW1pdHRlciB9ID0gcmVxdWlyZSgnZXZlbnRzJyk7XG5jb25zdCBBcHBEaXNwYXRjaGVyID0gcmVxdWlyZSgnLi4vYXBwZGlzcGF0Y2hlcicpO1xuY29uc3QgQmFzZVN0b3JlID0gcmVxdWlyZSgnLi9iYXNlLXN0b3JlJyk7XG5jb25zdCB7IE1JU1NJT05fU1RBUlRFRF9FVkVOVCxNSVNTSU9OX1NUT1BQRURfRVZFTlQsIE5PVF9SRUFEWV9NU0cgIH0gPSAgcmVxdWlyZSgnLi4vY29uc3RhbnRzJyk7XG5cbnZhciBtaXNzaW9uUnVubmluZyA9IGZhbHNlLCBtaXNzaW9uSGFzQmVlblN0b3BwZWQgPSBmYWxzZTtcblxudmFyIE1pc3Npb25TdGF0ZVN0b3JlID0gT2JqZWN0LmFzc2lnbihuZXcgQmFzZVN0b3JlKCksIHtcblxuICAgIGhhbmRsZU1pc3Npb25TdGFydGVkKCkge1xuICAgICAgICBtaXNzaW9uUnVubmluZyA9IHRydWU7XG4gICAgICAgIG1pc3Npb25IYXNCZWVuU3RvcHBlZCA9IGZhbHNlO1xuXG4gICAgICAgIHRoaXMuZW1pdENoYW5nZSgpO1xuICAgIH0sXG5cbiAgICBoYW5kbGVNaXNzaW9uU3RvcHBlZCgpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ21pc3Npb24gc3RvcHBlZCcpXG4gICAgICAgIG1pc3Npb25SdW5uaW5nID0gZmFsc2U7XG4gICAgICAgIG1pc3Npb25IYXNCZWVuU3RvcHBlZCA9IHRydWU7XG5cbiAgICAgICAgdGhpcy5lbWl0Q2hhbmdlKCk7XG4gICAgfSxcblxuICAgIGlzTWlzc2lvblJ1bm5pbmcoKSB7XG4gICAgICAgIHJldHVybiBtaXNzaW9uUnVubmluZztcbiAgICB9LFxuXG4gICAgaXNNaXNzaW9uU3RvcHBlZCgpIHtcbiAgICAgICAgcmV0dXJuIG1pc3Npb25IYXNCZWVuU3RvcHBlZDtcbiAgICB9LFxuXG4gICAgZGlzcGF0Y2hlckluZGV4OiBBcHBEaXNwYXRjaGVyLnJlZ2lzdGVyKGZ1bmN0aW9uIChwYXlsb2FkKSB7XG4gICAgICAgIHZhciB7IGFjdGlvbn0gPSBwYXlsb2FkO1xuXG4gICAgICAgIHN3aXRjaCAoYWN0aW9uKSB7XG4gICAgICAgICAgICBjYXNlIE1JU1NJT05fU1RBUlRFRF9FVkVOVDpcbiAgICAgICAgICAgICAgICByZXR1cm4gTWlzc2lvblN0YXRlU3RvcmUuaGFuZGxlTWlzc2lvblN0YXJ0ZWQoKTtcblxuICAgICAgICAgICAgY2FzZSBNSVNTSU9OX1NUT1BQRURfRVZFTlQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIE1pc3Npb25TdGF0ZVN0b3JlLmhhbmRsZU1pc3Npb25TdG9wcGVkKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJ1ZTsgLy8gTm8gZXJyb3JzLiBOZWVkZWQgYnkgcHJvbWlzZSBpbiBEaXNwYXRjaGVyLlxuICAgIH0pXG5cbn0pO1xuXG53aW5kb3cuX19NaXNzaW9uU3RhdGVTdG9yZSA9IE1pc3Npb25TdGF0ZVN0b3JlO1xubW9kdWxlLmV4cG9ydHMgPSBNaXNzaW9uU3RhdGVTdG9yZTtcbiIsIi8qIEEgc2luZ2xldG9uIHN0b3JlIHRoYXQgY2FuIGJlIHF1ZXJpZWQgZm9yIHJlbWFpbmluZyB0aW1lICovXG5cbmNvbnN0IEFwcERpc3BhdGNoZXIgPSByZXF1aXJlKCcuLi9hcHBkaXNwYXRjaGVyJyk7XG5jb25zdCBCYXNlU3RvcmUgPSByZXF1aXJlKCcuL2Jhc2Utc3RvcmUnKTtcbmNvbnN0IGNvbnN0YW50cyA9IHJlcXVpcmUoJy4uL2NvbnN0YW50cycpO1xuY29uc3QgcmFuZG9tSW50ID0gcmVxdWlyZSgnLi4vdXRpbHMnKS5yYW5kb21JbnQ7XG5jb25zdCByYWRpYXRpb25SYW5nZSA9IHtcbiAgICBtaW4gOiAyMCxcbiAgICBtYXggOiA0MFxufTtcbnZhciBzYW1wbGVzID0gW107XG52YXIgdG90YWxSYWRpYXRpb24gPSAwO1xuXG5jb25zdCBSYWRpYXRpb25TdG9yZSA9IE9iamVjdC5hc3NpZ24obmV3IEJhc2VTdG9yZSgpLCB7XG5cbiAgICBfc2V0UmFkaWF0aW9uTGV2ZWwobWluLCBtYXgpIHtcbiAgICAgICAgcmFkaWF0aW9uUmFuZ2UubWluID0gbWluO1xuICAgICAgICByYWRpYXRpb25SYW5nZS5tYXggPSBtYXg7XG4gICAgICAgIHRoaXMuZW1pdENoYW5nZSgpO1xuICAgIH0sXG5cbiAgICBfY2xlYXJTYW1wbGVzKCkge1xuICAgICAgICBzYW1wbGVzID0gW107XG4gICAgICAgIHRoaXMuZW1pdENoYW5nZSgpO1xuICAgIH0sXG5cbiAgICBfdGFrZVNhbXBsZSgpIHtcbiAgICAgICAgaWYgKHNhbXBsZXMubGVuZ3RoIDwgNSkge1xuICAgICAgICAgICAgc2FtcGxlcy5wdXNoKHRoaXMuZ2V0TGV2ZWwoKSk7XG4gICAgICAgICAgICB0aGlzLmVtaXRDaGFuZ2UoKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBnZXRMZXZlbCgpIHtcbiAgICAgICAgcmV0dXJuIHJhbmRvbUludChyYWRpYXRpb25SYW5nZS5taW4sIHJhZGlhdGlvblJhbmdlLm1heCk7XG4gICAgfSxcblxuICAgIGdldFRvdGFsTGV2ZWwoKSB7XG4gICAgICAgIHJldHVybiB0b3RhbFJhZGlhdGlvbjtcbiAgICB9LFxuXG4gICAgZ2V0U2FtcGxlcygpIHtcbiAgICAgICAgcmV0dXJuIHNhbXBsZXMuc2xpY2UoKTtcbiAgICB9LFxuXG4gICAgZ2V0U3RhdGUoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAgIHNhbXBsZXMgOiBzYW1wbGVzLnNsaWNlKDApLFxuICAgICAgICAgIHRvdGFsOnRvdGFsUmFkaWF0aW9uLFxuICAgICAgICAgIGN1cnJlbnRMZXZlbCA6IHRoaXMuZ2V0TGV2ZWwoKVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBkaXNwYXRjaGVySW5kZXg6IEFwcERpc3BhdGNoZXIucmVnaXN0ZXIoZnVuY3Rpb24gKHBheWxvYWQpIHtcbiAgICAgICAgdmFyIHsgYWN0aW9uLCBkYXRhfSA9IHBheWxvYWQ7XG5cbiAgICAgICAgc3dpdGNoIChhY3Rpb24pIHtcbiAgICAgICAgICAgIGNhc2UgY29uc3RhbnRzLlNDSUVOQ0VfUkFESUFUSU9OX0xFVkVMX0NIQU5HRUQ6XG4gICAgICAgICAgICAgICAgUmFkaWF0aW9uU3RvcmUuX3NldFJhZGlhdGlvbkxldmVsKGRhdGEubWluLCBkYXRhLm1heCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIGNvbnN0YW50cy5TQ0lFTkNFX1RBS0VfUkFESUFUSU9OX1NBTVBMRTpcbiAgICAgICAgICAgICAgICBSYWRpYXRpb25TdG9yZS5fdGFrZVNhbXBsZSgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRydWU7IC8vIE5vIGVycm9ycy4gTmVlZGVkIGJ5IHByb21pc2UgaW4gRGlzcGF0Y2hlci5cbiAgICB9KVxuXG59KTtcblxud2luZG93Ll9fUmFkaWF0aW9uU3RvcmUgPSBSYWRpYXRpb25TdG9yZTtcbm1vZHVsZS5leHBvcnRzID0gUmFkaWF0aW9uU3RvcmU7XG4iLCIvKiBBIHN0b3JlIHRoYXQgY2FuIGJlIHF1ZXJpZWQgZm9yIHRoZSBjdXJyZW50IHBhdGggKi9cblxuY29uc3QgQXBwRGlzcGF0Y2hlciA9IHJlcXVpcmUoJy4uL2FwcGRpc3BhdGNoZXInKTtcbmNvbnN0IEJhc2VTdG9yZSA9IHJlcXVpcmUoJy4vYmFzZS1zdG9yZScpO1xuY29uc3QgeyBST1VURV9DSEFOR0VEX0VWRU5UIH0gPSByZXF1aXJlKCcuLi9jb25zdGFudHMnKTtcbmNvbnN0IHsgY2xlYW5Sb290UGF0aCB9PSByZXF1aXJlKCcuLi91dGlscycpO1xuXG52YXIgcm91dGVTdGF0ZSA9IHtwYXRobmFtZTogJzx1bnNldD4nfTtcblxudmFyIFJvdXRlU3RvcmUgPSBPYmplY3QuYXNzaWduKG5ldyBCYXNlU3RvcmUoKSwge1xuXG4gICAgaGFuZGxlUm91dGVDaGFuZ2VkKHN0YXRlKSB7XG4gICAgICAgIHJvdXRlU3RhdGUgPSBzdGF0ZTtcbiAgICAgICAgdGhpcy5lbWl0Q2hhbmdlKCk7XG4gICAgfSxcblxuICAgIGdldFBhdGhuYW1lKCkge1xuICAgICAgICB2YXIgcGF0aG5hbWUgPSByb3V0ZVN0YXRlLnBhdGhuYW1lO1xuICAgICAgICByZXR1cm4gcGF0aG5hbWUgPyBwYXRobmFtZS5zbGljZSgxKSA6ICcnO1xuICAgIH0sXG5cbiAgICBnZXRUZWFtSWQoKSB7XG4gICAgICAgIHJldHVybiByb3V0ZVN0YXRlLnBhcmFtcy50ZWFtSWQ7XG4gICAgfSxcblxuICAgIGdldFRhc2tJZCgpIHtcbiAgICAgICAgcmV0dXJuIHJvdXRlU3RhdGUucGFyYW1zLnRhc2tJZDtcbiAgICB9LFxuXG4gICAgZ2V0Um91dGVTdGF0ZSgpIHtcbiAgICAgIHJldHVybiByb3V0ZVN0YXRlO1xuICAgIH0sXG5cbiAgICBkaXNwYXRjaGVySW5kZXg6IEFwcERpc3BhdGNoZXIucmVnaXN0ZXIoZnVuY3Rpb24gKHBheWxvYWQpIHtcbiAgICAgICAgdmFyIGFjdGlvbiA9IHBheWxvYWQuYWN0aW9uO1xuXG4gICAgICAgIHN3aXRjaCAoYWN0aW9uKSB7XG4gICAgICAgICAgICBjYXNlIFJPVVRFX0NIQU5HRURfRVZFTlQ6XG4gICAgICAgICAgICAgICAgUm91dGVTdG9yZS5oYW5kbGVSb3V0ZUNoYW5nZWQocGF5bG9hZC5zdGF0ZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJ1ZTsgLy8gTm8gZXJyb3JzLiBOZWVkZWQgYnkgcHJvbWlzZSBpbiBEaXNwYXRjaGVyLlxuICAgIH0pXG5cbn0pO1xuXG53aW5kb3cuX19Sb3V0ZVN0b3JlID0gUm91dGVTdG9yZTtcbm1vZHVsZS5leHBvcnRzID0gUm91dGVTdG9yZTtcbiIsIi8qIEEgc3RvcmUgdGhhdCBjYW4gYmUgcXVlcmllZCBmb3IgdGhlIGN1cnJlbnQgcGF0aCAqL1xuXG5jb25zdCBBcHBEaXNwYXRjaGVyID0gcmVxdWlyZSgnLi4vYXBwZGlzcGF0Y2hlcicpO1xuY29uc3QgQmFzZVN0b3JlID0gcmVxdWlyZSgnLi9iYXNlLXN0b3JlJyk7XG5jb25zdCBSb3V0ZVN0b3JlID0gcmVxdWlyZSgnLi9yb3V0ZS1zdG9yZScpO1xuY29uc3QgY29uc3RhbnRzID0gcmVxdWlyZSgnLi4vY29uc3RhbnRzJyk7XG5cblxuY29uc3QgYXNzaWdubWVudHMgPSB7XG4gICAgc2NpZW5jZToge1xuICAgICAgICBzYW1wbGU6ICdTdGFydCBrbG9ra2Egb2cgdGEgZmlyZSBtw6VsaW5nZXIgZm9yZGVsdCBqZXZudCB1dG92ZXIgdGlkc2ludGVydmFsbGV0JyxcbiAgICAgICAgYXZlcmFnZTogJ1JlZ24gdXQgZ2plbm5vbXNuaXR0c3ZlcmRpZW4gYXYgc3Ryw6VsaW5nc3ZlcmRpZW5lIGRlcmUgZmFudC4gU2tyaXYgZGVuIGlubiBpIHRla3N0ZmVsdGV0LidcbiAgICB9XG59O1xuXG4vL3ZhciBjdXJyZW50VGFzayA9IHtcbi8vICAgIHNjaWVuY2U6ICdzYW1wbGUnXG4vL307XG5cbnZhciBUYXNrU3RvcmUgPSBPYmplY3QuYXNzaWduKG5ldyBCYXNlU3RvcmUoKSwge1xuXG4gICAgZ2V0Q3VycmVudFRhc2soKSB7XG4gICAgICAgIHZhciB0ZWFtSWQgPSBSb3V0ZVN0b3JlLmdldFRlYW1JZCgpO1xuICAgICAgICB2YXIgdGFza0lkID0gUm91dGVTdG9yZS5nZXRUYXNrSWQoKTtcbiAgICAgICAgdmFyIGFzc2lnbm1lbnRzRm9yVGVhbSA9IGFzc2lnbm1lbnRzW3RlYW1JZF07XG5cbiAgICAgICAgcmV0dXJuIChhc3NpZ25tZW50c0ZvclRlYW0gJiYgYXNzaWdubWVudHNGb3JUZWFtW3Rhc2tJZF0pXG4gICAgICAgICAgICB8fCAnSW5nZW4gb3BwZ2F2ZSBmdW5uZXQnO1xuICAgIH0sXG5cbiAgICBnZXRDdXJyZW50VGFza0lkKCkge1xuICAgICAgICAvL3ZhciB0ZWFtSWQgPSBSb3V0ZVN0b3JlLmdldFRlYW1JZCgpO1xuICAgICAgICByZXR1cm4gUm91dGVTdG9yZS5nZXRUYXNrSWQoKTtcbiAgICAgICAgLy9yZXR1cm4gY3VycmVudFRhc2tbdGVhbUlkXTtcbiAgICB9LFxuXG4gICAgZ2V0U3RhdGUoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAgIGN1cnJlbnRUYXNrSWQ6IHRoaXMuZ2V0Q3VycmVudFRhc2tJZCgpLFxuICAgICAgICAgIGN1cnJlbnRUYXNrOiB0aGlzLmdldEN1cnJlbnRUYXNrKClcbiAgICAgIH07XG4gICAgfSxcblxuICAgIGRpc3BhdGNoZXJJbmRleDogQXBwRGlzcGF0Y2hlci5yZWdpc3RlcihmdW5jdGlvbiAocGF5bG9hZCkge1xuXG4gICAgICAgIHJldHVybiB0cnVlOyAvLyBObyBlcnJvcnMuIE5lZWRlZCBieSBwcm9taXNlIGluIERpc3BhdGNoZXIuXG4gICAgfSlcblxufSk7XG5cbndpbmRvdy5fX1Rhc2tTdG9yZSA9IFRhc2tTdG9yZTtcbm1vZHVsZS5leHBvcnRzID0gVGFza1N0b3JlO1xuIiwiLyogQSBzaW5nbGV0b24gc3RvcmUgdGhhdCBjYW4gYmUgcXVlcmllZCBmb3IgcmVtYWluaW5nIHRpbWUgKi9cblxuY29uc3QgY2hlY2sgPSByZXF1aXJlKCdjaGVjay10eXBlcycpO1xuY29uc3QgQXBwRGlzcGF0Y2hlciA9IHJlcXVpcmUoJy4uL2FwcGRpc3BhdGNoZXInKTtcbmNvbnN0IEJhc2VTdG9yZSA9IHJlcXVpcmUoJy4vYmFzZS1zdG9yZScpO1xuY29uc3QgY29uc3RhbnRzID0gcmVxdWlyZSgnLi4vY29uc3RhbnRzJyk7XG5cbi8vIGtlZXBpbmcgc3RhdGUgaGlkZGVuIGluIHRoZSBtb2R1bGVcbnZhciByZW1haW5pbmdUaW1lID0ge30sXG4gICAgaW5pdGlhbFRpbWUgPSB7fSxcbiAgICBpbnRlcnZhbElkID0ge307XG5cblxuZnVuY3Rpb24gcmVzZXQodGltZXJJZCkge1xuICAgIHN0b3AodGltZXJJZCk7XG4gICAgcmVtYWluaW5nVGltZVt0aW1lcklkXSA9IGluaXRpYWxUaW1lW3RpbWVySWRdO1xufVxuXG5mdW5jdGlvbiBzdGFydCh0aW1lcklkKSB7XG4gICAgYXNzZXJ0RXhpc3RzKHRpbWVySWQpO1xuXG4gICAgaW50ZXJ2YWxJZFt0aW1lcklkXSA9IHNldEludGVydmFsKGZ1bmN0aW9uIGZuKCkge1xuICAgICAgICBpZiAocmVtYWluaW5nVGltZVt0aW1lcklkXSA+IDApIHtcbiAgICAgICAgICAgIHJlbWFpbmluZ1RpbWVbdGltZXJJZF0tLTtcbiAgICAgICAgICAgIFRpbWVyU3RvcmUuZW1pdENoYW5nZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RvcCh0aW1lcklkKTtcbiAgICAgICAgfVxuICAgIH0sIDEwMDApO1xufVxuXG5mdW5jdGlvbiBzdG9wKHRpbWVySWQpIHtcbiAgICBhc3NlcnRFeGlzdHModGltZXJJZCk7XG5cbiAgICBjbGVhckludGVydmFsKGludGVydmFsSWRbdGltZXJJZF0pO1xuICAgIGRlbGV0ZSBpbnRlcnZhbElkW3RpbWVySWRdO1xuICAgIFRpbWVyU3RvcmUuZW1pdENoYW5nZSgpO1xufVxuXG4vKipcbiAqIEBwYXJhbSBkYXRhLnJlbWFpbmluZ1RpbWUge051bWJlcn1cbiAqIEBwYXJhbSBkYXRhLnRpbWVySWQge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gaGFuZGxlUmVtYWluaW5nVGltZUNoYW5nZWQoZGF0YSkge1xuICAgIHZhciByZW1haW5pbmcgPSBkYXRhLnJlbWFpbmluZ1RpbWU7XG4gICAgaWYgKHJlbWFpbmluZyA8PSAwKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdHb3QgaW52YWxpZCByZW1haW5pbmcgdGltZSA6JyArIHJlbWFpbmluZyk7XG5cbiAgICByZW1haW5pbmdUaW1lW2RhdGEudGltZXJJZF0gPSByZW1haW5pbmc7XG4gICAgaW5pdGlhbFRpbWVbZGF0YS50aW1lcklkXSA9IHJlbWFpbmluZztcbiAgICBUaW1lclN0b3JlLmVtaXRDaGFuZ2UoKTtcbn1cblxuZnVuY3Rpb24gYXNzZXJ0RXhpc3RzKHRpbWVySWQpIHtcbiAgICBjaGVjay5hc3NlcnQodGltZXJJZCBpbiByZW1haW5pbmdUaW1lLCAnTm8gdGltZSBzZXQgZm9yIHRpbWVyIHdpdGggaWQgJyArIHRpbWVySWQpO1xufVxuXG5jb25zdCBUaW1lclN0b3JlID0gT2JqZWN0LmFzc2lnbihuZXcgQmFzZVN0b3JlKCksIHtcbiAgICBcbiAgICBnZXRSZW1haW5pbmdUaW1lKHRpbWVySWQpIHtcbiAgICAgICAgY2hlY2subnVtYmVyKHRpbWVySWQpO1xuICAgICAgICByZXR1cm4gcmVtYWluaW5nVGltZVt0aW1lcklkXTtcbiAgICB9LFxuXG4gICAgaXNSdW5uaW5nKHRpbWVySWQpIHtcbiAgICAgICAgY2hlY2subnVtYmVyKHRpbWVySWQpO1xuICAgICAgICByZXR1cm4gISFpbnRlcnZhbElkW3RpbWVySWRdO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUaGUgdGltZXIgaXMgc2V0IChvciBoYXMgYmVlbiByZXNldCksIGJ1dCBub3Qgc3RhcnRlZFxuICAgICAqIEBwYXJhbSB0aW1lcklkXG4gICAgICogQHJldHVybnMgdHJ1ZSBpZiByZWFkeSwgZmFsc2UgaWYgcnVubmluZyBvciB0aW1lZCBvdXRcbiAgICAgKi9cbiAgICBpc1JlYWR5VG9TdGFydCh0aW1lcklkKSB7XG4gICAgICAgIGNoZWNrLm51bWJlcih0aW1lcklkKTtcbiAgICAgICAgXG4gICAgICAgIGlmKHRoaXMuaXNSdW5uaW5nKHRpbWVySWQpKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFJlbWFpbmluZ1RpbWUodGltZXJJZCkgPiAwO1xuICAgIH0sXG5cbiAgICBkaXNwYXRjaGVySW5kZXg6IEFwcERpc3BhdGNoZXIucmVnaXN0ZXIoZnVuY3Rpb24gKHBheWxvYWQpIHtcbiAgICAgICAgdmFyIHsgYWN0aW9uLCBkYXRhfSA9IHBheWxvYWQ7XG5cbiAgICAgICAgc3dpdGNoIChhY3Rpb24pIHtcblxuICAgICAgICAgICAgY2FzZSBjb25zdGFudHMuU0VUX1RJTUVSOlxuICAgICAgICAgICAgICAgIGhhbmRsZVJlbWFpbmluZ1RpbWVDaGFuZ2VkKGRhdGEpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIGNvbnN0YW50cy5TVEFSVF9USU1FUjpcbiAgICAgICAgICAgICAgICBhc3NlcnRFeGlzdHMoZGF0YS50aW1lcklkKTtcblxuICAgICAgICAgICAgICAgIC8vIGF2b2lkIHNldHRpbmcgdXAgbW9yZSB0aGFuIG9uZSB0aW1lclxuICAgICAgICAgICAgICAgIGlmKCFUaW1lclN0b3JlLmlzUnVubmluZyhkYXRhLnRpbWVySWQpKXtcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQoZGF0YS50aW1lcklkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgY29uc3RhbnRzLlNUT1BfVElNRVI6XG4gICAgICAgICAgICAgICAgc3RvcChkYXRhLnRpbWVySWQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIGNvbnN0YW50cy5SRVNFVF9USU1FUjpcbiAgICAgICAgICAgICAgICByZXNldChkYXRhLnRpbWVySWQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRydWU7IC8vIE5vIGVycm9ycy4gTmVlZGVkIGJ5IHByb21pc2UgaW4gRGlzcGF0Y2hlci5cbiAgICB9KVxuXG59KTtcblxud2luZG93Ll9fVGltZVN0b3JlID0gVGltZXJTdG9yZTtcbm1vZHVsZS5leHBvcnRzID0gVGltZXJTdG9yZTtcbiIsImNvbnN0IHRlYW1NYXAgPSBPYmplY3QuZnJlZXplKHtcbiAgICAnbGVhZGVyJzogJ29wZXJhc2pvbnNsZWRlcicsXG4gICAgJ3NjaWVuY2UnOiAnZm9yc2tuaW5nc3RlYW0nLFxuICAgICdjb21tdW5pY2F0aW9uJzogJ2tvbW11bmlrYXNqb25zdGVhbScsXG4gICAgJ3NlY3VyaXR5JzogJ3Npa2tlcmhldHN0ZWFtJyxcbiAgICAnYXN0cm9uYXV0JzogJ2FzdHJvbmF1dHRlYW0nXG59KTtcblxuZnVuY3Rpb24gb3RoZXJUZWFtTmFtZXMoY3VycmVudFRlYW1JZCkge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyh0ZWFtTWFwKVxuICAgICAgICAuZmlsdGVyKChuKSA9PiBuICE9PSBjdXJyZW50VGVhbUlkICYmIG4gIT09ICdsZWFkZXInKVxuICAgICAgICAubWFwKChuKSA9PiB0ZWFtTWFwW25dKVxuICAgICAgICAuam9pbignLCAnKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBuYW1lTWFwOiB0ZWFtTWFwLFxuICAgIG90aGVyVGVhbU5hbWVzXG59O1xuIiwiZnVuY3Rpb24gY2xlYW5Sb290UGF0aChwYXRoKSB7XG4gICAgLy8gY29udmVydCAnL3NjaWVuY2Uvc3RlcDEnID0+ICdzY2llbmNlJ1xuICAgIHJldHVybiBwYXRoLnJlcGxhY2UoL1xcLz8oXFx3KykuKi8sIFwiJDFcIik7XG59XG5cbmZ1bmN0aW9uIHJhbmRvbUludCAobWluLCBtYXgpIHtcbiAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCArIDEgLSBtaW4pKSArIG1pbjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgY2xlYW5Sb290UGF0aCwgcmFuZG9tSW50XG59O1xuIiwiLy8gZ2VuZXJhdGVzIGEgVVVJRFxuLy8gd29ybGRzIHNtYWxsZXN0IHV1aWQgbGliLiBjcmF6eSBzaGl0IDopXG4vLyBAc2VlIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL2plZC85ODI4ODNcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYihhKXtyZXR1cm4gYT8oYV5NYXRoLnJhbmRvbSgpKjE2Pj5hLzQpLnRvU3RyaW5nKDE2KTooWzFlN10rLTFlMystNGUzKy04ZTMrLTFlMTEpLnJlcGxhY2UoL1swMThdL2csYil9IiwiLyoqXG4gKiBDb3JlLmpzIDAuNi4xXG4gKiBodHRwczovL2dpdGh1Yi5jb20vemxvaXJvY2svY29yZS1qc1xuICogTGljZW5zZTogaHR0cDovL3JvY2subWl0LWxpY2Vuc2Uub3JnXG4gKiDCqSAyMDE1IERlbmlzIFB1c2hrYXJldlxuICovXG4hZnVuY3Rpb24oZ2xvYmFsLCBmcmFtZXdvcmssIHVuZGVmaW5lZCl7XG4ndXNlIHN0cmljdCc7XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIE1vZHVsZSA6IGNvbW1vbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiAgLy8gU2hvcnRjdXRzIGZvciBbW0NsYXNzXV0gJiBwcm9wZXJ0eSBuYW1lc1xyXG52YXIgT0JKRUNUICAgICAgICAgID0gJ09iamVjdCdcclxuICAsIEZVTkNUSU9OICAgICAgICA9ICdGdW5jdGlvbidcclxuICAsIEFSUkFZICAgICAgICAgICA9ICdBcnJheSdcclxuICAsIFNUUklORyAgICAgICAgICA9ICdTdHJpbmcnXHJcbiAgLCBOVU1CRVIgICAgICAgICAgPSAnTnVtYmVyJ1xyXG4gICwgUkVHRVhQICAgICAgICAgID0gJ1JlZ0V4cCdcclxuICAsIERBVEUgICAgICAgICAgICA9ICdEYXRlJ1xyXG4gICwgTUFQICAgICAgICAgICAgID0gJ01hcCdcclxuICAsIFNFVCAgICAgICAgICAgICA9ICdTZXQnXHJcbiAgLCBXRUFLTUFQICAgICAgICAgPSAnV2Vha01hcCdcclxuICAsIFdFQUtTRVQgICAgICAgICA9ICdXZWFrU2V0J1xyXG4gICwgU1lNQk9MICAgICAgICAgID0gJ1N5bWJvbCdcclxuICAsIFBST01JU0UgICAgICAgICA9ICdQcm9taXNlJ1xyXG4gICwgTUFUSCAgICAgICAgICAgID0gJ01hdGgnXHJcbiAgLCBBUkdVTUVOVFMgICAgICAgPSAnQXJndW1lbnRzJ1xyXG4gICwgUFJPVE9UWVBFICAgICAgID0gJ3Byb3RvdHlwZSdcclxuICAsIENPTlNUUlVDVE9SICAgICA9ICdjb25zdHJ1Y3RvcidcclxuICAsIFRPX1NUUklORyAgICAgICA9ICd0b1N0cmluZydcclxuICAsIFRPX1NUUklOR19UQUcgICA9IFRPX1NUUklORyArICdUYWcnXHJcbiAgLCBUT19MT0NBTEUgICAgICAgPSAndG9Mb2NhbGVTdHJpbmcnXHJcbiAgLCBIQVNfT1dOICAgICAgICAgPSAnaGFzT3duUHJvcGVydHknXHJcbiAgLCBGT1JfRUFDSCAgICAgICAgPSAnZm9yRWFjaCdcclxuICAsIElURVJBVE9SICAgICAgICA9ICdpdGVyYXRvcidcclxuICAsIEZGX0lURVJBVE9SICAgICA9ICdAQCcgKyBJVEVSQVRPUlxyXG4gICwgUFJPQ0VTUyAgICAgICAgID0gJ3Byb2Nlc3MnXHJcbiAgLCBDUkVBVEVfRUxFTUVOVCAgPSAnY3JlYXRlRWxlbWVudCdcclxuICAvLyBBbGlhc2VzIGdsb2JhbCBvYmplY3RzIGFuZCBwcm90b3R5cGVzXHJcbiAgLCBGdW5jdGlvbiAgICAgICAgPSBnbG9iYWxbRlVOQ1RJT05dXHJcbiAgLCBPYmplY3QgICAgICAgICAgPSBnbG9iYWxbT0JKRUNUXVxyXG4gICwgQXJyYXkgICAgICAgICAgID0gZ2xvYmFsW0FSUkFZXVxyXG4gICwgU3RyaW5nICAgICAgICAgID0gZ2xvYmFsW1NUUklOR11cclxuICAsIE51bWJlciAgICAgICAgICA9IGdsb2JhbFtOVU1CRVJdXHJcbiAgLCBSZWdFeHAgICAgICAgICAgPSBnbG9iYWxbUkVHRVhQXVxyXG4gICwgRGF0ZSAgICAgICAgICAgID0gZ2xvYmFsW0RBVEVdXHJcbiAgLCBNYXAgICAgICAgICAgICAgPSBnbG9iYWxbTUFQXVxyXG4gICwgU2V0ICAgICAgICAgICAgID0gZ2xvYmFsW1NFVF1cclxuICAsIFdlYWtNYXAgICAgICAgICA9IGdsb2JhbFtXRUFLTUFQXVxyXG4gICwgV2Vha1NldCAgICAgICAgID0gZ2xvYmFsW1dFQUtTRVRdXHJcbiAgLCBTeW1ib2wgICAgICAgICAgPSBnbG9iYWxbU1lNQk9MXVxyXG4gICwgTWF0aCAgICAgICAgICAgID0gZ2xvYmFsW01BVEhdXHJcbiAgLCBUeXBlRXJyb3IgICAgICAgPSBnbG9iYWwuVHlwZUVycm9yXHJcbiAgLCBSYW5nZUVycm9yICAgICAgPSBnbG9iYWwuUmFuZ2VFcnJvclxyXG4gICwgc2V0VGltZW91dCAgICAgID0gZ2xvYmFsLnNldFRpbWVvdXRcclxuICAsIHNldEltbWVkaWF0ZSAgICA9IGdsb2JhbC5zZXRJbW1lZGlhdGVcclxuICAsIGNsZWFySW1tZWRpYXRlICA9IGdsb2JhbC5jbGVhckltbWVkaWF0ZVxyXG4gICwgcGFyc2VJbnQgICAgICAgID0gZ2xvYmFsLnBhcnNlSW50XHJcbiAgLCBpc0Zpbml0ZSAgICAgICAgPSBnbG9iYWwuaXNGaW5pdGVcclxuICAsIHByb2Nlc3MgICAgICAgICA9IGdsb2JhbFtQUk9DRVNTXVxyXG4gICwgbmV4dFRpY2sgICAgICAgID0gcHJvY2VzcyAmJiBwcm9jZXNzLm5leHRUaWNrXHJcbiAgLCBkb2N1bWVudCAgICAgICAgPSBnbG9iYWwuZG9jdW1lbnRcclxuICAsIGh0bWwgICAgICAgICAgICA9IGRvY3VtZW50ICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudFxyXG4gICwgbmF2aWdhdG9yICAgICAgID0gZ2xvYmFsLm5hdmlnYXRvclxyXG4gICwgZGVmaW5lICAgICAgICAgID0gZ2xvYmFsLmRlZmluZVxyXG4gICwgY29uc29sZSAgICAgICAgID0gZ2xvYmFsLmNvbnNvbGUgfHwge31cclxuICAsIEFycmF5UHJvdG8gICAgICA9IEFycmF5W1BST1RPVFlQRV1cclxuICAsIE9iamVjdFByb3RvICAgICA9IE9iamVjdFtQUk9UT1RZUEVdXHJcbiAgLCBGdW5jdGlvblByb3RvICAgPSBGdW5jdGlvbltQUk9UT1RZUEVdXHJcbiAgLCBJbmZpbml0eSAgICAgICAgPSAxIC8gMFxyXG4gICwgRE9UICAgICAgICAgICAgID0gJy4nO1xyXG5cclxuLy8gaHR0cDovL2pzcGVyZi5jb20vY29yZS1qcy1pc29iamVjdFxyXG5mdW5jdGlvbiBpc09iamVjdChpdCl7XHJcbiAgcmV0dXJuIGl0ICE9PSBudWxsICYmICh0eXBlb2YgaXQgPT0gJ29iamVjdCcgfHwgdHlwZW9mIGl0ID09ICdmdW5jdGlvbicpO1xyXG59XHJcbmZ1bmN0aW9uIGlzRnVuY3Rpb24oaXQpe1xyXG4gIHJldHVybiB0eXBlb2YgaXQgPT0gJ2Z1bmN0aW9uJztcclxufVxyXG4vLyBOYXRpdmUgZnVuY3Rpb24/XHJcbnZhciBpc05hdGl2ZSA9IGN0eCgvLi8udGVzdCwgL1xcW25hdGl2ZSBjb2RlXFxdXFxzKlxcfVxccyokLywgMSk7XHJcblxyXG4vLyBPYmplY3QgaW50ZXJuYWwgW1tDbGFzc11dIG9yIHRvU3RyaW5nVGFnXHJcbi8vIGh0dHA6Ly9wZW9wbGUubW96aWxsYS5vcmcvfmpvcmVuZG9yZmYvZXM2LWRyYWZ0Lmh0bWwjc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmdcclxudmFyIHRvU3RyaW5nID0gT2JqZWN0UHJvdG9bVE9fU1RSSU5HXTtcclxuZnVuY3Rpb24gc2V0VG9TdHJpbmdUYWcoaXQsIHRhZywgc3RhdCl7XHJcbiAgaWYoaXQgJiYgIWhhcyhpdCA9IHN0YXQgPyBpdCA6IGl0W1BST1RPVFlQRV0sIFNZTUJPTF9UQUcpKWhpZGRlbihpdCwgU1lNQk9MX1RBRywgdGFnKTtcclxufVxyXG5mdW5jdGlvbiBjb2YoaXQpe1xyXG4gIHJldHVybiB0b1N0cmluZy5jYWxsKGl0KS5zbGljZSg4LCAtMSk7XHJcbn1cclxuZnVuY3Rpb24gY2xhc3NvZihpdCl7XHJcbiAgdmFyIE8sIFQ7XHJcbiAgcmV0dXJuIGl0ID09IHVuZGVmaW5lZCA/IGl0ID09PSB1bmRlZmluZWQgPyAnVW5kZWZpbmVkJyA6ICdOdWxsJ1xyXG4gICAgOiB0eXBlb2YgKFQgPSAoTyA9IE9iamVjdChpdCkpW1NZTUJPTF9UQUddKSA9PSAnc3RyaW5nJyA/IFQgOiBjb2YoTyk7XHJcbn1cclxuXHJcbi8vIEZ1bmN0aW9uXHJcbnZhciBjYWxsICA9IEZ1bmN0aW9uUHJvdG8uY2FsbFxyXG4gICwgYXBwbHkgPSBGdW5jdGlvblByb3RvLmFwcGx5XHJcbiAgLCBSRUZFUkVOQ0VfR0VUO1xyXG4vLyBQYXJ0aWFsIGFwcGx5XHJcbmZ1bmN0aW9uIHBhcnQoLyogLi4uYXJncyAqLyl7XHJcbiAgdmFyIGZuICAgICA9IGFzc2VydEZ1bmN0aW9uKHRoaXMpXHJcbiAgICAsIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGhcclxuICAgICwgYXJncyAgID0gQXJyYXkobGVuZ3RoKVxyXG4gICAgLCBpICAgICAgPSAwXHJcbiAgICAsIF8gICAgICA9IHBhdGguX1xyXG4gICAgLCBob2xkZXIgPSBmYWxzZTtcclxuICB3aGlsZShsZW5ndGggPiBpKWlmKChhcmdzW2ldID0gYXJndW1lbnRzW2krK10pID09PSBfKWhvbGRlciA9IHRydWU7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uKC8qIC4uLmFyZ3MgKi8pe1xyXG4gICAgdmFyIHRoYXQgICAgPSB0aGlzXHJcbiAgICAgICwgX2xlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGhcclxuICAgICAgLCBpID0gMCwgaiA9IDAsIF9hcmdzO1xyXG4gICAgaWYoIWhvbGRlciAmJiAhX2xlbmd0aClyZXR1cm4gaW52b2tlKGZuLCBhcmdzLCB0aGF0KTtcclxuICAgIF9hcmdzID0gYXJncy5zbGljZSgpO1xyXG4gICAgaWYoaG9sZGVyKWZvcig7bGVuZ3RoID4gaTsgaSsrKWlmKF9hcmdzW2ldID09PSBfKV9hcmdzW2ldID0gYXJndW1lbnRzW2orK107XHJcbiAgICB3aGlsZShfbGVuZ3RoID4gailfYXJncy5wdXNoKGFyZ3VtZW50c1tqKytdKTtcclxuICAgIHJldHVybiBpbnZva2UoZm4sIF9hcmdzLCB0aGF0KTtcclxuICB9XHJcbn1cclxuLy8gT3B0aW9uYWwgLyBzaW1wbGUgY29udGV4dCBiaW5kaW5nXHJcbmZ1bmN0aW9uIGN0eChmbiwgdGhhdCwgbGVuZ3RoKXtcclxuICBhc3NlcnRGdW5jdGlvbihmbik7XHJcbiAgaWYofmxlbmd0aCAmJiB0aGF0ID09PSB1bmRlZmluZWQpcmV0dXJuIGZuO1xyXG4gIHN3aXRjaChsZW5ndGgpe1xyXG4gICAgY2FzZSAxOiByZXR1cm4gZnVuY3Rpb24oYSl7XHJcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEpO1xyXG4gICAgfVxyXG4gICAgY2FzZSAyOiByZXR1cm4gZnVuY3Rpb24oYSwgYil7XHJcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEsIGIpO1xyXG4gICAgfVxyXG4gICAgY2FzZSAzOiByZXR1cm4gZnVuY3Rpb24oYSwgYiwgYyl7XHJcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEsIGIsIGMpO1xyXG4gICAgfVxyXG4gIH0gcmV0dXJuIGZ1bmN0aW9uKC8qIC4uLmFyZ3MgKi8pe1xyXG4gICAgICByZXR1cm4gZm4uYXBwbHkodGhhdCwgYXJndW1lbnRzKTtcclxuICB9XHJcbn1cclxuLy8gRmFzdCBhcHBseVxyXG4vLyBodHRwOi8vanNwZXJmLmxua2l0LmNvbS9mYXN0LWFwcGx5LzVcclxuZnVuY3Rpb24gaW52b2tlKGZuLCBhcmdzLCB0aGF0KXtcclxuICB2YXIgdW4gPSB0aGF0ID09PSB1bmRlZmluZWQ7XHJcbiAgc3dpdGNoKGFyZ3MubGVuZ3RoIHwgMCl7XHJcbiAgICBjYXNlIDA6IHJldHVybiB1biA/IGZuKClcclxuICAgICAgICAgICAgICAgICAgICAgIDogZm4uY2FsbCh0aGF0KTtcclxuICAgIGNhc2UgMTogcmV0dXJuIHVuID8gZm4oYXJnc1swXSlcclxuICAgICAgICAgICAgICAgICAgICAgIDogZm4uY2FsbCh0aGF0LCBhcmdzWzBdKTtcclxuICAgIGNhc2UgMjogcmV0dXJuIHVuID8gZm4oYXJnc1swXSwgYXJnc1sxXSlcclxuICAgICAgICAgICAgICAgICAgICAgIDogZm4uY2FsbCh0aGF0LCBhcmdzWzBdLCBhcmdzWzFdKTtcclxuICAgIGNhc2UgMzogcmV0dXJuIHVuID8gZm4oYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSlcclxuICAgICAgICAgICAgICAgICAgICAgIDogZm4uY2FsbCh0aGF0LCBhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdKTtcclxuICAgIGNhc2UgNDogcmV0dXJuIHVuID8gZm4oYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSwgYXJnc1szXSlcclxuICAgICAgICAgICAgICAgICAgICAgIDogZm4uY2FsbCh0aGF0LCBhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdLCBhcmdzWzNdKTtcclxuICAgIGNhc2UgNTogcmV0dXJuIHVuID8gZm4oYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSwgYXJnc1szXSwgYXJnc1s0XSlcclxuICAgICAgICAgICAgICAgICAgICAgIDogZm4uY2FsbCh0aGF0LCBhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdLCBhcmdzWzNdLCBhcmdzWzRdKTtcclxuICB9IHJldHVybiAgICAgICAgICAgICAgZm4uYXBwbHkodGhhdCwgYXJncyk7XHJcbn1cclxuXHJcbi8vIE9iamVjdDpcclxudmFyIGNyZWF0ZSAgICAgICAgICAgPSBPYmplY3QuY3JlYXRlXHJcbiAgLCBnZXRQcm90b3R5cGVPZiAgID0gT2JqZWN0LmdldFByb3RvdHlwZU9mXHJcbiAgLCBzZXRQcm90b3R5cGVPZiAgID0gT2JqZWN0LnNldFByb3RvdHlwZU9mXHJcbiAgLCBkZWZpbmVQcm9wZXJ0eSAgID0gT2JqZWN0LmRlZmluZVByb3BlcnR5XHJcbiAgLCBkZWZpbmVQcm9wZXJ0aWVzID0gT2JqZWN0LmRlZmluZVByb3BlcnRpZXNcclxuICAsIGdldE93bkRlc2NyaXB0b3IgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yXHJcbiAgLCBnZXRLZXlzICAgICAgICAgID0gT2JqZWN0LmtleXNcclxuICAsIGdldE5hbWVzICAgICAgICAgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lc1xyXG4gICwgZ2V0U3ltYm9scyAgICAgICA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHNcclxuICAsIGlzRnJvemVuICAgICAgICAgPSBPYmplY3QuaXNGcm96ZW5cclxuICAsIGhhcyAgICAgICAgICAgICAgPSBjdHgoY2FsbCwgT2JqZWN0UHJvdG9bSEFTX09XTl0sIDIpXHJcbiAgLy8gRHVtbXksIGZpeCBmb3Igbm90IGFycmF5LWxpa2UgRVMzIHN0cmluZyBpbiBlczUgbW9kdWxlXHJcbiAgLCBFUzVPYmplY3QgICAgICAgID0gT2JqZWN0XHJcbiAgLCBEaWN0O1xyXG5mdW5jdGlvbiB0b09iamVjdChpdCl7XHJcbiAgcmV0dXJuIEVTNU9iamVjdChhc3NlcnREZWZpbmVkKGl0KSk7XHJcbn1cclxuZnVuY3Rpb24gcmV0dXJuSXQoaXQpe1xyXG4gIHJldHVybiBpdDtcclxufVxyXG5mdW5jdGlvbiByZXR1cm5UaGlzKCl7XHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuZnVuY3Rpb24gZ2V0KG9iamVjdCwga2V5KXtcclxuICBpZihoYXMob2JqZWN0LCBrZXkpKXJldHVybiBvYmplY3Rba2V5XTtcclxufVxyXG5mdW5jdGlvbiBvd25LZXlzKGl0KXtcclxuICBhc3NlcnRPYmplY3QoaXQpO1xyXG4gIHJldHVybiBnZXRTeW1ib2xzID8gZ2V0TmFtZXMoaXQpLmNvbmNhdChnZXRTeW1ib2xzKGl0KSkgOiBnZXROYW1lcyhpdCk7XHJcbn1cclxuLy8gMTkuMS4yLjEgT2JqZWN0LmFzc2lnbih0YXJnZXQsIHNvdXJjZSwgLi4uKVxyXG52YXIgYXNzaWduID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbih0YXJnZXQsIHNvdXJjZSl7XHJcbiAgdmFyIFQgPSBPYmplY3QoYXNzZXJ0RGVmaW5lZCh0YXJnZXQpKVxyXG4gICAgLCBsID0gYXJndW1lbnRzLmxlbmd0aFxyXG4gICAgLCBpID0gMTtcclxuICB3aGlsZShsID4gaSl7XHJcbiAgICB2YXIgUyAgICAgID0gRVM1T2JqZWN0KGFyZ3VtZW50c1tpKytdKVxyXG4gICAgICAsIGtleXMgICA9IGdldEtleXMoUylcclxuICAgICAgLCBsZW5ndGggPSBrZXlzLmxlbmd0aFxyXG4gICAgICAsIGogICAgICA9IDBcclxuICAgICAgLCBrZXk7XHJcbiAgICB3aGlsZShsZW5ndGggPiBqKVRba2V5ID0ga2V5c1tqKytdXSA9IFNba2V5XTtcclxuICB9XHJcbiAgcmV0dXJuIFQ7XHJcbn1cclxuZnVuY3Rpb24ga2V5T2Yob2JqZWN0LCBlbCl7XHJcbiAgdmFyIE8gICAgICA9IHRvT2JqZWN0KG9iamVjdClcclxuICAgICwga2V5cyAgID0gZ2V0S2V5cyhPKVxyXG4gICAgLCBsZW5ndGggPSBrZXlzLmxlbmd0aFxyXG4gICAgLCBpbmRleCAgPSAwXHJcbiAgICAsIGtleTtcclxuICB3aGlsZShsZW5ndGggPiBpbmRleClpZihPW2tleSA9IGtleXNbaW5kZXgrK11dID09PSBlbClyZXR1cm4ga2V5O1xyXG59XHJcblxyXG4vLyBBcnJheVxyXG4vLyBhcnJheSgnc3RyMSxzdHIyLHN0cjMnKSA9PiBbJ3N0cjEnLCAnc3RyMicsICdzdHIzJ11cclxuZnVuY3Rpb24gYXJyYXkoaXQpe1xyXG4gIHJldHVybiBTdHJpbmcoaXQpLnNwbGl0KCcsJyk7XHJcbn1cclxudmFyIHB1c2ggICAgPSBBcnJheVByb3RvLnB1c2hcclxuICAsIHVuc2hpZnQgPSBBcnJheVByb3RvLnVuc2hpZnRcclxuICAsIHNsaWNlICAgPSBBcnJheVByb3RvLnNsaWNlXHJcbiAgLCBzcGxpY2UgID0gQXJyYXlQcm90by5zcGxpY2VcclxuICAsIGluZGV4T2YgPSBBcnJheVByb3RvLmluZGV4T2ZcclxuICAsIGZvckVhY2ggPSBBcnJheVByb3RvW0ZPUl9FQUNIXTtcclxuLypcclxuICogMCAtPiBmb3JFYWNoXHJcbiAqIDEgLT4gbWFwXHJcbiAqIDIgLT4gZmlsdGVyXHJcbiAqIDMgLT4gc29tZVxyXG4gKiA0IC0+IGV2ZXJ5XHJcbiAqIDUgLT4gZmluZFxyXG4gKiA2IC0+IGZpbmRJbmRleFxyXG4gKi9cclxuZnVuY3Rpb24gY3JlYXRlQXJyYXlNZXRob2QodHlwZSl7XHJcbiAgdmFyIGlzTWFwICAgICAgID0gdHlwZSA9PSAxXHJcbiAgICAsIGlzRmlsdGVyICAgID0gdHlwZSA9PSAyXHJcbiAgICAsIGlzU29tZSAgICAgID0gdHlwZSA9PSAzXHJcbiAgICAsIGlzRXZlcnkgICAgID0gdHlwZSA9PSA0XHJcbiAgICAsIGlzRmluZEluZGV4ID0gdHlwZSA9PSA2XHJcbiAgICAsIG5vaG9sZXMgICAgID0gdHlwZSA9PSA1IHx8IGlzRmluZEluZGV4O1xyXG4gIHJldHVybiBmdW5jdGlvbihjYWxsYmFja2ZuLyosIHRoYXQgPSB1bmRlZmluZWQgKi8pe1xyXG4gICAgdmFyIE8gICAgICA9IE9iamVjdChhc3NlcnREZWZpbmVkKHRoaXMpKVxyXG4gICAgICAsIHRoYXQgICA9IGFyZ3VtZW50c1sxXVxyXG4gICAgICAsIHNlbGYgICA9IEVTNU9iamVjdChPKVxyXG4gICAgICAsIGYgICAgICA9IGN0eChjYWxsYmFja2ZuLCB0aGF0LCAzKVxyXG4gICAgICAsIGxlbmd0aCA9IHRvTGVuZ3RoKHNlbGYubGVuZ3RoKVxyXG4gICAgICAsIGluZGV4ICA9IDBcclxuICAgICAgLCByZXN1bHQgPSBpc01hcCA/IEFycmF5KGxlbmd0aCkgOiBpc0ZpbHRlciA/IFtdIDogdW5kZWZpbmVkXHJcbiAgICAgICwgdmFsLCByZXM7XHJcbiAgICBmb3IoO2xlbmd0aCA+IGluZGV4OyBpbmRleCsrKWlmKG5vaG9sZXMgfHwgaW5kZXggaW4gc2VsZil7XHJcbiAgICAgIHZhbCA9IHNlbGZbaW5kZXhdO1xyXG4gICAgICByZXMgPSBmKHZhbCwgaW5kZXgsIE8pO1xyXG4gICAgICBpZih0eXBlKXtcclxuICAgICAgICBpZihpc01hcClyZXN1bHRbaW5kZXhdID0gcmVzOyAgICAgICAgICAgICAvLyBtYXBcclxuICAgICAgICBlbHNlIGlmKHJlcylzd2l0Y2godHlwZSl7XHJcbiAgICAgICAgICBjYXNlIDM6IHJldHVybiB0cnVlOyAgICAgICAgICAgICAgICAgICAgLy8gc29tZVxyXG4gICAgICAgICAgY2FzZSA1OiByZXR1cm4gdmFsOyAgICAgICAgICAgICAgICAgICAgIC8vIGZpbmRcclxuICAgICAgICAgIGNhc2UgNjogcmV0dXJuIGluZGV4OyAgICAgICAgICAgICAgICAgICAvLyBmaW5kSW5kZXhcclxuICAgICAgICAgIGNhc2UgMjogcmVzdWx0LnB1c2godmFsKTsgICAgICAgICAgICAgICAvLyBmaWx0ZXJcclxuICAgICAgICB9IGVsc2UgaWYoaXNFdmVyeSlyZXR1cm4gZmFsc2U7ICAgICAgICAgICAvLyBldmVyeVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gaXNGaW5kSW5kZXggPyAtMSA6IGlzU29tZSB8fCBpc0V2ZXJ5ID8gaXNFdmVyeSA6IHJlc3VsdDtcclxuICB9XHJcbn1cclxuZnVuY3Rpb24gY3JlYXRlQXJyYXlDb250YWlucyhpc0NvbnRhaW5zKXtcclxuICByZXR1cm4gZnVuY3Rpb24oZWwgLyosIGZyb21JbmRleCA9IDAgKi8pe1xyXG4gICAgdmFyIE8gICAgICA9IHRvT2JqZWN0KHRoaXMpXHJcbiAgICAgICwgbGVuZ3RoID0gdG9MZW5ndGgoTy5sZW5ndGgpXHJcbiAgICAgICwgaW5kZXggID0gdG9JbmRleChhcmd1bWVudHNbMV0sIGxlbmd0aCk7XHJcbiAgICBpZihpc0NvbnRhaW5zICYmIGVsICE9IGVsKXtcclxuICAgICAgZm9yKDtsZW5ndGggPiBpbmRleDsgaW5kZXgrKylpZihzYW1lTmFOKE9baW5kZXhdKSlyZXR1cm4gaXNDb250YWlucyB8fCBpbmRleDtcclxuICAgIH0gZWxzZSBmb3IoO2xlbmd0aCA+IGluZGV4OyBpbmRleCsrKWlmKGlzQ29udGFpbnMgfHwgaW5kZXggaW4gTyl7XHJcbiAgICAgIGlmKE9baW5kZXhdID09PSBlbClyZXR1cm4gaXNDb250YWlucyB8fCBpbmRleDtcclxuICAgIH0gcmV0dXJuICFpc0NvbnRhaW5zICYmIC0xO1xyXG4gIH1cclxufVxyXG5mdW5jdGlvbiBnZW5lcmljKEEsIEIpe1xyXG4gIC8vIHN0cmFuZ2UgSUUgcXVpcmtzIG1vZGUgYnVnIC0+IHVzZSB0eXBlb2YgdnMgaXNGdW5jdGlvblxyXG4gIHJldHVybiB0eXBlb2YgQSA9PSAnZnVuY3Rpb24nID8gQSA6IEI7XHJcbn1cclxuXHJcbi8vIE1hdGhcclxudmFyIE1BWF9TQUZFX0lOVEVHRVIgPSAweDFmZmZmZmZmZmZmZmZmIC8vIHBvdygyLCA1MykgLSAxID09IDkwMDcxOTkyNTQ3NDA5OTFcclxuICAsIHBvdyAgICA9IE1hdGgucG93XHJcbiAgLCBhYnMgICAgPSBNYXRoLmFic1xyXG4gICwgY2VpbCAgID0gTWF0aC5jZWlsXHJcbiAgLCBmbG9vciAgPSBNYXRoLmZsb29yXHJcbiAgLCBtYXggICAgPSBNYXRoLm1heFxyXG4gICwgbWluICAgID0gTWF0aC5taW5cclxuICAsIHJhbmRvbSA9IE1hdGgucmFuZG9tXHJcbiAgLCB0cnVuYyAgPSBNYXRoLnRydW5jIHx8IGZ1bmN0aW9uKGl0KXtcclxuICAgICAgcmV0dXJuIChpdCA+IDAgPyBmbG9vciA6IGNlaWwpKGl0KTtcclxuICAgIH1cclxuLy8gMjAuMS4yLjQgTnVtYmVyLmlzTmFOKG51bWJlcilcclxuZnVuY3Rpb24gc2FtZU5hTihudW1iZXIpe1xyXG4gIHJldHVybiBudW1iZXIgIT0gbnVtYmVyO1xyXG59XHJcbi8vIDcuMS40IFRvSW50ZWdlclxyXG5mdW5jdGlvbiB0b0ludGVnZXIoaXQpe1xyXG4gIHJldHVybiBpc05hTihpdCkgPyAwIDogdHJ1bmMoaXQpO1xyXG59XHJcbi8vIDcuMS4xNSBUb0xlbmd0aFxyXG5mdW5jdGlvbiB0b0xlbmd0aChpdCl7XHJcbiAgcmV0dXJuIGl0ID4gMCA/IG1pbih0b0ludGVnZXIoaXQpLCBNQVhfU0FGRV9JTlRFR0VSKSA6IDA7XHJcbn1cclxuZnVuY3Rpb24gdG9JbmRleChpbmRleCwgbGVuZ3RoKXtcclxuICB2YXIgaW5kZXggPSB0b0ludGVnZXIoaW5kZXgpO1xyXG4gIHJldHVybiBpbmRleCA8IDAgPyBtYXgoaW5kZXggKyBsZW5ndGgsIDApIDogbWluKGluZGV4LCBsZW5ndGgpO1xyXG59XHJcbmZ1bmN0aW9uIGx6KG51bSl7XHJcbiAgcmV0dXJuIG51bSA+IDkgPyBudW0gOiAnMCcgKyBudW07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVJlcGxhY2VyKHJlZ0V4cCwgcmVwbGFjZSwgaXNTdGF0aWMpe1xyXG4gIHZhciByZXBsYWNlciA9IGlzT2JqZWN0KHJlcGxhY2UpID8gZnVuY3Rpb24ocGFydCl7XHJcbiAgICByZXR1cm4gcmVwbGFjZVtwYXJ0XTtcclxuICB9IDogcmVwbGFjZTtcclxuICByZXR1cm4gZnVuY3Rpb24oaXQpe1xyXG4gICAgcmV0dXJuIFN0cmluZyhpc1N0YXRpYyA/IGl0IDogdGhpcykucmVwbGFjZShyZWdFeHAsIHJlcGxhY2VyKTtcclxuICB9XHJcbn1cclxuZnVuY3Rpb24gY3JlYXRlUG9pbnRBdCh0b1N0cmluZyl7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uKHBvcyl7XHJcbiAgICB2YXIgcyA9IFN0cmluZyhhc3NlcnREZWZpbmVkKHRoaXMpKVxyXG4gICAgICAsIGkgPSB0b0ludGVnZXIocG9zKVxyXG4gICAgICAsIGwgPSBzLmxlbmd0aFxyXG4gICAgICAsIGEsIGI7XHJcbiAgICBpZihpIDwgMCB8fCBpID49IGwpcmV0dXJuIHRvU3RyaW5nID8gJycgOiB1bmRlZmluZWQ7XHJcbiAgICBhID0gcy5jaGFyQ29kZUF0KGkpO1xyXG4gICAgcmV0dXJuIGEgPCAweGQ4MDAgfHwgYSA+IDB4ZGJmZiB8fCBpICsgMSA9PT0gbCB8fCAoYiA9IHMuY2hhckNvZGVBdChpICsgMSkpIDwgMHhkYzAwIHx8IGIgPiAweGRmZmZcclxuICAgICAgPyB0b1N0cmluZyA/IHMuY2hhckF0KGkpIDogYVxyXG4gICAgICA6IHRvU3RyaW5nID8gcy5zbGljZShpLCBpICsgMikgOiAoYSAtIDB4ZDgwMCA8PCAxMCkgKyAoYiAtIDB4ZGMwMCkgKyAweDEwMDAwO1xyXG4gIH1cclxufVxyXG5cclxuLy8gQXNzZXJ0aW9uICYgZXJyb3JzXHJcbnZhciBSRURVQ0VfRVJST1IgPSAnUmVkdWNlIG9mIGVtcHR5IG9iamVjdCB3aXRoIG5vIGluaXRpYWwgdmFsdWUnO1xyXG5mdW5jdGlvbiBhc3NlcnQoY29uZGl0aW9uLCBtc2cxLCBtc2cyKXtcclxuICBpZighY29uZGl0aW9uKXRocm93IFR5cGVFcnJvcihtc2cyID8gbXNnMSArIG1zZzIgOiBtc2cxKTtcclxufVxyXG5mdW5jdGlvbiBhc3NlcnREZWZpbmVkKGl0KXtcclxuICBpZihpdCA9PSB1bmRlZmluZWQpdGhyb3cgVHlwZUVycm9yKCdGdW5jdGlvbiBjYWxsZWQgb24gbnVsbCBvciB1bmRlZmluZWQnKTtcclxuICByZXR1cm4gaXQ7XHJcbn1cclxuZnVuY3Rpb24gYXNzZXJ0RnVuY3Rpb24oaXQpe1xyXG4gIGFzc2VydChpc0Z1bmN0aW9uKGl0KSwgaXQsICcgaXMgbm90IGEgZnVuY3Rpb24hJyk7XHJcbiAgcmV0dXJuIGl0O1xyXG59XHJcbmZ1bmN0aW9uIGFzc2VydE9iamVjdChpdCl7XHJcbiAgYXNzZXJ0KGlzT2JqZWN0KGl0KSwgaXQsICcgaXMgbm90IGFuIG9iamVjdCEnKTtcclxuICByZXR1cm4gaXQ7XHJcbn1cclxuZnVuY3Rpb24gYXNzZXJ0SW5zdGFuY2UoaXQsIENvbnN0cnVjdG9yLCBuYW1lKXtcclxuICBhc3NlcnQoaXQgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvciwgbmFtZSwgXCI6IHVzZSB0aGUgJ25ldycgb3BlcmF0b3IhXCIpO1xyXG59XHJcblxyXG4vLyBQcm9wZXJ0eSBkZXNjcmlwdG9ycyAmIFN5bWJvbFxyXG5mdW5jdGlvbiBkZXNjcmlwdG9yKGJpdG1hcCwgdmFsdWUpe1xyXG4gIHJldHVybiB7XHJcbiAgICBlbnVtZXJhYmxlICA6ICEoYml0bWFwICYgMSksXHJcbiAgICBjb25maWd1cmFibGU6ICEoYml0bWFwICYgMiksXHJcbiAgICB3cml0YWJsZSAgICA6ICEoYml0bWFwICYgNCksXHJcbiAgICB2YWx1ZSAgICAgICA6IHZhbHVlXHJcbiAgfVxyXG59XHJcbmZ1bmN0aW9uIHNpbXBsZVNldChvYmplY3QsIGtleSwgdmFsdWUpe1xyXG4gIG9iamVjdFtrZXldID0gdmFsdWU7XHJcbiAgcmV0dXJuIG9iamVjdDtcclxufVxyXG5mdW5jdGlvbiBjcmVhdGVEZWZpbmVyKGJpdG1hcCl7XHJcbiAgcmV0dXJuIERFU0MgPyBmdW5jdGlvbihvYmplY3QsIGtleSwgdmFsdWUpe1xyXG4gICAgcmV0dXJuIGRlZmluZVByb3BlcnR5KG9iamVjdCwga2V5LCBkZXNjcmlwdG9yKGJpdG1hcCwgdmFsdWUpKTtcclxuICB9IDogc2ltcGxlU2V0O1xyXG59XHJcbmZ1bmN0aW9uIHVpZChrZXkpe1xyXG4gIHJldHVybiBTWU1CT0wgKyAnKCcgKyBrZXkgKyAnKV8nICsgKCsrc2lkICsgcmFuZG9tKCkpW1RPX1NUUklOR10oMzYpO1xyXG59XHJcbmZ1bmN0aW9uIGdldFdlbGxLbm93blN5bWJvbChuYW1lLCBzZXR0ZXIpe1xyXG4gIHJldHVybiAoU3ltYm9sICYmIFN5bWJvbFtuYW1lXSkgfHwgKHNldHRlciA/IFN5bWJvbCA6IHNhZmVTeW1ib2wpKFNZTUJPTCArIERPVCArIG5hbWUpO1xyXG59XHJcbi8vIFRoZSBlbmdpbmUgd29ya3MgZmluZSB3aXRoIGRlc2NyaXB0b3JzPyBUaGFuaydzIElFOCBmb3IgaGlzIGZ1bm55IGRlZmluZVByb3BlcnR5LlxyXG52YXIgREVTQyA9ICEhZnVuY3Rpb24oKXtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICByZXR1cm4gZGVmaW5lUHJvcGVydHkoe30sICdhJywge2dldDogZnVuY3Rpb24oKXsgcmV0dXJuIDIgfX0pLmEgPT0gMjtcclxuICAgICAgfSBjYXRjaChlKXt9XHJcbiAgICB9KClcclxuICAsIHNpZCAgICA9IDBcclxuICAsIGhpZGRlbiA9IGNyZWF0ZURlZmluZXIoMSlcclxuICAsIHNldCAgICA9IFN5bWJvbCA/IHNpbXBsZVNldCA6IGhpZGRlblxyXG4gICwgc2FmZVN5bWJvbCA9IFN5bWJvbCB8fCB1aWQ7XHJcbmZ1bmN0aW9uIGFzc2lnbkhpZGRlbih0YXJnZXQsIHNyYyl7XHJcbiAgZm9yKHZhciBrZXkgaW4gc3JjKWhpZGRlbih0YXJnZXQsIGtleSwgc3JjW2tleV0pO1xyXG4gIHJldHVybiB0YXJnZXQ7XHJcbn1cclxuXHJcbnZhciBTWU1CT0xfVU5TQ09QQUJMRVMgPSBnZXRXZWxsS25vd25TeW1ib2woJ3Vuc2NvcGFibGVzJylcclxuICAsIEFycmF5VW5zY29wYWJsZXMgICA9IEFycmF5UHJvdG9bU1lNQk9MX1VOU0NPUEFCTEVTXSB8fCB7fVxyXG4gICwgU1lNQk9MX1RBRyAgICAgICAgID0gZ2V0V2VsbEtub3duU3ltYm9sKFRPX1NUUklOR19UQUcpXHJcbiAgLCBTWU1CT0xfU1BFQ0lFUyAgICAgPSBnZXRXZWxsS25vd25TeW1ib2woJ3NwZWNpZXMnKVxyXG4gICwgU1lNQk9MX0lURVJBVE9SO1xyXG5mdW5jdGlvbiBzZXRTcGVjaWVzKEMpe1xyXG4gIGlmKERFU0MgJiYgKGZyYW1ld29yayB8fCAhaXNOYXRpdmUoQykpKWRlZmluZVByb3BlcnR5KEMsIFNZTUJPTF9TUEVDSUVTLCB7XHJcbiAgICBjb25maWd1cmFibGU6IHRydWUsXHJcbiAgICBnZXQ6IHJldHVyblRoaXNcclxuICB9KTtcclxufVxuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBNb2R1bGUgOiBjb21tb24uZXhwb3J0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG52YXIgTk9ERSA9IGNvZihwcm9jZXNzKSA9PSBQUk9DRVNTXHJcbiAgLCBjb3JlID0ge31cclxuICAsIHBhdGggPSBmcmFtZXdvcmsgPyBnbG9iYWwgOiBjb3JlXHJcbiAgLCBvbGQgID0gZ2xvYmFsLmNvcmVcclxuICAsIGV4cG9ydEdsb2JhbFxyXG4gIC8vIHR5cGUgYml0bWFwXHJcbiAgLCBGT1JDRUQgPSAxXHJcbiAgLCBHTE9CQUwgPSAyXHJcbiAgLCBTVEFUSUMgPSA0XHJcbiAgLCBQUk9UTyAgPSA4XHJcbiAgLCBCSU5EICAgPSAxNlxyXG4gICwgV1JBUCAgID0gMzI7XHJcbmZ1bmN0aW9uICRkZWZpbmUodHlwZSwgbmFtZSwgc291cmNlKXtcclxuICB2YXIga2V5LCBvd24sIG91dCwgZXhwXHJcbiAgICAsIGlzR2xvYmFsID0gdHlwZSAmIEdMT0JBTFxyXG4gICAgLCB0YXJnZXQgICA9IGlzR2xvYmFsID8gZ2xvYmFsIDogKHR5cGUgJiBTVEFUSUMpXHJcbiAgICAgICAgPyBnbG9iYWxbbmFtZV0gOiAoZ2xvYmFsW25hbWVdIHx8IE9iamVjdFByb3RvKVtQUk9UT1RZUEVdXHJcbiAgICAsIGV4cG9ydHMgID0gaXNHbG9iYWwgPyBjb3JlIDogY29yZVtuYW1lXSB8fCAoY29yZVtuYW1lXSA9IHt9KTtcclxuICBpZihpc0dsb2JhbClzb3VyY2UgPSBuYW1lO1xyXG4gIGZvcihrZXkgaW4gc291cmNlKXtcclxuICAgIC8vIHRoZXJlIGlzIGEgc2ltaWxhciBuYXRpdmVcclxuICAgIG93biA9ICEodHlwZSAmIEZPUkNFRCkgJiYgdGFyZ2V0ICYmIGtleSBpbiB0YXJnZXRcclxuICAgICAgJiYgKCFpc0Z1bmN0aW9uKHRhcmdldFtrZXldKSB8fCBpc05hdGl2ZSh0YXJnZXRba2V5XSkpO1xyXG4gICAgLy8gZXhwb3J0IG5hdGl2ZSBvciBwYXNzZWRcclxuICAgIG91dCA9IChvd24gPyB0YXJnZXQgOiBzb3VyY2UpW2tleV07XHJcbiAgICAvLyBwcmV2ZW50IGdsb2JhbCBwb2xsdXRpb24gZm9yIG5hbWVzcGFjZXNcclxuICAgIGlmKCFmcmFtZXdvcmsgJiYgaXNHbG9iYWwgJiYgIWlzRnVuY3Rpb24odGFyZ2V0W2tleV0pKWV4cCA9IHNvdXJjZVtrZXldO1xyXG4gICAgLy8gYmluZCB0aW1lcnMgdG8gZ2xvYmFsIGZvciBjYWxsIGZyb20gZXhwb3J0IGNvbnRleHRcclxuICAgIGVsc2UgaWYodHlwZSAmIEJJTkQgJiYgb3duKWV4cCA9IGN0eChvdXQsIGdsb2JhbCk7XHJcbiAgICAvLyB3cmFwIGdsb2JhbCBjb25zdHJ1Y3RvcnMgZm9yIHByZXZlbnQgY2hhbmdlIHRoZW0gaW4gbGlicmFyeVxyXG4gICAgZWxzZSBpZih0eXBlICYgV1JBUCAmJiAhZnJhbWV3b3JrICYmIHRhcmdldFtrZXldID09IG91dCl7XHJcbiAgICAgIGV4cCA9IGZ1bmN0aW9uKHBhcmFtKXtcclxuICAgICAgICByZXR1cm4gdGhpcyBpbnN0YW5jZW9mIG91dCA/IG5ldyBvdXQocGFyYW0pIDogb3V0KHBhcmFtKTtcclxuICAgICAgfVxyXG4gICAgICBleHBbUFJPVE9UWVBFXSA9IG91dFtQUk9UT1RZUEVdO1xyXG4gICAgfSBlbHNlIGV4cCA9IHR5cGUgJiBQUk9UTyAmJiBpc0Z1bmN0aW9uKG91dCkgPyBjdHgoY2FsbCwgb3V0KSA6IG91dDtcclxuICAgIC8vIGV4dGVuZCBnbG9iYWxcclxuICAgIGlmKGZyYW1ld29yayAmJiB0YXJnZXQgJiYgIW93bil7XHJcbiAgICAgIGlmKGlzR2xvYmFsKXRhcmdldFtrZXldID0gb3V0O1xyXG4gICAgICBlbHNlIGRlbGV0ZSB0YXJnZXRba2V5XSAmJiBoaWRkZW4odGFyZ2V0LCBrZXksIG91dCk7XHJcbiAgICB9XHJcbiAgICAvLyBleHBvcnRcclxuICAgIGlmKGV4cG9ydHNba2V5XSAhPSBvdXQpaGlkZGVuKGV4cG9ydHMsIGtleSwgZXhwKTtcclxuICB9XHJcbn1cclxuLy8gQ29tbW9uSlMgZXhwb3J0XHJcbmlmKHR5cGVvZiBtb2R1bGUgIT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpbW9kdWxlLmV4cG9ydHMgPSBjb3JlO1xyXG4vLyBSZXF1aXJlSlMgZXhwb3J0XHJcbmVsc2UgaWYoaXNGdW5jdGlvbihkZWZpbmUpICYmIGRlZmluZS5hbWQpZGVmaW5lKGZ1bmN0aW9uKCl7cmV0dXJuIGNvcmV9KTtcclxuLy8gRXhwb3J0IHRvIGdsb2JhbCBvYmplY3RcclxuZWxzZSBleHBvcnRHbG9iYWwgPSB0cnVlO1xyXG5pZihleHBvcnRHbG9iYWwgfHwgZnJhbWV3b3JrKXtcclxuICBjb3JlLm5vQ29uZmxpY3QgPSBmdW5jdGlvbigpe1xyXG4gICAgZ2xvYmFsLmNvcmUgPSBvbGQ7XHJcbiAgICByZXR1cm4gY29yZTtcclxuICB9XHJcbiAgZ2xvYmFsLmNvcmUgPSBjb3JlO1xyXG59XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIE1vZHVsZSA6IGNvbW1vbi5pdGVyYXRvcnMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cblNZTUJPTF9JVEVSQVRPUiA9IGdldFdlbGxLbm93blN5bWJvbChJVEVSQVRPUik7XHJcbnZhciBJVEVSICA9IHNhZmVTeW1ib2woJ2l0ZXInKVxyXG4gICwgS0VZICAgPSAxXHJcbiAgLCBWQUxVRSA9IDJcclxuICAsIEl0ZXJhdG9ycyA9IHt9XHJcbiAgLCBJdGVyYXRvclByb3RvdHlwZSA9IHt9XHJcbiAgICAvLyBTYWZhcmkgaGFzIGJ5Z2d5IGl0ZXJhdG9ycyB3L28gYG5leHRgXHJcbiAgLCBCVUdHWV9JVEVSQVRPUlMgPSAna2V5cycgaW4gQXJyYXlQcm90byAmJiAhKCduZXh0JyBpbiBbXS5rZXlzKCkpO1xyXG4vLyAyNS4xLjIuMS4xICVJdGVyYXRvclByb3RvdHlwZSVbQEBpdGVyYXRvcl0oKVxyXG5zZXRJdGVyYXRvcihJdGVyYXRvclByb3RvdHlwZSwgcmV0dXJuVGhpcyk7XHJcbmZ1bmN0aW9uIHNldEl0ZXJhdG9yKE8sIHZhbHVlKXtcclxuICBoaWRkZW4oTywgU1lNQk9MX0lURVJBVE9SLCB2YWx1ZSk7XHJcbiAgLy8gQWRkIGl0ZXJhdG9yIGZvciBGRiBpdGVyYXRvciBwcm90b2NvbFxyXG4gIEZGX0lURVJBVE9SIGluIEFycmF5UHJvdG8gJiYgaGlkZGVuKE8sIEZGX0lURVJBVE9SLCB2YWx1ZSk7XHJcbn1cclxuZnVuY3Rpb24gY3JlYXRlSXRlcmF0b3IoQ29uc3RydWN0b3IsIE5BTUUsIG5leHQsIHByb3RvKXtcclxuICBDb25zdHJ1Y3RvcltQUk9UT1RZUEVdID0gY3JlYXRlKHByb3RvIHx8IEl0ZXJhdG9yUHJvdG90eXBlLCB7bmV4dDogZGVzY3JpcHRvcigxLCBuZXh0KX0pO1xyXG4gIHNldFRvU3RyaW5nVGFnKENvbnN0cnVjdG9yLCBOQU1FICsgJyBJdGVyYXRvcicpO1xyXG59XHJcbmZ1bmN0aW9uIGRlZmluZUl0ZXJhdG9yKENvbnN0cnVjdG9yLCBOQU1FLCB2YWx1ZSwgREVGQVVMVCl7XHJcbiAgdmFyIHByb3RvID0gQ29uc3RydWN0b3JbUFJPVE9UWVBFXVxyXG4gICAgLCBpdGVyICA9IGdldChwcm90bywgU1lNQk9MX0lURVJBVE9SKSB8fCBnZXQocHJvdG8sIEZGX0lURVJBVE9SKSB8fCAoREVGQVVMVCAmJiBnZXQocHJvdG8sIERFRkFVTFQpKSB8fCB2YWx1ZTtcclxuICBpZihmcmFtZXdvcmspe1xyXG4gICAgLy8gRGVmaW5lIGl0ZXJhdG9yXHJcbiAgICBzZXRJdGVyYXRvcihwcm90bywgaXRlcik7XHJcbiAgICBpZihpdGVyICE9PSB2YWx1ZSl7XHJcbiAgICAgIHZhciBpdGVyUHJvdG8gPSBnZXRQcm90b3R5cGVPZihpdGVyLmNhbGwobmV3IENvbnN0cnVjdG9yKSk7XHJcbiAgICAgIC8vIFNldCBAQHRvU3RyaW5nVGFnIHRvIG5hdGl2ZSBpdGVyYXRvcnNcclxuICAgICAgc2V0VG9TdHJpbmdUYWcoaXRlclByb3RvLCBOQU1FICsgJyBJdGVyYXRvcicsIHRydWUpO1xyXG4gICAgICAvLyBGRiBmaXhcclxuICAgICAgaGFzKHByb3RvLCBGRl9JVEVSQVRPUikgJiYgc2V0SXRlcmF0b3IoaXRlclByb3RvLCByZXR1cm5UaGlzKTtcclxuICAgIH1cclxuICB9XHJcbiAgLy8gUGx1ZyBmb3IgbGlicmFyeVxyXG4gIEl0ZXJhdG9yc1tOQU1FXSA9IGl0ZXI7XHJcbiAgLy8gRkYgJiB2OCBmaXhcclxuICBJdGVyYXRvcnNbTkFNRSArICcgSXRlcmF0b3InXSA9IHJldHVyblRoaXM7XHJcbiAgcmV0dXJuIGl0ZXI7XHJcbn1cclxuZnVuY3Rpb24gZGVmaW5lU3RkSXRlcmF0b3JzKEJhc2UsIE5BTUUsIENvbnN0cnVjdG9yLCBuZXh0LCBERUZBVUxULCBJU19TRVQpe1xyXG4gIGZ1bmN0aW9uIGNyZWF0ZUl0ZXIoa2luZCl7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24oKXtcclxuICAgICAgcmV0dXJuIG5ldyBDb25zdHJ1Y3Rvcih0aGlzLCBraW5kKTtcclxuICAgIH1cclxuICB9XHJcbiAgY3JlYXRlSXRlcmF0b3IoQ29uc3RydWN0b3IsIE5BTUUsIG5leHQpO1xyXG4gIHZhciBlbnRyaWVzID0gY3JlYXRlSXRlcihLRVkrVkFMVUUpXHJcbiAgICAsIHZhbHVlcyAgPSBjcmVhdGVJdGVyKFZBTFVFKTtcclxuICBpZihERUZBVUxUID09IFZBTFVFKXZhbHVlcyA9IGRlZmluZUl0ZXJhdG9yKEJhc2UsIE5BTUUsIHZhbHVlcywgJ3ZhbHVlcycpO1xyXG4gIGVsc2UgZW50cmllcyA9IGRlZmluZUl0ZXJhdG9yKEJhc2UsIE5BTUUsIGVudHJpZXMsICdlbnRyaWVzJyk7XHJcbiAgaWYoREVGQVVMVCl7XHJcbiAgICAkZGVmaW5lKFBST1RPICsgRk9SQ0VEICogQlVHR1lfSVRFUkFUT1JTLCBOQU1FLCB7XHJcbiAgICAgIGVudHJpZXM6IGVudHJpZXMsXHJcbiAgICAgIGtleXM6IElTX1NFVCA/IHZhbHVlcyA6IGNyZWF0ZUl0ZXIoS0VZKSxcclxuICAgICAgdmFsdWVzOiB2YWx1ZXNcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5mdW5jdGlvbiBpdGVyUmVzdWx0KGRvbmUsIHZhbHVlKXtcclxuICByZXR1cm4ge3ZhbHVlOiB2YWx1ZSwgZG9uZTogISFkb25lfTtcclxufVxyXG5mdW5jdGlvbiBpc0l0ZXJhYmxlKGl0KXtcclxuICB2YXIgTyAgICAgID0gT2JqZWN0KGl0KVxyXG4gICAgLCBTeW1ib2wgPSBnbG9iYWxbU1lNQk9MXVxyXG4gICAgLCBoYXNFeHQgPSAoU3ltYm9sICYmIFN5bWJvbFtJVEVSQVRPUl0gfHwgRkZfSVRFUkFUT1IpIGluIE87XHJcbiAgcmV0dXJuIGhhc0V4dCB8fCBTWU1CT0xfSVRFUkFUT1IgaW4gTyB8fCBoYXMoSXRlcmF0b3JzLCBjbGFzc29mKE8pKTtcclxufVxyXG5mdW5jdGlvbiBnZXRJdGVyYXRvcihpdCl7XHJcbiAgdmFyIFN5bWJvbCAgPSBnbG9iYWxbU1lNQk9MXVxyXG4gICAgLCBleHQgICAgID0gaXRbU3ltYm9sICYmIFN5bWJvbFtJVEVSQVRPUl0gfHwgRkZfSVRFUkFUT1JdXHJcbiAgICAsIGdldEl0ZXIgPSBleHQgfHwgaXRbU1lNQk9MX0lURVJBVE9SXSB8fCBJdGVyYXRvcnNbY2xhc3NvZihpdCldO1xyXG4gIHJldHVybiBhc3NlcnRPYmplY3QoZ2V0SXRlci5jYWxsKGl0KSk7XHJcbn1cclxuZnVuY3Rpb24gc3RlcENhbGwoZm4sIHZhbHVlLCBlbnRyaWVzKXtcclxuICByZXR1cm4gZW50cmllcyA/IGludm9rZShmbiwgdmFsdWUpIDogZm4odmFsdWUpO1xyXG59XHJcbmZ1bmN0aW9uIGNoZWNrRGFuZ2VySXRlckNsb3NpbmcoZm4pe1xyXG4gIHZhciBkYW5nZXIgPSB0cnVlO1xyXG4gIHZhciBPID0ge1xyXG4gICAgbmV4dDogZnVuY3Rpb24oKXsgdGhyb3cgMSB9LFxyXG4gICAgJ3JldHVybic6IGZ1bmN0aW9uKCl7IGRhbmdlciA9IGZhbHNlIH1cclxuICB9O1xyXG4gIE9bU1lNQk9MX0lURVJBVE9SXSA9IHJldHVyblRoaXM7XHJcbiAgdHJ5IHtcclxuICAgIGZuKE8pO1xyXG4gIH0gY2F0Y2goZSl7fVxyXG4gIHJldHVybiBkYW5nZXI7XHJcbn1cclxuZnVuY3Rpb24gY2xvc2VJdGVyYXRvcihpdGVyYXRvcil7XHJcbiAgdmFyIHJldCA9IGl0ZXJhdG9yWydyZXR1cm4nXTtcclxuICBpZihyZXQgIT09IHVuZGVmaW5lZClyZXQuY2FsbChpdGVyYXRvcik7XHJcbn1cclxuZnVuY3Rpb24gc2FmZUl0ZXJDbG9zZShleGVjLCBpdGVyYXRvcil7XHJcbiAgdHJ5IHtcclxuICAgIGV4ZWMoaXRlcmF0b3IpO1xyXG4gIH0gY2F0Y2goZSl7XHJcbiAgICBjbG9zZUl0ZXJhdG9yKGl0ZXJhdG9yKTtcclxuICAgIHRocm93IGU7XHJcbiAgfVxyXG59XHJcbmZ1bmN0aW9uIGZvck9mKGl0ZXJhYmxlLCBlbnRyaWVzLCBmbiwgdGhhdCl7XHJcbiAgc2FmZUl0ZXJDbG9zZShmdW5jdGlvbihpdGVyYXRvcil7XHJcbiAgICB2YXIgZiA9IGN0eChmbiwgdGhhdCwgZW50cmllcyA/IDIgOiAxKVxyXG4gICAgICAsIHN0ZXA7XHJcbiAgICB3aGlsZSghKHN0ZXAgPSBpdGVyYXRvci5uZXh0KCkpLmRvbmUpaWYoc3RlcENhbGwoZiwgc3RlcC52YWx1ZSwgZW50cmllcykgPT09IGZhbHNlKXtcclxuICAgICAgcmV0dXJuIGNsb3NlSXRlcmF0b3IoaXRlcmF0b3IpO1xyXG4gICAgfVxyXG4gIH0sIGdldEl0ZXJhdG9yKGl0ZXJhYmxlKSk7XHJcbn1cblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogTW9kdWxlIDogZXM2LnN5bWJvbCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuLy8gRUNNQVNjcmlwdCA2IHN5bWJvbHMgc2hpbVxyXG4hZnVuY3Rpb24oVEFHLCBTeW1ib2xSZWdpc3RyeSwgQWxsU3ltYm9scywgc2V0dGVyKXtcclxuICAvLyAxOS40LjEuMSBTeW1ib2woW2Rlc2NyaXB0aW9uXSlcclxuICBpZighaXNOYXRpdmUoU3ltYm9sKSl7XHJcbiAgICBTeW1ib2wgPSBmdW5jdGlvbihkZXNjcmlwdGlvbil7XHJcbiAgICAgIGFzc2VydCghKHRoaXMgaW5zdGFuY2VvZiBTeW1ib2wpLCBTWU1CT0wgKyAnIGlzIG5vdCBhICcgKyBDT05TVFJVQ1RPUik7XHJcbiAgICAgIHZhciB0YWcgPSB1aWQoZGVzY3JpcHRpb24pXHJcbiAgICAgICAgLCBzeW0gPSBzZXQoY3JlYXRlKFN5bWJvbFtQUk9UT1RZUEVdKSwgVEFHLCB0YWcpO1xyXG4gICAgICBBbGxTeW1ib2xzW3RhZ10gPSBzeW07XHJcbiAgICAgIERFU0MgJiYgc2V0dGVyICYmIGRlZmluZVByb3BlcnR5KE9iamVjdFByb3RvLCB0YWcsIHtcclxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXHJcbiAgICAgICAgc2V0OiBmdW5jdGlvbih2YWx1ZSl7XHJcbiAgICAgICAgICBoaWRkZW4odGhpcywgdGFnLCB2YWx1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgICAgcmV0dXJuIHN5bTtcclxuICAgIH1cclxuICAgIGhpZGRlbihTeW1ib2xbUFJPVE9UWVBFXSwgVE9fU1RSSU5HLCBmdW5jdGlvbigpe1xyXG4gICAgICByZXR1cm4gdGhpc1tUQUddO1xyXG4gICAgfSk7XHJcbiAgfVxyXG4gICRkZWZpbmUoR0xPQkFMICsgV1JBUCwge1N5bWJvbDogU3ltYm9sfSk7XHJcbiAgXHJcbiAgdmFyIHN5bWJvbFN0YXRpY3MgPSB7XHJcbiAgICAvLyAxOS40LjIuMSBTeW1ib2wuZm9yKGtleSlcclxuICAgICdmb3InOiBmdW5jdGlvbihrZXkpe1xyXG4gICAgICByZXR1cm4gaGFzKFN5bWJvbFJlZ2lzdHJ5LCBrZXkgKz0gJycpXHJcbiAgICAgICAgPyBTeW1ib2xSZWdpc3RyeVtrZXldXHJcbiAgICAgICAgOiBTeW1ib2xSZWdpc3RyeVtrZXldID0gU3ltYm9sKGtleSk7XHJcbiAgICB9LFxyXG4gICAgLy8gMTkuNC4yLjQgU3ltYm9sLml0ZXJhdG9yXHJcbiAgICBpdGVyYXRvcjogU1lNQk9MX0lURVJBVE9SIHx8IGdldFdlbGxLbm93blN5bWJvbChJVEVSQVRPUiksXHJcbiAgICAvLyAxOS40LjIuNSBTeW1ib2wua2V5Rm9yKHN5bSlcclxuICAgIGtleUZvcjogcGFydC5jYWxsKGtleU9mLCBTeW1ib2xSZWdpc3RyeSksXHJcbiAgICAvLyAxOS40LjIuMTAgU3ltYm9sLnNwZWNpZXNcclxuICAgIHNwZWNpZXM6IFNZTUJPTF9TUEVDSUVTLFxyXG4gICAgLy8gMTkuNC4yLjEzIFN5bWJvbC50b1N0cmluZ1RhZ1xyXG4gICAgdG9TdHJpbmdUYWc6IFNZTUJPTF9UQUcgPSBnZXRXZWxsS25vd25TeW1ib2woVE9fU1RSSU5HX1RBRywgdHJ1ZSksXHJcbiAgICAvLyAxOS40LjIuMTQgU3ltYm9sLnVuc2NvcGFibGVzXHJcbiAgICB1bnNjb3BhYmxlczogU1lNQk9MX1VOU0NPUEFCTEVTLFxyXG4gICAgcHVyZTogc2FmZVN5bWJvbCxcclxuICAgIHNldDogc2V0LFxyXG4gICAgdXNlU2V0dGVyOiBmdW5jdGlvbigpe3NldHRlciA9IHRydWV9LFxyXG4gICAgdXNlU2ltcGxlOiBmdW5jdGlvbigpe3NldHRlciA9IGZhbHNlfVxyXG4gIH07XHJcbiAgLy8gMTkuNC4yLjIgU3ltYm9sLmhhc0luc3RhbmNlXHJcbiAgLy8gMTkuNC4yLjMgU3ltYm9sLmlzQ29uY2F0U3ByZWFkYWJsZVxyXG4gIC8vIDE5LjQuMi42IFN5bWJvbC5tYXRjaFxyXG4gIC8vIDE5LjQuMi44IFN5bWJvbC5yZXBsYWNlXHJcbiAgLy8gMTkuNC4yLjkgU3ltYm9sLnNlYXJjaFxyXG4gIC8vIDE5LjQuMi4xMSBTeW1ib2wuc3BsaXRcclxuICAvLyAxOS40LjIuMTIgU3ltYm9sLnRvUHJpbWl0aXZlXHJcbiAgZm9yRWFjaC5jYWxsKGFycmF5KCdoYXNJbnN0YW5jZSxpc0NvbmNhdFNwcmVhZGFibGUsbWF0Y2gscmVwbGFjZSxzZWFyY2gsc3BsaXQsdG9QcmltaXRpdmUnKSxcclxuICAgIGZ1bmN0aW9uKGl0KXtcclxuICAgICAgc3ltYm9sU3RhdGljc1tpdF0gPSBnZXRXZWxsS25vd25TeW1ib2woaXQpO1xyXG4gICAgfVxyXG4gICk7XHJcbiAgJGRlZmluZShTVEFUSUMsIFNZTUJPTCwgc3ltYm9sU3RhdGljcyk7XHJcbiAgXHJcbiAgc2V0VG9TdHJpbmdUYWcoU3ltYm9sLCBTWU1CT0wpO1xyXG4gIFxyXG4gICRkZWZpbmUoU1RBVElDICsgRk9SQ0VEICogIWlzTmF0aXZlKFN5bWJvbCksIE9CSkVDVCwge1xyXG4gICAgLy8gMTkuMS4yLjcgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoTylcclxuICAgIGdldE93blByb3BlcnR5TmFtZXM6IGZ1bmN0aW9uKGl0KXtcclxuICAgICAgdmFyIG5hbWVzID0gZ2V0TmFtZXModG9PYmplY3QoaXQpKSwgcmVzdWx0ID0gW10sIGtleSwgaSA9IDA7XHJcbiAgICAgIHdoaWxlKG5hbWVzLmxlbmd0aCA+IGkpaGFzKEFsbFN5bWJvbHMsIGtleSA9IG5hbWVzW2krK10pIHx8IHJlc3VsdC5wdXNoKGtleSk7XHJcbiAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9LFxyXG4gICAgLy8gMTkuMS4yLjggT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhPKVxyXG4gICAgZ2V0T3duUHJvcGVydHlTeW1ib2xzOiBmdW5jdGlvbihpdCl7XHJcbiAgICAgIHZhciBuYW1lcyA9IGdldE5hbWVzKHRvT2JqZWN0KGl0KSksIHJlc3VsdCA9IFtdLCBrZXksIGkgPSAwO1xyXG4gICAgICB3aGlsZShuYW1lcy5sZW5ndGggPiBpKWhhcyhBbGxTeW1ib2xzLCBrZXkgPSBuYW1lc1tpKytdKSAmJiByZXN1bHQucHVzaChBbGxTeW1ib2xzW2tleV0pO1xyXG4gICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG4gIH0pO1xyXG4gIFxyXG4gIC8vIDIwLjIuMS45IE1hdGhbQEB0b1N0cmluZ1RhZ11cclxuICBzZXRUb1N0cmluZ1RhZyhNYXRoLCBNQVRILCB0cnVlKTtcclxuICAvLyAyNC4zLjMgSlNPTltAQHRvU3RyaW5nVGFnXVxyXG4gIHNldFRvU3RyaW5nVGFnKGdsb2JhbC5KU09OLCAnSlNPTicsIHRydWUpO1xyXG59KHNhZmVTeW1ib2woJ3RhZycpLCB7fSwge30sIHRydWUpO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBNb2R1bGUgOiBlczYub2JqZWN0LnN0YXRpY3MgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4hZnVuY3Rpb24oKXtcclxuICB2YXIgb2JqZWN0U3RhdGljID0ge1xyXG4gICAgLy8gMTkuMS4zLjEgT2JqZWN0LmFzc2lnbih0YXJnZXQsIHNvdXJjZSlcclxuICAgIGFzc2lnbjogYXNzaWduLFxyXG4gICAgLy8gMTkuMS4zLjEwIE9iamVjdC5pcyh2YWx1ZTEsIHZhbHVlMilcclxuICAgIGlzOiBmdW5jdGlvbih4LCB5KXtcclxuICAgICAgcmV0dXJuIHggPT09IHkgPyB4ICE9PSAwIHx8IDEgLyB4ID09PSAxIC8geSA6IHggIT0geCAmJiB5ICE9IHk7XHJcbiAgICB9XHJcbiAgfTtcclxuICAvLyAxOS4xLjMuMTkgT2JqZWN0LnNldFByb3RvdHlwZU9mKE8sIHByb3RvKVxyXG4gIC8vIFdvcmtzIHdpdGggX19wcm90b19fIG9ubHkuIE9sZCB2OCBjYW4ndCB3b3JrcyB3aXRoIG51bGwgcHJvdG8gb2JqZWN0cy5cclxuICAnX19wcm90b19fJyBpbiBPYmplY3RQcm90byAmJiBmdW5jdGlvbihidWdneSwgc2V0KXtcclxuICAgIHRyeSB7XHJcbiAgICAgIHNldCA9IGN0eChjYWxsLCBnZXRPd25EZXNjcmlwdG9yKE9iamVjdFByb3RvLCAnX19wcm90b19fJykuc2V0LCAyKTtcclxuICAgICAgc2V0KHt9LCBBcnJheVByb3RvKTtcclxuICAgIH0gY2F0Y2goZSl7IGJ1Z2d5ID0gdHJ1ZSB9XHJcbiAgICBvYmplY3RTdGF0aWMuc2V0UHJvdG90eXBlT2YgPSBzZXRQcm90b3R5cGVPZiA9IHNldFByb3RvdHlwZU9mIHx8IGZ1bmN0aW9uKE8sIHByb3RvKXtcclxuICAgICAgYXNzZXJ0T2JqZWN0KE8pO1xyXG4gICAgICBhc3NlcnQocHJvdG8gPT09IG51bGwgfHwgaXNPYmplY3QocHJvdG8pLCBwcm90bywgXCI6IGNhbid0IHNldCBhcyBwcm90b3R5cGUhXCIpO1xyXG4gICAgICBpZihidWdneSlPLl9fcHJvdG9fXyA9IHByb3RvO1xyXG4gICAgICBlbHNlIHNldChPLCBwcm90byk7XHJcbiAgICAgIHJldHVybiBPO1xyXG4gICAgfVxyXG4gIH0oKTtcclxuICAkZGVmaW5lKFNUQVRJQywgT0JKRUNULCBvYmplY3RTdGF0aWMpO1xyXG59KCk7XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIE1vZHVsZSA6IGVzNi5vYmplY3Quc3RhdGljcy1hY2NlcHQtcHJpbWl0aXZlcyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiFmdW5jdGlvbigpe1xyXG4gIC8vIE9iamVjdCBzdGF0aWMgbWV0aG9kcyBhY2NlcHQgcHJpbWl0aXZlc1xyXG4gIGZ1bmN0aW9uIHdyYXBPYmplY3RNZXRob2Qoa2V5LCBNT0RFKXtcclxuICAgIHZhciBmbiAgPSBPYmplY3Rba2V5XVxyXG4gICAgICAsIGV4cCA9IGNvcmVbT0JKRUNUXVtrZXldXHJcbiAgICAgICwgZiAgID0gMFxyXG4gICAgICAsIG8gICA9IHt9O1xyXG4gICAgaWYoIWV4cCB8fCBpc05hdGl2ZShleHApKXtcclxuICAgICAgb1trZXldID0gTU9ERSA9PSAxID8gZnVuY3Rpb24oaXQpe1xyXG4gICAgICAgIHJldHVybiBpc09iamVjdChpdCkgPyBmbihpdCkgOiBpdDtcclxuICAgICAgfSA6IE1PREUgPT0gMiA/IGZ1bmN0aW9uKGl0KXtcclxuICAgICAgICByZXR1cm4gaXNPYmplY3QoaXQpID8gZm4oaXQpIDogdHJ1ZTtcclxuICAgICAgfSA6IE1PREUgPT0gMyA/IGZ1bmN0aW9uKGl0KXtcclxuICAgICAgICByZXR1cm4gaXNPYmplY3QoaXQpID8gZm4oaXQpIDogZmFsc2U7XHJcbiAgICAgIH0gOiBNT0RFID09IDQgPyBmdW5jdGlvbihpdCwga2V5KXtcclxuICAgICAgICByZXR1cm4gZm4odG9PYmplY3QoaXQpLCBrZXkpO1xyXG4gICAgICB9IDogZnVuY3Rpb24oaXQpe1xyXG4gICAgICAgIHJldHVybiBmbih0b09iamVjdChpdCkpO1xyXG4gICAgICB9O1xyXG4gICAgICB0cnkgeyBmbihET1QpIH1cclxuICAgICAgY2F0Y2goZSl7IGYgPSAxIH1cclxuICAgICAgJGRlZmluZShTVEFUSUMgKyBGT1JDRUQgKiBmLCBPQkpFQ1QsIG8pO1xyXG4gICAgfVxyXG4gIH1cclxuICB3cmFwT2JqZWN0TWV0aG9kKCdmcmVlemUnLCAxKTtcclxuICB3cmFwT2JqZWN0TWV0aG9kKCdzZWFsJywgMSk7XHJcbiAgd3JhcE9iamVjdE1ldGhvZCgncHJldmVudEV4dGVuc2lvbnMnLCAxKTtcclxuICB3cmFwT2JqZWN0TWV0aG9kKCdpc0Zyb3plbicsIDIpO1xyXG4gIHdyYXBPYmplY3RNZXRob2QoJ2lzU2VhbGVkJywgMik7XHJcbiAgd3JhcE9iamVjdE1ldGhvZCgnaXNFeHRlbnNpYmxlJywgMyk7XHJcbiAgd3JhcE9iamVjdE1ldGhvZCgnZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yJywgNCk7XHJcbiAgd3JhcE9iamVjdE1ldGhvZCgnZ2V0UHJvdG90eXBlT2YnKTtcclxuICB3cmFwT2JqZWN0TWV0aG9kKCdrZXlzJyk7XHJcbiAgd3JhcE9iamVjdE1ldGhvZCgnZ2V0T3duUHJvcGVydHlOYW1lcycpO1xyXG59KCk7XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIE1vZHVsZSA6IGVzNi5udW1iZXIuc3RhdGljcyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiFmdW5jdGlvbihpc0ludGVnZXIpe1xyXG4gICRkZWZpbmUoU1RBVElDLCBOVU1CRVIsIHtcclxuICAgIC8vIDIwLjEuMi4xIE51bWJlci5FUFNJTE9OXHJcbiAgICBFUFNJTE9OOiBwb3coMiwgLTUyKSxcclxuICAgIC8vIDIwLjEuMi4yIE51bWJlci5pc0Zpbml0ZShudW1iZXIpXHJcbiAgICBpc0Zpbml0ZTogZnVuY3Rpb24oaXQpe1xyXG4gICAgICByZXR1cm4gdHlwZW9mIGl0ID09ICdudW1iZXInICYmIGlzRmluaXRlKGl0KTtcclxuICAgIH0sXHJcbiAgICAvLyAyMC4xLjIuMyBOdW1iZXIuaXNJbnRlZ2VyKG51bWJlcilcclxuICAgIGlzSW50ZWdlcjogaXNJbnRlZ2VyLFxyXG4gICAgLy8gMjAuMS4yLjQgTnVtYmVyLmlzTmFOKG51bWJlcilcclxuICAgIGlzTmFOOiBzYW1lTmFOLFxyXG4gICAgLy8gMjAuMS4yLjUgTnVtYmVyLmlzU2FmZUludGVnZXIobnVtYmVyKVxyXG4gICAgaXNTYWZlSW50ZWdlcjogZnVuY3Rpb24obnVtYmVyKXtcclxuICAgICAgcmV0dXJuIGlzSW50ZWdlcihudW1iZXIpICYmIGFicyhudW1iZXIpIDw9IE1BWF9TQUZFX0lOVEVHRVI7XHJcbiAgICB9LFxyXG4gICAgLy8gMjAuMS4yLjYgTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVJcclxuICAgIE1BWF9TQUZFX0lOVEVHRVI6IE1BWF9TQUZFX0lOVEVHRVIsXHJcbiAgICAvLyAyMC4xLjIuMTAgTnVtYmVyLk1JTl9TQUZFX0lOVEVHRVJcclxuICAgIE1JTl9TQUZFX0lOVEVHRVI6IC1NQVhfU0FGRV9JTlRFR0VSLFxyXG4gICAgLy8gMjAuMS4yLjEyIE51bWJlci5wYXJzZUZsb2F0KHN0cmluZylcclxuICAgIHBhcnNlRmxvYXQ6IHBhcnNlRmxvYXQsXHJcbiAgICAvLyAyMC4xLjIuMTMgTnVtYmVyLnBhcnNlSW50KHN0cmluZywgcmFkaXgpXHJcbiAgICBwYXJzZUludDogcGFyc2VJbnRcclxuICB9KTtcclxuLy8gMjAuMS4yLjMgTnVtYmVyLmlzSW50ZWdlcihudW1iZXIpXHJcbn0oTnVtYmVyLmlzSW50ZWdlciB8fCBmdW5jdGlvbihpdCl7XHJcbiAgcmV0dXJuICFpc09iamVjdChpdCkgJiYgaXNGaW5pdGUoaXQpICYmIGZsb29yKGl0KSA9PT0gaXQ7XHJcbn0pO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBNb2R1bGUgOiBlczYubWF0aCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4vLyBFQ01BU2NyaXB0IDYgc2hpbVxyXG4hZnVuY3Rpb24oKXtcclxuICAvLyAyMC4yLjIuMjggTWF0aC5zaWduKHgpXHJcbiAgdmFyIEUgICAgPSBNYXRoLkVcclxuICAgICwgZXhwICA9IE1hdGguZXhwXHJcbiAgICAsIGxvZyAgPSBNYXRoLmxvZ1xyXG4gICAgLCBzcXJ0ID0gTWF0aC5zcXJ0XHJcbiAgICAsIHNpZ24gPSBNYXRoLnNpZ24gfHwgZnVuY3Rpb24oeCl7XHJcbiAgICAgICAgcmV0dXJuICh4ID0gK3gpID09IDAgfHwgeCAhPSB4ID8geCA6IHggPCAwID8gLTEgOiAxO1xyXG4gICAgICB9O1xyXG4gIFxyXG4gIC8vIDIwLjIuMi41IE1hdGguYXNpbmgoeClcclxuICBmdW5jdGlvbiBhc2luaCh4KXtcclxuICAgIHJldHVybiAhaXNGaW5pdGUoeCA9ICt4KSB8fCB4ID09IDAgPyB4IDogeCA8IDAgPyAtYXNpbmgoLXgpIDogbG9nKHggKyBzcXJ0KHggKiB4ICsgMSkpO1xyXG4gIH1cclxuICAvLyAyMC4yLjIuMTQgTWF0aC5leHBtMSh4KVxyXG4gIGZ1bmN0aW9uIGV4cG0xKHgpe1xyXG4gICAgcmV0dXJuICh4ID0gK3gpID09IDAgPyB4IDogeCA+IC0xZS02ICYmIHggPCAxZS02ID8geCArIHggKiB4IC8gMiA6IGV4cCh4KSAtIDE7XHJcbiAgfVxyXG4gICAgXHJcbiAgJGRlZmluZShTVEFUSUMsIE1BVEgsIHtcclxuICAgIC8vIDIwLjIuMi4zIE1hdGguYWNvc2goeClcclxuICAgIGFjb3NoOiBmdW5jdGlvbih4KXtcclxuICAgICAgcmV0dXJuICh4ID0gK3gpIDwgMSA/IE5hTiA6IGlzRmluaXRlKHgpID8gbG9nKHggLyBFICsgc3FydCh4ICsgMSkgKiBzcXJ0KHggLSAxKSAvIEUpICsgMSA6IHg7XHJcbiAgICB9LFxyXG4gICAgLy8gMjAuMi4yLjUgTWF0aC5hc2luaCh4KVxyXG4gICAgYXNpbmg6IGFzaW5oLFxyXG4gICAgLy8gMjAuMi4yLjcgTWF0aC5hdGFuaCh4KVxyXG4gICAgYXRhbmg6IGZ1bmN0aW9uKHgpe1xyXG4gICAgICByZXR1cm4gKHggPSAreCkgPT0gMCA/IHggOiBsb2coKDEgKyB4KSAvICgxIC0geCkpIC8gMjtcclxuICAgIH0sXHJcbiAgICAvLyAyMC4yLjIuOSBNYXRoLmNicnQoeClcclxuICAgIGNicnQ6IGZ1bmN0aW9uKHgpe1xyXG4gICAgICByZXR1cm4gc2lnbih4ID0gK3gpICogcG93KGFicyh4KSwgMSAvIDMpO1xyXG4gICAgfSxcclxuICAgIC8vIDIwLjIuMi4xMSBNYXRoLmNsejMyKHgpXHJcbiAgICBjbHozMjogZnVuY3Rpb24oeCl7XHJcbiAgICAgIHJldHVybiAoeCA+Pj49IDApID8gMzIgLSB4W1RPX1NUUklOR10oMikubGVuZ3RoIDogMzI7XHJcbiAgICB9LFxyXG4gICAgLy8gMjAuMi4yLjEyIE1hdGguY29zaCh4KVxyXG4gICAgY29zaDogZnVuY3Rpb24oeCl7XHJcbiAgICAgIHJldHVybiAoZXhwKHggPSAreCkgKyBleHAoLXgpKSAvIDI7XHJcbiAgICB9LFxyXG4gICAgLy8gMjAuMi4yLjE0IE1hdGguZXhwbTEoeClcclxuICAgIGV4cG0xOiBleHBtMSxcclxuICAgIC8vIDIwLjIuMi4xNiBNYXRoLmZyb3VuZCh4KVxyXG4gICAgLy8gVE9ETzogZmFsbGJhY2sgZm9yIElFOS1cclxuICAgIGZyb3VuZDogZnVuY3Rpb24oeCl7XHJcbiAgICAgIHJldHVybiBuZXcgRmxvYXQzMkFycmF5KFt4XSlbMF07XHJcbiAgICB9LFxyXG4gICAgLy8gMjAuMi4yLjE3IE1hdGguaHlwb3QoW3ZhbHVlMVssIHZhbHVlMlssIOKApiBdXV0pXHJcbiAgICBoeXBvdDogZnVuY3Rpb24odmFsdWUxLCB2YWx1ZTIpe1xyXG4gICAgICB2YXIgc3VtICA9IDBcclxuICAgICAgICAsIGxlbjEgPSBhcmd1bWVudHMubGVuZ3RoXHJcbiAgICAgICAgLCBsZW4yID0gbGVuMVxyXG4gICAgICAgICwgYXJncyA9IEFycmF5KGxlbjEpXHJcbiAgICAgICAgLCBsYXJnID0gLUluZmluaXR5XHJcbiAgICAgICAgLCBhcmc7XHJcbiAgICAgIHdoaWxlKGxlbjEtLSl7XHJcbiAgICAgICAgYXJnID0gYXJnc1tsZW4xXSA9ICthcmd1bWVudHNbbGVuMV07XHJcbiAgICAgICAgaWYoYXJnID09IEluZmluaXR5IHx8IGFyZyA9PSAtSW5maW5pdHkpcmV0dXJuIEluZmluaXR5O1xyXG4gICAgICAgIGlmKGFyZyA+IGxhcmcpbGFyZyA9IGFyZztcclxuICAgICAgfVxyXG4gICAgICBsYXJnID0gYXJnIHx8IDE7XHJcbiAgICAgIHdoaWxlKGxlbjItLSlzdW0gKz0gcG93KGFyZ3NbbGVuMl0gLyBsYXJnLCAyKTtcclxuICAgICAgcmV0dXJuIGxhcmcgKiBzcXJ0KHN1bSk7XHJcbiAgICB9LFxyXG4gICAgLy8gMjAuMi4yLjE4IE1hdGguaW11bCh4LCB5KVxyXG4gICAgaW11bDogZnVuY3Rpb24oeCwgeSl7XHJcbiAgICAgIHZhciBVSW50MTYgPSAweGZmZmZcclxuICAgICAgICAsIHhuID0gK3hcclxuICAgICAgICAsIHluID0gK3lcclxuICAgICAgICAsIHhsID0gVUludDE2ICYgeG5cclxuICAgICAgICAsIHlsID0gVUludDE2ICYgeW47XHJcbiAgICAgIHJldHVybiAwIHwgeGwgKiB5bCArICgoVUludDE2ICYgeG4gPj4+IDE2KSAqIHlsICsgeGwgKiAoVUludDE2ICYgeW4gPj4+IDE2KSA8PCAxNiA+Pj4gMCk7XHJcbiAgICB9LFxyXG4gICAgLy8gMjAuMi4yLjIwIE1hdGgubG9nMXAoeClcclxuICAgIGxvZzFwOiBmdW5jdGlvbih4KXtcclxuICAgICAgcmV0dXJuICh4ID0gK3gpID4gLTFlLTggJiYgeCA8IDFlLTggPyB4IC0geCAqIHggLyAyIDogbG9nKDEgKyB4KTtcclxuICAgIH0sXHJcbiAgICAvLyAyMC4yLjIuMjEgTWF0aC5sb2cxMCh4KVxyXG4gICAgbG9nMTA6IGZ1bmN0aW9uKHgpe1xyXG4gICAgICByZXR1cm4gbG9nKHgpIC8gTWF0aC5MTjEwO1xyXG4gICAgfSxcclxuICAgIC8vIDIwLjIuMi4yMiBNYXRoLmxvZzIoeClcclxuICAgIGxvZzI6IGZ1bmN0aW9uKHgpe1xyXG4gICAgICByZXR1cm4gbG9nKHgpIC8gTWF0aC5MTjI7XHJcbiAgICB9LFxyXG4gICAgLy8gMjAuMi4yLjI4IE1hdGguc2lnbih4KVxyXG4gICAgc2lnbjogc2lnbixcclxuICAgIC8vIDIwLjIuMi4zMCBNYXRoLnNpbmgoeClcclxuICAgIHNpbmg6IGZ1bmN0aW9uKHgpe1xyXG4gICAgICByZXR1cm4gKGFicyh4ID0gK3gpIDwgMSkgPyAoZXhwbTEoeCkgLSBleHBtMSgteCkpIC8gMiA6IChleHAoeCAtIDEpIC0gZXhwKC14IC0gMSkpICogKEUgLyAyKTtcclxuICAgIH0sXHJcbiAgICAvLyAyMC4yLjIuMzMgTWF0aC50YW5oKHgpXHJcbiAgICB0YW5oOiBmdW5jdGlvbih4KXtcclxuICAgICAgdmFyIGEgPSBleHBtMSh4ID0gK3gpXHJcbiAgICAgICAgLCBiID0gZXhwbTEoLXgpO1xyXG4gICAgICByZXR1cm4gYSA9PSBJbmZpbml0eSA/IDEgOiBiID09IEluZmluaXR5ID8gLTEgOiAoYSAtIGIpIC8gKGV4cCh4KSArIGV4cCgteCkpO1xyXG4gICAgfSxcclxuICAgIC8vIDIwLjIuMi4zNCBNYXRoLnRydW5jKHgpXHJcbiAgICB0cnVuYzogdHJ1bmNcclxuICB9KTtcclxufSgpO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBNb2R1bGUgOiBlczYuc3RyaW5nICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4hZnVuY3Rpb24oZnJvbUNoYXJDb2RlKXtcclxuICBmdW5jdGlvbiBhc3NlcnROb3RSZWdFeHAoaXQpe1xyXG4gICAgaWYoY29mKGl0KSA9PSBSRUdFWFApdGhyb3cgVHlwZUVycm9yKCk7XHJcbiAgfVxyXG4gIFxyXG4gICRkZWZpbmUoU1RBVElDLCBTVFJJTkcsIHtcclxuICAgIC8vIDIxLjEuMi4yIFN0cmluZy5mcm9tQ29kZVBvaW50KC4uLmNvZGVQb2ludHMpXHJcbiAgICBmcm9tQ29kZVBvaW50OiBmdW5jdGlvbih4KXtcclxuICAgICAgdmFyIHJlcyA9IFtdXHJcbiAgICAgICAgLCBsZW4gPSBhcmd1bWVudHMubGVuZ3RoXHJcbiAgICAgICAgLCBpICAgPSAwXHJcbiAgICAgICAgLCBjb2RlXHJcbiAgICAgIHdoaWxlKGxlbiA+IGkpe1xyXG4gICAgICAgIGNvZGUgPSArYXJndW1lbnRzW2krK107XHJcbiAgICAgICAgaWYodG9JbmRleChjb2RlLCAweDEwZmZmZikgIT09IGNvZGUpdGhyb3cgUmFuZ2VFcnJvcihjb2RlICsgJyBpcyBub3QgYSB2YWxpZCBjb2RlIHBvaW50Jyk7XHJcbiAgICAgICAgcmVzLnB1c2goY29kZSA8IDB4MTAwMDBcclxuICAgICAgICAgID8gZnJvbUNoYXJDb2RlKGNvZGUpXHJcbiAgICAgICAgICA6IGZyb21DaGFyQ29kZSgoKGNvZGUgLT0gMHgxMDAwMCkgPj4gMTApICsgMHhkODAwLCBjb2RlICUgMHg0MDAgKyAweGRjMDApXHJcbiAgICAgICAgKTtcclxuICAgICAgfSByZXR1cm4gcmVzLmpvaW4oJycpO1xyXG4gICAgfSxcclxuICAgIC8vIDIxLjEuMi40IFN0cmluZy5yYXcoY2FsbFNpdGUsIC4uLnN1YnN0aXR1dGlvbnMpXHJcbiAgICByYXc6IGZ1bmN0aW9uKGNhbGxTaXRlKXtcclxuICAgICAgdmFyIHJhdyA9IHRvT2JqZWN0KGNhbGxTaXRlLnJhdylcclxuICAgICAgICAsIGxlbiA9IHRvTGVuZ3RoKHJhdy5sZW5ndGgpXHJcbiAgICAgICAgLCBzbG4gPSBhcmd1bWVudHMubGVuZ3RoXHJcbiAgICAgICAgLCByZXMgPSBbXVxyXG4gICAgICAgICwgaSAgID0gMDtcclxuICAgICAgd2hpbGUobGVuID4gaSl7XHJcbiAgICAgICAgcmVzLnB1c2goU3RyaW5nKHJhd1tpKytdKSk7XHJcbiAgICAgICAgaWYoaSA8IHNsbilyZXMucHVzaChTdHJpbmcoYXJndW1lbnRzW2ldKSk7XHJcbiAgICAgIH0gcmV0dXJuIHJlcy5qb2luKCcnKTtcclxuICAgIH1cclxuICB9KTtcclxuICBcclxuICAkZGVmaW5lKFBST1RPLCBTVFJJTkcsIHtcclxuICAgIC8vIDIxLjEuMy4zIFN0cmluZy5wcm90b3R5cGUuY29kZVBvaW50QXQocG9zKVxyXG4gICAgY29kZVBvaW50QXQ6IGNyZWF0ZVBvaW50QXQoZmFsc2UpLFxyXG4gICAgLy8gMjEuMS4zLjYgU3RyaW5nLnByb3RvdHlwZS5lbmRzV2l0aChzZWFyY2hTdHJpbmcgWywgZW5kUG9zaXRpb25dKVxyXG4gICAgZW5kc1dpdGg6IGZ1bmN0aW9uKHNlYXJjaFN0cmluZyAvKiwgZW5kUG9zaXRpb24gPSBAbGVuZ3RoICovKXtcclxuICAgICAgYXNzZXJ0Tm90UmVnRXhwKHNlYXJjaFN0cmluZyk7XHJcbiAgICAgIHZhciB0aGF0ID0gU3RyaW5nKGFzc2VydERlZmluZWQodGhpcykpXHJcbiAgICAgICAgLCBlbmRQb3NpdGlvbiA9IGFyZ3VtZW50c1sxXVxyXG4gICAgICAgICwgbGVuID0gdG9MZW5ndGgodGhhdC5sZW5ndGgpXHJcbiAgICAgICAgLCBlbmQgPSBlbmRQb3NpdGlvbiA9PT0gdW5kZWZpbmVkID8gbGVuIDogbWluKHRvTGVuZ3RoKGVuZFBvc2l0aW9uKSwgbGVuKTtcclxuICAgICAgc2VhcmNoU3RyaW5nICs9ICcnO1xyXG4gICAgICByZXR1cm4gdGhhdC5zbGljZShlbmQgLSBzZWFyY2hTdHJpbmcubGVuZ3RoLCBlbmQpID09PSBzZWFyY2hTdHJpbmc7XHJcbiAgICB9LFxyXG4gICAgLy8gMjEuMS4zLjcgU3RyaW5nLnByb3RvdHlwZS5pbmNsdWRlcyhzZWFyY2hTdHJpbmcsIHBvc2l0aW9uID0gMClcclxuICAgIGluY2x1ZGVzOiBmdW5jdGlvbihzZWFyY2hTdHJpbmcgLyosIHBvc2l0aW9uID0gMCAqLyl7XHJcbiAgICAgIGFzc2VydE5vdFJlZ0V4cChzZWFyY2hTdHJpbmcpO1xyXG4gICAgICByZXR1cm4gISF+U3RyaW5nKGFzc2VydERlZmluZWQodGhpcykpLmluZGV4T2Yoc2VhcmNoU3RyaW5nLCBhcmd1bWVudHNbMV0pO1xyXG4gICAgfSxcclxuICAgIC8vIDIxLjEuMy4xMyBTdHJpbmcucHJvdG90eXBlLnJlcGVhdChjb3VudClcclxuICAgIHJlcGVhdDogZnVuY3Rpb24oY291bnQpe1xyXG4gICAgICB2YXIgc3RyID0gU3RyaW5nKGFzc2VydERlZmluZWQodGhpcykpXHJcbiAgICAgICAgLCByZXMgPSAnJ1xyXG4gICAgICAgICwgbiAgID0gdG9JbnRlZ2VyKGNvdW50KTtcclxuICAgICAgaWYoMCA+IG4gfHwgbiA9PSBJbmZpbml0eSl0aHJvdyBSYW5nZUVycm9yKFwiQ291bnQgY2FuJ3QgYmUgbmVnYXRpdmVcIik7XHJcbiAgICAgIGZvcig7biA+IDA7IChuID4+Pj0gMSkgJiYgKHN0ciArPSBzdHIpKWlmKG4gJiAxKXJlcyArPSBzdHI7XHJcbiAgICAgIHJldHVybiByZXM7XHJcbiAgICB9LFxyXG4gICAgLy8gMjEuMS4zLjE4IFN0cmluZy5wcm90b3R5cGUuc3RhcnRzV2l0aChzZWFyY2hTdHJpbmcgWywgcG9zaXRpb24gXSlcclxuICAgIHN0YXJ0c1dpdGg6IGZ1bmN0aW9uKHNlYXJjaFN0cmluZyAvKiwgcG9zaXRpb24gPSAwICovKXtcclxuICAgICAgYXNzZXJ0Tm90UmVnRXhwKHNlYXJjaFN0cmluZyk7XHJcbiAgICAgIHZhciB0aGF0ICA9IFN0cmluZyhhc3NlcnREZWZpbmVkKHRoaXMpKVxyXG4gICAgICAgICwgaW5kZXggPSB0b0xlbmd0aChtaW4oYXJndW1lbnRzWzFdLCB0aGF0Lmxlbmd0aCkpO1xyXG4gICAgICBzZWFyY2hTdHJpbmcgKz0gJyc7XHJcbiAgICAgIHJldHVybiB0aGF0LnNsaWNlKGluZGV4LCBpbmRleCArIHNlYXJjaFN0cmluZy5sZW5ndGgpID09PSBzZWFyY2hTdHJpbmc7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn0oU3RyaW5nLmZyb21DaGFyQ29kZSk7XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIE1vZHVsZSA6IGVzNi5hcnJheS5zdGF0aWNzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiFmdW5jdGlvbigpe1xyXG4gICRkZWZpbmUoU1RBVElDICsgRk9SQ0VEICogY2hlY2tEYW5nZXJJdGVyQ2xvc2luZyhBcnJheS5mcm9tKSwgQVJSQVksIHtcclxuICAgIC8vIDIyLjEuMi4xIEFycmF5LmZyb20oYXJyYXlMaWtlLCBtYXBmbiA9IHVuZGVmaW5lZCwgdGhpc0FyZyA9IHVuZGVmaW5lZClcclxuICAgIGZyb206IGZ1bmN0aW9uKGFycmF5TGlrZS8qLCBtYXBmbiA9IHVuZGVmaW5lZCwgdGhpc0FyZyA9IHVuZGVmaW5lZCovKXtcclxuICAgICAgdmFyIE8gICAgICAgPSBPYmplY3QoYXNzZXJ0RGVmaW5lZChhcnJheUxpa2UpKVxyXG4gICAgICAgICwgbWFwZm4gICA9IGFyZ3VtZW50c1sxXVxyXG4gICAgICAgICwgbWFwcGluZyA9IG1hcGZuICE9PSB1bmRlZmluZWRcclxuICAgICAgICAsIGYgICAgICAgPSBtYXBwaW5nID8gY3R4KG1hcGZuLCBhcmd1bWVudHNbMl0sIDIpIDogdW5kZWZpbmVkXHJcbiAgICAgICAgLCBpbmRleCAgID0gMFxyXG4gICAgICAgICwgbGVuZ3RoLCByZXN1bHQsIHN0ZXA7XHJcbiAgICAgIGlmKGlzSXRlcmFibGUoTykpe1xyXG4gICAgICAgIHJlc3VsdCA9IG5ldyAoZ2VuZXJpYyh0aGlzLCBBcnJheSkpO1xyXG4gICAgICAgIHNhZmVJdGVyQ2xvc2UoZnVuY3Rpb24oaXRlcmF0b3Ipe1xyXG4gICAgICAgICAgZm9yKDsgIShzdGVwID0gaXRlcmF0b3IubmV4dCgpKS5kb25lOyBpbmRleCsrKXtcclxuICAgICAgICAgICAgcmVzdWx0W2luZGV4XSA9IG1hcHBpbmcgPyBmKHN0ZXAudmFsdWUsIGluZGV4KSA6IHN0ZXAudmFsdWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSwgZ2V0SXRlcmF0b3IoTykpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJlc3VsdCA9IG5ldyAoZ2VuZXJpYyh0aGlzLCBBcnJheSkpKGxlbmd0aCA9IHRvTGVuZ3RoKE8ubGVuZ3RoKSk7XHJcbiAgICAgICAgZm9yKDsgbGVuZ3RoID4gaW5kZXg7IGluZGV4Kyspe1xyXG4gICAgICAgICAgcmVzdWx0W2luZGV4XSA9IG1hcHBpbmcgPyBmKE9baW5kZXhdLCBpbmRleCkgOiBPW2luZGV4XTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmVzdWx0Lmxlbmd0aCA9IGluZGV4O1xyXG4gICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG4gIH0pO1xyXG4gIFxyXG4gICRkZWZpbmUoU1RBVElDLCBBUlJBWSwge1xyXG4gICAgLy8gMjIuMS4yLjMgQXJyYXkub2YoIC4uLml0ZW1zKVxyXG4gICAgb2Y6IGZ1bmN0aW9uKC8qIC4uLmFyZ3MgKi8pe1xyXG4gICAgICB2YXIgaW5kZXggID0gMFxyXG4gICAgICAgICwgbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aFxyXG4gICAgICAgICwgcmVzdWx0ID0gbmV3IChnZW5lcmljKHRoaXMsIEFycmF5KSkobGVuZ3RoKTtcclxuICAgICAgd2hpbGUobGVuZ3RoID4gaW5kZXgpcmVzdWx0W2luZGV4XSA9IGFyZ3VtZW50c1tpbmRleCsrXTtcclxuICAgICAgcmVzdWx0Lmxlbmd0aCA9IGxlbmd0aDtcclxuICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuICB9KTtcclxuICBcclxuICBzZXRTcGVjaWVzKEFycmF5KTtcclxufSgpO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBNb2R1bGUgOiBlczYuYXJyYXkucHJvdG90eXBlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4hZnVuY3Rpb24oKXtcclxuICAkZGVmaW5lKFBST1RPLCBBUlJBWSwge1xyXG4gICAgLy8gMjIuMS4zLjMgQXJyYXkucHJvdG90eXBlLmNvcHlXaXRoaW4odGFyZ2V0LCBzdGFydCwgZW5kID0gdGhpcy5sZW5ndGgpXHJcbiAgICBjb3B5V2l0aGluOiBmdW5jdGlvbih0YXJnZXQgLyogPSAwICovLCBzdGFydCAvKiA9IDAsIGVuZCA9IEBsZW5ndGggKi8pe1xyXG4gICAgICB2YXIgTyAgICAgPSBPYmplY3QoYXNzZXJ0RGVmaW5lZCh0aGlzKSlcclxuICAgICAgICAsIGxlbiAgID0gdG9MZW5ndGgoTy5sZW5ndGgpXHJcbiAgICAgICAgLCB0byAgICA9IHRvSW5kZXgodGFyZ2V0LCBsZW4pXHJcbiAgICAgICAgLCBmcm9tICA9IHRvSW5kZXgoc3RhcnQsIGxlbilcclxuICAgICAgICAsIGVuZCAgID0gYXJndW1lbnRzWzJdXHJcbiAgICAgICAgLCBmaW4gICA9IGVuZCA9PT0gdW5kZWZpbmVkID8gbGVuIDogdG9JbmRleChlbmQsIGxlbilcclxuICAgICAgICAsIGNvdW50ID0gbWluKGZpbiAtIGZyb20sIGxlbiAtIHRvKVxyXG4gICAgICAgICwgaW5jICAgPSAxO1xyXG4gICAgICBpZihmcm9tIDwgdG8gJiYgdG8gPCBmcm9tICsgY291bnQpe1xyXG4gICAgICAgIGluYyAgPSAtMTtcclxuICAgICAgICBmcm9tID0gZnJvbSArIGNvdW50IC0gMTtcclxuICAgICAgICB0byAgID0gdG8gKyBjb3VudCAtIDE7XHJcbiAgICAgIH1cclxuICAgICAgd2hpbGUoY291bnQtLSA+IDApe1xyXG4gICAgICAgIGlmKGZyb20gaW4gTylPW3RvXSA9IE9bZnJvbV07XHJcbiAgICAgICAgZWxzZSBkZWxldGUgT1t0b107XHJcbiAgICAgICAgdG8gKz0gaW5jO1xyXG4gICAgICAgIGZyb20gKz0gaW5jO1xyXG4gICAgICB9IHJldHVybiBPO1xyXG4gICAgfSxcclxuICAgIC8vIDIyLjEuMy42IEFycmF5LnByb3RvdHlwZS5maWxsKHZhbHVlLCBzdGFydCA9IDAsIGVuZCA9IHRoaXMubGVuZ3RoKVxyXG4gICAgZmlsbDogZnVuY3Rpb24odmFsdWUgLyosIHN0YXJ0ID0gMCwgZW5kID0gQGxlbmd0aCAqLyl7XHJcbiAgICAgIHZhciBPICAgICAgPSBPYmplY3QoYXNzZXJ0RGVmaW5lZCh0aGlzKSlcclxuICAgICAgICAsIGxlbmd0aCA9IHRvTGVuZ3RoKE8ubGVuZ3RoKVxyXG4gICAgICAgICwgaW5kZXggID0gdG9JbmRleChhcmd1bWVudHNbMV0sIGxlbmd0aClcclxuICAgICAgICAsIGVuZCAgICA9IGFyZ3VtZW50c1syXVxyXG4gICAgICAgICwgZW5kUG9zID0gZW5kID09PSB1bmRlZmluZWQgPyBsZW5ndGggOiB0b0luZGV4KGVuZCwgbGVuZ3RoKTtcclxuICAgICAgd2hpbGUoZW5kUG9zID4gaW5kZXgpT1tpbmRleCsrXSA9IHZhbHVlO1xyXG4gICAgICByZXR1cm4gTztcclxuICAgIH0sXHJcbiAgICAvLyAyMi4xLjMuOCBBcnJheS5wcm90b3R5cGUuZmluZChwcmVkaWNhdGUsIHRoaXNBcmcgPSB1bmRlZmluZWQpXHJcbiAgICBmaW5kOiBjcmVhdGVBcnJheU1ldGhvZCg1KSxcclxuICAgIC8vIDIyLjEuMy45IEFycmF5LnByb3RvdHlwZS5maW5kSW5kZXgocHJlZGljYXRlLCB0aGlzQXJnID0gdW5kZWZpbmVkKVxyXG4gICAgZmluZEluZGV4OiBjcmVhdGVBcnJheU1ldGhvZCg2KVxyXG4gIH0pO1xyXG4gIFxyXG4gIGlmKGZyYW1ld29yayl7XHJcbiAgICAvLyAyMi4xLjMuMzEgQXJyYXkucHJvdG90eXBlW0BAdW5zY29wYWJsZXNdXHJcbiAgICBmb3JFYWNoLmNhbGwoYXJyYXkoJ2ZpbmQsZmluZEluZGV4LGZpbGwsY29weVdpdGhpbixlbnRyaWVzLGtleXMsdmFsdWVzJyksIGZ1bmN0aW9uKGl0KXtcclxuICAgICAgQXJyYXlVbnNjb3BhYmxlc1tpdF0gPSB0cnVlO1xyXG4gICAgfSk7XHJcbiAgICBTWU1CT0xfVU5TQ09QQUJMRVMgaW4gQXJyYXlQcm90byB8fCBoaWRkZW4oQXJyYXlQcm90bywgU1lNQk9MX1VOU0NPUEFCTEVTLCBBcnJheVVuc2NvcGFibGVzKTtcclxuICB9XHJcbn0oKTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogTW9kdWxlIDogZXM2Lml0ZXJhdG9ycyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuIWZ1bmN0aW9uKGF0KXtcclxuICAvLyAyMi4xLjMuNCBBcnJheS5wcm90b3R5cGUuZW50cmllcygpXHJcbiAgLy8gMjIuMS4zLjEzIEFycmF5LnByb3RvdHlwZS5rZXlzKClcclxuICAvLyAyMi4xLjMuMjkgQXJyYXkucHJvdG90eXBlLnZhbHVlcygpXHJcbiAgLy8gMjIuMS4zLjMwIEFycmF5LnByb3RvdHlwZVtAQGl0ZXJhdG9yXSgpXHJcbiAgZGVmaW5lU3RkSXRlcmF0b3JzKEFycmF5LCBBUlJBWSwgZnVuY3Rpb24oaXRlcmF0ZWQsIGtpbmQpe1xyXG4gICAgc2V0KHRoaXMsIElURVIsIHtvOiB0b09iamVjdChpdGVyYXRlZCksIGk6IDAsIGs6IGtpbmR9KTtcclxuICAvLyAyMi4xLjUuMi4xICVBcnJheUl0ZXJhdG9yUHJvdG90eXBlJS5uZXh0KClcclxuICB9LCBmdW5jdGlvbigpe1xyXG4gICAgdmFyIGl0ZXIgID0gdGhpc1tJVEVSXVxyXG4gICAgICAsIE8gICAgID0gaXRlci5vXHJcbiAgICAgICwga2luZCAgPSBpdGVyLmtcclxuICAgICAgLCBpbmRleCA9IGl0ZXIuaSsrO1xyXG4gICAgaWYoIU8gfHwgaW5kZXggPj0gTy5sZW5ndGgpe1xyXG4gICAgICBpdGVyLm8gPSB1bmRlZmluZWQ7XHJcbiAgICAgIHJldHVybiBpdGVyUmVzdWx0KDEpO1xyXG4gICAgfVxyXG4gICAgaWYoa2luZCA9PSBLRVkpICByZXR1cm4gaXRlclJlc3VsdCgwLCBpbmRleCk7XHJcbiAgICBpZihraW5kID09IFZBTFVFKXJldHVybiBpdGVyUmVzdWx0KDAsIE9baW5kZXhdKTtcclxuICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGl0ZXJSZXN1bHQoMCwgW2luZGV4LCBPW2luZGV4XV0pO1xyXG4gIH0sIFZBTFVFKTtcclxuICBcclxuICAvLyBhcmd1bWVudHNMaXN0W0BAaXRlcmF0b3JdIGlzICVBcnJheVByb3RvX3ZhbHVlcyUgKDkuNC40LjYsIDkuNC40LjcpXHJcbiAgSXRlcmF0b3JzW0FSR1VNRU5UU10gPSBJdGVyYXRvcnNbQVJSQVldO1xyXG4gIFxyXG4gIC8vIDIxLjEuMy4yNyBTdHJpbmcucHJvdG90eXBlW0BAaXRlcmF0b3JdKClcclxuICBkZWZpbmVTdGRJdGVyYXRvcnMoU3RyaW5nLCBTVFJJTkcsIGZ1bmN0aW9uKGl0ZXJhdGVkKXtcclxuICAgIHNldCh0aGlzLCBJVEVSLCB7bzogU3RyaW5nKGl0ZXJhdGVkKSwgaTogMH0pO1xyXG4gIC8vIDIxLjEuNS4yLjEgJVN0cmluZ0l0ZXJhdG9yUHJvdG90eXBlJS5uZXh0KClcclxuICB9LCBmdW5jdGlvbigpe1xyXG4gICAgdmFyIGl0ZXIgID0gdGhpc1tJVEVSXVxyXG4gICAgICAsIE8gICAgID0gaXRlci5vXHJcbiAgICAgICwgaW5kZXggPSBpdGVyLmlcclxuICAgICAgLCBwb2ludDtcclxuICAgIGlmKGluZGV4ID49IE8ubGVuZ3RoKXJldHVybiBpdGVyUmVzdWx0KDEpO1xyXG4gICAgcG9pbnQgPSBhdC5jYWxsKE8sIGluZGV4KTtcclxuICAgIGl0ZXIuaSArPSBwb2ludC5sZW5ndGg7XHJcbiAgICByZXR1cm4gaXRlclJlc3VsdCgwLCBwb2ludCk7XHJcbiAgfSk7XHJcbn0oY3JlYXRlUG9pbnRBdCh0cnVlKSk7XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIE1vZHVsZSA6IHdlYi5pbW1lZGlhdGUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbi8vIHNldEltbWVkaWF0ZSBzaGltXHJcbi8vIE5vZGUuanMgMC45KyAmIElFMTArIGhhcyBzZXRJbW1lZGlhdGUsIGVsc2U6XHJcbmlzRnVuY3Rpb24oc2V0SW1tZWRpYXRlKSAmJiBpc0Z1bmN0aW9uKGNsZWFySW1tZWRpYXRlKSB8fCBmdW5jdGlvbihPTlJFQURZU1RBVEVDSEFOR0Upe1xyXG4gIHZhciBwb3N0TWVzc2FnZSAgICAgID0gZ2xvYmFsLnBvc3RNZXNzYWdlXHJcbiAgICAsIGFkZEV2ZW50TGlzdGVuZXIgPSBnbG9iYWwuYWRkRXZlbnRMaXN0ZW5lclxyXG4gICAgLCBNZXNzYWdlQ2hhbm5lbCAgID0gZ2xvYmFsLk1lc3NhZ2VDaGFubmVsXHJcbiAgICAsIGNvdW50ZXIgICAgICAgICAgPSAwXHJcbiAgICAsIHF1ZXVlICAgICAgICAgICAgPSB7fVxyXG4gICAgLCBkZWZlciwgY2hhbm5lbCwgcG9ydDtcclxuICBzZXRJbW1lZGlhdGUgPSBmdW5jdGlvbihmbil7XHJcbiAgICB2YXIgYXJncyA9IFtdLCBpID0gMTtcclxuICAgIHdoaWxlKGFyZ3VtZW50cy5sZW5ndGggPiBpKWFyZ3MucHVzaChhcmd1bWVudHNbaSsrXSk7XHJcbiAgICBxdWV1ZVsrK2NvdW50ZXJdID0gZnVuY3Rpb24oKXtcclxuICAgICAgaW52b2tlKGlzRnVuY3Rpb24oZm4pID8gZm4gOiBGdW5jdGlvbihmbiksIGFyZ3MpO1xyXG4gICAgfVxyXG4gICAgZGVmZXIoY291bnRlcik7XHJcbiAgICByZXR1cm4gY291bnRlcjtcclxuICB9XHJcbiAgY2xlYXJJbW1lZGlhdGUgPSBmdW5jdGlvbihpZCl7XHJcbiAgICBkZWxldGUgcXVldWVbaWRdO1xyXG4gIH1cclxuICBmdW5jdGlvbiBydW4oaWQpe1xyXG4gICAgaWYoaGFzKHF1ZXVlLCBpZCkpe1xyXG4gICAgICB2YXIgZm4gPSBxdWV1ZVtpZF07XHJcbiAgICAgIGRlbGV0ZSBxdWV1ZVtpZF07XHJcbiAgICAgIGZuKCk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIGZ1bmN0aW9uIGxpc3RuZXIoZXZlbnQpe1xyXG4gICAgcnVuKGV2ZW50LmRhdGEpO1xyXG4gIH1cclxuICAvLyBOb2RlLmpzIDAuOC1cclxuICBpZihOT0RFKXtcclxuICAgIGRlZmVyID0gZnVuY3Rpb24oaWQpe1xyXG4gICAgICBuZXh0VGljayhwYXJ0LmNhbGwocnVuLCBpZCkpO1xyXG4gICAgfVxyXG4gIC8vIE1vZGVybiBicm93c2Vycywgc2tpcCBpbXBsZW1lbnRhdGlvbiBmb3IgV2ViV29ya2Vyc1xyXG4gIC8vIElFOCBoYXMgcG9zdE1lc3NhZ2UsIGJ1dCBpdCdzIHN5bmMgJiB0eXBlb2YgaXRzIHBvc3RNZXNzYWdlIGlzIG9iamVjdFxyXG4gIH0gZWxzZSBpZihhZGRFdmVudExpc3RlbmVyICYmIGlzRnVuY3Rpb24ocG9zdE1lc3NhZ2UpICYmICFnbG9iYWwuaW1wb3J0U2NyaXB0cyl7XHJcbiAgICBkZWZlciA9IGZ1bmN0aW9uKGlkKXtcclxuICAgICAgcG9zdE1lc3NhZ2UoaWQsICcqJyk7XHJcbiAgICB9XHJcbiAgICBhZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgbGlzdG5lciwgZmFsc2UpO1xyXG4gIC8vIFdlYldvcmtlcnNcclxuICB9IGVsc2UgaWYoaXNGdW5jdGlvbihNZXNzYWdlQ2hhbm5lbCkpe1xyXG4gICAgY2hhbm5lbCA9IG5ldyBNZXNzYWdlQ2hhbm5lbDtcclxuICAgIHBvcnQgICAgPSBjaGFubmVsLnBvcnQyO1xyXG4gICAgY2hhbm5lbC5wb3J0MS5vbm1lc3NhZ2UgPSBsaXN0bmVyO1xyXG4gICAgZGVmZXIgPSBjdHgocG9ydC5wb3N0TWVzc2FnZSwgcG9ydCwgMSk7XHJcbiAgLy8gSUU4LVxyXG4gIH0gZWxzZSBpZihkb2N1bWVudCAmJiBPTlJFQURZU1RBVEVDSEFOR0UgaW4gZG9jdW1lbnRbQ1JFQVRFX0VMRU1FTlRdKCdzY3JpcHQnKSl7XHJcbiAgICBkZWZlciA9IGZ1bmN0aW9uKGlkKXtcclxuICAgICAgaHRtbC5hcHBlbmRDaGlsZChkb2N1bWVudFtDUkVBVEVfRUxFTUVOVF0oJ3NjcmlwdCcpKVtPTlJFQURZU1RBVEVDSEFOR0VdID0gZnVuY3Rpb24oKXtcclxuICAgICAgICBodG1sLnJlbW92ZUNoaWxkKHRoaXMpO1xyXG4gICAgICAgIHJ1bihpZCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAvLyBSZXN0IG9sZCBicm93c2Vyc1xyXG4gIH0gZWxzZSB7XHJcbiAgICBkZWZlciA9IGZ1bmN0aW9uKGlkKXtcclxuICAgICAgc2V0VGltZW91dChydW4sIDAsIGlkKTtcclxuICAgIH1cclxuICB9XHJcbn0oJ29ucmVhZHlzdGF0ZWNoYW5nZScpO1xyXG4kZGVmaW5lKEdMT0JBTCArIEJJTkQsIHtcclxuICBzZXRJbW1lZGlhdGU6ICAgc2V0SW1tZWRpYXRlLFxyXG4gIGNsZWFySW1tZWRpYXRlOiBjbGVhckltbWVkaWF0ZVxyXG59KTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogTW9kdWxlIDogZXM2LnByb21pc2UgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuLy8gRVM2IHByb21pc2VzIHNoaW1cclxuLy8gQmFzZWQgb24gaHR0cHM6Ly9naXRodWIuY29tL2dldGlmeS9uYXRpdmUtcHJvbWlzZS1vbmx5L1xyXG4hZnVuY3Rpb24oUHJvbWlzZSwgdGVzdCl7XHJcbiAgaXNGdW5jdGlvbihQcm9taXNlKSAmJiBpc0Z1bmN0aW9uKFByb21pc2UucmVzb2x2ZSlcclxuICAmJiBQcm9taXNlLnJlc29sdmUodGVzdCA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKCl7fSkpID09IHRlc3RcclxuICB8fCBmdW5jdGlvbihhc2FwLCBSRUNPUkQpe1xyXG4gICAgZnVuY3Rpb24gaXNUaGVuYWJsZShpdCl7XHJcbiAgICAgIHZhciB0aGVuO1xyXG4gICAgICBpZihpc09iamVjdChpdCkpdGhlbiA9IGl0LnRoZW47XHJcbiAgICAgIHJldHVybiBpc0Z1bmN0aW9uKHRoZW4pID8gdGhlbiA6IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gaGFuZGxlZFJlamVjdGlvbk9ySGFzT25SZWplY3RlZChwcm9taXNlKXtcclxuICAgICAgdmFyIHJlY29yZCA9IHByb21pc2VbUkVDT1JEXVxyXG4gICAgICAgICwgY2hhaW4gID0gcmVjb3JkLmNcclxuICAgICAgICAsIGkgICAgICA9IDBcclxuICAgICAgICAsIHJlYWN0O1xyXG4gICAgICBpZihyZWNvcmQuaClyZXR1cm4gdHJ1ZTtcclxuICAgICAgd2hpbGUoY2hhaW4ubGVuZ3RoID4gaSl7XHJcbiAgICAgICAgcmVhY3QgPSBjaGFpbltpKytdO1xyXG4gICAgICAgIGlmKHJlYWN0LmZhaWwgfHwgaGFuZGxlZFJlamVjdGlvbk9ySGFzT25SZWplY3RlZChyZWFjdC5QKSlyZXR1cm4gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gbm90aWZ5KHJlY29yZCwgcmVqZWN0KXtcclxuICAgICAgdmFyIGNoYWluID0gcmVjb3JkLmM7XHJcbiAgICAgIGlmKHJlamVjdCB8fCBjaGFpbi5sZW5ndGgpYXNhcChmdW5jdGlvbigpe1xyXG4gICAgICAgIHZhciBwcm9taXNlID0gcmVjb3JkLnBcclxuICAgICAgICAgICwgdmFsdWUgICA9IHJlY29yZC52XHJcbiAgICAgICAgICAsIG9rICAgICAgPSByZWNvcmQucyA9PSAxXHJcbiAgICAgICAgICAsIGkgICAgICAgPSAwO1xyXG4gICAgICAgIGlmKHJlamVjdCAmJiAhaGFuZGxlZFJlamVjdGlvbk9ySGFzT25SZWplY3RlZChwcm9taXNlKSl7XHJcbiAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIGlmKCFoYW5kbGVkUmVqZWN0aW9uT3JIYXNPblJlamVjdGVkKHByb21pc2UpKXtcclxuICAgICAgICAgICAgICBpZihOT0RFKXtcclxuICAgICAgICAgICAgICAgIGlmKCFwcm9jZXNzLmVtaXQoJ3VuaGFuZGxlZFJlamVjdGlvbicsIHZhbHVlLCBwcm9taXNlKSl7XHJcbiAgICAgICAgICAgICAgICAgIC8vIGRlZmF1bHQgbm9kZS5qcyBiZWhhdmlvclxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0gZWxzZSBpZihpc0Z1bmN0aW9uKGNvbnNvbGUuZXJyb3IpKXtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1VuaGFuZGxlZCBwcm9taXNlIHJlamVjdGlvbicsIHZhbHVlKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sIDFlMyk7XHJcbiAgICAgICAgfSBlbHNlIHdoaWxlKGNoYWluLmxlbmd0aCA+IGkpIWZ1bmN0aW9uKHJlYWN0KXtcclxuICAgICAgICAgIHZhciBjYiA9IG9rID8gcmVhY3Qub2sgOiByZWFjdC5mYWlsXHJcbiAgICAgICAgICAgICwgcmV0LCB0aGVuO1xyXG4gICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaWYoY2Ipe1xyXG4gICAgICAgICAgICAgIGlmKCFvaylyZWNvcmQuaCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgcmV0ID0gY2IgPT09IHRydWUgPyB2YWx1ZSA6IGNiKHZhbHVlKTtcclxuICAgICAgICAgICAgICBpZihyZXQgPT09IHJlYWN0LlApe1xyXG4gICAgICAgICAgICAgICAgcmVhY3QucmVqKFR5cGVFcnJvcihQUk9NSVNFICsgJy1jaGFpbiBjeWNsZScpKTtcclxuICAgICAgICAgICAgICB9IGVsc2UgaWYodGhlbiA9IGlzVGhlbmFibGUocmV0KSl7XHJcbiAgICAgICAgICAgICAgICB0aGVuLmNhbGwocmV0LCByZWFjdC5yZXMsIHJlYWN0LnJlaik7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHJlYWN0LnJlcyhyZXQpO1xyXG4gICAgICAgICAgICB9IGVsc2UgcmVhY3QucmVqKHZhbHVlKTtcclxuICAgICAgICAgIH0gY2F0Y2goZXJyKXtcclxuICAgICAgICAgICAgcmVhY3QucmVqKGVycik7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfShjaGFpbltpKytdKTtcclxuICAgICAgICBjaGFpbi5sZW5ndGggPSAwO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIHJlc29sdmUodmFsdWUpe1xyXG4gICAgICB2YXIgcmVjb3JkID0gdGhpc1xyXG4gICAgICAgICwgdGhlbiwgd3JhcHBlcjtcclxuICAgICAgaWYocmVjb3JkLmQpcmV0dXJuO1xyXG4gICAgICByZWNvcmQuZCA9IHRydWU7XHJcbiAgICAgIHJlY29yZCA9IHJlY29yZC5yIHx8IHJlY29yZDsgLy8gdW53cmFwXHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgaWYodGhlbiA9IGlzVGhlbmFibGUodmFsdWUpKXtcclxuICAgICAgICAgIHdyYXBwZXIgPSB7cjogcmVjb3JkLCBkOiBmYWxzZX07IC8vIHdyYXBcclxuICAgICAgICAgIHRoZW4uY2FsbCh2YWx1ZSwgY3R4KHJlc29sdmUsIHdyYXBwZXIsIDEpLCBjdHgocmVqZWN0LCB3cmFwcGVyLCAxKSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHJlY29yZC52ID0gdmFsdWU7XHJcbiAgICAgICAgICByZWNvcmQucyA9IDE7XHJcbiAgICAgICAgICBub3RpZnkocmVjb3JkKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2goZXJyKXtcclxuICAgICAgICByZWplY3QuY2FsbCh3cmFwcGVyIHx8IHtyOiByZWNvcmQsIGQ6IGZhbHNlfSwgZXJyKTsgLy8gd3JhcFxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiByZWplY3QodmFsdWUpe1xyXG4gICAgICB2YXIgcmVjb3JkID0gdGhpcztcclxuICAgICAgaWYocmVjb3JkLmQpcmV0dXJuO1xyXG4gICAgICByZWNvcmQuZCA9IHRydWU7XHJcbiAgICAgIHJlY29yZCA9IHJlY29yZC5yIHx8IHJlY29yZDsgLy8gdW53cmFwXHJcbiAgICAgIHJlY29yZC52ID0gdmFsdWU7XHJcbiAgICAgIHJlY29yZC5zID0gMjtcclxuICAgICAgbm90aWZ5KHJlY29yZCwgdHJ1ZSk7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBnZXRDb25zdHJ1Y3RvcihDKXtcclxuICAgICAgdmFyIFMgPSBhc3NlcnRPYmplY3QoQylbU1lNQk9MX1NQRUNJRVNdO1xyXG4gICAgICByZXR1cm4gUyAhPSB1bmRlZmluZWQgPyBTIDogQztcclxuICAgIH1cclxuICAgIC8vIDI1LjQuMy4xIFByb21pc2UoZXhlY3V0b3IpXHJcbiAgICBQcm9taXNlID0gZnVuY3Rpb24oZXhlY3V0b3Ipe1xyXG4gICAgICBhc3NlcnRGdW5jdGlvbihleGVjdXRvcik7XHJcbiAgICAgIGFzc2VydEluc3RhbmNlKHRoaXMsIFByb21pc2UsIFBST01JU0UpO1xyXG4gICAgICB2YXIgcmVjb3JkID0ge1xyXG4gICAgICAgIHA6IHRoaXMsICAgICAgLy8gcHJvbWlzZVxyXG4gICAgICAgIGM6IFtdLCAgICAgICAgLy8gY2hhaW5cclxuICAgICAgICBzOiAwLCAgICAgICAgIC8vIHN0YXRlXHJcbiAgICAgICAgZDogZmFsc2UsICAgICAvLyBkb25lXHJcbiAgICAgICAgdjogdW5kZWZpbmVkLCAvLyB2YWx1ZVxyXG4gICAgICAgIGg6IGZhbHNlICAgICAgLy8gaGFuZGxlZCByZWplY3Rpb25cclxuICAgICAgfTtcclxuICAgICAgaGlkZGVuKHRoaXMsIFJFQ09SRCwgcmVjb3JkKTtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBleGVjdXRvcihjdHgocmVzb2x2ZSwgcmVjb3JkLCAxKSwgY3R4KHJlamVjdCwgcmVjb3JkLCAxKSk7XHJcbiAgICAgIH0gY2F0Y2goZXJyKXtcclxuICAgICAgICByZWplY3QuY2FsbChyZWNvcmQsIGVycik7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGFzc2lnbkhpZGRlbihQcm9taXNlW1BST1RPVFlQRV0sIHtcclxuICAgICAgLy8gMjUuNC41LjMgUHJvbWlzZS5wcm90b3R5cGUudGhlbihvbkZ1bGZpbGxlZCwgb25SZWplY3RlZClcclxuICAgICAgdGhlbjogZnVuY3Rpb24ob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQpe1xyXG4gICAgICAgIHZhciBTID0gYXNzZXJ0T2JqZWN0KGFzc2VydE9iamVjdCh0aGlzKVtDT05TVFJVQ1RPUl0pW1NZTUJPTF9TUEVDSUVTXTtcclxuICAgICAgICB2YXIgcmVhY3QgPSB7XHJcbiAgICAgICAgICBvazogICBpc0Z1bmN0aW9uKG9uRnVsZmlsbGVkKSA/IG9uRnVsZmlsbGVkIDogdHJ1ZSxcclxuICAgICAgICAgIGZhaWw6IGlzRnVuY3Rpb24ob25SZWplY3RlZCkgID8gb25SZWplY3RlZCAgOiBmYWxzZVxyXG4gICAgICAgIH0gLCBQID0gcmVhY3QuUCA9IG5ldyAoUyAhPSB1bmRlZmluZWQgPyBTIDogUHJvbWlzZSkoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcclxuICAgICAgICAgIHJlYWN0LnJlcyA9IGFzc2VydEZ1bmN0aW9uKHJlc29sdmUpO1xyXG4gICAgICAgICAgcmVhY3QucmVqID0gYXNzZXJ0RnVuY3Rpb24ocmVqZWN0KTtcclxuICAgICAgICB9KSwgcmVjb3JkID0gdGhpc1tSRUNPUkRdO1xyXG4gICAgICAgIHJlY29yZC5jLnB1c2gocmVhY3QpO1xyXG4gICAgICAgIHJlY29yZC5zICYmIG5vdGlmeShyZWNvcmQpO1xyXG4gICAgICAgIHJldHVybiBQO1xyXG4gICAgICB9LFxyXG4gICAgICAvLyAyNS40LjUuMSBQcm9taXNlLnByb3RvdHlwZS5jYXRjaChvblJlamVjdGVkKVxyXG4gICAgICAnY2F0Y2gnOiBmdW5jdGlvbihvblJlamVjdGVkKXtcclxuICAgICAgICByZXR1cm4gdGhpcy50aGVuKHVuZGVmaW5lZCwgb25SZWplY3RlZCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgYXNzaWduSGlkZGVuKFByb21pc2UsIHtcclxuICAgICAgLy8gMjUuNC40LjEgUHJvbWlzZS5hbGwoaXRlcmFibGUpXHJcbiAgICAgIGFsbDogZnVuY3Rpb24oaXRlcmFibGUpe1xyXG4gICAgICAgIHZhciBQcm9taXNlID0gZ2V0Q29uc3RydWN0b3IodGhpcylcclxuICAgICAgICAgICwgdmFsdWVzICA9IFtdO1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xyXG4gICAgICAgICAgZm9yT2YoaXRlcmFibGUsIGZhbHNlLCBwdXNoLCB2YWx1ZXMpO1xyXG4gICAgICAgICAgdmFyIHJlbWFpbmluZyA9IHZhbHVlcy5sZW5ndGhcclxuICAgICAgICAgICAgLCByZXN1bHRzICAgPSBBcnJheShyZW1haW5pbmcpO1xyXG4gICAgICAgICAgaWYocmVtYWluaW5nKWZvckVhY2guY2FsbCh2YWx1ZXMsIGZ1bmN0aW9uKHByb21pc2UsIGluZGV4KXtcclxuICAgICAgICAgICAgUHJvbWlzZS5yZXNvbHZlKHByb21pc2UpLnRoZW4oZnVuY3Rpb24odmFsdWUpe1xyXG4gICAgICAgICAgICAgIHJlc3VsdHNbaW5kZXhdID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgLS1yZW1haW5pbmcgfHwgcmVzb2x2ZShyZXN1bHRzKTtcclxuICAgICAgICAgICAgfSwgcmVqZWN0KTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgZWxzZSByZXNvbHZlKHJlc3VsdHMpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9LFxyXG4gICAgICAvLyAyNS40LjQuNCBQcm9taXNlLnJhY2UoaXRlcmFibGUpXHJcbiAgICAgIHJhY2U6IGZ1bmN0aW9uKGl0ZXJhYmxlKXtcclxuICAgICAgICB2YXIgUHJvbWlzZSA9IGdldENvbnN0cnVjdG9yKHRoaXMpO1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xyXG4gICAgICAgICAgZm9yT2YoaXRlcmFibGUsIGZhbHNlLCBmdW5jdGlvbihwcm9taXNlKXtcclxuICAgICAgICAgICAgUHJvbWlzZS5yZXNvbHZlKHByb21pc2UpLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9LFxyXG4gICAgICAvLyAyNS40LjQuNSBQcm9taXNlLnJlamVjdChyKVxyXG4gICAgICByZWplY3Q6IGZ1bmN0aW9uKHIpe1xyXG4gICAgICAgIHJldHVybiBuZXcgKGdldENvbnN0cnVjdG9yKHRoaXMpKShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xyXG4gICAgICAgICAgcmVqZWN0KHIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9LFxyXG4gICAgICAvLyAyNS40LjQuNiBQcm9taXNlLnJlc29sdmUoeClcclxuICAgICAgcmVzb2x2ZTogZnVuY3Rpb24oeCl7XHJcbiAgICAgICAgcmV0dXJuIGlzT2JqZWN0KHgpICYmIFJFQ09SRCBpbiB4ICYmIGdldFByb3RvdHlwZU9mKHgpID09PSB0aGlzW1BST1RPVFlQRV1cclxuICAgICAgICAgID8geCA6IG5ldyAoZ2V0Q29uc3RydWN0b3IodGhpcykpKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCl7XHJcbiAgICAgICAgICAgIHJlc29sdmUoeCk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfShuZXh0VGljayB8fCBzZXRJbW1lZGlhdGUsIHNhZmVTeW1ib2woJ3JlY29yZCcpKTtcclxuICBzZXRUb1N0cmluZ1RhZyhQcm9taXNlLCBQUk9NSVNFKTtcclxuICBzZXRTcGVjaWVzKFByb21pc2UpO1xyXG4gICRkZWZpbmUoR0xPQkFMICsgRk9SQ0VEICogIWlzTmF0aXZlKFByb21pc2UpLCB7UHJvbWlzZTogUHJvbWlzZX0pO1xyXG59KGdsb2JhbFtQUk9NSVNFXSk7XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIE1vZHVsZSA6IGVzNi5jb2xsZWN0aW9ucyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbi8vIEVDTUFTY3JpcHQgNiBjb2xsZWN0aW9ucyBzaGltXHJcbiFmdW5jdGlvbigpe1xyXG4gIHZhciBVSUQgICA9IHNhZmVTeW1ib2woJ3VpZCcpXHJcbiAgICAsIE8xICAgID0gc2FmZVN5bWJvbCgnTzEnKVxyXG4gICAgLCBXRUFLICA9IHNhZmVTeW1ib2woJ3dlYWsnKVxyXG4gICAgLCBMRUFLICA9IHNhZmVTeW1ib2woJ2xlYWsnKVxyXG4gICAgLCBMQVNUICA9IHNhZmVTeW1ib2woJ2xhc3QnKVxyXG4gICAgLCBGSVJTVCA9IHNhZmVTeW1ib2woJ2ZpcnN0JylcclxuICAgICwgU0laRSAgPSBERVNDID8gc2FmZVN5bWJvbCgnc2l6ZScpIDogJ3NpemUnXHJcbiAgICAsIHVpZCAgID0gMFxyXG4gICAgLCB0bXAgICA9IHt9O1xyXG4gIFxyXG4gIGZ1bmN0aW9uIGdldENvbGxlY3Rpb24oQywgTkFNRSwgbWV0aG9kcywgY29tbW9uTWV0aG9kcywgaXNNYXAsIGlzV2Vhayl7XHJcbiAgICB2YXIgQURERVIgPSBpc01hcCA/ICdzZXQnIDogJ2FkZCdcclxuICAgICAgLCBwcm90byA9IEMgJiYgQ1tQUk9UT1RZUEVdXHJcbiAgICAgICwgTyAgICAgPSB7fTtcclxuICAgIGZ1bmN0aW9uIGluaXRGcm9tSXRlcmFibGUodGhhdCwgaXRlcmFibGUpe1xyXG4gICAgICBpZihpdGVyYWJsZSAhPSB1bmRlZmluZWQpZm9yT2YoaXRlcmFibGUsIGlzTWFwLCB0aGF0W0FEREVSXSwgdGhhdCk7XHJcbiAgICAgIHJldHVybiB0aGF0O1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gZml4U1ZaKGtleSwgY2hhaW4pe1xyXG4gICAgICB2YXIgbWV0aG9kID0gcHJvdG9ba2V5XTtcclxuICAgICAgaWYoZnJhbWV3b3JrKXByb3RvW2tleV0gPSBmdW5jdGlvbihhLCBiKXtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gbWV0aG9kLmNhbGwodGhpcywgYSA9PT0gMCA/IDAgOiBhLCBiKTtcclxuICAgICAgICByZXR1cm4gY2hhaW4gPyB0aGlzIDogcmVzdWx0O1xyXG4gICAgICB9O1xyXG4gICAgfVxyXG4gICAgaWYoIWlzTmF0aXZlKEMpIHx8ICEoaXNXZWFrIHx8ICghQlVHR1lfSVRFUkFUT1JTICYmIGhhcyhwcm90bywgRk9SX0VBQ0gpICYmIGhhcyhwcm90bywgJ2VudHJpZXMnKSkpKXtcclxuICAgICAgLy8gY3JlYXRlIGNvbGxlY3Rpb24gY29uc3RydWN0b3JcclxuICAgICAgQyA9IGlzV2Vha1xyXG4gICAgICAgID8gZnVuY3Rpb24oaXRlcmFibGUpe1xyXG4gICAgICAgICAgICBhc3NlcnRJbnN0YW5jZSh0aGlzLCBDLCBOQU1FKTtcclxuICAgICAgICAgICAgc2V0KHRoaXMsIFVJRCwgdWlkKyspO1xyXG4gICAgICAgICAgICBpbml0RnJvbUl0ZXJhYmxlKHRoaXMsIGl0ZXJhYmxlKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICA6IGZ1bmN0aW9uKGl0ZXJhYmxlKXtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgICAgICAgICBhc3NlcnRJbnN0YW5jZSh0aGF0LCBDLCBOQU1FKTtcclxuICAgICAgICAgICAgc2V0KHRoYXQsIE8xLCBjcmVhdGUobnVsbCkpO1xyXG4gICAgICAgICAgICBzZXQodGhhdCwgU0laRSwgMCk7XHJcbiAgICAgICAgICAgIHNldCh0aGF0LCBMQVNULCB1bmRlZmluZWQpO1xyXG4gICAgICAgICAgICBzZXQodGhhdCwgRklSU1QsIHVuZGVmaW5lZCk7XHJcbiAgICAgICAgICAgIGluaXRGcm9tSXRlcmFibGUodGhhdCwgaXRlcmFibGUpO1xyXG4gICAgICAgICAgfTtcclxuICAgICAgYXNzaWduSGlkZGVuKGFzc2lnbkhpZGRlbihDW1BST1RPVFlQRV0sIG1ldGhvZHMpLCBjb21tb25NZXRob2RzKTtcclxuICAgICAgaXNXZWFrIHx8ICFERVNDIHx8IGRlZmluZVByb3BlcnR5KENbUFJPVE9UWVBFXSwgJ3NpemUnLCB7Z2V0OiBmdW5jdGlvbigpe1xyXG4gICAgICAgIHJldHVybiBhc3NlcnREZWZpbmVkKHRoaXNbU0laRV0pO1xyXG4gICAgICB9fSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB2YXIgTmF0aXZlID0gQ1xyXG4gICAgICAgICwgaW5zdCAgID0gbmV3IENcclxuICAgICAgICAsIGNoYWluICA9IGluc3RbQURERVJdKGlzV2VhayA/IHt9IDogLTAsIDEpXHJcbiAgICAgICAgLCBidWdneVplcm87XHJcbiAgICAgIC8vIHdyYXAgdG8gaW5pdCBjb2xsZWN0aW9ucyBmcm9tIGl0ZXJhYmxlXHJcbiAgICAgIGlmKGNoZWNrRGFuZ2VySXRlckNsb3NpbmcoZnVuY3Rpb24oTyl7IG5ldyBDKE8pIH0pKXtcclxuICAgICAgICBDID0gZnVuY3Rpb24oaXRlcmFibGUpe1xyXG4gICAgICAgICAgYXNzZXJ0SW5zdGFuY2UodGhpcywgQywgTkFNRSk7XHJcbiAgICAgICAgICByZXR1cm4gaW5pdEZyb21JdGVyYWJsZShuZXcgTmF0aXZlLCBpdGVyYWJsZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIENbUFJPVE9UWVBFXSA9IHByb3RvO1xyXG4gICAgICAgIGlmKGZyYW1ld29yaylwcm90b1tDT05TVFJVQ1RPUl0gPSBDO1xyXG4gICAgICB9XHJcbiAgICAgIGlzV2VhayB8fCBpbnN0W0ZPUl9FQUNIXShmdW5jdGlvbih2YWwsIGtleSl7XHJcbiAgICAgICAgYnVnZ3laZXJvID0gMSAvIGtleSA9PT0gLUluZmluaXR5O1xyXG4gICAgICB9KTtcclxuICAgICAgLy8gZml4IGNvbnZlcnRpbmcgLTAga2V5IHRvICswXHJcbiAgICAgIGlmKGJ1Z2d5WmVybyl7XHJcbiAgICAgICAgZml4U1ZaKCdkZWxldGUnKTtcclxuICAgICAgICBmaXhTVlooJ2hhcycpO1xyXG4gICAgICAgIGlzTWFwICYmIGZpeFNWWignZ2V0Jyk7XHJcbiAgICAgIH1cclxuICAgICAgLy8gKyBmaXggLmFkZCAmIC5zZXQgZm9yIGNoYWluaW5nXHJcbiAgICAgIGlmKGJ1Z2d5WmVybyB8fCBjaGFpbiAhPT0gaW5zdClmaXhTVlooQURERVIsIHRydWUpO1xyXG4gICAgfVxyXG4gICAgc2V0VG9TdHJpbmdUYWcoQywgTkFNRSk7XHJcbiAgICBzZXRTcGVjaWVzKEMpO1xyXG4gICAgXHJcbiAgICBPW05BTUVdID0gQztcclxuICAgICRkZWZpbmUoR0xPQkFMICsgV1JBUCArIEZPUkNFRCAqICFpc05hdGl2ZShDKSwgTyk7XHJcbiAgICBcclxuICAgIC8vIGFkZCAua2V5cywgLnZhbHVlcywgLmVudHJpZXMsIFtAQGl0ZXJhdG9yXVxyXG4gICAgLy8gMjMuMS4zLjQsIDIzLjEuMy44LCAyMy4xLjMuMTEsIDIzLjEuMy4xMiwgMjMuMi4zLjUsIDIzLjIuMy44LCAyMy4yLjMuMTAsIDIzLjIuMy4xMVxyXG4gICAgaXNXZWFrIHx8IGRlZmluZVN0ZEl0ZXJhdG9ycyhDLCBOQU1FLCBmdW5jdGlvbihpdGVyYXRlZCwga2luZCl7XHJcbiAgICAgIHNldCh0aGlzLCBJVEVSLCB7bzogaXRlcmF0ZWQsIGs6IGtpbmR9KTtcclxuICAgIH0sIGZ1bmN0aW9uKCl7XHJcbiAgICAgIHZhciBpdGVyICA9IHRoaXNbSVRFUl1cclxuICAgICAgICAsIGtpbmQgID0gaXRlci5rXHJcbiAgICAgICAgLCBlbnRyeSA9IGl0ZXIubDtcclxuICAgICAgLy8gcmV2ZXJ0IHRvIHRoZSBsYXN0IGV4aXN0aW5nIGVudHJ5XHJcbiAgICAgIHdoaWxlKGVudHJ5ICYmIGVudHJ5LnIpZW50cnkgPSBlbnRyeS5wO1xyXG4gICAgICAvLyBnZXQgbmV4dCBlbnRyeVxyXG4gICAgICBpZighaXRlci5vIHx8ICEoaXRlci5sID0gZW50cnkgPSBlbnRyeSA/IGVudHJ5Lm4gOiBpdGVyLm9bRklSU1RdKSl7XHJcbiAgICAgICAgLy8gb3IgZmluaXNoIHRoZSBpdGVyYXRpb25cclxuICAgICAgICBpdGVyLm8gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgcmV0dXJuIGl0ZXJSZXN1bHQoMSk7XHJcbiAgICAgIH1cclxuICAgICAgLy8gcmV0dXJuIHN0ZXAgYnkga2luZFxyXG4gICAgICBpZihraW5kID09IEtFWSkgIHJldHVybiBpdGVyUmVzdWx0KDAsIGVudHJ5LmspO1xyXG4gICAgICBpZihraW5kID09IFZBTFVFKXJldHVybiBpdGVyUmVzdWx0KDAsIGVudHJ5LnYpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpdGVyUmVzdWx0KDAsIFtlbnRyeS5rLCBlbnRyeS52XSk7ICAgXHJcbiAgICB9LCBpc01hcCA/IEtFWStWQUxVRSA6IFZBTFVFLCAhaXNNYXApO1xyXG4gICAgXHJcbiAgICByZXR1cm4gQztcclxuICB9XHJcbiAgXHJcbiAgZnVuY3Rpb24gZmFzdEtleShpdCwgY3JlYXRlKXtcclxuICAgIC8vIHJldHVybiBwcmltaXRpdmUgd2l0aCBwcmVmaXhcclxuICAgIGlmKCFpc09iamVjdChpdCkpcmV0dXJuICh0eXBlb2YgaXQgPT0gJ3N0cmluZycgPyAnUycgOiAnUCcpICsgaXQ7XHJcbiAgICAvLyBjYW4ndCBzZXQgaWQgdG8gZnJvemVuIG9iamVjdFxyXG4gICAgaWYoaXNGcm96ZW4oaXQpKXJldHVybiAnRic7XHJcbiAgICBpZighaGFzKGl0LCBVSUQpKXtcclxuICAgICAgLy8gbm90IG5lY2Vzc2FyeSB0byBhZGQgaWRcclxuICAgICAgaWYoIWNyZWF0ZSlyZXR1cm4gJ0UnO1xyXG4gICAgICAvLyBhZGQgbWlzc2luZyBvYmplY3QgaWRcclxuICAgICAgaGlkZGVuKGl0LCBVSUQsICsrdWlkKTtcclxuICAgIC8vIHJldHVybiBvYmplY3QgaWQgd2l0aCBwcmVmaXhcclxuICAgIH0gcmV0dXJuICdPJyArIGl0W1VJRF07XHJcbiAgfVxyXG4gIGZ1bmN0aW9uIGdldEVudHJ5KHRoYXQsIGtleSl7XHJcbiAgICAvLyBmYXN0IGNhc2VcclxuICAgIHZhciBpbmRleCA9IGZhc3RLZXkoa2V5KSwgZW50cnk7XHJcbiAgICBpZihpbmRleCAhPSAnRicpcmV0dXJuIHRoYXRbTzFdW2luZGV4XTtcclxuICAgIC8vIGZyb3plbiBvYmplY3QgY2FzZVxyXG4gICAgZm9yKGVudHJ5ID0gdGhhdFtGSVJTVF07IGVudHJ5OyBlbnRyeSA9IGVudHJ5Lm4pe1xyXG4gICAgICBpZihlbnRyeS5rID09IGtleSlyZXR1cm4gZW50cnk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIGZ1bmN0aW9uIGRlZih0aGF0LCBrZXksIHZhbHVlKXtcclxuICAgIHZhciBlbnRyeSA9IGdldEVudHJ5KHRoYXQsIGtleSlcclxuICAgICAgLCBwcmV2LCBpbmRleDtcclxuICAgIC8vIGNoYW5nZSBleGlzdGluZyBlbnRyeVxyXG4gICAgaWYoZW50cnkpZW50cnkudiA9IHZhbHVlO1xyXG4gICAgLy8gY3JlYXRlIG5ldyBlbnRyeVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHRoYXRbTEFTVF0gPSBlbnRyeSA9IHtcclxuICAgICAgICBpOiBpbmRleCA9IGZhc3RLZXkoa2V5LCB0cnVlKSwgLy8gPC0gaW5kZXhcclxuICAgICAgICBrOiBrZXksICAgICAgICAgICAgICAgICAgICAgICAgLy8gPC0ga2V5XHJcbiAgICAgICAgdjogdmFsdWUsICAgICAgICAgICAgICAgICAgICAgIC8vIDwtIHZhbHVlXHJcbiAgICAgICAgcDogcHJldiA9IHRoYXRbTEFTVF0sICAgICAgICAgIC8vIDwtIHByZXZpb3VzIGVudHJ5XHJcbiAgICAgICAgbjogdW5kZWZpbmVkLCAgICAgICAgICAgICAgICAgIC8vIDwtIG5leHQgZW50cnlcclxuICAgICAgICByOiBmYWxzZSAgICAgICAgICAgICAgICAgICAgICAgLy8gPC0gcmVtb3ZlZFxyXG4gICAgICB9O1xyXG4gICAgICBpZighdGhhdFtGSVJTVF0pdGhhdFtGSVJTVF0gPSBlbnRyeTtcclxuICAgICAgaWYocHJldilwcmV2Lm4gPSBlbnRyeTtcclxuICAgICAgdGhhdFtTSVpFXSsrO1xyXG4gICAgICAvLyBhZGQgdG8gaW5kZXhcclxuICAgICAgaWYoaW5kZXggIT0gJ0YnKXRoYXRbTzFdW2luZGV4XSA9IGVudHJ5O1xyXG4gICAgfSByZXR1cm4gdGhhdDtcclxuICB9XHJcblxyXG4gIHZhciBjb2xsZWN0aW9uTWV0aG9kcyA9IHtcclxuICAgIC8vIDIzLjEuMy4xIE1hcC5wcm90b3R5cGUuY2xlYXIoKVxyXG4gICAgLy8gMjMuMi4zLjIgU2V0LnByb3RvdHlwZS5jbGVhcigpXHJcbiAgICBjbGVhcjogZnVuY3Rpb24oKXtcclxuICAgICAgZm9yKHZhciB0aGF0ID0gdGhpcywgZGF0YSA9IHRoYXRbTzFdLCBlbnRyeSA9IHRoYXRbRklSU1RdOyBlbnRyeTsgZW50cnkgPSBlbnRyeS5uKXtcclxuICAgICAgICBlbnRyeS5yID0gdHJ1ZTtcclxuICAgICAgICBpZihlbnRyeS5wKWVudHJ5LnAgPSBlbnRyeS5wLm4gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgZGVsZXRlIGRhdGFbZW50cnkuaV07XHJcbiAgICAgIH1cclxuICAgICAgdGhhdFtGSVJTVF0gPSB0aGF0W0xBU1RdID0gdW5kZWZpbmVkO1xyXG4gICAgICB0aGF0W1NJWkVdID0gMDtcclxuICAgIH0sXHJcbiAgICAvLyAyMy4xLjMuMyBNYXAucHJvdG90eXBlLmRlbGV0ZShrZXkpXHJcbiAgICAvLyAyMy4yLjMuNCBTZXQucHJvdG90eXBlLmRlbGV0ZSh2YWx1ZSlcclxuICAgICdkZWxldGUnOiBmdW5jdGlvbihrZXkpe1xyXG4gICAgICB2YXIgdGhhdCAgPSB0aGlzXHJcbiAgICAgICAgLCBlbnRyeSA9IGdldEVudHJ5KHRoYXQsIGtleSk7XHJcbiAgICAgIGlmKGVudHJ5KXtcclxuICAgICAgICB2YXIgbmV4dCA9IGVudHJ5Lm5cclxuICAgICAgICAgICwgcHJldiA9IGVudHJ5LnA7XHJcbiAgICAgICAgZGVsZXRlIHRoYXRbTzFdW2VudHJ5LmldO1xyXG4gICAgICAgIGVudHJ5LnIgPSB0cnVlO1xyXG4gICAgICAgIGlmKHByZXYpcHJldi5uID0gbmV4dDtcclxuICAgICAgICBpZihuZXh0KW5leHQucCA9IHByZXY7XHJcbiAgICAgICAgaWYodGhhdFtGSVJTVF0gPT0gZW50cnkpdGhhdFtGSVJTVF0gPSBuZXh0O1xyXG4gICAgICAgIGlmKHRoYXRbTEFTVF0gPT0gZW50cnkpdGhhdFtMQVNUXSA9IHByZXY7XHJcbiAgICAgICAgdGhhdFtTSVpFXS0tO1xyXG4gICAgICB9IHJldHVybiAhIWVudHJ5O1xyXG4gICAgfSxcclxuICAgIC8vIDIzLjIuMy42IFNldC5wcm90b3R5cGUuZm9yRWFjaChjYWxsYmFja2ZuLCB0aGlzQXJnID0gdW5kZWZpbmVkKVxyXG4gICAgLy8gMjMuMS4zLjUgTWFwLnByb3RvdHlwZS5mb3JFYWNoKGNhbGxiYWNrZm4sIHRoaXNBcmcgPSB1bmRlZmluZWQpXHJcbiAgICBmb3JFYWNoOiBmdW5jdGlvbihjYWxsYmFja2ZuIC8qLCB0aGF0ID0gdW5kZWZpbmVkICovKXtcclxuICAgICAgdmFyIGYgPSBjdHgoY2FsbGJhY2tmbiwgYXJndW1lbnRzWzFdLCAzKVxyXG4gICAgICAgICwgZW50cnk7XHJcbiAgICAgIHdoaWxlKGVudHJ5ID0gZW50cnkgPyBlbnRyeS5uIDogdGhpc1tGSVJTVF0pe1xyXG4gICAgICAgIGYoZW50cnkudiwgZW50cnkuaywgdGhpcyk7XHJcbiAgICAgICAgLy8gcmV2ZXJ0IHRvIHRoZSBsYXN0IGV4aXN0aW5nIGVudHJ5XHJcbiAgICAgICAgd2hpbGUoZW50cnkgJiYgZW50cnkucillbnRyeSA9IGVudHJ5LnA7XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyAyMy4xLjMuNyBNYXAucHJvdG90eXBlLmhhcyhrZXkpXHJcbiAgICAvLyAyMy4yLjMuNyBTZXQucHJvdG90eXBlLmhhcyh2YWx1ZSlcclxuICAgIGhhczogZnVuY3Rpb24oa2V5KXtcclxuICAgICAgcmV0dXJuICEhZ2V0RW50cnkodGhpcywga2V5KTtcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgLy8gMjMuMSBNYXAgT2JqZWN0c1xyXG4gIE1hcCA9IGdldENvbGxlY3Rpb24oTWFwLCBNQVAsIHtcclxuICAgIC8vIDIzLjEuMy42IE1hcC5wcm90b3R5cGUuZ2V0KGtleSlcclxuICAgIGdldDogZnVuY3Rpb24oa2V5KXtcclxuICAgICAgdmFyIGVudHJ5ID0gZ2V0RW50cnkodGhpcywga2V5KTtcclxuICAgICAgcmV0dXJuIGVudHJ5ICYmIGVudHJ5LnY7XHJcbiAgICB9LFxyXG4gICAgLy8gMjMuMS4zLjkgTWFwLnByb3RvdHlwZS5zZXQoa2V5LCB2YWx1ZSlcclxuICAgIHNldDogZnVuY3Rpb24oa2V5LCB2YWx1ZSl7XHJcbiAgICAgIHJldHVybiBkZWYodGhpcywga2V5ID09PSAwID8gMCA6IGtleSwgdmFsdWUpO1xyXG4gICAgfVxyXG4gIH0sIGNvbGxlY3Rpb25NZXRob2RzLCB0cnVlKTtcclxuICBcclxuICAvLyAyMy4yIFNldCBPYmplY3RzXHJcbiAgU2V0ID0gZ2V0Q29sbGVjdGlvbihTZXQsIFNFVCwge1xyXG4gICAgLy8gMjMuMi4zLjEgU2V0LnByb3RvdHlwZS5hZGQodmFsdWUpXHJcbiAgICBhZGQ6IGZ1bmN0aW9uKHZhbHVlKXtcclxuICAgICAgcmV0dXJuIGRlZih0aGlzLCB2YWx1ZSA9IHZhbHVlID09PSAwID8gMCA6IHZhbHVlLCB2YWx1ZSk7XHJcbiAgICB9XHJcbiAgfSwgY29sbGVjdGlvbk1ldGhvZHMpO1xyXG4gIFxyXG4gIGZ1bmN0aW9uIGRlZldlYWsodGhhdCwga2V5LCB2YWx1ZSl7XHJcbiAgICBpZihpc0Zyb3plbihhc3NlcnRPYmplY3Qoa2V5KSkpbGVha1N0b3JlKHRoYXQpLnNldChrZXksIHZhbHVlKTtcclxuICAgIGVsc2Uge1xyXG4gICAgICBoYXMoa2V5LCBXRUFLKSB8fCBoaWRkZW4oa2V5LCBXRUFLLCB7fSk7XHJcbiAgICAgIGtleVtXRUFLXVt0aGF0W1VJRF1dID0gdmFsdWU7XHJcbiAgICB9IHJldHVybiB0aGF0O1xyXG4gIH1cclxuICBmdW5jdGlvbiBsZWFrU3RvcmUodGhhdCl7XHJcbiAgICByZXR1cm4gdGhhdFtMRUFLXSB8fCBoaWRkZW4odGhhdCwgTEVBSywgbmV3IE1hcClbTEVBS107XHJcbiAgfVxyXG4gIFxyXG4gIHZhciB3ZWFrTWV0aG9kcyA9IHtcclxuICAgIC8vIDIzLjMuMy4yIFdlYWtNYXAucHJvdG90eXBlLmRlbGV0ZShrZXkpXHJcbiAgICAvLyAyMy40LjMuMyBXZWFrU2V0LnByb3RvdHlwZS5kZWxldGUodmFsdWUpXHJcbiAgICAnZGVsZXRlJzogZnVuY3Rpb24oa2V5KXtcclxuICAgICAgaWYoIWlzT2JqZWN0KGtleSkpcmV0dXJuIGZhbHNlO1xyXG4gICAgICBpZihpc0Zyb3plbihrZXkpKXJldHVybiBsZWFrU3RvcmUodGhpcylbJ2RlbGV0ZSddKGtleSk7XHJcbiAgICAgIHJldHVybiBoYXMoa2V5LCBXRUFLKSAmJiBoYXMoa2V5W1dFQUtdLCB0aGlzW1VJRF0pICYmIGRlbGV0ZSBrZXlbV0VBS11bdGhpc1tVSURdXTtcclxuICAgIH0sXHJcbiAgICAvLyAyMy4zLjMuNCBXZWFrTWFwLnByb3RvdHlwZS5oYXMoa2V5KVxyXG4gICAgLy8gMjMuNC4zLjQgV2Vha1NldC5wcm90b3R5cGUuaGFzKHZhbHVlKVxyXG4gICAgaGFzOiBmdW5jdGlvbihrZXkpe1xyXG4gICAgICBpZighaXNPYmplY3Qoa2V5KSlyZXR1cm4gZmFsc2U7XHJcbiAgICAgIGlmKGlzRnJvemVuKGtleSkpcmV0dXJuIGxlYWtTdG9yZSh0aGlzKS5oYXMoa2V5KTtcclxuICAgICAgcmV0dXJuIGhhcyhrZXksIFdFQUspICYmIGhhcyhrZXlbV0VBS10sIHRoaXNbVUlEXSk7XHJcbiAgICB9XHJcbiAgfTtcclxuICBcclxuICAvLyAyMy4zIFdlYWtNYXAgT2JqZWN0c1xyXG4gIFdlYWtNYXAgPSBnZXRDb2xsZWN0aW9uKFdlYWtNYXAsIFdFQUtNQVAsIHtcclxuICAgIC8vIDIzLjMuMy4zIFdlYWtNYXAucHJvdG90eXBlLmdldChrZXkpXHJcbiAgICBnZXQ6IGZ1bmN0aW9uKGtleSl7XHJcbiAgICAgIGlmKGlzT2JqZWN0KGtleSkpe1xyXG4gICAgICAgIGlmKGlzRnJvemVuKGtleSkpcmV0dXJuIGxlYWtTdG9yZSh0aGlzKS5nZXQoa2V5KTtcclxuICAgICAgICBpZihoYXMoa2V5LCBXRUFLKSlyZXR1cm4ga2V5W1dFQUtdW3RoaXNbVUlEXV07XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyAyMy4zLjMuNSBXZWFrTWFwLnByb3RvdHlwZS5zZXQoa2V5LCB2YWx1ZSlcclxuICAgIHNldDogZnVuY3Rpb24oa2V5LCB2YWx1ZSl7XHJcbiAgICAgIHJldHVybiBkZWZXZWFrKHRoaXMsIGtleSwgdmFsdWUpO1xyXG4gICAgfVxyXG4gIH0sIHdlYWtNZXRob2RzLCB0cnVlLCB0cnVlKTtcclxuICBcclxuICAvLyBJRTExIFdlYWtNYXAgZnJvemVuIGtleXMgZml4XHJcbiAgaWYoZnJhbWV3b3JrICYmIG5ldyBXZWFrTWFwKCkuc2V0KE9iamVjdC5mcmVlemUodG1wKSwgNykuZ2V0KHRtcCkgIT0gNyl7XHJcbiAgICBmb3JFYWNoLmNhbGwoYXJyYXkoJ2RlbGV0ZSxoYXMsZ2V0LHNldCcpLCBmdW5jdGlvbihrZXkpe1xyXG4gICAgICB2YXIgbWV0aG9kID0gV2Vha01hcFtQUk9UT1RZUEVdW2tleV07XHJcbiAgICAgIFdlYWtNYXBbUFJPVE9UWVBFXVtrZXldID0gZnVuY3Rpb24oYSwgYil7XHJcbiAgICAgICAgLy8gc3RvcmUgZnJvemVuIG9iamVjdHMgb24gbGVha3kgbWFwXHJcbiAgICAgICAgaWYoaXNPYmplY3QoYSkgJiYgaXNGcm96ZW4oYSkpe1xyXG4gICAgICAgICAgdmFyIHJlc3VsdCA9IGxlYWtTdG9yZSh0aGlzKVtrZXldKGEsIGIpO1xyXG4gICAgICAgICAgcmV0dXJuIGtleSA9PSAnc2V0JyA/IHRoaXMgOiByZXN1bHQ7XHJcbiAgICAgICAgLy8gc3RvcmUgYWxsIHRoZSByZXN0IG9uIG5hdGl2ZSB3ZWFrbWFwXHJcbiAgICAgICAgfSByZXR1cm4gbWV0aG9kLmNhbGwodGhpcywgYSwgYik7XHJcbiAgICAgIH07XHJcbiAgICB9KTtcclxuICB9XHJcbiAgXHJcbiAgLy8gMjMuNCBXZWFrU2V0IE9iamVjdHNcclxuICBXZWFrU2V0ID0gZ2V0Q29sbGVjdGlvbihXZWFrU2V0LCBXRUFLU0VULCB7XHJcbiAgICAvLyAyMy40LjMuMSBXZWFrU2V0LnByb3RvdHlwZS5hZGQodmFsdWUpXHJcbiAgICBhZGQ6IGZ1bmN0aW9uKHZhbHVlKXtcclxuICAgICAgcmV0dXJuIGRlZldlYWsodGhpcywgdmFsdWUsIHRydWUpO1xyXG4gICAgfVxyXG4gIH0sIHdlYWtNZXRob2RzLCBmYWxzZSwgdHJ1ZSk7XHJcbn0oKTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogTW9kdWxlIDogZXM2LnJlZmxlY3QgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuIWZ1bmN0aW9uKCl7XHJcbiAgZnVuY3Rpb24gRW51bWVyYXRlKGl0ZXJhdGVkKXtcclxuICAgIHZhciBrZXlzID0gW10sIGtleTtcclxuICAgIGZvcihrZXkgaW4gaXRlcmF0ZWQpa2V5cy5wdXNoKGtleSk7XHJcbiAgICBzZXQodGhpcywgSVRFUiwge286IGl0ZXJhdGVkLCBhOiBrZXlzLCBpOiAwfSk7XHJcbiAgfVxyXG4gIGNyZWF0ZUl0ZXJhdG9yKEVudW1lcmF0ZSwgT0JKRUNULCBmdW5jdGlvbigpe1xyXG4gICAgdmFyIGl0ZXIgPSB0aGlzW0lURVJdXHJcbiAgICAgICwga2V5cyA9IGl0ZXIuYVxyXG4gICAgICAsIGtleTtcclxuICAgIGRvIHtcclxuICAgICAgaWYoaXRlci5pID49IGtleXMubGVuZ3RoKXJldHVybiBpdGVyUmVzdWx0KDEpO1xyXG4gICAgfSB3aGlsZSghKChrZXkgPSBrZXlzW2l0ZXIuaSsrXSkgaW4gaXRlci5vKSk7XHJcbiAgICByZXR1cm4gaXRlclJlc3VsdCgwLCBrZXkpO1xyXG4gIH0pO1xyXG4gIFxyXG4gIGZ1bmN0aW9uIHdyYXAoZm4pe1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKGl0KXtcclxuICAgICAgYXNzZXJ0T2JqZWN0KGl0KTtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICByZXR1cm4gZm4uYXBwbHkodW5kZWZpbmVkLCBhcmd1bWVudHMpLCB0cnVlO1xyXG4gICAgICB9IGNhdGNoKGUpe1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICBmdW5jdGlvbiByZWZsZWN0R2V0KHRhcmdldCwgcHJvcGVydHlLZXkvKiwgcmVjZWl2ZXIqLyl7XHJcbiAgICB2YXIgcmVjZWl2ZXIgPSBhcmd1bWVudHMubGVuZ3RoIDwgMyA/IHRhcmdldCA6IGFyZ3VtZW50c1syXVxyXG4gICAgICAsIGRlc2MgPSBnZXRPd25EZXNjcmlwdG9yKGFzc2VydE9iamVjdCh0YXJnZXQpLCBwcm9wZXJ0eUtleSksIHByb3RvO1xyXG4gICAgaWYoZGVzYylyZXR1cm4gaGFzKGRlc2MsICd2YWx1ZScpXHJcbiAgICAgID8gZGVzYy52YWx1ZVxyXG4gICAgICA6IGRlc2MuZ2V0ID09PSB1bmRlZmluZWRcclxuICAgICAgICA/IHVuZGVmaW5lZFxyXG4gICAgICAgIDogZGVzYy5nZXQuY2FsbChyZWNlaXZlcik7XHJcbiAgICByZXR1cm4gaXNPYmplY3QocHJvdG8gPSBnZXRQcm90b3R5cGVPZih0YXJnZXQpKVxyXG4gICAgICA/IHJlZmxlY3RHZXQocHJvdG8sIHByb3BlcnR5S2V5LCByZWNlaXZlcilcclxuICAgICAgOiB1bmRlZmluZWQ7XHJcbiAgfVxyXG4gIGZ1bmN0aW9uIHJlZmxlY3RTZXQodGFyZ2V0LCBwcm9wZXJ0eUtleSwgVi8qLCByZWNlaXZlciovKXtcclxuICAgIHZhciByZWNlaXZlciA9IGFyZ3VtZW50cy5sZW5ndGggPCA0ID8gdGFyZ2V0IDogYXJndW1lbnRzWzNdXHJcbiAgICAgICwgb3duRGVzYyAgPSBnZXRPd25EZXNjcmlwdG9yKGFzc2VydE9iamVjdCh0YXJnZXQpLCBwcm9wZXJ0eUtleSlcclxuICAgICAgLCBleGlzdGluZ0Rlc2NyaXB0b3IsIHByb3RvO1xyXG4gICAgaWYoIW93bkRlc2Mpe1xyXG4gICAgICBpZihpc09iamVjdChwcm90byA9IGdldFByb3RvdHlwZU9mKHRhcmdldCkpKXtcclxuICAgICAgICByZXR1cm4gcmVmbGVjdFNldChwcm90bywgcHJvcGVydHlLZXksIFYsIHJlY2VpdmVyKTtcclxuICAgICAgfVxyXG4gICAgICBvd25EZXNjID0gZGVzY3JpcHRvcigwKTtcclxuICAgIH1cclxuICAgIGlmKGhhcyhvd25EZXNjLCAndmFsdWUnKSl7XHJcbiAgICAgIGlmKG93bkRlc2Mud3JpdGFibGUgPT09IGZhbHNlIHx8ICFpc09iamVjdChyZWNlaXZlcikpcmV0dXJuIGZhbHNlO1xyXG4gICAgICBleGlzdGluZ0Rlc2NyaXB0b3IgPSBnZXRPd25EZXNjcmlwdG9yKHJlY2VpdmVyLCBwcm9wZXJ0eUtleSkgfHwgZGVzY3JpcHRvcigwKTtcclxuICAgICAgZXhpc3RpbmdEZXNjcmlwdG9yLnZhbHVlID0gVjtcclxuICAgICAgcmV0dXJuIGRlZmluZVByb3BlcnR5KHJlY2VpdmVyLCBwcm9wZXJ0eUtleSwgZXhpc3RpbmdEZXNjcmlwdG9yKSwgdHJ1ZTtcclxuICAgIH1cclxuICAgIHJldHVybiBvd25EZXNjLnNldCA9PT0gdW5kZWZpbmVkXHJcbiAgICAgID8gZmFsc2VcclxuICAgICAgOiAob3duRGVzYy5zZXQuY2FsbChyZWNlaXZlciwgViksIHRydWUpO1xyXG4gIH1cclxuICB2YXIgaXNFeHRlbnNpYmxlID0gT2JqZWN0LmlzRXh0ZW5zaWJsZSB8fCByZXR1cm5JdDtcclxuICBcclxuICB2YXIgcmVmbGVjdCA9IHtcclxuICAgIC8vIDI2LjEuMSBSZWZsZWN0LmFwcGx5KHRhcmdldCwgdGhpc0FyZ3VtZW50LCBhcmd1bWVudHNMaXN0KVxyXG4gICAgYXBwbHk6IGN0eChjYWxsLCBhcHBseSwgMyksXHJcbiAgICAvLyAyNi4xLjIgUmVmbGVjdC5jb25zdHJ1Y3QodGFyZ2V0LCBhcmd1bWVudHNMaXN0IFssIG5ld1RhcmdldF0pXHJcbiAgICBjb25zdHJ1Y3Q6IGZ1bmN0aW9uKHRhcmdldCwgYXJndW1lbnRzTGlzdCAvKiwgbmV3VGFyZ2V0Ki8pe1xyXG4gICAgICB2YXIgcHJvdG8gICAgPSBhc3NlcnRGdW5jdGlvbihhcmd1bWVudHMubGVuZ3RoIDwgMyA/IHRhcmdldCA6IGFyZ3VtZW50c1syXSlbUFJPVE9UWVBFXVxyXG4gICAgICAgICwgaW5zdGFuY2UgPSBjcmVhdGUoaXNPYmplY3QocHJvdG8pID8gcHJvdG8gOiBPYmplY3RQcm90bylcclxuICAgICAgICAsIHJlc3VsdCAgID0gYXBwbHkuY2FsbCh0YXJnZXQsIGluc3RhbmNlLCBhcmd1bWVudHNMaXN0KTtcclxuICAgICAgcmV0dXJuIGlzT2JqZWN0KHJlc3VsdCkgPyByZXN1bHQgOiBpbnN0YW5jZTtcclxuICAgIH0sXHJcbiAgICAvLyAyNi4xLjMgUmVmbGVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIHByb3BlcnR5S2V5LCBhdHRyaWJ1dGVzKVxyXG4gICAgZGVmaW5lUHJvcGVydHk6IHdyYXAoZGVmaW5lUHJvcGVydHkpLFxyXG4gICAgLy8gMjYuMS40IFJlZmxlY3QuZGVsZXRlUHJvcGVydHkodGFyZ2V0LCBwcm9wZXJ0eUtleSlcclxuICAgIGRlbGV0ZVByb3BlcnR5OiBmdW5jdGlvbih0YXJnZXQsIHByb3BlcnR5S2V5KXtcclxuICAgICAgdmFyIGRlc2MgPSBnZXRPd25EZXNjcmlwdG9yKGFzc2VydE9iamVjdCh0YXJnZXQpLCBwcm9wZXJ0eUtleSk7XHJcbiAgICAgIHJldHVybiBkZXNjICYmICFkZXNjLmNvbmZpZ3VyYWJsZSA/IGZhbHNlIDogZGVsZXRlIHRhcmdldFtwcm9wZXJ0eUtleV07XHJcbiAgICB9LFxyXG4gICAgLy8gMjYuMS41IFJlZmxlY3QuZW51bWVyYXRlKHRhcmdldClcclxuICAgIGVudW1lcmF0ZTogZnVuY3Rpb24odGFyZ2V0KXtcclxuICAgICAgcmV0dXJuIG5ldyBFbnVtZXJhdGUoYXNzZXJ0T2JqZWN0KHRhcmdldCkpO1xyXG4gICAgfSxcclxuICAgIC8vIDI2LjEuNiBSZWZsZWN0LmdldCh0YXJnZXQsIHByb3BlcnR5S2V5IFssIHJlY2VpdmVyXSlcclxuICAgIGdldDogcmVmbGVjdEdldCxcclxuICAgIC8vIDI2LjEuNyBSZWZsZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIHByb3BlcnR5S2V5KVxyXG4gICAgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yOiBmdW5jdGlvbih0YXJnZXQsIHByb3BlcnR5S2V5KXtcclxuICAgICAgcmV0dXJuIGdldE93bkRlc2NyaXB0b3IoYXNzZXJ0T2JqZWN0KHRhcmdldCksIHByb3BlcnR5S2V5KTtcclxuICAgIH0sXHJcbiAgICAvLyAyNi4xLjggUmVmbGVjdC5nZXRQcm90b3R5cGVPZih0YXJnZXQpXHJcbiAgICBnZXRQcm90b3R5cGVPZjogZnVuY3Rpb24odGFyZ2V0KXtcclxuICAgICAgcmV0dXJuIGdldFByb3RvdHlwZU9mKGFzc2VydE9iamVjdCh0YXJnZXQpKTtcclxuICAgIH0sXHJcbiAgICAvLyAyNi4xLjkgUmVmbGVjdC5oYXModGFyZ2V0LCBwcm9wZXJ0eUtleSlcclxuICAgIGhhczogZnVuY3Rpb24odGFyZ2V0LCBwcm9wZXJ0eUtleSl7XHJcbiAgICAgIHJldHVybiBwcm9wZXJ0eUtleSBpbiB0YXJnZXQ7XHJcbiAgICB9LFxyXG4gICAgLy8gMjYuMS4xMCBSZWZsZWN0LmlzRXh0ZW5zaWJsZSh0YXJnZXQpXHJcbiAgICBpc0V4dGVuc2libGU6IGZ1bmN0aW9uKHRhcmdldCl7XHJcbiAgICAgIHJldHVybiAhIWlzRXh0ZW5zaWJsZShhc3NlcnRPYmplY3QodGFyZ2V0KSk7XHJcbiAgICB9LFxyXG4gICAgLy8gMjYuMS4xMSBSZWZsZWN0Lm93bktleXModGFyZ2V0KVxyXG4gICAgb3duS2V5czogb3duS2V5cyxcclxuICAgIC8vIDI2LjEuMTIgUmVmbGVjdC5wcmV2ZW50RXh0ZW5zaW9ucyh0YXJnZXQpXHJcbiAgICBwcmV2ZW50RXh0ZW5zaW9uczogd3JhcChPYmplY3QucHJldmVudEV4dGVuc2lvbnMgfHwgcmV0dXJuSXQpLFxyXG4gICAgLy8gMjYuMS4xMyBSZWZsZWN0LnNldCh0YXJnZXQsIHByb3BlcnR5S2V5LCBWIFssIHJlY2VpdmVyXSlcclxuICAgIHNldDogcmVmbGVjdFNldFxyXG4gIH1cclxuICAvLyAyNi4xLjE0IFJlZmxlY3Quc2V0UHJvdG90eXBlT2YodGFyZ2V0LCBwcm90bylcclxuICBpZihzZXRQcm90b3R5cGVPZilyZWZsZWN0LnNldFByb3RvdHlwZU9mID0gZnVuY3Rpb24odGFyZ2V0LCBwcm90byl7XHJcbiAgICByZXR1cm4gc2V0UHJvdG90eXBlT2YoYXNzZXJ0T2JqZWN0KHRhcmdldCksIHByb3RvKSwgdHJ1ZTtcclxuICB9O1xyXG4gIFxyXG4gICRkZWZpbmUoR0xPQkFMLCB7UmVmbGVjdDoge319KTtcclxuICAkZGVmaW5lKFNUQVRJQywgJ1JlZmxlY3QnLCByZWZsZWN0KTtcclxufSgpO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBNb2R1bGUgOiBlczcucHJvcG9zYWxzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4hZnVuY3Rpb24oKXtcclxuICAkZGVmaW5lKFBST1RPLCBBUlJBWSwge1xyXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2RvbWVuaWMvQXJyYXkucHJvdG90eXBlLmluY2x1ZGVzXHJcbiAgICBpbmNsdWRlczogY3JlYXRlQXJyYXlDb250YWlucyh0cnVlKVxyXG4gIH0pO1xyXG4gICRkZWZpbmUoUFJPVE8sIFNUUklORywge1xyXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL21hdGhpYXNieW5lbnMvU3RyaW5nLnByb3RvdHlwZS5hdFxyXG4gICAgYXQ6IGNyZWF0ZVBvaW50QXQodHJ1ZSlcclxuICB9KTtcclxuICBcclxuICBmdW5jdGlvbiBjcmVhdGVPYmplY3RUb0FycmF5KGlzRW50cmllcyl7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24ob2JqZWN0KXtcclxuICAgICAgdmFyIE8gICAgICA9IHRvT2JqZWN0KG9iamVjdClcclxuICAgICAgICAsIGtleXMgICA9IGdldEtleXMob2JqZWN0KVxyXG4gICAgICAgICwgbGVuZ3RoID0ga2V5cy5sZW5ndGhcclxuICAgICAgICAsIGkgICAgICA9IDBcclxuICAgICAgICAsIHJlc3VsdCA9IEFycmF5KGxlbmd0aClcclxuICAgICAgICAsIGtleTtcclxuICAgICAgaWYoaXNFbnRyaWVzKXdoaWxlKGxlbmd0aCA+IGkpcmVzdWx0W2ldID0gW2tleSA9IGtleXNbaSsrXSwgT1trZXldXTtcclxuICAgICAgZWxzZSB3aGlsZShsZW5ndGggPiBpKXJlc3VsdFtpXSA9IE9ba2V5c1tpKytdXTtcclxuICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuICB9XHJcbiAgJGRlZmluZShTVEFUSUMsIE9CSkVDVCwge1xyXG4gICAgLy8gaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vV2ViUmVmbGVjdGlvbi85MzUzNzgxXHJcbiAgICBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzOiBmdW5jdGlvbihvYmplY3Qpe1xyXG4gICAgICB2YXIgTyAgICAgID0gdG9PYmplY3Qob2JqZWN0KVxyXG4gICAgICAgICwgcmVzdWx0ID0ge307XHJcbiAgICAgIGZvckVhY2guY2FsbChvd25LZXlzKE8pLCBmdW5jdGlvbihrZXkpe1xyXG4gICAgICAgIGRlZmluZVByb3BlcnR5KHJlc3VsdCwga2V5LCBkZXNjcmlwdG9yKDAsIGdldE93bkRlc2NyaXB0b3IoTywga2V5KSkpO1xyXG4gICAgICB9KTtcclxuICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH0sXHJcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vcndhbGRyb24vdGMzOS1ub3Rlcy9ibG9iL21hc3Rlci9lczYvMjAxNC0wNC9hcHItOS5tZCM1MS1vYmplY3RlbnRyaWVzLW9iamVjdHZhbHVlc1xyXG4gICAgdmFsdWVzOiAgY3JlYXRlT2JqZWN0VG9BcnJheShmYWxzZSksXHJcbiAgICBlbnRyaWVzOiBjcmVhdGVPYmplY3RUb0FycmF5KHRydWUpXHJcbiAgfSk7XHJcbiAgJGRlZmluZShTVEFUSUMsIFJFR0VYUCwge1xyXG4gICAgLy8gaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20va2FuZ2F4Lzk2OTgxMDBcclxuICAgIGVzY2FwZTogY3JlYXRlUmVwbGFjZXIoLyhbXFxcXFxcLVtcXF17fSgpKis/LixeJHxdKS9nLCAnXFxcXCQxJywgdHJ1ZSlcclxuICB9KTtcclxufSgpO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBNb2R1bGUgOiBlczcuYWJzdHJhY3QtcmVmcyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4vLyBodHRwczovL2dpdGh1Yi5jb20vemVucGFyc2luZy9lcy1hYnN0cmFjdC1yZWZzXHJcbiFmdW5jdGlvbihSRUZFUkVOQ0Upe1xyXG4gIFJFRkVSRU5DRV9HRVQgPSBnZXRXZWxsS25vd25TeW1ib2woUkVGRVJFTkNFKydHZXQnLCB0cnVlKTtcclxuICB2YXIgUkVGRVJFTkNFX1NFVCA9IGdldFdlbGxLbm93blN5bWJvbChSRUZFUkVOQ0UrU0VULCB0cnVlKVxyXG4gICAgLCBSRUZFUkVOQ0VfREVMRVRFID0gZ2V0V2VsbEtub3duU3ltYm9sKFJFRkVSRU5DRSsnRGVsZXRlJywgdHJ1ZSk7XHJcbiAgXHJcbiAgJGRlZmluZShTVEFUSUMsIFNZTUJPTCwge1xyXG4gICAgcmVmZXJlbmNlR2V0OiBSRUZFUkVOQ0VfR0VULFxyXG4gICAgcmVmZXJlbmNlU2V0OiBSRUZFUkVOQ0VfU0VULFxyXG4gICAgcmVmZXJlbmNlRGVsZXRlOiBSRUZFUkVOQ0VfREVMRVRFXHJcbiAgfSk7XHJcbiAgXHJcbiAgaGlkZGVuKEZ1bmN0aW9uUHJvdG8sIFJFRkVSRU5DRV9HRVQsIHJldHVyblRoaXMpO1xyXG4gIFxyXG4gIGZ1bmN0aW9uIHNldE1hcE1ldGhvZHMoQ29uc3RydWN0b3Ipe1xyXG4gICAgaWYoQ29uc3RydWN0b3Ipe1xyXG4gICAgICB2YXIgTWFwUHJvdG8gPSBDb25zdHJ1Y3RvcltQUk9UT1RZUEVdO1xyXG4gICAgICBoaWRkZW4oTWFwUHJvdG8sIFJFRkVSRU5DRV9HRVQsIE1hcFByb3RvLmdldCk7XHJcbiAgICAgIGhpZGRlbihNYXBQcm90bywgUkVGRVJFTkNFX1NFVCwgTWFwUHJvdG8uc2V0KTtcclxuICAgICAgaGlkZGVuKE1hcFByb3RvLCBSRUZFUkVOQ0VfREVMRVRFLCBNYXBQcm90b1snZGVsZXRlJ10pO1xyXG4gICAgfVxyXG4gIH1cclxuICBzZXRNYXBNZXRob2RzKE1hcCk7XHJcbiAgc2V0TWFwTWV0aG9kcyhXZWFrTWFwKTtcclxufSgncmVmZXJlbmNlJyk7XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIE1vZHVsZSA6IGNvcmUuZGljdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiFmdW5jdGlvbihESUNUKXtcclxuICBEaWN0ID0gZnVuY3Rpb24oaXRlcmFibGUpe1xyXG4gICAgdmFyIGRpY3QgPSBjcmVhdGUobnVsbCk7XHJcbiAgICBpZihpdGVyYWJsZSAhPSB1bmRlZmluZWQpe1xyXG4gICAgICBpZihpc0l0ZXJhYmxlKGl0ZXJhYmxlKSl7XHJcbiAgICAgICAgZm9yT2YoaXRlcmFibGUsIHRydWUsIGZ1bmN0aW9uKGtleSwgdmFsdWUpe1xyXG4gICAgICAgICAgZGljdFtrZXldID0gdmFsdWU7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0gZWxzZSBhc3NpZ24oZGljdCwgaXRlcmFibGUpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGRpY3Q7XHJcbiAgfVxyXG4gIERpY3RbUFJPVE9UWVBFXSA9IG51bGw7XHJcbiAgXHJcbiAgZnVuY3Rpb24gRGljdEl0ZXJhdG9yKGl0ZXJhdGVkLCBraW5kKXtcclxuICAgIHNldCh0aGlzLCBJVEVSLCB7bzogdG9PYmplY3QoaXRlcmF0ZWQpLCBhOiBnZXRLZXlzKGl0ZXJhdGVkKSwgaTogMCwgazoga2luZH0pO1xyXG4gIH1cclxuICBjcmVhdGVJdGVyYXRvcihEaWN0SXRlcmF0b3IsIERJQ1QsIGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgaXRlciA9IHRoaXNbSVRFUl1cclxuICAgICAgLCBPICAgID0gaXRlci5vXHJcbiAgICAgICwga2V5cyA9IGl0ZXIuYVxyXG4gICAgICAsIGtpbmQgPSBpdGVyLmtcclxuICAgICAgLCBrZXk7XHJcbiAgICBkbyB7XHJcbiAgICAgIGlmKGl0ZXIuaSA+PSBrZXlzLmxlbmd0aCl7XHJcbiAgICAgICAgaXRlci5vID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIHJldHVybiBpdGVyUmVzdWx0KDEpO1xyXG4gICAgICB9XHJcbiAgICB9IHdoaWxlKCFoYXMoTywga2V5ID0ga2V5c1tpdGVyLmkrK10pKTtcclxuICAgIGlmKGtpbmQgPT0gS0VZKSAgcmV0dXJuIGl0ZXJSZXN1bHQoMCwga2V5KTtcclxuICAgIGlmKGtpbmQgPT0gVkFMVUUpcmV0dXJuIGl0ZXJSZXN1bHQoMCwgT1trZXldKTtcclxuICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGl0ZXJSZXN1bHQoMCwgW2tleSwgT1trZXldXSk7XHJcbiAgfSk7XHJcbiAgZnVuY3Rpb24gY3JlYXRlRGljdEl0ZXIoa2luZCl7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24oaXQpe1xyXG4gICAgICByZXR1cm4gbmV3IERpY3RJdGVyYXRvcihpdCwga2luZCk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIC8qXHJcbiAgICogMCAtPiBmb3JFYWNoXHJcbiAgICogMSAtPiBtYXBcclxuICAgKiAyIC0+IGZpbHRlclxyXG4gICAqIDMgLT4gc29tZVxyXG4gICAqIDQgLT4gZXZlcnlcclxuICAgKiA1IC0+IGZpbmRcclxuICAgKiA2IC0+IGZpbmRLZXlcclxuICAgKiA3IC0+IG1hcFBhaXJzXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gY3JlYXRlRGljdE1ldGhvZCh0eXBlKXtcclxuICAgIHZhciBpc01hcCAgICA9IHR5cGUgPT0gMVxyXG4gICAgICAsIGlzRXZlcnkgID0gdHlwZSA9PSA0O1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iamVjdCwgY2FsbGJhY2tmbiwgdGhhdCAvKiA9IHVuZGVmaW5lZCAqLyl7XHJcbiAgICAgIHZhciBmICAgICAgPSBjdHgoY2FsbGJhY2tmbiwgdGhhdCwgMylcclxuICAgICAgICAsIE8gICAgICA9IHRvT2JqZWN0KG9iamVjdClcclxuICAgICAgICAsIHJlc3VsdCA9IGlzTWFwIHx8IHR5cGUgPT0gNyB8fCB0eXBlID09IDIgPyBuZXcgKGdlbmVyaWModGhpcywgRGljdCkpIDogdW5kZWZpbmVkXHJcbiAgICAgICAgLCBrZXksIHZhbCwgcmVzO1xyXG4gICAgICBmb3Ioa2V5IGluIE8paWYoaGFzKE8sIGtleSkpe1xyXG4gICAgICAgIHZhbCA9IE9ba2V5XTtcclxuICAgICAgICByZXMgPSBmKHZhbCwga2V5LCBvYmplY3QpO1xyXG4gICAgICAgIGlmKHR5cGUpe1xyXG4gICAgICAgICAgaWYoaXNNYXApcmVzdWx0W2tleV0gPSByZXM7ICAgICAgICAgICAgIC8vIG1hcFxyXG4gICAgICAgICAgZWxzZSBpZihyZXMpc3dpdGNoKHR5cGUpe1xyXG4gICAgICAgICAgICBjYXNlIDI6IHJlc3VsdFtrZXldID0gdmFsOyBicmVhayAgICAgIC8vIGZpbHRlclxyXG4gICAgICAgICAgICBjYXNlIDM6IHJldHVybiB0cnVlOyAgICAgICAgICAgICAgICAgIC8vIHNvbWVcclxuICAgICAgICAgICAgY2FzZSA1OiByZXR1cm4gdmFsOyAgICAgICAgICAgICAgICAgICAvLyBmaW5kXHJcbiAgICAgICAgICAgIGNhc2UgNjogcmV0dXJuIGtleTsgICAgICAgICAgICAgICAgICAgLy8gZmluZEtleVxyXG4gICAgICAgICAgICBjYXNlIDc6IHJlc3VsdFtyZXNbMF1dID0gcmVzWzFdOyAgICAgIC8vIG1hcFBhaXJzXHJcbiAgICAgICAgICB9IGVsc2UgaWYoaXNFdmVyeSlyZXR1cm4gZmFsc2U7ICAgICAgICAgLy8gZXZlcnlcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHR5cGUgPT0gMyB8fCBpc0V2ZXJ5ID8gaXNFdmVyeSA6IHJlc3VsdDtcclxuICAgIH1cclxuICB9XHJcbiAgZnVuY3Rpb24gY3JlYXRlRGljdFJlZHVjZShpc1R1cm4pe1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iamVjdCwgbWFwZm4sIGluaXQpe1xyXG4gICAgICBhc3NlcnRGdW5jdGlvbihtYXBmbik7XHJcbiAgICAgIHZhciBPICAgICAgPSB0b09iamVjdChvYmplY3QpXHJcbiAgICAgICAgLCBrZXlzICAgPSBnZXRLZXlzKE8pXHJcbiAgICAgICAgLCBsZW5ndGggPSBrZXlzLmxlbmd0aFxyXG4gICAgICAgICwgaSAgICAgID0gMFxyXG4gICAgICAgICwgbWVtbywga2V5LCByZXN1bHQ7XHJcbiAgICAgIGlmKGlzVHVybiltZW1vID0gaW5pdCA9PSB1bmRlZmluZWQgPyBuZXcgKGdlbmVyaWModGhpcywgRGljdCkpIDogT2JqZWN0KGluaXQpO1xyXG4gICAgICBlbHNlIGlmKGFyZ3VtZW50cy5sZW5ndGggPCAzKXtcclxuICAgICAgICBhc3NlcnQobGVuZ3RoLCBSRURVQ0VfRVJST1IpO1xyXG4gICAgICAgIG1lbW8gPSBPW2tleXNbaSsrXV07XHJcbiAgICAgIH0gZWxzZSBtZW1vID0gT2JqZWN0KGluaXQpO1xyXG4gICAgICB3aGlsZShsZW5ndGggPiBpKWlmKGhhcyhPLCBrZXkgPSBrZXlzW2krK10pKXtcclxuICAgICAgICByZXN1bHQgPSBtYXBmbihtZW1vLCBPW2tleV0sIGtleSwgb2JqZWN0KTtcclxuICAgICAgICBpZihpc1R1cm4pe1xyXG4gICAgICAgICAgaWYocmVzdWx0ID09PSBmYWxzZSlicmVhaztcclxuICAgICAgICB9IGVsc2UgbWVtbyA9IHJlc3VsdDtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gbWVtbztcclxuICAgIH1cclxuICB9XHJcbiAgdmFyIGZpbmRLZXkgPSBjcmVhdGVEaWN0TWV0aG9kKDYpO1xyXG4gIGZ1bmN0aW9uIGluY2x1ZGVzKG9iamVjdCwgZWwpe1xyXG4gICAgcmV0dXJuIChlbCA9PSBlbCA/IGtleU9mKG9iamVjdCwgZWwpIDogZmluZEtleShvYmplY3QsIHNhbWVOYU4pKSAhPT0gdW5kZWZpbmVkO1xyXG4gIH1cclxuICBcclxuICB2YXIgZGljdE1ldGhvZHMgPSB7XHJcbiAgICBrZXlzOiAgICBjcmVhdGVEaWN0SXRlcihLRVkpLFxyXG4gICAgdmFsdWVzOiAgY3JlYXRlRGljdEl0ZXIoVkFMVUUpLFxyXG4gICAgZW50cmllczogY3JlYXRlRGljdEl0ZXIoS0VZK1ZBTFVFKSxcclxuICAgIGZvckVhY2g6IGNyZWF0ZURpY3RNZXRob2QoMCksXHJcbiAgICBtYXA6ICAgICBjcmVhdGVEaWN0TWV0aG9kKDEpLFxyXG4gICAgZmlsdGVyOiAgY3JlYXRlRGljdE1ldGhvZCgyKSxcclxuICAgIHNvbWU6ICAgIGNyZWF0ZURpY3RNZXRob2QoMyksXHJcbiAgICBldmVyeTogICBjcmVhdGVEaWN0TWV0aG9kKDQpLFxyXG4gICAgZmluZDogICAgY3JlYXRlRGljdE1ldGhvZCg1KSxcclxuICAgIGZpbmRLZXk6IGZpbmRLZXksXHJcbiAgICBtYXBQYWlyczpjcmVhdGVEaWN0TWV0aG9kKDcpLFxyXG4gICAgcmVkdWNlOiAgY3JlYXRlRGljdFJlZHVjZShmYWxzZSksXHJcbiAgICB0dXJuOiAgICBjcmVhdGVEaWN0UmVkdWNlKHRydWUpLFxyXG4gICAga2V5T2Y6ICAga2V5T2YsXHJcbiAgICBpbmNsdWRlczppbmNsdWRlcyxcclxuICAgIC8vIEhhcyAvIGdldCAvIHNldCBvd24gcHJvcGVydHlcclxuICAgIGhhczogaGFzLFxyXG4gICAgZ2V0OiBnZXQsXHJcbiAgICBzZXQ6IGNyZWF0ZURlZmluZXIoMCksXHJcbiAgICBpc0RpY3Q6IGZ1bmN0aW9uKGl0KXtcclxuICAgICAgcmV0dXJuIGlzT2JqZWN0KGl0KSAmJiBnZXRQcm90b3R5cGVPZihpdCkgPT09IERpY3RbUFJPVE9UWVBFXTtcclxuICAgIH1cclxuICB9O1xyXG4gIFxyXG4gIGlmKFJFRkVSRU5DRV9HRVQpZm9yKHZhciBrZXkgaW4gZGljdE1ldGhvZHMpIWZ1bmN0aW9uKGZuKXtcclxuICAgIGZ1bmN0aW9uIG1ldGhvZCgpe1xyXG4gICAgICBmb3IodmFyIGFyZ3MgPSBbdGhpc10sIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDspYXJncy5wdXNoKGFyZ3VtZW50c1tpKytdKTtcclxuICAgICAgcmV0dXJuIGludm9rZShmbiwgYXJncyk7XHJcbiAgICB9XHJcbiAgICBmbltSRUZFUkVOQ0VfR0VUXSA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgIHJldHVybiBtZXRob2Q7XHJcbiAgICB9XHJcbiAgfShkaWN0TWV0aG9kc1trZXldKTtcclxuICBcclxuICAkZGVmaW5lKEdMT0JBTCArIEZPUkNFRCwge0RpY3Q6IGFzc2lnbkhpZGRlbihEaWN0LCBkaWN0TWV0aG9kcyl9KTtcclxufSgnRGljdCcpO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBNb2R1bGUgOiBjb3JlLiRmb3IgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4hZnVuY3Rpb24oRU5UUklFUywgRk4peyAgXHJcbiAgZnVuY3Rpb24gJGZvcihpdGVyYWJsZSwgZW50cmllcyl7XHJcbiAgICBpZighKHRoaXMgaW5zdGFuY2VvZiAkZm9yKSlyZXR1cm4gbmV3ICRmb3IoaXRlcmFibGUsIGVudHJpZXMpO1xyXG4gICAgdGhpc1tJVEVSXSAgICA9IGdldEl0ZXJhdG9yKGl0ZXJhYmxlKTtcclxuICAgIHRoaXNbRU5UUklFU10gPSAhIWVudHJpZXM7XHJcbiAgfVxyXG4gIFxyXG4gIGNyZWF0ZUl0ZXJhdG9yKCRmb3IsICdXcmFwcGVyJywgZnVuY3Rpb24oKXtcclxuICAgIHJldHVybiB0aGlzW0lURVJdLm5leHQoKTtcclxuICB9KTtcclxuICB2YXIgJGZvclByb3RvID0gJGZvcltQUk9UT1RZUEVdO1xyXG4gIHNldEl0ZXJhdG9yKCRmb3JQcm90bywgZnVuY3Rpb24oKXtcclxuICAgIHJldHVybiB0aGlzW0lURVJdOyAvLyB1bndyYXBcclxuICB9KTtcclxuICBcclxuICBmdW5jdGlvbiBjcmVhdGVDaGFpbkl0ZXJhdG9yKG5leHQpe1xyXG4gICAgZnVuY3Rpb24gSXRlcihJLCBmbiwgdGhhdCl7XHJcbiAgICAgIHRoaXNbSVRFUl0gICAgPSBnZXRJdGVyYXRvcihJKTtcclxuICAgICAgdGhpc1tFTlRSSUVTXSA9IElbRU5UUklFU107XHJcbiAgICAgIHRoaXNbRk5dICAgICAgPSBjdHgoZm4sIHRoYXQsIElbRU5UUklFU10gPyAyIDogMSk7XHJcbiAgICB9XHJcbiAgICBjcmVhdGVJdGVyYXRvcihJdGVyLCAnQ2hhaW4nLCBuZXh0LCAkZm9yUHJvdG8pO1xyXG4gICAgc2V0SXRlcmF0b3IoSXRlcltQUk9UT1RZUEVdLCByZXR1cm5UaGlzKTsgLy8gb3ZlcnJpZGUgJGZvclByb3RvIGl0ZXJhdG9yXHJcbiAgICByZXR1cm4gSXRlcjtcclxuICB9XHJcbiAgXHJcbiAgdmFyIE1hcEl0ZXIgPSBjcmVhdGVDaGFpbkl0ZXJhdG9yKGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgc3RlcCA9IHRoaXNbSVRFUl0ubmV4dCgpO1xyXG4gICAgcmV0dXJuIHN0ZXAuZG9uZSA/IHN0ZXAgOiBpdGVyUmVzdWx0KDAsIHN0ZXBDYWxsKHRoaXNbRk5dLCBzdGVwLnZhbHVlLCB0aGlzW0VOVFJJRVNdKSk7XHJcbiAgfSk7XHJcbiAgXHJcbiAgdmFyIEZpbHRlckl0ZXIgPSBjcmVhdGVDaGFpbkl0ZXJhdG9yKGZ1bmN0aW9uKCl7XHJcbiAgICBmb3IoOzspe1xyXG4gICAgICB2YXIgc3RlcCA9IHRoaXNbSVRFUl0ubmV4dCgpO1xyXG4gICAgICBpZihzdGVwLmRvbmUgfHwgc3RlcENhbGwodGhpc1tGTl0sIHN0ZXAudmFsdWUsIHRoaXNbRU5UUklFU10pKXJldHVybiBzdGVwO1xyXG4gICAgfVxyXG4gIH0pO1xyXG4gIFxyXG4gIGFzc2lnbkhpZGRlbigkZm9yUHJvdG8sIHtcclxuICAgIG9mOiBmdW5jdGlvbihmbiwgdGhhdCl7XHJcbiAgICAgIGZvck9mKHRoaXMsIHRoaXNbRU5UUklFU10sIGZuLCB0aGF0KTtcclxuICAgIH0sXHJcbiAgICBhcnJheTogZnVuY3Rpb24oZm4sIHRoYXQpe1xyXG4gICAgICB2YXIgcmVzdWx0ID0gW107XHJcbiAgICAgIGZvck9mKGZuICE9IHVuZGVmaW5lZCA/IHRoaXMubWFwKGZuLCB0aGF0KSA6IHRoaXMsIGZhbHNlLCBwdXNoLCByZXN1bHQpO1xyXG4gICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfSxcclxuICAgIGZpbHRlcjogZnVuY3Rpb24oZm4sIHRoYXQpe1xyXG4gICAgICByZXR1cm4gbmV3IEZpbHRlckl0ZXIodGhpcywgZm4sIHRoYXQpO1xyXG4gICAgfSxcclxuICAgIG1hcDogZnVuY3Rpb24oZm4sIHRoYXQpe1xyXG4gICAgICByZXR1cm4gbmV3IE1hcEl0ZXIodGhpcywgZm4sIHRoYXQpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG4gIFxyXG4gICRmb3IuaXNJdGVyYWJsZSAgPSBpc0l0ZXJhYmxlO1xyXG4gICRmb3IuZ2V0SXRlcmF0b3IgPSBnZXRJdGVyYXRvcjtcclxuICBcclxuICAkZGVmaW5lKEdMT0JBTCArIEZPUkNFRCwgeyRmb3I6ICRmb3J9KTtcclxufSgnZW50cmllcycsIHNhZmVTeW1ib2woJ2ZuJykpO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBNb2R1bGUgOiBjb3JlLmRlbGF5ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4vLyBodHRwczovL2VzZGlzY3Vzcy5vcmcvdG9waWMvcHJvbWlzZS1yZXR1cm5pbmctZGVsYXktZnVuY3Rpb25cclxuJGRlZmluZShHTE9CQUwgKyBGT1JDRUQsIHtcclxuICBkZWxheTogZnVuY3Rpb24odGltZSl7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSl7XHJcbiAgICAgIHNldFRpbWVvdXQocmVzb2x2ZSwgdGltZSwgdHJ1ZSk7XHJcbiAgICB9KTtcclxuICB9XHJcbn0pO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBNb2R1bGUgOiBjb3JlLmJpbmRpbmcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4hZnVuY3Rpb24oXywgdG9Mb2NhbGVTdHJpbmcpe1xyXG4gIC8vIFBsYWNlaG9sZGVyXHJcbiAgY29yZS5fID0gcGF0aC5fID0gcGF0aC5fIHx8IHt9O1xyXG5cclxuICAkZGVmaW5lKFBST1RPICsgRk9SQ0VELCBGVU5DVElPTiwge1xyXG4gICAgcGFydDogcGFydCxcclxuICAgIG9ubHk6IGZ1bmN0aW9uKG51bWJlckFyZ3VtZW50cywgdGhhdCAvKiA9IEAgKi8pe1xyXG4gICAgICB2YXIgZm4gICAgID0gYXNzZXJ0RnVuY3Rpb24odGhpcylcclxuICAgICAgICAsIG4gICAgICA9IHRvTGVuZ3RoKG51bWJlckFyZ3VtZW50cylcclxuICAgICAgICAsIGlzVGhhdCA9IGFyZ3VtZW50cy5sZW5ndGggPiAxO1xyXG4gICAgICByZXR1cm4gZnVuY3Rpb24oLyogLi4uYXJncyAqLyl7XHJcbiAgICAgICAgdmFyIGxlbmd0aCA9IG1pbihuLCBhcmd1bWVudHMubGVuZ3RoKVxyXG4gICAgICAgICAgLCBhcmdzICAgPSBBcnJheShsZW5ndGgpXHJcbiAgICAgICAgICAsIGkgICAgICA9IDA7XHJcbiAgICAgICAgd2hpbGUobGVuZ3RoID4gaSlhcmdzW2ldID0gYXJndW1lbnRzW2krK107XHJcbiAgICAgICAgcmV0dXJuIGludm9rZShmbiwgYXJncywgaXNUaGF0ID8gdGhhdCA6IHRoaXMpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSk7XHJcbiAgXHJcbiAgZnVuY3Rpb24gdGllKGtleSl7XHJcbiAgICB2YXIgdGhhdCAgPSB0aGlzXHJcbiAgICAgICwgYm91bmQgPSB7fTtcclxuICAgIHJldHVybiBoaWRkZW4odGhhdCwgXywgZnVuY3Rpb24oa2V5KXtcclxuICAgICAgaWYoa2V5ID09PSB1bmRlZmluZWQgfHwgIShrZXkgaW4gdGhhdCkpcmV0dXJuIHRvTG9jYWxlU3RyaW5nLmNhbGwodGhhdCk7XHJcbiAgICAgIHJldHVybiBoYXMoYm91bmQsIGtleSkgPyBib3VuZFtrZXldIDogKGJvdW5kW2tleV0gPSBjdHgodGhhdFtrZXldLCB0aGF0LCAtMSkpO1xyXG4gICAgfSlbX10oa2V5KTtcclxuICB9XHJcbiAgXHJcbiAgaGlkZGVuKHBhdGguXywgVE9fU1RSSU5HLCBmdW5jdGlvbigpe1xyXG4gICAgcmV0dXJuIF87XHJcbiAgfSk7XHJcbiAgXHJcbiAgaGlkZGVuKE9iamVjdFByb3RvLCBfLCB0aWUpO1xyXG4gIERFU0MgfHwgaGlkZGVuKEFycmF5UHJvdG8sIF8sIHRpZSk7XHJcbiAgLy8gSUU4LSBkaXJ0eSBoYWNrIC0gcmVkZWZpbmVkIHRvTG9jYWxlU3RyaW5nIGlzIG5vdCBlbnVtZXJhYmxlXHJcbn0oREVTQyA/IHVpZCgndGllJykgOiBUT19MT0NBTEUsIE9iamVjdFByb3RvW1RPX0xPQ0FMRV0pO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBNb2R1bGUgOiBjb3JlLm9iamVjdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4hZnVuY3Rpb24oKXtcclxuICBmdW5jdGlvbiBkZWZpbmUodGFyZ2V0LCBtaXhpbil7XHJcbiAgICB2YXIga2V5cyAgID0gb3duS2V5cyh0b09iamVjdChtaXhpbikpXHJcbiAgICAgICwgbGVuZ3RoID0ga2V5cy5sZW5ndGhcclxuICAgICAgLCBpID0gMCwga2V5O1xyXG4gICAgd2hpbGUobGVuZ3RoID4gaSlkZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSA9IGtleXNbaSsrXSwgZ2V0T3duRGVzY3JpcHRvcihtaXhpbiwga2V5KSk7XHJcbiAgICByZXR1cm4gdGFyZ2V0O1xyXG4gIH07XHJcbiAgJGRlZmluZShTVEFUSUMgKyBGT1JDRUQsIE9CSkVDVCwge1xyXG4gICAgaXNPYmplY3Q6IGlzT2JqZWN0LFxyXG4gICAgY2xhc3NvZjogY2xhc3NvZixcclxuICAgIGRlZmluZTogZGVmaW5lLFxyXG4gICAgbWFrZTogZnVuY3Rpb24ocHJvdG8sIG1peGluKXtcclxuICAgICAgcmV0dXJuIGRlZmluZShjcmVhdGUocHJvdG8pLCBtaXhpbik7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn0oKTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogTW9kdWxlIDogY29yZS5hcnJheSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuJGRlZmluZShQUk9UTyArIEZPUkNFRCwgQVJSQVksIHtcclxuICB0dXJuOiBmdW5jdGlvbihmbiwgdGFyZ2V0IC8qID0gW10gKi8pe1xyXG4gICAgYXNzZXJ0RnVuY3Rpb24oZm4pO1xyXG4gICAgdmFyIG1lbW8gICA9IHRhcmdldCA9PSB1bmRlZmluZWQgPyBbXSA6IE9iamVjdCh0YXJnZXQpXHJcbiAgICAgICwgTyAgICAgID0gRVM1T2JqZWN0KHRoaXMpXHJcbiAgICAgICwgbGVuZ3RoID0gdG9MZW5ndGgoTy5sZW5ndGgpXHJcbiAgICAgICwgaW5kZXggID0gMDtcclxuICAgIHdoaWxlKGxlbmd0aCA+IGluZGV4KWlmKGZuKG1lbW8sIE9baW5kZXhdLCBpbmRleCsrLCB0aGlzKSA9PT0gZmFsc2UpYnJlYWs7XHJcbiAgICByZXR1cm4gbWVtbztcclxuICB9XHJcbn0pO1xyXG5pZihmcmFtZXdvcmspQXJyYXlVbnNjb3BhYmxlcy50dXJuID0gdHJ1ZTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogTW9kdWxlIDogY29yZS5udW1iZXIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuIWZ1bmN0aW9uKG51bWJlck1ldGhvZHMpeyAgXHJcbiAgZnVuY3Rpb24gTnVtYmVySXRlcmF0b3IoaXRlcmF0ZWQpe1xyXG4gICAgc2V0KHRoaXMsIElURVIsIHtsOiB0b0xlbmd0aChpdGVyYXRlZCksIGk6IDB9KTtcclxuICB9XHJcbiAgY3JlYXRlSXRlcmF0b3IoTnVtYmVySXRlcmF0b3IsIE5VTUJFUiwgZnVuY3Rpb24oKXtcclxuICAgIHZhciBpdGVyID0gdGhpc1tJVEVSXVxyXG4gICAgICAsIGkgICAgPSBpdGVyLmkrKztcclxuICAgIHJldHVybiBpIDwgaXRlci5sID8gaXRlclJlc3VsdCgwLCBpKSA6IGl0ZXJSZXN1bHQoMSk7XHJcbiAgfSk7XHJcbiAgZGVmaW5lSXRlcmF0b3IoTnVtYmVyLCBOVU1CRVIsIGZ1bmN0aW9uKCl7XHJcbiAgICByZXR1cm4gbmV3IE51bWJlckl0ZXJhdG9yKHRoaXMpO1xyXG4gIH0pO1xyXG4gIFxyXG4gIG51bWJlck1ldGhvZHMucmFuZG9tID0gZnVuY3Rpb24obGltIC8qID0gMCAqLyl7XHJcbiAgICB2YXIgYSA9ICt0aGlzXHJcbiAgICAgICwgYiA9IGxpbSA9PSB1bmRlZmluZWQgPyAwIDogK2xpbVxyXG4gICAgICAsIG0gPSBtaW4oYSwgYik7XHJcbiAgICByZXR1cm4gcmFuZG9tKCkgKiAobWF4KGEsIGIpIC0gbSkgKyBtO1xyXG4gIH07XHJcblxyXG4gIGZvckVhY2guY2FsbChhcnJheShcclxuICAgICAgLy8gRVMzOlxyXG4gICAgICAncm91bmQsZmxvb3IsY2VpbCxhYnMsc2luLGFzaW4sY29zLGFjb3MsdGFuLGF0YW4sZXhwLHNxcnQsbWF4LG1pbixwb3csYXRhbjIsJyArXHJcbiAgICAgIC8vIEVTNjpcclxuICAgICAgJ2Fjb3NoLGFzaW5oLGF0YW5oLGNicnQsY2x6MzIsY29zaCxleHBtMSxoeXBvdCxpbXVsLGxvZzFwLGxvZzEwLGxvZzIsc2lnbixzaW5oLHRhbmgsdHJ1bmMnXHJcbiAgICApLCBmdW5jdGlvbihrZXkpe1xyXG4gICAgICB2YXIgZm4gPSBNYXRoW2tleV07XHJcbiAgICAgIGlmKGZuKW51bWJlck1ldGhvZHNba2V5XSA9IGZ1bmN0aW9uKC8qIC4uLmFyZ3MgKi8pe1xyXG4gICAgICAgIC8vIGllOS0gZG9udCBzdXBwb3J0IHN0cmljdCBtb2RlICYgY29udmVydCBgdGhpc2AgdG8gb2JqZWN0IC0+IGNvbnZlcnQgaXQgdG8gbnVtYmVyXHJcbiAgICAgICAgdmFyIGFyZ3MgPSBbK3RoaXNdXHJcbiAgICAgICAgICAsIGkgICAgPSAwO1xyXG4gICAgICAgIHdoaWxlKGFyZ3VtZW50cy5sZW5ndGggPiBpKWFyZ3MucHVzaChhcmd1bWVudHNbaSsrXSk7XHJcbiAgICAgICAgcmV0dXJuIGludm9rZShmbiwgYXJncyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICApO1xyXG4gIFxyXG4gICRkZWZpbmUoUFJPVE8gKyBGT1JDRUQsIE5VTUJFUiwgbnVtYmVyTWV0aG9kcyk7XHJcbn0oe30pO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBNb2R1bGUgOiBjb3JlLnN0cmluZyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4hZnVuY3Rpb24oKXtcclxuICB2YXIgZXNjYXBlSFRNTERpY3QgPSB7XHJcbiAgICAnJic6ICcmYW1wOycsXHJcbiAgICAnPCc6ICcmbHQ7JyxcclxuICAgICc+JzogJyZndDsnLFxyXG4gICAgJ1wiJzogJyZxdW90OycsXHJcbiAgICBcIidcIjogJyZhcG9zOydcclxuICB9LCB1bmVzY2FwZUhUTUxEaWN0ID0ge30sIGtleTtcclxuICBmb3Ioa2V5IGluIGVzY2FwZUhUTUxEaWN0KXVuZXNjYXBlSFRNTERpY3RbZXNjYXBlSFRNTERpY3Rba2V5XV0gPSBrZXk7XHJcbiAgJGRlZmluZShQUk9UTyArIEZPUkNFRCwgU1RSSU5HLCB7XHJcbiAgICBlc2NhcGVIVE1MOiAgIGNyZWF0ZVJlcGxhY2VyKC9bJjw+XCInXS9nLCBlc2NhcGVIVE1MRGljdCksXHJcbiAgICB1bmVzY2FwZUhUTUw6IGNyZWF0ZVJlcGxhY2VyKC8mKD86YW1wfGx0fGd0fHF1b3R8YXBvcyk7L2csIHVuZXNjYXBlSFRNTERpY3QpXHJcbiAgfSk7XHJcbn0oKTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogTW9kdWxlIDogY29yZS5kYXRlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuIWZ1bmN0aW9uKGZvcm1hdFJlZ0V4cCwgZmxleGlvUmVnRXhwLCBsb2NhbGVzLCBjdXJyZW50LCBTRUNPTkRTLCBNSU5VVEVTLCBIT1VSUywgTU9OVEgsIFlFQVIpe1xyXG4gIGZ1bmN0aW9uIGNyZWF0ZUZvcm1hdChwcmVmaXgpe1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKHRlbXBsYXRlLCBsb2NhbGUgLyogPSBjdXJyZW50ICovKXtcclxuICAgICAgdmFyIHRoYXQgPSB0aGlzXHJcbiAgICAgICAgLCBkaWN0ID0gbG9jYWxlc1toYXMobG9jYWxlcywgbG9jYWxlKSA/IGxvY2FsZSA6IGN1cnJlbnRdO1xyXG4gICAgICBmdW5jdGlvbiBnZXQodW5pdCl7XHJcbiAgICAgICAgcmV0dXJuIHRoYXRbcHJlZml4ICsgdW5pdF0oKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gU3RyaW5nKHRlbXBsYXRlKS5yZXBsYWNlKGZvcm1hdFJlZ0V4cCwgZnVuY3Rpb24ocGFydCl7XHJcbiAgICAgICAgc3dpdGNoKHBhcnQpe1xyXG4gICAgICAgICAgY2FzZSAncycgIDogcmV0dXJuIGdldChTRUNPTkRTKTsgICAgICAgICAgICAgICAgICAvLyBTZWNvbmRzIDogMC01OVxyXG4gICAgICAgICAgY2FzZSAnc3MnIDogcmV0dXJuIGx6KGdldChTRUNPTkRTKSk7ICAgICAgICAgICAgICAvLyBTZWNvbmRzIDogMDAtNTlcclxuICAgICAgICAgIGNhc2UgJ20nICA6IHJldHVybiBnZXQoTUlOVVRFUyk7ICAgICAgICAgICAgICAgICAgLy8gTWludXRlcyA6IDAtNTlcclxuICAgICAgICAgIGNhc2UgJ21tJyA6IHJldHVybiBseihnZXQoTUlOVVRFUykpOyAgICAgICAgICAgICAgLy8gTWludXRlcyA6IDAwLTU5XHJcbiAgICAgICAgICBjYXNlICdoJyAgOiByZXR1cm4gZ2V0KEhPVVJTKTsgICAgICAgICAgICAgICAgICAgIC8vIEhvdXJzICAgOiAwLTIzXHJcbiAgICAgICAgICBjYXNlICdoaCcgOiByZXR1cm4gbHooZ2V0KEhPVVJTKSk7ICAgICAgICAgICAgICAgIC8vIEhvdXJzICAgOiAwMC0yM1xyXG4gICAgICAgICAgY2FzZSAnRCcgIDogcmV0dXJuIGdldChEQVRFKTsgICAgICAgICAgICAgICAgICAgICAvLyBEYXRlICAgIDogMS0zMVxyXG4gICAgICAgICAgY2FzZSAnREQnIDogcmV0dXJuIGx6KGdldChEQVRFKSk7ICAgICAgICAgICAgICAgICAvLyBEYXRlICAgIDogMDEtMzFcclxuICAgICAgICAgIGNhc2UgJ1cnICA6IHJldHVybiBkaWN0WzBdW2dldCgnRGF5JyldOyAgICAgICAgICAgLy8gRGF5ICAgICA6INCf0L7QvdC10LTQtdC70YzQvdC40LpcclxuICAgICAgICAgIGNhc2UgJ04nICA6IHJldHVybiBnZXQoTU9OVEgpICsgMTsgICAgICAgICAgICAgICAgLy8gTW9udGggICA6IDEtMTJcclxuICAgICAgICAgIGNhc2UgJ05OJyA6IHJldHVybiBseihnZXQoTU9OVEgpICsgMSk7ICAgICAgICAgICAgLy8gTW9udGggICA6IDAxLTEyXHJcbiAgICAgICAgICBjYXNlICdNJyAgOiByZXR1cm4gZGljdFsyXVtnZXQoTU9OVEgpXTsgICAgICAgICAgIC8vIE1vbnRoICAgOiDQr9C90LLQsNGA0YxcclxuICAgICAgICAgIGNhc2UgJ01NJyA6IHJldHVybiBkaWN0WzFdW2dldChNT05USCldOyAgICAgICAgICAgLy8gTW9udGggICA6INCv0L3QstCw0YDRj1xyXG4gICAgICAgICAgY2FzZSAnWScgIDogcmV0dXJuIGdldChZRUFSKTsgICAgICAgICAgICAgICAgICAgICAvLyBZZWFyICAgIDogMjAxNFxyXG4gICAgICAgICAgY2FzZSAnWVknIDogcmV0dXJuIGx6KGdldChZRUFSKSAlIDEwMCk7ICAgICAgICAgICAvLyBZZWFyICAgIDogMTRcclxuICAgICAgICB9IHJldHVybiBwYXJ0O1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcbiAgZnVuY3Rpb24gYWRkTG9jYWxlKGxhbmcsIGxvY2FsZSl7XHJcbiAgICBmdW5jdGlvbiBzcGxpdChpbmRleCl7XHJcbiAgICAgIHZhciByZXN1bHQgPSBbXTtcclxuICAgICAgZm9yRWFjaC5jYWxsKGFycmF5KGxvY2FsZS5tb250aHMpLCBmdW5jdGlvbihpdCl7XHJcbiAgICAgICAgcmVzdWx0LnB1c2goaXQucmVwbGFjZShmbGV4aW9SZWdFeHAsICckJyArIGluZGV4KSk7XHJcbiAgICAgIH0pO1xyXG4gICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG4gICAgbG9jYWxlc1tsYW5nXSA9IFthcnJheShsb2NhbGUud2Vla2RheXMpLCBzcGxpdCgxKSwgc3BsaXQoMildO1xyXG4gICAgcmV0dXJuIGNvcmU7XHJcbiAgfVxyXG4gICRkZWZpbmUoUFJPVE8gKyBGT1JDRUQsIERBVEUsIHtcclxuICAgIGZvcm1hdDogICAgY3JlYXRlRm9ybWF0KCdnZXQnKSxcclxuICAgIGZvcm1hdFVUQzogY3JlYXRlRm9ybWF0KCdnZXRVVEMnKVxyXG4gIH0pO1xyXG4gIGFkZExvY2FsZShjdXJyZW50LCB7XHJcbiAgICB3ZWVrZGF5czogJ1N1bmRheSxNb25kYXksVHVlc2RheSxXZWRuZXNkYXksVGh1cnNkYXksRnJpZGF5LFNhdHVyZGF5JyxcclxuICAgIG1vbnRoczogJ0phbnVhcnksRmVicnVhcnksTWFyY2gsQXByaWwsTWF5LEp1bmUsSnVseSxBdWd1c3QsU2VwdGVtYmVyLE9jdG9iZXIsTm92ZW1iZXIsRGVjZW1iZXInXHJcbiAgfSk7XHJcbiAgYWRkTG9jYWxlKCdydScsIHtcclxuICAgIHdlZWtkYXlzOiAn0JLQvtGB0LrRgNC10YHQtdC90YzQtSzQn9C+0L3QtdC00LXQu9GM0L3QuNC6LNCS0YLQvtGA0L3QuNC6LNCh0YDQtdC00LAs0KfQtdGC0LLQtdGA0LMs0J/Rj9GC0L3QuNGG0LAs0KHRg9Cx0LHQvtGC0LAnLFxyXG4gICAgbW9udGhzOiAn0K/QvdCy0LDRgDrRj3zRjCzQpNC10LLRgNCw0Ls60Y980Yws0JzQsNGA0YI60LB8LNCQ0L/RgNC10Ls60Y980Yws0JzQsDrRj3zQuSzQmNGO0L060Y980YwsJyArXHJcbiAgICAgICAgICAgICfQmNGO0Ls60Y980Yws0JDQstCz0YPRgdGCOtCwfCzQodC10L3RgtGP0LHRgDrRj3zRjCzQntC60YLRj9Cx0YA60Y980Yws0J3QvtGP0LHRgDrRj3zRjCzQlNC10LrQsNCx0YA60Y980YwnXHJcbiAgfSk7XHJcbiAgY29yZS5sb2NhbGUgPSBmdW5jdGlvbihsb2NhbGUpe1xyXG4gICAgcmV0dXJuIGhhcyhsb2NhbGVzLCBsb2NhbGUpID8gY3VycmVudCA9IGxvY2FsZSA6IGN1cnJlbnQ7XHJcbiAgfTtcclxuICBjb3JlLmFkZExvY2FsZSA9IGFkZExvY2FsZTtcclxufSgvXFxiXFx3XFx3P1xcYi9nLCAvOiguKilcXHwoLiopJC8sIHt9LCAnZW4nLCAnU2Vjb25kcycsICdNaW51dGVzJywgJ0hvdXJzJywgJ01vbnRoJywgJ0Z1bGxZZWFyJyk7XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIE1vZHVsZSA6IGNvcmUuZ2xvYmFsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiRkZWZpbmUoR0xPQkFMICsgRk9SQ0VELCB7Z2xvYmFsOiBnbG9iYWx9KTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogTW9kdWxlIDoganMuYXJyYXkuc3RhdGljcyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuLy8gSmF2YVNjcmlwdCAxLjYgLyBTdHJhd21hbiBhcnJheSBzdGF0aWNzIHNoaW1cclxuIWZ1bmN0aW9uKGFycmF5U3RhdGljcyl7XHJcbiAgZnVuY3Rpb24gc2V0QXJyYXlTdGF0aWNzKGtleXMsIGxlbmd0aCl7XHJcbiAgICBmb3JFYWNoLmNhbGwoYXJyYXkoa2V5cyksIGZ1bmN0aW9uKGtleSl7XHJcbiAgICAgIGlmKGtleSBpbiBBcnJheVByb3RvKWFycmF5U3RhdGljc1trZXldID0gY3R4KGNhbGwsIEFycmF5UHJvdG9ba2V5XSwgbGVuZ3RoKTtcclxuICAgIH0pO1xyXG4gIH1cclxuICBzZXRBcnJheVN0YXRpY3MoJ3BvcCxyZXZlcnNlLHNoaWZ0LGtleXMsdmFsdWVzLGVudHJpZXMnLCAxKTtcclxuICBzZXRBcnJheVN0YXRpY3MoJ2luZGV4T2YsZXZlcnksc29tZSxmb3JFYWNoLG1hcCxmaWx0ZXIsZmluZCxmaW5kSW5kZXgsaW5jbHVkZXMnLCAzKTtcclxuICBzZXRBcnJheVN0YXRpY3MoJ2pvaW4sc2xpY2UsY29uY2F0LHB1c2gsc3BsaWNlLHVuc2hpZnQsc29ydCxsYXN0SW5kZXhPZiwnICtcclxuICAgICAgICAgICAgICAgICAgJ3JlZHVjZSxyZWR1Y2VSaWdodCxjb3B5V2l0aGluLGZpbGwsdHVybicpO1xyXG4gICRkZWZpbmUoU1RBVElDLCBBUlJBWSwgYXJyYXlTdGF0aWNzKTtcclxufSh7fSk7XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIE1vZHVsZSA6IHdlYi5kb20uaXRhcmFibGUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiFmdW5jdGlvbihOb2RlTGlzdCl7XHJcbiAgaWYoZnJhbWV3b3JrICYmIE5vZGVMaXN0ICYmICEoU1lNQk9MX0lURVJBVE9SIGluIE5vZGVMaXN0W1BST1RPVFlQRV0pKXtcclxuICAgIGhpZGRlbihOb2RlTGlzdFtQUk9UT1RZUEVdLCBTWU1CT0xfSVRFUkFUT1IsIEl0ZXJhdG9yc1tBUlJBWV0pO1xyXG4gIH1cclxuICBJdGVyYXRvcnMuTm9kZUxpc3QgPSBJdGVyYXRvcnNbQVJSQVldO1xyXG59KGdsb2JhbC5Ob2RlTGlzdCk7XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIE1vZHVsZSA6IGNvcmUubG9nICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiFmdW5jdGlvbihsb2csIGVuYWJsZWQpe1xyXG4gIC8vIE1ldGhvZHMgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vRGV2ZWxvcGVyVG9vbHNXRy9jb25zb2xlLW9iamVjdC9ibG9iL21hc3Rlci9hcGkubWRcclxuICBmb3JFYWNoLmNhbGwoYXJyYXkoJ2Fzc2VydCxjbGVhcixjb3VudCxkZWJ1ZyxkaXIsZGlyeG1sLGVycm9yLGV4Y2VwdGlvbiwnICtcclxuICAgICAgJ2dyb3VwLGdyb3VwQ29sbGFwc2VkLGdyb3VwRW5kLGluZm8saXNJbmRlcGVuZGVudGx5Q29tcG9zZWQsbG9nLCcgK1xyXG4gICAgICAnbWFya1RpbWVsaW5lLHByb2ZpbGUscHJvZmlsZUVuZCx0YWJsZSx0aW1lLHRpbWVFbmQsdGltZWxpbmUsJyArXHJcbiAgICAgICd0aW1lbGluZUVuZCx0aW1lU3RhbXAsdHJhY2Usd2FybicpLCBmdW5jdGlvbihrZXkpe1xyXG4gICAgbG9nW2tleV0gPSBmdW5jdGlvbigpe1xyXG4gICAgICBpZihlbmFibGVkICYmIGtleSBpbiBjb25zb2xlKXJldHVybiBhcHBseS5jYWxsKGNvbnNvbGVba2V5XSwgY29uc29sZSwgYXJndW1lbnRzKTtcclxuICAgIH07XHJcbiAgfSk7XHJcbiAgJGRlZmluZShHTE9CQUwgKyBGT1JDRUQsIHtsb2c6IGFzc2lnbihsb2cubG9nLCBsb2csIHtcclxuICAgIGVuYWJsZTogZnVuY3Rpb24oKXtcclxuICAgICAgZW5hYmxlZCA9IHRydWU7XHJcbiAgICB9LFxyXG4gICAgZGlzYWJsZTogZnVuY3Rpb24oKXtcclxuICAgICAgZW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgfVxyXG4gIH0pfSk7XHJcbn0oe30sIHRydWUpO1xufSh0eXBlb2Ygc2VsZiAhPSAndW5kZWZpbmVkJyAmJiBzZWxmLk1hdGggPT09IE1hdGggPyBzZWxmIDogRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKSwgZmFsc2UpO1xubW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiBtb2R1bGUuZXhwb3J0cywgX19lc01vZHVsZTogdHJ1ZSB9O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gZnVuY3Rpb24gKGluc3RhbmNlLCBDb25zdHJ1Y3Rvcikge1xuICBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7XG4gIH1cbn07XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gKGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7XG4gICAgZm9yICh2YXIga2V5IGluIHByb3BzKSB7XG4gICAgICB2YXIgcHJvcCA9IHByb3BzW2tleV07XG4gICAgICBwcm9wLmNvbmZpZ3VyYWJsZSA9IHRydWU7XG4gICAgICBpZiAocHJvcC52YWx1ZSkgcHJvcC53cml0YWJsZSA9IHRydWU7XG4gICAgfVxuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcyk7XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykge1xuICAgIGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7XG4gICAgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7XG4gICAgcmV0dXJuIENvbnN0cnVjdG9yO1xuICB9O1xufSkoKTtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9jb3JlID0gcmVxdWlyZShcImJhYmVsLXJ1bnRpbWUvY29yZS1qc1wiKVtcImRlZmF1bHRcIl07XG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gX2NvcmUuT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTtcblxuICAgIGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHtcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7XG4gICAgICAgIHRhcmdldFtrZXldID0gc291cmNlW2tleV07XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRhcmdldDtcbn07XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gZnVuY3Rpb24gKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7XG4gIGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCBcIiArIHR5cGVvZiBzdXBlckNsYXNzKTtcbiAgfVxuXG4gIHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwge1xuICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICB2YWx1ZTogc3ViQ2xhc3MsXG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfVxuICB9KTtcbiAgaWYgKHN1cGVyQ2xhc3MpIHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7XG59O1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlOyIsbnVsbCwiLyohXG4gKiBUaGUgYnVmZmVyIG1vZHVsZSBmcm9tIG5vZGUuanMsIGZvciB0aGUgYnJvd3Nlci5cbiAqXG4gKiBAYXV0aG9yICAgRmVyb3NzIEFib3VraGFkaWplaCA8ZmVyb3NzQGZlcm9zcy5vcmc+IDxodHRwOi8vZmVyb3NzLm9yZz5cbiAqIEBsaWNlbnNlICBNSVRcbiAqL1xuXG52YXIgYmFzZTY0ID0gcmVxdWlyZSgnYmFzZTY0LWpzJylcbnZhciBpZWVlNzU0ID0gcmVxdWlyZSgnaWVlZTc1NCcpXG52YXIgaXNBcnJheSA9IHJlcXVpcmUoJ2lzLWFycmF5JylcblxuZXhwb3J0cy5CdWZmZXIgPSBCdWZmZXJcbmV4cG9ydHMuU2xvd0J1ZmZlciA9IEJ1ZmZlclxuZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFUyA9IDUwXG5CdWZmZXIucG9vbFNpemUgPSA4MTkyIC8vIG5vdCB1c2VkIGJ5IHRoaXMgaW1wbGVtZW50YXRpb25cblxudmFyIGtNYXhMZW5ndGggPSAweDNmZmZmZmZmXG5cbi8qKlxuICogSWYgYEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUYDpcbiAqICAgPT09IHRydWUgICAgVXNlIFVpbnQ4QXJyYXkgaW1wbGVtZW50YXRpb24gKGZhc3Rlc3QpXG4gKiAgID09PSBmYWxzZSAgIFVzZSBPYmplY3QgaW1wbGVtZW50YXRpb24gKG1vc3QgY29tcGF0aWJsZSwgZXZlbiBJRTYpXG4gKlxuICogQnJvd3NlcnMgdGhhdCBzdXBwb3J0IHR5cGVkIGFycmF5cyBhcmUgSUUgMTArLCBGaXJlZm94IDQrLCBDaHJvbWUgNyssIFNhZmFyaSA1LjErLFxuICogT3BlcmEgMTEuNissIGlPUyA0LjIrLlxuICpcbiAqIE5vdGU6XG4gKlxuICogLSBJbXBsZW1lbnRhdGlvbiBtdXN0IHN1cHBvcnQgYWRkaW5nIG5ldyBwcm9wZXJ0aWVzIHRvIGBVaW50OEFycmF5YCBpbnN0YW5jZXMuXG4gKiAgIEZpcmVmb3ggNC0yOSBsYWNrZWQgc3VwcG9ydCwgZml4ZWQgaW4gRmlyZWZveCAzMCsuXG4gKiAgIFNlZTogaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9Njk1NDM4LlxuICpcbiAqICAtIENocm9tZSA5LTEwIGlzIG1pc3NpbmcgdGhlIGBUeXBlZEFycmF5LnByb3RvdHlwZS5zdWJhcnJheWAgZnVuY3Rpb24uXG4gKlxuICogIC0gSUUxMCBoYXMgYSBicm9rZW4gYFR5cGVkQXJyYXkucHJvdG90eXBlLnN1YmFycmF5YCBmdW5jdGlvbiB3aGljaCByZXR1cm5zIGFycmF5cyBvZlxuICogICAgaW5jb3JyZWN0IGxlbmd0aCBpbiBzb21lIHNpdHVhdGlvbnMuXG4gKlxuICogV2UgZGV0ZWN0IHRoZXNlIGJ1Z2d5IGJyb3dzZXJzIGFuZCBzZXQgYEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUYCB0byBgZmFsc2VgIHNvIHRoZXkgd2lsbFxuICogZ2V0IHRoZSBPYmplY3QgaW1wbGVtZW50YXRpb24sIHdoaWNoIGlzIHNsb3dlciBidXQgd2lsbCB3b3JrIGNvcnJlY3RseS5cbiAqL1xuQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQgPSAoZnVuY3Rpb24gKCkge1xuICB0cnkge1xuICAgIHZhciBidWYgPSBuZXcgQXJyYXlCdWZmZXIoMClcbiAgICB2YXIgYXJyID0gbmV3IFVpbnQ4QXJyYXkoYnVmKVxuICAgIGFyci5mb28gPSBmdW5jdGlvbiAoKSB7IHJldHVybiA0MiB9XG4gICAgcmV0dXJuIDQyID09PSBhcnIuZm9vKCkgJiYgLy8gdHlwZWQgYXJyYXkgaW5zdGFuY2VzIGNhbiBiZSBhdWdtZW50ZWRcbiAgICAgICAgdHlwZW9mIGFyci5zdWJhcnJheSA9PT0gJ2Z1bmN0aW9uJyAmJiAvLyBjaHJvbWUgOS0xMCBsYWNrIGBzdWJhcnJheWBcbiAgICAgICAgbmV3IFVpbnQ4QXJyYXkoMSkuc3ViYXJyYXkoMSwgMSkuYnl0ZUxlbmd0aCA9PT0gMCAvLyBpZTEwIGhhcyBicm9rZW4gYHN1YmFycmF5YFxuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn0pKClcblxuLyoqXG4gKiBDbGFzczogQnVmZmVyXG4gKiA9PT09PT09PT09PT09XG4gKlxuICogVGhlIEJ1ZmZlciBjb25zdHJ1Y3RvciByZXR1cm5zIGluc3RhbmNlcyBvZiBgVWludDhBcnJheWAgdGhhdCBhcmUgYXVnbWVudGVkXG4gKiB3aXRoIGZ1bmN0aW9uIHByb3BlcnRpZXMgZm9yIGFsbCB0aGUgbm9kZSBgQnVmZmVyYCBBUEkgZnVuY3Rpb25zLiBXZSB1c2VcbiAqIGBVaW50OEFycmF5YCBzbyB0aGF0IHNxdWFyZSBicmFja2V0IG5vdGF0aW9uIHdvcmtzIGFzIGV4cGVjdGVkIC0tIGl0IHJldHVybnNcbiAqIGEgc2luZ2xlIG9jdGV0LlxuICpcbiAqIEJ5IGF1Z21lbnRpbmcgdGhlIGluc3RhbmNlcywgd2UgY2FuIGF2b2lkIG1vZGlmeWluZyB0aGUgYFVpbnQ4QXJyYXlgXG4gKiBwcm90b3R5cGUuXG4gKi9cbmZ1bmN0aW9uIEJ1ZmZlciAoc3ViamVjdCwgZW5jb2RpbmcsIG5vWmVybykge1xuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgQnVmZmVyKSlcbiAgICByZXR1cm4gbmV3IEJ1ZmZlcihzdWJqZWN0LCBlbmNvZGluZywgbm9aZXJvKVxuXG4gIHZhciB0eXBlID0gdHlwZW9mIHN1YmplY3RcblxuICAvLyBGaW5kIHRoZSBsZW5ndGhcbiAgdmFyIGxlbmd0aFxuICBpZiAodHlwZSA9PT0gJ251bWJlcicpXG4gICAgbGVuZ3RoID0gc3ViamVjdCA+IDAgPyBzdWJqZWN0ID4+PiAwIDogMFxuICBlbHNlIGlmICh0eXBlID09PSAnc3RyaW5nJykge1xuICAgIGlmIChlbmNvZGluZyA9PT0gJ2Jhc2U2NCcpXG4gICAgICBzdWJqZWN0ID0gYmFzZTY0Y2xlYW4oc3ViamVjdClcbiAgICBsZW5ndGggPSBCdWZmZXIuYnl0ZUxlbmd0aChzdWJqZWN0LCBlbmNvZGluZylcbiAgfSBlbHNlIGlmICh0eXBlID09PSAnb2JqZWN0JyAmJiBzdWJqZWN0ICE9PSBudWxsKSB7IC8vIGFzc3VtZSBvYmplY3QgaXMgYXJyYXktbGlrZVxuICAgIGlmIChzdWJqZWN0LnR5cGUgPT09ICdCdWZmZXInICYmIGlzQXJyYXkoc3ViamVjdC5kYXRhKSlcbiAgICAgIHN1YmplY3QgPSBzdWJqZWN0LmRhdGFcbiAgICBsZW5ndGggPSArc3ViamVjdC5sZW5ndGggPiAwID8gTWF0aC5mbG9vcigrc3ViamVjdC5sZW5ndGgpIDogMFxuICB9IGVsc2VcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdtdXN0IHN0YXJ0IHdpdGggbnVtYmVyLCBidWZmZXIsIGFycmF5IG9yIHN0cmluZycpXG5cbiAgaWYgKHRoaXMubGVuZ3RoID4ga01heExlbmd0aClcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignQXR0ZW1wdCB0byBhbGxvY2F0ZSBCdWZmZXIgbGFyZ2VyIHRoYW4gbWF4aW11bSAnICtcbiAgICAgICdzaXplOiAweCcgKyBrTWF4TGVuZ3RoLnRvU3RyaW5nKDE2KSArICcgYnl0ZXMnKVxuXG4gIHZhciBidWZcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgLy8gUHJlZmVycmVkOiBSZXR1cm4gYW4gYXVnbWVudGVkIGBVaW50OEFycmF5YCBpbnN0YW5jZSBmb3IgYmVzdCBwZXJmb3JtYW5jZVxuICAgIGJ1ZiA9IEJ1ZmZlci5fYXVnbWVudChuZXcgVWludDhBcnJheShsZW5ndGgpKVxuICB9IGVsc2Uge1xuICAgIC8vIEZhbGxiYWNrOiBSZXR1cm4gVEhJUyBpbnN0YW5jZSBvZiBCdWZmZXIgKGNyZWF0ZWQgYnkgYG5ld2ApXG4gICAgYnVmID0gdGhpc1xuICAgIGJ1Zi5sZW5ndGggPSBsZW5ndGhcbiAgICBidWYuX2lzQnVmZmVyID0gdHJ1ZVxuICB9XG5cbiAgdmFyIGlcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUICYmIHR5cGVvZiBzdWJqZWN0LmJ5dGVMZW5ndGggPT09ICdudW1iZXInKSB7XG4gICAgLy8gU3BlZWQgb3B0aW1pemF0aW9uIC0tIHVzZSBzZXQgaWYgd2UncmUgY29weWluZyBmcm9tIGEgdHlwZWQgYXJyYXlcbiAgICBidWYuX3NldChzdWJqZWN0KVxuICB9IGVsc2UgaWYgKGlzQXJyYXlpc2goc3ViamVjdCkpIHtcbiAgICAvLyBUcmVhdCBhcnJheS1pc2ggb2JqZWN0cyBhcyBhIGJ5dGUgYXJyYXlcbiAgICBpZiAoQnVmZmVyLmlzQnVmZmVyKHN1YmplY3QpKSB7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspXG4gICAgICAgIGJ1ZltpXSA9IHN1YmplY3QucmVhZFVJbnQ4KGkpXG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKylcbiAgICAgICAgYnVmW2ldID0gKChzdWJqZWN0W2ldICUgMjU2KSArIDI1NikgJSAyNTZcbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICBidWYud3JpdGUoc3ViamVjdCwgMCwgZW5jb2RpbmcpXG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gJ251bWJlcicgJiYgIUJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUICYmICFub1plcm8pIHtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGJ1ZltpXSA9IDBcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYnVmXG59XG5cbkJ1ZmZlci5pc0J1ZmZlciA9IGZ1bmN0aW9uIChiKSB7XG4gIHJldHVybiAhIShiICE9IG51bGwgJiYgYi5faXNCdWZmZXIpXG59XG5cbkJ1ZmZlci5jb21wYXJlID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoYSkgfHwgIUJ1ZmZlci5pc0J1ZmZlcihiKSlcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudHMgbXVzdCBiZSBCdWZmZXJzJylcblxuICB2YXIgeCA9IGEubGVuZ3RoXG4gIHZhciB5ID0gYi5sZW5ndGhcbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IE1hdGgubWluKHgsIHkpOyBpIDwgbGVuICYmIGFbaV0gPT09IGJbaV07IGkrKykge31cbiAgaWYgKGkgIT09IGxlbikge1xuICAgIHggPSBhW2ldXG4gICAgeSA9IGJbaV1cbiAgfVxuICBpZiAoeCA8IHkpIHJldHVybiAtMVxuICBpZiAoeSA8IHgpIHJldHVybiAxXG4gIHJldHVybiAwXG59XG5cbkJ1ZmZlci5pc0VuY29kaW5nID0gZnVuY3Rpb24gKGVuY29kaW5nKSB7XG4gIHN3aXRjaCAoU3RyaW5nKGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgY2FzZSAnYXNjaWknOlxuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICBjYXNlICdyYXcnOlxuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5CdWZmZXIuY29uY2F0ID0gZnVuY3Rpb24gKGxpc3QsIHRvdGFsTGVuZ3RoKSB7XG4gIGlmICghaXNBcnJheShsaXN0KSkgdGhyb3cgbmV3IFR5cGVFcnJvcignVXNhZ2U6IEJ1ZmZlci5jb25jYXQobGlzdFssIGxlbmd0aF0pJylcblxuICBpZiAobGlzdC5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gbmV3IEJ1ZmZlcigwKVxuICB9IGVsc2UgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgcmV0dXJuIGxpc3RbMF1cbiAgfVxuXG4gIHZhciBpXG4gIGlmICh0b3RhbExlbmd0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdG90YWxMZW5ndGggPSAwXG4gICAgZm9yIChpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRvdGFsTGVuZ3RoICs9IGxpc3RbaV0ubGVuZ3RoXG4gICAgfVxuICB9XG5cbiAgdmFyIGJ1ZiA9IG5ldyBCdWZmZXIodG90YWxMZW5ndGgpXG4gIHZhciBwb3MgPSAwXG4gIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGl0ZW0gPSBsaXN0W2ldXG4gICAgaXRlbS5jb3B5KGJ1ZiwgcG9zKVxuICAgIHBvcyArPSBpdGVtLmxlbmd0aFxuICB9XG4gIHJldHVybiBidWZcbn1cblxuQnVmZmVyLmJ5dGVMZW5ndGggPSBmdW5jdGlvbiAoc3RyLCBlbmNvZGluZykge1xuICB2YXIgcmV0XG4gIHN0ciA9IHN0ciArICcnXG4gIHN3aXRjaCAoZW5jb2RpbmcgfHwgJ3V0ZjgnKSB7XG4gICAgY2FzZSAnYXNjaWknOlxuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgY2FzZSAncmF3JzpcbiAgICAgIHJldCA9IHN0ci5sZW5ndGhcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldCA9IHN0ci5sZW5ndGggKiAyXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2hleCc6XG4gICAgICByZXQgPSBzdHIubGVuZ3RoID4+PiAxXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgIHJldCA9IHV0ZjhUb0J5dGVzKHN0cikubGVuZ3RoXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICByZXQgPSBiYXNlNjRUb0J5dGVzKHN0cikubGVuZ3RoXG4gICAgICBicmVha1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXQgPSBzdHIubGVuZ3RoXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG4vLyBwcmUtc2V0IGZvciB2YWx1ZXMgdGhhdCBtYXkgZXhpc3QgaW4gdGhlIGZ1dHVyZVxuQnVmZmVyLnByb3RvdHlwZS5sZW5ndGggPSB1bmRlZmluZWRcbkJ1ZmZlci5wcm90b3R5cGUucGFyZW50ID0gdW5kZWZpbmVkXG5cbi8vIHRvU3RyaW5nKGVuY29kaW5nLCBzdGFydD0wLCBlbmQ9YnVmZmVyLmxlbmd0aClcbkJ1ZmZlci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoZW5jb2RpbmcsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxvd2VyZWRDYXNlID0gZmFsc2VcblxuICBzdGFydCA9IHN0YXJ0ID4+PiAwXG4gIGVuZCA9IGVuZCA9PT0gdW5kZWZpbmVkIHx8IGVuZCA9PT0gSW5maW5pdHkgPyB0aGlzLmxlbmd0aCA6IGVuZCA+Pj4gMFxuXG4gIGlmICghZW5jb2RpbmcpIGVuY29kaW5nID0gJ3V0ZjgnXG4gIGlmIChzdGFydCA8IDApIHN0YXJ0ID0gMFxuICBpZiAoZW5kID4gdGhpcy5sZW5ndGgpIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmIChlbmQgPD0gc3RhcnQpIHJldHVybiAnJ1xuXG4gIHdoaWxlICh0cnVlKSB7XG4gICAgc3dpdGNoIChlbmNvZGluZykge1xuICAgICAgY2FzZSAnaGV4JzpcbiAgICAgICAgcmV0dXJuIGhleFNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ3V0ZjgnOlxuICAgICAgY2FzZSAndXRmLTgnOlxuICAgICAgICByZXR1cm4gdXRmOFNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgICAgcmV0dXJuIGFzY2lpU2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgICAgcmV0dXJuIGJpbmFyeVNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICAgIHJldHVybiBiYXNlNjRTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICd1Y3MyJzpcbiAgICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgICByZXR1cm4gdXRmMTZsZVNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGlmIChsb3dlcmVkQ2FzZSlcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmtub3duIGVuY29kaW5nOiAnICsgZW5jb2RpbmcpXG4gICAgICAgIGVuY29kaW5nID0gKGVuY29kaW5nICsgJycpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgbG93ZXJlZENhc2UgPSB0cnVlXG4gICAgfVxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24gKGIpIHtcbiAgaWYoIUJ1ZmZlci5pc0J1ZmZlcihiKSkgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnQgbXVzdCBiZSBhIEJ1ZmZlcicpXG4gIHJldHVybiBCdWZmZXIuY29tcGFyZSh0aGlzLCBiKSA9PT0gMFxufVxuXG5CdWZmZXIucHJvdG90eXBlLmluc3BlY3QgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBzdHIgPSAnJ1xuICB2YXIgbWF4ID0gZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFU1xuICBpZiAodGhpcy5sZW5ndGggPiAwKSB7XG4gICAgc3RyID0gdGhpcy50b1N0cmluZygnaGV4JywgMCwgbWF4KS5tYXRjaCgvLnsyfS9nKS5qb2luKCcgJylcbiAgICBpZiAodGhpcy5sZW5ndGggPiBtYXgpXG4gICAgICBzdHIgKz0gJyAuLi4gJ1xuICB9XG4gIHJldHVybiAnPEJ1ZmZlciAnICsgc3RyICsgJz4nXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuY29tcGFyZSA9IGZ1bmN0aW9uIChiKSB7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKGIpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudCBtdXN0IGJlIGEgQnVmZmVyJylcbiAgcmV0dXJuIEJ1ZmZlci5jb21wYXJlKHRoaXMsIGIpXG59XG5cbi8vIGBnZXRgIHdpbGwgYmUgcmVtb3ZlZCBpbiBOb2RlIDAuMTMrXG5CdWZmZXIucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIChvZmZzZXQpIHtcbiAgY29uc29sZS5sb2coJy5nZXQoKSBpcyBkZXByZWNhdGVkLiBBY2Nlc3MgdXNpbmcgYXJyYXkgaW5kZXhlcyBpbnN0ZWFkLicpXG4gIHJldHVybiB0aGlzLnJlYWRVSW50OChvZmZzZXQpXG59XG5cbi8vIGBzZXRgIHdpbGwgYmUgcmVtb3ZlZCBpbiBOb2RlIDAuMTMrXG5CdWZmZXIucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uICh2LCBvZmZzZXQpIHtcbiAgY29uc29sZS5sb2coJy5zZXQoKSBpcyBkZXByZWNhdGVkLiBBY2Nlc3MgdXNpbmcgYXJyYXkgaW5kZXhlcyBpbnN0ZWFkLicpXG4gIHJldHVybiB0aGlzLndyaXRlVUludDgodiwgb2Zmc2V0KVxufVxuXG5mdW5jdGlvbiBoZXhXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIG9mZnNldCA9IE51bWJlcihvZmZzZXQpIHx8IDBcbiAgdmFyIHJlbWFpbmluZyA9IGJ1Zi5sZW5ndGggLSBvZmZzZXRcbiAgaWYgKCFsZW5ndGgpIHtcbiAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgfSBlbHNlIHtcbiAgICBsZW5ndGggPSBOdW1iZXIobGVuZ3RoKVxuICAgIGlmIChsZW5ndGggPiByZW1haW5pbmcpIHtcbiAgICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICAgIH1cbiAgfVxuXG4gIC8vIG11c3QgYmUgYW4gZXZlbiBudW1iZXIgb2YgZGlnaXRzXG4gIHZhciBzdHJMZW4gPSBzdHJpbmcubGVuZ3RoXG4gIGlmIChzdHJMZW4gJSAyICE9PSAwKSB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgaGV4IHN0cmluZycpXG5cbiAgaWYgKGxlbmd0aCA+IHN0ckxlbiAvIDIpIHtcbiAgICBsZW5ndGggPSBzdHJMZW4gLyAyXG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIHZhciBieXRlID0gcGFyc2VJbnQoc3RyaW5nLnN1YnN0cihpICogMiwgMiksIDE2KVxuICAgIGlmIChpc05hTihieXRlKSkgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGhleCBzdHJpbmcnKVxuICAgIGJ1ZltvZmZzZXQgKyBpXSA9IGJ5dGVcbiAgfVxuICByZXR1cm4gaVxufVxuXG5mdW5jdGlvbiB1dGY4V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gYmxpdEJ1ZmZlcih1dGY4VG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbmZ1bmN0aW9uIGFzY2lpV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gYmxpdEJ1ZmZlcihhc2NpaVRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5mdW5jdGlvbiBiaW5hcnlXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBhc2NpaVdyaXRlKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gYmFzZTY0V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gYmxpdEJ1ZmZlcihiYXNlNjRUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cbn1cblxuZnVuY3Rpb24gdXRmMTZsZVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IGJsaXRCdWZmZXIodXRmMTZsZVRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aCwgMilcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24gKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgsIGVuY29kaW5nKSB7XG4gIC8vIFN1cHBvcnQgYm90aCAoc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCwgZW5jb2RpbmcpXG4gIC8vIGFuZCB0aGUgbGVnYWN5IChzdHJpbmcsIGVuY29kaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgaWYgKGlzRmluaXRlKG9mZnNldCkpIHtcbiAgICBpZiAoIWlzRmluaXRlKGxlbmd0aCkpIHtcbiAgICAgIGVuY29kaW5nID0gbGVuZ3RoXG4gICAgICBsZW5ndGggPSB1bmRlZmluZWRcbiAgICB9XG4gIH0gZWxzZSB7ICAvLyBsZWdhY3lcbiAgICB2YXIgc3dhcCA9IGVuY29kaW5nXG4gICAgZW5jb2RpbmcgPSBvZmZzZXRcbiAgICBvZmZzZXQgPSBsZW5ndGhcbiAgICBsZW5ndGggPSBzd2FwXG4gIH1cblxuICBvZmZzZXQgPSBOdW1iZXIob2Zmc2V0KSB8fCAwXG4gIHZhciByZW1haW5pbmcgPSB0aGlzLmxlbmd0aCAtIG9mZnNldFxuICBpZiAoIWxlbmd0aCkge1xuICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICB9IGVsc2Uge1xuICAgIGxlbmd0aCA9IE51bWJlcihsZW5ndGgpXG4gICAgaWYgKGxlbmd0aCA+IHJlbWFpbmluZykge1xuICAgICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gICAgfVxuICB9XG4gIGVuY29kaW5nID0gU3RyaW5nKGVuY29kaW5nIHx8ICd1dGY4JykudG9Mb3dlckNhc2UoKVxuXG4gIHZhciByZXRcbiAgc3dpdGNoIChlbmNvZGluZykge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgICByZXQgPSBoZXhXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgICByZXQgPSB1dGY4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYXNjaWknOlxuICAgICAgcmV0ID0gYXNjaWlXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiaW5hcnknOlxuICAgICAgcmV0ID0gYmluYXJ5V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgIHJldCA9IGJhc2U2NFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXQgPSB1dGYxNmxlV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1Vua25vd24gZW5jb2Rpbmc6ICcgKyBlbmNvZGluZylcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdCdWZmZXInLFxuICAgIGRhdGE6IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHRoaXMuX2FyciB8fCB0aGlzLCAwKVxuICB9XG59XG5cbmZ1bmN0aW9uIGJhc2U2NFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgaWYgKHN0YXJ0ID09PSAwICYmIGVuZCA9PT0gYnVmLmxlbmd0aCkge1xuICAgIHJldHVybiBiYXNlNjQuZnJvbUJ5dGVBcnJheShidWYpXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1Zi5zbGljZShzdGFydCwgZW5kKSlcbiAgfVxufVxuXG5mdW5jdGlvbiB1dGY4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgcmVzID0gJydcbiAgdmFyIHRtcCA9ICcnXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIGlmIChidWZbaV0gPD0gMHg3Rikge1xuICAgICAgcmVzICs9IGRlY29kZVV0ZjhDaGFyKHRtcCkgKyBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSlcbiAgICAgIHRtcCA9ICcnXG4gICAgfSBlbHNlIHtcbiAgICAgIHRtcCArPSAnJScgKyBidWZbaV0udG9TdHJpbmcoMTYpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlcyArIGRlY29kZVV0ZjhDaGFyKHRtcClcbn1cblxuZnVuY3Rpb24gYXNjaWlTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciByZXQgPSAnJ1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICByZXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0pXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5mdW5jdGlvbiBiaW5hcnlTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHJldHVybiBhc2NpaVNsaWNlKGJ1Ziwgc3RhcnQsIGVuZClcbn1cblxuZnVuY3Rpb24gaGV4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuXG4gIGlmICghc3RhcnQgfHwgc3RhcnQgPCAwKSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgfHwgZW5kIDwgMCB8fCBlbmQgPiBsZW4pIGVuZCA9IGxlblxuXG4gIHZhciBvdXQgPSAnJ1xuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIG91dCArPSB0b0hleChidWZbaV0pXG4gIH1cbiAgcmV0dXJuIG91dFxufVxuXG5mdW5jdGlvbiB1dGYxNmxlU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgYnl0ZXMgPSBidWYuc2xpY2Uoc3RhcnQsIGVuZClcbiAgdmFyIHJlcyA9ICcnXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICByZXMgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXSArIGJ5dGVzW2kgKyAxXSAqIDI1NilcbiAgfVxuICByZXR1cm4gcmVzXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuc2xpY2UgPSBmdW5jdGlvbiAoc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgc3RhcnQgPSB+fnN0YXJ0XG4gIGVuZCA9IGVuZCA9PT0gdW5kZWZpbmVkID8gbGVuIDogfn5lbmRcblxuICBpZiAoc3RhcnQgPCAwKSB7XG4gICAgc3RhcnQgKz0gbGVuO1xuICAgIGlmIChzdGFydCA8IDApXG4gICAgICBzdGFydCA9IDBcbiAgfSBlbHNlIGlmIChzdGFydCA+IGxlbikge1xuICAgIHN0YXJ0ID0gbGVuXG4gIH1cblxuICBpZiAoZW5kIDwgMCkge1xuICAgIGVuZCArPSBsZW5cbiAgICBpZiAoZW5kIDwgMClcbiAgICAgIGVuZCA9IDBcbiAgfSBlbHNlIGlmIChlbmQgPiBsZW4pIHtcbiAgICBlbmQgPSBsZW5cbiAgfVxuXG4gIGlmIChlbmQgPCBzdGFydClcbiAgICBlbmQgPSBzdGFydFxuXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHJldHVybiBCdWZmZXIuX2F1Z21lbnQodGhpcy5zdWJhcnJheShzdGFydCwgZW5kKSlcbiAgfSBlbHNlIHtcbiAgICB2YXIgc2xpY2VMZW4gPSBlbmQgLSBzdGFydFxuICAgIHZhciBuZXdCdWYgPSBuZXcgQnVmZmVyKHNsaWNlTGVuLCB1bmRlZmluZWQsIHRydWUpXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzbGljZUxlbjsgaSsrKSB7XG4gICAgICBuZXdCdWZbaV0gPSB0aGlzW2kgKyBzdGFydF1cbiAgICB9XG4gICAgcmV0dXJuIG5ld0J1ZlxuICB9XG59XG5cbi8qXG4gKiBOZWVkIHRvIG1ha2Ugc3VyZSB0aGF0IGJ1ZmZlciBpc24ndCB0cnlpbmcgdG8gd3JpdGUgb3V0IG9mIGJvdW5kcy5cbiAqL1xuZnVuY3Rpb24gY2hlY2tPZmZzZXQgKG9mZnNldCwgZXh0LCBsZW5ndGgpIHtcbiAgaWYgKChvZmZzZXQgJSAxKSAhPT0gMCB8fCBvZmZzZXQgPCAwKVxuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdvZmZzZXQgaXMgbm90IHVpbnQnKVxuICBpZiAob2Zmc2V0ICsgZXh0ID4gbGVuZ3RoKVxuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdUcnlpbmcgdG8gYWNjZXNzIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDggPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KVxuICAgIGNoZWNrT2Zmc2V0KG9mZnNldCwgMSwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiB0aGlzW29mZnNldF1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2TEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KVxuICAgIGNoZWNrT2Zmc2V0KG9mZnNldCwgMiwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiB0aGlzW29mZnNldF0gfCAodGhpc1tvZmZzZXQgKyAxXSA8PCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpXG4gICAgY2hlY2tPZmZzZXQob2Zmc2V0LCAyLCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuICh0aGlzW29mZnNldF0gPDwgOCkgfCB0aGlzW29mZnNldCArIDFdXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydClcbiAgICBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuXG4gIHJldHVybiAoKHRoaXNbb2Zmc2V0XSkgfFxuICAgICAgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgOCkgfFxuICAgICAgKHRoaXNbb2Zmc2V0ICsgMl0gPDwgMTYpKSArXG4gICAgICAodGhpc1tvZmZzZXQgKyAzXSAqIDB4MTAwMDAwMClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyQkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KVxuICAgIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICh0aGlzW29mZnNldF0gKiAweDEwMDAwMDApICtcbiAgICAgICgodGhpc1tvZmZzZXQgKyAxXSA8PCAxNikgfFxuICAgICAgKHRoaXNbb2Zmc2V0ICsgMl0gPDwgOCkgfFxuICAgICAgdGhpc1tvZmZzZXQgKyAzXSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50OCA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpXG4gICAgY2hlY2tPZmZzZXQob2Zmc2V0LCAxLCB0aGlzLmxlbmd0aClcbiAgaWYgKCEodGhpc1tvZmZzZXRdICYgMHg4MCkpXG4gICAgcmV0dXJuICh0aGlzW29mZnNldF0pXG4gIHJldHVybiAoKDB4ZmYgLSB0aGlzW29mZnNldF0gKyAxKSAqIC0xKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydClcbiAgICBjaGVja09mZnNldChvZmZzZXQsIDIsIHRoaXMubGVuZ3RoKVxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXRdIHwgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgOClcbiAgcmV0dXJuICh2YWwgJiAweDgwMDApID8gdmFsIHwgMHhGRkZGMDAwMCA6IHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydClcbiAgICBjaGVja09mZnNldChvZmZzZXQsIDIsIHRoaXMubGVuZ3RoKVxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXQgKyAxXSB8ICh0aGlzW29mZnNldF0gPDwgOClcbiAgcmV0dXJuICh2YWwgJiAweDgwMDApID8gdmFsIHwgMHhGRkZGMDAwMCA6IHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydClcbiAgICBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuXG4gIHJldHVybiAodGhpc1tvZmZzZXRdKSB8XG4gICAgICAodGhpc1tvZmZzZXQgKyAxXSA8PCA4KSB8XG4gICAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCAxNikgfFxuICAgICAgKHRoaXNbb2Zmc2V0ICsgM10gPDwgMjQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyQkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KVxuICAgIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICh0aGlzW29mZnNldF0gPDwgMjQpIHxcbiAgICAgICh0aGlzW29mZnNldCArIDFdIDw8IDE2KSB8XG4gICAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCA4KSB8XG4gICAgICAodGhpc1tvZmZzZXQgKyAzXSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpXG4gICAgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIHRydWUsIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdEJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydClcbiAgICBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gaWVlZTc1NC5yZWFkKHRoaXMsIG9mZnNldCwgZmFsc2UsIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpXG4gICAgY2hlY2tPZmZzZXQob2Zmc2V0LCA4LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIHRydWUsIDUyLCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpXG4gICAgY2hlY2tPZmZzZXQob2Zmc2V0LCA4LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIGZhbHNlLCA1MiwgOClcbn1cblxuZnVuY3Rpb24gY2hlY2tJbnQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgZXh0LCBtYXgsIG1pbikge1xuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihidWYpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdidWZmZXIgbXVzdCBiZSBhIEJ1ZmZlciBpbnN0YW5jZScpXG4gIGlmICh2YWx1ZSA+IG1heCB8fCB2YWx1ZSA8IG1pbikgdGhyb3cgbmV3IFR5cGVFcnJvcigndmFsdWUgaXMgb3V0IG9mIGJvdW5kcycpXG4gIGlmIChvZmZzZXQgKyBleHQgPiBidWYubGVuZ3RoKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdpbmRleCBvdXQgb2YgcmFuZ2UnKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDggPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMSwgMHhmZiwgMClcbiAgaWYgKCFCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkgdmFsdWUgPSBNYXRoLmZsb29yKHZhbHVlKVxuICB0aGlzW29mZnNldF0gPSB2YWx1ZVxuICByZXR1cm4gb2Zmc2V0ICsgMVxufVxuXG5mdW5jdGlvbiBvYmplY3RXcml0ZVVJbnQxNiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4pIHtcbiAgaWYgKHZhbHVlIDwgMCkgdmFsdWUgPSAweGZmZmYgKyB2YWx1ZSArIDFcbiAgZm9yICh2YXIgaSA9IDAsIGogPSBNYXRoLm1pbihidWYubGVuZ3RoIC0gb2Zmc2V0LCAyKTsgaSA8IGo7IGkrKykge1xuICAgIGJ1ZltvZmZzZXQgKyBpXSA9ICh2YWx1ZSAmICgweGZmIDw8ICg4ICogKGxpdHRsZUVuZGlhbiA/IGkgOiAxIC0gaSkpKSkgPj4+XG4gICAgICAobGl0dGxlRW5kaWFuID8gaSA6IDEgLSBpKSAqIDhcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2TEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMiwgMHhmZmZmLCAwKVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldF0gPSB2YWx1ZVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gIH0gZWxzZSBvYmplY3RXcml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlKVxuICByZXR1cm4gb2Zmc2V0ICsgMlxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2QkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMiwgMHhmZmZmLCAwKVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldF0gPSAodmFsdWUgPj4+IDgpXG4gICAgdGhpc1tvZmZzZXQgKyAxXSA9IHZhbHVlXG4gIH0gZWxzZSBvYmplY3RXcml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSlcbiAgcmV0dXJuIG9mZnNldCArIDJcbn1cblxuZnVuY3Rpb24gb2JqZWN0V3JpdGVVSW50MzIgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuKSB7XG4gIGlmICh2YWx1ZSA8IDApIHZhbHVlID0gMHhmZmZmZmZmZiArIHZhbHVlICsgMVxuICBmb3IgKHZhciBpID0gMCwgaiA9IE1hdGgubWluKGJ1Zi5sZW5ndGggLSBvZmZzZXQsIDQpOyBpIDwgajsgaSsrKSB7XG4gICAgYnVmW29mZnNldCArIGldID0gKHZhbHVlID4+PiAobGl0dGxlRW5kaWFuID8gaSA6IDMgLSBpKSAqIDgpICYgMHhmZlxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydClcbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweGZmZmZmZmZmLCAwKVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldCArIDNdID0gKHZhbHVlID4+PiAyNClcbiAgICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiAxNilcbiAgICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiA4KVxuICAgIHRoaXNbb2Zmc2V0XSA9IHZhbHVlXG4gIH0gZWxzZSBvYmplY3RXcml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlKVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyQkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgNCwgMHhmZmZmZmZmZiwgMClcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgdGhpc1tvZmZzZXRdID0gKHZhbHVlID4+PiAyNClcbiAgICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiAxNilcbiAgICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiA4KVxuICAgIHRoaXNbb2Zmc2V0ICsgM10gPSB2YWx1ZVxuICB9IGVsc2Ugb2JqZWN0V3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UpXG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQ4ID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KVxuICAgIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDEsIDB4N2YsIC0weDgwKVxuICBpZiAoIUJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB2YWx1ZSA9IE1hdGguZmxvb3IodmFsdWUpXG4gIGlmICh2YWx1ZSA8IDApIHZhbHVlID0gMHhmZiArIHZhbHVlICsgMVxuICB0aGlzW29mZnNldF0gPSB2YWx1ZVxuICByZXR1cm4gb2Zmc2V0ICsgMVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydClcbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAyLCAweDdmZmYsIC0weDgwMDApXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXNbb2Zmc2V0XSA9IHZhbHVlXG4gICAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gOClcbiAgfSBlbHNlIG9iamVjdFdyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUpXG4gIHJldHVybiBvZmZzZXQgKyAyXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KVxuICAgIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDIsIDB4N2ZmZiwgLTB4ODAwMClcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgdGhpc1tvZmZzZXRdID0gKHZhbHVlID4+PiA4KVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSB2YWx1ZVxuICB9IGVsc2Ugb2JqZWN0V3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UpXG4gIHJldHVybiBvZmZzZXQgKyAyXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KVxuICAgIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDQsIDB4N2ZmZmZmZmYsIC0weDgwMDAwMDAwKVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldF0gPSB2YWx1ZVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gICAgdGhpc1tvZmZzZXQgKyAyXSA9ICh2YWx1ZSA+Pj4gMTYpXG4gICAgdGhpc1tvZmZzZXQgKyAzXSA9ICh2YWx1ZSA+Pj4gMjQpXG4gIH0gZWxzZSBvYmplY3RXcml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlKVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MzJCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydClcbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweDdmZmZmZmZmLCAtMHg4MDAwMDAwMClcbiAgaWYgKHZhbHVlIDwgMCkgdmFsdWUgPSAweGZmZmZmZmZmICsgdmFsdWUgKyAxXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gMjQpXG4gICAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gMTYpXG4gICAgdGhpc1tvZmZzZXQgKyAyXSA9ICh2YWx1ZSA+Pj4gOClcbiAgICB0aGlzW29mZnNldCArIDNdID0gdmFsdWVcbiAgfSBlbHNlIG9iamVjdFdyaXRlVUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlKVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5mdW5jdGlvbiBjaGVja0lFRUU3NTQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgZXh0LCBtYXgsIG1pbikge1xuICBpZiAodmFsdWUgPiBtYXggfHwgdmFsdWUgPCBtaW4pIHRocm93IG5ldyBUeXBlRXJyb3IoJ3ZhbHVlIGlzIG91dCBvZiBib3VuZHMnKVxuICBpZiAob2Zmc2V0ICsgZXh0ID4gYnVmLmxlbmd0aCkgdGhyb3cgbmV3IFR5cGVFcnJvcignaW5kZXggb3V0IG9mIHJhbmdlJylcbn1cblxuZnVuY3Rpb24gd3JpdGVGbG9hdCAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpXG4gICAgY2hlY2tJRUVFNzU0KGJ1ZiwgdmFsdWUsIG9mZnNldCwgNCwgMy40MDI4MjM0NjYzODUyODg2ZSszOCwgLTMuNDAyODIzNDY2Mzg1Mjg4NmUrMzgpXG4gIGllZWU3NTQud3JpdGUoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDIzLCA0KVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRmxvYXRMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVGbG9hdCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0QkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHdyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiB3cml0ZURvdWJsZSAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpXG4gICAgY2hlY2tJRUVFNzU0KGJ1ZiwgdmFsdWUsIG9mZnNldCwgOCwgMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgsIC0xLjc5NzY5MzEzNDg2MjMxNTdFKzMwOClcbiAgaWVlZTc1NC53cml0ZShidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgNTIsIDgpXG4gIHJldHVybiBvZmZzZXQgKyA4XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVEb3VibGVMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVEb3VibGVCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG4vLyBjb3B5KHRhcmdldEJ1ZmZlciwgdGFyZ2V0U3RhcnQ9MCwgc291cmNlU3RhcnQ9MCwgc291cmNlRW5kPWJ1ZmZlci5sZW5ndGgpXG5CdWZmZXIucHJvdG90eXBlLmNvcHkgPSBmdW5jdGlvbiAodGFyZ2V0LCB0YXJnZXRfc3RhcnQsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHNvdXJjZSA9IHRoaXNcblxuICBpZiAoIXN0YXJ0KSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgJiYgZW5kICE9PSAwKSBlbmQgPSB0aGlzLmxlbmd0aFxuICBpZiAoIXRhcmdldF9zdGFydCkgdGFyZ2V0X3N0YXJ0ID0gMFxuXG4gIC8vIENvcHkgMCBieXRlczsgd2UncmUgZG9uZVxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuXG4gIGlmICh0YXJnZXQubGVuZ3RoID09PSAwIHx8IHNvdXJjZS5sZW5ndGggPT09IDApIHJldHVyblxuXG4gIC8vIEZhdGFsIGVycm9yIGNvbmRpdGlvbnNcbiAgaWYgKGVuZCA8IHN0YXJ0KSB0aHJvdyBuZXcgVHlwZUVycm9yKCdzb3VyY2VFbmQgPCBzb3VyY2VTdGFydCcpXG4gIGlmICh0YXJnZXRfc3RhcnQgPCAwIHx8IHRhcmdldF9zdGFydCA+PSB0YXJnZXQubGVuZ3RoKVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3RhcmdldFN0YXJ0IG91dCBvZiBib3VuZHMnKVxuICBpZiAoc3RhcnQgPCAwIHx8IHN0YXJ0ID49IHNvdXJjZS5sZW5ndGgpIHRocm93IG5ldyBUeXBlRXJyb3IoJ3NvdXJjZVN0YXJ0IG91dCBvZiBib3VuZHMnKVxuICBpZiAoZW5kIDwgMCB8fCBlbmQgPiBzb3VyY2UubGVuZ3RoKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdzb3VyY2VFbmQgb3V0IG9mIGJvdW5kcycpXG5cbiAgLy8gQXJlIHdlIG9vYj9cbiAgaWYgKGVuZCA+IHRoaXMubGVuZ3RoKVxuICAgIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICh0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0X3N0YXJ0IDwgZW5kIC0gc3RhcnQpXG4gICAgZW5kID0gdGFyZ2V0Lmxlbmd0aCAtIHRhcmdldF9zdGFydCArIHN0YXJ0XG5cbiAgdmFyIGxlbiA9IGVuZCAtIHN0YXJ0XG5cbiAgaWYgKGxlbiA8IDEwMDAgfHwgIUJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgdGFyZ2V0W2kgKyB0YXJnZXRfc3RhcnRdID0gdGhpc1tpICsgc3RhcnRdXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHRhcmdldC5fc2V0KHRoaXMuc3ViYXJyYXkoc3RhcnQsIHN0YXJ0ICsgbGVuKSwgdGFyZ2V0X3N0YXJ0KVxuICB9XG59XG5cbi8vIGZpbGwodmFsdWUsIHN0YXJ0PTAsIGVuZD1idWZmZXIubGVuZ3RoKVxuQnVmZmVyLnByb3RvdHlwZS5maWxsID0gZnVuY3Rpb24gKHZhbHVlLCBzdGFydCwgZW5kKSB7XG4gIGlmICghdmFsdWUpIHZhbHVlID0gMFxuICBpZiAoIXN0YXJ0KSBzdGFydCA9IDBcbiAgaWYgKCFlbmQpIGVuZCA9IHRoaXMubGVuZ3RoXG5cbiAgaWYgKGVuZCA8IHN0YXJ0KSB0aHJvdyBuZXcgVHlwZUVycm9yKCdlbmQgPCBzdGFydCcpXG5cbiAgLy8gRmlsbCAwIGJ5dGVzOyB3ZSdyZSBkb25lXG4gIGlmIChlbmQgPT09IHN0YXJ0KSByZXR1cm5cbiAgaWYgKHRoaXMubGVuZ3RoID09PSAwKSByZXR1cm5cblxuICBpZiAoc3RhcnQgPCAwIHx8IHN0YXJ0ID49IHRoaXMubGVuZ3RoKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdzdGFydCBvdXQgb2YgYm91bmRzJylcbiAgaWYgKGVuZCA8IDAgfHwgZW5kID4gdGhpcy5sZW5ndGgpIHRocm93IG5ldyBUeXBlRXJyb3IoJ2VuZCBvdXQgb2YgYm91bmRzJylcblxuICB2YXIgaVxuICBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xuICAgIGZvciAoaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICAgIHRoaXNbaV0gPSB2YWx1ZVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB2YXIgYnl0ZXMgPSB1dGY4VG9CeXRlcyh2YWx1ZS50b1N0cmluZygpKVxuICAgIHZhciBsZW4gPSBieXRlcy5sZW5ndGhcbiAgICBmb3IgKGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgICB0aGlzW2ldID0gYnl0ZXNbaSAlIGxlbl1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpc1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgYEFycmF5QnVmZmVyYCB3aXRoIHRoZSAqY29waWVkKiBtZW1vcnkgb2YgdGhlIGJ1ZmZlciBpbnN0YW5jZS5cbiAqIEFkZGVkIGluIE5vZGUgMC4xMi4gT25seSBhdmFpbGFibGUgaW4gYnJvd3NlcnMgdGhhdCBzdXBwb3J0IEFycmF5QnVmZmVyLlxuICovXG5CdWZmZXIucHJvdG90eXBlLnRvQXJyYXlCdWZmZXIgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICAgIHJldHVybiAobmV3IEJ1ZmZlcih0aGlzKSkuYnVmZmVyXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBidWYgPSBuZXcgVWludDhBcnJheSh0aGlzLmxlbmd0aClcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBidWYubGVuZ3RoOyBpIDwgbGVuOyBpICs9IDEpIHtcbiAgICAgICAgYnVmW2ldID0gdGhpc1tpXVxuICAgICAgfVxuICAgICAgcmV0dXJuIGJ1Zi5idWZmZXJcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQnVmZmVyLnRvQXJyYXlCdWZmZXIgbm90IHN1cHBvcnRlZCBpbiB0aGlzIGJyb3dzZXInKVxuICB9XG59XG5cbi8vIEhFTFBFUiBGVU5DVElPTlNcbi8vID09PT09PT09PT09PT09PT1cblxudmFyIEJQID0gQnVmZmVyLnByb3RvdHlwZVxuXG4vKipcbiAqIEF1Z21lbnQgYSBVaW50OEFycmF5ICppbnN0YW5jZSogKG5vdCB0aGUgVWludDhBcnJheSBjbGFzcyEpIHdpdGggQnVmZmVyIG1ldGhvZHNcbiAqL1xuQnVmZmVyLl9hdWdtZW50ID0gZnVuY3Rpb24gKGFycikge1xuICBhcnIuY29uc3RydWN0b3IgPSBCdWZmZXJcbiAgYXJyLl9pc0J1ZmZlciA9IHRydWVcblxuICAvLyBzYXZlIHJlZmVyZW5jZSB0byBvcmlnaW5hbCBVaW50OEFycmF5IGdldC9zZXQgbWV0aG9kcyBiZWZvcmUgb3ZlcndyaXRpbmdcbiAgYXJyLl9nZXQgPSBhcnIuZ2V0XG4gIGFyci5fc2V0ID0gYXJyLnNldFxuXG4gIC8vIGRlcHJlY2F0ZWQsIHdpbGwgYmUgcmVtb3ZlZCBpbiBub2RlIDAuMTMrXG4gIGFyci5nZXQgPSBCUC5nZXRcbiAgYXJyLnNldCA9IEJQLnNldFxuXG4gIGFyci53cml0ZSA9IEJQLndyaXRlXG4gIGFyci50b1N0cmluZyA9IEJQLnRvU3RyaW5nXG4gIGFyci50b0xvY2FsZVN0cmluZyA9IEJQLnRvU3RyaW5nXG4gIGFyci50b0pTT04gPSBCUC50b0pTT05cbiAgYXJyLmVxdWFscyA9IEJQLmVxdWFsc1xuICBhcnIuY29tcGFyZSA9IEJQLmNvbXBhcmVcbiAgYXJyLmNvcHkgPSBCUC5jb3B5XG4gIGFyci5zbGljZSA9IEJQLnNsaWNlXG4gIGFyci5yZWFkVUludDggPSBCUC5yZWFkVUludDhcbiAgYXJyLnJlYWRVSW50MTZMRSA9IEJQLnJlYWRVSW50MTZMRVxuICBhcnIucmVhZFVJbnQxNkJFID0gQlAucmVhZFVJbnQxNkJFXG4gIGFyci5yZWFkVUludDMyTEUgPSBCUC5yZWFkVUludDMyTEVcbiAgYXJyLnJlYWRVSW50MzJCRSA9IEJQLnJlYWRVSW50MzJCRVxuICBhcnIucmVhZEludDggPSBCUC5yZWFkSW50OFxuICBhcnIucmVhZEludDE2TEUgPSBCUC5yZWFkSW50MTZMRVxuICBhcnIucmVhZEludDE2QkUgPSBCUC5yZWFkSW50MTZCRVxuICBhcnIucmVhZEludDMyTEUgPSBCUC5yZWFkSW50MzJMRVxuICBhcnIucmVhZEludDMyQkUgPSBCUC5yZWFkSW50MzJCRVxuICBhcnIucmVhZEZsb2F0TEUgPSBCUC5yZWFkRmxvYXRMRVxuICBhcnIucmVhZEZsb2F0QkUgPSBCUC5yZWFkRmxvYXRCRVxuICBhcnIucmVhZERvdWJsZUxFID0gQlAucmVhZERvdWJsZUxFXG4gIGFyci5yZWFkRG91YmxlQkUgPSBCUC5yZWFkRG91YmxlQkVcbiAgYXJyLndyaXRlVUludDggPSBCUC53cml0ZVVJbnQ4XG4gIGFyci53cml0ZVVJbnQxNkxFID0gQlAud3JpdGVVSW50MTZMRVxuICBhcnIud3JpdGVVSW50MTZCRSA9IEJQLndyaXRlVUludDE2QkVcbiAgYXJyLndyaXRlVUludDMyTEUgPSBCUC53cml0ZVVJbnQzMkxFXG4gIGFyci53cml0ZVVJbnQzMkJFID0gQlAud3JpdGVVSW50MzJCRVxuICBhcnIud3JpdGVJbnQ4ID0gQlAud3JpdGVJbnQ4XG4gIGFyci53cml0ZUludDE2TEUgPSBCUC53cml0ZUludDE2TEVcbiAgYXJyLndyaXRlSW50MTZCRSA9IEJQLndyaXRlSW50MTZCRVxuICBhcnIud3JpdGVJbnQzMkxFID0gQlAud3JpdGVJbnQzMkxFXG4gIGFyci53cml0ZUludDMyQkUgPSBCUC53cml0ZUludDMyQkVcbiAgYXJyLndyaXRlRmxvYXRMRSA9IEJQLndyaXRlRmxvYXRMRVxuICBhcnIud3JpdGVGbG9hdEJFID0gQlAud3JpdGVGbG9hdEJFXG4gIGFyci53cml0ZURvdWJsZUxFID0gQlAud3JpdGVEb3VibGVMRVxuICBhcnIud3JpdGVEb3VibGVCRSA9IEJQLndyaXRlRG91YmxlQkVcbiAgYXJyLmZpbGwgPSBCUC5maWxsXG4gIGFyci5pbnNwZWN0ID0gQlAuaW5zcGVjdFxuICBhcnIudG9BcnJheUJ1ZmZlciA9IEJQLnRvQXJyYXlCdWZmZXJcblxuICByZXR1cm4gYXJyXG59XG5cbnZhciBJTlZBTElEX0JBU0U2NF9SRSA9IC9bXitcXC8wLTlBLXpdL2dcblxuZnVuY3Rpb24gYmFzZTY0Y2xlYW4gKHN0cikge1xuICAvLyBOb2RlIHN0cmlwcyBvdXQgaW52YWxpZCBjaGFyYWN0ZXJzIGxpa2UgXFxuIGFuZCBcXHQgZnJvbSB0aGUgc3RyaW5nLCBiYXNlNjQtanMgZG9lcyBub3RcbiAgc3RyID0gc3RyaW5ndHJpbShzdHIpLnJlcGxhY2UoSU5WQUxJRF9CQVNFNjRfUkUsICcnKVxuICAvLyBOb2RlIGFsbG93cyBmb3Igbm9uLXBhZGRlZCBiYXNlNjQgc3RyaW5ncyAobWlzc2luZyB0cmFpbGluZyA9PT0pLCBiYXNlNjQtanMgZG9lcyBub3RcbiAgd2hpbGUgKHN0ci5sZW5ndGggJSA0ICE9PSAwKSB7XG4gICAgc3RyID0gc3RyICsgJz0nXG4gIH1cbiAgcmV0dXJuIHN0clxufVxuXG5mdW5jdGlvbiBzdHJpbmd0cmltIChzdHIpIHtcbiAgaWYgKHN0ci50cmltKSByZXR1cm4gc3RyLnRyaW0oKVxuICByZXR1cm4gc3RyLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKVxufVxuXG5mdW5jdGlvbiBpc0FycmF5aXNoIChzdWJqZWN0KSB7XG4gIHJldHVybiBpc0FycmF5KHN1YmplY3QpIHx8IEJ1ZmZlci5pc0J1ZmZlcihzdWJqZWN0KSB8fFxuICAgICAgc3ViamVjdCAmJiB0eXBlb2Ygc3ViamVjdCA9PT0gJ29iamVjdCcgJiZcbiAgICAgIHR5cGVvZiBzdWJqZWN0Lmxlbmd0aCA9PT0gJ251bWJlcidcbn1cblxuZnVuY3Rpb24gdG9IZXggKG4pIHtcbiAgaWYgKG4gPCAxNikgcmV0dXJuICcwJyArIG4udG9TdHJpbmcoMTYpXG4gIHJldHVybiBuLnRvU3RyaW5nKDE2KVxufVxuXG5mdW5jdGlvbiB1dGY4VG9CeXRlcyAoc3RyKSB7XG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgIHZhciBiID0gc3RyLmNoYXJDb2RlQXQoaSlcbiAgICBpZiAoYiA8PSAweDdGKSB7XG4gICAgICBieXRlQXJyYXkucHVzaChiKVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgc3RhcnQgPSBpXG4gICAgICBpZiAoYiA+PSAweEQ4MDAgJiYgYiA8PSAweERGRkYpIGkrK1xuICAgICAgdmFyIGggPSBlbmNvZGVVUklDb21wb25lbnQoc3RyLnNsaWNlKHN0YXJ0LCBpKzEpKS5zdWJzdHIoMSkuc3BsaXQoJyUnKVxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBoLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIGJ5dGVBcnJheS5wdXNoKHBhcnNlSW50KGhbal0sIDE2KSlcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiBhc2NpaVRvQnl0ZXMgKHN0cikge1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICAvLyBOb2RlJ3MgY29kZSBzZWVtcyB0byBiZSBkb2luZyB0aGlzIGFuZCBub3QgJiAweDdGLi5cbiAgICBieXRlQXJyYXkucHVzaChzdHIuY2hhckNvZGVBdChpKSAmIDB4RkYpXG4gIH1cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiB1dGYxNmxlVG9CeXRlcyAoc3RyKSB7XG4gIHZhciBjLCBoaSwgbG9cbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgYyA9IHN0ci5jaGFyQ29kZUF0KGkpXG4gICAgaGkgPSBjID4+IDhcbiAgICBsbyA9IGMgJSAyNTZcbiAgICBieXRlQXJyYXkucHVzaChsbylcbiAgICBieXRlQXJyYXkucHVzaChoaSlcbiAgfVxuXG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gYmFzZTY0VG9CeXRlcyAoc3RyKSB7XG4gIHJldHVybiBiYXNlNjQudG9CeXRlQXJyYXkoc3RyKVxufVxuXG5mdW5jdGlvbiBibGl0QnVmZmVyIChzcmMsIGRzdCwgb2Zmc2V0LCBsZW5ndGgsIHVuaXRTaXplKSB7XG4gIGlmICh1bml0U2l6ZSkgbGVuZ3RoIC09IGxlbmd0aCAlIHVuaXRTaXplO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKChpICsgb2Zmc2V0ID49IGRzdC5sZW5ndGgpIHx8IChpID49IHNyYy5sZW5ndGgpKVxuICAgICAgYnJlYWtcbiAgICBkc3RbaSArIG9mZnNldF0gPSBzcmNbaV1cbiAgfVxuICByZXR1cm4gaVxufVxuXG5mdW5jdGlvbiBkZWNvZGVVdGY4Q2hhciAoc3RyKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChzdHIpXG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKDB4RkZGRCkgLy8gVVRGIDggaW52YWxpZCBjaGFyXG4gIH1cbn1cbiIsInZhciBsb29rdXAgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLyc7XG5cbjsoZnVuY3Rpb24gKGV4cG9ydHMpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG4gIHZhciBBcnIgPSAodHlwZW9mIFVpbnQ4QXJyYXkgIT09ICd1bmRlZmluZWQnKVxuICAgID8gVWludDhBcnJheVxuICAgIDogQXJyYXlcblxuXHR2YXIgUExVUyAgID0gJysnLmNoYXJDb2RlQXQoMClcblx0dmFyIFNMQVNIICA9ICcvJy5jaGFyQ29kZUF0KDApXG5cdHZhciBOVU1CRVIgPSAnMCcuY2hhckNvZGVBdCgwKVxuXHR2YXIgTE9XRVIgID0gJ2EnLmNoYXJDb2RlQXQoMClcblx0dmFyIFVQUEVSICA9ICdBJy5jaGFyQ29kZUF0KDApXG5cblx0ZnVuY3Rpb24gZGVjb2RlIChlbHQpIHtcblx0XHR2YXIgY29kZSA9IGVsdC5jaGFyQ29kZUF0KDApXG5cdFx0aWYgKGNvZGUgPT09IFBMVVMpXG5cdFx0XHRyZXR1cm4gNjIgLy8gJysnXG5cdFx0aWYgKGNvZGUgPT09IFNMQVNIKVxuXHRcdFx0cmV0dXJuIDYzIC8vICcvJ1xuXHRcdGlmIChjb2RlIDwgTlVNQkVSKVxuXHRcdFx0cmV0dXJuIC0xIC8vbm8gbWF0Y2hcblx0XHRpZiAoY29kZSA8IE5VTUJFUiArIDEwKVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBOVU1CRVIgKyAyNiArIDI2XG5cdFx0aWYgKGNvZGUgPCBVUFBFUiArIDI2KVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBVUFBFUlxuXHRcdGlmIChjb2RlIDwgTE9XRVIgKyAyNilcblx0XHRcdHJldHVybiBjb2RlIC0gTE9XRVIgKyAyNlxuXHR9XG5cblx0ZnVuY3Rpb24gYjY0VG9CeXRlQXJyYXkgKGI2NCkge1xuXHRcdHZhciBpLCBqLCBsLCB0bXAsIHBsYWNlSG9sZGVycywgYXJyXG5cblx0XHRpZiAoYjY0Lmxlbmd0aCAlIDQgPiAwKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgc3RyaW5nLiBMZW5ndGggbXVzdCBiZSBhIG11bHRpcGxlIG9mIDQnKVxuXHRcdH1cblxuXHRcdC8vIHRoZSBudW1iZXIgb2YgZXF1YWwgc2lnbnMgKHBsYWNlIGhvbGRlcnMpXG5cdFx0Ly8gaWYgdGhlcmUgYXJlIHR3byBwbGFjZWhvbGRlcnMsIHRoYW4gdGhlIHR3byBjaGFyYWN0ZXJzIGJlZm9yZSBpdFxuXHRcdC8vIHJlcHJlc2VudCBvbmUgYnl0ZVxuXHRcdC8vIGlmIHRoZXJlIGlzIG9ubHkgb25lLCB0aGVuIHRoZSB0aHJlZSBjaGFyYWN0ZXJzIGJlZm9yZSBpdCByZXByZXNlbnQgMiBieXRlc1xuXHRcdC8vIHRoaXMgaXMganVzdCBhIGNoZWFwIGhhY2sgdG8gbm90IGRvIGluZGV4T2YgdHdpY2Vcblx0XHR2YXIgbGVuID0gYjY0Lmxlbmd0aFxuXHRcdHBsYWNlSG9sZGVycyA9ICc9JyA9PT0gYjY0LmNoYXJBdChsZW4gLSAyKSA/IDIgOiAnPScgPT09IGI2NC5jaGFyQXQobGVuIC0gMSkgPyAxIDogMFxuXG5cdFx0Ly8gYmFzZTY0IGlzIDQvMyArIHVwIHRvIHR3byBjaGFyYWN0ZXJzIG9mIHRoZSBvcmlnaW5hbCBkYXRhXG5cdFx0YXJyID0gbmV3IEFycihiNjQubGVuZ3RoICogMyAvIDQgLSBwbGFjZUhvbGRlcnMpXG5cblx0XHQvLyBpZiB0aGVyZSBhcmUgcGxhY2Vob2xkZXJzLCBvbmx5IGdldCB1cCB0byB0aGUgbGFzdCBjb21wbGV0ZSA0IGNoYXJzXG5cdFx0bCA9IHBsYWNlSG9sZGVycyA+IDAgPyBiNjQubGVuZ3RoIC0gNCA6IGI2NC5sZW5ndGhcblxuXHRcdHZhciBMID0gMFxuXG5cdFx0ZnVuY3Rpb24gcHVzaCAodikge1xuXHRcdFx0YXJyW0wrK10gPSB2XG5cdFx0fVxuXG5cdFx0Zm9yIChpID0gMCwgaiA9IDA7IGkgPCBsOyBpICs9IDQsIGogKz0gMykge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAxOCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA8PCAxMikgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDIpKSA8PCA2KSB8IGRlY29kZShiNjQuY2hhckF0KGkgKyAzKSlcblx0XHRcdHB1c2goKHRtcCAmIDB4RkYwMDAwKSA+PiAxNilcblx0XHRcdHB1c2goKHRtcCAmIDB4RkYwMCkgPj4gOClcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9XG5cblx0XHRpZiAocGxhY2VIb2xkZXJzID09PSAyKSB7XG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDIpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAxKSkgPj4gNClcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9IGVsc2UgaWYgKHBsYWNlSG9sZGVycyA9PT0gMSkge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAxMCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA8PCA0KSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMikpID4+IDIpXG5cdFx0XHRwdXNoKCh0bXAgPj4gOCkgJiAweEZGKVxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxuXHRcdH1cblxuXHRcdHJldHVybiBhcnJcblx0fVxuXG5cdGZ1bmN0aW9uIHVpbnQ4VG9CYXNlNjQgKHVpbnQ4KSB7XG5cdFx0dmFyIGksXG5cdFx0XHRleHRyYUJ5dGVzID0gdWludDgubGVuZ3RoICUgMywgLy8gaWYgd2UgaGF2ZSAxIGJ5dGUgbGVmdCwgcGFkIDIgYnl0ZXNcblx0XHRcdG91dHB1dCA9IFwiXCIsXG5cdFx0XHR0ZW1wLCBsZW5ndGhcblxuXHRcdGZ1bmN0aW9uIGVuY29kZSAobnVtKSB7XG5cdFx0XHRyZXR1cm4gbG9va3VwLmNoYXJBdChudW0pXG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gdHJpcGxldFRvQmFzZTY0IChudW0pIHtcblx0XHRcdHJldHVybiBlbmNvZGUobnVtID4+IDE4ICYgMHgzRikgKyBlbmNvZGUobnVtID4+IDEyICYgMHgzRikgKyBlbmNvZGUobnVtID4+IDYgJiAweDNGKSArIGVuY29kZShudW0gJiAweDNGKVxuXHRcdH1cblxuXHRcdC8vIGdvIHRocm91Z2ggdGhlIGFycmF5IGV2ZXJ5IHRocmVlIGJ5dGVzLCB3ZSdsbCBkZWFsIHdpdGggdHJhaWxpbmcgc3R1ZmYgbGF0ZXJcblx0XHRmb3IgKGkgPSAwLCBsZW5ndGggPSB1aW50OC5sZW5ndGggLSBleHRyYUJ5dGVzOyBpIDwgbGVuZ3RoOyBpICs9IDMpIHtcblx0XHRcdHRlbXAgPSAodWludDhbaV0gPDwgMTYpICsgKHVpbnQ4W2kgKyAxXSA8PCA4KSArICh1aW50OFtpICsgMl0pXG5cdFx0XHRvdXRwdXQgKz0gdHJpcGxldFRvQmFzZTY0KHRlbXApXG5cdFx0fVxuXG5cdFx0Ly8gcGFkIHRoZSBlbmQgd2l0aCB6ZXJvcywgYnV0IG1ha2Ugc3VyZSB0byBub3QgZm9yZ2V0IHRoZSBleHRyYSBieXRlc1xuXHRcdHN3aXRjaCAoZXh0cmFCeXRlcykge1xuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHR0ZW1wID0gdWludDhbdWludDgubGVuZ3RoIC0gMV1cblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSh0ZW1wID4+IDIpXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPDwgNCkgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gJz09J1xuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHR0ZW1wID0gKHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDJdIDw8IDgpICsgKHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDFdKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKHRlbXAgPj4gMTApXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPj4gNCkgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKCh0ZW1wIDw8IDIpICYgMHgzRilcblx0XHRcdFx0b3V0cHV0ICs9ICc9J1xuXHRcdFx0XHRicmVha1xuXHRcdH1cblxuXHRcdHJldHVybiBvdXRwdXRcblx0fVxuXG5cdGV4cG9ydHMudG9CeXRlQXJyYXkgPSBiNjRUb0J5dGVBcnJheVxuXHRleHBvcnRzLmZyb21CeXRlQXJyYXkgPSB1aW50OFRvQmFzZTY0XG59KHR5cGVvZiBleHBvcnRzID09PSAndW5kZWZpbmVkJyA/ICh0aGlzLmJhc2U2NGpzID0ge30pIDogZXhwb3J0cykpXG4iLCJleHBvcnRzLnJlYWQgPSBmdW5jdGlvbihidWZmZXIsIG9mZnNldCwgaXNMRSwgbUxlbiwgbkJ5dGVzKSB7XG4gIHZhciBlLCBtLFxuICAgICAgZUxlbiA9IG5CeXRlcyAqIDggLSBtTGVuIC0gMSxcbiAgICAgIGVNYXggPSAoMSA8PCBlTGVuKSAtIDEsXG4gICAgICBlQmlhcyA9IGVNYXggPj4gMSxcbiAgICAgIG5CaXRzID0gLTcsXG4gICAgICBpID0gaXNMRSA/IChuQnl0ZXMgLSAxKSA6IDAsXG4gICAgICBkID0gaXNMRSA/IC0xIDogMSxcbiAgICAgIHMgPSBidWZmZXJbb2Zmc2V0ICsgaV07XG5cbiAgaSArPSBkO1xuXG4gIGUgPSBzICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpO1xuICBzID4+PSAoLW5CaXRzKTtcbiAgbkJpdHMgKz0gZUxlbjtcbiAgZm9yICg7IG5CaXRzID4gMDsgZSA9IGUgKiAyNTYgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCk7XG5cbiAgbSA9IGUgJiAoKDEgPDwgKC1uQml0cykpIC0gMSk7XG4gIGUgPj49ICgtbkJpdHMpO1xuICBuQml0cyArPSBtTGVuO1xuICBmb3IgKDsgbkJpdHMgPiAwOyBtID0gbSAqIDI1NiArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KTtcblxuICBpZiAoZSA9PT0gMCkge1xuICAgIGUgPSAxIC0gZUJpYXM7XG4gIH0gZWxzZSBpZiAoZSA9PT0gZU1heCkge1xuICAgIHJldHVybiBtID8gTmFOIDogKChzID8gLTEgOiAxKSAqIEluZmluaXR5KTtcbiAgfSBlbHNlIHtcbiAgICBtID0gbSArIE1hdGgucG93KDIsIG1MZW4pO1xuICAgIGUgPSBlIC0gZUJpYXM7XG4gIH1cbiAgcmV0dXJuIChzID8gLTEgOiAxKSAqIG0gKiBNYXRoLnBvdygyLCBlIC0gbUxlbik7XG59O1xuXG5leHBvcnRzLndyaXRlID0gZnVuY3Rpb24oYnVmZmVyLCB2YWx1ZSwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcbiAgdmFyIGUsIG0sIGMsXG4gICAgICBlTGVuID0gbkJ5dGVzICogOCAtIG1MZW4gLSAxLFxuICAgICAgZU1heCA9ICgxIDw8IGVMZW4pIC0gMSxcbiAgICAgIGVCaWFzID0gZU1heCA+PiAxLFxuICAgICAgcnQgPSAobUxlbiA9PT0gMjMgPyBNYXRoLnBvdygyLCAtMjQpIC0gTWF0aC5wb3coMiwgLTc3KSA6IDApLFxuICAgICAgaSA9IGlzTEUgPyAwIDogKG5CeXRlcyAtIDEpLFxuICAgICAgZCA9IGlzTEUgPyAxIDogLTEsXG4gICAgICBzID0gdmFsdWUgPCAwIHx8ICh2YWx1ZSA9PT0gMCAmJiAxIC8gdmFsdWUgPCAwKSA/IDEgOiAwO1xuXG4gIHZhbHVlID0gTWF0aC5hYnModmFsdWUpO1xuXG4gIGlmIChpc05hTih2YWx1ZSkgfHwgdmFsdWUgPT09IEluZmluaXR5KSB7XG4gICAgbSA9IGlzTmFOKHZhbHVlKSA/IDEgOiAwO1xuICAgIGUgPSBlTWF4O1xuICB9IGVsc2Uge1xuICAgIGUgPSBNYXRoLmZsb29yKE1hdGgubG9nKHZhbHVlKSAvIE1hdGguTE4yKTtcbiAgICBpZiAodmFsdWUgKiAoYyA9IE1hdGgucG93KDIsIC1lKSkgPCAxKSB7XG4gICAgICBlLS07XG4gICAgICBjICo9IDI7XG4gICAgfVxuICAgIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgdmFsdWUgKz0gcnQgLyBjO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YWx1ZSArPSBydCAqIE1hdGgucG93KDIsIDEgLSBlQmlhcyk7XG4gICAgfVxuICAgIGlmICh2YWx1ZSAqIGMgPj0gMikge1xuICAgICAgZSsrO1xuICAgICAgYyAvPSAyO1xuICAgIH1cblxuICAgIGlmIChlICsgZUJpYXMgPj0gZU1heCkge1xuICAgICAgbSA9IDA7XG4gICAgICBlID0gZU1heDtcbiAgICB9IGVsc2UgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XG4gICAgICBtID0gKHZhbHVlICogYyAtIDEpICogTWF0aC5wb3coMiwgbUxlbik7XG4gICAgICBlID0gZSArIGVCaWFzO1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gdmFsdWUgKiBNYXRoLnBvdygyLCBlQmlhcyAtIDEpICogTWF0aC5wb3coMiwgbUxlbik7XG4gICAgICBlID0gMDtcbiAgICB9XG4gIH1cblxuICBmb3IgKDsgbUxlbiA+PSA4OyBidWZmZXJbb2Zmc2V0ICsgaV0gPSBtICYgMHhmZiwgaSArPSBkLCBtIC89IDI1NiwgbUxlbiAtPSA4KTtcblxuICBlID0gKGUgPDwgbUxlbikgfCBtO1xuICBlTGVuICs9IG1MZW47XG4gIGZvciAoOyBlTGVuID4gMDsgYnVmZmVyW29mZnNldCArIGldID0gZSAmIDB4ZmYsIGkgKz0gZCwgZSAvPSAyNTYsIGVMZW4gLT0gOCk7XG5cbiAgYnVmZmVyW29mZnNldCArIGkgLSBkXSB8PSBzICogMTI4O1xufTtcbiIsIlxuLyoqXG4gKiBpc0FycmF5XG4gKi9cblxudmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5O1xuXG4vKipcbiAqIHRvU3RyaW5nXG4gKi9cblxudmFyIHN0ciA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbi8qKlxuICogV2hldGhlciBvciBub3QgdGhlIGdpdmVuIGB2YWxgXG4gKiBpcyBhbiBhcnJheS5cbiAqXG4gKiBleGFtcGxlOlxuICpcbiAqICAgICAgICBpc0FycmF5KFtdKTtcbiAqICAgICAgICAvLyA+IHRydWVcbiAqICAgICAgICBpc0FycmF5KGFyZ3VtZW50cyk7XG4gKiAgICAgICAgLy8gPiBmYWxzZVxuICogICAgICAgIGlzQXJyYXkoJycpO1xuICogICAgICAgIC8vID4gZmFsc2VcbiAqXG4gKiBAcGFyYW0ge21peGVkfSB2YWxcbiAqIEByZXR1cm4ge2Jvb2x9XG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBpc0FycmF5IHx8IGZ1bmN0aW9uICh2YWwpIHtcbiAgcmV0dXJuICEhIHZhbCAmJiAnW29iamVjdCBBcnJheV0nID09IHN0ci5jYWxsKHZhbCk7XG59O1xuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHtcbiAgdGhpcy5fZXZlbnRzID0gdGhpcy5fZXZlbnRzIHx8IHt9O1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSB0aGlzLl9tYXhMaXN0ZW5lcnMgfHwgdW5kZWZpbmVkO1xufVxubW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG5cbi8vIEJhY2t3YXJkcy1jb21wYXQgd2l0aCBub2RlIDAuMTAueFxuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlciA9IEV2ZW50RW1pdHRlcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fbWF4TGlzdGVuZXJzID0gdW5kZWZpbmVkO1xuXG4vLyBCeSBkZWZhdWx0IEV2ZW50RW1pdHRlcnMgd2lsbCBwcmludCBhIHdhcm5pbmcgaWYgbW9yZSB0aGFuIDEwIGxpc3RlbmVycyBhcmVcbi8vIGFkZGVkIHRvIGl0LiBUaGlzIGlzIGEgdXNlZnVsIGRlZmF1bHQgd2hpY2ggaGVscHMgZmluZGluZyBtZW1vcnkgbGVha3MuXG5FdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyA9IDEwO1xuXG4vLyBPYnZpb3VzbHkgbm90IGFsbCBFbWl0dGVycyBzaG91bGQgYmUgbGltaXRlZCB0byAxMC4gVGhpcyBmdW5jdGlvbiBhbGxvd3Ncbi8vIHRoYXQgdG8gYmUgaW5jcmVhc2VkLiBTZXQgdG8gemVybyBmb3IgdW5saW1pdGVkLlxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbihuKSB7XG4gIGlmICghaXNOdW1iZXIobikgfHwgbiA8IDAgfHwgaXNOYU4obikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCduIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBlciwgaGFuZGxlciwgbGVuLCBhcmdzLCBpLCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gSWYgdGhlcmUgaXMgbm8gJ2Vycm9yJyBldmVudCBsaXN0ZW5lciB0aGVuIHRocm93LlxuICBpZiAodHlwZSA9PT0gJ2Vycm9yJykge1xuICAgIGlmICghdGhpcy5fZXZlbnRzLmVycm9yIHx8XG4gICAgICAgIChpc09iamVjdCh0aGlzLl9ldmVudHMuZXJyb3IpICYmICF0aGlzLl9ldmVudHMuZXJyb3IubGVuZ3RoKSkge1xuICAgICAgZXIgPSBhcmd1bWVudHNbMV07XG4gICAgICBpZiAoZXIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICB0aHJvdyBlcjsgLy8gVW5oYW5kbGVkICdlcnJvcicgZXZlbnRcbiAgICAgIH1cbiAgICAgIHRocm93IFR5cGVFcnJvcignVW5jYXVnaHQsIHVuc3BlY2lmaWVkIFwiZXJyb3JcIiBldmVudC4nKTtcbiAgICB9XG4gIH1cblxuICBoYW5kbGVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc1VuZGVmaW5lZChoYW5kbGVyKSlcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKGlzRnVuY3Rpb24oaGFuZGxlcikpIHtcbiAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIC8vIGZhc3QgY2FzZXNcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO1xuICAgICAgICBicmVhaztcbiAgICAgIC8vIHNsb3dlclxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICAgICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICBoYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChpc09iamVjdChoYW5kbGVyKSkge1xuICAgIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcblxuICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICBsZW4gPSBsaXN0ZW5lcnMubGVuZ3RoO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKylcbiAgICAgIGxpc3RlbmVyc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBtO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBUbyBhdm9pZCByZWN1cnNpb24gaW4gdGhlIGNhc2UgdGhhdCB0eXBlID09PSBcIm5ld0xpc3RlbmVyXCIhIEJlZm9yZVxuICAvLyBhZGRpbmcgaXQgdG8gdGhlIGxpc3RlbmVycywgZmlyc3QgZW1pdCBcIm5ld0xpc3RlbmVyXCIuXG4gIGlmICh0aGlzLl9ldmVudHMubmV3TGlzdGVuZXIpXG4gICAgdGhpcy5lbWl0KCduZXdMaXN0ZW5lcicsIHR5cGUsXG4gICAgICAgICAgICAgIGlzRnVuY3Rpb24obGlzdGVuZXIubGlzdGVuZXIpID9cbiAgICAgICAgICAgICAgbGlzdGVuZXIubGlzdGVuZXIgOiBsaXN0ZW5lcik7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgLy8gT3B0aW1pemUgdGhlIGNhc2Ugb2Ygb25lIGxpc3RlbmVyLiBEb24ndCBuZWVkIHRoZSBleHRyYSBhcnJheSBvYmplY3QuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gbGlzdGVuZXI7XG4gIGVsc2UgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgLy8gSWYgd2UndmUgYWxyZWFkeSBnb3QgYW4gYXJyYXksIGp1c3QgYXBwZW5kLlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5wdXNoKGxpc3RlbmVyKTtcbiAgZWxzZVxuICAgIC8vIEFkZGluZyB0aGUgc2Vjb25kIGVsZW1lbnQsIG5lZWQgdG8gY2hhbmdlIHRvIGFycmF5LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IFt0aGlzLl9ldmVudHNbdHlwZV0sIGxpc3RlbmVyXTtcblxuICAvLyBDaGVjayBmb3IgbGlzdGVuZXIgbGVha1xuICBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSAmJiAhdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCkge1xuICAgIHZhciBtO1xuICAgIGlmICghaXNVbmRlZmluZWQodGhpcy5fbWF4TGlzdGVuZXJzKSkge1xuICAgICAgbSA9IHRoaXMuX21heExpc3RlbmVycztcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzO1xuICAgIH1cblxuICAgIGlmIChtICYmIG0gPiAwICYmIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGggPiBtKSB7XG4gICAgICB0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkID0gdHJ1ZTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJyhub2RlKSB3YXJuaW5nOiBwb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5ICcgK1xuICAgICAgICAgICAgICAgICAgICAnbGVhayBkZXRlY3RlZC4gJWQgbGlzdGVuZXJzIGFkZGVkLiAnICtcbiAgICAgICAgICAgICAgICAgICAgJ1VzZSBlbWl0dGVyLnNldE1heExpc3RlbmVycygpIHRvIGluY3JlYXNlIGxpbWl0LicsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGgpO1xuICAgICAgaWYgKHR5cGVvZiBjb25zb2xlLnRyYWNlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIG5vdCBzdXBwb3J0ZWQgaW4gSUUgMTBcbiAgICAgICAgY29uc29sZS50cmFjZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICB2YXIgZmlyZWQgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBnKCkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgZyk7XG5cbiAgICBpZiAoIWZpcmVkKSB7XG4gICAgICBmaXJlZCA9IHRydWU7XG4gICAgICBsaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfVxuXG4gIGcubGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgdGhpcy5vbih0eXBlLCBnKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIGVtaXRzIGEgJ3JlbW92ZUxpc3RlbmVyJyBldmVudCBpZmYgdGhlIGxpc3RlbmVyIHdhcyByZW1vdmVkXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIGxpc3QsIHBvc2l0aW9uLCBsZW5ndGgsIGk7XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgbGlzdCA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgbGVuZ3RoID0gbGlzdC5sZW5ndGg7XG4gIHBvc2l0aW9uID0gLTE7XG5cbiAgaWYgKGxpc3QgPT09IGxpc3RlbmVyIHx8XG4gICAgICAoaXNGdW5jdGlvbihsaXN0Lmxpc3RlbmVyKSAmJiBsaXN0Lmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuXG4gIH0gZWxzZSBpZiAoaXNPYmplY3QobGlzdCkpIHtcbiAgICBmb3IgKGkgPSBsZW5ndGg7IGktLSA+IDA7KSB7XG4gICAgICBpZiAobGlzdFtpXSA9PT0gbGlzdGVuZXIgfHxcbiAgICAgICAgICAobGlzdFtpXS5saXN0ZW5lciAmJiBsaXN0W2ldLmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICAgICAgcG9zaXRpb24gPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocG9zaXRpb24gPCAwKVxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICBpZiAobGlzdC5sZW5ndGggPT09IDEpIHtcbiAgICAgIGxpc3QubGVuZ3RoID0gMDtcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpc3Quc3BsaWNlKHBvc2l0aW9uLCAxKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBrZXksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICByZXR1cm4gdGhpcztcblxuICAvLyBub3QgbGlzdGVuaW5nIGZvciByZW1vdmVMaXN0ZW5lciwgbm8gbmVlZCB0byBlbWl0XG4gIGlmICghdGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApXG4gICAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICBlbHNlIGlmICh0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gZW1pdCByZW1vdmVMaXN0ZW5lciBmb3IgYWxsIGxpc3RlbmVycyBvbiBhbGwgZXZlbnRzXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgZm9yIChrZXkgaW4gdGhpcy5fZXZlbnRzKSB7XG4gICAgICBpZiAoa2V5ID09PSAncmVtb3ZlTGlzdGVuZXInKSBjb250aW51ZTtcbiAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKGtleSk7XG4gICAgfVxuICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCdyZW1vdmVMaXN0ZW5lcicpO1xuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGxpc3RlbmVycykpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVycyk7XG4gIH0gZWxzZSB7XG4gICAgLy8gTElGTyBvcmRlclxuICAgIHdoaWxlIChsaXN0ZW5lcnMubGVuZ3RoKVxuICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnNbbGlzdGVuZXJzLmxlbmd0aCAtIDFdKTtcbiAgfVxuICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gW107XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24odGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSBbdGhpcy5fZXZlbnRzW3R5cGVdXTtcbiAgZWxzZVxuICAgIHJldCA9IHRoaXMuX2V2ZW50c1t0eXBlXS5zbGljZSgpO1xuICByZXR1cm4gcmV0O1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghZW1pdHRlci5fZXZlbnRzIHx8ICFlbWl0dGVyLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gMDtcbiAgZWxzZSBpZiAoaXNGdW5jdGlvbihlbWl0dGVyLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IDE7XG4gIGVsc2VcbiAgICByZXQgPSBlbWl0dGVyLl9ldmVudHNbdHlwZV0ubGVuZ3RoO1xuICByZXR1cm4gcmV0O1xufTtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xufVxuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuIiwiaWYgKHR5cGVvZiBPYmplY3QuY3JlYXRlID09PSAnZnVuY3Rpb24nKSB7XG4gIC8vIGltcGxlbWVudGF0aW9uIGZyb20gc3RhbmRhcmQgbm9kZS5qcyAndXRpbCcgbW9kdWxlXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICBjdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDdG9yLnByb3RvdHlwZSwge1xuICAgICAgY29uc3RydWN0b3I6IHtcbiAgICAgICAgdmFsdWU6IGN0b3IsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICB9XG4gICAgfSk7XG4gIH07XG59IGVsc2Uge1xuICAvLyBvbGQgc2Nob29sIHNoaW0gZm9yIG9sZCBicm93c2Vyc1xuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgdmFyIFRlbXBDdG9yID0gZnVuY3Rpb24gKCkge31cbiAgICBUZW1wQ3Rvci5wcm90b3R5cGUgPSBzdXBlckN0b3IucHJvdG90eXBlXG4gICAgY3Rvci5wcm90b3R5cGUgPSBuZXcgVGVtcEN0b3IoKVxuICAgIGN0b3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gY3RvclxuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKGFycikge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGFycikgPT0gJ1tvYmplY3QgQXJyYXldJztcbn07XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG5wcm9jZXNzLm5leHRUaWNrID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY2FuU2V0SW1tZWRpYXRlID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cuc2V0SW1tZWRpYXRlO1xuICAgIHZhciBjYW5NdXRhdGlvbk9ic2VydmVyID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cuTXV0YXRpb25PYnNlcnZlcjtcbiAgICB2YXIgY2FuUG9zdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnBvc3RNZXNzYWdlICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyXG4gICAgO1xuXG4gICAgaWYgKGNhblNldEltbWVkaWF0ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGYpIHsgcmV0dXJuIHdpbmRvdy5zZXRJbW1lZGlhdGUoZikgfTtcbiAgICB9XG5cbiAgICB2YXIgcXVldWUgPSBbXTtcblxuICAgIGlmIChjYW5NdXRhdGlvbk9ic2VydmVyKSB7XG4gICAgICAgIHZhciBoaWRkZW5EaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICB2YXIgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgcXVldWVMaXN0ID0gcXVldWUuc2xpY2UoKTtcbiAgICAgICAgICAgIHF1ZXVlLmxlbmd0aCA9IDA7XG4gICAgICAgICAgICBxdWV1ZUxpc3QuZm9yRWFjaChmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIG9ic2VydmVyLm9ic2VydmUoaGlkZGVuRGl2LCB7IGF0dHJpYnV0ZXM6IHRydWUgfSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBpZiAoIXF1ZXVlLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGhpZGRlbkRpdi5zZXRBdHRyaWJ1dGUoJ3llcycsICdubycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgaWYgKGNhblBvc3QpIHtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBldi5zb3VyY2U7XG4gICAgICAgICAgICBpZiAoKHNvdXJjZSA9PT0gd2luZG93IHx8IHNvdXJjZSA9PT0gbnVsbCkgJiYgZXYuZGF0YSA9PT0gJ3Byb2Nlc3MtdGljaycpIHtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZm4gPSBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSgncHJvY2Vzcy10aWNrJywgJyonKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XG4gICAgfTtcbn0pKCk7XG5cbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiLi9saWIvX3N0cmVhbV9kdXBsZXguanNcIilcbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4vLyBhIGR1cGxleCBzdHJlYW0gaXMganVzdCBhIHN0cmVhbSB0aGF0IGlzIGJvdGggcmVhZGFibGUgYW5kIHdyaXRhYmxlLlxuLy8gU2luY2UgSlMgZG9lc24ndCBoYXZlIG11bHRpcGxlIHByb3RvdHlwYWwgaW5oZXJpdGFuY2UsIHRoaXMgY2xhc3Ncbi8vIHByb3RvdHlwYWxseSBpbmhlcml0cyBmcm9tIFJlYWRhYmxlLCBhbmQgdGhlbiBwYXJhc2l0aWNhbGx5IGZyb21cbi8vIFdyaXRhYmxlLlxuXG5tb2R1bGUuZXhwb3J0cyA9IER1cGxleDtcblxuLyo8cmVwbGFjZW1lbnQ+Ki9cbnZhciBvYmplY3RLZXlzID0gT2JqZWN0LmtleXMgfHwgZnVuY3Rpb24gKG9iaikge1xuICB2YXIga2V5cyA9IFtdO1xuICBmb3IgKHZhciBrZXkgaW4gb2JqKSBrZXlzLnB1c2goa2V5KTtcbiAgcmV0dXJuIGtleXM7XG59XG4vKjwvcmVwbGFjZW1lbnQ+Ki9cblxuXG4vKjxyZXBsYWNlbWVudD4qL1xudmFyIHV0aWwgPSByZXF1aXJlKCdjb3JlLXV0aWwtaXMnKTtcbnV0aWwuaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpO1xuLyo8L3JlcGxhY2VtZW50PiovXG5cbnZhciBSZWFkYWJsZSA9IHJlcXVpcmUoJy4vX3N0cmVhbV9yZWFkYWJsZScpO1xudmFyIFdyaXRhYmxlID0gcmVxdWlyZSgnLi9fc3RyZWFtX3dyaXRhYmxlJyk7XG5cbnV0aWwuaW5oZXJpdHMoRHVwbGV4LCBSZWFkYWJsZSk7XG5cbmZvckVhY2gob2JqZWN0S2V5cyhXcml0YWJsZS5wcm90b3R5cGUpLCBmdW5jdGlvbihtZXRob2QpIHtcbiAgaWYgKCFEdXBsZXgucHJvdG90eXBlW21ldGhvZF0pXG4gICAgRHVwbGV4LnByb3RvdHlwZVttZXRob2RdID0gV3JpdGFibGUucHJvdG90eXBlW21ldGhvZF07XG59KTtcblxuZnVuY3Rpb24gRHVwbGV4KG9wdGlvbnMpIHtcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIER1cGxleCkpXG4gICAgcmV0dXJuIG5ldyBEdXBsZXgob3B0aW9ucyk7XG5cbiAgUmVhZGFibGUuY2FsbCh0aGlzLCBvcHRpb25zKTtcbiAgV3JpdGFibGUuY2FsbCh0aGlzLCBvcHRpb25zKTtcblxuICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLnJlYWRhYmxlID09PSBmYWxzZSlcbiAgICB0aGlzLnJlYWRhYmxlID0gZmFsc2U7XG5cbiAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy53cml0YWJsZSA9PT0gZmFsc2UpXG4gICAgdGhpcy53cml0YWJsZSA9IGZhbHNlO1xuXG4gIHRoaXMuYWxsb3dIYWxmT3BlbiA9IHRydWU7XG4gIGlmIChvcHRpb25zICYmIG9wdGlvbnMuYWxsb3dIYWxmT3BlbiA9PT0gZmFsc2UpXG4gICAgdGhpcy5hbGxvd0hhbGZPcGVuID0gZmFsc2U7XG5cbiAgdGhpcy5vbmNlKCdlbmQnLCBvbmVuZCk7XG59XG5cbi8vIHRoZSBuby1oYWxmLW9wZW4gZW5mb3JjZXJcbmZ1bmN0aW9uIG9uZW5kKCkge1xuICAvLyBpZiB3ZSBhbGxvdyBoYWxmLW9wZW4gc3RhdGUsIG9yIGlmIHRoZSB3cml0YWJsZSBzaWRlIGVuZGVkLFxuICAvLyB0aGVuIHdlJ3JlIG9rLlxuICBpZiAodGhpcy5hbGxvd0hhbGZPcGVuIHx8IHRoaXMuX3dyaXRhYmxlU3RhdGUuZW5kZWQpXG4gICAgcmV0dXJuO1xuXG4gIC8vIG5vIG1vcmUgZGF0YSBjYW4gYmUgd3JpdHRlbi5cbiAgLy8gQnV0IGFsbG93IG1vcmUgd3JpdGVzIHRvIGhhcHBlbiBpbiB0aGlzIHRpY2suXG4gIHByb2Nlc3MubmV4dFRpY2sodGhpcy5lbmQuYmluZCh0aGlzKSk7XG59XG5cbmZ1bmN0aW9uIGZvckVhY2ggKHhzLCBmKSB7XG4gIGZvciAodmFyIGkgPSAwLCBsID0geHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgZih4c1tpXSwgaSk7XG4gIH1cbn1cbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4vLyBhIHBhc3N0aHJvdWdoIHN0cmVhbS5cbi8vIGJhc2ljYWxseSBqdXN0IHRoZSBtb3N0IG1pbmltYWwgc29ydCBvZiBUcmFuc2Zvcm0gc3RyZWFtLlxuLy8gRXZlcnkgd3JpdHRlbiBjaHVuayBnZXRzIG91dHB1dCBhcy1pcy5cblxubW9kdWxlLmV4cG9ydHMgPSBQYXNzVGhyb3VnaDtcblxudmFyIFRyYW5zZm9ybSA9IHJlcXVpcmUoJy4vX3N0cmVhbV90cmFuc2Zvcm0nKTtcblxuLyo8cmVwbGFjZW1lbnQ+Ki9cbnZhciB1dGlsID0gcmVxdWlyZSgnY29yZS11dGlsLWlzJyk7XG51dGlsLmluaGVyaXRzID0gcmVxdWlyZSgnaW5oZXJpdHMnKTtcbi8qPC9yZXBsYWNlbWVudD4qL1xuXG51dGlsLmluaGVyaXRzKFBhc3NUaHJvdWdoLCBUcmFuc2Zvcm0pO1xuXG5mdW5jdGlvbiBQYXNzVGhyb3VnaChvcHRpb25zKSB7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBQYXNzVGhyb3VnaCkpXG4gICAgcmV0dXJuIG5ldyBQYXNzVGhyb3VnaChvcHRpb25zKTtcblxuICBUcmFuc2Zvcm0uY2FsbCh0aGlzLCBvcHRpb25zKTtcbn1cblxuUGFzc1Rocm91Z2gucHJvdG90eXBlLl90cmFuc2Zvcm0gPSBmdW5jdGlvbihjaHVuaywgZW5jb2RpbmcsIGNiKSB7XG4gIGNiKG51bGwsIGNodW5rKTtcbn07XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxubW9kdWxlLmV4cG9ydHMgPSBSZWFkYWJsZTtcblxuLyo8cmVwbGFjZW1lbnQ+Ki9cbnZhciBpc0FycmF5ID0gcmVxdWlyZSgnaXNhcnJheScpO1xuLyo8L3JlcGxhY2VtZW50PiovXG5cblxuLyo8cmVwbGFjZW1lbnQ+Ki9cbnZhciBCdWZmZXIgPSByZXF1aXJlKCdidWZmZXInKS5CdWZmZXI7XG4vKjwvcmVwbGFjZW1lbnQ+Ki9cblxuUmVhZGFibGUuUmVhZGFibGVTdGF0ZSA9IFJlYWRhYmxlU3RhdGU7XG5cbnZhciBFRSA9IHJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlcjtcblxuLyo8cmVwbGFjZW1lbnQ+Ki9cbmlmICghRUUubGlzdGVuZXJDb3VudCkgRUUubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKGVtaXR0ZXIsIHR5cGUpIHtcbiAgcmV0dXJuIGVtaXR0ZXIubGlzdGVuZXJzKHR5cGUpLmxlbmd0aDtcbn07XG4vKjwvcmVwbGFjZW1lbnQ+Ki9cblxudmFyIFN0cmVhbSA9IHJlcXVpcmUoJ3N0cmVhbScpO1xuXG4vKjxyZXBsYWNlbWVudD4qL1xudmFyIHV0aWwgPSByZXF1aXJlKCdjb3JlLXV0aWwtaXMnKTtcbnV0aWwuaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpO1xuLyo8L3JlcGxhY2VtZW50PiovXG5cbnZhciBTdHJpbmdEZWNvZGVyO1xuXG51dGlsLmluaGVyaXRzKFJlYWRhYmxlLCBTdHJlYW0pO1xuXG5mdW5jdGlvbiBSZWFkYWJsZVN0YXRlKG9wdGlvbnMsIHN0cmVhbSkge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAvLyB0aGUgcG9pbnQgYXQgd2hpY2ggaXQgc3RvcHMgY2FsbGluZyBfcmVhZCgpIHRvIGZpbGwgdGhlIGJ1ZmZlclxuICAvLyBOb3RlOiAwIGlzIGEgdmFsaWQgdmFsdWUsIG1lYW5zIFwiZG9uJ3QgY2FsbCBfcmVhZCBwcmVlbXB0aXZlbHkgZXZlclwiXG4gIHZhciBod20gPSBvcHRpb25zLmhpZ2hXYXRlck1hcms7XG4gIHRoaXMuaGlnaFdhdGVyTWFyayA9IChod20gfHwgaHdtID09PSAwKSA/IGh3bSA6IDE2ICogMTAyNDtcblxuICAvLyBjYXN0IHRvIGludHMuXG4gIHRoaXMuaGlnaFdhdGVyTWFyayA9IH5+dGhpcy5oaWdoV2F0ZXJNYXJrO1xuXG4gIHRoaXMuYnVmZmVyID0gW107XG4gIHRoaXMubGVuZ3RoID0gMDtcbiAgdGhpcy5waXBlcyA9IG51bGw7XG4gIHRoaXMucGlwZXNDb3VudCA9IDA7XG4gIHRoaXMuZmxvd2luZyA9IGZhbHNlO1xuICB0aGlzLmVuZGVkID0gZmFsc2U7XG4gIHRoaXMuZW5kRW1pdHRlZCA9IGZhbHNlO1xuICB0aGlzLnJlYWRpbmcgPSBmYWxzZTtcblxuICAvLyBJbiBzdHJlYW1zIHRoYXQgbmV2ZXIgaGF2ZSBhbnkgZGF0YSwgYW5kIGRvIHB1c2gobnVsbCkgcmlnaHQgYXdheSxcbiAgLy8gdGhlIGNvbnN1bWVyIGNhbiBtaXNzIHRoZSAnZW5kJyBldmVudCBpZiB0aGV5IGRvIHNvbWUgSS9PIGJlZm9yZVxuICAvLyBjb25zdW1pbmcgdGhlIHN0cmVhbS4gIFNvLCB3ZSBkb24ndCBlbWl0KCdlbmQnKSB1bnRpbCBzb21lIHJlYWRpbmdcbiAgLy8gaGFwcGVucy5cbiAgdGhpcy5jYWxsZWRSZWFkID0gZmFsc2U7XG5cbiAgLy8gYSBmbGFnIHRvIGJlIGFibGUgdG8gdGVsbCBpZiB0aGUgb253cml0ZSBjYiBpcyBjYWxsZWQgaW1tZWRpYXRlbHksXG4gIC8vIG9yIG9uIGEgbGF0ZXIgdGljay4gIFdlIHNldCB0aGlzIHRvIHRydWUgYXQgZmlyc3QsIGJlY3Vhc2UgYW55XG4gIC8vIGFjdGlvbnMgdGhhdCBzaG91bGRuJ3QgaGFwcGVuIHVudGlsIFwibGF0ZXJcIiBzaG91bGQgZ2VuZXJhbGx5IGFsc29cbiAgLy8gbm90IGhhcHBlbiBiZWZvcmUgdGhlIGZpcnN0IHdyaXRlIGNhbGwuXG4gIHRoaXMuc3luYyA9IHRydWU7XG5cbiAgLy8gd2hlbmV2ZXIgd2UgcmV0dXJuIG51bGwsIHRoZW4gd2Ugc2V0IGEgZmxhZyB0byBzYXlcbiAgLy8gdGhhdCB3ZSdyZSBhd2FpdGluZyBhICdyZWFkYWJsZScgZXZlbnQgZW1pc3Npb24uXG4gIHRoaXMubmVlZFJlYWRhYmxlID0gZmFsc2U7XG4gIHRoaXMuZW1pdHRlZFJlYWRhYmxlID0gZmFsc2U7XG4gIHRoaXMucmVhZGFibGVMaXN0ZW5pbmcgPSBmYWxzZTtcblxuXG4gIC8vIG9iamVjdCBzdHJlYW0gZmxhZy4gVXNlZCB0byBtYWtlIHJlYWQobikgaWdub3JlIG4gYW5kIHRvXG4gIC8vIG1ha2UgYWxsIHRoZSBidWZmZXIgbWVyZ2luZyBhbmQgbGVuZ3RoIGNoZWNrcyBnbyBhd2F5XG4gIHRoaXMub2JqZWN0TW9kZSA9ICEhb3B0aW9ucy5vYmplY3RNb2RlO1xuXG4gIC8vIENyeXB0byBpcyBraW5kIG9mIG9sZCBhbmQgY3J1c3R5LiAgSGlzdG9yaWNhbGx5LCBpdHMgZGVmYXVsdCBzdHJpbmdcbiAgLy8gZW5jb2RpbmcgaXMgJ2JpbmFyeScgc28gd2UgaGF2ZSB0byBtYWtlIHRoaXMgY29uZmlndXJhYmxlLlxuICAvLyBFdmVyeXRoaW5nIGVsc2UgaW4gdGhlIHVuaXZlcnNlIHVzZXMgJ3V0ZjgnLCB0aG91Z2guXG4gIHRoaXMuZGVmYXVsdEVuY29kaW5nID0gb3B0aW9ucy5kZWZhdWx0RW5jb2RpbmcgfHwgJ3V0ZjgnO1xuXG4gIC8vIHdoZW4gcGlwaW5nLCB3ZSBvbmx5IGNhcmUgYWJvdXQgJ3JlYWRhYmxlJyBldmVudHMgdGhhdCBoYXBwZW5cbiAgLy8gYWZ0ZXIgcmVhZCgpaW5nIGFsbCB0aGUgYnl0ZXMgYW5kIG5vdCBnZXR0aW5nIGFueSBwdXNoYmFjay5cbiAgdGhpcy5yYW5PdXQgPSBmYWxzZTtcblxuICAvLyB0aGUgbnVtYmVyIG9mIHdyaXRlcnMgdGhhdCBhcmUgYXdhaXRpbmcgYSBkcmFpbiBldmVudCBpbiAucGlwZSgpc1xuICB0aGlzLmF3YWl0RHJhaW4gPSAwO1xuXG4gIC8vIGlmIHRydWUsIGEgbWF5YmVSZWFkTW9yZSBoYXMgYmVlbiBzY2hlZHVsZWRcbiAgdGhpcy5yZWFkaW5nTW9yZSA9IGZhbHNlO1xuXG4gIHRoaXMuZGVjb2RlciA9IG51bGw7XG4gIHRoaXMuZW5jb2RpbmcgPSBudWxsO1xuICBpZiAob3B0aW9ucy5lbmNvZGluZykge1xuICAgIGlmICghU3RyaW5nRGVjb2RlcilcbiAgICAgIFN0cmluZ0RlY29kZXIgPSByZXF1aXJlKCdzdHJpbmdfZGVjb2Rlci8nKS5TdHJpbmdEZWNvZGVyO1xuICAgIHRoaXMuZGVjb2RlciA9IG5ldyBTdHJpbmdEZWNvZGVyKG9wdGlvbnMuZW5jb2RpbmcpO1xuICAgIHRoaXMuZW5jb2RpbmcgPSBvcHRpb25zLmVuY29kaW5nO1xuICB9XG59XG5cbmZ1bmN0aW9uIFJlYWRhYmxlKG9wdGlvbnMpIHtcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFJlYWRhYmxlKSlcbiAgICByZXR1cm4gbmV3IFJlYWRhYmxlKG9wdGlvbnMpO1xuXG4gIHRoaXMuX3JlYWRhYmxlU3RhdGUgPSBuZXcgUmVhZGFibGVTdGF0ZShvcHRpb25zLCB0aGlzKTtcblxuICAvLyBsZWdhY3lcbiAgdGhpcy5yZWFkYWJsZSA9IHRydWU7XG5cbiAgU3RyZWFtLmNhbGwodGhpcyk7XG59XG5cbi8vIE1hbnVhbGx5IHNob3ZlIHNvbWV0aGluZyBpbnRvIHRoZSByZWFkKCkgYnVmZmVyLlxuLy8gVGhpcyByZXR1cm5zIHRydWUgaWYgdGhlIGhpZ2hXYXRlck1hcmsgaGFzIG5vdCBiZWVuIGhpdCB5ZXQsXG4vLyBzaW1pbGFyIHRvIGhvdyBXcml0YWJsZS53cml0ZSgpIHJldHVybnMgdHJ1ZSBpZiB5b3Ugc2hvdWxkXG4vLyB3cml0ZSgpIHNvbWUgbW9yZS5cblJlYWRhYmxlLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24oY2h1bmssIGVuY29kaW5nKSB7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX3JlYWRhYmxlU3RhdGU7XG5cbiAgaWYgKHR5cGVvZiBjaHVuayA9PT0gJ3N0cmluZycgJiYgIXN0YXRlLm9iamVjdE1vZGUpIHtcbiAgICBlbmNvZGluZyA9IGVuY29kaW5nIHx8IHN0YXRlLmRlZmF1bHRFbmNvZGluZztcbiAgICBpZiAoZW5jb2RpbmcgIT09IHN0YXRlLmVuY29kaW5nKSB7XG4gICAgICBjaHVuayA9IG5ldyBCdWZmZXIoY2h1bmssIGVuY29kaW5nKTtcbiAgICAgIGVuY29kaW5nID0gJyc7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlYWRhYmxlQWRkQ2h1bmsodGhpcywgc3RhdGUsIGNodW5rLCBlbmNvZGluZywgZmFsc2UpO1xufTtcblxuLy8gVW5zaGlmdCBzaG91bGQgKmFsd2F5cyogYmUgc29tZXRoaW5nIGRpcmVjdGx5IG91dCBvZiByZWFkKClcblJlYWRhYmxlLnByb3RvdHlwZS51bnNoaWZ0ID0gZnVuY3Rpb24oY2h1bmspIHtcbiAgdmFyIHN0YXRlID0gdGhpcy5fcmVhZGFibGVTdGF0ZTtcbiAgcmV0dXJuIHJlYWRhYmxlQWRkQ2h1bmsodGhpcywgc3RhdGUsIGNodW5rLCAnJywgdHJ1ZSk7XG59O1xuXG5mdW5jdGlvbiByZWFkYWJsZUFkZENodW5rKHN0cmVhbSwgc3RhdGUsIGNodW5rLCBlbmNvZGluZywgYWRkVG9Gcm9udCkge1xuICB2YXIgZXIgPSBjaHVua0ludmFsaWQoc3RhdGUsIGNodW5rKTtcbiAgaWYgKGVyKSB7XG4gICAgc3RyZWFtLmVtaXQoJ2Vycm9yJywgZXIpO1xuICB9IGVsc2UgaWYgKGNodW5rID09PSBudWxsIHx8IGNodW5rID09PSB1bmRlZmluZWQpIHtcbiAgICBzdGF0ZS5yZWFkaW5nID0gZmFsc2U7XG4gICAgaWYgKCFzdGF0ZS5lbmRlZClcbiAgICAgIG9uRW9mQ2h1bmsoc3RyZWFtLCBzdGF0ZSk7XG4gIH0gZWxzZSBpZiAoc3RhdGUub2JqZWN0TW9kZSB8fCBjaHVuayAmJiBjaHVuay5sZW5ndGggPiAwKSB7XG4gICAgaWYgKHN0YXRlLmVuZGVkICYmICFhZGRUb0Zyb250KSB7XG4gICAgICB2YXIgZSA9IG5ldyBFcnJvcignc3RyZWFtLnB1c2goKSBhZnRlciBFT0YnKTtcbiAgICAgIHN0cmVhbS5lbWl0KCdlcnJvcicsIGUpO1xuICAgIH0gZWxzZSBpZiAoc3RhdGUuZW5kRW1pdHRlZCAmJiBhZGRUb0Zyb250KSB7XG4gICAgICB2YXIgZSA9IG5ldyBFcnJvcignc3RyZWFtLnVuc2hpZnQoKSBhZnRlciBlbmQgZXZlbnQnKTtcbiAgICAgIHN0cmVhbS5lbWl0KCdlcnJvcicsIGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoc3RhdGUuZGVjb2RlciAmJiAhYWRkVG9Gcm9udCAmJiAhZW5jb2RpbmcpXG4gICAgICAgIGNodW5rID0gc3RhdGUuZGVjb2Rlci53cml0ZShjaHVuayk7XG5cbiAgICAgIC8vIHVwZGF0ZSB0aGUgYnVmZmVyIGluZm8uXG4gICAgICBzdGF0ZS5sZW5ndGggKz0gc3RhdGUub2JqZWN0TW9kZSA/IDEgOiBjaHVuay5sZW5ndGg7XG4gICAgICBpZiAoYWRkVG9Gcm9udCkge1xuICAgICAgICBzdGF0ZS5idWZmZXIudW5zaGlmdChjaHVuayk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdGF0ZS5yZWFkaW5nID0gZmFsc2U7XG4gICAgICAgIHN0YXRlLmJ1ZmZlci5wdXNoKGNodW5rKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHN0YXRlLm5lZWRSZWFkYWJsZSlcbiAgICAgICAgZW1pdFJlYWRhYmxlKHN0cmVhbSk7XG5cbiAgICAgIG1heWJlUmVhZE1vcmUoc3RyZWFtLCBzdGF0ZSk7XG4gICAgfVxuICB9IGVsc2UgaWYgKCFhZGRUb0Zyb250KSB7XG4gICAgc3RhdGUucmVhZGluZyA9IGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIG5lZWRNb3JlRGF0YShzdGF0ZSk7XG59XG5cblxuXG4vLyBpZiBpdCdzIHBhc3QgdGhlIGhpZ2ggd2F0ZXIgbWFyaywgd2UgY2FuIHB1c2ggaW4gc29tZSBtb3JlLlxuLy8gQWxzbywgaWYgd2UgaGF2ZSBubyBkYXRhIHlldCwgd2UgY2FuIHN0YW5kIHNvbWVcbi8vIG1vcmUgYnl0ZXMuICBUaGlzIGlzIHRvIHdvcmsgYXJvdW5kIGNhc2VzIHdoZXJlIGh3bT0wLFxuLy8gc3VjaCBhcyB0aGUgcmVwbC4gIEFsc28sIGlmIHRoZSBwdXNoKCkgdHJpZ2dlcmVkIGFcbi8vIHJlYWRhYmxlIGV2ZW50LCBhbmQgdGhlIHVzZXIgY2FsbGVkIHJlYWQobGFyZ2VOdW1iZXIpIHN1Y2ggdGhhdFxuLy8gbmVlZFJlYWRhYmxlIHdhcyBzZXQsIHRoZW4gd2Ugb3VnaHQgdG8gcHVzaCBtb3JlLCBzbyB0aGF0IGFub3RoZXJcbi8vICdyZWFkYWJsZScgZXZlbnQgd2lsbCBiZSB0cmlnZ2VyZWQuXG5mdW5jdGlvbiBuZWVkTW9yZURhdGEoc3RhdGUpIHtcbiAgcmV0dXJuICFzdGF0ZS5lbmRlZCAmJlxuICAgICAgICAgKHN0YXRlLm5lZWRSZWFkYWJsZSB8fFxuICAgICAgICAgIHN0YXRlLmxlbmd0aCA8IHN0YXRlLmhpZ2hXYXRlck1hcmsgfHxcbiAgICAgICAgICBzdGF0ZS5sZW5ndGggPT09IDApO1xufVxuXG4vLyBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eS5cblJlYWRhYmxlLnByb3RvdHlwZS5zZXRFbmNvZGluZyA9IGZ1bmN0aW9uKGVuYykge1xuICBpZiAoIVN0cmluZ0RlY29kZXIpXG4gICAgU3RyaW5nRGVjb2RlciA9IHJlcXVpcmUoJ3N0cmluZ19kZWNvZGVyLycpLlN0cmluZ0RlY29kZXI7XG4gIHRoaXMuX3JlYWRhYmxlU3RhdGUuZGVjb2RlciA9IG5ldyBTdHJpbmdEZWNvZGVyKGVuYyk7XG4gIHRoaXMuX3JlYWRhYmxlU3RhdGUuZW5jb2RpbmcgPSBlbmM7XG59O1xuXG4vLyBEb24ndCByYWlzZSB0aGUgaHdtID4gMTI4TUJcbnZhciBNQVhfSFdNID0gMHg4MDAwMDA7XG5mdW5jdGlvbiByb3VuZFVwVG9OZXh0UG93ZXJPZjIobikge1xuICBpZiAobiA+PSBNQVhfSFdNKSB7XG4gICAgbiA9IE1BWF9IV007XG4gIH0gZWxzZSB7XG4gICAgLy8gR2V0IHRoZSBuZXh0IGhpZ2hlc3QgcG93ZXIgb2YgMlxuICAgIG4tLTtcbiAgICBmb3IgKHZhciBwID0gMTsgcCA8IDMyOyBwIDw8PSAxKSBuIHw9IG4gPj4gcDtcbiAgICBuKys7XG4gIH1cbiAgcmV0dXJuIG47XG59XG5cbmZ1bmN0aW9uIGhvd011Y2hUb1JlYWQobiwgc3RhdGUpIHtcbiAgaWYgKHN0YXRlLmxlbmd0aCA9PT0gMCAmJiBzdGF0ZS5lbmRlZClcbiAgICByZXR1cm4gMDtcblxuICBpZiAoc3RhdGUub2JqZWN0TW9kZSlcbiAgICByZXR1cm4gbiA9PT0gMCA/IDAgOiAxO1xuXG4gIGlmIChuID09PSBudWxsIHx8IGlzTmFOKG4pKSB7XG4gICAgLy8gb25seSBmbG93IG9uZSBidWZmZXIgYXQgYSB0aW1lXG4gICAgaWYgKHN0YXRlLmZsb3dpbmcgJiYgc3RhdGUuYnVmZmVyLmxlbmd0aClcbiAgICAgIHJldHVybiBzdGF0ZS5idWZmZXJbMF0ubGVuZ3RoO1xuICAgIGVsc2VcbiAgICAgIHJldHVybiBzdGF0ZS5sZW5ndGg7XG4gIH1cblxuICBpZiAobiA8PSAwKVxuICAgIHJldHVybiAwO1xuXG4gIC8vIElmIHdlJ3JlIGFza2luZyBmb3IgbW9yZSB0aGFuIHRoZSB0YXJnZXQgYnVmZmVyIGxldmVsLFxuICAvLyB0aGVuIHJhaXNlIHRoZSB3YXRlciBtYXJrLiAgQnVtcCB1cCB0byB0aGUgbmV4dCBoaWdoZXN0XG4gIC8vIHBvd2VyIG9mIDIsIHRvIHByZXZlbnQgaW5jcmVhc2luZyBpdCBleGNlc3NpdmVseSBpbiB0aW55XG4gIC8vIGFtb3VudHMuXG4gIGlmIChuID4gc3RhdGUuaGlnaFdhdGVyTWFyaylcbiAgICBzdGF0ZS5oaWdoV2F0ZXJNYXJrID0gcm91bmRVcFRvTmV4dFBvd2VyT2YyKG4pO1xuXG4gIC8vIGRvbid0IGhhdmUgdGhhdCBtdWNoLiAgcmV0dXJuIG51bGwsIHVubGVzcyB3ZSd2ZSBlbmRlZC5cbiAgaWYgKG4gPiBzdGF0ZS5sZW5ndGgpIHtcbiAgICBpZiAoIXN0YXRlLmVuZGVkKSB7XG4gICAgICBzdGF0ZS5uZWVkUmVhZGFibGUgPSB0cnVlO1xuICAgICAgcmV0dXJuIDA7XG4gICAgfSBlbHNlXG4gICAgICByZXR1cm4gc3RhdGUubGVuZ3RoO1xuICB9XG5cbiAgcmV0dXJuIG47XG59XG5cbi8vIHlvdSBjYW4gb3ZlcnJpZGUgZWl0aGVyIHRoaXMgbWV0aG9kLCBvciB0aGUgYXN5bmMgX3JlYWQobikgYmVsb3cuXG5SZWFkYWJsZS5wcm90b3R5cGUucmVhZCA9IGZ1bmN0aW9uKG4pIHtcbiAgdmFyIHN0YXRlID0gdGhpcy5fcmVhZGFibGVTdGF0ZTtcbiAgc3RhdGUuY2FsbGVkUmVhZCA9IHRydWU7XG4gIHZhciBuT3JpZyA9IG47XG4gIHZhciByZXQ7XG5cbiAgaWYgKHR5cGVvZiBuICE9PSAnbnVtYmVyJyB8fCBuID4gMClcbiAgICBzdGF0ZS5lbWl0dGVkUmVhZGFibGUgPSBmYWxzZTtcblxuICAvLyBpZiB3ZSdyZSBkb2luZyByZWFkKDApIHRvIHRyaWdnZXIgYSByZWFkYWJsZSBldmVudCwgYnV0IHdlXG4gIC8vIGFscmVhZHkgaGF2ZSBhIGJ1bmNoIG9mIGRhdGEgaW4gdGhlIGJ1ZmZlciwgdGhlbiBqdXN0IHRyaWdnZXJcbiAgLy8gdGhlICdyZWFkYWJsZScgZXZlbnQgYW5kIG1vdmUgb24uXG4gIGlmIChuID09PSAwICYmXG4gICAgICBzdGF0ZS5uZWVkUmVhZGFibGUgJiZcbiAgICAgIChzdGF0ZS5sZW5ndGggPj0gc3RhdGUuaGlnaFdhdGVyTWFyayB8fCBzdGF0ZS5lbmRlZCkpIHtcbiAgICBlbWl0UmVhZGFibGUodGhpcyk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBuID0gaG93TXVjaFRvUmVhZChuLCBzdGF0ZSk7XG5cbiAgLy8gaWYgd2UndmUgZW5kZWQsIGFuZCB3ZSdyZSBub3cgY2xlYXIsIHRoZW4gZmluaXNoIGl0IHVwLlxuICBpZiAobiA9PT0gMCAmJiBzdGF0ZS5lbmRlZCkge1xuICAgIHJldCA9IG51bGw7XG5cbiAgICAvLyBJbiBjYXNlcyB3aGVyZSB0aGUgZGVjb2RlciBkaWQgbm90IHJlY2VpdmUgZW5vdWdoIGRhdGFcbiAgICAvLyB0byBwcm9kdWNlIGEgZnVsbCBjaHVuaywgdGhlbiBpbW1lZGlhdGVseSByZWNlaXZlZCBhblxuICAgIC8vIEVPRiwgc3RhdGUuYnVmZmVyIHdpbGwgY29udGFpbiBbPEJ1ZmZlciA+LCA8QnVmZmVyIDAwIC4uLj5dLlxuICAgIC8vIGhvd011Y2hUb1JlYWQgd2lsbCBzZWUgdGhpcyBhbmQgY29lcmNlIHRoZSBhbW91bnQgdG9cbiAgICAvLyByZWFkIHRvIHplcm8gKGJlY2F1c2UgaXQncyBsb29raW5nIGF0IHRoZSBsZW5ndGggb2YgdGhlXG4gICAgLy8gZmlyc3QgPEJ1ZmZlciA+IGluIHN0YXRlLmJ1ZmZlciksIGFuZCB3ZSdsbCBlbmQgdXAgaGVyZS5cbiAgICAvL1xuICAgIC8vIFRoaXMgY2FuIG9ubHkgaGFwcGVuIHZpYSBzdGF0ZS5kZWNvZGVyIC0tIG5vIG90aGVyIHZlbnVlXG4gICAgLy8gZXhpc3RzIGZvciBwdXNoaW5nIGEgemVyby1sZW5ndGggY2h1bmsgaW50byBzdGF0ZS5idWZmZXJcbiAgICAvLyBhbmQgdHJpZ2dlcmluZyB0aGlzIGJlaGF2aW9yLiBJbiB0aGlzIGNhc2UsIHdlIHJldHVybiBvdXJcbiAgICAvLyByZW1haW5pbmcgZGF0YSBhbmQgZW5kIHRoZSBzdHJlYW0sIGlmIGFwcHJvcHJpYXRlLlxuICAgIGlmIChzdGF0ZS5sZW5ndGggPiAwICYmIHN0YXRlLmRlY29kZXIpIHtcbiAgICAgIHJldCA9IGZyb21MaXN0KG4sIHN0YXRlKTtcbiAgICAgIHN0YXRlLmxlbmd0aCAtPSByZXQubGVuZ3RoO1xuICAgIH1cblxuICAgIGlmIChzdGF0ZS5sZW5ndGggPT09IDApXG4gICAgICBlbmRSZWFkYWJsZSh0aGlzKTtcblxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICAvLyBBbGwgdGhlIGFjdHVhbCBjaHVuayBnZW5lcmF0aW9uIGxvZ2ljIG5lZWRzIHRvIGJlXG4gIC8vICpiZWxvdyogdGhlIGNhbGwgdG8gX3JlYWQuICBUaGUgcmVhc29uIGlzIHRoYXQgaW4gY2VydGFpblxuICAvLyBzeW50aGV0aWMgc3RyZWFtIGNhc2VzLCBzdWNoIGFzIHBhc3N0aHJvdWdoIHN0cmVhbXMsIF9yZWFkXG4gIC8vIG1heSBiZSBhIGNvbXBsZXRlbHkgc3luY2hyb25vdXMgb3BlcmF0aW9uIHdoaWNoIG1heSBjaGFuZ2VcbiAgLy8gdGhlIHN0YXRlIG9mIHRoZSByZWFkIGJ1ZmZlciwgcHJvdmlkaW5nIGVub3VnaCBkYXRhIHdoZW5cbiAgLy8gYmVmb3JlIHRoZXJlIHdhcyAqbm90KiBlbm91Z2guXG4gIC8vXG4gIC8vIFNvLCB0aGUgc3RlcHMgYXJlOlxuICAvLyAxLiBGaWd1cmUgb3V0IHdoYXQgdGhlIHN0YXRlIG9mIHRoaW5ncyB3aWxsIGJlIGFmdGVyIHdlIGRvXG4gIC8vIGEgcmVhZCBmcm9tIHRoZSBidWZmZXIuXG4gIC8vXG4gIC8vIDIuIElmIHRoYXQgcmVzdWx0aW5nIHN0YXRlIHdpbGwgdHJpZ2dlciBhIF9yZWFkLCB0aGVuIGNhbGwgX3JlYWQuXG4gIC8vIE5vdGUgdGhhdCB0aGlzIG1heSBiZSBhc3luY2hyb25vdXMsIG9yIHN5bmNocm9ub3VzLiAgWWVzLCBpdCBpc1xuICAvLyBkZWVwbHkgdWdseSB0byB3cml0ZSBBUElzIHRoaXMgd2F5LCBidXQgdGhhdCBzdGlsbCBkb2Vzbid0IG1lYW5cbiAgLy8gdGhhdCB0aGUgUmVhZGFibGUgY2xhc3Mgc2hvdWxkIGJlaGF2ZSBpbXByb3Blcmx5LCBhcyBzdHJlYW1zIGFyZVxuICAvLyBkZXNpZ25lZCB0byBiZSBzeW5jL2FzeW5jIGFnbm9zdGljLlxuICAvLyBUYWtlIG5vdGUgaWYgdGhlIF9yZWFkIGNhbGwgaXMgc3luYyBvciBhc3luYyAoaWUsIGlmIHRoZSByZWFkIGNhbGxcbiAgLy8gaGFzIHJldHVybmVkIHlldCksIHNvIHRoYXQgd2Uga25vdyB3aGV0aGVyIG9yIG5vdCBpdCdzIHNhZmUgdG8gZW1pdFxuICAvLyAncmVhZGFibGUnIGV0Yy5cbiAgLy9cbiAgLy8gMy4gQWN0dWFsbHkgcHVsbCB0aGUgcmVxdWVzdGVkIGNodW5rcyBvdXQgb2YgdGhlIGJ1ZmZlciBhbmQgcmV0dXJuLlxuXG4gIC8vIGlmIHdlIG5lZWQgYSByZWFkYWJsZSBldmVudCwgdGhlbiB3ZSBuZWVkIHRvIGRvIHNvbWUgcmVhZGluZy5cbiAgdmFyIGRvUmVhZCA9IHN0YXRlLm5lZWRSZWFkYWJsZTtcblxuICAvLyBpZiB3ZSBjdXJyZW50bHkgaGF2ZSBsZXNzIHRoYW4gdGhlIGhpZ2hXYXRlck1hcmssIHRoZW4gYWxzbyByZWFkIHNvbWVcbiAgaWYgKHN0YXRlLmxlbmd0aCAtIG4gPD0gc3RhdGUuaGlnaFdhdGVyTWFyaylcbiAgICBkb1JlYWQgPSB0cnVlO1xuXG4gIC8vIGhvd2V2ZXIsIGlmIHdlJ3ZlIGVuZGVkLCB0aGVuIHRoZXJlJ3Mgbm8gcG9pbnQsIGFuZCBpZiB3ZSdyZSBhbHJlYWR5XG4gIC8vIHJlYWRpbmcsIHRoZW4gaXQncyB1bm5lY2Vzc2FyeS5cbiAgaWYgKHN0YXRlLmVuZGVkIHx8IHN0YXRlLnJlYWRpbmcpXG4gICAgZG9SZWFkID0gZmFsc2U7XG5cbiAgaWYgKGRvUmVhZCkge1xuICAgIHN0YXRlLnJlYWRpbmcgPSB0cnVlO1xuICAgIHN0YXRlLnN5bmMgPSB0cnVlO1xuICAgIC8vIGlmIHRoZSBsZW5ndGggaXMgY3VycmVudGx5IHplcm8sIHRoZW4gd2UgKm5lZWQqIGEgcmVhZGFibGUgZXZlbnQuXG4gICAgaWYgKHN0YXRlLmxlbmd0aCA9PT0gMClcbiAgICAgIHN0YXRlLm5lZWRSZWFkYWJsZSA9IHRydWU7XG4gICAgLy8gY2FsbCBpbnRlcm5hbCByZWFkIG1ldGhvZFxuICAgIHRoaXMuX3JlYWQoc3RhdGUuaGlnaFdhdGVyTWFyayk7XG4gICAgc3RhdGUuc3luYyA9IGZhbHNlO1xuICB9XG5cbiAgLy8gSWYgX3JlYWQgY2FsbGVkIGl0cyBjYWxsYmFjayBzeW5jaHJvbm91c2x5LCB0aGVuIGByZWFkaW5nYFxuICAvLyB3aWxsIGJlIGZhbHNlLCBhbmQgd2UgbmVlZCB0byByZS1ldmFsdWF0ZSBob3cgbXVjaCBkYXRhIHdlXG4gIC8vIGNhbiByZXR1cm4gdG8gdGhlIHVzZXIuXG4gIGlmIChkb1JlYWQgJiYgIXN0YXRlLnJlYWRpbmcpXG4gICAgbiA9IGhvd011Y2hUb1JlYWQobk9yaWcsIHN0YXRlKTtcblxuICBpZiAobiA+IDApXG4gICAgcmV0ID0gZnJvbUxpc3Qobiwgc3RhdGUpO1xuICBlbHNlXG4gICAgcmV0ID0gbnVsbDtcblxuICBpZiAocmV0ID09PSBudWxsKSB7XG4gICAgc3RhdGUubmVlZFJlYWRhYmxlID0gdHJ1ZTtcbiAgICBuID0gMDtcbiAgfVxuXG4gIHN0YXRlLmxlbmd0aCAtPSBuO1xuXG4gIC8vIElmIHdlIGhhdmUgbm90aGluZyBpbiB0aGUgYnVmZmVyLCB0aGVuIHdlIHdhbnQgdG8ga25vd1xuICAvLyBhcyBzb29uIGFzIHdlICpkbyogZ2V0IHNvbWV0aGluZyBpbnRvIHRoZSBidWZmZXIuXG4gIGlmIChzdGF0ZS5sZW5ndGggPT09IDAgJiYgIXN0YXRlLmVuZGVkKVxuICAgIHN0YXRlLm5lZWRSZWFkYWJsZSA9IHRydWU7XG5cbiAgLy8gSWYgd2UgaGFwcGVuZWQgdG8gcmVhZCgpIGV4YWN0bHkgdGhlIHJlbWFpbmluZyBhbW91bnQgaW4gdGhlXG4gIC8vIGJ1ZmZlciwgYW5kIHRoZSBFT0YgaGFzIGJlZW4gc2VlbiBhdCB0aGlzIHBvaW50LCB0aGVuIG1ha2Ugc3VyZVxuICAvLyB0aGF0IHdlIGVtaXQgJ2VuZCcgb24gdGhlIHZlcnkgbmV4dCB0aWNrLlxuICBpZiAoc3RhdGUuZW5kZWQgJiYgIXN0YXRlLmVuZEVtaXR0ZWQgJiYgc3RhdGUubGVuZ3RoID09PSAwKVxuICAgIGVuZFJlYWRhYmxlKHRoaXMpO1xuXG4gIHJldHVybiByZXQ7XG59O1xuXG5mdW5jdGlvbiBjaHVua0ludmFsaWQoc3RhdGUsIGNodW5rKSB7XG4gIHZhciBlciA9IG51bGw7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKGNodW5rKSAmJlxuICAgICAgJ3N0cmluZycgIT09IHR5cGVvZiBjaHVuayAmJlxuICAgICAgY2h1bmsgIT09IG51bGwgJiZcbiAgICAgIGNodW5rICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICFzdGF0ZS5vYmplY3RNb2RlKSB7XG4gICAgZXIgPSBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIG5vbi1zdHJpbmcvYnVmZmVyIGNodW5rJyk7XG4gIH1cbiAgcmV0dXJuIGVyO1xufVxuXG5cbmZ1bmN0aW9uIG9uRW9mQ2h1bmsoc3RyZWFtLCBzdGF0ZSkge1xuICBpZiAoc3RhdGUuZGVjb2RlciAmJiAhc3RhdGUuZW5kZWQpIHtcbiAgICB2YXIgY2h1bmsgPSBzdGF0ZS5kZWNvZGVyLmVuZCgpO1xuICAgIGlmIChjaHVuayAmJiBjaHVuay5sZW5ndGgpIHtcbiAgICAgIHN0YXRlLmJ1ZmZlci5wdXNoKGNodW5rKTtcbiAgICAgIHN0YXRlLmxlbmd0aCArPSBzdGF0ZS5vYmplY3RNb2RlID8gMSA6IGNodW5rLmxlbmd0aDtcbiAgICB9XG4gIH1cbiAgc3RhdGUuZW5kZWQgPSB0cnVlO1xuXG4gIC8vIGlmIHdlJ3ZlIGVuZGVkIGFuZCB3ZSBoYXZlIHNvbWUgZGF0YSBsZWZ0LCB0aGVuIGVtaXRcbiAgLy8gJ3JlYWRhYmxlJyBub3cgdG8gbWFrZSBzdXJlIGl0IGdldHMgcGlja2VkIHVwLlxuICBpZiAoc3RhdGUubGVuZ3RoID4gMClcbiAgICBlbWl0UmVhZGFibGUoc3RyZWFtKTtcbiAgZWxzZVxuICAgIGVuZFJlYWRhYmxlKHN0cmVhbSk7XG59XG5cbi8vIERvbid0IGVtaXQgcmVhZGFibGUgcmlnaHQgYXdheSBpbiBzeW5jIG1vZGUsIGJlY2F1c2UgdGhpcyBjYW4gdHJpZ2dlclxuLy8gYW5vdGhlciByZWFkKCkgY2FsbCA9PiBzdGFjayBvdmVyZmxvdy4gIFRoaXMgd2F5LCBpdCBtaWdodCB0cmlnZ2VyXG4vLyBhIG5leHRUaWNrIHJlY3Vyc2lvbiB3YXJuaW5nLCBidXQgdGhhdCdzIG5vdCBzbyBiYWQuXG5mdW5jdGlvbiBlbWl0UmVhZGFibGUoc3RyZWFtKSB7XG4gIHZhciBzdGF0ZSA9IHN0cmVhbS5fcmVhZGFibGVTdGF0ZTtcbiAgc3RhdGUubmVlZFJlYWRhYmxlID0gZmFsc2U7XG4gIGlmIChzdGF0ZS5lbWl0dGVkUmVhZGFibGUpXG4gICAgcmV0dXJuO1xuXG4gIHN0YXRlLmVtaXR0ZWRSZWFkYWJsZSA9IHRydWU7XG4gIGlmIChzdGF0ZS5zeW5jKVxuICAgIHByb2Nlc3MubmV4dFRpY2soZnVuY3Rpb24oKSB7XG4gICAgICBlbWl0UmVhZGFibGVfKHN0cmVhbSk7XG4gICAgfSk7XG4gIGVsc2VcbiAgICBlbWl0UmVhZGFibGVfKHN0cmVhbSk7XG59XG5cbmZ1bmN0aW9uIGVtaXRSZWFkYWJsZV8oc3RyZWFtKSB7XG4gIHN0cmVhbS5lbWl0KCdyZWFkYWJsZScpO1xufVxuXG5cbi8vIGF0IHRoaXMgcG9pbnQsIHRoZSB1c2VyIGhhcyBwcmVzdW1hYmx5IHNlZW4gdGhlICdyZWFkYWJsZScgZXZlbnQsXG4vLyBhbmQgY2FsbGVkIHJlYWQoKSB0byBjb25zdW1lIHNvbWUgZGF0YS4gIHRoYXQgbWF5IGhhdmUgdHJpZ2dlcmVkXG4vLyBpbiB0dXJuIGFub3RoZXIgX3JlYWQobikgY2FsbCwgaW4gd2hpY2ggY2FzZSByZWFkaW5nID0gdHJ1ZSBpZlxuLy8gaXQncyBpbiBwcm9ncmVzcy5cbi8vIEhvd2V2ZXIsIGlmIHdlJ3JlIG5vdCBlbmRlZCwgb3IgcmVhZGluZywgYW5kIHRoZSBsZW5ndGggPCBod20sXG4vLyB0aGVuIGdvIGFoZWFkIGFuZCB0cnkgdG8gcmVhZCBzb21lIG1vcmUgcHJlZW1wdGl2ZWx5LlxuZnVuY3Rpb24gbWF5YmVSZWFkTW9yZShzdHJlYW0sIHN0YXRlKSB7XG4gIGlmICghc3RhdGUucmVhZGluZ01vcmUpIHtcbiAgICBzdGF0ZS5yZWFkaW5nTW9yZSA9IHRydWU7XG4gICAgcHJvY2Vzcy5uZXh0VGljayhmdW5jdGlvbigpIHtcbiAgICAgIG1heWJlUmVhZE1vcmVfKHN0cmVhbSwgc3RhdGUpO1xuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIG1heWJlUmVhZE1vcmVfKHN0cmVhbSwgc3RhdGUpIHtcbiAgdmFyIGxlbiA9IHN0YXRlLmxlbmd0aDtcbiAgd2hpbGUgKCFzdGF0ZS5yZWFkaW5nICYmICFzdGF0ZS5mbG93aW5nICYmICFzdGF0ZS5lbmRlZCAmJlxuICAgICAgICAgc3RhdGUubGVuZ3RoIDwgc3RhdGUuaGlnaFdhdGVyTWFyaykge1xuICAgIHN0cmVhbS5yZWFkKDApO1xuICAgIGlmIChsZW4gPT09IHN0YXRlLmxlbmd0aClcbiAgICAgIC8vIGRpZG4ndCBnZXQgYW55IGRhdGEsIHN0b3Agc3Bpbm5pbmcuXG4gICAgICBicmVhaztcbiAgICBlbHNlXG4gICAgICBsZW4gPSBzdGF0ZS5sZW5ndGg7XG4gIH1cbiAgc3RhdGUucmVhZGluZ01vcmUgPSBmYWxzZTtcbn1cblxuLy8gYWJzdHJhY3QgbWV0aG9kLiAgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzcGVjaWZpYyBpbXBsZW1lbnRhdGlvbiBjbGFzc2VzLlxuLy8gY2FsbCBjYihlciwgZGF0YSkgd2hlcmUgZGF0YSBpcyA8PSBuIGluIGxlbmd0aC5cbi8vIGZvciB2aXJ0dWFsIChub24tc3RyaW5nLCBub24tYnVmZmVyKSBzdHJlYW1zLCBcImxlbmd0aFwiIGlzIHNvbWV3aGF0XG4vLyBhcmJpdHJhcnksIGFuZCBwZXJoYXBzIG5vdCB2ZXJ5IG1lYW5pbmdmdWwuXG5SZWFkYWJsZS5wcm90b3R5cGUuX3JlYWQgPSBmdW5jdGlvbihuKSB7XG4gIHRoaXMuZW1pdCgnZXJyb3InLCBuZXcgRXJyb3IoJ25vdCBpbXBsZW1lbnRlZCcpKTtcbn07XG5cblJlYWRhYmxlLnByb3RvdHlwZS5waXBlID0gZnVuY3Rpb24oZGVzdCwgcGlwZU9wdHMpIHtcbiAgdmFyIHNyYyA9IHRoaXM7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX3JlYWRhYmxlU3RhdGU7XG5cbiAgc3dpdGNoIChzdGF0ZS5waXBlc0NvdW50KSB7XG4gICAgY2FzZSAwOlxuICAgICAgc3RhdGUucGlwZXMgPSBkZXN0O1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAxOlxuICAgICAgc3RhdGUucGlwZXMgPSBbc3RhdGUucGlwZXMsIGRlc3RdO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHN0YXRlLnBpcGVzLnB1c2goZGVzdCk7XG4gICAgICBicmVhaztcbiAgfVxuICBzdGF0ZS5waXBlc0NvdW50ICs9IDE7XG5cbiAgdmFyIGRvRW5kID0gKCFwaXBlT3B0cyB8fCBwaXBlT3B0cy5lbmQgIT09IGZhbHNlKSAmJlxuICAgICAgICAgICAgICBkZXN0ICE9PSBwcm9jZXNzLnN0ZG91dCAmJlxuICAgICAgICAgICAgICBkZXN0ICE9PSBwcm9jZXNzLnN0ZGVycjtcblxuICB2YXIgZW5kRm4gPSBkb0VuZCA/IG9uZW5kIDogY2xlYW51cDtcbiAgaWYgKHN0YXRlLmVuZEVtaXR0ZWQpXG4gICAgcHJvY2Vzcy5uZXh0VGljayhlbmRGbik7XG4gIGVsc2VcbiAgICBzcmMub25jZSgnZW5kJywgZW5kRm4pO1xuXG4gIGRlc3Qub24oJ3VucGlwZScsIG9udW5waXBlKTtcbiAgZnVuY3Rpb24gb251bnBpcGUocmVhZGFibGUpIHtcbiAgICBpZiAocmVhZGFibGUgIT09IHNyYykgcmV0dXJuO1xuICAgIGNsZWFudXAoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9uZW5kKCkge1xuICAgIGRlc3QuZW5kKCk7XG4gIH1cblxuICAvLyB3aGVuIHRoZSBkZXN0IGRyYWlucywgaXQgcmVkdWNlcyB0aGUgYXdhaXREcmFpbiBjb3VudGVyXG4gIC8vIG9uIHRoZSBzb3VyY2UuICBUaGlzIHdvdWxkIGJlIG1vcmUgZWxlZ2FudCB3aXRoIGEgLm9uY2UoKVxuICAvLyBoYW5kbGVyIGluIGZsb3coKSwgYnV0IGFkZGluZyBhbmQgcmVtb3ZpbmcgcmVwZWF0ZWRseSBpc1xuICAvLyB0b28gc2xvdy5cbiAgdmFyIG9uZHJhaW4gPSBwaXBlT25EcmFpbihzcmMpO1xuICBkZXN0Lm9uKCdkcmFpbicsIG9uZHJhaW4pO1xuXG4gIGZ1bmN0aW9uIGNsZWFudXAoKSB7XG4gICAgLy8gY2xlYW51cCBldmVudCBoYW5kbGVycyBvbmNlIHRoZSBwaXBlIGlzIGJyb2tlblxuICAgIGRlc3QucmVtb3ZlTGlzdGVuZXIoJ2Nsb3NlJywgb25jbG9zZSk7XG4gICAgZGVzdC5yZW1vdmVMaXN0ZW5lcignZmluaXNoJywgb25maW5pc2gpO1xuICAgIGRlc3QucmVtb3ZlTGlzdGVuZXIoJ2RyYWluJywgb25kcmFpbik7XG4gICAgZGVzdC5yZW1vdmVMaXN0ZW5lcignZXJyb3InLCBvbmVycm9yKTtcbiAgICBkZXN0LnJlbW92ZUxpc3RlbmVyKCd1bnBpcGUnLCBvbnVucGlwZSk7XG4gICAgc3JjLnJlbW92ZUxpc3RlbmVyKCdlbmQnLCBvbmVuZCk7XG4gICAgc3JjLnJlbW92ZUxpc3RlbmVyKCdlbmQnLCBjbGVhbnVwKTtcblxuICAgIC8vIGlmIHRoZSByZWFkZXIgaXMgd2FpdGluZyBmb3IgYSBkcmFpbiBldmVudCBmcm9tIHRoaXNcbiAgICAvLyBzcGVjaWZpYyB3cml0ZXIsIHRoZW4gaXQgd291bGQgY2F1c2UgaXQgdG8gbmV2ZXIgc3RhcnRcbiAgICAvLyBmbG93aW5nIGFnYWluLlxuICAgIC8vIFNvLCBpZiB0aGlzIGlzIGF3YWl0aW5nIGEgZHJhaW4sIHRoZW4gd2UganVzdCBjYWxsIGl0IG5vdy5cbiAgICAvLyBJZiB3ZSBkb24ndCBrbm93LCB0aGVuIGFzc3VtZSB0aGF0IHdlIGFyZSB3YWl0aW5nIGZvciBvbmUuXG4gICAgaWYgKCFkZXN0Ll93cml0YWJsZVN0YXRlIHx8IGRlc3QuX3dyaXRhYmxlU3RhdGUubmVlZERyYWluKVxuICAgICAgb25kcmFpbigpO1xuICB9XG5cbiAgLy8gaWYgdGhlIGRlc3QgaGFzIGFuIGVycm9yLCB0aGVuIHN0b3AgcGlwaW5nIGludG8gaXQuXG4gIC8vIGhvd2V2ZXIsIGRvbid0IHN1cHByZXNzIHRoZSB0aHJvd2luZyBiZWhhdmlvciBmb3IgdGhpcy5cbiAgZnVuY3Rpb24gb25lcnJvcihlcikge1xuICAgIHVucGlwZSgpO1xuICAgIGRlc3QucmVtb3ZlTGlzdGVuZXIoJ2Vycm9yJywgb25lcnJvcik7XG4gICAgaWYgKEVFLmxpc3RlbmVyQ291bnQoZGVzdCwgJ2Vycm9yJykgPT09IDApXG4gICAgICBkZXN0LmVtaXQoJ2Vycm9yJywgZXIpO1xuICB9XG4gIC8vIFRoaXMgaXMgYSBicnV0YWxseSB1Z2x5IGhhY2sgdG8gbWFrZSBzdXJlIHRoYXQgb3VyIGVycm9yIGhhbmRsZXJcbiAgLy8gaXMgYXR0YWNoZWQgYmVmb3JlIGFueSB1c2VybGFuZCBvbmVzLiAgTkVWRVIgRE8gVEhJUy5cbiAgaWYgKCFkZXN0Ll9ldmVudHMgfHwgIWRlc3QuX2V2ZW50cy5lcnJvcilcbiAgICBkZXN0Lm9uKCdlcnJvcicsIG9uZXJyb3IpO1xuICBlbHNlIGlmIChpc0FycmF5KGRlc3QuX2V2ZW50cy5lcnJvcikpXG4gICAgZGVzdC5fZXZlbnRzLmVycm9yLnVuc2hpZnQob25lcnJvcik7XG4gIGVsc2VcbiAgICBkZXN0Ll9ldmVudHMuZXJyb3IgPSBbb25lcnJvciwgZGVzdC5fZXZlbnRzLmVycm9yXTtcblxuXG5cbiAgLy8gQm90aCBjbG9zZSBhbmQgZmluaXNoIHNob3VsZCB0cmlnZ2VyIHVucGlwZSwgYnV0IG9ubHkgb25jZS5cbiAgZnVuY3Rpb24gb25jbG9zZSgpIHtcbiAgICBkZXN0LnJlbW92ZUxpc3RlbmVyKCdmaW5pc2gnLCBvbmZpbmlzaCk7XG4gICAgdW5waXBlKCk7XG4gIH1cbiAgZGVzdC5vbmNlKCdjbG9zZScsIG9uY2xvc2UpO1xuICBmdW5jdGlvbiBvbmZpbmlzaCgpIHtcbiAgICBkZXN0LnJlbW92ZUxpc3RlbmVyKCdjbG9zZScsIG9uY2xvc2UpO1xuICAgIHVucGlwZSgpO1xuICB9XG4gIGRlc3Qub25jZSgnZmluaXNoJywgb25maW5pc2gpO1xuXG4gIGZ1bmN0aW9uIHVucGlwZSgpIHtcbiAgICBzcmMudW5waXBlKGRlc3QpO1xuICB9XG5cbiAgLy8gdGVsbCB0aGUgZGVzdCB0aGF0IGl0J3MgYmVpbmcgcGlwZWQgdG9cbiAgZGVzdC5lbWl0KCdwaXBlJywgc3JjKTtcblxuICAvLyBzdGFydCB0aGUgZmxvdyBpZiBpdCBoYXNuJ3QgYmVlbiBzdGFydGVkIGFscmVhZHkuXG4gIGlmICghc3RhdGUuZmxvd2luZykge1xuICAgIC8vIHRoZSBoYW5kbGVyIHRoYXQgd2FpdHMgZm9yIHJlYWRhYmxlIGV2ZW50cyBhZnRlciBhbGxcbiAgICAvLyB0aGUgZGF0YSBnZXRzIHN1Y2tlZCBvdXQgaW4gZmxvdy5cbiAgICAvLyBUaGlzIHdvdWxkIGJlIGVhc2llciB0byBmb2xsb3cgd2l0aCBhIC5vbmNlKCkgaGFuZGxlclxuICAgIC8vIGluIGZsb3coKSwgYnV0IHRoYXQgaXMgdG9vIHNsb3cuXG4gICAgdGhpcy5vbigncmVhZGFibGUnLCBwaXBlT25SZWFkYWJsZSk7XG5cbiAgICBzdGF0ZS5mbG93aW5nID0gdHJ1ZTtcbiAgICBwcm9jZXNzLm5leHRUaWNrKGZ1bmN0aW9uKCkge1xuICAgICAgZmxvdyhzcmMpO1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIGRlc3Q7XG59O1xuXG5mdW5jdGlvbiBwaXBlT25EcmFpbihzcmMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBkZXN0ID0gdGhpcztcbiAgICB2YXIgc3RhdGUgPSBzcmMuX3JlYWRhYmxlU3RhdGU7XG4gICAgc3RhdGUuYXdhaXREcmFpbi0tO1xuICAgIGlmIChzdGF0ZS5hd2FpdERyYWluID09PSAwKVxuICAgICAgZmxvdyhzcmMpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBmbG93KHNyYykge1xuICB2YXIgc3RhdGUgPSBzcmMuX3JlYWRhYmxlU3RhdGU7XG4gIHZhciBjaHVuaztcbiAgc3RhdGUuYXdhaXREcmFpbiA9IDA7XG5cbiAgZnVuY3Rpb24gd3JpdGUoZGVzdCwgaSwgbGlzdCkge1xuICAgIHZhciB3cml0dGVuID0gZGVzdC53cml0ZShjaHVuayk7XG4gICAgaWYgKGZhbHNlID09PSB3cml0dGVuKSB7XG4gICAgICBzdGF0ZS5hd2FpdERyYWluKys7XG4gICAgfVxuICB9XG5cbiAgd2hpbGUgKHN0YXRlLnBpcGVzQ291bnQgJiYgbnVsbCAhPT0gKGNodW5rID0gc3JjLnJlYWQoKSkpIHtcblxuICAgIGlmIChzdGF0ZS5waXBlc0NvdW50ID09PSAxKVxuICAgICAgd3JpdGUoc3RhdGUucGlwZXMsIDAsIG51bGwpO1xuICAgIGVsc2VcbiAgICAgIGZvckVhY2goc3RhdGUucGlwZXMsIHdyaXRlKTtcblxuICAgIHNyYy5lbWl0KCdkYXRhJywgY2h1bmspO1xuXG4gICAgLy8gaWYgYW55b25lIG5lZWRzIGEgZHJhaW4sIHRoZW4gd2UgaGF2ZSB0byB3YWl0IGZvciB0aGF0LlxuICAgIGlmIChzdGF0ZS5hd2FpdERyYWluID4gMClcbiAgICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIGlmIGV2ZXJ5IGRlc3RpbmF0aW9uIHdhcyB1bnBpcGVkLCBlaXRoZXIgYmVmb3JlIGVudGVyaW5nIHRoaXNcbiAgLy8gZnVuY3Rpb24sIG9yIGluIHRoZSB3aGlsZSBsb29wLCB0aGVuIHN0b3AgZmxvd2luZy5cbiAgLy9cbiAgLy8gTkI6IFRoaXMgaXMgYSBwcmV0dHkgcmFyZSBlZGdlIGNhc2UuXG4gIGlmIChzdGF0ZS5waXBlc0NvdW50ID09PSAwKSB7XG4gICAgc3RhdGUuZmxvd2luZyA9IGZhbHNlO1xuXG4gICAgLy8gaWYgdGhlcmUgd2VyZSBkYXRhIGV2ZW50IGxpc3RlbmVycyBhZGRlZCwgdGhlbiBzd2l0Y2ggdG8gb2xkIG1vZGUuXG4gICAgaWYgKEVFLmxpc3RlbmVyQ291bnQoc3JjLCAnZGF0YScpID4gMClcbiAgICAgIGVtaXREYXRhRXZlbnRzKHNyYyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gYXQgdGhpcyBwb2ludCwgbm8gb25lIG5lZWRlZCBhIGRyYWluLCBzbyB3ZSBqdXN0IHJhbiBvdXQgb2YgZGF0YVxuICAvLyBvbiB0aGUgbmV4dCByZWFkYWJsZSBldmVudCwgc3RhcnQgaXQgb3ZlciBhZ2Fpbi5cbiAgc3RhdGUucmFuT3V0ID0gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gcGlwZU9uUmVhZGFibGUoKSB7XG4gIGlmICh0aGlzLl9yZWFkYWJsZVN0YXRlLnJhbk91dCkge1xuICAgIHRoaXMuX3JlYWRhYmxlU3RhdGUucmFuT3V0ID0gZmFsc2U7XG4gICAgZmxvdyh0aGlzKTtcbiAgfVxufVxuXG5cblJlYWRhYmxlLnByb3RvdHlwZS51bnBpcGUgPSBmdW5jdGlvbihkZXN0KSB7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX3JlYWRhYmxlU3RhdGU7XG5cbiAgLy8gaWYgd2UncmUgbm90IHBpcGluZyBhbnl3aGVyZSwgdGhlbiBkbyBub3RoaW5nLlxuICBpZiAoc3RhdGUucGlwZXNDb3VudCA9PT0gMClcbiAgICByZXR1cm4gdGhpcztcblxuICAvLyBqdXN0IG9uZSBkZXN0aW5hdGlvbi4gIG1vc3QgY29tbW9uIGNhc2UuXG4gIGlmIChzdGF0ZS5waXBlc0NvdW50ID09PSAxKSB7XG4gICAgLy8gcGFzc2VkIGluIG9uZSwgYnV0IGl0J3Mgbm90IHRoZSByaWdodCBvbmUuXG4gICAgaWYgKGRlc3QgJiYgZGVzdCAhPT0gc3RhdGUucGlwZXMpXG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIGlmICghZGVzdClcbiAgICAgIGRlc3QgPSBzdGF0ZS5waXBlcztcblxuICAgIC8vIGdvdCBhIG1hdGNoLlxuICAgIHN0YXRlLnBpcGVzID0gbnVsbDtcbiAgICBzdGF0ZS5waXBlc0NvdW50ID0gMDtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKCdyZWFkYWJsZScsIHBpcGVPblJlYWRhYmxlKTtcbiAgICBzdGF0ZS5mbG93aW5nID0gZmFsc2U7XG4gICAgaWYgKGRlc3QpXG4gICAgICBkZXN0LmVtaXQoJ3VucGlwZScsIHRoaXMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gc2xvdyBjYXNlLiBtdWx0aXBsZSBwaXBlIGRlc3RpbmF0aW9ucy5cblxuICBpZiAoIWRlc3QpIHtcbiAgICAvLyByZW1vdmUgYWxsLlxuICAgIHZhciBkZXN0cyA9IHN0YXRlLnBpcGVzO1xuICAgIHZhciBsZW4gPSBzdGF0ZS5waXBlc0NvdW50O1xuICAgIHN0YXRlLnBpcGVzID0gbnVsbDtcbiAgICBzdGF0ZS5waXBlc0NvdW50ID0gMDtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKCdyZWFkYWJsZScsIHBpcGVPblJlYWRhYmxlKTtcbiAgICBzdGF0ZS5mbG93aW5nID0gZmFsc2U7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKVxuICAgICAgZGVzdHNbaV0uZW1pdCgndW5waXBlJywgdGhpcyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyB0cnkgdG8gZmluZCB0aGUgcmlnaHQgb25lLlxuICB2YXIgaSA9IGluZGV4T2Yoc3RhdGUucGlwZXMsIGRlc3QpO1xuICBpZiAoaSA9PT0gLTEpXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgc3RhdGUucGlwZXMuc3BsaWNlKGksIDEpO1xuICBzdGF0ZS5waXBlc0NvdW50IC09IDE7XG4gIGlmIChzdGF0ZS5waXBlc0NvdW50ID09PSAxKVxuICAgIHN0YXRlLnBpcGVzID0gc3RhdGUucGlwZXNbMF07XG5cbiAgZGVzdC5lbWl0KCd1bnBpcGUnLCB0aGlzKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIHNldCB1cCBkYXRhIGV2ZW50cyBpZiB0aGV5IGFyZSBhc2tlZCBmb3Jcbi8vIEVuc3VyZSByZWFkYWJsZSBsaXN0ZW5lcnMgZXZlbnR1YWxseSBnZXQgc29tZXRoaW5nXG5SZWFkYWJsZS5wcm90b3R5cGUub24gPSBmdW5jdGlvbihldiwgZm4pIHtcbiAgdmFyIHJlcyA9IFN0cmVhbS5wcm90b3R5cGUub24uY2FsbCh0aGlzLCBldiwgZm4pO1xuXG4gIGlmIChldiA9PT0gJ2RhdGEnICYmICF0aGlzLl9yZWFkYWJsZVN0YXRlLmZsb3dpbmcpXG4gICAgZW1pdERhdGFFdmVudHModGhpcyk7XG5cbiAgaWYgKGV2ID09PSAncmVhZGFibGUnICYmIHRoaXMucmVhZGFibGUpIHtcbiAgICB2YXIgc3RhdGUgPSB0aGlzLl9yZWFkYWJsZVN0YXRlO1xuICAgIGlmICghc3RhdGUucmVhZGFibGVMaXN0ZW5pbmcpIHtcbiAgICAgIHN0YXRlLnJlYWRhYmxlTGlzdGVuaW5nID0gdHJ1ZTtcbiAgICAgIHN0YXRlLmVtaXR0ZWRSZWFkYWJsZSA9IGZhbHNlO1xuICAgICAgc3RhdGUubmVlZFJlYWRhYmxlID0gdHJ1ZTtcbiAgICAgIGlmICghc3RhdGUucmVhZGluZykge1xuICAgICAgICB0aGlzLnJlYWQoMCk7XG4gICAgICB9IGVsc2UgaWYgKHN0YXRlLmxlbmd0aCkge1xuICAgICAgICBlbWl0UmVhZGFibGUodGhpcywgc3RhdGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXM7XG59O1xuUmVhZGFibGUucHJvdG90eXBlLmFkZExpc3RlbmVyID0gUmVhZGFibGUucHJvdG90eXBlLm9uO1xuXG4vLyBwYXVzZSgpIGFuZCByZXN1bWUoKSBhcmUgcmVtbmFudHMgb2YgdGhlIGxlZ2FjeSByZWFkYWJsZSBzdHJlYW0gQVBJXG4vLyBJZiB0aGUgdXNlciB1c2VzIHRoZW0sIHRoZW4gc3dpdGNoIGludG8gb2xkIG1vZGUuXG5SZWFkYWJsZS5wcm90b3R5cGUucmVzdW1lID0gZnVuY3Rpb24oKSB7XG4gIGVtaXREYXRhRXZlbnRzKHRoaXMpO1xuICB0aGlzLnJlYWQoMCk7XG4gIHRoaXMuZW1pdCgncmVzdW1lJyk7XG59O1xuXG5SZWFkYWJsZS5wcm90b3R5cGUucGF1c2UgPSBmdW5jdGlvbigpIHtcbiAgZW1pdERhdGFFdmVudHModGhpcywgdHJ1ZSk7XG4gIHRoaXMuZW1pdCgncGF1c2UnKTtcbn07XG5cbmZ1bmN0aW9uIGVtaXREYXRhRXZlbnRzKHN0cmVhbSwgc3RhcnRQYXVzZWQpIHtcbiAgdmFyIHN0YXRlID0gc3RyZWFtLl9yZWFkYWJsZVN0YXRlO1xuXG4gIGlmIChzdGF0ZS5mbG93aW5nKSB7XG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2lzYWFjcy9yZWFkYWJsZS1zdHJlYW0vaXNzdWVzLzE2XG4gICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3Qgc3dpdGNoIHRvIG9sZCBtb2RlIG5vdy4nKTtcbiAgfVxuXG4gIHZhciBwYXVzZWQgPSBzdGFydFBhdXNlZCB8fCBmYWxzZTtcbiAgdmFyIHJlYWRhYmxlID0gZmFsc2U7XG5cbiAgLy8gY29udmVydCB0byBhbiBvbGQtc3R5bGUgc3RyZWFtLlxuICBzdHJlYW0ucmVhZGFibGUgPSB0cnVlO1xuICBzdHJlYW0ucGlwZSA9IFN0cmVhbS5wcm90b3R5cGUucGlwZTtcbiAgc3RyZWFtLm9uID0gc3RyZWFtLmFkZExpc3RlbmVyID0gU3RyZWFtLnByb3RvdHlwZS5vbjtcblxuICBzdHJlYW0ub24oJ3JlYWRhYmxlJywgZnVuY3Rpb24oKSB7XG4gICAgcmVhZGFibGUgPSB0cnVlO1xuXG4gICAgdmFyIGM7XG4gICAgd2hpbGUgKCFwYXVzZWQgJiYgKG51bGwgIT09IChjID0gc3RyZWFtLnJlYWQoKSkpKVxuICAgICAgc3RyZWFtLmVtaXQoJ2RhdGEnLCBjKTtcblxuICAgIGlmIChjID09PSBudWxsKSB7XG4gICAgICByZWFkYWJsZSA9IGZhbHNlO1xuICAgICAgc3RyZWFtLl9yZWFkYWJsZVN0YXRlLm5lZWRSZWFkYWJsZSA9IHRydWU7XG4gICAgfVxuICB9KTtcblxuICBzdHJlYW0ucGF1c2UgPSBmdW5jdGlvbigpIHtcbiAgICBwYXVzZWQgPSB0cnVlO1xuICAgIHRoaXMuZW1pdCgncGF1c2UnKTtcbiAgfTtcblxuICBzdHJlYW0ucmVzdW1lID0gZnVuY3Rpb24oKSB7XG4gICAgcGF1c2VkID0gZmFsc2U7XG4gICAgaWYgKHJlYWRhYmxlKVxuICAgICAgcHJvY2Vzcy5uZXh0VGljayhmdW5jdGlvbigpIHtcbiAgICAgICAgc3RyZWFtLmVtaXQoJ3JlYWRhYmxlJyk7XG4gICAgICB9KTtcbiAgICBlbHNlXG4gICAgICB0aGlzLnJlYWQoMCk7XG4gICAgdGhpcy5lbWl0KCdyZXN1bWUnKTtcbiAgfTtcblxuICAvLyBub3cgbWFrZSBpdCBzdGFydCwganVzdCBpbiBjYXNlIGl0IGhhZG4ndCBhbHJlYWR5LlxuICBzdHJlYW0uZW1pdCgncmVhZGFibGUnKTtcbn1cblxuLy8gd3JhcCBhbiBvbGQtc3R5bGUgc3RyZWFtIGFzIHRoZSBhc3luYyBkYXRhIHNvdXJjZS5cbi8vIFRoaXMgaXMgKm5vdCogcGFydCBvZiB0aGUgcmVhZGFibGUgc3RyZWFtIGludGVyZmFjZS5cbi8vIEl0IGlzIGFuIHVnbHkgdW5mb3J0dW5hdGUgbWVzcyBvZiBoaXN0b3J5LlxuUmVhZGFibGUucHJvdG90eXBlLndyYXAgPSBmdW5jdGlvbihzdHJlYW0pIHtcbiAgdmFyIHN0YXRlID0gdGhpcy5fcmVhZGFibGVTdGF0ZTtcbiAgdmFyIHBhdXNlZCA9IGZhbHNlO1xuXG4gIHZhciBzZWxmID0gdGhpcztcbiAgc3RyZWFtLm9uKCdlbmQnLCBmdW5jdGlvbigpIHtcbiAgICBpZiAoc3RhdGUuZGVjb2RlciAmJiAhc3RhdGUuZW5kZWQpIHtcbiAgICAgIHZhciBjaHVuayA9IHN0YXRlLmRlY29kZXIuZW5kKCk7XG4gICAgICBpZiAoY2h1bmsgJiYgY2h1bmsubGVuZ3RoKVxuICAgICAgICBzZWxmLnB1c2goY2h1bmspO1xuICAgIH1cblxuICAgIHNlbGYucHVzaChudWxsKTtcbiAgfSk7XG5cbiAgc3RyZWFtLm9uKCdkYXRhJywgZnVuY3Rpb24oY2h1bmspIHtcbiAgICBpZiAoc3RhdGUuZGVjb2RlcilcbiAgICAgIGNodW5rID0gc3RhdGUuZGVjb2Rlci53cml0ZShjaHVuayk7XG5cbiAgICAvLyBkb24ndCBza2lwIG92ZXIgZmFsc3kgdmFsdWVzIGluIG9iamVjdE1vZGVcbiAgICAvL2lmIChzdGF0ZS5vYmplY3RNb2RlICYmIHV0aWwuaXNOdWxsT3JVbmRlZmluZWQoY2h1bmspKVxuICAgIGlmIChzdGF0ZS5vYmplY3RNb2RlICYmIChjaHVuayA9PT0gbnVsbCB8fCBjaHVuayA9PT0gdW5kZWZpbmVkKSlcbiAgICAgIHJldHVybjtcbiAgICBlbHNlIGlmICghc3RhdGUub2JqZWN0TW9kZSAmJiAoIWNodW5rIHx8ICFjaHVuay5sZW5ndGgpKVxuICAgICAgcmV0dXJuO1xuXG4gICAgdmFyIHJldCA9IHNlbGYucHVzaChjaHVuayk7XG4gICAgaWYgKCFyZXQpIHtcbiAgICAgIHBhdXNlZCA9IHRydWU7XG4gICAgICBzdHJlYW0ucGF1c2UoKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIHByb3h5IGFsbCB0aGUgb3RoZXIgbWV0aG9kcy5cbiAgLy8gaW1wb3J0YW50IHdoZW4gd3JhcHBpbmcgZmlsdGVycyBhbmQgZHVwbGV4ZXMuXG4gIGZvciAodmFyIGkgaW4gc3RyZWFtKSB7XG4gICAgaWYgKHR5cGVvZiBzdHJlYW1baV0gPT09ICdmdW5jdGlvbicgJiZcbiAgICAgICAgdHlwZW9mIHRoaXNbaV0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aGlzW2ldID0gZnVuY3Rpb24obWV0aG9kKSB7IHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHN0cmVhbVttZXRob2RdLmFwcGx5KHN0cmVhbSwgYXJndW1lbnRzKTtcbiAgICAgIH19KGkpO1xuICAgIH1cbiAgfVxuXG4gIC8vIHByb3h5IGNlcnRhaW4gaW1wb3J0YW50IGV2ZW50cy5cbiAgdmFyIGV2ZW50cyA9IFsnZXJyb3InLCAnY2xvc2UnLCAnZGVzdHJveScsICdwYXVzZScsICdyZXN1bWUnXTtcbiAgZm9yRWFjaChldmVudHMsIGZ1bmN0aW9uKGV2KSB7XG4gICAgc3RyZWFtLm9uKGV2LCBzZWxmLmVtaXQuYmluZChzZWxmLCBldikpO1xuICB9KTtcblxuICAvLyB3aGVuIHdlIHRyeSB0byBjb25zdW1lIHNvbWUgbW9yZSBieXRlcywgc2ltcGx5IHVucGF1c2UgdGhlXG4gIC8vIHVuZGVybHlpbmcgc3RyZWFtLlxuICBzZWxmLl9yZWFkID0gZnVuY3Rpb24obikge1xuICAgIGlmIChwYXVzZWQpIHtcbiAgICAgIHBhdXNlZCA9IGZhbHNlO1xuICAgICAgc3RyZWFtLnJlc3VtZSgpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gc2VsZjtcbn07XG5cblxuXG4vLyBleHBvc2VkIGZvciB0ZXN0aW5nIHB1cnBvc2VzIG9ubHkuXG5SZWFkYWJsZS5fZnJvbUxpc3QgPSBmcm9tTGlzdDtcblxuLy8gUGx1Y2sgb2ZmIG4gYnl0ZXMgZnJvbSBhbiBhcnJheSBvZiBidWZmZXJzLlxuLy8gTGVuZ3RoIGlzIHRoZSBjb21iaW5lZCBsZW5ndGhzIG9mIGFsbCB0aGUgYnVmZmVycyBpbiB0aGUgbGlzdC5cbmZ1bmN0aW9uIGZyb21MaXN0KG4sIHN0YXRlKSB7XG4gIHZhciBsaXN0ID0gc3RhdGUuYnVmZmVyO1xuICB2YXIgbGVuZ3RoID0gc3RhdGUubGVuZ3RoO1xuICB2YXIgc3RyaW5nTW9kZSA9ICEhc3RhdGUuZGVjb2RlcjtcbiAgdmFyIG9iamVjdE1vZGUgPSAhIXN0YXRlLm9iamVjdE1vZGU7XG4gIHZhciByZXQ7XG5cbiAgLy8gbm90aGluZyBpbiB0aGUgbGlzdCwgZGVmaW5pdGVseSBlbXB0eS5cbiAgaWYgKGxpc3QubGVuZ3RoID09PSAwKVxuICAgIHJldHVybiBudWxsO1xuXG4gIGlmIChsZW5ndGggPT09IDApXG4gICAgcmV0ID0gbnVsbDtcbiAgZWxzZSBpZiAob2JqZWN0TW9kZSlcbiAgICByZXQgPSBsaXN0LnNoaWZ0KCk7XG4gIGVsc2UgaWYgKCFuIHx8IG4gPj0gbGVuZ3RoKSB7XG4gICAgLy8gcmVhZCBpdCBhbGwsIHRydW5jYXRlIHRoZSBhcnJheS5cbiAgICBpZiAoc3RyaW5nTW9kZSlcbiAgICAgIHJldCA9IGxpc3Quam9pbignJyk7XG4gICAgZWxzZVxuICAgICAgcmV0ID0gQnVmZmVyLmNvbmNhdChsaXN0LCBsZW5ndGgpO1xuICAgIGxpc3QubGVuZ3RoID0gMDtcbiAgfSBlbHNlIHtcbiAgICAvLyByZWFkIGp1c3Qgc29tZSBvZiBpdC5cbiAgICBpZiAobiA8IGxpc3RbMF0ubGVuZ3RoKSB7XG4gICAgICAvLyBqdXN0IHRha2UgYSBwYXJ0IG9mIHRoZSBmaXJzdCBsaXN0IGl0ZW0uXG4gICAgICAvLyBzbGljZSBpcyB0aGUgc2FtZSBmb3IgYnVmZmVycyBhbmQgc3RyaW5ncy5cbiAgICAgIHZhciBidWYgPSBsaXN0WzBdO1xuICAgICAgcmV0ID0gYnVmLnNsaWNlKDAsIG4pO1xuICAgICAgbGlzdFswXSA9IGJ1Zi5zbGljZShuKTtcbiAgICB9IGVsc2UgaWYgKG4gPT09IGxpc3RbMF0ubGVuZ3RoKSB7XG4gICAgICAvLyBmaXJzdCBsaXN0IGlzIGEgcGVyZmVjdCBtYXRjaFxuICAgICAgcmV0ID0gbGlzdC5zaGlmdCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBjb21wbGV4IGNhc2UuXG4gICAgICAvLyB3ZSBoYXZlIGVub3VnaCB0byBjb3ZlciBpdCwgYnV0IGl0IHNwYW5zIHBhc3QgdGhlIGZpcnN0IGJ1ZmZlci5cbiAgICAgIGlmIChzdHJpbmdNb2RlKVxuICAgICAgICByZXQgPSAnJztcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0ID0gbmV3IEJ1ZmZlcihuKTtcblxuICAgICAgdmFyIGMgPSAwO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBsaXN0Lmxlbmd0aDsgaSA8IGwgJiYgYyA8IG47IGkrKykge1xuICAgICAgICB2YXIgYnVmID0gbGlzdFswXTtcbiAgICAgICAgdmFyIGNweSA9IE1hdGgubWluKG4gLSBjLCBidWYubGVuZ3RoKTtcblxuICAgICAgICBpZiAoc3RyaW5nTW9kZSlcbiAgICAgICAgICByZXQgKz0gYnVmLnNsaWNlKDAsIGNweSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICBidWYuY29weShyZXQsIGMsIDAsIGNweSk7XG5cbiAgICAgICAgaWYgKGNweSA8IGJ1Zi5sZW5ndGgpXG4gICAgICAgICAgbGlzdFswXSA9IGJ1Zi5zbGljZShjcHkpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgbGlzdC5zaGlmdCgpO1xuXG4gICAgICAgIGMgKz0gY3B5O1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXQ7XG59XG5cbmZ1bmN0aW9uIGVuZFJlYWRhYmxlKHN0cmVhbSkge1xuICB2YXIgc3RhdGUgPSBzdHJlYW0uX3JlYWRhYmxlU3RhdGU7XG5cbiAgLy8gSWYgd2UgZ2V0IGhlcmUgYmVmb3JlIGNvbnN1bWluZyBhbGwgdGhlIGJ5dGVzLCB0aGVuIHRoYXQgaXMgYVxuICAvLyBidWcgaW4gbm9kZS4gIFNob3VsZCBuZXZlciBoYXBwZW4uXG4gIGlmIChzdGF0ZS5sZW5ndGggPiAwKVxuICAgIHRocm93IG5ldyBFcnJvcignZW5kUmVhZGFibGUgY2FsbGVkIG9uIG5vbi1lbXB0eSBzdHJlYW0nKTtcblxuICBpZiAoIXN0YXRlLmVuZEVtaXR0ZWQgJiYgc3RhdGUuY2FsbGVkUmVhZCkge1xuICAgIHN0YXRlLmVuZGVkID0gdHJ1ZTtcbiAgICBwcm9jZXNzLm5leHRUaWNrKGZ1bmN0aW9uKCkge1xuICAgICAgLy8gQ2hlY2sgdGhhdCB3ZSBkaWRuJ3QgZ2V0IG9uZSBsYXN0IHVuc2hpZnQuXG4gICAgICBpZiAoIXN0YXRlLmVuZEVtaXR0ZWQgJiYgc3RhdGUubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHN0YXRlLmVuZEVtaXR0ZWQgPSB0cnVlO1xuICAgICAgICBzdHJlYW0ucmVhZGFibGUgPSBmYWxzZTtcbiAgICAgICAgc3RyZWFtLmVtaXQoJ2VuZCcpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGZvckVhY2ggKHhzLCBmKSB7XG4gIGZvciAodmFyIGkgPSAwLCBsID0geHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgZih4c1tpXSwgaSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gaW5kZXhPZiAoeHMsIHgpIHtcbiAgZm9yICh2YXIgaSA9IDAsIGwgPSB4cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBpZiAoeHNbaV0gPT09IHgpIHJldHVybiBpO1xuICB9XG4gIHJldHVybiAtMTtcbn1cbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG5cbi8vIGEgdHJhbnNmb3JtIHN0cmVhbSBpcyBhIHJlYWRhYmxlL3dyaXRhYmxlIHN0cmVhbSB3aGVyZSB5b3UgZG9cbi8vIHNvbWV0aGluZyB3aXRoIHRoZSBkYXRhLiAgU29tZXRpbWVzIGl0J3MgY2FsbGVkIGEgXCJmaWx0ZXJcIixcbi8vIGJ1dCB0aGF0J3Mgbm90IGEgZ3JlYXQgbmFtZSBmb3IgaXQsIHNpbmNlIHRoYXQgaW1wbGllcyBhIHRoaW5nIHdoZXJlXG4vLyBzb21lIGJpdHMgcGFzcyB0aHJvdWdoLCBhbmQgb3RoZXJzIGFyZSBzaW1wbHkgaWdub3JlZC4gIChUaGF0IHdvdWxkXG4vLyBiZSBhIHZhbGlkIGV4YW1wbGUgb2YgYSB0cmFuc2Zvcm0sIG9mIGNvdXJzZS4pXG4vL1xuLy8gV2hpbGUgdGhlIG91dHB1dCBpcyBjYXVzYWxseSByZWxhdGVkIHRvIHRoZSBpbnB1dCwgaXQncyBub3QgYVxuLy8gbmVjZXNzYXJpbHkgc3ltbWV0cmljIG9yIHN5bmNocm9ub3VzIHRyYW5zZm9ybWF0aW9uLiAgRm9yIGV4YW1wbGUsXG4vLyBhIHpsaWIgc3RyZWFtIG1pZ2h0IHRha2UgbXVsdGlwbGUgcGxhaW4tdGV4dCB3cml0ZXMoKSwgYW5kIHRoZW5cbi8vIGVtaXQgYSBzaW5nbGUgY29tcHJlc3NlZCBjaHVuayBzb21lIHRpbWUgaW4gdGhlIGZ1dHVyZS5cbi8vXG4vLyBIZXJlJ3MgaG93IHRoaXMgd29ya3M6XG4vL1xuLy8gVGhlIFRyYW5zZm9ybSBzdHJlYW0gaGFzIGFsbCB0aGUgYXNwZWN0cyBvZiB0aGUgcmVhZGFibGUgYW5kIHdyaXRhYmxlXG4vLyBzdHJlYW0gY2xhc3Nlcy4gIFdoZW4geW91IHdyaXRlKGNodW5rKSwgdGhhdCBjYWxscyBfd3JpdGUoY2h1bmssY2IpXG4vLyBpbnRlcm5hbGx5LCBhbmQgcmV0dXJucyBmYWxzZSBpZiB0aGVyZSdzIGEgbG90IG9mIHBlbmRpbmcgd3JpdGVzXG4vLyBidWZmZXJlZCB1cC4gIFdoZW4geW91IGNhbGwgcmVhZCgpLCB0aGF0IGNhbGxzIF9yZWFkKG4pIHVudGlsXG4vLyB0aGVyZSdzIGVub3VnaCBwZW5kaW5nIHJlYWRhYmxlIGRhdGEgYnVmZmVyZWQgdXAuXG4vL1xuLy8gSW4gYSB0cmFuc2Zvcm0gc3RyZWFtLCB0aGUgd3JpdHRlbiBkYXRhIGlzIHBsYWNlZCBpbiBhIGJ1ZmZlci4gIFdoZW5cbi8vIF9yZWFkKG4pIGlzIGNhbGxlZCwgaXQgdHJhbnNmb3JtcyB0aGUgcXVldWVkIHVwIGRhdGEsIGNhbGxpbmcgdGhlXG4vLyBidWZmZXJlZCBfd3JpdGUgY2IncyBhcyBpdCBjb25zdW1lcyBjaHVua3MuICBJZiBjb25zdW1pbmcgYSBzaW5nbGVcbi8vIHdyaXR0ZW4gY2h1bmsgd291bGQgcmVzdWx0IGluIG11bHRpcGxlIG91dHB1dCBjaHVua3MsIHRoZW4gdGhlIGZpcnN0XG4vLyBvdXRwdXR0ZWQgYml0IGNhbGxzIHRoZSByZWFkY2IsIGFuZCBzdWJzZXF1ZW50IGNodW5rcyBqdXN0IGdvIGludG9cbi8vIHRoZSByZWFkIGJ1ZmZlciwgYW5kIHdpbGwgY2F1c2UgaXQgdG8gZW1pdCAncmVhZGFibGUnIGlmIG5lY2Vzc2FyeS5cbi8vXG4vLyBUaGlzIHdheSwgYmFjay1wcmVzc3VyZSBpcyBhY3R1YWxseSBkZXRlcm1pbmVkIGJ5IHRoZSByZWFkaW5nIHNpZGUsXG4vLyBzaW5jZSBfcmVhZCBoYXMgdG8gYmUgY2FsbGVkIHRvIHN0YXJ0IHByb2Nlc3NpbmcgYSBuZXcgY2h1bmsuICBIb3dldmVyLFxuLy8gYSBwYXRob2xvZ2ljYWwgaW5mbGF0ZSB0eXBlIG9mIHRyYW5zZm9ybSBjYW4gY2F1c2UgZXhjZXNzaXZlIGJ1ZmZlcmluZ1xuLy8gaGVyZS4gIEZvciBleGFtcGxlLCBpbWFnaW5lIGEgc3RyZWFtIHdoZXJlIGV2ZXJ5IGJ5dGUgb2YgaW5wdXQgaXNcbi8vIGludGVycHJldGVkIGFzIGFuIGludGVnZXIgZnJvbSAwLTI1NSwgYW5kIHRoZW4gcmVzdWx0cyBpbiB0aGF0IG1hbnlcbi8vIGJ5dGVzIG9mIG91dHB1dC4gIFdyaXRpbmcgdGhlIDQgYnl0ZXMge2ZmLGZmLGZmLGZmfSB3b3VsZCByZXN1bHQgaW5cbi8vIDFrYiBvZiBkYXRhIGJlaW5nIG91dHB1dC4gIEluIHRoaXMgY2FzZSwgeW91IGNvdWxkIHdyaXRlIGEgdmVyeSBzbWFsbFxuLy8gYW1vdW50IG9mIGlucHV0LCBhbmQgZW5kIHVwIHdpdGggYSB2ZXJ5IGxhcmdlIGFtb3VudCBvZiBvdXRwdXQuICBJblxuLy8gc3VjaCBhIHBhdGhvbG9naWNhbCBpbmZsYXRpbmcgbWVjaGFuaXNtLCB0aGVyZSdkIGJlIG5vIHdheSB0byB0ZWxsXG4vLyB0aGUgc3lzdGVtIHRvIHN0b3AgZG9pbmcgdGhlIHRyYW5zZm9ybS4gIEEgc2luZ2xlIDRNQiB3cml0ZSBjb3VsZFxuLy8gY2F1c2UgdGhlIHN5c3RlbSB0byBydW4gb3V0IG9mIG1lbW9yeS5cbi8vXG4vLyBIb3dldmVyLCBldmVuIGluIHN1Y2ggYSBwYXRob2xvZ2ljYWwgY2FzZSwgb25seSBhIHNpbmdsZSB3cml0dGVuIGNodW5rXG4vLyB3b3VsZCBiZSBjb25zdW1lZCwgYW5kIHRoZW4gdGhlIHJlc3Qgd291bGQgd2FpdCAodW4tdHJhbnNmb3JtZWQpIHVudGlsXG4vLyB0aGUgcmVzdWx0cyBvZiB0aGUgcHJldmlvdXMgdHJhbnNmb3JtZWQgY2h1bmsgd2VyZSBjb25zdW1lZC5cblxubW9kdWxlLmV4cG9ydHMgPSBUcmFuc2Zvcm07XG5cbnZhciBEdXBsZXggPSByZXF1aXJlKCcuL19zdHJlYW1fZHVwbGV4Jyk7XG5cbi8qPHJlcGxhY2VtZW50PiovXG52YXIgdXRpbCA9IHJlcXVpcmUoJ2NvcmUtdXRpbC1pcycpO1xudXRpbC5pbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJyk7XG4vKjwvcmVwbGFjZW1lbnQ+Ki9cblxudXRpbC5pbmhlcml0cyhUcmFuc2Zvcm0sIER1cGxleCk7XG5cblxuZnVuY3Rpb24gVHJhbnNmb3JtU3RhdGUob3B0aW9ucywgc3RyZWFtKSB7XG4gIHRoaXMuYWZ0ZXJUcmFuc2Zvcm0gPSBmdW5jdGlvbihlciwgZGF0YSkge1xuICAgIHJldHVybiBhZnRlclRyYW5zZm9ybShzdHJlYW0sIGVyLCBkYXRhKTtcbiAgfTtcblxuICB0aGlzLm5lZWRUcmFuc2Zvcm0gPSBmYWxzZTtcbiAgdGhpcy50cmFuc2Zvcm1pbmcgPSBmYWxzZTtcbiAgdGhpcy53cml0ZWNiID0gbnVsbDtcbiAgdGhpcy53cml0ZWNodW5rID0gbnVsbDtcbn1cblxuZnVuY3Rpb24gYWZ0ZXJUcmFuc2Zvcm0oc3RyZWFtLCBlciwgZGF0YSkge1xuICB2YXIgdHMgPSBzdHJlYW0uX3RyYW5zZm9ybVN0YXRlO1xuICB0cy50cmFuc2Zvcm1pbmcgPSBmYWxzZTtcblxuICB2YXIgY2IgPSB0cy53cml0ZWNiO1xuXG4gIGlmICghY2IpXG4gICAgcmV0dXJuIHN0cmVhbS5lbWl0KCdlcnJvcicsIG5ldyBFcnJvcignbm8gd3JpdGVjYiBpbiBUcmFuc2Zvcm0gY2xhc3MnKSk7XG5cbiAgdHMud3JpdGVjaHVuayA9IG51bGw7XG4gIHRzLndyaXRlY2IgPSBudWxsO1xuXG4gIGlmIChkYXRhICE9PSBudWxsICYmIGRhdGEgIT09IHVuZGVmaW5lZClcbiAgICBzdHJlYW0ucHVzaChkYXRhKTtcblxuICBpZiAoY2IpXG4gICAgY2IoZXIpO1xuXG4gIHZhciBycyA9IHN0cmVhbS5fcmVhZGFibGVTdGF0ZTtcbiAgcnMucmVhZGluZyA9IGZhbHNlO1xuICBpZiAocnMubmVlZFJlYWRhYmxlIHx8IHJzLmxlbmd0aCA8IHJzLmhpZ2hXYXRlck1hcmspIHtcbiAgICBzdHJlYW0uX3JlYWQocnMuaGlnaFdhdGVyTWFyayk7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBUcmFuc2Zvcm0ob3B0aW9ucykge1xuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgVHJhbnNmb3JtKSlcbiAgICByZXR1cm4gbmV3IFRyYW5zZm9ybShvcHRpb25zKTtcblxuICBEdXBsZXguY2FsbCh0aGlzLCBvcHRpb25zKTtcblxuICB2YXIgdHMgPSB0aGlzLl90cmFuc2Zvcm1TdGF0ZSA9IG5ldyBUcmFuc2Zvcm1TdGF0ZShvcHRpb25zLCB0aGlzKTtcblxuICAvLyB3aGVuIHRoZSB3cml0YWJsZSBzaWRlIGZpbmlzaGVzLCB0aGVuIGZsdXNoIG91dCBhbnl0aGluZyByZW1haW5pbmcuXG4gIHZhciBzdHJlYW0gPSB0aGlzO1xuXG4gIC8vIHN0YXJ0IG91dCBhc2tpbmcgZm9yIGEgcmVhZGFibGUgZXZlbnQgb25jZSBkYXRhIGlzIHRyYW5zZm9ybWVkLlxuICB0aGlzLl9yZWFkYWJsZVN0YXRlLm5lZWRSZWFkYWJsZSA9IHRydWU7XG5cbiAgLy8gd2UgaGF2ZSBpbXBsZW1lbnRlZCB0aGUgX3JlYWQgbWV0aG9kLCBhbmQgZG9uZSB0aGUgb3RoZXIgdGhpbmdzXG4gIC8vIHRoYXQgUmVhZGFibGUgd2FudHMgYmVmb3JlIHRoZSBmaXJzdCBfcmVhZCBjYWxsLCBzbyB1bnNldCB0aGVcbiAgLy8gc3luYyBndWFyZCBmbGFnLlxuICB0aGlzLl9yZWFkYWJsZVN0YXRlLnN5bmMgPSBmYWxzZTtcblxuICB0aGlzLm9uY2UoJ2ZpbmlzaCcsIGZ1bmN0aW9uKCkge1xuICAgIGlmICgnZnVuY3Rpb24nID09PSB0eXBlb2YgdGhpcy5fZmx1c2gpXG4gICAgICB0aGlzLl9mbHVzaChmdW5jdGlvbihlcikge1xuICAgICAgICBkb25lKHN0cmVhbSwgZXIpO1xuICAgICAgfSk7XG4gICAgZWxzZVxuICAgICAgZG9uZShzdHJlYW0pO1xuICB9KTtcbn1cblxuVHJhbnNmb3JtLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24oY2h1bmssIGVuY29kaW5nKSB7XG4gIHRoaXMuX3RyYW5zZm9ybVN0YXRlLm5lZWRUcmFuc2Zvcm0gPSBmYWxzZTtcbiAgcmV0dXJuIER1cGxleC5wcm90b3R5cGUucHVzaC5jYWxsKHRoaXMsIGNodW5rLCBlbmNvZGluZyk7XG59O1xuXG4vLyBUaGlzIGlzIHRoZSBwYXJ0IHdoZXJlIHlvdSBkbyBzdHVmZiFcbi8vIG92ZXJyaWRlIHRoaXMgZnVuY3Rpb24gaW4gaW1wbGVtZW50YXRpb24gY2xhc3Nlcy5cbi8vICdjaHVuaycgaXMgYW4gaW5wdXQgY2h1bmsuXG4vL1xuLy8gQ2FsbCBgcHVzaChuZXdDaHVuaylgIHRvIHBhc3MgYWxvbmcgdHJhbnNmb3JtZWQgb3V0cHV0XG4vLyB0byB0aGUgcmVhZGFibGUgc2lkZS4gIFlvdSBtYXkgY2FsbCAncHVzaCcgemVybyBvciBtb3JlIHRpbWVzLlxuLy9cbi8vIENhbGwgYGNiKGVycilgIHdoZW4geW91IGFyZSBkb25lIHdpdGggdGhpcyBjaHVuay4gIElmIHlvdSBwYXNzXG4vLyBhbiBlcnJvciwgdGhlbiB0aGF0J2xsIHB1dCB0aGUgaHVydCBvbiB0aGUgd2hvbGUgb3BlcmF0aW9uLiAgSWYgeW91XG4vLyBuZXZlciBjYWxsIGNiKCksIHRoZW4geW91J2xsIG5ldmVyIGdldCBhbm90aGVyIGNodW5rLlxuVHJhbnNmb3JtLnByb3RvdHlwZS5fdHJhbnNmb3JtID0gZnVuY3Rpb24oY2h1bmssIGVuY29kaW5nLCBjYikge1xuICB0aHJvdyBuZXcgRXJyb3IoJ25vdCBpbXBsZW1lbnRlZCcpO1xufTtcblxuVHJhbnNmb3JtLnByb3RvdHlwZS5fd3JpdGUgPSBmdW5jdGlvbihjaHVuaywgZW5jb2RpbmcsIGNiKSB7XG4gIHZhciB0cyA9IHRoaXMuX3RyYW5zZm9ybVN0YXRlO1xuICB0cy53cml0ZWNiID0gY2I7XG4gIHRzLndyaXRlY2h1bmsgPSBjaHVuaztcbiAgdHMud3JpdGVlbmNvZGluZyA9IGVuY29kaW5nO1xuICBpZiAoIXRzLnRyYW5zZm9ybWluZykge1xuICAgIHZhciBycyA9IHRoaXMuX3JlYWRhYmxlU3RhdGU7XG4gICAgaWYgKHRzLm5lZWRUcmFuc2Zvcm0gfHxcbiAgICAgICAgcnMubmVlZFJlYWRhYmxlIHx8XG4gICAgICAgIHJzLmxlbmd0aCA8IHJzLmhpZ2hXYXRlck1hcmspXG4gICAgICB0aGlzLl9yZWFkKHJzLmhpZ2hXYXRlck1hcmspO1xuICB9XG59O1xuXG4vLyBEb2Vzbid0IG1hdHRlciB3aGF0IHRoZSBhcmdzIGFyZSBoZXJlLlxuLy8gX3RyYW5zZm9ybSBkb2VzIGFsbCB0aGUgd29yay5cbi8vIFRoYXQgd2UgZ290IGhlcmUgbWVhbnMgdGhhdCB0aGUgcmVhZGFibGUgc2lkZSB3YW50cyBtb3JlIGRhdGEuXG5UcmFuc2Zvcm0ucHJvdG90eXBlLl9yZWFkID0gZnVuY3Rpb24obikge1xuICB2YXIgdHMgPSB0aGlzLl90cmFuc2Zvcm1TdGF0ZTtcblxuICBpZiAodHMud3JpdGVjaHVuayAhPT0gbnVsbCAmJiB0cy53cml0ZWNiICYmICF0cy50cmFuc2Zvcm1pbmcpIHtcbiAgICB0cy50cmFuc2Zvcm1pbmcgPSB0cnVlO1xuICAgIHRoaXMuX3RyYW5zZm9ybSh0cy53cml0ZWNodW5rLCB0cy53cml0ZWVuY29kaW5nLCB0cy5hZnRlclRyYW5zZm9ybSk7XG4gIH0gZWxzZSB7XG4gICAgLy8gbWFyayB0aGF0IHdlIG5lZWQgYSB0cmFuc2Zvcm0sIHNvIHRoYXQgYW55IGRhdGEgdGhhdCBjb21lcyBpblxuICAgIC8vIHdpbGwgZ2V0IHByb2Nlc3NlZCwgbm93IHRoYXQgd2UndmUgYXNrZWQgZm9yIGl0LlxuICAgIHRzLm5lZWRUcmFuc2Zvcm0gPSB0cnVlO1xuICB9XG59O1xuXG5cbmZ1bmN0aW9uIGRvbmUoc3RyZWFtLCBlcikge1xuICBpZiAoZXIpXG4gICAgcmV0dXJuIHN0cmVhbS5lbWl0KCdlcnJvcicsIGVyKTtcblxuICAvLyBpZiB0aGVyZSdzIG5vdGhpbmcgaW4gdGhlIHdyaXRlIGJ1ZmZlciwgdGhlbiB0aGF0IG1lYW5zXG4gIC8vIHRoYXQgbm90aGluZyBtb3JlIHdpbGwgZXZlciBiZSBwcm92aWRlZFxuICB2YXIgd3MgPSBzdHJlYW0uX3dyaXRhYmxlU3RhdGU7XG4gIHZhciBycyA9IHN0cmVhbS5fcmVhZGFibGVTdGF0ZTtcbiAgdmFyIHRzID0gc3RyZWFtLl90cmFuc2Zvcm1TdGF0ZTtcblxuICBpZiAod3MubGVuZ3RoKVxuICAgIHRocm93IG5ldyBFcnJvcignY2FsbGluZyB0cmFuc2Zvcm0gZG9uZSB3aGVuIHdzLmxlbmd0aCAhPSAwJyk7XG5cbiAgaWYgKHRzLnRyYW5zZm9ybWluZylcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NhbGxpbmcgdHJhbnNmb3JtIGRvbmUgd2hlbiBzdGlsbCB0cmFuc2Zvcm1pbmcnKTtcblxuICByZXR1cm4gc3RyZWFtLnB1c2gobnVsbCk7XG59XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuLy8gQSBiaXQgc2ltcGxlciB0aGFuIHJlYWRhYmxlIHN0cmVhbXMuXG4vLyBJbXBsZW1lbnQgYW4gYXN5bmMgLl93cml0ZShjaHVuaywgY2IpLCBhbmQgaXQnbGwgaGFuZGxlIGFsbFxuLy8gdGhlIGRyYWluIGV2ZW50IGVtaXNzaW9uIGFuZCBidWZmZXJpbmcuXG5cbm1vZHVsZS5leHBvcnRzID0gV3JpdGFibGU7XG5cbi8qPHJlcGxhY2VtZW50PiovXG52YXIgQnVmZmVyID0gcmVxdWlyZSgnYnVmZmVyJykuQnVmZmVyO1xuLyo8L3JlcGxhY2VtZW50PiovXG5cbldyaXRhYmxlLldyaXRhYmxlU3RhdGUgPSBXcml0YWJsZVN0YXRlO1xuXG5cbi8qPHJlcGxhY2VtZW50PiovXG52YXIgdXRpbCA9IHJlcXVpcmUoJ2NvcmUtdXRpbC1pcycpO1xudXRpbC5pbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJyk7XG4vKjwvcmVwbGFjZW1lbnQ+Ki9cblxudmFyIFN0cmVhbSA9IHJlcXVpcmUoJ3N0cmVhbScpO1xuXG51dGlsLmluaGVyaXRzKFdyaXRhYmxlLCBTdHJlYW0pO1xuXG5mdW5jdGlvbiBXcml0ZVJlcShjaHVuaywgZW5jb2RpbmcsIGNiKSB7XG4gIHRoaXMuY2h1bmsgPSBjaHVuaztcbiAgdGhpcy5lbmNvZGluZyA9IGVuY29kaW5nO1xuICB0aGlzLmNhbGxiYWNrID0gY2I7XG59XG5cbmZ1bmN0aW9uIFdyaXRhYmxlU3RhdGUob3B0aW9ucywgc3RyZWFtKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gIC8vIHRoZSBwb2ludCBhdCB3aGljaCB3cml0ZSgpIHN0YXJ0cyByZXR1cm5pbmcgZmFsc2VcbiAgLy8gTm90ZTogMCBpcyBhIHZhbGlkIHZhbHVlLCBtZWFucyB0aGF0IHdlIGFsd2F5cyByZXR1cm4gZmFsc2UgaWZcbiAgLy8gdGhlIGVudGlyZSBidWZmZXIgaXMgbm90IGZsdXNoZWQgaW1tZWRpYXRlbHkgb24gd3JpdGUoKVxuICB2YXIgaHdtID0gb3B0aW9ucy5oaWdoV2F0ZXJNYXJrO1xuICB0aGlzLmhpZ2hXYXRlck1hcmsgPSAoaHdtIHx8IGh3bSA9PT0gMCkgPyBod20gOiAxNiAqIDEwMjQ7XG5cbiAgLy8gb2JqZWN0IHN0cmVhbSBmbGFnIHRvIGluZGljYXRlIHdoZXRoZXIgb3Igbm90IHRoaXMgc3RyZWFtXG4gIC8vIGNvbnRhaW5zIGJ1ZmZlcnMgb3Igb2JqZWN0cy5cbiAgdGhpcy5vYmplY3RNb2RlID0gISFvcHRpb25zLm9iamVjdE1vZGU7XG5cbiAgLy8gY2FzdCB0byBpbnRzLlxuICB0aGlzLmhpZ2hXYXRlck1hcmsgPSB+fnRoaXMuaGlnaFdhdGVyTWFyaztcblxuICB0aGlzLm5lZWREcmFpbiA9IGZhbHNlO1xuICAvLyBhdCB0aGUgc3RhcnQgb2YgY2FsbGluZyBlbmQoKVxuICB0aGlzLmVuZGluZyA9IGZhbHNlO1xuICAvLyB3aGVuIGVuZCgpIGhhcyBiZWVuIGNhbGxlZCwgYW5kIHJldHVybmVkXG4gIHRoaXMuZW5kZWQgPSBmYWxzZTtcbiAgLy8gd2hlbiAnZmluaXNoJyBpcyBlbWl0dGVkXG4gIHRoaXMuZmluaXNoZWQgPSBmYWxzZTtcblxuICAvLyBzaG91bGQgd2UgZGVjb2RlIHN0cmluZ3MgaW50byBidWZmZXJzIGJlZm9yZSBwYXNzaW5nIHRvIF93cml0ZT9cbiAgLy8gdGhpcyBpcyBoZXJlIHNvIHRoYXQgc29tZSBub2RlLWNvcmUgc3RyZWFtcyBjYW4gb3B0aW1pemUgc3RyaW5nXG4gIC8vIGhhbmRsaW5nIGF0IGEgbG93ZXIgbGV2ZWwuXG4gIHZhciBub0RlY29kZSA9IG9wdGlvbnMuZGVjb2RlU3RyaW5ncyA9PT0gZmFsc2U7XG4gIHRoaXMuZGVjb2RlU3RyaW5ncyA9ICFub0RlY29kZTtcblxuICAvLyBDcnlwdG8gaXMga2luZCBvZiBvbGQgYW5kIGNydXN0eS4gIEhpc3RvcmljYWxseSwgaXRzIGRlZmF1bHQgc3RyaW5nXG4gIC8vIGVuY29kaW5nIGlzICdiaW5hcnknIHNvIHdlIGhhdmUgdG8gbWFrZSB0aGlzIGNvbmZpZ3VyYWJsZS5cbiAgLy8gRXZlcnl0aGluZyBlbHNlIGluIHRoZSB1bml2ZXJzZSB1c2VzICd1dGY4JywgdGhvdWdoLlxuICB0aGlzLmRlZmF1bHRFbmNvZGluZyA9IG9wdGlvbnMuZGVmYXVsdEVuY29kaW5nIHx8ICd1dGY4JztcblxuICAvLyBub3QgYW4gYWN0dWFsIGJ1ZmZlciB3ZSBrZWVwIHRyYWNrIG9mLCBidXQgYSBtZWFzdXJlbWVudFxuICAvLyBvZiBob3cgbXVjaCB3ZSdyZSB3YWl0aW5nIHRvIGdldCBwdXNoZWQgdG8gc29tZSB1bmRlcmx5aW5nXG4gIC8vIHNvY2tldCBvciBmaWxlLlxuICB0aGlzLmxlbmd0aCA9IDA7XG5cbiAgLy8gYSBmbGFnIHRvIHNlZSB3aGVuIHdlJ3JlIGluIHRoZSBtaWRkbGUgb2YgYSB3cml0ZS5cbiAgdGhpcy53cml0aW5nID0gZmFsc2U7XG5cbiAgLy8gYSBmbGFnIHRvIGJlIGFibGUgdG8gdGVsbCBpZiB0aGUgb253cml0ZSBjYiBpcyBjYWxsZWQgaW1tZWRpYXRlbHksXG4gIC8vIG9yIG9uIGEgbGF0ZXIgdGljay4gIFdlIHNldCB0aGlzIHRvIHRydWUgYXQgZmlyc3QsIGJlY3Vhc2UgYW55XG4gIC8vIGFjdGlvbnMgdGhhdCBzaG91bGRuJ3QgaGFwcGVuIHVudGlsIFwibGF0ZXJcIiBzaG91bGQgZ2VuZXJhbGx5IGFsc29cbiAgLy8gbm90IGhhcHBlbiBiZWZvcmUgdGhlIGZpcnN0IHdyaXRlIGNhbGwuXG4gIHRoaXMuc3luYyA9IHRydWU7XG5cbiAgLy8gYSBmbGFnIHRvIGtub3cgaWYgd2UncmUgcHJvY2Vzc2luZyBwcmV2aW91c2x5IGJ1ZmZlcmVkIGl0ZW1zLCB3aGljaFxuICAvLyBtYXkgY2FsbCB0aGUgX3dyaXRlKCkgY2FsbGJhY2sgaW4gdGhlIHNhbWUgdGljaywgc28gdGhhdCB3ZSBkb24ndFxuICAvLyBlbmQgdXAgaW4gYW4gb3ZlcmxhcHBlZCBvbndyaXRlIHNpdHVhdGlvbi5cbiAgdGhpcy5idWZmZXJQcm9jZXNzaW5nID0gZmFsc2U7XG5cbiAgLy8gdGhlIGNhbGxiYWNrIHRoYXQncyBwYXNzZWQgdG8gX3dyaXRlKGNodW5rLGNiKVxuICB0aGlzLm9ud3JpdGUgPSBmdW5jdGlvbihlcikge1xuICAgIG9ud3JpdGUoc3RyZWFtLCBlcik7XG4gIH07XG5cbiAgLy8gdGhlIGNhbGxiYWNrIHRoYXQgdGhlIHVzZXIgc3VwcGxpZXMgdG8gd3JpdGUoY2h1bmssZW5jb2RpbmcsY2IpXG4gIHRoaXMud3JpdGVjYiA9IG51bGw7XG5cbiAgLy8gdGhlIGFtb3VudCB0aGF0IGlzIGJlaW5nIHdyaXR0ZW4gd2hlbiBfd3JpdGUgaXMgY2FsbGVkLlxuICB0aGlzLndyaXRlbGVuID0gMDtcblxuICB0aGlzLmJ1ZmZlciA9IFtdO1xuXG4gIC8vIFRydWUgaWYgdGhlIGVycm9yIHdhcyBhbHJlYWR5IGVtaXR0ZWQgYW5kIHNob3VsZCBub3QgYmUgdGhyb3duIGFnYWluXG4gIHRoaXMuZXJyb3JFbWl0dGVkID0gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIFdyaXRhYmxlKG9wdGlvbnMpIHtcbiAgdmFyIER1cGxleCA9IHJlcXVpcmUoJy4vX3N0cmVhbV9kdXBsZXgnKTtcblxuICAvLyBXcml0YWJsZSBjdG9yIGlzIGFwcGxpZWQgdG8gRHVwbGV4ZXMsIHRob3VnaCB0aGV5J3JlIG5vdFxuICAvLyBpbnN0YW5jZW9mIFdyaXRhYmxlLCB0aGV5J3JlIGluc3RhbmNlb2YgUmVhZGFibGUuXG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBXcml0YWJsZSkgJiYgISh0aGlzIGluc3RhbmNlb2YgRHVwbGV4KSlcbiAgICByZXR1cm4gbmV3IFdyaXRhYmxlKG9wdGlvbnMpO1xuXG4gIHRoaXMuX3dyaXRhYmxlU3RhdGUgPSBuZXcgV3JpdGFibGVTdGF0ZShvcHRpb25zLCB0aGlzKTtcblxuICAvLyBsZWdhY3kuXG4gIHRoaXMud3JpdGFibGUgPSB0cnVlO1xuXG4gIFN0cmVhbS5jYWxsKHRoaXMpO1xufVxuXG4vLyBPdGhlcndpc2UgcGVvcGxlIGNhbiBwaXBlIFdyaXRhYmxlIHN0cmVhbXMsIHdoaWNoIGlzIGp1c3Qgd3JvbmcuXG5Xcml0YWJsZS5wcm90b3R5cGUucGlwZSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmVtaXQoJ2Vycm9yJywgbmV3IEVycm9yKCdDYW5ub3QgcGlwZS4gTm90IHJlYWRhYmxlLicpKTtcbn07XG5cblxuZnVuY3Rpb24gd3JpdGVBZnRlckVuZChzdHJlYW0sIHN0YXRlLCBjYikge1xuICB2YXIgZXIgPSBuZXcgRXJyb3IoJ3dyaXRlIGFmdGVyIGVuZCcpO1xuICAvLyBUT0RPOiBkZWZlciBlcnJvciBldmVudHMgY29uc2lzdGVudGx5IGV2ZXJ5d2hlcmUsIG5vdCBqdXN0IHRoZSBjYlxuICBzdHJlYW0uZW1pdCgnZXJyb3InLCBlcik7XG4gIHByb2Nlc3MubmV4dFRpY2soZnVuY3Rpb24oKSB7XG4gICAgY2IoZXIpO1xuICB9KTtcbn1cblxuLy8gSWYgd2UgZ2V0IHNvbWV0aGluZyB0aGF0IGlzIG5vdCBhIGJ1ZmZlciwgc3RyaW5nLCBudWxsLCBvciB1bmRlZmluZWQsXG4vLyBhbmQgd2UncmUgbm90IGluIG9iamVjdE1vZGUsIHRoZW4gdGhhdCdzIGFuIGVycm9yLlxuLy8gT3RoZXJ3aXNlIHN0cmVhbSBjaHVua3MgYXJlIGFsbCBjb25zaWRlcmVkIHRvIGJlIG9mIGxlbmd0aD0xLCBhbmQgdGhlXG4vLyB3YXRlcm1hcmtzIGRldGVybWluZSBob3cgbWFueSBvYmplY3RzIHRvIGtlZXAgaW4gdGhlIGJ1ZmZlciwgcmF0aGVyIHRoYW5cbi8vIGhvdyBtYW55IGJ5dGVzIG9yIGNoYXJhY3RlcnMuXG5mdW5jdGlvbiB2YWxpZENodW5rKHN0cmVhbSwgc3RhdGUsIGNodW5rLCBjYikge1xuICB2YXIgdmFsaWQgPSB0cnVlO1xuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihjaHVuaykgJiZcbiAgICAgICdzdHJpbmcnICE9PSB0eXBlb2YgY2h1bmsgJiZcbiAgICAgIGNodW5rICE9PSBudWxsICYmXG4gICAgICBjaHVuayAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAhc3RhdGUub2JqZWN0TW9kZSkge1xuICAgIHZhciBlciA9IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgbm9uLXN0cmluZy9idWZmZXIgY2h1bmsnKTtcbiAgICBzdHJlYW0uZW1pdCgnZXJyb3InLCBlcik7XG4gICAgcHJvY2Vzcy5uZXh0VGljayhmdW5jdGlvbigpIHtcbiAgICAgIGNiKGVyKTtcbiAgICB9KTtcbiAgICB2YWxpZCA9IGZhbHNlO1xuICB9XG4gIHJldHVybiB2YWxpZDtcbn1cblxuV3JpdGFibGUucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24oY2h1bmssIGVuY29kaW5nLCBjYikge1xuICB2YXIgc3RhdGUgPSB0aGlzLl93cml0YWJsZVN0YXRlO1xuICB2YXIgcmV0ID0gZmFsc2U7XG5cbiAgaWYgKHR5cGVvZiBlbmNvZGluZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGNiID0gZW5jb2Rpbmc7XG4gICAgZW5jb2RpbmcgPSBudWxsO1xuICB9XG5cbiAgaWYgKEJ1ZmZlci5pc0J1ZmZlcihjaHVuaykpXG4gICAgZW5jb2RpbmcgPSAnYnVmZmVyJztcbiAgZWxzZSBpZiAoIWVuY29kaW5nKVxuICAgIGVuY29kaW5nID0gc3RhdGUuZGVmYXVsdEVuY29kaW5nO1xuXG4gIGlmICh0eXBlb2YgY2IgIT09ICdmdW5jdGlvbicpXG4gICAgY2IgPSBmdW5jdGlvbigpIHt9O1xuXG4gIGlmIChzdGF0ZS5lbmRlZClcbiAgICB3cml0ZUFmdGVyRW5kKHRoaXMsIHN0YXRlLCBjYik7XG4gIGVsc2UgaWYgKHZhbGlkQ2h1bmsodGhpcywgc3RhdGUsIGNodW5rLCBjYikpXG4gICAgcmV0ID0gd3JpdGVPckJ1ZmZlcih0aGlzLCBzdGF0ZSwgY2h1bmssIGVuY29kaW5nLCBjYik7XG5cbiAgcmV0dXJuIHJldDtcbn07XG5cbmZ1bmN0aW9uIGRlY29kZUNodW5rKHN0YXRlLCBjaHVuaywgZW5jb2RpbmcpIHtcbiAgaWYgKCFzdGF0ZS5vYmplY3RNb2RlICYmXG4gICAgICBzdGF0ZS5kZWNvZGVTdHJpbmdzICE9PSBmYWxzZSAmJlxuICAgICAgdHlwZW9mIGNodW5rID09PSAnc3RyaW5nJykge1xuICAgIGNodW5rID0gbmV3IEJ1ZmZlcihjaHVuaywgZW5jb2RpbmcpO1xuICB9XG4gIHJldHVybiBjaHVuaztcbn1cblxuLy8gaWYgd2UncmUgYWxyZWFkeSB3cml0aW5nIHNvbWV0aGluZywgdGhlbiBqdXN0IHB1dCB0aGlzXG4vLyBpbiB0aGUgcXVldWUsIGFuZCB3YWl0IG91ciB0dXJuLiAgT3RoZXJ3aXNlLCBjYWxsIF93cml0ZVxuLy8gSWYgd2UgcmV0dXJuIGZhbHNlLCB0aGVuIHdlIG5lZWQgYSBkcmFpbiBldmVudCwgc28gc2V0IHRoYXQgZmxhZy5cbmZ1bmN0aW9uIHdyaXRlT3JCdWZmZXIoc3RyZWFtLCBzdGF0ZSwgY2h1bmssIGVuY29kaW5nLCBjYikge1xuICBjaHVuayA9IGRlY29kZUNodW5rKHN0YXRlLCBjaHVuaywgZW5jb2RpbmcpO1xuICBpZiAoQnVmZmVyLmlzQnVmZmVyKGNodW5rKSlcbiAgICBlbmNvZGluZyA9ICdidWZmZXInO1xuICB2YXIgbGVuID0gc3RhdGUub2JqZWN0TW9kZSA/IDEgOiBjaHVuay5sZW5ndGg7XG5cbiAgc3RhdGUubGVuZ3RoICs9IGxlbjtcblxuICB2YXIgcmV0ID0gc3RhdGUubGVuZ3RoIDwgc3RhdGUuaGlnaFdhdGVyTWFyaztcbiAgLy8gd2UgbXVzdCBlbnN1cmUgdGhhdCBwcmV2aW91cyBuZWVkRHJhaW4gd2lsbCBub3QgYmUgcmVzZXQgdG8gZmFsc2UuXG4gIGlmICghcmV0KVxuICAgIHN0YXRlLm5lZWREcmFpbiA9IHRydWU7XG5cbiAgaWYgKHN0YXRlLndyaXRpbmcpXG4gICAgc3RhdGUuYnVmZmVyLnB1c2gobmV3IFdyaXRlUmVxKGNodW5rLCBlbmNvZGluZywgY2IpKTtcbiAgZWxzZVxuICAgIGRvV3JpdGUoc3RyZWFtLCBzdGF0ZSwgbGVuLCBjaHVuaywgZW5jb2RpbmcsIGNiKTtcblxuICByZXR1cm4gcmV0O1xufVxuXG5mdW5jdGlvbiBkb1dyaXRlKHN0cmVhbSwgc3RhdGUsIGxlbiwgY2h1bmssIGVuY29kaW5nLCBjYikge1xuICBzdGF0ZS53cml0ZWxlbiA9IGxlbjtcbiAgc3RhdGUud3JpdGVjYiA9IGNiO1xuICBzdGF0ZS53cml0aW5nID0gdHJ1ZTtcbiAgc3RhdGUuc3luYyA9IHRydWU7XG4gIHN0cmVhbS5fd3JpdGUoY2h1bmssIGVuY29kaW5nLCBzdGF0ZS5vbndyaXRlKTtcbiAgc3RhdGUuc3luYyA9IGZhbHNlO1xufVxuXG5mdW5jdGlvbiBvbndyaXRlRXJyb3Ioc3RyZWFtLCBzdGF0ZSwgc3luYywgZXIsIGNiKSB7XG4gIGlmIChzeW5jKVxuICAgIHByb2Nlc3MubmV4dFRpY2soZnVuY3Rpb24oKSB7XG4gICAgICBjYihlcik7XG4gICAgfSk7XG4gIGVsc2VcbiAgICBjYihlcik7XG5cbiAgc3RyZWFtLl93cml0YWJsZVN0YXRlLmVycm9yRW1pdHRlZCA9IHRydWU7XG4gIHN0cmVhbS5lbWl0KCdlcnJvcicsIGVyKTtcbn1cblxuZnVuY3Rpb24gb253cml0ZVN0YXRlVXBkYXRlKHN0YXRlKSB7XG4gIHN0YXRlLndyaXRpbmcgPSBmYWxzZTtcbiAgc3RhdGUud3JpdGVjYiA9IG51bGw7XG4gIHN0YXRlLmxlbmd0aCAtPSBzdGF0ZS53cml0ZWxlbjtcbiAgc3RhdGUud3JpdGVsZW4gPSAwO1xufVxuXG5mdW5jdGlvbiBvbndyaXRlKHN0cmVhbSwgZXIpIHtcbiAgdmFyIHN0YXRlID0gc3RyZWFtLl93cml0YWJsZVN0YXRlO1xuICB2YXIgc3luYyA9IHN0YXRlLnN5bmM7XG4gIHZhciBjYiA9IHN0YXRlLndyaXRlY2I7XG5cbiAgb253cml0ZVN0YXRlVXBkYXRlKHN0YXRlKTtcblxuICBpZiAoZXIpXG4gICAgb253cml0ZUVycm9yKHN0cmVhbSwgc3RhdGUsIHN5bmMsIGVyLCBjYik7XG4gIGVsc2Uge1xuICAgIC8vIENoZWNrIGlmIHdlJ3JlIGFjdHVhbGx5IHJlYWR5IHRvIGZpbmlzaCwgYnV0IGRvbid0IGVtaXQgeWV0XG4gICAgdmFyIGZpbmlzaGVkID0gbmVlZEZpbmlzaChzdHJlYW0sIHN0YXRlKTtcblxuICAgIGlmICghZmluaXNoZWQgJiYgIXN0YXRlLmJ1ZmZlclByb2Nlc3NpbmcgJiYgc3RhdGUuYnVmZmVyLmxlbmd0aClcbiAgICAgIGNsZWFyQnVmZmVyKHN0cmVhbSwgc3RhdGUpO1xuXG4gICAgaWYgKHN5bmMpIHtcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soZnVuY3Rpb24oKSB7XG4gICAgICAgIGFmdGVyV3JpdGUoc3RyZWFtLCBzdGF0ZSwgZmluaXNoZWQsIGNiKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBhZnRlcldyaXRlKHN0cmVhbSwgc3RhdGUsIGZpbmlzaGVkLCBjYik7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGFmdGVyV3JpdGUoc3RyZWFtLCBzdGF0ZSwgZmluaXNoZWQsIGNiKSB7XG4gIGlmICghZmluaXNoZWQpXG4gICAgb253cml0ZURyYWluKHN0cmVhbSwgc3RhdGUpO1xuICBjYigpO1xuICBpZiAoZmluaXNoZWQpXG4gICAgZmluaXNoTWF5YmUoc3RyZWFtLCBzdGF0ZSk7XG59XG5cbi8vIE11c3QgZm9yY2UgY2FsbGJhY2sgdG8gYmUgY2FsbGVkIG9uIG5leHRUaWNrLCBzbyB0aGF0IHdlIGRvbid0XG4vLyBlbWl0ICdkcmFpbicgYmVmb3JlIHRoZSB3cml0ZSgpIGNvbnN1bWVyIGdldHMgdGhlICdmYWxzZScgcmV0dXJuXG4vLyB2YWx1ZSwgYW5kIGhhcyBhIGNoYW5jZSB0byBhdHRhY2ggYSAnZHJhaW4nIGxpc3RlbmVyLlxuZnVuY3Rpb24gb253cml0ZURyYWluKHN0cmVhbSwgc3RhdGUpIHtcbiAgaWYgKHN0YXRlLmxlbmd0aCA9PT0gMCAmJiBzdGF0ZS5uZWVkRHJhaW4pIHtcbiAgICBzdGF0ZS5uZWVkRHJhaW4gPSBmYWxzZTtcbiAgICBzdHJlYW0uZW1pdCgnZHJhaW4nKTtcbiAgfVxufVxuXG5cbi8vIGlmIHRoZXJlJ3Mgc29tZXRoaW5nIGluIHRoZSBidWZmZXIgd2FpdGluZywgdGhlbiBwcm9jZXNzIGl0XG5mdW5jdGlvbiBjbGVhckJ1ZmZlcihzdHJlYW0sIHN0YXRlKSB7XG4gIHN0YXRlLmJ1ZmZlclByb2Nlc3NpbmcgPSB0cnVlO1xuXG4gIGZvciAodmFyIGMgPSAwOyBjIDwgc3RhdGUuYnVmZmVyLmxlbmd0aDsgYysrKSB7XG4gICAgdmFyIGVudHJ5ID0gc3RhdGUuYnVmZmVyW2NdO1xuICAgIHZhciBjaHVuayA9IGVudHJ5LmNodW5rO1xuICAgIHZhciBlbmNvZGluZyA9IGVudHJ5LmVuY29kaW5nO1xuICAgIHZhciBjYiA9IGVudHJ5LmNhbGxiYWNrO1xuICAgIHZhciBsZW4gPSBzdGF0ZS5vYmplY3RNb2RlID8gMSA6IGNodW5rLmxlbmd0aDtcblxuICAgIGRvV3JpdGUoc3RyZWFtLCBzdGF0ZSwgbGVuLCBjaHVuaywgZW5jb2RpbmcsIGNiKTtcblxuICAgIC8vIGlmIHdlIGRpZG4ndCBjYWxsIHRoZSBvbndyaXRlIGltbWVkaWF0ZWx5LCB0aGVuXG4gICAgLy8gaXQgbWVhbnMgdGhhdCB3ZSBuZWVkIHRvIHdhaXQgdW50aWwgaXQgZG9lcy5cbiAgICAvLyBhbHNvLCB0aGF0IG1lYW5zIHRoYXQgdGhlIGNodW5rIGFuZCBjYiBhcmUgY3VycmVudGx5XG4gICAgLy8gYmVpbmcgcHJvY2Vzc2VkLCBzbyBtb3ZlIHRoZSBidWZmZXIgY291bnRlciBwYXN0IHRoZW0uXG4gICAgaWYgKHN0YXRlLndyaXRpbmcpIHtcbiAgICAgIGMrKztcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHN0YXRlLmJ1ZmZlclByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgaWYgKGMgPCBzdGF0ZS5idWZmZXIubGVuZ3RoKVxuICAgIHN0YXRlLmJ1ZmZlciA9IHN0YXRlLmJ1ZmZlci5zbGljZShjKTtcbiAgZWxzZVxuICAgIHN0YXRlLmJ1ZmZlci5sZW5ndGggPSAwO1xufVxuXG5Xcml0YWJsZS5wcm90b3R5cGUuX3dyaXRlID0gZnVuY3Rpb24oY2h1bmssIGVuY29kaW5nLCBjYikge1xuICBjYihuZXcgRXJyb3IoJ25vdCBpbXBsZW1lbnRlZCcpKTtcbn07XG5cbldyaXRhYmxlLnByb3RvdHlwZS5lbmQgPSBmdW5jdGlvbihjaHVuaywgZW5jb2RpbmcsIGNiKSB7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX3dyaXRhYmxlU3RhdGU7XG5cbiAgaWYgKHR5cGVvZiBjaHVuayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGNiID0gY2h1bms7XG4gICAgY2h1bmsgPSBudWxsO1xuICAgIGVuY29kaW5nID0gbnVsbDtcbiAgfSBlbHNlIGlmICh0eXBlb2YgZW5jb2RpbmcgPT09ICdmdW5jdGlvbicpIHtcbiAgICBjYiA9IGVuY29kaW5nO1xuICAgIGVuY29kaW5nID0gbnVsbDtcbiAgfVxuXG4gIGlmICh0eXBlb2YgY2h1bmsgIT09ICd1bmRlZmluZWQnICYmIGNodW5rICE9PSBudWxsKVxuICAgIHRoaXMud3JpdGUoY2h1bmssIGVuY29kaW5nKTtcblxuICAvLyBpZ25vcmUgdW5uZWNlc3NhcnkgZW5kKCkgY2FsbHMuXG4gIGlmICghc3RhdGUuZW5kaW5nICYmICFzdGF0ZS5maW5pc2hlZClcbiAgICBlbmRXcml0YWJsZSh0aGlzLCBzdGF0ZSwgY2IpO1xufTtcblxuXG5mdW5jdGlvbiBuZWVkRmluaXNoKHN0cmVhbSwgc3RhdGUpIHtcbiAgcmV0dXJuIChzdGF0ZS5lbmRpbmcgJiZcbiAgICAgICAgICBzdGF0ZS5sZW5ndGggPT09IDAgJiZcbiAgICAgICAgICAhc3RhdGUuZmluaXNoZWQgJiZcbiAgICAgICAgICAhc3RhdGUud3JpdGluZyk7XG59XG5cbmZ1bmN0aW9uIGZpbmlzaE1heWJlKHN0cmVhbSwgc3RhdGUpIHtcbiAgdmFyIG5lZWQgPSBuZWVkRmluaXNoKHN0cmVhbSwgc3RhdGUpO1xuICBpZiAobmVlZCkge1xuICAgIHN0YXRlLmZpbmlzaGVkID0gdHJ1ZTtcbiAgICBzdHJlYW0uZW1pdCgnZmluaXNoJyk7XG4gIH1cbiAgcmV0dXJuIG5lZWQ7XG59XG5cbmZ1bmN0aW9uIGVuZFdyaXRhYmxlKHN0cmVhbSwgc3RhdGUsIGNiKSB7XG4gIHN0YXRlLmVuZGluZyA9IHRydWU7XG4gIGZpbmlzaE1heWJlKHN0cmVhbSwgc3RhdGUpO1xuICBpZiAoY2IpIHtcbiAgICBpZiAoc3RhdGUuZmluaXNoZWQpXG4gICAgICBwcm9jZXNzLm5leHRUaWNrKGNiKTtcbiAgICBlbHNlXG4gICAgICBzdHJlYW0ub25jZSgnZmluaXNoJywgY2IpO1xuICB9XG4gIHN0YXRlLmVuZGVkID0gdHJ1ZTtcbn1cbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4vLyBOT1RFOiBUaGVzZSB0eXBlIGNoZWNraW5nIGZ1bmN0aW9ucyBpbnRlbnRpb25hbGx5IGRvbid0IHVzZSBgaW5zdGFuY2VvZmBcbi8vIGJlY2F1c2UgaXQgaXMgZnJhZ2lsZSBhbmQgY2FuIGJlIGVhc2lseSBmYWtlZCB3aXRoIGBPYmplY3QuY3JlYXRlKClgLlxuZnVuY3Rpb24gaXNBcnJheShhcikge1xuICByZXR1cm4gQXJyYXkuaXNBcnJheShhcik7XG59XG5leHBvcnRzLmlzQXJyYXkgPSBpc0FycmF5O1xuXG5mdW5jdGlvbiBpc0Jvb2xlYW4oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnYm9vbGVhbic7XG59XG5leHBvcnRzLmlzQm9vbGVhbiA9IGlzQm9vbGVhbjtcblxuZnVuY3Rpb24gaXNOdWxsKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsO1xufVxuZXhwb3J0cy5pc051bGwgPSBpc051bGw7XG5cbmZ1bmN0aW9uIGlzTnVsbE9yVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09IG51bGw7XG59XG5leHBvcnRzLmlzTnVsbE9yVW5kZWZpbmVkID0gaXNOdWxsT3JVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5leHBvcnRzLmlzTnVtYmVyID0gaXNOdW1iZXI7XG5cbmZ1bmN0aW9uIGlzU3RyaW5nKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N0cmluZyc7XG59XG5leHBvcnRzLmlzU3RyaW5nID0gaXNTdHJpbmc7XG5cbmZ1bmN0aW9uIGlzU3ltYm9sKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCc7XG59XG5leHBvcnRzLmlzU3ltYm9sID0gaXNTeW1ib2w7XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG5leHBvcnRzLmlzVW5kZWZpbmVkID0gaXNVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzUmVnRXhwKHJlKSB7XG4gIHJldHVybiBpc09iamVjdChyZSkgJiYgb2JqZWN0VG9TdHJpbmcocmUpID09PSAnW29iamVjdCBSZWdFeHBdJztcbn1cbmV4cG9ydHMuaXNSZWdFeHAgPSBpc1JlZ0V4cDtcblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5leHBvcnRzLmlzT2JqZWN0ID0gaXNPYmplY3Q7XG5cbmZ1bmN0aW9uIGlzRGF0ZShkKSB7XG4gIHJldHVybiBpc09iamVjdChkKSAmJiBvYmplY3RUb1N0cmluZyhkKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuZXhwb3J0cy5pc0RhdGUgPSBpc0RhdGU7XG5cbmZ1bmN0aW9uIGlzRXJyb3IoZSkge1xuICByZXR1cm4gaXNPYmplY3QoZSkgJiZcbiAgICAgIChvYmplY3RUb1N0cmluZyhlKSA9PT0gJ1tvYmplY3QgRXJyb3JdJyB8fCBlIGluc3RhbmNlb2YgRXJyb3IpO1xufVxuZXhwb3J0cy5pc0Vycm9yID0gaXNFcnJvcjtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5leHBvcnRzLmlzRnVuY3Rpb24gPSBpc0Z1bmN0aW9uO1xuXG5mdW5jdGlvbiBpc1ByaW1pdGl2ZShhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gbnVsbCB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ2Jvb2xlYW4nIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnbnVtYmVyJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N0cmluZycgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdzeW1ib2wnIHx8ICAvLyBFUzYgc3ltYm9sXG4gICAgICAgICB0eXBlb2YgYXJnID09PSAndW5kZWZpbmVkJztcbn1cbmV4cG9ydHMuaXNQcmltaXRpdmUgPSBpc1ByaW1pdGl2ZTtcblxuZnVuY3Rpb24gaXNCdWZmZXIoYXJnKSB7XG4gIHJldHVybiBCdWZmZXIuaXNCdWZmZXIoYXJnKTtcbn1cbmV4cG9ydHMuaXNCdWZmZXIgPSBpc0J1ZmZlcjtcblxuZnVuY3Rpb24gb2JqZWN0VG9TdHJpbmcobykge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG8pO1xufSIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIi4vbGliL19zdHJlYW1fcGFzc3Rocm91Z2guanNcIilcbiIsInZhciBTdHJlYW0gPSByZXF1aXJlKCdzdHJlYW0nKTsgLy8gaGFjayB0byBmaXggYSBjaXJjdWxhciBkZXBlbmRlbmN5IGlzc3VlIHdoZW4gdXNlZCB3aXRoIGJyb3dzZXJpZnlcbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vbGliL19zdHJlYW1fcmVhZGFibGUuanMnKTtcbmV4cG9ydHMuU3RyZWFtID0gU3RyZWFtO1xuZXhwb3J0cy5SZWFkYWJsZSA9IGV4cG9ydHM7XG5leHBvcnRzLldyaXRhYmxlID0gcmVxdWlyZSgnLi9saWIvX3N0cmVhbV93cml0YWJsZS5qcycpO1xuZXhwb3J0cy5EdXBsZXggPSByZXF1aXJlKCcuL2xpYi9fc3RyZWFtX2R1cGxleC5qcycpO1xuZXhwb3J0cy5UcmFuc2Zvcm0gPSByZXF1aXJlKCcuL2xpYi9fc3RyZWFtX3RyYW5zZm9ybS5qcycpO1xuZXhwb3J0cy5QYXNzVGhyb3VnaCA9IHJlcXVpcmUoJy4vbGliL19zdHJlYW1fcGFzc3Rocm91Z2guanMnKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIi4vbGliL19zdHJlYW1fdHJhbnNmb3JtLmpzXCIpXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCIuL2xpYi9fc3RyZWFtX3dyaXRhYmxlLmpzXCIpXG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxubW9kdWxlLmV4cG9ydHMgPSBTdHJlYW07XG5cbnZhciBFRSA9IHJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlcjtcbnZhciBpbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJyk7XG5cbmluaGVyaXRzKFN0cmVhbSwgRUUpO1xuU3RyZWFtLlJlYWRhYmxlID0gcmVxdWlyZSgncmVhZGFibGUtc3RyZWFtL3JlYWRhYmxlLmpzJyk7XG5TdHJlYW0uV3JpdGFibGUgPSByZXF1aXJlKCdyZWFkYWJsZS1zdHJlYW0vd3JpdGFibGUuanMnKTtcblN0cmVhbS5EdXBsZXggPSByZXF1aXJlKCdyZWFkYWJsZS1zdHJlYW0vZHVwbGV4LmpzJyk7XG5TdHJlYW0uVHJhbnNmb3JtID0gcmVxdWlyZSgncmVhZGFibGUtc3RyZWFtL3RyYW5zZm9ybS5qcycpO1xuU3RyZWFtLlBhc3NUaHJvdWdoID0gcmVxdWlyZSgncmVhZGFibGUtc3RyZWFtL3Bhc3N0aHJvdWdoLmpzJyk7XG5cbi8vIEJhY2t3YXJkcy1jb21wYXQgd2l0aCBub2RlIDAuNC54XG5TdHJlYW0uU3RyZWFtID0gU3RyZWFtO1xuXG5cblxuLy8gb2xkLXN0eWxlIHN0cmVhbXMuICBOb3RlIHRoYXQgdGhlIHBpcGUgbWV0aG9kICh0aGUgb25seSByZWxldmFudFxuLy8gcGFydCBvZiB0aGlzIGNsYXNzKSBpcyBvdmVycmlkZGVuIGluIHRoZSBSZWFkYWJsZSBjbGFzcy5cblxuZnVuY3Rpb24gU3RyZWFtKCkge1xuICBFRS5jYWxsKHRoaXMpO1xufVxuXG5TdHJlYW0ucHJvdG90eXBlLnBpcGUgPSBmdW5jdGlvbihkZXN0LCBvcHRpb25zKSB7XG4gIHZhciBzb3VyY2UgPSB0aGlzO1xuXG4gIGZ1bmN0aW9uIG9uZGF0YShjaHVuaykge1xuICAgIGlmIChkZXN0LndyaXRhYmxlKSB7XG4gICAgICBpZiAoZmFsc2UgPT09IGRlc3Qud3JpdGUoY2h1bmspICYmIHNvdXJjZS5wYXVzZSkge1xuICAgICAgICBzb3VyY2UucGF1c2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzb3VyY2Uub24oJ2RhdGEnLCBvbmRhdGEpO1xuXG4gIGZ1bmN0aW9uIG9uZHJhaW4oKSB7XG4gICAgaWYgKHNvdXJjZS5yZWFkYWJsZSAmJiBzb3VyY2UucmVzdW1lKSB7XG4gICAgICBzb3VyY2UucmVzdW1lKCk7XG4gICAgfVxuICB9XG5cbiAgZGVzdC5vbignZHJhaW4nLCBvbmRyYWluKTtcblxuICAvLyBJZiB0aGUgJ2VuZCcgb3B0aW9uIGlzIG5vdCBzdXBwbGllZCwgZGVzdC5lbmQoKSB3aWxsIGJlIGNhbGxlZCB3aGVuXG4gIC8vIHNvdXJjZSBnZXRzIHRoZSAnZW5kJyBvciAnY2xvc2UnIGV2ZW50cy4gIE9ubHkgZGVzdC5lbmQoKSBvbmNlLlxuICBpZiAoIWRlc3QuX2lzU3RkaW8gJiYgKCFvcHRpb25zIHx8IG9wdGlvbnMuZW5kICE9PSBmYWxzZSkpIHtcbiAgICBzb3VyY2Uub24oJ2VuZCcsIG9uZW5kKTtcbiAgICBzb3VyY2Uub24oJ2Nsb3NlJywgb25jbG9zZSk7XG4gIH1cblxuICB2YXIgZGlkT25FbmQgPSBmYWxzZTtcbiAgZnVuY3Rpb24gb25lbmQoKSB7XG4gICAgaWYgKGRpZE9uRW5kKSByZXR1cm47XG4gICAgZGlkT25FbmQgPSB0cnVlO1xuXG4gICAgZGVzdC5lbmQoKTtcbiAgfVxuXG5cbiAgZnVuY3Rpb24gb25jbG9zZSgpIHtcbiAgICBpZiAoZGlkT25FbmQpIHJldHVybjtcbiAgICBkaWRPbkVuZCA9IHRydWU7XG5cbiAgICBpZiAodHlwZW9mIGRlc3QuZGVzdHJveSA9PT0gJ2Z1bmN0aW9uJykgZGVzdC5kZXN0cm95KCk7XG4gIH1cblxuICAvLyBkb24ndCBsZWF2ZSBkYW5nbGluZyBwaXBlcyB3aGVuIHRoZXJlIGFyZSBlcnJvcnMuXG4gIGZ1bmN0aW9uIG9uZXJyb3IoZXIpIHtcbiAgICBjbGVhbnVwKCk7XG4gICAgaWYgKEVFLmxpc3RlbmVyQ291bnQodGhpcywgJ2Vycm9yJykgPT09IDApIHtcbiAgICAgIHRocm93IGVyOyAvLyBVbmhhbmRsZWQgc3RyZWFtIGVycm9yIGluIHBpcGUuXG4gICAgfVxuICB9XG5cbiAgc291cmNlLm9uKCdlcnJvcicsIG9uZXJyb3IpO1xuICBkZXN0Lm9uKCdlcnJvcicsIG9uZXJyb3IpO1xuXG4gIC8vIHJlbW92ZSBhbGwgdGhlIGV2ZW50IGxpc3RlbmVycyB0aGF0IHdlcmUgYWRkZWQuXG4gIGZ1bmN0aW9uIGNsZWFudXAoKSB7XG4gICAgc291cmNlLnJlbW92ZUxpc3RlbmVyKCdkYXRhJywgb25kYXRhKTtcbiAgICBkZXN0LnJlbW92ZUxpc3RlbmVyKCdkcmFpbicsIG9uZHJhaW4pO1xuXG4gICAgc291cmNlLnJlbW92ZUxpc3RlbmVyKCdlbmQnLCBvbmVuZCk7XG4gICAgc291cmNlLnJlbW92ZUxpc3RlbmVyKCdjbG9zZScsIG9uY2xvc2UpO1xuXG4gICAgc291cmNlLnJlbW92ZUxpc3RlbmVyKCdlcnJvcicsIG9uZXJyb3IpO1xuICAgIGRlc3QucmVtb3ZlTGlzdGVuZXIoJ2Vycm9yJywgb25lcnJvcik7XG5cbiAgICBzb3VyY2UucmVtb3ZlTGlzdGVuZXIoJ2VuZCcsIGNsZWFudXApO1xuICAgIHNvdXJjZS5yZW1vdmVMaXN0ZW5lcignY2xvc2UnLCBjbGVhbnVwKTtcblxuICAgIGRlc3QucmVtb3ZlTGlzdGVuZXIoJ2Nsb3NlJywgY2xlYW51cCk7XG4gIH1cblxuICBzb3VyY2Uub24oJ2VuZCcsIGNsZWFudXApO1xuICBzb3VyY2Uub24oJ2Nsb3NlJywgY2xlYW51cCk7XG5cbiAgZGVzdC5vbignY2xvc2UnLCBjbGVhbnVwKTtcblxuICBkZXN0LmVtaXQoJ3BpcGUnLCBzb3VyY2UpO1xuXG4gIC8vIEFsbG93IGZvciB1bml4LWxpa2UgdXNhZ2U6IEEucGlwZShCKS5waXBlKEMpXG4gIHJldHVybiBkZXN0O1xufTtcbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG52YXIgQnVmZmVyID0gcmVxdWlyZSgnYnVmZmVyJykuQnVmZmVyO1xuXG52YXIgaXNCdWZmZXJFbmNvZGluZyA9IEJ1ZmZlci5pc0VuY29kaW5nXG4gIHx8IGZ1bmN0aW9uKGVuY29kaW5nKSB7XG4gICAgICAgc3dpdGNoIChlbmNvZGluZyAmJiBlbmNvZGluZy50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICAgICBjYXNlICdoZXgnOiBjYXNlICd1dGY4JzogY2FzZSAndXRmLTgnOiBjYXNlICdhc2NpaSc6IGNhc2UgJ2JpbmFyeSc6IGNhc2UgJ2Jhc2U2NCc6IGNhc2UgJ3VjczInOiBjYXNlICd1Y3MtMic6IGNhc2UgJ3V0ZjE2bGUnOiBjYXNlICd1dGYtMTZsZSc6IGNhc2UgJ3Jhdyc6IHJldHVybiB0cnVlO1xuICAgICAgICAgZGVmYXVsdDogcmV0dXJuIGZhbHNlO1xuICAgICAgIH1cbiAgICAgfVxuXG5cbmZ1bmN0aW9uIGFzc2VydEVuY29kaW5nKGVuY29kaW5nKSB7XG4gIGlmIChlbmNvZGluZyAmJiAhaXNCdWZmZXJFbmNvZGluZyhlbmNvZGluZykpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gZW5jb2Rpbmc6ICcgKyBlbmNvZGluZyk7XG4gIH1cbn1cblxuLy8gU3RyaW5nRGVjb2RlciBwcm92aWRlcyBhbiBpbnRlcmZhY2UgZm9yIGVmZmljaWVudGx5IHNwbGl0dGluZyBhIHNlcmllcyBvZlxuLy8gYnVmZmVycyBpbnRvIGEgc2VyaWVzIG9mIEpTIHN0cmluZ3Mgd2l0aG91dCBicmVha2luZyBhcGFydCBtdWx0aS1ieXRlXG4vLyBjaGFyYWN0ZXJzLiBDRVNVLTggaXMgaGFuZGxlZCBhcyBwYXJ0IG9mIHRoZSBVVEYtOCBlbmNvZGluZy5cbi8vXG4vLyBAVE9ETyBIYW5kbGluZyBhbGwgZW5jb2RpbmdzIGluc2lkZSBhIHNpbmdsZSBvYmplY3QgbWFrZXMgaXQgdmVyeSBkaWZmaWN1bHRcbi8vIHRvIHJlYXNvbiBhYm91dCB0aGlzIGNvZGUsIHNvIGl0IHNob3VsZCBiZSBzcGxpdCB1cCBpbiB0aGUgZnV0dXJlLlxuLy8gQFRPRE8gVGhlcmUgc2hvdWxkIGJlIGEgdXRmOC1zdHJpY3QgZW5jb2RpbmcgdGhhdCByZWplY3RzIGludmFsaWQgVVRGLTggY29kZVxuLy8gcG9pbnRzIGFzIHVzZWQgYnkgQ0VTVS04LlxudmFyIFN0cmluZ0RlY29kZXIgPSBleHBvcnRzLlN0cmluZ0RlY29kZXIgPSBmdW5jdGlvbihlbmNvZGluZykge1xuICB0aGlzLmVuY29kaW5nID0gKGVuY29kaW5nIHx8ICd1dGY4JykudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9bLV9dLywgJycpO1xuICBhc3NlcnRFbmNvZGluZyhlbmNvZGluZyk7XG4gIHN3aXRjaCAodGhpcy5lbmNvZGluZykge1xuICAgIGNhc2UgJ3V0ZjgnOlxuICAgICAgLy8gQ0VTVS04IHJlcHJlc2VudHMgZWFjaCBvZiBTdXJyb2dhdGUgUGFpciBieSAzLWJ5dGVzXG4gICAgICB0aGlzLnN1cnJvZ2F0ZVNpemUgPSAzO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgICAvLyBVVEYtMTYgcmVwcmVzZW50cyBlYWNoIG9mIFN1cnJvZ2F0ZSBQYWlyIGJ5IDItYnl0ZXNcbiAgICAgIHRoaXMuc3Vycm9nYXRlU2l6ZSA9IDI7XG4gICAgICB0aGlzLmRldGVjdEluY29tcGxldGVDaGFyID0gdXRmMTZEZXRlY3RJbmNvbXBsZXRlQ2hhcjtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICAvLyBCYXNlLTY0IHN0b3JlcyAzIGJ5dGVzIGluIDQgY2hhcnMsIGFuZCBwYWRzIHRoZSByZW1haW5kZXIuXG4gICAgICB0aGlzLnN1cnJvZ2F0ZVNpemUgPSAzO1xuICAgICAgdGhpcy5kZXRlY3RJbmNvbXBsZXRlQ2hhciA9IGJhc2U2NERldGVjdEluY29tcGxldGVDaGFyO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRoaXMud3JpdGUgPSBwYXNzVGhyb3VnaFdyaXRlO1xuICAgICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gRW5vdWdoIHNwYWNlIHRvIHN0b3JlIGFsbCBieXRlcyBvZiBhIHNpbmdsZSBjaGFyYWN0ZXIuIFVURi04IG5lZWRzIDRcbiAgLy8gYnl0ZXMsIGJ1dCBDRVNVLTggbWF5IHJlcXVpcmUgdXAgdG8gNiAoMyBieXRlcyBwZXIgc3Vycm9nYXRlKS5cbiAgdGhpcy5jaGFyQnVmZmVyID0gbmV3IEJ1ZmZlcig2KTtcbiAgLy8gTnVtYmVyIG9mIGJ5dGVzIHJlY2VpdmVkIGZvciB0aGUgY3VycmVudCBpbmNvbXBsZXRlIG11bHRpLWJ5dGUgY2hhcmFjdGVyLlxuICB0aGlzLmNoYXJSZWNlaXZlZCA9IDA7XG4gIC8vIE51bWJlciBvZiBieXRlcyBleHBlY3RlZCBmb3IgdGhlIGN1cnJlbnQgaW5jb21wbGV0ZSBtdWx0aS1ieXRlIGNoYXJhY3Rlci5cbiAgdGhpcy5jaGFyTGVuZ3RoID0gMDtcbn07XG5cblxuLy8gd3JpdGUgZGVjb2RlcyB0aGUgZ2l2ZW4gYnVmZmVyIGFuZCByZXR1cm5zIGl0IGFzIEpTIHN0cmluZyB0aGF0IGlzXG4vLyBndWFyYW50ZWVkIHRvIG5vdCBjb250YWluIGFueSBwYXJ0aWFsIG11bHRpLWJ5dGUgY2hhcmFjdGVycy4gQW55IHBhcnRpYWxcbi8vIGNoYXJhY3RlciBmb3VuZCBhdCB0aGUgZW5kIG9mIHRoZSBidWZmZXIgaXMgYnVmZmVyZWQgdXAsIGFuZCB3aWxsIGJlXG4vLyByZXR1cm5lZCB3aGVuIGNhbGxpbmcgd3JpdGUgYWdhaW4gd2l0aCB0aGUgcmVtYWluaW5nIGJ5dGVzLlxuLy9cbi8vIE5vdGU6IENvbnZlcnRpbmcgYSBCdWZmZXIgY29udGFpbmluZyBhbiBvcnBoYW4gc3Vycm9nYXRlIHRvIGEgU3RyaW5nXG4vLyBjdXJyZW50bHkgd29ya3MsIGJ1dCBjb252ZXJ0aW5nIGEgU3RyaW5nIHRvIGEgQnVmZmVyICh2aWEgYG5ldyBCdWZmZXJgLCBvclxuLy8gQnVmZmVyI3dyaXRlKSB3aWxsIHJlcGxhY2UgaW5jb21wbGV0ZSBzdXJyb2dhdGVzIHdpdGggdGhlIHVuaWNvZGVcbi8vIHJlcGxhY2VtZW50IGNoYXJhY3Rlci4gU2VlIGh0dHBzOi8vY29kZXJldmlldy5jaHJvbWl1bS5vcmcvMTIxMTczMDA5LyAuXG5TdHJpbmdEZWNvZGVyLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uKGJ1ZmZlcikge1xuICB2YXIgY2hhclN0ciA9ICcnO1xuICAvLyBpZiBvdXIgbGFzdCB3cml0ZSBlbmRlZCB3aXRoIGFuIGluY29tcGxldGUgbXVsdGlieXRlIGNoYXJhY3RlclxuICB3aGlsZSAodGhpcy5jaGFyTGVuZ3RoKSB7XG4gICAgLy8gZGV0ZXJtaW5lIGhvdyBtYW55IHJlbWFpbmluZyBieXRlcyB0aGlzIGJ1ZmZlciBoYXMgdG8gb2ZmZXIgZm9yIHRoaXMgY2hhclxuICAgIHZhciBhdmFpbGFibGUgPSAoYnVmZmVyLmxlbmd0aCA+PSB0aGlzLmNoYXJMZW5ndGggLSB0aGlzLmNoYXJSZWNlaXZlZCkgP1xuICAgICAgICB0aGlzLmNoYXJMZW5ndGggLSB0aGlzLmNoYXJSZWNlaXZlZCA6XG4gICAgICAgIGJ1ZmZlci5sZW5ndGg7XG5cbiAgICAvLyBhZGQgdGhlIG5ldyBieXRlcyB0byB0aGUgY2hhciBidWZmZXJcbiAgICBidWZmZXIuY29weSh0aGlzLmNoYXJCdWZmZXIsIHRoaXMuY2hhclJlY2VpdmVkLCAwLCBhdmFpbGFibGUpO1xuICAgIHRoaXMuY2hhclJlY2VpdmVkICs9IGF2YWlsYWJsZTtcblxuICAgIGlmICh0aGlzLmNoYXJSZWNlaXZlZCA8IHRoaXMuY2hhckxlbmd0aCkge1xuICAgICAgLy8gc3RpbGwgbm90IGVub3VnaCBjaGFycyBpbiB0aGlzIGJ1ZmZlcj8gd2FpdCBmb3IgbW9yZSAuLi5cbiAgICAgIHJldHVybiAnJztcbiAgICB9XG5cbiAgICAvLyByZW1vdmUgYnl0ZXMgYmVsb25naW5nIHRvIHRoZSBjdXJyZW50IGNoYXJhY3RlciBmcm9tIHRoZSBidWZmZXJcbiAgICBidWZmZXIgPSBidWZmZXIuc2xpY2UoYXZhaWxhYmxlLCBidWZmZXIubGVuZ3RoKTtcblxuICAgIC8vIGdldCB0aGUgY2hhcmFjdGVyIHRoYXQgd2FzIHNwbGl0XG4gICAgY2hhclN0ciA9IHRoaXMuY2hhckJ1ZmZlci5zbGljZSgwLCB0aGlzLmNoYXJMZW5ndGgpLnRvU3RyaW5nKHRoaXMuZW5jb2RpbmcpO1xuXG4gICAgLy8gQ0VTVS04OiBsZWFkIHN1cnJvZ2F0ZSAoRDgwMC1EQkZGKSBpcyBhbHNvIHRoZSBpbmNvbXBsZXRlIGNoYXJhY3RlclxuICAgIHZhciBjaGFyQ29kZSA9IGNoYXJTdHIuY2hhckNvZGVBdChjaGFyU3RyLmxlbmd0aCAtIDEpO1xuICAgIGlmIChjaGFyQ29kZSA+PSAweEQ4MDAgJiYgY2hhckNvZGUgPD0gMHhEQkZGKSB7XG4gICAgICB0aGlzLmNoYXJMZW5ndGggKz0gdGhpcy5zdXJyb2dhdGVTaXplO1xuICAgICAgY2hhclN0ciA9ICcnO1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIHRoaXMuY2hhclJlY2VpdmVkID0gdGhpcy5jaGFyTGVuZ3RoID0gMDtcblxuICAgIC8vIGlmIHRoZXJlIGFyZSBubyBtb3JlIGJ5dGVzIGluIHRoaXMgYnVmZmVyLCBqdXN0IGVtaXQgb3VyIGNoYXJcbiAgICBpZiAoYnVmZmVyLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIGNoYXJTdHI7XG4gICAgfVxuICAgIGJyZWFrO1xuICB9XG5cbiAgLy8gZGV0ZXJtaW5lIGFuZCBzZXQgY2hhckxlbmd0aCAvIGNoYXJSZWNlaXZlZFxuICB0aGlzLmRldGVjdEluY29tcGxldGVDaGFyKGJ1ZmZlcik7XG5cbiAgdmFyIGVuZCA9IGJ1ZmZlci5sZW5ndGg7XG4gIGlmICh0aGlzLmNoYXJMZW5ndGgpIHtcbiAgICAvLyBidWZmZXIgdGhlIGluY29tcGxldGUgY2hhcmFjdGVyIGJ5dGVzIHdlIGdvdFxuICAgIGJ1ZmZlci5jb3B5KHRoaXMuY2hhckJ1ZmZlciwgMCwgYnVmZmVyLmxlbmd0aCAtIHRoaXMuY2hhclJlY2VpdmVkLCBlbmQpO1xuICAgIGVuZCAtPSB0aGlzLmNoYXJSZWNlaXZlZDtcbiAgfVxuXG4gIGNoYXJTdHIgKz0gYnVmZmVyLnRvU3RyaW5nKHRoaXMuZW5jb2RpbmcsIDAsIGVuZCk7XG5cbiAgdmFyIGVuZCA9IGNoYXJTdHIubGVuZ3RoIC0gMTtcbiAgdmFyIGNoYXJDb2RlID0gY2hhclN0ci5jaGFyQ29kZUF0KGVuZCk7XG4gIC8vIENFU1UtODogbGVhZCBzdXJyb2dhdGUgKEQ4MDAtREJGRikgaXMgYWxzbyB0aGUgaW5jb21wbGV0ZSBjaGFyYWN0ZXJcbiAgaWYgKGNoYXJDb2RlID49IDB4RDgwMCAmJiBjaGFyQ29kZSA8PSAweERCRkYpIHtcbiAgICB2YXIgc2l6ZSA9IHRoaXMuc3Vycm9nYXRlU2l6ZTtcbiAgICB0aGlzLmNoYXJMZW5ndGggKz0gc2l6ZTtcbiAgICB0aGlzLmNoYXJSZWNlaXZlZCArPSBzaXplO1xuICAgIHRoaXMuY2hhckJ1ZmZlci5jb3B5KHRoaXMuY2hhckJ1ZmZlciwgc2l6ZSwgMCwgc2l6ZSk7XG4gICAgYnVmZmVyLmNvcHkodGhpcy5jaGFyQnVmZmVyLCAwLCAwLCBzaXplKTtcbiAgICByZXR1cm4gY2hhclN0ci5zdWJzdHJpbmcoMCwgZW5kKTtcbiAgfVxuXG4gIC8vIG9yIGp1c3QgZW1pdCB0aGUgY2hhclN0clxuICByZXR1cm4gY2hhclN0cjtcbn07XG5cbi8vIGRldGVjdEluY29tcGxldGVDaGFyIGRldGVybWluZXMgaWYgdGhlcmUgaXMgYW4gaW5jb21wbGV0ZSBVVEYtOCBjaGFyYWN0ZXIgYXRcbi8vIHRoZSBlbmQgb2YgdGhlIGdpdmVuIGJ1ZmZlci4gSWYgc28sIGl0IHNldHMgdGhpcy5jaGFyTGVuZ3RoIHRvIHRoZSBieXRlXG4vLyBsZW5ndGggdGhhdCBjaGFyYWN0ZXIsIGFuZCBzZXRzIHRoaXMuY2hhclJlY2VpdmVkIHRvIHRoZSBudW1iZXIgb2YgYnl0ZXNcbi8vIHRoYXQgYXJlIGF2YWlsYWJsZSBmb3IgdGhpcyBjaGFyYWN0ZXIuXG5TdHJpbmdEZWNvZGVyLnByb3RvdHlwZS5kZXRlY3RJbmNvbXBsZXRlQ2hhciA9IGZ1bmN0aW9uKGJ1ZmZlcikge1xuICAvLyBkZXRlcm1pbmUgaG93IG1hbnkgYnl0ZXMgd2UgaGF2ZSB0byBjaGVjayBhdCB0aGUgZW5kIG9mIHRoaXMgYnVmZmVyXG4gIHZhciBpID0gKGJ1ZmZlci5sZW5ndGggPj0gMykgPyAzIDogYnVmZmVyLmxlbmd0aDtcblxuICAvLyBGaWd1cmUgb3V0IGlmIG9uZSBvZiB0aGUgbGFzdCBpIGJ5dGVzIG9mIG91ciBidWZmZXIgYW5ub3VuY2VzIGFuXG4gIC8vIGluY29tcGxldGUgY2hhci5cbiAgZm9yICg7IGkgPiAwOyBpLS0pIHtcbiAgICB2YXIgYyA9IGJ1ZmZlcltidWZmZXIubGVuZ3RoIC0gaV07XG5cbiAgICAvLyBTZWUgaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9VVEYtOCNEZXNjcmlwdGlvblxuXG4gICAgLy8gMTEwWFhYWFhcbiAgICBpZiAoaSA9PSAxICYmIGMgPj4gNSA9PSAweDA2KSB7XG4gICAgICB0aGlzLmNoYXJMZW5ndGggPSAyO1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgLy8gMTExMFhYWFhcbiAgICBpZiAoaSA8PSAyICYmIGMgPj4gNCA9PSAweDBFKSB7XG4gICAgICB0aGlzLmNoYXJMZW5ndGggPSAzO1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgLy8gMTExMTBYWFhcbiAgICBpZiAoaSA8PSAzICYmIGMgPj4gMyA9PSAweDFFKSB7XG4gICAgICB0aGlzLmNoYXJMZW5ndGggPSA0O1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHRoaXMuY2hhclJlY2VpdmVkID0gaTtcbn07XG5cblN0cmluZ0RlY29kZXIucHJvdG90eXBlLmVuZCA9IGZ1bmN0aW9uKGJ1ZmZlcikge1xuICB2YXIgcmVzID0gJyc7XG4gIGlmIChidWZmZXIgJiYgYnVmZmVyLmxlbmd0aClcbiAgICByZXMgPSB0aGlzLndyaXRlKGJ1ZmZlcik7XG5cbiAgaWYgKHRoaXMuY2hhclJlY2VpdmVkKSB7XG4gICAgdmFyIGNyID0gdGhpcy5jaGFyUmVjZWl2ZWQ7XG4gICAgdmFyIGJ1ZiA9IHRoaXMuY2hhckJ1ZmZlcjtcbiAgICB2YXIgZW5jID0gdGhpcy5lbmNvZGluZztcbiAgICByZXMgKz0gYnVmLnNsaWNlKDAsIGNyKS50b1N0cmluZyhlbmMpO1xuICB9XG5cbiAgcmV0dXJuIHJlcztcbn07XG5cbmZ1bmN0aW9uIHBhc3NUaHJvdWdoV3JpdGUoYnVmZmVyKSB7XG4gIHJldHVybiBidWZmZXIudG9TdHJpbmcodGhpcy5lbmNvZGluZyk7XG59XG5cbmZ1bmN0aW9uIHV0ZjE2RGV0ZWN0SW5jb21wbGV0ZUNoYXIoYnVmZmVyKSB7XG4gIHRoaXMuY2hhclJlY2VpdmVkID0gYnVmZmVyLmxlbmd0aCAlIDI7XG4gIHRoaXMuY2hhckxlbmd0aCA9IHRoaXMuY2hhclJlY2VpdmVkID8gMiA6IDA7XG59XG5cbmZ1bmN0aW9uIGJhc2U2NERldGVjdEluY29tcGxldGVDaGFyKGJ1ZmZlcikge1xuICB0aGlzLmNoYXJSZWNlaXZlZCA9IGJ1ZmZlci5sZW5ndGggJSAzO1xuICB0aGlzLmNoYXJMZW5ndGggPSB0aGlzLmNoYXJSZWNlaXZlZCA/IDMgOiAwO1xufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0J1ZmZlcihhcmcpIHtcbiAgcmV0dXJuIGFyZyAmJiB0eXBlb2YgYXJnID09PSAnb2JqZWN0J1xuICAgICYmIHR5cGVvZiBhcmcuY29weSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICYmIHR5cGVvZiBhcmcuZmlsbCA9PT0gJ2Z1bmN0aW9uJ1xuICAgICYmIHR5cGVvZiBhcmcucmVhZFVJbnQ4ID09PSAnZnVuY3Rpb24nO1xufSIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG52YXIgZm9ybWF0UmVnRXhwID0gLyVbc2RqJV0vZztcbmV4cG9ydHMuZm9ybWF0ID0gZnVuY3Rpb24oZikge1xuICBpZiAoIWlzU3RyaW5nKGYpKSB7XG4gICAgdmFyIG9iamVjdHMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgb2JqZWN0cy5wdXNoKGluc3BlY3QoYXJndW1lbnRzW2ldKSk7XG4gICAgfVxuICAgIHJldHVybiBvYmplY3RzLmpvaW4oJyAnKTtcbiAgfVxuXG4gIHZhciBpID0gMTtcbiAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gIHZhciBsZW4gPSBhcmdzLmxlbmd0aDtcbiAgdmFyIHN0ciA9IFN0cmluZyhmKS5yZXBsYWNlKGZvcm1hdFJlZ0V4cCwgZnVuY3Rpb24oeCkge1xuICAgIGlmICh4ID09PSAnJSUnKSByZXR1cm4gJyUnO1xuICAgIGlmIChpID49IGxlbikgcmV0dXJuIHg7XG4gICAgc3dpdGNoICh4KSB7XG4gICAgICBjYXNlICclcyc6IHJldHVybiBTdHJpbmcoYXJnc1tpKytdKTtcbiAgICAgIGNhc2UgJyVkJzogcmV0dXJuIE51bWJlcihhcmdzW2krK10pO1xuICAgICAgY2FzZSAnJWonOlxuICAgICAgICB0cnkge1xuICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShhcmdzW2krK10pO1xuICAgICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgICAgcmV0dXJuICdbQ2lyY3VsYXJdJztcbiAgICAgICAgfVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIHg7XG4gICAgfVxuICB9KTtcbiAgZm9yICh2YXIgeCA9IGFyZ3NbaV07IGkgPCBsZW47IHggPSBhcmdzWysraV0pIHtcbiAgICBpZiAoaXNOdWxsKHgpIHx8ICFpc09iamVjdCh4KSkge1xuICAgICAgc3RyICs9ICcgJyArIHg7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciArPSAnICcgKyBpbnNwZWN0KHgpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gc3RyO1xufTtcblxuXG4vLyBNYXJrIHRoYXQgYSBtZXRob2Qgc2hvdWxkIG5vdCBiZSB1c2VkLlxuLy8gUmV0dXJucyBhIG1vZGlmaWVkIGZ1bmN0aW9uIHdoaWNoIHdhcm5zIG9uY2UgYnkgZGVmYXVsdC5cbi8vIElmIC0tbm8tZGVwcmVjYXRpb24gaXMgc2V0LCB0aGVuIGl0IGlzIGEgbm8tb3AuXG5leHBvcnRzLmRlcHJlY2F0ZSA9IGZ1bmN0aW9uKGZuLCBtc2cpIHtcbiAgLy8gQWxsb3cgZm9yIGRlcHJlY2F0aW5nIHRoaW5ncyBpbiB0aGUgcHJvY2VzcyBvZiBzdGFydGluZyB1cC5cbiAgaWYgKGlzVW5kZWZpbmVkKGdsb2JhbC5wcm9jZXNzKSkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBleHBvcnRzLmRlcHJlY2F0ZShmbiwgbXNnKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH1cblxuICBpZiAocHJvY2Vzcy5ub0RlcHJlY2F0aW9uID09PSB0cnVlKSB7XG4gICAgcmV0dXJuIGZuO1xuICB9XG5cbiAgdmFyIHdhcm5lZCA9IGZhbHNlO1xuICBmdW5jdGlvbiBkZXByZWNhdGVkKCkge1xuICAgIGlmICghd2FybmVkKSB7XG4gICAgICBpZiAocHJvY2Vzcy50aHJvd0RlcHJlY2F0aW9uKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xuICAgICAgfSBlbHNlIGlmIChwcm9jZXNzLnRyYWNlRGVwcmVjYXRpb24pIHtcbiAgICAgICAgY29uc29sZS50cmFjZShtc2cpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihtc2cpO1xuICAgICAgfVxuICAgICAgd2FybmVkID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICByZXR1cm4gZGVwcmVjYXRlZDtcbn07XG5cblxudmFyIGRlYnVncyA9IHt9O1xudmFyIGRlYnVnRW52aXJvbjtcbmV4cG9ydHMuZGVidWdsb2cgPSBmdW5jdGlvbihzZXQpIHtcbiAgaWYgKGlzVW5kZWZpbmVkKGRlYnVnRW52aXJvbikpXG4gICAgZGVidWdFbnZpcm9uID0gcHJvY2Vzcy5lbnYuTk9ERV9ERUJVRyB8fCAnJztcbiAgc2V0ID0gc2V0LnRvVXBwZXJDYXNlKCk7XG4gIGlmICghZGVidWdzW3NldF0pIHtcbiAgICBpZiAobmV3IFJlZ0V4cCgnXFxcXGInICsgc2V0ICsgJ1xcXFxiJywgJ2knKS50ZXN0KGRlYnVnRW52aXJvbikpIHtcbiAgICAgIHZhciBwaWQgPSBwcm9jZXNzLnBpZDtcbiAgICAgIGRlYnVnc1tzZXRdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBtc2cgPSBleHBvcnRzLmZvcm1hdC5hcHBseShleHBvcnRzLCBhcmd1bWVudHMpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCclcyAlZDogJXMnLCBzZXQsIHBpZCwgbXNnKTtcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlYnVnc1tzZXRdID0gZnVuY3Rpb24oKSB7fTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGRlYnVnc1tzZXRdO1xufTtcblxuXG4vKipcbiAqIEVjaG9zIHRoZSB2YWx1ZSBvZiBhIHZhbHVlLiBUcnlzIHRvIHByaW50IHRoZSB2YWx1ZSBvdXRcbiAqIGluIHRoZSBiZXN0IHdheSBwb3NzaWJsZSBnaXZlbiB0aGUgZGlmZmVyZW50IHR5cGVzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogVGhlIG9iamVjdCB0byBwcmludCBvdXQuXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0cyBPcHRpb25hbCBvcHRpb25zIG9iamVjdCB0aGF0IGFsdGVycyB0aGUgb3V0cHV0LlxuICovXG4vKiBsZWdhY3k6IG9iaiwgc2hvd0hpZGRlbiwgZGVwdGgsIGNvbG9ycyovXG5mdW5jdGlvbiBpbnNwZWN0KG9iaiwgb3B0cykge1xuICAvLyBkZWZhdWx0IG9wdGlvbnNcbiAgdmFyIGN0eCA9IHtcbiAgICBzZWVuOiBbXSxcbiAgICBzdHlsaXplOiBzdHlsaXplTm9Db2xvclxuICB9O1xuICAvLyBsZWdhY3kuLi5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gMykgY3R4LmRlcHRoID0gYXJndW1lbnRzWzJdO1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSA0KSBjdHguY29sb3JzID0gYXJndW1lbnRzWzNdO1xuICBpZiAoaXNCb29sZWFuKG9wdHMpKSB7XG4gICAgLy8gbGVnYWN5Li4uXG4gICAgY3R4LnNob3dIaWRkZW4gPSBvcHRzO1xuICB9IGVsc2UgaWYgKG9wdHMpIHtcbiAgICAvLyBnb3QgYW4gXCJvcHRpb25zXCIgb2JqZWN0XG4gICAgZXhwb3J0cy5fZXh0ZW5kKGN0eCwgb3B0cyk7XG4gIH1cbiAgLy8gc2V0IGRlZmF1bHQgb3B0aW9uc1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LnNob3dIaWRkZW4pKSBjdHguc2hvd0hpZGRlbiA9IGZhbHNlO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmRlcHRoKSkgY3R4LmRlcHRoID0gMjtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5jb2xvcnMpKSBjdHguY29sb3JzID0gZmFsc2U7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguY3VzdG9tSW5zcGVjdCkpIGN0eC5jdXN0b21JbnNwZWN0ID0gdHJ1ZTtcbiAgaWYgKGN0eC5jb2xvcnMpIGN0eC5zdHlsaXplID0gc3R5bGl6ZVdpdGhDb2xvcjtcbiAgcmV0dXJuIGZvcm1hdFZhbHVlKGN0eCwgb2JqLCBjdHguZGVwdGgpO1xufVxuZXhwb3J0cy5pbnNwZWN0ID0gaW5zcGVjdDtcblxuXG4vLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0FOU0lfZXNjYXBlX2NvZGUjZ3JhcGhpY3Ncbmluc3BlY3QuY29sb3JzID0ge1xuICAnYm9sZCcgOiBbMSwgMjJdLFxuICAnaXRhbGljJyA6IFszLCAyM10sXG4gICd1bmRlcmxpbmUnIDogWzQsIDI0XSxcbiAgJ2ludmVyc2UnIDogWzcsIDI3XSxcbiAgJ3doaXRlJyA6IFszNywgMzldLFxuICAnZ3JleScgOiBbOTAsIDM5XSxcbiAgJ2JsYWNrJyA6IFszMCwgMzldLFxuICAnYmx1ZScgOiBbMzQsIDM5XSxcbiAgJ2N5YW4nIDogWzM2LCAzOV0sXG4gICdncmVlbicgOiBbMzIsIDM5XSxcbiAgJ21hZ2VudGEnIDogWzM1LCAzOV0sXG4gICdyZWQnIDogWzMxLCAzOV0sXG4gICd5ZWxsb3cnIDogWzMzLCAzOV1cbn07XG5cbi8vIERvbid0IHVzZSAnYmx1ZScgbm90IHZpc2libGUgb24gY21kLmV4ZVxuaW5zcGVjdC5zdHlsZXMgPSB7XG4gICdzcGVjaWFsJzogJ2N5YW4nLFxuICAnbnVtYmVyJzogJ3llbGxvdycsXG4gICdib29sZWFuJzogJ3llbGxvdycsXG4gICd1bmRlZmluZWQnOiAnZ3JleScsXG4gICdudWxsJzogJ2JvbGQnLFxuICAnc3RyaW5nJzogJ2dyZWVuJyxcbiAgJ2RhdGUnOiAnbWFnZW50YScsXG4gIC8vIFwibmFtZVwiOiBpbnRlbnRpb25hbGx5IG5vdCBzdHlsaW5nXG4gICdyZWdleHAnOiAncmVkJ1xufTtcblxuXG5mdW5jdGlvbiBzdHlsaXplV2l0aENvbG9yKHN0ciwgc3R5bGVUeXBlKSB7XG4gIHZhciBzdHlsZSA9IGluc3BlY3Quc3R5bGVzW3N0eWxlVHlwZV07XG5cbiAgaWYgKHN0eWxlKSB7XG4gICAgcmV0dXJuICdcXHUwMDFiWycgKyBpbnNwZWN0LmNvbG9yc1tzdHlsZV1bMF0gKyAnbScgKyBzdHIgK1xuICAgICAgICAgICAnXFx1MDAxYlsnICsgaW5zcGVjdC5jb2xvcnNbc3R5bGVdWzFdICsgJ20nO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBzdHI7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBzdHlsaXplTm9Db2xvcihzdHIsIHN0eWxlVHlwZSkge1xuICByZXR1cm4gc3RyO1xufVxuXG5cbmZ1bmN0aW9uIGFycmF5VG9IYXNoKGFycmF5KSB7XG4gIHZhciBoYXNoID0ge307XG5cbiAgYXJyYXkuZm9yRWFjaChmdW5jdGlvbih2YWwsIGlkeCkge1xuICAgIGhhc2hbdmFsXSA9IHRydWU7XG4gIH0pO1xuXG4gIHJldHVybiBoYXNoO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFZhbHVlKGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcykge1xuICAvLyBQcm92aWRlIGEgaG9vayBmb3IgdXNlci1zcGVjaWZpZWQgaW5zcGVjdCBmdW5jdGlvbnMuXG4gIC8vIENoZWNrIHRoYXQgdmFsdWUgaXMgYW4gb2JqZWN0IHdpdGggYW4gaW5zcGVjdCBmdW5jdGlvbiBvbiBpdFxuICBpZiAoY3R4LmN1c3RvbUluc3BlY3QgJiZcbiAgICAgIHZhbHVlICYmXG4gICAgICBpc0Z1bmN0aW9uKHZhbHVlLmluc3BlY3QpICYmXG4gICAgICAvLyBGaWx0ZXIgb3V0IHRoZSB1dGlsIG1vZHVsZSwgaXQncyBpbnNwZWN0IGZ1bmN0aW9uIGlzIHNwZWNpYWxcbiAgICAgIHZhbHVlLmluc3BlY3QgIT09IGV4cG9ydHMuaW5zcGVjdCAmJlxuICAgICAgLy8gQWxzbyBmaWx0ZXIgb3V0IGFueSBwcm90b3R5cGUgb2JqZWN0cyB1c2luZyB0aGUgY2lyY3VsYXIgY2hlY2suXG4gICAgICAhKHZhbHVlLmNvbnN0cnVjdG9yICYmIHZhbHVlLmNvbnN0cnVjdG9yLnByb3RvdHlwZSA9PT0gdmFsdWUpKSB7XG4gICAgdmFyIHJldCA9IHZhbHVlLmluc3BlY3QocmVjdXJzZVRpbWVzLCBjdHgpO1xuICAgIGlmICghaXNTdHJpbmcocmV0KSkge1xuICAgICAgcmV0ID0gZm9ybWF0VmFsdWUoY3R4LCByZXQsIHJlY3Vyc2VUaW1lcyk7XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICAvLyBQcmltaXRpdmUgdHlwZXMgY2Fubm90IGhhdmUgcHJvcGVydGllc1xuICB2YXIgcHJpbWl0aXZlID0gZm9ybWF0UHJpbWl0aXZlKGN0eCwgdmFsdWUpO1xuICBpZiAocHJpbWl0aXZlKSB7XG4gICAgcmV0dXJuIHByaW1pdGl2ZTtcbiAgfVxuXG4gIC8vIExvb2sgdXAgdGhlIGtleXMgb2YgdGhlIG9iamVjdC5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh2YWx1ZSk7XG4gIHZhciB2aXNpYmxlS2V5cyA9IGFycmF5VG9IYXNoKGtleXMpO1xuXG4gIGlmIChjdHguc2hvd0hpZGRlbikge1xuICAgIGtleXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh2YWx1ZSk7XG4gIH1cblxuICAvLyBJRSBkb2Vzbid0IG1ha2UgZXJyb3IgZmllbGRzIG5vbi1lbnVtZXJhYmxlXG4gIC8vIGh0dHA6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS9pZS9kd3c1MnNidCh2PXZzLjk0KS5hc3B4XG4gIGlmIChpc0Vycm9yKHZhbHVlKVxuICAgICAgJiYgKGtleXMuaW5kZXhPZignbWVzc2FnZScpID49IDAgfHwga2V5cy5pbmRleE9mKCdkZXNjcmlwdGlvbicpID49IDApKSB7XG4gICAgcmV0dXJuIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgfVxuXG4gIC8vIFNvbWUgdHlwZSBvZiBvYmplY3Qgd2l0aG91dCBwcm9wZXJ0aWVzIGNhbiBiZSBzaG9ydGN1dHRlZC5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgICB2YXIgbmFtZSA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKCdbRnVuY3Rpb24nICsgbmFtZSArICddJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdyZWdleHAnKTtcbiAgICB9XG4gICAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShEYXRlLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ2RhdGUnKTtcbiAgICB9XG4gICAgaWYgKGlzRXJyb3IodmFsdWUpKSB7XG4gICAgICByZXR1cm4gZm9ybWF0RXJyb3IodmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBiYXNlID0gJycsIGFycmF5ID0gZmFsc2UsIGJyYWNlcyA9IFsneycsICd9J107XG5cbiAgLy8gTWFrZSBBcnJheSBzYXkgdGhhdCB0aGV5IGFyZSBBcnJheVxuICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICBhcnJheSA9IHRydWU7XG4gICAgYnJhY2VzID0gWydbJywgJ10nXTtcbiAgfVxuXG4gIC8vIE1ha2UgZnVuY3Rpb25zIHNheSB0aGF0IHRoZXkgYXJlIGZ1bmN0aW9uc1xuICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICB2YXIgbiA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgIGJhc2UgPSAnIFtGdW5jdGlvbicgKyBuICsgJ10nO1xuICB9XG5cbiAgLy8gTWFrZSBSZWdFeHBzIHNheSB0aGF0IHRoZXkgYXJlIFJlZ0V4cHNcbiAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBkYXRlcyB3aXRoIHByb3BlcnRpZXMgZmlyc3Qgc2F5IHRoZSBkYXRlXG4gIGlmIChpc0RhdGUodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIERhdGUucHJvdG90eXBlLnRvVVRDU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBlcnJvciB3aXRoIG1lc3NhZ2UgZmlyc3Qgc2F5IHRoZSBlcnJvclxuICBpZiAoaXNFcnJvcih2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgZm9ybWF0RXJyb3IodmFsdWUpO1xuICB9XG5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwICYmICghYXJyYXkgfHwgdmFsdWUubGVuZ3RoID09IDApKSB7XG4gICAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyBicmFjZXNbMV07XG4gIH1cblxuICBpZiAocmVjdXJzZVRpbWVzIDwgMCkge1xuICAgIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAncmVnZXhwJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZSgnW09iamVjdF0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuXG4gIGN0eC5zZWVuLnB1c2godmFsdWUpO1xuXG4gIHZhciBvdXRwdXQ7XG4gIGlmIChhcnJheSkge1xuICAgIG91dHB1dCA9IGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpO1xuICB9IGVsc2Uge1xuICAgIG91dHB1dCA9IGtleXMubWFwKGZ1bmN0aW9uKGtleSkge1xuICAgICAgcmV0dXJuIGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleSwgYXJyYXkpO1xuICAgIH0pO1xuICB9XG5cbiAgY3R4LnNlZW4ucG9wKCk7XG5cbiAgcmV0dXJuIHJlZHVjZVRvU2luZ2xlU3RyaW5nKG91dHB1dCwgYmFzZSwgYnJhY2VzKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRQcmltaXRpdmUoY3R4LCB2YWx1ZSkge1xuICBpZiAoaXNVbmRlZmluZWQodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgndW5kZWZpbmVkJywgJ3VuZGVmaW5lZCcpO1xuICBpZiAoaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgdmFyIHNpbXBsZSA9ICdcXCcnICsgSlNPTi5zdHJpbmdpZnkodmFsdWUpLnJlcGxhY2UoL15cInxcIiQvZywgJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFwiL2csICdcIicpICsgJ1xcJyc7XG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKHNpbXBsZSwgJ3N0cmluZycpO1xuICB9XG4gIGlmIChpc051bWJlcih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdudW1iZXInKTtcbiAgaWYgKGlzQm9vbGVhbih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdib29sZWFuJyk7XG4gIC8vIEZvciBzb21lIHJlYXNvbiB0eXBlb2YgbnVsbCBpcyBcIm9iamVjdFwiLCBzbyBzcGVjaWFsIGNhc2UgaGVyZS5cbiAgaWYgKGlzTnVsbCh2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCdudWxsJywgJ251bGwnKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRFcnJvcih2YWx1ZSkge1xuICByZXR1cm4gJ1snICsgRXJyb3IucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpICsgJ10nO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpIHtcbiAgdmFyIG91dHB1dCA9IFtdO1xuICBmb3IgKHZhciBpID0gMCwgbCA9IHZhbHVlLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuICAgIGlmIChoYXNPd25Qcm9wZXJ0eSh2YWx1ZSwgU3RyaW5nKGkpKSkge1xuICAgICAgb3V0cHV0LnB1c2goZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cyxcbiAgICAgICAgICBTdHJpbmcoaSksIHRydWUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0cHV0LnB1c2goJycpO1xuICAgIH1cbiAgfVxuICBrZXlzLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYgKCFrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICBvdXRwdXQucHVzaChmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLFxuICAgICAgICAgIGtleSwgdHJ1ZSkpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBvdXRwdXQ7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5LCBhcnJheSkge1xuICB2YXIgbmFtZSwgc3RyLCBkZXNjO1xuICBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih2YWx1ZSwga2V5KSB8fCB7IHZhbHVlOiB2YWx1ZVtrZXldIH07XG4gIGlmIChkZXNjLmdldCkge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tHZXR0ZXIvU2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbR2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tTZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cbiAgaWYgKCFoYXNPd25Qcm9wZXJ0eSh2aXNpYmxlS2V5cywga2V5KSkge1xuICAgIG5hbWUgPSAnWycgKyBrZXkgKyAnXSc7XG4gIH1cbiAgaWYgKCFzdHIpIHtcbiAgICBpZiAoY3R4LnNlZW4uaW5kZXhPZihkZXNjLnZhbHVlKSA8IDApIHtcbiAgICAgIGlmIChpc051bGwocmVjdXJzZVRpbWVzKSkge1xuICAgICAgICBzdHIgPSBmb3JtYXRWYWx1ZShjdHgsIGRlc2MudmFsdWUsIG51bGwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RyID0gZm9ybWF0VmFsdWUoY3R4LCBkZXNjLnZhbHVlLCByZWN1cnNlVGltZXMgLSAxKTtcbiAgICAgIH1cbiAgICAgIGlmIChzdHIuaW5kZXhPZignXFxuJykgPiAtMSkge1xuICAgICAgICBpZiAoYXJyYXkpIHtcbiAgICAgICAgICBzdHIgPSBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyAgJyArIGxpbmU7XG4gICAgICAgICAgfSkuam9pbignXFxuJykuc3Vic3RyKDIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0ciA9ICdcXG4nICsgc3RyLnNwbGl0KCdcXG4nKS5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgcmV0dXJuICcgICAnICsgbGluZTtcbiAgICAgICAgICB9KS5qb2luKCdcXG4nKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0NpcmN1bGFyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG4gIGlmIChpc1VuZGVmaW5lZChuYW1lKSkge1xuICAgIGlmIChhcnJheSAmJiBrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICByZXR1cm4gc3RyO1xuICAgIH1cbiAgICBuYW1lID0gSlNPTi5zdHJpbmdpZnkoJycgKyBrZXkpO1xuICAgIGlmIChuYW1lLm1hdGNoKC9eXCIoW2EtekEtWl9dW2EtekEtWl8wLTldKilcIiQvKSkge1xuICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyKDEsIG5hbWUubGVuZ3RoIC0gMik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ25hbWUnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmFtZSA9IG5hbWUucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJylcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLyheXCJ8XCIkKS9nLCBcIidcIik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ3N0cmluZycpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuYW1lICsgJzogJyArIHN0cjtcbn1cblxuXG5mdW5jdGlvbiByZWR1Y2VUb1NpbmdsZVN0cmluZyhvdXRwdXQsIGJhc2UsIGJyYWNlcykge1xuICB2YXIgbnVtTGluZXNFc3QgPSAwO1xuICB2YXIgbGVuZ3RoID0gb3V0cHV0LnJlZHVjZShmdW5jdGlvbihwcmV2LCBjdXIpIHtcbiAgICBudW1MaW5lc0VzdCsrO1xuICAgIGlmIChjdXIuaW5kZXhPZignXFxuJykgPj0gMCkgbnVtTGluZXNFc3QrKztcbiAgICByZXR1cm4gcHJldiArIGN1ci5yZXBsYWNlKC9cXHUwMDFiXFxbXFxkXFxkP20vZywgJycpLmxlbmd0aCArIDE7XG4gIH0sIDApO1xuXG4gIGlmIChsZW5ndGggPiA2MCkge1xuICAgIHJldHVybiBicmFjZXNbMF0gK1xuICAgICAgICAgICAoYmFzZSA9PT0gJycgPyAnJyA6IGJhc2UgKyAnXFxuICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgb3V0cHV0LmpvaW4oJyxcXG4gICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgYnJhY2VzWzFdO1xuICB9XG5cbiAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyAnICcgKyBvdXRwdXQuam9pbignLCAnKSArICcgJyArIGJyYWNlc1sxXTtcbn1cblxuXG4vLyBOT1RFOiBUaGVzZSB0eXBlIGNoZWNraW5nIGZ1bmN0aW9ucyBpbnRlbnRpb25hbGx5IGRvbid0IHVzZSBgaW5zdGFuY2VvZmBcbi8vIGJlY2F1c2UgaXQgaXMgZnJhZ2lsZSBhbmQgY2FuIGJlIGVhc2lseSBmYWtlZCB3aXRoIGBPYmplY3QuY3JlYXRlKClgLlxuZnVuY3Rpb24gaXNBcnJheShhcikge1xuICByZXR1cm4gQXJyYXkuaXNBcnJheShhcik7XG59XG5leHBvcnRzLmlzQXJyYXkgPSBpc0FycmF5O1xuXG5mdW5jdGlvbiBpc0Jvb2xlYW4oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnYm9vbGVhbic7XG59XG5leHBvcnRzLmlzQm9vbGVhbiA9IGlzQm9vbGVhbjtcblxuZnVuY3Rpb24gaXNOdWxsKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsO1xufVxuZXhwb3J0cy5pc051bGwgPSBpc051bGw7XG5cbmZ1bmN0aW9uIGlzTnVsbE9yVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09IG51bGw7XG59XG5leHBvcnRzLmlzTnVsbE9yVW5kZWZpbmVkID0gaXNOdWxsT3JVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5leHBvcnRzLmlzTnVtYmVyID0gaXNOdW1iZXI7XG5cbmZ1bmN0aW9uIGlzU3RyaW5nKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N0cmluZyc7XG59XG5leHBvcnRzLmlzU3RyaW5nID0gaXNTdHJpbmc7XG5cbmZ1bmN0aW9uIGlzU3ltYm9sKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCc7XG59XG5leHBvcnRzLmlzU3ltYm9sID0gaXNTeW1ib2w7XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG5leHBvcnRzLmlzVW5kZWZpbmVkID0gaXNVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzUmVnRXhwKHJlKSB7XG4gIHJldHVybiBpc09iamVjdChyZSkgJiYgb2JqZWN0VG9TdHJpbmcocmUpID09PSAnW29iamVjdCBSZWdFeHBdJztcbn1cbmV4cG9ydHMuaXNSZWdFeHAgPSBpc1JlZ0V4cDtcblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5leHBvcnRzLmlzT2JqZWN0ID0gaXNPYmplY3Q7XG5cbmZ1bmN0aW9uIGlzRGF0ZShkKSB7XG4gIHJldHVybiBpc09iamVjdChkKSAmJiBvYmplY3RUb1N0cmluZyhkKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuZXhwb3J0cy5pc0RhdGUgPSBpc0RhdGU7XG5cbmZ1bmN0aW9uIGlzRXJyb3IoZSkge1xuICByZXR1cm4gaXNPYmplY3QoZSkgJiZcbiAgICAgIChvYmplY3RUb1N0cmluZyhlKSA9PT0gJ1tvYmplY3QgRXJyb3JdJyB8fCBlIGluc3RhbmNlb2YgRXJyb3IpO1xufVxuZXhwb3J0cy5pc0Vycm9yID0gaXNFcnJvcjtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5leHBvcnRzLmlzRnVuY3Rpb24gPSBpc0Z1bmN0aW9uO1xuXG5mdW5jdGlvbiBpc1ByaW1pdGl2ZShhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gbnVsbCB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ2Jvb2xlYW4nIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnbnVtYmVyJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N0cmluZycgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdzeW1ib2wnIHx8ICAvLyBFUzYgc3ltYm9sXG4gICAgICAgICB0eXBlb2YgYXJnID09PSAndW5kZWZpbmVkJztcbn1cbmV4cG9ydHMuaXNQcmltaXRpdmUgPSBpc1ByaW1pdGl2ZTtcblxuZXhwb3J0cy5pc0J1ZmZlciA9IHJlcXVpcmUoJy4vc3VwcG9ydC9pc0J1ZmZlcicpO1xuXG5mdW5jdGlvbiBvYmplY3RUb1N0cmluZyhvKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobyk7XG59XG5cblxuZnVuY3Rpb24gcGFkKG4pIHtcbiAgcmV0dXJuIG4gPCAxMCA/ICcwJyArIG4udG9TdHJpbmcoMTApIDogbi50b1N0cmluZygxMCk7XG59XG5cblxudmFyIG1vbnRocyA9IFsnSmFuJywgJ0ZlYicsICdNYXInLCAnQXByJywgJ01heScsICdKdW4nLCAnSnVsJywgJ0F1ZycsICdTZXAnLFxuICAgICAgICAgICAgICAnT2N0JywgJ05vdicsICdEZWMnXTtcblxuLy8gMjYgRmViIDE2OjE5OjM0XG5mdW5jdGlvbiB0aW1lc3RhbXAoKSB7XG4gIHZhciBkID0gbmV3IERhdGUoKTtcbiAgdmFyIHRpbWUgPSBbcGFkKGQuZ2V0SG91cnMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldE1pbnV0ZXMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldFNlY29uZHMoKSldLmpvaW4oJzonKTtcbiAgcmV0dXJuIFtkLmdldERhdGUoKSwgbW9udGhzW2QuZ2V0TW9udGgoKV0sIHRpbWVdLmpvaW4oJyAnKTtcbn1cblxuXG4vLyBsb2cgaXMganVzdCBhIHRoaW4gd3JhcHBlciB0byBjb25zb2xlLmxvZyB0aGF0IHByZXBlbmRzIGEgdGltZXN0YW1wXG5leHBvcnRzLmxvZyA9IGZ1bmN0aW9uKCkge1xuICBjb25zb2xlLmxvZygnJXMgLSAlcycsIHRpbWVzdGFtcCgpLCBleHBvcnRzLmZvcm1hdC5hcHBseShleHBvcnRzLCBhcmd1bWVudHMpKTtcbn07XG5cblxuLyoqXG4gKiBJbmhlcml0IHRoZSBwcm90b3R5cGUgbWV0aG9kcyBmcm9tIG9uZSBjb25zdHJ1Y3RvciBpbnRvIGFub3RoZXIuXG4gKlxuICogVGhlIEZ1bmN0aW9uLnByb3RvdHlwZS5pbmhlcml0cyBmcm9tIGxhbmcuanMgcmV3cml0dGVuIGFzIGEgc3RhbmRhbG9uZVxuICogZnVuY3Rpb24gKG5vdCBvbiBGdW5jdGlvbi5wcm90b3R5cGUpLiBOT1RFOiBJZiB0aGlzIGZpbGUgaXMgdG8gYmUgbG9hZGVkXG4gKiBkdXJpbmcgYm9vdHN0cmFwcGluZyB0aGlzIGZ1bmN0aW9uIG5lZWRzIHRvIGJlIHJld3JpdHRlbiB1c2luZyBzb21lIG5hdGl2ZVxuICogZnVuY3Rpb25zIGFzIHByb3RvdHlwZSBzZXR1cCB1c2luZyBub3JtYWwgSmF2YVNjcmlwdCBkb2VzIG5vdCB3b3JrIGFzXG4gKiBleHBlY3RlZCBkdXJpbmcgYm9vdHN0cmFwcGluZyAoc2VlIG1pcnJvci5qcyBpbiByMTE0OTAzKS5cbiAqXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjdG9yIENvbnN0cnVjdG9yIGZ1bmN0aW9uIHdoaWNoIG5lZWRzIHRvIGluaGVyaXQgdGhlXG4gKiAgICAgcHJvdG90eXBlLlxuICogQHBhcmFtIHtmdW5jdGlvbn0gc3VwZXJDdG9yIENvbnN0cnVjdG9yIGZ1bmN0aW9uIHRvIGluaGVyaXQgcHJvdG90eXBlIGZyb20uXG4gKi9cbmV4cG9ydHMuaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpO1xuXG5leHBvcnRzLl9leHRlbmQgPSBmdW5jdGlvbihvcmlnaW4sIGFkZCkge1xuICAvLyBEb24ndCBkbyBhbnl0aGluZyBpZiBhZGQgaXNuJ3QgYW4gb2JqZWN0XG4gIGlmICghYWRkIHx8ICFpc09iamVjdChhZGQpKSByZXR1cm4gb3JpZ2luO1xuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMoYWRkKTtcbiAgdmFyIGkgPSBrZXlzLmxlbmd0aDtcbiAgd2hpbGUgKGktLSkge1xuICAgIG9yaWdpbltrZXlzW2ldXSA9IGFkZFtrZXlzW2ldXTtcbiAgfVxuICByZXR1cm4gb3JpZ2luO1xufTtcblxuZnVuY3Rpb24gaGFzT3duUHJvcGVydHkob2JqLCBwcm9wKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKTtcbn1cbiIsIi8qKlxuICogVGhpcyBtb2R1bGUgZXhwb3J0cyBmdW5jdGlvbnMgZm9yIGNoZWNraW5nIHR5cGVzXG4gKiBhbmQgdGhyb3dpbmcgZXhjZXB0aW9ucy5cbiAqL1xuXG4vKmdsb2JhbHMgZGVmaW5lLCBtb2R1bGUgKi9cblxuKGZ1bmN0aW9uIChnbG9iYWxzKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIG1lc3NhZ2VzLCBwcmVkaWNhdGVzLCBmdW5jdGlvbnMsIGFzc2VydCwgbm90LCBtYXliZSwgZWl0aGVyO1xuXG4gICAgbWVzc2FnZXMgPSB7XG4gICAgICAgIGxpa2U6ICdJbnZhbGlkIHR5cGUnLFxuICAgICAgICBpbnN0YW5jZTogJ0ludmFsaWQgdHlwZScsXG4gICAgICAgIGVtcHR5T2JqZWN0OiAnSW52YWxpZCBvYmplY3QnLFxuICAgICAgICBvYmplY3Q6ICdJbnZhbGlkIG9iamVjdCcsXG4gICAgICAgIGFzc2lnbmVkOiAnSW52YWxpZCB2YWx1ZScsXG4gICAgICAgIHVuZGVmaW5lZDogJ0ludmFsaWQgdmFsdWUnLFxuICAgICAgICBudWxsOiAnSW52YWxpZCB2YWx1ZScsXG4gICAgICAgIGhhc0xlbmd0aDogJ0ludmFsaWQgbGVuZ3RoJyxcbiAgICAgICAgZW1wdHlBcnJheTogJ0ludmFsaWQgYXJyYXknLFxuICAgICAgICBhcnJheTogJ0ludmFsaWQgYXJyYXknLFxuICAgICAgICBkYXRlOiAnSW52YWxpZCBkYXRlJyxcbiAgICAgICAgZXJyb3I6ICdJbnZhbGlkIGVycm9yJyxcbiAgICAgICAgZm46ICdJbnZhbGlkIGZ1bmN0aW9uJyxcbiAgICAgICAgbWF0Y2g6ICdJbnZhbGlkIHN0cmluZycsXG4gICAgICAgIGNvbnRhaW5zOiAnSW52YWxpZCBzdHJpbmcnLFxuICAgICAgICB1bmVtcHR5U3RyaW5nOiAnSW52YWxpZCBzdHJpbmcnLFxuICAgICAgICBzdHJpbmc6ICdJbnZhbGlkIHN0cmluZycsXG4gICAgICAgIG9kZDogJ0ludmFsaWQgbnVtYmVyJyxcbiAgICAgICAgZXZlbjogJ0ludmFsaWQgbnVtYmVyJyxcbiAgICAgICAgYmV0d2VlbjogJ0ludmFsaWQgbnVtYmVyJyxcbiAgICAgICAgZ3JlYXRlcjogJ0ludmFsaWQgbnVtYmVyJyxcbiAgICAgICAgbGVzczogJ0ludmFsaWQgbnVtYmVyJyxcbiAgICAgICAgcG9zaXRpdmU6ICdJbnZhbGlkIG51bWJlcicsXG4gICAgICAgIG5lZ2F0aXZlOiAnSW52YWxpZCBudW1iZXInLFxuICAgICAgICBpbnRlZ2VyOiAnSW52YWxpZCBudW1iZXInLFxuICAgICAgICB6ZXJvOiAnSW52YWxpZCBudW1iZXInLFxuICAgICAgICBudW1iZXI6ICdJbnZhbGlkIG51bWJlcicsXG4gICAgICAgIGJvb2xlYW46ICdJbnZhbGlkIGJvb2xlYW4nXG4gICAgfTtcblxuICAgIHByZWRpY2F0ZXMgPSB7XG4gICAgICAgIGxpa2U6IGxpa2UsXG4gICAgICAgIGluc3RhbmNlOiBpbnN0YW5jZSxcbiAgICAgICAgZW1wdHlPYmplY3Q6IGVtcHR5T2JqZWN0LFxuICAgICAgICBvYmplY3Q6IG9iamVjdCxcbiAgICAgICAgYXNzaWduZWQ6IGFzc2lnbmVkLFxuICAgICAgICB1bmRlZmluZWQ6IGlzVW5kZWZpbmVkLFxuICAgICAgICBudWxsOiBpc051bGwsXG4gICAgICAgIGhhc0xlbmd0aDogaGFzTGVuZ3RoLFxuICAgICAgICBlbXB0eUFycmF5OiBlbXB0eUFycmF5LFxuICAgICAgICBhcnJheTogYXJyYXksXG4gICAgICAgIGRhdGU6IGRhdGUsXG4gICAgICAgIGVycm9yOiBlcnJvcixcbiAgICAgICAgZnVuY3Rpb246IGlzRnVuY3Rpb24sXG4gICAgICAgIG1hdGNoOiBtYXRjaCxcbiAgICAgICAgY29udGFpbnM6IGNvbnRhaW5zLFxuICAgICAgICB1bmVtcHR5U3RyaW5nOiB1bmVtcHR5U3RyaW5nLFxuICAgICAgICBzdHJpbmc6IHN0cmluZyxcbiAgICAgICAgb2RkOiBvZGQsXG4gICAgICAgIGV2ZW46IGV2ZW4sXG4gICAgICAgIGJldHdlZW46IGJldHdlZW4sXG4gICAgICAgIGdyZWF0ZXI6IGdyZWF0ZXIsXG4gICAgICAgIGxlc3M6IGxlc3MsXG4gICAgICAgIHBvc2l0aXZlOiBwb3NpdGl2ZSxcbiAgICAgICAgbmVnYXRpdmU6IG5lZ2F0aXZlLFxuICAgICAgICBpbnRlZ2VyIDogaW50ZWdlcixcbiAgICAgICAgemVybzogemVybyxcbiAgICAgICAgbnVtYmVyOiBudW1iZXIsXG4gICAgICAgIGJvb2xlYW46IGJvb2xlYW5cbiAgICB9O1xuXG4gICAgZnVuY3Rpb25zID0ge1xuICAgICAgICBhcHBseTogYXBwbHksXG4gICAgICAgIG1hcDogbWFwLFxuICAgICAgICBhbGw6IGFsbCxcbiAgICAgICAgYW55OiBhbnlcbiAgICB9O1xuXG4gICAgZnVuY3Rpb25zID0gbWl4aW4oZnVuY3Rpb25zLCBwcmVkaWNhdGVzKTtcbiAgICBhc3NlcnQgPSBjcmVhdGVNb2RpZmllZFByZWRpY2F0ZXMoYXNzZXJ0TW9kaWZpZXIsIGFzc2VydEltcGwpO1xuICAgIG5vdCA9IGNyZWF0ZU1vZGlmaWVkUHJlZGljYXRlcyhub3RNb2RpZmllciwgbm90SW1wbCk7XG4gICAgbWF5YmUgPSBjcmVhdGVNb2RpZmllZFByZWRpY2F0ZXMobWF5YmVNb2RpZmllciwgbWF5YmVJbXBsKTtcbiAgICBlaXRoZXIgPSBjcmVhdGVNb2RpZmllZFByZWRpY2F0ZXMoZWl0aGVyTW9kaWZpZXIpO1xuICAgIGFzc2VydC5ub3QgPSBjcmVhdGVNb2RpZmllZEZ1bmN0aW9ucyhhc3NlcnRNb2RpZmllciwgbm90KTtcbiAgICBhc3NlcnQubWF5YmUgPSBjcmVhdGVNb2RpZmllZEZ1bmN0aW9ucyhhc3NlcnRNb2RpZmllciwgbWF5YmUpO1xuICAgIGFzc2VydC5laXRoZXIgPSBjcmVhdGVNb2RpZmllZEZ1bmN0aW9ucyhhc3NlcnRFaXRoZXJNb2RpZmllciwgcHJlZGljYXRlcyk7XG5cbiAgICBleHBvcnRGdW5jdGlvbnMobWl4aW4oZnVuY3Rpb25zLCB7XG4gICAgICAgIGFzc2VydDogYXNzZXJ0LFxuICAgICAgICBub3Q6IG5vdCxcbiAgICAgICAgbWF5YmU6IG1heWJlLFxuICAgICAgICBlaXRoZXI6IGVpdGhlclxuICAgIH0pKTtcblxuICAgIC8qKlxuICAgICAqIFB1YmxpYyBmdW5jdGlvbiBgbGlrZWAuXG4gICAgICpcbiAgICAgKiBUZXN0cyB3aGV0aGVyIGFuIG9iamVjdCAncXVhY2tzIGxpa2UgYSBkdWNrJy5cbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgZmlyc3QgYXJndW1lbnQgaGFzIGFsbCBvZlxuICAgICAqIHRoZSBwcm9wZXJ0aWVzIG9mIHRoZSBzZWNvbmQsIGFyY2hldHlwYWwgYXJndW1lbnRcbiAgICAgKiAodGhlICdkdWNrJykuIFJldHVybnMgYGZhbHNlYCBvdGhlcndpc2UuXG4gICAgICpcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBsaWtlIChkYXRhLCBkdWNrKSB7XG4gICAgICAgIHZhciBuYW1lO1xuXG4gICAgICAgIGZvciAobmFtZSBpbiBkdWNrKSB7XG4gICAgICAgICAgICBpZiAoZHVjay5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICAgICAgICAgIGlmIChkYXRhLmhhc093blByb3BlcnR5KG5hbWUpID09PSBmYWxzZSB8fCB0eXBlb2YgZGF0YVtuYW1lXSAhPT0gdHlwZW9mIGR1Y2tbbmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChvYmplY3QoZGF0YVtuYW1lXSkgJiYgbGlrZShkYXRhW25hbWVdLCBkdWNrW25hbWVdKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFB1YmxpYyBmdW5jdGlvbiBgaW5zdGFuY2VgLlxuICAgICAqXG4gICAgICogUmV0dXJucyBgdHJ1ZWAgaWYgYW4gb2JqZWN0IGlzIGFuIGluc3RhbmNlIG9mIGEgcHJvdG90eXBlLFxuICAgICAqIGBmYWxzZWAgb3RoZXJ3aXNlLlxuICAgICAqXG4gICAgICovXG4gICAgZnVuY3Rpb24gaW5zdGFuY2UgKGRhdGEsIHByb3RvdHlwZSkge1xuICAgICAgICBpZiAoZGF0YSAmJiBpc0Z1bmN0aW9uKHByb3RvdHlwZSkgJiYgZGF0YSBpbnN0YW5jZW9mIHByb3RvdHlwZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHVibGljIGZ1bmN0aW9uIGBlbXB0eU9iamVjdGAuXG4gICAgICpcbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBpZiBzb21ldGhpbmcgaXMgYW4gZW1wdHkgb2JqZWN0LFxuICAgICAqIGBmYWxzZWAgb3RoZXJ3aXNlLlxuICAgICAqXG4gICAgICovXG4gICAgZnVuY3Rpb24gZW1wdHlPYmplY3QgKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIG9iamVjdChkYXRhKSAmJiBPYmplY3Qua2V5cyhkYXRhKS5sZW5ndGggPT09IDA7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHVibGljIGZ1bmN0aW9uIGBvYmplY3RgLlxuICAgICAqXG4gICAgICogUmV0dXJucyBgdHJ1ZWAgaWYgc29tZXRoaW5nIGlzIGEgcGxhaW4tb2xkIEpTIG9iamVjdCxcbiAgICAgKiBgZmFsc2VgIG90aGVyd2lzZS5cbiAgICAgKlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIG9iamVjdCAoZGF0YSkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGRhdGEpID09PSAnW29iamVjdCBPYmplY3RdJztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQdWJsaWMgZnVuY3Rpb24gYGFzc2lnbmVkYC5cbiAgICAgKlxuICAgICAqIFJldHVybnMgYHRydWVgIGlmIHNvbWV0aGluZyBpcyBub3QgbnVsbCBvciB1bmRlZmluZWQsXG4gICAgICogYGZhbHNlYCBvdGhlcndpc2UuXG4gICAgICpcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBhc3NpZ25lZCAoZGF0YSkge1xuICAgICAgICByZXR1cm4gIWlzVW5kZWZpbmVkKGRhdGEpICYmICFpc051bGwoZGF0YSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHVibGljIGZ1bmN0aW9uIGB1bmRlZmluZWRgLlxuICAgICAqXG4gICAgICogUmV0dXJucyBgdHJ1ZWAgaWYgc29tZXRoaW5nIGlzIHVuZGVmaW5lZCxcbiAgICAgKiBgZmFsc2VgIG90aGVyd2lzZS5cbiAgICAgKlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGlzVW5kZWZpbmVkIChkYXRhKSB7XG4gICAgICAgIHJldHVybiBkYXRhID09PSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHVibGljIGZ1bmN0aW9uIGBudWxsYC5cbiAgICAgKlxuICAgICAqIFJldHVybnMgYHRydWVgIGlmIHNvbWV0aGluZyBpcyBudWxsLFxuICAgICAqIGBmYWxzZWAgb3RoZXJ3aXNlLlxuICAgICAqXG4gICAgICovXG4gICAgZnVuY3Rpb24gaXNOdWxsIChkYXRhKSB7XG4gICAgICAgIHJldHVybiBkYXRhID09PSBudWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFB1YmxpYyBmdW5jdGlvbiBgaGFzTGVuZ3RoYC5cbiAgICAgKlxuICAgICAqIFJldHVybnMgYHRydWVgIGlmIHNvbWV0aGluZyBpcyBoYXMgYSBsZW5ndGggcHJvcGVydHlcbiAgICAgKiB0aGF0IGVxdWFscyBgdmFsdWVgLCBgZmFsc2VgIG90aGVyd2lzZS5cbiAgICAgKlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGhhc0xlbmd0aCAoZGF0YSwgdmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIGFzc2lnbmVkKGRhdGEpICYmIGRhdGEubGVuZ3RoID09PSB2YWx1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQdWJsaWMgZnVuY3Rpb24gYGVtcHR5QXJyYXlgLlxuICAgICAqXG4gICAgICogUmV0dXJucyBgdHJ1ZWAgaWYgc29tZXRoaW5nIGlzIGFuIGVtcHR5IGFycmF5LFxuICAgICAqIGBmYWxzZWAgb3RoZXJ3aXNlLlxuICAgICAqXG4gICAgICovXG4gICAgZnVuY3Rpb24gZW1wdHlBcnJheSAoZGF0YSkge1xuICAgICAgICByZXR1cm4gYXJyYXkoZGF0YSkgJiYgZGF0YS5sZW5ndGggPT09IDA7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHVibGljIGZ1bmN0aW9uIGBhcnJheWAuXG4gICAgICpcbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBzb21ldGhpbmcgaXMgYW4gYXJyYXksXG4gICAgICogYGZhbHNlYCBvdGhlcndpc2UuXG4gICAgICpcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBhcnJheSAoZGF0YSkge1xuICAgICAgICByZXR1cm4gQXJyYXkuaXNBcnJheShkYXRhKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQdWJsaWMgZnVuY3Rpb24gYGRhdGVgLlxuICAgICAqXG4gICAgICogUmV0dXJucyBgdHJ1ZWAgc29tZXRoaW5nIGlzIGEgdmFsaWQgZGF0ZSxcbiAgICAgKiBgZmFsc2VgIG90aGVyd2lzZS5cbiAgICAgKlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGRhdGUgKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChkYXRhKSA9PT0gJ1tvYmplY3QgRGF0ZV0nICYmXG4gICAgICAgICAgICAhaXNOYU4oZGF0YS5nZXRUaW1lKCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFB1YmxpYyBmdW5jdGlvbiBgZXJyb3JgLlxuICAgICAqXG4gICAgICogUmV0dXJucyBgdHJ1ZWAgaWYgc29tZXRoaW5nIGlzIGEgcGxhaW4tb2xkIEpTIG9iamVjdCxcbiAgICAgKiBgZmFsc2VgIG90aGVyd2lzZS5cbiAgICAgKlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGVycm9yIChkYXRhKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoZGF0YSkgPT09ICdbb2JqZWN0IEVycm9yXSc7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHVibGljIGZ1bmN0aW9uIGBmdW5jdGlvbmAuXG4gICAgICpcbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBpZiBzb21ldGhpbmcgaXMgZnVuY3Rpb24sXG4gICAgICogYGZhbHNlYCBvdGhlcndpc2UuXG4gICAgICpcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBpc0Z1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIHJldHVybiB0eXBlb2YgZGF0YSA9PT0gJ2Z1bmN0aW9uJztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQdWJsaWMgZnVuY3Rpb24gYG1hdGNoYC5cbiAgICAgKlxuICAgICAqIFJldHVybnMgYHRydWVgIGlmIHNvbWV0aGluZyBpcyBhIHN0cmluZ1xuICAgICAqIHRoYXQgbWF0Y2hlcyBgcmVnZXhgLCBgZmFsc2VgIG90aGVyd2lzZS5cbiAgICAgKlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIG1hdGNoIChkYXRhLCByZWdleCkge1xuICAgICAgICByZXR1cm4gc3RyaW5nKGRhdGEpICYmICEhZGF0YS5tYXRjaChyZWdleCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHVibGljIGZ1bmN0aW9uIGBjb250YWluc2AuXG4gICAgICpcbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBpZiBzb21ldGhpbmcgaXMgYSBzdHJpbmdcbiAgICAgKiB0aGF0IGNvbnRhaW5zIGBzdWJzdHJpbmdgLCBgZmFsc2VgIG90aGVyd2lzZS5cbiAgICAgKlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGNvbnRhaW5zIChkYXRhLCBzdWJzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIHN0cmluZyhkYXRhKSAmJiBkYXRhLmluZGV4T2Yoc3Vic3RyaW5nKSAhPT0gLTE7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHVibGljIGZ1bmN0aW9uIGB1bmVtcHR5U3RyaW5nYC5cbiAgICAgKlxuICAgICAqIFJldHVybnMgYHRydWVgIGlmIHNvbWV0aGluZyBpcyBhIG5vbi1lbXB0eSBzdHJpbmcsXG4gICAgICogYGZhbHNlYCBvdGhlcndpc2UuXG4gICAgICpcbiAgICAgKi9cbiAgICBmdW5jdGlvbiB1bmVtcHR5U3RyaW5nIChkYXRhKSB7XG4gICAgICAgIHJldHVybiBzdHJpbmcoZGF0YSkgJiYgZGF0YSAhPT0gJyc7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHVibGljIGZ1bmN0aW9uIGBzdHJpbmdgLlxuICAgICAqXG4gICAgICogUmV0dXJucyBgdHJ1ZWAgaWYgc29tZXRoaW5nIGlzIGEgc3RyaW5nLCBgZmFsc2VgIG90aGVyd2lzZS5cbiAgICAgKlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHN0cmluZyAoZGF0YSkge1xuICAgICAgICByZXR1cm4gdHlwZW9mIGRhdGEgPT09ICdzdHJpbmcnO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFB1YmxpYyBmdW5jdGlvbiBgb2RkYC5cbiAgICAgKlxuICAgICAqIFJldHVybnMgYHRydWVgIGlmIHNvbWV0aGluZyBpcyBhbiBvZGQgbnVtYmVyLFxuICAgICAqIGBmYWxzZWAgb3RoZXJ3aXNlLlxuICAgICAqXG4gICAgICovXG4gICAgZnVuY3Rpb24gb2RkIChkYXRhKSB7XG4gICAgICAgIHJldHVybiBpbnRlZ2VyKGRhdGEpICYmICFldmVuKGRhdGEpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFB1YmxpYyBmdW5jdGlvbiBgZXZlbmAuXG4gICAgICpcbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBpZiBzb21ldGhpbmcgaXMgYW4gZXZlbiBudW1iZXIsXG4gICAgICogYGZhbHNlYCBvdGhlcndpc2UuXG4gICAgICpcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBldmVuIChkYXRhKSB7XG4gICAgICAgIHJldHVybiBudW1iZXIoZGF0YSkgJiYgZGF0YSAlIDIgPT09IDA7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHVibGljIGZ1bmN0aW9uIGBpbnRlZ2VyYC5cbiAgICAgKlxuICAgICAqIFJldHVybnMgYHRydWVgIGlmIHNvbWV0aGluZyBpcyBhbiBpbnRlZ2VyLFxuICAgICAqIGBmYWxzZWAgb3RoZXJ3aXNlLlxuICAgICAqXG4gICAgICovXG4gICAgZnVuY3Rpb24gaW50ZWdlciAoZGF0YSkge1xuICAgICAgICByZXR1cm4gbnVtYmVyKGRhdGEpICYmIGRhdGEgJSAxID09PSAwO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFB1YmxpYyBmdW5jdGlvbiBgYmV0d2VlbmAuXG4gICAgICpcbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBpZiBzb21ldGhpbmcgaXMgYSBudW1iZXJcbiAgICAgKiBiZXR3ZWVuIGBhYCBhbmQgYGJgLCBgZmFsc2VgIG90aGVyd2lzZS5cbiAgICAgKlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGJldHdlZW4gKGRhdGEsIGEsIGIpIHtcbiAgICAgICAgaWYgKGEgPCBiKSB7XG4gICAgICAgICAgICByZXR1cm4gZ3JlYXRlcihkYXRhLCBhKSAmJiBsZXNzKGRhdGEsIGIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGxlc3MoZGF0YSwgYSkgJiYgZ3JlYXRlcihkYXRhLCBiKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQdWJsaWMgZnVuY3Rpb24gYGdyZWF0ZXJgLlxuICAgICAqXG4gICAgICogUmV0dXJucyBgdHJ1ZWAgaWYgc29tZXRoaW5nIGlzIGEgbnVtYmVyXG4gICAgICogZ3JlYXRlciB0aGFuIGB2YWx1ZWAsIGBmYWxzZWAgb3RoZXJ3aXNlLlxuICAgICAqXG4gICAgICovXG4gICAgZnVuY3Rpb24gZ3JlYXRlciAoZGF0YSwgdmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIG51bWJlcihkYXRhKSAmJiBkYXRhID4gdmFsdWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHVibGljIGZ1bmN0aW9uIGBsZXNzYC5cbiAgICAgKlxuICAgICAqIFJldHVybnMgYHRydWVgIGlmIHNvbWV0aGluZyBpcyBhIG51bWJlclxuICAgICAqIGxlc3MgdGhhbiBgdmFsdWVgLCBgZmFsc2VgIG90aGVyd2lzZS5cbiAgICAgKlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGxlc3MgKGRhdGEsIHZhbHVlKSB7XG4gICAgICAgIHJldHVybiBudW1iZXIoZGF0YSkgJiYgZGF0YSA8IHZhbHVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFB1YmxpYyBmdW5jdGlvbiBgcG9zaXRpdmVgLlxuICAgICAqXG4gICAgICogUmV0dXJucyBgdHJ1ZWAgaWYgc29tZXRoaW5nIGlzIGEgcG9zaXRpdmUgbnVtYmVyLFxuICAgICAqIGBmYWxzZWAgb3RoZXJ3aXNlLlxuICAgICAqXG4gICAgICovXG4gICAgZnVuY3Rpb24gcG9zaXRpdmUgKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIGdyZWF0ZXIoZGF0YSwgMCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHVibGljIGZ1bmN0aW9uIGBuZWdhdGl2ZWAuXG4gICAgICpcbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBpZiBzb21ldGhpbmcgaXMgYSBuZWdhdGl2ZSBudW1iZXIsXG4gICAgICogYGZhbHNlYCBvdGhlcndpc2UuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZGF0YSAgICAgICAgICBUaGUgdGhpbmcgdG8gdGVzdC5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBuZWdhdGl2ZSAoZGF0YSkge1xuICAgICAgICByZXR1cm4gbGVzcyhkYXRhLCAwKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQdWJsaWMgZnVuY3Rpb24gYG51bWJlcmAuXG4gICAgICpcbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBpZiBkYXRhIGlzIGEgbnVtYmVyLFxuICAgICAqIGBmYWxzZWAgb3RoZXJ3aXNlLlxuICAgICAqXG4gICAgICovXG4gICAgZnVuY3Rpb24gbnVtYmVyIChkYXRhKSB7XG4gICAgICAgIHJldHVybiB0eXBlb2YgZGF0YSA9PT0gJ251bWJlcicgJiYgaXNOYU4oZGF0YSkgPT09IGZhbHNlICYmXG4gICAgICAgICAgICAgICBkYXRhICE9PSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkgJiZcbiAgICAgICAgICAgICAgIGRhdGEgIT09IE51bWJlci5ORUdBVElWRV9JTkZJTklUWTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQdWJsaWMgZnVuY3Rpb24gYHplcm9gLlxuICAgICAqXG4gICAgICogUmV0dXJucyBgdHJ1ZWAgaWYgc29tZXRoaW5nIGlzIHplcm8sXG4gICAgICogYGZhbHNlYCBvdGhlcndpc2UuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZGF0YSAgICAgICAgICBUaGUgdGhpbmcgdG8gdGVzdC5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiB6ZXJvIChkYXRhKSB7XG4gICAgICAgIHJldHVybiBkYXRhID09PSAwO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFB1YmxpYyBmdW5jdGlvbiBgYm9vbGVhbmAuXG4gICAgICpcbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBpZiBkYXRhIGlzIGEgYm9vbGVhbiB2YWx1ZSxcbiAgICAgKiBgZmFsc2VgIG90aGVyd2lzZS5cbiAgICAgKlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGJvb2xlYW4gKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIGRhdGEgPT09IGZhbHNlIHx8IGRhdGEgPT09IHRydWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHVibGljIGZ1bmN0aW9uIGBhcHBseWAuXG4gICAgICpcbiAgICAgKiBNYXBzIGVhY2ggdmFsdWUgZnJvbSB0aGUgZGF0YSB0byB0aGUgY29ycmVzcG9uZGluZyBwcmVkaWNhdGUgYW5kIHJldHVybnNcbiAgICAgKiB0aGUgcmVzdWx0IGFycmF5LiBJZiB0aGUgc2FtZSBmdW5jdGlvbiBpcyB0byBiZSBhcHBsaWVkIGFjcm9zcyBhbGwgb2YgdGhlXG4gICAgICogZGF0YSwgYSBzaW5nbGUgcHJlZGljYXRlIGZ1bmN0aW9uIG1heSBiZSBwYXNzZWQgaW4uXG4gICAgICpcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBhcHBseSAoZGF0YSwgcHJlZGljYXRlcykge1xuICAgICAgICBhc3NlcnQuYXJyYXkoZGF0YSk7XG5cbiAgICAgICAgaWYgKGlzRnVuY3Rpb24ocHJlZGljYXRlcykpIHtcbiAgICAgICAgICAgIHJldHVybiBkYXRhLm1hcChmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJlZGljYXRlcyh2YWx1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGFzc2VydC5hcnJheShwcmVkaWNhdGVzKTtcbiAgICAgICAgYXNzZXJ0Lmhhc0xlbmd0aChkYXRhLCBwcmVkaWNhdGVzLmxlbmd0aCk7XG5cbiAgICAgICAgcmV0dXJuIGRhdGEubWFwKGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgpIHtcbiAgICAgICAgICAgIHJldHVybiBwcmVkaWNhdGVzW2luZGV4XSh2YWx1ZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFB1YmxpYyBmdW5jdGlvbiBgbWFwYC5cbiAgICAgKlxuICAgICAqIE1hcHMgZWFjaCB2YWx1ZSBmcm9tIHRoZSBkYXRhIHRvIHRoZSBjb3JyZXNwb25kaW5nIHByZWRpY2F0ZSBhbmQgcmV0dXJuc1xuICAgICAqIHRoZSByZXN1bHQgb2JqZWN0LiBTdXBwb3J0cyBuZXN0ZWQgb2JqZWN0cy4gSWYgdGhlIGRhdGEgaXMgbm90IG5lc3RlZCBhbmRcbiAgICAgKiB0aGUgc2FtZSBmdW5jdGlvbiBpcyB0byBiZSBhcHBsaWVkIGFjcm9zcyBhbGwgb2YgaXQsIGEgc2luZ2xlIHByZWRpY2F0ZVxuICAgICAqIGZ1bmN0aW9uIG1heSBiZSBwYXNzZWQgaW4uXG4gICAgICpcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBtYXAgKGRhdGEsIHByZWRpY2F0ZXMpIHtcbiAgICAgICAgYXNzZXJ0Lm9iamVjdChkYXRhKTtcblxuICAgICAgICBpZiAoaXNGdW5jdGlvbihwcmVkaWNhdGVzKSkge1xuICAgICAgICAgICAgcmV0dXJuIG1hcFNpbXBsZShkYXRhLCBwcmVkaWNhdGVzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGFzc2VydC5vYmplY3QocHJlZGljYXRlcyk7XG5cbiAgICAgICAgcmV0dXJuIG1hcENvbXBsZXgoZGF0YSwgcHJlZGljYXRlcyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWFwU2ltcGxlIChkYXRhLCBwcmVkaWNhdGUpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHt9O1xuXG4gICAgICAgIE9iamVjdC5rZXlzKGRhdGEpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgcmVzdWx0W2tleV0gPSBwcmVkaWNhdGUoZGF0YVtrZXldKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtYXBDb21wbGV4IChkYXRhLCBwcmVkaWNhdGVzKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSB7fTtcblxuICAgICAgICBPYmplY3Qua2V5cyhwcmVkaWNhdGVzKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIHZhciBwcmVkaWNhdGUgPSBwcmVkaWNhdGVzW2tleV07XG5cbiAgICAgICAgICAgIGlmIChpc0Z1bmN0aW9uKHByZWRpY2F0ZSkpIHtcbiAgICAgICAgICAgICAgICByZXN1bHRba2V5XSA9IHByZWRpY2F0ZShkYXRhW2tleV0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChvYmplY3QocHJlZGljYXRlKSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldID0gbWFwQ29tcGxleChkYXRhW2tleV0sIHByZWRpY2F0ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHVibGljIGZ1bmN0aW9uIGBhbGxgXG4gICAgICpcbiAgICAgKiBDaGVjayB0aGF0IGFsbCBib29sZWFuIHZhbHVlcyBhcmUgdHJ1ZVxuICAgICAqIGluIGFuIGFycmF5IChyZXR1cm5lZCBmcm9tIGBhcHBseWApXG4gICAgICogb3Igb2JqZWN0IChyZXR1cm5lZCBmcm9tIGBtYXBgKS5cbiAgICAgKlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGFsbCAoZGF0YSkge1xuICAgICAgICBpZiAoYXJyYXkoZGF0YSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0ZXN0QXJyYXkoZGF0YSwgZmFsc2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgYXNzZXJ0Lm9iamVjdChkYXRhKTtcblxuICAgICAgICByZXR1cm4gdGVzdE9iamVjdChkYXRhLCBmYWxzZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdGVzdEFycmF5IChkYXRhLCByZXN1bHQpIHtcbiAgICAgICAgdmFyIGk7XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGlmIChkYXRhW2ldID09PSByZXN1bHQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuICFyZXN1bHQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdGVzdE9iamVjdCAoZGF0YSwgcmVzdWx0KSB7XG4gICAgICAgIHZhciBrZXksIHZhbHVlO1xuXG4gICAgICAgIGZvciAoa2V5IGluIGRhdGEpIHtcbiAgICAgICAgICAgIGlmIChkYXRhLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IGRhdGFba2V5XTtcblxuICAgICAgICAgICAgICAgIGlmIChvYmplY3QodmFsdWUpICYmIHRlc3RPYmplY3QodmFsdWUsIHJlc3VsdCkgPT09IHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gcmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuICFyZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHVibGljIGZ1bmN0aW9uIGBhbnlgXG4gICAgICpcbiAgICAgKiBDaGVjayB0aGF0IGF0IGxlYXN0IG9uZSBib29sZWFuIHZhbHVlIGlzIHRydWVcbiAgICAgKiBpbiBhbiBhcnJheSAocmV0dXJuZWQgZnJvbSBgYXBwbHlgKVxuICAgICAqIG9yIG9iamVjdCAocmV0dXJuZWQgZnJvbSBgbWFwYCkuXG4gICAgICpcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBhbnkgKGRhdGEpIHtcbiAgICAgICAgaWYgKGFycmF5KGRhdGEpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGVzdEFycmF5KGRhdGEsIHRydWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgYXNzZXJ0Lm9iamVjdChkYXRhKTtcblxuICAgICAgICByZXR1cm4gdGVzdE9iamVjdChkYXRhLCB0cnVlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtaXhpbiAodGFyZ2V0LCBzb3VyY2UpIHtcbiAgICAgICAgT2JqZWN0LmtleXMoc291cmNlKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIHRhcmdldFtrZXldID0gc291cmNlW2tleV07XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHVibGljIG1vZGlmaWVyIGBhc3NlcnRgLlxuICAgICAqXG4gICAgICogVGhyb3dzIGlmIGBwcmVkaWNhdGVgIHJldHVybnMgYGZhbHNlYC5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBhc3NlcnRNb2RpZmllciAocHJlZGljYXRlLCBkZWZhdWx0TWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgYXNzZXJ0UHJlZGljYXRlKHByZWRpY2F0ZSwgYXJndW1lbnRzLCBkZWZhdWx0TWVzc2FnZSk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYXNzZXJ0UHJlZGljYXRlIChwcmVkaWNhdGUsIGFyZ3MsIGRlZmF1bHRNZXNzYWdlKSB7XG4gICAgICAgIHZhciBtZXNzYWdlID0gYXJnc1thcmdzLmxlbmd0aCAtIDFdO1xuICAgICAgICBhc3NlcnRJbXBsKHByZWRpY2F0ZS5hcHBseShudWxsLCBhcmdzKSwgdW5lbXB0eVN0cmluZyhtZXNzYWdlKSA/IG1lc3NhZ2UgOiBkZWZhdWx0TWVzc2FnZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYXNzZXJ0SW1wbCAodmFsdWUsIG1lc3NhZ2UpIHtcbiAgICAgICAgaWYgKHZhbHVlID09PSBmYWxzZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UgfHwgJ0Fzc2VydGlvbiBmYWlsZWQnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFzc2VydEVpdGhlck1vZGlmaWVyIChwcmVkaWNhdGUsIGRlZmF1bHRNZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZXJyb3I7XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgYXNzZXJ0UHJlZGljYXRlKHByZWRpY2F0ZSwgYXJndW1lbnRzLCBkZWZhdWx0TWVzc2FnZSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgZXJyb3IgPSBlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG9yOiBPYmplY3Qua2V5cyhwcmVkaWNhdGVzKS5yZWR1Y2UoZGVsYXllZEFzc2VydCwge30pXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBkZWxheWVkQXNzZXJ0IChyZXN1bHQsIGtleSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyb3IgJiYgIXByZWRpY2F0ZXNba2V5XS5hcHBseShudWxsLCBhcmd1bWVudHMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFB1YmxpYyBtb2RpZmllciBgbm90YC5cbiAgICAgKlxuICAgICAqIE5lZ2F0ZXMgYHByZWRpY2F0ZWAuXG4gICAgICovXG4gICAgZnVuY3Rpb24gbm90TW9kaWZpZXIgKHByZWRpY2F0ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIG5vdEltcGwocHJlZGljYXRlLmFwcGx5KG51bGwsIGFyZ3VtZW50cykpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG5vdEltcGwgKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiAhdmFsdWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHVibGljIG1vZGlmaWVyIGBtYXliZWAuXG4gICAgICpcbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBpZiBwcmVkaWNhdGUgYXJndW1lbnQgaXMgIGBudWxsYCBvciBgdW5kZWZpbmVkYCxcbiAgICAgKiBvdGhlcndpc2UgcHJvcGFnYXRlcyB0aGUgcmV0dXJuIHZhbHVlIGZyb20gYHByZWRpY2F0ZWAuXG4gICAgICovXG4gICAgZnVuY3Rpb24gbWF5YmVNb2RpZmllciAocHJlZGljYXRlKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoIWFzc2lnbmVkKGFyZ3VtZW50c1swXSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHByZWRpY2F0ZS5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1heWJlSW1wbCAodmFsdWUpIHtcbiAgICAgICAgaWYgKGFzc2lnbmVkKHZhbHVlKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFB1YmxpYyBtb2RpZmllciBgZWl0aGVyYC5cbiAgICAgKlxuICAgICAqIFJldHVybnMgYHRydWVgIGlmIGVpdGhlciBwcmVkaWNhdGUgaXMgdHJ1ZS5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBlaXRoZXJNb2RpZmllciAocHJlZGljYXRlKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgc2hvcnRjdXQgPSBwcmVkaWNhdGUuYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBvcjogT2JqZWN0LmtleXMocHJlZGljYXRlcykucmVkdWNlKG5vcE9yUHJlZGljYXRlLCB7fSlcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIG5vcE9yUHJlZGljYXRlIChyZXN1bHQsIGtleSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldID0gc2hvcnRjdXQgPyBub3AgOiBwcmVkaWNhdGVzW2tleV07XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBmdW5jdGlvbiBub3AgKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVNb2RpZmllZFByZWRpY2F0ZXMgKG1vZGlmaWVyLCBvYmplY3QpIHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZU1vZGlmaWVkRnVuY3Rpb25zKG1vZGlmaWVyLCBwcmVkaWNhdGVzLCBvYmplY3QpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNyZWF0ZU1vZGlmaWVkRnVuY3Rpb25zIChtb2RpZmllciwgZnVuY3Rpb25zLCBvYmplY3QpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IG9iamVjdCB8fCB7fTtcblxuICAgICAgICBPYmplY3Qua2V5cyhmdW5jdGlvbnMpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHJlc3VsdCwga2V5LCB7XG4gICAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHdyaXRhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB2YWx1ZTogbW9kaWZpZXIoZnVuY3Rpb25zW2tleV0sIG1lc3NhZ2VzW2tleV0pXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBleHBvcnRGdW5jdGlvbnMgKGZ1bmN0aW9ucykge1xuICAgICAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgICAgICBkZWZpbmUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbnM7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUgIT09IG51bGwgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICAgICAgICAgIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb25zO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZ2xvYmFscy5jaGVjayA9IGZ1bmN0aW9ucztcbiAgICAgICAgfVxuICAgIH1cbn0odGhpcykpO1xuIiwiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIEJTRC1zdHlsZSBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLiBBbiBhZGRpdGlvbmFsIGdyYW50XG4gKiBvZiBwYXRlbnQgcmlnaHRzIGNhbiBiZSBmb3VuZCBpbiB0aGUgUEFURU5UUyBmaWxlIGluIHRoZSBzYW1lIGRpcmVjdG9yeS5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cy5EaXNwYXRjaGVyID0gcmVxdWlyZSgnLi9saWIvRGlzcGF0Y2hlcicpXG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDE0LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBCU0Qtc3R5bGUgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS4gQW4gYWRkaXRpb25hbCBncmFudFxuICogb2YgcGF0ZW50IHJpZ2h0cyBjYW4gYmUgZm91bmQgaW4gdGhlIFBBVEVOVFMgZmlsZSBpbiB0aGUgc2FtZSBkaXJlY3RvcnkuXG4gKlxuICogQHByb3ZpZGVzTW9kdWxlIERpc3BhdGNoZXJcbiAqIEB0eXBlY2hlY2tzXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBpbnZhcmlhbnQgPSByZXF1aXJlKCcuL2ludmFyaWFudCcpO1xuXG52YXIgX2xhc3RJRCA9IDE7XG52YXIgX3ByZWZpeCA9ICdJRF8nO1xuXG4vKipcbiAqIERpc3BhdGNoZXIgaXMgdXNlZCB0byBicm9hZGNhc3QgcGF5bG9hZHMgdG8gcmVnaXN0ZXJlZCBjYWxsYmFja3MuIFRoaXMgaXNcbiAqIGRpZmZlcmVudCBmcm9tIGdlbmVyaWMgcHViLXN1YiBzeXN0ZW1zIGluIHR3byB3YXlzOlxuICpcbiAqICAgMSkgQ2FsbGJhY2tzIGFyZSBub3Qgc3Vic2NyaWJlZCB0byBwYXJ0aWN1bGFyIGV2ZW50cy4gRXZlcnkgcGF5bG9hZCBpc1xuICogICAgICBkaXNwYXRjaGVkIHRvIGV2ZXJ5IHJlZ2lzdGVyZWQgY2FsbGJhY2suXG4gKiAgIDIpIENhbGxiYWNrcyBjYW4gYmUgZGVmZXJyZWQgaW4gd2hvbGUgb3IgcGFydCB1bnRpbCBvdGhlciBjYWxsYmFja3MgaGF2ZVxuICogICAgICBiZWVuIGV4ZWN1dGVkLlxuICpcbiAqIEZvciBleGFtcGxlLCBjb25zaWRlciB0aGlzIGh5cG90aGV0aWNhbCBmbGlnaHQgZGVzdGluYXRpb24gZm9ybSwgd2hpY2hcbiAqIHNlbGVjdHMgYSBkZWZhdWx0IGNpdHkgd2hlbiBhIGNvdW50cnkgaXMgc2VsZWN0ZWQ6XG4gKlxuICogICB2YXIgZmxpZ2h0RGlzcGF0Y2hlciA9IG5ldyBEaXNwYXRjaGVyKCk7XG4gKlxuICogICAvLyBLZWVwcyB0cmFjayBvZiB3aGljaCBjb3VudHJ5IGlzIHNlbGVjdGVkXG4gKiAgIHZhciBDb3VudHJ5U3RvcmUgPSB7Y291bnRyeTogbnVsbH07XG4gKlxuICogICAvLyBLZWVwcyB0cmFjayBvZiB3aGljaCBjaXR5IGlzIHNlbGVjdGVkXG4gKiAgIHZhciBDaXR5U3RvcmUgPSB7Y2l0eTogbnVsbH07XG4gKlxuICogICAvLyBLZWVwcyB0cmFjayBvZiB0aGUgYmFzZSBmbGlnaHQgcHJpY2Ugb2YgdGhlIHNlbGVjdGVkIGNpdHlcbiAqICAgdmFyIEZsaWdodFByaWNlU3RvcmUgPSB7cHJpY2U6IG51bGx9XG4gKlxuICogV2hlbiBhIHVzZXIgY2hhbmdlcyB0aGUgc2VsZWN0ZWQgY2l0eSwgd2UgZGlzcGF0Y2ggdGhlIHBheWxvYWQ6XG4gKlxuICogICBmbGlnaHREaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAqICAgICBhY3Rpb25UeXBlOiAnY2l0eS11cGRhdGUnLFxuICogICAgIHNlbGVjdGVkQ2l0eTogJ3BhcmlzJ1xuICogICB9KTtcbiAqXG4gKiBUaGlzIHBheWxvYWQgaXMgZGlnZXN0ZWQgYnkgYENpdHlTdG9yZWA6XG4gKlxuICogICBmbGlnaHREaXNwYXRjaGVyLnJlZ2lzdGVyKGZ1bmN0aW9uKHBheWxvYWQpIHtcbiAqICAgICBpZiAocGF5bG9hZC5hY3Rpb25UeXBlID09PSAnY2l0eS11cGRhdGUnKSB7XG4gKiAgICAgICBDaXR5U3RvcmUuY2l0eSA9IHBheWxvYWQuc2VsZWN0ZWRDaXR5O1xuICogICAgIH1cbiAqICAgfSk7XG4gKlxuICogV2hlbiB0aGUgdXNlciBzZWxlY3RzIGEgY291bnRyeSwgd2UgZGlzcGF0Y2ggdGhlIHBheWxvYWQ6XG4gKlxuICogICBmbGlnaHREaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAqICAgICBhY3Rpb25UeXBlOiAnY291bnRyeS11cGRhdGUnLFxuICogICAgIHNlbGVjdGVkQ291bnRyeTogJ2F1c3RyYWxpYSdcbiAqICAgfSk7XG4gKlxuICogVGhpcyBwYXlsb2FkIGlzIGRpZ2VzdGVkIGJ5IGJvdGggc3RvcmVzOlxuICpcbiAqICAgIENvdW50cnlTdG9yZS5kaXNwYXRjaFRva2VuID0gZmxpZ2h0RGlzcGF0Y2hlci5yZWdpc3RlcihmdW5jdGlvbihwYXlsb2FkKSB7XG4gKiAgICAgaWYgKHBheWxvYWQuYWN0aW9uVHlwZSA9PT0gJ2NvdW50cnktdXBkYXRlJykge1xuICogICAgICAgQ291bnRyeVN0b3JlLmNvdW50cnkgPSBwYXlsb2FkLnNlbGVjdGVkQ291bnRyeTtcbiAqICAgICB9XG4gKiAgIH0pO1xuICpcbiAqIFdoZW4gdGhlIGNhbGxiYWNrIHRvIHVwZGF0ZSBgQ291bnRyeVN0b3JlYCBpcyByZWdpc3RlcmVkLCB3ZSBzYXZlIGEgcmVmZXJlbmNlXG4gKiB0byB0aGUgcmV0dXJuZWQgdG9rZW4uIFVzaW5nIHRoaXMgdG9rZW4gd2l0aCBgd2FpdEZvcigpYCwgd2UgY2FuIGd1YXJhbnRlZVxuICogdGhhdCBgQ291bnRyeVN0b3JlYCBpcyB1cGRhdGVkIGJlZm9yZSB0aGUgY2FsbGJhY2sgdGhhdCB1cGRhdGVzIGBDaXR5U3RvcmVgXG4gKiBuZWVkcyB0byBxdWVyeSBpdHMgZGF0YS5cbiAqXG4gKiAgIENpdHlTdG9yZS5kaXNwYXRjaFRva2VuID0gZmxpZ2h0RGlzcGF0Y2hlci5yZWdpc3RlcihmdW5jdGlvbihwYXlsb2FkKSB7XG4gKiAgICAgaWYgKHBheWxvYWQuYWN0aW9uVHlwZSA9PT0gJ2NvdW50cnktdXBkYXRlJykge1xuICogICAgICAgLy8gYENvdW50cnlTdG9yZS5jb3VudHJ5YCBtYXkgbm90IGJlIHVwZGF0ZWQuXG4gKiAgICAgICBmbGlnaHREaXNwYXRjaGVyLndhaXRGb3IoW0NvdW50cnlTdG9yZS5kaXNwYXRjaFRva2VuXSk7XG4gKiAgICAgICAvLyBgQ291bnRyeVN0b3JlLmNvdW50cnlgIGlzIG5vdyBndWFyYW50ZWVkIHRvIGJlIHVwZGF0ZWQuXG4gKlxuICogICAgICAgLy8gU2VsZWN0IHRoZSBkZWZhdWx0IGNpdHkgZm9yIHRoZSBuZXcgY291bnRyeVxuICogICAgICAgQ2l0eVN0b3JlLmNpdHkgPSBnZXREZWZhdWx0Q2l0eUZvckNvdW50cnkoQ291bnRyeVN0b3JlLmNvdW50cnkpO1xuICogICAgIH1cbiAqICAgfSk7XG4gKlxuICogVGhlIHVzYWdlIG9mIGB3YWl0Rm9yKClgIGNhbiBiZSBjaGFpbmVkLCBmb3IgZXhhbXBsZTpcbiAqXG4gKiAgIEZsaWdodFByaWNlU3RvcmUuZGlzcGF0Y2hUb2tlbiA9XG4gKiAgICAgZmxpZ2h0RGlzcGF0Y2hlci5yZWdpc3RlcihmdW5jdGlvbihwYXlsb2FkKSB7XG4gKiAgICAgICBzd2l0Y2ggKHBheWxvYWQuYWN0aW9uVHlwZSkge1xuICogICAgICAgICBjYXNlICdjb3VudHJ5LXVwZGF0ZSc6XG4gKiAgICAgICAgICAgZmxpZ2h0RGlzcGF0Y2hlci53YWl0Rm9yKFtDaXR5U3RvcmUuZGlzcGF0Y2hUb2tlbl0pO1xuICogICAgICAgICAgIEZsaWdodFByaWNlU3RvcmUucHJpY2UgPVxuICogICAgICAgICAgICAgZ2V0RmxpZ2h0UHJpY2VTdG9yZShDb3VudHJ5U3RvcmUuY291bnRyeSwgQ2l0eVN0b3JlLmNpdHkpO1xuICogICAgICAgICAgIGJyZWFrO1xuICpcbiAqICAgICAgICAgY2FzZSAnY2l0eS11cGRhdGUnOlxuICogICAgICAgICAgIEZsaWdodFByaWNlU3RvcmUucHJpY2UgPVxuICogICAgICAgICAgICAgRmxpZ2h0UHJpY2VTdG9yZShDb3VudHJ5U3RvcmUuY291bnRyeSwgQ2l0eVN0b3JlLmNpdHkpO1xuICogICAgICAgICAgIGJyZWFrO1xuICogICAgIH1cbiAqICAgfSk7XG4gKlxuICogVGhlIGBjb3VudHJ5LXVwZGF0ZWAgcGF5bG9hZCB3aWxsIGJlIGd1YXJhbnRlZWQgdG8gaW52b2tlIHRoZSBzdG9yZXMnXG4gKiByZWdpc3RlcmVkIGNhbGxiYWNrcyBpbiBvcmRlcjogYENvdW50cnlTdG9yZWAsIGBDaXR5U3RvcmVgLCB0aGVuXG4gKiBgRmxpZ2h0UHJpY2VTdG9yZWAuXG4gKi9cblxuICBmdW5jdGlvbiBEaXNwYXRjaGVyKCkge1xuICAgIHRoaXMuJERpc3BhdGNoZXJfY2FsbGJhY2tzID0ge307XG4gICAgdGhpcy4kRGlzcGF0Y2hlcl9pc1BlbmRpbmcgPSB7fTtcbiAgICB0aGlzLiREaXNwYXRjaGVyX2lzSGFuZGxlZCA9IHt9O1xuICAgIHRoaXMuJERpc3BhdGNoZXJfaXNEaXNwYXRjaGluZyA9IGZhbHNlO1xuICAgIHRoaXMuJERpc3BhdGNoZXJfcGVuZGluZ1BheWxvYWQgPSBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBhIGNhbGxiYWNrIHRvIGJlIGludm9rZWQgd2l0aCBldmVyeSBkaXNwYXRjaGVkIHBheWxvYWQuIFJldHVybnNcbiAgICogYSB0b2tlbiB0aGF0IGNhbiBiZSB1c2VkIHdpdGggYHdhaXRGb3IoKWAuXG4gICAqXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrXG4gICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICovXG4gIERpc3BhdGNoZXIucHJvdG90eXBlLnJlZ2lzdGVyPWZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgdmFyIGlkID0gX3ByZWZpeCArIF9sYXN0SUQrKztcbiAgICB0aGlzLiREaXNwYXRjaGVyX2NhbGxiYWNrc1tpZF0gPSBjYWxsYmFjaztcbiAgICByZXR1cm4gaWQ7XG4gIH07XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgYSBjYWxsYmFjayBiYXNlZCBvbiBpdHMgdG9rZW4uXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBpZFxuICAgKi9cbiAgRGlzcGF0Y2hlci5wcm90b3R5cGUudW5yZWdpc3Rlcj1mdW5jdGlvbihpZCkge1xuICAgIGludmFyaWFudChcbiAgICAgIHRoaXMuJERpc3BhdGNoZXJfY2FsbGJhY2tzW2lkXSxcbiAgICAgICdEaXNwYXRjaGVyLnVucmVnaXN0ZXIoLi4uKTogYCVzYCBkb2VzIG5vdCBtYXAgdG8gYSByZWdpc3RlcmVkIGNhbGxiYWNrLicsXG4gICAgICBpZFxuICAgICk7XG4gICAgZGVsZXRlIHRoaXMuJERpc3BhdGNoZXJfY2FsbGJhY2tzW2lkXTtcbiAgfTtcblxuICAvKipcbiAgICogV2FpdHMgZm9yIHRoZSBjYWxsYmFja3Mgc3BlY2lmaWVkIHRvIGJlIGludm9rZWQgYmVmb3JlIGNvbnRpbnVpbmcgZXhlY3V0aW9uXG4gICAqIG9mIHRoZSBjdXJyZW50IGNhbGxiYWNrLiBUaGlzIG1ldGhvZCBzaG91bGQgb25seSBiZSB1c2VkIGJ5IGEgY2FsbGJhY2sgaW5cbiAgICogcmVzcG9uc2UgdG8gYSBkaXNwYXRjaGVkIHBheWxvYWQuXG4gICAqXG4gICAqIEBwYXJhbSB7YXJyYXk8c3RyaW5nPn0gaWRzXG4gICAqL1xuICBEaXNwYXRjaGVyLnByb3RvdHlwZS53YWl0Rm9yPWZ1bmN0aW9uKGlkcykge1xuICAgIGludmFyaWFudChcbiAgICAgIHRoaXMuJERpc3BhdGNoZXJfaXNEaXNwYXRjaGluZyxcbiAgICAgICdEaXNwYXRjaGVyLndhaXRGb3IoLi4uKTogTXVzdCBiZSBpbnZva2VkIHdoaWxlIGRpc3BhdGNoaW5nLidcbiAgICApO1xuICAgIGZvciAodmFyIGlpID0gMDsgaWkgPCBpZHMubGVuZ3RoOyBpaSsrKSB7XG4gICAgICB2YXIgaWQgPSBpZHNbaWldO1xuICAgICAgaWYgKHRoaXMuJERpc3BhdGNoZXJfaXNQZW5kaW5nW2lkXSkge1xuICAgICAgICBpbnZhcmlhbnQoXG4gICAgICAgICAgdGhpcy4kRGlzcGF0Y2hlcl9pc0hhbmRsZWRbaWRdLFxuICAgICAgICAgICdEaXNwYXRjaGVyLndhaXRGb3IoLi4uKTogQ2lyY3VsYXIgZGVwZW5kZW5jeSBkZXRlY3RlZCB3aGlsZSAnICtcbiAgICAgICAgICAnd2FpdGluZyBmb3IgYCVzYC4nLFxuICAgICAgICAgIGlkXG4gICAgICAgICk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgaW52YXJpYW50KFxuICAgICAgICB0aGlzLiREaXNwYXRjaGVyX2NhbGxiYWNrc1tpZF0sXG4gICAgICAgICdEaXNwYXRjaGVyLndhaXRGb3IoLi4uKTogYCVzYCBkb2VzIG5vdCBtYXAgdG8gYSByZWdpc3RlcmVkIGNhbGxiYWNrLicsXG4gICAgICAgIGlkXG4gICAgICApO1xuICAgICAgdGhpcy4kRGlzcGF0Y2hlcl9pbnZva2VDYWxsYmFjayhpZCk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBEaXNwYXRjaGVzIGEgcGF5bG9hZCB0byBhbGwgcmVnaXN0ZXJlZCBjYWxsYmFja3MuXG4gICAqXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBwYXlsb2FkXG4gICAqL1xuICBEaXNwYXRjaGVyLnByb3RvdHlwZS5kaXNwYXRjaD1mdW5jdGlvbihwYXlsb2FkKSB7XG4gICAgaW52YXJpYW50KFxuICAgICAgIXRoaXMuJERpc3BhdGNoZXJfaXNEaXNwYXRjaGluZyxcbiAgICAgICdEaXNwYXRjaC5kaXNwYXRjaCguLi4pOiBDYW5ub3QgZGlzcGF0Y2ggaW4gdGhlIG1pZGRsZSBvZiBhIGRpc3BhdGNoLidcbiAgICApO1xuICAgIHRoaXMuJERpc3BhdGNoZXJfc3RhcnREaXNwYXRjaGluZyhwYXlsb2FkKTtcbiAgICB0cnkge1xuICAgICAgZm9yICh2YXIgaWQgaW4gdGhpcy4kRGlzcGF0Y2hlcl9jYWxsYmFja3MpIHtcbiAgICAgICAgaWYgKHRoaXMuJERpc3BhdGNoZXJfaXNQZW5kaW5nW2lkXSkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuJERpc3BhdGNoZXJfaW52b2tlQ2FsbGJhY2soaWQpO1xuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICB0aGlzLiREaXNwYXRjaGVyX3N0b3BEaXNwYXRjaGluZygpO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogSXMgdGhpcyBEaXNwYXRjaGVyIGN1cnJlbnRseSBkaXNwYXRjaGluZy5cbiAgICpcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIERpc3BhdGNoZXIucHJvdG90eXBlLmlzRGlzcGF0Y2hpbmc9ZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuJERpc3BhdGNoZXJfaXNEaXNwYXRjaGluZztcbiAgfTtcblxuICAvKipcbiAgICogQ2FsbCB0aGUgY2FsbGJhY2sgc3RvcmVkIHdpdGggdGhlIGdpdmVuIGlkLiBBbHNvIGRvIHNvbWUgaW50ZXJuYWxcbiAgICogYm9va2tlZXBpbmcuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBpZFxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIERpc3BhdGNoZXIucHJvdG90eXBlLiREaXNwYXRjaGVyX2ludm9rZUNhbGxiYWNrPWZ1bmN0aW9uKGlkKSB7XG4gICAgdGhpcy4kRGlzcGF0Y2hlcl9pc1BlbmRpbmdbaWRdID0gdHJ1ZTtcbiAgICB0aGlzLiREaXNwYXRjaGVyX2NhbGxiYWNrc1tpZF0odGhpcy4kRGlzcGF0Y2hlcl9wZW5kaW5nUGF5bG9hZCk7XG4gICAgdGhpcy4kRGlzcGF0Y2hlcl9pc0hhbmRsZWRbaWRdID0gdHJ1ZTtcbiAgfTtcblxuICAvKipcbiAgICogU2V0IHVwIGJvb2trZWVwaW5nIG5lZWRlZCB3aGVuIGRpc3BhdGNoaW5nLlxuICAgKlxuICAgKiBAcGFyYW0ge29iamVjdH0gcGF5bG9hZFxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIERpc3BhdGNoZXIucHJvdG90eXBlLiREaXNwYXRjaGVyX3N0YXJ0RGlzcGF0Y2hpbmc9ZnVuY3Rpb24ocGF5bG9hZCkge1xuICAgIGZvciAodmFyIGlkIGluIHRoaXMuJERpc3BhdGNoZXJfY2FsbGJhY2tzKSB7XG4gICAgICB0aGlzLiREaXNwYXRjaGVyX2lzUGVuZGluZ1tpZF0gPSBmYWxzZTtcbiAgICAgIHRoaXMuJERpc3BhdGNoZXJfaXNIYW5kbGVkW2lkXSA9IGZhbHNlO1xuICAgIH1cbiAgICB0aGlzLiREaXNwYXRjaGVyX3BlbmRpbmdQYXlsb2FkID0gcGF5bG9hZDtcbiAgICB0aGlzLiREaXNwYXRjaGVyX2lzRGlzcGF0Y2hpbmcgPSB0cnVlO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDbGVhciBib29ra2VlcGluZyB1c2VkIGZvciBkaXNwYXRjaGluZy5cbiAgICpcbiAgICogQGludGVybmFsXG4gICAqL1xuICBEaXNwYXRjaGVyLnByb3RvdHlwZS4kRGlzcGF0Y2hlcl9zdG9wRGlzcGF0Y2hpbmc9ZnVuY3Rpb24oKSB7XG4gICAgdGhpcy4kRGlzcGF0Y2hlcl9wZW5kaW5nUGF5bG9hZCA9IG51bGw7XG4gICAgdGhpcy4kRGlzcGF0Y2hlcl9pc0Rpc3BhdGNoaW5nID0gZmFsc2U7XG4gIH07XG5cblxubW9kdWxlLmV4cG9ydHMgPSBEaXNwYXRjaGVyO1xuIiwiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIEJTRC1zdHlsZSBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLiBBbiBhZGRpdGlvbmFsIGdyYW50XG4gKiBvZiBwYXRlbnQgcmlnaHRzIGNhbiBiZSBmb3VuZCBpbiB0aGUgUEFURU5UUyBmaWxlIGluIHRoZSBzYW1lIGRpcmVjdG9yeS5cbiAqXG4gKiBAcHJvdmlkZXNNb2R1bGUgaW52YXJpYW50XG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qKlxuICogVXNlIGludmFyaWFudCgpIHRvIGFzc2VydCBzdGF0ZSB3aGljaCB5b3VyIHByb2dyYW0gYXNzdW1lcyB0byBiZSB0cnVlLlxuICpcbiAqIFByb3ZpZGUgc3ByaW50Zi1zdHlsZSBmb3JtYXQgKG9ubHkgJXMgaXMgc3VwcG9ydGVkKSBhbmQgYXJndW1lbnRzXG4gKiB0byBwcm92aWRlIGluZm9ybWF0aW9uIGFib3V0IHdoYXQgYnJva2UgYW5kIHdoYXQgeW91IHdlcmVcbiAqIGV4cGVjdGluZy5cbiAqXG4gKiBUaGUgaW52YXJpYW50IG1lc3NhZ2Ugd2lsbCBiZSBzdHJpcHBlZCBpbiBwcm9kdWN0aW9uLCBidXQgdGhlIGludmFyaWFudFxuICogd2lsbCByZW1haW4gdG8gZW5zdXJlIGxvZ2ljIGRvZXMgbm90IGRpZmZlciBpbiBwcm9kdWN0aW9uLlxuICovXG5cbnZhciBpbnZhcmlhbnQgPSBmdW5jdGlvbihjb25kaXRpb24sIGZvcm1hdCwgYSwgYiwgYywgZCwgZSwgZikge1xuICBpZiAoZmFsc2UpIHtcbiAgICBpZiAoZm9ybWF0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignaW52YXJpYW50IHJlcXVpcmVzIGFuIGVycm9yIG1lc3NhZ2UgYXJndW1lbnQnKTtcbiAgICB9XG4gIH1cblxuICBpZiAoIWNvbmRpdGlvbikge1xuICAgIHZhciBlcnJvcjtcbiAgICBpZiAoZm9ybWF0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGVycm9yID0gbmV3IEVycm9yKFxuICAgICAgICAnTWluaWZpZWQgZXhjZXB0aW9uIG9jY3VycmVkOyB1c2UgdGhlIG5vbi1taW5pZmllZCBkZXYgZW52aXJvbm1lbnQgJyArXG4gICAgICAgICdmb3IgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZSBhbmQgYWRkaXRpb25hbCBoZWxwZnVsIHdhcm5pbmdzLidcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBhcmdzID0gW2EsIGIsIGMsIGQsIGUsIGZdO1xuICAgICAgdmFyIGFyZ0luZGV4ID0gMDtcbiAgICAgIGVycm9yID0gbmV3IEVycm9yKFxuICAgICAgICAnSW52YXJpYW50IFZpb2xhdGlvbjogJyArXG4gICAgICAgIGZvcm1hdC5yZXBsYWNlKC8lcy9nLCBmdW5jdGlvbigpIHsgcmV0dXJuIGFyZ3NbYXJnSW5kZXgrK107IH0pXG4gICAgICApO1xuICAgIH1cblxuICAgIGVycm9yLmZyYW1lc1RvUG9wID0gMTsgLy8gd2UgZG9uJ3QgY2FyZSBhYm91dCBpbnZhcmlhbnQncyBvd24gZnJhbWVcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBpbnZhcmlhbnQ7XG4iLCJ2YXIgdG9wTGV2ZWwgPSB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbCA6XG4gICAgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiB7fVxudmFyIG1pbkRvYyA9IHJlcXVpcmUoJ21pbi1kb2N1bWVudCcpO1xuXG5pZiAodHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZG9jdW1lbnQ7XG59IGVsc2Uge1xuICAgIHZhciBkb2NjeSA9IHRvcExldmVsWydfX0dMT0JBTF9ET0NVTUVOVF9DQUNIRUA0J107XG5cbiAgICBpZiAoIWRvY2N5KSB7XG4gICAgICAgIGRvY2N5ID0gdG9wTGV2ZWxbJ19fR0xPQkFMX0RPQ1VNRU5UX0NBQ0hFQDQnXSA9IG1pbkRvYztcbiAgICB9XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IGRvY2N5O1xufVxuIiwiaWYgKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHdpbmRvdztcbn0gZWxzZSBpZiAodHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZ2xvYmFsO1xufSBlbHNlIGlmICh0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIil7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBzZWxmO1xufSBlbHNlIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHt9O1xufVxuIiwiXG52YXIgdXRpbCA9IHJlcXVpcmUoJ3V0aWwnKTtcblxudmFyIHRva2VuaXplID0gZnVuY3Rpb24oLypTdHJpbmcqLyBzdHIsIC8qUmVnRXhwKi8gcmUsIC8qRnVuY3Rpb24/Ki8gcGFyc2VEZWxpbSwgLypPYmplY3Q/Ki8gaW5zdGFuY2Upe1xuICAvLyBzdW1tYXJ5OlxuICAvLyAgICBTcGxpdCBhIHN0cmluZyBieSBhIHJlZ3VsYXIgZXhwcmVzc2lvbiB3aXRoIHRoZSBhYmlsaXR5IHRvIGNhcHR1cmUgdGhlIGRlbGltZXRlcnNcbiAgLy8gcGFyc2VEZWxpbTpcbiAgLy8gICAgRWFjaCBncm91cCAoZXhjbHVkaW5nIHRoZSAwIGdyb3VwKSBpcyBwYXNzZWQgYXMgYSBwYXJhbWV0ZXIuIElmIHRoZSBmdW5jdGlvbiByZXR1cm5zXG4gIC8vICAgIGEgdmFsdWUsIGl0J3MgYWRkZWQgdG8gdGhlIGxpc3Qgb2YgdG9rZW5zLlxuICAvLyBpbnN0YW5jZTpcbiAgLy8gICAgVXNlZCBhcyB0aGUgXCJ0aGlzJyBpbnN0YW5jZSB3aGVuIGNhbGxpbmcgcGFyc2VEZWxpbVxuICB2YXIgdG9rZW5zID0gW107XG4gIHZhciBtYXRjaCwgY29udGVudCwgbGFzdEluZGV4ID0gMDtcbiAgd2hpbGUobWF0Y2ggPSByZS5leGVjKHN0cikpe1xuICAgIGNvbnRlbnQgPSBzdHIuc2xpY2UobGFzdEluZGV4LCByZS5sYXN0SW5kZXggLSBtYXRjaFswXS5sZW5ndGgpO1xuICAgIGlmKGNvbnRlbnQubGVuZ3RoKXtcbiAgICAgIHRva2Vucy5wdXNoKGNvbnRlbnQpO1xuICAgIH1cbiAgICBpZihwYXJzZURlbGltKXtcbiAgICAgIHZhciBwYXJzZWQgPSBwYXJzZURlbGltLmFwcGx5KGluc3RhbmNlLCBtYXRjaC5zbGljZSgxKS5jb25jYXQodG9rZW5zLmxlbmd0aCkpO1xuICAgICAgaWYodHlwZW9mIHBhcnNlZCAhPSAndW5kZWZpbmVkJyl7XG4gICAgICAgIGlmKHBhcnNlZC5zcGVjaWZpZXIgPT09ICclJyl7XG4gICAgICAgICAgdG9rZW5zLnB1c2goJyUnKTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgdG9rZW5zLnB1c2gocGFyc2VkKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBsYXN0SW5kZXggPSByZS5sYXN0SW5kZXg7XG4gIH1cbiAgY29udGVudCA9IHN0ci5zbGljZShsYXN0SW5kZXgpO1xuICBpZihjb250ZW50Lmxlbmd0aCl7XG4gICAgdG9rZW5zLnB1c2goY29udGVudCk7XG4gIH1cbiAgcmV0dXJuIHRva2Vucztcbn1cblxudmFyIEZvcm1hdHRlciA9IGZ1bmN0aW9uKC8qU3RyaW5nKi8gZm9ybWF0KXtcbiAgdmFyIHRva2VucyA9IFtdO1xuICB0aGlzLl9tYXBwZWQgPSBmYWxzZTtcbiAgdGhpcy5fZm9ybWF0ID0gZm9ybWF0O1xuICB0aGlzLl90b2tlbnMgPSB0b2tlbml6ZShmb3JtYXQsIHRoaXMuX3JlLCB0aGlzLl9wYXJzZURlbGltLCB0aGlzKTtcbn1cblxuRm9ybWF0dGVyLnByb3RvdHlwZS5fcmUgPSAvXFwlKD86XFwoKFtcXHdfXSspXFwpfChbMS05XVxcZCopXFwkKT8oWzAgK1xcLVxcI10qKShcXCp8XFxkKyk/KFxcLik/KFxcKnxcXGQrKT9baGxMXT8oW1xcJWJzY2RlRWZGZ0dpb091eFhdKS9nO1xuRm9ybWF0dGVyLnByb3RvdHlwZS5fcGFyc2VEZWxpbSA9IGZ1bmN0aW9uKG1hcHBpbmcsIGludG1hcHBpbmcsIGZsYWdzLCBtaW5XaWR0aCwgcGVyaW9kLCBwcmVjaXNpb24sIHNwZWNpZmllcil7XG4gIGlmKG1hcHBpbmcpe1xuICAgIHRoaXMuX21hcHBlZCA9IHRydWU7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBtYXBwaW5nOiBtYXBwaW5nLFxuICAgIGludG1hcHBpbmc6IGludG1hcHBpbmcsXG4gICAgZmxhZ3M6IGZsYWdzLFxuICAgIF9taW5XaWR0aDogbWluV2lkdGgsIC8vIE1heSBiZSBkZXBlbmRlbnQgb24gcGFyYW1ldGVyc1xuICAgIHBlcmlvZDogcGVyaW9kLFxuICAgIF9wcmVjaXNpb246IHByZWNpc2lvbiwgLy8gTWF5IGJlIGRlcGVuZGVudCBvbiBwYXJhbWV0ZXJzXG4gICAgc3BlY2lmaWVyOiBzcGVjaWZpZXJcbiAgfTtcbn07XG5Gb3JtYXR0ZXIucHJvdG90eXBlLl9zcGVjaWZpZXJzID0ge1xuICBiOiB7XG4gICAgYmFzZTogMixcbiAgICBpc0ludDogdHJ1ZVxuICB9LFxuICBvOiB7XG4gICAgYmFzZTogOCxcbiAgICBpc0ludDogdHJ1ZVxuICB9LFxuICB4OiB7XG4gICAgYmFzZTogMTYsXG4gICAgaXNJbnQ6IHRydWVcbiAgfSxcbiAgWDoge1xuICAgIGV4dGVuZDogWyd4J10sXG4gICAgdG9VcHBlcjogdHJ1ZVxuICB9LFxuICBkOiB7XG4gICAgYmFzZTogMTAsXG4gICAgaXNJbnQ6IHRydWVcbiAgfSxcbiAgaToge1xuICAgIGV4dGVuZDogWydkJ11cbiAgfSxcbiAgdToge1xuICAgIGV4dGVuZDogWydkJ10sXG4gICAgaXNVbnNpZ25lZDogdHJ1ZVxuICB9LFxuICBjOiB7XG4gICAgc2V0QXJnOiBmdW5jdGlvbih0b2tlbil7XG4gICAgICBpZighaXNOYU4odG9rZW4uYXJnKSl7XG4gICAgICAgIHZhciBudW0gPSBwYXJzZUludCh0b2tlbi5hcmcpO1xuICAgICAgICBpZihudW0gPCAwIHx8IG51bSA+IDEyNyl7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGNoYXJhY3RlciBjb2RlIHBhc3NlZCB0byAlYyBpbiBwcmludGYnKTtcbiAgICAgICAgfVxuICAgICAgICB0b2tlbi5hcmcgPSBpc05hTihudW0pID8gJycgKyBudW0gOiBTdHJpbmcuZnJvbUNoYXJDb2RlKG51bSk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuICBzOiB7XG4gICAgc2V0TWF4V2lkdGg6IGZ1bmN0aW9uKHRva2VuKXtcbiAgICAgIHRva2VuLm1heFdpZHRoID0gKHRva2VuLnBlcmlvZCA9PSAnLicpID8gdG9rZW4ucHJlY2lzaW9uIDogLTE7XG4gICAgfVxuICB9LFxuICBlOiB7XG4gICAgaXNEb3VibGU6IHRydWUsXG4gICAgZG91YmxlTm90YXRpb246ICdlJ1xuICB9LFxuICBFOiB7XG4gICAgZXh0ZW5kOiBbJ2UnXSxcbiAgICB0b1VwcGVyOiB0cnVlXG4gIH0sXG4gIGY6IHtcbiAgICBpc0RvdWJsZTogdHJ1ZSxcbiAgICBkb3VibGVOb3RhdGlvbjogJ2YnXG4gIH0sXG4gIEY6IHtcbiAgICBleHRlbmQ6IFsnZiddXG4gIH0sXG4gIGc6IHtcbiAgICBpc0RvdWJsZTogdHJ1ZSxcbiAgICBkb3VibGVOb3RhdGlvbjogJ2cnXG4gIH0sXG4gIEc6IHtcbiAgICBleHRlbmQ6IFsnZyddLFxuICAgIHRvVXBwZXI6IHRydWVcbiAgfSxcbiAgTzoge1xuICAgIGlzT2JqZWN0OiB0cnVlXG4gIH0sXG59O1xuRm9ybWF0dGVyLnByb3RvdHlwZS5mb3JtYXQgPSBmdW5jdGlvbigvKm1peGVkLi4uKi8gZmlsbGVyKXtcbiAgaWYodGhpcy5fbWFwcGVkICYmIHR5cGVvZiBmaWxsZXIgIT0gJ29iamVjdCcpe1xuICAgIHRocm93IG5ldyBFcnJvcignZm9ybWF0IHJlcXVpcmVzIGEgbWFwcGluZycpO1xuICB9XG5cbiAgdmFyIHN0ciA9ICcnO1xuICB2YXIgcG9zaXRpb24gPSAwO1xuICBmb3IodmFyIGkgPSAwLCB0b2tlbjsgaSA8IHRoaXMuX3Rva2Vucy5sZW5ndGg7IGkrKyl7XG4gICAgdG9rZW4gPSB0aGlzLl90b2tlbnNbaV07XG4gICAgXG4gICAgaWYodHlwZW9mIHRva2VuID09ICdzdHJpbmcnKXtcbiAgICAgIHN0ciArPSB0b2tlbjtcbiAgICB9ZWxzZXtcbiAgICAgIGlmKHRoaXMuX21hcHBlZCl7XG4gICAgICAgIGlmKHR5cGVvZiBmaWxsZXJbdG9rZW4ubWFwcGluZ10gPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignbWlzc2luZyBrZXkgJyArIHRva2VuLm1hcHBpbmcpO1xuICAgICAgICB9XG4gICAgICAgIHRva2VuLmFyZyA9IGZpbGxlclt0b2tlbi5tYXBwaW5nXTtcbiAgICAgIH1lbHNle1xuICAgICAgICBpZih0b2tlbi5pbnRtYXBwaW5nKXtcbiAgICAgICAgICBwb3NpdGlvbiA9IHBhcnNlSW50KHRva2VuLmludG1hcHBpbmcpIC0gMTtcbiAgICAgICAgfVxuICAgICAgICBpZihwb3NpdGlvbiA+PSBhcmd1bWVudHMubGVuZ3RoKXtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2dvdCAnICsgYXJndW1lbnRzLmxlbmd0aCArICcgcHJpbnRmIGFyZ3VtZW50cywgaW5zdWZmaWNpZW50IGZvciBcXCcnICsgdGhpcy5fZm9ybWF0ICsgJ1xcJycpO1xuICAgICAgICB9XG4gICAgICAgIHRva2VuLmFyZyA9IGFyZ3VtZW50c1twb3NpdGlvbisrXTtcbiAgICAgIH1cblxuICAgICAgaWYoIXRva2VuLmNvbXBpbGVkKXtcbiAgICAgICAgdG9rZW4uY29tcGlsZWQgPSB0cnVlO1xuICAgICAgICB0b2tlbi5zaWduID0gJyc7XG4gICAgICAgIHRva2VuLnplcm9QYWQgPSBmYWxzZTtcbiAgICAgICAgdG9rZW4ucmlnaHRKdXN0aWZ5ID0gZmFsc2U7XG4gICAgICAgIHRva2VuLmFsdGVybmF0aXZlID0gZmFsc2U7XG5cbiAgICAgICAgdmFyIGZsYWdzID0ge307XG4gICAgICAgIGZvcih2YXIgZmkgPSB0b2tlbi5mbGFncy5sZW5ndGg7IGZpLS07KXtcbiAgICAgICAgICB2YXIgZmxhZyA9IHRva2VuLmZsYWdzLmNoYXJBdChmaSk7XG4gICAgICAgICAgZmxhZ3NbZmxhZ10gPSB0cnVlO1xuICAgICAgICAgIHN3aXRjaChmbGFnKXtcbiAgICAgICAgICAgIGNhc2UgJyAnOlxuICAgICAgICAgICAgICB0b2tlbi5zaWduID0gJyAnO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJysnOlxuICAgICAgICAgICAgICB0b2tlbi5zaWduID0gJysnO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJzAnOlxuICAgICAgICAgICAgICB0b2tlbi56ZXJvUGFkID0gKGZsYWdzWyctJ10pID8gZmFsc2UgOiB0cnVlO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJy0nOlxuICAgICAgICAgICAgICB0b2tlbi5yaWdodEp1c3RpZnkgPSB0cnVlO1xuICAgICAgICAgICAgICB0b2tlbi56ZXJvUGFkID0gZmFsc2U7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnIyc6XG4gICAgICAgICAgICAgIHRva2VuLmFsdGVybmF0aXZlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICB0aHJvdyBFcnJvcignYmFkIGZvcm1hdHRpbmcgZmxhZyBcXCcnICsgdG9rZW4uZmxhZ3MuY2hhckF0KGZpKSArICdcXCcnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0b2tlbi5taW5XaWR0aCA9ICh0b2tlbi5fbWluV2lkdGgpID8gcGFyc2VJbnQodG9rZW4uX21pbldpZHRoKSA6IDA7XG4gICAgICAgIHRva2VuLm1heFdpZHRoID0gLTE7XG4gICAgICAgIHRva2VuLnRvVXBwZXIgPSBmYWxzZTtcbiAgICAgICAgdG9rZW4uaXNVbnNpZ25lZCA9IGZhbHNlO1xuICAgICAgICB0b2tlbi5pc0ludCA9IGZhbHNlO1xuICAgICAgICB0b2tlbi5pc0RvdWJsZSA9IGZhbHNlO1xuICAgICAgICB0b2tlbi5pc09iamVjdCA9IGZhbHNlO1xuICAgICAgICB0b2tlbi5wcmVjaXNpb24gPSAxO1xuICAgICAgICBpZih0b2tlbi5wZXJpb2QgPT0gJy4nKXtcbiAgICAgICAgICBpZih0b2tlbi5fcHJlY2lzaW9uKXtcbiAgICAgICAgICAgIHRva2VuLnByZWNpc2lvbiA9IHBhcnNlSW50KHRva2VuLl9wcmVjaXNpb24pO1xuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgdG9rZW4ucHJlY2lzaW9uID0gMDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbWl4aW5zID0gdGhpcy5fc3BlY2lmaWVyc1t0b2tlbi5zcGVjaWZpZXJdO1xuICAgICAgICBpZih0eXBlb2YgbWl4aW5zID09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3VuZXhwZWN0ZWQgc3BlY2lmaWVyIFxcJycgKyB0b2tlbi5zcGVjaWZpZXIgKyAnXFwnJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYobWl4aW5zLmV4dGVuZCl7XG4gICAgICAgICAgdmFyIHMgPSB0aGlzLl9zcGVjaWZpZXJzW21peGlucy5leHRlbmRdO1xuICAgICAgICAgIGZvcih2YXIgayBpbiBzKXtcbiAgICAgICAgICAgIG1peGluc1trXSA9IHNba11cbiAgICAgICAgICB9XG4gICAgICAgICAgZGVsZXRlIG1peGlucy5leHRlbmQ7XG4gICAgICAgIH1cbiAgICAgICAgZm9yKHZhciBsIGluIG1peGlucyl7XG4gICAgICAgICAgdG9rZW5bbF0gPSBtaXhpbnNbbF07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYodHlwZW9mIHRva2VuLnNldEFyZyA9PSAnZnVuY3Rpb24nKXtcbiAgICAgICAgdG9rZW4uc2V0QXJnKHRva2VuKTtcbiAgICAgIH1cblxuICAgICAgaWYodHlwZW9mIHRva2VuLnNldE1heFdpZHRoID09ICdmdW5jdGlvbicpe1xuICAgICAgICB0b2tlbi5zZXRNYXhXaWR0aCh0b2tlbik7XG4gICAgICB9XG5cbiAgICAgIGlmKHRva2VuLl9taW5XaWR0aCA9PSAnKicpe1xuICAgICAgICBpZih0aGlzLl9tYXBwZWQpe1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignKiB3aWR0aCBub3Qgc3VwcG9ydGVkIGluIG1hcHBlZCBmb3JtYXRzJyk7XG4gICAgICAgIH1cbiAgICAgICAgdG9rZW4ubWluV2lkdGggPSBwYXJzZUludChhcmd1bWVudHNbcG9zaXRpb24rK10pO1xuICAgICAgICBpZihpc05hTih0b2tlbi5taW5XaWR0aCkpe1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcigndGhlIGFyZ3VtZW50IGZvciAqIHdpZHRoIGF0IHBvc2l0aW9uICcgKyBwb3NpdGlvbiArICcgaXMgbm90IGEgbnVtYmVyIGluICcgKyB0aGlzLl9mb3JtYXQpO1xuICAgICAgICB9XG4gICAgICAgIC8vIG5lZ2F0aXZlIHdpZHRoIG1lYW5zIHJpZ2h0SnVzdGlmeVxuICAgICAgICBpZiAodG9rZW4ubWluV2lkdGggPCAwKSB7XG4gICAgICAgICAgdG9rZW4ucmlnaHRKdXN0aWZ5ID0gdHJ1ZTtcbiAgICAgICAgICB0b2tlbi5taW5XaWR0aCA9IC10b2tlbi5taW5XaWR0aDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZih0b2tlbi5fcHJlY2lzaW9uID09ICcqJyAmJiB0b2tlbi5wZXJpb2QgPT0gJy4nKXtcbiAgICAgICAgaWYodGhpcy5fbWFwcGVkKXtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJyogcHJlY2lzaW9uIG5vdCBzdXBwb3J0ZWQgaW4gbWFwcGVkIGZvcm1hdHMnKTtcbiAgICAgICAgfVxuICAgICAgICB0b2tlbi5wcmVjaXNpb24gPSBwYXJzZUludChhcmd1bWVudHNbcG9zaXRpb24rK10pO1xuICAgICAgICBpZihpc05hTih0b2tlbi5wcmVjaXNpb24pKXtcbiAgICAgICAgICB0aHJvdyBFcnJvcigndGhlIGFyZ3VtZW50IGZvciAqIHByZWNpc2lvbiBhdCBwb3NpdGlvbiAnICsgcG9zaXRpb24gKyAnIGlzIG5vdCBhIG51bWJlciBpbiAnICsgdGhpcy5fZm9ybWF0KTtcbiAgICAgICAgfVxuICAgICAgICAvLyBuZWdhdGl2ZSBwcmVjaXNpb24gbWVhbnMgdW5zcGVjaWZpZWRcbiAgICAgICAgaWYgKHRva2VuLnByZWNpc2lvbiA8IDApIHtcbiAgICAgICAgICB0b2tlbi5wcmVjaXNpb24gPSAxO1xuICAgICAgICAgIHRva2VuLnBlcmlvZCA9ICcnO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZih0b2tlbi5pc0ludCl7XG4gICAgICAgIC8vIGEgc3BlY2lmaWVkIHByZWNpc2lvbiBtZWFucyBubyB6ZXJvIHBhZGRpbmdcbiAgICAgICAgaWYodG9rZW4ucGVyaW9kID09ICcuJyl7XG4gICAgICAgICAgdG9rZW4uemVyb1BhZCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZm9ybWF0SW50KHRva2VuKTtcbiAgICAgIH1lbHNlIGlmKHRva2VuLmlzRG91YmxlKXtcbiAgICAgICAgaWYodG9rZW4ucGVyaW9kICE9ICcuJyl7XG4gICAgICAgICAgdG9rZW4ucHJlY2lzaW9uID0gNjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmZvcm1hdERvdWJsZSh0b2tlbik7IFxuICAgICAgfWVsc2UgaWYodG9rZW4uaXNPYmplY3Qpe1xuICAgICAgICB0aGlzLmZvcm1hdE9iamVjdCh0b2tlbik7XG4gICAgICB9XG4gICAgICB0aGlzLmZpdEZpZWxkKHRva2VuKTtcblxuICAgICAgc3RyICs9ICcnICsgdG9rZW4uYXJnO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBzdHI7XG59O1xuRm9ybWF0dGVyLnByb3RvdHlwZS5femVyb3MxMCA9ICcwMDAwMDAwMDAwJztcbkZvcm1hdHRlci5wcm90b3R5cGUuX3NwYWNlczEwID0gJyAgICAgICAgICAnO1xuRm9ybWF0dGVyLnByb3RvdHlwZS5mb3JtYXRJbnQgPSBmdW5jdGlvbih0b2tlbikge1xuICB2YXIgaSA9IHBhcnNlSW50KHRva2VuLmFyZyk7XG4gIGlmKCFpc0Zpbml0ZShpKSl7IC8vIGlzTmFOKGYpIHx8IGYgPT0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZIHx8IGYgPT0gTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZKVxuICAgIC8vIGFsbG93IHRoaXMgb25seSBpZiBhcmcgaXMgbnVtYmVyXG4gICAgaWYodHlwZW9mIHRva2VuLmFyZyAhPSAnbnVtYmVyJyl7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2Zvcm1hdCBhcmd1bWVudCBcXCcnICsgdG9rZW4uYXJnICsgJ1xcJyBub3QgYW4gaW50ZWdlcjsgcGFyc2VJbnQgcmV0dXJuZWQgJyArIGkpO1xuICAgIH1cbiAgICAvL3JldHVybiAnJyArIGk7XG4gICAgaSA9IDA7XG4gIH1cblxuICAvLyBpZiBub3QgYmFzZSAxMCwgbWFrZSBuZWdhdGl2ZXMgYmUgcG9zaXRpdmVcbiAgLy8gb3RoZXJ3aXNlLCAoLTEwKS50b1N0cmluZygxNikgaXMgJy1hJyBpbnN0ZWFkIG9mICdmZmZmZmZmNidcbiAgaWYoaSA8IDAgJiYgKHRva2VuLmlzVW5zaWduZWQgfHwgdG9rZW4uYmFzZSAhPSAxMCkpe1xuICAgIGkgPSAweGZmZmZmZmZmICsgaSArIDE7XG4gIH0gXG5cbiAgaWYoaSA8IDApe1xuICAgIHRva2VuLmFyZyA9ICgtIGkpLnRvU3RyaW5nKHRva2VuLmJhc2UpO1xuICAgIHRoaXMuemVyb1BhZCh0b2tlbik7XG4gICAgdG9rZW4uYXJnID0gJy0nICsgdG9rZW4uYXJnO1xuICB9ZWxzZXtcbiAgICB0b2tlbi5hcmcgPSBpLnRvU3RyaW5nKHRva2VuLmJhc2UpO1xuICAgIC8vIG5lZWQgdG8gbWFrZSBzdXJlIHRoYXQgYXJndW1lbnQgMCB3aXRoIHByZWNpc2lvbj09MCBpcyBmb3JtYXR0ZWQgYXMgJydcbiAgICBpZighaSAmJiAhdG9rZW4ucHJlY2lzaW9uKXtcbiAgICAgIHRva2VuLmFyZyA9ICcnO1xuICAgIH1lbHNle1xuICAgICAgdGhpcy56ZXJvUGFkKHRva2VuKTtcbiAgICB9XG4gICAgaWYodG9rZW4uc2lnbil7XG4gICAgICB0b2tlbi5hcmcgPSB0b2tlbi5zaWduICsgdG9rZW4uYXJnO1xuICAgIH1cbiAgfVxuICBpZih0b2tlbi5iYXNlID09IDE2KXtcbiAgICBpZih0b2tlbi5hbHRlcm5hdGl2ZSl7XG4gICAgICB0b2tlbi5hcmcgPSAnMHgnICsgdG9rZW4uYXJnO1xuICAgIH1cbiAgICB0b2tlbi5hcmcgPSB0b2tlbi50b1VwcGVyID8gdG9rZW4uYXJnLnRvVXBwZXJDYXNlKCkgOiB0b2tlbi5hcmcudG9Mb3dlckNhc2UoKTtcbiAgfVxuICBpZih0b2tlbi5iYXNlID09IDgpe1xuICAgIGlmKHRva2VuLmFsdGVybmF0aXZlICYmIHRva2VuLmFyZy5jaGFyQXQoMCkgIT0gJzAnKXtcbiAgICAgIHRva2VuLmFyZyA9ICcwJyArIHRva2VuLmFyZztcbiAgICB9XG4gIH1cbn07XG5Gb3JtYXR0ZXIucHJvdG90eXBlLmZvcm1hdERvdWJsZSA9IGZ1bmN0aW9uKHRva2VuKSB7XG4gIHZhciBmID0gcGFyc2VGbG9hdCh0b2tlbi5hcmcpO1xuICBpZighaXNGaW5pdGUoZikpeyAvLyBpc05hTihmKSB8fCBmID09IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSB8fCBmID09IE51bWJlci5ORUdBVElWRV9JTkZJTklUWSlcbiAgICAvLyBhbGxvdyB0aGlzIG9ubHkgaWYgYXJnIGlzIG51bWJlclxuICAgIGlmKHR5cGVvZiB0b2tlbi5hcmcgIT0gJ251bWJlcicpe1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdmb3JtYXQgYXJndW1lbnQgXFwnJyArIHRva2VuLmFyZyArICdcXCcgbm90IGEgZmxvYXQ7IHBhcnNlRmxvYXQgcmV0dXJuZWQgJyArIGYpO1xuICAgIH1cbiAgICAvLyBDOTkgc2F5cyB0aGF0IGZvciAnZic6XG4gICAgLy8gICBpbmZpbml0eSAtPiAnWy1daW5mJyBvciAnWy1daW5maW5pdHknICgnWy1dSU5GJyBvciAnWy1dSU5GSU5JVFknIGZvciAnRicpXG4gICAgLy8gICBOYU4gLT4gYSBzdHJpbmcgIHN0YXJ0aW5nIHdpdGggJ25hbicgKCdOQU4nIGZvciAnRicpXG4gICAgLy8gdGhpcyBpcyBub3QgY29tbW9ubHkgaW1wbGVtZW50ZWQgdGhvdWdoLlxuICAgIC8vcmV0dXJuICcnICsgZjtcbiAgICBmID0gMDtcbiAgfVxuXG4gIHN3aXRjaCh0b2tlbi5kb3VibGVOb3RhdGlvbikge1xuICAgIGNhc2UgJ2UnOiB7XG4gICAgICB0b2tlbi5hcmcgPSBmLnRvRXhwb25lbnRpYWwodG9rZW4ucHJlY2lzaW9uKTsgXG4gICAgICBicmVhaztcbiAgICB9XG4gICAgY2FzZSAnZic6IHtcbiAgICAgIHRva2VuLmFyZyA9IGYudG9GaXhlZCh0b2tlbi5wcmVjaXNpb24pOyBcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBjYXNlICdnJzoge1xuICAgICAgLy8gQyBzYXlzIHVzZSAnZScgbm90YXRpb24gaWYgZXhwb25lbnQgaXMgPCAtNCBvciBpcyA+PSBwcmVjXG4gICAgICAvLyBFQ01BU2NyaXB0IGZvciB0b1ByZWNpc2lvbiBzYXlzIHVzZSBleHBvbmVudGlhbCBub3RhdGlvbiBpZiBleHBvbmVudCBpcyA+PSBwcmVjLFxuICAgICAgLy8gdGhvdWdoIHN0ZXAgMTcgb2YgdG9QcmVjaXNpb24gaW5kaWNhdGVzIGEgdGVzdCBmb3IgPCAtNiB0byBmb3JjZSBleHBvbmVudGlhbC5cbiAgICAgIGlmKE1hdGguYWJzKGYpIDwgMC4wMDAxKXtcbiAgICAgICAgLy9wcmludCgnZm9yY2luZyBleHBvbmVudGlhbCBub3RhdGlvbiBmb3IgZj0nICsgZik7XG4gICAgICAgIHRva2VuLmFyZyA9IGYudG9FeHBvbmVudGlhbCh0b2tlbi5wcmVjaXNpb24gPiAwID8gdG9rZW4ucHJlY2lzaW9uIC0gMSA6IHRva2VuLnByZWNpc2lvbik7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgdG9rZW4uYXJnID0gZi50b1ByZWNpc2lvbih0b2tlbi5wcmVjaXNpb24pOyBcbiAgICAgIH1cblxuICAgICAgLy8gSW4gQywgdW5saWtlICdmJywgJ2dHJyByZW1vdmVzIHRyYWlsaW5nIDBzIGZyb20gZnJhY3Rpb25hbCBwYXJ0LCB1bmxlc3MgYWx0ZXJuYXRpdmUgZm9ybWF0IGZsYWcgKCcjJykuXG4gICAgICAvLyBCdXQgRUNNQVNjcmlwdCBmb3JtYXRzIHRvUHJlY2lzaW9uIGFzIDAuMDAxMDAwMDAuIFNvIHJlbW92ZSB0cmFpbGluZyAwcy5cbiAgICAgIGlmKCF0b2tlbi5hbHRlcm5hdGl2ZSl7IFxuICAgICAgICAvL3ByaW50KCdyZXBsYWNpbmcgdHJhaWxpbmcgMCBpbiBcXCcnICsgcyArICdcXCcnKTtcbiAgICAgICAgdG9rZW4uYXJnID0gdG9rZW4uYXJnLnJlcGxhY2UoLyhcXC4uKlteMF0pMCplLywgJyQxZScpO1xuICAgICAgICAvLyBpZiBmcmFjdGlvbmFsIHBhcnQgaXMgZW50aXJlbHkgMCwgcmVtb3ZlIGl0IGFuZCBkZWNpbWFsIHBvaW50XG4gICAgICAgIHRva2VuLmFyZyA9IHRva2VuLmFyZy5yZXBsYWNlKC9cXC4wKmUvLCAnZScpLnJlcGxhY2UoL1xcLjAkLywnJyk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKCd1bmV4cGVjdGVkIGRvdWJsZSBub3RhdGlvbiBcXCcnICsgdG9rZW4uZG91YmxlTm90YXRpb24gKyAnXFwnJyk7XG4gIH1cblxuICAvLyBDIHNheXMgdGhhdCBleHBvbmVudCBtdXN0IGhhdmUgYXQgbGVhc3QgdHdvIGRpZ2l0cy5cbiAgLy8gQnV0IEVDTUFTY3JpcHQgZG9lcyBub3Q7IHRvRXhwb25lbnRpYWwgcmVzdWx0cyBpbiB0aGluZ3MgbGlrZSAnMS4wMDAwMDBlLTgnIGFuZCAnMS4wMDAwMDBlKzgnLlxuICAvLyBOb3RlIHRoYXQgcy5yZXBsYWNlKC9lKFtcXCtcXC1dKShcXGQpLywgJ2UkMTAkMicpIHdvbid0IHdvcmsgYmVjYXVzZSBvZiB0aGUgJyQxMCcgaW5zdGVhZCBvZiAnJDEnLlxuICAvLyBBbmQgcmVwbGFjZShyZSwgZnVuYykgaXNuJ3Qgc3VwcG9ydGVkIG9uIElFNTAgb3IgU2FmYXJpMS5cbiAgdG9rZW4uYXJnID0gdG9rZW4uYXJnLnJlcGxhY2UoL2VcXCsoXFxkKSQvLCAnZSswJDEnKS5yZXBsYWNlKC9lXFwtKFxcZCkkLywgJ2UtMCQxJyk7XG5cbiAgLy8gaWYgYWx0LCBlbnN1cmUgYSBkZWNpbWFsIHBvaW50XG4gIGlmKHRva2VuLmFsdGVybmF0aXZlKXtcbiAgICB0b2tlbi5hcmcgPSB0b2tlbi5hcmcucmVwbGFjZSgvXihcXGQrKSQvLCckMS4nKTtcbiAgICB0b2tlbi5hcmcgPSB0b2tlbi5hcmcucmVwbGFjZSgvXihcXGQrKWUvLCckMS5lJyk7XG4gIH1cblxuICBpZihmID49IDAgJiYgdG9rZW4uc2lnbil7XG4gICAgdG9rZW4uYXJnID0gdG9rZW4uc2lnbiArIHRva2VuLmFyZztcbiAgfVxuXG4gIHRva2VuLmFyZyA9IHRva2VuLnRvVXBwZXIgPyB0b2tlbi5hcmcudG9VcHBlckNhc2UoKSA6IHRva2VuLmFyZy50b0xvd2VyQ2FzZSgpO1xufTtcbkZvcm1hdHRlci5wcm90b3R5cGUuZm9ybWF0T2JqZWN0ID0gZnVuY3Rpb24odG9rZW4pIHtcbiAgLy8gSWYgbm8gcHJlY2lzaW9uIGlzIHNwZWNpZmllZCwgdGhlbiByZXNldCBpdCB0byBudWxsIChpbmZpbml0ZSBkZXB0aCkuXG4gIHZhciBwcmVjaXNpb24gPSAodG9rZW4ucGVyaW9kID09PSAnLicpID8gdG9rZW4ucHJlY2lzaW9uIDogbnVsbDtcbiAgdG9rZW4uYXJnID0gdXRpbC5pbnNwZWN0KHRva2VuLmFyZywgIXRva2VuLmFsdGVybmF0aXZlLCBwcmVjaXNpb24pO1xufTtcbkZvcm1hdHRlci5wcm90b3R5cGUuemVyb1BhZCA9IGZ1bmN0aW9uKHRva2VuLCAvKkludCovIGxlbmd0aCkge1xuICBsZW5ndGggPSAoYXJndW1lbnRzLmxlbmd0aCA9PSAyKSA/IGxlbmd0aCA6IHRva2VuLnByZWNpc2lvbjtcbiAgdmFyIG5lZ2F0aXZlID0gZmFsc2U7XG4gIGlmKHR5cGVvZiB0b2tlbi5hcmcgIT0gXCJzdHJpbmdcIil7XG4gICAgdG9rZW4uYXJnID0gXCJcIiArIHRva2VuLmFyZztcbiAgfVxuICBpZiAodG9rZW4uYXJnLnN1YnN0cigwLDEpID09PSAnLScpIHtcbiAgICBuZWdhdGl2ZSA9IHRydWU7XG4gICAgdG9rZW4uYXJnID0gdG9rZW4uYXJnLnN1YnN0cigxKTtcbiAgfVxuXG4gIHZhciB0ZW5sZXNzID0gbGVuZ3RoIC0gMTA7XG4gIHdoaWxlKHRva2VuLmFyZy5sZW5ndGggPCB0ZW5sZXNzKXtcbiAgICB0b2tlbi5hcmcgPSAodG9rZW4ucmlnaHRKdXN0aWZ5KSA/IHRva2VuLmFyZyArIHRoaXMuX3plcm9zMTAgOiB0aGlzLl96ZXJvczEwICsgdG9rZW4uYXJnO1xuICB9XG4gIHZhciBwYWQgPSBsZW5ndGggLSB0b2tlbi5hcmcubGVuZ3RoO1xuICB0b2tlbi5hcmcgPSAodG9rZW4ucmlnaHRKdXN0aWZ5KSA/IHRva2VuLmFyZyArIHRoaXMuX3plcm9zMTAuc3Vic3RyaW5nKDAsIHBhZCkgOiB0aGlzLl96ZXJvczEwLnN1YnN0cmluZygwLCBwYWQpICsgdG9rZW4uYXJnO1xuICBpZiAobmVnYXRpdmUpIHRva2VuLmFyZyA9ICctJyArIHRva2VuLmFyZztcbn07XG5Gb3JtYXR0ZXIucHJvdG90eXBlLmZpdEZpZWxkID0gZnVuY3Rpb24odG9rZW4pIHtcbiAgaWYodG9rZW4ubWF4V2lkdGggPj0gMCAmJiB0b2tlbi5hcmcubGVuZ3RoID4gdG9rZW4ubWF4V2lkdGgpe1xuICAgIHJldHVybiB0b2tlbi5hcmcuc3Vic3RyaW5nKDAsIHRva2VuLm1heFdpZHRoKTtcbiAgfVxuICBpZih0b2tlbi56ZXJvUGFkKXtcbiAgICB0aGlzLnplcm9QYWQodG9rZW4sIHRva2VuLm1pbldpZHRoKTtcbiAgICByZXR1cm47XG4gIH1cbiAgdGhpcy5zcGFjZVBhZCh0b2tlbik7XG59O1xuRm9ybWF0dGVyLnByb3RvdHlwZS5zcGFjZVBhZCA9IGZ1bmN0aW9uKHRva2VuLCAvKkludCovIGxlbmd0aCkge1xuICBsZW5ndGggPSAoYXJndW1lbnRzLmxlbmd0aCA9PSAyKSA/IGxlbmd0aCA6IHRva2VuLm1pbldpZHRoO1xuICBpZih0eXBlb2YgdG9rZW4uYXJnICE9ICdzdHJpbmcnKXtcbiAgICB0b2tlbi5hcmcgPSAnJyArIHRva2VuLmFyZztcbiAgfVxuICB2YXIgdGVubGVzcyA9IGxlbmd0aCAtIDEwO1xuICB3aGlsZSh0b2tlbi5hcmcubGVuZ3RoIDwgdGVubGVzcyl7XG4gICAgdG9rZW4uYXJnID0gKHRva2VuLnJpZ2h0SnVzdGlmeSkgPyB0b2tlbi5hcmcgKyB0aGlzLl9zcGFjZXMxMCA6IHRoaXMuX3NwYWNlczEwICsgdG9rZW4uYXJnO1xuICB9XG4gIHZhciBwYWQgPSBsZW5ndGggLSB0b2tlbi5hcmcubGVuZ3RoO1xuICB0b2tlbi5hcmcgPSAodG9rZW4ucmlnaHRKdXN0aWZ5KSA/IHRva2VuLmFyZyArIHRoaXMuX3NwYWNlczEwLnN1YnN0cmluZygwLCBwYWQpIDogdGhpcy5fc3BhY2VzMTAuc3Vic3RyaW5nKDAsIHBhZCkgKyB0b2tlbi5hcmc7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKXtcbiAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpLFxuICAgIHN0cmVhbSwgZm9ybWF0O1xuICBpZihhcmdzWzBdIGluc3RhbmNlb2YgcmVxdWlyZSgnc3RyZWFtJykuU3RyZWFtKXtcbiAgICBzdHJlYW0gPSBhcmdzLnNoaWZ0KCk7XG4gIH1cbiAgZm9ybWF0ID0gYXJncy5zaGlmdCgpO1xuICB2YXIgZm9ybWF0dGVyID0gbmV3IEZvcm1hdHRlcihmb3JtYXQpO1xuICB2YXIgc3RyaW5nID0gZm9ybWF0dGVyLmZvcm1hdC5hcHBseShmb3JtYXR0ZXIsIGFyZ3MpO1xuICBpZihzdHJlYW0pe1xuICAgIHN0cmVhbS53cml0ZShzdHJpbmcpO1xuICB9ZWxzZXtcbiAgICByZXR1cm4gc3RyaW5nO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5Gb3JtYXR0ZXIgPSBGb3JtYXR0ZXI7XG5cbiJdfQ==
