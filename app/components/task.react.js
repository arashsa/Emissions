const React = require('react'),
    Router = require('react-router'),
    MessageStore = require('../stores/message-store'),
    TaskStore = require('../stores/task-store'),
    RouteStore = require('../stores/route-store'),
    MessageList = require('./message-list.react'),
    IntroductionScreen = require('./introduction-screen.react.js'),
    TeamDisplayer = require('./team-displayer.react'),
    MissionTimer = require('./mission-timer.react.js'),
    ScienceTask = require('./science-task.react'),
    AstronautTask = require('./astronaut-task.react'),
    { format } = require('util');

// lazyrequire
if (false) {
    require('../actions/MissionActionCreators');
}
function lazyRequire(path) {
    let tmp = null;
    return ()=> {
        if (!tmp) tmp = require(path);
        return tmp;
    }
}
const getMissionAC = lazyRequire('../actions/MissionActionCreators');

function urlOfTask(taskId) {
    return format('/%s/task/%s', RouteStore.getTeamId(), taskId);
}

function transitionToCurrentTask(transitionFunction) {
    var currentTaskId = TaskStore.getCurrentTaskId();

    // this logic is fragile - if you should suddenly decide to visit another team
    // _after_ you have started a task, the team+task combo is invalid -> 404
    if (currentTaskId !== RouteStore.getTaskId()) {
        var to = urlOfTask(currentTaskId);
        transitionFunction(to);
    }

}

const Task = React.createClass({

    contextTypes: {
        router: React.PropTypes.func
    },

    mixins: [],

    statics: {
        willTransitionTo(transition) {
            transitionToCurrentTask(transition.redirect.bind(transition));
        }
    },

    componentDidMount: function () {
    },

    componentWillMount: function () {
        MessageStore.addChangeListener(this._onChange);
        TaskStore.addChangeListener(this._onChange);
        //console.log('componentWillMount');
    },

    componentWillUnmount: function () {
        //console.log('componentWillUnmount');
        MessageStore.removeChangeListener(this._onChange);
        TaskStore.removeChangeListener(this._onChange);

        clearTimeout(this._stateTimeout);
    },

    componentDidUnmount: function () {
        //console.log('componentDidUnmount');
    },

    componentDidUpdate() {
        //console.log('.componentDidUpdate');
    },

    getInitialState() {

        setTimeout(()=> this.setState({taskIsNew: false}), 2000);

        return {
            messages: MessageStore.getMessages(),
            taskStore: TaskStore.getState(),
            taskIsNew: true
        };
    },

    _onChange() {
        this.setState({
            messages: MessageStore.getMessages(),
            taskStore: TaskStore.getState(),
            taskIsNew: true
        });

        var router = this.context.router;
        transitionToCurrentTask(router.transitionTo.bind(router));

        // a bit rudimentary - triggers on all changes, not just Task changes ...
        this._stateTimeout = setTimeout(()=> this.setState({taskIsNew: false}), 2000);
    },

    _createSubTaskUI() {
        switch (RouteStore.getTeamId()) {
            case 'science':
                return <ScienceTask appstate={this.state}/>
            case 'astronaut':
                return <AstronautTask appstate={this.state}/>
            default:
                return <div>Not yet created</div>
        }
    },

    _handleTaskOKClick(){
         getMissionAC().taskCompleted( RouteStore.getTeamId(),  this.state.taskStore.currentTaskId);
    },

    render() {
        let content = this._createSubTaskUI(),
            blink = this.state.taskIsNew ? 'blink' : '',
            teamNames, missionTimer;


        teamNames = (
            <div id='team-name' className=''>
                <header className=''>
                    <TeamDisplayer className=''/>
                </header>
            </div>);

        missionTimer = (
            <section id='mission-timer' className=''>
                <MissionTimer />
            </section> );

        if (!this.props.isMissionRunning) {
            let message = {
                id: 'not_used',
                text: 'Ikke klar. Venter på at oppdraget skal starte.',
                level: 'info'
            };

            return (
                <div>
                    { teamNames }
                    <div className="row">
                        <MessageList className='col-xs-12'
                                     messages={[message]}/>
                    </div>
                </div>);
        }

        return (
            <div className=''>
                {teamNames}
                {missionTimer}
                <div className="row">
                    <MessageList className='col-xs-12' messages={this.state.messages}/>
                </div>

                { /* if you want this to be sticky: http://codepen.io/senff/pen/ayGvD */ }
                <div className="row">
                    <div className="col-xs-12">
                        <div className='jumbotron taskbox'>
                            <h2 className='taskbox__header'>Oppgave</h2>
                            <span className={'taskbox__text ' + blink}> {this.state.taskStore.currentTask} </span>

                            { this.state.taskStore.plainInfo
                            && <button className="btn-primary btn"
                                       onClick={ this._handleTaskOKClick }
                                >OK</button> }
                        </div>
                    </div>
                </div>

                {content}
            </div>
        );
    }

});

module.exports = Task;
