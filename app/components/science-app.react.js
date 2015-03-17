const React = require('react'),
    MessageStore = require('../stores/message-store'),
    MissionStateStore = require('../stores/mission-state-store'),
    MessageList = require('./message-list.react'),
    IntroductionScreen = require('./introduction-screen.react.js'),
    CountdownWidget = require('./countdown-widget.react'),
    constants = require('../constants');

var assignments = [];
assignments[1] = 'Start klokken og ta fire målinger fordelt jevnt utover tidsintervallet';

var countdownTimerStore = require('../stores/time-store').createNew({
    registerFunction(payload) {
        var {action, data} = payload;

        if(action === constants.SCIENCE_COUNTDOWN_TIMER_CHANGED) {
            countdownTimerStore.handleRemainingTimeChanged(data)
        }
        
        return true;
    }
});

const App = React.createClass({

    componentDidMount: function () {
        MissionStateStore.addChangeListener(this._onMissionStatusChange);
        MessageStore.addChangeListener(this._onMessageStoreChange);
    },

    componentWillUnmount: function () {
        MissionStateStore.removeChangeListener(this._onMissionStatusChange);
        MessageStore.removeChangeListener(this._onMessageStoreChange);
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
            nextAction={this._onIntroClick} >
            <p>
                Dere skal overvåke strålingsnivået astronatuen utsettes for.
                Dere må da passe på at astronauten ikke blir utsatt
                for strålingsnivåer som er skadelig.
            </p>
            <p>Ved hjelp av instrumentene som er tilgjengelig må dere jevnlig
                ta prøver og regne ut hva verdiene ligger på.
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
            <button className='btn btn-default'>Start klokka</button>
            <CountdownWidget timeStore={countdownTimerStore} />
            <hr/>
            <button className='btn btn-default disabled'>Ta strålingsprøve</button>
        </div>
        )
    },

    _onIntroClick() {
        this.setState({step: 1});
    },

    _onMissionStatusChange() {
        this.setState({isMissionStarted: MissionStateStore.isMissionRunning()});
        console.log('Mission status changed', this.state);
    },

    _onMessageStoreChange() {
        this.setState({messages: MessageStore.getMessages()});
    }

});

module.exports = App;
