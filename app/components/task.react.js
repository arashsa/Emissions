const React = require('react'),
    Router = require('react-router'),
    MessageStore = require('../stores/message-store'),
    TaskStore = require('../stores/task-store'),
    RouteStore = require('../stores/route-store'),
    MessageList = require('./message-list.react'),
    IntroductionScreen = require('./introduction-screen.react.js'),
    actions = require('../actions'),
    constants = require('../constants');

const Task = React.createClass({

    mixins: [],

    componentDidMount: function () {
        console.log('componentDidMount');
        console.log(React.findDOMNode(this));
    },

    componentWillMount: function () {
        MessageStore.addChangeListener(this._handleMessageStoreChange);
        console.log('componentWillMount');
    },

    componentWillUnmount: function () {
        console.log('componentWillUnmount');
        MessageStore.removeChangeListener(this._handleMessageStoreChange);
    },

    componentDidUnmount: function () {
        console.log('componentDidUnmount');
    },

    componentDidUpdate() {
        console.log('.componentDidUpdate');
        console.log(React.findDOMNode(this));
    },

    getInitialState() {
        return {
            messages: MessageStore.getMessages(),
            task: TaskStore.getCurrentTask(RouteStore.getTeamId()),
        };
    },

    _createInstrumentUI() {
        const RadiationStore = require('../stores/radiation-store');
        const ScienceTask = require('./science-task.react');

        return  ( <ScienceTask appstate={this.state} />);
    },

    _handleMessageStoreChange() {
        this.setState({messages: MessageStore.getMessages()});
    },

    render() {
        var content = this._createInstrumentUI();

        return (
            <div className = 'row'>
                <MessageList messages={this.state.messages} />
                <div className='jumbotron'>
                    <strong>Oppgave:</strong> {this.state.task}
                </div>
                {content}
            </div>
        );
    }

});

module.exports = Task;
