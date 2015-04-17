const React = require('react'),
    TimerStore = require('../stores/timer-store'),
    MissionActionCreators = require('../actions/MissionActionCreators'),
    TimerActionCreators = require('../actions/TimerActionCreators'),
    ScienceActionCreators = require('../actions/ScienceActionCreators'),
    constants = require('../constants/ScienceTeamConstants');

var RadiationSampler = React.createClass({

    propTypes: {
        requiredSamples: React.PropTypes.number.isRequired,
        radiationStoreState: React.PropTypes.object.isRequired
    },

    componentWillMount() {
        TimerStore.addChangeListener(this._handleTimerChange);
    },

    componentDidUpdate(){
        if (this.state.timerActive) {
            let el = React.findDOMNode(this.refs['sample-button']);
            el.focus();
        }
    },


    componentWillUnmount(){
        TimerStore.removeChangeListener(this._handleTimerChange);
    },

    getInitialState() {
        return {timerActive: false}
    },

    _isDisabled() {
        return !this.state.timerActive
    },


    _handleTimerChange() {
        var audio = React.findDOMNode(this.refs['geigerSound']);
        var timerActive = TimerStore.isRunning(constants.SCIENCE_TIMER_1);

        this.setState({timerActive: timerActive});

        if (timerActive && audio.paused) {
            audio.play();
        } else if (!timerActive && !audio.paused) {
            audio.pause();
        }
    },

    _handleClick() {
        ScienceActionCreators.takeRadiationSample();

        if (this.props.radiationStoreState.samples.length + 1 >= this.props.requiredSamples) {
            TimerActionCreators.stopTimer(constants.SCIENCE_TIMER_1);
            ScienceActionCreators.completeTask('sample');
        }
    },

    render() {
        var disabled, classes;

        classes = 'btn btn-primary';

        if (this._isDisabled()) {
            classes += ' disabled';
        }

        return (
            <section className={"radiation-sampler " + this.props.className}>

                { /* Avoid floating into previous block */ }
                <div className="radiation-sampler__padder clearfix visible-xs-block"/>

                <audio ref="geigerSound" loop>
                    <source src="/sounds/AOS04595_Electric_Geiger_Counter_Fast.wav" type="audio/wav"/>
                </audio>

                <div>
                    <button
                        ref='sample-button'
                        className={classes}
                        onClick={this._handleClick}
                        >Ta strålingsprøve
                    </button>
                </div>
            </section>
        );
    }

});

module.exports = RadiationSampler;