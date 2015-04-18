const chapters = require('../../server/chapters');
const { pick } = require('lodash');

describe('server.chapters', () => {

    let broadcaster = (event, name)=> { return {event, name} },
        addDummyChapter;

    beforeEach(() => {
        chapters.setBroadcaster(broadcaster)
    });

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

        it('should fail on long descriptions', ()=> {
            expect(()=> {
                throw chapters.addChapterEvent(
                    Object.assign({}, dummyChapter,
                        {short_description: 'a very long string a very long string a very long string a very long string a very long string a very long string '}
                    ))
            }).toThrowError();
        });

        it('should return immutable objects', ()=> {
            let ev = chapters.addChapterEvent(dummyChapter);

            expect(()=> ev.chapter = 1234).toThrowError();
        });
    });

    describe('remainingEvents', () => {

        beforeEach(() => {
            chapters.reset();
        });

        it('should return a list of events', () => {
            expect(chapters.remainingEvents(1).length).not.toBeUndefined();
        });

        it('should return a list that contains the last added events', () => {
            let ev = addDummyChapter(1);
            expect(chapters.remainingEvents(1)).toContain(ev);
        });

        it('should return a list sorted on triggertime', () => {
            addDummyChapter(1, 10);
            addDummyChapter(1, 9);
            addDummyChapter(1, 11);
            addDummyChapter(1, 7);
            expect(chapters.remainingEvents(1).map((ev) => ev.triggerTime)).toEqual([7, 9, 10, 11]);
        });

    });

    describe('completedEvents', () => {

        beforeEach(() => {
            chapters.reset();
        });

        it('should be empty before any events have been triggered', () => {
            expect(chapters.completedEvents().length).toBe(0);
        });

        it('should equal the number of triggered events', ()=> {
            var uuid1 = addDummyChapter(1).id;
            var uuid2 = addDummyChapter(1).id;

            chapters.setCurrentChapter(1);
            chapters.triggerEvent(uuid1);
            chapters.triggerEvent(uuid2);

            expect(chapters.completedEvents().length).toBe(2);
        })

    });

});