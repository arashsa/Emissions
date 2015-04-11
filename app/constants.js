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
    SCIENCE_RADIATION_LEVEL_CHANGED : 'SCIENCE_RADIATION_LEVEL_CHANGED',
    SCIENCE_TOTAL_RADIATION_LEVEL_CHANGED : 'SCIENCE_TOTAL_RADIATION_LEVEL_CHANGED',
    SCIENCE_AVG_RADIATION_CALCULATED: 'SCIENCE_AVG_RADIATION_CALCULATED',

    SET_TIMER: 'SET_TIMER',
    START_TIMER: 'START_TIMER',
    STOP_TIMER: 'STOP_TIMER',
    RESET_TIMER: 'RESET_TIMER',
    // message ids
    NOT_READY_MSG: 'NOT_READY_MSG',
    SCIENCE_RADIATION_WARNING_MSG : 'SCIENCE_RADIATION_WARNING_MSG',
    // other
    MISSION_TIMER_ID: 'MISSION_TIMER',
    SCIENCE_TIMER_1: 'SCIENCE_TIMER_1',

    // values
    SCIENCE_RADIATION_MIN : 0,
    SCIENCE_RADIATION_MAX : 300,
    SCIENCE_AVG_RAD_GREEN_VALUE: 0,
    SCIENCE_AVG_RAD_ORANGE_VALUE: 15,
    SCIENCE_AVG_RAD_RED_VALUE: 50,
    SCIENCE_AVG_RAD_ORANGE_THRESHOLD: 40,
    SCIENCE_AVG_RAD_RED_THRESHOLD: 75,
    SCIENCE_TOTAL_RADIATION_SERIOUS_THRESHOLD: 50,
    SCIENCE_TOTAL_RADIATION_VERY_SERIOUS_THRESHOLD: 75
};

// prevent new properties from being added or removed
Object.freeze(constants);

window.__constants = constants;
module.exports = constants;