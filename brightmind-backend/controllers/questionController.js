const Question = require('../models/Question');

exports.getAllQuestions = async (req, res) => {
    try {
        let where = {};
        if (req.user.role === 'Teacher') {
            const { Op } = require('sequelize');
            where = {
                [Op.or]: [
                    { teacherId: req.user.id },
                    { teacherId: null }
                ]
            };
        }
        const questions = await Question.findAll({ where });
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
        const newQuestion = await Question.create(payload);
        res.status(201).json(newQuestion);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateQuestion = async (req, res) => {
    try {
        const question = await Question.findByPk(req.params.id);
        if (!question) return res.status(404).json({ message: 'Question not found' });
        
        // Authorization check
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
        const question = await Question.findByPk(req.params.id);
        if (!question) return res.status(404).json({ message: 'Question not found' });

        // Authorization check
        if (req.user.role === 'Teacher' && question.teacherId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this question' });
        }

        await question.destroy();
        res.json({ message: 'Question deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
