const AppDispatcher = require('../appdispatcher');
const RadiationStore = require('./../stores/radiation-store');
const constants = require('../constants/ScienceTeamConstants');

const actions = {

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

    }

};

module.exports = actions;