//require("babel/polyfill");

const React = require('react');
const Router = require('react-router');

const document = require('global/document');
const window = require('global/window');

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

                <header>
                    <TeamDisplayer />
                    <TickTock />
                    <h1>Under en solstorm</h1>
                </header>


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
    AppDispatcher.dispatch({ action : constants.ROUTE_CHANGED_EVENT, state });
    React.render(<Handler/>, document.body);
});
