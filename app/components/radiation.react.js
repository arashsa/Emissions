const React = require('react');

var chart = {
    create() {
    },

    update() {
    }
};

React.createClass({

    statics: {},
    propTypes: {
        data: React.PropTypes.array,
        domain: React.PropTypes.object
    },
    mixins: [],

    componentWillMount() {
        var el = React.findDOMNode(this);
        chart.create(el, {
            width: '100%',
            height: '300px'
        }, this.getChartState());
    },

    componentWillReceiveProps() {
    },
    componentWillUnmount() {
        var el = React.findDOMNode(this);
        chart.destroy(el);
    },

    componentDidUpdate() {
        var el = React.findDOMNode(this);
        chart.update(el, this._getChartState());
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
            <div>
                Stråling
                <div style="width: 600px; height: 240px;"></div>
            </div>
        );
    }

});
