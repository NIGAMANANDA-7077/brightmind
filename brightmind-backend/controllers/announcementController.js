const Announcement = require('../models/Announcement');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Batch = require('../models/Batch');

exports.getAllAnnouncements = async (req, res, next) => {
    try {
        const { batchId } = req.query;
        let where = {};
        
        if (req.user && req.user.role === 'Student') {
            const student = await User.findByPk(req.user.id);
            if (!student.batchId) {
                // Return only global student announcements
                where.audience = ['All', 'Student'];
                where.batchId = null;
            } else {
                // Return global announcements OR batch-specific ones
                // using Sequelize Op.or
                const { Op } = require('sequelize');
                where = {
                    [Op.or]: [
                        { batchId: student.batchId },
                        { batchId: null, audience: ['All', 'Student'] }
                    ]
                };
            }
        } else if (req.user && req.user.role === 'Teacher') {
            if (batchId) {
                where.batchId = batchId;
            } else {
                // Teacher gets global announcements + their own batch announcements
                const batches = await Batch.findAll({ where: { teacherId: req.user.id }, attributes: ['id'] });
                const batchIds = batches.map(b => b.id);
                
                const { Op } = require('sequelize');
                where = {
                    [Op.or]: [
                        { batchId: batchIds },
                        { batchId: null, audience: ['All', 'Teacher'] }
                    ]
                };
            }
        } else {
            // Admin
            if (batchId) where.batchId = batchId;
        }

        const announcements = await Announcement.findAll({
            where,
            include: [{ model: Batch, as: 'batch', attributes: ['id', 'batchName'] }],
            order: [['createdAt', 'DESC']]
        });
        
        res.json(announcements);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createAnnouncement = async (req, res, next) => {
    try {
        const { title, audience, batchId } = req.body;
        
        let announcementData = { ...req.body };
        
        // If teacher is creating, enforce batchId
        if (req.user && req.user.role === 'Teacher') {
            if (!batchId) {
                return res.status(400).json({ message: 'Teachers must specify a batch for an announcement' });
            }
            announcementData.audience = 'Student'; // Teacher announcements are for students
        }

        const announcement = await Announcement.create(announcementData);

        // Create Notification
        let notifRole = announcement.audience === 'All' ? 'All' : announcement.audience;
        if (req.user && req.user.role === 'Teacher') {
            notifRole = 'Student';
        }
        
        await Notification.create({
            title: 'New Announcement',
            message: announcement.title,
            type: 'announcement',
            role: notifRole,
            batchId: announcement.batchId || null,
            referenceId: announcement.id
        });

        const newAnnouncement = await Announcement.findByPk(announcement.id, {
            include: [{ model: Batch, as: 'batch', attributes: ['id', 'batchName'] }]
        });

        res.status(201).json(newAnnouncement);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteAnnouncement = async (req, res, next) => {
    try {
        const announcement = await Announcement.findByPk(req.params.id);
        if (!announcement) return res.status(404).json({ message: 'Not found' });
        
        // TODO: Ensure teacher can only delete their own announcements
        
        await announcement.destroy();
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
