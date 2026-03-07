const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');

// GET all announcements
router.get('/', async (req, res) => {
    try {
        const announcements = await Announcement.findAll({ order: [['createdAt', 'DESC']] });
        res.json(announcements);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST new announcement
router.post('/', async (req, res) => {
    try {
        const announcement = await Announcement.create(req.body);

        // Create Notification
        const Notification = require('../models/Notification');

        // If audience is All, we might need multiple notifications or one with role=All
        // Based on my check, role is an ENUM('Admin', 'Teacher', 'Student', 'All')
        await Notification.create({
            title: 'New Announcement',
            message: announcement.title,
            type: 'info',
            role: announcement.audience === 'All' ? 'All' : announcement.audience
        });

        res.status(201).json(announcement);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE announcement
router.delete('/:id', async (req, res) => {
    try {
        const announcement = await Announcement.findByPk(req.params.id);
        if (!announcement) return res.status(404).json({ message: 'Not found' });
        await announcement.destroy();
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
