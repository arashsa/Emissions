const React = require('react');
const TimerPanel = require('./timer-panel.react');
const RadiationChart = require('./radiation-chart.react.js');
const RadiationSampler = require('./radiation-sampler.react');
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
        let el = React.findDOMNode(this.refs['average-input']);
        let average = parseInt(el.value.trim(), 10);
        e.preventDefault();

        if (average) {
            actions.averageRadiationCalculated(average);
            actions.transitionTo('team-task', {teamId : 'science', taskId : 'addtotal'})
        }
    },

    _createSampleUI() {

        return (
            <div>


                <div className="row">
                    <TimerPanel timerId={constants.SCIENCE_TIMER_1} />

                    <RadiationSampler radiation={this.state.radiation} />
                </div>
                <hr/>
            </div>
        );
    },

    _averageUI() {
        var radiationTable;

        if (this.state.radiation.samples.length === 0) {
            radiationTable = 'Mangler prøver';
        } else {
            radiationTable = <RadiationTable samples={this.state.radiation.samples} className='col-xs-6' />
        }
        return (
            <div>
                <div className="row">

                    <h3>Gjennomsnittlig stråling</h3>
                    <form
                        className="col-xs-6"
                        onSubmit={this._handleAverageRadiationSubmit}
                    >
                        <button className='btn btn-primary'>Evaluer</button>
                        <input ref='average-input'
                            type="text"
                            placeholder="Gjennomsnittsverdi"
                        />
                    </form>

                {radiationTable}

                </div>
            </div>
        );
    },

    _currentTaskUI() {
        var ui;

        switch (this.props.appstate.task.currentTaskId) {
            case 'sample' :
                ui = this._createSampleUI();
                break;
            case 'average' :
                ui = this._averageUI();
                break;
            default:
                ui = <div>Mangler oppgave for denne id-en</div>
        }

        return ui;
    },

    render() {
        return (
            <div>
                <div>Totalt strålingsnivå:
                    <span>{this.state.radiation.total}</span>
                </div>

                <hr/>

                <RadiationChart
                    getNewValue={RadiationStore.getLevel}
                    updateFrequencySeconds={1}
                    maxSecondsShown={30}
                />

                <hr/>
                { this._currentTaskUI() }
            </div>
        );
    }

});

module.exports = ScienceTask;