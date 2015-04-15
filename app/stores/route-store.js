/* A store that can be queried for the current path */

const AppDispatcher = require('../appdispatcher');
const BaseStore = require('./base-store');
const { ROUTE_CHANGED_EVENT } = require('../constants');
const { cleanRootPath }= require('../utils');

var router = require('../router-container')

var RouteStore = Object.assign(new BaseStore(), {

    handleRouteChanged(state) {
        this.emitChange();
    },

    getTeamId() {
        return router.getTeamId();
    },

    getTaskId() {
        return router.getTaskId();
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
