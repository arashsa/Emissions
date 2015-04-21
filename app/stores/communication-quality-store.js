const AppDispatcher = require('../appdispatcher');
const MissionConstants = require('../constants/MissionConstants');
var qualityShouldFail = true;
var transferShouldFail = true;

module.exports = {

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
        }
    })
};