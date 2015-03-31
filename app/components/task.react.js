const React = require('react'),
    Router = require('react-router'),
    MessageStore = require('../stores/message-store'),
    TaskStore = require('../stores/task-store'),
    RouteStore = require('../stores/route-store'),
    MessageList = require('./message-list.react'),
    IntroductionScreen = require('./introduction-screen.react.js'),
    ScienceTask = require('./science-task.react'),
    actions = require('../actions'),
    constants = require('../constants');

const Task = React.createClass({

    mixins: [],

    componentDidMount: function () {
        //console.log('componentDidMount');
    },

    componentWillMount: function () {
        MessageStore.addChangeListener(this._handleMessageStoreChange);
        RouteStore.addChangeListener(this._handleRouteStoreChange);
        //console.log('componentWillMount');
    },

    componentWillUnmount: function () {
        //console.log('componentWillUnmount');
        MessageStore.removeChangeListener(this._handleMessageStoreChange);
        RouteStore.removeChangeListener(this._handleRouteStoreChange);
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
         * Yes, changing our own state like this is not the right way to do it,
         * but I could not think of a proper "FLUX" way that would work right now
         */
        setTimeout(()=> this.setState({taskIsNew : false}), 2000);

        return {
            messages: MessageStore.getMessages(),
            task: TaskStore.getState(),
            routeStore: RouteStore.getRouteState(),
            taskIsNew : true
        };
    },

    _handleMessageStoreChange() {
        this.setState({messages: MessageStore.getMessages()});
    },


    _handleRouteStoreChange() {
        this.setState({
            routeStore: RouteStore.getRouteState(),
            task: TaskStore.getState(),
            taskIsNew : true
        });

        setTimeout(()=> this.setState({taskIsNew : false}), 2000);
    },

    _createSubTaskUI() {
        return ( <ScienceTask appstate={this.state} />);
    },

    render() {
        var content = this._createSubTaskUI(),
            blink = this.state.taskIsNew? 'blink' : '';

        return (
            <div className = ''>
                <MessageList className='row' messages={this.state.messages} />
                <div className='row jumbotron taskbox'>
                    <h2 className='taskbox__header'>Oppgave</h2>
                    <span className={'taskbox__text ' + blink} > {this.state.task.currentTask} </span>
                </div>
                {content}
            </div>
        );
    }

});

module.exports = Task;
