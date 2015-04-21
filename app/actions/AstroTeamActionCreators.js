const Dispatcher = require('../appdispatcher');
const MConstants = require('../constants/MissionConstants');
const AstConstants = require('../constants/AstroTeamConstants');
const MessageActionCreators = require('./MessageActionCreators');

// lazy load due to avoid circular dependencies
const serverAPI = (function () {
    var api;

    return function () {
        if (!api) {
            api = require('../client-api');
        }
        return api;
    }
})();

window.__astActions = module.exports = {

    /** @param rate {string} low or high (constant) */
        setBreathRate(rate){
        Dispatcher.dispatch({action: AstConstants.SET_BREATH_RATE, rate})
    },

    /* in units per minute */
    setOxygenConsumption(units) {
        serverAPI().setOxygenConsumption(units);
    },

    heartRateRead(rate){
        var text, level
        if(rate < 90){
            level = 'info';
            text = 'Fine verdier';
        }else if (rate > 120){
            text = 'Veldig høye verdier!';
            level = 'danger';
        } else {
            text = 'Ganske høy hjerterytme. Grunn til bekymring?';
            level = 'warning';
        }

        MessageActionCreators.addMessage({text, level, duration : 20});
    }

};
