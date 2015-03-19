const React = require('react'),
    TimerStore = require('../stores/timer-store'),
    Timer = require('./timer.react'),
    constants = require('../constants');


const MissionTimer = React.createClass({

    render() {
        return (<div className={this.props.className}>
            <span>Gjenværende tid: </span>
            <Timer timerId={constants.MISSION_TIMER_ID} />
        </div>
        );
    }
});

module.exports = MissionTimer;

