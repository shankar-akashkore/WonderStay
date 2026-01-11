const express = require('express');
const router = express.Router();
const Booking = require('../models/booking');
const bookingController = require('../controllers/bookings');
const { isLoggedIn } = require('../middleware');

// Create new booking
router.post('/', isLoggedIn, bookingController.createBooking);

// Get all bookings for a user
router.get('/user', isLoggedIn, bookingController.getUserBookings);

// Check availability (AJAX endpoint)
router.post('/check-availability', bookingController.checkAvailability);

// Get booked dates for a listing (AJAX endpoint)
router.get('/listing/:id/booked-dates', bookingController.getBookedDates);

// Cancel booking
router.delete('/:bookingId', isLoggedIn, bookingController.cancelBooking);

// Delete booking route
router.post('/:id/cancel', isLoggedIn, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Find the booking
        const booking = await Booking.findById(id);
        
        if (!booking) {
            req.flash('error', 'Booking not found');
            return res.redirect('/bookings/user');
        }
        
        // Check if the user owns this booking
        if (!booking.user.equals(req.user._id)) {
            req.flash('error', 'You do not have permission to cancel this booking');
            return res.redirect('/bookings/user');
        }
        
        // Delete the booking
        await Booking.findByIdAndDelete(id);
        
        req.flash('success', 'Booking cancelled successfully');
        res.redirect('/bookings/user');
    } catch (error) {
        console.error('Error cancelling booking:', error);
        req.flash('error', 'Something went wrong while cancelling the booking');
        res.redirect('/bookings/user');
    }
});

module.exports = router;