const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// @route   GET /api/certificates/my-certificates
// @desc    Get certificates for logged in student
router.get('/my-certificates', protect, authorize('Student'), certificateController.getMyCertificates);

// @route   POST /api/certificates/generate
// @desc    Admin manually generates a certificate
router.post('/generate', protect, authorize('Admin'), certificateController.generateCertificate);

module.exports = router;
