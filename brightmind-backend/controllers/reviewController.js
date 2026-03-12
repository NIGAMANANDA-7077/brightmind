const Review = require('../models/Review');
const User = require('../models/User');
const Course = require('../models/Course');
const sequelize = require('../config/db');

// ─── Student: Create/update review ─────────────────────────
exports.createReview = async (req, res) => {
    try {
        const { courseId, rating, comment } = req.body;

        if (!courseId || !rating) {
            return res.status(400).json({ success: false, message: 'courseId and rating are required' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
        }

        // Upsert: update if exists, create if not
        const [review, created] = await Review.findOrCreate({
            where: { courseId, studentId: req.user.id },
            defaults: { rating, comment }
        });

        if (!created) {
            await review.update({ rating, comment });
        }

        res.status(created ? 201 : 200).json({ success: true, data: review, created });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── Public: Get reviews for a course ──────────────────────
exports.getCourseReviews = async (req, res) => {
    try {
        const { courseId } = req.params;

        const reviews = await Review.findAll({
            where: { courseId },
            include: [
                { model: User, as: 'student', attributes: ['id', 'name', 'avatar'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        // Calculate average rating
        const totalRatings = reviews.length;
        const avgRating = totalRatings > 0
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(1)
            : 0;

        // Rating distribution
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviews.forEach(r => { distribution[r.rating]++; });

        res.json({
            success: true,
            data: reviews,
            stats: { averageRating: parseFloat(avgRating), totalRatings, distribution }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── Student: Delete own review ────────────────────────────
exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findByPk(req.params.id);
        if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

        // Only the student or admin can delete
        if (req.user.role !== 'Admin' && String(review.studentId) !== String(req.user.id)) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
        }

        await review.destroy();
        res.json({ success: true, message: 'Review deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── Admin: Get all reviews ────────────────────────────────
exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.findAll({
            include: [
                { model: User, as: 'student', attributes: ['id', 'name', 'email', 'avatar'] },
                { model: Course, as: 'course', attributes: ['id', 'title', 'thumbnail'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({ success: true, data: reviews });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
