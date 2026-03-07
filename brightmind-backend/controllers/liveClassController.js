const LiveClass = require('../models/LiveClass');
const Attendance = require('../models/Attendance');

exports.getAllLiveClasses = async (req, res, next) => {
    try {
        const liveClasses = await LiveClass.findAll();
        res.json(liveClasses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.logAttendance = async (req, res, next) => {
    try {
        const { liveClassId } = req.body;
        const studentId = req.user.id;

        const liveClass = await LiveClass.findByPk(liveClassId);
        if (!liveClass) {
            return res.status(404).json({ success: false, message: 'Live class not found' });
        }

        const [attendance, created] = await Attendance.findOrCreate({
            where: { studentId, liveClassId },
            defaults: { durationMinutes: 0 }
        });

        if (created) {
            await liveClass.increment('studentsJoined');
        }

        res.status(200).json({ success: true, message: 'Attendance logged', attendance });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to record attendance' });
    }
};
