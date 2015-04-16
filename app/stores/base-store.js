const EventEmitter = require('events');
const  CHANGE_EVENT= 'CHANGE_EVENT';

var path = null;

class BaseStore extends EventEmitter {

    emitChange() {
        this.emit(CHANGE_EVENT);
    }

    /**
     * @param {function} callback
     * @returns emitter, so calls can be chained.
     */
    addChangeListener(callback) {
        return this.on(CHANGE_EVENT, callback);
    }

    /**
     * @param {function} callback
     * @returns emitter, so calls can be chained.
     */
    removeChangeListener(callback) {
        return this.removeListener(CHANGE_EVENT, callback);
    }

    dispatcherIndex:Number;
}

module.exports = BaseStore;
