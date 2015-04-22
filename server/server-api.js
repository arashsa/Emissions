const missionTime = require('./mission-time');
const chapters = require('./chapters');
const EventConstants = require('./EventConstants');
const _ = require('lodash');

var missionStarted;
var teamState;

var oxygenRemaining;
var oxygenConsumption;
var heartRate;
var breathRate;
var qualityTestShouldFail;
var transferTestShouldFail;
var radiationLevel;
var co2Level;
var scrubFilterChanged;
var chosenSatellite;

function appState() {
    return {
        current_chapter: chapters.currentChapter(),
        mission_running: missionStarted,
        elapsed_mission_time: missionTime.usedTimeInSeconds(),
        elapsed_chapter_time: Math.round(missionTime.usedTimeInSeconds() - chapters.chapterStart()),
        quality_test_should_fail: qualityTestShouldFail,
        transfer_test_should_fail: transferTestShouldFail,
        chosen_satellite: chosenSatellite,
        carbon_dioxide: co2Level,
        scrub_filter_changed: scrubFilterChanged,
        oxygen: oxygenRemaining,
        oxygen_consumption: oxygenConsumption,
        heart_rate: heartRate,
        breath_rate: breathRate,
        science: teamState['science'],
        communication: teamState['communication'],
        security: teamState['security'],
        astronaut: teamState['astronaut'],
        mc: {}
    };
}


var createEventLists = function () {
    return {
        currentChapter: chapters.currentChapter(),
        remaining: chapters.remainingEvents(),
        completed: chapters.completedEvents(),
        overdue: chapters.overdueEvents()
    };
};

