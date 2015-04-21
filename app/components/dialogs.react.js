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
            Deres jobb er å sikre at det er nok oksygen for å gjennomføre oppdraget. Her er det viktig å jevnlig
            sjekke hvor fort astronaut Steigen puster og hvor fort hjertet hennes slår.
        </p>

        <p>Finner dere ut at astronaut Steigen ikke vil ha nok luft til
            å gjennomføre oppdraget <em>må</em> dere si fra til
            oppdragslederen så vi kan avbryte i tide.
        </p>
    </div>,

    communication_intro: <div>
        <p>Deres mål er å holde kommunikasjonen oppe, og kommunisere med oppdragskoordinator og astronauten. Om
            nødvendig må dere kanskje bytte til en annen kommunikasjonssatelitt.
        </p>

        <p>Dere skal også informere astronauten om eventuelle beskjeder fra Andaøya Space Center (ASC), og
            likeledes informere ASC om hendelser eller beskjeder fra astronauten.</p>

    </div>,

    security_intro: <div>
        <p>
            Deres hovedoppgave er å innhente informasjon fra de forskjellige gruppene og bestemme dere for hva
            som skal gjøres. Her må dere samarbeide godt med oppdragskoordinatoren (<em>mission commander</em>)!
        </p>

        <p>
            Dere må også holde et øye på indikatoren som sier om det er nok luft til å gjennomføre oppdraget, samt
            sjekke om karbondioksidskrubberen må skiftes slik at astronauten ikke kveles.
        </p>

        <p>
            Deres må også sjekke at kommunikasjonsstatusen og datakvaliteten er god når reparasjonen er utført.
        </p>
    </div>


};