const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// Get all notifications (optionally filtered by role)
router.get('/', async (req, res) => {
    try {
        const { role } = req.query;
        let whereClause = {};
        if (role) {
            whereClause = { role: ['All', role] };
        }

        const notifications = await Notification.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']]
        });
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Create a new notification
router.post('/', async (req, res) => {
    try {
        const notification = await Notification.create(req.body);
        res.status(201).json(notification);
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// Mark notification as read
router.patch('/:id/read', async (req, res) => {
    try {
        await Notification.update({ read: true }, { where: { id: req.params.id } });
        res.json({ success: true, message: 'Notification marked as read' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Delete a notification
router.delete('/:id', async (req, res) => {
    try {
        await Notification.destroy({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Notification deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
