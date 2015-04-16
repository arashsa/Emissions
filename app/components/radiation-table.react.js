const React = require('react');

module.exports = React.createClass({

    statics: {},
    propTypes: {
        samples: React.PropTypes.array.isRequired,
        minimalRowsToShow: React.PropTypes.number
    },

    // Private methods

    getDefaultProps(){
        return {minimalRowsToShow: 0};
    },

    render() {
        let sampleRows = this.props.samples.map((val, i) => {
                return <tr key={i}>
                    <th scope="row">{i + 1}</th>
                    <td>{val}</td>
                </tr>
            }),
            missingRows = this.props.minimalRowsToShow - sampleRows.length,
            fillRows;

        if (missingRows > 0) {
            fillRows = [];

            while (missingRows--) {
                fillRows.push(<tr key={fillRows.length}>
                        <th scope="row"></th>
                        <td>&nbsp;{/* Needs filler to not collapse cell */}</td>
                    </tr>
                );
            }

        }

        return (
            <div className={this.props.className}>

                <h3>Prøveresultater</h3>
                <table className=" table table-bordered">
                    <caption>
                        Mikrosievert per time (μSv/h):
                    </caption>
                    <thead>
                    <tr>
                        <th scope="col">Prøvenummer</th>
                        <th scope="col">μSv/h</th>
                    </tr>
                    </thead>
                    <tbody>
                    { sampleRows }
                    { fillRows }
                    </tbody>
                </table>

            </div>
        );
    }

});

