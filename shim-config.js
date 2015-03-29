/*
 * We are using Browserify Shim to be able to require() libraries that
 * we are not bundling . This config specifies by what name they are exposed
 * in the global scope and by what name they are available to us.
 *
 * @see https://www.npmjs.com/package/browserify-shim
 */
module.exports = {
    'amcharts': {exports: 'global:AmCharts'},
    'react': {exports: 'global:React'},
    'react-router': {exports: 'global:ReactRouter'}
};