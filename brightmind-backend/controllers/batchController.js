const Batch = require('../models/Batch');
const BatchStudent = require('../models/BatchStudent');
const User = require('../models/User');
const Course = require('../models/Course');
const LiveClass = require('../models/LiveClass');
const logAdminActivity = require('../utils/logAdminActivity');

// ─── Admin: Create Batch ───────────────────────────────────
exports.createBatch = async (req, res) => {
    try {
        const { batchName, courseId, teacherId, startDate, endDate, batchStatus, description } = req.body;

        if (!batchName || !courseId || !teacherId) {
            return res.status(400).json({ success: false, message: 'batchName, courseId and teacherId are required' });
        }

        const course = await Course.findByPk(courseId);
        if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

        // Ensure course belongs to the same tenant
        const tenantId = req.user?.tenantId || null;
        if (tenantId && course.tenantId && String(course.tenantId) !== String(tenantId)) {
            return res.status(403).json({ success: false, message: 'Course does not belong to your tenant' });
        }

        const teacher = await User.findOne({ where: { id: teacherId, role: 'Teacher' } });
        if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });

        const batch = await Batch.create({ batchName, courseId, teacherId, startDate, endDate, batchStatus: batchStatus || 'upcoming', description, tenantId });

        if (req.user?.id && ['Admin', 'SuperAdmin'].includes(req.user?.role)) {
            logAdminActivity(req.user.id, 'batch', 'CREATE', `Admin created batch "${batchName}" for course "${course.title}"`, req.ip);
        }

        res.status(201).json({ success: true, data: batch });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── Admin: Get All Batches ────────────────────────────────
