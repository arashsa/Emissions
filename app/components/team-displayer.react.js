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
        var name = teamMap[(PathStore.getPathname())];
        return name || 'Velg lag';
    },

    otherTeamNames() {
        const pathname = PathStore.getPathname();

        return Object.keys(teamMap)
            .filter((n) => n !== pathname)
            .map((n) => teamMap[n])
            .join(', ')
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
