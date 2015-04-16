const AppDispatcher = require('../appdispatcher'),
    uuid = require('./../utils').uuid,
    constants = require('../constants/MessageConstants');

const actions = {


    /**
     * @param msg.text the message
     * @param [msg.id] the message id. if not given, one will be created
     * @param [msg.level] same as bootstrap's alert classes: [success, info, warning, danger]
     * @param [msg.duration] {Number} optional duration for transient messages
     *
     * @returns {string} the message id
     */
    addMessage(msg) {
        var id = msg.id;

        if (!id) {
            id = uuid();
            msg.id = id;
        }

        if (!msg.level) {
            msg.level = 'success';
        }

        AppDispatcher.dispatch({
                action: constants.MESSAGE_ADDED,
                data: msg
            }
        );

        if (msg.duration) {
            setTimeout(() => actions.removeMessage(msg.id), msg.duration * 1000)
        }

        return id;
    },

    /**
     * msg with default duration of 5 seconds
     * @param msg
     * @param [duration] default of 5 seconds
     *
     * @see #addMessage() for more params
     * @returns {string} the message id
     */
    addTransientMessage(msg, duration = 5) {
        return actions.addMessage(Object.assign({duration}, msg))
    },

    removeMessage(id) {
        AppDispatcher.dispatch({
                action: constants.REMOVE_MESSAGE,
                data: id
            }
        );
    }

};

// prevent new properties from being added or removed
Object.freeze(actions);
window.__MessageActions = actions;
module.exports = actions;