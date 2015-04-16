const React = require('react'),
    Router = require('react-router'),
    MessageStore = require('../stores/message-store'),
    TaskStore = require('../stores/task-store'),
    RouteStore = require('../stores/route-store'),
    MissionActions = require('../actions/MissionActionCreators'),
    MessageList = require('./message-list.react'),
    IntroductionScreen = require('./introduction-screen.react.js'),
    ScienceTask = require('./science-task.react'),
    { format } = require('util');


function urlOfTask(taskId){
    return format('/%s/task/%s', RouteStore.getTeamId(), taskId);
}

function transitionToCurrentTask(transitionFunction) {
    var currentTaskId = TaskStore.getCurrentTaskId();

    // this logic is fragile - if you should suddenly decide to visit another team
    // _after_ you have started a task, the team+task combo is invalid -> 404
    if(currentTaskId !== RouteStore.getTaskId()) {
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
        //RouteStore.addChangeListener(this._onChange);
        TaskStore.addChangeListener(this._onChange);
        //console.log('componentWillMount');
    },

    componentWillUnmount: function () {
        //console.log('componentWillUnmount');
        MessageStore.removeChangeListener(this._onChange);
        //RouteStore.removeChangeListener(this._onChange);
        TaskStore.removeChangeListener(this._onChange);

        clearTimeout(this._stateTimeout);
    },

    componentDidUnmount: function () {
        //console.log('componentDidUnmount');
    },

    componentDidUpdate() {
        //console.log('.componentDidUpdate');
        //console.log(React.findDOMNode(this));
    },

    getInitialState() {

        /*
         * Yes, changing our own state like this is probably not the right way to do it,
         * but I could not think of a good, proper "FLUX" way that would work right now
         */
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
        return ( <ScienceTask appstate={this.state} />);
    },

    render() {
        var content = this._createSubTaskUI(),
            blink = this.state.taskIsNew ? 'blink' : '';

        return (
            <div className=''>
                <div className="row">
                    <MessageList className='col-xs-12' messages={this.state.messages}/>
                </div>

                <div className="row">
                    <div className="col-xs-12">
                        <div className='jumbotron taskbox'>
                            <h2 className='taskbox__header'>Oppgave</h2>
                            <span className={'taskbox__text ' + blink}> {this.state.taskStore.currentTask} </span>
                        </div>
                    </div>
                </div>

                {content}
            </div>
        );
    }

});

module.exports = Task;
