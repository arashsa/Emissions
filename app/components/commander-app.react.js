var React = require('react');

var App = React.createClass({
    render() {
        return (
            <div>

                <p id="missionTime">Oppdraget har ikke startet</p>

                <div>
                    Oppdragstid:
                    <input type="text" id="missionLength" size="3" />
                    minutter
                    <button id="changeMissionTime" style={{display: "none"}}>Endre oppdragstid</button>
                    <button id="startMission">Start oppdrag</button>
                </div>

                <button id="jobFinished" style={{"display": "none"}}>Oppdrag utført</button>

                <div>
                    <video id="astronautVideo" width="270px" height="180px" autoPlay="true" loop="true" controls="true" muted="true">
                        <source type="video/webm"></source>
                    </video>
                </div>

                <div>
                    <button id="stopButton">Stopp</button>
                    <button id="astronautHappy">Glad</button>
                    <button id="astronautNervous">Nervøs</button>
                </div>

                <div>
                    <button id="callSecurityTeam" className="call">Ring sikkerhets-teamet</button>
                    <br/>
                    <button id="callCommunicationTeam" className="call">Ring kommunikasjons-teamet</button>
                    <span id="callerId" className="incomingCall">X ringer</span>
                    <button id="answerButton" className="incomingCall">Svar</button>
                    <button id="hangUp">Legg på</button>
                </div>

                <div>
                    <video id="localVideo" className="rtcVideo" autoPlay="true" muted="true"></video>
                    <video id="remoteVideo" className="rtcVideo" autoPlay="true"></video>
                </div>

            </div>
        );
    }

});

module.exports = App;
