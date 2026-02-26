const express = require('express');
const router = express.Router();
const {
  getTechnicians, getTechnician, updateTechnicianProfile,
  toggleStatus, getDashboard
} = require('../controllers/technicianController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getTechnicians);
router.get('/dashboard', protect, authorize('technician'), getDashboard);
router.get('/:id', getTechnician);
router.put('/profile', protect, authorize('technician'), updateTechnicianProfile);
router.put('/toggle-status', protect, authorize('technician'), toggleStatus);

module.exports = router;
