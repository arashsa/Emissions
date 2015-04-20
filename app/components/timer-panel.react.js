var React = require('react'),
    actions = require('../actions/TimerActionCreators'),
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
        return nextState.timeInSeconds !== this.state.timeInSeconds;
    },

    componentDidUpdate() {
        //console.log('TimerPanel.componentDidUpdate');
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
            timeInSeconds: TimerStore.getRemainingTime(this.props.timerId)
        };
    },

    render() {
        return (
            <section className={"timer " + this.props.className }>
                <div className="row">

                    <div className='timer--button col-xs-5 '>
                        <button
                            className={ 'btn btn-primary ' + (this.state.ready ? '' : 'disabled' ) }
                            onClick={this._handleClick}>Start klokka
                        </button>
                    </div>
                    <div className='timer--value col-xs-6 padding-xs-1'>
                        <Timer timeInSeconds={this.state.timeInSeconds}/>
                    </div>
                </div>
            </section>
        );
    }
})