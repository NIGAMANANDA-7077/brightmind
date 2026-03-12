const { Exam, ExamQuestion, QuestionBank, QuestionOption, Course } = require('../models/associations');
const { Op } = require('sequelize');
const sequelize = require('../config/db');

exports.createExam = async (req, res, next) => {
    try {
        const { title, description, courseId, batchId, examType, duration, totalMarks, passingMarks, negativeMarking, randomizeQuestions, randomizeOptions, startTime, endTime, questions, sections } = req.body;
        const teacherId = req.user.id;

        const exam = await Exam.create({
            title, description, courseId, batchId, teacherId, examType, duration, totalMarks, passingMarks, negativeMarking, randomizeQuestions, randomizeOptions, startTime, endTime, status: 'Active'
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

        res.status(201).json({ success: true, exam });
    } catch (err) {
        console.error("Error creating exam:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getExams = async (req, res, next) => {
    try {
        const teacherId = req.user.id;
        const whereClause = req.user.role === 'Admin' ? {} : { teacherId };
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
        const whereClause = req.user.role === 'Admin' ? {} : { teacherId };
        const exams = await Exam.findAll({
            where: whereClause,
            include: [{ model: Course, as: 'course', attributes: ['title'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(exams); // Fixed: direct array for frontend consistency
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getStudentExams = async (req, res, next) => {
    try {
        const studentId = req.user.id;
        const { User, Batch, Enrollment, Course } = require('../models/associations');
        
        // Find enrolled batches via User
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
        const courseIdsFromEnrollments = directEnrollments.map(e => e.courseId);
        
        const allCourseIds = [...new Set([...courseIdsFromBatches, ...courseIdsFromEnrollments])];

        const exams = await Exam.findAll({
            where: {
                status: 'Active',
                [Op.or]: [
                    { batchId: { [Op.in]: batchIds } },
                    { 
                        batchId: null, 
                        courseId: { [Op.in]: allCourseIds } 
                    }
                ]
            },
            include: [{ model: Course, as: 'course', attributes: ['title'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(exams);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getExamById = async (req, res, next) => {
    try {
        const exam = await Exam.findByPk(req.params.id, {
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
                    delete eq.question.explanation; // Hide explanation during exam
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

        const exam = await Exam.findByPk(id);
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

        res.json(exam);
    } catch (err) {
        console.error("Error updating exam:", err);
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.deleteExam = async (req, res, next) => {
    try {
        const exam = await Exam.findByPk(req.params.id);
        if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
        await exam.destroy();
        res.json({ success: true, message: 'Exam deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
