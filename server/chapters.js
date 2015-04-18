const uuid = require('uuid');
const _ = require('lodash');
const check = require('check-types');
const EC = require('./EventConstants');
var chapters = {};

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
 * @param options.short_description {string} a textual description of less than 20 chars. Used to display to mission commander
 * @param options.eventName {string} a string identifying the event to send over the socket to the client. Should exist in EventConstants
 * @param options.triggerTime {Number} a relative time for when it normally would trigger. can result in the MC receiving a warning.
 * @param [options.autoTrigger] {boolean} Trigger automatically on expectedTriggerTime. default false
 * @param [options.completable] {boolean}
 * @param [options.relativeTo] {string} UNIMPLEMENTED. Let the `triggerTime` be relative to another event's completion time.
 *
 * @returns {object} the created event, with a generated UUID id
 */
function addChapterEvent(options) {
    check.assert.assigned(options);
    check.assert.number(options.chapter);
    check.assert.string(options.eventName);
    check.assert.number(options.triggerTime);
    check.assert.maybe.boolean(options.autoTrigger);
    check.assert.maybe.boolean(options.completable);
    check.assert.maybe.boolean(options.relativeTo);

    let result = Object.freeze(Object.assign({
        id: uuid(),
        completable: false,
        autoTrigger: false
    }, options));

    getChapter(options.chapter).push(result);

    return result;
}

/**
 * @param chapter {number}
 */
function chapterEvents(chapter) {
    check.number(chapter);
    check.assigned(chapters[chapter]);

    return (chapters[chapter] || [])
        .sort((e1, e2) => e1.triggerTime - e2.triggerTime);
}

// ScT - start sample task

// AST - check vital signs task

// SeT - OK to start EVA?

// CommT - msg to inform astronaut

module.exports = {
    addChapterEvent, chapterEvents,
    _clear: () => chapters = {}
};