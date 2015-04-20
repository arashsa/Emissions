const Dispatcher = require('../appdispatcher');
const MConstants = require('../constants/MissionConstants');
const AstConstants = require('../constants/AstroTeamConstants');
const BaseStore = require('./base-store');

var current;

const HeartRateStore = module.exports = Object.assign(new BaseStore, {

    // om vi vil backe opp verdier på server må vi bruke denne storen
    getState(){ },

    dispatcherIndex: Dispatcher.register((payload) => {

        switch (payload.action) {

        }

        return true;
    })
});
