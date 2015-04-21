const uuid = require('uuid');
const EventEmitter = require('events');
const _ = require('lodash');
const check = require('check-types');
const EC = require('./EventConstants');
const missionTime = require('./mission-time');

var chapters = {}, completed = [];
var currentChapterNumber = 0;
var overdueLenPrev = 0;
var chapterStart;

function getChapter(chapterNumber) {
    if (!chapters[chapterNumber]) chapters[chapterNumber] = [];

    return chapters[chapterNumber];
}
/**
 * Add an event to internal list of events in any chapter
 *
 * If the client is expected to be able to complete something related to an event one can set the property `completable`.
 * These events will be handled differently by being put in a list of
 *
 * @param options.chapter {Number} which chapter the event takes place
 * @param options.eventName {string} a string identifying the event to send over the socket to the client. Should exist in EventConstants
 * @param options.triggerTime {Number} seconds after chapter start it would normally trigger.
 * @param [options.value] {*} some value to send to the client, for instance a string message
 * @param [options.short_description] {string} a textual description of less than 20 chars. Used to display to mission commander
 * @param [options.autoTrigger] {boolean} Trigger automatically on expectedTriggerTime. default false
 * @param [options.serverInternal] {boolean} This will be handled specially and not sent to the client
 * @param [options.completable] {boolean} UNIMPLEMENTED.
 * @param [options.relativeTo] {string} UNIMPLEMENTED. Let the `triggerTime` be relative to another event's completion time.
 *
 * @returns {object} the created event, with a generated UUID id
 */
function addChapterEvent(options) {
    check.assert.assigned(options);
    check.assert.number(options.chapter);
    check.assert.string(options.eventName);
    check.assert.number(options.triggerTime);
    check.assert.maybe.string(options.short_description);
    check.assert(!options.short_description || options.short_description.length <= 20);
    check.assert.maybe.boolean(options.autoTrigger);
    check.assert.maybe.boolean(options.completable);
    check.assert.maybe.boolean(options.relativeTo);

    var result = Object.freeze(_.extend({
        id: uuid(),
        completable: false,
        autoTrigger: false,
        short_description: options.eventName
    }, options));

    getChapter(options.chapter).push(result);

    return result;
}

/**
 * @returns {Array} a list of events for the chapter, sorted on `triggerTime`
 * @param [chapter] {Number} optional chapter number. If not given, uses the currentChapter
 */
function untriggeredEvents(chapter) {
    if (chapter === undefined) {
        chapter = currentChapter();
    }

    check.number(chapter);
    check.assigned(chapters[chapter]);

    return (chapters[chapter] || [])
        .sort((e1, e2) => e1.triggerTime - e2.triggerTime);
}

function remainingEvents() {
    const overdue = overdueEvents();
    return untriggeredEvents().filter((ev)=> overdue.indexOf(ev) === -1);
}

function overdueEvents() {
    var now = missionTime.usedTimeInSeconds();

    return untriggeredEvents()
        .filter((ev) => chapterStart + ev.triggerTime < now)
        .filter((ev) => !ev.autoTrigger);
}

/**
 * Trigger an event in the current chapter
 * @param uuid {string} an id for that specific event
 */
function triggerEvent(uuid) {
    var chapterEvents = chapters[currentChapter()];
    var len = chapterEvents.length;

    while (len-- > 0) {
        var event = chapterEvents[len];
        if (event.id === uuid) {

            // remove the event from the list
            chapterEvents.splice(len, 1)
            completed.push(event);

            Chapters.emitTrigger(event);
            break;
        }
    }

}

function currentChapter() {
    if (currentChapterNumber === null) {
        throw new Error('You have to set the current chapter');
    }

    return currentChapterNumber;
}

/**
 * Traverse the list of events and trigger the events that can be triggered
 * For events that are not auto-triggerable, broadcast a message
 */
function tick() {
    var now = missionTime.usedTimeInSeconds();

    tellListenersOfNewOverdueEvents();

    untriggeredEvents()
        .filter((ev) => chapterStart + ev.triggerTime < now)
        .filter((ev) => ev.autoTrigger)
        .map((ev) => triggerEvent(ev.id));

    overdueLenPrev = overdueEvents().length;
}

function tellListenersOfNewOverdueEvents() {
    if (overdueLenPrev !== overdueEvents().length) {
        Chapters.emitOverdue();
    }
}


var Chapters = module.exports = _.extend(new EventEmitter(), {
    addChapterEvent, remainingEvents, triggerEvent, currentChapter, tick, overdueEvents,

    completedEvents() {
        return completed;
    },

    advanceChapter() {
        this.setCurrentChapter(currentChapter() + 1);
    },

    setCurrentChapter(chap){
        check.number(chap);
        chapterStart = missionTime.usedTimeInSeconds();
        currentChapterNumber = chap;

        completed = [];

        this.emitChapterChange();
    },

    /** Resets all internal state, including removing all listeners added */
        reset()  {
        chapters = {};
        completed = [];
        currentChapterNumber = null;
        this.removeAllListeners('trigger');
        this.removeAllListeners('chapter_change');
    },

    /**
     * @param callback {function} will be called on a change - no parameters
     */
        addChapterListener(callback){
        return this.on('chapter_change', callback);
    },

    addTriggerListener(callback){
        return this.on('trigger', callback);
    },

    addOverdueListener(callback){
        return this.on('overdue', callback);
    },

    emitTrigger(event) {
        this.emit('trigger', event);
    },

    emitChapterChange() {
        this.emit('chapter_change');
    },

    emitOverdue(){
        this.emit('overdue', overdueEvents())
    }
});