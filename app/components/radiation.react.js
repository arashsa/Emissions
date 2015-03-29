/**
 * Implementation based on tips in the article by Nicolas Hery
 * http://nicolashery.com/integrating-d3js-visualizations-in-a-react-app
 *
 * Chart code more or less copied from the prototype by Leo Martin Westby
 */
const React = require('react');
const AmCharts = require('amcharts');

var chart;
var radiationRange = [20, 90];
var radiationSamples = [];

var randomInt = function(min, max) {
    return Math.floor(Math.random() * (max + 1 - min)) + min;
}

function initChart(domElement) {

    AmCharts.ready(function () {
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

        startEventLoop();
    });
}

var chartUpdater;

//Adds a new radiation sample to the chart every few seconds
function startEventLoop() {
    var updateFrequency = 500;
    var startTime = Date.now();
    stopEventLoop();

    chartUpdater = setInterval(function() {
        var secondsPassed = (Date.now() - startTime) / 1000;

        var radiation = randomInt(radiationRange[0], radiationRange[1]);

        var RadiationStore = require('../stores/radiation-store');
        var radiation = RadiationStore.getLevel();
        radiationSamples.push({timestamp: Math.floor(secondsPassed + 0.5), radiation: radiation});

        //When the chart grows to 30 seconds, start cutting off the oldest sample to give the chart a sliding effect
        if (radiationSamples.length > (30*1000/updateFrequency)) {
            radiationSamples.shift();
        }

        chart.validateData();
    }, updateFrequency);
}

function stopEventLoop() {
    clearInterval(chartUpdater);
    radiationSamples.length = 0;
    chart.validateData();
}


const RadiationChart = React.createClass({

    statics: {},
    propTypes: {
        data: React.PropTypes.array,
        domain: React.PropTypes.object
    },
    mixins: [],

    componentWillMount() {
    },

    componentDidMount() {

        var el = React.findDOMNode(this);
        initChart(el);


        //chart.create(el, {
        //    width: '100%',
        //    height: '300px'
        //}, this.getChartState());
    },

    componentWillReceiveProps() {
    },
    componentWillUnmount() {
        var el = React.findDOMNode(this);
        chart.destroy(el);
    },

    componentDidUpdate() {
        chart.update(React.findDOMNode(this), this._getChartState());
    },

    // Private methods

    _getChartState() {
        return {
            data: this.props.data,
            domain: this.props.domain
        };
    },

    render() {
        return (
            <div ref='rad-chart' style={{width: '600px', height: '240px'}}></div>
        );
    }

});

module.exports = RadiationChart;
