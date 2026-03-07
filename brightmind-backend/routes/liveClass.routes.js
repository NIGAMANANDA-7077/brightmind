const express = require('express');
const router = express.Router();
const liveClassController = require('../controllers/liveClassController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Get all original live class routes but ensure they work with new structure
// @route   GET /api/live-classes
// @desc    Get all live classes
router.get('/', liveClassController.getAllLiveClasses);

// @route   POST /api/live-classes/attendance
// @desc    Log student attendance for a live class
router.post('/attendance', protect, authorize('Student'), liveClassController.logAttendance);

module.exports = router;
