// needed to avoid compilation error
const React = require('react');

module.exports = {
    science_intro: <div>
        <p>
            Dere skal overvåke strålingsnivået astronatuen utsettes for.
            Dere må da passe på at astronauten ikke blir utsatt
            for strålingsnivåer som er skadelig.
        </p>

        <p>Ved hjelp av instrumentene som er tilgjengelig må dere jevnlig
            ta prøver og regne ut verdiene for gjennomsnittlig og totalt
            strålingsnivå. Finner dere ut at nivåene er blitt farlig
            høye <em>må</em> dere si fra til oppdragslederen så vi kan
            få ut astronauten!
        </p>


        <p>
            Er oppdraget forstått?
        </p>
    </div>,

    astronaut_intro: <div>
        <p>
            Deres jobb er å passe på at astronaut Steigen har nok luft
            til å gjennomføre oppdraget. Her er det viktig å jevnlig
            sjekke hvor fort hun puster og hvor fort hjertet slår.
        </p>

        <p>Finner dere ut at astronaut Steigen ikke vil ha nok luft til
            å gjennomføre oppdraget <em>må</em> dere si fra til
            oppdragslederen så vi kan avbryte i tide.
        </p>
    </div>
}