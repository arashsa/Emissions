const Dispatcher = require('../appdispatcher');
const MConstants = require('../constants/MissionConstants');
const AstConstants = require('../constants/AstroTeamConstants');

window.__astActions = module.exports = {

    /** @param rate {string} low or high (constant) */
        setBreathRate(rate){
        Dispatcher.dispatch({action: AstConstants.SET_BREATH_RATE, rate})
    },

    setHeartRate(min, max){
        Dispatcher.dispatch({action: AstConstants.SET_HEART_RATE, rate : {min,max}})
    },

    /**
     * @param level the level to set it to
     */
        setOxygenLevel(level){
        Dispatcher.dispatch({action: AstConstants.SET_OXYGEN_LEVEL, rate})
    },

    /* in units per minute */
    setOxygenConsumption(units) {
        Dispatcher.dispatch({action: AstConstants.SET_OXYGEN_CONSUMPTION, units})
    }


};
