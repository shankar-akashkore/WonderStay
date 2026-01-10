const Booking = require('../models/booking');
const Listing = require('../models/listing');

// Create a new booking
module.exports.createBooking = async (req, res) => {
  try {
    const { listingId, checkIn, checkOut, guests } = req.body;

    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      req.flash('error', 'Check-in date cannot be in the past');
      return res.redirect(`/listings/${listingId}`);
    }

    if (checkOutDate <= checkInDate) {
      req.flash('error', 'Check-out date must be after check-in date');
      return res.redirect(`/listings/${listingId}`);
    }

    // Check availability
    const isAvailable = await Booking.checkAvailability(listingId, checkInDate, checkOutDate);
    if (!isAvailable) {
      req.flash('error', 'Selected dates are not available');
      return res.redirect(`/listings/${listingId}`);
    }

    // Get listing to calculate price
    const listing = await Listing.findById(listingId);
    if (!listing) {
      req.flash('error', 'Listing not found');
      return res.redirect('/listings');
    }

    // Calculate total price
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalPrice = listing.price * nights;

    // Create booking
    const booking = new Booking({
      listing: listingId,
      user: req.user._id,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      totalPrice,
      status: 'confirmed'
    });

    await booking.save();

    req.flash('success', 'Booking confirmed! You will receive a confirmation email shortly.');
    res.redirect(`/bookings/user`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong with your booking');
    res.redirect('/listings');
  }
};

// Get all bookings for logged-in user
module.exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('listing')
      .sort({ createdAt: -1 });
    res.render('bookings/index', { bookings });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not load your bookings');
    res.redirect('/listings');
  }
};

// Check availability (AJAX endpoint - returns JSON)
module.exports.checkAvailability = async (req, res) => {
  try {
    const { listingId, checkIn, checkOut } = req.body;
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    const isAvailable = await Booking.checkAvailability(listingId, checkInDate, checkOutDate);
    res.json({ available: isAvailable });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not check availability' });
  }
};

// Get booked dates for a listing (AJAX endpoint - returns JSON)
module.exports.getBookedDates = async (req, res) => {
  try {
    const { id } = req.params;
    const bookings = await Booking.find({
      listing: id,
      status: { $in: ['pending', 'confirmed'] }
    }).select('checkIn checkOut');

    const bookedDates = bookings.map(booking => ({
      start: booking.checkIn,
      end: booking.checkOut
    }));

    res.json({ bookedDates });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load booked dates' });
  }
};

// Cancel a booking
module.exports.cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      req.flash('error', 'Booking not found');
      return res.redirect('/bookings/user');
    }

    // Check if user owns this booking
    if (!booking.user.equals(req.user._id)) {
      req.flash('error', 'You do not have permission to cancel this booking');
      return res.redirect('/bookings/user');
    }

    booking.status = 'cancelled';
    await booking.save();

    req.flash('success', 'Booking cancelled successfully');
    res.redirect('/bookings/user');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not cancel booking');
    res.redirect('/bookings/user');
  }
};