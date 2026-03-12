const Attendance = require('../models/Attendance');
const User = require('../models/User');
const LiveClass = require('../models/LiveClass');
const BatchStudent = require('../models/BatchStudent');

// ─── Teacher: Mark attendance for a live class ─────────────
exports.markAttendance = async (req, res) => {
    try {
        const { liveClassId, attendanceData } = req.body;
        // attendanceData: [{ studentId, status }]

        if (!liveClassId || !Array.isArray(attendanceData)) {
            return res.status(400).json({ success: false, message: 'liveClassId and attendanceData array required' });
        }

        const liveClass = await LiveClass.findByPk(liveClassId);
        if (!liveClass) return res.status(404).json({ success: false, message: 'Live class not found' });

        // Verify teacher owns this live class
        if (req.user.role === 'Teacher' && String(liveClass.teacherId) !== String(req.user.id)) {
            return res.status(403).json({ success: false, message: 'Not authorized for this live class' });
        }

        const results = { marked: 0, updated: 0, errors: [] };
        const now = new Date();

        for (const entry of attendanceData) {
            try {
                const [record, created] = await Attendance.findOrCreate({
                    where: { studentId: entry.studentId, liveClassId },
                    defaults: {
                        batchId: liveClass.batchId,
                        status: entry.status || 'present',
                        markedAt: now
                    }
                });

                if (!created) {
                    await record.update({ status: entry.status || 'present', markedAt: now });
                    results.updated++;
                } else {
                    results.marked++;
                }
            } catch (e) {
                results.errors.push({ studentId: entry.studentId, error: e.message });
            }
        }

        res.json({ success: true, results });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── Teacher: Get attendance for a live class ──────────────
exports.getLiveClassAttendance = async (req, res) => {
    try {
        const { liveClassId } = req.params;

        const records = await Attendance.findAll({
            where: { liveClassId },
            include: [
                { model: User, as: 'student', attributes: ['id', 'name', 'email', 'avatar'] }
            ],
            order: [['markedAt', 'DESC']]
        });

        res.json({ success: true, data: records });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── Teacher: Get batch attendance summary ─────────────────
exports.getBatchAttendance = async (req, res) => {
    try {
        const { batchId } = req.params;

        const records = await Attendance.findAll({
            where: { batchId },
            include: [
                { model: User, as: 'student', attributes: ['id', 'name', 'email', 'avatar'] },
                { model: LiveClass, as: 'liveClass', attributes: ['id', 'title', 'classDate'] }
            ],
            order: [['markedAt', 'DESC']]
        });

        res.json({ success: true, data: records });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── Student: Get my attendance ────────────────────────────
exports.getMyAttendance = async (req, res) => {
    try {
        const records = await Attendance.findAll({
            where: { studentId: req.user.id },
            include: [
                { model: LiveClass, as: 'liveClass', attributes: ['id', 'title', 'classDate', 'startTime'] }
            ],
            order: [['markedAt', 'DESC']]
        });

        const total = records.length;
        const present = records.filter(r => r.status === 'present').length;
        const late = records.filter(r => r.status === 'late').length;
        const absent = records.filter(r => r.status === 'absent').length;

        res.json({
            success: true,
            data: records,
            stats: { total, present, late, absent, percentage: total > 0 ? Math.round((present + late) / total * 100) : 0 }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
