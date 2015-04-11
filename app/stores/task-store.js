/* A store that can be queried for the current path */

const AppDispatcher = require('../appdispatcher');
const BaseStore = require('./base-store');
const RouteStore = require('./route-store');
const constants = require('../constants');


const assignments = {
    science: {
        sample: 'Start klokka og ta fire målinger jevnt fordelt utover de 30 sekundene',
        average: 'Regn ut gjennomsnittsverdien av strålingsverdiene dere fant. Skriv den inn i tekstfeltet.',
        addtotal : 'Basert på fargen som ble indikert ved evaluering av gjennomsnittsverdien '
        +'skal vi nå legge til et tall til totalt funnet strålingsmengde.'
        +' For grønn status man legge til 0, '
        +' for oransj status man legge til 15, '
        +' for rød status man legge til 50.'
        +' Den totale strålingsverdien i kroppen skal helst ikke gå over 50, og aldri over 75!'
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
