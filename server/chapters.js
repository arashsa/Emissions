const uuid = require('uuid');
const _ = require('lodash');
const check = require('check-types');
const EC = require('./EventConstants');

var chapters = {}, completed = [];
var currentChapter = 0;
var broadcaster = undefined;

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

    let result = Object.freeze(Object.assign({
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
        chapter = currentChapter;
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
    let chapterEvents = chapters[currentChapter];
    let len = chapterEvents.length;

    while (len-- > 0) {
        let event = chapterEvents[len];
        if (event.id === uuid) {
            broadcaster(event.eventName, event.value);
            // remove the event from the list
            chapterEvents.splice(len, 1)

            completed.push(event);
            break;
        }
    }

}

module.exports = {
    addChapterEvent, remainingEvents, triggerEvent,

    completedEvents() {
        return completed;
    },

    currentChapter() {
        return currentChapter;
    },

    advanceChapter() {
        currentChapter++;
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
        currentChapter = chap;
    },

    // for testing
    reset()  {
        chapters = {};
        currentChapter = 0;
    }
};