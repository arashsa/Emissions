// This example can be modified to act as a countdown timer


const React = require('react'),
    printf = require('printf');

function pad(num) {
    return printf('%02d', num);
}


const Timer = React.createClass({

    propTypes: {
        timeInSeconds: React.PropTypes.number.isRequired
    },

    componentDidUpdate() {
        //console.log('Timer.componentDidUpdate');
    },

    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.timeInSeconds !== this.props.timeInSeconds;
    },

    _minutes() {
        return pad(Math.max(0, this.props.timeInSeconds) / 60 >> 0);
    },

    _seconds() {
        return pad(Math.max(0, this.props.timeInSeconds) % 60);
    },

    _timeValue() {
        return this._minutes() + ':' + this._seconds();
    },

    render() {
        return (
            <div className='timer-value'> {this._timeValue()}</div>
        );
    }
});

module.exports = Timer;

