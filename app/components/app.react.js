const React = require('react');
const Router = require('react-router');

const RouteHandler = Router.RouteHandler;

const Header = require('./header.react');

const TeamDisplayer = require('./team-displayer.react');
const MessageList = require('./message-list.react');
const MissionTimer = require('./mission-timer.react.js');
const MissionStateStore = require('../stores/mission-state-store');

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
        return (
            <div className='container'>

                <Header/>

                <div id='team-name' className=''>
                    <header className=''>
                        <TeamDisplayer className=''/>
                    </header>
                </div>

                <section id='mission-timer' className=''>
                    <MissionTimer />
                </section>

                {/* this is the important part */}
                <RouteHandler {...this.props} {...this.state} />

                <div className="row">
                    <footer id='main-footer'></footer>
                </div>
            </div>
        );
    }
});

module.exports = App;