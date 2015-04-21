const BaseStore = require('./base-store');
const AppDispatcher = require('../appdispatcher');
const MissionConstants = require('../constants/MissionConstants');

var chosenSatellite = null;

var Store = module.exports = Object.assign(new BaseStore(), {

    dispatcherIndex: AppDispatcher.register((payload) => {

        switch (payload.action) {

            case MissionConstants.RECEIVED_APP_STATE:
                let appState = payload.appState;
                break;

        }
    })
});