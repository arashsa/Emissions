const uuid = require('uuid');
const _ = require('lodash');
const check = require('check-types');
const EC = require('./EventConstants');
const missionTime = require('./mission-time');

var chapters = {}, completed = [];
var currentChapterNumber = 0;
var broadcaster = undefined;
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
 * @param options.triggerTime {Number} a relative time for when it normally would trigger. can result in the MC receiving a warning.
 * @param [options.value] {*} some value to send to the client, for instance a string message
 * @param [options.short_description] {string} a textual description of less than 20 chars. Used to display to mission commander
 * @param [options.autoTrigger] {boolean} Trigger automatically on expectedTriggerTime. default false
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
function remainingEvents(chapter) {
    if (chapter === undefined) {
        chapter = currentChapter();
    }

    check.number(chapter);
    check.assigned(chapters[chapter]);

    return (chapters[chapter] || [])
        .sort((e1, e2) => e1.triggerTime - e2.triggerTime);
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
            broadcaster(event.eventName, event.value);
            // remove the event from the list
            chapterEvents.splice(len, 1)

            completed.push(event);
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
    var now = missionTime.usedTimeInMillis();

    remainingEvents()
        .filter((ev) => chapterStart + ev.triggerTime < now)
        .filter((ev) => ev.autoTrigger)
        .map((ev) => triggerEvent(ev.id));
}

function overdueEvents() {
    var now = missionTime.usedTimeInMillis();

    return remainingEvents()
        .filter((ev) => chapterStart + ev.triggerTime < now)
        .filter((ev) => !ev.autoTrigger);
}

module.exports = {
    addChapterEvent, remainingEvents, triggerEvent, currentChapter, tick,  overdueEvents,

    completedEvents() {
        return completed;
    },

    advanceChapter() {
        this.setCurrentChapter(currentChapter() + 1);
    },

    /**
     * Set a function with which to broadcast events on
     * The function must have the signature fn(eventName, value)
     */
        setBroadcaster(fn) {
        broadcaster = fn;
    },

    setCurrentChapter(chap){
        check.number(chap);
        chapterStart = missionTime.usedTimeInMillis();
        currentChapterNumber = chap;
    },

    reset()  {
        chapters = {};
        completed = [];
        currentChapterNumber = null;
    }
};