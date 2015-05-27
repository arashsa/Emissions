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
        triggerTime: 2 * 60 + 30,
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
    chapters.addChapterEvent({
        chapter: chapter,
        eventName: EventConstants.SECURITY_CHECK_DATA_TRANSFER,
        triggerTime : 0,
        autoTrigger: true
    });


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
    chapters.addChapterEvent({
        chapter: chapter,
        eventName: EventConstants.SET_HEART_RATE_MEDIUM,
        triggerTime: 0,
        autoTrigger: true,
        serverInternal : true
    });

    chapters.addChapterEvent({
        chapter: chapter,
        eventName: EventConstants.SET_HEART_RATE_LOW,
        triggerTime: 4*60,
        autoTrigger: true,
        serverInternal : true
    });

    chapters.addChapterEvent({
        chapter: chapter,
        eventName: EventConstants.AST_CHECK_VITALS,
        triggerTime: 3*60 + 30,
        autoTrigger: true
    });


    // CHAPTER 5
    chapter = 5;

    createRecurringTasks(chapter);

    chapters.addChapterEvent({
        chapter: chapter,
        eventName: 'set transfer ok',
        triggerTime: 0,
        autoTrigger: true,
        serverInternal : true
    });

    // SeC
    chapters.addChapterEvent({
        chapter: chapter,
        eventName: EventConstants.SECURITY_CHECK_DATA_TRANSFER,
        triggerTime : 0,
        autoTrigger: true
    });

    chapters.addChapterEvent({
        chapter: chapter,
        eventName: 'set radiation medium',
        triggerTime: 0,
        autoTrigger: true,
        serverInternal : true
    });


    // CHAPTER 6

    chapter = 6;
    createRecurringTasks(chapter);

    chapters.addChapterEvent({
        chapter: chapter,
        eventName: EventConstants.SET_HEART_RATE_HIGH,
        triggerTime: 0,
        autoTrigger: true,
        serverInternal : true
    });

    chapters.addChapterEvent({
        chapter: chapter,
        eventName: 'set breathrate high',
        triggerTime: 0,
        autoTrigger: true,
        serverInternal : true
    });

    chapters.addChapterEvent({
        chapter: chapter,
        eventName: 'set radiation low',
        triggerTime: 0,
        autoTrigger: true,
        serverInternal : true
    });

    chapters.addChapterEvent({
        chapter: chapter,
        eventName: EventConstants.SET_HEART_RATE_LOW,
        triggerTime: 180,
        autoTrigger: true,
        serverInternal : true
    });

    chapters.addChapterEvent({
        chapter: chapter,
        eventName: 'set breathrate low',
        triggerTime: 180,
        autoTrigger: true,
        serverInternal : true
    });

    chapters.addChapterEvent({
        chapter: chapter,
        eventName: EventConstants.AST_CHECK_VITALS,
        triggerTime: 5*60,
        autoTrigger: true
    });

    // CHAPTER 7
    chapter = 7;

    createRecurringTasks(chapter);

    chapters.addChapterEvent({
        chapter: chapter,
        eventName: 'set radiation high',
        triggerTime: 0,
        autoTrigger: true,
        serverInternal : true
    });


    chapters.addChapterEvent({
        chapter: chapter,
        eventName: 'set quality ok',
        short_description : 'Trigger manually. Set the quality of the transfer to be OK.',
        triggerTime: 20,
        autoTrigger: false,
        serverInternal : true
    });

}

module.exports = {run};