const Certificate = require('../models/Certificate');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

exports.getMyCertificates = async (req, res, next) => {
    try {
        const certificates = await Certificate.findAll({
            where: { studentId: req.user.id }
        });

        const courseIds = certificates.map(c => c.courseId);
        const courses = await Course.findAll({
            where: { id: courseIds },
            attributes: ['id', 'title', 'thumbnail']
        });

        const result = certificates.map(cert => {
            const courseData = courses.find(c => c.id === cert.courseId);
            return {
                ...cert.toJSON(),
                courseTitle: courseData ? courseData.title : 'Unknown Course',
                courseThumbnail: courseData ? courseData.thumbnail : null
            };
        });

        res.json({ success: true, certificates: result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error fetching certificates' });
    }
};

exports.generateCertificate = async (req, res, next) => {
    try {
        const { studentId, courseId } = req.body;

        const enrollment = await Enrollment.findOne({ where: { studentId, courseId } });

        if (!enrollment || enrollment.progressPercentage < 100) {
            return res.status(400).json({
                success: false,
                message: 'Cannot issue certificate. Course is not 100% complete.'
            });
        }

        const [certificate, created] = await Certificate.findOrCreate({
            where: { studentId, courseId },
            defaults: {
                issueDate: new Date(),
                issuedBy: req.user.name,
                certificateUrl: `https://example.com/certs/${studentId}-${courseId}.pdf`
            }
        });

        if (!created) {
            return res.status(400).json({ success: false, message: 'Certificate already issued for this course' });
        }

        res.status(201).json({ success: true, certificate });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error generating certificate' });
    }
};
