// proxy access to the router as first step in bringing it into the flux flow
// @see https://github.com/rackt/react-router/blob/master/docs/guides/flux.md

var router = null;

window.__router = module.exports = {
    transitionTo(to,params,query) {
        return router.transitionTo(to,params,query)
    },

    getCurrentPathname() {
        return window.location.pathname;
    },

    getTeamId(){
      return this.getCurrentPathname().split('/')[1];
    },

    getTaskId(){
        return this.getCurrentPathname().split('/')[3];
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
