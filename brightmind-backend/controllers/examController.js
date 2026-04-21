const { Exam, ExamQuestion, QuestionBank, QuestionOption, Course } = require('../models/associations');
const { Op } = require('sequelize');
const sequelize = require('../config/db');
const logAdminActivity = require('../utils/logAdminActivity');

exports.createExam = async (req, res, next) => {
    try {
        const { title, description, courseId, batchId, examType, duration, totalMarks, passingMarks, negativeMarking, randomizeQuestions, randomizeOptions, startTime, endTime, questions, sections } = req.body;
        const teacherId = req.user.id;

        // Validate batch belongs to the given course
        if (batchId) {
            const { Batch } = require('../models/associations');
            const batch = await Batch.findByPk(batchId, { attributes: ['id', 'courseId'] });
            if (!batch) return res.status(400).json({ success: false, message: 'Batch not found' });
            if (String(batch.courseId) !== String(courseId)) {
                return res.status(400).json({ success: false, message: 'Batch does not belong to the selected course' });
            }
        }

        const exam = await Exam.create({
            title, description, courseId, batchId, teacherId, examType, duration, totalMarks, passingMarks, negativeMarking, randomizeQuestions, randomizeOptions, startTime, endTime, status: 'Draft',
            tenantId: req.user?.tenantId || null
        });

        // Link questions if provided manually (flat list)
        if (questions && questions.length > 0) {
            const eqData = questions.map((q, idx) => ({
                examId: exam.id,
                questionId: typeof q === 'string' ? q : q.id,
                marks: q.marks || null,
                order: idx + 1
            }));
            await ExamQuestion.bulkCreate(eqData);
        }

        // Link questions via sections
        if (sections && sections.length > 0) {
            let eqData = [];
            let globalOrder = 1;
            sections.forEach(section => {
                if (section.questions && section.questions.length > 0) {
                    section.questions.forEach(q => {
                        eqData.push({
                            examId: exam.id,
                            questionId: typeof q === 'string' ? q : q.id,
                            marks: section.marksPerQuestion || null,
                            order: globalOrder++,
                            sectionName: section.name
                        });
                    });
                }
            });
            if (eqData.length > 0) {
                await ExamQuestion.bulkCreate(eqData);
            }
        }

        if (['Admin', 'SuperAdmin'].includes(req.user?.role)) {
            logAdminActivity(req.user.id, 'exam', 'CREATE', `Admin created exam "${title}"`, req.ip);
        }

        res.status(201).json({ success: true, exam });
    } catch (err) {
        console.error("Error creating exam:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getExams = async (req, res, next) => {
    try {
        const teacherId = req.user.id;
        let whereClause;
        if (req.user.role === 'SuperAdmin') {
            whereClause = {};
        } else if (req.user.role === 'Admin') {
            whereClause = { tenantId: req.user.tenantId || null };
        } else {
            whereClause = { teacherId, tenantId: req.user.tenantId || null };
        }
        const exams = await Exam.findAll({
            where: whereClause,
            include: [{ model: Course, as: 'course', attributes: ['title'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(exams); // Frontend expects direct array from AdminExamContext.jsx
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.generateRandomPaper = async (req, res, next) => {
    try {
        const { examId } = req.params;
        const { easyCount, mediumCount, hardCount } = req.body;
        
        const exam = await Exam.findByPk(examId);
        if (!exam) return res.status(404).json({ success: false, message: "Exam not found" });

        const fetchRandomQs = async (difficulty, limit) => {
            if (!limit || limit <= 0) return [];
            return await QuestionBank.findAll({
                where: { courseId: exam.courseId, difficulty },
                order: sequelize.random(),
                limit
            });
        };

        const [easyQs, medQs, hardQs] = await Promise.all([
            fetchRandomQs('Easy', easyCount),
            fetchRandomQs('Medium', mediumCount),
            fetchRandomQs('Hard', hardCount)
        ]);

        const allQs = [...easyQs, ...medQs, ...hardQs];
        
        if (allQs.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: "No questions found in the bank for this course matching the criteria." 
            });
        }
        
        // Remove existing questions
        await ExamQuestion.destroy({ where: { examId } });

        const eqData = allQs.map((q, idx) => ({
            examId,
            questionId: q.id,
            marks: q.marks,
            order: idx + 1
        }));
        await ExamQuestion.bulkCreate(eqData);

        res.json({ success: true, message: `Random paper generated with ${allQs.length} questions` });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getTeacherExams = async (req, res, next) => {
    try {
        const teacherId = req.user.id;
        const { Batch } = require('../models/associations');
        let whereClause;
        if (req.user.role === 'SuperAdmin') {
            whereClause = {};
        } else if (req.user.role === 'Admin') {
            whereClause = { tenantId: req.user.tenantId || null };
        } else {
            whereClause = { teacherId, tenantId: req.user.tenantId || null };
        }
        const exams = await Exam.findAll({
            where: whereClause,
            include: [
                { model: Course, as: 'course', attributes: ['title'] },
                { model: Batch, as: 'batch' },
                { model: ExamQuestion, as: 'examQuestions', attributes: ['id'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(exams);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getStudentExams = async (req, res, next) => {
    try {
        const studentId = req.user.id;
        const tenantId = req.user.tenantId || null;
        const { User, Batch, Enrollment, Course, ExamQuestion } = require('../models/associations');
        
        // Find enrolled batches via User (join table) + direct batchId fallback
        const studentWithBatches = await User.findByPk(studentId, {
            include: [{ model: Batch, as: 'enrolledBatches', attributes: ['id', 'courseId'] }]
        });
        
        // Find direct course enrollments
        const directEnrollments = await Enrollment.findAll({
            where: { studentId },
            attributes: ['courseId']
        });

        const batchIds = studentWithBatches ? studentWithBatches.enrolledBatches.map(b => b.id) : [];
        const courseIdsFromBatches = studentWithBatches ? studentWithBatches.enrolledBatches.map(b => b.courseId).filter(Boolean) : [];

        // Legacy direct batch assignment (User.batchId)
        if (studentWithBatches?.batchId && !batchIds.includes(studentWithBatches.batchId)) {
            batchIds.push(studentWithBatches.batchId);
            const directBatch = await Batch.findByPk(studentWithBatches.batchId, { attributes: ['id', 'courseId'] });
            if (directBatch?.courseId && !courseIdsFromBatches.includes(directBatch.courseId)) {
                courseIdsFromBatches.push(directBatch.courseId);
            }
        }
        const courseIdsFromEnrollments = directEnrollments.map(e => e.courseId);
        
        const allCourseIds = [...new Set([...courseIdsFromBatches, ...courseIdsFromEnrollments])];

        const examOrClauses = [];
        if (batchIds.length > 0) examOrClauses.push({ batchId: { [Op.in]: batchIds } });
        if (allCourseIds.length > 0) examOrClauses.push({ batchId: null, courseId: { [Op.in]: allCourseIds } });

        const examWhere = {
            status: 'Active'
        };
        if (examOrClauses.length > 0) {
            examWhere[Op.or] = examOrClauses;
        } else {
            // Student has no access to any exams if not enrolled
            examWhere.id = null; // Forces an empty result safely
        }

        // Tenant isolation: student only sees exams from their own tenant
        if (tenantId) examWhere.tenantId = tenantId;

        const exams = await Exam.findAll({
            where: examWhere,
            include: [
                { model: Course, as: 'course', attributes: ['title'] },
                { model: ExamQuestion, as: 'examQuestions', attributes: ['id'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        const validExams = exams.filter(e => {
            const hasTitle = e.title && e.title.trim() !== '';
            const hasQuestions = e.examQuestions && e.examQuestions.length > 0;
            return hasTitle && hasQuestions;
        });

        res.json(validExams);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getExamById = async (req, res, next) => {
    try {
        const tenantId = req.user?.role === 'SuperAdmin' ? null : (req.user?.tenantId || null);
        const where = { id: req.params.id };
        if (tenantId) where.tenantId = tenantId;

        const exam = await Exam.findOne({
            where,
            include: [{
                model: ExamQuestion,
                as: 'examQuestions',
                include: [{
                    model: QuestionBank,
                    as: 'question',
                    include: [{ model: QuestionOption, as: 'options' }]
                }]
            }]
        });
        if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

        // Optionally hide `isCorrect` from options if requester is a student
        if (req.user.role === 'Student') {
            const safeExam = exam.toJSON();
            safeExam.examQuestions.forEach(eq => {
                if (eq.question && eq.question.options) {
                    eq.question.options.forEach(opt => delete opt.isCorrect);
                    delete eq.question.explanation;
                }
            });
            return res.json(safeExam);
        }

        res.json(exam);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateExam = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description, courseId, batchId, examType, duration, totalMarks, passingMarks, negativeMarking, randomizeQuestions, randomizeOptions, startTime, endTime, questions, sections, status } = req.body;

        const tenantId = req.user?.role === 'SuperAdmin' ? null : (req.user?.tenantId || null);
        const where = { id };
        if (tenantId) where.tenantId = tenantId;
        const exam = await Exam.findOne({ where });
        if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

        await exam.update({
            title, description, courseId, batchId, examType, duration, totalMarks, passingMarks, negativeMarking, randomizeQuestions, randomizeOptions, startTime, endTime, status
        });

        // Update Questions/Sections if provided
        if (sections || questions) {
            // Drop old associations
            await ExamQuestion.destroy({ where: { examId: id } });

            let eqData = [];
            let globalOrder = 1;

            if (questions && questions.length > 0) {
                questions.forEach(q => {
                    eqData.push({
                        examId: id,
                        questionId: typeof q === 'string' ? q : q.id,
                        marks: q.marks || null,
                        order: globalOrder++
                    });
                });
            }

            if (sections && sections.length > 0) {
                sections.forEach(section => {
                    if (section.questions && section.questions.length > 0) {
                        section.questions.forEach(q => {
                            eqData.push({
                                examId: id,
                                questionId: typeof q === 'string' ? q : q.id,
                                marks: section.marksPerQuestion || null,
                                order: globalOrder++,
                                sectionName: section.name
                            });
                        });
                    }
                });
            }

            if (eqData.length > 0) {
                await ExamQuestion.bulkCreate(eqData);
            }
        }

        if (['Admin', 'SuperAdmin'].includes(req.user?.role)) {
            logAdminActivity(req.user.id, 'exam', 'UPDATE', `Admin updated exam "${title || exam.title}"`, req.ip);
        }

        res.json(exam);
    } catch (err) {
        console.error("Error updating exam:", err);
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.deleteExam = async (req, res, next) => {
    try {
        const tenantId = req.user?.role === 'SuperAdmin' ? null : (req.user?.tenantId || null);
        const where = { id: req.params.id };
        if (tenantId) where.tenantId = tenantId;
        const exam = await Exam.findOne({ where });
        if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
        const title = exam.title;
        await exam.destroy();

        if (['Admin', 'SuperAdmin'].includes(req.user?.role)) {
            logAdminActivity(req.user.id, 'exam', 'DELETE', `Admin deleted exam "${title}"`, req.ip);
        }

        res.json({ success: true, message: 'Exam deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── Simple Inline Question Management ────────────────────────────────────────

// Get exam's questions with options
exports.getExamQuestions = async (req, res, next) => {
    try {
        const { examId } = req.params;
        // Verify exam belongs to caller's tenant
        const tenantId = req.user?.role === 'SuperAdmin' ? null : (req.user?.tenantId || null);
        const examWhere = { id: examId };
        if (tenantId) examWhere.tenantId = tenantId;
        const exam = await Exam.findOne({ where: examWhere });
        if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

        const eqs = await ExamQuestion.findAll({
            where: { examId },
            include: [{ model: QuestionBank, as: 'question', include: [{ model: QuestionOption, as: 'options' }] }],
            order: [['order', 'ASC']]
        });
        res.json({ success: true, questions: eqs });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Add a question directly to an exam (inline, no separate QB flow)
exports.addQuestionToExam = async (req, res, next) => {
    try {
        const { examId } = req.params;
        // Verify exam belongs to caller's tenant
        const tenantId = req.user?.role === 'SuperAdmin' ? null : (req.user?.tenantId || null);
        const examWhere = { id: examId };
        if (tenantId) examWhere.tenantId = tenantId;
        const exam = await Exam.findOne({ where: examWhere });
        if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

        const { questionText, questionType, marks, options } = req.body;
        if (!questionText) return res.status(400).json({ success: false, message: 'questionText is required' });

        const allowedTypes = ['MCQ', 'Multiple Select', 'True False', 'Short Answer', 'Long Answer', 'Numerical'];
        const type = allowedTypes.includes(questionType) ? questionType : 'MCQ';
        const numericMarks = Number(marks) > 0 ? Number(marks) : 1;

        const needsOptions = ['MCQ', 'Multiple Select', 'True False'].includes(type);
        let normalizedOptions = [];
        if (needsOptions) {
            const incoming = Array.isArray(options) ? options : [];
            normalizedOptions = incoming
                .map(opt => ({ optionText: (opt.optionText || '').trim(), isCorrect: !!opt.isCorrect }))
                .filter(opt => opt.optionText);
            if (normalizedOptions.length < 2) {
                return res.status(400).json({ success: false, message: 'At least two options are required' });
            }
            if (!normalizedOptions.some(o => o.isCorrect)) {
                return res.status(400).json({ success: false, message: 'Mark at least one option as correct' });
            }
            if (type === 'True False') {
                const trueOpt = normalizedOptions.find(o => o.optionText.toLowerCase() === 'true');
                const falseOpt = normalizedOptions.find(o => o.optionText.toLowerCase() === 'false');
                normalizedOptions = [
                    { optionText: 'True', isCorrect: !!trueOpt?.isCorrect },
                    { optionText: 'False', isCorrect: !!falseOpt?.isCorrect }
                ];
                if (!normalizedOptions.some(o => o.isCorrect)) {
                    return res.status(400).json({ success: false, message: 'Select True or False as correct' });
                }
            }
        }

        const t = await sequelize.transaction();
        try {
            const question = await QuestionBank.create({
                courseId: exam.courseId || 'general',
                teacherId: req.user.id,
                questionText,
                questionType: type,
                marks: numericMarks,
                difficulty: 'Medium',
                tenantId: req.user?.tenantId || null
            }, { transaction: t });

            if (needsOptions) {
                await QuestionOption.bulkCreate(normalizedOptions.map(opt => ({
                    questionId: question.id,
                    optionText: opt.optionText,
                    isCorrect: opt.isCorrect || false
                })), { transaction: t });
            }

            const count = await ExamQuestion.count({ where: { examId }, transaction: t });
            const eq = await ExamQuestion.create({ examId, questionId: question.id, marks: numericMarks, order: count + 1 }, { transaction: t });

            await t.commit();

            const full = await ExamQuestion.findByPk(eq.id, {
                include: [{ model: QuestionBank, as: 'question', include: [{ model: QuestionOption, as: 'options' }] }]
            });

            res.json({ success: true, examQuestion: full });
        } catch (err) {
            await t.rollback();
            throw err;
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Update a question inline
exports.updateExamQuestion = async (req, res, next) => {
    try {
        const { eqId } = req.params;
        const { questionText, marks, options } = req.body;

        const eq = await ExamQuestion.findByPk(eqId, {
            include: [{ model: QuestionBank, as: 'question' }]
        });
        if (!eq) return res.status(404).json({ success: false, message: 'Question not found' });

        // Tenant check via parent exam
        const tenantId = req.user?.role === 'SuperAdmin' ? null : (req.user?.tenantId || null);
        if (tenantId) {
            const exam = await Exam.findOne({ where: { id: eq.examId, tenantId } });
            if (!exam) return res.status(403).json({ success: false, message: 'Access denied: wrong tenant' });
        }

        const numericMarks = Number(marks) > 0 ? Number(marks) : (eq.marks || eq.question.marks || 1);
        const updatedText = questionText || eq.question.questionText;
        const type = eq.question.questionType;
        const needsOptions = ['MCQ', 'Multiple Select', 'True False'].includes(type);

        let normalizedOptions = [];
        if (needsOptions) {
            const incoming = Array.isArray(options) ? options : [];
            normalizedOptions = incoming
                .map(opt => ({ optionText: (opt.optionText || '').trim(), isCorrect: !!opt.isCorrect }))
                .filter(opt => opt.optionText);
            if (normalizedOptions.length < 2) {
                return res.status(400).json({ success: false, message: 'At least two options are required' });
            }
            if (!normalizedOptions.some(o => o.isCorrect)) {
                return res.status(400).json({ success: false, message: 'Mark at least one option as correct' });
            }
            if (type === 'True False') {
                const trueOpt = normalizedOptions.find(o => o.optionText.toLowerCase() === 'true');
                const falseOpt = normalizedOptions.find(o => o.optionText.toLowerCase() === 'false');
                normalizedOptions = [
                    { optionText: 'True', isCorrect: !!trueOpt?.isCorrect },
                    { optionText: 'False', isCorrect: !!falseOpt?.isCorrect }
                ];
                if (!normalizedOptions.some(o => o.isCorrect)) {
                    return res.status(400).json({ success: false, message: 'Select True or False as correct' });
                }
            }
        }

        const t = await sequelize.transaction();
        try {
            await eq.question.update({ questionText: updatedText, marks: numericMarks }, { transaction: t });
            await eq.update({ marks: numericMarks }, { transaction: t });

            if (needsOptions) {
                await QuestionOption.destroy({ where: { questionId: eq.questionId }, transaction: t });
                await QuestionOption.bulkCreate(normalizedOptions.map(opt => ({
                    questionId: eq.questionId,
                    optionText: opt.optionText,
                    isCorrect: opt.isCorrect || false
                })), { transaction: t });
            } else {
                // Clear any stale options for descriptive questions
                await QuestionOption.destroy({ where: { questionId: eq.questionId }, transaction: t });
            }

            await t.commit();

            const full = await ExamQuestion.findByPk(eqId, {
                include: [{ model: QuestionBank, as: 'question', include: [{ model: QuestionOption, as: 'options' }] }]
            });

            res.json({ success: true, examQuestion: full });
        } catch (err) {
            await t.rollback();
            throw err;
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Remove a question from exam (deletes QB entry too)
exports.removeQuestionFromExam = async (req, res, next) => {
    try {
        const { eqId } = req.params;
        const eq = await ExamQuestion.findByPk(eqId);
        if (!eq) return res.status(404).json({ success: false, message: 'Question not found' });

        // Tenant check via parent exam
        const tenantId = req.user?.role === 'SuperAdmin' ? null : (req.user?.tenantId || null);
        if (tenantId) {
            const exam = await Exam.findOne({ where: { id: eq.examId, tenantId } });
            if (!exam) return res.status(403).json({ success: false, message: 'Access denied: wrong tenant' });
        }

        const questionId = eq.questionId;
        await eq.destroy();
        await QuestionOption.destroy({ where: { questionId } });
        await QuestionBank.destroy({ where: { id: questionId } });

        res.json({ success: true, message: 'Question removed' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Update exam status (Draft / Active)
exports.updateExamStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!['Draft', 'Active', 'Completed'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }
        const exam = await Exam.findByPk(id);
        if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
        await exam.update({ status });
        res.json({ success: true, exam });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
