const React = require('react'),
    TimerStore = require('../stores/timer-store'),
    RadiationStore = require('../stores/radiation-store'),
    actions = require('../actions'),
    constants = require('../constants');

var RadiationSampler = React.createClass({

    componentWillMount() {
        RadiationStore.addChangeListener(this._handleRadiationChange);
        TimerStore.addChangeListener(this._handleTimerChange);
    },


    componentWillUnmount(){
        RadiationStore.removeChangeListener(this._handleRadiationChange);
        TimerStore.removeChangeListener(this._handleTimerChange);
    },

    getInitialState() {
        return {
            samples: [],
            timerActive: false
        }
    },

    _isDisabled() {
        return !this.state.timerActive
    },

    _handleRadiationChange(){
        this.setState({samples: RadiationStore.getSamples()})
    },

    _handleTimerChange() {
        this.setState({timerActive: TimerStore.isRunning(constants.SCIENCE_TIMER_1)});
    },

    _handleClick() {
        if (this.state.samples.length >= 5) {
            actions.stopTimer(constants.SCIENCE_TIMER_1);
        } else {
            actions.takeRadiationSample();
        }
    },

    render() {
        return (<div className="radiation-sampler row">
            <div className="col-xs-6">
                <button
                    className={'btn btn-default ' + (this._isDisabled() ? 'disabled' : '') }
                    onClick={this._handleClick}
                >Ta strålingsprøve</button>
            </div>
            <ul className="col-xs-6 radiation-sampler--samples">
                {this.state.samples.map((val, i) => <li key={i} >{val}</li>)}
            </ul>
        </div>
        );
    }

});

module.exports = RadiationSampler;