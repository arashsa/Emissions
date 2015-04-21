const keyMirror = require('react/lib/keyMirror');

module.exports = keyMirror({
    MISSION_STARTED : null,
    MISSION_STOPPED : null,
    MISSION_RESET : null,
    MISSION_COMPLETED : null,
    APP_STATE : null,

    ADD_MESSAGE : null,

    //ACTIONS
    GET_EVENTS : null,
    SET_EVENTS : null,
    TRIGGER_EVENT : null,
    ADVANCE_CHAPTER : null,
    COMPLETE_MISSION : null,

    // SCIENCE TEAM EVENTS
    SCIENCE_CHECK_RADIATION : null,

    // ASTRONAUT TEAM EVENTS
    AST_CHECK_VITALS : null,

    // COMMUNICATION TEAM EVENTS
    COMM_INFORM_ASTRONAUT : null,
    COMM_CHECK_SAT_LINK: null,


    // SECURITY TEAM EVENTS
});
