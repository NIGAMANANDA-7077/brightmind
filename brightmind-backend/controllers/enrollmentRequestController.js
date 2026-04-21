const EnrollmentRequest = require('../models/EnrollmentRequest');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const Course = require('../models/Course');
const Notification = require('../models/Notification');

// POST /api/enrollment-requests/:courseId
// Student sends enrollment request
exports.createRequest = async (req, res) => {
    try {
        const { courseId } = req.params;
        const studentId = req.user.id;

        // Check course exists and is published
        const course = await Course.findByPk(courseId);
        if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
        if (course.status !== 'Active') return res.status(400).json({ success: false, message: 'Course is not available' });

        // Check already enrolled
        const enrolled = await Enrollment.findOne({ where: { studentId, courseId } });
        if (enrolled) return res.status(400).json({ success: false, message: 'Already enrolled in this course' });

        // Check already requested
        const existing = await EnrollmentRequest.findOne({ where: { studentId, courseId } });
        if (existing) {
            return res.status(400).json({ success: false, message: `Request already ${existing.status}`, status: existing.status });
        }

        const request = await EnrollmentRequest.create({ courseId, studentId, message: req.body.message || null });

        // Notify all admins
        const admins = await User.findAll({ where: { role: 'Admin' } });
        const student = await User.findByPk(studentId);

        for (const admin of admins) {
            await Notification.create({
                userId: admin.id,
                title: '📋 New Enrollment Request',
                message: `${student?.name || 'A student'} has requested enrollment in "${course.title}"`,
                type: 'info',
                read: false,
                referenceId: request.id,
                link: '/admin/enrollment-requests'
            });
        }

        res.status(201).json({ success: true, request });
    } catch (err) {
        console.error('Create enrollment request error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/enrollment-requests/status/:courseId
// Student checks their own request status for a course
exports.getMyStatus = async (req, res) => {
    try {
        const { courseId } = req.params;
        const studentId = req.user.id;

        const enrolled = await Enrollment.findOne({ where: { studentId, courseId } });
        if (enrolled) return res.json({ success: true, status: 'enrolled' });

        const request = await EnrollmentRequest.findOne({ where: { studentId, courseId } });
        if (!request) return res.json({ success: true, status: null });

        res.json({ success: true, status: request.status });
    } catch (err) {
        console.error('Get enrollment status error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/enrollment-requests
// Admin gets all enrollment requests
exports.getAllRequests = async (req, res) => {
    try {
        const requests = await EnrollmentRequest.findAll({
            order: [['createdAt', 'DESC']]
        });

        const enriched = await Promise.all(requests.map(async (r) => {
            const student = await User.findByPk(r.studentId, { attributes: ['id', 'name', 'email'] });
            const course = await Course.findByPk(r.courseId, { attributes: ['id', 'title', 'thumbnail'] });
            return {
                ...r.toJSON(),
                studentName: student?.name || 'Unknown',
                studentEmail: student?.email || '',
                courseTitle: course?.title || 'Unknown',
                courseThumbnail: course?.thumbnail || null
            };
        }));

        res.json({ success: true, requests: enriched });
    } catch (err) {
        console.error('Get all enrollment requests error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// PUT /api/enrollment-requests/:id/approve
// Admin approves request
exports.approveRequest = async (req, res) => {
    try {
        const request = await EnrollmentRequest.findByPk(req.params.id);
        if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
        if (request.status !== 'pending') return res.status(400).json({ success: false, message: 'Request already processed' });

        // Create enrollment
        await Enrollment.create({
            studentId: request.studentId,
            courseId: request.courseId,
            status: 'Active',
            enrolledAt: new Date()
        });

        // Increment live counter
        const course = await Course.findByPk(request.courseId);
        if (course) await course.increment('studentsEnrolled');

        // Update request status
        await request.update({ status: 'approved' });

        // Notify student
        await Notification.create({
            userId: request.studentId,
            title: '🎉 Enrollment Approved!',
            message: `Your enrollment request for "${course?.title}" has been approved. You can now access the course.`,
            type: 'success',
            read: false,
            referenceId: request.courseId,
            link: '/student/courses'
        });

        res.json({ success: true, message: 'Request approved', request });
    } catch (err) {
        console.error('Approve enrollment request error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// PUT /api/enrollment-requests/:id/reject
// Admin rejects request
exports.rejectRequest = async (req, res) => {
    try {
        const request = await EnrollmentRequest.findByPk(req.params.id);
        if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
        if (request.status !== 'pending') return res.status(400).json({ success: false, message: 'Request already processed' });

        await request.update({ status: 'rejected' });

        // Notify student
        const course = await Course.findByPk(request.courseId);
        await Notification.create({
            userId: request.studentId,
            title: '❌ Enrollment Rejected',
            message: `Your enrollment request for "${course?.title}" has been rejected. Please contact admin for more details.`,
            type: 'error',
            read: false,
            referenceId: request.courseId,
            link: '/student/explore'
        });

        res.json({ success: true, message: 'Request rejected', request });
    } catch (err) {
        console.error('Reject enrollment request error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
