const React = require('react');
const Router = require('react-router');

const RouteHandler = Router.RouteHandler;

const Header = require('./header.react');

const TeamDisplayer = require('./team-displayer.react');
const MessageList = require('./message-list.react');
const MissionTimer = require('./mission-timer.react.js');

const MissionStateStore = require('../stores/mission-state-store');

const constants = require('../constants');
const actions = require('../actions');

const App = React.createClass({

    mixins: [],

    getInitialState() {
        return {isMissionRunning: MissionStateStore.isMissionRunning()};
    },

    componentWillMount() {
        MissionStateStore.addChangeListener(this._handleMissionStateChange);
    },

    componentWillUnmount() {
        MissionStateStore.removeChangeListener(this._handleMissionStateChange);
    },

    _handleMissionStateChange() {
        this.setState({isMissionRunning: MissionStateStore.isMissionRunning()});
    },

    render: function () {
        var countDownBox, mainContent;

        if (MissionStateStore.isMissionRunning()) {
            countDownBox = <MissionTimer />;

            mainContent = <div>

                <div id='team-name' className='' >
                    <header className=''>
                        <TeamDisplayer className=''/>
                    </header>
                </div>

                <section id='mission-timer' className=''>
                { countDownBox }
                </section>

                {/* this is the important part */}
                <RouteHandler/>
            </div>
        } else {
            let message = {
                id: 'not_used',
                text: 'Ikke klar. Venter på at oppdraget skal starte.',
                level: 'info'
            };
            mainContent = <MessageList className='row' messages={[message]} />
        }

        return (
            <div className='container'>

                <Header/>

                {mainContent}
            </div>
        );
    }
});

module.exports = App;