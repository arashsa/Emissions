const React = require('react'),
    Router = require('react-router'),
    MessageStore = require('../stores/message-store'),
    MissionStateStore = require('../stores/mission-state-store'),
    MessageList = require('./message-list.react'),
    IntroductionScreen = require('./introduction-screen.react.js'),
    RadiationSampler = require('./radiation-sampler.react'),
    TimerPanel = require('./timer-panel.react'),
    dialogs = require('./dialogs.react'),
    actions = require('../actions'),
    constants = require('../constants');

var assignments = [];
assignments[1] = 'Start klokken og ta fire målinger fordelt jevnt utover tidsintervallet';


const ScienceApp = React.createClass({

    mixins: [Router.State],

    componentDidMount: function () {
        console.log('componentDidMount');
        MissionStateStore.addChangeListener(this._handleMissionStatusChange);
        MessageStore.addChangeListener(this._handleMessageStoreChange);
    },

    componentWillMount: function () {
        console.log('componentWillMount');
    },

    componentWillUnmount: function () {
        MissionStateStore.removeChangeListener(this._handleMissionStatusChange);
        MessageStore.removeChangeListener(this._handleMessageStoreChange);
    },

    getInitialState() {
        return {
            isMissionStarted: MissionStateStore.isMissionRunning(),
            step: 0,
            messages: MessageStore.getMessages(),
            task: assignments[1]
        };
    },

    render() {
        var content;

        switch (this.state.step) {
            case 0:
                content = this.introText();
                break;
            case 1:
                content = this.createInstrumentUI();
                break;
            default:
                throw Error('Unhandled step in the UI dialog');
        }

        return (
            <div className = 'row'>
                <MessageList messages={this.state.messages} />
            {content}
            </div>
        );
    },

    introText() {

        return (<IntroductionScreen className='introscreen'
            missionStarted = {this.state.isMissionStarted}
            nextAction={this._handleIntroClick} >
          {dialogs.science_intro}
        </IntroductionScreen>);
    },

    createInstrumentUI() {
        return (<div>
            <div className='jumbotron'>
                <strong>Oppgave:</strong> {this.state.task}
            </div>
            <img className='img-responsive' src='images/radiation.png' />

            <hr/>

            <TimerPanel />
            <RadiationSampler />
            <hr/>
        </div>
        )
    },

    _handleIntroClick() {
        actions
    },

    _handleMissionStatusChange() {
        this.setState({isMissionStarted: MissionStateStore.isMissionRunning()});
        console.log('Mission status changed', this.state.isMissionStarted);
    },

    _handleMessageStoreChange() {
        this.setState({messages: MessageStore.getMessages()});
    }

});

module.exports = ScienceApp;
