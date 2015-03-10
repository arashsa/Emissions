// This example can be modified to act as a countdown timer


var React = require('react');

var SetIntervalMixin = {

    componentWillMount () {
        this.intervals = [];
    },

    setInterval () {
        this.intervals.push(setInterval.apply(null, arguments));
    },

    componentWillUnmount () {
        this.intervals.map(clearInterval);
    }

};

const TickTock = React.createClass({

    mixins: [SetIntervalMixin],

    componentWillMount() {
    },

    getInitialState() {
        return {seconds: 0};
    },

    componentDidMount() {
        this.setInterval(this.tick, 1000); // Call a method on the mixin
    },

    tick() {
        this.setState({seconds: this.state.seconds + 1});
    },

    render() {
        console.log('tick tock', this.state.seconds);

        return (
            <div>
                Oppgavetid: {this.state.seconds} sekunder.
            </div>
        );
    }
});

module.exports = TickTock;

