const React = require('react'),
    Router = require('react-router'),
    MessageStore = require('../stores/message-store'),
    TaskStore = require('../stores/task-store'),
    MissionStateStore = require('../stores/mission-state-store'),
    RouteStore = require('../stores/route-store'),
    MessageList = require('./message-list.react'),
    IntroductionScreen = require('./introduction-screen.react.js'),
    RadiationSampler = require('./radiation-sampler.react'),
    TimerPanel = require('./timer-panel.react'),
    RadiationChart = require('./radiation.react'),
    dialogs = require('./dialogs.react'),
    actions = require('../actions'),
    constants = require('../constants');

const Task = React.createClass({

    mixins: [],

    componentDidMount: function () {
        console.log('componentDidMount');
        console.log(React.findDOMNode(this));
    },

    componentWillMount: function () {
        console.log('componentWillMount');
    },

    componentWillUnmount: function () {
        console.log('componentWillUnmount');
    },

    componentDidUnmount: function () {
        console.log('componentDidUnmount');
    },

    componentDidUpdate(){
        console.log('.componentDidUpdate');
        console.log(React.findDOMNode(this));
    },

    getInitialState() {
        return {
            messages: MessageStore.getMessages(),
            task: TaskStore.getCurrentTask(RouteStore.getTeamId())
        };
    },

    _createInstrumentUI() {
        return (<div>
            <div className='jumbotron'>
                <strong>Oppgave:</strong> {this.state.task}
            </div>

        { /* <img className='img-responsive' src='/images/radiation.png' /> */ }
            <RadiationChart />

            <hr/>

            <TimerPanel timerId={constants.SCIENCE_TIMER_1} />
            <RadiationSampler />
            <hr/>
        </div>
        )
    },

    _handleMessageStoreChange() {
        this.setState({messages: MessageStore.getMessages()});
    },

    render() {
        var   content = this._createInstrumentUI();

        return (
            <div className = 'row'>
                <MessageList messages={this.state.messages} />
            {content}
            </div>
        );
    }

});

module.exports = Task;
