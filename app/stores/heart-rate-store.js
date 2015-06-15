const Dispatcher = require('../appdispatcher');
const MConstants = require('../constants/MissionConstants');
const AstConstants = require('../constants/AstroTeamConstants');
const BaseStore = require('./base-store');

var current = {min: 120, max: 130};

const HeartRateStore = module.exports = Object.assign(new BaseStore, {

    // om vi vil backe opp verdier på server må vi bruke denne storen
    getState(){
        return current;
    },

    dispatcherIndex: Dispatcher.register((payload) => {

        switch (payload.action) {
            case MConstants.RECEIVED_APP_STATE:
                var rate = payload.appState.heart_rate;
                if (rate && rate.min && rate.max) {
                    current = rate;
                    HeartRateStore.emitChange();
                }
                break;
        }

        return true;
    })
});
