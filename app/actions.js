const AppDispatcher = require('./appdispatcher'),
    { format } = require('util'),
    { uuid } = require('./utils'),
    constants = require('./constants'),
    TimerStore = require('./stores/timer-store'),
    RadiationStore = require('./stores/radiation-store'),
    router = require('./router-container');

function addStub(name, stub) {
    actions[name] = () => {
        console.log(format('[UNIMPLEMENTED] %s(%s)', name, arguments.join(',')));
        stub && stub(...arguments);
    }
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
        transitionTo(to, param, query) {
        router.transitionTo(to, param, query);
    },

    startMission() {
        AppDispatcher.dispatch({action: constants.MISSION_STARTED_EVENT});
        actions.removeMessage(constants.NOT_READY_MSG);
    },

    stopMission() {
        AppDispatcher.dispatch({action: constants.MISSION_STOPPED_EVENT});
    },

    startTimer(id) {
        AppDispatcher.dispatch({action: 'START_TIMER', data: {timerId: id}});
    },

    resetTimer(id) {
        AppDispatcher.dispatch({action: 'RESET_TIMER', data: {timerId: id}});
    },

    stopTimer(id) {
        AppDispatcher.dispatch({action: 'STOP_TIMER', data: {timerId: id}});
    },

    setTimer(timerId, time) {
        AppDispatcher.dispatch({
            action: constants.SET_TIMER,
            data: {
                remainingTime: time,
                timerId
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
        addMessage(msg) {
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
            }
        );

        if (msg.duration) {
            setTimeout(() => actions.removeMessage(msg.id), msg.duration * 1000)
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
        addTransientMessage(msg, duration = 5) {
        return actions.addMessage(Object.assign({duration}, msg))
    },

    removeMessage(id) {
        AppDispatcher.dispatch({
                action: constants.REMOVE_MESSAGE,
                data: id
            }
        );
    },

    introWasRead(teamId) {
        AppDispatcher.dispatch({action: constants.INTRODUCTION_READ, teamName: teamId});
    },

    takeRadiationSample() {
        AppDispatcher.dispatch({
            action: constants.SCIENCE_TAKE_RADIATION_SAMPLE
        })
    },

    averageRadiationCalculated(average){
        let samples = RadiationStore.getSamples();

        if (samples.length) {
            let sum = samples.reduce((prev, current) => prev + current, 0),
                trueCalculatedAverage = sum / samples.length,
                diffInPercent = 100 * Math.abs((trueCalculatedAverage - average) / trueCalculatedAverage);

            if (diffInPercent > 15) {
                actions.addTransientMessage({text: 'Mulig det gjennomsnittet ble litt feil.'});
            }
        }


        AppDispatcher.dispatch({
            action: constants.SCIENCE_AVG_RADIATION_CALCULATED,
            data: {average}
        });

        if (average > constants.SCIENCE_AVG_RAD_RED_THRESHOLD) {
            actions.addTransientMessage({
                text: 'Veldig høyt radioaktivt nivå detektert. Varsle sikkerhetsteamet umiddelbart!',
                level: 'danger',
                id: constants.SCIENCE_RADIATION_WARNING_MSG
            }, 30);
        } else if (average > constants.SCIENCE_AVG_RAD_ORANGE_THRESHOLD) {
            actions.addTransientMessage({
                text: 'Høye verdier av radioaktivitet. Følg med på om det går nedover igjen',
                level: 'warning',
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
        setRadiationLevel(min, max) {
        AppDispatcher.dispatch({
            action: constants.SCIENCE_RADIATION_LEVEL_CHANGED,
            data: {min, max}
        });
    },

    addToTotalRadiationLevel(amount){
        const RadiationStore = require('./stores/radiation-store');

        var total = amount + RadiationStore.getTotalLevel();

        if (total > constants.SCIENCE_TOTAL_RADIATION_VERY_SERIOUS_THRESHOLD) {
            actions.addTransientMessage({
                id: 'science_high_radiation_level',
                text: 'Faretruende høyt strålingsnivå!',
                level: 'danger'
            }, 30);
        } else if (total > constants.SCIENCE_TOTAL_RADIATION_SERIOUS_THRESHOLD) {
            actions.addTransientMessage({
                id: 'science_high_radiation_level',
                text: 'Høyt strålingsnivå!',
                level: 'warning'
            }, 30);
        }

        AppDispatcher.dispatch({
            action: constants.SCIENCE_TOTAL_RADIATION_LEVEL_CHANGED,
            data: {total, added: amount}
        })

    },

    // sync mission time with signal from server
    syncMissionTime(elapsedSeconds){
        AppDispatcher.dispatch({
            action: constants.MISSION_TIME_SYNC,
            data: {elapsedMissionTime: elapsedSeconds}
        });

    }

};

// dummy return 400 seconds remaining
addStub('askServerForRemainingTime', () => {
    AppDispatcher.dispatch({
        action: constants.REMAINING_MISSION_TIME_CHANGED,
        data: 400
    })
});

Object.freeze(actions);

window.__actions = actions;
module.exports = actions;