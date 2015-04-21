const AppDispatcher = require('../appdispatcher');
const MissionConstants = require('../constants/MissionConstants');
var shouldFail = true;

module.exports = {

    qualityTestShouldFail() {
        return shouldFail;
    },

    dispatcherIndex: AppDispatcher.register((payload)=> {

        if(payload.action === MissionConstants.RECEIVED_APP_STATE) {
            shouldFail = payload.appState.quality_test_should_fail;
        }
    })
};