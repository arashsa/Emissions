/* A store that can be queried for the current path */

const AppDispatcher = require('../appdispatcher');
const BaseStore = require('./base-store');
const RouteStore = require('./route-store');
const MissionConstants = require('../constants/MissionConstants');

var awaitingNewInstructions = {
    'text' : 'Venter på nye instrukser'
};

var assignments = {
    science: {
        current : null,
        default : 'sample',
        sample: {
            text: 'Start klokka og ta fire målinger jevnt fordelt utover de 30 sekundene',
            next: 'average'
        },
        average: {
            text: 'Regn ut gjennomsnittsverdien av strålingsverdiene dere fant. Skriv den inn i tekstfeltet.',
            next: 'addtotal'
        },
        addtotal: {
            text: 'Basert på fargen som ble indikert ved evaluering av gjennomsnittsverdien '
            + 'skal vi nå legge til et tall til totalt funnet strålingsmengde.'
            + ' For grønn status man legge til 0, '
            + ' for oransj status man legge til 15, '
            + ' for rød status man legge til 50.'
            + ' Den totale strålingsverdien i kroppen skal helst ikke gå over 50, og aldri over 75!',
            next : 'awaiting'
        },
        awaiting : awaitingNewInstructions
    }
};

var TaskStore = Object.assign(new BaseStore(), {

    getCurrentTask() {
        var teamId = RouteStore.getTeamId();
        var assignmentsForTeam = assignments[teamId];
        return (assignmentsForTeam && assignmentsForTeam[this.getCurrentTaskId(teamId)])
            || 'Ingen oppgave funnet';
    },

    getCurrentTaskId(teamId = RouteStore.getTeamId()) {
        if(!teamId.length) return null;

        return assignments[teamId].current || 'awaiting';
    },

    getState() {
        return {
            currentTaskId: this.getCurrentTaskId(),
            currentTask: this.getCurrentTask().text,
            nextTaskId : this.getCurrentTask().next
        };
    },



    dispatcherIndex: AppDispatcher.register(function (payload) {
        var taskId;
        var teamId;
        var currentTask;
        var teamTasks;

        switch(payload.action) {

            case MissionConstants.START_TASK:
                teamId = payload.teamId;
                taskId = payload.taskId;

                teamTasks = assignments[teamId];
                teamTasks.current = taskId;
                TaskStore.emitChange();
                break;

            case MissionConstants.COMPLETED_TASK:
                teamId = payload.teamId;
                taskId = payload.taskId;

                teamTasks = assignments[teamId];
                currentTask = teamTasks[taskId];
                teamTasks.current = currentTask.next;
                TaskStore.emitChange();
                break;

        }

        return true; // No errors. Needed by promise in Dispatcher.
    })

});

window.__TaskStore = TaskStore;
module.exports = TaskStore;
