(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./specs/CommanderApp-spec.js":[function(require,module,exports){
"use strict";

var App = require("./../app/CommanderApp.js");
var TestUtils = require("react-addons").TestUtils;

describe("App", function () {

  it("should render some text!", function () {
    var app = TestUtils.renderIntoDocument(App());
    expect(app.getDOMNode().textContent.length).toBeGreaterThan(10);
  });
});


},{"./../app/CommanderApp.js":"/Users/carl-erik.kopseng/Dropbox/Skole/master/Emissions/app/CommanderApp.js","react-addons":"react-addons"}],"/Users/carl-erik.kopseng/Dropbox/Skole/master/Emissions/app/CommanderApp.js":[function(require,module,exports){
"use strict";

var React = require("react");

var App = React.createClass({
    displayName: "App",

    render: function render() {
        return React.createElement("div", null, React.createElement("p", { id: "missionTime" }, "Oppdraget har ikke startet"), React.createElement("div", null, "Oppdragstid:", React.createElement("input", { type: "text", id: "missionLength", size: "3" }), "minutter", React.createElement("button", { id: "changeMissionTime", style: { display: "none" } }, "Endre oppdragstid"), React.createElement("button", { id: "startMission" }, "Start oppdrag")), React.createElement("button", { id: "jobFinished", style: { display: "none" } }, "Oppdrag utført"), React.createElement("div", null, React.createElement("video", { id: "astronautVideo", width: "270px", height: "180px", autoPlay: "true", loop: "true", controls: "true", muted: "true" }, React.createElement("source", { type: "video/webm" }))), React.createElement("div", null, React.createElement("button", { id: "stopButton" }, "Stopp"), React.createElement("button", { id: "astronautHappy" }, "Glad"), React.createElement("button", { id: "astronautNervous" }, "Nervøs")), React.createElement("div", null, React.createElement("button", { id: "callSecurityTeam", className: "call" }, "Ring sikkerhets-teamet"), React.createElement("br", null), React.createElement("button", { id: "callCommunicationTeam", className: "call" }, "Ring kommunikasjons-teamet"), React.createElement("span", { id: "callerId", className: "incomingCall" }, "X ringer"), React.createElement("button", { id: "answerButton", className: "incomingCall" }, "Svar"), React.createElement("button", { id: "hangUp" }, "Legg på")), React.createElement("div", null, React.createElement("video", { id: "localVideo", className: "rtcVideo", autoPlay: "true", muted: "true" }), React.createElement("video", { id: "remoteVideo", className: "rtcVideo", autoPlay: "true" })));
    }

});

module.exports = App;


},{"react":"react"}]},{},["./specs/CommanderApp-spec.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvY2FybC1lcmlrLmtvcHNlbmcvRHJvcGJveC9Ta29sZS9tYXN0ZXIvRW1pc3Npb25zL3NwZWNzL0NvbW1hbmRlckFwcC1zcGVjLmpzIiwiL1VzZXJzL2NhcmwtZXJpay5rb3BzZW5nL0Ryb3Bib3gvU2tvbGUvbWFzdGVyL0VtaXNzaW9ucy9hcHAvQ29tbWFuZGVyQXBwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNFQSxJQUFJLEdBQUcsR0FBRyxPQUFPLENBQUMsMEJBQTBCLENBQUMsQ0FBQztBQUM5QyxJQUFJLFNBQVMsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsU0FBUyxDQUFDOztBQUVsRCxRQUFRLENBQUMsS0FBSyxFQUFFLFlBQVk7O0FBRTFCLElBQUUsQ0FBQywwQkFBMEIsRUFBRSxZQUFZO0FBQ3pDLFFBQUksR0FBRyxHQUFHLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0FBQzlDLFVBQU0sQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUMsQ0FBQztHQUNqRSxDQUFDLENBQUM7Q0FDSixDQUFDLENBQUM7Ozs7OztBQ1RILElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQzs7QUFFN0IsSUFBSSxHQUFHLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQztBQUN4QixlQUFXLEVBQUUsS0FBSzs7QUFFbEIsVUFBTSxFQUFFLFNBQVMsTUFBTSxHQUFHO0FBQ3RCLGVBQU8sS0FBSyxDQUFDLGFBQWEsQ0FDdEIsS0FBSyxFQUNMLElBQUksRUFDSixLQUFLLENBQUMsYUFBYSxDQUNmLEdBQUcsRUFDSCxFQUFFLEVBQUUsRUFBRSxhQUFhLEVBQUUsRUFDckIsNEJBQTRC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MUcsS0FBSyxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsYUFBYSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQy9GLENBQ0osQ0FBQztLQUNMOztDQUVKLENBQUMsQ0FBQzs7QUFFSCxNQUFNLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIEFwcCA9IHJlcXVpcmUoXCIuLy4uL2FwcC9Db21tYW5kZXJBcHAuanNcIik7XG52YXIgVGVzdFV0aWxzID0gcmVxdWlyZShcInJlYWN0LWFkZG9uc1wiKS5UZXN0VXRpbHM7XG5cbmRlc2NyaWJlKFwiQXBwXCIsIGZ1bmN0aW9uICgpIHtcblxuICBpdChcInNob3VsZCByZW5kZXIgc29tZSB0ZXh0IVwiLCBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGFwcCA9IFRlc3RVdGlscy5yZW5kZXJJbnRvRG9jdW1lbnQoQXBwKCkpO1xuICAgIGV4cGVjdChhcHAuZ2V0RE9NTm9kZSgpLnRleHRDb250ZW50Lmxlbmd0aCkudG9CZUdyZWF0ZXJUaGFuKDEwKTtcbiAgfSk7XG59KTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSnpiM1Z5WTJWeklqcGJJaTlWYzJWeWN5OWpZWEpzTFdWeWFXc3VhMjl3YzJWdVp5OUVjbTl3WW05NEwxTnJiMnhsTDIxaGMzUmxjaTlGYldsemMybHZibk12YzNCbFkzTXZRMjl0YldGdVpHVnlRWEJ3TFhOd1pXTXVhbk1pWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJanM3UVVGQlFTeEpRVUZKTEVkQlFVY3NSMEZCUnl4UFFVRlBMRU5CUVVNc01FSkJRVEJDTEVOQlFVTXNRMEZCUXp0QlFVTTVReXhKUVVGSkxGTkJRVk1zUjBGQlJ5eFBRVUZQTEVOQlFVTXNZMEZCWXl4RFFVRkRMRU5CUVVNc1UwRkJVeXhEUVVGRE96dEJRVVZzUkN4UlFVRlJMRU5CUVVNc1MwRkJTeXhGUVVGRkxGbEJRVmM3TzBGQlJYcENMRWxCUVVVc1EwRkJReXd3UWtGQk1FSXNSVUZCUlN4WlFVRlhPMEZCUTNoRExGRkJRVWtzUjBGQlJ5eEhRVUZITEZOQlFWTXNRMEZCUXl4clFrRkJhMElzUTBGQlF5eEhRVUZITEVWQlFVVXNRMEZCUXl4RFFVRkRPMEZCUXpsRExGVkJRVTBzUTBGQlF5eEhRVUZITEVOQlFVTXNWVUZCVlN4RlFVRkZMRU5CUVVNc1YwRkJWeXhEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETEdWQlFXVXNRMEZCUXl4RlFVRkZMRU5CUVVNc1EwRkJRVHRIUVVOb1JTeERRVUZETEVOQlFVTTdRMEZGU2l4RFFVRkRMRU5CUVVNaUxDSm1hV3hsSWpvaUwxVnpaWEp6TDJOaGNtd3RaWEpwYXk1cmIzQnpaVzVuTDBSeWIzQmliM2d2VTJ0dmJHVXZiV0Z6ZEdWeUwwVnRhWE56YVc5dWN5OXpjR1ZqY3k5RGIyMXRZVzVrWlhKQmNIQXRjM0JsWXk1cWN5SXNJbk52ZFhKalpYTkRiMjUwWlc1MElqcGJJblpoY2lCQmNIQWdQU0J5WlhGMWFYSmxLQ2N1THk0dUwyRndjQzlEYjIxdFlXNWtaWEpCY0hBdWFuTW5LVHRjYm5aaGNpQlVaWE4wVlhScGJITWdQU0J5WlhGMWFYSmxLQ2R5WldGamRDMWhaR1J2Ym5NbktTNVVaWE4wVlhScGJITTdYRzVjYm1SbGMyTnlhV0psS0Z3aVFYQndYQ0lzSUdaMWJtTjBhVzl1S0NrZ2UxeHVYRzRnSUdsMEtGd2ljMmh2ZFd4a0lISmxibVJsY2lCemIyMWxJSFJsZUhRaFhDSXNJR1oxYm1OMGFXOXVLQ2tnZTF4dUlDQWdJSFpoY2lCaGNIQWdQU0JVWlhOMFZYUnBiSE11Y21WdVpHVnlTVzUwYjBSdlkzVnRaVzUwS0VGd2NDZ3BLVHRjYmlBZ0lDQmxlSEJsWTNRb1lYQndMbWRsZEVSUFRVNXZaR1VvS1M1MFpYaDBRMjl1ZEdWdWRDNXNaVzVuZEdncExuUnZRbVZIY21WaGRHVnlWR2hoYmlneE1DbGNiaUFnZlNrN1hHNWNibjBwT3lKZGZRPT0iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIFJlYWN0ID0gcmVxdWlyZShcInJlYWN0XCIpO1xuXG52YXIgQXBwID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiBcIkFwcFwiLFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgXCJkaXZcIixcbiAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgIFwicFwiLFxuICAgICAgICAgICAgICAgIHsgaWQ6IFwibWlzc2lvblRpbWVcIiB9LFxuICAgICAgICAgICAgICAgIFwiT3BwZHJhZ2V0IGhhciBpa2tlIHN0YXJ0ZXRcIlxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgXCJkaXZcIixcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIFwiT3BwZHJhZ3N0aWQ6XCIsXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImlucHV0XCIsIHsgdHlwZTogXCJ0ZXh0XCIsIGlkOiBcIm1pc3Npb25MZW5ndGhcIiwgc2l6ZTogXCIzXCIgfSksXG4gICAgICAgICAgICAgICAgXCJtaW51dHRlclwiLFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgIFwiYnV0dG9uXCIsXG4gICAgICAgICAgICAgICAgICAgIHsgaWQ6IFwiY2hhbmdlTWlzc2lvblRpbWVcIiwgc3R5bGU6IHsgZGlzcGxheTogXCJub25lXCIgfSB9LFxuICAgICAgICAgICAgICAgICAgICBcIkVuZHJlIG9wcGRyYWdzdGlkXCJcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgIFwiYnV0dG9uXCIsXG4gICAgICAgICAgICAgICAgICAgIHsgaWQ6IFwic3RhcnRNaXNzaW9uXCIgfSxcbiAgICAgICAgICAgICAgICAgICAgXCJTdGFydCBvcHBkcmFnXCJcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICBcImJ1dHRvblwiLFxuICAgICAgICAgICAgICAgIHsgaWQ6IFwiam9iRmluaXNoZWRcIiwgc3R5bGU6IHsgZGlzcGxheTogXCJub25lXCIgfSB9LFxuICAgICAgICAgICAgICAgIFwiT3BwZHJhZyB1dGbDuHJ0XCJcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICBcInZpZGVvXCIsXG4gICAgICAgICAgICAgICAgICAgIHsgaWQ6IFwiYXN0cm9uYXV0VmlkZW9cIiwgd2lkdGg6IFwiMjcwcHhcIiwgaGVpZ2h0OiBcIjE4MHB4XCIsIGF1dG9QbGF5OiBcInRydWVcIiwgbG9vcDogXCJ0cnVlXCIsIGNvbnRyb2xzOiBcInRydWVcIiwgbXV0ZWQ6IFwidHJ1ZVwiIH0sXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzb3VyY2VcIiwgeyB0eXBlOiBcInZpZGVvL3dlYm1cIiB9KVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICBcImJ1dHRvblwiLFxuICAgICAgICAgICAgICAgICAgICB7IGlkOiBcInN0b3BCdXR0b25cIiB9LFxuICAgICAgICAgICAgICAgICAgICBcIlN0b3BwXCJcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgIFwiYnV0dG9uXCIsXG4gICAgICAgICAgICAgICAgICAgIHsgaWQ6IFwiYXN0cm9uYXV0SGFwcHlcIiB9LFxuICAgICAgICAgICAgICAgICAgICBcIkdsYWRcIlxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgXCJidXR0b25cIixcbiAgICAgICAgICAgICAgICAgICAgeyBpZDogXCJhc3Ryb25hdXROZXJ2b3VzXCIgfSxcbiAgICAgICAgICAgICAgICAgICAgXCJOZXJ2w7hzXCJcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICBcImRpdlwiLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgXCJidXR0b25cIixcbiAgICAgICAgICAgICAgICAgICAgeyBpZDogXCJjYWxsU2VjdXJpdHlUZWFtXCIsIGNsYXNzTmFtZTogXCJjYWxsXCIgfSxcbiAgICAgICAgICAgICAgICAgICAgXCJSaW5nIHNpa2tlcmhldHMtdGVhbWV0XCJcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJiclwiLCBudWxsKSxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICBcImJ1dHRvblwiLFxuICAgICAgICAgICAgICAgICAgICB7IGlkOiBcImNhbGxDb21tdW5pY2F0aW9uVGVhbVwiLCBjbGFzc05hbWU6IFwiY2FsbFwiIH0sXG4gICAgICAgICAgICAgICAgICAgIFwiUmluZyBrb21tdW5pa2Fzam9ucy10ZWFtZXRcIlxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgXCJzcGFuXCIsXG4gICAgICAgICAgICAgICAgICAgIHsgaWQ6IFwiY2FsbGVySWRcIiwgY2xhc3NOYW1lOiBcImluY29taW5nQ2FsbFwiIH0sXG4gICAgICAgICAgICAgICAgICAgIFwiWCByaW5nZXJcIlxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgXCJidXR0b25cIixcbiAgICAgICAgICAgICAgICAgICAgeyBpZDogXCJhbnN3ZXJCdXR0b25cIiwgY2xhc3NOYW1lOiBcImluY29taW5nQ2FsbFwiIH0sXG4gICAgICAgICAgICAgICAgICAgIFwiU3ZhclwiXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICBcImJ1dHRvblwiLFxuICAgICAgICAgICAgICAgICAgICB7IGlkOiBcImhhbmdVcFwiIH0sXG4gICAgICAgICAgICAgICAgICAgIFwiTGVnZyBww6VcIlxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwidmlkZW9cIiwgeyBpZDogXCJsb2NhbFZpZGVvXCIsIGNsYXNzTmFtZTogXCJydGNWaWRlb1wiLCBhdXRvUGxheTogXCJ0cnVlXCIsIG11dGVkOiBcInRydWVcIiB9KSxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwidmlkZW9cIiwgeyBpZDogXCJyZW1vdGVWaWRlb1wiLCBjbGFzc05hbWU6IFwicnRjVmlkZW9cIiwgYXV0b1BsYXk6IFwidHJ1ZVwiIH0pXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBBcHA7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0p6YjNWeVkyVnpJanBiSWk5VmMyVnljeTlqWVhKc0xXVnlhV3N1YTI5d2MyVnVaeTlFY205d1ltOTRMMU5yYjJ4bEwyMWhjM1JsY2k5RmJXbHpjMmx2Ym5NdllYQndMME52YlcxaGJtUmxja0Z3Y0M1cWN5SmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaU96dEJRVUZCTEVsQlFVa3NTMEZCU3l4SFFVRkhMRTlCUVU4c1EwRkJReXhQUVVGUExFTkJRVU1zUTBGQlF6czdRVUZGTjBJc1NVRkJTU3hIUVVGSExFZEJRVWNzUzBGQlN5eERRVUZETEZkQlFWY3NRMEZCUXpzN08wRkJRM2hDTEZWQlFVMHNSVUZCUVN4clFrRkJSenRCUVVOTUxHVkJRMGs3T3p0WlFVVkpPenRyUWtGQlJ5eEZRVUZGTEVWQlFVTXNZVUZCWVRzN1lVRkJLMEk3V1VGRmJFUTdPenM3WjBKQlJVa3NLMEpCUVU4c1NVRkJTU3hGUVVGRExFMUJRVTBzUlVGQlF5eEZRVUZGTEVWQlFVTXNaVUZCWlN4RlFVRkRMRWxCUVVrc1JVRkJReXhIUVVGSExFZEJRVWM3TzJkQ1FVVnFSRHM3YzBKQlFWRXNSVUZCUlN4RlFVRkRMRzFDUVVGdFFpeEZRVUZETEV0QlFVc3NSVUZCUlN4RlFVRkRMRTlCUVU4c1JVRkJSU3hOUVVGTkxFVkJRVU1zUVVGQlF6czdhVUpCUVRKQ08yZENRVU51UmpzN2MwSkJRVkVzUlVGQlJTeEZRVUZETEdOQlFXTTdPMmxDUVVGMVFqdGhRVU01UXp0WlFVVk9PenRyUWtGQlVTeEZRVUZGTEVWQlFVTXNZVUZCWVN4RlFVRkRMRXRCUVVzc1JVRkJSU3hGUVVGRExGTkJRVmNzVFVGQlRTeEZRVUZETEVGQlFVTTdPMkZCUVhkQ08xbEJSVFZGT3pzN1owSkJRMGs3TzNOQ1FVRlBMRVZCUVVVc1JVRkJReXhuUWtGQlowSXNSVUZCUXl4TFFVRkxMRVZCUVVNc1QwRkJUeXhGUVVGRExFMUJRVTBzUlVGQlF5eFBRVUZQTEVWQlFVTXNVVUZCVVN4RlFVRkRMRTFCUVUwc1JVRkJReXhKUVVGSkxFVkJRVU1zVFVGQlRTeEZRVUZETEZGQlFWRXNSVUZCUXl4TlFVRk5MRVZCUVVNc1MwRkJTeXhGUVVGRExFMUJRVTA3YjBKQlF6VkhMR2REUVVGUkxFbEJRVWtzUlVGQlF5eFpRVUZaTEVkQlFWVTdhVUpCUXk5Q08yRkJRMDQ3V1VGRlRqczdPMmRDUVVOSk96dHpRa0ZCVVN4RlFVRkZMRVZCUVVNc1dVRkJXVHM3YVVKQlFXVTdaMEpCUTNSRE96dHpRa0ZCVVN4RlFVRkZMRVZCUVVNc1owSkJRV2RDT3p0cFFrRkJZenRuUWtGRGVrTTdPM05DUVVGUkxFVkJRVVVzUlVGQlF5eHJRa0ZCYTBJN08ybENRVUZuUWp0aFFVTXpRenRaUVVWT096czdaMEpCUTBrN08zTkNRVUZSTEVWQlFVVXNSVUZCUXl4clFrRkJhMElzUlVGQlF5eFRRVUZUTEVWQlFVTXNUVUZCVFRzN2FVSkJRV2RETzJkQ1FVTTVSU3dyUWtGQlN6dG5Ra0ZEVERzN2MwSkJRVkVzUlVGQlJTeEZRVUZETEhWQ1FVRjFRaXhGUVVGRExGTkJRVk1zUlVGQlF5eE5RVUZOT3p0cFFrRkJiME03WjBKQlEzWkdPenR6UWtGQlRTeEZRVUZGTEVWQlFVTXNWVUZCVlN4RlFVRkRMRk5CUVZNc1JVRkJReXhqUVVGak96dHBRa0ZCWjBJN1owSkJRelZFT3p0elFrRkJVU3hGUVVGRkxFVkJRVU1zWTBGQll5eEZRVUZETEZOQlFWTXNSVUZCUXl4alFVRmpPenRwUWtGQll6dG5Ra0ZEYUVVN08zTkNRVUZSTEVWQlFVVXNSVUZCUXl4UlFVRlJPenRwUWtGQmFVSTdZVUZEYkVNN1dVRkZUanM3TzJkQ1FVTkpMQ3RDUVVGUExFVkJRVVVzUlVGQlF5eFpRVUZaTEVWQlFVTXNVMEZCVXl4RlFVRkRMRlZCUVZVc1JVRkJReXhSUVVGUkxFVkJRVU1zVFVGQlRTeEZRVUZETEV0QlFVc3NSVUZCUXl4TlFVRk5MRWRCUVZNN1owSkJRMnBHTEN0Q1FVRlBMRVZCUVVVc1JVRkJReXhoUVVGaExFVkJRVU1zVTBGQlV5eEZRVUZETEZWQlFWVXNSVUZCUXl4UlFVRlJMRVZCUVVNc1RVRkJUU3hIUVVGVE8yRkJRMjVGTzFOQlJVb3NRMEZEVWp0TFFVTk1PenREUVVWS0xFTkJRVU1zUTBGQlF6czdRVUZGU0N4TlFVRk5MRU5CUVVNc1QwRkJUeXhIUVVGSExFZEJRVWNzUTBGQlF5SXNJbVpwYkdVaU9pSXZWWE5sY25NdlkyRnliQzFsY21sckxtdHZjSE5sYm1jdlJISnZjR0p2ZUM5VGEyOXNaUzl0WVhOMFpYSXZSVzFwYzNOcGIyNXpMMkZ3Y0M5RGIyMXRZVzVrWlhKQmNIQXVhbk1pTENKemIzVnlZMlZ6UTI5dWRHVnVkQ0k2V3lKMllYSWdVbVZoWTNRZ1BTQnlaWEYxYVhKbEtDZHlaV0ZqZENjcE8xeHVYRzUyWVhJZ1FYQndJRDBnVW1WaFkzUXVZM0psWVhSbFEyeGhjM01vZTF4dUlDQWdJSEpsYm1SbGNpZ3BJSHRjYmlBZ0lDQWdJQ0FnY21WMGRYSnVJQ2hjYmlBZ0lDQWdJQ0FnSUNBZ0lEeGthWFkrWEc1Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBOGNDQnBaRDFjSW0xcGMzTnBiMjVVYVcxbFhDSStUM0J3WkhKaFoyVjBJR2hoY2lCcGEydGxJSE4wWVhKMFpYUThMM0ErWEc1Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBOFpHbDJQbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCUGNIQmtjbUZuYzNScFpEcGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnUEdsdWNIVjBJSFI1Y0dVOVhDSjBaWGgwWENJZ2FXUTlYQ0p0YVhOemFXOXVUR1Z1WjNSb1hDSWdjMmw2WlQxY0lqTmNJaUF2UGx4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnRhVzUxZEhSbGNseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0E4WW5WMGRHOXVJR2xrUFZ3aVkyaGhibWRsVFdsemMybHZibFJwYldWY0lpQnpkSGxzWlQxN2UyUnBjM0JzWVhrNklGd2libTl1WlZ3aWZYMCtSVzVrY21VZ2IzQndaSEpoWjNOMGFXUThMMkoxZEhSdmJqNWNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnUEdKMWRIUnZiaUJwWkQxY0luTjBZWEowVFdsemMybHZibHdpUGxOMFlYSjBJRzl3Y0dSeVlXYzhMMkoxZEhSdmJqNWNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQThMMlJwZGo1Y2JseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lEeGlkWFIwYjI0Z2FXUTlYQ0pxYjJKR2FXNXBjMmhsWkZ3aUlITjBlV3hsUFh0N1hDSmthWE53YkdGNVhDSTZJRndpYm05dVpWd2lmWDArVDNCd1pISmhaeUIxZEdiRHVISjBQQzlpZFhSMGIyNCtYRzVjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0E4WkdsMlBseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0E4ZG1sa1pXOGdhV1E5WENKaGMzUnliMjVoZFhSV2FXUmxiMXdpSUhkcFpIUm9QVndpTWpjd2NIaGNJaUJvWldsbmFIUTlYQ0l4T0RCd2VGd2lJR0YxZEc5UWJHRjVQVndpZEhKMVpWd2lJR3h2YjNBOVhDSjBjblZsWENJZ1kyOXVkSEp2YkhNOVhDSjBjblZsWENJZ2JYVjBaV1E5WENKMGNuVmxYQ0krWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0E4YzI5MWNtTmxJSFI1Y0dVOVhDSjJhV1JsYnk5M1pXSnRYQ0krUEM5emIzVnlZMlUrWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lEd3ZkbWxrWlc4K1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1BDOWthWFkrWEc1Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBOFpHbDJQbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBOFluVjBkRzl1SUdsa1BWd2ljM1J2Y0VKMWRIUnZibHdpUGxOMGIzQndQQzlpZFhSMGIyNCtYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUR4aWRYUjBiMjRnYVdROVhDSmhjM1J5YjI1aGRYUklZWEJ3ZVZ3aVBrZHNZV1E4TDJKMWRIUnZiajVjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1BHSjFkSFJ2YmlCcFpEMWNJbUZ6ZEhKdmJtRjFkRTVsY25admRYTmNJajVPWlhKMnc3aHpQQzlpZFhSMGIyNCtYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdQQzlrYVhZK1hHNWNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQThaR2wyUGx4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQThZblYwZEc5dUlHbGtQVndpWTJGc2JGTmxZM1Z5YVhSNVZHVmhiVndpSUdOc1lYTnpUbUZ0WlQxY0ltTmhiR3hjSWo1U2FXNW5JSE5wYTJ0bGNtaGxkSE10ZEdWaGJXVjBQQzlpZFhSMGIyNCtYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUR4aWNpOCtYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUR4aWRYUjBiMjRnYVdROVhDSmpZV3hzUTI5dGJYVnVhV05oZEdsdmJsUmxZVzFjSWlCamJHRnpjMDVoYldVOVhDSmpZV3hzWENJK1VtbHVaeUJyYjIxdGRXNXBhMkZ6YW05dWN5MTBaV0Z0WlhROEwySjFkSFJ2Ymo1Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdQSE53WVc0Z2FXUTlYQ0pqWVd4c1pYSkpaRndpSUdOc1lYTnpUbUZ0WlQxY0ltbHVZMjl0YVc1blEyRnNiRndpUGxnZ2NtbHVaMlZ5UEM5emNHRnVQbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBOFluVjBkRzl1SUdsa1BWd2lZVzV6ZDJWeVFuVjBkRzl1WENJZ1kyeGhjM05PWVcxbFBWd2lhVzVqYjIxcGJtZERZV3hzWENJK1UzWmhjand2WW5WMGRHOXVQbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBOFluVjBkRzl1SUdsa1BWd2lhR0Z1WjFWd1hDSStUR1ZuWnlCd3c2VThMMkoxZEhSdmJqNWNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQThMMlJwZGo1Y2JseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lEeGthWFkrWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lEeDJhV1JsYnlCcFpEMWNJbXh2WTJGc1ZtbGtaVzljSWlCamJHRnpjMDVoYldVOVhDSnlkR05XYVdSbGIxd2lJR0YxZEc5UWJHRjVQVndpZEhKMVpWd2lJRzExZEdWa1BWd2lkSEoxWlZ3aVBqd3ZkbWxrWlc4K1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJRHgyYVdSbGJ5QnBaRDFjSW5KbGJXOTBaVlpwWkdWdlhDSWdZMnhoYzNOT1lXMWxQVndpY25SalZtbGtaVzljSWlCaGRYUnZVR3hoZVQxY0luUnlkV1ZjSWo0OEwzWnBaR1Z2UGx4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUR3dlpHbDJQbHh1WEc0Z0lDQWdJQ0FnSUNBZ0lDQThMMlJwZGo1Y2JpQWdJQ0FnSUNBZ0tUdGNiaUFnSUNCOVhHNWNibjBwTzF4dVhHNXRiMlIxYkdVdVpYaHdiM0owY3lBOUlFRndjRHRjYmlKZGZRPT0iXX0=