const React = require('react');
const Link = require('react-router').Link;
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

const EventTable = React.createClass({

    propTypes: {
        events: React.PropTypes.array.isRequired,
        triggerDisabled: React.PropTypes.bool
    },

    render() {
        return (
            <table className='table'>
                <thead>
                <tr>
                    <th>Time</th>
                    <th>Description</th>
                    <th>Value</th>
                    <th>Trigger</th>
                </tr>
                </thead>

                <tbody>
                {  this.props.events.map((ev) => {
                    return <tr key={ev.id}>
                        <td>{ev.triggerTime}</td>
                        <td>{ev.short_description}</td>
                        <td>{JSON.stringify(ev.value || '')}</td>
                        <td>
                            <button className={ 'btn btn-primary ' + (this.props.triggerDisabled && 'disabled')}
                                    onClick={() => getMissionAC().askToTriggerEvent(ev.id)}
                                >Trigger
                            </button>
                        </td>
                    </tr>
                })}
                </tbody>
            </table>
        );
    }
});

var App = React.createClass({

    componentWillMount(){
        var ac = getMissionAC();
        ac.askForEvents();

        EventStore.addChangeListener(this._onChange);
        MissionStore.addChangeListener(this._onChange)

    },

    componentDidMount(){
        this._interval = setInterval(() => {
            this.setState({chapterTime: this.state.chapterTime + 1})
        },1000);
    },

    componentWillUnmount(){
        clearInterval(this._interval);
        EventStore.removeChangeListener(this._onChange);
        MissionStore.removeChangeListener(this._onChange)
    },

    getInitialState() {
        return {
            completedEvents: [],
            overdueEvents: [],
            remainingEvents: [],
            running: MissionStore.isMissionRunning(),
            chapter: MissionStore.currentChapter(),
            chapterTime: MissionStore.chapterTime()
        }
    },

    _onChange() {
        this.setState({
            completedEvents: EventStore.completed(),
            overdueEvents: EventStore.overdue(),
            remainingEvents: EventStore.remaining(),
            running: MissionStore.isMissionRunning(),
            chapter: MissionStore.currentChapter(),
            chapterTime: MissionStore.chapterTime()
        });
    },

    render() {

        var status;

        if (!this.state.running) {
            status = <p id="missionTime">Oppdraget har ikke startet</p>;
        }

        return (
            <div>

                <div>
                    <h3>Status</h3>
                    {status}

                    <dl>
                        <dt>Nåværende kapittel:</dt>
                        <dd>{this.state.chapter}</dd>
                        <dt>Tid brukt i kapittel</dt>
                        <dd>{this.state.chapterTime}</dd>
                        <dt>Total tid</dt>
                        <dd><MissionTimer /></dd>
                    </dl>

                </div>

                <div>
                    <button className='btn btn-primary' onClick={getMissionAC().startMission}>Start oppdrag</button>
                    <button className='btn btn-primary' onClick={getMissionAC().stopMission}>Stop</button>
                    <button className='btn btn-primary' onClick={getMissionAC().askToStartNextChapter}>Neste kapittel
                    </button>
                    <button className='btn btn-primary' onClick={getMissionAC().resetMission}>Begynn på nytt</button>
                </div>

                <button className='btn btn-primary' onClick={getMissionAC().completeMission}>Oppdrag utført</button>


                <h2>Chapter events</h2>

                <h3>remaining</h3>
                <EventTable key="foo" events={this.state.remainingEvents}/>

                <h3>overdue</h3>
                <EventTable events={this.state.overdueEvents}/>

                <h3>completed</h3>
                <EventTable triggerDisabled={true} events={this.state.completedEvents}/>
            </div>
        );
    }

});

module.exports = App;
