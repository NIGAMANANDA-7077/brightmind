const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const User = require('../models/User');
const Batch = require('../models/Batch');
const Notification = require('../models/Notification');
const BatchStudent = require('../models/BatchStudent');
const { Op } = require('sequelize');

exports.submitAssignment = async (req, res, next) => {
    try {
        const { assignmentId, fileUrl, content, comment, answers, grade, status } = req.body;
        const student = await User.findByPk(req.user.id);

        if (!student) {
            return res.status(404).json({ message: 'User not found' });
        }

        const assignment = await Assignment.findByPk(assignmentId || req.params.id);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        // Detect late submission
        const now = new Date();
        const deadline = new Date(assignment.deadline);
        let submissionStatus = status || (now > deadline ? 'Late' : 'Submitted');
        let submissionGrade = grade || null;

        const [submission, created] = await Submission.findOrCreate({
            where: { assignmentId: assignment.id, studentId: student.id },
            defaults: {
                studentName: student.name,
                studentBatch: student.batchId,
                fileUrl,
                content,
                comment,
                status: submissionStatus,
                grade: submissionGrade,
                submittedAt: new Date()
            }
        });

        if (!created) {
            await submission.update({
                fileUrl: fileUrl || submission.fileUrl,
                content: content || submission.content,
                comment: comment || submission.comment,
                status: submissionStatus,
                grade: submissionGrade,
                submittedAt: new Date()
            });
        }

        // Notify teacher that student submitted
        try {
            if (assignment.teacherId) {
                await Notification.create({
                    userId: assignment.teacherId,
                    title: `📩 Assignment Submitted`,
                    message: `${student.name} submitted "${assignment.title}"`,
                    type: 'assignment',
                    role: 'Teacher',
                    referenceId: assignment.id,
                    link: '/teacher/assignments',
                    read: false
                });
            }
        } catch (notifErr) {
            console.error('Submission notification error:', notifErr.message);
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
        
        // Scope by tenant
        if (req.user?.role !== 'SuperAdmin') {
            where.tenantId = req.user?.tenantId || null;
        }

        // Role-based filtering
        if (req.user && req.user.role === 'Student') {
            // Get all batches this student belongs to
            const studentBatches = await BatchStudent.findAll({ where: { studentId: req.user.id }, attributes: ['batchId'] });
            const batchIds = studentBatches.map(b => b.batchId);
            // Also include the direct batchId on User
            const student = await User.findByPk(req.user.id);
            if (student?.batchId && !batchIds.includes(student.batchId)) batchIds.push(student.batchId);
            if (batchIds.length === 0) return res.json([]);
            where.batchId = { [Op.in]: batchIds };
        } else if (req.user && req.user.role === 'Teacher') {
            if (batchId) {
                where.batchId = batchId;
            } else {
                // Return assignments belonging to any batch this teacher teaches
                const batches = await Batch.findAll({ where: { teacherId: req.user.id }, attributes: ['id'] });
                const batchIds = batches.map(b => b.id);
                if (batchIds.length === 0) return res.json([]);
                where.batchId = { [Op.in]: batchIds };
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
                    feedback: sub ? sub.feedback : null,
                    comment: sub ? sub.comment : null,
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
        const { title, batchId, courseId, courseName, deadline, totalMarks, description, allowLateSubmission } = req.body;
        const assignment = await Assignment.create({
            title,
            batchId: batchId || null,
            courseId: courseId || 'default',
            courseName: courseName || '',
            deadline,
            totalMarks,
            description: description || '',
            allowLateSubmission: allowLateSubmission || false,
            teacherId: req.user.id,
            tenantId: req.user?.tenantId || null
        });

        // Notify batch students individually (per-user)
        if (batchId) {
            try {
                // Get all student IDs in this batch
                const batchStudents = await BatchStudent.findAll({ where: { batchId }, attributes: ['studentId'] });
                const directStudents = await User.findAll({ where: { batchId, role: 'Student' }, attributes: ['id'] });
                const studentIds = [...new Set([
                    ...batchStudents.map(r => r.studentId),
                    ...directStudents.map(u => u.id)
                ])].filter(id => id !== req.user.id);

                if (studentIds.length > 0) {
                    const records = studentIds.map(uid => ({
                        userId: uid,
                        title: `📝 New Assignment: ${title}`,
                        message: `A new assignment "${title}" has been posted. Deadline: ${new Date(deadline).toLocaleDateString()}`,
                        type: 'assignment',
                        role: 'Student',
                        batchId,
                        referenceId: assignment.id,
                        link: '/student/assignments',
                        read: false
                    }));
                    await Notification.bulkCreate(records, { ignoreDuplicates: true });
                }
            } catch (notifErr) {
                console.error('Assignment notification error:', notifErr.message);
            }
        }

        res.status(201).json(assignment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateAssignment = async (req, res, next) => {
    try {
        const where = { id: req.params.id };
        if (req.user?.role !== 'SuperAdmin' && req.user?.tenantId) where.tenantId = req.user.tenantId;
        const assignment = await Assignment.findOne({ where });
        if (!assignment) return res.status(404).json({ message: 'Not found' });
        delete req.body.tenantId; // strip tenantId from update payload
        await assignment.update(req.body);
        res.json(assignment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getSubmissions = async (req, res, next) => {
    try {
        // Verify assignment belongs to caller's tenant before returning submissions
        if (req.user?.role !== 'SuperAdmin' && req.user?.tenantId) {
            const assignment = await Assignment.findOne({ where: { id: req.params.id, tenantId: req.user.tenantId } });
            if (!assignment) return res.status(403).json({ message: 'Access denied' });
        }
        const submissions = await Submission.findAll({
            where: { assignmentId: req.params.id },
            include: [{ model: User, as: 'student', attributes: ['id', 'name', 'email'] }],
            order: [['submittedAt', 'DESC']]
        });
        res.json(submissions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteAssignment = async (req, res, next) => {
    try {
        const where = { id: req.params.id };
        if (req.user?.role !== 'SuperAdmin' && req.user?.tenantId) where.tenantId = req.user.tenantId;
        const assignment = await Assignment.findOne({ where });
        if (!assignment) return res.status(404).json({ message: 'Not found' });

        // Verify ownership: only the teacher who created it (or Admin) can delete
        if (req.user.role === 'Teacher' && assignment.teacherId && assignment.teacherId !== req.user.id) {
            return res.status(403).json({ message: 'You can only delete assignments you created' });
        }

        // Delete all submissions first (cascade)
        await Submission.destroy({ where: { assignmentId: req.params.id } });
        await assignment.destroy();

        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.gradeAssignment = async (req, res, next) => {
    try {
        const { studentId, grade, feedback } = req.body;
        const assignmentId = req.params.id;
        
        const submission = await Submission.findOne({ where: { assignmentId, studentId } });
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }
        
        await submission.update({ grade, feedback: feedback || null, status: 'Graded' });

        // Notify student their assignment was graded
        try {
            await Notification.create({
                userId: studentId,
                title: '✅ Assignment Graded',
                message: `Your assignment "${submission.assignmentId}" has been graded. Marks: ${grade}${feedback ? `. Feedback: ${feedback}` : ''}`,
                type: 'assignment',
                role: 'Student',
                referenceId: assignmentId,
                link: '/student/assignments',
                read: false
            });
        } catch (notifErr) {
            console.error('Grading notification error:', notifErr.message);
        }

        res.json(submission);
    } catch (err) {
        console.error("error in gradeAssignment:", err);
        res.status(500).json({ message: err.message });
    }
};
