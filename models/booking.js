const mongoose = require('mongoose');
const listing = require('./listing');
const { types, required } = require('joi');
const Schema = mongoose.Schema;


const bookingSchema = new Schema({
    listing: {
        type: Schema.Types.ObjectId,
        ref: 'Listing',
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    checkIn: {
        type: Date,
        required: true
    },
    checkOut: {
        type: Date,
        required: true
    },
    guests: {
        type: Number,
        required: true,
        min: 1
    },
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

bookingSchema.statics.checkAvailability = async function(listingId, checkIn, checkOut, excludeBookingId = null){
    const query = {
        listing: listingId,
        status: { $in: ['pending', 'confirmed'] },
        $or: [
            { checkIn: {$lte: checkIn}, checkOut: {$gt: checkIn}},
            { checkIn: {$lt: checkOut}, checkOut: {$gte: checkOut}},
            { checkIn: {$gte: checkIn}, checkOut: {$lte: checkOut}}
        ]
    };

    if (excludeBookingId) {
        query._id = { $ne: excludeBookingId};
    }

    const conflictingBookings = await this.find(query);
    return conflictingBookings.length === 0
};

module.exports = mongoose.model('Booking', bookingSchema);