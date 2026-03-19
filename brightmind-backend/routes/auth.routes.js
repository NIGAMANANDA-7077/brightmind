const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', authController.register);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', authController.login);

// @route   POST /api/auth/student-login
// @desc    Student login using Student ID + password
router.post('/student-login', authController.studentLogin);

// @route   GET /api/auth/me
// @desc    Get current logged in user
router.get('/me', protect, authController.getMe);

module.exports = router;
