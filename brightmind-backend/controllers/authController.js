const authService = require('../services/authService');

exports.register = async (req, res, next) => {
    try {
        const userPayload = await authService.registerUser(req.body);
        res.status(201).json({
            success: true,
            user: userPayload
        });
    } catch (error) {
        if (error.message === 'User already exists') {
            return res.status(400).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Server error during registration' });
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password, role } = req.body;
        const userPayload = await authService.loginUser(email, password, role);
        res.json({
            success: true,
            user: userPayload
        });
    } catch (error) {
        console.error('❌ Login error:', error);
        if (error.message === 'Account suspended') {
            return res.status(403).json({ success: false, message: 'Your account has been suspended. Please contact your administrator.' });
        }
        if (error.message === 'Role mismatch') {
            return res.status(401).json({ success: false, message: 'Invalid role selected for this account' });
        }
        if (error.message === 'Invalid email or password') {
            return res.status(401).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Server error during login', error: error.message });
    }
};

exports.studentLogin = async (req, res, next) => {
    try {
        const { studentId, password } = req.body;
        if (!studentId || !password)
            return res.status(400).json({ success: false, message: 'Student ID and password are required' });

        const userPayload = await authService.loginWithStudentId(
            studentId.trim().toUpperCase(),
            password
        );
        res.json({ success: true, user: userPayload });
    } catch (error) {
        if (error.message === 'Account suspended') {
            return res.status(403).json({ success: false, message: 'Your account has been suspended. Please contact your administrator.' });
        }
        if (error.message === 'Invalid student ID or password') {
            return res.status(401).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
};

exports.getMe = async (req, res, next) => {
    try {
        if (req.user) {
            res.json({
                success: true,
                user: req.user
            });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error fetching profile' });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

        const User = require('../models/User');
        const crypto = require('crypto');
        const { sendPasswordResetEmail } = require('../services/emailService');

        const user = await User.findOne({ where: { email } });

        // Always return success to prevent email enumeration
        if (!user) {
            return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
        }

        // Generate a secure token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        await user.update({ resetToken, resetTokenExpiry });

        await sendPasswordResetEmail({ name: user.name, email: user.email, resetToken });

        res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
    } catch (error) {
        console.error('❌ Forgot password error:', error);
        res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!token || !password) {
            return res.status(400).json({ success: false, message: 'Token and new password are required' });
        }
        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }

        const User = require('../models/User');
        const user = await User.findOne({ where: { resetToken: token } });

        if (!user || !user.resetTokenExpiry || new Date() > new Date(user.resetTokenExpiry)) {
            return res.status(400).json({ success: false, message: 'Reset link is invalid or has expired.' });
        }

        await user.update({ password, resetToken: null, resetTokenExpiry: null });

        res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
    } catch (error) {
        console.error('❌ Reset password error:', error);
        res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
};
