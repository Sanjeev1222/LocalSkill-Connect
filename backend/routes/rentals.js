const express = require('express');
const router = express.Router();
const {
  createRental, getMyRentals, getOwnerRentals,
  updateRentalStatus, getOwnerDashboard, sendRentalReturnOTP
} = require('../controllers/rentalController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('user'), createRental);
router.get('/my', protect, getMyRentals);
router.get('/owner', protect, authorize('toolowner'), getOwnerRentals);
router.get('/dashboard', protect, authorize('toolowner'), getOwnerDashboard);
router.put('/:id/status', protect, updateRentalStatus);
router.post('/:id/send-return-otp', protect, sendRentalReturnOTP);

module.exports = router;
