const Dispatcher = require('../appdispatcher');
const MConstants = require('../constants/MissionConstants');
const AstConstants = require('../constants/AstroTeamConstants');
const BaseStore = require('./base-store');

var _status = AstConstants.GOOD_OXYGEN;
var consumptionPerMinute = null;
var remaining = 100;

const OxygenStore = module.exports = Object.assign(new BaseStore, {

    status(){
        return _status;
    },

    statusAsColor(){
        switch (_status) {
            case AstConstants.CRITICAL_OXYGEN:
                return 'red';
            case AstConstants.WARN_OXYGEN:
                return 'orange';
            case AstConstants.GOOD_OXYGEN:
                return 'green'
        }
    },

    getState(){
      return {
          colorIndicator : this.statusAsColor(),
          consumptionPerMinute : consumptionPerMinute,
          remaining : remaining
      }
    },

    dispatcherIndex: Dispatcher.register((payload) => {

        switch (payload.action) {

        }

        return true;
    })
});
