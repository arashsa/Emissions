const Dispatcher = require('../appdispatcher');
const MConstants = require('../constants/MissionConstants');
const AstConstants = require('../constants/AstroTeamConstants');
const BaseStore = require('./base-store');

var current = AstConstants.LOW_RESP_RATE;

const BreathRateStore = module.exports = Object.assign(new BaseStore, {

    getState(){
        if (current == AstConstants.LOW_RESP_RATE) {
            return {rate: current, low: 23, high: 28};
        } else {
            return {rate: current, low: 45, high: 55}
        }
    },

    dispatcherIndex: Dispatcher.register((payload) => {

        switch (payload.action) {

        }

        return true;
    })
});
