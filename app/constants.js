var constants = {
    add(stringConstantName) {
        constants[stringConstantName] = stringConstantName;
        return this
    }
};

constants
    // events
    .add('ROUTE_CHANGED_EVENT')
    .add('CHANGE_EVENT')
    .add('MISSION_STARTED')
    .add('MISSION_STOPPED')
    .add('REMAINING_MISSION_TIME_CHANGED')
    .add('MISSION_TIMEOUT')
    .add('MESSAGE_ADDED')
    .add('REMOVE_MESSAGE')
    .add('SCIENCE_COUNTDOWN_TIMER_CHANGED')
    // message ids
    .add('NOT_READY_MSG')
    // .add('other')
    .add('MISSION_TIME_UNSET');

// remove the temporary function
delete constants.add;

// prevent new properties from being added or removed
Object.freeze(constants);

window.__constants = constants;
module.exports = constants;