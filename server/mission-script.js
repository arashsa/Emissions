const chapters = require('./chapters');
const EventConstants = require('./EventConstants');

var createRecurringTasks = function (chapter) {
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

};

function run() {

    chapters.setCurrentChapter(0);

    // CHAPTER 0
    var chapter = 0;
    chapters.addChapterEvent({
        chapter: chapter,
        eventName: EventConstants.ADD_MESSAGE,
        value: {text: 'Starter oppdrag ... klargjør dere for å motta oppgaver.', duration : 30},
        triggerTime : 0,
        autoTrigger: true
    });


    // CHAPTER 1
    chapter = 1;

    createRecurringTasks(1);

    // sec
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

    // CHAPTER 2
    chapter = 2;
    createRecurringTasks(chapter);


    // CHAPTER 3
    chapter = 3;
    createRecurringTasks(chapter);

}

module.exports = {run};