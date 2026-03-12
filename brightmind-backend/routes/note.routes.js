const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// GET note for a specific lesson
router.get('/:lessonId', protect, authorize('Student'), noteController.getNote);

// POST/PUT save note for a lesson (upsert)
router.post('/:lessonId', protect, authorize('Student'), noteController.saveNote);

// DELETE note for a lesson
router.delete('/:lessonId', protect, authorize('Student'), noteController.deleteNote);

module.exports = router;
