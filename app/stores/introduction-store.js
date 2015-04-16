/* Holds the state of whether introductions have been read */

const AppDispatcher = require('../appdispatcher');
const BaseStore = require('./base-store');
const constants = require('../constants/MissionConstants');
const window = require('global/window');

const IntroductionStore = Object.assign(new BaseStore(), {

    setIntroductionRead(team) {
        // sticky - even after reload
        window.sessionStorage.setItem('intro_'+team, true)

        this.emitChange();
    },

    isIntroductionRead(team) {
        // sessionStorage can only store strings
        return window.sessionStorage.getItem('intro_'+team) === 'true';
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
