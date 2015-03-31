// This example can be modified to act as a countdown timer


const React = require('react'),
    printf = require('printf');

function pad(num) {
    return printf('%02d', num);
}


const Timer = React.createClass({

    propTypes: {
        remainingTime: React.PropTypes.number.isRequired
    },

    componentDidUpdate() {
        //console.log('Timer.componentDidUpdate');
    },

    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.remainingTime !== this.props.remainingTime;
    },

    _minutes() {
        return pad(Math.max(0, this.props.remainingTime) / 60 >> 0);
    },

    _seconds() {
        return pad(Math.max(0, this.props.remainingTime) % 60);
    },

    _timeValue() {
        return this._minutes() + ':' + this._seconds();
    },

    render() {
        return (
            <div className='mission-timer-value'> {this._timeValue()}</div>
        );
    }
});

module.exports = Timer;

