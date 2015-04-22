const React = require('react');
const OxygenStore = require('../stores/oxygen-store');
const { parseNumber } = require('../utils');
const { randomInt } = require('../utils');
const MissionStateStore = require('../stores/mission-state-store');

// lazy load due to avoid circular dependencies
function lazyRequire(path) {
    let tmp = null;
    return ()=> {
        if (!tmp) tmp = require(path);
        return tmp;
    }
}
const getMissionAC = lazyRequire('../actions/MissionActionCreators');
const getMessageAC = lazyRequire('../actions/MessageActionCreators');
// for browserify to work it needs to find these magic strings
require('../actions/MissionActionCreators');
require('../actions/MessageActionCreators');

var lowThreshold = 30, mediumThreshold = 70;

var satellites = [
    {name: 'Satelitt 1', freq: {min: 2.8, max: 3.4}, reception: 90, color: 'green'},
    {name: 'Satelitt 2', freq: {min: 2.1, max: 2.5}, reception: 30, color: 'red'},
    {name: 'Satelitt 3', freq: {min: 3.6, max: 4.0}, reception: 60, color: 'orange'}
];

function color(reception) {
    if (reception > mediumThreshold) {
        return 'green';
    }
    if (reception > lowThreshold) {
        return 'orange';
    }
    return 'red';
}

var i = 0;
function newValues() {
    satellites[(i + 0) % 3].reception = randomInt(25, 65);
    satellites[(i + 1) % 3].reception = randomInt(45, 85);
    satellites[(i + 2) % 3].reception = randomInt(25, 65);
    i++;

    chart && chart.validateData();
}

var currentChapter;

MissionStateStore.addChangeListener(() => {
    var isNewChapter = (currentChapter !== MissionStateStore.currentChapter());
    currentChapter = MissionStateStore.currentChapter();

    if (isNewChapter && currentChapter !== 3) {
        newValues();
    }
});

var chart;
function initGraph(domElement) {
    chart = new AmCharts.AmSerialChart();

    chart.dataProvider = satellites;
    chart.categoryField = "name";

    //X axis
    var categoryAxis = chart.categoryAxis;
    categoryAxis.gridPosition = "start";

    //Y axis
    var valueAxis = new AmCharts.ValueAxis();
    valueAxis.axisAlpha = 0;
    valueAxis.minimum = 0;
    valueAxis.maximum = 100;
    valueAxis.title = "Mottak";
    valueAxis.position = "left";
    chart.addValueAxis(valueAxis);

    //Line
    var graph = new AmCharts.AmGraph();
    graph.valueField = "reception";
    graph.colorField = "color";
    graph.lineAlpha = 0.2;
    graph.fillAlphas = 0.8;
    graph.type = "column";
    graph.showBalloon = false;
    chart.addGraph(graph);

    chart.write(domElement);

    return chart;
}

const SatelliteReceptionChart = React.createClass({

    propTypes: {},

    componentDidMount(){
        var el = React.findDOMNode(this);
        initGraph(el);
    },

    render(){
        return <div className={this.props.className} style={this.props.style}/>
    }

});

const SatelliteTable = React.createClass({

    propTypes: {
        satellites: React.PropTypes.array.isRequired
    },

    render(){

        return (
            <div {...this.props} >

                <table className={"table table-bordered table-striped "}>
                    <thead>
                    <tr>
                        <th>Satelitt</th>
                        <th>Frekvensområde</th>
                    </tr>
                    </thead>

                    <tbody>
                    {
                        this.props.satellites.map((sat, i) =>
                            <tr key={i}>
                                <td>{sat.name}</td>
                                <td>{sat.freq.min} - {sat.freq.max}</td>
                            </tr>)
                    }
                    </tbody>
                </table>
            </div>
        );

    }

});

module.exports = React.createClass({

    statics: {},

    propTypes: {},

    mixins: [],

    getInitialState() {
        return {
            chosenSatellite: satellites[2]
        };
    },
    componentWillMount() {
    },

    componentWillUnmount() {
    },

    _onSubmit(e){
        e.preventDefault();
        console.log(e);
        let selectBox = React.findDOMNode(this.refs['select-sat']);
        let freqBox = React.findDOMNode(this.refs['freq']);
        var actions = getMessageAC();

        let selectedSat = selectBox.value;
        let ok = false;

        var satObj = satellites.filter((sat) => sat.name === selectedSat)[0];
        var mean = (satObj.freq.max + satObj.freq.min)/2;
        var delta = 0.1;

        debugger;
        if(Math.abs(parseNumber(freqBox.value)-mean) <= delta) {
            ok = true;
        } else {
            actions.addTransientMessage({text : 'Greide ikke koble til satelitt. Riktig frekvens?'})
        }

        if(ok) {
            freqBox.value = '';
            actions.addMessage({text : 'Byttet til ' + selectedSat})
            this.state.chosenSatellite = satObj;
        }
    },

    render() {

        return (
            <div>

                <div className='row'>
                    <SatelliteTable satellites={satellites} className='col-sm-6'/>

                    <SatelliteReceptionChart style={{ height : '250px'}} className='col-sm-6'/>
                </div>

                <div className="row">
                    <form onSubmit={this._onSubmit}>
                        <h3>Velg satelitt og tilhørende frekvensområde</h3>

                        <select ref='select-sat' onSelect={this._onSelect} defaultValue={this.state.chosenSatellite.name}>
                            { satellites.map((sat) =>  <option key={sat.name} value={sat.name}>{sat.name}</option>) }
                        </select>

                        <h4>Velg frekvens:</h4>
                        <input step="0.1" ref='freq' type='number' />
                    </form>
                </div>

            </div> );

    }

});

