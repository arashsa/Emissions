const React = require('react');
const RouteStore = require('../stores/route-store');
const teamNames = require('../team-name-map');

const TeamWidget = React.createClass({

    contextTypes: {
        router: React.PropTypes.func
    },

    mixins: [],

    _onChange() {
        this.forceUpdate();
    },

    componentDidMount: function () {
        //RouteStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function () {
        //RouteStore.removeChangeListener(this._onChange);

    },

    teamName() {
        return teamNames.nameMap[(RouteStore.getTeamId())];
    },

    otherTeamNames() {
        return teamNames.otherTeamNames(RouteStore.getTeamId());
    },

    render() {

            return (
                <div className = { this.props.className + ' teamwidget'} >
                    <span className = 'active' >{ this.teamName()  }</span>
                    <span className = ''>, { this.otherTeamNames() } </span>
                </div> );
    }
});

module.exports = TeamWidget;
