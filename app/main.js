var React = require('react');
var MissionCommanderApp = require('./CommanderApp.js');
var IndexApp = require('./IndexApp.js');
var ScienceTeamApp = require('./ScienceApp.js');
var CommunicationTeamApp = require('./CommunicationApp.js');
var Router = require('./router.js');
//var document = require('global/document');
var window = require('global/window');
var location = window.location;
var appDiv = document.querySelector('body');

Router.config({mode: 'hash'})
    .add(/start/, function () {
        React.render(<IndexApp/>, appDiv);
    })
    .add(/commander/, function () {
        React.render(<MissionCommanderApp/>, appDiv);
    })
    .add(/science/, function () {
        React.render(<ScienceTeamApp/>, appDiv);
    })
    .add(/communication/, function () {
        React.render(<CommunicationTeamApp/>, appDiv);
    })
    // default
    .add(function () {
        console.log('No route configured for this url');
        Router.navigate('/start');
    })
    .listen()
    // make sure we start at one of the defined routes above
    .check(location.href.substr(location.origin.length));


console.log('Routes set up')

window.Router = Router;
