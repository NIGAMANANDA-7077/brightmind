const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const {
    markAttendance,
    getLiveClassAttendance,
    getBatchAttendance,
    getMyAttendance
} = require('../controllers/attendanceController');

// Student: Get my attendance
router.get('/my', protect, authorize('Student'), getMyAttendance);

// Teacher: Mark attendance for a live class
router.post('/mark', protect, authorize('Teacher', 'Admin'), markAttendance);

// Teacher/Admin: Get attendance for a live class
router.get('/live-class/:liveClassId', protect, authorize('Teacher', 'Admin'), getLiveClassAttendance);

// Teacher/Admin: Get batch attendance summary
router.get('/batch/:batchId', protect, authorize('Teacher', 'Admin'), getBatchAttendance);

module.exports = router;
