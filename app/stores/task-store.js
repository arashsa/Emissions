/* A store that can be queried for the current path */

const AppDispatcher = require('../appdispatcher');
const BaseStore = require('./base-store');
const RouteStore = require('./route-store');
const MissionConstants = require('../constants/MissionConstants');

var awaitingNewInstructions = {
    'text': 'Venter på nye instruksjoner ...'
};

var assignments = {
    science: {
        current: null,
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
            next: 'awaiting'
        },
        awaiting: awaitingNewInstructions
    },

    astronaut: {
        current: null,
        awaiting: awaitingNewInstructions,
        breathing_timer: {
            text: 'Start klokka, og tell antall innpust (topper) på pustegrafen.',
            next: 'breathing_calculate',
            plain_info: true
        },
        breathing_calculate: {
            text: 'Hvor mange innpust blir det på ett minutt? Bruk tallet du finner til å regne ut oksygenforbruket pr minutt. Gjennomsnittlig oksygenforbruk med 25 innpust i minuttet er 1 oksygenenhet.',
            next: 'heartrate_timer'
        },
        heartrate_timer: {
            text: 'Start klokka og tell antall hjerteslag på ti sekunder',
            next: 'heartrate_calculate',
            plain_info: true
        },
        heartrate_calculate: {
            text: 'Finn nå ut hvor mange slag det blir i minuttet. Evaluer resultatet ved å skrive det inn i tekstfeltet.',
            next: 'awaiting'
        }
    },

    security: {
        current : null,
        awaiting : awaitingNewInstructions,

        scrubber :{
            text : 'NOT SURE ABOUT THIS ONE. I THINK IT WILL BE TRIGGERED WITHOUT ANY NEED FOR INSTRUCTIONS',
            next : 'awaiting'
        },

        signal_test : {
            text : 'Sjekk om dataoverføringer lar seg gjøre. Om det går bra kan dere teste om datakvaliteten er tilfredsstillende',
            next : 'awaiting'
        }
    },

    communication : {
        current : null,
        awaiting : awaitingNewInstructions,

        comm_check : {
            text : 'Sjekk status på kommunikasjonslinken. Om signalet er svakt bør en annen satelitt velges. '
            +'Om dere velger en annen satelitt må dere også velge en frekvens fra frekvensbåndet. '
            + 'Det beste valget av frekvens er vanligvis midt i frekvensbåndet. '
        }

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
        if (!teamId.length) return null;

        return assignments[teamId].current || 'awaiting';
    },

    getState() {
        return {
            currentTaskId: this.getCurrentTaskId(),
            currentTask: this.getCurrentTask().text,
            nextTaskId: this.getCurrentTask().next,
            plainInfo: this.getCurrentTask().plain_info
        };
    },


    dispatcherIndex: AppDispatcher.register(function (payload) {
        var taskId;
        var teamId;
        var currentTask;
        var teamTasks;

        switch (payload.action) {

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

            case MissionConstants.RECEIVED_APP_STATE:
                teamId = RouteStore.getTeamId();

                var teamState = payload.appState[teamId];

                if (teamState && teamState.current_task) {
                    currentTask = teamState.current_task;
                    teamTasks = assignments[teamId];
                    teamTasks.current = currentTask;
                    TaskStore.emitChange();
                }

        }

        return true; // No errors. Needed by promise in Dispatcher.
    })

});

window.__TaskStore = TaskStore;
module.exports = TaskStore;
