const React = require('react');
const MissionStore = require('../stores/mission-state-store');
const MissionTimer = require('./mission-timer.react');
const EventStore = require('../stores/event-store');
const utils = require('../utils');
const getMissionAC = (function () {
    let tmp = null;
    return ()=> {
        if (!tmp) tmp = require('../actions/MissionActionCreators');
        return tmp;
    }
})();

var App = React.createClass({

    componentWillMount(){
        var ac = getMissionAC();
        ac.askForEvents();

        EventStore.addChangeListener(this._onChange);
    },

    componentWillUnmount(){
        EventStore.removeChangeListener(this._onChange);
    },

    getInitialState() {
        return {
            completedEvents: [],
            overdueEvents: [],
            remainingEvents: []
        }
    },

    _onChange() {
        this.setState({
            completedEvents: EventStore.completed(),
            overdueEvents: EventStore.overdue(),
            remainingEvents: EventStore.remaining()
        });
        console.log('_onChange', this.state)
    },

    render() {

        // put it here due to circular dependencies

        return (
            <div>

                { MissionStore.isMissionRunning() ? <MissionTimer /> :
                    <p id="missionTime">Oppdraget har ikke startet</p> }

                <div>
                    <button onClick={getMissionAC().startMission}>Start oppdrag</button>
                    <button onClick={getMissionAC().stopMission}>Stop</button>
                    <button onClick={getMissionAC().resetMission}>Begynn på nytt</button>
                </div>

                <button key="missionCompleted" className="disabled">Oppdrag utført</button>


                <h2>Chapter events</h2>
                <h3>remaining</h3>
                <ul>
                    {this.state.remainingEvents.map((ev) => {
                        return <li>{ev.triggerTime} {ev.short_description} {ev.value}</li>
                    })}
                </ul>

                <h3>overdue</h3>
                <ul>
                    {this.state.overdueEvents.map((ev) => {
                        return <li>{ev.triggerTime} {ev.short_description} {ev.value}</li>
                    })}
                </ul>

                <h3>completed</h3>
                <ul>
                    {this.state.completedEvents.map((ev) => {
                        return <li>{ev.triggerTime} {ev.short_description} {ev.value}</li>
                    })}
                </ul>
            </div>
        );
    }

});

module.exports = App;
