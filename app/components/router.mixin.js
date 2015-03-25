
// skal jeg bruke denne?

var routerMixin = {

    contextTypes: {
        router: React.PropTypes.func.isRequired
    },

    transitionTo(...args) {
        this.context.router.transitionTo(...args);
    }
};


module.exports = routerMixin;