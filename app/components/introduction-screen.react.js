const React = require('react');
/**
 * Available properties
 * missionStarted {Boolean}
 * buttonText = what text to give the button
 * nextAction = what action to trigger when pressing the button
 */
module.exports = React.createClass({
    render() {
        var disabled = this.props.missionStarted? '' : 'disabled';

        return (<div className = 'jumbotron introscreen'>
            <h2>Mål for oppdraget</h2>
            {this.props.children}
            <button
                className = 'btn btn-primary btn-lg'
                onClick={this.props.nextAction}
                disabled={disabled}
            >
            { this.props.buttonText || 'Jeg forstår' }
            </button>
        </div>)

    }
});
