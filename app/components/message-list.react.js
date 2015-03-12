var React = require('react');


var App = React.createClass({

    getInitialState() {
        return {
            messages: [
                {text: 'Ta fire målinger', level: 'info'}
                {text: 'Faretruende høyt strålingsnivå', level: 'danger'}
            ]
        }
    },

    _onIntroClick() {
    },

    render() {
        return (
            <div className = 'messagelist'>
                <h2>Meldinger</h2>
            </div>
        );
    }

});

module.exports = App;
