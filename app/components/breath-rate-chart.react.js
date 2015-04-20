/**
 * THIS DESIGN ONLY SUPPORTS ONE CHART AS THEY *SHARE* STATE
 * For a non-stupid design, do something like the
 * implementation in the article by Nicolas Hery:
 * http://nicolashery.com/integrating-d3js-visualizations-in-a-react-app
 *
 * Chart code more or less copied from the prototype by Leo Martin Westby
 */
const React = require('react');
const AmCharts = require('amcharts');
const { randomInt } = require('../utils');

//Lung volume in ml before and after inhalation
var lowVolume = 2000;
var highVolume = 3000;

//Millivolts displayed on the Y axis of the ECG graph
var highMV = 1;
var lowMV = 0;

var breathRateSamples = [];
var chart;

//Configure the charts
function initChart(domElement) {
    chart = new AmCharts.AmSerialChart();

    chart.marginTop = 20;
    chart.marginRight = 10;
    chart.autoMarginOffset = 5;
    chart.dataProvider = breathRateSamples;
    chart.categoryField = "timestamp";

    //X Axis
    var categoryAxis = chart.categoryAxis;
    categoryAxis.dashLength = 1;
    categoryAxis.gridAlpha = 0.10
    categoryAxis.axisColor = "#DADADA";
    categoryAxis.autoGridCount = false;
    categoryAxis.gridCount = 15;
    categoryAxis.forceShowField = "forceShow";
    //categoryAxis.title = "Seconds";

    //Hide every label that is not explicitly shown
    categoryAxis.labelFunction = function(valueText, object) {
        if (object.forceShow) {
            return valueText;
        }
    };

    //Y Axis
    var valueAxis = new AmCharts.ValueAxis();
    valueAxis.axisAlpha = 0.2;
    valueAxis.dashLength = 1;
    valueAxis.minimum = lowVolume;
    valueAxis.maximum = highVolume * 1.1;
    valueAxis.title = "Lungevolum (ml)";
    chart.addValueAxis(valueAxis);

    //Line
    var graph = new AmCharts.AmGraph();
    graph.type = "smoothedLine";
    graph.valueField = "volume";
    graph.lineThickness = 1.5;
    graph.lineColor = "#b5030d";
    chart.addGraph(graph);

    chart.write(domElement);
}

var breathRateBuffer;
var breathRateBufferIndex;
var msUntilNextBreathRateBufferFrame;

//Fills the breath rate buffer with samples from the specified range
//The breath rate buffer contains twice as many samples as the breath rate chart and is used to animate the chart
function createBreathRateSamples(min, max) {
    breathRateBuffer = [];
    breathRateBufferIndex = 0;
    msUntilNextBreathRateBufferFrame = 0;

    var breathsPerMinute = randomInt(min, max);
    var msBetweenBreaths = 60 * 1000 / breathsPerMinute;
    var msUntilNextBreath = msBetweenBreaths;

    for (var i = 0; i <= 120; i++) {
        var lungVolume;

        if (msUntilNextBreath <= 0) {
            lungVolume = highVolume;
            msUntilNextBreath = msBetweenBreaths;
        }
        else {
            lungVolume = lowVolume * 1.05;
        }

        //The resolution of the chart is two samples per second
        breathRateBuffer.push({timestamp: i / 2, volume: lungVolume});
        msUntilNextBreath -= 500;
    }
}

var chartUpdater;

//Animates the breath rate and heart rate charts
function startEventLoop() {
    var startTime = Date.now();
    var msSinceLastUpdate = 0;
    var msSinceStart = 0;
    var updateFrequency = 400;
    stopEventLoop();

    chartUpdater = setInterval(function() {
        msSinceLastUpdate = Date.now() - startTime - msSinceStart;
        msUntilNextBreathRateBufferFrame -= msSinceLastUpdate;
        msSinceStart = Date.now() - startTime;

        if (msUntilNextBreathRateBufferFrame <= 0) {
            var framesMissed = Math.floor((msUntilNextBreathRateBufferFrame * -1) / 500 + 1);

            for (var i = 0; i < framesMissed; i++) {
                breathRateBufferIndex++;

                if (breathRateBufferIndex >= breathRateBuffer.length) {
                    breathRateBufferIndex = 0;
                }

                breathRateSamples.push(breathRateBuffer[breathRateBufferIndex]);

                //When the chart grows to 30 seconds, start cutting off the oldest sample to give the chart a sliding effect
                if (breathRateSamples.length > 60) {
                    breathRateSamples.shift();
                }
            }

            msUntilNextBreathRateBufferFrame = 250;
        }

        //Always show from 0 to 30 seconds on the X axis
        if (breathRateSamples.length >= 60) {
            for (var i = 0; i < breathRateSamples.length; i++) {
                breathRateSamples[i].timestamp = Math.floor(i / (breathRateSamples.length - 1) * 30);
            }
        }

        //Only show every 5th timestamp
        for (var i = 0; i < breathRateSamples.length; i++) {
            breathRateSamples[i].forceShow = breathRateSamples[i].timestamp % 5 == 0 && (i == 0 || breathRateSamples[i - 1].timestamp % 5 != 0);
        }

        chart.validateData();
    }, updateFrequency);
}

function stopEventLoop() {
    clearInterval(chartUpdater);
    breathRateSamples.length = 0;
    chart.validateData();
}

module.exports = React.createClass({

    statics: {},

    propTypes: {
        height: React.PropTypes.number.isRequired,
        width: React.PropTypes.number
    },

    mixins: [],

    getInitialState(){
        return this._getChartState();
    },

    componentWillMount() {
        this._updateChart();
    },

    componentDidMount() {
        var el = React.findDOMNode(this);
        initChart(el);
        startEventLoop();
    },

    componentWillUnmount() {
        chart && chart.clear();
        stopEventLoop();
    },

    componentDidUnmount() {
        chart = null;
    },

    componentDidUpdate() {
    },

    // this chart is responsible for drawing itself
    shouldComponentUpdate() {
        return false;
    },

    // Private methods
    _updateChart(){
        createBreathRateSamples(this.state.minBreathRate, this.state.maxBreathRate);
    },

    _getChartState(){
        // dummy at first
        var breathState = {minBreathRate: 15, maxBreathRate: 20};
        return breathState;
    },

    _onChange(){

    },

    render() {

        // if you don't specify width it will max out to 100% (which is ok)
        return (
            <div
                style={{width: this.props.width + 'px', height : this.props.height+ 'px'}}
                className={this.props.className}
                />
        );
    }

});
