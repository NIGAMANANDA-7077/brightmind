const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/enrollmentRequestController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Student: send enrollment request
router.post('/:courseId', protect, authorize('Student'), ctrl.createRequest);

// Student: check their enrollment status for a course
router.get('/status/:courseId', protect, authorize('Student'), ctrl.getMyStatus);

// Admin: get all requests
router.get('/', protect, authorize('Admin'), ctrl.getAllRequests);

// Admin: approve or reject
router.put('/:id/approve', protect, authorize('Admin'), ctrl.approveRequest);
router.put('/:id/reject', protect, authorize('Admin'), ctrl.rejectRequest);

module.exports = router;
