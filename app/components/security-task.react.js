const React = require('react');
const CO2Store = require('../stores/carbon-dioxide-store');
const OxygenStore = require('../stores/oxygen-store');
const CommunicationQualityStore = require('../stores/communication-quality-store');
const MessageActionCreators = require('../actions/MessageActionCreators');

var chart = null;
var chartData = [{title: 'Luft', value: 100}];

function init(domElem) {
    chart = new AmCharts.AmPieChart();
    chart.valueField = "value";
    chart.titleField = "title";
    chart.dataProvider = chartData;
    chart.write(domElem);
}

var PieChart = React.createClass({

    propTypes: {
        height: React.PropTypes.string.isRequired,
        width: React.PropTypes.string
    },

    componentWillMount() {
        CO2Store.addChangeListener(() => this._updateData());
    },

    componentDidMount(){
        var el = React.findDOMNode(this);
        init(el);
    },

    shouldComponentUpdate(){
        return false
    },

    _updateData(){
        var co2 = CO2Store.co2Level();
        chartData.length = 0;
        chartData.push({title: 'Annen luft', value: 100 - co2});
        chartData.push({title: 'CO\u2082', value: co2});

        chart.validateData();
    },

    render(){
        return <div style={{height : this.props.height, width : this.props.width }}/>;
    }
});


var ProgressBar = React.createClass({

    propTypes: {
        progress: React.PropTypes.number.isRequired,
        max: React.PropTypes.number.isRequired,
        active: React.PropTypes.bool.isRequired,
        className: React.PropTypes.string
    },

    render(){
        var val = this.props.progress, max = this.props.max;
        return (
            <div className="progress">
                <div
                    className={ "progress-bar progress-bar-striped " + this.props.className + (this.props.active? ' active':'') }
                    style={{width :  val*max + '%'}}
                    role="progressbar">{Math.min(Math.round(val * max), max)}%
                </div>
            </div>);
    }
});


module.exports = React.createClass({

    statics: {},

    propTypes: {},

    mixins: [],

    getInitialState() {
        var state = this._getState();
        state.commProgress = 0;
        state.qualityProgress = 0;
        state.shouldFail = true;
        return state;
    },

    componentWillMount() {
        OxygenStore.addChangeListener(() => this._updateState());
    },

    componentWillUnmount() {
    },

    _startQualityProgressBar(){
        var ms = 300, totalDuration = 5 * 1000;
        this.setState({qualityProgress: 0})

        var tmp = setInterval(()=> {
            var number = this.state.qualityProgress;
            number += ms / totalDuration;

            if (number > .99) {
                clearInterval(tmp);
                if(this.state.shouldFail) {
                    MessageActionCreators.addMessage({
                        text : 'Kvaliteten på kommunikasjonssignalet er for dårlig. Er reparasjonen fullført?',
                        level : 'warning',
                        duration : 10
                    })
                }
            }
            this.setState({qualityProgress: number})
        }, ms)
    },


    _startCommProgressBar(){
        var ms = 300, totalDuration = 5 * 1000;
        this.setState({commProgress: 0})

        var tmp = setInterval(()=> {
            var number = this.state.commProgress;
            number += ms / totalDuration;

            if (number > .99) {
                clearInterval(tmp);
            }
            this.setState({commProgress: number})
        }, ms)
    },

    _qualityActive(){
        return (this.state.qualityProgress < 1);
    },

    _commActive(){
        return this.state.commProgress < 1;
    },

    _updateState(){
        this.setState(this._getState());
    },

    _indicatorColor(){
        return this.state.oxygenStore.colorIndicator;
    },

    _getState(){
        return {
            oxygenStore: OxygenStore.getState(),
            shouldFail: CommunicationQualityStore.qualityTestShouldFail()
        };
    },

    render() {

        var indicator = <div
            className="circle "
            style={ { display: 'inline-block', backgroundColor : this._indicatorColor() } }
            />;


        return ( <div >


            <div className="row">

                <ul className='col-sm-6'>
                    <li>Scrubfilter byttet: {CO2Store.filterChanged() ? 'ja' : 'nei'}</li>
                    <li>Oksygenindikator: {indicator} </li>
                </ul>

                <div className='col-xs-12 col-sm-6'>
                    <h3>Innhold karbondioksid i drakten av total luftmengde</h3>
                    <PieChart height="200px"/>
                </div>
            </div>
            <div className="row">
                <div className="">
                    <p className="">Kommunikasjon og data</p>

                    <p >Kommunikasjonsstatus </p>
                    <ProgressBar
                        max={100}
                        active={this._commActive()}
                        progress={this.state.commProgress}/>

                    <button onClick={this._startCommProgressBar}
                        className="btn btn-primary">Test</button>

                    <p >Datakvalitet</p>

                    <ProgressBar
                        max={100}
                        active={this._qualityActive()}
                        className={this.state.shouldFail && (!this._qualityActive()? 'progress-bar-danger' : '')}
                        progress={this.state.qualityProgress}/>
                    <button className="btn btn-primary"
                            onClick={this._startQualityProgressBar}
                        >Test
                    </button>

                </div>
            </div>

        </div> );
    }

});

