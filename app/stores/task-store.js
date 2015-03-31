/* A store that can be queried for the current path */

const AppDispatcher = require('../appdispatcher');
const BaseStore = require('./base-store');
const RouteStore = require('./route-store');
const constants = require('../constants');


const assignments = {
    science: {
        sample: 'Start klokka og ta fire målinger fordelt jevnt utover tidsintervallet',
        average: 'Regn ut gjennomsnittsverdien av strålingsverdiene dere fant. Skriv den inn i tekstfeltet.'
    }
};

//var currentTask = {
//    science: 'sample'
//};

var TaskStore = Object.assign(new BaseStore(), {

    getCurrentTask() {
        var teamId = RouteStore.getTeamId();
        var taskId = RouteStore.getTaskId();
        var assignmentsForTeam = assignments[teamId];

        return (assignmentsForTeam && assignmentsForTeam[taskId])
            || 'Ingen oppgave funnet';
    },

    getCurrentTaskId() {
        //var teamId = RouteStore.getTeamId();
        return RouteStore.getTaskId();
        //return currentTask[teamId];
    },

    getState() {
      return {
          currentTaskId: this.getCurrentTaskId(),
          currentTask: this.getCurrentTask()
      };
    },

    dispatcherIndex: AppDispatcher.register(function (payload) {

        return true; // No errors. Needed by promise in Dispatcher.
    })

});

window.__TaskStore = TaskStore;
module.exports = TaskStore;
