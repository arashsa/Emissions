const React = require('react');

// skal jeg bruke denne?

var routerMixin = {

    contextTypes: {
        router: React.PropTypes.func.isRequired
    },

    _transitionTo(...args) {
        this.context.router.transitionTo(...args);
    },

    _getCurrentParams(){
        return this.context.router.getCurrentParams();
    }
};


module.exports = routerMixin;