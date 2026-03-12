const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const {
    createPayment,
    getMyPayments,
    getAllPayments,
    getPaymentById,
    updatePaymentStatus
} = require('../controllers/paymentController');

// Student routes (before :id)
router.get('/my', protect, authorize('Student'), getMyPayments);
router.post('/', protect, authorize('Student'), createPayment);

// Admin routes
router.get('/', protect, authorize('Admin'), getAllPayments);
router.get('/:id', protect, authorize('Admin'), getPaymentById);
router.put('/:id/status', protect, authorize('Admin'), updatePaymentStatus);

module.exports = router;
