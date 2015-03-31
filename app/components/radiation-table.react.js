const React = require('react');

module.exports = React.createClass({

    statics: {},
    propTypes: {
        samples: React.PropTypes.array.isRequired
    },

    // Private methods

    render() {
        return (
            <div className={this.props.className} >

                <table className=" table table-bordered">
                    <caption>
                        Prøveverdier er oppgitt i mikrosievert per time (μSv/h):
                    </caption>
                    <thead>
                        <tr>
                            <th>Prøvenummer</th>
                            <th>μSv/h</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            this.props.samples.map((val, i) => {
                                return <tr>
                                    <th scope="row">{i + 1}</th>
                                    <td>{val}</td>
                                </tr>
                            })
                            }
                    </tbody>
                </table>

            </div>
        );
    }

});

