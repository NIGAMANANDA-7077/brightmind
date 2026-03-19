const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', protect, lessonController.createLesson);
router.get('/:moduleId', protect, lessonController.getLessonsByModule);
router.put('/:id', protect, lessonController.updateLesson);
router.delete('/:id', protect, lessonController.deleteLesson);

module.exports = router;
