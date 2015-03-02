/**
 * Minimal singleton router - good enoughfor our needs
 *
 * @see http://krasimirtsonev.com/blog/article/A-modern-JavaScript-router-in-100-lines-history-api-pushState-hash-url
 *
 * @example
 *  // configuration
 *  Router.config({ mode: 'history'});
 *
 *  // returning the user to the initial state
 *  Router.navigate();
 *
 *  // adding routes
 *  Router
 *  .add(/about/, function() {
 *     console.log('about');
 * })
 *  .add(/products\/(.*)\/edit\/(.*)/, function() {
 *     console.log('products', arguments);
 * })
 *  .add(function() {
 *     console.log('default');
 * })
 *  .check('/products/12/edit/22').listen();
 *
 *  // forwarding
 *  Router.navigate('/about');
 */
var window = require('global/window'),
    document = require('global/document'),
    mode = null,
    routes = [],
    root = '/';


function getFragment() {
    var fragment = '';
    if (mode === 'history') {
        fragment = clearSlashes(decodeURI(location.pathname + location.search));
        fragment = fragment.replace(/\?(.*)$/, '');
        fragment = root != '/' ? fragment.replace(root, '') : fragment;
    } else {
        var match = window.location.href.match(/#(.*)$/);
        fragment = match ? match[1] : '';
    }
    return clearSlashes(fragment);
}

function clearSlashes(path) {
    return path.toString().replace(/\/$/, '').replace(/^\//, '');
}

var Router = {
    config: function (options) {
        mode = options && options.mode && options.mode == 'history'
        && !!(history.pushState) ? 'history' : 'hash';
        root = options && options.root ? '/' + clearSlashes(options.root) + '/' : '/';
        return this;
    },
    add: function (re, handler) {
        if (typeof re == 'function') {
            handler = re;
            re = '';
        }
        routes.push({re: re, handler: handler});
        return this;
    },
    remove: function (param) {
        for (var i = 0, r; i < routes.length, r = routes[i]; i++) {
            if (r.handler === param || r.re.toString() === param.toString()) {
                routes.splice(i, 1);
                return this;
            }
        }
        return this;
    },
    flush: function () {
        routes = [];
        mode = null;
        root = '/';
        return this;
    },
    // trigger handler function if a route exists
    check: function (f) {
        var fragment = f || getFragment();
        for (var i = 0; i < routes.length; i++) {
            var match = fragment.match(routes[i].re);
            if (match) {
                match.shift();
                routes[i].handler.apply({}, match);
                return this;
            }
        }
        return this;
    },
    // will only trigger a handler if the routing has changed
    listen: function () {
        var self = this;
        var current = getFragment();
        var fn = function () {
            if (current !== getFragment()) {
                current = getFragment();
                self.check(current);
            }
        };

        clearInterval(this.interval);
        this.interval = setInterval(fn, 50);
        return this;
    },
    navigate: function (path) {
        path = path ? clearSlashes(path) : '';
        if (mode === 'history') {
            history.pushState(null, null, root + clearSlashes(path));
        } else {
            window.location.href = window.location.href.replace(/#(.*)$/, '') + '#' + path.replace(/#/,'');
        }
        return this;
    }
};

module.exports = Router;
