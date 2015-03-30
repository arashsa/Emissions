const React = require('react');
const actions = require('../actions');

var ListMessageWrapper = React.createClass({

    propTypes: {
        level: React.PropTypes.string.isRequired,
        text: React.PropTypes.string.isRequired,
        id: React.PropTypes.string.isRequired
    },

    render() {
        let button;

        if (this.props.dismissable) {
            button = (
                <button
                    type="button"
                    className="close"
                    onClick={() => actions.removeMessage(this.props.id)}
                >
                    <span>×</span>
                </button>
            );
        }

        return (
            <li className={ 'alert alert-dismissible alert-' + this.props.level} >
            { button }
            {this.props.text}
            </li>
        );
    }
});

var MessageList = React.createClass({

    render() {
        var hidden = this.props.messages.length === 0 ? 'hide' : '';
        var classes = (this.props.className || '') + ' messagebox ' + hidden;

        return (
            <ul className = { classes }>
            {
                this.props.messages.map((msg) => {
                    return (<ListMessageWrapper key={msg.id} {...msg} />);
                })
            }
            </ul>
        );
    }

});

module.exports = MessageList;
