var App = require('./../app/components/mission-commander.react.js');
var React = require('react/addons');
var TestUtils = React.addons.TestUtils;

describe("client.App", function () {

    it("should render some text!", function () {
        var app = TestUtils.renderIntoDocument(React.createElement(App));
        expect(React.findDOMNode(app).textContent.length).toBeGreaterThan(10)
    });

    it('should pass', function () {
        expect(4).toEqual(4);
    });

});