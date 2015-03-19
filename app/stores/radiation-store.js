/* A singleton store that can be queried for remaining time */

const AppDispatcher = require('../appdispatcher');
const BaseStore = require('./base-store');
const constants = require('../constants');
var radiationLevel = 20;
var samples = [];

const RadiationStore = Object.assign(new BaseStore(), {

    _setRadiationLevel() {
        radiationLevel = data.radiationLevel;
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
        return radiationLevel + ((Math.random()-.5)*10)>>0;
    },

    getSamples() {
        return samples.slice();
    },

    dispatcherIndex: AppDispatcher.register(function (payload) {
        var { action, data} = payload;

        switch (action) {
            case constants.SET_RADIATION_LEVEL:
                RadiationStore.setRadiationLevel(data);
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
