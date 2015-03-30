const React = require('react');
const TimerPanel = require('./timer-panel.react');
const RadiationChart = require('./radiation.react');
const RadiationSampler = require('./radiation-sampler.react');
const RadiationStore = require('../stores/radiation-store');
const constants = require('../constants');

const ScienceTask = React.createClass({

    statics: {},
    propTypes: {},
    mixins: [],

    // life cycle methods
    getInitialState(){
        return { radiation: RadiationStore.getState() }
    },

    getDefaultProps() {
        return {};
    },

    componentWillMount() {
        RadiationStore.addChangeListener(this._handleRadiationChange);
    },

    componentWillReceiveProps() {
    },

    componentWillUnmount() {
        RadiationStore.removeChangeListener(this._handleRadiationChange);
    },

    // Private methods

    _handleRadiationChange(){
        this.setState({
            radiation: RadiationStore.getState()
        })
    },

    _parseData() {
    },
    _onSelect() {
    },

    render() {
        return (
            <div>

                <div>Totalt strålingsnivå:
                    <span>{this.state.radiation.total}</span>
                </div>

                <hr/>

                <RadiationChart
                    getNewValue={RadiationStore.getLevel}
                    updateFrequencySeconds={1}
                    maxSecondsShown={30}
                />

                <hr/>

                <TimerPanel timerId={constants.SCIENCE_TIMER_1} />
                <RadiationSampler radiation={this.state.radiation} />
                <hr/>
            </div>
        );
    }

});

module.exports = ScienceTask;