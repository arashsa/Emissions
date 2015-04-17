var timeKeeping = require('./time-keeping');

var missionStarted = false;
//var missionLength = 0;
//var originalMissionLength = 0;
//var missionTime = 0;
//var missionTimeLastUpdated = 0;
//var oxygenRemaining = 100;
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


function init(io) {
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
            socket.emit("mission time", timeKeeping.usedTimeInMillis()/1000);
        });

        socket.on('get app state', function() {
            var appState = {
                mission_running: missionStarted,
                elapsed_mission_time: timeKeeping.usedTimeInMillis()/1000
//    science: fetchFromLS('science_state'),
//    communication: null,
//    security: null,
//    astronaut: null,
//    mc: null
            };
           socket.emit('app state', appState) ;
        });

        socket.on("get oxygen remaining", function () {
            socket.emit("oxygen remaining", oxygenRemaining);
        });

        socket.on("set oxygen remaining", function (oxygen) {
            oxygenRemaining = oxygen;
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

    });

    function startMission() {
        //oxygenRemaining = 100;
        //co2Level = 0;
        //scrubFilterChanged = false;
        if(missionStarted) return;

        missionStarted = true;
        timeKeeping.start();

        io.emit("mission started");
    }

    function stopMission() {
        if(!missionStarted) return;

        missionStarted = false;
        timeKeeping.stop();

        io.emit("mission stopped");
    }

    function resetMission(){
        stopMission();

        timeKeeping.reset();
    }
}

module.exports = init;

