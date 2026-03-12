const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

// GET all courses
router.get('/', courseController.getAllCourses);

// GET courses by teacher
router.get('/teacher/:teacherId', courseController.getTeacherCourses);

// GET courses by student
router.get('/student/:studentId', courseController.getStudentCourses);

// GET single course
router.get('/:id', courseController.getCourseById);

// POST new course
router.post('/', courseController.createCourse);

// PUT update course
router.put('/:id', courseController.updateCourse);

// DELETE course
router.delete('/:id', courseController.deleteCourse);

// GET student specific course structure
router.get('/student/course/:courseId', courseController.getCourseById);

// GET courses where student is enrolled
router.get('/student/enrolled/:studentId', courseController.getStudentCourses);

module.exports = router;
