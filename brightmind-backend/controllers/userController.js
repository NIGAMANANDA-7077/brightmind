const User = require('../models/User');
const Setting = require('../models/Setting');
const logAdminActivity = require('../utils/logAdminActivity');

const userController = {
    // Public endpoint for fetching teachers
    getPublicTeachers: async (req, res) => {
        try {
            const teachers = await User.findAll({
                where: { role: 'Teacher', status: 'Active' },
                attributes: ['id', 'name', 'avatar', 'subject', 'bio', 'qualification', 'experience', 'department', 'linkedinUrl', 'twitterUrl', 'facebookUrl'],
            });
            return res.json({ success: true, count: teachers.length, data: teachers });
        } catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    },

    // Persisted theme preference for any authenticated user
    getThemePreference: async (req, res) => {
        try {
            const key = `theme_${req.user.id}`;
            const row = await Setting.findOne({ where: { key } });
            let theme = row?.value === 'dark' ? 'dark' : (row?.value === 'light' ? 'light' : null);
            if (!theme) {
                const legacy = await Setting.findOne({ where: { key: `dark_mode_${req.user.id}` } });
                if (legacy) {
                    theme = legacy.value === 'true' ? 'dark' : 'light';
                }
            }
            return res.json({ success: true, theme });
        } catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    },

    updateThemePreference: async (req, res) => {
        try {
            const { theme } = req.body;
            if (!['light', 'dark'].includes(theme)) {
                return res.status(400).json({ success: false, message: 'theme must be "light" or "dark"' });
            }
            const key = `theme_${req.user.id}`;
            const legacyKey = `dark_mode_${req.user.id}`;
            const [row, created] = await Setting.findOrCreate({ where: { key }, defaults: { value: theme } });
            if (!created && row.value !== theme) {
                row.value = theme;
                await row.save();
            }
            const [legacyRow, legacyCreated] = await Setting.findOrCreate({ where: { key: legacyKey }, defaults: { value: theme === 'dark' ? 'true' : 'false' } });
            if (!legacyCreated && legacyRow.value !== (theme === 'dark' ? 'true' : 'false')) {
                legacyRow.value = theme === 'dark' ? 'true' : 'false';
                await legacyRow.save();
            }
            return res.json({ success: true, theme });
        } catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    },

    // Get all users
    getAllUsers: async (req, res) => {
        try {
            const Batch   = require('../models/Batch');
            const Course  = require('../models/Course');
            const Enrollment = require('../models/Enrollment');

            // Always filter by tenantId for non-SuperAdmin — even if tenantId is null
            // (null-tenantId admin sees only null-tenantId users, NOT all users)
            const where = {};
            if (req.user?.role !== 'SuperAdmin') {
                where.tenantId = req.user?.tenantId ?? null;
            }
            console.log(`[UserController] getAllUsers → user: ${req.user?.id}, role: ${req.user?.role}, tenantId: ${where.tenantId}`);

            const users = await User.findAll({
                where,
                attributes: { exclude: ['password'] },
                include: [
                    // Student batches (via BatchStudent join table)
                    {
                        model: Batch,
                        as: 'enrolledBatches',
                        attributes: ['id', 'batchName'],
                        through: { attributes: [] }
                    },
                    // Teacher batches (via Batch.teacherId direct FK)
                    {
                        model: Batch,
                        as: 'teachingBatches',
                        attributes: ['id', 'batchName'],
                        required: false
                    },
                    // Courses taught (for Teacher column)
                    {
                        model: Course,
                        as: 'taughtCourses',
                        attributes: ['id', 'title'],
                        required: false
                    },
                    // Courses enrolled (for Student column)
                    {
                        model: Enrollment,
                        as: 'enrollments',
                        attributes: ['id'],
                        include: [
                            { model: Course, as: 'course', attributes: ['title'] }
                        ],
                        required: false
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            // Normalise into a clean shape for the frontend
            const result = users.map(u => {
                const json = u.toJSON();
                // Unify batch display: students use enrolledBatches, teachers use teachingBatches
                const allBatches = json.role === 'Teacher'
                    ? (json.teachingBatches || [])
                    : (json.enrolledBatches || []);

                return {
                    ...json,
                    // Combined "batches" field — both kept for backward compat
                    enrolledBatches: allBatches,
                    // courses shown in Enrolled Courses column
                    courses: json.role === 'Teacher'
                        ? (json.taughtCourses || []).map(c => c.title)
                        : (json.enrollments || []).map(e => e.course?.title).filter(Boolean)
                };
            });

            res.json(result);
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },


    // Get user stats
    getUserStats: async (req, res) => {
        try {
            // Always filter by tenantId for non-SuperAdmin — even if tenantId is null
            const where = {};
            if (req.user?.role !== 'SuperAdmin') {
                where.tenantId = req.user?.tenantId ?? null;
            }
            console.log(`[UserController] getUserStats → tenantId: ${where.tenantId}`);
            const studentCount = await User.count({ where: { ...where, role: 'Student' } });
            const teacherCount = await User.count({ where: { ...where, role: 'Teacher' } });
            const activeCount  = await User.count({ where: { ...where, status: 'Active' } });

            res.json({
                students: studentCount,
                teachers: teacherCount,
                active: activeCount
            });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    // Get Monthly Analytics
    getMonthlyAnalytics: async (req, res) => {
        try {
            const Course = require('../models/Course');
            const Enrollment = require('../models/Enrollment');
            const Submission = require('../models/Submission');
            const { Op } = require('sequelize');

            const tenantId = req.user?.role === 'SuperAdmin' ? null : req.user?.tenantId;
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const today = new Date();

            // Generate array of last 12 months starting from current month
            const last12Months = [];
            for (let i = 11; i >= 0; i--) {
                const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
                last12Months.push({
                    name: months[d.getMonth()],
                    year: d.getFullYear(),
                    month: d.getMonth(),
                    enrollments: 0,
                    attempts: 0,
                    creations: 0
                });
            }

            const startDate = new Date(today.getFullYear(), today.getMonth() - 11, 1);

            // Tenant-scoped course IDs for filtering enrollments
            const courseWhere = { createdAt: { [Op.gte]: startDate } };
            if (tenantId) courseWhere.tenantId = tenantId;

            const creations = await Course.findAll({ where: courseWhere });
            const courseIds = creations.map(c => c.id);

            const enrollmentWhere = { createdAt: { [Op.gte]: startDate } };
            if (tenantId && courseIds.length > 0) enrollmentWhere.courseId = { [Op.in]: courseIds };
            else if (tenantId && courseIds.length === 0) {
                // No courses in this tenant → no enrollments
                return res.json({ success: true, data: { enrollments: last12Months.map(m => ({ name: m.name, value: 0 })), attempts: last12Months.map(m => ({ name: m.name, value: 0 })), creations: last12Months.map(m => ({ name: m.name, value: 0 })) } });
            }

            const enrollments = await Enrollment.findAll({ where: enrollmentWhere });
            const attempts = await Submission.findAll({ where: { createdAt: { [Op.gte]: startDate } } });

            // Helper to aggregate
            const aggregateToMonths = (dataList, key) => {
                dataList.forEach(item => {
                    const date = new Date(item.createdAt);
                    const matchingMonth = last12Months.find(m => m.month === date.getMonth() && m.year === date.getFullYear());
                    if (matchingMonth) matchingMonth[key]++;
                });
            };

            aggregateToMonths(enrollments, 'enrollments');
            aggregateToMonths(attempts, 'attempts');
            aggregateToMonths(creations, 'creations');

            const formatData = (key) => last12Months.map(m => ({ name: m.name, value: m[key] }));

            res.json({
                success: true,
                data: {
                    enrollments: formatData('enrollments'),
                    attempts: formatData('attempts'),
                    creations: formatData('creations')
                }
            });
        } catch (err) {
            console.error("Error in getMonthlyAnalytics:", err);
            res.status(500).json({ success: false, message: err.message });
        }
    },

    // Create user
    createUser: async (req, res) => {
        try {
            // Inject tenantId from authenticated admin (never trust frontend)
            const tenantId = req.user?.tenantId || null;
            const user = await User.create({ ...req.body, tenantId });
            const { password, ...userWithoutPassword } = user.toJSON();
            if (req.user?.id && ['Admin', 'SuperAdmin'].includes(req.user?.role)) {
                logAdminActivity(req.user.id, 'user', 'CREATE', `Admin created ${req.body.role || 'user'} "${req.body.name}"`, req.ip);
            }
            res.status(201).json(userWithoutPassword);
        } catch (err) {
            res.status(400).json({ success: false, message: err.message });
        }
    },

    // Update full user details
    updateUser: async (req, res) => {
        try {
            const where = { id: req.params.id };
            // Tenant ownership: Admin can only update users in their own tenant (even if tenantId is null)
            if (req.user?.role !== 'SuperAdmin') {
                where.tenantId = req.user?.tenantId ?? null;
            }
            const user = await User.findOne({ where });
            if (!user) return res.status(404).json({ success: false, message: 'User not found' });

            const { password, tenantId: _t, ...updateData } = req.body; // strip tenantId from update
            
            if (updateData.name && updateData.name.trim().length > 50) {
                return res.status(400).json({ success: false, message: 'Name cannot exceed 50 characters' });
            }

            if (updateData.email) {
                if (updateData.email.trim().length > 100) {
                    return res.status(400).json({ success: false, message: 'Email cannot exceed 100 characters' });
                }
                if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(updateData.email.trim())) {
                    return res.status(400).json({ success: false, message: 'Please provide a valid email format (e.g., example@gmail.com)' });
                }
                updateData.email = updateData.email.trim().toLowerCase();
            }

            const userName = user.name;
            await user.update(updateData);

            if (req.user?.id && ['Admin', 'SuperAdmin'].includes(req.user?.role)) {
                logAdminActivity(req.user.id, 'user', 'UPDATE', `Admin updated user profile: "${userName}"`, req.ip);
            }

            res.json({ success: true, user });
        } catch (err) {
            res.status(400).json({ success: false, message: err.message });
        }
    },

    updateUserStatus: async (req, res) => {
        try {
            const { status } = req.body;
            const where = { id: req.params.id };
            // Tenant ownership check (always apply for non-SuperAdmin)
            if (req.user?.role !== 'SuperAdmin') {
                where.tenantId = req.user?.tenantId ?? null;
            }
            const targetUser = await User.findOne({ where, attributes: ['name', 'role', 'tenantId'] });
            if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });
            await targetUser.update({ status });
            if (req.user?.id && ['Admin', 'SuperAdmin'].includes(req.user?.role)) {
                logAdminActivity(req.user.id, 'user', 'UPDATE', `Admin ${status === 'Suspended' ? 'suspended' : 'activated'} ${targetUser?.role || 'user'} "${targetUser?.name || req.params.id}"`, req.ip);
            }
            res.json({ success: true, message: 'Status updated' });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    // Delete user and all related data
    deleteUser: async (req, res) => {
        const userId = req.params.id;
        const sequelize = require('../config/db');

        try {
            const user = await User.findByPk(userId);
            if (!user) return res.status(404).json({ success: false, message: 'User not found' });

            // Tenant isolation: Admin can only delete users in their own tenant
            if (req.user.role !== 'SuperAdmin') {
                if (user.tenantId !== (req.user.tenantId ?? null)) {
                    return res.status(403).json({ success: false, message: 'Access denied: user belongs to a different tenant' });
                }
            }

            const deletedUserName = user.name;
            const deletedUserRole = user.role;

            // Use transaction + disable FK checks so deletion order doesn't matter
            await sequelize.transaction(async (t) => {
                const opts = { replacements: [userId], transaction: t };
                const raw  = (sql) => sequelize.query(sql, { transaction: t });

                // Disable FK constraint enforcement for this transaction session
                await raw('SET FOREIGN_KEY_CHECKS = 0');

                // ── Exam data ─────────────────────────────────────────────
                await sequelize.query(
                    `DELETE sa FROM StudentAnswers sa
                     INNER JOIN ExamAttempts ea ON sa.attemptId = ea.id
                     WHERE ea.studentId = ?`, opts);
                await sequelize.query(`DELETE FROM ExamAttempts WHERE studentId = ?`, opts);
                await sequelize.query(`DELETE FROM ExamResults  WHERE studentId = ?`, opts);

                // ── Learning / progress data ───────────────────────────────
                await sequelize.query(`DELETE FROM LessonProgresses WHERE studentId = ?`, opts);
                await sequelize.query(`DELETE FROM Submissions     WHERE studentId = ?`, opts);
                await sequelize.query(`DELETE FROM Certificates    WHERE studentId = ?`, opts);
                await sequelize.query(`DELETE FROM notes           WHERE studentId = ?`, opts);

                // ── Enrollments & batch membership ────────────────────────
                await sequelize.query(`DELETE FROM Enrollments    WHERE studentId = ?`, opts);
                await sequelize.query(`DELETE FROM batch_students WHERE studentId = ?`, opts);

                // ── Attendance, payments, reviews ─────────────────────────
                await sequelize.query(`DELETE FROM Attendances WHERE studentId = ?`, opts);
                await sequelize.query(`DELETE FROM Payments    WHERE studentId = ?`, opts);
                await sequelize.query(`DELETE FROM Reviews     WHERE studentId = ?`, opts);

                // ── Forum data ────────────────────────────────────────────
                await sequelize.query(`DELETE FROM ThreadUpvotes WHERE userId = ?`, opts);
                await sequelize.query(`DELETE FROM ThreadViews   WHERE userId = ?`, opts);
                await sequelize.query(`DELETE FROM Comments      WHERE authorId = ?`, opts);
                // Remove child records of threads owned by this user, then the threads
                await sequelize.query(
                    `DELETE c FROM Comments c
                     INNER JOIN Threads t ON c.threadId = t.id
                     WHERE t.authorId = ?`, opts);
                await sequelize.query(
                    `DELETE tu FROM ThreadUpvotes tu
                     INNER JOIN Threads t ON tu.threadId = t.id
                     WHERE t.authorId = ?`, opts);
                await sequelize.query(
                    `DELETE tv FROM ThreadViews tv
                     INNER JOIN Threads t ON tv.threadId = t.id
                     WHERE t.authorId = ?`, opts);
                await sequelize.query(`DELETE FROM Threads WHERE authorId = ?`, opts);

                // ── Activity log ──────────────────────────────────────────
                await sequelize.query(`DELETE FROM Activities WHERE userId = ?`, opts);

                // ── Teacher: null out FK references (preserve the content) ─
                await sequelize.query(`UPDATE Courses     SET teacherId = NULL WHERE teacherId = ?`, opts);
                await sequelize.query(`UPDATE batches     SET teacherId = NULL WHERE teacherId = ?`, opts);
                await sequelize.query(`UPDATE live_classes SET teacherId = NULL WHERE teacherId = ?`, opts);

                // ── Delete the user ────────────────────────────────────────
                await sequelize.query(`DELETE FROM Users WHERE id = ?`, opts);

                // Re-enable FK checks
                await raw('SET FOREIGN_KEY_CHECKS = 1');
            });

            res.json({ success: true, message: 'User and all related data deleted successfully' });
            if (req.user?.id && ['Admin', 'SuperAdmin'].includes(req.user?.role)) {
                logAdminActivity(req.user.id, 'user', 'DELETE', `Admin deleted ${deletedUserRole} "${deletedUserName}"`, req.ip);
            }
        } catch (err) {
            console.error('[deleteUser] Error:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    },

    // Teacher Dashboard Stats
    getTeacherDashboardStats: async (req, res) => {
        try {
            const teacherId = req.params.teacherId;
            const Course = require('../models/Course');
            const Enrollment = require('../models/Enrollment');
            const Assignment = require('../models/Assignment');
            const Submission = require('../models/Submission');

            // Scope to tenant
            const tenantId = req.user?.role === 'SuperAdmin' ? null : req.user?.tenantId;
            const courseWhere = { teacherId };
            if (tenantId) courseWhere.tenantId = tenantId;

            const courses = await Course.findAll({ where: courseWhere });
            const courseIds = courses.map(c => c.id);

            const studentCount = courseIds.length > 0 ? await Enrollment.count({ where: { courseId: courseIds } }) : 0;
            const assignmentCount = courseIds.length > 0 ? await Assignment.count({ where: { courseId: courseIds } }) : 0;
            const pendingGrading = courseIds.length > 0 ? await Submission.count({
                where: {
                    assignmentId: (await Assignment.findAll({ where: { courseId: courseIds } })).map(a => a.id),
                    status: 'Submitted'
                }
            }) : 0;

            res.json({
                success: true,
                stats: [
                    { title: 'Total Courses', value: courses.length, change: '+1 this month', trend: 'up', icon: 'BookOpen', color: 'bg-blue-50 text-blue-600', link: '/teacher/courses' },
                    { title: 'Total Students', value: studentCount, change: '+2 new', trend: 'up', icon: 'Users', color: 'bg-purple-50 text-purple-600', link: '/teacher/students' },
                    { title: 'Assignments', value: assignmentCount, change: '0 pending', trend: 'neutral', icon: 'ClipboardList', color: 'bg-orange-50 text-orange-600', link: '/teacher/assignments' },
                    { title: 'Pending Grading', value: pendingGrading, change: 'Requires action', trend: 'down', icon: 'CheckCircle', color: 'bg-green-50 text-green-600', link: '/teacher/assignments' }
                ]
            });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    // GET /teacher/:teacherId/students
    getTeacherStudents: async (req, res) => {
        try {
            const teacherId = req.params.teacherId;
            const Course = require('../models/Course');
            const Enrollment = require('../models/Enrollment');
            const Batch = require('../models/Batch');

            // Scope to tenant
            const tenantId = req.user?.role === 'SuperAdmin' ? null : req.user?.tenantId;
            const courseWhere = { teacherId };
            if (tenantId) courseWhere.tenantId = tenantId;

            // 1. Find all courses taught by this teacher (tenant-scoped)
            const courses = await Course.findAll({ where: courseWhere, attributes: ['id', 'title'] });
            const courseIds = courses.map(c => c.id);
            const courseMap = {};
            courses.forEach(c => { courseMap[c.id] = c.title; });

            if (courseIds.length === 0) return res.json({ success: true, students: [] });

            // 2. Find all enrollments for those courses
            const enrollments = await Enrollment.findAll({
                where: { courseId: courseIds },
                attributes: ['studentId', 'courseId', 'progressPercentage', 'enrolledAt']
            });

            // 3. Unique student IDs
            const studentIds = [...new Set(enrollments.map(e => e.studentId))];
            if (studentIds.length === 0) return res.json({ success: true, students: [] });

            // 4. Fetch student records (tenant-scoped)
            const studentWhere = { id: studentIds };
            if (tenantId) studentWhere.tenantId = tenantId;
            const students = await User.findAll({
                where: studentWhere,
                attributes: ['id', 'name', 'email', 'avatar', 'createdAt'],
                include: [{
                    model: Batch,
                    as: 'enrolledBatches',
                    attributes: ['id', 'batchName'],
                    through: { attributes: [] }
                }]
            });

            // 5. Merge enrollment info into each student
            const result = students.map(s => {
                const studentEnrollments = enrollments.filter(e => e.studentId === s.id);
                const enrolledCourses = studentEnrollments.map(e => ({
                    id: e.courseId,
                    title: courseMap[e.courseId] || e.courseId
                }));
                const progress = {};
                studentEnrollments.forEach(e => { progress[e.courseId] = e.progressPercentage; });
                return { ...s.toJSON(), enrolledCourses, progress };
            });

            res.json({ success: true, students: result });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    getRecentActivity: async (req, res) => {
        try {
            const Activity = require('../models/Activity');
            const activities = await Activity.findAll({
                limit: 5,
                order: [['createdAt', 'DESC']]
            });
            res.json({ success: true, activities });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    // ─── Admin: Create User (Student or Teacher) ───────────────────────────
    adminCreateUser: async (req, res) => {
        try {
            const {
                name, email, phone, role, status,
                password, sendWelcomeEmail: sendEmail,
                mustChangePassword: forcePasswordChange,
                // Student-specific
                courseIds, batchId, batchIds, enrollmentDate,
                // Teacher-specific
                expertise, bio, qualification, experience, department, teacherCourseIds,
                linkedinUrl, twitterUrl, facebookUrl,
            } = req.body;

            // ── Required-field validation ──────────────────────────────────
            if (!name || !name.trim())
                return res.status(400).json({ success: false, message: 'Full name is required' });
            if (name.trim().length > 50)
                return res.status(400).json({ success: false, message: 'Name cannot exceed 50 characters' });
            if (!email || !email.trim())
                return res.status(400).json({ success: false, message: 'Email address is required' });
            if (email.trim().length > 100)
                return res.status(400).json({ success: false, message: 'Email cannot exceed 100 characters' });
            if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim()))
                return res.status(400).json({ success: false, message: 'Please provide a valid email format (e.g., example@gmail.com)' });
            if (!password)
                return res.status(400).json({ success: false, message: 'Password is required' });
            if (!['Student', 'Teacher'].includes(role))
                return res.status(400).json({ success: false, message: 'Role must be Student or Teacher' });

            // ── Duplicate-email check ──────────────────────────────────────
            const normalizedEmail = email.trim().toLowerCase();
            const existing = await User.findOne({ where: { email: normalizedEmail } });
            if (existing)
                return res.status(409).json({ success: false, message: 'A user with this email already exists' });

            // ── Build user record ──────────────────────────────────────────
            // Support batchIds array (multi-batch) or single batchId
            const primaryBatchId = batchId || (Array.isArray(batchIds) && batchIds.length > 0 ? batchIds[0] : null);
            const allBatchIds = batchIds && Array.isArray(batchIds) && batchIds.length > 0
                ? batchIds
                : (batchId ? [batchId] : []);
            const plainPassword = password; // keep plain-text for welcome email
            const userData = {
                name:   name.trim(),
                email:  normalizedEmail,
                password: plainPassword, // beforeCreate hook hashes this
                phone:  phone || null,
                role,
                status: status || 'Active',
                mustChangePassword: forcePasswordChange === true || forcePasswordChange === 'true',
                batchId: (role === 'Student' && primaryBatchId) ? primaryBatchId : null,
                tenantId: req.user.tenantId || null,
            };

            if (role === 'Teacher') {
                userData.bio           = bio           || null;
                userData.subject       = expertise     || null;
                userData.qualification = qualification || null;
                userData.experience    = experience    || null;
                userData.department    = department    || null;
                userData.linkedinUrl   = linkedinUrl   || null;
                userData.twitterUrl    = twitterUrl    || null;
                userData.facebookUrl   = facebookUrl   || null;
            }

            // ── Auto-generate unique Student ID (STU1001, STU1002, ...) ───
            let generatedStudentId = null;
            if (role === 'Student') {
                const { Op } = require('sequelize');
                // Use global max across ALL tenants so IDs are globally unique
                const existingStudents = await User.findAll({
                    where:      { studentId: { [Op.like]: 'STU%' } },
                    attributes: ['studentId'],
                });
                let maxNum = 1000;
                for (const s of existingStudents) {
                    const n = parseInt((s.studentId || '').replace('STU', ''), 10);
                    if (!isNaN(n) && n > maxNum) maxNum = n;
                }
                generatedStudentId = `STU${maxNum + 1}`;
                userData.studentId = generatedStudentId;
            }

            const user = await User.create(userData);

            // ── Course enrollments for Student ─────────────────────────────
            const Course     = require('../models/Course');
            const Enrollment = require('../models/Enrollment');
            let courseNames = [];

            if (role === 'Student' && Array.isArray(courseIds) && courseIds.length > 0) {
                const enrolledAt = enrollmentDate ? new Date(enrollmentDate) : new Date();
                await Promise.all(
                    courseIds.map(async (courseId) => {
                        await Enrollment.create({
                            studentId: user.id,
                            courseId,
                            batchId:    primaryBatchId || null,
                            enrolledAt,
                            status: 'Active',
                        });
                        // Keep counter in sync
                        const enrolledCourse = await Course.findByPk(courseId);
                        if (enrolledCourse) await enrolledCourse.increment('studentsEnrolled');
                    })
                );
                const enrolledCourses = await Course.findAll({
                    where: { id: courseIds },
                    attributes: ['title'],
                });
                courseNames = enrolledCourses.map(c => c.title);
            }

            // ── Assign courses to Teacher ──────────────────────────────────
            let teacherCourseNames = [];
            if (role === 'Teacher' && Array.isArray(teacherCourseIds) && teacherCourseIds.length > 0) {
                await Course.update({ teacherId: user.id }, { where: { id: teacherCourseIds } });
                const assignedCourses = await Course.findAll({
                    where: { id: teacherCourseIds },
                    attributes: ['title'],
                });
                teacherCourseNames = assignedCourses.map(c => c.title);
            }

            // ── Batch assignment for Student (supports multiple batches) ──────
            let batchName = null;
            if (role === 'Student' && allBatchIds.length > 0) {
                const BatchStudent = require('../models/BatchStudent');
                const Batch        = require('../models/Batch');
                await Promise.all(
                    allBatchIds.map(bid =>
                        BatchStudent.findOrCreate({
                            where:    { batchId: bid, studentId: user.id },
                            defaults: { batchId: bid, studentId: user.id },
                        })
                    )
                );
                const primaryBatch = await Batch.findByPk(primaryBatchId, { attributes: ['batchName'] });
                batchName = primaryBatch ? primaryBatch.batchName : null;
                if (batchName) await user.update({ batch: batchName });
            }

            // ── Send welcome email ─────────────────────────────────────────
            if (sendEmail) {
                try {
                    const { sendWelcomeEmail } = require('../services/emailService');
                    await sendWelcomeEmail({
                        name:      user.name,
                        email:     user.email,
                        password:  plainPassword,
                        role,
                        studentId: generatedStudentId,
                        courses:   role === 'Student' ? courseNames : teacherCourseNames,
                        batch:     batchName,
                    });
                } catch (emailErr) {
                    // Non-critical — log but don't fail the request
                    console.error('[Email] Welcome email failed:', emailErr.message);
                }
            }

            // ── Log activity ───────────────────────────────────────────────
            try {
                const logAdminActivity = require('../utils/logAdminActivity');
                const ip = req.ip || req.connection?.remoteAddress || null;
                logAdminActivity(req.user.id, 'user', 'CREATE', `Admin created new ${role.toLowerCase()} account: "${user.name}"`, ip);
            } catch (actErr) {
                console.error('[ActivityLog] failed:', actErr.message);
            }

            const { password: _pw, ...userResponse } = user.toJSON();
            return res.status(201).json({
                success: true,
                message: `${role} account created successfully`,
                user:    userResponse,
                generatedPassword: plainPassword,
            });
        } catch (err) {
            if (err.name === 'SequelizeUniqueConstraintError') {
                return res.status(409).json({ success: false, message: 'A user with this email already exists' });
            }
            console.error('[UserController] adminCreateUser error:', err);
            return res.status(500).json({ success: false, message: err.message });
        }
    },

    // ─── Batch-scoped User Dashboard ──────────────────────────────────────────
    getDashboard: async (req, res) => {
        try {
            const userId = req.params.id;
            // Users can only fetch their own dashboard; admins/superadmins can fetch any
            const callerRole = req.user?.role?.toLowerCase();
            if (req.user?.id !== userId && callerRole !== 'admin' && callerRole !== 'superadmin') {
                return res.status(403).json({ success: false, message: 'Access denied' });
            }

            const targetUser = await User.findByPk(userId, { attributes: ['id', 'name', 'role', 'status'] });
            if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });

            const Batch        = require('../models/Batch');
            const BatchStudent = require('../models/BatchStudent');
            const Announcement = require('../models/Announcement');

            let batches = [];
            let announcements = [];

            if (targetUser.role === 'Student') {
                const batchLinks = await BatchStudent.findAll({ where: { studentId: userId }, attributes: ['batchId'] });
                const batchIds = batchLinks.map(b => b.batchId);
                if (batchIds.length > 0) {
                    batches = await Batch.findAll({ where: { id: batchIds }, attributes: ['id', 'batchName', 'startDate', 'endDate', 'batchStatus'] });
                    announcements = await Announcement.findAll({
                        where: { batchId: batchIds, status: 'Published' },
                        order: [['createdAt', 'DESC']],
                        limit: 10,
                    });
                }
            } else if (targetUser.role === 'Teacher') {
                batches = await Batch.findAll({ where: { teacherId: userId }, attributes: ['id', 'batchName', 'startDate', 'endDate', 'batchStatus'] });
                const batchIds = batches.map(b => b.id);
                if (batchIds.length > 0) {
                    announcements = await Announcement.findAll({
                        where: { batchId: batchIds },
                        order: [['createdAt', 'DESC']],
                        limit: 10,
                    });
                }
            }

            return res.json({
                success: true,
                role: targetUser.role,
                batches,
                announcements,
                message: batches.length === 0
                    ? 'No batch assigned. Please contact your administrator.'
                    : null,
            });
        } catch (err) {
            console.error('[UserController] getDashboard error:', err);
            return res.status(500).json({ success: false, message: err.message });
        }
    },
};

module.exports = userController;
