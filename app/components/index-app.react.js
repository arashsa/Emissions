const React = require('react');
const Router = require('react-router');
const Link = Router.Link;

module.exports = React.createClass({
    render () {
        return (
            <div>
                <ul>
                    <li><Link to="team-root" params={{ teamId : 'science'}}>Forskningsteamet</Link></li>
                    <li> ... Lag 2, 3, 4 ..</li>
                </ul>

            </div>
        );
    }
});


