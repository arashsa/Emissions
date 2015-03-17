/* A store that can be queried for the current path */

const { Emitter } = require('events');
const AppDispatcher = require('../appdispatcher');
const BaseStore = require('./base-store');
const { REMOVE_MESSAGE, MESSAGE_ADDED } = require('../constants');
var messages = {};


var MessageStore = Object.assign(new BaseStore(), {

    reset() {
        messages = {};
        this.emitChange();
    },

    handleAddedMessage(data) {
        data.dismissable = data.dismissable === undefined ? true : data.dismissable;
        messages[data.id] = data;
        this.emitChange();
    },

    handleRemoveMessage(id) {
        delete messages[id];
        this.emitChange();
    },

    /**
     * A list of all messages matching filter
     * @param [filter]
     * @returns []Message a Message = { text, id, level }
     */
    getMessages(filter) {
        if (!filter) {
            return Object.keys(messages).map((msgKey)=>  messages[msgKey]);
        }
        else throw new Error('UNIMPLEMENTED "filter" feature');
    },

    dispatcherIndex: AppDispatcher.register(function (payload) {
        var { action, data } = payload;

        switch (action) {
            case MESSAGE_ADDED:
                console.log('fikk melding',data)
                MessageStore.handleAddedMessage(data);
                break;
            case REMOVE_MESSAGE:
                MessageStore.handleRemoveMessage(data);
        }

        return true; // No errors. Needed by promise in Dispatcher.
    })

});

window.__MessageStore = MessageStore;
module.exports = MessageStore;
