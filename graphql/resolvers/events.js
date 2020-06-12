const { transformEvent } = require('./merge');
const Event = require('../../models/events');

module.exports = {
    events: async () => {
        try {
            const events = await Event.find();
            return events.map(event => {
                return transformEvent(event);
            });
        } catch (err) {
            throw err;
        }
    },
    createEvent: async (args) => {
        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: dateToString(args.eventInput.date),
            creator: '5eda16a5ce294017b0d1704c'
        });
        let createdEvent;
        try {
            const result = await event
            .save()
            createdEvent = transformEvent(result);
            const creator = await User.findById('5eda16a5ce294017b0d1704c');
            if (!creator) {
                throw new Error('User not found.');
            }
            creator.createdEvents.push(event);
            await creator.save();
            return createdEvent;
        } catch (err) {
            throw err;
        }
    }
};