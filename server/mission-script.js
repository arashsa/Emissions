const chapters = require('./chapters');
const EventConstants = require('./EventConstants');

function run() {


    // CHAPTER 0
    chapters.addChapterEvent({
        chapter: 0,
        eventName: EventConstants.ADD_MESSAGE,
        value: {text: 'Starter oppdrag ... klargjør dere for å motta oppgaver.'},
        triggerTime : 2,
        autoTrigger: true
    });

    // CHAPTER 1
    chapters.addChapterEvent({
        chapter: 1,
        eventName: EventConstants.SCIENCE_CHECK_RADIATION,
        triggerTime: 1,
        autoTrigger: true
    });

    chapters.addChapterEvent({
        chapter: 1,
        eventName: EventConstants.AST_CHECK_VITALS,
        triggerTime: 2,
        autoTrigger: true
    });

    chapters.addChapterEvent({
        chapter: 1,
        eventName: EventConstants.ADD_MESSAGE,
        value: {
            audience: 'security',
            text: 'Er alt klart for å starte prosedyren for flytting av satelitten? Innhent informasjon fra '
            + 'de andre gruppene og informer kommunikasjonsgruppa om status.'
        },
        triggerTime : 3
    });

    chapters.setCurrentChapter(0);
}

module.exports = {run};