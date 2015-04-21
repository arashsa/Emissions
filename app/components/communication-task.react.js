const React = require('react');
const OxygenStore = require('../stores/oxygen-store');
const { parseNumber } = require('../utils');

// lazy load due to avoid circular dependencies
function lazyRequire(path) {
    let tmp = null;
    return ()=> {
        if (!tmp) tmp = require(path);
        return tmp;
    }
}
const getMissionAC = lazyRequire('../actions/MissionActionCreators');

// for browserify to work it needs to find these magic strings
if(false){
    require('../actions/MissionActionCreators');
}

module.exports = React.createClass({

    statics: {},

    propTypes: {},

    mixins: [],

    getInitialState() {
        return this._getState();
    },
    componentWillMount() {
        OxygenStore.addChangeListener(() => this._updateState());
    },

    componentWillUnmount() {
    },

    _getState(){
        return {
            oxygenStore: OxygenStore.getState()
        };
    },

    render() {

        return ( <div >

            <div className="row">
                COMMUNICATION
            </div>

        </div> );
    }

});

