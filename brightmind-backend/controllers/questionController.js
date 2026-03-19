const QuestionBank = require('../models/QuestionBank');

exports.getAllQuestions = async (req, res) => {
    try {
        const { Op } = require('sequelize');
        const where = {};
        if (req.user.role !== 'SuperAdmin' && req.user.tenantId) {
            where.tenantId = req.user.tenantId;
        }
        if (req.user.role === 'Teacher') {
            where[Op.or] = [{ teacherId: req.user.id }, { teacherId: null }];
        }
        const questions = await QuestionBank.findAll({ where });
        res.json(questions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createQuestion = async (req, res) => {
    try {
        const payload = { ...req.body };
        if (req.user.role === 'Teacher') {
            payload.teacherId = req.user.id;
        }
        // Always inject tenantId server-side
        payload.tenantId = req.user.tenantId || null;
        const newQuestion = await QuestionBank.create(payload);
        res.status(201).json(newQuestion);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateQuestion = async (req, res) => {
    try {
        const where = { id: req.params.id };
        if (req.user.role !== 'SuperAdmin' && req.user.tenantId) where.tenantId = req.user.tenantId;
        const question = await QuestionBank.findOne({ where });
        if (!question) return res.status(404).json({ message: 'Question not found' });

        if (req.user.role === 'Teacher' && question.teacherId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to edit this question' });
        }

        await question.update(req.body);
        res.json(question);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteQuestion = async (req, res) => {
    try {
        const where = { id: req.params.id };
        if (req.user.role !== 'SuperAdmin' && req.user.tenantId) where.tenantId = req.user.tenantId;
        const question = await QuestionBank.findOne({ where });
        if (!question) return res.status(404).json({ message: 'Question not found' });

        if (req.user.role === 'Teacher' && question.teacherId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this question' });
        }

        await question.destroy();
        res.json({ message: 'Question deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
