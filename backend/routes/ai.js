const express = require('express');
const router = express.Router();
const { aiSearchTechnicians, aiSearchTools } = require('../controllers/aiController');

// AI-powered smart search endpoints
router.get('/technicians', aiSearchTechnicians);
router.get('/tools', aiSearchTools);

module.exports = router;
