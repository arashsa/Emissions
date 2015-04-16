const React = require('react'),
    TimerStore = require('../stores/timer-store'),
    MissionActionCreators = require('../actions/MissionActionCreators'),
    TimerActionCreators = require('../actions/TimerActionCreators'),
    ScienceActionCreators = require('../actions/ScienceActionCreators'),
    constants = require('../constants/ScienceTeamConstants');

var RadiationSampler = React.createClass({

    componentWillMount() {
        TimerStore.addChangeListener(this._handleTimerChange);
    },


    componentWillUnmount(){
        TimerStore.removeChangeListener(this._handleTimerChange);
    },

    getInitialState() {
        return { timerActive: false }
    },

    _isDisabled() {
        return !this.state.timerActive
    },


    _handleTimerChange() {
        var  audio = React.findDOMNode(this.refs['geigerSound']);
        var timerActive = TimerStore.isRunning(constants.SCIENCE_TIMER_1);

        this.setState({timerActive: timerActive});

        if(timerActive && audio.paused) {
            audio.play();
        } else if(!timerActive && !audio.paused) {
            audio.pause();
        }
    },

    _handleClick() {
        if (this.props.radiation.samples.length < 4) {
            ScienceActionCreators.takeRadiationSample();
        } else {
            TimerActionCreators.stopTimer(constants.SCIENCE_TIMER_1);
            MissionActionCreators.transitionTo('team-task', {teamId : 'science', taskId : 'average'})
        }
    },

    render() {
        var disabled, classes;

        classes = 'btn btn-primary';

        if(this._isDisabled()) {
            classes += 'disabled';
        }

        return (
            <section className={"radiation-sampler " + this.props.className} >

                { /* Avoid floating into previous block */ }
                <div className="radiation-sampler__padder clearfix visible-xs-block"/>

                <audio ref="geigerSound" loop>
                    <source src="/sounds/AOS04595_Electric_Geiger_Counter_Fast.wav" type="audio/wav" />
                </audio>

                <div>
                    <button
                        className={classes}
                        onClick={this._handleClick}
                    >Ta strålingsprøve</button>
                </div>
            </section>
        );
    }

});

module.exports = RadiationSampler;