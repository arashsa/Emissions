const React = require('react'),
    MessageStore = require('../stores/message-store'),
    MissionStateStore = require('../stores/mission-state-store'),
    MessageList = require('./message-list.react'),
    IntroductionScreen = require('./introduction-screen.react.js'),
    RadiationSampler = require('./radiation-sampler.react'),
    TimerPanel = require('./timer-panel.react'),
    actions = require('../actions'),
    constants = require('../constants');

var assignments = [];
assignments[1] = 'Start klokken og ta fire målinger fordelt jevnt utover tidsintervallet';


const ScienceApp = React.createClass({

    componentDidMount: function () {
        MissionStateStore.addChangeListener(this._handleMissionStatusChange);
        MessageStore.addChangeListener(this._handleMessageStoreChange);
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
            <div className = 'container'>
                <MessageList messages={this.state.messages} />
            {content}
            </div>
        );
    },

    introText() {

        return (<IntroductionScreen className='introscreen'
            missionStarted = {this.state.isMissionStarted}
            nextAction={this._handleIntroClick} >
            <p>
                Dere skal overvåke strålingsnivået astronatuen utsettes for.
                Dere må da passe på at astronauten ikke blir utsatt
                for strålingsnivåer som er skadelig.
            </p>
            <p>Ved hjelp av instrumentene som er tilgjengelig må dere jevnlig
                ta prøver og regne ut verdiene for gjennomsnittlig og totalt
                strålingsnivå. Finner dere ut at nivåene er blitt farlig
                høye <em>må</em> dere si fra til oppdragslederen så vi kan
                få ut astronauten!
            </p>

            <p>
                Er oppdraget forstått?
            </p>
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
        this.setState({step: 1});
    },

    _handleMissionStatusChange() {
        this.setState({isMissionStarted: MissionStateStore.isMissionRunning()});
        console.log('Mission status changed', this.state.isMissionStarted);
    },

    _handleMessageStoreChange() {
        this.setState({messages: MessageStore.getMessages()});
    },

});

module.exports = ScienceApp;
