const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const guard = [protect, authorize('Admin', 'SuperAdmin')];

// Admin blog management routes
router.get('/', ...guard, blogController.getAllBlogs);
router.post('/', ...guard, blogController.createBlog);
router.put('/:id', ...guard, blogController.updateBlog);
router.delete('/:id', ...guard, blogController.deleteBlog);
router.patch('/:id/publish', ...guard, blogController.togglePublish);

module.exports = router;
