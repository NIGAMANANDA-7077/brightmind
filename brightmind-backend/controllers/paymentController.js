const Payment = require('../models/Payment');
const User = require('../models/User');
const Course = require('../models/Course');

// ─── Student: Create payment ───────────────────────────────
exports.createPayment = async (req, res) => {
    try {
        const { courseId, amount, paymentMethod, transactionId } = req.body;

        if (!courseId || !amount) {
            return res.status(400).json({ success: false, message: 'courseId and amount are required' });
        }

        const course = await Course.findByPk(courseId);
        if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

        const payment = await Payment.create({
            studentId: req.user.id,
            courseId,
            amount,
            paymentMethod: paymentMethod || 'manual',
            transactionId: transactionId || null,
            status: 'completed'
        });

        res.status(201).json({ success: true, data: payment });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── Student: Get my payments ──────────────────────────────
exports.getMyPayments = async (req, res) => {
    try {
        const payments = await Payment.findAll({
            where: { studentId: req.user.id },
            include: [
                { model: Course, as: 'course', attributes: ['id', 'title', 'thumbnail'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({ success: true, data: payments });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── Admin: Get all payments ───────────────────────────────
exports.getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.findAll({
            include: [
                { model: User, as: 'student', attributes: ['id', 'name', 'email', 'avatar'] },
                { model: Course, as: 'course', attributes: ['id', 'title'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        const totalRevenue = payments.filter(p => p.status === 'completed').reduce((acc, p) => acc + parseFloat(p.amount), 0);

        res.json({
            success: true,
            data: payments,
            stats: {
                total: payments.length,
                revenue: totalRevenue,
                completed: payments.filter(p => p.status === 'completed').length,
                pending: payments.filter(p => p.status === 'pending').length,
                failed: payments.filter(p => p.status === 'failed').length
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── Admin: Get payment by ID ──────────────────────────────
exports.getPaymentById = async (req, res) => {
    try {
        const payment = await Payment.findByPk(req.params.id, {
            include: [
                { model: User, as: 'student', attributes: ['id', 'name', 'email'] },
                { model: Course, as: 'course', attributes: ['id', 'title'] }
            ]
        });

        if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
        res.json({ success: true, data: payment });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── Admin: Update payment status ──────────────────────────
exports.updatePaymentStatus = async (req, res) => {
    try {
        const payment = await Payment.findByPk(req.params.id);
        if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

        await payment.update({ status: req.body.status });
        res.json({ success: true, data: payment });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
