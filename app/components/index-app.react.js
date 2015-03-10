const React = require('react');
const Router = require('react-router');
const Link = Router.Link;

const IndexApp = React.createClass({
    render () {
        return (
            <div>
                    <ul>
                        <li><Link to="leader">Operasjonsleder</Link></li>
                        <li><Link to="science">Forskningsteamet</Link></li>
                        <li><Link to="communication">Kommunikasjonsteamet</Link></li>
                    </ul>

            </div>
        );
    }
});


module.exports = IndexApp;
