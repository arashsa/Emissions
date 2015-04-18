const React = require('react');
const MissionStore = require('../stores/mission-state-store');
const MissionTimer = require('./mission-timer.react');


var App = React.createClass({

    render() {

        // put it here due to circular dependencies
        var MissionActionCreators = require('../actions/MissionActionCreators');

        return (
            <div>

                { MissionStore.isMissionRunning()? <MissionTimer /> :  <p id="missionTime">Oppdraget har ikke startet</p> }

                <div>
                    <button  onClick={MissionActionCreators.startMission} >Start oppdrag</button>
                    <button  onClick={MissionActionCreators.stopMission} >Stop</button>
                    <button  onClick={MissionActionCreators.resetMission} >Begynn på nytt</button>
                </div>

                <button key="missionCompleted" className="disabled" >Oppdrag utført</button>

            </div>
        );
    }

});

module.exports = App;
