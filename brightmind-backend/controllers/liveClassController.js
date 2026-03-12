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

        // Verify course ownership
        const course = await Course.findByPk(normalizedCourseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        if (req.user.role !== 'Admin' && normalizeId(course.teacherId) !== normalizeId(req.user.id)) {
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
            duration
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
        if (req.user.role !== 'Admin' && normalizeId(liveClass.teacherId) !== normalizeId(req.user.id)) {
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

        // Ownership check: Teacher must own the course, Admin is allowed
        if (req.user.role !== 'Admin' && liveClass.teacherId !== req.user.id) {
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

        // Role-based Access Control
        if (req.user.role === 'Teacher') {
            const course = await Course.findByPk(courseId, { attributes: ['id', 'teacherId'] });
            if (!course) return res.status(404).json({ message: 'Course not found' });

            if (normalizeId(course.teacherId) !== userId) {
                return res.status(403).json({ message: 'Not authorized for this course' });
            }

            // Strict ownership: teacher only sees classes they own in this course.
            whereClause.teacherId = userId;
            
            // Optional batch filtering for teachers
            if (req.query.batchId) {
                whereClause.batchId = req.query.batchId;
            }
        } else if (req.user.role === 'Student') {
            const enrollment = await Enrollment.findOne({ where: { studentId: userId, courseId } });
            if (!enrollment) return res.status(403).json({ message: 'Not enrolled in this course' });
            
            // Students only see live classes for their batch, plus global classes (batchId = null) for this course
            const { Op } = require('sequelize');
            if (enrollment.batchId) {
                whereClause[Op.or] = [
                    { batchId: enrollment.batchId },
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

        if (req.user.role === 'Student') {
            const enrollments = await Enrollment.findAll({ where: { studentId: userId } });
            if (!enrollments.length) return res.json([]);
            
            const courseIds = enrollments.map(e => String(e.courseId));
            const batchIds = enrollments.map(e => e.batchId).filter(id => id !== null && id !== undefined);

            const { Op } = require('sequelize');
            whereClause.courseId = { [Op.in]: courseIds };
            whereClause[Op.or] = [
                { batchId: { [Op.in]: batchIds } },
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
        let liveClasses = await LiveClass.findAll({
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

        // Ownership check
        if (req.user.role !== 'Admin' && liveClass.teacherId !== req.user.id) {
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
