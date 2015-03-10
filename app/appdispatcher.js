/*
 * Dispatcher - a singleton
 *
 * This is essentially the main driver in the Flux architecture
 * @see http://facebook.github.io/flux/docs/overview.html
*/

const { Dispatcher } = require('flux');

const AppDispatcher = Object.assign(new Dispatcher(), {

    // optional methods

});

module.exports = AppDispatcher;