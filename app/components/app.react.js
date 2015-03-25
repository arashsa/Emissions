const React = require('react');
const Router = require('react-router');

const RouteHandler = Router.RouteHandler;

const Header = require('./header.react');

const TeamDisplayer = require('../components/team-displayer.react');

const MissionTimer = require('../components/mission-timer.react.js');
const MissionStateStore = require('../stores/mission-state-store');

const constants = require('../constants');
const actions = require('../actions');

const App = React.createClass({

    mixins: [],

    getInitialState() {
        return {isMissionRunning: MissionStateStore.isMissionRunning()};
    },

    componentWillMount() {
        MissionStateStore.addChangeListener(() => {
            this.setState({isMissionRunning: MissionStateStore.isMissionRunning()});
        })
    },


    render: function () {
        var countDownBox, mainContent;

        if (MissionStateStore.isMissionRunning()) {
            countDownBox = <MissionTimer />;

            mainContent = <div>
                <section id='mission-timer' className=''>
                { countDownBox }
                </section>

                {/* this is the important part */}
                <RouteHandler/>
            </div>
        } else {
            mainContent = <div>Ikke klar. Venter på at oppdraget skal starte.</div>;
        }

        return (
            <div className='container'>

                <Header/>

                <div id='team-name' className='' >
                    <header className=''>
                        <TeamDisplayer className=''/>
                    </header>
                </div>

                {mainContent}
            </div>
        );
    }
});

module.exports = App;