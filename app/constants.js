const constants = {
    // events
    ROUTE_CHANGED_EVENT: 'ROUTE_CHANGED_EVENT',
    CHANGE_EVENT: 'CHANGE_EVENT',
    MISSION_STARTED_EVENT: 'MISSION_STARTED_EVENT',
    MISSION_STOPPED_EVENT: 'MISSION_STOPPED_EVENT',
    REMAINING_MISSION_TIME_CHANGED: 'REMAINING_MISSION_TIME_CHANGED',
    MISSION_TIMEOUT: 'MISSION_TIMEOUT',
    MESSAGE_ADDED: 'MESSAGE_ADDED',
    REMOVE_MESSAGE: 'REMOVE_MESSAGE',
    ROUTER_AVAILABLE: 'ROUTER_AVAILABLE',
    INTRODUCTION_READ : 'INTRODUCTION_READ',

    SCIENCE_COUNTDOWN_TIMER_CHANGED: 'SCIENCE_COUNTDOWN_TIMER_CHANGED',
    SCIENCE_TAKE_RADIATION_SAMPLE : 'SCIENCE_TAKE_RADIATION_SAMPLE',
    SCIENCE_SET_RADIATION_LEVEL : 'SCIENCE_SET_RADIATION_LEVEL',
    SCIENCE_TOTAL_RADIATION_LEVEL_CHANGED : 'SCIENCE_TOTAL_RADIATION_LEVEL_CHANGED',

    SET_TIMER: 'SET_TIMER',
    START_TIMER: 'START_TIMER',
    STOP_TIMER: 'STOP_TIMER',
    RESET_TIMER: 'RESET_TIMER',
    // message ids
    NOT_READY_MSG: 'NOT_READY_MSG',
    // other
    MISSION_TIMER_ID: 'MISSION_TIMER',
    SCIENCE_TIMER_1: 'SCIENCE_TIMER_1',

    // values
    SCIENCE_TOTAL_RADIATION_THRESHOLD : 200,
};

// prevent new properties from being added or removed
Object.freeze(constants);

window.__constants = constants;
module.exports = constants;