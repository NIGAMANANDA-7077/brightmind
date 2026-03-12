const { QuestionBank, QuestionOption } = require('../models/associations');
const Course = require('../models/Course');
const sequelize = require('../config/db');

exports.createQuestion = async (req, res, next) => {
    try {
        const { courseId, topic, questionText, questionType, difficulty, marks, negativeMarks, explanation, options } = req.body;
        const teacherId = req.user.id;

        // Create the question in the bank
        const question = await QuestionBank.create({
            courseId: courseId || 'General',
            topic,
            teacherId,
            questionText,
            questionType,
            difficulty,
            marks: marks || 1,
            negativeMarks: negativeMarks || 0,
            explanation
        });

        // If options are provided (for MCQ, Multiple Select, True/False)
        let createdOptions = [];
        if (options && options.length > 0) {
            const optionsData = options.map(opt => ({
                questionId: question.id,
                optionText: opt.optionText,
                isCorrect: opt.isCorrect || false
            }));
            createdOptions = await QuestionOption.bulkCreate(optionsData);
        }

        res.status(201).json({
            ...question.toJSON(),
            options: createdOptions
        });
    } catch (err) {
        console.error("Error creating question:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getQuestions = async (req, res, next) => {
    try {
        const teacherId = req.user.id;
        const { courseId, difficulty, type } = req.query;

        // Build filter
        let whereClause = {};
        if (req.user.role !== 'Admin') {
            whereClause.teacherId = teacherId;
        }
        if (courseId) whereClause.courseId = courseId;
        if (difficulty) whereClause.difficulty = difficulty;
        if (type) whereClause.questionType = type;

        const questions = await QuestionBank.findAll({
            where: whereClause,
            include: [{
                model: QuestionOption,
                as: 'options'
            }],
            order: [['createdAt', 'DESC']]
        });

        res.json(questions);
    } catch (err) {
        console.error("Error fetching questions:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateQuestion = async (req, res, next) => {
    try {
        const { id } = req.params;
        const teacherId = req.user.id;
        const { topic, questionText, questionType, difficulty, marks, negativeMarks, explanation, options } = req.body;

        const whereClause = { id };
        if (req.user.role !== 'Admin') {
            whereClause.teacherId = teacherId;
        }

        const question = await QuestionBank.findOne({ where: whereClause });
        if (!question) {
            return res.status(404).json({ success: false, message: "Question not found or unauthorized" });
        }

        // Update basic question details
        await question.update({
            topic,
            questionText,
            questionType,
            difficulty,
            marks,
            negativeMarks,
            explanation
        });

        // Update options (easiest way is to drop old ones and recreate, or update existing)
        if (options) {
            await QuestionOption.destroy({ where: { questionId: id } });
            if (options.length > 0) {
                const optionsData = options.map(opt => ({
                    questionId: id,
                    optionText: opt.optionText,
                    isCorrect: opt.isCorrect || false
                }));
                await QuestionOption.bulkCreate(optionsData);
            }
        }

        res.json(question);
    } catch (err) {
        console.error("Error updating question:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteQuestion = async (req, res, next) => {
    try {
        const { id } = req.params;
        const teacherId = req.user.id;

        const whereClause = { id };
        if (req.user.role !== 'Admin') {
            whereClause.teacherId = teacherId;
        }

        const question = await QuestionBank.findOne({ where: whereClause });
        if (!question) {
            return res.status(404).json({ success: false, message: "Question not found or unauthorized" });
        }

        // Options map via CASCADE delete automatically
        await question.destroy();
        
        res.json({ success: true, message: "Question deleted successfully" });
    } catch (err) {
        console.error("Error deleting question:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getTopics = async (req, res, next) => {
    try {
        const { courseId } = req.query;
        const where = {};
        if (courseId) where.courseId = courseId;

        const topics = await QuestionBank.findAll({
            where,
            attributes: [
                [sequelize.fn('DISTINCT', sequelize.col('topic')), 'topic']
            ],
            raw: true
        });

        const topicList = topics.map(t => t.topic).filter(Boolean);
        res.json(topicList);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
