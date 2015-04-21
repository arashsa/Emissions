const chapters = require('./chapters');
const EventConstants = require('./EventConstants');

var createRecurringTasks = function (chapter) {

    //science
    chapters.addChapterEvent({
        chapter: chapter,
        eventName: EventConstants.SCIENCE_CHECK_RADIATION,
        triggerTime: 0,
        autoTrigger: true
    });

    chapters.addChapterEvent({
        chapter: chapter,
        eventName: EventConstants.SCIENCE_CHECK_RADIATION,
        triggerTime: 3 * 60,
        autoTrigger: true
    });

    chapters.addChapterEvent({
        chapter: chapter,
        eventName: EventConstants.SCIENCE_CHECK_RADIATION,
        triggerTime: 6 * 60,
        autoTrigger: true
    });

    // ast
    chapters.addChapterEvent({
        chapter: chapter,
        eventName: EventConstants.AST_CHECK_VITALS,
        triggerTime: 0,
        autoTrigger: true
    });

    chapters.addChapterEvent({
        chapter: chapter,
        eventName: EventConstants.AST_CHECK_VITALS,
        triggerTime: 5*60,
        autoTrigger: true
    });

    // communiction
    chapters.addChapterEvent({
        chapter: chapter,
        eventName: EventConstants.COMM_CHECK_SAT_LINK,
        triggerTime: 0,
        autoTrigger: true
    });

    chapters.addChapterEvent({
        chapter: chapter,
        eventName: EventConstants.COMM_CHECK_SAT_LINK,
        triggerTime: 10*60,
        autoTrigger: true
    });

    // security
    // no recurring events

};

function run() {

    chapters.setCurrentChapter(0);

    // CHAPTER 0
    var chapter = 0;
    chapters.addChapterEvent({
        chapter: chapter,
        eventName: EventConstants.ADD_MESSAGE,
        value: {text: 'Starter oppdrag ... klargjør dere for å motta oppgaver.', duration : 15},
        triggerTime : 0,
        autoTrigger: true
    });


    // CHAPTER 1
    chapter = 1;

    createRecurringTasks(1);

    // sec
    chapters.addChapterEvent({
        chapter: chapter,
        eventName: EventConstants.ADD_MESSAGE,
        value: {
            audience: 'security',
            text: 'Er alt klart for å starte prosedyren for flytting av satelitten? Innhent informasjon fra '
            + 'de andre gruppene og informer kommunikasjonsgruppa om status.',
            duration : 20
        },
        triggerTime : 0,
        autoTrigger : true
    });


    // CHAPTER 2
    chapter = 2;
    createRecurringTasks(chapter);

    chapters.addChapterEvent({
        chapter: chapter,
        eventName: EventConstants.SET_HIGH_C02,
        short_description: 'Increase the CO2 level to a high level',
        triggerTime : 0,
        serverInternal : true,
        autoTrigger : true
    });

    chapters.addChapterEvent({
        chapter: chapter,
        eventName: EventConstants.ADD_MESSAGE,
        value: {
            audience: 'security',
            text: 'Farlig høyt CO2-nivå!',
            level : 'warning'
        },
        triggerTime : 8,
        autoTrigger : true
    });



    // CHAPTER 3
    chapter = 3;
    createRecurringTasks(chapter);

    chapters.addChapterEvent({
        chapter: chapter,
        eventName: 'lower oxygen',
        serverInternal : true,
        triggerTime : 0,
        autoTrigger: true
    });

}

module.exports = {run};