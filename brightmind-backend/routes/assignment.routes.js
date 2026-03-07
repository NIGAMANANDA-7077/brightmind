const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');

// GET all assignments
router.get('/', assignmentController.getAllAssignments);

// POST new assignment
router.post('/', assignmentController.createAssignment);

// PUT update assignment
router.put('/:id', assignmentController.updateAssignment);

// GET submissions for an assignment
router.get('/:id/submissions', assignmentController.getSubmissions);

// DELETE assignment
router.delete('/:id', assignmentController.deleteAssignment);

module.exports = router;
