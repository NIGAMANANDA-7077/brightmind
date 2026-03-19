const { Op } = require('sequelize');
const User = require('../models/User');
const Course = require('../models/Course');
const Exam = require('../models/Exam');
const Enrollment = require('../models/Enrollment');
const EnrollmentRequest = require('../models/EnrollmentRequest');
const Setting = require('../models/Setting');

// ─── GET /api/admin/dashboard ──────────────────────────────────────────────────
exports.getDashboard = async (req, res) => {
    try {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const today = new Date();

        // Scope stats to admin's tenant; SuperAdmin sees all
        const tenantFilter = req.user?.role === 'SuperAdmin' ? {} : { tenantId: req.user?.tenantId || null };

        const [studentCount, teacherCount, activeCourseCount, examCount, pendingRequestCount] = await Promise.all([
            User.count({ where: { ...tenantFilter, role: 'Student' } }),
            User.count({ where: { ...tenantFilter, role: 'Teacher' } }),
            Course.count({ where: { ...tenantFilter, status: 'Active' } }),
            Exam.count({ where: tenantFilter }),
            EnrollmentRequest.count({ where: { status: 'pending' } }),
        ]);

        const last12Months = [];
        for (let i = 11; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            last12Months.push({ name: months[d.getMonth()], year: d.getFullYear(), month: d.getMonth(), value: 0 });
        }
        const startDate = new Date(today.getFullYear(), today.getMonth() - 11, 1);

        // Scope enrollment chart to tenant's courses
        let enrollmentWhere = { createdAt: { [Op.gte]: startDate } };
        if (req.user?.role !== 'SuperAdmin' && req.user?.tenantId) {
            const tenantCourses = await Course.findAll({ where: { tenantId: req.user.tenantId }, attributes: ['id'] });
            const courseIds = tenantCourses.map(c => c.id);
            if (courseIds.length > 0) enrollmentWhere.courseId = { [Op.in]: courseIds };
            else enrollmentWhere.courseId = null; // no courses → no enrollments
        }
        const enrollments = await Enrollment.findAll({ where: enrollmentWhere, attributes: ['createdAt'] });
        enrollments.forEach(e => {
            const d = new Date(e.createdAt);
            const m = last12Months.find(x => x.month === d.getMonth() && x.year === d.getFullYear());
            if (m) m.value++;
        });
        const enrollmentChart = last12Months.map(m => ({ name: m.name, value: m.value }));

        // Scope recent activity to tenant's courses
        let recentEnrollmentWhere = {};
        if (req.user?.role !== 'SuperAdmin' && req.user?.tenantId) {
            const tenantCourses = await Course.findAll({ where: { tenantId: req.user.tenantId }, attributes: ['id'] });
            const courseIds = tenantCourses.map(c => c.id);
            if (courseIds.length > 0) recentEnrollmentWhere.courseId = { [Op.in]: courseIds };
            else recentEnrollmentWhere.courseId = null;
        }
        const recentEnrollments = await Enrollment.findAll({
            where: recentEnrollmentWhere,
            order: [['createdAt', 'DESC']], limit: 8,
            include: [
                { model: User, as: 'student', attributes: ['name', 'avatar'] },
                { model: Course, as: 'course', attributes: ['title'] }
            ]
        });
        const recentActivity = recentEnrollments.map(e => ({
            id: e.id,
            user: e.student?.name || 'A student',
            avatar: e.student?.avatar || null,
            action: 'enrolled in',
            target: e.course?.title || 'a course',
            createdAt: e.createdAt
        }));

        return res.json({
            success: true,
            data: {
                stats: { totalStudents: studentCount, totalTeachers: teacherCount, activeCourses: activeCourseCount, totalExams: examCount, pendingRequests: pendingRequestCount },
                enrollmentChart,
                recentActivity
            }
        });
    } catch (err) {
        console.error('[AdminController] getDashboard error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ─── Helper: get or create a Setting by key ────────────────────────────────────
const getSettingValue = async (key, defaultValue) => {
    const row = await Setting.findOne({ where: { key } });
    return row ? row.value : defaultValue;
};

const saveSettingValue = async (key, value) => {
    const [row] = await Setting.findOrCreate({ where: { key }, defaults: { value } });
    if (JSON.stringify(row.value) !== JSON.stringify(value)) {
        row.value = value;
        await row.save();
    }
};

// ─── GET /api/admin/profile ────────────────────────────────────────────────────
exports.getProfile = async (req, res) => {
    try {
        const admin = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
        if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });
        return res.json({ success: true, user: admin });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ─── PATCH /api/admin/profile ──────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
    try {
        const allowed = ['name', 'avatar'];
        const updateData = {};
        for (const field of allowed) {
            if (req.body[field] !== undefined) updateData[field] = req.body[field];
        }
        const admin = await User.findByPk(req.user.id);
        if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });
        await admin.update(updateData);
        const updated = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
        return res.json({ success: true, user: updated });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ─── GET /api/admin/settings/system ───────────────────────────────────────────
exports.getSystemSettings = async (req, res) => {
    try {
        const value = await getSettingValue('admin_system', {
            lmsName: 'BrightMIND Academy',
            timezone: 'IST',
            supportEmail: 'support@brightmind.com'
        });
        return res.json({ success: true, data: value });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ─── PATCH /api/admin/settings/system ─────────────────────────────────────────
exports.updateSystemSettings = async (req, res) => {
    try {
        const { lmsName, timezone, supportEmail } = req.body;
        const current = await getSettingValue('admin_system', {
            lmsName: 'BrightMIND Academy', timezone: 'IST', supportEmail: 'support@brightmind.com'
        });
        const updated = {
            ...current,
            ...(lmsName     !== undefined && { lmsName }),
            ...(timezone    !== undefined && { timezone }),
            ...(supportEmail !== undefined && { supportEmail }),
        };
        await saveSettingValue('admin_system', updated);
        return res.json({ success: true, data: updated });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ─── GET /api/admin/settings/security ─────────────────────────────────────────
exports.getSecuritySettings = async (req, res) => {
    try {
        const value = await getSettingValue('admin_security', {
            twoFactorEnabled: false,
            passwordPolicy: 'Basic'
        });
        return res.json({ success: true, data: value });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ─── PATCH /api/admin/settings/security ───────────────────────────────────────
exports.updateSecuritySettings = async (req, res) => {
    try {
        const { twoFactorEnabled, passwordPolicy } = req.body;
        const current = await getSettingValue('admin_security', { twoFactorEnabled: false, passwordPolicy: 'Basic' });
        const updated = {
            ...current,
            ...(twoFactorEnabled !== undefined && { twoFactorEnabled }),
            ...(passwordPolicy   !== undefined && { passwordPolicy }),
        };
        await saveSettingValue('admin_security', updated);
        return res.json({ success: true, data: updated });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
