var React = require('react');

var ListMessageWrapper = React.createClass({

    propTypes: {
        level: React.PropTypes.string.isRequired,
        text: React.PropTypes.string.isRequired,
        id: React.PropTypes.string.isRequired
    },

    render() {
        let button = (
            <button type="button" className="close" data-dismiss="alert">
                <span>×</span>
            </button>);

        return (
            <li className={ 'alert alert-dismissible alert-' + this.props.level} >
            { this.props.dismissable ? button : ''}
            {this.props.text}
            </li>
        );
    }
});

var MessageList = React.createClass({

    render() {
        var hidden = () => this.props.messages.length === 0 ? 'hide' : '';

        return (
            <ul className = { this.props.className + ' messagebox ' + hidden()}>
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
