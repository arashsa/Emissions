/* A store that can be queried for the current path */

const AppDispatcher = require('../appdispatcher');
const BaseStore = require('./base-store');
const { ROUTE_CHANGED_EVENT } = require('../constants');
const { cleanRootPath }= require('../utils');

var routeState = {pathname: '<unset>'};

var RouteStore = Object.assign(new BaseStore(), {

    handleRouteChanged(state) {
        routeState = state;
        this.emitChange();
    },

    getPathname() {
        var pathname = routeState.pathname;
        return pathname ? pathname.slice(1) : '';
    },

    getTeamId() {
        return routeState.params.teamId;
    },

    getTaskId() {
        return routeState.params.taskId;
    },

    getRouteState() {
      return routeState;
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
