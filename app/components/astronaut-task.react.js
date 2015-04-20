const React = require('react');
const HeartRateChart = require('./heart-rate-chart.react');
const BreathRateChart = require('./breath-rate-chart.react');

module.exports = React.createClass({

    statics: {},

    propTypes: {},

    mixins: [],

    getInitialState() {
        return {}
    },

    getDefaultProps() {
        return {};
    },

    componentWillMount() {
    },

    componentWillReceiveProps() {
    },

    componentWillUnmount() {
    },

    render() {

        return ( <div >

            <div className="row">

                <div className='col-md-6'>
                    <h2>Hjerterytme</h2>
                    <HeartRateChart height={240}/>
                </div>

                <div className='col-md-6'>
                    <h2>Pust</h2>
                    <BreathRateChart height={240}/>
                </div>

            </div>

        </div> );
    }

});

