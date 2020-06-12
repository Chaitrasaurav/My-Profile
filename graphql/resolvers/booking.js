const Booking = require('../../models/booking');
const Event = require('../../models/events');
const { transformedBooking, transformEvent } = require('./merge');

module.exports = {
    bookings: async () => {
        try {
            const bookings = await Booking.find();
            return bookings.map(booking => {
                return transformedBooking(booking);
            });
        } catch (err) {
            throw err;
        }
    },
    bookEvent: async args => {
        const fetchedEvent = await Event.findOne({ _id: args.eventId });
        const booking = new Booking({
            user: '5eda16a5ce294017b0d1704c',
            event: fetchedEvent
        });
        const result = await booking.save();
        return transformedBooking(result);
    },
    cancelBooking: async args => {
        try {
            const booking = await Booking.findById(args.bookingId).populate('event');
            const event = transformEvent(booking.event);
            await Booking.deleteOne({ _id: args.bookingId });
            return event;
        } catch (err) {
            throw err;
        }
    }
};