var App = require('./../app/components/commander-app.react');
var TestUtils = require('react-addons').TestUtils;

describe("App", function () {

    it("should render some text!", function () {
        var app = TestUtils.renderIntoDocument(App());
        expect(app.getDOMNode().textContent.length).toBeGreaterThan(10)
    });

    it('should pass', function () {
        expect(4).toEqual(4);
    });

});