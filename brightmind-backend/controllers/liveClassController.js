const LiveClass = require('../models/LiveClass');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const Batch = require('../models/Batch');
const { getIO } = require('../socket');

const normalizeId = (value) => String(value || '').trim();

// Helper to update live class status based on current time
const updateClassStatuses = async (liveClasses) => {
    const now = new Date();
    const updated = [];

    for (const lc of liveClasses) {
        // Construct local date from classDate string and startTime string
        // Use a format that is more likely to be parsed correctly as local time
        const dateStr = typeof lc.classDate === 'string' ? lc.classDate : lc.classDate.toISOString().split('T')[0];
        const start = new Date(`${dateStr}T${lc.startTime}:00`);

        const durationMinutes = parseInt(String(lc.duration || '').replace(/[^0-9]/g, ''), 10) || 60;
        const end = new Date(start.getTime() + durationMinutes * 60000);

        let newStatus = lc.status;
        if (now >= end) {
            newStatus = 'Completed';
        } else if (now >= start && now < end) {
            newStatus = 'Live';
        } else {
            newStatus = 'Upcoming';
        }

        if (newStatus !== lc.status) {
            await lc.update({ status: newStatus });
            updated.push(lc.id);
        }
    }

    if (updated.length > 0) {
        try {
            getIO().emit('liveClassUpdate', { action: 'status_auto_updated', ids: updated });
        } catch (_) { }
    }

    return updated;
};

