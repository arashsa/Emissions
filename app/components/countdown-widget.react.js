// This example can be modified to act as a countdown timer


const React = require('react'),
    printf = require('printf');

function pad(num) {
    return printf('%02d', num);
}

const CountdownWidget = React.createClass({

    componentWillMount() {
        this.props.timeStore.addChangeListener(this._fetchAndSetRemainingTime);
    },

    componentWillUnmount() {
        this.props.timeStore.removeChangeListener(this._fetchAndSetRemainingTime);
    },

    _fetchAndSetRemainingTime() {
        this.setState({seconds: this.props.timeStore.getRemainingTime()});
    },

    getInitialState() {
        return {seconds: this.props.timeStore.getRemainingTime()};
    },

    minutes() {
        return pad(Math.max(0,this.state.seconds) / 60 >> 0);
    },

    seconds() {
        return pad(Math.max(0,this.state.seconds) % 60);
    },

    render() {
        if (this.state.seconds < 0) {

            return (
                <div className={this.props.className}>
                {this.props.notStartedText}
                </div>);
        }

        return (
            <div className={this.props.className}>
                {this.props.runningText}
                <span> {this.minutes()}:{this.seconds()}</span>
            </div>
        );
    }
});

module.exports = CountdownWidget;

