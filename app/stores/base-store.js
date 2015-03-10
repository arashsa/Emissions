const EventEmitter = require('events');
const { CHANGE_EVENT } = require('../constants');

var path = null;

class BaseStore extends EventEmitter {

    emitChange() {
        this.emit(CHANGE_EVENT);
    }

    /**
     * @param {function} callback
     */
    addChangeListener(callback) {
        this.on(CHANGE_EVENT, callback);
    }

    /**
     * @param {function} callback
     */
    removeChangeListener(callback) {
        this.removeListener(CHANGE_EVENT, callback);
    }

    dispatcherIndex:Number;
}

module.exports = BaseStore;
