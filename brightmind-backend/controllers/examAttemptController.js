const { Exam, ExamAttempt, StudentAnswer, QuestionBank, QuestionOption } = require('../models/associations');

exports.startExam = async (req, res, next) => {
    try {
        const { examId } = req.params;
        const studentId = req.user.id;

        const examWhere = { id: examId };
        if (req.user.tenantId) examWhere.tenantId = req.user.tenantId;
        const exam = await Exam.findOne({ where: examWhere });
        if (!exam) return res.status(404).json({ success: false, message: "Exam not found" });

        // Check if already attempted
        const existingAttempt = await ExamAttempt.findOne({ where: { examId, studentId } });
        if (existingAttempt && existingAttempt.status !== 'not_started') {
            return res.status(400).json({ success: false, message: "Exam attempt already started or submitted", attempt: existingAttempt });
        }

        const attempt = await ExamAttempt.create({
            examId,
            studentId,
            batchId: exam.batchId,
            startTime: new Date(),
            status: 'in_progress'
        });

        res.status(201).json({ success: true, attempt });
    } catch (err) {
        console.error("Error starting exam:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.saveAnswer = async (req, res, next) => {
    try {
        const { attemptId } = req.params;
        const studentId = req.user.id;
        const { questionId, selectedOptionId, selectedOptions, textAnswer } = req.body;

        const attempt = await ExamAttempt.findOne({ where: { id: attemptId, studentId } });
        if (!attempt) return res.status(404).json({ success: false, message: "Attempt not found" });
        if (attempt.status !== 'in_progress') return res.status(400).json({ success: false, message: "Exam is not in progress" });

        // Upsert the answer
        let answer = await StudentAnswer.findOne({ where: { attemptId, questionId } });
        if (answer) {
            await answer.update({ selectedOptionId, selectedOptions, textAnswer });
        } else {
            answer = await StudentAnswer.create({
                attemptId, questionId, selectedOptionId, selectedOptions, textAnswer
            });
        }

        res.json({ success: true, answer });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.submitExam = async (req, res, next) => {
    try {
        const { attemptId } = req.params;
        const studentId = req.user.id;

        const attempt = await ExamAttempt.findOne({ where: { id: attemptId, studentId } });
        if (!attempt) return res.status(404).json({ success: false, message: "Attempt not found" });
        if (attempt.status !== 'in_progress') return res.status(400).json({ success: false, message: "Exam already submitted" });

        await attempt.update({
            submitTime: new Date(),
            status: 'submitted'
        });

        // Trigger auto-evaluation synchronously or asynchronously
        await evaluateAttempt(attemptId);

        res.json({ success: true, message: "Exam submitted successfully", attempt });
    } catch (err) {
        console.error("Error submitting exam:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.flagAttempt = async (req, res, next) => {
    try {
        const { attemptId } = req.params;
        const { reason } = req.body;

        const attempt = await ExamAttempt.findByPk(attemptId);
        if (attempt) {
            await attempt.update({ isFlagged: true, flagReason: reason });
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Internal auto evaluator
async function evaluateAttempt(attemptId) {
    const attempt = await ExamAttempt.findByPk(attemptId, {
        include: [{ 
            model: StudentAnswer, 
            as: 'answers',
            include: [{ model: QuestionBank, as: 'question', include: [{ model: QuestionOption, as: 'options' }] }]
        }, {
            model: Exam, as: 'exam'
        }]
    });

    let totalScore = 0;
    const { negativeMarking } = attempt.exam;

    for (const ans of attempt.answers) {
        const q = ans.question;
        let isCorrect = false;

        if (q.questionType === 'MCQ' || q.questionType === 'True False') {
            const correctOpt = q.options.find(o => o.isCorrect);
            if (correctOpt && correctOpt.id === ans.selectedOptionId) {
                isCorrect = true;
            }
        } else if (q.questionType === 'Multiple Select') {
            const correctOpts = q.options.filter(o => o.isCorrect).map(o => o.id).sort();
            const studentOpts = (ans.selectedOptions || []).sort();
            if (JSON.stringify(correctOpts) === JSON.stringify(studentOpts)) {
                isCorrect = true;
            }
        } else if (q.questionType === 'Numerical') {
            // Simplified literal match
            if (ans.textAnswer && q.explanation && q.explanation.includes(ans.textAnswer)) {
                isCorrect = true; // Very basic numerical check, replace later
            }
        }

        if (q.questionType === 'MCQ' || q.questionType === 'True False' || q.questionType === 'Multiple Select') {
            ans.isCorrect = isCorrect;
            if (isCorrect) {
                ans.marksAwarded = q.marks;
                totalScore += q.marks;
            } else if (negativeMarking && ans.selectedOptionId) {
                ans.marksAwarded = -(q.negativeMarks || 0);
                totalScore -= (q.negativeMarks || 0);
            } else {
                ans.marksAwarded = 0;
            }
            await ans.save();
        }
    }

    // Attempt is evaluated partially. If there are subjective questions, they will remain status 'submitted' until teacher grades
    const hasSubjective = attempt.answers.some(a => ['Short Answer', 'Long Answer'].includes(a.question.questionType));
    
    await attempt.update({
        totalScore,
        status: hasSubjective ? 'submitted' : 'evaluated' // Requires manual review if subjective
    });

    if (!hasSubjective) {
        // Generate Result immediately
        const { ExamResult } = require('../models/associations');
        const percentage = (totalScore / attempt.exam.totalMarks) * 100;
        await ExamResult.create({
            examId: attempt.examId,
            studentId: attempt.studentId,
            batchId: attempt.batchId,
            totalMarks: attempt.exam.totalMarks,
            obtainedMarks: totalScore,
            percentage,
            status: percentage >= attempt.exam.passingMarks ? 'pass' : 'fail',
            publishedAt: new Date()
        });
    }
}
