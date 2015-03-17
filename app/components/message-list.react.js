var React = require('react');

var ListMessageWrapper = React.createClass({

    render() {
        let button = (
            <button type="button" className="close" data-dismiss="alert">
                <span>×</span>
            </button>);

        return <li className={ 'alert alert-dismissible alert-' + this.props.data.level} >
        { this.props.data.dismissable ? button : ''}
            {this.props.data.text}
        </li>;
    }
});

var App = React.createClass({

    render() {
        return (
            <ul className = 'messagebox'>
            { this.props.messages.map((msg) => {
                return (<ListMessageWrapper key={msg.id} data={msg} />);
            })
                }
            </ul>
        );
    }

});

module.exports = App;
