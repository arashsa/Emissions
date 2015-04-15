const React = require('react'),
    TimerStore = require('../stores/timer-store'),
    Timer = require('./timer.react'),
    constants = require('../constants'),
    ID = constants.MISSION_TIMER_ID;


const MissionTimer = React.createClass({

    getInitialState(){
        return { elapsed : TimerStore.getElapsedMissionTime() };
    },
    
    componentDidMount: function () {
        TimerStore.addChangeListener(this._handleTimeChange);
    },

    componentWillUnmount: function () {
        TimerStore.removeChangeListener(this._handleTimeChange);
    },

    _handleTimeChange() {
        this.setState({
            elapsed : TimerStore.getElapsedMissionTime()
        })
    },

    render() {
        return (<div className={this.props.className}>
            <Timer timerId={ID} timeInSeconds={this.state.elapsed } />
        </div>
        );
    }
});

module.exports = MissionTimer;

