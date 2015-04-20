const React = require('react');
const HeartRateChart = require('./heart-rate-chart.react');
const BreathRateChart = require('./breath-rate-chart.react');
const TimerPanel = require('./timer-panel.react');
const TimerActionCreators = require('../actions/TimerActionCreators');
const OxygenStore = require('../stores/oxygen-store');

TimerActionCreators.setTimer('breath-timer', 15);
TimerActionCreators.setTimer('heart-timer', 10);

module.exports = React.createClass({

    statics: {},

    propTypes: {},

    mixins: [],

    getInitialState() {
        return this._getState();
    },
    componentWillMount() {
        OxygenStore.addChangeListener(() => this._updateState());
    },

    componentWillUnmount() {
    },

    _indicatorColor(){
        return this.state.oxygenStore.colorIndicator;
    },

    _updateState() {
        this.setState(this._getState())
    },

    _getState(){
        return {
            oxygenStore: OxygenStore.getState()
        };
    },

    render() {

        return ( <div >

            <div className="row">

                <ul>
                    <li>
                        Luftstatus:
                        <div
                            className="circle "
                            style={ { display: 'inline-block', backgroundColor : this._indicatorColor() } }
                            >
                        </div>
                    </li>
                    <li>Forbruk : { this.state.oxygenStore.consumptionPerMinute }</li>
                    <li>Gjenstående oksygen: { this.state.oxygenStore.remaining} enheter</li>
                </ul>

            </div>
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

