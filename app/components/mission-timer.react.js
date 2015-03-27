const React = require('react'),
    TimerStore = require('../stores/timer-store'),
    Timer = require('./timer.react'),
    constants = require('../constants'),
    ID = constants.MISSION_TIMER_ID;


const MissionTimer = React.createClass({

    getInitialState(){
        return { remainingTime : TimerStore.getRemainingTime(ID) };
    },
    
    componentDidMount: function () {
        TimerStore.addChangeListener(this._handleTimeChange);
    },

    componentWillUnmount: function () {
        TimerStore.removeChangeListener(this._handleTimeChange);
    },

    _handleTimeChange() {
        this.setState({
            ready: TimerStore.isReadyToStart(ID),
            remainingTime : TimerStore.getRemainingTime(ID)
        })
    },

    render() {
        return (<div className={this.props.className}>
            <span>Gjenværende tid: </span>
            <Timer timerId={ID} remainingTime={this.state.remainingTime} />
        </div>
        );
    }
});

module.exports = MissionTimer;

