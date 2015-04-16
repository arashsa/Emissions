const TimerStore = require('../app/stores/timer-store'),
    actions = require('../app/actions/TimerActionCreators'),
    AppDispatcher = require('../app/appdispatcher');

describe('TimerStore', () => {

    beforeEach(() => {
    });

    describe('isReadyToStart', () => {
        var timerId = 0;

        afterEach(() => {
            try{ actions.stopTimer(timerId); }
            catch(e){}
            timerId++;
        });

        it('should return false for unset timers', () => {
           expect(TimerStore.isReadyToStart(timerId)).toBe(false);
        });

        it('should return start for set timers', () => {
            actions.setTimer(timerId, 5);
            expect(TimerStore.isReadyToStart(timerId)).toBe(true);
        });

        it('should return false if running', () => {
            actions.setTimer(timerId, 5);
            actions.startTimer(timerId);
            expect(TimerStore.isRunning(timerId)).toBe(true);
            expect(TimerStore.isReadyToStart(timerId)).toBe(false);
        });

        it('should return true if stopped after being started', () => {
            actions.setTimer(timerId, 5);
            actions.startTimer(timerId);
            actions.stopTimer(timerId);
            expect(TimerStore.isReadyToStart(timerId)).toBe(true);
        });
    });

});