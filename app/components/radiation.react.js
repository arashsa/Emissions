/**
 * Implementation based on tips in the article by Nicolas Hery
 * http://nicolashery.com/integrating-d3js-visualizations-in-a-react-app
 *
 * Chart code more or less copied from the prototype by Leo Martin Westby
 */
const React = require('react');
const AmCharts = require('amcharts');

var chart, chartUpdater, getNewValue, updateFrequency, maxSeconds;
var radiationSamples = [];

const RADIATION_MAX = 350;
const RADIATION_MIN = 0;

const { randomInt } = require('../utils');

   function initChart(domElement) {

        chart = new AmCharts.AmSerialChart();

        chart.marginTop = 20;
        chart.marginRight = 10;
        chart.autoMarginOffset = 5;
        chart.dataProvider = radiationSamples;
        chart.categoryField = "timestamp";

        //X axis
        var categoryAxis = chart.categoryAxis;
        categoryAxis.dashLength = 1;
        categoryAxis.gridAlpha = 0.15;
        categoryAxis.axisColor = "#DADADA";
        categoryAxis.title = "Seconds";

        //Y axis
        var valueAxis = new AmCharts.ValueAxis();
        valueAxis.axisAlpha = 0.2;
        valueAxis.dashLength = 1;
        valueAxis.title = "μSv/h";
        valueAxis.minimum = RADIATION_MIN;
        valueAxis.maximum = RADIATION_MAX;
        chart.addValueAxis(valueAxis);

        //Line
        var graph = new AmCharts.AmGraph();
        graph.valueField = "radiation";
        graph.bullet = "round";
        graph.bulletBorderColor = "#FFFFFF";
        graph.bulletBorderThickness = 2;
        graph.lineThickness = 2;
        graph.lineColor = "#b5030d";
        graph.negativeLineColor = "#228B22";
        graph.negativeBase = 60;
        graph.hideBulletsCount = 50;
        chart.addGraph(graph);

        //Mouseover
        const chartCursor = new AmCharts.ChartCursor();
        chartCursor.cursorPosition = "mouse";
        chart.addChartCursor(chartCursor);
        chart.write(domElement);
}

//Adds a new radiation sample to the chart every few seconds
function startEventLoop() {
    var startTime = Date.now();
    stopEventLoop();

    chartUpdater = setInterval(function () {
        var secondsPassed = (Date.now() - startTime) / 1000;

        radiationSamples.push({
            timestamp: Math.floor(secondsPassed + 0.5),
            radiation: getNewValue()
        });

        //When the chart grows, start cutting off the oldest sample to give the chart a sliding effect
        if (radiationSamples.length > (maxSeconds / updateFrequency)) {
            radiationSamples.shift();
        }

        chart.validateData();
    }, updateFrequency*1000);
}

function stopEventLoop() {
    clearInterval(chartUpdater);
}

const RadiationChart = React.createClass({

    statics: {},

    propTypes: {
        updateFrequencySeconds: React.PropTypes.number.isRequired,
        maxSecondsShown:  React.PropTypes.number.isRequired,
        getNewValue : React.PropTypes.func.isRequired
    },

    mixins: [],

    componentWillMount() {
        updateFrequency = this.props.updateFrequencySeconds;
        maxSeconds = this.props.maxSecondsShown;
        getNewValue = this.props.getNewValue;
    },

    componentDidMount() {
        var el = React.findDOMNode(this);
        initChart(el);
        startEventLoop();
    },

    componentWillReceiveProps() {
    },

    componentWillUnmount() {
        chart.clear();
        stopEventLoop();
    },

    componentDidUnmount(){
        chart = null;
        //radiationSamples.length = 0;
    },

    componentDidUpdate() {
    },

    // this chart is responsible for drawing itself
    shouldComponentUpdate() {
      return false;
    },

    // Private methods

    render() {
        return (
            <div style={{width: '600px', height: '240px'}}></div>
        );
    }

});

module.exports = RadiationChart;
