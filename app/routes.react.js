const React = require('react');
const Router = require('react-router');
const Route = Router.Route;
const NotFoundRoute = Router.NotFoundRoute;
const DefaultRoute = Router.DefaultRoute;
const Link = Router.Link;
const RouteHandler = Router.RouteHandler;

const App = require('./components/app.react');
const MissionCommanderApp = require('./components/commander-app.react');
const IndexApp = require('./components/index-app.react');
const ScienceTeamApp = require('./components/science-app.react');
const CommunicationTeamApp = require('./components/communications-app.react');
const NotFound = require('./components/not-found.react');

var IntroStore = require('./stores/introduction-store');

const ScienceTmp = React.createClass({

    mixins: [],

    statics: {
        willTransitionTo(transition) {
            if (IntroStore.isIntroductionRead('science')) {
                transition.redirect('task', {taskId: 1});
            }
        }
    },

    render() {
        throw new Error('DUMMY RENDER');
    }
});

const Task = React.createClass({

    contextTypes: {
        router: React.PropTypes.func.isRequired
    },

    render() {
        var params = this.context.router.getCurrentParams();
        console.log(this.props)
        console.log(this.state)
        console.log(params);
        return <div>
            <span>TASK</span> {params.taskId}
            <RouteHandler/>
        </div>;
    }
});

var routerMixin = require('./components/router.mixin');
var { cleanRootPath } = require('./utils');

const Intro = React.createClass({
    mixins: [routerMixin],

    statics: {
        willTransitionTo(transition) {

            var teamId= cleanRootPath(transition.path);

            if (IntroStore.isIntroductionRead(teamId)) {
                transition.redirect('team-task', {taskId: 1, teamId : teamId});
            }
        }
    },

    render() {
        return <div>
            <span>'INTRO'</span> { }
        </div>;
    }
});

const routes = (
    <Route name="app" path="/" handler={App}>

        <Route name="leader" handler={MissionCommanderApp}/>
        <Route name="team-root" path='/:teamId' handler={Intro} />
        <Route name="team-intro" path='/:teamId/intro' handler={Intro} />
        <Route name="team-task" path='/:teamId/task/:taskId' handler={Task} />

        <NotFoundRoute handler={NotFound}/>
        <DefaultRoute handler={IndexApp}/>
    </Route>
);

module.exports = routes;
