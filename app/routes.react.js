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

    render() {
        return (
            <div> ScienceAppTmp
                <div>
                    <RouteHandler/>
                </div>
            </div>);
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


const Intro = React.createClass({
    mixins: [],

    statics: {
        willTransitionTo(transition) {
            if (IntroStore.isIntroductionRead('science')) {
                transition.redirect('task', {taskId: 1});
            }
        }
    },

    _transitionTo(...args) {
        this.context.router.transitionTo(...args);
    },

    render() {
        return <div>
            <span>'INTRO'</span> { }
        </div>;
    }
});

const routes = (
    <Route name="app" path="/" handler={App}>
        <Route name="science" handler={ScienceTmp}>
            <Route name="task" path='task/:taskId' handler={Task} />
            <DefaultRoute handler={Intro}/>
        </Route>
        <Route name="communication" handler={CommunicationTeamApp}/>
        <Route name="leader" handler={MissionCommanderApp}/>
        <NotFoundRoute handler={NotFound}/>
        <DefaultRoute handler={IndexApp}/>
    </Route>
);

module.exports = routes;
