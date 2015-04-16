var Store = require('../app/stores/message-store'),
    AppDispatcher = require('../app/appdispatcher'),
    actions = require('../app/actions/MessageActionCreators');

describe('MessageStore', () => {

    beforeEach(() => {
        Store.reset();
    });

    it('should be empty by default', () => {
        expect(Store.getMessages().length).toBe(0);
    });

    it('should add a message upon receiving an action message', () => {
        let msg = {id: 'foo', text: 'footext', level: 'info'};
        actions.addMessage(msg);

        let messages = Store.getMessages();
        expect(messages.length).toEqual(1);
        expect(messages[0]).toEqual(msg);
    });

    it('should remove a message from its cache with a given key', () => {
        let msg = {id: 'foo', text: 'footext', level: 'info'};
        actions.addMessage(msg);
        actions.removeMessage(msg.id);
        expect(Store.getMessages().length).toEqual(0);
    });

});