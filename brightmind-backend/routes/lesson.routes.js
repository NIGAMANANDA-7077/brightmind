const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');

// POST a new lesson
router.post('/', lessonController.createLesson);

// GET lessons for a specific module
router.get('/:moduleId', lessonController.getLessonsByModule);

// PUT update a lesson
router.put('/:id', lessonController.updateLesson);

// DELETE a lesson
router.delete('/:id', lessonController.deleteLesson);

module.exports = router;
