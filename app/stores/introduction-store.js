/* Holds the state of whether introductions have been read */

const AppDispatcher = require('../appdispatcher');
const BaseStore = require('./base-store');
const MissionConstants= require('../constants/MissionConstants');
const RouteStore = require('./route-store');

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
            case MissionConstants.INTRODUCTION_READ:
                IntroductionStore.setIntroductionRead(payload.teamName);
                break;

            case MissionConstants.RECEIVED_APP_STATE:
                var teamId = RouteStore.getTeamId();

                var teamState = payload.appState[teamId];

                if (teamState && teamState.introduction_read ) {
                    IntroductionStore.setIntroductionRead(teamState.team);
                }
        }

        return true; // No errors. Needed by promise in Dispatcher.
    })

});

window.__IntroductionStore= IntroductionStore;
module.exports = IntroductionStore;