// Create Live Class
exports.createLiveClass = async (req, res) => {
    try {
        const { courseId, batchId, title, description, meetingLink, classDate, startTime, duration } = req.body;
        const normalizedCourseId = normalizeId(courseId);
        const tenantId = req.user.tenantId || null;

        // Verify course ownership and tenant
        const courseWhere = { id: normalizedCourseId };
        if (req.user.role !== 'SuperAdmin' && tenantId) courseWhere.tenantId = tenantId;
        const course = await Course.findOne({ where: courseWhere });
        if (!course) return res.status(404).json({ message: 'Course not found' });
        if (req.user.role !== 'Admin' && req.user.role !== 'SuperAdmin' && normalizeId(course.teacherId) !== normalizeId(req.user.id)) {
            return res.status(403).json({ message: 'Not authorized for this course' });
        }

        const teacherId = req.user.role === 'Admin' ? (normalizeId(course.teacherId) || normalizeId(req.user.id)) : normalizeId(req.user.id);

        const liveClass = await LiveClass.create({
            courseId: normalizedCourseId,
            batchId: batchId || null,
            teacherId,
            title,
            description,
            meetingLink,
            classDate,
            startTime,
            duration,
            tenantId
        });

        // Emit real-time update
        try {
            getIO().emit('liveClassUpdate', { action: 'created', liveClass });
        } catch (_) { }

        res.status(201).json(liveClass);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Update Live Class
exports.updateLiveClass = async (req, res) => {
    try {
        const liveClass = await LiveClass.findByPk(req.params.id);
        if (!liveClass) return res.status(404).json({ message: 'Live class not found' });

        // Tenant ownership check
        if (req.user.role !== 'SuperAdmin' && req.user.tenantId && liveClass.tenantId && liveClass.tenantId !== req.user.tenantId) {
            return res.status(403).json({ message: 'Access denied: wrong tenant' });
        }
        if (req.user.role !== 'Admin' && req.user.role !== 'SuperAdmin' && normalizeId(liveClass.teacherId) !== normalizeId(req.user.id)) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await liveClass.update(req.body);

        // Emit real-time update
        try {
            getIO().emit('liveClassUpdate', { action: 'updated', liveClass });
        } catch (_) { }

        res.json(liveClass);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete Live Class
exports.deleteLiveClass = async (req, res) => {
    try {
        const liveClass = await LiveClass.findByPk(req.params.id);
        if (!liveClass) return res.status(404).json({ message: 'Live class not found' });

        // Tenant ownership check
        if (req.user.role !== 'SuperAdmin' && req.user.tenantId && liveClass.tenantId && liveClass.tenantId !== req.user.tenantId) {
            return res.status(403).json({ message: 'Access denied: wrong tenant' });
        }
        if (req.user.role !== 'Admin' && req.user.role !== 'SuperAdmin' && liveClass.teacherId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await liveClass.destroy();

        // Emit real-time update
        try {
            getIO().emit('liveClassUpdate', { action: 'deleted', id: req.params.id });
        } catch (_) { }

        res.json({ message: 'Live class deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Unified Fetcher (Teacher, Student, Admin)
exports.getLiveClassesByCourse = async (req, res) => {
    try {
        const courseId = normalizeId(req.params.courseId);
        const userId = normalizeId(req.user.id);

        if (!courseId) {
            return res.status(400).json({ message: 'courseId is required' });
        }

        const whereClause = { courseId };

        // Tenant isolation
        if (req.user.role !== 'SuperAdmin' && req.user.tenantId) {
            whereClause.tenantId = req.user.tenantId;
        }

        // Role-based Access Control
        if (req.user.role === 'Teacher') {
            // Strict ownership: teacher only sees classes they own
            whereClause.teacherId = userId;
            
            // Optional batch filtering for teachers
            if (req.query.batchId) {
                whereClause.batchId = req.query.batchId;
            }
        } else if (req.user.role === 'Student') {
            const enrollment = await Enrollment.findOne({ where: { studentId: userId, courseId } });
            if (!enrollment) return res.status(403).json({ message: 'Not enrolled in this course' });
            
            // Fetch all batches this student belongs to
            const BatchStudent = require('../models/BatchStudent');
            const studentBatches = await BatchStudent.findAll({ where: { studentId: userId } });
            const studentBatchIds = studentBatches.map(b => b.batchId);

            const { Op } = require('sequelize');
            if (studentBatchIds.length > 0) {
                whereClause[Op.or] = [
                    { batchId: { [Op.in]: studentBatchIds } },
                    { batchId: null }
                ];
            } else {
                whereClause.batchId = null; // Unassigned students only see global
            }
        }
        // Admin has access to all courses and can filter by batch
        if (req.user.role === 'Admin' && req.query.batchId) {
             whereClause.batchId = req.query.batchId;
        }

        let liveClasses = await LiveClass.findAll({
            where: whereClause,
            include: [
                { model: Course, as: 'course', attributes: ['id', 'title'] },
                { model: User, as: 'teacher', attributes: ['id', 'name', 'avatar'] },
                { model: Batch, as: 'batch', attributes: ['id', 'batchName'] }
            ],
            order: [['classDate', 'ASC'], ['startTime', 'ASC']]
        });

        const updatedIds = await updateClassStatuses(liveClasses);

        // Return fresh records after status transitions.
        if (updatedIds.length > 0) {
            liveClasses = await LiveClass.findAll({
                where: whereClause,
                include: [
                    { model: Course, as: 'course', attributes: ['id', 'title'] },
                    { model: User, as: 'teacher', attributes: ['id', 'name', 'avatar'] },
                    { model: Batch, as: 'batch', attributes: ['id', 'batchName'] }
                ],
                order: [['classDate', 'ASC'], ['startTime', 'ASC']]
            });
        }

        res.json({ liveClasses });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Global Fetcher (Across all enrolled/assigned courses for Dashboard)
exports.getLiveClassesForUser = async (req, res) => {
    try {
        const userId = normalizeId(req.user.id);
        const whereClause = {};

        // Tenant isolation
        if (req.user.role !== 'SuperAdmin' && req.user.tenantId) {
            whereClause.tenantId = req.user.tenantId;
        }

        if (req.user.role === 'Student') {
            const enrollments = await Enrollment.findAll({ where: { studentId: userId } });
            if (!enrollments.length) return res.json([]);
            
            const courseIds = enrollments.map(e => String(e.courseId));
            
            const BatchStudent = require('../models/BatchStudent');
            const studentBatches = await BatchStudent.findAll({ where: { studentId: userId } });
            const studentBatchIds = studentBatches.map(b => b.batchId);

            const { Op } = require('sequelize');
            whereClause.courseId = { [Op.in]: courseIds };
            whereClause[Op.or] = [
                { batchId: { [Op.in]: studentBatchIds } },
                { batchId: null }
            ];
        } else if (req.user.role === 'Teacher') {
            whereClause.teacherId = userId;
        }

        let liveClasses = await LiveClass.findAll({
            where: whereClause,
            include: [
                { model: Course, as: 'course', attributes: ['id', 'title'] },
                { model: User, as: 'teacher', attributes: ['id', 'name', 'avatar'] },
                { model: Batch, as: 'batch', attributes: ['id', 'batchName'] }
            ],
            order: [['classDate', 'ASC'], ['startTime', 'ASC']]
        });

        const updatedIds = await updateClassStatuses(liveClasses);

        if (updatedIds.length > 0) {
            liveClasses = await LiveClass.findAll({
                where: whereClause,
                include: [
                    { model: Course, as: 'course', attributes: ['id', 'title'] },
                    { model: User, as: 'teacher', attributes: ['id', 'name', 'avatar'] },
                    { model: Batch, as: 'batch', attributes: ['id', 'batchName'] }
                ],
                order: [['classDate', 'ASC'], ['startTime', 'ASC']]
            });
        }

        res.json(liveClasses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Admin View-All (System dashboard)
exports.getAdminLiveClasses = async (req, res) => {
    try {
        const where = {};
        if (req.user.role !== 'SuperAdmin' && req.user.tenantId) {
            where.tenantId = req.user.tenantId;
        }

        let liveClasses = await LiveClass.findAll({
            where,
            include: [
                { model: Course, as: 'course', attributes: ['id', 'title'] },
                { model: User, as: 'teacher', attributes: ['id', 'name', 'avatar'] },
                { model: Batch, as: 'batch', attributes: ['id', 'batchName'] }
            ],
            order: [['classDate', 'DESC']]
        });

        const updatedIds = await updateClassStatuses(liveClasses);
        if (updatedIds.length > 0) {
            liveClasses = await LiveClass.findAll({
                where,
                include: [
                    { model: Course, as: 'course', attributes: ['id', 'title'] },
                    { model: User, as: 'teacher', attributes: ['id', 'name', 'avatar'] },
                    { model: Batch, as: 'batch', attributes: ['id', 'batchName'] }
                ],
                order: [['classDate', 'DESC']]
            });
        }

        res.json({ liveClasses });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update Recording URL
exports.updateRecordingUrl = async (req, res) => {
    try {
        const { id } = req.params;
        const { recordingUrl } = req.body;

        const liveClass = await LiveClass.findByPk(id);
        if (!liveClass) return res.status(404).json({ message: 'Live class not found' });

        // Tenant ownership check
        if (req.user.role !== 'SuperAdmin' && req.user.tenantId && liveClass.tenantId && liveClass.tenantId !== req.user.tenantId) {
            return res.status(403).json({ message: 'Access denied: wrong tenant' });
        }
        if (req.user.role !== 'Admin' && req.user.role !== 'SuperAdmin' && liveClass.teacherId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await liveClass.update({ recordingUrl, status: 'Completed' });

        try {
            getIO().emit('liveClassUpdate', { action: 'recording_updated', liveClass });
        } catch (_) { }

        res.json(liveClass);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
