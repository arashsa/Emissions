const React = require('react');
const dialogs = require('./dialogs.react');
const actions = require('../actions');
var { cleanRootPath } = require('../utils');

const RouteStore = require('../stores/route-store');
var IntroStore = require('../stores/introduction-store');

 const IntroductionScreen = React.createClass({

    mixins: [],

    statics: {
        willTransitionTo(transition) {
            var teamId = cleanRootPath(transition.path);

            if (IntroStore.isIntroductionRead(teamId)) {
                transition.redirect('team-task', {taskId: 1, teamId : teamId});
            }
        }
    },

    _handleClick() {
        var teamId = RouteStore.getTeamId();
        actions.introWasRead(teamId);
        actions.transitionTo('team-task', {taskId : 1, teamId : teamId })
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
