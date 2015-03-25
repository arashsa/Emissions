/* A store that can be queried for the current path */

const ReactRouter = require('react-router');
const AppDispatcher = require('../appdispatcher');
const BaseStore = require('./base-store');
const { ROUTE_CHANGED_EVENT } = require('../constants');

var routeState = {pathname: '<unset>'};

function cleanRootPath(path) {
    // convert '/science/step1' => 'science'
    return path.replace(/\/?(\w+).*/, "$1");
}


var RouteStore = Object.assign(new BaseStore(), {


    handleRouteChanged(state) {
        routeState = state;
        this.emit('change');
    },

    getPathname() {
        var pathname = routeState.pathname;
        return pathname ? pathname.slice(1) : '';
    },

    getTeamName() {
        return cleanRootPath(this.getPathname());
    },

    dispatcherIndex: AppDispatcher.register(function (payload) {
        var action = payload.action;

        switch (action) {
            case ROUTE_CHANGED_EVENT:
                RouteStore.handleRouteChanged(payload.state);
                break;
        }

        return true; // No errors. Needed by promise in Dispatcher.
    })

});

window.__RouteStore = RouteStore;
module.exports = RouteStore;
