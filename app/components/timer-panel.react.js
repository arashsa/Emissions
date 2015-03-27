var React = require('react'),
    actions = require('../actions'),
    Timer = require('./timer.react.js'),
    TimerStore = require('../stores/timer-store');

module.exports = React.createClass({

    propTypes: {
        timerId: React.PropTypes.string.isRequired
    },

    getInitialState() {
        return this._getTimerState();
    },

    componentDidMount: function () {
        TimerStore.addChangeListener(this._handleTimeStoreChange);
    },

    componentWillUnmount: function () {
        TimerStore.removeChangeListener(this._handleTimeStoreChange);
    },

    shouldComponentUpdate(nextProps, nextState) {
        return nextState.remainingTime !== this.state.remainingTime;
    },

    componentDidUpdate() {
        console.log('TimerPanel.componentDidUpdate');
    },

    _handleTimeStoreChange() {
        this.setState(this._getTimerState());
    },

    _handleClick() {
        actions.startTimer(this.props.timerId);
    },

    _getTimerState() {
        return {
            ready: TimerStore.isReadyToStart(this.props.timerId),
            remainingTime: TimerStore.getRemainingTime(this.props.timerId)
        };
    },

    render() {
        return (
            <div className="timer row">
                <div className='timer--button col-xs-6 '>
                    <button
                        className={ 'btn btn-default ' + (this.state.ready ? '' : 'disabled' ) }
                        onClick={this._handleClick}>Start klokka</button>
                </div>
                <div className='timer--value col-xs-6' >
                    <Timer remainingTime={this.state.remainingTime}  />
                </div>
            </div>
        );
    }
})