const React = require('react'),
    TimerStore = require('../stores/timer-store'),
    Timer = require('./timer.react');


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
        return  <Timer className={this.props.className} timeInSeconds={this.state.elapsed } />
    }
});

module.exports = MissionTimer;

