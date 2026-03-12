const Batch = require('../models/Batch');
const BatchStudent = require('../models/BatchStudent');
const User = require('../models/User');
const Course = require('../models/Course');
const LiveClass = require('../models/LiveClass');

// ─── Admin: Create Batch ───────────────────────────────────
exports.createBatch = async (req, res) => {
    try {
        const { batchName, courseId, teacherId, startDate, endDate, batchStatus, description } = req.body;

        if (!batchName || !courseId || !teacherId) {
            return res.status(400).json({ success: false, message: 'batchName, courseId and teacherId are required' });
        }

        const course = await Course.findByPk(courseId);
        if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

        const teacher = await User.findOne({ where: { id: teacherId, role: 'Teacher' } });
        if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });

        const batch = await Batch.create({ batchName, courseId, teacherId, startDate, endDate, batchStatus: batchStatus || 'upcoming', description });
        res.status(201).json({ success: true, data: batch });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── Admin: Get All Batches ────────────────────────────────
exports.getAllBatches = async (req, res) => {
    try {
        const batches = await Batch.findAll({
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
        const batch = await Batch.findByPk(req.params.id, {
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
        const batch = await Batch.findByPk(req.params.id);
        if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });

        await batch.update(req.body);
        res.json({ success: true, data: batch });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── Admin: Delete Batch ───────────────────────────────────
exports.deleteBatch = async (req, res) => {
    try {
        const batch = await Batch.findByPk(req.params.id);
        if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });

        // Clear batchId on all students in this batch
        const batchStudents = await BatchStudent.findAll({ where: { batchId: batch.id } });
        await Promise.all(batchStudents.map(bs => User.update({ batchId: null }, { where: { id: bs.studentId } })));

        await BatchStudent.destroy({ where: { batchId: batch.id } });
        await batch.destroy();

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

        await record.destroy();
        await User.update({ batchId: null }, { where: { id: studentId } });

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

// ─── Teacher: Get My Batches ───────────────────────────────
exports.getTeacherBatches = async (req, res) => {
    try {
        const batches = await Batch.findAll({
            where: { teacherId: req.user.id },
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

// ─── Student: Get My Batch ─────────────────────────────────
exports.getStudentBatch = async (req, res) => {
    try {
        console.log(`[getStudentBatch] Checking batch for user: ${req.user.id}`);
        const student = await User.findByPk(req.user.id, { attributes: ['id', 'batchId'] });

        if (!student || !student.batchId) {
            console.log(`[getStudentBatch] No batch assigned for ${req.user.id} (student.batchId is ${student?.batchId})`);
            return res.json({ success: true, data: null, message: 'No batch assigned yet' });
        }

        console.log(`[getStudentBatch] Found batchId ${student.batchId} for user ${req.user.id}`);
        const batch = await Batch.findByPk(student.batchId, {
            include: [
                { model: Course, as: 'course', attributes: ['id', 'title', 'subject', 'thumbnail', 'description'] },
                { model: User, as: 'teacher', attributes: ['id', 'name', 'avatar', 'email', 'bio'] }
            ]
        });

        if (!batch) {
            console.log(`[getStudentBatch] Batch row not found for ID ${student.batchId}`);
            return res.json({ success: true, data: null, message: 'Batch not found' });
        }

        console.log(`[getStudentBatch] Returning batch ${batch.batchName} to user ${req.user.id}`);
        res.json({ success: true, data: batch });
    } catch (err) {
        console.error(`[getStudentBatch] Error:`, err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── Student: Get My Batch Live Classes ───────────────────
exports.getStudentLiveClasses = async (req, res) => {
    try {
        const student = await User.findByPk(req.user.id, { attributes: ['id', 'batchId'] });

        if (!student || !student.batchId) {
            return res.json({ success: true, data: [], message: 'No batch assigned' });
        }

        const liveClasses = await LiveClass.findAll({
            where: { batchId: student.batchId },
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
