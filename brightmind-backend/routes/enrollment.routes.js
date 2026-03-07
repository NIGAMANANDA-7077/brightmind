const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// @route   POST /api/enrollments/:courseId
// @desc    Enroll a student in a course
router.post('/:courseId', protect, authorize('Student'), enrollmentController.enroll);

// @route   GET /api/enrollments/my-courses
// @desc    Get all courses enrolled by the logged in student
router.get('/my-courses', protect, authorize('Student'), enrollmentController.getMyCourses);

// @route   POST /api/enrollments/progress/mark-complete
// @desc    Mark a specific lesson as completed and update course progress
router.post('/progress/mark-complete', protect, authorize('Student'), enrollmentController.markComplete);

// @route   GET /api/enrollments/progress/:courseId
// @desc    Get complete progress map for a specific course
router.get('/progress/:courseId', protect, authorize('Student'), enrollmentController.getProgress);

module.exports = router;
