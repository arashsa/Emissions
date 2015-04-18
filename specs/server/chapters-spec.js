const chapters = require('../../server/chapters');
const { pick } = require('lodash');

describe('server.chapters', () => {

    let addDummyChapter;

    describe('addChapterEvent', () => {
        let dummyChapter = {
            chapter: 1,
            short_description: 'desc',
            eventName: 'something',
            triggerTime: 120
        }, tmpCount = 0;

        addDummyChapter = (chapter, triggerTime)=> {
            return chapters.addChapterEvent(Object.assign({}, dummyChapter, {
                chapter,
                triggerTime: triggerTime || (130 + tmpCount++)
            }));
        };

        it('should return the created event', () => {
            let ev = chapters.addChapterEvent(dummyChapter);

            expect(ev.id).toMatch(/.*-.*-.*/);
            expect(ev.chapter).toBe(1);
            expect(ev.completable).toBe(false);
        });

        it('should let optional values be settable', ()=> {
            let ev = chapters.addChapterEvent(Object.assign({}, dummyChapter, {completable: true}));

            expect(ev.completable).toBe(true);
        });

        it('should fail on illegal values', ()=> {
            expect(()=>chapters.addChapterEvent(Object.assign({}, dummyChapter, {chapter: 'a string'}))).toThrowError();
        });

        it('should return immutable objects', ()=> {
            let ev = chapters.addChapterEvent(dummyChapter);

            expect(()=> ev.chapter = 1234).toThrowError();
        });
    });

    describe('chapterEvents', () => {

        beforeEach(() => {
            chapters._clear();
        });

        it('should return a list of events', () => {
            expect(chapters.chapterEvents(1).length).not.toBeUndefined();
        });

        it('should return a list that contains the last added events', () => {
            let ev = addDummyChapter(1);
            expect(chapters.chapterEvents(1)).toContain(ev);
        });

        it('should return a list sorted on triggertime', () => {
            addDummyChapter(1,10);
            addDummyChapter(1,9);
            addDummyChapter(1,11);
            addDummyChapter(1,7);
            expect(chapters.chapterEvents(1).map((ev) => ev.triggerTime)).toEqual([7,9,10,11]);
        });

    });
});