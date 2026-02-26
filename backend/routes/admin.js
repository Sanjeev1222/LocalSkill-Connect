const express = require('express');
const router = express.Router();
const {
  getDashboard, getUsers, toggleBan, verifyTechnician,
  getAllTechnicians, getAllTools, deleteTool
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.put('/users/:id/ban', toggleBan);
router.get('/technicians', getAllTechnicians);
router.put('/technicians/:id/verify', verifyTechnician);
router.get('/tools', getAllTools);
router.delete('/tools/:id', deleteTool);

module.exports = router;
