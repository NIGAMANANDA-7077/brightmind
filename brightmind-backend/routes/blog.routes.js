const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const adminGuard = [protect, authorize('Admin', 'SuperAdmin')];

// --- Public routes ---
router.get('/', blogController.getPublicBlogs);
router.get('/:slug', blogController.getPublicBlogBySlug);

module.exports = router;
