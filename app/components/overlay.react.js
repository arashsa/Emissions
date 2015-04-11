/*
 * Simple component that overlays a section, signalling a disabled state
 *
 * Dependant on working CSS, of course: the parent must be positioned (relative, absolute, ...)
 * Loosely based http://stackoverflow.com/questions/3627283/how-to-dim-other-div-on-clicking-input-box-using-jquery
 */
const React = require('react');

module.exports = React.createClass({

    propTypes: {
        active : React.PropTypes.bool.isRequired
    },

    render() {
        return (this.props.active? <div className="overlay"/> : null);
    }

});