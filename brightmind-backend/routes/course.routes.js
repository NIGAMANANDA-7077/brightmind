const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { protect } = require('../middlewares/authMiddleware');

// ALL routes require authentication — tenant isolation depends on req.user
// PUBLIC: no auth — homepage/course detail use
router.get('/public', courseController.getAllCourses);
router.get('/public/:id', courseController.getCourseById);  // PUBLIC single course detail
router.get('/', protect, courseController.getAllCourses);
router.get('/teacher/:teacherId', protect, courseController.getTeacherCourses);
router.get('/student/:studentId', protect, courseController.getStudentCourses);
router.get('/student/course/:courseId', protect, courseController.getCourseById);
router.get('/student/enrolled/:studentId', protect, courseController.getStudentCourses);
router.get('/:id', protect, courseController.getCourseById);
router.post('/', protect, courseController.createCourse);
router.put('/:id', protect, courseController.updateCourse);
router.delete('/:id', protect, courseController.deleteCourse);

module.exports = router;
