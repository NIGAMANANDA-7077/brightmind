const { Op }     = require('sequelize');
const User        = require('../models/User');
const Course      = require('../models/Course');
const Batch       = require('../models/Batch');
const Assignment  = require('../models/Assignment');
const Exam        = require('../models/Exam');
const Enrollment  = require('../models/Enrollment');
const Submission  = require('../models/Submission');
const LiveClass   = require('../models/LiveClass');

// ─── GET /api/teacher/profile ────────────────────────────────────────────────
exports.getTeacherProfile = async (req, res) => {
    try {
        const teacher = await User.findByPk(req.user.id, {
            attributes: [
                'id', 'name', 'email', 'phone', 'subject', 'qualification',
                'experience', 'department', 'bio', 'avatar', 'status',
                'createdAt', 'updatedAt'
            ]
        });
        if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });
        return res.json({ success: true, user: teacher });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ─── PUT /api/teacher/profile ─────────────────────────────────────────────────
// Teacher can only update their own editable fields. email/role/status locked.
exports.updateTeacherProfile = async (req, res) => {
    try {
        const allowed = ['name', 'phone', 'subject', 'qualification', 'experience', 'bio', 'avatar'];
        const updateData = {};
        for (const field of allowed) {
            if (req.body[field] !== undefined) updateData[field] = req.body[field];
        }

        const teacher = await User.findByPk(req.user.id);
        if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });

        await teacher.update(updateData);

        // Return fresh user (excluding password)
        const updated = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });
        return res.json({ success: true, user: updated });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ─── GET /api/teacher/courses ────────────────────────────────────────────────
exports.getTeacherCourses = async (req, res) => {
    try {
        const where = { teacherId: req.user.id };
        if (req.user.tenantId) where.tenantId = req.user.tenantId;
        const courses = await Course.findAll({ where, attributes: ['id', 'title'] });
        return res.json({ success: true, data: courses });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ─── GET /api/teacher/batches ─────────────────────────────────────────────────
exports.getTeacherBatches = async (req, res) => {
    try {
        const where = { teacherId: req.user.id };
        if (req.user.tenantId) where.tenantId = req.user.tenantId;
        const batches = await Batch.findAll({ where, attributes: ['id', 'batchName', 'courseId'] });
        return res.json({ success: true, data: batches });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ─── GET /api/teacher/dashboard ──────────────────────────────────────────────
// Returns all data scoped to the logged-in teacher's courses/batches.
exports.getDashboard = async (req, res) => {
    try {
        const teacherUserId = req.user.id;

        // ── Teacher profile ───────────────────────────────────────────────
        const teacher = await User.findByPk(teacherUserId, {
            attributes: { exclude: ['password'] },
        });
        if (!teacher)
            return res.status(404).json({ success: false, message: 'Teacher not found' });

        // ── Assigned courses ──────────────────────────────────────────────
        const courseWhere = { teacherId: teacherUserId };
        if (req.user.tenantId) courseWhere.tenantId = req.user.tenantId;
        const courses = await Course.findAll({
            where:      courseWhere,
            attributes: ['id', 'title', 'subject', 'description',
                         'thumbnail', 'status', 'teacherId'],
        });

        // ── Assigned batches (with students) ─────────────────────────────
        const batchWhere = { teacherId: teacherUserId };
        if (req.user.tenantId) batchWhere.tenantId = req.user.tenantId;
        const batches = await Batch.findAll({
            where:   batchWhere,
            include: [{
                model:   User,
                as:      'students',
                attributes: ['id', 'name', 'email', 'phone', 'studentId',
                             'batchId', 'status', 'avatar'],
                through: { attributes: [] },
            }],
        });

        // ── All students across teacher's batches (de-duplicated) ─────────
        const studentMap = new Map();
        for (const batch of batches) {
            for (const s of (batch.students || [])) {
                studentMap.set(s.id, s);
            }
        }
        const students = Array.from(studentMap.values());

        // ── Assignments for teacher's batches ─────────────────────────────
        const batchIds = batches.map(b => b.id);
        let assignments = [];
        if (batchIds.length > 0) {
            assignments = await Assignment.findAll({
                where: { batchId: { [Op.in]: batchIds } },
                order: [['createdAt', 'DESC']],
                limit: 30,
            });
        }

        // ── Exams created by this teacher ─────────────────────────────────
        const examWhere = { teacherId: teacherUserId };
        if (req.user.tenantId) examWhere.tenantId = req.user.tenantId;
        const exams = await Exam.findAll({
            where: examWhere,
            order: [['createdAt', 'DESC']],
            limit: 30,
        });

        // ── Pending submissions (to grade) ────────────────────────────────
        const assignmentIds = assignments.map(a => a.id);
        let pendingSubmissions = [];
        if (assignmentIds.length > 0) {
            pendingSubmissions = await Submission.findAll({
                where: { assignmentId: { [Op.in]: assignmentIds }, status: 'Submitted' },
                include: [{ model: User, as: 'student', attributes: ['name', 'avatar'] }],
                order: [['createdAt', 'DESC']],
                limit: 10,
            });
        }

        // ── Upcoming Live Classes for teacher ─────────────────────────────
        const today = new Date().toISOString().split('T')[0];
        const upcomingLiveClasses = await LiveClass.findAll({
            where: {
                teacherId: teacherUserId,
                classDate: { [Op.gte]: today },
                status: { [Op.ne]: 'Completed' }
            },
            order: [['classDate', 'ASC'], ['startTime', 'ASC']],
            limit: 5,
        });

        // ── Enrollment stats per course ────────────────────────────────────
        const courseIds = courses.map(c => c.id);
        const enrollmentCounts = courseIds.length > 0
            ? await Enrollment.findAll({
                where:      { courseId: { [Op.in]: courseIds } },
                attributes: ['courseId'],
            })
            : [];

        const enrollmentByCourse = {};
        for (const e of enrollmentCounts) {
            enrollmentByCourse[e.courseId] = (enrollmentByCourse[e.courseId] || 0) + 1;
        }

        return res.json({
            success: true,
            data: {
                teacher_info:    teacher,
                course_details:  courses.map(c => ({
                    ...c.toJSON(),
                    enrolledStudents: enrollmentByCourse[c.id] || 0,
                })),
                batches,
                students,
                assignments,
                exams,
                stats: {
                    totalCourses:      courses.length,
                    totalBatches:      batches.length,
                    totalStudents:     students.length,
                    totalAssignments:  assignments.length,
                    totalExams:        exams.length,
                    pendingGrading:    pendingSubmissions.length,
                },
                pending_submissions: pendingSubmissions,
                upcoming_live_classes: upcomingLiveClasses,
            },
        });
    } catch (err) {
        console.error('[TeacherController] getDashboard error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};
