const React = require('react');

React.createClass({

    statics: {},
    propTypes: {},
    mixins: [],

    // life cycle methods
    getInitialState() {
    },
    getDefaultProps() {
    },

    componentWillMount() {
    },
    componentWillReceiveProps() {
    },
    componentWillUnmount() {
    },

    // Private methods
    _parseData() {
    },
    _onSelect() {
    },

    render: function () {
        return (
            <div>
                Stråling
                <div id="radiationChart" style="width: 600px; height: 240px;"></div>
            </div>
        );
    }

});