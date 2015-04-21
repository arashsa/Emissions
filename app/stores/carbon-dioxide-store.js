const Dispatcher = require('../appdispatcher');
const MissionConstants = require('../constants/MissionConstants');
const BaseStore = require('./base-store');

var level = 0;
var filterChanged = false;

const CO2Store = module.exports = Object.assign(new BaseStore, {

    co2Level(){
        return level;
    },

    filterChanged(){
        return filterChanged;
    },

    dispatcherIndex: Dispatcher.register((payload) => {

        switch (payload.action) {
            case MissionConstants.RECEIVED_APP_STATE:
                var appState = payload.appState;

                level = appState.carbon_dioxide;
                filterChanged = appState.scrub_filter_changed;
                CO2Store.emitChange();
                break;
        }

        return true;
    })
});
