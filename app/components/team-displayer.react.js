const React = require('react');
const RouteStore = require('../stores/route-store');
const teamMap = {
    //'leader': 'Operasjonsleder',
    'science': 'forskningsteam',
    'communication': 'kommunikasjonsteam',
    'security': 'sikkerhetsteam',
    'astronaut': 'astronautteam'
};

const TeamWidget = React.createClass({

    contextTypes: {
        router: React.PropTypes.func
    },

    mixins: [],

    _onChange() {
        this.forceUpdate();
    },

    componentDidMount: function () {
        RouteStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function () {
        RouteStore.removeChangeListener(this._onChange);
    },

    teamName() {
        return teamMap[(RouteStore.getTeamName())];
    },

    otherTeamNames() {
        const pathname = RouteStore.getTeamName();

        return Object.keys(teamMap)
            .filter((n) => n !== pathname)
            .map((n) => teamMap[n])
            .join(', ')
    },

    render() {

        console.log('Team path', this.context.router.getCurrentPath())

        if (this.teamName()) {

            return (
                <div className = { this.props.className + ' teamwidget'} >
                    <span className = 'active' >{ this.teamName()  }</span>
                    <span className = ''>, { this.otherTeamNames() } </span>
                </div> );
        } else {
            return (
                <div className = { this.props.className } >
                    <h2>Velg lag</h2>
                </div> );

        }
    }
});

module.exports = TeamWidget;
