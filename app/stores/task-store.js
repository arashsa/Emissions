/* A store that can be queried for the current path */

const AppDispatcher = require('../appdispatcher');
const BaseStore = require('./base-store');

const assignments = {
    science : {
        sample : 'Start klokken og ta fire målinger fordelt jevnt utover tidsintervallet'
    }
};

var currentTask = {
    science : 'sample'
};

var TaskStore = Object.assign(new BaseStore(), {

    getCurrentTask(teamId){
        return assignments[teamId][this.getCurrentTaskId(teamId)] || 'Ingen oppgave funnet';
    },

    getCurrentTaskId(teamId){
        return currentTask[teamId];
    },

    dispatcherIndex: AppDispatcher.register(function (payload) {
        var action = payload.action;

        switch (action) {
        }

        return true; // No errors. Needed by promise in Dispatcher.
    })

});

window.__TaskStore = TaskStore;
module.exports = TaskStore;
