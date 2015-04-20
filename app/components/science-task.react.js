const React = require('react');
const TimerPanel = require('./timer-panel.react');
const RadiationChart = require('./radiation-chart.react.js');
const RadiationSampleButton = require('./radiation-sampler.react');
const Overlay = require('./overlay.react');
const RadiationTable = require('./radiation-table.react');
const RadiationStore = require('../stores/radiation-store');
const actions = require('../actions/ScienceActionCreators');
const utils = require('../utils');
const ScienceTeamConstants = require('../constants/ScienceTeamConstants');
const TimerActionCreators = require('../actions/TimerActionCreators');


// SETTINGS
TimerActionCreators.setTimer(ScienceTeamConstants.SCIENCE_TIMER_1, 30);

module.exports = React.createClass({

    statics: {},
    propTypes: {
        appstate: React.PropTypes.object.isRequired
    },
    mixins: [],

    // life cycle methods
    getInitialState() {
        return {
            radiation: RadiationStore.getState()
        }
    },

    getDefaultProps() {
        return {};
    },

    componentWillMount() {
        RadiationStore.addChangeListener(this._handleRadiationChange);
    },

    componentWillReceiveProps() {
    },

    componentWillUnmount() {
        RadiationStore.removeChangeListener(this._handleRadiationChange);
    },

    // Private methods

    _handleRadiationChange() {
        this.setState({
            radiation: RadiationStore.getState()
        })
    },

    _handleAverageRadiationSubmit(e) {
        let el = React.findDOMNode(this.refs['average-input']),
            val = el.value.trim();

        e.preventDefault();

        if (!val.length) return;

        let average = utils.parseNumber(val);
        el.value = '';

        if (average) {
            actions.averageRadiationCalculated(average);
        }
    },

    _handleAddToTotalSubmit(e){
        e.preventDefault();

        let el = React.findDOMNode(this.refs['add-to-total']);
        let val = el.value.trim();
        if (!val.length) return;

        let number = utils.parseNumber(val);

        if (!isNaN(number)) {
            actions.addToTotalRadiationLevel(number);
        }
    },


    /*
     * Helper
     * @param {string} taskName name
     * @returns {boolean} true if the current task id equals the name passed in
     */
    _isCurrentTask(taskName){
        return this.props.appstate.taskStore.currentTaskId === taskName;
    },

    _radiationStatus(){
        var num = this.state.radiation.lastCalculatedAverage,
            color;

        if (num === null) {
            return 'Ikke beregnet';
        }

        if (num > ScienceTeamConstants.SCIENCE_AVG_RAD_RED_VALUE) {
            color = 'red';
        } else if (num > ScienceTeamConstants.SCIENCE_AVG_RAD_ORANGE_VALUE) {
            color = 'orange';
        } else {
            color = 'green';
        }


        return (<div
            className="radiation-indicator circle col-xs-2"
            style={ { 'backgroundColor' : color } }
            >
            {num }
        </div>);

    },

    render() {
        let showSampleInput = this._isCurrentTask('sample'),
            showAverageInput = this._isCurrentTask('average'),
            showAddToTotalInput = this._isCurrentTask('addtotal');

        return (
            <div >
                <div className='row'>

                    <dl className='radiation-values col-xs-6 '>
                        <dt>Totalt strålingsnivå</dt>
                        <dd>{this.state.radiation.total}</dd>
                        <dt>Sist innlest strålingsnivå</dt>
                        <dd>{ this._radiationStatus()} </dd>
                    </dl>

                    <RadiationTable
                        minimalRowsToShow={4}
                        samples={this.state.radiation.samples}
                        className='col-xs-6 '/>
                </div>

                <hr/>

                <div className="instruments">

                    <fieldset disabled={!showSampleInput} className='instruments__section row overlayable'>
                        <Overlay active={ !showSampleInput }/>

                        <h3 className='col-xs-12'>Ta prøver</h3>
                        <TimerPanel className='col-xs-12 col-sm-8' timerId={ScienceTeamConstants.SCIENCE_TIMER_1}/>

                        <RadiationSampleButton
                            className='col-xs-5 col-sm-4'
                            radiationStoreState={this.state.radiation}
                            requiredSamples={4}
                            />
                    </fieldset>

                    <hr />

                    <div className="row overlayable">
                        <Overlay active={ !showAverageInput }/>

                        <section className="radiation-input instruments__section col-xs-12 col-sm-6">


                            <div className="row">
                                <h3 className='col-xs-12'>Gjennomsnittlig stråling</h3>

                                <fieldset className="col-xs-8" disabled={ !showAverageInput }>
                                    <form onSubmit={this._handleAverageRadiationSubmit}>
                                        <input ref='average-input'
                                               type="number"
                                               step="0.1"
                                               min="1"
                                               max="100"
                                               className='radiation-input__input'
                                            />
                                        <button className='btn btn-primary'>Evaluer</button>
                                    </form>
                                </fieldset>
                            </div>
                        </section>
                    </div>

                    <hr/>
                    <div className="row overlayable">
                        <Overlay active={ !showAddToTotalInput }/>
                        <fieldset className='radiation-input col-xs-8' disabled={! showAddToTotalInput }>
                            <h3>Legg verdi til total</h3>

                            <form onSubmit={this._handleAddToTotalSubmit}>
                                <select ref='add-to-total' className='radiation-input__input'>
                                    <option value='0'>0</option>
                                    <option value='15'>15</option>
                                    <option value='50'>50</option>
                                </select>
                                <button className='btn btn-primary'>Evaluer</button>
                            </form>
                        </fieldset>
                    </div>

                </div>
            </div>
        );
    }

});
