const express = require('express');
const router = express.Router();
const {
  createBooking, getMyBookings, getTechnicianBookings,
  updateBookingStatus, getBooking, sendBookingCompleteOTP
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('user'), createBooking);
router.get('/my', protect, getMyBookings);
router.get('/technician', protect, authorize('technician'), getTechnicianBookings);
router.get('/:id', protect, getBooking);
router.put('/:id/status', protect, updateBookingStatus);
router.post('/:id/send-complete-otp', protect, authorize('technician'), sendBookingCompleteOTP);

module.exports = router;
