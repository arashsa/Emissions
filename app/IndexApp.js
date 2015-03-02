var React = require('react');

var App = React.createClass({
    render() {
        return (
            <div>
                <h1>Index</h1>
                <a href="#commander">Mission commander</a>
                <br/>
                <a href="#communication">Communication team</a>
                <br/>
                <a href="#astronaut">Astronaut team</a>
                <br/>
                <a href="#science">Science team</a>
                <br/>
                <a href="#security">Security team</a>
            </div>
        );
    }

});

module.exports = App;
