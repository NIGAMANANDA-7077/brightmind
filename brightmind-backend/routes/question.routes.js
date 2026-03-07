const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

const { protect, authorize } = require('../middlewares/authMiddleware');

// @route   GET /api/questions
// @desc    Get all questions
router.get('/', protect, authorize('Admin', 'Teacher'), async (req, res) => {
    try {
        const questions = await Question.findAll();
        res.json(questions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   POST /api/questions
// @desc    Add new question
router.post('/', protect, authorize('Admin'), async (req, res) => {
    try {
        const newQuestion = await Question.create(req.body);
        res.status(201).json(newQuestion);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @route   PUT /api/questions/:id
// @desc    Update a question
router.put('/:id', protect, authorize('Admin'), async (req, res) => {
    try {
        const question = await Question.findByPk(req.params.id);
        if (!question) return res.status(404).json({ message: 'Question not found' });
        await question.update(req.body);
        res.json(question);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @route   DELETE /api/questions/:id
// @desc    Delete a question
router.delete('/:id', protect, authorize('Admin'), async (req, res) => {
    try {
        const question = await Question.findByPk(req.params.id);
        if (!question) return res.status(404).json({ message: 'Question not found' });
        await question.destroy();
        res.json({ message: 'Question deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
