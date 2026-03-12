const { ExamResult, ExamAttempt, Exam, StudentAnswer, QuestionBank, User, Batch } = require('../models/associations');
const { Op } = require('sequelize');

exports.getLeaderboard = async (req, res, next) => {
    try {
        const { examId, batchId } = req.query; // If batchId is provided, filter leaderboard
        let whereClause = { examId, status: 'pass' };
        if (batchId) whereClause.batchId = batchId;

        const results = await ExamResult.findAll({
            where: whereClause,
            include: [{ model: User, as: 'student', attributes: ['id', 'name', 'avatar'] }],
            order: [
                ['obtainedMarks', 'DESC'],
                ['createdAt', 'ASC'] // Tie breaker by submission time (first to submit wins tie)
            ],
            limit: 50
        });

        res.json({ success: true, leaderboard: results });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getStudentResults = async (req, res, next) => {
    try {
        const studentId = req.user.id;
        const results = await ExamResult.findAll({
            where: { studentId },
            include: [{ model: Exam, as: 'exam', attributes: ['title', 'examType', 'courseId'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json({ success: true, results });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getTeacherExamSubmissions = async (req, res, next) => {
    try {
        const { examId } = req.params;
        const attempts = await ExamAttempt.findAll({
            where: { examId, status: { [Op.in]: ['submitted', 'evaluated'] } },
            include: [{ model: User, as: 'student', attributes: ['name', 'email'] }],
            order: [['submitTime', 'DESC']]
        });
        res.json({ success: true, attempts });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.gradeSubjectiveAnswer = async (req, res, next) => {
    try {
        const { attemptId } = req.params;
        const { questionId, marksAwarded } = req.body;

        const attempt = await ExamAttempt.findByPk(attemptId, { include: ['exam'] });
        if (!attempt) return res.status(404).json({ success: false, message: "Attempt not found" });

        const answer = await StudentAnswer.findOne({ where: { attemptId, questionId } });
        if (!answer) return res.status(404).json({ success: false, message: "Answer not found" });

        // Calculate diff to update totalScore
        const oldMarks = answer.marksAwarded || 0;
        const newMarks = parseFloat(marksAwarded);
        const scoreDiff = newMarks - oldMarks;

        await answer.update({ marksAwarded: newMarks, isCorrect: newMarks > 0 });
        
        const newTotalScore = attempt.totalScore + scoreDiff;
        await attempt.update({ totalScore: newTotalScore });

        res.json({ success: true, message: "Grade updated successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.publishResults = async (req, res, next) => {
    try {
        const { examId } = req.params;
        const exam = await Exam.findByPk(examId);
        if (!exam) return res.status(404).json({ success: false, message: "Exam not found" });

        // Find all evaluated attempts that don't have results yet
        const attempts = await ExamAttempt.findAll({
            where: { examId, status: 'evaluated' }
        });

        const newResults = [];
        for (const attempt of attempts) {
            const existing = await ExamResult.findOne({ where: { examId, studentId: attempt.studentId } });
            if (!existing) {
                const percentage = (attempt.totalScore / exam.totalMarks) * 100;
                newResults.push({
                    examId,
                    studentId: attempt.studentId,
                    batchId: attempt.batchId,
                    totalMarks: exam.totalMarks,
                    obtainedMarks: attempt.totalScore,
                    percentage,
                    status: percentage >= exam.passingMarks ? 'pass' : 'fail',
                    publishedAt: new Date()
                });
            }
        }

        if (newResults.length > 0) {
            await ExamResult.bulkCreate(newResults);
        }

        await exam.update({ status: 'Completed' });

        res.json({ success: true, message: `${newResults.length} results published.` });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getAllResults = async (req, res, next) => {
    try {
        const results = await ExamResult.findAll({
            include: [
                { model: Exam, as: 'exam', attributes: ['title', 'examType', 'courseId'] },
                { model: User, as: 'student', attributes: ['id', 'name', 'email', 'batch'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        // Map for frontend compatibility if needed, but Context maps it too.
        // Frontend expects: id, studentId, score (obtainedMarks), totalMarks, submittedAt (createdAt)
        const mappedResults = results.map(r => ({
            id: r.id,
            studentId: r.studentId,
            examId: r.examId,
            score: r.obtainedMarks,
            totalMarks: r.totalMarks,
            submittedAt: r.createdAt
        }));

        res.json({ success: true, results: mappedResults });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
