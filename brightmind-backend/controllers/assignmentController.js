const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const User = require('../models/User');
const Batch = require('../models/Batch');

exports.submitAssignment = async (req, res, next) => {
    try {
        const { assignmentId, fileUrl, content, answers, grade, status } = req.body;
        const student = await User.findByPk(req.user.id);

        if (!student) {
            return res.status(404).json({ message: 'User not found' });
        }

        const assignment = await Assignment.findByPk(assignmentId);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        let submissionStatus = status || 'Submitted';
        let submissionGrade = grade || null;

        const [submission, created] = await Submission.findOrCreate({
            where: { assignmentId, studentId: student.id },
            defaults: {
                studentName: student.name,
                studentBatch: student.batch,
                fileUrl,
                content,
                status: submissionStatus,
                grade: submissionGrade,
                submittedAt: new Date()
            }
        });

        if (!created) {
            await submission.update({
                fileUrl,
                content,
                status: submissionStatus,
                grade: submissionGrade,
                submittedAt: new Date()
            });
        }

        res.status(200).json(submission);
    } catch (err) {
        console.error("error in submitAssignment:", err);
        res.status(500).json({ message: err.message });
    }
};

exports.getAllAssignments = async (req, res, next) => {
    try {
        const { courseId, batchId } = req.query;
        let where = {};
        if (courseId) where.courseId = courseId;
        
        // Role-based filtering
        if (req.user && req.user.role === 'Student') {
            const student = await User.findByPk(req.user.id);
            if (!student.batchId) {
                return res.json([]); // No assignments if not in a batch
            }
            where.batchId = student.batchId;
        } else if (req.user && req.user.role === 'Teacher') {
            if (batchId) {
                where.batchId = batchId;
            } else {
                // Return assignments belonging to any batch this teacher teaches
                const batches = await Batch.findAll({ where: { teacherId: req.user.id }, attributes: ['id'] });
                where.batchId = batches.map(b => b.id);
            }
        } else {
            // Admin
            if (batchId) where.batchId = batchId;
        }

        const assignments = await Assignment.findAll({
            where,
            include: [{ model: Batch, as: 'batch', attributes: ['id', 'batchName'] }],
            order: [['createdAt', 'DESC']]
        });

        // If student is logged in, fetch their submissions
        if (req.user && req.user.role === 'Student') {
            const submissions = await Submission.findAll({
                where: { studentId: req.user.id }
            });

            const result = assignments.map(a => {
                const sub = submissions.find(s => s.assignmentId === a.id);
                return {
                    ...a.toJSON(),
                    status: sub ? sub.status : 'Pending',
                    grade: sub ? sub.grade : null,
                    submissionDate: sub ? sub.submittedAt : null,
                    studentSubmission: sub ? sub : null
                };
            });
            return res.json(result);
        }

        res.json(assignments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createAssignment = async (req, res, next) => {
    try {
        const assignment = await Assignment.create(req.body);
        res.status(201).json(assignment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateAssignment = async (req, res, next) => {
    try {
        const assignment = await Assignment.findByPk(req.params.id);
        if (!assignment) return res.status(404).json({ message: 'Not found' });
        await assignment.update(req.body);
        res.json(assignment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getSubmissions = async (req, res, next) => {
    try {
        const submissions = await Submission.findAll({ where: { assignmentId: req.params.id } });
        res.json(submissions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteAssignment = async (req, res, next) => {
    try {
        const assignment = await Assignment.findByPk(req.params.id);
        if (!assignment) return res.status(404).json({ message: 'Not found' });
        await assignment.destroy();
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.gradeAssignment = async (req, res, next) => {
    try {
        const { studentId, grade } = req.body;
        const assignmentId = req.params.id;
        
        const submission = await Submission.findOne({ where: { assignmentId, studentId } });
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }
        
        await submission.update({ grade, status: 'Graded' });
        res.json(submission);
    } catch (err) {
        console.error("error in gradeAssignment:", err);
        res.status(500).json({ message: err.message });
    }
};
