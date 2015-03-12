const document = require('global/document');
const window = require('global/window');


// include these into the build
// bootstrap requires jQuery
window.jQuery = require('jquery');
const bootstrap = require('bootstrap');

const React = require('react');
const Router = require('react-router');

const AppDispatcher = require('./appdispatcher');
const MissionCommanderApp = require('./components/commander-app.react');
const IndexApp = require('./components/index-app.react');
const ScienceTeamApp = require('./components/science-app.react');
const CommunicationTeamApp = require('./components/communications-app.react');

const TeamDisplayer = require('./components/team-displayer.react');
const constants = require('./constants');

const TickTock = require('./components/tick-tock.react')

const App = React.createClass({
    mixins: [],

    render: function () {
        return (
        <div>
            <div className='container'>

                <header id='narom-header' className = 'row'>
                    <div className = 'col-xs-12' >
                        <img className = 'narom-logo-img'  src='/images/logo.png' />
                        NAROM e-Mission prototype
                    </div>
                </header>
            </div>

            <div id='main-header' >
                <header className='container'>
                    <h1 className = ''>Under en solstorm</h1>
                </header>
            </div>

            <div id='team-name' >
                <header className='container'>
                    <TeamDisplayer className=''/>
                </header>
            </div>

            <div className = 'container'>
                <span>Gjenstående tid: </span>
                <TickTock />
            </div>


                {/* this is the important part */}
            <RouteHandler/>
        </div>
        );
    }
});

const Route = Router.Route;
const NotFoundRoute = Router.NotFoundRoute;
const DefaultRoute = Router.DefaultRoute;
const Link = Router.Link;
const RouteHandler = Router.RouteHandler;

const routes = (
    <Route name="app" path="/" handler={App}>
        <Route name="science" handler={ScienceTeamApp}/>
        <Route name="communication" handler={CommunicationTeamApp}/>
        <Route name="leader" handler={MissionCommanderApp}/>
        <DefaultRoute handler={IndexApp}/>
    </Route>
);


Router.run(routes, (Handler, state) => {
    AppDispatcher.dispatch({action: constants.ROUTE_CHANGED_EVENT, state});
    React.render(<Handler/>, document.body);
});
