const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middlewares/authMiddleware');

// GET notifications for the logged-in user
// For Admin: also includes role-broadcast notifications (userId = null, role = 'Admin')
// e.g. support message alerts from students
router.get('/', protect, async (req, res) => {
    try {
        const { Op } = require('sequelize');
        const user = req.user;

        let whereClause;
        if (user.role === 'Admin') {
            // Admins see their own notifications + any broadcast-to-Admin notifications
            whereClause = {
                [Op.or]: [
                    { userId: user.id },
                    { userId: null, role: 'Admin' }
                ]
            };
        } else {
            whereClause = { userId: user.id };
        }

        const notifications = await Notification.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']],
            limit: 50
        });

        res.json(notifications);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Create a notification (internal use / admin)
router.post('/', protect, async (req, res) => {
    try {
        const notification = await Notification.create(req.body);
        res.status(201).json(notification);
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// Mark ALL unread notifications as read for logged-in user
router.patch('/read-all', protect, async (req, res) => {
    try {
        await Notification.update(
            { read: true },
            { where: { userId: req.user.id, read: false } }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Mark single notification as read
router.patch('/:id/read', protect, async (req, res) => {
    try {
        await Notification.update({ read: true }, { where: { id: req.params.id } });
        res.json({ success: true, message: 'Notification marked as read' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Mark notification as read by referenceId (e.g. announcement.id)
router.patch('/by-reference/:referenceId/read', protect, async (req, res) => {
    try {
        await Notification.update(
            { read: true },
            { where: { userId: req.user.id, referenceId: req.params.referenceId } }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Delete a notification
router.delete('/:id', protect, async (req, res) => {
    try {
        await Notification.destroy({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Notification deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
