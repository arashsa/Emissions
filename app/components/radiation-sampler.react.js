const React = require('react'),
    TimerStore = require('../stores/timer-store'),
    actions = require('../actions'),
    constants = require('../constants');

var RadiationSampler = React.createClass({

    componentWillMount() {
        TimerStore.addChangeListener(this._handleTimerChange);
    },


    componentWillUnmount(){
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


    _handleTimerChange() {
        var  audio = React.findDOMNode(this.refs.geigerSound);
        var timerActive = TimerStore.isRunning(constants.SCIENCE_TIMER_1);

        this.setState({timerActive: timerActive});

        if(timerActive && audio.paused) {
            audio.play();
        } else if(!timerActive && !audio.paused) {
            audio.pause();
        }
    },

    _handleClick() {
        if (this.props.radiation.samples.length >= 4) {
            actions.stopTimer(constants.SCIENCE_TIMER_1);
        } else {
            actions.takeRadiationSample();
        }
    },

    render() {
        var disabled, classes;

        classes = 'btn btn-default ';

        if(this._isDisabled()) {
            classes += 'disabled';
        }

        return (
            <div className="radiation-sampler row">

                <audio ref="geigerSound" loop>
                    <source src="/sounds/AOS04595_Electric_Geiger_Counter_Fast.wav" type="audio/wav" />
                    Your browser does not support the element.
                </audio>

                <div className="col-xs-6">
                    <button
                        className={classes}
                        onClick={this._handleClick}
                    >Ta strålingsprøve</button>
                </div>
                <ul className="col-xs-6 radiation-sampler--samples">
                {this.props.radiation.samples.map((val, i) => <li key={i} >{val}</li>)}
                </ul>
            </div>
        );
    }

});

module.exports = RadiationSampler;