const MessageActionCreators = require('../actions/MessageActionCreators');

// lazy load due to avoid circular dependencies
function lazyRequire(path) {
    let tmp = null;
    return ()=> {
        if (!tmp) tmp = require(path);
        return tmp;
    }
}
const getMissionAC = lazyRequire('./MissionActionCreators');
const getServerAPI = lazyRequire('../client-api');
// for browserify to work it needs to find these magic strings
require('./MissionActionCreators');
require('../client-api');

var actions = module.exports = {
    startDataTransferCheck(){
        getMissionAC().startTask('security', 'signal_test')
    },

    endDataQualityTest(goodOutcome){
        if (!goodOutcome) {
            MessageActionCreators.addMessage({
                text: 'Kvaliteten på kommunikasjonssignalet er for dårlig. Er reparasjonen fullført?',
                level: 'warning',
                duration: 10
            });
        } else {
            MessageActionCreators.addMessage({
                text: 'TEST OK', duration: 2, level: 'info'
            });
        }
        getMissionAC().taskCompleted('security', 'signal_test')
    },

    endDataTransferTest(goodOutcome){
        if (!goodOutcome) {
            MessageActionCreators.addMessage({
                text: 'Overføringen av data var for ustabil. Testen feilet.',
                level: 'warning',
                duration: 10
            });
            getMissionAC().taskCompleted('security', 'signal_test')
        }else {
            MessageActionCreators.addMessage({
                text: 'TEST OK', duration: 2, level: 'info'
            });
        }
    }
};

window.__SecTeamActions = actions;