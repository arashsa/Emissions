const React = require('react');
const Router = require('react-router');
const Link = Router.Link;

module.exports = React.createClass({
    render () {
        return (
            <div>
                <h3>Velg lag</h3>
                <ul>
                    <li><Link to="team-root" params={{ teamId : 'science'}}>Forskningsgruppa</Link></li>
                    <li><Link to="team-root" params={{ teamId : 'astronaut'}}>Astronautgruppa</Link></li>
                </ul>

            </div>
        );
    }
});


