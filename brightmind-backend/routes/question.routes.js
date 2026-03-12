const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// @route   GET /api/questions
// @desc    Get all questions (filtered by role)
router.get('/', protect, authorize('Admin', 'Teacher'), questionController.getAllQuestions);

// @route   POST /api/questions
// @desc    Add new question
router.post('/', protect, authorize('Admin', 'Teacher'), questionController.createQuestion);

// @route   PUT /api/questions/:id
// @desc    Update a question
router.put('/:id', protect, authorize('Admin', 'Teacher'), questionController.updateQuestion);

// @route   DELETE /api/questions/:id
// @desc    Delete a question
router.delete('/:id', protect, authorize('Admin', 'Teacher'), questionController.deleteQuestion);

module.exports = router;
