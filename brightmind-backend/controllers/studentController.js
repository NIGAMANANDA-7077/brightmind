const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const User        = require('../models/User');
const Batch       = require('../models/Batch');
const Course      = require('../models/Course');
const Enrollment  = require('../models/Enrollment');
const Announcement = require('../models/Announcement');
const Assignment  = require('../models/Assignment');
const Exam        = require('../models/Exam');
const LiveClass   = require('../models/LiveClass');
const Notification = require('../models/Notification');
const SupportMessage = require('../models/SupportMessage');

// ─── PUT /api/student/profile ─────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
    try {
        const allowed = ['name', 'bio', 'avatar'];
        const updateData = {};
        for (const field of allowed) {
            if (req.body[field] !== undefined) updateData[field] = req.body[field];
        }
        const student = await User.findByPk(req.user.id);
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
        await student.update(updateData);
        const updated = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
        return res.json({ success: true, user: updated });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ─── PUT /api/student/change-password ─────────────────────────────────────────
exports.changePassword = async (req, res) => {
    try {
        const { current_password, new_password } = req.body;
        if (!current_password || !new_password)
            return res.status(400).json({ success: false, message: 'Both passwords are required' });
        if (new_password.length < 6)
            return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });

        const student = await User.findByPk(req.user.id);
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

        const isMatch = await bcrypt.compare(current_password, student.password);
        if (!isMatch)
            return res.status(400).json({ success: false, message: 'Current password is incorrect' });

        const hashed = await bcrypt.hash(new_password, 10);
        await student.update({ password: hashed });
        return res.json({ success: true, message: 'Password updated successfully' });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ─── PUT /api/student/preferences ─────────────────────────────────────────────
exports.updatePreferences = async (req, res) => {
    try {
        const { dark_mode } = req.body;
        if (typeof dark_mode !== 'boolean')
            return res.status(400).json({ success: false, message: 'dark_mode must be a boolean' });

        // Store preference in the Settings key-value table, keyed per student
        const Setting = require('../models/Setting');
        const key = `dark_mode_${req.user.id}`;
        const [setting] = await Setting.findOrCreate({ where: { key }, defaults: { value: String(dark_mode) } });
        if (setting.value !== String(dark_mode)) {
            setting.value = String(dark_mode);
            await setting.save();
        }
        return res.json({ success: true, dark_mode });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ─── POST /api/student/support ────────────────────────────────────────────────
exports.submitSupport = async (req, res) => {
    try {
        const { subject, message } = req.body;
        if (!subject || !message)
            return res.status(400).json({ success: false, message: 'Subject and message are required' });

        const msg = await SupportMessage.create({
            studentId: req.user.id,
            studentName: req.user.name,
            studentEmail: req.user.email,
            subject,
            message,
            status: 'unread'
        });

        // Notify all admins — include full message body so admin can read it in the detail modal
        await Notification.create({
            userId: null,
            title: `Support: ${subject}`,
            message: `From: ${req.user.name} (${req.user.email})\n\n${message}`,
            type: 'info',
            role: 'Admin',
            referenceId: msg.id,
            link: '/admin/notifications'
        });

        return res.status(201).json({ success: true, message: 'Support message sent successfully' });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};


exports.getDashboard = async (req, res) => {
    try {
        const studentUserId = req.user.id;
        const BatchStudent = require('../models/BatchStudent');

        // ── Student profile ───────────────────────────────────────────────
        const student = await User.findByPk(studentUserId, {
            attributes: { exclude: ['password'] },
        });
        if (!student)
            return res.status(404).json({ success: false, message: 'Student not found' });

        // ── All batches via join table (supports multiple batches) ─────────
        const batchStudentRows = await BatchStudent.findAll({ where: { studentId: studentUserId } });
        const allBatchIds = batchStudentRows.map(b => b.batchId);

        // Also include legacy direct batchId if set and not already in list
        if (student.batchId && !allBatchIds.includes(student.batchId)) {
            allBatchIds.push(student.batchId);
        }

        // Use first batchId as primary for backward compat
        const batchId = allBatchIds[0] || null;

        // ── All batch details + teacher info ──────────────────────────────
        let allBatchDetails = [];
        let batchDetails = null;
        let teacherDetails = null;

        if (allBatchIds.length > 0) {
            allBatchDetails = await Batch.findAll({
                where: { id: allBatchIds },
                include: [{
                    model: User,
                    as: 'teacher',
                    attributes: ['id', 'name', 'email', 'avatar', 'subject',
                                 'bio', 'qualification', 'experience', 'department'],
                }],
            });
            // Primary batch (first one)
            batchDetails = allBatchDetails[0] || null;
            if (batchDetails?.teacher) teacherDetails = batchDetails.teacher;
        }

        // ── Enrolled courses ──────────────────────────────────────────────
        const enrollments = await Enrollment.findAll({
            where:   { studentId: studentUserId },
            include: [{
                model: Course,
                as:    'course',
                attributes: ['id', 'title', 'subject', 'description',
                             'thumbnail', 'teacherId', 'status'],
            }],
        });
        const courseDetails = enrollments.map(e => e.course).filter(Boolean);
        const courseIds     = enrollments.map(e => e.courseId);

        // ── Announcements for ALL batches ─────────────────────────────────
        let announcements = [];
        if (allBatchIds.length > 0) {
            announcements = await Announcement.findAll({
                where: { batchId: allBatchIds },
                order: [['createdAt', 'DESC']],
                limit: 20,
            });
        }

        // ── Assignments for ALL batches ───────────────────────────────────
        let assignments = [];
        if (allBatchIds.length > 0) {
            assignments = await Assignment.findAll({
                where: { batchId: allBatchIds },
                order: [['createdAt', 'DESC']],
                limit: 20,
            });
        }

        // ── Exams: by ALL batches OR by enrolled course ───────────────────
        let exams = [];
        const examConditions = [];
        if (allBatchIds.length > 0)   examConditions.push({ batchId: allBatchIds });
        if (courseIds.length > 0) examConditions.push({ courseId: courseIds });

        if (examConditions.length > 0) {
            exams = await Exam.findAll({
                where: { [Op.or]: examConditions },
                order: [['createdAt', 'DESC']],
                limit: 20,
            });
        }

        // ── Live classes for ALL batches ──────────────────────────────────
        let liveClasses = [];
        if (allBatchIds.length > 0) {
            liveClasses = await LiveClass.findAll({
                where: { batchId: allBatchIds },
                order: [['scheduledAt', 'ASC']],
                limit: 10,
            });
        }

        return res.json({
            success: true,
            data: {
                student_info:    student,
                batch_details:   batchDetails,       // primary batch (backward compat)
                all_batches:     allBatchDetails,    // ALL batches
                teacher_details: teacherDetails,
                course_details:  courseDetails,
                enrollments:     enrollments.map(e => ({
                    id:                 e.id,
                    courseId:           e.courseId,
                    status:             e.status,
                    progressPercentage: e.progressPercentage,
                    enrolledAt:         e.enrolledAt,
                })),
                announcements,
                assignments,
                exams,
                live_classes:    liveClasses,
            },
        });
    } catch (err) {
        console.error('[StudentController] getDashboard error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ─── GET /api/student/activity ─────────────────────────────────────────────────
exports.getActivity = async (req, res) => {
    try {
        const LessonProgress = require('../models/LessonProgress');
        const { fn, col } = require('sequelize');

        const studentId = req.user.id;

        // ── Weekly: last 7 days per day ───────────────────────────────────────
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 6);
        weekStart.setHours(0, 0, 0, 0);

        const weeklyRaw = await LessonProgress.findAll({
            where: { studentId, isCompleted: true, completedAt: { [Op.gte]: weekStart } },
            attributes: [
                [fn('DATE', col('completedAt')), 'day'],
                [fn('COUNT', col('id')), 'count']
            ],
            group: [fn('DATE', col('completedAt'))],
            raw: true
        });

        const dayMap = {};
        weeklyRaw.forEach(r => { dayMap[r.day] = parseInt(r.count); });

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weeklyData = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            weeklyData.push({ name: dayNames[d.getDay()], lessons: dayMap[key] || 0 });
        }

        // ── Monthly: last 12 months ───────────────────────────────────────────
        const monthStart = new Date();
        monthStart.setMonth(monthStart.getMonth() - 11);
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const monthlyRaw = await LessonProgress.findAll({
            where: { studentId, isCompleted: true, completedAt: { [Op.gte]: monthStart } },
            attributes: [
                [fn('YEAR', col('completedAt')), 'yr'],
                [fn('MONTH', col('completedAt')), 'mo'],
                [fn('COUNT', col('id')), 'count']
            ],
            group: [fn('YEAR', col('completedAt')), fn('MONTH', col('completedAt'))],
            raw: true
        });

        const monthMap = {};
        monthlyRaw.forEach(r => { monthMap[`${r.yr}-${r.mo}`] = parseInt(r.count); });

        const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const monthlyData = [];
        for (let i = 11; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
            monthlyData.push({ name: monthNames[d.getMonth()], lessons: monthMap[key] || 0 });
        }

        return res.json({ success: true, weekly: weeklyData, monthly: monthlyData });
    } catch (err) {
        console.error('[getActivity] error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};
