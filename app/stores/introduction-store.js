/* Holds the state of whether introductions have been read */

const AppDispatcher = require('../appdispatcher');
const BaseStore = require('./base-store');
const constants = require('../constants/MissionConstants');
const window = require('global/window');
var introRead = {};

const IntroductionStore = Object.assign(new BaseStore(), {

    setIntroductionRead(team) {
        introRead['intro_'+team] = true;
        this.emitChange();
    },

    isIntroductionRead(team) {
        if(!team) { throw new Error('Missing argument "team"'); }

        return introRead['intro_'+team];
    },


    dispatcherIndex: AppDispatcher.register(function (payload) {
        var action = payload.action;

        switch (action) {
            case constants.INTRODUCTION_READ:
                IntroductionStore.setIntroductionRead(payload.teamName);
                break;
        }

        return true; // No errors. Needed by promise in Dispatcher.
    })

});

window.__IntroductionStore= IntroductionStore;
module.exports = IntroductionStore;
