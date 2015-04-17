const React = require('react');
const dialogs = require('./dialogs.react');
const { cleanRootPath } = require('../utils');

const RouteStore = require('../stores/route-store');
var IntroStore = require('../stores/introduction-store');

 const IntroductionScreen = React.createClass({

    mixins: [],

     contextTypes: {
         router: React.PropTypes.func
     },

    statics: {
        willTransitionTo(transition) {
            var teamId = cleanRootPath(transition.path);

            if (IntroStore.isIntroductionRead(teamId)) {
                console.log('Introduction read earlier');
                transition.redirect('team-task', {taskId: 'sample', teamId : teamId});
            }
        }
    },

    _handleClick() {
        const MissionActionCreators = require('../actions/MissionActionCreators');

        var teamId = RouteStore.getTeamId();
        MissionActionCreators.introWasRead(teamId);
        this.context.router.transitionTo('team-task', {taskId : 'sample', teamId : teamId })
    },

    render() {
        var teamId= RouteStore.getTeamId();
        var introText = dialogs[teamId + '_intro'] || <p>Mangler oppdrag</p>;

        return (<div className = 'row jumbotron introscreen'>
            <h2>Mål for oppdraget</h2>

            { introText }

            <button
                className = 'btn btn-primary btn-lg'
                onClick={this._handleClick}
            >Jeg forstår</button>
        </div>)

    }
});

module.exports = IntroductionScreen;
