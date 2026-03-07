const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// @route   GET /api/exams
// @desc    Get all exams
router.get('/', examController.getAllExams);

// @route   GET /api/exams/teacher/:teacherId
// @desc    Get exams for a specific teacher
router.get('/teacher/:teacherId', protect, authorize('Teacher', 'Admin'), examController.getTeacherExams);

// @route   POST /api/exams
// @desc    Teacher uploads new exam questions
router.post('/', examController.createExam);

// @route   GET /api/exams/:id
// @desc    Get a single exam
router.get('/:id', examController.getExamById);

// @route   POST /api/exams/:id/submit
// @desc    Submit an exam and calculate score
router.post('/:id/submit', protect, authorize('Student'), examController.submitExam);

// @route   PUT /api/exams/:id
// @desc    Admin reviews/approves exam or Teacher updates exam
router.put('/:id', examController.updateExam);

// @route   DELETE /api/exams/:id
// @desc    Delete an exam
router.delete('/:id', examController.deleteExam);

// @route   POST /api/exams/schedule
// @desc    Schedule an exam and notify students
router.post('/schedule', protect, authorize('Teacher', 'Admin'), examController.scheduleExam);

// @route   GET /api/exams/results/teacher/:teacherId
// @desc    Get results for all exams under a teacher
router.get('/results/teacher/:teacherId', protect, authorize('Teacher', 'Admin'), examController.getTeacherResults);

// @route   GET /api/exams/results/student
// @desc    Get results for the logged-in student
router.get('/results/student', protect, authorize('Student'), examController.getStudentResults);

// @route   GET /api/exams/results/all
// @desc    Get all exam results (Admin)
router.get('/results/all', protect, authorize('Admin'), examController.getAllResults);

module.exports = router;
