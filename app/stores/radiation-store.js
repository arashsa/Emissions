/* A singleton store that can be queried for remaining time */

const AppDispatcher = require('../appdispatcher');
const BaseStore = require('./base-store');
const constants = require('../constants');
const randomInt = require('../utils').randomInt;
const radiationRange = {
    min : 20,
    max : 40
};
var samples = [];

const RadiationStore = Object.assign(new BaseStore(), {

    _setRadiationLevel(min, max) {
        radiationRange.min = min;
        radiationRange.max = max;
        this.emitChange();
    },

    _clearSamples() {
        samples = [];
        this.emitChange();
    },

    _takeSample() {
        if (samples.length < 5) {
            samples.push(this.getLevel());
            this.emitChange();
        }
    },

    getLevel() {
        return randomInt(radiationRange.min, radiationRange.max);
    },

    getSamples() {
        return samples.slice();
    },

    dispatcherIndex: AppDispatcher.register(function (payload) {
        var { action, data} = payload;

        switch (action) {
            case constants.SCIENCE_SET_RADIATION_LEVEL:
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
