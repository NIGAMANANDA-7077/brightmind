const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');

// GET all submissions globally (or filtered by studentId)
router.get('/', async (req, res) => {
    try {
        const { studentId, assignmentId } = req.query;
        const where = {};
        if (studentId) where.studentId = studentId;
        if (assignmentId) where.assignmentId = assignmentId;

        const submissions = await Submission.findAll({ where });
        res.json(submissions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST new submission
router.post('/', async (req, res) => {
    try {
        const submission = await Submission.create(req.body);
        res.status(201).json(submission);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT update submission (e.g. Grading)
router.put('/:id', async (req, res) => {
    try {
        const submission = await Submission.findByPk(req.params.id);
        if (!submission) return res.status(404).json({ message: 'Not found' });
        await submission.update(req.body);
        res.json(submission);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
