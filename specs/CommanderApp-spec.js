var App = require('./../app/CommanderApp.js');
var TestUtils = require('react-addons').TestUtils;

describe("App", function() {

  it("should render some text!", function() {
    var app = TestUtils.renderIntoDocument(App());
    expect(app.getDOMNode().textContent.length).toBeGreaterThan(10)
  });

});