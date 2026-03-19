const express  = require('express');
const router   = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const teacherController = require('../controllers/teacherController');

// @route  GET /api/teacher/profile
router.get('/profile', protect, authorize('Teacher'), teacherController.getTeacherProfile);

// @route  PUT /api/teacher/profile
router.put('/profile', protect, authorize('Teacher'), teacherController.updateTeacherProfile);

// @route  GET /api/teacher/courses
router.get('/courses', protect, authorize('Teacher'), teacherController.getTeacherCourses);

// @route  GET /api/teacher/batches
router.get('/batches', protect, authorize('Teacher'), teacherController.getTeacherBatches);

// @route  GET /api/teacher/dashboard
// @desc   Full dashboard data scoped to the logged-in teacher
// @access Private (Teacher)
router.get('/dashboard', protect, authorize('Teacher'), teacherController.getDashboard);

module.exports = router;
