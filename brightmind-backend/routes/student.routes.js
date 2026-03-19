const express  = require('express');
const router   = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const studentController = require('../controllers/studentController');

// @route  GET /api/student/dashboard
router.get('/dashboard', protect, authorize('Student'), studentController.getDashboard);

// @route  GET /api/student/activity  → weekly & monthly learning activity
router.get('/activity', protect, authorize('Student'), studentController.getActivity);

// @route  PUT /api/student/profile
router.put('/profile', protect, authorize('Student'), studentController.updateProfile);

// @route  PUT /api/student/change-password
router.put('/change-password', protect, authorize('Student'), studentController.changePassword);

// @route  PUT /api/student/preferences
router.put('/preferences', protect, authorize('Student'), studentController.updatePreferences);

// @route  POST /api/student/support
router.post('/support', protect, authorize('Student'), studentController.submitSupport);

module.exports = router;
