const React = require('react');
const HeartRateChart = require('./heart-rate-chart.react');
const BreathRateChart = require('./breath-rate-chart.react');
const TimerPanel = require('./timer-panel.react');
const TimerActionCreators = require('../actions/TimerActionCreators');
const OxygenStore = require('../stores/oxygen-store');
const AstronautConstants = require('../constants/AstroTeamConstants');
const AstronautActionCreators = require('../actions/AstroTeamActionCreators');
const { parseNumber } = require('../utils');

TimerActionCreators.setTimer(AstronautConstants.RESPIRATION_TIMER, 15);
TimerActionCreators.setTimer(AstronautConstants.HEART_RATE_TIMER, 10);

// lazy load due to avoid circular dependencies
function lazyRequire(path) {
    let tmp = null;
    return ()=> {
        if (!tmp) tmp = require(path);
        return tmp;
    }
}
const getMissionAC = lazyRequire('../actions/MissionActionCreators');
// for browserify to work it needs to find these magic strings
if (false) {
    require('../actions/MissionActionCreators');
}

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

    _handleBreathRate(e){
        e.preventDefault();
        var el = React.findDOMNode(this.refs['breath-rate']);
        AstronautActionCreators.setOxygenConsumption(parseNumber(el.value))
        getMissionAC().taskCompleted('astronaut', 'breathing_calculate')
    },

    _handleHeartRate(e){
        e.preventDefault();
        var el = React.findDOMNode(this.refs['heart-rate-input']);
        AstronautActionCreators.heartRateRead(parseNumber(el.value));
        getMissionAC().taskCompleted('astronaut', 'heartrate_calculate')
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

                <TimerPanel timerId={AstronautConstants.RESPIRATION_TIMER} className='col-md-6'/>
                <TimerPanel timerId={AstronautConstants.HEART_RATE_TIMER} className='col-md-6'/>

            </div>

            <div className="row">

                <div className="col-xs-6">
                    <fieldset disabled={ false }>
                        <h3>Beregnet luftforbruk</h3>

                        <form onSubmit={this._handleBreathRate}>
                            <select ref='breath-rate'>
                                <option value={1}>1 enhet per minutt</option>
                                <option value={2}>2 enheter per minutt</option>
                            </select>
                            <button className='btn btn-primary'>Evaluer</button>
                        </form>
                    </fieldset>
                </div>

                <div className="col-xs-6">
                    <fieldset disabled={ false }>
                        <h3>Beregnet hjerterytme</h3>

                        <form onSubmit={this._handleHeartRate}>
                            <input ref='heart-rate-input' type="number" min="50" max="200"/>
                            <button className='btn btn-primary'>Evaluer</button>
                        </form>
                    </fieldset>
                </div>

            </div>

        </div> );
    }

});

