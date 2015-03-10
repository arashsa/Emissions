/* A store that can be queried for the current path */

const { Emitter } = require('events');
const { State } = require('react-router');
const AppDispatcher = require('../appdispatcher');
const BaseStore = require('./base-store');
const { ROUTE_CHANGED_EVENT } = require('../constants');

var routeState = { pathname : '<unset>' };

var PathStore = Object.assign(new BaseStore(), {


    handleRouteChanged(state) {
        routeState = state;
        this.emit('change');
    },

    getPathname() {
        var pathname = routeState.pathname;
        return pathname? pathname.slice(1) : '';
    },


    dispatcherIndex: AppDispatcher.register(function (payload) {
        var action = payload.action;

        switch (action) {
            case ROUTE_CHANGED_EVENT:
                PathStore.handleRouteChanged(payload.state);
                break;
        }

        return true; // No errors. Needed by promise in Dispatcher.
    })

});

window.PathStore = PathStore;
module.exports = PathStore;
