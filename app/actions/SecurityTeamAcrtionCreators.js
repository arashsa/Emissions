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
        getMissionAC().startTask('security', 'tyr_v_check')
    }
};