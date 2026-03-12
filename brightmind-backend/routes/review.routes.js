const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const {
    createReview,
    getCourseReviews,
    deleteReview,
    getAllReviews
} = require('../controllers/reviewController');

// Admin: Get all reviews
router.get('/all', protect, authorize('Admin'), getAllReviews);

// Public: Get reviews for a course (with avg rating)
router.get('/course/:courseId', getCourseReviews);

// Student: Create/update review
router.post('/', protect, authorize('Student'), createReview);

// Student/Admin: Delete review
router.delete('/:id', protect, deleteReview);

module.exports = router;
