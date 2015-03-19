var React = require('react'),
    actions = require('../actions'),
    Timer = require('./timer.react.js'),
    TimerStore = require('../stores/timer-store'),
    { SCIENCE_TIMER_1 } = require('../constants');

module.exports = React.createClass({

    getInitialState() {
        return {running: false};
    },

    componentDidMount: function () {
        TimerStore.addChangeListener(() => this.setState({
            running: TimerStore.isRunning(SCIENCE_TIMER_1)
        }));
    },

    handleClick() {
        actions.startTimer(SCIENCE_TIMER_1);
    },

    render() {
        return (
            <div className="timer row">
                <div className='timer--button col-xs-6 '>
                    <button
                        className={ 'btn btn-default ' + (this.state.running ? 'disabled' : '') }
                        onClick={this.handleClick}>Start klokka</button>
                </div>
                <div className='timer--value col-xs-6' >
                    <Timer timerId={SCIENCE_TIMER_1} />
                </div>
            </div>
        );
    }
})