var API = module.exports = function init(io) {

    var internalEvents = {};
    internalEvents['lower oxygen'] = function () {
        setRemainingOxygen(50);
    };

    internalEvents[EventConstants.SET_HIGH_C02] = function () {
        co2Level = 45;
        publishAppStateUpdate();
    };

    internalEvents['set transfer ok'] = function () {
        transferTestShouldFail = false;
        publishAppStateUpdate();
    };
    internalEvents['set quality ok'] = function () {
        qualityTestShouldFail = false;
        publishAppStateUpdate();
    };
    internalEvents[EventConstants.SET_HEART_RATE_HIGH] = function () {
        changeHeartRate(121, 150)
    };

    internalEvents[EventConstants.SET_HEART_RATE_MEDIUM] = function () {
        changeHeartRate(95, 105)
    };

    internalEvents[EventConstants.SET_HEART_RATE_LOW] = function () {
        changeHeartRate(70, 80)
    };
    internalEvents['set breathrate high'] = function () {
        breathRate = 'high';
    };
    internalEvents['set breathrate low'] = function () {
        breathRate = 'low';
    };
    internalEvents['set radiation low'] = function () {
        setRadiation('low');
        publishAppStateUpdate();
    };
    internalEvents['set radiation medium'] = function () {
        setRadiation('medium');
        publishAppStateUpdate();
    };
    internalEvents['set radiation high'] = function () {
        setRadiation('high');
        publishAppStateUpdate();
    };


    io.sockets.on('connection', function (socket) {

        //Initiates an RTC call with another client
        socket.on("call", function (from, to) {
            socket.broadcast.emit("call", from, to);
        });

        //Sends an RTC signal from one client to another
        socket.on("signal", function (signal, from, to) {
            socket.broadcast.emit("signal", signal, from, to);
        });

        //Instructs all clients displaying the astronaut video feed to change the video url
        socket.on("change video", function (videoUrl) {
            socket.broadcast.emit("change video", videoUrl);
        });

        socket.on("get mission time", function () {
            socket.emit("mission time", missionTime.usedTimeInMillis() / 1000);
        });

        socket.on("get oxygen remaining", function () {
            socket.emit("oxygen remaining", oxygenRemaining);
        });

        // only for testing
        socket.on("set oxygen remaining", setRemainingOxygen);

        socket.on('set oxygen consumption', (units)=> {
            oxygenConsumption = units;
            publishAppStateUpdate();
        });

        socket.on("set scrub filter changed", function () {
            scrubFilterChanged = true;
            co2Level = 5;
            publishAppStateUpdate();
        });

        //Event fired by the mission commander when the astronaut has finished repairing the satelite
        //socket.on("job finished", function () {
        //    socket.broadcast.emit("job finished");
        //});

        socket.on("start mission", startMission);

        socket.on("stop mission", stopMission);

        socket.on("reset mission", resetMission);

        socket.on('get app state', function () {
            socket.emit(EventConstants.APP_STATE, appState());
        });

        socket.on(EventConstants.ADVANCE_CHAPTER, () => {
            chapters.advanceChapter();
            socket.emit(EventConstants.SET_EVENTS, createEventLists());
        });

        socket.on('set team state', function (state) {
            teamState[state.team] = state;

            // broadcast the change to all other clients
            socket.broadcast.emit(EventConstants.APP_STATE, appState());
        });

        socket.on(EventConstants.GET_EVENTS, () => {
            socket.emit(EventConstants.SET_EVENTS, createEventLists());
        });

        socket.on(EventConstants.TRIGGER_EVENT, chapters.triggerEvent);

        socket.on(EventConstants.COMPLETE_MISSION, ()=> {
            stopMission();
            socket.broadcast.emit(EventConstants.MISSION_COMPLETED);
        })
    });

    function publishAppStateUpdate() {
        io.emit(EventConstants.APP_STATE, appState())
    }

    function startMission() {
        if (missionStarted) return;

        missionStarted = true;
        missionTime.start();
        startConsumingOxygen();

        io.emit(EventConstants.MISSION_STARTED, appState());
        io.emit(EventConstants.SET_EVENTS, createEventLists());
    }

    function stopMission() {
        if (!missionStarted) return;

        missionStarted = false;
        missionTime.stop();
        stopConsumingOxygen();

        io.emit(EventConstants.MISSION_STOPPED);
    }

    /**
     * Reset everything to initial values to make for a fresh start
     */
    function resetMission() {
        var sendNewEventLists = _.throttle(() => io.emit(EventConstants.SET_EVENTS, createEventLists()), 1000);
        stopMission();

        missionTime.reset();
        chapters.reset();
        teamState = {};
        resetValues();

        // set up all the events
        require('./mission-script').run();

        chapters.addTriggerListener((event) => {
            if (event.serverInternal) {
                var fn = internalEvents[event.eventName];
                fn();
            } else {
                io.emit(event.eventName, event.value)
            }
        });

        // add a listener for trigger events
        // this listener is throttled, so that it will only be called at most once per second
        chapters.addTriggerListener(sendNewEventLists);
        chapters.addChapterListener(publishAppStateUpdate);
        chapters.addOverdueListener(()=> io.emit(EventConstants.SET_EVENTS, createEventLists()));

        io.emit(EventConstants.MISSION_RESET);
    }

    var oxygenCounter;

    function startConsumingOxygen() {
        oxygenCounter = setInterval(() => {
            oxygenRemaining -= oxygenConsumption;
            publishAppStateUpdate();
        }, 60 * 1000)
    }

    function stopConsumingOxygen() {
        clearInterval(oxygenCounter);
    }

    function setRemainingOxygen(oxygen) {
        oxygenRemaining = oxygen;
        publishAppStateUpdate();
    }

    function changeHeartRate(min, max) {
        heartRate.min = min;
        heartRate.max = max;
        publishAppStateUpdate();
    }

    // it's a bit different that we use strings here, but if refactoring I would try to use it more
    function setRadiation(level) {
        var tmp;

        if (level === 'high') {
            tmp = _.random(76, 95);

            radiationLevel = {
                low: tmp,
                high: Math.min(tmp + 15, 100)
            }
        } else if (level === 'medium') {
            tmp = _.random(41, 70);

            radiationLevel = {
                low: tmp,
                high: Math.min(tmp + 15, 75)
            }
        } else {
            tmp = _.random(0, 35);

            radiationLevel = {
                low: tmp,
                high: Math.min(tmp + 15, 40)
            }
        }
    }

    function resetValues() {

        missionStarted = false;
        teamState = {};

        oxygenRemaining = 100;
        oxygenConsumption = 1;
        heartRate = {min: 70, max: 80};
        breathRate = 'low';
        qualityTestShouldFail = true;
        transferTestShouldFail = true;

        setRadiation('low');

        co2Level = 15;
        scrubFilterChanged = false;

        chosenSatellite = 2;
    }


    // Clean start
    resetMission();

    // set up an event poller
    setInterval(() => {
        chapters.tick();
    }, 1000);
};

