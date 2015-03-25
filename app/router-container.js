// proxy access to the router as first step in bringing it into the flux flow
// @see https://github.com/rackt/react-router/blob/master/docs/guides/flux.md

var router;

module.exports = {
    transitionTo(...args) {
        return router.transitionTo(...args)
    },

    getCurrentPathname() {
        return router.getCurrentPathname();
    },

    run(...args) {
        return router.run(...args)
    }
};

const Router = require('react-router');
const routes = require('./routes.react');

// By the time route config is require()-d,
// require('./router') already returns a valid object

router = Router.create({
    routes: routes,

    // Use the HTML5 History API for clean URLs
    location: Router.HistoryLocation
});
