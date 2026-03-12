const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');

const { protect, authorize } = require('../middlewares/authMiddleware');

// GET all assignments (available for students to see their work)
router.get('/', protect, assignmentController.getAllAssignments);

// POST new assignment (Teacher/Admin only)
router.post('/', protect, authorize('Teacher', 'Admin'), assignmentController.createAssignment);

// PUT update assignment (Teacher/Admin only)
router.put('/:id', protect, authorize('Teacher', 'Admin'), assignmentController.updateAssignment);

// POST submit assignment (Student only)
router.post('/:id/submit', protect, authorize('Student'), assignmentController.submitAssignment);

// GET submissions for an assignment (Teacher/Admin only)
router.get('/:id/submissions', protect, authorize('Teacher', 'Admin'), assignmentController.getSubmissions);

// DELETE assignment (Teacher/Admin only)
router.delete('/:id', protect, authorize('Teacher', 'Admin'), assignmentController.deleteAssignment);

// PUT grade assignment (Teacher/Admin only)
router.put('/:id/grade', protect, authorize('Teacher', 'Admin'), assignmentController.gradeAssignment);

module.exports = router;
