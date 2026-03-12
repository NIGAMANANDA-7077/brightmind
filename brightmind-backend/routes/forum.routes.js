const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forumController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, forumController.getAllThreads);
router.get('/:id', protect, forumController.getThreadById);
router.post('/', protect, forumController.createThread);
router.post('/:id/comments', protect, forumController.createComment);
router.post('/:id/upvote', protect, forumController.upvoteThread);
router.patch('/:id/status', protect, forumController.updateThreadStatus);
router.post('/:id/comments/:commentId/accept', protect, forumController.acceptAnswer);

module.exports = router;
