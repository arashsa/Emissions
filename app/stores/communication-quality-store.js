const AppDispatcher = require('../appdispatcher');
const MissionConstants = require('../constants/MissionConstants');
const BaseStore = require('./base-store');
var qualityShouldFail = true;
var transferShouldFail = true;
var _readyForSafeMode = false;

var CommunicationQualityStore = module.exports = Object.assign(new BaseStore(), {

    qualityTestShouldFail() {
        return qualityShouldFail;
    },

    transferTestShould(){
        return transferShouldFail;
    },

    readyForSafeMode(){
        return _readyForSafeMode;
    },

    dispatcherIndex: AppDispatcher.register((payload)=> {

        if (payload.action === MissionConstants.RECEIVED_APP_STATE) {
            qualityShouldFail = payload.appState.quality_test_should_fail;
            transferShouldFail = payload.appState.transfer_test_should_fail;
            _readyForSafeMode = payload.appState.ready_for_safe_mode;

            CommunicationQualityStore.emitChange();
        }
    })
});