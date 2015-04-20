const React = require('react');
const HeartRateChart = require('./heart-rate-chart.react');
const BreathRateChart = require('./breath-rate-chart.react');
const TimerPanel = require('./timer-panel.react');
const TimerActionCreators = require('../actions/TimerActionCreators');

TimerActionCreators.setTimer('breath-timer', 15);
TimerActionCreators.setTimer('heart-timer', 10);

module.exports = React.createClass({

    statics: {},

    propTypes: {},

    mixins: [],

    getInitialState() {
        return {}
    },

    getDefaultProps() {
        return {};
    },

    componentWillMount() {
    },

    componentWillReceiveProps() {
    },

    componentWillUnmount() {
    },

    render() {

        return ( <div >

            <div className="row">


                <div className='col-md-6'>
                    <h2>Pust</h2>
                    <BreathRateChart height={240}/>
                </div>

                <div className='col-md-6'>
                    <h2>Hjerteslag</h2>
                    <HeartRateChart height={240}/>
                </div>

                <TimerPanel timerId='breath-timer' className='col-md-6'/>
                <TimerPanel timerId='heart-timer' className='col-md-6'/>

            </div>

        </div> );
    }

});

