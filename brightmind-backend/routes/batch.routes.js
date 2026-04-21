const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const {
    createBatch,
    getAllBatches,
    getBatchById,
    updateBatch,
    deleteBatch,
    addStudentsToBatch,
    removeStudentFromBatch,
    getBatchStudents,
    getTeacherBatches,
    getStudentBatch,
    getStudentBatches,
    getStudentLiveClasses
} = require('../controllers/batchController');

// ─── Teacher Routes (MUST be before /:id) ──────────────────
router.get('/teacher/my-batches', protect, authorize('Teacher', 'Admin'), getTeacherBatches);

// ─── Student Routes (MUST be before /:id) ──────────────────
router.get('/student/my-batch', protect, authorize('Student'), getStudentBatch);
router.get('/student/my-batches', protect, authorize('Student'), getStudentBatches);
router.get('/student/live-classes', protect, authorize('Student'), getStudentLiveClasses);

// ─── Admin Routes ──────────────────────────────────────────
router.post('/', protect, authorize('Admin', 'SuperAdmin'), createBatch);
router.get('/', protect, authorize('Admin', 'SuperAdmin'), getAllBatches);
router.put('/:id', protect, authorize('Admin', 'SuperAdmin'), updateBatch);
router.delete('/:id', protect, authorize('Admin', 'SuperAdmin'), deleteBatch);

// ─── Batch Student Management (Admin) ─────────────────────
router.post('/:id/students', protect, authorize('Admin', 'SuperAdmin'), addStudentsToBatch);
router.delete('/:id/students/:studentId', protect, authorize('Admin', 'SuperAdmin'), removeStudentFromBatch);
router.get('/:id/students', protect, authorize('Admin', 'SuperAdmin', 'Teacher'), getBatchStudents);

// ─── Single Batch Detail (Admin & Teacher) ─────────────────
router.get('/:id', protect, authorize('Admin', 'SuperAdmin', 'Teacher'), getBatchById);

module.exports = router;
