const express = require('express');
const router = express.Router();
const {
  getTools, getTool, addTool, updateTool, deleteTool, getMyTools
} = require('../controllers/toolController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getTools);
router.get('/my-tools', protect, authorize('toolowner'), getMyTools);
router.get('/:id', getTool);
router.post('/', protect, authorize('toolowner'), addTool);
router.put('/:id', protect, authorize('toolowner'), updateTool);
router.delete('/:id', protect, authorize('toolowner'), deleteTool);

module.exports = router;
