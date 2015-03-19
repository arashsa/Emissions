// This example can be modified to act as a countdown timer


const React = require('react'),
    TimerStore = require('../stores/timer-store'),
    printf = require('printf');

function pad(num) {
    return printf('%02d', num);
}


const Timer = React.createClass({

    propTypes: {
        timerId: React.PropTypes.string.isRequired
    },

    componentWillMount() {
        TimerStore.addChangeListener(this._fetchAndSetRemainingTime);
    },

    componentWillUnmount() {
        TimerStore.removeChangeListener(this._fetchAndSetRemainingTime);
    },

    _fetchAndSetRemainingTime() {
        this.setState({seconds: this._fetchRemainingTime()});
    },

    _fetchRemainingTime() {
        return TimerStore.getRemainingTime(this.props.timerId);
    },

    getInitialState() {
        return {seconds: this._fetchRemainingTime()};
    },

    minutes() {
        return pad(Math.max(0, this.state.seconds) / 60 >> 0);
    },

    seconds() {
        return pad(Math.max(0, this.state.seconds) % 60);
    },

    timeValue() {
        return this.minutes() + ':' + this.seconds();
    },

    render() {
        return (
            <span className='mission-timer-value'> {this.timeValue()}</span>
        );
    }
});

module.exports = Timer;

