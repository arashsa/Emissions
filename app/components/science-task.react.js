const React = require('react');
const TimerPanel = require('./timer-panel.react');
const RadiationChart = require('./radiation-chart.react.js');
const RadiationSampleButton = require('./radiation-sampler.react');
const RadiationTable = require('./radiation-table.react');
const RadiationStore = require('../stores/radiation-store');
const constants = require('../constants');
const actions = require('../actions');

const ScienceTask = React.createClass({

    statics: {},
    propTypes: {},
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
        e.preventDefault();

        let el = React.findDOMNode(this.refs['average-input']);
        let average = parseInt(el.value.trim(), 10);

        if (isNaN(average)) {
            actions.addTransientMessage({
                text: 'Fikk et ugyldig tall. Skriv inn et gyldig tall.',
                level: 'danger'
            })
        } else if (average) {
            actions.averageRadiationCalculated(average);
            actions.transitionTo('team-task', {teamId: 'science', taskId: 'addtotal'})
        }
    },

    render() {
        return (
            <div >
                <div className='row'>
                    <RadiationChart
                        className='col-xs-12 col-sm-6'
                        getNewValue={RadiationStore.getLevel}
                        updateFrequencySeconds={1}
                        maxSecondsShown={30}
                        height={240}
                        />

                    <dl className='radiation-values col-xs-6 col-sm-3'>
                        <dt>Totalt strålingsnivå</dt>
                        <dd>{this.state.radiation.total}</dd>
                        <dt>Sist innlest strålingsnivå</dt>
                        <dd> 65</dd>
                    </dl>


                    <RadiationTable samples={this.state.radiation.samples} className='col-xs-6 col-sm-3 '/>
                </div>

                <hr/>

                <div className="row">
                    <div>


                        <TimerPanel className='col-xs-12 col-sm-8' timerId={constants.SCIENCE_TIMER_1}/>

                        <RadiationSampleButton className='col-xs-5 col-sm-4' radiation={this.state.radiation}/>

                        <hr />

                        <section className="average-radiation-input col-xs-12 col-sm-6">

                            <div className="row">
                                <h3 className='col-xs-12'>Gjennomsnittlig stråling</h3>

                                <form className="col-xs-8" onSubmit={this._handleAverageRadiationSubmit}>
                                    <input ref='average-input'
                                           type="text"
                                           placeholder="Gjennomsnittsverdi"
                                        />
                                    <button className='btn btn-primary'>Evaluer</button>
                                </form>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        );
    }

});

module.exports = ScienceTask;