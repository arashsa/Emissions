const missionTime = require('./mission-time');
const chapters = require('./chapters');
const socketEvents = require('./EventConstants');
const _ = require('lodash');

var missionStarted = false;
var teamState = {};

var oxygenRemaining = 100;
var oxygenConsumption = 1;
var heartRate = {min: 70, max: 80};

//var co2Level = 0;
//var scrubFilterChanged = false;
//var ranges = {
//    respiration: [0, 0],
//    oxygenUse: [0, 0],
//    heartRate: [0, 0],
//    radiation: [0, 0],
//    satelite1: [0, 0],
//    satelite2: [0, 0],
//    satelite3: [0, 0]
//};


function appState() {
    return {
        current_chapter: chapters.currentChapter(),
        mission_running: missionStarted,
        elapsed_mission_time: missionTime.usedTimeInSeconds(),
        oxygen: oxygenRemaining,
        oxygen_consumption: oxygenConsumption,
        heart_rate: heartRate,
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

    var internalEvents = {
        'lower oxygen': function () {
            setRemainingOxygen(50);
        }
    };

    io.sockets.on('connection', function (socket) {
        var socketId = socket.id;
        var clientIp = socket.request.connection.remoteAddress;

        console.log('A new client connected  on ', socketId, 'from', clientIp);

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

        socket.on("get ranges", function () {
            socket.emit("ranges", ranges);
        });

        socket.on("get levels", function () {
            socket.emit("levels", levels);
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

        socket.on("get co2 level", function () {
            socket.emit("co2 level", co2Level);
        });

        socket.on("set co2 level", function (co2) {
            co2Level = co2;
        });

        socket.on("is scrub filter changed", function () {
            socket.emit("scrub filter changed", scrubFilterChanged);
        });

        socket.on("set scrub filter changed", function () {
            scrubFilterChanged = true;
        });

        //Event fired by the mission commander when the astronaut has finished repairing the satelite
        socket.on("job finished", function () {
            socket.broadcast.emit("job finished");
        });

        socket.on("start mission", startMission);

        socket.on("stop mission", stopMission);

        socket.on("reset mission", resetMission);

        socket.on('get app state', function () {
            socket.emit(socketEvents.APP_STATE, appState());
        });

        socket.on(socketEvents.ADVANCE_CHAPTER, () => {
            chapters.advanceChapter();
            socket.emit(socketEvents.SET_EVENTS, createEventLists());
        });

        socket.on('set team state', function (state) {
            teamState[state.team] = state;

            // broadcast the change to all other clients
            socket.broadcast.emit(socketEvents.APP_STATE, appState());
        });

        socket.on(socketEvents.GET_EVENTS, () => {
            socket.emit(socketEvents.SET_EVENTS, createEventLists());
        });

        socket.on(socketEvents.TRIGGER_EVENT, chapters.triggerEvent)

        socket.on(socketEvents.COMPLETE_MISSION, ()=> {
            stopMission();
            socket.broadcast.emit(socketEvents.MISSION_COMPLETED);
        })
    });

    function publishAppStateUpdate() {
        io.emit(socketEvents.APP_STATE, appState())
    }

    function startMission() {
        //oxygenRemaining = 100;
        //co2Level = 0;
        //scrubFilterChanged = false;
        if (missionStarted) return;

        missionStarted = true;
        missionTime.start();
        startConsumingOxygen();

        io.emit(socketEvents.MISSION_STARTED, appState());
        io.emit(socketEvents.SET_EVENTS, createEventLists());
    }

    function stopMission() {
        if (!missionStarted) return;

        missionStarted = false;
        missionTime.stop();
        stopConsumingOxygen();

        io.emit(socketEvents.MISSION_STOPPED);
    }

    /**
     * Reset everything to initial values to make for a fresh start
     */
    function resetMission() {
        var sendNewEventLists = _.throttle(() => io.emit(socketEvents.SET_EVENTS, createEventLists()), 1000);
        stopMission();

        missionTime.reset();
        chapters.reset();
        teamState = {};

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
        chapters.addOverdueListener(()=> io.emit(socketEvents.SET_EVENTS, createEventLists()));

        io.emit(socketEvents.MISSION_RESET);
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


    // Clean start
    resetMission();

    // set up a poller
    setInterval(() => {
        chapters.tick();
    }, 1000);
};

