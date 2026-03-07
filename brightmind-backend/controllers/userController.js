const User = require('../models/User');

const userController = {
    // Get all users
    getAllUsers: async (req, res) => {
        try {
            const users = await User.findAll({
                attributes: { exclude: ['password'] },
                order: [['createdAt', 'DESC']]
            });
            res.json(users);
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    // Get user stats
    getUserStats: async (req, res) => {
        try {
            const studentCount = await User.count({ where: { role: 'Student' } });
            const teacherCount = await User.count({ where: { role: 'Teacher' } });
            const activeCount = await User.count({ where: { status: 'Active' } });

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

            // Fetch data
            const enrollments = await Enrollment.findAll({ where: { createdAt: { [Op.gte]: startDate } } });
            const attempts = await Submission.findAll({ where: { createdAt: { [Op.gte]: startDate } } });
            const creations = await Course.findAll({ where: { createdAt: { [Op.gte]: startDate } } });

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
            const user = await User.create(req.body);
            const { password, ...userWithoutPassword } = user.toJSON();
            res.status(201).json(userWithoutPassword);
        } catch (err) {
            res.status(400).json({ success: false, message: err.message });
        }
    },

    // Update full user details
    updateUser: async (req, res) => {
        try {
            const user = await User.findByPk(req.params.id);
            if (!user) return res.status(404).json({ success: false, message: 'User not found' });

            const { password, ...updateData } = req.body;
            await user.update(updateData);

            res.json({ success: true, user });
        } catch (err) {
            res.status(400).json({ success: false, message: err.message });
        }
    },

    updateUserStatus: async (req, res) => {
        try {
            const { status } = req.body;
            await User.update({ status }, { where: { id: req.params.id } });
            res.json({ success: true, message: 'Status updated' });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    // Delete user
    deleteUser: async (req, res) => {
        try {
            await User.destroy({ where: { id: req.params.id } });
            res.json({ success: true, message: 'User deleted' });
        } catch (err) {
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

            const courses = await Course.findAll({ where: { teacherId } });
            const courseIds = courses.map(c => c.id);

            const studentCount = await Enrollment.count({ where: { courseId: courseIds } });
            const assignmentCount = await Assignment.count({ where: { courseId: courseIds } });
            const pendingGrading = await Submission.count({
                where: {
                    assignmentId: (await Assignment.findAll({ where: { courseId: courseIds } })).map(a => a.id),
                    status: 'Submitted'
                }
            });

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
    }
};

module.exports = userController;
