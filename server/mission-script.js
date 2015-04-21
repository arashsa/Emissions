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

    // ast
    chapters.addChapterEvent({
        chapter: chapter,
        eventName: EventConstants.AST_CHECK_VITALS,
        triggerTime: 0,
        autoTrigger: true
    });

    // communication
    chapters.addChapterEvent({
        chapter: chapter,
        eventName: EventConstants.COMM_CHECK_SAT_LINK,
        triggerTime: 30,
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
        value: {text: 'Starter oppdrag ... klargjør dere for å motta oppgaver.', duration : 15},
        triggerTime : 0,
        autoTrigger: true
    });


    // CHAPTER 1
    chapter = 1;

    createRecurringTasks(1);

    // security
    // TODO: check the data arrival and quality


    // CHAPTER 2
    chapter = 2;
    createRecurringTasks(chapter);

    chapters.addChapterEvent({
        chapter: chapter,
        eventName: EventConstants.SET_HIGH_C02,
        short_description: 'Increase the CO2 level to a high level',
        triggerTime : 60,
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
        triggerTime : 60+10,
        autoTrigger : true
    });



    // CHAPTER 3
    chapter = 3;

    chapters.addChapterEvent({
        chapter: chapter,
        eventName: 'lower oxygen',
        serverInternal : true,
        triggerTime : 5,
        autoTrigger: true
    });

    // CHAPTER 4
    chapter = 4;

    createRecurringTasks(chapter);

    // ast
    // TODO : heart rate => 100, orange

    // TODO: new check after 5 minutes


    // CHAPTER 5
    chapter = 5

    createRecurringTasks(chapter);

    // TODO: set data transfer OK, quality NOT OK

    // SeC
    // TODO: check communication quality and transfer

    // TODO: trigger radiation change to orange


    // CHAPTER 6

    chapter = 6;
    createRecurringTasks(chapter);

    // TODO: set breath (50) and heart rate 120 (RED)

    // TODO: set radiation GREEN


    // CHAPTER 7
    chapter = 7;

    // TODO: set radiation RED 90

    createRecurringTasks(chapter);

    // TODO: set up a trigger for Jose to press that will set DATA QUALITY OK








}

module.exports = {run};