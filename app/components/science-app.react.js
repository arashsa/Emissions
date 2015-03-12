var React = require('react');


var App = React.createClass({

    introText() {

        return (
            <div className = 'jumbotron'>
                <h2>Mål for oppdraget</h2>
                <p>
                    Dere skal overvåke strålingsnivået astronatuen utsettes for.
                    Dere må da passe på at astronauten ikke blir utsatt
                    for strålingsnivåer som er skadelig.
                </p>
                <p>Ved hjelp av instrumentene som er tilgjengelig må dere jevnlig
                    ta prøver og regne ut hva verdiene ligger på.
                </p>

                <p>
                    Er oppdraget forstått?
                </p>
                <button  className = 'btn btn-primary btn-lg' onClick={this._onIntroClick}
                >Jeg forstår</button>
            </div>
        );
    },

    createUI() {
      return <div>
        <div className = 'messages'>
            <div className="alert alert-success" >
                <strong>Til info.</strong> Dette er en beskjed!</div>
            <div className="alert alert-warning" >NOT VELLY GUDD!</div>
        </div>
      </div>
    },

    getInitialState() {
        return {step: 0};
    },

    _onIntroClick() {
        this.setState({step: 1});
    },

    render() {
        return (
            <div className = 'container'>
            {this.state.step === 0? this.introText(): this.createUI()}
            </div>
        );
    }

});

module.exports = App;
