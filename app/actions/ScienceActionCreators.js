const AppDispatcher = require('../appdispatcher');
const RadiationStore = require('./../stores/radiation-store');
const constants = require('../constants/ScienceTeamConstants');
const MissionConstants = require('../constants/MissionConstants');
const MessageActionsCreators = require('./MessageActionCreators');
const MissionActionCreators = require('../actions/MissionActionCreators');
const TimerActionCreators = require('../actions/TimerActionCreators');

const actions = {

    startSampleTask(){
        AppDispatcher.dispatch({action: constants.SCIENCE_CLEAR_RADIATION_SAMPLES});
        AppDispatcher.dispatch({action: MissionConstants.START_TASK, teamId: 'science', taskId: 'sample'});
        this.resetSamplingTimer();
    },

    resetSamplingTimer() {
        TimerActionCreators.resetTimer(constants.SCIENCE_TIMER_1);
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
                MessageActionsCreators.addTransientMessage({text: 'Mulig det gjennomsnittet ble litt feil.'});
            }
        }


        AppDispatcher.dispatch({
            action: constants.SCIENCE_AVG_RADIATION_CALCULATED,
            data: {average}
        });

        if (average > constants.SCIENCE_AVG_RAD_RED_THRESHOLD) {
            MessageActionsCreators.addTransientMessage({
                text: 'Veldig høyt radioaktivt nivå detektert. Varsle sikkerhetsteamet umiddelbart!',
                level: 'danger',
                id: constants.SCIENCE_RADIATION_WARNING_MSG
            }, 30);
        } else if (average > constants.SCIENCE_AVG_RAD_ORANGE_THRESHOLD) {
            MessageActionsCreators.addTransientMessage({
                text: 'Høye verdier av radioaktivitet. Følg med på om det går nedover igjen',
                level: 'warning',
                id: constants.SCIENCE_RADIATION_WARNING_MSG
            }, 10);
        }

        MissionActionCreators.taskCompleted('average');
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

        var total = amount + RadiationStore.getTotalLevel();

        if (total > constants.SCIENCE_TOTAL_RADIATION_VERY_SERIOUS_THRESHOLD) {
            MessageActionsCreators.addTransientMessage({
                id: 'science_high_radiation_level',
                text: 'Faretruende høyt strålingsnivå!',
                level: 'danger'
            }, 30);
        } else if (total > constants.SCIENCE_TOTAL_RADIATION_SERIOUS_THRESHOLD) {
            MessageActionsCreators.addTransientMessage({
                id: 'science_high_radiation_level',
                text: 'Høyt strålingsnivå!',
                level: 'warning'
            }, 30);
        }

        AppDispatcher.dispatch({
            action: constants.SCIENCE_TOTAL_RADIATION_LEVEL_CHANGED,
            data: {total, added: amount}
        });

        MissionActionCreators.taskCompleted('addtotal');
    }

};

window.__ScienceActions = actions;
module.exports = actions;