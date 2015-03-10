const React = require('react');
const PathStore = require('../stores/path-store');

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
        switch (PathStore.getPathname()) {
            case 'leader' :
                return 'Operasjonsleder';
            case 'science' :
                return 'Forskningsteamet';
            case 'communication' :
                return 'Kommunikasjonsteamet';
            default:
                return 'Velg lag';
        }
    },

    render() {
        return (
            <div>
                { /* Why does it work in the JSX ? */}
                <h2> { this.teamName()  }</h2>
                <br />
            </div>
        );
    }
});

module.exports = TeamWidget;
