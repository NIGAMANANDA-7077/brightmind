const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');

const examController = require('../controllers/examController');
const examAttemptController = require('../controllers/examAttemptController');
const examResultController = require('../controllers/examResultController');

// ==========================================
// 👨‍🏫 TEACHER / ADMIN ROUTES
// ==========================================
router.post('/', protect, authorize('Teacher', 'Admin'), examController.createExam);
router.get('/', protect, authorize('Teacher', 'Admin'), examController.getExams);
router.get('/teacher', protect, authorize('Teacher', 'Admin'), examController.getTeacherExams);
router.post('/:examId/generate', protect, authorize('Teacher', 'Admin'), examController.generateRandomPaper);
router.put('/:id', protect, authorize('Teacher', 'Admin'), examController.updateExam);
router.delete('/:id', protect, authorize('Teacher', 'Admin'), examController.deleteExam);

// Grading & Submissions
router.get('/:examId/submissions', protect, authorize('Teacher', 'Admin'), examResultController.getTeacherExamSubmissions);
router.post('/attempt/:attemptId/grade', protect, authorize('Teacher', 'Admin'), examResultController.gradeSubjectiveAnswer);
router.post('/:examId/publish', protect, authorize('Teacher', 'Admin'), examResultController.publishResults);
router.get('/results/all', protect, authorize('Teacher', 'Admin'), examResultController.getAllResults);


// ==========================================
// 👩‍🎓 STUDENT ROUTES
// ==========================================
router.get('/student', protect, authorize('Student'), examController.getStudentExams);
router.get('/results/student', protect, authorize('Student'), examResultController.getStudentResults);

// Exam Attempt Engine
router.post('/:examId/start', protect, authorize('Student'), examAttemptController.startExam);
router.post('/attempt/:attemptId/answer', protect, authorize('Student'), examAttemptController.saveAnswer);
router.post('/attempt/:attemptId/submit', protect, authorize('Student'), examAttemptController.submitExam);
router.post('/attempt/:attemptId/flag', protect, authorize('Student'), examAttemptController.flagAttempt);


// ==========================================
// 🌍 PUBLIC / SHARED ROUTES
// ==========================================
// Get Exam Details (Content depends on role)
router.get('/:id', protect, examController.getExamById);
// Get Leaderboard
router.get('/:examId/leaderboard', protect, examResultController.getLeaderboard);

module.exports = router;
