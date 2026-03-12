const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// GET all announcements (all authenticated users)
router.get('/', protect, announcementController.getAllAnnouncements);

// POST new announcement (Admin and Teacher only)
router.post('/', protect, authorize('Admin', 'Teacher'), announcementController.createAnnouncement);

// DELETE announcement (Admin and Teacher only)
router.delete('/:id', protect, authorize('Admin', 'Teacher'), announcementController.deleteAnnouncement);

module.exports = router;
