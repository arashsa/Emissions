const React = require('react');
const PathStore = require('../stores/path-store');
const teamMap = {
    //'leader': 'Operasjonsleder',
    'science': 'forskningsteam',
    'communication': 'kommunikasjonsteam',
    'security': 'sikkerhetsteam',
    'astronaut': 'astronautteam'
};

const TeamWidget = React.createClass({

    mixins: [],

    _onChange() {
        this.forceUpdate();
    },

    componentDidMount: function () {
        PathStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function () {
        PathStore.removeChangeListener(this._onChange);
    },

    teamName() {
        return teamMap[(PathStore.getPathname())];
    },

    otherTeamNames() {
        const pathname = PathStore.getPathname();

        return Object.keys(teamMap)
            .filter((n) => n !== pathname)
            .map((n) => teamMap[n])
            .join(', ')
    },

    render() {

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