exports.getAllBatches = async (req, res) => {
    try {
        // Filter by tenant (SuperAdmin sees all)
        const where = req.user?.role === 'SuperAdmin' ? {} : { tenantId: req.user?.tenantId || null };
        const batches = await Batch.findAll({
            where,
            include: [
                { model: Course, as: 'course', attributes: ['id', 'title', 'subject'] },
                { model: User, as: 'teacher', attributes: ['id', 'name', 'avatar', 'email'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        // Count students per batch
        const batchesWithCount = await Promise.all(batches.map(async (b) => {
            const studentCount = await BatchStudent.count({ where: { batchId: b.id } });
            return { ...b.toJSON(), studentCount };
        }));

        res.json({ success: true, data: batchesWithCount });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── Admin/Teacher: Get Batch by ID ───────────────────────
exports.getBatchById = async (req, res) => {
    try {
        const where = { id: req.params.id };
        if (req.user?.role !== 'SuperAdmin' && req.user?.tenantId) where.tenantId = req.user.tenantId;

        const batch = await Batch.findOne({
            where,
            include: [
                { model: Course, as: 'course', attributes: ['id', 'title', 'subject', 'thumbnail'] },
                { model: User, as: 'teacher', attributes: ['id', 'name', 'avatar', 'email'] },
                { model: User, as: 'students', attributes: ['id', 'name', 'avatar', 'email'], through: { attributes: [] } }
            ]
        });

        if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });

        // Teacher can only view their own batch
        if (req.user.role === 'Teacher' && String(batch.teacherId) !== String(req.user.id)) {
            return res.status(403).json({ success: false, message: 'Not authorized to view this batch' });
        }

        res.json({ success: true, data: batch });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── Admin: Update Batch ───────────────────────────────────
exports.updateBatch = async (req, res) => {
    try {
        const where = { id: req.params.id };
        if (req.user?.role !== 'SuperAdmin' && req.user?.tenantId) where.tenantId = req.user.tenantId;
        const batch = await Batch.findOne({ where });
        if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });

        const batchName = batch.batchName;
        delete req.body.tenantId; // strip tenantId from update payload
        await batch.update(req.body);

        if (req.user?.id && ['Admin', 'SuperAdmin'].includes(req.user?.role)) {
            logAdminActivity(req.user.id, 'batch', 'UPDATE', `Admin updated batch "${batchName}"`, req.ip);
        }

        res.json({ success: true, data: batch });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── Admin: Delete Batch ───────────────────────────────────
exports.deleteBatch = async (req, res) => {
    try {
        const where = { id: req.params.id };
        if (req.user?.role !== 'SuperAdmin' && req.user?.tenantId) where.tenantId = req.user.tenantId;
        const batch = await Batch.findOne({ where });
        if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });

        // Clear batchId on all students in this batch
        const batchStudents = await BatchStudent.findAll({ where: { batchId: batch.id } });
        await Promise.all(batchStudents.map(bs => User.update({ batchId: null }, { where: { id: bs.studentId } })));

        const batchName = batch.batchName;
        await BatchStudent.destroy({ where: { batchId: batch.id } });
        await batch.destroy();

        if (req.user?.id && ['Admin', 'SuperAdmin'].includes(req.user?.role)) {
            logAdminActivity(req.user.id, 'batch', 'DELETE', `Admin deleted batch "${batchName}"`, req.ip);
        }

        res.json({ success: true, message: 'Batch deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── Admin: Add Students to Batch ─────────────────────────
exports.addStudentsToBatch = async (req, res) => {
    try {
        const { studentIds } = req.body; // Array of UUIDs
        const { id: batchId } = req.params;

        if (!Array.isArray(studentIds) || studentIds.length === 0) {
            return res.status(400).json({ success: false, message: 'studentIds array is required' });
        }

        const batch = await Batch.findByPk(batchId);
        if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });

        // Tenant isolation check
        if (req.user.role !== 'SuperAdmin' && req.user.tenantId && batch.tenantId && batch.tenantId !== req.user.tenantId) {
            return res.status(403).json({ success: false, message: 'Access denied: batch belongs to a different tenant' });
        }

        const results = { added: [], skipped: [], errors: [] };

        for (const studentId of studentIds) {
            try {
                const student = await User.findOne({ where: { id: studentId, role: 'Student' } });
                if (!student) { results.errors.push({ studentId, reason: 'Student not found' }); continue; }

                const exists = await BatchStudent.findOne({ where: { batchId, studentId } });
                if (exists) { results.skipped.push(studentId); continue; }

                await BatchStudent.create({ batchId, studentId });
                await User.update({ batchId }, { where: { id: studentId } });
                results.added.push(studentId);
            } catch (e) {
                results.errors.push({ studentId, reason: e.message });
            }
        }

        if (req.user?.id && ['Admin', 'SuperAdmin'].includes(req.user?.role) && results.added.length > 0) {
            logAdminActivity(req.user.id, 'batch', 'ASSIGN', `Admin assigned ${results.added.length} student(s) to batch "${batch.batchName}"`, req.ip);
        }

        res.json({ success: true, results });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── Admin: Remove Student from Batch ─────────────────────
exports.removeStudentFromBatch = async (req, res) => {
    try {
        const { id: batchId, studentId } = req.params;

        const record = await BatchStudent.findOne({ where: { batchId, studentId } });
        if (!record) return res.status(404).json({ success: false, message: 'Student not in this batch' });

        const student = await User.findByPk(studentId, { attributes: ['name'] });
        const batch = await Batch.findByPk(batchId, { attributes: ['batchName', 'tenantId'] });

        // Tenant isolation check
        if (req.user.role !== 'SuperAdmin' && req.user.tenantId && batch && batch.tenantId && batch.tenantId !== req.user.tenantId) {
            return res.status(403).json({ success: false, message: 'Access denied: batch belongs to a different tenant' });
        }

        await record.destroy();
        await User.update({ batchId: null }, { where: { id: studentId } });

        if (req.user?.id && ['Admin', 'SuperAdmin'].includes(req.user?.role)) {
            logAdminActivity(req.user.id, 'batch', 'ASSIGN', `Admin removed student "${student?.name || studentId}" from batch "${batch?.batchName || batchId}"`, req.ip);
        }

        res.json({ success: true, message: 'Student removed from batch' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── Admin/Teacher: Get Students in Batch ─────────────────
exports.getBatchStudents = async (req, res) => {
    try {
        const batch = await Batch.findByPk(req.params.id);
        if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });

        if (req.user.role === 'Teacher' && String(batch.teacherId) !== String(req.user.id)) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const students = await User.findAll({
            include: [{
                model: Batch,
                as: 'enrolledBatches',
                where: { id: req.params.id },
                through: { attributes: [] }
            }],
            attributes: ['id', 'name', 'email', 'avatar', 'phone', 'status']
        });

        res.json({ success: true, data: students });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── Teacher/Admin: Get My Batches ──────────────────────────
exports.getTeacherBatches = async (req, res) => {
    try {
        const role = req.user?.role || '';
        const isSuperAdmin = role === 'SuperAdmin';
        const isAdmin = role === 'Admin';

        const where = {};
        if (!isSuperAdmin) {
            where.tenantId = req.user?.tenantId || null;
        }
        if (!isSuperAdmin && !isAdmin) {
            where.teacherId = req.user.id;
        }

        const batches = await Batch.findAll({
            where,
            include: [
                { model: Course, as: 'course', attributes: ['id', 'title', 'subject', 'thumbnail'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        const batchesWithCount = await Promise.all(batches.map(async (b) => {
            const studentCount = await BatchStudent.count({ where: { batchId: b.id } });
            return { ...b.toJSON(), studentCount };
        }));

        res.json({ success: true, data: batchesWithCount });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── Student: Get ALL My Batches (for multi-batch students) ───────────────────
exports.getStudentBatches = async (req, res) => {
    try {
        const batchStudentRows = await BatchStudent.findAll({
            where: { studentId: req.user.id }
        });
        const batchIds = batchStudentRows.map(r => r.batchId);

        if (batchIds.length === 0) {
            return res.json({ success: true, data: [] });
        }

        const { Op } = require('sequelize');
        const batches = await Batch.findAll({
            where: { id: { [Op.in]: batchIds } },
            include: [
                { model: Course, as: 'course', attributes: ['id', 'title'] }
            ],
            attributes: ['id', 'batchName', 'courseId'],
            order: [['createdAt', 'ASC']]
        });

        res.json({ success: true, data: batches });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── Student: Get My Batch (returns ALL batches via join table) ───
exports.getStudentBatch = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { Op } = require('sequelize');

        // Get all batch IDs from join table
        const batchStudentRows = await BatchStudent.findAll({ where: { studentId } });
        const batchIds = batchStudentRows.map(r => r.batchId);

        // Also include legacy direct batchId
        const student = await User.findByPk(studentId, { attributes: ['id', 'batchId'] });
        if (student?.batchId && !batchIds.includes(student.batchId)) {
            batchIds.push(student.batchId);
        }

        if (batchIds.length === 0) {
            return res.json({ success: true, data: null, allBatches: [], message: 'No batch assigned yet' });
        }

        const batches = await Batch.findAll({
            where: { id: { [Op.in]: batchIds } },
            include: [
                { model: Course, as: 'course', attributes: ['id', 'title', 'subject', 'thumbnail', 'description'] },
                { model: User, as: 'teacher', attributes: ['id', 'name', 'avatar', 'email', 'bio'] }
            ],
            order: [['createdAt', 'ASC']]
        });

        // Return first batch as primary (backward compat) + all batches
        res.json({ success: true, data: batches[0] || null, allBatches: batches });
    } catch (err) {
        console.error(`[getStudentBatch] Error:`, err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── Student: Get My Batch Live Classes ───────────────────
exports.getStudentLiveClasses = async (req, res) => {
    try {
        const BatchStudent = require('../models/BatchStudent');
        const User = require('../models/User');
        const studentBatches = await BatchStudent.findAll({ where: { studentId: req.user.id } });
        const batchIds = studentBatches.map(b => b.batchId);

        const studentUser = await User.findByPk(req.user.id, { attributes: ['id', 'batchId'] });
        if (studentUser?.batchId && !batchIds.includes(studentUser.batchId)) {
            batchIds.push(studentUser.batchId);
        }

        const { Op } = require('sequelize');
        let whereClause = {};
        if (batchIds.length > 0) {
            whereClause[Op.or] = [
                { batchId: { [Op.in]: batchIds } },
                { batchId: null }
            ];
        } else {
            whereClause.batchId = null; // Unassigned students only see global
        }

        const liveClasses = await LiveClass.findAll({
            where: whereClause,
            include: [
                { model: Course, as: 'course', attributes: ['id', 'title'] },
                { model: User, as: 'teacher', attributes: ['id', 'name', 'avatar'] }
            ],
            order: [['classDate', 'ASC'], ['startTime', 'ASC']]
        });

        res.json({ success: true, data: liveClasses });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
