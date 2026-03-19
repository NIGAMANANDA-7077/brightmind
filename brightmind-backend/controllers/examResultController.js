const { ExamResult, ExamAttempt, Exam, StudentAnswer, QuestionBank, User, Batch, Notification } = require('../models/associations');
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

        // Tenant ownership check
        if (req.user.role !== 'SuperAdmin' && req.user.tenantId && exam.tenantId && exam.tenantId !== req.user.tenantId) {
            return res.status(403).json({ success: false, message: 'Access denied: wrong tenant' });
        }

        // Block re-publishing if already completed
        if (exam.status === 'Completed') {
            return res.status(409).json({ success: false, message: "Results have already been published for this exam." });
        }

        // Include both 'submitted' (auto-graded MCQ) and 'evaluated' attempts
        const attempts = await ExamAttempt.findAll({
            where: { examId, status: { [Op.in]: ['submitted', 'evaluated'] } }
        });

        const newResults = [];
        for (const attempt of attempts) {
            const existing = await ExamResult.findOne({ where: { examId, studentId: attempt.studentId } });
            if (!existing) {
                const percentage = exam.totalMarks > 0 ? (attempt.totalScore / exam.totalMarks) * 100 : 0;
                newResults.push({
                    examId,
                    studentId: attempt.studentId,
                    batchId: attempt.batchId || exam.batchId,
                    totalMarks: exam.totalMarks,
                    obtainedMarks: attempt.totalScore,
                    percentage,
                    status: percentage >= exam.passingMarks ? 'pass' : 'fail',
                    publishedAt: new Date(),
                    tenantId: exam.tenantId || null
                });
            }
        }

        if (newResults.length > 0) {
            await ExamResult.bulkCreate(newResults);
        }

        await exam.update({ status: 'Completed' });

        // Send notification to affected students/batch
        try {
            const notifData = {
                title: `Results Published: ${exam.title}`,
                message: `Results for "${exam.title}" have been published. Check the leaderboard to see your score!`,
                type: 'success',
                role: 'Student',
                referenceId: examId,
                batchId: exam.batchId || null
            };
            await Notification.create(notifData);
        } catch (notifErr) {
            console.error("Notification creation failed (non-critical):", notifErr.message);
        }

        res.json({ success: true, message: `${newResults.length} results published. Students have been notified.` });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getAllResults = async (req, res, next) => {
    try {
        const where = {};
        if (req.user.role !== 'SuperAdmin' && req.user.tenantId) {
            where.tenantId = req.user.tenantId;
        }

        const results = await ExamResult.findAll({
            where,
            include: [
                { model: Exam, as: 'exam', attributes: ['title', 'examType', 'courseId'] },
                { model: User, as: 'student', attributes: ['id', 'name', 'email', 'batch'] }
            ],
            order: [['createdAt', 'DESC']]
        });

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
