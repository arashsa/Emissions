const Dispatcher = require('../appdispatcher');
const MConstants = require('../constants/MissionConstants');
const AstConstants = require('../constants/AstroTeamConstants');
const BaseStore = require('./base-store');

var current = AstConstants.LOW_RESP_RATE;

const BreathRateStore = module.exports = Object.assign(new BaseStore, {

    getState(){
        if (current == AstConstants.LOW_RESP_RATE) {
            return {rate: current, min: 23, max: 28};
        } else {
            return {rate: current, min: 45, max: 55}
        }
    },

    dispatcherIndex: Dispatcher.register((payload) => {

        switch (payload.action) {
            case MConstants.RECEIVED_APP_STATE:
                var appState = payload.appState;

                if(appState.breath_rate === 'high') {
                    current = AstConstants.HIGH_RESP_RATE;
                } else {
                    current = AstConstants.LOW_RESP_RATE;
                }

                BreathRateStore.emitChange();
                break;
        }

        return true;
    })
});
