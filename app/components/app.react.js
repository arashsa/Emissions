const React = require('react');
const Router = require('react-router');

const RouteHandler = Router.RouteHandler;

const Header = require('./header.react');

const MessageList = require('./message-list.react');
const MissionStateStore = require('../stores/mission-state-store');

const App = React.createClass({

    mixins: [],

    getInitialState() {
        return {isMissionRunning: MissionStateStore.isMissionRunning()};
    },

    componentWillMount() {
        MissionStateStore.addChangeListener(this._handleMissionStateChange);
    },

    componentDidMount(){
        console.log('App.componentDidMount');
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