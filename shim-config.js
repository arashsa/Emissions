/*
 * We are using Browserify Shim to be able to require() libraries that
 * we are not bundling . This config specifies by what name they are exposed
 * in the global scope and by what name they are available to us.
 *
 * If you want to do conditional shimming for some reason, just set a global
 * flag in the gulpfile, like `global.SHIM`, test for that here, and
 * set up the exports accordingly. I ended up not going this route, and simply
 * add local library files instead.
 *
 * @see https://www.npmjs.com/package/browserify-shim
 */

module.exports = {
    'amcharts': {exports: 'global:AmCharts'},
    'react': {exports: 'global:React'},
    'react-router': {exports: 'global:ReactRouter'}
};