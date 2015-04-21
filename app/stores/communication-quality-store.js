const AppDispatcher = require('../appdispatcher');
const MissionConstants = require('../constants/MissionConstants');
const BaseStore = require('./base-store');
var qualityShouldFail = true;
var transferShouldFail = true;

var CommunicationQualityStore = module.exports = Object.assign(new BaseStore(),{

    qualityTestShouldFail() {
        return qualityShouldFail;
    },

    transferTestShould(){
        return transferShouldFail;
    },

    dispatcherIndex: AppDispatcher.register((payload)=> {

        if (payload.action === MissionConstants.RECEIVED_APP_STATE) {
            qualityShouldFail = payload.appState.quality_test_should_fail;
            transferShouldFail = payload.appState.transfer_test_should_fail;
            CommunicationQualityStore.emitChange();
        }
    })
});