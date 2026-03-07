const Exam = require('../models/Exam');
const ExamResult = require('../models/ExamResult');
const Notification = require('../models/Notification');
const activityController = require('./activityController');
const Course = require('../models/Course');

exports.getAllExams = async (req, res, next) => {
    try {
        const exams = await Exam.findAll();
        res.json(exams);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getTeacherExams = async (req, res, next) => {
    try {
        const teacherId = req.params.teacherId;
        const courses = await Course.findAll({ where: { teacherId } });
        const courseIds = courses.map(c => c.id);

        const exams = await Exam.findAll({ where: { courseId: courseIds } });
        res.json(exams);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createExam = async (req, res, next) => {
    try {
        const exam = await Exam.create(req.body);
        res.status(201).json(exam);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getExamById = async (req, res, next) => {
    try {
        const exam = await Exam.findByPk(req.params.id);
        if (!exam) return res.status(404).json({ message: 'Exam not found' });
        res.json(exam);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.submitExam = async (req, res, next) => {
    try {
        const examId = req.params.id;
        const studentId = req.user.id;
        const { answers } = req.body;

        const exam = await Exam.findByPk(examId);
        if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

        let calculatedScore = 0;
        let allQuestions = [];

        if (exam.sections && Array.isArray(exam.sections)) {
            allQuestions = exam.sections.flatMap(s => s.questions || []);
        } else if (exam.questions && Array.isArray(exam.questions)) {
            allQuestions = exam.questions;
        }

        for (const q of allQuestions) {
            const studentAns = answers[q.id];
            if (studentAns !== undefined && studentAns === q.correctAnswer) {
                calculatedScore += (q.marks || 1);
            }
        }

        let result = await ExamResult.findOne({ where: { studentId, examId } });
        if (result) {
            return res.status(400).json({ success: false, message: 'You have already submitted this exam' });
        }

        result = await ExamResult.create({
            studentId,
            examId,
            score: calculatedScore,
            totalMarks: exam.totalMarks,
            answers
        });

        await activityController.logActivity({
            user: req.user.name,
            avatar: req.user.avatar,
            action: 'completed exam',
            target: exam.title,
            userId: req.user.id
        });

        res.status(201).json({ success: true, result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to submit exam' });
    }
};

exports.updateExam = async (req, res, next) => {
    try {
        const exam = await Exam.findByPk(req.params.id);
        if (!exam) return res.status(404).json({ message: 'Exam not found' });
        await exam.update(req.body);
        res.json(exam);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteExam = async (req, res, next) => {
    try {
        const exam = await Exam.findByPk(req.params.id);
        if (!exam) return res.status(404).json({ message: 'Exam not found' });
        await exam.destroy();
        res.json({ message: 'Exam deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getTeacherResults = async (req, res, next) => {
    try {
        const teacherId = req.params.teacherId;
        const courses = await Course.findAll({ where: { teacherId } });
        const courseIds = courses.map(c => c.id);

        const exams = await Exam.findAll({ where: { courseId: courseIds } });
        const examIds = exams.map(e => e.id);

        const results = await ExamResult.findAll({
            where: { examId: examIds },
            order: [['submittedAt', 'DESC']]
        });

        res.json({ success: true, results });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.scheduleExam = async (req, res, next) => {
    try {
        const { examId, scheduledAt, duration } = req.body;
        const exam = await Exam.findByPk(examId);
        if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

        const expiresAt = new Date(new Date(scheduledAt).getTime() + duration * 60000);

        await exam.update({
            scheduledAt,
            expiresAt,
            status: 'Active'
        });

        // Create Notification for Students
        await Notification.create({
            title: 'New Exam Scheduled',
            message: `The exam "${exam.title}" for course "${exam.courseName}" has been scheduled for ${new Date(scheduledAt).toLocaleString()}.`,
            type: 'info',
            role: 'Student'
        });

        // Log Activity
        await activityController.logActivity({
            user: req.user.name,
            avatar: req.user.avatar,
            action: 'scheduled an exam',
            target: exam.title,
            userId: req.user.id
        });

        res.json({ success: true, message: 'Exam scheduled and students notified', exam });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getAllResults = async (req, res, next) => {
    try {
        const results = await ExamResult.findAll({
            order: [['submittedAt', 'DESC']]
        });
        res.json({ success: true, results });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getStudentResults = async (req, res, next) => {
    try {
        const studentId = req.user.id;
        const results = await ExamResult.findAll({
            where: { studentId },
            order: [['submittedAt', 'DESC']]
        });

        // Manual join to include Exam details
        const resultsWithExams = await Promise.all(results.map(async (r) => {
            const exam = await Exam.findByPk(r.examId, { attributes: ['title', 'courseName', 'category'] });
            return { ...r.toJSON(), Exam: exam };
        }));

        res.json({ success: true, results: resultsWithExams });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
