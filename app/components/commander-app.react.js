var React = require('react');


var App = React.createClass({

    render() {
        var MissionActionCreators = require('../actions/MissionActionCreators');

        return (
            <div>

                <p id="missionTime">Oppdraget har ikke startet</p>

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
