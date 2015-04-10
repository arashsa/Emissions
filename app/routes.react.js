const React = require('react');
const Router = require('react-router');
const Route = Router.Route;
const NotFoundRoute = Router.NotFoundRoute;
const DefaultRoute = Router.DefaultRoute;

const App = require('./components/app.react');
const MissionCommanderApp = require('./components/commander-app.react');
const IndexApp = require('./components/index-app.react');
const NotFound = require('./components/not-found.react');
const IntroScreen = require('./components/introduction-screen.react');
const Task = require('./components/task.react');
const DummyRenderMixin = require('./components/dummy-render.mixin');

const RedirectToIntro = React.createClass({

    statics: {
        willTransitionTo(transition) {
                transition.redirect(transition.path + '/intro');
        }
    },

    mixins : [DummyRenderMixin]
});

const routes = (
    <Route name="app" path="/" handler={App}>

        <Route name="leader" handler={MissionCommanderApp}/>
        <Route name="team-root" path='/:teamId' handler={RedirectToIntro} />
        <Route name="team-intro" path='/:teamId/intro' handler={IntroScreen} />
        <Route name="team-task" path='/:teamId/task/:taskId' handler={Task} />

        <NotFoundRoute handler={NotFound}/>
        <DefaultRoute handler={IndexApp}/>
    </Route>
);

module.exports = routes;
