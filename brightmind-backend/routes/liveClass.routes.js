const express = require('express');
const router = express.Router();
const liveClassController = require('../controllers/liveClassController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// GET ROUTES
// Admin-only route to see absolutely everything across all courses
router.get('/admin/all', protect, authorize('Admin'), liveClassController.getAdminLiveClasses);

// Primary fetcher for a specific course (used by Teacher, Student, and Admin)
router.get('/course/:courseId', protect, authorize('Teacher', 'Student', 'Admin'), liveClassController.getLiveClassesByCourse);

// Global fetcher across all enrolled courses for Student/Teacher Dashboard
router.get('/', protect, authorize('Teacher', 'Student', 'Admin'), liveClassController.getLiveClassesForUser);

// TEACHER CRUD (Admin also authorized)
router.post('/', protect, authorize('Teacher', 'Admin'), liveClassController.createLiveClass);
router.put('/:id', protect, authorize('Teacher', 'Admin'), liveClassController.updateLiveClass);
router.patch('/:id/recording', protect, authorize('Teacher', 'Admin'), liveClassController.updateRecordingUrl);
router.delete('/:id', protect, authorize('Teacher', 'Admin'), liveClassController.deleteLiveClass);

module.exports = router;
