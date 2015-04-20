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
const HeartStore = require('../stores/heart-rate-store');

var chart;
var heartRateSamples = [];

var heartRateBuffer;
var heartRateBufferIndex;
var msUntilNextHeartRateBufferFrame;

//Millivolts displayed on the Y axis of the ECG graph
var highMV = 1;
var lowMV = 0;

var chartUpdater;

function initChart(domElement) {

    chart = new AmCharts.AmSerialChart();

    chart.marginTop = 20;
    chart.marginRight = 10;
    chart.autoMarginOffset = 5;
    chart.dataProvider = heartRateSamples;
    chart.categoryField = "timestamp";

    //X Axis
    var categoryAxis = chart.categoryAxis;
    categoryAxis.dashLength = 1;
    categoryAxis.gridAlpha = 0.10;
    categoryAxis.axisColor = "#DADADA";
    categoryAxis.forceShowField = "forceShow";
    //categoryAxis.title = "Seconds";

    //Hide every label that is not explicitly shown
    categoryAxis.labelFunction = function (valueText, object) {
        if (object.forceShow) {
            return valueText;
        }
    };

    //Y Axis
    var valueAxis = new AmCharts.ValueAxis();
    valueAxis.axisAlpha = 0.2;
    valueAxis.dashLength = 1;
    valueAxis.minimum = lowMV;
    valueAxis.maximum = highMV * 1.1;
    valueAxis.title = "mV";
    chart.addValueAxis(valueAxis);

    //Line
    var graph = new AmCharts.AmGraph();

    graph.valueField = "mV";
    graph.type = "smoothedLine";
    graph.lineThickness = 1;
    graph.lineColor = "#b5030d";
    chart.addGraph(graph);

    chart.write(domElement);
}

//Fills the heart rate buffer with samples from the specified range
//The heart rate buffer contains twice as many samples as the heart rate chart and is used to animate the chart
function createHeartRateSamples(min, max) {
    heartRateBuffer = [];
    heartRateBufferIndex = 0;
    msUntilNextHeartRateBufferFrame = 0;

    var beatsPerMinute = randomInt(min, max);
    var msBetweenBeats = 60 * 1000 / beatsPerMinute;
    var msUntilNextBeat = msBetweenBeats;

    for (var i = 0; i <= 200; i++) {
        var mV;

        if (msUntilNextBeat <= 0) {
            mV = highMV;
            msUntilNextBeat = msBetweenBeats;
        }
        else {
            mV = Math.random() * 0.2;
        }

        //The resolution of the chart is ten samples per second
        heartRateBuffer.push({timestamp: i / 10, mV: mV});
        msUntilNextBeat -= 50;
    }
}

//Animates the  heart rate charts
function startEventLoop() {
    var startTime = Date.now();
    var msSinceLastUpdate = 0;
    var msSinceStart = 0;
    var updateFrequency = 400;
    stopEventLoop();

    chartUpdater = setInterval(function () {
        msSinceLastUpdate = Date.now() - startTime - msSinceStart;
        msUntilNextHeartRateBufferFrame -= msSinceLastUpdate;
        msSinceStart = Date.now() - startTime;

        if (msUntilNextHeartRateBufferFrame <= 0) {
            var framesMissed = Math.floor((msUntilNextHeartRateBufferFrame * -1) / 100 + 1);

            for (var i = 0; i < framesMissed; i++) {
                heartRateBufferIndex++;

                if (heartRateBufferIndex >= heartRateBuffer.length) {
                    heartRateBufferIndex = 0;
                }

                heartRateSamples.push(heartRateBuffer[heartRateBufferIndex]);

                //When the chart grows to 10 seconds, start cutting off the oldest sample to give the chart a sliding effect
                if (heartRateSamples.length > 100) {
                    heartRateSamples.shift();
                }
            }

            msUntilNextHeartRateBufferFrame = 100;
        }

        //Always show from 0 to 10 seconds on the X axis
        if (heartRateSamples.length >= 100) {
            for (var i = 0; i < heartRateSamples.length; i++) {
                heartRateSamples[i].timestamp = Math.floor(i / (heartRateSamples.length - 1) * 10);
            }
        }

        //Only show every 5th timestamp
        for (var i = 0; i < heartRateSamples.length; i++) {
            heartRateSamples[i].forceShow = heartRateSamples[i].timestamp % 5 == 0 && (i == 0 || heartRateSamples[i - 1].timestamp % 5 != 0);
        }

        chart.validateData();
    }, updateFrequency);
}

function stopEventLoop() {
    clearInterval(chartUpdater);
    heartRateSamples.length = 0;
    chart.validateData();
}

const HeartRateChart = React.createClass({

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

    componentWillReceiveProps() {
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
        createHeartRateSamples(this.state.minHeartRate, this.state.maxHeartRate);
    },

    _getChartState(){
        // dummy at first
        var rate = HeartStore.getState();

        return {minHeartRate: rate.low, maxHeartRate: rate.high};
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

module.exports = HeartRateChart;
