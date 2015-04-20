const Dispatcher = require('../appdispatcher');
const MConstants = require('../constants/MissionConstants');
const AstConstants = require('../constants/AstroTeamConstants');
const BaseStore = require('./base-store');

var current = { min : 60, max : 70};

const HeartRateStore = module.exports = Object.assign(new BaseStore, {

    // om vi vil backe opp verdier på server må vi bruke denne storen
    getState(){
        return current;
    },

    dispatcherIndex: Dispatcher.register((payload) => {

        switch (payload.action) {
            case AstConstants.SET_HEART_RATE:
                var rate = payload.rate;
                if (!(rate.min && rate.max)) {
                    throw new Exception("Illegal heart rate. rate : { min, max }");
                }
                current = rate;
                HeartRateStore.emitChange();
                break;
        }

        return true;
    })
});
