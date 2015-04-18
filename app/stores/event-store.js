const Dispatcher = require('../appdispatcher');
const MConstants = require('../constants/MissionConstants');
const BaseStore = require('./base-store');

var eventsCollection = {
    remaining: [],
    completed: [],
    overdue: []
};

const EventStore = module.exports = window.__eventStore = Object.assign(new BaseStore, {

    remaining() { return eventsCollection.remaining; },

    completed() { return eventsCollection.completed; },

    overdue() { return eventsCollection.overdue; },

    dispatcherIndex: Dispatcher.register((payload) => {

        switch(payload.action){

            case MConstants.RECEIVED_EVENTS:
                eventsCollection.remaining = payload.remaining;
                eventsCollection.overdue = payload.overdue;
                eventsCollection.completed = payload.completed;
                EventStore.emitChange();

                break;
        }

        return true;
    })
});


//window.__eventStore = module.exports;
