const express = require('express');
const router = express.Router();
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

module.exports = router;