var React = require('react');
var ServerActionCreators = require('../actions/ServerActionCreators');

var App = React.createClass({

    render() {
        return (
            <div>

                <p id="missionTime">Oppdraget har ikke startet</p>

                <div>
                    <button  onClick={ServerActionCreators.startMission} >Start oppdrag</button>
                    <button  onClick={ServerActionCreators.stopMission} >Stop</button>
                </div>

                <button key="missionCompleted" className="disabled" >Oppdrag utført</button>

            </div>
        );
    }

});

module.exports = App;
