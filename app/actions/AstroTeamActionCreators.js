const Dispatcher = require('../appdispatcher');
const MConstants = require('../constants/MissionConstants');
const AstConstants = require('../constants/AstroTeamConstants');
const MessageActionCreators = require('./MessageActionCreators');
const utils = require('../utils');

// lazy load due to avoid circular dependencies
function lazyRequire(path) {
    let tmp = null;
    return ()=> {
        if (!tmp) tmp = require(path);
        return tmp;
    }
}
const getServerAPI = lazyRequire('../client-api');
const getMissionAC = lazyRequire('./MissionActionCreators');
// for browserify to work it needs to find these magic strings
require('./MissionActionCreators');
require('../client-api');
const TimerActionCreators = require('./TimerActionCreators');

window.__astActions = module.exports = {

    /* in units per minute */
    setOxygenConsumption(units) {
        getServerAPI().setOxygenConsumption(units);
    },

    heartRateRead(rate){
        var text, level;
        if (rate < 90) {
            level = 'info';
            text = 'Fine verdier';
        } else if (rate > 120) {
            text = 'Veldig høye verdier!';
            level = 'danger';
        } else {
            text = 'Ganske høy hjerterytme. Grunn til bekymring?';
            level = 'warning';
        }

        MessageActionCreators.addMessage({text, level, duration: 20});
    },

    startMonitorTask(){

        TimerActionCreators.resetTimer(AstConstants.HEART_RATE_TIMER);
        TimerActionCreators.resetTimer(AstConstants.RESPIRATION_TIMER);
        getMissionAC().startTask('astronaut', 'breathing_timer')
    }

};
